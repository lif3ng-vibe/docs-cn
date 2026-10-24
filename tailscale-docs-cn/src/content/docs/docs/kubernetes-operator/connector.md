---
title: "Host Tailscale resources in Kubernetes with Connector"
description: "Deploy subnet routers and exit nodes on Kubernetes using the Connector resource"
---

Last validated Jun 5, 2026

A Connector is a [Custom Resource Definition (CRD)][xt-crd] provided by the Tailscale Kubernetes Operator. It lets you deploy a Tailscale device inside your cluster that bridges your tailnet and your cluster infrastructure.

## Connector capabilities

The Connector resource lets a single Tailscale device serve one or more of the following roles:

* **Subnet router**: Advertises routes to your cluster's internal networks, such as Pod and Service CIDRs, to your tailnet. [4via6 subnet routes][docs-4via6] are also supported.
* **Exit node**: Routes all internet-bound traffic from other tailnet devices through your Kubernetes cluster. Use this to maintain a consistent public IP address or to route traffic through a specific geographic region.
* **App connector**: Provides identity-aware access to public SaaS applications through your tailnet, centralizing egress and security policies.

> **Note:**
>
> A single Connector can act as both a subnet router and an exit node simultaneously.

## Example Connector configuration

The following manifest creates a subnet router that advertises the cluster's internal Pod CIDR:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Connector
metadata:
  name: my-cluster-connector
spec:
  subnetRouter:
    advertiseRoutes:
      - "10.40.0.0/14"
```

## Further exploration

* [Deploy exit nodes and subnet routers on Kubernetes][docs-deploy-subnet-router] using the Connector custom resource.
* [Deploy app connectors on Kubernetes][docs-deploy-app-connector] to provide identity-aware access to public SaaS applications.

[docs-4via6]: /docs/features/subnet-routers/4via6-subnets

[docs-deploy-app-connector]: /docs/kubernetes-operator/connector/deploy-app-connector

[docs-deploy-subnet-router]: /docs/kubernetes-operator/connector/deploy-subnet-router

[xt-crd]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources
