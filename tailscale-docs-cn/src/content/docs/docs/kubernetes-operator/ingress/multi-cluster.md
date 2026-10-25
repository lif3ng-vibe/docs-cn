---
title: "配置带区域路由的多集群入站"
description: "本指南介绍如何把部署在两个集群中的应用公开到你的 tailnet。客户端使用单一的 MagicDNS 名称。Tailscale 使用[区域路由（regional routing）][docs-regional-routing]为每个客户端选择集"
---

最后验证于 Oct 7, 2026

本指南介绍如何把部署在两个集群中的应用公开到你的 tailnet。客户端使用单一的 MagicDNS 名称。Tailscale 使用[区域路由（regional routing）][docs-regional-routing]为每个客户端选择一个集群。

> **警告：**
>
> 本指南需要使用[区域路由][docs-route-selection]，该功能仅在 [Premium 和 Enterprise 套餐][co-pricing]中提供。

* 每个集群中的 `ProxyGroup` 管理一组高可用代理。
* 每个集群中的 Tailscale `Ingress` 将这些代理配置为把流量转发到 `Ingress` 上配置的后端 Kubernetes `Service`。
* 一个 [Tailscale Service][docs-tailscale-services] 代表两个集群中的应用副本。Tailscale 使用 DERP 延迟测量为每个客户端选择一个区域。

> **注意：**
>
> 本教程介绍的是使用 Kubernetes `Ingress` 资源的第 7 层入站。同样的方法也适用于使用 Kubernetes `Service` 资源的第 3 层入站。

## 前提条件

开始之前，请确保你具备以下条件：

* 两个可用的 Kubernetes 集群，最好位于不同的地理区域。
* 每个集群中都[安装][docs-k8s-install]了 Tailscale Kubernetes Operator。
* 为高可用入站配置了[所需权限][docs-k8s-ha-permissions]。
* 在 ACL 策略中配置了[自动批准（auto-approvers）][docs-auto-approvers]，允许你的代理标签通告 Tailscale Services。
* 为你的 tailnet 启用了[区域路由][docs-route-selection]。
* 客户端设备已配置为[接受路由][docs-accept-routes]。

## 配置集群

在**每个集群**中执行以下步骤。

### 创建 ProxyGroup 和 ProxyClass

应用以下清单来管理入站代理，并将其配置为在初始测试阶段使用 Let's Encrypt 的暂存（staging）环境。

将 `hostnamePrefix` 设置为每个集群唯一的值（例如 `eu-west`、`us-east`）。它决定每个集群的代理设备在你的 tailnet 中的主机名。

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: ingress-proxies
spec:
  type: ingress
  hostnamePrefix: eu-west
  replicas: 2
  proxyClass: letsencrypt-staging
---
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: letsencrypt-staging
spec:
  useLetsEncryptStagingEnvironment: true
```

```shell
kubectl apply -f proxygroup.yaml
```

### 部署示例应用

如果你还没有现成的工作负载，可以部署这个示例 nginx 应用。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
```

```shell
kubectl apply -f nginx.yaml
```

### 创建 Ingress 资源

用一个共享的 MagicDNS 名称公开 nginx 服务。`spec.tls.hosts` 字段决定 MagicDNS 名称。请在两个集群中使用**相同的主机名**，这样它们会共享同一个 Tailscale Service。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx
  annotations:
    tailscale.com/proxy-group: ingress-proxies
spec:
  defaultBackend:
    service:
      name: nginx
      port:
        number: 80
  ingressClassName: tailscale
  tls:
    - hosts:
        - nginx
```

```shell
kubectl apply -f ingress.yaml
```

## 测试暂存环境

1. 查看 MagicDNS 名称：

   ```shell
   kubectl get ingress nginx
   ```

2. 测试流量。由于你使用的是暂存证书，请使用 `-k` 标志跳过证书警告：

   ```shell
   curl -ksS https://nginx.<tailnet>.ts.net
   ```

3. 在 [Services](https://console.tailscale.com/admin/services) 中确认两个集群的代理 pod 都已列为 nginx 服务的后端。

## 切换到生产证书

更新每个集群中的 `ProxyClass` 以禁用暂存环境：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: letsencrypt-staging
spec:
  useLetsEncryptStagingEnvironment: false
```

```shell
kubectl apply -f proxyclass.yaml
```

## 测试生产环境

确认流量由有效的生产证书提供服务：

```shell
curl https://nginx.<tailnet>.ts.net
```

## 区域路由的工作原理

当你在多个集群中以相同的 MagicDNS 主机名创建相同的 `Ingress` 时，Tailscale Kubernetes Operator 会把这些集群的代理 pod 注册为同一个 Tailscale Service 的后端。控制平面按 DERP 区域对后端分组，先为每个客户端选择一个区域，再选择该区域中的一个可用后端。这与[高可用子网路由器][docs-ha-subnet-routers]使用的机制相同。

## 切换到 MagicRoute 测试版

如果你把 tailnet 从区域路由切换到 [MagicRoute][docs-magicroute]，Tailscale 会使用优先级评分（而不是按 DERP 区域分组）在现有后端之间进行选择。你无需重新创建 Tailscale Service 或 Kubernetes `Ingress` 资源。

## 进一步探索

* 通过 [ProxyGroup 高可用][docs-k8s-ha]配置有韧性的 Kubernetes 部署。
* 使用[向 tailnet 公开工作负载（L7）][docs-expose-l7]在第 7 层把 Kubernetes 工作负载公开到你的 tailnet。
* 使用 [Tailscale Services][docs-tailscale-services] 把流量路由到 Kubernetes 工作负载。
* 使用[区域路由][docs-regional-routing]把流量引导到合适的区域。

[co-pricing]: https://tailscale.com/pricing

[docs-accept-routes]: /docs/features/subnet-routers#从其他设备使用你的子网路由

[docs-auto-approvers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-expose-l7]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-ha-subnet-routers]: /docs/how-to/set-up-high-availability

[docs-k8s-ha-permissions]: /docs/kubernetes-operator/reference/rbac

[docs-k8s-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-magicroute]: /docs/features/magicroute

[docs-regional-routing]: /docs/features/route-selection#区域路由

[docs-route-selection]: /docs/features/route-selection

[docs-tailscale-services]: /docs/features/tailscale-services
