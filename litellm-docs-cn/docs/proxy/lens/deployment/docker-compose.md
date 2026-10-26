---
title: "将 Lens 接入 Docker Compose"
description: "把运行中的 Lens 服务接入你现有的 LiteLLM Compose 部署。"
slug: "/proxy/lens/deployment/docker-compose"
---

# 将 Lens 接入 Docker Compose

如果 LiteLLM 已经用 Docker Compose 跑起来了，就可以按本指南把 Lens 接进来。Lens 可以放在另一个 Compose 项目里，部署到 Render 上，或者放在任何其他可达的服务器上。网关现有的服务、模型配置、数据库和数据卷都保持不动。

## 1. 准备连接参数 {#1-set-the-connection-values}

先完成[将 Lens 接入 LiteLLM 的第 1–3 步](./litellm.md#1-获取-lens-地址)。你需要一个就绪的 Lens URL，以及已经在 Lens 上配好的两个连接密钥。

在网关 Compose 文件所在目录，新建一个私有的 `lens-gateway.env` 文件，写入以下值：

```dotenv
LITELLM_LENS_URL=https://lens.example.com
LITELLM_LENS_PUBLIC_URL=https://lens.example.com
LITELLM_LENS_SERVICE_TOKEN=YOUR_SERVICE_SECRET
LENS_GATEWAY_SECRET=YOUR_SIGNING_SECRET
```

把 URL 和密钥替换成你自己的值。不要把这个文件提交进 Git，并限制其访问权限：

```sh
chmod 600 lens-gateway.env
```

只要网关和 agent 都能访问公网 HTTPS 的 Lens URL，两个地址就都用它。如果走共享 Docker 网络，私有地址也可以改用 `http://lens:4318`。同时保持公网 URL 对你的 agent 可达。参见 [Docker 网络配置](./configuration.md#docker-network)。

<span id="2-add-lens-to-your-compose-file" />

## 2. 应用网关配置 {#2-apply-the-gateway-settings}

在现有的 Compose 文件里，把环境变量文件挂到网关服务上。示例用的服务名是 `litellm`，实际请用你文件里的名字。已有的 `env_file` 条目全部保留：

```yaml
services:
  litellm:
    env_file:
      - lens-gateway.env
```

`environment` 里的显式取值会覆盖环境文件中的同名变量。如果这四个 Lens 变量已有定义，请一并更新，保证两处一致。拆分部署时，网关和后端/API 服务都要挂上这个文件。

把下面这段合并进网关现有的 `config.yaml`：

```yaml
general_settings:
  tracing:
    store:
      type: lens
```

不要动其他 `general_settings` 配置项，也不要改模型列表。

## 3. 重建网关 {#3-start-lens}

在网关的 Compose 目录下，先列出所有服务名：

```sh
docker compose config --services
```

重建网关服务，让新配置生效。把 `litellm` 换成实际的服务名。拆分部署时，后端服务也要一起重建：

```sh
docker compose up -d --no-deps litellm
```

平时部署用到的 Compose 文件或项目参数照常带上。这一步会重启所选服务，可能短暂中断请求。

## 4. 检查结果 {#4-check-the-installation}

登录 LiteLLM 并选择 **Lens**。先做一次[连接检查](./litellm.md#5-在网关中打开-lens)，再[发送第一条追踪记录](../first-trace.md)。现有的模型请求应当不受影响，继续正常工作。
