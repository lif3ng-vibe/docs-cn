---
title: "在 macOS 上授权 Tailscale 系统扩展"
description: "在 macOS 上授权 Tailscale 系统扩展。"
---

最后验证于 Jan 5, 2026

在 Mac 上首次启动 Tailscale 时，你可能会看到以下一个或多个警告。

* *（图：macOS 中的"System Extension Blocked"警告，有两个按钮"OK"和"Open System Settings"。）*
* *（图：Tailscale 应用中的"System Extension Approval Required"警告，有两个按钮"Ignore"和"Open Settings"。）*
* *（图：Tailscale 菜单中的"System Extension Approval Required..."警告，带有一个三角形感叹号图标。）*

以上消息表明 Tailscale 已成功启动。但在 Tailscale 将你的 Mac 连入网络之前，需要先授权安装 Tailscale 系统扩展。

系统扩展是 macOS 的一项技术，Tailscale 用它来扩展你 Mac 的网络功能。有关系统扩展的更多信息，请参阅[下文][ar-what-is-a-system-extension]。

## 配置步骤

授权安装 Tailscale 扩展的步骤因你使用的 macOS 版本而异。

### macOS Sequoia 15 及更高版本

1. 前往 **System Settings**（系统设置）并打开 **General**（通用）标签页。
2. 在 **Login Items & Extensions**（登录项与扩展）部分，向下滚动到 **Network Extensions**（网络扩展），选择信息 ⓘ 图标。
3. 将 **Tailscale Network Extension** 切换为开启，然后使用 Touch ID 或输入管理员密码授权该操作。
4. 选择 **Done**（完成）。如果出现要求安装 VPN 配置的窗口，请选择 **Allow**（允许）。

Tailscale 将开始连接。如果你以前从未登录过 Tailscale，需要使用屏幕右上角的 Tailscale 菜单栏项进行登录。

### macOS Sonoma 14 及更早版本

1. 前往 **System Settings**（系统设置）并打开 **Privacy & Security**（隐私与安全性）标签页。
2. 向下滚动选项列表，直到看到消息 **System software from application "Tailscale.app" was blocked from loading.**，然后选择 **Allow**（允许）。
3. 使用 Touch ID 或输入管理员密码授权该操作。如果出现要求安装 VPN 配置的窗口，请选择 **Allow**（允许）。

Tailscale 将开始连接。如果你以前从未登录过 Tailscale，需要使用屏幕右上角的 Tailscale 菜单栏项进行登录。

## 使用 CLI 管理

你可以使用 CLI 命令 [`tailscale configure sysext`][docs-cli-configure] 管理设备的系统扩展。

## 什么是系统扩展？

你可能好奇为什么需要这么做。在幕后，macOS 版 Tailscale 的 Standalone 变体使用了一项随 macOS Catalina 10.15 引入的技术，名为[系统扩展][xt-apple-docs-system-extensions]（System Extensions）。

系统扩展是旧式内核扩展（Kernel Extensions）技术的更安全替代品，后者被 macOS 早期版本中的许多安全与网络工具使用。系统扩展在沙箱中运行，这意味着 Tailscale 与你 Mac 的操作系统内核隔离运行，可以提供额外的安全保证。此外，系统扩展可以在 Mac App Store 之外分发，这让我们能够提供不依赖 Apple 分发渠道的 Tailscale 变体。

由于系统扩展由你 Mac 上的所有用户共享，安装前需要获得明确同意。

## 为你的用户自动化此流程

如果你是管理大量 Mac 的系统管理员，可以使用移动设备管理（MDM）解决方案自动预批准 Tailscale 系统扩展。详情请参阅 [MDM 文档][docs-macos-mdm-approve-system-extension]。

[ar-what-is-a-system-extension]: #什么是系统扩展

[docs-cli-configure]: /docs/reference/tailscale-cli#configure

[docs-macos-mdm-approve-system-extension]: /docs/integrations/mdm/mac#approve-the-tailscale-system-extension-automatically

[xt-apple-docs-system-extensions]: https://support.apple.com/HT210999
