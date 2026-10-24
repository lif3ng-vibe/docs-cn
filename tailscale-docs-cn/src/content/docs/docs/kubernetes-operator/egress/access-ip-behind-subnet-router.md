---
title: "Access an IP address behind a subnet router"
description: "You can make an IP address that is behind a [subnet router][docs-subnet-routers] accessible to your Kubernetes cluster workloads using an egress `ProxyGroup`. This is useful for accessing resources th"
---

Last validated Jun 5, 2026

You can make an IP address that is behind a [subnet router][docs-subnet-routers] accessible to your Kubernetes cluster workloads using an egress `ProxyGroup`. This is useful for accessing resources that are not directly in your tailnet but are reachable through a subnet router, such as databases or internal services on a private network.

Your cluster workloads access the target using a Kubernetes `Service` name, like any other in-cluster Kubernetes `Service`.

*（图：A diagram showing ProxyGroup egress architecture for accessing an IP address behind a subnet router.）*

## Prerequisites

Before you begin, make sure you have the following:

* [Install][docs-k8s-install] the Tailscale Kubernetes Operator.
* A [subnet router][docs-subnet-routers] advertising the route that contains the target IP address.

## Create a ProxyClass to accept routes

To reach the target IP address, the egress proxy must accept advertised subnet routes. Create a `ProxyClass` with `acceptRoutes` enabled:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: accept-routes
spec:
  tailscale:
    acceptRoutes: true
```

## Create an egress ProxyGroup

Create a `ProxyGroup` with `spec.type` set to `egress` and `spec.proxyClass` set to the `ProxyClass` created above:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: egress-proxies
spec:
  type: egress
  replicas: 2
  proxyClass: accept-routes
```

Refer to [High availability for the Tailscale Kubernetes Operator][docs-ha] for production configuration options.

## Create an egress Kubernetes Service

Create a Kubernetes `ExternalName` `Service` that references the `ProxyGroup` and the target IP address:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-subnet-target
  annotations:
    tailscale.com/tailnet-ip: "<ip-behind-subnet-router>"
    tailscale.com/proxy-group: "egress-proxies"
spec:
  type: ExternalName
  externalName: placeholder
  ports:
    - port: 80
      protocol: TCP
      name: http
```

The `externalName` field is overwritten by the Operator. Set `spec.ports` to match the ports exposed by the target.

> **Note:**
>
> The Kubernetes `ExternalName` `Service` must explicitly list all ports you want to access in `spec.ports`. Only `port`, `protocol`, and `name` are used. Other port fields have no effect.

## Verify access

Wait for the Kubernetes `Service` to become ready:

```shell
kubectl wait svc my-subnet-target --for=condition=TailscaleEgressSvcReady=true --timeout=5m
```

Access the target from your workloads using the Kubernetes DNS name:

```shell
curl http://my-subnet-target.default.svc.cluster.local
```

Traffic is round-robin load balanced across the `ProxyGroup` replicas. Any number of egress `Service` resources can reference a single `ProxyGroup`.

## Access a 4via6 address

You can also access an IP address behind a [4via6 subnet router][docs-4via6]. The configuration is the same as above, but you target the 4via6 MagicDNS name or synthesized IPv6 address, instead of a plain IP address.

> **Note:**
>
> The egress proxy cluster must support IPv6 to use 4via6 addresses.

The MagicDNS name format is `<IPv4-with-hyphens>-via-<siteID>.<tailnet>.ts.net`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-4via6-target
  annotations:
    tailscale.com/tailnet-fqdn: "10-1-0-5-via-7.<tailnet>.ts.net"
    tailscale.com/proxy-group: "egress-proxies"
spec:
  type: ExternalName
  externalName: placeholder
  ports:
    - port: 80
      protocol: TCP
      name: http
```

Replace `<tailnet>` with your tailnet name and adjust the IPv4 address, site ID, and ports for your target.

You can also target the synthesized IPv6 address directly using `tailscale.com/tailnet-ip`:

```yaml
annotations:
  tailscale.com/tailnet-ip: "fd7a:115c:a1e0:b1a:0:7:a01:5"
  tailscale.com/proxy-group: "egress-proxies"
```

Use `tailscale debug via <siteID> <IPv4>` to generate the synthesized IPv6 address. A peer in your tailnet must be advertising a subnet route that contains the 4via6 address.

## Limitations

The following limitations apply to IP-based egress access through subnet routers:

* Only single IP addresses are supported. IP ranges are not supported.

Refer to [IPv6 support][docs-ipv6] for more information.

## Further exploration

* [Access a tailnet device][docs-access-device] from your Kubernetes cluster using an egress proxy.
* Learn more about [egress][docs-egress] in the Tailscale Kubernetes Operator.
* Configure [high availability][docs-ha] for production deployments.
* Learn more about [subnet routers][docs-subnet-routers]

[docs-4via6]: /docs/features/subnet-routers/4via6-subnets

[docs-access-device]: /docs/kubernetes-operator/egress/access-tailnet-service

[docs-egress]: /docs/kubernetes-operator/egress

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-ipv6]: /docs/kubernetes-operator/reference/ipv6

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-subnet-routers]: /docs/features/subnet-routers
