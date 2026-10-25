---
title: "仅限邀请的功能"
description: "创建和接受 Tailscale 功能邀请。"
---

最后验证于 Sep 26, 2025

仅限邀请的功能要求用户被邀请后接受邀请，才能获得功能预览的访问权限。
用户可以创建邀请码并分享给其他用户。

## 工作原理

仅限邀请的功能需要邀请码。

持有某项仅限邀请功能邀请码的用户，可以自行决定是否接受邀请，把该功能添加到自己的 tailnet。

一条邀请码最多可被兑换若干次（有上限），且没有时间上的过期限制。

*（图：接受某项仅限邀请功能的对话框示例。）*

你必须是 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles)，才能创建或接受邀请码、加入邀请码候补名单，或从管理控制台复制邀请码。

## 创建功能邀请

你必须成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles)，才能创建功能邀请。

1. 打开管理控制台的 [General](https://console.tailscale.com/admin/settings/general)（常规）设置页面。

2. 在 **Feature previews**（功能预览）部分，找到你想邀请他人访问的功能。仅限邀请的功能带有 **Invite only** 徽标。

3. 选择 **Invite others** 按钮，例如 **Invite others to use New Feature**。

4. 选择 **Generate & copy invite link**。

   *（图：生成邀请的对话框示例。）*

5. 把复制好的链接分享给他人。

如果需要再次复制链接，回到管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面，选择 **Invite others** 按钮，然后选择 **Copy invite link**。

## 接受功能邀请

你必须成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles)，才能接受功能邀请。

1. 打开邀请 URL。
2. 选择 **Join alpha** 按钮确认接受该功能。
3. 视具体功能而定，你可能需要更新 tailnet 设置或执行其他步骤来启用该功能。请根据接受邀请时给出的指引进行相应操作。

## 加入功能邀请候补名单

你必须成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles)，才能加入邀请候补名单。

1. 打开管理控制台的 [General](https://console.tailscale.com/admin/settings/general)（常规）设置页面。
2. 在 **Feature previews**（功能预览）部分，找到你想获得访问权限的功能。仅限邀请的功能带有 **Invite only** 徽标。
3. 选择 **Join waitlist** 按钮。

如果该功能有空余名额，Tailscale 会自动授予你对该功能的访问权限。否则，Tailscale 会把你加入该功能的候补名单——获得访问权限时你会收到一封电子邮件。
