---
title: "使用连接器"
description: "使用内置连接器或管理员配置的连接器，让你的智能体调用工具、查询 API。要以管理员身份配置连接器并授予访问权限，参阅[连接器入门][docs-connectors-get-started]。"
---

最后验证于 Oct 1, 2026

使用内置连接器或管理员配置的连接器，让你的智能体调用工具、查询 API。要以管理员身份配置连接器并授予访问权限，参阅[连接器入门][docs-connectors-get-started]。

## 前提条件

管理员已配置该连接器，并授予你所需工具或代理路径的访问权限。内置连接器工具同样需要匹配的授权。

即使你是管理员，Aperture Chat 也会隐藏你的授权拒绝的已配置连接器。被拒连接器的详情 URL 与不存在的连接器一样显示未找到状态。如果预期的连接器或工具缺失，请管理员[检查你的连接器与工具授权][docs-grant-mcp-tool-access]。

## 查看连接器状态

打开 [Aperture Chat 门户][docs-aperture-chat-connectors]中的 **Connectors**。每个连接器所在的分区、状态徽章或操作按钮会告诉你下一步做什么。内置的 `aperture` 系统连接器排在列表最前。

下表描述每个分区和状态：

| 分区或状态 | 含义 | 操作 |
| --- | --- | --- |
| **Ready to use** 与 **Ready** | 你拥有访问权限和所需授权。**Ready** 不确认上游服务可达。 | 选择连接器查看其工具。 |
| **Connect to use** 配 **Connect** | 你有访问权限但尚未授权这个按用户连接器。Chat 不显示状态徽章。 | 选择 **Connect** 并完成授权同意。 |
| **Needs reconnect** 配 **Reconnect** | 你的授权需要更新。访问令牌过期且没有刷新令牌，或提供商拒绝了令牌刷新并要求重新授权。 | 选择 **Reconnect**。 |
| **Temporarily unavailable** | Aperture 无法读取你的凭证状态。 | 刷新页面，无需重新连接。 |

Chat 不显示 **No access** 状态，而是直接隐藏你的授权拒绝的连接器。

如果提供商不发放刷新令牌，新的授权会保持 **Ready**，直到其访问令牌过期。

## 授权按用户连接器

每个用户都必须单独授权按用户 OAuth 连接器，包括使用动态客户端注册的连接器。连接、重连和断开都通过 Aperture Chat 完成。

授权按用户连接器：

1. 打开 Aperture Chat 中的 **Connectors**。
2. 在 **Connect to use** 下选择 **Connect**。
3. 登录提供商并授予同意。
4. 在连接器详情页确认状态为 **Ready**。

Aperture 会尽量在把你带回详情页之前发现你的工具。如果上游服务缓慢或不可达，工具可能不会立即出现。

未完成的授权会在 15 分钟后过期。过期后请再次选择 **Connect**。

## 查看或刷新 MCP 工具

选择一个 **Ready** 的 MCP 连接器查看其 **Tools**。详情页会把工具按 **Interactive tools**、**Read-only tools** 和 **Write/Delete tools** 分组（如存在）。选择 **Refresh tools** 可向上游服务请求当前工具。刷新失败时，Chat 显示 **Couldn't refresh tools.**，状态保持 **Ready**。状态描述的是访问与授权，不代表上游健康。

## 发现并调用工具

获得连接器访问权限并完成所需授权后，你的智能体即可通过 Aperture 访问其能力。你只能列出和调用授权允许的工具。

请从 tailnet 内的设备发送这些请求。Aperture 通过 Tailscale 连接识别你的身份，因此不需要 API 令牌。

* **chat 或智能体客户端中的 MCP 工具**：授权后，Aperture 会用你的凭证发现工具。你的智能体可以调用授权允许的工具。工具缺失时，[刷新 MCP 工具][ar-review-or-refresh-mcp-tools]。

* **自定义 MCP 客户端中的 MCP 工具**：把你的 MCP 客户端指向 Aperture 的 `/v1/mcp` 端点。在下面的命令中，把 `APERTURE_HOST` 设为你的 Aperture 网关的 [MagicDNS 名称][docs-magicdns-access]，例如打开 Aperture Chat 时浏览器地址栏中的主机名。

  \[Missing snippet: aperture\_mcp\_list\_tools.mdx]

  Aperture 会在经验证或自定义连接器的每个工具名前加上连接器 ID 和下划线。例如 ID 为 `github` 的连接器提供的 `search` 工具会被暴露为 `github_search`。每个上游服务器定义自己的工具参数，调用工具时请使用 `tools/list` 返回的 `inputSchema`。

* **HTTP API**：向 `/v1/connectors/<id>/<path>` 发送请求。Aperture 自动注入连接器的凭证。要找出你能访问的 HTTP 连接器，调用内置的 `aperture_list_connectors` 工具。该工具只在存在至少一个 HTTP 连接器且你的授权允许 `aperture/tools/list_connectors` 时可用。

  例如，管理员配置了 ID 为 `github`、上游 URL 为 `https://api.github.com` 的 HTTP 连接器时，以下请求通过 `/user` 获取已认证的 GitHub 账户：

  ```shell
  curl -i http://<aperture-hostname>/v1/connectors/github/user
  ```

  凭证有效且你拥有 `github/proxy` 授权时，GitHub 返回 `200 OK` 和带 `login` 字段的账户 JSON。如果 Aperture 返回 `403 Forbidden`，参阅 [HTTP 连接器返回 403 Forbidden][docs-troubleshooting-http-403]。换用其他 API 时，把 `github` 换成其连接器 ID、把 `user` 换成 API 路径。

## 工具失效时重新连接

连接器显示 **Ready** 但工具调用失败时，先读懂错误再重连。提供商停机、网络超时和限流都可能在授权仍然有效的情况下造成失败。临时性故障稍后重试即可。工具列表缺失或过期时，[刷新 MCP 工具][ar-review-or-refresh-mcp-tools]。

提供商吊销或使你的刷新令牌过期时，连接器变为 **Needs reconnect**。更新授权：

1. 打开 Aperture Chat 中的 **Connectors**。
2. 选择该连接器。
3. 选择 **Reconnect**。
4. 完成提供商的同意流程。

访问令牌过期后问题反复出现时，请管理员检查提供商的离线访问设置。管理员更改了连接器的作用域或其他 OAuth 设置时，你现有的授权仍保留旧设置。要用新设置授权，请选择 **Disconnect**，然后选择 **Connect**。

**Disconnect** 会清除你为该连接器存储的授权和缓存的工具列表，不影响其他用户。要再次使用该连接器，选择 **Connect** 并完成同意。连接器是 **Ready** 时，不要仅因一次工具调用失败就断开。

## 相关内容

* [连接器入门][docs-connectors-get-started]，配置连接器并授予访问权限。
* [连接器的工作原理][docs-connectors-how-it-works]，理解连接器模型、认证和访问控制。
* [连接器参考][docs-connectors-reference]，连接器状态、认证类型和协议行为。
* [授予 MCP 工具访问权限][docs-grant-mcp-tool-access]，向用户授予连接器和工具的访问权限。

[ar-review-or-refresh-mcp-tools]: #查看或刷新-mcp-工具

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#连接器connectors

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-magicdns-access]: /docs/features/magicdns#通过-magicdns-访问设备

[docs-troubleshooting-http-403]: /docs/aperture/troubleshooting#http-连接器返回-403-forbidden
