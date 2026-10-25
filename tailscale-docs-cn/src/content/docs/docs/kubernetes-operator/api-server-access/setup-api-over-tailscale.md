---
title: "通过 Tailscale 设置 Kubernetes API 服务器"
description: "本主题介绍如何以 auth 模式设置 Tailscale API 服务器代理。在该模式下，代理在将请求转发给 Kubernetes API 服务器时会模拟调用者的 Tailscale 身份"
---

最后验证于 Jun 5, 2026

本主题介绍如何以 auth 模式设置 Tailscale API 服务器代理。在该模式下，代理在将请求转发给 Kubernetes API 服务器时会模拟调用者的 Tailscale 身份。这样你就可以使用标准的 Kubernetes RBAC。有关模拟机制的详细信息，请参阅[配置身份验证与授权][docs-auth-rbac]。

> **提示：**
>
> 如果你只想用 Tailscale 提供连接性、通过其他机制处理身份验证（例如云提供商 IAM），请参阅[不进行身份验证的代理（noauth 模式）][docs-noauth]。

## 前提条件

开始之前，请完成以下操作：

* [安装 Tailscale Kubernetes Operator][docs-k8s-install]。
* 为你的 tailnet [启用 HTTPS][docs-enabling-https]。
* 确保你的[访问控制策略][docs-acls]允许设备通过 TCP 端口 `443` 访问代理。

例如，如果你的 Operator 使用 `tag:k8s-operator`，可以为带有 `tag:engineering` 标签的设备开放访问：

```json
"grants": [
  {
    "src": ["tag:engineering"],
    "dst": ["tag:k8s-operator"],
    "ip": ["tcp:443"]
  }
]
```

> **注意：**
>
> 通过 tailnet 访问代理并不会赋予用户任何访问 Kubernetes API 的默认权限。用户只能访问通过 Kubernetes RBAC 明确授权其访问的资源。
>
> 如果想要快速的单副本设置，你可以在 Operator 自身上启用[进程内代理][docs-in-process]。详情请参阅[概览页面][docs-overview]。

## 使用 ProxyGroup 部署高可用代理

对于生产环境，请将 API 服务器代理部署为专用 [`ProxyGroup`][docs-proxygroup]。这样可以将代理的生命周期与 Operator 分离，并提供多个副本。

### 启用模拟 RBAC

`ProxyGroup` pod 在代理请求时需要 Kubernetes RBAC 权限来模拟用户和组。如果你尚未启用进程内代理，请设置 `allowImpersonation` 来预置所需的 RBAC：

```shell
helm upgrade tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --set-string apiServerProxyConfig.allowImpersonation="true" \
  --reuse-values
```

> **注意：**
>
> 如果你已经设置了 `apiServerProxyConfig.mode`，则 RBAC 已预置完成，无需此步骤。

### 配置访问控制

确保你的访问控制策略允许端口 `80` 和 `443` 上的访问：

```json
"grants": [
  {
    "src": ["tag:engineering"],
    "dst": ["tag:k8s"],
    "ip": ["tcp:80", "tcp:443"]
  }
]
```

配置[自动审批][docs-auto-approvers]，让 `ProxyGroup` 能够通告 Tailscale Services：

```json
"autoApprovers": {
  "services": {
    "svc:*": ["tag:k8s"]
  }
}
```

### 创建 ProxyGroup

创建具有 `spec.type: kube-apiserver` 的 `ProxyGroup` 资源：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-cluster
spec:
  type: kube-apiserver
  replicas: 2
  kubeAPIServer:
    mode: auth
```

等待 `ProxyGroup` 就绪：

```shell
kubectl wait proxygroup my-cluster --for=condition=ProxyGroupReady=true
```

## 配置 kubeconfig

`ProxyGroup` 就绪后，从 `ProxyGroup` 状态中获取代理 URL：

```shell
kubectl get proxygroup my-cluster
```

```
NAME         STATUS            URL                                 TYPE             AGE
my-cluster   ProxyGroupReady   https://my-cluster.tailxyz.ts.net   kube-apiserver   31s
```

使用 Tailscale CLI 配置 kubectl 通过代理连接：

```shell
tailscale configure kubeconfig https://my-cluster.tailxyz.ts.net
```

主机名默认为 `ProxyGroup` 名称，你可以使用 `spec.kubeAPIServer.hostname` 自定义。

## 配置 Kubernetes RBAC

代理会模拟调用者的 Tailscale 身份，但 Kubernetes 默认不会授予任何权限。你需要创建 Kubernetes RBAC 绑定来授予访问权限。

例如，为你的 Tailscale 用户授予集群只读访问权限：

```shell
kubectl create clusterrolebinding my-user-view \
  --user="alice@example.com" \
  --clusterrole=view
```

或者，为所有带有 `tag:engineering` 标签的设备授予只读访问权限：

```shell
kubectl create clusterrolebinding engineering-view \
  --group="tag:engineering" \
  --clusterrole=view
```

有关使用授权和组模拟的更高级配置，请参阅[配置身份验证与授权][docs-auth-rbac]。

## 进一步探索

* 为 API 服务器访问[配置][docs-auth-rbac]身份验证与授权。
* 以 [noauth 模式][docs-noauth]运行 API 服务器代理，跳过身份验证。
* [录制][docs-session-recording] kubectl 会话，以满足审计与合规需求。

[docs-in-process]: /docs/kubernetes-operator/api-server-access#in-process-proxy

[docs-acls]: /docs/features/access-control/acls

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-auto-approvers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-noauth]: /docs/kubernetes-operator/api-server-access/noauth-mode

[docs-overview]: /docs/kubernetes-operator/api-server-access

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[docs-session-recording]: /docs/kubernetes-operator/recorder
