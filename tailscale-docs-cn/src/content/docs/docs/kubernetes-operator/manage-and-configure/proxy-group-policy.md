---
title: "Control access to ProxyGroup resources"
description: "When managing a multi-tenant Kubernetes cluster, you can limit access to your deployed ProxyGroup resources, especially when those ProxyGroup instances use different tailnets. In Tailscale v1.96 and l"
---

Last validated Jun 5, 2026

When managing a multi-tenant Kubernetes cluster, you can limit access to your deployed ProxyGroup resources, especially when those ProxyGroup instances use different tailnets. In Tailscale v1.96 and later, you can use the `ProxyGroupPolicy` resource to let cluster administrators limit usage of the `tailscale.com/proxy-group` annotation on `Service` and `Ingress` resources within individual namespaces.

`ProxyGroupPolicy` resources let you specify whether a namespace can use a given ProxyGroup for ingress or egress. If a user attempts to create an `Ingress` or `Service` that specifies a ProxyGroup name that is not within the allow list, the Kubernetes API server rejects it.

## Prerequisites

* [Install the Tailscale Kubernetes Operator][docs-k8s-install].

> **Note:**
>
> A namespace that contains no `ProxyGroupPolicy` resource is effectively
> considered an "allow-all". When you apply a `ProxyGroupPolicy` to a namespace that
> already contains `Service` or `Ingress` resources using the
> `tailscale.com/proxy-group` annotation, these resources are not evaluated until they are
> next modified.

The following example shows a `ProxyGroupPolicy` that limits access to all ProxyGroup resources, effectively a "deny-all" policy:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroupPolicy
metadata:
  name: deny-all
  namespace: example
spec:
  ingress: []
  egress: []
```

The operator transforms this `ProxyGroupPolicy` into native `ValidatingAdmissionPolicy` and `ValidatingAdmissionPolicyBinding` resources that evaluate the contents of the `tailscale.com/proxy-group` annotation on `Ingress` and `Service` resources within the same namespace.

> **Note:**
>
> If a namespace contains multiple `ProxyGroupPolicy` resources, the operator
> merges them into a single `ValidatingAdmissionPolicy` resource.

## Multi-tenant example

Consider a multi-tenant Kubernetes cluster in which teams use separate tailnets for their services and each team has a namespace within the cluster for their own workloads.

To set up access to their respective tailnets, create a ProxyGroup resource for each team pointing to their tailnets. To ensure ingress or egress is not allowed to any other tailnets from those namespaces, specify a `ProxyGroupPolicy` for each namespace:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroupPolicy
metadata:
  name: billing
  namespace: team-billing
spec:
  ingress:
    - billing-ingress
  egress:
    - billing-egress
---
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroupPolicy
metadata:
  name: customer-engineering
  namespace: team-customer-engineering
spec:
  ingress:
    - customer-engineering-ingress
  egress:
    - customer-engineering-egress
```

This configuration only lets `Service` and `Ingress` resources within the `team-billing` namespace use the `billing-ingress` and `billing-egress` `tailscale.com/proxy-group` annotations. The Kubernetes API server rejects the following `Ingress` resource because it references a ProxyGroup from another team:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  namespace: team-billing
  annotations:
    tailscale.com/proxy-group: customer-engineering-egress
spec:
  defaultBackend:
    service:
      name: example
      port:
        number: 80
  ingressClassName: tailscale
  tls:
    - hosts:
        - example
```

The same applies to any other ingress or egress methods the operator supports that rely on ProxyGroup resources.

[docs-k8s-install]: /docs/kubernetes-operator/install-operator
