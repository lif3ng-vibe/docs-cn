---
title: "Azure reference architecture"
description: "This document details best practices and a reference architecture for Tailscale deployments on Microsoft Azure. The following guidance applies for all Tailscale modes of operation—such as devices, exi"
---

Last validated Oct 7, 2026

This document details best practices and a reference architecture for Tailscale deployments on Microsoft Azure. The following guidance applies for all Tailscale modes of operation—such as devices, exit nodes, and subnet routers.

> **Note:**
>
> **Tailscale device**—for the purposes of this document Tailscale device can refer to a Tailscale node, exit node, subnet router, and the like. Refer to [Terminology and concepts][docs-terminology-and-concepts] for additional terms.

## High-level architecture

*（图：Potential deployments of Tailscale to access Azure resources）*

## Ways to deploy Tailscale to connect to and from Azure resources

Tailscale provides a few options for connecting to resources within Azure. At a high-level they are:

* **[Agent-to-Agent connectivity][ar-agent-to-agent-connectivity]**—connect to "static" resources such as virtual machines (VMs). This is recommended where you can install and run Tailscale directly on the resource you wish to connect to.
* **[IP-based connectivity with a Tailscale subnet router][ar-subnet-router-ip-connect]**—connect to managed Azure resources (such as Azure SQL or Azure Cosmos DB). This is recommended where you cannot run Tailscale on the resource you are connecting to, or want to expose an existing [subnet][docs-subnets] or services in a virtual network to your tailnet.
* **[DNS-based routing with a Tailscale app connector][ar-dns-routing-with-app-connector]**—connect to software as a service (SaaS) applications or other resources over your tailnet with DNS-based routing.
* **[Kubernetes services and auth proxy with the Tailscale Kubernetes Operator][ar-services-and-api-proxy]**—expose services in your Azure Kubernetes Service (AKS) cluster and your AKS cluster control plane directly to your Tailscale network. This is recommended where you are connecting to resources running in a Kubernetes cluster, or to a Kubernetes cluster's control plane.
* **[Azure Functions, Azure App Service, and other container solutions][ar-functions-app-service-containers]**—access resources in your tailnet from Azure Functions, Azure App Service, and other container solutions.

### Agent-to-Agent connectivity

We recommend [installing the Tailscale agent][docs-installation] wherever possible—for example, [setting up servers][docs-set-up-servers] on Azure VMs. This generally provides the best and most scalable connectivity while enabling Tailscale agent-based functionality such as Tailscale SSH.

Refer to [Access Azure Linux VMs privately using Tailscale][docs-cloud-azure-linux] and [Access Azure Windows VMs privately using Tailscale][docs-cloud-azure-windows] for general guides.

### IP-based connectivity with subnet router

For managed resources where you cannot install the Tailscale agent, such as Azure SQL or Azure Cosmos DB, you can run a [subnet router][docs-subnets] within your virtual network to access these resources from Tailscale.

### DNS-based routing with an app connector

[App connectors][docs-app-connectors] proxy DNS queries for configured domains and advertise routes for the returned IP addresses. For applications that use IP allowlists, add the app connectors' egress IP addresses to the allowlist. Client traffic then reaches the applications from an allowed address.

### Kubernetes services and API server proxy with Tailscale Kubernetes Operator

The [Tailscale Kubernetes Operator][docs-kubernetes-operator] lets you expose services in your Kubernetes cluster to your Tailscale network, and use an API server proxy for secure connectivity to the Kubernetes control plane.

### Azure Functions, Azure App Service, and other container solutions

Tailscale supports [userspace networking][docs-userspace-networking] where processes in the container can connect to other resources on your Tailscale network by using a SOCKS5 or HTTP proxy. This lets [Azure Functions][xt-azure-functions], [Azure App Service][xt-azure-app-service], and other container-based solutions to connect to the Tailscale network with minimal configuration needed.

Refer to [Using Tailscale on Azure App Service][docs-azure-app-service] for a general guide.

## Production best practices

Below are general recommendations and best practices for running Tailscale in production environments. Much of what is listed below is explained in greater detail throughout this document:

* When possible deploy [subnet routers][docs-subnets], [exit nodes][docs-exit-nodes], [app connectors][docs-app-connectors], and the like, to public subnets with public IP addresses to ensure [direct connections][docs-connection-types] and optimal performance.
* Run subnet routers, exit nodes, app connectors, and the like, separately from the systems you are administering with Tailscale—for example, run your subnet routers outside of your Azure AKS clusters.
* Deploy dynamically scaled resources (for example, containers or serverless functions) as [ephemeral nodes][docs-ephemeral-nodes] to automatically clean up devices after they shut down.

### High availability and route selection

* Run multiple [subnet routers][docs-subnets] and [app connectors][docs-app-connectors] across Azure availability zones for [high availability][docs-high-availability]. For deployments across regions, compare the [route selection options][docs-route-selection].
* Run multiple Tailscale SSH session recorder nodes across Azure availability zones for [recorder node failover][docs-multiple-recorder-nodes].

## Performance best practices

Refer to [Performance best practices][docs-performance-best-practices] for general recommendations.

### In-region load balancing

With regional routing, deploy overlapping subnet routers or app connectors in the same [DERP][docs-derp-servers] region for [in-region load balancing][docs-high-availability-region-load-balancing] and redundancy. Tailscale distributes clients on a best-effort basis.

### Recommended VM sizing

When choosing an Azure VM size, consider whether the device will function as a normal device, or a device running as a subnet router, exit node, or app connector.

#### Normal usage

When installing Tailscale on an Azure VM as a "normal" Tailscale device (for example, not a subnet router, exit node, and the like), you likely have already sized that VM to a suitable type for its workload and running Tailscale on it will likely add negligible resource usage.

#### Subnet routers, exit nodes, and app connectors

There are many variables that affect performance and workloads vary widely so we do not have specific size recommendations, but we do have general guidance for selecting a VM size for an Azure VM running as a [subnet router][docs-subnets], [exit node][docs-exit-nodes], or [app connector][docs-app-connectors]:

* In general, higher CPU clock speed is more important than more cores.
* In general, VMs with Ampere Altra ARM–based processors are quite cost effective for packet forwarding.
* Use a non-burstable VM type to achieve consistent CPU performance.
  * Per [Azure documentation][xt-entra-burstable-vms], burstable performance machine sizes (such as B-series VMs) use a CPU credit mechanism which can result in variable performance.
* Tailscale will generally perform better on Linux than other operating systems due to additional optimizations that have been implemented.

## Using Tailscale with Azure

Depending on how you are using Azure and Tailscale, there are considerations for your network security groups, subnets, DNS, and virtual networks.

### Network security groups

Tailscale uses various [NAT traversal techniques][bl-how-nat-traversal-works] to safely connect to other Tailscale nodes without manual intervention. Nearly all the time, you do not need to open any [firewall ports][docs-firewalls] for Tailscale. However, if your virtual network and network security groups are overly restrictive about internet-bound egress traffic, refer to [What firewall ports should I open to use Tailscale][docs-firewall-ports].

### Public vs private subnets

Tailscale devices deployed to a public subnet with a public IP address will benefit from [direct connections][docs-connection-types] between nodes for the best performance.

#### Azure NAT Gateway

Tailscale uses both [direct and relayed connections][docs-connection-types], opting for direct connections where possible. Azure NAT Gateway is a [Hard NAT][docs-device-connectivity-hard-nat] and will prevent direct connections causing connections to use [DERP relay servers][docs-derp-servers]. This can lead to lower throughput and performance than direct connections.

Tailscale [Peer Relays][docs-peer-relays] let you use devices in your tailnet as high-throughput relay servers when direct connections aren't possible due to network conditions such as being in a private subnet behind an Azure NAT Gateway. To bypass Azure NAT Gateway, follow the steps to deploy and [configure a peer relay][docs-peer-relays-get-started] to a public subnet in your virtual network, with a public IP address, and allow incoming UDP traffic to the relay port.

