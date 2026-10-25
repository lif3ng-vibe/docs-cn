---
title: "使用 TinyMDM 部署 Tailscale"
description: "你可以使用 [TinyMDM][xt-tinymdm-marketing-website] 移动设备管理（MDM）解决方案在整个组织中部署 Tailscale。TinyMDM 让你可以在 Android 设备群中自动分发并安装 Tailscale。"
---

最后验证于 Jan 5, 2026

> **注意：** 本集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

> **注意：**
>
> MDM 支持和系统策略（包括 TinyMDM 集成）要求 Android 版 Tailscale v1.66 或更高版本。更早的版本不支持此功能。

你可以使用 [TinyMDM][xt-tinymdm-marketing-website] 移动设备管理（MDM）解决方案在整个组织中部署 Tailscale。TinyMDM 让你可以在 Android 设备群中自动分发并安装 Tailscale。之后你可以配置多个系统策略，并使用 TinyMDM 将这些策略部署到组织中的各台设备。

如果你在使用 TinyMDM 部署 Tailscale 时需要帮助，或者想提出功能改进建议，请联系我们的[支持][co-contact-support-form]或[销售][co-contact-sales]团队。

## 使用 TinyMDM 分发 Android 版 Tailscale

> **注意：**
>
> 一般最佳实践请参阅[使用 MDM 在 macOS 上部署 Tailscale][docs-macos-mdm]，并参阅[自动批准 Tailscale 系统扩展][docs-macos-mdm-approve-the-extension]以确保最终用户体验最佳。

按以下步骤将 Tailscale APK 部署到已注册到你 TinyMDM 账户的设备上。

1. 登录 [TinyMDM 管理控制台][xt-tinymdm-admin-console]。
2. 在侧边栏中选择 **Enterprise approved apps**（企业已批准应用）。

   *（图：TinyMDM 中的已批准应用列表）*
3. 我们将部署 Google Play 商店中提供的最新版 Tailscale 客户端。在出现的 **Add applications to the company catalog**（将应用添加到公司目录）屏幕中，选择 **Public Apps**（公共应用）。如果你希望手动部署自行获取的 Tailscale APK（例如，为了让设备保持在不同的客户端版本），请在此步骤选择 **Private apps**（私有应用）。

   *（图：将应用添加到公司目录对话框）*
4. 搜索 **Tailscale**，并在搜索结果中出现的列表里选择其 **Select**（选择）输入框。

   *（图：Android Play 商店中的 Tailscale）*
5. **Add applications to the company catalog**（将应用添加到公司目录）对话框会出现。勾选 **Add applications to the company catalog** 复选框，将 Tailscale 添加到已有的设备策略中，并选择 **Approve**（批准）或 **Approve and install**（批准并安装）。你也可以选择 **Add app to all policies**（将应用添加到所有策略），将 Tailscale 部署到组织中所有已注册的 Android 设备。
6. 完成此步骤后，Tailscale 应会出现在 **Approved apps list**（已批准应用列表）中。如果在上一步选择了 **Approve and install**，已注册的设备将开始安装 Tailscale 客户端。

   *（图：Approved apps list 页面中的 Tailscale）*

## 使用 TinyMDM 在 Android 上部署 Tailscale 系统策略

将 Tailscale 客户端添加到用于分发的设备策略后，你可以选择部署系统策略。请按以下步骤继续。

1. 登录 [TinyMDM 管理控制台][xt-tinymdm-admin-console]。
2. 在侧边栏中选择 **Policies**（策略）。
3. 选择一个你希望为其用户部署 Tailscale 的策略，然后选择它的 **Edit**（编辑）按钮。

   *（图：某个策略的 Edit 按钮）*
4. 在出现的策略编辑器中，找到并展开 **Apps management**（应用管理）部分。
5. 由于 Tailscale 已在前面的步骤中添加，它应会出现在此处的可用应用列表中。

   *（图：策略已批准应用列表中的 Tailscale）*
6. 打开 Tailscale 条目的设置菜单，选择 **Configuration**（配置）。

   *（图：Configuration 菜单项）*
7. Tailscale 配置编辑器会出现。现在你可以配置 Tailscale 系统策略。例如，在 **Managed by — organization name**（管理方——组织名称）字段中提供[你的组织名称][docs-org-name-policy]。完成后，选择屏幕右上角的 **Save**（保存）。

   *（图：Tailscale 的配置页面）*

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#自动批准-tailscale-系统扩展

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-org-name-policy]: /docs/features/tailscale-system-policies#设置组织名称

[xt-tinymdm-admin-console]: https://www.tinymdm.net/console

[xt-tinymdm-marketing-website]: https://www.tinymdm.net
