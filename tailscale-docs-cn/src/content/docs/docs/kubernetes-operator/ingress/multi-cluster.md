---
title: "Configure multi-cluster ingress with regional routing"
description: "This guide shows how to expose an application deployed across two clusters to your tailnet. Clients use a single MagicDNS name. Tailscale uses [regional routing][docs-regional-routing] to select a clu"
---

Last validated Oct 7, 2026

This guide shows how to expose an application deployed across two clusters to your tailnet. Clients use a single MagicDNS name. Tailscale uses [regional routing][docs-regional-routing] to select a cluster for each client.

> **Warning:**
>
> This guide requires [regional routing][docs-route-selection], which is available on the [Premium and Enterprise plans][co-pricing].

* A `ProxyGroup` in each cluster manages a set of highly available proxies.
* A Tailscale `Ingress` in each cluster configures the proxies to forward traffic to the backend Kubernetes `Service` configured on the `Ingress`.
* A single [Tailscale Service][docs-tailscale-services] represents the application replicas in both clusters. Tailscale uses DERP latency measurements to select a region for each client.

> **Note:**
>
> This tutorial covers Layer 7 ingress using a Kubernetes `Ingress` resource. You can use the same approach for Layer 3 ingress using a Kubernetes `Service` resource.

## Prerequisites

Before you begin, make sure you have the following:

* Two Kubernetes clusters available, preferably in different geographical regions.
* [Tailscale Kubernetes Operator][docs-k8s-install] installed in each cluster.
* [Necessary permissions][docs-k8s-ha-permissions] configured for high availability ingress.
* [Auto-approvers][docs-auto-approvers] configured in your ACL policy to permit your proxy tag to advertise Tailscale Services.
* [Regional routing][docs-route-selection] enabled for your tailnet.
* Client devices configured to [accept routes][docs-accept-routes].

## Configure the clusters

Perform these steps in **each cluster**.

### Create a ProxyGroup and ProxyClass

Apply the following manifest to manage the ingress proxies and configure them to use Let's Encrypt's staging environment for initial testing.

Set `hostnamePrefix` to a unique value per cluster (for example, `eu-west`, `us-east`). This determines the hostname of each cluster's proxy devices in your tailnet.

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: ingress-proxies
spec:
  type: ingress
  hostnamePrefix: eu-west
  replicas: 2
  proxyClass: letsencrypt-staging
---
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: letsencrypt-staging
spec:
  useLetsEncryptStagingEnvironment: true
```

```shell
kubectl apply -f proxygroup.yaml
```

### Deploy a sample application

If you don't have an existing workload, deploy this sample nginx application.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
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
  name: nginx
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
```

```shell
kubectl apply -f nginx.yaml
```

### Create the Ingress resource

Expose the nginx service with a shared MagicDNS name. The `spec.tls.hosts` field determines the MagicDNS name. Use the **same hostname** in both clusters so they share a single Tailscale Service.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx
  annotations:
    tailscale.com/proxy-group: ingress-proxies
spec:
  defaultBackend:
    service:
      name: nginx
      port:
        number: 80
  ingressClassName: tailscale
  tls:
    - hosts:
        - nginx
```

```shell
kubectl apply -f ingress.yaml
```

## Test the staging environment

1. Check the MagicDNS name:

   ```shell
   kubectl get ingress nginx
   ```

2. Test traffic flow. Because you are using staging certificates, use the `-k` flag to bypass certificate warnings:

   ```shell
   curl -ksS https://nginx.<tailnet>.ts.net
   ```

3. Verify in the [Services](https://console.tailscale.com/admin/services) that proxy pods from both clusters are listed as backends for the nginx service.

## Switch to production certificates

Update the `ProxyClass` in each cluster to disable the staging environment:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: letsencrypt-staging
spec:
  useLetsEncryptStagingEnvironment: false
```

```shell
kubectl apply -f proxyclass.yaml
```

## Test the production environment

Confirm that traffic is served with a valid production certificate:

```shell
curl https://nginx.<tailnet>.ts.net
```

## How regional routing works

When you create the same `Ingress` in multiple clusters with the same MagicDNS hostname, the Tailscale Kubernetes Operator registers their proxy pods as backends for one Tailscale Service. The control plane groups backends by DERP region. It selects a region for each client, then an available backend in that region. This uses the same mechanism as [high availability subnet routers][docs-ha-subnet-routers].

## Switch to MagicRoute beta

If you switch your tailnet from regional routing to [MagicRoute][docs-magicroute], Tailscale selects among the existing backends using priority scoring instead of DERP-region grouping. You do not need to recreate the Tailscale Service or Kubernetes `Ingress` resources.

## Further exploration

* Configure resilient Kubernetes deployments with [high availability with ProxyGroup][docs-k8s-ha].
* Expose a Kubernetes workload to your tailnet at Layer 7 with [Expose a workload to your tailnet (L7)][docs-expose-l7].
* Route traffic to Kubernetes workloads using [Tailscale Services][docs-tailscale-services].
* Direct traffic to the appropriate region with [regional routing][docs-regional-routing].

[co-pricing]: https://tailscale.com/pricing

[docs-accept-routes]: /docs/features/subnet-routers#use-your-subnet-routes-from-other-devices

[docs-auto-approvers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-expose-l7]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-ha-subnet-routers]: /docs/how-to/set-up-high-availability

[docs-k8s-ha-permissions]: /docs/kubernetes-operator/reference/rbac

[docs-k8s-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-magicroute]: /docs/features/magicroute

[docs-regional-routing]: /docs/features/route-selection#regional-routing

[docs-route-selection]: /docs/features/route-selection

[docs-tailscale-services]: /docs/features/tailscale-services
