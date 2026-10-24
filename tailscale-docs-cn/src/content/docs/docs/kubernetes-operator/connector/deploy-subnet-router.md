---
title: "Deploy exit nodes and subnet routers on Kubernetes"
description: "The Tailscale Kubernetes Operator installation includes a Connector [Custom Resource Definition][xt-k8s-custom-resources]. You can use the Connector to configure the operator to deploy a device that a"
---

Last validated Jun 5, 2026

The Tailscale Kubernetes Operator installation includes a Connector [Custom Resource Definition][xt-k8s-custom-resources]. You can use the Connector to configure the operator to deploy a device that acts as an [exit node][docs-exit-nodes], a subnet router, or both.

For example, you can deploy a Connector that acts as a subnet router and exposes cluster Service CIDRs or cloud service CIDRs that are available from the cluster but not publicly accessible.

## Prerequisites

Complete the following before deploying a Connector:

* [Install][docs-operator-setup] the Tailscale Kubernetes Operator.

## Deploy an exit node or subnet router

To create a Connector that exposes the `10.40.0.0/14` CIDR to your tailnet:

1. (Optional) Set the [tag][docs-tags] of the Connector node to be [automatically approved][docs-acls-autoapprovers]. By default, the device is tagged with `tag:k8s`. You can set custom tags using `.connector.spec.tags`. If you set a custom tag, ensure the operator is an [owner][docs-acls-tag-owners] of this tag.

2. Create a Connector custom resource:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: Connector
   metadata:
     name: ts-pod-cidrs
   spec:
     replicas: 1
     hostnamePrefix: ts-pod-cidrs
     subnetRouter:
       advertiseRoutes:
         - "10.40.0.0/14"
   ```

3. Verify resource creation:

   ```shell
   kubectl get connector ts-pod-cidrs
   NAME           SUBNETROUTES                ISEXITNODE   STATUS
   ts-pod-cidrs   10.40.0.0/14          false        ConnectorCreated
   ```

4. (Optional) If you did not configure automatic approval, open [Machines](https://console.tailscale.com/admin/machines) and manually approve the newly created `ts-pod-cidrs` device to advertise the `10.40.0.0/14` route.

5. (Optional) Linux clients needing to access resources in the subnet must [accept the advertised route][docs-subnets-use-routes].

## Advertise a 4via6 route

If your network has overlapping IPv4 subnets, you can use a Connector to advertise [4via6 subnet routes][docs-4via6]. Generate the IPv6 route using the Tailscale CLI:

```shell
tailscale debug via 7 10.1.1.0/24
# Output: fd7a:115c:a1e0:b1a:0:7:a01:100/120
```

Then use the generated route in the Connector manifest:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Connector
metadata:
  name: ts-4via6-site7
spec:
  hostnamePrefix: ts-4via6-site7
  subnetRouter:
    advertiseRoutes:
      - "fd7a:115c:a1e0:b1a:0:7:a01:100/120"
```

## Customization

For details on customizing the operator and the resources it manages, refer to [Kubernetes Operator customization][docs-operator-customization]. You can find all available Connector configuration options [on GitHub][xt-gh-tailscale-k8s-connector].

## Troubleshooting

For troubleshooting information, refer to [Troubleshooting the Tailscale Kubernetes Operator][docs-operator-troubleshooting].

[docs-4via6]: /docs/features/subnet-routers/4via6-subnets

[docs-acls-autoapprovers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-acls-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-operator-customization]: /docs/kubernetes-operator/concepts/proxyclass

[docs-operator-setup]: /docs/kubernetes-operator/install-operator

[docs-operator-troubleshooting]: /docs/kubernetes-operator/reference/troubleshooting

[docs-subnets-use-routes]: /docs/features/subnet-routers#use-your-subnet-routes-from-other-devices

[docs-tags]: /docs/features/tags

[xt-gh-tailscale-k8s-connector]: https://github.com/tailscale/tailscale/blob/main/k8s-operator/api.md#connector

[xt-k8s-custom-resources]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources
