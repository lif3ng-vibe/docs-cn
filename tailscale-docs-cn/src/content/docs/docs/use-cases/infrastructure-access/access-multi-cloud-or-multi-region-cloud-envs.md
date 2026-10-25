---
title: "管理多云或多地区云环境的访问"
description: "跨多个云提供商或地区管理基础设施，通常需要 VPN 网关、VPC 对等互连协议以及各云平台特有的路由配置。Tailscale 提供了另一种"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**子网路由器**](/docs/features/subnet-routers)——使用子网路由器让本地网络之外的设备访问特定子网内的服务，用 Tailscale 扩展你的私有网络。

跨多个云提供商或地区管理基础设施，通常需要 VPN 网关、VPC 对等互连协议以及各云平台特有的路由配置。Tailscale 提供了另一种选择：在所有环境中创建一张加密的覆盖网络。tailnet 中任何位置的设备都能访问云上私有资源，而无需开放入站防火墙端口或管理复杂的对等互连配置。

## 用子网路由器连接云 VPC

[子网路由器][docs-subnet-routers]把一段私有 IP 范围暴露给 tailnet，让任何 tailnet 设备都能访问该网络中的主机，而无需在每台主机上运行 Tailscale。在每个 VPC 或云地区部署一台子网路由器，让它的私有 CIDR 网段在你的所有环境中可达。

1. 在每个 VPC 中的一台虚拟机上安装 Tailscale：

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. 宣告它的私有子网：

   ```bash
   sudo tailscale up --advertise-routes=10.0.0.0/16 --advertise-tags=tag:subnet-router
   ```

3. 打开管理控制台的[机器](https://console.tailscale.com/admin/machines)页面，批准每台子网路由器宣告的路由。每个云环境或地区都要重复此操作。Tailscale 会处理好路由，让客户端针对每个 CIDR 网段找到正确的子网路由器。

## 跨环境解析内部主机名

[MagicDNS][docs-magicdns] 会为 tailnet 中的每台设备分配一个一致的 `<device-name>.<tailnet-name>.ts.net` 主机名。工程师和服务都可以使用这些主机名访问任何云资源，无论它运行在哪个提供商或地区。

对于云内部 DNS 区域，使用 [split DNS][docs-split-dns]（分流 DNS）把特定域名的查询转发给该环境中的子网路由器。这样设备就能从 tailnet 中的任何位置解析云上私有主机名，同时不公开暴露这些区域。

## 控制云环境之间的访问

[标签][docs-tags]和[授权][docs-grants]让你定义哪些工作负载可以访问哪些云网络。按环境为子网路由器和目标服务打标签，这样在新增云地区或提供商时，访问策略仍能保持一致。

下面这条授权让打有 `tag:app-server` 标签的服务可以访问 AWS 子网路由器宣告的任何主机：

```json
"grants": [
  {
    "src": ["tag:app-server"],
    "dst": ["tag:subnet-router-aws"],
    "ip": ["*"]
  }
]
```

通过管理控制台的[访问控制](https://console.tailscale.com/admin/acls/file)页面将授权添加到 tailnet 策略文件。为每台子网路由器打上云平台专属的标签，随着环境规模扩大，授权会更易于理解和审计。

## 连接 Kubernetes 集群

[Kubernetes Operator][docs-k8s-operator] 将 Tailscale 集成到你的集群中，让 pod、服务和 Kubernetes API 服务器从 tailnet 中的任何位置都可达。你可以把集群服务作为 tailnet 设备对外提供、让集群出站流量经由 tailnet 路由，以及连接跨集群的服务，而无需配置云负载均衡器或公网端点。

[docs-grants]: /docs/features/access-control/grants

[docs-k8s-operator]: /docs/kubernetes-operator

[docs-magicdns]: /docs/features/magicdns

[docs-split-dns]: /docs/features/split-dns-policies

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags
