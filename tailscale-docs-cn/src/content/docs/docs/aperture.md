---
title: "Aperture"
description: "使用 Tailscale 的 Aperture 监控并保护 LLM 的使用。"
---

最后验证于 Sep 28, 2026

[开始使用 Aperture](https://aperture.tailscale.com/)

\[缺失片段：aperture\_terms.mdx]

Tailscale 的 Aperture 是一个集中式 AI 网关，用于保护、监控并路由整个组织的 LLM 请求。Aperture 利用 [Tailscale 身份层][docs-tailscale-identity] 自动完成用户身份验证，从而无需分发共享的提供商 API 密钥。你可以配置兼容的客户端，让请求经由你的 Aperture 网关路由到 OpenAI、Anthropic、Google 等上游 LLM 提供商。

Aperture 有两个 Web 界面。你可以使用 [Chat][docs-chat] 与模型对话、连接你的工具，并查看自己的使用情况。管理员则使用 [管理控制面板][docs-admin-dashboard] 来配置网关并审查整个组织的活动。

## 了解 Aperture

浏览以下主题，了解 Aperture 的功能，以及它如何验证用户身份、路由请求和采集遥测数据。

[**Aperture 是什么**？](/docs/aperture/what-is-aperture) —— Tailscale 的 Aperture 是一个 AI 智能体，可与你的 tailnet 中的机器协同工作，其背后是一个通过你的 Tailscale 身份路由 LLM 请求的网关。

[**Aperture 的工作原理**](/docs/aperture/how-aperture-works) —— 了解 Aperture 如何利用 Tailscale 身份、基于模型的路由以及遥测数据来保护并监控 LLM 请求。

## 设置 Aperture

注册账号、配置你的 LLM 提供商、连接外部工具与 API，并设置你的第一批客户端。

[**Aperture 入门**](/docs/aperture/get-started) —— 注册 Aperture、配置一个提供商，并发送你的第一个请求。

[**Aperture CLI**](/docs/aperture/cli) —— 使用 Aperture CLI 来发现、配置并运行通过你的 Aperture 网关连接的编码智能体。

[**连接 tailnet 外的设备**](/docs/aperture/connect-outside-tailnet) —— 使用 Aperture CLI bridge 或 ts-unplug，将不在你 tailnet 中的设备连接到你的 Aperture 网关。

[**设置 LLM 提供商**](/docs/aperture/set-up-providers) —— 配置上游 LLM 提供商，让 Aperture 能够路由请求并代表你的用户注入身份验证。

[**设置 LLM 客户端**](/docs/aperture/use-your-tools) —— 配置 LLM 客户端，让请求经由 Aperture 路由。

[**设置聊天界面**](/docs/aperture/how-to/set-up-chat-ui) —— 配置模型、整理模型选择器，并管理对 Aperture Chat 界面的访问。

[**Chat**](/docs/aperture/chat) —— 在一个 Web 界面中与模型对话、使用已连接的工具，并查看你自己的 Aperture 使用情况。

[**MCP 服务器代理**](/docs/aperture/mcp-server) —— 通过 Aperture 聚合远程 MCP 服务器的工具与资源，并提供基于身份的访问控制。

[**连接器**](/docs/aperture/connectors) —— 查找 Aperture 连接器的文档，包括设置指南、概念说明和配置参考。

## 管理访问与支出

控制哪些用户和模型可用、设置支出上限，并配置 Aperture 的行为。

[**Aperture 配置参考**](/docs/aperture/configuration) —— Aperture 配置字段、默认值和校验错误的参考文档。

[**Aperture 管理控制面板**](/docs/aperture/admin-dashboard) —— 使用 Aperture 管理控制面板监控整个组织的活动、管理访问与支出，并配置你的 Aperture 网关。

[**控制 AI 访问**](/docs/aperture/control-access) —— 管理谁可以访问 Aperture，以及他们可以使用哪些模型。

[**管理 AI 支出**](/docs/aperture/manage-spending) —— 在 Aperture 中设置预算、购买 token、控制每用户的支出上限，并监控配额余额。

## 观测、治理与集成

监控整个组织的 LLM 使用情况、控制 Aperture 如何存储和保留这些数据，并将 Aperture 与外部服务连接起来。

[**观测并导出 AI 使用数据**](/docs/aperture/observe-and-export) —— 在 Chat 中查看你自己的 Aperture 使用情况，或使用管理控制面板检查并导出整个组织的活动。

[**隐私与数据保留**](/docs/aperture/privacy-and-data-retention) —— 控制 Aperture 保留所捕获数据的时长、导出到的位置，以及请求内容离开 Aperture 的位置。

[**与外部工具集成**](/docs/aperture/integrate) —— 将 Aperture 与授权引擎、日志聚合器和外部服务连接起来。

## 参考与故障排除

受支持的提供商与客户端、配置参考、CLI 文档，以及常见问题的解决办法。

[**Aperture 参考**](/docs/aperture/reference) —— Aperture 接口、配置、提供商兼容性、CLI 和集成方案的参考文档。

[**受支持的提供商与客户端**](/docs/aperture/reference/supported-providers-clients) —— 比较 Aperture 的提供商与客户端兼容性、API 格式、要求和设置选项。

[**Aperture 操作指南**](/docs/aperture/how-to) —— 配置 Aperture 提供商、访问控制、支出上限、可观测性和集成的分步指南。

[**Aperture 故障排除**](/docs/aperture/troubleshooting) —— Tailscale Aperture 的常见错误情形、成因和解决步骤。

[docs-chat]: /docs/aperture/chat

[docs-admin-dashboard]: /docs/aperture/admin-dashboard

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
