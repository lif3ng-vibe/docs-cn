---
title: "Funnel 与设备共享的对比"
description: "了解 Tailscale Funnel 服务与设备共享之间的区别。"
---

最后验证于 Aug 3, 2025

Tailscale 提供不止一种提供和共享资源的方式。你可以使用 [Tailscale Funnel][docs-funnel] 在你的 Tailscale 网络（即 [tailnet][docs-tailnet]）之外共享资源，也可以使用[设备共享][docs-sharing]把整台设备共享给某个人。下表列出了这两个功能之间的差异，并说明了各自最适合的场景。

|                       | **Funnel**                                                 | **共享设备**                                             |
| :-------------------- | :--------------------------------------------------------- | :------------------------------------------------------- |
| **用途**              | 将本地服务暴露到公共互联网。                                | 把特定设备共享给某一个人。                                |
| **访问权限**          | 任何拥有 Funnel URL 的人都可以访问共享的服务。               | 你与之共享设备的那个人。                                  |
| **用例示例**          | 与一名合同雇员共享本地 Web 服务器。                         | 临时授予某人对 tailnet 中一台设备的访问权限。              |

虽然 Funnel 与设备共享的目的相似——都是与 tailnet 之外的人共享，但它们的用例和功能并不相同。

## Funnel

Funnel 适用于较为短暂的目的，比如快速把一个链接分享给某人。它不能与其他 Tailscale 功能（如[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]或[访问控制][docs-access-control]）配合使用。

Funnel 最适合临时共享单个资源，例如一个服务或一个文件夹。你可以使用唯一的 Funnel URL 共享资源。与你共享 URL 的人只有在以下条件同时满足时才能访问该资源：对方的设备在线、服务正在运行，而且 Funnel 正在运行。

在以下情况使用 Funnel：

* 临时把设备上运行的服务共享给公共互联网上的任何人。
* 临时把设备上的文件或文件夹共享给公共互联网上的任何人。

如果符合以下情况，建议改用设备共享：

* 你只需要与特定的某个人共享。
* 你希望对方在取消共享之前始终保留对该设备的访问权限。
* 你希望对共享对象应用访问控制策略。
* 你要共享的不止单个服务。

[**Tailscale Funnel**](/docs/features/tailscale-funnel) —— 使用 Tailscale Funnel 安全地把互联网流量路由到本地服务。

## 共享设备

共享设备比[邀请某人加入你的 tailnet][docs-invite-users]（会增加你的用户数）更临时，但比用 Funnel 共享单个资源更持久。

共享设备最适合把整台设备共享给 tailnet 之外的某个人。共享设备时，你会向对方发送一条邀请链接。Tailscale 会自动对你共享的设备进行[隔离][docs-sharing-quarantine]（quarantine）：被共享的设备只能响应入站连接，不能发起出站连接。你还可以通过针对共享设备的[访问控制策略][docs-access-control]进一步收窄对方的访问范围。例如，你可以针对该用户的电子邮件地址应用访问控制策略，使其只能访问打有 `tag:shared` 标签设备的端口 `22`。

当你需要以可隔离、且能用访问控制策略进一步管理的方式，把单台设备共享给特定的人时，请使用设备共享。

如果只需要在短时间内共享单个服务，建议改用 Funnel。

[**与其他用户共享你的机器**](/docs/features/sharing) —— 让另一个 tailnet 上的 Tailscale 用户访问你 tailnet 内的一台私有机器，而无需将其公开暴露。

## 示例场景

以下小节描述一些示例场景，以及 Funnel 或设备共享哪个更合适。

| **场景**                                                                                                | **建议**                           |
| :------------------------------------------------------------------------------------------------------ | :--------------------------------- |
| 你的设备上运行着一个 Web 服务器的本地开发版本，想与同事分享改动的预览。                                    | [使用 Funnel][docs-funnel]          |
| 你在 tailnet 中架设了一台 Plex 媒体服务器，想让一位朋友访问它以观看你的电影收藏。                          | [使用设备共享][docs-sharing]        |
| 你在 tailnet 中运行着一个 Minecraft 服务器，想让一位或多位朋友加入。                                       | [使用设备共享][docs-sharing]        |
| 你雇了一名合同开发者，想让他访问 tailnet 中的一台开发服务器。                                              | [使用设备共享][docs-sharing]        |
| 你正在本地开发一个集成项目，想在不把项目部署到云端的情况下测试 GitHub webhook 接收器。                      | [使用 Funnel][docs-funnel]          |

[docs-access-control]: /docs/features/access-control

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-invite-users]: /docs/features/sharing/how-to/invite-users

[docs-sharing-quarantine]: /docs/features/sharing#隔离

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-tailnet]: /docs/concepts/tailnet
