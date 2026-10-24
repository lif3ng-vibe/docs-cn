---
title: "Expose a Kubernetes cluster workload to the public internet using Tailscale Funnel"
description: "This guide explains how to expose a `Service` deployed in your Kubernetes cluster to the public internet using the Tailscale Kubernetes Operator and [Tailscale Funnel][docs-funnel]."
---

Last validated Jun 5, 2026

This guide explains how to expose a `Service` deployed in your Kubernetes cluster to the public internet using the Tailscale Kubernetes Operator and [Tailscale Funnel][docs-funnel].

## Prerequisites

Before you begin, make sure you have the following:

* Tailscale Kubernetes Operator installed in your cluster.
* Configure the [necessary permissions for `Ingress`][docs-ingress-permissions].

## Update tailnet policy file

For [Tailscale Funnel][docs-funnel] to work, the Operator's proxy nodes need explicit permission to use Funnel. Add a `nodeAttrs` section to your tailnet policy file in the [Access controls](https://console.tailscale.com/admin/acls):

```json
	"nodeAttrs": [
		{
			// 'tag:k8s' is the default tag used by the Tailscale Operator
			"target": ["tag:k8s"],
			"attr":   ["funnel"],
		},
	]
```

> **Note:**
>
> Even if your policy has the `funnel` attribute assigned to `autogroup:member`, which is the default, you still need to add it to the tag used by proxies because `autogroup:member` does not include tagged devices.

## Deploy a sample application

Deploy an nginx application as the workload to expose.

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

## Create the Funnel Ingress

To expose the nginx `Service` to the public internet, create an `Ingress` resource with the `tailscale.com/funnel: "true"` annotation.

Create a file named `nginx-ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-funnel-ingress
  annotations:
    # This enables Tailscale Funnel for the Ingress
    tailscale.com/funnel: "true"
spec:
  ingressClassName: tailscale
  defaultBackend:
    service:
      name: nginx-service
      port:
        number: 80
  tls:
    - hosts:
        - nginx-public
```

Apply the `Ingress`:

```shell
kubectl apply -f nginx-ingress.yaml
```

## Access your service

The operator configures a Tailscale Service and the proxies to route traffic to your nginx application. You can find the MagicDNS name in the ADDRESS field of the `Ingress` resource:

```shell
kubectl get ingress nginx-funnel-ingress
```

The output will display similar to the following:

```
NAME               CLASS       HOSTS   ADDRESS                     PORTS   AGE
nginx-ha-ingress   tailscale   *       nginx-public.tailxxxxx.ts.net   80     1m
```

After the ADDRESS field is populated with a MagicDNS name, access it from a device outside your tailnet, such as a mobile phone using cellular data.

## Further exploration

* Find practical configurations and deployment patterns in the [Tailscale Funnel examples][docs-funnel-examples].
* Find detailed command syntax, flags, and usage information in the [Funnel CLI reference][docs-funnel-cli].
* Deploy and manage Tailscale in Kubernetes with the [Tailscale Kubernetes Operator][docs-k8s-operator].

[docs-funnel]: /docs/features/tailscale-funnel

[docs-funnel-cli]: /docs/reference/tailscale-cli/funnel

[docs-funnel-examples]: /docs/reference/examples/funnel

[docs-ingress-permissions]: /docs/kubernetes-operator/reference/rbac

[docs-k8s-operator]: /docs/kubernetes-operator
