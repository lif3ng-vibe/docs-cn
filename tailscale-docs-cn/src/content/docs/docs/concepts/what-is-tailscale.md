---
title: "Tailscale 是什么？"
description: "简要介绍 Tailscale。"
---

最后验证于 Sep 30, 2025

Tailscale 是一个基于身份的零信任连接平台，可取代你的旧式 VPN、SASE 和 PAM，连接远程团队、多云环境、CI/CD 流水线、边缘与物联网设备以及 AI 工作负载。

开箱即用，Tailscale 能解决许多令人头疼的组网问题。它的配置可以定制，满足管理分布式团队的各种需求。Tailscale 帮助你为内部自托管应用和外部第三方应用做好供应。随着需求变化，它也能随之扩展。

对 [DevOps][co-solutions-devops]、[IT][co-solutions-it] 和[安全][co-solutions-security]团队而言，Tailscale 都是理想之选。

## 技术细节

Tailscale 是一个安全的组网方案，让跨网络的设备与服务能够便捷、安全地互联。它使用开源的 [WireGuard][xt-wireguard] 协议建立加密的点对点连接，这意味着只有你私有网络中的设备才能相互通信。

Tailscale 创建的是点对点 mesh 网络（称为 tailnet）。不过，你也可以把全部流量经由[出口节点][docs-exit-node]路由，像传统 VPN 一样使用 Tailscale。

*（图：查尔斯顿的一位用户经圣地亚哥的网关连接纽约的一台计算机。网关在另一端海岸，导致高延迟。）*

图 1(a)：中央网关离用户可能近也可能远，因而可能带来更高延迟。由于流量集中，它还可能成为瓶颈，进一步拖慢连接。

*（图：同样这位查尔斯顿的用户，借助 Tailscale 直连纽约的那台计算机。）*

图 1(b)：使用 Tailscale 后，设备之间直接互连，延迟更低。

Tailscale 的方式尽可能避免中心化，由于网络流量可以在设备之间直接流动，因此能同时获得[更高吞吐量][bl-more-throughput]和更低延迟。此外，去中心化减少了单点故障，提升了稳定性和可靠性。

> **提示：**
>
> 更多信息请参阅 [Tailscale 的工作原理][bl-how-tailscale-works]。

## 优势

Tailscale 的几大关键优势包括：设备之间安全私密的连接、灵活的网络拓扑，以及简便的部署。Tailscale 还是跨平台的、不挑基础设施且高度可配置的。它支持你需要的[功能][co-features]和你正在使用的[集成][co-integrations]。

> **提示：**
>
> 更多信息请参阅[为什么 Tailscale 适合你][co-why-tailscale]。

### 部署简便

几分钟内即可部署一个 tailnet，无需繁琐的配置、服务器搭建或专业组网知识。创建账户后，只要验证两台或更多设备，就会自动创建一个带有合理[默认访问策略][docs-acl-samples-allow-all-default-acl]的 tailnet。

tailnet 设备之间的连接可以无缝穿越防火墙和[网络地址转换（NAT）][bl-how-nat-traversal-works]，无需端口转发或复杂的防火墙规则。这种“零配置”方式大幅降低了实现安全组网的技术门槛，让技术背景和非技术背景的用户都能轻松上手。

### 安全与隐私

[Tailscale 的安全模型][co-security]建立在现代、经过验证的技术和最佳实践之上，例如端到端[加密][docs-encryption]和[零信任架构][docs-zero-trust]。其核心是 WireGuard——一个以安全性和性能著称的先进 VPN 协议。在此基础之上，Tailscale 还致力于[合规][co-security-compliance]、[安全策略][co-security-policies]以及[访问控制策略][docs-access-control]和 [Tailnet Lock][docs-tailnet-lock] 等[安全功能][co-security-features]。

### 可扩展性与适应性

Tailscale 灵活架构的设计初衷就是随组织需求无缝成长。无论是从一个小团队扩张为大型企业，还是扩展到多个地理区域，Tailscale 在规模化后依然保持其性能与安全特性。其架构的分布式特性意味着，添加新设备或新用户不会产生传统 VPN 方案常见的瓶颈。

## 使用场景

凭借低上手门槛、多面手般的能力和强大功能，Tailscale 可以从个人使用无缝扩展到企业级部署。开发者可以用它与团队共享开发中的功能，家庭实验室爱好者可以用它[远程访问自己的媒体服务器][co-homelab]，企业可以用它[保护分布式办公团队][co-zero-trust-networking]——而且完全不必忍受传统基础设施搭建与维护的麻烦和开销。

* 企业虚拟专用网络（VPN）：取代旧式 VPN，实现对基础设施的安全远程访问。
* 特权访问管理（PAM）：以即时访问和可靠的录制能力实现零信任。
* 工作负载连接：连接流水线、应用和 Kubernetes 工作负载。
* 持续集成与持续交付（或部署）（CI/CD）：对每个 runner 和工作负载的细粒度安全访问。
* 边缘与物联网（IoT）：访问、管理和监控成千上万台设备。
* 人工智能（AI）安全防护：面向 AI 智能体和用户的统一 AI 治理。

> **提示：**
>
> 更多信息请参阅 [Tailscale 客户案例][co-customers]和 [Tailscale 使用场景][docs-use-cases]！

## 开始使用

上手非常简单：创建一个账户，安装 Tailscale 客户端，然后在两台或更多设备上登录即可。详情请参阅[快速开始指南][docs-install]。

> **提示：**
>
> 想与我们保持联系，请[订阅我们的通讯][bl-blog]。
>
> 你也可以在 [Twitter][xt-twitter-tailscale]、[Hachyderm][xt-tailscale-hachyderm] 和 [YouTube][xt-tailscale-youtube] 上关注我们。

[bl-blog]: https://tailscale.com/blog#blog-newsletter

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[bl-more-throughput]: https://tailscale.com/blog/more-throughput

[co-customers]: https://tailscale.com/customers

[co-features]: https://tailscale.com/features

[co-homelab]: https://tailscale.com/use-cases/homelab

[co-integrations]: https://tailscale.com/integrations

[co-security-compliance]: https://tailscale.com/security#compliance-and-certifications

[co-security-features]: https://tailscale.com/security#security-features

[co-security-policies]: https://tailscale.com/security-policies

[co-security]: https://tailscale.com/security

[co-solutions-devops]: https://tailscale.com/solutions/devops

[co-solutions-it]: https://tailscale.com/solutions/it

[co-solutions-security]: https://tailscale.com/solutions/security

[co-why-tailscale]: https://tailscale.com/why-tailscale

[co-zero-trust-networking]: https://tailscale.com/use-cases/zero-trust-networking

[docs-access-control]: /docs/features/access-control

[docs-acl-samples-allow-all-default-acl]: /docs/reference/examples/acls#允许所有默认-acl

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-node]: /docs/features/exit-nodes

[docs-install]: /docs/how-to/quickstart

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-use-cases]: /docs/use-cases

[docs-zero-trust]: /docs/concepts/zero-trust

[xt-tailscale-hachyderm]: https://hachyderm.io/@tailscale

[xt-tailscale-youtube]: https://www.youtube.com/@Tailscale

[xt-twitter-tailscale]: https://twitter.com/tailscale

[xt-wireguard]: https://www.wireguard.com
