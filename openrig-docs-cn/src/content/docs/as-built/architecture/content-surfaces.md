---
kind: as-built
title: 内容呈现面——文件浏览器、原子写入、进度树与引导组合器
status: active
topics: [observability, specification-and-bundles]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解操作员允许列表约束下的文件浏览器如何强制路径安全、原子冲突检测
  写入与 JSONL 编辑审计如何工作、工作区 PROGRESS.md 树如何被索引，或单屏
  引导呈现面（优先级栈 + 路线图栏 + 泳道栏 + 健康门控）如何组合时。
  作者模式模块——此前没有 architecture.md 散文；每一条承重论断都溯源到
  HEAD 的 file:line。
siblings: [workspace-primitive.md, daemon-core.md, ../ui/project-and-for-you.md]
prerequisite-reads: [../README.md, workspace-primitive.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


> **另见（v0.4.4）**：活页笔记（Living Notes）审阅呈现面——在同一个允许
> 列表内容层之上组合出的 intent→plan→delivered 投影——记载于
> [`living-notes-review.md`](/as-built/architecture/living-notes-review/)。


**内容呈现面**（content surfaces）是 Project / Steering UI 所依托的、操作员
允许列表约束且以文件系统为准的读/写层：一个 fail-closed 的文件浏览器、一个
带 JSONL 编辑审计的原子冲突检测写入服务、递归的 PROGRESS.md 树索引器，以及
单屏引导组合器（外加其紧凑的健康摘要门控）。四者都不新增 SQLite 状态。

> **源码直译（AUTHOR-FROM-SOURCE）模块**。此前没有对应的
> `architecture.md` 散文。每一条承重论断都带有
> `> Source: <file:line> @HEAD`；含混之处一律声明为 OPEN 项，绝不抹平。
> 路径相对于 `packages/daemon/src/`，除非以 `packages/` 或 `docs/` 开头。
>
> 已在 HEAD `7eaf524c`（`git describe` → `v0.3.1-6-g7eaf524c`）核实。
> 包版本 **0.3.1**；HEAD 上还有 6 个未发布的 release-0.3.2 提交；不存在
> `v0.3.2` 标签（daemon-core.md；slice-00 §1.1）。
>
> **SPLIT NOTE（§10.6）**。本篇是 `workspace-and-content-primitives` SPLIT
> 的 content-surfaces 半篇（兄弟篇 `workspace-primitive.md` 承载工作区
> 原语 + 迁移 038/039 + missions/projects/slices）。§10.6 的理由与透明
> 记录的偏差披露见 `workspace-primitive.md` 的 § SPLIT NOTE 标题小节。

## 0. 版本归因（取证证明——先读）

按 §10.8，已在 HEAD 经 `git cat-file -e <tag>:<path>` 重新核实：

| 子系统 | 版本 | HEAD 处的取证证明 |
|---|---|---|
| `domain/files/{path-safety,file-write-service}.ts` | **≤0.3.0** | `v0.3.0:<path>` → 存在 |
| `domain/progress/progress-indexer.ts` | **≤0.3.0** | `v0.3.0:<path>` → 存在 |
| `domain/steering/{steering-composer,health-summary}.ts` | **≤0.3.0** | `v0.3.0:<path>` → 存在 |
| `routes/{files,progress,steering,health-summary}.ts` | **≤0.3.0** | `v0.3.0:<path>` → 存在 |

> Source: §10.8 证明已在 HEAD `7eaf524c` 重跑——所列路径在 `v0.3.0` 全部
> 可解析（无失败）。所有内容呈现面都是 **≤0.3.0** 特性（UI Enhancement
> Pack v0 + Operator Surface Reconciliation v0；slice-00 0.3.0-GT §1.7
> “Files / Markdown / Progress / Proofs” 确认该集群随 0.3.0 发布）。
> **不要**把其中任何一项向后归因到 0.3.1——缺口在于缺失 architecture.md
> 散文，而不是新特性。

## 1. 路径安全——fail-closed 允许列表（UI Enhancement Pack v0）

文件浏览器由守护进程强制执行的 **fail-closed** 允许列表把守。根从
`OPENRIG_FILES_ALLOWLIST`（环境变量）解码，为逗号分隔的
`<name>:<absolute-path>` 对（旧版回退 `RIGGED_FILES_ALLOWLIST` 经 `||`
兜底，空字符串会继续向后落）。非法对（无冒号、名字为空、路径非绝对）会被
**静默跳过**；重名 → 后者胜出。为空/未设置 → 无根 → 路由返回空列表并附
结构化的 “configure OPENRIG_FILES_ALLOWLIST” 提示。全新安装后的安全默认值
是**允许列表为空**。

> Source: `domain/files/path-safety.ts:50-51`（环境变量）、`:60-93`
> （`decodeAllowlist` / `readAllowlistFromEnv`；silent-skip L67-71、
> last-wins L78、`||` 回退注释 L89-91）@HEAD。

`resolveAllowedPath(allowlist, rootName, relativePath)` 是承重守卫。
算法：(1) 拒绝未知根（`root_unknown`）；(2) 在文件系统解析**之前**拒绝
表达意图的 `..` 段（`path_escape`）——按段切分，因此 `foo..bar` 不会
误报；(3) 拒绝绝对路径的 `relativePath`（`path_invalid`）；(4) 经
`fs.realpathSync` 解析符号链接，当 realpath 不以 `<canonicalRoot><sep>`
开头时拒绝（`path_escape`）——以 `path.sep` 为边界，因此 `/foo/bar` 不会
匹配 `/foo/bar-other`；(5) `path === ""` 解析到根本身（调用方因此可以列出
根目录）。树**内部**的符号链接正常解析；指向**外部**的符号链接视为逃逸
企图。不存在的候选会回退到未解析的路径，让后续 stat 以具体代码呈现缺失。
`resolveAllowedFile` / `resolveAllowedDirectory` 额外加一条 stat 断言
（`not_a_file` / `not_a_directory`）。

> Source: `domain/files/path-safety.ts:95-171`（`resolveAllowedPath`；
> `..`-先于-fs L124-140、绝对路径拒绝 L141-147、sep 边界 L158-169、
> 空路径基准情形见文档注释 L108-110）、`:173-225`（file/dir 便捷断言）
> @HEAD。

## 2. 原子写入与 JSONL 审计（UI Enhancement Pack v0 第 4 项）

`FileWriteService.writeAtomic(req)` 是面向 `STEERING.md` / `PROGRESS.md` /
规格 YAML / 任何允许列表内文件的可操作写入呈现面。序列：(1) 在允许列表内
解析目标（复用 §1 路径安全）；(2) 对目标重新 stat + 重新哈希——若
`mtime !== expectedMtime` 或 `contentHash !== expectedContentHash`，抛出
`WriteConflictError`，携带**当前**的 mtime + 哈希供 UI 呈现（乐观并发，
不是锁）；(3) 写入**同一目录**下的临时文件（PID + 随机后缀，并发写入不会
相撞）；(4) 重命名前对临时 fd 执行 `fsync` 以确保持久；(5) 对目标做原子
`renameSync`（POSIX 上单次 inode 交换——读侧要么见旧、要么见新，绝无部分
写入）；(6) 重算 mtime + 哈希 + 字节差；(7) 追加一行 JSONL 审计记录。

> Source: `domain/files/file-write-service.ts:9-25`（成文的原子写入
> 语义）、`:111-212`（`writeAtomic`；冲突检测 L129-135、同目录临时文件
> L137-141、fsync L146、原子重命名 L161）@HEAD。

审计文件默认是 `~/.openrig/file-edit-audit.jsonl`（`HOME`/`USERPROFILE` →
`/tmp` 兜底）。**只追加；v0 永不轮转**。审计追加失败会抛出
`FileWriteError("audit_write_failed")`，但**不会**撤销已落地的写入——
用户的编辑已成功；审计系统的偶发故障不得静默回滚正典。（路由仍会把它作为
500 呈现，让失败如实可见，而不是被吞掉。）

> Source: `domain/files/file-write-service.ts:87-91`（默认路径 + 兜底）、
> `:24-25`（v0 永不轮转）、`:182-204`（审计追加；“does NOT undo the
> write” 注释 L183-184）@HEAD。

## 3. files 路由——browse、read、asset、write

`filesRoutes()`（挂载于 `server.ts:507`，路径 `/api/files`）。所有路由都是
**字面**路由（没有 `/:param` 通配），因此顺序不会造成遮蔽问题
（Phase A R1 SSE 教训）：

- `GET /roots`——允许列表根清单（没有时返回 `{roots:[], hint}`）。
- `GET /list?root&path`——目录条目（目录在前、文件在后，按名称排序；
  点文件一律包含——把根列入允许列表即表达了检视意图）。
- `GET /read?root&path`——文件内容 + `mtime` + `contentHash`（SHA-256）+
  `size`。**内容以 `FILE_READ_TRUNCATION_BYTES`（1 MB）为上限**，但哈希对
  **完整**文件计算，因此即使在截断读取时原子写入的冲突检测依然诚实；响应
  携带 `truncated` / `truncatedAtBytes` / `totalBytes`。
- `GET /asset?root&path`——内嵌图片/视频/pdf 的原始字节（推断
  `Content-Type`，5 分钟缓存）。**v0.4.4（OPR.0.4.4.20 FR-5）**：支持
  HTTP **byte range**——单区间形式，`206` + `Content-Range` +
  `Accept-Ranges: bytes`（格式错误/区间不可满足 → `416`）——iOS Safari
  一类的媒体播放需求；且 `.html` 仅在显式 `?render=1` 选择加入时才以
  `text/html` 渲染（默认仍是 text/plain）。slice 证明资产路由
  （`/api/slices/:name/proof-asset/*`）携带相同的区间语义
  （living-notes 更正）。见 [`living-notes-review.md`](/as-built/architecture/living-notes-review/)
  §5。
- `POST /write`——原子写入（§2）；无写入服务时 503
  （`OPENRIG_FILES_ALLOWLIST` 为空）；mtime/哈希过期时 409
  `write_conflict`，携带当前值供 UI 提示刷新。

允许列表依赖未接线时 503 `files_routes_unavailable`。路径安全错误按代码
映射为 HTTP（`root_unknown`/`path_*` → 400，`stat_failed` → 404）。

> Source: `routes/files.ts:51-242`（处理器；路由顺序注释 L17-19、截断
> L139-154、写入 503/409 L187-191/L225-231、路径安全→HTTP `:61-69`）；
> `FILE_READ_TRUNCATION_BYTES = 1_048_576` `:49`；挂载于 `server.ts:507`；
> CLI：没有 `rig files` 子命令——files 是仅 UI 的呈现面 @HEAD。

> **§10.7 路由实况（已在 `packages/ui/src/routes.tsx` 对照源码核实）：**
> `/files` 是 Phase-8.1 调查**漏掉**的**真实路由**（`FilesWorkspace`）。
> **不存在 `/markdown` 路由**——markdown 渲染是文件/抽屉呈现面内部的
> *组件*，不是可导航的目的地。
>
> Source: `packages/ui/src/routes.tsx:192-195`（`path: "/files"` +
> `FilesWorkspace`）；grep 确认 routes.tsx 全文没有任何
> `path: "/markdown"` 声明 @HEAD。

## 4. 进度树索引器（UI Enhancement Pack v0 第 1B 项）

`ProgressIndexer` 遍历操作员允许列表内的扫描根
（`OPENRIG_PROGRESS_SCAN_ROOTS`，与文件允许列表相同的 `<name>:<abs-path>`
形态；旧版 `RIGGED_PROGRESS_SCAN_ROOTS`），找出 **`PROGRESS.md` 与
`STEERING.md`** 文件（按 OSR v0 第 2 项，STEERING.md 被锚定为约束框节点；
行机制本身不关心文件名），并把每个文件解析成一棵复选框层级树。递归有深度
上限（默认 6——足以覆盖 mission/lane/slice 嵌套，又不会下钻进
`node_modules`/`.git`/`.worktrees`/`dist`/`build`/`.turbo`/`.next` 或
点文件）。复选框状态：`[x]` → `done`、`[~]` → `blocked`、`[ ]` →
`active`；标题（`##`–`####`）成为层级行；深度取自 2 空格缩进或标题级别。
每个文件有 `counts`，整个扫描有 `aggregate`。**每次请求都在内存中遍历；
v0 无缓存**（以操作员的允许列表范围为界）。

> Source: `domain/progress/progress-indexer.ts:79-84`（STEERING 锚点 +
> 环境变量）、`:81`（SKIP_DIRS）、`:71`（`DEFAULT_MAX_DEPTH = 6`）、
> `:218-235`（复选框状态映射）、`:204-215`（标题行）、`:21-23`（v0 无缓存）
> @HEAD。

`progressRoutes()`（挂载于 `server.ts:508`，路径 `/api/progress`）：
`GET /tree`——索引后的层级；未接线时 503
`progress_indexer_unavailable`；无根时 503
`progress_scan_roots_not_configured` + 安装提示。

> Source: `routes/progress.ts:18-40`（处理器；503 见 L29-35）；挂载于
> `server.ts:508` @HEAD。

> **§10.7 路由实况**：`/progress` 是一个
> **`<Navigate to="/project" />` 重定向桩**——进度系统位于守护进程的
> `/api/progress` 路由，但 UI 的 URL 归入 Project 标签页（Phase 3）。
>
> Source: `packages/ui/src/routes.tsx:464-468`（“folds into Project tabs
> (Phase 3) — redirect to /project”）@HEAD。

## 5. 引导组合器（Operator Surface Reconciliation v0 第 1 项）

`SteeringComposer.compose()` 是**单屏组合出的引导呈现面**。它有意保持
狭窄：只组合**源自文件系统**的部分；UI 经各自现有的端点获取 PL-005 队列
视图（进行中 / 循环状态）与健康门控，从而让组合器保持可测试。三个来源，
全部从单一工作区根解析（`OPENRIG_STEERING_WORKSPACE`；逐件覆写
`OPENRIG_STEERING_PATH` / `OPENRIG_ROADMAP_PATH` /
`OPENRIG_DELIVERY_READY_DIR` 优先于由根推导的默认值；旧版
`RIGGED_STEERING_WORKSPACE`）：

- **priorityStack**——原样 `STEERING.md` 内容 + mtime + byteCount。
- **roadmapRail**——`roadmap/PROGRESS.md` 的复选框行；识别 `PL-XXX`
  栏目项代码；把**首个未勾选**项标记为 `isNextUnchecked`。
- **laneRails**——`delivery-ready/mode-{N}/PROGRESS.md` 按泳道：复用
  `ProgressIndexer`（maxDepth 3），与 Progress 视图保持完全相同的复选框
  语义；“next pull” = 第一行非 done 且非 blocked 的行（Priority Rail
  Rule——货架/队列的新旧程度**不会**覆写）；top-N（默认 3）优先取
  active+blocked，仅在凑满 N 时才回退到 done。

缺失的来源记入 `unavailableSources`（每项注明能消解它的环境变量），而不是
让整个载荷失败。**至少一个**来源可用时 `isReady()` 即为真。

> Source: `domain/steering/steering-composer.ts:1-25`（有意狭窄的理由 +
> 三来源清单）、`:103-119`（环境变量 + `steeringOptsFromEnv`）、
> `:155-169`（`isReady` / `compose`）、`:198-250`（roadmap 栏；
> next-unchecked L231-235）、`:282-316`（泳道 next-pull L288-289、top-N
> L293-296）、`RAIL_CODE_REGEX` `:346` @HEAD。

`steeringRoutes()`（挂载于 `server.ts:510`，路径 `/api/steering`）：
`GET /`——组合后的载荷；未接线时 503 `steering_composer_unavailable`；
无任何来源可用时 503 `steering_workspace_not_configured`，并给出指向
`rig config init-workspace` / `workspace.steering_path` /
`OPENRIG_STEERING_PATH` 的提示。

> Source: `routes/steering.ts:18-34`（处理器；503 见 L23-29）；挂载于
> `server.ts:510` @HEAD。

> **§10.7 路由实况**：`/steering` 是一个
> **`<Navigate to="/project" />` 重定向桩**——组合器位于守护进程
> `/api/steering`；UI 的 URL 归入 Project 工作区概览标签页（Phase 3）。
>
> Source: `packages/ui/src/routes.tsx:470-474`（“folds into Project
> workspace overview tab (Phase 3) — redirect to /project”）@HEAD。

## 6. 健康摘要聚合器（OSR v0 第 1F 项）

`computeNodeHealthSummary` / `computeContextHealthSummary` 是引导呈现面上
的紧凑健康门控——**在守护进程侧聚合，不是 CLI 外调**（没有每请求子进程）。
节点摘要：按 rig 经 `getNodeInventory` 对 `sessionStatus` +
`lifecycleState` 做跨 rig 汇总，并统计 `attentionRequired` 计数。上下文
摘要：直接读取 `context_usage`（ContextUsageStore 只暴露按节点访问器；
列出全部行是引导呈现面的关切），按紧急度分桶（`usedPercentage` ≥80 为
critical / ≥60 为 warning / 其余为 low / null 为 unknown）+ 新鲜度
（`sampledAt` 年龄对比 300 s → fresh/stale/none）。`context_usage` 表缺失
（未跑迁移的测试运行框架）时返回空摘要，而不是报错。

> Source: `domain/steering/health-summary.ts:44-46`（阈值：
> `FRESHNESS_THRESHOLD_S=300`、`URGENCY_CRITICAL_PCT=80`、
> `URGENCY_WARNING_PCT=60`）、`:48-66`（节点汇总）、`:75-117`（上下文
> 汇总；表缺失 → 空摘要 L81-84）@HEAD。

`healthSummaryRoutes()`（挂载于 `server.ts:511`，路径
`/api/health-summary`）：`GET /nodes`、`GET /context`；rigRepo 依赖未接线
时 503 `health_summary_unavailable`。

> Source: `routes/health-summary.ts:23-44`（处理器；503 见 L33、L40）；
> 挂载于 `server.ts:511` @HEAD。

## 7. 横切性质

- **以文件系统为准，不新增 SQLite**：四个呈现面读写的都是文件系统 +
  JSONL 审计；健康摘要只读取现有的 `context_usage`。没有内容呈现面迁移
  （`progress-indexer.ts:21-23`；`health-summary.ts:81-84`）@HEAD。
- **fail-closed、报错诚实**：路径安全在 fs 解析之前拒绝每一次逃逸企图；
  写入冲突会呈现当前 mtime/哈希供显式刷新；配置缺失时返回 503 + 指明确切
  环境变量的安装提示——绝不静默地空成功（`path-safety.ts:124-169`；
  `file-write-service.ts:129-135`；`routes/steering.ts:25-29`）@HEAD。
- **写入要么原子要么不动**：同目录临时文件 + fsync + 原子重命名；重命名
  失败则目标原封不动（绝无部分写入）（`file-write-service.ts:160-172`）
  @HEAD。
- **组合器狭窄是有意的**：引导组合器只拥有源自文件系统的部分；队列/健康
  来自各自的端点——这让它保持可测试（`steering-composer.ts:6-16`）@HEAD。

## OPEN 项（照录在案，不作抹平）

- **OPEN-A**——`~/.openrig/file-edit-audit.jsonl` 的 JSONL 编辑审计按明确
  设计 **v0 永不轮转**（`file-write-service.ts:24-25`）；无界增长是已知的、
  被接受的 v0 状态（PRD § Item 4 推迟轮转），在此照实陈述而非抹平。
- **OPEN-B**——`OPENRIG_FILES_ALLOWLIST`、`OPENRIG_PROGRESS_SCAN_ROOTS` 与
  `OPENRIG_STEERING_WORKSPACE` 是三个相互独立的操作员配置呈现面，编码相同
  但消解各自独立；v0 没有统一的 “workspace allowlist” 能把它们合而为一。
  源自源码实况；予以记录，不作调和。
- slice-00 的数值漂移 OPEN（1–5）均不适用于本篇——本模块没有任何迁移
  计数/路由分组/PL-004 事件计数论断。
