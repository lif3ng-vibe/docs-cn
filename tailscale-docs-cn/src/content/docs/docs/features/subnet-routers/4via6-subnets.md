---
title: "4via6 子网路由器"
description: "相互独立的虚拟私有云（VPC）可以使用相同的 IPv4 地址范围。如果每个 VPC 中的子网路由器通告了相同的范围，Tailscale 会把它们视为[重叠的子网路由器][docs-high-availability]。"
---

最后验证于 Oct 5, 2026

相互独立的虚拟私有云（VPC）可以使用相同的 IPv4 地址范围。如果每个 VPC 中的子网路由器通告了相同的范围，Tailscale 会把它们视为[重叠的子网路由器][docs-high-availability]。发往 `10.0.0.5` 的流量会到达 Tailscale 所选子网路由器后面的那个地址。仅凭 IPv4 地址无法确定目标 VPC 是哪一个。

4via6（"4 via 6"）功能为每个重叠的子网分配一个唯一的 IPv6 地址。Tailscale 用这个地址把流量路由到正确的设备。

> **注意：** [所有套餐](https://tailscale.com/pricing)都可以使用此功能。

以下情况适合使用此功能：

* 网络中包含 IP 或 CIDR 范围重叠的子网。
* 云资源或 SaaS 应用要部署到包含 IP 或 CIDR 范围重叠子网的网络中。
* 合作伙伴或承包商网络的子网 IP 或 CIDR 范围与希望共享访问权限的组织的范围重叠。

## 工作原理

使用此功能时，你的子网路由器会通告一个映射到目标 IPv4 子网的 IPv6 子网（使用 Tailscale 专有地址）。连接到该 IPv6 子网路由器的设备，其 IPv6 包会被 Tailscale 改写为 IPv4，因此 IPv4 地址无需做任何更改。

Tailscale 专有的 IPv6 子网地址形如：

`fd7a:115c:a1e0:b1a:0:XXXX:YYYY:YYYY`

其中：

* `fd7a:115c:a1e0:b1a` 是用于 Tailscale 4via6 路由数据包的 64 位固定前缀。
* `0:XXXX` 是 32 位转换器标识符。站点 ID（site ID）表示 IPv6 包在转换为 IPv4 之前应到达的位置。只有低 16 位可用于指定站点 ID——允许的取值为 0 到 65535（含）。站点 ID 由你自行分配给子网路由。例如，你可以给第一条子网路由用 `1`，那么转换器标识符就是 `0:1`。站点 ID 为 `0` 是有效的，但注意所得的 IPv6 地址（虽然被允许）转换器标识符会是空字符串：fd7a:115c:a1e0:b1a::YYYY:YYYY。
* `YYYY:YYYY` 是以 16 位十六进制数表示的 IPv4 地址。

例如，站点 ID 为 `7`、IPv4 子网地址范围为 `10.1.1.0/24`（以 16 位十六进制表示为 `a01:100/120`）时，其 IPv6 子网路由为：

*（图：fd7a:115c:a1e0:b1a:7:a01:100/120，其中"fd7a:115c:a1e0:b1a"是用于 Tailscale 4via6 路由数据包的 64 位固定前缀，"7"是站点 ID，"a01:100/120"是以 16 位十六进制表示的 IPv4 范围）*

Tailscale 使用该 IPv6 子网地址，把你的 tailnet 流量路由到相应的 IPv4 目的地。

[Tailscale CLI][docs-cli] 提供 `tailscale debug via` 命令，帮助你创建 IPv6 子网路由。

> **注意：**
>
> v1.58 之前的 Tailscale 版本只能通告站点 ID 为 0 到 255 的 4via6 地址。它们可以访问站点 ID 更大的 4via6 子网，但无法通告它们。

## 设置重叠的子网路由器

要设置 4via6 子网路由器，先为每个重叠的 IPv4 子网生成一条 IPv6 子网路由，然后在子网路由器上通告该路由。

### 第 1 步：生成 IPv6 子网路由

运行 Tailscale CLI 命令 `tailscale debug via` 并传入站点 ID 与 IPv4 路由参数，为你的 IPv4 子网生成 IPv6 子网路由。本例为站点 ID 为 `7`、IPv4 路由为 `10.1.1.0/24` 的子网生成 IPv6 子网路由。

```shell
tailscale debug via 7 10.1.1.0/24
```

得到的 IPv6 子网路由为：

`fd7a:115c:a1e0:b1a:0:7:a01:100/120`

### 第 2 步：通告 IPv6 子网路由

按照[设置子网路由器][docs-subnets-setup-subnet-router]的步骤操作。但在通告路由时，请使用你在上面第 1 步中创建的 IPv6 路由。例如：

```shell
# Update to use the values for your subnet
tailscale set --advertise-routes=fd7a:115c:a1e0:b1a:0:7:a01:100/120
```

现在，tailnet 中的设备就可以连接 IPv4 地址相同但相互独立的不同重叠子网了。

你可以在同一台子网路由器上同时通告 IPv4 和 IPv6 子网路由。

注意，如果你从多台子网路由器暴露相同的 IPv6 路由（即相同 IPv4 路由加相同站点 ID），你就是在使用[高可用][docs-high-availability]。

## IPv4 子网设备的 MagicDNS 名称

如果你启用了 [MagicDNS][docs-magicdns]，可以使用自动创建的 MagicDNS 名称访问你通告的重叠子网中的设备。该名称形如：

`Q-R-S-T-via-X`

其中：

* `Q-R-S-T` 是设备的 IPv4 地址。
* `X` 是你创建 [Tailscale 专有 IPv6 地址][ar-4via6-address-format]时使用的子网路由器站点 ID。

例如，如果 IP 地址 `10.1.1.16` 位于你用 `10.1.1.0/24` 加站点 ID 7 通告的子网中，你可以在 tailnet 中用名称 `10-1-1-16-via-7` 访问它。

## 4via6 子网路由器的高可用

4via6 子网路由器支持[高可用][docs-high-availability]。例如，假设两个 VPC 都使用 `172.16.0.0/16`。在每个 VPC 中配置一台 4via6 子网路由器：第一台用站点 ID 1，第二台用站点 ID 2。

要为第一个 VPC 添加故障转移，在该 VPC 上再配置一台 4via6 子网路由器，使用相同的站点 ID 1 和 `172.16.0.0/16` 路由。在使用默认的[主备故障转移][docs-route-selection]（active-passive failover）选项时，Tailscale 会把一台子网路由器用作主节点，另一台作为备用。

要为第二个 VPC 实现故障转移，在该 VPC 中再添加一台使用站点 ID 2 和相同路由的 4via6 子网路由器。

## 访问控制规则

编写针对 4via6 子网路由器后方资源的[访问控制][docs-access-control]规则时，请使用 IPv6 CIDR 或地址作为目的地，而不是 IPv4 地址。

使用 `tailscale debug via` 获取 IPv6 CIDR。

## 限制

* 4via6 子网路由器需要 Tailscale v1.24 或更高版本。使用该 4via6 子网路由器访问远程设备的其他 Tailscale 客户端可以使用更早的版本。
* 出于安全考虑，请把 4via6 子网路由器升级到 Tailscale v1.102.3 或更高版本。详情请参阅 [TS-2026-011][co-security-ts-2026-011]。
* 目前管理控制台中只显示 IPv6 子网地址，不显示它映射的 IPv4 地址。
* 一个 tailnet 最多可有 65,536 个站点 ID。每个站点 ID 可以映射任意数量的 IPv4 CIDR。

[ar-4via6-address-format]: #4via6-address-format

[co-security-ts-2026-011]: https://tailscale.com/security-bulletins#ts-2026-011

[docs-access-control]: /docs/features/access-control

[docs-cli]: /docs/reference/tailscale-cli

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-magicdns]: /docs/features/magicdns

[docs-route-selection]: /docs/features/route-selection#active-passive-failover

[docs-subnets-setup-subnet-router]: /docs/features/subnet-routers#set-up-a-subnet-router
