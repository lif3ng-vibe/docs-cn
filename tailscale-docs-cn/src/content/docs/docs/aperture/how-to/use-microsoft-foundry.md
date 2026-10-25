---
title: "设置 Microsoft Foundry"
description: "在 Aperture 中配置 Microsoft Foundry，让你的团队通过 tailnet 访问部署在 Foundry 中的 OpenAI GPT 与 Anthropic Claude 模型。Foundry 通过 OpenAI 兼容的 `/openai` 端点服务 OpenAI 模型，通过 Anthropic 兼容的 `/anthropic` 端点服务 Anthropic 模型。由于两个端点使用不同的 API 格式，你需要在 Aperture 中把它们分别配置为独立的提供商。模型名称必须与你的 Foundry 部署名称一致。"
---

最后验证于 Sep 30, 2026

在 Aperture 中配置 Microsoft Foundry，让你的团队通过 tailnet 访问部署在 Foundry 中的 OpenAI GPT 与 Anthropic Claude 模型。Foundry 通过 OpenAI 兼容的 `/openai` 端点服务 OpenAI 模型，通过 Anthropic 兼容的 `/anthropic` 端点服务 Anthropic 模型。由于两个端点使用不同的 API 格式，你需要在 Aperture 中把它们分别配置为独立的提供商。模型名称必须与你的 Foundry 部署名称一致。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一个 [Microsoft Foundry][xt-foundry-portal] 资源和项目，至少包含一个模型部署。
* 你的资源的 [Foundry API key][xt-foundry-keys]。

## 配置提供商

把 Microsoft Foundry 添加到你的 [Aperture 配置][docs-aperture-configuration]中。Aperture 的 Foundry 集成支持 OpenAI GPT 模型和 Anthropic Claude 模型，两者经由不同的端点服务。请把每个端点分别配置为独立的提供商条目。在 [Foundry 门户][xt-foundry-portal]中找到你的资源、项目和部署名称。每个提供商的 `models` 列表中使用确切的部署名称。

以下示例假设每个部署与其模型 ID 同名。如果你的部署使用了不同名称，请替换 `models` 条目。

### OpenAI GPT 模型

配置 Foundry 的 `/openai` 端点来服务 GPT 模型：

```json
{
  "providers": {
    "microsoft-foundry-openai": {
      "baseurl": "https://<your-resource>.services.ai.azure.com/api/projects/<your-project>/openai/",
      "apikey": "<your-foundry-api-key>",
      "name": "Microsoft Foundry (OpenAI)",
      "models": ["gpt-5.5", "gpt-5.4-mini"],
      "cost_basis": "azure",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      }
    }
  }
}
```

各配置字段的含义如下：

* **`baseurl`** 特意以 `/openai/` 结尾。与大多数提供商（只需提供 API 根路径）不同，Foundry 把它的 OpenAI 兼容 API 放在项目作用域的路径下。Aperture 会把收到的请求路径拼接到这个 base 后面，得到形如 `https://<your-resource>.services.ai.azure.com/api/projects/<your-project>/openai/v1/chat/completions` 的上游 URL。请保留末尾斜杠，不要删掉路径段。
* **`openai_responses`** 启用 Responses API，OpenAI Codex 等工具会用到它。包含 `compatibility` 块时，请显式设置两个开关。没有 compatibility 块时，Aperture 默认只启用 `openai_chat`。
* **`cost_basis`** 设为 `azure`，这样 Aperture 会按 Azure OpenAI 定价目价而非标准 OpenAI 价格来计算请求成本。欧盟区域定价使用 `azure-eu`。请显式设置该字段，否则 Aperture 会从兼容性开关推断出 `openai` 定价。

### Anthropic Claude 模型

把 Foundry 的 `/anthropic` 端点配置为第二个提供商条目，用于服务 Claude 模型：

```json
{
  "providers": {
    "microsoft-foundry-anthropic": {
      "baseurl": "https://<your-resource>.services.ai.azure.com/anthropic/",
      "apikey": "<your-foundry-api-key>",
      "authorization": "x-api-key",
      "name": "Microsoft Foundry (Anthropic)",
      "models": ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-4-5"],
      "cost_basis": "azure",
      "compatibility": {
        "anthropic_messages": true
      }
    }
  }
}
```

该条目与 OpenAI 提供商的差异如下：

* **`baseurl`** 使用资源作用域的 `/anthropic/` 端点，不带 `/api/projects/<your-project>`。Aperture 会拼接 `/v1/messages`，得到 `https://<your-resource>.services.ai.azure.com/anthropic/v1/messages`。请在 base URL 中保留 `/anthropic/` 路径。
* **`authorization`** 设为 `x-api-key`，把你的 Foundry API key 放在要求的头中发送。Foundry 的 Claude 端点对 Microsoft Entra ID 令牌使用 bearer 授权，资源 API key 则不是。详情参阅 [Claude in Microsoft Foundry 认证][xt-foundry-anthropic-auth]。
* **`anthropic_messages`** 让 Aperture 使用 Anthropic Messages API 格式（`/v1/messages`），而不是 OpenAI chat completions 格式。

开关的完整列表参阅[兼容性开关参考][docs-provider-compatibility]。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[xt-foundry-anthropic-auth]: https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry#authentication

[xt-foundry-keys]: https://learn.microsoft.com/azure/ai-foundry/

[xt-foundry-portal]: https://ai.azure.com
