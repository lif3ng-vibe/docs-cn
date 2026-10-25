---
title: "设置 LLM 客户端"
description: "配置 LLM 客户端，让请求经由 Aperture 路由。"
---

最后验证于 Sep 29, 2026

在[设置 Aperture][docs-get-started]和[配置提供商][docs-set-up-providers]之后，设置你的 LLM 客户端，让请求经由你的 Aperture 网关路由。

选择一种设置方式：

* 使用 [Aperture CLI][docs-cli] 交互式地配置客户端。
* 从 **Agents** 页面复制[网关生成的配置][ar-gateway-generated-configuration]。
* 按照下方的客户端专用指南进行手动设置和更多选项配置。

在选择客户端之前，请在[受支持的提供商与客户端][docs-provider-compatibility]中把它的 API 要求与你的提供商进行对照。

## 客户端设置指南

[**Aperture CLI**](/docs/aperture/cli)——使用 Aperture CLI 来发现、配置和运行经由你的 Aperture 网关连接的编码代理（coding agent）。

[**设置聊天 UI**](/docs/aperture/how-to/set-up-chat-ui)——配置模型、策展模型选择器，并管理对 Aperture Chat 界面的访问。

[**在 Aperture 中使用 Claude Code**](/docs/aperture/how-to/use-claude-code)——配置 Claude Code，让请求经由你的 Aperture 网关路由。

[**在 Aperture 中使用 Claude Code Action**](/docs/aperture/how-to/use-claude-code-action)——配置 Claude Code GitHub Action，让请求经由 Aperture 路由，使 CI 运行器使用 Tailscale 身份而不是各自的 API 密钥进行认证。

[**在 Aperture 中使用 Claude Desktop**](/docs/aperture/how-to/use-claude-desktop)——配置 Claude Desktop 应用，让 Anthropic Messages 模型推理经由你的 Aperture 网关路由。

[**在 Aperture 中使用 Codex**](/docs/aperture/how-to/use-codex)——配置 OpenAI Codex，让请求经由你的 Aperture 网关路由。

[**在 Aperture 中使用 OpenCode**](/docs/aperture/how-to/use-opencode)——配置 OpenCode，让请求经由你的 Aperture 网关路由。

[**在 Aperture 中使用 OpenAI 兼容工具**](/docs/aperture/how-to/use-openai-compatible-tools)——配置 Roo Code、Cline 以及其他使用 OpenAI 兼容 API 的客户端，让请求经由 Aperture 路由。

## 网关生成的配置

Aperture 网关会根据你有权使用的模型生成客户端设置。可用的客户端和后端取决于你的网关版本、已配置的提供商和模型授权。

开始之前，请安装你想配置的客户端，并把你的设备连接到网关所在的 tailnet。对于 [Kilo Code][xt-kilo] 和 [Grok Build][xt-grok]，请按照该客户端的安装说明操作。

1. 在浏览器中打开你的 Aperture 网关并选择 **Agents**，或访问网关主机上的 `/agents`。
2. 选择你的客户端。如果 **Kilo Code** 或 **Grok** 的卡片最初不可见，请搜索它。只有当网关能为某个客户端生成兼容配置时，该客户端才会出现。
3. 如果该客户端提供多种模式，请选择与你的设置相匹配的 API 密钥、订阅或提供商专用模式。
4. 应用页面上显示的设置：
   * 对基于文件的配置，创建指定名称的文件或合并生成的键。保留无关的设置。
   * 对 GitHub Copilot CLI 这类客户端，把生成的环境变量添加到你的 shell 配置文件中并重新加载。
5. 按照页面上的模型选择和启动说明操作。发送一个测试提示词，然后使用设置页上的验证控件检查 Aperture 是否收到了该请求。

生成的配置专属于你的网关和模型访问权限。当提供商配置或模型授权发生变化时，请重新生成。各平台的文件存放位置请使用设置页上链接的客户端文档查询。

### Kilo Code

在 **Agents** 页面选择 **Kilo Code**。把生成的配置保存为 `kilo.jsonc`，放到你的主配置目录或项目根目录下。详细信息参见 [Kilo Code 自定义模型文档][xt-kilo-models]。重新打开 Kilo Code 并选择一个 Aperture 模型。

网关会为兼容的 API 和模型家族分别生成 AI SDK 提供商块。只有你有权访问的已配置模型才会出现。生成的配置不会使用 ChatGPT 订阅认证。

### Grok Build

在 **Agents** 页面选择 **Grok**。把生成的 TOML 保存或合并到 `~/.grok/config.toml`。用 `grok` 启动客户端，选择一个生成的 Aperture 模型，并发送测试提示词。如果 Grok 在启动时提示输入 xAI API 密钥，为这次启动设置 `XAI_API_KEY=not-needed`。对 Aperture 请求来说，生成的按模型凭证优先。

生成的配置优先使用 OpenAI Chat Completions，只有没有 Chat Completions 路由的模型才使用 Responses。Grok Responses 解码器对响应结构的要求更严格。如果某个响应解码失败，请选择可通过 Chat Completions 使用的模型。此设置不配置 Anthropic Messages、原生 Google API 或 Bedrock API。

### 其他生成的配置

**Agents** 页面还会为 Claude Code、Codex、OpenCode、GitHub Copilot CLI、Pi 和 Hermes 生成设置。按照所选客户端显示的说明操作。特别注意：

* **GitHub Copilot CLI** 使用 shell 配置文件中的环境变量，而不是 JSON 配置文件。
* **Pi** 使用 `~/.pi/agent/models.json`。[CLI 启动器][docs-cli-pi]则使用临时扩展。
* **Hermes** 使用 `~/.hermes/config.yaml`。把生成的块合并进你现有的文件。

网关生成的配置和 CLI 启动器对同一个客户端可能使用不同的 API，OpenCode、Pi 和 Hermes 尤其如此。请在[客户端兼容性表][docs-client-compatibility]中比较它们的后端。

\[Missing snippet: tailscale\_skill.mdx]

[ar-gateway-generated-configuration]: #网关生成的配置

[docs-client-compatibility]: /docs/aperture/reference/supported-providers-clients#clients-and-agent-harnesses

[docs-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-cli]: /docs/aperture/cli

[docs-cli-pi]: /docs/aperture/cli#pi

[xt-kilo]: https://kilo.ai/docs

[xt-kilo-models]: https://kilo.ai/docs/code-with-ai/agents/custom-models

[xt-grok]: https://docs.x.ai/build/overview
