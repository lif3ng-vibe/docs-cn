---
title: "CGNAT 互操作性"
description: "禁用 CGNAT 丢弃规则，让 Tailscale 与占用 CGNAT 地址空间的网络并存使用。"
---

最后验证于 Jul 1, 2026

Tailscale 在 [CGNAT 地址段][docs-ip-addresses]（`100.64.0.0/10`）内分配地址。为保护这一地址段，Linux 客户端会安装一条防火墙规则，丢弃其中所有非有效 Tailscale 流量。

> **注意：**
>
> CGNAT 互操作性仅适用于 Linux 客户端。Windows 和 macOS 不实现该丢弃规则。

这一默认行为假设该地址段只有 Tailscale 在使用。但 `100.64.0.0/10` 是通用的运营商级 NAT（CGNAT）地址段，一些组织已经在其中运行自己的基础设施，包括：

* 现有的 VPN 或私有组网系统。
* Kubernetes 集群（例如位于 CGNAT 地址空间中的 API 服务器）。
* 通过子网路由的内部服务。

丢弃规则无法区分合法的内部流量与伪造的 Tailscale 流量，因此会一并阻断。结果是，Tailscale 运行期间设备无法访问本地的 CGNAT 地址服务。禁用丢弃规则后，这些设备就能同时使用 Tailscale 并访问内部 CGNAT 地址服务。

只有当你在 `100.64.0.0/10` 中部署了非 Tailscale 服务时才禁用丢弃规则。如果没有，请保持启用。

## 最小权限模型的行为变更

> **危险：**
>
> 如果禁用 CGNAT 丢弃规则且未启用 RPF，你的系统会更容易受到伪造流量的攻击。

禁用 CGNAT 丢弃规则会移除一项内置防护，即防范来自本地网络的 IP 欺骗。

没有丢弃规则时，本地网络中的设备可以发送看似来自 Tailscale IP 的数据包。这会削弱 Tailscale 默认的[最小权限模型][ln-least-privilege]。

为缓解这一风险，请确保已启用反向路径过滤（RPF）：

* RPF 验证数据包从正确的接口到达。
* 防止伪造流量被接受。
* 在现代 Linux 发行版上默认启用。

### 查看 RPF 状态

在许多发行版上，可以用以下命令检查 RPF 状态：

```shell
sysctl net.ipv4.conf.all.rp_filter
```

* `0`：已禁用（不推荐）
* `1`：严格（strict）
* `2`：宽松（loose）

> **注意：**
>
> 一些发行版（如 Fedora）会在全局禁用 RPF，而按接口启用。你可以把 `all` 替换为你的具体接口名。例如，使用 `sysctl net.ipv4.conf.wlp2s0.rp_filter` 将检查 `wlp2s0` 接口。

### 排查 RPF 警告

你可能会收到如下警告：

* CGNAT 丢弃规则已被禁用。

  这意味着：

  * 系统可能接受伪造的 CGNAT 流量。

* RPF 未启用。

  这意味着：

  * 你应当启用 RPF 或应用防火墙管控。

## 禁用 CGNAT 丢弃规则

修改你的 [tailnet 策略文件][docs-tailnet-policy-file]，通过 [`disable-linux-cgnat-drop-rule` 节点属性][docs-policy-file-attr]来启用客户端 netmap 缓存。

本示例面向所有带有 `internal-subnet-routers` 标签的设备。

```json
{
  "nodeAttrs": [
    {
      "target": ["tag:internal-subnet-routers"],
      "attr": ["disable-linux-cgnat-drop-rule"]
    }
  ]
}
```

移除该属性后，丢弃规则会自动恢复。

## 验证 CGNAT 丢弃规则已禁用

使用带 `-L`（列出）标志的 `iptables` 命令：

```shell
iptables -L
```

检查 `ts-input` 链对 `100.64.0.0/10` 使用的是 `RETURN` 规则而不是 `DROP` 规则。

## 限制

* 仅限 Linux，这是设计使然。其他平台不实现 CGNAT 丢弃规则。
* 不支持部分地址段控制。
* 不处理 CGNAT 规则的 [`via`][docs-access-controls-via] 路由限制。

### 与 `nodivert` 的交互

在 `disable-linux-cgnat-drop-rule` 出现之前，[`--netfilter-mode=nodivert`][docs-netfilter-modes-nodivert] 是让设备继续使用 Tailscale 并同时访问内部 CGNAT 地址服务的推荐方案。

如果同时配置了 `disable-linux-cgnat-drop-rule` 和 `nodivert`，则以 `nodivert` 为准。在该模式下，你需要自行管理防火墙行为。

[docs-access-controls-via]: /docs/features/access-control/grants/grants-via

[docs-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-netfilter-modes-nodivert]: /docs/reference/netfilter-modes#nodivert

[docs-policy-file-attr]: /docs/reference/syntax/policy-file#attr

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[ln-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege
