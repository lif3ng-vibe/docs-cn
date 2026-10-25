---
title: "禁用子网路由伪装"
description: "源网络地址转换（SNAT）会影响源 IP 地址在网络中不同位置设备上的呈现方式。默认情况下，Tailscale 会对流经子网路由器的流量执行 SNAT，但必要时可以修改这一行为。"
---

最后验证于 Mar 25, 2026

源网络地址转换（SNAT）会影响源 IP 地址在网络中不同位置设备上的呈现方式。默认情况下，Tailscale 会对流经[子网路由器][docs-subnet-routers]的流量执行 SNAT，但必要时可以修改这一行为。

你可以使用以下命令禁用子网路由伪装（仅限 Linux）：

```shell
tailscale up --snat-subnet-routes=false
```

> **注意：**
>
> SNAT 通过将源 IP 地址改写为子网路由器的地址，实现对网络其余部分的透明通信。如果禁用子网路由伪装，发往通过 `--advertise-routes` 通告的本地路由的 NAT 流量将需要手动配置路由。

更多信息请参阅[禁用 SNAT][docs-subnet-routers-disable-snat]。

[docs-subnet-routers-disable-snat]: /docs/features/subnet-routers#禁用-snat

[docs-subnet-routers]: /docs/features/subnet-routers
