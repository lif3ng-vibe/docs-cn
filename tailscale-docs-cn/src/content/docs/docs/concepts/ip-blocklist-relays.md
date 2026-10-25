---
title: "使用 IP 封锁列表连接外部服务"
description: "控制对托管在未运行 Tailscale 的服务器上的 SaaS 应用的访问。"
---

最后验证于 Jan 5, 2026

如果你正从传统办公网络或集中式 VPN 集中器迁移，可能会有一些未运行 Tailscale 但仍需保障连接安全的外部服务器。

运行在 Heroku 等[无服务器][docs-serverless]（serverless）云服务商上的第三方或内部服务可能使用 IP 封锁列表（有时也称 IP 允许列表）。当服务使用 IP 封锁列表时，它预期所有用户流量都来自单个 IP 地址或少数几个 IP 地址。由于 Tailscale 无需将所有流量都经由中央集中器转发，你的用户流量会突然开始从互联网各处涌来，撞上服务提供商设置的 IP 封锁列表防护。

## 什么是 IP 封锁列表？

在不同地点的设备之间建立安全链路往往颇具挑战。因此，常见的做法是运营仍使用面向互联网的端口和 IP 地址的"内部使用"服务，并让不同地点的设备从各自办公室位置连接这些服务器。SSH、RDP（远程桌面协议）和各种 Web 服务中都很常见这种做法。

暴露的端口使互联网上任何地方都能发起攻击，包括端口扫描、密码猜测、基础设施零日漏洞利用等等。即使服务本身要求[加密][docs-encryption]和多因素认证，技术栈中任何一处的漏洞都可能导致安全防护被完全绕过。

为了增加这类攻击的难度，最佳实践是限制哪些 IP 地址被允许与你的服务建立连接，通常在防火墙层面实施。这能让你的服务器对互联网上的绝大多数人不可见，潜在恶意行为者就无从知道该攻击哪里。

遗憾的是，IP 封锁列表存在几个缺陷：

* IP 封锁列表本质上属于[*隐蔽式安全*][xt-wiki-security-obscurity]（security by obscurity）。如果攻击者能够发现哪些 IP 地址被允许建立连接——而这往往并不难猜到——那么足够执着的攻击者就可以伪造来自该地址的数据包，或者控制位于该地址的一台设备（例如借助僵尸网络），与服务器通信。

* 用户并不都在同一个地点。远程办公人员、多个办公室或分布在不同数据中心的服务器会从不同的 IP 地址产生流量。为确保所有这些地点都能访问服务，IP 封锁列表必须越写越长。而列表越长，攻击者能钻的空子就越多。

* 云 VPC 让 IP 地址的扩散问题更加严重。如果你的内部服务运行在云服务商上，并通过 NAT 网关和弹性 IP 地址访问互联网，那么你的流量可能来自各种各样的 IP 地址，甚至可能是整个子网。这可能需要一个庞大的 IP 封锁列表来覆盖，例如涵盖整个 AWS 地址块，以防你的服务恰好被分配到其中某个地址块。这让攻击者的活儿轻松了许多：他们只需从其中某个云服务商发起攻击，然后等待自己被分配到你允许的某个子网中的 IP 地址即可。

* 为了避免这个问题，一些公司把所有内部流量都经由单个 VPN 集中器或中央互联网网关转发，让所有流量看起来都来自同一个 IP 地址。然而，这种做法会给地理位置远离中央网关的设备带来大量额外延迟，还会引入单点故障和互联网带宽瓶颈。

尽管如此，采用 IP 封锁列表的服务仍是现实中的常态。如果你无法与自己的服务提供商建立安全的 VPN 隧道——例如因为你无权在托管服务商处安装任何软件，或者软件由第三方运营——IP 封锁列表仍被视为最佳实践（此外还应采取其他[安全措施][docs-security-hardening]）。

## 使用 Tailscale 应用连接器改进 IP 封锁列表

在纯 [Tailscale 网络][docs-tailnet]中，你不需要 IP 封锁列表，因为你有更好的东西：[Tailscale 的安全 IP 地址][docs-tailscale-ip-addresses]，这些地址不允许在物理网络上通行。你还有 [Tailscale 基于角色的访问控制策略][docs-access-control]，可以配置哪些用户群组被允许访问特定服务器。这让你能构建类似中央 IP 封锁列表的东西，只不过用加密密钥而非 IP 地址来做保护。

然而，大多数网络并非纯 Tailscale，你最终难免要与第三方服务集成。所幸，Tailscale 可以帮你大幅缩小 IP 封锁列表的规模（从而缩小攻击面），同时又不必将网络访问集中化。这种方式还能让你的用户从任何地方访问该服务。

要借助 Tailscale 改进 IP 封锁列表，可以设置一个[应用连接器][docs-app-connectors]（app connector），让特定应用的流量经由单个 IP 地址转发。这个 IP 地址就是唯一需要列入 IP 封锁列表的地址。应用连接器充当子网路由器，让你的 Tailscale 网络能够访问该外部服务。

> **提示：**
>
> 你也可以使用一小组 IP 地址，并通过 [IP set][docs-ipsets] 在 tailnet 策略文件中管理它们。

[docs-access-control]: /docs/features/access-control

[docs-app-connectors]: /docs/features/app-connectors

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-serverless]: /docs/integration-serverless-apps

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[xt-wiki-security-obscurity]: https://en.wikipedia.org/wiki/Security_through_obscurity
