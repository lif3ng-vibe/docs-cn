---
title: "将 Cribl 与 Aperture 集成"
description: "[Cribl][xt-cribl] 是一个数据管道平台，可对可观测性数据进行路由、缩减和富化。将 Aperture 连接到 Cribl 后，你可以让 AI 用量数据经由现有的 Cribl 管道进行传输 "
---

最后验证于 Jun 26, 2026

[Cribl][xt-cribl] 是一个数据管道平台，可对可观测性数据进行路由、缩减和富化。将 Aperture 连接到 Cribl 后，你可以让 AI 用量数据经由现有的 Cribl 管道传输，并转发到 Cribl 支持的任意目的地（Splunk、Datadog、S3 等）。

Aperture 通过 [hook 系统][docs-configuration-hooks]向 Cribl 发送数据。你需要在 Cribl 中配置一个 webhook 端点，然后在 Aperture 中添加一个 hook，当请求匹配你的授权条件时，它会把事件数据发送到该端点。

Cribl，以及你经由它路由到的目的地（如 Splunk、Datadog 或 S3），都是第三方服务。当 Aperture 向它们转发数据时，这些数据的处理受你与各提供商之间协议的约束，而非你与 Tailscale 之间的协议。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个正在运行且可从你的设备访问的 [Aperture 网关][docs-get-started]。
* 一个已配置 [webhook source][xt-cribl-webhook] 的 [Cribl Stream 或 Cribl Cloud][xt-cribl] 部署。

## 配置 Cribl webhook source

从你的 Cribl 部署获取 webhook URL 和认证令牌。稍后配置 Aperture 中向 Cribl 发送数据的 hook 时会用到。

1. 在你的 Cribl 部署中，创建一个 webhook source 来接收来自 Aperture 的数据。
2. 记下 webhook URL 以及 Cribl 提供的认证令牌（如有）。稍后在 Aperture 中配置 hook 时会用到。

在 Cribl 中配置 webhook source 的详细信息，请参阅 [Cribl 文档][xt-cribl-docs]。

## 配置 Aperture hook

要将 Cribl 与 Aperture 集成，请在 Aperture 中配置一个指向你的 Cribl 端点的 hook。这样你就可以将请求数据发送给 Cribl 进行处理和路由。

1. \[缺失片段：aperture\_admin\_nav.mdx]

2. 在 `hooks` 部分添加一个 `cribl` 条目，填入来自你的 Cribl source 的 webhook URL。

   ```json
   "hooks": {
       "cribl": {
           "url": "<cribl-webhook-url>",
           "apikey": "<cribl-auth-token>"
       }
   }
   ```

   将 `<cribl-webhook-url>` 替换为你的 Cribl webhook source 的 URL，将 `<cribl-auth-token>` 替换为来自 Cribl 的认证令牌。

3. 添加一个包含 `send_hooks` 条目（引用 `cribl` hook）的授权。该授权控制哪些请求触发 hook，以及 Aperture 发送哪些数据。

   ```json
   "grants": [
       {
           "src": ["*"],
           "app": {
               "tailscale.com/cap/aperture": [
                   {
                       "send_hooks": [
                           {
                               "name": "cribl",
                               "events": ["entire_request"],
                               "send": ["tools", "estimated_cost", "request_body", "response_body"]
                           }
                       ]
                   }
               ]
           }
       }
   ]
   ```

   此配置会发送所有用户的每个请求的数据。`request_body` 和 `response_body` 发送类型包含完整的提示内容和模型输出内容，而不仅仅是用量指标，因此本示例会将这些内容转发给 Cribl，再转发到你的目的地。请将 `events` 和 `send` 字段精简到你的管道所需的最低限度。要限制哪些用户的请求会触发该 hook，请将 `src` 字段中的 `"*"` 替换为具体的用户身份或标签（tag）。

4. 保存配置。

hook 事件和发送类型的详细信息，请参阅 [hook 配置参考][docs-configuration-hooks]。

\[缺失片段：aperture\_grant\_dst\_note.mdx]

## 验证集成

配置好 Cribl hook 后，请验证 Aperture 正在向 Cribl 发送数据，且 Cribl 正在将数据路由到预期的目的地。

1. 通过 Aperture 发送一个符合你的授权条件的请求。
2. 检查你的 Cribl 部署，确认事件数据已到达 webhook source。
3. 确认你的 Cribl 管道将数据路由到了预期的目的地。

如果看不到数据，请检查 `send_hooks` 名称是否与 `hooks` 部分中的键一致，以及授权的 `src` 字段是否包含发起请求的用户。

## 后续步骤

\[缺失片段：aperture\_hooks\_next\_steps.mdx]

[docs-configuration-hooks]: /docs/aperture/configuration#hooks

[docs-get-started]: /docs/aperture/get-started

[xt-cribl-docs]: https://docs.cribl.io/

[xt-cribl-webhook]: https://docs.cribl.io/stream/sources-webhook/

[xt-cribl]: https://cribl.io/
