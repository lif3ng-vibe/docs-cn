---
title: "技术概览"
description: "深入了解 Tailscale 的技术细节。"
---

最后验证于 Feb 13, 2025

本节包含关于 Tailscale 网络（即 tailnet）中网络与安全主题的深入内容。

## 网络与设备连接

Tailscale 通过底层技术让你的网络现代化，安全地连接用户、服务和设备。

[**从家中沙发到办公室和总部的 VPN**](/docs/concepts/all-your-offices) —— Tailscale 的加密、低延迟、简单配置，以及 SSO 和 MFA 等强大的访问控制，使其成为面向远程和分布式团队的理想现代办公 VPN 方案。

[**企业 VPN 详解**](/docs/concepts/corporate-vpn) —— 通过直接的设备到设备加密、无缝的身份提供方集成和灵活的访问控制来保护你的企业 VPN。

[**弃用复杂的物理网络（有线和 Wi-Fi）安全方案**](/docs/concepts/deprecated-physical-security) —— 使用 Tailscale 告别复杂的物理网络。

[**在数据中心与 Pod 之间透明互联微服务**](/docs/concepts/interconnect-microservices) —— 使用 Tailscale 在数据中心与 Pod 之间透明地互联微服务。

[**随处部署内部应用，无需更改防火墙设置**](/docs/concepts/internal-apps-anywhere) —— 使用 Tailscale，无需修改防火墙设置即可部署服务器。

[**无论把公司笔记本落在哪，都能连上它**](/docs/concepts/laptop-anywhere) —— 无论你的公司笔记本电脑在哪里，都能连接到它。

[**从任何地方连接同事的本地服务器**](/docs/concepts/local-team-server) —— 了解 Tailscale 如何帮助你安全地连接到同事和服务器。

[**Tailscale 如何分配 IP 地址**](/docs/concepts/ip-and-dns-addresses) —— 了解 Tailscale 如何基于设备和授权凭证分配稳定的 IP 地址。

[**设备连接**](/docs/reference/device-connectivity) —— 了解 Tailscale 设备之间的连接方式。

[**DERP 服务器**](/docs/reference/derp-servers) —— Tailscale 使用 Designated Encrypted Relay for Packets（DERP）服务器在 tailnet 内实现安全、低延迟的连接。自定义选项让你可以优化设备通信和 NAT 穿透。

[**客户端 netmap 缓存**](/docs/reference/client-side-netmap-caching) —— 在控制平面暂时不可用的场景下，使用客户端 netmap 缓存来保持与对等节点的持续连接。

[**CGNAT 互操作性**](/docs/reference/cgnat-interoperability) —— 禁用 CGNAT 丢弃规则，让 Tailscale 与使用运营商级 NAT（CGNAT）地址空间的网络共存。

[**IPv4 与 IPv6 常见问题**](/docs/reference/faq/ipv6) —— 解答与 IPv6 相关的常见问题。

[**为任何旧式服务添加多因素认证**](/docs/reference/multifactor-auth) —— 探索 Tailscale 如何与 SSO 提供商集成进行身份验证，包括 2FA/MFA。

[**用 Tailscale 和 WireGuard 取代站点到站点 VPN**](/docs/reference/subnet-site-to-site) —— 使用 Tailscale 实现站点到站点 VPN，在本地网络之间转发网络流量。

[**动态 IP 地址下的 WireGuard VPN**](/docs/reference/wireguard-dynamic-ip) —— WireGuard VPN 如何在动态 IP 地址下工作。

## 安全、身份验证与加密

Tailscale 基于身份为 tailnet 流量实施安全的授权与加密。

[**使用 Tailscale 保护你的 SSH 服务器**](/docs/reference/ssh-over-tailscale) —— 了解 Tailscale 如何与 SSH 客户端和 SSH 服务器良好配合，提升安全性并带来更好的用户体验。

[**节点密钥**](/docs/concepts/node-keys) —— Tailscale 如何使用节点密钥（node key）作为控制哪些机器可以加入 tailnet 的机制。

[**Tailscale 加密**](/docs/concepts/tailscale-encryption) —— 了解 Tailscale 如何使用加密。

[**Tailscale 身份**](/docs/concepts/tailscale-identity) —— 了解 Tailscale 中身份的建立与使用方式。
