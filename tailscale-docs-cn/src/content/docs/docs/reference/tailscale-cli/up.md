---
title: "tailscale up 命令"
description: "`tailscale up` 把你的设备连接到 Tailscale，并在需要时进行认证。"
---

最后验证于 Jan 26, 2026

`tailscale up` 把你的设备连接到 Tailscale，并在需要时进行认证。

```shell
tailscale up [flags]
```

不带任何标志运行 `tailscale up` 会连接到 Tailscale。

你可以指定标志来配置 Tailscale 的行为。标志不会在多次运行之间保留；每次运行都必须指定所有标志。

要清除之前设置的标志（如标签和路由），请传入空参数：

```shell
# 以 `tag:server` 连接
tailscale up --advertise-tags=tag:server

# 连接并清除所有标签
tailscale up --advertise-tags=
```

在 Tailscale v1.8 或更高版本中，如果你忘记指定之前添加过的标志，CLI 会发出警告，并提供一条包含所有现有标志、可直接复制的命令。

可用标志：

* `--accept-dns` 接受来自管理控制台的 [DNS 配置][docs-dns]。默认接受 DNS 设置。
* `--accept-risk=<risk>` 接受风险并跳过该风险类型的确认。取值可以是 `lose-ssh` 或 `all`，或用空字符串表示不接受风险。
* `--accept-routes` 接受其他节点通告的[子网路由][docs-subnets]。默认行为取决于宿主操作系统。对于某些平台——Windows、iOS、Android、macOS App Store 变体和 macOS standalone 变体——默认接受路由。其他所有平台默认不接受路由。
* `--advertise-connector` 把此节点通告为[应用连接器][docs-app-connectors]。
* `--advertise-exit-node` 主动提出作为 Tailscale 网络出站互联网流量的[出口节点][docs-exit-nodes]。默认不主动提出。
* `--advertise-routes=<ip>` 把物理[子网路由][docs-subnets]暴露给你的整个 Tailscale 网络。
* `--advertise-tags=<tags>` 给予此设备带标签设备的权限。你必须[被列在 `"TagOwners"` 中][docs-policy-syntax-tag-owners]才能应用标签。
* `--auth-key=<key>` 提供[认证密钥][docs-auth-keys]，自动把该节点认证为你的用户账户；如果以 `file:` 开头，则为包含认证密钥的文件路径。
* `--client-id` 用于通过[工作负载身份联合][docs-workload-identity]生成[认证密钥][docs-auth-keys]的客户端 ID。
* `--client-secret` 用于生成[认证密钥][docs-auth-keys]的 [OAuth 客户端][docs-oauth-clients]密钥；如果以 `file:` 开头，则为包含该密钥的文件路径。
* `--exit-node=<ip|name>` 提供一个 [Tailscale IP][docs-ip-and-dns-addresses]或[机器名][docs-machine-names]作为出口节点。你也可以使用 `--exit-node=auto:any` 跟踪建议的出口节点，并在可用出口节点或网络状况变化时自动切换。要停用出口节点，请用 `--exit-node=` 传入空参数。
* `--exit-node-allow-lan-access` 允许客户端节点在连接出口节点的同时访问自己的 LAN。默认在连接出口节点期间不允许访问。
* `--force-reauth` 强制重新认证。
* `--hostname=<name>` 为设备提供主机名，替代操作系统提供的主机名。注意这会改变 [MagicDNS][docs-magicdns] 中使用的机器名。
* `--id-token` 来自身份提供方、用于与控制服务器交换以实现[工作负载身份联合][docs-workload-identity]的 ID 令牌；如果以 `file:` 开头，则为包含该令牌的文件路径。
* `--audience` 由[工作负载身份联合][docs-workload-identity]生成的认证密钥在向身份提供方请求 ID 令牌时使用的受众（audience）。
* `--json` 以 JSON 格式输出。格式可能变化。
* `--login-server=<url>` 提供控制服务器的基础 URL，代替 `https://controlplane.tailscale.com`。如果你使用 [Headscale][bl-opensource-coordination-server] 作为控制服务器，请使用你的 Headscale 实例的 URL。
* `--netfilter-mode`（仅限 Linux）控制防火墙自动配置程度的高级功能。取值为 `off`、`nodivert` 或 `on`。默认为 `on`，Synology 除外（默认 `off`）。设为 `off` 会禁用对 `netfilter` 的所有管理。设为 `nodivert` 会创建并管理 Tailscale 子链，但由管理员自行决定何时调用这些链。设为 `on` 表示完全管理 Tailscale 的规则。注意，如果你把 `--netfilter-mode` 设为 `off` 或 `nodivert`，就需要你自己负责为 Tailscale 流量安全地配置防火墙。我们建议以 `--netfilter-mode=on` 安装的规则作为起点。更多信息请参阅 [netfilter 模式][docs-netfilter-mode]。
* `--operator=<user>` 提供一个非 `root` 的 Unix 用户名来运行 `tailscaled`。
* `--qr` 为网页登录 URL 生成二维码。默认不显示二维码。
* `--qr-format=<format>` 二维码格式：`small` 或 `large`。默认为 `small`。
* `--report-posture` 允许管理平面收集[设备态势][docs-device-posture]信息。默认为 `false`。
* `--reset` 把未指定的设置重置为默认值。
* `--shields-up` [阻断][docs-client-preferences]来自 Tailscale 网络中其他设备的入站连接。适用于只发出连接的个人设备。
* `--snat-subnet-routes`（仅限 Linux）对以 `--advertise-routes` 通告的本地路由进行源 NAT。默认对已通告路由的流量做源 NAT。设为 false 可禁用子网路由的地址伪装。
* `--stateful-filtering`（仅限 Linux）为子网路由器和出口节点启用有状态过滤。启用后，目标 IP 是其他节点的入站数据包会被丢弃，除非它们属于该节点某条已跟踪出站连接的一部分。默认禁用。
* `--ssh` 运行 [Tailscale SSH][docs-tailscale-ssh] 服务器，按照 tailnet 管理员声明的[访问策略][docs-acls]（若未定义则按[默认策略][docs-acl-samples-all-default]）允许访问。默认为 false。
* `--timeout=<duration>` 等待 Tailscale 服务初始化的最长时间。`duration` 可以是任何能被 [`time.ParseDuration()`][xt-go-time-parseduration] 解析的值。默认为 `0s`，即无限等待。
* `--unattended`（仅限 Windows）以[无人值守模式][docs-run-unattended]运行，即使当前用户注销后 Tailscale 也会继续运行。

[bl-opensource-coordination-server]: https://tailscale.com/blog/opensource#the-open-source-coordination-server

[docs-acl-samples-all-default]: /docs/reference/examples/acls#允许所有默认-acl

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-client-preferences]: /docs/features/client/manage-preferences

[docs-device-posture]: /docs/features/device-posture

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-netfilter-mode]: /docs/reference/netfilter-modes

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-policy-syntax-tag-owners]: /docs/reference/syntax/policy-file#标签所有者

[docs-run-unattended]: /docs/how-to/run-unattended

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-workload-identity]: /docs/features/workload-identity-federation

[xt-go-time-parseduration]: https://pkg.go.dev/time#ParseDuration
