---
title: "使用 Tailscale 私有访问 Azure Windows 虚拟机"
description: "Microsoft Azure 是一家云服务提供商，提供 Linux 和 Windows 虚拟机，可以使用 Tailscale 为其提供安全连接。本主题介绍在 Azure 中运行的 Windows 虚拟机。"
---

最后验证于 Jan 5, 2026

Microsoft Azure 是一家云服务提供商，提供 Linux 和 Windows 虚拟机，可以使用 Tailscale 为其提供安全连接。本主题介绍在 Azure 中运行的 Windows 虚拟机。Linux 虚拟机请参阅[使用 Tailscale 私有访问 Azure Linux 虚拟机][docs-azure-linux]。

## 前提条件

在开始本指南之前，你需要先搭建并配置好一个 Tailscale 网络，且其中至少有一台现有设备。如果需要帮助，请阅读我们的[入门指南][docs-install]。

## 第 1 步：为 Windows 虚拟机设置 Tailscale 客户端

首先，[创建一台虚拟机][xt-azure-vms]，运行 Windows Datacenter Edition。

只要隧道至少有一端是"简单 NAT"（easy NAT），即 Tailscale 能够确定 NAT 设备另一侧的 UDP 端口号，它就会建立[直连以降低延迟][bl-how-tailscale-works]。为了让 Azure 节点能够建立直连，我们通过防火墙放行 UDP 端口 41641 的入站流量。

在创建虚拟机的**网络**（Networking）步骤中，将 NIC 网络安全组选为**高级**（Advanced），并创建一条网络安全策略，允许 UDP 端口 41641 入站。

*（图：网络安全组放行 41641 端口）*

在初始设置阶段，同时放行 RDP 和/或 SSH 会很有帮助。Tailscale 安装完成后，就可以移除公开访问，改由 Tailscale 提供访问。

然后通过 RDP 连入该系统，[下载最新的 Windows 安装程序][co-download-windows]。

可以按照[在 Windows 上安装 Tailscale][docs-install-windows]中的说明使用浏览器登录，因为 Windows Datacenter Edition 自带 GUI 和网页浏览器。

&#x20;不过，对于云虚拟机来说，这个方法通常不太好用，因为你很可能并没有从浏览器登录过。

另外，也可以使用 `cmd.exe` shell 运行 Tailscale CLI 命令并[使用认证密钥][docs-auth-keys]：`tailscale up --accept-dns=false --auth-key=tskey-0123456789abcdef`

> **注意：**
>
> 对 Azure 虚拟机来说，通常最好让 Azure 处理 DNS 配置，而不要让 Tailscale 覆盖它，所以我们加上了 `--accept-dns=false`。

## 第 2 步：从虚拟机宣告路由

为了方便 tailnet 中*其他*节点，我们将设置[拆分 DNS][docs-dns-using-settings]（split DNS），使其能够使用与 Azure 内部相同的 DNS 名称。[Azure DNS 服务器地址是 168.63.129.16][xt-azure-name-resolution]，这是一个任播（anycast）地址，会路由到 Azure 中最近的 DNS 服务器。

我们将使用 `cmd.exe` 让这台虚拟机宣告它所在子网以及 Azure DNS 服务器的路由。例如，如果子网地址范围为 10.1.0.0/24，命令就是：

```shell
tailscale set --advertise-routes=10.1.0.0/24,168.63.129.16/32 --accept-dns=false
```

## 第 3 步：为你的 tailnet 添加 Azure DNS

在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面中，我们添加一个限制在 `internal.cloudapp.net` 域的名称服务器，指向我们通过虚拟机开放的 Azure DNS 服务器。

*（图：为 internal.cloudapp.net 添加拆分 DNS 解析器）*

这样，在 Azure 内部节点之间有效的主机名，对我们 tailnet 上的所有节点也同样可用。

## 第 4 步：移除公开的 SSH 访问

既然现在已经可以通过私有 Tailscale 网络 SSH 到该系统，就没有理由继续在公有 IP 地址上开放 SSH 端口了。在**设置 > 网络**标签页中，选择 **SSH** 的入站规则并将其删除。

*（图：禁用公开的 SSH 端口）*

## 4via6 子网路由器

如果你的网络中存在 IPv4 地址重叠的子网，可以使用 [4via6 子网路由器][docs-4via6-subnets]功能，确保 tailnet 中每个节点的流量都被路由到正确的设备。

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[co-download-windows]: https://tailscale.com/download/windows

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-azure-linux]: /docs/install/cloud/azure/linux

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-设置

[docs-install-windows]: /docs/install/windows

[docs-install]: /docs/how-to/quickstart

[xt-azure-name-resolution]: https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-name-resolution-for-vms-and-role-instances#azure-provided-name-resolution

[xt-azure-vms]: https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Compute%2FVirtualMachines
