---
title: "术语与概念"
description: "了解 Tailscale 的术语与概念。"
---

最后验证于 Jan 12, 2026

## 访问控制列表（ACL）

[访问控制列表][docs-acls]（ACL）通过 [tailnet 策略文件][ar-tailnet-policy-file]中的规则管理系统访问。你可以使用 ACL 管理谁和什么能使用哪些资源，从而过滤流量并增强安全性。

## 标签（tag）

[标签][docs-tags]（tag）让你可以把一个[身份][ar-identity-provider]（独立于人类用户）分配给[设备][ar-device]。你可以在[访问规则][docs-acls]中使用标签来限制访问。

## 管理控制台

管理控制台（admin console）是管理你的 Tailscale 网络（即 [tailnet][ar-tailnet]）的中心位置。你可以管理网络中的设备、用户及其权限，以及密钥过期等设置。管理控制台还会在你的设备有 Tailscale 客户端更新可用时提醒你。当你在管理控制台中做出更改时，[协调服务器][docs-coordination-server]会立即把这些更改更新到你的 tailnet。

你可以通过[管理控制台](https://console.tailscale.com/admin)访问它。

## API

API 是 application programming interface（应用程序编程接口）的缩写。API 定义了一组以编程方式与应用或服务交互的规则。[Tailscale API][co-api] 让你能够管理你的 Tailscale 账户和 tailnet。

## CLI

CLI 是 command line interface（命令行界面）的缩写。Tailscale [CLI][docs-cli] 包含一套功能完备的命令，其中有些功能是 GUI 应用可能不具备的。在 Linux、macOS 或 Windows 上安装 Tailscale 时，Tailscale CLI 会自动安装。

## 客户端

Tailscale 客户端是运行在设备上的软件应用，使设备能够加入并参与 [tailnet][ar-tailnet]。客户端使用 [WireGuard][ar-wireguard] 协议创建加密的点对点连接。客户端支持多种操作系统，其大部分代码是[开源][co-open-source]的。

## 协调服务器

[协调服务器][docs-coordination-server]是一台中央服务器，与你 [Tailscale 网络][ar-tailnet]中的所有设备保持连接。它管理[加密][docs-encryption]密钥、网络变更和访问策略变更，并与你 Tailscale 网络中的所有设备保持连接。协调服务器属于[控制平面][docs-control-plane]，不属于[数据平面][docs-data-plane]。它不在设备之间中转流量，从而避免成为性能瓶颈。

## 设备

设备（device）是用户之外的任何东西。它可以是物理的或虚拟的，并在你的 Tailscale 网络上发送、接收或处理数据。

## 设备密钥

设备密钥（device key）是特定[设备][ar-device]唯一的公私钥对。多个用户可以使用同一个设备密钥，但每台设备只能有一个设备密钥。特定用户与设备密钥的组合即代表一台唯一的设备。

## 防火墙

防火墙（firewall）限制两点之间可以通过哪些网络流量。防火墙可以是硬件的或软件的。Tailscale 内置一个防火墙，由该域的[访问规则][docs-acls]定义。

## 全隧道

在传统虚拟专用网络（VPN）中，全隧道（full tunnel）指客户端的所有流量（包括发往互联网的流量）都经由 VPN 发送的配置。在 Tailscale 中，你可以把网络上的一台设备设置为[出口节点][docs-exit-nodes]来路由所有发往互联网的流量。如果你的客户端配置为使用出口节点，同时还有通往其他 Tailscale [设备][ar-device]、[子网路由器][docs-subnets]或[应用连接器][docs-app-connectors]的路由或连接，那么 Tailscale 仍会以[分流隧道][ar-split-tunnel] VPN 的方式运作，直接把流量路由到各个端点，而不先经出口节点转发。

## 身份提供方（IdP）

身份提供方（identity provider）是用户向 [tailnet][docs-tailnet] 进行身份验证的方式。[身份提供方][docs-sso-providers]的例子包括 Google、Okta 和 Microsoft。Tailscale 本身不是身份提供方，而是依赖其他身份提供方进行身份验证。

## 密钥过期

密钥过期（key expiry）指加密密钥有效期的结束。过期密钥无法再加密或解密数据，也无法再向 Tailscale 网络验证设备身份。

使用 Tailscale 意味着你永远无需直接管理[加密][docs-encryption]密钥。Tailscale 会自动让密钥过期，并要求定期重新生成。你可以在管理控制台中为长期运行的设备禁用密钥过期。

## MagicDNS

[MagicDNS][docs-magicdns] 自动为 Tailscale 网络中的设备注册易记的主机名。它还扩展并改进了 DNS 功能。

## NAT 穿透

NAT 是 [network address translation][xt-wikipedia-nat]（网络地址转换）的缩写。[NAT 穿透][bl-how-nat-traversal-works]是一种让设备跨越防火墙等障碍、在互联网上相互连接的方法。由于防火墙和执行网络地址转换的设备，大多数互联网设备无法直接互相通信。[NAT 穿透][bl-how-tailscale-control-plane]能够绕开这些障碍，让[数据穿越网络][ar-nat-traversal]。

## 网络拓扑

网络拓扑是网络中设备的排布方式，展示设备之间的连接关系。网络拓扑的例子包括星型、总线型、中心辐射型（hub-and-spoke）、网状（mesh）和混合型。

传统虚拟专用网络（VPN）使用[中心辐射拓扑][bl-tailscale-how-hub-spoke]。在这种设置下，每台设备之间的通信都要把全部流量经过一台中央网关设备。Tailscale 则以[网状拓扑][bl-how-tailscale-mesh-networks]运作，每台设备都可以借助 [NAT 穿透][ar-nat-traversal]直接与其他设备通信。

## 节点

节点（node）是用户与[设备][ar-device]的组合。

## 覆盖网络

覆盖网络（overlay network）是构建在[底层网络][ar-underlay-network]之上的虚拟网络，其中的节点使用逻辑地址和加密隧道通信，与底层网络的编址或拓扑无关。Tailscale 构成一个覆盖网络（即 [tailnet][ar-tailnet]），无论底层网络如何变化，都能给每个节点提供稳定的身份和 IP 地址。

## 对端

对端（peer）是你的设备想要与之通信的另一个[节点][ar-node]。对端可能与你在同一个域中，也可能不在。

## 中继

中继（relay）是在网络中的两台或多台设备之间传递数据的中间服务器。Tailscale 使用一种特殊类型的全球分布式中继服务器，称为 [Designated Encrypted Relay for Packets（DERP）][docs-derp-servers]。当 NAT 穿透失败时，DERP 中继服务器充当连接设备的后备手段。

## 分流隧道

与[全隧道][ar-full-tunnel]相对，分流隧道（split tunnel）指只有部分流量（特定 IP 段、域名或子网）经由 VPN 发送、其余流量则通过设备的本地互联网网关直接上网的 VPN 配置。在 Tailscale 中，这意味着只有发往其他 Tailscale [设备][ar-device]、[子网路由器][docs-subnets]或[应用连接器][docs-app-connectors]的流量使用 tailnet，一般互联网流量保持原样。

## SSO

SSO 是 [single sign-on][docs-sso-providers]（单点登录）的缩写。单点登录让用户可以使用一个站点的身份登录另一个站点。

## Tailnet

[tailnet][docs-tailnet] 是 Tailscale 网络的另一种说法，它是用户、设备和资源相互连接的集合。该网络拥有协同工作的[控制平面][docs-control-plane]和[数据平面][docs-data-plane]，共同管理访问并在设备之间传送数据。

tailnet 分为个人 tailnet 和组织 tailnet。个人 tailnet 是共享域名的单用户 tailnet（例如 `gmail.com`）；组织 tailnet 是自定义域名的 tailnet（例如 `example.com`）。

## tailnet 策略文件

tailnet 策略文件存储你的 Tailscale 网络的访问规则以及其他 tailnet 配置项。它使用 [human JSON（HuJSON）][xt-gh-tailscale-hujson]格式，并遵循 [Tailscale 策略语法][docs-policy-syntax]。

## Tailscalar

Tailscalar 指 Tailscale 的员工。

## Tailscale IP 地址

[Tailscale IP 地址][ar-tailscale-ip-address]是分配给你 Tailscale 网络中每台设备的[唯一 IP 地址][docs-ip-and-dns-addresses]。它始终采用 `100.x.y.z` 的形式（例如 `100.100.123.123`）。即使你在家庭宽带、蜂窝网络或咖啡店 Wi-Fi 之间切换，它也保持不变。

## 隧道

在网络领域，隧道（tunnel）是网络中一个或多个点之间的封装连接。它让用户、设备或资源能够通过公共数据网络安全地通信。

## 底层网络

底层网络（underlay network）是 Tailscale 运行其上的物理或既有 IP 网络，例如你的家庭 Wi-Fi、办公室局域网，或云/数据中心的互联网连接。Tailscale 利用这个底层进行实际的数据包传输，并在其上创建一个[覆盖网络][ar-overlay-network]，由后者负责加密、NAT 穿透、访问控制等诸多功能。

## WireGuard

[WireGuard][xt-wireguard] 是 Tailscale 使用的底层加密协议。

[ar-device]: #设备

[ar-full-tunnel]: #全隧道

[ar-identity-provider]: #身份提供方idp

[ar-nat-traversal]: #nat-穿透

[ar-node]: #节点

[ar-overlay-network]: #覆盖网络

[ar-tailnet-policy-file]: #tailnet-策略文件

[ar-tailnet]: #tailnet

[ar-tailscale-ip-address]: #tailscale-ip-地址

[ar-split-tunnel]: #分流隧道

[ar-underlay-network]: #底层网络

[ar-wireguard]: #wireguard

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[bl-how-tailscale-control-plane]: https://tailscale.com/blog/how-tailscale-works#the-control-plane-key-exchange-and-coordination

[bl-how-tailscale-mesh-networks]: https://tailscale.com/blog/how-tailscale-works#mesh-networks

[bl-tailscale-how-hub-spoke]: https://tailscale.com/blog/how-tailscale-works#hub-and-spoke-networks

[co-api]: https://tailscale.com/api

[co-open-source]: https://tailscale.com/opensource

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors/how-to/setup

[docs-cli]: /docs/reference/tailscale-cli

[docs-control-plane]: /docs/concepts/control-data-planes#control-plane

[docs-coordination-server]: /docs/concepts/control-data-planes#coordination-server

[docs-data-plane]: /docs/concepts/control-data-planes#data-plane

[docs-derp-servers]: /docs/reference/derp-servers

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-magicdns]: /docs/features/magicdns

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet]: /docs/concepts/tailnet

[xt-gh-tailscale-hujson]: https://github.com/tailscale/hujson

[xt-wikipedia-nat]: https://en.wikipedia.org/wiki/Network_address_translation

[xt-wireguard]: https://www.wireguard.com
