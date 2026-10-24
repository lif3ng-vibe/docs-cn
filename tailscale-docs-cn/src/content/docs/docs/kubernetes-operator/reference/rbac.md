---
title: "Permissions and RBAC for the Tailscale Kubernetes Operator"
description: "Permissions for the Tailscale Kubernetes Operator come from two sources. The tailnet identity and access policies that govern traffic to and from the cluster, and Kubernetes role-based access control "
---

Last validated Aug 14, 2026

Permissions for the Tailscale Kubernetes Operator come from two sources. The tailnet identity and access policies that govern traffic to and from the cluster, and Kubernetes role-based access control (RBAC) and pod security settings that govern what the operator and its proxies can do inside the cluster.

## Ingress

Tailnet access to cluster workloads exposed through high-availability `ProxyGroup` proxies is controlled by Tailscale tags and the tailnet policy file.

By default, the `ProxyGroup` proxies are [tagged][docs-tags] with the tag `tag:k8s`. You can configure tags using the `.tags` field in the [`ProxyGroup` spec][xt-gh-tailscale-k8s-proxygroup]. You must ensure that the tag by which you tagged the [operator's OAuth client credentials][docs-kubernetes-operator-setup] is a [`tagOwner`][docs-tag-owners] of the `ProxyGroup` device tags.

> **Note:**
>
> Unlike with non-HA proxies, the proxy tags are not used to grant access to the cluster apps exposed using the proxies.

For each HA `Service` or `Ingress` exposed on a `ProxyGroup`, the Kubernetes operator creates a Tailscale Service. Each `ProxyGroup` proxy advertises the Tailscale Service, by configuring itself as a backend for the tailnet traffic for the Tailscale Service. The Tailscale IP address and DNS name given to the `Ingress` or `Service` are the IP addresses and DNS name of the Tailscale Service.

You can [tag][docs-tags] a Tailscale Service and use the tag to configure which tailnet devices can advertise the Service and which tailnet identities can access it. By default, the Kubernetes operator tags all Tailscale Services with the tag `tag:k8s`. You can configure Tailscale Service tags using the `tailscale.com/tags` annotation on the `Service` or `Ingress` resource.

### Ensure that `ProxyGroup` devices can advertise the Tailscale Service

To permit `ProxyGroup` devices to advertise a Tailscale Service, use the [`autoApprovers`][docs-auto-approvers] section of the tailnet policy file.

For example, to let `ProxyGroup` devices with the tag `tag:eu-cluster` advertise Tailscale Services with the tag `tag:monitoring`, add the following to your tailnet policy file:

```json
"autoApprovers": {
  "services": {
    "tag:monitoring": ["tag:eu-cluster"],
  },
}
```

### Configure access

Use grants in the tailnet policy file to control which tailnet identities can reach your Tailscale Services.

To grant access to a single Tailscale Service, use the Tailscale Service's `svc:` name as the destination. For example, to let the group `group:eng` reach `svc:monitoring`:

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["svc:monitoring"],
    "ip":  ["*"],
  },
]
```

To grant access to a group of Tailscale Services at once, target a tag that they share. A tag-based grant covers every current and future Tailscale Service that carries the tag, so you do not need to name each Service individually. For example, to let `group:eng` reach all Tailscale Services with the tag `tag:monitoring`:

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:monitoring"],
    "ip":  ["*"],
  },
]
```

By default, the Kubernetes operator tags both the `ProxyGroup` devices and the Tailscale Services they advertise with the same tag, `tag:k8s`. Because devices and Tailscale Services draw tags from the same namespace, a grant that targets that shared tag applies to both the devices and the Tailscale Services.

To control access to your Tailscale Services separately from the `ProxyGroup` devices, give the Tailscale Services a dedicated tag. Set the device tags in the `.tags` field of the [`ProxyGroup` spec][xt-gh-tailscale-k8s-proxygroup], and set a distinct Tailscale Service tag in the `tailscale.com/tags` annotation on the `Ingress` or `Service` resource:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: eu-cluster
spec:
  type: ingress
  tags:
    - tag:k8s-proxy # tags the ProxyGroup devices
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: monitoring
  annotations:
    tailscale.com/proxy-group: eu-cluster
    tailscale.com/tags: tag:monitoring # tags the Tailscale Service
# ...
```

The operator's OAuth client must be a [`tagOwner`][docs-tag-owners] of every tag you use.

## Customization

You can customize the Kubernetes security context of the proxy pods that the operator creates, including reducing their default privileges.

Pods for proxies created for [cluster ingress using `Service`][docs-operator-cluster-ingress-service], [cluster egress][docs-operator-cluster-egress], [`Connector`][docs-operator-connector], and [`ProxyGroup`][docs-proxy-group] contain a main `tailscale` container and an `init` container.

In Tailscale v1.78 and later, both containers run as [privileged containers][xt-kubernetes-security-context]. The main `tailscale` container requires privileged permissions to create a `/dev/net/tun` device. As an alternative, you can restrict the main container's permissions and delegate the device creation to a [Kubernetes device plugin][xt-kubernetes-device-plugin]:

1. Install the [generic device plugin][xt-gh-generic-device-plugin] to your cluster. Pass a `--device` flag that configures the plugin to create `/dev/net/tun` devices:

   ```shell
   --device='{"name": "tun", "groups": [{"paths": [{"path": "/dev/net/tun"}]}, "count": 1000]}'
   ```

2. Apply a `ProxyClass` that restricts the `tailscale` container's permissions to `NET_ADMIN` and `NET_RAW` capabilities, and tells the device plugin to create a `/dev/net/tun` device:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyClass
   metadata:
     name: tailscale-tun
   spec:
     statefulSet:
       pod:
         tailscaleContainer:
           resources:
             limits:
               squat.ai/tun: "1"
           securityContext:
             allowPrivilegeEscalation: false
             capabilities:
               drop:
                 - ALL
               add:
                 - NET_ADMIN
                 - NET_RAW
   ```

3. Ensure that the `ProxyClass` is applied to all proxies created for [Tailscale ingress `Service`s][docs-operator-cluster-ingress-service], [Tailscale egress `Service`s][docs-operator-cluster-egress], [`Connector`s][docs-operator-connector], and [`ProxyGroup`s][docs-proxy-group].

For detailed instructions and discussion, refer to [the device plugin proposal on GitHub][xt-gh-device-plugin-discussion].

[docs-auto-approvers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-kubernetes-operator-setup]: /docs/kubernetes-operator/install-operator#configure-tags-and-oauth-credentials

[docs-operator-cluster-egress]: /docs/kubernetes-operator/egress

[docs-operator-cluster-ingress-service]: /docs/kubernetes-operator/ingress#standalone-layer-3-ingress-for-tcpudp

[docs-operator-connector]: /docs/kubernetes-operator/connector

[docs-proxy-group]: /docs/kubernetes-operator/concepts/proxygroup

[docs-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-tags]: /docs/features/tags

[xt-gh-device-plugin-discussion]: https://github.com/tailscale/tailscale/issues/10814

[xt-gh-generic-device-plugin]: https://github.com/squat/generic-device-plugin

[xt-gh-tailscale-k8s-proxygroup]: https://github.com/tailscale/tailscale/blob/main/cmd/k8s-operator/deploy/crds/tailscale.com_proxygroups.yaml

[xt-kubernetes-device-plugin]: https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/

[xt-kubernetes-security-context]: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
