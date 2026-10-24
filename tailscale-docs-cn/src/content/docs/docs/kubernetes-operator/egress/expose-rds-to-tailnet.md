---
title: "Expose Amazon RDS to your tailnet"
description: "You can use the Tailscale Kubernetes Operator to expose any cloud service, such as an RDS database on a cluster network, to your tailnet. If you have a cloud service that is not publicly accessible bu"
---

Last validated Jun 5, 2026

You can use the Tailscale Kubernetes Operator to expose any cloud service, such as an RDS database on a cluster network, to your tailnet. If you have a cloud service that is not publicly accessible but is reachable from a Kubernetes cluster on that cloud, you can make it available to your tailnet using an operator deployed in the cluster.

## Prerequisites

Before you begin, make sure you have the following:

* [Install][docs-operator] the Tailscale Kubernetes Operator in your cluster.
* An Amazon RDS instance or other cloud service that is reachable from within the cluster, for example in the same VPC.
* The [view-secret kubectl plugin][xt-view-secret], used to retrieve the proxy's MagicDNS name.
* A database client such as `psql` or `mysql` to connect to the service from a tailnet device.

## Expose a cloud service using a Kubernetes ExternalName Service

If the cloud service you want to expose has a DNS name that can be resolved from within the cluster, you can expose it using an [`ExternalName` `Service`][xt-externalname].

For example, to expose an RDS database and connect to it from a tailnet client, create an `ExternalName` `Service` with the `tailscale.com/expose` annotation set to `"true"` and the `spec.externalName` field set to the DNS name of the RDS instance:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-rds
  annotations:
    tailscale.com/expose: "true"
spec:
  type: ExternalName
  externalName: my-rds.eu-central-1.rds.amazonaws.com
```

Next, retrieve the Tailscale MagicDNS name of the cluster proxy that the operator creates for the `Service` using the [view-secret kubectl plugin][xt-view-secret]:

```shell
rds_magic_dns_name=$(kubectl view-secret \
  $(kubectl get secret -n tailscale   \
  --selector tailscale.com/parent-resource=my-rds,tailscale.com/parent-resource-ns=default,tailscale.com/parent-resource-type=svc \
  -ojsonpath='{.items[0].metadata.name}') \
  -n tailscale \
  device_fqdn)
```

You can connect to the RDS instance from a tailnet client using the MagicDNS name of the proxy as the database hostname. For example, for a PostgreSQL database:

```shell
psql -h ${rds_magic_dns_name} -U postgres
```

The cluster proxies created for `ExternalName` `Service` resources forward TCP traffic, so you can use them with any TCP-based protocol such as PostgreSQL, MySQL, or Redis. The Tailscale Kubernetes Operator attempts to resolve the IP addresses of the backend cloud service every 10 minutes and reconfigures the proxy rules if needed.

> **Note:**
>
> For proxies deployed with [firewall in nftables mode][docs-firewall-mode], traffic is only proxied to the first IP address that the DNS name resolves to.

## Expose a CIDR range using a Connector

If the cloud service does not have a DNS name resolvable within the cluster, or you want to expose multiple services in a CIDR range, use a [`Connector`][docs-k8s-connector] resource:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Connector
metadata:
  name: my-rds-instances
spec:
  subnetRouter:
    advertiseRoutes:
      - "<rds-cidr-range>"
```

This `Connector` configures the operator to deploy an in-cluster [subnet router][docs-subnets] that exposes the configured CIDR range to your tailnet.

## Further exploration

* [Customize][docs-k8s-customize] the Operator and the resources it manages.
* [Troubleshoot][docs-k8s-troubleshoot] common issues with the Operator and the resources it manages.

[docs-firewall-mode]: /docs/features/firewall-mode

[docs-k8s-connector]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-k8s-customize]: /docs/kubernetes-operator/concepts/proxyclass

[docs-k8s-troubleshoot]: /docs/kubernetes-operator/reference/troubleshooting

[docs-operator]: /docs/kubernetes-operator/install-operator

[docs-subnets]: /docs/features/subnet-routers

[xt-externalname]: https://kubernetes.io/docs/concepts/services-networking/service/#externalname

[xt-view-secret]: https://github.com/elsesiy/kubectl-view-secret
