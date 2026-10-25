---
title: "在集群中启用 MagicDNS 解析"
description: "默认情况下，Kubernetes 集群中的 pod 无法解析 Tailscale MagicDNS 名称（`.ts.net`）。如果你的出站目标使用 HTTPS，TLS 证书是针对 MagicDNS 名称签发的。例如，`my"
---

最后验证于 Jun 5, 2026

默认情况下，Kubernetes 集群中的 pod 无法解析 Tailscale MagicDNS 名称（`.ts.net`）。如果你的出站目标使用 HTTPS，TLS 证书是针对 MagicDNS 名称签发的，例如 `my-database.<tailnet>.ts.net`，你的工作负载需要使用该名称连接，证书验证才能成功。

本指南介绍如何部署 [DNSConfig][docs-dnsconfig] 资源，以支持在集群内解析 `.ts.net` 名称。

## 前提条件

开始之前，请确保你已具备以下条件：

* 已[安装][docs-k8s-install] Tailscale Kubernetes Operator。
* 已为你要访问的 tailnet 设备配置出站代理。请参阅[访问 Tailscale Service][docs-access-service]。

## 部署 DNSConfig 资源

创建一个 `DNSConfig` 资源来部署集群内名称服务器：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: DNSConfig
metadata:
  name: ts-dns
spec:
  nameserver:
    image:
      repo: tailscale/k8s-nameserver
      tag: unstable
```

将清单应用到集群：

```shell
kubectl apply -f dnsconfig.yaml
```

## 获取名称服务器 IP

名称服务器运行后，它的 `ClusterIP` 会写入 `DNSConfig` 状态：

```shell
kubectl get dnsconfig ts-dns -o jsonpath='{.status.nameserver.ip}'
```

## 配置 CoreDNS

在 CoreDNS 配置中添加一个 stub domain，让 `.ts.net` 查询转发给 Tailscale 名称服务器。

编辑 CoreDNS 的 `ConfigMap`：

```shell
kubectl edit configmap coredns -n kube-system
```

添加一个 `ts.net` server 块，转发到上一步获取的名称服务器 IP：

```
ts.net:53 {
    errors
    cache 30
    forward . <nameserver-ip>
}
```

重启 CoreDNS 以应用更改：

```shell
kubectl rollout restart deployment coredns -n kube-system
```

> **注意：**
>
> 如果你的集群使用 `kube-dns` 而非 CoreDNS（例如某些 GKE 配置），stub domain 配置请参阅 [GKE 文档][xt-gke-kube-dns]。

## 验证名称解析

测试 `.ts.net` 名称能否在集群内解析：

```shell
kubectl run -it --rm dns-test --image=busybox -- nslookup <device>.<tailnet>.ts.net
```

将 `<device>.<tailnet>.ts.net` 替换为一台已配置出站代理的 tailnet 设备的 MagicDNS 名称。如果查询返回出站代理 pod 的 IP，说明 MagicDNS 解析已生效。

## 进一步探索

* [了解 DNSConfig 资源][docs-dnsconfig]，理解集群内名称服务器如何解析 MagicDNS 名称。
* [访问 Tailscale Service][docs-access-service]，从集群中通过出站代理访问 tailnet 设备。

[docs-access-service]: /docs/kubernetes-operator/egress/access-tailnet-service

[docs-dnsconfig]: /docs/kubernetes-operator/concepts/dnsconfig

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[xt-gke-kube-dns]: https://docs.cloud.google.com/kubernetes-engine/docs/concepts/kube-dns#customize-kube-dns
