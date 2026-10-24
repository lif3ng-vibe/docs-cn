---
title: "Expose cluster workloads to your tailnet with Ingress"
description: "Expose Kubernetes workloads to your tailnet or the internet using the Tailscale Kubernetes Operator."
---

Last validated Jun 5, 2026

Cluster ingress lets you expose cluster workloads to your tailnet, making them accessible to other devices on your Tailscale network. The operator deploys ingress proxy `Pods` that forward traffic to backend `Services`.

You can expose Kubernetes `Services` to your tailnet at two different layers:

* [Layer 7 (HTTP/HTTPS)][ar-layer-7-ingress] for exposing web applications and APIs.
* [Layer 3 (TCP/UDP)][ar-layer-3-ingress] for exposing services like databases or message queues.

At either layer, you can run ingress in standalone mode using a single proxy pod, or in [high availability][ar-ha-ingress] mode using a [ProxyGroup][docs-proxygroup] with multiple replicas. Tailscale recommends high availability mode for production use cases.

This page explains the ingress architecture for both layers, proxy modes, and TLS certificate provisioning.

> **Note:**
>
> Ingress does not expose services to the public internet by default. For more information, refer to [Expose a Kubernetes cluster workload to the public internet using Tailscale Funnel][docs-expose-internet].

## Standalone layer 7 ingress for HTTP and HTTPS

Layer 7 `Ingress` lets you expose web applications and APIs.

You configure this with an `Ingress` object with `ingressClassName: tailscale`. The proxy uses [Tailscale Serve][docs-serve] to accept traffic.

On creation of an `Ingress`, the operator:

* Creates a (combined) configuration and state `Secret`.
* Creates an ingress proxy `Pod` (single replica `StatefulSet`) that forwards traffic, letting devices anywhere in the tailnet access the `Ingress`.
* Automatically provisions a secure **MagicDNS** name with a [valid **TLS certificate** for each Ingress][ar-tls-certificates].

*（图：Architecture diagram showing the Tailscale Kubernetes Operator creating a Secret and StatefulSet for a Layer 7 ingress proxy. The proxy pod forwards traffic from a tailnet client to a Kubernetes Service.）*

L7 `Ingress` can also be used with [High availability][ar-ha-ingress] configuration.

For more information about exposing a layer 7 workload, refer to [Expose a cluster workload to your tailnet at layer 7][docs-expose-l7].

## Standalone layer 3 ingress for TCP/UDP

You can use Layer 3 ingress to expose services like databases or message queues.

You configure this with a `Service` object that selects the application's pods, using either:

* The annotation `tailscale.com/expose: "true"`.
* `.spec.type` set to `LoadBalancer` and `.spec.loadBalancerClass` set to `tailscale`.

The operator creates:

* A combined configuration and state `Secret`.
* An ingress proxy `Pod` using a single replica `StatefulSet` that forwards traffic, letting devices anywhere in the tailnet access the `Service`.

This Pod uses `iptables` or `nftables` rules to DNAT traffic bound for the proxy's tailnet IP address to the `Service`'s internal cluster IP address instead.

*（图：Architecture diagram showing the Tailscale Kubernetes Operator creating a Secret and StatefulSet for a Layer 3 ingress proxy. The proxy pod forwards traffic from a tailnet client to a Kubernetes Service.）*

You can use L3 `Ingress` with [high availability][ar-ha-ingress] configuration, and on new or existing Services.

For more information about exposing a layer 3 workload, refer to [Expose a cluster workload to your tailnet at layer 3][docs-expose-l3].

## High availability (HA) ingress

A high availability L7 or L3 `Ingress` is similar to the standalone variant, but uses a [ProxyGroup][docs-proxygroup] to deploy multiple replicas. This lets you:

* Expose a Kubernetes `Service` or `Ingress` resource to your tailnet through multiple active ingress proxies, to prevent downtime during proxy `Pod` restarts.
* Expose many `Service` and `Ingress` resources to your tailnet using a smaller number of proxy `Pods`.

You configure HA by adding a `tailscale.com/proxy-group` annotation to the `Ingress` or `Service`.

On creation of an `Ingress` or `Service`, the operator:

* Configures a configuration `Secret` per replica.
* Configures a `ConfigMap` with either Tailscale Serve configuration (L7) or `iptables`/`nftables` DNAT rules (L3).
* Configures the `Ingress` `ProxyGroup`, which forwards traffic, letting devices anywhere in the tailnet access the `Service` your `Ingress` points to.
* Creates a [Tailscale Service][docs-tailscale-services] for the `Ingress ProxyGroup`.

*（图：Architecture diagram showing the Tailscale Kubernetes Operator creating a per-replica Secret, a ConfigMap, and a Service for the Ingress ProxyGroup. The Operator configures the Ingress ProxyGroup to forward traffic from a tailnet client to a Kubernetes Service.）*

To get started with `Ingress` in HA mode, refer to the L7 or L3 setup guides linked above. `Ingress` `ProxyGroup` pods require [additional permissions][docs-permissions].

## TLS certificates and limits

The operator and its proxies provision certificates from Let's Encrypt automatically. Let's Encrypt enforces rate limits on certificate issuance, which can affect busy or frequently redeployed clusters. To understand the limits and configure the operator to work within them, refer to [Let's Encrypt rate limits][docs-lets-encrypt-rate-limits].

## Further exploration

* Expose a Kubernetes workload to the public internet with Tailscale Funnel in [Expose a Kubernetes cluster workload to the public internet using Tailscale Funnel][docs-expose-internet].
* Configure ingress across multiple Kubernetes clusters with [Configure multi-cluster ingress with regional routing][docs-multi-cluster].
* Enable communication between services running in different Kubernetes clusters with [Connect services across clusters][docs-multi-cluster-mirroring].
* Deploy the Tailscale Kubernetes Operator in IPv6 environments with [IPv6 support for the Tailscale Kubernetes Operator][docs-ipv6].

[ar-ha-ingress]: #high-availability-ha-ingress

[ar-layer-3-ingress]: #standalone-layer-3-ingress-for-tcpudp

[ar-layer-7-ingress]: #standalone-layer-7-ingress-for-http-and-https

[ar-tls-certificates]: #tls-certificates-and-limits

[docs-expose-internet]: /docs/kubernetes-operator/ingress/expose-workload-to-internet

[docs-expose-l3]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l3

[docs-expose-l7]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-ipv6]: /docs/kubernetes-operator/reference/ipv6

[docs-lets-encrypt-rate-limits]: /docs/kubernetes-operator/manage-and-configure/lets-encrypt-rate-limits

[docs-multi-cluster]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-multi-cluster-mirroring]: /docs/kubernetes-operator/ingress/multi-cluster-service-mirroring

[docs-permissions]: /docs/kubernetes-operator/reference/rbac

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[docs-serve]: /docs/features/tailscale-serve

[docs-tailscale-services]: /docs/features/tailscale-services
