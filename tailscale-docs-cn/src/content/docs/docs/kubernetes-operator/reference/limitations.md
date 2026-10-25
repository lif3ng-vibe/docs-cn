---
title: "Tailscale Kubernetes Operator 的限制"
description: "Tailscale Kubernetes Operator 存在以下已知限制。"
---

最后验证于 Jun 5, 2026

Tailscale Kubernetes Operator 存在以下已知限制。

## 通用限制

* 在限制特权 Pod 的平台（例如 GKE Autopilot）上，operator 不受官方支持。在这些平台上功能受限。

## Egress

以下限制适用于将集群工作负载连接到 tailnet 设备的出站（egress）代理：

* Egress 不支持 `tailscale.com/tailnet-ip` 注解中的 IP 范围。你只能指定单个 IPv4 或 IPv6 地址作为路由。
* IPv6 集群要求请参阅 [IPv6 支持][docs-ipv6]。

## 七层入站

以下限制适用于由 Kubernetes `Ingress` 资源承载的入站（ingress）：

* 唯一支持的 [ingress 路径类型][xt-ingress-paths]是 `Prefix`。对于其他路径类型的路径请求，operator 会按前缀规则路由。
* `Ingress` 资源只支持 TLS，并且只通过 MagicDNS 名称与 Let's Encrypt 公共可信证书以 HTTPS 暴露。你必须为 tailnet 启用 HTTPS 与 MagicDNS。
* operator 在首次连接时置备证书，因此置备进行期间该连接可能较慢或超时。

## 三层入站

以下限制适用于由 Kubernetes `Service` 资源承载的 L3 入站：

* 你不能向已有的独立 L3 入站 `Service` 添加 `tailscale.com/proxy-group` 注解。请改为新建一个 `Service`，并将该注解设置为所需 `ProxyGroup` 的名称。
* 通过 `tailscale.com/hostname` 注解更改主机名时，更改不会可靠地应用到已暴露的 `Service`，除非重建该 `Service`。

## 标签

以下限制适用于 operator 管理的设备上的标签：

* operator 只在初始置备设备时应用标签。如果你修改已暴露 `Service` 上的 `tailscale.com/tags` 注解，设备标签不会更新，直到你重建该 `Service`。

[docs-ipv6]: /docs/kubernetes-operator/reference/ipv6

[xt-ingress-paths]: https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types
