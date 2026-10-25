---
title: "将 Tailscale 与 GitLab CI/CD 配合使用"
description: "借助 [Tailscale GitLab 配置][xt-gitlab-tailscale-gitlab-cicd]，可以把你的 Tailscale 网络（即 tailnet）连接到 [GitLab Runner][xt-gitlab-runner]。"
---

最后验证于 Dec 4, 2025

借助 [Tailscale GitLab 配置][xt-gitlab-tailscale-gitlab-cicd]，可以把你的 Tailscale 网络
（即 tailnet）连接到 [GitLab Runner][xt-gitlab-runner]。

通过这一配置，你可以直接从 GitLab Runner 访问 tailnet 中的节点。一些示例用途：

* 将应用安全地部署到内部服务器
* 安全地访问面向特定平台的私有测试 runner
* 访问你的测试数据数据库，而不必将其暴露在互联网上
* 访问内部部署监控工具

## 工作原理

当你把 Tailscale GitLab 配置添加到你的 runner 后，runner 中后续的步骤就可以访问 tailnet 中的节点。例如，runner 可以访问一个存有测试数据数据库的节点。

Tailscale GitLab 配置需要一个[认证密钥（auth key）][docs-auth-keys]，它必须带标签、可重用、临时，以及（如适用）预批准的。你将认证密钥存储为
[GitLab 外部机密][xt-gitlab-secrets]。该标签会把访问权限授予你的 runner 创建的任何节点。

runner 执行时，会使用认证密钥创建一个
[临时节点（ephemeral node）][docs-ephemeral-nodes]。随后，该节点可以访问 tailnet 中的节点，但受应用于这些标签的访问规则约束。

由于该节点是临时的，操作完成后不久，它就会被自动从你的 tailnet 中移除。下次运行该操作时，会创建一个新的临时节点，仅供新的 runner 使用。

在启用了[设备审批（device approval）][docs-device-approval]的 tailnet 中，Tailscale GitLab 配置创建的任何节点都是[预批准][docs-auth-keys-types]的。

## 将 Tailscale 添加到 GitLab Runner

1. 为 GitLab 配置将创建的节点创建至少一个[标签（tag）][docs-tags]。
   例如本例使用的 `tag:ci`。你授予这些标签的访问权限会应用到 runner 将创建的节点上。
2. 创建一个[认证密钥][docs-auth-keys]。我们建议[密钥类型][docs-auth-keys-types]为带标签、
   可重用且临时。如果 tailnet 启用了[设备审批][docs-device-approval]，还应确保
   密钥类型是预批准的。
3. 创建一个名为 `TAILSCALE_AUTHKEY` 的 [GitLab 机密][xt-gitlab-secrets]，并将其值设置为你的认证密钥。
   然后在你的 runner 中使用 `authkey` 字段引用该机密。例如：

   ```shell
   tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname="gitlab-$(cat /etc/hostname)" --accept-routes
   ```

操作运行时会创建一个临时节点。该节点可以访问 tailnet 中的节点，但受应用于指定标签的访问规则约束。在 runner 的其余部分，按需访问 tailnet 中的其他节点。

操作结束后不久，临时节点会被自动清理。

[docs-tags]: /docs/features/tags

[docs-auth-keys-types]: /docs/features/access-control/auth-keys#types-of-auth-keys

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[xt-gitlab-runner]: https://docs.gitlab.com/runner

[xt-gitlab-secrets]: https://docs.gitlab.com/ee/ci/secrets

[xt-gitlab-tailscale-gitlab-cicd]: https://gitlab.com/tailscale-dev/gitlab-ci-cd
