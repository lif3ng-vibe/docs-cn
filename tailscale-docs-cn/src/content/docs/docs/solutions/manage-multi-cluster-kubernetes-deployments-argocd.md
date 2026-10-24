---
title: "Manage multi-cluster Kubernetes deployments with ArgoCD"
description: "Set up secure multi-cluster Kubernetes management with ArgoCD using Tailscale's private network to connect clusters across regions without complex networking."
---

Last validated Jan 5, 2026

## Introduction

Managing Kubernetes deployments across multiple clusters is a common challenge for DevOps teams scaling their infrastructure. Whether you're running clusters in different regions for redundancy, separating development and production environments, or managing edge deployments, [ArgoCD][xt-argocd] provides powerful multi-cluster GitOps capabilities. However, connecting ArgoCD to remote clusters typically requires complex networking setup, VPN configurations, or exposing Kubernetes API servers to the internet.

This guide shows you how to solve this problem using Tailscale's private network. You'll configure the Tailscale Kubernetes Operator to securely expose Kubernetes API servers across multiple clusters, enabling ArgoCD to manage deployments without the complexity of traditional networking approaches. By the end of this guide, you'll have a secure, scalable multi-cluster setup that eliminates the need for complex firewall rules or VPN infrastructure.

You'll accomplish this by installing the Tailscale Kubernetes Operator in each cluster, configuring secure API server proxies, and setting up ArgoCD to communicate with remote clusters through Tailscale's encrypted mesh network. This approach provides better security than exposing API servers publicly while being significantly easier to manage than traditional VPN solutions.

*（图：Architecture diagram showing ArgoCD in a control cluster connecting to multiple Kubernetes clusters through Tailscale's private network. Each cluster has a Tailscale operator with API server proxy enabled, enabling secure communication across the tailnet.）*

## Prerequisites

* Multiple Kubernetes clusters (development, staging, production, or regional clusters)
* A [Tailscale account](https://login.tailscale.com/start) with [Admin](/docs/reference/user-roles) access
* The Tailscale Kubernetes Operator [installed in each cluster][docs-operator-install]
* ArgoCD installed in your control cluster (the cluster from which you'll manage deployments)
* [OAuth credentials configured][docs-operator-install] for the Tailscale Kubernetes Operator

## Install the Tailscale Kubernetes Operator with API server proxy

The first step is to install the Tailscale Kubernetes Operator in each cluster with API server proxy capabilities enabled. This creates a secure tunnel that lets ArgoCD communicate with remote Kubernetes API servers through Tailscale's private network.

You'll need to install the operator in each cluster you plan to manage, including the cluster where ArgoCD is running. Each installation requires a unique hostname to distinguish between clusters in your Tailscale network (known as a tailnet).

Use the following [Helm][xt-helm] command to install the Tailscale Kubernetes Operator in your first cluster:

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<YOUR_OAUTH_CLIENT_ID> \
  --set-string oauth.clientSecret=<YOUR_OAUTH_CLIENT_SECRET> \
  --set operatorConfig.hostname=cluster1-k8s-operator \
  --set apiServerProxyConfig.mode=true \
  --wait
```

The key configuration options for multi-cluster management are:

* `operatorConfig.hostname`: Creates a unique identifier for this cluster in your tailnet (for example, `cluster1-k8s-operator`, `staging-k8s-operator`, or `prod-k8s-operator`).
* `apiServerProxyConfig.mode=true`: Enables the Kubernetes API server proxy, enabling secure remote access to the cluster's API server.

Repeat this installation for each cluster you plan to manage, ensuring each has a unique hostname:

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<YOUR_OAUTH_CLIENT_ID> \
  --set-string oauth.clientSecret=<YOUR_OAUTH_CLIENT_SECRET> \
  --set operatorConfig.hostname=cluster2-k8s-operator \
  --set apiServerProxyConfig.mode=true \
  --wait
```

This installation creates a secure entry point for each cluster that ArgoCD can use to deploy and manage applications across your infrastructure.

## Configure secure access with access control policies

After installing the Tailscale Kubernetes Operator on each cluster, you need to configure Tailscale [access control policies][docs-access-control] to enable secure communication between your ArgoCD cluster and the remote Kubernetes API servers. This step ensures that only authorized components can access your clusters while maintaining the security of your infrastructure.

Without configuring access control policies through the tailnet policy file, Tailscale's default security model blocks communication between clusters, preventing ArgoCD from managing remote deployments.
The recommended best practice is to use [grants][docs-grants] for access control policies. The following grants provide fine-grained control over which services can access which clusters.

Add the following grants policy to your tailnet policy file. You can update the tailnet policy file from the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console:

> **Note:**
>
> This grants policy uses [application capabilities][docs-app-capabilities] to provide fine-grained access control to Kubernetes clusters.

```json
{
  "grants": [
    {
      "src": ["autogroup:admin", "tag:k8s"],
      "dst": ["tag:k8s-operator"],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "impersonate": {
              "groups": ["system:masters"]
            }
          }
        ]
      }
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This tailnet policy file snippet provides:

* `"src"`: Defines who can access the Kubernetes API servers. `autogroup:admin` lets Tailscale [Admin](/docs/reference/user-roles) users, while `tag:k8s` lets any device [tagged][docs-tags] with `k8s` (typically your ArgoCD cluster).
* `"dst"`: Specifies which operators the source (`src`) can access (your API server proxies).
* `"impersonate"`: Grants administrative access to the Kubernetes clusters, enabling ArgoCD to deploy applications and manage resources.

The `system:masters` group provides full administrative access to the Kubernetes clusters, which ArgoCD needs to manage deployments, create namespaces, and perform other administrative tasks.

## Set up DNS resolution for MagicDNS

To enable your ArgoCD cluster to resolve [Tailscale hostnames][docs-tailnet-names] (such as `cluster1-k8s-operator.tailnet.ts.net`), you need to configure DNS resolution for [MagicDNS][docs-magicdns].

> **Warning:**
>
> This step is required because ArgoCD needs to resolve the Tailscale hostnames to connect to remote clusters. Without correct DNS setup, ArgoCD won't connect to remote clusters because it cannot resolve the `.ts.net` domain names used by Tailscale for its private network.

Create a DNS configuration resource in your ArgoCD cluster:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: DNSConfig
metadata:
  name: ts-dns
spec:
  nameserver:
    image:
      repo: tailscale/k8s-nameserver
      tag: unstable
```

Apply this configuration to your cluster using the [`kubectl` command line tool][xt-k8s-kubectl]:

```shell
kubectl apply -f dns-config.yaml
```

Get the IP address of the Tailscale nameserver. This [stub DNS resolver][docs-dns-nameserver] is automatically deployed by the Tailscale Kubernetes Operator and provides DNS resolution for `.ts.net` domains within your cluster:

```shell
kubectl get dnsconfig ts-dns -o jsonpath='{.status.nameserverStatus.ip}'
```

Make a note of the IP address returned (for example, `100.64.0.4` or `10.100.124.196`). You'll use this IP address to configure CoreDNS.

Update your CoreDNS configuration to forward Tailscale DNS queries to the Tailscale nameserver:

```shell
kubectl edit configmap coredns -n kube-system
```

Add the following block to the `Corefile` section, replacing `<TAILSCALE_NAMESERVER_IP>` with the IP address you noted:

```yaml
ts.net:53 {
    errors
    cache 30
    forward . <TAILSCALE_NAMESERVER_IP>
}
```

This configuration ensures that your ArgoCD cluster can resolve Tailscale hostnames and establish secure connections to remote clusters.

## Create egress services for remote clusters

In your ArgoCD cluster, you need to create Kubernetes services that point to the Tailscale hostnames of your remote clusters. These services act as connection points that ArgoCD can use to communicate with remote Kubernetes API servers.

These egress services use [Tailscale's service discovery][docs-services] capabilities to route traffic to the correct cluster through the tailnet automatically.

Create a service for each remote cluster you plan to manage. Here's an example for two clusters:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cluster1-k8s-operator
  annotations:
    tailscale.com/tailnet-fqdn: cluster1-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
spec:
  externalName: placeholder
  type: ExternalName
  ports:
  - name: https
    port: 443
    protocol: TCP
---
apiVersion: v1
kind: Service
metadata:
  name: cluster2-k8s-operator
  annotations:
    tailscale.com/tailnet-fqdn: cluster2-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
spec:
  externalName: placeholder
  type: ExternalName
  ports:
  - name: https
    port: 443
    protocol: TCP
```

Replace `<YOUR_TAILNET_NAME>` with your tailnet's MagicDNS domain. For example, if your tailnet is `example.ts.net`, the fully qualified domain name ([FQDN][xt-wiki-fqdn]) would be `cluster1-k8s-operator.example.ts.net`.

Apply these services to your ArgoCD cluster:

```shell
kubectl apply -f cluster-services.yaml
```

The Tailscale Kubernetes Operator automatically updates these services to point to the correct IP addresses of your remote clusters, enabling seamless communication through your tailnet.

## Generate `kubeconfig` for remote clusters

ArgoCD needs [`kubeconfig` files][xt-k8s-kubeconfig] to authenticate with remote clusters. The [Tailscale CLI][docs-cli] provides a way to generate these configurations using the Tailscale hostnames you've set up.

Generate `kubeconfig` entries for each remote cluster:

```shell
tailscale configure kubeconfig cluster1-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
```

```shell
tailscale configure kubeconfig cluster2-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
```

These commands add cluster configurations to your local `kubeconfig` file, enabling `kubectl` and ArgoCD to authenticate with remote clusters through Tailscale's secure network.

The generated `kubeconfig` entries include the necessary certificates and authentication tokens that ArgoCD needs to manage deployments across clusters.

## Add clusters to ArgoCD

The final step is to register your remote clusters with ArgoCD so it can begin managing deployments across your infrastructure. ArgoCD uses the `kubeconfig` entries you generated to establish secure connections to each cluster.

Add each remote cluster to ArgoCD:

```shell
argocd cluster add cluster1-k8s-operator.<YOUR_TAILNET_NAME>.ts.net --grpc-web
```

```shell
argocd cluster add cluster2-k8s-operator.<YOUR_TAILNET_NAME>.ts.net --grpc-web
```

The `--grpc-web` flag ensures compatibility with ArgoCD's web interface and API server communication over the secure Tailscale network.

Verify that your clusters are successfully registered:

```shell
argocd cluster list
```

You should notice all your clusters listed with their Tailscale hostnames and connection status. ArgoCD can now deploy applications to any of these clusters using GitOps workflows.

## Conclusion

You've successfully configured a secure multi-cluster Kubernetes environment with ArgoCD using Tailscale's private network. Your setup now enables centralized GitOps management across multiple clusters without the complexity of traditional networking approaches.

This configuration provides several key benefits:

* **Enhanced security**: Kubernetes API servers are not exposed to the internet, reducing attack surface.
* **Simplified networking**: No need for complex VPN configurations or firewall rules.
* **Scalable architecture**: Easy to add new clusters by installing the operator with a unique hostname.
* **Unified management**: ArgoCD can deploy applications across all clusters from a single [control plane][docs-control-data-planes].

You can now create ArgoCD applications that target different clusters based on your deployment strategy. For example, you might deploy development applications to your development cluster and production applications to your production cluster, all managed through GitOps workflows.

For advanced configurations, explore [customizing the Tailscale Kubernetes Operator][docs-operator-customization] to fine-tune security policies or [troubleshooting common issues][docs-operator-troubleshooting] if you encounter connectivity problems.

[xt-argocd]: https://argo-cd.readthedocs.io/en/stable/

[xt-helm]: https://helm.sh/

[xt-k8s-kubectl]: https://kubernetes.io/docs/reference/kubectl/

[xt-wiki-fqdn]: https://en.wikipedia.org/wiki/Fully_qualified_domain_name

[xt-k8s-kubeconfig]: https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/

[docs-access-control]: /docs/features/access-control

[docs-app-capabilities]: /docs/integrations/identity/custom-oidc

[docs-cli]: /docs/reference/tailscale-cli

[docs-control-data-planes]: /docs/features/oauth-clients

[docs-dns-nameserver]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-grants]: /docs/features/access-control/grants

[docs-magicdns]: /docs/features/magicdns

[docs-operator-customization]: /docs/kubernetes-operator/concepts/proxyclass

[docs-operator-install]: /docs/kubernetes-operator/install-operator

[docs-operator-troubleshooting]: /docs/kubernetes-operator/reference/troubleshooting

[docs-services]: /docs/features/services

[docs-tags]: /docs/features/tags

[docs-tailnet-names]: /docs/features/magicdns#fully-qualified-domain-names-vs-machine-names
