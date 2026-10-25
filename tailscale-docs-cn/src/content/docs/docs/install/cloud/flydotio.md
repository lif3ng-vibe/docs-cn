---
title: "Fly.io 上的 Tailscale"
description: "[Fly.io][xt-flyio] 是一个流行的服务，可以在全球各地部署全栈应用和数据库，由 Fly 按需处理各区域的运维与扩缩容。将 Tailscale 添加到 fly.io 应用非常简单，让 Fly 上的应用能够与 tailnet 中的其他节点和服务通信。"
---

最后验证于 Dec 4, 2025

[Fly.io][xt-flyio] 是一个流行的服务，可以在全球各地部署全栈应用和数据库，由 Fly 按需处理各区域的运维与扩缩容。将 Tailscale 添加到 fly.io 应用非常简单，让 Fly 上的应用（App on Fly）能够与你 tailnet 中的其他节点和服务通信。

## 第 1 步：生成认证密钥，用于认证你的 Fly 上的应用

首先，我们要[生成一个认证密钥][docs-auth-keys]，让 fly.io 能够认证我们的应用并加入网络。

打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面，选择**生成认证密钥**（Generate auth key）。为此我们建议使用可复用且预授权的[临时密钥][docs-ephemeral-nodes]（ephemeral key），因为它会在设备关机后自动清理设备。

*（图：Tailscale 认证密钥生成页面）*

> **注意：**

接下来，使用 `flyctl secrets set TAILSCALE_AUTHKEY="tskey-<key>"` 安全地存储认证密钥，供 Fly 上的应用使用。

## 第 2 步：配置 Dockerfile 以安装 Tailscale

接下来，我们将使用[多阶段 Dockerfile][xt-docker-multi-stage-builds]：第一阶段构建你的应用程序，第二阶段将应用代码和 Tailscale 拉入最终镜像并上传到 Fly。

在你的 `Dockerfile` 中：

```docker
FROM alpine:latest as builder
WORKDIR /app
COPY . ./
# 这里也可以用来构建应用程序代码。

# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
FROM alpine:latest
RUN apk update && apk add ca-certificates iptables ip6tables && rm -rf /var/cache/apk/*

# 将二进制文件复制到生产镜像。
COPY --from=builder /app/start.sh /app/start.sh

# 从 Docker Hub 上的 tailscale 镜像复制 Tailscale 二进制文件。
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscaled /app/tailscaled
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscale /app/tailscale
RUN mkdir -p /var/run/tailscale /var/cache/tailscale /var/lib/tailscale

# 在容器启动时运行。
CMD ["/app/start.sh"]
```

这个 Dockerfile 将 `/app/start.sh` 指定为初始运行进程。该脚本需要先启动 Tailscale，再启动应用程序二进制文件。我们在这里可以使用前面定义的 `TAILSCALE_AUTHKEY` 变量。

然后，在应用根目录下创建一个名为 `start.sh` 的文件：

```shell
#!/bin/sh

/app/tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &
/app/tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname=fly-app
/app/my-app
```

下次部署 Fly 上的应用时，它就能连接到你的私有 Tailscale 网络。

> **注意：**
>
> 如果你使用 Alpine 基础镜像和现有的 Fly 机器，可能需要更新该机器，确保其内核支持 nftables。更多信息请参阅 [Fly 社区帖子][xt-flyio-nftables]和 [Tailscale issue #10540][xt-gh-tailscale-issue-10540]。

## 从 tailnet 中移除临时节点

临时节点（ephemeral node）离线后会自动从你的 tailnet 中移除。你也可以使用 [`tailscale logout`][docs-cli-logout] 命令来控制临时节点的移除——既可以手动强制移除，也可以将该命令集成到 Tailscale 守护进程 [`tailscaled`][docs-tailscaled] 中。更多信息请参阅[临时节点][docs-ephemeral-nodes-faq]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#常见问题

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds

[xt-flyio-nftables]: https://community.fly.io/t/kernel-nftables-support/17669

[xt-flyio]: https://fly.io

[xt-gh-tailscale-issue-10540]: https://github.com/tailscale/tailscale/issues/10540
