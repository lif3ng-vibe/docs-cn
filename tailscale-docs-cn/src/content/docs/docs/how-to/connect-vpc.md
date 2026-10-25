---
title: "访问你的虚拟私有云（VPC）"
description: "使用 Tailscale 访问你的虚拟私有云（VPC）并配置子网路由器。"
---

最后验证于 Jan 5, 2026

> **注意：**
>
> 本主题是设置 Linux [子网路由器][docs-subnets] 以访问虚拟私有云（VPC）的快速指南。你也可以在 [Windows][docs-subnets-config-windows] 或 [macOS][docs-subnets-config-macos] 上设置子网路由器。更多信息参阅[使用子网路由连接 AWS VPC][docs-install-aws]。

## 前提条件

* 你需要一个 [Tailscale 账户][docs-install]。
* 你需要一台 Linux 虚拟机。以下主题介绍了如何使用常见云服务商搭建 Linux 虚拟机：
  * [在 Azure 上创建 Linux 虚拟机][xt-azure-vm]。
  * [在 AWS 上创建 Linux 虚拟机][xt-aws-ec2-get-started]。
  * [在 GCP 上创建 Linux 虚拟机][xt-google-linux-vm-create]。
* 你需要在 Linux 虚拟机上[安装 Tailscale][docs-install-linux]。
* 你需要在本地机器上[安装 Tailscale][co-download]。

## 创建 Tailscale 子网路由器

1. 先记下你要访问的私有资源的 IP 地址，并确定表示这些资源所在子网边界的无类别域间路由（CIDR）表示法。
   例如，如果你有一台虚拟机位于 `10.0.0.3`，另一台位于 `10.0.1.4`，可以考虑用 CIDR 表示法 `10.0.0.0/24` 和 `10.0.1.0/24` 来表示这些子网

   云服务商也可能为你的 VPC 提供 CIDR 地址空间，可以直接拿来用。例如，以下是 AWS 的截图：

   *（图：AWS VPC 页面，列出可用的 VPC，高亮显示一个 IPv4 CIDR 范围。）*

   这是 Azure 的截图：

   *（图：Azure 虚拟网络页面，显示某个虚拟网络的详细信息，高亮显示 IPv4 CIDR 范围。）*

2. 首先连接到虚拟机，开始配置子网路由器。

   > **注意：**
   >
   > 这一步通常使用云服务商自带的 SSH 方式，可能需要**临时**在该虚拟机上向公司网络或互联网开放端口 `22`。

3. 在终端窗口中运行以下命令，检查系统上是否有 `sysctl.d`：

   ```shell
   ls /etc | grep sysctl.d
   ```

4. 如果命令有输出，说明系统上存在 `sysctl.d`，可以运行以下命令在路由器上设置 IP 转发：

   \[Missing snippet: EnableIPForwarding.mdx]

5. 如果虚拟机实例上安装了 firewalld，还需要允许地址伪装（masquerading），子网路由器才能正常工作：

   ```shell
   firewall-cmd --permanent --add-masquerade
   ```

   如果这条命令返回错误，说明没有安装 `firewalld`，可以跳到下一步。

6. 最后，运行 [`tailscale set`][docs-cli-set] 命令，开始向你的子网通告路由（即第 1 步记录的路由）：

   ```shell
   sudo tailscale set --advertise-routes=<subnet range 1>,<subnet range 2>,...
   ```

   运行这一步会让虚拟机与 Tailscale 完成认证。系统会要求你用凭据登录，并把这个设备添加到 tailnet。以下示例使用第 1 步中的子网范围运行该命令：

   ```shell
   sudo tailscale set --advertise-routes=10.0.0.0/24,10.0.1.0/24
   ```

7. 打开 Tailscale 管理控制台的 [访问控制](https://console.tailscale.com/admin/acls) 页面，在 tailnet 策略文件中添加以下行，以允许通过子网的连接：

   ```json
   "grants": [
     {
       "src": ["john.doe@example.com"],
       "dst": ["<subnet-range-1>/24", "<subnet-range-2>/24"],
       "ip": ["*"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

   这样，指定的子网就能按规则中指定的端口被你访问。以下示例规则基于第 1 步中的子网，向用户 `john.doe@example.com` 授予子网范围内所有端口的访问权限：

   ```json
   "grants": [
     {
       "src": ["john.doe@example.com"],
       "dst": ["10.0.0.0/24", "10.0.1.0/24"],
       "ip": ["*"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

8. 如果你使用基于 Linux 的本地机器（不是子网路由器那台）来连接，需要运行 [`tailscale set`][docs-cli-set] 命令来接受通告的路由。如果你的本地机器不是 Linux，可以跳过这一步。

   ```shell
   sudo tailscale set --accept-routes
   ```

## 使用子网路由器

1. 在 [创建 Tailscale 子网路由器][ar-create-a-tailscale-subnet-router] 的第 1 步中，找到你要访问的资源或机器的私有 IP 地址。
2. 在本地机器的终端窗口中，ping 这些私有 IP。

   ```shell
   ping <your private vm ip address>

   ```

   如果收到来自这些地址的响应，说明子网路由器按预期工作。

   例如，使用第 1 步中的私有 IP：

   ```shell
   ping 10.0.0.3 -t 4
   ```

   如果成功，来自这些私有 IP 地址的响应类似于：

   ```shell
   PING 10.0.0.3 (10.0.0.3): 56 data bytes
   64 bytes from 10.0.0.3: icmp_seq=0 ttl=64 time=0.112 ms
   64 bytes from 10.0.0.3: icmp_seq=1 ttl=64 time=0.088 ms
   64 bytes from 10.0.0.3: icmp_seq=2 ttl=64 time=0.175 ms
   64 bytes from 10.0.0.3: icmp_seq=3 ttl=64 time=0.145 ms
   ```

[ar-create-a-tailscale-subnet-router]: #创建-tailscale-子网路由器

[co-download]: https://tailscale.com/download

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-install-aws]: /docs/install/cloud/aws

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-subnets]: /docs/features/subnet-routers

[docs-subnets-config-windows]: /docs/features/subnet-routers?tab=windows#connect-to-tailscale-as-a-subnet-router

[docs-subnets-config-macos]: /docs/features/subnet-routers?tab=macos#connect-to-tailscale-as-a-subnet-router

[xt-aws-ec2-get-started]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

[xt-azure-vm]: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu

[xt-google-linux-vm-create]: https://cloud.google.com/compute/docs/create-linux-vm-instance
