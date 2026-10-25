---
title: "在 Azure App Service 上使用 Tailscale"
description: "[Azure App Service][xt-azure-app-service] 是一个流行的云托管平台，无需自己管理服务器即可运行应用程序。不过，在 Azure App Service 上使用 Tailscale 可能比较困难，因为它不提供 Tailscale 所需的 /dev/net/tun 设备。"
---

最后验证于 Jan 5, 2026

[Azure App Service][xt-azure-app-service] 是一个流行的云托管平台，无需自己管理服务器即可运行应用程序。不过，在 Azure App Service 上使用 Tailscale 可能比较困难，因为它不提供 Tailscale 所需的 `/dev/net/tun` 设备。

你可以使用 Tailscale 的[用户态网络模式][docs-userspace-networking]，将你的应用连接到 Tailscale 网络。

## 第 1 步：生成认证密钥，用于认证你的 Azure App Service 应用

首先，我们要生成一个[认证密钥][docs-auth-keys]，让 Azure 能够认证我们的应用并加入网络。

打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面，选择**生成认证密钥**（Generate auth key）。为此我们建议使用[临时密钥][docs-ephemeral-nodes]（ephemeral key），因为它会在设备关机后自动清理设备。

*（图：Tailscale 认证密钥生成页面）*

> **注意：**

接下来，前往 [Azure 门户][xt-azure-login]中你应用的 **Configuration**（配置）页面。在 **Config Var**（配置变量）中，创建一个名为 `TAILSCALE_AUTHKEY` 的变量，值为刚创建的 `tskey-<key>` 字符串。

*（图：Azure App Service 配置变量界面）*

## 第 2 步：配置 Dockerfile 以安装 Tailscale

我们建议使用[多阶段 Dockerfile][xt-docker-multi-stage-builds]：第一阶段构建你的应用程序，第二阶段将应用代码和 Tailscale 拉入最终镜像并上传到 Azure。

1. 创建一个 `sshd_config` 文件，并将其放入 Docker 构建目录。如果构建 Dockerfile 之前该文件不存在，构建将会失败。

2. 在应用根目录下创建一个 `start.sh` 文件。Dockerfile 将 `/app/start.sh` 指定为初始运行进程。该脚本需要先启动 Tailscale，再启动应用程序二进制文件。启动 Tailscale 时请使用前面定义的 `TAILSCALE_AUTHKEY` 变量。

   下面是一个 `start.sh` 示例文件。请确保根据你的构建需要替换其中的值。

   ```shell
   #!/bin/sh

   /usr/bin/ssh-keygen -A
   mkdir -p /var/run/sshd
   /usr/sbin/sshd

   /app/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
   /app/tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname=azure-app
   echo Tailscale started
   ALL_PROXY=socks5://localhost:1055/ /app/my-app
   ```

3. 在应用根目录下创建一个 `Dockerfile`，并加入以下内容。请确保根据你的构建需要替换其中的值。

   ```dockerfile
   FROM golang:1-alpine3.21 AS builder
   WORKDIR /app
   COPY . ./
   # 这里也可以用来构建应用程序代码。
   FROM dotnetcore-docs-hello-world-linux.

   FROM alpine:latest
   RUN apk update && apk add ca-certificates bash sudo && rm -rf /var/cache/apk/*

   # Azure 允许通过 SSH 访问容器。Tailscale 运行并不需要它，
   # 但对调试应用程序非常有用。
   RUN apk add openssh openssh-keygen && echo "root:Docker!" | chpasswd
   RUN apk add netcat-openbsd
   RUN mkdir -p /etc/ssh
   COPY sshd_config /etc/ssh/
   EXPOSE 80 2222

   # 将二进制文件复制到生产镜像。
   COPY --from=builder /app/start.sh /app/start.sh
   # 将 start.sh 改为可执行
   RUN chmod +x /app/start.sh

   # 从 Docker Hub 上的 tailscale 镜像复制 Tailscale 二进制文件。
   COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscaled /app/tailscaled
   COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscale /app/tailscale
   RUN mkdir -p /var/run/tailscale /var/cache/tailscale /var/lib/tailscale

   # 在容器启动时运行。
   CMD ["./app/start.sh"]
   ```

下次部署你的 Azure 应用时，它就能连接到你的私有 Tailscale 网络。

## 从 tailnet 中移除临时节点

临时节点（ephemeral node）离线后会自动从你的 tailnet 中移除。你也可以使用 [`tailscale logout`][docs-cli-logout] 命令来控制临时节点的移除——既可以手动强制移除，也可以将该命令集成到 Tailscale 守护进程 [`tailscaled`][docs-tailscaled] 中。更多信息请参阅[临时节点][docs-ephemeral-nodes-faq]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#faq

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-azure-app-service]: https://azure.microsoft.com/en-us/products/app-service

[xt-azure-login]: https://portal.azure.com

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
