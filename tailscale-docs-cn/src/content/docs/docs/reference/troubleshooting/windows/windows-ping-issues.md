---
title: "排查 Windows ping 问题"
description: "Windows 通常设置了颇为严格的防火墙规则，即使对 ICMP（ping）流量也不例外（入站和出站均如此）。请确保你的 Windows 设备已允许发送和"
---

最后验证于 Feb 18, 2026

Windows 通常设置了颇为严格的防火墙规则，即使对 ICMP（ping）流量也不例外（入站和出站均如此）。请确保你的 Windows 设备已允许发送和接收 ICMP 流量。

一种更快但风险更高的测试方法是（临时）禁用 Windows 防火墙，然后观察有无影响。有关改进相关通知和用户体验的进展，请参阅 [issue #454][xt-gh-tailscale-issue-454]。

[xt-gh-tailscale-issue-454]: https://github.com/tailscale/tailscale/issues/454
