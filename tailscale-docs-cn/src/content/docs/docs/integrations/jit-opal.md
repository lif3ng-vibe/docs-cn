---
title: "使用 Opal 实现 JIT 访问"
description: "结合使用 Tailscale 与 Opal，为你的 Tailscale 网络提供按需访问。"
---

最后验证于 Jan 5, 2026

[Opal][xt-opal] 是一个面向 IT 和基础设施团队的集中式授权平台，可让访问管理请求变为自助服务。

对 Tailscale 资源的按需访问可以通过 Opal 进行预配置。其工作方式是在 Tailscale [访问控制策略][docs-access-control]中，为[标签][docs-tags]的 [SSH 访问规则][docs-policy-syntax-ssh]添加或移除成员。

你可以将 Opal 与[用户与群组预配置][docs-user-group-provisioning]结合使用，以更新 Tailscale 访问控制策略所用群组中经 [SCIM 集成][ln-what-is-scim]的群组成员关系。同样，你可以使用 Opal 将用户分配到 Tailscale 应用，该用户会通过 SCIM 同步到你的 Tailscale 网络。

## 前提条件

开始本指南之前，你需要一个 tailnet 和一个 Opal 账户。

* 关于创建 tailnet 的信息，参见 [Tailscale 快速开始][docs-install]。

* 关于创建 Opal 账户的信息，参见 [Opal][xt-opal] 文档。

## 集成

完整步骤请查阅 Opal 的[博客文章][xt-opal-tailscale]，其中介绍了如何设置与 Tailscale 的集成。

要将 Opal 与 Tailscale 配合使用，你需要：

1. 在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面生成一个 Tailscale [API 访问令牌][docs-api]。
2. 在 Opal 中，[将 Tailscale 添加为新应用][xt-opal-tailscale-create]。
   1. 将 **App Admin** 设置为应在 Opal 中管理 Tailscale 应用的团队。
   2. 输入一段 **Description**，说明你们如何使用 Tailscale，让同事清楚自己请求的是什么访问权限。例如"SSH access to the production network"（生产网络的 SSH 访问权限）。
   3) 将 **Tailnet name** 设置为你的 tailnet ID。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面找到你的 tailnet ID。
   4. 将 **Tailscale API key** 设置为你生成的 Tailscale API 访问令牌。
3. 确定哪些 Tailscale [标签][docs-tags]应导入到 Opal。这一步由 App Admin 完成。对于选定的每个标签，Opal 会自动解析适用于该标签的已有[访问规则][docs-policy-syntax-acls]和 [SSH 访问规则][docs-policy-syntax-ssh]，以及通过这些规则有权访问带标签资源的[群组][docs-policy-syntax-groups]。

现在，用户可以请求对 Tailscale 中特定标签的访问或 SSH 访问，Opal 会更新 [tailnet 策略文件][docs-policy-syntax]以允许临时访问。

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acl

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-api]: /docs/reference/tailscale-api

[docs-install]: /docs/how-to/quickstart

[docs-tags]: /docs/features/tags

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-opal-tailscale-create]: https://app.opal.dev/apps/create/tailscale

[xt-opal-tailscale]: https://www.opal.dev/blog/tailscale

[xt-opal]: https://opal.dev
