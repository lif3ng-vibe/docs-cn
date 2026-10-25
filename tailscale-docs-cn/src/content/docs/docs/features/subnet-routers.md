---
title: "子网路由器"
description: "使用子网路由器让本地网络之外的设备访问特定子网内的服务。用 Tailscale 扩展你的私有网络。"
---

最后验证于 Sep 29, 2026

> **注意：** [所有套餐](https://tailscale.com/pricing)都可以使用子网路由器。

子网路由器让你把 Tailscale 网络（即 tailnet）扩展到那些没有或无法运行 Tailscale 客户端的设备。它们充当 tailnet 与物理子网之间的网关，无需处处安装 Tailscale 就能安全访问老旧设备、整个网络或服务。这一能力在保持 Tailscale 安全模型的同时，为复杂网络环境提供了灵活性。

> **注意：**
>
> 下面的相关视频提供了更多背景与示例。

[Subnet Routers | Tailscale Explained（视频）](https://www.youtube.com/watch?v=UmVMaymH1-s)

## 为什么重要

设计安全网络时，在每台设备上直接安装 Tailscale 客户端能通过端到端[加密][docs-encryption]提供最佳的安全性与性能。但网络管理员经常遇到无法直接安装的情况。打印机这类设备通常不具备运行 Tailscale 的能力；而在 [AWS VPC][docs-install-aws] 或正逐步现代化的老旧网络等大型环境中，给每个端点都安装客户端并不现实。

子网路由器弥补了这一空缺：它们充当网关，在 tailnet 与传统的基于子网的网络之间转发流量。它们遵循[访问控制策略][docs-access-control]，在把连接扩展到非 Tailscale 设备的同时维护 Tailscale 的安全模型。这种方式在安全性与连通性需求之间取得了务实的平衡。

对组织来说还有一个重要考虑：子网路由器后面的设备**不**计入你[套餐的设备数上限][co-pricing]。尽管如此，只要条件允许，在设备上直接安装 Tailscale 仍然是更优选择——性能、安全和配置简便性都更好。

## 优势

子网路由器方案为网络管理员和组织提供了多项重要优势。每一项都针对现代网络环境中的具体挑战。

* **连接老旧设备**——把无法运行 Tailscale 客户端的设备纳入你的 Tailscale 网络。
* **整合整个网络**——连接大型网络（如 AWS VPC），无需在每台设备上安装 Tailscale。
* **渐进式部署**——通过子网路由器接入既有网段，分阶段推进 Tailscale 的采用。
* **保持访问控制**——子网路由器遵循 Tailscale 的访问控制策略，维持全网安全。

## 使用场景

子网路由器通过扩展 Tailscale 的安全连接模型，解决各种网络环境中的实际问题。以下场景是子网路由器能带来显著价值的常见部署形态。

* **访问托管服务**——安全连接 Amazon RDS 或 Google Cloud SQL 等云托管服务，而不把它们暴露到公共互联网。
* **云网络整合**——把云 VPC 或其他云网段无缝接入你的 Tailscale 网络。
* **设备连通**——让打印机、摄像头等设备可供远程 Tailscale 用户访问，而无需安装 Tailscale 客户端。

## 子网路由器的工作原理

子网路由器充当网络桥梁，在统一的访问模型下连接彼此独立的网络环境。它们工作在网络层，促成 Tailscale 网络与传统基于子网的网络之间的通信。

子网路由器连接的是子网——更大网络的一部分。在 Tailscale 中，子网路由器是你 tailnet 中的一台设备，用作向其他设备通告路由的网关。这让设备无需安装 Tailscale 客户端就能连入你的 tailnet。

任何把子网路由器用作网关的设备都被视为*位于*该子网路由器之后。子网路由器默认使用源网络地址转换（SNAT）。启用 SNAT 时，来自子网路由器后方设备的流量看起来都来自路由器本身，而不是原始设备。如果你的场景需要保留原始源 IP 地址，可以[禁用 SNAT][ar-disable-snat]，让流量包中保留原始设备的 IP 地址。

> **注意：**
>
> ### 子网路由器与出口节点
>
> 子网路由器和出口节点在 Tailscale 生态中用途不同，尽管两者都涉及流量路由。理解这一区别有助于你为组网需求选择正确的方案。
>
> 出口节点（exit node）为 tailnet 设备路由出站互联网流量，实际上充当 VPN 服务器。连接出口节点后，你的互联网流量看起来来自出口节点所在位置，这对访问受地域限制的内容或提升隐私很有用。相比之下，子网路由器提供对特定私有子网的访问：它们让 tailnet 设备能到达这些子网内的非 Tailscale 设备，但不影响互联网流量的路由。如果你需要访问办公室局域网或云 VPC 这类私有网络，子网路由器才是合适的方案。

## 设置子网路由器

设置子网路由器包括：在一台将充当网关的设备上安装 Tailscale、配置它通告路由，以及确保访问控制正确。此过程需要对子网路由器设备和你的 Tailscale 网络都拥有管理权限。

几乎所有能运行 Tailscale 客户端的设备都可以用作子网路由器。要把设备配置为子网路由器，请按下面的说明操作，或参阅[快速开始指南][docs-quick-start-subnets]。

1. [安装 Tailscale 客户端][ar-install-tailscale-client]。
2. [以子网路由器身份连接 Tailscale][ar-connect]。
3. [从管理控制台启用子网路由][ar-enable-subnet-routes]。
4. [为通告的子网路由添加访问规则][ar-add-access-rules]。
5. [验证你的连接][ar-verify-connection]。
6. [从其他设备使用你的子网路由][ar-use-subnet-routes]。

### 安装 Tailscale 客户端

创建子网路由器的第一步，是在将充当网关的设备上安装 Tailscale 客户端。安装步骤因平台而异，但在所有受支持的操作系统上流程都很简单。

#### Linux

在你计划用作子网路由器的设备上[下载并安装 Tailscale][co-download-linux]。

#### macOS

在你计划用作子网路由器的设备上[下载并安装 Tailscale][co-download-mac]。[三种 macOS 变体][docs-macos-variants]都支持作为子网路由器运行。

#### tvOS

在你计划用作子网路由器的 Apple TV 上[下载并安装 Tailscale][docs-appletv-install-tailscale-on-tvos]。

#### Windows

在你计划用作子网路由器的设备上[下载并安装 Tailscale][co-download-mac]。

#### Android

在你计划用作子网路由器的设备上[下载并安装 Tailscale][co-download-android]。

### 以子网路由器身份连接 Tailscale

安装 Tailscale 后，你需要通过启用 IP 地址转发并通告想开放的子网路由，把设备配置为子网路由器。这几步会把一个普通的 Tailscale 节点变成其他网络的网关。

#### Linux

要把 Linux 设备用作子网路由器，你需要完成两项关键配置：启用 IP 地址转发和通告子网路由。Linux 设备凭借其稳定性和网络能力，特别适合充当子网路由器。

1. 启用 IP 地址转发。
2. 通告子网路由。

#### 启用 IP 地址转发

> **提示：**
>
> 启用 IP 地址转发时，请确保你的防火墙默认拒绝流量转发。这是 `ufw` 和 `firewalld` 等标准防火墙的默认设置。默认阻止流量转发可以防止流量被意外路由。

Linux 设备用作子网路由器需要启用 IP 地址转发。这一内核设置让系统在接口之间转发网络包，实质上充当路由器。启用方法因 Linux 发行版而异，但以下步骤在大多数情况下都适用。

如果你的 Linux 系统有 `/etc/sysctl.d` 目录，使用：

```shell
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
```

否则，使用：

```shell
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf
```

> **警告：**
>
> 如果你的 Linux 节点使用 `firewalld`，由于一个[已知问题][xt-gh-tailscale-issue-3416]，你可能需要允许地址伪装（masquerading）。作为变通办法，可以用以下命令允许伪装：
>
> ```shell
> firewall-cmd --permanent --add-masquerade
> ```

#### 通告子网路由

启用 IP 地址转发后，运行带 `--advertise-routes` 旗标的 `tailscale set`。该旗标接受以逗号分隔的子网路由列表。

```shell
sudo tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
```

请务必把上例中的子网替换为你网络的正确子网。除 Apple TV 外，所有平台都同时支持 IPv4 和 IPv6 子网；Apple TV 只支持 IPv4 子网。

如果认证该设备的用户有权在 [`autoApprovers`][docs-policy-syntax-autoapprovers] 中通告指定路由，子网路由器的路由会自动获得批准。你也可以通告 tailnet 策略文件中 `autoApprovers` 允许路由的任意子集。如果你想暴露默认路由（`0.0.0.0/0` 和 `::/0`），请考虑改用[出口节点][docs-exit-nodes]。

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-exit-nodes]: /docs/features/exit-nodes

#### macOS

用 macOS 作子网路由器时，设置流程更简单，因为通告路由时会自动启用 IP 地址转发。你只需配置要通告的子网路由，macOS 会处理底层的网络需求。

> **注意：**
>
> 如果你使用 Mac App Store 变体或独立版变体，启用命令行界面（CLI）集成是本节的先决条件。有关把 `tailscale` 命令装入 `$PATH` 环境变量的说明，请参阅 [CLI 主题][docs-cli-macos]。
>
> 如果不想安装命令行工具，你也可以把命令追加到 Tailscale 应用路径后执行（如 `up` 和 `status`），例如：
>
> ```shell
> /Applications/Tailscale.app/Contents/MacOS/Tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
> ```

启用 IP 地址转发后，运行带 `--advertise-routes` 旗标的 `tailscale set`。该旗标接受以逗号分隔的子网路由列表。

```shell
sudo tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
```

请务必把上例中的子网替换为你网络的正确子网。除 Apple TV 外，所有平台都同时支持 IPv4 和 IPv6 子网；Apple TV 只支持 IPv4 子网。

如果认证该设备的用户有权在 [`autoApprovers`][docs-policy-syntax-autoapprovers] 中通告指定路由，子网路由器的路由会自动获得批准。你也可以通告 tailnet 策略文件中 `autoApprovers` 允许路由的任意子集。如果你想暴露默认路由（`0.0.0.0/0` 和 `::/0`），请考虑改用[出口节点][docs-exit-nodes]。

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-exit-nodes]: /docs/features/exit-nodes

#### tvOS

Apple TV 设备可以充当子网路由器，把 Tailscale 连接带到传统计算机不太适合的环境。设置流程针对 tvOS 环境与界面做了专门适配。

要在 tailnet 中把 Apple TV 用作子网路由器，请参阅[在 Apple TV 上安装 Tailscale][docs-appletv-advertise-subnet-router]。

#### Windows

经过适当配置，Windows 系统可以很好地充当子网路由器。在通告路由之前，你必须先启用 IP 地址转发，让 Windows 能在网络之间转发数据包。

启用 IP 地址转发后，运行带 `--advertise-routes` 旗标的 `tailscale set`。该旗标接受以逗号分隔的子网路由列表。

```powershell
tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
```

请务必把上例中的子网替换为你网络的正确子网。除 Apple TV 外，所有平台都同时支持 IPv4 和 IPv6 子网；Apple TV 只支持 IPv4 子网。

如果认证该设备的用户有权在 [`autoApprovers`][docs-policy-syntax-autoapprovers] 中通告指定路由，子网路由器的路由会自动获得批准。你也可以通告 tailnet 策略文件中 `autoApprovers` 允许路由的任意子集。如果你想暴露默认路由（`0.0.0.0/0` 和 `::/0`），请考虑改用[出口节点][docs-exit-nodes]。

#### Android

> **警告：**
>
> 在手机上运行子网路由器会显著影响电池续航。该功能主要面向 Android TV 设备，或预期持续接通电源的 Android 设备。

1. 打开 Tailscale 应用并选择头像菜单。
2. 在 **Settings** 中选择 **Subnet routing**，然后选择 **Add route**。
3. 输入你网络的 IP 地址与子网掩码组合（CIDR），例如 `192.168.1.0/24`。
4. 选择 **OK**。
5. 在应用的 **Exit Node** 部分，按需设置 **Allow LAN access** 开关。

   * Android 仅作为子网路由器、不作为出口节点时，把开关设为关闭。
   * Android 同时作为子网路由器和出口节点时，把开关设为开启。

### 从管理控制台启用子网路由

管理控制台提供了集中审批和管理设备所通告子网路由的界面。这一步确保你在子网路由器上配置的路由在 tailnet 中生效。

> **提示：**
>
> 如果你使用了 [`autoApprovers`][docs-policy-syntax-autoapprovers]，可以跳过这一步。

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 在设备列表中找到 **Subnets** 徽章，或使用 [`property:subnet`](https://console.tailscale.com/admin/machines?q=property%3Asubnet) 筛选器列出所有通告子网路由的设备。
3. 选择一台带 `subnet` 属性的设备，然后进入 **Subnets** 部分。
4. 选择 **Edit**。这会打开 **Edit subnet routes**。
5. 选择要批准的路由，然后选择 **Save**。

你可以对服务器[禁用密钥过期][docs-key-expiry]，以免定期重新认证。如果你使用了[标签][docs-tags]，[密钥过期默认是禁用的][docs-tags-key-expiry]。

### 为通告的子网路由添加访问规则

访问控制决定哪些设备和用户可以经由你的子网路由器访问资源。正确配置访问规则是在开放所需连接的同时维持安全的关键。

> **注意：**
>
> 访问规则控制允许哪些流量，而路由审批控制哪些路由被注入客户端路由表——这是两个相互独立的机制。完整解释请参阅[路由注入参考][docs-route-injection]。

> **提示：**
>
> 如果你已有允许访问所通告子网路由的规则，可以跳过这一步。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面，更新你的 [tailnet 策略文件][docs-acls]。
2. 创建一条允许访问所通告子网的[访问规则][docs-policy-syntax-acls]。

下面的 tailnet 策略配置示例确保 `group:dev` 的成员可以访问子网 `192.0.2.0/24`、`198.51.100.0/24` 和 `2001:db8::/32` 中的设备，并确保子网 `192.0.2.0/24` 可以访问子网 `198.51.100.0/24`（反之亦然）——*前提是[子网路由伪装][docs-troubleshooting-disable-route-masquerading]已禁用*。

```json
{
  "groups": {
    "group:dev": ["alice@example.com", "bob@example.com"]
  },
  "grants": [
    {
      "src": ["group:dev","192.0.2.0/24", "198.51.100.0/24"],
      "dst": ["192.0.2.0/24", "198.51.100.0/24", "2001:db8::/32"],
      "ip": ["*:*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 验证你的连接

验证能确保你的子网路由器配置正确、按预期工作。这一步在你尝试访问其背后的资源之前，先确认 tailnet 设备可以与子网路由器通信。

从一台 tailnet 设备（例如 Linux、macOS 或 Windows 设备）ping 新子网路由器的 Tailscale IP 地址，确认可以连通。你可以在[管理控制台](https://console.tailscale.com/admin)中找到该 Tailscale IP，也可以在子网路由器上运行以下命令查看。

```shell
tailscale ip -4
```

### 从其他设备使用你的子网路由

子网路由器配置并验证完毕后，你需要确保 tailnet 中的其他设备能发现并使用新路由。这一过程因操作系统而略有差异。

Android、iOS、macOS、tvOS 和 Windows 会自动获取你的新子网路由。

默认情况下，Linux 设备只发现 [Tailscale IP 地址][docs-100.x-addresses]。要让 Linux 设备自动发现新的子网路由，请使用 `--accept-routes` 旗标：

```shell
sudo tailscale set --accept-routes
```

## 更新子网路由

网络需求会随时间演变，你可能需要修改子网路由器通告的子网路由。这一过程包括更新路由通告，并确保变更得到正确批准且可访问。

更新子网路由的步骤：

1. [以子网路由器身份连接 Tailscale][ar-connect]。
2. [从管理控制台启用子网路由][ar-enable-subnet-routes]。
3. [为通告的子网路由添加访问规则][ar-add-access-rules]。
4. [验证你的连接][ar-verify-connection]。
5. [从其他设备使用你的子网路由][ar-use-subnet-routes]。

你可以排除任何路由，让子网路由器不再通告它们。

## 使用高级子网路由

设置好子网路由器后，你可以考虑：

* [把 DNS 查询路由到内部 DNS 服务器][ar-route-dns-lookups-to-an-internal-dns-server]。
* [为子网路由器设置高可用][ar-set-up-high-availability]。
* [使用前缀长度不同的重叠路由][ar-use-overlapping-routes]，实现精细的路由控制。
* 使用[站点到站点][docs-site-to-site]网络连接两个或多个子网。
* [禁用源 NAT（SNAT）][ar-disable-snat]。

### 把 DNS 查询路由到内部 DNS 服务器

DNS 配置让你的 tailnet 既能解析 Tailscale 设备的名称，也能解析所通告子网内资源的名称。这一能力让你的混合网络环境实现无缝的名称解析。

你可以把 [Tailscale IP 地址加入公共 DNS 记录][docs-dns]，因为 Tailscale IP 地址只有你网络中通过认证的用户才能访问。你也可以通过在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面配置拆分 DNS，使用子网上的内部 DNS 服务器。

### 设置高可用

对关键环境而言，冗余的子网路由器能在个别子网路由器设备故障时保持连接不断，提供可靠性。对需要持续可用的生产网络来说，这种做法必不可少。

你可以设置高可用，确保即使一台子网路由器下线，你的网络仍可连接。更多信息请参阅[高可用故障转移][docs-high-availability]主题。

> **警告：**
>
> 为高可用（HA）设置子网路由器时，请小心使用 `--accept-routes` 旗标。这适用于路由器通告相同路由时的主备故障转移，也适用于在同一区域内通告相同路由时的带区域内故障转移的区域路由。如果你在这些路由器上启用 `--accept-routes`，备用路由器可能会接受来自主路由器的、它自己也在通告的路由。
>
> 这会导致低效的路由路径。如果两台子网路由器都通告并接受 `192.168.1.0/24`，备用路由器会把所有 `192.168.1.0/24` 流量都经主路由器转发，即使它自己就直连该网络。
>
> 对大多数 HA 子网路由器部署，请只使用 `--advertise-routes` 旗标。除非你确实需要那种路由行为，否则避免使用 `--accept-routes`。

### 使用前缀长度不同的重叠路由

Tailscale 支持多台子网路由器通告前缀长度不同的重叠子网路由。当流量发往某个目标 IP 地址时，Tailscale 使用最长前缀匹配（LPM）选择可用的最精确路由。

例如，如果你配置了：

* 子网路由器 A 通告 `10.0.0.0/16`
* 子网路由器 B 通告 `10.0.0.0/24`

流量会按最精确匹配来路由：

* `10.0.0.1` 经过子网路由器 B（被更精确的 `/24` 路由匹配）
* `10.0.1.1` 经过子网路由器 A（只被 `/16` 路由匹配）

当你需要在更大地址空间内对路由做精细控制时，这一能力很有用，例如：

* 为性能把特定子网引导到专用路由器
* 对特定子网应用不同的安全策略
* 把子网逐步迁移到新基础设施

> **警告：**
>
> 当更精确路由的子网路由器下线时，Tailscale 不会回退到较不精确的路由。在上例中，如果子网路由器 B（通告 `10.0.0.0/24`）不可用，Tailscale 会丢弃发往 `10.0.0.1` 的流量，而不是回退到子网路由器 A 的 `10.0.0.0/16` 路由。
>
> Tailscale 对每个通告的前缀采用静态路由选择、独立处理，而不是动态路由。下线的路由器无法撤回其路由通告，因此客户端会继续偏好那个更精确的前缀，即使没有健康的路由器在为它服务。
>
> 要避免这种情况，请配置所有通告较宽前缀的子网路由器同时通告更精确的前缀。例如，让子网路由器 A 同时通告 `10.0.0.0/16` 和 `10.0.0.0/24`。这样更精确的前缀就有多台候选路由器，其中一台下线时可以故障转移。
>
> 有关此行为和更多变通办法的信息，请参阅[重叠子网路由故障转移][docs-troubleshooting-overlapping-route-failover]。

### 禁用 SNAT

源网络地址转换（SNAT）影响源 IP 地址在网络不同位置设备眼中的样子。默认情况下，Tailscale 会对经过子网路由器的流量执行 SNAT，但必要时可以修改这一行为。

默认情况下，通告子网路由时，Tailscale 会使用源网络地址转换（SNAT，也称伪装）。你可以使用 `--snat-subnet-routes=false` 旗标（仅限 Linux）配合 [`tailscale up`][docs-tailscale-up] 命令禁用 SNAT。禁用 SNAT 会保留子网路由器后方主机的源 IP 地址。

```shell
tailscale up --snat-subnet-routes=false
```

> **警告：**
>
> `--snat-subnet-routes` 旗标只对 Linux 子网路由器有效。

在子网路由器上禁用源 NAT 后，其后面的设备可以访问它们所连设备的 Tailscale IP 地址，但不会自动知道如何把流量路由回那些 Tailscale IP 地址。要解决这个问题，你必须添加一条回程路由，告诉这些设备把所有 Tailscale 流量都经由你的子网路由器发送。你可以在以下三处之一配置该路由：

* 在设备的操作系统上
* 在你的 VPC 设置中
* 通过你的 DHCP 服务器

该路由应包含：

* 网络：`100.64.0.0/10`（Tailscale IP 地址范围，包括[保留 IP 地址][docs-reserved-ip-addresses]）
* 下一跳或网关：子网路由器的局域网 IP 地址

> **警告：**
>
> [目前][xt-gh-tailscale-issue-18725]，在同时充当子网路由器和出口节点的节点上设置 `--snat-subnet-routes=false` 可能导致上游丢包。如果该子网路由器必须禁用 SNAT，推荐的变通办法是把子网路由器与出口节点两种角色分到两个节点上。

## 注意事项

### 设备密钥过期

\[Missing snippet: expired\_device\_keys\_fail\_close.mdx]

[ar-add-access-rules]: #为通告的子网路由添加访问规则

[ar-connect]: #以子网路由器身份连接-tailscale

[ar-disable-snat]: #禁用-snat

[ar-enable-subnet-routes]: #从管理控制台启用子网路由

[ar-install-tailscale-client]: #安装-tailscale-客户端

[ar-route-dns-lookups-to-an-internal-dns-server]: #把-dns-查询路由到内部-dns-服务器

[ar-set-up-high-availability]: #设置高可用

[ar-use-overlapping-routes]: #使用前缀长度不同的重叠路由

[ar-use-subnet-routes]: #从其他设备使用你的子网路由

[ar-verify-connection]: #验证你的连接

[co-download-android]: https://tailscale.com/download/android

[co-download-linux]: https://tailscale.com/download/linux

[co-download-mac]: https://tailscale.com/download/mac

[co-pricing]: https://tailscale.com/pricing

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-acls]: /docs/features/access-control/acls

[docs-appletv-advertise-subnet-router]: /docs/install/appletv#advertise-apple-tv-as-a-subnet-router

[docs-appletv-install-tailscale-on-tvos]: /docs/install/appletv#install-tailscale-on-tvos

[docs-cli-macos]: /docs/reference/tailscale-cli?tab=macos

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-install-aws]: /docs/install/cloud/aws

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-quick-start-subnets]: /docs/features/subnet-routers/how-to/setup

[docs-site-to-site]: /docs/features/site-to-site

[docs-tags-key-expiry]: /docs/features/tags#key-expiry

[docs-tags]: /docs/features/tags

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[docs-troubleshooting-disable-route-masquerading]: /docs/reference/troubleshooting/network-configuration/disable-subnet-route-masquerading

[docs-troubleshooting-overlapping-route-failover]: /docs/reference/troubleshooting/network-configuration/overlapping-subnet-route-failover

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[docs-route-injection]: /docs/reference/route-injection

[xt-gh-tailscale-issue-3416]: https://github.com/tailscale/tailscale/issues/3416

[xt-gh-tailscale-issue-18725]: https://github.com/tailscale/tailscale/issues/18725
