---
title: "排查系统托盘显示无互联网连接"
description: "将鼠标悬停在 Windows 系统托盘的互联网图标上时，如果 Windows 客户端未连接到[出口节点][docs-exit-nodes]，就会显示 `Tailscale No internet access` 状态。该"
---

最后验证于 Feb 18, 2026

将鼠标悬停在 Windows 系统托盘的互联网图标上时，如果 Windows 客户端未连接到[出口节点][docs-exit-nodes]，就会显示 `Tailscale No internet access` 状态。这一提示可以忽略，不会对你连接 tailnet 产生任何负面影响。

出现这种情况的原因是：Windows 会通过所有可用接口发送 HTTP 形式的主动探测请求。除非使用了出口节点，否则 Tailscale 客户端不会收到响应，于是 Windows 便报告无互联网连接。

当 Windows 客户端连接到出口节点时，则会显示 `Tailscale Internet access` 状态。

[docs-exit-nodes]: /docs/features/exit-nodes
