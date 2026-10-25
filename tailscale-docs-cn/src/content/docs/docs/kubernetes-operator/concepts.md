---
title: "Tailscale Kubernetes Operator 核心概念"
description: "了解 Tailscale Kubernetes Operator 的架构和关键资源。"
---

最后验证于 Jun 5, 2026

了解 Tailscale Kubernetes Operator 背后的核心概念与架构，包括它管理的自定义资源以及这些资源如何协同工作。

* [Tailscale Kubernetes Operator 架构](/docs/kubernetes-operator/concepts/architecture)——Tailscale Kubernetes Operator 的架构与设计。

* [使用 DNSConfig 实现集群内 MagicDNS 解析](/docs/kubernetes-operator/concepts/dnsconfig)——了解 DNSConfig 自定义资源，以及它如何支持在集群内解析 Tailscale MagicDNS 名称。

* [使用 ProxyClass 自定义代理](/docs/kubernetes-operator/concepts/proxyclass)——了解 ProxyClass 自定义资源，以及它如何自定义代理资源。

* [使用 ProxyGroup 实现高可用代理](/docs/kubernetes-operator/concepts/proxygroup)——了解 ProxyGroup 自定义资源，以及它如何实现高可用代理。
