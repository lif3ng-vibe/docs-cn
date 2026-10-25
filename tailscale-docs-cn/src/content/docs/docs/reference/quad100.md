---
title: "100.100.100.100 是什么？"
description: "了解 100.100.100.100（也称为 Quad100）是什么。"
---

最后验证于 Jan 12, 2026

`100.100.100.100`（即 Quad100）是 Tailscale 网络（即 tailnet）中的一个特殊 [Tailscale IP 地址][docs-100.x-addresses]，提供关键的本地服务。它的运作方式类似于 localhost 地址（`127.0.0.1`），但只提供 Tailscale 特有的服务，并具备感知网络的功能。这些服务包括一个 [DNS 解析器][ar-dns-resolver]和一个[设备管理界面][ar-device-management-interface]。

Quad100 作为设备本地服务运行，这意味着连接到 `100.100.100.100` 的本地流量不会离开你的设备，除非提供服务确有必要（例如转发 DNS 请求时）。其他设备无法使用 `100.100.100.100` 访问你的设备，Tailscale 也看不到其内容。

> **注意：**
>
> Quad100 还有 IPv6 地址 `fd7a:115c:a1e0::53`。Quad100 是 Tailscale [保留 IP 地址][docs-reserved-ip-addresses]之一。

## DNS 解析器

Quad100 提供的服务之一是运行在端口 `53` 上的 DNS 解析器（`100.100.100.100:53`）。DNS 解析器是一种把 IP 地址翻译成主机名（如 `google.com` 或 `macbook.tailnetname.ts.net`）的服务。Quad100 是一个[存根解析器（stub resolver）][xt-rfc-1123-stub-resolver]，类似于 [`systemd-resolved`][xt-systemd-resolved]，但带有额外功能。

Quad100 DNS 解析器使用 [MagicDNS][docs-magicdns] 在本地解析 tailnet 中的主机名，并把 DNS 请求转发给出口节点（如果已配置）。在可用时它还提供 [DNS-over-HTTPS（DoH）][xt-doh] 加密，并实现了[覆盖 DNS 服务器][docs-override-dns-servers]和[拆分 DNS（适用于 Android）][docs-android-split-dns]等设置。

> **注意：**
>
> 虽然 Quad100 的 DNS 解析器在本地运行且不记录日志，但被转发的请求可能会由所配置的[名称服务器][docs-nameservers]记录。

## 设备管理界面

Quad100 在端口 `80` 上提供一个[设备管理界面][docs-device-web-interface]。通过该界面，你可以在 Web 浏览器中配置本地设备的设置，包括设备专属设置、[出口节点][docs-exit-nodes]设置、[Tailscale SSH][docs-tailscale-ssh] 设置和[子网路由][docs-subnets]。

你可以在本地通过 `http://100.100.100.100` 访问该界面，即使你的设备没有安装[原生 Tailscale 客户端][docs-installation]也可以。

> **注意：**
>
> 对于 Tailscale v1.64.0 及更高版本，设备管理界面默认启用。对于更早的版本，你可以[手动启用它][docs-device-web-interface-start]。

[ar-device-management-interface]: #设备管理界面

[ar-dns-resolver]: #dns-解析器

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-android-split-dns]: /docs/features/client/android-app-split-tunneling

[docs-device-web-interface-start]: /docs/features/client/device-web-interface#expose-the-web-interface-on-a-device

[docs-device-web-interface]: /docs/features/client/device-web-interface

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-installation]: /docs/install

[docs-magicdns]: /docs/features/magicdns

[docs-nameservers]: /docs/reference/dns-in-tailscale#nameservers

[docs-override-dns-servers]: /docs/reference/dns-in-tailscale#override-dns-servers

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[xt-doh]: https://en.wikipedia.org/wiki/DNS_over_HTTPS

[xt-rfc-1123-stub-resolver]: https://www.rfc-editor.org/rfc/rfc1123.html#page-74

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[xt-systemd-resolved]: https://wiki.archlinux.org/title/Systemd-resolved
