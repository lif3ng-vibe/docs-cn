---
kind: as-built
title: 内容层——插件、智能体镜像、上下文包与压缩策略
status: active
topics: [extension-and-user-workspace, continuity, skill-management]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解 OpenRig 如何发现插件、捕获/分叉智能体镜像、组装/发送
  上下文包，或 Claude auto-compaction 强制器如何决定发送 /compact。
  作者模式模块——此前没有 architecture.md 散文；每条论断都在 HEAD
  处溯源到 file:line。
siblings: [packaging-bootstrap-bundles.md, agent-spec-and-startup.md]
prerequisite-reads: [../README.md, agent-spec-and-startup.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


守护进程发现并提供四个以文件系统为权威的内容原语：**插件**、**智能体镜像**、**上下文包**（context pack），以及 **Claude auto-compaction 策略强制器**。无一新增 SQLite 状态——全部以文件系统为权威，守护进程仅持有内存缓存。

> **AUTHOR-FROM-SOURCE 模块**：此前不存在对应的 `architecture.md` 散文。每条承重论断都带 `> Source: <file:line> @HEAD`；含糊之处声明为 OPEN 项，绝不粉饰。路径相对 `packages/daemon/src/`，除非以 `docs/` 开头。
>
> 已在 HEAD `7eaf524c` 验证（`git describe` → `v0.3.1-6-g7eaf524c`）。包版本 **0.3.1**；HEAD 带 6 个未发布的 release-0.3.2 提交；没有 `v0.3.2` 标签（daemon-core.md；slice-00 §1.1）。

## 0. 发布归属（取证接缝——先读本节）

已在 HEAD 经 `git cat-file -e <tag>:<path>` 重新验证：

| 子系统 | 发布版本 | @HEAD 取证证据 |
|---|---|---|
| 上下文包 | **0.3.0** | `v0.3.0:domain/context-packs/context-pack-library-service.ts` → 存在（slice-00 0.3.0-GT §1.9） |
| 智能体镜像 | **0.3.0** | `v0.3.0:domain/agent-images/agent-image-library-service.ts` → 存在（slice-00 0.3.0-GT §1.9） |
| 插件 | **0.3.1，非 0.3.0** | `v0.3.0:domain/plugin-discovery-service.ts` → **缺席**；`v0.3.1:` → 存在（slice-00 0.3.0-GT seam (a)；map row 5） |
| Claude auto-compaction | **0.3.1 头条，无 0.3.0 前身** | `v0.3.0:domain/claude-compaction-enforcer.ts` → **缺席**；`v0.3.1:` → 存在（slice-00 0.3.0-GT map row 7） |

> 来源：在 HEAD `7eaf524c` 重跑——`git cat-file -e v0.3.0:packages/daemon/src/domain/plugin-discovery-service.ts` 与 `...claude-compaction-enforcer.ts` 均失败（"exists on disk, but not in 'v0.3.0'"）；两个 0.3.0 库服务在 `v0.3.0` 处可解析。HEAD 磁盘上存在代码并不意味着插件/压缩是 0.3.0 特性——祖先关系才是真相；同一天的提交日期正是 slice-00 0.3.0-GT seam (a) 警告的取证陷阱。

**不要把插件或压缩回溯归属到 0.3.0**。CLI 参考已经编码了这一点（"## Plugin Inspection (v0.3.1)"）。

> 来源：`docs/as-built/cli-reference.md:943` @HEAD。

## 1. 上下文包（PL-014）——0.3.0

**上下文包**（context pack）是一个目录，内含 `manifest.yaml` 加随附的 markdown / yaml / txt 文件：由操作者编写、库可发现、可审阅、可组合。`rig context` 名词本身不含投递。没有 SQLite 表；daemon 作用域的内存缓存。

> 来源：`domain/context-packs/context-pack-types.ts:1-11` @HEAD。

`ContextPackLibraryService.scan()` 遍历各根目录，解析每个 `manifest.yaml`，替换内存索引；冲突按发现顺序**后者胜出**（workspace > user_file > builtin）。启动时接线内置根（`../context-packs`，最先）、配置的 user-file 根（`context.root`，默认 `$OPENRIG_HOME/context`）、其 `system/` 子目录作为规范的 System World 根，以及工作区本地的 `<workspaceRoot>/.openrig/context-packs` 根（存在且不重复时）。包由其类路径的 **ref** 寻址（例如 `packs/compaction-restore`），ref 即其唯一身份；不透明条目 id 是 `context-pack:<ref>`（UI 路由键）。冒号 id `context-pack:<name>:<version>` 寻址与 `/library/:id` 路由已在 Slice-03 Atom 5 移除。解析仅经 `getByRef` 与 read/delete/preview/pieces 路由族按 ref 进行。启动只接受普通文件并拒绝 context-pack 展开；先组合出持久 ref，确需投递时再用专门的投递动词。

> 来源：`domain/context-packs/context-pack-library-service.ts:59-94`（scan；last-wins L79-81）、`:31-33`（id）；`startup.ts`（`contextPackLibrary` 构造）@HEAD。

解析器是纯函数（无 fs；调用方传入原始 YAML）。它拒绝格式错误的 YAML、缺失的 `name`/`version`、非数组 `files`、逐文件路径穿越（`..`/前导 `/`）以及不支持的后缀（`.md .markdown .yaml .yml .txt`）；`version` 强制转为字符串。每文件 token 估算为 `ceil(bytes/4)`。

> 来源：`domain/context-packs/manifest-parser.ts:11`（后缀）、`:13-121`（拒绝项；路径穿越 `:83-89`）；token 估算 `context-pack-library-service.ts:46-48` @HEAD。

`assembleBundle` 把文件拼接为一个可直接粘贴的字符串，以 `# OpenRig Context Pack: <name> v<version>` 框住，加可选 purpose 与 `## File: <path> (role: <role>)` 头。缺失文件**被跳过并在 `missingFiles` 中浮现**（供操作者修复），而非硬失败；存在但不可读的文件抛出 `file_read_failed`。

> 来源：`domain/context-packs/bundle-assembler.ts:38-39`（前缀）、`:73-100`（缺失跳过 L74-76；读失败抛出 L81-87）@HEAD。

`contextPacksRoutes()` 暴露一个以 ref 为主、无投递的库呈现面：`GET /library`、`POST /library/sync`、`POST /library/compose`、`GET/DELETE /library/by-ref`、`GET /library/by-ref/preview` 与 `GET /library/by-ref/pieces`。preview 返回组装后的审阅形状；pieces 返回按序的成员内容加整段纯文本与字节大小。不存在包自有的投递路由。CLI 库动词是 `rig context compose|list|show|preview|sync|add|rm`；投递属于 `rig send --context`、`rig broadcast --context`、`rig walk --through` 与 `rig queue create --body-context`。

> 来源：`routes/context-packs.ts`（完整路由表）；`domain/startup-validation.ts`（仅普通文件的启动契约）；`packages/cli/src/commands/context.ts`、`send.ts`、`broadcast.ts`、`walk.ts` 与 `queue.ts` @HEAD。

## 2. 智能体镜像（PL-016）——0.3.0

**智能体镜像**（agent image）是一个高产出席位可恢复状态的快照束：运行时专属的 resume token（Claude `resume_token` / Codex `thread_id`）、源席位 lineage、可选 cwd 增量 + 备注。可被 AgentSpec `session_source: mode: agent_image` 消费。以文件系统为权威，位于 `~/.openrig/agent-images/<name>/` 加工作区本地；**没有 SQLite 表**。

> 来源：`domain/agent-images/agent-image-types.ts:1-13` @HEAD。

`AgentImageLibraryService` 镜像了 `ContextPackLibraryService`（scan / list / get / last-wins），带三处源码声明的差异：`sourceResumeToken` 透传给消费者（instantiator 消费；操作者呈现面脱敏）；`stats.json` 是单独的可变文件，fork 计数递增时原子更新；一个 `.pinned` 哨兵使其免于 prune。Id 为 `agent-image:<name>:<version>`。

> 来源：`domain/agent-images/agent-image-library-service.ts:5-14`（3 差异注释）、`:38-41`（id）@HEAD。

`discoverResumeToken(db, sourceSession)` 先查 `sessions` 再查 `nodes`，返回类型化失败（`session_not_found`/`runtime_unsupported`）而非编造 token；只有 `claude-code`/`codex` 拥有原生分叉原语。Claude 优先取 `context_usage.session_id` 而非持久化的 `sessions.resume_token`；Codex 用 `resume_token`，对 `external_cli` 席位回退到绑定的 `external_session_name`；都没有时诚实地返回 `nativeId: null`。

> 来源：`domain/agent-images/resume-token-discovery.ts:37-85`（诚实 null L84；Claude 优先 L64-69；external_cli L78-83）；诚实性注释 `:9-10` @HEAD。

`SnapshotCapturer.capture()` 经 `discoverResumeToken` 路由，失败或缺原生 id 时抛出 `AgentImageError`（不编造 token，不自动回退到全新会话），经 `install()` 写入 manifest + 空 `stats.json`，再重新扫描。捕获的 `nodeCwd` → manifest `source_cwd`，于是 Use-as-starter 片段会产出 `cwd:`（分叉从父会话所在目录启动，Claude 的 jsonl 按项目目录划分）；daemon 在分叉派发时不覆盖 cwd。

> 来源：`domain/agent-images/snapshot-capturer.ts:60-104`（抛出 L65-79；source_cwd L88-93；install+scan L101-102）；`routes/agent-images.ts:256-265`（不覆盖 cwd 契约）@HEAD。

**证据守卫（CATASTROPHIC 弹回；fail-closed）**。`evaluateProtection()` 在任一条件成立时保护镜像不被删除：已固定（pinned）；被某个活跃 `agent.yaml` 引用；被某个 rig spec 引用；或是受保护镜像的 lineage 后代（传递闭包，不动点迭代）。Spec 根扫描解析 YAML 结构（非字符串 grep），并刻意保守——假阳性（过度保护）可接受；假阴性等于灾难性数据丢失。`--force` / `?force=true` 可覆盖。

> 来源：`domain/agent-images/evidence-guard.ts:1-16`（弹回 + fail-closed）、`:53-115`（直接 + 传递；不动点 L92-112）、`:117-122`（保守）@HEAD。

**路由边界处的 resume token 脱敏（承重）**。`/api/agent-images` 在每个面向操作者的路径上把 `sourceResumeToken` 脱敏为 `"(redacted)"`；token **绝不经网络返回**；只有进程内的 rigspec-instantiator 消费真实 token。

> 来源：`routes/agent-images.ts:15-17` + `:44-46`（`redactResumeToken`），应用于 `:60`、`:67`、`:94`、`:161`；slice-00 0.3.0-GT §1.9 将此标记为承重 @HEAD。

`agentImagesRoutes()`（挂载于 `server.ts:483-485`）：`GET /library`、`POST /library/sync`、`GET /library/:id`、`GET /library/:id/preview`、`POST /library/:id/pin`、`POST /library/:id/unpin`、`DELETE /library/:id`（除 `force=true` 外受证据守卫）、`POST /snapshot`、`POST /prune`（**默认 dry-run**，`dryRun !== false`）；守卫的 `specRoots` 经 `deps.agentImageSpecRoots` 注入。CLI：`rig agent-image list|show|preview|create|delete|pin|unpin|prune|sync`。

> 来源：`routes/agent-images.ts:54-250`（路由表；prune 默认 L112；删除守卫 L224-239）；`server.ts:483-485`；`docs/as-built/cli-reference.md:895-912` @HEAD。

## 3. 插件（plugin-primitive Phase 3a）——**0.3.1，非 0.3.0**

> **取证陷阱（slice-00 0.3.0-GT seam (a)）**：插件发现文件的首次创建提交日期与 0.3.0 发布提交同日，但不是 `v0.3.0` 的祖先。插件是 **0.3.1**。已由 §0 的标签存在性测试在 HEAD 重新确认。

`PluginDiscoveryService` 是只读的文件系统聚合器——没有 SQLite，没有变更路由（SC-29 EXCEPTION #8，源码文件头逐字声明）。它扫描四种来源并带来源标签取并集：vendored（`~/.openrig/plugins/<id>/`）、Claude 缓存（`~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`）、Codex 缓存（`~/.codex` 下同样结构）与 rig-cwd（`<cwd>/.claude/plugins/*` + `<cwd>/.codex/plugins/*`）。检测 = 存在 `.claude-plugin/plugin.json` 和/或 `.codex-plugin/plugin.json`（其中声明 `runtimes`）。Slice 28 在 list 响应中加入 `skillCount`（readdir `<plugin>/skills/`），使索引页避免 N+1 的详情拉取（SC-29 EXCEPTION #11，逐字）。

> 来源：`domain/plugin-discovery-service.ts:1-29`（SC-29 #8 + scan 描述）、`:39`（4 类 `PluginSourceKind`）、`listPlugins` `:205-276`（4 个扫描块）、`scanCwdBundledPlugins` `:283-307`、`detectPlugin` `:393-453`（标记规则 L399-404；`skillCount` L433-451 + #11 L75-80）@HEAD。

`getPlugin(id)` 返回详情（manifest + skills + hooks + MCP 服务器）；`rig-cwd:` id 可自解析（从 id 前缀中解析出 cwd 并重新扫描，因此 `/api/plugins/:id` 不会对 `?cwd=` 返回的 id 404）。`findUsedBy(id)` 遍历 `agent.yaml` 文件，解析 YAML 结构（非字符串 grep——注释不会误报），收集 `resources.plugins[].id` 与引用它的 profile。

> 来源：`domain/plugin-discovery-service.ts:309-369`（getPlugin；rig-cwd 自解析 L310-321）、`extractCwdFromRigCwdId` `:466-479`、`findUsedBy` `:371-389`、`readResourcesPlugins` `:599-615`、`readProfilesUsingPlugin` `:617-633`（结构解析非 grep `:20-23`）@HEAD。

`PluginVendorService.ensureLatest()` 先跑 `ensureVendored`（从 `packages/daemon/assets/plugins/<name>/` 到 `~/.openrig/plugins/<name>/` 的 hash 跳过式幂等复制），再跑 `attemptAutoFetch`（`github.com/mvschwarz/openrig-plugins`，5 秒超时，**404/网络/超时静默容忍**——vendored 始终是回退；上游仓库在 v0 刻意为空，404 是常态；v0 不做 tarball 解压）。启动时为 `openrig-core` 接线。

> 来源：`domain/plugin-vendor-service.ts:1-24`、`ensureVendored` `:80-103`（hash 跳过 L97-99）、`attemptAutoFetch` `:111-131`（404 容忍 L116-117；不解压 L123-125）、`ensureLatest` `:138-141`；`startup.ts:434-472` @HEAD。

`pluginsRoutes()`（挂载于 `server.ts:478`，只读）：`GET /`（过滤器 `?runtime=`、`?source=`、`?cwd=`）、`GET /:id/used-by`、`GET /:id/files/list?path=`、`GET /:id/files/read?path=`（slice 28 文档浏览器）、`GET /:id`。字面子路径挂载在裸 `/:id` 兜底路由**之前**（路由顺序纪律）。文件端点复用路径安全机制，以发现的插件绝对路径作为合成的单根允许列表（操作者无需在 `OPENRIG_FILES_ALLOWLIST` 中声明插件路径；插件目录在 v0 只读，因此内容 hash 仅供参考）。CLI：`rig plugin list|show|used-by|validate`；v0 没有 `install` 动词（推迟到 0.3.2）。

> 来源：`routes/plugins.ts:29-39` + `:107-231`（路由表；兜底前 L128-130/L141-142；`pluginRootAllowlist` :74-92；只读 hash L182-184）；`server.ts:478`；`docs/as-built/cli-reference.md:943-963` @HEAD。

> **OPEN-A**——`parseSourceFilter`（`routes/plugins.ts:69-72`）只接受 `vendored|claude-cache|codex-cache`；它不接受 `rig-cwd`，尽管 `PluginSourceKind`（`domain/plugin-discovery-service.ts:39`）与 `ListPluginsOpts.sourceFilter` 包含它。`?source=rig-cwd` 在路由处被静默丢弃，而 `?cwd=` 仍不加过滤地呈现 rig-cwd 条目。按原样陈述；意图（rig-cwd 只能经 `?cwd=` 访问）还是过滤器缺口，仅凭源码无法裁定。

## 4. Claude auto-compaction 强制器（slice 27）——**0.3.1 头条**

> **无 0.3.0 前身（slice-00 0.3.0-GT map row 7）**。enforcer 文件在 `v0.3.0` 不存在，在 `v0.3.1` 存在（§0）。

`ClaudeCompactionEnforcer.maybeAutoCompact()` 逐席位决定 `ContextMonitor` 是否应发送 `/compact`，由操作者的 `policies.claude_compaction.*` 设置驱动。与 `ContextMonitor` 的调度解耦；启动时 `ContextMonitor` 连同 enforcer 一起构造。

> 来源：`domain/claude-compaction-enforcer.ts:7-12`、`maybeAutoCompact` `:205-331`；`startup.ts:1191-1199`（enforcer → `new ContextMonitor(db, contextUsageStore, claudeAdapter, compactionEnforcer)`）@HEAD。

**防御性契约**（源码按已入库的权限层 foot-gun 规则把压缩生命周期归类为承重）：

- **选择性加入，默认关闭**：`enabled=false` → 永不触发。
- **运行时过滤**：仅当 `runtime === "claude-code"` 时触发。
- **无效策略 = 禁用**：手工编辑出的非整数或超出 `[1,100]` 的 `thresholdPercent` 视为禁用（朝更安全的失败方向）。
- **经阈值穿越重新武装**：会话必须先降到阈值以下，下一次 auto-compact 才会触发；窗口状态不持久化（重启即重置——朝更安全的失败方向）。
- **发送失败优雅降级**：返回 `{ triggered: false, reason: "send_failed" }`，绝不抛出；去重时间戳仅在发送成功时设置，因此瞬时失败会在下一个 tick 重试。

> 来源：`domain/claude-compaction-enforcer.ts:14-44`（风险类 + 契约）、runtime `:206-208`、无效策略 `:224-232`、去重/阈值 `:285-300`、发送失败 `:312-314`/`:323-325` @HEAD。

**主动握手状态机**（Claude hooks 能提供上下文但不能创建新的助手回合）：(1) **压缩前准备**——首个符合条件的高于阈值 tick 发送一条普通用户通道的准备提示；状态 → `prep_prompt_sent`。(2) **/compact**——下一个符合条件的 tick 发送 `/compact <instruction> + trust-channel bridge note`；设置去重时间戳 + `triggeredAboveThreshold`；把 post 阶段 `turn_boundary` 入队。(3) **压缩后、低于阈值**——分阶段发送 `turn_boundary`（仅确认）→ `restore_prompt`（指向待定标记 `<openrigHome>/compaction/restore-pending/<key>.json`，以及 transcript / session-id 回退）→ `compliance_prompt`（阅读深度审计）；最后阶段设置恢复后冷却 + 清除高于阈值锁存。

> 来源：`domain/claude-compaction-enforcer.ts:71-77`（compact+bridge）、`:79-98`（准备）、`:108-145`（恢复 + 标记路径）、`:147-163`（合规）、`:165-171`（回合边界）、状态机 `:233-330`（低于阈值 L233-283；高于阈值 L302-330）@HEAD。

策略字段经 `SettingsStore.resolveClaudeCompactionPolicy()`：`enabled`、`thresholdPercent`、`preCompactInstruction`、`compactInstruction`、`messageInline`、`messageFilePath`、`postRestoreAuditInstruction`——每个都由一个 `policies.claude_compaction.*` 键 + `OPENRIG_POLICIES_CLAUDE_COMPACTION_*` 环境变量覆盖支持。默认值：去重 `60_000` ms；压缩后恢复冷却 `10 * 60_000` ms。

> 来源：`domain/user-settings/settings-store.ts:553-565`（解析器）、键 `:97-103`、env `:145-151`；`domain/claude-compaction-enforcer.ts:45-46`（默认窗口）@HEAD。

## 5. 横切属性

- 四者皆**以文件系统为权威，不新增 SQLite**；daemon 缓存在内存；压缩窗口状态刻意不持久化（context-pack-types.ts:8-11；agent-image-types.ts:12-13；routes/plugins.ts:6；claude-compaction-enforcer.ts:26-29）@HEAD。
- **诚实失败，不编造**——发现返回 null；捕获器抛出；强制器降级且绝不抛出；证据守卫 fail-closed（resume-token-discovery.ts:9-10；snapshot-capturer.ts:11-12；claude-compaction-enforcer.ts:30-33；evidence-guard.ts:16）@HEAD。
- **未提供即 503** 是后端服务不在 context 中时统一的路由模式（routes/context-packs.ts:31；routes/agent-images.ts:59；routes/plugins.ts:113）@HEAD。

## OPEN 项（沿用，不粉饰）

- **OPEN-A**——插件 `?source=` 过滤器缺 `rig-cwd`（§3）；意图还是过滤器缺口，仅凭源码无法裁定。
- 不适用任何 slice-00 数字漂移 OPEN（1–5）——本模块不携带迁移 / 路由组 / PL-004 事件计数。Slice-00 0.3.0-GT OPEN-3（For-You 动词子集）不在范围内（UI 呈现面，非内容层）。
