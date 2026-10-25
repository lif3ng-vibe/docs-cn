---
title: "使用 DNSConfig 实现集群内 MagicDNS 解析"
description: "`DNSConfig` 是一个集群级自定义资源，用于支持在集群内解析 Tailscale MagicDNS 名称。"
---

最后验证于 Oct 8, 2026

`DNSConfig` 是一个集群级（cluster-scoped）自定义资源，用于支持在集群内解析 Tailscale MagicDNS 名称。

当你使用集群出站代理或 Tailscale `Ingress` 时，你的服务就可以通过各自的 MagicDNS 名称访问，例如 `my-service.example.ts.net`。

默认情况下，Kubernetes 集群内的 pod 无法解析这些 `.ts.net` 域名。`DNSConfig` 资源可以解决这个问题：

* **部署名称服务器**：它在集群内创建一个专用的名称服务器。
* **简化连接**：让集群内的工作负载使用熟悉的 DNS 名称（而非静态 IP 地址）访问 tailnet 设备。

## 示例

以下清单会设置 Tailscale 名称服务器：

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

## 从私有镜像仓库拉取名称服务器镜像

如果你将名称服务器镜像托管在私有镜像仓库中，可以在 `spec.nameserver.pod.imagePullSecrets` 中引用一个镜像拉取 Secret。Operator 会将名称服务器部署在自己的命名空间中（默认为 `tailscale`），因此请在该命名空间中创建 Secret。有关如何创建镜像拉取 Secret 的详细信息，请参阅 [Kubernetes 文档][xt-k8s-private-registry]。该字段要求 Tailscale Kubernetes Operator 版本 1.104 或更高。

以下清单通过名为 `regcred` 的 Secret 拉取名称服务器镜像：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: DNSConfig
metadata:
  name: ts-dns
spec:
  nameserver:
    image:
      repo: registry.example.com/tailscale/k8s-nameserver
      tag: unstable
    pod:
      imagePullSecrets:
        - name: regcred
```

## 工作原理

创建 `DNSConfig` 资源后，Tailscale Kubernetes Operator 会部署一个名称服务器，并动态更新以下记录：

* **集群出站**：将 tailnet 设备的 MagicDNS 名称映射到集群内出站代理 pod 的 IP。
* **Tailscale Ingress**：将 `Ingress` 资源的 MagicDNS 名称映射到集群内入站代理 pod 的 IP。

> **注意：**
>
> 要让 Tailscale Ingress 的 MagicDNS 解析在集群内生效，`Ingress` 资源还必须添加注解 `tailscale.com/experimental-forward-cluster-traffic-via-ingress`，以确保代理监听其 pod IP 地址。

## 与 CoreDNS 集成

为此，需要将集群的主 DNS 解析器（CoreDNS）配置为把 `.ts.net` 域的请求转发给新的名称服务器。在 CoreDNS 的 `ConfigMap` 中添加一个 stub domain 配置。详情请参阅 [Kubernetes 文档][xt-k8s-coredns-stub]。

部署完成后，名称服务器的 Service IP 会写入 `dnsconfig.status.nameserver.ip`。

> **注意：**
>
> `DNSConfig` 是单例资源：一个集群中只能存在一个。

## 进一步探索

* [访问 Tailscale Service][docs-access-service]，从集群中通过 MagicDNS 名称、经由出站代理访问 tailnet 服务。

[docs-access-service]: /docs/kubernetes-operator/egress/access-tailnet-service

[xt-k8s-coredns-stub]: https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/#configuration-of-stub-domain-and-upstream-nameserver-using-coredns

[xt-k8s-private-registry]: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry
