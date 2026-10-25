---
title: "随时随地访问 TrueNAS SCALE"
description: "在 TrueNAS SCALE 服务器上配置 Tailscale 客户端，并安全地连接多台 TrueNAS SCALE 服务器以进行 ZFS 复制。"
---

最后验证于 Sep 19, 2025

[TrueNAS SCALE][xt-truenas-scale] 是由 [iX Systems][xt-ix-systems] 维护的基于 Linux 的网络附加存储（NAS）操作系统。它提供 OpenZFS 存储技术，支持用户运行自托管应用、执行异地远程备份以及管理虚拟机。你可以把 TrueNAS SCALE 服务器接入 Tailscale 网络（即 tailnet），并安全地配置多台 TrueNAS SCALE 服务器进行 ZFS 复制。

> **注意：**
>
> TrueNAS 有两种产品形态。TrueNAS SCALE 是 Linux 版本，也是我们推荐与 Tailscale 搭配使用的版本。TrueNAS SCALE 使用我们官方支持并维护的 [Tailscale Docker 镜像][xt-docker-tailscale]。
>
> TrueNAS Core 是 BSD 版本，不受官方支持。TrueNAS Core 所用的 FreeBSD 版 Tailscale 由社区维护，客户端可在 [FreshPorts][xt-freshports-tailscale] 获取。

## 环境要求

* 至少一台拥有管理权限的 TrueNAS SCALE 服务器。
* 一个已有且拥有管理员权限的 tailnet。操作说明请参阅 [Tailscale 快速开始][docs-install]。
* 若要在管理控制台执行某些操作，你必须是一个 tailnet 的[所有者、管理员或 IT 管理员](/docs/reference/user-roles)。

## 生成认证密钥

向 tailnet [添加新设备][docs-device-add]有多种方式。对于 TrueNAS SCALE 这类服务器，我们建议生成并使用[认证密钥（auth key）][docs-auth-keys]。在 Tailscale 设置过程中指定认证密钥，设备就会自动加入你的 tailnet。

生成认证密钥的步骤如下：

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面，选择 **Generate auth key**。
2. 在 **Description** 字段中输入 TrueNAS SCALE 服务器的名称。
3. （可选）如果你计划向 tailnet 添加多台 TrueNAS SCALE 服务器，并希望多台服务器共用同一个认证密钥，请打开 **Reusable** 开关。

## 安装并配置 Tailscale

1. 打开 TrueNAS SCALE，选择 **Apps** 选项卡。
2. 选择 **Check for available apps**，然后找到并安装 Tailscale 应用。

> **注意：**
>
> 如果这不是全新环境，**Check for available apps** 按钮可能不会出现。

1. 在 Tailscale 应用上选择 **Edit**。
2. 在 **Auth Key** 字段中填入你在上一节生成的认证密钥。
3. 在 **Hostname** 字段中输入该服务器在 tailnet 中的主机名。
4. 勾选 **Userspace** 复选框。
5. 选择 **Save**。

现在你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面确认 TrueNAS SCALE 服务器已连接到 tailnet，即能在 tailnet 中找到这台 TrueNAS SCALE 服务器。

## 让 tailnet 流量经由 TrueNAS 路由

你可以将 TrueNAS SCALE 配置为[出口节点][docs-exit-nodes]，让 tailnet 中其他设备的流量经由你的 TrueNAS SCALE 服务器路由。当你在咖啡馆使用不可信的 Wi-Fi，或在海外访问仅在祖国可用的在线服务（例如网上银行）时，这会非常有用。

1. 打开 TrueNAS SCALE。
   1. 选择 **Apps** 选项卡，打开 Tailscale 应用设置。
   2. 勾选 **Exit node** 复选框。
2. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
   1. 在列表中找到 TrueNAS SCALE 服务器，此时应显示 **Exit Node** 徽标。
   2. 选择  菜单，然后选择 **Edit exit node**。
   3. 勾选 **Use as exit node** 复选框，然后选择 **Save**。

要让其他设备使用 TrueNAS SCALE 服务器作为出口节点，请参阅[使用出口节点][docs-quick-exit-nodes-use]。

## 让非 tailnet 流量经由 TrueNAS 路由

如果无法在物理网络中的每台设备上都安装 Tailscale，你可以将 TrueNAS 配置为 tailnet 的[子网路由器][docs-subnets]。

1. 打开 TrueNAS SCALE。
   1. 选择 **Apps** 选项卡，打开 Tailscale 应用设置。
   2. 在 **Route** 字段中添加一个 CIDR IP 范围，指明哪个子网可以访问 tailnet，例如 `192.168.0.0/24`。你可以为多个子网添加多条路由。
2. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到 TrueNAS 服务器，此时应显示 **Subnets** 徽标。
   1. 选择  菜单，然后选择 **Edit subnet routes**。
   2. 勾选与你想通告的子网路由对应的 IP 范围复选框，然后选择 **Save**。

## 配置 TrueNAS ZFS 复制

配置 TrueNAS SCALE 设置以启用 ZFS 复制，从而通过 tailnet 在多台 TrueNAS SCALE 服务器之间备份文件。借助 Tailscale 的设备间直连，你无需开放端口，也无需让流量经由堡垒机或代理，即可复制到远程系统。

1. 打开 TrueNAS SCALE，前往 **Apps** 选项卡，找到已安装的 Tailscale 应用并选择 **Edit**。
   1. 取消勾选 **Userspace** 复选框，并勾选 **Host Network** 复选框。
   2. 选择 **Save**。
2. 前往 **Network** 选项卡，在 **Interfaces** 部分找到 `tailscale0`，确认重新绑定已完成，且两台 TrueNAS SCALE 服务器之间存在双向的 Tailscale 连接。
3. 前往 **System Settings** 选项卡，选择 **General**。
   1. 在 **GUI** 部分选择 **Settings**。
   2. 在 **Web Interface IPv4 Address** 字段中，确保 IP 地址为 `0.0.0.0`。
   3. 选择 **Save**。
4. 前往 **System Settings** 选项卡，选择 **Services**。
   1. 找到 **SSH**，选择 **Edit** 图标，然后选择 **Advanced Settings**。
   2. 在 **Bind Interfaces** 下拉框中选择 `tailscale0`。
   3. 选择 **Save**。
5. 前往 **Credentials** 选项卡，再进入 **Backup Credentials**。
   1. 在 **SSH Connections** 部分选择 **Add**。
   2. 在 **Name** 字段中输入一个名称，用于标识这条 SSH 连接。
   3. 在 **Host** 字段中输入 TrueNAS SCALE 服务器的 `100.x.y.z` tailnet 地址。该 IP 地址可以在 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中找到。
   4. 选择 **Save**。
6. 前往 **Data Protection** 选项卡，在 **Replication Tasks** 部分选择 **Add**。
   1. 在 **SSH Connections** 下拉框中，选择上一步添加的 SSH 名称。
   2. 在 **SSH Transfer Security** 部分，确保选中了 **Encryption**。
   3. 在同一窗口中，选择 **Advanced Replication Creation**。
   4. 在 **Transport** 下拉框中选择 `SSH+NETCAT`，以优化两台 TrueNAS SCALE 服务器之间的文件传输速度。
   5. 选择 **Save**。

特别感谢 [Lawrence Systems][xt-tom-web] 的 [Tom Lawrence][xt-tom-x] 为本主题提供的指导。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-add]: /docs/features/access-control/device-management/how-to/set-up

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-install]: /docs/how-to/quickstart

[docs-quick-exit-nodes-use]: /docs/features/exit-nodes/how-to/setup#use-an-exit-node

[docs-subnets]: /docs/features/subnet-routers

[xt-docker-tailscale]: https://hub.docker.com/r/tailscale/tailscale

[xt-freshports-tailscale]: https://www.freshports.org/security/tailscale

[xt-ix-systems]: https://www.ixsystems.com/

[xt-tom-web]: https://lawrencesystems.com/

[xt-tom-x]: https://x.com/tomlawrencetech

[xt-truenas-scale]: https://www.truenas.com/truenas-scale/
