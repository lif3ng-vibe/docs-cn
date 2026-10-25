---
title: "受支持的提供商和客户端"
description: "Aperture 把来自客户端的模型请求路由到上游提供商。使用本参考对比它们的 API 格式、设置选项和要求。"
---

最后验证于 Sep 30, 2026

Aperture 把来自客户端的模型请求路由到上游提供商。使用本参考对比它们的 API 格式、设置选项和要求。

提供商（provider）提供模型。客户端（client）或 agent 框架（harness）发送请求。客户端、提供商和所选模型必须支持相同的 API 格式。格式匹配并不保证每一种提供商与客户端的组合都能正常工作。

## 提供商矩阵

提供商名称链接到设置说明。表格列出了上游 API 格式及其[兼容性标志][docs-compatibility-flags]。

| 提供商                                                                   | API 格式与标志                                                                                                                | Base URL                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [OpenAI][docs-use-openai]                                                | OpenAI Chat Completions：`openai_chat`。OpenAI Responses：`openai_responses`。                                                | `https://api.openai.com`                                                  |
| [Anthropic][docs-use-anthropic]                                          | Anthropic Messages：`anthropic_messages`。                                                                                    | `https://api.anthropic.com`                                               |
| [Google Gemini][docs-use-google-gemini]                                  | 直连 Gemini：`gemini_generate_content`。                                                                                      | `https://generativelanguage.googleapis.com`                               |
| [Gemini Enterprise Agent Platform（Gemini）][docs-use-geap]              | Google 托管的 Gemini：`google_generate_content`。可选的 OpenAI Chat Completions：`openai_chat`。                              | `https://aiplatform.googleapis.com`                                       |
| [Gemini Enterprise Agent Platform（Anthropic）][docs-use-geap]           | Google 托管的 Anthropic：`google_raw_predict`。                                                                               | `https://aiplatform.googleapis.com`                                       |
| [Amazon Bedrock][docs-use-amazon-bedrock]                                | InvokeModel：`bedrock_model_invoke`。Converse：`bedrock_converse`。                                                           | `https://bedrock-runtime.<region>.amazonaws.com`                          |
| [Microsoft Foundry（OpenAI）][docs-use-microsoft-foundry]                | OpenAI Chat Completions：`openai_chat`。OpenAI Responses：`openai_responses`。                                                | `https://<resource>.services.ai.azure.com/api/projects/<project>/openai/` |
| [Microsoft Foundry（Anthropic）][docs-use-microsoft-foundry]             | Anthropic Messages：`anthropic_messages`。                                                                                    | `https://<resource>.services.ai.azure.com/anthropic/`                     |
| [OpenRouter][docs-use-openrouter]                                        | OpenAI Chat Completions：`openai_chat`。OpenAI Responses：`openai_responses`。Anthropic Messages：`anthropic_messages`。      | `https://openrouter.ai/api/`                                              |
| [Vercel AI Gateway][docs-use-vercel]                                     | OpenAI Chat Completions：`openai_chat`。OpenAI Responses：`openai_responses`。Anthropic Messages：`anthropic_messages`。      | `https://ai-gateway.vercel.sh`                                            |
| [自托管 LLM 提供商][docs-use-self-hosted]                                | 默认 OpenAI Chat Completions：`openai_chat`。                                                                                 | 你的服务器 URL                                                            |
| [其他 OpenAI 兼容提供商][docs-use-openai-compatible-provider]            | 默认 OpenAI Chat Completions：`openai_chat`。OpenAI Responses API 需要上游支持并启用 `openai_responses`。                     | 提供商 URL 中 `/v1/...` 之前的前缀                                        |

把 `baseurl` 设置为表中所示值。Aperture 会把完整的传入请求路径追加到它后面。如果你的提供商 API base URL 以 `/v1` 结尾，只需去掉这个后缀。更早的路径段要保留，例如 OpenRouter 的 `/api`。详情请参阅[上游 URL 构建][docs-aperture-configuration-url]。

### 提供商要求

* Gemini Enterprise Agent Platform 对 Gemini 模型和 Anthropic 模型使用不同的 API 标志。其可选的 Chat Completions 路径仅适用于 Gemini。Aperture CLI 把该平台标注为 **Google Vertex**。
* Bedrock InvokeModel 的请求格式取决于模型家族。Claude Code 设置使用 Claude InvokeModel；Converse 使用另一种格式。两者都不是 Claude Desktop 使用的 Anthropic Messages 端点。
* Microsoft Foundry 的 OpenAI 端点和 Anthropic 端点需要分别配置提供商。
* OpenRouter 和 Vercel AI Gateway 的模型必须支持所选的 API 格式。
* [Claude 订阅][docs-claude-subscriptions]和 [ChatGPT 订阅][docs-codex-subscriptions]凭证需要单独设置。它们与开发者 API 密钥不能互换使用。

把请求路由到某个提供商时，你就是在指示 Aperture 把请求内容发送给该第三方提供商。提供商对这些内容的处理受你与该提供商之间协议的约束，而非你与 Tailscale 之间的协议。

## 客户端与 agent 框架

选择一个支持你提供商 API 的客户端。客户端名称链接到设置说明。**CLI** 链接使用 Aperture CLI，**Gateway** 链接使用 Aperture 网关的设置。

| 客户端与设置                                                                                 | API 格式或后端                                                                                                        | 要求与限制                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Claude Code][docs-claude-code]（[CLI][docs-cli-claude-code]、[网关][docs-gateway-setup]）   | Anthropic Messages、Claude Bedrock InvokeModel、Google 托管的 Anthropic                                               | 选择匹配的提供商类型。订阅透传与共享 API 密钥设置不同。                                                                                                                                                                                                  |
| [Claude Code Action][docs-claude-code-action]                                                | Anthropic Messages                                                                                                    | GitHub Actions runner 需要 Tailscale 连通性、CI 身份和模型授权。                                                                                                                                                                                         |
| [Claude Desktop][docs-claude-desktop]（[CLI][docs-cli-cowork]）                              | Anthropic Messages                                                                                                    | 网关主机名需要 HTTPS 和受信任的证书。CLI 设置标注为 **Claude Cowork**，支持 macOS 和 Windows，不支持 Linux。此连接用于模型推理，并非所有桌面功能。它不使用原生 Bedrock API。                                                                              |
| [OpenAI Codex][docs-codex]（[CLI][docs-cli-codex]、[网关][docs-gateway-setup]）              | OpenAI Responses                                                                                                      | Chat Completions 不够用。ChatGPT 订阅透传使用单独的端点和认证配置。                                                                                                                                                                                      |
| [OpenCode][docs-opencode]（[CLI][docs-cli-opencode]、[网关][docs-gateway-setup]）            | OpenAI Responses、OpenAI Chat Completions、Anthropic Messages、原生 Google API、Bedrock                               | CLI 使用 Google 托管的 Gemini 和 Bedrock Converse。网关配置还支持 Google 托管的 Anthropic 和 Claude InvokeModel，但不支持 ChatGPT 订阅认证。                                                                                                              |
| [Gemini CLI][docs-cli-gemini]                                                                | 直连与 Google 托管的 Gemini                                                                                           | 0.40 及以上版本要求 HTTPS 和完全限定的网关主机名。此设置使用原生 Google API，而不是 Chat Completions。                                                                                                                                                    |
| [GitHub Copilot CLI][docs-cli-copilot]（[网关][docs-gateway-setup]）                         | OpenAI Chat Completions、OpenAI Responses、Anthropic Messages                                                         | 选择匹配的 API 模式。此条目不涵盖 Copilot 编辑器集成。                                                                                                                                                                                                   |
| [Pi][docs-cli-pi]（[网关][docs-gateway-setup]）                                              | OpenAI Responses、Anthropic Messages、OpenAI Chat Completions、Gemini                                                 | CLI 配置 Google 托管的 Gemini。网关配置使用直连 Gemini。两者都不包含 Bedrock。                                                                                                                                                                            |
| [Oh My Pi][docs-cli-omp]                                                                     | OpenAI Responses、Anthropic Messages、OpenAI Chat Completions、Google 托管的 Gemini                                   | 使用 `omp` 二进制文件。Google Vertex 后端需要 Gemini 模型。没有 Bedrock 后端。                                                                                                                                                                            |
| [Hermes Agent][docs-cli-hermes]（[网关][docs-gateway-setup]）                                | CLI 走 OpenAI Chat Completions；也可通过网关配置使用 Anthropic Messages 和 OpenAI Responses                           | 两种设置都不配置原生 Google 或 Bedrock API。                                                                                                                                                                                                             |
| [Kilo Code][docs-gateway-kilo]                                                               | Anthropic Messages、OpenAI Responses、OpenAI Chat Completions、原生 Google API、Bedrock InvokeModel 和 Converse        | 网关配置会把后端与 API 和模型家族匹配。InvokeModel 用于 Claude。不包含 ChatGPT 订阅认证。                                                                                                                                                                |
| [Grok Build][docs-gateway-grok]                                                              | 首选 OpenAI Chat Completions；没有 OpenAI Chat Completions 路由的模型使用 OpenAI Responses                            | 在 Aperture 网关中标注为 **Grok**。没有 Messages、原生 Google 或 Bedrock 后端。Responses 路由要求模型响应结构兼容。                                                                                                                                       |
| [Aperture chat][docs-chat-setup]                                                             | Anthropic Messages、OpenAI Chat Completions、OpenAI Responses、直连与 Google 托管的 Gemini                            | 需要模型访问权限和聊天兼容的提供商。没有备用密钥的纯透传提供商不可用。                                                                                                                                                                                   |

## 限制

* 除了 API 格式匹配之外，模型访问还取决于提供商配置和用户权限。
* 兼容性标志描述的是上游能力。启用标志不会把提供商转换成另一种 API。
* 通用 API 兼容性并不覆盖每一种模型特性、请求字段、响应字段或非聊天模态。
* 客户端侧的 Aperture 网关 URL 和提供商侧的 `baseurl` 是两个不同的设置。请分别按各自的设置指南操作。
* 占位 API 密钥不能替代必需的透传凭证。
* Aperture CLI 负责配置客户端。Bridges 和 [`ts-unplug`][docs-network-access] 提供网络连通性。网络连通性和 MCP 连接器访问并不代表 LLM 推理兼容。
* [通过 Aperture 购买的 token][docs-buy-tokens]在内置聊天中提供托管的模型访问。聊天中的模型可用性并不代表外部客户端兼容。

## 其他提供商与客户端

\[缺失片段：aperture\_openai\_compatible\_provider.mdx]

Groq、Together AI、Fireworks、Mistral、DeepSeek 和 Perplexity 属于通用提供商设置的例子，并不是逐一验证过的集成。[自托管提供商指南][docs-use-self-hosted]涵盖 llama.cpp、vLLM 和 Ollama 等服务器。

当 API 要求与提供商匹配时，Roo Code、Cline 和自定义应用可以使用[通用 OpenAI 兼容客户端设置][docs-generic-clients]。未在此列出的提供商和客户端也可能适用于这些通用设置。

## 相关内容

* 兼容性标志、认证和定价字段请参阅[提供商配置][docs-provider-configuration]。
* 完整的配置架构请参阅 [Aperture 配置参考][docs-aperture-configuration]。
* 分步提供商设置说明请参阅[设置 LLM 提供商][docs-set-up-providers]指南。
* 让编码智能体 通过 Aperture 连接请参阅[设置 LLM 客户端][docs-use-your-tools]指南。
* 自动化客户端配置请参阅 [Aperture CLI][docs-cli]。
* 连接和请求失败问题请参阅 [Aperture 故障排除][docs-troubleshooting]。

[docs-compatibility-flags]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-aperture-configuration-url]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-buy-tokens]: /docs/aperture/buy-tokens-through-aperture

[docs-chat-setup]: /docs/aperture/how-to/set-up-chat-ui

[docs-claude-code-action]: /docs/aperture/how-to/use-claude-code-action

[docs-claude-code]: /docs/aperture/how-to/use-claude-code

[docs-claude-desktop]: /docs/aperture/how-to/use-claude-desktop

[docs-claude-subscriptions]: /docs/aperture/how-to/use-passthrough-mode/claude-subscriptions

[docs-cli-claude-code]: /docs/aperture/cli#claude-code

[docs-cli-codex]: /docs/aperture/cli#openai-codex

[docs-cli-copilot]: /docs/aperture/cli#github-copilot

[docs-cli-cowork]: /docs/aperture/cli#claude-cowork

[docs-cli-gemini]: /docs/aperture/cli#gemini-cli

[docs-cli-hermes]: /docs/aperture/cli#hermes-agent

[docs-cli-omp]: /docs/aperture/cli#oh-my-pi

[docs-cli-opencode]: /docs/aperture/cli#opencode

[docs-cli-pi]: /docs/aperture/cli#pi

[docs-cli]: /docs/aperture/cli

[docs-codex-subscriptions]: /docs/aperture/how-to/use-passthrough-mode/codex-subscriptions

[docs-codex]: /docs/aperture/how-to/use-codex

[docs-gateway-grok]: /docs/aperture/use-your-tools#grok-build

[docs-gateway-kilo]: /docs/aperture/use-your-tools#kilo-code

[docs-gateway-setup]: /docs/aperture/use-your-tools#gateway-generated-configuration

[docs-generic-clients]: /docs/aperture/how-to/use-openai-compatible-tools

[docs-network-access]: /docs/aperture/connect-outside-tailnet

[docs-opencode]: /docs/aperture/how-to/use-opencode

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-amazon-bedrock]: /docs/aperture/how-to/use-amazon-bedrock

[docs-use-anthropic]: /docs/aperture/how-to/use-anthropic

[docs-use-geap]: /docs/aperture/how-to/use-gemini-enterprise-agent-platform

[docs-use-google-gemini]: /docs/aperture/how-to/use-google-gemini

[docs-use-microsoft-foundry]: /docs/aperture/how-to/use-microsoft-foundry

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider

[docs-use-openai]: /docs/aperture/how-to/use-openai

[docs-use-openrouter]: /docs/aperture/how-to/use-openrouter

[docs-use-self-hosted]: /docs/aperture/how-to/use-self-hosted

[docs-use-vercel]: /docs/aperture/how-to/use-vercel

[docs-use-your-tools]: /docs/aperture/use-your-tools

[docs-provider-configuration]: /docs/aperture/provider-compatibility
