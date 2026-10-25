---
title: "设置 OpenAI 兼容提供商"
description: "在 Aperture 中使用 `/v1/chat/completions` API 配置 OpenAI 兼容提供商。Groq、Together AI、Fireworks、Mistral、DeepSeek、Perplexity 等提供商都提供 OpenAI 兼容 API。"
---

最后验证于 Sep 29, 2026

在 Aperture 中使用 `/v1/chat/completions` API 配置 OpenAI 兼容提供商。Groq、Together AI、Fireworks、Mistral、DeepSeek、Perplexity 等提供商都提供 OpenAI 兼容 API。它们只是这条通用配置路径的示例，不是经过逐一验证的集成。

\[Missing snippet: aperture\_any\_provider.mdx]

Tailscale 不测试也不保证与每个 OpenAI 兼容提供商的兼容性。配置之前请核实你的提供商的 API 要求。llama.cpp、vLLM、Ollama 这类服务器参阅[设置自托管提供商][docs-use-self-hosted]。

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 来自提供商开发者控制台或仪表板的 API key。
* 提供商的 API base URL，包括所需的路径前缀。

## 配置提供商

在你的 [Aperture 配置][docs-aperture-configuration]中添加你的提供商：

```json
{
  "providers": {
    "<provider-name>": {
      "baseurl": "https://api.example.com",
      "apikey": "<your-provider-key>",
      "models": ["<model-id-1>", "<model-id-2>"]
    }
  }
}
```

替换示例值：

* `<provider-name>`：短标识符，例如 `groq` 或 `together`。
* `<your-provider-key>`：你的提供商的 API key。
* `baseurl`：在传入的 `/v1/...` 路径之前的提供商 URL 前缀。
* `models`：你的提供商支持的模型 ID。可在提供商的文档或其 `/v1/models` 端点中查找。

默认配置使用 `openai_chat` 兼容性和 `bearer` 授权。如果你的提供商要求不同的 API 或授权格式，请更改这些设置。

> **警告：**
>
> 如果提供商的 API base URL 以 `/v1` 结尾，只去掉这个后缀，保留更早的路径段。例如，API base URL 为 `https://api.example.com/openai/v1` 时，`baseurl` 填 `https://api.example.com/openai`。Aperture 会把完整的传入路径（如 `/v1/chat/completions`）拼接到 `baseurl` 后面。保留末尾的 `/v1` 会导致路径重复。详情参阅 [Aperture 如何构造上游 URL][docs-aperture-url-construction]。

### 同时支持 Responses API 的提供商

如果你的提供商除 chat completions 外还支持 OpenAI Responses API（`/v1/responses`），请显式启用两个兼容性开关：

```json
{
  "providers": {
    "custom": {
      "baseurl": "https://api.example.com",
      "apikey": "<your-provider-key>",
      "models": ["model-name"],
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      }
    }
  }
}
```

如果你启用了其他开关而省略 `openai_chat`，Aperture 会禁用 Chat Completions。设 `"openai_chat": true` 可在启用 Responses 的同时保留它，或设 `"openai_chat": false` 显式禁用。

### 非标准授权

大多数 OpenAI 兼容提供商使用 `bearer` 授权，这也是默认值。如果你的提供商要求不同的授权头，请设置 `authorization` 字段。支持的授权类型参阅[授权类型参考][docs-provider-compatibility]。

### 成本估算

Aperture 先根据提供商 `baseurl` 的主机名推断[定价来源][docs-provider-compatibility-cost-basis]，然后回退到兼容性开关。在默认的 Chat Completions 兼容性下，无法识别的主机使用 `openai` 定价。要使用其他定价来源，请显式设置 `cost_basis`。

如果你的提供商的模型名称不在该定价来源中，请用 `model_cost_map` 把它们映射到已知模型，以便估算成本：

```json
{
  "providers": {
    "<provider-name>": {
      "baseurl": "https://api.example.com",
      "apikey": "<your-provider-key>",
      "models": ["<model-id>"],
      "model_cost_map": [
        {"match": "<model-id>", "as": "<known-model-id>"}
      ]
    }
  }
}
```

完整语法参阅[模型成本映射][docs-provider-compatibility-model-cost-map]参考。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-url-construction]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#认证类型

[docs-provider-compatibility-cost-basis]: /docs/aperture/provider-compatibility#成本基准

[docs-provider-compatibility-model-cost-map]: /docs/aperture/provider-compatibility#模型成本映射

[docs-use-self-hosted]: /docs/aperture/how-to/use-self-hosted
