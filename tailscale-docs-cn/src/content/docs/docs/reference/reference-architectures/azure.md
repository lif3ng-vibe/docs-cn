---
title: "Azure 参考架构"
description: "本文档详细介绍在 Microsoft Azure 上部署 Tailscale 的最佳实践与参考架构。以下指引适用于 Tailscale 的各种运行模式——例如设备、出口节点和子网路由器。"
---

最后验证于 Oct 7, 2026

本文档详细介绍在 Microsoft Azure 上部署 Tailscale 的最佳实践与参考架构。以下指引适用于 Tailscale 的各种运行模式——例如设备、出口节点和子网路由器。

> **注意：**
>
> **Tailscale 设备**——就本文档而言，Tailscale 设备可以指 Tailscale 节点、出口节点、子网路由器等。更多术语请参阅[术语与概念][docs-terminology-and-concepts]。

## 总体架构

*（图：通过 Tailscale 访问 Azure 资源的可能部署方式）*

## 部署 Tailscale 与 Azure 资源互连的几种方式

Tailscale 提供了多种连接 Azure 内资源的方式。总体来看包括：

* **[代理到代理连接][ar-agent-to-agent-connectivity]**（Agent-to-Agent connectivity）——连接到虚拟机（VM）这类"静态"资源。适用于可以直接在要连接的资源上安装并运行 Tailscale 的场景。
* **[通过 Tailscale 子网路由器实现基于 IP 的连接][ar-subnet-router-ip-connect]**——连接到 Azure 托管资源（如 Azure SQL 或 Azure Cosmos DB）。适用于无法在目标资源上运行 Tailscale，或希望把现有[子网][docs-subnets]或虚拟网络中的服务暴露给 tailnet 的场景。
* **[通过 Tailscale 应用连接器实现基于 DNS 的路由][ar-dns-routing-with-app-connector]**——通过 tailnet 以基于 DNS 的路由方式连接软件即服务（SaaS）应用或其他资源。
* **[通过 Tailscale Kubernetes Operator 提供 Kubernetes 服务与认证代理][ar-services-and-api-proxy]**——将 Azure Kubernetes Service（AKS）集群中的服务和 AKS 集群控制平面直接暴露到 Tailscale 网络。适用于连接 Kubernetes 集群中运行的资源，或连接 Kubernetes 集群控制平面的场景。
* **[Azure Functions、Azure App Service 及其他容器解决方案][ar-functions-app-service-containers]**——从 Azure Functions、Azure App Service 及其他容器解决方案访问 tailnet 中的资源。

### 代理到代理连接

我们建议尽可能[安装 Tailscale agent][docs-installation]——例如在 Azure VM 上[设置服务器][docs-set-up-servers]。这种方式通常能提供最佳、最易扩展的连接性，同时支持 Tailscale SSH 等基于 Tailscale agent 的功能。

通用指南请参阅[使用 Tailscale 私有访问 Azure Linux VM][docs-cloud-azure-linux]和[使用 Tailscale 私有访问 Azure Windows VM][docs-cloud-azure-windows]。

### 通过子网路由器实现基于 IP 的连接

对于无法安装 Tailscale agent 的托管资源（如 Azure SQL 或 Azure Cosmos DB），你可以在虚拟网络内运行[子网路由器][docs-subnets]，让 Tailscale 由此访问这些资源。

### 通过应用连接器实现基于 DNS 的路由

[应用连接器][docs-app-connectors]会代理已配置域名的 DNS 查询，并为返回的 IP 地址通告路由。对于使用 IP 允许列表的应用，请将应用连接器的出站 IP 地址加入允许列表，客户端流量便会从被允许的地址到达这些应用。

### Tailscale Kubernetes Operator 的 Kubernetes 服务与 API 服务器代理

[Tailscale Kubernetes Operator][docs-kubernetes-operator]让你可以把 Kubernetes 集群中的服务暴露到 Tailscale 网络，并使用 API 服务器代理安全地连接 Kubernetes 控制平面。

### Azure Functions、Azure App Service 及其他容器解决方案

Tailscale 支持[用户态网络模式][docs-userspace-networking]：容器内的进程可以通过 SOCKS5 或 HTTP 代理连接 Tailscale 网络上的其他资源。这让 [Azure Functions][xt-azure-functions]、[Azure App Service][xt-azure-app-service]及其他基于容器的方案只需极少配置即可接入 Tailscale 网络。

通用指南请参阅[在 Azure App Service 上使用 Tailscale][docs-azure-app-service]。

## 生产环境最佳实践

以下是在生产环境中运行 Tailscale 的一般建议与最佳实践，其中大部分内容会在本文档中更详细地展开：

* 如果条件允许，请将[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]、[应用连接器][docs-app-connectors]等部署到拥有公网 IP 地址的公有子网，以确保[直连][docs-connection-types]并获得最佳性能。
* 将子网路由器、出口节点、应用连接器等与你用 Tailscale 管理的系统分开运行——例如，把子网路由器运行在 Azure AKS 集群之外。
* 将动态扩缩的资源（例如容器或无服务器函数）部署为[临时节点（ephemeral node）][docs-ephemeral-nodes]，以便在设备关闭后自动清理。

### 高可用性与路由选择

* 跨 Azure 可用区运行多个[子网路由器][docs-subnets]和[应用连接器][docs-app-connectors]，以实现[高可用性][docs-high-availability]。对于跨区域部署，请对比各种[路由选择方案][docs-route-selection]。
* 跨 Azure 可用区运行多个 Tailscale SSH 会话录制节点，实现[录制节点故障转移][docs-multiple-recorder-nodes]。

## 性能最佳实践

一般性建议请参阅[性能最佳实践][docs-performance-best-practices]。

### 区域内负载均衡

启用区域路由后，在同一 [DERP][docs-derp-servers] 区域部署相互重叠的子网路由器或应用连接器，即可获得[区域内负载均衡][docs-high-availability-region-load-balancing]与冗余。Tailscale 会以尽力而为的方式分发客户端。

### 推荐的 VM 规格

选择 Azure VM 规格时，请考虑这台设备是用作普通设备，还是充当子网路由器、出口节点或应用连接器。

#### 常规用法

如果在 Azure VM 上安装 Tailscale 只是作为"普通"Tailscale 设备（例如并非子网路由器、出口节点等），那么该 VM 的规格大概率已适合其工作负载，在其上运行 Tailscale 带来的资源开销几乎可以忽略不计。

#### 子网路由器、出口节点与应用连接器

影响性能的变量很多，工作负载也千差万别，因此我们无法给出具体的规格推荐，但对于以[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]或[应用连接器][docs-app-connectors]身份运行的 Azure VM，我们有以下一般性选型建议：

* 一般来说，更高的 CPU 主频比更多的核心数更重要。
* 一般来说，采用 Ampere Altra ARM 处理器的 VM 在数据包转发方面性价比相当高。
* 使用非突发型 VM 规格，以获得稳定的 CPU 性能。
  * 根据 [Azure 文档][xt-entra-burstable-vms]，突发性能型机器规格（如 B 系列 VM）采用 CPU 积分机制，可能导致性能波动。
* 由于做了额外的优化，Tailscale 在 Linux 上的表现通常优于其他操作系统。

## 将 Tailscale 与 Azure 配合使用

根据你使用 Azure 和 Tailscale 的方式，需要考虑网络安全组、子网、DNS 和虚拟网络等方面的因素。

### 网络安全组

Tailscale 使用各种 [NAT 穿透技术][bl-how-nat-traversal-works]，在无需人工干预的情况下安全地连接其他 Tailscale 节点。绝大多数情况下，你无需为 Tailscale 打开任何[防火墙端口][docs-firewalls]。但如果你的虚拟网络和网络安全组对发往互联网的出站流量限制过严，请参阅[使用 Tailscale 应打开哪些防火墙端口][docs-firewall-ports]。

### 公有子网与私有子网

部署在拥有公网 IP 地址的公有子网中的 Tailscale 设备可以在节点之间建立[直连][docs-connection-types]，获得最佳性能。

#### Azure NAT Gateway

Tailscale 同时使用[直连和中继连接][docs-connection-types]，并尽可能优先选择直连。Azure NAT Gateway 属于[硬 NAT（Hard NAT）][docs-device-connectivity-hard-nat]，会阻止直连，迫使连接改用 [DERP 中继服务器][docs-derp-servers]，这会导致吞吐量和性能低于直连。

Tailscale [对等中继（peer relay）][docs-peer-relays]让你在网络条件导致无法直连时（例如设备位于 Azure NAT Gateway 后面的私有子网中），把 tailnet 中的设备用作高吞吐量中继服务器。要绕过 Azure NAT Gateway，请按照相应步骤把对等中继部署并[配置][docs-peer-relays-get-started]到虚拟网络中拥有公网 IP 地址的公有子网，并允许 UDP 流量入站到中继端口。

