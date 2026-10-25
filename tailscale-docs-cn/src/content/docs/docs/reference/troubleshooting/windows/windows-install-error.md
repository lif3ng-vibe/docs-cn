---
title: "排查 Windows 安装错误"
description: "Tailscale 客户端安装程序要求以下 Windows 系统服务正在运行："
---

最后验证于 Feb 18, 2026

Tailscale 客户端安装程序要求以下 Windows 系统服务正在运行：

* `Dnscache`
* `iphlpsvc`
* `netprofm`
* `WinHttpAutoProxySvc`

如果安装程序未检测到这些服务正在运行，就会自动失败。关于禁用系统服务的微软官方指南，请参阅[Windows Server 2016（带桌面体验）禁用系统服务指南][xt-windows-services]。

[xt-windows-services]: https://learn.microsoft.com/en-us/windows-server/security/windows-services/security-guidelines-for-disabling-system-services-in-windows-server