### Virtual network DNS resolution

To allow non-Azure devices in your tailnet to query Azure DNS private zones, create a [Azure DNS private resolver][xt-entra-dns-private-resolver] for your virtual network and configure [split DNS][docs-dns-using-settings] to forward queries for your virtual network's internal domain name suffix to the IP address of the DNS private resolver's inbound endpoint.

### Virtual network peering

[Virtual network peering][xt-entra-network-peering] is a common strategy for connecting multiple virtual networks together. You can deploy a subnet router (or a set for high availability) within a virtual network to allow access to multiple virtual networks.

If you have virtual networks or subnets with overlapping IPv4 addresses, use [4via6 subnet routers][docs-4via6-subnets] to access resources with unique IPv6 addresses for each overlapping subnet.

### Subnet routers

Consider where you run subnet routers relative to the Azure resources they provide access to.

#### Operating a subnet router within Azure AKS

Oftentimes organizations are using Tailscale to connect to and administer their Azure AKS clusters. While Tailscale can [run within a container][docs-userspace-networking] and be deployed to AKS, we recommend running your [subnet routers][docs-subnets] externally to these clusters to ensure connectivity is available in the event your cluster is having issues. In other words, run your subnet router on dedicated VMs or an AKS cluster separate from the cluster you're administering.

### Tailscale SSH session recording

Deploy [multiple session recorder instances][docs-multiple-recorder-nodes] across multiple availability zones to improve resiliency against zone failures. If your organization operates across multiple regions, consider deploying SSH session recording nodes in each region you operate and [configure SSH access rules][docs-tailscale-ssh-session-turn-on] to send recording information to the local region for your nodes.

## Limitations

* Azure NAT Gateway is a [hard NAT][ar-azure-nat-gateway]. All devices and services behind an Azure NAT Gateway will connect using [DERP relay servers][docs-derp-servers]. For best performance, put devices in a [public subnet][ar-public-vs-private-subnets] to facilitate direct connections.

[ar-agent-to-agent-connectivity]: #agent-to-agent-connectivity

[ar-azure-nat-gateway]: #azure-nat-gateway

[ar-dns-routing-with-app-connector]: #dns-based-routing-with-an-app-connector

[ar-functions-app-service-containers]: #azure-functions-azure-app-service-and-other-container-solutions

[ar-public-vs-private-subnets]: #public-vs-private-subnets

[ar-services-and-api-proxy]: #kubernetes-services-and-api-server-proxy-with-tailscale-kubernetes-operator

[ar-subnet-router-ip-connect]: #ip-based-connectivity-with-subnet-router

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-app-connectors]: /docs/features/app-connectors

[docs-azure-app-service]: /docs/install/cloud/azure/azure-app-service

[docs-cloud-azure-linux]: /docs/install/cloud/azure/linux

[docs-cloud-azure-windows]: /docs/install/cloud/azure/windows

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-connectivity-hard-nat]: /docs/reference/device-connectivity#hard-nat

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-firewalls]: /docs/integrations/firewalls

[docs-high-availability-region-load-balancing]: /docs/features/route-selection#regional-routing

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-installation]: /docs/install

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-multiple-recorder-nodes]: /docs/reference/multiple-recorder-nodes

[docs-peer-relays-get-started]: /docs/features/peer-relay#get-started

[docs-peer-relays]: /docs/features/peer-relay

[docs-performance-best-practices]: /docs/reference/best-practices/performance

[docs-route-selection]: /docs/features/route-selection

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh-session-turn-on]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording#turn-on-session-recording-in-your-tailnet-policy-file

[docs-terminology-and-concepts]: /docs/reference/glossary

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-azure-app-service]: https://azure.microsoft.com/en-us/products/app-service

[xt-azure-functions]: https://azure.microsoft.com/en-us/products/functions

[xt-entra-burstable-vms]: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-b-series-burstable

[xt-entra-dns-private-resolver]: https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview

[xt-entra-network-peering]: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview
