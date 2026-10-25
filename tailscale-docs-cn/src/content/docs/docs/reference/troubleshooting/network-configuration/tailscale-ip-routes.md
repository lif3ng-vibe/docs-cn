---
title: "Tailscale 安装的 IP 路由"
description: "从 Tailscale v0.99 开始，为防止[子网路由器][docs-subnets]中出现路由环路，Tailscale 路由被移到了单独的路由表中。传统的 `netstat` 工具不会显示 Tailscale 路由。"
---

最后验证于 Mar 25, 2026

从 Tailscale v0.99 开始，为防止[子网路由器][docs-subnets]中出现路由环路，Tailscale 路由被移到了单独的路由表中。传统的 `netstat` 工具不会显示 Tailscale 路由。

要查看 Tailscale 安装的路由，请使用以下命令：

```shell
ip route show table 52
```

如果你想在设备上将 Tailscale 路由与其他路由表一同显示，请使用以下命令：

```shell
ip route show table all
```

[docs-subnets]: /docs/features/subnet-routers
