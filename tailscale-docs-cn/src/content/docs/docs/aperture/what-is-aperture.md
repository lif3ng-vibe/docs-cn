---
title: "什么是 Aperture？"
description: "Tailscale Aperture 是一个能与 tailnet 中机器协作的 AI 代理（agent），由一个以你的 Tailscale 身份路由 LLM 请求的网关提供支撑。"
---

最后验证于 Sep 29, 2026

Tailscale Aperture 是一个能与你的 [tailnet][docs-tailnet] 中的机器协作的 AI 代理（agent）。在 [Aperture Chat][docs-aperture-chat] 中，你启动一个任务，把你的机器接入其中，代理便会使用你的权限在这些机器上运行命令。

你的文件保留在机器上。代理直接在原处操作它们，不会把文件复制到托管工作区。

代理通过 Aperture 的网关访问 LLM。该网关是一个位于 LLM 客户端与提供商之间的反向代理。网关保管提供商 API 密钥并把密钥附加到每个请求上，因此你无需自备密钥，同时它会记录请求的发起者。编码助手、自动化代理和 CI 任务都可以让它们的 LLM 流量经过同一个网关。

\[Missing snippet: aperture\_openai\_compatible\_provider.mdx]

在开发、自动化和内部工具中引入 AI 的组织面临着安全、可见性和控制方面的新挑战。API 密钥常常散落在开发者设备、持续集成/持续交付（CI/CD）系统和自动化代理中，增加了泄露风险，也使凭证难以轮换和审计。团队无法清楚地了解谁在使用哪些模型、使用频率如何、成本是多少。这使得安全、平台和合规团队难以在不拖慢交付速度的前提下，为每个开发者、代理和流水线的 AI 使用提供支持。

阅读完本主题后，你将了解 Aperture 代理如何与你的机器协作、Tailscale 身份如何让它以你的身份行事而无需分发 API 密钥，以及 Aperture 能为你的 LLM 使用提供哪些可见性。

## 代理如何使用你的身份

设备加入 [tailnet][docs-tailnet] 时由 Tailscale 进行认证，Aperture 通过 [Tailscale 身份层][docs-tailscale-identity]读取该身份。用户无需单独登录 Aperture，也无需持有 API 密钥。

当你把一台机器接入任务时，代理会使用你的权限在它上面运行命令。它在机器上的特权与你的相同。只有在你接入之后，机器才成为任务的一部分。代理不会访问你未接入的机器。Aperture 会记录代理运行的命令，并将这些命令归到你的名下以供审查。

## 网关如何处理 LLM 请求

来自代理和其他 LLM 客户端的请求在到达 OpenAI、Anthropic 或 Google 等提供商之前会经过网关，响应也会经其返回。在这一环节，Aperture 会附加提供商密钥、按模型名称路由请求、记录用量和成本，并应用[护栏（guardrails）][docs-aperture-guardrails]。

客户端连接到 Aperture 网关并请求某个模型。Aperture 会选择一个同时支持该模型和请求所用 API 格式的提供商。用户必须拥有访问该模型的权限。设置要求参见[受支持的提供商与客户端][docs-aperture-provider-compatibility]。

## Aperture 提供什么

由于代理命令和 LLM 请求都携带你的身份并经由 Aperture，你能获得在客户端直连提供商时难以实现的可见性和控制力。

* **集中管理 API 密钥。** API 密钥保存在[服务器配置][docs-aperture-configuration]中，绝不会出现在开发者设备上。Aperture 为每个请求注入合适的密钥。需要轮换密钥时，你只需在一处更新。

* **Aperture Chat。** [Aperture Chat][docs-aperture-chat] 是一个可通过 `/` 或 `/chat` 访问的浏览器代理。把 tailnet 中的机器接入任务，代理便会以你的权限在它们上面运行命令。你还可以与模型对话、接入自己的工具并查看自己的活动。你不需要单独的客户端。

* **用量可见性与成本追踪。** Aperture 记录每个请求的用户、模型和 token 数。用户可以查看自己的[用量][docs-aperture-chat-usage]。管理员可以查看[全组织用量][docs-aperture-admin-usage]、[导出数据][docs-aperture-export-s3]并[设置消费上限][docs-aperture-manage-spending]。

* **采用分析。** 管理控制台的 [**Usage Overview** 页面][docs-aperture-admin-usage]展示整个组织的活跃用户和使用模式，包括哪些团队在使用哪些工具以及使用频率。

* **请求与响应捕获。** Aperture 会保存完整的请求和响应体以供审查。捕获系统会保留请求头、载荷和工具使用数据。配置[保留策略（retention policy）][docs-aperture-retention]来控制 Aperture 保存捕获数据的时长，并[导出日志和事件][docs-aperture-export-s3]到你的 SIEM（安全信息与事件管理）系统以做持久存储和审查。对数据处理有严格要求时，可启用[零数据保留][docs-aperture-privacy]，让 Aperture 绝不把提示词或响应内容写入磁盘。

* **护栏。** [护栏][docs-aperture-guardrails]在请求离开你的网络之前，在网关层面检查、修改或阻止它们。用例包括清除提示词中的个人身份信息（PII）、限制工具声明以及执行内容策略。

* **会话调试。** 用户可以检查自己的[会话和请求捕获][docs-aperture-chat-sessions]。管理员可以使用管理控制台的 [**Logs** 页面][docs-aperture-admin-logs]检查整个组织的会话并查看完整的请求和响应数据。

* **出站集成。** Aperture 可以通过[连接器（connector）][docs-aperture-connectors]代理到外部 [MCP 服务器][docs-aperture-mcp-server]和 HTTP API 的连接。连接器把对外部服务的认证集中起来，因此个人用户无需在自己的本地工具中单独配置 API 密钥或 OAuth 令牌。AI 代理通过 MCP 工具列表发现可用的连接器。

* **经批准的设备接入。** 通过[内置 tailnet 连接器][docs-aperture-built-in-connectors]，在你批准创建一次性的短期认证密钥（auth key）后，代理可以代表你把设备接入你的 tailnet。Tailscale 会把该密钥绑定到你的用户身份。默认情况下，该设备带有将其标识为 Aperture 创建（`custom:createdByAperture`）和 AI 创建（`custom:createdByAI`）的节点属性。

## 限制

部署前请考虑以下限制。Tailscale 正在积极开发 Aperture，因此此列表会频繁更新。

* **需要 Tailscale**

  Aperture 服务器运行在 tailnet 中。客户端可以从 tailnet 内部连接，也可以使用 Aperture CLI 桥接或 [`ts-unplug`][xt-gh-ts-plug][从外部连接][docs-aperture-connect-outside-tailnet]。两种方式都提供基于 Tailscale 的身份。Aperture 不支持直接的公网访问。

* **提供商支持**

  指标提取依赖对提供商响应格式的解析。Aperture 支持 OpenAI、Anthropic、Gemini 和 OpenAI 兼容 API。API 格式和设置要求参见[受支持的提供商与客户端][docs-aperture-provider-compatibility]。新增提供商或格式变更可能需要更新。

* **配额容量调减**

  Aperture 会持久化配额桶（quota bucket）余额。当你调低某个桶的容量时，Aperture 会把现有余额封顶到新值，超出部分无法恢复。从配置中删除某个配额定义时，Aperture 会移除对应的桶。详细信息参见[桶生命周期][docs-aperture-bucket-lifecycle]。

* **订阅套餐认证**

  默认情况下，Aperture 使用来自提供商开发者平台的 API 密钥向 LLM 提供商认证，例如 [Anthropic Console][xt-anthropic-console]、[OpenAI Platform][xt-openai-platform] 或 [Google AI Studio][xt-google-ai-studio]。Aperture 集中管理这些密钥以供共享使用。消费级和企业级订阅套餐，如 [Claude Pro 或 Claude Max][xt-anthropic-plans]、[ChatGPT Plus、Pro 或 Team][xt-openai-plans]、[Gemini Advanced][xt-gemini-plans]，提供的是 OAuth 令牌而不是这些 API 密钥，因此不适合默认的集中管理模式。要使用订阅套餐，请以[透传模式（passthrough mode）][docs-use-passthrough-mode]配置提供商。Aperture 会保留客户端提供的 `Authorization` 或 `x-api-key` 头。如果客户端两个头都没发，Aperture 就使用配置的提供商密钥。

## 常见问题

**如果用户尝试从 tailnet 之外连接会怎样？**

tailnet 之外的用户可以[通过 Aperture CLI 桥接或 `ts-unplug` 连接][docs-aperture-connect-outside-tailnet]。两者都会创建一个轻量级 tailnet 节点，并把本地流量代理到 Aperture。没有其中之一，连接会在网络层面失败，因为 Aperture 只监听 Tailscale 接口。

**在配置中新增 LLM 提供商会发生什么？**

如果 API 格式匹配且用户有权访问该模型，客户端就可以使用新提供商的模型。仅改模型名称并不能让不兼容的 API 协同工作。要求参见[受支持的提供商与客户端][docs-aperture-provider-compatibility]。

**流式响应在中途被中断会怎样？**

代理会捕获中断前已到达的数据。指标提取可能失败或只报告部分数据，但代理会保存这部分捕获内容以便调试。

**客户端使用 Aperture 需要 API 密钥吗？**

对于共享密钥的提供商，不需要。Aperture 通过 Tailscale 识别用户并附加配置好的提供商密钥。有些客户端仍要求填一个占位 API 密钥。使用[透传模式][docs-use-passthrough-mode]时，客户端可以发送自己的提供商凭证。如果提供商没有后备密钥，客户端就必须这样做。

**可以把我的 Claude Max、ChatGPT Plus 或其他订阅套餐与 Aperture 一起使用吗？**

可以，通过透传模式。订阅套餐提供的是 OAuth 令牌而不是开发者平台的 API 密钥，因此不符合 Aperture 默认的集中管理密钥模式。把提供商配置为 `auth_mode: "passthrough"`，Aperture 就会保留客户端提供的 `Authorization` 或 `x-api-key` 头。如果客户端两个头都没发，Aperture 就使用配置的提供商密钥。权衡取舍参见[订阅套餐认证][ar-limitations]，操作步骤参见[设置透传模式][docs-use-passthrough-mode]。

**可以把 Aperture 与文档未列出的提供商一起使用吗？**

你可以配置暴露 OpenAI 兼容 `/v1/chat/completions` 端点的提供商，例如 Groq、Together AI、Fireworks、Mistral、DeepSeek 和 Perplexity。这些只是通用配置路径的示例，并非经过逐个验证的集成。Tailscale 不测试也不保证与每个 OpenAI 兼容提供商的兼容性。配置步骤参见[设置 OpenAI 兼容提供商][docs-use-openai-compatible-provider]。

**可以把 Aperture 与自托管的 LLM 一起使用吗？**

可以，你可以用 Aperture 代理自托管的 LLM，而不把端点暴露到公网。对于 Aperture 网关在本地或经由你的 tailnet 可访问的服务器，参见[设置自托管提供商][docs-use-self-hosted]。

**可以在 GitHub Actions 等 CI/CD 环境中使用 Aperture 吗？**

可以，只要你能运行 Tailscale。Aperture 可以在 GitHub Actions 这类常见容器化环境中工作，无需把代理或网关暴露到公网。

**可以把 Aperture 与多个 tailnet 一起使用吗？**

可以，你可以使用 Aperture CLI 桥接或 [`ts-unplug`][xt-gh-ts-plug][从另一个 tailnet 连接到 Aperture][docs-aperture-connect-outside-tailnet]。这两种方法也可以用来从完全不在 tailnet 中的环境连接。

**可以用 Aperture 把 AI 代理连接到外部 API 和 MCP 服务器吗？**

可以。Aperture 支持[连接器][docs-aperture-connectors]，可代理到远程 MCP 服务器和 HTTP API 的连接。Aperture 会自动注入认证，因此代理无需管理各自的凭证即可访问外部服务。MCP 的具体设置参见 [MCP 服务器代理][docs-aperture-mcp-server]，HTTP API 代理参见[连接器][docs-aperture-connectors]主题。

## 相关资源

* [Aperture 的工作方式][docs-aperture-how-aperture-works]：深入了解请求路由、遥测捕获和会话追踪。
* [开始使用 Aperture][docs-aperture-get-started]：注册、配置提供商并连接你的第一个 LLM 客户端。
* [受支持的提供商与客户端][docs-aperture-provider-compatibility]：提供商与客户端清单、API 格式和设置要求。
* [从 tailnet 之外连接][docs-aperture-connect-outside-tailnet]：使用 Aperture CLI 桥接或 `ts-unplug` 连接不在 tailnet 中的客户端。

[ar-limitations]: #限制

[docs-aperture-bucket-lifecycle]: /docs/aperture/configuration#bucket-lifecycle

[docs-aperture-built-in-connectors]: /docs/aperture/connectors/built-in-connectors

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-admin-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-aperture-admin-usage]: /docs/aperture/reference/dashboard-admin#usage-overview

[docs-aperture-chat]: /docs/aperture/reference/chat

[docs-aperture-chat-sessions]: /docs/aperture/reference/chat#sessions

[docs-aperture-chat-usage]: /docs/aperture/reference/chat#usage

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-guardrails]: /docs/aperture/guardrails

[docs-aperture-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-aperture-manage-spending]: /docs/aperture/manage-spending

[docs-aperture-mcp-server]: /docs/aperture/mcp-server

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-aperture-retention]: /docs/aperture/configuration#database

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider

[docs-use-self-hosted]: /docs/aperture/how-to/use-self-hosted

[xt-anthropic-console]: https://console.anthropic.com

[xt-anthropic-plans]: https://claude.com/pricing

[xt-gemini-plans]: https://gemini.google.com

[xt-gh-ts-plug]: https://github.com/tailscale/ts-plug

[xt-google-ai-studio]: https://aistudio.google.com

[xt-openai-plans]: https://openai.com/chatgpt/pricing

[xt-openai-platform]: https://platform.openai.com
