---
title: "High availability for the Tailscale Kubernetes Operator"
description: "The Tailscale Kubernetes Operator provides [`ProxyGroup`][docs-proxy-group] for high availability. A `ProxyGroup` manages a `StatefulSet` of Tailscale proxy replicas, giving you:"
---

Last validated Jun 5, 2026

The Tailscale Kubernetes Operator provides [`ProxyGroup`][docs-proxy-group] for high availability. A `ProxyGroup` manages a `StatefulSet` of Tailscale proxy replicas, giving you:

* **No downtime during pod restarts**: multiple active replicas serve traffic simultaneously.
* **Resource consolidation**: serve many `Service` and `Ingress` resources from a shared set of proxy pods, rather than a dedicated proxy per resource.

`ProxyGroup` supports three modes:

* `ingress`: Expose Kubernetes workloads to your tailnet ([L3][docs-expose-l3], [L7][docs-expose-l7]).
* `egress`: Access tailnet resources from your cluster. Refer to the [egress guide][docs-egress].
* `kube-apiserver`: Securely access the Kubernetes API over Tailscale. Refer to the [API server proxy guide][docs-api-server].

This guide covers how to configure a `ProxyGroup` and [`ProxyClass`][docs-proxy-class] for high availability. For step-by-step deployment, refer to [further exploration][ar-further-exploration].

## Replicas

Set `spec.replicas` to control how many proxy pods the `ProxyGroup` runs. The default is `2`. Increasing this gives you more resilience: if a pod or node goes down, the remaining replicas continue serving traffic.

```yaml
spec:
  replicas: 3
```

## Configure with ProxyClass

A [`ProxyClass`][docs-proxy-class] lets you customize the `StatefulSet` and `Pod` spec of your `ProxyGroup` replicas. For example, to reference a `ProxyClass` called `ha-production`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-proxies
spec:
  type: ingress
  replicas: 3
  proxyClass: ha-production
```

> **Note:**
>
> The `ProxyClass` must exist and be in a `Ready` state before the `ProxyGroup` will reconcile.

The following sections cover the most relevant `ProxyClass` options for high availability.

### Scheduling

`ProxyClass` exposes Kubernetes scheduling fields on proxy pods, which you can use to spread replicas for resilience:

* `spec.statefulSet.pod.topologySpreadConstraints`: spread replicas across zones or nodes.
* `spec.statefulSet.pod.affinity`: configure affinity or anti-affinity rules for replica placement.
* `spec.statefulSet.pod.nodeSelector`: constrain proxies to specific nodes.
* `spec.statefulSet.pod.tolerations`: let proxies be scheduled on tainted nodes (for example, dedicated proxy nodes).

Refer to the [Kubernetes scheduling documentation][xt-k8s-scheduling] for details on these fields.

### Pod disruption budgets

Voluntary disruptions (node drains, cluster upgrades) can terminate all proxy pods simultaneously. Create a Kubernetes `PodDisruptionBudget` to prevent this. Use `spec.statefulSet.pod.labels` on your `ProxyClass` to add a label to proxy pods, then reference it in the `PodDisruptionBudget` selector.

### Resource requests and limits

`ProxyClass` supports `spec.statefulSet.pod.tailscaleContainer.resources` for setting resource requests and limits on the proxy container, ensuring predictable scheduling and preventing unexpected eviction.

### Metrics

Enable Prometheus metrics to monitor proxy health across replicas:

```yaml
spec:
  metrics:
    enable: true
```

Metrics are served at `<pod-ip>:9002/metrics`. To create a Prometheus `ServiceMonitor` automatically:

```yaml
spec:
  metrics:
    enable: true
    serviceMonitor:
      enable: true
```

## TLS certificates

For HA ingress, proxy replicas share a TLS `Secret` for Let's Encrypt certificates. All replicas can serve TLS traffic after the certificate has been issued.

Proxies can also share a Let's Encrypt account so that certificate renewals keep their [rate limit exemption][docs-lets-encrypt-rate-limits] when Pods are recreated.

When testing, use the Let's Encrypt staging environment through a `ProxyClass` to avoid [rate limits][docs-lets-encrypt-rate-limits]:

```yaml
spec:
  useLetsEncryptStagingEnvironment: true
```

## Egress graceful failover

Egress `ProxyGroup` replicas support graceful failover: when a pod is terminated, in-flight connections are drained to other replicas automatically.

> **Warning:**
>
> Setting a custom `TS_LOCAL_ADDR_PORT` environment variable on egress `ProxyGroup` pods disables graceful failover.

## Static endpoints

Configure [static endpoints][docs-static-endpoints] to let clients connect directly to proxy pods through NodePort. This reduces latency for production workloads by establishing direct connections rather than relying on relay servers. Refer to the [static endpoints guide][docs-static-endpoints] for configuration details.

## Multi-cluster

If the same `Ingress` configuration is applied across multiple clusters, `ProxyGroup` proxies from each cluster become valid targets for the same `ts.net` DNS name. Client routing follows the same rules as [high availability subnet routers][docs-ha-subnet-routers]. Refer to the [multi-cluster ingress guide][docs-multi-cluster] for details.

## Further exploration

* [Expose][docs-expose-l3] a workload to your tailnet at Layer 3.
* [Expose][docs-expose-l7] a workload to your tailnet at Layer 7.
* [Access][docs-egress] tailnet resources from Kubernetes.
* [Access][docs-api-server] the Kubernetes API over Tailscale.
* Configure [multi-cluster ingress][docs-multi-cluster].

[ar-further-exploration]: #further-exploration

[docs-api-server]: /docs/kubernetes-operator/api-server-access

[docs-egress]: /docs/kubernetes-operator/egress

[docs-expose-l3]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l3

[docs-expose-l7]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-ha-subnet-routers]: /docs/how-to/set-up-high-availability

[docs-lets-encrypt-rate-limits]: /docs/kubernetes-operator/manage-and-configure/lets-encrypt-rate-limits

[docs-multi-cluster]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-proxy-class]: /docs/kubernetes-operator/concepts/proxyclass

[docs-proxy-group]: /docs/kubernetes-operator/concepts/proxygroup

[docs-static-endpoints]: /docs/kubernetes-operator/manage-and-configure/configure-static-endpoints

[xt-k8s-scheduling]: https://kubernetes.io/docs/concepts/scheduling-eviction/
