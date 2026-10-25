---
title: "CoreWeave 最佳实践"
description: "本文详细介绍将 Tailscale 与 CoreWeave 结合使用的最佳实践，尤其是使用 Tailscale Kubernetes Operator 连接 [CoreWeave Kubernetes Service (CKS)][xt-coreweave-cks] 集群的场景。"
---

最后验证于 Aug 21, 2026

本文详细介绍将 Tailscale 与 CoreWeave 结合使用的最佳实践，尤其是使用 Tailscale Kubernetes Operator 连接 [CoreWeave Kubernetes Service (CKS)][xt-coreweave-cks] 集群的相关实践。

## 使用 Tailscale Kubernetes Operator 的 CoreWeave 分支版本

CoreWeave 维护着自己的 [Tailscale Kubernetes Operator][docs-kubernetes-operator] 构建版本，以便与 CKS 干净地集成：一个专门定制的 `tailscale-operator` Helm chart，搭配 CoreWeave 专用的容器镜像。在 CKS 上运行时，请部署 CoreWeave 的分支版本，而不要使用上游 Helm chart。

> **注意：**
>
> 设置说明请参阅 CoreWeave 的 [`tailscale-operator`文档][xt-coreweave-tailscale-operator]。

chart 定制内容的详情请参阅[部署 `tailscale-operator` chart][xt-coreweave-deploy-chart]。

## 网络与连接

CoreWeave 节点没有公网 IP 地址，且位于[硬 NAT][docs-device-connectivity-hard-nat] 之后，这会阻碍节点间的[直连][docs-connection-types]，并降低带宽与连接稳定性。要优化连接：

* 在 tailnet 的 `derpMap` 配置中，与 Tailscale 默认中继一起（或作为其替代）加入 [CoreWeave 的 DERP 服务器][xt-coreweave-derpmap]，以获得进入 CoreWeave 网络的最佳连接。
* 在网络中部署并配置带公网 IP 地址的[对等中继（peer relay）][docs-peer-relays]，并放行发往中继端口的入站 UDP 流量，以支持经由 CoreWeave NAT 网关的连接。

[docs-connection-types]: /docs/reference/connection-types

[docs-device-connectivity-hard-nat]: /docs/reference/device-connectivity#hard-nat

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-peer-relays]: /docs/features/peer-relay

[xt-coreweave-cks]: https://docs.coreweave.com/products/cks

[xt-coreweave-deploy-chart]: https://docs.coreweave.com/products/cks/auth-access/tailscale-operator#install-the-tailscale-helm-chart

[xt-coreweave-derpmap]: https://docs.coreweave.com/products/cks/auth-access/tailscale-operator#combined-policy-example

[xt-coreweave-tailscale-operator]: https://docs.coreweave.com/products/cks/clusters/coreweave-charts/tailscale-operator
