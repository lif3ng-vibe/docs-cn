---
title: "Linux DNS 配置问题"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jan 12, 2026

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Linux DNS configuration issue
Linux DNS config not ideal. /etc/resolv.conf overwritten.

## 参考 ID

`resolv-conf-overwritten`

## 为什么会看到这条消息

Tailscale 会更新 Linux 客户端上的 DNS 设置，确保内部主机名能够正确解析，尤其是在使用 MagicDNS 或分割 DNS（split DNS）等功能时。如果客户端使用了不受支持的 DNS 配置（例如手动配置或被锁定的 `/etc/resolv.conf` 文件），或者其他网络管理器覆盖了 DNS 更改，就会出现问题。如果 Tailscale 权限不足，或者系统运行在容器这类受限环境中，也可能出现问题。在这些情况下，Tailscale 无法应用自己的 DNS 配置，可能导致内部域名无法解析。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 如果你的 Linux 发行版支持，使用命令 `sudo systemctl enable --now systemd-resolved`。这会立即启动 Linux DNS 解析服务，并确保它在每次开机时自动运行。
* 以 `root` 身份运行 `tailscaled` 守护进程，让 Tailscale 能够修改 DNS 设置并管理网络。
* 在 Linux 网络设置中手动配置 DNS。

## 更多信息

有关 `tailscaled` 的信息，请参阅 [tailscaled 守护进程][docs-tailscaled]。

[docs-messages]: /docs/reference/messages

[docs-tailscaled]: /docs/reference/tailscaled
