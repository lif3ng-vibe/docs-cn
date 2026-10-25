---
title: "Tailscale SSH 与 SELinux"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jan 30, 2026

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Tailscale SSH and SELinux
SELinux is enabled; Tailscale SSH may not work.

## 消息 ID

`ssh-unavailable-selinux-enabled`

## 为什么会看到这条消息

这条消息出现在运行 Security-Enhanced Linux（SELinux）的设备上。SELinux 是一套 Linux 安全系统，对哪些程序可以运行、可以访问哪些资源执行严格的规则。Tailscale 检测到其内置的 SSH 功能运行在 [`tailscaled`][docs-tailscaled] 进程内部，而不是系统的标准 SSH 守护进程中，而 SELinux 策略可能会限制这些与 SSH 相关的操作。因此，当 SELinux 处于强制（enforcing）模式时，Tailscale 会警告其 SSH 功能可能无法按预期工作。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 要在启用 SELinux 的情况下使用 [Tailscale SSH][docs-tailscale-ssh]，需要允许 `tailscaled` 进程执行与 SSH 相关的操作。你可以让 SELinux 以宽容（permissive）模式运行，或者创建自定义 SELinux 策略，让 `tailscaled` 充当 SSH 服务。
* 如果不需要使用 Tailscale SSH，可以忽略这条警告。它不会影响 Tailscale 网络，网络功能会继续按预期工作。
* 改用标准 OpenSSH 服务器，并通过 Tailscale 连接它，而不使用 Tailscale SSH。

[docs-messages]: /docs/reference/messages

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tailscaled]: /docs/reference/tailscaled
