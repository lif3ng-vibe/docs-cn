---
title: "使用 SimpleMDM 部署 Tailscale"
description: "[SimpleMDM][xt-simplemdm] 是一种常用于管理组织内 Apple 设备的移动设备管理（MDM）解决方案。你可以使用 SimpleMDM 在你的组织中部署 Tailscale。你可以配置多个[系统策略][docs-mdm-keys]，然后让 SimpleMDM 将这些策略部署到组织中的各台 Apple 设备。"
---

最后验证于 Jan 5, 2026

> **注意：** 本集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

[SimpleMDM][xt-simplemdm] 是一种常用于管理组织内 Apple 设备的移动设备管理（MDM）解决方案。你可以使用 SimpleMDM 在你的组织中部署 Tailscale。你可以配置多个[系统策略][docs-mdm-keys]，然后让 SimpleMDM 将这些策略部署到组织中的各台 Apple 设备。通过 SimpleMDM 设置的 Tailscale 系统策略支持 macOS、iOS 和 tvOS。

如果你在使用 SimpleMDM 部署 Tailscale 时需要帮助，或者想提出功能改进建议，请联系我们的[支持][co-contact-support-form]或[销售][co-contact-sales]团队。

按照本文档中的步骤开始使用。你将创建一个包含系统策略的配置描述文件，在 Tailscale 客户端中显示你组织的名称，然后将其部署到一批已注册到 SimpleMDM 的设备。

## 创建并上传 Tailscale 配置描述文件

> **注意：**
>
> 一般最佳实践请参阅[使用 MDM 在 macOS 上部署 Tailscale][docs-macos-mdm]，并参阅[自动批准 Tailscale 系统扩展][docs-macos-mdm-approve-the-extension]以确保最终用户体验最佳。

要开始搭配使用 Tailscale 和 SimpleMDM，你首先需要确定要对设备施加哪些[系统策略][docs-mdm-keys]。确定要施加的系统策略及其各自的值后，你需要创建一个 Apple 配置描述文件（`.mobileconfig` 文件）来定义它们，并将该描述文件上传到 SimpleMDM 管理控制台。

1. 将我们[配置描述文件模板][docs-macos-mdm-deploy-policies-profile]的内容粘贴到一个名为 `Tailscale.mobileconfig` 的新 XML 文件中，该模板为 **ManagedByOrganizationName** 和 **IPAddressCopiedAlertSuppressed** 策略提供了预设值。这个带有 `.mobileconfig` 扩展名的 XML 文件将成为你的配置描述文件。

2. 登录 [SimpleMDM 管理控制台][xt-a-simplemdm]。

3. 在侧边栏中，在 **Configs**（配置）部分下选择 **Profiles**（描述文件）。

4. 此时将显示当前已配置的描述文件列表。选择右上角的 **Create Profile**（创建描述文件）按钮。

5. 在可用的描述文件类型中，选择 **Custom Configuration Profile**（自定义配置描述文件）。

6. 为描述文件指定一个名称。该名称将向用户显示在"系统设置"中，例如 `Tailscale Policies`。

7. 将 **For macOS devices, deploy as a device profile instead of a user profile**（对于 macOS 设备，将其部署为设备描述文件而非用户描述文件）选项保持为选中状态。

8. 使用 **Choose File**（选择文件）按钮上传之前创建的 `.mobileconfig` 文件。

9. 保存描述文件。

## 将 Tailscale 描述文件分配给一组设备

SimpleMDM 现在已准备好将你的配置描述文件部署到设备群中的一台或多台设备。为此，请按以下步骤操作。

1. 登录 [SimpleMDM 管理控制台][xt-a-simplemdm]。
2. 在侧边栏中，在 **Devices**（设备）部分下选择 **Groups**（组）。
3. 选择要向其部署 Tailscale 的设备组。例如，**Default**（默认）组应该已经存在，并包含设备群中的所有设备。
4. 组设置出现后，前往 **Profiles**（描述文件）标签页。
5. 选择 **Assign Profile**（分配描述文件）按钮。
6. 在描述文件列表中找到你刚创建的 Tailscale 描述文件，然后选择 **Assign**（分配）。

SimpleMDM 随即将开始向所选组中的设备部署该描述文件。设备重启后，每台已注册的客户端都应在 Tailscale 客户端菜单中显示所使用的示例配置描述文件中设置的组织名称。

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#自动批准-tailscale-系统扩展

[docs-macos-mdm-deploy-policies-profile]: /docs/integrations/mdm/mac#在配置描述文件中部署系统策略

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[xt-a-simplemdm]: https://a.simplemdm.com

[xt-simplemdm]: https://simplemdm.com
