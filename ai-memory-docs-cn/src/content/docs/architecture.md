---
title: "ai-memory 架构"
description: "ai-memory 是单个 Rust 二进制，给 README 支持矩阵里的编码智能体及其他支持 MCP 的客户端提供跨 CLI 共享的长期记忆。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/architecture.md"
---

# ai-memory 架构

> 关于「这东西是什么、长什么样」的一份规范文档。
> 长篇调研在旁边的 [`docs/`](https://github.com/akitaonrails/ai-memory/tree/main/docs) 目录里；本页是给读代码的人看的操作性摘要。

## 目的

ai-memory 是单个 Rust 二进制，给 [README 支持矩阵](/#支持矩阵)里的编码智能体及其他支持 MCP 的客户端提供跨 CLI 共享的长期记忆。
任务中途退出一个；同一目录打开另一个；继续。没有手工 `write_note` 仪式，没有会话之间复制粘贴摘要。

你逐渐累积的产物是一个 **Karpathy 式 LLM wiki**：磁盘上一棵 git 版本化的 markdown 页面树，随时间被*编译*、被追加。页面经取代（supersession）就地版本化，语义概念复利增长，情节日志衰减。伴随的 SQLite 索引提供 FTS5 + 词法实体 + 链接邻居检索，可选向量；markdown 保持事实源。

## 数据流

![ai-memory 架构总览](/architecture-overview.svg)

实线箭头是请求、读、写路径。虚线箭头是后台对账或提供方支撑的维护。核心不变量未变：markdown wiki 是事实源，SQLite 是派生索引——服务检索、会话、观察、交接、审计、嵌入与可选的托管工作流连续性台账。
自动改进位于提供方支撑的维护侧：服务器为每个项目新完成的会话排期评审，把验证过的提案记入待写入审计轨迹（pending-writes audit trail），默认经正常 wiki 写入路径自动批准。调度器节拍不重叠；长的全项目评审推会推迟下一拍而不是再起一份。调度与批准分离。管理员可设 `[auto_improve.scheduler] enabled = false` 停止后台评审，或设 `[auto_improve] require_approval = true` 让计划与手动提案挂着等评审。操作者还可以设 `[auto_improve.eval]`，对选定的提案前缀在 LLM 验证之后、暂存/批准之前跑一个项目提供的可执行门；它默认关闭且绝不在钩子路径上运行。

**稳态循环：**

1. 智能体 CLI 发出生命周期钩子（SessionStart、UserPromptSubmit、PostToolUse……）。shell 脚本钩子以短超时把事件 JSON `curl` 到 `POST /hook`。原生 `ai-memory hook --event ...` 命令带稳定的逐条幂等键在本地暂存（spool）事件，在会话启动时做短的有界清理，并把会话结束投递交给分离的锁感知 `hook-drain` 辅助进程；高延迟操作者可用分钟级环境变量调高排放/交接/后台上限。智能体热路径绝不在网络上阻塞；饱和的服务器返回 HTTP 429 而不是排队无界工作。对受支持的原生命令与生成的 OpenCode/OMP/Pi/OpenClaw 集成，就近标记捕获策略先行：被丢弃的已识别文件工具事件绝不进入暂存、队列、传输、日志或存储。见[捕获排除](/marker-file/#捕获排除capture-exclusions)。
2. 服务器的钩子路由器净化 payload（不受信任文本进入存储的唯一路径），指派一个 [`ObservationKind`]，并把一条 `WriteCmd` 入队给写入器 actor。原生带键事件中，项目限定的键与观察一起提交。键只在下游处理完成后标记完成：未完成的重放恢复 wiki/交接效果而不追加另一条观察，而已完成的重放被确认并跳过。一个有界的逐项目/键门把重叠重试与原处理器串行化。在那个完成标记之前下游效果保持至少一次（at-least-once），所以那些效果期间的进程崩溃可能重复一个已应用的效果而不是静默丢失其余。对被中断的已结束 SessionEnd，重放收敛 wiki 提交、持久提供方任务与待处理键，而不追加另一条观察。`log.md` 追加一行 `## [YYYY-MM-DDTHH:MM:SSZ] <event> | <title>`。
3. 真正的 `SessionEnd` 事件上，服务器合成一页 `sessions/<id>.md` 摘要（基于规则，无 LLM）并为下一个智能体开一条 `Handoff` 行。一个 SQLite 事务插入那条自动交接、给会话盖上结束戳、并记录覆盖的观察数，所以恢复绝不会只见到那些 DB 效果的一半。之后的 SessionEnd 只在代际前进时才重跑该路径，所以恢复的会话被捕获而重复投递与时钟偏移收敛。既有已结束会话在迁移时打基线，而不是变成历史补课。自动提交 wiki。没有可靠真会话结束钩子的客户端需要一个显式结束动作：Codex 用 `ai-memory finalize-session`，Antigravity CLI 用 `ai-memory finalize-session --agent antigravity-cli`。该命令选择最新的匹配开放会话，并进入与原生钩子相同的规范 SessionEnd 路径。
4. 设置了 `AI_MEMORY_LLM_PROVIDER` 时，`memory_consolidate` 把那页摘要重写为更丰富的持久页，或扇出为 `concepts/`、`decisions/`、`gotchas/` 下的多页批次。整编提示词保持源材料的主导自然语言，并要求模型用基于路径的 wikilink 连接相关页面。
5. 配置了 LLM 提供方时，自动改进调度器在钩子延迟之外评审所有项目新完成的会话。它把验证过的 `concepts/`、`decisions/`、`gotchas/`、`procedures/`、`_rules/` 提案记入待写入审计轨迹，然后默认经 wiki 变更路径批准。调度器初始化逐项目首跑水位线（watermark），升级时历史会话不被自动处理，然后在做 LLM 工作之前记录逐会话认领，让失败的计划评审不会永远重试。显式 CLI/admin/MCP 自动改进调用用同一条管线做定向重跑或补跑。设 `[auto_improve] require_approval = true` 时，计划与手动提案保持待处理直到显式的待写入批准。若 `[auto_improve.eval] enabled = true`，定向提案（默认 `_rules/` 与 `procedures/`）必须在暂存前通过配置的可执行 JSON 契约；失败变成被拒绝的候选/拒绝缓冲条目而非 wiki 写入。每个 LLM 提示词都把仓库文本、观察、wiki 页面与先前提案当作不受信任数据而非指令。同一个显式信任边界与分隔符先于自动注入的交接、项目简报与托管工作流数据包；当前指令与检出状态保持权威。
6. `memory_query` 经 FTS5 + 实体匹配 + 链接邻居 RRF 回答；配置了嵌入器时，`page_embeddings` 上的向量余弦加入同一 RRF。实体索引从规范 frontmatter 的 `entities` 列表派生，空索引不贡献候选或分数。最终截断之前，一个有界的权威度乘数用规范页面类别、层级、`pinned` 与显式正/负 frontmatter 标签调整相关度。它在胶着对局中偏袒受维护的规则、决策、流程与坑点，同时保持情节性、历史、lint 与测试证据可检索。没有查询意图正则或硬排除参与。可选的 `AI_MEMORY_RERANKER=llm` 一道在项目/作用域融合之后把有界的查询加至多 30 个有界标题/片段发给配置的提供方；它限于每查询一次调用、并发四次，任何无效、失败、超时或饱和的尝试都保持本地顺序。全局与补充的全局偏好结果不走这条路。若编译 wiki 页面在默认、显式项目或显式 `scopes` 模式下全部落空，有界的裸观察 FTS 返回回退 `raw_hits`；`global=true` 只跨项目检索编译 wiki 页面。页面命中提升 `access_count` + `last_accessed_at`——M8 强化项，`memory_feedback` 用显式的逐页显著度（salience）补充它。已识别的操作者还为每页加一条 `page_access` 行；选择启用的 `[decay] breadth_weight` 可以奖励被多个不同操作者强化的页面。该提升限流到每页每分钟至多一次，所以爆发的重叠检索不会用冗余强化写入淹没写入器 actor。
7. 遗忘清扫按需及按服务器的 `[maintenance]` 计划运行：超过 frontmatter `expires_at:` TTL 的页面经 wiki 层硬删除（文件 + 行，置顶与否一样）；`retention < cold_threshold` 的页面经 wiki 层驱逐——移除权威文件并留下衰减墓碑；比 `hard_delete_after_days` 老的墓碑连同其完整版本谱系只在本次清扫解析出的 workspace/项目内清除，一起清掉因清除而孤立的实体索引行。同一路径上更新的重建页面被保留。语义/置顶/新近触碰的页面存活。
   计划清扫、基于规则的 lint 与选择启用的嵌入回填节拍在做逐项目工作之前枚举每个既有 workspace/项目作用域，与自动改进调度器的全库作用域模型一致。单独的每日清理只在一行项目记录不含任何页面、会话、观察、交接、托管工作流或自动改进数据且已存在一周时移除它；托管连续性历史因此保持其项目作用域存活，即使没有捕获过任何生命周期钩子会话。
8. 备份：`ai-memory backup --to <tarball>` 用 SQLite 的在线备份 API，源保持可写；`ai-memory restore` 反向。或者：wiki 目录 `git push` + 数据目录 `rsync`。

**可选的托管工作流循环：** `ai-memory run` 为当前仓库/worktree 工作流开一个租约，解析显式外壳或最新可用的本地/关联外壳，创建或恢复该外壳的原生会话，并用调用作用域的运行 id 标记生命周期调用。SessionStart 注入一段未见的带界事件区间；Crush 没有 SessionStart，经临时的受支持全局上下文路径接收。子进程退出时宿主导入原生转录尾部与一个 Git 检查点。每个注入的数据包以版本化的来源标记开头。Claude 转录归一化器在 Claude 持久化并读回带标记的数据包时排除它，防止投递过的历史递归重入台账。显式待处理的交接先于托管事件区间投递；它们的单次投递认领在完整启动响应组装完毕后共享一个写入器事务。手工交接优先；否则投递最新的 cwd 合格自动交接，且同一事务让较旧的合格自动交接过期而保留手工与兄弟目录的工作。插入也让确切 cwd 先前的开放自动交接过期，把任何接收者启动前的重复 SessionEnd 限界。
ai-memory 以只读打开原生存储。原始净化 JSONL 片段不可变，SQLite 提供单调序列、FTS、原生源/投递游标与幂等重试状态。全台账的 `workstream-search` 路径补充有界的启动数据包。交互式空工作流可以认领一个匹配检出的原生会话一次。资格来自权威的台账/会话状态：任何外壳建立工作流之后，新加入的外壳全新开始并接收可移植历史，而不是认领无关的旧原生历史。已处理的启动器失败取消其租约；正常重开短暂重试收尾冲突，而不干净的进程死亡由可续期租约的到期兜底。见[托管跨外壳工作流](/managed-workstreams/)。

## 钩子事件词汇表

核心观察词汇表是一组封闭的智能体生命周期事件。钩子桥可以接受客户端专属别名，但存储把它们归一化到恰好一个 `ObservationKind` 值：

| 存储类别 | 语义 |
|---|---|
| `session-start` | 智能体会话开始；捕获 cwd/模型/会话身份。 |
| `user-prompt` | 用户向智能体提交提示词文本。 |
| `pre-tool-use` | 智能体即将调用工具。 |
| `post-tool-use` | 智能体完成一次工具调用。 |
| `pre-compact` | 智能体即将压缩其上下文。 |
| `post-compaction` | 智能体压缩了上下文并给出事后摘要或检查点。 |
| `notification` | 智能体发出通知式事件。 |
| `stop` | 智能体完成一个交互回合或自然停止。 |
| `session-end` | 智体会话结束；可运行摘要/交接路径。 |
| `other` | 未知或不支持的钩子事件。 |

Antigravity CLI 没有原生 SessionStart 事件。其 `PreInvocation` 钩子在每次模型调用前触发，所以桥只把有文档的 `invocationNum = 0` payload 映射到 `session-start`；后续调用在暂存或网络副作用之前被忽略。

未知事件**不**扩枚举，且默认不在存储里留下源事件元数据；它们塌缩为 `other`。需要自己词汇表的第三方集成可以在 `/hook` 上发 `extension=<namespace>` 选择启用。扩展命名空间有效时，ai-memory 在提供了的情况下存显式 `source_event=<name>`，未提供 `source_event` 时存未知的 `event` 字符串。存储的这对是可空观察元数据；`kind` 保持规范。这是一个扩展接缝，不是运行时插件系统：外部处理器必须用既有 HTTP/MCP API，不能绕过净化器、钩子背压或单写入器 SQLite actor。

生命周期体的内容限额独立于 10 MiB 的 HTTP 请求限额。用户提示词与压缩后摘要 UTF-8 安全地钳制在 16 KiB；通知与工具摘录钳制在 2 KB。原生 `ai-memory hook` 命令在本地暂存与传输之前应用事件专属限额，服务器解析每个请求时重复它，所以直连与旧客户端绕不过。类型化净化器边界再对编辑后的每个持久观察体施加 16 KiB 兜底。单独门控的 Claude Code 助手/Stop 摘录保持钳制在 2 KB。

## 存储架构

**两层，一个事实源。**

* `<data_dir>/wiki/`——markdown 事实源。由一个 `git2` 仓库持有，所以每次整编 + 每次会话结束都产出持久提交。可在 Obsidian / vim 里手编——监视器对账外部编辑。
* `<data_dir>/db/memory.sqlite`——派生索引。WAL 模式。一个写入器 actor 持有写 `Connection`；读取走可克隆的只读池。
* `<data_dir>/raw/`——不可变的净化后托管工作流 JSONL 片段。遗留裸回退召回经 FTS5 检索持久的 `observations` 表；生命周期 HookEnvelope JSON 不是完整的转录归档。
* `<data_dir>/logs/`——按日滚动的 `tracing` 输出。
* `<data_dir>/models/`——预留给捆绑的嵌入模型（M9.5+，本地 `ort` 落地时）。
* `<data_dir>/client-projects.json`——`ai-memory show` 的私有客户端本地检出链接，以免凭据的服务器身份加 workspace 与 project 为键。它不属于 SQLite/wiki 事实源，且没有服务器 API 暴露宿主路径。

**schema（当前主线）：**

| 表 | 内容 |
|---|---|
| `workspaces`、`projects` | 三元组身份坐标的顶端。 |
| `pages` | 带版本 wiki 页面，`is_latest` + `supersedes` 链。M8 列：`last_accessed_at`、`access_count`、仅衰减墓碑标记 `superseded_at`。M9 列：`embedding_provider`、`embedding_model`、`embedding_dim`。V36：`expires_at`（frontmatter TTL）。V37：`salience`（NULL = `salience_default`；从 `page_feedback` 派生）。 |
| `pages_fts` | `(title, body)` 上的 FTS5 虚拟表，触发器自动同步。 |
| `sessions`、`observations` | 净化后的、有界的生命周期钩子投影。`sessions.ended_observation_count` 是恢复会话重进结束资格的稳定代际水位线；那个决策不用墙钟。它们是运营审计轨迹，不是完整的原生转录。 |
| `session_consolidation_jobs` | 选择启用的 SessionEnd LLM 整编的持久、观察代际幂等队列。一个有界服务器 worker 租任务、带退避重试提供方失败、并在重启后恢复过期租约。 |
| `observations_fts` | 裸观察 `(title, body)` 上的 FTS5 虚拟表，仅作有界回退。 |
| `workstreams`、`managed_runs`、`workstream_native_sessions` | `ai-memory run` 的可选租约状态加逐外壳的原生源与投递游标。 |
| `workstream_events`、`workstream_events_fts` | 只追加的归一化可见转录事件与全文检索；不可变的净化源批次也在 `raw/workstreams/` 下。 |
| `links` | wikilink / markdown 交叉引用。`to_page_id`（全局 PageId）对未解析的前向链接可空。`to_workspace` / `to_project` 携带跨项目作用域（NULL = 源页面自己的项目）。 |
| `handoffs` | 类型化的跨智能体交接记录（open / accepted / expired）。 |
| `page_embeddings` | 最新页面的可选向量行，`(provider, model, dim)` 反范式化，让混合检索能在嵌入配置变更后忽略过期向量并报告缺失嵌入诊断。 |
| `page_feedback` | 按页面*版本*为键的只追加 `memory_feedback` 信号（`helpful` / `not_helpful` / `stale` / `wrong`），带可选的净化 reason 与 `salience_after`。派生 `pages.salience` 的事实源；lint 环节读取未解决的 stale/wrong 行并 join `is_latest = 1`，所以重写就让发现退役。 |
| `page_access` | 每最新页面与限定操作者身份一行。在不改变既有共享访问计数器的情况下提供可选的访问广度留存项。 |
| `client_activity` | 服务器级 MCP 工具调用计数，读写分列、按 UTC 日分桶。MCP 请求咽喉点以一分钟后台间隔冲刷缓冲的调用；失败批次从有界内存重试。每天至多存 128 个净化的客户端标签加 `other`，所以不受信任的 `clientInfo.name` 造不出与流量成正比的行。 |
| `auto_improve_proposals` | 暂存的学习与维护编辑，带不可变目标快照与只追加决策事件。待处理目标的唯一性按限定暂存身份划界；未归因提案保留历史的共享桶。 |
| `entities`、`entity_page_links` | V38 名词索引，从规范 frontmatter 派生。名称归一化且每项目唯一；链接指向不可变页面版本而检索过滤到最新版本。作用域配对触发器防跨项目链接。支撑第四条 RRF 检索流。 |
| `audit_log` | 每次变更，可按 `at DESC` 检索。 |

**记忆层级（M8 策略）：**

| 层级 | 生命周期 | 衰减 |
|---|---|---|
| 工作 | 仅当前会话 | 会话结束即硬丢弃（留在 `observations` 供取证） |
| 情节 | 30 天热 → 180 天冷 → 驱逐 | `salience · exp(−λΔt) + σ · log(1+access_count) · exp(−μ · days_since_access) · (1 + breadth_weight · ln(1 + max(distinct_actors−1, 0)))` |
| 语义 | 无限期 | 无——仅可经 M7 LLM 重写被取代 |
| 程序 | 无限期 | 未再观察到则按频次衰减 |

置顶页面（frontmatter `pinned: true`）豁免于所有衰减路径。`_slots/` 下的页面自动置顶，并在简报/explore 快照中作为小小的可编辑记忆槽位露出。槽位页可用 `slot_kind: state` 或 `slot_kind: invariant` 声明写入模式；省略表示 `state`（向后兼容）。可变工作上下文（当前焦点、待办事项）用 `state`。高阻力的项目上下文、身份、规则或用户偏好用 `invariant`；除非新观察直接矛盾既有具体内容，整编不应重写既有 invariant 槽位。

共享服务器可选择启用 `[slots] per_user = true`。引擎与 MCP 槽位写入随后用从已认证 `IdentityKey` 派生的有界命名空间；会话简报与整编提示词包含共享槽位加调用者的命名空间。既有未命名空间化的槽位保持共享，默认保持关闭。精确的 wiki 读取与检索刻意不变：这个边界限制提示注入，不限制页面访问。

## 跨项目链接

页面通常在自己的项目内链接（`[[decisions/0001.md]]`，或指向 `../gotchas/x.md` 的 `label`）。wikilink 也可以点名另一个项目，让项目间的依赖成为图里的显式边：

* `[[project:path.md]]`——同一 workspace 的兄弟项目。
* `[[workspace/project:path.md]]`——另一 workspace 的项目。

解析器（`ai-memory-wiki::extract_links`）产出 `LinkTarget { workspace, project, path }`；存储针对被点名项目的最新页面解析它，并把作用域记进 `links.to_workspace` / `links.to_project`（NULL = 源自己的项目，常见情形）。解析是延迟安全的：指向尚不存在页面的链接保持 `to_page_id = NULL`，在该页面之后落地时由 `refresh_incoming_links_for_path` 重指——跨项目，不限于一个项目内。

因为 `to_page_id` 是全局 id 且 `ReaderPool::page_links` 按 id join 不带项目过滤，已解析的跨项目链接免费地在其目标上作为反向链接浮现；`RelatedPage` 携带源的 `workspace` / `project`，所以依赖有标签、可导航。这正是把逐项目 wiki 变成一张依赖图的东西（另见 `memory_lint` 的悬空引用检查、简报的依赖方计数、以及 `/api/v1/graph` 端点）。

## crate 布局

```
crates/
├── ai-memory-core/        领域类型、错误、id。无 IO。
├── ai-memory-store/       SQLite + 写入器 actor + 读池 + 衰减数学。
├── ai-memory-wiki/        原子 markdown 写入、文件监视器、git。
├── ai-memory-mcp/         rmcp 传输 + 工具路由器。
├── ai-memory-hooks/       payload schema、净化器、/hook 入口。
├── ai-memory-llm/         提供方认证边界 + LlmProvider / Embedder trait。
├── ai-memory-consolidate/ Karpathy 摄取 / lint / 清扫 / 自动改进管线。
├── ai-memory-workstream/  只读原生转录 + 启动适配器。
└── ai-memory-cli/         `ai-memory` 二进制入口 + 瘦 HTTP 子命令。
```

每个 crate 单一职责、暴露类型化 API。无循环依赖。crate 间边界强制执行下面的横切不变量。

## MCP 工具面（18 个工具）

| 工具 | 标注 | 用途 |
|---|---|---|
| `memory_query` | 只读 | FTS5 + 实体匹配 + 图 RRF + 可选向量 RRF 检索，随后有界的类别/层级/置顶/标签权威度调整与裸回退。页面命中提升访问计数器。默认当前项目；默认作用域的调用还把保留的 `_global` 偏好作用域以 `global_scope_hits` 并入；`scopes` 检索具名兄弟项目；`global=true` 一次检索所有项目（每个命中标注其 workspace + project）。设 `AI_MEMORY_RERANKER=llm` 时，项目/scopes 候选池融合后至多做一次最终 LLM 相关度重排；查询/标题/片段数据有界且 JSON 编码，任何超时、提供方错误、无效/不完整分数集或四次并发饱和都保持调整后的顺序。独立的 `global=true` FTS-only 排序器与补充的全局偏好命中不重排。`explain=true` 给项目/scopes 命中附逐命中 `score_details`（逐流排名、匹配实体、原始 FTS/余弦/实体逆频率分数、RRF 贡献、图出处、权威度乘数、可选重排分数）加顶层 `streams_active` 列表。全局 FTS-only 排序器报告其活跃流而无逐命中细节。`include_expired=true` 也返回 TTL 过期页面。 |
| `memory_recent` | 只读 | 最近更新的 `is_latest=1` 页面。 |
| `memory_read_page` | 只读 | 按 `path` 或按 `query` 的首个 FTS5 命中取单页完整正文；可选 `workspace` + `project` 定位具名兄弟 workspace/项目。智能体需要多于 `memory_query` 的 24 词片段时用。 |
| `memory_read_session_observations` | 只读 | 翻阅一个会话的原始钩子观察（带完整净化正文的 `ObservationRecord`，每行按 `body_max_chars` 钳制），限定于落在解析作用域内的行与调用者可见的会话；`total` 与 `elided_other_scope` 报告作用域内计数与会话留在另一项目的行。省略 `session_id` 读最新完成的可见会话。 |
| `memory_status` | 只读 | 计数、路径、版本。 |
| `memory_briefing` | 只读 | 结构化的计数/活动/规则/槽位/近期快照。 |
| `memory_explore` | 只读 | 简报快照之上的 LLM 散文摘要，无提供方时退化为 JSON。 |
| `memory_handoff_begin` | 破坏性 | 为下一个智能体开一条所有者限定的交接；`shared=true` 刻意把它发布给项目。可选 `workspace` + `project` 定位具名兄弟 workspace/项目。 |
| `memory_handoff_accept` | 破坏性 | 取回 + 确认最新的自己/共享交接（自动交接按 cwd 匹配）。仅 root 的 `any_owner=true` 跨操作者恢复。可选 `workspace` + `project` 定位具名兄弟 workspace/项目。 |
| `memory_handoff_cancel` | 破坏性 | 把误建的确切可见开放交接 id 标记过期；仅 root 的 `any_owner=true` 跨操作者恢复。 |
| `memory_consolidate` | 破坏性 | LLM 驱动的页面重写。`multi_page=true` 原子扇出。整编提示词把目标项目活跃的保留 `_prompts/consolidation.md` 正文作为净化、2000 字符钳制、JSON 编码、不受信任的参考性偏好追加；TTL 过期页面被忽略，逐调用 `instructions` 参数一次性覆盖该页。两套系统提示词都保持 schema、证据、披露、工具使用与输出规则的权威。 |
| `memory_feedback` | 写 | 按确切 `path` 记录一页的质量信号：`helpful`/`not_helpful` 对清扫候选情节页抬/压 `pages.salience`，而 `stale`/`wrong` 给显著度兜底并把任何当前页作为 `feedback_flagged` lint 发现浮出。绝不删除；路径在事务中解析到当前版本，之后的重写清除它。检索到的内容本身绝不授权反馈。 |
| `memory_auto_improve` | 写 | 手动评审一个已完成会话，并经自动改进批准路径应用或暂存验证过的 wiki 编辑。无会话 ID 时选择尚无已持久化自动改进运行的最新完成会话，重复调用推进跳过预检的会话；显式 ID 保持可重跑。服务器也为新会话排期评审；`[auto_improve] require_approval = true` 让提案挂起等人审。 |
| `memory_write_page` | 破坏性 | 用户显式要求记住/标注时写持久 wiki 知识。`scope: "global"` 写进保留的 `_global` 偏好作用域；可选 `expires_at` 设 RFC3339 或仅日期的 TTL。 |
| `memory_delete_page` | 破坏性 | 按确切 `path` 删除单页。触发准入链（op=delete）；幂等。 |
| `memory_forget_sweep` | 破坏性 | 留存清理：经 wiki 层驱逐冷页、清除老化墓碑谱系、硬删除 TTL 过期页面。`dry_run=true` 预览。 |
| `memory_lint` | 破坏性 | 基于规则 + LLM 的矛盾发现 → `wiki/_lint/`。 |
| `memory_install_self_routing` | 只读 | 返回规范轻量路由片段加托管智能体技能 payload 与 CLAUDE.md / AGENTS.md 安装的目标提示。 |

`memory_briefing`、`memory_explore`、`memory_write_page`、`memory_install_self_routing`、`memory_read_page`、`memory_read_session_observations`、`memory_delete_page`、`memory_handoff_cancel`、`memory_auto_improve`、`memory_feedback` 都晚于最初「刻意收窄」的裁剪（`design-decisions.md` §10）：briefing/explore 分开「现在什么情况」的结构化与散文两半，`memory_write_page` 覆盖显式持久标注而不滥用一次性交接，`memory_install_self_routing` 为智能体必须把自己的路由规则重写进项目 `CLAUDE.md` / `AGENTS.md` 并把伴随托管智能体技能装进 `.claude/skills` 或 `.agents/skills` 的 meta 场景而存在，`memory_read_page` 为「我要整页而不是片段」的场景补充 `memory_query`（如端到端打开一页决策），`memory_read_session_observations` 打开编译页或裸命中背后的原始证据（一个会话、在作用域内、分页且体有界），让智能体能审计钩子实际捕获了什么，`memory_auto_improve` 经与待写入相同的批准/写入路径暴露默认可用的学习评审，`memory_delete_page` 是准入感知镜像需要的确切路径破坏性配对。`memory_handoff_cancel` 是误建交接的安全阀。`memory_feedback` 实现 `prior-art-implementation-findings.md` 里「访问计数之外更细粒度强化」的 P2 项：它不能搭只读工具的便车而不混淆读写语义，它补充的访问计数器也分不清「这页回答了问题」与「这页浪费了一次读取」。收窄面的纪律仍然成立——每个新工具都得挣得自己的位置——但数量是 17，不是 10。

托管智能体技能是这条以 wiki 为中心的架构里一个窄的提示词包装例外。它们是教智能体何时调用 ai-memory MCP 工具的静态 `SKILL.md` 文件；它们不是持久 wiki 页面、不是自动改进产物、也不是 ai-memory 内部的运行时技能路由器。

MCP 参数别名刻意稀疏：`memory_query.query` 接受 `q|search`，limit 字段在发布处接受 `n` / `top_k`。project 与 cwd 参数用规范名。

Claude Code 可选的会话感知 MCP 注册是传输适配器，不是第二套工具实现。`ai-memory mcp-bridge` 在本地 stdio 上服务上游工具目录，经 rmcp 的客户端传输把工具调用委托给配置的 HTTP 服务器，并把继承的 `CLAUDE_CODE_SESSION_ID` 注入为 `X-Memory-Actor-Session-Id`。服务器因此对直连 HTTP 客户端保持相同的认证、作用域解析器与工具处理器。适配器在没有 Claude 会话 id 时失败关闭，且只经显式的 `install-mcp --client claude-code --session-aware` 选项安装。

## CLI 子命令面

```
init                 status               run
show                 continue             workstream-search
audit-contamination  search               read-page
write-page           delete-page          serve
reset                backup               restore
reindex              install-hooks        hook
install-mcp          commit               checkpoints
restore-page         llm-test             forget-sweep
lint                 curator              auto-improve-report
auto-improve         finalize-session     pending-writes
embed                generate-auth-token  setup-agent
bootstrap            install-instructions install-skills
reorg                purge-project        rename-project
move-project         move-session         uninstall
auth                 user                 completions
```

完整命令树运行 `ai-memory --help`。

`auto-improve-report` 默认只读；`--stage` 为审计/批准创建一页待处理遥测报告，而不暂存学习记忆编辑。

## 横切不变量

刻在 M0/M1；每个里程碑都必须尊重它们。每条都来自一个有文档的先前技术 bug；评审触碰相关区域的变更时引用来源。

1. **单一配置读取路径。** `Config::load()` 启动时调用一次。它之外没有 `std::env::var`。（agentmemory #456 / #469。）
2. **单写入器 SQLite actor。** 所有写入经一个 `mpsc` 通道到一个专用 OS 线程。（cognee #2717。）
3. **索引与数据同事务提交。** 没有「返回后后台索引」。（basic-memory #763 / #578。）
4. **类型化三元组身份**（`workspace_id`、`project_id`、path）从第一天起进每个领域行。（basic-memory #783 / #834。）
5. **钩子即发即忘。** 钩子脚本硬超时 ≤200 ms；服务器立即返回 202，饱和时 429。（agentmemory #221 / #143。）
6. **隐私剥离是类型化边界。** `Sanitized<NewObservation>` 除 `sanitize()` 外没有别的构造器。（design-decisions §14。）选择启用的助手/Stop 摘录（#196）经同一边界进入：客户端在上链路之前净化它，服务器在写入前用自己的配置模式在这里重洗。
7. **只用 JSON-schema 结构化输出。** 原生提供方 JSON 模式；无 XML、无 Instructor 包装。（agentmemory #492 / #539，cognee #2840。）
8. **`{provider, model, dim}` 反范式化在每个嵌入旁。** 不匹配时警告并忽略过期向量直到重新嵌入完成。（agentmemory #469。）
9. **破坏性操作前查活进程。** `ai-memory reset`、`backup`、`restore` 都咨询 `sysinfo`。（basic-memory #765。）
10. **原子文件写入**（tmp + rename + fsync）。监视器按文件名前缀忽略自己的写入。
11. **绝对规范数据目录**默认；启动时大声打日志。（agentmemory #303。）
12. **无全局单例 / `lazy_static` 配置。** 所有依赖显式。（cognee #2228。）
13. **零 LLM 默认路径。** LLM 经环境变量选择启用。系统在未配置任何提供方时照常工作。
14. **提供方认证先于提供方构造解析。** 原生提供方客户端消费类型化的 `ProviderAuth` 材料；它们从不直接读环境变量。令牌背书的提供方经该边界收到显式的 auth 文件路径 / 环境派生令牌材料，然后自己负责提供方专属的刷新与持久化。
15. **Tracing 订阅者显式过滤自己的模块。** 无反馈循环。（agentmemory #519。）

## 配置（`config.toml`）

位于 `<data_dir>/config.toml`。所有值可用 `AI_MEMORY_*` 前缀的环境变量覆盖。

```toml
bind = "127.0.0.1:49374"
log_level = "info"

[decay]                            # M8 留存参数
lambda = 0.02                      # ↓ 调低让遗忘更温和
sigma = 0.6                        # ↑ 调高更奖励查询命中
mu = 0.04                          # ↑ 若近期命中应更算数
cold_threshold = 0.20              # 低于此 → 移除文件 + 保留墓碑
hard_delete_after_days = 180
breadth_weight = 0.0               # 选择启用的多操作者奖励

[slots]                           # 可选的共享服务器注入边界
per_user = false                  # 智能体上下文 = 共享 + 自己的槽位

[consolidation]                    # LLM 整编提示词配额
max_input_tokens = 100000          # 近似的整体输入目标；最小 6000
max_output_tokens = 32000          # 提供方生成上限；最小 1000
                                   # 两者之和须塞进模型上下文窗口；
                                   # 给分词器差异留余量

[auto_improve]                     # 默认可用的学习评审者
require_approval = false           # true 让提案挂起待评审
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

[auto_improve.scheduler]           # 后台评审；与批准分离
enabled = true
interval_secs = 3600
max_sessions_per_tick = 1        # 每项目；调度器节拍不重叠
min_session_age_secs = 600
```

**LLM 提供方环境变量**（选择启用）：
```
AI_MEMORY_LLM_PROVIDER     anthropic | anthropic-oauth | openai | openai-oauth | copilot |
                           gemini | openai-compat | opencode
AI_MEMORY_LLM_MODEL        提供方有默认时可省略；如 claude-haiku-4-5、gpt-5.4-mini
ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY / LLM_API_KEY
AI_MEMORY_LLM_BASE_URL     openai-compat 用（Ollama、vLLM）
AI_MEMORY_LLM_COMPAT_STRICT 默认 true；false 关闭 response_format=json_schema
AI_MEMORY_LLM_TIMEOUT_SECS  聊天提供方的逐请求超时；默认 300
AI_MEMORY_RERANKER         可选 `llm`；重排项目/scopes 查询候选
COPILOT_GITHUB_TOKEN       copilot 的可选 GitHub 令牌
GITHUB_COPILOT_API_TOKEN   可选的预铸造 Copilot API 令牌
COPILOT_API_URL            可选的 Copilot API base URL 覆盖
```

`openai-oauth` 用 `auth login openai-oauth` 并把 ChatGPT/Codex refresh token 存进 `<data_dir>/auth.json`；它与 MCP/服务器 bearer 认证、与 OpenAI Platform API key 分离。

`copilot` 用 `auth login copilot` 或 `COPILOT_GITHUB_TOKEN`，经 `/copilot_internal/v2/token` 换取 GitHub 令牌，并带 `vscode-chat` 集成头调用 Copilot Chat。原始 GitHub 令牌不发给 Copilot chat 端点。

**嵌入器环境变量**（选择启用）：
```
AI_MEMORY_EMBEDDING_PROVIDER   openai | voyage | google | gemini | openai-compat
AI_MEMORY_EMBEDDING_MODEL      如 text-embedding-3-small、gemini-embedding-001
AI_MEMORY_EMBEDDING_BASE_URL   可选覆盖；openai-compat 必需
AI_MEMORY_EMBEDDING_DIM        1536（OpenAI）、1024（Voyage）、768（Google）；
                               openai-compat 须显式指定
OPENAI_API_KEY / VOYAGE_API_KEY / GEMINI_API_KEY / GOOGLE_API_KEY
LLM_API_KEY                    自定义 base URL 的 openai 接受；也可作 openai-compat 的
                               可选 bearer 认证
```

`openai-compat` 还要求显式模型，因为自托管引擎没有安全的共享模型或维度默认值。`LLM_API_KEY` 缺失时它不发 authorization 头，且把向量存在独立的 `provider="openai-compat"` 身份下。

## 未来工作

* **M9.5——经 `ort` 的本地嵌入。** 捆绑 `bge-small-en-v1.5` 提供免 API key 的家庭实验室路径。约 200 MB 镜像膨胀；trait 已就绪，只差 `OrtBgeSmallEmbedder` 实现 + 分词器接线。
* **`sqlite-vec` 集成。** 到几千页之前暴力余弦够用；超过后 `sqlite-vec` 扩展是下一步。判定标准见[向量后端策略](/vector-backend-policy/)。
* **计划整编队列。** 遗忘清扫、lint 与自动改进已按服务器侧计划运行；未来的队列可以在钩子延迟之外编译会话摘要。
* **更丰富的 curator 动作。** 发布的 curator 只暂存一页报告；未来可加单独的合并/取代/修链提案，同时保持删除与语义重写评审门控。
* **多 workspace UI / Web 仪表盘。** v1 范围外；无头服务器负载测试后再议。
* **真正的 LongMemEval-S 框架。** 召回评测框架已存在（[`crates/ai-memory-consolidate/tests/recall_eval.rs`](https://github.com/akitaonrails/ai-memory/blob/main/crates/ai-memory-consolidate/tests/recall_eval.rs)）；移植 LongMemEval-S 本身需要数据集。

## 阅读顺序

* 本文件——操作性摘要，你在这里。
* [`docs/design-decisions.md`](/design-decisions/)——完整 v1 规格。
* [`docs/research-karpathy-llm-wiki.md`](/research-karpathy-llm-wiki/)——「忠于 Karpathy」是什么意思。
* [`docs/research-agentmemory.md`](/research-agentmemory/)、[`research-basic-memory.md`](/research-basic-memory/)、[`research-cognee.md`](/research-cognee/)——研究过的先前技术。
* [`docs/auto-improvement-loop.md`](/auto-improvement-loop/)——Hermes Agent 启发的学习循环调研与安全边界。
* [`docs/issues-*.md`](https://github.com/akitaonrails/ai-memory/tree/main/docs)——我们为避免而设计的具体失败模式。
* [`CLAUDE.md`](https://github.com/akitaonrails/ai-memory/blob/main/CLAUDE.md)——钉进 Claude Code 会话的逐会话操作规则。
