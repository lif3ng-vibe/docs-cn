---
title: "在 Aperture 中使用 Codex"
description: "配置 [Codex][xt-codex]，让请求经由 [Aperture by Tailscale][docs-aperture] 发送，为你的组织带来集中的 API key 管理、用量跟踪和会话日志。"
---

最后验证于 Sep 28, 2026

配置 [Codex][xt-codex]，让请求经由 [Aperture by Tailscale][docs-aperture] 发送，为你的组织带来集中的 API key 管理、用量跟踪和会话日志。

> **注意：**
>
> [Aperture CLI][docs-aperture-cli] 可以自动为你建立这一连接。它会写入 Codex 配置并启动 Codex，因此你可以跳过下面的手动步骤。

## 前提条件

开始之前，你需要：

* 一台 Aperture 网关，至少配置了一个 OpenAI 兼容提供商，并且你的设备可以访问。尚未设置时参阅[开始使用 Aperture][docs-get-started]。
* 你的设备可以访问的 Aperture 网关 URL。使用 `http://`，不要用 `https://`。
* 设备上已安装 [Codex][xt-codex]。

\[Missing snippet: aperture\_tls\_warning.mdx]

\[Missing snippet: aperture\_any\_provider.mdx]

## 配置 Codex

要配置 Codex 使用 Aperture，请创建或编辑 Codex 配置文件（`~/.codex/config.toml`），把 `base_url` 设为 Aperture URL，并把模型设为 Codex 兼容的模型：

```toml
model = "gpt-5.3-codex"
model_provider = "llm-ai-ts-net"
model_reasoning_effort = "high"

[model_providers.llm-ai-ts-net]
name = "Tailscale AI Gateway"
base_url = "http://<aperture-hostname>/v1" # Required: Aperture URL

# Required for Codex models
wire_api = "responses"
```

`wire_api = "responses"` 设置让 Codex 使用 OpenAI Responses API 格式。你无需配置 API key，因为 Aperture 会自动注入凭证。

> **注意：**
>
> 要转发每个客户端自己的凭证而不是注入共享密钥，请把上游提供商设为 passthrough 模式。此时 Aperture 会转发客户端发来的凭证。个人 OpenAI 平台 API key 走 `api.openai.com` 端点，而 Plus、Pro、Team 等 ChatGPT 订阅账户走 ChatGPT 后端端点，配置也不同。更多信息参阅[设置 passthrough 模式][docs-use-passthrough-mode]和[把 ChatGPT 订阅经由 Aperture 路由][docs-codex-subscriptions]。

## 验证连接

1. 在 Codex 中发送一条测试消息。
2. 在你的 Aperture 网关上打开 Chat，在侧边栏选择 **Sessions**。确认测试请求已出现。如果你的账户没有门户访问权，请让管理员检查 **Security** > **Logs**。

如果请求没有出现，参阅 [Aperture 故障排查指南][docs-aperture-troubleshooting]。

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[docs-aperture-cli]: /docs/aperture/cli

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-codex-subscriptions]: /docs/aperture/how-to/use-passthrough-mode/codex-subscriptions

[docs-get-started]: /docs/aperture/get-started

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-codex]: https://github.com/openai/codex
