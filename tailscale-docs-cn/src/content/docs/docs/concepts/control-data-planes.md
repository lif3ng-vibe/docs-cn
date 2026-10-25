---
title: "控制平面与数据平面"
description: "了解 Tailscale 中的控制平面与数据平面。"
---

最后验证于 Jan 5, 2026

现代网络将自身的运作划分为两个协同工作的独立平面：[控制平面][ar-control-plane]和[数据平面][ar-data-plane]。这两个平面保持持续的通信，这种划分有助于梳理网络运作，使网络更易于管理、更高效、更可靠。

在 Tailscale 网络（即 [tailnet][docs-tailnet]）中，控制平面通过 Tailscale [协调服务][ar-coordination-server]（coordination service）运作，而数据平面则运行在每台 tailnet 设备上。

## 控制平面

控制平面是网络的重要组成部分，负责管理数据如何流经[数据平面][ar-data-plane]。你可以把控制平面想象成空中交通管制员：它监督整个网络并做出高层决策。它执行许多任务，包括身份管理、网络配置、连接协调和策略管理。

* 控制平面的认证与身份功能包括验证设备身份、维护[访问控制][docs-access-control]策略、跟踪设备的注册与移除，以及管理设备的授权状态。
* 控制平面的网络设置与维护功能包括分发子网路由、配置 DNS 设置、管理 [IP 地址分配][docs-ip-and-dns-addresses]，以及更新网络配置。
* 控制平面的连接协调功能包括管理 [NAT 穿透][bl-how-nat-traversal-works]、对等发现（peer discovery）、分发设备信息、选择最优 [DERP][docs-derp-servers] 区域，以及维护设备状态信息。
* 控制平面的策略管理功能包括执行[访问控制][docs-access-control]策略、管理[子网路由][docs-subnets]规则、落实[出口节点][docs-exit-nodes]配置，以及管理权限。

### 协调服务

Tailscale 协调服务管理[控制平面][ar-control-plane]的运作，并维持与所有 tailnet 设备的连接。它负责设备发现、认证、[密钥分发][bl-tailscale-key-management]和策略执行等核心功能。它还将路由配置和访问控制策略下发给 tailnet 设备上的 Tailscale 客户端，由客户端将这些高层指令转换为[数据平面][ar-data-plane]可执行的最底层配置。

此外，协调服务通过管理设备间的端点信息，并在无法建立[直连][docs-connection-types]时选择最优的 [DERP][docs-derp-servers] 区域，来实现 NAT 穿透。

> **注意：**
>
> 如果[协调服务变得不可用][docs-offline-coordination-server]，tailnet 设备仍可通过预先建立的连接互相通信，并使用缓存的网络策略。但是，在协调服务恢复在线之前，它们将无法建立新连接、更换密钥或获取网络策略更新。这是因为 Tailscale 不会让任何流量经过协调服务，设备密钥存储在本地，而网络策略也在本地缓存。

#### 设备发现与 NAT 穿透

协调服务的核心功能之一是维护 tailnet 中所有设备的注册表。它还收集并管理设备信息，例如 IP 地址、Tailscale 客户端版本、公钥、位置和操作系统。协调服务利用这些信息在 Tailscale 管理控制台上填充设备数据、选择 [DERP 服务器][docs-derp-servers]、应用[设备态势][docs-device-posture]策略，以及促成设备间的连接。

#### 状态、策略与配置

Tailscale 协调服务在整个 tailnet 范围内收集并分发这些设备与网络信息，包括：

* 设备元数据，例如 [IP 地址][docs-ip-and-dns-addresses]、Tailscale 客户端版本、操作系统和地理位置。
* 设备公钥和证书。
* 网络配置，例如 [DNS][docs-dns] 名称服务器和首选 DERP 服务器。
* 策略，例如访问控制策略、[设备态势][docs-device-posture]策略和其他安全策略。

将这些信息保存在协调服务上，有助于实现诸如通过 DERP 服务器促成 [NAT 穿透][bl-how-nat-traversal-works]、保持整个 tailnet 配置同步、确保访问控制策略得到执行，以及在管理控制台上呈现数据等目标。

#### 认证、授权与密钥分发

传统的集中式协调服务实现可能会自行管理认证，而 Tailscale 的协调服务不处理用户认证。认证被外包给 [OAuth 2.0][docs-oauth-clients]、[OpenID Connect][docs-sso-custom-oidc] 或[身份提供方][docs-sso-providers]（IdP），让你可以通过 GitHub 或 Google 等现有提供方来维护用户账户。不过，协调服务确实会管理认证令牌及其生命周期，并执行[访问控制][docs-access-control]策略。

所有设备公钥都存储在协调服务上。协调服务只允许设备访问其被授权访问的设备和资源的公钥。因此，除非你授予访问权限，否则 tailnet 中的设备不会感知其他设备的存在。

## 数据平面

数据平面运行在 tailnet 内的各台设备上，使用 [WireGuard][docs-wireguard] 协议处理加密数据在设备间的实际传输。

数据平面负责数据包的[加密][docs-encryption]、应用来自[控制平面][ar-control-plane]的路由规则，并处理数据包转发。它还负责建立连接、持续监控连接健康状况、管理带宽使用，并在网络状况变化时实施故障转移机制。

* 数据平面的设备间通信功能包括建立 WireGuard 隧道、加密和解密流量、管理设备间的直连、实现基于 UDP 的通信，以及处理连接迁移。
* 数据平面的数据包管理功能包括在设备间转发加密数据包、对流量应用路由规则、基于访问控制策略实施数据包过滤、管理数据包排队与优先级，以及处理数据包分片与重组。

[ar-control-plane]: #控制平面

[ar-coordination-server]: #协调服务

[ar-data-plane]: #数据平面

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-tailscale-works

[bl-tailscale-key-management]: https://tailscale.com/blog/tailscale-key-management

[docs-access-control]: /docs/features/access-control

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-posture]: /docs/features/device-posture

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-offline-coordination-server]: /docs/reference/coordination-server-down

[docs-sso-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-tailnet]: /docs/concepts/tailnet

[docs-wireguard]: /docs/concepts/wireguard
