---
title: "管理和配置 Tailscale Kubernetes Operator"
description: "管理并配置你的 Tailscale Kubernetes Operator 集群。"
---

最后验证于 Jun 5, 2026

* [为集群添加静态端点](/docs/kubernetes-operator/manage-and-configure/configure-static-endpoints) — 为 ProxyGroup 代理配置静态端点以启用直连。

* [为 Tailscale Kubernetes Operator 配置工作负载身份联合](/docs/kubernetes-operator/manage-and-configure/workload-identity-federation) — 使用工作负载身份联合，让 Tailscale Kubernetes Operator 无需存储长期凭证或密钥即可安全访问云资源。

* [控制对 ProxyGroup 资源的访问](/docs/kubernetes-operator/manage-and-configure/proxy-group-policy) — 创建按命名空间限制 ProxyGroup 资源访问的策略

* [启用 Operator 调试端点](/docs/kubernetes-operator/manage-and-configure/enable-debug-endpoints) — 为 Tailscale Kubernetes Operator 代理启用调试端点。

* [公开 Operator 指标](/docs/kubernetes-operator/manage-and-configure/expose-metrics) — 从 Tailscale Kubernetes Operator 代理公开客户端指标。

* [Tailscale Kubernetes Operator 的高可用](/docs/kubernetes-operator/manage-and-configure/high-availability) — 为高可用的入站、出站和 API 服务器代理配置 ProxyGroup 和 ProxyClass。

* [Kubernetes Operator 的 Let's Encrypt 速率限制](/docs/kubernetes-operator/manage-and-configure/lets-encrypt-rate-limits) — 了解随着使用量增长，Let's Encrypt 速率限制如何影响 Tailscale Kubernetes Operator，以及如何让证书签发和续期保持在限额之内。

* [为入站和出站代理使用自定义机器名](/docs/kubernetes-operator/manage-and-configure/custom-machine-names) — 为 Tailscale Kubernetes Operator 的入站和出站代理使用自定义机器名。

* [为运行在 Kubernetes 上的设备使用多个 tailnet](/docs/kubernetes-operator/manage-and-configure/multi-tailnet) — 使用 Tailscale Kubernetes Operator 把设备部署到多个 tailnet

[**使用 ArgoCD 管理多集群 Kubernetes 部署**](/docs/solutions/manage-multi-cluster-kubernetes-deployments-argocd) — 使用 Tailscale 私有网络连接跨区域的集群，用 ArgoCD 搭建安全的多集群 Kubernetes 管理，无需复杂的网络配置。
