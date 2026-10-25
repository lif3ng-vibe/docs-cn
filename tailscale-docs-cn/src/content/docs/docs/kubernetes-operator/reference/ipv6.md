---
title: "Tailscale Kubernetes Operator 对 IPv6 的支持"
description: "最后验证于 Jun 5, 2026"
---

最后验证于 Jun 5, 2026

以下内容总结了各代理模式对 IPv6 的支持情况。

## 单例代理

| 功能             | IPv6 支持 | 集群要求                                                                                                        |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ingress          | 支持         | 需要双栈（dual-stack）集群，才能通过 IPv4 与 IPv6 两个 ClusterIP（包括 [4via6][docs-4via6]）暴露 Kubernetes `Service`。            |
| Egress           | 支持         | 如果 tailnet 目标只能通过 IPv6 访问（包括到 4via6 地址的出站流量），集群必须支持 IPv6 网络。 |
| API Server Proxy | 支持         | 无                                                                                                                               |

## ProxyGroup

| 功能             | IPv6 支持 | 集群要求                                                                                                        |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ingress          | 支持         | 需要双栈（dual-stack）集群，才能通过 IPv4 与 IPv6 两个 ClusterIP 暴露 Kubernetes `Service`。                                       |
| Egress           | 支持         | 如果 tailnet 目标只能通过 IPv6 访问（包括到 4via6 地址的出站流量），集群必须支持 IPv6 网络。 |
| API Server Proxy | 支持         | 无                                                                                                                               |

> **注意：**
>
> Pod 无法通过裸 Tailscale IP 地址（CGNAT/ULA）访问 tailnet 设备。请使用 Cluster IP 地址（双栈集群可用 IPv4 或 IPv6）；如果配置了 `DNSConfig`，则可使用 MagicDNS 名称。

[docs-4via6]: /docs/features/subnet-routers/4via6-subnets
