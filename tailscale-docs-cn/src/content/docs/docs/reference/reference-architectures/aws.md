---
title: "AWS 参考架构"
description: "本文档详细介绍在 Amazon Web Services（AWS）上部署 Tailscale 的最佳实践和参考架构。以下指南适用于 Tailscale 的所有运行模式——设备、"
---

最后验证于 Oct 7, 2026

本文档详细介绍在 Amazon Web Services（AWS）上部署 Tailscale 的最佳实践和参考架构。以下指南适用于 Tailscale 的所有运行模式——设备、出口节点、子网路由器等。

> **注意：**
>
> 在本文档中，**Tailscale 设备**可以指 Tailscale 节点、出口节点、子网路由器等。其他术语请参阅[术语与概念][docs-terminology-and-concepts]。

## 总体架构

*（图：Tailscale 访问 AWS 资源的潜在部署方式）*

## 部署 Tailscale 以连接 AWS 资源的方式

Tailscale 提供了多种连接 AWS 内资源的方式。概而言之：

* **[代理到代理的连通性][ar-agent-to-agent-connectivity]**——连接 Amazon Elastic Compute Cloud（EC2）实例等"静态"资源。如果可以在想要连接的资源上直接安装并运行 Tailscale，推荐使用这种方式。
* **[使用 Tailscale 子网路由器实现基于 IP 的连通性][ar-subnet-router-ip-connect]**——连接 Amazon Relational Database Service（AWS RDS）或 Amazon Redshift 等托管式 AWS 资源。如果无法在所连接的资源上运行 Tailscale，或想把 VPC 中现有的[子网][docs-subnets]或服务暴露给你的 tailnet，推荐使用这种方式。
* **[使用 Tailscale 应用连接器进行基于 DNS 的路由][ar-dns-routing-with-app-connector]**——通过基于 DNS 的路由，经 tailnet 连接软件即服务（SaaS）应用或其他资源。
* **[通过 Tailscale Kubernetes Operator 提供 Kubernetes 服务与认证代理][ar-services-and-api-proxy]**——把 Amazon Elastic Kubernetes Service（EKS）集群中的服务和 EKS 集群控制平面直接暴露给你的 Tailscale 网络。如果要连接 Kubernetes 集群中运行的资源或集群的控制平面，推荐使用这种方式。
* **[Lambda 与其他容器服务][ar-lambda-and-other-container-services]**——从 Lambda 函数和其他容器方案访问 tailnet 中的资源。

### 代理到代理的连通性

我们建议尽可能[安装 Tailscale 代理][docs-installation]——例如在 EC2 实例上[设置服务器][docs-set-up-servers]。这通常能提供最佳、最具可扩展性的连接，同时启用基于 Tailscale 代理的功能（如 Tailscale SSH）。

### 使用子网路由器实现基于 IP 的连通性

对于无法安装 Tailscale 代理的托管式资源（例如 AWS RDS、Amazon Redshift 等类似服务），可以在 VPC 内运行[子网路由器][docs-subnets]，从 Tailscale 访问这些资源。子网路由器还可用于通过 AWS PrivateLink 和 VPC 端点连接资源。

一般性指南请参阅[使用 Tailscale 私有访问 AWS RDS][docs-aws-rds]。

### 使用应用连接器进行基于 DNS 的路由

[应用连接器][docs-app-connectors]为所配置的域代理 DNS 查询，并为返回的 IP 地址通告路由。对于使用 IP 允许列表的应用，把应用连接器的出站 IP 地址加入允许列表即可，客户端流量随后会从被允许的地址到达这些应用。

### 使用 Tailscale Kubernetes Operator 的 Kubernetes 服务与 API 服务器代理

[Tailscale Kubernetes Operator][docs-kubernetes-operator] 让你可以把 Kubernetes 集群中的服务暴露给你的 Tailscale 网络，并使用 API 服务器代理安全地连接 Kubernetes 控制平面。

### Lambda 与其他容器服务

Tailscale 支持[用户态网络模式][docs-userspace-networking]，容器中的进程可以通过 SOCKS5 或 HTTP 代理连接 Tailscale 网络上的其他资源。这让 [AWS Lambda][docs-aws-lambda]、[AWS App Runner][docs-aws-app-runner]、[AWS Lightsail][docs-aws-lightsail] 等基于容器的方案只需极少的配置即可接入 Tailscale 网络。

## 生产环境最佳实践

以下是在生产环境中运行 Tailscale 的一般建议和最佳实践。其中大部分内容会在本文档中更详细地展开：

* 在可能的情况下，把[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]、[应用连接器][docs-app-connectors]等部署到带有公网 IP 地址的公有子网中，以确保[直连][docs-connection-types]并获得最佳性能。
* 把子网路由器、出口节点、应用连接器等与你要用 Tailscale 管理的系统分开运行——例如，把子网路由器运行在 Amazon EKS 集群之外。
* 把动态扩缩的资源（例如容器或无服务器函数）部署为[临时节点][docs-ephemeral-nodes]，以便在设备关闭后自动清理。

### 高可用性与路由选择

* 在多个 AWS 可用区中运行多个[子网路由器][docs-subnets]和[应用连接器][docs-app-connectors]，以实现[高可用性][docs-high-availability]。对于跨区域部署，请比较各[路由选择选项][docs-route-selection]。
* 在多个 AWS 可用区中运行多个 Tailscale SSH 会话记录节点，以实现[记录节点故障转移][docs-multiple-recorder-nodes]。

## 性能最佳实践

一般性建议请参阅[性能最佳实践][docs-performance-best-practices]。

### 区域内负载均衡

使用区域路由时，在同一个 [DERP][docs-derp-servers] 区域部署相互重叠的子网路由器或应用连接器，以实现[区域内负载均衡][docs-high-availability-region-load-balancing]和冗余。Tailscale 会以尽力而为的方式分配客户端。

### 推荐的实例规格

选择 EC2 实例规格时，要考虑该设备是用作普通设备，还是用作子网路由器、出口节点或应用连接器。

#### 普通用途

在 EC2 实例上安装 Tailscale 作为"普通"Tailscale 设备（例如，不是子网路由器或出口节点）时，该实例的规格很可能已经针对其工作负载选好了合适的实例类型，在上面运行 Tailscale 带来的资源占用可以忽略不计。

#### 子网路由器、出口节点与应用连接器

影响性能的变量很多，工作负载也差异巨大，因此我们没有具体的规格推荐，但对于运行[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]或[应用连接器][docs-app-connectors]的 EC2 实例，我们确实有选择实例类型的一般性指导：

* 一般来说，更高的 CPU 主频比更多的核心数更重要。
* 一般来说，采用基于 ARM 的 AWS Graviton 处理器的实例在数据包转发方面性价比很高
* 使用非突发（non-burstable）实例类型，以获得稳定的虚拟 CPU（vCPU）和网络性能。
  * 根据 AWS [Burstable performance instances][xt-aws-ec2-cpu-burst] 主题的说明，突发性能实例（如 `T4g`、`T3a`、`T2` 等）使用 CPU 积分机制，在超过一个并发连接时可能导致性能不佳。因此，这类实例只应用于测试。生产环境的路由器可以从 `m8g.medium` 实例起步。
* 使用 vCPU 数量超过 16 的实例类型。例如，至少使用 24 个 vCPU 以确保稳定的网络性能。
  * 根据 AWS [Amazon EC2 instance network bandwidth][xt-aws-network-bandwidth] 主题的说明，vCPU 不超过 16 个的实例使用网络 I/O 积分机制来突发超出基准带宽。除极高负载的资源外，这只能带来边际的性能提升。
* 在某些对吞吐量敏感、需要多个并发高速连接的工作负载中，选择具备专用网络容量的子网路由器实例可能获得更好的网络性能，而这类实例仅限 vCPU 超过 16 个的机型。如果你觉得适用，我们建议与我们的解决方案团队讨论你的需求。

## 在 AWS 中使用 Tailscale

根据你使用 AWS 和 Tailscale 的方式，需要考虑安全组和子网的设置。

### 安全组

Tailscale 使用多种 [NAT 穿透技术][bl-how-nat-traversal-works]在无需人工干预的情况下安全地连接其他 Tailscale 节点。通常，你不需要为 Tailscale 开放任何[防火墙端口][docs-firewalls]。不过，如果你的 VPC 和安全组对发往互联网的出站流量限制过严，请参阅[使用 Tailscale 需要开放哪些防火墙端口？][docs-firewall-ports]

### 公有子网与私有子网

部署到带有公网 IP 地址的公有子网中的 Tailscale 设备可以受益于节点间的[直连][docs-connection-types]，获得最佳性能。

#### AWS NAT 网关

Tailscale 同时使用[直连和中继连接][docs-connection-types]，并尽可能选择直连。AWS NAT 网关属于[硬 NAT（Hard NAT）][docs-device-connectivity-hard-nat]，会阻止直连，导致连接改用 [DERP 中继服务器][docs-derp-servers]。这会导致吞吐量和性能低于直连。

当由于网络条件（例如处于 AWS NAT 网关后面的私有子网中）而无法直连时，Tailscale [Peer Relay][docs-peer-relays] 让你把 tailnet 中的设备用作高吞吐量的中继服务器。要绕过 AWS NAT 网关，请按照步骤在你的 VPC 中的公有子网里部署并[配置对等中继][docs-peer-relays-get-started]，为其分配公网 IP 地址，并允许入站 UDP 流量到达中继端口。

#### 仅出站互联网网关

附加到私有子网的仅出站 IPv6 网关允许与拥有 IPv6 地址的对等节点直连。只有 IPv4 的节点则可以通过同时具备 IPv4 和 IPv6 连接的 [DERP 中继][docs-connection-types]访问。

### VPC DNS 解析

AWS 资源的私有托管区域和私有地址只能通过私有 Route 53 Resolver 解析。私有 Route 53 Resolver 可以通过子网路由器访问。要启用这一点：

1. 向你的 VPC [部署一个子网路由器][docs-subnets-set-up-a-subnet-router]。
2. 配置[访问控制][docs-access-control]，允许通过 TCP 和 UDP 访问 VPC 的 VPC+2 IP 地址上的端口 `53`，以启用对私有 Route 53 Resolver 的访问。例如，如果你的 VPC CIDR 是 `10.0.96.0/20`，那么 VPC+2 IP 地址就是 `10.0.96.2`。
3. 配置[拆分 DNS][docs-aws-rds-add-aws-dns]，把对内部 AWS 域名的查询转发到子网路由器现在可达的 VPC+2 IP 地址，即 [Amazon Route 53 Resolver][xt-aws-r53-resolver]。如果你有多个 VPC，可以[把其他 VPC 关联到私有托管区域][xt-aws-r53-vpc-associations]，以便在所有 VPC 中进行 DNS 解析。

### VPC 对等连接与中转 VPC

[VPC 对等连接][xt-aws-vpc-peering]和[中转 VPC（transit VPC）][xt-aws-vpc-transit]是连接多个 VPC 的常用策略。你可以在一个 VPC 中部署子网路由器（或为高可用部署一组），以访问多个 VPC。

如果你的 VPC 或子网存在 IPv4 地址重叠，可以使用 [4via6 子网路由器][docs-4via6-subnets]，为每个重叠子网分配唯一的 IPv6 地址来访问资源。

### 子网路由器

请考虑子网路由器相对其提供访问能力的 AWS 资源的运行位置。

#### 在 Amazon EKS 或 Amazon ECS 中运行子网路由器

组织常常使用 Tailscale 来连接和管理其 EKS 集群、Amazon Elastic Container Service（ECS）部署等。虽然 Tailscale 可以[在容器内运行][docs-userspace-networking]并部署到 EKS 或 ECS，但我们建议把[子网路由器][docs-subnets]运行在这些集群之外，以确保集群出现问题时仍能保持连接。也就是说，把子网路由器运行在专用 EC2 实例或独立于被管理集群的另一个 EKS 集群上。

### Tailscale SSH 会话录制

