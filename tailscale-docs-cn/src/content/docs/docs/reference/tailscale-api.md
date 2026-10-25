---
title: "Tailscale API"
description: "探索 Tailscale 应用程序编程接口（API）。"
---

最后验证于 Jun 24, 2026

> **注意**：Tailscale API 适用于[所有套餐](https://tailscale.com/pricing)。

Tailscale 提供应用程序编程接口（API），让你能够把网络的各个方面自动化。

[访问我们的交互式 API 文档 →][co-api]

## 认证

生成访问令牌需要你拥有 tailnet 的[所有者、管理员、IT 管理员或网络管理员](/docs/reference/user-roles)角色。

对 API 的请求使用访问令牌（access token，有时也称为 API 密钥）进行认证，令牌可以在管理控制台的[密钥（Keys）](https://console.tailscale.com/admin/settings/keys)页面生成。你可以选择密钥有效期天数，范围为 1 到 90 天（含）。另请注意，Tailscale 生成的 API 访问令牌区分大小写。

该访问令牌会在所选天数后自动过期。如果你想在该访问令牌过期后继续使用，就需要生成新的访问令牌。访问令牌也可以在过期前被吊销。最近过期和被吊销的访问令牌会显示在[密钥（Keys）](https://console.tailscale.com/admin/settings/keys)页面上。

作为对 Tailscale API 拥有完全权限的访问令牌的替代方案，你可以使用[信任凭证（trust credentials）][docs-trust-credentials]对 Tailscale API 进行委托式的细粒度控制。

关于 API 认证的更多细节，请[参阅我们的交互式 API 文档][co-api]。

## 预配置设备的节点属性

在为[通过 OAuth 应用进行设备预配置][docs-device-provisioning]创建 OAuth 应用时，请求体接受一个可选的 `allowedNodeAttributes` 字段。它接受一个自定义节点属性数组，这些属性会自动分配给通过该 OAuth 应用预配置的每台设备。每个值都必须使用 `custom:` 前缀（例如 `custom:provisioned`）。只有自定义属性可以加入白名单。

由于这些属性是在预配置时分配的，你可以在[设备态势][docs-device-posture]条件（`srcPosture`）和授权中引用它们，根据设备的预配置方式来控制访问。关于附加到设备的属性与附加到连接的能力之间的区别，请参阅[节点属性与授权应用能力的对比][docs-node-attributes-vs-app-capabilities]。

[co-api]: https://tailscale.com/api

[docs-device-posture]: /docs/features/device-posture

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-node-attributes-vs-app-capabilities]: /docs/reference/node-attributes-vs-app-capabilities

[docs-trust-credentials]: /docs/reference/trust-credentials
