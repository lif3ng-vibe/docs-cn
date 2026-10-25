---
title: "即时访问"
description: "Tailscale 提供多种方式，让你对 Tailscale 网络（即 tailnet）中的资源提供即时访问（JIT）。例如，你可以为一位工程师提供限期适当的访问权限"
---

最后验证于 May 2, 2025

Tailscale 提供多种方式，让你对 Tailscale 网络（即 tailnet）中的资源提供即时访问（JIT）。例如，你可以为一位工程师提供限期适当的访问权限，让他在一段时间内对服务器进行维护。

即时访问与访问控制策略配合，共同决定 tailnet 中用户和设备的访问权限。访问控制策略在 [tailnet 策略文件][docs-tailnet-policy-file]中管理。对于即时访问，你使用自动化手段在限定时间内授予某人访问权限，让其完成某项任务。实现方式有以下几种。

## 提供即时访问

Tailscale 让你可以基于设备态势属性来管理对网络资源的即时访问。设备态势属性是附加在设备上的键值对数据，可在 tailnet 策略文件中使用。

[**使用设备态势实现即时访问**](/docs/features/tailscale-accessbot-jit) — 使用设备态势对 tailnet 中的资源进行即时访问。

Tailscale 与其他公司合作，提供即时访问工作流集成。

[**第三方即时访问集成**](/docs/integrations/jit-access) — 使用第三方集成对 Tailscale 网络进行即时访问（也称按需访问）。

Tailscale API 让你可以管理 tailnet 策略文件，包括用于即时访问的文件。详情参见 Tailscale API 文档中的 [Policy File][co-api-policy-file] 部分。

[**Tailscale API**](/docs/reference/tailscale-api) — 探索 Tailscale 应用程序编程接口（API）。

通过将 SCIM 集成的身份提供方（IdP）中的组同步到 Tailscale，Tailscale 让你可以基于[组成员关系][docs-user-group-provisioning-sync]管理对网络资源的访问。

[**支持的 SSO 身份提供方**](/docs/integrations/identity) — Tailscale 构建在你已在使用的 IdP 或 SSO 提供方之上。你可以利用这些提供方的安全访问能力，包括 passkey、2FA 和 MFA。

[co-api-policy-file]: https://tailscale.com/api#tag/policyfile

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-user-group-provisioning-sync]: /docs/features/user-group-provisioning#syncing-group-membership
