---
title: "Tailscale Kubernetes Operator"
description: "The Tailscale Kubernetes Operator provides secure connectivity to and from your Kubernetes cluster."
---

Last validated Jun 5, 2026

> **Note:** Tailscale Kubernetes Operator is available for [all plans](https://tailscale.com/pricing).

The Tailscale Kubernetes Operator provides a Kubernetes-native way to ensure secure connectivity to and from your cluster using Tailscale.

Using the Kubernetes Operator lets you:

* Enable secure, private Kubernetes API access by exposing the Kubernetes control plane over your tailnet. Administrators and automation systems can manage clusters from anywhere without opening public endpoints, configuring VPNs, or maintaining complex network access controls.
* Connect devices in your tailnet to Kubernetes workloads (ingress) to provide secure access to applications and services running inside your clusters. Applications, developers, and end-users can securely reach workloads using Tailscale identities and policies.
* Connect Kubernetes workloads to other devices and services in your tailnet (egress) so applications running in the cluster can securely communicate with laptops, servers, databases, and cloud resources across your private network. This creates a unified connectivity layer without exposing services to the public internet.
* Route [multi-cluster traffic][docs-operator-multi-cluster-ingress] across Kubernetes environments, regions, and cloud providers through your tailnet. Use cross-cluster communication, service-to-service connectivity, and hybrid deployments while maintaining consistent security policies and identity-based access controls.
* Record and audit Kubernetes sessions for compliance and security with detailed visibility into administrative activity. Capture session data, maintain audit trails, and support regulatory, governance, and forensic requirements with centralized recording and monitoring capabilities.
* Host Tailscale infrastructure components in Kubernetes, including session [recorders][docs-operator-tsrecorder], [exit nodes][docs-operator-connector], and [subnet routers][docs-operator-connector].

*（图：A diagram showing the Tailscale Kubernetes Operator architecture with ingress proxies, egress proxies, an API server proxy, and the operator inside a Kubernetes cluster, connected to Tailscale devices in the tailnet.）*

## Explore the documentation

Find guides, concepts, and reference material for the Tailscale Kubernetes Operator.

[**Quickstart tutorial for the Tailscale Kubernetes Operator**](/docs/kubernetes-operator/quickstart) — A hands-on guide to the Tailscale Kubernetes Operator and its key features.

[**Tailscale Kubernetes Operator concepts explained**](/docs/kubernetes-operator/concepts) — Learn about the architecture and key resources of the Tailscale Kubernetes Operator.

[**Expose cluster workloads to your tailnet with Ingress**](/docs/kubernetes-operator/ingress) — Expose Kubernetes workloads to your tailnet or the internet using the Tailscale Kubernetes Operator.

[**Access tailnet resources from your cluster with Egress**](/docs/kubernetes-operator/egress) — Access tailnet resources from your Kubernetes cluster using the Tailscale Kubernetes Operator.

[**Host Tailscale resources in Kubernetes with Connector**](/docs/kubernetes-operator/connector) — Deploy subnet routers and exit nodes on Kubernetes using the Connector resource

[**Access the Kubernetes API server over Tailscale**](/docs/kubernetes-operator/api-server-access) — Securely access the Kubernetes API server over Tailscale.

[**Session recording with the Tailscale Kubernetes Operator**](/docs/kubernetes-operator/recorder) — Deploy and configure session recording using the Tailscale Kubernetes Operator.

[**Manage and configure the Tailscale Kubernetes Operator**](/docs/kubernetes-operator/manage-and-configure) — Manage and configure your Tailscale Kubernetes Operator cluster.

[**Tailscale Kubernetes Operator reference**](/docs/kubernetes-operator/reference) — Reference documentation for the Tailscale Kubernetes Operator.

[docs-operator-connector]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-operator-multi-cluster-ingress]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-operator-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder
