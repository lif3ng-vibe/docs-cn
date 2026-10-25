---
title: "使用 Microsoft Intune 部署 Tailscale"
description: "你可以使用 [Microsoft Intune][xt-intune-landing-page] 移动设备管理（MDM）解决方案在你的组织中部署 Tailscale。你可以配置多个[系统策略][docs-mdm-keys]，然后使用 Microsoft Intune 将这些策略部署到组织中的各台设备。"
---

最后验证于 Jan 5, 2026

> **注意：** 本集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

你可以使用 [Microsoft Intune][xt-intune-landing-page] 移动设备管理（MDM）解决方案在你的组织中部署 Tailscale。你可以配置多个[系统策略][docs-mdm-keys]，然后使用 Microsoft Intune 将这些策略部署到组织中的各台设备。通过 Microsoft Intune 使用 Tailscale 系统策略支持 Windows、macOS、iOS、tvOS 和 Android。

如果你在使用 Microsoft Intune 部署 Tailscale 时需要帮助，或者想提出功能改进建议，请联系我们的[支持][co-contact-support-form]或[销售][co-contact-sales]团队。

按照本文档中的步骤开始使用。在 macOS 和 iOS 上，你将创建一个包含系统策略的配置描述文件，作为示例在 Tailscale 客户端中显示你组织的名称，然后将其部署到一批已注册到 Microsoft Intune 的设备。在 Android 上，你将通过定义自定义配置来分发 Tailscale，并强制执行 Tailscale 应用中已有的限制。

## 为 macOS/iOS/iPadOS 创建、上传并部署 Tailscale 配置描述文件

> **注意：**
>
> 一般最佳实践请参阅[使用 MDM 在 macOS 上部署 Tailscale][docs-macos-mdm]，并参阅[自动批准 Tailscale 系统扩展][docs-macos-mdm-approve-the-extension]以确保最终用户体验最佳。

要开始搭配使用 Tailscale 和 Microsoft Intune，你首先需要确定要对设备施加哪些[系统策略][docs-mdm-keys]。确定要施加的系统策略及其各自的值后，你需要创建一个 Apple 配置描述文件（`.mobileconfig` 文件）来定义它们，并将该描述文件上传到 Microsoft Intune 管理中心。

1. 将我们[配置描述文件模板][docs-macos-mdm-deploy-policies-profile]的内容粘贴到一个名为 `Tailscale.mobileconfig` 的新 XML 文件中，该模板为 **ManagedByOrganizationName** 和 **IPAddressCopiedAlertSuppressed** 策略提供了预设值。这个带有 `.mobileconfig` 扩展名的 XML 文件将成为你的配置描述文件。
2. 登录 [Microsoft Intune 管理中心][xt-intune-admin-center]。
3. 在侧边栏中选择 **Devices**（设备），然后在 **Policy**（策略）部分下选择 **Configuration profiles**（配置描述文件）。
4. 此时将显示当前已配置的描述文件列表。选择 **Create**（创建）菜单项，然后在出现的下拉菜单中选择 **New Policy**（新建策略）。
5. 使用 **Platform**（平台）下拉菜单选择你要配置的**平台**：macOS 或 **iOS/iPadOS**。
6. 将 **Profile type**（描述文件类型）选择为 **Templates**（模板）。
7. 选择 **Custom**（自定义）模板，并使用模板列表底部的 **Create**（创建）按钮确认。
8. 为策略设置一个描述性名称和可选描述，例如 `Tailscale macOS system policies`。

   *（图：为自定义配置描述文件设置名称和描述。）*
9. 在接下来的 **Configuration settings**（配置设置）步骤中，输入一个将向用户显示的策略名称，并上传之前创建的 `.mobileconfig` 文件。如果系统询问，请使用 **Device**（设备）部署通道。选择 **Next**（下一步）继续。

   *（图：上传之前创建的 .mobileconfig 文件。）*
10. 在 **Assignments**（分配）标签页中选择正确的分配对象。如果你希望将配置描述文件部署到组织中的所有用户和组，可以使用 **Add all users**（添加所有用户）快捷方式；也可以选择要向其部署策略的用户和组。

    *（图：选择要分配策略的用户和组。）*
11. 选择 **Next**（下一步）进入 **Review**（审阅）步骤。如果一切无误，选择 **Create**（创建）来部署该策略。

上述步骤同时适用于 macOS 和 iOS 部署。如果你的组织中同时有 macOS 和 iOS 设备，请按照说明操作两次：使用每个平台正确的应用 bundle identifier 分别创建两个 `.mobileconfig` 文件，然后在 Intune 管理中心询问时选择正确的平台。

完成这些步骤后，Microsoft Intune 将开始向你选择的所有用户和组部署该描述文件。设备重启后，每台已注册的客户端都应在 Tailscale 客户端菜单中显示所使用的示例配置描述文件中设置的组织名称。

## 为 Windows 创建、上传并部署 Tailscale 配置描述文件

> **注意：**
>
> 一般最佳实践请参阅[使用 MDM 在 Windows 上部署 Tailscale][docs-windows-mdm]。

要开始搭配使用 Tailscale 和 Microsoft Intune，你首先需要确定要对设备施加哪些[系统策略][docs-mdm-keys]。确定要施加的系统策略及其各自的值后，我们建议使用提供的 Tailscale ADMX 文件来导入策略，生成与 Microsoft Intune 配合使用的 Tailscale 配置描述文件。[ADMX 文件][xt-ms-admx-overview]是在 Windows 上定义组策略的一种方式。

1. 从 [Tailscale 仓库][xt-gh-tailscale-windows-policy]下载 Tailscale ADMX 文件和 ADML 文件。
2. 登录 [Microsoft Intune 管理中心][xt-intune-admin-center]。
3. 在侧边栏中选择 **Devices**（设备），然后在 **Policy**（策略）部分下选择 **Configuration profiles**（配置描述文件）。

   *（图：配置描述文件视图。）*
4. 首先，导入 Tailscale ADMX 文件。选择 **Import ADMX**（导入 ADMX），然后选择 **Import**（导入）按钮。

   *（图：导入 Tailscale ADMX 文件。）*
5. 上传 Tailscale ADMX 文件和 Tailscale ADML 文件。选择 **Next**（下一步），然后选择 **Create**（创建）。你可以选择 **Refresh**（刷新）来检查上传进度和模板是否可用。
6. 返回 **Policies**（策略）部分。此时将显示当前已配置的描述文件列表。选择 **Create**（创建）菜单项，然后在出现的下拉菜单中选择 **New Policy**（新建策略）。
7. 使用 **Platform**（平台）下拉菜单选择 **Windows 10 and later**（Windows 10 及更高版本）。
8. 将 **Profile type**（描述文件类型）选择为 **Templates**（模板）。
9. 选择 **Imported Administrative templates**（Preview）（已导入的管理模板（预览））。

   *（图：选择 Imported Administrative templates (Preview)。）*
10. 为策略设置一个描述性名称和可选描述，例如 `Tailscale windows policies`。

    *（图：为自定义配置描述文件设置名称和描述。）*
11. 现在你会发现 Tailscale 设置已可供配置。

    *（图：Tailscale 设置现已可供配置。）*

    选择 Tailscale 设置后，你可以浏览可用的策略并设置它们的值。

    *（图：选择 Tailscale 设置以浏览可用策略并设置其值。）*

    设置某个策略的值后，该策略的状态应会显示在 Tailscale 设置中。

    *（图：查看某个策略的状态。）*
12. 配置好你要使用的策略后，选择 **Next**（下一步）进入 **Scope Tags**（作用域标记）部分。如果你有可用的标记，可以为该配置描述文件分配一个；如果没有，选择 **Default**（默认）选项。

    *（图：为配置描述文件分配标记，或选择默认项。）*
13. 选择 **Next**（下一步），并在 **Assignments**（分配）标签页中选择你的分配对象。你可以选择 **Add all users**（添加所有用户）将配置描述文件部署到所有用户，也可以选择特定的用户或用户组。

    *（图：选择要分配策略的用户和组。）*
14. 选择 **Next**（下一步），并在选择 **Create**（创建）之前检查你的描述文件设置。

    *（图：在选择 Create 之前检查描述文件设置。）*

完成这些步骤后，Microsoft Intune 将开始向你选择的所有用户和组部署该描述文件。设备重启后，每台已注册的客户端都应按照所使用的示例配置描述文件，在 Tailscale 客户端菜单中显示组织名称。有关导入 ADMX 文件的更多文档，请查看 [Microsoft Intune 文档][xt-intune-admx]。

## 使用 Microsoft Intune 为 Android 部署 Tailscale

配置 Microsoft Intune 来部署 Tailscale 分为两个步骤。你首先需要将 Tailscale 应用添加为 Managed Google Play 应用。然后，你可以选择使用 Android 托管配置（managed configuration）来部署系统策略。这让你可以配置 Android 版 Tailscale 客户端，以满足你组织的需求。

在继续之前，请确保所有你要向其部署 Tailscale 的 Android 设备都已正确注册到 Intune。因为我们要将 Tailscale 添加为 *Managed Google Play 应用*，你还需要将你的 Intune 账户连接到你的 Managed Google Play 账户。有关账户连接过程的更多信息，请参阅 Microsoft 发布的文档[将你的 Intune 账户连接到你的 Managed Google Play 账户][xt-intune-managed-google-play]。

### 将 Tailscale 应用添加到 Microsoft Intune

1. 登录 [Microsoft Intune 管理中心][xt-intune-admin-center]。
2. 依次选择 **Apps**（应用）> **All apps**（所有应用）> **Add**（添加），然后选择 **Managed Google Play app**（Managed Google Play 应用）。
3. 搜索 **Tailscale** 并确认。
4. 你可能希望将 Tailscale 分配给一组用户，这样 Tailscale 就会自动部署到这些用户的设备上。

### 使用 Intune 在 Android 上部署 Tailscale 系统策略

将 Tailscale 配置为 Intune 中的已部署应用后，你可以选择配置一组[系统策略][docs-mdm-keys]，这些策略将在已注册的 Android 设备上强制执行。

1. 登录 [Microsoft Intune 管理中心][xt-intune-admin-center]。
2. 依次选择 **Apps**（应用）> **App configuration policies**（应用配置策略）> **Add**（添加）> **Managed devices**（受管设备）。
3. 为策略选择一个描述性名称，例如 *Tailscale System Policies*。选择 **Android** 作为平台。
4. 选择 **Associated app**（关联应用）以显示已配置应用的列表。如果你按照前面的步骤操作，此列表应包含 Tailscale。选择它以继续。
5. 依次选择 **Configuration settings**（配置设置），然后选择 **Use configuration designer**（使用配置设计器），再选择 **Add**（添加），从[可用系统策略][docs-mdm-keys]列表中进行挑选。
6. 输入你偏好的系统策略值。
7. 选择 **OK**（确定）保存配置。

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#自动批准-tailscale-系统扩展

[docs-macos-mdm-deploy-policies-profile]: /docs/integrations/mdm/mac#在配置描述文件中部署系统策略

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-windows-mdm]: /docs/integrations/mdm/windows-mdm

[xt-gh-tailscale-windows-policy]: https://github.com/tailscale/tailscale/tree/main/docs/windows/policy

[xt-intune-admin-center]: https://intune.microsoft.com/?ref=AdminCenter

[xt-intune-admx]: https://learn.microsoft.com/en-us/mem/intune/configuration/administrative-templates-import-custom

[xt-intune-landing-page]: https://www.microsoft.com/en-us/security/business/microsoft-intune

[xt-intune-managed-google-play]: https://learn.microsoft.com/en-us/mem/intune/enrollment/connect-intune-android-enterprise

[xt-ms-admx-overview]: https://learn.microsoft.com/en-us/windows/client-management/understanding-admx-backed-policies
