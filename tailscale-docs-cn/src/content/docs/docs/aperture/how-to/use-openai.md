---
title: "设置 OpenAI"
description: "在 Aperture 中配置 OpenAI 提供商，让你的团队通过 tailnet 访问 GPT 模型。OpenAI 是 Aperture 中的默认提供商类型。未指定 compatibility 块时，Aperture 会自动启用 `openai_chat`，但除非你显式设置，否则不会启用 `openai_responses`。"
---

最后验证于 Sep 28, 2026

在 Aperture 中配置 OpenAI 提供商，让你的团队通过 tailnet 访问 GPT 模型。OpenAI 是 Aperture 中的默认提供商类型。未指定 compatibility 块时，Aperture 会自动启用 `openai_chat`，但除非你显式设置，否则不会启用 `openai_responses`。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一个 [OpenAI API key][xt-openai-api-keys]。

## 配置提供商

在 [Aperture 配置][docs-aperture-configuration]中把 OpenAI 添加为提供商：

```json
{
  "providers": {
    "openai": {
      "baseurl": "https://api.openai.com",
      "apikey": "<your-openai-key>",
      "models": ["gpt-5.5", "gpt-5.4-mini", "gpt-5.3-codex"],
      "name": "OpenAI",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      }
    }
  }
}
```

`openai_responses` 开关启用 Responses API，OpenAI Codex 等工具会用到它。包含 `compatibility` 块时，请显式设置两个开关。没有 compatibility 块时，Aperture 默认只启用 `openai_chat`。开关的完整列表参阅[兼容性开关参考][docs-provider-compatibility]。

默认情况下，Aperture 在每个发往 OpenAI 的请求中注入配置的 `apikey`。若要把每个客户端自己的凭证转发给 OpenAI，请在该提供商上设置 `auth_mode: "passthrough"`。此时由客户端提供自己的 API key，Aperture 会原样转发给 OpenAI。完整配置参阅[设置 passthrough 模式][docs-use-passthrough-mode]。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#兼容性标志

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-openai-api-keys]: https://platform.openai.com/api-keys
