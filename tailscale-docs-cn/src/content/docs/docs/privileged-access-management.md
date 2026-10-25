---
title: "Tailscale PAM"
description: "用 Tailscale PAM 治理并保护特权访问。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

Tailscale PAM 是新一代特权访问管理（PAM）方案，为你的 Tailscale 网络中的资源提供应用感知的访问。Tailscale PAM 利用 [Tailscale 的身份层][docs-tailscale-identity]，为 Linux 服务器、数据库、Kubernetes 集群等提供安全访问。它在访问发生的时刻治理特权会话，并在适用的场景下提供完整的会话审计与会话录制。

探索以下主题，了解 Tailscale PAM 的功能，以及如何开始治理对 tailnet 中资源的特权访问。

[**什么是 Tailscale PAM**？](/docs/privileged-access-management/what-is-tailscale-pam)——Tailscale PAM 为你的 Tailscale 网络中的 Linux 服务器、数据库、Kubernetes 集群等资源提供特权的、可审计的访问。

[**Tailscale PAM 架构与核心概念**](/docs/privileged-access-management/architecture-and-concepts)——概览 Tailscale PAM 的架构与核心概念。

[**开始使用 Tailscale PAM**](/docs/privileged-access-management/get-started)——注册 Tailscale PAM，并用它为你的 Tailscale 网络中的资源提供特权访问。

[**Tailscale PAM 操作指南**](/docs/privileged-access-management/how-to)——配置 Tailscale PAM 为你的服务提供特权访问的分步指南。

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
