---
title: "Basic network troubleshooting"
description: "This topic provides information about general network troubleshooting, that is, not specific to Tailscale. For troubleshooting Tailscale-specific issues, refer to [Troubleshoot device connectivity][do"
---

Last validated Nov 14, 2025

This topic provides information about general network troubleshooting, that is, not specific to Tailscale. For troubleshooting Tailscale-specific issues, refer to [Troubleshoot device connectivity][docs-troubleshoot-connectivity] and [Troubleshoot network configuration][docs-troubleshoot-network-configuration].

Troubleshooting basic network connectivity varies by operating system, environment, and other variables. However, you might consider trying the following:

1. Gather basic information about the device's network configuration and connection to the website or device.

   The tools available to gather this information vary depending on the operating system.

   #### macOS

   On macOS devices, you can:

   * Use a CLI tool like [`ping`][xt-ping], [`ifconfig`][xt-ifconfig], or [`traceroute`][xt-traceroute].
   * Record a [packet trace][xt-packet-trace].
   * Use a [third-party tool][xt-macos-third-party-tools] like [MTR][xt-mtr] or [Wireshark][xt-wireshark].

   #### Windows

   On Windows devices, you can:

   * Use [Windows built-in troubleshooting tools][xt-windows-troubleshooting].
   * Use a CLI tool like [`ping`][xt-windows-ping], [`ipconfig`][xt-ipconfig], or [`tracert`][xt-tracert].
   * Use a third-party tool like [WinMTR][xt-winmtr] or [Wireshark][xt-wireshark].

   #### Linux

   On Linux devices, you can:

   * Use a CLI tool like [`ping`][xt-ping], [`ifconfig`][xt-ifconfig], or [`traceroute`][xt-traceroute].
   * Use a third-party tool like [MTR][xt-mtr] or [Wireshark][xt-wireshark].

   Tool availability for other platforms and embedded systems might vary.

2. Check the device's network configuration, such as the network interface card (NIC), subnet masks, default gateway, and DNS servers.

3. Check the device's CPU and RAM usage.

4. Ensure there aren't any physical problems with the device, such as worn cables or a low battery.

5. Check for updates to the device's operating system or firmware.

6. Contact your internet service provider (ISP).

7. Restart the device.

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
