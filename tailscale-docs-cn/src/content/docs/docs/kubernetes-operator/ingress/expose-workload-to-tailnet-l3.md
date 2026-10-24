---
title: "Expose a cluster workload to your tailnet (layer 3)"
description: "This guide covers exposing a service running in your Kubernetes cluster to your tailnet using the Layer 3 (L3) Ingress feature of the Tailscale Kubernetes Operator. You can use this to expose non-HTTP"
---

Last validated Jun 5, 2026

This guide covers exposing a service running in your Kubernetes cluster to your tailnet using the Layer 3 (L3) Ingress feature of the Tailscale Kubernetes Operator. You can use this to expose non-HTTP workloads to the tailnet, and this does not require [enabling HTTPS for your tailnet][docs-https-setup]. You use a `ProxyGroup` and a Kubernetes `Ingress` resource to create multiple ingress proxies, ensuring your service remains available even if one of the proxies fails.

## Prerequisites

* [Install][docs-k8s-install] the Tailscale Kubernetes Operator.
* Configure the [necessary permissions for L3 Ingress][docs-k8s-permissions].

## Create a ProxyGroup

Create a `ProxyGroup`. This custom resource manages a set of Tailscale proxies for ingress.

Create a file named `ingress-proxygroup.yaml` with the following content:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: ingress-proxies
spec:
  type: ingress
  replicas: 2
```

Apply this manifest to your cluster:

```shell
kubectl apply -f ingress-proxygroup.yaml
```

This creates a `ProxyGroup` named `ingress-proxies` with two replicas. The operator creates a `StatefulSet` with 2 replicas in the `tailscale` namespace.

## Deploy a sample application

Deploy an nginx application. This is the application to expose.

Create a file named `nginx-deployment.yaml` with the following content:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
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
```

Apply this manifest to your cluster:

```shell
kubectl apply -f nginx-deployment.yaml
```

## Expose the service with L3 Ingress

Create a Kubernetes `Service` to act as an L3 Ingress point. By applying specific annotations and setting the `loadBalancerClass`, the Tailscale Kubernetes Operator automatically exposes it to the tailnet.

*（图：A diagram showing ProxyGroup ingress architecture. Multiple proxy pod replicas in a StatefulSet expose a Kubernetes Service to the tailnet through a shared Tailscale Service.）*

### Create the Kubernetes service

Create a file named `nginx-service.yaml` with the following configuration:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  annotations:
    # Links the Service to the ProxyGroup
    tailscale.com/proxy-group: ingress-proxies
    # Sets the MagicDNS hostname for the Tailscale Service
    tailscale.com/hostname: nginx
spec:
  selector:
    app: nginx
  ports:
    - name: http
      port: 80
      targetPort: 80
  type: LoadBalancer
  loadBalancerClass: tailscale
```

### Configuration details

The following annotations and fields configure L3 Ingress behavior:

* `tailscale.com/proxy-group`: This annotation tells the operator to route traffic through the `ingress-proxies` `ProxyGroup`.
* `tailscale.com/hostname`: Defines the hostname for the Tailscale Service's MagicDNS name. For example, `nginx.foobar.ts.net`.
* `loadBalancerClass: tailscale`: Instructs the operator to expose this Kubernetes `Service` to the tailnet.

Apply this manifest to your cluster:

```shell
kubectl apply -f nginx-service.yaml
```

## Access your service

The operator creates a Tailscale Service matching the configured hostname and configures the `ProxyGroup` to advertise it. The `ProxyGroup` also routes requests to the `nginx-service` Kubernetes `Service`.

You can find the Tailscale IP address bound to the `nginx-service` Kubernetes `Service` in the `ADDRESS` field of the `Service` resource:

```shell
kubectl get service nginx-service
```

The output displays with an IP address in the `EXTERNAL-IP` column:

```
NAME            TYPE           CLUSTER-IP       EXTERNAL-IP       PORT(S)        AGE
nginx-service   LoadBalancer   34.118.238.206   100.102.116.165   80:30162/TCP   3m26s
```

After the `EXTERNAL-IP` field is populated with a Tailscale IP address, you can access your nginx `Service` from any device in your tailnet by connecting to the Tailscale IP address and the service on port `80`. Traffic is load-balanced across the two proxy pods.

For example, you can access the `Service` using `curl` from a Tailscale device:

```shell
curl http://100.x.x.x:80
```

Alternatively, you can access the `Service` using the configured MagicDNS name:

```shell
curl http://nginx.<tailnet>.ts.net:80
```

For more information, refer to [Expose a cluster workload to your tailnet (layer 7)][docs-k8s-expose-l7].

[docs-k8s-expose-l7]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-k8s-permissions]: /docs/kubernetes-operator/reference/rbac

[docs-https-setup]: /docs/how-to/set-up-https-certificates
