---
title: "基础设施访问"
description: "管理对生产服务器、Kubernetes 集群和云环境的安全、可审计的访问。"
---

最后验证于 May 18, 2026

Tailscale 为你的生产基础设施提供安全的最小权限访问，同时不把服务暴露到公网。用加密直连取代 SSH 堡垒机，为合规记录会话，并在多云环境中管理细粒度的访问控制。

## 常用工作流

[**为合规与审计录制 SSH 会话**](/docs/use-cases/infrastructure-access/record-ssh-sessions-compliance)——出于合规与审计目的录制 SSH 会话。

[**管理生产环境的最小权限访问与即时访问**](/docs/use-cases/infrastructure-access/manage-least-privileged-and-jit-access)——使用 Tailscale 标签、授权与临时节点（ephemeral node），对生产基础设施强制实施最小权限与即时访问（JIT）策略。

[**管理多云或多地区云环境的访问**](/docs/use-cases/infrastructure-access/access-multi-cloud-or-multi-region-cloud-envs)——使用 Tailscale 连接 AWS、GCP、Azure 以及本地部署网络中的云 VPC、Kubernetes 集群与远程团队。
