---
title: "将 Highflame 与 Aperture 集成"
description: "[Highflame][xt-highflame] 是一个面向 AI 工作负载的安全与可观测性平台。将 Aperture 连接到 Highflame 后，你可以在数据到达提供商之前强制执行请求策略，并观察 "
---

最后验证于 Jul 2, 2026

[Highflame][xt-highflame] 是一个面向 AI 工作负载的安全与可观测性平台。将 Aperture 连接到 Highflame 后，你可以在数据到达提供商之前强制执行请求策略，并在请求完成后对其进行观察，用于审计和威胁检测。

Aperture 通过 [hook 系统][docs-configuration-hooks]向 Highflame 发送数据。你需要为你的 Highflame 部署配置一个 hook 端点，并创建一个授权（grant），指定哪些请求触发该 hook 以及包含哪些数据。

> **注意：**
>
> Highflame 通过同一个端点和 API 密钥，同时支持用于强制管控的同步 hook（`pre_request`）和用于可观测的异步 hook（`tool_call_entire_request` / `entire_request`）。你可以根据需要使用其中一种或两种模式。如果不想用 Highflame、想要独立的请求前护栏，请参阅 [guardrails][docs-guardrails]。

## 前提条件

开始之前，你需要具备以下条件：

* 一个正在运行且可从你的设备访问的 [Aperture 网关][docs-get-started]。
* 一个带 API 密钥的 [Highflame][xt-highflame] 账户。你可以从 [Highflame 控制台][xt-highflame-console]生成 API 密钥。

## 配置 Highflame hook

在 Aperture 中配置一个指向你的 Highflame 端点的 hook。该 hook 会将请求数据发送给 Highflame，用于强制管控或观察。

1. \[缺失片段：aperture\_admin\_nav.mdx]
2. 在 `hooks` 部分添加一个 `highflame` 条目，填入你的 Highflame 端点 URL 和 API 密钥。

   ```json
   "hooks": {
       "highflame": {
           "url": "<highflame-endpoint-url>",
           "apikey": "<highflame-api-key>",
           "timeout": "1s",
           "fail_policy": "fail_closed"
       }
   }
   ```

   将 `<highflame-endpoint-url>` 替换为你的 Highflame 端点的 URL，将 `<highflame-api-key>` 替换为来自 Highflame 控制台的 API 密钥。

   * `timeout` 设置 Aperture 等待响应的最长时间。对于 `pre_request` hook，请保持较短的值（500 毫秒到 2 秒），以限制客户端可见延迟。异步 hook 对延迟不敏感，但设置超时可以避免连接停滞。
   * `fail_policy` 控制 Aperture 无法访问端点时的行为。`fail_closed` 会在 Highflame 不可用时拦截请求，适合将 Highflame 用于强制管控的场景。如果你希望 Highflame 宕机时请求仍继续，或者你只用 Highflame 做异步可观测，请使用 `fail_open`。

添加 hook 后，继续在 JSON 编辑器中操作，使用一个授权将它接入传入请求。

## 将 hook 接入授权

使用带有 `send_hooks` 条目的授权，将 Highflame hook 接入传入请求。Highflame 支持三种模式，取决于你需要强制管控、可观测，还是两者都要。

### 同步强制管控（pre\_request）

使用 `pre_request` 让 Highflame 在请求到达提供商之前进行检查。Highflame 对每个请求返回 `allow` 或 `block`（绝不会返回 `modify`）。

```json
"grants": [
    {
        "src": ["*"],
        "app": {
            "tailscale.com/cap/aperture": [
                {
                    "send_hooks": [
                        {
                            "name": "highflame",
                            "events": ["pre_request"],
                            "send": ["request_body", "user_message"]
                        }
                    ]
                }
            ]
        }
    }
]
```

`send` 数组控制 Aperture 在 hook 负载中包含哪些数据。`request_body` 是完整的请求体，`user_message` 是用户发送的最后一条消息。

### 异步可观测（tool\_call\_entire\_request）

使用 `tool_call_entire_request` 或 `entire_request`，在响应完成后将已完成的请求数据发送给 Highflame，用于审计和威胁检测。异步 hook 不会拦截或修改请求。

```json
"grants": [
    {
        "src": ["*"],
        "app": {
            "tailscale.com/cap/aperture": [
                {
                    "send_hooks": [
                        {
                            "name": "highflame",
                            "events": ["tool_call_entire_request"],
                            "send": ["tools", "user_message", "request_body", "response_body"]
                        }
                    ]
                }
            ]
        }
    }
]
```

异步 hook 会包含额外的数据：`tools` 包含请求中的工具声明，`response_body` 是来自提供商的完整响应。使用 `tool_call_entire_request` 只为包含工具调用的请求发送数据，使用 `entire_request` 则为所有请求发送数据。

### 强制管控与可观测并用

要同时使用两种模式，请在同一个授权中包含两个 `send_hooks` 条目。两者引用同一个 `highflame` hook 定义。

```json
"grants": [
    {
        "src": ["*"],
        "app": {
            "tailscale.com/cap/aperture": [
                {
                    "send_hooks": [
                        {
                            "name": "highflame",
                            "events": ["pre_request"],
                            "send": ["request_body", "user_message"]
                        },
                        {
                            "name": "highflame",
                            "events": ["tool_call_entire_request"],
                            "send": ["tools", "user_message", "request_body", "response_body"]
                        }
                    ]
                }
            ]
        }
    }
]
```

\[缺失片段：aperture\_grant\_dst\_note.mdx]

添加授权后，保存配置。

\[缺失片段：aperture\_hooks\_config\_ref.mdx]

## 验证集成

配置好 Highflame hook 后，请验证 Aperture 正在向 Highflame 发送数据，且 Highflame 正在正确处理这些数据。

1. 通过 Aperture 发送一个符合你的授权条件的请求。如果使用 `tool_call_entire_request`，请求必须包含工具调用才能触发该 hook。
2. 如果使用 `pre_request` 模式，确认请求按你的 Highflame 策略预期被放行或拦截。
3. 打开 [Highflame 控制台][xt-highflame-console]，确认请求数据已出现在仪表板中。
4. 如果使用异步模式，确认已完成的请求数据（如适用，包括工具调用）在响应完成后出现。

\[缺失片段：aperture\_verify\_hook\_wiring.mdx]

## 故障排除

| 现象                                           | 原因                                                                              | 处理办法                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 请求未被拦截直接通过                          | hook 使用的是 `entire_request` 或 `tool_call_entire_request`，而非 `pre_request`   | 异步 hook 无法拦截请求。要强制管控请改用 `pre_request`。                                                                         |
| Highflame 返回超时错误                        | `timeout` 值相对于你的网络路径过短                                                | 调大 hook 定义中的 `timeout` 值。对于 `pre_request` hook，请保持在 2 秒以内，以限制客户端可见延迟。                              |
| Highflame 不可达时请求被拦截                  | `fail_policy` 设置为 `fail_closed`                                                | 如果 Highflame 不可用时请求仍应继续，请改为 `fail_open`。如果强制管控是硬性要求，请保留 `fail_closed`。                          |
| 异步数据缺少工具调用细节                      | `send` 数组未包含 `tools` 或 `response_body`                                      | 在授权的 `send_hooks` 条目中的 `send` 数组里添加所需字段。                                                                       |
| API 密钥被 Highflame 拒绝                     | API 密钥已过期，或属于其他环境                                                    | 从 [Highflame 控制台][xt-highflame-console]生成新的 API 密钥，并更新 hook 定义中的 `apikey` 字段。                              |

## 安全注意事项

将 Aperture 连接到 Highflame 时，请求内容（包括用户消息、工具调用和响应体）会离开 Aperture，被发送到 Highflame 端点。请考虑以下几点：

* **内容暴露**。授权中的 `send` 数组控制 Highflame 能收到哪些数据。只包含你的使用场景下 Highflame 所需的数据类型。对于仅强制管控的配置，`request_body` 和 `user_message` 就足够了。
* **API 密钥保管**。妥善保管 Highflame API 密钥。Aperture 会将该密钥存储在配置中，并在每次 hook 请求中作为 header 发送。请定期从 [Highflame 控制台][xt-highflame-console]轮换密钥。
* **网络路径**。hook 请求经由你的 tailnet 传输。请确保 Highflame 端点可从你的 Aperture 网关访问，且没有中间服务记录或缓存请求负载。
* **数据范围**。使用授权中的 `src` 字段限制 Aperture 将哪些用户的请求发送给 Highflame。避免发送不受你的强制管控或可观测策略约束的用户的数据。
* **本地留存**。Aperture 发送给 Highflame 的内容与它在磁盘上留存的内容是两回事。如果你要求 Aperture 绝不在磁盘上存储提示或响应内容，请参阅[配置零留存模式][docs-aperture-zero-retention]和[隐私与数据留存][docs-aperture-privacy]。
* **第三方处理**。Highflame 是第三方服务。当 Aperture 向它转发请求数据时，Highflame 对这些数据的使用受你与 Highflame 之间协议的约束，而非你与 Tailscale 之间的协议。

## 后续步骤

\[缺失片段：aperture\_hooks\_next\_steps.mdx]

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[docs-configuration-hooks]: /docs/aperture/configuration#hooks

[docs-get-started]: /docs/aperture/get-started

[docs-guardrails]: /docs/aperture/guardrails

[xt-highflame-console]: https://console.highflame.com/

[xt-highflame]: https://www.highflame.com/
