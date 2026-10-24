---
title: "Use ProxyClass for proxy customization"
description: "A `ProxyClass` is a cluster-scoped custom resource that lets you customize the proxies (standalone or `ProxyGroup`) that the Tailscale Kubernetes Operator creates."
---

Last validated Jun 5, 2026

A `ProxyClass` is a cluster-scoped custom resource that lets you customize the proxies (standalone or `ProxyGroup`) that the Tailscale Kubernetes Operator creates.

By default, the operator creates proxies with a standard configuration. A `ProxyClass` provides a mechanism to configure these proxies, letting you:

* Customize the proxy's `StatefulSet` (pod/container spec, pod placement, security contexts, labels, annotations, and more).
* Set up [static endpoints][docs-static-endpoints] using `NodePort` `Service` resources for reliable connectivity.
* Enable metrics collection and Prometheus integration through `ServiceMonitor`.
* Configure Tailscale-specific settings.

## Example

The following example adds specific team labels to the proxy pods:

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

## How to apply a ProxyClass

You can link a `ProxyClass` to your Tailscale resources by adding an annotation or setting a field in the resource spec:

* For a Kubernetes `Ingress` or `Service`, add the `tailscale.com/proxy-class` annotation:

  ```yaml
  metadata:
    annotations:
      tailscale.com/proxy-class: prod-proxies
  ```

* For a `Connector` or `ProxyGroup`, set the `spec.proxyClass` field:

  ```yaml
  spec:
    proxyClass: prod-proxies
  ```

## Default ProxyClass

The Operator can automatically apply a default `ProxyClass` to any proxy that doesn't have one explicitly assigned. To configure a default `ProxyClass`:

* **Helm:** Set the `proxyConfig.defaultProxyClass` value.
* **Environment variable:** Set `PROXY_DEFAULT_CLASS` on the Operator.

## Further exploration

* Configure [high availability][docs-ha] by using a `ProxyClass` to set topology spreading, resource limits, and metrics for production deployments.

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-static-endpoints]: /docs/kubernetes-operator/manage-and-configure/configure-static-endpoints
