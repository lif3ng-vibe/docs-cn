---
title: "将集群工作负载暴露给你的 tailnet（第 3 层）"
description: "本指南介绍如何使用 Tailscale Kubernetes Operator 的第 3 层（L3）Ingress 功能，将运行在 Kubernetes 集群中的服务暴露给你的 tailnet。你可以用它向 tailnet 暴露非 HTTP 工作负载"
---

最后验证于 Jun 5, 2026

本指南介绍如何使用 Tailscale Kubernetes Operator 的第 3 层（L3）Ingress 功能，将运行在 Kubernetes 集群中的服务暴露给你的 tailnet。你可以用它向 tailnet 暴露非 HTTP 工作负载，且无需[为 tailnet 启用 HTTPS][docs-https-setup]。你将使用一个 `ProxyGroup` 和一个 Kubernetes `Ingress` 资源来创建多个入站代理，即使其中一个代理发生故障，你的服务仍能保持可用。

## 前提条件

* 已[安装][docs-k8s-install] Tailscale Kubernetes Operator。
* 已配置 [L3 Ingress 所需的权限][docs-k8s-permissions]。

## 创建 ProxyGroup

创建一个 `ProxyGroup`。这个自定义资源管理一组用于入站的 Tailscale 代理。

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

将此清单应用到集群：

```shell
kubectl apply -f ingress-proxygroup.yaml
```

这会创建一个名为 `ingress-proxies`、含两个副本的 `ProxyGroup`。operator 会在 `tailscale` 命名空间中创建一个具有 2 个副本的 `StatefulSet`。

## 部署示例应用

部署一个 nginx 应用。这就是要暴露的应用程序。

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
```

将此清单应用到集群：

```shell
kubectl apply -f nginx-deployment.yaml
```

## 使用 L3 Ingress 暴露服务

创建一个 Kubernetes `Service` 作为 L3 入站入口。通过添加特定注解并设置 `loadBalancerClass`，Tailscale Kubernetes Operator 会自动将其暴露给 tailnet。

*（图：ProxyGroup 入站架构图。StatefulSet 中的多个代理 pod 副本通过共享的 Tailscale Service 将 Kubernetes Service 暴露给 tailnet。）*

### 创建 Kubernetes service

创建一个名为 `nginx-service.yaml` 的文件，内容为以下配置：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  annotations:
    # 将 Service 关联到 ProxyGroup
    tailscale.com/proxy-group: ingress-proxies
    # 为 Tailscale Service 设置 MagicDNS 主机名
    tailscale.com/hostname: nginx
spec:
  selector:
    app: nginx
  ports:
    - name: http
      port: 80
      targetPort: 80
  type: LoadBalancer
  loadBalancerClass: tailscale
```

### 配置说明

以下注解和字段用于配置 L3 Ingress 行为：

* `tailscale.com/proxy-group`：这个注解告诉 operator 让流量经由 `ingress-proxies` `ProxyGroup` 路由。
* `tailscale.com/hostname`：定义 Tailscale Service 的 MagicDNS 名称中的主机名。例如 `nginx.foobar.ts.net`。
* `loadBalancerClass: tailscale`：指示 operator 将这个 Kubernetes `Service` 暴露给 tailnet。

将此清单应用到集群：

```shell
kubectl apply -f nginx-service.yaml
```

## 访问你的服务

operator 会创建一个与所配置主机名匹配的 Tailscale Service，并配置 `ProxyGroup` 通告它。`ProxyGroup` 还会将请求路由到 `nginx-service` Kubernetes `Service`。

你可以在 `Service` 资源的 `ADDRESS` 字段中找到绑定到 `nginx-service` Kubernetes `Service` 的 Tailscale IP 地址：

```shell
kubectl get service nginx-service
```

输出会显示在 `EXTERNAL-IP` 列中并带有一个 IP 地址：

```
NAME            TYPE           CLUSTER-IP       EXTERNAL-IP       PORT(S)        AGE
nginx-service   LoadBalancer   34.118.238.206   100.102.116.165   80:30162/TCP   3m26s
```

`EXTERNAL-IP` 字段填充 Tailscale IP 地址后，你就可以从 tailnet 中的任何设备访问你的 nginx `Service`——连接该 Tailscale IP 地址的 `80` 端口即可。流量会在两个代理 pod 之间负载均衡。

例如，你可以从一台 Tailscale 设备使用 `curl` 访问该 `Service`：

```shell
curl http://100.x.x.x:80
```

你也可以使用配置好的 MagicDNS 名称访问该 `Service`：

```shell
curl http://nginx.<tailnet>.ts.net:80
```

更多信息请参阅[将集群工作负载暴露给你的 tailnet（第 7 层）][docs-k8s-expose-l7]。

[docs-k8s-expose-l7]: /docs/kubernetes-operator/ingress/expose-workload-to-tailnet-l7

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-k8s-permissions]: /docs/kubernetes-operator/reference/rbac

[docs-https-setup]: /docs/how-to/set-up-https-certificates
