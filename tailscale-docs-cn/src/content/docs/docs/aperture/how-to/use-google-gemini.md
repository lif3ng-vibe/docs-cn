---
title: "设置 Google Gemini"
description: "在 Aperture 中配置 Google Gemini 提供商，让你的团队通过 tailnet 访问 Gemini 模型。本主题介绍使用 API key 认证的直连 Gemini API。Gemini Enterprise Agent Platform 则使用服务账户认证，且 Gemini 与 Anthropic 模型的端点格式不同。"
---

最后验证于 Sep 28, 2026

在 Aperture 中配置 Google Gemini 提供商，让你的团队通过 tailnet 访问 Gemini 模型。本主题介绍使用 API key 认证的直连 Gemini API。Gemini Enterprise Agent Platform 则使用服务账户认证，并且对 Gemini 与 Anthropic 模型使用不同的端点格式。

> **注意：**
>
> 使用服务账户认证的 Gemini Enterprise Agent Platform（同时支持 Anthropic 模型）参阅[设置 Gemini Enterprise Agent Platform 提供商][docs-use-geap]。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一个 [Google AI Studio API key][xt-google-ai-studio]。

## 配置提供商

在 [Aperture 配置][docs-aperture-configuration]中把 Google Gemini 添加为提供商：

```json
{
  "providers": {
    "gemini": {
      "baseurl": "https://generativelanguage.googleapis.com",
      "apikey": "<your-gemini-key>",
      "authorization": "x-goog-api-key",
      "models": ["gemini-3.8-flash", "gemini-2.5-pro"],
      "name": "Google Gemini",
      "compatibility": {
        "gemini_generate_content": true
      }
    }
  }
}
```

`authorization` 字段控制 Aperture 如何发送 API key。`x-goog-api-key` 值把 key 放在 `x-goog-api-key` 头中发送，直连 Gemini API 要求这样做。`gemini_generate_content` 开关让 Aperture 使用 Gemini API 格式，而不是默认的 OpenAI chat completions 格式。

可用模型 ID 与别名参阅 [Google AI 文档][xt-google-models]。开关的完整列表参阅[兼容性开关参考][docs-provider-compatibility]。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-use-geap]: /docs/aperture/how-to/use-gemini-enterprise-agent-platform

[xt-google-ai-studio]: https://aistudio.google.com/apikey

[xt-google-models]: https://ai.google.dev/gemini-api/docs/models
