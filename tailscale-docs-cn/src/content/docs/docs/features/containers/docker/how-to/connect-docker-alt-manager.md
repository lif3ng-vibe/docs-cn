---
title: "使用其他 Docker 管理器将 Docker 容器连接到你的 tailnet"
description: "你可以使用 Docker CLI 或 Docker Compose 以外的容器管理工具运行 `tailscale/tailscale` 镜像。镜像和配置保持不变，只有启动和管理容器的方式不同。"
---

最后验证于 Mar 23, 2026

你可以使用 Docker CLI 或 Docker Compose 以外的容器管理工具运行 `tailscale/tailscale` 镜像。镜像和配置保持不变，改变的只是启动和管理容器的方式。

## 前提条件

开始之前，你需要：

* 一个 Tailscale 账户，且有权在管理控制台中生成[认证密钥][docs-auth-keys]。
* 对使用终端或命令行界面有基本了解。

准备好这些后，你就可以开始把 Docker 容器连接到你的 tailnet 了。

## 常用管理工具

常见的 Docker 管理工具包括：

* [Colima][xt-colima]：轻量级容器运行时，常在 macOS 上用作 Docker Desktop 的替代。
* [Dockhand][xt-dockhand]：功能更丰富的基于 Web 的 Docker 容器管理界面。
* [Portainer][xt-portainer]：基于 Web 的 Docker 容器管理界面。
* [Podman][xt-podman]：与 Docker 兼容、无需后台服务的容器引擎。

设置和管理方面的指引请查阅相应产品的专属文档。

> **注意：**
>
> Docker Desktop 是另一款适用于 macOS 和 Windows 的应用，包含 Docker Engine、Docker Compose、图形界面以及本地运行容器所需的支持服务。Tailscale 建议在可行时直接安装 Docker Engine 和 Docker Compose 插件，以减少额外的系统开销，并更贴近生产环境的 Linux 环境。

## 生成认证密钥

生成认证密钥并将其添加到 Docker 配置中，即可自动把 Docker 容器连接到你的 tailnet，无需手动登录。

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys)（密钥）页面。
2. 在 **Auth keys**（认证密钥）部分，选择 **Generate auth key**（生成认证密钥）。
   1. 添加一段描述以便识别该密钥。描述不影响配置。
   2. 其他选项保持默认。
   3. 选择 **Generate key**（生成密钥）。
3. 立即复制该密钥。关闭对话框后将无法再次查看。

关于 Tailscale 认证密钥的更多信息，请参阅[认证密钥][docs-auth-keys]。

## 进一步探索

关于示例 YAML 文件以及字段和标志说明（可用于在命令行或图形界面中、用你偏好的容器管理工具在容器内安装 Docker），请参阅[使用 Docker Compose 将 Docker 容器连接到你的 tailnet][docs-docker-container]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-docker-container]: /docs/features/containers/docker/how-to/connect-docker-container

[xt-colima]: https://github.com/abiosoft/colima

[xt-dockhand]: https://dockhand.pro/

[xt-podman]: https://podman.io/

[xt-portainer]: https://www.portainer.io/
