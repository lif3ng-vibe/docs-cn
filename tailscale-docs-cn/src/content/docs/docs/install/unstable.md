---
title: "安装 Tailscale 不稳定版客户端"
description: "了解如何在面向更广泛社区发布之前测试新功能。"
---

最后验证于 Jan 7, 2025

在向更广泛社区发布更新之前，Tailscale 会先在不稳定版客户端中测试新功能和修复。如果你愿意帮助测试新功能，可以从以下链接下载并安装不稳定版客户端。

功能可能处于不同的[发布阶段][docs-release-stages]。测试 Beta 功能不一定需要不稳定版客户端。

> **注意：**
>
> 建议仅出于测试目的安装不稳定版构建。虽然我们尽力保持这些构建的可靠性，但它们属于实验性质，且部分构建未经分发签名。

## Linux

要在 Linux 上安装 Tailscale 客户端的不稳定版构建，可使用以下任一方法。

#### 软件包站点

1. 前往 Tailscale Packages 站点的 [unstable][pk-unstable] 页面。
2. 下载适用于你的发行版的构建。
3. 按照你所用发行版的说明安装该不稳定版构建。

#### Tailscale CLI

1. 打开终端会话。
2. 使用 Tailscale CLI 命令 [`tailscale update`][docs-cli-update] 加上 `--track` 标志，把发布通道设置为 `unstable`。

   ```shell
   tailscale update --track=unstable
   ```

## Windows

要在 Windows 上安装 Tailscale 客户端的不稳定版构建，可使用以下任一方法。

#### 软件包站点

1. 前往 Tailscale Packages 站点的 [unstable][pk-unstable-windows] 页面的 Windows 部分。
2. 下载适用于你系统版本的 Windows 版本。
3. 安装该构建。

#### Tailscale CLI

1. 打开命令行会话。
2. 使用 Tailscale CLI 命令 [`tailscale update`][docs-cli-update] 加上 `--track` 标志，把发布通道设置为 `unstable`。

   ```shell
   tailscale update --track=unstable
   ```

## macOS

要在 macOS 上安装 Tailscale 客户端的不稳定版构建，可使用以下任一方法。

#### 软件包站点

1. 前往 Tailscale Packages 站点的 [unstable][pk-unstable-macos] 页面的 macOS 部分。
2. 下载 `.zip` 或 `.pkg` 版本的 macOS 构建。
3. 安装该构建。

#### Tailscale CLI

1. 打开终端会话。
2. 使用 Tailscale CLI 命令 [`tailscale update`][docs-cli-update] 加上 `--track` 标志，把发布通道设置为 `unstable`。

   ```shell
   tailscale update --track=unstable
   ```

#### App Store

[加入我们的 TestFlight 不稳定通道][xt-apple-testflight-tailscale-beta]。TestFlight 要求 macOS Monterey 12 或更高版本。

要停止测试不稳定版本：

1. 打开 TestFlight 应用。
2. 选择 **Tailscale**。
3. 滚动到底部，然后选择**停止测试**（Stop Testing）。

## iOS

要在 iOS 上安装 Tailscale 客户端的不稳定版构建，请加入我们的 [TestFlight 不稳定通道][xt-apple-testflight-tailscale-beta-2]。

要停止测试不稳定版本：

1. 打开 TestFlight 应用。
2. 选择 **Tailscale**。
3. 滚动到底部，然后选择**停止测试**（Stop Testing）。

## Android

要在 Android 上安装 Tailscale 客户端的不稳定版构建，请加入我们的 [Play Store 不稳定通道][xt-google-play-tailscale-test]。

## tvOS

要在 Apple TV 的 tvOS 上安装 Tailscale 客户端的不稳定版构建，请加入我们的 [TestFlight 不稳定通道][xt-apple-testflight-tailscale-beta-2]。这要求 tvOS 17 或更高版本。

要停止测试不稳定版本：

1. 打开 TestFlight 应用。
2. 选择 **Tailscale**。
3. 选择菜单图标，然后选择**停止测试**（Stop Testing）。

[docs-cli-update]: /docs/reference/tailscale-cli#update

[docs-release-stages]: /docs/reference/tailscale-release-stages

[pk-unstable-macos]: https://pkgs.tailscale.com/unstable/#macos

[pk-unstable-windows]: https://pkgs.tailscale.com/unstable/#windows

[pk-unstable]: https://pkgs.tailscale.com/unstable

[xt-apple-testflight-tailscale-beta-2]: https://testflight.apple.com/join/tLcYLZJV

[xt-apple-testflight-tailscale-beta]: https://testflight.apple.com/join/7ExrFq00

[xt-google-play-tailscale-test]: https://play.google.com/apps/testing/com.tailscale.ipn
