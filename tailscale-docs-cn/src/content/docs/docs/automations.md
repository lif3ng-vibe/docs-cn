---
title: "自动化"
description: "使用基础设施即代码（IaC）provider、webhook 和其他集成来自动化你的 tailnet。"
---

最后验证于 Dec 14, 2025

使用官方的基础设施即代码（IaC）provider、Tailscale 应用编程接口（API）、webhook 和各种集成，简化并[自动化你的 Tailscale 工作流][ln-tailscale-iac]。

## 基础设施即代码（IaC）

[基础设施即代码（IaC）][docs-iac] 是一种通过机器可读的定义文件来管理基础设施的方法，无需依赖物理硬件或交互式配置工具。Tailscale 为 Terraform 和 Pulumi 提供了官方 provider，让你可以调用 [Tailscale API][docs-api] 来管理各种 Tailscale 资源，例如访问控制策略、设备、nameserver 以及其他配置。

[**使用 Terraform 管理 Tailscale 资源**](/docs/integrations/terraform-provider) —— 使用 Terraform Tailscale provider 调用 Tailscale API。

[**使用 Pulumi 管理 Tailscale 资源**](/docs/integrations/pulumi-provider) —— 使用 Pulumi Tailscale provider 调用 Tailscale API。

## API

Tailscale 提供 API，让你能够将网络的各个环节自动化。

[**Tailscale API**](/docs/reference/tailscale-api) —— 探索 Tailscale 应用编程接口（API）。

## Webhooks

webhook 让你可以订阅 Tailscale 网络上的特定事件，并通过集成或应用处理事件通知。

[**Webhooks**](/docs/features/webhooks) —— 设置一个 webhook，接收 Tailscale 网络上的事件通知。

## GitOps

面向 Tailscale 的 [GitOps][xt-opengitops] 是一种替代方案，无需使用管理控制台来管理 [访问控制策略][docs-access-control] 和 [tailnet 策略文件][docs-tailnet-policy-file]。

[**使用 Bitbucket 实现 Tailscale 的 GitOps**](/docs/integrations/bitbucket/gitops) —— 使用 Bitbucket CI 以代码方式维护你的 tailnet 策略文件。

[**使用 GitLab CI 实现 Tailscale 的 GitOps**](/docs/integrations/gitlab/gitops) —— 使用 GitLab CI 以代码方式维护你的 tailnet 策略文件。

[**使用 GitHub Actions 实现 Tailscale 的 GitOps**](/docs/integrations/github/gitops) —— 使用 GitHub Action 以代码方式维护你的 tailnet 策略文件。

## 适用于 macOS 和 iOS 的 Tailscale 快捷指令

Tailscale 与 macOS 和 iOS 上的"快捷指令"（Shortcuts）应用配合工作，提供多个内置的快捷指令操作，让你可以把任务自动化。例如，你可以创建快捷指令来将设备连接到 tailnet、使用出口节点（exit node），或切换用户账户。

[**macOS 和 iOS 快捷指令**](/docs/features/mac-ios-shortcuts) —— 了解 Tailscale 如何与"快捷指令"应用配合工作，让你可以把任务自动化。

[docs-access-control]: /docs/features/access-control

[docs-api]: /docs/reference/tailscale-api

[docs-iac]: /docs/integration-infrastructure-as-code

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[ln-tailscale-iac]: https://tailscale.com/learn/provision-manage-and-query-tailscale-resources-programmatically-as-code

[xt-opengitops]: https://opengitops.dev
