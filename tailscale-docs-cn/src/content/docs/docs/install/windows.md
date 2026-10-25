---
title: "在 Windows 上安装 Tailscale"
description: "在 Windows 上安装 Tailscale 客户端。"
---

最后验证于 Nov 21, 2025

> **注意：**
>
> 当前可供[下载](https://tailscale.com/download/windows)的 Tailscale 客户端要求 Windows 10 或更高版本，或 Windows Server 2016 或更高版本。

本主题介绍如何使用 Tailscale `.exe` 安装程序进行安装。如果你想使用 Tailscale `.msi` 安装程序，请参阅[用 MSI 在 Windows 上安装 Tailscale][docs-install-windows-msi]。

1. [下载][co-download-windows]最新的 `.exe` 安装程序。同一个 `.exe` 安装程序可同时用于 32 位和 64 位 Windows；它会自动为你的系统安装正确的版本。

2. 运行安装程序。安装完成后，系统托盘中会出现一个新的 Tailscale 图标。如果看不到它，请选择向上箭头，在系统托盘溢出区域中找到它。

   *（图：从 Windows 系统托盘打开的 Tailscale 应用菜单）*

3. 右键单击 Tailscale 图标，查看配置选项和状态消息。

4. 在你的账户下方，选择**登录**（Log in）以打开浏览器窗口，并使用[你的 SSO 身份提供方][docs-sso-providers]进行认证。

## MDM 部署

你可以使用 [Windows 注册表值][docs-windows-mdm]为 Windows 版 Tailscale 应用系统策略。策略通常通过 MDM 分发。

## 故障排除

有关常见 Windows 问题及解决建议的更多信息，请参阅我们的[故障排除指南][docs-troubleshooting-windows]。

[co-download-windows]: https://tailscale.com/download/windows

[docs-install-windows-msi]: /docs/install/windows/msi

[docs-sso-providers]: /docs/integrations/identity

[docs-troubleshooting-windows]: /docs/reference/troubleshooting/windows

[docs-windows-mdm]: /docs/integrations/mdm/windows-mdm
