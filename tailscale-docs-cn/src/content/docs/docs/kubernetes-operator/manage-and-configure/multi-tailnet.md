---
title: "Use multiple tailnets for devices running on Kubernetes"
description: "When deploying the Tailscale Kubernetes Operator's [custom resources][xt-kubernetes-crd], you may want workloads to communicate across clusters and across tailnets. In Tailscale v1.96 and later, you c"
---

Last validated Jun 5, 2026

When deploying the Tailscale Kubernetes Operator's [custom resources][xt-kubernetes-crd], you may want workloads to communicate across clusters and across tailnets. In Tailscale v1.96 and later, you can use the `Tailnet` custom resource definition to specify which tailnet a `ProxyGroup`, `Connector`, or `Recorder` instance should use.

## Prerequisites

You need access to multiple tailnets, either through separate logins or managed by a single organization. For more information on managing multiple tailnets within a single organization, refer to [managing multiple tailnets][docs-multi-tailnet].

Each tailnet you want to expose requires the appropriate `tagOwners` set in your ACL policy file for the Tailscale Kubernetes Operator:

```json
"tagOwners": {
	"tag:k8s-operator": [],
	"tag:k8s": ["tag:k8s-operator"],
}
```

> **Note:**
>
> If you use different tags from the default `tag:k8s-operator`, use those in place of the example given
> above.

Each tailnet requires a `Secret` resource containing the client ID and secret from an [OAuth client][docs-oauth-clients] or a client ID and audience for [workload identity federation][docs-wif]. The operator uses these credentials to generate auth keys for workloads. Before creating a `Tailnet` resource, create an OAuth or OpenID Connect client in the [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) page of the admin console for the tailnet you want to provide access to. Create the client with `Devices Core`, `Auth Keys`, `Services` write scopes, and the tag `tag:k8s-operator`.

## Create a `Tailnet` resource

Each `Tailnet` resource references a set of OAuth credentials stored as a Kubernetes `Secret` within the same namespace as the operator.

Once you have the client ID and secret, create a `Secret` resource:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: example-tailnet
  namespace: tailscale
stringData:
  # OAuth Client
  client_id: "<CLIENT_ID>"
  client_secret: "<CLIENT_SECRET>"
  # Or WIF
  client_id: "<CLIENT_ID">
  audience: "<AUDIENCE>"
```

> **Note:**
>
> If you deployed the Tailscale Kubernetes Operator into a different namespace, use the name of that namespace instead of
> `tailscale`.

Next, create a `Tailnet` resource that references the secret containing the OAuth credentials:

```yaml
apiVersion: tailscale.com/v1alpha
kind: Tailnet
metadata:
  name: example-tailnet
spec:
  credentials:
    secretName: example-tailnet
```

> **Note:**
>
> `Tailnet` resources are cluster-scoped and do not require a value in the `namespace` field.

Once deployed, the operator checks that the specified credentials exist and have access to the Tailscale API. If successful, the `Tailnet` resource transitions into the `TailnetReady` state and can be used by other resources. Use the `kubectl get tailnet` command to view the status of your tailnet.

## Configure resources to use a specific tailnet

Once you have one or more `Tailnet` resources in your cluster, you can create `ProxyGroup`, `Connector`, and `Recorder` resources that connect to that tailnet using the `spec.tailnet` field. This field is immutable, with a blank tailnet denoting that the resource should use the tailnet that the operator was originally configured with.

The following examples show how to configure these resources to use a specific tailnet.

A `Connector` resource using a specific tailnet:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Connector
metadata:
	name: example-connector
spec:
	replicas: 3
	tailnet: example-tailnet
	exitNode: true
```

For more information on `Connector` resources, refer to [create exit nodes and subnet routers on Kubernetes][docs-k8s-connector].

A `Recorder` resource using a specific tailnet:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Recorder
metadata:
	name: example-recorder
spec:
	replicas: 3
	tailnet: example-tailnet
	storage: {}
```

For more information on `Recorder` resources, refer to [session recording][docs-k8s-session-recording].

A `ProxyGroup` resource using a specific tailnet:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
	name: example-proxygroup
spec:
	replicas: 3
	tailnet: example-tailnet
	type: kube-apiserver
```

For more information on `ProxyGroup` resources, refer to the [ingress][docs-k8s-ingress] or [egress][docs-k8s-egress] documentation.

Once started and ready, your devices appear across your tailnets in the respective [Machines](https://console.tailscale.com/admin/machines) pages.

[docs-k8s-connector]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-k8s-egress]: /docs/kubernetes-operator/egress

[docs-k8s-ingress]: /docs/kubernetes-operator/ingress

[docs-k8s-session-recording]: /docs/kubernetes-operator/recorder

[docs-multi-tailnet]: /docs/features/multiple-tailnets

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-wif]: /docs/features/workload-identity-federation

[xt-kubernetes-crd]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources
