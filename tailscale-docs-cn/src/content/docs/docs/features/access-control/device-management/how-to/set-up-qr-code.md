---
title: "使用二维码添加设备"
description: "你可以使用二维码将设备添加到 Tailscale 网络（即 tailnet），而无需输入[身份提供方][docs-sso-providers]的凭证登录。如果不想在设备上输入用户名和密"
---

最后验证于 Sep 30, 2025

你可以使用二维码将设备添加到 Tailscale 网络（即 tailnet），而无需使用[身份提供方][docs-sso-providers]凭证登录。如果你不想在设备上输入用户名和密码，这种方式会很有用。例如，用 iPhone 扫描二维码即可将 [Apple TV][docs-appletv] 加入你的 tailnet。

## 前提条件

* 一台能扫描二维码的设备，例如手机或平板电脑
* 一台要加入 tailnet 且能生成并显示二维码的设备

## 安装步骤

1. 在你要认证的设备上安装 Tailscale 客户端。

2. 在同一台设备上，应会显示 Tailscale 登录页面。选择 **QR code** 链接，即可显示二维码。如果你要将 Apple TV 加入 tailnet，首次尝试连接时会自动显示二维码。

   *（图：使用二维码登录 Tailscale。）*

3. 使用一台你信任的手机或平板电脑等设备扫描二维码，在其中输入你的 tailnet 用户名和密码。此时应在网页浏览器中打开 Tailscale 的 [Login](https://login.tailscale.com/login) 页面。

4. 选择你的身份提供方，用用户名和密码登录。如果你的账号连接了多个 tailnet，请选择要添加新设备的那个。完成认证后，新设备应会自动登录该 tailnet。

> **注意：**
>
> 如果你的 tailnet 启用了[设备审批][docs-device-approval]，新添加的设备会显示需要审批的提示。批准后，设备将显示 Tailscale 客户端界面。

[docs-appletv]: /docs/install/appletv

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-sso-providers]: /docs/integrations/identity
