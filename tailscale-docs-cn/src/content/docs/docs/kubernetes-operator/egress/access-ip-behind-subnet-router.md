---
title: "访问子网路由器背后的 IP 地址"
description: "你可以使用出站 `ProxyGroup`，让 Kubernetes 集群工作负载能够访问[子网路由器][docs-subnet-routers]背后的 IP 地址。这适用于访问不在 tailnet 中、但可经由子网路由器到达的资源"
---

最后验证于 Jun 5, 2026

你可以使用出站 `ProxyGroup`，让 Kubernetes 集群工作负载能够访问[子网路由器][docs-subnet-routers]背后的 IP 地址。这适用于访问不在 tailnet 中、但可经由子网路由器到达的资源，例如私有网络上的数据库或内部服务。

你的集群工作负载使用 Kubernetes `Service` 名称访问目标，就像访问其他集群内 Kubernetes `Service` 一样。

*（图：用于访问子网路由器背后 IP 地址的 ProxyGroup 出站架构图。）*

## 前提条件

开始之前，请确保你已具备以下条件：

* 已[安装][docs-k8s-install] Tailscale Kubernetes Operator。
* 一个通告了包含目标 IP 地址的路由的[子网路由器][docs-subnet-routers]。

## 创建接受路由的 ProxyClass

要访问目标 IP 地址，出站代理必须接受通告的子网路由。创建一个启用了 `acceptRoutes` 的 `ProxyClass`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: accept-routes
spec:
  tailscale:
    acceptRoutes: true
```

## 创建出站 ProxyGroup

创建一个 `spec.type` 设为 `egress`、`spec.proxyClass` 设为上面创建的 `ProxyClass` 的 `ProxyGroup`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: egress-proxies
spec:
  type: egress
  replicas: 2
  proxyClass: accept-routes
```

生产环境配置选项请参阅 [Tailscale Kubernetes Operator 高可用][docs-ha]。

## 创建出站 Kubernetes Service

创建一个引用 `ProxyGroup` 和目标 IP 地址的 Kubernetes `ExternalName` `Service`：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-subnet-target
  annotations:
    tailscale.com/tailnet-ip: "<ip-behind-subnet-router>"
    tailscale.com/proxy-group: "egress-proxies"
spec:
  type: ExternalName
  externalName: placeholder
  ports:
    - port: 80
      protocol: TCP
      name: http
```

`externalName` 字段会被 Operator 覆写。请将 `spec.ports` 设置为与目标暴露的端口一致。

> **注意：**
>
> Kubernetes `ExternalName` `Service` 必须在 `spec.ports` 中显式列出你想访问的所有端口。只有 `port`、`protocol` 和 `name` 会被使用，其他端口字段不生效。

## 验证访问

等待 Kubernetes `Service` 就绪：

```shell
kubectl wait svc my-subnet-target --for=condition=TailscaleEgressSvcReady=true --timeout=5m
```

使用 Kubernetes DNS 名称从工作负载访问目标：

```shell
curl http://my-subnet-target.default.svc.cluster.local
```

流量会在 `ProxyGroup` 各副本之间以轮询方式负载均衡。任意数量的出站 `Service` 资源都可以引用同一个 `ProxyGroup`。

## 访问 4via6 地址

你还可以访问 [4via6 子网路由器][docs-4via6]背后的 IP 地址。配置与上面相同，只是目标改为 4via6 MagicDNS 名称或合成 IPv6 地址，而不是普通 IP 地址。

> **注意：**
>
> 出站代理所在的集群必须支持 IPv6 才能使用 4via6 地址。

MagicDNS 名称格式为 `<IPv4-with-hyphens>-via-<siteID>.<tailnet>.ts.net`：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-4via6-target
  annotations:
    tailscale.com/tailnet-fqdn: "10-1-0-5-via-7.<tailnet>.ts.net"
    tailscale.com/proxy-group: "egress-proxies"
spec:
  type: ExternalName
  externalName: placeholder
  ports:
    - port: 80
      protocol: TCP
      name: http
```

将 `<tailnet>` 替换为你的 tailnet 名称，并根据目标调整 IPv4 地址、站点 ID 和端口。

你也可以使用 `tailscale.com/tailnet-ip` 直接指向合成 IPv6 地址：

```yaml
annotations:
  tailscale.com/tailnet-ip: "fd7a:115c:a1e0:b1a:0:7:a01:5"
  tailscale.com/proxy-group: "egress-proxies"
```

使用 `tailscale debug via <siteID> <IPv4>` 生成合成 IPv6 地址。你的 tailnet 中必须有一个对等节点正在通告包含该 4via6 地址的子网路由。

## 限制

以下限制适用于经由子网路由器的基于 IP 的出站访问：

* 仅支持单个 IP 地址，不支持 IP 网段。

更多信息请参阅 [IPv6 支持][docs-ipv6]。

## 进一步探索

* 使用出站代理从 Kubernetes 集群[访问 tailnet 设备][docs-access-device]。
* 进一步了解 Tailscale Kubernetes Operator 中的[出站][docs-egress]。
* 为生产部署配置[高可用][docs-ha]。
* 进一步了解[子网路由器][docs-subnet-routers]。

[docs-4via6]: /docs/features/subnet-routers/4via6-subnets

[docs-access-device]: /docs/kubernetes-operator/egress/access-tailnet-service

[docs-egress]: /docs/kubernetes-operator/egress

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-ipv6]: /docs/kubernetes-operator/reference/ipv6

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-subnet-routers]: /docs/features/subnet-routers
