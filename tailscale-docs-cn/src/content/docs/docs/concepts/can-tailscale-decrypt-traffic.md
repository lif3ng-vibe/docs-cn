---
title: "Tailscale 能解密我的流量吗？"
description: "了解为什么 Tailscale 无法解密你的流量。"
---

最后验证于 Jun 18, 2024

不能。

运行 Tailscale 的设备只交换各自的公钥。私钥从不离开设备。所有流量始终都是端到端加密的。
