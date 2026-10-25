---
title: "跨集群连接服务"
description: "你可以将 Tailscale Kubernetes Operator 的[集群入站][docs-ingress]与[集群出站][docs-egress]结合使用，把一个集群中的 `Service` 公开到另一个集群。将集群 A 中的 `Servic"
---

最后验证于 Jun 5, 2026

你可以将 Tailscale Kubernetes Operator 的[集群入站][docs-ingress]与[集群出站][docs-egress]结合使用，把一个集群中的 `Service` 公开到另一个集群：先通过入站把集群 A 中的 `Service` 公开到 tailnet，再从集群 B 通过出站连接到它。

对于需要跨多个集群管理部署的 GitOps 工作流，请参阅[使用 ArgoCD 跨集群部署][docs-argocd]。

## 工作原理

1. 使用[入站][docs-ingress]在集群 A 中公开你想访问的 `Service`。
2. 在集群 B 中创建一个出站 `Service`，连接到集群 A 中所公开 `Service` 的 tailnet 地址。详情请参阅[出站指南][docs-egress]。

这会在集群 B 内创建集群 A `Service` 的镜像，集群 B 中的工作负载可以像访问普通 Kubernetes `Service` 一样访问它。

[docs-argocd]: /docs/solutions/manage-multi-cluster-kubernetes-deployments-argocd

[docs-egress]: /docs/kubernetes-operator/egress

[docs-ingress]: /docs/kubernetes-operator/ingress
