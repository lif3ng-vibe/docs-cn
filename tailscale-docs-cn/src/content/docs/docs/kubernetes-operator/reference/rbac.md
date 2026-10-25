---
title: "Tailscale Kubernetes Operator 的权限与 RBAC"
description: "Tailscale Kubernetes Operator 的权限来自两个来源：管理进出集群流量的 tailnet 身份与访问策略，以及管理 operator 及其代理在集群内能做什么的 Kubernetes 基于角色的访问控制（RBAC）与 Pod 安全设置。"
---

最后验证于 Aug 14, 2026

Tailscale Kubernetes Operator 的权限来自两个来源：一是管理进出集群流量的 tailnet 身份与访问策略，二是 Kubernetes 基于角色的访问控制（RBAC）与 Pod 安全设置，它们决定 operator 及其代理在集群内能做什么。

## Ingress

通过高可用 `ProxyGroup` 代理暴露的集群工作负载，其 tailnet 访问由 Tailscale 标签（tag）与 tailnet 策略文件控制。

默认情况下，`ProxyGroup` 代理会被打上 `tag:k8s` [标签][docs-tags]。你可以使用 [`ProxyGroup` 规范][xt-gh-tailscale-k8s-proxygroup]中的 `.tags` 字段配置标签。你必须确保为 [operator 的 OAuth 客户端凭证][docs-kubernetes-operator-setup]打的标签是 `ProxyGroup` 设备标签的 [`tagOwner`][docs-tag-owners]。

> **注意：**
>
> 与非高可用代理不同，代理标签不会用于授予通过这些代理暴露的集群应用的访问权限。

对于在 `ProxyGroup` 上暴露的每个高可用 `Service` 或 `Ingress`，Kubernetes operator 会创建一个 Tailscale Service。每个 `ProxyGroup` 代理都会通告该 Tailscale Service，具体做法是把自己配置为该 Tailscale Service tailnet 流量的后端。分配给 `Ingress` 或 `Service` 的 Tailscale IP 地址与 DNS 名称，就是该 Tailscale Service 的 IP 地址与 DNS 名称。

你可以为一个 Tailscale Service 打[标签][docs-tags]，并利用标签配置哪些 tailnet 设备可以通告该服务、哪些 tailnet 身份可以访问它。默认情况下，Kubernetes operator 会为所有 Tailscale Service 打上 `tag:k8s` 标签。你可以使用 `Service` 或 `Ingress` 资源上的 `tailscale.com/tags` 注解配置 Tailscale Service 标签。

### 确保 `ProxyGroup` 设备可以通告 Tailscale Service

要允许 `ProxyGroup` 设备通告 Tailscale Service，请使用 tailnet 策略文件中的 [`autoApprovers`][docs-auto-approvers] 部分。

例如，要让带有 `tag:eu-cluster` 标签的 `ProxyGroup` 设备通告带有 `tag:monitoring` 标签的 Tailscale Service，请在 tailnet 策略文件中添加以下内容：

```json
"autoApprovers": {
  "services": {
    "tag:monitoring": ["tag:eu-cluster"],
  },
}
```

### 配置访问

使用 tailnet 策略文件中的授权（grant）来控制哪些 tailnet 身份可以访问你的 Tailscale Service。

要授予对单个 Tailscale Service 的访问权限，请使用该 Tailscale Service 的 `svc:` 名称作为目标。例如，要让 `group:eng` 组访问 `svc:monitoring`：

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["svc:monitoring"],
    "ip":  ["*"],
  },
]
```

要一次性授予对一组 Tailscale Service 的访问权限，请以它们共有的标签为目标。基于标签的授权会覆盖带有该标签的所有现有及未来的 Tailscale Service，因此无需逐个指名每个服务。例如，要让 `group:eng` 访问所有带有 `tag:monitoring` 标签的 Tailscale Service：

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:monitoring"],
    "ip":  ["*"],
  },
]
```

默认情况下，Kubernetes operator 会用同一个标签 `tag:k8s` 同时标记 `ProxyGroup` 设备与它们通告的 Tailscale Service。由于设备与 Tailscale Service 从同一命名空间取标签，以该共享标签为目标的授权会同时作用于设备与 Tailscale Service。

要将 Tailscale Service 的访问控制与 `ProxyGroup` 设备分开管理，请为 Tailscale Service 指定一个专用标签。在 [`ProxyGroup` 规范][xt-gh-tailscale-k8s-proxygroup]的 `.tags` 字段中设置设备标签，并在 `Ingress` 或 `Service` 资源上的 `tailscale.com/tags` 注解中设置一个不同的 Tailscale Service 标签：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: eu-cluster
spec:
  type: ingress
  tags:
    - tag:k8s-proxy # 标记 ProxyGroup 设备
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: monitoring
  annotations:
    tailscale.com/proxy-group: eu-cluster
    tailscale.com/tags: tag:monitoring # 标记 Tailscale Service
# ...
```

operator 的 OAuth 客户端必须是你使用的每个标签的 [`tagOwner`][docs-tag-owners]。

## 自定义

你可以自定义 operator 创建的代理 Pod 的 Kubernetes 安全上下文（security context），包括降低它们的默认权限。

为[使用 `Service` 的集群入站][docs-operator-cluster-ingress-service]、[集群出站][docs-operator-cluster-egress]、[`Connector`][docs-operator-connector] 与 [`ProxyGroup`][docs-proxy-group] 创建的代理 Pod 包含一个主 `tailscale` 容器和一个 `init` 容器。

在 Tailscale v1.78 及更高版本中，这两个容器都以[特权容器][xt-kubernetes-security-context]方式运行。主 `tailscale` 容器需要特权权限来创建 `/dev/net/tun` 设备。作为替代方案，你可以限制主容器的权限，并将设备创建工作委托给 [Kubernetes 设备插件][xt-kubernetes-device-plugin]：

1. 在集群中安装 [generic device plugin][xt-gh-generic-device-plugin]。传入一个 `--device` 标志，配置该插件创建 `/dev/net/tun` 设备：

   ```shell
   --device='{"name": "tun", "groups": [{"paths": [{"path": "/dev/net/tun"}]}, "count": 1000]}'
   ```

2. 应用一个 `ProxyClass`，将 `tailscale` 容器的权限限制为 `NET_ADMIN` 与 `NET_RAW` 能力，并让设备插件创建 `/dev/net/tun` 设备：

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

3. 确保该 `ProxyClass` 应用到为 [Tailscale 入站 `Service`][docs-operator-cluster-ingress-service]、[Tailscale 出站 `Service`][docs-operator-cluster-egress]、[`Connector`][docs-operator-connector] 与 [`ProxyGroup`][docs-proxy-group] 创建的所有代理。

详细说明与讨论请参阅 [GitHub 上的设备插件提案][xt-gh-device-plugin-discussion]。

[docs-auto-approvers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-kubernetes-operator-setup]: /docs/kubernetes-operator/install-operator#配置标签和-oauth-凭证

[docs-operator-cluster-egress]: /docs/kubernetes-operator/egress

[docs-operator-cluster-ingress-service]: /docs/kubernetes-operator/ingress#独立-l3-入站tcpudp

[docs-operator-connector]: /docs/kubernetes-operator/connector

[docs-proxy-group]: /docs/kubernetes-operator/concepts/proxygroup

[docs-tag-owners]: /docs/reference/syntax/policy-file#标签所有者

[docs-tags]: /docs/features/tags

[xt-gh-device-plugin-discussion]: https://github.com/tailscale/tailscale/issues/10814

[xt-gh-generic-device-plugin]: https://github.com/squat/generic-device-plugin

[xt-gh-tailscale-k8s-proxygroup]: https://github.com/tailscale/tailscale/blob/main/cmd/k8s-operator/deploy/crds/tailscale.com_proxygroups.yaml

[xt-kubernetes-device-plugin]: https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/

[xt-kubernetes-security-context]: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
