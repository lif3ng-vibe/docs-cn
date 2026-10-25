---
title: "在 Android 上使用基于应用的拆分隧道"
description: "基于应用的拆分隧道是 Android 版 Tailscale 客户端中的一项功能，可让你自行决定 Android 设备上的哪些应用绕开、或强制使用 Tailscale 网络（即 tailnet）。"
---

最后验证于 Jan 5, 2026

基于应用的拆分隧道（app-based split tunneling）是 Android 版 Tailscale 客户端中的一项功能，可让你自行决定 Android 设备上的哪些应用绕开、或强制经由 Tailscale 网络（即 tailnet）。它让你能按应用为单位灵活掌控网络流量。使用基于应用的拆分隧道纳入或排除某个应用后，流量路由和 DNS 转发都会按你设定的规则进行配置。

> **注意：**
>
> Android 上的基于应用的拆分隧道要求 Tailscale v1.70 或更高版本。

以下是一些你可能希望让某些应用绕开 Tailscale 的场景：

* 使用 Netflix、Prime Video 等流媒体应用时，避免因使用[出口节点][docs-exit-nodes]而可能触发的地区屏蔽限制。
* 银行类应用要求先禁用 VPN 连接，然后才能使用该应用。

## 基于应用的拆分隧道的类型

可用的基于应用的拆分隧道行为有两种：

* 自动路由所有应用，并手动指定要排除、不使用 Tailscale 的应用。这是默认行为。
* 不自动路由任何应用，而是指定一组强制使用 Tailscale 的应用。此选项需要面向 Android 设备的[移动设备管理][docs-mdm]（MDM）方案。

## 在客户端中排除应用

你可以直接在应用设置中配置基于应用的拆分隧道排除项。在 Tailscale 应用设置中被选为排除的应用将直接访问互联网，不经过 Tailscale 路由。这对因性能或功能原因需要直接访问互联网的应用很有用。当某个应用通过拆分隧道被停用 Tailscale 后，它的流量和 DNS 查询都不会再由 Tailscale 处理。

1. 在 Android 设备上打开 Tailscale 应用，并确认它已连接到你的 tailnet。
2. 点按屏幕顶部的头像，选择 **基于应用的拆分隧道**（App-based split tunneling）。
3. 在显示 Android 设备上已安装应用的列表中，勾选要排除在 tailnet 之外的每个应用旁边的复选框。这些应用将直接访问互联网；未勾选的应用将继续使用 Tailscale。
4. 离开 **Settings**（设置）页面即可保存你的配置。

## 使用 MDM 强制或排除应用

如果你是为 Android 部署 Tailscale 的系统管理员，可以指定哪些应用允许、哪些应用禁止通过你的 tailnet 通信。

要允许特定应用在你的 tailnet 中通信，请使用 [`IncludedPackageNames` 系统策略][docs-mdm-keys-included-package-names]。使用该策略指定应用包名列表后，Tailscale 会排除所有应用，只有指定的应用才使用 Tailscale。从 Tailscale v1.70 起，此行为必须通过系统策略配置，也就是需要用 MDM 来管理。更多信息请参阅 [Tailscale 系统策略列表][docs-mdm-keys]。

要排除特定应用、不让其在你的 tailnet 中通信，请通过你的 [MDM 方案][docs-mdm]使用 [`ExcludedPackageNames` 系统策略][docs-mdm-keys-excluded-package-names]。

## 默认排除的应用

为了带来良好的开箱即用体验，有一小部分应用和系统服务始终不经过 Tailscale 的路由和 DNS。这些应用在启用 VPN 时无法正常工作，因此默认被排除：

* Android Auto（`com.google.android.projection.gearhead`）
* Google Chromecast（`com.google.android.apps.chromecast.app`）
* GoPro（`com.gopro.smarty`）
* RCS/Jibe 消息服务（`com.google.android.apps.messaging`）
* Sonos（`com.sonos.acr` 和 `com.sonos.acr2`）

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-mdm]: /docs/mdm

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-keys-excluded-package-names]: /docs/features/tailscale-system-policies#设置排除的应用

[docs-mdm-keys-included-package-names]: /docs/features/tailscale-system-policies#设置包含的应用
