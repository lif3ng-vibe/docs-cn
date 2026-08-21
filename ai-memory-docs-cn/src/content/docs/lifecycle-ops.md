---
title: "生命周期操作"
description: "破坏性/触碰状态的 ai-memory 命令参考。运行任何改动 wiki + db 的东西之前先读本文，尤其是在家庭实验室机器上——那里的错误更难撤销。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/lifecycle-ops.md"
---

# 生命周期操作

破坏性/触碰状态的 ai-memory 命令参考。
运行任何改动 wiki + db 的东西之前先读本文，尤其是在家庭实验室机器上——那里的错误更难撤销。

## TL;DR——安全矩阵

| 命令 | 服务器**运行中**安全？ | 抹数据？ | 可逆？ | 说明 |
|---|---|---|---|---|
| `purge-project --confirm` | ✅ 是 | 该一个项目的数据 | 否 | 删除 UUID 命名空间化的 wiki 根与裸工作流片段；兄弟项目不受影响。项目下有托管工作流持有活跃运行租约时以 `409` 拒绝——`--force` 覆盖。 |
| `rename-project --from --to` | ✅ 是 | 否 | 是（改回） | 仅 `projects.name` 列更新。磁盘目录以 `project_id`（UUID）为键，改名绝不移动文件。 |
| `/admin/rename-workspace` | ✅ 是 | 否 | 是（改回） | 仅 `workspaces.name` 列更新；刷新 `_meta.md` 作用域 manifest 并给 wiki 树打检查点。 |
| `/admin/delete-workspace` | ✅ 是 | 该 workspace 及每个子项目 | 否 | 先跑 `purge_workspace` 准入，一个级联删 SQLite 行，移除 UUID 键的 workspace 目录与托管工作流裸片段，报告文件系统部分失败，持久工作完成后派发镜像通知。 |
| `move-project --confirm` | ✅ 是 | 仅合并情形的源（`Reject` 策略的 `purge_project` webhook 仍可中止源拆除、让一切完好） | 否 | 全新目的地 → 无损**真移动**（重盖 `workspace_id` 戳、保留 `project_id`、重命名目录）：会话/观察/交接 + 历史全部幸存。目的地有同名项目 → **复制+清除合并**：只有最新页面迁移。 |
| `move-session <id> --to --confirm` | ✅ 是 | 否 | 是（移回） | 把一个会话（或触碰 `--from-project` 的每个会话）重盖戳进另一项目：`sessions`、`observations`、其 `handoffs`、整编任务、auto-improve 运行/认领及其 `sessions/<id>.md` 页面，每会话一事务；页面文件随之移动（`--pages move`，默认）或退役待重生成。不带 `--confirm` 是真 dry run（回滚）。开放会话或待处理整编任务时以 `409` 拒绝，除非 `--force`。 |
| `backup --output-path` | ✅ 是 | 否 | 不适用 | 从服务器在线 `sqlite3 .backup` 加 wiki 树流出 gzip tarball。与活跃写入器并行安全。 |
| `checkpoints` | ✅ 是 | 否 | 不适用 | 列出近期 wiki git 检查点。只读。 |
| `restore-page --path --from` | ✅ 是 | 覆盖一页 markdown 版本 | 是（恢复另一检查点） | 从 wiki git 历史恢复一页、重建索引进 SQLite、写恢复后检查点。不恢复仅 DB 状态。 |
| `restore --from <tarball>` | ❌ **先停服务器** | 覆盖数据目录 | 否（无事先备份） | 有兄弟 `ai-memory` 进程存活即拒绝（sysinfo 守卫）。 |
| `reset --confirm` | ❌ **先停服务器** | 是，全部数据 | 否 | 有兄弟 `ai-memory` 进程存活即拒绝（sysinfo 守卫）。 |
| `reindex` | ❌ **先停服务器** | 不清 wiki；要求干净 DB | 仅凭事先 DB 备份 | 用 `_meta.md` manifest 从 `wiki/` 重建页面/链接/FTS。SQLite 已有行即拒绝，让过期的仅 DB 状态不能静默幸存。 |

触碰状态的命令经 HTTP admin API 路由，`reset`、`restore`、`reindex` 除外——它们是直接磁盘的生命周期操作，在另一进程持有 SQLite WAL 写入器时根本无法运行。不变量见 [CLAUDE.md §16](https://github.com/akitaonrails/ai-memory/blob/main/CLAUDE.md)。

## 「项目隔离」在这里是什么意思

每个项目的数据住在磁盘上隔离的、UUID 键的根之下：

```
<wiki_root>/
├── .git/
├── <workspace_id>/
│   ├── _meta.md                 # 供重建用的 workspace 名
│   └── <project_id>/
│       ├── concepts/
│       ├── decisions/
│       ├── gotchas/
│       ├── sessions/
│       ├── _rules/
│       ├── _meta.md             # 供重建用的项目名 + repo_path
│       ├── log-YYYY-MM.md      # 滚动事件日志，每月一文件
│       └── bootstrap.md
└── <other_workspace_id>/
    └── <other_project_id>/
        └── ...
```

可变的**项目名**（你在 `/web/` 里看到的人类可读 `distrobox-gaming` 或 `.config`）从不出现在任何磁盘路径；稳定的 **project_id UUID** 才出现。SQLite 的 `projects.name` 列映射名 → id。两个项目可以有完全相同的 `pages.path`（如都有 `decisions/0001.md`）而不在磁盘冲突——命名空间化布局保证结构隔离。

git 历史根在 `<wiki_root>`（一个仓库、所有项目作子树）。从 wiki 目录里的 `git log` 展示每个项目的变更；逐项目 diff 也可经 `git log -- <workspace_id>/<project_id>/`。

每个 workspace 目录还带 `<workspace_id>/_meta.md`，每个项目目录带 `<workspace_id>/<project_id>/_meta.md`。那些只有 frontmatter 的小 manifest 存人类名（项目另加 `repo_path`），让干净的 SQLite DB 可以只从 UUID 键的 wiki 树重建。

## 逐命令

### `purge-project`

```bash
ai-memory purge-project --workspace default --project my-project --confirm
```

按序发生什么：

1. 服务器按名查 `(workspace_id, project_id)`。任一缺失返回 404。
2. 项目下有托管工作流仍持有**活跃**运行租约（`managed_runs.state = 'active'` 且 `lease_expires_at` 在未来）时以 409 拒绝。`workstreams` 从 `projects` 级联、`managed_runs` 从 `workstreams` 级联，所以清除会删掉运行中智能体的租约行：其心跳之后整个会话都以 `409 managed run lease is not active` 失败、转录永远到不了台账。过期租约（崩溃的包装器）**不**阻塞清除。`--force` 照样清除。
3. 计数将级联的行（`pages`、`sessions`、`observations`、`handoffs`、`page_embeddings`，加 `workstreams` 与 `managed_runs`）。
4. 单条 `DELETE FROM projects WHERE id = ?`——V01 + V05 的 `ON DELETE CASCADE` 外键在一个事务里传播到每张依赖表。
5. 尽力而为的文件系统清理移除 UUID 命名空间化的 wiki 根与每个 `<data_dir>/raw/workstreams/<workstream_id>/` 片段目录。
6. 返回摘要：`{label, pages_deleted, sessions_deleted, …, workstreams_deleted, managed_runs_deleted, workstream_ids, files_deleted: [<project_root>, <raw_workstream_dir>, ...], files_failed: [...]}`。

`workstream_ids` 留在报告里供审计。每个对应的裸片段目录在服务器上移除并出现在 `files_deleted`；移除失败与 wiki 清理失败一起出现在 `files_failed`。

失败模式：

- **workspace 或项目名未找到** → 404，无变更。
- **缺确认标志** → 400，无变更。
- **活跃托管运行且无 `--force`** → 409 点名工作流，无变更。结束或取消该会话，或带 `--force` 重跑（运行中的智能体随后无法再保存其历史）。
- **`remove_dir_all` 部分失败**（如权限）→ DB 行已消失但 `files_failed` 有内容。用相同参数重跑幂等；第二次调用返回 404（项目已删）。

为什么服务器运行中安全：

- DB 级联是一个事务；写入器 actor 让它与任何其他写入串行。
- 磁盘删除只碰该项目的 UUID 键子目录，没有其他项目与它共享文件。即使写到一半也与监视器无竞态——最坏监视器对刚删的文件发出删除事件，它忽略（无 DB 行可重建索引）。

### `rename-project`

```bash
ai-memory rename-project --workspace default --from old-name --to new-name
```

发生什么：

1. 按当前名查 `(workspace_id, project_id)`。未中 404。
2. 校验新名：非空、无 `/`、无首尾空白。坏输入 422。
3. `UPDATE projects SET name = ? WHERE id = ?`。`(workspace_id, name)` 索引上的 UNIQUE 违规 → 422 带 "name taken"。
4. 返回 `{workspace, from, to, pages}`。

磁盘零文件移动，因为磁盘路径以 `project_id` 而非名为键。Web UI URL `/web/w/<ws>/<proj-name>/…` 在列更新后只是解析到同一 `project_id`。该命令也不重命名源检出、不改写任何原生智能体会话定位器。在物理重命名带原生会话的检出之前，见[托管工作流的重命名行为](/managed-workstreams/#项目与目录重命名)。CLI 重命名成功后，客户端还重键其本地 `show` 检出链接。直接 `/admin/rename-project` 请求无法更新其他机器的客户端注册表；之后从检出的一次成功托管 `run` 修复其链接。

失败模式：

- **`to` 名在本 workspace 已存在** → 422。
- **`to` 无效（空、斜杠、空白）** → 422。
- **源 `from` 未找到** → 404。

### `/admin/rename-workspace`

更新 `workspaces.name` 重命名 workspace；磁盘路径保持以 `workspace_id` 为键，所以无页面文件移动。SQLite 重命名之后，处理器用 `Wiki::backfill_scope_manifests()` 刷新 `_meta.md` 作用域 manifest，并在 wiki 树有变化时返回 `manifests_refreshed` 加重命名后检查点。

SQLite 重命名已提交后 manifest 刷新失败时，重命名仍返回 `200 OK` 带 `manifests_refreshed: 0` 与 `manifest_warning` 字符串，而不是误导性的 500。那时 DB 重命名是权威的；操作者可以重跑 manifest 刷新，或需要修复 `_meta.md` 漂移时从发出的检查点恢复。

失败模式：

- **源 `from` 未找到** → 404。
- **`to` 名已存在或无效** → 422。
- **提交后 manifest 刷新失败** → 200 带 `manifest_warning` 与已提交的 DB 重命名。

### `/admin/delete-workspace`

经 `workspace_id` 级联删除一行 workspace 及全部子项目/页面/会话/托管工作流。该路由对非空 workspace 有 `force: true` 守卫，并遵循项目清除用的破坏性操作顺序：

1. 查 workspace 而不创建缺失作用域。
2. 跑阻塞的 `op=purge_workspace` 准入。reject 策略 webhook 在 DB 行或文件移除之前中止。
3. wiki 树脏时打删除前检查点。
4. 一个写入器 actor 事务里删除 workspace。
5. 从磁盘移除 `<wiki_root>/<workspace_id>` 与每个受影响的 `<data_dir>/raw/workstreams/<workstream_id>` 目录。响应在文件系统结果之外报告 `workstreams_deleted`、`managed_runs_deleted` 与清理的 `workstream_ids`。
6. 持久工作完成后派发非阻塞的 `purge_workspace` 镜像通知。DB 删除已提交而磁盘移除失败时，响应含 `files_failed` 且 webhook `ctx.partial_failure: true`。
7. wiki 树变化时打删除后检查点。

失败模式：

- **workspace 未找到** → 404，无变更。
- **非空 workspace 无 `force: true`** → 409，无变更。
- **reject 策略 `purge_workspace` webhook 失败** → 500，无 DB/磁盘变更。
- **SQL 提交后文件系统移除失败** → 200 带 `files_failed` 与异步镜像通知上的 `partial_failure: true`；需手工清理报告的路径。

### `move-project`

```bash
ai-memory move-project --from-workspace default --project my-project \
  --to-workspace other-workspace --confirm
```

把项目移进**不同**的 workspace。与 `rename-project`（同 workspace 列更新）不同，这跨越 workspace 边界。目的地决定跑哪种策略——响应里以 `moved_via` 报告：

**1. 全新目的地 → `"true-move"`（无损，常见情形）。** 目的地 workspace **无**同名项目时，移动是低层重盖戳：

1. 解析源 `(from_workspace, project)`。未中 404。
2. 拒绝 `from_workspace == to_workspace`（用 `rename-project`）→ 422。
3. 取或建目的地 **workspace** 行（不是新项目）。
4. 拿 wiki 的独占变更门并跑 `op=move_project` 准入 webhook，`ctx.workspace` / `ctx.project` 带源名、`ctx.destination_workspace` / `ctx.destination_project` 带目的地名。reject 策略 webhook 在文件或 DB 行移动之前中止。
5. 仍持有该门时，检查目的地目录仍缺席，然后 `fs::rename` 项目目录 `<wiki>/<from_ws>/<proj>` → `<wiki>/<to_ws>/<proj>`（单个 wiki 根内原子）。
6. 在**一个事务**里给项目的每张领域表重盖 `workspace_id` 戳，保留同一 `project_id`（`projects`、`pages`、`sessions`、`observations`、`handoffs`、`audit_log`、自动改进状态、SessionEnd 整编任务与托管 `workstreams`）。原生工作流会话、运行与事件经 `workstream_id` 保持挂接；`page_embeddings` 与 `links` 经 `page_id` 保持挂接，所以那些行无需直接重盖戳。

CLI 真移动成功或复制-清除移动完成后，客户端重键其本地 `show` 检出链接。合并时既有目的地链接优先。直接 admin API 调用者不动客户端本地注册表；之后一次成功托管 `run` 修复相关链接。

顺序是**先重命名、SQL 最后提交**，所以 **DB 绝不超前磁盘**：重命名失败什么都没碰；两步之间崩溃至多在目的地留一个孤儿目录、DB 完整留在源（可恢复），绝无 DB 行指向缺失文件。SQL 失败把目录改回名，所以移动是要么全有要么全无——除非文件系统连回滚也拒绝，那时错误点名手工修复。进程内页面写入/重建索引取同一变更门的共享侧，并在碰磁盘前校验 `(workspace_id, project_id)` 对，所以过期的源写入在移动后失败而不创建孤儿文件。

这是 O(1)（一个事务 + 一次改名）、不重新嵌入、且**保留一切**——会话、观察、交接与完整取代历史都随项目迁移。

**活跃会话守卫。** 服务器拒绝（409）移动钩子路由器已发布为*活跃*项目的项目（活跃会话的下一条观察会带着过期 `workspace_id`）。传 `--force` / `force: true` 覆盖——仍然安全：移动会重新发布活跃指针，且 wiki 对校验器加 `(workspace_id, project_id)` 插入触发器（V18）干净拒绝过期写入，所以路由器重新解析而不是损坏或在旧 workspace 造文件。

**2. 目的地已有同名项目 → `"copy-purge"`（合并）。** 两个不同 `project_id` 不能重盖戳成一个（会在 `UNIQUE (workspace_id, name)` 上碰撞），所以源的最新页面经 `Wiki::write_page` 拷进既有目的地项目（净化、链接重解析、FTS、部署时准入/git-mirror webhook 都触发），源嵌入逐字搬运，然后才清除源（`merged_into_existing: true`、`source_purged: true`）。

`--force` 只覆盖钩子路由器的活跃项目守卫。它绝不在该破坏性路径上删除活跃托管工作流租约；重试前先结束或取消该运行。真移动保持同一项目与租约 id，所以不需要这个额外守卫。

先复制后清除意味着任何复制失败都在清除**之前**中止、源完好。不可读的源文件被跳过且也阻塞清除（`source_purged: false`），修复后重跑安全（重跑幂等——拷过的页面直接取代）。源下的**活跃托管运行**同样阻塞清除腿：移动返回 409 说明已拷了几页，源保持完整直到会话结束、移动重跑。

**同路径冲突（`on_conflict`）。** 源页面路径在目的地已存在且正文、frontmatter、标题、层级或置顶位不同时，策略决定（相同页面总是同路径的无操作取代）：

- **`block`**（默认）——整个移动以 409 中止、列出冲突路径；源完好。破坏性操作的安全默认：没有任何东西被静默覆盖或拆分。操作者解决冲突或带显式策略重跑。
- **`overwrite`**——源页面取代同路径的目的地页面（目的地先前版本成为历史）。
- **`duplicate`**——两个都留：源页面落在 `<stem>-from-<src_workspace_slug>.md`，再冲突则 `-2`、`-3`……`-from-` 字面量是 `crates/ai-memory-mcp/src/admin.rs` 里的 `DEDUP_FROM_TOKEN` 常量；改一个就改另一个。指向原路径的 wikilink 不改写，所以无损的 `true-move` 路径仍是保留路径与链接的办法。

每个冲突（overwrite/duplicate）列在响应 `conflicts` 数组里（`path` → `moved_to`）。CLI 用 `--on-conflict` 设策略；直接 `/admin/move-project` 调用者在 JSON 体里用 `"on_conflict": "block" | "overwrite" | "duplicate"`。

**不迁移的（仅合并情形）：** `copy-purge` 路径下源的 `sessions`、`observations`、`handoffs`（裸情节捕获日志）被清除丢弃，且移动的页面开始新的取代链（真正的页面历史在 wiki 的 git 镜像里）。`true-move` 路径无此损失。

> **运维告诫——移动当前会话写入的项目。** 生命周期钩子为每个受支持的工具生命周期事件在会话的项目里盖一条有界观察。会话中途移动那个项目，下一条钩子会在旧 workspace 下重新创建源（`scratch` 式）。移动活跃项目之前，先把仓库的 `.ai-memory.toml` 指向**目的地** workspace，让新钩子事件已经落在那里、移动成为无竞争的干净操作。

失败模式：

- **缺 `--confirm`** → 400。
- **`from_workspace == to_workspace`** → 422（用 `rename-project`）。
- **源项目未找到** → 404。
- **目的地 workspace 目录已存在**（仅 true-move）→ 409 带 `WikiError::DestinationExists` 体——目的地有同一 `(workspace, project)` UUID 对的磁盘内容而无对应 DB 行；拒绝并让操作者手工对账。
- **block 策略同路径冲突**（仅 copy-purge 合并）→ 409 带 `{"error": "...", "conflicts": [paths...]}` 列出每个冲突路径。带 `on_conflict=overwrite` 或 `on_conflict=duplicate` 重跑以继续。
- **true-move 准入或 SQL 重盖戳失败** → 500 且无已提交移动。目录已移动而 SQL 未提交的罕见回滚双错发生时，错误包含确切的手工修复。

### `move-session`

```bash
# 一个会话，含页面与历史（dry run：无 --confirm）
ai-memory move-session 0192b6a1-4c2e-7d3f-8a5b-1234567890ab --to NAS_general
# 应用
ai-memory move-session 0192b6a1-4c2e-7d3f-8a5b-1234567890ab --to NAS_general --confirm
# 杂散项目的每个会话，进另一 workspace，页面稍后重生成
ai-memory move-session --from-project tmp --to NAS_general --to-workspace home \
  --pages regenerate --confirm
```

把一个会话、或触碰 `--from-project` 的每个会话，移进同一或另一 workspace 的另一项目。会话捕获在错误项目下时用它（粘性路由之前 `cd` 进 `/tmp`、子智能体在临时目录启动、仓库克隆在临时名下），其观察应与它们所属的项目住在一起。与从每个会话 `cwd` 重新推导项目的 `reorg` 不同，这里显式点名目的地、不动存储其余部分。已扎根在目的地的会话只做杂散行归位：`sessions` 行不动，它们散落在另一作用域的每行被收进目的地，报告给 `session_moved: false` 加计数。批量形式因此通过源里的 `sessions` 行**或**盖进它的观察看到会话——这正是清空只持有他处扎根会话之观察的幽灵桶的办法（粘性之前的会话中途路由）。

**请求。** `POST /admin/move-session` 取 `{"session_id": "<uuid>", "workspace"?, "project", "pages"?, "confirm"?, "force"?, "create"?}` 或批量形式 `{"from_workspace"?, "from_project", "workspace"?, "project", "pages"?, "confirm"?, "force"?, "create"?}`。`workspace`（目的地）默认源 workspace；`from_workspace` 默认 `default`。CLI 像其他作用域参数一样解析 `--from-project`（标记、否则字面）；`--to` 与 `--to-workspace` 保持字面。

**每会话一个事务移动什么：** `sessions` 行、该会话的每行 `observations`（含落在另一作用域的）、它产出的 `handoffs`（`from_session_id`）、其 `session_consolidation_jobs`、`auto_improve_runs` 与 `auto_improve_scheduler_claims`、及其 `sessions/<id>.md` 页面：

- `--pages move`（默认）：页面的每个版本被重盖戳进目的地、文件改名的进目的地项目目录，策展页面及其取代历史跟随会话。目的地已有最新页面（或页面文件）在该路径时以 `409` 拒绝；带 `--pages regenerate` 重试或先解决目的地页面。
- `--pages regenerate`：源版本退役（`is_latest = 0`）、会话指向它们的 `summary_page_id` 被清空、文件移除，让该会话的下一次整编在目的地写全新页面。文件必须走：留在磁盘而无最新行的页面文件会被下一次对账环节重索引为新的最新页面。

请求带归因时审计行（`op = move_session`）携带操作者。不移动的：`sessions.cwd`（历史真相；其 basename 不是目的地项目时响应带 `cwd_warning`，因为在那里开的新会话仍按 basename 解析——除非 `.ai-memory.toml` 标记钉住项目）、会话期间写的其他页面（决策、坑点：页面不逐会话跟踪）、该会话*接受*的交接、以及 `auto_improve_proposals`（它们没有 `session_id`；它们面向被暂空的作用域里的页面）。`entities` 与 `page_feedback` 也不重盖戳——与 `move-project` 相同的缺口。

**操作顺序（逐会话）：** 校验目的地（无 `create` 则 404）、拒绝源即目的地的批量（422；与会话自己项目的单形式是归位）、跑守卫（开放会话守卫不适用于行不动的归位），然后在 wiki 的独占变更门下触发 `op=move_session` 准入 webhook（`ctx.workspace`/`ctx.project` 带源名、`ctx.destination_*` 带目的地名）、移动文件、重盖 SQLite 戳。磁盘先行 SQL 殿后，与 `move-project` 相同：存储失败把文件改回名，所以移动要么全有要么全无——除非文件系统连回滚也拒绝，那时错误点名手工修复。`--confirm` 运行前后各打一个 wiki 检查点；批量对整次运行打一对。

**默认 dry run。** 不带 `--confirm` 服务器跑同一事务并回滚，所以响应里的计数是精确的（`dry_run: true`），CLI 打印应用的确切命令。什么都不写、不留审计行；带 `--create` 对尚不存在的目的地，dry run 也不创建它：报告 `would_create_project: true` 加会移动什么的计数（CLI 说 "would create project"），只有 `--confirm` 运行才创建。

**守卫（无 `--force` 则 409）。** 仍开放的会话（无会话结束记录）可能还会收到事件；`pending`/`running` 整编任务会在旧作用域下写页面；批量形式还拒绝钩子路由器发布为活跃的项目，与 `move-project` 一样。`--force` 继续。归位（会话行已在目的地）跳过开放会话守卫：行不动，所以开放会话只是收集杂散行；任务守卫仍适用。注意强制开放会话会让钩子路由器的逐会话活跃指针留在旧作用域直到过期；粘性路由随后跟随的会话行已是目的地。

**批量形式。** 源作用域的每个会话逐个移动、各自一事务。批量在第一个拒绝处停止，错误体报告 `moved`/`total` 与已移动的会话（它们保持已移动）。批量的 dry run 先展示整个计划。

响应（`MoveSessionReport`）：`session_id`、`dry_run`、`session_moved`（归位为 `false`）、`from`/`to`（`{workspace, project}`）、`summary`（`observations`、`handoffs`、`consolidation_jobs`、`auto_improve_runs`、`auto_improve_claims`、`page_versions_moved`、`pages_regenerated`）、`page`（`moved` | `regenerated` | 归位且页面行全在目的地的 `already in destination` | 会话到处无页面的 `none`）、`cwd`、`cwd_warning`、`would_create_project`（仅带 `create` 的 dry run）、`pre_checkpoint`（仅移动前 wiki 树有未提交变更时）、`checkpoint`（仅移动改了树时）。批量把它们包进 `{dry_run, would_create_project?, from, to, total, moved, sessions: [...]}`。

失败模式：

- **`session_id` 与 `from_project` 都没有、或都有** → 400。
- **会话或目的地未找到** → 404（传 `create` / `--create` 创建目的地）。
- **批量源即目的地** → 422（与会话自己项目的单形式是归位，200 带 `session_moved: false`）。
- **开放会话（行已在目的地除外）、待处理整编任务、或活跃源项目（批量）** → 无 `force` 时 409。
- **目的地 `sessions/<id>.md` 已有最新页面或页面文件**（`--pages move`）→ 409；什么都没动。
- **文件移动后存储失败** → 500、文件改回名；回滚也失败时错误点名手工修复。

**它排干每个作用域，不只是你点名的那个。** 依赖行只按会话 id 匹配，所以观察散在多个项目的会话（比如粘性前的会话中途路由）被完整收集。这正是该命令的意义——但也意味着一次移动可能清空你没提到的项目，且**不可干净逆转**：之后把会话移回去把每行归到单一项目，原本的逐行拆分没了。

因此 dry run 点名它会排干的每个作用域及计数：

```text
  gathering observations out of 2 scopes into default/acme-api:
    default/scratchpad: 3 observation(s)
    default/tmp: 1 observation(s)
  Note: this empties every scope listed above, not only the one named as the
  source. Moving the session back later returns all rows to a single project —
  the split shown here is not restored.
```

`POST /admin/move-session` 把同一列表报告为 `source_scopes`。确认前读它。

### `checkpoints`

```bash
ai-memory checkpoints
```

列出近期 wiki git 提交、最新在前。短 OID 足够 `restore-page` 用，但 JSON 输出含完整 OID：

```bash
ai-memory checkpoints --json
```

用途：

- 找到坏页面写入、删除、清除、移动或恢复之前的那个检查点。
- 不 shell 进服务器的 `wiki/.git` 仓库就能检视 wiki 历史。

启动为 wiki 仓库零提交的既有数据目录创建一次性的 `upgrade baseline: existing wiki tree before recovery checkpoints` 提交。全新空安装在有待存内容前仍无提交。

### `restore-page`

```bash
ai-memory restore-page --workspace default --project my-project \
  --path notes/foo.md --from <checkpoint>
```

发生什么：

1. 服务器解析 `(workspace, project)` 而不自动创建任何东西。
2. 服务器校验页面路径。
3. 有未提交变更时，服务器先给当前 wiki 树打检查点（`pre-restore-page ...`）。
4. 服务器从 `--from` 的 git 读取该项目/页面的确切 markdown blob、解析、写回活跃 wiki 树、并在 SQLite upsert 一行新的最新页面，让检索、链接与 `/web` 与磁盘一致。
5. 活跃树变化时服务器写恢复后检查点（`restore-page ...`）。

失败模式：

- **workspace 或项目名未找到** → 404，无变更。
- **无效页面路径** → 422，无变更。
- **检查点或文件未找到** → 500 带 git/libgit2 错误；任何恢复前检查点留作审计面包屑。
- **历史 markdown 畸形或非 UTF-8** → 500，活跃文件不被替换。

它不恢复什么：

- 会话、观察、交接、用户、审计行、访问计数器与嵌入。那些只活在 SQLite 里，需要回滚就要完整 `backup` / `restore`。

### `backup`

```bash
ai-memory backup --output-path /tmp/ai-memory-backup.tar.gz
```

服务器上发生什么：

1. SQLite 在线备份 API 把活跃 WAL DB 拷到临时文件——不停写入器的保证一致快照。
2. 服务器把快照 + wiki 树 + `config.toml` 打成 tar.gz。
3. 响应体就是 gzip tarball（`Content-Type: application/gzip`）。

CLI 把响应体写到 `--output-path`。对家庭实验室用户，这是标准的「做危险的事之前先快照」动作——先 `ai-memory backup`，再继续。

恢复备份走逆过程：

```bash
# 先停服务器。
docker compose -f ~/deploy/ai-memory/docker-compose.yml down
# 恢复（容器还在跑时 sysinfo 拒绝）。
ai-memory restore --from /tmp/ai-memory-backup.tar.gz --data-dir /var/opt/docker/utils/ai-memory/data --confirm
# 再启动。
docker compose -f ~/deploy/ai-memory/docker-compose.yml up -d
```

`--data-dir` 标志把 CLI 指向 docker 卷的宿主侧路径（因为 `restore` 直接在磁盘上跑、不经 HTTP admin API）。

### `restore`

```bash
ai-memory restore --from <tarball> --data-dir <path> --confirm
```

直接磁盘操作。有其他 `ai-memory` 进程存活即拒绝（用 `sysinfo` 扫进程表）。

操作顺序：

1. 检查数据目录为空（或用户传了 `--force`）。
2. 把 tarball 解进数据目录。
3. 就地恢复 SQLite 快照。
4. 打一行摘要。

失败模式：

- **服务器还在跑** → 以 "another ai-memory process is alive (pid X); stop it before restoring" 退出——与 `reset` 相同措辞。
- **缺 `--confirm`** → 以用法提示退出。
- **数据目录非空且无 `--force`** → 以 "data dir not empty; pass `--force` to overwrite" 退出。

### `reset`

```bash
ai-memory reset --confirm
```

直接磁盘操作。有兄弟 `ai-memory` 进程存活即拒绝。移除配置数据目录下 `wiki/`、`db/`、`raw/` 的内容。保留 `config.toml`。

与 `restore` 相同的 sysinfo 守卫。用例是「擦掉重来」——典型是跨带破坏性迁移的大版本切换，或在旧数据目录上引导新安装。

对数据在宿主路径绑定挂载的 docker 部署，停容器后直接 `rm -rf <host-path>/*` 也行——但 `ai-memory reset` 是跨平台的路径，无论数据目录是本地的、绑定挂载的还是具名卷里的都工作。

### `reindex`

```bash
ai-memory reindex --data-dir <path>
```

直接磁盘生命周期操作。有兄弟 `ai-memory` 进程存活即拒绝，SQLite 已含行也拒绝。`reindex` 是从文件重建的路径，不是就地脏索引修复。

markdown wiki 完好而你有意想要全新 SQLite 迁移谱系时用它：

1. 停服务器或容器。
2. 备份当前数据目录。
3. 移动或删除 `<data-dir>/db/memory.sqlite` 及其 WAL/SHM 同伴。
4. 跑 `ai-memory reindex --data-dir <data-dir>`。
5. 重启后需要重建嵌入就跑 `ai-memory embed`。

重建什么：

- 从 `_meta.md` 重建 workspace 与项目，保留 wiki 目录名里编码的 UUID。
- 从 markdown 文件重建最新页面行、页面链接与 FTS。

不重建什么：

- 会话、观察、交接、用户/token、审计行、访问计数器与嵌入。那些是仅 DB 状态；需要的话保留备份。

## 操作者工作流

### 「全新开始」（全部擦掉）

数据在宿主上的 docker / 绑定挂载部署：

```bash
ssh homelab
cd ~/deploy/ai-memory
docker compose down
sudo rm -rf /var/opt/docker/utils/ai-memory/data/*
docker compose up -d
```

或从任何机器经 CLI（慢但可移植）：

```bash
docker stop ai-memory   # 让 sysinfo 守卫通过
ai-memory reset --confirm   # 对同一数据目录
docker start ai-memory
```

### 「高风险操作前快照」

```bash
ai-memory backup --output-path "/tmp/ai-memory-$(date +%Y%m%d-%H%M).tar.gz"
# ……做危险的事……
# ……糟了坏了……
docker compose down
ai-memory restore --from /tmp/ai-memory-2026-05-23-1530.tar.gz --confirm
docker compose up -d
```

### 「扔掉一个实验项目，其余全留」

```bash
ai-memory purge-project --project experimental --confirm
# 兄弟项目（ai-memory、distrobox-gaming……）不受影响。
```

### 「移动目录后重命名项目」

```bash
ai-memory rename-project --from old --to new
# /path/to/new 里的未来会话会追加进同一项目
# （钩子路由器按 basename(cwd) = "new" 盖戳）；过去观察
# 也留在该项目下，因为 project_id 稳定。
```

### 「把捕获在错误项目下的会话接回去」

```bash
ai-memory move-session <session-id> --to my-project          # dry run
ai-memory move-session <session-id> --to my-project --confirm
# 或把杂散项目清空进正确项目、再扔掉空壳：
ai-memory move-session --from-project tmp --to my-project --confirm
ai-memory purge-project --project tmp --confirm
```

## 这为什么重要：扁平 wiki 事件

逐项目磁盘布局（提交至 `e7b9a17`）之前，wiki 是扁平的：`wiki/<page-path>` 不分项目。两个 `pages.path` 相同的项目在磁盘共享一个文件。`purge-project` 处理器随后迭代删除那些文件，砸掉了兄弟项目拥有的页面。兄弟的 DB 行幸存（外键按 `project_id` 划界），但每次 `/web/` 点击都 404，因为磁盘文件没了。

发布的创可贴是每次删除前的 `path_still_referenced` 检查。正确的修复落在 `e7b9a17`：逐项目磁盘根让路径碰撞结构上不可能。创可贴与底层的 bug 类都消失了。生命周期操作现在是构造上安全的。

这也是 `rename-project` 免费的原因：磁盘路径以代理键 `project_id` 而非可变名为键。重命名碰一列；什么也不动。
