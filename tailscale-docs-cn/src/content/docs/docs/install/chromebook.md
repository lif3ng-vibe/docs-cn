---
title: "在 Chromebook 上安装 Tailscale"
description: "在 Chromebook 上安装 Tailscale 客户端。"
---

最后验证于 Aug 22, 2025

你可以通过 Google Play 商店在 Chromebook 上安装 Tailscale。它以 Android 应用的形式运行在 ChromeOS 上。

> **注意：**
>
> 某些政策可能会阻止你在 Chromebook 上安装 Android 应用。如果你的设备所在的网络禁止安装 Android 应用，目前没有其他办法安装 Tailscale。

1. 从**启动器**（Launcher）中打开 **Play Store**。
2. 找到 Tailscale 应用并选择**安装**（Install）。
3. 打开 Tailscale 应用并选择**开始使用**（Get Started）。当**连接请求**（Connect request）对话框出现时，选择**确定**（OK）。
4. 选择**登录**（Log in），并使用你的 [SSO 身份提供方][docs-sso-providers]登录。
5. 当**通知**（Notifications）对话框出现时，选择**继续**（Continue）。
6. 当**是否允许 Tailscale 向你发送通知**？对话框出现时，选择是否让客户端显示通知。

## MDM 部署

如果你想在采用 MDM 方案的环境中部署 Android，请参阅[使用 MDM 在 Android 上部署 Tailscale][docs-android-mdm]。

[docs-android-mdm]: /docs/integrations/mdm/android

[docs-sso-providers]: /docs/integrations/identity
