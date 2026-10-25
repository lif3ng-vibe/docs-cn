---
title: "共同责任模型"
description: "了解保护你的网络需要承担哪些责任。"
---

最后验证于 Jan 5, 2026

保障虚拟专用网络的安全需要提供方与用户共同承担责任。以下清单并不详尽，涵盖 Tailscale 与用户双方的责任。

## Tailscale 的责任

* **采用安全的软件开发实践**，适用于 Tailscale 客户端、协调服务器（coordination server）与中继服务器的开发。包括对源代码变更进行同行评审、定期审计源代码、排查潜在漏洞并开发补丁、定期更新依赖，以及按照核准流程构建、签名和发布软件。
* **加固并保护协调服务器**，包括加固托管服务商与数据库配置，以及加固操作系统并及时打补丁。还包括默认对数据进行加密和备份、基于业务需要限制对生产环境的访问，以及监控生产环境中的异常活动。
* **加固并保护 DERP 中继服务器**，包括加固托管服务商配置，以及加固操作系统并及时打补丁。还包括基于业务需要限制访问。
* **提供保护 tailnet 安全的功能**，例如[与身份提供方（IdP）集成][docs-sso-providers]以及[访问控制策略][docs-access-control]。

要了解 Tailscale 如何保护你的网络，请参阅[安全][co-security]页面。

## 用户的责任

* **维护运行 Tailscale 的设备**，包括为这些设备的固件和操作系统打补丁，并为这些设备提供网络连接。
* **配置并维护你的身份提供方**（IdP），确保只有经授权的用户才能加入你的网络。
* **定期将 Tailscale 客户端更新到受支持的版本**。在某些操作系统（macOS 和 iOS）上，客户端会自动更新。Tailscale 负责[响应安全问题][co-security-bulletins]并及时提供补丁，但升级以应用这些补丁是你的责任。
* **在支持请求的排查过程中按要求向 Tailscale 提供 bug 报告或日志**。
* **配置 Tailscale 中的安全功能**，按你的环境需要限制访问。例如，使用访问控制策略限制对网络内资源的访问，并使用组和标签（tag）让用户与设备的管理更简单。

为了最大程度保护你的网络，我们建议遵循[加固指南][docs-security-hardening]。

[co-security-bulletins]: https://tailscale.com/security-bulletins

[co-security]: https://tailscale.com/security

[docs-access-control]: /docs/features/access-control

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-sso-providers]: /docs/integrations/identity
