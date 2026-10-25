---
title: "本地日志配置错误"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jan 30, 2026

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Local log misconfiguration
The local log is misconfigured.

## 消息 ID

`local-log-config-error`

## 为什么会看到这条消息

Tailscale 客户端无法初始化与[设备连接][docs-device-connectivity]相关的本地日志记录，该功能用于协助排查和调试问题。

出现这个错误的原因可能有：

* 日志目标无效或不可达，例如缺少写权限或文件系统为只读。
* 操作系统的日志服务不可用或配置不当，导致日志记录冲突。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 移除自定义日志设置，让 Tailscale 客户端使用默认日志行为。
* 确保客户端有写入日志的权限，且文件系统可写。
* 如果记录到文件，请确认目录存在且可写；如果使用系统日志，请确保操作系统的日志服务运行正常。
* 更改完成后重启 Tailscale 客户端，让日志以干净状态启动。

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-messages]: /docs/reference/messages
