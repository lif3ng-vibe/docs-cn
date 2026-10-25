---
title: "删除与停用用户"
description: "你可以在管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面删除或停用不应继续留在你的 Tailscale 网络（即 tailnet）中的用户，阻止其使用 Tailscale，而无需永久删除其设备。"
---

最后验证于 Jan 5, 2026

你可以在管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面删除或停用不应继续留在你的 Tailscale 网络（即 tailnet）中的用户，阻止其使用 Tailscale，而无需永久删除他们的设备。

> **注意：**
>
> 删除、停用或取消预配用户会释放其席位供再次使用。如果被停用的用户之后被恢复，他们重新获得 tailnet 访问权时会再次占用一个可用席位。

## 删除用户

你需要是 tailnet 的 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能删除用户。

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 找到目标用户所在的行。
3. 选择最右侧的菜单，然后选择 **Delete user** 选项。
4. 完成。该用户已被删除。

当用户从你的网络中被删除时：

* 该用户的设备会被删除。设备密钥会从[协调服务器][bl-how-tailscale-works]（coordination server）中移除，这些设备后续任何连接网络的请求都会被阻止。
* 该用户的 API 访问令牌和认证密钥（auth key）随即失效。
* 这些操作通常在几秒内完成。

要删除拥有 Owner 角色的用户，你必须先把另一个用户[指派为 tailnet 的 Owner](/docs/reference/user-roles)，然后再删除目标用户。

### 使用用户与组预配时

如果你的 tailnet 启用了[用户与组预配][docs-user-group-provisioning]，我们建议你使用 SCIM 自动取消用户预配。

* 如果使用 [Okta][docs-sso-okta-scim]，在 Okta 中停用该用户。这会自动在 Tailscale 中停用该用户。然后，你可以在 Tailscale 中删除这个被停用的用户。
* 如果使用 [Microsoft Entra ID][docs-sso-entra-id-scim]，在 Microsoft Entra ID 中删除该用户。这会自动在 Tailscale 中停用该用户，并在大约 30 天后将其从 Tailscale 中删除。

## 停用用户

如果你不想立刻从网络中删除某个用户，但又想限制其使用 Tailscale，可以停用（suspend）该用户。

你需要是 tailnet 的 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能停用和恢复用户。

1. 前往管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 找到目标用户所在的行。
3. 选择最右侧的菜单，然后选择 **Suspend user** 选项。

   该用户会在用户页面显示为 **Suspended**。

用户被停用后，就无法在此 tailnet 上使用 Tailscale。这意味着：

* 其设备无法连接 tailnet 中的其他设备，包括他们自己的其他设备。

  > **注意：**
  >
  > 被停用用户的设备可能显示为已连接，但在停用解除之前，它们无法与 tailnet 中的其他设备交换流量。
* 他们无法向 tailnet 添加新设备。如果尝试在设备上登录，会收到已被停用的错误提示。
* 他们无法访问管理控制台。
* 其 API 访问令牌和认证密钥随即失效。

如果其他人可以访问这些设备，可以重新认证这些设备或给它们打标签，从而在同一个 tailnet 中继续使用。

## 未批准的用户

如果你启用了[用户审批][docs-user-approval]，新用户会处于待批准状态。有关移除未批准用户的信息，请参阅[移除未批准的用户][docs-user-approval-remove-unapproved]。

## 恢复用户

你可以在管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面选择 **Restore user** 选项来恢复用户。

用户被恢复后，会重新获得在此 tailnet 上使用 Tailscale 的权限，包括恢复时其拥有的设备。更具体地说，被恢复的用户可以：

* 在[访问控制策略][docs-access-control]允许的范围内，重新连接 tailnet 中的其他设备。
* 向 tailnet 添加新设备。
* 访问管理控制台（前提是其[角色][docs-user-roles]允许）。
* 使用尚未过期的既有 API 访问令牌和认证密钥。

## 管理用户资源

* 被停用用户的机器会被一并停用，可以删除或重新指派。被删除用户的机器会被删除。机器可以重新指派给某个标签，也可以由新用户登录。如果有新用户登录该机器，它会被识别为一台新机器。
* 被停用用户的 API 密钥会被停用；被删除用户的 API 密钥会被自动吊销。它们不能被重新指派。你必须创建新的 [API 密钥][docs-api-authentication]或 [OAuth][docs-oauth-clients] 客户端。
* 被停用用户的认证密钥会被停用；被删除用户的认证密钥会被自动吊销。它们不能被重新指派。你必须创建新的[认证密钥][docs-auth-keys]或 [OAuth][docs-oauth-clients] 客户端。

## 管理空闲用户

如果某个用户不是 Owner，且超过 7 天未登录或使用 Tailscale，就会在管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面显示为 **Idle**。

## 离开 tailnet

你无法把自己从网络中删除，也无法自行离开网络。请让你的管理员移除你的账户。不过，你可以通过[联系支持团队][co-contact-support-accountdeletion]来删除自己的账户。

## 删除 tailnet

如果你决定删除整个 tailnet，请参阅[删除你的 tailnet][docs-delete-tailnet]主题。

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[co-contact-support-accountdeletion]: https://tailscale.com/contact/support/?type=accountdeletion

[docs-access-control]: /docs/features/access-control

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-delete-tailnet]: /docs/account/delete-tailnet

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-sso-entra-id-scim]: /docs/integrations/identity/entra/entra-id-scim

[docs-sso-okta-scim]: /docs/integrations/identity/okta/okta-scim

[docs-user-approval-remove-unapproved]: /docs/features/access-control/user-approval#remove-an-unapproved-user

[docs-user-approval]: /docs/features/access-control/user-approval

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-user-roles]: /docs/reference/user-roles
