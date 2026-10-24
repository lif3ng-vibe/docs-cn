---
title: "Expose a cluster workload to your tailnet (layer 7)"
description: "This guide covers exposing a service running in your Kubernetes cluster to your tailnet with high availability. You use a `ProxyGroup` and a Kubernetes `Ingress` resource to create multiple ingress pr"
---

Last validated Jun 5, 2026

This guide covers exposing a service running in your Kubernetes cluster to your tailnet with high availability. You use a `ProxyGroup` and a Kubernetes `Ingress` resource to create multiple ingress proxies, ensuring your service remains available even if one of the proxies fails.

## Prerequisites

* [Install][docs-k8s-install] the Tailscale Kubernetes Operator.
* Configure the [necessary permissions for Ingress][docs-operator-ingress-ha-permissions].

## Create a ProxyGroup

Create a `ProxyGroup` custom resource to manage a set of Tailscale proxies for your `Ingress`.

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

Deploy an nginx application. This is the workload you expose.

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
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

Apply this manifest to your cluster:

```shell
kubectl apply -f nginx-deployment.yaml
```

## Expose the service with an Ingress and ProxyGroup

Expose the `nginx-service` using a Kubernetes `Ingress` resource that references your `ProxyGroup`.

Create a file named `nginx-ha-ingress.yaml` with the following content:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ha-ingress
  annotations:
    tailscale.com/proxy-group: ingress-proxies
spec:
  ingressClassName: tailscale
  tls:
    - hosts:
        - nginx-ha
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

Apply this manifest to your cluster:

```shell
kubectl apply -f nginx-ha-ingress.yaml
```

The key fields in this manifest are:

* `ingressClassName: tailscale`: Instructs the Tailscale operator to manage this `Ingress`.
* `tailscale.com/proxy-group: ingress-proxies`: Instructs the operator to configure the ingress using the `ingress-proxies` `ProxyGroup`.
* `tls.hosts`: Sets the desired MagicDNS name for the Tailscale service that maps to the `Ingress` through advertisement on the `ProxyGroup`.

## Access your service

The operator configures a Tailscale Service and the proxies to route traffic to your nginx application. You can find the MagicDNS name in the ADDRESS field of the `Ingress` resource:

```shell
kubectl get ingress nginx-ha-ingress
```

The output displays similar to following:

```
NAME               CLASS       HOSTS   ADDRESS                     PORTS   AGE
nginx-ha-ingress   tailscale   *       nginx-ha.tailxxxxx.ts.net   443     1m
```

After the ADDRESS field is populated with a MagicDNS name, you can access your nginx service from any device in your tailnet by navigating to `https://nginx-ha.tailxxxxx.ts.net` (full URI found in the ADDRESS field) in your browser.

For more information, refer to the [Expose cluster workloads to your tailnet with Ingress][docs-operator-ingress].

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-operator-ingress]: /docs/kubernetes-operator/ingress

[docs-operator-ingress-ha-permissions]: /docs/kubernetes-operator/reference/rbac
