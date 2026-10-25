---
title: "向 tailnet 公开集群工作负载（第 7 层）"
description: "本指南介绍如何以高可用方式将 Kubernetes 集群中运行的服务公开到你的 tailnet。你将使用 `ProxyGroup` 和 Kubernetes `Ingress` 资源创建多个入站代理，"
---

最后验证于 Jun 5, 2026

本指南介绍如何以高可用方式将 Kubernetes 集群中运行的服务公开到你的 tailnet。你将使用 `ProxyGroup` 和 Kubernetes `Ingress` 资源创建多个入站代理，即使其中某个代理发生故障，你的服务也能保持可用。

## 前提条件

* [安装][docs-k8s-install] Tailscale Kubernetes Operator。
* 配置 [Ingress 所需的权限][docs-operator-ingress-ha-permissions]。

## 创建 ProxyGroup

创建一个 `ProxyGroup` 自定义资源，为你的 `Ingress` 管理一组 Tailscale 代理。

创建一个名为 `ingress-proxygroup.yaml` 的文件，内容如下：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: ingress-proxies
spec:
  type: ingress
  replicas: 2
```

将该清单应用到你的集群：

```shell
kubectl apply -f ingress-proxygroup.yaml
```

这会创建一个名为 `ingress-proxies`、含两个副本的 `ProxyGroup`。Operator 会在 `tailscale` 命名空间中创建一个带 2 个副本的 `StatefulSet`。

## 部署示例应用

部署一个 nginx 应用，这就是你要公开的工作负载。

创建一个名为 `nginx-deployment.yaml` 的文件，内容如下：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
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
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

将该清单应用到你的集群：

```shell
kubectl apply -f nginx-deployment.yaml
```

## 使用 Ingress 和 ProxyGroup 公开服务

使用一个引用了你 `ProxyGroup` 的 Kubernetes `Ingress` 资源来公开 `nginx-service`。

创建一个名为 `nginx-ha-ingress.yaml` 的文件，内容如下：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ha-ingress
  annotations:
    tailscale.com/proxy-group: ingress-proxies
spec:
  ingressClassName: tailscale
  tls:
    - hosts:
        - nginx-ha
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

将该清单应用到你的集群：

```shell
kubectl apply -f nginx-ha-ingress.yaml
```

此清单中的关键字段如下：

* `ingressClassName: tailscale`：指示 Tailscale Operator 管理此 `Ingress`。
* `tailscale.com/proxy-group: ingress-proxies`：指示 Operator 使用名为 `ingress-proxies` 的 `ProxyGroup` 来配置入站。
* `tls.hosts`：通过在 `ProxyGroup` 上进行通告，为映射到该 `Ingress` 的 Tailscale Service 设置所需的 MagicDNS 名称。

## 访问你的服务

Operator 会配置一个 Tailscale Service 和若干代理，将流量路由到你的 nginx 应用。你可以在 `Ingress` 资源的 ADDRESS 字段中找到 MagicDNS 名称：

```shell
kubectl get ingress nginx-ha-ingress
```

输出类似于下面的内容：

```
NAME               CLASS       HOSTS   ADDRESS                     PORTS   AGE
nginx-ha-ingress   tailscale   *       nginx-ha.tailxxxxx.ts.net   443     1m
```

ADDRESS 字段填充 MagicDNS 名称后，你就可以在 tailnet 中的任何设备上，通过浏览器访问 `https://nginx-ha.tailxxxxx.ts.net`（完整 URI 见 ADDRESS 字段）来使用你的 nginx 服务。

更多信息，请参阅[使用 Ingress 将集群工作负载公开到你的 tailnet][docs-operator-ingress]。

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-operator-ingress]: /docs/kubernetes-operator/ingress

[docs-operator-ingress-ha-permissions]: /docs/kubernetes-operator/reference/rbac
