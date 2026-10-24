---
title: "Host peer relays in Kubernetes with PeerRelay"
description: "Deploy Tailscale peer relays on Kubernetes using the PeerRelay custom resource."
---

Last validated Oct 8, 2026

A `PeerRelay` is a [Custom Resource Definition (CRD)][xt-k8s-custom-resources] provided by the Tailscale Kubernetes Operator. It lets you deploy one or more [peer relay][docs-peer-relay] devices inside your cluster that other tailnet devices can use to relay traffic when direct connections aren't possible.

Because a `PeerRelay` is fronted by a Kubernetes `type: LoadBalancer` Service, the underlying peer relay pods are reachable at a stable public UDP endpoint even when they restart or reschedule.

## Prerequisites

Complete the following before deploying a `PeerRelay`:

* [Install][docs-operator-setup] the Tailscale Kubernetes Operator, version 1.102 or later.
* Configure a [grant policy][ar-configure-a-grant-policy] that permits tailnet devices to use the peer relay.
* On AWS/EKS, install the [AWS Load Balancer Controller][xt-aws-lb-controller].

## Example PeerRelay configuration

Apply the following manifest to create a `PeerRelay` with a single replica:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 1
```

## Configure a grant policy

Before other tailnet devices can use the peer relay, you must create a [grant policy][docs-grants] that gives them permission to use it. The policy uses the `tailscale.com/cap/relay` [application capability][docs-grant-app-capabilities].

By default, the operator tags peer relay devices with `tag:k8s`. If you use a custom tag, update `spec.tags` and make sure the operator's tag is an [owner][docs-acls-tag-owners] of the tag you choose.

Add a grant that lets the intended source devices use the tag your peer relay uses:

```json
{
	"grants": [
		{
			"src": ["tag:private-workloads"],
			"dst": ["tag:k8s"],
			"app": {
				"tailscale.com/cap/relay": []
			}
		}
	]
}
```

## Deploy a PeerRelay

1. (Optional) Set the [tag][docs-tags] of the peer relay devices so they are [automatically approved][docs-acls-autoapprovers]. If you set a custom tag, make sure the operator is an [owner][docs-acls-tag-owners] of that tag.

2. Create a `PeerRelay` resource:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: PeerRelay
   metadata:
     name: my-relay
   spec:
     replicas: 1
   ```

   > **Note:**
   >
   > On AWS/EKS, this manifest is all you need. The operator reads the address of the Network Load Balancer the AWS Load Balancer Controller provisions and advertises it for you. Configure [Elastic IPs][ar-pin-replicas-to-elastic-ips] only if the peer relay must be reachable on addresses you control.

3. Wait for the `PeerRelay` to become ready:

   ```shell
   kubectl wait --for=condition=PeerRelayReady=true peerrelay my-relay
   ```

4. Inspect the `PeerRelay` to verify the public endpoints each replica advertises:

   ```shell
   kubectl get peerrelay my-relay
   ```

   ```
   NAME       AGE   STATUS            ENDPOINTS
   my-relay   2m    PeerRelayReady    203.0.113.10
   ```

Once at least one replica is ready, tailnet devices with the relay grant automatically discover the peer relay and use it for traffic they can't send directly.

## High availability for a peer relay

To improve resilience, run more than one replica of a `PeerRelay`. Each replica joins the tailnet as its own device with its own public UDP endpoint. If one replica becomes unreachable, tailnet devices with the relay grant fall back to the remaining replicas.

Apply the following manifest to run a `PeerRelay` with three replicas:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 3
```

> **Note:**
>
> Each replica of a `PeerRelay` is fronted by its own `LoadBalancer` Service, which provisions a separate cloud load balancer (and, on AWS, a separate Elastic IP). Scaling replicas up increases your cloud provider bill accordingly, so pick the replica count that matches your resilience needs rather than the maximum.

On GCP, Azure, and AWS, you only need `spec.replicas`. Each replica's Service gets its own load balancer with a distinct public address, and the operator advertises that address as the replica's endpoint.

## Customize the LoadBalancer Service

The operator applies default annotations to every `LoadBalancer` Service it creates so the Service is provisioned with a public IP address on GCP, AWS, and Azure. If you're targeting a different cloud provider or an in-cluster load balancer controller, use `spec.service.annotations` to supply the annotations your controller expects. These annotations apply uniformly to every replica.

For example, to steer [MetalLB][xt-metallb] to a specific address pool:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 1
  service:
    annotations:
      metallb.io/address-pool: peer-relays
```

### Change the UDP port

By default, each replica listens on UDP port `41641`, and its `LoadBalancer` Service exposes the same port. To use a different port, such as when a firewall permits only specific ports, set `spec.service.port`. The replica and its Service always use the same port, because the peer relay advertises its address and port to other tailnet devices and the load balancer must not rewrite the port. This field requires the Tailscale Kubernetes Operator version 1.104 or later.

The following manifest runs a `PeerRelay` on UDP port `40000`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 1
  service:
    port: 40000
```

Changing the port on an existing `PeerRelay` briefly interrupts relay traffic while the load balancer updates.

## Deploy on AWS

The AWS Load Balancer Controller provisions a Network Load Balancer (NLB) for each `LoadBalancer` Service the operator creates. By default the operator does not pin any subnets, so the controller places the load balancer in every availability zone it discovers and gives it an address in each. The operator turns on cross-zone load balancing, which lets any of those addresses reach the replica's pod whichever zone Kubernetes schedules it into. AWS NLBs are exposed as DNS names rather than IP addresses, so the operator resolves the name and advertises the resulting addresses as the replica's endpoint.

This means no AWS-specific configuration is required. Deploy a `PeerRelay` on EKS the same way you would on any other cluster.

### Pin replicas to Elastic IPs

Use `spec.aws.elasticIPs` when the peer relay must be reachable on addresses you control, such as when the addresses are referenced by a firewall rule elsewhere. Each entry pairs an Elastic IP (EIP) allocation ID with the subnet its load balancer is provisioned in, and replica `N` uses entry `N`.

Pinning a subnet enables only that subnet's availability zone on the replica's load balancer, and a Network Load Balancer only forwards to targets in a zone enabled on it. Otherwise, nothing else constrains where Kubernetes schedules the replica's pod, so you must also keep the pods in that zone with a [ProxyClass][docs-operator-proxyclass].

1. Allocate one EIP per intended replica.

2. Create a `ProxyClass` that pins pods to the zone where your subnets are located:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyClass
   metadata:
     name: relay-zone
   spec:
     statefulSet:
       pod:
         nodeSelector:
           topology.kubernetes.io/zone: us-east-1a
   ```

3. Create the `PeerRelay` resource referencing that `ProxyClass`, with a paired list of allocations and subnets. The list must be at least as long as `spec.replicas`, and every subnet must be a public subnet in the zone the `ProxyClass` pins:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: PeerRelay
   metadata:
     name: my-relay
   spec:
     replicas: 3
     proxyClass: relay-zone
     aws:
       elasticIPs:
         - allocationID: eipalloc-0aaaaaaaaaaaaaaaa
           subnetID: subnet-0aaaaaaaaaaaaaaaa
         - allocationID: eipalloc-0bbbbbbbbbbbbbbbb
           subnetID: subnet-0bbbbbbbbbbbbbbbb
         - allocationID: eipalloc-0cccccccccccccccc
           subnetID: subnet-0cccccccccccccccc
   ```

Each replica has its own load balancer, so several replicas can name subnets in the same zone, each with its own Elastic IP. A standard VPC Elastic IP is regional rather than zonal, so it takes the zone of whichever subnet you pair it with.

> **Warning:**
>
> Every replica of a `PeerRelay` shares one pod template, so a `ProxyClass` can hold the pods in a single zone but cannot place different replicas in different zones. Therefore, pinning Elastic IPs confines the whole `PeerRelay` to one availability zone, which gives up the zone redundancy that running several replicas otherwise provides. Omit `spec.aws` if you want replicas spread across zones.

> **Note:**
>
> `spec.aws.elasticIPs` overrides any `service.beta.kubernetes.io/aws-load-balancer-eip-allocations` or `service.beta.kubernetes.io/aws-load-balancer-subnets` annotations supplied via `spec.service.annotations`. If both are set the per-replica values in `spec.aws.elasticIPs` take precedence.

## Customization

You can customize the resources the operator creates for a `PeerRelay` with a [ProxyClass][docs-operator-proxyclass]. Reference the ProxyClass by name using `spec.proxyClass`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 3
  proxyClass: my-proxy-class
```

You can find the full list of configuration options in the [PeerRelay API reference][xt-gh-tailscale-k8s-peerrelay].

## Static endpoints

Peer relays advertise one or more [static endpoints][docs-peer-relay-static-endpoints] so that other tailnet devices can reach them at a stable `ip:port` even when the device is behind a load balancer or NAT. Outside Kubernetes you configure static endpoints yourself with `tailscale set --relay-server-static-endpoints`.

The `PeerRelay` CRD handles this for you: for each replica, the operator reads the public address the cloud has assigned to the replica's `LoadBalancer` Service and writes it into the replica's tailscaled configuration as the static endpoint. You don't need to run `tailscale set` on the pods and you don't need to know the public IPs in advance.

Use the CLI approach for peer relays running on standalone devices where you manage the network configuration yourself. Use the `PeerRelay` CRD for peer relays running inside a Kubernetes cluster.

### Add static endpoints

Tailnet devices might not be able to reach a replica at the address its load balancer reports. For example, a NAT device or firewall might sit in front of the cluster, or no load balancer controller might assign the `LoadBalancer` Service an address. In these cases, list the addresses that tailnet devices can reach in `spec.staticEndpoints`. This field requires the Tailscale Kubernetes Operator version 1.104 or later.

Each entry is an `ip:port` pair. Enclose IPv6 addresses in brackets, and quote those entries in YAML:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: PeerRelay
metadata:
  name: my-relay
spec:
  replicas: 1
  staticEndpoints:
    - 203.0.113.10:41641
    - "[2001:db8::10]:41641"
```

The operator advertises these endpoints for every replica, alongside the addresses it discovers from each replica's load balancer, and lists them in `status.endpoints`. If an entry uses an address that a replica's load balancer already provides, the entry's port replaces the port the load balancer provides for that address. Each address can appear only once across all entries.

A replica with only static endpoints still becomes ready. This lets you run a `PeerRelay` in a cluster where no load balancer controller assigns addresses to `LoadBalancer` Services.

## Verify the peer relay

To verify that peer relay traffic is flowing, generate traffic between two tailnet devices that can't reach each other directly and run `tailscale status`. When a device uses a peer relay, its connection type is reported as `peer-relay`:

```shell
tailscale status | grep peer-relay
```

You can also list the peer relays the local device knows about:

```shell
tailscale debug peer-relay-servers
```

Refer to the [peer relay documentation][docs-peer-relay] for more detail on how peer relay connections are established and verified.

## Troubleshooting

If you encounter issues, refer to [Troubleshooting the Tailscale Kubernetes Operator][docs-operator-troubleshooting].

[ar-configure-a-grant-policy]: #configure-a-grant-policy

[ar-pin-replicas-to-elastic-ips]: #pin-replicas-to-elastic-ips

[docs-acls-autoapprovers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-acls-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-grant-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants]: /docs/features/access-control/grants

[docs-operator-proxyclass]: /docs/kubernetes-operator/concepts/proxyclass

[docs-operator-setup]: /docs/kubernetes-operator/install-operator

[docs-operator-troubleshooting]: /docs/kubernetes-operator/reference/troubleshooting

[docs-peer-relay]: /docs/features/peer-relay

[docs-peer-relay-static-endpoints]: /docs/features/peer-relay#static-endpoints

[docs-tags]: /docs/features/tags

[xt-aws-lb-controller]: https://kubernetes-sigs.github.io/aws-load-balancer-controller

[xt-gh-tailscale-k8s-peerrelay]: https://github.com/tailscale/tailscale/blob/main/k8s-operator/api.md

[xt-k8s-custom-resources]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources

[xt-metallb]: https://metallb.io/
