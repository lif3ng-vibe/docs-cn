---
title: "公开 Operator 指标"
description: "为资源配置以下 `ProxyClass` 定义后，会在名为 \"metrics\" 的容器端口上的 `/metrics` 路径启用[客户端指标（client metrics）][docs-client-metrics]："
---

最后验证于 Jun 5, 2026

为资源配置以下 `ProxyClass` 定义后，会在名为 "metrics" 的容器端口上的 `/metrics` 路径启用[客户端指标（client metrics）][docs-client-metrics]：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: prod
spec:
  metrics:
    enable: true
```

Operator 还会在 Operator 所在的命名空间中为该代理创建一个指标 `Service`，同样在名为 "metrics" 的端口上的 `/metrics` 路径公开指标。

## Prometheus `ServiceMonitor`

Kubernetes Operator 还可以为代理资源创建 [Prometheus `ServiceMonitor`][xt-prometheus-service-monitor]。

要启用它：

1. 确保已安装 [Prometheus Operator][xt-gh-prometheus-operator] 及其自定义资源定义。
2. 应用启用指标和 `ServiceMonitor` 创建的 `ProxyClass`：

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyClass
   metadata:
     name: prod
   spec:
     metrics:
       enable: true
       serviceMonitor:
         enable: true
   ```

采集到的指标带有 [labels][xt-prometheus-labels]，用于标识 `ProxyClass` 应用到了哪个代理：

* `ts_proxy_type`：代理的类型。取值可以是 `ingress_service`、`ingress_resource`、`connector` 或 `proxygroup`。
* `ts_proxy_parent_name`：代理的父资源名称。即 `Ingress` 资源、Tailscale `Service`、`Connector` 或 `ProxyGroup` 的名称。
* `ts_proxy_parent_namespace`：代理的父资源所在的命名空间。仅适用于有命名空间的资源。

[docs-client-metrics]: /docs/reference/tailscale-client-metrics

[xt-gh-prometheus-operator]: https://github.com/prometheus-operator/prometheus-operator

[xt-prometheus-labels]: https://prometheus.io/docs/practices/naming/#labels

[xt-prometheus-service-monitor]: https://prometheus-operator.dev/docs/api-reference/api/#monitoring.coreos.com/v1.ServiceMonitor
