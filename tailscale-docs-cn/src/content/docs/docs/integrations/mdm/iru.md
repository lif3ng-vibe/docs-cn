---
title: "使用 Iru 部署 Tailscale"
description: "你可以使用 Iru 移动设备管理（MDM）解决方案在你的组织中部署 Tailscale。你可以使用 Iru 远程安装 Tailscale 客户端、配置多个[系统策略][docs-mdm-keys]，并将这些策略部署到组织中的各台设备。"
---

最后验证于 Dec 2, 2025

> **注意：** 本集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

> **注意：**
>
> Iru 的前身是 Kandji。在说明、代码示例和用户界面中，你可能仍会看到多处 Kandji 的字样。

你可以使用 Iru 移动设备管理（MDM）解决方案在你的组织中部署 Tailscale。你可以使用 Iru 远程安装 Tailscale 客户端、配置多个[系统策略][docs-mdm-keys]，并将这些策略部署到组织中的各台设备。Iru 下的 Tailscale 系统策略支持 macOS 和 iOS。

如果你在使用 Iru 部署 Tailscale 时需要帮助，或者想提出功能改进建议，请联系我们的[支持][co-contact-support-form]或[销售][co-contact-sales]团队。

## 使用 Kandji Auto Apps 部署 Tailscale

> **注意：**
>
> 一般最佳实践请参阅[使用 MDM 在 macOS 上部署 Tailscale][docs-macos-mdm]，并参阅[自动批准 Tailscale 系统扩展][docs-macos-mdm-approve-the-extension]以确保最终用户体验最佳。

Kandji 的 [Auto Apps][xt-iru-endpoint-management-auto-apps] 功能让你可以在整个设备群（fleet）中的任何 Mac 上自动安装 Tailscale。此外，Kandji 还可以跟踪新的 Tailscale 版本，并按你定义的规则自动安装。要开始使用，请按以下步骤操作：

1. 登录你的 Kandji 管理控制台，地址为 `<companyName>.kandji.io`。

2. 选择 **Library**（资料库）标签页，然后选择 **Add Item**（添加项目）按钮来添加新项目。

3. 向下滚动页面到 **Auto Apps** 部分。选择 **Tailscale**，然后选择 **Add and Configure**（添加并配置），这会将 Tailscale 添加到你的 Kandji 资料库中。

   *（图：选择要添加到 Kandji 资料库的 Tailscale。）*

4. 选择一个或多个要将 Tailscale 加入的蓝图（blueprint）。蓝图是一组可部署到一组设备的资料库项目和其他配置。例如，若要将 Tailscale 部署到你设备群中的所有设备，请选择 **All Blueprints**（所有蓝图）选项。你也可以添加其他可选规则来限制蓝图内的分配范围。

   *（图：选择要将 Tailscale 加入的蓝图。）*

5. 选择一种安装方式。你可以选择安装并持续强制设备上的 Tailscale 安装，也可以允许用户按需从 Kandji Self Service 应用安装 Tailscale。

6. 在 **Enforcement**（强制执行）部分，选择 Kandji 是否应自动为你更新 Tailscale 客户端。更多信息请参阅本主题后面的[使用 Kandji 管理 Tailscale 更新][ar-managing-tailscale-updates-with-kandji]。

   *（图：指定 Kandji 是否应自动更新 Tailscale 客户端。）*

7. 打开 **Notifications**（通知）开关，自动为客户端启用通知权限。这样，当设备密钥即将过期、互联网连接中断或需要执行其他操作时，Tailscale 就能通知你的用户。

8. Tailscale 以菜单栏应用的形式运行，没有 Dock 图标，因此你可以放心取消勾选 **Add to Dock during install**（安装时添加到 Dock）选项。

9. 选择 **Save**（保存）继续。

10. Tailscale 客户端的部署将按照你选择的选项开始。你可以使用 **Status**（状态）标签页跟踪其状态。

    *（图：查看 Tailscale 部署的状态。）*

### 使用 Kandji 管理 Tailscale 更新

默认情况下，Tailscale 会使用应用内置的 Sparkle 框架自行自动更新。我们提供了多个[系统策略][docs-mdm-keys]来配置自动更新设置，包括这些设置是否对最终用户可见。如果你更愿意使用 Tailscale 内置的自动更新器，在 Kandji 资料库中设置 Tailscale 时应选择 **Do not manage updates**（不管理更新）。

如果你更希望集中管理应用更新，可以让 Kandji 替你安装更新。为此，请选择 **Automatically enforce new updates**（自动强制安装新更新）或 **Manually enforce a new version**（手动强制安装新版本）之一。然后，设置以下系统策略值，确保 Tailscale 自动更新器不会运行、也不会对用户可见：

* `SUAutomaticallyUpdate` = `false`
* `SUEnableAutomaticChecks` = `false`
* `ApplyUpdates` = `hide`

## 使用 Kandji 部署 Tailscale 系统策略

Tailscale [系统策略][docs-mdm-keys]让你可以自定义设备群中各设备上 Tailscale 客户端的行为。你可以强制 Tailscale 始终启用、强制使用指定的出口节点、隐藏用户界面的特定部分，等等。有关可用选项的更多信息，请参阅[系统策略主题][docs-mdm-keys]。

要开始使用 Kandji 部署 Tailscale 系统策略，你首先需要确定要对设备施加哪些策略。确定要施加的系统策略及其各自的值后，你需要创建一个 Apple 配置描述文件（`.mobileconfig` 文件）来定义它们，并将该描述文件上传到 Kandji 管理控制台。

1. 将我们[配置描述文件模板][docs-macos-mdm-deploy-policies-profile]的内容粘贴到一个名为 `Tailscale.mobileconfig` 的新 XML 文件中，该模板为 **ManagedByOrganizationName** 和 **IPAddressCopiedAlertSuppressed** 策略提供了预设值。这个带有 `.mobileconfig` 扩展名的 XML 文件将成为你的配置描述文件。

2. 登录你的 Kandji 管理控制台，地址为 `<companyName>.kandji.io`。

3. 选择 **Library**（资料库）标签页，然后选择 **Add Item**（添加项目）按钮来添加新项目。

4. 选择 **Custom Profile**（自定义描述文件），然后选择 **Add and Configure**（添加并配置）。

   *（图：添加并配置自定义描述文件。）*

5. 为描述文件指定一个描述性名称，例如 `Tailscale System Policies for macOS`。

   *（图：为描述文件指定名称。）*

6. 将你之前创建的 `.mobileconfig` 文件上传到管理控制台。

   *（图：上传 .mobileconfig 文件。）*

7. 选择 **Save**（保存）。

8. 系统策略的部署将按照你选择的选项开始。你可以使用 **Status**（状态）标签页跟踪其状态。

   *（图：查看系统策略部署的状态。）*

9. 重启设备上的 Tailscale 客户端，确保策略完全生效。如果你部署了 **ManagedByOrganizationName** 策略，可以通过检查 Tailscale 客户端中的 **Managed by CompanyName**（由 CompanyName 管理）菜单项来快速验证部署是否成功。

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[ar-managing-tailscale-updates-with-kandji]: #使用-kandji-管理-tailscale-更新

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#自动批准-tailscale-系统扩展

[docs-macos-mdm-deploy-policies-profile]: /docs/integrations/mdm/mac#在配置描述文件中部署系统策略

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[xt-iru-endpoint-management-auto-apps]: https://www.iru.com/products/endpoint/endpoint-management
