---
title: "Aperture 的工作原理"
description: "了解 Aperture 如何利用 Tailscale 身份、基于模型的路由和遥测来保护并监控 LLM 请求。"
---

最后验证于 Oct 1, 2026

Aperture 让客户端发送的 AI 请求经由其网关路由，从而让组织能够掌握这些流量。本主题介绍四个核心机制：身份与认证、按模型路由请求、遥测捕获以及会话跟踪。它们共同支撑审计、成本感知和运维洞察，同时让团队能够安全地采用 LLM 客户端。

\[Missing snippet: aperture\_openai\_compatible\_provider.mdx]

## 身份与认证

传统 API 代理要求客户端使用令牌或 API 密钥进行认证。你可以借助 [Tailscale 身份层][docs-tailscale-identity]省去这一步。

每一条通往 tailnet 的连接都带有加密的身份证明。当请求到达 Aperture 时，代理会用远端 IP 地址查询 Tailscale。Tailscale 返回用户的登录名（例如 `alice@example.com`）、一个持久的设备标识符，以及分配给该设备的所有标签。

这种身份之所以可信，是因为它来自 Tailscale 的控制平面，而不是客户端。除非攻破 Tailscale 的密钥交换，用户无法伪造自己的身份。

身份贯穿整个系统。每条指标记录都包含登录名和设备 ID。用户在 Web 门户中只能访问自己的会话和使用记录。管理员可以在管理仪表盘（admin dashboard）中按用户筛选全组织视图。访问控制使用通过授权分配的角色，并以 Tailscale 身份作为键。

[从 tailnet 之外连接][docs-aperture-connect-outside-tailnet]的客户端同样通过 Tailscale 身份认证。每个 Aperture CLI 桥接或 `ts-unplug` 实例都会作为独立设备加入 tailnet，因此 Aperture 按该设备的登录名识别请求。如果每个人运行自己的实例，Aperture 会把活动归属到具体用户；如果多人共用一个实例，所有活动都会显示在同一个身份下。

### 已打标签设备的身份

当[打有标签的 Tailscale 设备][docs-tags]连接 Aperture 时，它没有关联的用户账户。此时 Aperture 会基于设备的标签构造一个合成身份。

Aperture 将设备的标签按字母排序并用逗号连接，生成一个稳定的登录名。例如，带有 `tag:prod` 和 `tag:api` 标签的设备，在使用视图、日志和会话跟踪中会显示为 `tag:api,tag:prod`。

如果设备既没有用户资料也没有标签，身份解析就会失败，该设备将被拒绝访问。

要让打标签的设备获得模型访问权限，授权可以匹配带有某个特定标签的所有设备，也可以通过合成登录名匹配具有某一精确标签组合的所有设备。`src` 示例与配置步骤请参阅[授予打标签设备的访问权限][docs-aperture-grant-model-access]。

如果所有来自打标签节点的会话看起来都出自同一个用户，请参阅故障排除指南中的[所有会话看起来都来自同一个用户][docs-aperture-incorrect-user-identity]。

## 按模型路由请求

请求到达时，Aperture 会从请求体中提取模型名称（例如 `claude-sonnet-5-5` 或 `gpt-5.5`）。如果名称匹配已配置的[模型别名][docs-aperture-model-aliases]，Aperture 会先把它解析为具体的目标，再检查访问权限并选择提供商。网关检查用户的访问权限，并选择一个能提供该模型且支持传入 API 格式的提供商，然后使用该提供商认证配置所选的凭证转发请求。

在客户端看来，代理就像是 LLM 提供商本身。客户端连接代理 URL 并发送标准 API 请求，由代理透明地处理路由。

连接的两端都是加密的：客户端通过 tailnet 使用 Tailscale 加密到达 Aperture，而 Aperture 通过 TLS 连接上游提供商。

下表汇总了 API 格式与示例端点。提供商与客户端清单及接入路径请参阅[支持的提供商与客户端][docs-aperture-provider-compatibility]。兼容性开关请参阅[提供商配置][docs-provider-flags]。

| 格式                             | 端点                                                                                   | 示例提供商                                          |
| :------------------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| OpenAI Chat Completions          | `POST /v1/chat/completions`                                                            | OpenAI、OpenRouter 及 OpenAI 兼容提供商             |
| OpenAI Responses                 | `POST /v1/responses`                                                                   | OpenAI                                              |
| Anthropic Messages               | `POST /v1/messages`                                                                    | Anthropic                                           |
| Gemini                           | `POST /v1beta/models/{model}:generateContent`                                          | Google                                              |
| Amazon Bedrock                   | `POST /bedrock/model/{model}/invoke`                                                   | Amazon Bedrock                                      |
| Gemini Enterprise Agent Platform | `POST /v1/projects/{project}/locations/{region}/publishers/{publisher}/models/{model}` | Gemini Enterprise Agent Platform                    |

## 遥测捕获

捕获系统会记录重建和分析每次 LLM 交互所需的一切：

* **请求数据**：HTTP 方法、路径、完整请求体和头部。在存储的捕获记录中，Aperture 会对标准上游认证头部以及提供商或授权通过 `add_headers` 添加的头部的值做脱敏处理。其他头部（包括客户端自定义头部）在本地捕获记录中以明文保留，直到 Aperture 清除捕获内容；在 Aperture 之前导出的 S3 对象中同样保留，直到你删除这些对象。
* **响应数据**：状态码、头部和完整响应体。
* **提取的指标**：按类型统计的 token 数（输入、输出、缓存和推理）、模型名称、请求时长和工具使用次数。
* **会话上下文**：会话 ID，在支持的提供商和代理（如 Claude Code 与 Codex）中将相关请求关联起来。

代理在响应完成后异步处理遥测，因此客户端收到响应不会有明显延迟。

你可以配置 Aperture 保留捕获内容的时长。在零保留（zero retention，即 `duration: "0"`、`require_export: false`）模式下，Aperture 不存储捕获的请求体、响应体、头部或原始 HTTP 字节，使用指标仍然可用。捕获保留不会删除 Aperture Chat 的会话历史，也不会阻止大多数已配置的钩子发送内容。如果你将零保留与 `purge: ["captures", "tools"]` 结合使用，Aperture 会跳过工具提取，因此由工具调用触发的钩子不会触发。相关控制与操作说明请参阅[隐私与数据保留][docs-aperture-privacy]。

代理透明地处理两个技术难题：

* **压缩**：代理会在存储之前解压以压缩格式（`gzip`、`deflate` 或 Brotli）到达的响应体。
* **流式**：对于流式响应（Server-Sent Events），代理会从事件流重建完整的响应对象，以保证指标提取的一致性。

## 会话跟踪

一个编码任务或一段对话通常涉及多次 LLM 请求。开发者使用 Claude Code 调试一个问题就可能产生 50 个以上的请求。如果不做分组，它们会显示为 50 个互不相关的事件；有了会话跟踪，它们就构成一个可以整体分析的连贯单元。

Aperture 使用客户端提供的标识符识别会话，或者在可能时基于对话内容生成指纹。下表列出常见情况：

| 客户端类型     | 识别方式                                                                       |
| :------------- | :----------------------------------------------------------------------------- |
| Claude Code    | 每个请求体中包含的会话 ID                                                      |
| OpenAI Codex   | 以 HTTP 头部发送的会话 ID                                                      |
| OpenAI Chat    | 基于对话内容生成的指纹                                                         |
| 其他请求       | 每个请求使用一个新的随机 ID，因此每个请求都显示为独立的会话                    |

当 Aperture 能够识别相关请求时，会将它们归入一个会话。用户可以在 Chat 的 [**Sessions** 页面][docs-aperture-chat-sessions]查看自己的会话；管理员可以在管理仪表盘的 [**Logs** 页面][docs-aperture-dashboard-admin-logs]查看整个组织的会话。按会话给请求分组有助于你追溯任务并比较不同对话的成本。Aperture 无法对使用随机回退 ID 的请求进行分组。

## 出站集成

除了路由 LLM 请求，Aperture 还通过连接器代理到外部 MCP 服务器和 HTTP API 的连接。这将网关模型从入站 AI 流量扩展到了出站的工具与服务访问。

连接器支持两种协议。使用 `mcp` 协议时，Aperture 对客户端充当 MCP 服务器，对远程 MCP 服务器充当 MCP 客户端。客户端通过 Aperture 的 MCP 工具列表发现可用工具，无需直接访问远程服务器。使用 `http` 协议时，Aperture 充当带认证的反向代理访问 REST API，转发请求并注入所需凭证。

认证遵循与 LLM 提供商相同的集中管理模式。管理员在 Aperture 配置中为每个连接器一次性配置凭证。当用户或代理通过连接器发起请求时，Aperture 自动注入相应的认证头部。对大多数连接器，单个用户无需在本地工具中单独配置凭证。使用按用户 OAuth 2.0（`oauth2_authorization_code`）的连接器要求每个用户通过 Aperture UI 完成一次授权流程，但生成的令牌由 Aperture 管理，而不是用户的本地工具。

详细设置说明请参阅[连接器功能指南][docs-aperture-connectors]（HTTP API 代理）和 [MCP 服务器代理][docs-aperture-mcp-server]（MCP 相关配置）。

## 后续步骤

* [开始使用 Aperture][docs-aperture-get-started]：注册、配置提供商并接入你的第一个 LLM 客户端。
* [控制 AI 访问][docs-aperture-control-access]：设置授权，定义每个用户可以访问哪些模型。
* [Aperture 授权的工作原理][docs-aperture-how-grants-work]：理解默认拒绝的访问、授权的叠加方式，以及 Aperture 如何解析优先级。
* [观测并导出 AI 使用数据][docs-aperture-observe-and-export]：访问仪表盘并导出使用数据。
* [设置连接器][docs-aperture-connectors]：配置与 MCP 服务器和 HTTP API 的出站集成。
* [隐私与数据保留][docs-aperture-privacy]：选择网关存储哪些内容，并了解请求内容可能流向何处。

[docs-aperture-chat-sessions]: /docs/aperture/reference/chat#会话sessions

[docs-aperture-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-control-access]: /docs/aperture/control-access

[docs-aperture-dashboard-admin-logs]: /docs/aperture/reference/dashboard-admin#日志logs

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grant-model-access]: /docs/aperture/how-to/grant-model-access#授予打标签设备的访问权限

[docs-aperture-how-grants-work]: /docs/aperture/how-grants-work

[docs-aperture-incorrect-user-identity]: /docs/aperture/troubleshooting#所有会话似乎来自同一用户

[docs-aperture-mcp-server]: /docs/aperture/mcp-server

[docs-aperture-model-aliases]: /docs/aperture/model-aliases#别名如何解析

[docs-aperture-observe-and-export]: /docs/aperture/observe-and-export

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-provider-flags]: /docs/aperture/provider-compatibility#兼容性标志

[docs-tags]: /docs/features/tags

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
