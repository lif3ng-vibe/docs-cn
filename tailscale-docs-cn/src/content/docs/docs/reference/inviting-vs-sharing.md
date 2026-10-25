---
title: "邀请用户与共享设备的对比"
description: "了解邀请用户与共享设备之间的区别。"
---

最后验证于 Jan 5, 2026

Tailscale 提供两种共享设备和服务的访问权限的方式：

* [邀请某人加入你的 Tailscale 网络（即 tailnet）][ar-inviting-a-user]。
* [让另一个 tailnet 中的人访问你 tailnet 内的某台设备][ar-sharing-a-device]。

两种方式各有利弊，各自最适合特定的场景。请阅读以下小节了解每种方式。

## 邀请用户

你可以通过[邀请其他用户][docs-invite-any-user]来共享你 tailnet 中设备和资源的访问权限。被邀请的用户默认可以访问你 tailnet 中的任何设备或服务。你可以使用[访问控制][docs-access-control]约束他们能访问什么。例如，你可以邀请一位用户，并把其访问范围限制在少数几台设备上。

邀请他人时，你必须为其选择[角色][docs-user-roles]。所选角色决定了他们在你的 tailnet 中能做什么、不能做什么。例如，你可以把对方设为 [Member][docs-user-roles-members]，允许其访问设备和服务（以访问控制的规定为准），但不允许其访问管理控制台。

当你要共享的不只是几台设备时，邀请用户最为合适，尤其是当 tailnet 新增设备、该用户也需要随之获得访问权限时。邀请用户还让你可以随时间调整其访问范围，而不必每次都逐台设备地共享和收回权限。

下表列出了邀请用户（而非共享设备）的利与弊。

| **优点**                                                            | **缺点**                                    |
| ------------------------------------------------------------------- | ------------------------------------------- |
| 用户可以访问整个 tailnet（受访问控制限制）。                          | 会增加你 tailnet 的用户数。                  |
| 你可以为该用户配置访问控制策略。                                      |                                             |
| 你可以选择该用户的角色。                                              |                                             |
| 用户可以访问[子网路由器][docs-subnets]后面的设备。                     |                                             |
| 用户可以使用 [Taildrop][docs-taildrop] 等 Tailscale 功能。            |                                             |
| 用户可以向 tailnet 添加设备。                                         |                                             |

## 共享设备

你可以[共享某台设备][docs-sharing]给 tailnet 之外的人，而无需将其暴露到公共互联网。当你把设备共享给另一位 Tailscale 用户后，这台设备会像其他任何设备一样出现在对方的 tailnet 中，包括出现在管理控制台的[机器](https://console.tailscale.com/admin/machines)页面。只有被你共享了该设备的人才能访问它，即使他们与你同属一个 tailnet 也如此。

注意，你的 tailnet 和对方的 tailnet 都必须有允许连接到该共享设备的[访问控制][docs-access-control]。默认的 tailnet 策略文件允许这样做，但如果任一 tailnet 使用了自定义[策略文件][docs-terminology-policy-file]，你必须确保其中授予了对该共享设备的访问权限。

当你共享的是固定数量的设备、且用户不需要完整的 Tailscale 功能时，共享设备最为合适。

下表列出了共享设备（而非邀请用户）的利与弊。

| **优点**                                                             | **缺点**                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| 用户可以访问一台或少数固定数量的设备。                                 | 无法访问[子网路由器][docs-subnets]后面的设备。                 |
| 用户在连接到另一个 tailnet 时也能访问该设备。                          | 无法使用 [Taildrop][docs-taildrop] 等 Tailscale 功能。         |
| 不会增加你 tailnet 的用户数。                                          | 无法添加新设备。                                               |
|                                                                       | 无法为该用户创建访问控制策略。                                 |

[ar-inviting-a-user]: #邀请用户

[ar-sharing-a-device]: #共享设备

[docs-access-control]: /docs/features/access-control

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrop]: /docs/features/taildrop

[docs-terminology-policy-file]: /docs/reference/glossary#tailnet-策略文件

[docs-user-roles-members]: /docs/reference/user-roles#member成员

[docs-user-roles]: /docs/reference/user-roles
