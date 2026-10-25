---
title: "管理现有 Oso 集成"
description: "[Oso][xt-oso] 是一个授权平台，为 AI agent 提供细粒度访问控制。本主题面向管理现有 Oso 集成的 Aperture 管理员。"
---

最后验证于 Sep 29, 2026

[Oso][xt-oso] 是一个授权平台，为 AI agent 提供细粒度访问控制。本主题面向管理现有 Oso 集成的 Aperture 管理员。

Aperture 通过 [hook 系统][docs-configuration-hooks]向 Oso 发送工具使用数据。hook 定义 Oso 端点，授权（grant）则指定哪些请求触发该 hook 以及包含哪些数据。

Oso 是第三方服务。当 Aperture 将请求数据转发给它时，Oso 对这些数据的使用受你与 Oso 之间协议的约束，而非你与 Tailscale 之间的协议。

\[缺失片段：aperture\_async\_hook\_note.mdx]

## 前提条件

开始之前，请确保你具备以下条件：

* 可以访问你的 [Aperture 网关][docs-get-started]。
* 拥有 Aperture 的管理员角色，以便访问管理仪表板和编辑配置。
* 一个已在 Aperture 中配置好的现有 Oso 集成，并能访问其 Oso 账户。

## 查看或更新 Oso hook

要查看或更新现有集成：

1. 打开 Aperture 管理仪表板，前往 **Administration** > **Configuration**。

2. 在 `hooks` 部分找到现有的 `oso` 条目。如果需要更换它的 API 密钥，请用来自你的 Oso 账户的密钥更新 `apikey` 值。

   ```json
   "hooks": {
       "oso": {
           "url": "https://api.osohq.com/api/agents/v1/model-request",
           "apikey": "<oso-api-key>"
       }
   }
   ```

   除非 Oso 要求你更改，否则请保留现有端点。

3. 检查带有 `send_hooks` 条目（引用 `oso` hook）的授权。每个授权控制哪些请求触发该 hook，以及 Aperture 发送哪些数据。例如：

   ```json
   "grants": [
       {
           "src": ["*"],
           "app": {
               "tailscale.com/cap/aperture": [
                   {
                       "send_hooks": [
                           {
                               "name": "oso",
                               "events": ["tool_call_entire_request"],
                               "send": ["user_message", "tools", "request_body", "response_body"]
                           }
                       ]
                   }
               ]
           }
       }
   ]
   ```

   此配置会转发完整的请求体和响应体（`request_body` 和 `response_body`），其中包含提示内容和模型输出内容，而不仅仅是工具使用元数据。只发送你的授权策略所需的数据。要限制哪些用户的请求会触发该 hook，请将 `src` 字段中的 `"*"` 替换为具体的用户身份或标签（tag）。

4. 保存配置。

\[缺失片段：aperture\_hooks\_config\_ref.mdx]

\[缺失片段：aperture\_grant\_dst\_note.mdx]

## 验证集成

更新 Oso hook 或其授权后，请验证 Aperture 正在向 Oso 发送预期的数据。

1. 通过 Aperture 发送一个包含工具调用且符合你的授权条件的请求。
2. 打开 [Oso 仪表板][xt-oso]，确认工具使用数据已出现。

\[缺失片段：aperture\_verify\_hook\_wiring.mdx]

## 后续步骤

\[缺失片段：aperture\_hooks\_next\_steps.mdx]

[docs-configuration-hooks]: /docs/aperture/configuration#hooks

[docs-get-started]: /docs/aperture/get-started

[xt-oso]: https://www.osohq.com/
