---
title: "tailscaled 的防火墙模式"
description: "了解 Tailscale 在 Linux 设备上支持的不同防火墙模式。"
---

最后验证于 Dec 29, 2025

[tailscaled][docs-tailscaled] 的防火墙模式（firewall mode）是指路由器在两种防火墙工具 `iptables` 和 `nftables` 之间做出选择，用于操作防火墙（借助 [netfilter][docs-netfilter-mode]）。这仅适用于 Linux 设备。在 Tailscale v1.48.0 之前，Tailscale 只依赖 `iptables` 来设置防火墙规则。由于 `nftables` 因性能优势日益流行，我们增加了通过 `nftables` Netlink API 管理 Tailscale 防火墙规则的支持。

我们通过 `iptables` 操作防火墙规则的方式是使用 `iptables` 可执行文件。当 Tailscale 以 `iptables` 防火墙模式运行时，系统 `PATH` 中必须存在兼容的 `iptables` 可执行文件。另一方面，我们通过 `nftables` Netlink API 操作 `nftables`，因此它不依赖 `nft` 可执行文件。

当 [用户态网络模式][docs-userspace-networking] 下 Netlink API 被禁用时，Tailscale 无法使用 `nftables`，不过这种场景并不常见。

## 如何设置防火墙模式

> **注意：**
>
> 使用 `TS_DEBUG_FIREWALL_MODE` 环境变量设置防火墙模式是一种临时手段。其用法可能变化，不应视为长期受支持的功能。

Tailscale 有一项开发中的功能，用于检测宿主系统当前正在使用 `iptables` 还是 `nftables`，
从而使用相同的防火墙接口。你可以将 `TS_DEBUG_FIREWALL_MODE`
环境变量设置为 `auto` 来启用这项检测。也可以将 `TS_DEBUG_FIREWALL_MODE` 设置为下述某个值，
显式测试特定的防火墙模式。

| 取值         | 说明                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| `auto`       | 使用[探测逻辑][ar-heuristic]在 `iptables` 和 `nftables` 之间做出选择。             |
| `iptables`   | 使用 `iptables`。                                                                |
| `nftables`   | 使用 `nftables`。                                                                |
| 未设置       | 使用默认值 `iptables`。                                                          |

使用 `TS_DEBUG_FIREWALL_MODE` 环境变量时，请在 `/etc/default/tailscaled` 中设置。

## 防火墙模式探测

当 `TS_DEBUG_FIREWALL_MODE` 设为 `auto` 时，Tailscale 会检测系统上其他软件
已在使用的防火墙模式。如果两者同时在使用，Tailscale 会优先选择 `nftables` 而非 `iptables`。
当 `iptables` 可执行文件和 `nftables` Netlink API 都不可用时，Tailscale 会退化为降级
运行模式，可能导致性能下降或 CPU 占用升高。进出 Tailscale
流量的包过滤始终由 Tailscale 内部的包过滤机制执行，因此这种配置不影响
Tailscale 节点或 tailnet 的安全性。

## 示例

将 `iptables` 设为防火墙模式（不设置 `TS_DEBUG_FIREWALL_MODE` 时这就是默认值）：

```shell
TS_DEBUG_FIREWALL_MODE=iptables
```

将 `nftables` 设为防火墙模式：

```shell
TS_DEBUG_FIREWALL_MODE=nftables
```

让 Tailscale 使用[探测逻辑][ar-heuristic]设置防火墙模式：

```shell
TS_DEBUG_FIREWALL_MODE=auto
```

## 如何验证是否生效

如果你在容器外运行 Tailscale，可以通过 `journalctl` 查看 `tailscaled` 日志输出来验证防火墙模式：

```shell
journalctl -ru tailscaled
```

如果你在容器内运行 Tailscale，查看日志的方式取决于所使用的容器化技术。

日志中应有三行以 `router:` 开头的内容：第一行显示规则计数；
第二行显示选择该防火墙模式的原因；第三行显示当前
生效的防火墙模式。

当 `TS_DEBUG_FIREWALL_MODE` 环境变量指定 `nftables` 时，日志如下：

```shell
router: router: nftables rule count: 0, iptables rule count: 0
router: router: envknob TS_DEBUG_FIREWALL_MODE=nftables set
router: router: using nftables
```

当 `TS_DEBUG_FIREWALL_MODE` 环境变量指定 `iptables` 时，会显示类似输出。

使用防火墙模式选择探测逻辑时，输出如下：

```shell
router: router: nftables rule count: 0, iptables rule count: 0
router: router: nftables is available
router: router: using nftables
```

可能的原因（显示在示例输出的第 2 行）有：

* `iptables is available`
* `iptables is currently in use`
* `nftables is available`
* `nftables is currently in use`

当 `iptables` 和 `nftables` 都不受支持时，`tailscaled` 会静默选择 `iptables`，
并创建一个什么都不做的运行器。这种场景通常只有高级用户才会遇到——他们不需要 Tailscale 配置防火墙规则，
更愿意自己动手。

[ar-heuristic]: #防火墙模式探测

[docs-netfilter-mode]: /docs/reference/netfilter-modes

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking
