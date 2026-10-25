---
title: "使用独立 Docker 将 Docker 容器连接到你的 tailnet"
description: "你可以通过在一条命令中内联指定所有必需选项来创建 Docker 容器。这种方法的优点是速度更快，且不需要额外的设置。"
---

最后验证于 Mar 23, 2026

你可以在一条命令中内联指定所有必需选项来创建 Docker 容器。这种方法的优点是速度更快，而且不需要额外的设置。

## 前提条件

开始之前，你需要：

* 一个 Tailscale 账户，且有权在管理控制台中生成[认证密钥][docs-auth-keys]。
* 对使用终端或命令行界面有基本了解。

准备好这些后，你就可以开始把 Docker 容器连接到你的 tailnet 了。

## 拉取 Tailscale Docker 镜像

在运行容器之前，Docker 需要在本地系统上持有该镜像的副本。你可以用 `docker pull` 显式下载镜像，也可以在运行 `docker run` 或 `docker compose up` 时让 Docker 自动处理。在大多数情况下，如果镜像尚不存在，Docker 会自动帮你拉取。不过，当你想确保使用最新版本或需要提前准备环境时，手动运行 `docker pull` 会很有用。

首先，从 Docker Hub 或 GitHub Container Registry 等容器仓库把 Tailscale 镜像下载到你计划运行容器的那台机器上。镜像只需拉取一次，之后就可以按需创建任意数量的容器；以后还可以再次拉取，升级到更新的 Tailscale 版本。

要从 Docker Hub 拉取 Docker 镜像，请运行：

```shell
docker pull tailscale/tailscale:latest
```

要从 GitHub Container Registry 拉取 Docker 镜像，请运行：

```shell
docker pull ghcr.io/tailscale/tailscale:latest
```

要拉取特定的稳定版本（可带或不带补丁版本号，例如 `.1`）：

```shell
docker pull tailscale/tailscale:v1.94.1
```

要拉取特定的不稳定版本：

```shell
docker pull tailscale/tailscale:unstable-v1.94.38
```

关于 Tailscale 客户端发布和版本的更多信息，请参阅 [Tailscale 客户端版本与发布通道][docs-versions]。

## 生成认证密钥

生成认证密钥并将其添加到 Docker 配置中，即可自动把 Docker 容器连接到你的 tailnet，无需手动登录。

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys)（密钥）页面。
2. 在 **Auth keys**（认证密钥）部分，选择 **Generate auth key**（生成认证密钥）。
   1. 添加一段描述以便识别该密钥。描述不影响配置。
   2. 其他选项保持默认。
   3. 选择 **Generate key**（生成密钥）。
3. 立即复制该密钥。关闭对话框后将无法再次查看。

关于 Tailscale 认证密钥的更多信息，请参阅[认证密钥][docs-auth-keys]。

## 运行容器

运行 Tailscale Docker 镜像时使用 `docker run` 命令，并附上针对你自身配置的各种指令和细节。

> **注意：**
>
> 你也可以使用 [Docker Compose][xt-docker-compose]，通过保存下来、可复用的 YAML 文件来定义和管理多容器应用，而不必运行单条 Docker 命令。这种方式的主要优点之一，是可以把多个相关容器作为一个应用栈一起配置和启动。关于使用 Docker Compose 安装 Tailscale 的信息，请参阅[使用 Docker Compose 将 Docker 容器连接到你的 tailnet][docs-docker-container]。

在下面的示例中，创建的 Docker 容器只运行 Tailscale 客户端，并使用生成的认证密钥自动认证到你的 tailnet。

请务必将 `<tskey-YOUR-AUTH-KEY>` 替换为你生成的认证密钥。你也可以自定义 `--hostname=tailscale-nginx` 字段，改成你希望在 Tailscale 管理控制台中显示的节点名称。

```shell
docker run -d \
   --name tailscale \
   --hostname tailscale-nginx \
   -e TS_AUTHKEY=<tskey-YOUR-AUTH-KEY> \
   -e TS_STATE_DIR=/var/lib/tailscale \
   -v ./tailscale-state:/var/lib/tailscale \
   --cap-add=net_admin \
   --cap-add=net_raw \
   --restart unless-stopped \
   tailscale/tailscale:latest
```

打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines)（机器）页面，确认 `tailscale-nginx` 条目已显示。这表明节点已成功添加到你的 tailnet。

关于示例 YAML 文件以及字段和标志说明（同样适用于在命令行或你[偏好的容器管理工具][docs-docker-alt]的图形界面中在容器内安装 Docker），请参阅[使用 Docker Compose 将 Docker 容器连接到你的 tailnet][docs-docker-container]。

Docker 命令列表请参阅 [Docker 官方 CLI 文档][xt-docker-docs-cli]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-docker-alt]: /docs/features/containers/docker/how-to/connect-docker-alt-manager

[docs-docker-container]: /docs/features/containers/docker/how-to/connect-docker-container

[docs-versions]: /docs/reference/tailscale-client-versions

[xt-docker-compose]: https://docs.docker.com/compose/

[xt-docker-docs-cli]: https://docs.docker.com/reference/cli/docker/
