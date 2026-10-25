---
title: "设置 GitHub 以与 Tailscale 配合使用"
description: "你可以使用 GitHub 组织账户或 GitHub 个人账户来创建 Tailscale 网络（即 tailnet）。关于 GitHub 账户的更多信息，参见 Types of GitHub accounts。"
---

最后验证于 Feb 4, 2026

你可以使用 GitHub 组织账户或 GitHub 个人账户来创建 Tailscale 网络（即 tailnet）。关于 GitHub 账户的更多信息，参见 [Types of GitHub accounts][xt-gh-accounts]。

## 创建 GitHub 个人 tailnet

1. 前往 Tailscale 的 [Sign up](https://login.tailscale.com/start) 页面，选择 **Sign up with GitHub**。你将被重定向到 GitHub 的 **Authorize Tailscale** 页面。

2. 选择 **Authorize tailscale**。你将被重定向到 Tailscale 的 **Select a tailnet** 页面。

3. 选择你想用于 tailnet 的 GitHub 个人账户。你将被重定向到 Tailscale 的[管理控制台](https://console.tailscale.com/admin)，在那里可以管理你的 tailnet。

tailnet 创建完成后，你可以[邀请任意用户][docs-invite-any-user]加入你的 GitHub 个人 tailnet，包括其他 GitHub 用户。除非你主动共享，否则受邀用户将无权访问你的 GitHub 仓库。

## 创建 GitHub 组织 tailnet

你必须是想用来创建 tailnet 的 GitHub 组织的所有者。

1. 前往 Tailscale 的 [Sign up](https://login.tailscale.com/start) 页面，选择 **Sign up with GitHub**。你将被重定向到 GitHub 的 **Authorize Tailscale** 页面。

2. 选择 **Authorize tailscale**。你将被重定向到 Tailscale 的 **Select a tailnet** 页面。

3. 选择你想用于 tailnet 的 GitHub 组织。你将被重定向到 Tailscale 的[管理控制台](https://console.tailscale.com/admin)，在那里可以管理你的 tailnet。

tailnet 创建完成后，你的 GitHub 组织中的任何用户都可以加入你的 tailnet。你也可以[邀请][docs-invite-any-user] GitHub 组织之外的用户。邀请链接只能发送给 GitHub 组织的非成员，对 GitHub 组织成员无效。除非你主动共享，否则受邀用户将无权访问你的 GitHub 仓库。

## 加入 GitHub 个人 tailnet

想加入 GitHub 个人 tailnet 的任何用户，都必须使用 tailnet 管理员提供的[邀请][docs-invite-any-user]链接。

1. 打开邀请链接中的 URL。

2. 选择 **Sign up with GitHub**。你将被重定向到 GitHub 的 **Authorize Tailscale** 页面。

3. 选择 **Authorize tailscale**。你将被重定向到 Tailscale 的 **Select a tailnet** 页面。

4. 选择你想加入的 tailnet。页面会显示一条确认消息，并附带在你设备上下载并[安装][docs-install] Tailscale 客户端的链接。

## 加入 GitHub 组织 tailnet

如果你属于该 GitHub 组织，可以从 Tailscale 的 [Sign up](https://login.tailscale.com/start) 页面自动加入 tailnet。如果你不是该 GitHub 组织的成员，则需要 tailnet 管理员向你发送[邀请][docs-invite-any-user]链接才能加入。

### GitHub 组织成员

1. 前往 Tailscale 的 [Login](https://login.tailscale.com/login) 页面。

2. 选择 **Sign up with GitHub**。你将被重定向到 GitHub 的 **Authorize Tailscale** 页面。

3. 选择 **Authorize tailscale**。你将被重定向到 Tailscale 的 **Select a tailnet** 页面。

4. 选择你拥有的 tailnet 或想加入的 tailnet。页面会显示一条确认消息，并附带在你设备上下载并[安装][docs-install] Tailscale 客户端的链接。

### 非 GitHub 组织成员

1. 打开邀请链接中的 URL。

2. 选择你偏好的身份提供方进行认证。认证通过后，页面会显示一条确认消息，并附带在你设备上下载并[安装][docs-install] Tailscale 客户端的链接。

## 迁入与迁出 GitHub tailnet

目前，我们无法将你的 tailnet 迁移到 GitHub 作为身份提供方，也无法从 GitHub 迁出。

## 多个 tailnet

目前，我们无法为 GitHub 组织启用或创建[多个 tailnet][docs-multiple-tailnets]。

[docs-install]: /docs/how-to/quickstart

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-multiple-tailnets]: /docs/features/multiple-tailnets

[xt-gh-accounts]: https://docs.github.com/en/get-started/learning-about-github/types-of-github-accounts
