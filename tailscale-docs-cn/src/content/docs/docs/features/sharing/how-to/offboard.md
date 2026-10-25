---
title: "用户离职处理"
description: "当你想删除、停用或停权环境中的用户时，就需要进行用户离职处理。[在 Tailscale 中删除或停用用户][docs-remove-team-members]的步骤始终相同，但你需要执行的具体操作取决于是否使用 SCIM。"
---

最后验证于 Jan 5, 2026

当你想删除、停用或停权环境中的用户时，就需要进行用户离职处理（offboarding）。[在 Tailscale 中删除或停用用户][docs-remove-team-members]的步骤始终相同，但你需要执行的具体操作取决于是否使用跨域身份管理系统（SCIM）。对于非 SCIM 部署，你必须在 Tailscale 中手动停用用户；使用 SCIM 时，用户会在 Tailscale 中自动被停用。

## 非 SCIM 环境下的用户离职处理

以下指南说明在使用不带用户与组预配（即不带 SCIM）的身份提供方时，如何进行用户离职处理。

1. 在你的环境中（例如 Google）禁用或停用该用户。

2. 在 Tailscale 中[停用该用户][docs-remove-team-members-suspending-users]。这让你可以在删除用户之前[管理其资源][docs-remove-team-members-resources]。

   * 该用户将无法连接 tailnet、添加设备或访问管理控制台，其 API 密钥和认证密钥（auth key）也会失效。有关被停用或被删除用户资源的更多信息，请参阅[管理用户资源][docs-remove-team-members-resources]。
   * 可以在 Tailscale 管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面核实用户已被停用。
   * 如果用户只是暂时离开，而你希望日后重新启用他们，那么停用用户是理想选择。

3. 把必要的设备重新指派给其他用户，并核实你需要保留的 API 密钥和认证密钥仍然有效。此时如有需要，你还可以在 Tailscale 中恢复该被停用的用户。

4. [删除该用户][docs-remove-team-members-deleting-users]。

## 使用用户与组预配（SCIM）时的用户离职处理

以下指南说明在使用[用户与组预配][docs-user-group-provisioning]（基于 SCIM）时，如何进行用户离职处理。

1. 如果使用 Okta，在 Okta 中停用该用户；如果使用 Microsoft Entra ID，在 Microsoft Entra ID 中删除该用户。

   这会自动在 Tailscale 中[停用该用户][docs-remove-team-members-suspending-users]。

   * 该用户将无法连接 tailnet、添加设备或访问管理控制台，其 API 密钥和认证密钥也会失效。有关被停用或被删除用户资源的更多信息，请参阅[管理用户资源][docs-remove-team-members-resources]。
   * 可以在 Tailscale 管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面核实用户已被停用。
   * 如果用户只是暂时离开，而你希望日后重新启用他们，那么停用用户是理想选择。

2. 把必要的设备重新指派给其他用户，并核实你需要保留的 API 密钥和认证密钥仍然有效。此时如有需要，你还可以在 Tailscale 中恢复该被停用的用户。

我们建议把 SCIM 自动取消用户预配作为离职处理的一部分。你也可以选择从 tailnet 中[删除][docs-remove-team-members-deleting-users]被停用的用户。出于安全考虑没有必要删除这些用户，因为他们已经无法登录；出于计费考虑也没有理由删除，因为非活跃用户不计费。

[docs-remove-team-members-deleting-users]: /docs/features/sharing/how-to/remove-team-members#deleting-users

[docs-remove-team-members-resources]: /docs/features/sharing/how-to/remove-team-members#managing-user-resources

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#suspending-users

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-user-group-provisioning]: /docs/features/user-group-provisioning
