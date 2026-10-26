---
title: "启动独立 Lens"
description: "在本地运行 Lens 与 ClickHouse，登录并发送第一条追踪记录，无需 LiteLLM 网关。"
slug: "/proxy/lens/deployment/local"
---

# 启动独立 Lens

在你的电脑上运行 Lens 即可查看智能体的追踪记录（trace）。你需要 Git、Docker 和 Docker Compose v2，并且 Docker 须处于运行状态。启动 Lens 不需要 LiteLLM 网关、PostgreSQL，也不需要任何模型提供商的密钥。

本快速上手（quickstart）从[源码仓库](https://github.com/BerriAI/lens)构建 Lens，首次构建可能需要几分钟。已发布产物的获取方式见[版本与镜像](./releases.md)。

## 1. 启动 Lens

在终端中运行以下命令：

```sh
git clone https://github.com/BerriAI/lens.git
cd lens
./deploy/lens/start
```

脚本会构建 Lens，在 `deploy/lens/.env` 中生成凭据，并连同 ClickHouse 一起启动 Lens。等待出现 `Lens is ready at http://localhost:4318/ui/` 的提示。

再次运行该脚本时，已有凭据与已存储的数据都会保留。环境文件请妥善保管，切勿外泄。

## 2. 登录

打开[localhost:4318 上的 Lens](http://localhost:4318/ui/)，在编辑器中打开 `deploy/lens/.env`，把 `LENS_ADMIN_TOKEN` 的值复制到 Lens 登录页。

该令牌用于管理员访问。下一步会为你的智能体创建一个单独的追踪密钥。

## 3. 发送追踪记录

按照[发送你的第一条追踪记录](../first-trace.md)操作，示例会记录一次模型调用。之后参照你所用框架的指南接入自己的智能体。

智能体与 Lens 在同一台电脑上时，追踪端点为 `http://localhost:4318/v1/traces`。若智能体运行在另一个容器或另一台机器上，就需要一个它能实际访问到的地址；不要用该智能体自己的 `localhost` 来指代你的 Lens 服务器。

## 4. 选择下一步

要在现有的 LiteLLM 仪表板中使用 Lens，请[连接这份 Lens 部署](./litellm.md#1-获取-lens-地址)。要让整个团队都能使用 Lens，请参照[服务器上的 Docker Compose](./server.md)或[Kubernetes](./kubernetes.md)部署。

不配置分析模型也可以先查看追踪记录。想让 Lens 自行调查时，再[配置分析模型](https://github.com/BerriAI/lens/blob/main/docs/analysis.md)并[创建调查](../investigations.md)。

## 停止与重启

在 Lens 仓库根目录下，停止服务并保留其数据：

```sh
docker compose -f deploy/lens/compose.yaml down
```

之后用 `./deploy/lens/start` 再次启动。请保留 `deploy/lens/.env` 和 ClickHouse 卷。停止命令若加上 `--volumes`，会删除已存储的 Lens 数据。

如果启动失败，检查 Docker 状态和服务日志：

```sh
docker info
docker compose -f deploy/lens/compose.yaml ps
docker compose -f deploy/lens/compose.yaml logs --tail=100 lens clickhouse
```

需要编码智能体（coding agent）协助时，可复制[独立部署配置提示词](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#start-standalone-lens)。关于数据持久化，请参阅[备份指南](https://github.com/BerriAI/lens/blob/main/docs/backup.md)。
