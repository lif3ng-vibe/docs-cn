---
title: "提供商配置"
description: "Aperture 提供商兼容性标志、认证方式、凭证来源、自定义 header 和成本估算的参考。"
---

最后验证于 Sep 29, 2026

本参考涵盖 Aperture 中的提供商兼容性标志、认证方式和成本估算。

提供商 API 格式、设置链接和要求，请参阅"受支持的提供商和客户端"中的[提供商矩阵][docs-provider-matrix]。

客户端 API 格式和设置要求，请参阅[客户端与 agent 框架][docs-client-matrix]。

兼容性限制和通用集成方式，请参阅[限制][docs-compatibility-limitations]和[其他提供商与客户端][docs-other-integrations]。

## 兼容性标志

提供商配置中的 `compatibility` 对象指定该提供商支持哪些 API 格式。这些标志决定 Aperture 为该提供商的模型开放哪些端点。

| 标志                      | 类型    | 默认值                       | 描述                                                                                           |
| ------------------------- | ------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `openai_chat`             | boolean | 未启用其他标志时为 `true`             | 支持 `/v1/chat/completions`。与其他标志同时使用时需显式设置以保留或禁用。                       |
| `openai_responses`        | boolean | `false`                               | 支持 `/v1/responses`                                                                           |
| `anthropic_messages`      | boolean | `false`                               | 支持 `/v1/messages`                                                                            |
| `gemini_generate_content` | boolean | `false`                               | 支持直连 Gemini API（`generativelanguage.googleapis.com`）                                     |
| `bedrock_model_invoke`    | boolean | `false`                               | 支持 Amazon Bedrock InvokeModel。请求格式取决于模型家族。                                       |
| `google_generate_content` | boolean | `false`                               | 支持 Gemini Enterprise Agent Platform 的 Gemini 格式（`aiplatform.googleapis.com`）            |
| `google_raw_predict`      | boolean | `false`                               | 支持 Gemini Enterprise Agent Platform 对 Anthropic 模型的 raw predict                          |
| `bedrock_converse`        | boolean | `false`                               | 支持 Amazon Bedrock Converse API 格式                                                          |

为提供商支持的每种 API 格式启用相应标志。例如，Gemini Enterprise Agent Platform 提供商可以为 Gemini 模型和 Anthropic 模型分别使用不同的标志。

如果你启用了其他标志而省略 `openai_chat`，Aperture 会禁用 Chat Completions。设置 `"openai_chat": true` 可保持启用，设置 `"openai_chat": false` 可显式禁用。

## 其他提供商字段

提供商还支持以下可选字段。全部提供商字段请参阅 [Aperture 配置参考][docs-aperture-configuration]。

| 字段          | 类型    | 默认值  | 描述                                                                                                                                                   |
| ------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `description` | string  | `""`    | 提供商的人类可读描述。                                                                                                                                 |
| `preference`  | integer | `0`     | 路由优先级。多个提供商提供同一模型时，值越高越优先。                                                                                                    |
| `disabled`    | boolean | `false` | 将提供商从路由和 `/v1/models` 端点中排除。使用此字段可临时禁用提供商而无需删除其配置。                                                                  |

## 认证类型

`authorization` 字段选择上游 header 格式。Anthropic 使用 `x-api-key`，直连 Google Gemini 使用 `x-goog-api-key`。[提供商矩阵][docs-provider-matrix]中的其他具名提供商使用 `bearer`，这也是通用和自托管提供商的默认值。

| 取值                   | header 格式                          | 使用方                      |
| ---------------------- | ------------------------------------ | --------------------------- |
| `bearer`               | `Authorization: Bearer <key>`        | OpenAI 及大多数提供商       |
| `x-api-key`            | `x-api-key: <key>`                   | Anthropic                   |
| `x-goog-api-key`       | `x-goog-api-key: <key>`              | Google Gemini               |
| `hec`                  | `Authorization: Splunk <key>`        | Splunk HTTP Event Collector |
| `cf-aig-authorization` | `cf-aig-authorization: Bearer <key>` | Cloudflare AI Gateway       |

\[缺失片段：aperture\_provider\_auth\_note.mdx]

### 凭证来源

`auth_mode` 字段选择 Aperture 是使用已配置的 `apikey` 还是客户端自己的凭证。它与设置 header 格式的 `authorization` 相互独立。

| 取值           | 行为                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `""`（默认）   | 在每个请求中注入已配置的 `apikey`。                                                                                                                                      |
| `override`     | 默认值的显式形式。注入已配置的 `apikey`。要求 `apikey` 非空，否则配置保存失败。                                                                                          |
| `passthrough`  | 把客户端自己的 `Authorization` 或 `x-api-key` header 原样转发给上游。仅在客户端未发送凭证时才回退到已配置的 `apikey`。                                                    |
| `none`         | 剥离所有上游凭证，适用于不需要凭证的提供商。                                                                                                                             |

没有 `apikey` 的 `passthrough` 提供商是纯透传（passthrough-only）提供商。其模型会出现在 `/v1/models` 中，但不会出现在内置聊天中，因为聊天请求没有可供转发的客户端凭证。设置说明（包括订阅套餐的 OAuth token）请参阅[设置透传模式][docs-use-passthrough-mode]。

### 自定义 header

某些提供商需要在标准 `authorization` 字段之外的额外 header。在提供商上使用 `add_headers`，让 Aperture 发送给该提供商的每个请求都带上自定义 header。每个条目都是 `"Header-Name: value"` 格式的字符串：

```json
{
  "providers": {
    "example-provider": {
      "baseurl": "https://api.example.com",
      "apikey": "<your-key>",
      "authorization": "bearer",
      "models": ["model-name"],
      "add_headers": [
        "Custom-Header: value"
      ]
    }
  }
}
```

## 成本基准

Aperture 会估算每个 LLM 请求的美元成本。这些估算用于配额扣减、hook 元数据，以及 Chat 中 [**Models** 页面][docs-chat-models]上的按模型定价。

Aperture 分两步自动推断定价。它先把 `baseurl` 主机与已知网关主机比对。`openrouter.ai` 映射到 `openrouter`，`ai-gateway.vercel.sh` 映射到 `vercel`。如果主机不匹配，Aperture 会回退到提供商的 `compatibility` 标志。例如 `anthropic_messages` 映射到 Anthropic 定价。

对于区域价格来源（如 `bedrock-eu` 或 `azure-eu`）或自定义网关主机，请显式设置 `cost_basis`。

Gemini Enterprise Agent Platform 使用 `vertex`，两种 Microsoft Foundry 提供商类型都使用 `azure`。通用和自托管提供商没有专属定价来源。在默认 Chat Completions 兼容性下，它们回退到 `openai`。当其模型名称不在该定价来源中时，请使用[模型成本映射][ar-model-cost-map]。

| `cost_basis` 取值  | 定价来源                                      |
| ------------------ | --------------------------------------------- |
| `anthropic`        | Anthropic API 官方定价                        |
| `openai`           | OpenAI API 官方定价                           |
| `google`           | Google Gemini API 官方定价                    |
| `bedrock`          | AWS Bedrock 定价（美国费率，默认）            |
| `bedrock-us`       | AWS Bedrock 美国区域定价                      |
| `bedrock-eu`       | AWS Bedrock 欧盟区域定价                      |
| `bedrock-ap`       | AWS Bedrock 亚太区域定价（使用美国费率）      |
| `vertex`           | Gemini Enterprise Agent Platform 定价         |
| `azure`            | Azure OpenAI 标准定价                         |
| `azure-eu`         | Azure OpenAI 欧盟区域定价                     |
| `openrouter`       | OpenRouter 定价                               |
| `vercel`           | Vercel AI Gateway 定价                        |

要在全局禁用自动推断，请在配置顶层把 `auto_cost_basis` 设置为 `false`。

```json
{
  "auto_cost_basis": false,
  "providers": {
    "anthropic": {
      "cost_basis": "anthropic"
    }
  }
}
```

`auto_cost_basis` 为 `false` 时，Aperture 只为显式设置了 `cost_basis` 的提供商估算 token 成本。上游网关直接上报的成本仍然可用。

### 模型成本映射

如果某个模型不在定价数据库中，请使用 `model_cost_map` 把它的名称映射到一个已知模型：

```json
{
  "providers": {
    "anthropic": {
      "cost_basis": "anthropic",
      "model_cost_map": [
        {"match": "custom-opus-*", "as": "claude-opus-4-8"},
        {"match": "claude-*-preview*", "as": "claude-sonnet-4-6", "adjustment": 1.1}
      ]
    }
  }
}
```

此示例用 `claude-opus-4-8` 定价条目为假想的 `custom-opus-*` 模型计价，用 `claude-sonnet-4-6` 定价条目加 10% 的上浮为预览版模型计价。这些只是示意性估算，并不表示这些模型的价格真的等值。请根据你的上游模型选择合适的定价目标和调整系数。

每个条目接受以下字段：

| 字段         | 类型   | 默认值     | 描述                                                                                                                                                               |
| ------------ | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `match`      | string | （必填）   | 针对模型名称的 glob 模式。使用 Go 的 `path.Match` 语法，`*` 匹配任意序列的非分隔符字符，`?` 匹配单个字符。                                                          |
| `as`         | string | （必填）   | 用于定价查询的替换模型名称。                                                                                                                                       |
| `adjustment` | float  | `1.0`      | 价格乘数。值为 `1.5` 表示上浮 50%。                                                                                                                                |

Aperture 使用第一个匹配的条目。

## 相关内容

* 完整的配置架构请参阅 [Aperture 配置参考][docs-aperture-configuration]。
* 分步的提供商设置说明请参阅[设置 LLM 提供商][docs-set-up-providers]指南。
* 配置编码智能体 通过 Aperture 连接的说明请参阅[设置 LLM 客户端][docs-use-your-tools]指南。
* 自动化客户端配置请参阅 [Aperture CLI][docs-cli]。
* 连接和请求失败问题请参阅 [Aperture 故障排除][docs-troubleshooting]。

[ar-model-cost-map]: #模型成本映射

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-cli]: /docs/aperture/cli

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools

[docs-chat-models]: /docs/aperture/reference/chat#模型models

[docs-client-matrix]: /docs/aperture/reference/supported-providers-clients#客户端与-agent-框架

[docs-compatibility-limitations]: /docs/aperture/reference/supported-providers-clients#限制

[docs-other-integrations]: /docs/aperture/reference/supported-providers-clients#其他提供商与客户端

[docs-provider-matrix]: /docs/aperture/reference/supported-providers-clients#提供商矩阵
