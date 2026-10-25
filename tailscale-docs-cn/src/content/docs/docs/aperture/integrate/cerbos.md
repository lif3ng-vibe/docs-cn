---
title: "将 Cerbos 与 Aperture 集成"
description: "[Cerbos][xt-cerbos] 是一个策略引擎，提供细粒度、上下文感知的授权。将 Aperture 连接到 Cerbos 后，你可以把 LLM 请求数据发送给 Cerbos，由它对 AI 使用强制执行授权策"
---

最后验证于 Jun 26, 2026

[Cerbos][xt-cerbos] 是一个策略引擎，提供细粒度、上下文感知的授权。将 Aperture 连接到 Cerbos 后，你可以把 LLM 请求数据发送给 Cerbos，由它对 AI 使用强制执行授权策略，例如控制哪些用户可以访问特定模型或工具。

Aperture 通过 [hook 系统][docs-configuration-hooks]向 Cerbos 发送数据。你需要为 Cerbos 部署配置一个 hook 端点，并创建一个授权（grant），指定哪些请求触发该 hook 以及包含哪些数据。

Cerbos 是第三方服务。当 Aperture 将请求数据转发给它时，Cerbos 对这些数据的使用受你与 Cerbos 之间协议的约束，而非你与 Tailscale 之间的协议。

\[缺失片段：aperture\_async\_hook\_note.mdx]

## 前提条件

开始之前，请确保你具备以下条件：

* 一个正在运行且可从你的设备访问的 [Aperture 网关][docs-get-started]。
* 一个 [Cerbos][xt-cerbos] 部署（自托管或 Cerbos Hub），具有可接收 webhook 数据的 API 端点。

## 配置 Cerbos 端点

要将 Cerbos 与 Aperture 集成，请配置 Cerbos 端点，使其可在 Aperture 中用作 hook，并设置一个授权来向该 hook 发送请求数据。这样 Cerbos 就能实时接收 LLM 请求数据，用于做出授权决策。

1. 在你的 Cerbos 部署中，找到或创建一个能接收来自 Aperture 的 HTTP POST 请求的端点。
2. 记下端点 URL 以及 API 密钥或认证令牌（如有）。稍后在 Aperture 中配置 hook 时会用到。

设置 Cerbos 的详细信息请参阅 [Cerbos 文档][xt-cerbos-docs]。

## 配置 Aperture hook

在 Aperture 中配置一个指向你的 Cerbos 端点的 hook。这样你就可以将请求数据发送给 Cerbos，用于做出授权决策。

1. \[缺失片段：aperture\_admin\_nav.mdx]

2. 在 `hooks` 部分添加一个 `cerbos` 条目，填入你的 Cerbos 部署的端点 URL。

   ```json
   "hooks": {
       "cerbos": {
           "url": "<cerbos-endpoint-url>",
           "apikey": "<cerbos-api-key>"
       }
   }
   ```

   将 `<cerbos-endpoint-url>` 替换为你的 Cerbos 端点的 URL，将 `<cerbos-api-key>` 替换为来自你的 Cerbos 部署的 API 密钥。

3. 添加一个包含 `send_hooks` 条目（引用 `cerbos` hook）的授权。该授权控制哪些请求触发 hook，以及 Aperture 发送哪些数据。

   ```json
   "grants": [
       {
           "src": ["*"],
           "app": {
               "tailscale.com/cap/aperture": [
                   {
                       "send_hooks": [
                           {
                               "name": "cerbos",
                               "events": ["entire_request"],
                               "send": ["tools", "user_message", "grants"]
                           }
                       ]
                   }
               ]
           }
       }
   ]
   ```

   此配置会发送所有用户的请求数据。`user_message` 发送类型会将提示内容转发给 Cerbos，`grants` 发送类型会包含用户的自定义能力，Cerbos 可将其用于授权决策。只发送你的策略所需的内容。要限制哪些用户的请求会触发该 hook，请将 `src` 字段中的 `"*"` 替换为具体的用户身份或标签（tag）。

4. 保存配置。

\[缺失片段：aperture\_hooks\_config\_ref.mdx]

\[缺失片段：aperture\_grant\_dst\_note.mdx]

## 验证集成

配置好 Cerbos hook 后，请验证 Aperture 正在向 Cerbos 发送数据，且 Cerbos 正在根据你的策略对这些数据进行评估。

1. 通过 Aperture 发送一个符合你的授权条件的请求。
2. 检查你的 Cerbos 部署，确认请求数据已到达。
3. 确认 Cerbos 根据你的授权策略对这些数据进行了评估。

\[缺失片段：aperture\_verify\_hook\_wiring.mdx]

## 后续步骤

\[缺失片段：aperture\_hooks\_next\_steps.mdx]

[docs-configuration-hooks]: /docs/aperture/configuration#hooks

[docs-get-started]: /docs/aperture/get-started

[xt-cerbos-docs]: https://docs.cerbos.dev/

[xt-cerbos]: https://www.cerbos.dev/
