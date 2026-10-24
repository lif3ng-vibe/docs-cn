---
title: "Expose Operator metrics"
description: "When specified for a resource, the following `ProxyClass` definition enables [client metrics][docs-client-metrics] at the path `/metrics` on a container port named \"metrics\":"
---

Last validated Jun 5, 2026

When specified for a resource, the following `ProxyClass` definition enables [client metrics][docs-client-metrics] at the path `/metrics` on a container port named "metrics":

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: prod
spec:
  metrics:
    enable: true
```

The operator also creates a metrics `Service` for the proxy in the operator's namespace that also exposes metrics at `/metrics` on a port named "metrics".

## Prometheus `ServiceMonitor`

The Kubernetes operator can also create a [Prometheus `ServiceMonitor`][xt-prometheus-service-monitor] for proxy resources.

To enable it:

1. Ensure that [Prometheus operator][xt-gh-prometheus-operator] including its custom resource definitions is installed.
2. Apply `ProxyClass` that enables metrics and `ServiceMonitor` creation:

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

The ingested metrics have [labels][xt-prometheus-labels] that identify the proxy to which the `ProxyClass` was applied:

* `ts_proxy_type`: Type of the proxy. Values can be `ingress_service`, `ingress_resource`, `connector` or `proxygroup`.
* `ts_proxy_parent_name`: Name of the proxy's parent resource. That is, name of the `Ingress` resource, Tailscale `Service`, `Connector` or `ProxyGroup`.
* `ts_proxy_parent_namespace`: Namespace of the proxy's parent resource. This only applies to namespaced resources.

[docs-client-metrics]: /docs/reference/tailscale-client-metrics

[xt-gh-prometheus-operator]: https://github.com/prometheus-operator/prometheus-operator

[xt-prometheus-labels]: https://prometheus.io/docs/practices/naming/#labels

[xt-prometheus-service-monitor]: https://prometheus-operator.dev/docs/api-reference/api/#monitoring.coreos.com/v1.ServiceMonitor
