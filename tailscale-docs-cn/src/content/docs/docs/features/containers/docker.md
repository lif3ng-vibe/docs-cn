---
title: "Docker"
description: "直接在机器上安装 Web 服务器、数据库或自托管服务等应用会带来各种挑战。每个服务都需要特定的依赖，这些依赖可能与其他软件冲突。"
---

最后验证于 Mar 23, 2026

直接在机器上安装 Web 服务器、数据库或自托管服务等应用会带来各种挑战：每个服务都需要特定的依赖，这些依赖可能与其他软件冲突；安装需要多个步骤；移除也可能很麻烦。要远程访问这些服务，你通常需要把它们暴露到公共互联网上，这会带来安全风险。[Docker][xt-docker] 容器把每个应用及其所需的全部内容打包进隔离的环境，从而解决这些问题。你可以无冲突地运行多个服务，在不弄乱系统的前提下测试软件，并干净地移除容器。将 Docker 容器连接到你的 tailnet 后，你就能从任何地方安全地访问这些服务，而无需公开暴露。

常见用例包括运行 Plex、Grafana、Home Assistant 等自托管应用，远程访问开发数据库和工具，连接跨不同主机的微服务，以及在隔离环境中测试应用。更多创意和示例（看看可以在容器中与 Tailscale 客户端一起安装什么），请参阅 GitHub 上的 [Tailscale Docker 代码示例][xt-gh-tailscale-docker-examples]。

[**了解 Docker 组件**](/docs/features/containers/docker/docker-components) — Docker 组件概览：运行容器的 Engine、定义镜像的 Dockerfile、打包应用的镜像、运行应用的容器，以及用于多容器部署的 Compose。

[**使用独立 Docker 将 Docker 容器连接到你的 tailnet**](/docs/features/containers/docker/how-to/connect-docker-standalone) — 用一条命令运行 Tailscale Docker 镜像，创建容器并认证到你的 tailnet。

[**使用 Docker Compose 将 Docker 容器连接到你的 tailnet**](/docs/features/containers/docker/how-to/connect-docker-container) — 用 Docker Compose 搭配 nginx 搭建连接 Tailscale 的容器，让你能通过 tailnet 安全访问该服务。

[**使用其他 Docker 管理器将 Docker 容器连接到你的 tailnet**](/docs/features/containers/docker/how-to/connect-docker-alt-manager) — 用相同的配置，在 Podman、Portainer 或 Colima 等其他容器管理器中运行 Tailscale Docker 镜像。

[**Docker 配置参数**](/docs/features/containers/docker/docker-params) — 使用 Docker 环境变量配置 Tailscale 容器如何进行认证、连接到你的 tailnet 以及对外提供服务。

> **注意：**
>
> 下面的相关视频提供了更多背景信息和示例。

[Docker 与 Tailscale 入门（视频）](https://www.youtube.com/watch?v=YTjYXii4WzI)

[xt-docker]: https://www.docker.com/

[xt-gh-tailscale-docker-examples]: https://github.com/tailscale-dev/docker-guide-code-examples
