---
title: "集中管理 LLM 访问与支出"
description: "当开发者和 AI 编码 agent 各自使用自己的 LLM API 密钥时，组织就失去了对以下情况的可见性：谁在使用哪些模型、花费了多少、以及向提供商发送了哪些数据"
---

最后验证于 Sep 28, 2026

> **注意：**
>
> 精选参考：
>
> [**Aperture**](/docs/aperture)——使用 Tailscale 出品的 Aperture 监控并保护 LLM 用量。

当开发者和 AI 编码 agent 各自使用自己的 LLM API 密钥时，组织就失去了对以下情况的可见性：谁在使用哪些模型、花费了多少、以及向提供商发送了哪些数据。密钥在团队之间共享、嵌入 CI/CD 流水线、存放在开发者的笔记本电脑上，难以轮换或吊销。

[Tailscale 出品的 Aperture][docs-aperture] 充当 LLM 客户端与上游提供商之间的集中式网关。你只需在一处存放 API 密钥、按用户或团队授予模型访问权限，即可获得每用户用量跟踪以及完整的请求与响应日志，而无需改变开发者使用工具的方式。

## 创建你的 Aperture 网关

1. 在 [`aperture.tailscale.com`][xt-aperture-signup] 注册并按照引导完成设置。设置完成后，Aperture 会作为名为 `ai` 的设备出现在你的 tailnet 中。

   详细的设置说明请参阅[Aperture 入门][docs-aperture-get-started]。

2. 在 `http://ai/admin/settings/providers` 打开 Aperture 管理仪表板。

3. 添加你的 LLM 提供商 API 密钥，让 Aperture 能够代表你的用户转发请求。

   以下示例为 Aperture 同时配置 OpenAI 和 Anthropic 两个提供商：

   ```json
   {
   "providers": {
       "openai": {
       "baseurl": "https://api.openai.com",
       "apikey": "YOUR_OPENAI_KEY",
       "models": ["gpt-5.5", "gpt-5.4-mini"],
       "compatibility": { "openai_chat": true }
       },
       "anthropic": {
       "baseurl": "https://api.anthropic.com",
       "apikey": "YOUR_ANTHROPIC_KEY",
       "authorization": "x-api-key",
       "models": ["claude-sonnet-5-5", "claude-opus-5-5"],
       "compatibility": { "anthropic_messages": true }
       }
   }
   }
   ```

   开发者无需访问或处理提供商凭证。当客户端发送指定模型名称的请求时，Aperture 会将其路由到正确的提供商，并自动注入认证信息。

   如果想让每个客户端转发自己的凭证而非共享密钥（例如使用 Claude Pro 或 ChatGPT Plus 等订阅套餐），可在[直通模式][docs-use-passthrough-mode]下配置该提供商。Aperture 本身不持有也不管理订阅。

   受支持的提供商与配置选项的完整列表，请参阅 [Aperture 配置参考][docs-aperture-configuration]与[受支持的提供商和客户端][docs-aperture-provider-compatibility]。

## 授予用户模型访问权限

Aperture 默认一律拒绝（deny-by-default）：在你明确授予访问权限之前，任何用户都无法访问任何模型。使用 `grants` 部分控制哪些用户或分组可以访问哪些模型。

可以在 Aperture 管理仪表板或你的 [tailnet 策略文件][docs-tailnet-policy-file]中配置授权（grant）。

> **注意：**
>
> 要在 Aperture 授权中使用分组（例如 `group:ml-engineers`），请在你的 tailnet 策略文件中配置[可见分组][docs-visible-groups]，以便 Aperture 网关能够解析分组成员关系。

以下示例通过 tailnet 策略文件授予你的 ML 工程团队访问所有模型的权限，并赋予管理员完全控制权：

```json
"grants": [
  {
    "src": ["group:ml-engineers"],
    "dst": ["tag:aperture"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        { "models": "**" }
      ]
    }
  },
  {
    "src": ["autogroup:admin"],
    "dst": ["tag:aperture"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "admin" },
        { "models": "**" }
      ]
    }
  }
]
```

你可以将 `"**"` 替换为 `provider/model` 格式的模型名称模式，从而将访问限制到特定模型。例如，`"models": "anthropic/claude-*"` 表示仅允许访问所有 Anthropic Claude 模型，其他模型一律不行。

授予访问权限的分步操作请参阅[授予模型访问权限][docs-aperture-grant-model-access]。

## 配置 AI 工具与 CI/CD 流水线

将每个 LLM 客户端指向 Aperture，而不是直接指向提供商。Aperture 依据 [Tailscale 设备身份][docs-tailscale-identity]（而非 API 密钥）识别请求，因此客户端只需使用占位密钥值。

\[Missing snippet: aperture\_tls\_warning.mdx]

### Claude Code

创建或编辑 `~/.claude/settings.json`：

```json
{
  "apiKeyHelper": "echo '-'",
  "env": {
    "ANTHROPIC_BASE_URL": "http://ai"
  }
}
```

`apiKeyHelper` 返回的是占位符，因为 Aperture 会自动注入凭证。其他配置选项（Bedrock、Gemini Enterprise Agent Platform）请参阅[将 Claude Code 与 Aperture 配合使用][docs-aperture-use-claude-code]。

### CI/CD 流水线

对于 GitHub Actions 等 CI/CD 环境，在工作流中设置环境变量：

```yaml
env:
  ANTHROPIC_BASE_URL: http://ai
  ANTHROPIC_API_KEY: "-"
```

CI 运行器必须位于 tailnet 中，此方案才能生效。使用 [Tailscale GitHub Action][docs-tailscale-github-action] 将运行器作为临时节点（ephemeral node）接入，或者在无法安装 Tailscale 的环境中[从 tailnet 外部连接][docs-aperture-without-tailnet]。对于非交互式 CI 任务，`ts-unplug` 提供一个固定的本地端口，脚本可以将其用作 base URL。

### 其他 LLM 客户端

任何支持自定义 base URL 的 LLM 客户端都可以使用 Aperture。将 base URL 设置为 `http://ai`，并使用占位 API 密钥。其他工具的配置指南请参阅[设置 LLM 客户端][docs-aperture-use-your-tools]。

## 监控用量并审查日志

流量经由 Aperture 流转后，打开 `http://ai/admin/` 的管理仪表板即可：

* 跟踪每用户在所有模型和提供商上的 token 用量与费用。
* 查看包含请求与响应详细信息的会话日志。
* 审查 AI agent 发起的工具调用，了解 agent 代表用户执行了哪些操作。

Aperture 会将每个请求归因于发送它的用户或设备的 Tailscale 身份，让你实时掌握整个组织的 LLM 使用情况。

有关仪表板和可用指标的详细信息，请参阅 [Aperture 管理仪表板参考][docs-aperture-dashboard-admin]。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-aperture-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-aperture-use-claude-code]: /docs/aperture/how-to/use-claude-code

[docs-aperture-use-your-tools]: /docs/aperture/use-your-tools

[docs-aperture-without-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-aperture]: /docs/aperture

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-github-action]: /docs/integrations/github/github-action

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-aperture-signup]: https://aperture.tailscale.com

[docs-visible-groups]: /docs/aperture/visible-groups
