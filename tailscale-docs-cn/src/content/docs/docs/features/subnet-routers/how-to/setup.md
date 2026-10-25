---
title: "配置子网路由器"
description: "要把 tailnet 设备用作子网路由器，请选择你的平台并完成相应步骤。"
---

最后验证于 Jan 5, 2026

> **注意：**
>
> 本主题是在 tailnet 中配置子网路由器的快速指南。更多详细信息请参阅[子网路由器][docs-subnets]。

要把 tailnet 设备用作子网路由器，请选择你的平台并完成相应步骤。

#### Linux

1. [下载并安装][docs-install-linux] Tailscale 客户端。

2. 在设备上打开一个终端会话，并启用 IP 地址转发。

   \[Missing snippet: EnableIPForwarding.mdx]

3. 在终端会话中为该设备通告子网路由。请把下例中的子网替换为你网络的子网。

   ```shell
   sudo tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
   ```

4. 前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Subnets** 徽章。

5. 选择该菜单，然后选择 **Edit subnet routes**。

6. 勾选与你要通告的子网路由对应的 IP 范围复选框，然后选择 **Save**。

#### macOS

1. [下载并安装][docs-install-macos] Tailscale 客户端。

2. 打开一个终端会话，为该设备通告子网路由。请把下例中的子网替换为你网络的子网。

   ```shell
   sudo tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
   ```

3. 前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Subnets** 徽章。

4. 选择该菜单，然后选择 **Edit subnet routes**。

5. 勾选与你要通告的子网路由对应的 IP 范围复选框，然后选择 **Save**。

#### Windows

1. [下载并安装][docs-install-windows] Tailscale 客户端。

2. 在 PowerShell 会话中为该设备通告子网路由。请把下例中的子网替换为你网络的子网。

   ```powershell
   tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
   ```

3. 前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Subnets** 徽章。

4. 选择该菜单，然后选择 **Edit subnet routes**。

5. 勾选与你要通告的子网路由对应的 IP 范围复选框，然后选择 **Save**。

#### tvOS

1. [下载并安装][docs-install-appletv] Tailscale 客户端。
2. 在 Apple TV 上打开 Tailscale 应用，选择 **Subnet Router**。
3. 选择 **Advertise New Route**。会显示一个 `198.51.100.0/24` 的占位 IP 地址与子网掩码组合（CIDR）。编辑这一条目，改成你自己的 IP 地址与子网掩码。
4. 前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Subnets** 徽章。
5. 选择该菜单，然后选择 **Edit subnet routes**。
6. 勾选与你要通告的子网路由对应的 IP 范围复选框，然后选择 **Save**。

#### Android

> **警告：**
>
> 在手机上运行子网路由器会显著影响电池续航。该功能主要面向 Android TV 设备，或预期持续接通交流电源的 Android 设备。

1. [下载并安装][docs-install-android] Tailscale 客户端。

2. 打开 Tailscale 应用并选择头像菜单。

3. 在 **Settings** 中选择 **Subnet routing**，然后选择 **Add route**。

4. 输入你网络的 IP 地址与子网掩码组合（CIDR），例如 `192.168.1.0/24`。

5. 选择 **OK**。

6. 在应用的 **Exit Node** 部分，按需设置 **Allow LAN access** 开关。

   * Android 仅作为子网路由器、不作为出口节点时，把开关设为关闭。
   * Android 同时作为子网路由器和出口节点时，把开关设为开启。

7. 前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Subnets** 徽章。

8. 选择该菜单，然后选择 **Edit subnet routes**。

9. 勾选与你要通告的子网路由对应的 IP 范围复选框，然后选择 **Save**。

有关使用 Tailscale 配置子网路由器的更多信息，请参阅[子网路由器][docs-subnets]。

[docs-install-android]: /docs/install/android

[docs-install-appletv]: /docs/install/appletv#在-tvos-上安装-tailscale

[docs-install-linux]: /docs/install/linux

[docs-install-macos]: /docs/install/mac

[docs-install-windows]: /docs/install/windows

[docs-subnets]: /docs/features/subnet-routers
