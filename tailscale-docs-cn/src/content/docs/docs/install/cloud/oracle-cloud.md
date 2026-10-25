---
title: "使用 Tailscale 私有访问 Oracle Cloud 虚拟机"
description: "Oracle Cloud 提供 Linux 虚拟机，尤其以 ARM CPU 架构见长。我们可以使用 Tailscale 安全地访问 Oracle 虚拟机。"
---

最后验证于 Jan 5, 2026

Oracle Cloud 提供 Linux 虚拟机，尤其以 ARM CPU 架构见长。
我们可以使用 Tailscale 安全地访问 Oracle 虚拟机。

## 前提条件

开始本指南之前，你需要先搭建并配置好一个 Tailscale 网络（即 tailnet），其中至少已有一台设备。如果需要帮助，请阅读我们的[快速开始指南][docs-install]。

## 步骤 1：为虚拟机设置 Tailscale 客户端

首先，[在 OCN 控制台中创建一台虚拟机][xt-oracle-instances-create]。

然后通过 SSH 连入系统，按照步骤[在 Oracle Linux 上安装 Tailscale][docs-install-linux]。

## 步骤 2：放行 UDP 端口 41641

只要隧道的任意一端具有"简单 NAT"（easy NAT）——即 Tailscale 能确定 NAT 设备远端的 UDP 端口号——它就会建立[直连以最小化延迟][bl-how-tailscale-works]。我们在防火墙上放行 UDP 端口 41641 的入站流量，以确保 OCN 节点能够建立直连。

在 [Networking（网络）选项卡][xt-oracle-vcns]中选择**虚拟云网络**（Virtual Cloud Networks），再选择创建该虚拟机时所在的 VCN。

*（图：Virtual Cloud Networks 列表）*

在左侧栏中选择**安全列表**（Security Lists），然后选择正在使用的安全列表（通常是 Default，即默认列表）。

*（图：安全列表）*

为 0.0.0.0/0 的 UDP 端口 41641 添加一条无状态（Stateless）入站规则。

*（图：添加入站规则）*

## 步骤 3：从虚拟机宣告路由

为了让 tailnet 中*其他*节点受益，我们将设置[拆分 DNS][docs-dns-using-settings]（split DNS），让这些节点能使用与 Oracle Cloud 内部相同的 DNS 名称。Oracle 提供的 DNS 服务器是 169.254.169.254，支持形如 `instance.subnet01234567.vcn01234567.oraclevcn.com` 的主机名。

我们让这台虚拟机同时宣告它所在子网以及 Oracle DNS 服务器的路由。例如，若子网地址段为 10.0.0.0/24，则命令为：

```shell
tailscale set --advertise-routes=10.0.0.0/24,169.254.169.254/32 --accept-dns=false
```

> **注意：**
>
> 对 Oracle Cloud 虚拟机而言，通常最好让 Oracle 自己处理 DNS 配置，而不要让 Tailscale 覆盖它，因此我们加上了 `--accept-dns=false`。

## 步骤 4：为你的 tailnet 添加 Oracle DNS

在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面中，我们添加一个仅作用于 `oraclevcn.com` 域的 nameserver（名称服务器），指向我们通过虚拟机开放出来的 Oracle DNS 服务器。

*（图：为 oraclevcn.com 添加拆分 DNS 解析器）*

现在，这些在 Oracle Cloud 内部节点之间可用的主机名，对我们 tailnet 上的所有节点也可用了。

## 步骤 5：移除公开的 SSH 访问

既然现在已经能通过 Tailscale 私有网络 SSH 连入系统，就没有理由继续在公网 IP 上开放 SSH 端口了。可以在 Network > Security List 中删除该 SSH 规则。

*（图：禁用公开 SSH 端口）*

## 故障排除

有关故障排除的信息，请参阅[排查 Linux 云设备问题][docs-troubleshooting-oracle-cloud]。

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-设置

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-troubleshooting-oracle-cloud]: /docs/reference/troubleshooting/cloud/oracle-cloud

[xt-oracle-instances-create]: https://cloud.oracle.com/compute/instances/create

[xt-oracle-vcns]: https://cloud.oracle.com/networking/vcns
