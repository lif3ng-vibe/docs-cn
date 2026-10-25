---
title: "技术参考"
description: "探索 Tailscale 工具与功能的参考指南，包括访问控制策略、命令行界面（Tailscale CLI）、API，以及管理 tailnet 的最佳实践。了解访问控制、生产环境策略、安全性与关键术语。"
---

最后验证于 May 7, 2025

这些主题提供 Tailscale 网络（即 tailnet）中 Tailscale 工具与功能的技术参考。

## 访问控制策略

你可以使用访问控制策略，对 tailnet 中的用户、设备和应用强制实施访问规则。

[**tailnet 策略文件语法参考**](/docs/reference/syntax/policy-file)——tailnet 策略文件的语法参考。

[**ACL 策略示例**](/docs/reference/examples/acls)——查看常见场景的 ACL 策略示例。

[**节点属性与授权应用能力对比**](/docs/reference/node-attributes-vs-app-capabilities)——理解一种能力应属于设备还是连接，以及节点属性与授权应用能力的区别。

## Tailscale 命令行界面（CLI）

Tailscale 客户端内置了一个 CLI 工具，你可以用它管理和排查设备在 Tailscale 网络（即 tailnet）中的问题。

[**Tailscale CLI**](/docs/reference/tailscale-cli)——使用 Tailscale 命令行界面（Tailscale CLI）管理和排查你的 tailnet。

## Tailscale 应用编程接口（API）

你可以使用 Tailscale API 自动化并管理 tailnet 的各个方面。

[**Tailscale API**](/docs/reference/tailscale-api)——探索 Tailscale 应用编程接口（API）。

[**OAuth 客户端**](/docs/features/oauth-clients)——使用 OAuth 客户端为 Tailscale API 提供持续访问。

[**tsnet**](/docs/features/tsnet)——使用 tsnet 包将 Tailscale 嵌入 Go 程序。

## 技术概览与生产环境最佳实践

阅读关于 Tailscale 网络、安全性和生产环境最佳实践的深入主题。

[**技术概览**](/docs/concepts)——获取关于 Tailscale 的深入技术细节。

[**生产环境最佳实践**](/docs/reference/best-practices/production)——遵循部署 Tailscale 的生产环境与安全最佳实践。

## 术语与概念

熟悉 Tailscale 的术语与概念。

[**术语与概念**](/docs/reference/glossary)——查阅 Tailscale 的术语与概念。
