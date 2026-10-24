---
title: "Use the API server proxy without Tailscale authentication"
description: "In noauth mode, the API server proxy forwards requests to the Kubernetes API server without adding any authentication or impersonation headers. This is useful when Tailscale provides secure connectivi"
---

Last validated Jun 5, 2026

In noauth mode, the API server proxy forwards requests to the Kubernetes API server without adding any authentication or impersonation headers. This is useful when Tailscale provides secure connectivity to the API server and authentication is handled through another mechanism.

## When to use noauth mode

Noauth mode is designed for environments where authentication is handled externally, such as:

* **Managed Kubernetes with cloud IAM**: Cloud providers have their own authentication mechanisms (for example, IAM roles, OIDC tokens). In these environments, Tailscale provides private connectivity to the API server, while the cloud provider's authentication stays in place.
* **External authenticating proxy**: If you already run an [authenticating proxy][xt-k8s-auth-proxy] in front of the API server, noauth mode avoids conflicting with it.

## Prerequisites

Before you begin, complete the following:

* [Install][docs-k8s-install] the Tailscale Kubernetes Operator.
* [Enable HTTPS][docs-enabling-https] for your tailnet.
* Ensure your [access control policies][docs-acls] permit devices to access the proxy on port `443` over TCP.

## Install the in-process proxy in noauth mode

You can install the proxy using Helm or static manifests.

### Helm

Run the following command to install the operator with the API server proxy in noauth mode:

```shell
helm upgrade \
  --install \
  tailscale-operator \
  tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<oauth-client-id> \
  --set-string oauth.clientSecret=<oauth-client-secret> \
  --set-string apiServerProxyConfig.mode="noauth" \
  --wait
```

### Static manifests

Set the `APISERVER_PROXY` environment variable in the operator deployment:

```yaml
name: APISERVER_PROXY
value: "noauth"
```

## Deploy with ProxyGroup in noauth mode

You can also deploy a noauth proxy as a [`ProxyGroup`][docs-proxygroup] for high availability. Set `spec.kubeAPIServer.mode` to `noauth`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-cluster
spec:
  type: kube-apiserver
  replicas: 2
  kubeAPIServer:
    mode: noauth
```

For more information about configuration details, refer to [High availability for the Tailscale Kubernetes Operator][docs-ha].

## Authentication and authorization

In noauth mode, the proxy exposes the Kubernetes API server at `<proxy-hostname>:443` without modifying requests. You are responsible for configuring authentication through your existing mechanism.

For example, with GCP GKE, you can generate your kubeconfig using the `gcloud` CLI as normal, then update the `server` field to point at the proxy's MagicDNS FQDN. The existing `gcloud` auth plugin continues to handle authentication, while Tailscale provides the private network path to the API server.

The same approach works with AWS EKS (using `aws-iam-authenticator` or `aws eks get-token`) and Azure AKS. In each case, Tailscale replaces the need for a public API endpoint or a VPN to the VPC.

> **Note:**
>
> Some Kubernetes distributions (for example, k3s) use client certificates for authentication by default. The proxy does not forward client certificates in noauth mode. If your distribution does not have an external authentication mechanism such as a cloud IAM plugin, use [auth mode][docs-auth-mode] instead.

## Configure kubeconfig

Because noauth mode relies on your existing authentication mechanism, start from the kubeconfig your cloud provider generates. This preserves your auth plugin configuration.

For example, with GKE, generate your kubeconfig as normal:

```shell
gcloud container clusters get-credentials my-cluster --region us-central1
```

Then modify the cluster entry to point at the proxy. Change the `server` to the proxy's full MagicDNS FQDN, and remove `certificate-authority-data` (the proxy's Let's Encrypt cert is already trusted by your system):

```yaml
clusters:
  - cluster:
      server: https://tailscale-operator.<tailnet>.ts.net:443
      # Remove certificate-authority-data
    name: my-cluster
users:
  - name: my-cluster-user
    user:
      exec:
        command: gke-gcloud-auth-plugin  # unchanged
        ...
```

TLS certificates are issued for the full FQDN (for example, `tailscale-operator.<tailnet>.ts.net`), not the short hostname. Your cloud provider's auth plugin remains unchanged.

> **Warning:**
>
> No Kubernetes RBAC configuration is needed for the proxy itself in noauth mode. However, you still need to ensure that requests reaching the API server are authenticated by whatever mechanism you are using. For example, cloud provider IAM, an authenticating proxy, or client certificates.

## Further exploration

* [Access][docs-access-api] the Kubernetes API over Tailscale using auth mode.
* [Configure][docs-auth-rbac] authentication and authorization.

[docs-access-api]: /docs/kubernetes-operator/api-server-access/setup-api-over-tailscale

[docs-auth-mode]: /docs/kubernetes-operator/api-server-access#auth-mode-default

[docs-acls]: /docs/features/access-control/acls

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[xt-k8s-auth-proxy]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#authenticating-proxy
