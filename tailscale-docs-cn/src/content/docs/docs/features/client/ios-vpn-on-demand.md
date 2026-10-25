---
title: "在 iOS 和 macOS 上使用 VPN On Demand"
description: "VPN On Demand 是 iOS 和 macOS 上的 VPN 提供商可以采用的一项功能，用来自动建立 VPN 连接。使用 VPN On Demand 后，你的设备可以按照多种条件自动启动或停止 Tailscale VPN 隧道。"
---

最后验证于 Jan 5, 2026

> **注意：**
>
> VPN On Demand 目前仅在 iOS 和 macOS 版 Tailscale 客户端中可用。
>
> iOS 版 Tailscale 1.48 是首个支持此功能的 Tailscale 客户端版本。macOS 支持自 Tailscale 1.60 起加入。

VPN On Demand 是一项可供 iOS 和 macOS 上的 VPN 提供商采用的功能，用于自动建立 VPN 连接。使用 VPN On Demand 后，你的设备可以基于多种条件自动启动或停止 Tailscale VPN 隧道。

例如，你可以创建一个 VPN On Demand 配置：当 iPhone 离开你的 Wi-Fi 网络时自动连接 Tailscale，回到 Wi-Fi 覆盖范围内后自动断开。

*（图：iOS 中的 VPN On Demand 设置。针对 "Wi-Fi" 的 "Connect automatically on" 选择了 "Only On"。）*

> **注意：**
>
> 在 Tailscale 处于启用状态期间，Tailscale 客户端会自动配置一条宽泛的 VPN On Demand 策略，以确保在系统重启、自动更新、崩溃或其他可能禁用 VPN 的事件发生后 VPN 仍然保持活跃。当用户停用 Tailscale 时，这条自动生成的配置会被移除。创建自定义的 VPN On Demand 规则会停用此行为，改为遵循用户偏好的配置。

## 设置 VPN On Demand

要设置 VPN On Demand：

#### iOS

1. 在 iOS 设备上打开 Tailscale 应用。
2. 登录后，点按右上角的个人头像打开设置。
3. 点按 **VPN On Demand**。如果看不到这一项，可能是你的系统管理员隐藏了 VPN On Demand 设置，也可能你运行的是较旧版本的 Tailscale 客户端。你应该从 App Store 更新到较新版本。
4. 现在你可以启用 VPN On Demand，并按照下面的说明设置你的规则集。

#### macOS

1. 在 Mac 上选择菜单栏中的 Tailscale 图标，然后选择 **设置…**（Settings…）。
2. **VPN On Demand** 会作为其中一项出现。选择 **管理…**（Manage…）打开 On Demand 设置面板。如果看不到这一项，可能是你的系统管理员隐藏了 VPN On Demand 设置，也可能你运行的是较旧版本的 Tailscale 客户端。你应该从 App Store 更新到较新版本。
3. 现在你可以启用 VPN On Demand，并按照下面的说明设置你的规则集。

### 选择连接规则

可以为设备上的 Wi-Fi、蜂窝网络（Cellular）和以太网接口设置连接规则。

对于 Wi-Fi 接口，可以从以下选项中选择：

* **Always**（始终）：只要有活动的 Wi-Fi 连接，Tailscale 就始终连接。
* **Only On**（仅限指定网络）：只要有活动的 Wi-Fi 连接，Tailscale 就始终连接，前提是当前 Wi-Fi 网络已包含在配置中。如果当前 Wi-Fi 网络不在已包含网络列表中，Tailscale 会断开。
* **Except On**（指定网络除外）：只要有活动的 Wi-Fi 连接，Tailscale 就始终连接；但如果当前 Wi-Fi 网络在除外网络列表中，则会断开。
* **Never**（从不）：只要有活动的 Wi-Fi 连接，Tailscale 就始终断开。
* **Do Nothing**（不执行任何操作）：Tailscale 不会自动连接或断开，由你手动管理 VPN 状态。

对于蜂窝网络和以太网接口，可以从以下选项中选择：

* **Always**（始终）：建立蜂窝数据或以太网连接时，Tailscale 始终连接。
* **Never**（从不）：建立蜂窝数据或以太网连接时，Tailscale 始终断开。
* **Do Nothing**（不执行任何操作）：Tailscale 不会自动连接或断开，由你手动管理 VPN 状态。

### 使用 MagicDNS 主机名匹配

你还可以使用 VPN On Demand，在 iOS 或 macOS 检测到正在连接以 `*.ts.net` 结尾的主机名时自动连接 Tailscale。此功能仅在某个接口的连接规则设置为 **Do Nothing**（不执行任何操作）时可用。当任何其他规则生效时，MagicDNS 匹配将不可用。

## 局限性

VPN On Demand 规则可以决定是否允许 Tailscale 应用在你的设备上建立 VPN；如果规则设置不正确，可能会阻止 Tailscale 连接。

例如，如果某个接口的规则设置为 **Never**（从不），iOS/macOS 会断开 Tailscale。如果你尝试手动重新连接，iOS/macOS 会立即再次断开 VPN。要摆脱这种状态，你必须调整连接规则以允许连接，或完全禁用 VPN On Demand。

如果你遇到任何问题或有功能改进建议，请[提交 GitHub issue][xt-gh-tailscale-issues]。

### 与其他 VPN 共用

在 iOS 和 macOS 上，任一时刻只能有一个 VPN 应用启用 On Demand。如果在 Tailscale 启用了 On Demand 的情况下连接任何其他 VPN，iOS/macOS 会解除 Tailscale 的 On Demand，直到你手动重新连接 Tailscale。关于将其他 VPN 与 Tailscale 共用的更多信息，请参阅[此条目][docs-other-vpns]。

### 企业 MDM 部署

可以将 VPN On Demand 与受管理的 VPN 描述文件（managed VPN profile）一起应用，但这样做有一些副作用。安装受管理的 VPN 描述文件后，用户和 Tailscale 客户端都无法更改 VPN On Demand 设置；当用户想停用 Tailscale 时，这可能带来问题。例如，策略同时强制使用出口节点，而用户所在网络封锁了出口节点 IP，或用户需要完成强制门户（captive portal）认证页面的情况。

对于[受管理的部署][docs-mdm-mac-vpn]，我们建议使用 `AlwaysOn.Enabled`、`AlwaysOn.OverrideWithReason` 和 `ReconnectAfter` 这些 MDM 策略，而不是受管理的 VPN 描述文件。这样 Tailscale 客户端可以设置临时的 VPN On Demand 策略来确保 VPN 保持活跃，同时允许用户在需要时临时将其停用。

这些 Tailscale 策略不能与受管理的 VPN 描述文件同时使用。

[docs-mdm-mac-vpn]: /docs/integrations/mdm/mac#使用-mdm-部署-vpn-on-demand-配置

[docs-other-vpns]: /docs/reference/faq/other-vpns

[xt-gh-tailscale-issues]: https://github.com/tailscale/tailscale/issues
