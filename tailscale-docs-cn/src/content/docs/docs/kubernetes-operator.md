---
title: "Tailscale Kubernetes Operator"
description: "Tailscale Kubernetes Operator 为进出你的 Kubernetes 集群提供安全连接。"
---

最后验证于 Jun 5, 2026

> **注意：** Tailscale Kubernetes Operator 适用于[所有套餐](https://tailscale.com/pricing)。

Tailscale Kubernetes Operator 提供一种 Kubernetes 原生的方式，借助 Tailscale 确保进出集群的连接安全。

使用 Kubernetes Operator，你可以：

* 通过在 tailnet 上暴露 Kubernetes 控制平面，启用安全、私有的 Kubernetes API 访问。管理员和自动化系统可以从任何地方管理集群，无需开放公共端点、配置 VPN 或维护复杂的网络访问控制。
* 把 tailnet 中的设备连接到 Kubernetes 工作负载（入站流量，ingress），为集群内运行的应用和服务提供安全访问。应用、开发者和最终用户可以使用 Tailscale 身份和策略安全地访问工作负载。
* 把 Kubernetes 工作负载连接到 tailnet 中的其他设备和服务（出站流量，egress），让集群中运行的应用能够与私有网络中的笔记本电脑、服务器、数据库和云资源安全通信。这会形成一个统一的连接层，同时不把服务暴露给公共互联网。
* 通过 tailnet 路由跨越 Kubernetes 环境、区域和云提供商的[多集群流量][docs-operator-multi-cluster-ingress]。在保持一致的安全策略和基于身份的访问控制的同时，实现跨集群通信、服务到服务的连接以及混合部署。
* 录制并审计 Kubernetes 会话，满足合规与安全要求，并详细掌握管理活动。通过集中式的录制和监控能力，捕获会话数据、维护审计轨迹，并满足监管、治理和取证需求。
* 在 Kubernetes 中托管 Tailscale 基础设施组件，包括会话[录制器][docs-operator-tsrecorder]、[出口节点][docs-operator-connector]和[子网路由器][docs-operator-connector]。

*（图：展示 Tailscale Kubernetes Operator 架构的示意图——Kubernetes 集群内的 Ingress 代理、Egress 代理、API 服务器代理和 operator，与 tailnet 中的 Tailscale 设备相连。）*

## 探索文档

查找 Tailscale Kubernetes Operator 的指南、概念和参考资料。

[**Tailscale Kubernetes Operator 快速开始教程**](/docs/kubernetes-operator/quickstart) —— 一份关于 Tailscale Kubernetes Operator 及其关键功能的实操指南。

[**Tailscale Kubernetes Operator 概念解析**](/docs/kubernetes-operator/concepts) —— 了解 Tailscale Kubernetes Operator 的架构和关键资源。

[**使用 Ingress 将集群工作负载暴露给你的 tailnet**](/docs/kubernetes-operator/ingress) —— 使用 Tailscale Kubernetes Operator 将 Kubernetes 工作负载暴露给你的 tailnet 或互联网。

[**使用 Egress 从集群访问 tailnet 资源**](/docs/kubernetes-operator/egress) —— 使用 Tailscale Kubernetes Operator 从 Kubernetes 集群访问 tailnet 资源。

[**使用 Connector 在 Kubernetes 中托管 Tailscale 资源**](/docs/kubernetes-operator/connector) —— 使用 Connector 资源在 Kubernetes 上部署子网路由器和出口节点。

[**通过 Tailscale 访问 Kubernetes API 服务器**](/docs/kubernetes-operator/api-server-access) —— 通过 Tailscale 安全地访问 Kubernetes API 服务器。

[**使用 Tailscale Kubernetes Operator 进行会话录制**](/docs/kubernetes-operator/recorder) —— 使用 Tailscale Kubernetes Operator 部署并配置会话录制。

[**管理与配置 Tailscale Kubernetes Operator**](/docs/kubernetes-operator/manage-and-configure) —— 管理和配置你的 Tailscale Kubernetes Operator 集群。

[**Tailscale Kubernetes Operator 参考**](/docs/kubernetes-operator/reference) —— Tailscale Kubernetes Operator 的参考文档。

[docs-operator-connector]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-operator-multi-cluster-ingress]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-operator-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder
