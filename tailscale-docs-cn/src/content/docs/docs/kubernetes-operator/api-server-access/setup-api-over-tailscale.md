---
title: "Set up the Kubernetes API server over Tailscale"
description: "This topic describes how to set up the Tailscale API server proxy in auth mode. In this mode, the proxy impersonates the caller's Tailscale identity when forwarding requests to the Kubernetes API serv"
---

Last validated Jun 5, 2026

This topic describes how to set up the Tailscale API server proxy in auth mode. In this mode, the proxy impersonates the caller's Tailscale identity when forwarding requests to the Kubernetes API server. This lets you use standard Kubernetes RBAC. For details on how impersonation works, refer to [Configure authentication and authorization][docs-auth-rbac].

> **Tip:**
>
> If you want to use Tailscale only for connectivity and handle authentication through another mechanism (for example, cloud provider IAM), refer to [Proxy without authentication (noauth mode)][docs-noauth].

## Prerequisites

Before you begin, complete the following:

* [Install the Tailscale Kubernetes Operator][docs-k8s-install].
* [Enable HTTPS][docs-enabling-https] for your tailnet.
* Ensure your [access control policies][docs-acls] permit devices to access the proxy on port `443` over TCP.

For example, if your operator uses `tag:k8s-operator`, permit access for devices tagged with `tag:engineering`:

```json
"grants": [
  {
    "src": ["tag:engineering"],
    "dst": ["tag:k8s-operator"],
    "ip": ["tcp:443"]
  }
]
```

> **Note:**
>
> Access to the proxy over the tailnet does not grant users any default permissions to the Kubernetes API. Users can only access resources they have been explicitly authorized to access through Kubernetes RBAC.
>
> For a quick single-replica setup, you can enable the [in-process proxy][docs-in-process] on the operator itself. Refer to the [overview page][docs-overview] for details.

## Deploy a high-availability proxy with ProxyGroup

For production, deploy the API server proxy as a dedicated [`ProxyGroup`][docs-proxygroup]. This separates the proxy lifecycle from the operator and provides multiple replicas.

### Enable impersonation RBAC

The `ProxyGroup` pods need Kubernetes RBAC permissions to impersonate users and groups when proxying requests. If you haven't already enabled the in-process proxy, set `allowImpersonation` to provision the required RBAC:

```shell
helm upgrade tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --set-string apiServerProxyConfig.allowImpersonation="true" \
  --reuse-values
```

> **Note:**
>
> If you already have `apiServerProxyConfig.mode` set, the RBAC is already provisioned and this step is not needed.

### Configure access control

Ensure your access control policies permit access on both port `80` and `443`:

```json
"grants": [
  {
    "src": ["tag:engineering"],
    "dst": ["tag:k8s"],
    "ip": ["tcp:80", "tcp:443"]
  }
]
```

Configure [auto-approvers][docs-auto-approvers] to let the `ProxyGroup` advertise Tailscale Services:

```json
"autoApprovers": {
  "services": {
    "svc:*": ["tag:k8s"]
  }
}
```

### Create the ProxyGroup

Create a `ProxyGroup` resource with `spec.type: kube-apiserver`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-cluster
spec:
  type: kube-apiserver
  replicas: 2
  kubeAPIServer:
    mode: auth
```

Wait for the `ProxyGroup` to become ready:

```shell
kubectl wait proxygroup my-cluster --for=condition=ProxyGroupReady=true
```

## Configure kubeconfig

After the `ProxyGroup` is ready, get the proxy URL from the `ProxyGroup` status:

```shell
kubectl get proxygroup my-cluster
```

```
NAME         STATUS            URL                                 TYPE             AGE
my-cluster   ProxyGroupReady   https://my-cluster.tailxyz.ts.net   kube-apiserver   31s
```

Use the Tailscale CLI to configure kubectl to connect through the proxy:

```shell
tailscale configure kubeconfig https://my-cluster.tailxyz.ts.net
```

The hostname defaults to the `ProxyGroup` name, but you can customize it using `spec.kubeAPIServer.hostname`.

## Configure Kubernetes RBAC

The proxy impersonates the caller's Tailscale identity, but Kubernetes won't grant any permissions by default. You need to create Kubernetes RBAC bindings to grant access.

For example, to grant your Tailscale user read-only access to the cluster:

```shell
kubectl create clusterrolebinding my-user-view \
  --user="alice@example.com" \
  --clusterrole=view
```

Or to grant all devices tagged with `tag:engineering` read-only access:

```shell
kubectl create clusterrolebinding engineering-view \
  --group="tag:engineering" \
  --clusterrole=view
```

For more advanced configurations using grants and group impersonation, refer to [Configure authentication and authorization][docs-auth-rbac].

## Further exploration

* [Configure][docs-auth-rbac] authentication and authorization for API server access.
* Run the API server proxy in [noauth mode][docs-noauth] to bypass authentication.
* [Record][docs-session-recording] kubectl sessions for auditing and compliance.

[docs-in-process]: /docs/kubernetes-operator/api-server-access#in-process-proxy

[docs-acls]: /docs/features/access-control/acls

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-auto-approvers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-noauth]: /docs/kubernetes-operator/api-server-access/noauth-mode

[docs-overview]: /docs/kubernetes-operator/api-server-access

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[docs-session-recording]: /docs/kubernetes-operator/recorder
