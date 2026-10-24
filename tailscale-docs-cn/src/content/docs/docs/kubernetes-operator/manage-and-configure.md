---
title: "Manage and configure the Tailscale Kubernetes Operator"
description: "Manage and configure your Tailscale Kubernetes Operator cluster."
---

Last validated Jun 5, 2026

* [Add static endpoints to a cluster](/docs/kubernetes-operator/manage-and-configure/configure-static-endpoints) — Configure static endpoints for ProxyGroup proxies to enable direct connections.

* [Configure workload identity federation for the Tailscale Kubernetes Operator](/docs/kubernetes-operator/manage-and-configure/workload-identity-federation) — Use workload identity federation to allow the Tailscale Kubernetes Operator securely access cloud resources without storing long-lived credentials or secrets.

* [Control access to ProxyGroup resources](/docs/kubernetes-operator/manage-and-configure/proxy-group-policy) — Create per-namespace policies that limit access to ProxyGroup resources

* [Enable Operator debug endpoints](/docs/kubernetes-operator/manage-and-configure/enable-debug-endpoints) — Enable debug endpoints for Tailscale Kubernetes Operator proxies.

* [Expose Operator metrics](/docs/kubernetes-operator/manage-and-configure/expose-metrics) — Expose client metrics from Tailscale Kubernetes Operator proxies.

* [High availability for the Tailscale Kubernetes Operator](/docs/kubernetes-operator/manage-and-configure/high-availability) — Configure ProxyGroup and ProxyClass for highly available ingress, egress, and API server proxies.

* [Let's Encrypt rate limits with the Kubernetes Operator](/docs/kubernetes-operator/manage-and-configure/lets-encrypt-rate-limits) — Understand how Let's Encrypt rate limits affect the Tailscale Kubernetes Operator as your usage grows, and how to keep certificate issuance and renewals within them.

* [Use custom machine names for ingress and egress proxies](/docs/kubernetes-operator/manage-and-configure/custom-machine-names) — Use custom machine names for Tailscale Kubernetes Operator ingress and egress proxies.

* [Use multiple tailnets for devices running on Kubernetes](/docs/kubernetes-operator/manage-and-configure/multi-tailnet) — Deploy devices across multiple tailnets using the Tailscale Kubernetes Operator

[**Manage multi-cluster Kubernetes deployments with ArgoCD**](/docs/solutions/manage-multi-cluster-kubernetes-deployments-argocd) — Set up secure multi-cluster Kubernetes management with ArgoCD using Tailscale's private network to connect clusters across regions without complex networking.
