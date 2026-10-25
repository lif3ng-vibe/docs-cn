---
title: "与其他软件的互操作性"
description: "了解 Tailscale 与其他软件的互操作性。"
---

最后验证于 Mar 25, 2026

Tailscale 会尽量与你设备上的其他软件协作共存，但有时做不到。一些操作系统对能同时运行多少个 VPN 类程序、或有多少程序可以注册到某些操作系统级设施施加了限制；有时则是其他软件有意或无意地破坏了 Tailscale。

在调试 Tailscale 无法工作的问题时，我们通常会先尝试弄清你的设备或网络有什么不同，以及设备上运行着哪些明显与之冲突的其他软件。以下是一些值得考虑的一般性问题：

* 你是否在运行其他网络、VPN、终端安全、杀毒、虚拟化或其他安全软件？
* 网络/路由器上是否有安全代理？

下面列出可能引发问题、也可能不引发问题的其他软件（取决于操作系统、版本和配置，并非详尽无遗）：

* [Apple 屏幕使用时间（或任何其他 macOS 内容过滤器）][docs-macos-webproxyfilterd]
* Apple Private Relay
* Avast
* Cisco Umbrella
* ClamXAV
* Clash、ClashX、Clash Pro X
* Cloudflare Warp
* CrowdStrike Falcon
* Docker Desktop
* FortiClient
* GlobalProtect VPN
* Little Snitch
* McAfee LiveSafe
* Mullvad
* Netskope
* PIA
* Proton VPN
* TunnelBear
* Tunnelblick
* VirtualBox
* VMware
* VMware Carbon Black
* Webroot
* WireGuard
* WSL
* ZeroTier

如果你正在运行上述软件或类似程序，请告诉我们。在某些操作系统上，由于沙盒机制，Tailscale 甚至无法检测到这些程序的存在。如果你告知我们你在运行什么，我们也许能就如何配置给出建议，让一切正常工作。反馈请[联系 Tailscale 支持团队][co-contact-support]。

> **注意：**
>
> 如果你的设备由雇主配发，它很可能不只是原装的 macOS 或 Windows 系统，多半还运行着其他软件。

[co-contact-support]: https://tailscale.com/contact/support

[docs-macos-webproxyfilterd]: /docs/concepts/macos-webfilterproxyd
