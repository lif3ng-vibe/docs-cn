---
title: "启用直连的 pfSense 设置"
description: "[pfSense][xt-pfsense] 是一个基于 FreeBSD 构建的开源路由器与防火墙平台。pfSense 防火墙之后的 Tailscale 客户端可以通过一项设置更改获益。"
---

最后验证于 Feb 2, 2026

[pfSense][xt-pfsense] 是一个基于 FreeBSD 构建的开源路由器与防火墙平台。pfSense 防火墙之后的 Tailscale 客户端可以通过一项设置更改获益。

你还可以使用适用于 pfSense 的插件，直接在这些路由器上运行 Tailscale。

## 局域网客户端的直连

作为路由器/防火墙，pfSense 可能还在为局域网（LAN）设备提供互联网连接，而这些设备自身也装有 Tailscale 客户端。pfSense 的 NAT 实现属于[端点相关映射（Endpoint-Dependent Mapping），即"硬"NAT][bl-how-nat-traversal-works]，这意味着局域网设备难以建立直连，经常退回使用 [DERP 中继][docs-derp-servers]。

pfSense 有几种选项可以让局域网设备与远程 Tailscale 节点建立直连：静态 NAT 端口映射与 NAT-PMP。

## 静态 NAT 端口映射

> **注意：**
>
> 自 [pfSense+ 25.11][xt-pfsense-plus-eim] 与 [pfSense Community Edition 2.9.0][xt-pfsense-ce-eim] 起，pfSense 包含对["端口受限锥形"端点无关出站 NAT][xt-pfsense-eim]（EIM-NAT）的部分实验性支持。
>
> 这些"端口受限锥形"NAT 映射可以取代早期版本中 `randomizeClientPort` 的建议。

默认情况下，pfSense 软件会重写所有出站连接的源端口，以增强安全性并避免直接暴露内部端口号。

pfSense 中的静态端口映射是指在特定外部端口号与内部 IP 地址及端口之间建立固定关联，使入站流量能够被导向局域网内正确的目的地。

找到 **Firewall > NAT** 的 **Outbound** 标签页。选择 **Hybrid Outbound NAT rule generation**。选择 **Save**。选择 **↑ Add**，在列表顶部创建一条新的 NAT 规则。

按如下所示配置该规则：**IPv4+IPv6**，协议为 **UDP**，源地址为 **Any**。在页面的 **Translation** 部分勾选 **Static Port**。

*（图：Firewall : NAT : Outbound 中的静态 NAT 端口映射配置示例）*

选择 **Save**。选择 **Apply Changes**。

在你的 ACL 中，设置 [randomizeClientPort][docs-policy-syntax-network-policy-options]。

```json
{
  // 其他配置
  "randomizeClientPort": true
}
```

## NAT-PMP

NAT-PMP 是一种协议，局域网客户端可以通过它请求防火墙临时创建端口映射。

在 **Services** > **UPnP & NAT-PMP** 中启用 UPnP 服务与 **Allow NAT-PMP Port Mapping**。Tailscale 的使用只需要 NAT-PMP，但启用 UPnP 对游戏机等其他应用也有帮助。

*（图：在 Services : UPnP & NAT-PMP : Settings 中启用 Allow NAT-PMP Port Mapping）*

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-policy-syntax-network-policy-options]: /docs/reference/syntax/policy-file#网络策略选项

[docs-derp-servers]: /docs/reference/derp-servers

[xt-pfsense]: https://pfsense.org

[xt-pfsense-ce-eim]: https://docs.netgate.com/pfsense/en/latest/releases/2-9-0.html#endpoint-independent-port-restricted-cone-outbound-nat

[xt-pfsense-eim]: https://docs.netgate.com/pfsense/en/latest/nat/outbound.html#nat-eiprc

[xt-pfsense-plus-eim]: https://docs.netgate.com/pfsense/en/latest/releases/25-11.html#endpoint-independent-port-restricted-cone-outbound-nat
