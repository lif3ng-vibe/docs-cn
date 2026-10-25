---
title: "Tailscale netfilter 模式"
description: "有关 Tailscale 在 Linux 设备上支持的 netfilter 模式的信息。"
---

最后验证于 Dec 29, 2025

> **注意：**
>
> 本主题仅适用于运行 Tailscale 的 Linux 设备。

[Netfilter][xt-netfilter] 是 Linux 内核内置的一个框架，它在网络栈的关键位置提供钩子（hook），让你可以在数据包流经系统时检查、修改、丢弃和重定向数据包。它是 [iptables][xt-iptables] 和 [nftables][xt-nftables] 等防火墙工具的底层引擎。默认情况下，在 Linux 设备上安装 Tailscale 时，Tailscale 会创建自己的防火墙规则，并将其配置为自动参与规则评估。这种方式让 Tailscale 管理自身所需的规则，同时保留了你在需要时添加自定义规则的能力。

这一默认配置（`on` 模式）适用于大多数部署，但 Tailscale 还有其他 netfilter 模式，包括 `nodivert` 和 `off`。在以下场景中，你可以考虑改用其他模式并自定义 Tailscale 的 netfilter 行为：

* 你需要为 Tailscale 的 [CGNAT][xt-cgnat] 流量过滤设置例外。例如，当其他软件与 Tailscale 的自动规则管理冲突时，可能就需要设置例外。
* 你需要阻止 [`tailscaled`][docs-tailscaled] 周期性地重新调整其规则位置以确保规则被优先评估。
* 你需要让其他防火墙规则先于 Tailscale 的规则接受评估。

你可以通过设置 netfilter 模式来自定义 Tailscale 与 netfilter 的集成方式。Tailscale 中有几处可以配置 netfilter 模式，包括 `tailscaled` 配置文件中的 `netfilterMode` 选项，以及 [Tailscale CLI][docs-cli] 的 `--netfilter-mode` 标志（适用于 `tailscale up`、`tailscale login` 和 `tailscale set`）。

## Netfilter 模式选项

Tailscale 有三种 netfilter 模式选项：`on`、`nodivert` 和 `off`。这些取值对 Tailscale CLI 标志（`--netfilter-mode`）和 Tailscale 守护进程配置文件取值（`netfilterMode`）是相同的。

| 模式                      | 说明                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`on`][ar-on]             | （默认）Tailscale 创建自己的防火墙规则，并确保相关流量会评估这些规则。                                                          |
| [`nodivert`][ar-nodivert] | Tailscale 创建防火墙规则但不激活它们。流量不会自动经过 Tailscale 的规则。                                                       |
| [`off`][ar-off]           | Tailscale 不创建也不管理任何防火墙规则。你必须自行编写所有必需的规则。                                                          |

### `on`

`on` 是默认模式。使用 `on` 模式时，Tailscale 会创建防火墙规则，并确保相关流量会评估这些规则。Tailscale 的集成方式取决于使用的工具：

* **使用 iptables 时**：Tailscale 创建自定义链，并在内置链的开头（`filter` 表的 `INPUT` 和 `FORWARD`、`nat` 表的 `POSTROUTING`）插入[跳转规则（jump rule）][xt-netfilter-jumps]，引导流量经过它的规则。
* **使用 nftables 时**：Tailscale 创建自己的表，其中的链以高优先级[直接注册到钩子上][xt-netfilter-chains]，确保其规则被尽早评估。

Tailscale 的规则强制执行多项安全策略：

* **接受 tailnet 流量**：通过 `tailscale0` 接口到达的流量会被接受。
* **防止 CGNAT 欺骗**：来自 CGNAT 地址段（`100.64.0.0/10`）但不是通过 `tailscale0` 接口到达的流量会被丢弃。这可以防止攻击者在其他接口上伪造 [Tailscale IP 地址][docs-100.x-addresses]。
* **接受 Tailscale 协议流量**：Tailscale 监听端口上的 UDP 流量会被接受，以维持连接。
* **启用路由功能**：为[子网路由][docs-subnets]和[出口节点][docs-exit-nodes]功能适当地标记并接受转发流量。

设置为 `on` 时，Tailscale 会定期验证其规则是否仍处于可被尽早评估的位置。如果其他软件改变了这一点，Tailscale 会恢复自己的配置。

### `nodivert`

no divert（`nodivert`）模式会创建 Tailscale 的防火墙规则，但不激活它们。规则存在，但流量不会自动经过这些规则。

具体行为取决于使用的工具：

* **使用 iptables 时**：Tailscale 会创建自定义链，但不向内置链插入跳转规则。
* **使用 nftables 时**：Tailscale 会创建自己的表和链，但不把它们注册到钩子上。

在需要以下操作时使用 `nodivert` 模式：

* 控制防火墙规则的顺序，让你的自定义规则先于 Tailscale 的规则接受评估。
* 为 Tailscale 丢弃不经过 `tailscale0` 接口的 [CGNAT][xt-cgnat] 流量的默认行为添加例外。
* 阻止 [`tailscaled`][docs-tailscaled] 周期性地重新调整规则位置以抢先评估。

> **警告：**
>
> 使用 `nodivert` 模式时，Tailscale 的规则虽然存在，但没有被引用。你必须手动配置防火墙，引导流量经过 Tailscale 的规则。对 iptables 来说，这意味着向内置链添加跳转规则；对 nftables 来说，这意味着把 Tailscale 的链注册到相应的钩子上。

> **注意：**
>
> 在使用 `nodivert` 来停用 CGNAT 流量丢弃之前，先考虑[停用 CGNAT 丢弃规则][docs-cgnat-interoperability]是否能满足你的需求。

### `off`

使用 `off` 模式可以阻止 Tailscale 对 netfilter 做任何更改。通常没有充分的理由把 netfilter 模式设为 `off`。使用此模式时，Tailscale 不会对 `iptables` 或 `nftables` 做任何更改。你必须自行编写所有必需的防火墙规则，包括 Tailscale 通常会在自己的链中创建的那些规则。

> **警告：**
>
> 只有在 `nodivert` 无法满足特定需求时才使用 `off` 模式。netfilter 模式设为 `off` 后，以下事项由你负责：
>
> * 接受 `tailscale0` 接口上的流量。
> * 接受 Tailscale 监听端口上的 UDP 流量。
> * 为子网路由和出口节点功能配置 NAT 规则。

[ar-nodivert]: #nodivert

[ar-off]: #off

[ar-on]: #on

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-cgnat-interoperability]: /docs/reference/cgnat-interoperability

[docs-cli]: /docs/reference/tailscale-cli

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscaled]: /docs/reference/tailscaled

[xt-cgnat]: https://en.wikipedia.org/wiki/Carrier-grade_NAT

[xt-iptables]: https://netfilter.org/projects/iptables/

[xt-netfilter]: https://www.netfilter.org/documentation/

[xt-netfilter-chains]: https://wiki.nftables.org/wiki-nftables/index.php/Configuring_chains

[xt-netfilter-jumps]: https://wiki.nftables.org/wiki-nftables/index.php/Jumping_to_chain

[xt-nftables]: https://wiki.nftables.org/wiki-nftables/index.php
