---
title: "可选自动改进循环调研"
description: "一个 Hermes Agent 自我改进循环的 ai-memory 等价物，值得作为默认可用、评审门控的暂存路径发布。当前 wiki 已经捕获有用的持久知识。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/auto-improvement-loop.md"
---

# 可选自动改进循环调研

> 状态：调研加已实现的生产笔记。配置了 LLM 提供方时，服务器为每个项目新完成的会话排期自动改进。手动 CLI/admin/MCP 自动改进仍可用于定向运行与补跑。两条路径都把验证过的提案记入待写入审计轨迹，默认经正常 wiki 写入路径自动批准。管理员可设 `[auto_improve] require_approval = true` 转人工评审。

## 执行摘要

一个 Hermes Agent 自我改进循环的 ai-memory 等价物，值得作为默认可用、评审门控的暂存路径发布。当前 wiki 已经捕获有用的持久知识：决策、坑点、概念、规则、笔记与会话摘要。缺的那块不是更多捕获。而是一个谨慎的评审者——能识别持久教训、并经既有评审/审计路径应用小 wiki 补丁，既不改写活跃的智能体上下文、也不把弱会话残渣悄悄晋升成规则。

安全的产品形状是：

1. 保持自动观察捕获与会话整编原样。
2. 加一个后台评审环节，在配置 LLM 提供方时为新完成的会话创建待处理 wiki 编辑。
3. 记录提案并默认经批准/审计路径应用，人工批准作为管理员的可选择项。
4. 保持单独的慢速维护环节，做去重、过期页评审与生命周期清理。

不要直接照抄 Hermes 的智能体本地技能系统。ai-memory 的持久单元是项目 wiki 页面，不是 `SKILL.md` 包。类似的目标是 `gotchas/`、`decisions/`、`concepts/`、`procedures/`、`_rules/`、小的 `_slots/` 状态页、以及 `_pending/` 下的待评审页。随路由安装的托管 ai-memory 智能体技能是一个窄的提示词包装例外：教智能体何时调 MCP 工具的静态文件，不是持久记忆页面或自动改进产物。

## Hermes 发现

Hermes 有两个独立的学习循环。

### 回合后评审

即时循环在节奏计数器触发时、于一个成功回合之后运行。记忆评审基于用户回合。技能评审基于工具调用迭代。观察到的默认是 10 个用户回合做记忆评审、10 次工具迭代做技能评审。

重要的实现性质：

| 性质 | Hermes 行为 | 给 ai-memory 的教训 |
|---|---|---|
| 活跃上下文 | 评审在响应投递之后运行。 | 绝不与用户的活跃任务竞争。 |
| 提示词变更 | 会话中途的写入更新磁盘但不改缓存的活跃提示词。 | 后台学习绝不能改写当前智能体上下文。 |
| 运行时继承 | fork 继承提供方、模型、认证、缓存的系统提示词、会话 id 与工具集配置。 | 孵化辅助评审工作时避免模型/缓存漂移。 |
| 工具限制 | fork 保留父工具 schema 以保前缀缓存一致，然后运行时强制记忆与技能工具的白名单。 | 安全应在派发/写入时机械化强制，而不只靠提示词文本。 |
| 外部记忆插件 | fork 以 `skip_memory=True` 创建，所以它不预取/同步外部提供方。 | 别让评审框架污染独立的记忆系统。 |
| 危险批准 | 后台评审安装自动拒绝的批准回调。 | 守护进程评审绝不能阻塞在交互提示上。 |
| 压缩 | 评审压缩被禁用。 | 评审不应与父会话的生命周期赛跑。 |
| 可见性 | 成功的评审动作作为自我改进评审输出摘要给用户。 | 自主记忆变更需要显式出处。 |

回合后提示词对捕获可复用流程、用户纠正与非平凡技巧刻意激进。它们也含负面过滤器：不编码瞬态设置失败、「某工具坏了」的负面论断、一次性任务叙事、或会话结束前已解决的失败。

### 写入批准

Hermes 对持久记忆与技能有可选的写入批准门。默认关，保持既有行为。启用时：

| 情形 | 行为 |
|---|---|
| 前台记忆、交互 CLI | 可能时内联提示。 |
| 前台记忆、无提示通道 | 暂存到待处理存储。 |
| 后台记忆 | 暂存到待处理存储。 |
| Hermes 技能写入 | 总是暂存，因为技能文件可能很大。 |
| 用户拒绝内联记忆写入 | 阻塞，不暂存。 |
| 提示机器故障 | 暂存而不是静默丢弃写入。 |

校验在暂存之前跑，所以无效写入立即被拒，而不是排进批准再在后面失败。

这与 ai-memory 强烈对应。wiki 编辑比起小记忆条目更接近 Hermes 技能：它们可能大、持久、塑造项目。暂存应是自主 ai-memory 学习写入的默认。

### Curator

Hermes 较慢的 curator 是面向智能体创建技能的维护循环。它由闲置而非 cron 守护进程触发。代码与文档中观察到的默认：

| 设置 | 默认 |
|---|---:|
| `interval_hours` | 168 小时，7 天 |
| `min_idle_hours` | 2 小时 |
| `stale_after_days` | 30 天 |
| `archive_after_days` | 90 天 |

首次运行行为刻意保守。全新安装种下 `last_run_at` 并把第一次真实遍历推迟整整一个间隔。用户可以先跑手动报告。

重要的 curator 性质：

| 性质 | Hermes 行为 | 给 ai-memory 的教训 |
|---|---|---|
| 托管范围 | 主要是智能体创建的技能，跟踪在 `.usage.json`。 | 把用户撰写的页面与自主页面分开。 |
| 破坏性上限 | 归档是最大的自动破坏性动作。无自动删除。 | 偏好取代或软删除。 |
| 置顶对象 | 置顶技能绕过自动转换。 | 置顶页面与 invariant 槽位必须受保护。 |
| 报告 | 写机器可读的 `run.json` 与人类的 `REPORT.md`。 | 每次维护运行都应留下审计工件。 |
| 备份 | 变更运行前拍快照并支持回滚。 | wiki git 提交有帮助，但批准报告仍应显式。 |
| 报告模式 | 产出仅报告输出。 | 非破坏性报告应是维护的一等公民。 |
| 合并 | 把窄技能并进带结构化摘要的伞形技能。 | ai-memory 应把重复/窄页的合并与新教训捕获分开做。 |

## 实测 ai-memory wiki 发现

2026-06-15 抽样了部署的家庭实验室 wiki。抽样时它含 1 个 workspace、38 个项目、204 个最新页面。

按路径前缀的页面分布：

| 前缀 | 数量 | 评估 |
|---|---:|---|
| `sessions/` | 57 | 有用的情节历史，但也是主要噪音源。 |
| `gotchas/` | 40 | 高信号；具体的失败模式与修复。 |
| `decisions/` | 37 | 高信号；持久的理由。 |
| `concepts/` | 36 | 高信号；架构与领域知识。 |
| `notes/` | 17 | 混合；含有用事实与冒烟标记。 |
| `_rules/` | 8 | 简洁且最新时高信号。 |
| `bootstrap.md` | 7 | 有用的种子摘要。 |
| `_slots/` | 2 | 对当前状态有用，但过期风险真实存在。 |

代表性高信号页面：

| 页面 | 为什么有用 |
|---|---|
| `ai-memory/gotchas/cli-is-always-http-client.md` | 捕获持久的架构规则、其存在理由、例外与先前技术失败模式。 |
| `ai-memory/concepts/karpathy-wiki-pattern.md` | 解释产品背后的概念模型。 |
| `.config/notes/marvin-server-nfs-drop-rootcause.md` | 具体根因与修复，细节足以防止重新发现。 |
| `nes-to-sms/gotchas/vram-budget.md` | 未来工作都会在意的领域专属约束。 |
| `akitaonrails-hugo/decisions/blog-content-sourcing.md` | 带理由与实现指引的短决策。 |
| `llm-coding-benchmark/gotchas/hallucinated-apis.md` | 详细、经核实的坑点，带示例与更正。 |

代表性低信号页面：

| 页面 | 为什么不该晋升 |
|---|---|
| `.config/sessions/0b9f6071-...md` | 三秒无活动会话。 |
| `.config/sessions/1f8ffad8-...md` | 单条 `echo claude-bash-ok` 测试，无捕获输出。 |
| `.config/sessions/cf81e9c3-...md` | 重复的 bash 冒烟尝试；仅作诊断历史有用。 |
| `.config/sessions/914f9f80-...md` | 用户提示词只有 `config`；无实质工作。 |
| `sabadell/sessions/8feda9e6-...md` | 单观察的启发式会话结束页。 |
| `ai-memory/notes/livetest-v011-release.md` | 合法的发布冒烟标记，但不是通用教训。 |

当前系统已经在创建正确的持久页面家族。所以自动改进的机会是选择性晋升与清理，不是新的记忆基底。

## 建议

把自动改进构建为默认可用的计划性评审路径，在写目标 wiki 页面之前记录提案出处。手动 CLI/admin/MCP 运行用同一条管线做定向评审或历史补跑。调度与批准分离：调度器决定何时评审新完成的会话，批准策略决定验证过的提案是立即应用还是留待人审。

发布的功能是一个审计先行的学习评审者：

1. 配置了 LLM 提供方且 `[auto_improve.scheduler] enabled = true` 时启用计划自动改进。手动运行不影响调度器。
2. 读已存观察/会话页、最近页面与相关的既有 wiki 页面。捕获排除在存储上游：被排除的内容无法被 `include_raw_fallback` 找回，因为它从未被存储。
3. 产出含小页面创建或更新的结构化提案。
4. 把提案存进带证据与 diff 的待评审队列。
5. 经 `Wiki::apply_batch`、准入 webhook、认证能力、审计日志与单写入器 actor 应用批准的提案。

自动批准是默认，但它仍记录暂存的提案并经同一条批准路径应用。想要人工队列的管理员设 `[auto_improve] require_approval = true`；不想要自动评审的管理员设 `[auto_improve.scheduler] enabled = false`。

高影响目标还可以由操作者提供的可执行 eval 门守卫。`[auto_improve.eval]` 默认禁用；启用时，路径匹配配置前缀（默认 `_rules` 与 `procedures`）的提案在 LLM 评审验证之后、暂存或自动批准之前发给配置的命令。命令从 stdin 收含提案元数据加前后正文的 JSON，必须返回如 `{ "score_before": 0.72, "score_after": 0.76, "passed": true }` 的 JSON。命令错误、超时、无效 JSON、`passed = false`、缺 `passed`、或分数增量低于 `min_delta` 只拒绝那条被门控的提案。非门控提案绕过该门。全部提案过不了 eval 时，该运行仍以零提案加被拒候选暂存，让拒绝缓冲记住这次失败尝试。钩子绝不运行 eval 命令。完整 stdin/stdout 契约与示例评分器脚本见[自动改进评审门（Eval Gates）](/auto-improve-eval-gates/)。

## 提议的页面目标

| 目标 | 用于 | 说明 |
|---|---|---|
| `gotchas/<topic>.md` | 可复现的坑、根因、工具怪癖、带持久修复的失败尝试。 | 要求证据与更正或缓解。 |
| `decisions/<topic>.md` | 改变了架构、工作流、依赖、部署或策略的选择。 | 含决策、理由、后果。 |
| `concepts/<topic>.md` | 稳定的领域或项目架构知识。 | 偏好综合而非任务编年。 |
| `procedures/<topic>.md` | 可复用工作流、操作规程、重复的多步模式。 | 价值在顺序而非仅根因或理由时用。 |
| `_rules/<topic>.md` | 给未来智能体的显式 always/never 指令。 | 还应触发既有 lint 提示去更新 `AGENTS.md` 或 `CLAUDE.md`。 |
| `_slots/current-focus.md` | 可变的短期项目状态。 | 当作状态而非持久真相；覆写而非追加。 |
| `notes/<topic>.md` | 不属于上述的有用事实。 | 避免把 notes 当垃圾场。 |
| `_pending/auto-improve/<id>.md` | 供人评审的暂存提案与 diff。 | 这是提案存储，不是已批准的持久知识。 |

不要从自动改进循环创建新的会话页面。会话页面已经来自会话结束整编。

## 负面过滤器

评审提示词应显式拒绝把这些当作持久学习：

| 过滤器 | 为什么 |
|---|---|
| 无活动会话 | 增加检索噪音。 |
| 单命令冒烟测试 | 多半是运维证据，不是可复用知识。 |
| 发布标记 | 需要的话留作 notes，但别晋升成 rules/gotchas。 |
| 瞬态缺失的二进制、凭据或设置状态 | 会变成过期的假约束。 |
| 宽泛的工具负面论断 | `tool X is broken` 在工具修好后硬化成未来的拒绝。 |
| 一次性任务叙事 | 会话页面已保留编年。 |
| 已解决的瞬态失败 | 捕获重试或修复模式，不是临时失败。 |
| 仅用户可见状态 | 用交接或 `_slots/current-focus.md`，不是持久语义页面。 |

## 安全不变量

任何实现都应保持这些不变量：

1. 计划与手动 CLI/admin/MCP 运行都记录提案并默认自动批准。
2. 调度与批准保持分离：禁用调度器不需要人工批准，要求批准不停止调度。
3. 自动 SessionEnd 触发默认关闭。
4. 绝不改写活跃会话提示词或已前置的交接上下文。
5. 绝不在钩子延迟之内运行。钩子保持即发即忘且有界。
6. 绝不绕过 workspace/project 隔离。每条读与写路径都用 `ScopeResolver` 或其显式辅助函数。
7. 绝不绕过认证。所有 admin 与写面用 `AuthLevel::authorize(Capability::...)`。
8. 绝不从处理器或后台 worker 直接写 wiki 文件。用 `Wiki::write_page`、`Wiki::apply_batch` 或既有破坏性辅助函数。
9. 绝不自动删除语义页面。用取代、待处理提案或情节页既有的留存清扫。
10. 绝不重写置顶页面或 invariant 槽位——除非提案引用直接矛盾并被显式批准。
11. 每条提议的编辑都附源证据。
12. 自主提案归因到独立的 `auto_improve` 行为者，让审计日志、准入 webhook 与评审屏能把机器建议的变更与用户/root 写入区分开。
13. 限定模型成本、输入大小、输出大小与每次运行的提议页面变更数。
14. 每次运行写一行机器可读审计记录；有提案时写人类可读的提案 sidecar。

捕获策略是客户端的存储边界，不是评审者做的过滤。评审者只能消费已存储的内容；见[捕获排除](/marker-file/#捕获排除capture-exclusions)。

## 既有用户升级契约

默认可用的自动改进不得惊到既有安装：

1. 既有项目 wiki 目录无需迁移。旧配置可能仍含 `[auto_improve] mode = ...` 键；当前 ai-memory 忽略该遗留键。操作者方便时删掉即可。
2. 会话结束触发保持关闭；有界的后台调度器在钩子延迟之外运行，并在每个不重叠的全项目节拍之后睡其配置的间隔。
3. 调度器初始化逐 workspace/项目的首跑水位线，并在计划 LLM 工作之前记录逐会话认领。历史会话升级时不被自动评审，失败的计划评审不会永远重试。手动 auto-improve 仍是旧会话或失败计划会话的补跑路径。
4. 待处理提案存储必须用增量的、幂等的迁移，保留全部既有 wiki 文件与会话/观察行。
5. 既有安装的 `CLAUDE.md`/`AGENTS.md` 块保持有效。操作者经 `ai-memory install-instructions` 或让智能体刷新 ai-memory 路由包来获取更新的主动检索指引。基于标记的替换必须保持幂等，托管智能体技能文件应与轻量片段从同一二进制自有资产刷新。
6. 目标页面变更必须先经提案暂存，并保持批准归因独立于自主的 `auto_improve` 提案行为者。

## 配置草图

确切名字可变，但形状应显式且保守：

```toml
[auto_improve]
require_approval = false      # true 让提案挂起等人工评审
min_observations = 8
min_session_duration_secs = 120
min_confidence = 0.75
max_input_tokens = 24000
max_proposals_per_run = 5
max_patchable_pages = 8
max_patchable_body_chars = 8000
max_edits_per_proposal = 5
max_edit_content_chars = 4000
max_changed_chars_per_proposal = 12000
max_patch_edits_per_run = 8
max_rejection_context = 50
rejection_context_days = 180
max_final_body_chars = 32000
max_rule_page_tokens = 2000
max_procedure_page_tokens = 2000
include_raw_fallback = false
proposal_actor = "auto_improve"
pending_path = "_pending/auto-improve"

[auto_improve.scheduler]
enabled = true                # false 仅禁用后台评审
interval_secs = 3600          # 0 仅禁用后台评审
max_sessions_per_tick = 1       # 每项目；节拍顺序处理项目
min_session_age_secs = 600
```

`[auto_improve.scheduler]` 控制服务器是否及多频繁启动后台评审。`[auto_improve] require_approval` 控制验证过的提案是自动应用还是留待处理。它们刻意互不隐含。

`max_rejection_context` 与 `rejection_context_days` 限界未来评审者提示词里包含的持久拒绝缓冲摘要。该缓冲按 `workspace_id` + `project_id` 划界，存人工拒绝、批准冲突/失败、以及带 reason 的校验器/模型拒绝候选。

## 提案格式

LLM 输出应是结构化 JSON，暂存任何东西之前先验证：

```json
{
  "summary": "short human summary",
  "proposals": [
    {
      "operation": "create_or_update",
      "path": "gotchas/example.md",
      "title": "Example gotcha",
      "kind": "gotcha",
      "confidence": 0.82,
      "rationale": "why this is durable",
      "evidence": [
        {"page": "sessions/abc.md", "quote": "bounded quote"}
      ],
      "body_markdown": "# Example gotcha\n\n..."
    }
  ],
  "rejected_candidates": [
    {
      "reason": "single-command smoke test",
      "evidence": "sessions/xyz.md"
    }
  ]
}
```

校验应拒绝缺证据、错误路径前缀、超大正文、尝试变更受保护页面、不支持的操作、或置信度低于配置阈值的提案。

## 待评审 UX

第一个生产 UX 是显式且审计门控的。调度器与 CLI/admin/MCP 手动运行记录验证过的待处理提案，然后默认经 wiki 变更路径自动批准。设 `require_approval = true` 时，`pending-writes` 之后应用或拒绝它们。

| 命令或路由 | 用途 |
|---|---|
| 后台调度器 | 首跑水位线之后评审新完成的会话，并按批准策略应用或暂存验证过的提案。 |
| `ai-memory auto-improve --session-id <id>` | 手动评审一个会话并经自动改进批准路径应用或暂存验证过的提案。 |
| `ai-memory auto-improve-report --workspace <w> --project <p> [--days N] [--limit N] [--stage]` | 默认只读的近期自动改进运行遥测报告——提案结果、终态率与发现。`--stage` 为审计/批准创建恰好一页待处理遥测报告。 |
| `memory_auto_improve` | 手动评审尚无已持久化自动改进运行的最新完成会话，或显式重跑具名会话，并经同一路径应用或暂存验证过的提案。空运行记录一次预检跳过，让下一次隐式调用推进。 |
| `ai-memory curator` | 基于规则的仅报告维护评审。 |
| `ai-memory curator --stage` | 暂存恰好一页 curator 报告供待写入批准。 |
| `ai-memory pending-writes list` | 展示暂存的 wiki 变更。 |
| `ai-memory pending-writes diff <id>` | 展示 markdown diff。 |
| `ai-memory pending-writes approve <id>` | 经正常 wiki 变更路径应用。 |
| `ai-memory pending-writes reject <id>` | 带审计轨迹丢弃提案。 |

待处理提案应以 markdown 形式放在 `_pending/auto-improve/` 下可见，让人在 wiki/Obsidian 工作流里评审。SQLite 仍可持提案状态、批准状态、证据元数据与审计行，但评审工件本身应像 wiki 其余部分一样可检视、可版本化。

区分操作者的部署上，手动暂存的提案记录限定操作者身份，并强制每个目标*每操作者*至多一条待处理提案。未归因的调度器、curator 与遥测提案留在共享桶。冲突只跳过那条提案、保留其兄弟、并在命令或 API 响应里带目标与理由出现；它绝不能变成静默的部分运行。

因为这现在是一个 MCP 工具面，标准提示词片段、托管智能体技能与回归测试都断言 `memory_auto_improve` 出现在组合的提示词路由面里。既有安装的 `CLAUDE.md`/`AGENTS.md` 片段在操作者运行 `ai-memory install-instructions` 或让智能体刷新 ai-memory 路由包时幂等更新。

### 既有安装的升级说明

既有项目 wiki 目录无需迁移。待处理提案存储是一次服务器侧数据库迁移加 sidecar 目录。

旧的服务器配置可能含现已忽略的 `[auto_improve] mode = ...` 键。无需数据迁移；方便时删掉遗留行避免困惑。

## 维护循环形状

把 curator 类比与会话后学习评审者分开。

维护循环应处理：

1. 重复或近重复标题。
2. 该并进更宽概念/坑点的窄页面。
3. 过期的 `_slots/current-focus.md` 状态。
4. 留存公式标记为冷的情节页。
5. `memory_lint` 已浮出的断交叉引用与矛盾候选。

维护循环从仅报告开始。`ai-memory curator --stage` 在 `notes/curator-<date>.md` 下暂存一页正常报告；批准它只记录报告、不执行建议的维护动作。之后它可以暂存合并或取代提案。它不应自动删除语义页面。

## 实现阶段

### 阶段 1：Dry-Run 评审者

状态：已实现 CLI/admin/MCP 提案暂存加默认自动批准。

加一个库级评审者，消费一个已完成会话加既有 wiki 上下文，返回验证过的提案。运行时先存待处理提案行加 sidecar，然后除非配置了 `require_approval = true`，经 wiki 变更路径批准它们。

已实现的评审者为有大量历史的既有项目设计：存在时把整编过的 `sessions/<id>.md` 页面当主源，然后加一段有界的确定性裸观察样本——从起止上下文、用户提示词、高重要性事件、错误/修复/决策关键词与均匀间隔的检查点选取。校验拒绝缺证据、不支持的路径、低置信度、超大正文、重复的既有路径或标题，并在最终校验前给缺 H1 的提案前置其标题归一化。

测试：

1. 空/无活动会话不产出提案。
2. 单命令冒烟会话不产出提案。
3. 带持久根因的会话产出一条 gotcha 提案。
4. 带显式用户规则的会话产出一条 `_rules/` 提案。
5. 缺证据拒绝该提案。

### 阶段 2：待处理 wiki 写入

状态：已实现 CLI/admin 暂存、list/show/diff、approve 与 reject。

持久的待处理提案存储以非索引 sidecar 加 SQLite 行的形式住在 `_pending/auto-improve/` 下，带 list/diff/approve/reject 命令与审计行。批准经既有 wiki 变更边界应用，提案出处里保留 `auto_improve` 行为者。

测试：

1. 待处理提案挺过重启。
2. 批准原子地写文件与索引行。
3. 拒绝不写任何 wiki 文件。
4. 受保护页面的提案在暂存前被拒。
5. 跨 workspace 的部分作用域失败关闭。
6. 待处理提案 markdown 建在 `_pending/auto-improve/` 下，绝不索引为已批准的持久知识。
7. 批准/审计元数据分别保留 `auto_improve` 提案归因与批准行为者。

### 阶段 3：后台调度器

状态：已实现为服务器侧调度器，不是 SessionEnd 钩子触发。存在 LLM 提供方时调度器默认启用，每个不重叠节拍后睡眠，并在每个项目持久化的首跑水位线之后评审所有项目新完成的会话。它在调 LLM 之前记录逐会话认领，所以计划评审对每个已完成会话至多一次——除非管理员手动重跑 auto-improve。

测试：

1. 禁用的调度器配置什么都不做，手动运行照常工作。
2. 启用的调度器只评审水位线之后的会话。
3. 饱和或失败的评审保持正常会话结束行为完好，且不永远重试同一会话。
4. 运行行含模型/提供方、作用域、提案、拒绝、配置与调度器触发元数据。

### 阶段 4：维护 Curator

加一个单独的计划报告，用既有 lint、访问计数器、留存打分、链接与页面元数据提议合并/取代。

测试：

1. 首次运行在可能有变更行为之前推迟或仅报告。
2. 置顶页面与 invariant 槽位被跳过。
3. 语义页面绝不硬删除。
4. 提议的合并带证据地指明源与目标页面。

## 已解决的设计选择

1. 待处理提案应是 `_pending/` 下的一等 wiki 结构，SQLite 保留状态与审计元数据。
2. 程序性教训应有 `procedures/` 页面家族，而不是被迫塞进 `gotchas/` 或 `concepts/`。
3. 自主提案应归因到独立的 `auto_improve` 行为者，批准归因分开跟踪。
4. 最小置信度阈值应可配置，并在考虑任何未来无人值守触发之前用真实项目上已应用的提案校准。

## 当前结论

Hermes 验证了这个想法，也展示了边界为什么重要。有用的部分不是智能体能自己写记忆。有用的部分是一个有界、可观察、可评审的循环——把重复工作变成持久知识，同时保持活跃任务执行隔离。

对 ai-memory，当前正确的边界是计划评审加 `_pending/auto-improve/` 下的待处理提案存储。批准策略分离：默认自动批准让 wiki 持续向前编译，而 `require_approval = true` 给管理员一个人工队列而无需禁用学习循环。
