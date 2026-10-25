---
title: "设置 OpenRouter"
description: "在 Aperture 中配置 OpenRouter 提供商，让你的团队通过单一 API 访问多个 LLM 提供商的模型。OpenRouter 聚合了 Google、Meta 等提供商的模型，包括开源模型。"
---

最后验证于 Sep 28, 2026

在 Aperture 中配置 OpenRouter 提供商，让你的团队通过单一 API 访问多个 LLM 提供商的模型。OpenRouter 聚合了 Google、Meta 等提供商的模型，包括开源模型。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一个 [OpenRouter API key][xt-openrouter-keys]。

## 配置提供商

在 [Aperture 配置][docs-aperture-configuration]中把 OpenRouter 添加为提供商：

```json
{
  "providers": {
    "openrouter": {
      "baseurl": "https://openrouter.ai/api/",
      "apikey": "<your-openrouter-key>",
      "models": [
        "qwen/qwen3.8-flash",
        "google/gemini-3.8-flash",
        "x-ai/grok-4.7"
      ],
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true,
        "anthropic_messages": true
      }
    }
  }
}
```

OpenRouter 使用 `bearer` 授权。上面的配置启用了 OpenAI Chat Completions、OpenAI Responses 和 Anthropic Messages，与 Aperture 的 OpenRouter 预设一致。请选择支持你打算使用的 API 的客户端后端和 OpenRouter 模型。启用某个开关并不意味着每个模型都能通过每种 API 使用。

OpenRouter 上的模型名称使用 `provider/model` 前缀格式。可用的模型名称可在 [OpenRouter 模型目录][xt-openrouter-models]中浏览查找。开关的完整列表参阅[兼容性开关参考][docs-provider-compatibility]。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[xt-openrouter-keys]: https://openrouter.ai/settings/keys

[xt-openrouter-models]: https://openrouter.ai/models
