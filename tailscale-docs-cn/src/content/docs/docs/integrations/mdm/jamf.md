---
title: "使用 Jamf Pro 部署 Tailscale"
description: "你可以使用 [Jamf Pro][xt-jamf-pro] 移动设备管理（MDM）解决方案在整个组织中部署 Tailscale。Jamf Pro 让你可以在设备群中自动分发并安装 Tailscale。"
---

最后验证于 Jan 5, 2026

> **注意：** 本集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

你可以使用 [Jamf Pro][xt-jamf-pro] 移动设备管理（MDM）解决方案在整个组织中部署 Tailscale。Jamf Pro 让你可以在设备群中自动分发并安装 Tailscale。之后你可以配置多个[系统策略][docs-mdm-keys]，并使用 Jamf Pro 将这些策略部署到组织中的各台设备。通过 Jamf Pro 使用 Tailscale 系统策略支持 macOS 和 iOS。

如果你在使用 Jamf Pro 部署 Tailscale 时需要帮助，或者想提出功能改进建议，请联系我们的[支持][co-contact-support-form]或[销售][co-contact-sales]团队。

## 使用 Jamf Pro 分发 Tailscale

> **注意：**
>
> 一般最佳实践请参阅[使用 MDM 在 macOS 上部署 Tailscale][docs-macos-mdm]，并参阅[自动批准 Tailscale 系统扩展][docs-macos-mdm-approve-the-extension]以确保最终用户体验最佳。

你可以使用 Jamf Pro 在设备群中的设备上分发 Tailscale。你可以选择部署 Mac App Store 版客户端，或独立（Standalone）版客户端。有关这两种变体差异的更多信息，请参阅[在 macOS 上运行 Tailscale 的三种方式][docs-macos-variants]。

### 分发 Mac App Store 版客户端

1. 登录你组织的 Jamf Pro 管理控制台，地址为 `<companyName>.jamfcloud.com`。

2. 在侧边栏中选择 **Computers**（计算机），然后在 **Content Management**（内容管理）部分选择 **Mac Apps**。切换到 **App Store** 标签页。

3. 选择右上角的 **New**（新建）按钮添加一个新应用。

   *（图：Jamf Pro 管理控制台中的 Mac Apps 视图。）*

4. 选择 **Mac App Store** 作为应用来源。

   *（图：选择 Mac App Store 选项。）*

5. 在你所在区域的 App Store 中搜索 **Tailscale**。

   *（图：在特定区域的 App Store 中搜索 Tailscale。）*

6. 在搜索结果中为 Tailscale 应用选择 **Add**（添加）按钮。

   *（图：将 Tailscale 添加为应用。）*

7. 根据需要设置部署选项，尤其是在 **Scope**（作用范围）标签页中。

   *（图：部署选项视图。）*

8. 现在，Tailscale 应该已在整个设备群的 Self Service 应用中可用。

   *（图：Self Service 应用中的 Tailscale 视图。）*

## 使用 Jamf Pro 部署系统策略

我们建议先阅读[系统策略][docs-mdm-keys]主题，确定适合你组织的配置选项。确定要部署到设备群的策略后，按以下步骤在 Jamf 中定义它们：

1. 登录你组织的 Jamf Pro 管理控制台，地址为 `<companyName>.jamfcloud.com`。

2. 在侧边栏中选择 **Computers**（计算机），然后在 **Content Management**（内容管理）部分选择 **Configuration Profiles**（配置描述文件）。

   *（图：Configuration Profiles 设置。）*

3. 选择右上角的 **New**（新建）按钮创建一个新的配置描述文件。

4. 为描述文件输入一个描述性的显示名称，例如 *Tailscale System Policies*。

   *（图：名为 Tailscale System Policies 的新配置描述文件。）*

5. 选择 **Application & Custom Settings**（应用与自定义设置），然后在出现的下拉菜单中选择 **External Applications**（外部应用）。

   *（图：External Applications 设置。）*

6. 选择右上角的 **Add**（添加）按钮添加一个新的偏好设置域（preference domain）。

7. 选择 **Custom Schema**（自定义 Schema）作为该偏好设置域使用的来源。

8. 输入偏好设置域的正式名称，它与 Tailscale 客户端的 bundle identifier 一致。如果你使用 Mac App Store 版 Tailscale，请输入 `io.tailscale.ipn.macos`。如果你使用独立（Standalone）版，请输入 `io.tailscale.ipn.macsys`。

9. 选择 **Add Schema**（添加 Schema）以提供 JSON schema。

   *（图：Tailscale macOS 变体的 External Applications 设置。）*

10. 在出现的模态窗口中，选择 **Upload**（上传）以提供最新版本的 Tailscale JSON schema。ProfileManifestsMirror 项目提供了与 Jamf JSON schema 兼容的最新 Tailscale 描述文件清单（profile manifest）：Mac App Store 版客户端可从 [`io.tailscale.ipn.macos.json`][xt-gh-jamf-custom-schemas-macos] 下载，独立版可从 [`io.tailscale.ipn.macsys.json`][xt-gh-jamf-custom-schemas-macsys] 下载。从 GitHub 下载后，将该文件上传到 Jamf Pro。

    *（图：Tailscale macOS 变体的 Tailscale JSON schema。）*

11. 上传 JSON 文件后，Jamf Pro 会显示一个用于配置 Tailscale 系统策略的用户界面。为你要设置的策略填写相应的值，完成表单。

    *（图：Tailscale 系统策略选项。）*

12. 记得在 **Scope**（作用范围）标签页中选择配置策略的部署范围。你可以将 **Target Computers**（目标计算机）选为 **All Computers**（所有计算机），将策略部署到组织中的所有 Mac。

    *（图：Tailscale 系统策略作用范围。）*

13. 选择 **Save**（保存）保存配置描述文件并开始部署策略。Tailscale 客户端必须重启才能应用所有策略。

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#approve-the-tailscale-system-extension-automatically

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[xt-gh-jamf-custom-schemas-macos]: https://github.com/Jamf-Custom-Profile-Schemas/ProfileManifestsMirror/blob/main/manifests/ManagedPreferencesApplications/io.tailscale.ipn.macos.json

[xt-gh-jamf-custom-schemas-macsys]: https://github.com/Jamf-Custom-Profile-Schemas/ProfileManifestsMirror/blob/main/manifests/ManagedPreferencesApplications/io.tailscale.ipn.macsys.json

[xt-jamf-pro]: https://www.jamf.com/products/jamf-pro
