---
title: "多用户归因"
description: "ai-memory 是单租户 wiki 数据加可选的多用户归因。每个已认证请求看到同样的 wiki 页面——没有逐页 RBAC 或组权限模型。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/users.md"
---

# 多用户归因

> **状态：** v0.8 引入；本页记录当前已发布的契约。

ai-memory 是**单租户 wiki 数据**加**可选的多用户归因**。每个已认证请求看到同样的 wiki 页面——没有逐页 RBAC 或组权限模型。操作性的交接与开放会话恢复按所有者限定，让一个操作者不会意外消费或收尾另一个人的活跃上下文。多用户模式额外加的是*这是谁干的*：每次写入归因到具名用户、审计日志行携带该身份、Web UI 可以显示「Last edited by Alice Smith」而非匿名默认。部署一旦有 DB 用户或受信代理身份，每个 `/admin/*` 端点保持仅 root——含只读的 status/search/read-page 辅助。

钩子会话标识符也绑定所有者。以一个操作者认证的钩子不能复用另一个操作者的 UUID 来追加事件或触发摘要/交接/结束转换。共享的遗留会话对所有调用者保持可用。跨所有者恢复仅限 root 显式的 `finalize-session --all-owners` 路径。

共享一台服务器的已认证客户端必须为每次运行发出一个独立的智能体运行 id，并在使用会话感知 auto-scope 时在 MCP 请求上转发同一 id。存储所有者为 `NULL` 的遗留会话保持共享。

你一个人用 ai-memory 的话可以跳过本页——你的安装保持原样工作。

## 何时启用

以下情况你可能想要多用户模式：

- 多于一个人共享一台 ai-memory 服务器（一个家庭、一个小团队的家庭实验室）。
- 你想让审计日志记录每次写入*是谁*做的（如区分 `Codex` 写入、`Claude Code` 写入与手搓 CLI 调用）。
- 你打算用准入 webhook 链——webhook 在其 payload 里收到行为者身份。

以下情况你多半**不需要**它：

- 你是安装的唯一人类用户。单用户模式（无用户行）保持兼容，无论 `init` 是否生成过 `[auth].token_pepper`。
- 你需要权限/访问控制。ai-memory v1 刻意不实现 RBAC（见[设计决策](/design-decisions/) §13）。归因记录写入*是谁*做的；不门控*能不能*做。

## 四级解析阶梯

每个 HTTP 请求解析到四个认证层级之一：

| 档 | 触发 | 请求得到什么 |
|---|---|---|
| **0——匿名** | 未设 `[auth].bearer_token`。 | 允许，无身份。与多用户化之前的默认一致。 |
| **1——root** | bearer 匹配 `[auth].bearer_token`。 | 以 **root** 允许。设了 `[auth].root_username` 时写入归因到该名字；否则归因保持匿名。 |
| **1b——代理断言用户** | bearer 匹配独立的 `[auth].actor_proxy_bearer_token`。 | 身份取自受信的 `X-Memory-Actor-*` 头。该请求是**用户**——除非其 OIDC issuer/subject 对与配置的 root 对完全匹配。缺失或畸形的身份被拒绝。 |
| **2——DB 用户** | bearer 不匹配 root、匹配一行 `users.token_hash`（经 token + `[auth].token_pepper` 的 SHA-256）。 | 以**该用户**允许使用正常读写 API。多用户模式下所有 `/admin/*` 端点仅 root。审计日志记录 username/email/name。 |
| **3——401** | bearer 存在但不匹配任何东西。 | 拒绝。关上旁路——未知 bearer 不能混进匿名。 |

各档粘性：请求在第一个适用的凭据处匹配、绝不升级。启动拒绝 root 与代理凭据相等；root 与代理凭据优先于任何意外的 DB token 碰撞。

## 受信代理身份

终结 SSO 的部署校验最终用户的凭据，然后以一个仅代理可用的 bearer 向上游认证，并在 `X-Memory-Actor-*` 头里描述该人类。这些头在 root 与 DB 用户请求上**默认被忽略**，否则任何够得到端口的请求都能声称任意身份。

配置一个独立的代理凭据：

```toml
 [auth]
bearer_token = "<root-token>"                    # 直接管理
actor_proxy_bearer_token = "<different-token>"  # 仅 SSO 代理
secure_cookie = true                              # 当 /web 仅 HTTPS 时

# OIDC 代理背后 root 人类的可选稳定身份。
root_issuer = "https://idp.example"
root_subject = "<root-subject>"
```

- 代理 token **就是**开关。空值视为未设。它必须与 `bearer_token` 不同，否则 `serve` 拒绝启动（root bearer 缺失时同样）。
- 只在服务器*只*经该代理可达时设置它。
- `secure_cookie` 独立于代理身份。受信反向代理为 `/web` 终结 HTTPS 时启用它；ai-memory 绝不信转发的协议头来推断它。直接 HTTP 的浏览器不会发那个 cookie。
- **代理必须在设置自己的 `X-Memory-Actor-*` 头之前剥掉客户端提供的同名头。**用*替换*头而非追加的指令（nginx `proxy_set_header`、Traefik `customRequestHeaders`）——追加式 ingress 下客户端的值先到、就成了被读的那个。重复头与逗号折叠值以 `400` 拒绝，而不是解析成一个身份。
- 每个代理请求必须断言 `X-Memory-Actor-User`，或同时断言 `X-Memory-Actor-Issuer` 与 `X-Memory-Actor-Sub`。OIDC 字段是成对的：标准只在单个 issuer 内保证 subject 唯一。不完整的对或不点名任何人的请求以 `400` 拒绝。
- 代理调用者默认是用户。仅用户名的断言永远不能变成 root——包括等于 `root_username` 的——因为 OIDC 显示用户名不是稳定的唯一标识。代理的 root 访问要求与 `root_issuer` 加 `root_subject` 精确匹配。
- 需要 root 的源健康检查或维护调用应该用 root bearer，不是代理 bearer。root 档上的裸行为者头被忽略。

## 身份键

身份敏感的路由用*限定*身份，绝不用裸字符串。`ActorContext::identity_key()` 把请求解析为 OIDC `(issuer, subject)` 对（两者都在时）或 `user:<name>`（仅用户名身份）。两个命名空间不相交，不同 issuer 的相同 subject 保持不同。

OIDC 对优先于 `user`，因为 OIDC 把 `(iss, sub)` 定义为稳定标识并明确禁止依赖 `preferred_username` 做唯一性。从第一天就配置代理转发两个值。之后再添加显示用户名保持同一身份；从仅用户名断言迁到 OIDC 对则刻意一次性改变它。

## 交接与会话的所有权

交接与会话记录它们属于的操作者（`owner_user` / `actor_user`，持有限定 `IdentityKey::storage_key()` TEXT）。共享服务器上这阻止一个操作者的待处理交接被投递给——并被消费于——下一个启动的会话，无论属于谁。

- `NULL` 所有者意味着**与项目共享**：所有权存在之前的每行、以及任何无认证行为者的写入，对所有人保持可见。
- **只有部署区分操作者时才盖所有者戳。**单操作者服务器不受影响，即使它们经 `[auth].root_username` 命名了操作者：没有 `users` 行、没有代理 bearer 就没有可区分的人，而给唯一名字盖戳反而会分开该操作者的*传输*——HTTP 请求带名字，而 stdio / 进程内 MCP 传输与本地 CLI 完全不带行为者、会看不到 HTTP 侧写的东西。读取刻意**不**同样门控，所以部署曾经区分操作者时盖了戳的行之后仍可被该操作者读到。
- 所有者是请求点名的限定身份——`ActorContext::identity_key()`，断言了完整 issuer/subject 对时是 issuer 限定的 OIDC 键、否则是 `user:<name>`。这与决定认证档的是同一条规则，所以代理路径得到真正的逐操作者隔离而非一个共享桶。
- `memory_handoff_begin` 带 `shared: true` 刻意发布接力棒。
- `memory_handoff_accept` / `memory_handoff_cancel` 带 `any_owner: true` 作用于别人的接力棒；那个退出需要多用户模式下的管理员权限。
- `ai-memory finalize-session --all-owners` 对会话做同样的事，`GET /admin/open-sessions?all_owners=true` 是底层开关。`--session-id <uuid>` / `session_id=<uuid>` 把同样的所有者限定查找收窄到一个确切的开放会话；不能与 `--all` / `all=true` 组合。
- `GET /admin/sessions/by-agent` 报告一个作用域里每个智能体 CLI 开了多少会话。遵循同一规则：调用者自己的加未归因的，`all_owners=true` 看每个操作者的。传必需的 `workspace` 与 `project` 查询参数、可选 `since_days=N`；零或省略指全部历史。结果用稳定形状 `{"by_agent":[{"agent":"codex","sessions":3}]}`，按计数降序再按智能体名排序。未知作用域返回 404 而不创建它。与每个 `/admin/*` 路由一样，部署区分操作者时该端点仅 root。
- 只读的交接列表（`GET /api/v1/workspaces/{ws}/projects/{p}/handoffs`）把它从提示词派生的字段——`summary`、`open_questions`、`next_steps`——服务给服务器能点名的调用者（自己的行加共享的）与 root 操作者（后者反正经 wiki API 读每个页面正文）。认证服务器放不进两类的调用者拿到 `redacted: true` 的元数据。未配置认证的服务器不受影响：它本来就无认证地服务每个页面正文。默认列表保持自己加共享；root 可以用 `?all_owners=true` 请求显式恢复视图，而用户与匿名档收到 `403`。
- 交接生命周期事件触发准入 op（`handoff_begin`、`handoff_accept`、`handoff_cancel`），所以准入 webhook 可以观察或——带 `failure_policy = "reject"`——拒绝它们。这些 op 上只有 reject 策略钩子被等待；观察者在操作持久之后收到通知。

「多用户模式」在这里指*部署区分操作者*：要么存在 `users` 行、要么配置了 `[auth].actor_proxy_bearer_token`。受信代理从不写 `users` 行，所以只数行会把每个代理调用者留在放行 admin 的单操作者逃生口上。一个问题问所有门：MCP admin 工具、`/admin/*` 路由层、交接与会话上盖的所有权戳问的都是它。

## MCP 客户端活动

`GET /admin/activity/by-client` 报告服务器级 MCP 工具调用，而非生命周期会话或项目拥有的数据。有状态 HTTP 与 stdio 用净化的 MCP `clientInfo.name`；无状态请求回退到已认证代理的行为者-智能体标签、再回退 `unknown`。结果有稳定形状 `{"by_client":[{"client":"claude-code","reads":12,"writes":3}]}`，按总调用数再按客户端名排序。

`since_days=N` 纳入与该回看相交的每个 UTC 日桶；零或省略指全部历史。调用以一分钟后台间隔冲刷（即使没有后续请求到达），并每间隔重试一次失败批次；进程退出可能丢失当前间隔。每个 UTC 日至多存 128 个不同标签，多余折叠进 `other`。该端点不带 workspace 或 project，因为许多仅 MCP 客户端不提供可靠的逐调用作用域。与每个 `/admin/*` 路由一样，部署区分操作者时仅 root。

## 按操作者的记忆槽位

「缺失即共享」规则延伸到记忆槽位，所以单操作者服务器的行为与以往完全一致。`_slots/current-focus.md` 注入每个操作者的上下文；`_slots/<segment>/current-focus.md` 只注入 `path_segment()` 为 `<segment>` 的操作者（`u-alice`、混合大小写/尾点/路径不友好用户名的 `uh-<uuid>`、或完整 OIDC issuer/subject 对的 `o-<uuid>`）。该功能限定的是注入而非访问：槽位是普通 wiki 页面，所以精确读取与检索和其他页面一样保持全项目范围。此前的每个槽位都未命名空间化，因此共享。

`[slots] per_user`（默认关）是整个机制的开关。开启后：

- 会话简报与整编提示词给你共享槽位加你自己的——包括最近触碰页面的指针列表，所以另一操作者的槽位路径与标题也不进你的简报；
- 引擎给它写的槽位划命名空间：面向共享槽位的整编运行落进会话操作者自己的命名空间，而模型瞄向别人命名空间的路径被跳过而非写入或归位——那个路径来自模型，任何到达你观察的东西都能支配它；
- 点名共享槽位的 `memory_write_page` 调用被命名空间化进你自己的前缀，与引擎的做法一致（响应报告页面实际得到的路径），写进另一操作者命名空间则被拒绝（管理员仍可策展任何命名空间，含共享槽位）。

关闭时嵌套槽位路径没有特殊含义——每个槽位进每个简报，与该功能存在之前一样——所以再关掉让个人槽位重新对所有人可见，而不是搁浅它们。

`<segment>` 从该服务器上的限定身份派生：短、小写、路径安全的 ASCII 用户名保持可读，而混合大小写、尾点或其他路径不友好的用户名或完整 OIDC issuer/subject 对变成有界的确定性标识。把可读段限制为无尾点小写，防止不同身份在受支持的大小写不敏感文件系统上产出比较起来一样的路径名。OIDC 对优先于用户名；见上文「身份键」。每个具名操作者拥有一个可用的命名空间，长或路径不友好的值绝不回退到共享槽位。限定段的一个后果值得明说：该功能之前写的嵌套路径（`_slots/backend/…`）拼出的段没有任何限定身份能产出，所以标志开启时它不属于任何人、到达不了任何简报——直到标志关回或管理员给它归位。

大小写不敏感命名空间修复之前，`Alice` 这样的混合大小写用户名用可读段 `u-Alice`，尾点用户名保留尾点；两者现在都用确定性 `uh-<uuid>` 段。ai-memory 不能安全地自动移动旧目录，因为大小写不敏感文件系统可能已把它与另一身份合并。升级带 `[slots] per_user = true` 共享部署的管理员必须检视受影响的 `u-…` 槽位目录，把确认的内容归位到拥有它的操作者的新命名空间。所有权确立前保留旧页面；不要只从文件名大小写推断它。

一个缺口是刻意记录而非关闭的：`ai-memory bootstrap` 以模型从仓库自身 README、docs 与代码里挑的路径写页面，没有可归因的操作者，所以带注入指令的仓库能让它写一页 `_slots/…`。它是管理员对管理员选择摄取的仓库做的仅管理员操作，且标志关闭时行为相同；审阅 `bootstrap.md`——它列出每个写入的路径。

## 其他逐操作者状态

归因之外，一些引擎状态按操作者记录。「缺失即共享」是贯穿始终的规则——未记录操作者的行表现得与该列存在之前完全一样——所以单操作者服务器保持其历史行为：

- **自动改进提案。**每条记录暂存它的操作者（限定身份键——用户名或完整 OIDC issuer/subject 对——所以代理断言的人类也算，且显示在提案详情上），且「每页一条待处理提案」规则按操作者适用，操作者不再互相阻塞。不过只在部署区分操作者之处：别处提案保持未归因、原有的每页一条规则原样保持。计划运行没有调用者、未归因暂存；遥测报告与 curator 描述项目而非个人、同样保持未归因，所以它们既不阻塞也不被任何具名操作者对同一页面的待处理提案阻塞。

  确实与一条已待处理提案碰撞的提案自己被跳过——该运行的其他提案照常暂存——且每个暂存面带着目标路径与理由报告跳过（MCP 与 `/admin` 响应的 `skipped` 列表、CLI 输出、调度器日志），所以一次 N-1 条提案的运行绝不与干净的 N-1 条运行静默难辨。
- **页面强化。**每个已识别操作者的首次强化读取与既有共享访问计数器一起逐页记录。`[decay] breadth_weight`（默认 `0.0`）可选地让被许多不同人强化过的页面胜过被单人反复读的页面——遗忘清扫读逐页的不同操作者计数并喂进留存分数。默认下、以及任何权重下不同读者少于两名的页面，留存分数不变。

## 实现契约

请求身份与授权分离：

- `ActorContext` 携带谁发了请求，用于归因、frontmatter、审计 payload 与活跃项目键。
- `AuthLevel` 携带中间件解析出的认证档。
- `AuthLevel::authorize(Capability::...)` 是 admin 路由、用户管理路由、正常读写面与准入链跳过头的共享权限检查。

处理器不应比较用户名、从 `ActorContext` 推断 root、或添加临时的 root 专属分支。触碰认证行为的 PR 应覆盖 root、DB 用户与匿名调用者，包括 `[auth].token_pepper` 缺失的单用户兼容模式。

## 快速开始

> 前提：一次全新的 `ai-memory init`。v0.8 之前的安装需要先做下面的[迁移步骤](#迁移既有的单用户安装)，这些命令才能工作。

### 1. 设定 root 身份

编辑你的 `config.toml`（通常是 `<data_dir>/config.toml` 或 `/etc/ai-memory/config.toml`），取消 `[auth]` 块里 `root_*` 行的注释：

```toml
[auth]
bearer_token = "<your-existing-token-or-a-fresh-one>"
token_pepper = "<auto-generated-by-ai-memory-init>"

root_username = "boss"            # root 归因必需
root_email    = "boss@example.com" # 可选，展示在 UI
root_name     = "Boss"             # 可选，展示在 UI
```

`token_pepper` 由 `ai-memory init` 自动生成；**加用户之后不要改它**——轮换 pepper 使每个既有 token 失效。pepper 让被偷的 `users` 表对离线攻击者无用；同时拿到 DB 和配置的攻击者反正有 token 可用，所以 pepper 的职责由文件权限边界关闭。

`init` 在任何用户存在之前创建 pepper。第一个用户加入前，运营 admin 端点保持单用户兼容；创建第一个用户立即把它们切成仅 root，无需重启。过期的用户行仍保持 admin 模式仅 root。数据库有用户而 pepper 或静态 root bearer 缺失或为空时，`serve` 拒绝启动。从配置备份恢复两个原始秘密（或从秘密管理器设 root bearer），而不是删用户；管理既有用户需要 root token。

### 2. 添加另一个用户

每次 `ai-memory user add` 发一个 token，**恰好**打印一次。DB 只保留其 SHA-256 摘要。

```console
$ AI_MEMORY_AUTH_TOKEN=<root-token> \
  ai-memory user add --username alice --email alice@home --name "Alice Smith"

✓ created user 'alice'
  name:  Alice Smith
  email: alice@home
  id:    01935a82-6f7a-7d22-b8c0-...

Store this token now — it will NOT be shown again. Only its
SHA-256 digest is kept in the DB.

mYi3pq...<43-chars>...wKp2Ze
```

stderr 载人向装饰、stdout 载裸 token，所以你可以管道它（`> ~/.config/ai-memory/alice.token`）。

### 3. 列出用户

```console
$ AI_MEMORY_AUTH_TOKEN=<root-token> ai-memory user list

USERNAME  NAME         EMAIL             STATUS
alice     Alice Smith  alice@home        active
bob       -            bob@home          active
carol     -            -                 expired
```

列表绝不浮现 token——DB 里只有它们的哈希。

### 4. 禁用一个 token（不丢归因历史）

`ai-memory user expire <username>` 给该行盖 `token_expired_at = now()`。该用户的 bearer 立即停止认证，但行留在原地，让 `audit_log` 与 `pages` 里历史 `author_id` 引用继续解析到真实姓名。

```console
$ ai-memory user expire alice
Expire token for user 'alice'? Their token stops authenticating immediately. (y/N) y
✓ expired token for user 'alice'
```

传 `--yes` 跳过提示（CI / 脚本）。

之后再启用：`ai-memory user revive alice`。

### 5. 轮换泄漏/丢失的 token

```console
$ ai-memory user rotate-token alice
Rotate token for user 'alice'? Any existing client using the old token will start getting 401 immediately. (y/N) y
✓ rotated token for user 'alice'

Store this token now — it will NOT be shown again.

XGqsBp...<43-chars>...zRm0Vt
```

轮换隐式复活过期 token——你可以直接恢复一个已离职用户而无需先跑 `revive`。

## 向后兼容

从 v0.8 之前的 ai-memory 升级：

- **无需任何动作。**你既有的仅 `[auth].bearer_token` 设置完全照旧认证。认证中间件只是盖一个匿名 `ActorContext`，审计日志记录与之前相同的形状。
- `users` 表由迁移 V14 添加，在你主动跑 `ai-memory user add` 之前保持为空。对它的 SQL 查询不返回行；schema 其余不变。
- 多用户模式要求 `[auth].token_pepper`。没有它，用户管理端点返回 **503** 带清晰的 `multi-user not enabled` 消息。既有安装绝不会触发这个，因为它们从不调用 `user add`。
- 单用户模式下 `/admin/*` 端点对配置的 bearer token 开放，匹配历史行为。创建第一行用户记录立即让每个 admin 端点仅 root；DB 用户 token 收到 **403**、匿名请求收到 **401**。仅配置 `[auth].token_pepper` 不激活该边界。

### 迁移既有的单用户安装

`ai-memory init` 幂等、不覆盖它找到的配置。要在不丢当前配置的情况下填 `token_pepper`：

1. **备份既有配置**（`cp config.toml config.toml.bak`）。
2. **生成 pepper**：`ai-memory generate-auth-token 32`——打印与 `init` 会生成的同形状十六进制串。
3. **把 `[auth]` 块加进**你的 `config.toml`：

   ```toml
   [auth]
   # ……你的既有设置（bearer_token 等）……
   token_pepper = "<paste-the-generated-pepper-here>"
   root_username = "boss"     # 可选；启用 root-token 归因
   root_email    = "boss@..." # 可选
   root_name     = "Boss"     # 可选
   ```

4. 重启 `ai-memory serve`。新字段被拾取；既有行为不变。

第 3-4 步可以无限期推迟——仅 `bearer_token` 一直照旧工作。

## token 怎么存

- 32 字节 OS CSPRNG，URL 安全 base64 编码 → 43 字符字符串。
- DB 列 `users.token_hash` 存 `SHA-256(token || ":" || token_pepper)`，绝不存明文。
- 逐服务器 `token_pepper` 让只偷 DB（如拷走的 SQLite 文件）对离线攻击者无用：无 pepper 哈希的搜索空间是 `(token, pepper)` 联合的。
- 哈希侧常数时间比较（`subtle::ConstantTimeEq`）绕开查找路径的时序攻击。

我们刻意**不**用 argon2id，尽管它是教科书选择。token 是 256 位 CSPRNG，暴力破解无论哈希强度都不可行；argon2id 的逐哈希盐会迫使每次认证请求 O(N) 扫描，而 SHA-256 + `UNIQUE` 索引给热路径所需的 O(1) 查找。完整理由见 `crates/ai-memory-store/src/users.rs`。

## 归因出现在哪

| 面 | 状态 |
|---|---|
| 认证中间件在每个请求上注入 `Extension<ActorContext>` | ✓ P1.3 |
| 多用户模式下所有 `/admin/*` 路由按 `Extension<AuthLevel>::Root` 门控 | ✓ P1.4 |
| `ai-memory user add/list/expire/revive/rotate-token` CLI | ✓ P1.5 |
| `pages.author_id` 填充、frontmatter `last_modified_by` 块 | ✓ P1.6 |
| `/api/v1` 页面响应含 `author: { username, name?, email? }` | ✓ P1.7 |
| 作者变化时 ETag 失效（让缓存刷新归因） | ✓ P1.7 |
| `install-hooks --as-user <name>` 元数据 + 标志校验 | ✓ P1.8 |
| Web UI 在页面视图显示作者 | ✓ 已发布 |
| 带归因的变更审计行携带 `audit_log.author_id` | ✓ 已发布 |

每个里程碑的提交 id 记录在 `CHANGELOG.md`。

## 把智能体钩子接到特定用户

`ai-memory user add` 打印某用户的 token 后，经 `install-hooks` 把该用户的智能体安装指向它：

```console
$ ai-memory user add --username alice --email alice@home --name "Alice Smith"
✓ created user 'alice'
  name:  Alice Smith
  email: alice@home
  ...

XGq...<43-chars>...zRm    # token，仅 stdout

$ ai-memory install-hooks --apply --agent claude-code \
    --as-user alice --auth-token XGq...<43-chars>...zRm
[ai-memory] hooks installing for user: alice
✓ staged 5 hook script(s) → ...
```

`--as-user` **仅是元数据**：它为操作者的记录标注安装、并打印一行确认，让你核对下一个会话的写入会归因到哪个身份。实际接进钩子 env 块的 token 是你经 `--auth-token` 传的任何东西。两者不匹配（如 `--as-user alice --auth-token <bob 的 token>`）在 CLI 层被允许；服务器运行时解析到 bob。该标志是为了让操作者诚实，不是为了强制。

不带 `--as-user` 时钩子照常安装——bearer 认证，归因在写入时从 token 的所有者（root 用户或 DB 用户）流出。

## 限制

- **无逐页 RBAC。**每个已认证用户看到 workspace 里的每个页面。多用户模式下所有 `/admin/*` 端点仍仅 root。需要数据隔离的话，跑多台 ai-memory 服务器（逐用户数据目录）并用反向代理挡在前面。
- **每用户一个 token。**轮换在同一事务里发新 token 并作废旧 token。没有每用户多设备绑定 token 的概念。
- **root token 是单个的。**`[auth].bearer_token` 是每个 `/admin/*` 端点的管理 token。经 `user add` 创建的 DB 用户是普通用户，不是额外管理员。
- **OIDC 是请求认证，不是页面授权。**原生钩子与瘦客户端 CLI 命令可以为外部 OIDC 感知网关/桥发逐开发者 OIDC bearer。原生 ai-memory 服务器认证仍用静态 root bearer / DB 用户 token，且除非网关把接受的 OIDC 认证翻译成 ai-memory 接受的上游认证，`/admin/*` 保持仅 root。ai-memory 仍是每服务器一个共享 wiki、无逐页 RBAC。Keycloak/OIDC 的 `sid` 声明也不是 ai-memory 的智能体会话 id；会话 auto-scope 需要生命周期钩子会话 id 或显式 `workspace` + `project` / `scopes`。
