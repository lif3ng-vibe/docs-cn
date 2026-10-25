---
title: "向你的 tailnet 暴露 Amazon RDS"
description: "你可以使用 Tailscale Kubernetes Operator 将任何云服务（例如集群网络上的 RDS 数据库）暴露给你的 tailnet。如果你有一个不对外公开、但可从该云上的 Kubernetes 集群访问的云服务"
---

最后验证于 Jun 5, 2026

你可以使用 Tailscale Kubernetes Operator 将任何云服务（例如集群网络上的 RDS 数据库）暴露给你的 tailnet。如果你有一个不对外公开、但可从该云上的 Kubernetes 集群访问的云服务，就可以使用部署在该集群中的 operator 将其开放给你的 tailnet。

## 前提条件

开始之前，请确保你已具备以下条件：

* 已在集群中[安装][docs-operator] Tailscale Kubernetes Operator。
* 一个可从集群内部访问的 Amazon RDS 实例或其他云服务，例如位于同一 VPC 中。
* 用于获取代理 MagicDNS 名称的 [view-secret kubectl 插件][xt-view-secret]。
* 一个数据库客户端（如 `psql` 或 `mysql`），用于从 tailnet 设备连接服务。

## 使用 Kubernetes ExternalName Service 暴露云服务

如果你想暴露的云服务具有可在集群内解析的 DNS 名称，可以使用 [`ExternalName` `Service`][xt-externalname] 来暴露它。

例如，要暴露一个 RDS 数据库并从 tailnet 客户端连接它，可以创建一个 `ExternalName` `Service`，将 `tailscale.com/expose` 注解设为 `"true"`，并将 `spec.externalName` 字段设为 RDS 实例的 DNS 名称：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-rds
  annotations:
    tailscale.com/expose: "true"
spec:
  type: ExternalName
  externalName: my-rds.eu-central-1.rds.amazonaws.com
```

接下来，使用 [view-secret kubectl 插件][xt-view-secret] 获取 operator 为该 `Service` 创建的集群代理的 Tailscale MagicDNS 名称：

```shell
rds_magic_dns_name=$(kubectl view-secret \
  $(kubectl get secret -n tailscale   \
  --selector tailscale.com/parent-resource=my-rds,tailscale.com/parent-resource-ns=default,tailscale.com/parent-resource-type=svc \
  -ojsonpath='{.items[0].metadata.name}') \
  -n tailscale \
  device_fqdn)
```

你可以使用代理的 MagicDNS 名称作为数据库主机名，从 tailnet 客户端连接 RDS 实例。例如，对于 PostgreSQL 数据库：

```shell
psql -h ${rds_magic_dns_name} -U postgres
```

为 `ExternalName` `Service` 资源创建的集群代理会转发 TCP 流量，因此可以将它们与任何基于 TCP 的协议一起使用，例如 PostgreSQL、MySQL 或 Redis。Tailscale Kubernetes Operator 每隔 10 分钟尝试解析后端云服务的 IP 地址，并在需要时重新配置代理规则。

> **注意：**
>
> 对于以 [nftables 模式部署防火墙][docs-firewall-mode]的代理，流量只会被代理到 DNS 名称解析出的第一个 IP 地址。

## 使用 Connector 暴露 CIDR 网段

如果云服务没有可在集群内解析的 DNS 名称，或者你想暴露一个 CIDR 网段内的多个服务，请使用 [`Connector`][docs-k8s-connector] 资源：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Connector
metadata:
  name: my-rds-instances
spec:
  subnetRouter:
    advertiseRoutes:
      - "<rds-cidr-range>"
```

这个 `Connector` 会配置 operator 部署一个集群内[子网路由器][docs-subnets]，将配置的 CIDR 网段暴露给你的 tailnet。

## 进一步探索

* [自定义][docs-k8s-customize] Operator 及其管理的资源。
* [排查][docs-k8s-troubleshoot] Operator 及其管理资源的常见问题。

[docs-firewall-mode]: /docs/features/firewall-mode

[docs-k8s-connector]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-k8s-customize]: /docs/kubernetes-operator/concepts/proxyclass

[docs-k8s-troubleshoot]: /docs/kubernetes-operator/reference/troubleshooting

[docs-operator]: /docs/kubernetes-operator/install-operator

[docs-subnets]: /docs/features/subnet-routers

[xt-externalname]: https://kubernetes.io/docs/concepts/services-networking/service/#externalname

[xt-view-secret]: https://github.com/elsesiy/kubectl-view-secret
