---
title: "使用 passkey 登录的管理员账户"
description: "提前设置一个可以使用 passkey 登录 tailnet 的管理员用户，以防范未来可能发生的 SSO 锁定。"
---

最后验证于 Jan 5, 2026

我们建议你提前创建一个可以使用 passkey（通行密钥）登录的管理员用户，这样将来当你的单点登录（SSO）[身份提供方][docs-sso-providers]导致管理员无法登录时，该管理员仍然可以登录。

假设你的 Tailscale 网络（即 tailnet）一直运行正常，但你的身份提供方突然阻止你及 tailnet 中的其他人通过其认证登录。你需要一种方法快速恢复 tailnet 并开始添加用户，以恢复管理控制权。如果你此前设置过可以使用 passkey 登录 tailnet 的管理员，该管理员就可以用自己的 passkey 登录，并为你的 tailnet 执行管理任务。

除了拥有可用 passkey 登录的管理员之外，另一种方案是设置一个管理员，使其能够通过另一个身份提供方登录——即不是那个阻止你成功登录 tailnet 的身份提供方。

## 工作原理

Tailscale 支持使用 [passkey][docs-passkeys]（通行密钥）进行 Tailscale 认证登录。也就是说，能使用 passkey 登录的用户不依赖任何 SSO 身份提供方。

如果用户可以使用 passkey 登录并拥有[管理员（Admin）][docs-user-roles-admin]角色，他们就可以邀请更多用户、批准设备、编辑你的 [tailnet 策略文件][docs-tailnet-policy-file]，并执行恢复 tailnet、恢复连接所需的其他管理任务。

如果用户可以使用 passkey 登录并拥有 [IT 管理员][docs-user-roles-it-admin]角色，他们可以为被授予[管理员][docs-user-roles-admin]角色的用户创建用户邀请，被邀请的用户随后即可使用 passkey 登录。被邀请的用户拥有管理员权限，可以帮助恢复你的 tailnet。

## 创建可用 passkey 登录的管理员

发送用户邀请需要你拥有[所有者、管理员或 IT 管理员](/docs/reference/user-roles)角色。

1. 创建[用户邀请][docs-invite-any-user-send-links]，并为受邀人设置[管理员][docs-user-roles-admin]或 [IT 管理员][docs-user-roles-it-admin]角色。
2. 提醒受邀用户打开隐私或无痕浏览器会话（以免用已有账户登录），然后使用 [passkey][docs-passkeys] 登录。受邀人也可以换用另一个身份提供方完成认证登录——即不是那个阻止你成功登录 tailnet 的身份提供方。

被邀请的用户现在就可以管理你的 tailnet 了。

关于管理员与 IT 管理员角色的不同能力，更多信息请参阅[由用户角色管理的权限][docs-user-roles-permission-matrix]。

[docs-invite-any-user-send-links]: /docs/features/sharing/how-to/invite-any-user#发送邀请链接

[docs-passkeys]: /docs/integrations/identity/passkeys

[docs-sso-providers]: /docs/integrations/identity

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-user-roles-admin]: /docs/reference/user-roles#admin管理员管理员管理员

[docs-user-roles-it-admin]: /docs/reference/user-roles#it-adminit-管理员

[docs-user-roles-permission-matrix]: /docs/reference/user-roles#权限矩阵
