---
title: "MemPalace 问题与架构综合"
description: "与 ai-memory 哲学相反的本地优先 AI 记忆：逐字存储、永不编译。对话历史与文件被原始分块进「抽屉」（逐字文本）。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/issues-mempalace.md"
---

# MemPalace 问题与架构综合

> 来源：GitHub `MemPalace/mempalace`。
> 2026-05-24 抓取。仓库：52.7k star、MIT、Python、2026-04-05 创建、v3.3.5、241 个开放 issue、约 7 周 1600 个 PR。维护者发布异常坦诚的历史笔记（见 `docs/HISTORY.md`——他们公开撤回过度宣称）。主导主题：**ChromaDB/HNSW/FTS5 在并发写入下的损坏**、**静默持久化失败**、**毁数据的修复工具**、**嵌入模型漂移**。

## MemPalace 是什么（一段话）

与 ai-memory 哲学*相反*的本地优先 AI 记忆：**逐字存储、永不编译**。对话历史与文件被原始分块进「抽屉」（drawer，逐字文本），组织进「翼」（wing，人/项目）与「室」（room，主题），索引进 ChromaDB（SQLite + HNSW 向量索引、384 维 all-MiniLM-L6-v2、零 API 调用）。检索是混合向量 + BM25 加一层「衣柜」（closet）关键词加权。捕获经显式 `mempalace mine`、转录「convo miner」、以及孵化分离 `mempalace mine` 子进程的 Claude Code Stop/PreCompact 钩子。宣称 LongMemEval 上 96.6% R@5（原始、无 LLM）。它是一个真正强的检索系统，其疼痛几乎全在**运维/存储**而非检索。

## 高频痛点（按排名）

### 1. ChromaDB / HNSW / FTS5 的并发写入损坏——绝对主导的主题

这单一簇占了开放 bug 的大多数。根因：**通往同一个 ChromaDB 存储的多条无协调写入路径**——Stop 钩子每次会话结束孵化一个异步 `mempalace mine`、PreCompact 钩子再孵化一个、MCP 服务器在工具调用上写、手工 `mempalace mine` 还可能同时跑。ChromaDB 的 HNSW 索引与 FTS5 影子表在并发写入者之下不安全，且写入中途被杀（压缩期间 SIGTERM / 权限弹窗 / 关窗）留下畸形索引。

- **#1596**——*「Claude Code Stop 钩子每次会话结束异步孵化 `mempalace mine`。多个 Claude 会话同时关闭时……多个 mine 进程在无互斥守卫下启动。这些重叠进程并发写 FTS5 影子表，其中一个中途被杀时……留下畸形的 `embedding_fulltext_search`。」*`PRAGMA integrity_check` 返回 `ok`（行完好）但 `quick_check` 失败（FTS5 索引畸形）→ `repair` 拒绝运行。
- **#1599**——本应修复它的瞬态向量失败缓解之后，活跃写入下 FTS5 损坏依旧复发。
- **#1581**——**单个 Claude Code 会话内**并发 ChromaDB 客户端（MCP 服务器 + 钩子子进程 + 自动摄取 mine）造成的 HNSW 损坏。
- **#1253**——PreCompact 钩子双摄取竞态损坏 HNSW：*「没有 palace 级写锁。」*
- **#1564**——连单写入者清扫都能触发过期 HNSW 隔离。
- **#1514**（社区补丁，中文）——双客户端并发读写：用户自己发布了 `flock + threading.Lock` 双锁补丁。
- **#1343 / #974 / #965**（被引用）——最初「把每个 ChromaDB 写包进 `mine_palace_lock`」的翻新；损坏在边角情形仍存。
- **#1497**（点睛）——一位用户问：*「MemPalace 是否该为多智能体场景推荐单写入者/网关模式？……我们的读法是：`mcp-proxy` 有助于避免每个客户端各孵一个服务器，但它本身不保证所有 palace 变更被串行化。」*他们勾画了网关 → 写队列 → **单写入者**。**他们在一个 issue 里提议的，正是 ai-memory 构造上就有的架构。**

### 2. 静默持久化失败——「归档了 N 个抽屉」却什么都没落盘

写入路径在数据真正持久进 ChromaDB *之前*返回成功。低于 `hnsw:sync_threshold` 时，HNSW 段 + `index_metadata.pickle` 永不冲刷，小型 mine 消失而 CLI 兴高采烈地报成功。

- **#1597**——*「`mempalace mine` 报告 `Drawers filed: 40`……但 chromadb 没有持久化它们。`mempalace status` 一直显示升级前的总数。」*确认不是缓存问题（`mempalace_reconnect` 与过期计数一致）。v3.3.5 说明曾专门宣称*「完整性、恢复与跨进程正确性」*。
- **#1579**——小于 `hnsw:sync_threshold` 的 mine 永不持久化 `index_metadata.pickle`。
- **#1526**——低于批次阈值时静默空索引（HNSW 两种失败模式之一）。
- **#1537**——mine 产出 FTS5 损坏的 palace 时，`mempalace mine` 带满额计数报告 `Done ✓`。
- **#1398**——批量添加后直到 WAL 冲刷前 MCP 检索返回 `Error finding id`；CLI 可用（写后读不一致）。
- **#1489**——请求暴露 `hnsw:sync_threshold`，因为低量 MCP 负载「永不冲刷元数据」。

### 3. 修不好——或主动毁数据——的修复/迁移工具

损坏发生时（主题 1），恢复路径本身不安全。

- **#1394**——*「`mempalace repair --mode legacy` 在 3.3.4 上毁掉 99% 的 SQLite 嵌入行。」*
- **#1545**——`repair --mode from-sqlite`「在规模上结构性损坏：自动隔离在运行中途摧毁重建进度」。
- **#1586**——修复无法恢复 HNSW 维度 + FTS5 的复合损坏（31.3 万抽屉）。
- **#1589**——修复*重建*出的 HNSW 段 ChromaDB 1.5.9 加载不了；损坏段在 `chromadb_rust_bindings` 里 SIGSEGV。
- **#1595**——`mempalace-health.py` 把 `header.bin` 按 uint32 解析 → 万亿元素的 HNSW 损坏静默通过全部检查。
- **#1266**——长时间 mine 后 HNSW pickle 损坏：下次读取「unsupported opcode」；repair/migrate 无法恢复。
- **#1492 / #1493**——`rebuild_index` 确定性地把 `dimensionality=None` 写进 ChromaDB 的 `index_metadata`。

### 4. 设计上的数据丢失——miner 与换库毁掉逐字历史

- **#1593**——*由创始人提交*：「停止重挖即删除——逐字历史绝不该被 MemPalace 的 miner 毁掉。」重挖一个源会先删旧抽屉；对一个整体卖点是「逐字、永不有损」的系统，这是存在级 bug。
- **#1533**——原子换库后首次读取时，MCP 服务器进程毁掉刚换上的 palace 文件（无隔离重挂）。
- **#1341**——无 `SessionEnd` 钩子：短会话干净退出即丢记忆（只有 Stop/PreCompact，且它们不一定触发）。
- **#1535**——`mempalace mine --limit N` 在已挖跳过*之前*截断文件，所以一次运行可以以 0 个新抽屉收场。
- **#1329**——Stop 钩子 → 1.9 **TB** palace 膨胀 + ChromaDB Rust 绑定段错误（逐字存一切且无衰减 → 无界增长）。

### 5. 嵌入模型漂移与可插拔缺口

- **#1561**——「在 palace 集合中持久化并校验嵌入模型元数据」。目前**没有存储的 `{provider, model, dim}` 供不匹配时拒绝**——恰是 ai-memory 不变量 #8 防的失败。
- **#1559**——支持外部嵌入 API（LM Studio、Ollama、OpenAI 兼容）。
- **#1563 / #1261**——嵌入模型硬编码 all-MiniLM-L6-v2；用户想要不改源码的配置驱动切换。
- **#1380**——哈希嵌入回退模式需要真正的 BM25 词法路径。

### 6. 原生绑定 / 平台不稳定（重依赖税）

ChromaDB 拖进 `onnxruntime`、`grpcio`、`numpy` 与一层 Rust 绑定。

- **#1355**——`chromadb_rust_bindings` 在 macOS 26.4 ARM64 上段错误——**`>=1.5.4,<2` 全部版本受影响**。核心依赖上的硬下限。
- **#1247**——Windows ONNX `bad_alloc` + convo mine 崩溃。
- **#1488**——MCP 服务器在 Windows 上遇西里尔/非 ASCII 失败（cp1252 stdin）。
- **#1570**——openai-compat 提供方探测被 Cloudflare 前置端点 403 挡住，因为默认 `Python-urllib` User-Agent。

### 7. MCP 正确性与规模

- **#1574**——缺必需参数时 MCP 返回泛化 `-32000` 而非 `-32602 (Invalid params)`。
- **#1580**——`_expand_with_neighbors` 把共享空 `source_file` 的*无关*块跨 MCP 抽屉缝起来（结果的静默交叉污染）。
- **#1379**——大 palace 上总览工具超时。
- **#1471**——「HNSW 容量分歧」检查在 MCP 服务器里逐请求跑（性能）。

### 8. 捕获噪音（markdown/转录解析）

- **#1333**——`<local-command-*>` 标签与 ANSI 转义活过 `strip_noise()`，污染抽屉（与 basic-memory #738 及我们自己的 Claude-Code 标签剥离同类问题）。

## 制造了最多问题的设计选择

| 设计选择 | 引用 | 症状 |
|---|---|---|
| ChromaDB（SQLite + 二进制 HNSW 段 + FTS5）同时作存储**和**索引 | #1596、#1599、#1581、#1589、#1355 | 索引损坏 + 原生段错误；integrity_check ok 但 quick_check 失败 |
| 多条无协调写入路径（Stop 钩子 + PreCompact 钩子 + MCP + 手工 mine），锁是后补的 | #1596、#1253、#1497、#1514、#1343 | 并发写入损坏；社区自己发布双锁 |
| 持久化推迟到 `hnsw:sync_threshold` 批次；写入先于持久返回 | #1597、#1579、#1526、#1489、#1398 | 「归档 N 抽屉」却没落盘；写后读漏 |
| 无「毁前先进坟场」的 repair/migrate | #1394、#1545、#1586、#1266 | 恢复工具毁掉它本该救的数据 |
| 逐字存一切、无衰减/遗忘 | #1329、#1593 | 1.9 TB palace 膨胀；用重挖即删控制大小 → 历史丢失 |
| 硬编码本地嵌入模型、集合上无 `{model, dim}` 盖戳 | #1561、#1563、#1261 | 无不匹配拒绝；换模型静默漂移 |
| 重的原生 ML 栈（onnxruntime + chromadb_rust_bindings） | #1355、#1247、#1488 | 平台专属崩溃、硬版本下限 |
| 钩子孵化分离 `mempalace mine` 子进程 | #1596、#1253、#1329 | 每机 N 个并发写入者；中途被杀的损坏 |

## ai-memory 怎么对比（逐不变量）

标题：**MemPalace 最大的痛点簇，正是 ai-memory 横切不变量为之存在的那组失败。** 这是对该架构有力的外部验证——由别人的 241 个开放 issue 捕获，而非我们自己的。

| MemPalace 之痛 | 防它的 ai-memory 不变量 |
|---|---|
| #1497/#1514/#1343——辩论/后补单写入者网关；并发写入者损坏 HNSW | **#2 单写入器 SQLite actor。** 所有写入经一个 mpsc 通道，构造使然，M1 起。无需翻新。 |
| #1597/#1579/#1537——「归档 N」却没持久化；写入先于持久返回 | **#3 索引与数据同事务提交。** 无「返回后后台索引」；工具响应阻塞到持久。 |
| #1561/#1563——无存储的嵌入模型身份；换模型漂移 | **#8 `{provider, model, dim}` 存于每个嵌入旁；不匹配即拒绝。** M1 起的 schema 列，启动时强制。 |
| #1394/#1545/#1586——修复工具毁掉它该救的数据 | **#17 Wiki 迁移：无坟场步骤不做破坏性删除**（`_graveyard/<migration>/…`）+ **#10 原子 tmp+rename+fsync**。 |
| #1593/#1533——miner/换库毁掉逐字历史 | **#10 原子文件写入** + git 版本化 wiki（M5）：每次页面变更是一个提交，可经 `git` 恢复。 |
| #1355/#1247/#1488——原生 ONNX + Rust 绑定段错误、平台下限 | **捆绑 `rusqlite`（静态）、纯 Rust、零 LLM 默认路径（#13）。** 向量（sqlite-vec）正是为避开这类依赖风险才推迟到 v0.2。 |
| #1596/#1253——钩子孵化 N 个并发写入者子进程 | **#5 钩子即发即忘 POST 到一个服务器**配一个写入器 actor——绝不是每事件一个进程。 |
| #1329——逐字一切 → 1.9 TB 膨胀 | **Karpathy 编译而非囤积** + **M8 衰减/遗忘清扫** + 日志轮换。我们压缩，不永远累积原始。 |
| #1574——错误的 JSON-RPC 错误码 | rmcp 类型化 `McpError` 变体。（值得抽查我们是否正确映射参数错误——见「gotchas」。） |

## ai-memory 可以从 MemPalace 学/偷什么

这些是值得头脑风暴的真正有用想法——**尚未采纳**。