### 虚拟网络 DNS 解析

要让 tailnet 中的非 Azure 设备能够查询 Azure DNS 私有区域，请为你的虚拟网络创建 [Azure DNS 私有解析程序][xt-entra-dns-private-resolver]，并配置[拆分 DNS（split DNS）][docs-dns-using-settings]，把针对虚拟网络内部域名后缀的查询转发到 DNS 私有解析程序入站端点的 IP 地址。

### 虚拟网络对等互连

[虚拟网络对等互连][xt-entra-network-peering]是把多个虚拟网络连接起来的常用策略。你可以在一个虚拟网络中部署子网路由器（或部署多台以实现高可用），从而访问多个虚拟网络。

如果你的虚拟网络或子网存在 IPv4 地址重叠，请使用 [4via6 子网路由器][docs-4via6-subnets]，为每个重叠子网分配唯一的 IPv6 地址来访问资源。

### 子网路由器

请考虑子网路由器的运行位置与其提供访问的 Azure 资源之间的相对关系。

#### 在 Azure AKS 中运行子网路由器

很多组织会使用 Tailscale 来连接和管理 Azure AKS 集群。虽然 Tailscale 可以[在容器中运行][docs-userspace-networking]并部署到 AKS，但我们建议把[子网路由器][docs-subnets]运行在这些集群之外，以确保集群出现问题时连接依然可用。换句话说，请把子网路由器运行在专用 VM 上，或运行在独立于被管理集群的另一套 AKS 集群上。

### Tailscale SSH 会话录制

跨多个可用区部署[多个会话录制器实例][docs-multiple-recorder-nodes]，以提高对可用区故障的抵御能力。如果你的组织跨多个区域运营，请考虑在每个运营区域部署 SSH 会话录制节点，并[配置 SSH 访问规则][docs-tailscale-ssh-session-turn-on]，让节点把录制信息发送到所在区域。

## 局限性

* Azure NAT Gateway 是一种[硬 NAT][ar-azure-nat-gateway]。位于 Azure NAT Gateway 后面的所有设备和服务都会通过 [DERP 中继服务器][docs-derp-servers]建立连接。为获得最佳性能，请把设备放在[公有子网][ar-public-vs-private-subnets]中，以便建立直连。

[ar-agent-to-agent-connectivity]: #代理到代理连接

[ar-azure-nat-gateway]: #azure-nat-gateway

[ar-dns-routing-with-app-connector]: #通过应用连接器实现基于-dns-的路由

[ar-functions-app-service-containers]: #azure-functionsazure-app-service及其他容器解决方案

[ar-public-vs-private-subnets]: #公有子网与私有子网

[ar-services-and-api-proxy]: #tailscale-kubernetes-operator-的-kubernetes-服务与-api-服务器代理

[ar-subnet-router-ip-connect]: #通过子网路由器实现基于-ip-的连接

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-app-connectors]: /docs/features/app-connectors

[docs-azure-app-service]: /docs/install/cloud/azure/azure-app-service

[docs-cloud-azure-linux]: /docs/install/cloud/azure/linux

[docs-cloud-azure-windows]: /docs/install/cloud/azure/windows

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-connectivity-hard-nat]: /docs/reference/device-connectivity#hard-nat

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-firewalls]: /docs/integrations/firewalls

[docs-high-availability-region-load-balancing]: /docs/features/route-selection#regional-routing

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-installation]: /docs/install

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-multiple-recorder-nodes]: /docs/reference/multiple-recorder-nodes

[docs-peer-relays-get-started]: /docs/features/peer-relay#get-started

[docs-peer-relays]: /docs/features/peer-relay

[docs-performance-best-practices]: /docs/reference/best-practices/performance

[docs-route-selection]: /docs/features/route-selection

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh-session-turn-on]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording#turn-on-session-recording-in-your-tailnet-policy-file

[docs-terminology-and-concepts]: /docs/reference/glossary

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-azure-app-service]: https://azure.microsoft.com/en-us/products/app-service

[xt-azure-functions]: https://azure.microsoft.com/en-us/products/functions

[xt-entra-burstable-vms]: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-b-series-burstable

[xt-entra-dns-private-resolver]: https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview

[xt-entra-network-peering]: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview
