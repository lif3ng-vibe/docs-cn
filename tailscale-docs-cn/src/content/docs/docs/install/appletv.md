---
title: "在 Apple TV 上安装 Tailscale"
description: "在 Apple TV 上安装 Tailscale 客户端。"
---

最后验证于 Jan 5, 2026

你可以将 [Apple TV][xt-apple-appletv] 添加到 Tailscale 网络（即 tailnet），以便远程访问媒体服务器内容、让 Apple TV 的流量经由[出口节点][docs-exit-nodes]转发，或将 Apple TV 宣告为出口节点。

## 前提条件

* 运行 tvOS 17.0 或更高版本的 Apple TV，建议使用 18.0 或更高版本。
* 确认 [Apple TV 已配置为家庭中枢][xt-apple-docs-homehub]（home hub）。
* 已有一个[现成的 tailnet][docs-install]，用于将 Apple TV 与你的其他设备相连。

## 在 tvOS 上安装 Tailscale

1. 在 Apple TV 上打开 tvOS，选择 App Store 图标。

2. 搜索 Tailscale 应用并选择**获取**（Get）。系统可能提示你输入 Apple ID 密码进行确认。

3. 在 tvOS 上打开 Tailscale 应用。在 **Welcome to Tailscale for tvOS** 页面中，选择**安装 VPN 配置**（Install VPN Configuration），然后选择**允许**（Allow）。

4. 在 Tailscale 应用界面中，选择**连接**（Connect）。

5. 使用以下任一方法对 Apple TV 进行认证，将其加入你的 tailnet：

   1. （推荐）扫描二维码以授权 Apple TV 加入你的 tailnet。你也可以将该 URL 输入手机或电脑等设备的浏览器。如果你的设备尚未通过 tailnet 认证，系统可能会提示你先登录。

   2. 用 iPhone 或 iPad 打开 Tailscale 管理控制台并[生成认证密钥（auth key）][docs-auth-keys-generate]，然后将该认证密钥复制到设备上。在 [Apple TV Remote][xt-appletv-remote] 应用中，选择**使用认证密钥**（Use an auth key），粘贴密钥，然后选择**登录**（Log in）。

> **注意：**
>
> 如果启用了[设备审批][docs-device-approval]，在管理员批准该设备之前，Apple TV 将无法在 tailnet 中访问。

连接到 tailnet 后，Apple TV 上的 Tailscale 应用会显示应用界面、可用选项和设备信息。另外请注意，你的 Apple TV 会显示在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中。

## 访问远程媒体服务器

如果你现有的 tailnet 中有 [Plex][xt-apple-plex]、[Channels][xt-getchannels] 或 [JellyFin][xt-jellyfin-docs] 等媒体服务器，就可以从 Apple TV 访问其中的内容。以下步骤假设 Tailscale 应用已安装并配置完成。

1. 在 Apple TV 上打开 Tailscale 应用，选择**我的其他设备**（My Other Devices）。
2. 找到 tailnet 中媒体服务器的名称（例如 `jellyfin`）。
3. 找到 tailnet 的 DNS 名称。它显示在 Tailscale 应用主页以及管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面中（例如 `pangolin.ts.net`）。
4. 在 tvOS 上打开媒体服务器应用。当提示输入媒体服务器地址时，输入媒体服务器名称与 tailnet DNS 名称的组合（例如 `jellyfin.pangolin.ts.net`）。

媒体服务器可能还需要额外配置。有关在 Apple TV 上配置媒体服务器应用的更多信息，请查阅你所使用应用的相应文档。

## 使用设备出口节点

你可以让 Apple TV 通过 tailnet 中的设备出口节点转发流量。如果你希望 Apple TV 看起来像是从出口节点所在的地理位置接入互联网，这一功能会很有用。

1. 在 Apple TV 上打开 Tailscale 应用。
2. 在**出口节点**（Exit Node）部分，选择想要用来转发流量的出口节点。

当 Apple TV 使用其他设备作为出口节点时，生效的出口节点连接会显示为蓝色。

## 使用 Mullvad 出口节点

> **注意：**
>
> 只有当你的 tailnet 已购买 [Mullvad 出口节点][docs-mullvad-exit-nodes-use]时，此选项才会在 tvOS 版 Tailscale 应用中可用。

你可以让 Apple TV 的流量经由 tailnet 中的 Mullvad 出口节点转发。这样你可以按地理位置指定出口节点，而不必选择 tailnet 中被指定为出口节点的设备。

1. 在 Apple TV 上打开 Tailscale 应用。
2. 打开**出口节点**（Exit Node）部分，然后选择 **Location Based Exit Nodes** > **Location Based**。
3. 选择你想使用的 Mullvad 出口节点。

当 Apple TV 使用 Mullvad 出口节点时，Tailscale 应用中生效的出口节点连接会显示为蓝色。

## 将 Apple TV 宣告为出口节点

你可以将 Apple TV 用作出口节点，并配置 tailnet 中的其他设备让其流量经由 Apple TV 转发。如果你外出时想让流量经由家中的互联网连接转发，这一功能会很有用。

1. 在 Apple TV 上打开 Tailscale 应用。
2. 打开**出口节点**（Exit Node）部分，选择**无**（None）。
3. 选择**作为出口节点运行**（Run as Exit Node）并确认。
4. 在网页浏览器中打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
5. 在列表中找到 Apple TV，选择其中的按钮，然后选择**设置出口节点**（Set up exit node）。打开**用作出口节点**（Use as exit node）开关以启用。

当 Apple TV 被用作出口节点时：

* 生效的出口节点连接会显示为橙色。
* Apple TV 设备会显示在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中，并带有**出口节点**（Exit Node）徽标。

## 将 Apple TV 宣告为子网路由器

如果你想让 Apple TV 在 tailnet 中充当[子网路由器][docs-subnets]，请按照以下步骤操作。这样你可以远程访问家庭网络中可能未安装 Tailscale 的资源，例如打印机。

1. 在 Apple TV 上打开 Tailscale 应用，选择**子网路由器**（Subnet Router）。
2. 选择**宣告新路由**（Advertise New Route）。界面上会显示一个占位的 IP 地址与子网掩码（CIDR）组合 `192.168.1.0/24`。你可以接受这个默认路由、编辑该路由，也可以添加多条要宣告的路由。

添加或编辑宣告的路由时，必须使用正确的 CIDR 格式，例如 `192.168.1.0/24`。

## 将 Apple TV 与 tailnet 断开连接

1. 在 Apple TV 上打开 Tailscale 应用。
2. 在屏幕顶部 tailnet 名称旁边，选择**断开连接**（Disconnect）。

## 停止使用其他设备作为出口节点

按照以下步骤，可以让 Apple TV 停止使用 tailnet 设备出口节点或 Mullvad 基于位置的出口节点。

1. 在 Apple TV 上打开 Tailscale 应用。
2. 在**出口节点**（Exit Node）部分，选择当前所用出口节点旁边的**停用**（Disable）。

停用的出口节点仍会以**已停用**（Disabled）的形式显示在屏幕顶部。如果你不想让它继续显示在那里，请选择**无**（None），该出口节点就会移回**我 tailnet 中的出口节点**（Exit Nodes In My Tailnet）部分。

## 停止将 Apple TV 用作出口节点

如果你想让 Apple TV 停止在 tailnet 中充当出口节点，请按照以下步骤操作。

1. 在 Apple TV 上打开 Tailscale 应用。
2. 在**出口节点**（Exit Node）部分，在列表中选择你的 Apple TV 即可完全关闭该设备的出口节点功能，也可以选择另一个出口节点来代替。
   * 如果你选择的是 Apple TV 且不再想让该设备使用出口节点，请选择**停用**（Disable）。
   * 如果你选择其他出口节点来代替 Apple TV，请选择**停止用作出口节点**（Stop using as exit node）。

## 测试设备延迟

你可以使用 Tailscale 应用中的 ping 功能，测试 Apple TV 与 tailnet 中其他设备之间的延迟（连接响应时间）。

1. 在 Apple TV 上打开 Tailscale 应用。
2. 选择**我的其他设备**（My Other Devices）。
3. 选择一台当前已连接到 tailnet 的设备并选中它。界面会自动显示一张图表，其中包含以下信息：

   * 你正在 ping 的设备的名称。
   * 该设备的 ping 响应时间（毫秒）。
   * 该设备的连接类型。通常你会先看到连接经由 [DERP 服务器][docs-derp-servers]中继，随后切换为通过 tailnet 与该设备的直连，这才是理想的[连接类型][docs-connection-type]。

## 故障排除

无法访问 Apple TV 最常见的原因是它已进入睡眠状态，且未被配置为家庭中枢（home hub）——家庭中枢能让 Apple TV 在睡眠期间保持网络连接。通常情况下，Apple TV 在初始设置时会自动配置为家庭中枢。但在以下情况下，该功能可能被停用：

* Apple TV 被移动到了其他物理位置。
* 网络发生了重大配置变更。
* tvOS 版本为 17。如果你仍在运行 tvOS 17，家中的设备会根据性能和设备可用性自动选择家庭中枢，这意味着你的 Apple TV 可能不会被自动配置为家庭中枢。要查看 Apple TV 上安装的 tvOS 版本，请打开设置应用，选择 **System > Software Updates**，即可看到版本信息。

更多信息请参阅 Apple 的主题文档：[将 HomePod、HomePod mini、Apple TV 或 iPad 设置为家庭中枢][xt-apple-docs-homehub]。

### 将 Apple TV 配置为家庭中枢

在 tvOS 18 及更高版本上手动将 Apple TV 配置为家庭中枢：

1. 在 Apple TV 上打开 tvOS，进入**设置**（Settings）。
2. 依次选择**用户与账户**（Users and Accounts）和**默认用户**（Default User），确认 tvOS 已登录 iCloud 账户，并检查 **iCloud** 字段中是否包含账户信息。
3. 在**设置**主菜单中进入 **AirPlay 和 HomeKit**，选择 **HomeKit** 字段，为 Apple TV 指定一个房间名称。这样它会自动被指定为家庭中枢。

### 验证 Apple TV 家庭中枢状态

有多种方法可以验证 Apple TV 是否已配置为家庭中枢。

* 让 Apple TV 进入睡眠状态，然后执行以下任一操作：
  * 在一台 iOS 或 Android 的 tailnet 设备上打开 Tailscale 应用，在设备列表中点按该 Apple TV，然后选择 **Ping** 选项。屏幕会显示 ping 响应信息。
  * 如果该 Apple TV 已配置为出口节点，可以用 tailnet 中的另一台设备验证是否仍能连接到这台 Apple TV 出口节点。
* 在 iOS 设备上打开家庭（Home）应用，进入**设置**，选择**家庭中枢与网桥**（Home Hubs & Bridges），查看其中是否有该 Apple TV。

如果以上方法都不奏效，请尝试重启 tvOS 后再次验证。

[docs-auth-keys-generate]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-connection-type]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-install]: /docs/how-to/quickstart

[docs-mullvad-exit-nodes-use]: /docs/features/exit-nodes/mullvad-exit-nodes#使用-mullvad-出口节点

[docs-subnets]: /docs/features/subnet-routers

[xt-apple-appletv]: https://www.apple.com/tv-home

[xt-apple-docs-homehub]: https://support.apple.com/HT207057

[xt-apple-plex]: https://apps.apple.com/app/plex-stream-live-tv-channels/id383457673

[xt-appletv-remote]: https://support.apple.com/108778

[xt-getchannels]: https://getchannels.com

[xt-jellyfin-docs]: https://jellyfin.org/docs
