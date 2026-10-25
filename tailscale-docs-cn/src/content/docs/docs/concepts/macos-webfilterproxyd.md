---
title: "macOS 屏幕使用时间与 Tailscale"
description: "排查 macOS 网页内容过滤器与 Tailscale 之间的冲突。"
---

最后验证于 Jan 5, 2026

本主题介绍 macOS 版 Tailscale 的 App Store 变体与 macOS 内置的屏幕使用时间（Screen Time）网页过滤器之间的不兼容问题。在使用屏幕使用时间内容限制时遇到 Tailscale 连接问题的用户，应了解这一冲突。

## 屏幕使用时间与 Tailscale 的问题

如果屏幕使用时间的网页过滤器处于启用状态，macOS 版 Tailscale 的 App Store 版本将无法正常工作。这是因为屏幕使用时间会监控并篡改网页流量，其中包括 Tailscale 正常运行所需的流量。

从 v1.70 开始，Tailscale 会检测到这一行为，并显示以下通知：

*（图：macOS 中的"Tailscale blocked by Screen Time"通知。）*

如果你使用的是较旧版本的 Tailscale 并启用了屏幕使用时间的网页过滤器，你会发现 Tailscale 无法连接。具体表现为：Tailscale 图标会一直显示加载动画，菜单界面中出现 **Loading Backend...**。Tailscale 日志中还会出现类似 `read tcp [::1]:51178->[::1]:10011: read: connection reset by peer` 的错误。

## 排查冲突

屏幕使用时间使用一个名为 `webfilterproxyd` 的进程来过滤网页流量。要判断 `webfilterproxyd` 是否正在运行并可能导致 Tailscale 出现问题：

1. 在 Mac 上依次选择 **Applications**（应用程序）和 **Utilities**（实用工具），打开 **Activity Monitor**（活动监视器）应用。

2. 依次进入 **View**（显示）和 **All Processes**（所有进程），确保显示了属于 `root` 用户的进程。

3. 在搜索框中输入 `webfilterproxyd`。如果正在运行的进程列表中出现 `webfilterproxyd`，说明屏幕使用时间的网页过滤器处于启用状态，可能与 Tailscale 冲突。

你也可以在终端（Terminal）应用中输入 `ps aux | grep "[w]ebfilterproxyd"`。如果出现条目，说明网页过滤器处于启用状态。

## `webfilterproxyd` 正在运行时的应对选项

你有两个选择：

* 尝试禁用屏幕使用时间的网页过滤器，或完全停用屏幕使用时间。
* 切换到 macOS 版 Tailscale 的 [Standalone 变体][docs-macos-variants]（在 App Store 之外分发），它不受此问题影响。Standalone 变体需要你 Mac 上的管理员权限。为避免冲突，安装 Standalone 变体前请务必卸载 Mac App Store 变体。

## 停用屏幕使用时间

要在系统设置（System Settings）应用中停用屏幕使用时间，请按以下步骤操作，然后重启 Mac：

1. 打开 Mac 上的 **System Settings**（系统设置）应用。
2. 在侧边栏中选择 **Screen Time**（屏幕使用时间）。
3. 选择 **Restrictions**（限制），然后选择 **Content & Privacy**（内容与隐私）。
4. 选择 **Store, Web, Siri & Game Center Content**（商店、网页、Siri 与游戏中心内容）。
5. 在 **Safari** 部分中，确保 **Access to Web Content**（网页内容访问权限）设置为 **Unrestricted Access**（不受限制）。
6. 重启 Mac 以完全应用新设置。

> **注意：**
>
> 停用屏幕使用时间后必须重启 Mac。我们在测试中观察到，macOS 在 Mac 重启之前不会终止 `webfilterproxyd` 进程。这似乎是 macOS 的一个 bug。

### 识别被强制启用的网页过滤器

如果按上述步骤操作并重启 Mac 后，`webfilterproxyd` 仍在运行，那么你的 Mac 上可能安装了强制启用网页过滤器的配置描述文件。这与屏幕使用时间是否启用无关，在使用 MDM 方案进行组织化管理的 Mac 上尤为常见。

要找出强制启用 `webfilterproxyd` 的配置描述文件，请按以下步骤操作：

1. 打开 Mac 上的 **Terminal**（终端）应用。
2. 输入 `system_profiler SPManagedClientDataType` 并按回车。
3. 滚动查看输出，检查是否有标题为 `com.apple.familycontrols.contentfilter` 且 `restrictWeb` 或 `useContentFilter` 属性被设为 `1`（启用）的条目。

如果输出中包含 `com.apple.familycontrols.contentfilter` 的条目，说明你的管理员已在你的 Mac 上配置了网页过滤器。你应请管理员将其禁用。你无法自行禁用该网页过滤器，Tailscale 支持团队也无法在这件事上提供帮助。

[docs-macos-variants]: /docs/concepts/macos-variants
