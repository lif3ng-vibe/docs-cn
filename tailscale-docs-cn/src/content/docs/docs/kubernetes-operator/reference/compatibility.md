---
title: "Compatibility for the Tailscale Kubernetes Operator"
description: "This topic covers version support, infrastructure requirements, and other compatibility information for the Tailscale Kubernetes Operator."
---

Last validated Jun 5, 2026

This topic covers version support, infrastructure requirements, and other compatibility information for the Tailscale Kubernetes Operator.

## Version support

The following sections describe version compatibility for the Operator and Kubernetes.

### Operator and proxies

Tailscale recommends using the same version for both the operator and the proxies to ensure consistency with Tailscale's testing environment.

* **Backward compatibility**: The operator supports proxies running a Tailscale version up to four minor versions earlier than the operator's version.
* **Forward compatibility**: The operator does not support proxies running a Tailscale version later than the operator's version.

### Kubernetes versions

The earliest supported Kubernetes version is v1.23.0.

## Infrastructure and networking

### CNI compatibility

The operator creates proxies that configure custom routing and forwarding rules in each proxy `Pod`'s network namespace only. Because the proxying is implemented in the proxy `Pod`'s namespace, the routing and firewall configuration on the `Node` (for example, using iptables, eBPF, or any other mechanism) doesn't affect the proxies. Therefore, the operator works with most container network interfaces (CNI) configurations out of the box. However, there are some known issues with specific ones.

#### Cilium (kube-proxy replacement mode)

If running Cilium in kube-proxy replacement mode with socket load balancing enabled, connections from `Pod`s to `ClusterIP`s bypass Tailscale firewall rules attached to netfilter hooks.

You must enable **bypassing socket load balancer in Pods' namespaces** if you intend to:

* Expose a Kubernetes `Service` as a Tailscale LoadBalancer `Service`.
* Expose a Kubernetes `Service` using the `tailscale.com/expose` annotation.
* Expose a `Service` CIDR range using `Connector`.

> **Note:**
>
> If you encounter bandwidth issues, use the `--devices` flag to explicitly specify which network interfaces Cilium should monitor for the MTU. This prevents Cilium from defaulting to the `tailscale0` interface MTU.

## Cloud provider specifics

### EKS Fargate

Support on EKS Fargate is limited due to restrictions on privileged containers and `CAP_NET_ADMIN`.

EKS Fargate supports the following features:

* Tailscale `Ingress`
* Tailscale API server proxy

EKS Fargate does not support the following features:

* Tailscale ingress `Service`s
* Tailscale egress `Service`s
* `Connector` configurations

## Certificates and maintenance

### TLS certificates and renewal

The operator automatically provisions TLS certificates for Tailscale Ingress and API server proxy services.

* **Validity**: 90 days.
* **Renewal window**: Typically occurs two-thirds through the validity period.
* **Condition**: Certificates only renew if there is active traffic to the service.
* **Expiry handling**: If a certificate expires, the next request to the service automatically triggers a renewal.
