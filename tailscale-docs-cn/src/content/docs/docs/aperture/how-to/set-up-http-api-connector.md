---
title: "设置 HTTP API 连接器"
description: "\\[Missing snippet: aperture\\_mcp\\_grant\\_deprecation\\_note.mdx]"
---

最后验证于 Sep 28, 2026

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

AI 智能体经常需要调用 REST API，但把 API 密钥分发给每个智能体运行时会加大凭证泄露的风险。HTTP 连接器让 Aperture 充当已认证的反向代理：智能体把请求发给 Aperture，Aperture 再把请求转发给上游 API，并自动注入凭证。

## 前提条件

开始之前，你必须满足以下要求：

* 你有一台 [Aperture 网关][docs-get-started]，且至少配置了一个提供商。
* 你有 [Aperture 配置][docs-aperture-configuration]的管理权限。
* 你有上游服务的 API 凭证（token、API key 或用户名/密码）。
* 你有上游 REST API 的 base URL。
* 你要从与 Aperture 网关位于同一 tailnet 的设备上发起测试请求。Aperture 依据调用者的 Tailscale 身份识别调用者，没有 tailnet 身份的请求会被拒绝。

## 步骤 1：选择上游 base URL

`url` 字段是上游 API 的 base URL。Aperture 会把每个代理请求的路径拼接到这个 base 后面，因此 URL 应指向 API 根路径。末尾斜杠可有可无，Aperture 会自动归一化。

例如：

* `https://api.github.com` —— GitHub REST API
* `https://your-org.atlassian.net/rest/api/3` —— Jira Cloud REST API
* `https://api.stripe.com/v1` —— Stripe API

> **注意：**
>
> 加载配置时，Aperture 会对不安全的连接器 URL 发出警告，并在请求时拒绝该连接。通过管理仪表板保存不安全 URL 会被当作错误拒绝。内部地址段与保留地址段会被阻止。RFC 1918 私有地址、ULA 地址和 Tailscale CGNAT 地址是允许的，因此你可以代理到 tailnet 或私有网络中的服务。

## 步骤 2：配置认证

打开管理仪表板，进入 **Administration** > **Connectors**。选择 **Add connector** > **Custom connector**，再选择 **HTTP**。要编辑 JSON，进入 **Administration** > **Configuration**。每个连接器条目都需要：`protocol` 设为 `"http"`、一个 `url`，以及一个与上游 API 认证方式匹配的 `auth` 块。

### Bearer token

上游 API 期望收到 `Authorization: Bearer <token>` 头时，使用 `bearer_token`。这是 GitHub、Stripe 这类 API 最常见的模式。

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
          "secret": "<your-github-pat>"
        }
      }
    }
  }
}
```

### API key

上游 API 期望通过命名请求头或查询参数传递凭证时，使用 `api_key`。把 `in` 设为 `"header"` 或 `"query"`，`name` 设为该请求头或参数的名称。

```json
{
  "connectors": {
    "servers": {
      "weather": {
        "protocol": "http",
        "url": "https://api.weather.example.com",
        "auth": {
          "type": "api_key",
          "secret": "<your-api-key>",
          "name": "X-API-Key",
          "in": "header"
        }
      }
    }
  }
}
```

### HTTP Basic

上游 API 使用 HTTP Basic 认证时，使用 `basic`。Atlassian API（Jira、Confluence）常用这种方式，以邮箱地址加 API token 认证。

```json
{
  "connectors": {
    "servers": {
      "jira": {
        "protocol": "http",
        "url": "https://your-org.atlassian.net/rest/api/3",
        "auth": {
          "type": "basic",
          "username": "api-user@example.com",
          "password": "<your-api-token>"
        }
      }
    }
  }
}
```

### OAuth 2.0 client credentials

机器对机器的 OAuth 2.0 流程使用 `oauth2_client_credentials`。Aperture 通过客户端凭证（client credentials）授权模式获取并自动刷新访问令牌。

```json
{
  "connectors": {
    "servers": {
      "analytics": {
        "protocol": "http",
        "url": "https://analytics.example.com/api",
        "description": "Analytics API (read-only)",
        "auth": {
          "type": "oauth2_client_credentials",
          "client_id": "aperture-analytics",
          "client_secret": "<your-client-secret>",
          "token_url": "https://auth.example.com/oauth2/token",
          "scopes": ["read:data"]
        }
      }
    }
  }
}
```

Aperture 还支持面向每用户同意流程的 `oauth2_authorization_code`。详情参阅[连接器参考][docs-connectors-reference]。

连接器 ID（即 `github`、`weather`、`jira` 这类映射键）只能包含字母和数字，且必须以字母开头。`tailscale`、`internal` 和 `aperture` 是保留 ID。

## 步骤 3：设置 description 与 context 供智能体发现

`description` 和 `context` 字段帮助 AI 模型和人类操作者理解每个 HTTP 连接器的用途。

* `description` 是显示在 Aperture 管理仪表板中的简短人类可读标签。
* `context` 提供指令或元数据，帮助 AI 模型判断何时以及如何使用该连接器。它可以是纯字符串或 JSON 对象。

对已授权的 HTTP 连接器，`aperture_list_connectors` 工具会把这两个字段返回给能调用该工具的用户。

```json
{
  "connectors": {
    "servers": {
      "github": {
        "protocol": "http",
        "url": "https://api.github.com",
        "description": "GitHub REST API (read-only)",
        "context": "Use this connector to look up repository metadata, pull request status, and issue details. Do not create or modify resources without explicit user approval.",
        "auth": {
          "type": "bearer_token",
          "secret": "<your-github-pat>"
        }
      }
    }
  }
}
```

> **警告：**
>
> 不要在 `description` 或 `context` 中放入密钥、内部 URL 或其他敏感信息。能调用 `aperture_list_connectors` 的用户可以读取其已授权 HTTP 连接器的这些字段。

## 步骤 4：向用户授予连接器访问权

Aperture 默认拒绝所有请求。没有匹配的 `connectors` 授权时，用户调用代理端点会收到 `403 Forbidden`。请在配置的 `grants` 段中添加授权。

对 HTTP 连接器来说，`proxy` 类别控制对 `/v1/connectors/<id>/<path>` 代理端点的访问。下面的授权让所有用户获得对 `github` 连接器的代理访问权，以及内置 Aperture 工具的访问权，其中包括 `aperture_list_connectors`，它让 AI 模型能发现可用的 HTTP 连接器：

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user"},
          {"connectors": ["aperture/**"]},
          {"connectors": ["github/**"]}
        ]
      }
    }
  ]
}
```

模式 `"github/**"` 授予对 `github` 连接器的全部访问权（代理及未来可能新增的类别）。你也可以用更具体的模式 `"github/proxy"` 只授予代理访问权。

`aperture_list_connectors` 工具通过模型的 MCP 连接暴露给模型，因此模型是通过 MCP（而非仪表板）访问它。模型调用 `aperture_list_connectors` 时，Aperture 返回一段结构化文本，列出每个 HTTP 连接器的 ID、代理端点、上游 URL、描述和上下文：

```text
Aperture HTTP API Connectors
============================
The following HTTP APIs are available through authenticated proxy endpoints.
Aperture handles all authentication automatically.

Base URL: https://ai.example.ts.net
Make requests to {Base URL}/v1/connectors/{id}/{path}

Available connectors:

## github
- Endpoint: https://ai.example.ts.net/v1/connectors/github/
- Upstream: https://api.github.com
- Description: GitHub REST API (read-only)
- Context: Use this connector to look up repository metadata and pull request status.
```

## 步骤 5：验证代理是否生效

保存配置并添加授权后，通过 Aperture 网关发送一个测试请求。使用如下 URL 模式：

```text
/v1/connectors/<connector-id>/<path>
```

Aperture 会把 `<path>` 拼接到连接器的 base URL 后面，并自动注入已配置的凭证。对上文配置的 GitHub 连接器：

```shell
curl http://<aperture-hostname>/v1/connectors/github/user
```

Aperture 把该请求转发到 `https://api.github.com/user`，并把 bearer token 注入为 `Authorization` 头。上游 API 的响应会返回给调用方。

查询参数原样透传。例如，列出处于打开状态的 pull request：

```shell
curl "http://<aperture-hostname>/v1/connectors/github/repos/tailscale/tailscale/pulls?state=open&per_page=5"
```

Aperture 把请求转发到 `https://api.github.com/repos/tailscale/tailscale/pulls?state=open&per_page=5`，并注入凭证。

如果尚未添加授权（见步骤 4），该请求会返回 `403 Forbidden`。请先添加授权再重试。其他错误参阅[故障排查][ar-troubleshooting]。

## 安全行为

HTTP 连接器实施了若干安全限制，以减少凭证暴露。

**共享凭证**：HTTP 连接器上配置的认证凭证由所有拥有匹配 `connectors` 授权的用户共用。用户必须持有匹配 `"connectorID/proxy"` 或更宽泛模式（如 `"connectorID/**"`）的授权才能访问代理端点。请为每个连接器使用尽可能窄的凭证权限范围（最好是只读）。

**允许的 HTTP 方法**：Aperture 接受 GET、HEAD、POST、PUT、PATCH、DELETE 和 OPTIONS。其他所有方法（包括 TRACE 和 CONNECT）都会被拒绝，返回 `405 Method Not Allowed`。Aperture 阻止 TRACE 是因为它会回显请求头，从而暴露注入的认证凭证。

**请求头剥离**：转发到上游之前，Aperture 会从客户端请求中剥掉 `Authorization` 和 `Cookie` 头，再从连接器的 `auth` 配置注入正确的凭证。Aperture 还会从上游响应中剥掉 `Set-Cookie` 头，并在两个方向上移除标准逐跳头（hop-by-hop headers）（`Connection`、`Keep-Alive`、`Proxy-Authenticate`、`Proxy-Authorization`、`Te`、`Trailer`、`Transfer-Encoding`、`Upgrade`）。

**阻止重定向**：Aperture 会阻止来自上游服务器的所有重定向。这降低了凭证经由重定向链外泄的风险——被攻陷的上游可能把请求重定向到攻击者控制的 URL，并带上注入的凭证。

**响应大小上限**：Aperture 将响应限制在 50 MB 以内，超出上限的响应会被静默截断。此时响应仍返回 `200` 和被截断的正文，而不是错误状态码，因此客户端不应依赖 `Content-Length` 与正文一致。

## 故障排查

使用以下小节排查 HTTP 连接器的常见问题。

### 405 Method Not Allowed

请求使用了 Aperture 不允许的 HTTP 方法。HTTP 连接器接受 GET、HEAD、POST、PUT、PATCH、DELETE 和 OPTIONS。如果你的 API 客户端使用 TRACE 或 CONNECT，请改用受支持的方法。

### 502 Bad Gateway

Aperture 无法连接上游服务器。可能的原因：

* 连接器的 `url` 不正确，或上游服务器没有运行。
* DNS 无法解析上游主机名。对 tailnet 主机名，请用 `tailscale status` 确认设备已连接。
* 上游 URL 使用了受限的内部地址或保留地址，被安全拨号器（safe dialer）阻止。RFC 1918 地址和 Tailscale CGNAT 地址是允许的。

### 上游返回意外的 403 或 401

Aperture 成功连接到上游，但上游拒绝了请求。可能的原因：

* `auth` 块中的凭证无效、已过期或权限不足。
* `auth` 类型与上游期望的不一致（例如，API 要求在自定义头中传 `api_key`，却用了 `bearer_token`）。
* 对 `basic` 认证，请确认 `username` 和 `password` 字段正确。Atlassian API 要求使用 API token，而不是用户密码。

### 响应被截断

Aperture 将响应体限制在 50 MB 以内。上游返回更大的响应时，响应体会被静默截断。请使用 API 参数（分页、字段筛选）来减小响应体积。

### auth 配置因未知字段错误被拒

`auth` 块使用严格的字段校验。字段名拼错（例如把 `"secret"` 写成 `"secert"`）会导致配置解析失败，报 JSON 解码错误。请对照[步骤 2：配置认证][ar-step-2]或[连接器参考][docs-connectors-reference]中描述的认证类型，仔细核对字段名。

## 后续步骤

* 完整字段参考（包括所有认证类型与校验规则）参阅[连接器参考][docs-connectors-reference]。
* MCP 与 HTTP 两类连接器的总览（包括动态注册和从 `mcp.servers` 迁移）参阅[连接器功能指南][docs-aperture-connectors]。
* 使用授权控制对 Aperture 资源的访问，参阅[控制访问][docs-control-access]。

[ar-step-2]: #步骤-2配置认证

[ar-troubleshooting]: #故障排查

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-control-access]: /docs/aperture/control-access

[docs-get-started]: /docs/aperture/get-started

[docs-web-dashboard]: /docs/aperture/reference/dashboard-admin
