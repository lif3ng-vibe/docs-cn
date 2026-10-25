---
title: "Tailscale PAM 连接器"
description: "查找 Border 连接器文档，包括设置指南、概念说明和配置参考。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

Tailscale PAM 融合了 VPN 与特权访问管理（PAM）能力，为访问 Tailscale 网络（即 tailnet）中的私有资源提供了安全且具备身份感知的方式。这一架构的核心是连接器（connector），它在保护和管理访问方面发挥着关键作用。你使用连接器把你的[服务][docs-pam-services]连接到源站（origin）。

连接器的关键功能包括：

* 面向 PAM 的应用感知身份代理，支持对私有资源的细粒度、身份感知访问。它在你的 tailnet 客户端与 SSH、数据库、Kubernetes 等 tailnet 服务之间建立会话。
* VPN 网关，确保访问安全，且不把资源暴露到互联网。
* 协议感知服务，支持会话录制、策略验证和密钥管理。

使用以下指南了解 Tailscale PAM 连接器，并配置连接器为 tailnet 中的资源提供身份感知访问。

[**Tailscale PAM 连接器概览**](/docs/privileged-access-management/connectors/overview)——了解 Tailscale PAM 连接器如何实现对 Tailscale 网络中资源的特权访问。

[**安装 Tailscale PAM 连接器**](/docs/privileged-access-management/connectors/install)——设置 Tailscale PAM 连接器，为用户提供对 Tailscale 网络中资源的特权访问。

[**使用 Ansible 安装 Tailscale PAM 连接器**](/docs/privileged-access-management/connectors/install-ansible)——使用 Ansible 在一台或多台主机上安装并配置 Tailscale PAM 连接器。

[**Tailscale PAM 连接器高可用**](/docs/privileged-access-management/connectors/high-availability)——了解何时应部署高可用连接器，以便在把用户连接到服务时应对单个连接器故障。

[**Tailscale PAM 故障排查**](/docs/privileged-access-management/reference/troubleshooting)——Tailscale PAM 连接器的常见错误情况、成因及解决步骤。

[docs-pam-services]: /docs/privileged-access-management/services
