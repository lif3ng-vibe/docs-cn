---
title: "Kubernetes 上的 Tailscale"
description: "在 Kubernetes 集群部署中使用 Tailscale。"
---

最后验证于 May 29, 2026

Kubernetes 是部署、伸缩和管理容器化应用的常用方式。Tailscale 与 Kubernetes 的结合有很多用法，例如：为 Kubernetes 服务提供入站流量入口、向 tailnet 发送出站流量，以及安全访问集群控制平面（kube-apiserver）。你可以通过 [Tailscale Kubernetes Operator][ar-use-the-kubernetes-operator] 在 Kubernetes 集群内运行 Tailscale，也可以把它作为 sidecar（边车）、代理或子网路由器运行。本文展示几种常见用法。

Tailscale 也提供 [Docker 镜像][docs-docker]。

## 前提条件

你可以从 GitHub 克隆仓库来跟做本文的示例。例如：

```shell
gh repo clone tailscale/tailscale
cd tailscale/docs/k8s
```

## 设置

1. （可选）你可以选择使用[认证密钥（auth key）][docs-auth-keys]来自动完成容器向 tailnet 的登录。
   在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建认证密钥。
   我们建议为此使用[临时密钥（ephemeral key）][docs-ephemeral-nodes]，它会在设备关机后自动清理这些设备。
   我们还建议使用[可复用密钥（reusable key）][docs-auth-keys-types]，这样容器停止再启动后仍能连接到你的 tailnet。

   *（图：Tailscale 认证密钥生成页面）*

   > **注意：**

   如果你不提供密钥，那么在使用下方容器镜像时，仍然可以通过日志中给出的 URL 登录完成认证。

   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: tailscale-auth
   stringData:
     TS_AUTHKEY: tskey-0123456789abcdef
   ```

2. Tailscale（v1.16 及更高版本）支持将状态存储在
   [Kubernetes Secret][xt-kubernetes-secret] 中。

   配置基于角色的访问控制（RBAC），允许 Tailscale pod 读写 `tailscale` secret。

   ```shell
   export SA_NAME=tailscale
   export TS_KUBE_SECRET=tailscale-auth
   make rbac | kubectl apply -f-
   ```

## 使用 Kubernetes Operator

Tailscale 还提供了 [Tailscale Kubernetes Operator][docs-kubernetes-operator]。Kubernetes Operator 可以让你：

* 将 Kubernetes 集群中的[服务][xt-kubernetes-service-dns-name]暴露给你的 Tailscale 网络（即 tailnet）。
* 通过 API server 代理安全连接到 [Kubernetes 控制平面（kube-apiserver）][xt-kubernetes-api-kube-apiserver]，认证与否均可。
* 从 Kubernetes 集群出站访问 tailnet 中的外部服务。

## sidecar 示例

以 sidecar 方式运行可以让你通过 Tailscale 直接暴露一个 Kubernetes pod。如果你不想把服务暴露在公共互联网上，这种做法尤其有用。此方式让 pod 与 tailnet 中的其他设备之间实现双向连通。你可以使用[访问控制策略][docs-access-control]来控制流量走向。

> **注意：**
>
> 下面的示例适合快速测试。对于需要持久化状态和 DNS 配置的部署，请参考 [sidecar 部署指南][docs-sidecar-production]。

1. 创建带 Tailscale sidecar 的示例 nginx pod 并登录：

   ```shell
   make sidecar | kubectl apply -f-
   # 如果不使用认证密钥，请从此处日志中获取登录 URL 完成认证：
   kubectl logs nginx ts-sidecar
   ```

2. 检查能否通过 Tailscale 连接到 nginx：

   ```shell
   curl http://nginx
   ```

   或者，如果你已禁用 [MagicDNS][docs-magicdns]：

   ```shell
   curl "http://$(tailscale ip -4 nginx)"
   ```

## 用户态 sidecar

你也可以在[用户态网络模式][docs-userspace-networking]下运行 sidecar。用户态网络降低了 Tailscale 运行所需的权限，代价是 pod 到 tailnet 的出站连接必须借助 [SOCKS5 代理或 HTTP 代理][docs-userspace-networking-socks5-vs-http]。

1. 创建带 Tailscale sidecar 的示例 nginx pod 并登录：

   ```shell
   make userspace-sidecar | kubectl apply -f-
   # 如果不使用认证密钥，请从此处日志中获取登录 URL 完成认证：
   kubectl logs nginx ts-sidecar
   ```

2. 检查能否通过 Tailscale 连接到 nginx：

   ```shell
   curl http://nginx
   ```

   或者，如果你已禁用 [MagicDNS][docs-magicdns]：

   ```shell
   curl "http://$(tailscale ip -4 nginx)"
   ```

## 代理示例

运行 Tailscale 代理可以为 Kubernetes Service 提供入站连接。

> **注意：**
>
> 若要改用 Operator 部署入站代理，请访问 [Kubernetes Operator Ingress][docs-kubernetes-operator-ingress] 页面了解详情。

1. 通过以下任一方式提供你要访问的服务的 `ClusterIP`：

   **新建一个 deployment**

   ```shell
   kubectl create deployment nginx --image nginx
   kubectl expose deployment nginx --port 80
   export TS_DEST_IP="$(kubectl get svc nginx -o=jsonpath='{.spec.clusterIP}')"
   ```

   **使用现有服务**

   ```shell
   export TS_DEST_IP="$(kubectl get svc <SVC_NAME> -o=jsonpath='{.spec.clusterIP}')"
   ```

2. 部署代理 pod：

   ```shell
   make proxy | kubectl apply -f-
   # 如果不使用认证密钥，请从此处日志中获取登录 URL 完成认证：
   kubectl logs proxy
   ```

3. 检查能否通过 Tailscale 连接到 nginx：

   ```shell
   curl http://proxy
   ```

   或者，如果你已禁用 [MagicDNS][docs-magicdns]：

   ```shell
   curl "http://$(tailscale ip -4 proxy)"
   ```

## 子网路由器

运行 Tailscale [子网路由器][docs-subnets]可以让你通过 Tailscale 访问整个 Kubernetes 集群网络（前提是 NetworkPolicy 允许）。

> **注意：**
>
> 若要改用 Operator 部署子网路由器，请访问 [Kubernetes Operator 子网路由器][docs-kubernetes-operator-connector] 页面了解详情。

1. 确定覆盖你的 Kubernetes 集群的 Pod/Service CIDR。具体取值取决于你使用的 [CNI][xt-kubernetes-cluster-networking] 和云服务商。将这些 CIDR 以逗号分隔添加到 `TS_ROUTES` 变量中。

   ```shell
   SERVICE_CIDR=10.20.0.0/16
   POD_CIDR=10.42.0.0/15
   export TS_ROUTES=$SERVICE_CIDR,$POD_CIDR
   ```

2. 部署 subnet-router pod。

   ```shell
   make subnet-router | kubectl apply -f-
   # 如果不使用认证密钥，请从此处日志中获取登录 URL 完成认证：
   kubectl logs subnet-router
   ```

3. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确保子网路由器的路由已启用。

4. 确保你要用来连接的每个客户端都启用了 `--accept-routes`。

5. 检查能否通过 Tailscale 连接到 `ClusterIP` 或 `PodIP`：

   ```shell
   # 获取 Service IP
   INTERNAL_IP="$(kubectl get svc <SVC_NAME> -o=jsonpath='{.spec.clusterIP}')"
   # 或者，获取 Pod IP
   # INTERNAL_IP="$(kubectl get po <POD_NAME> -o=jsonpath='{.status.podIP}')"
   INTERNAL_PORT=8080
   curl http://$INTERNAL_IP:$INTERNAL_PORT
   ```

## （可选）添加 DNS 信息

默认情况下，我们不会为容器设置 DNS。要为 Kubernetes 容器启用 [MagicDNS][docs-magicdns]，你需要在环境中导出 `TS_ACCEPT_DNS=true`。

## 从 tailnet 中移除临时节点

临时节点（ephemeral node）离线后会自动从你的 tailnet 中移除。你也可以使用 [`tailscale logout`][docs-cli-logout] 命令来控制临时节点的移除：既可以手动强制移除，也可以将该命令整合进 [`tailscaled`][docs-tailscaled] Tailscale 守护进程。更多信息请参考[临时节点][docs-ephemeral-nodes-faq]。

[ar-use-the-kubernetes-operator]: #使用-kubernetes-operator

[docs-access-control]: /docs/features/access-control

[docs-auth-keys-types]: /docs/features/access-control/auth-keys#types-of-auth-keys

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-docker]: /docs/features/containers/docker

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#faq

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-kubernetes-operator-ingress]: /docs/kubernetes-operator/ingress

[docs-kubernetes-operator-connector]: /docs/kubernetes-operator/connector

[docs-magicdns]: /docs/features/magicdns

[docs-sidecar-production]: /docs/solutions/connect-kubernetes-pods-to-tailnet-using-sidecar

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking-socks5-vs-http]: /docs/concepts/userspace-networking#socks5-vs-http

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-kubernetes-api-kube-apiserver]: https://kubernetes.io/docs/concepts/architecture/#kube-apiserver

[xt-kubernetes-cluster-networking]: https://kubernetes.io/docs/concepts/cluster-administration/networking

[xt-kubernetes-secret]: https://kubernetes.io/docs/concepts/configuration/secret

[xt-kubernetes-service-dns-name]: https://kubernetes.io/docs/concepts/services-networking/service
