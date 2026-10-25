---
title: "Tailscale 加密"
description: "了解 Tailscale 如何使用加密。"
---

最后验证于 Jan 7, 2026

[Tailscale 的架构][bl-how-tailscale-works]为所有网络通信提供端到端加密——无论设备是[直连][docs-connection-types-direct-connections]还是通过[中继连接][docs-connection-types-relayed-connections]，也无论它们位于同一本地网络还是相隔全球。该架构在控制平面和数据平面上使用多层加密，保护 Tailscale 网络（即 [tailnet][docs-tailnet]）中的所有设备连接。

以下各节将说明 Tailscale 在[控制平面与数据平面][ar-control-and-data-planes]、[NAT 穿透过程][ar-device-discovery-and-nat-traversal]以及 [Tailscale 生态][ar-encryption-across-tailscale]中对加密的运用。

> **注意：**
>
> 本文信息反映的是截至 **2024 年 12 月**的当前实现状态，不应被解读为承诺无限期维持这些具体机制。密码学领域仍在持续演进，Tailscale 的实现也很可能会随之调整，以纳入新的进展、应对新出现的安全需求。

## 控制平面与数据平面

控制平面与数据平面是协同管理和执行网络操作的基础网络组件。两个平面职责划分明确，以尽量降低安全事件的影响并支持独立扩展。[控制平面][ar-control-plane]负责管理数据如何流动，包括策略管理、路由、资源管理和信令（会话管理）。[数据平面][ar-data-plane]负责执行控制平面的指令，包括数据包转发、数据包处理和流量管理。实际上，控制平面做决策，数据平面执行决策。

> **提示：**
>
> [深入了解控制平面、数据平面与协调服务器][docs-control-data-planes]。

### 控制平面

在 Tailscale 中，控制平面承担许多任务，包括设备协调、身份验证、访问控制解析和数据包过滤器计算。

控制平面通信（包括密钥交换和设备连接协调）采用基于 [Noise IK][xt-noise-ik] 的自定义协议，并使用 [RFC7748][xt-rfc-7748] 所述的 [X25519][xt-rfc-7748-x25519]。在环境允许时，它可以直接运行在明文 TCP 之上；出于兼容性或额外安全要求的考虑，也支持在必要时用 TLS 包裹。

### 数据平面

Tailscale 的数据平面使用 [WireGuard][docs-wireguard] 作为加密 Tailscale 设备间通信的主要机制。关于 WireGuard 密码学设计的更多信息，请参阅 [WireGuard 白皮书][xt-wireguard-whitepaper]。

tailnet 设备起初通过 [DERP 服务器][docs-derp-servers]建立连接，然后在可能的情况下切换为直连。如果无法直连，设备会退回使用 DERP 服务器的中继连接。DERP 服务器永远不会接触你的未加密数据，它们只处理已经加密的 WireGuard 数据包。

设备与 DERP 服务器之间的连接在 TLS 之上使用 [NaCl box][xt-nacl-box] 构造进行身份验证，以确认客户端确实拥有其声称的 WireGuard 密钥。这确保只有持有正确私钥的设备才能与 DERP 服务器建立连接。

## 设备发现与 NAT 穿透

[Tailscale 的 NAT 穿透引擎][bl-how-nat-traversal-works]实现了一个用于路径发现的自定义 UDP 协议，使用 NaCl box 进行认证加密。该协议独立于主 WireGuard 数据平面运行，只会影响连接的效率，而不会影响所承载数据的安全性。

## Tailscale 生态中的加密

Tailscale 还在身份验证、[节点状态安全存储][ar-secure-node-state-storage]、[证书][ar-device-certificates]，以及[日志系统][ar-log-system]和 [Tailnet Lock][ar-tailnet-lock] 等功能中使用加密。

### 节点状态安全存储

Tailscale 设备可以配置为使用加密来实现[节点状态安全存储][docs-secure-node-state-storage]。

### 设备 TLS 证书

Tailscale 帮助你使用 [tailnet 的 MagicDNS 域][docs-tailnet-name-tailnet-dns-name]内的主机名，从 [Let's Encrypt][xt-lets-encrypt] 获取 [TLS 证书][docs-device-certs]。这些证书确保只有 tailnet 中经授权的设备才能为 MagicDNS 主机名出示有效的服务身份。

例如，在 `app.example-tailnet.ts.net` 上对外提供服务的服务，只有当它是你 tailnet 中经授权的设备时，才能出示有效的 TLS 证书。

### Tailnet Lock

[Tailnet Lock][docs-tailnet-lock] 功能使用 ED25519 签名进行身份验证。虽然该功能并不直接涉及加密，但它确保只有经指定审批者（不由 Tailscale 控制）授权的设备才能与 tailnet 中的设备通信。

### 日志系统

所有 Tailscale [日志数据][docs-log-mesh-traffic]都通过 TLS 发送，不再附加额外的身份验证或加密。

## TLS 与密码学

Tailscale 的 [TLS（传输层安全）][xt-transport-layer-security]实现基于 Go 的 [`crypto/tls`][xt-go-crypto-tls] 包，要求至少 TLS 1.2，同时支持 TLS 1.3。系统采用 Go 实现的默认密码套件选择机制，包括用于[前向保密][xt-perfect-forward-secrecy]的 ECDHE 和 AEAD 方案。AEAD 实现可以根据 AES 操作的硬件加速可用性，在 AES-128-GCM 与 ChaCha20-Poly1305 之间动态选择。

## 合规性

Tailscale 的密码学实现不符合 [FIPS][xt-federal-information-processing-standards] 要求，且部分原语选择（包括 Curve25519、[XSalsa20][xt-salsa20]、ChaCha20-Poly1305 以及 Noise 和 WireGuard 协议）在现行 FIPS 标准下无法做到合规。虽然这些实现经过密码学家审查并被认为安全——在许多情况下甚至比 FIPS 认可的替代方案更安全——但对于要求 FIPS 合规的组织来说，这可能是需要考虑的因素。更多信息请参阅 [Tailscale FedRAMP 与 FIPS-140 注意事项][docs-tailscale-fedramp-fips140]。

[ar-control-and-data-planes]: #控制平面与数据平面

[ar-control-plane]: #控制平面

[ar-data-plane]: #数据平面

[ar-device-certificates]: #设备-tls-证书

[ar-device-discovery-and-nat-traversal]: #设备发现与-nat-穿透

[ar-encryption-across-tailscale]: #tailscale-生态中的加密

[ar-log-system]: #日志系统

[ar-secure-node-state-storage]: #节点状态安全存储

[ar-tailnet-lock]: #tailnet-lock

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-connection-types-direct-connections]: /docs/reference/connection-types#direct-connections

[docs-connection-types-relayed-connections]: /docs/reference/connection-types#relayed-connections

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-certs]: /docs/how-to/set-up-https-certificates#provision-tls-certificates-for-your-devices

[docs-log-mesh-traffic]: /docs/features/logging

[docs-secure-node-state-storage]: /docs/features/secure-node-state-storage

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-name-tailnet-dns-name]: /docs/concepts/tailnet-name#tailnet-dns-名称

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-fedramp-fips140]: /docs/reference/tailscale-fedramp-fips140

[docs-wireguard]: /docs/concepts/wireguard

[xt-federal-information-processing-standards]: https://en.wikipedia.org/wiki/Federal_Information_Processing_Standards

[xt-go-crypto-tls]: https://pkg.go.dev/crypto/tls

[xt-lets-encrypt]: https://letsencrypt.org/

[xt-nacl-box]: https://pkg.go.dev/golang.org/x/crypto/nacl/box

[xt-noise-ik]: https://noiseexplorer.com/patterns/IK/

[xt-perfect-forward-secrecy]: https://www.eff.org/deeplinks/2013/08/pushing-perfect-forward-secrecy-important-web-privacy-protection

[xt-rfc-7748]: https://www.rfc-editor.org/rfc/rfc7748.html

[xt-salsa20]: https://en.wikipedia.org/wiki/Salsa20

[xt-transport-layer-security]: https://en.wikipedia.org/wiki/Transport_Layer_Security

[xt-wireguard-whitepaper]: https://www.wireguard.com/papers/wireguard.pdf

[xt-rfc-7748-x25519]: https://www.rfc-editor.org/rfc/rfc7748.html#section-5
