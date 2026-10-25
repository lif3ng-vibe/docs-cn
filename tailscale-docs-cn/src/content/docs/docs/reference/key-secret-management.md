---
title: "密钥与机密管理"
description: "管理 tailnet 的各类密钥与机密。"
---

最后验证于 Jan 5, 2026

你可以设置多种类型的密钥和机密，以安全地连接 Tailscale 网络（即 tailnet）中的资源。本主题介绍管理我们提供的各类密钥与机密的基础知识。

想深入了解 tailnet 安全，参阅[保护 tailnet 安全的最佳实践][docs-security-hardening]。

## 密钥与机密的最佳实践

务必妥善保管你的密钥和机密。密钥和机密生成并显示后，请立即复制到密码管理器中。机密只会在生成时完整显示一次。如果没有记下来，你就需要重新生成新的密钥或机密。

请了解每种密钥类型的过期时间，并据此加以管理。[跨域身份管理系统（SCIM）][ln-what-is-scim] API 密钥和 webhook 端点机密不会过期。

我们强烈建议你使用机密管理工具，或咨询云服务商以获取安全存储密钥和机密的指引。**不要把 OAuth 客户端或 API 访问令牌等敏感信息存入版本控制**。

## 密钥前缀

Tailscale 生成的每种密钥都带有一个[密钥前缀][docs-key-prefixes]，帮助你区分前缀类型：例如 API 访问令牌（有时称为 API 密钥）使用 `tskey-api`，认证密钥（auth key）使用 `tskey-auth`。

## 密钥与机密的类型

所有 Tailscale 生成的密钥和机密都区分大小写。

### API 访问令牌

[API 访问令牌][docs-api]让你可以使用 Tailscale API 向 tailnet 中的应用授予访问权限。你可以在管理控制台的[密钥（Keys）](https://console.tailscale.com/admin/settings/keys)页面生成和吊销 API 访问令牌（密钥）。

要创建 API 访问令牌，打开管理控制台的[密钥（Keys）](https://console.tailscale.com/admin/settings/keys)页面，进入 **API access tokens**（API 访问令牌）部分，然后选择 **Generate access token**（生成访问令牌）。

要吊销某个 API 访问令牌，打开管理控制台的[密钥（Keys）](https://console.tailscale.com/admin/settings/keys)页面，进入 **API access tokens** 部分，然后在该令牌旁选择 **Revoke**（吊销）。

### 认证密钥

[认证密钥][docs-auth-keys]（auth key）让你可以认证 tailnet 中的带标签设备，作为交互式[单点登录（SSO）][docs-sso-providers]会话的替代方案。你可以在管理控制台的[密钥（Keys）](https://console.tailscale.com/admin/settings/keys)页面生成和吊销认证密钥。

要创建认证密钥，参阅[生成密钥][docs-auth-keys-generating-a-key]。

要吊销认证密钥，参阅[吊销密钥][docs-auth-keys-revoke]。

### OAuth 客户端

[OAuth 客户端][docs-oauth-clients]让你可以委派并限定 Tailscale API 的访问范围。你可以在管理控制台的[信任凭证（Trust credentials）](https://console.tailscale.com/admin/settings/trust-credentials)页面生成和吊销 OAuth 客户端。

要创建 OAuth 密钥，参阅[设置 OAuth 客户端][docs-oauth-clients-setup]。

要吊销 OAuth 密钥，参阅[吊销信任凭证][docs-trust-credentials-revoke]。

### SCIM API 密钥

SCIM API 密钥让你可以对身份提供方（例如 [Microsoft Entra ID][docs-sso-entra-ai-scim-enable] 和 [Okta][docs-sso-okta-scim-enable-provisioning]）与你的 tailnet 之间的[用户与组预配][docs-user-group-provisioning]（provisioning）进行身份验证。整个 tailnet 使用一个 SCIM API 密钥，在管理控制台的[用户管理（User management）](https://console.tailscale.com/admin/settings/user-management)页面管理。必须启用用户与组预配才能生成 SCIM API 密钥。如果你的 tailnet 未启用用户与组预配，管理控制台中就不会显示 **User & Group Provisioning** 部分。

要创建 SCIM API 密钥，打开管理控制台的[用户管理（User management）](https://console.tailscale.com/admin/settings/user-management)页面，选择 **Enable Provisioning**（启用预配）。把生成的密钥复制到剪贴板，然后在你 Microsoft Entra ID 或 Okta 的预配设置中添加该密钥。

如果 SCIM API 密钥丢失、Microsoft Entra ID 或 Okta 环境遭到入侵，或者你已不再使用 Microsoft Entra ID 或 Okta，就应吊销或重新生成该密钥。

要吊销 SCIM API 密钥，打开管理控制台的[用户管理（User management）](https://console.tailscale.com/admin/settings/user-management)页面，选择 **Manage keys**（管理密钥）。在 **Provisioning keys**（预配密钥）对话框中选择 **Revoke**（吊销）。

要生成新的 SCIM API 密钥，打开管理控制台的[用户管理（User management）](https://console.tailscale.com/admin/settings/user-management)页面，选择 **Manage keys**（管理密钥）。在 **Provisioning keys**（预配密钥）对话框中选择 **Generate new key**（生成新密钥）。

### webhook 机密

[webhook][docs-webhooks] 让你订阅 tailnet 的[事件][docs-webhooks-events]，并自动发送到 Slack、Discord 和 Mattermost 等服务。webhook 机密用于确保 webhook 请求确实来自 tailnet 中经过授权的用户。你可以在管理控制台的 [Webhooks](https://console.tailscale.com/admin/settings/webhooks) 页面为你的端点生成、轮换或删除 webhook 机密。

要创建 webhook 端点和机密，参阅[设置 webhook 端点][docs-webhooks-webhook-secret]。

要删除 webhook 端点，参阅[删除端点][docs-webhooks-deleting-an-endpoint]。端点被删除时，其机密也会一并删除。

要为现有 webhook 生成新机密，参阅[轮换 webhook 机密][docs-webhooks-rotating-a-webhook-secret]。

## 使用日志与事件

你可以在管理控制台的[日志（Logs）](https://console.tailscale.com/admin/logs)页面监控密钥和机密的相关活动。例如，生成新的 API 访问令牌或认证密钥时会产生 "Create API key"（创建 API 密钥）事件。你也可以使用 [webhook][docs-webhooks] 在密钥状态变化时自动获得通知。

有关日志记录事件的总体介绍，参阅[配置审计日志][docs-audit-logging]。

有关与密钥相关、会被记录的事件类型，参阅[审计日志事件][docs-audit-logging-events]。

有关可用于密钥活动通知的 webhook 事件类型，参阅 [Webhook 事件][docs-webhooks-events]。

## 密钥过期

API 访问令牌、认证密钥和 OAuth 密钥在生成时都带有过期时间，你可以在生成时调整。SCIM API 密钥和 webhook 端点机密不会过期。由于不同密钥和类型的过期时间可能不同，请务必了解每把密钥的过期日期，并据此做好规划。更多信息参阅[密钥过期][docs-key-expiry]。

## 机密扫描

为帮助降低意外泄露的风险并防止恶意利用，Tailscale 与多家公司合作，对源代码仓库和其他数据源提供机密扫描，以发现泄露的 Tailscale 密钥。更多信息参阅[机密扫描][docs-secret-scanning]。

## 用户下线（offboarding）

密钥与机密管理固然是安全的重要一环，但在从 tailnet 移除用户和设备时，还有其他事项需要考虑。更多信息参阅[用户下线（offboarding）][docs-offboarding-users]。

[docs-api]: /docs/reference/tailscale-api

[docs-audit-logging-events]: /docs/features/logging/audit-logging#事件

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-auth-keys-generating-a-key]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-key-prefixes]: /docs/reference/key-prefixes

[docs-oauth-clients-setup]: /docs/features/oauth-clients#设置-oauth-客户端

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-offboarding-users]: /docs/features/sharing/how-to/offboard

[docs-secret-scanning]: /docs/integrations/secret-scanning

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-sso-entra-ai-scim-enable]: /docs/integrations/identity/entra/entra-id-scim#启用预配置

[docs-sso-okta-scim-enable-provisioning]: /docs/integrations/identity/okta/okta-scim#启用预配置

[docs-sso-providers]: /docs/integrations/identity

[docs-trust-credentials-revoke]: /docs/reference/trust-credentials#吊销信任凭证

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-webhooks-deleting-an-endpoint]: /docs/features/webhooks#删除端点

[docs-webhooks-events]: /docs/features/webhooks#事件

[docs-webhooks-rotating-a-webhook-secret]: /docs/features/webhooks#轮换-webhook-密钥

[docs-webhooks-webhook-secret]: /docs/features/webhooks#webhook-密钥

[docs-webhooks]: /docs/features/webhooks

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim
