---
title: "Limitations for the Tailscale Kubernetes Operator"
description: "The Tailscale Kubernetes Operator has the following known limitations."
---

Last validated Jun 5, 2026

The Tailscale Kubernetes Operator has the following known limitations.

## General

* The operator is not officially supported on platforms that restrict privileged pods, such as GKE Autopilot. Features are limited on these platforms.

## Egress

The following limitations apply to egress proxies that connect cluster workloads to tailnet devices:

* Egress does not support IP ranges in the `tailscale.com/tailnet-ip` annotation. You can specify only a single IPv4 or IPv6 address as a route.
* Refer to [IPv6 support][docs-ipv6] for IPv6 cluster requirements.

## Layer 7 ingress

The following limitations apply to ingress backed by a Kubernetes `Ingress` resource:

* The only supported [ingress path type][xt-ingress-paths] is `Prefix`. The operator routes requests for paths with other path types according to prefix rules.
* `Ingress` resources only support TLS, and are only exposed over HTTPS using a MagicDNS name and publicly trusted certificates from Let's Encrypt. You must enable HTTPS and MagicDNS for your tailnet.
* The operator provisions certificates on the first connection, so that connection can be slow or time out while provisioning runs.

## Layer 3 ingress

The following limitations apply to L3 ingress backed by a Kubernetes `Service` resource:

* You cannot add the `tailscale.com/proxy-group` annotation to an existing standalone L3 ingress `Service`. Create a new `Service` with the annotation set to the name of the desired `ProxyGroup` instead.
* Hostname changes using the `tailscale.com/hostname` annotation are not reliably applied to an already-exposed `Service` without recreating it.

## Tags

The following limitation applies to tags on operator-managed devices:

* The operator applies tags only during initial device provisioning. If you modify the `tailscale.com/tags` annotation on an already-exposed `Service`, the device tags do not update until you recreate the `Service`.

[docs-ipv6]: /docs/kubernetes-operator/reference/ipv6

[xt-ingress-paths]: https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types
