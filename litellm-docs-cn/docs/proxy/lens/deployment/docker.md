---
title: "Lens 容器"
description: "运行独立的 Lens 容器与 ClickHouse，并视需要接入 LiteLLM。"
slug: "/proxy/lens/deployment/docker"
---

# Lens 容器

Lens 的运行时镜像包含其 Rust API、后台处理、静态 UI 和计算沙箱。它依赖带 KeeperMap 的 ClickHouse，并需要一份自己的管理员凭据。想以最短路径完成整套容器安装，可使用[源码 Compose 快速上手](./local.md)；在 Kubernetes 中部署则可使用[源码 Helm chart](./kubernetes.md)

如果使用托管容器平台，请以当前的[运行时 Dockerfile](https://github.com/BerriAI/lens/blob/main/deploy/runtime/Dockerfile) 和 [Compose 配置](https://github.com/BerriAI/lens/blob/main/deploy/lens/compose.yaml)作为部署参考。[从源码构建](./development.md#尝试后端改动)可以产出本地镜像；独立发布的制品仍在验证评估中

## 配置 Lens {#2-configure-lens}

通过私有部署配置提供 `LENS_ADMIN_TOKEN`、正确的 `LENS_PUBLIC_URL` 以及 ClickHouse 连接信息。[存储要求](./storage.md#external-clickhouse)涵盖了单机拓扑、Keeper 配置与相应权限。凭据和存储必须在容器替换后保留下来

请保留镜像自带的非 root 用户、只读文件系统、受限临时空间、已裁剪的 capabilities 和沙箱设置。运行排查任务时，请使用原生 Linux，并授予[计算沙箱](https://github.com/BerriAI/lens/blob/main/docs/sandbox.md)所需的 capabilities

## 接入已有网关 {#1-configure-litellm}

兼容的 LiteLLM 网关可以通过可达的 HTTP 或 HTTPS 地址连接到运行中的 Lens 服务。凭据与 URL 设置见[将 Lens 接入 LiteLLM](./litellm.md)，通过现有的容器环境和重建命令传入。请让两个容器保持在持久的用户自定义网络中，或改用另一个可达的私有地址

Lens 的公开地址供 agent 和浏览器访问。服务凭据与签名凭据用于网关连接的身份认证；agent 追踪密钥和模型凭据各自独立。已存放在网关侧的 Lens 元数据，需要先按[迁移文档](https://github.com/BerriAI/lens/blob/main/docs/migration.md)完成迁移，新的运行时才能接管

## 启动并检查 {#3-start-lens}

在端口 4318 上，用 `/health/live` 检查进程健康、用 `/health/ready` 检查就绪状态。并按[服务器指南](./server.md#3-route-https-traffic)让独立 UI 和 API 走你的 HTTPS 代理

## 验证正常运行 {#4-check-the-installation}

在 `/ui/` 登录独立的 Lens，或使用所连接网关的 `/ui/lens/` 页面。完成[首次追踪检查](../deployment.md#check-the-installation)后重启 Lens 容器，确认已保存的追踪记录仍可访问。恢复场景下，请使用能把 ClickHouse 数据和 Keeper 状态一并保留的备份方案
