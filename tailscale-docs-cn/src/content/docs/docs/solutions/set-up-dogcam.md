---
title: "使用 Tailscale、Raspberry Pi 和 Motion 搭建宠物摄像头"
description: "搭建一个可以从任何地方安全访问的宠物摄像头。"
---

最后验证于 Jan 5, 2026

Tailscale 让搭建一个可以从任何地方安全访问的宠物摄像头变得非常简单。

与现成的宠物摄像头不同，使用 Tailscale 你无需信任第三方服务，也不必冒着把家里的摄像头暴露到公共互联网上的风险。Tailscale 上的每个连接都是加密的，并且完全私有于你的网络。

## 前提条件

开始本指南之前，你需要两样东西：

1. 一台带 Wi-Fi/以太网能力的 Raspberry Pi（例如 [Raspberry Pi 3 B+][xt-rpi-docs-configure]）
2. 一个 USB 摄像头（例如 [Logitech C615][xt-amazon-webcam-c615]）

本指南假设你的 Raspberry Pi 已[配置好网络连接][xt-rpi-wireless-cli]，无论 Wi-Fi 还是以太网。

你还需要[一个 Tailscale 账户](https://login.tailscale.com/start)。你不必为 Tailscale 付费——[Personal 套餐][co-pricing]就可以做到！

## 第 1 步：在 Raspberry Pi 上安装 Tailscale

通过 SSH 连接到 Raspberry Pi，用一条命令安装 Tailscale：

```shell
curl -fsSL https://tailscale.com/install.sh | sh
```

我们也提供了[针对 Raspberry Pi 的手动安装说明][co-download-linux-rpi]。

安装完成并在 Raspberry Pi 上运行 `tailscale up` 之后，继续下一步。

## 第 2 步：安装 motion

接下来，使用 apt 安装 [motion][xt-motion-project]：

```shell
sudo apt install motion
```

## 第 3 步：配置 motion

首先，让 motion 以后台服务方式运行。使用 `nano` 或你喜欢的编辑器编辑 `/etc/default/motion`：

```shell
sudo nano /etc/default/motion
```

把 `start_motion_daemon` 设置改为 "yes"：

```shell
start_motion_daemon=yes
```

保存并关闭文件。

接下来，配置 motion 暴露一个网页，并顺带修改几个视频采集设置。

用编辑器打开 `/etc/motion/motion.conf`：

```shell
sudo nano /etc/motion/motion.conf
```

搜索以下设置，把它们的值更新为下面列出的值。

*启用通过网页查看视频流。*如果你愿意，也可以把端口从默认值（8081）改成别的。

```shell
stream_port 8081
stream_localhost off
```

*禁止把图片或视频保存到 SD 卡。*既然这是宠物摄像头，我们只关心查看实时画面。

```shell
output_pictures off
ffmpeg_output_movies off
```

保存并关闭文件。

## 第 4 步：重启 motion

所有配置更新完毕后，重启 motion：

```shell
sudo service motion restart
```

## 第 5 步：访问你的宠物摄像头

现在，从 Tailscale 网络中的任何设备，都可以通过 `<raspberry pi tailscale ip>:8081` 访问摄像头的实时画面。[找到你的 Raspberry Pi 的 IP][docs-ip-and-dns-addresses]，把它输入浏览器即可。

*（图：在 macOS 上，你可以点选设备名来复制 IP 地址。）*

在 macOS 上，你可以点选设备名来复制 IP 地址。

摄像头的画面大致如下。

*（图：Theo 和 Casey 正盯着某个东西看——那绝对不是在后院跑来跑去的 Tailscale 员工。）*

Theo 和 Casey 正盯着某个东西看——那绝对不是在后院跑来跑去的 Tailscale 员工。

你现在拥有一个用 Tailscale 保护起来的宠物摄像头了。只有你的个人 Tailscale 网络上的设备才能访问它，其他任何人都不能。

> **注意：**
>
> 你的浏览器可能会显示"不安全"警告，因为连接没有走 HTTPS。Tailscale 在更底层保护了你的连接，所以尽管放心——你与 100.x.y.z IP 地址上任何网站的连接都是安全的。

## 后续步骤

在你的 [Android][co-download-android] 或 [iOS][co-download-ios] 设备上安装 Tailscale，无论身在何处都能看看你的狗（或其他宠物）。

你还可以尝试其他设置，例如 `width`、`height` 或 `framerate`。如果做了其他改动，记得随后用 `sudo service motion restart` 重启 motion。

[co-download-android]: https://tailscale.com/download/android

[co-download-ios]: https://tailscale.com/download/ios

[co-download-linux-rpi]: https://tailscale.com/download/linux/rpi

[co-pricing]: https://tailscale.com/pricing

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[xt-amazon-webcam-c615]: https://www.amazon.com/dp/B0058LKJIO

[xt-motion-project]: https://motion-project.github.io

[xt-rpi-docs-configure]: https://www.raspberrypi.com/products/

[xt-rpi-wireless-cli]: https://www.raspberrypi.com/documentation/computers/configuration.html#networking
