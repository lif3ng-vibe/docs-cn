---
title: "Supported providers and clients"
description: "Aperture routes model requests from clients to upstream providers. Use this reference to compare their API formats, setup options, and requirements."
---

Last validated Sep 30, 2026

Aperture routes model requests from clients to upstream providers. Use this reference to compare their API formats, setup options, and requirements.

A provider serves models. A client or agent harness sends requests. The client, provider, and selected model must support the same API format. Matching formats does not guarantee every provider and client combination works.

## Provider matrix

Provider names link to setup instructions. The table lists upstream API formats and their [compatibility flags][docs-compatibility-flags].

| Provider                                                                 | API formats and flags                                                                                                         | Base URL                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [OpenAI][docs-use-openai]                                                | OpenAI Chat Completions: `openai_chat`. OpenAI Responses: `openai_responses`.                                                 | `https://api.openai.com`                                                  |
| [Anthropic][docs-use-anthropic]                                          | Anthropic Messages: `anthropic_messages`.                                                                                     | `https://api.anthropic.com`                                               |
| [Google Gemini][docs-use-google-gemini]                                  | Direct Gemini: `gemini_generate_content`.                                                                                     | `https://generativelanguage.googleapis.com`                               |
| [Gemini Enterprise Agent Platform (Gemini)][docs-use-geap]               | Google-hosted Gemini: `google_generate_content`. Optional OpenAI Chat Completions: `openai_chat`.                             | `https://aiplatform.googleapis.com`                                       |
| [Gemini Enterprise Agent Platform (Anthropic)][docs-use-geap]            | Google-hosted Anthropic: `google_raw_predict`.                                                                                | `https://aiplatform.googleapis.com`                                       |
| [Amazon Bedrock][docs-use-amazon-bedrock]                                | InvokeModel: `bedrock_model_invoke`. Converse: `bedrock_converse`.                                                            | `https://bedrock-runtime.<region>.amazonaws.com`                          |
| [Microsoft Foundry (OpenAI)][docs-use-microsoft-foundry]                 | OpenAI Chat Completions: `openai_chat`. OpenAI Responses: `openai_responses`.                                                 | `https://<resource>.services.ai.azure.com/api/projects/<project>/openai/` |
| [Microsoft Foundry (Anthropic)][docs-use-microsoft-foundry]              | Anthropic Messages: `anthropic_messages`.                                                                                     | `https://<resource>.services.ai.azure.com/anthropic/`                     |
| [OpenRouter][docs-use-openrouter]                                        | OpenAI Chat Completions: `openai_chat`. OpenAI Responses: `openai_responses`. Anthropic Messages: `anthropic_messages`.       | `https://openrouter.ai/api/`                                              |
| [Vercel AI Gateway][docs-use-vercel]                                     | OpenAI Chat Completions: `openai_chat`. OpenAI Responses: `openai_responses`. Anthropic Messages: `anthropic_messages`.       | `https://ai-gateway.vercel.sh`                                            |
| [Self-hosted LLM providers][docs-use-self-hosted]                        | OpenAI Chat Completions: `openai_chat` by default.                                                                            | Your server URL                                                           |
| [Other OpenAI-compatible providers][docs-use-openai-compatible-provider] | OpenAI Chat Completions: `openai_chat` by default. The OpenAI Responses API requires upstream support and `openai_responses`. | Provider URL prefix before `/v1/...`                                      |

Set `baseurl` to the value shown. Aperture appends the full incoming request path to it. If your provider's API base URL ends in `/v1`, remove only that suffix. Keep any earlier path segments, such as OpenRouter's `/api`. Refer to [upstream URL construction][docs-aperture-configuration-url] for details.

### Provider requirements

* Gemini Enterprise Agent Platform uses separate API flags for Gemini and Anthropic models. Its optional Chat Completions path is for Gemini only. The Aperture CLI labels this platform **Google Vertex**.
* Bedrock InvokeModel request formats depend on the model family. The Claude Code setup uses Claude InvokeModel. Converse uses a separate format. Neither is the Anthropic Messages endpoint used by Claude Desktop.
* Microsoft Foundry's OpenAI and Anthropic endpoints require separate provider configurations.
* OpenRouter and Vercel AI Gateway models must support the selected API format.
* [Claude subscription][docs-claude-subscriptions] and [ChatGPT subscription][docs-codex-subscriptions] credentials require their own setup. They are not interchangeable with developer API keys.

When you route requests to a provider, you direct Aperture to send request content to that third-party provider. The provider's handling of that content is governed by your agreement with the provider, not your agreement with Tailscale.

## Clients and agent harnesses

Choose a client that supports your provider's API. Client names link to setup instructions. **CLI** links use the Aperture CLI. **Gateway** links use settings from the Aperture gateway.

| Client and setup                                                                             | API formats or back ends                                                                                             | Requirements and limits                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Claude Code][docs-claude-code] ([CLI][docs-cli-claude-code], [gateway][docs-gateway-setup]) | Anthropic Messages, Claude Bedrock InvokeModel, Google-hosted Anthropic                                              | Select the matching provider type. Subscription passthrough differs from shared API-key setup.                                                                                                                                                           |
| [Claude Code Action][docs-claude-code-action]                                                | Anthropic Messages                                                                                                   | The GitHub Actions runner needs Tailscale connectivity, a CI identity, and model grants.                                                                                                                                                                 |
| [Claude Desktop][docs-claude-desktop] ([CLI][docs-cli-cowork])                               | Anthropic Messages                                                                                                   | Requires HTTPS with a trusted certificate for the gateway hostname. CLI setup, labeled **Claude Cowork**, supports macOS and Windows, not Linux. This connection is for model inference, not every desktop feature. It does not use native Bedrock APIs. |
| [OpenAI Codex][docs-codex] ([CLI][docs-cli-codex], [gateway][docs-gateway-setup])            | OpenAI Responses                                                                                                     | Chat Completions is insufficient. ChatGPT subscription passthrough uses a separate endpoint and authentication configuration.                                                                                                                            |
| [OpenCode][docs-opencode] ([CLI][docs-cli-opencode], [gateway][docs-gateway-setup])          | OpenAI Responses, OpenAI Chat Completions, Anthropic Messages, native Google APIs, Bedrock                           | The CLI uses Google-hosted Gemini and Bedrock Converse. Gateway configuration also supports Google-hosted Anthropic and Claude InvokeModel, but not ChatGPT subscription authentication.                                                                 |
| [Gemini CLI][docs-cli-gemini]                                                                | Direct and Google-hosted Gemini                                                                                      | Version 0.40 or later requires HTTPS and a fully qualified gateway hostname. This setup uses native Google APIs, not Chat Completions.                                                                                                                   |
| [GitHub Copilot CLI][docs-cli-copilot] ([gateway][docs-gateway-setup])                       | OpenAI Chat Completions, OpenAI Responses, Anthropic Messages                                                        | Select the matching API mode. This entry does not cover Copilot editor integrations.                                                                                                                                                                     |
| [Pi][docs-cli-pi] ([gateway][docs-gateway-setup])                                            | OpenAI Responses, Anthropic Messages, OpenAI Chat Completions, Gemini                                                | The CLI configures Google-hosted Gemini. Gateway configuration uses direct Gemini. Neither includes Bedrock.                                                                                                                                             |
| [Oh My Pi][docs-cli-omp]                                                                     | OpenAI Responses, Anthropic Messages, OpenAI Chat Completions, Google-hosted Gemini                                  | Uses the `omp` binary. The Google Vertex back end requires Gemini models. No Bedrock back end.                                                                                                                                                           |
| [Hermes Agent][docs-cli-hermes] ([gateway][docs-gateway-setup])                              | OpenAI Chat Completions through the CLI. Also Anthropic Messages and OpenAI Responses through gateway configuration. | Neither setup configures native Google or Bedrock APIs.                                                                                                                                                                                                  |
| [Kilo Code][docs-gateway-kilo]                                                               | Anthropic Messages, OpenAI Responses, OpenAI Chat Completions, native Google APIs, Bedrock InvokeModel and Converse  | Gateway configuration matches back ends to APIs and model families. InvokeModel is for Claude. ChatGPT subscription authentication is excluded.                                                                                                          |
| [Grok Build][docs-gateway-grok]                                                              | OpenAI Chat Completions preferred, OpenAI Responses for models without an OpenAI Chat Completions route              | Labeled **Grok** in the Aperture gateway. No Messages, native Google, or Bedrock back end. Responses routes require a compatible model response shape.                                                                                                   |
| [Aperture chat][docs-chat-setup]                                                             | Anthropic Messages, OpenAI Chat Completions, OpenAI Responses, direct and Google-hosted Gemini                       | Requires model access and a chat-compatible provider. Passthrough-only providers without a fallback key are unavailable.                                                                                                                                 |

## Limitations

* Model access depends on provider configuration and user permissions, in addition to matching API formats.
* Compatibility flags describe upstream capabilities. Enabling a flag does not convert the provider to a different API.
* Generic API compatibility does not cover every model feature, request field, response field, or non-chat modality.
* Client-side Aperture gateway URLs and provider-side `baseurl` values are different settings. Follow the setup guide for each.
* A placeholder API key cannot replace a required passthrough credential.
* The Aperture CLI configures clients. Bridges and [`ts-unplug`][docs-network-access] provide network connectivity. Network connectivity and MCP connector access do not establish LLM inference compatibility.
* [Tokens bought through Aperture][docs-buy-tokens] provide managed model access in built-in chat. Model availability in chat does not establish external client compatibility.

## Other providers and clients

\[Missing snippet: aperture\_openai\_compatible\_provider.mdx]

Groq, Together AI, Fireworks, Mistral, DeepSeek, and Perplexity are examples of the generic provider setup, not individually verified integrations. The [self-hosted provider guide][docs-use-self-hosted] covers servers such as llama.cpp, vLLM, and Ollama.

Roo Code, Cline, and custom applications can use the [generic OpenAI-compatible client setup][docs-generic-clients] when their API requirements match the provider. Providers and clients not listed here might also work with these generic setups.

## Related

* For compatibility flags, authorization, and pricing fields, refer to [Provider configuration][docs-provider-configuration].
* For the complete configuration schema, refer to the [Aperture configuration reference][docs-aperture-configuration].
* For step-by-step provider setup instructions, refer to the [set up LLM providers][docs-set-up-providers] guides.
* To connect coding agents through Aperture, refer to the [set up LLM clients][docs-use-your-tools] guides.
* For automated client configuration, refer to the [Aperture CLI][docs-cli].
* For connection and request failures, refer to [Troubleshooting Aperture][docs-troubleshooting].

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
