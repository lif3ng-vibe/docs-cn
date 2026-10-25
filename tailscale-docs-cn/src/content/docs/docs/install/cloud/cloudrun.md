---
title: "Google Cloud Run 上的 Tailscale"
description: "Google Cloud Run 是一种流行的应用部署方式：使用容器部署应用，而不必自己管理服务器。不过，在 Google Cloud Run 上使用 Tailscale 可能比较困难，因为它不提供 Tailscale 所需的 /dev/net/tun 设备。"
---

最后验证于 Jan 5, 2026

Google Cloud Run 是一种流行的应用部署方式：使用容器部署应用，而不必自己管理服务器。不过，在 Google Cloud Run 上使用 Tailscale 可能比较困难，因为它不提供 Tailscale 所需的 /dev/net/tun 设备。

你可以使用 Tailscale 的[用户态网络模式][docs-userspace-networking]，将你的 Cloud Run 应用连接到 Tailscale 网络。

## 第 1 步：生成认证密钥，用于认证你的 Cloud Run 容器

首先，我们要[生成一个认证密钥][docs-auth-keys]，让 Cloud Run 能够认证我们的容器并加入网络。

打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面，选择**生成认证密钥**（Generate auth key）。为此我们建议使用[临时密钥][docs-ephemeral-nodes]（ephemeral key），因为它会在设备关机后自动清理设备。

*（图：Tailscale 认证密钥生成页面）*

> **注意：**

接下来，[前往 Cloud Run][xt-google-console-run] 的 **Edit & Deploy New Revision** 页面，选择 **Variables & Secrets** 标签页。在这里添加一个新的 secret，引用方式选择 **Environment variable**，命名为 `TAILSCALE_AUTHKEY`，并将 `tskey-<key>` 值作为 secret。

## 第 2 步：配置 Dockerfile 以安装 Tailscale

接下来，我们将使用[多阶段 Dockerfile][xt-docker-multi-stage-builds]：第一阶段构建你的应用程序，第二阶段将应用代码和 Tailscale 拉入最终镜像并上传到 Google。

在你的 `Dockerfile` 中：

```docker
FROM golang:1.16.2-alpine3.13 as builder
WORKDIR /app
COPY . ./
# 这里也可以用来构建应用程序代码。

FROM alpine:latest
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

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

/app/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
/app/tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname=cloudrun-app
echo Tailscale started
ALL_PROXY=socks5://localhost:1055/ /app/my-app
```

下次部署 Cloud Run 容器时，它就能连接到你的私有 Tailscale 网络。

## 从 tailnet 中移除临时节点

临时节点（ephemeral node）离线后会自动从你的 tailnet 中移除。你也可以使用 [`tailscale logout`][docs-cli-logout] 命令来控制临时节点的移除——既可以手动强制移除，也可以将该命令集成到 Tailscale 守护进程 [`tailscaled`][docs-tailscaled] 中。更多信息请参阅[临时节点][docs-ephemeral-nodes-faq]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#常见问题

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds

[xt-google-console-run]: https://console.cloud.google.com/run
