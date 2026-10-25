---
title: "使用 Tailscale 需要开放哪些防火墙端口？"
description: "大多数情况下，你[无需为 Tailscale 开放任何防火墙端口][docs-firewalls]。Tailscale 使用[各种 NAT 穿透技术][bl-how-nat-traversal-works]安全地连接到其他 Tailscale 节点"
---

最后验证于 Feb 2, 2026

大多数情况下，你[无需为 Tailscale 开放任何防火墙端口][docs-firewalls]。Tailscale 使用
[各种 NAT 穿透技术][bl-how-nat-traversal-works]，无需人工干预即可安全地连接到其他 Tailscale 节点——它"就是能用"。

不过，当两台设备都处在难以穿透的网络中时，Tailscale 可能无法在设备之间建立点对点连接。得益于[我们的安全中继（DERP）][docs-derp-servers]，你仍然可以收发流量，只是中继连接的速度不如点对点连接。

在这些情况下，你可以考虑开放防火墙端口，帮助 Tailscale 建立点对点连接：

* 允许你的内部设备向 `*:443` 发起 TCP 连接。

  与[协调服务器][docs-control-plane-coordination-server]及其他后端系统的连接，以及与 DERP 中继的数据连接，都使用端口 `443` 上的 HTTPS。DERP 中继的集合尤其会随时间不断增长。我们建议放行 `*:443`，因为试图逐一枚举允许的目标集合，几乎注定会在未来以某种方式破坏你的连通性——而且那种故障乍看并不像防火墙问题。节点可能彻底失联，也可能只在看似随机的设备对之间部分失联，原因就是其中一台被禁止与某个特定的 DERP 通信。

* 允许你的内部设备**从** `:41641` 向 `*:*` 发起 UDP 连接。

  WireGuard 直连隧道使用 UDP，其源端口默认为 `41641`。我们建议放行 `*:*`，因为你无法预测你的用户会使用哪些访客 Wi-Fi、咖啡店、LTE 运营商或酒店网络。

  `41641` 是默认端口，但可以重新配置。如果你更改过某台设备上的端口，请替换为你配置的值。有关在各平台上更改端口的指导，参阅[确认或更改 UDP 端口][ar-confirm-or-change-udp-port]。

* 允许你的内部设备向 `*:3478` 发起 UDP 连接。

  STUN 协议让位于 NAT 后面的机器向开放互联网上的一台机器询问它所看到的 IP 地址，从而让 NAT 后面的机器推算出自己的公网 IP 地址。STUN 还会报告所看到的端口号，这让 `tailscaled` 能够判断自己位于"简单 NAT"后面（对所有目的地，源端口都映射到同一个外部端口）还是"困难 NAT"后面（端口号因目的地而异）。`tailscaled` 只向 DERP 服务器发送 STUN，但 DERP 服务器的集合会随时间扩展，因此我们建议在规则中放行 `*:3478`。

* 允许你的内部设备向 `*:80` 发起 HTTP（TCP）连接。

  与[协调服务器][docs-control-plane-coordination-server]的连接优先使用端口 `80` 上的 HTTP 以及高效的加密传输。但如果协调服务器未在该端口上响应，客户端会退回使用端口 `443` 上的 HTTPS。

  对于[强制门户][docs-captive-portals]（captive portal）检测和通知，Tailscale 会尝试联系一组已知接受 TCP 端口 `80` 入站连接的中继服务器。客户端会执行一个未加密的 HTTP 请求，访问中继服务器上的 `/generate_204` 端点。该端点预期返回带有 `204` 状态码的 HTTP 响应。

  允许这些连接并非强制要求，你也可以选择在防火墙规则中丢弃它们，结果是连接超时。如果禁用，客户端连接 Tailscale 时可能遇到延迟，强制门户检测也无法正常工作。

> **注意：**
>
> 2025 年 7 月起，域名 `login.tailscale.com` 和 `controlplane.tailscale.com` 开始解析到注册在 Tailscale 名下的静态 IP 地址段。
>
> 我们建议使用域名配置防火墙，而不是硬编码 IP 地址。不过，如果必须使用基于 IP 的规则，应显式放行以下地址段：
>
> * **IPv4**：`192.200.0.0/24`
> * **IPv6**：`2606:B740:49::/48`

> **注意：**
>
> 按计划，2025 年 11 月起域名 `log.tailscale.com` 将解析到注册在 Tailscale 名下的静态 IP 地址段。
>
> 我们建议使用域名配置防火墙，而不是硬编码 IP 地址。不过，如果必须使用基于 IP 的规则，应显式放行以下地址段：
>
> * **IPv4**：`199.165.136.0/24`
> * **IPv6**：`2606:B740:1::/48`

## 如何判断我的设备是否正在使用中继？

中继是按设备对使用的。要检查某台设备是否正通过中继与另一台设备通信，可在其中任一设备上运行 `tailscale status`（[文档][docs-cli]）。

`tailscale status` 命令会返回一个表格，列出它通过 Tailscale 可访问的每台设备。例如：

```
1           2         3          4         5
100.1.2.3   device-a  alice@     linux     active; direct <ip-port>, tx 1116 rx 1124
100.4.5.6   device-b  bob@       macOS     active; relay <relay-server>, tx 1351 rx 4262
100.7.8.9   device-c  charlie@   windows   idle; tx 1214 rx 50
100.0.1.2   device-d  diane@     iOS       -
```

如果设备在 tailnet 中处于活动状态，连接状态（第 5 列）会显示 "direct" 表示点对点连接（附带所用的 IP 地址），或显示 "relay" 表示使用 DERP 的连接（附带相应位置的城市代码，例如 `nyc` 或 `fra`）。

## 如何让经中继连接的设备改用点对点连接？

如果你的两台设备都处在难以穿透的网络中，放行其中一台所监听的 UDP 端口，可能有助于 Tailscale 建立点对点连接，而不是退回中继。

`41641` 是默认 UDP 端口，但可以重新配置，因此在为设备编写防火墙规则之前，请先确认它实际使用的端口。更多信息参阅[确认或更改 UDP 端口][ar-confirm-or-change-udp-port]。

例如在 Ubuntu 上，如果设备使用默认端口，你可以用内置的 `ufw` 命令放行它：

```shell
sudo ufw allow 41641/udp
```

想深入了解 NAT 穿透，我们的博客文章[*NAT 穿透是如何工作的*][bl-how-nat-traversal-works]里有全部细节。

## 确认或更改 UDP 端口

Tailscale 默认在 UDP 端口 `41641` 上监听点对点 WireGuard 流量。你可以重新配置该端口，因此某台设备实际使用的值可能不同。设置方式取决于平台。

* **Linux**：通过 `/etc/default/tailscaled` 中的 `FLAGS` 变量设置端口，`systemd` 单元定义会引用该文件。
* **NixOS**：NixOS 将 `/etc/default/tailscaled` 作为其声明式配置的一部分管理，因此应通过你的 NixOS 配置设置端口，而不是直接编辑该文件。
* **Windows**：端口默认为 `41641`。你可以在 `tailscaled-env.txt` 文件中设置 `PORT=N` 来更改它。

有关在各平台上设置 `tailscaled` 标志和环境变量（包括 `--port` 标志）的更多信息，参阅 [`tailscaled` 守护进程][docs-tailscaled]参考。

## 如果我想指定 Tailscale 运营其服务所用的主机名怎么办？

在无法避免的情况下，你可以为一份完全限定域名（FQDN）列表设置例外。我们强烈建议将保持允许主机名同步的流程自动化，以尽量减少 Tailscale 基础设施变更带来的影响。

**协调服务器**列表（身份验证、密钥交换、防火墙更新等所需）可能会变化，但不频繁：

* `console.tailscale.com`
* `controlplane.tailscale.com`
* `log.tailscale.com`
* `login.tailscale.com`

此外，**DERP 中继服务器**（肯定会不时变化）通过 TCP 端口 `443` 访问。DERP 服务器命名为 `derpN`，截至 2025 年 8 月，`1 <= *N* <= 28`（*N* 的上限可能会增加）。Tailscale 会为每个区域创建一个 `derpN-all` 条目，包含多条 A（IPv4）和 AAAA（IPv6）记录，区域内每台 DERP 服务器对应一条记录。

因此，你的 DERP DNS 条目允许列表会是这样：

* `derp1-all.tailscale.com`
* `derp2-all.tailscale.com`
* `...`
* `derp28-all.tailscale.com`

如果你已经从自己的 DERP map 中[移除了 Tailscale 的 DERP 区域][docs-custom-derp-servers-remove-derp]，则可以跳过被移除区域的 DNS 条目。

为优化对 Tailscale 客户的服务，DERP 服务器会根据用户所在位置频繁新增或调整。DERP 服务器新增或调整后，Tailscale 会在约 15 分钟后更新 DNS 条目。要获取最新的 Tailscale DERP 服务器列表，请访问 [DERP map](https://login.tailscale.com/derpmap/default)。
或者，你也可以运行以下命令：

```shell
curl https://login.tailscale.com/derpmap/default | jq
```

确定服务器之后，把相关的 A 和 AAAA 记录添加到你的防火墙配置中。

如果你的防火墙支持通过 DNS 条目添加 L3 tailnet 策略文件条目——即自动添加其找到的所有 A 和 AAAA 记录，并通过重新查询 DNS 定期刷新这些条目——那么你可以配置 `derpN-all.tailscale.com` 条目，从而无需持续手动更新 DERP 服务器列表。

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[ar-confirm-or-change-udp-port]: #确认或更改-udp-端口

[docs-captive-portals]: /docs/integrations/captive-portals

[docs-cli]: /docs/reference/tailscale-cli

[docs-control-plane-coordination-server]: /docs/concepts/control-data-planes#coordination-server

[docs-custom-derp-servers-remove-derp]: /docs/reference/derp-servers/custom-derp-servers#optional-remove-tailscales-derp-servers

[docs-derp-servers]: /docs/reference/derp-servers

[docs-firewalls]: /docs/integrations/firewalls

[docs-tailscaled]: /docs/reference/tailscaled
