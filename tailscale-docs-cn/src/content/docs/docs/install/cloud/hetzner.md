---
title: "使用 Tailscale 私有访问 Hetzner 服务器"
description: "Hetzner 在欧洲多个数据中心提供 Linux 虚拟机。我们可以使用 Tailscale 安全地访问这些服务器。"
---

最后验证于 Jan 5, 2026

Hetzner 在欧洲多个数据中心提供 Linux 虚拟机。我们可以使用 Tailscale 安全地访问这些服务器。

## 前提条件

在开始本指南之前，你需要先搭建并配置好一个 Tailscale 网络，且其中至少有一台现有设备。如果需要帮助，请阅读我们的[入门指南][docs-install]。

## 第 1 步：为虚拟机设置 Tailscale 客户端

首先，[在 Hetzner Cloud 控制台中创建一台虚拟机][xt-hetzner-run]。

通过 SSH 连入该系统并安装 Tailscale 客户端：

```shell
# curl -fsSL https://tailscale.com/install.sh | sh
# tailscale up
```

下一步我们将移除公有 IP 地址上的 SSH 访问，所以现在需要：

1. 使用 [`tailscale ip`][docs-cli-ip] 找到 Tailscale IP 地址。
2. 退出到公有 IP 地址的 SSH 会话。
3. 新建一个连接到 Tailscale IP 地址的 SSH 会话。

## 第 2 步：放行 UDP 端口 41641

只要隧道至少有一端是"简单 NAT"（easy NAT），即 Tailscale 能够确定 NAT 设备另一侧的 UDP 端口号，它就会建立[直连以降低延迟][bl-how-tailscale-works]。为了让 Hetzner 节点能够建立直连，我们通过防火墙放行 UDP 端口 41641 的入站流量。

在 [Hetzner Cloud 控制台的 Firewall 标签页][xt-hetzner-run]中，点击 **Create Firewall**（创建防火墙）按钮。删除 SSH 和 ICMP 规则，添加一条放行 UDP 端口 41641 的规则。

*（图：UDP 端口 41641 的防火墙规则）*

如果你想允许 Hetzner 虚拟机*之间*建立直连，还需要添加一条出站防火墙规则，放行 UDP 端口 3478。

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-cli-ip]: /docs/reference/tailscale-cli#ip

[docs-install]: /docs/how-to/quickstart

[xt-hetzner-run]: https://console.hetzner.cloud
