# 基准测试

LiteLLM Gateway 的性能测试结果。

## 高吞吐性能测试结果 {#high-throughput-profile-3000-rps-with-50k-to-100k-token-prompts}

**每分钟处理 135 亿 Token**（TPM）。

| 指标 | 结果 |
|---|---:|
| 每秒请求数 | 3,000 |
| 客户端 HTTP 200 成功率 | 100.00% |
| 网关请求延迟（p50） | 30.581 ms |
| 网关请求延迟（p95） | 54.029 ms |
| 网关请求延迟（p99） | 91.645 ms |
| 客户端首 Token 时间（p50） | 31.667 ms |

### 测试方法

| 项目 | 配置 |
|---|---|
| 部署 | 33 个网关 Pod；每个 Pod 申请 4 个 worker、4 个 vCPU 和 16 GiB 内存 |
| 流量 | 分布式 Locust，30 个负载生成 worker；3,000 个用户，每人每秒发 1 个请求 |
| 请求 | `/v1/chat/completions`；50K、75K、100K Token 的提示词各占三分之一；流式请求占 50%；`max_tokens: 16` |
| 模型与网络 | 进程内 mock 模型；公网 AWS Application Load Balancer；客户端超时 60 秒 |
| 配置 | [高吞吐 Helm 配置](./proxy/high_throughput.md)；PostgreSQL 与 Redis；启用虚拟密钥预算、Token 计数、花费追踪和指标采集；关闭响应缓存 |
| 时长 | 24 分 22 秒 |
| 数据采集 | Prometheus 采集吞吐量与网关延迟；Locust 采集客户端成功率与首 Token 时间（含上传与负载均衡耗时） |

## Realtime API 性能测试结果 {#realtime-api-benchmarks}

**每秒 1,207 个请求**。

| 指标 | 结果 |
|---|---:|
| 端到端延迟（p50） | 59 ms |
| 端到端延迟（p95） | 67 ms |
| 端到端延迟（p99） | 99 ms |
| 平均端到端延迟 | 63 ms |

### 测试方法

| 项目 | 配置 |
|---|---|
| 部署 | 4 个网关实例；每个实例 4 个 worker、4 个 vCPU 和 8 GB 内存 |
| 流量 | Locust；1,000 个用户，请求间隔 0.5 至 1 秒 |
| 请求 | 走持久 WebSocket 连接的 `/v1/realtime`；文本请求要求生成一个带随机 ID 的两句话故事 |
| 模型与网络 | mock 的 realtime 端点 |
| 配置 | PostgreSQL；Redis 已禁用 |
| 时长 | 未记录 |
| 数据采集 | [Locust 脚本](https://gist.github.com/AlexsanderHamir/73b83ada21d9b84d4fe09665cf1745f5)：每秒请求数，以及到收到 `response.done` 为止的延迟（需要时含连接建立时间） |

## 短提示词对话性能测试结果 {#short-prompt-chat-performance-test-results}

**四个实例下每秒 1,170 个请求，p95 网关开销 8 ms**。

| 指标 | 2 个实例 | 4 个实例 |
|---|---:|---:|
| 每秒请求数 | 1,035.7 | 1,170 |
| 请求延迟（p50） | 200 ms | 100 ms |
| 请求延迟（p95） | 630 ms | 150 ms |
| 请求延迟（p99） | 1,200 ms | 240 ms |
| 平均请求延迟 | 262.46 ms | 111.73 ms |
| 网关开销（p50） | 12 ms | 2 ms |
| 网关开销（p95） | 29 ms | 8 ms |
| 网关开销（p99） | 43 ms | 13 ms |
| 平均网关开销 | 14.74 ms | 3.32 ms |

### 测试方法

| 项目 | 配置 |
|---|---|
| 部署 | 2 或 4 个实例；每个实例 4 个 vCPU 和 8 GB 内存。4 实例测试每个实例用 4 个 worker；2 实例的 worker 数未记录 |
| 流量 | Locust；1,000 个用户，请求间隔 0.5 至 1 秒 |
| 请求 | `/chat/completions`；[4 实例脚本](https://gist.github.com/AlexsanderHamir/42c33d7a4dc7a57f56a78b560dee3a42)发送一段带随机 ID 的文本并重复 150 次。2 实例的负载内容未记录 |
| 模型与网络 | mock 的 OpenAI 端点 |
| 配置 | PostgreSQL；Redis 已禁用 |
| 时长 | 未记录 |
| 数据采集 | Locust 采集请求吞吐量与完整请求延迟；网关开销取自 `x-litellm-overhead-duration-ms` 响应头 |

## 日志回调性能测试结果 {#logging-callbacks}

| 配置 | 每秒请求数 | 请求延迟中位数 |
|---|---:|---:|
| 基础代理 | 1,133.2 | 140 ms |
| GCS Bucket 日志 | 1,137.3 | 138 ms |
| LangSmith 日志 | 1,135 | 132 ms |

### 测试方法

| 项目 | 配置 |
|---|---|
| 部署 | 未记录 |
| 流量 | 未记录 |
| 请求 | 未记录 |
| 模型与网络 | 未记录 |
| 配置 | 对比三种配置：基础代理、[GCS Bucket 日志](./observability/gcs_bucket_integration.md)、[LangSmith 日志](./observability/langsmith_integration.md) |
| 时长 | 未记录 |
| 数据采集 | 每秒请求数与请求延迟中位数 |
