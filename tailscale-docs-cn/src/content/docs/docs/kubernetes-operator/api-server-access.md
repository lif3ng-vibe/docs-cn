---
title: "Access the Kubernetes API server over Tailscale"
description: "Securely access the Kubernetes API server over Tailscale."
---

Last validated Jun 5, 2026

The API server proxy lets you securely access your Kubernetes API server over your tailnet without exposing it to the public internet. It sits between tailnet clients and the Kubernetes API server, forwarding authenticated requests.

The API server proxy supports two authentication modes and can run either [in-process][ar-in-process] within the operator or as a [dedicated ProxyGroup][ar-dedicated].

> **Tip:**
>
> **Session recording**: You can record `kubectl exec`, `attach`, and `debug` sessions executed through the API server proxy for audit and compliance. Refer to [Record kubectl sessions][docs-session-recording].

> **Tip:**
>
> **Looking to connect?** If the API server proxy is already configured, use `tailscale configure kubeconfig <proxy-hostname>` to set up `kubectl` access. You can find the proxy's MagicDNS name in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console or ask your cluster administrator. Refer to the [setup topic][docs-access-api] for details.

For information about the set up steps, refer to [Set up the Kubernetes API server over Tailscale][docs-access-api].

## Auth mode (default)

In auth mode, the proxy authenticates incoming requests based on the source Tailscale identity and [impersonates][xt-k8s-impersonation] that identity when forwarding the request to the Kubernetes API server. This lets you use standard Kubernetes RBAC.

How the proxy determines the Kubernetes identity:

* **User devices**: The request is impersonated as the Tailscale user (for example, `alice@example.com`). If [grants][docs-grants] define additional Kubernetes groups, those are added as impersonation groups.
* **Tagged devices**: The request is impersonated as a user with the node's FQDN, with the node's [tags][docs-tags] as Kubernetes groups. If grants define additional groups, those take precedence over the tag-based groups.

## noauth mode

In noauth mode, the proxy forwards requests to the API server without adding authentication information. This is useful if you use Tailscale only for connectivity and handle authentication through another mechanism.

[**Use the API server proxy without Tailscale authentication**](/docs/kubernetes-operator/api-server-access/noauth-mode) — Use the API server proxy for connectivity only, with external authentication.

## In-process proxy

To get started, run the API server proxy in-process within the operator pod. Enable it by setting `apiServerProxyConfig.mode` when installing the operator with Helm:

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string apiServerProxyConfig.mode="true" \
  --wait
```

The client connects to the operator's tailnet address, and the operator proxies the request to the kube-apiserver.

*（图：A diagram showing the in-process API server proxy architecture. A client connects to the operator over the tailnet, and the operator proxies the request to the kube-apiserver inside the Kubernetes cluster.）*

This configuration means the proxy shares a lifecycle with the operator pod and is limited to a single replica.

## Dedicated proxy (ProxyGroup)

For production environments, you can deploy the API server proxy as a dedicated [`ProxyGroup`][docs-proxygroup] with `spec.type: kube-apiserver`. This separates the proxy lifecycle from the operator and provides high availability through multiple replicas.

*（图：A diagram showing the dedicated API server proxy architecture. A ProxyGroup StatefulSet with multiple replicas proxies requests from tailnet clients to the kube-apiserver, separate from the operator pod.）*

The dedicated proxy requires:

* **Impersonation RBAC**: The Helm value `apiServerProxyConfig.allowImpersonation` must be set to provision the Kubernetes RBAC needed for the `ProxyGroup` pods to impersonate users.
* **Auto-approvers**: Your ACL policy must permit the `ProxyGroup`'s tag to advertise [Tailscale Services][docs-tailscale-services].

Refer to the [Set up the Kubernetes API server over Tailscale][docs-access-api] for full setup instructions, and [High availability for the Tailscale Kubernetes Operator][docs-ha] for general `ProxyGroup` configuration.

## Limitations

The API server proxy has the following limitations:

* **In-cluster dependency**: The proxy runs inside the cluster. If the cluster cannot schedule pods, you may lose access to the API.
* **TLS latency**: In-process proxies provision certificates on the first request, which may cause an initial timeout. `ProxyGroup` deployments avoid this by provisioning certificates before becoming ready.

## Further exploration

* Configure [Kubernetes RBAC][docs-auth-rbac] for the API server proxy.
* Configure [high availability][docs-ha] for the Tailscale Kubernetes Operator.
* Configure [session recording][docs-session-recording] for the API server proxy.

[ar-dedicated]: #dedicated-proxy-proxygroup

[ar-in-process]: #in-process-proxy

[docs-access-api]: /docs/kubernetes-operator/api-server-access/setup-api-over-tailscale

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-grants]: /docs/features/access-control/grants

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[docs-session-recording]: /docs/kubernetes-operator/recorder

[docs-tags]: /docs/kubernetes-operator/reference/tags

[docs-tailscale-services]: /docs/features/tailscale-services

[xt-k8s-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
