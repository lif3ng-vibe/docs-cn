---
title: "Google Cloud Platform 参考架构"
description: "本文档详细介绍在 Google Cloud Platform（GCP）上部署 Tailscale 的最佳实践与参考架构。以下指引适用于 Tailscale 的各种运行模式——设备、出口节点、子网路由器等。"
---

最后验证于 Oct 7, 2026

本文档详细介绍在 Google Cloud Platform（GCP）上部署 Tailscale 的最佳实践与参考架构。以下指引适用于 Tailscale 的各种运行模式——设备、出口节点、子网路由器等。

> **注意：**
>
> 就本文档而言，采用以下术语：
>
> * **Tailscale 设备**——Tailscale 节点、出口节点、子网路由器等。
> * **Tailscale agent**——运行在设备上、使其能够连接 Tailscale 网络的 Tailscale 客户端。
> * **GCP 资源**——Google Cloud Platform 中的资源，可以是 GCE 实例、Cloud SQL 实例、Cloud Run 服务等。

## 总体架构

此图展示了 Tailscale 如何与 Google Cloud Platform 集成，为分布式云资源提供安全、可靠的网络连接。该架构展示了一个划分为多个可用区（zone）的虚拟私有云（VPC），每个可用区同时包含公有子网和私有子网，并战略性地部署了 Tailscale 组件。

*（图：通过 Tailscale 访问 Google Cloud 资源的可能部署方式）*

在公有子网中，部署了具备故障转移能力的 Tailscale 连接器，用于处理来自外部源的入站连接。这些连接器充当访问 Cloud SQL、Cloud Storage 等 GCP 平台服务的入口。与此同时，私有子网中托管着冗余的 Tailscale SSH 会话录制器，以确保安全监控的高可用性。

该架构在面向公众的组件与私有基础设施之间保持了清晰隔离，多条连接路径（Tailscale 连接器、Tailscale 实例、GKE 控制平面和 Cloud NAT）协同工作，提升整个云部署的可靠性、安全性与可访问性。

## 部署 Tailscale 与 GCP 资源互连的几种方式

Tailscale 提供了多种连接 GCP 内资源的方式。总体来看包括：

* **[代理到代理连接][ar-agent-to-agent-connectivity]**（agent-to-agent connectivity）——连接到 Google Compute Engine（GCE）实例这类"静态"资源。适用于可以直接在要连接的资源上安装并运行 Tailscale 的场景。
* **[通过 Tailscale 子网路由器实现基于 IP 的连接][ar-subnet-router-ip-connect]**——连接到 Cloud SQL、Spanner 等 GCP 托管资源。适用于无法在目标资源上运行 Tailscale，或希望把现有[子网][docs-subnets]或虚拟私有云（VPC）中的服务暴露给 tailnet 的场景。
* **[通过 Tailscale 应用连接器实现基于 DNS 的路由][ar-dns-routing-with-app-connector]**——通过 tailnet 以基于 DNS 的路由方式连接软件即服务（SaaS）应用或其他资源。
* **[通过 Tailscale Kubernetes Operator 提供 Kubernetes 服务与认证代理][ar-services-and-api-proxy]**——将 Google Kubernetes Engine（GKE）集群中的服务和 GKE 集群控制平面直接暴露到 Tailscale 网络。适用于连接 Kubernetes 集群中运行的资源，或连接 Kubernetes 集群控制平面的场景。
* **[Cloud Run 及其他容器服务][ar-cloud-run-and-other-container-services]**——从 Cloud Run、Cloud Run functions 及其他容器解决方案访问 tailnet 中的资源。

### 代理到代理连接

最佳实践是尽可能[安装 Tailscale agent][docs-installation]——例如在 GCE 实例上[设置服务器][docs-set-up-servers]时。直接在 GCE 实例上安装 Tailscale 通常能提供最佳、最易扩展的连接性，同时支持 Tailscale SSH 等基于 Tailscale agent 的功能。

### 通过子网路由器实现基于 IP 的连接

对于无法安装 Tailscale agent 的托管资源（如 Cloud SQL、Spanner 等），你可以在 VPC 内运行[子网路由器][docs-subnets]，让 Tailscale 由此访问这些资源。子网路由器还可以用来连接使用 [Private Service Connect][xt-gcp-private-service-connect] 的资源。

### 通过应用连接器实现基于 DNS 的路由

[应用连接器][docs-app-connectors]会代理已配置域名的 DNS 查询，并为返回的 IP 地址通告路由。对于使用 IP 允许列表的应用，请将应用连接器的出站 IP 地址加入允许列表，客户端流量便会从被允许的地址到达这些应用。

### Tailscale Kubernetes Operator 的 Kubernetes 服务与 API 服务器代理

[Tailscale Kubernetes Operator][docs-kubernetes-operator]让你可以把 Kubernetes 集群中的服务暴露到 Tailscale 网络，并使用 API 服务器代理安全地连接 Kubernetes 控制平面。

### Cloud Run 及其他容器服务

Tailscale 支持[用户态网络模式][docs-userspace-networking]：容器内的进程可以通过 SOCKS5 或 HTTP 代理连接 Tailscale 网络上的其他资源。这让 [Cloud Run][docs-cloudrun]、Cloud Run functions 及其他基于容器的方案只需极少配置即可接入 Tailscale 网络。

## 生产环境最佳实践

以下是在生产环境中运行 Tailscale 的一般建议与最佳实践，其中大部分内容会在本文档中更详细地展开：

* 如果条件允许，请将[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]、[应用连接器][docs-app-connectors]等部署到拥有公网 IP 地址的公有子网，以确保[直连][docs-connection-types]并获得最佳性能。
* 将子网路由器、出口节点、应用连接器等与你用 Tailscale 管理的系统分开运行——例如，把子网路由器运行在 GKE 集群之外。
* 将动态扩缩的资源（例如容器或无服务器函数）部署为[临时节点（ephemeral node）][docs-ephemeral-nodes]，以便在设备关闭后自动清理。

### 高可用性与路由选择

* 跨 GCP 可用区运行多个[子网路由器][docs-subnets]和[应用连接器][docs-app-connectors]，以实现[高可用性][docs-high-availability]。对于跨区域部署，请对比各种[路由选择方案][docs-route-selection]。
* 跨 GCP 可用区运行多个 Tailscale SSH 会话录制节点，实现[录制节点故障转移][docs-multiple-recorder-nodes]。

## 性能最佳实践

在 Google Cloud Platform（GCP）上部署 Tailscale 时，需要考虑多项性能因素，包括根据工作负载需求选择合适的实例类型、配置 Cloud NAT 以获得最优直连、有策略地部署子网路由器，以及通过多可用区部署保证高可用性。

一般性建议请参阅[性能最佳实践][docs-performance-best-practices]。

### 区域内负载均衡

启用区域路由后，在同一 [DERP][docs-derp-servers] 区域部署相互重叠的子网路由器或应用连接器，即可获得[区域内负载均衡][docs-high-availability-region-load-balancing]与冗余。Tailscale 会以尽力而为的方式分发客户端。

### 推荐的实例规格

为 GCP 上的 Tailscale 部署选择实例类型时，所需规格因实例角色而有很大差异。对于普通 Tailscale 设备，实例类型通常由主要工作负载决定，而非 Tailscale 的极低资源需求。但对于子网路由器、出口节点和应用连接器等特殊角色，则需要仔细考虑 CPU 性能、网络带宽上限和实例稳定性。以下是针对不同 Tailscale 部署场景的具体建议。

#### 常规用法

如果在 GCE 实例上安装 Tailscale 只是作为"普通"Tailscale 设备（例如并非子网路由器或出口节点），那么该实例的类型大概率已适合其工作负载，在其上运行 Tailscale 带来的资源开销几乎可以忽略不计。

#### 子网路由器、出口节点与应用连接器

影响性能的变量很多，工作负载也千差万别，因此我们无法给出具体的规格推荐，但对于以[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]或[应用连接器][docs-app-connectors]身份运行的 GCE 实例，我们有以下一般性选型建议：

* 更高的 CPU 主频比更多的核心数更重要。
* 采用 ARM 处理器的实例在数据包转发方面性价比相当高。
* 避免使用共享核心（shared-core）机器类型。这类机器类型会分时共享物理核心，可能导致性能不稳定。
* 请查阅 Google 的[网络带宽][xt-gcp-network-bandwidth]文档，以更好地了解单实例的出站和入站带宽限制。

### 安全组

Tailscale 使用各种 [NAT 穿透技术][bl-how-nat-traversal-works]，在无需人工干预的情况下安全地连接其他 Tailscale 节点。绝大多数情况下，你无需为 Tailscale 打开任何[防火墙端口][docs-firewalls]。但如果你的 VPC 和安全组对发往互联网的出站流量限制过严，请参阅[使用 Tailscale 应打开哪些防火墙端口][docs-firewall-ports]。

### 公有子网与私有子网

部署在拥有公网 IP 地址的公有子网中的 Tailscale 设备可以在节点之间建立[直连][docs-connection-types]，获得最佳性能。

#### Cloud NAT

Tailscale 同时使用[直连和中继连接][docs-connection-types]，并尽可能优先选择直连。启用 [Cloud NAT 的端点无关映射（endpoint-independent mapping）][xt-gcp-nat-endpoint-independent-mapping]，即可与 NAT 后面的资源建立直连。

### VPC 对等互连与 Network Connectivity Center

在 VPC 内部署子网路由器（或部署多台以实现高可用），即可通过 [VPC 对等互连][xt-gcp-vpc-peering]或 [Network Connectivity Center][xt-gcp-network-connectivity-center]访问多个 VPC。

如果你的 VPC 或子网存在 IPv4 地址重叠，请使用 [4via6 子网路由器][docs-4via6-subnets]，为每个重叠子网分配唯一的 IPv6 地址来访问资源。

### GKE 中的子网路由器

很多组织会使用 Tailscale 来连接和管理 GKE 集群。虽然 Tailscale 可以[在容器中运行][docs-userspace-networking]并部署到 GKE，但我们建议把[子网路由器][docs-subnets]运行在这些集群之外，以确保集群出现问题时连接依然可用。换句话说，请把子网路由器运行在专用 GCE 实例上，或运行在独立于被管理集群的另一套 GKE 集群上。

### 使用出口节点的 Linux VM

> **注意：**
>
> Tailscale v1.96 及更高版本已不再需要此操作。

目前有一个[已知的 GitHub issue][xt-gh-tailscale-issue-3310]：启用了反向路径过滤（reverse path filtering，RPF）严格模式的 Linux 实例，会阻止数据包转发到 Tailscale 出口节点，还可能破坏 VM 的所有出站连接，包括到 Tailscale 控制平面的连接。GCP 会通过在 `/etc/sysctl.d/60-gce-network-security.conf` 文件中设置 `sysctl` 命令 `net.ipv4.conf.all.rp_filter = 1`，在大多数 Linux VM 上默认启用 RPF 严格模式。

使用 `--exit-node` 标志设置出口节点时，机器上的 `tailscaled` 守护进程通常会在本地 `syslog` 中写入一条警告，但仍会照常设置出口节点并破坏连接性。

报错日志通常如下所示：

```shell
error: Exit node misconfiguration: The following issues on your machine will
likely make usage of exit nodes impossible: [interface "tailscale0" has strict
reverse-path filtering enabled interface "ens4" has strict reverse-path filtering
enabled], please set rp_filter=2 instead of rp_filter=1;
see https://github.com/tailscale/tailscale/issues/3310
```

这种情况下，如果你正通过 SSH 远程访问 VM，警告还没显示出来会话就会立即断开，你也就无从得知 VM 失去全部网络连接的根本原因。

要规避这个问题，你可以把 `sysctl` 值设为 `2`（宽松模式），从而在 Linux 实例上禁用 RPF 严格模式。在 `/etc/sysctl.d/60-gce-network-security.conf` 文件中设置 `net.ipv4.conf.all.rp_filter = 2` 和 `net.ipv4.conf.default.rp_filter = 2`，然后用 `sysctl -p /etc/sysctl.d/60-gce-network-security.conf` 重新加载 `sysctl` 并确认值已更新，之后再设置标志让实例使用出口节点。

### Tailscale SSH 会话录制

跨多个可用区部署[多个会话录制器实例][docs-multiple-recorder-nodes]，以提高对可用区故障的抵御能力。如果你的组织跨多个区域运营，请考虑在每个运营区域部署 SSH 会话录制节点，并[配置 SSH 访问规则][docs-tailscale-ssh-session-turn-on]，让节点把录制信息发送到所在区域。

[ar-agent-to-agent-connectivity]: #代理到代理连接

[ar-cloud-run-and-other-container-services]: #cloud-run-及其他容器服务

[ar-dns-routing-with-app-connector]: #通过应用连接器实现基于-dns-的路由

[ar-services-and-api-proxy]: #tailscale-kubernetes-operator-的-kubernetes-服务与-api-服务器代理

[ar-subnet-router-ip-connect]: #通过子网路由器实现基于-ip-的连接

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-app-connectors]: /docs/features/app-connectors

[docs-cloudrun]: /docs/install/cloud/cloudrun

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-firewalls]: /docs/integrations/firewalls

[docs-high-availability-region-load-balancing]: /docs/features/route-selection#regional-routing

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-installation]: /docs/install

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-multiple-recorder-nodes]: /docs/reference/multiple-recorder-nodes

[docs-performance-best-practices]: /docs/reference/best-practices/performance

[docs-route-selection]: /docs/features/route-selection

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh-session-turn-on]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording#turn-on-session-recording-in-your-tailnet-policy-file

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-gcp-nat-endpoint-independent-mapping]: https://cloud.google.com/nat/docs/public-nat#specs-rfcs

[xt-gcp-network-bandwidth]: https://cloud.google.com/compute/docs/network-bandwidth

[xt-gcp-network-connectivity-center]: https://cloud.google.com/network-connectivity/docs/network-connectivity-center/concepts/overview

[xt-gcp-private-service-connect]: https://cloud.google.com/vpc/docs/private-service-connect

[xt-gcp-vpc-peering]: https://cloud.google.com/vpc/docs/vpc-peering

[xt-gh-tailscale-issue-3310]: https://github.com/tailscale/tailscale/issues/3310
