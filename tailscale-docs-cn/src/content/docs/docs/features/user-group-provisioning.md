---
title: "用户与群组预配"
description: "了解 Tailscale 支持的跨域身份管理系统（SCIM）身份提供方。"
---

最后验证于 Dec 8, 2025

> **注意：** 此功能适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

Tailscale 支持[跨域身份管理系统（System for Cross-domain Identity Management，SCIM）][ln-what-is-scim]，可与多个身份提供方（IdP）集成，详见以下主题：

* [Google Workspace 的用户与群组预配][docs-sso-google-sync]
* [Microsoft Entra ID 的用户与群组预配][docs-sso-entra-id-scim]
* [Okta 的用户与群组预配][docs-sso-okta-scim]

## 在已有用户的 tailnet 中启用 SCIM 的影响

启用 SCIM 时，如果你的身份提供方已有用户在使用 Tailscale，这些用户会保留在 Tailscale 中。你在身份提供方（例如 Okta 或 Microsoft Entra ID）中启用 SCIM 时可以查看这些用户，并决定对他们采取什么操作。

## SSO 与 SCIM 的注意事项

如果你*为单一登录（SSO）和 SCIM 使用同一个应用*（即你没有使用自定义的 Microsoft Entra ID 应用），那么只有身份提供方允许的用户（已分配该应用的用户）才能注册 Tailscale。

如果你为 SSO 和 SCIM 使用不同的应用，我们建议你使用[用户审批][docs-user-approval]来限制哪些用户有权加入你的 tailnet。

## 邀请用户

* 你仍然可以[邀请][docs-invite-team-members]来自其他域和身份提供方的用户。你需要是 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能邀请用户。

## 同步用户停用

同步用户停用时：

* 对于 Okta，如果你在 Okta 中停用（deactivate）某用户，该用户会在 Tailscale 中被暂停（suspended）。如果你只是在 Okta 中暂停（suspend）某用户，Tailscale 中不会有任何变化——只有停用操作才会生效。
* 对于 Microsoft Entra ID，如果你在 Microsoft Entra ID 中删除（软删除）某用户，该用户会在 Tailscale 中被暂停。
* 对于 Google Workspace，如果你暂停某用户，该用户会在 Tailscale 中被暂停。

## 同步用户删除

同步用户删除时：

* 对于 Okta，你无法把删除操作从 Okta 同步到 Tailscale。

* 对于 Microsoft Entra ID，当你删除某用户时，该用户会先被软删除（在 Tailscale 中暂停），30 天后再被硬删除（在 Tailscale 中删除）。

* 对于 Google Workspace，如果你删除某用户，该用户会在 Tailscale 中被暂停。当你在 Google Workspace 中重新创建先前删除的用户时，Tailscale 会将其视为新用户。

你也可以手动从 tailnet 中删除用户，包括在启用预配（provisioning）之前创建的用户、已被暂停的同步用户，以及来自其他域的用户。正在同步的用户无法手动删除，因为他们会在下次同步时被重新创建。

## 同步组成员关系

Tailscale 会把组成员关系从集成了 SCIM 的身份提供方同步到 Tailscale。你可以直接使用集成了 SCIM 的身份提供方中那些人类可读的群组名称，在[访问控制策略][docs-access-control]中引用群组。例如，如果 Alice 和 Bob 属于某个集成了 SCIM 的身份提供方中的"security-team"群组，那么[访问规则][docs-policy-syntax-acls]可以引用"security-team"群组：

```json
{
  "grants": [
    {
      "src": ["group:security-team@example.com"],
      "dst": ["tag:logging"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:logging": ["group:security-team@example.com"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

当某人的角色发生变化时，你无需在所管理的每个应用中逐一更新其权限，只需在集成了 SCIM 的身份提供方中做一次更改，即可更新他们应当能访问哪些应用，以及拥有哪些权限。

> **注意：**
>
> 同步的群组不能用于分配[用户角色][docs-user-roles]。

## 已知限制

* 在集成了 SCIM 的身份提供方中被暂停的用户仍会保持登录 Tailscale，并保留对其所有节点以及访问控制策略所授予权限的访问。只有当其设备密钥过期、且他们无法通过与 SCIM 集成的身份提供方重新认证新会话时，才会失去访问权限。要让某用户在 Tailscale 中被暂停，请在集成了 SCIM 的身份提供方中停用（disable）该用户。
* 更多限制请参阅各身份提供方的具体主题。

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acl

[docs-access-control]: /docs/features/access-control/acls

[docs-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-sso-entra-id-scim]: /docs/integrations/identity/entra/entra-id-scim

[docs-sso-google-sync]: /docs/integrations/google-sync

[docs-sso-okta-scim]: /docs/integrations/identity/okta/okta-scim

[docs-user-approval]: /docs/features/access-control/user-approval

[docs-user-roles]: /docs/reference/user-roles
