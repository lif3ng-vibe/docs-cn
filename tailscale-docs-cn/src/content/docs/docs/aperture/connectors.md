---
title: "连接器"
description: "查找 Aperture 连接器相关文档，包括设置指南、概念说明和配置参考。"
---

最后验证于 Sep 28, 2026

连接器让 Aperture 能通过单一且带认证的网关访问外部 [MCP][xt-mcp-spec] 服务器和 HTTP API。Aperture 负责凭证、请求代理和访问控制，智能体无需单独建立服务连接。连接器与[提供商][docs-aperture-set-up-providers]互为补充：提供商路由模型请求，连接器路由工具调用和 API 请求。

你连接的 MCP 服务器和 HTTP API 是第三方服务。当 Aperture 把请求和凭证转发给它们时，其对数据的处理遵循你与各个服务之间的协议，而不是你与 Tailscale 之间的协议。

## 设置连接器

[**连接器入门**](/docs/aperture/connectors/get-started) —— 在 Aperture 中添加连接器、授予访问权限并验证连接。

[**添加经验证的连接器**](/docs/aperture/connectors/add-verified-connector) —— 从 Aperture 连接器选择器配置 Salesforce 或 Slack 等经验证的连接器，并在需要时提供 OAuth 客户端凭证。

[**设置带认证的 MCP 连接器**](/docs/aperture/connectors/set-up-authenticated-mcp-connector) —— 使用共享 bearer token 或 OAuth 2.0 client credentials，把 Aperture 连接到需要认证的 MCP 服务器。

[**设置 HTTP API 连接器**](/docs/aperture/how-to/set-up-http-api-connector) —— 配置 Aperture 代理访问上游 REST API 的请求，并自动注入凭证。

[**设置按用户 OAuth 2.0 连接器**](/docs/aperture/how-to/set-up-per-user-oauth2-connector) —— 使用 OAuth 2.0 授权码流程，把 Aperture 连接到需要每个用户单独授权的外部服务。

[**授予 MCP 工具访问权限**](/docs/aperture/how-to/grant-mcp-tool-access) —— 配置 Aperture 授权，控制用户可以访问哪些连接器能力，包括 MCP 工具、资源、模板和 HTTP 代理访问。

[**按标签授予连接器访问权限**](/docs/aperture/how-to/grant-connector-access-by-label) —— 为 Aperture 连接器打标签并按标签授权，让一条授权覆盖一组连接器，而不必逐一列出连接器 ID。

[**内置连接器**](/docs/aperture/connectors/built-in-connectors) —— 设置内置的 Aperture 连接器，用于预配 tailnet 节点并通过 Tailscale SSH 运行 shell 命令。

## 使用连接器

[**使用连接器**](/docs/aperture/connectors/use-a-connector) —— 授权连接器、发现并调用其工具，以及在访问过期后重新连接。

## 理解连接器

[**连接器的工作原理**](/docs/aperture/connectors/how-connectors-work) —— 了解内置、经验证和自定义 Aperture 连接器，它们与提供商的关系，以及认证和访问控制如何生效。

[**连接器的种类**](/docs/aperture/connectors/kinds-of-connector) —— Aperture 有五种工具集成。它们的区别在于谁来运行工具、谁能访问工具，这决定了它们的配置、授权和失败行为。

## 参考

[**Aperture 连接器参考**](/docs/aperture/connectors/reference) —— Aperture 连接器完整参考，包括字段定义、认证类型、MCP 与 HTTP 协议行为、授权、通过旧版 MCP 段的动态注册，以及从已弃用的 MCP servers 语法的迁移。

[docs-aperture-set-up-providers]: /docs/aperture/set-up-providers

[xt-mcp-spec]: https://modelcontextprotocol.io/specification
