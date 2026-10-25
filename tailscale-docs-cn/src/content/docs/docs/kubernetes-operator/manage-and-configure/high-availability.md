---
title: "Tailscale Kubernetes Operator 的高可用"
description: "Tailscale Kubernetes Operator 提供 [`ProxyGroup`][docs-proxy-group] 来实现高可用。`ProxyGroup` 管理一个由 Tailscale 代理副本组成的 `StatefulSet`，为你带来："
---

最后验证于 Jun 5, 2026

Tailscale Kubernetes Operator 提供 [`ProxyGroup`][docs-proxy-group] 来实现高可用。`ProxyGroup` 管理一个由 Tailscale 代理副本组成的 `StatefulSet`，为你带来：

* **Pod 重启期间不宕机**：多个活跃副本同时服务流量。
* **资源整合**：由一组共享的代理 pod 服务多个 `Service` 和 `Ingress` 资源，而不是每个资源独占一个代理。

`ProxyGroup` 支持三种模式：

* `ingress`：把 Kubernetes 工作负载公开到你的 tailnet（[L3][docs-expose-l3]、[L7][docs-expose-l7]）。
* `egress`：从你的集群访问 tailnet 资源。请参阅[出站指南][docs-egress]。
* `kube-apiserver`：经 Tailscale 安全访问 Kubernetes API。请参阅 [API 服务器代理指南][docs-api-server]。

本指南介绍如何为高可用配置 `ProxyGroup` 和 [`ProxyClass`][docs-proxy-class]。分步部署请参阅[进一步探索][ar-further-exploration]。

## 副本

设置 `spec.replicas` 控制 `ProxyGroup` 运行多少个代理 pod。默认值为 `2`。调大该值可获得更强的韧性：如果某个 pod 或节点宕机，其余副本会继续服务流量。

```yaml
spec:
  replicas: 3
```

## 使用 ProxyClass 进行配置

[`ProxyClass`][docs-proxy-class] 让你可以自定义 `ProxyGroup` 副本的 `StatefulSet` 和 `Pod` 规范。例如，引用一个名为 `ha-production` 的 `ProxyClass`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-proxies
spec:
  type: ingress
  replicas: 3
  proxyClass: ha-production
```

> **注意：**
>
> 在 `ProxyGroup` 开始调谐之前，`ProxyClass` 必须已存在并处于 `Ready` 状态。

以下小节介绍与高可用最相关的 `ProxyClass` 选项。

### 调度

`ProxyClass` 在代理 pod 上暴露 Kubernetes 调度字段，你可以用它把副本分散开以增强韧性：

* `spec.statefulSet.pod.topologySpreadConstraints`：把副本分散到不同区域或节点。
* `spec.statefulSet.pod.affinity`：为副本放置配置亲和性或反亲和性规则。
* `spec.statefulSet.pod.nodeSelector`：把代理约束到特定节点。
* `spec.statefulSet.pod.tolerations`：允许代理被调度到带有污点的节点上（例如专用代理节点）。

这些字段的详情请参阅 [Kubernetes 调度文档][xt-k8s-scheduling]。

### Pod 中断预算

主动中断（节点排空、集群升级）可能同时终止所有代理 pod。可以创建一个 Kubernetes `PodDisruptionBudget` 来防止这种情况。在 `ProxyClass` 上使用 `spec.statefulSet.pod.labels` 为代理 pod 添加标签，然后在 `PodDisruptionBudget` 选择器中引用它。

### 资源请求与限制

`ProxyClass` 支持 `spec.statefulSet.pod.tailscaleContainer.resources`，用于为代理容器设置资源请求和限制，确保可预测的调度并防止意外驱逐。

### 指标

启用 Prometheus 指标来监控各副本的代理健康状况：

```yaml
spec:
  metrics:
    enable: true
```

指标在 `<pod-ip>:9002/metrics` 提供。要自动创建 Prometheus `ServiceMonitor`：

```yaml
spec:
  metrics:
    enable: true
    serviceMonitor:
      enable: true
```

## TLS 证书

对于高可用入站，代理副本共享一个存放 Let's Encrypt 证书的 TLS `Secret`。证书签发后，所有副本都可以服务 TLS 流量。

代理还可以共享一个 Let's Encrypt 账户，这样即使 Pod 被重建，证书续期也能保持[速率限制豁免][docs-lets-encrypt-rate-limits]。

测试时，请通过 `ProxyClass` 使用 Let's Encrypt 暂存环境，以避免触发[速率限制][docs-lets-encrypt-rate-limits]：

```yaml
spec:
  useLetsEncryptStagingEnvironment: true
```

## 出站优雅故障转移

出站 `ProxyGroup` 副本支持优雅故障转移：当某个 pod 被终止时，进行中的连接会自动排空到其他副本。

> **警告：**
>
> 在出站 `ProxyGroup` 的 pod 上设置自定义 `TS_LOCAL_ADDR_PORT` 环境变量会禁用优雅故障转移。

## 静态端点

配置[静态端点][docs-static-endpoints]，让客户端能够通过 NodePort 直连代理 pod。这会建立直连而非依赖中继服务器，从而降低生产工作负载的延迟。配置详情请参阅[静态端点指南][docs-static-endpoints]。

## 多集群

如果相同的 `Ingress` 配置被应用到多个集群，各集群的 `ProxyGroup` 代理都会成为同一个 `ts.net` DNS 名称的有效目标。客户端路由遵循与[高可用子网路由器][docs-ha-subnet-routers]相同的规则。详情请参阅[多集群入站指南][docs-multi-cluster]。

## 进一步探索

* 在第 3 层把工作负载[公开][docs-expose-l3]到你的 tailnet。
* 在第 7 层把工作负载[公开][docs-expose-l7]到你的 tailnet。
* 从 Kubernetes[访问][docs-egress] tailnet 资源。
* 经 Tailscale [访问][docs-api-server] Kubernetes API。
* 配置[多集群入站][docs-multi-cluster]。

[ar-further-exploration]: #进一步探索

[docs-api-server]: /docs/kubernetes-operator/api-server-access

[docs-egress]: /docs/kubernetes-operator/egress

[docs-expose-l3]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l3

[docs-expose-l7]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-ha-subnet-routers]: /docs/how-to/set-up-high-availability

[docs-lets-encrypt-rate-limits]: /docs/kubernetes-operator/manage-and-configure/lets-encrypt-rate-limits

[docs-multi-cluster]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-proxy-class]: /docs/kubernetes-operator/concepts/proxyclass

[docs-proxy-group]: /docs/kubernetes-operator/concepts/proxygroup

[docs-static-endpoints]: /docs/kubernetes-operator/manage-and-configure/configure-static-endpoints

[xt-k8s-scheduling]: https://kubernetes.io/docs/concepts/scheduling-eviction/
