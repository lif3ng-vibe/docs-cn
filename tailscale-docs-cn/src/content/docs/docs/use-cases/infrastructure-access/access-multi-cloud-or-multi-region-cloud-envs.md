---
title: "Manage access across multi-cloud or multi-region cloud environments"
description: "Managing infrastructure across multiple cloud providers or regions typically requires VPN gateways, VPC peering agreements, and cloud-specific routing configuration. Tailscale provides an alternative "
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Subnet routers**](/docs/features/subnet-routers) — Use subnet routers to give devices outside your local network access to services within specific subnets. Extend your private network with Tailscale.

Managing infrastructure across multiple cloud providers or regions typically requires VPN gateways, VPC peering agreements, and cloud-specific routing configuration. Tailscale provides an alternative by creating an encrypted overlay network across all your environments. Devices anywhere in the tailnet can reach cloud-private resources without opening inbound firewall ports or managing complex peering configurations.

## Connect cloud VPCs with subnet routers

A [subnet router][docs-subnet-routers] exposes a private IP range to the tailnet so that any tailnet device can reach hosts in that network without running Tailscale directly on each one. Deploy a subnet router in each VPC or cloud region to make its private CIDR range reachable across all your environments.

1. Install Tailscale on a VM on each VPC:

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. Advertise its private subnet:

   ```bash
   sudo tailscale up --advertise-routes=10.0.0.0/16 --advertise-tags=tag:subnet-router
   ```

3. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and approve the advertised routes for each subnet router. Repeat this for each cloud environment or region. Tailscale handles routing so that clients reach the correct subnet router for each CIDR range.

## Resolve internal hostnames across environments

[MagicDNS][docs-magicdns] assigns a consistent `<device-name>.<tailnet-name>.ts.net` hostname to every device in your tailnet. Engineers and services can use these hostnames to reach any cloud resource regardless of which provider or region it runs in.

For cloud-internal DNS zones, use [split DNS][docs-split-dns] to forward queries for a specific domain through the subnet router in that environment. This lets devices resolve private cloud hostnames from anywhere in the tailnet without exposing those zones publicly.

## Control access between cloud environments

[Tags][docs-tags] and [grants][docs-grants] let you define which workloads can reach which cloud networks. Tag subnet routers and destination services by environment so that access policies remain consistent as you add new cloud regions or providers.

This grant enables services tagged as `tag:app-server` to reach any host advertised by the AWS subnet router:

```json
"grants": [
  {
    "src": ["tag:app-server"],
    "dst": ["tag:subnet-router-aws"],
    "ip": ["*"]
  }
]
```

Add grants to the tailnet policy file through the [Access controls](https://console.tailscale.com/admin/acls/file) page of the admin console. Tag each subnet router with a cloud-specific tag to make grants easier to reason about and audit as your environment grows.

## Connect Kubernetes clusters

The [Kubernetes operator][docs-k8s-operator] integrates Tailscale into your clusters so that pods, services, and the Kubernetes API server are reachable from anywhere in the tailnet. You can expose cluster services as tailnet devices, route cluster egress traffic through the tailnet, and connect services across clusters without configuring cloud load balancers or public endpoints.

[docs-grants]: /docs/features/access-control/grants

[docs-k8s-operator]: /docs/kubernetes-operator

[docs-magicdns]: /docs/features/magicdns

[docs-split-dns]: /docs/features/split-dns-policies

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags
