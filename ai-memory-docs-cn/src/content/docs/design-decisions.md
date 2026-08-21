---
title: "ai-memory 设计决策（综合）"
description: "一个自包含的 Rust 二进制：作为编码智能体 CLI 的 MCP 服务器运行，自动捕获净化后的生命周期观察，维护 Karpathy 式 wiki。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/design-decisions.md"
---

# ai-memory 设计决策（综合）

> 从原始调研与 issue 报告蒸馏出的历史依据。当前的操作地图读[架构](/architecture/)；当前客户端支持看 [README 支持矩阵](/#支持矩阵)。调研文件是历史凭据。

## 1. 产品形态

一个自包含的 Rust 二进制：

1. 作为编码智能体 CLI（Claude Code、OpenAI Codex、Cursor、Gemini CLI、Antigravity CLI、OpenClaw、OpenCode、OMP 及支持 MCP 的客户端）的 **MCP 服务器**（stdio + HTTP/SSE）运行。
2. **自动**捕获净化后的、有界的生命周期观察——没有 `write_note` 仪式——经智能体 CLI 调用的钩子脚本或生成的扩展。用户提示词与压缩后摘要保留至多 16 KiB；通知与工具摘录保留至多 2 KB；每个净化后的持久体有 16 KiB 兜底。可选的 `ai-memory run` 工作流额外经宿主侧只读适配器读取可见的原生转录尾部。
3. 维护一个 **Karpathy 式 wiki**：增量编译的 markdown 页面，带交叉链接、取代（supersession）、`index.md` 与 `log.md`。
4. 经 MCP `tools/list` 向编码智能体提供检索：少数几个*窄*工具，不是 50 个。
5. 发布 **Docker 镜像**（`docker run -v ai-memory-data:/data -p 49374:49374 ai-memory`），可在桌面与家庭实验室之间移动。
6. *自愈*：启动时 schema 迁移、向量索引 dim/提供方检查、写前持久化、周期性完整性审计、单写入器队列避免 `database is locked`。

## 2. 硬性要求（从需求提示提取）

- Rust、干净架构、模块化、有单元测试。
- Cargo 格式干净。
- 可 Docker 部署、易备份、桌面↔家庭实验室易迁移。
- 面向编码智能体的 MCP 服务器。
- **自动**记忆捕获/取数——最少的手工工具调用。
- 按时间区分**短期**与**长期**记忆（类似 agentmemory）。
- 自愈的记忆管理。
- 帮助智能体 CLI 之间的交接（从 Claude Code 停下的地方在 Codex 里恢复）。
- 迭代式规划——每个功能在下一个开始前可用。没有死代码。

## 3. 存储模型——最大的架构决策

考察过三个选项：

| 选项 | 事实源 | DB 用来 | 优点 | 缺点 |
|---|---|---|---|---|
| **A. DB 为主** | SQLite | 一切 | 单事务边界、检索快、无文件系统竞态 | 对人类不透明；备份故事更难 |
| **B. markdown-in-git 为主** | 仓库中的文件 | 派生索引 | 可 diff、可 grep、可移植、忠于 Karpathy | 监视器正确性（basic-memory #580/#758/#798）、inode 竞态（#765）、启动成本 |
| **C. DB 为主加按需导出** | SQLite | 一切 | 两全其美 | 两种格式要保持一致；用户必须记得导出 |

**决策：选项 B——git 仓库里的 markdown 是事实源，SQLite 是派生索引。**

**为什么：**
- 备份/迁移故事平凡——`git clone` 或 `rsync` 一个目录。用户明确要求这一点。
- Karpathy 的模式*就是*磁盘上的 wiki。用导出步骤伪造它就失去了用 Obsidian 检视的属性。
- DB 可以从文件重建——损坏可恢复。
- 免费的跨工具兼容：任何读 `~/.ai-memory/wiki/*.md` 的智能体无需 MCP 集成就能工作。

**我们如何避免 basic-memory 的监视器之痛：**
- 监视器有心跳 + 对账环节（每 30s 全量 diff 兜住漏掉的事件）。
- 我们通过 MCP 服务器的 `wiki_write` 路径*独占*写入；监视器是外部编辑的*安全网*，不是主输入。
- 破坏性操作（`reset`、`purge`）前做 inode 锁建议 + psutil 式的活进程检查。basic-memory #765/#776 的教训。
- 显式处理隐藏目录路径（basic-memory #798）。

**我们如何避免「文件与 DB 漂移」的开销：**
- DB 每页存 `(path, mtime, size, sha256, indexed_at, provider, model, dim)`。启动时快扫对比缓存的 SHA；只有变化的文件重新解析。
- 嵌入以 `sha256(content) + provider + model + dim` 为键。内容变了才重新嵌入。

**一致性契约：** markdown 为主、SQLite 为派生。文件系统与 SQLite 之间没有真正的跨资源事务。wiki 写入必须走 `Wiki::write_page`、`Wiki::apply_batch` 或既有的破坏性辅助函数，让净化、准入、归因、回滚与存储更新待在一起。运行时存储失败把已安装的文件尽力回滚；崩溃窗口由既有的 markdown 重建索引路径收敛。处理器不得直接写 wiki 文件。

## 4. 数据库选择——单一 SQLite 文件

**决策：一个 SQLite 文件，含 FTS5、打包向量嵌入与图边的 SQL 表。**

为什么不是 Postgres/pgvector？Cognee 的 #2717 与 basic-memory 的 #830/#831 表明 Postgres 是「只有真实部署才暴露」的痛。v1 内嵌发布。

为什么不是 LanceDB/Qdrant/Kuzu/CozoDB/SurrealDB？

- LanceDB：cognee #2702/#2720（文件格式漂移、过滤器传播失败）。底层是 Pyarrow。
- Kuzu / Ladybug：cognee #2098/#2768（上游归档、fork 风险成真）。
- CozoDB：bus factor 小。
- SurrealDB：重、多模式存储；我们会继承一大堆用不上的面。
- SQLite 里的打包向量让 v1 依赖轻；暴力余弦不够用时 `sqlite-vec` 仍是扩容路径。

**图就是 SQL 表。** 一张 `wiki_pages` 表、一张 `wiki_links (from_id, to_id, link_type)` 表、可选的 `wiki_concepts (page_id, concept)`。图查询是 SQLite 里的递归 CTE。批量遍历用 Petgraph 内存图。避开 cognee 栽进去的整个「内嵌图数据库」雷区。

**crate 选型**（调研支撑的选择）：

- `rusqlite` 做内嵌 SQLite 访问。以后要加密用 `bundled-sqlcipher`。
- `refinery` 做 SQL 迁移。
- `tantivy` 初期*不*用——预期语料规模（每项目数百到低千页面）下 SQLite FTS5 足够。只有 FTS5 排序被证明不够时再重新考虑。
- `petgraph` 做整编期间的内存图算法。

## 5. 嵌入与 LLM

**嵌入：**
- 原型期提议默认本地 `ort` / `fastembed-rs` 模型。发布的 v1 姿态改为**默认关闭**，选择启用 OpenAI、Voyage、Google Gemini 或免密钥的 OpenAI 兼容嵌入。兼容路径要求显式 base URL、模型与维度，因为自托管引擎没有安全的公共默认值；且用独立的提供方身份防止向量族混用。本地 ONNX 嵌入留作未来工作；当前提供方与模型参考在[架构](/architecture/)里。
- 每个向量旁边持久化 `{provider, model, dim}`。不匹配时警告并忽略过期向量，直到 `ai-memory embed --force` 或计划内回填重新嵌入（agentmemory #469 教训，但不阻塞启动）。
- 未来任何本地模型缓存放 `<data_dir>/models/` 之下，绝不放 `/tmp`（basic-memory #741）。
- 发布的提供方实现共享 `Embedder` trait，经类型化配置选择。

**整编用的 LLM：**
- **默认关闭**，行为类似 #138 修复后的 agentmemory。没有提供方时系统照常工作：合成压缩（基于规则）、无 LLM 生成的摘要、无 `memory_consolidate` 页面重写。
- 有提供方时，LLM 整编在 PreCompact 时、经 `memory_consolidate` 按需、以及仅在 `AI_MEMORY_CONSOLIDATE_ON_SESSION_END=true`（默认关）时会话结束时运行。有实质内容的会话结束无论如何都写规则摘要页 + 交接；只含 `SessionStart` / `SessionEnd` 边界的会话不带任何工件或提供方工作即关闭，并释放绑定到该接收者的启动交接。SessionEnd 的提供方工作按观察代际持久化，由一个有界的重试 worker 在钩子请求之外消费，所以客户端排放取消不了它。自动交接与已完成结束的水位线在一个 SQLite 事务里提交；已结束的带键重放收敛剩余的 wiki 提交、提供方入队与摄取键完成。已完成结束还存储它覆盖的观察数；恢复的会话只在该计数前进后才重进结束路径，避免不收敛的墙钟比较。可选的 6 小时维护定时器。
- 提供方实现 `LlmProvider { complete(...); complete_structured(...) }`。当前提供方与认证矩阵在[架构](/architecture/)；这个设计边界也覆盖 Ollama、vLLM、LM Studio 等 OpenAI 兼容端点。
- **每个提供方原生 HTTP**——不做 LiteLLM 等价物。cognee 的 issue 跟踪（#2412/#2430/#2537/#2608/#2749/#2782/#2840/#2842）表明通用网关的静默 kwarg 丢弃是提供方 bug 的头号来源。每个提供方类型化 JSON、未知字段报错。手写但正确。
- **结构化输出用 JSON schema，不用 XML、不用 Instructor 式包装。** 可用时用各提供方原生 JSON 模式；对 Anthropic，请求带类型化 schema 的工具使用响应。用 `serde_json` + `schemars` 派生 schema 校验。

## 6. 捕获模型——自动，绝不 `write_note`

三个捕获面，按优先级：

1. **生命周期钩子/扩展。** 当前客户端列在 README 支持矩阵里。它们快、可靠、结构化。我们发布用户装一次的钩子脚本或生成的 TypeScript 集成。agentmemory 的教训：
  - 钩子必须**即发即忘**（#221）。没有 `await fetch()` 阻塞会话启动。
  - 写入侧亚秒级硬超时（`tokio::time::timeout`）。
  - 所有钩子 → 单一 HTTP/Unix socket POST → 服务器排队 → 立即返回 202，饱和时 429。
  - 隐私剥离在钩子边界做，不要拖到后面（agentmemory `stripPrivateData`）。

2. **托管工作流转录导入**（经 `ai-memory run` 选择启用）。每个受支持的适配器在托管启动后读取其关联的原生会话，把可移植的可见事件追加进共享台账。ai-memory 不发布监视私有外壳存储的通用后台监视器。

3. **手工 MCP 工具**（`memory_write_page`）——只用于用户显式的持久项目知识（「记住这个」）。例行会话捕获保持自动。

### 捕获策略边界（#194）

最近的 `.ai-memory.toml` 可以用 `[capture] ignore_paths` 在客户端暂存或传输之前排除已识别的文件工具事件。这是严格的、schema 专属的词法边界，不是通用的内容或 DLP 过滤器：私有模式与候选绝不离开客户端，但 shell/补丁文本、别名与不可按路径归因的体不在其范围内。权威语法、限额、受支持的集成与 `--check-capture` 手段见[标记文件参考](/marker-file/#捕获排除capture-exclusions)。它不增加 MCP 工具、不需要 DB 迁移；新客户端/旧服务器安全，旧客户端保持其原有捕获行为。

## 7. 记忆模型（时间维度）

采纳 agentmemory 的层级模型，**但**保持面窄：

| 层级 | 是什么 | 生命周期 | 衰减 |
|---|---|---|---|
| **工作** | 当前会话：最近 N 条观察、最近的用户提示词、当前文件 | 到会话结束 | 会话结束即丢弃（DB 留档供取证，但默认召回不含） |
| **情节** | 按会话的摘要，带概念标签、动过的文件、做过的决策 | 30 天热、180 天冷，冷分低于阈值则驱逐 | `salience · exp(-λ · age_days) + σ · log(1 + access_count) · exp(-μ · days_since_access)`。权威代码：[`crates/ai-memory-store/src/decay.rs`](https://github.com/akitaonrails/ai-memory/blob/main/crates/ai-memory-store/src/decay.rs)。 |
| **语义** | 蒸馏出的事实/偏好/架构笔记——即 wiki 页面本身 | 无限期、可被取代 | 就地版本化：旧的 `is_latest=false`，新的 `supersedes=old_id` |
| **程序** | 从情节簇提取的重复模式（频次 ≥ 2 的 `pattern` 类型） | 无限期 | N 天未再观察到则按频次衰减 |

**实现注记：** 四个层级映射到一张 `pages` 表加 `tier` 枚举列，加一张 `observations` 表做有界的工作/情节投影，不是四张独立表。让 schema 迁移保持清醒。

**检索权威度：** 层级也是相关度候选生成之后的一个有界信号。规范页面类别分类器、`pinned` 与一小套内建标签词汇（`canonical`、`active`、`source-of-truth`、`superseded`、`historical`、`test-fixture`、`do-not-answer-from`）在融合后乘数中与它一起参与。这刻意不是独立的检索器、也不是绝对覆盖：它裁决持久知识与情节证据之间的胶着对局，而不隐藏定向的会话/历史匹配。`pinned` 仍首先控制留存与自动变更；它单独的检索效应很小。

## 8. 整编（Karpathy 的部分）

三个计划性 MCP 操作：

- **`memory_ingest`**（钩子自动调用）：一条观察 → 写扇出到约 5–15 个 wiki 页面。无匹配则新页；页面已存在则取代 + 版本化。无 LLM 回退：未配置提供方时追加到按日摘要页。
- **`memory_query`**（智能体按需调用）：项目内 FTS + 词法实体 + 图检索，可选向量，RRF 融合后做有界权威度调整与可选 LLM 重排。agentmemory 早期的三流结果促成了这个融合形态。
- **`memory_lint`**（每小时 + 会话结束时计划运行）：扫描矛盾、孤儿页、断链、过期论断、低置信 + 零强化的条目。纯 LLM 严格 JSON 输出。

衰减/遗忘作为单独的 `memory_forget_sweep` 任务运行：应用留存公式；先移除 Markdown 源并经 `is_latest=false` + `superseded_at` 打墓碑，然后在配置的宽限期后硬删除墓碑的完整版本谱系。终身访问计数在驱逐前影响留存分数，但之后不阻塞清理。绝不静默销毁用户置顶的任何东西，绝不按路径删除更新的重建。

自动改进工作与正常会话整编保持分离。评审者笔记与分阶段设计在[自动改进循环调研](/auto-improvement-loop/)。短版：配置 LLM 提供方后，学习评审为每个项目新完成的会话排期，手动 CLI/admin/MCP 运行仍可用于补跑或定向重跑。调度与批准分离：`[auto_improve.scheduler]` 控制后台评审，而 `[auto_improve] require_approval = true` 让计划与手动提案挂着等人批准而不是自动应用。所有写入仍经共享的解析器/认证路径限定作用域，且不得在回合中途改写活跃的智能体上下文。

## 9. 跨智能体交接

一等公民的类型化协议，共享状态：

```rust
struct Handoff {
    from_agent: String,   // "claude-code", "codex"
    to_agent: Option<String>,
    project_id: ProjectId,
    cwd: PathBuf,
    summary: String,
    open_questions: Vec<String>,
    files_touched: Vec<PathBuf>,
    next_steps: Vec<String>,
    model: String,
    created_at: DateTime,
}
```

MCP 工具 `memory_handoff_begin`（写一条 `state=open` 的交接行）、`memory_handoff_accept`（确认、返回交接内容、标记 `accepted_by`）与 `memory_handoff_cancel`（把误建的确切开放交接 id 标记过期）。用户可以停掉 Claude Code、启动 Codex，Codex 的会话启动钩子取回该 cwd 的开放交接。区分操作者的服务器上，投递先按所有者限定：调用者看到自己的加刻意共享的行；`shared=true` 把手工交接发布给项目，而仅 root 的 `any_owner=true` 是 accept/cancel 的恢复逃生口。cwd 按路径边界匹配（先前技术的做法），不是精确相等：留在 `/repo` 的交接会投递给 `/repo/api` 里的会话，但绝不给 `/repo-other`。手工 `memory_handoff_begin` 的交接按 cwd 覆盖全项目，且优先于自动 SessionEnd 交接，让显式的「我们做到哪了」接力棒绝不被启发式的那根遮蔽。cwd 合格的自动交接中最新的获胜，cwd 特异性只在时间戳打平时破平，所以过期的子目录上下文不能遮蔽更新的父会话交接。创建一条自动交接会让同一确切 cwd 与所有者先前的开放自动交接过期。接受一条则原子地让该接收 cwd 合格、同所有者的较旧自动候选过期；手工、兄弟目录与其他所有者的交接保持开放。

交接是下一会话的转移，不是智能体间的实时消息。
Antigravity CLI 暴露的是 `PreInvocation` 而非 SessionStart，且它在每次模型调用前都触发；只有 `invocationNum = 0` 可以执行破坏性的交接取数。这让收尾期间创建的手工交接为下一会话保持开放，而不是喂回给同一执行循环。

agentmemory 有个非正式版本（`/handoff` 技能）；我们从第一天就把它做显式，因为每份调研报告都把跨智能体标为 v0.1 的弱点。

## 10. MCP 工具面——刻意收窄

basic-memory 约 25 个工具，agentmemory 53 个。两者都因此产生用户困惑。当前 v1 的面仍然刻意收窄：

| 工具 | 用途 | 标注 |
|---|---|---|
| `memory_query` | 检索 + 取回，FTS5 + 实体 + 图 + 可选向量 RRF | 只读 |
| `memory_recent` | 项目最近更新的 `is_latest=1` 页面 | 只读 |
| `memory_status` | 健康、计数、上次整编时间 | 只读 |
| `memory_briefing` | 结构化零 LLM 快照：7d/30d 窗口、待处理交接、最近页面、`_rules/` | 只读 |
| `memory_explore` | LLM 组织的 `memory_briefing` 散文摘要；无提供方时退化为 JSON | 只读 |
| `memory_handoff_begin` | 标记会话边界、写交接 | 破坏性 |
| `memory_handoff_accept` | 取回 + 确认最新的开放交接 | 破坏性 |
| `memory_handoff_cancel` | 把误建的确切开放交接标记过期 | 破坏性 |
| `memory_consolidate` | LLM 驱动的页面重写（`multi_page=true` 原子扇出）；目标项目的 `_prompts/consolidation.md` 提供有界的不受信任参考性偏好，`instructions` 一次性覆盖它 | 破坏性 |
| `memory_auto_improve` | 已完成会话的手动学习评审；服务器也为新会话排期评审，手动评审选择启用让提案保持待处理 | 写 |
| `memory_write_page` | 按用户显式请求写持久 wiki 知识 | 破坏性 |
| `memory_read_page` | 按确切路径或首个检索命中读整页正文 | 只读 |
| `memory_read_session_observations` | 在解析出的作用域里翻阅一个会话的原始钩子观察，体有界 | 只读 |
| `memory_delete_page` | 经准入钩子删除单页确切路径 | 破坏性 |
| `memory_feedback` | 记录有界的页面质量反馈；调整情节留存并标记过期/错误的当前版本供 lint 评审 | 写 |
| `memory_forget_sweep` | 留存清扫（M8）；冷分低于阈值时 wiki 背书的驱逐；`dry_run=true` 预览 | 破坏性 |
| `memory_lint` | 基于规则 + 可选 LLM 的矛盾发现 → `wiki/_lint/<date>.md` | 破坏性 |
| `memory_install_self_routing` | 返回规范的轻量 CLAUDE.md / AGENTS.md 路由块、托管智能体技能 payload、目标提示与覆盖指引 | 只读 |

工具参数别名保持窄：发布的别名覆盖 `query|q|search` 与 `limit|n|top_k`；project 与 cwd 参数用规范名，除非代码增加具体别名。

托管的 ai-memory 智能体技能只是这个工具路由指引的提示词包装。它们以普通 `SKILL.md` 文件安装，让智能体渐进加载详细指令，但 ai-memory 不在它们里面存持久记忆、也不含运行时技能路由器。

## 11. 身份与项目作用域（从第一天起的三元组）

basic-memory v0.20 创伤的教训：`(workspace, project, page_path)`。即使 v1 单 workspace 发布，schema 与每个 API/工具参数都编码完整三元组。不返工。

项目解析链：显式参数 → 服务器默认 → 基于 cwd 的启发（匹配仓库根）→ 报错。

**安装时 `project_strategy` 默认（#128）。** `basename(cwd)` 保持 v1 默认，但 `cd` 进子目录并待在那里的智能体外壳会静默把会话剩余部分分叉进以子目录命名的幽灵项目。带 `project_strategy = "repo-root"` 的 `.ai-memory.toml` 标记修复这一点（#16、#23、#111），但需要每个仓库（或其上）都有标记；#16 刻意否决了*用户*设置的运行时环境变量回退。`install-hooks --project-strategy repo-root` 改为在安装时把策略**固化**进生成的钩子命令（以及 OpenCode / OMP / OpenClaw 插件）——与已固化的 `AI_MEMORY_AUTH_TOKEN` / `AI_MEMORY_HOOK_URL` / `--data-dir` 同等地位，不是用户运行时覆盖。这是仅客户端/安装时的变更：服务器已解析 `project_strategy=repo-root`。标记自己的 `project_strategy` / `project` 仍然优先，默认保持 `basename`（不固化任何东西），所以既有安装字节不变。

## 12. 可运维性

- **单一二进制**，尽量静态链接。Distroless Docker 镜像。默认**绝对数据路径**（`dirs::data_local_dir().join("ai-memory")`）；启动时大声打出日志（agentmemory #303 教训）。
- **原子配置**：一次 `Config::load()` → 类型化结构体，每个读者拿 `&Config`。没有 `process.env` 双读路径（agentmemory #456/#469）。
- **写持久化**：接受的钩子工作等待 SQLite 写入并在那个后台任务结束前追加一行 `log.md`。索引与数据在同一事务提交；写确认后不跑游离的索引任务（basic-memory #763/#578/#839）。
- **迁移**：启动时跑 `sqlx::migrate!`；绝不内联 DDL（basic-memory #727）。
- **schema 版本化**：schema 单一事实源；派生客户端/文档。没有「更新 7 个文件」清单（agentmemory AGENTS.md 的坏味道）。
- **备份/迁移**：`ai-memory export <dir>` 导出 wiki/ + sqlite 快照。`ai-memory import <dir>` 消费。默认数据目录可移植。可选：`auto_git_commit = true` 配置标志 → 每次 `memory_lint` 运行时提交 wiki 目录。
- **自愈**：启动检查（`memory_diagnose`）：向量 dim/提供方漂移、FTS 索引损坏、孤儿页、断链、僵尸会话。`memory_heal` 自动修复安全子集。
- **日志**：结构化 `tracing` 带滚动文件、上限 N MB。没有反馈循环（agentmemory #519）。

## 13. 原始 v1 排除项（历史）

初始范围排除了以下内容。部分项（含多用户认证、Web UI、托管智能体技能）已在 v1 之后发布；此清单作为历史决策边界保留，而非当前支持矩阵。

- 无多租户认证/RBAC（单用户家庭实验室）。
- 无 Web UI / 仪表盘（用 `sqlite3` + `glow`/Obsidian）。
- 无 Postgres 后端（真实家庭实验室用户撞到规模墙再重新考虑）。
- 无远程/云同步（wiki 目录用 git remote）。
- 无替代内嵌向量后端（仅 sqlite-vec）。
- 无替代图数据库（仅 SQL 递归 CTE）。
- 无多模态（仅文本）。
- v1 无通用「技能」/斜杠命令包（agentmemory 插件格式）。窄例外是为智能体打包路由指引的托管 ai-memory 智能体技能；钩子 + MCP 仍是产品面。
- v1 无 LongMemEval 式基准框架——v0.4 再加。

## 14. 避坑清单（来自 issue 调研）

刻进代码库的顶层规则：

1. 单一配置读取路径（agentmemory #456/#469）。
2. 索引与事实源行同事务（agentmemory #204/#309，basic-memory #763/#578）。
3. JSON-schema 结构化输出，不用 XML（agentmemory #492/#539；cognee #2840）。
4. 钩子即发即忘（agentmemory #221、#143）。
5. 无「返回后后台索引」；要么同步要么 `index_status: pending`（basic-memory #763）。
6. 第一天起三元组身份（basic-memory #783/#834）。
7. 向量索引记录 `{provider, model, dim}`；忽略过期向量、不匹配时警告（agentmemory #469）。
8. 嵌入缓存路径绝对，不用 `/tmp`（basic-memory #741）。
9. 监视器心跳 + 对账环节（basic-memory #580/#758/#798）。
10. 破坏性操作前查活进程（basic-memory #765）。
11. 每提供方类型化 HTTP 客户端；无 LiteLLM 等价物（cognee #2840）。
12. 幂等摄取配确定性 id 派生（cognee #2510/#2557/#2633）。
13. 单一事务边界；无隐式图/向量/关系同步（cognee B 节）。
14. 过滤器传播测试（cognee #2720 是召回正确性 bug）。
15. 默认数据目录是绝对规范平台路径（agentmemory #303）。
16. 配置上无 `lru_cache`（cognee #2228/#2853）。
17. 数据集/项目是查询时过滤器，不按编排模式条件化（cognee #2867）。
18. LLM 默认关闭；经环境变量选择启用（agentmemory #138/#143）。
19. `cargo deny` 做传递许可审计（cognee #2807——FastEmbed 因许可移除）。
20. 钉住上游原生依赖；发布 lockfile（agentmemory #555/#540）。

## 15. 托管工作流用可移植台账，不做原生格式转换

托管跨外壳连续性经 `ai-memory run` 显式选择启用。直接启动 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code、Kiro CLI、OMP、Grok Build CLI 与 Antigravity CLI 保持既有的钩子与一次性交接行为。没有进程级全局模式或手工外壳切换：包装器选择当前仓库/worktree 的工作流，每个适配器应用那个外壳的原生创建/恢复语法。

一个逻辑工作流每个外壳拥有一个原生会话，加一个只追加的可移植事件台账。我们否决了把 Claude 转录转换成假的 Codex rollout（以及反向）：原生存储包含私有的、版本化的状态、提供方专属记录与 ai-memory 不拥有的完整性假设。因此适配器读原生存储而不修改、只归一化可见消息/已完成工具/压缩边界、并分开保持源游标与投递游标。隐藏推理与提供方私有记录被显式排除。

用可续期的单写入器租约解决优先级与并发，而不是尝试双向文件同步。SessionStart 收到一段有界的未见增量，而不替换显式待处理的交接。两者并存时，先渲染策展的交接，它们的投递认领在完整启动响应组装完毕后原子提交。完整可见台账保持可检索。仓库检查点在运行边界作为证据，绝不 commit、stash、reset 或以其他方式改动检出。markdown wiki 保持为持久知识面；托管台账是运营连续性基底。

原生会话认领仅限于引导本来为空的工作流。交互式启动器可以提供为同一规范检出记录的近期会话，但显式新工作流与非交互调用全新开始。任何外壳关联会话或贡献可移植历史之后，服务器侧状态对每个外壳禁用认领。这防止 Claude 工作之后的第一次 Codex 启动挂上一份无关的旧 Codex 转录；它创建干净的 Codex 会话、注入既有台账、并在后续返回时恢复那个关联的 Codex 会话。

裸 `ai-memory run` 把本地时间戳当引导提示而非全局优先级。工作流一旦建立，服务器在本地可用候选中选择最近关联的外壳。这防止更新的过期转录文件压过逻辑工作流。无检出本地候选时，裸模式在创建服务器状态之前失败。

我们也否决了检出目录重命名后自动改写私有存储。多数外壳持久化绝对路径、没有共享的重定位 API、且服务器无法区分移动的检出与同一远端的另一个克隆。确切路径发现 + 显式原生恢复更安全；Crush 是例外，因为其项目本地数据库随目录树移动。

这个设计跟随伴随项目 `ai-babel` 的外壳格式与会话可移植性实验：语义连续性可移植，而确切原生上下文靠恢复那个外壳自己的会话来保留。
