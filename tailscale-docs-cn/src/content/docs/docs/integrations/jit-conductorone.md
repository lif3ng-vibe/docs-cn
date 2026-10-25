---
title: "使用 ConductorOne 实现 JIT 访问"
description: "结合使用 Tailscale 与 ConductorOne，为你的 Tailscale 网络提供按需访问。"
---

最后验证于 Jan 5, 2026

[ConductorOne][xt-conductorone] 是一个安全平台，让你可以管理针对 Tailscale 权限的访问请求。

对 Tailscale 资源的按需访问可以通过 ConductorOne 进行预配置。其工作方式是在 Tailscale [访问控制策略][docs-access-control]中定义的[群组][docs-policy-syntax-groups]、[访问规则][docs-policy-syntax-acls]和 [SSH 访问规则][docs-policy-syntax-ssh]中添加或移除成员。

你可以将 ConductorOne 与[用户与群组预配置][docs-user-group-provisioning]结合使用，以更新 Tailscale 访问控制策略所用群组中经 [SCIM 集成][ln-what-is-scim]的群组成员关系。同样，你可以使用 ConductorOne 将用户分配到 Tailscale 应用，该用户会通过 SCIM 同步到你的 Tailscale 网络。

你可以同时将多个 tailnet 连接到 ConductorOne。

## 前提条件

开始本指南之前，你需要一个 tailnet 和一个 ConductorOne 账户。

* 关于创建 tailnet 的信息，参见 [Tailscale 快速开始][docs-install]。

* 关于创建 ConductorOne 账户的信息，参见 [ConductorOne][xt-conductorone]。

## 集成

完整步骤请查阅 ConductorOne 的[博客文章][xt-conductorone-least-privilege]，其中介绍了如何设置与 Tailscale 的集成。

要将 ConductorOne 与 Tailscale 配合使用，你需要：

1. 在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面生成一个 Tailscale [API 访问令牌][docs-api]。
2. 在 ConductorOne 中，选择 **Tailscale** 集成，然后选择 **Add Connector**。
   1. 选择 **Create a new app** 选项。
   2. 将 **Tailscale API key** 设置为你生成的 Tailscale API 访问令牌。
   3) 将 **Tailnet** 设置为你的 tailnet ID。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面找到你的 tailnet ID。

ConductorOne 会自动识别 tailnet 中的所有用户，并将 Tailscale 访问控制策略中已有的[访问规则][docs-policy-syntax-acls]（包括 [SSH 访问规则][docs-policy-syntax-ssh]）解析为 ConductorOne 中的权限项（entitlement）。ConductorOne 中的应用所有者可以针对每个权限项（例如群组成员关系或其他 SSH 访问规则）指定是否按时间限制访问，以及是否使用默认的应用授予策略。

现在，用户可以通过 ConductorOne 的 **Request access** 页面以及 Slack 请求对特定 Tailscale 权限项的访问。ConductorOne 会更新 [tailnet 策略文件][docs-tailnet-policy-file]以允许临时访问。

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acl

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-api]: /docs/reference/tailscale-api

[docs-install]: /docs/how-to/quickstart

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-conductorone-least-privilege]: https://www.conductorone.com/blog/implementing-least-privilege-access-tailscale-conductorone

[xt-conductorone]: https://www.conductorone.com
