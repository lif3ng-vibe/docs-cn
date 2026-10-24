---
title: "Secure your AI training cluster"
description: "When your Kubernetes cluster's API server is publicly reachable, every `kubectl` command traverses the internet. For AI training clusters running expensive GPU workloads, this exposure creates a high-"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Tailscale Kubernetes Operator**](/docs/kubernetes-operator) — The Tailscale Kubernetes Operator provides secure connectivity to and from your Kubernetes cluster.

> **Note:** Kubernetes API server proxy is currently in beta.

When your Kubernetes cluster's API server is publicly reachable, every `kubectl` command traverses the internet. For AI training clusters running expensive GPU workloads, this exposure creates a high-value target. Attackers who gain API server access can exfiltrate model weights, use GPU resources for cryptomining, or disrupt multi-day training runs.

The Tailscale Kubernetes operator's API server proxy removes the kube-apiserver from the public internet and routes all `kubectl` access through your tailnet. You get identity-based access control, a complete audit trail, and device compliance enforcement, without changing how your ML engineers use `kubectl`.

This guide covers securing the management plane (`kubectl` and API server access) for a Kubernetes training cluster. It does not cover data-plane security (inter-node GPU traffic).

## Define tags in your tailnet policy file

Tags identify the Kubernetes operator, its proxies, and the session recorder in your access control rules. Define them before installing any components by adding the following `tagOwners` to your [tailnet policy file][docs-tailnet-policy-file]:

```json
"tagOwners": {
  "tag:k8s-operator": [],
  "tag:k8s": ["tag:k8s-operator"],
  "tag:tsrecorder": [],
}
```

The `tag:k8s-operator` tag identifies the operator itself. Because `tag:k8s-operator` owns `tag:k8s`, the operator can create and manage proxy devices with that tag. The `tag:tsrecorder` tag identifies session recording instances used in later steps.

> **Note:**
>
> These tag names are illustrative. Adapt them to your organization's naming conventions (for example, `tag:ml-cluster-operator` or `tag:gpu-cluster`) if you manage multiple Kubernetes environments.

\[Missing snippet: visual\_policy\_editor.mdx]

For the full set of policy file configuration options, refer to the [tailnet policy file reference][docs-tailnet-policy-file].

## Install the Kubernetes operator with the API server proxy

This step deploys the Tailscale Kubernetes operator with the API server proxy enabled in auth mode. Auth mode [impersonates][xt-kubernetes-impersonation] the Tailscale identity of each request's sender, enabling per-user Kubernetes RBAC.

Add the Tailscale Helm repository and update your local cache:

```shell
helm repo add tailscale https://pkgs.tailscale.com/helmcharts
helm repo update
```

Install the operator with the API server proxy enabled:

```shell
helm upgrade \
  --install \
  tailscale-operator \
  tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<your-oauth-client-id> \
  --set-string oauth.clientSecret=<your-oauth-client-secret> \
  --set-string apiServerProxyConfig.mode="true" \
  --wait
```

The `apiServerProxyConfig.mode="true"` flag enables the in-process API server proxy in auth mode. Replace the OAuth client ID and secret with values from your prerequisite OAuth client.

After the install completes, a device named `tailscale-operator` appears in the [Machines](https://console.tailscale.com/admin/machines). This device is the API server proxy endpoint your team uses to access the cluster.

> **Note:**
>
> The alternative `noauth` mode passes requests to the kube-apiserver without identity impersonation. Use `noauth` mode only when combining the proxy with a separate authenticating proxy from your cloud provider or identity provider.

For the full set of operator installation options, refer to the [Kubernetes operator setup guide][docs-operator-setup]. For detailed proxy configuration, refer to the [API server proxy how-to][docs-operator-api-server-proxy].

## Configure `kubectl` to use the Tailscale proxy

With the operator running, point `kubectl` at the Tailscale proxy so all commands route through your tailnet instead of the public kube-apiserver endpoint.

```shell
tailscale configure kubeconfig tailscale-operator
```

This updates `~/.kube/config` to point `kubectl` at the Tailscale proxy device's MagicDNS name (`tailscale-operator` by default).

Verify `kubectl` reaches the cluster through the proxy:

```shell
kubectl get nodes
```

If this command returns your cluster's nodes, `kubectl` routes through the Tailscale proxy. You can now remove the public API server endpoint from your cloud provider's configuration to complete the lockdown.

> **Note:**
>
> If you deploy the optional high-availability ProxyGroup in Step 4, configure `kubectl` with the ProxyGroup's URL instead:
>
> ```shell
> tailscale configure kubeconfig https://ai-cluster.tailxyz.ts.net
> ```

## Map Tailscale identities to Kubernetes RBAC

With the proxy in place, you require grants to control who can access the cluster and what they can do. Grants map Tailscale user identities to Kubernetes RBAC roles through [impersonation][xt-kubernetes-impersonation], replacing shared `kubeconfig` credentials with per-user access. Kubernetes audit logs then show the actual user, not a service account.

The following grant gives members of `group:ml-engineers` full cluster admin access by impersonating the `system:masters` Kubernetes group:

```json
"grants": [
  {
    "src": ["group:ml-engineers"],
    "dst": ["tag:k8s-operator"],
    "app": {
      "tailscale.com/cap/kubernetes": [{
        "impersonate": {
          "groups": ["system:masters"],
        },
      }],
    },
  },
]
```

`system:masters` has a default ClusterRoleBinding to `cluster-admin` in all Kubernetes clusters, granting full access to all API server resources.

For read-only stakeholders who need to inspect training job status without modifying resources, create a separate grant that impersonates a custom Kubernetes group:

```json
"grants": [
  {
    "src": ["group:ml-readers"],
    "dst": ["tag:k8s-operator"],
    "app": {
      "tailscale.com/cap/kubernetes": [{
        "impersonate": {
          "groups": ["tailnet-readers"],
        },
      }],
    },
  },
]
```

The `tailnet-readers` Kubernetes group does not exist by default. Bind it to the built-in `view` ClusterRole to grant read-only access:

```shell
kubectl create clusterrolebinding tailnet-readers-view \
  --group=tailnet-readers --clusterrole=view
```

\[Missing snippet: visual\_policy\_editor.mdx]

Grants alone control what users can do once connected, but your access control rules must also allow traffic from these groups to the API server proxy. Add the following to the `acls` section of your tailnet policy file:

```json
"acls": [
  {
    "action": "accept",
    "src": ["group:ml-engineers"],
    "dst": ["tag:k8s-operator:443"],
  },
  {
    "action": "accept",
    "src": ["group:ml-readers"],
    "dst": ["tag:k8s-operator:443"],
  },
]
```

For additional grant patterns, refer to the [grants overview][docs-grants], [grants syntax reference][docs-grants-syntax], and [grants examples][docs-grants-examples].

[docs-grants]: /docs/features/access-control/grants

[docs-grants-examples]: /docs/reference/examples/grants

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-operator-api-server-proxy]: /docs/kubernetes-operator/api-server-access

[docs-operator-setup]: /docs/kubernetes-operator/install-operator

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-kubernetes-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
