---
title: 服务器调优
description: LiteLLM 代理容器的深度调优选项：替代 ASGI 服务器、worker 回收、无感重启、TLS、keepalive，以及从对象存储加载配置。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 服务器调优

只有当默认配置无法满足需求时，才需要读这一页。大多数部署应当每个 pod 运行一个 Uvicorn worker 并做横向扩缩容，详见[生产环境检查清单](./prod.md#容量规划与-worker)。当你需要在单个容器内打包多个 worker、在代理层终结 TLS、提供 HTTP/2 服务，或者无法在宿主机上挂载配置文件时，下面的选项才有用武之地。所有命令行参数见 [CLI 参考](./cli.md)。

## Uvicorn 与 Gunicorn

LiteLLM 代理默认运行在 [Uvicorn](https://uvicorn.dev/) 上。如果传入 `--run_gunicorn`，则会以 [Gunicorn](https://gunicorn.org/) 作为进程管理器，由它监管 [Uvicorn worker 进程](https://uvicorn.dev/deployment/#gunicorn)（`uvicorn.workers.UvicornWorker`）。无论哪种方式，你的应用代码都运行在 Uvicorn 上；区别只在于由哪个进程来管理并回收 worker。

| | Uvicorn（默认） | Gunicorn（`--run_gunicorn`） |
|---|---|---|
| **适用场景** | 几乎所有部署都推荐使用，尤其是 Kubernetes 上每个 pod 一个 worker 的场景。 | 当你在**单个容器内运行多个 worker**，并希望由成熟的进程管理器来监管和回收它们时选用。 |
| **worker 回收** | 使用 Uvicorn 的 [`limit_max_requests`](https://uvicorn.dev/settings/#resource-limits)。 | 使用 Gunicorn 的 [`max_requests`](https://gunicorn.org/reference/settings/#max_requests)，这是 Gunicorn 多年来久经考验的机制。 |
| **进程监管** | 使用 Uvicorn 内置的多进程管理器。 | 使用 Gunicorn 的 [arbiter](https://gunicorn.org/design/#arbiter)，在 worker 退出时逐一重启。 |

:::tip[推荐]

在 Kubernetes 上，请**每个 pod 运行一个 Uvicorn worker**，并按**横向**（增加 pod 数量）而非纵向（增加每个 pod 的 worker 数量）扩缩容。每个 pod 一个进程可以让负载下的延迟保持可预测，让 Horizontal Pod Autoscaler 更准确地套用[生产环境检查清单中的阈值](./prod.md#自动扩缩容)，也让滚动重启做到无感，因为 Kubernetes 每次只清空一个 pod。只有在必须把多个 worker 塞进一个容器时才选 Gunicorn。

:::

### 回收 worker

如果发现在持续负载下内存逐渐增长，可以让每个 worker 处理固定数量的请求后回收自身，从而把内存占用控制在一定范围内。`--max_requests_before_restart` 在默认服务器上对应 Uvicorn 的 [`limit_max_requests`](https://uvicorn.dev/settings/#resource-limits)，在 `--run_gunicorn` 下对应 Gunicorn 的 [`max_requests`](https://gunicorn.org/reference/settings/#max_requests)。可通过 CLI 参数或环境变量配置：

```shell
# CLI
CMD ["--port", "4000", "--config", "./proxy_server_config.yaml", "--num_workers", "1", "--max_requests_before_restart", "10000"]

# or ENV (for deployment manifests / containers)
export MAX_REQUESTS_BEFORE_RESTART=10000
```

:::tip

当你**在一个容器内运行多个 worker** 且依赖 `--max_requests_before_restart` 时，优先选择 `--run_gunicorn`。Gunicorn 的 [`max_requests`](https://gunicorn.org/reference/settings/#max_requests) 回收机制比 Uvicorn 更成熟，其 [arbiter](https://gunicorn.org/design/#arbiter) 会逐一重启 worker，因此在替换某个 worker 的过程中 pod 仍能继续处理流量。

:::

```shell
# Multiple workers in one container, with Gunicorn-managed recycling
CMD ["--port", "4000", "--config", "./proxy_server_config.yaml", "--num_workers", "4", "--run_gunicorn", "--max_requests_before_restart", "10000"]
```

多个 worker 同时启动且处理的流量相近时，几乎会同时达到请求阈值并步调一致地回收，导致容量一次性跌掉一大块。加上 `--max_requests_before_restart_jitter` 后，每个 worker 的阈值会在 `[0, jitter]` 区间内随机偏移，让重启错开而不是同步发生。该参数对应 Uvicorn 的 [`limit_max_requests_jitter`](https://uvicorn.dev/settings/#resource-limits)（需要 `uvicorn>=0.41.0`）和 Gunicorn 的 [`max_requests_jitter`](https://gunicorn.org/reference/settings/#max_requests_jitter)，未设置 `--max_requests_before_restart` 时不起作用。

```shell
# Stagger recycling so workers don't all restart at once
CMD ["--port", "4000", "--config", "./proxy_server_config.yaml", "--num_workers", "4", "--run_gunicorn", "--max_requests_before_restart", "10000", "--max_requests_before_restart_jitter", "1000"]
```

### 让重启无感进行

所谓“无感”重启，是指进行中的请求都能在进程退出前完成，任何客户端都不会遇到连接被切断。生产环境中有两种情况需要关注：

**worker 回收**（来自 `--max_requests_before_restart`）。两种服务器在回收 worker 时都会停止接收新连接，等未完成的请求排空后再退出，然后启动替代 worker。收到 [`SIGTERM`](https://gunicorn.org/signals/) 时，Gunicorn 还会在 [`graceful_timeout`](https://gunicorn.org/reference/settings/#graceful_timeout)（默认 30 秒）内额外保障进行中的请求。每个 pod 只有一个 worker 时，回收会让该 pod 的容量短暂下降，这正是我们建议横向扩缩容的原因，让负载均衡器可以把流量绕开这个 pod。

**滚动发布与 pod 重启**（Kubernetes）。在编排层实现无感重启，而不是仅依赖服务器本身：

- 采用 [`RollingUpdate`](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment) 策略（Deployment 的默认策略），确保新 pod 先进入 Ready 状态，旧 pod 再被终止。
- 在 `/health/readiness` 上配置[就绪探针](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)，让 Kubernetes 只把流量发给能处理请求的 pod，并且一旦开始终止就立即停止向该 pod 路由流量。
- 将 [`terminationGracePeriodSeconds`](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination) 设置为明显大于你最长的预期请求耗时（LiteLLM 的请求超时默认 600 秒，参见[推荐配置](./prod.md#设置请求超时)）。终止时 Kubernetes 发送 `SIGTERM`，Uvicorn 和 Gunicorn 都会[优雅](https://uvicorn.dev/deployment/)关闭，先排空进行中的请求再退出。
- 可选：加一个简短的 [`preStop` 钩子](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/#container-hooks)（例如 `sleep 5`），给负载均衡器留出在服务器开始关闭前注销该 pod 的时间，消除终止中的 pod 仍可能收到流量的短暂窗口。

```yaml title="实现无感滚动重启的 Kubernetes Deployment 片段"
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0   # never drop below desired replica count
      maxSurge: 1         # add one new pod at a time
  template:
    spec:
      terminationGracePeriodSeconds: 620   # > your longest request (request_timeout: 600)
      containers:
        - name: litellm
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 4000
          lifecycle:
            preStop:
              exec:
                command: ["sh", "-c", "sleep 5"]
```

## 在代理层终结 TLS

如果 TLS 由代理本身（而非你的负载均衡器）终结，传入私钥和证书路径：

```shell
docker run docker.litellm.ai/berriai/litellm:latest \
    --ssl_keyfile_path ssl_test/keyfile.key \
    --ssl_certfile_path ssl_test/certfile.crt
```

## 用 Hypercorn 提供 HTTP/2

要提供 HTTP/2 服务，需要构建一个装有 hypercorn 的镜像，并传入 `--run_hypercorn`：

```shell
FROM docker.litellm.ai/berriai/litellm:latest
WORKDIR /app
COPY config.yaml .
RUN chmod +x ./docker/entrypoint.sh
EXPOSE 4000/tcp
RUN uv add hypercorn
CMD ["--port", "4000", "--config", "config.yaml"]
```

```shell
docker run \
    -v $(pwd)/proxy_config.yaml:/app/config.yaml \
    -p 4000:4000 \
    -e DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname> \
    -e LITELLM_MASTER_KEY="sk-<paste-a-long-random-key>" \
    your_custom_docker_image \
    --config /app/config.yaml \
    --run_hypercorn
```

## 到提供商的出站 HTTP/2

v1.103.0 起可用。

上面的服务器参数只影响客户端到 LiteLLM 这一跳。LiteLLM 调用 LLM 提供商时默认使用 HTTP/1.1，因为默认的 aiohttp 传输层没有 HTTP/2 客户端。在 `litellm_settings` 下设置 `http2: true`（或设置环境变量 `LITELLM_HTTP2`），LiteLLM 就会通过 TLS 与提供商协商 HTTP/2；不通过 ALPN 提供 `h2` 的上游会自动回退到 HTTP/1.1，纯 `http://` 上游则始终使用 HTTP/1.1。

```yaml
litellm_settings:
  http2: true
```

启用后，发往提供商的流量会改走 httpx 而不是 aiohttp，默认选择 aiohttp 是因为它的 HTTP/1.1 吞吐更高。在全网启用之前，请先打开该开关做负载测试。你自己通过 `litellm.client_session` 或 `litellm.aclient_session` 传入的客户端会按原样使用，不会切换到 HTTP/2。`aiohttp_openai/` 提供商上的部署始终使用 aiohttp 并保持在 HTTP/1.1；如果该开关对这类请求生效，LiteLLM 会记录一条警告。

## Granian ASGI 服务器 [Beta]

:::info[Beta 功能]
`--run_granian` 目前处于 **beta** 阶段，默认服务器仍是 Uvicorn。当你需要更高的网关吞吐，或发现 uvicorn 在负载下不稳定时，可以尝试 Granian；问题请到 [GitHub](https://github.com/BerriAI/litellm/issues) 反馈。
:::

[Granian](https://github.com/emmett-framework/granian) 是一个由 Rust 驱动的 ASGI 服务器。在 LiteLLM 的基准测试中，相同 worker 数量下它比 uvicorn 高出 10 到 20 RPS，持续负载下延迟更平稳，错误率也更低（见 [PR #26027](https://github.com/BerriAI/litellm/pull/26027)）。可通过 `--num_workers` 扩展吞吐。

```shell
docker run docker.litellm.ai/berriai/litellm:latest \
    --config /app/config.yaml \
    --port 4000 \
    --run_granian \
    --num_workers 4
```

在 Granian 上启用 TLS 时，`--ssl_certfile_path` 和 `--ssl_keyfile_path` 都必须提供。Granian 不支持：`--max_requests_before_restart`（按请求回收 worker 请改用 Gunicorn）和 `--ciphers`（仅 Hypercorn 支持）。参见 [CLI 服务器后端选项](/docs/proxy/cli#服务器后端选项)。

## 单 worker 准入控制

事件循环已经饱和的 worker 仍会继续接受连接，因此在负载尖峰期间，调用方要干等数秒却得不到任何过载信号，而存活探针（运行在同一个循环上）也会慢到让 Kubernetes 重启 pod，把负载推给其余副本。准入控制为每个 worker 进程承担的工作量设置硬上限，并把超出的部分转成明确且快速的 `503`，客户端可以据此重试。

```yaml
general_settings:
  max_in_flight_requests_per_worker: 64   # requests being processed at once, per worker process
  max_queued_requests_per_worker: 64      # requests waiting for a slot; defaults to the in-flight cap
  admission_queue_timeout_seconds: 1.0    # a queued request is rejected after waiting this long
```

在设置 `max_in_flight_requests_per_worker` 之前，该功能处于关闭状态。请求到达时，如果 worker 有空闲槽位就立即执行；否则进入队列等待，直到有槽位空出或超时。如果队列已满，或等待超时，客户端会收到：

```
HTTP/1.1 503 Service Unavailable
retry-after: 1

{"error":{"message":"Worker at capacity: 64 in-flight, 64 queued requests. Retry later.","type":"overloaded_error","code":"503"}}
```

槽位会一直占用到整个响应结束，因此一次流式补全在最后一个分片发出之前都算作一个进行中的请求；客户端断开连接（无论在排队中还是处理中）都会立即释放槽位。探针与指标路径（`/health/liveliness`、`/health/liveness`、`/health/readiness`、`/health/readiness/details`、`/health/backlog`、`/health/drain`、`/metrics`）不经过这道闸门，因此过载的 worker 仍能快速响应存活探针，而真正卡死的进程则不会。拒绝发生在认证之前，因此不会在花费日志中记到任何密钥头上。这些限制在首个请求时读取，修改后需要重启才能生效。

该上限按 worker 进程计，在 uvicorn 和 Granian 上行为一致。以 `--num_workers 4` 启动并设置 `max_in_flight_requests_per_worker: 64` 的 pod 最多接受 256 个并发请求，N 个副本的部署则接受它的 N 倍，因此请按你实测的单 worker 吞吐来定这个值，而不是按部署总量。它与 HPA 配合得很好：已经饱和的副本用 `503` 卸掉负载，而不是在等新副本就绪的过程中不断累积延迟。它是对 `global_max_parallel_requests` 的补充，后者是通过 Redis 协调的部署级上限：用全局上限约束提供商承受的总负载，用单 worker 上限确保任何单个事件循环不至于被压垮，且不依赖 Redis。

可以通过 `/health/backlog`（字段 `in_flight_requests`、`admitted_requests`、`queued_requests`、`rejected_requests`）或 Prometheus 指标 `litellm_admission_admitted_requests`、`litellm_admission_queued_requests`、`litellm_admission_rejected_requests_total{reason="queue_full"|"queue_timeout"}` 来监控；参见 [Pod 健康指标](/docs/proxy/prometheus#pod-健康指标)。持续出现 `queue_timeout` 拒绝说明 worker 已达容量上限，需要更多副本；`queue_full` 拒绝说明尖峰流量的到达速度快于队列的消化能力，应调大队列或增加容量。

## Keepalive 超时

默认为 5 秒；在两次请求之间，连接必须在该时限内收到新数据，否则将被断开。

```shell
docker run docker.litellm.ai/berriai/litellm:latest \
    --keepalive_timeout 75
```

也可以通过环境变量设置 `KEEPALIVE_TIMEOUT=75`。

## 从 S3 或 GCS 加载 config.yaml

如果你的部署服务（AWS Fargate、Railway 等）无法挂载配置文件，可以使用这种方式。LiteLLM 会在启动时从存储桶读取 `config.yaml`。

<Tabs>
<TabItem value="gcs" label="GCS 存储桶">

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -e LITELLM_CONFIG_BUCKET_TYPE="gcs" \
   -e LITELLM_CONFIG_BUCKET_NAME="litellm-proxy" \
   -e LITELLM_CONFIG_BUCKET_OBJECT_KEY="proxy_config.yaml" \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm:latest
```

</TabItem>
<TabItem value="s3" label="s3">

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -e LITELLM_CONFIG_BUCKET_NAME="litellm-proxy" \
   -e LITELLM_CONFIG_BUCKET_OBJECT_KEY="litellm_proxy_config.yaml" \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm:latest
```

</TabItem>
</Tabs>

## 停用在线拉取模型价格

如果你遇到冷启动时间过长，或存在网络出站限制，可以设置 `LITELLM_LOCAL_MODEL_COST_MAP="True"`，改用内置的[模型价格文件](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)，而不是在启动时在线获取。
