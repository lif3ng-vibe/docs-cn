---
title: "从 Kubernetes 集群访问 tailnet 设备"
description: "你可以通过创建出站代理，让 Kubernetes 集群工作负载访问 tailnet 设备。这适用于访问托管在 tailnet 设备上的数据库、内部工具或其他服务"
---

最后验证于 Jun 5, 2026

你可以通过创建出站代理，让 Kubernetes 集群工作负载访问 tailnet 设备。这适用于访问托管在 tailnet 设备上的数据库、内部工具或其他服务。

你的集群工作负载使用 Kubernetes `Service` 名称访问 tailnet 设备，就像访问其他集群内 Kubernetes `Service` 一样。

*（图：用于从 Kubernetes 集群访问 tailnet 设备的 ProxyGroup 出站架构图。）*

## 前提条件

开始之前，请确保你已具备以下条件：

* 已[安装][docs-k8s-install] Tailscale Kubernetes Operator。
* 一台已连接到 tailnet、且你想访问的设备。
* 一个出站 `ProxyGroup`。示例见下一节。

## 创建出站 ProxyGroup

创建一个 `spec.type` 设为 `egress` 的 `ProxyGroup`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: egress-proxies
spec:
  type: egress
  replicas: 2
```

生产环境配置选项请参阅[高可用][docs-ha]。

## 创建出站 Kubernetes Service

创建一个引用 `ProxyGroup` 和 tailnet 设备的 Kubernetes ExternalName `Service`：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-tailnet-device
  annotations:
    tailscale.com/tailnet-fqdn: "<device-name>.<tailnet>.ts.net"
    tailscale.com/proxy-group: "egress-proxies"
spec:
  type: ExternalName
  externalName: placeholder
  ports:
    - port: 80
      protocol: TCP
      name: http
```

operator 会覆写 `externalName` 字段。`tailscale.com/tailnet-fqdn` 的值必须是设备的完整 MagicDNS 名称，而不能只有主机名。请将 `spec.ports` 设置为与目标设备暴露的端口一致。

> **提示：**
>
> 你也可以用同样的模式访问 [Tailscale Service][docs-tailscale-services]（tailnet 中的稳定 VIP）。配置完全相同：将 `tailscale.com/tailnet-fqdn` 设置为该 Tailscale Service 的 MagicDNS 名称。

> **注意：**
>
> 你也可以使用 `tailscale.com/tailnet-ip` 按设备的 Tailscale IP 地址指定目标。该值可以是 tailnet 的 IPv4 或 IPv6 地址，也可以是 Tailscale 子网路由器暴露的地址。在同一个 Kubernetes `Service` 上，`tailscale.com/tailnet-fqdn` 和 `tailscale.com/tailnet-ip` 只能设置其中一个。Tailscale 建议使用 MagicDNS 名称，这样当 IP 地址变化时代理会自动更新。
>
> Kubernetes `ExternalName` `Service` 必须在 `spec.ports` 中显式列出你想访问的所有端口。只有 `port`、`protocol` 和 `name` 会被使用；其他端口字段不生效。

## 验证出站服务

等待 Kubernetes `Service` 就绪：

```shell
kubectl wait svc my-tailnet-device --for=condition=TailscaleEgressSvcReady=true --timeout=5m
```

使用 Kubernetes DNS 名称从工作负载访问 tailnet 设备：

```shell
curl http://my-tailnet-device.default.svc.cluster.local
```

流量会在 `ProxyGroup` 各副本之间以轮询方式负载均衡。任意数量的出站 Kubernetes Service 都可以引用同一个 `ProxyGroup`。

> **提示：**
>
> 如果你的工作负载需要使用 MagicDNS 名称连接 tailnet 设备（例如用于 TLS 证书验证），请参阅[在集群中启用 MagicDNS 解析][docs-magicdns-resolution]。

## 进一步探索

* [在集群中启用 MagicDNS 解析][docs-magicdns-resolution]，让工作负载可以使用 MagicDNS 名称连接。
* 进一步了解 Tailscale Kubernetes Operator 中的[出站][docs-egress]。
* 为生产部署配置[高可用][docs-ha]。
* 使用 [Tailscale Services][docs-tailscale-services] 获得 tailnet 中的稳定 VIP。

[docs-egress]: /docs/kubernetes-operator/egress

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-magicdns-resolution]: /docs/kubernetes-operator/egress/enable-magicdns-resolution

[docs-tailscale-services]: /docs/features/tailscale-services
