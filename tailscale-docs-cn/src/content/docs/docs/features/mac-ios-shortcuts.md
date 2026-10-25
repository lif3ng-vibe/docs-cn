---
title: "macOS 与 iOS 快捷指令"
description: "了解 Tailscale 如何与快捷指令（Shortcuts）应用配合，帮你自动化完成任务。"
---

最后验证于 Jan 5, 2026

Tailscale 与 macOS 和 iOS 上的快捷指令（Shortcuts）应用配合，提供多个内置快捷指令操作，让你可以自动化完成任务。例如，你可以创建快捷指令来把设备连接到 tailnet、使用出口节点或切换用户账户。

你可以把 Tailscale 操作与其他可用操作组合来自定义任务，例如当设备不在家庭 Wi-Fi 上时自动连接到你的 tailnet。根据你的设置方式，你可以在快捷指令应用、菜单栏、Spotlight 等地方访问快捷指令。

> **注意：**
>
> 有关 macOS 和 iOS 快捷指令的一般信息，参见 Apple 的 [Shortcuts User Guide for Mac][xt-mac-shortcuts] 和 [Shortcuts User Guide for iOS][xt-ios-shortcuts]。

## 前提条件

要将 Tailscale 与快捷指令应用配合使用，你必须满足以下要求：

* Tailscale 1.36 或更高版本
* macOS Monterey 12.0 或更高版本
* iOS 15.0 或更高版本

## 可用操作

Tailscale 客户端提供用于与账户、设备、出口节点和你的 tailnet 交互的操作。

### 账户

以下 Tailscale 操作可让你管理 Tailscale 账户：

* [查找账户][ar-find-accounts]
* [切换账户][ar-switch-accounts]

#### 查找账户

检索已登录 Tailscale 客户端且符合给定条件的账户。你可以按 **Display Name** 或 **Login Name** 筛选账户，还可以指定排序字段、排序顺序和结果数量上限。

#### 切换账户

[切换 Tailscale 用户账户][docs-fast-user-switching]。你可以选择指定要切换到的账户用户名。如果不指定，该操作在运行时会要求你选择一个。

### 设备

以下 Tailscale 操作可让你管理设备：

* [查找设备][ar-find-devices]
* [Ping 设备][ar-ping-devices]
* [发送文件][ar-send-files]

#### 查找设备

检索 tailnet 中所有符合给定条件的设备。你可以按 **Name** 或连接状态（**Is Online** 或 **Is Offline**）筛选设备，还可以指定排序字段、排序顺序和结果数量上限。

#### Ping 设备

向 tailnet 中的一台设备发送 [ping][docs-tailscale-ping] 并获取 ping 结果。你可以按设备名称、[Tailscale IP 地址][docs-tailscale-ip-addresses]、[MagicDNS][docs-magicdns] 名称、设备 ID、IPv4 地址或 IPv6 地址来 ping 设备。

#### 发送文件

使用 [Taildrop][docs-taildrop] 向 tailnet 中的一台设备发送一个或多个文件。你指定要发送的文件以及接收这些文件的设备。

### 出口节点

> **注意：**
>
> 在从 macOS 或 iOS 快捷指令中使用出口节点之前，你的 tailnet 中必须已经存在出口节点。
>
> 出口节点操作属于敏感操作，因为出口节点会影响你设备上的所有网络流量。在 iOS 上，你必须先解锁设备才能使用出口节点操作。

以下 Tailscale 操作可让你管理[出口节点][docs-exit-nodes]：

* [使用出口节点][ar-use-exit-node]
* [停止使用出口节点][ar-stop-using-exit-node]

#### 使用出口节点

让设备按[名称][docs-machine-names]或 [Tailscale IP 地址][docs-tailscale-ip-addresses]使用某个出口节点。

#### 停止使用出口节点

让设备停止使用出口节点。

### tailnet 管理

以下 Tailscale 操作可让你管理 tailnet：

* [连接][ar-connect]
* [断开连接][ar-disconnect]
* [获取状态][ar-get-status]
* [设置 Tailscale DNS][ar-set-tailscale-dns]
* [切换][ar-toggle]

#### 连接

把你的设备连接到 tailnet。

#### 断开连接

把你的设备从 tailnet 断开。

#### 获取状态

检索 Tailscale 客户端的状态信息。它返回以下值：

* **Connected**（`boolean`）：设备是否已连接到某个 tailnet。
* **Account Name**（`string`）：Tailscale 用户名（例如 `alice@example.com`）。
* **Using Exit Node**（`boolean`）：设备当前是否正在使用出口节点。
* **Exit Node Name**（`string`）：出口节点的名称。

#### 设置 Tailscale DNS

修改设备是否使用 [Tailscale DNS][docs-dns]。你可以使用此操作：

* 开启 Tailscale DNS。
* 关闭 Tailscale DNS。
* 切换 Tailscale DNS 的使用状态（结果取决于操作运行时的状态）。

#### 切换

切换设备的连接状态。你可以使用此操作连接到或断开 tailnet。操作运行后会返回 **Yes** 或 **No**，表示设备已连接（Yes）或已断开（No）。

## 示例

### 切换账户

本示例展示如何创建一个在 Tailscale 账户之间切换的 [macOS 快捷指令][xt-mac-shortcuts]。示例使用[获取状态][ar-get-status]和[切换账户][ar-switch-accounts]操作。

1. 在 **Shortcuts** 应用中，选择 **File**，然后选择 **New Shortcut**。
2. 选择 **Shortcut Name** 并提供一个名称，例如 **Switch Tailscale user**。
3. 在右侧面板中选择 **Apps**。
4. 搜索或滚动找到 **Tailscale** 应用并选中它。
5. 把 **Get Status** 操作拖到快捷指令编辑器中。
6. 在右侧面板中搜索 **If** 操作，把 **If** 操作拖到快捷指令编辑器中，放在 **Get status** 语句下方。你也可以通过选择 **Categories**、**Scripting**，然后选择 **Control Flow** 来找到 **If** 操作。
7. 在 **If** 语句中，选择 **Status**，并选择 Tailscale 的 **Account Name** 变量。
8. 选择 **Condition**，选择 **Is**，然后选择 **Text**。输入一个用户账户，例如 `alice@example.com`。
9. 从右侧面板把 **Switch Account** 操作拖到快捷指令编辑器中，放在 **If** 语句下方、**Otherwise** 语句上方。
10. 在 **Switch account to** 语句中，选择 **account name**。值使用另一个用户账户，例如 `alice@gmail.com`。
11. 从右侧面板把另一个 **Switch Account** 操作拖到快捷指令编辑器中，放在 **Otherwise** 语句下方、**End if** 语句上方。
12. 编辑这条 **Switch account to** 语句，使其使用原始用户账户值 `alice@example.com`。
13. 选择快捷指令编辑器顶部的 **Run** 图标来测试你的快捷指令。

你可以在快捷指令应用的 **All Shortcuts** 文件夹中访问并运行你创建的快捷指令。你也可以把快捷指令添加到 **Menu Bar** 文件夹，使其显示在 macOS 任务栏中。

### 连接到你的 tailnet

本示例展示如何创建一个 [iOS 快捷指令][xt-ios-shortcuts]，当设备加入特定 Wi-Fi 网络时自动把设备连接到你的 tailnet。示例使用[连接][ar-connect]操作。

在本示例中，Wi-Fi 网络名称为 *PangoLAN*。

1. 打开 **Shortcuts 应用**，然后选择 **Automation**。
2. 选择 **＋**，然后选择 **Create Personal Automation**。
3. 在 **Wi-Fi** 类别中选择"PangoLAN"网络。
4. 选择 **Next**。
5. 选择 **Add Action**。
6. 在 **Tailscale** 应用组中选择 **Connect** 操作。
7. 选择 **Next**。
8. 选择 **Done**。

[ar-connect]: #连接

[ar-disconnect]: #断开连接

[ar-find-accounts]: #查找账户

[ar-find-devices]: #查找设备

[ar-get-status]: #获取状态

[ar-ping-devices]: #ping-设备

[ar-send-files]: #发送文件

[ar-set-tailscale-dns]: #设置-tailscale-dns

[ar-stop-using-exit-node]: #停止使用出口节点

[ar-switch-accounts]: #切换账户

[ar-toggle]: #切换

[ar-use-exit-node]: #使用出口节点

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-fast-user-switching]: /docs/features/client/fast-user-switching

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-taildrop]: /docs/features/taildrop

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-tailscale-ping]: /docs/reference/tailscale-cli#ping

[xt-ios-shortcuts]: https://support.apple.com/guide/shortcuts/welcome/ios

[xt-mac-shortcuts]: https://support.apple.com/guide/shortcuts-mac/welcome/mac
