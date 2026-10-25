---
title: "在 Amazon Fire 设备上安装 Tailscale"
description: "在 Amazon Fire 设备上安装 Tailscale，包括 Amazon Fire TV 和 Amazon Fire 平板电脑。"
---

最后验证于 Oct 6, 2026

Tailscale 可以在运行特定版本 Fire OS 的 Amazon Fire TV 设备上使用。不过，Tailscale 并未上架 Amazon Appstore，你可以直接从软件包服务器下载并安装 Tailscale。

> **注意：**
>
> 运行 Fire OS 5 或 6 版本的设备，以及运行 Vega OS 的设备，均不支持 Tailscale。

如果你之前是从 Amazon Appstore 下载的 Tailscale，可以继续在 Fire TV 设备上使用，但无法应用更新。若要应用更新，请先从设备上卸载 Tailscale，然后按照以下步骤重新安装。

1. 从软件包服务器[下载][pk-stable-android] Tailscale 并安装到你的 Amazon Fire 设备上。请确保下载的是 Universal Android 应用包（APK）。

   > **注意：**
   >
   > 此 APK 不会自动安装更新。有新版本可用时，你需要手动安装更新。

2. 启动 Tailscale 应用，在**连接请求**（Connection request）窗口中选择**确定**（OK）。然后选择**开始使用**（Get Started），并按照提示接受安装 VPN 配置。

3. 选择**登录**（Log in），并使用你的 [SSO 身份提供方][docs-sso-providers]登录。如果你使用的是 Fire TV 设备，屏幕上会显示二维码。用手机扫描该二维码，即可授权将这台 Amazon Fire 设备加入你的 tailnet。

> **注意：**
>
> 如果启用了[设备审批][docs-device-approval]，在管理员批准该设备之前，Amazon Fire 设备将无法在 tailnet 中访问。

## 支持的硬件

Tailscale 可安装在运行 Fire OS 的 Amazon Fire TV 设备上，Fire OS 5 或 6 版本除外。Vega OS 一律不受支持，包括 Fire TV Stick 4k Select 等设备。

完整的 Fire OS 设备列表，请参阅 [Fire OS 版本][xt-amazon-fire-os]。

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-sso-providers]: /docs/integrations/identity

[pk-stable-android]: https://pkgs.tailscale.com/stable/#android

[xt-amazon-fire-os]: https://developer.amazon.com/docs/fire-tv/fire-os-overview.html#fire-os-versions
