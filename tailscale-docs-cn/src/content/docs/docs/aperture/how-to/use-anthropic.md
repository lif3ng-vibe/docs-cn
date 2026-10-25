---
title: "设置 Anthropic"
description: "在 Aperture 中配置 Anthropic 提供商，让你的团队通过 tailnet 访问 Claude 模型。Anthropic 使用 `x-api-key` 授权类型和 `anthropic_messages` 兼容性开关，两者都与默认值不同。"
---

最后验证于 Sep 28, 2026

在 Aperture 中配置 Anthropic 提供商，让你的团队通过 tailnet 访问 Claude 模型。Anthropic 使用 `x-api-key` 授权类型和 `anthropic_messages` 兼容性开关，两者都与默认值不同。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一个 [Anthropic API key][xt-anthropic-api-keys]。

## 配置提供商

在 [Aperture 配置][docs-aperture-configuration]中把 Anthropic 添加为提供商：

```json
{
  "providers": {
    "anthropic": {
      "baseurl": "https://api.anthropic.com",
      "apikey": "<your-anthropic-key>",
      "authorization": "x-api-key",
      "models": ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-4-5-20251001"],
      "compatibility": {
        "anthropic_messages": true
      }
    }
  }
}
```

`authorization` 字段设为 `x-api-key`，因为 Anthropic 使用 `x-api-key` 头而不是 bearer token。`anthropic_messages` 开关让 Aperture 使用 Anthropic 消息格式，而不是默认的 OpenAI chat completions 格式。开关的完整列表参阅[兼容性开关参考][docs-provider-compatibility]。

默认情况下，Aperture 在每个发往 Anthropic 的请求中注入配置的 `apikey`。若要把每个客户端自己的凭证转发给 Anthropic，请在该提供商上设置 `auth_mode: "passthrough"`。此时由客户端提供自己的凭证，可以是个人 API key，也可以是订阅 OAuth 令牌（如 Claude Pro 或 Max 账户）。完整配置参阅[设置 passthrough 模式][docs-use-passthrough-mode]。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-anthropic-api-keys]: https://console.anthropic.com/settings/keys
