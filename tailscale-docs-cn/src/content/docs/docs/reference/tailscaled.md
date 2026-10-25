---
title: "tailscaled 守护进程"
description: "了解 tailscaled 守护进程。"
---

最后验证于 Jan 5, 2026

在你的设备上运行的 Tailscale 软件被拆分到多个二进制文件和进程中。

## 平台差异

在大多数平台上，[CLI][docs-cli] 是一个名为 `tailscale`（或 `tailscale.exe`）的二进制文件，而拥有更高权限、负责处理所有网络事务的守护进程（daemon）则叫 `tailscaled`（或 `tailscaled.exe`）。注意末尾的 `d` 代表"daemon"。通过 `tailscale` 命令使用的大多数 CLI 命令，都要求该守护进程正在机器上运行。

在 macOS 上运行 Tailscale 有[三种方式][docs-macos-variants]。只有第三种非 GUI 方式才有典型的 `tailscale` 与 `tailscaled` 之分。两种 GUI 变体把所有组件打包进同一个二进制文件，由 macOS 在不同上下文中加载：GUI、守护进程（App Store 版名为 `IPNExtension`，zip 下载版名为 `io.tailscale.ipn.macsys.network-extension`），以及 CLI（与 GUI 是同一个二进制文件，但从终端运行时会进入 CLI 模式）。macOS 两种 GUI 变体的守护进程虽然名称不同，实际上几乎完全一样。不过从技术上讲，它们并不是本主题的主角 `tailscaled`，尽管共享大部分相同代码。值得注意的是，凡涉及给 `tailscaled` 传标志（flag）的 `tailscaled` 行为，在 macOS GUI 变体上并不总是可用。

## tailscaled 在哪里运行？

在 Linux 及其他类 Unix 平台上，`tailscaled` 通常作为 systemd 服务运行，或者按你的发行版或操作系统所用的 init 系统方式运行。

在 macOS 上，`tailscaled`（如上所述，指不使用 GUI 构建版时）作为 `launchd` 服务运行。

在 Windows 上，`tailscaled` 作为名为"Tailscale"的 Windows 服务运行。

## 停止和启动 tailscaled

通常情况下，你不需要手动停止和启动 `tailscaled` 进程。当你使用 CLI 命令 `tailscale down` 时，它应会进入空闲状态。不过，如果你在调试某些问题或修改标志（flag），具体操作因平台而异。

在 systemd 上，你可以运行 `sudo systemctl $VERB tailscaled`，其中的动词可以是 `stop`、`start`、`restart` 等。

在 Windows 上，你可以运行 `net stop Tailscale` 或 `net start Tailscale`，也可以使用 Windows 服务管理器。

## 从 tailscaled 获取日志

一种可移植的连接守护进程并流式查看其日志的方式，是使用 CLI 运行 `tailscale debug daemon-logs`。不过，它目前不支持获取任何历史日志。

在 systemd 上，你可以使用 `journalctl -u tailscaled --since="1 hour ago"`。

在 Windows 上，请参阅 `C:\ProgramData\Tailscale\Logs`。

在 macOS 上，对于 GUI 构建版，请使用 `Console.app` 并搜索 `Tailscale` 或 `IPNExtension`。

## tailscaled 的标志

`tailscaled` 有许多用于不同用途的标志（flag，即命令行参数）。其中一些并非稳定接口，主要供调试使用。较常用且稳定的几个包括：

* `--tun=NAME` 用于指定 TUN 设备名；或使用特殊值 `userspace-networking`，表示不使用内核支持、全部在进程内完成。
* `--port=N` 用于设置监听点对点流量的 UDP 端口；0 表示自动选择。
* `--verbose=N`，N 默认为 0。取 1 或更大的值时，输出会越来越详细。
* `--debug=localhost:8080`，运行一个调试 HTTP 服务器，提供 `/debug/pprof`、`/debug/metrics`、`/debug/ipn`、`/debug/magicsock` 等路径。调试服务器上可访问内容的具体细节可能随时间变化。
* `--no-logs-no-support` 禁用遥测（telemetry），并使你放弃任何需要此类遥测数据来进行调试的支持服务

要控制状态（包括偏好设置和密钥）存储在哪里、如何存储，可使用：

* `--statedir=` 指定磁盘上的一个目录，用于存放配置文件、密钥、Taildrop 文件和其他状态。

* `--state=` 可设为 `/path/to/file`、`kube:<secret-name>`（使用 Kubernetes secret）、`arn:aws:ssm:...`（把状态存入 AWS Systems Manager（SSM）），或 `mem:`（不存储状态并注册为临时节点（ephemeral node））。默认情况下，如果未提供，状态存储在 `<statedir>/tailscaled.state`。

  使用 AWS SSM 时，你可以选择追加 `?kmsKey=<key>`，使用 AWS Key Management Service（KMS）密钥来加密状态。KMS 密钥可以是密钥 ID、别名或完整的 Amazon Resource Name（ARN）。如果不指定 KMS 密钥，存储在 AWS SSM 中的状态不会被加密。

* `--encrypt-state` 在 Linux 上可选择使用本地 TPM 设备加密状态文件。

还有两个用于运行代理的标志：

* `--socks5-server=[host]:port`，运行一个 SOCK5 服务器，让你可以通过 SOCKS5 访问你的 tailnet
* `--outbound-http-proxy-listen=[host]:port`，运行一个 HTTP 代理服务器，让你可以通过 HTTP 访问你的 tailnet。

SOCK5 与 HTTP 代理可以设置为相同的值，此时只会打开一个端口，但会根据客户端先发送的内容自动切换使用哪种协议。

要应用[系统策略][docs-system-policies]：

* `--syspolicy-file` 指向一个 JSON syspolicy 文件的路径，作为设备级策略来源应用；留空则禁用

以下标志会执行某个操作后退出：

* `--version` 打印版本信息并退出
* `--cleanup` 清理上次运行残留的系统状态

## 设置标志

设置 `tailscaled` 标志的方式因平台而异。

在 Linux 上，你可以修改 `/etc/default/tailscaled` 中的 `FLAGS`，systemd 单元定义会将其包含进来。

在 NixOS 上，`/etc/default/tailscaled` 作为声明式配置的一部分来管理。请通过你的 NixOS 配置来设置标志，而不要直接编辑该文件。

## 环境变量

### Windows

在 Windows 上，你可以通过以下步骤设置一些环境变量：

* 在 `C:\ProgramData\Tailscale` 中创建一个 `tailscaled-env.txt` 文件。
* 在 `tailscaled-env.txt` 文件中，你可以设置 `PORT=N`（例如用于更改默认的 UDP 监听端口）。
* 保存文件，然后运行 `net stop Tailscale`、`net start Tailscale` 使更改生效。

[docs-cli]: /docs/reference/tailscale-cli

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-system-policies]: /docs/features/tailscale-system-policies
