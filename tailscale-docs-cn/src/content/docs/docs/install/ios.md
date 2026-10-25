---
title: "在 iOS 上安装 Tailscale"
description: "在 iOS 上安装 Tailscale 客户端。"
---

最后验证于 Feb 21, 2025

Tailscale 支持 iOS 15.0 及更高版本，同时支持 iPhone 和 iPad。

1. 从 [App Store][xt-app-store-tailscale] 下载 Tailscale，或扫描 Tailscale [下载][co-download-ios]页面上的二维码。

2. 启动应用，选择**开始使用**（Get Started），接受安装 VPN 配置的提示，并允许推送通知。推送通知用于提醒用户需要重新认证，例如密钥即将过期时。

3. 选择**登录**（Log in），并使用[受支持的 SSO 身份提供方][docs-sso-providers]注册。

## MDM 部署

你可以使用[配置描述文件与用户默认设置][docs-ios-mdm]（configuration profiles and user defaults），以编程方式对 iOS 版 Tailscale 进行个性化设置。这有助于你借助 MDM 之类的解决方案部署 Tailscale。

[co-download-ios]: https://tailscale.com/download/ios

[docs-ios-mdm]: /docs/integrations/mdm/ios

[docs-sso-providers]: /docs/integrations/identity

[xt-app-store-tailscale]: https://apps.apple.com/app/tailscale/id1470499037
