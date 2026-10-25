---
title: "基础网络故障排除"
description: "本主题提供一般性网络故障排除的相关信息，即不特定于 Tailscale 的内容。"
---

最后验证于 Nov 14, 2025

本主题提供一般性网络故障排除的相关信息，即不特定于 Tailscale 的内容。要排查 Tailscale 特有的问题，请参阅[排查设备连接问题][docs-troubleshoot-connectivity]和[排查网络配置问题][docs-troubleshoot-network-configuration]。

基础网络连接的故障排除方法因操作系统、环境和其他变量而异。不过，你可以考虑尝试以下步骤：

1. 收集设备网络配置及其与网站或目标设备之间连接的基本信息。

   用于收集这些信息的工具因操作系统而异。

   #### macOS

   在 macOS 设备上，你可以：

   * 使用 [`ping`][xt-ping]、[`ifconfig`][xt-ifconfig] 或 [`traceroute`][xt-traceroute] 等 CLI 工具。
   * 录制[数据包跟踪][xt-packet-trace]（packet trace）。
   * 使用 [MTR][xt-mtr] 或 [Wireshark][xt-wireshark] 等[第三方工具][xt-macos-third-party-tools]。

   #### Windows

   在 Windows 设备上，你可以：

   * 使用 [Windows 内置的故障排除工具][xt-windows-troubleshooting]。
   * 使用 [`ping`][xt-windows-ping]、[`ipconfig`][xt-ipconfig] 或 [`tracert`][xt-tracert] 等 CLI 工具。
   * 使用 [WinMTR][xt-winmtr] 或 [Wireshark][xt-wireshark] 等第三方工具。

   #### Linux

   在 Linux 设备上，你可以：

   * 使用 [`ping`][xt-ping]、[`ifconfig`][xt-ifconfig] 或 [`traceroute`][xt-traceroute] 等 CLI 工具。
   * 使用 [MTR][xt-mtr] 或 [Wireshark][xt-wireshark] 等第三方工具。

   其他平台和嵌入式系统上的工具可用性可能有所不同。

2. 检查设备的网络配置，例如网卡（NIC）、子网掩码、默认网关和 DNS 服务器。

3. 检查设备的 CPU 和内存（RAM）占用情况。

4. 确认设备没有物理层面的问题，例如线缆磨损或电量过低。

5. 检查设备操作系统或固件是否有可用更新。

6. 联系你的互联网服务提供商（ISP）。

7. 重启设备。

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-troubleshoot-network-configuration]: /docs/reference/troubleshooting/network-configuration

[xt-ifconfig]: https://www.cs.unh.edu/cnrg/people/gherrin/linux-net.html#tth_sEc3.2.2

[xt-ipconfig]: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig

[xt-macos-third-party-tools]: https://developer.apple.com/documentation/network/taking-advantage-of-third-party-network-debugging-tools?language=objc

[xt-mtr]: https://en.wikipedia.org/wiki/MTR_%28software%29

[xt-packet-trace]: https://developer.apple.com/documentation/network/recording-a-packet-trace?language=objc

[xt-ping]: https://en.wikipedia.org/wiki/Ping_%28networking_utility%29

[xt-traceroute]: https://en.wikipedia.org/wiki/Traceroute

[xt-tracert]: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert

[xt-windows-ping]: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping

[xt-windows-troubleshooting]: https://support.microsoft.com/en-US/Windows/Experience/Connectivity-Networking/fix-wi-fi-connection-issues-in-windows

[xt-winmtr]: https://en.wikipedia.org/wiki/MTR_%28software%29#Windows_versions

[xt-wireshark]: https://www.wireshark.org/
