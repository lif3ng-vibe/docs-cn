---
title: "Proxmox 问题排障"
description: "以下章节提供帮助你排查常见 Proxmox 问题的建议与技巧。"
---

最后验证于 Mar 18, 2026

以下章节提供帮助你排查常见 Proxmox 问题的建议与技巧。

## 在虚拟机中安装 Tailscale

Proxmox 可以运行虚拟机，模拟一台硬件设备并允许未经修改的操作系统在其内部运行。[Tailscale 可以照常][docs-install]安装在虚拟机内的操作系统中。

## 在 LXC 中安装 Tailscale

Proxmox 还可以运行名为 LXC/LXD 的轻量级 Linux 容器，并且可以以特权或非特权方式运行它们。Tailscale 可以在 LXC/LXD 容器内运行，不过在非特权容器中运行[需要对配置做一项调整][docs-lxc-unprivileged]。

## LXC 中的 resolv.conf

默认情况下，Proxmox 会将自己的 DNS 配置写入 LXC 内的 `/etc/resolv.conf`。即使 LXC 从 DHCP 获取 DNS 配置，Proxmox 也会用自己的配置覆盖 `/etc/resolv.conf`。如果 Tailscale 安装在 Proxmox 上并使用了 MagicDNS，Proxmox 会将该配置写入容器的 `/etc/resolv.conf`：

```shell
# --- BEGIN PVE ---
nameserver 100.100.100.100
search example.ts.net
# --- END PVE ---
```

如果 LXC 本身没有安装 Tailscale，这份配置多半无法工作，DNS 查询将会超时。

缓解此行为有两种选择：

* 在 Proxmox 主机上使用 `tailscale set --accept-dns=false` 将 `tailscale` 配置为不使用 MagicDNS。
* *在每个 LXC 的文件系统内*创建一个名为 `/etc/.pve-ignore.resolv.conf` 的文件，告诉 Proxmox 不要覆盖 `/etc/resolv.conf`。

[docs-install]: /docs/install

[docs-lxc-unprivileged]: /docs/features/containers/lxc/lxc-unprivileged
