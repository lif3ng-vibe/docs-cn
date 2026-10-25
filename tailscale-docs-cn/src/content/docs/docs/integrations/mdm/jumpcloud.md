---
title: "使用 JumpCloud 部署 Tailscale"
description: "你可以使用 [JumpCloud][xt-jumpcloud] 移动设备管理（MDM）解决方案在整个组织中部署 Tailscale。JumpCloud 让你可以在设备群中自动分发并安装 Tailscale。"
---

最后验证于 Jan 5, 2026

> **注意：** 本集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

你可以使用 [JumpCloud][xt-jumpcloud] 移动设备管理（MDM）解决方案在整个组织中部署 Tailscale。JumpCloud 让你可以在设备群中自动分发并安装 Tailscale。之后你可以配置多个[系统策略][docs-mdm-keys]，并使用 JumpCloud 将这些策略部署到组织中的各台设备。通过 JumpCloud 设置的 Tailscale 系统策略支持 Windows、macOS、iOS/tvOS 和 Android。

如果你在使用 JumpCloud 部署 Tailscale 时需要帮助，或者想提出功能改进建议，请联系我们的[支持][co-contact-support-form]或[销售][co-contact-sales]团队。

## 使用 JumpCloud 在 macOS 上部署 Tailscale

> **注意：**
>
> 一般最佳实践请参阅[使用 MDM 在 macOS 上部署 Tailscale][docs-macos-mdm]，并参阅[自动批准 Tailscale 系统扩展][docs-macos-mdm-approve-the-extension]以确保最终用户体验最佳。

要将 Tailscale 部署到通过 JumpCloud 管理的一批 Mac，请按以下步骤操作。你首先需要配置 JumpCloud 以获取并分发 Tailscale `.pkg` 安装包。然后，如有需要，你可以配置并部署一组系统策略，根据组织的需求自定义 Tailscale 客户端的行为。

### 分发独立（Standalone）版客户端

按以下步骤将 Tailscale 添加到 JumpCloud 管理控制台的可部署应用中：

1. 登录你组织的 JumpCloud 管理控制台，地址为 `https://console.jumpcloud.com`。

2. 在侧边栏中选择 **Software Management**（软件管理），然后选择 **Apple** 部分以显示你已部署的 macOS 应用资料库。

3. 选择左上角的 **+** 按钮添加一个新应用。选择 **Self-hosted**（自托管）选项，它让你可以通过提供 `.pkg` 安装包的 URL 来定义一个新应用。

   *（图：在 JumpCloud MDM 管理控制台中输入软件包 URL 的界面。）*

4. 在 **Software Description**（软件描述）字段中，输入 **Tailscale**。

5. 在 **Software Package URL**（软件包 URL）字段中，输入 Tailscale 安装包的下载 URL，例如 `https://pkgs.tailscale.com/stable/Tailscale-1.76.1-macos.pkg`。要确定应使用的 URL，请参阅我们的[软件包服务器][pk-stable-macos]找到客户端的最新可用版本。将 `1.76.1` 替换为当前版本号。

> **警告：**
>
> 不要使用会自动更新的 `latest` 下载 URL（`https://pkgs.tailscale.com/stable/Tailscale-latest-macos.pkg`）。虽然这个下载 URL 起初可以正常工作，但 Tailscale 一发布更新它就会失效。
>
> JumpCloud 不支持指向会变化的 `.pkg` 文件版本的 URL。当 `.pkg` 文件更新为与 JumpCloud 管理控制台中最初配置的版本不同的版本时，包校验将失败。

1. 选择 **Validate**（验证）按钮，确认 JumpCloud 能够获取该安装包。如果成功，你会看到版本字段填入你所选的版本。

然后，将 Tailscale 应用分配给一台设备或一组设备：

1. 选择 **Devices**（设备）或 **Device Groups**（设备组）部分，并选择一台或多台设备或一个或多个设备组，作为你要部署 Tailscale 的对象。

2. 选择 **Save**（保存）确认选择。确认后，JumpCloud 将开始在你选择的设备或设备组上静默运行 Tailscale `.pkg` 安装程序。

### 使用 JumpCloud 在 macOS 上部署系统策略

我们建议先阅读[系统策略][docs-mdm-keys]主题，确定适合你组织的配置选项。确定要部署到设备群的策略后，按以下步骤在 JumpCloud 中定义它们：

1. 登录你组织的 JumpCloud 管理控制台，地址为 `https://console.jumpcloud.com`。

2. 在侧边栏中选择 **Policy Management**（策略管理）部分。

3. 选择屏幕左上角的 **+** 按钮添加一个新策略。在出现的模态窗口中，选择 **Mac**。

4. 在可用策略类型列表中，选择 **MDM Custom Configuration Profile**（MDM 自定义配置描述文件），它允许你上传自定义的 `.mobileconfig` 文件。

   *（图：在 JumpCloud MDM 管理控制台中选择策略类型的界面。）*

5. 选择一个描述性的策略名称和描述（可选），例如 `Tailscale System Policies`。

   *（图：在 JumpCloud MDM 管理控制台中选择描述文件标题和描述的界面。）*

6. 在 **Mobile Configuration File**（移动配置文件）部分，上传一个包含你的策略的 `.mobileconfig` 文件。你可以在[我们的 macOS MDM 设置指南][docs-macos-mdm]中找到一个示例。

7. 通过在 **Device Groups**（设备组）或 **Devices**（设备）部分中选择相应项目，将策略分配给一组设备或一台或多台设备。

8. 选择 **Save**（保存）保存策略。JumpCloud 随即将开始把配置描述文件部署到所选设备。Tailscale 客户端必须重启才能应用所有策略。

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#approve-the-tailscale-system-extension-automatically

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[pk-stable-macos]: https://pkgs.tailscale.com/stable/#macos

[xt-jumpcloud]: https://jumpcloud.com/platform/mdm
