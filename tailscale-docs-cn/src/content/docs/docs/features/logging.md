---
title: "日志概览"
description: "了解 Tailscale 的日志基础设施。"
---

最后验证于 Jan 5, 2026

分布式网络中的每个 Tailscale 代理都会把日志流式传输到中央日志服务器（`log.tailscale.com`）。其中包括网络上每台机器之间连接（TCP 或 UDP）的建立与关闭事件的实时记录。

由于每个连接都有两个端点，而且两个端点都会记录该连接，因此可以通过比对每个端点的双重记录来发现日志丢失或被篡改的情况。你还可以使用 IDS（入侵检测系统）规则来自动检测网络上的可疑活动。

## 客户端日志

每个客户端都会记录其自身运行情况以及尝试联系其他节点的信息。所收集的数据及其用途见我们的[隐私政策][co-privacy-policy]。

在某些桌面平台上，你可以在本地访问节点的日志。

#### Windows

日志存储在 `C:\ProgramData\Tailscale`（更一般地，`$env:ALLUSERSPROFILE\Tailscale`）。

#### macOS

要实时查看正在写入的日志条目，打开 Console（控制台）应用，开始流式传输，然后搜索 `IPN`。

要追溯性地从系统日志中收集 Tailscale 日志，你还可以在终端中运行 `sudo sysdiagnose` 来生成 macOS sysdiagnose，然后在其中的 `system_logs.logarchive` 文件里查找匹配 `IPN` 的条目。

#### iOS / tvOS

要实时查看正在写入的日志条目，把你的 iOS 或 tvOS 设备连接到 Mac，然后打开 Console（控制台）应用，在侧边栏中选择你的 iOS 或 tvOS 设备，开始流式传输，再搜索 `IPN`。

要追溯性地从系统日志中收集 Tailscale 日志，你还可以生成 [sysdiagnose][xt-apple-training-sysdiagnose]，然后在其中的 `system_logs.logarchive` 文件里查找匹配 `IPN` 的条目。

#### Android

使用 `logcat` 工具搜索 `com.tailscale.ipn` 软件包发出的日志条目。

#### Linux

日志可在 shell 中查看：

```shell
journalctl -u tailscaled
```

### 集中式日志管理

部分日志由 Tailscale 集中收集用于调试。这依托一个[自研的大容量、高可靠分布式日志系统][xt-apenwarr-20190216]。

客户端运行日志只能在各个节点上本地访问，但你可以把系统级和容器级日志流式传输到同一个集中式数据存储做进一步分析。启用后，你可以从管理控制台查看[网络流日志][ar-network-flow-logs]。

### 退出客户端日志记录

你可以在每台设备上单独退出客户端日志记录：为 [`tailscaled`][docs-tailscaled] 守护进程传入 `--no-logs-no-support` 标志，或使用等效的 `TS_NO_LOGS_NO_SUPPORT` 环境变量。这会禁用遥测，并让该设备退出任何需要这些遥测数据才能调试的支持服务。

标志和环境变量效果相同，但标志的可用性因平台而异。在 Windows 上只有环境变量可用。在 macOS 上，该标志只对命令行的[开源 `tailscaled` 变体][docs-macos-variants]有效，不适用于 Standalone 应用或 Mac App Store 应用。请使用与你平台相匹配的方式。

> **注意：**
>
> 如果你屏蔽客户端日志，Tailscale 可能无法提供技术支持。

#### Windows

你可以在 `%ProgramData%\Tailscale\tailscaled-env.txt` 中设置 `TS_NO_LOGS_NO_SUPPORT` 环境变量：

```powershell
TS_NO_LOGS_NO_SUPPORT=true
```

想了解何时可以改用 `--no-logs-no-support` 标志，请关注我们关于让环境变量更易使用的 [GitHub issue][xt-gh-tailscale-issue-5114]。

#### macOS

如果你运行的是开源 `tailscaled` 的 [macOS 变体][docs-macos-variants]，为 `tailscaled` 传入 `--no-logs-no-support` 标志：

```shell
tailscaled --no-logs-no-support
```

想了解其他 macOS 变体何时可以使用 `--no-logs-no-support` 标志，请关注我们关于让环境变量更易使用的 [GitHub issue][xt-gh-tailscale-issue-5114]。

#### Linux

你可以使用 `--no-logs-no-support` 标志，也可以设置 `TS_NO_LOGS_NO_SUPPORT` 环境变量。

要使用 `--no-logs-no-support` 标志，为 `tailscaled` 传入它：

```shell
tailscaled --no-logs-no-support
```

要设置 `TS_NO_LOGS_NO_SUPPORT` 环境变量，编辑 `/etc/default/tailscaled` 并添加以下行：

```shell
TS_NO_LOGS_NO_SUPPORT=true
```

## Kubernetes Operator 日志

Kubernetes Operator 的调谐（reconciliation）日志会被集中收集用于调试。这些日志描述了 Kubernetes Operator 为让部署状态与 Kubernetes 资源的期望状态保持一致所采取的步骤。

要了解所收集的数据及我们的使用方式，参见我们的[隐私政策][co-privacy-policy]。

你可以使用 `kubectl logs` 命令在本地访问日志。

### 退出 Kubernetes 日志记录

如果你使用 Helm 部署了 Kubernetes Operator，请把 `TS_NO_LOGS_NO_SUPPORT` 环境变量添加到 `operatorConfig.extraEnv` 部分：

```yaml
operatorConfig:
  extraEnv:
  - name: TS_NO_LOGS_NO_SUPPORT
    value: "true"
```

如果你使用静态清单部署了 Kubernetes Operator，请把 `TS_NO_LOGS_NO_SUPPORT` 环境变量添加到 Kubernetes Operator 的 Deployment 中：

```yaml
env:
- name: TS_NO_LOGS_NO_SUPPORT
  value: "true"
```

## 网络流日志

> **注意**：网络流日志[面向 Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

[网络流日志][docs-network-flow-logs]可以帮助你了解哪些设备随时间推移相互连接，也就是流量在整个 tailnet 中的*流动*情况。

这些日志严格不包含任何关于客户端操作或网络流量内容的信息。

网络流日志必须先[启用][docs-network-flow-logs-enable]。

> **注意：**
>
> 流日志可以配置为[流式传输][docs-log-streaming]到 SIEM（安全信息与事件管理）系统。

## 服务器日志

[配置审计日志][docs-audit-logging]记录修改 tailnet 配置的操作，包括操作类型、操作者、目标资源和时间。

所有[有权访问管理控制台的用户][docs-user-roles]都可以在管理控制台的 [Logs](https://console.tailscale.com/admin/logs) 页面查看配置审计日志，并且可以筛选这些日志以查找特定事件。

配置审计日志对所有 tailnet 默认启用，可查看最近 90 天的记录。

> **注意：**
>
> 审计日志可以配置为[流式传输][docs-log-streaming]到 SIEM（安全信息与事件管理）系统。

## 本地 SSH 会话日志

自 1.48.0 版起，本地 SSH 会话日志已不再受支持。

你可以使用 [Tailscale SSH 会话录制][docs-tailscale-ssh-session-recording]从服务器设备流式传输录制内容。

[ar-network-flow-logs]: #网络流日志

[co-privacy-policy]: https://tailscale.com/privacy-policy

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-network-flow-logs-enable]: /docs/features/logging/network-flow-logs#启用网络流日志

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-tailscale-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscaled]: /docs/reference/tailscaled

[docs-user-roles]: /docs/reference/user-roles

[xt-apenwarr-20190216]: https://apenwarr.ca/log/20190216

[xt-apple-training-sysdiagnose]: https://it-training.apple.com/tutorials/support/sup075

[xt-gh-tailscale-issue-5114]: https://github.com/tailscale/tailscale/issues/5114
