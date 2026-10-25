---
title: "排查 macOS 卡在 Loading backend 的问题"
description: "如果你的 macOS 似乎卡在 **Loading backend**，请考虑以下几点："
---

最后验证于 Feb 18, 2026

如果你的 macOS 似乎卡在 **Loading backend**，请考虑以下几点：

* 你是否启用了屏幕使用时间（Screen Time）？请参阅 [macOS 屏幕使用时间与 Tailscale][docs-macos-webproxyfilterd]获取故障排除指导。

* 你是否安装了 ESET 等病毒扫描软件（或其他形式的端点安全软件）？我们发现，在某些情况下这些安全措施会干扰 Tailscale 的运行。

[docs-macos-webproxyfilterd]: /docs/concepts/macos-webfilterproxyd
