---
title: "Poor performance with internet connections"
description: "Network performance problems often emerge as unstable connections, packet loss, high latency, or a failure to make a [direct connection][docs-connection-types]. The cause of these problems can differ "
---

Last validated Nov 14, 2025

Network performance problems often emerge as unstable connections, packet loss, high latency, or a failure to make a [direct connection][docs-connection-types]. The cause of these problems can differ depending on the context. Use the following steps to help you troubleshoot why a device is experiencing network performance issues when connecting to the public internet.

1. **Ensure the Tailscale client is up-to-date**.

   Make sure both devices are running the latest version of Tailscale. You can [check the version][docs-update] of every device in your tailnet from the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

   You can also check the version of each device locally using the Tailscale application or the [`tailscale version`][docs-cli-version] command. This command also has flags available to check the version of the Tailscale client or the [`tailscaled` daemon][docs-tailscaled] specifically.

   If the Tailscale version is outdated, [download and install the latest version][docs-update].

2. Gather basic information about the device's network configuration and connection to the website or device using a tool like [`ping`][xt-ping], [MTR][xt-mtr], or [`traceroute`][xt-traceroute] (for macOS and Linux). For Windows, you can use [`ping`][xt-windows-ping], [WinMTR][xt-winmtr], or [`tracert`][xt-tracert].

3. **Check for Tailscale configurations that might prevent a connection**.

   If the device uses an exit node, ensure the exit node is online and has access to the resources you're trying to access. For example, ensure that no access control policies prevent the exit node from reaching the destination's IP address or port number. Additionally, ensure the exit node isn't experiencing performance issues like latency.

   If the device functions as an exit node, ensure its performance isn't hindered by the inbound connections. You can do this by checking the bandwidth usage, the CPU usage, and the RAM usage.

4. **Disconnect from any other virtual private network (VPN) software**.

   While Tailscale doesn't deliberately conflict with other VPNs, it's difficult to avoid conflicts in all environments. Many VPN programs also try to prevent other software, such as Tailscale, from making network configuration changes.

5. **Disconnect from Tailscale**. If the problem persists, continue troubleshooting [basic network connectivity (beyond Tailscale)][docs-basic-network-troubleshooting].

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
