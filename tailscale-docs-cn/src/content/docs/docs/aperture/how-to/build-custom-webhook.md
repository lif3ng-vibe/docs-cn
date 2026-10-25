---
title: "构建自定义 webhook"
description: "Aperture 可以通过 webhook 将实时事件数据发送到外部服务，把 LLM 使用数据接入你自己的审计日志、成本仪表盘、安全工具或策略引擎。对于每条"
---

最后验证于 Sep 29, 2026

Aperture 可以通过 webhook 将实时事件数据发送到外部服务，把 LLM 使用数据接入你自己的审计日志、成本仪表盘、安全工具或策略引擎。对每条匹配[授权][docs-aperture-configuration]（控制谁可以使用哪些模型的访问规则）的请求，Aperture 都会 POST 一个 JSON 载荷，其中包含你选择的元数据和数据类型。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个 [Aperture 网关][docs-aperture-get-started]，且至少配置了一个提供商。
* 对 [Aperture 配置][docs-aperture-configuration]的管理员访问权限。
* 一个接受带 JSON 载荷的 POST 请求的 HTTP 或 HTTPS 端点。

## 定义钩子端点

\[Missing snippet: aperture\_admin\_nav.mdx] 在配置中添加 `hooks` 部分。每个钩子都有一个唯一的键，并指定端点 URL：

```json
"hooks": {
  "my-webhook": {
    "url": "https://example.com/aperture-events",
    "apikey": "<api-key>"
  }
}
```

如果你的端点使用非 Bearer 认证方案，请设置 `authorization` 字段：

```json
"hooks": {
  "my-webhook": {
    "url": "https://example.com/aperture-events",
    "apikey": "<api-key>",
    "authorization": "x-api-key",
    "timeout": "10s"
  }
}
```

`authorization` 字段支持 `bearer`（默认）、`x-api-key`、`x-goog-api-key`、`hec` 和 `cf-aig-authorization`。`timeout` 字段接受 Go 时长字符串（例如 `5s`、`30s` 或 `1m`），默认为 `5s`。

> **警告：**
>
> `hooks` 部分定义的钩子在授权引用它之前不会生效。

## 在授权中触发钩子

在 `grants` 部分的某个能力（一组权限，例如允许的模型）中添加 `send_hooks` 条目。它控制哪些请求触发钩子，以及 Aperture 在载荷中包含哪些数据：

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        {
          "models": "**",
          "send_hooks": [
            {
              "name": "my-webhook",
              "events": ["entire_request"],
              "send": ["estimated_cost"]
            }
          ]
        }
      ]
    }
  }
]
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

### 选择钩子事件

`events` 数组指定 Aperture 何时调用钩子：

| 事件                       | 说明                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pre_request`              | 在调用提供商之前触发。同步：Aperture 等待钩子响应。钩子可以允许、拦截或修改请求。                     |
| `entire_request`           | 每条完成的请求都触发。                                                                               |
| `tool_call_entire_request` | 响应完成后触发一次，前提是响应中存在包含工具调用的消息。                                             |

> **注意：**
>
> `pre_request` 事件是同步护栏。`entire_request` 和 `tool_call_entire_request` 在请求完成后异步触发，而 `pre_request` 会阻塞到钩子响应为止，并且可以允许、拦截或修改请求。详情参阅[护栏][docs-aperture-guardrails]。

### 选择数据类型

`send` 数组指定在 POST 载荷中包含哪些数据：

| 类型             | 说明                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `tools`          | 从响应中提取的工具调用数组。                                     |
| `request_body`   | 发送给 LLM 的原始请求体。                                        |
| `user_message`   | 请求中用户的消息。                                               |
| `response_body`  | 重建后的响应体 JSON。                                            |
| `raw_responses`  | 原始 SSE 消息数组（流式场景）或单个响应对象。                    |
| `estimated_cost` | 美元成本估算、计价依据和 token 用量明细。                        |
| `grants`         | 用户授权中非 Aperture 应用的能力。                               |
| `quotas`         | 适用于该请求的所有配额桶的当前状态。                             |

## 查看载荷格式

无论你在 `send` 中指定什么，每次钩子调用都包含一个带请求上下文的 `metadata` 对象：

```json
{
  "metadata": {
    "login_name": "alice@example.com",
    "user_agent": "curl/8.0",
    "url": "/v1/chat/completions",
    "model": "gpt-5.5",
    "provider": "openai",
    "tailnet_name": "example.com",
    "stable_node_id": "n12345",
    "request_id": "abc123",
    "session_id": "oacc_1a2b3c4d5e6f7890"
  }
}
```

当你在 `send` 数组中加入数据类型时，Aperture 会把它们连同 `metadata` 一起放入载荷。例如使用 `"send": ["tools", "estimated_cost"]` 时，载荷会在 `cost_basis` 中包含一个计价查询键。下面的美元金额和 token 数仅用于说明载荷结构，并非报价：

```json
{
  "metadata": {
    "login_name": "alice@example.com",
    "...": "..."
  },
  "estimated_cost": {
    "dollars": 0.0342,
    "cost_basis": "anthropic/claude-sonnet-4-6",
    "usage": {
      "input_tokens": 1500,
      "output_tokens": 800,
      "cached_tokens": 200,
      "reasoning_tokens": 0
    }
  },
  "tool_calls": [...]
}
```

## 验证 webhook

保存配置后，通过 Aperture 发送一条测试 LLM 请求，并确认你的端点收到了 POST 载荷。如果 webhook 没有触发：

1. 确认 `send_hooks` 中的钩子名称与 `hooks` 部分中的键一致。
2. 确认授权的 `src` 和 `models` 模式与你的测试请求匹配。

要在不从配置中删除钩子的情况下临时停用它，请在钩子定义中设置 `"disabled": true`。

## 后续步骤

探索相关的集成与配置选项：

* 浏览 [Aperture 配方][docs-aperture-recipes]查看集成示例，或贡献你自己的集成指南。
* [将使用数据导出到 S3][docs-aperture-export-s3]，长期存储会话日志。
* [将 Cerbos 与 Aperture 集成][docs-aperture-integrate-cerbos]、[将 Highflame 与 Aperture 集成][docs-aperture-integrate-highflame]或[将 Oso 与 Aperture 集成][docs-aperture-integrate-oso]，使用钩子对接策略引擎。
* 完整字段参考与更多示例请参阅[钩子配置参考][docs-aperture-hooks]。
* [用 tsheadroom 降低 Aperture token 成本][docs-reduce-token-costs]：一个端到端示例，把 `pre_request` 钩子作为 tailnet 服务部署。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-guardrails]: /docs/aperture/guardrails

[docs-aperture-hooks]: /docs/aperture/configuration#hooks

[docs-aperture-integrate-cerbos]: /docs/aperture/integrate/cerbos

[docs-aperture-integrate-highflame]: /docs/aperture/integrate/highflame

[docs-aperture-integrate-oso]: /docs/aperture/integrate/oso

[docs-aperture-recipes]: /docs/aperture/reference/recipes

[docs-reduce-token-costs]: /docs/solutions/reduce-aperture-token-costs-with-tsheadroom
