---
title: "使用 PeerRelay 在 Kubernetes 中托管对等中继"
description: "使用 PeerRelay 自定义资源在 Kubernetes 上部署 Tailscale 对等中继（peer relay）。"
---

最后验证于 Oct 8, 2026

`PeerRelay` 是 Tailscale Kubernetes Operator 提供的一个[自定义资源定义（CRD）][xt-k8s-custom-resources]。它让你可以在集群内部署一个或多个[对等中继（peer relay）][docs-peer-relay]设备，当无法直连时，其他 tailnet 设备可以用它们来中继流量。

由于 `PeerRelay` 前面有一个 Kubernetes `type: LoadBalancer` Service，底层的对等中继 pod 即使重启或重新调度，也仍能通过一个稳定的公网 UDP 端点访问。

## 前提条件

在部署 `PeerRelay` 之前，请先完成以下操作：

* [安装][docs-operator-setup] Tailscale Kubernetes Operator（1.102 或更高版本）。
* 配置一条允许 tailnet 设备使用该对等中继的[授权策略][ar-configure-a-grant-policy]。
* 在 AWS/EKS 上，安装 [AWS Load Balancer Controller][xt-aws-lb-controller]。

## PeerRelay 配置示例

应用以下清单来创建一个单副本的 `PeerRelay`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 1
```

## 配置授权策略

在其他 tailnet 设备能够使用该对等中继之前，你必须创建一条[授权策略][docs-grants]，授予它们使用权限。该策略使用 `tailscale.com/cap/relay` 这个[应用能力（application capability）][docs-grant-app-capabilities]。

默认情况下，Operator 会为对等中继设备打上 `tag:k8s` 标签。如果你使用自定义标签，请更新 `spec.tags`，并确保 Operator 的标签是你所选标签的[所有者（owner）][docs-acls-tag-owners]。

添加一条授权，让目标源设备能够使用你的对等中继所用的标签：

```json
{
	"grants": [
		{
			"src": ["tag:private-workloads"],
			"dst": ["tag:k8s"],
			"app": {
				"tailscale.com/cap/relay": []
			}
		}
	]
}
```

## 部署 PeerRelay

1. （可选）设置对等中继设备的[标签][docs-tags]，使其被[自动批准][docs-acls-autoapprovers]。如果设置了自定义标签，请确保 Operator 是该标签的[所有者][docs-acls-tag-owners]。

2. 创建一个 `PeerRelay` 资源：

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: PeerRelay
   metadata:
     name: my-relay
   spec:
     replicas: 1
   ```

   > **注意：**
   >
   > 在 AWS/EKS 上，你只需要这个清单。Operator 会读取 AWS Load Balancer Controller 所预置的网络负载均衡器的地址，并替你通告它。只有当对等中继必须能在你控制的地址上访问时，才需要配置[弹性 IP][ar-pin-replicas-to-elastic-ips]。

3. 等待 `PeerRelay` 就绪：

   ```shell
   kubectl wait --for=condition=PeerRelayReady=true peerrelay my-relay
   ```

4. 检查 `PeerRelay`，确认每个副本通告的公网端点：

   ```shell
   kubectl get peerrelay my-relay
   ```

   ```
   NAME       AGE   STATUS            ENDPOINTS
   my-relay   2m    PeerRelayReady    203.0.113.10
   ```

只要至少有一个副本就绪，拥有该中继授权的 tailnet 设备就会自动发现该对等中继，并把无法直接发送的流量交给它。

## 对等中继的高可用

为了提升韧性，可以运行多个 `PeerRelay` 副本。每个副本都会作为独立设备加入 tailnet，拥有自己的公网 UDP 端点。如果某个副本变得不可达，拥有该中继授权的 tailnet 设备会回退到其余副本。

应用以下清单来运行一个三副本的 `PeerRelay`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 3
```

> **注意：**
>
> `PeerRelay` 的每个副本都有自己的 `LoadBalancer` Service 前置，会预置一个独立的云负载均衡器（在 AWS 上还是一个独立的弹性 IP）。调大副本数会相应增加云服务商账单，因此请根据韧性需要而非上限来选择副本数。

在 GCP、Azure 和 AWS 上，你只需要 `spec.replicas`。每个副本的 Service 都会获得一个拥有独立公网地址的负载均衡器，Operator 会把这个地址作为该副本的端点进行通告。

## 自定义 LoadBalancer Service

Operator 会为它创建的每个 `LoadBalancer` Service 应用默认注解，使 Service 在 GCP、AWS 和 Azure 上预置公网 IP 地址。如果你的目标是其他云提供商或集群内的负载均衡控制器，请使用 `spec.service.annotations` 提供你的控制器所期望的注解。这些注解会统一应用于每个副本。

例如，将 [MetalLB][xt-metallb] 引导到特定的地址池：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 1
  service:
    annotations:
      metallb.io/address-pool: peer-relays
```

### 更改 UDP 端口

默认情况下，每个副本监听 UDP 端口 `41641`，其 `LoadBalancer` Service 也暴露同一端口。要使用其他端口（例如防火墙只允许特定端口时），请设置 `spec.service.port`。副本与其 Service 始终使用相同的端口，因为对等中继会向其他 tailnet 设备通告自己的地址和端口，负载均衡器不能改写端口。此字段要求 Tailscale Kubernetes Operator 1.104 或更高版本。

以下清单让 `PeerRelay` 运行在 UDP 端口 `40000` 上：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 1
  service:
    port: 40000
```

在已有 `PeerRelay` 上更改端口，会在负载均衡器更新期间短暂中断中继流量。

## 在 AWS 上部署

AWS Load Balancer Controller 会为 Operator 创建的每个 `LoadBalancer` Service 预置一个网络负载均衡器（NLB）。默认情况下，Operator 不固定任何子网，因此控制器会把负载均衡器放到它发现的每个可用区中，并在每个可用区各分配一个地址。Operator 会开启跨可用区负载均衡，这样无论 Kubernetes 把副本的 pod 调度到哪个可用区，这些地址中的任何一个都能到达该 pod。AWS NLB 以 DNS 名称而非 IP 地址的形式暴露，因此 Operator 会解析该名称，并把得到的地址作为副本的端点进行通告。

这意味着不需要任何 AWS 特有配置。在 EKS 上部署 `PeerRelay` 的方式与在任何其他集群上相同。

### 将副本固定到弹性 IP

当对等中继必须能在你控制的地址上访问时（例如这些地址被别处的防火墙规则引用），请使用 `spec.aws.elasticIPs`。每个条目将一个弹性 IP（EIP）分配 ID 与预置其负载均衡器的子网配对，副本 `N` 使用条目 `N`。

固定子网只会在副本的负载均衡器上启用该子网所在可用区，而网络负载均衡器只会转发到已启用可用区中的目标。除此之外，没有其他因素约束 Kubernetes 把副本的 pod 调度到哪里，因此你还必须使用 [ProxyClass][docs-operator-proxyclass] 把 pod 固定在该可用区。

1. 为每个预期副本分配一个 EIP。

2. 创建一个把 pod 固定到子网所在可用区的 `ProxyClass`：

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyClass
   metadata:
     name: relay-zone
   spec:
     statefulSet:
       pod:
         nodeSelector:
           topology.kubernetes.io/zone: us-east-1a
   ```

3. 创建引用该 `ProxyClass` 的 `PeerRelay` 资源，并提供配对的分配 ID 与子网列表。该列表长度必须不小于 `spec.replicas`，且每个子网都必须是 `ProxyClass` 所固定可用区内的公共子网：

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: PeerRelay
   metadata:
     name: my-relay
   spec:
     replicas: 3
     proxyClass: relay-zone
     aws:
       elasticIPs:
         - allocationID: eipalloc-0aaaaaaaaaaaaaaaa
           subnetID: subnet-0aaaaaaaaaaaaaaaa
         - allocationID: eipalloc-0bbbbbbbbbbbbbbbb
           subnetID: subnet-0bbbbbbbbbbbbbbbb
         - allocationID: eipalloc-0cccccccccccccccc
           subnetID: subnet-0cccccccccccccccc
   ```

每个副本都有自己的负载均衡器，因此多个副本可以指定同一可用区内的子网，每个副本使用自己的弹性 IP。标准 VPC 弹性 IP 是区域级的而不是可用区级的，它的可用区取决于与它配对的子网。

> **警告：**
>
> `PeerRelay` 的所有副本共享同一个 pod 模板，因此 `ProxyClass` 可以把 pod 固定在单一可用区，却无法把不同副本放到不同可用区。所以，固定弹性 IP 会把整个 `PeerRelay` 限制在一个可用区内，放弃了运行多个副本本可提供的可用区冗余。如果你希望副本分散在多个可用区，请省略 `spec.aws`。

> **注意：**
>
> `spec.aws.elasticIPs` 会覆盖通过 `spec.service.annotations` 提供的任何 `service.beta.kubernetes.io/aws-load-balancer-eip-allocations` 或 `service.beta.kubernetes.io/aws-load-balancer-subnets` 注解。如果两者都设置了，`spec.aws.elasticIPs` 中每个副本的值优先。

## 自定义

你可以使用 [ProxyClass][docs-operator-proxyclass] 自定义 Operator 为 `PeerRelay` 创建的资源。通过 `spec.proxyClass` 按名称引用 ProxyClass：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 3
  proxyClass: my-proxy-class
```

完整的配置选项列表请参阅 [PeerRelay API 参考][xt-gh-tailscale-k8s-peerrelay]。

## 静态端点

对等中继会通告一个或多个[静态端点][docs-peer-relay-static-endpoints]，这样即使设备位于负载均衡器或 NAT 之后，其他 tailnet 设备也能通过稳定的 `ip:port` 访问它。在 Kubernetes 之外，你可以用 `tailscale set --relay-server-static-endpoints` 自行配置静态端点。

`PeerRelay` CRD 会替你处理这件事：对每个副本，Operator 会读取云分配给该副本 `LoadBalancer` Service 的公网地址，并将其写入该副本的 tailscaled 配置中作为静态端点。你不需要在 pod 上运行 `tailscale set`，也不需要预先知道公网 IP。

对于运行在独立设备上、由你自己管理网络配置的对等中继，请使用 CLI 方式。对于运行在 Kubernetes 集群内的对等中继，请使用 `PeerRelay` CRD。

### 添加静态端点

tailnet 设备可能无法通过副本负载均衡器报告的地址访问该副本。例如，集群前面可能有 NAT 设备或防火墙，或者没有负载均衡控制器为 `LoadBalancer` Service 分配地址。在这些情况下，请在 `spec.staticEndpoints` 中列出 tailnet 设备可以访问的地址。此字段要求 Tailscale Kubernetes Operator 1.104 或更高版本。

每个条目都是一个 `ip:port` 对。IPv6 地址要加方括号，并在 YAML 中给这些条目加引号：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 1
  staticEndpoints:
    - 203.0.113.10:41641
    - "[2001:db8::10]:41641"
```

Operator 会为每个副本通告这些端点，与它从各副本负载均衡器发现的地址并列，并把它们列在 `status.endpoints` 中。如果某个条目使用的地址已被某个副本的负载均衡器提供，该条目的端口会替换负载均衡器为该地址提供的端口。每个地址在所有条目中只能出现一次。

只配置了静态端点的副本同样可以就绪。这让你能在没有负载均衡控制器为 `LoadBalancer` Service 分配地址的集群中运行 `PeerRelay`。

## 验证对等中继

要验证对等中继流量在流动，请在两台无法直连的 tailnet 设备之间产生流量，并运行 `tailscale status`。当设备使用了对等中继时，其连接类型会显示为 `peer-relay`：

```shell
tailscale status | grep peer-relay
```

你还可以列出本地设备所知道的对等中继：

```shell
tailscale debug peer-relay-servers
```

关于对等中继连接如何建立和验证的更多细节，请参阅[对等中继文档][docs-peer-relay]。

## 故障排查

如果遇到问题，请参阅[排查 Tailscale Kubernetes Operator 问题][docs-operator-troubleshooting]。

[ar-configure-a-grant-policy]: #配置授权策略

[ar-pin-replicas-to-elastic-ips]: #将副本固定到弹性-ip

[docs-acls-autoapprovers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-acls-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-grant-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants]: /docs/features/access-control/grants

[docs-operator-proxyclass]: /docs/kubernetes-operator/concepts/proxyclass

[docs-operator-setup]: /docs/kubernetes-operator/install-operator

[docs-operator-troubleshooting]: /docs/kubernetes-operator/reference/troubleshooting

[docs-peer-relay]: /docs/features/peer-relay

[docs-peer-relay-static-endpoints]: /docs/features/peer-relay#static-endpoints

[docs-tags]: /docs/features/tags

[xt-aws-lb-controller]: https://kubernetes-sigs.github.io/aws-load-balancer-controller

[xt-gh-tailscale-k8s-peerrelay]: https://github.com/tailscale/tailscale/blob/main/k8s-operator/api.md

[xt-k8s-custom-resources]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources

[xt-metallb]: https://metallb.io/
