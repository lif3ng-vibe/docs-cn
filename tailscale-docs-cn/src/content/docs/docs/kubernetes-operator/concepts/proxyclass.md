---
title: "使用 ProxyClass 自定义代理"
description: "`ProxyClass` 是一个集群级自定义资源，让你可以自定义 Tailscale Kubernetes Operator 创建的代理（独立代理或 `ProxyGroup`）。"
---

最后验证于 Jun 5, 2026

`ProxyClass` 是一个集群级（cluster-scoped）自定义资源，让你可以自定义 Tailscale Kubernetes Operator 创建的代理（独立代理或 `ProxyGroup`）。

默认情况下，Operator 以标准配置创建代理。`ProxyClass` 提供了一种配置这些代理的机制，让你可以：

* 自定义代理的 `StatefulSet`（pod/容器 spec、pod 调度位置、安全上下文、标签、注解等）。
* 使用 `NodePort` `Service` 资源设置[静态端点][docs-static-endpoints]，实现可靠连接。
* 通过 `ServiceMonitor` 启用指标收集和 Prometheus 集成。
* 配置 Tailscale 专属设置。

## 示例

以下示例为代理 pod 添加团队专属标签：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: prod-proxies
spec:
  statefulSet:
    pod:
      labels:
        team: eng
        environment: prod
```

## 如何应用 ProxyClass

你可以通过添加注解或在资源 spec 中设置字段，将 `ProxyClass` 关联到你的 Tailscale 资源：

* 对于 Kubernetes `Ingress` 或 `Service`，添加 `tailscale.com/proxy-class` 注解：

  ```yaml
  metadata:
    annotations:
      tailscale.com/proxy-class: prod-proxies
  ```

* 对于 `Connector` 或 `ProxyGroup`，设置 `spec.proxyClass` 字段：

  ```yaml
  spec:
    proxyClass: prod-proxies
  ```

## 默认 ProxyClass

Operator 可以将一个默认 `ProxyClass` 自动应用到任何未显式指定 ProxyClass 的代理。要配置默认 `ProxyClass`：

* **Helm：**设置 `proxyConfig.defaultProxyClass` 值。
* **环境变量：**在 Operator 上设置 `PROXY_DEFAULT_CLASS`。

## 进一步探索

* 使用 `ProxyClass` 为生产部署设置拓扑分布、资源限制和指标，实现[高可用][docs-ha]配置。

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-static-endpoints]: /docs/kubernetes-operator/manage-and-configure/configure-static-endpoints
