---
title: "AI 基础设施访问"
description: "安全访问网络中的 AI 基础设施、GPU 集群与私有 LLM 部署。"
---

最后验证于 May 18, 2026

Tailscale 在 GPU 集群、模型服务器与开发环境之间提供私有的加密连接，帮助团队保护 AI 基础设施的安全。无论你是在多个云端运行 AI 工作负载，还是自托管 LLM，Tailscale 都能确保只有经过授权的用户和服务才能访问你的 AI 资源。

## 常用工作流

[**连接推理与训练服务器**](/docs/use-cases/ai-infrastructure-access/connect-inference-servers)——使用标签（tag）和认证密钥（auth key），让 GPU 与推理服务器以基于身份的方式接入你的 tailnet，支持多租户隔离与容器化工作负载。

[**集中管理 LLM 访问与支出**](/docs/use-cases/ai-infrastructure-access/centralize-llm-access-and-spending)——将所有 LLM 请求统一经由单个网关，消除 API 密钥泛滥问题，跟踪每用户的支出，并对开发者、agent 与 CI/CD 流水线统一实施访问控制。

[**保护你的 AI 训练集群**](/docs/use-cases/ai-infrastructure-access/secure-ai-training-cluster)——将 Kubernetes API 服务器从公网移除，并对 AI 训练集群操作强制实施基于身份的访问、会话录制与设备态势（device posture）检查。
