---
title: "自动改进 SkillOpt 路线图"
description: "这是借鉴 SkillOpt 最佳安全思想的进行中实施计划，同时不把 ai-memory 变成工作流管理器、基准框架或智能体编排平台。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/auto-improve-skillopt-roadmap.md"
---

# 自动改进 SkillOpt 路线图

这是借鉴 SkillOpt 最佳安全思想的进行中实施计划，同时不把 ai-memory 变成工作流管理器、基准框架或智能体编排平台。

## 边界

ai-memory 保持为记忆基底：

- 从生命周期钩子自动捕获；
- markdown wiki 作事实源；
- SQLite 作派生索引与审计存储；
- 经待写入走小而可审计的 wiki 提案；
- 可选的 LLM 评审在钩子延迟之外。

本路线图**不**加规格驱动工作流、强制任务打分、智能体重放引擎、技能路由器、代码图或基准注册表。

## 这项工作为什么重要

当前自动改进循环按结构验证提案：路径、类别、置信度、证据、大小、重复检查与批准策略。这有用但对 `_rules/` 与 `procedures/` 这类高影响页面不够——那里一个坏编辑能塑造未来智能体行为。最大的收益是让提议的变更更小、更易评审、被拒后更难重犯、并在项目自带评分命令时可选地可度量。

## 不变量

- 既有整页 `create_or_update` 提案必须继续能验证、暂存、diff、批准、拒绝与审计。
- 新行为必须是增量迁移/配置；既有安装保持相同默认。
- 目标 wiki 变更仍必须经 `Wiki::write_page`、`Wiki::apply_batch` 或既有批准辅助函数。
- 服务器/admin/MCP 路径必须保持 `ScopeResolver` 与 `AuthLevel::authorize(Capability::...)` 边界。
- 钩子必须保持即发即忘，且不得运行 LLM 评审、打补丁或评审门。
- 除非既有的 `memory_auto_improve` 与待写入面无法表达该工作流，不新增公共 MCP 工具面。

## 阶段 1——带最小预算的结构化补丁提案

把补丁提案作为向后兼容的扩展加进既有提案形状。整页正文永远继续支持，对新页面尤其如此。

`_rules/` 与 `procedures/` 的首选更新模式应变成小的结构化补丁——但仅当评审者有足够目标页上下文能命名稳定锚点时。整页提案仍不得覆盖既有语义/程序页面；补丁提案要求存在目标页。

```json
{
  "edit_mode": "patch",
  "edits": [
    {"op": "append", "anchor": "## Release process", "content": "..."},
    {"op": "replace_section", "anchor": "## Gotchas", "content": "..."}
  ]
}
```

初始支持的操作：

- `add_section`
- `append`
- `replace_section` 仅带节哈希/上下文校验

`delete_section` 推迟。日后若加，要么排除在自动批准之外，要么即便全局自动批准开启也强制人工批准。

补丁语义：

- 锚点用精确的 markdown 标题文本，含标记，如 `## Release process`。
- 锚点在归一化空白比较后必须唯一；重复锚点拒绝。
- 不支持 H1 的替换/删除。
- 节跨度从锚点标题起、到下一个同级或更高级标题之前止。子节包含在 `replace_section` 里。
- `append` 在锚定节末尾、下一个同级或更高级标题之前插入内容，保留空行边界。
- `add_section` 在锚定节跨度之后插入新的兄弟节。
- `replace_section` 要求编辑前的节哈希或精确上下文，节变了就拒绝。
- 最终物化的正文仍必须通过正常的 H1、路径、类别与大小校验。

阶段 1 最小预算上限：

- 每提案最大编辑数；
- 每次编辑最大内容字符数；
- 每提案最大变更字符数；
- 最终正文最大尺寸。

实现注记：

- 把补丁物化成最终 `body_markdown` 以兼容既有批准流，但把预期基础哈希传入暂存、当前目标哈希不同即拒绝，以此关闭物化到暂存的竞态。若更干净，物化也可以挪进同一个写入器事务。
- 存原始补丁 JSON 供审计/diff/调试。
- 经增量迁移存 `edit_mode`、原始 `patch_json`、预期基础哈希、物化基础哈希与最终正文元数据。既有行默认整页模式。
- 评审者提示词中包含有界的目标页正文或可打补丁的 `_rules/` 与 `procedures/` 页面的标题大纲。不为未提供锚点的页面请求补丁。
- 暂存时存目标页哈希，页面变了就拒绝批准。
- 用 markdown 标题锚点与上下文/哈希检查，不用行号补丁。

必需测试：

- 旧整页提案仍工作；
- 每个补丁操作正确物化；
- 无效/缺失锚点干净拒绝；
- 目标哈希冲突阻塞批准；
- 物化与暂存之间页面变更拒绝；
- 迁移后旧待处理提案仍可读可批；
- 重复锚点拒绝；
- 对缺失目标的补丁拒绝；
- 对既有非槽位页的整页提案仍拒绝；
- 破坏性操作日后加入时不能自动批准；
- `_rules/` 与 `procedures/` 的评审者指令偏好补丁模式。

## 阶段 2——有界的编辑预算

阶段 1 吸收了安全发布补丁提案所需的最小逐提案上限：可打补丁页面/上下文界限、每提案编辑数、编辑内容字符、每提案变更字符与全局最终正文字符。阶段 2 加上其余的运行级与页面类别预算。余弦衰减或成熟度调度推迟到有真实运营数据再议。

提议的配置形状：

```toml
[auto_improve]
max_proposals_per_run = 5
max_patch_edits_per_proposal = 4
max_patch_edits_per_run = 8
max_changed_chars_per_proposal = 4000
max_rule_page_tokens = 2000
max_procedure_page_tokens = 2000
```

校验拒绝超过运行级补丁编辑预算或程序/规则最终页预算的提案。阶段 1 的校验器继续强制逐提案编辑数、变更字符、编辑内容与全局最终正文限额。

必需测试：

- 逐运行的补丁编辑限额；
- `_rules/` / `procedures/` 页面预算强制；
- 除既有全局限额外的既有非补丁行为保持不变。

## 阶段 3——被拒提案缓冲

状态：已实现。

持久化有用的拒绝记忆，并把有界的摘要喂进未来评审者提示词，让模型不重复失败的编辑模式。

提议的表：

```text
auto_improve_rejections
- id
- workspace_id
- project_id
- target_path
- kind
- operation/edit_mode
- reason
- normalized_fingerprint
- summary
- evidence_json
- source_run_id
- source_proposal_id 可空
- created_at
```

来源：

- 校验器拒绝；
- 人工待写入拒绝；
- 批准冲突；
- 准入失败；
- 未来的评审门失败。

提示词上下文只应包含有界的近期子集，如每项目最新 50 条或 180 天。初期不加嵌入。

实现注记：

- `V24__auto_improve_rejections.sql` 加 `auto_improve_rejections`，带 workspace/project 配对强制加近期、指纹与路径索引。
- 人工拒绝、准入失败与批准冲突在同一个决策事务里写拒绝记录。
- 校验器/模型拒绝的候选在有 reason 时于运行暂存时持久化；拒绝携带该元数据时存目标路径/类别/操作/编辑模式。
- 评审者提示词包含按 `max_rejection_context` 与 `rejection_context_days` 限界的近期同作用域拒绝摘要。

必需测试：

- 人工拒绝创建可复用的拒绝记录；
- 元数据足够时校验器拒绝创建记录；
- 未来提示词包含相关的先前拒绝；
- workspace/project 隔离保持；
- 旧待处理提案仍可批/可拒。

## 阶段 4——可选的可执行评审门

状态：已实现。

只在项目显式提供评分命令时运行。禁用意味着当前验证 + 批准行为不变。

提议配置：

```toml
[auto_improve.eval]
enabled = false
command = "./scripts/score-auto-improve-proposal"
timeout_secs = 120
targets = ["_rules", "procedures"]
min_delta = 0.0
```

契约：

- ai-memory 不构建基准注册表、重放框架、评分 DSL 或智能体模拟器；
- 外部命令直接执行（不经 shell），stdin 收含提案元数据加前后正文的 JSON；
- 命令返回如 `{ "score_before": 0.72, "score_after": 0.76, "passed": true }` 的 JSON；
- 分数存在时，`score_after - score_before` 必须达到 `min_delta`；
- 失败、超时、出错或无效 JSON 的评估对被门控的提案失败关闭，并作为被拒候选记录，理由如 `eval_gate_failed`、`eval_gate_timeout` 或 `eval_gate_error`。

一次运行里每个提案都过不了 eval 时，ai-memory 以零提案加 eval 拒绝暂存该运行，让拒绝缓冲仍能从这次尝试学习。非门控提案在门开启时也绕过 eval。钩子路径保持即发即忘、绝不运行 eval 命令。

非目标：

- 无重放编排；
- 无基准/任务注册表；
- 无评分 DSL；
- 无智能体模拟器。

必需测试：

- eval 禁用保持当前行为；
- 通过 eval 允许暂存/批准；
- 失败 eval 拒绝并记录拒绝；
- 超时/错误对 eval 门控的提案失败关闭；
- eval 绝不在钩子路径上运行。

## 阶段 5——慢速/Meta 更新更晚

推迟到补丁提案、编辑预算、拒绝与可选 eval 产出足够数据之后再做。

第一版应仅报告。之后，一个受保护的 `_meta` 节可以经正常待处理提案更新，绝不由逐会话评审直接改。跨项目优化器记忆在有证据表明它帮助 ai-memory 用户之前明确出圈。

## 完成标准

本路线图在阶段 1-4 连同文档、迁移、测试与 changelog 条目实现完毕、且阶段 5 要么有仅报告的设计、要么有带证据要求的成文推迟时完成。
