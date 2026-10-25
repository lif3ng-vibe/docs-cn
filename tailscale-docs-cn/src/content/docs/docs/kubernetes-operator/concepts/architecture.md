---
title: "Tailscale Kubernetes Operator 架构"
description: "Tailscale Kubernetes Operator 拥有一组可按需组合的使用场景。下面的图示展示了 Operator 如何实现每个使用场景。每张图都标明了哪些资源运行在 Kubernetes 集群内、哪些位于集群外部"
---

最后验证于 Jun 5, 2026

Tailscale Kubernetes Operator 拥有一组可按需组合的使用场景。下面的图示展示了 Operator 如何实现每个使用场景。每张图都标明了哪些资源运行在 Kubernetes 集群内、哪些位于集群外部。集群内的资源在 Operator 部署完成后由它管理。

## API 服务器代理

API 服务器代理让 tailnet 设备能够安全访问 Kubernetes API 服务器。它可以在两种模式下运行：

### 进程内

Operator 在自己的进程内运行 API 服务器代理。客户端连接到 Operator 的 tailnet 地址，Operator 再将请求代理到 kube-apiserver。

如果代理以 "noauth" 模式运行，它会原样转发 HTTP 请求。在 "auth" 模式下，它会删除现有的身份验证头，并在转发前添加[模拟头][xt-k8s-impersonation]。带有模拟头的请求大致如下：

```
GET /api/v1/namespaces/default/pods HTTP/1.1
Host: k8s-api.example.com
Authorization: Bearer <operator-service-account-token>
Impersonate-Group: tailnet-readers
Accept: application/json
```

*（图：进程内 API 服务器代理架构图。客户端通过 tailnet 连接到 Operator，Operator 将请求代理到 Kubernetes 集群内的 kube-apiserver。）*

### 专用（ProxyGroup）

API 服务器代理还可以部署为专用 `ProxyGroup`，以独立于 Operator 的 pod 运行。这样可以提供高可用性，并将代理的生命周期与 Operator 分离。

*（图：专用 API 服务器代理架构图。具有多个副本的 ProxyGroup StatefulSet 将来自 tailnet 客户端的请求代理到 kube-apiserver，与 Operator pod 相互独立。）*

## L3 入站

配置详情请参阅 [L3 入站文档][docs-l3-ingress]。

用户将一个应用部署到 default 命名空间，并创建一个选择该应用 Pod 的普通 `Service`。可以添加注解 `tailscale.com/expose: "true"`，或者将 `.spec.type` 指定为 `Loadbalancer`、将 `.spec.loadBalancerClass` 指定为 `tailscale`。Operator 会创建一个入站代理，让 tailnet 中任意位置的设备都能访问该 `Service`。

代理 Pod 使用 `iptables` 或 `nftables` 规则，将发往代理 tailnet IP 地址的流量 DNAT 到 `Service` 的内部 `ClusterIP`。

*（图：L3 独立入站架构图。Operator 创建一个入站代理 pod，使用 iptables 或 nftables DNAT 规则将来自 tailnet 设备的流量转发到 Kubernetes Service。）*

## L7 入站

配置详情请参阅 [L7 入站文档][docs-l7-ingress]。

L7 入站架构图与 L3 入站类似。它通过 `Ingress` 对象而非 `Service` 配置，并使用 `tailscale serve` 接收流量，而不是配置 `iptables` 或 `nftables` 规则。Operator 使用 tailscaled 的本地 API（`SetServeConfig`）来设置 serve 配置，而不是使用 `tailscale serve` 命令。

*（图：L7 独立入站架构图。Operator 创建一个入站代理 pod，使用 tailscale serve 接收来自 tailnet 设备的 HTTP 流量并转发到 Kubernetes Service。）*

## L3 出站

1. 用户部署一个 `type: ExternalName` 且带有注解 `tailscale.com/tailnet-fqdn: db.tails-scales.ts.net` 的 `Service`。
2. Operator 创建一个由单副本 `StatefulSet` 管理的代理 Pod，以及一个指向该代理 Pod 的 headless `Service`。
3. Operator 更新 `ExternalName` `Service` 的 `spec.externalName` 字段，使其指向上一步创建的 headless `Service`。

配置详情请参阅 [L3 出站文档][docs-l3-egress]。

*（图：L3 独立出站架构图。Operator 创建一个出站代理 pod、一个 headless Service 和一个配置 Secret。ExternalName Service 解析到 headless Service，后者通过出站代理将流量路由到 tailnet 设备。）*

（可选）如果用户还在其 `ExternalName` `Service` 上添加 `tailscale.com/proxy-group: egress-proxies` 注解，Operator 会跳过创建代理 Pod，改为将 headless `Service` 指向现有 `ProxyGroup` 的 pod。在这种情况下，`ExternalName` `Service` 的 spec 中还需要声明端口。下面的示意图展示了一个更具代表性的视图。

## ProxyGroup

`ProxyGroup` 自定义资源管理一组代理 Pod。它同时支持出站和入站配置。

### 出站

`ProxyGroup` 自定义资源管理一组代理 Pod，可将其配置为通过 `ExternalName` Service 把流量从集群发送出去（出站）。`ProxyGroup` 既是 L3 出站的高可用（HA）版本，也是在单组 Tailscale 设备上承载多个 `ExternalName` Service 的机制（合并部署）。

在此图中，`ProxyGroup` 名为 `pg`。为简化起见，与 `ProxyGroup` Pod 关联的 Secret 省略未画。它们与 L3 出站的情况类似，但配置和状态 Secret 是*每个 Pod 一对*。

每个 `ExternalName` `Service` 定义哪些端口应映射到其声明的出站目标。Operator 通过 `ClusterIP` `Service` 及其 `EndpointSlice`，将这些端口映射到随机选择的临时端口。随后 Operator 生成出站 `ConfigMap`，告知 `ProxyGroup` Pod 哪个入站端口对应哪个出站目标。

*（图：ProxyGroup 出站架构图。StatefulSet 中的多个代理 pod 副本通过 ClusterIP Service 和 EndpointSlice，将来自 ExternalName Service 的流量转发到 tailnet 设备。）*

配置详情请参阅 [`ProxyGroup` 出站文档][docs-proxygroup-egress]。

### 入站

`ProxyGroup` 也可以为 `Ingress` 资源充当一组高可用的代理。`-0` Pod 始终是从 Let's Encrypt 签发证书的副本。

如果同一 `Ingress` 配置应用在多个集群中，各集群的 `ProxyGroup` 代理都是该 ts.net DNS 名称的有效目标。每个客户端被路由到哪个代理，取决于与[高可用][docs-high-availability]子网路由器相同的规则，并编码在客户端的 netmap 中。

*（图：ProxyGroup 入站架构图。StatefulSet 中的多个代理 pod 副本通过共享的 Tailscale Service 将 Kubernetes Service 暴露给 tailnet。）*

## Connector

`Connector` 自定义资源可以部署子网路由器、出口节点或应用连接器。下面的图展示了全部三种，但每个 `Connector` 资源只能配置一种工作流。

配置详情请参阅[子网路由器与出口节点文档][docs-connector]和[应用连接器文档][docs-app-connector]。

*（图：Connector 架构图。Connector pod 可配置为子网路由器、出口节点或应用连接器，在 tailnet 与集群或外部网络之间路由流量。）*

## Recorder 节点

`Recorder` 自定义资源让向集群部署 `tsrecorder` 变得更简单。它支持单副本。

配置详情请参阅 [Recorder 文档][docs-tsrecorder]。

*（图：Recorder 架构图。Recorder pod 捕获 kubectl exec、attach 和 debug 会话，以供审计与合规使用。）*

[docs-app-connector]: /docs/kubernetes-operator/connector/deploy-app-connector

[docs-connector]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-l3-egress]: /docs/kubernetes-operator/egress

[docs-l3-ingress]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l3

[docs-l7-ingress]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-proxygroup-egress]: /docs/kubernetes-operator/egress#高可用ha出站

[docs-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder

[xt-k8s-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
