---
title: "从源码构建"
description: "开发独立 Lens 及其 Rust 后端、ClickHouse 与共享 UI。"
slug: "/proxy/lens/deployment/development"
---

# 从源码构建

如果想让编码代理代劳，[代我搭建](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md)针对已有的 LiteLLM 部署（deployment）、独立 Lens 和外部 ClickHouse 各准备了一组提示词。代理在套用本指南前，应先检查已安装的版本

Lens 可基于公开的 [Lens 仓库](https://github.com/BerriAI/lens)进行开发。它承载着 Rust 后端以及 LiteLLM 内嵌的共享 UI。你可以在没有网关（gateway）或 PostgreSQL 的环境中，仅配合 ClickHouse 开发并运行 Lens

## 启动开发环境 {#local-development}

安装 Git、带 Compose v2 的 Docker、Node.js 24.14.1 或更新版本，以及 npm 11.10.0 或更新版本。在全新检出的目录中执行：

```sh
git clone https://github.com/BerriAI/lens.git
cd lens
npm ci
npm run dev
```

首次启动会构建 Lens，在 `deploy/lens/.env` 中生成私有凭据，启动 Lens 和 ClickHouse，并在 [http://127.0.0.1:3100/ui/](http://127.0.0.1:3100/ui/) 启动 UI。使用该文件中的 `LENS_ADMIN_TOKEN` 登录。请在本地读取该令牌，切勿让它进入共享日志。UI 改动会自动重新加载，开发服务器会把 API 请求转发给 Lens 容器

打开 **追踪**（Traces）页，选择 **设置追踪**（Set up tracing），挑选你的框架并创建一个追踪密钥。用生成的配置运行你的代理，然后通过 **检查追踪**（Check for traces）打开对应的运行记录。只有启用调查（investigations）或 Signals 功能时，才需要配置提供商（provider）

如果端口 4318 被占用，可改用 `LENS_PORT=4320 LENS_DEV_API_URL=http://127.0.0.1:4320 npm run dev`。UI 使用端口 3100，请先停掉之前占用该端口的预览进程

## 尝试后端改动

在 Lens 仓库根目录构建完整的运行时镜像，并用开发版 UI 启动：

```sh
docker build --build-arg LENS_VERSION=local-test \
  -f deploy/runtime/Dockerfile -t lens:local-test .
LENS_IMAGE=lens:local-test npm run dev
```

每次修改 Rust 代码后，都需要重新构建并重启。容器内包含静态 UI，以及调查功能所用的原生 Linux 计算沙箱。Rust 工具链、定向检查、UI 包检查与仓库布局详见 [Lens 开发](https://github.com/BerriAI/lens/blob/main/CONTRIBUTING.md)

## 停止与恢复

Ctrl-C 会停止 UI 开发服务器。执行以下命令，可在保留数据的前提下停止 Lens 和 ClickHouse：

```sh
docker compose -f deploy/lens/compose.yaml stop
```

再次运行 `npm run dev` 即可继续。请保留环境文件和 ClickHouse 卷，这样凭据和已保存的记录都不会丢失

如果想在无开发工具的情况下从源码安装，请参考[运行 Lens](https://github.com/BerriAI/lens/blob/main/deploy/lens/README.md)。该指南还说明了当前已发布版本的最新状态。官方成对发布采用相同的 Lens 与 LiteLLM 版本；接入网关需要兼容的适配器，以及[网关集成指南](./docker-compose.md)中描述的凭据
