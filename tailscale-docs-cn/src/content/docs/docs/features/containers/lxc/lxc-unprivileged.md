---
title: "LXC 容器中的 Tailscale"
description: "非特权 LXC 容器无权访问 Tailscale 正常运行所需的网络资源。本主题介绍如何为其授予访问权限。"
---

最后验证于 Jan 9, 2026

非特权 LXC 容器无权访问 Tailscale 正常运行所需的网络资源。本主题介绍如何为其授予访问权限。

除许多其他用途外，LXC 容器也常见于 Proxmox 虚拟化环境中。

> **注意：**
>
> 下面的相关视频提供了更多背景信息和示例。

[如何在 Proxmox 的 LXC 中安装 Tailscale。（视频）](https://www.youtube.com/watch?v=JC63OGSzTQI)

## 操作说明

LXC 是一种运行虚拟化 Linux 系统的轻量级方式。非特权 LXC 是指容器内的 root 用户（`uid 0`）被映射到宿主系统中的非特权用户，从而能以更安全的方式运行 LXC。

Tailscale 把数据帧封装在 UDP 数据包中，因此建立隧道连接不需要内核模块或其他特权操作。不过，它确实需要访问 `/dev/net/tun`（TUN）设备，而非特权容器通常不提供该设备。

要在非特权容器中启动 Tailscale，你可以通过用户界面启用对 `/dev/net/tun` 设备的访问：

1. 创建你的 LXC 容器。

2. 进入容器的 **资源**（Resources）标签页。

3. 选择 **添加**（Add），然后选择 **设备直通**（Device Passthrough）。

   *（图：用于启用设备直通的用户界面。）*

4. 在 **添加设备**（Add Device）提示框中，在 **设备路径**（Device Path）字段输入 `/dev/net/tun`，然后选择 **添加**（Add）。

   *（图：用于添加设备的用户界面。）*

5. 如果容器正在运行，请将其关闭后重新启动。

6. `/dev/net/tun` 可用后，就可以在 LXC 中运行的系统里安装 Tailscale Linux 软件包了。

或者，如果你不想授予 `/dev/net/tun` 访问权限，可以使用[用户态网络模式][docs-userspace-networking]，完全不需要任何管理员权限。

## 常见问题

### Proxmox 容器工具

为 LXC 容器添加 TUN 设备和额外权限的另一种方法是使用 [`pct set`][xt-proxmox-pct] 命令。

```shell
pct set CTID --dev0 /dev/net/tun
pct set CTID --features keyctl=1,nesting=1
```

### 为 Proxmox 7 提供访问权限

在没有用户界面支持的版本中，你可以在 LXC 的配置中启用对 `/dev/net/tun` 设备的访问。例如，使用 Proxmox 7.0 承载 ID 为 112 的非特权 LXC 时，需要将以下几行添加到 `/etc/pve/lxc/112.conf`：

```shell
lxc.cgroup2.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
```

如果 LXC 正在运行，需要将其关闭再重新启动，此更改才能生效。

### 为 Proxmox 6 及更早版本提供访问权限

使用 `cgroup` 环境（而不是 Proxmox 7 的 `cgroup2` 环境）：

```shell
lxc.cgroup.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
```

如果不想启用 `/dev/net/tun` 访问，请删除 `lxc.mount.entry:` 这一行。

### CentOS 7 和 Ubuntu 16.x 在 Proxmox 7.0 中仍然没有 /dev/net/tun

对于 systemd 过旧、无法识别 cgroup2 的容器，Proxmox 有一份[专门的指南][xt-proxmox-cgroup2-upgrade]。

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-proxmox-cgroup2-upgrade]: https://pve.proxmox.com/wiki/Upgrade_from_6.x_to_7.0#Old_Container_and_CGroupv2

[xt-proxmox-pct]: https://pve.proxmox.com/pve-docs/chapter-pct.html
