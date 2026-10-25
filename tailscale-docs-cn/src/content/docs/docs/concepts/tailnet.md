---
title: "什么是 tailnet？"
description: "了解 tailnet 一词的含义。"
---

最后验证于 Jan 12, 2026

Tailscale 网络（称为 tailnet）是由用户、设备和资源组成的[安全][docs-security-hardening]且互联的集合。你的 tailnet 是你的私有空间，无法从公共互联网访问。它就像一间安全的会议室，只有受邀者才能进入。tailnet 构成了 Tailscale 组网理念的基础，为[设备连接][docs-device-connectivity]、资源[共享][docs-sharing]以及跨互联网协作提供了一个灵活而可控的空间。

当你首次在任意设备上登录 Tailscale 时——无论是手机、个人电脑还是虚拟机（VM）——Tailscale 就会创建一个 tailnet。每次你（或组织中的其他用户）用 Tailscale 对设备进行身份验证，该设备就会被加入 tailnet。你可以使用 Tailscale 账户（面向用户）或[标签][docs-tags]（tag，面向服务型设备）来验证设备。

每个 tailnet 都由一个 [tailnet DNS 名称][docs-tailnet-name]标识，供 [MagicDNS][docs-magicdns]、[HTTPS][docs-enabling-https]和共享等功能使用，同时不暴露你组织的身份。你可以在[默认 tailnet 名称][docs-tailnet-name-default-tailnet-name]（例如 `tailfe8c.ts.net`）和[个性化的 tailnet DNS 名称][docs-tailnet-name]（例如 `yak-bebop.ts.net`）之间选择。你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面查找并管理你的 tailnet DNS 名称。

tailnet 中的每台设备都会获得一个位于 CGNAT（运营商级 NAT，Carrier-Grade Network Address Translation）范围内的专用 [Tailscale IP 地址][docs-100.x-addresses]。该范围内的部分地址[保留给 Tailscale 服务使用][docs-reserved-ip-addresses]。Tailscale IP 地址让你所有设备之间无论身处何地都能直接通信——就像拥有一张属于自己的、安全的互联网，覆盖设备所在的每个角落。

> **提示：**
>
> 部分[付费套餐][co-pricing]可以扩展 tailnet 的功能，让企业和组织容纳大量设备与用户，并与 [Microsoft Entra ID][docs-sso-microsoft]、[Google Workspace][docs-sso-google-workspace]、[GitHub 组织][docs-sso-github]、[Okta][docs-sso-okta] 租户等各类身份提供方（IdP）无缝集成。这些集成基于现有的组织结构，简化了用户访问与资源管理。

## 管理

你（或[其他拥有相应权限的用户][docs-roles]）可以通过管理控制台查找并管理 tailnet 设置。管理控制台列出 tailnet 内的所有设备和用户，并提供 tailnet 级别的设置与配置入口，包括[访问控制][docs-access-control]策略、[DNS][docs-dns]设置和身份验证设置等。

你还可以通过其他方式管理 tailnet。例如：

* 使用[子网路由器][docs-subnets]将整个子网加入 tailnet。

* 使用[出口节点][docs-exit-nodes]路由流量。

* 使用[应用连接器][docs-app-connectors]路由和管理特定应用的流量。

* 配置[高可用][docs-high-availability]特性。

* 使用[授权][docs-grants]（grant）配置基于网络和应用的访问策略。

* 使用 [via][docs-via] 控制流量在 tailnet 中的路由方式。

* 通过 [Tailnet Lock][docs-tailnet-lock] 等功能增强安全性。

* 管理[日志、流式传输和事件][docs-log-events]。

tailnet 还支持[共享][docs-sharing]功能。你可以[邀请][docs-invite-any-user]用户加入你的 tailnet，或与他们共享特定设备。通过共享和邀请，你可以安全地与其他 Tailscale 用户共享内部服务，包括组织之外的用户（例如[承包商][docs-acl-contractor-example]）。个人用户也可以在保障网络安全的前提下，与朋友共享诸如个人 Minecraft 服务器之类的资源。你可以创建访问控制策略来管理受邀用户能在你的 tailnet 中做什么。

除共享和邀请外，你还可以利用 [Tailscale Serve][docs-tailscale-serve] 和 [Tailscale Funnel][docs-tailscale-funnel] 等功能，临时开放对 tailnet 中某台设备上运行的特定服务的访问。

[co-pricing]: https://tailscale.com/pricing

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-acl-contractor-example]: /docs/reference/examples/acls#share-access-with-a-contractor

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-log-events]: /docs/features/logging

[docs-magicdns]: /docs/features/magicdns

[docs-roles]: /docs/reference/user-roles

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-sharing]: /docs/features/sharing

[docs-sso-github]: /docs/integrations/identity/github

[docs-sso-google-workspace]: /docs/integrations/google-sync

[docs-sso-microsoft]: /docs/integrations/identity/entra

[docs-sso-okta]: /docs/integrations/identity/okta

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-name-default-tailnet-name]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tailnet-name]: /docs/concepts/tailnet-name

[docs-tailscale-funnel]: /docs/features/tailscale-funnel

[docs-tailscale-serve]: /docs/features/tailscale-serve

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[docs-via]: /docs/features/access-control/grants/grants-via
