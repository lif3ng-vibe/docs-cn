---
title: "通过 Tailscale 访问 Kubernetes API 服务器"
description: "通过 Tailscale 安全访问 Kubernetes API 服务器。"
---

最后验证于 Jun 5, 2026

API 服务器代理让你可以通过 tailnet 安全地访问 Kubernetes API 服务器，而无需将其暴露到公共互联网。它位于 tailnet 客户端与 Kubernetes API 服务器之间，转发经过身份验证的请求。

API 服务器代理支持两种身份验证模式，既可以作为[进程内代理][ar-in-process]在 Operator 内运行，也可以作为[专用 ProxyGroup][ar-dedicated] 运行。

> **提示：**
>
> **会话录制**：你可以录制通过 API 服务器代理执行的 `kubectl exec`、`attach` 和 `debug` 会话，以供审计与合规使用。请参阅[记录 kubectl 会话][docs-session-recording]。

> **提示：**
>
> **想直接连接**？如果 API 服务器代理已配置好，可使用 `tailscale configure kubeconfig <proxy-hostname>` 设置 `kubectl` 访问。你可以在管理控制台的[机器](https://console.tailscale.com/admin/machines)页面找到代理的 MagicDNS 名称，也可以询问你的集群管理员。详情请参阅[设置主题][docs-access-api]。

有关设置步骤，请参阅[通过 Tailscale 设置 Kubernetes API 服务器][docs-access-api]。

## 身份验证模式（默认）

在身份验证（auth）模式下，代理会根据来源的 Tailscale 身份对传入请求进行身份验证，并在将请求转发给 Kubernetes API 服务器时[模拟（impersonate）][xt-k8s-impersonation]该身份。这样你就可以使用标准的 Kubernetes RBAC。

代理如何确定 Kubernetes 身份：

* **用户设备**：请求会被模拟为该 Tailscale 用户（例如 `alice@example.com`）。如果[授权][docs-grants]定义了额外的 Kubernetes 组，这些组会被添加为模拟组。
* **带标签的设备**：请求会被模拟为一个以节点 FQDN 为名的用户，并以节点的[标签][docs-tags]作为 Kubernetes 组。如果授权定义了额外的组，这些组将优先于基于标签的组。

## noauth 模式

在 noauth 模式下，代理将请求转发给 API 服务器时不添加任何身份验证信息。如果你只使用 Tailscale 提供连接性，而通过其他机制处理身份验证，这种模式会很有用。

[**在不使用 Tailscale 身份验证的情况下使用 API 服务器代理**](/docs/kubernetes-operator/api-server-access/noauth-mode)——仅将 API 服务器代理用于连接，身份验证由外部机制完成。

## 进程内代理

要开始使用，可以在 Operator pod 内以进程内方式运行 API 服务器代理。在使用 Helm 安装 Operator 时设置 `apiServerProxyConfig.mode` 即可启用：

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string apiServerProxyConfig.mode="true" \
  --wait
```

客户端连接到 Operator 的 tailnet 地址，Operator 再将请求代理到 kube-apiserver。

*（图：进程内 API 服务器代理架构图。客户端通过 tailnet 连接到 Operator，Operator 将请求代理到 Kubernetes 集群内的 kube-apiserver。）*

这种配置意味着代理与 Operator pod 共享生命周期，并且仅限单个副本。

## 专用代理（ProxyGroup）

对于生产环境，你可以将 API 服务器代理部署为具有 `spec.type: kube-apiserver` 的专用 [`ProxyGroup`][docs-proxygroup]。这样可以将代理的生命周期与 Operator 分离，并通过多副本提供高可用性。

*（图：专用 API 服务器代理架构图。具有多个副本的 ProxyGroup StatefulSet 将来自 tailnet 客户端的请求代理到 kube-apiserver，与 Operator pod 相互独立。）*

专用代理需要：

* **模拟 RBAC**：必须设置 Helm 值 `apiServerProxyConfig.allowImpersonation`，以便为 `ProxyGroup` pod 预置模拟用户所需的 Kubernetes RBAC。
* **自动审批**：你的 ACL 策略必须允许 `ProxyGroup` 的标签通告 [Tailscale Services][docs-tailscale-services]。

完整的设置说明请参阅[通过 Tailscale 设置 Kubernetes API 服务器][docs-access-api]，`ProxyGroup` 的一般配置请参阅 [Tailscale Kubernetes Operator 高可用][docs-ha]。

## 限制

API 服务器代理存在以下限制：

* **集群内依赖**：代理运行在集群内部。如果集群无法调度 pod，你可能失去对 API 的访问。
* **TLS 延迟**：进程内代理在首次请求时签发证书，可能导致初次超时。`ProxyGroup` 部署会在就绪前预置证书，从而避免这一问题。

## 进一步探索

* 为 API 服务器代理配置 [Kubernetes RBAC][docs-auth-rbac]。
* 为 Tailscale Kubernetes Operator 配置[高可用][docs-ha]。
* 为 API 服务器代理配置[会话录制][docs-session-recording]。

[ar-dedicated]: #专用代理proxygroup

[ar-in-process]: #进程内代理

[docs-access-api]: /docs/kubernetes-operator/api-server-access/setup-api-over-tailscale

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-grants]: /docs/features/access-control/grants

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[docs-session-recording]: /docs/kubernetes-operator/recorder

[docs-tags]: /docs/kubernetes-operator/reference/tags

[docs-tailscale-services]: /docs/features/tailscale-services

[xt-k8s-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
