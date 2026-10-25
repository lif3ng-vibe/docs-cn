---
title: "为任何遗留服务添加多因素认证"
description: "了解 Tailscale 如何与 SSO 提供方集成进行身份验证，包括 2FA/MFA。"
---

最后验证于 Jan 5, 2026

公司规模越大，就越可能存在一些"遗留"服务器——它们还能用，但安全团队对它们颇有微词，因为它们无法配合你最新的安全特性，尤其是多因素认证（MFA）。

Tailscale 与你[现有的单点登录（SSO）提供方][docs-idp]集成进行身份验证（包括多因素认证）。随后，我们作为网络本身的一部分来执行连接策略和授权控制。如果某人不被允许访问某台服务器，该服务器会从其网络设备列表中彻底消失，变得无法访问，自然也不会被密码猜测或钓鱼攻击得手。

Tailscale 让你能够对所有遗留服务器应用 MFA，包括：

* Windows 文件共享
* 远程桌面（RDP、Windows Terminal Services）
* Citrix
* SSH
* 数据库服务器，包括 Oracle、MS SQL、MySQL 和 PostgreSQL
* 自定义客户端-服务器应用（即使不是基于 Web 的应用也一样）
* 任意 Web 应用

无需任何应用级集成或重新配置，因为安全机制内置于网络本身。只要把网络配置为必须经过 Tailscale，你的所有内部服务就都会受到多因素认证的保护。

[docs-idp]: /docs/integrations/identity
