---
title: "在 Android 上安装 Tailscale"
description: "在 Android 设备上安装 Tailscale 客户端。"
---

最后验证于 Jan 5, 2026

Tailscale 客户端支持 Android 8.0 及以上版本，可用于手机、平板电脑和 Android TV 等设备。如果要在 ChromeOS 上安装 Tailscale 客户端，请参阅[在 Chromebook 上安装 Tailscale][docs-install-chromebook]。

## 使用单点登录账户

如果要将 Tailscale 客户端安装到 Android 手机或 Android 平板电脑上，可以使用此方法。

1. 从 [Google Play 商店][xt-google-play-tailscale]下载 Tailscale，或前往 Tailscale [下载][co-download-android]页面。

2. 启动应用并选择**开始使用**（Get Started），接受安装 VPN 配置的提示，并允许推送通知。推送通知用于提醒用户需要重新认证，例如密钥即将过期时。

3. 点按**使用 Google 登录**（Sign in with Google）以使用系统 Google 账户，或点按**使用其他方式登录**（Sign in with other）来使用其他任何[受支持的 SSO 身份提供方][docs-sso-providers]。

## 使用二维码

如果要将 Tailscale 客户端安装到 Android 手机、Android 平板电脑或 Android TV 上，可以使用此方法。更多信息请参阅[使用二维码添加设备][docs-device-add-qr-code]。

## 使用生成的代码

如果要将 Tailscale 客户端安装到 Android TV 上，可以使用此方法。它会生成一个由字母和数字组成的代码，你可以在 Tailscale 管理控制台中输入该代码，完成自动认证。

1. 从 [Google Play 商店][xt-google-play-tailscale]下载 Tailscale。
   1. 启动 Tailscale 应用并选择**登录**（Log in）。
   2. 记下二维码下方显示的代码。
2. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
   1. 选择**添加设备**（Add device），然后选择**客户端设备**（Client device）。
   2. 选择 **Android**，再选择**输入代码**（Input code）标签页，输入你记下的代码。
   3. 选择**提交**（Submit）。

## MDM 部署

你可以使用[应用限制][docs-android-mdm]（app restrictions）以编程方式对 Android 版 Tailscale 进行个性化配置。这有助于你在组织内借助 MDM 等方案部署 Tailscale。

[co-download-android]: https://tailscale.com/download/android

[docs-android-mdm]: /docs/integrations/mdm/android

[docs-device-add-qr-code]: /docs/features/access-control/device-management/how-to/set-up-qr-code

[docs-install-chromebook]: /docs/install/chromebook

[docs-sso-providers]: /docs/integrations/identity

[xt-google-play-tailscale]: https://play.google.com/store/apps/details?id=com.tailscale.ipn
