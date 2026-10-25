---
title: "管理控制台会话会过期吗？"
description: "了解 Tailscale 管理控制台会话的过期机制。"
---

最后验证于 Sep 30, 2025

会。

访问 Tailscale [管理控制台](https://console.tailscale.com/admin) 的浏览器会话有效期为 30 天。该有效期与任何密钥过期机制无关。如果你的浏览器会话打开管理控制台超过 30 天，就需要刷新浏览器会话或打开新的浏览器会话，才能继续使用管理控制台。

你无法自行配置管理控制台会话的 30 天有效期。不过，你可以[配置会话在一段时间不活动后超时][docs-session-timeout]。

[docs-session-timeout]: /docs/account/admin-console-session-timeout
