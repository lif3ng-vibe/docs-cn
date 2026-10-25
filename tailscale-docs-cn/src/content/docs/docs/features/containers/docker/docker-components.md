---
title: "了解 Docker 组件"
description: "Docker 由多个组件组成，它们协同工作，在称为容器的隔离环境中构建、打包和运行应用。每个组件在此过程中都扮演特定角色。"
---

最后验证于 Mar 23, 2026

Docker 由多个组件组成，它们协同工作，在称为容器的隔离环境中构建、打包和运行应用。每个组件在此过程中都扮演特定角色。其核心是：Dockerfile 定义如何构建镜像，镜像用来启动容器，而 Docker Engine 负责运行这些容器。

**Docker Engine**：运行在你机器上的 Docker 主程序。它负责构建镜像、启动和停止容器，以及管理网络和存储。当你运行 Docker 命令时，背后执行工作的就是 Docker Engine。

**Dockerfile**：一个文本文件，包含构建 Docker 镜像的指令。它描述了运行应用所需的一切，例如基础镜像、应用代码、依赖项、环境变量，以及启动应用所用的命令。Docker 会逐步读取 Dockerfile 来创建镜像。

**Docker 镜像（image）**：一种打包好的模板，包含应用运行所需的一切，包括应用代码、运行时、库、系统工具和配置。Docker Engine 以镜像为起点创建容器。镜像可以存储在本地机器上，也可以存储在 Docker Hub 等在线仓库中。例如，Tailscale 镜像包含配置为在容器内运行的 Tailscale 客户端。

**Docker 容器（container）**：Docker 镜像的一个运行实例。如果说镜像是模板，容器就是从该模板创建出来的、正在运行的应用。你可以从同一个镜像启动多个容器，每个容器都在隔离环境中运行，拥有自己的文件系统、网络和进程。

**Docker Compose 文件**：一种 YAML 配置文件，用于一起定义和运行多个容器。你不必为每个容器运行冗长的 `docker run` 命令，只需在单个文件中描述你的服务、网络和存储，[Docker Compose][docs-connect-docker-container] 就能把所有容器当作一组来启动和管理。

关于 Docker 组件和相关主题的更多信息，请参阅 [Docker 官方文档][xt-docker-docs]。

[docs-connect-docker-container]: /docs/features/containers/docker/how-to/connect-docker-container

[xt-docker-docs]: https://docs.docker.com/
