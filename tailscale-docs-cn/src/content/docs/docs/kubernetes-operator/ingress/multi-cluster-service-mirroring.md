---
title: "Connect services across clusters"
description: "You can use the Tailscale Kubernetes Operator to expose a `Service` in one cluster to another cluster by combining [cluster ingress][docs-ingress] and [cluster egress][docs-egress]. Expose the `Servic"
---

Last validated Jun 5, 2026

You can use the Tailscale Kubernetes Operator to expose a `Service` in one cluster to another cluster by combining [cluster ingress][docs-ingress] and [cluster egress][docs-egress]. Expose the `Service` in cluster A to the tailnet through ingress, then connect to it from cluster B through egress.

For GitOps workflows that need to manage deployments across multiple clusters, refer to [Deploy across clusters with ArgoCD][docs-argocd].

## How it works

1. Expose the `Service` you want to access in cluster A using [ingress][docs-ingress].
2. In cluster B, create an egress `Service` that connects to the tailnet address of the `Service` exposed in cluster A. Refer to the [egress guide][docs-egress] for details.

This creates a mirror of cluster A's `Service` inside cluster B, accessible to workloads in cluster B as a regular Kubernetes `Service`.

[docs-argocd]: /docs/solutions/manage-multi-cluster-kubernetes-deployments-argocd

[docs-egress]: /docs/kubernetes-operator/egress

[docs-ingress]: /docs/kubernetes-operator/ingress
