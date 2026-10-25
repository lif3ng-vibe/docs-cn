---
title: "使用 Egress 从集群访问 tailnet 资源"
description: "使用 Tailscale Kubernetes Operator 从 Kubernetes 集群访问 tailnet 资源。"
---

最后验证于 Jun 5, 2026

集群出站（egress）让运行在 Kubernetes 集群中的工作负载能够访问 tailnet 中的设备和服务，而这些工作负载自身无需运行 Tailscale。

本主题介绍出站架构和可用的代理模式。

## 概述

出站的工作方式是创建一个 Kubernetes `ExternalName` `Service`，充当指向 tailnet 目标的集群内代理。你的工作负载像连接其他 Kubernetes `Service` 一样连接这个 `Service`，出站代理再将流量经由 tailnet 转发到目标设备。

你可以通过以下两种方式指定 tailnet 目标：

* **MagicDNS 名称**：使用 `tailscale.com/tailnet-fqdn` 注解（例如 `db.example.ts.net`）。代理使用 tailnet netmap 解析该 FQDN，并在目标的 IP 地址变化时自动更新。
* **Tailnet IP 地址**：使用 `tailscale.com/tailnet-target-ip` 注解。代理直接转发到指定的 IP 地址。

独立部署和[高可用][ar-ha-egress]配置均受支持。独立模式运行单个出站代理 pod，而高可用模式使用具有多个副本的 [ProxyGroup][docs-proxygroup]。生产环境建议使用高可用模式。

## 独立出站

在独立模式下，你在一个 `ExternalName` `Service` 上添加指向 tailnet 目标的注解。`Service` 创建时，operator 会：

* 创建一个指向出站代理 pod 的 headless `Service`。
* 创建一个合并的配置与状态 `Secret`。
* 创建一个将流量转发到 tailnet 目标的出站代理 `Pod`（单副本 `StatefulSet`）。
* 更新 `ExternalName` `Service`，使其指向 headless `Service`。

你的工作负载对 `ExternalName` `Service` 的 DNS 查询会解析到 headless `Service`，再路由到出站代理 pod。代理 pod 使用 `iptables` 或 `nftables` DNAT 规则，将流量经由 tailnet 转发到目标设备。

*（图：L3 独立出站架构图。Operator 创建一个出站代理 pod、一个 headless Service 和一个配置 Secret。ExternalName Service 解析到 headless Service，后者通过出站代理将流量路由到 tailnet 设备。）*

要开始使用出站，请参阅[进一步探索][ar-further]中的指南。

## 高可用（HA）出站

高可用出站与独立版本类似，但使用 `spec.type: egress` 的 [ProxyGroup][docs-proxygroup] 部署多个副本。这让你可以：

* 通过多个活跃的出站代理转发流量，避免代理 pod 重启期间服务中断。
* 由一组共享的代理 pod 承载多个 `ExternalName` 服务。

你通过在 `ExternalName` `Service` 上添加 `tailscale.com/proxy-group` 注解来配置 HA 出站。

创建带有正确注解的 `ExternalName` `Service` 时，operator 会：

* 在 operator 的命名空间中为每个出站目标创建一个 `ClusterIP` `Service` 和 `EndpointSlice`。`ExternalName` `Service` 上定义的每个端口都会映射到 `ClusterIP` `Service` 上随机分配的端口。
* 使用该目标的端口映射更新出站 `ConfigMap`（随 `ProxyGroup` 一同创建）。这个 `ConfigMap` 会挂载到所有 `ProxyGroup` pod 上，告知每个代理哪个入站端口对应哪个 tailnet 目标。
* 更新 `ExternalName` `Service`，使其指向 `ClusterIP` `Service`。

流量从你的工作负载流向 `ExternalName` `Service`，并解析到 `ClusterIP` `Service`。`kube-proxy` 通过 `EndpointSlice` 将流量路由到 `ProxyGroup` pod IP。代理 pod 使用 `iptables` 或 `nftables` DNAT 规则，将流量经由 tailnet 转发。

*（图：ProxyGroup 出站架构图。StatefulSet 中的多个代理 pod 副本通过 ClusterIP Service 和 EndpointSlice，将来自 ExternalName Service 的流量转发到 tailnet 设备。）*

HA 出站支持优雅故障转移：当某个代理 pod 被终止时，进行中的连接会自动排空到其他副本。

要开始使用 HA 出站，请参阅[使用 ProxyGroup 实现高可用][docs-ha]。

## 进一步探索

* 从集群中按 MagicDNS 名称或 tailnet IP 地址[访问 tailnet 设备][docs-access-device]。
* 从集群工作负载[访问子网路由器背后的 IP 地址][docs-access-subnet-ip]。
* 通过出站代理[向你的 tailnet 暴露 Amazon RDS][docs-expose-rds]。
* [启用 MagicDNS 解析][docs-magicdns-resolution]，让工作负载能在集群中解析 tailnet 名称。
* [配置高可用][docs-ha]，为生产环境运行多个出站代理副本。

[ar-ha-egress]: #高可用ha出站

[ar-further]: #进一步探索

[docs-access-device]: /docs/kubernetes-operator/egress/access-tailnet-service

[docs-access-subnet-ip]: /docs/kubernetes-operator/egress/access-ip-behind-subnet-router

[docs-expose-rds]: /docs/kubernetes-operator/egress/expose-rds-to-tailnet

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-magicdns-resolution]: /docs/kubernetes-operator/egress/enable-magicdns-resolution

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup
