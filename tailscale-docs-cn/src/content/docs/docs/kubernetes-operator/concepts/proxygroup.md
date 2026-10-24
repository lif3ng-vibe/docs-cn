---
title: "Use ProxyGroup for high availability proxies"
description: "A `ProxyGroup` manages a `StatefulSet` of Tailscale proxy replicas. It offers several advantages over the standalone proxy model:"
---

Last validated Jun 5, 2026

A `ProxyGroup` manages a `StatefulSet` of Tailscale proxy replicas. It offers several advantages over the standalone proxy model:

* **High availability:** Multiple replicas ensure your services remain accessible even if a proxy pod fails or is rescheduled.
* **Resource consolidation:** A single `ProxyGroup` can handle traffic for multiple Kubernetes `Service` or `Ingress` resources, rather than a dedicated proxy per resource.
* **High availability**: Multiple replicas ensure your services remain accessible even if a proxy pod fails or is rescheduled.
* **Resource consolidation**: A single `ProxyGroup` can handle traffic for multiple Kubernetes `Service` or `Ingress` resources, rather than a dedicated proxy per resource.
* **Scalability**: Scale the number of proxy replicas up or down to meet traffic demands.

## Types

There are three types of `ProxyGroup`, each designed for a specific use case:

| Type             | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `ingress`        | Expose Kubernetes workloads to your tailnet.                       |
| `egress`         | Enable pods in your cluster to connect to devices in your tailnet. |
| `kube-apiserver` | Securely access the Kubernetes API server over Tailscale.          |

## Created resources

When you deploy a `ProxyGroup`, the Tailscale Kubernetes Operator creates:

* A configuration and state `Secret` per replica.
* A `ServiceAccount`, `Role`, and `RoleBinding` for the `ProxyGroup`.
* A `StatefulSet` running the specified number of proxy pod replicas (defaults to 2).
* A `ConfigMap` containing ingress or egress configuration (for `ingress` and `egress` types).
* If [static endpoints][docs-static-endpoints] are configured through a `ProxyClass`, a `NodePort` `Service` per replica for direct connectivity.

## How to use

Deploy a `ProxyGroup` by creating the custom resource with the desired `spec.type`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-proxies
spec:
  type: ingress
  replicas: 2
```

Then reference it from your Kubernetes `Ingress` or `Service` using the `tailscale.com/proxy-group` annotation:

```yaml
metadata:
  annotations:
    tailscale.com/proxy-group: my-proxies
```

For production configuration such as topology spreading, resource limits, and metrics, refer to [high availability][docs-ha].

## Further exploration

* Use [high availability][docs-ha] to configure topology spreading, resource limits, and metrics for production `ProxyGroup` deployments.
* Use [ProxyClass][docs-proxyclass] to customize the configuration that a `ProxyGroup` applies to its proxy Pods.

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-proxyclass]: /docs/kubernetes-operator/concepts/proxyclass

[docs-static-endpoints]: /docs/kubernetes-operator/manage-and-configure/configure-static-endpoints
