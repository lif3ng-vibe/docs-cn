---
title: "设置 LLM 提供商"
description: "配置上游 LLM 提供商，让 Aperture 能够代表你的用户路由请求并注入认证信息。"
---

最后验证于 Sep 29, 2026

请从下方的提供商指南中选择一个，在其 API 端点、凭证和模型中完成配置，写入你的 [Aperture 配置][docs-aperture-configuration]。在[设置客户端][docs-use-your-tools]之前，请先在[受支持的提供商和客户端][docs-provider-compatibility]中对比各 API 格式和要求。

要转发客户端自带的提供商凭证，请按照[设置透传模式][docs-use-passthrough-mode]操作。你也可以配置一个共享密钥作为回退。

使用[模型别名][docs-model-aliases]可以在更换目的地提供商或模型时保持客户端模型名称稳定。

\[缺失片段：aperture\_openai\_compatible\_provider.mdx]

[**设置透传模式**](/docs/aperture/how-to/use-passthrough-mode)——配置 Aperture 提供商，把每个客户端自己的凭证（包括订阅 OAuth token）转发给上游提供商，而不是注入共享 API 密钥。

[**模型别名**](/docs/aperture/model-aliases)——配置模型别名、选择目的地，并应用授权、配额和 hook。

[**设置 OpenAI**](/docs/aperture/how-to/use-openai)——在 Aperture 中配置 OpenAI 提供商，让你的团队可以访问 GPT 模型。

[**设置 Anthropic**](/docs/aperture/how-to/use-anthropic)——在 Aperture 中配置 Anthropic 提供商，让你的团队可以访问 Claude 模型。

[**设置 Google Gemini**](/docs/aperture/how-to/use-google-gemini)——在 Aperture 中配置 Google Gemini 提供商，让你的团队通过直连 Gemini API 访问 Gemini 模型。

[**设置 Gemini Enterprise Agent Platform**](/docs/aperture/how-to/use-gemini-enterprise-agent-platform)——使用 GCP 服务账号和密钥文件在 Aperture 中配置 Gemini Enterprise Agent Platform 提供商，让你的团队通过 Aperture 访问 Gemini 和 Claude 模型。

[**设置 Amazon Bedrock**](/docs/aperture/how-to/use-amazon-bedrock)——在 Aperture 中配置 Amazon Bedrock 提供商，让你的团队通过 AWS 访问基础模型。

[**设置 Microsoft Foundry**](/docs/aperture/how-to/use-microsoft-foundry)——在 Aperture 中配置 Microsoft Foundry 提供商，让你的团队可以访问部署在 Foundry 中的 OpenAI GPT 和 Anthropic Claude 模型。

[**设置 OpenRouter**](/docs/aperture/how-to/use-openrouter)——在 Aperture 中配置 OpenRouter 提供商，让你的团队通过单一聚合器访问多家提供商的模型。

[**设置 Vercel AI Gateway**](/docs/aperture/how-to/use-vercel)——在 Aperture 中配置 Vercel AI Gateway 提供商，让你的团队可以访问多家 LLM 提供商的模型。

[**设置自托管提供商**](/docs/aperture/how-to/use-self-hosted)——在 Aperture 中把自托管 LLM 服务器配置为提供商，让你的团队通过 tailnet 访问私有模型。

[**设置 OpenAI 兼容提供商**](/docs/aperture/how-to/use-openai-compatible-provider)——在 Aperture 中配置 OpenAI 兼容提供商，包括 API 格式、认证方式和成本估算。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools
