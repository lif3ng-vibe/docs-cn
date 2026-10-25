---
title: "控制 AI 访问"
description: "管理谁可以访问 Aperture，以及他们可以使用哪些模型。"
---

最后验证于 Jul 30, 2026

Aperture 使用 [Tailscale 的身份层][docs-tailscale-identity]自动认证用户。先通过 tailnet 访问控制规则控制哪些用户能到达 Aperture 网关，再用 [Aperture 授权][docs-aperture-grants]定义每个用户或组可以访问哪些模型。要在授权中引用 Tailscale 组，请启用[可见组][docs-visible-groups]。Aperture 默认拒绝：没有授权时，用户可以连接但无法访问任何模型。

授权还管辖对 MCP 工具、资源和连接器的访问。Aperture 采用三层授权模型——配置定义有哪些可用，授权控制谁能访问，凭证负责上游认证——对模型和连接器统一适用。授予 MCP 和连接器访问权限的细节，参阅[授予 MCP 工具访问权限][docs-grant-mcp-tool-access]和[连接器][docs-aperture-connectors]。

连接器授权可以按 ID 点名连接器，也可以按标签匹配一组连接器。默认拒绝同样延伸到 Aperture 自身的内置工具——它们通过默认配置中的一条 `label:system` 授权到达用户，而不是代码里的例外。要同样地为你自己的连接器分组，参阅[按标签授予连接器访问权限][docs-grant-by-label]。

身份机制背景参阅 [Aperture 的工作方式][docs-how-aperture-works]。理解授权模型本身（包括默认拒绝访问和优先级），参阅 [Aperture 授权的工作方式][docs-how-grants-work]。

[**Aperture 授权的工作方式**](/docs/aperture/how-grants-work) —— 理解 Aperture 授权模型，包括默认拒绝访问、叠加式只允许规则、能力匹配，以及多条授权同时适用时 Aperture 如何决定优先级。

[**授予模型访问权限**](/docs/aperture/how-to/grant-model-access) —— 配置 Aperture 授权，控制每个用户或组可以访问哪些模型。

[**授予 MCP 工具访问权限**](/docs/aperture/how-to/grant-mcp-tool-access) —— 配置 Aperture 授权，控制用户可以访问哪些连接器能力，包括 MCP 工具、资源、模板和 HTTP 代理访问。

[**按标签授予连接器访问权限**](/docs/aperture/how-to/grant-connector-access-by-label) —— 为 Aperture 连接器打标签并按标签授权，让一条授权覆盖一组连接器，而不必逐一列出连接器 ID。

[**MCP 服务器代理**](/docs/aperture/mcp-server) —— 通过 Aperture 聚合远程 MCP 服务器的工具和资源，并使用基于身份的访问控制。

[**设置管理员访问权限**](/docs/aperture/how-to/set-up-admin-access) —— 配置管理员角色，用于管理 Aperture 设置和访问所有用户数据。

[**Aperture 的可见组**](/docs/aperture/visible-groups) —— 使用 Tailscale 组和 SCIM 组控制对 Aperture 模型和管理员角色的访问。

使用防护栏（guardrail）对单个请求强制执行策略，例如清理 PII 或阻止违反策略的请求。

[**防护栏**](/docs/aperture/guardrails) —— 在 LLM 请求到达提供商之前检查、修改或阻止它。

[**设置防护栏**](/docs/aperture/how-to/set-up-guardrails) —— 配置 pre_request hook，在 LLM 请求到达提供商之前检查、修改或阻止它。

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-grant-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-visible-groups]: /docs/aperture/visible-groups
