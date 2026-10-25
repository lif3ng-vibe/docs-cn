---
title: "控制对 ProxyGroup 资源的访问"
description: "在管理多租户 Kubernetes 集群时，你可以限制对所部署 ProxyGroup 资源的访问，尤其当这些 ProxyGroup 实例使用不同的 tailnet 时。在 Tailscale v1.96 及更"
---

最后验证于 Jun 5, 2026

在管理多租户 Kubernetes 集群时，你可以限制对所部署 ProxyGroup 资源的访问，尤其当这些 ProxyGroup 实例使用不同的 tailnet 时。在 Tailscale v1.96 及更高版本中，你可以使用 `ProxyGroupPolicy` 资源，让集群管理员限制各个命名空间内的 `Service` 和 `Ingress` 资源对 `tailscale.com/proxy-group` 注解的使用。

`ProxyGroupPolicy` 资源让你指定某个命名空间能否使用给定的 ProxyGroup 进行入站或出站。如果用户尝试创建指定了不在允许列表内的 ProxyGroup 名称的 `Ingress` 或 `Service`，Kubernetes API 服务器会拒绝它。

## 前提条件

* [安装 Tailscale Kubernetes Operator][docs-k8s-install]。

> **注意：**
>
> 不包含任何 `ProxyGroupPolicy` 资源的命名空间实际上被视为"全部允许"。当你把 `ProxyGroupPolicy` 应用到一个已存在使用 `tailscale.com/proxy-group` 注解的 `Service` 或 `Ingress` 资源的命名空间时，这些资源在下一次被修改之前不会受到评估。

以下示例展示了一个限制对所有 ProxyGroup 资源访问的 `ProxyGroupPolicy`，实际上相当于"全部拒绝"策略：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroupPolicy
metadata:
  name: deny-all
  namespace: example
spec:
  ingress: []
  egress: []
```

Operator 会把这个 `ProxyGroupPolicy` 转换为原生的 `ValidatingAdmissionPolicy` 和 `ValidatingAdmissionPolicyBinding` 资源，用于评估同一命名空间内 `Ingress` 和 `Service` 资源上 `tailscale.com/proxy-group` 注解的内容。

> **注意：**
>
> 如果一个命名空间中包含多个 `ProxyGroupPolicy` 资源，Operator 会把它们合并为一个 `ValidatingAdmissionPolicy` 资源。

## 多租户示例

设想一个多租户 Kubernetes 集群：各团队为其服务使用不同的 tailnet，并且每个团队在集群中拥有自己的命名空间来承载工作负载。

要设置对各自 tailnet 的访问，请为每个团队创建一个指向其 tailnet 的 ProxyGroup 资源。为确保这些命名空间不允许访问任何其他 tailnet 的入站或出站，请为每个命名空间指定一个 `ProxyGroupPolicy`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroupPolicy
metadata:
  name: billing
  namespace: team-billing
spec:
  ingress:
    - billing-ingress
  egress:
    - billing-egress
---
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroupPolicy
metadata:
  name: customer-engineering
  namespace: team-customer-engineering
spec:
  ingress:
    - customer-engineering-ingress
  egress:
    - customer-engineering-egress
```

此配置只允许 `team-billing` 命名空间内的 `Service` 和 `Ingress` 资源使用 `billing-ingress` 和 `billing-egress` 这两个 `tailscale.com/proxy-group` 注解。Kubernetes API 服务器会拒绝下面这个 `Ingress` 资源，因为它引用了另一个团队的 ProxyGroup：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  namespace: team-billing
  annotations:
    tailscale.com/proxy-group: customer-engineering-egress
spec:
  defaultBackend:
    service:
      name: example
      port:
        number: 80
  ingressClassName: tailscale
  tls:
    - hosts:
        - example
```

Operator 支持的依赖 ProxyGroup 资源的其他入站或出站方式也同样适用此规则。

[docs-k8s-install]: /docs/kubernetes-operator/install-operator
