---
title: "在 Aperture 中使用 OpenAI 兼容工具"
description: "配置 OpenAI 兼容的 LLM 客户端，让请求经由 [Aperture by Tailscale][docs-aperture] 发送。本指南介绍带有可配置 API base URL 和 OpenAI 兼容 API 后端的客户端的通用设置。"
---

最后验证于 Sep 29, 2026

配置 OpenAI 兼容的 LLM 客户端，让请求经由 [Aperture by Tailscale][docs-aperture] 发送。本指南介绍带有可配置 API base URL 和 OpenAI 兼容 API 后端的客户端的通用设置。Roo Code、Cline 和自定义应用属于这条路径的示例，不是经过逐一验证的集成。

特定客户端的说明参阅 [Claude Code][docs-use-claude-code]、[Codex][docs-use-codex] 和 [OpenCode][docs-use-opencode] 指南。

> **注意：**
>
> Gemini CLI 使用原生 Google Gemini API，而不是本指南中的 OpenAI 兼容设置。其 Google 后端与网关 URL 要求参阅 [Gemini CLI 设置][docs-aperture-cli]。

## 前提条件

开始之前，你需要：

* 一台 Aperture 网关，配有支持你的客户端 API 格式和模型的提供商。OpenAI Chat Completions 与 Responses 是两种不同的格式。设置说明参阅[开始使用 Aperture][docs-get-started]。
* 使用该模型的权限。
* 你的设备可以访问的 Aperture 网关 URL。使用 `http://`，不要用 `https://`。

\[Missing snippet: aperture\_tls\_warning.mdx]

\[Missing snippet: aperture\_any\_provider.mdx]

## 配置客户端

在你的 LLM 客户端设置中，把 API base URL 设为你的 Aperture 网关，并按提供商的认证模式配置凭证：

* **API Base URL**：`http://<aperture-hostname>/v1`
* **API Key**：共享密钥型提供商留空或填占位值。passthrough 模式下，提供提供商凭证，或留空以使用已配置的回退密钥。所需凭证参阅 [passthrough 设置][docs-passthrough]。

确切的设置名称因客户端而异。寻找标记为 "API Base URL"、"Base URL"、"API Endpoint" 或类似名称的字段。

## 自定义应用

你可以使用任何能发送[受支持提供商 API 格式][docs-provider-compatibility]的 HTTP 客户端。下面的 Chat Completions 示例使用共享密钥型提供商。对于没有回退密钥的 passthrough 提供商，请加上其 [passthrough 设置][docs-passthrough]要求的认证头。

```shell
curl -s http://<aperture-hostname>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Aperture 依据模型名称、API 格式、提供商配置和用户权限来路由请求。

## 验证连接

1. 用你配置好的工具发送一个测试请求。
2. 在你的 Aperture 网关上打开 Chat，在侧边栏选择 **Sessions**。确认测试请求已出现。如果你的账户没有门户访问权，请让管理员检查 **Security** > **Logs**。

如果请求没有出现，参阅 [Aperture 故障排查指南][docs-aperture-troubleshooting]。

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[docs-aperture-cli]: /docs/aperture/cli#gemini-cli

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-passthrough]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-claude-code]: /docs/aperture/how-to/use-claude-code

[docs-use-codex]: /docs/aperture/how-to/use-codex

[docs-use-opencode]: /docs/aperture/how-to/use-opencode
