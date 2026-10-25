---
title: "使用 Tailscale 私有访问 Google Compute Engine 虚拟机"
description: "Google Cloud 提供 Linux 虚拟机，你可以使用 Tailscale 提供安全连接。"
---

最后验证于 Dec 4, 2025

Google Cloud 提供 Linux 虚拟机，你可以使用 Tailscale 提供安全连接。

## 前提条件

在开始本指南之前，你需要先搭建并配置好一个 Tailscale 网络（即 tailnet），且其中至少有一台现有设备。如果需要帮助，请阅读我们的[入门指南][docs-install]。

## 第 1 步：为虚拟机设置 Tailscale 客户端

首先，[在 GCE 控制台中创建一台虚拟机][xt-google-vm-create-start]。

创建实例时，选择 **Management, security, disks, networking, sole tenancy**，然后选择 **Networking**，再选择 **Network Interface**。因为我们稍后要在这台虚拟机上启用子网路由，所以需要将 **IP forwarding** 设为 **On**。

*（图：网络接口配置，其中显示 IP forwarding 设置）*

虚拟机创建完成后，通过 SSH 连入该系统，按照步骤[在 Linux 上安装 Tailscale][docs-install-linux]。

## 第 2 步：放行 UDP 端口 41641

只要隧道至少有一端是"简单 NAT"（easy NAT），即 Tailscale 能够确定 NAT 设备另一侧的 UDP 端口号，它就会建立[直连以降低延迟][bl-how-tailscale-works]。为了让 GCE 节点能够建立直连，我们通过防火墙放行 UDP 端口 `41641` 的入站流量。

在 **VPC Network** > **Firewall** 中，我们添加两条规则：

1. 一条入站规则，允许来自 `0.0.0.0/0` 的 UDP 端口 `41641` 流量访问所有实例。
2. 一条入站规则，允许来自 `::/0` 的 UDP 端口 `41641` 流量访问所有实例。

*（图：示例项目的防火墙规则，流量方向设为 Ingress，协议和端口设为 41641）*

## 第 3 步：从虚拟机宣告路由

要让你的 tailnet 能够连接到 GCP 子网，请将这台虚拟机配置为[子网路由器][docs-subnets]。

首先，在虚拟机上启用 IP 转发。

\[Missing snippet: EnableIPForwarding.mdx]

启用 IP 转发后，配置虚拟机宣告它所在子网的路由。例如，如果子网地址范围为 `10.182.0.0/24`，命令就是：

```shell
tailscale set --advertise-routes=10.182.0.0/24 --accept-dns=false
```

> **注意：**
>
> 对 GCE 虚拟机来说，通常最好让 Google 处理 DNS 配置，而不要让 Tailscale 覆盖它，所以我们加上了 `--accept-dns=false`。

## 第 4 步：为你的 tailnet 添加 GCE DNS

为了方便 tailnet 中*其他*节点，我们将设置[拆分 DNS][docs-dns-using-settings]（split DNS），使其能够使用与 GCE 内部相同的 DNS 名称。

GCE 内部的主机名格式如下：

```shell
<vm-name>.<gce-project-name>.internal
```

使用 Google Cloud CLI 命令 [`gcloud dns policies create`][xt-google-dns-policies-create] 创建一个新的 [Cloud DNS][xt-google-cloud-dns] 政策，为你的 tailnet 开启入站转发：

```shell
gcloud dns policies create inbound-dns \
  --project="YOUR_VPC_PROJECT" \
  --description="Expose DNS endpoints per subnet" \
  --networks="YOUR_VPC" \
  --enable-inbound-forwarding
```

其中：

* `YOUR_VPC_PROJECT` 是你的 Google Cloud [项目 ID][xt-google-reference-project]。
* `YOUR_VPC` 是要与该政策关联的网络名称列表，以逗号分隔。

使用 [`gcloud compute addresses list`][xt-google-compute-address-list] 验证你的 tailnet 子网的 DNS 解析器：

```shell
gcloud compute addresses list \
  --project="YOUR_VPC_PROJECT" \
  --filter='purpose="DNS_RESOLVER"' \
  --format='csv(address, region, subnetwork)' \
  | grep YOUR_TAILNET_SUBNET
```

其中：

* `YOUR_VPC_PROJECT` 是你的 Google Cloud [项目 ID][xt-google-reference-project]。
* `YOUR_TAILNET_SUBNET` 是你子网机器的名称。

将此命令返回的 IP 地址用作你 tailnet 的 DNS 解析器：

1. 打开管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 选择**添加名称服务器**（Add name server）。
3. 选择**自定义**（Custom）。
4. 在 **Nameserver** 中输入你之前运行的 `gcloud compute addresses list` 命令返回的 IP 地址。本示例使用 `10.243.117.59`。
5. 确保勾选**限制到搜索域**（Restrict to search domain）。
6. 在 **Search Domain** 中输入 **internal**。
7. 选择**保存**（Save）。

   *（图：添加名称服务器配置，填入 IP 地址并将 Search Domain 设为 internal）*

这样，在 GCE 内部节点之间有效的主机名，对你 tailnet 中的所有节点也同样可用。

## 第 5 步：移除公开的 SSH 访问

既然现在已经可以通过私有 Tailscale 网络 SSH 到该系统，就没有理由继续在公有 IP 地址上开放 SSH 端口了。你可以在 **VPC network** > **Firewall** 中删除 `default-allow-ssh` 规则。

*（图：示例项目的防火墙规则详情，突出显示右上角的 Delete 命令）*

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-subnets]: /docs/features/subnet-routers

[xt-google-cloud-dns]: https://cloud.google.com/dns

[xt-google-compute-address-list]: https://cloud.google.com/sdk/gcloud/reference/compute/addresses/list

[xt-google-dns-policies-create]: https://cloud.google.com/sdk/gcloud/reference/dns/policies/create

[xt-google-reference-project]: https://cloud.google.com/sdk/gcloud/reference#--project

[xt-google-vm-create-start]: https://cloud.google.com/compute/docs/instances/create-start-instance