1. **编译 wiki 之下垫一层逐字召回作安全网。** 这是最深的想法。MemPalace 证明*原始文本 + 本地语义检索*在 LongMemEval 上零 LLM 拿到 96.6% R@5。ai-memory 把观察编译成 wiki 页面——信号更高但**有损**：整编可能丢掉用户后来需要的细节。我们已经保留不可变的 `raw/` 会话日志。向量落地时（v0.2），我们可以在编译 wiki 落空时把裸观察日志上的语义检索暴露为*回退召回路径*——「编译优先、逐字回退」。两种哲学之长。
2. **LongMemEval 作一等公民的诚实评测（我们的 M10）。** MemPalace 接好了评测框架并在 `docs/HISTORY.md` 里*发布留出集 R@5 与撤回*。他们的 `tests/test_readme_claims.py`——公开宣称没有代码背书就让构建失败的测试——是个聪明、可偷的模式。建 M10 时采纳该方法论（留出集切分、不追头条数字）。
3. **幂等、可续跑摄取的确定性 ID。** MemPalace 的清扫器用 `session_id + message_uuid` 确定性抽屉 ID 加游标，让崩溃的 mine 无重复续跑。我们的钩子摄取可为重放安全采纳同样的。
4. **轻量时间知识图谱三元组**（主/谓/宾 + 显式失效的 `valid_from`/`valid_to`）。我们有 `links` 表；MemPalace 的 KG（`knowledge_graph.py`）及其 #1416「每天结束时把抽屉论断晋升进 KG 三元组」与我们的整编押韵。可以是「随时间变化的事实」（现在谁拥有 X vs 以前）的未来层。
5. **索引健康监控 + 修复路径——安全地做。** sqlite-vec 在 v0.2 落地时，监控索引健康（MemPalace 的链接数据比守卫很聪明）**并**让修复坟场先行。他们的 #1394/#1595 是警世故事：毁行的修复、解析错字段而放过万亿级损坏的健康检查。
6. **透明的基准/宣称文化。** 记录更正的 `HISTORY.md` 比干净的营销页建立更多信任。值得效仿。

## MemPalace 踩过、要避开的坑（给我们 v0.2 向量工作的告诫）

- **持久提交之前绝不报告「已索引/已保存」**——向量也一样。MemPalace #1597 就是整部电影。不变量 #3 已覆盖；sqlite-vec 写入落地时保持铁打。
- **给集合盖 `{provider, model, dim}` 戳、不匹配即拒绝。** MemPalace #1561 展示了不做的代价。我们有了——别回退。
- **任何重嵌入/重建索引路径必须先坟场后删除。** MemPalace #1394 在一次「修复」里毁掉 99% 的行。不变量 #17 已强制；向量重建同样适用。
- **钩子保持单写入者即发即忘。** 负载之下绝不为每事件孵化一个 worker（MemPalace #1596）。我们的设计安全；保持住。
- **盯着裸日志增长。** 逐字利于召回但 #1329 撞到 1.9 TB。我们的编译 + 衰减 + 日志轮换是解药——但若加逐字召回层（想法 #1），从一开始就给它留出保留预算。
- **抽查 MCP 参数错误码。** MemPalace #1574 缺参数时返回错误的 JSON-RPC 码。确认 rmcp 把我们的缺失/无效参数映射到 `-32602` 而非泛化内部错误。（验证；别假设。）

## 非技术坑：供应链/冒名域名

`docs/HISTORY.md` 与 README 顶部横幅记录了一次真实事故：MemPalace 走红后，**冒名域名（`mempalace.tech` 等）出现并以项目名义分发恶意软件**。他们的缓解是大声警告「唯一官方来源是 GitHub + PyPI + mempalaceofficial.com」。给 ai-memory 的教训：获得关注时，预期名字、安装一行流（`curl … | sh`）与 Docker 镜像的 typosquat。廉价的预防动作：占住显眼域名、文档写清*唯一*官方安装来源（GitHub 仓库、`akitaonrails/ai-memory` Docker Hub 镜像、`main` 上的裸包装器 URL）、并钉住/签名发布让用户可验证。这是我们现在还没有的「走红项目」问题——但预防是免费的。

## 结论

MemPalace 是一个强、流行、测试充分的检索引擎，有聪明的逐字哲学与令人钦佩的诚实维护者——而它**正淹死在 ai-memory 从第一个里程碑就绕开的那类存储/并发/持久性失败里**。从中带走的最有用之物不是修复而是功能想法：编译 wiki 之下的*逐字语义召回回退*，让我们得到 MemPalace 的无损召回而不继承它的 ChromaDB 损坏面。作为宽慰带走的最有用之物：我们的不变量 #2、#3、#8、#10、#17 不是过度设计——它们正是别人正经历着的 241 个开放 issue。
