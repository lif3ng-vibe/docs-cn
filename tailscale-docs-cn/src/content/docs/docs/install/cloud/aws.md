---
title: "使用子网路由连接到 AWS VPC"
description: "本指南介绍将 [Tailscale 子网路由器][docs-subnets] 部署到 [Amazon Virtual Private Cloud（Amazon VPC）][xt-aws-vpc] 的步骤，以便直接访问运行 Tailscale 的 [Amazon Elastic Compute Cloud（Amazon EC2）][xt-aws-ec2] 实例。"
---

最后验证于 Dec 4, 2025

## 概述

本指南介绍将 [Tailscale 子网路由器][docs-subnets] 部署到 [Amazon Virtual Private Cloud（Amazon VPC）][xt-aws-vpc] 的步骤，以便直接访问运行 Tailscale 的 [Amazon Elastic Compute Cloud（Amazon EC2）][xt-aws-ec2] 实例。借助子网路由器，还可以访问 Amazon VPC 中的其他 Amazon EC2 实例。整个部署大约需要 15 分钟，所有 AWS 区域均支持。

在下面的步骤中，我们将新建一个带 Amazon 托管 NAT 网关的 Amazon VPC，然后配置 Tailscale 中继，为该 Amazon VPC 提供安全访问。我们会从零开始创建新的 Amazon VPC，但熟悉流程之后，你也可以调整这些步骤，在现有的 Amazon VPC 上设置 Tailscale。

本指南中的步骤会将单个子网路由器部署到单个可用区。你也可以在多个可用区部署多个子网路由器，并配置它们宣告相同的路由，以实现[高可用故障转移][docs-high-availability]。

## 前提条件

### 技术要求

Tailscale 可与 [Linux][docs-install-linux]、[Windows][docs-install-windows]、[macOS][docs-install-linux] 等系统无缝协作。无需数据库，唯一的存储需求是 Tailscale 节点密钥（node key）和节点状态。你可以[配置节点状态的存储位置][docs-tailscaled-flags-to-tailscaled]。

### 专业知识

本指南假设你已熟悉 Amazon VPC、Amazon EC2、Linux 和 SSH。

### Tailscale 账户

如果你还没有 Tailscale 账户，请前往 [`https://login.tailscale.com/start/`](https://login.tailscale.com/start) 创建。

### AWS 账户

如果你还没有 AWS 账户，请前往 [`https://aws.amazon.com`][xt-aws] 创建。

## 架构

*（图：带 Tailscale 子网路由器的 Amazon VPC）*

如上图所示，部署步骤会完成以下设置：

* 一个包含公有子网和私有子网的 Amazon VPC，通过 Amazon VPC 向导配置
* 公有子网中一台运行 Tailscale 作为子网路由器的 Amazon EC2 实例
* 私有子网中一台 Amazon EC2 实例

tailnet 中的所有设备都与 [Tailscale 协调服务器（coordination server）][docs-terminology-and-concepts-coordination-server]保持连接，以交换加密密钥、网络拓扑变更和访问策略变更等元数据。协调服务器只属于控制平面，不属于数据平面——它不负责在设备之间中继流量。

## 费用与许可

下面步骤中部署的所有 AWS 服务或资源都会产生费用。预计 AWS 费用为每月 100 美元。

下面步骤中部署的 Tailscale 服务或资源在所有 Tailscale 套餐（包括 Personal）中均可用。有关 Tailscale 各套餐（含付费套餐）的概览，请参阅[定价][co-pricing]。

### AWS 服务限制

如有需要，请为以下资源申请[提高服务配额][xt-aws-console-quota-us-east2]：

资源

此部署使用的数量

VPC

1

NAT 网关

1

安全组

2

EC2 实例

2

## 安全注意事项

### EC2 密钥对

请确保在你计划部署 Tailscale 的区域中，AWS 账户内至少存在一个 [Amazon EC2 密钥对][xt-aws-ec2-keypair]。记下该密钥对的名称，供下面的部署步骤使用。创建密钥对的方法请参阅 [Amazon EC2 密钥对与 Linux 实例][xt-aws-ec2-keypair]。此密钥将用于连接 Amazon EC2 实例，以安装和配置 Tailscale。

### IAM 权限

你必须使用具备 IAM 权限的账户登录 AWS 管理控制台，才能部署本指南中的资源。IAM 中的 `AdministratorAccess` 托管策略已提供足够权限，但你的组织也可以选择使用限制更严格的自定义策略。更多信息请参阅 [AWS 按职能划分的托管策略][xt-aws-iam-access-policies]。

## 部署步骤

### 第 1 步：登录你的 AWS 账户

使用具备[必要 IAM 权限][ar-iam-permissions]的 IAM 用户[登录你的 AWS 账户][xt-aws-console]。任何部署或操作都不要使用 AWS 账户根用户。

### 第 2 步：创建 VPC

使用 [**VPC 向导**][xt-aws-console-vpc-create]创建 VPC：

1. 在**要创建的资源**（Resources to create）下选择 **VPC 及更多**（VPC and more）。
2. 在**名称标签自动生成**（Name tag auto-generation）下为 VPC 起一个描述性名称，或保留默认值。
3. 在 **NAT 网关**（NAT gateways）下选择 **In 1 AZ**。
4. 选择**创建 VPC**（Create VPC）。

### 第 3 步：为 Tailscale 子网路由器创建 EC2 实例

使用 [**启动实例向导**][xt-aws-ec2-launch]（Launch an instance wizard）创建 Amazon EC2 实例：

1. 在**应用程序和操作系统映像**（Application and OS Images）下选择 **Amazon Linux** 或其他[受支持的 Linux 发行版][docs-install-linux]。
2. 在**实例类型**（Instance type）下选择满足你计算、内存、网络或存储需求的实例类型。测试此部署时，使用 `t2.micro` 或任何符合 [AWS 免费套餐][xt-aws-free-tier]条件的实例类型就足够了。
3. 在**密钥对**（登录）（Key pair (login)）下选择用于 SSH 的密钥对。
4. 在**网络设置**（Network settings）下选择你在上面创建的 VPC。
5. 将实例分配到该 VPC 的公有子网，并启用**自动分配公有 IP**（Auto-assign public IP）。
6. 创建一个安全组并允许入站 SSH。（初始设置期间需要用到，之后可以关闭。）
7. 为安全组起一个有辨识度的名称，例如 `tailscale-subnet-router`。
8. 选择**启动实例**（Launch instance）。

### 第 4 步：启用 IP 转发

要将 Linux 设备用作子网路由器，必须启用 IP 转发。通过 SSH 连入该 EC2 实例并运行以下命令。

\[Missing snippet: EnableIPForwarding.mdx]

### 第 5 步：在 EC2 实例上安装 Tailscale

通过 SSH 连入该 EC2 实例，并按照适合你发行版的[安装说明][docs-install-linux]安装 Tailscale。

安装完成后，启用 Tailscale systemd 服务并宣告你的子网所需的路由：

```shell
sudo systemctl enable --now tailscaled
sudo tailscale set --advertise-routes=10.0.0.0/16
```

系统会提示你在浏览器中访问一个链接，以将此设备认证到你的 Tailscale 网络。熟悉 Tailscale 的概念后，我们建议使用[预授权密钥][docs-auth-keys]（pre-authorization key，简称 auth key）来注册新设备。在使用 AWS CloudFormation 等基础设施即代码（IaC）系统预置设备时，这种方式最为实用。

> **注意：**
>
> `tailscale set --advertise-routes` 要求启用 IP 转发。如果显示与 IP 转发相关的错误，请[按照这些步骤][docs-troubleshooting-error-with-advertised-routes]排查。

### 第 6 步：配置你的 Tailscale 网络

访问 Tailscale [管理控制台](https://console.tailscale.com/admin)并执行以下操作：

1. 为子网路由器[禁用密钥过期][docs-key-expiry-disabling-key-expiry]，这样就无需定期重新认证该服务器。
2. 批准该设备上的子网路由，让 Tailscale 将 `10.0.0.0/16` 路由分发到你 Tailscale 网络中的其他设备。

### 第 7 步：验证连接

检查你能否从 Windows、macOS 等个人 Tailscale 设备上 ping 通该 EC2 实例的 Tailscale IP 地址。Tailscale IP 可以在[管理控制台](https://console.tailscale.com/admin)中找到，也可以在该 EC2 实例上运行 `tailscale ip -4` 查看。

### 第 8 步：封堵防火墙端口

既然 EC2 实例已经可以通过 Tailscale 访问，你就可以关闭对外防火墙上开放的端口。

1. 在 [Amazon EC2 控制台的安全组面板][xt-aws-ec2-security-groups]中找到并选择 `tailscale-subnet-router` 安全组。
2. 选择**编辑入站规则**（Edit inbound rules），删除允许 SSH 访问的规则。
3. 选择**保存规则**（Save rules）。

### 第 9 步：创建另一台用于中继访问的 EC2 实例

回到[**启动实例向导**][xt-aws-ec2-launch]，创建第二台 Amazon EC2 实例，我们将通过 Tailscale 子网路由器连接它：

1. 在**应用程序和操作系统映像**（Application and OS Images）下选择 **Amazon Linux** 或其他[受支持的 Linux 发行版][docs-install-linux]。
2. 在**实例类型**（Instance type）下选择与之前相同的实例类型。
3. 在**密钥对**（登录）（Key pair (login)）下选择用于 SSH 的密钥对。
4. 在**网络设置**（Network settings）下选择你在上面创建的 VPC。
5. 将实例分配到该 VPC 的私有子网，并将**自动分配公有 IP**（Auto-assign public IP）保持为**禁用**（Disable）。
6. 创建一个安全组，允许来自 `tailscale-subnet-router` 安全组的所有入站流量。
7. 选择**启动实例**（Launch instance）。

### 第 10 步：验证连接

使用私有 IP 通过 SSH 连接你新建的私有 EC2 实例。SSH 会话将经由你的 Tailscale 子网路由器进入私有子网。

### 客户责任

部署完成后，请确认你的资源和服务已更新并完成配置——包括为这些设备打固件和操作系统补丁。更多信息请参阅[共担责任模型][docs-shared-responsibility]。

### 支持

Tailscale 提供多种[支持选项][docs-support-options]，响应时间对应不同的 SLA。如果在与 Tailscale 设置或配置相关的问题上需要帮助，请[联系支持团队][co-contact-support-form]。

### 后续步骤

#### 服务器设置

如果你要在 Tailscale 上设置服务器，我们建议你[使用认证密钥预置服务器，并使用标签][docs-set-up-servers]来限制其访问。

#### 高可用性

可以在多个可用区部署多个子网路由器，并配置它们宣告相同的路由，以实现[高可用故障转移][docs-high-availability]。

#### 4via6 子网路由器

如果你的网络中存在 IPv4 地址重叠的子网，可以使用 [4via6 子网路由器][docs-4via6-subnets]功能，确保 tailnet 中每个节点的流量都被路由到正确的设备。

[ar-iam-permissions]: #iam-权限

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[co-pricing]: https://tailscale.com/pricing

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-install-linux]: /docs/install/linux

[docs-install-windows]: /docs/install/windows

[docs-key-expiry-disabling-key-expiry]: /docs/features/access-control/key-expiry#disabling-key-expiry

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-shared-responsibility]: /docs/concepts/shared-responsibility

[docs-subnets]: /docs/features/subnet-routers

[docs-support-options]: /docs/reference/support-options

[docs-tailscaled-flags-to-tailscaled]: /docs/reference/tailscaled#tailscaled-的标志

[docs-terminology-and-concepts-coordination-server]: /docs/reference/glossary#协调服务器

[docs-troubleshooting-error-with-advertised-routes]: /docs/reference/troubleshooting/network-configuration/ip-forwarding-errors-advertise

[xt-aws-console-quota-us-east2]: https://console.aws.amazon.com/servicequotas/home?region=us-east-2#!

[xt-aws-console-vpc-create]: https://console.aws.amazon.com/vpc/home#CreateVpc:createMode=vpcWithResources

[xt-aws-console]: https://console.aws.amazon.com

[xt-aws-ec2-keypair]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html

[xt-aws-ec2-launch]: https://console.aws.amazon.com/ec2/home#LaunchInstances:

[xt-aws-ec2-security-groups]: https://console.aws.amazon.com/ec2/home#SecurityGroups:

[xt-aws-ec2]: https://docs.aws.amazon.com/ec2

[xt-aws-free-tier]: https://aws.amazon.com/free

[xt-aws-iam-access-policies]: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html

[xt-aws-vpc]: https://docs.aws.amazon.com/vpc/index.html

[xt-aws]: https://aws.amazon.com
