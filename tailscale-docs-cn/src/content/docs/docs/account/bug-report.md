---
title: "生成 bug 报告"
description: "生成 bug 报告，帮助排查你的 tailnet 出现的问题。"
---

最后验证于 Jan 5, 2026

Tailscale 支持团队可以根据诊断日志帮你排查某些问题。如果你正在与支持团队一起排查某个问题，对方可能会请你创建一个 bug 报告。bug 报告是一个随机标识符，用于标记诊断日志中的某一段，让我们能更清楚地了解特定时间点发生了什么，从而更容易分诊（triage）。

要生成 bug 报告，你必须直接在该设备上操作——无法远程生成 bug 报告。

bug 报告看起来像这样：

```shell
BUG-1b7641a16971a9cd75822c0ed8043fee70ae88cf05c52981dc220eb96a5c49a8-20210427151443Z-fbcd4fd3a4b7ad94
```

bug 报告标识符不包含任何个人身份信息，而且除非你把 bug 报告分享给我们的团队，否则它不会被使用。你可以使用 Tailscale 客户端应用，或 [Tailscale CLI][docs-cli] 中的 [`bugreport`][docs-cli-bugreport] 命令来生成 bug 报告。

生成 bug 报告后，复制并粘贴得到的值，以便你在[联系支持团队][co-contact-support-form]时提供。

## 使用客户端应用生成 bug 报告

#### macOS

有两种方式可以向我们发送信息以帮助解决问题。

你可以复制一个 bug 报告标识符字符串，Tailscale 支持团队可以用它来诊断一般的连接问题。要生成 bug 报告标识符：

1. 选择菜单栏中的 Tailscale 图标。
2. 依次选择 **Settings**、**About**，然后选择 **Report an Issue**。
3. 复制该 bug 报告标识符字符串，并粘贴到你与 Tailscale 支持团队的沟通内容中。

Tailscale 支持团队还可能请你生成包含更深入信息的配置报告（configuration report）。要生成并导出配置报告：

1. 选择菜单栏中的 Tailscale 图标。
2. 依次选择 **Settings**、**About**，然后选择 **Report an Issue**。
3. 选择 **Export Configuration Report**。
4. 报告生成完成后，保存该报告的文件夹会在 Finder 中打开。将其复制并粘贴到你与 Tailscale 支持团队的沟通内容中。

配置报告是一个 `tar.gz` 文件，包含在你的 Mac 上由各种诊断工具（如 `netstat`、`ifconfig`、`lsappinfo` 和 `systemextensionsctl`）收集的信息。与支持团队分享这份报告可以加快排查速度，因为它能让他们详细看到可能导致问题的原因。

> **注意：**
>
> 由于许多 Tailscale 问题源于与 Mac 上已安装的其他软件冲突，报告还会包括已安装的第三方应用和系统/内核扩展的列表。虽然 Tailscale 支持团队会尽力谨慎处理你的个人信息，但建议你在发送前自行检查配置报告，确保没有意外泄露任何敏感信息。

#### Windows

1. 按住 `CTRL` 键并右键点击菜单栏中的 Tailscale 图标。
2. 选择 **Debug**，然后选择 **Bug report**。
3. 选择 **Copy report ID** 复制该 bug 报告，并粘贴到你与 Tailscale 支持团队的沟通内容中。

#### Android

1. 在应用菜单中选择 **Bug report**。
2. 点击剪贴板图标复制 bug 报告 ID，并粘贴到你与 Tailscale 支持团队的沟通内容中。

#### iOS

1. 在应用的 Settings 菜单中点击 **Bug Report**。
2. 点击剪贴板图标复制 bug 报告 ID，并粘贴到你与 Tailscale 支持团队的沟通内容中。

#### tvOS

1. 在应用主屏幕向下滚动，选择 **About Tailscale for tvOS**。
2. 选择 **Report an Issue**。
3. 记下 bug 报告标识符，或用手机扫描二维码，并粘贴到你与 Tailscale 支持团队的沟通内容中。

## 使用 CLI 生成 bug 报告

[Tailscale CLI][docs-cli] 仅支持 Linux（包括 Synology 和 QNAP）、macOS 和 Windows。

运行 [`bugreport`][docs-cli-bugreport] 命令：

```shell
tailscale bugreport
```

如果你使用的是 macOS，且尚未[将系统 path 设置][docs-cli-macos-using-the-cli]为包含 Tailscale 命令可执行文件，则需要指定 `tailscale` 的路径。例如：

```shell
/Applications/Tailscale.app/Contents/MacOS/Tailscale bugreport
```

你可以在 `bugreport` 命令中使用以下标志：

* `--diagnose` 在生成 bug 报告标识符后，向 Tailscale 日志输出关于系统的额外详细信息，供我们的支持团队查看。默认为 false。
* `--record` 暂停，然后再写入另一个 bug 报告。使用此标志会先创建一个初始 bug 报告标识符。在暂停期间，执行能复现你问题的操作。然后按 Enter 创建第二个 bug 报告标识符。将两个 bug 标识符都分享给我们的团队。默认为 false。

## bug 报告中共享的内容

bug 报告标识符的组成部分：

* `BUG`，表示这是一份 bug 报告
* 你设备日志的公钥，Tailscale 支持团队用它来定位正确的日志
* bug 报告的创建时间
* 一个随机数，Tailscale 支持团队用它来定位日志中的具体位置

生成 bug 报告时，bug 报告标识符会连同当前健康状况、由协调服务器（coordination server）提供的当前网络地图，以及我们在处理支持请求时发现有用的一些额外操作系统相关信息一起写入[客户端日志][docs-log-mesh-traffic-client-logs]，例如：

* 与 Tailscale 应用相关的 Windows 注册表设置
* Windows 页面文件设置、DLL 版本、已安装的安全应用列表和网络接口信息
* 如果使用 CLI 加 `--diagnose` 选项生成 bug 报告，还会记录一些关于内部状态的额外细节

bug 报告详情记录在[客户端日志][docs-log-mesh-traffic-client-logs]中。你可以通过阅读这些日志来核查实际发送了什么内容。你也可以在 GitHub 上[检查生成 bug 报告的代码][xt-gh-tailscale-opn-localapi]，搜索 `serveBugReport`。

如果[客户端日志已被禁用][docs-log-mesh-traffic-opt-out]，则即使使用 `tailscale bugreport` 命令也不会生成 bug 报告，任何内容都不会发送给 Tailscale。

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-cli-macos-using-the-cli]: /docs/reference/tailscale-cli?tab=macos#using-the-tailscale-cli

[docs-cli-bugreport]: /docs/reference/tailscale-cli#bugreport

[docs-cli]: /docs/reference/tailscale-cli

[docs-log-mesh-traffic-client-logs]: /docs/features/logging#client-logs

[docs-log-mesh-traffic-opt-out]: /docs/features/logging#opt-out-of-client-logging

[xt-gh-tailscale-opn-localapi]: https://github.com/tailscale/tailscale/blob/main/ipn/localapi/localapi.go
