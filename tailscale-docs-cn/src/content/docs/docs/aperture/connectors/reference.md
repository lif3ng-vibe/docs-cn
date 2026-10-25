---
title: "Aperture 连接器参考"
description: "[Aperture 配置][docs-aperture-configuration]中的 `connectors` 段配置与外部服务的出站集成。连接器支持两种协议。"
---

最后验证于 Oct 1, 2026

[Aperture 配置][docs-aperture-configuration]中的 `connectors` 段配置与外部服务的出站集成。连接器支持两种协议：

* **MCP**（`"protocol": "mcp"`）：Aperture 连接远程 [Model Context Protocol][xt-mcp-spec] 服务器，聚合其工具和资源，并通过 `/v1/mcp` 端点暴露它们。
* **HTTP**（`"protocol": "http"`）：Aperture 充当带认证的反向代理，把请求转发给上游 HTTP API 并自动注入凭证。

连接器取代了已弃用的 `mcp.servers` 语法，并新增对认证连接和多种协议的支持。

设置与验证步骤参阅[连接器入门][docs-connectors-get-started]。

## `connectors` 字段

`connectors` 段接受以下顶层字段：

| 字段 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `servers` | map | `{}` | 连接器 ID 到服务器配置的映射。映射键是连接器 ID，会成为工具（`connectorID_toolname`）、资源（`connectorID-uri`）和资源模板（`connectorID-uriTemplate`）的名称前缀。 |
| `system_labels` | map | `{}` | 系统连接器 ID 到标签列表的映射，用于替换该连接器的默认标签。键必须是已知的系统连接器（目前是 `aperture`）。其他任何键都是加载时错误。参阅[连接器标签][ar-connector-labels]。 |

## `servers` 字段

`servers` 映射中的每一项接受以下字段：

| 字段 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `protocol` | string | 是 | N/A | Aperture 与上游通信的方式。取值为 `"mcp"` 或 `"http"`。 |
| `url` | string | 否 | N/A | 上游服务器的端点 URL。缺少 `url` 会产生加载时警告而非致命错误，Aperture 仍会加载配置。但仪表板的连接器保存路径会将其作为错误拒绝。 |
| `provider` | string | 否 | `"Custom"` | 提供商标识。使用注册表中的经验证连接器时自动设置（例如 `"Salesforce"`、`"Atlassian"`、`"Slack"`）。自定义连接器使用默认值 `"Custom"`。决定连接器在界面中归入“verified”还是“custom”类别。手动设置时，`provider` 必须与注册表中某个经验证连接器 ID 完全一致，或为 `"Custom"`。其他任何值都是加载时错误。经验证提供商 ID 区分大小写（例如是 `"Salesforce"` 而不是 `"salesforce"`）。 |
| `description` | string | 否 | 未设置（`""`） | Aperture 界面中显示的人类可读标签。对已授权的 HTTP 连接器，`aperture_list_connectors` 也会把它返回给有权限的用户。为空时，该字段不会写入存储的配置。 |
| `context` | string 或 JSON | 否 | N/A | 连接器的提示或上下文信息。接受纯字符串或任意 JSON 对象。对已授权的 HTTP 连接器，`aperture_list_connectors` 会把它返回给有权限的用户。 |
| `labels` | 字符串数组 | 否 | `[]` | 用于给连接器分组以控制访问的扁平标签。授权模式 `label:<name>` 会匹配携带该标签的每个连接器。每个标签必须匹配 `[a-zA-Z0-9][a-zA-Z0-9._-]*`。标签 `system` 是保留标签。参阅[连接器标签][ar-connector-labels]。 |
| `auth` | object | 否 | N/A | 认证配置。由 `type` 字段分发。 |

同时使用两种协议的示例：

```json
{
  "connectors": {
    "servers": {
      "tailnetMCP": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp"
      },
      "github": {
        "protocol": "http",
        "url": "https://api.github.com",
        "description": "GitHub REST API (read-only)",
        "auth": {
          "type": "bearer_token",
          "secret": "github_pat_example"
        }
      }
    }
  }
}
```

在这个例子中，`github` 是自定义 HTTP 连接器（未设置 `provider`，因此默认为 `"Custom"`）。它与注册表中的经验证 `GitHub` MCP 连接器不同——后者使用区分大小写的提供商 ID `"GitHub"`。

## 连接器 ID 规则

连接器 ID 必须匹配模式 `[a-zA-Z][a-zA-Z0-9]*`（仅字母和数字，以字母开头）。连接器 ID 不能包含下划线或连字符，因为 MCP 传输格式把它们保留为分隔符：下划线分隔连接器 ID 与工具名（`snowflake_query`），连字符分隔连接器 ID 与资源 URI（`snowflake-resource://...`）。

有效 ID：`github`、`snowflake`、`analyticsV2`。无效 ID：`my-mcp`（连字符）、`github_api`（下划线）、`2fast`（以数字开头）。

`tailscale`、`internal` 和 `aperture` 是保留 ID，不能用作连接器 ID。`aperture` ID 由内置系统连接器使用，其报错信息与 `tailscale` 和 `internal` 不同（参阅[校验错误][ar-validation-errors]）。

## 连接器标签

标签是把连接器分组以控制访问的扁平字符串。在任意连接器上设置 `labels` 字段，然后在授权的 `connectors` 字段里用 `label:<name>` 模式向该组授权：

```json
{
  "connectors": {
    "servers": {
      "salesforce": {
        "protocol": "mcp",
        "url": "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all",
        "labels": ["sales", "restricted"]
      }
    }
  }
}
```

每个标签必须匹配 `[a-zA-Z0-9][a-zA-Z0-9._-]*`。标签以字母或数字开头，只能包含字母、数字、点、下划线和连字符。斜杠会被拒绝，以避免与斜杠分隔的 FQN 模式产生歧义。由于点和连字符合法，标签可以带命名空间（`team.eng`），但 Aperture 既不要求也不解释这一约定。

除语法之外，标签是自由文本。Aperture 不定义词汇表，也不赋予标签值任何含义。仪表板会建议其他连接器已在使用的标签，让一个 Aperture 网关趋向统一词汇，而不是堆积近似重复项。常见方案按数据敏感性（`public`、`private`、`restricted`）、团队归属（`eng`、`sales`）或来源（`system`）对连接器分类。

标签匹配有两个与 FQN 模式不同的特点：

* **精确匹配，无 glob。** `label:<name>` 模式与连接器的标签做字面比较，行为与 Tailscale 授权中的 `tag:` 和 `group:` 相同。`label:team.*` 这样的通配形式什么都匹配不到。
* **整连接器授权。** 匹配到的标签授予该连接器暴露的所有类别和资源，包括 HTTP `proxy` 访问。标签没有单工具粒度。需要工具级或资源级访问时，请使用点名连接器 ID 的 FQN 模式。

> **警告：**
>
> 标签只会扩大访问，绝不会限制访问。授权是叠加且只允许的，因此把连接器标为 `restricted` 只是记录意图而不构成强制：持有 `{"connectors": ["**"]}` 的用户仍然能访问该连接器。要限制敏感连接器，请移除能到达它的宽泛通配授权，改用标签或连接器 ID 从窄授权。

### 保留的 `system` 标签

Aperture 会自动把 `system` 标签应用到内置的 `aperture` 系统连接器。出厂默认配置授予 `label:system`，因此该连接器在新的 Aperture 网关上无需配置即可工作。已配置的 [`Tailnet` 和 `TailnetSSH` 连接器][docs-connectors-built-in]永远不会获得该标签，因为它们是 `connectors.servers` 下的条目。由于默认授权覆盖所有用户，`system` 在 `connectors.servers` 下被保留：

* 保存连接器时，仪表板和连接器 API 会拒绝 `system`。
* 已携带该标签的配置加载时会报警告，并且 Aperture 会在评估任何授权之前剥除该标签。升级后的网关仍能启动，标签也永远不会进入授权评估。

该标签在 `connectors.system_labels` 下仍然有效，`system_labels` 的用途正是给内置连接器分配标签。`system_labels` 是替换而非追加内置连接器的默认标签，因此从列表中省略 `system` 会让默认的 `label:system` 授权不再匹配该连接器：

```json
{
  "connectors": {
    "system_labels": {
      "aperture": ["system", "public"]
    }
  }
}
```

分步说明参阅[按标签授予连接器访问权限][docs-grant-connector-access-by-label]。

## 系统连接器

Aperture 包含独立于 `connectors.servers` 配置出现的内置系统连接器。系统连接器在 `GET /api/connectors` 响应中以 `category: "system"` 出现。

`aperture` 连接器的 `list_connectors` 工具只在配置了至少一个 HTTP 连接器时注册。没有 HTTP 连接器时，该连接器仍出现在列表中，但 `tools/list` 中没有该工具。

| ID | 提供商 | 协议 | 工具 | 标签 | 描述 |
| --- | --- | --- | --- | --- | --- |
| `aperture` | Aperture | MCP | `list_connectors` | `system` | 列出通过 Aperture 可用的所有 HTTP API 连接器。 |

`aperture` 系统连接器帮助 AI 模型发现可用的 HTTP 连接器并构造对 `/v1/connectors/<id>/<path>` 的请求。`aperture` ID 是保留的，不能用作自定义连接器 ID。

`system` 标签只表明来源。Aperture 不给内置连接器附带敏感性标签，因为连接器有多敏感取决于具体部署而不取决于连接器本身。可以用 [`connectors.system_labels`][ar-the-reserved-system-label] 覆盖默认值。`system_labels` 的键必须是本表中的连接器，其他任何键都是加载时错误。

Aperture 还内置了 `Tailnet` 和 `TailnetSSH` 两个连接器，其工具由 Aperture 提供而非代理。它们是带保留 `provider` 值的 `connectors.servers` 条目，不属于本表，因此使用你自选的配置键，并按 ID 授权。参阅[内置连接器][docs-connectors-built-in]。

## 经验证连接器注册表

Aperture 维护着一个经验证连接器注册表，为已知提供商提供预配置默认值。注册表可通过 `GET /api/connectors-registry` 访问，仪表板的连接器选择器用它预填配置字段。

每个注册表条目携带适用于其认证类型的字段。授权码型条目可以包含 `auth_url`、`token_url`、`scopes` 和 `auth_params`。动态客户端注册条目不定义授权 URL 和 token URL。下侧行展示一个授权码型条目：

| 提供商 | 协议 | 认证类型 | URL | 作用域 |
| --- | --- | --- | --- | --- |
| Slack | MCP | `oauth2_authorization_code` | `https://mcp.slack.com/mcp` | `channels:read`、`channels:history`、`users:read`、`search:read.public`、`chat:write` |

Aperture 内置了十多个经验证连接器。字段值（包括 `auth_url`、`token_url`、`scopes` 和 `auth_params`）会随提供商更新端点而变化，因此请查询 `GET /api/connectors-registry` 获取权威的最新列表，不要照抄本页的值。

经验证连接器默认值只是起点。管理员保存连接器后，存储的配置值才是权威来源。运行时不会强制执行注册表值。

经验证注册表为管理仪表板的 **Add connector** 提供预设。管理页面以单一可搜索列表呈现已配置的连接器。未配置的目录条目和内置条目显示在 Chat 的 **Available to add** 下。管理员可以选择 **Configure**。普通配置打开 `/admin/settings/connectors`。

## 连接器类别

每个连接器按来源属于三个类别之一：

| 类别 | 描述 | 示例 |
| --- | --- | --- |
| `system` | Aperture 提供的内置连接器。始终存在。 | `aperture` |
| `custom` | 管理员以 `provider: "Custom"` 或不带 `provider` 字段配置的连接器。 | `github`、`weather` |
| `verified` | `provider` 设置为 `Custom` 以外任何值的连接器。 | `salesforce`（带 `provider: "Salesforce"`） |

## 连接器状态

连接器列表为调用者可见的每个连接器包含一个 `status` 字段。管理员可从 `GET /api/connectors` 获取列表。其他用户通过 Aperture Chat 的 **Connectors** 页面获取，适用同样的可见性与状态规则。只有管理员能调用连接器管理 REST 端点。

下表列出每个 API 状态、Aperture Chat 的显示方式以及解决办法：

| API 状态 | Chat 显示 | 含义 | 解决办法 |
| --- | --- | --- | --- |
| `ready` | **Ready**，位于 **Ready to use** 下 | 调用者有访问权限且已授权。这不确认上游可达、工具列表最新，也不确认实时工具调用会成功。 | 工具列表缺失或过期时，选择 **Refresh tools**。要确认连接器可用，调用一个有权限的工具或代理路径。 |
| `needs_auth` | **Connect**，位于 **Connect to use** 下，无状态徽章 | 调用者有授权，但尚未对这个按用户 OAuth 连接器授权。 | 选择 **Connect**。 |
| `misconfigured` | **Needs reconnect** 配 **Reconnect** | 授权需要更新。访问令牌过期且没有刷新令牌，或提供商拒绝了令牌刷新并要求重新授权。 | 选择 **Reconnect**。若令牌过期后问题反复出现，检查提供商的离线访问配置。 |
| `unavailable` | **Temporarily unavailable** | Aperture 无法读取调用者的凭证状态。 | 刷新或稍后重试，无需重新连接。 |
| `no_access` | 隐藏 | 调用者没有匹配的 `connectors` 授权。 | 由管理员添加匹配的授权。 |
| `not_configured` | 管理员看到 **Available to add**，其他用户看到 **Requires admin setup** | 内置连接器尚无已配置实例。API 把它作为设置占位符返回。 | 由管理员选择 **Configure**。 |

如果提供商不发放刷新令牌，新的授权会一直报告 `ready`，直到其访问令牌过期。

`no_access` 状态遵循以下规则：

* 对非管理员调用者，列表会省略没有匹配授权的已配置连接器。
* 管理员会以 `no_access` 收到这些已配置连接器。
* 内置系统连接器对每个调用者都出现在列表中，调用者没有授权时状态为 `no_access`。
* Aperture Chat 会隐藏 `no_access` 条目，包括对管理员。例外是内置的 `aperture` 系统连接器：当 **Web** 或 **Code Sandbox** 可用时，Chat 仍会列出它。
* 非管理员在 Aperture Chat 中打开未授权的已配置连接器时，Aperture 返回 `404 Not Found`，不暴露该连接器存在。
* 非管理员请求任何 `/api/connectors` REST 端点，Aperture 都会在查找连接器之前返回 `403 Forbidden`。

如果某用户列表中缺少某个已配置连接器，请检查该用户的连接器授权。

状态描述的是调用者的访问与授权，不代表上游健康。连接器详情页显示缓存的能力，不联系上游。按用户的 `ready` 连接器在首次[能力填充][ar-capability-population]未完成时可能显示空工具列表。后续请求或 **Refresh tools** 可以发现工具。**Refresh tools** 会联系上游，可能返回连接错误。工具列表非空并不证明实时工具调用会成功。

## 认证

`auth` 对象的 `type` 字段选择认证方案。下表描述可用的认证类型：

| 类型 | 必填字段 | 描述 |
| --- | --- | --- |
| `bearer_token` | `secret` | 静态 `Authorization: Bearer <secret>` 头。 |
| `api_key` | `secret`、`name`、`in` | 以命名头或查询参数注入的凭证。`in` 必须是 `"header"` 或 `"query"`。 |
| `basic` | `username`、`password` | HTTP Basic 认证。 |
| `oauth2_client_credentials` | `client_id`、`client_secret`、`token_url` | 机器对机器的 OAuth 2.0 token。自动刷新。可选 `scopes` 数组。 |
| `oauth2_authorization_code` | `client_id`、`auth_url`、`token_url` | 按用户的 OAuth 2.0 授权同意流程。可选 `client_secret`（仅用 PKCE 时不需要）、`scopes` 和 `auth_params`。 |
| `oauth2_dcr` | `url` | 使用[动态客户端注册][ar-dcr]的按用户 OAuth 2.0 授权同意流程。Aperture 会在运行时发现授权服务器并注册客户端，因此不需要 `client_id`、`auth_url` 或 `token_url`。可选 `scopes` 和 `auth_params`。 |

### API key

```json
{
  "connectors": {
    "servers": {
      "weather": {
        "protocol": "http",
        "url": "https://api.weather.example.com",
        "auth": {
          "type": "api_key",
          "secret": "wk-example-key",
          "name": "X-API-Key",
          "in": "header"
        }
      }
    }
  }
}
```

`in` 字段必须是 `"header"` 或 `"query"`。设为 `"header"` 时，Aperture 把凭证作为名为 `name` 所指定名称的请求头注入；设为 `"query"` 时，Aperture 把它追加为 URL 查询参数。

### 按用户 OAuth 2.0 授权码流程

连接器使用 `oauth2_authorization_code` 时，每个用户都必须单独完成一次授权同意流程。Aperture 使用 S256 挑战方法的 PKCE。每个用户获得隔离的 MCP 客户端会话，因此把会话状态绑定到 bearer token 的后端不会混用跨用户状态。

#### 发起流程

连接与断开端点只适用于使用按用户交互式 OAuth 流程的连接器（`oauth2_authorization_code` 或 [`oauth2_dcr`][ar-dcr]）。其他连接器返回“未找到”错误。

用户在 Aperture Chat 中发起授权：打开 **Connectors**，在 **Connect to use** 下找到连接器，选择 **Connect**。管理员也可以用 `POST` 请求发起授权：

```
POST /api/connectors/<id>/connect
```

Aperture 返回包含提供商授权 URL 的 JSON 响应：

```json
{"auth_url": "https://provider.example.com/oauth2/authorize?client_id=...&code_challenge=..."}
```

用户在浏览器中打开该 URL 完成同意。提供商通过 `/aperture/auth/<id>/callback` 把用户送回 Aperture。随后 Aperture 把浏览器重定向到连接器详情页，页面显示 **Connected.** 创建 OAuth 应用时，请把 `https://<aperture-hostname>/aperture/auth/<id>/callback` 注册到提供商。

未完成的授权流程会在 15 分钟后过期。用户未在时限内完成同意时，Aperture 会拒绝该流程。再次选择 **Connect** 可发起新流程。

#### 令牌生命周期

Aperture 按用户存储令牌。它把访问令牌视为在实际过期时间前 60 秒即已过期。

* 没有刷新令牌的连接器在其访问令牌可用期间保持 `ready`。令牌过期后，连接器报告 `misconfigured`，Chat 显示 **Needs reconnect**。
* 提供商拒绝令牌刷新并要求重新授权时，连接器同样报告 `misconfigured`。
* 暂时的刷新失败（例如超时或服务器错误）不会改变状态。Aperture 会在下一次请求时重试刷新。

要更新授权，用户在 Aperture Chat 中选择 **Reconnect**。管理员也可以使用连接器管理 REST 端点。

#### 能力填充

对按用户 OAuth 连接器（`oauth2_authorization_code` 和 `oauth2_dcr`），Aperture 会在用户同意后尝试用其凭证获取工具，并且这一步在把用户重定向到 Aperture Chat 之前进行。如果获取超时或失败，连接器可能处于 `ready` 状态但工具列表为空。该用户的目录可由后续请求填充。一个用户的授权或工具列表不会填充另一个用户的目录。

连接器详情页显示该用户可用的能力。工具缺失或过期时选择 **Refresh tools**。刷新会联系上游，上游不可达时可能失败。

#### `auth_params`

`auth_params` 字段把自定义参数同时追加到授权 URL 和 token 交换请求体。部分提供商需要特定参数才会发放刷新令牌：

* **Google**：`{"access_type": "offline", "prompt": "consent"}`。没有 `access_type: offline`，Google 不会发放刷新令牌。

\[Missing snippet: aperture\_google\_workspace\_dpp\_note.mdx]

```json
{
  "connectors": {
    "servers": {
      "google": {
        "protocol": "mcp",
        "url": "https://mcp.google.example.com/v1/mcp",
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "example-client-id",
          "client_secret": "example-client-secret",
          "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
          "token_url": "https://oauth2.googleapis.com/token",
          "scopes": ["https://www.googleapis.com/auth/spreadsheets.readonly"],
          "auth_params": {"access_type": "offline", "prompt": "consent"}
        }
      }
    }
  }
}
```

`auth` 块会拒绝未知字段。字段名拼错（例如把 `"secret"` 写成 `"secert"`）会在加载时产生校验错误。

### 动态客户端注册（oauth2\_dcr）

`oauth2_dcr` 是面向支持动态客户端注册（[RFC 7591][xt-rfc-7591]）的 MCP 服务器的按用户 OAuth 2.0 流程。无需自己注册 OAuth 应用并提供 `client_id`、`auth_url` 和 `token_url`，Aperture 会从连接器的 `url` 发现授权服务器（先 [RFC 9728][xt-rfc-9728] 受保护资源元数据，再 [RFC 8414][xt-rfc-8414] 授权服务器元数据）并在运行时注册客户端。

唯一必填字段是 `url`，即 MCP 服务器的资源 URL。支持可选的 `scopes` 和 `auth_params`。由于没有预先在提供商处注册任何东西，DCR 连接器没有客户端 ID 或密钥。

DCR 连接器使用与 `oauth2_authorization_code` 相同的按用户[连接流程][ar-connect-flow]、[令牌生命周期][ar-token-lifecycle]和[能力填充][ar-capability-population]，只有一个区别：每个 `oauth2_dcr` 连接器都通过单一共享回调 `https://<aperture-hostname>/aperture/auth/dcr/callback` 授权，而不是每连接器一个回调。

```json
{
  "connectors": {
    "servers": {
      "atlassian": {
        "protocol": "mcp",
        "url": "https://mcp.atlassian.com/v1/mcp/authv2",
        "auth": {
          "type": "oauth2_dcr",
          "url": "https://mcp.atlassian.com/v1/mcp/authv2"
        }
      }
    }
  }
}
```

### Bearer token

```json
{
  "connectors": {
    "servers": {
      "snowflake": {
        "protocol": "mcp",
        "url": "https://mcp.example.com/v1/mcp",
        "auth": {
          "type": "bearer_token",
          "secret": "sk-example-token"
        }
      }
    }
  }
}
```

### OAuth 2.0 client credentials

```json
{
  "connectors": {
    "servers": {
      "analytics": {
        "protocol": "mcp",
        "url": "https://analytics.example.com/v1/mcp",
        "auth": {
          "type": "oauth2_client_credentials",
          "client_id": "aperture-analytics",
          "client_secret": "secret-example",
          "token_url": "https://auth.example.com/oauth2/token",
          "scopes": ["read:data"]
        }
      }
    }
  }
}
```

## MCP 连接器

`protocol` 为 `"mcp"` 时，Aperture 连接远程 MCP 服务器，聚合其工具和资源，并通过 `/v1/mcp` 端点暴露它们。

### 名称加前缀

`servers` 映射中的每个键都是一个连接器 ID，Aperture 用它作为名称前缀：

* Aperture 给工具名加连接器 ID 前缀和下划线。例如 `docs` 连接器上名为 `search` 的工具变成 `docs_search`。
* 资源用连字符代替下划线。例如 `docs-files://readme.md`。

名称加前缀避免了多台服务器暴露同名工具时的冲突。客户端收到带前缀的名称，Aperture 在把调用转发给远程服务器时自动剥掉前缀。

### 传输自动探测

Aperture 自动探测每台远程 MCP 服务器支持 Streamable HTTP（当前协议）还是旧版 SSE。连接远程服务器时，Aperture 先尝试 Streamable HTTP，服务器不支持时回退到 SSE。远程服务器升级到更新的协议版本无需重启 Aperture。

对连接到 Aperture `/v1/mcp` 端点的客户端同样适用自动探测。Aperture 同时服务 Streamable HTTP 和旧版 SSE 客户端。

### 能力更新

Aperture 每隔几秒轮询每个不使用按用户凭证的 MCP 连接器。服务器新增或移除工具、资源时，Aperture 会更新已连接客户端可用的能力。

如果 Aperture 无法连接某台远程服务器，它会把该服务器的工具从 `/v1/mcp` 中移除，直到服务器恢复。如果连接成功但无法列出服务器能力，Aperture 会保留上次成功检查时的能力。两种情况下，Aperture Chat 仍可显示最近缓存的工具列表，因此列出某个工具并不保证实时调用会成功。

> **注意：**
>
> 按用户 OAuth 连接器不使用这种周期性检查。它们在用户同意后或后续请求时用该用户的凭证加载能力。要请求当前能力，在 Aperture Chat 中选择 **Refresh tools**。刷新会联系上游服务器，可能在状态仍为 **Ready** 的情况下返回连接错误。

### 系统连接器

Aperture 内置一个暴露 `list_connectors` 工具的 `aperture` 系统连接器。该工具列出通过 Aperture 可用的所有 HTTP API 连接器，帮助 AI 模型发现可以访问哪些 API 以及如何调用。要授权，可使用 `"label:system"`（匹配内置的 `aperture` 连接器），或 `"aperture/**"`、`"aperture/tools/*"` 这样的 FQN 模式。

`aperture` 系统连接器始终出现在 `GET /api/connectors` 中。配置了至少一个 HTTP 连接器时，其 `aperture_list_connectors` MCP 工具可用。

在 `/v1/mcp` 端点上，该工具按连接器 ID 前缀规则显示为 `aperture_list_connectors`。授权引用不带前缀的工具名（例如 `"aperture/tools/list_connectors"`）。

系统连接器与自定义和经验证连接器一样需要授权。没有匹配的 `connectors` 授权，用户无法访问 `aperture` 连接器的工具。默认配置向每个用户授予 `label:system`，移除该授权会让内置工具不可用。

> **提示：**
>
> Aperture 主机使用其 tailnet HTTP 客户端连接远程 MCP 服务器，因此可以直接使用 tailnet 主机名（例如 `http://mcp-server.example.ts.net:8080/v1/mcp`），无需额外的网络配置。

## HTTP 连接器

`protocol` 为 `"http"` 时，Aperture 充当带认证的反向代理。Aperture 把发往 `/v1/connectors/<id>/<path>` 的请求转发到连接器的上游 URL，并自动注入凭证。配置了至少一个 HTTP 连接器后，Aperture 会注册 `aperture_list_connectors` MCP 工具，让 AI 模型能够发现可用的 HTTP 连接器。

> **警告：**
>
> HTTP 连接器上配置的认证凭证由所有拥有匹配 `connectors` 授权的用户共享。用户必须拥有匹配 `"connectorID/proxy"` 或更宽泛模式（如 `"connectorID/**"`）的授权才能访问代理端点。请使用尽可能窄的凭证范围，最好是只读。不要把敏感信息放进 `description` 或 `context`，`aperture_list_connectors` 工具会把这两个字段返回给能调用它的用户。

### 允许的 HTTP 方法

HTTP 连接器接受以下请求方法：`GET`、`HEAD`、`POST`、`PUT`、`PATCH`、`DELETE` 和 `OPTIONS`。其他所有方法（包括 `TRACE` 和 `CONNECT`）都会被拒绝，返回 `405 Method Not Allowed`。阻止 `TRACE` 是因为它会回显请求头，从而暴露注入的认证凭证。

### 请求与响应处理

Aperture 会修改经过 HTTP 连接器代理的请求和响应：

* **请求头**：转发给上游前，Aperture 从客户端请求中剥除 `Authorization` 和 `Cookie` 头，防止客户端注入可能泄露给上游服务器的凭证。Aperture 会根据连接器的 `auth` 配置单独注入正确的凭证。
* **响应头**：Aperture 从上游响应中剥除 `Set-Cookie` 头，防止上游在 Aperture 的源上设置 cookie。
* **逐跳头（hop-by-hop headers）**：标准逐跳头（`Connection`、`Keep-Alive`、`Proxy-Authenticate`、`Proxy-Authorization`、`Te`、`Trailer`、`Transfer-Encoding`、`Upgrade`）按 HTTP 规范在双向剥除。
* **请求体**：原样转发，无大小限制。
* **响应体**：上限 50 MB，超出部分被截断。

### 安全行为

HTTP 连接器实施以下安全限制：

* **URL 限制**：连接器 URL 经过安全拨号器校验，阻止内部和保留地址段。RFC 1918（私有）、ULA 和 Tailscale CGNAT 地址是允许的。
* **重定向阻止**：HTTP 连接器阻止来自上游服务器的所有重定向，防止凭证经由重定向链外泄。
* **凭证注入**：Aperture 根据连接器的 `auth` 配置在每个被代理的请求上注入凭证。客户端提供的 `Authorization` 头总是被替换。

## 动态注册

> **注意：**
>
> 动态注册只能通过旧版 `mcp` 段配置，`connectors` 中没有对应物。此处描述的行为适用于 `mcp` 段。

动态注册让 MCP 服务器在运行时向 Aperture 自行注册，而不是通过静态配置。在配置的 `mcp` 段把 `accept_registrations` 设为 `true`。该字段要求 `mcp` 段，在 `connectors` 中没有等价物。

```json
{
  "mcp": {
    "accept_registrations": true,
    "servers": {}
  }
}
```

远程服务器通过向 `/v1/mcp/register` 发送包含其 URL 的 JSON `POST` 请求来注册：

```shell
curl -X POST http://<aperture-hostname>/v1/mcp/register \
  -H "Content-Type: application/json" \
  -d '{"url": "http://my-mcp-server:8080/v1/mcp"}'
```

Aperture 会先校验注册服务器，然后响应 `200 OK`。每个动态注册的服务器会获得顺序 ID（如 `auto1` 或 `auto2`），Aperture 相应地为其工具加前缀，例如 `auto1_search`。

> **警告：**
>
> 注册端点要求 Tailscale 认证，与所有其他 Aperture 端点一样。注册服务器必须能通过 tailnet 访问。
>
> 注册服务器必须保持与 `/v1/mcp/register` 的 HTTP 连接打开。连接关闭时，Aperture 会自动注销其所有工具和资源。

静态连接器和动态注册可以在同一配置中共存。静态连接器始终可用，动态注册的服务器则随连接与断开来去。

### `mcp` 字段

| 字段 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `accept_registrations` | boolean | `false` | 允许后端通过 `POST /v1/mcp/register` 动态注册。后端以 `POST` 发送 `{"url": "http://..."}` 并保持连接打开。连接关闭时 Aperture 注销其工具。该字段在 `connectors` 中没有对应物。 |
| `servers` | map | `{}` | 服务器 ID 到服务器配置的映射。已弃用：请改用 `connectors.servers`。映射键是服务器 ID，会成为该后端工具（`serverID_toolname`）、资源（`serverID-uri`）和资源模板（`serverID-uriTemplate`）的名称前缀。 |

## 连接器资源的授权

Aperture 默认拒绝。没有授权时，用户无法访问任何连接器能力。MCP 和 HTTP 连接器都是如此。在 Aperture 配置的 `grants` 段中添加授权。

连接器授权使用 `connectors` 字段配合 `"connectorID/category/resource"` FQN glob 模式，或按[标签][ar-connector-labels]匹配的 `label:<name>` 模式。以下示例通过 `system` 标签向所有用户授予内置 Aperture 工具、授予 `docs` 连接器的所有工具，以及 `github` HTTP 连接器的代理访问：

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user"},
          {"connectors": ["label:system"]},
          {"connectors": ["docs/tools/*"]},
          {"connectors": ["github/proxy"]}
        ]
      }
    }
  ]
}
```

`connectors` 字段接受 FQN glob 字符串和 `label:<name>` 字符串的数组。每个 FQN 模式最多三段：`connectorID/category/resource`。

### 授权类别

| 类别 | 适用于 | 描述 | 示例 |
| --- | --- | --- | --- |
| `tools` | MCP 连接器 | 连接器暴露的 MCP 工具 | `"docs/tools/search"` |
| `resources` | MCP 连接器 | 连接器暴露的 MCP 资源 | `"docs/resources/*"` |
| `templates` | MCP 连接器 | 连接器暴露的 MCP 资源模板 | `"docs/templates/*"` |
| `proxy` | HTTP 连接器 | HTTP 连接器端点的代理访问 | `"github/proxy"` |

### 授权模式

`*` 匹配段内任意字符，`**` 跨段匹配：

* `"docs/tools/search"`：`docs` 连接器的 `search` 工具。
* `"docs/tools/*"`：`docs` 连接器的所有工具。
* `"docs/**"`：`docs` 连接器的所有能力（工具、资源、模板）。
* `"github/proxy"`：`github` HTTP 连接器的代理访问。
* `"github/**"`：`github` 下所有类别和资源，包括代理访问和将来新增的类别。只需要 HTTP 代理访问时请用 `"github/proxy"`。
* `"**"`：所有连接器的所有能力。
* `"label:system"`：所有带 `system` 标签的连接器。默认即内置的 `aperture` 系统连接器。该模式包含在出厂默认配置中。
* `"label:team.eng"`：所有带 `team.eng` 标签的连接器，覆盖所有类别和资源。

`"connectorID/*"` 这样的顶层模式会自动展开为 `"connectorID/**"`，覆盖所有类别和子资源。

`label:<name>` 模式按精确匹配而非 glob 展开，匹配即授予整个连接器。标签语法和匹配规则参阅[连接器标签][ar-connector-labels]。

Aperture 在客户端列出可用工具和资源时检查授权，用户只能访问其授权允许的条目。Aperture 还在调用时强制执行授权：客户端调用工具、读取资源或发送代理请求时，Aperture 在分发请求前检查会话的授权。没有匹配授权时，Aperture 以“forbidden”或“unknown tool”错误拒绝调用。

> **注意：**
>
> 已弃用的 `mcp_tools`、`mcp_resources` 和 `mcp_templates` 授权字段为兼容 `"server/item"` 模式语法仍可继续使用。新配置应使用 `connectors` 字段，它支持所有连接器类型，包括 HTTP 代理访问。
>
> 资源授权现在按资源名称而非 URI 匹配。针对资源 URI 编写的旧版 `mcp_resources` 模式不再匹配。请改用 `connectors` 字段的 `resources` 类别，按资源名称重写。

完整的授权语法参阅[授权配置参考][docs-aperture-grants]。

## 从 `mcp.servers` 迁移

`connectors` 段取代了已弃用的 `mcp.servers` 语法。加载时，Aperture 自动把旧的 `mcp.servers` 条目并入 `connectors.servers`，设为 `protocol: "mcp"` 且不带认证。迁移期间两段可以共存，但连接器 ID 必须在两段之间保持唯一。加载时 Aperture 拒绝重复 ID。

使用不符合 `[a-zA-Z][a-zA-Z0-9]*` 模式连接器 ID 的旧 `mcp.servers` 条目会产生警告，但为向后兼容仍被接受。`connectors` 段中的新条目必须符合 ID 规则。

考虑以下 `mcp.servers` 条目：

```json
"mcp": { "servers": { "docs": { "url": "http://mcp-server.example.ts.net:8185/v1/mcp" } } }
```

等价的 `connectors` 条目是：

```json
"connectors": { "servers": { "docs": { "protocol": "mcp", "url": "http://mcp-server.example.ts.net:8185/v1/mcp" } } }
```

保留 `mcp` 段是为了向后兼容以及 `accept_registrations` 字段，后者在 `connectors` 中没有等价物。

## 校验错误

Aperture 在加载时校验连接器配置。下表描述连接器相关的校验消息：

| 条件 | 消息 | 严重级别 |
| --- | --- | --- |
| 连接器缺少 `protocol` | `connectors.servers.{id}: protocol is required (e.g. "mcp" or "http")` | 错误 |
| 连接器协议不受支持 | `connectors.servers.{id}: unsupported protocol "{value}" (supported: "mcp", "http")` | 错误 |
| 连接器 ID 无效 | `connectors.servers.{id}: invalid ID "{id}"; connector IDs must match [a-zA-Z][a-zA-Z0-9]* (letters and digits only, starting with a letter; no hyphens or underscores)` | 错误 |
| 保留连接器 ID（`tailscale`、`internal`） | `connectors.servers.{id}: "{id}" is a reserved identifier` | 错误 |
| 保留系统连接器 ID（`aperture`） | `connectors.servers.{id}: "{id}" is a reserved system connector identifier` | 错误 |
| 连接器设置了未知提供商 | `connectors.servers.{id}: unknown provider "{value}"; use a verified ID or omit for custom connectors` | 错误 |
| 连接器缺少 URL | `connectors.servers.{id}: URL is required` | 警告 |
| 连接器 URL 使用受限地址 | `connectors.servers.{id}: URL {details}` | 警告 |
| 连接器认证校验失败 | `connectors.servers.{id}.auth: {details}` | 错误 |
| 连接器标签无效 | `connectors.servers.{id}.labels: invalid label "{label}"; labels must match [a-zA-Z0-9][a-zA-Z0-9._-]* (no slashes)` | 错误 |
| 用户连接器上使用了保留标签 | `connectors.servers.{id}.labels: removed reserved label "system"` | 警告 |
| `system_labels` 中出现未知的系统连接器 | `connectors.system_labels.{id}: unknown system connector ID` | 错误 |
| `mcp` 与 `connectors` 中连接器 ID 重复 | `config: server ID "{id}" is defined in both 'mcp.servers' and 'connectors.servers'; IDs must be unique across both sections` | 错误 |

完整的校验表参阅 [Aperture 配置参考][docs-aperture-configuration]。

## 管理 REST API 端点

以下端点在运行时管理连接器。它们要求 Tailscale 认证和管理员权限，其他调用者收到 `403 Forbidden`。非管理员用户在 Aperture Chat 中列出连接器、查看和刷新工具、连接与断开。REST 端点按管理员调用者自身的授权和凭证执行。

| 方法 | 路径 | 描述 | 访问权限 |
| --- | --- | --- | --- |
| `GET` | `/api/connectors` | 列出当前用户可见的连接器（system、custom、verified）及其状态。 | 管理员 |
| `GET` | `/api/connectors/<id>/capabilities` | 获取某连接器缓存的 MCP 能力（工具、资源、模板）。按用户缓存未命中时可能返回空列表。 | 管理员加连接器授权 |
| `PUT` | `/api/connectors/<id>/capabilities` | 从上游 MCP 服务器强制刷新能力。上游错误可能使请求失败。 | 管理员加连接器授权 |
| `POST` | `/api/connectors/<id>/connect` | 发起按用户 OAuth 流程。返回 `{"auth_url": "..."}`。 | 管理员加连接器授权 |
| `POST` | `/api/connectors/<id>/disconnect` | 忘记当前用户在某连接器上的 OAuth 令牌。 | 管理员加连接器授权 |
| `GET` | `/api/connectors-registry` | 列出经验证连接器注册表（预配置提供商）。 | 管理员 |

HTTP 连接器代理端点使用 `/v1/connectors` 而非管理 REST API：

| 方法 | 路径 | 描述 | 访问权限 |
| --- | --- | --- | --- |
| 任意受支持方法 | `/v1/connectors/<id>/<path>` | 反向代理到 HTTP 连接器的上游 URL。 | 需要 `connectorID/proxy` 授权 |

## 完整注释示例

以下示例展示同时包含 MCP 与 HTTP 协议、认证、授权和动态注册的完整连接器配置：

```json
{
  // Outbound integrations (MCP servers and HTTP APIs)
  "connectors": {
    "servers": {
      // Unauthenticated MCP server in your tailnet
      "tailnetMCP": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp"
      },
      // MCP server with bearer token auth, grouped by label
      "snowflake": {
        "protocol": "mcp",
        "url": "https://mcp.example.com/v1/mcp",
        "labels": ["analytics", "restricted"],
        "auth": {
          "type": "bearer_token",
          "secret": "sk-example-token"
        }
      },
      // HTTP API proxy with OAuth 2.0 client credentials
      "analytics": {
        "protocol": "http",
        "url": "https://analytics.example.com/api",
        "description": "Analytics API (read-only)",
        "auth": {
          "type": "oauth2_client_credentials",
          "client_id": "aperture-analytics",
          "client_secret": "secret-example",
          "token_url": "https://auth.example.com/oauth2/token",
          "scopes": ["read:data"]
        }
      }
    }
  },

  // Dynamic MCP registration (accept_registrations has no connectors equivalent)
  "mcp": {
    "accept_registrations": true
  },

  // Grant all users the built-in Aperture tools (the shipped default) and,
  // separately, everything the analytics team needs by label
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user"},
          {"connectors": ["label:system"]}
        ]
      }
    },
    {
      "src": ["group:analytics"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"connectors": ["label:analytics"]}
        ]
      }
    }
  ]
}
```

## 故障排查

连接器问题分为两类，成因与解法不同：管理员设置和配置连接器，用户授权并使用连接器工具。请按你的角色选择对应章节。

连接器列表和 **Ready** 状态不会探测上游健康。**Refresh tools** 才是显式的上游能力检查。

### 面向设置连接器的管理员

以下问题影响连接器配置与可达性。管理员在 **Administration** > **Connectors** 下管理和校验配置与授权。

#### Chat 中缺少连接器或工具

已配置的连接器没出现在 Chat 中，可能是被授权拒绝而省略。管理员在 **Administration** > **Connectors** 下校验连接器配置和授权。

MCP 工具缺失时，管理员应校验上游 URL、认证配置和能力过滤器。被授权的用户随后在 Chat 中打开连接器详情页并选择 **Refresh tools**。如果刷新返回错误，校验从 Aperture 网关的可达性并确认凭证有效。

#### 连接被拒或主机未找到

这些错误表明连接器 URL 无法从 Aperture 网关访问。

* **Connection refused**：服务器未运行或未在配置的端口监听。
* **Host not found**：DNS 无法解析主机名。对 tailnet 主机名，确认设备已连接 tailnet，并用 `tailscale status` 检查。

#### 认证配置因未知字段被拒绝

`auth` 块使用严格的字段校验。字段名拼错（例如把 `"secret"` 写成 `"secert"`）会导致配置加载失败并报 JSON 解码错误。请对照上文的认证类型表仔细核对字段名。

#### 动态注册失败

远程服务器无法动态注册时：

1. 确认配置的 `mcp` 段中 `accept_registrations` 已设为 `true`（该字段在 `connectors` 段中不可用）。
2. 确认远程服务器向 `/v1/mcp/register` 发送了包含 `{"url": "<mcp-server-url>"}` JSON 体的有效 `POST` 请求。
3. 远程服务器必须在注册后保持 HTTP 连接打开。连接关闭时，Aperture 会立即注销其工具。

### 面向授权和使用连接器的用户

以下问题影响连接器授权和工具调用。用户可以在 Aperture Chat 中查看状态、刷新工具和重新连接。授权后刷新或工具调用仍然失败时，可能需要管理员检查上游服务或连接器配置。

#### 授权与重新连接

* **Connect**：每个用户都必须单独授权按用户 OAuth 连接器。选择 **Connect** 并完成提供商的同意流程。连接器已是 **Ready** 但工具仍然缺失时，选择 **Refresh tools**。上游不可达时发现可能失败。
* **Needs reconnect**：访问令牌过期且没有刷新令牌，或令牌刷新失败要求重新授权。选择 **Reconnect**。令牌过期后问题反复出现时，请管理员检查提供商的离线访问配置。
* **Temporarily unavailable**：Aperture 无法读取凭证状态。刷新页面即可，无需重新连接。
* **重置授权**：要清除你的按用户授权，选择 **Disconnect**，然后选择 **Connect** 重新授权。

#### 工具此前正常，现在失效

连接器是 **Ready** 但工具失败时，检查提供商是否临时停机、超时或触发限流。不要仅因一次工具调用失败就断开有效的授权。

#### 工具调用超时

工具调用因超时失败时，说明远程 MCP 服务器响应不够快。连接错误后，Aperture 会重连远程服务器并重试一次工具调用。超时持续时，请管理员检查远程服务器的性能和日志。

[ar-capability-population]: #能力填充

[ar-connect-flow]: #发起流程

[ar-connector-labels]: #连接器标签

[ar-dcr]: #动态客户端注册oauth2_dcr

[ar-the-reserved-system-label]: #保留的-system-标签

[ar-token-lifecycle]: #令牌生命周期

[ar-validation-errors]: #校验错误

[docs-aperture-admin-connectors]: /docs/aperture/reference/dashboard-admin#connectors

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-connectors-built-in]: /docs/aperture/connectors/built-in-connectors

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-grant-connector-access-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[xt-mcp-spec]: https://modelcontextprotocol.io/specification

[xt-rfc-7591]: https://www.rfc-editor.org/rfc/rfc7591

[xt-rfc-8414]: https://www.rfc-editor.org/rfc/rfc8414

[xt-rfc-9728]: https://www.rfc-editor.org/rfc/rfc9728
