---
title: "远程访问无法运行 Tailscale 的设备"
description: "许多家庭网络设备——包括 IP 摄像头、智能家居中枢、打印机和网络交换机——无法直接运行 Tailscale。子网路由让任何装有 Tailscale 的设备充当网关"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**子网路由器**](/docs/features/subnet-routers)——使用子网路由器让本地网络之外的设备访问特定子网内的服务，用 Tailscale 扩展你的私有网络。

许多家庭网络设备——包括 IP 摄像头、智能家居中枢、打印机和网络交换机——无法直接运行 Tailscale。子网路由让任何装有 Tailscale 的设备充当其本地网络的网关，让你远程访问该子网上的一切，而无需在每台设备上单独安装任何东西。

## 设置子网路由器

子网路由器是本地网络中任何一台运行 Tailscale 并向你的 Tailscale 网络（即 tailnet）宣告本地子网的设备。在该设备上安装 Tailscale 客户端即可将其接入你的 tailnet。就位之后，tailnet 中的任何设备都能访问该子网上的每一个 IP 地址。如果你还没有 tailnet，认证时会自动创建一个。

#### Linux

1. 安装 Tailscale 客户端：

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. 启用 IP 转发：

   ```bash
   echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
   ```

3. 完成认证并宣告你的本地子网。把 `192.168.1.0/24` 替换为你的实际子网：

   ```bash
   sudo tailscale up --advertise-routes=192.168.1.0/24
   ```

#### Windows

1. [下载并安装 Tailscale 客户端][docs-install-windows]，然后用你的身份提供方（IdP）登录。

2. 以管理员身份打开 PowerShell 提示符，宣告你的本地子网。把 `192.168.1.0/24` 替换为你的实际子网：

   ```powershell
   tailscale up --advertise-routes=192.168.1.0/24
   ```

#### macOS

1. [下载并安装 Tailscale 客户端][docs-install-macos]，然后登录。

2. 启用 IP 转发：

   ```bash
   sudo sysctl -w net.inet.ip.forwarding=1
   ```

3. 宣告你的本地子网。把 `192.168.1.0/24` 替换为你的实际子网：

   ```bash
   sudo tailscale up --advertise-routes=192.168.1.0/24
   ```

#### Apple TV

1. 在 Apple TV 上从 App Store 安装 [Tailscale][docs-install-appletv] 并登录。

2. 打开 Tailscale 应用，前往**设置**（Settings），启用**子网路由器**（Subnet router）。

3. 输入你的本地子网（例如 `192.168.1.0/24`）并保存。

## 批准子网路由

在其他 tailnet 设备能够使用宣告的路由之前，必须先在管理控制台批准这些路由。

1. 打开管理控制台的[机器](https://console.tailscale.com/admin/machines)页面。
2. 找到子网路由器机器，选择相应按钮，然后选择**设置子网路由器**。
3. 启用你想批准的路由，然后选择**保存**。

## 访问你的设备

你用来连接的设备需要[安装 Tailscale 客户端][docs-install]，并登录到与子网路由器相同的 tailnet。此后，你就可以通过本地 IP 地址访问宣告子网上的任何设备，目标设备无需安装 Tailscale。例如，用 `http://192.168.1.50` 访问摄像头，用 `192.168.1.100` 访问打印机。

在 Linux 上，连接时需运行 `sudo tailscale up --accept-routes`。在 Windows、macOS 和 Apple TV 上，路由一旦获得批准就会被自动接受。

## 延伸探索

* 阅读[子网路由器][docs-subnet-routers]文档，获取关于宣告路由、路由批准和高级配置的完整参考。
* 启用 [MagicDNS][docs-magicdns]，为 tailnet 设备使用友好主机名。你还可以为特定子网设备添加 [DNS 记录][docs-dns]，让它们拥有可从你的 tailnet 访问的名称。
* 使用 [tailnet 策略文件][docs-policy-file]限制哪些 tailnet 设备可以访问宣告的子网。
* 使用[出口节点][docs-exit-node]，把设备的所有互联网流量经由你的家庭网络路由。
* 试试 [Taildrop][docs-taildrop]，在任意 tailnet 设备之间以点对点方式发送文件。

[docs-dns]: /docs/features/tailnet-policy-file/extra-dns-records

[docs-exit-node]: /docs/features/exit-nodes

[docs-install]: /docs/install

[docs-install-appletv]: /docs/install/appletv

[docs-install-macos]: /docs/install/mac

[docs-install-windows]: /docs/install/windows

[docs-magicdns]: /docs/features/magicdns

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-taildrop]: /docs/features/taildrop
