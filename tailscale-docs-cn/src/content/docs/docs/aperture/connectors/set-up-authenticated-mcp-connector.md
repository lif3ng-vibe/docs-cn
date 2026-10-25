---
title: "设置带认证的 MCP 连接器"
description: "把 Aperture 连接到使用共享的机器对机器凭证认证的远程 MCP 服务器。Aperture 只存一次凭证，并在每个已授权的请求中使用它。未认证的服务器参阅[连接器入门][docs-connectors-get-started]。"
---

最后验证于 Sep 28, 2026

把 Aperture 连接到使用共享的机器对机器凭证认证的远程 MCP 服务器。Aperture 只存一次凭证，并在每个已授权的请求中使用它。未认证的服务器参阅[连接器入门][docs-connectors-get-started]。需要按用户单独授权时，参阅[设置按用户 OAuth 2.0 连接器][docs-set-up-per-user-oauth2-connector]。

## 前提条件

开始之前，你需要：

* Aperture 配置的管理员访问权限。参阅[连接器入门][docs-connectors-get-started]。
* MCP 服务器的 URL，且可从 Aperture 网关访问。
* 该服务器的凭证：静态令牌，或 OAuth 2.0 client credentials（客户端 ID、客户端密钥和 token URL）。

## 选择认证类型

共享 MCP 凭证支持两种认证类型：

* **`bearer_token`**：静态令牌，Aperture 以 `Authorization: Bearer` 头发送。服务器发放长期令牌时使用。
* **`oauth2_client_credentials`**：机器对机器的 OAuth 2.0 流程。Aperture 从 token URL 获取并自动刷新访问令牌。服务器通过 client credentials 授权发放短期令牌时使用。

两种类型都会把凭证共享给所有拥有匹配授权的用户。需要按用户隔离的凭证时，使用[按用户 OAuth 2.0 流程][docs-set-up-per-user-oauth2-connector]。

## 添加 bearer token 连接器

在 `connectors.servers` 中添加一个条目，`protocol` 设为 `"mcp"`，`auth` 块类型为 `bearer_token`。条目的键是连接器 ID，必须以字母开头且只能包含字母和数字（不含下划线或连字符），因为 Aperture 用它给工具名加前缀：

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

## 添加 OAuth 2.0 client credentials 连接器

机器对机器的 OAuth 2.0 流程使用类型为 `oauth2_client_credentials` 的 `auth` 块。Aperture 会自动刷新访问令牌：

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

`scopes` 是可选的。提供商对 client credentials 授权不要求作用域时可以省略。

使用 client credentials 授权时，Aperture 按需铸造访问令牌：需要新令牌时重新执行该授权，而不是存储刷新令牌。

把 `token_url` 设为提供商规范的令牌端点。为保护客户端密钥，Aperture 拒绝重定向。凭证被拒或 token URL 不正确时，工具列表会变空，但连接器状态不变。

> **警告：**
>
> 共享 MCP 连接器上的凭证会用于所有拥有匹配授权的用户，没有按用户隔离。请把凭证范围收窄到服务器允许的最小程度。

`auth` 块会拒绝未知字段。字段名拼错（例如把 `secret` 写成 `secert`）会在加载时校验失败。各认证类型的必填字段参阅[连接器参考][docs-connectors-reference]。

## 授予访问权限

MCP 连接器默认拒绝。添加一条 `connectors` 授权，用户才能列出和调用服务器的工具。参阅[授予 MCP 工具访问权限][docs-grant-mcp-tool-access]。

## 验证连接

1. 打开 [Chat][docs-aperture-chat-connectors] 中的 **Connectors** 并选择该连接器。其状态反映你的访问与授权，不代表上游健康。
2. MCP 连接器为 **Ready** 时，选择 **Refresh tools** 联系上游并请求其当前工具。
3. 确认 **Tools** 中列出了预期的工具。凭证被拒、token URL 不正确或服务器不可达都会表现为刷新错误，而不是改变状态。

预期工具出现后，从客户端列出它们。请在你 tailnet 内的设备上运行请求。Aperture 从 tailnet 连接识别调用者，不需要单独的授权头。

\[Missing snippet: aperture\_mcp\_list\_tools.mdx]

响应包含一个 `tools` 数组，条目带有连接器 ID 前缀（例如 `snowflake_query`）。

## 相关内容

* [连接器的工作原理][docs-connectors-how-it-works] —— 理解连接器模型、认证和能力发现。
* [连接器参考][docs-connectors-reference] —— 认证类型、MCP 协议行为和校验规则。

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-set-up-per-user-oauth2-connector]: /docs/aperture/how-to/set-up-per-user-oauth2-connector

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors
