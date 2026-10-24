---
title: "Enable MagicDNS resolution in your cluster"
description: "By default, pods in your Kubernetes cluster cannot resolve Tailscale MagicDNS names (`.ts.net`). If your egress targets use HTTPS, the TLS certificate is issued for the MagicDNS name. For example, `my"
---

Last validated Jun 5, 2026

By default, pods in your Kubernetes cluster cannot resolve Tailscale MagicDNS names (`.ts.net`). If your egress targets use HTTPS, the TLS certificate is issued for the MagicDNS name. For example, `my-database.<tailnet>.ts.net`, and your workloads need to connect using that name for certificate validation to succeed.

This guide describes how to deploy a [DNSConfig][docs-dnsconfig] resource to enable `.ts.net` resolution from within your cluster.

## Prerequisites

Before you begin, make sure you have the following:

* [Install][docs-k8s-install] the Tailscale Kubernetes Operator.
* An egress proxy configured for the tailnet device you want to reach. Refer to [Access a Tailscale Service][docs-access-service].

## Deploy the DNSConfig resource

Create a `DNSConfig` resource to deploy the in-cluster nameserver:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: DNSConfig
metadata:
  name: ts-dns
spec:
  nameserver:
    image:
      repo: tailscale/k8s-nameserver
      tag: unstable
```

Apply the manifest to your cluster:

```shell
kubectl apply -f dnsconfig.yaml
```

## Get the nameserver IP

After the nameserver is running, its `ClusterIP` is written to the `DNSConfig` status:

```shell
kubectl get dnsconfig ts-dns -o jsonpath='{.status.nameserver.ip}'
```

## Configure CoreDNS

Add a stub domain to your CoreDNS configuration so that `.ts.net` queries are forwarded to the Tailscale nameserver.

Edit the CoreDNS `ConfigMap`:

```shell
kubectl edit configmap coredns -n kube-system
```

Add a `ts.net` server block that forwards to the nameserver IP from the previous step:

```
ts.net:53 {
    errors
    cache 30
    forward . <nameserver-ip>
}
```

Restart CoreDNS to pick up the change:

```shell
kubectl rollout restart deployment coredns -n kube-system
```

> **Note:**
>
> If your cluster uses `kube-dns` instead of CoreDNS (for example, some GKE configurations), refer to the [GKE documentation][xt-gke-kube-dns] for stub domain configuration.

## Verify name resolution

Test that `.ts.net` names resolve from within the cluster:

```shell
kubectl run -it --rm dns-test --image=busybox -- nslookup <device>.<tailnet>.ts.net
```

Replace `<device>.<tailnet>.ts.net` with the MagicDNS name of a tailnet device that has an egress proxy configured. If the lookup returns the egress proxy pod IP, MagicDNS resolution is working.

## Further exploration

* [Learn about the DNSConfig resource][docs-dnsconfig] to understand how the in-cluster nameserver resolves MagicDNS names.
* [Access a Tailscale Service][docs-access-service] to reach a tailnet device from your cluster through an egress proxy.

[docs-access-service]: /docs/kubernetes-operator/egress/access-tailnet-service

[docs-dnsconfig]: /docs/kubernetes-operator/concepts/dnsconfig

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[xt-gke-kube-dns]: https://docs.cloud.google.com/kubernetes-engine/docs/concepts/kube-dns#customize-kube-dns
