---
title: "Tailscale Kubernetes Operator architecture"
description: "The Tailscale Kubernetes Operator has a collection of use cases that can be combined as needed. The following diagrams illustrate how the Operator implements each use case. Each diagram shows which re"
---

Last validated Jun 5, 2026

The Tailscale Kubernetes Operator has a collection of use cases that can be combined as needed. The following diagrams illustrate how the Operator implements each use case. Each diagram shows which resources run inside the Kubernetes cluster and which are external. Resources inside the cluster are managed by the Operator after it has been deployed.

## API server proxy

The API server proxy lets tailnet devices securely access the Kubernetes API server. It can run in two modes:

### In-process

The operator runs the API server proxy within its own process. The client connects to the operator's tailnet address, and the operator proxies the request to the kube-apiserver.

If the proxy is running in "noauth" mode, it forwards HTTP requests unmodified. In "auth" mode, it deletes any existing auth headers and adds [impersonation headers][xt-k8s-impersonation] before forwarding. A request with impersonation headers looks something like:

```
GET /api/v1/namespaces/default/pods HTTP/1.1
Host: k8s-api.example.com
Authorization: Bearer <operator-service-account-token>
Impersonate-Group: tailnet-readers
Accept: application/json
```

*（图：A diagram showing the in-process API server proxy architecture. A client connects to the operator over the tailnet, and the operator proxies the request to the kube-apiserver inside the Kubernetes cluster.）*

### Dedicated (ProxyGroup)

The API server proxy can also be deployed as a dedicated `ProxyGroup`, running as separate pods from the operator. This provides high availability and separates the proxy lifecycle from the operator.

*（图：A diagram showing the dedicated API server proxy architecture. A ProxyGroup StatefulSet with multiple replicas proxies requests from tailnet clients to the kube-apiserver, separate from the operator pod.）*

## L3 ingress

Refer to the [L3 ingress documentation][docs-l3-ingress] for configuration details.

The user deploys an app to the default namespace and creates a normal `Service` that selects the app's Pods. Either add the annotation `tailscale.com/expose: "true"` or specify `.spec.type` as `Loadbalancer` and `.spec.loadBalancerClass` as `tailscale`. The operator creates an ingress proxy that lets devices anywhere in the tailnet access the `Service`.

The proxy Pod uses `iptables` or `nftables` rules to DNAT traffic bound for the proxy's tailnet IP address to the `Service`'s internal `ClusterIP` instead.

*（图：A diagram showing L3 standalone ingress architecture. The operator creates an ingress proxy pod that uses iptables or nftables DNAT rules to forward traffic from tailnet devices to a Kubernetes Service.）*

## L7 ingress

Refer to the [L7 ingress documentation][docs-l7-ingress] for configuration details.

The L7 ingress architecture diagram is similar to L3 ingress. It is configured through an `Ingress` object instead of a `Service`, and uses `tailscale serve` to accept traffic instead of configuring `iptables` or `nftables` rules. The operator uses tailscaled's local API (`SetServeConfig`) to set serve configuration, not the `tailscale serve` command.

*（图：A diagram showing L7 standalone ingress architecture. The operator creates an ingress proxy pod that uses tailscale serve to accept HTTP traffic from tailnet devices and forward it to a Kubernetes Service.）*

## L3 egress

1. The user deploys a `Service` with `type: ExternalName` and an annotation `tailscale.com/tailnet-fqdn: db.tails-scales.ts.net`.
2. The operator creates a proxy Pod managed by a single replica `StatefulSet`, and a headless `Service` pointing at the proxy Pod.
3. The operator updates the `ExternalName` `Service`'s `spec.externalName` field to point at the headless `Service` it created in the previous step.

Refer to the [L3 egress documentation][docs-l3-egress] for configuration details.

*（图：A diagram showing L3 standalone egress architecture. The operator creates an egress proxy pod, a headless Service, and a configuration Secret. The ExternalName Service resolves to the headless Service, which routes traffic through the egress proxy to a tailnet device.）*

(Optional) If the user also adds the `tailscale.com/proxy-group: egress-proxies` annotation to their `ExternalName` `Service`, the operator skips creating a proxy Pod and instead points the headless `Service` at the existing `ProxyGroup`'s pods. In this case, ports are also required in the `ExternalName` `Service` spec. The following diagram shows a more representative view.

## ProxyGroup

The `ProxyGroup` custom resource manages a collection of proxy Pods. It supports both egress and ingress configurations.

### Egress

The `ProxyGroup` custom resource manages a collection of proxy Pods that can be configured to egress traffic out of the cluster through `ExternalName` Services. A `ProxyGroup` is both a high availability (HA) version of L3 egress, and a mechanism to serve multiple `ExternalName` Services on a single set of Tailscale devices (coalescing).

In this diagram, the `ProxyGroup` is named `pg`. The Secrets associated with the `ProxyGroup` Pods are omitted for simplicity. They are similar to the L3 egress case, but there is a pair of configuration and state Secrets *per Pod*.

Each `ExternalName` `Service` defines which ports should be mapped to their defined egress target. The operator maps from these ports to randomly chosen ephemeral ports through the `ClusterIP` `Service` and its `EndpointSlice`. The operator then generates the egress `ConfigMap` that tells the `ProxyGroup` Pods which incoming ports map to which egress targets.

*（图：A diagram showing ProxyGroup egress architecture. Multiple proxy pod replicas in a StatefulSet forward traffic from ExternalName Services to tailnet devices through ClusterIP Services and EndpointSlices.）*

Refer to the [`ProxyGroup` egress documentation][docs-proxygroup-egress] for configuration details.

### Ingress

A `ProxyGroup` can also serve as a highly available set of proxies for an `Ingress` resource. The `-0` Pod is always the replica that issues a certificate from Let's Encrypt.

If the same `Ingress` configuration is applied in multiple clusters, `ProxyGroup` proxies from each cluster are valid targets for the ts.net DNS name. The proxy each client is routed to depends on the same rules as for [high availability][docs-high-availability] subnet routers, and is encoded in the client's netmap.

*（图：A diagram showing ProxyGroup ingress architecture. Multiple proxy pod replicas in a StatefulSet expose Kubernetes Services to the tailnet through a shared Tailscale Service.）*

## Connector

The `Connector` custom resource can deploy either a subnet router, an exit node, or an app connector. The following diagram shows all three, but only one workflow can be configured per `Connector` resource.

Refer to the [subnet router and exit node documentation][docs-connector] and [app connector documentation][docs-app-connector] for configuration details.

*（图：A diagram showing the Connector architecture. A Connector pod can be configured as a subnet router, exit node, or app connector to route traffic between the tailnet and cluster or external networks.）*

## Recorder nodes

The `Recorder` custom resource makes it easier to deploy `tsrecorder` to a cluster. It supports a single replica.

Refer to the [Recorder documentation][docs-tsrecorder] for configuration details.

*（图：A diagram showing the Recorder architecture. A Recorder pod captures kubectl exec, attach, and debug sessions for audit and compliance.）*

[docs-app-connector]: /docs/kubernetes-operator/connector/deploy-app-connector

[docs-connector]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-l3-egress]: /docs/kubernetes-operator/egress

[docs-l3-ingress]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l3

[docs-l7-ingress]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-proxygroup-egress]: /docs/kubernetes-operator/egress#high-availability-ha-egress

[docs-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder

[xt-k8s-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
