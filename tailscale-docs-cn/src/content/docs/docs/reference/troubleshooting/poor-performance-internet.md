---
title: "互联网连接性能不佳"
description: "网络性能问题通常表现为连接不稳定、丢包、高延迟或无法建立[直连][docs-connection-types]。这些问题的成因因场景而异。"
---

最后验证于 Nov 14, 2025

网络性能问题通常表现为连接不稳定、丢包、高延迟或无法建立[直连][docs-connection-types]。这些问题的成因因场景而异。请按以下步骤排查设备连接公共互联网时出现网络性能问题的原因。

1. **确保 Tailscale 客户端为最新版本**。

   确保两台设备都运行最新版本的 Tailscale。你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面[检查版本][docs-update]，查看 tailnet 中每台设备的版本。

   你也可以使用 Tailscale 应用或 [`tailscale version`][docs-cli-version] 命令在本地检查每台设备的版本。该命令还提供了一些标志，可专门用于检查 Tailscale 客户端或 [`tailscaled` 守护进程][docs-tailscaled] 的版本。

   如果 Tailscale 版本过旧，请[下载并安装最新版本][docs-update]。

2. 使用 [`ping`][xt-ping]、[MTR][xt-mtr] 或 [`traceroute`][xt-traceroute]（macOS 和 Linux）等工具收集设备网络配置以及它与网站或设备之间连接的基本信息。在 Windows 上，可以使用 [`ping`][xt-windows-ping]、[WinMTR][xt-winmtr] 或 [`tracert`][xt-tracert]。

3. **检查可能阻止连接的 Tailscale 配置**。

   如果设备使用了出口节点，请确保该出口节点在线，并且能够访问你要访问的资源。例如，确保没有访问控制策略阻止出口节点到达目标 IP 地址或端口号。此外，确保出口节点本身没有出现延迟之类的性能问题。

   如果设备本身充当出口节点，请确保入站连接没有拖累其性能。可以通过检查带宽占用、CPU 占用和内存占用来确认。

4. **断开其他虚拟专用网络（VPN）软件**。

   虽然 Tailscale 不会刻意与其他 VPN 冲突，但很难在所有环境中都避免冲突。许多 VPN 程序还会试图阻止 Tailscale 等其他软件修改网络配置。

5. **断开 Tailscale 连接**。如果问题仍然存在，请继续排查 [Tailscale 之外的基础网络连通性][docs-basic-network-troubleshooting]。

[docs-basic-network-troubleshooting]: /docs/reference/troubleshooting/basic-network-troubleshooting

[docs-cli-version]: /docs/reference/tailscale-cli#version

[docs-connection-types]: /docs/reference/connection-types

[docs-tailscaled]: /docs/reference/tailscaled

[docs-update]: /docs/features/client/update

[xt-mtr]: https://en.wikipedia.org/wiki/MTR_%28software%29

[xt-ping]: https://en.wikipedia.org/wiki/Ping_%28networking_utility%29

[xt-traceroute]: https://en.wikipedia.org/wiki/Traceroute

[xt-tracert]: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert

[xt-windows-ping]: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping

[xt-winmtr]: https://en.wikipedia.org/wiki/MTR_%28software%29#Windows_versions
