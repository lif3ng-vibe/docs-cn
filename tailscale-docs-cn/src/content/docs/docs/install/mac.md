---
title: "在 macOS 上安装 Tailscale"
description: "在 macOS 上安装 Tailscale 客户端。"
---

最后验证于 Jan 5, 2026

> **注意：**
>
> 当前版本的 Tailscale 客户端要求 macOS Monterey 12.0 或更高版本。

1. 使用以下任一方式下载并安装 Tailscale 客户端：

   * [独立版本][pk-stable-macos]（Standalone variant），来自 Tailscale 的软件包服务器（推荐）。
   * [Mac App Store][xt-apple-tailscale-macos] 版本。Tailscale 客户端可免费下载，但从 Mac App Store 下载任何应用都可能需要绑定了有效信用卡的 Apple ID。
   * [我们的开源][xt-gh-tailscale-macos]版本，来自 GitHub 仓库。

2. 按照 Tailscale 的引导流程操作，它会指引你安装 Tailscale VPN 配置。

3. 使用[你的 SSO 身份提供方][docs-sso-providers]注册。

有关不同版本选项的更多信息，请参阅[在 macOS 上运行 Tailscale 的三种方式][docs-macos-variants]。

## MDM 部署

你可以使用[配置描述文件与用户默认设置][docs-macos-mdm]（configuration profiles and user defaults），以编程方式对 macOS 版 Tailscale 的设置进行个性化。这有助于你借助 MDM 之类的解决方案部署 Tailscale。

## 故障排除

有关常见的 macOS 问题及解决建议，请参阅[故障排除指南][docs-troubleshooting-apple]。

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-sso-providers]: /docs/integrations/identity

[docs-troubleshooting-apple]: /docs/reference/troubleshooting/apple

[pk-stable-macos]: https://pkgs.tailscale.com/stable/#macos

[xt-apple-tailscale-macos]: https://apps.apple.com/app/tailscale/id1475387142

[xt-gh-tailscale-macos]: https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS
