---
title: "调试菜单与选项"
description: "启用 Tailscale 客户端菜单的调试模式，帮助排查问题。"
---

最后验证于 Mar 23, 2026

macOS 和 Windows 版 Tailscale 客户端的菜单包含调试模式，提供用于监控和排查问题的高级设置。

#### macOS

在 macOS 上，按住 Option 键并点击菜单栏中的 Tailscale 图标即可访问调试选项。可用选项包括：

* 已发送和已接收的流量信息。
* 设备密钥过期信息。
* **Debug** 菜单提供以下选项：
  * **Bug report**：[生成 bug 报告 ID 和配置报告][docs-bug-report]，你可以将其发送给我们，帮助我们更高效地协助你排查问题。
  * **Reauthenticate**：将用户从 tailnet 注销，要求其从 Tailscale [Login](https://login.tailscale.com/login) 页面重新认证。
  * **Reset All Settings**：将客户端设置恢复为默认值，同时保持用户登录状态。
  * **Show Onboarding**：显示用户首次安装客户端时通常会看到的引导界面。
  * **Flush DNS Cache**：清除 macOS DNS 缓存。这需要管理员凭证。
  * **Add Account**：显示一个对话框，用于将客户端添加到自定义协调服务器。
  * **System Extension**：显示 Tailscale 系统扩展的健康状态。你也可以使用 [`tailscale configure sysext status`][docs-cli-configure] CLI 命令。
  * **Reset**：删除并重新安装 macOS VPN 配置。如果重启 Mac 后 Tailscale 仍然无法启动，使用该选项可能会有帮助。如果你的组织正通过 MDM 方案在 Mac 上部署 VPN 配置描述文件，该选项将不可用。
* **Quit (Leave VPN Active)**：退出 Tailscale 图形界面应用，但让 VPN 网络扩展在后台继续运行。使用该选项后，你可以随后在 macOS 系统设置应用中单独开关该网络扩展。

#### Windows

在 Windows 上，按住 `CTRL` 并点击系统托盘中的 Tailscale 图标即可访问调试选项。可用选项包括：

* 客户端为该 tailnet 所连接的控制平面服务器的 URL。
* **Debug report**：[生成 bug 报告 ID][docs-bug-report]，你可以将其发送给我们，帮助我们更高效地协助你排查问题。
* **Use Notepad for URLs**：控制当 Tailscale [控制平面][docs-control-data-planes]发来一个需要用户访问才能完成认证的 URL 时客户端的行为。默认（未勾选）情况下，客户端会在默认浏览器中打开登录 URL。勾选后，客户端改为在记事本中显示登录 URL 和 ASCII 二维码，而不是在默认浏览器中打开。
* **Start Onboarding Test**：显示用户首次安装客户端时通常会看到的引导界面。

> **提示：**
>
> 如果你使用 [Group Policy][xt-microsoft-group-policy] 或 [MDM 方案][docs-mdm]管理你的设备群，可以[控制 Debug 菜单的可见性][docs-mdm-keys-debug]。

[docs-bug-report]: /docs/account/bug-report

[docs-cli-configure]: /docs/reference/tailscale-cli#configure

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-mdm-keys-debug]: /docs/features/tailscale-system-policies#hide-the-debug-menu

[docs-mdm]: /docs/mdm

[xt-microsoft-group-policy]: https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-overview
