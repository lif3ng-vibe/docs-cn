---
title: "保护网络安全"
description: "预防 Tailscale 网络的安全问题。"
---

最后验证于 Jan 5, 2026

使用 Tailscale 的安全功能，帮助预防 Tailscale 网络（即 tailnet）的安全问题。

## 管理访问策略

访问控制策略让你能够为 tailnet 中的用户和设备精确定义权限。权限使用 [tailnet 策略文件语法][docs-policy-syntax]定义，并存储在 [tailnet 策略文件][docs-terminology-and-concepts-policy]中。

[**访问控制**](/docs/features/access-control)——了解 Tailscale 中可用的访问控制选项。

## 管理客户端访问

Tailscale 提供了安全访问 tailnet 设备以及管理 Tailscale 客户端应用的功能。

### Tailscale SSH

使用 Tailscale SSH，让 Tailscale 为你的 tailnet 管理 SSH 连接的认证与授权。你可以像以前一样使用 SSH，还可以选择使用检查模式（check mode）验证高风险连接。

[**Tailscale SSH**](/docs/features/tailscale-ssh)——使用 Tailscale SSH 管理 tailnet 中 SSH 连接的认证与授权。

### HTTPS 证书

tailnet 设备之间的连接是端到端加密的。然而，浏览器和 Web API 等并不知情，它们会因为你 tailnet 服务的 HTTP URL 看起来未加密而警告用户或禁用某些功能。要为你的服务器提供 TLS 证书，可以启用 HTTPS。

[**启用 HTTPS**](/docs/how-to/set-up-https-certificates)——为你的 Tailscale 网络中的设备配置 HTTPS。

### 移动设备管理

如果你正在使用移动设备管理（MDM）方案，可以在运行 Tailscale 的设备上应用一套系统策略。这些系统策略可用于自定义 Tailscale 客户端的行为，使其符合你所在组织的策略和使用场景。

[**使用系统策略自定义 Tailscale**](/docs/features/tailscale-system-policies)——可通过系统策略（包括 MDM）自定义 Tailscale 客户端的配置键列表。

## 管理 tailnet 安全

Tailscale 提供了帮助保护 tailnet 安全的功能，包括 tailnet 配置方面。

### Tailnet Lock

Tailnet Lock 提供了额外的安全保障：新加入 tailnet 的节点必须先由受信任的 Tailnet Lock 密钥签名，才允许连接其他节点。具体而言，Tailnet Lock 让你能够先以加密方式验证 Tailscale 协调服务器（coordination server）分发的公钥，再将其用于网络连接。

[**Tailnet Lock**](/docs/features/tailnet-lock)——确保除非 tailnet 中受信任的节点为新节点签名，否则任何节点都无法加入你的 tailnet。

### 安全

Tailscale 提供了帮助保护 tailnet 安全的建议。

[**保护 tailnet 安全的最佳实践**](/docs/reference/best-practices/security)——了解保障 Tailscale 网络安全的最佳实践。

### 共同责任

保护虚拟专用网络的安全，需要提供方与使用方共同承担责任。

[**共同责任模型**](/docs/concepts/shared-responsibility)——了解保护你的网络所需承担的责任。

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-terminology-and-concepts-policy]: /docs/reference/glossary#tailnet-策略文件
