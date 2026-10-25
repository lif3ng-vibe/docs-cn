---
title: "使用出口节点"
description: "[Exit Nodes | Tailscale Explained（视频）](https://www.youtube.com/watch?v=Ad7D2pkFNdA)"
---

最后验证于 Sep 19, 2025

> **注意：**
>
> 本主题是在 tailnet 中配置出口节点的快速指南。更详细的信息参见[出口节点][docs-exit-nodes]。

> **注意：**
>
> 以下相关视频提供了更多背景说明与示例。

[Exit Nodes | Tailscale Explained（视频）](https://www.youtube.com/watch?v=Ad7D2pkFNdA)

## 将设备宣告为出口节点

要将 tailnet 设备用作出口节点，选择一个操作系统并完成相应步骤。

#### Linux

1. [下载并安装][docs-install-linux] Tailscale 客户端。

2. 在设备上打开一个终端会话，并启用 IP 转发。

   \[缺少代码片段：EnableIPForwarding.mdx]

3. 在终端会话中，将设备宣告为出口节点。

   ```shell
   sudo tailscale set --advertise-exit-node
   ```

4. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。

5. 在列表中找到该设备。它应显示 **Exit Node** 徽标。

6. 选择该设备的菜单，然后选择 **Edit exit node**。

7. 勾选 **Use as exit node** 复选框，然后选择 **Save**。

#### macOS

1. [下载并安装][docs-install-macos] Tailscale 客户端。
2. 打开设备上安装的 Tailscale 客户端，选择 **Exit Node**，然后选择 **Run Exit Node**。
3. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Exit Node** 徽标。
4. 选择该设备的菜单，然后选择 **Edit exit node**。
5. 勾选 **Use as exit node** 复选框，然后选择 **Save**。

#### Windows

1. [下载并安装][docs-install-windows] Tailscale 客户端。
2. 打开设备上安装的 Tailscale 客户端，选择 **Exit Node**，然后选择 **Run as exit node**。
3. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Exit Node** 徽标。
4. 选择该设备的菜单，然后选择 **Edit exit node**。
5. 勾选 **Use as exit node** 复选框，然后选择 **Save**。

#### tvOS

1. [下载并安装][docs-install-tvos] Tailscale 客户端。
2. 在 Apple TV 上打开 Tailscale 应用，进入 **Exit Node** 区域，依次选择 **None**、**Run Exit Node**，然后确认更改。
3. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Exit Node** 徽标。
4. 选择该设备的菜单，然后选择 **Edit exit node**。
5. 勾选 **Use as exit node** 复选框，然后选择 **Save**。

#### iOS

1. [下载并安装][docs-install-ios] Tailscale 客户端。
2. 在 iPhone 上打开 Tailscale 应用，进入 **Exit Node** 区域，选择 **Run Exit Node**，然后确认更改。
3. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Exit Node** 徽标。
4. 选择该设备的菜单，然后选择 **Edit exit node**。
5. 勾选 **Use as exit node** 复选框，然后选择 **Save**。

#### Android

1. [下载并安装][docs-install-android] Tailscale 客户端。
2. 在设备上打开 Tailscale 应用，依次点按 **Exit Node**、**Run as exit node**。
3. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到该设备。它应显示 **Exit Node** 徽标。
4. 选择该设备的菜单，然后选择 **Edit exit node**。
5. 勾选 **Use as exit node** 复选框，然后选择 **Save**。

## 授予使用出口节点的权限

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

## 使用出口节点

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

运行带 `--exit-node=` 标志的 `tailscale set`，传入出口节点的 Tailscale `100.x.y.z` IP 地址。

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

你可以从系统托盘菜单使用出口节点。选择 Tailscale 图标，然后选择 **Use exit node**。接着选择要使用的出口节点的机器名。

如果你希望在流量经由出口节点路由时允许直接访问本地网络，选择 **Allow local network access**。

要关闭经由出口节点路由，在 **Exit Node** 下拉框中选择 **None**。

[docs-acls]: /docs/features/access-control/acls

[docs-appletv-use-exit-node]: /docs/install/appletv#使用设备出口节点

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-grants-allow-all]: /docs/reference/examples/grants#allow-all

[docs-grants-allow-exit-nodes]: /docs/reference/examples/grants#允许使用出口节点

[docs-install-android]: /docs/install/android

[docs-install-ios]: /docs/install/ios

[docs-install-linux]: /docs/install/linux

[docs-install-macos]: /docs/install/mac

[docs-install-tvos]: /docs/install/appletv#在-tvos-上安装-tailscale

[docs-install-windows]: /docs/install/windows
