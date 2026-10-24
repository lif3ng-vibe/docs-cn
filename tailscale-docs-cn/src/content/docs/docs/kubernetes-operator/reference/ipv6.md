---
title: "IPv6 support for the Tailscale Kubernetes Operator"
description: "Last validated Jun 5, 2026"
---

Last validated Jun 5, 2026

The following summarizes IPv6 support for each proxy mode.

## Singleton proxy

| Feature          | IPv6 support | Cluster requirement                                                                                                                |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ingress          | Supported    | Dual-stack cluster required to expose Kubernetes `Service`s over both IPv4 and IPv6 ClusterIPs (including [4via6][docs-4via6]).    |
| Egress           | Supported    | The cluster must support IPv6 networking if a tailnet target is reachable only over IPv6. This includes egress to 4via6 addresses. |
| API Server Proxy | Supported    | None                                                                                                                               |

## ProxyGroup

| Feature          | IPv6 support | Cluster requirement                                                                                                                |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Ingress          | Supported    | Dual-stack cluster required to expose Kubernetes `Service`s over both IPv4 and IPv6 ClusterIPs.                                    |
| Egress           | Supported    | The cluster must support IPv6 networking if a tailnet target is reachable only over IPv6. This includes egress to 4via6 addresses. |
| API Server Proxy | Supported    | None                                                                                                                               |

> **Note:**
>
> Pods cannot reach tailnet devices by raw Tailscale IP address (CGNAT/ULA). Use the Cluster IP address (IPv4 or IPv6 if dualstack cluster) or MagicDNS name if `DNSConfig` is configured.

[docs-4via6]: /docs/features/subnet-routers/4via6-subnets
