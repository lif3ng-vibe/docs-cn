---
title: "Tag customization for the Tailscale Kubernetes Operator"
description: "The Tailscale Kubernetes Operator uses [tags][docs-tags] to identify and control access to the devices it manages. Tags control which tailnet identities can reach operator-managed devices, and which d"
---

Last validated Jun 5, 2026

The Tailscale Kubernetes Operator uses [tags][docs-tags] to identify and control access to the devices it manages. Tags control which tailnet identities can reach operator-managed devices, and which devices can advertise Tailscale Services.

The operator uses two default tags:

* **`tag:k8s-operator`**: Applied to the operator device itself.
* **`tag:k8s`**: Applied to all proxy devices the operator creates (ingress proxies, egress proxies, connectors, and ProxyGroup replicas).

## Default tags

You configure default tags during [operator installation][docs-install-operator] using [Helm][xt-helm] values:

* **`operatorConfig.defaultTags`**: Tags for the operator device. Defaults to `tag:k8s-operator`.
* **`proxyConfig.defaultTags`**: Tags for all proxy devices the operator creates. Defaults to `tag:k8s`.

To set custom defaults during installation:

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --set-json 'operatorConfig.defaultTags=["tag:k8s-operator"]' \
  --set-json 'proxyConfig.defaultTags=["tag:k8s","tag:prod"]'
```

## Tag ownership

The operator's tag must own the proxy tags in your tailnet policy file. Without this, the operator cannot create devices with those tags.

For the default tags, add the following to your tailnet policy file from the [Access controls](https://console.tailscale.com/admin/acls):

```json
"tagOwners": {
  "tag:k8s-operator": [],
  "tag:k8s": ["tag:k8s-operator"]
}
```

This configuration makes `tag:k8s-operator` owned by tailnet admins, and lets devices tagged as `tag:k8s-operator` (the operator) create devices tagged `tag:k8s`.

If you use custom tags, the operator's tag must also own those tags. For example, if you tag proxies with `tag:prod`:

```json
"tagOwners": {
  "tag:k8s-operator": [],
  "tag:k8s": ["tag:k8s-operator"],
  "tag:prod": ["tag:k8s-operator"]
}
```

## Customize tags per resource

You can override default proxy tags on individual resources.

### Connector

Set tags in the `Connector` spec:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Connector
metadata:
  name: my-connector
spec:
  tags:
    - "tag:k8s"
    - "tag:subnet-prod"
  subnetRouter:
    advertiseRoutes:
      - "10.40.0.0/14"
```

### ProxyGroup

Set tags in the `ProxyGroup` spec:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-proxy-group
spec:
  tags:
    - "tag:k8s"
    - "tag:eu-cluster"
```

### Service or Ingress (standalone proxies)

Use the `tailscale.com/tags` annotation:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    tailscale.com/expose: "true"
    tailscale.com/tags: "tag:k8s,tag:monitoring"
spec:
  selector:
    app: my-app
  ports:
    - port: 80
```

As with all custom tags, the operator's tag must be a `tagOwner` of these tags. Refer to [tag ownership][ar-tag-ownership] for details.

## Tags in access control

Tags are the primary mechanism for controlling access to operator-managed devices. Use tags in your tailnet policy file to:

* **Grant access with ACLs or grants**: Lets specific tailnet identities reach devices with a given tag. Refer to [grants][docs-grants] and [ACLs][docs-acls].
* **Approve Tailscale Service advertisers**: Use [`autoApprovers`][docs-auto-approvers] to permit ProxyGroup devices to advertise Tailscale Services. Refer to [permissions and RBAC][docs-rbac] for examples.

## Tags and the API server proxy

When a tagged device connects to the [API server proxy][docs-auth-rbac], the proxy impersonates the request using the device's tags as Kubernetes groups. For example, a device tagged `tag:ci-runner` is impersonated with the Kubernetes group `tag:ci-runner`. You can bind these groups to Kubernetes roles using standard RBAC.

If [grants][docs-grants] define additional Kubernetes groups for the device, those take precedence over tag-based groups.

## Limitations

* The operator applies tags only during initial device provisioning. If you modify the `tailscale.com/tags` annotation on an already-exposed `Service`, the tags do not update until you recreate the `Service`.
* `Connector` tags cannot be changed after the connector device is created.

For a full list, refer to [limitations][docs-limitations].

## Next steps

* [Install the operator][docs-install-operator] for configuring default tags.
* Use [permissions and RBAC][docs-rbac] for tag-based access control examples.
* Use [auth and RBAC for the API server proxy][docs-auth-rbac] for tag-based impersonation.
* Refer to [Tags][docs-tags] for more general information about using Tailscale tags.

[ar-tag-ownership]: #tag-ownership

[docs-acls]: /docs/features/access-control/acls

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-auto-approvers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-grants]: /docs/features/access-control/grants

[docs-install-operator]: /docs/kubernetes-operator/install-operator

[docs-limitations]: /docs/kubernetes-operator/reference/limitations

[docs-rbac]: /docs/kubernetes-operator/reference/rbac

[docs-tags]: /docs/features/tags

[xt-helm]: https://helm.sh/
