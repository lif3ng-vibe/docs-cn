---
title: "Tailscale PAM 的架构与核心概念"
description: "概览 Tailscale PAM 的架构与核心概念。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

Tailscale PAM 为高可用和低延迟而设计，是 Tailscale 平台的一部分，把安全的应用访问与 Tailscale 全球分布的网络基础设施结合在一起。这让你能从任何位置快速、安全地访问 Tailscale 网络中的资源，而不增加运维负担。

以下小节介绍 Tailscale PAM 的架构与核心概念。

## 服务

Tailscale PAM 服务代表你在 Tailscale 网络中向用户开放的资源。可以是任何你需要安全暴露的服务，例如：

* HTTP/HTTPS
* SSH
* 数据库，例如：
  * Amazon RDS
  * Elasticsearch
  * Google Cloud SQL
  * Microsoft SQL Server
  * MongoDB
  * MySQL
  * PostgreSQL
  * Snowflake
* Kubernetes
* 远程桌面协议（RDP）
* 虚拟网络计算（VNC）
* 任意 TCP 端口

Tailscale PAM 会把用户会话安全地代理到这些 PAM 服务，并提供凭证注入、会话录制/回放等额外能力。

## 策略

策略是管理服务访问的关键。默认情况下，除非你明确授权，否则任何人都无法访问你的服务。传统防火墙基于 IP 地址和端口号限制访问，与此不同，Tailscale PAM 让你用更细粒度的条件控制访问，例如：

* **谁**：用户的身份。
* **访问什么**：具体的 PAM 服务。
* **从什么访问**：设备态势（device posture）或 MDM 要求。
* **何时**：始终允许或按请求放行。
* **从哪里**：IP 地址或国家/地区。

这种细粒度控制确保只有获得授权的用户才能在特定条件下访问你的服务。

策略在 [tailnet 策略文件][docs-tailnet-policy-file]中管理，你可以在 Tailscale 管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面访问它。

## 会话

会话代表用户与服务之间的连接。这让你能够追踪谁在何时从何处访问了什么资源。每条会话日志都包含以下细节：

* 用户单点登录（SSO）身份。
* IP 地址。
* 地理位置。
* 设备信息。
* 连接时间与时长。

此外，Tailscale PAM 提供会话录制功能，你可以回放 SSH、数据库、Kubernetes 和 HTTP/HTTPS 等服务的会话，精确审查会话期间发生了什么。这对安全审计或故障排查尤其有用。

## 连接器

Tailscale PAM 连接器是你的基础设施与 Tailscale 平台之间的桥梁，充当具有身份感知能力的应用代理。它处理以下关键功能：

* **会话终结**：安全地终结所有客户端会话。
* **策略执行**：实时评估策略以控制访问。
* **会话录制**：捕获会话数据用于审计和回放（SSH、数据库、HTTP/HTTPS）。
* **密钥注入**：无缝注入凭证和认证令牌。

连接器部署在你的基础设施内部，确保敏感流量保持私密。客户端与连接器之间的连接完全加密，这意味着 Tailscale PAM 永远看不到你的流量。你在享受平台易用性的同时，对安全性保有完全控制。

## 隧道

隧道是 Tailscale PAM 连接器与用户设备之间安全加密的连接，让私有资源的访问无缝进行。隧道提供以下功能：

* **加密**：隧道使用现代高性能 VPN 协议 [WireGuard][xt-wireguard] 建立端到端加密。
* **自动管理**：Tailscale PAM 平台自动管理隧道的创建和编排，用户无需手动设置。
* **无缝连接**：无论连接 SSH、数据库、Kubernetes 还是内部 Web 应用，隧道都提供安全、低延迟的访问，且不把服务暴露到互联网。

## 用户、组与身份提供方

Tailscale PAM 使用 [Tailscale 身份][docs-tailscale-identity]作为权威来源。tailnet 中的用户和组会自动与 Tailscale PAM 同步。

### Tailscale 角色如何映射到 Tailscale PAM 角色

同步时，每个用户的 [Tailscale 角色][docs-user-roles]决定其获得的 Tailscale PAM 角色。Tailscale PAM 有三种角色：**Admin**、**Read Only** 和 **Client Access Only**。Tailscale 角色与 Tailscale PAM 角色的映射如下：

| Tailscale 角色 | Tailscale PAM 角色 |
| --- | --- |
| [Owner][docs-user-roles-owner] | Admin |
| [Admin][docs-user-roles-admin] | Admin |
| [Member][docs-user-roles-member] | Client Access Only |
| [Billing admin][docs-user-roles-billing-admin] | Client Access Only |
| [IT admin][docs-user-roles-it-admin] | Admin |
| [Network admin][docs-user-roles-network-admin] | Read Only |
| [Auditor][docs-user-roles-auditor] | Read Only |

由于用户的 Tailscale PAM 角色派生自其 Tailscale 角色，在 Tailscale 管理控制台中更改该角色会自动更新其 Tailscale PAM 角色。

### Tailscale PAM 角色

以下是关于 Tailscale PAM 角色的说明：

* **Admin**：此角色拥有 Tailscale PAM 管理的全部特权，包括用户、组和服务账户的管理，以及修改所有配置和设置的能力。
* **Client Access Only**：此角色没有 Tailscale PAM 管理特权。把此角色分配给只作为 tailnet 中服务客户端的用户。对服务的访问通过 tailnet 策略文件管理。把拥有此角色的用户加入你的 tailnet，并不足以让该用户作为客户端访问服务。必须在挂接到目标服务的授权（grant）中引用该用户或服务账户，他们才能访问该服务。
* **Read Only**：此角色对 Tailscale PAM 配置有读权限，但没有写权限。

## Tailscale 客户端

[Tailscale 客户端][co-download]为最终用户提供现代化的图形用户界面（GUI），简化了连接服务和发现可用服务的过程。用户只需一步操作，即可安全访问自己有权限的任何服务，包括服务器、数据库、Web 应用、桌面和 Kubernetes 集群。

## 浏览器客户端

Tailscale PAM 的 [Border0 web 客户端](https://my.tailscale.com)让用户无需在桌面安装原生 Tailscale 客户端就能安全访问服务。浏览器客户端基于 [WebAssembly][xt-webassembly]（Wasm）构建。这种免客户端的浏览器访问方式能快速、无缝地访问你的服务。

浏览器客户端的主要优势包括：

* **无需安装**：直接从浏览器访问你的资源。
* **易用的资源发现**：可视化、直观的界面帮助用户弄清自己可以访问什么。
* **基于 Web 访问关键服务**：直接在浏览器中使用 SSH、数据库（MySQL/Postgres），甚至 RDP。
* **端到端加密**：借助 Wasm 驱动的 VPN 技术，浏览器客户端完全在浏览器中运行，确保连接始终完全加密且安全。

用户可以立即连接到自己的基础设施，无需复杂设置。

[co-download]: https://tailscale.com/download

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-user-roles-admin]: /docs/reference/user-roles#admin管理员

[docs-user-roles-auditor]: /docs/reference/user-roles#auditor审计员

[docs-user-roles-billing-admin]: /docs/reference/user-roles#billing-admin账单管理员

[docs-user-roles-it-admin]: /docs/reference/user-roles#it-adminit-管理员

[docs-user-roles-member]: /docs/reference/user-roles#member成员

[docs-user-roles-network-admin]: /docs/reference/user-roles#network-admin网络管理员

[docs-user-roles-owner]: /docs/reference/user-roles#owner所有者

[docs-user-roles]: /docs/reference/user-roles

[xt-webassembly]: https://webassembly.org

[xt-wireguard]: https://wireguard.com
