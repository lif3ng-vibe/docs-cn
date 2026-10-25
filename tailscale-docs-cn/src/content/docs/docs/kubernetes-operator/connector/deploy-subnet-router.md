---
title: "在 Kubernetes 上部署出口节点和子网路由器"
description: "Tailscale Kubernetes Operator 安装包含 Connector [自定义资源定义][xt-k8s-custom-resources]。你可以使用 Connector 配置 operator，让它部署一台充当[出口节点][docs-exit-nodes]、子网路由器或两者兼是的设备"
---

最后验证于 Jun 5, 2026

Tailscale Kubernetes Operator 安装包含 Connector [自定义资源定义][xt-k8s-custom-resources]。你可以使用 Connector 配置 operator，让它部署一台充当[出口节点][docs-exit-nodes]、子网路由器或两者兼是的设备。

例如，你可以部署一个充当子网路由器的 Connector，向外界暴露集群 Service CIDR，或从集群内可达但不对外公开的云服务 CIDR。

## 前提条件

部署 Connector 之前，请完成以下操作：

* [安装][docs-operator-setup] Tailscale Kubernetes Operator。

## 部署出口节点或子网路由器

要创建一个向 tailnet 暴露 `10.40.0.0/14` CIDR 的 Connector：

1. （可选）将 Connector 节点的[标签][docs-tags]设为[自动审批][docs-acls-autoapprovers]。默认情况下，设备会被打上 `tag:k8s` 标签。你可以通过 `.connector.spec.tags` 设置自定义标签。如果设置了自定义标签，请确保 operator 是该标签的[所有者][docs-acls-tag-owners]之一。

2. 创建 Connector 自定义资源：

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

3. 验证资源创建：

   ```shell
   kubectl get connector ts-pod-cidrs
   NAME           SUBNETROUTES                ISEXITNODE   STATUS
   ts-pod-cidrs   10.40.0.0/14          false        ConnectorCreated
   ```

4. （可选）如果你没有配置自动审批，请打开[机器](https://console.tailscale.com/admin/machines)页面，手动批准新建的 `ts-pod-cidrs` 设备通告 `10.40.0.0/14` 路由。

5. （可选）需要访问子网内资源的 Linux 客户端必须[接受通告的路由][docs-subnets-use-routes]。

## 通告 4via6 路由

如果你的网络中存在重叠的 IPv4 子网，可以使用 Connector 通告 [4via6 子网路由][docs-4via6]。使用 Tailscale CLI 生成 IPv6 路由：

```shell
tailscale debug via 7 10.1.1.0/24
# 输出：fd7a:115c:a1e0:b1a:0:7:a01:100/120
```

然后在 Connector 清单中使用生成的路由：

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

## 自定义

有关自定义 operator 及其管理的资源的详细信息，请参阅 [Kubernetes Operator 自定义][docs-operator-customization]。你可以在 [GitHub 上][xt-gh-tailscale-k8s-connector]找到所有可用的 Connector 配置选项。

## 故障排查

有关故障排查信息，请参阅 [Tailscale Kubernetes Operator 故障排查][docs-operator-troubleshooting]。

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
