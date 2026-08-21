---
title: "前端集成：/api/v1"
description: "每个 /api/v1/ 请求都经过与 /mcp、/hook、/admin/ 相同的 bearer + 主机允许列表中间件——它们都在认证层应用之前嵌套。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/frontend-api.md"
---

# 前端集成：`/api/v1`

> 针对 `ai-memory` 服务器构建第三方前端的只读 JSON API 与自定义 UI 托管模型。**v0.6.0** 加入（PR #7）。
> 下面一切都取自 `crates/ai-memory-web/src/routes/api.rs` 的实际路由处理器与 `crates/ai-memory-store/src/reader.rs` 的响应结构——本文有漂移时以它们为准。

## 1. 这个面是什么（不是什么）

| | 能做什么 | 不能做什么 |
|---|---|---|
| `/api/v1/*` | 浏览 workspace、项目、页面；读整页 markdown + frontmatter + 反向链接；FTS5 检索（全局或带作用域、单或多项目）；聚合「overview」快照；下钻过期/重复/孤儿页面；列项目的会话并读一个会话的原始观察。 | 写、删、重命名、lint、整编、跑清扫、管理交接。`/api/v1` 面**构造上只读**——处理器含零个写入器调用。写入仍走 `/admin/*`（CLI 用）或 MCP 工具。 |
| `--web-ui-dir` | 把任意 SPA 托管在 `/web`（或 `--web-slug`），与 API 同源、同一认证后面。缺标志时默认内置 `/web` 浏览器仍是回退。 | 在无反向代理的情况下把 SPA 托管在*不同*源——用同源托管或刻意配置 CORS（见 §9）。 |

## 2. 认证模型

每个 `/api/v1/*` 请求都经过与 `/mcp`、`/hook`、`/admin/*` 相同的 bearer + 主机允许列表中间件——它们都在认证层应用之前嵌套（`crates/ai-memory-cli/src/commands/serve.rs`，见 `mount_web_router` → `apply_http_layers`）。所以：

- **匿名请求 → `401 Unauthorized`**（服务器配置了 bearer token 运行时）。
- **不允许的 `Host` 头 → `403 Forbidden`**（DNS rebinding 守卫）。
- 静态 bearer 是 root 凭据。DB 用户 token 与配置的受信代理 bearer 解析出逐用户身份；行为者限定的响应随后只暴露该操作者的加共享交接。完整认证阶梯见[多用户归因](/users/)。

用标准头传 bearer：

```http
Authorization: Bearer <token>
```

拿 token：

```bash
ai-memory generate-auth-token   # 向 stdout 写一个 root token
# 然后在服务器环境 export AI_MEMORY_AUTH_TOKEN=<token>，
# 或放进 config.toml 的 [auth].bearer_token
```

同源 SPA 里，token 可以来自：

- UI 里用户粘贴的值（最简单的模型——与内置 `/web` 浏览器的 HTTP Basic 提示相同）。
- 平台专属的秘密存储，然后注入 `fetch()` 调用。

> **XSS 注记：** SPA 把 bearer 存在 `localStorage` 且带着 XSS bug 发布的话，token 可被窃取。那是 SPA 的风险、不是 API 的。为此加固时考虑只读的环境注入 token 或经反向代理的 HTTP-only cookie 隧道。

## 3. 错误模型

所有错误返回如下形状的 JSON 体：

```json
{ "error": "human-readable message" }
```

状态之一：

| 状态 | 何时 |
|---|---|
| `400 Bad Request` | 无效查询参数、畸形 `Authorization`、部分作用域（有 workspace 无 project 或反之）、`POST /search` 作用域过多（>25）、空 `q`、畸形会话 id、未知观察 `kinds` 或 `order`。 |
| `401 Unauthorized` | bearer 缺失或错误。 |
| `403 Forbidden` | Host 头不在允许列表；或非 root 调用者请求 `all_owners=true`。 |
| `404 Not Found` | workspace、项目或页面不存在；页面文件在磁盘缺失；或对该调用者在该项目不可见的会话 id。 |
| `500 Internal Server Error` | 读池 / SQLite 失败。体永远是固定的 `{"error":"internal server error"}`；底层原因记在服务器侧而非返回，所以不会向浏览器泄漏路径或配置。 |

## 4. 端点参考

除注明外全部为 `GET`。路径在 `/api/v1/` 下。

### 4.1 Workspaces

```http
GET /api/v1/workspaces
```

**响应：** `{ "workspaces": [WorkspaceSummary, …] }`

```json
{
  "workspaces": [
    {
      "workspace_name": "default",
      "project_count": 3,
      "page_count": 412,
      "last_updated": "2026-05-28T14:02:11.123Z"
    }
  ]
}
```

空 workspace 的 `last_updated` 为 `null`。

### 4.2 Projects

```http
GET /api/v1/projects                  # 所有 workspace 的全部项目
GET /api/v1/projects?workspace=NAME   # 一个 workspace 的项目
```

**响应：** `{ "projects": [ProjectSummary, …] }`

```json
{
  "projects": [
    {
      "workspace_name": "default",
      "project_name": "ai-memory",
      "page_count": 138,
      "last_updated": "2026-05-28T14:02:11.123Z"
    }
  ]
}
```

### 4.3 Pages（列表）

```http
GET /api/v1/workspaces/{workspace}/projects/{project}/pages
```

**响应：** `{ "pages": [PageSummary, …] }`

```json
{
  "pages": [
    {
      "path": "decisions/0007-db.md",
      "title": "Standardised on Postgres",
      "kind": "decision",
      "tier": "semantic",
      "updated_at": "2026-05-27T09:12:00.000Z"
    }
  ]
}
```

workspace 或项目不存在时 `404`。

### 4.4 Page（读整页）

```http
GET /api/v1/workspaces/{workspace}/projects/{project}/pages/{*path}
```

wiki 路径是通配：`decisions/0007-db.md`、`concepts/foo/bar.md` 等。返回合并的元数据 + 正文 markdown + frontmatter + 已解析链接 + 反向链接。

**响应（平铺对象）：**

```json
{
  "project": "ai-memory",
  "path": "decisions/0007-db.md",
  "title": "Standardised on Postgres",
  "kind": "decision",
  "tier": "semantic",
  "pinned": true,
  "created_at": "2026-05-27T09:12:00.000Z",
  "updated_at": "2026-05-28T11:04:33.123Z",
  "supersedes": null,
  "frontmatter": { "tags": ["adr"], "pinned": true },
  "body": "# Standardised on Postgres\n\n…",
  "links":     [ { "path": "concepts/db-rules.md", "title": "DB rules", "kind": "rule" } ],
  "backlinks": [ { "path": "sessions/2026-05-27.md", "title": "Session 2026-05-27", "kind": "session" } ]
}
```

workspace/项目缺失、页面行缺失、或磁盘文件缺失（正文在请求时从 markdown 文件读取）→ `404`。

### 4.5 Search

两种形式——常见单作用域或全局用查询串，多作用域用 JSON 体。

```http
GET /api/v1/search?q=karpathy&limit=20                                # 全局
GET /api/v1/search?q=karpathy&workspace=default&project=ai-memory     # 单项目
```

```http
POST /api/v1/search
Content-Type: application/json

{
  "q": "karpathy",
  "scopes": [
    { "workspace": "default", "project": "ai-memory" },
    { "workspace": "default", "project": "shared-notes" }
  ],
  "limit": 20
}
```

**响应：** `{ "hits": [PageHit, …] }`

```json
{
  "hits": [
    {
      "id": "01928d27-…",
      "path": "concepts/karpathy-wiki.md",
      "title": "Karpathy LLM Wiki pattern",
      "snippet": "Andrej <mark>Karpathy</mark>'s LLM wiki design …",
      "rank": -8.4
    }
  ]
}
```

规则：

- `q` 必需且非空（否则 400）。
- `limit` 钳制 `1..=100`。默认 `10`。
- 部分作用域以 `400` **拒绝**（只传 `workspace` 或只传 `project`，保持作用域无歧义）。
- `scopes`（POST）上限 `25` 条；不能与顶层 `workspace`/`project` 组合。
- `snippet` 在匹配词条周围含 FTS5 HTML 标记（`<mark>…</mark>`）。
- `rank` 是 FTS5 排名——**越低越好**（越接近查询词条）。

### 4.6 Recent

```http
GET /api/v1/workspaces/{workspace}/projects/{project}/recent?limit=20
```

按 `updated_at` 降序的 `is_latest = 1` 页面。`limit` 钳制 `1..=100`、默认 `10`。

每个读取面用同一 `kind` 契约。显式 frontmatter `kind` 优先；否则路径族 `_rules/`、`_slots/`、`sessions/`、`decisions/`、`gotchas/`、`concepts/`、`procedures/`、`notes/` 分别派生 `rule`、`slot`、`session`、`decision`、`gotcha`、`concept`、`procedure`、`note`。其他路径回退 `fact`。

**响应：** `{ "pages": [BriefingPage, …] }`

```json
{
  "pages": [
    {
      "path": "sessions/2026-05-28.md",
      "title": "Session 2026-05-28",
      "kind": "session",
      "updated_at": "2026-05-28T14:02:11.123Z"
    }
  ]
}
```

### 4.7 Briefing（结构化快照）

```http
GET /api/v1/workspaces/{workspace}/projects/{project}/briefing?limit=10
```

与 `memory_briefing` 返回的同一 payload——计数 + 活动窗口 + 最后观察 + 开放交接 + `_rules/` + `_slots/` + N 个最近页面。无 LLM、确定性。

**响应：** `BriefingSnapshot`

```json
{
  "counts": {
    "pages_latest": 138,
    "pages_all": 162,
    "sessions": 27,
    "observations": 4198
  },
  "activity_7d":  { "days": 7,  "sessions": 6,  "observations": 921,  "pages_updated": 41 },
  "activity_30d": { "days": 30, "sessions": 24, "observations": 3712, "pages_updated": 102 },
  "last_observation_at": "2026-05-28T13:58:02.123Z",
  "pending_handoff_count": 0,
  "rules": [{ "path": "_rules/postgres.md", "title": "Postgres only", "kind": "rule",  "updated_at": "…" }],
  "slots": [{ "path": "_slots/focus.md",    "title": "Current focus", "kind": "slot",  "updated_at": "…" }],
  "recent_pages": [
    { "path": "sessions/2026-05-28.md", "title": "Session 2026-05-28", "kind": "session", "updated_at": "…" }
  ]
}
```

### 4.8 Overview（workspace + 项目聚合）

```http
GET /api/v1/workspaces/{workspace}/overview?limit=10
GET /api/v1/workspaces/{workspace}/projects/{project}/overview?limit=10
GET /api/v1/workspaces/{workspace}/projects/{project}/handoffs?state=open&limit=50
GET /api/v1/workspaces/{workspace}/projects/{project}/handoffs?all_owners=true
```

### 交接列表

`state` 接受 `open` | `accepted` | `expired`；省略则列出每个状态——这是找到已被消费的接力棒的办法。结果按所有者限定：已认证调用者看到自己的加共享交接，匿名浏览器只看共享的——被拥有的交接（及其内部从提示词派生的文本）绝不渲染给不属于它的人。同一限定适用于两个 overview 端点的 `handoff` 字段与 `pending_handoff_count`，所以计数与取数永远一致。恢复时，root 授权的请求可传 `all_owners=true` 列出所有操作者的行。用户与匿名请求收到 `403`；默认保持自己加共享——对 root 也是。

带认证的服务器上，列表的提示词派生字段——`summary`、`open_questions`、`next_steps`——服务给服务器能点名的调用者与 root 操作者；自动交接从操作者的提示词逐字合成它们，且列表返回项目整个历史而非仅最新开放行。既非点名也非 root 的调用者拿到缺失字段加 `redacted: true`；元数据（状态、时间戳、智能体、cwd、触碰的文件、所有权）总是服务。未配置认证的服务器照常服务正文，因为它本来就无认证地服务每个页面正文。

「能点名」指认证档自己解析出的身份（`ActorContext::identity_key()`）：有断言的 issuer/subject 对时用它，否则用户名。终结 OIDC 并同时转发 `X-Memory-Actor-Issuer` 与 `X-Memory-Actor-Sub` 的 ingress 因此以 `redacted: false` 读到自己的与共享的交接，且今天认证链的任何一档都不产生已认证但不可点名的调用者——脱敏臂是故障安全的地板，不是活的档。`owner` / `accepted_by` 携带限定存储键（`user:alice`、`oidc:<issuer-byte-length>:<issuer><subject>`）。

```json
{
  "handoffs": [
    {
      "id": "01930…",
      "agent": "claude-code",
      "at": "2026-07-28T12:00:00Z",
      "state": "accepted",
      "summary": "…",
      "open_questions": [],
      "next_steps": [],
      "redacted": false,
      "files_touched": [],
      "owner": "user:alice",
      "accepted_by": "user:alice",
      "accepted_at": "2026-07-28T13:00:00Z"
    }
  ]
}
```

把前端主视图通常需要的捆进一次往返。

**Workspace overview** 返回 workspace 范围的最新开放交接，加跨其全部项目聚合的 `briefing` 与 `health`：

```json
{
  "handoff":  { "agent": "claude-code", "at": "…", "project": "ai-memory", "summary": "…", "open_questions": [ … ], "next_steps": [ … ] },
  "briefing": { "counts": { … }, "activity_7d": { … }, "rules": [ … ], "recent_pages": [ … ] },
  "health":   { "stale": 4, "duplicates": 1, "contradictions": 0, "orphans": 12,
                "audited_at": null, "stale_pages": [HealthPage, …],
                "duplicate_pages": [ … ], "orphan_pages": [ … ] }
}
```

**Project overview** 用同一响应形状、限定到该项目。任一响应中，无匹配作用域的开放交接时 `handoff` 为 `null`：

```json
{
  "handoff":  { "agent": "claude-code", "at": "…", "project": "ai-memory", "summary": "…", "open_questions": [ … ], "next_steps": [ … ] },
  "briefing": { … },
  "health":   { … }
}
```

`HealthPage`：

```json
{
  "workspace": "default",
  "project": "ai-memory",
  "path": "concepts/old-thing.md",
  "title": "Old thing",
  "kind": "concept"
}
```

> 注：读取 API **不**消费 `handoff`——交接保持 "open"、仍可被下一个智能体接受。

### 4.9 跨项目图

```http
GET /api/v1/graph
```

返回端点位于不同项目的每个已解析 wikilink，带两端的 workspace + 项目 + 路径。适合在 SPA 里渲染项目级依赖视图。

```json
{
  "edges": [
    {
      "from_workspace": "default",
      "from_project":   "ai-memory",
      "from_path":      "decisions/0014-storage.md",
      "to_workspace":   "default",
      "to_project":     "infra",
      "to_path":        "runbooks/sqlite-wal.md"
    }
  ]
}
```

今天全局（无 workspace/项目过滤）；更窄的查询参数是后续。

### 4.10 浏览器标签图标

```http
GET /favicon.ico
```

返回内置 Web UI 作页眉 logo 的同一透明 PNG。浏览器自动取这个路径。Web UI 启用（`--enable-web`）时该路由就在，且挂在绝对宿主根——`--base-path` 之外、`/web` 巢之外——所以子路径部署下浏览器的自动取数也够得到它。尽管 URL 是 `.ico`，响应是 `image/png`（现代浏览器接受 PNG 图标），且该路由**豁免 bearer 认证与主机允许列表**：浏览器开新标签无需 HTTP Basic 提示就拿到图标，嵌入的 PNG 与任何 `/web` 访问者已见的是同一个，信息泄漏面为零。

### 4.11 Sessions

```http
GET /api/v1/workspaces/{workspace}/projects/{project}/sessions?limit=20&offset=0&include_open=false
```

触碰过该项目的会话、最新在前：会话的行锚定在该项目**或**其至少一条观察落在那里时列出，所以中途换过仓库的会话两边都出现。`observation_count` 只数该项目的行。`limit` 钳制 `1..=100`、默认 `20`；`offset` 默认 `0`；`include_open` 默认 `false`（只有设了 `ended_at` 的会话）。像交接一样按所有者过滤：服务器能点名的调用者看到自己的加未归因的；未点名调用者只看未归因的。绝不缓存（`no-store`）。

**响应：** `{ "sessions": [SessionSummary, ...] }`

```json
{
  "sessions": [
    {
      "session_id": "0198f0a2-3c4d-7e5f-8a9b-0c1d2e3f4a5b",
      "cwd": "/home/me/src/app",
      "agent_kind": "claude-code",
      "started_at": "2026-08-16T09:12:03.412Z",
      "ended_at": "2026-08-16T10:47:55.001Z",
      "observation_count": 143,
      "actor_user": null
    }
  ]
}
```

### 4.12 会话观察

```http
GET /api/v1/workspaces/{workspace}/projects/{project}/sessions/{session_id}/observations?limit=50&offset=0&order=asc&kinds=user-prompt,stop&q=migration&body_max_chars=4000
```

一个会话的原始钩子观察（提示词、工具调用、stop），按存储原样分页。只返回落在 `{workspace}/{project}` 的行；`elided_other_scope` 计同一会话留在另一项目的行。会话必须在 4.11 的同一谓词下可见（行或观察在该项目、所有者过滤通过），否则 `404`。`limit` 钳制 `1..=200`、默认 `50`；`offset` 默认 `0`；`order` 为 `asc`（捕获序，默认）或 `desc`；`kinds` 是逗号分隔的 `session-start`、`user-prompt`、`pre-tool-use`、`post-tool-use`、`pre-compact`、`post-compaction`、`notification`、`stop`、`session-end`、`other` 列表；`q` 是限定在该会话内的 FTS5 查询；`body_max_chars` 钳制 `200..=16384`、默认 `4000`，更长的正文以可见的 `[body truncated; N chars omitted]` 标记结尾。`total` 计匹配 `kinds` 与 `q` 的作用域内行，所以在 `offset` 上翻页无需第二次调用。正文在摄取时已净化且有界；当作不受信任的历史文本。绝不缓存（`no-store`）。与 MCP 工具 `memory_read_session_observations` 同一 payload。

**响应：** `{ "session": SessionSummary, "observations": [ObservationRecord, ...], "total", "offset", "limit", "order", "elided_other_scope", "body_max_chars" }`

```json
{
  "session": {
    "session_id": "0198f0a2-3c4d-7e5f-8a9b-0c1d2e3f4a5b",
    "cwd": "/home/me/src/app",
    "agent_kind": "claude-code",
    "started_at": "2026-08-16T09:12:03.412Z",
    "ended_at": "2026-08-16T10:47:55.001Z",
    "observation_count": 143,
    "actor_user": null
  },
  "observations": [
    {
      "id": "0198f0a2-4d5e-7f60-9a0b-1c2d3e4f5a6b",
      "session_id": "0198f0a2-3c4d-7e5f-8a9b-0c1d2e3f4a5b",
      "kind": "user-prompt",
      "title": "User prompt",
      "body": "Add a migration for the sessions table ...",
      "importance": 5,
      "created_at": "2026-08-16T09:12:10.020Z",
      "extension": null,
      "source_event": null
    }
  ],
  "total": 12,
  "offset": 0,
  "limit": 50,
  "order": "asc",
  "elided_other_scope": 0,
  "body_max_chars": 4000
}
```

## 5. 限额与分页

- 多数 `limit` 查询参数钳制 `1..=100`；交接历史与会话观察钳制 `1..=200`。会话列表与会话观察取 `offset`；观察还报告 `total`。
- 会话观察正文逐行按 `body_max_chars`（`200..=16384`、默认 `4000`）钳制，带可见截断标记。
- `POST /api/v1/search`：每请求至多 **25 个作用域**。
- HTTP 体上限：**10 MB**（与 MCP 体限额共享；正常 API 流量撞不到）。
- **Cache-Control + ETag。**身份无关的读取端点用 `Cache-Control: private, max-age=N`、端点专属 TTL；页面读取还带 SHA-256 `ETag`，匹配的 `If-None-Match` 收到 `304 Not Modified`。briefing、overview、交接列表、会话列表与会话观察依赖已认证行为者，因此用 `Cache-Control: private, no-store`——同一 URL 的凭据从 Alice 换成 Bob 后，浏览器不能复用 Alice 的提示词派生响应。检索响应因请求体影响结果而不可缓存。

## 6. 自定义 UI 托管与 base 路径

```bash
ai-memory serve \
    --transport http \
    --bind 127.0.0.1:49374 \
    --enable-web \
    --web-ui-dir /path/to/your-spa/dist
```

静态目录经 `tower-http::ServeDir` 服务于 `/web`：

- **与 `/api/v1` 同认证。**挂在 bearer 中间件层之前，所以 `/web/*` 请求必须带同一 `Authorization` 头（开了认证时浏览器通常弹 HTTP Basic——用户把 token 作密码粘贴）。
- **SPA 回退。**缺失路径回退到 `index.html`，客户端路由器（React Router、SvelteKit 等）可以拥有 `/web/whatever` 而不 404。
- **路径穿越被拒绝**——`ServeDir` 的默认安全。
- **启动前校验：**目录必须存在*且*含 `index.html`，否则 `ai-memory serve` 在绑定前带清晰错误退出。还要求同时设 `--enable-web`。
- **base 路径注入：**ai-memory 把 `<base href="...">` 与 `<meta name="ai-memory-base-path" content="...">` 注入 SPA 外壳。覆盖直接 `/web`、`/web/index.html` 与客户端路由回退路径；静态资产原样服务。

反向代理把 ai-memory 保持在 URL 子路径下时，设 `--base-path`（或 `AI_MEMORY_BASE_PATH`）让每个 HTTP 面一起挪：

```bash
ai-memory serve \
    --transport http \
    --bind 127.0.0.1:49374 \
    --enable-web \
    --base-path /wiki
```

`--base-path /wiki` 下，API 在 `/wiki/api/v1`、MCP 在 `/wiki/mcp`、钩子在 `/wiki/hook`、admin 路由在 `/wiki/admin/*`、默认 Web UI 在 `/wiki/web`。设 `--web-slug /` 把 Web UI 或自定义 SPA 挂在 base 根（`/wiki`）而不是 `/wiki/web`。

**base 路径安全规则。**`--base-path` 与 `--web-slug` 都走同一归一化器。段必须是 RFC 3986 非保留字符（`[A-Za-z0-9-._~]`）。三种东西把前缀塌缩为 `""`（根挂载）并打启动 `WARN`，让降级在日志里可见：

- `.` 或 `..` 段。其字符本身是非保留的，但在段边界上意味着「当前」与「父级」——一个打字错误你的前缀就成了穿越向量。
- 非保留集合之外的任何字符（空格、`<`、`"` 等）。
- 空 / 仅空白输入。

`{base_path}{web_slug}/` → `{base_path}{web_slug}` 的尾斜杠重定向保留查询串。fragment 是客户端的、绝不到达服务器。

`--web-ui-dir` **缺席**时，内置的服务器侧 `/web` 浏览器是默认（只读 HTML 渲染、FTS5 检索、项目树）。无回退。

## 7. 实战示例：最小 SPA fetch

```js
// 从 ai-memory 注入的 SPA 外壳解析 API base。meta 标签在宿主根为空、
// 子路径反向代理后面如 "/wiki"。
const basePath = document
  .querySelector('meta[name="ai-memory-base-path"]')
  ?.getAttribute("content") ?? "";
const API = `${location.origin}${basePath}/api/v1`;
const TOKEN = localStorage.getItem("ai-memory-token"); // 你的存储选择

async function apiGet(path, params) {
  const url = new URL(`${API}${path}`, location.origin);
  if (params) Object.entries(params).forEach(([k, v]) =>
    v != null && url.searchParams.set(k, v));
  const resp = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!resp.ok) {
    const { error } = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(`${resp.status}: ${error}`);
  }
  return resp.json();
}

// 一次请求拿到顶层「主页」视图。
const overview = await apiGet("/workspaces/default/projects/ai-memory/overview", { limit: 10 });
console.log(overview.briefing.counts.pages_latest, "pages");

// 多作用域检索。
const search = await fetch(`${API}/search`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
  body: JSON.stringify({
    q: "karpathy",
    scopes: [
      { workspace: "default", project: "ai-memory" },
      { workspace: "default", project: "shared-notes" },
    ],
    limit: 20,
  }),
}).then(r => r.json());
```

`curl` 冒烟：

```bash
TOKEN=$(ai-memory generate-auth-token)
curl -fsS "http://127.0.0.1:49374/api/v1/workspaces" -H "Authorization: Bearer $TOKEN" | jq
```

## 8. 源码里看哪里（规范规格）

文档/响应形状与代码冲突时，代码赢。读这些：

| | 位置 |
|---|---|
| 路由注册 + 处理器体 | `crates/ai-memory-web/src/routes/api.rs` |
| 响应结构（`PageHit`、`WorkspaceSummary`、`BriefingSnapshot`、`HealthPage`、`SessionSummary`、`ObservationRecord`……） | `crates/ai-memory-store/src/reader.rs` |
| 会话列表 + 逐会话观察读取器（`sessions_for_scope`、`session_summary_scoped`、`session_observations_scoped`） | `crates/ai-memory-store/src/reader.rs` |
| 覆盖每个端点的 27 个集成测试（认证、400、404、多作用域正确性、SPA 回退） | `crates/ai-memory-web/tests/routes.rs` |
| 认证 + 中间件分层 | `crates/ai-memory-cli/src/commands/serve.rs`（`mount_web_router`、`apply_http_layers`） |
| 自定义 UI 目录校验 | `crates/ai-memory-cli/src/commands/serve.rs`（`validate_web_ui_args`） |

## 9. CORS

操作者配置允许列表后，`/api/v1` 接受跨源请求。CORS 层只作用于那个路由器——`/mcp`、`/hook`、`/admin/*`、`/web` 保持同源。

经 `serve` 子命令的 `--cors-allow-origin <origin>`（可重复）或环境里的 `AI_MEMORY_CORS_ALLOW_ORIGINS=<csv>` 配置。列表启动时校验：

- 每条必须是完整限定的 `scheme://host[:port]` URL。
- 无尾斜杠、无路径、无查询、无通配（`*`）。
- `http://` 与 `https://` 混用可以；按你 SPA 的服务选。

无效源让启动带清晰错误失败，而不是静默接受通配。该层允许 `GET / POST / OPTIONS`、`Authorization` + `Content-Type` 头与凭据，预检缓存 10 分钟。

## 10. 已知缺口（计划中的迭代，不是阻塞项）

- **写面。**浏览器今天不能变更（笔记、整编、lint、清除——都在 CLI 的 `/admin/*` 或智能体的 MCP 工具下）。薄的认证写面（浏览器里「编辑此页」）是一场刻意的 v2 对话。
- **限流**与 `/mcp` + `/admin` 共享（今天只有体上限被强制）。未来的全局限流器会收紧已认证的不当行为情形。

这些的状态更新以 issue 跟踪器为准。