跨多个可用区部署[多个会话记录器实例][docs-multiple-recorder-nodes]，以提高对可用区故障的恢复能力。如果你的组织跨多个区域运营，可以考虑在运营的每个区域都部署 SSH 会话录制节点，并[配置 SSH 访问规则][docs-tailscale-ssh-session-turn-on]，让节点把录制信息发送到所在区域。

#### 用 S3 持久化录制内容

配置 [Tailscale SSH 会话录制][docs-tailscale-ssh-session-recording]把录制内容持久化到 Amazon S3 存储桶，以减少可用存储空间、持久性、[访问控制][docs-access-control]等运维方面的顾虑。

##### 最小必需的 IAM 策略

[创建具有最小必需权限的 IAM 策略][docs-session-recording-s3-create-policy]，用于在 S3 存储桶中存储录制内容，并（供记录器 Web UI）访问录制内容。

##### 存储桶位置

如果你的组织跨多个 AWS 区域运营，可以考虑在运营的每个区域都部署 SSH 会话录制节点，并[配置 SSH 访问规则][docs-tailscale-ssh-session-turn-on]，让节点把录制信息发送到所在区域。

##### 存储桶策略

鉴于 SSH 会话录制的敏感性，请遵循[适用于 Amazon S3 的 AWS 安全最佳实践][xt-aws-s3-security]。

##### 存储生命周期规则

配置 [S3 生命周期规则][xt-aws-s3-lifecycle]，让录制文件在满足组织要求的时间段后转换到其他存储类，并且/或者过期删除。

## 限制

这些 AWS 网络限制会影响 Tailscale 的连接和性能。

### AWS NAT 网关

AWS NAT 网关属于[硬 NAT][ar-aws-nat-gateway]。AWS NAT 网关后面的所有设备和服务都会通过 [DERP 中继服务器][docs-derp-servers]连接。为获得最佳性能，请把设备放入[公有子网][ar-public-vs-private-subnets]，以便建立直连。

### AWS 单流带宽限制

\[Missing snippet: aws\_single\_flow\_bandwidth\_limitation.mdx]

[ar-agent-to-agent-connectivity]: #代理到代理的连通性

[ar-aws-nat-gateway]: #aws-nat-网关

[ar-dns-routing-with-app-connector]: #使用应用连接器进行基于-dns-的路由

[ar-lambda-and-other-container-services]: #lambda-与其他容器服务

[ar-public-vs-private-subnets]: #公有子网与私有子网

[ar-services-and-api-proxy]: #使用-tailscale-kubernetes-operator-的-kubernetes-服务与-api-服务器代理

[ar-subnet-router-ip-connect]: #使用子网路由器实现基于-ip-的连通性

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-access-control]: /docs/features/access-control

[docs-app-connectors]: /docs/features/app-connectors

[docs-aws-app-runner]: /docs/install/cloud/aws/aws-app-runner

[docs-aws-lambda]: /docs/install/cloud/aws/aws-lambda

[docs-aws-lightsail]: /docs/install/cloud/aws/aws-lightsail

[docs-aws-rds-add-aws-dns]: /docs/install/cloud/aws/aws-rds#step-3-add-aws-dns-for-your-tailnet

[docs-aws-rds]: /docs/install/cloud/aws/aws-rds

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-connectivity-hard-nat]: /docs/reference/device-connectivity#hard-nat

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

[docs-session-recording-s3-create-policy]: /docs/features/tailscale-ssh/how-to/session-recording-s3#configure-s3-as-storage-for-session-recording-nodes

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-subnets-set-up-a-subnet-router]: /docs/features/subnet-routers#set-up-a-subnet-router

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscale-ssh-session-turn-on]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording#turn-on-session-recording-in-your-tailnet-policy-file

[docs-terminology-and-concepts]: /docs/reference/glossary

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-aws-ec2-cpu-burst]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html

[xt-aws-network-bandwidth]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-network-bandwidth.html

[xt-aws-r53-resolver]: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html

[xt-aws-r53-vpc-associations]: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zone-private-associate-vpcs.html

[xt-aws-s3-lifecycle]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html

[xt-aws-s3-security]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html

[xt-aws-vpc-peering]: https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html

[xt-aws-vpc-transit]: https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/transit-vpc-option.html
