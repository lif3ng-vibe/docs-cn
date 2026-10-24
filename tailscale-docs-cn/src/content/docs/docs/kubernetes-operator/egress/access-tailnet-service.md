---
title: "Access a tailnet device from your Kubernetes cluster"
description: "You can make a tailnet device accessible to your Kubernetes cluster workloads by creating an egress proxy. This is useful for accessing databases, internal tools, or other services hosted on devices i"
---

Last validated Jun 5, 2026

You can make a tailnet device accessible to your Kubernetes cluster workloads by creating an egress proxy. This is useful for accessing databases, internal tools, or other services hosted on devices in your tailnet.

Your cluster workloads access the tailnet device using a Kubernetes `Service` name, like any other in-cluster Kubernetes `Service`.

*（图：A diagram showing ProxyGroup egress architecture for accessing a tailnet device from a Kubernetes cluster.）*

## Prerequisites

Before you begin, make sure you have the following:

* [Install][docs-k8s-install] the Tailscale Kubernetes Operator.
* A device connected to your tailnet that you want to access.
* An egress `ProxyGroup`. Refer to the following section for an example.

## Create an egress ProxyGroup

Create a `ProxyGroup` with `spec.type` set to `egress`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: egress-proxies
spec:
  type: egress
  replicas: 2
```

Refer to [high availability][docs-ha] for production configuration options.

## Create an egress Kubernetes Service

Create a Kubernetes ExternalName `Service` that references the `ProxyGroup` and the tailnet device:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-tailnet-device
  annotations:
    tailscale.com/tailnet-fqdn: "<device-name>.<tailnet>.ts.net"
    tailscale.com/proxy-group: "egress-proxies"
spec:
  type: ExternalName
  externalName: placeholder
  ports:
    - port: 80
      protocol: TCP
      name: http
```

The operator overwrites the `externalName` field. The value of `tailscale.com/tailnet-fqdn` must be the full MagicDNS name of the device, not just the hostname. Set `spec.ports` to match the ports exposed by the target device.

> **Tip:**
>
> You can also use this pattern to access a [Tailscale Service][docs-tailscale-services] (a stable VIP in your tailnet). The configuration is identical: set `tailscale.com/tailnet-fqdn` to the Tailscale Service's MagicDNS name.

> **Note:**
>
> You can also target a device by its Tailscale IP address using `tailscale.com/tailnet-ip`. The value can be a tailnet IPv4 or IPv6 address, or an address exposed by a Tailscale subnet router. Only one of `tailscale.com/tailnet-fqdn` or `tailscale.com/tailnet-ip` can be set on a Kubernetes `Service`. Tailscale recommends using the MagicDNS name, as the proxy automatically updates if the IP address changes.
>
> The Kubernetes `ExternalName` `Service` must explicitly list all ports you want to access in `spec.ports`. Only `port`, `protocol`, and `name` are used; other port fields have no effect.

## Verify the egress service

Wait for the Kubernetes `Service` to become ready:

```shell
kubectl wait svc my-tailnet-device --for=condition=TailscaleEgressSvcReady=true --timeout=5m
```

Access the tailnet device from your workloads using the Kubernetes DNS name:

```shell
curl http://my-tailnet-device.default.svc.cluster.local
```

Traffic is round-robin load balanced across the `ProxyGroup` replicas. Any number of egress Kubernetes Services can reference a single `ProxyGroup`.

> **Tip:**
>
> If your workloads need to connect to the tailnet device using its MagicDNS name (for example, for TLS certificate validation), refer to [Enable MagicDNS resolution in your cluster][docs-magicdns-resolution].

## Further exploration

* [Enable MagicDNS resolution in your cluster][docs-magicdns-resolution] to let workloads connect using MagicDNS names.
* Learn more about [egress][docs-egress] in the Tailscale Kubernetes Operator.
* Configure [high availability][docs-ha] for production deployments.
* Use [Tailscale Services][docs-tailscale-services] for stable VIPs in your tailnet.

[docs-egress]: /docs/kubernetes-operator/egress

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-magicdns-resolution]: /docs/kubernetes-operator/egress/enable-magicdns-resolution

[docs-tailscale-services]: /docs/features/tailscale-services
