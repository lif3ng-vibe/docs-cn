---
title: "Access tailnet resources from your cluster with Egress"
description: "Access tailnet resources from your Kubernetes cluster using the Tailscale Kubernetes Operator."
---

Last validated Jun 5, 2026

Cluster egress lets workloads running in your Kubernetes cluster access devices and services in your tailnet, without those workloads needing to run Tailscale themselves.

This topic explains egress architecture and available proxy modes.

## Overview

Egress works by creating a Kubernetes `ExternalName` `Service` that acts as an in-cluster proxy to a tailnet target. Your workloads connect to this `Service` like any other Kubernetes `Service`, and the egress proxy forwards the traffic over the tailnet to the target device.

You can target a tailnet device by either:

* **MagicDNS name**: Use the `tailscale.com/tailnet-fqdn` annotation (for example, `db.example.ts.net`). The proxy resolves the FQDN using the tailnet netmap and updates automatically if the target's IP address changes.
* **Tailnet IP address**: Use the `tailscale.com/tailnet-target-ip` annotation. The proxy forwards directly to the specified IP address.

Both standalone and [high-availability][ar-ha-egress] configurations are supported. Standalone mode runs a single egress proxy pod, while high-availability mode uses a [ProxyGroup][docs-proxygroup] with multiple replicas. High-availability mode is recommended for production use cases.

## Standalone egress

In standalone mode, you annotate an `ExternalName` `Service` with the tailnet target. On creation of the `Service`, the operator:

* Creates a headless `Service` pointing at the egress proxy pod.
* Creates a combined configuration and state `Secret`.
* Creates an egress proxy `Pod` (single replica `StatefulSet`) that forwards traffic to the tailnet target.
* Updates the `ExternalName` `Service` to point at the headless `Service`.

Your workloads' DNS queries for the `ExternalName` `Service` resolve to the headless `Service`, which routes to the egress proxy pod. The proxy pod uses `iptables` or `nftables` DNAT rules to forward traffic over the tailnet to the target device.

*（图：A diagram showing L3 standalone egress architecture. The operator creates an egress proxy pod, a headless Service, and a configuration Secret. The ExternalName Service resolves to the headless Service, which routes traffic through the egress proxy to a tailnet device.）*

To get started with egress, refer to the guides in [Further exploration][ar-further].

## High-availability (HA) egress

A high-availability egress is similar to the standalone variant, but uses a [ProxyGroup][docs-proxygroup] with `spec.type: egress` to deploy multiple replicas. This lets you:

* Forward traffic to tailnet targets through multiple active egress proxies, preventing downtime during proxy pod restarts.
* Serve multiple `ExternalName` services from a shared set of proxy pods.

You configure HA egress by adding a `tailscale.com/proxy-group` annotation to the `ExternalName` `Service`.

On creation of a correctly annotated `ExternalName` `Service`, the operator:

* Creates a `ClusterIP` `Service` and `EndpointSlice` per egress target in the operator's namespace. Each port defined on the `ExternalName` `Service` is mapped to a randomly allocated port on the `ClusterIP` `Service`.
* Updates the egress `ConfigMap` (created with the `ProxyGroup`) with the port mappings for this target. This `ConfigMap` is mounted to all `ProxyGroup` pods and tells each proxy which incoming ports map to which tailnet targets.
* Updates the `ExternalName` `Service` to point at the `ClusterIP` `Service`.

Traffic flows from your workload to the `ExternalName` `Service`, which resolves to the `ClusterIP` `Service`. `kube-proxy` routes traffic to the `ProxyGroup` pod IPs through the `EndpointSlice`. The proxy pod uses `iptables` or `nftables` DNAT rules to forward traffic over the tailnet.

*（图：A diagram showing ProxyGroup egress architecture. Multiple proxy pod replicas in a StatefulSet forward traffic from ExternalName Services to tailnet devices through ClusterIP Services and EndpointSlices.）*

HA egress supports graceful failover: when a proxy pod is terminated, in-flight connections are drained to other replicas automatically.

To get started with HA egress, refer to [High availability with ProxyGroup][docs-ha].

## Further exploration

* [Access a tailnet device][docs-access-device] from your cluster by its MagicDNS name or tailnet IP address.
* [Access an IP address behind a subnet router][docs-access-subnet-ip] from your cluster workloads.
* [Expose Amazon RDS to your tailnet][docs-expose-rds] through an egress proxy.
* [Enable MagicDNS resolution][docs-magicdns-resolution] so workloads can resolve tailnet names in your cluster.
* [Configure high availability][docs-ha] to run multiple egress proxy replicas for production.

[ar-ha-egress]: #high-availability-ha-egress

[ar-further]: #further-exploration

[docs-access-device]: /docs/kubernetes-operator/egress/access-tailnet-service

[docs-access-subnet-ip]: /docs/kubernetes-operator/egress/access-ip-behind-subnet-router

[docs-expose-rds]: /docs/kubernetes-operator/egress/expose-rds-to-tailnet

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-magicdns-resolution]: /docs/kubernetes-operator/egress/enable-magicdns-resolution

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup
