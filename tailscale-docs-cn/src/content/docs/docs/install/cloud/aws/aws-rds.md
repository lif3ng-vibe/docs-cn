---
title: "使用 Tailscale 私有访问 AWS RDS"
description: "Amazon 关系型数据库服务（AWS RDS）提供可通过 SQL 等方式访问的托管关系型数据库。RDS 是一项 Amazon 托管服务，可以通过主机名、公有 IP 地址或私有 IP 地址访问。"
---

最后验证于 Jan 5, 2026

Amazon 关系型数据库服务（AWS RDS）提供托管关系型数据库，可通过 SQL 等方式访问。RDS 是一项 Amazon 托管服务，可以通过主机名、公有 IP 地址或私有 IP 地址访问。为了让 tailnet 能够访问 RDS，我们使用[子网路由器][docs-subnets]。

## 前提条件

在开始本指南之前，你需要先搭建并配置好一个 Tailscale 网络，且其中至少有一台现有设备。如果需要帮助，请阅读我们的[入门指南][docs-install]。

本指南不介绍 RDS 实例本身的创建，我们假设你已经在使用 RDS。RDS 提供多种不同的数据库引擎，包括 Amazon 自家的 Aurora、MySQL、PostgreSQL 等等。本文介绍的连接技术适用于所有这些引擎。

为便于说明，我们假设 RDS 部署在 `us-west-2` 区域。

## 第 1 步：设置子网路由器

首先，[创建一台 EC2 实例][xt-aws-ec2-create]，运行 Amazon Linux，x86 或 ARM 架构均可。Tailscale 提供的 Linux 软件包同时包含这两种架构的二进制文件，而且 AWS 的 ARM 实例性价比非常高。

部分 AWS 区域拥有多个数据中心，每个数据中心对应一个可用区（Availability Zone）和一段 IP 子网。同一区域内的 RDS 实例可以从所有这些子网访问，因此 EC2 实例可以创建在其中任意一个子网中。其他 AWS 托管服务可能要求连接到特定子网。

只要隧道至少有一端是"简单 NAT"（easy NAT），即 Tailscale 能够确定 NAT 设备另一侧的 UDP 端口号，它就会建立[直连以降低延迟][bl-how-tailscale-works]。设置安全策略时，允许从任意源入站 UDP 端口 41641，即可启用[直连][docs-firewall-ports]，将延迟降到最低。

*（图：安全策略放行 41641 端口）*

然后通过 SSH 连入该系统，按照步骤在 Amazon Linux 2 上[安装 Tailscale][pk-install-amazon-linux-2]并[配置子网路由][docs-subnets]。运行 `tailscale up` 或 `tailscale set` 时，将你的 VPC 子网传给 `--advertise-routes`。例如，如果子网地址范围为 `172.31.0.0/16`，命令就是：

```shell
tailscale set --advertise-routes=172.31.0.0/16 --accept-dns=false
```

> **注意：**
>
> 对 EC2 实例来说，通常最好让 Amazon 处理 DNS 配置，而不要让 Tailscale 覆盖它，所以我们加上了 `--accept-dns=false`。

> **注意：**
>
> Windows、macOS、Android、iOS 等客户端默认都接受宣告的路由，但 Linux 客户端需要使用 `tailscale set --accept-routes=true`，才能使用 AWS 中子网路由器宣告的路由。

## 第 2 步：配置 RDS 安全策略

我们需要让 RDS 安全策略允许来自子网路由器的连接。RDS 安全策略可以在 RDS 实例的实例详情中找到。我们将为 EC2 子网路由器实例创建的安全策略添加进去。

*（图：向 RDS 安全策略添加子网中继）*

## 第 3 步：为你的 tailnet 添加 AWS DNS

为了方便 tailnet 中*其他*节点，我们将设置[拆分 DNS][docs-dns-using-settings]（split DNS），使其能够使用与 AWS 内部相同的 DNS 名称。

无论子网路由器位于哪个子网，AWS DNS 服务器地址始终是 [VPC 主 IPv4 CIDR 范围的基址 + 2][xt-aws-vpc-dhcp]。例如，如果 VPC 的主 CIDR 范围是 `172.31.0.0/16`，那么 DNS 服务器就是 `172.31.0.2`。在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面中，添加该 AWS DNS 服务器，并将其限制在区域专属的 `rds.amazonaws.com` 域，例如 `us-west-2.rds.amazonaws.com`。

*（图：为 us-west-2.rds.amazonaws.com 添加拆分 DNS 解析器）*

> **注意：**
>
> 我们建议[将你的数据库实例对互联网隐藏][xt-aws-hide-db]，以防止通过互联网访问。

## 第 4 步：移除公开的 SSH 访问

既然现在已经可以通过私有 Tailscale 网络 SSH 到该系统，就没有理由继续在公有 IP 地址上开放 SSH 端口了。在该 EC2 实例的安全组中，删除允许入站连接的 SSH 规则。

*（图：移除公开的 SSH 访问）*

## 第 5 步：连接到 RDS

现在可以从 tailnet 中的任意节点连接到 RDS，使用的 DNS 名称与 AWS 内部完全相同。

例如，在登录你的 tailnet 的情况下，从个人计算机访问你的 RDS 服务器：

```shell
mysqlsh --uri=admin@database-2.0123456789ab.us-west-2.rds.amazonaws.com:3306
MySQL  database-2.0123456789ab.us-west-2.rds.amazonaws.com:3306 ssl  JS > \sql
Switching to SQL mode... Commands end with ;
MySQL  database-2.0123456789ab.us-west-2.rds.amazonaws.com:3306 ssl  SQL > show databases;
+--------------------+
| Database           |
+--------------------+
| demo               |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.0297 sec)
```

使用子网路由器，你还可以借助内部 AWS IP 地址连接到 AWS 中的许多其他服务，而不仅仅是 RDS。

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-install]: /docs/how-to/quickstart

[docs-subnets]: /docs/features/subnet-routers

[pk-install-amazon-linux-2]: https://pkgs.tailscale.com/stable/#linux

[xt-aws-ec2-create]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

[xt-aws-hide-db]: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html#USER_VPC.Hiding

[xt-aws-vpc-dhcp]: https://docs.aws.amazon.com/vpc/latest/userguide/AmazonDNS-concepts.html#AmazonDNS
