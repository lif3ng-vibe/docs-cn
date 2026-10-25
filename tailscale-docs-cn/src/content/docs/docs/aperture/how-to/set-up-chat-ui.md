---
title: "设置聊天界面"
description: "Aperture Chat 默认在 `/` 和 `/chat` 对获得授权的用户开放。"
---

最后验证于 Sep 29, 2026

Aperture Chat 默认在 `/` 和 `/chat` 对获得授权的用户开放。

要让聊天可用，需要配置：

* **模型**：给用户一条 `models` 授权，覆盖至少一个提供商声明了聊天兼容 API 的模型。
* **（可选）内容甄选**：收窄聊天模型选择器中出现的模型，并为其添加标签。

没有 `models` 授权时，门户能加载但模型选择器是空的。你也可以通过禁用门户访问，让匹配的非管理员用户只能使用 API。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-get-started]。
* Aperture 管理仪表盘的[管理员访问权限][docs-set-up-admin-access]。
* 已能[通过你的 tailnet 连到 Aperture 网关][docs-grant-model-access]的用户。

## 第 1 步：授予模型访问权限

授予用户访问至少一个提供商支持聊天兼容 API 的模型。

授权位于 `tailscale.com/cap/aperture` 能力之下。\[Missing snippet: aperture\_admin\_nav.mdx] 添加一条授权：

```json
{
  "src": ["alice@example.com", "group:ai-users"],
  "app": {
    "tailscale.com/cap/aperture": [
      { "role": "user" },
      { "models": "anthropic/**" }
    ]
  }
}
```

`models` glob 指定用户可以访问哪些模型。完整模式语法请参阅[授予模型访问权限][docs-grant-model-access]。

要让匹配的非管理员用户只能使用 API，在其授权中添加 `enable_portal` 并设为 `false`。这会禁用整个用户门户，包括聊天。管理员始终保留门户访问。如果任何匹配授权显式把 `enable_portal` 设为 `true`，即使另一条匹配授权设为 `false`，门户访问仍保持启用。

组匹配需要为 Aperture 网关启用[可见组][docs-visible-groups]。

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## 第 2 步：配置支持聊天的提供商

只有当模型所属的提供商在 `compatibility` 块中声明了聊天 API 时，该模型才会出现在聊天界面中。至少配置一个带有以下开关之一的提供商：

| 兼容性开关                | 路由到                                    |
| :------------------------ | :---------------------------------------- |
| `anthropic_messages`      | Anthropic Messages API                    |
| `openai_chat`             | OpenAI Chat Completions                   |
| `openai_responses`        | OpenAI Responses API                      |
| `gemini_generate_content` | Gemini                                    |
| `google_generate_content` | Gemini Enterprise Agent Platform (Gemini) |

下面的示例为聊天界面配置一个 Anthropic 提供商：

```json
{
  "providers": {
    "anthropic": {
      "name": "Anthropic",
      "baseurl": "https://api.anthropic.com",
      "apikey": "<your-anthropic-key>",
      "authorization": "x-api-key",
      "models": ["claude-opus-5-5", "claude-sonnet-5-5"],
      "compatibility": { "anthropic_messages": true }
    }
  }
}
```

聊天请求来自 Aperture 网关，没有可转发的客户端凭证。[直通模式][docs-use-passthrough-mode]下且没有回退 `apikey` 的提供商是仅直通的，其模型不会出现在聊天中。配置一个回退 `apikey` 即可让这些模型可用。

设置说明请参阅[设置 LLM 提供商][docs-set-up-providers]。API 与要求的对比请参阅[支持的提供商与客户端][docs-provider-compatibility]。

## （可选）第 3 步：管理模型选择器

默认情况下，模型选择器列出用户通过授权可访问的每个聊天兼容模型。要收窄列表或重新标注模型，请在 Aperture 配置中设置顶层 `chat_models` 列表。列表非空时，模型必须匹配其中某个条目才会出现在选择器中。

```json
{
  "chat_models": [
    { "model": "anthropic/**", "display_name": "Claude", "priority": 100 },
    { "model": "openai/**", "title_gen": true },
    { "model": "*/internal-*", "hidden": true }
  ]
}
```

每个条目接受一个 `provider/model` 格式的 `model` glob，以及以下可选字段：

* `display_name`：模型选择器中显示的标签，代替模型 ID。
* `priority`：选择器中的排序。值越大越靠前。
* `title_gen`：使用该模型生成会话标题。
* `summarize`：使用该模型总结思维链片段。
* `hidden`：把匹配的模型从选择器中排除，但仍允许其用于 `title_gen` 和 `summarize`。适合把某个模型保留给后台任务而不向用户开放回复。

`chat_models` 只是甄选列表，不授予访问：只有用户的 `models` 授权覆盖某个模型时，它才会出现在选择器中。你也可以在 Aperture 管理仪表盘 `/admin/settings/chat` 的 **Administration** > **Chat** > **Models** 中编辑该列表。

模型别名不会向选择器添加条目。`chat_models` 中请使用 `provider/model` ID 或模式，而不是别名名称。选择器的限制与名称冲突风险请参阅[模型别名][docs-model-aliases]。

## 验证访问权限

配置好访问、提供商和甄选后，验证聊天界面可用：

1. 让获得授权的用户打开 Aperture 网关上的 `/` 或 `/chat`。模型选择器应列出甄选后的模型。
2. 发送一条测试消息，确认能收到回复。

如果模型选择器为空，检查用户的 `models` 授权是否覆盖了一个提供商声明了聊天 `compatibility` 开关的模型。

如果用户无法打开聊天界面，确认其授权没有把 `enable_portal` 设为 `false`。诊断访问问题请参阅 [Aperture 故障排除][docs-troubleshooting]。

## 监控聊天使用情况

Aperture 管理仪表盘包含一个仅管理员可见的 **Chat Activity** 页面，位于 `/admin/adoption/chat-activity`。

## 后续步骤

* [授予模型访问权限][docs-grant-model-access]：细化每个用户或组可以访问哪些模型。
* [设置按用户的支出限额][docs-set-per-user-spending-limits]：管理成本。
* 仅管理员可见页面的细节请参阅 [Aperture 管理仪表盘参考][docs-admin-console]。
* 模型选择器的行为请参阅[模型与推理选择][docs-chat-models]。

[docs-admin-console]: /docs/aperture/reference/dashboard-admin

[docs-chat-models]: /docs/aperture/reference/chat#model-and-reasoning-selection

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-visible-groups]: /docs/aperture/visible-groups
