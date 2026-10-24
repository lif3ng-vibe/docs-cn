---
title: "Configure Kubernetes RBAC for the API server proxy"
description: "The API server proxy in auth mode impersonates requests from the tailnet to the Kubernetes API server using the caller's Tailscale identity. You can then use Kubernetes RBAC to control what API server"
---

Last validated Jun 5, 2026

The API server proxy in auth mode impersonates requests from the tailnet to the Kubernetes API server using the caller's Tailscale identity. You can then use Kubernetes RBAC to control what API server resources tailnet identities can access.

> **Note:**
>
> Access to the proxy over the tailnet does not grant tailnet users any default permissions to access Kubernetes API server resources. Tailnet users can only access API server resources that they have been explicitly authorized to access through Kubernetes RBAC.

## How impersonation works

> **Tip:**
>
> Impersonation only applies when the proxy is running in auth mode. If you want to use Tailscale only for connectivity and handle authentication separately, refer to [Proxy without authentication (noauth mode)][docs-noauth].

The proxy sets Kubernetes [impersonation headers][xt-k8s-impersonation] on each request based on the caller's Tailscale identity:

* **User devices**: `Impersonate-User` is set to the Tailscale user's login name. For example, `alice@example.com`. If [grants][docs-grants] define Kubernetes groups for the user, those are added as `Impersonate-Group` headers.
* **Tagged devices**: `Impersonate-User` is set to the node's FQDN. If grants define Kubernetes groups, those are used as `Impersonate-Group` headers. If no grants apply, the node's [tags][docs-tags] are used as groups instead.

## Use grants to impersonate Kubernetes groups

[Grants][docs-grants] let you map Tailscale user groups to Kubernetes groups. For example, to give `group:prod` cluster admin access and `group:k8s-readers` read-only access:

```json
{
  "grants": [
    {
      "src": ["group:prod"],
      "dst": ["tag:k8s-operator"],
      "app": {
        "tailscale.com/cap/kubernetes": [{
          "impersonate": {
            "groups": ["system:masters"]
          }
        }]
      }
    },
    {
      "src": ["group:k8s-readers"],
      "dst": ["tag:k8s-operator"],
      "app": {
        "tailscale.com/cap/kubernetes": [{
          "impersonate": {
            "groups": ["tailnet-readers"]
          }
        }]
      }
    }
  ]
}
```

* `grants.dst` must match the tag of your API server proxy. The operator's tag for in-process mode, or the `ProxyGroup`'s tag for dedicated mode.
* `system:masters` is a built-in Kubernetes group with cluster-admin privileges.
* `tailnet-readers` is a custom Kubernetes group name. Group names do not need to be pre-created in Kubernetes.

Then bind the custom group to a Kubernetes `ClusterRole`:

```shell
kubectl create clusterrolebinding tailnet-readers-view --group=tailnet-readers --clusterrole=view
```

## Use tags to impersonate Kubernetes groups

If no grants apply and the request comes from a tagged device, the proxy impersonates a Kubernetes group matching each of the device's tags.

For example, a device tagged with `tag:k8s-readers` is authenticated as Kubernetes group `tag:k8s-readers`. Bind it to a `ClusterRole`:

```shell
kubectl create clusterrolebinding tailnet-readers --group="tag:k8s-readers" --clusterrole=view
```

## Use Tailscale user identity

If the request comes from an untagged device and no grants apply, the proxy impersonates a Kubernetes user matching the sender's Tailscale login name.

For example, to grant `alice@tailscale.com` read-only access:

```shell
kubectl create clusterrolebinding alice-view --user="alice@tailscale.com" --clusterrole=view
```

[docs-grants]: /docs/features/access-control/grants

[docs-noauth]: /docs/kubernetes-operator/api-server-access/noauth-mode

[docs-tags]: /docs/features/tags

[xt-k8s-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
