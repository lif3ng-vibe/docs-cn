---
title: "配置与故障排查"
description: "配置独立 Lens 的凭据、网络，以及可选的 LiteLLM 连接。"
slug: "/proxy/lens/deployment/configuration"
---

# 配置与故障排查

部署相关设置请以 [Lens 安装指南](https://github.com/BerriAI/lens/blob/main/deploy/lens/README.md) 为准。若要在已有项目中完成配置，[帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md)提供了覆盖独立 Lens、网关连接与外部存储的提示词

## 凭据

| 凭据 | 用途 |
| --- | --- |
| Lens 管理员令牌 | 登录独立 Lens 并管理其 API |
| Lens 追踪密钥 | 在分配的作用域内上传 Agent 遥测数据 |
| ClickHouse 凭据 | 让 Lens 初始化其存储并进行读写 |
| 分析或评估提供商密钥 | 让 Lens 调用已配置的提供商 |
| 网关服务与签名凭据 | 为可选的内部连接和受托身份提供认证 |
| LiteLLM 用户密钥或模型密钥 | 在网关既有的认证与模型规则下访问网关 |

独立版 starter 会在 `deploy/lens/.env` 中创建管理员令牌和数据库密码。独立追踪安装需要这些凭据和一个追踪密钥。Investigations、Signals 和评估判分则分别需要对应的提供商配置。只有在连接 LiteLLM 时才需要网关连接密钥

部署密钥务必保密，并与你的恢复材料一同保存。网关拥有自己的数据库和加密密钥，与 Lens 的 ClickHouse 存储相互独立

## 发布端点 {#publish-trace-endpoint}

将 `LENS_PUBLIC_URL` 设置为浏览器访问的源（origin），例如 `https://lens.example.com`。starter 用它生成 UI、追踪地址和安全会话 Cookie。可以参照 [HTTPS 服务器示例](./server.md#3-route-https-traffic) 把独立版 UI 和 API 转发到 Lens 的 4318 端口

如需单独的数据接入地址，可在 Lens 侧设置 `LITELLM_LENS_PUBLIC_URL`，或在 Helm chart 中设置 `ingestionUrl`。该地址默认使用 Lens 公共 URL。已有的路径前缀（如 `/lens-ingest`）要保留，并且不要带 `/v1/traces`，安装流程会自动补上这个后缀

网关本身则单独使用 `LITELLM_LENS_URL` 建立私有连接，使用 `LITELLM_LENS_PUBLIC_URL` 作为展示给用户的追踪地址。请从网关、浏览器和 Agent 实际所在的网络分别验证可达性

## 在 Helm 中使用 Ingress {#dedicated-ingress}

独立的 Lens chart 在顶层提供 `publicUrl`、可选的 `ingestionUrl` 和 `ingress`。其 Ingress 可以承载独立版 UI 和 API。主机名、TLS 和 Ingress controller 的配置方法见 [Lens Helm 指南](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md)

如果 Lens 部署由网关 chart 托管，适配器配置位于 `lensWorker` 之下。外部的 Lens 部署可以通过 `lensWorker.externalServiceName` 保留网关的 `/lens-ingest` 路由。请使用与实际部署的 chart 及版本相对应的 values

## 连接 Docker 网络 {#docker-network}

容器需要一个可达的服务地址。网关容器内的 `127.0.0.1` 指向它自身。请让 Lens 和网关加入同一个用户自定义网络（保留 Lens 原有的默认网络与存储网络），或者经由双方都能访问的另一个私有地址转发

查看网关现有的网络配置（不做任何修改）：

```sh
docker inspect "<your-litellm-container>" --format '{{json .NetworkSettings.Networks}}'
```

共享网络的引用必须在两份 Compose 配置中都持久化，包括每次重建服务时保留网络覆盖设置。网关的私有 URL 请使用 Lens 的服务名和端口，例如 `http://lens:4318`。凭据与应用设置参见 [将 Lens 接入 LiteLLM](./litellm.md)

## 配置参考

| 配置项 | 服务 | 含义 |
| --- | --- | --- |
| `LENS_ADMIN_TOKEN` | Lens | 独立版管理员凭据 |
| `LENS_PUBLIC_URL` | Lens | 浏览器源，也是默认的数据接入地址 |
| `LITELLM_LENS_PUBLIC_URL` | Lens 与网关 | 向 Agent 公布的数据接入地址 |
| `LITELLM_LENS_URL` | 网关 | Lens 私有 API 的基础地址 |
| `LITELLM_LENS_SERVICE_TOKEN` | Lens 与网关 | 内部共享的服务凭据 |
| `LENS_GATEWAY_SECRET` | Lens 与网关 | 受托身份的共享签名凭据 |
| `CLICKHOUSE_URL`，或 host/user/password 相关配置 | Lens | ClickHouse HTTP 连接 |
| `CLICKHOUSE_DATABASE` | Lens | 所选数据库，独立 Lens 中默认为 `lens` |
| `AGENT_TRACING_RETENTION_DAYS` | Lens | 追踪记录保留时长，默认 14 天 |

已有的网关集成可以继续使用 `litellm` 这个 ClickHouse 数据库。请保留实际存放记录的数据库。服务端提供商配置参见[分析模型](https://github.com/BerriAI/lens/blob/main/docs/analysis.md)与 [Signals](https://github.com/BerriAI/lens/blob/main/docs/signals.md)

## 可用性与扩缩容

独立 Lens 在接收请求之前会先初始化 ClickHouse 的 schema 和状态。缺少 Keeper 配置或权限不足都会导致无法就绪。参见[外部存储要求](./storage.md#external-clickhouse)

多个 Lens 副本可以共享同一台受支持的 ClickHouse 服务器。Keeper 负责协调状态发布，但不会在服务器之间复制本地负载数据表。使用外部存储并不等于支持多服务器负载均衡或自动故障转移

网关通过一条有界的异步队列转发遥测数据。Lens 不可用时，网关的常规推理照常进行，但遥测数据可能被延迟，或在重试和队列达到上限后被丢弃。Agent 侧 exporter 有各自的重试机制。请针对你选定的部署方式和 exporter 实际验证故障期间的表现

## 故障排查

在源码仓库的 Compose 安装上执行：

```sh
docker compose -f deploy/lens/compose.yaml ps
docker compose -f deploy/lens/compose.yaml logs --tail=100 lens clickhouse
curl --fail http://localhost:4318/health/ready
```

| 现象 | 检查要点 |
| --- | --- |
| Lens 未达到就绪状态就失败 | ClickHouse 连通性、KeeperMap 配置，以及 schema 和写入权限 |
| 网关报告 Lens 不可用 | 私有 API URL、服务凭据与签名凭据是否匹配、契约是否兼容，以及 Lens 是否就绪 |
| Agent 无法上传 | 接入地址是否可达、路径前缀是否保留，以及追踪密钥是否有效 |
| HTTPS 下独立版登录失败 | `LENS_PUBLIC_URL` 是否正确、HTTPS 转发信息是否完整，以及管理员令牌是否保留 |
| 未配置分析提供商 | 应用分析模型设置及其服务端凭据，重启后检查 **Settings > Analysis** |
| 替换后找不到已保存的追踪记录 | 核对原始数据库、持久化卷以及当前用户的作用域 |

连接问题解决后，请完成[首条追踪记录检查](../deployment.md#check-the-installation)。健康检查通过并不代表存储数据或提供商访问正常
