---
title: "AWS Lightsail 上的 Tailscale"
description: "AWS Lightsail 是一种低成本运行虚拟机或容器的方式。在 Lightsail 中部署容器时，由于它不提供 Tailscale 所需的 /dev/net/tun 设备，使用 Tailscale 会比较困难。"
---

最后验证于 Jan 5, 2026

AWS Lightsail 是一种低成本运行虚拟机或容器的方式。在 Lightsail 中部署容器时，由于它不提供 Tailscale 所需的 /dev/net/tun 设备，使用 Tailscale 会比较困难。

从 Tailscale v1.12 及更高版本开始，你可以使用 Tailscale 的[用户态网络模式][docs-userspace-networking]，将 AWS Lightsail 应用连接到你的 Tailscale 网络。

## 第 1 步：生成认证密钥，用于认证你的 AWS Lightsail 容器

首先，我们要[生成一个认证密钥][docs-auth-keys]，让 AWS Lightsail 能够认证我们的容器并加入网络。

打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面，选择**生成认证密钥**（Generate auth key）。为此我们建议使用[临时密钥][docs-ephemeral-nodes]（ephemeral key），因为它会在设备关机后自动清理设备。

*（图：Tailscale 认证密钥生成页面）*

接下来，[选择 AWS Lightsail][xt-aws-lightsail] 的 **Containers** 标签页，为容器服务创建一个新部署。在配置的 Containers 部分有一个**添加环境变量**（Add environment variables）链接。将变量键设为 `TAILSCALE_AUTHKEY`，值设为之前生成的 `tskey-<key>` 字符串。

## 第 2 步：配置 Dockerfile 以安装 Tailscale

接下来，我们将使用[多阶段 Dockerfile][xt-docker-multi-stage-builds]：第一阶段构建你的应用程序，第二阶段将应用代码和 Tailscale 拉入最终镜像并上传到 AWS。

在你的 `Dockerfile` 中：

```docker
FROM alpine:latest as builder
WORKDIR /app
COPY . ./
# 这里也可以用来构建应用程序代码。

FROM alpine:latest
# 将二进制文件复制到生产镜像。
COPY --from=builder /app/bootstrap /var/runtime/bootstrap

# 从 Docker Hub 上的 tailscale 镜像复制 Tailscale 二进制文件。
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscaled /var/runtime/tailscaled
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscale /var/runtime/tailscale
RUN mkdir -p /var/run && ln -s /tmp/tailscale /var/run/tailscale && \
    mkdir -p /var/cache && ln -s /tmp/tailscale /var/cache/tailscale && \
    mkdir -p /var/lib && ln -s /tmp/tailscale /var/lib/tailscale && \
    mkdir -p /var/task && ln -s /tmp/tailscale /var/task/tailscale

EXPOSE 8080

# 在容器启动时运行。
ENTRYPOINT ["/var/runtime/bootstrap"]
```

这个 Dockerfile 将 `/var/runtime/bootstrap` 指定为初始运行进程。该脚本需要先启动 Tailscale，再启动应用程序二进制文件。我们在这里可以使用前面定义的 `TAILSCALE_AUTHKEY` 变量。

然后，在应用根目录下创建一个名为 `bootstrap` 的文件：

```shell
#!/bin/sh

mkdir -p /tmp/tailscale
/var/runtime/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
/var/runtime/tailscale up --auth-key=${TAILSCALE_AUTHKEY} --hostname=aws-lightsail-app
echo Tailscale started
ALL_PROXY=socks5://localhost:1055/ /var/runtime/my-app
```

AWS Lightsail 容器部署完成后，就能连接到你的私有 Tailscale 网络。

## 从 tailnet 中移除临时节点

临时节点（ephemeral node）离线后会自动从你的 tailnet 中移除。你也可以使用 [`tailscale logout`][docs-cli-logout] 命令来控制临时节点的移除——既可以手动强制移除，也可以将该命令集成到 Tailscale 守护进程 [`tailscaled`][docs-tailscaled] 中。更多信息请参阅[临时节点][docs-ephemeral-nodes-faq]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-ephemeral-nodes-faq]: /docs/features/ephemeral-nodes#常见问题

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-aws-lightsail]: https://lightsail.aws.amazon.com

[xt-docker-multi-stage-builds]: https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
