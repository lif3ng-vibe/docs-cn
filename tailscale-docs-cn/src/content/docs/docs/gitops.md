---
title: "面向 Tailscale 的 GitOps"
description: "使用 GitOps 以代码方式维护你的 tailnet 策略文件。"
---

最后验证于 May 2, 2025

> **注意：** 面向 Tailscale 的 GitOps 适用于[所有套餐](https://tailscale.com/pricing)。

面向 Tailscale 的 [GitOps][xt-opengitops] 是一种替代方案，无需使用管理控制台来管理 [访问控制策略][docs-access-control] 和 [tailnet 策略文件][docs-tailnet-policy-file]。使用 GitOps 有几个独特的优势：你可以为 tailnet 策略文件充分利用 Git 版本控制的各种好处，例如维护多个版本、审计提交，以及采用配置即代码的方法。

你还可以要求在合并更改前进行评审、在 tailnet 策略文件发生更改时自动触发测试，并将通过验证的更改自动应用到策略文件。

使用 GitOps 时，当你用 Git 推送或拉取更改，Tailscale 会自动校验 tailnet 策略文件的更改。

面向 Tailscale 的 GitOps 可与 Bitbucket、GitHub Actions 和 GitLab CI 配合使用。浏览以下主题，了解如何启用、禁用和管理面向 Tailscale 的 GitOps：

[**使用 Bitbucket 实现 Tailscale 的 GitOps**](/docs/integrations/bitbucket/gitops) —— 使用 Bitbucket CI 以代码方式维护你的 tailnet 策略文件。

[**使用 GitHub Actions 实现 Tailscale 的 GitOps**](/docs/integrations/github/gitops) —— 使用 GitHub Action 以代码方式维护你的 tailnet 策略文件。

[**使用 GitLab CI 实现 Tailscale 的 GitOps**](/docs/integrations/gitlab/gitops) —— 使用 GitLab CI 以代码方式维护你的 tailnet 策略文件。

[docs-access-control]: /docs/features/access-control

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-opengitops]: https://opengitops.dev
