---
title: "管理客户端偏好设置"
description: "管理员可以管理网络上的设备，并通过访问控制策略限制哪些设备可以连接。"
---

最后验证于 Jan 5, 2026

[管理员][docs-user-roles]可以管理网络上的设备，并通过访问控制策略限制哪些设备可以连接。

个人用户仍然可以控制自己的设备：阻止来自 Tailscale 的入站连接，或忽略 Tailscale 的 DNS 设置和通告的路由。

## 默认配置

默认情况下，Tailscale 客户端会：

* 允许入站连接
* 使用 Tailscale DNS 设置

macOS、Windows 和其他非 Linux 设备默认使用 Tailscale 子网。Linux 设备默认不使用。

## 允许入站连接

如果访问控制策略允许 tailnet 中的其他设备连接到你的设备，连接就会被建立。访问控制策略是有方向性的：允许你的笔记本电脑连接到某台 Web 服务器的规则，并不会允许该 Web 服务器反过来连接你的笔记本电脑。

如果你想阻止所有入站连接，可以这样做。这也称为 "shields up"（竖起盾牌）。在设备的菜单栏中，取消勾选 **允许入站连接**（Allow incoming connections）。取消勾选后，你的设备仍然可见，也仍然可以*发送*流量，但不会*接受*任何通过 Tailscale 的连接，包括 ping。

### 切换入站连接设置

可以在客户端菜单栏或 CLI 中进行配置。

### 在客户端菜单栏中

#### macOS

如果你运行的是 Tailscale v1.60.0 或更高版本：从菜单栏选择 Tailscale，选择 **设置**（Settings），然后勾选/取消勾选 **允许入站连接**（Allow incoming connections）。

*（图：Tailscale 设置窗口，选中 "Settings" 标签页，"Allow incoming connections" 复选框已勾选。）*

如果你运行的是 v1.60.0 之前的 Tailscale 版本：从菜单栏选择 Tailscale，然后勾选/取消勾选 **允许入站连接**（Allow incoming connections）。

*（图：从 macOS 菜单栏打开的 Tailscale 应用菜单，"Allow incoming connections" 选项已勾选。）*

#### iOS

iOS 不支持阻止入站连接。

#### Android

Android 不支持阻止入站连接。

#### Windows

在系统托盘中右键单击 Tailscale 图标，然后勾选/取消勾选 **允许入站连接**（Allow incoming connections）。

*（图：从 Windows 系统托盘打开的 Tailscale 应用菜单，"Allow Incoming Connections" 已勾选。）*

#### Linux

Linux 只能通过 CLI 配置。

### 在 CLI 中

要阻止入站连接：

```shell
tailscale set --shields-up
```

要允许入站连接（默认）：

```shell
tailscale set --shields-up=false
```

## 使用 Tailscale DNS 设置

如果管理员已为你的 tailnet 配置了 [DNS 设置（包括 MagicDNS 或 split DNS）][docs-dns]，那么对 Tailscale 网络中设备的 DNS 查询将遵循这些设置。

> **注意：**
>
> 如果你正在使用[出口节点][docs-exit-nodes]，你的本地 DNS 就是该出口节点的 DNS，而不是你设备的 DNS。

可以在客户端菜单栏或 CLI 中进行配置。

### 在客户端菜单栏中

如果只想使用本地 DNS，请在设备的菜单栏中取消勾选 **使用 Tailscale DNS 设置**（Use Tailscale DNS settings）。

### 在 CLI 中

要使用 Tailscale DNS 设置（默认）：

```shell
tailscale set --accept-dns=true
```

要不使用 Tailscale DNS 设置：

```shell
tailscale set --accept-dns=false
```

## 使用 Tailscale 子网

如果管理员已为你的 tailnet 创建了[子网路由][docs-subnets]，Tailscale 会把你的设备发往已通告子网的流量路由到相应的子网路由器。

可以在客户端菜单栏或 CLI 中进行配置。

### 在客户端菜单栏中

如果想忽略已通告的路由，请在设备的菜单栏中取消勾选 **使用 Tailscale 子网**（Use Tailscale subnets）。

### 在 CLI 中

要使用 Tailscale 子网（默认，Linux 除外）：

```shell
tailscale set --accept-routes=true
```

要不使用 Tailscale 子网（Linux 上的默认值）：

```shell
tailscale set --accept-routes=false
```

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets]: /docs/features/subnet-routers

[docs-user-roles]: /docs/reference/user-roles
