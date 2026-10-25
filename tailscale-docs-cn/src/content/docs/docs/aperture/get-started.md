---
title: "Aperture 入门"
description: "注册 Aperture、配置提供商，并发送你的第一个请求。"
---

最后验证于 Sep 29, 2026

[开始使用 Aperture](https://aperture.tailscale.com/)

> **注意：**
>
> 你可以直接在 Aperture 内购买 token。如果你在个人版 Tailscale 套餐以外的套餐上想用你自己的 API 密钥搭配 Aperture，请[联系销售][co-contact-sales]。

注册 Aperture、配置一个 LLM 提供商，并发送一个测试请求。想了解 Aperture 是做什么的，参阅 [Aperture 是什么？][docs-what-is-aperture]。

## 前提条件

开始之前，请确认已具备以下条件：

* **来自 LLM 提供商开发者平台的 API 密钥。** Aperture 支持 OpenAI、Anthropic、Google Gemini、OpenRouter、Amazon Bedrock、Gemini Enterprise Agent Platform 和 [OpenAI 兼容提供商][docs-use-openai-compatible-provider]。API 格式和设置要求参阅[受支持的提供商与客户端][docs-provider-compatibility]。从提供商的开发者门户获取 API 密钥（例如 [Anthropic Console][xt-anthropic-console]、[OpenAI Platform][xt-openai-platform] 或 [Google AI Studio][xt-google-ai-studio]）。

  > **注意：**
  >
  > 也可以通过 [passthrough 模式][docs-use-passthrough-mode]使用订阅套餐。Claude Pro、ChatGPT Plus 或 Gemini Advanced 等套餐发放的是 OAuth token 而非开发者 API 密钥。Aperture 会转发客户端的 `Authorization` 或 `x-api-key` 头；客户端两个头都没发时，Aperture 使用配置的提供商密钥。

* **一台已连接到你 tailnet 的设备。** Aperture 在你的 [tailnet][docs-tailnet] 中监听 `http://<aperture-hostname>`。你的设备必须运行 Tailscale，并与 Aperture 网关连接同一个 tailnet。如果需要连接不在 tailnet 内的设备，参阅[连接 tailnet 之外的设备][docs-connect-outside-tailnet]。

## 第 1 步：注册 Aperture

1. 访问 [`aperture.tailscale.com`][xt-aperture-signup] 并填写注册表单。没有 Tailscale 账户时，注册过程会为你免费创建一个。
2. 打开 `http://<aperture-hostname>/`，确认 Aperture web 门户可以加载。如果你是 Aperture 管理员，还可以在 `http://<aperture-hostname>/admin/` 打开管理仪表板。

## 第 2 步：配置 LLM 提供商

添加提供商是管理员任务。可以使用可视化的 **Providers** 页面或 JSON **Configuration** 编辑器。

**可视化编辑器**：\[Missing snippet: aperture\_admin\_nav.mdx] 通过表单界面填写提供商名称、base URL、API 密钥和模型列表。

**JSON 编辑器**：\[Missing snippet: aperture\_admin\_nav.mdx] 直接粘贴或编写配置。以下示例配置 Anthropic 和两个 Claude 模型：

```json
{
  "providers": {
    "anthropic": {
      "baseurl": "https://api.anthropic.com",
      "apikey": "<anthropic-api-key>",
      "models": [
        "claude-sonnet-5-5",
        "claude-opus-5-5"
      ],
      "authorization": "x-api-key",
      "compatibility": {
        "anthropic_messages": true
      }
    }
  }
}
```

各提供商的具体说明参阅[设置 LLM 提供商][docs-set-up-providers]。全部可用设置参阅[配置参考][docs-aperture-configuration]。

> **注意：**
>
> [默认配置][docs-aperture-default-configuration]包含订阅 passthrough 提供商，而不是共享 API 密钥。要使用你自己的 API 密钥，请按上文方式配置一个提供商。

## 第 3 步：发送测试请求

以下示例使用网关中配置的共享提供商密钥。Anthropic 示例与第 2 步对应。要使用 OpenAI 示例，请配置一个支持其 API 格式和模型的提供商。

对没有回退密钥的 passthrough 提供商，你还必须随请求发送提供商凭证。所需 `Authorization` 或 `x-api-key` 头请按 [passthrough 设置说明][docs-use-passthrough-mode]操作。

**Anthropic API 格式**：

```shell
curl -s http://<aperture-hostname>/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-5-5",
    "max_tokens": 25,
    "messages": [{"role": "user", "content": "respond with: hello"}]
  }'
```

**OpenAI Chat Completions API 格式**：

```shell
curl -s http://<aperture-hostname>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "respond with: hello"}]
  }'
```

**OpenAI Responses API 格式**：

```shell
curl -s http://<aperture-hostname>/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": [{"role": "user", "content": "respond with: hello"}]
  }'
```

请求成功即说明 Aperture 正在路由到你的提供商。打开 `http://<aperture-hostname>/sessions` 的 **Sessions**，可在你的个人历史中找到该请求。Aperture 管理员也可以在[管理仪表板的 **Logs** 页面][docs-admin-logs]上查看。

> **注意：**
>
> 如果你的设备不在 tailnet 内，请[通过 Aperture CLI 桥接或 `ts-unplug` 连接][docs-connect-outside-tailnet]，并把上面示例中的 `http://<aperture-hostname>` 替换为 `http://localhost:<port-number>`。

## 后续步骤

测试请求成功后：

* [授予用户模型访问权限][docs-grant-model-access]，让团队成员能通过 Aperture 发送请求。
* [设置 LLM 客户端][docs-use-your-tools]，把 Claude Code 或 Codex 等工具的流量路由到 Aperture。
* [使用 Aperture Chat][docs-chat]，让用户直接在浏览器里和模型对话。
* [设置支出限额][docs-manage-spending]，控制整个组织的成本。
* 团队成员需要从 tailnet 外的设备访问时，[连接 tailnet 之外的设备][docs-connect-outside-tailnet]。
* [代理 MCP 服务器和 HTTP API][docs-aperture-connectors]，让 AI 智能体通过 Aperture 获得对外部工具的认证访问。

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-default-configuration]: /docs/aperture/configuration#default-configuration

[docs-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-manage-spending]: /docs/aperture/manage-spending

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-tailnet]: /docs/concepts/tailnet

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider

[docs-admin-logs]: /docs/aperture/reference/dashboard-admin#日志logs

[docs-chat]: /docs/aperture/reference/chat

[docs-what-is-aperture]: /docs/aperture/what-is-aperture

[xt-anthropic-console]: https://console.anthropic.com

[xt-aperture-signup]: https://aperture.tailscale.com

[xt-google-ai-studio]: https://aistudio.google.com

[xt-openai-platform]: https://platform.openai.com

[docs-use-openai]: /docs/aperture/how-to/use-openai
