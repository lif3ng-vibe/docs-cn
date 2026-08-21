---
title: "[auto_scope] 隔离模式"
description: "ai-memory serve 发布一个进程共享的「当前活跃项目」指针，调用方省略 workspace / project 时 MCP 读工具会查它。指针由前台生命周期钩子喂入。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/auto-scope.md"
---

# `[auto_scope]` 隔离模式

`ai-memory serve` 发布一个进程共享的「当前活跃项目」指针，调用方省略 `workspace` / `project` 时 MCP 读工具会查它。指针由前台生命周期钩子喂入：把 `cwd` 解析到真实项目的会话启动、用户提示词与工具前事件会更新指针，让读工具回答智能体实际所在的项目，而不是服务器静态的 `--project` 默认。完成与关停事件仍落进其解析出的项目，但不推进共享回退槽位：来自旧进程的延迟 post-tool、stop 或会话结束尾巴，绝不能重定向一个新会话的无作用域读取。

默认该指针是单个进程级槽位——对一次跑一个项目的单一操作者是对的，但在共享安装上会压垮并行会话：`~/repo-A` 里触发的一个钩子覆盖掉 `~/repo-B` 里并发 `memory_query`（无显式 project）正要读的槽位。

`[auto_scope]` 配置块提供选择启用的隔离模式，按请求身份给指针配键，让并发调用方保持分离。

## 模式

| `mode` | 键 | 适用场景 |
|---------------|------------------------|---|
| `single` | （无——全局槽位） | **默认。** 单一操作者，一次一个项目。与所有既有安装向后兼容。 |
| `per_session` | `session_id` | 在每个 MCP 请求上转发钩子会话 id 的会话感知客户端/桥。 |
| `per_actor` | `(限定身份, session_id)`，外加一个仅身份的无会话槽位 | 承接多个已认证用户或受信代理身份的共享引擎。跨操作者隔离，且转发的会话 id 与钩子活动不匹配时失败关闭。 |

两个选择启用模式仍并行向前台单槽位发布活动，所以没有行为者身份的调用方（匿名探测、遗留代码路径）看到的是最近活跃的项目而非空指针。非前台事件只在存在确切键控条目时刷新它。这保留了遗留行为又不让延迟尾巴接管，但它不是逐会话隔离；客户端发不出行为者身份且并发运行要紧时，用显式 `workspace` + `project` 参数。

显式作用域参数失败关闭。`project` 参数先在活跃 workspace 内解析，再到服务器默认 workspace 内；两处都没有该项目时，工具返回错误而不是回退到活跃/默认项目。`workspace` 参数必须与 `project` 成对，读/管理维护路径用只查找不创建的查找，打错字不会造出空作用域。

## 实现契约

作用域解析集中在 `ai_memory_store::ScopeResolver` 及其显式辅助函数：

- `lookup_existing_scope` 用于读、检索、维护、留存、嵌入与破坏性路径。它从不创建 workspace 或项目。
- `create_explicit_scope` 只用于显式写入/创建路径。
- `resolve_many_existing_scopes` 用于多项目检索作用域，带去重与最大作用域数校验。
- `ScopeResolver::resolve_read_args` 与 `resolve_write_args` 用于还需要行为者作用域的活跃项目回退的 MCP 工具。

新的 MCP、admin 或 Web API 路由应该用这些辅助函数，而不是手搓 `find_workspace` / `find_project` 链。触碰作用域解析的 PR 应包含表驱动测试：部分作用域拒绝、缺失显式作用域、活跃项目优先级、跨 workspace 隔离。

## 配置

```toml
[auto_scope]
mode = "single"           # "single"（默认）| "per_session" | "per_actor"
session_ttl_secs = 3600   # 每键条目的 TTL（默认 1 小时）
max_entries = 4096        # 硬上限；最旧插入先淘汰
```

环境变量覆盖遵循标准的 `AI_MEMORY_<SECTION>__<KEY>` 形式：

```bash
AI_MEMORY_AUTO_SCOPE__MODE=per_actor
AI_MEMORY_AUTO_SCOPE__SESSION_TTL_SECS=7200
AI_MEMORY_AUTO_SCOPE__MAX_ENTRIES=8192
```

## 行为者身份从哪来

| 来源 | 填充 |
|---|---|
| 钩子 payload（`/hook?event=…&agent=…`） | `session_id`、`agent` |
| 认证中间件（rung 1 root 加 `root_username`） | `user` ← root_username |
| 认证中间件（rung 1b 受信代理） | 用户名或 OIDC `(issuer, subject)` 对 |
| 认证中间件（rung 2 DB 用户） | `user` ← `users.username` |
| MCP 请求头 `X-Memory-Actor-Session-Id` | 工具调用的 `session_id` |
| MCP 请求头 `Mcp-Session-Id` | 工具调用的回退 `session_id` |
| 匿名 / 无 token | 空行为者 → 单槽位 |

`X-Memory-Actor-Session-Id` 指生命周期钩子 payload 里的智能体运行会话 id。它不是 OIDC/Keycloak 登录会话：提供方 JWT 的 `sid` 声明标识的是 IdP 浏览器/设备会话，不能用作 ai-memory 的行为者会话键。

`per_session` 读 `session_id`；`per_actor` 同时读限定身份与 `session_id`。`per_actor` 下，有身份但无会话 id 的请求可以用该用户最新的无会话槽位，而非进程级单槽位。带会话 id 的请求必须匹配一个钩子发布的键控条目；不匹配时，ai-memory 回退到服务器固化的默认，而不是别的会话的最新项目。

复合 `(身份, session_id)` 键只给这些活跃项目指针划命名空间。为钩子观察持久存储的 `SessionId` 保持全局：若另一个所有者复用已被占用的 id，ai-memory 在它给外来行为者追加观察或发布指针之前丢弃该钩子。

所有者与智能体才标识一个会话；作用域不标识。同一操作者的会话在其 cwd 移动时合法地在另一个项目产出事件，所以不同的 `(workspace, project)` 被记录而非拒绝——这些事件如何归因见 [`[routing] mid_session`](/marker-file/#会话中途导航routing-mid_session)。唯一的例外是终态事件：一个 `SessionEnd` 报出的作用域与其会话不同，就不是那个会话的结束，所以被丢弃而不是结束别人的会话。

## 客户端要求

生命周期钩子的 payload 已包含智能体运行会话 id。MCP 工具调用是独立的 HTTP 请求，而多数内置 MCP 客户端配置文件只能声明静态 URL/认证头。静态配置无法把当前智能体运行会话 id 注入每次工具调用。

Claude Code 可以选择启用 ai-memory 的会话感知 stdio 桥：

```bash
ai-memory install-mcp --client claude-code --session-aware --apply
```

桥读取 Claude 供给其 stdio MCP 子进程的 `CLAUDE_CODE_SESSION_ID`，转发为 `X-Memory-Actor-Session-Id`，同时保留配置的远端端点与 bearer token。除非用了这个标志，既有 Claude Code 安装保持静态 HTTP 传输。

Claude Code 的 stdio MCP 子进程在 `/clear` 之后仍保留启动时收到的 id，尽管后续钩子拿到的是新 id。不带显式 id 的 `--continue`/`--resume` 下，Claude 也可能给 MCP 子进程启动 id 而非恢复的 id。会话键连续性要紧时，`/clear` 后重启 Claude Code；显式恢复用 `--resume <session-id>`。没有 `CLAUDE_CODE_SESSION_ID` 可用时，桥刻意失败，而不是静默退化到共享单槽位。

只在你的客户端或桥能在每个 MCP 请求上把钩子 payload 里的同一不透明会话 id 作为 `X-Memory-Actor-Session-Id`（首选）或 `Mcp-Session-Id` 发送时才用 `per_session`。否则，携带不同 MCP 会话 id 的请求失败关闭到固化默认，而无可用行为者身份的请求仍退化到遗留单槽位。

OIDC/Keycloak 认证能识别人类用户、客户端与智能体，但不能自动识别当前编码智能体会话。网关校验 Keycloak JWT 时，应传播 `X-Memory-Actor-User` 或 `Issuer` + `Sub` 对，加可选的 `Client` / `Agent`；只有在会话感知桥真实转发了智能体会话 id 时才应发 `X-Memory-Actor-Session-Id`。

用静态 MCP 配置的内置安装，建议：

- `single`：一次一个操作者 / 一个活跃项目。
- `per_actor`：几个人共享一台服务器时配合多用户 bearer 认证。它经已认证行为者键隔离用户；MCP 客户端转发不了钩子会话 id 时，同一用户的并发会话仍需显式 `workspace` + `project` 参数或会话感知桥。
- `per_session` 加 Claude Code 的 `install-mcp --session-aware` 桥：一个操作者在不同项目跑并发 Claude Code 会话时。

## 与多用户模式搭配

多用户模式下 `per_actor` 最有用（见[多用户归因](/users/)）——每个已认证用户有自己的 `users.token_hash` 行，认证中间件给每个请求打上正确的 `user` 标。设 `[auto_scope] mode = "per_actor"` 后，两个经同一引擎跑并发智能体会话的已认证用户不再互相覆盖 MCP 调用的「当前项目」指针；客户端也转发会话 id 时，同一用户的并发会话同样被隔离。

单用户安装只在客户端/桥在 MCP 调用上转发会话 id 时才能单用 `per_session`（无 `token_pepper`、无 `users` 行）。Claude Code 有上面的选择启用桥；其他原装静态 MCP 配置下，并发窗口用显式 `workspace` + `project` 参数。

## 内存占用

每键条目很小：两个 `Uuid` 大小的 id + 一个 `Instant`。默认 `max_entries = 4096` 下，即使企业级引擎承接数百并发会话，map 最坏也就几十 KB。TTL 保证过期条目（关闭的 Claude Code 窗口、掉线的钩子客户端）一小时内老化出局；TTL 窗口被超出时，上限先丢最旧的插入。
