---
title: "出口节点（路由全部流量）"
description: "将你的网络中某台特定设备设为出口节点，让全部互联网流量经由它路由。"
---

最后验证于 Dec 15, 2025

> **注意：**出口节点[所有套餐](https://tailscale.com/pricing)均可用。

默认情况下，Tailscale 充当覆盖网络（overlay network）：它只在运行 Tailscale 的设备之间路由流量，不会触碰你的公共互联网流量，比如你访问 Google 或 Twitter 的时候。这种覆盖网络配置适合大多数只需要在敏感设备（例如公司服务器或家用电脑）之间安全通信、而不希望公共互联网连接增加额外[加密][docs-encryption]层或延迟的人。

*（图：示意图，展示 Tailscale 覆盖网络中的四台设备。笔记本电脑与 google.com 建立直连。）*

不过，有时你可能希望 Tailscale 为你路由公共互联网流量。例如，在以下情况下你可能想路由全部公共互联网流量：

* 你在咖啡馆里使用不受信任的 Wi-Fi。
* 你在海外旅行，需要访问仅在所在国家/地区可用的在线服务（例如网上银行）。

*（图：示意图，展示 Tailscale 覆盖网络中的四台设备，其中一台以蓝色高亮并被指定为出口节点。笔记本电脑与 google.com 的连接经由被指定为出口节点的 Desktop 设备转发。）*

你可以把网络中的一台设备设为出口节点（exit node），再配置其他设备将流量发送给它，从而路由你的全部公共互联网流量。当你把所有流量都经由出口节点路由时，实际上就是在使用[默认路由][xt-wikipedia-default-route]（`0.0.0.0/0`、`::/0`），与你使用普通 VPN 时的效果类似。

> **注意：**
>
> 以下相关视频提供了更多背景说明与示例。

[Exit Nodes | Tailscale Explained（视频）](https://www.youtube.com/watch?v=Ad7D2pkFNdA)

## 优势

* **保护所有流量**：出口节点保护所有流量，包括发往互联网站点和应用的流量。
* **全球扩展**：在全球各地部署出口节点，满足你的规模与地域需求。
* **提升可见性**：[目标日志记录][ar-destination-logging]让你更清楚地掌握整个 tailnet 的流量状况，并在安全事件期间支持取证分析。

## 使用场景

* **差旅团队**：无论出差员工使用什么物理网络，都确保其全部互联网流量受到保护。
* **多地测试**：通过在全球部署并选择出口节点，从不同地点测试你的应用。
* **满足合规需求**：如果你的监管或合规要求员工使用 VPN，出口节点可以帮上忙。

## 工作原理

出口节点功能让你将全部流量经由 Tailscale 网络（即 tailnet）中的某台特定设备路由。为你路由流量的设备被称为**出口节点**。在 tailnet 中使用出口节点的方式有很多，例如：

* 将所有非 Tailscale 流量经由出口节点路由。
* 使用[建议出口节点][docs-suggested-exit-nodes]，基于客户端信息（如位置和延迟）[自动选用最佳出口节点][docs-auto-exit-nodes]。
* 基于系统策略[强制设备使用出口节点][docs-mandatory-exit-nodes]，你可以通过移动设备管理（MDM）方案下发这些策略。

出于安全考虑，你必须主动选择启用（opt in）出口节点功能。例如：

* 每台设备都必须显式选择使用出口节点。
* 设备必须将自己宣告为出口节点。
* [Owner、Admin 或 Network admin](/docs/reference/user-roles) 必须允许该设备作为 tailnet 的出口节点。

> **提示：**
>
> 默认情况下，出口节点会捕获你的所有网络流量，但已经定向到子网路由器或应用连接器的流量除外。你也可以使用[子网路由器][docs-subnets]或[应用连接器][docs-app-connectors]来路由特定网络流量。在 Android 设备上，你还可以使用[基于应用的分流][docs-android-app-split-tunneling]。

### 本地网络访问

默认情况下，连接出口节点的设备将无法访问其本地网络。如果你希望在流量经由出口节点路由时允许该设备访问本地网络，请启用出口节点本地网络访问。

你可以在 Tailscale 客户端的 **Exit Nodes** 区域启用 **Allow Local Network Access** 设置。你也可以在运行 [`tailscale up`][docs-tailscale-up] 或 [`tailscale set`][docs-tailscale-set] 时传入 `--exit-node-allow-lan-access` 来启用此设置。

## 开始使用

> **注意：**
>
> 有关如何配置和使用出口节点的基本步骤，参见[使用出口节点][docs-quick-start-exit-nodes]快速开始指南。

出口节点入门步骤：

1. 了解[前提条件][ar-prerequisites]。
2. [将一台设备配置为出口节点][ar-configure-exit-node]。
3. [在管理控制台中允许该出口节点][ar-allow-exit-node]。
4. [配置其他设备使用该出口节点][ar-use-exit-node]。

### 前提条件

在配置出口节点之前，你必须：

* [搭建 Tailscale 网络（即 tailnet）][docs-install]。
* 确保出口节点和使用出口节点的设备都运行 **Tailscale v1.20 或更高版本**。
* 确保出口节点是 Linux、macOS、Windows、Android、iOS 或 tvOS 设备。
* 确保你已允许（目标）用户使用该出口节点。

### 配置出口节点

按以下步骤配置出口节点：

1. [安装 Tailscale 客户端][ar-install-tailscale]。
2. [将设备宣告为出口节点][ar-advertise-exit-node]。
3. [允许该出口节点][ar-allow-exit-node]。
4. [授予使用出口节点的权限][ar-grant-access]。
5. [使用出口节点][ar-use-exit-node]。

你也可以[获取建议出口节点][docs-get-suggested-exit-node]。

#### 安装 Tailscale 客户端

#### Android

在计划用作出口节点的 Android 设备上[下载并安装 Tailscale][co-download-android]。

#### iOS

在计划用作出口节点的 iOS 设备上[下载并安装 Tailscale][co-download-ios]。

#### Linux

在计划用作出口节点的 Linux 设备上[下载并安装 Tailscale][co-download-linux]。

#### macOS

在计划用作出口节点的 macOS 设备上[下载并安装 Tailscale][co-download-mac]。[三种 macOS 变体][docs-macos-variants]都支持运行出口节点。

#### tvOS

在计划用作出口节点的 Apple TV 上[下载并安装 Tailscale][docs-appletv-install-tailscale-on-tvos]。

#### Windows

在计划用作出口节点的 Windows 设备上[下载并安装 Tailscale][co-download-windows]。

#### 将设备宣告为出口节点

#### Android

在 Android 设备上打开 Tailscale 客户端，进入 **Exit Node**，选择 **Run as exit node**。

#### iOS

在 iOS 设备上打开 Tailscale 客户端，进入 **Exit Node**，选择 **Run as Exit Node**。

#### Linux

> **警告：**
>
> 你必须启用 IP 转发才能将 Linux 设备宣告为出口节点。
>
> \[缺少代码片段：EnableIPForwarding.mdx]
>
> 如果你的 Linux 节点使用 `firewalld`，由于一个[已知问题][xt-gh-tailscale-issue-3416]，你可能需要允许伪装（masquerading）作为变通方案。可以使用以下命令允许伪装：
>
> ```shell
> firewall-cmd --permanent --add-masquerade
> ```
>
> 其他 Linux 发行版可能需要不同的步骤。
>
> 启用 IP 转发时，请确保你的防火墙默认拒绝流量转发。许多 Linux 防火墙（如 `ufw` 和 `firewalld`）默认就采用这种配置，以防止路由非预期流量。

在计划用作出口节点的设备上，运行 [`tailscale set`][docs-tailscale-set] 或 [`tailscale up`][docs-tailscale-up] 时传入 `--advertise-exit-node` 标志：

```shell
sudo tailscale set --advertise-exit-node
```

如果你把 `--advertise-exit-node` 标志传给 `tailscale set` 命令，之后必须运行 `tailscale up`。

```shell
sudo tailscale set --advertise-exit-node
sudo tailscale up
```

#### macOS

> **注意：**
>
> 在 macOS 上运行 Tailscale 有[三种方式][docs-macos-variants]。本文只适用于 macOS App Store 版和 Standalone（GUI）版。如果你在 macOS 上使用 `tailscaled`，请按照 Linux 的步骤操作。

在计划用作出口节点的设备上打开 Tailscale 客户端，选择 **Exit Node** > **Run Exit Node**。

#### tvOS

要将 Apple TV 用作出口节点，参见[在 Apple TV 上安装 Tailscale][docs-appletv-advertise-exit-node]。

#### Windows

在计划用作出口节点的设备上打开 Tailscale 客户端，选择 **Exit node** > **Run exit node**。

### 在管理控制台中允许出口节点

你必须具有 [Admin](/docs/reference/user-roles) 身份，才能允许某台设备作为出口节点。

> **注意：**
>
> 如果设备由在 [`autoApprovers`][docs-policy-syntax-autoapprovers] 中有权批准出口节点的用户完成认证，该出口节点会自动获得批准。

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，找到该出口节点。
2. 在机器列表中找到 **Exit Node** 徽标，或使用 [`property:exit-node`](https://console.tailscale.com/admin/machines?q=property%3Aexit-node) 筛选器列出所有已宣告为出口节点的设备。

在出口节点的菜单中，选择 **Edit exit node**，然后选择 **Use as exit node**。

### 授予使用出口节点的权限

默认情况下，tailnet 中的任何用户都可以使用已配置的出口节点，你无需添加任何授权（grant）或 ACL。

如果你自定义了 tailnet 的[访问控制策略][docs-acls]，情况就会改变。例如，假设你用一个只允许开发人员访问几台内部服务器的策略替换默认策略：

```json
{
  "grants": [
    {
      "src": ["group:developers"],
      "dst": ["tag:prod"],
      "ip": ["*"]
    }
  ]
}
```

你的开发人员仍然可以访问生产服务器，但再也无法使用出口节点。该策略从未向 [`autogroup:internet`][docs-grants-allow-exit-nodes] 授予访问权限，因此 Tailscale 无权将互联网流量经由出口节点路由。

一个常见的困惑是把出口节点设备本身添加为目标（destination）。那只会允许连接到出口节点（例如 SSH），并不允许把这台设备当作互联网网关使用。

要允许使用出口节点，请添加一条 `dst` 为 `autogroup:internet` 的[授权][docs-grants]或 ACL。这授予的是把互联网流量经由任意已配置出口节点路由的权限，而不是连接到出口节点设备本身的权限。

### 使用出口节点

每台设备都必须单独启用出口节点。启用出口节点的步骤因设备操作系统而异。

#### Android

1. 在 Android 设备上打开 Tailscale 应用，进入 **Exit Node** 区域。
2. 选择你想使用的出口节点。如果你希望在流量经由出口节点路由时允许直接访问本地网络，请打开 **Allow LAN access** 开关。
3. 在应用主屏幕上，确认所选设备显示在 **Exit Node** 区域。当设备正在使用某个出口节点时，该区域会变成蓝色。

要让设备停止使用出口节点，进入 **Exit Node** 区域并选择 **None**。

#### iOS

你可以从屏幕顶部使用出口节点。

选择你想使用的出口节点。要停止使用出口节点，禁用当前使用的节点，或在 **Exit Node** 列表中选择 **None**。

#### Linux

运行带 `--exit-node=` 标志的 `tailscale set`，传入出口节点的 [Tailscale IP 地址][docs-tailscale-ip-addresses]。

```shell
sudo tailscale set --exit-node=<exit-node-ip>
```

你可以在管理控制台中找到设备的 IP 地址，也可以运行 `tailscale status` 查看。

另外，可将 `--exit-node-allow-lan-access` 设为 `true`，以便在流量经由出口节点路由时允许直接访问本地网络。

```shell
sudo tailscale set --exit-node=<exit-node-ip> --exit-node-allow-lan-access=true
```

要停止使用出口节点，运行 `--exit-node` 标志但不传入 IP 地址。

```shell
sudo tailscale set --exit-node=
```

#### macOS

你可以从菜单栏使用出口节点。打开 Tailscale 菜单并选择 **Exit Nodes**。（如果你运行的 Tailscale 客户端版本低于 **v1.60.0**，要选择的菜单项是 **Use exit node**。）然后选择要使用的出口节点的机器名。

要在流量经由出口节点路由时允许直接访问本地网络，选择 **Allow Local Network Access**。

#### tvOS

要让 Apple TV 使用 tailnet 中的另一台设备作为出口节点，参见[在 Apple TV 上安装 Tailscale][docs-appletv-use-exit-node]。

#### Windows

你可以从系统托盘菜单使用出口节点。选择 Tailscale 图标并选择 **Use exit node**。然后选择要使用的出口节点的机器名。

如果你希望在流量经由出口节点路由时允许直接访问本地网络，选择 **Allow local network access**。

> **注意：**
>
> 只有当你的 tailnet 中存在可用出口节点时，才会显示使用出口节点的选项。

你可以[借助在线工具][xt-whatismyip]检查你的公网 IP 地址，验证流量确实经由另一台设备路由。显示的将是出口节点的公网地址，而不是你本地设备的 IP 地址。

要关闭经由出口节点路由，在 **Exit Node** 下拉框中选择 **None**。

## 网络流日志中的目标日志记录

> **注意：**目标日志记录[面向 Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

> **注意：**
>
> 目标日志记录需要签订销售合同才能启用。详情请联系 [Tailscale Sales](https://tailscale.com/contact/sales)。

出于隐私、滥用防护和安全方面的考虑，默认情况下，所有 tailnet 中流经出口节点的流量都禁用目标日志记录。不过，Enterprise 套餐的 tailnet 可以启用整个 tailnet 的目标日志记录，以便更清楚地掌握整个 tailnet 的流量状况，并在安全事件期间支持取证分析。目标记录在[网络流日志][docs-network-flow-logs]中。

> **注意：**
>
> 使用出口节点目标日志记录之前，必须先启用[日志流式传输][docs-log-streaming]。

为出口节点启用目标日志记录的步骤：

1. 打开管理控制台的 [Logs](https://console.tailscale.com/admin/logs) 页面。
2. 选择 **Network flow logs**。
3. 选择 **Logging Actions** 菜单，然后选择 **Enable exit node destination logging**。

为出口节点停用目标日志记录的步骤：

1. 打开管理控制台的 [Logs](https://console.tailscale.com/admin/logs) 页面。
2. 选择 **Network flow logs**。
3. 选择 **Logging Actions** 菜单，然后选择 **Disable exit node destination logging**。

## 注意事项

#### Android

Tailscale 对在 Android 上运行出口节点的支持仍在优化中。如果你打算长时间把设备用作出口节点，请确保设备接通电源。Android 出口节点仅限于[用户态路由][docs-kernel-vs-userspace-routers]。

> **注意：**
>
> 在 Android 设备上运行出口节点性能不佳——多数场景下可能都太慢。

### 用户态

在 Android 上，出口节点在用户态实现，这与 Linux 出口节点的默认实现不同，也不够成熟和优化。详情参见 [Kernel vs. netstack subnet routing and exit nodes][docs-kernel-vs-userspace-routers]。

#### Linux

将 Google Cloud Platform 与 Linux 虚拟机出口节点配合使用存在一个已知问题。包括变通方案在内的更多信息，参见 [Google Cloud Platform 参考架构][docs-gcp-reference-architecture]。

### 端口转发

要将 Linux 设备用作出口节点，你必须启用端口转发。

\[缺少代码片段：EnableIPForwarding.mdx]

#### macOS

Tailscale 对在 macOS 上运行出口节点的支持较新，仍在优化中。macOS 出口节点仅限于用户态路由，并且需要你阻止设备进入睡眠以维持连接。

### 用户态

在 macOS 上，出口节点在用户态实现，这与 Linux 出口节点的默认实现不同，也不够成熟和优化。详情参见 [Kernel vs. netstack subnet routing & exit nodes][docs-kernel-vs-userspace-routers]。

### 睡眠

运行出口节点时，如果你希望出口节点保持可用，[目前][xt-gh-tailscale-issue-3574]必须防止电脑进入睡眠。

在 macOS 系统偏好设置的 **Energy Saver** 中，选择 **Prevent computer from sleeping automatically when the display is off**。

#### tvOS

### 睡眠

Apple TV 休眠后无法访问，最常见的原因是它没有被配置为家庭中枢（home hub）。通常，Apple TV 在初始设置期间会被自动设为家庭中枢。但如果你把 Apple TV 移到别的物理位置，或对网络做了重大配置更改，这一功能可能会被禁用。更多信息参见[在 Apple TV 上安装 Tailscale][docs-appletv-troubleshooting]。

#### Windows

Tailscale 对在 Windows 上运行出口节点的支持较新，仍在优化中。Windows 出口节点仅限于用户态路由，要求 DNS 在系统线程中运行，并且需要你阻止设备进入睡眠以维持连接。

### 用户态

在 Windows 上，出口节点在用户态实现，这与 Linux 出口节点的默认实现不同。详情参见 [Kernel vs. netstack subnet routing & exit nodes][docs-kernel-vs-userspace-routers]。

### DNS

当 Tailscale 作为出口节点运行时，它会运行一个 DNS 服务器，供出口节点后面的对等端作为其 DNS 服务器使用。

Tailscale 在 Windows 上的 DNS 服务器实现[目前][xt-gh-tailscale-issue-3588]会为每个进行中的 DNS 查询占用一个系统线程（因而占用系统内存）。高并发查询量可能给负载较重的出口节点带来问题。

### 睡眠

运行出口节点时，考虑启用 ["Run Unattended"][docs-run-unattended]，这样即使你注销（或机器重启，例如安装 Windows 更新）之后 Tailscale 也会继续运行。

如果你希望出口节点保持可用，[目前][xt-gh-tailscale-issue-3574]还需要防止电脑进入睡眠。

### 设备密钥过期

\[缺少代码片段：expired\_device\_keys\_fail\_close.mdx]

[ar-advertise-exit-node]: #将设备宣告为出口节点

[ar-allow-exit-node]: #在管理控制台中允许出口节点

[ar-configure-exit-node]: #配置出口节点

[ar-destination-logging]: #网络流日志中的目标日志记录

[ar-grant-access]: #授予使用出口节点的权限

[ar-install-tailscale]: #安装-tailscale-客户端

[ar-prerequisites]: #前提条件

[ar-use-exit-node]: #使用出口节点

[co-download-android]: https://tailscale.com/download/android

[co-download-ios]: https://tailscale.com/download/ios

[co-download-linux]: https://tailscale.com/download/linux

[co-download-mac]: https://tailscale.com/download/mac

[co-download-windows]: https://tailscale.com/download/windows

[docs-acls]: /docs/features/access-control/acls

[docs-android-app-split-tunneling]: /docs/features/client/android-app-split-tunneling

[docs-app-connectors]: /docs/features/app-connectors

[docs-appletv-advertise-exit-node]: /docs/install/appletv#advertise-apple-tv-as-an-exit-node

[docs-appletv-install-tailscale-on-tvos]: /docs/install/appletv#install-tailscale-on-tvos

[docs-appletv-troubleshooting]: /docs/install/appletv#troubleshooting

[docs-appletv-use-exit-node]: /docs/install/appletv#use-a-device-exit-node

[docs-auto-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-gcp-reference-architecture]: /docs/reference/reference-architectures/gcp#linux-vms-using-exit-nodes

[docs-get-suggested-exit-node]: /docs/features/exit-nodes/auto-exit-nodes#use-a-suggested-exit-node

[docs-grants]: /docs/features/access-control/grants

[docs-grants-allow-all]: /docs/reference/examples/grants#allow-all

[docs-grants-allow-exit-nodes]: /docs/reference/examples/grants#allow-using-exit-nodes

[docs-install]: /docs/how-to/quickstart

[docs-kernel-vs-userspace-routers]: /docs/reference/kernel-vs-userspace-routers

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-mandatory-exit-nodes]: /docs/features/exit-nodes/mandatory-exit-nodes

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-quick-start-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-run-unattended]: /docs/how-to/run-unattended

[docs-subnets]: /docs/features/subnet-routers

[docs-suggested-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-tailscale-ip-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-tailscale-set]: /docs/reference/tailscale-cli#set

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[xt-gh-tailscale-issue-3416]: https://github.com/tailscale/tailscale/issues/3416

[xt-gh-tailscale-issue-3574]: https://github.com/tailscale/tailscale/issues/3574

[xt-gh-tailscale-issue-3588]: https://github.com/tailscale/tailscale/issues/3588

[xt-whatismyip]: https://www.whatismyip.com

[xt-wikipedia-default-route]: https://en.wikipedia.org/wiki/Default_route
