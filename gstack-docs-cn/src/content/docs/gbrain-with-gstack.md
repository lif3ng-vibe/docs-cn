---
title: "在 GStack 中使用 GBrain"
---


你的编码 agent，拥有一份真正留得住的记忆（memory）。

[GBrain](https://github.com/garrytan/gbrain) 是一个为 AI agent 设计的持久化知识库。它存储你的 agent 学到的东西、你做过的决定、哪些做法有效哪些无效，并让 agent 随时按需检索这一切。GStack 给你一条从零到"gbrain 已在运行，我的 agent 能调用它"的单命令路径——无论是本地先试试、与团队共享，还是介于两者之间的任何形态，都有对应方案。

这是完整版指南：覆盖所有场景、所有 flag、所有辅助 bin、所有排障步骤。想要快速了解，请看 [README 的 GBrain 章节](/#gbrain给你的编码-agent-的持久知识)。错误码与同步专项问题请看 [docs/gbrain-sync.md](/gbrain-sync/)。

---

## 一条命令安装

```bash
/setup-gbrain
```

就这样。该技能会探测你的当前状态，最多问三个问题，然后带你走完安装、初始化、Claude Code 的 MCP 注册，以及按仓库的信任策略（trust policy）。在一台什么都没装的干净 Mac 上，五分钟内完成。在已经配置过部分的 Mac 上只需几秒（它会检测既有状态并跳过已完成的工作）。

## 配置完成后你会得到什么

`/setup-gbrain` 跑完后，你的编码 agent 拥有了两个此前没有的检索面：

- **跨本仓库的语义代码搜索**。`gbrain search "browser security canary"` 返回的是排序后的文件区域，而不是精确匹配的 grep 命中。`gbrain code-def`、`code-refs`、`code-callers`、`code-callees` 按符号遍历调用图——当你不知道实现藏在哪个文件、但知道它的功能时特别有用。当问题是语义性的，agent 会优先使用这些命令而非 Grep；CLAUDE.md 会写入一个 `## GBrain Search Guidance` 块，教会 agent 这套路由规则。
- **跨会话记忆**。过往会话中的计划、复盘（retro）、决定与心得存放在 `~/.gstack/`，并且（如果你开启了产物同步）会被推送到一个由 gbrain 索引的私有 git 仓库。`gbrain search "what did we decide about auth?"` 能真正找到之前那份 CEO 计划，而不是每个会话都要你重新描述一遍背景。

如果你还启用了远程 MCP（下文路径 4），brain 查询会路由到一台其他机器也能写入的共享 brain 服务器——你的笔记本、台式机和队友的机器看到的是同一份记忆。

## 四条路径

当技能问"你的 brain 应该放在哪里？"时，你从中选一条。

### 路径 1：Supabase，已有连接串

最适合：你（或队友的云端 agent）已经开了一个 Supabase brain，想让这台本地机器使用同一份数据。

**会发生什么**：粘贴 Session Pooler URL（Settings → Database → Connection Pooler → Session → 复制 URI，端口 6543）。技能以关闭回显的方式读取它，给你看一个脱敏预览（`aws-0-us-east-1.pooler.supabase.com:6543/postgres`——主机可见、密码打码），再通过 `GBRAIN_DATABASE_URL` 环境变量交给 `gbrain init`，URL 绝不会写进 argv 或你的 shell 历史。

**信任警告**：粘贴这个 URL，等于给你本地的 Claude Code 对共享 brain 中每一页的完整读写权限。如果这不是你想要的信任级别，请改选 PGLite 本地（路径 3），并接受两个 brain 互不相通。

### 路径 2a：Supabase，自动开通新项目

最适合：全新的 Supabase 账号，想零点击得到一个干净的新项目。

**会发生什么**：你粘贴一个 Supabase Personal Access Token（PAT）。技能会先向你披露权限范围——*该 token 授予你 Supabase 账号下所有项目的完整访问权，而不只是我们即将创建的这一个*。它会列出你的组织，问你选哪个以及哪个区域（默认 `us-east-1`），生成数据库密码，调用 `POST /v1/projects`，每 5 秒轮询一次 `GET /v1/projects/{ref}` 直到项目状态为 `ACTIVE_HEALTHY`（180 秒超时），取回 pooler URL，交给 `gbrain init`。端到端约 90 秒。

结束时：明确提醒你到 https://supabase.com/dashboard/account/tokens 撤销该 PAT。技能此时已把它从内存中丢弃。

**如果你在开通中途 Ctrl-C**：SIGINT trap 会打印你进行中的项目 ref 和一条恢复命令。你可以去 Supabase dashboard 删掉这个孤儿项目，或者运行 `/setup-gbrain --resume-provision <ref>` 从中断处继续。

### 路径 2b：Supabase，手动创建

最适合：你宁可自己在 supabase.com 上点一圈，也不想粘贴 PAT。

**会发生什么**：技能带你走完四个手动步骤（注册 → 新建项目 → 等约 2 分钟 → 复制 Session Pooler URL），然后接手路径 1 的粘贴步骤。安全处理方式与路径 1 相同。

### 路径 3：PGLite 本地

最适合：先试试看，不注册账号、不上云、不共享。或者想要一个与任何云端 agent 隔离的专属"这台 Mac 的 brain"。

**会发生什么**：`gbrain init --pglite`。brain 存放在 `~/.gbrain/brain.pglite`。初始化本身不发起任何网络调用。30 秒搞定。

**嵌入模型（embedding model**）。当设置了 `VOYAGE_API_KEY` 时，gstack 会以 `voyage-code-3`（1024 维）初始化 PGLite——这是 Voyage 面向代码的专用嵌入模型，在本代码库的符号查询上正面对比胜过其通用的 `voyage-4-large` 和 OpenAI 的 `text-embedding-3-large`。未设置 `VOYAGE_API_KEY` 时，gbrain 自动选择（存在 `OPENAI_API_KEY` 则用 OpenAI 1536 维，否则沿其 provider 链回退）。无论哪种，嵌入都会在同步期间调用所选 provider 的 API——运行 `/sync-gbrain` 前请先设好你想要的 provider 的 key。

如果你只是想在上云之前感受一下 gbrain，这是最好的首选。之后随时可以用 `/setup-gbrain --switch` 迁移。

### 路径 4：远程 gbrain MCP（双引擎拆分）

最适合：你的 brain 跑在你可控的另一台机器上（Tailscale、ngrok、内网 LAN）或队友的服务器上。你想要跨机器记忆的好处，又不想在本地搭数据库，同时还想在这台 Mac 上保留符号感知的代码搜索。

**会发生什么**：你粘贴一个 MCP URL（如 `https://wintermute.tail554574.ts.net:3131/mcp`）和一个 bearer token。技能在线验证该 URL，把 gbrain 以 HTTP MCP 形式注册进用户级 `~/.claude.json`，并提议顺便为代码搜索搭一个极小的本地 PGLite（约 30 秒，约 120 MB 磁盘）。

如果你接受了本地 PGLite，你就进入了**双引擎模式（split-engine**）：

- **Brain/上下文查询**（`mcp__gbrain__search`、`mcp__gbrain__query`、`mcp__gbrain__get_page`）路由到远程 MCP。计划、复盘、心得、跨机器记忆——全在共享服务器上。
- **代码查询**（`gbrain code-def`、`code-refs`、`code-callers`、`code-callees`，以及面向代码的 `gbrain search`）通过每个 worktree 里的 `.gbrain-source` pin 路由到本地 PGLite。本地索引、速度快、永不离开这台机器。

在本机回环地址（`localhost`、`127.0.0.1`、`::1`）上对这台机器自己的 Postgres brain 跑 `gbrain serve --http`，并不属于路径 4。那是 gbrain 官方推荐的"Postgres brain 上跑本地 agent"的用法（`gbrain bootstrap harness`），gstack 会将其视为本地 brain：转录在这里通过 `gbrain import` 走。gstack 仅凭 URL 和本地 gbrain 配置就做出这个判定，且只有配置里是 Postgres `database_url` 才算数。回环 URL 配上本地 PGLite 则仍属路径 4——所以当你通过 SSH 隧道或回环端口转发到达远程 brain 时，上面的双引擎设置依然照常工作。

两个引擎相互独立。抹掉本地 PGLite 不会动到远程 brain；轮换远程 MCP 的 bearer 也不影响本地代码搜索。如果你的远程 brain 管理员没法（或不该）索引每个开发者的 checkout，这也是正确的配置形态——本地代码留在本地。

## 为 Claude Code 注册 MCP

默认情况下技能会问"要给 Claude Code 一个 gbrain 的类型化工具面吗？"你答是，它就运行：

```bash
claude mcp add gbrain -- gbrain serve
```

这会把 gbrain 的 stdio MCP 服务器注册进 Claude Code。此后 `gbrain search`、`gbrain put`、`gbrain get` 等在每次会话里都是一等公民工具，而不是 bash 外壳调用。

**如果 `claude` 不在 PATH 上**，技能会优雅跳过 MCP 注册并给出手动注册提示。CLI 解析器在任何 shell 调用 `gbrain` 的技能里照常可用——MCP 是增强，不是前置条件。

**其他本地 agent**（Cursor、Codex CLI 等）需要各自注册 MCP。该技能 v1 以 Claude Code 为目标；其他宿主可在自己的 MCP 配置中手动注册 `gbrain serve`。

## 按远端的信任策略（三元组）

你机器上的每个仓库都要做一个策略决定：**read-write**、**read-only** 或 **deny**。

- **read-write**——你的 agent 可以在本仓库上下文中 `gbrain search`，并且能向 brain 写回新页面。你自己项目的默认值。
- **read-only**——你的 agent 可以搜索 brain，但绝不从本仓库的会话写入新页面。多客户顾问的理想选择：搜索共享 brain，却不会在客户 B 的仓库里把客户 A 的代码污染进去。
- **deny**——完全不与 gbrain 交互。该仓库对 gbrain 工具链不可见。

技能会在你第一次于某个仓库运行 gstack 技能时间一次。此后该决定长期有效——同一 git 远端的每个 worktree + 分支共享同一策略，设一次就一路跟着你。

SSH 与 HTTPS 两种远端形态归并为同一个键：`https://github.com/foo/bar.git` 和 `git@github.com:foo/bar.git` 是同一个仓库。

**修改策略：**

```bash
/setup-gbrain --repo      # 仅对本仓库重新询问

# 或直接执行：
~/.claude/skills/gstack/bin/gstack-gbrain-repo-policy set "github.com/foo/bar" read-only
```

**查看全部策略：**

```bash
~/.claude/skills/gstack/bin/gstack-gbrain-repo-policy list
```

存储位置：`~/.gstack/gbrain-repo-policy.json`，权限 0600，带 schema 版本号，未来迁移保持确定性。

## 用 `/sync-gbrain` 保持 brain 时新

`/setup-gbrain` 是一次性的上手流程。`/sync-gbrain` 则是你每次想让 gbrain 看到本仓库代码新变化时运行的动词。

```bash
/sync-gbrain                # 增量：mtime 快速路径，干净树上约几秒
/sync-gbrain --full         # 全量重建索引（大型 Mac 上约 25-35 分钟）
/sync-gbrain --code-only    # 仅代码阶段；跳过 memory + brain-sync
/sync-gbrain --dry-run      # 预演将要同步什么；不写任何东西
```

该技能运行三个阶段——code、memory、brain-sync——彼此独立。一个阶段失败不阻塞其他阶段。状态持久化到 `~/.gstack/.gbrain-sync-state.json`，重跑可以干净续接。

可能把数据送出本机的阶段（代码同步进可能位于远端的 gbrain DB、记忆摄取、brain-sync 推送）在发送前都会向出站台账（egress ledger，`~/.gstack/security/egress.jsonl`）写一条防篡改回执（receipt），并遵循失败即关闭（fail-closed）：回执写不进去，该阶段就以 `EGRESS_RECEIPT_FAILED` 拒绝执行，而不是无记录地同步。修复通常是 `mkdir -p ~/.gstack/security && chmod -R u+w ~/.gstack/security`，然后重跑。用 `gstack-egress list` 查看回执。

**在全新 worktree 上它会做什么：**

1. **预检**。检查 `gbrain_local_status`（本地引擎的健康状况）。如果引擎是 `broken-db` 或 `broken-config`，技能会 STOP 并给出修复菜单——它拒绝静默降级。如果本地引擎不存在且你处于远程 MCP 模式（路径 4），代码阶段会干净地 SKIP，只跑 brain-sync。
2. **代码阶段**。通过 `gbrain sources add` 把当前目录注册为联邦源（federated source），在仓库根写入 `.gbrain-source` pin 文件（kubectl 风格的 context——每个 worktree 有自己的 pin，Conductor 的兄弟 worktree 不会互相冲突），然后运行 `gbrain sync --strategy code`。
3. **记忆阶段**。暂存你的 `~/.gstack/` 转录与精选记忆。本地 stdio MCP 模式下摄取进本地引擎。远程 HTTP MCP 模式下，把暂存的 markdown 持久化到 `~/.gstack/transcripts/run-<pid>-<ts>/`，供远程 brain 管理员的拉取管线处理。摄取超时默认 30 分钟；大型 brain 可用 `GSTACK_INGEST_TIMEOUT_MS` 调高（接受 1 分钟–24 小时）。超时时 gbrain 的 import 检查点会保留，下次 `/sync-gbrain` 从断点续跑而非从头再来。
4. **Brain-sync 阶段**。如果你配置了私有产物仓库，把精选产物（计划、设计、复盘）推送过去。
5. **CLAUDE.md 指引**。对往返链路做能力检查（写一页 → 搜索 → 找到它）。绿灯则把 `## GBrain Search Guidance` 块写进你项目的 CLAUDE.md；红灯则移除该块——绝不该告诉 agent 去用一个没安装的工具。

**水位线（watermark**）。同步状态按 commit hash 前进。如果 gbrain 碰到无法索引的文件（单文件 5 MB 硬限制，或文件在同步中途消失），水位线原地不动，后续同步继续重试。要确认一个无法修复的失败并跨过它：

```bash
gbrain sync --source <source-id> --skip-failed
```

可重复运行、幂等，同一台机器上从多个终端并发运行也安全（锁在 `~/.gstack/.sync-gbrain.lock`）。

## 之后切换引擎

选了 PGLite，现在想加入团队 brain？一条命令：

```bash
/setup-gbrain --switch
```

技能会以 `timeout 180s` 包裹运行 `gbrain migrate --to supabase --url "$URL"`。迁移是双向的（Supabase → PGLite 也可以）且无损——页面、chunk、嵌入、链接、标签与时间线全部照搬。你的原 brain 会保留为备份。

**如果迁移卡住**：可能是另一个 gstack 会话正持有源 brain 的锁。超时在 3 分钟触发，并给出可操作的信息。关掉其他工作区再重跑。

## GStack 记忆同步（另一回事）

这与 gbrain 本身是两码事。你的 gstack 状态（`~/.gstack/`——心得、计划、复盘、时间线、开发者画像）默认是机器本地的。"GStack 记忆同步"可选地把其中一份经过精选、扫描过秘密的子集推送到一个私有 git 仓库，让你的记忆跟着你跨机器走——而且如果你在跑 gbrain，那个 git 仓库在那边也可被索引。

开启方式：

```bash
gstack-artifacts-init
```

你会收到一次性的隐私询问：**全部加入白名单** / **仅产物**（计划、设计、复盘、心得——跳过时间线之类的行为数据）/ **关闭**。每次技能运行都会在开始与结束时同步队列——没有守护进程，没有后台进程。

疑似秘密的内容（AWS key、GitHub token、PEM 块、JWT、bearer token）在离开你的机器之前就会被拦截，不参与同步。

**在新机器上**：把 `~/.gstack-artifacts-remote.txt` 拷贝过去（旧名
`~/.gstack-brain-remote.txt` 仍然有效），运行 `gstack-brain-restore`，
昨天的心得就会出现在今天的笔记本上。

完整指南：[docs/gbrain-sync.md](/gbrain-sync/)。错误索引：[docs/gbrain-sync-errors.md](/gbrain-sync-errors/)。

`/setup-gbrain` 会在初始设置结束时提议帮你接上这一层——多一个 AskUserQuestion 而已，且复用同一套私有仓库基础设施。

## 清理孤儿项目

如果你在开通中途按过 Ctrl-C、定名之前试过三个名字，或者以其他方式攒下了一堆 gbrain 形态但不再使用的 Supabase 项目，有个子命令专治这个：

```bash
/setup-gbrain --cleanup-orphans
```

技能会重新收一个 PAT（一次性，用后即弃），列出你 Supabase 账号下所有名字以 `gbrain` 开头且 ref 与你活跃的 `~/.gbrain/config.json` pooler URL 不匹配的项目。对每个孤儿项目逐个询问：*"删除孤儿项目 `<ref>`（`<name>`，创建于 `<date>`）？"*——不批量，没有"全部删除"捷径。活跃 brain 永远不会被列入删除选项。

## 命令与 flag 参考

### `/setup-gbrain` 进入模式

| 调用方式 | 作用 |
|---|---|
| `/setup-gbrain` | 完整流程：探测状态、选路径、安装、初始化、MCP、策略、可选的记忆同步 |
| `/setup-gbrain --repo` | 仅修改当前仓库的按远端信任策略 |
| `/setup-gbrain --switch` | 迁移引擎（PGLite ↔ Supabase），不重跑其他步骤 |
| `/setup-gbrain --resume-provision <ref>` | 恢复一次在轮询期间被打断的路径 2a 自动开通 |
| `/setup-gbrain --cleanup-orphans` | 列出并逐个删除孤儿 Supabase 项目 |

### bin 辅助脚本（用于脚本化）

| Bin | 用途 |
|---|---|
| `gstack-gbrain-detect` | 以 JSON 输出当前状态：gbrain 是否在 PATH、版本、配置引擎、doctor 状态、同步模式。`--doctor` 运行 `/setup-gbrain` 第 5 步使用的完整 brain 健康门禁（`gbrain doctor --json --scope=brain`）；它打印 `brain_ok`、`brain_failures` 与 `skill_failures`，仅在 `brain_ok` 为真时以 0 退出。失败的技能检查（gbrain 给别的 agent 的 skills 目录打分）绝不决定 `brain_ok`。 |
| `gstack-gbrain-install` | 先探测的安装器（依次探测 `~/git/gbrain`、`~/gbrain`，再全新 clone）。有 `--dry-run` 与 `--validate-only` flag。PATH 遮蔽检查以退出码 3 加修复菜单结束。 |
| `gstack-gbrain-lib.sh` | 被 source 而非被执行。提供 `read_secret_to_env VARNAME "prompt" [--echo-redacted "<sed-expr>"]` |
| `gstack-gbrain-supabase-verify` | URL 结构检查。以退出码 3 拒绝直连 URL（`db.*.supabase.co:5432`） |
| `gstack-gbrain-supabase-provision` | Management API 封装。子命令：`list-orgs`、`create`、`wait`、`pooler-url`、`list-orphans`、`delete-project`。全部要求环境中有 `SUPABASE_ACCESS_TOKEN`。`create` 与 `pooler-url` 还要求 `DB_PASS`。每个子命令都有 `--json` 模式。 |
| `gstack-gbrain-repo-policy` | 按远端的信任三元组。子命令：`get`、`set`、`list`、`normalize` |
| `gstack-gbrain-source-wireup` | 通过 `gbrain sources add` + `git worktree` 把你的 `~/.gstack/` brain 仓库注册为 gbrain 的联邦源，然后跑一次初始 `gbrain sync`。幂等。取代 v1.12.x 已废弃的 `consumers.json + /ingest-repo` HTTP 接线。Flag：`--strict`、`--source-id <id>`、`--no-pull`、`--uninstall`、`--probe`。 |

### gbrain CLI（上游工具）

gbrain 自带的这些命令由 gstack 封装：

| 命令 | 用途 |
|---|---|
| `gbrain init --pglite` | 初始化本地 PGLite brain |
| `gbrain init --non-interactive` | 通过环境变量初始化（`GBRAIN_DATABASE_URL` 或 `DATABASE_URL`）。绝不要把 URL 当 argv 传——会泄漏进 shell 历史。 |
| `gbrain doctor --json` | 健康检查。返回 `{status: "healthy"|"warnings"|"unhealthy"（旧版 gbrain 为 "ok"）, health_score: 0-100, checks: [...]}`。`--scope=brain`（gbrain v0.41.20+）跳过技能检查。 |
| `gbrain migrate --to supabase --url ...` | 把 PGLite brain 迁到 Supabase（无损，源保留为备份） |
| `gbrain migrate --to pglite` | 反向迁移 |
| `gbrain search "query"` | 搜索 brain |
| `gbrain put "<slug>" --content "<markdown-with-frontmatter>"` | 写入一页（标题/标签放在 `--content` 内的 YAML frontmatter 里） |
| `gbrain get "<slug>"` | 取回一页 |
| `gbrain serve` | 启动 MCP stdio 服务器（`claude mcp add` 所用） |

### 配置文件与状态

| 路径 | 存放内容 |
|---|---|
| `~/.gbrain/config.json` | 引擎（pglite/postgres）、数据库 URL 或路径、API key。权限 0600。由 `gbrain init` 写入。 |
| `~/.gstack/gbrain-repo-policy.json` | 按远端的信任三元组。Schema v2。权限 0600。 |
| `~/.gstack/.setup-gbrain.lock.d` | 并发运行锁（原子 mkdir）。正常退出与 SIGINT 时释放。 |
| `~/.gstack/.brain-queue.d/` | gstack 记忆同步的待同步记录——maildir 式 spool，每条记录一个文件。旧版本遗留的 `.brain-queue.jsonl` 会在下次 drain 时自动迁移。 |
| `~/.gstack/.brain-last-push` | 上次同步推送的时间戳（供 `/health` 评分） |
| `~/.gstack-artifacts-remote.txt` | gstack 记忆同步远端的 URL（可安全跨机器拷贝；旧名 `~/.gstack-brain-remote.txt` 仍被读取） |
| `~/.gstack/.setup-gbrain-inflight.json` | 留待未来 `--resume-provision` 持久化状态使用 |

### 环境变量

| 变量 | 读取方 | 作用 |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | `gstack-gbrain-supabase-provision` | Management API 调用用的 PAT。每次 setup 运行后即弃。 |
| `DB_PASS` | `gstack-gbrain-supabase-provision`（create、pooler-url） | 生成的数据库密码。绝不进 argv。 |
| `GBRAIN_DATABASE_URL` | `gbrain init`、`gbrain doctor` 等 | Postgres 连接串（我们这里用 Supabase pooler URL）。环境变量优先于 `~/.gbrain/config.json`。 |
| `DATABASE_URL` | `gbrain init`（回退） | 语义与 `GBRAIN_DATABASE_URL` 相同；第二个被检查。 |
| `SUPABASE_API_BASE` | `gstack-gbrain-supabase-provision` | 覆盖 Management API 主机。测试用来指向 mock 服务器。 |
| `GBRAIN_INSTALL_DIR` | `gstack-gbrain-install` | 覆盖默认安装路径（`~/gbrain`） |
| `GSTACK_HOME` | 所有 bin 辅助脚本 | 覆盖 `~/.gstack` 状态目录。测试大量使用。 |
| `VOYAGE_API_KEY` | `gbrain embed` 子进程；gstack PGLite 初始化 | 设置后，gstack 以 `voyage-code-3`（1024 维）初始化 PGLite，Voyage 面向代码的专用嵌入模型。在本代码库的符号查询上正面对比胜过 `voyage-4-large` 与 OpenAI 的 `text-embedding-3-large`。A/B 数据见 CHANGELOG v1.43.1.0。 |
| `OPENAI_API_KEY` | `gbrain embed` 子进程 | 未设置 `VOYAGE_API_KEY` 时（gbrain 自动选择的回退，`text-embedding-3-large` 1536 维），在 `gbrain sync` / `/sync-gbrain` 期间用于嵌入。两个 key 都没有时，页面仍按结构导入（符号表、chunk），但语义搜索降级——同步日志里会出现 `[gbrain] embedding failed for code file ...`。 |
| `ANTHROPIC_API_KEY` | `claude-agent-sdk`、付费评测 | 付费评测（`bun run eval:bg:pr`）与任何直接对 Claude 的 `query()` 调用所必需。 |
| `GSTACK_OPENAI_API_KEY` | `lib/conductor-env-shim.ts` | Conductor 注入的回退。当规范名为空时提升为 `OPENAI_API_KEY`。 |
| `GSTACK_ANTHROPIC_API_KEY` | `lib/conductor-env-shim.ts` | Anthropic 侧的同款模式。 |

## Conductor 与 GSTACK_* 环境变量

如果你在 [Conductor](https://conductor.build) 工作区里跑 gstack，**Conductor 会显式从工作区环境中剥除 `ANTHROPIC_API_KEY` 与 `OPENAI_API_KEY`**。在 `~/.zshrc` 或 `.env` 里设置没用——剥除发生在环境继承之后。要让一个可用的 API key 进入工作区，请改在 Conductor 的工作区环境配置里设置 `GSTACK_ANTHROPIC_API_KEY` 与 `GSTACK_OPENAI_API_KEY`。Conductor 会原样透传它们。

`lib/conductor-env-shim.ts` 在 gstack 侧补上了这道缝：当以副作用方式导入（`import "../lib/conductor-env-shim";`）时，它会把 `GSTACK_FOO_API_KEY` 提升为 `FOO_API_KEY`，供任何看不到规范名的子进程使用。该 shim 已接线到：

- `bin/gstack-gbrain-sync.ts`——让 `/sync-gbrain` 能拿到 OpenAI 做嵌入
- `bin/gstack-model-benchmark`——让 `--judge` 运行无需手动映射环境变量
- `scripts/preflight-agent-sdk.ts`——让付费评测的鉴权探测可用
- `test/helpers/e2e-helpers.ts`——让付费评测找得到 Anthropic

如果你新增一个会打付费 API 或需要 gbrain 嵌入的 TS 入口，请在顶部加上同样的一行 import。贡献者清单见 [CONTRIBUTING.md "Conductor workspaces"](/contributing/#conductor-工作区)。

`bin/gstack-codex-probe` 是 bash 写的，不直接读这些变量——它依赖 Codex CLI 管理的 `~/.codex/` 鉴权。

## 安全模型

这个技能碰到的每一个秘密都遵守同一条规则：**只走环境变量，绝不进 argv，绝不被记录，绝不由我们写盘**。唯一的持久存储是 gbrain 自己的 `~/.gbrain/config.json`（权限 0600），那是 gbrain 的纪律，不是我们的。

**代码层面强制：**

- `test/skill-validation.test.ts` 中的 CI grep 测试：`$SUPABASE_ACCESS_TOKEN` 或 `$GBRAIN_DATABASE_URL` 出现在 argv 位置即让构建失败
- CI grep 测试：`--insecure`、`-k` 或 `NODE_TLS_REJECT_UNAUTHORIZED=0` 出现在 `bin/gstack-gbrain-supabase-provision` 中即失败
- provision 辅助脚本顶部的 `set +x` 防止调试跟踪泄漏 PAT
- 遥测（telemetry）载荷只含枚举型分类值（场景、安装结果、MCP 是否启用、信任层级）——绝无可能携带秘密的自由文本

**测试层面强制：**

- `test/secret-sink-harness.test.ts` 以一个种入的秘密运行每个处理秘密的 bin，断言该种子不出现在任何被捕获的通道（stdout、stderr、`$HOME` 下的文件、telemetry JSONL）中。每个种子四条匹配规则：精确、URL 解码、前 12 字符前缀、base64。
- 同一测试文件中的阳性对照故意在每个被覆盖的通道泄漏种子，并断言测试架能逐个抓到。没有阳性对照，一个静默漏报的测试架和一个正常工作的测试架看起来毫无区别。

**你仍可能泄漏什么**（v1 的诚实边界）：

- 如果你把秘密粘贴进 `read -s` 之外的普通聊天消息，它会留在会话转录和任何宿主侧日志里
- 泄漏测试架不 dump 子进程环境——一个执行 `env >> ~/.log` 的 bin 能躲过检测（v1 没有任何 bin 这么做；grep 测试防着它）
- 你的 shell 自身的 `HISTFILE` 行为是 shell 的事，不是我们的——我们从不把秘密传进 argv，所以它们不会经我们的代码落到那里，但没人拦得住你亲手把秘密粘进一条裸 `curl` 命令

## 排障

### 安装时报 "PATH SHADOWING DETECTED"

PATH 里另一个 `gbrain` 二进制排在安装器刚链接的那个之前。安装器的版本检查抓到了它。任选其一修复：

- 不需要另一个的话，`rm $(which gbrain)`
- 在 shell rc 里把 `~/.bun/bin` 前置到 PATH，让链接出的二进制获胜
- 把 `GBRAIN_INSTALL_DIR` 设为遮蔽二进制的安装目录，重跑

然后重跑 `/setup-gbrain`。

### "rejected direct-connection URL"

你粘贴了 `db.<ref>.supabase.co:5432` URL。它们仅支持 IPv6，在多数环境会失败。请改用 Session Pooler URL：Supabase dashboard → Settings → Database → Connection Pooler → **Session** → 复制 URI（端口 6543）。

### 自动开通在 180 秒超时

Supabase 项目仍在初始化。你的 ref 已打印在退出信息里。等一分钟，然后：

```bash
/setup-gbrain --resume-provision <ref>
```

技能会重新收一个 PAT，跳过项目创建，恢复轮询。

### "Another `/setup-gbrain` instance is running"

你有一个残留的锁目录。如果确定没有其他实例真的在跑：

```bash
rm -rf ~/.gstack/.setup-gbrain.lock.d
```

然后重跑。

### 策略文件上的 "No cross-model tension"

你手动编辑过 `~/.gstack/gbrain-repo-policy.json`，里面还是旧版 `allow` 值？没问题。下次读取时，gstack 自动把 `allow` 迁移为 `read-write` 并加上 `_schema_version: 2`。stderr 一行日志，幂等、确定性。

### `gbrain doctor` 报 "warnings"

`/health` 视之为黄而非红。运行 `gbrain doctor --json | jq .checks` 看哪些子检查在警告。典型原因：resolver 的 MECE 重叠（技能名冲突）或数据库连接尚未配置。

### `/sync-gbrain` 报 `OK` 但 `gbrain search` 搜不出语义结果

导入期间嵌入多半失败了。符号查询（`code-def`、`code-refs`）仍可用，因为它们不需要嵌入，但 `gbrain search "<terms>"` 会退到降级的 BM25 路径。在同步输出里找这样的行：

```
[gbrain] embedding failed for code file <name>: OpenAI embedding requires OPENAI_API_KEY
```

修复办法是重跑前把某个 provider 的 API key 放进进程环境。代码场景首选 `VOYAGE_API_KEY`（设置后 gstack 默认给 PGLite 用 `voyage-code-3`）；否则 `OPENAI_API_KEY` 回退到 `text-embedding-3-large`。在裸 Mac shell 上，调用前先从 `~/.zshrc` source 好 key。在 Conductor 里，`lib/conductor-env-shim.ts` 会自动把 `GSTACK_ANTHROPIC_API_KEY` / `GSTACK_OPENAI_API_KEY` 提升为规范名；`VOYAGE_API_KEY` 则直接设到你的 Conductor 工作区环境里。重跑 `/sync-gbrain --code-only` 可为已导入的页面补齐嵌入。

### `gbrain sync` 卡在某个 commit hash —— `FILE_TOO_LARGE`

你树里有个文件超过 gbrain 的 5 MB 硬限制（`gbrain/src/core/import-file.ts` 中的 `MAX_FILE_SIZE`）。常见元凶：响应回放缓存、抓取的截图、大体积 JSON fixture。代码同步不认 `.gitignore` 式的排除清单；唯一的旋钮是确认该失败并跳过：

```bash
gbrain sync --source <source-id> --skip-failed
```

水位线越过出问题的 commit。该文件若再变化会再次失败；届时再跳一次即可。

### ZeroEntropy 嵌入在 2026 年 9 月 4 日后停止工作

ZeroEntropy 被 Notion 收购，其托管 API 将于 **2026 年 9 月 4 日**下线（新注册已关闭）。配置了 `zeroentropyai` 嵌入配方的 gbrain 在该日期后仍会继续导入页面，但嵌入静默失败——页面以结构形态落库，没有语义搜索。当你的 `~/.gbrain/config.json` 指名该配方时，接线辅助脚本会发出警告；请在截止日前迁移到别的 provider（用 `VOYAGE_API_KEY` 走 Voyage，或 `OPENAI_API_KEY` 走 OpenAI）。细节、自托管注意事项与迁移讨论见 [garrytan/gstack#2365](https://github.com/garrytan/gstack/issues/2365)。

### PGLite → Supabase 切换卡住

兄弟 Conductor 工作区里的另一个 gstack 会话，可能通过其 preamble 的 `gstack-brain-sync` 调用持有你本地 PGLite 文件的锁。关闭其他工作区，重跑 `/setup-gbrain --switch`。超时上界 180 秒，你永远不会真的无限等下去。

## 为什么这样设计

**为什么用按远端的信任三元组而非二元的 allow/deny？** 多客户顾问需要"可搜索、不可写回"。一个上午做客户 A、下午做客户 B 的自由开发者，不能让 A 的代码洞察泄漏进 B 能搜索的 brain。read-only 干净利落地解决了这个问题。

**为什么不把 gbrain 打包进 gstack？** Gbrain 是一个独立且活跃开发的项目，有自己的发布节奏、schema 迁移和 MCP 接口面。打包意味着 gstack 得给 gbrain 的更新设门禁，拖慢 gbrain 的改进到达用户的速度。分离但集成，让各自按自己的节奏发布。

**为什么 `gbrain init --non-interactive` 走环境变量而非 flag？** 连接串里有数据库密码。当 argv 传会让密码落进 `ps`、shell 历史和进程列表。环境变量交接让秘密只存在于进程内存。Gbrain 同时支持 `GBRAIN_DATABASE_URL` 与 `DATABASE_URL`；我们用前者，避免与非 gbrain 工具撞名。

**为什么 PATH 遮蔽直接失败而不是警告后继续？** 被遮蔽的 `gbrain` 意味着后续每条命令调到的都不是我们刚装的那个二进制。那是一个静默的版本漂移 bug，几周后才以莫名奇妙的功能缺失现身。配置类技能只有一个职责——配出一个能用的环境。拒绝装进一个坏环境，才是配置类技能该有的行为。

**为什么不自动导入每个仓库？** 隐私加噪音。一个把你碰过的每个仓库都摄取进来的自动导入 preamble 钩子会：(a) 未经同意把工作代码泄漏进共享 brain，(b) 用一次性仓库堵塞搜索。按远端的策略让摄取成为每个仓库一次的显式决定。`/setup-gbrain` 目前不安装任何自动导入钩子——但策略存储为将来留了一个前向兼容的位置。

## 相关技能与下一步

- `/health`——在其 0-10 综合评分中包含一个 GBrain 维度（doctor 状态、同步队列深度、上次推送距今时长）。未安装 gbrain 时省略该维度；在非 gbrain 机器上跑 `/health` 不会因这个选择被扣分。
- `/gstack-upgrade`——保持 gstack 自身最新。不会独立升级 gbrain。gbrain 默认装最新 HEAD；要刷新，去你的 gbrain clone（默认 `~/gbrain`）里 `git pull` 再重跑 `/setup-gbrain`。需要可复现性时用 `gstack-gbrain-install --pinned-commit <sha>` 钉住特定 commit。低于最低受测版本的安装会被拒绝。
- `/retro`——每周复盘在记忆同步开启时从你的 gbrain 拉取心得与计划，让复盘能引用跨机器历史。

跑一把 `/setup-gbrain`，看看哪些能留下来。
