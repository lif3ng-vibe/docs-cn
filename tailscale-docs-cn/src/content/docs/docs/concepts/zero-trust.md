---
title: "\"零信任网络\"的定义"
description: "了解零信任网络（Zero Trust Networking）的含义。"
---

最后验证于 Jan 5, 2026

零信任网络（Zero Trust Networking，ZTN）是一种源自 Google [BeyondCorp][xt-google-beyond-corp] 设计的架构。

虽然现在许多产品都打着“零信任”的旗号，但它究竟指什么往往并不明确。我们把它概括为一句话：零信任意味着你再也不能信任物理网络了。

## 历史

传统网络安全是“外硬内软”：外壳坚硬酥脆，内里绵软易嚼。在这种设计里，你在“私有”网络与“互联网”的边界处放一道企业防火墙。但防火墙之内，安全措施通常松懈得多。一旦攻击者进入私有网络，游戏就结束了。

这种旧架构的问题早已为人所知多年，但斯诺登披露的入侵内幕——攻击者如何渗透 Google 和 Yahoo 的私有网络，包括那张著名的 [SSL added and removed here :)][xt-wapo-nsa] 便利贴——才让这一问题成为焦点。

政府和持续性攻击者一直在积极入侵大公司的物理网络。更不用说未加密的 DNS，以及你家附近咖啡馆里毫无防护的公共 Wi-Fi 了。

## 解决方案：端到端加密

从概念上讲，解决方案很简单：不要在防火墙处“加上又去掉”加密，而是给每台设备、每个服务都围上防火墙，并确保任意两个端点之间的会话始终加密。这样一来，即使攻击者能物理接入网络，能拿到的也只是一堆毫无意义的加密数据包。

此外，即使他们攻陷了一台不安全的设备，也只能看到直接进出该设备的流量。通过严格限制网络中每个服务接受哪些加密密钥，零信任网络能够阻止或大幅延缓从一台失陷设备向下一台的“横向移动”。

## 渐进式零信任

如今每个安全团队都想迁移到零信任架构，但这令人望而生畏。加密本身不难——如今什么设备都支持 HTTPS——难的是部署证书和加密密钥。虽然我们称之为“零信任”，但真正落地一个零信任网络需要许多受信任的组件：证书颁发机构、身份提供方、授权与策略引擎等等。

为了简化落地过程，我们建议分几步推进：

1. 首先，保护每个用户设备的安全。不要把物理办公网络直连到你的服务器网络（它们可能位于数据中心或云端），而是使用 WireGuard® 或 Tailscale 这类加密连接，把每台最终用户设备连接到各个服务器网络上的[子网路由器][docs-subnets]。这能消除总部或分支机构层面遭受物理网络攻击的风险。

   在这一步，你还算不上真正的“零信任”：你不必再信任办公室里的物理网络，但仍然信任数据中心或云 VPC 中的“物理”（有时是虚拟）网络。

2. 接下来，为你最有价值的服务器逐一添加端到端加密。用户设备将能够直接与新配置的服务器建立加密链路，从而在这些链路上消除“SSL added and removed here”的问题。

   一旦某台服务器启用了端到端加密，并且所有流量都已迁移到加密链路上，就应当彻底禁用发往该服务器的非加密流量，将其完全锁死。

3. 最后，把某个子网上的全部服务器完全迁移到端到端加密的零信任模型之后，彻底停用该子网的子网路由器。

4. 按需对每个地点的每个子网重复上述步骤。

## 顺势推荐

自然，我们建议在上述每一步中都逐步部署 Tailscale。

* Tailscale 提供原生客户端应用，支持运行 Windows、macOS、iOS、Android 和 Linux 的用户设备。

* Tailscale 支持[子网路由器][docs-subnets]组成的 mesh，可任意组合 IPv4 与 [IPv6][docs-ipv6]。它在所有子网之间直接构成 mesh，而不是经由中央瓶颈点路由，从而把延迟降到最低。

* Tailscale 支持零信任与子网路由的混合配置，便于以谨慎、渐进的方式迁移大型网络。

* Tailscale 与你的[企业 SSO][docs-sso-providers] 集成，包办登录、密钥分发、[密钥轮换][bl-rotate-ssh-keys]、包过滤和[访问控制][docs-access-control]的所有问题。

更多内容请阅读 [Tailscale 的工作原理][bl-how-tailscale-works]。

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[bl-rotate-ssh-keys]: https://tailscale.com/blog/rotate-ssh-keys

[docs-access-control]: /docs/features/access-control

[docs-ipv6]: /docs/concepts/ipv6

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[xt-google-beyond-corp]: https://research.google/pubs/pub43231

[xt-wapo-nsa]: https://www.washingtonpost.com/world/national-security/nsa-infiltrates-links-to-yahoo-google-data-centers-worldwide-snowden-documents-say/2013/10/30/e51d661e-4166-11e3-8b74-d89d714ca4dd_story.html
