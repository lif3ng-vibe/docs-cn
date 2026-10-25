---
title: "自动化员工入职与离职流程"
description: "当员工加入或离开你的组织时，他们对网络资源的访问权限需要反映其当前的角色与状态。跨域身份管理系统（SCIM）让你可以通过将 Tailscale 连接到身份提供方来自动实现这"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**用户与群组预配**（User & group provisioning）](/docs/features/user-group-provisioning) — 了解 Tailscale 支持的跨域身份管理系统（SCIM）身份提供方。

当员工加入或离开你的组织时，他们对网络资源的访问权限需要反映其当前的角色与状态。跨域身份管理系统（SCIM）让你可以通过将 Tailscale 连接到身份提供方来自动实现这一点。如果你的身份提供方不支持 SCIM，也可以通过管理控制台手动管理访问权限。

## 使用 SCIM 实现自动化

[SCIM 集成][docs-user-group-provisioning] 让 Tailscale 直接从你的身份提供方同步用户账户和群组成员关系。当你在身份提供方中添加或移除某位成员时，Tailscale 会自动同步这一变更。

要开始使用，请在管理控制台中打开 [User management](https://console.tailscale.com/admin/settings/user-management) 页面，启用用户与群组预配。请参阅你的身份提供方对应的指南：

* [Okta][docs-okta-scim]
* [Microsoft Entra ID][docs-entra-scim]
* [Google][docs-google-sso]

**入职：** 在身份提供方中将员工添加到相应的群组。SCIM 会将成员关系同步到 Tailscale，完成用户预配并授予访问权限。

**离职：** 在身份提供方中停用或删除该用户，而不是通过 Tailscale 管理控制台操作。SCIM 会同步这一变更，立即撤销其访问权限。

## 手动管理访问权限

如果你的身份提供方不支持 SCIM，请在管理控制台中打开 [Users](https://console.tailscale.com/admin/users) 页面来邀请和移除用户。

**入职：** [邀请团队成员加入你的 tailnet][docs-how-to-invite-team-members]，并在 tailnet 策略文件中将其分配到相应的群组，让他们从第一天起就能访问正确的资源。

**离职：** 在管理控制台中[停用或删除该用户][docs-how-to-remove-team-members]。停用会保留其设备历史记录；删除则会将其永久移除。

> **提示：**
>
> 删除前先停用用户，可以为你留出时间审查其设备访问权限，并转移共享资源的所有权。

[docs-entra-scim]: /docs/integrations/identity/entra/entra-id-scim

[docs-google-sso]: /docs/integrations/identity/google-sso

[docs-okta-scim]: /docs/integrations/identity/okta/okta-scim

[docs-how-to-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-how-to-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-user-group-provisioning]: /docs/features/user-group-provisioning
