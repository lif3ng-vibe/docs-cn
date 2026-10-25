---
title: "使用设备身份收集"
description: "设备身份收集（Device Identity Collection）会从 Tailscale 网络（即 tailnet）中的设备收集序列号、MAC 地址等标识符。CrowdStrike Falcon 等"
---

最后验证于 Jan 5, 2026

> **注意：** 设备身份收集适用于[所有套餐](https://tailscale.com/pricing)。

设备身份收集（Device Identity Collection）会从 Tailscale 网络（即 tailnet）中的设备收集序列号、MAC 地址等标识符。它对于 [CrowdStrike Falcon][docs-crowdstrike-zta] 等设备态势集成是必需的，也可用于在 Tailscale 与其他系统之间关联你的设备。

本文档提供以下操作说明：

* 如何为你的 tailnet 启用设备身份收集。
* 如何为 tailnet 中的机器启用设备身份收集。

## 前提条件

要配置 tailnet 中的机器，你需要满足以下任一条件：

* 能访问机器并运行 `tailscale` CLI；或
* 一个移动设备管理（MDM）系统。

## 为你的 tailnet 启用设备身份收集

1. 打开 Tailscale 管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。
2. 在 **Device Posture Integrations** 区域下，切换 **Device Identity Collection** 下方的开关。

*（图：Device Identity Collection：开关为 disabled 状态。）*

## 为 tailnet 中的设备启用设备身份收集

tailnet 中的设备需要逐台选择加入身份上报。

> **注意：**
>
> 设备身份收集功能在 Tailscale 1.52 中加入。

让设备选择加入身份上报有两种方式：设置系统策略（例如通过 MDM），或使用 CLI。

### 通过系统策略启用设备身份收集

你可以通过[将策略键][docs-mdm-keys] `PostureChecking` 设为 `always`，让设备选择加入身份上报。这种方式可以借助 MDM 或配置管理系统为设备启用。注意，Tailscale 客户端需要重启才能使更改生效。有关设置系统策略的更多信息，参见[使用系统策略自定义 Tailscale][docs-mdm-keys]。

在 macOS 和 Windows 上，推荐使用系统策略来启用设备身份收集。它的优先级高于通过 CLI 设置的配置。

### 通过 CLI 启用设备身份收集

你也可以在设备上运行 [`tailscale set`][docs-cli-set] CLI 命令，然后重新连接客户端，使设备选择加入：

#### Linux

```shell
sudo tailscale set --posture-checking=true
sudo tailscale down
sudo tailscale up
```

#### macOS

```shell
tailscale set --posture-checking=true
tailscale down
tailscale up
```

或者

```shell
/Applications/Tailscale.app/Contents/MacOS/Tailscale set --posture-checking=true
/Applications/Tailscale.app/Contents/MacOS/Tailscale down
/Applications/Tailscale.app/Contents/MacOS/Tailscale up
```

要在 macOS 上使用 `tailscale` CLI，参见 [CLI 指南][docs-cli]。

#### Windows

```powershell
tailscale set --posture-checking=true
tailscale down
tailscale up
```

对 Linux 设备而言，CLI 命令是让其选择加入身份收集的唯一方式。

## 查看收集进度

在 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Device Posture** 区域，你可以看到序列号收集情况的摘要。

你可以选择 **Inspect** 查看哪些机器处于特定状态，例如找出尚未选择加入的机器。

*（图：Device Identity Collection：开关为 enabled 状态。582 台设备中已有 22 台选择加入。21 台返回了序列号（inspect 链接）。1 台只返回了无效序列号（inspect 链接）。196 台未启用态势收集（inspect 链接）。364 台尚待检查（inspect 链接）。在审计日志中监控设备身份的变化。）*

## 查看设备标识符

你可以在管理控制台的 **Machine page** 上查看设备的标识符。

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 选择要查看的机器。
3. 在 **Machine Details** 区域查看设备身份与收集状态。

*（图：Machine details：Serial number（序列号）：IB2HQE3XWO）*

设备身份也可以通过[设备 API][co-api-get-device] 获取。

默认情况下，设备身份收集会获取设备序列号。部分态势集成（如 [CrowdStrike Falcon][docs-crowdstrike-zta]）还可以使用 MAC 地址进行设备匹配，如果此类集成需要，也会一并收集。

## 限制

* 在 iOS、tvOS 和 Android 上，Tailscale 等第三方应用无法访问设备序列号。在 iOS 或 tvOS 上，MDM 方案可以通过 `DeviceSerialNumber` [MDM 键][docs-mdm-keys-sn]向 Tailscale 客户端提供序列号。

[co-api-get-device]: https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli]: /docs/reference/tailscale-cli

[docs-crowdstrike-zta]: /docs/integrations/crowdstrike-zta

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-keys-sn]: /docs/features/tailscale-system-policies#指定设备序列号
