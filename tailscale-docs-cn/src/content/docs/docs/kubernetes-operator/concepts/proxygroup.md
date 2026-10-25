---
title: "使用 ProxyGroup 实现高可用代理"
description: "`ProxyGroup` 管理一个由 Tailscale 代理副本组成的 `StatefulSet`。与独立代理模式相比，它具有多项优势："
---

最后验证于 Jun 5, 2026

`ProxyGroup` 管理一个由 Tailscale 代理副本组成的 `StatefulSet`。与独立代理模式相比，它具有多项优势：

* **高可用**：多个副本确保即使某个代理 pod 失败或被重新调度，你的服务仍然可访问。
* **资源整合**：单个 `ProxyGroup` 可以处理多个 Kubernetes `Service` 或 `Ingress` 资源的流量，而不必为每个资源单独部署一个代理。
* **高可用**：多个副本确保即使某个代理 pod 失败或被重新调度，你的服务仍然可访问。
* **资源整合**：单个 `ProxyGroup` 可以处理多个 Kubernetes `Service` 或 `Ingress` 资源的流量，而不必为每个资源单独部署一个代理。
* **可扩展**：根据流量需求增减代理副本数量。

## 类型

`ProxyGroup` 有三种类型，各自面向特定的使用场景：

| 类型             | 说明                                                               |
| ---------------- | ------------------------------------------------------------------ |
| `ingress`        | 将 Kubernetes 工作负载暴露给你的 tailnet。                          |
| `egress`         | 让集群中的 pod 能够连接 tailnet 中的设备。                          |
| `kube-apiserver` | 通过 Tailscale 安全访问 Kubernetes API 服务器。                     |

## 创建的资源

部署 `ProxyGroup` 时，Tailscale Kubernetes Operator 会创建：

* 每个副本一对配置和状态 `Secret`。
* `ProxyGroup` 所需的 `ServiceAccount`、`Role` 和 `RoleBinding`。
* 一个运行指定数量代理 pod 副本的 `StatefulSet`（默认为 2）。
* 一个包含入站或出站配置的 `ConfigMap`（适用于 `ingress` 和 `egress` 类型）。
* 如果通过 `ProxyClass` 配置了[静态端点][docs-static-endpoints]，还会为每个副本创建一个 `NodePort` `Service`，用于直连。

## 使用方法

通过创建具有所需 `spec.type` 的自定义资源来部署 `ProxyGroup`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-proxies
spec:
  type: ingress
  replicas: 2
```

然后在你的 Kubernetes `Ingress` 或 `Service` 中，使用 `tailscale.com/proxy-group` 注解引用它：

```yaml
metadata:
  annotations:
    tailscale.com/proxy-group: my-proxies
```

有关拓扑分布、资源限制和指标等生产环境配置，请参阅[高可用][docs-ha]。

## 进一步探索

* 使用[高可用][docs-ha]为生产环境的 `ProxyGroup` 部署配置拓扑分布、资源限制和指标。
* 使用 [ProxyClass][docs-proxyclass] 自定义 `ProxyGroup` 应用到其代理 Pod 的配置。

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-proxyclass]: /docs/kubernetes-operator/concepts/proxyclass

[docs-static-endpoints]: /docs/kubernetes-operator/manage-and-configure/configure-static-endpoints
