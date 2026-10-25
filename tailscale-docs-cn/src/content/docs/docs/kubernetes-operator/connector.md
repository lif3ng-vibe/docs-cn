---
title: "使用 Connector 在 Kubernetes 中承载 Tailscale 资源"
description: "使用 Connector 资源在 Kubernetes 上部署子网路由器和出口节点"
---

最后验证于 Jun 5, 2026

Connector 是 Tailscale Kubernetes Operator 提供的[自定义资源定义（CRD）][xt-crd]。它让你可以在集群内部署一个 Tailscale 设备，桥接你的 tailnet 与集群基础设施。

## Connector 的能力

Connector 资源让单个 Tailscale 设备可以承担以下一个或多个角色：

* **子网路由器**：向你的 tailnet 通告集群内部网络的路由，例如 Pod 和 Service CIDR。也支持 [4via6 子网路由][docs-4via6]。
* **出口节点**：将其他 tailnet 设备的所有出站互联网流量经由你的 Kubernetes 集群路由。可用于维持一致的公网 IP 地址，或让流量经由特定地理区域。
* **应用连接器**：通过你的 tailnet 提供对公共 SaaS 应用程序的身份感知访问，集中管理出站与安全策略。

> **注意：**
>
> 单个 Connector 可以同时充当子网路由器和出口节点。

## Connector 配置示例

以下清单创建一个通告集群内部 Pod CIDR 的子网路由器：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Connector
metadata:
  name: my-cluster-connector
spec:
  subnetRouter:
    advertiseRoutes:
      - "10.40.0.0/14"
```

## 进一步探索

* 使用 Connector 自定义资源[在 Kubernetes 上部署出口节点和子网路由器][docs-deploy-subnet-router]。
* [在 Kubernetes 上部署应用连接器][docs-deploy-app-connector]，为公共 SaaS 应用程序提供身份感知访问。

[docs-4via6]: /docs/features/subnet-routers/4via6-subnets

[docs-deploy-app-connector]: /docs/kubernetes-operator/connector/deploy-app-connector

[docs-deploy-subnet-router]: /docs/kubernetes-operator/connector/deploy-subnet-router

[xt-crd]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources
