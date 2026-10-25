---
title: "TunnelVision 漏洞与 Tailscale"
description: "了解 macOS 上的 TunnelVision 网络漏洞警告弹窗及其处理方式。"
---

最后验证于 Oct 29, 2025

TunnelVision 是一种滥用合法网络配置工具的攻击，可能被恶意行为者利用。

如果在运行 Tailscale 客户端的 macOS 设备上检测到 TunnelVision 漏洞，将会显示如下弹窗通知：

*（图：Tailscale 客户端提示检测到 TunnelVision 漏洞的警告）*

如果你在 macOS 上收到此通知，说明在你所连接的网络上检测到并正在使用名为 DHCP option 121 的设置。虽然该网络使用 DHCP option 121 可能并无恶意，但也存在有人试图利用它发动这种攻击的可能。

> **注意：**
>
> 在 macOS 和 iOS 设备上，Tailscale 无法覆盖 DHCP option 121。目前没有已知情况表明该问题会影响 tvOS。

## 攻击的原理

大多数计算机网络都使用一种叫做动态主机配置协议（DHCP）的服务。DHCP 就像本地网络里一位乐于助人的向导：在设备加入时为其分配地址，并确保它们知道往哪里发送和接收信息。通常，DHCP 只用于分配地址、DNS 名称服务器和一条默认路由。不过，它也可以在设备加入网络时向其提供指令（称为 DHCP 选项）。这些指令可以告诉你的设备网络上有哪些可用服务，以及如何自动使用它们。

TunnelVision 攻击是指有人在你的本地网络上恶意使用 DHCP option 121 这一网络设置，指示设备把本应发往你的 tailnet 或互联网站点的数据发送给攻击者。

## 如何应对

### 家庭网络

如果你使用的是家庭网络，请检查网络配置，确保没有使用 DHCP option 121。你的互联网服务提供商也可能为你启用了 DHCP option 121。如果是这种情况，你可以放心地选择 **Keep Tailscale Running**，并勾选 **Don't warn me again** 来隐藏这些警告消息。

### 工作网络

如果你使用的是工作网络并收到弹窗通知，请联系你的网络管理员，告知 Tailscale 检测到 DHCP option 121 正在使用。管理员可以判断该警告是否为误报，也可以使用 [Tailscale 系统策略][docs-mdm-keys]禁用这些警告。

### 公共网络

如果你使用的是公共网络（例如咖啡馆或共享办公空间里的网络）并收到弹窗通知，我们建议你选择 **Disconnect**，然后改连其他网络。

## 更多信息

欲深入了解，请参阅我们的博客文章 [Tailscale and TunnelVision: our analysis][bl-tunnelvision-analysis]。

[bl-tunnelvision-analysis]: https://tailscale.com/blog/tunnelvision-analysis

[docs-mdm-keys]: /docs/features/tailscale-system-policies
