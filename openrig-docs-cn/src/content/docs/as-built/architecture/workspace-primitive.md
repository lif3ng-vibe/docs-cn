---
kind: as-built
title: 工作区原语——RigSpec.workspace、迁移 038/039 与 missions/projects/slices
status: active
topics: [specification-and-bundles, observability]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解 rig 如何声明一个类型化工作区（workspaceRoot / repos /
  defaultRepo / knowledgeRoot）、该块如何持久化并解析进 whoami /
  node-inventory、逐条目 target_repo scope 如何校验，或基于文件的
  missions/slices 树如何被索引并投影进 Project UI。作者模式模块——
  此前没有 architecture.md 散文；每条承重论断都在 HEAD 处溯源到
  file:line。
siblings: [content-surfaces.md, daemon-core.md, ../ui/project-and-for-you.md]
prerequisite-reads: [../README.md, daemon-core.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


**工作区原语**（workspace primitive，PL-007）是一个类型化声明，让 rig 命名*其工作所在之处*——一个工作区根、一组带 kind 的命名 repo、一个可选默认 repo、一个可选 knowledge 根——并把这些内容经 `whoami` / node-inventory 呈现，同时闸控逐条目的 repo scope。与之并列，一个**基于文件的 missions/slices 树**被只读索引，并投影进 Project UI 的 mission / slice 呈现面。

> **AUTHOR-FROM-SOURCE 模块**：此前不存在对应的 `architecture.md` 散文。每条承重论断都带 `> Source: <file:line> @HEAD`；含糊之处声明为 OPEN 项，绝不粉饰。路径相对 `packages/daemon/src/`，除非以 `packages/` 或 `docs/` 开头。
>
> 已在 HEAD `7eaf524c` 验证（`git describe` → `v0.3.1-6-g7eaf524c`）。包版本 **0.3.1**；HEAD 带 6 个未发布的 release-0.3.2 提交；没有 `v0.3.2` 标签（daemon-core.md；slice-00 §1.1）。
>
> **拆分说明（§10.6）**：`workspace-and-content-primitives`（proposed-structure.md §4.9 / D13）的诚实、有源码支撑的范围超过约 400 行，横跨两个来源根不同、彼此独立的子系统簇。按 §10.6 拆分指令，按子系统簇拆分为本模块（工作区原语 + 迁移 038/039 + missions/projects/slices）与姊妹篇 `content-surfaces.md`（files/markdown/progress/steering）。这是对已批准 Q7 "18" 的透明记录在案的偏离，是创始人自己已批准的 Q3 原则（"distinct primitive / distinct source root → split"）的忠实应用；在 slice-08 审查闸口提出，不是执行中途的打断。

## 0. 发布归属（取证证据——先读本节）

按 §10.8，已在 HEAD 经 `git cat-file -e <tag>:<path>` 重新验证：

| 子系统 | 发布版本 | @HEAD 取证证据 |
|---|---|---|
| `domain/workspace/{workspace-resolver,frontmatter-validator,default-workspace-scaffold}.ts` | **≤0.3.0** | `v0.3.0:<path>` → 存在 |
| 迁移 `038_workspace_primitive.ts`、`039_queue_target_repo.ts` | **≤0.3.0** | `v0.3.0:<path>` → 存在 |
| `domain/slices/{slice-indexer,slice-detail-projector}.ts` | **≤0.3.0** | `v0.3.0:<path>` → 存在 |
| `routes/{workspace,slices,projects}.ts` | **≤0.3.0** | `v0.3.0:<path>` → 存在 |
| `domain/workspace/getting-started-narrative.ts` | **0.3.1** | `v0.3.0:` → **缺席**；`v0.3.1:` → 存在 |
| `routes/missions.ts` | **0.3.1** | `v0.3.0:` → **缺席**；`v0.3.1:` → 存在 |

> 来源：§10.8 证据在 HEAD `7eaf524c` 重跑——`git cat-file -e v0.3.0:packages/daemon/src/domain/workspace/getting-started-narrative.ts` 与 `...routes/missions.ts` 均失败（"exists on disk, but not in 'v0.3.0'"）；其余所列路径都在 `v0.3.0` 处可解析。工作区原语本身是 **0.3.0** 特性（slice-00 0.3.0-GT §1.4，PL-007，迁移 038/039）——不要把它回溯归属到 0.3.1。`missions` 路由 + getting-started 叙事脚手架是其上叠加的 **0.3.1** 新增（slice 12 mission scope；slice 21 onboarding-conveyor）。

slice-00 0.3.0-GT §1.4 独立确认该原语随 0.3.0 交付：workspace-primitive 合入提交 `2ce54abc`（PL-007），带迁移 `038_workspace_primitive` + `039_queue_target_repo`，"fresh databases apply migrations through `039_queue_target_repo`"。

## 1. 类型化工作区声明（PL-007）——0.3.0

`RigSpec.workspace` 是**可选的**类型化块。没有它的 rig 仍然有效；此时 `whoami` / node-inventory 返回 null 的 workspace 块。

> 来源：`domain/types.ts:762-770`（`WorkspaceSpec`）、`:751-758`（`WorkspaceRepoSpec`）、`:780`（`RigSpec.workspace?`）@HEAD。

| 字段 | 形状 | 说明 |
|---|---|---|
| `workspaceRoot` | string | 从 spec 逐字取用 |
| `repos[]` | `{ name, path, kind }[]` | `path` 在解析时转为绝对路径；作者可在 YAML 中声明相对 `workspaceRoot` 的路径 |
| `defaultRepo?` | string | 无 env 覆盖 / cwd 匹配时的活跃 repo |
| `knowledgeRoot?` | string | 呈现时视为 `kind=knowledge` |

`WorkspaceKind` 是封闭的 5 成员联合：`user`、`project`、`knowledge`、`lab`、`delivery`。

> 来源：`domain/types.ts:748-749`（`WORKSPACE_KINDS` / `WorkspaceKind`）@HEAD。

### 1.1 持久化——迁移 038 + RigRepository

迁移 **038** 为 `rigs` 表加入 `workspace_json TEXT`。当 rig 声明了类型化 `RigSpec.workspace` 块时，它以 JSON 保存该块；没有 workspace 块的 rig 为 NULL。

> 来源：`db/migrations/038_workspace_primitive.ts:16-21`（`ALTER TABLE rigs ADD COLUMN workspace_json TEXT`）；文档注释 `:3-14` @HEAD。

`RigRepository.setRigWorkspace(rigId, workspace)` 持久化它（UPDATE `workspace_json` + `updated_at`）；`getRigWorkspace(rigId)` 读回它，JSON 解析为 `WorkspaceSpec`，解析失败时返回 `null`。当列不存在时两者都是**防御性 no-op**（`hasRigColumn` 探测）——绕过规范迁移清单的旧测试装置没有该列；setter 的契约是"尽力持久化"。

> 来源：`domain/rig-repository.ts:98-105`（setter，列探测 L99）、`:106-117`（getter；解析失败 → null L114-116）@HEAD。

例化器在 rig 创建时**仅在声明了的情况下**持久化该块：

> 来源：`domain/rigspec-instantiator.ts:653-655`（`if (rigSpec.workspace) … setRigWorkspace(rigId, rigSpec.workspace)`）@HEAD。

### 1.2 运行时解析——workspace-resolver

`resolveWorkspaceContext({ spec, cwd, envOverride })`（由 `whoami-service` 消费）返回 `WhoamiWorkspaceBlock`，无 spec 时返回 `null`。`activeRepo` 解析：`envOverride`（非空、已 trim）**逐字胜出**——即使是未知的 repo 名也被采纳，因为操作者是有意识地设置 `OPENRIG_TARGET_REPO` 的（PL-007 PRD § Item 3）；否则 `defaultRepo` **仅在它点名一个已声明 repo 时**才被使用。声明了 `knowledgeRoot` 时 `knowledgeKind` 为 `"knowledge"`，否则为 `null`。

> 来源：`domain/workspace/workspace-resolver.ts:26-52`（解析器；env 覆盖逐字 L34-43，含 "honored verbatim" 注释 L35-36）@HEAD。

`whoami-service` 读取持久化的 spec，用查询的 `targetRepoOverride` 解析，回退到 `process.env["OPENRIG_TARGET_REPO"]`：

> 来源：`domain/whoami-service.ts:319-324`（`getRigWorkspace` + `resolveWorkspaceContext`，env 回退 L323）；`whoami` 在 `:335` 处于其载荷中返回 `workspace` @HEAD。

`resolveNodeWorkspace({ spec, cwd })`（由 `node-inventory` 消费）沿目录树向上遍历节点的 `cwd`，寻找包含它的**最长前缀 repo 路径**，从而派生每节点的 `NodeWorkspaceInfo`；cwd 位于 `knowledgeRoot` 之下时回退到 `knowledge`，cwd 未解析时再回退到 rig 的 `defaultRepo`。包含判定用 `path.relative` 边界检查（不是字符串 `startsWith`），因此 `/foo/bar` 不会匹配 `/foo/bar-other`。

> 来源：`domain/workspace/workspace-resolver.ts:57-95`（最长前缀 L67-73；knowledge 回退 L77-79；默认 repo 回退 L82-88）、`isInside` `:97-103`；`domain/node-inventory.ts:397`（`workspace: resolveNodeWorkspace(...)`）、`:434-437`（`NodeWorkspaceInfo`）@HEAD。

### 1.3 逐条目 repo scope——迁移 039 + 队列校验

迁移 **039** 为 `queue_items` 加入 `target_repo TEXT` 与 `idx_queue_items_target_repo`。当操作者传 `--target-repo <name>` 时，它携带逐条目的类型化 repo scope；当 qitem 相对 rig 的 `default_repo` 无歧义或未声明工作区时为 NULL。Mission Control 视图呈现该字段，使跨 rig 交接更清晰。

> 来源：`db/migrations/039_queue_target_repo.ts:16-22`（`ALTER TABLE queue_items ADD COLUMN target_repo TEXT` + `CREATE INDEX … idx_queue_items_target_repo`）；文档注释 `:3-14` @HEAD。

队列路由在路由层对照**源 rig 的** `RigSpec.workspace.repos[]` 校验 `target_repo`：它从 `source_session`（`<member>@<rig>`）中解析出 rig 名，查找该 rig，读 `getRigWorkspace`，并以 `unknown_target_repo` + 已知 repo 列表拒绝未知 repo。当没有 rigRepo、没有可解析的 rig、rig 未知或未声明工作区时，它 **fail-open**（`{ ok: true }`）——只有当工作区显式声明了 repos 时校验才咬人。

> 来源：`routes/queue.ts:49-57`（fail-open 守卫）、`:55`（`getRigWorkspace`）、`:58-66`（`unknown_target_repo` + `knownRepos`）@HEAD。

## 2. Workspace HTTP 路由——frontmatter 校验器（0.3.0）

`workspaceRoutes()`（挂载于 `server.ts:491` 作为 `/api/workspace`）在 v0 暴露**唯一的只读端点**：

`POST /api/workspace/validate`——body `{ root, workspaceKind?, recursive?, requireFrontmatter?, maxFiles? }`；返回 `FrontmatterValidationReport`。`root` 必填（400 `root_required`）；词汇表之外的 `workspaceKind` 以 400 `invalid_workspace_kind` 拒绝；校验器抛出 → 500 `validate_failed`。**不做任何文件系统变更。**

> 来源：`routes/workspace.ts:23-65`（处理器；root 必填 L35-37；kind 枚举 L39-47；500 L59-62）；挂载 `server.ts:491` @HEAD。

`validateWorkspaceFrontmatter()` 遍历一个根目录，解析每个 `.md` 文件的 YAML frontmatter（首行以 `---` 定界），并产出结构化的缺口报告——**仅建议性，绝不修改文件**。缺口种类：`missing-required-field`、`unrecognized-status-value`、`parse-error`、`missing-frontmatter`。各类别必填字段：`user`/`project` → `["doc"]`；`knowledge`/`lab`/`delivery` → `["doc","status","created","owner"]`。合法 `status` 枚举：`active|draft|archived|superseded`。默认行为会静默跳过没有 `---` 的文件（非正式笔记），除非开启 `requireFrontmatter`；默认递归；跳过 `node_modules` / `.git` / `.worktrees` / `dist` / `build`；硬上限 `maxFiles` 默认 10000。

> 来源：`domain/workspace/frontmatter-validator.ts:53`（status 枚举）、`:56-62`（各类别必填）、`:23-27`（缺口种类）、`:90-122`（遍历；跳过目录 L105-111）、`:160-172`（missing-frontmatter 行为）、`:201-226`（必填 + status 检查）@HEAD。

CLI 呈现面：`rig workspace validate [root]`——v0 刻意收窄（仅 `validate`）；未来版本在同一遍历器上增加类型化 kind 的撰写。

> 来源：`docs/as-built/cli-reference.md:931-941` @HEAD。

## 3. 默认项目工作区脚手架

`workspaceScaffoldDirs()` / `workspaceScaffoldFiles()` 产出可入仓的默认工作区（`~/.openrig/workspace/` 或 `--root`）。同一脚手架被 daemon 启动**幂等地使用**。它恰好产出两个目录（`missions/`、`exhaust/`）与四个文件（`SPEC.md`、`project.yaml`、`workspace.yaml`、`.gitignore`）。catalog 把它唯一的默认项目指向 `.`；`project.yaml` 掌管项目意图与 mission 发现，并暴露空的 `install.context` / `install.skills` 选择器。ignore 文件排除 `exhaust/` 与本地 `.openrig/` 投影状态，同时保持作者撰写的项目上下文可版本化。

工作区 owner 由 CLI daemon 启动与 daemon 直接首启共用的实例初始化器调用。该初始化器是增量的：绝不删除或覆盖已有文件；保留的 `--force` 拼写是关于覆盖行为的兼容性 no-op。CLI 与 daemon 脚手架逐字节对等钉住。Mission 与 slice 内容经 `rig scope` 显式创建，而非由工作区初始化播种。实例上下文、System World、skill 来源、运行时状态，以及已退役的 `artifacts/`、`evidence/`、`progress/`、`field-notes/`、`dogfood-evidence/`、`README.md` 与 `STEERING.md` 条目都不产出。

> 来源：`domain/workspace/default-workspace-scaffold.ts`（`workspaceScaffoldDirs`、`workspaceScaffoldFiles`）；CLI `domain/instance-initialization.ts`；daemon `index.ts`；CLI `packages/cli/src/daemon-lifecycle.ts` 与 `packages/cli/src/commands/config-init-workspace.ts`（`runInitWorkspace`）；对等性：`packages/daemon/test/getting-started-narrative-parity.test.ts` @HEAD。

## 4. 基于文件的 missions / slices 树

### 4.1 SliceIndexer（Slice Story View v0）——0.3.0

`SliceIndexer` 从配置的文件系统根读取 slice 文件夹。**默认工作区契约**是 `workspace/missions/<mission>/slices/<slice>`；显式配置的扁平根（`workspace/slices/<slice>`）仍为兼容而支持。嵌套的 `slices/` 子文件夹使父文件夹成为 mission（`missionId = <mission-folder>`）；裸文件夹是扁平 slice（`missionId = null`）。不新增 SQLite 迁移，不新增事件类型：对既有表（`queue_items`、`queue_transitions`、`mission_control_actions`）+ dogfood-evidence 目录做只读投影。有时间界限的列表 + 详情缓存（`invalidate()` 两者皆丢弃）。任何配置的 slice 根在磁盘上存在时 `isReady()` 为真。

> 来源：`domain/slices/slice-indexer.ts:1-14`（契约 + 不新增状态）、`:174-176`（`isReady`）、`:179-182`（`invalidate`）、`:212-256`（`readSliceLocations`；嵌套与扁平之别 L233-253）、`:62-89`（`SliceListEntry` 形状：`missionId` / `slicePath` / `qitemIds` / `proofPacket`）@HEAD。

### 4.2 SliceDetailProjector（Slice Story View v0 + v1）——0.3.0

给定一个 `SliceRecord`，projector 横跨六个标签页（Story、Acceptance、Decisions、Docs、Tests/Verification、Topology）组装完整的每切片载荷。只读；组合已交付的表 + `workflow_specs`/`workflow_instances`/`workflow_step_trails` + 磁盘上的 slice 文档 + dogfood-evidence。**v1 移除了 v0 的硬编码遗留 phase 枚举**（`discovery`/`product-lab`/`delivery`/……）：`StoryEvent.phase` 现在是开放的 string-or-null——绑定到 `workflow_instance` 时为 spec 定义的 `step.id`，否则为 `null`（UI 归入 "Untagged" 组）。当未构造 workflow 运行时时，projector 静默降级为 v0 行为（`workflowBinding=null`、`specGraph=null`）。

> 来源：`domain/slices/slice-detail-projector.ts:1-21`（六标签契约 + v1 增强）、`:18-21`（v0 phase 枚举在 v1 被移除）；启动降级路径 `startup.ts:1063-1076`（projector 以 `workflowRuntime?.specCache` 构建；注释 L1064-1071）@HEAD。

### 4.3 Slices 路由——0.3.0

`slicesRoutes()`（挂载于 `server.ts:501` 作为 `/api/slices`）：`GET /`（过滤器 `all|active|done|blocked`，默认 `all`；`?refresh=1` 使缓存失效；可选 `?boundToWorkflow=<name>:<version>` 透镜把范围缩到绑定到某 workflow 实例的 slices）、`POST /refresh`（丢弃两个 indexer 缓存——无需 daemon 重启）、`GET /:name/proof-asset/*`（路径穿越防护；不可变 1 天缓存）、`GET /:name/doc/*`（Docs 标签页的 markdown；穿越防护）、`GET /:name`（完整的逐标签载荷）。未接线时 503 `slices_indexer_unavailable`；未就绪时 503 `slices_root_not_configured` + 安装提示。**路由顺序纪律**：字面 `/` / `/refresh` / `/:name/proof-asset/*` / `/:name/doc/*` 注册在动态 `/:name` 之前，因此不被遮蔽。

> 来源：`routes/slices.ts:31-177`（处理器；路由顺序 L34-35、L101-102、L109-113、L166-167；503 L38-44；`boundToWorkflow` L60-86）；挂载 `server.ts:501` @HEAD。

### 4.4 Missions 路由——**0.3.1**（slice 12 + slice 13 + slice 18）

`missionsRoutes()`（挂载于 `server.ts:505` 作为 `/api/missions`）是 mission scope 数据层。`GET /:missionId` 返回 `{ missionId, missionPath, slices, workflow_spec, topology, status }`——slices 从 SliceIndexer 按 `missionId` 过滤；`missionPath` 从任一 slice 的 `slicePath` 向上两层派生；`workflow_spec` 从 `<missionPath>/README.md` frontmatter 惰性解析（用的是与 slice-indexer 相同的 `parseWorkflowSpecRef` 辅助函数）；spec 已缓存时 `topology.specGraph` 经 `projectSpecGraph(spec, null)` 投影，声明了但未缓存时为 `{ specGraph: null }`，什么都没声明时为 `null`；`status` 读自 README frontmatter。`POST /:missionId/complete` 把 `status: complete` 写入 mission README frontmatter（幂等；保留无关字段）——daemon 是审计轨迹呈现面，UI 保留乐观的 localStorage 镜像。没有 slice 匹配时 404 `mission_not_found`。

> 来源：`routes/missions.ts:39-118`（处理器）、`:124-142`（`writeMissionStatusComplete`）、`:148-150`（`computeMissionPath` 向上两层）、`:171-177`（`readMissionWorkflowSpec`）、`:205-215`（`computeMissionTopology`）；挂载 `server.ts:505`；§0 取证：`routes/missions.ts` 在 v0.3.0 缺席 ⇒ **0.3.1** @HEAD。

### 4.5 Projects 路由——协调 L2 分类器（PL-004 Phase B）——0.3.0

`projectsRoutes()`（挂载于 `server.ts:492` 作为 `/api/projects`）支撑 `rig project` CLI 动词——这是 **PL-004 Phase B 的项目*分类器***（lease 生命周期 + 幂等 classify + 操作者动词回收 + SSE），不是 Project *工作区 UI*（那是上文的 slices/missions 呈现面；命名重叠是有记录的接缝）。端点：`POST /lease/acquire`（可选 `evaluateDeadnessFirst` 先清掉过期/死掉的 lease）、`POST /lease/heartbeat`、`POST /reclaim-classifier`、`POST /project`（对 `stream_item_id` 幂等）、`GET /lease`、`GET /list`、`GET /sse` + `GET /watch`（SSE）、`GET /:projectId`。**路由顺序纪律**：字面 `/lease`、`/list`、`/sse`、`/watch` 注册在裸 `/:projectId` 兜底路由之前（Phase A R1 的 SSE 教训）。

> 来源：`routes/projects.ts:18-194`（处理器；路由顺序备注 L15-17、L140-141、L158-159、L185）；错误码 → HTTP 映射 `:31-52`；挂载 `server.ts:492` @HEAD。

## 5. UI 路由实况（§10.7——在 routes.tsx@HEAD 对照源码验证）

`packages/ui/src/routes.tsx` 有 **542 行**，使用 TanStack Router（`createRoute({ path, component })` 对象），不是 JSX `<Route>`。Phase-8.1 调查中由 grep 推出的 missions/projects 预期在此对照 routes.tsx 实况予以纠正：

| 调查预期 | routes.tsx@HEAD 实况 | routes.tsx:NN |
|---|---|---|
| `/project`（workspace） | **真实路由**——`WorkspaceScopePage` | `:128-131` |
| `/project/mission/$missionId` | **真实路由**——`MissionScopePage` | `:134-137` |
| `/project/slice/$sliceId` | **真实路由**——`SliceScopePage` | `:140-143` |
| `/files` | **真实路由**——`FilesWorkspace`（见 content-surfaces.md） | `:192-195` |
| `/mission-control` | **`<Navigate to="/for-you" />`** 重定向桩（按 SC-18 已删除；Mission Control *系统*位于 daemon/PL-005，不是 UI 目的地） | `:440-444` |
| `/slices` | **`<Navigate to="/project" />`** 重定向桩（按 project-tree.md 已删除） | `:447-451` |
| `/slices/$name` | **`<Navigate to="/project/slice/$sliceId" />`** 重定向桩 | `:453-460` |
| `/progress` | **`<Navigate to="/project" />`** 重定向桩（并入 Project 标签页，Phase 3） | `:464-468` |
| `/steering` | **`<Navigate to="/project" />`** 重定向桩（并入 Project 工作区概览标签页，Phase 3） | `:470-474` |
| `/missions`（顶层） | **无路由**——mission 只能经 `/project/mission/$missionId` 到达 | （缺席） |
| `/markdown` | **无路由**——markdown 是文件/抽屉呈现面中的一个组件，不是目的地（见 content-surfaces.md §4） | （缺席） |

> 来源：`packages/ui/src/routes.tsx:90-195`（真实路由）、`:435-474`（重定向桩块；每个 `<Navigate>` + DELETED/folds 注释）、`:476-490`（路由树）@HEAD。grep 确认缺席：routes.tsx 全文 @HEAD 无任何 `path: "/missions"` / `path: "/markdown"` 声明。

§10.7 净裁定：daemon 的 `/api/missions` + `/api/slices` + `/api/projects` 路由真实且承重；**面向操作者的 UI** 仅经 `/project*` 目的地消费它们。`/mission-control`、`/slices`、`/progress`、`/steering` 是重定向桩（系统存在于 daemon 层，这些 URL 被折叠进 `/project` / `/for-you`）。

## 6. 横切属性

- **可选 + 缺失仍有效**：没有 `workspace` 块的 rig 保持有效；whoami / node-inventory / queue-target-repo 都返回 null / fail-open（`workspace-resolver.ts:32`；`rig-repository.ts:99,107`；`routes/queue.ts:55`）@HEAD。
- **防御性列探测**：每次 `workspace_json` / `target_repo` 访问都以列存在为守卫，使部分测试装置不致崩溃（`rig-repository.ts:99,107`；迁移 038/039 分开发布，装置可只应用其需要的一半——`038.ts:11-14`）@HEAD。
- **只读投影，树不新增状态**：SliceIndexer / SliceDetailProjector 不新增任何迁移 / 事件类型；只有工作区声明（038）+ 逐条目 scope（039）触碰 SQLite（`slice-indexer.ts:12-14`）@HEAD。
- **仅建议，绝不变更**：frontmatter 校验器与 init-workspace 脚手架绝不删除操作者内容（`frontmatter-validator.ts:12-13`；`config-init-workspace.ts:12-16`）@HEAD。

## OPEN 项（沿用，不粉饰）

- **OPEN-A**——`resolveWorkspaceContext` 逐字采纳 `envOverride`，**即便它点名的不是任何已声明 repo**（`workspace-resolver.ts:34-43`，源自 PL-007 PRD § Item 3 的明确设计），而队列路由对着同一 `repos[]` **拒绝**未知 `target_repo`（`routes/queue.ts:58-66`）。这两个呈现面对未知 repo 名施行相反策略（whoami 信任操作者；队列做校验）。按原样陈述——该不对称真实存在于源码且按所引注释是有意为之，但分歧在源码中未被调和。
- **OPEN-B**——`/api/projects` *分类器*（PL-004 Phase B）与 `/project*` *工作区 UI*（slices/missions）共用 "project" 一词但互不相关。作为命名接缝记录在案；非源码缺陷。
- 不适用任何 slice-00 数字漂移 OPEN（1–5）——本模块不携带迁移计数 / 路由组 / PL-004 事件数论断（那些落在 daemon-core / coordination-primitive / architecture-rules）。