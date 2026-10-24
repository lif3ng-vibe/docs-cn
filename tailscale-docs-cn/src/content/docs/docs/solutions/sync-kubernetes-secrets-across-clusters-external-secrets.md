---
title: "Sync Kubernetes secrets across clusters with External Secrets Operator"
description: "Distribute secrets between Kubernetes clusters using External Secrets Operator and Tailscale's private network, eliminating the need to store credentials in Git or expose API servers to the internet."
---

Last validated Mar 9, 2026

Managing secrets across multiple Kubernetes clusters is one of the harder problems in multi-cluster operations. Teams commonly resort to copying secrets between clusters manually, committing encrypted secrets to Git, or running a centralized vault that requires additional infrastructure. Each approach introduces operational burden or security risk.

[External Secrets Operator][xt-external-secrets] (ESO) solves this by synchronizing secrets from external providers into Kubernetes. Its [Kubernetes provider][xt-eso-kubernetes-provider] can read secrets directly from a remote cluster's API server, making it possible to treat one cluster as a secret source for others. The challenge is connecting ESO to those remote API servers securely.

This guide combines External Secrets Operator with the Tailscale Kubernetes Operator to sync secrets from a source cluster (the cluster that holds the canonical secrets) to one or more workload clusters over a private network. You'll configure Tailscale egress services to route traffic from ESO to the source cluster's API server, authenticated through Tailscale's [Kubernetes impersonation][docs-app-capabilities]. No secrets are stored in Git, no API servers are exposed to the internet, and adding a new workload cluster requires only a new egress service and a `ClusterSecretStore`.

*（图：External Secrets Operator logo and Tailscale logo side by side, representing the integration between the two tools for cross-cluster secret synchronization.）*

## Prerequisites

Before following this guide, make sure you have:

* Two or more Kubernetes clusters (a source cluster that holds secrets and one or more workload clusters that consume them)
* A [Tailscale account](https://login.tailscale.com/start) with [Admin](/docs/reference/user-roles) access
* The Tailscale Kubernetes Operator [installed in each cluster][docs-operator-install] with [OAuth credentials configured][docs-operator-oauth]
* The API server proxy enabled on the source cluster's operator installation
* [External Secrets Operator][xt-external-secrets] installed in each workload cluster

## Install the Tailscale Kubernetes Operator with API server proxy

Install the Tailscale Kubernetes Operator in your source cluster with the API server proxy enabled. This exposes the cluster's API server in your tailnet so that ESO in other clusters can read secrets from it.

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<YOUR_OAUTH_CLIENT_ID> \
  --set-string oauth.clientSecret=<YOUR_OAUTH_CLIENT_SECRET> \
  --set operatorConfig.hostname=source-k8s-operator \
  --set apiServerProxyConfig.mode=true \
  --set apiServerProxyConfig.allowImpersonation=true \
  --wait
```

The key configuration options are:

* `apiServerProxyConfig.mode=true`: Enables the Kubernetes API server proxy, exposing the API server in your tailnet.
* `apiServerProxyConfig.allowImpersonation=true`: Lets Tailscale impersonate Kubernetes users and groups on behalf of connecting clients. This is how ESO authenticates — the bearer token is not used directly.

The workload clusters also need the Tailscale Kubernetes Operator installed, but they don't require the API server proxy:

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<YOUR_OAUTH_CLIENT_ID> \
  --set-string oauth.clientSecret=<YOUR_OAUTH_CLIENT_SECRET> \
  --set operatorConfig.hostname=workload-k8s-operator \
  --wait
```

## Configure access control policies

External Secrets Operator authenticates to the source cluster's API server through Tailscale [Kubernetes impersonation][docs-app-capabilities]. You need to configure [access control policies][docs-access-control] that grant the workload clusters permission to read secrets from the source cluster.

Add the following [grants][docs-grants] to your tailnet policy file. You can update the tailnet policy file from the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console:

> **Note:**
>
> This grants policy uses [application capabilities][docs-app-capabilities] to provide fine-grained access to the source cluster's Kubernetes API. The `impersonate` field controls which Kubernetes groups the workload cluster's operator can act as.

```json
{
  "grants": [
    {
      "src": ["tag:k8s-operator"],
      "dst": ["tag:k8s-operator"],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "impersonate": {
              "groups": ["tailscale:external-secrets"]
            }
          }
        ]
      }
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This policy lets any device tagged `k8s-operator` to impersonate the `tailscale:external-secrets` group when accessing another `k8s-operator` device's Kubernetes API.

The `impersonate.groups` field is the key connection between Tailscale access control and Kubernetes RBAC. When ESO's request reaches the source cluster's API server proxy, Tailscale identifies the calling device, checks that it has a matching grant, and forwards the request with the [Kubernetes impersonation header][xt-k8s-impersonation] `Impersonate-Group: tailscale:external-secrets`. The Kubernetes API server then evaluates the request as if it came from a member of that group. This means you control what ESO can do by creating a Kubernetes `ClusterRoleBinding` that binds the impersonated group to a `ClusterRole`.

> **Note:**
>
> Use a dedicated impersonation group like `tailscale:external-secrets` rather than `system:masters`. This follows the principle of least privilege, granting only the permissions ESO needs rather than full cluster admin access.

## Create RBAC for the impersonated group on the source cluster

The grant above causes requests from workload clusters to arrive at the source cluster's API server as the `tailscale:external-secrets` group. You now need to bind that group to a Kubernetes `ClusterRole` that grants the permissions ESO requires.

Create a `ClusterRole` and `ClusterRoleBinding` on the source cluster:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: external-secrets-reader
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["authorization.k8s.io"]
    resources: ["selfsubjectrulesreviews"]
    verbs: ["create"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: external-secrets-reader
subjects:
  - kind: Group
    name: tailscale:external-secrets
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: external-secrets-reader
  apiGroup: rbac.authorization.k8s.io
```

The `ClusterRoleBinding` subject group (`tailscale:external-secrets`) must match the `impersonate.groups` value in the grant exactly. The `selfsubjectrulesreviews` permission is required because ESO performs a self-check to verify it has the necessary permissions before attempting to read secrets.

Apply this to the source cluster:

```shell
kubectl apply -f rbac.yaml --context source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
```

> **Note:**
>
> For tighter security, use a namespaced `Role` and `RoleBinding` instead of `ClusterRole` to restrict access to specific namespaces. For example, to restrict ESO to only read secrets from the `default` namespace:
>
> ```yaml
> apiVersion: rbac.authorization.k8s.io/v1
> kind: Role
> metadata:
>   name: external-secrets-reader
>   namespace: default
> rules:
>   - apiGroups: [""]
>     resources: ["secrets"]
>     verbs: ["get", "list", "watch"]
>   - apiGroups: ["authorization.k8s.io"]
>     resources: ["selfsubjectrulesreviews"]
>     verbs: ["create"]
> ---
> apiVersion: rbac.authorization.k8s.io/v1
> kind: RoleBinding
> metadata:
>   name: external-secrets-reader
>   namespace: default
> subjects:
>   - kind: Group
>     name: tailscale:external-secrets
>     apiGroup: rbac.authorization.k8s.io
> roleRef:
>   kind: Role
>   name: external-secrets-reader
>   apiGroup: rbac.authorization.k8s.io
> ```

## Create a Tailscale egress service in the workload cluster

In each workload cluster, create a Kubernetes `Service` that routes traffic to the source cluster's API server through Tailscale. This egress service gives ESO a stable in-cluster hostname to reach the remote API server.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: source-k8s-operator
  annotations:
    tailscale.com/tailnet-fqdn: source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
    tailscale.com/proxy-group: <YOUR_PROXY_GROUP>
spec:
  externalName: placeholder
  type: ExternalName
  ports:
  - name: https
    port: 443
    protocol: TCP
```

Replace `<YOUR_TAILNET_NAME>` with your tailnet's [MagicDNS][docs-magicdns] domain and `<YOUR_PROXY_GROUP>` with the name of your [proxy group][docs-proxy-group]. The Tailscale Kubernetes Operator automatically provisions this service and routes traffic to the source cluster through the tailnet.

Apply this to your workload cluster in the namespace where the Tailscale operator manages egress services (typically `tailscale`):

```shell
kubectl apply -f egress-service.yaml -n tailscale
```

The operator creates a backing `ClusterIP` service that pods in the workload cluster can use to reach the source cluster's API server. Pods anywhere in the cluster can resolve the MagicDNS hostname `source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net` to this `ClusterIP` address.

## Set up DNS resolution for MagicDNS

The `ClusterSecretStore` uses a [MagicDNS][docs-magicdns] hostname (for example, `source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net`) as the server URL. For ESO pods to resolve this hostname to the egress service's `ClusterIP`, you need to configure DNS resolution for `.ts.net` domains inside the cluster.

Create a `DNSConfig` resource in each workload cluster. This deploys a [Tailscale nameserver][docs-dns-nameserver] that resolves `.ts.net` hostnames:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: DNSConfig
metadata:
  name: ts-dns
spec:
  nameserver:
    image:
      tag: unstable
```

Apply this to your workload cluster:

```shell
kubectl apply -f dns-config.yaml
```

Get the IP address of the Tailscale nameserver:

```shell
kubectl get dnsconfig ts-dns -o jsonpath='{.status.nameserverStatus.ip}'
```

Make a note of the IP address returned (for example, `100.64.0.4` or `10.100.124.196`). Update your CoreDNS configuration to forward `.ts.net` queries to the Tailscale nameserver:

```shell
kubectl edit configmap coredns -n kube-system
```

Add the following block to the `Corefile` section, replacing `<TAILSCALE_NAMESERVER_IP>` with the IP address you noted:

```text
ts.net:53 {
    errors
    cache 30
    forward . <TAILSCALE_NAMESERVER_IP>
}
```

> **Warning:**
>
> This step is required. Without it, ESO cannot resolve the `.ts.net` MagicDNS hostname in the `ClusterSecretStore` server URL, and the store will fail to connect.

## Configure a ClusterSecretStore

Create a `ClusterSecretStore` in each workload cluster that points to the source cluster through the Tailscale egress service. This tells ESO how to connect to the remote cluster and authenticate.

First, create a placeholder token secret. The Tailscale API server proxy handles authentication through impersonation (configured in the access control policies above), so the bearer token is not used directly. However, ESO's Kubernetes provider requires a token reference in the `ClusterSecretStore` spec:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: tailscale-api-token
  namespace: external-secrets
type: Opaque
stringData:
  token: "unused"
```

> **Note:**
>
> The bearer token value is `"unused"` because authentication is handled entirely by Tailscale impersonation.

Then create the `ClusterSecretStore`:

```yaml
apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: kubernetes-source
spec:
  provider:
    kubernetes:
      remoteNamespace: default
      server:
        url: https://source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
      auth:
        token:
          bearerToken:
            name: tailscale-api-token
            namespace: external-secrets
            key: token
```

The `server.url` uses the MagicDNS hostname, which resolves to the egress service's `ClusterIP` inside the workload cluster. The TLS certificate served by the Tailscale API server proxy is valid for this hostname, so no `caBundle` is needed. ESO falls back to system certificate authority (CA) roots when no CA is explicitly configured, and Let's Encrypt certificates (used by Tailscale) are included in the system trust store.

When a request arrives at the API server proxy, Tailscale identifies the source device, maps it to the impersonation groups defined in your access control policy, and forwards the request with those credentials. The ESO Kubernetes provider requires a `bearerToken` field, so a placeholder secret satisfies the schema.

Apply the `ClusterSecretStore`:

```shell
kubectl apply -f cluster-secret-store.yaml
```

Verify the store is healthy:

```shell
kubectl get clustersecretstore kubernetes-source
```

The `STATUS` column should show `Valid`, meaning ESO can successfully connect to the source cluster.

## Create an ExternalSecret

With the `ClusterSecretStore` configured, you can now create `ExternalSecret` resources that pull specific secrets from the source cluster into the workload cluster. For example, to sync a TLS certificate:

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: <YOUR_SECRET_NAME>
  namespace: <YOUR_NAMESPACE>
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: ClusterSecretStore
    name: kubernetes-source
  target:
    name: <YOUR_SECRET_NAME>
    creationPolicy: Owner
  data:
    - secretKey: ca.crt
      remoteRef:
        key: <YOUR_SOURCE_SECRET>
        property: ca.crt
    - secretKey: tls.crt
      remoteRef:
        key: <YOUR_SOURCE_SECRET>
        property: tls.crt
    - secretKey: tls.key
      remoteRef:
        key: <YOUR_SOURCE_SECRET>
        property: tls.key
```

Apply the `ExternalSecret`:

```shell
kubectl apply -f external-secret.yaml
```

Verify the secret was synced:

```shell
kubectl get externalsecret <YOUR_SECRET_NAME> -n <YOUR_NAMESPACE>
```

The `STATUS` column should show `SecretSynced`. ESO will re-fetch the secret from the source cluster at the `refreshInterval` you specified, keeping the workload cluster's copy up to date automatically.

## Conclusion

You've configured External Secrets Operator to sync secrets between Kubernetes clusters over Tailscale's private network. Secrets are fetched directly from the source cluster's API server through an encrypted mesh connection, with no intermediate storage or internet exposure.

This configuration provides several key benefits:

* **No secrets in Git**: Credentials are synced at runtime from the source of truth, not committed to repositories.
* **Automatic rotation**: ESO re-fetches secrets on a configurable interval, picking up rotations without manual intervention.
* **Private connectivity**: The source cluster's API server is never exposed to the internet. All traffic flows through Tailscale's encrypted network.
* **Fine-grained access**: Tailscale impersonation and Kubernetes RBAC work together to grant ESO exactly the permissions it needs and nothing more.
* **Scalable**: Adding a new workload cluster requires only a new egress service and `ClusterSecretStore`. No changes are needed on the source cluster.

For advanced configurations, explore [customizing the Tailscale Kubernetes Operator][docs-operator-customization] or refer to the [External Secrets Operator documentation][xt-external-secrets] for additional providers and secret store types.

[docs-access-control]: /docs/features/access-control/acls

[docs-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities#tailscale-kubernetes-operator

[docs-dns-nameserver]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-grants]: /docs/features/access-control/grants

[docs-magicdns]: /docs/features/magicdns

[docs-operator-customization]: /docs/kubernetes-operator/reference/tags

[docs-operator-install]: /docs/kubernetes

[docs-operator-oauth]: /docs/kubernetes-operator/install-operator#configure-tags-and-oauth-credentials

[docs-proxy-group]: /docs/kubernetes-operator/concepts/proxygroup

[xt-eso-kubernetes-provider]: https://external-secrets.io/latest/provider/kubernetes/

[xt-external-secrets]: https://external-secrets.io/

[xt-k8s-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
