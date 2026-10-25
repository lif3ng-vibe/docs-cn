---
title: "访问控制"
description: "了解 Tailscale 中可用的访问控制选项。"
---

最后验证于 May 29, 2025

Tailscale 的访问控制方案体现了[最小权限][ln-principle-of-least-privilege]和[零信任安全][docs-zero-trust]原则。默认情况下，Tailscale 网络（即 [tailnet][docs-tailnet]）中设备之间的所有连接都会被拒绝，除非通过 [tailnet 策略文件][docs-tailnet-policy-file]明确允许。这确保只有经过授权的用户和设备才能相互通信，并能精确控制它们可以访问哪些具体资源。

创建访问控制策略有两种主要方式：[授权（grant）][docs-grants]和[访问控制列表（ACL）][docs-acls]。授权是推荐方式，功能也更丰富，但 ACL 会一直受支持。参见[授权与 ACL 对比][docs-grants-vs-acls]。

Tailscale 的访问控制使用各种[目标与选择器][docs-targets]来标识资源，这些同样定义在 tailnet 策略文件中，包括 autogroup、自定义组、标签（tag）、IP 地址和单个用户，让你能够创建随组织结构灵活调整的策略。

如需了解更多信息，请探索以下资源：

* [Tailnet 策略文件][docs-tailnet-policy-file]
* [策略语法][docs-policy-syntax]
* [目标与选择器][docs-targets]
* [授权与 ACL 对比][docs-grants-vs-acls]

## 授权（grant）

授权代表了 Tailscale 面向现代场景的访问控制方案，提供统一语法来同时管理网络层和应用层的权限。每条授权定义了哪些来源可以访问哪些目标，以及在网络层和应用层分别允许使用哪些具体能力。

探索授权文档：

* [授权概览][docs-grants]
* [授权语法参考][docs-grants-syntax]
* [应用能力][docs-grants-app-capabilities]
* [授权故障排查][docs-grants-troubleshooting]
* [授权示例][docs-grant-samples]

## 访问控制列表（ACL）

> **注意：**
>
> Tailscale 建议[迁移到授权][docs-grants-migration]。

访问控制列表（[ACL][docs-acls]）是 Tailscale 最早的网络层安全方案。推荐使用授权，但 ACL 会一直受 Tailscale 支持。

探索 ACL 文档：

* [ACL 概览][docs-acls]
* [ACL 语法参考][docs-policy-syntax]
* [ACL 策略示例][docs-acl-samples]

## Tailscale SSH

Tailscale SSH 与访问控制系统集成，为 tailnet 内设备之间的 SSH 访问提供安全保障。它无需管理 SSH 密钥，而是借助 tailnet 的身份系统，依据 tailnet 策略文件中定义的规则对连接进行认证与授权。

[探索 Tailscale SSH][docs-tailscale-ssh]。

[docs-acl-samples]: /docs/reference/examples/acls

[docs-acls]: /docs/features/access-control/acls

[docs-grant-samples]: /docs/reference/examples/grants

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-migration]: /docs/reference/migrate-acls-grants

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-grants-troubleshooting]: /docs/reference/troubleshooting/grants

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets]: /docs/reference/targets-and-selectors

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege
