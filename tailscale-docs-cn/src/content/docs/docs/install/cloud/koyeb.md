---
title: "在 Koyeb 上使用 Tailscale"
description: "[Koyeb][xt-koyeb] 是一个无服务器平台，用于在全球高性能基础设施（包括 CPU、GPU 和加速器）上无缝部署 AI 应用与数据库。你可以"
---

最后验证于 Jan 5, 2026

[Koyeb][xt-koyeb] 是一个无服务器平台，用于在全球高性能基础设施（包括 CPU、GPU 和加速器）上无缝部署 AI 应用与数据库。
你可以在 Koyeb 应用中加入 Tailscale，让 Koyeb 服务与 tailnet 中的其他设备和服务通信。

## 步骤 1：生成认证密钥，在 Koyeb 上认证你的服务

首先[生成认证密钥（auth key）][docs-auth-keys]，让你的 Koyeb 服务加入你的 tailnet。

打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面，选择**生成认证密钥**（Generate auth key）。此处最佳做法是使用可复用且已预授权的[临时密钥][docs-ephemeral-nodes]（ephemeral key），因为设备关机后它会被自动清理。

*（图：Tailscale 认证密钥生成页面）*

> **注意：**

接下来，打开终端，使用以下命令创建一个 [Koyeb Secret][xt-koyeb-secret]，将认证密钥安全地存储在 Koyeb 上。

```shell
koyeb secrets create TAILSCALE_AUTHKEY -v "tskey-<key>"
```

通过环境变量把这个 Secret 传给你的 Koyeb 服务，以认证你的应用并加入 tailnet。

## 步骤 2：配置 Dockerfile 以安装 Tailscale

接下来，构建一个包含两个阶段的[多阶段 Dockerfile][xt-docker-multi-stage-builds]：

* 第一个阶段编译并构建你的应用代码。
* 第二个阶段把你的应用代码与 Tailscale 一起拉取进最终镜像，供你部署到 Koyeb。

在你的 `Dockerfile` 中：

```docker
FROM alpine:latest as builder
WORKDIR /app
COPY . ./
# 这里也是你构建应用代码的地方。

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

Dockerfile 指定 `/app/start.sh` 脚本作为初始运行进程。该脚本先启动 Tailscale，再运行应用二进制文件。你在这里会用到生成认证密钥时定义的 `TAILSCALE_AUTHKEY` 变量。

在你的应用根目录下新建一个名为 `start.sh` 的文件，并向文件中添加以下内容，用于启动 Tailscale 并运行你的应用：

```shell
#!/bin/sh
# 启动 Tailscale
/app/tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &
/app/tailscale up --ssh --auth-key=${TAILSCALE_AUTHKEY} --hostname=tailscale-on-koyeb

# 启动你的应用
/app/my-app
```

你向 `/app/tailscale up` 传入 `--ssh` 标志，以授权对该节点的 SSH 连接。这样你就能确认一切按预期工作，并能从 tailnet 中通过 SSH 连接该节点。更多信息请参阅 [Tailscale SSH 文档][docs-tailscale-ssh]。

保存文件，即可开始部署。

## 步骤 3：将应用部署到 Koyeb

要在 Koyeb 上部署该应用，请从应用根目录运行以下命令。此命令会创建并部署一个连接到你 tailnet 的新 Koyeb 服务：

```
koyeb deploy . myapp/main --instance-type small --region was --type worker --archive-builder docker --env TAILSCALE_AUTHKEY=@TAILSCALE_AUTHKEY --privileged
```

运行以下命令，通过 SSH 确认你能连接到该服务：

```shell
tailscale ssh root@tailscale-on-koyeb
```

有关 Koyeb、Koyeb CLI、资源、服务类型与部署选项的更多信息，请参阅 [Koyeb 文档][xt-koyeb-docs]。

## 从 tailnet 中移除临时节点

临时节点（ephemeral node）离线后会被自动从你的 tailnet 中移除。你也可以使用 [`tailscale logout`][docs-cli-logout] 命令控制临时节点的移除：手动强制移除，或将该命令加入 [`tailscaled`][docs-tailscaled] Tailscale 守护进程。更多信息请参阅[临时节点][docs-ephemeral-nodes-faq]。

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#常见问题

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds

[xt-koyeb]: https://www.koyeb.com

[xt-koyeb-docs]: https://www.koyeb.com/docs

[xt-koyeb-secret]: https://www.koyeb.com/docs/reference/secrets
