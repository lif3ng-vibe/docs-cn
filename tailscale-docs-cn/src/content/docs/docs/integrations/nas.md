---
title: "连接到网络附加存储（NAS）"
description: "在受支持的网络附加存储（NAS）设备上安装 Tailscale 客户端。"
---

最后验证于 Oct 29, 2025

Tailscale 帮助你通过 WireGuard® 安全地连接到你的[网络附加存储（NAS）][xt-wikipedia-nas]设备。根据平台不同，官方或社区支持的程度也不同。

对于大多数个人用途（包括访问你的 NAS），Tailscale 完全免费。一般来说，在 NAS 上[安装 Tailscale][docs-install-linux]，然后按照步骤进行授权即可。部分厂商有更具体的说明，如下所述。

## Synology

Tailscale 已作为官方应用上架 Synology 套件中心（Package Center），并带有易用的配置 Web UI。详情请参阅我们的 [Tailscale on Synology][docs-synology] 主题。

## QNAP

Tailscale 已作为官方应用上架 QNAP App Center，并带有易用的配置 Web UI。详情请参阅我们的 [Tailscale on QNAP][docs-qnap] 主题。

## TrueNAS SCALE

Tailscale 已作为官方应用内置在 TrueNAS SCALE 软件中。详情请参阅我们的 [Tailscale on TrueNAS SCALE][docs-truenas-scale] 主题。

## Unraid

Tailscale 已作为官方应用内置在 Unraid 软件中。详情请参阅我们的 [Tailscale on Unraid][docs-unraid] 主题。

## FreeNAS

Tailscale 的 FreeBSD 支持由社区维护，客户端可在 [FreshPorts][xt-freshports-tailscale] 中获取。

[docs-install-linux]: /docs/install/linux

[docs-qnap]: /docs/integrations/qnap

[docs-synology]: /docs/integrations/synology

[docs-truenas-scale]: /docs/integrations/truenas

[docs-unraid]: /docs/integrations/unraid

[xt-freshports-tailscale]: https://www.freshports.org/security/tailscale

[xt-wikipedia-nas]: https://en.wikipedia.org/wiki/Network-attached_storage
