---
title: "从 Gitpod 访问你的 tailnet"
description: "[Gitpod][xt-gitpod] 是一种在云端秒级为每个任务启动自动化开发环境的方式，可以使用你想要的任何 Git 上下文。"
---

最后验证于 Jan 5, 2026

[Gitpod][xt-gitpod] 是一种在云端秒级为每个任务启动自动化开发环境的方式，可以使用你想要的任何 Git 上下文。

你可以在 Gitpod 工作区内安装 Tailscale，从而安全地访问私有资源（例如软件包仓库），或者与同事共享环境，进行代码评审或结对编程。

## 启动 Tailscale

如果你已经在使用 Gitpod，那么 Gitpod 的[默认 `full` 工作区基础镜像][xt-docker-workspace-full]中已安装 Tailscale。要使用它，请在你的工作区中：

1. 在一个单独的 shell 中运行 `sudo tailscaled` 来启动进程。
2. 在主 shell 中运行 `tailscale up`，然后使用浏览器或认证密钥进行认证。

### 将 Tailscale 添加到自定义基础镜像

如果你管理自己的基础镜像而不使用默认的 `full` 工作区镜像，仍然可以在 Gitpod 中将 Tailscale 作为项目[自定义 Docker 镜像][xt-gitpod-config-docker]的一部分来使用。需要合并以下文件，它们来自 [`gitpod-io/template-tailscale` 仓库][xt-gh-gitpod-tailscale]或 [`tailscale/gitpod` 仓库][xt-gh-tailscale-gitpod]：

1. `.gitpod.Dockerfile` 应作为构建中的一层，或合并进项目的 Dockerfile。
2. `.gitpod.yml` 中的 Tailscale 任务需要合并进项目的 `.gitpod.yml` 文件。

## 向 Tailscale 认证

要让 Gitpod 工作区加入 tailnet，请为你的 tailnet 创建一个[认证密钥][docs-auth-keys]，并将其添加为名为 `TAILSCALE_AUTHKEY` 的 [Gitpod 环境变量][xt-gitpod-variables]。

连接成功后，你可以在 tailnet 中按照 `gitpod--{user-name}--{repo-name}` 的命名约定找到你的 Gitpod 工作区。建议[启用 MagicDNS][docs-magicdns]，为你的工作区获取一个稳定域名，可从 tailnet 中的其他节点（例如你的本地机器）访问。

### 为临时工作区使用临时认证密钥

如果你使用普通认证密钥，Tailscale 的机器状态会存储在你的 Gitpod 账户中，你的工作区总是以同一个节点重新连接。

在相近时间启动的多个 Gitpod 工作区会得到递增的主机名，例如 `gitpod--{user-name}--{repo-name}-1` 和 `gitpod--{user-name}--{repo-name}-2`。

如果你想把 Gitpod 工作区当作临时节点来对待，请改用[临时认证密钥][docs-ephemeral-nodes]。

*（图：Gitpod 中编辑 Markdown）*

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-magicdns]: /docs/features/magicdns

[xt-docker-workspace-full]: https://hub.docker.com/r/gitpod/workspace-full

[xt-gh-gitpod-tailscale]: https://github.com/gitpod-io/template-tailscale

[xt-gh-tailscale-gitpod]: https://github.com/tailscale/gitpod

[xt-gitpod-config-docker]: https://www.gitpod.io/docs/config-docker

[xt-gitpod-variables]: https://gitpod.io/variables

[xt-gitpod]: https://www.gitpod.io
