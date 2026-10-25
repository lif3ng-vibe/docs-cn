---
title: "保留的 IP 地址"
description: "了解 Tailscale 用于设备编址和内部服务的保留 IP 地址与地址段。"
---

最后验证于 Jan 12, 2026

Tailscale 会从 [RFC 6598][xt-rfc-6598-cgnat] 定义的运营商级 NAT（CGNAT）地址段中，为你的 [tailnet][docs-tailnet] 里的每台设备分配一个唯一的 [Tailscale IP 地址][docs-100.x-addresses]。该地址段不会与 `10.0.0.0/8` 或 `192.168.0.0/16` 等常见私有网络地址段冲突。

Tailscale 在该地址段内为内部服务和设备管理保留了一些特定地址。在配置 [IP 池][docs-ip-pool]、编写[访问控制策略][docs-policy-syntax]或排查连接问题时，本主题可以帮助你理解这些保留地址。

下表列出了 Tailscale 使用的保留 IP 地址与地址段：

| 地址或地址段          | 用途                                                                                                                                                                                             |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `100.64.0.0/10`       | [CGNAT 地址段][xt-rfc-6598-cgnat]，Tailscale 用作[设备 IP 地址][docs-100.x-addresses]（`100.64.0.0` 至 `100.127.255.255`）。                                                       |
| `100.100.0.0/24`      | Tailscale 内部使用。[IP 池][docs-ip-pool]不可使用。                                                                                                                                   |
| `100.100.100.0/24`    | Tailscale 内部使用。[IP 池][docs-ip-pool]不可使用。                                                                                                                                   |
| `100.100.100.100`     | [Quad100][docs-what-is-quad100]，设备本地服务地址。在端口 `53` 提供 [DNS 解析器][docs-magicdns]，在端口 `80` 提供[设备管理界面][docs-device-web-interface]。 |
| `100.115.92.0/23`     | Tailscale 内部使用。[IP 池][docs-ip-pool]不可使用。                                                                                                                                   |
| `fd7a:115c:a1e0::/48` | Tailscale 用作[设备 IPv6 地址][docs-ipv6]的 [IPv6 唯一本地地址][xt-wiki-unique-local-address]前缀。                                                                         |
| `fd7a:115c:a1e0::53`  | [Quad100][docs-what-is-quad100] 的 IPv6 等价地址，提供相同的 DNS 解析器和设备管理服务。                                                                                  |
| `100.101.102.103`     | 为 [`tshello`][docs-hello-tsnet] 示例服务保留。                                                                                                                                     |

## 这对你意味着什么

你可以在访问控制列表（ACL）规则和授权中直接使用 Tailscale IP 地址。例如，在 `src` 或 `dst` 字段中用设备的 `100.x.y.z` 地址来指定它。请注意：

* 保留地址段不可分配。Tailscale 绝不会把保留地址段（`100.100.0.0/24`、`100.100.100.0/24` 或 `100.115.92.0/23`）中的地址分配给设备，因此你在编写策略时无需考虑它们。

* Quad100 仅在设备本地有效。发往 `100.100.100.100` 的流量只留在本地设备上，不会经过你的 tailnet。访问控制策略无法以 Quad100 为目标。

* IP 池不得与保留地址段重叠。配置 [IP 池][docs-ip-pool]时，请确保你的地址段不与保留地址重叠。

如果你把 Tailscale 与第三方服务集成，请确认你的网络基础设施没有把 CGNAT 地址段（`100.64.0.0/10`）挪作他用。一些互联网服务提供商（ISP）会使用该地址段，这会引发 [CGNAT 冲突][docs-troubleshooting-cgnat]。

## 故障排除

如果你遇到与 IP 地址相关的连接问题，以下资源可以提供帮助：

* CGNAT 冲突：如果你的 ISP 或其他虚拟专用网络（VPN）使用了 `100.64.0.0/10` 地址段，你可能会遇到路由冲突。解决方法（包括如何选择性地禁用 IPv4 或在整个 tailnet 范围禁用）请参阅 [CGNAT 冲突][docs-troubleshooting-cgnat]。
* 多台设备使用相同 IP：如果你从备份恢复了一台设备或克隆了文件系统，两台设备可能会拥有相同的 Tailscale IP 地址。解决方法请参阅[多台设备拥有相同的 100.x IP 地址][docs-troubleshooting-duplicate-ip]。
* DNS 解析问题：如果 [MagicDNS][docs-magicdns] 无法解析设备名称，请确认你的设备可以访问 `100.100.100.100:53` 上的 Quad100 DNS 解析器。Linux 特有的问题请参阅[配置 Linux DNS][docs-linux-dns]。
* 设备连接：一般性连接问题排查请参阅[排查设备连接问题][docs-troubleshoot-connectivity]。

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-device-web-interface]: /docs/features/client/device-web-interface

[docs-hello-tsnet]: /docs/reference/examples/tsnet-hello-world

[docs-ip-pool]: /docs/reference/ip-pool

[docs-ipv6]: /docs/concepts/ipv6

[docs-linux-dns]: /docs/reference/linux-dns

[docs-magicdns]: /docs/features/magicdns

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-troubleshooting-cgnat]: /docs/reference/troubleshooting/network-configuration/cgnat-conflicts

[docs-troubleshooting-duplicate-ip]: /docs/reference/troubleshooting/network-configuration/multiple-devices-same-100-x-ip-address

[docs-what-is-quad100]: /docs/reference/quad100

[xt-rfc-6598-cgnat]: https://www.rfc-editor.org/rfc/rfc6598.html

[xt-wiki-unique-local-address]: https://en.wikipedia.org/wiki/Unique_local_address
