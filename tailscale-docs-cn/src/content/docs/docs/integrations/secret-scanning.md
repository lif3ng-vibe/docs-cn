---
title: "扫描暴露的 Tailscale 密钥"
description: "了解 Tailscale 合作伙伴如何扫描暴露的 Tailscale 密钥并发送通知，帮助防止欺诈性访问。"
---

最后验证于 Jan 5, 2026

Tailscale 提供多种用于自动化和集成的[密钥][docs-key-prefixes]。请将这些密钥视为机密（secret），并安全地加以保管。一旦泄露，有人可能会对你的 Tailscale 网络（即 tailnet）采取有害操作。为帮助减轻意外泄露的影响并防止欺诈性使用，Tailscale 与以下公司合作，对源代码仓库和其他数据源进行机密扫描（secret scanning），以发现泄露的 Tailscale 密钥：

* [GitGuardian][xt-gitguardian]
* [GitHub][xt-github]
* [GitLab][xt-gitlab]
* [TruffleHog][xt-trufflesecurity-trufflehog]

本主题介绍这些公司执行的扫描，以及当他们认为自己发现了暴露的 Tailscale 机密时会采取的行动。

机密扫描涵盖的 Tailscale 密钥类型包括：

* [API 访问令牌][docs-api-authentication]（也称为"API 密钥"）
* [OAuth 客户端][docs-oauth-clients]
* [预认证密钥][docs-auth-keys]（也称为"认证密钥"）
* [跨域身份管理系统（SCIM）密钥][ln-what-is-scim]
* [Webhook 密钥][docs-webhooks-webhook-secret]

如果你收到通知，或以其他方式认为你的某个 Tailscale 密钥已遭泄露，请参阅[密钥与机密管理][docs-key-secret-management]了解建议采取的行动。

> **注意：** 机密扫描适用于[所有套餐](https://tailscale.com/pricing)。

## GitGuardian

[GitGuardian][xt-gitguardian] 会跨你的各个平台扫描泄露的机密。如果它检测到可能的 Tailscale 机密，GitGuardian 会调用一个 Tailscale 端点的 API，以确定该机密是否确实处于活跃状态。如果该机密是活跃的，GitGuardian 会联系其数据源中包含该机密的用户。

GitGuardian 对 Tailscale 端点的 API 调用不会修改你的 tailnet，它只是检查某个机密是否为活跃的 Tailscale 密钥。

GitGuardian 不会将其检测到的任何潜在暴露的 Tailscale 机密通知 Tailscale。

## GitHub

[GitHub][xt-github] 会自动扫描所有公开仓库（包括 issue、pull request、评论和 wiki）以及所有公开的 npm 软件包。如果 GitHub 在这些来源中发现 Tailscale 机密，GitHub 会调用一个 Tailscale 端点的 API，以确定该机密是否为活跃的机密。如果是活跃机密，Tailscale 将撤销该机密，并向泄露机密所属 tailnet 的[安全问题联系人][docs-security-contact]发送电子邮件。

如果你已将 GitHub 配置为扫描你的私有仓库和 issue，并且 GitHub 在这些来源中发现了 Tailscale 机密，GitHub 会调用一个 Tailscale 端点的 API，以确定该机密是否为活跃的机密。如果是活跃机密，Tailscale 将撤销该机密，并向泄露机密所属 tailnet 的安全问题联系人发送电子邮件。此外，GitHub 还会在该 GitHub 仓库的 **Security**（安全）标签页中将泄露的机密报告为告警。GitHub 对私有仓库 issue 的扫描包括扫描未关闭和历史 issue 的标题、描述和评论。

有关 GitHub 机密扫描的更多信息，请参阅 GitHub 的[关于机密扫描][xt-github-secret-scanning]主题。

## GitLab

[GitLab][xt-gitlab] 提供 GitLab Secret Detection 功能，[启用后][xt-gitlab-secret-detection-enable]会扫描 GitLab 仓库中的所有文本文件，以发现泄露的机密。GitLab 使用由 Tailscale 提供的正则表达式（regex）作为泄露机密的扫描标准。如果发现了被认为是 Tailscale 机密的内容，GitLab 会在该 GitLab 仓库的 [GitLab 产物报告（artifact report）][xt-gitlab-artifact-report]中报告泄露的机密。GitLab 不会将其仓库中任何潜在暴露的 Tailscale 机密通知 Tailscale。有关 GitLab 机密扫描的更多信息，请参阅 GitLab 的 [Secret Detection][xt-gitlab-secret-detection] 主题。

## TruffleHog

[TruffleHog][xt-trufflesecurity-trufflehog] 会跨你的各个平台扫描泄露的机密。如果它检测到可能的 Tailscale 机密，TruffleHog 会调用一个 Tailscale 端点的 API，以确定该机密是否确实处于活跃状态。如果该机密是活跃的，TruffleHog 会联系其数据源中包含该机密的用户。

TruffleHog 对 Tailscale 端点的 API 调用不会修改你的 tailnet，它只是检查某个机密是否为活跃的 Tailscale 密钥。

当 Tailscale 收到来自 TruffleHog 的暴露机密通知时，Tailscale **不会**自动撤销该机密。

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-key-prefixes]: /docs/reference/key-prefixes

[docs-key-secret-management]: /docs/reference/key-secret-management

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-webhooks-webhook-secret]: /docs/features/webhooks#webhook-密钥

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-gitguardian]: https://www.gitguardian.com

[xt-gitlab-artifact-report]: https://docs.gitlab.com/ee/ci/yaml/artifacts_reports.html

[xt-gitlab-secret-detection-enable]: https://docs.gitlab.com/user/application_security/secret_detection/secret_push_protection/#enable-secret-push-protection-in-a-project

[xt-gitlab-secret-detection]: https://docs.gitlab.com/user/application_security/secret_detection/

[xt-gitlab]: https://about.gitlab.com

[xt-trufflesecurity-trufflehog]: https://trufflesecurity.com/trufflehog

[xt-github-secret-scanning]: https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning

[xt-github]: https://github.com

[docs-security-contact]: /docs/reference/contact-preferences#setting-the-security-issues-email
