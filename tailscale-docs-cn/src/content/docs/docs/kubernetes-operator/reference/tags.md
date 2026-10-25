---
title: "Tailscale Kubernetes Operator 的标签自定义"
description: "Tailscale Kubernetes Operator 使用[标签][docs-tags]来标识其管理的设备并控制对它们的访问。标签决定哪些 tailnet 身份可以访问 operator 管理的设备，以及哪些设备可以通告 Tailscale Service。"
---

最后验证于 Jun 5, 2026

Tailscale Kubernetes Operator 使用[标签][docs-tags]来标识其管理的设备并控制对它们的访问。标签决定哪些 tailnet 身份可以访问 operator 管理的设备，以及哪些设备可以通告 Tailscale Service。

operator 使用两个默认标签：

* **`tag:k8s-operator`**：应用于 operator 设备本身。
* **`tag:k8s`**：应用于 operator 创建的所有代理设备（入站代理、出站代理、连接器与 ProxyGroup 副本）。

## 默认标签

你在[安装 operator][docs-install-operator]时使用 [Helm][xt-helm] 值配置默认标签：

* **`operatorConfig.defaultTags`**：operator 设备的标签。默认为 `tag:k8s-operator`。
* **`proxyConfig.defaultTags`**：operator 创建的所有代理设备的标签。默认为 `tag:k8s`。

安装时设置自定义默认值：

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --set-json 'operatorConfig.defaultTags=["tag:k8s-operator"]' \
  --set-json 'proxyConfig.defaultTags=["tag:k8s","tag:prod"]'
```

## 标签所有权

operator 的标签必须在你的 tailnet 策略文件中拥有这些代理标签。否则，operator 无法创建带有这些标签的设备。

对于默认标签，请从 [访问控制](https://console.tailscale.com/admin/acls) 页面向 tailnet 策略文件添加以下内容：

```json
"tagOwners": {
  "tag:k8s-operator": [],
  "tag:k8s": ["tag:k8s-operator"]
}
```

此配置使 `tag:k8s-operator` 由 tailnet 管理员拥有，并允许带有 `tag:k8s-operator` 标签的设备（即 operator）创建带有 `tag:k8s` 标签的设备。

如果你使用自定义标签，operator 的标签也必须拥有这些标签。例如，如果你为代理打 `tag:prod` 标签：

```json
"tagOwners": {
  "tag:k8s-operator": [],
  "tag:k8s": ["tag:k8s-operator"],
  "tag:prod": ["tag:k8s-operator"]
}
```

## 按资源自定义标签

你可以在单个资源上覆盖默认的代理标签。

### Connector

在 `Connector` 规范中设置标签：

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

在 `ProxyGroup` 规范中设置标签：

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

### Service 或 Ingress（独立代理）

使用 `tailscale.com/tags` 注解：

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

与所有自定义标签一样，operator 的标签必须是这些标签的 `tagOwner`。详情参阅[标签所有权][ar-tag-ownership]。

## 访问控制中的标签

标签是控制对 operator 管理设备的访问的主要机制。请在 tailnet 策略文件中使用标签来：

* **用 ACL 或授权授予权限**：让特定 tailnet 身份可以访问带有给定标签的设备。参阅[授权][docs-grants]与 [ACL][docs-acls]。
* **批准 Tailscale Service 通告方**：使用 [`autoApprovers`][docs-auto-approvers] 允许 ProxyGroup 设备通告 Tailscale Service。示例参阅[权限与 RBAC][docs-rbac]。

## 标签与 API server 代理

当带有标签的设备连接到 [API server 代理][docs-auth-rbac]时，代理会使用该设备的标签作为 Kubernetes 组来模拟（impersonate）请求。例如，带有 `tag:ci-runner` 标签的设备会以 Kubernetes 组 `tag:ci-runner` 的身份被模拟。你可以使用标准 RBAC 将这些组绑定到 Kubernetes 角色。

如果[授权][docs-grants]为该设备定义了额外的 Kubernetes 组，这些组会优先于基于标签的组。

## 限制

* operator 只在初始置备设备时应用标签。如果你修改已暴露 `Service` 上的 `tailscale.com/tags` 注解，标签不会更新，直到你重建该 `Service`。
* 连接器设备创建后，`Connector` 标签无法更改。

完整列表参阅[限制][docs-limitations]。

## 后续步骤

* [安装 operator][docs-install-operator]以配置默认标签。
* 使用[权限与 RBAC][docs-rbac]查看基于标签的访问控制示例。
* 使用 [API server 代理的认证与 RBAC][docs-auth-rbac]了解基于标签的模拟。
* 参阅[标签][docs-tags]了解有关使用 Tailscale 标签的更多一般信息。

[ar-tag-ownership]: #标签所有权

[docs-acls]: /docs/features/access-control/acls

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-auto-approvers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-grants]: /docs/features/access-control/grants

[docs-install-operator]: /docs/kubernetes-operator/install-operator

[docs-limitations]: /docs/kubernetes-operator/reference/limitations

[docs-rbac]: /docs/kubernetes-operator/reference/rbac

[docs-tags]: /docs/features/tags

[xt-helm]: https://helm.sh/
