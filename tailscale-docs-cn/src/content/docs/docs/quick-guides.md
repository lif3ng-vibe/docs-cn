---
title: "Tailscale 快速指南"
description: "配置 Tailscale 一些最常用的功能。"
---

最后验证于 Jan 5, 2026

本节提供精简的主题，帮助你快速设置 tailnet 的特定部分。更多入门指引请参考 [Tailscale 快速开始][docs-install]。

[**使用出口节点**](/docs/features/exit-nodes/how-to/setup)——让流量经由 tailnet 中的特定设备路由，并配置设备使用出口节点。

[**配置子网路由器**](/docs/features/subnet-routers/how-to/setup)——配置子网路由器在网络上中继访问，包括无法安装 Tailscale 的资源。

[**用 tailnet 设备托管网站**](/docs/features/tailscale-funnel/how-to/host-websites)——从 tailnet 中的一台设备托管网站。

[**在 AWS 虚拟机上安装 Tailscale**](/docs/install/cloud/aws/quickstart)——在 AWS Linux 虚拟机上安装 Tailscale 客户端并使用部分常用功能。

[**SSH 连接 Linux 虚拟机**](/docs/how-to/connect-ssh-linux-vm)——使用 Tailscale SSH 安全连接到 Linux 虚拟机。

[**访问你的虚拟私有云**（VPC）](/docs/how-to/connect-vpc)——访问你的虚拟私有云（VPC），并使用 Tailscale 配置子网路由器。

[**使用 Docker Compose 将 Docker 容器接入你的 tailnet**](/docs/features/containers/docker/how-to/connect-docker-container)——使用 Docker Compose 和 nginx 搭建接入 Tailscale 的容器，通过 tailnet 安全访问该服务。

[docs-install]: /docs/how-to/quickstart
