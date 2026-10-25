---
title: "使用 Tailscale Funnel 将 Kubernetes 集群工作负载暴露到公共互联网"
description: "本指南介绍如何使用 Tailscale Kubernetes Operator 和 [Tailscale Funnel][docs-funnel] 将部署在 Kubernetes 集群中的 `Service` 暴露到公共互联网。"
---

最后验证于 Jun 5, 2026

本指南介绍如何使用 Tailscale Kubernetes Operator 和 [Tailscale Funnel][docs-funnel] 将部署在 Kubernetes 集群中的 `Service` 暴露到公共互联网。

## 前提条件

开始之前，请确保你已具备以下条件：

* 集群中已安装 Tailscale Kubernetes Operator。
* 已配置 [`Ingress` 所需的权限][docs-ingress-permissions]。

## 更新 tailnet 策略文件

要使 [Tailscale Funnel][docs-funnel] 正常工作，Operator 的代理节点需要被显式授予使用 Funnel 的权限。在[访问控制](https://console.tailscale.com/admin/acls)页面的 tailnet 策略文件中添加一个 `nodeAttrs` 部分：

```json
	"nodeAttrs": [
		{
			// 'tag:k8s' 是 Tailscale Operator 默认使用的标签
			"target": ["tag:k8s"],
			"attr":   ["funnel"],
		},
	]
```

> **注意：**
>
> 即使你的策略已将 `funnel` 属性授予默认的 `autogroup:member`，你仍需将其添加到代理使用的标签上，因为 `autogroup:member` 不包含带标签的设备。

## 部署示例应用

部署一个 nginx 应用作为要暴露的工作负载。

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

将此清单应用到集群：

```shell
kubectl apply -f nginx-deployment.yaml
```

## 创建 Funnel Ingress

要将 nginx `Service` 暴露到公共互联网，请创建一个带有 `tailscale.com/funnel: "true"` 注解的 `Ingress` 资源。

创建一个名为 `nginx-ingress.yaml` 的文件：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-funnel-ingress
  annotations:
    # 为该 Ingress 启用 Tailscale Funnel
    tailscale.com/funnel: "true"
spec:
  ingressClassName: tailscale
  defaultBackend:
    service:
      name: nginx-service
      port:
        number: 80
  tls:
    - hosts:
        - nginx-public
```

应用该 `Ingress`：

```shell
kubectl apply -f nginx-ingress.yaml
```

## 访问你的服务

operator 会配置一个 Tailscale Service 和若干代理，将流量路由到你的 nginx 应用。你可以在 `Ingress` 资源的 ADDRESS 字段中找到 MagicDNS 名称：

```shell
kubectl get ingress nginx-funnel-ingress
```

输出大致如下：

```
NAME               CLASS       HOSTS   ADDRESS                     PORTS   AGE
nginx-ha-ingress   tailscale   *       nginx-public.tailxxxxx.ts.net   80     1m
```

ADDRESS 字段填充 MagicDNS 名称后，你就可以从 tailnet 之外的设备（例如使用蜂窝数据的手机）访问它。

## 进一步探索

* 在 [Tailscale Funnel 示例][docs-funnel-examples]中查找实用配置与部署模式。
* 在 [Funnel CLI 参考][docs-funnel-cli]中查找详细的命令语法、标志和用法信息。
* 使用 [Tailscale Kubernetes Operator][docs-k8s-operator] 在 Kubernetes 中部署和管理 Tailscale。

[docs-funnel]: /docs/features/tailscale-funnel

[docs-funnel-cli]: /docs/reference/tailscale-cli/funnel

[docs-funnel-examples]: /docs/reference/examples/funnel

[docs-ingress-permissions]: /docs/kubernetes-operator/reference/rbac

[docs-k8s-operator]: /docs/kubernetes-operator
