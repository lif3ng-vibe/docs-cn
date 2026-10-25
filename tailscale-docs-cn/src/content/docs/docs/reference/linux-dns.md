---
title: "配置 Linux DNS"
description: "在 Linux 上配置 DNS 时的常见问题。"
---

最后验证于 Jan 5, 2026

在 Linux 上配置 DNS 的方法[多得数不胜数][bl-sisyphean-dns-client-linux]。

Tailscale 会尽量兼容主机上已有的任何 Linux DNS 配置。遗憾的是，有些配置并不太适合以协作方式管理主机的 DNS 设置。

## 常见问题

### NetworkManager + systemd-resolved

如果你同时使用 NetworkManager 和 systemd-resolved（许多发行版的常见组合），你需要确保 `/etc/resolv.conf` 是指向 `/run/systemd/resolve/stub-resolv.conf` 的符号链接。这通常应当是默认状态。如果不是，请执行：

```shell
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

NetworkManager 检测到该符号链接存在后，其默认行为是使用 systemd-resolved，而不会接管 resolv.conf 文件。

修复后，重启所有相关服务：

```shell
sudo systemctl restart systemd-resolved
sudo systemctl restart NetworkManager
sudo systemctl restart tailscaled
```

### DHCP `dhclient` 覆盖 `/etc/resolv.conf`

在没有安装任何 DNS 管理系统的情况下，`dhclient` 这类 DHCP 客户端与 `tailscaled` 这类程序别无选择，只能各自重写 `/etc/resolv.conf` 文件，结果有时会互相冲突。（例如，DHCP 续租时重写了 `resolv.conf`，导致 MagicDNS 功能失效。）

可行的变通办法是使用 `resolvconf` 或 `systemd-resolved`。[Issue 2334][xt-gh-tailscale-issue-2334] 跟踪了让 Tailscale 感知其他程序更新 `resolv.conf`、从而把自身配置加回去的进展。

### Amazon Linux 上的 DNS 问题

在 Amazon Linux 上，Tailscale 的 DNS 可能因无限转发循环而失效。当 Tailscale 备份并替换 `/etc/resolv.conf`、写入自己的 DNS 服务器（`100.100.100.100`）时，`systemd-resolved` 会把这个地址加进备份文件。之后，Tailscale 重新读取备份以寻找上游 DNS 服务器时，会把查询转发给自己，形成破坏 DNS 解析的死循环。已知这个问题在 Amazon Linux 2023 上尤其常见。

针对这个问题的一种变通办法，是把 `systemd-resolved` 从 Amazon 的传统模式重新配置为 stub 解析器模式：屏蔽 Amazon 的自定义配置，并把 `/etc/resolv.conf` 指向 stub 解析器。

```shell
mkdir -p /etc/systemd/resolved.conf.d
ln -sf /dev/null /etc/systemd/resolved.conf.d/resolved-disable-stub-listener.conf
ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

[bl-sisyphean-dns-client-linux]: https://tailscale.com/blog/sisyphean-dns-client-linux

[xt-gh-tailscale-issue-2334]: https://github.com/tailscale/tailscale/issues/2334
