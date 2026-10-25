---
title: "使用 Google Workspace 部署 Tailscale"
description: "你可以使用 Google Workspace 移动设备管理（MDM）方案在整个组织中部署 Tailscale。Google Workspace 让你可以在大量 Android 设备上自动分发并安装 Tailscale 应用。"
---

最后验证于 Jan 5, 2026

> **注意：** 此集成适用于[标准版、高级版和企业版套餐](https://tailscale.com/pricing)。

> **注意：**
>
> MDM 支持和系统策略（包括 Google Workspace 集成）要求 Android 版 Tailscale 为 v1.66 或更高版本。更早的版本不提供此功能。

你可以使用 Google Workspace 移动设备管理（MDM）方案在整个组织中部署 Tailscale。Google Workspace 让你可以在大量 Android 设备上自动分发并安装 Tailscale 应用。随后你可以配置多项系统策略，并使用 Google Workspace 将这些策略部署到组织中的 Android 设备。

如果你在使用 Google Workspace 部署 Tailscale 时需要帮助，或想提出功能改进建议，请联系我们的[支持][co-contact-support-form]或[销售][co-contact-sales]团队。

## 使用 Google Workspace 分发 Android 版 Tailscale

1. 登录 [Google Workspace 管理控制台][xt-google-workspace-admin-console]。

2. 在侧边栏中，选择 **Apps**，然后选择 **Web and mobile apps**。

   *（图：Google Workspace 侧边栏）*

3. 选择 **Add app > Search for apps**。

   *（图：Google Workspace 的 Search for Apps 菜单项）*

4. 搜索 **Tailscale**，并从搜索结果中选中它。

   *（图：Google Workspace 搜索结果中的 Tailscale）*

5. 配置 Tailscale 应用的用户访问权限。此时，你可以选择将 Tailscale 分发给组织中的所有 Android 用户，或仅分发给其中一部分。然后选择 **Continue**。

   *（图：Google Workspace 中 Tailscale 的 User Access 配置）*

6. 定义 Tailscale 应用的分发设置。在此配置界面中，你可以选择让应用可供用户从工作资料（Work profile）的 Play 商店手动下载，或代用户自动强制安装。注意，在此阶段你还可以将 Tailscale 设置为 always-on VPN，即 Android 会自动启动并重启 Tailscale，确保它始终在设备上运行。

   *（图：Google Workspace 中 Tailscale 的 Settings 配置）*

7. 完成上述步骤后，Tailscale 应会出现在应用列表中。

   *（图：Tailscale 作为应用显示在 Google Workspace 中）*

## 使用 Google Workspace 在 Android 上部署 Tailscale 系统策略

完成上述步骤并将 Tailscale 客户端添加到你的组织配置中以供分发后，你还可以选择部署[系统策略][docs-mdm-keys]。按以下步骤继续操作。

1. 在上面的应用列表中，选择 Tailscale。在出现的界面中，向下滚动到 **Managed configurations** 项，然后选择 **Add managed configuration**。

   *（图：Google Workspace 中的 Add managed configuration 按钮）*

2. Tailscale 配置编辑器会出现。现在你可以配置 Tailscale 系统策略。例如，在 **Managed by — organization name** 字段中填写[你的组织名称][docs-org-name-policy]。完成后，选择屏幕右下角的 **Save**。

## 使用 Google Workspace 在 ChromeOS 上部署 Tailscale 系统策略

你也可以使用 Google Workspace 在[受管理的 ChromeOS 设备上部署并配置
Tailscale][xt-google-workspace-managed-chromeos]。ChromeOS 上 Android 应用的托管
策略以 JSON 对象字面量的形式提供，其键与[托管策略键][docs-mdm-keys]对应。

*（图：Google Workspace 中 ChromeOS 上 Tailscale 的托管配置）*

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-org-name-policy]: /docs/features/tailscale-system-policies#设置组织名称

[xt-google-workspace-admin-console]: https://admin.google.com/ac/home

[xt-google-workspace-managed-chromeos]: https://support.google.com/chrome/a/answer/7131624
