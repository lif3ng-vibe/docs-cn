---
title: "在 macOS 上运行 Tailscale 的三种方式"
description: "探索在 macOS 上运行 Tailscale 的三种方式，选择最适合你情况的方案。"
---

最后验证于 Jan 5, 2026

> **注意：**
>
> 当前版本的 Tailscale 客户端要求 macOS Monterey 12.0 或更高版本。

在 macOS 上安装 Tailscale 的最佳方式，是从我们的包服务器下载并安装我们的应用。

[下载 Tailscale](https://pkgs.tailscale.com/stable/Tailscale-latest-macos.pkg)

不过，在 macOS 上运行 Tailscale 共有三种方式（变体）。你可以选择最符合自己需求的方式。

* 直接从 [Tailscale 的包服务器][pk-stable-macos]下载并安装 Standalone 变体的应用（推荐）。
* 从 [Mac App Store][xt-app-store-link] 安装 Tailscale。
* 从我们的 [GitHub 仓库][xt-gh-tailscale-tailscaled-macos]下载并安装开源的纯 CLI 发行版 `tailscale` + `tailscaled`。

这三种变体在将 macOS 设备接入 Tailscale 这一核心功能上完全一致，但在打包方式以及与 macOS 的交互方式上存在细微差异。你应选择最符合自己使用场景的变体。

我们推荐直接从我们的包服务器下载并安装 Standalone 变体的 Tailscale 应用：这个变体功能更多，不受 App Store 对上架应用的种种限制，并且对更新部署有更强的掌控力。

> **注意：**
>
> 下面的相关视频提供了更多背景和示例。

[Tailscale macOS 快速开始（视频）](https://www.youtube.com/watch?v=vkZwu7I4tcY)

## 有哪些区别？

### Standalone 变体

在 macOS 上，我们始终推荐安装 [Standalone 变体][pk-stable-macos]的 Tailscale 应用。

在 macOS Catalina 10.15 中，Apple 为实现 VPN 增加了对[系统扩展][xt-apple-system-extensions]（System Extensions）方式的支持。系统扩展是旧式内核扩展（Kernel Extensions）技术的更安全替代品，后者曾被较旧 macOS 版本上的许多安全与网络工具使用。这些扩展以 root 权限运行，但始终处于沙箱之内，确保 Tailscale 与 macOS 内核隔离运行。系统扩展的一大优势是可以在 Mac App Store 之外分发，这让我们能够提供安装时无需 Apple ID 的 Tailscale 版本——打开我们的 `.pkg` 安装器即可开始使用 Tailscale。

使用 Standalone 变体，安全更新可以及时发布，无需经过 Apple 的 App Store 审核流程。此外，Tailscale 能够检测干扰 VPN 隧道的第三方工具，并在发现冲突时通知你。

### Mac App Store 变体

要在 Mac App Store 上架，Apple 要求应用运行在 [macOS App Sandbox][xt-apple-macos-sandbox]中，与应用所在系统的其余部分隔离。在沙箱中运行时，VPN 应用必须实现为[网络扩展][xt-apple-network-extensions]（Network Extension）才能提供 VPN 或类似 VPN 的功能。而网络扩展系统对在 Mac App Store 之外分发的应用不起作用。

通过 Mac App Store 安装 Tailscale 的主要优势是上手非常简单。然而，由于 Tailscale 应用及其网络扩展都被沙箱化并以本地用户身份运行，存在诸多限制。例如，一个很常见的问题是屏幕使用时间的网页过滤器可能与 App Store 分发的 Tailscale 版本冲突。

### 开源 `tailscaled` 变体

可以在 macOS 上运行[开源的 Tailscale 代码（tailscaled）][xt-gh-tailscale-tailscaled-macos]。它使用内核的 [`utun` 接口][xt-wikipedia-tuntap]，而非网络扩展或系统扩展框架。但这个变体不带图形用户界面（GUI），所有功能都必须通过命令行管理。此外，使用开源 `tailscaled` 变体时，你将无法从 macOS 的 VPN 设置中管理 Tailscale。

macOS 上的 `tailscaled` 仅推荐由经验丰富的 macOS 系统管理员管理的无人值守安装使用。

## 我该选哪个？

请始终从下载并安装我们的 [Standalone 变体 macOS 应用][pk-stable-macos]开始。只有在无法安装 Standalone 变体，或者你的部署环境必须依赖 Mac App Store 进行安装和更新时，才从 Mac App Store 安装 Tailscale。

> **注意：**
>
> 不要在同一台机器上同时安装 Mac App Store 变体和 Standalone 变体。两个变体同时运行可能导致 Tailscale 扩展无法启动。要在 macOS 变体之间安全切换，请先删除当前安装的 `Tailscale.app`、清空废纸篓并重启 Mac，然后再尝试安装另一种变体。

### 对比表

下表列出了三种变体在功能上的主要差异：

App StoreNetwork Extension
StandaloneSystem Extension
tailscaledutun interface

可用性
是
是
是

GUI
是
是
否

CLI
是
是
是

最低 macOS 版本
macOS Monterey 12.0
macOS Monterey 12.0
macOS Monterey 12.0

需要 Apple ID
是
否
否

登录前运行
否；受沙箱限制
否
是

使用的钥匙串
用户
无；磁盘上的文件
无；磁盘上的文件

沙箱化
是
仅系统扩展
否

自动更新
是；由 App Store 管理
是；应用内管理（Sparkle）
否

开源
否
否
是

MagicDNS
是
是
是

Taildrop
是
是
不完整

Funnel
否
否
是

出口节点
是
是
部分；可通告为出口节点但无法使用它们

MDM 支持
是
是
否

可充当 Tailscale SSH 服务器
否
否
是

可充当 Tailscale SSH 客户端
是
是
是

支持 `tailscale ssh` CLI 命令
否，必须使用常规 `ssh` 命令
是
是

支持 services collection
否
是
是

与屏幕使用时间网页过滤器兼容
否
是
是

可生成供支持团队使用的配置报告
有限
是
否

## 自动化 App Store 安装

要自动化安装 Mac App Store 版 Tailscale，可以使用 [`mas-cli` 工具][xt-gh-mas-cli]运行：

```shell
mas install 1475387142
```

## 故障排除

要查看常见的 macOS 问题及解决建议，请参阅[故障排除指南][docs-troubleshooting-apple]。

[docs-troubleshooting-apple]: /docs/reference/troubleshooting/apple

[pk-stable-macos]: https://pkgs.tailscale.com/stable/#macos

[xt-app-store-link]: https://apps.apple.com/app/tailscale/id1475387142

[xt-apple-macos-sandbox]: https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/AboutAppSandbox/AboutAppSandbox.html

[xt-apple-network-extensions]: https://developer.apple.com/documentation/networkextension

[xt-apple-system-extensions]: https://developer.apple.com/system-extensions

[xt-gh-mas-cli]: https://github.com/mas-cli/mas

[xt-gh-tailscale-tailscaled-macos]: https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS

[xt-wikipedia-tuntap]: https://en.wikipedia.org/wiki/TUN/TAP
