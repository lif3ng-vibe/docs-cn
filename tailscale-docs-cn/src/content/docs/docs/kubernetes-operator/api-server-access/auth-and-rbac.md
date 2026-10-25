---
title: "为 API 服务器代理配置 Kubernetes RBAC"
description: "auth 模式下的 API 服务器代理使用调用者的 Tailscale 身份，模拟（impersonate）从 tailnet 发往 Kubernetes API 服务器的请求。随后你可以使用 Kubernetes RBAC 控制 tailnet 身份可访问哪些 API 服务器"
---

最后验证于 Jun 5, 2026

auth 模式下的 API 服务器代理使用调用者的 Tailscale 身份，模拟从 tailnet 发往 Kubernetes API 服务器的请求。随后你可以使用 Kubernetes RBAC 控制 tailnet 身份可访问哪些 API 服务器资源。

> **注意：**
>
> 通过 tailnet 访问代理并不会赋予 tailnet 用户任何访问 Kubernetes API 服务器资源的默认权限。tailnet 用户只能访问通过 Kubernetes RBAC 明确授权其访问的 API 服务器资源。

## 模拟机制的工作原理

> **提示：**
>
> 模拟仅在代理以 auth 模式运行时生效。如果你只想用 Tailscale 提供连接性、另行处理身份验证，请参阅[不进行身份验证的代理（noauth 模式）][docs-noauth]。

代理会基于调用者的 Tailscale 身份，在每个请求上设置 Kubernetes [模拟头][xt-k8s-impersonation]：

* **用户设备**：`Impersonate-User` 设置为该 Tailscale 用户的登录名，例如 `alice@example.com`。如果[授权][docs-grants]为该用户定义了 Kubernetes 组，这些组会作为 `Impersonate-Group` 头添加。
* **带标签的设备**：`Impersonate-User` 设置为节点的 FQDN。如果授权定义了 Kubernetes 组，这些组会作为 `Impersonate-Group` 头使用。如果没有适用的授权，则改用节点的[标签][docs-tags]作为组。

## 使用授权模拟 Kubernetes 组

[授权][docs-grants]让你可以把 Tailscale 用户组映射到 Kubernetes 组。例如，要让 `group:prod` 获得集群管理员访问权限、`group:k8s-readers` 获得只读访问权限：

```json
{
  "grants": [
    {
      "src": ["group:prod"],
      "dst": ["tag:k8s-operator"],
      "app": {
        "tailscale.com/cap/kubernetes": [{
          "impersonate": {
            "groups": ["system:masters"]
          }
        }]
      }
    },
    {
      "src": ["group:k8s-readers"],
      "dst": ["tag:k8s-operator"],
      "app": {
        "tailscale.com/cap/kubernetes": [{
          "impersonate": {
            "groups": ["tailnet-readers"]
          }
        }]
      }
    }
  ]
}
```

* `grants.dst` 必须与你的 API 服务器代理的标签匹配：进程内模式下是 Operator 的标签，专用模式下是 `ProxyGroup` 的标签。
* `system:masters` 是内置的 Kubernetes 组，拥有 cluster-admin 权限。
* `tailnet-readers` 是自定义的 Kubernetes 组名。组名无需在 Kubernetes 中预先创建。

然后将自定义组绑定到 Kubernetes `ClusterRole`：

```shell
kubectl create clusterrolebinding tailnet-readers-view --group=tailnet-readers --clusterrole=view
```

## 使用标签模拟 Kubernetes 组

如果没有适用的授权且请求来自带标签的设备，代理会为该设备的每个标签模拟一个对应的 Kubernetes 组。

例如，带有 `tag:k8s-readers` 标签的设备会以 Kubernetes 组 `tag:k8s-readers` 的身份通过验证。将其绑定到 `ClusterRole`：

```shell
kubectl create clusterrolebinding tailnet-readers --group="tag:k8s-readers" --clusterrole=view
```

## 使用 Tailscale 用户身份

如果请求来自不带标签的设备且没有适用的授权，代理会模拟一个与发送者 Tailscale 登录名匹配的 Kubernetes 用户。

例如，要授予 `alice@tailscale.com` 只读访问权限：

```shell
kubectl create clusterrolebinding alice-view --user="alice@tailscale.com" --clusterrole=view
```

[docs-grants]: /docs/features/access-control/grants

[docs-noauth]: /docs/kubernetes-operator/api-server-access/noauth-mode

[docs-tags]: /docs/features/tags

[xt-k8s-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
