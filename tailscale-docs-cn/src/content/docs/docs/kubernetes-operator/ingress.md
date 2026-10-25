---
title: "使用 Ingress 将集群工作负载暴露给你的 tailnet"
description: "使用 Tailscale Kubernetes Operator 将 Kubernetes 工作负载暴露给你的 tailnet 或互联网。"
---

最后验证于 Jun 5, 2026

集群入站（ingress）让你可以将集群工作负载暴露给 tailnet，使 Tailscale 网络上的其他设备能够访问它们。operator 会部署入站代理 `Pod`，将流量转发到后端 `Services`。

你可以将 Kubernetes `Services` 在两个不同的层暴露给你的 tailnet：

* [第 7 层（HTTP/HTTPS）][ar-layer-7-ingress]，用于暴露 Web 应用和 API。
* [第 3 层（TCP/UDP）][ar-layer-3-ingress]，用于暴露数据库或消息队列等服务。

在任一层，你都可以使用单个代理 pod 以独立模式运行入站，也可以使用具有多个副本的 [ProxyGroup][docs-proxygroup] 以[高可用][ar-ha-ingress]模式运行。生产环境 Tailscale 建议使用高可用模式。

本页介绍这两层的入站架构、代理模式以及 TLS 证书的预置方式。

> **注意：**
>
> Ingress 默认不会将服务暴露到公共互联网。更多信息请参阅[使用 Tailscale Funnel 将 Kubernetes 集群工作负载暴露到公共互联网][docs-expose-internet]。

## 面向 HTTP 和 HTTPS 的独立 L7 入站

第 7 层 `Ingress` 让你可以暴露 Web 应用和 API。

你通过一个带有 `ingressClassName: tailscale` 的 `Ingress` 对象来配置。代理使用 [Tailscale Serve][docs-serve] 接收流量。

创建 `Ingress` 时，operator 会：

* 创建一个（合并的）配置与状态 `Secret`。
* 创建一个转发流量的入站代理 `Pod`（单副本 `StatefulSet`），让 tailnet 中任意位置的设备都能访问该 `Ingress`。
* 自动为每个 Ingress 预置一个安全的 **MagicDNS** 名称和一张[有效的 **TLS 证书**][ar-tls-certificates]。

*（图：Tailscale Kubernetes Operator 为 L7 入站代理创建 Secret 和 StatefulSet 的架构图。代理 pod 将来自 tailnet 客户端的流量转发到 Kubernetes Service。）*

L7 `Ingress` 也可以搭配[高可用][ar-ha-ingress]配置使用。

有关暴露第 7 层工作负载的更多信息，请参阅[在第 7 层将集群工作负载暴露给你的 tailnet][docs-expose-l7]。

## 独立 L3 入站（TCP/UDP）

你可以使用第 3 层入站暴露数据库或消息队列等服务。

你通过一个选择应用 pod 的 `Service` 对象来配置，方式为以下二者之一：

* 注解 `tailscale.com/expose: "true"`。
* 将 `.spec.type` 设为 `LoadBalancer`，并将 `.spec.loadBalancerClass` 设为 `tailscale`。

operator 会创建：

* 一个合并的配置与状态 `Secret`。
* 一个使用单副本 `StatefulSet`、转发流量的入站代理 `Pod`，让 tailnet 中任意位置的设备都能访问该 `Service`。

这个 Pod 使用 `iptables` 或 `nftables` 规则，将发往代理 tailnet IP 地址的流量 DNAT 到 `Service` 的内部集群 IP 地址。

*（图：Tailscale Kubernetes Operator 为 L3 入站代理创建 Secret 和 StatefulSet 的架构图。代理 pod 将来自 tailnet 客户端的流量转发到 Kubernetes Service。）*

L3 `Ingress` 可以搭配[高可用][ar-ha-ingress]配置使用，并可作用于新建或已有的 Service。

有关暴露第 3 层工作负载的更多信息，请参阅[在第 3 层将集群工作负载暴露给你的 tailnet][docs-expose-l3]。

## 高可用（HA）入站

高可用的 L7 或 L3 `Ingress` 与独立版本类似，但使用 [ProxyGroup][docs-proxygroup] 部署多个副本。这让你可以：

* 通过多个活跃的入站代理将 Kubernetes `Service` 或 `Ingress` 资源暴露给你的 tailnet，避免代理 `Pod` 重启期间服务中断。
* 用较少数量的代理 `Pods` 向 tailnet 暴露大量 `Service` 和 `Ingress` 资源。

你通过在 `Ingress` 或 `Service` 上添加 `tailscale.com/proxy-group` 注解来配置 HA。

创建 `Ingress` 或 `Service` 时，operator 会：

* 为每个副本配置一个配置 `Secret`。
* 配置一个包含 Tailscale Serve 配置（L7）或 `iptables`/`nftables` DNAT 规则（L3）的 `ConfigMap`。
* 配置 `Ingress` `ProxyGroup`，由它转发流量，让 tailnet 中任意位置的设备都能访问你的 `Ingress` 指向的 `Service`。
* 为该 `Ingress ProxyGroup` 创建一个 [Tailscale Service][docs-tailscale-services]。

*（图：Tailscale Kubernetes Operator 为 Ingress ProxyGroup 创建每副本 Secret、ConfigMap 和 Service 的架构图。Operator 配置 Ingress ProxyGroup 将来自 tailnet 客户端的流量转发到 Kubernetes Service。）*

要以 HA 模式开始使用 `Ingress`，请参阅上面链接的 L7 或 L3 设置指南。`Ingress` `ProxyGroup` pod 需要[额外权限][docs-permissions]。

## TLS 证书与限制

operator 及其代理会自动从 Let's Encrypt 签发证书。Let's Encrypt 对证书签发有速率限制，这可能影响繁忙或频繁重新部署的集群。要了解这些限制并配置 operator 在限制范围内工作，请参阅 [Let's Encrypt 速率限制][docs-lets-encrypt-rate-limits]。

## 进一步探索

* 使用 Tailscale Funnel 将 Kubernetes 工作负载暴露到公共互联网，见[使用 Tailscale Funnel 将 Kubernetes 集群工作负载暴露到公共互联网][docs-expose-internet]。
* 跨多个 Kubernetes 集群配置入站，见[配置带区域路由的多集群入站][docs-multi-cluster]。
* 让运行在不同 Kubernetes 集群中的服务相互通信，见[跨集群连接服务][docs-multi-cluster-mirroring]。
* 在 IPv6 环境中部署 Tailscale Kubernetes Operator，见 [Tailscale Kubernetes Operator 的 IPv6 支持][docs-ipv6]。

[ar-ha-ingress]: #高可用ha入站

[ar-layer-3-ingress]: #独立-l3-入站tcpudp

[ar-layer-7-ingress]: #面向-http-和-https-的独立-l7-入站

[ar-tls-certificates]: #tls-证书与限制

[docs-expose-internet]: /docs/kubernetes-operator/ingress/expose-workload-to-internet

[docs-expose-l3]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l3

[docs-expose-l7]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-ipv6]: /docs/kubernetes-operator/reference/ipv6

[docs-lets-encrypt-rate-limits]: /docs/kubernetes-operator/manage-and-configure/lets-encrypt-rate-limits

[docs-multi-cluster]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-multi-cluster-mirroring]: /docs/kubernetes-operator/ingress/multi-cluster-service-mirroring

[docs-permissions]: /docs/kubernetes-operator/reference/rbac

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[docs-serve]: /docs/features/tailscale-serve

[docs-tailscale-services]: /docs/features/tailscale-services
