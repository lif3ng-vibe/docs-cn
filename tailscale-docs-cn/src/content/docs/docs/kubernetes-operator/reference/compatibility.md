---
title: "Tailscale Kubernetes Operator 的兼容性"
description: "本主题介绍 Tailscale Kubernetes Operator 的版本支持、基础设施要求及其他兼容性信息。"
---

最后验证于 Jun 5, 2026

本主题介绍 Tailscale Kubernetes Operator 的版本支持、基础设施要求及其他兼容性信息。

## 版本支持

以下各节介绍 Operator 与 Kubernetes 的版本兼容性。

### Operator 与代理

Tailscale 建议为 operator 与代理使用相同版本，以与 Tailscale 的测试环境保持一致。

* **向后兼容**：operator 支持代理所运行的 Tailscale 版本最多比 operator 版本早四个次版本。
* **向前兼容**：operator 不支持代理所运行的 Tailscale 版本比 operator 版本更新。

### Kubernetes 版本

支持的最早 Kubernetes 版本为 v1.23.0。

## 基础设施与网络

### CNI 兼容性

operator 创建的代理只会在每个代理 `Pod` 的网络命名空间内配置自定义路由与转发规则。由于代理功能是在代理 `Pod` 的命名空间内实现的，`Node` 上的路由与防火墙配置（例如使用 iptables、eBPF 或任何其他机制）不会影响这些代理。因此，operator 开箱即用即可配合大多数容器网络接口（CNI）配置工作。不过，某些特定配置存在一些已知问题。

#### Cilium（kube-proxy replacement 模式）

如果在启用套接字负载均衡的情况下以 kube-proxy replacement 模式运行 Cilium，从 `Pod` 到 `ClusterIP` 的连接会绕过附加在 netfilter 钩子上的 Tailscale 防火墙规则。

如果你打算执行以下操作，必须启用 **绕过 Pod 命名空间中的套接字负载均衡器**：

* 将 Kubernetes `Service` 暴露为 Tailscale LoadBalancer `Service`。
* 使用 `tailscale.com/expose` 注解暴露 Kubernetes `Service`。
* 使用 `Connector` 暴露 `Service` CIDR 范围。

> **注意：**
>
> 如果遇到带宽问题，请使用 `--devices` 标志显式指定 Cilium 应针对哪些网络接口监控 MTU，以免 Cilium 默认采用 `tailscale0` 接口的 MTU。

## 云服务商专属事项

### EKS Fargate

由于特权容器与 `CAP_NET_ADMIN` 受限，EKS Fargate 上的支持有限。

EKS Fargate 支持以下功能：

* Tailscale `Ingress`
* Tailscale API server 代理

EKS Fargate 不支持以下功能：

* Tailscale 入站 `Service`
* Tailscale 出站 `Service`
* `Connector` 配置

## 证书与维护

### TLS 证书与续期

operator 会为 Tailscale Ingress 与 API server 代理服务自动置备 TLS 证书。

* **有效期**：90 天。
* **续期窗口**：通常出现在有效期的三分之二处。
* **条件**：只有服务存在活跃流量时才会续期。
* **过期处理**：如果证书过期，对服务的下一个请求会自动触发续期。
