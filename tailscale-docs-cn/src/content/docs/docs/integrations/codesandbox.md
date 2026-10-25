---
title: "从 CodeSandbox 访问你的 tailnet"
description: "私密地访问 CodeSandbox 仓库。"
---

最后验证于 Jan 5, 2026

[CodeSandbox][xt-codesandbox] 是一个用于快速 Web 开发的在线代码编辑器与 IDE。

Tailscale 可以安装在 CodeSandbox Repository 环境中，从而安全地访问私有资源。
你可以像应用与其他服务处于同一网络中一样开发你的应用，同时不牺牲安全性。

Tailscale 在 CodeSandbox Repository 环境中的工作方式是：向 Docker 化的应用设置（例如使用 `docker-compose`）中添加一个容器。这个额外的容器运行 Tailscale 客户端，并为其他容器提供网络。

## 集成

按照 [CodeSandbox 关于在 CodeSandbox Repository 中用起 Tailscale 的说明][xt-codesandbox-tailscale]操作。

你需要：

1. 在 Tailscale 管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建一个[认证密钥（auth key）][docs-auth-keys]。该[密钥类型][docs-auth-keys-types]应为可重用（reusable）、临时（ephemeral）且预授权（pre-authorized）。你也可以将密钥类型设为带标签（tagged），这样你的 CodeSandbox 环境会被自动打上标签，其访问权限由 [Tailscale 访问控制策略][docs-access-control]控制。

2. 将该认证密钥添加为 [CodeSandbox 环境变量][xt-codesandbox-secrets]，名为 `TS_AUTHKEY`。

3. 将 [`tailscale/tailscale` Docker 镜像][xt-docker-tailscale]作为额外的服务添加到你的应用旁边。

## 授权

在启动 Tailscale 时，在你的 Docker 任务中引用 `TS_AUTHKEY` 环境变量，从你的工作区向 Tailscale 完成身份验证。例如：

```shell
docker-compose exec tailscale tailscale up \
  --auth-key=${TS_AUTHKEY} --accept-routes --hostname=csb-${HOSTNAME}
```

\[Missing snippet: visual\_policy\_editor.mdx]

[docs-access-control]: /docs/features/access-control

[docs-auth-keys-types]: /docs/features/access-control/auth-keys#认证密钥的类型

[docs-auth-keys]: /docs/features/access-control/auth-keys

[xt-codesandbox-secrets]: https://codesandbox.io/docs/learn/environment/secrets

[xt-codesandbox-tailscale]: https://codesandbox.io/docs/learn/integrations/tailscale

[xt-codesandbox]: https://codesandbox.io

[xt-docker-tailscale]: https://hub.docker.com/r/tailscale/tailscale
