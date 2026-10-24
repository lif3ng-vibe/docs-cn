---
title: "Add static endpoints to a cluster"
description: "Tailscale uses various [NAT traversal techniques][bl-how-nat-traversal-works] to securely connect to other Tailscale nodes without manual intervention. Most of the time, you do not need to open any [f"
---

Last validated Jun 5, 2026

> **Note:**
>
> This feature is available in Tailscale v1.86 and later, and is only available to proxies within [`ProxyGroups`][docs-proxy-group].

Tailscale uses various [NAT traversal techniques][bl-how-nat-traversal-works] to securely connect to other Tailscale nodes without manual intervention. Most of the time, you do not need to open any [firewall ports][docs-firewalls] for Tailscale. However, in some scenarios where NAT traversal is unsuccessful, Tailscale proxies deployed by the operator rely on a [relayed connection][docs-derp-region], resulting in lower throughput and performance compared to direct connections. For example, when using AWS NAT Gateways, which are [hard NATs][docs-device-connectivity-hard-nat].

In these scenarios, `ProxyClass` provides configuration to use [Kubernetes NodePort services][xt-kubernetes-node-port-service] as extra endpoints to enable direct connections to `ProxyGroups`. After configuring, these endpoints work only for tailnet devices on the same network as that Kubernetes `Node`. If the Kubernetes `Node` has a public IP address, the configured static endpoint is reachable by all Tailscale devices.

## Configure firewall rules

> **Note:**
>
> A maximum of two static endpoints are allowed per `ProxyGroup`. To specify which nodes the operator uses for NodePort `Services`, configure the `spec.staticEndpoints.selector` field in the [`ProxyClass` resource][docs-operator-configuring-static-endpoints].

To use static endpoints, configure inbound firewall rules for each relevant `Node`'s IP address. Tailscale recommends configuring a sufficient number of ports on the firewall to avoid running out of ports as `ProxyGroup` replicas scale.

## Configure static endpoints

To configure static endpoints, complete the following steps.

1. Create a `ProxyClass`.

   The configuration for static endpoints is exposed as part of the [`ProxyClass`][xt-gh-tailscale-k8s-proxyclass] custom resource, under `spec.staticEndpoints`:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyClass
   metadata:
     name: prod
   spec:
     staticEndpoints:
       nodePort:
         ports:
         - "31667-31680"
         selector:
           kubernetes.io/os: linux
   ```

   The example above configures `ProxyClass` to use [Kubernetes NodePort services][xt-kubernetes-node-port-service] for the static endpoints. In the `nodePort` configuration, configure a list of `ports`. Ensure the specified ranges have the necessary firewall rules so the endpoints are reachable from other tailnet devices. Use the `selector` field to specify which Kubernetes node's `ExternalIP`s to use for the static endpoints.

After creating this `ProxyClass`, reference it on a `ProxyGroup` to configure static endpoints for all its replicas:

1. Create a `ProxyGroup`.

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyGroup
   metadata:
     name: ingress
   spec:
     type: ingress
     proxyClass: prod
     replicas: 3
   ```

   After applying this configuration, the example creates three proxy replicas and three Kubernetes NodePort services to enable connections to the `ProxyGroup` from other tailnet devices:

   ```
   NAME                   TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)           AGE
   prod-0-nodeport        NodePort    172.20.123.3     <none>        22918:31669/UDP   84m
   prod-1-nodeport        NodePort    172.20.163.230   <none>        22918:31668/UDP   84m
   prod-2-nodeport        NodePort    172.20.84.83     <none>        22918:31667/UDP   84m
   ```

2. Test the connection.

   After creating the `ProxyGroup`, create a test `Pod` and expose it using an [HA cluster ingress][docs-operator-cluster-ingress-service-ha] to test the static endpoint:

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: test
     namespace: default
     labels:
       app: test
   spec:
     containers:
     - name: nginx
       image: nginx:latest
       ports:
       - containerPort: 80
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: test
     namespace: default
     annotations:
       tailscale.com/proxy-group: ingress
   spec:
     type: LoadBalancer
     loadBalancerClass: tailscale
     selector:
       app: test
     ports:
       - port: 80
         targetPort: 80
         protocol: TCP
   ```

   Run `kubectl get service -n default` to find the Tailscale `Service` IP address used to expose the `Pod` to the tailnet.

   ```
   NAME         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)           AGE
   test         LoadBalancer   172.20.50.164    100.64.1.2    80:31109/TCP      2m17s
   ```

   Test for a direct connection to the `Pod` in your tailnet by using the Tailscale `Service` IP address:

   ```shell
   tailscale ping <external-ip>
   ```

   If a direct connection is successful, observe a log output similar to:

   ```
   pong from prod-0 (100.64.1.1) via 203.0.113.1:31670 in 91ms
   ```

   If unsuccessful, observe a log output similar to:

   ```
   pong from prod-0 (100.64.1.1) via DERP(nyc) in 90ms
   ```

   If this log output is observed, ensure that:

   * Inbound firewall rules are configured appropriately for traffic to flow to the correct Kubernetes nodes and port ranges, as configured in the `ProxyClass`.

   * Selected nodes using `spec.staticEndpoints.nodePort.selector` have `ExternalIP`s in `status.addresses`.

   * The `staticEndpoints` field on the `ProxyGroup`'s `status.devices` is populated with the correct address using a valid `ExternalIP` and the correct `NodePort` for that replica's `Service`.

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-derp-region]: /docs/reference/derp-servers

[docs-device-connectivity-hard-nat]: /docs/reference/device-connectivity#hard-nat

[docs-firewalls]: /docs/integrations/firewalls

[docs-operator-cluster-ingress-service-ha]: /docs/kubernetes-operator/ingress

[docs-operator-configuring-static-endpoints]: /docs/kubernetes-operator/concepts/proxyclass

[docs-proxy-group]: /docs/kubernetes-operator/concepts/proxygroup

[xt-gh-tailscale-k8s-proxyclass]: https://github.com/tailscale/tailscale/blob/main/k8s-operator/api.md#proxyclass

[xt-kubernetes-node-port-service]: https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport
