---
title: "MCP 服务器代理"
description: "通过 Aperture 聚合远程 MCP 服务器的工具与资源，并实施基于身份的访问控制。"
---

最后验证于 Aug 14, 2026

Aperture 可以聚合多个远程 [Model Context Protocol][xt-mcp-spec]（MCP）服务器的工具与资源，并通过单一的 `/v1/mcp` 端点将它们提供给 AI agent。这样你就能把 MCP 工具管理集中到 Aperture 代理后面，并使用与 LLM 提供商相同的基于身份的访问控制。本页面专门介绍 MCP 协议连接器。HTTP API 连接器请参阅[连接器功能指南][docs-aperture-connectors]。

Aperture 在与 AI agent 客户端通信时充当 MCP 服务器，在与远程 MCP 服务器通信时充当 MCP 客户端。客户端连接到 Aperture 的 `/v1/mcp` 端点，即可访问来自每个已配置远程服务器的所有工具和资源的聚合列表。

## 使用场景

MCP 服务器代理适用于以下场景：

* **集中式工具访问**：将多个 MCP 服务器的工具聚合到单一端点后面。AI agent 只需连接一个 URL，无需分别管理与每个服务器的连接。
* **基于身份的访问控制**：使用与 LLM 提供商相同的 Tailscale 身份和授权（grant）系统，控制哪些用户可以访问哪些 MCP 工具和资源。
* **动态工具发现**：在运行时注册和注销 MCP 服务器。服务器上线时其工具自动可用，下线时 Aperture 会移除其工具。
* **协议兼容**：连接使用不同协议版本的 MCP 服务器。Aperture 会自动检测每个服务器支持 Streamable HTTP 还是旧版 SSE，并处理协议转换。

## MCP 核心概念

[Model Context Protocol][xt-mcp-spec] 定义了 AI agent 发现和使用外部能力的标准方式。以下概念与在 Aperture 中配置 MCP 相关：

* **工具（tools）**：LLM 可以发现并调用的函数，例如搜索数据库或执行命令。
* **资源（resources）**：由 URI 标识、LLM 可以读取的上下文数据，例如文件内容或 API 响应。
* **Streamable HTTP**：当前的 MCP 传输协议，使用单一 HTTP 端点进行双向通信。
* **旧版 SSE**：已弃用的 MCP 传输方式，使用 Server-Sent Events。为保持向后兼容，Aperture 对两种传输方式都提供支持。

## 前提条件

使用 MCP 服务器代理之前，你需要具备以下条件：

* 你的 [tailnet][docs-tailnet] 已启用 Aperture。如果尚未设置，请参阅[开始使用 Aperture][docs-aperture-get-started]。
* 至少一个可经你的 tailnet 从 Aperture 主机访问的 MCP 服务器。
* 每个 MCP 服务器端点的 URL（例如 `http://mcp-server.example.ts.net:8080/v1/mcp`）。

> **注意：**
>
> `connectors` 配置部分始终可用。`connectors` 特性开关已弃用，请勿在新的配置中添加它。旧版 `mcp.servers` 语法仍然可用。

## 开始使用

要在 Aperture 中配置 MCP 服务器代理，需要添加远程服务器、授权用户访问 MCP 工具，并连接 MCP 客户端。

### 第 1 步：配置 MCP 服务器

\[缺失片段：aperture\_admin\_nav.mdx] 在你的配置中添加一个 `connectors` 部分，包含一个或多个远程服务器。每个连接器都可以包含可选的 `description` 和 `context` 字段。`description` 是界面中显示的人类可读标签。`context` 接受纯字符串或 JSON。对于已授权的 HTTP 连接器，Aperture 会通过 `aperture_list_connectors` 将这两个字段呈现给模型。

```json
{
  "connectors": {
    "servers": {
      "analytics": {
        "protocol": "mcp",
        "url": "https://analytics.example.com/v1/mcp",
        "description": "Internal analytics MCP server",
        "context": "Use this connector to query product analytics data. Returns JSON with metrics for DAU, MAU, and revenue."
      }
    }
  }
}
```

> **警告：**
>
> 对于已授权的 HTTP 连接器，`aperture_list_connectors` 会把 `description` 和 `context` 返回给能调用该工具的用户。它们不会自动包含在 MCP 工具发现中。请勿包含机密或敏感信息。

`servers` 映射中的每个键都是一个服务器 ID，Aperture 会将其用作名称前缀。对于名为 `docs` 的连接器：

* 来自 `docs` 服务器的工具会加上 `docs_` 前缀（例如，名为 `search` 的工具会变成 `docs_search`）。
* 资源则使用连字符而不是下划线（例如 `docs-files://readme.md`）。

名称加前缀可以避免多个服务器暴露同名工具时发生冲突。客户端收到的是带前缀的名称，而 Aperture 在把调用转发到远程服务器时会自动去掉前缀。

#### 旧语法

`mcp.servers` 语法已弃用。新配置应使用上面展示的 `connectors` 语法。迁移细节请参阅[连接器功能指南][docs-aperture-connectors]。

```json
{
  "mcp": {
    "servers": {
      "docs": {
        "url": "http://docs.example.ts.net:8185/v1/mcp"
      },
      "remote": {
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp"
      }
    }
  }
}
```

> **提示：**
>
> Aperture 主机使用其 tailnet HTTP 客户端连接远程 MCP 服务器，因此你可以直接使用 tailnet 主机名（例如 `http://mcp-server.example.ts.net:8080/v1/mcp`），无需额外的网络配置。

### 第 2 步：授权访问 MCP 工具

Aperture 默认拒绝。没有 MCP 授权时，用户无法访问任何 MCP 能力。请在配置的 `grants` 部分添加 MCP 授权。

MCP 授权使用 `connectors` 字段，取值为 `"connectorID/category/resource"` 形式的 FQN glob 模式，或按标签匹配连接器的 `label:<name>` 模式。下面的示例通过 `system` 标签向所有用户授予内置 Aperture 工具（这是新的 Aperture 网关自带的授权），并授予 `docs` 连接器的所有工具：

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"connectors": ["label:system"]},
          {"connectors": ["docs/tools/*"]}
        ]
      }
    }
  ]
}
```

`*` 可以匹配单个路径段内的任意字符（不会跨越 `/`），`**` 可以匹配零个或多个路径段。例如：

* `"docs/tools/search"` 匹配 `docs` 连接器的 `search` 工具。
* `"docs/tools/*"` 匹配 `docs` 连接器的所有工具。
* `"docs/**"` 匹配 `docs` 连接器的所有能力（工具、资源、模板）。
* `"**"` 匹配所有连接器的所有能力。

`label:<name>` 模式按精确匹配，而不会作为 glob 展开，它会授予带有该标签的每个连接器的所有类别和资源。连接器级策略使用标签，工具级访问使用 FQN 模式。请参阅[按标签授予连接器访问权限][docs-grant-by-label]。

Aperture 会在客户端列出可用工具和资源时检查授权，并在调用时强制执行。用户只能访问其授权允许的项目。

> **注意：**
>
> 已弃用的 `mcp_tools` 和 `mcp_resources` 授权字段仍可继续使用，以向后兼容 `"server/item"` 模式语法。新配置应使用 `connectors` 字段。

完整的授权语法请参阅[授权配置参考][docs-aperture-grants]，或按照[授权访问 MCP 工具][docs-grant-mcp-tool-access]指南一步步操作。

\[缺失片段：aperture\_grant\_dst\_note.mdx]

### 第 3 步：连接 MCP 客户端

将你的 MCP 客户端（即 AI agent 宿主）配置为使用 Aperture URL 作为 MCP 服务器端点。例如，在 MCP 客户端配置文件中：

```json
{
  "mcpServers": {
    "aperture": {
      "url": "http://<aperture-hostname>/v1/mcp"
    }
  }
}
```

将 `<aperture-hostname>` 替换为你的 Aperture 网关的 [MagicDNS][docs-magicdns] 名称。

Aperture 会自动检测客户端使用的是 Streamable HTTP（当前 MCP 协议）还是旧版 SSE，并以相应的传输方式响应。

### 第 4 步：验证连接

将你的 MCP 客户端连接到 `http://<aperture-hostname>/v1/mcp` 并列出可用工具。工具列表应包含来自所有已配置服务器的带前缀名称（例如 `docs_search`、`remote_get_user`）。

## 内置工具

Aperture 在 `aperture` 连接器前缀下提供以下内置工具：

* `aperture` 系统连接器始终存在，但和其他连接器一样，需要有匹配的 `connectors` 授权。作为系统连接器，它在授权路径中不赋予任何默认访问权限。它暴露 `aperture_list_connectors` 工具，你可以用 FQN `aperture/tools/list_connectors` 授予该工具。该工具返回通过 Aperture 可用的所有 HTTP API 连接器的列表。agent 调用它来发现可用的已认证 API 代理。只有配置了至少一个 HTTP 连接器时，Aperture 才会注册它。
* 当 Aperture 运维者使用 `LLM_PROXY_EXA_API_KEY` 或 `-exa-api-key` 命令行标志配置 EXA 后，`aperture_web_search` 和 `aperture_web_fetch` 即可用。已弃用的 `web_tools` 特性开关不是必需的。

内置的 `aperture` 系统连接器会自动携带 `system` 标签。新的 Aperture 网关的默认配置向所有用户授予 `label:system`。已配置的 [`Tailnet` 和 `TailnetSSH` 连接器][docs-connectors-built-in]永远不会获得该标签，因此请按 ID 授权它们。

该授权让 `aperture` 连接器变得可访问。如果移除它，该连接器会像其他连接器一样落入默认拒绝范围。Web 工具带有相同的 `aperture` 前缀并使用相同的授权。但只有配置了 EXA 时 Aperture 才会注册它们，因此仅有授权并不会让它们出现。

要授予所有 `aperture` 系统工具，请使用 `"connectors": ["label:system"]` 或 `"connectors": ["aperture/**"]`。要仅针对工具类别，请使用 `"connectors": ["aperture/tools/*"]`。要只授予 Web 搜索工具，请使用 `"connectors": ["aperture/tools/web_search"]`。

## 常见场景

以下小节介绍与 MCP 服务器代理相关的常见任务。

### 启用动态注册

动态注册让 MCP 服务器可以在运行时向 Aperture 自行注册，而不是静态配置。在 `mcp` 部分将 `accept_registrations` 设置为 `true`。

```json
{
  "mcp": {
    "accept_registrations": true,
    "servers": {}
  }
}
```

启用动态注册后，远程服务器通过向 `/v1/mcp/register` 发送包含自身 URL 的 JSON 体的 POST 请求来注册：

```shell
curl -X POST http://<aperture-hostname>/v1/mcp/register \
  -H "Content-Type: application/json" \
  -d '{"url": "http://my-mcp-server:8080/v1/mcp"}'
```

Aperture 会先验证注册的服务器，然后才返回 HTTP 200。每个动态注册的服务器都会获得一个顺序 ID（例如 `auto1` 或 `auto2`），其工具使用该前缀，例如 `auto1_search`。

> **警告：**
>
> 注册端点与其他所有 Aperture 端点一样，需要 Tailscale 身份验证。发起注册的服务器必须可以经由 tailnet 访问。
>
> 发起注册的服务器必须保持与 `/v1/mcp/register` 的 HTTP 连接不断开。当该服务器关闭连接时，Aperture 会自动注销其所有工具和资源。

你可以在同一配置中组合静态服务器和动态注册。静态服务器始终可用，而动态注册的服务器随连接与断开来去。

### 使用每用户 OAuth 授权连接

`oauth2_authorization_code` 认证类型支持每用户 OAuth 流程。每个用户完成自己的授权，Aperture 按用户管理令牌。

```json
{
  "connectors": {
    "servers": {
      "salesforce": {
        "protocol": "mcp",
        "url": "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all",
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "your-client-id",
          "auth_url": "https://login.salesforce.com/services/oauth2/authorize",
          "token_url": "https://login.salesforce.com/services/oauth2/token",
          "scopes": ["mcp_api", "refresh_token"]
        }
      }
    }
  }
}
```

每用户 OAuth 采用惰性填充：在用户完成 OAuth 流程之前，工具不会出现。

`client_secret` 字段是可选的，仅使用 PKCE 的流程不需要它。使用 `auth_params` 可以向 OAuth 授权请求和令牌请求传递额外参数，例如用 `"access_type": "offline"` 获取刷新令牌。

对于支持动态客户端注册的 MCP 服务器，请改用 [`oauth2_dcr`][docs-connectors-reference-dcr] 认证类型。Aperture 会在运行时发现授权服务器并注册客户端，因此你只需提供服务器 `url`，无需 `client_id`、`auth_url` 或 `token_url`。

## HTTP API 连接器

Aperture 还可以通过 `protocol: "http"` 的连接器代理 HTTP API 请求。这类连接器充当经过身份验证的反向代理，将凭证注入传出请求。

HTTP 连接器通过 `/v1/connectors/<id>/<path>` 访问，而不是 `/v1/mcp`。agent 通过调用 `aperture` 系统连接器暴露的 `aperture_list_connectors` 工具来发现可用的 HTTP 连接器。

```json
{
  "connectors": {
    "servers": {
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

HTTP API 连接器的完整文档（包括支持的认证类型和访问控制）请参阅[连接器功能指南][docs-aperture-connectors]。

## MCP 配置参考

完整的 `mcp` 配置语法请参阅 [Aperture 配置参考][docs-aperture-mcp-config]。以下小节介绍 Aperture 如何处理传输检测和服务器可用性。

* 连接器配置（包括 HTTP API 连接器和认证类型）请参阅[连接器功能指南][docs-aperture-connectors]和[连接器配置参考][docs-aperture-connectors-config]。

### 传输自动检测

Aperture 会自动检测每个远程 MCP 服务器支持 Streamable HTTP（当前协议）还是旧版 SSE。连接远程服务器时，Aperture 先尝试 Streamable HTTP，如果服务器不支持再回退到 SSE。远程服务器可以升级到更新的协议版本，而无需重启 Aperture。

连接到 Aperture `/v1/mcp` 端点的客户端同样适用自动检测。Aperture 同时服务 Streamable HTTP 客户端和旧版 SSE 客户端。

### 能力更新

Aperture 会定期检查已配置的远程 MCP 服务器的能力变化。当服务器添加或移除工具或资源时，Aperture 会更新已连接客户端可用的能力。

如果远程服务器变得不可用，其工具和资源在服务器恢复之前保持不可用。服务器恢复后，Aperture 会重新使它们可用。

使用 `oauth2_authorization_code` 认证的服务器会在每个用户开始会话时加载能力。用户可以通过 `PUT /api/connectors/<id>/capabilities` 请求最新能力。该请求会联系上游服务器，可能返回连接错误。

## 限制

MCP 服务器代理存在以下限制：

* **能力更新并非即时**：Aperture 定期检测远程服务器的能力变化。新增或移除的工具在客户端可用之前可能有短暂延迟。使用 `oauth2_authorization_code` 的连接器会在用户开始会话或请求刷新能力时按用户加载能力。
* **授权执行**：Aperture 在列出和调用时都会强制执行授权。用户只能访问其授权允许的工具和资源；对于不匹配任何授权的 `tools/call` 和 `resources/read` 请求，Aperture 会以 "unknown tool" 或 "unknown resource" 错误拒绝。

## 故障排除

使用以下小节诊断并解决 MCP 服务器配置的常见问题。

### MCP 工具不出现

如果看不到来自已配置 MCP 服务器的工具：

1. 检查配置中的 URL 是否正确，以及 MCP 服务器是否正在运行。
2. 检查能否从 Aperture 主机访问该 MCP 服务器。可在 Aperture 主机上用 `curl -v <your-mcp-server-url>` 测试。
3. 检查你的授权是否包含与服务器和工具名称匹配的 `connectors` 模式（或已弃用的 `mcp_tools` 模式）。没有授权时，用户无法访问任何 MCP 工具。

### 连接被拒绝或找不到主机

这些错误表明 MCP 服务器 URL 不可达。

* **连接被拒绝**：服务器未运行，或未在配置的端口上监听。
* **找不到主机**：主机名无法解析。对于 tailnet 主机名，请确认 MCP 服务器设备已连接到 tailnet，并用 `tailscale status` 检查。

### 工具出现后又消失

如果工具短暂可见后又变得不可用，远程 MCP 服务器可能正在崩溃或重启。当远程服务器变得不可达时，Aperture 会自动注销其工具；服务器恢复后再重新注册。

### 动态注册失败

如果远程服务器无法动态注册：

1. 检查 `mcp` 配置中的 `accept_registrations` 是否已设置为 `true`。
2. 确保远程服务器向 `/v1/mcp/register` 发送有效的 POST 请求，JSON 体中包含 `{"url": "<mcp-server-url>"}`。
3. 远程服务器必须在注册后保持 HTTP 连接不断开。如果连接关闭，Aperture 会立即注销该服务器的工具。

### 工具调用超时

如果工具调用因超时错误而失败，说明远程 MCP 服务器响应时间过长。Aperture 会在连接错误时重试一次工具调用。请检查远程服务器的性能，确保它能在合理时间内响应。

[docs-aperture-connectors-config]: /docs/aperture/configuration#connectors

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-aperture-mcp-config]: /docs/aperture/configuration#mcp

[docs-connectors-built-in]: /docs/aperture/connectors/built-in-connectors

[docs-connectors-reference-dcr]: /docs/aperture/connectors/reference#dynamic-client-registration-oauth2_dcr

[docs-grant-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-magicdns]: /docs/features/magicdns

[docs-tailnet]: /docs/concepts/tailnet

[xt-mcp-spec]: https://modelcontextprotocol.io/specification
