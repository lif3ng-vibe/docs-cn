---
title: "设置 Vercel AI Gateway"
description: "在 Aperture 中配置 Vercel AI Gateway provider，让你的团队通过单一网关端点访问多家 LLM 提供商的模型。Aperture 预设会启用 OpenAI Chat Completions、Op"
---

最后验证于 Sep 29, 2026

在 Aperture 中配置 Vercel AI Gateway provider，让你的团队通过单一网关端点访问多家 LLM 提供商的模型。Aperture 预设会启用 OpenAI Chat Completions、OpenAI Responses 和 Anthropic Messages。请选择支持你打算使用的 API 的模型和客户端后端。

\[缺失片段：aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一个可从你的设备访问的 Aperture 网关。如果尚未设置，请参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一个 [Vercel API token][xt-vercel-tokens]。

## 配置 provider

在你的 [Aperture 配置][docs-aperture-configuration]中，将 Vercel AI Gateway 添加为 provider：

```json
{
  "providers": {
    "vercel": {
      "baseurl": "https://ai-gateway.vercel.sh",
      "apikey": "<your-vercel-token>",
      "models": [
        "anthropic/claude-sonnet-4.6",
        "openai/gpt-5.4-nano"
      ],
      "cost_basis": "vercel",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true,
        "anthropic_messages": true
      }
    }
  }
}
```

> **警告：**
>
> 将 `baseurl` 设置为 `https://ai-gateway.vercel.sh`，不要带 `/v1`。加上 `/v1` 会生成错误的 URL `https://ai-gateway.vercel.sh/v1/v1/chat/completions`。详情请参阅 [Aperture 如何构建上游 URL][docs-aperture-url-construction]。

模型名称使用 `provider/model` 前缀格式。

这些配置字段的作用如下：

* **`cost_basis`**：选择用于 token 成本估算的定价来源。启用 `auto_cost_basis` 后，对于官方 `https://ai-gateway.vercel.sh` 主机，Aperture 会使用 `vercel`。示例中显式设置了它，效果相同。使用自定义网关主机时请显式设置。网关直接上报的成本无需此字段。
* **`openai_chat`**：启用大多数 OpenAI 兼容工具所使用的 chat completions API。
* **`openai_responses`**：启用 OpenAI Codex 等工具使用的 Responses API。
* **`anthropic_messages`**：启用 Anthropic Messages API。所选模型必须支持该 API。

完整的标志列表请参阅[兼容性标志参考][docs-provider-compatibility]。

## 验证 provider

\[缺失片段：aperture\_verify\_provider.mdx]

\[缺失片段：aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-url-construction]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[xt-vercel-tokens]: https://vercel.com/account/tokens
