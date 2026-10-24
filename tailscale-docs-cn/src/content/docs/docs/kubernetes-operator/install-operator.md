---
title: "Install the Tailscale Kubernetes Operator"
description: "Install the Tailscale Kubernetes Operator in your Kubernetes cluster."
---

Last validated Jun 5, 2026

This guide explains setting up the Tailscale Kubernetes Operator in your cluster. You will configure access control tags, create OAuth credentials, and install the operator using Helm or static manifests.

If you prefer not to use OAuth credentials, you can instead [install the operator using workload identity federation][docs-k8s-workload-identity].

## Prerequisites

For known compatibility issues, refer to our [compatibility guide][docs-k8s-compatibility].

Before you begin, ensure you have the following:

* A Kubernetes cluster.
* Access to the [Access controls](https://console.tailscale.com/admin/acls/file) and [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) pages of the admin console.
* Familiarity with [tags][docs-tags] and [OAuth client credentials][docs-oauth-clients].

## Configure tags and OAuth credentials

Before installing the operator, you need to create tags and an OAuth client for the operator to use.

1. In your [Access controls](https://console.tailscale.com/admin/acls/file), add the following under the `tagOwners` section:

   ```json
   "tagOwners": {
     "tag:k8s-operator": [],
     "tag:k8s": ["tag:k8s-operator"],
   }
   ```

   This will:

   * Create the [tags][docs-tags] `tag:k8s-operator` and `tag:k8s`.
   * Make `tag:k8s-operator` an owner of `tag:k8s` (so the operator can manage devices with `tag:k8s`).

   \[Missing snippet: visual\_policy\_editor.mdx]

2. [Create an OAuth client][docs-oauth-clients-setup] in the [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) page of the admin console. Create the client with `write` scope for:

   * `General/Services` (with `tag:k8s-operator`)
   * `Devices/Core` (with `tag:k8s-operator`)
   * `Keys/Auth Keys` (with `tag:k8s-operator`)

The operator uses these credentials to manage devices via the [Tailscale API][docs-api] and to create [auth keys][docs-auth-keys] for itself and the devices it manages.

## Install the operator

A default operator installation creates:

* A `"tailscale"` `Namespace`.
* An `"operator"` `Deployment`.
* Role-based access control (RBAC) for the operator.
* A `"tailscale"` `IngressClass`.
* `ProxyClass`, `Connector`, `ProxyGroup`, `DNSConfig`, `Recorder`, `Tailnet` custom resource definitions (CRDs).

There are two ways to install the Tailscale Kubernetes Operator:

* Using [Helm][ar-helm].
* Applying [static manifests with `kubectl`][ar-static-manifests].

### Install using Helm

The Tailscale Kubernetes Operator's Helm charts are available from two chart repositories:

* The `https://pkgs.tailscale.com/helmcharts` repository contains well-tested charts for [stable Tailscale versions][docs-versions].
* The `https://pkgs.tailscale.com/unstable/helmcharts` repository contains charts with the very latest changes, published in between official releases.

The charts in both repositories are different versions of the same chart and you can upgrade from one to the other.

> **Note:**
>
> Helm charts and container images for a new stable Tailscale version are released a few days after the official release.

To install the latest Kubernetes Tailscale operator from `https://pkgs.tailscale.com/helmcharts` in the `tailscale` namespace:

1. Add `https://pkgs.tailscale.com/helmcharts` to your local Helm repositories:

   ```shell
   helm repo add tailscale https://pkgs.tailscale.com/helmcharts
   ```

2. Update your local Helm cache:

   ```shell
   helm repo update
   ```

3. Install the operator, passing in the OAuth client credentials that you created earlier:

   ```shell
   helm upgrade \
     --install \
     tailscale-operator \
     tailscale/tailscale-operator \
     --namespace=tailscale \
     --create-namespace \
     --set-string oauth.clientId="<OAuth client ID>" \
     --set-string oauth.clientSecret="<OAuth client secret>" \
     --wait
   ```

4. [Validate][ar-validation] that the operator has successfully joined your tailnet.

### Install using static manifests with kubectl

1. Download the Tailscale Kubernetes Operator [manifest file][xt-gh-tailscale-k8s-operator] from the [`tailscale/tailscale`][xt-gh-tailscale-repo] repository.

2. Edit your version of the manifest file:

   * Find `# SET CLIENT ID HERE` and replace it with your OAuth client ID.
   * Find `# SET CLIENT SECRET HERE` and replace it with your OAuth client secret. The OAuth client secret is case-sensitive.

   For both the client ID and secret, quote the value to avoid any potential YAML misinterpretation of unquoted strings. For example, use:

   ```yaml
   client_id: "k123456CNTRL"
   client_secret: "tskey-client-k123456CNTRL-abcdef"
   ```

3. Apply the edited file to your Kubernetes cluster:

   ```shell
   kubectl apply -f operator.yaml
   ```

4. [Validate][ar-validation] that the operator has successfully joined your tailnet.

## Validation

To verify that the Tailscale operator has joined your tailnet, open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and look for a node named `tailscale-operator` (or your customized hostname) tagged with the `tag:k8s-operator` tag.

It may take some time for the operator to join your tailnet as the container image downloads and the Pod starts.

## Further exploration

* Follow a step-by-step introduction to the operator in the [hands-on walk through][docs-k8s-walkthrough].
* [Access][docs-k8s-api-access] the Kubernetes API over Tailscale.
* [Expose][docs-k8s-ingress] a cluster workload to your tailnet.
* [Access][docs-k8s-egress] a tailnet node or service from Kubernetes.
* Configure [multi-cluster ingress][docs-k8s-multi-cluster-ingress].
* Enable [kubectl session recording][docs-k8s-session-recording].
* [Host][docs-k8s-host-resources] Tailscale resources in Kubernetes.
* [Configure][docs-operator-customization] advanced operator settings.
* [Troubleshoot][docs-operator-troubleshooting] deployment and connectivity issues.

[ar-helm]: #install-using-helm

[ar-static-manifests]: #install-using-static-manifests-with-kubectl

[ar-validation]: #validation

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-k8s-api-access]: /docs/kubernetes-operator/api-server-access/setup-api-over-tailscale

[docs-k8s-compatibility]: /docs/kubernetes-operator/reference/compatibility

[docs-k8s-egress]: /docs/kubernetes-operator/egress

[docs-k8s-host-resources]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-k8s-ingress]: /docs/kubernetes-operator/ingress

[docs-k8s-multi-cluster-ingress]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-k8s-session-recording]: /docs/kubernetes-operator/recorder

[docs-k8s-workload-identity]: /docs/kubernetes-operator/manage-and-configure/workload-identity-federation

[docs-k8s-walkthrough]: /docs/kubernetes-operator/quickstart

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-oauth-clients-setup]: /docs/features/oauth-clients#setting-up-an-oauth-client

[docs-operator-customization]: /docs/kubernetes-operator/concepts/proxyclass

[docs-operator-troubleshooting]: /docs/kubernetes-operator/reference/troubleshooting

[docs-tags]: /docs/features/tags

[docs-versions]: /docs/reference/tailscale-client-versions

[xt-gh-tailscale-k8s-operator]: https://github.com/tailscale/tailscale/blob/main/cmd/k8s-operator/deploy/manifests/operator.yaml

[xt-gh-tailscale-repo]: https://github.com/tailscale/tailscale
