import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 📈 Prometheus 指标


LiteLLM 暴露一个 `/metrics` 端点，供 Prometheus 轮询。

## 快速上手

如果你用 LiteLLM CLI 并以 `litellm --config proxy_config.yaml` 方式启动，就需要先执行 `uv add prometheus_client==0.20.0`。**litellm 的 Docker 镜像里已经预装了它**

把以下内容加入你的 proxy config.yaml：
```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}
litellm_settings:
  callbacks:
    - prometheus
```

启动代理：
```shell
litellm --config config.yaml --debug
```

测试请求：
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_large}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

在 `/metrics` 上查看指标：
```shell
curl http://localhost:4000/metrics \
  -H "Authorization: Bearer sk-..."
```

### 多 Worker 模式

多 worker 运行 LiteLLM 时，需要设置 `PROMETHEUS_MULTIPROC_DIR` 环境变量，才能跨 worker 进程聚合收集指标。

```shell
export PROMETHEUS_MULTIPROC_DIR="/prometheus_multiproc"
```

该目录由 Prometheus 客户端库用来存放可在多个 worker 进程之间共享的指标文件。请确保目录存在，且 LiteLLM 进程对它有写权限。

## 将 Prometheus 抓取与推理流量隔离

默认情况下，LiteLLM 在代理端口上渲染 `/metrics`，用的是与推理请求相同的一批 Uvicorn worker。多 worker 部署下，每次抓取都会跨 worker 聚合 Prometheus 数据。因此，规模大或基数（cardinality）高的指标集会在承接请求的 worker 上消耗 CPU，并推高长尾延迟。

LiteLLM v1.101.0 及以上版本可以改由一个专用进程提供同一套指标。配置 `--prometheus_metrics_port` 或 `PROMETHEUS_METRICS_PORT`，再让 Prometheus 改抓该端口即可。代理端口上原有的 `/metrics` 路由出于兼容考虑仍然保留，因此你可以在不打断推理流量的情况下迁移抓取目标。

必须启用 `prometheus` 回调。配置专用端口后，LiteLLM 会在需要时创建 `PROMETHEUS_MULTIPROC_DIR`，把指标进程绑定到代理的 `--host`，并随代理一起停止该进程。

```shell
litellm --config config.yaml --num_workers 4 --prometheus_metrics_port 4001
```

```yaml title="prometheus.yml"
scrape_configs:
  - job_name: litellm
    static_configs:
      - targets: ["litellm:4001"]
```

:::warning[保护指标监听端口]
专用监听端口不使用 LiteLLM 的虚拟密钥（virtual key）认证。`require_auth_for_metrics_endpoint` 只对代理端口上的 `/metrics` 生效。请只允许来自可信 Prometheus 或采集器网络的访问，不要通过公网入口或负载均衡器暴露该专用端口。
:::

### 部署配置

<Tabs>
<TabItem value="helm" label="Helm: litellm-helm">

```yaml title="values.yaml"
metricsServer:
  enabled: true
  port: 4001

serviceMonitor:
  enabled: true
```

Chart 会创建一个专用的 `<release>-litellm-metrics` `ClusterIP` Service，并把 ServiceMonitor 指向它。主 Service 保持不变，`service.type` 为 `LoadBalancer` 时也不例外。`metricsServer.port` 必须与 `service.port` 不同。

</TabItem>
<TabItem value="helm-componentized" label="Helm：组件化">

```yaml title="values.yaml"
gateway:
  metricsServer:
    enabled: true
    port: 4001
```

Chart 以 sidecar 方式运行指标服务器，与网关共享 Prometheus 多进程数据，并通过专用的 `<release>-litellm-gateway-metrics` `ClusterIP` Service 暴露监听端口；请配置 Prometheus 去发现这个私有 Service。网关 Service 保持不变。

</TabItem>
<TabItem value="aws" label="Terraform: AWS">

```hcl title="main.tf"
module "litellm" {
  source  = "BerriAI/litellm/aws"
  version = "~> 1.101"

  gateway_metrics_port         = 4001
  gateway_metrics_scrape_cidrs = ["10.0.0.0/16"]
}
```

该模块会为网关任务添加一个非必需的指标 sidecar，并且只放行来自 `gateway_metrics_scrape_cidrs` 的入站流量访问该端口。Application Load Balancer 不会路由到指标端口。`gateway_metrics_port` 为 `null`（默认值）时该功能关闭，端口 `4000` 保留给网关流量。

</TabItem>
</Tabs>

### 验证上线效果

在修改 Prometheus 抓取目标之前，先检查专用进程：

```shell
curl -fsS http://litellm:4001/health
# {"status":"healthy","multiproc_dir":"..."}

curl -fsS http://litellm:4001/metrics/ | head
```

专用端点支持的指标、标签配置、过滤和压缩与代理端口端点完全相同。代理就绪探针仍在端口 `4000` 的 `/health/readiness` 上提供。

## 虚拟密钥、团队与内部用户

用于按 [用户、密钥、团队等](virtual_keys) 维度做追踪。

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_spend_metric`                | 总花费，按 `"end_user", "hashed_api_key", "api_key_alias", "model", "team", "team_alias", "user", "user_email", "client_ip", "user_agent", "requested_model", "model_id", "api_provider", "service_tier"` 维度区分                 |
| `litellm_total_tokens_metric`         | 输入 + 输出 token 总数，按 `"end_user", "hashed_api_key", "api_key_alias", "model", "team", "team_alias", "user", "user_email", "requested_model", "model_id", "api_provider"` 维度区分     |
| `litellm_input_tokens_metric`         | 输入 token 数，按 `"end_user", "hashed_api_key", "api_key_alias", "model", "team", "team_alias", "user", "user_email", "requested_model", "model_id", "api_provider"` 维度区分     |
| `litellm_output_tokens_metric`        | 输出 token 数，按 `"end_user", "hashed_api_key", "api_key_alias", "model", "team", "team_alias", "user", "user_email", "requested_model", "model_id", "api_provider"` 维度区分             |

#### 按 Token 类型的细分指标

按 token 类型细分的计数器，把提供商上报的 `usage.prompt_tokens_details` 与 `usage.completion_tokens_details` 字段拆开呈现（例如 OpenAI 提示缓存、Anthropic 提示缓存、音频输入输出、推理 token）。这些指标是在上方总量之外**累加**的，原有 `litellm_input_tokens_metric` / `litellm_output_tokens_metric` / `litellm_total_tokens_metric` 计数器保持不变。

每个细分计数器都是**稀疏**的：只有提供商上报的对应字段非零时才会递增，因此不提供某项细分的提供商不会产生相应的序列。标签集与父级输入 / 输出 token 计数器完全一致，可以在 PromQL 中放心地做 join。

| 指标名                                      | `usage` 上的来源字段                                              | 常见提供商                                  |
|--------------------------------------------------|----------------------------------------------------------------------|----------------------------------------------------|
| `litellm_input_cached_tokens_metric`             | `prompt_tokens_details.cached_tokens`                                | OpenAI 提示缓存、Anthropic `cache_read_input_tokens`、DeepSeek `prompt_cache_hit_tokens` |
| `litellm_input_cache_creation_tokens_metric`     | `prompt_tokens_details.cache_creation_tokens`                        | Anthropic `cache_creation_input_tokens`（提示缓存写入） |
| `litellm_input_audio_tokens_metric`              | `prompt_tokens_details.audio_tokens`                                 | OpenAI `gpt-4o-audio-*`、Gemini 音频输入       |
| `litellm_output_reasoning_tokens_metric`         | `completion_tokens_details.reasoning_tokens`                         | OpenAI `o1-*` / `o3-*`、Anthropic 扩展思考（extended thinking） |
| `litellm_output_audio_tokens_metric`             | `completion_tokens_details.audio_tokens`                             | OpenAI `gpt-4o-audio-*` 音频输出              |

PromQL 示例，模型组的缓存命中率：

```promql
sum by (requested_model) (rate(litellm_input_cached_tokens_metric_total[5m]))
/
sum by (requested_model) (rate(litellm_input_tokens_metric_total[5m]))
```

PromQL 示例，推理 token 占输出的比例：

```promql
sum by (requested_model) (rate(litellm_output_reasoning_tokens_metric_total[5m]))
/
sum by (requested_model) (rate(litellm_output_tokens_metric_total[5m]))
```

:::info
`litellm_input_cached_tokens_metric` 追踪的是**提供商侧**的提示缓存读取（提供商上报输入中有缓存命中的部分）。这与 `litellm_cached_tokens_metric` 不同，后者追踪的是 LiteLLM 自身响应缓存的命中（整个响应由 LiteLLM 缓存提供，没有发起提供商请求）。
:::

### 缓存指标

追踪 LiteLLM 自身的响应缓存。这三个指标都带有 `"model", "hashed_api_key", "api_key_alias", "team", "team_alias", "end_user", "user", "model_id", "api_provider"` 标签。

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_cache_hits_metric`           | 完全由 LiteLLM 响应缓存服务的请求数（未发起提供商请求） |
| `litellm_cache_misses_metric`         | 未命中 LiteLLM 响应缓存的请求数 |
| `litellm_cached_tokens_metric`        | 由 LiteLLM 响应缓存服务的 token 数 |

### 团队预算


| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_team_max_budget_metric`                    | 团队预算上限，标签：`"team", "team_alias"` |
| `litellm_remaining_team_budget_metric`             | 团队剩余预算（在 LiteLLM 上创建的团队），标签：`"team", "team_alias"` |
| `litellm_team_budget_remaining_hours_metric`        | 距团队预算重置的小时数，标签：`"team", "team_alias"` |

### 虚拟密钥预算

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_api_key_max_budget_metric`                 | API 密钥预算上限，标签：`"hashed_api_key", "api_key_alias"` |
| `litellm_remaining_api_key_budget_metric`                | API 密钥剩余预算（在 LiteLLM 上创建的密钥），标签：`"hashed_api_key", "api_key_alias"` |
| `litellm_api_key_budget_remaining_hours_metric`          | 距 API 密钥预算重置的小时数，标签：`"hashed_api_key", "api_key_alias"` |

### 内部用户预算

仅对关联了内部用户的请求上报；预算上限和重置小时数这两个 gauge 还要求该用户已设置预算。可用 [启动时初始化预算指标](#启动时初始化预算指标) 按固定周期为所有用户上报。

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_remaining_user_budget_metric`              | 内部用户剩余预算，标签：`"user"` |
| `litellm_user_max_budget_metric`                    | 内部用户预算上限，标签：`"user"` |
| `litellm_user_budget_remaining_hours_metric`        | 距内部用户预算重置的小时数，标签：`"user"` |

### 组织预算

仅对关联了组织的请求上报，条件与上面的内部用户指标相同。

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_remaining_org_budget_metric`               | 组织剩余预算，标签：`"org_id", "org_alias"` |
| `litellm_org_max_budget_metric`                     | 组织预算上限，标签：`"org_id", "org_alias"` |
| `litellm_org_budget_remaining_hours_metric`         | 距组织预算重置的小时数，标签：`"org_id", "org_alias"` |

### 客户（end_user）预算

仅当启用了 [`end_user` 追踪](#在-prometheus-上追踪-end_user) 时才上报。每次请求时，剩余预算和预算上限这两个 gauge 会基于认证期间缓存的客户行，为该请求对应的客户刷新（不产生额外数据库查询；缓存未命中则留给周期刷新处理）；重置小时数 gauge 以及近期没有流量的客户由 [启动时初始化预算指标](#启动时初始化预算指标) 覆盖，它会为每个挂了预算的客户上报全部三个 gauge。设置了 `max_end_user_budget_id` 时，没有自己预算的客户会按该默认预算上报。这些序列同样受 [在 Prometheus 上追踪 `end_user`](#在-prometheus-上追踪-end_user) 中描述的 `end_user` 基数上限约束。

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_remaining_customer_budget_metric`          | 客户剩余预算，标签：`"end_user"` |
| `litellm_customer_max_budget_metric`                | 客户预算上限，标签：`"end_user"` |
| `litellm_customer_budget_remaining_hours_metric`    | 距客户预算重置的小时数，标签：`"end_user"` |

### 虚拟密钥速率限制

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_remaining_api_key_requests_for_model`                | LiteLLM 虚拟 API 密钥的剩余请求数，仅当该虚拟密钥设置了按模型的速率限制（rpm）时上报。标签：`"hashed_api_key", "api_key_alias", "model", "model_id"` |
| `litellm_remaining_api_key_tokens_for_model`                | LiteLLM 虚拟 API 密钥的剩余 token 数，仅当该虚拟密钥设置了按模型的 token 限制（tpm）时上报。标签：`"hashed_api_key", "api_key_alias", "model", "model_id"` |


### 启动时初始化预算指标

如果希望 litellm 无论密钥、团队有没有在收请求，都上报全部密钥和团队的预算指标，就在 `config.yaml` 中把 `prometheus_initialize_budget_metrics` 设为 `true`。

**工作方式**：

- 若 `prometheus_initialize_budget_metrics` 设为 `true`
  - litellm 每 5 分钟运行一次定时任务，从数据库读取所有密钥、团队、内部用户和组织
  - 然后为其中每一项上报预算指标
  - 用于填充 `/metrics` 端点上的预算指标

```yaml
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_initialize_budget_metrics: true
```


## Pod 健康指标

用这组指标衡量每个 Pod 的队列深度，并诊断发生在 LiteLLM 开始处理请求**之前**的延迟。

| 指标名 | 类型 | 说明 |
|---|---|---|
| `litellm_in_flight_requests` | Gauge | 该 uvicorn worker 上当前进行中的 HTTP 请求数，实时反映 Pod 的队列深度。多 worker 时对所有存活 worker 求和（`livesum`）。 |
| `litellm_admission_admitted_requests` | Gauge | 当前占用每 worker 准入槽位的请求数。仅在启用 [每 worker 准入控制](./server_tuning#单-worker-准入控制) 时上报。跨存活 worker 求和（`livesum`）。 |
| `litellm_admission_queued_requests` | Gauge | 正在等待每 worker 准入槽位的请求数。跨存活 worker 求和（`livesum`）。 |
| `litellm_admission_rejected_requests_total` | Counter | 被准入控制以 `503` 拒绝的请求数，按 `reason` 打标签：`queue_full`（到达时队列已满）或 `queue_timeout`（等待 `admission_queue_timeout_seconds` 后仍未拿到槽位）。 |

### 何时使用

LiteLLM 从 handler 开始执行时才计时。如果请求在 handler 运行前就滞留在 uvicorn 的事件循环里，这段等待在 LiteLLM 自己的日志中不可见。`litellm_in_flight_requests` 能显示 Pod 在任意时刻的负载情况。

```
high in_flight_requests + high ALB TargetResponseTime → pod overloaded, scale out
low  in_flight_requests + high ALB TargetResponseTime → delay is pre-ASGI (event loop blocking)
```

也可以不经过 Prometheus，直接查看当前值：

```bash
curl http://localhost:4000/health/backlog \
  -H "Authorization: Bearer sk-..."
# {"in_flight_requests": 47}
```

## 代理级别追踪指标

用于追踪 LiteLLM 代理的整体使用情况。
- 追踪到达代理的实际流量速率
- 发往代理的请求中**客户端侧**的请求数和失败数

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_proxy_failed_requests_metric`             | 来自代理的失败响应总数，即客户端没有从 litellm 代理拿到成功响应。标签：`"end_user", "hashed_api_key", "api_key_alias", "requested_model", "team", "team_alias", "user", "user_email", "exception_status", "exception_class", "route", "client_ip", "user_agent", "model_id", "api_provider"`          |
| `litellm_proxy_total_requests_metric`             | 发往代理服务器的请求总数，即客户端侧的请求数。标签：`"end_user", "hashed_api_key", "api_key_alias", "requested_model", "team", "team_alias", "user", "status_code", "user_email", "route", "client_ip", "user_agent", "model_id", "api_provider"`。可选包含 `"stream"` 标签，见 [上报 Stream 标签](#上报-stream-标签)。          |

### 回调日志指标

监控日志发往下游回调（如 S3 冷存储）时的失败情况

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_callback_logging_failures_metric` | 向已配置回调上报日志的失败尝试总数。标签：`"callback_name"`。可用于对回调投递问题告警，例如写入 S3、`langfuse`、`langfuse_otel` 及其他 otel 提供商时反复失败的情况 |

**支持的回调**：
- `S3Logger` - S3 冷存储失败
- `langfuse` - Langfuse 日志失败
- `otel` -  OpenTelemetry 日志失败

## 防护栏指标

仅在实际运行了 [防护栏（guardrails）](guardrails/quick_start) 时上报。

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_guardrail_requests_total` | 防护栏调用总次数。标签：`"guardrail_name", "status", "hook_type"` |
| `litellm_guardrail_errors_total` | 防护栏执行过程中遇到的错误总数。标签：`"guardrail_name", "error_type", "hook_type"` |
| `litellm_guardrail_latency_seconds` | 防护栏执行延迟（秒）的直方图。标签：`"guardrail_name", "status", "error_type", "hook_type"` |

## MCP 网关指标

仅对通过 [MCP 网关](../mcp) 发起的 MCP 工具调用上报。两个指标都带有 `"mcp_tool_name", "mcp_server_name", "hashed_api_key", "api_key_alias", "team", "team_alias", "user", "end_user"` 标签。

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_mcp_tool_calls_total` | MCP 工具调用总次数，按工具名和服务器名细分 |
| `litellm_mcp_tool_call_spend_metric` | MCP 工具调用的总花费；仅当调用成本非零时递增 |

## 托管批处理指标

仅企业版。使用 [LiteLLM 托管批处理（managed batches）](managed_batches) 以及对它们做成本追踪的 CheckBatchCost 后台任务时上报。

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_managed_batch_created_total` | 创建的托管批处理总数。标签：`"model", "api_provider", "user", "user_email", "api_key_alias"` |
| `litellm_managed_file_created_total` | 创建的托管文件总数。标签：`"model", "api_provider", "user", "user_email", "api_key_alias"` |
| `litellm_managed_file_deleted_total` | 托管文件删除总数，含成功与被阻止的。标签：`"result"` |
| `litellm_managed_file_size_bytes` | 最近一个托管批处理文件的大小（字节），每个标签组合保留最后一次观测值。标签：`"purpose", "file_type", "model", "api_provider", "user"` |
| `litellm_managed_batch_duration_seconds` | 已完成批处理耗时（秒）的直方图（completed_at - created_at）。标签：`"model", "api_provider"` |
| `litellm_check_batch_cost_jobs_polled` | 上一次 CheckBatchCost 轮询发现的未处理批处理数 |
| `litellm_check_batch_cost_jobs_processed_total` | CheckBatchCost 成功完成成本追踪的批处理总数。标签：`"model", "api_provider"` |
| `litellm_check_batch_cost_errors_total` | CheckBatchCost 中按错误类型统计的错误总数。标签：`"error_type"` |
| `litellm_check_batch_cost_last_run_timestamp` | CheckBatchCost 任务最近一次运行的 Unix 时间戳 |

## LLM 提供商指标

用于监控 LLM API 错误，并追踪剩余速率限制和 token 限制

### 追踪的标签

| 标签 | 说明 |
|-------|-------------|
| litellm_model_name | LiteLLM 所用 LLM 模型的名称 |
| requested_model | 请求中发送的模型 |
| model_group | 该部署所属的 `config.yaml` 中的 `model_name`；按它分组即可每个模型池一条序列 |
| model_id | 部署的 model_id。由 LiteLLM 自动生成，每个部署都有唯一的 model_id |
| api_base | 该部署的 API Base |
| api_provider | 该模型使用的 LLM API 提供商，例如（azure, openai, vertex_ai） |
| hashed_api_key | 该请求所用 API 密钥的哈希值 |
| api_key_alias | 所用 API 密钥的别名 |
| team | 该请求所属的团队 |
| team_alias | 所用团队的别名 |
| exception_status | 异常状态（如有） |
| exception_class | 异常的类名（如有） |

### 成功与失败

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_deployment_success_responses`              | 该部署成功的 LLM API 调用总数。标签：`"model_group", "requested_model", "litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias", "client_ip", "user_agent"` |
| `litellm_deployment_failure_responses`              | 某个 LLM 部署失败的 LLM API 调用总数。标签：`"model_group", "requested_model", "litellm_model_name", "model_id", "api_base", "api_provider", "exception_status", "exception_class", "hashed_api_key", "api_key_alias", "team", "team_alias", "client_ip", "user_agent"` |
| `litellm_deployment_total_requests`                 | 该部署的 LLM API 调用总数，即成功 + 失败。标签：`"model_group", "requested_model", "litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias", "client_ip", "user_agent"` |

### 剩余请求数与剩余 token 数

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_remaining_requests_metric`             | 追踪 LLM API 部署返回的 `x-ratelimit-remaining-requests`。标签：`"model_group", "api_provider", "api_base", "litellm_model_name", "hashed_api_key", "api_key_alias", "model_id"` |
| `litellm_remaining_tokens_metric`                | 追踪 LLM API 部署返回的 `x-ratelimit-remaining-tokens`。标签：`"model_group", "api_provider", "api_base", "litellm_model_name", "hashed_api_key", "api_key_alias", "model_id"` |

### 提供商预算

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_provider_remaining_budget_metric`       | LLM 提供商的剩余预算；仅在配置了 [提供商预算路由](provider_budget_routing) 时上报。标签：`"api_provider"` |

### 花费捕获率

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_spend_capture_rate`       | 在 [定时捕获率检查](spend_capture_rate) 的窗口内，LiteLLM 记为花费的金额占提供商账单的比例（捕获花费 / 提供商账单）。上一次检查没有产生比率时为 `NaN`；所有配置了数据库但未配置该检查的代理上也为 `NaN`。标签：`"api_provider"` |

### 部署状态 
| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_deployment_state`             | 部署状态：0 = 健康，1 = 部分中断，2 = 完全中断。标签：`"litellm_model_name", "model_id", "api_base", "api_provider"` |
| `litellm_deployment_latency_per_output_token`       | 部署每输出 token 的延迟。标签：`"model_group", "litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias"` |
| `litellm_deployment_tpm_limit`             | 为该部署配置的 TPM 上限；仅当配置中为该部署设置了 tpm 限制时才有值。标签：`"model_group", "litellm_model_name", "model_id", "api_base", "api_provider"` |
| `litellm_deployment_rpm_limit`             | 为该部署配置的 RPM 上限；仅当配置中为该部署设置了 rpm 限制时才有值。标签：`"model_group", "litellm_model_name", "model_id", "api_base", "api_provider"` |

#### 回退（failover）指标

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_deployment_cooled_down`             | 部署被 LiteLLM 负载均衡逻辑冷却的次数。标签：`"litellm_model_name", "model_id", "api_base", "api_provider", "exception_status"` |
| `litellm_deployment_successful_fallbacks`           | 从主模型回退到备用模型的成功请求数。标签：`"requested_model", "fallback_model", "hashed_api_key", "api_key_alias", "team", "team_alias", "exception_status", "exception_class", "model_id"` |
| `litellm_deployment_failed_fallbacks`               | 从主模型回退到备用模型的失败请求数。标签：`"requested_model", "fallback_model", "hashed_api_key", "api_key_alias", "team", "team_alias", "exception_status", "exception_class", "model_id"` |

## 请求计数指标

| 指标名          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_requests_metric`             | **已弃用**，请改用 `litellm_proxy_total_requests_metric`。发往 litellm 的 LLM 调用总数，按 API 密钥、团队、用户分别统计。标签：`"end_user", "hashed_api_key", "api_key_alias", "model", "team", "team_alias", "user", "user_email", "client_ip", "user_agent", "requested_model", "model_id", "api_provider"` |
| `litellm_zero_cost_requests_total`    | 请求本身带用量，却被记为 `$0` 花费，而该模型的价格条目费率并非为零。免费模型和无用量的请求不计入。标签：`"requested_model", "model", "model_id", "api_provider", "reason"`，其中 `reason` 为 `missing_pricing_key`、`pricing_not_applied` 或 `cost_calculation_error`。每条计入的请求还会打一条警告日志，点名缺失的价格键，见 [被计为 $0 花费的请求](cost_tracking#计价为-0-的请求) |

## 请求延迟指标

延迟 SLO 和告警请使用 `litellm_request_total_latency_metric`。它测量从请求到达代理到处理结束的完整耗时。总延迟升高时，再用其他指标判断延迟来自认证、LLM 提供商还是 LiteLLM 的处理环节。

所有请求延迟指标都是以秒为单位的 Prometheus 直方图。

| 想测量的内容 | 指标 | 测量窗口 |
|---|---|---|
| 端到端延迟 | `litellm_request_total_latency_metric` | 从请求到达到处理结束。包含认证、调用前钩子、LLM API 调用和调用后处理。 |
| 认证与请求等待时间 | `litellm_request_queue_time_seconds` | 从请求到达到调用前处理开始。包含认证和 ASGI 层排队。诊断代理 Pod 过载时，可与 [`litellm_in_flight_requests`](#pod-健康指标) 对比。 |
| LLM 提供商延迟 | `litellm_llm_api_latency_metric` | LLM API 调用从开始到结束。 |
| 首 token 时间 | `litellm_llm_api_time_to_first_token_metric` | 从 LLM API 调用开始到第一个 token。仅对流式请求上报。 |
| LiteLLM 处理开销 | `litellm_overhead_latency_metric` | LiteLLM 自身的处理时间，不含 LLM API 调用和防护栏。 |
| LiteLLM 处理与防护栏开销 | `litellm_overhead_with_guardrails_latency_metric` | LiteLLM 处理时间加上调用前和调用后防护栏，不含 LLM API 调用。调用期间的防护栏与 LLM API 调用并发执行，不计入。 |

例如，下面的查询返回最近 5 分钟的端到端 p95 延迟：

```promql
histogram_quantile(0.95, sum by (le) (rate(litellm_request_total_latency_metric_bucket[5m])))
```

按 `model_group` 分组，就能基于 `config.yaml` 得到每个模型池一条 p95，覆盖其下所有部署：

```promql
histogram_quantile(0.95, sum by (model_group, le) (rate(litellm_request_total_latency_metric_bucket[5m])))
```

<details>
<summary>请求延迟指标的标签</summary>

| 指标 | 标签 |
|---|---|
| `litellm_request_total_latency_metric`<br />`litellm_llm_api_latency_metric`<br />`litellm_llm_api_time_to_first_token_metric` | `model_group`, `end_user`, `hashed_api_key`, `api_key_alias`, `requested_model`, `team`, `team_alias`, `user`, `model`, `model_id`, `api_provider`, `service_tier` |
| `litellm_request_queue_time_seconds` | `end_user`, `hashed_api_key`, `api_key_alias`, `requested_model`, `team`, `team_alias`, `user`, `model`, `model_id`, `api_provider` |
| `litellm_overhead_latency_metric`<br />`litellm_overhead_with_guardrails_latency_metric` | `model_group`, `api_provider`, `api_base`, `litellm_model_name`, `hashed_api_key`, `api_key_alias`, `model_id` |

`litellm_request_queue_time_seconds` 不包含 `service_tier`，因为记录该指标时提供商尚未选定服务层级（service tier）。

</details>

### 配置部署与延迟指标上的调用方身份

默认情况下，部署计数器和按调用方区分的延迟直方图用 `api_key_alias` 标识调用方。设置 `prometheus_deployment_and_latency_caller_identity` 可以改用 `user_email`，或者同时暴露两个标签：

```yaml title="config.yaml"
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_deployment_and_latency_caller_identity: user_email
```

| 取值 | 调用方身份标签 | 行为 |
|---|---|---|
| `api_key_alias`（默认） | `api_key_alias` | 保持现有指标结构和既有查询不变。 |
| `user_email` | `user_email` | 在标签结构的同一位置替换 `api_key_alias`。 |
| `both` | `api_key_alias`，之后是 `user_email` | 同时输出两个维度。`user_email` 紧跟在 `api_key_alias` 之后。 |

该设置只作用于以下指标族：

- `litellm_deployment_total_requests`
- `litellm_deployment_success_responses`
- `litellm_deployment_failure_responses`
- `litellm_request_total_latency_metric`
- `litellm_llm_api_latency_metric`
- `litellm_llm_api_time_to_first_token_metric`
- `litellm_request_queue_time_seconds`
- `litellm_overhead_latency_metric`
- `litellm_deployment_latency_per_output_token`

它不影响非按调用方区分的相关指标，也不影响包含防护栏的 `litellm_overhead_with_guardrails_latency_metric`。计数器样本使用 Prometheus 的 `_total` 后缀，直方图的 `_bucket`、`_sum`、`_count` 样本都会带上选定的身份标签。

无法解析出邮箱的请求沿用 LiteLLM 一贯的 `"None"` 标签值。例如，下面的查询按解析出的邮箱分组统计提供商请求数和端到端 p95 延迟，同时排除没有邮箱的请求：

```promql
sum by (user_email) (
  rate(litellm_deployment_total_requests_total{user_email!="None"}[5m])
)
```

```promql
histogram_quantile(
  0.95,
  sum by (user_email, le) (
    rate(litellm_request_total_latency_metric_bucket{user_email!="None"}[5m])
  )
)
```

`prometheus_metrics_config.include_labels` 会按所选模式做校验：`api_key_alias` 模式下只能包含 `api_key_alias`；`user_email` 模式下只能包含 `user_email`；`both` 模式下两者可任选或同时包含。模式值非法时，代理启动即失败并抛出 `ValueError`，其中列出可接受的取值；`user_email` 模式下若对受影响的指标族设置 `include_labels: [api_key_alias]`，同样会导致启动失败，报错会同时点名这两个设置。`prometheus_exclude_labels` 在其后生效，可以移除任一身份标签。例如全局选择 `both` 再排除 `api_key_alias`，受影响指标族上就只剩 `user_email`。

:::warning
修改该设置会改变 Prometheus 采集器固定的标签结构。改动后必须重启所有 LiteLLM 代理 / 日志进程；运行中热加载配置无法重建已有的采集器。

邮箱地址属于敏感数据。除非确需按邮箱归因，否则请保持默认值；保留 [`/metrics` 上的认证](#部署配置)，并把网络访问限制在可信的 Prometheus 抓取端。
:::

`both` 会为每个观测到的完整标签组合记录一条序列；它不会为同一个请求创建第二条序列。如果别名与邮箱保持稳定的一一对应，增加邮箱标签并不会增加序列总数。只有当别名被多个用户复用、映射随时间变化，或同一别名既出现过已解析邮箱又出现过缺邮箱的情况时，基数才可能上升。

### 按服务层级拆分延迟与花费

请求延迟指标和 `litellm_spend_metric` 上的 `service_tier` 标签记录的是请求实际运行的服务层级，因此可以对比把流量迁到更便宜或更快层级前后的延迟与成本：

```promql
histogram_quantile(0.95, sum by (service_tier, le) (rate(litellm_request_total_latency_metric_bucket[5m])))
```

标签值是提供商报告其实际服务的层级，因此以 `"service_tier": "auto"` 发出的请求会归到提供商选定的具体层级（例如 `default`）之下，而不是 `auto`。提供商未上报层级时，使用请求中指定的层级；请求既没有要求也没有获得层级时，标签值为空

## 在 Prometheus 上追踪 `end_user`

默认情况下，LiteLLM 不在 Prometheus 上追踪 `end_user`，这是为了降低 LiteLLM 代理指标的基数。

如果要在 Prometheus 上追踪 `end_user`，可以这样配置：

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  callbacks: ["prometheus"]
  enable_end_user_cost_tracking_prometheus_only: true
```

每个带 `end_user` 标签的指标，包括 [客户预算 gauge](#客户end_user预算)，都受 `prometheus_end_user_metrics_max_series_per_metric` 的按指标序列上限约束（默认 `10000`，优先丢弃最老的序列）；空闲超过 `prometheus_end_user_metrics_ttl_seconds`（默认 `3600`）的序列会被移除。把任一项设为 `null` 即可关闭该限制。

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  callbacks: ["prometheus"]
  enable_end_user_cost_tracking_prometheus_only: true
  prometheus_end_user_metrics_max_series_per_metric: 500
  prometheus_end_user_metrics_ttl_seconds: 1800
```

### 上报 Stream 标签

给 `litellm_proxy_total_requests_metric` 增加 `stream` 标签，把流式与非流式请求区分开。默认关闭。

```yaml title="config.yaml"
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_emit_stream_label: true
```

启用后，`litellm_proxy_total_requests_metric` 会多出一个 `stream` 标签，取值为 `"True"`、`"False"` 或 `"None"`。

```
litellm_proxy_total_requests_metric{..., stream="True"} 42
litellm_proxy_total_requests_metric{..., stream="False"} 100
```

:::note
该标签是可选开启的：给已有指标增加新标签会改变其基数，并破坏针对该指标的既有 Prometheus 查询 / Grafana 仪表板。请只在新部署上启用，或者等你准备好更新仪表板后再开启。
:::


## [BETA] 自定义指标

在 prometheus 上针对前面提到的所有事件追踪自定义指标。

### 自定义元数据标签

1. 在 `config.yaml` 中定义自定义元数据标签

```yaml
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["prometheus"]
  custom_prometheus_metadata_labels: ["metadata.foo", "metadata.bar"]
```

2. 携带自定义元数据标签发起请求

<Tabs>
<TabItem value="Curl" label="Curl 请求">
```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <LITELLM_API_KEY>' \
-d '{
    "model": "openai/{{openai_large}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What's in this image?"
          }
        ]
      }
    ],
    "max_tokens": 300,
    "metadata": {
        "foo": "hello world"
    }
}'
```
</TabItem>
<TabItem value="key" label="在密钥上">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "foo": "hello world"
    }
}'
```
</TabItem>
<TabItem value="team" label="在团队上">

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "foo": "hello world"
    }
}'
```
</TabItem>
</Tabs>

3. 在 `/metrics` 端点上查看这些自定义指标  

```
... "metadata_foo": "hello world" ...
```

### 自定义标记

把特定标记（tag）作为 prometheus 标签输出，便于过滤和监控。

1. 在 `config.yaml` 中定义自定义标记

```yaml
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["prometheus"]
  custom_prometheus_metadata_labels: ["metadata.foo", "metadata.bar"]
  custom_prometheus_tags: 
    - "prod"
    - "staging"
    - "batch-job"
    - "User-Agent: RooCode/*"
    - "User-Agent: claude-cli/*"
```

2. 携带标记发起请求

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <LITELLM_API_KEY>' \
-d '{
    "model": "openai/{{openai_large}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What's in this image?"
          }
        ]
      }
    ],
    "max_tokens": 300,
    "metadata": {
        "tags": ["prod", "user-facing"]
    }
}'
```

3. 在 `/metrics` 端点上查看自定义标记指标

```
... "tag_prod": "true", "tag_staging": "false", "tag_batch_job": "false" ...
```

**自定义标记的工作方式**：
- 每个已配置的标记都会成为 prometheus 指标上的一个布尔标签  
- 标记匹配（精确或通配）时，标签值为 `"true"`，否则为 `"false"`
- 标记名会为兼容 prometheus 做净化处理（例如 `"batch-job"` 变成 `"tag_batch_job"`）
- 支持用 `*` 表示**通配模式**（例如 `"User-Agent: RooCode/*"` 匹配 `"User-Agent: RooCode/1.0.0"`）

**通配示例**：
```yaml
litellm_settings:
  callbacks: ["prometheus"]
  custom_prometheus_tags:
    - "User-Agent: RooCode/*"
    - "User-Agent: claude-cli/*"
``` 

**使用场景**：
- 环境追踪（`prod`、`staging`、`dev`）
- 请求类型分类（`batch-job`、`user-facing`、`background`）
- 功能开关（`new-feature`、`beta-users`）
- 团队或服务识别（`team-a`、`service-xyz`）
- User-Agent 追踪：用它统计 Roo Code、Claude Code、Gemini CLI 的使用量（`User-Agent: RooCode/*`、`User-Agent: claude-cli/*`、`User-Agent: gemini-cli/*`）


## 配置指标与标签

你可以按需只启用部分指标，并控制包含哪些标签，从而优化性能、降低基数。

### 启用特定指标与标签

在 `prometheus_metrics_config` 中指定要上报哪些指标。每个配置组需要一个 `group` 名称（用于归类）和一组要启用的 `metrics` 列表；还可以选择提供 `include_labels` 列表来过滤这些指标的标签。

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}

litellm_settings:
  callbacks: ["prometheus"]
  prometheus_metrics_config:
    # High-cardinality metrics with minimal labels
    - group: "proxy_metrics"
      metrics:
        - "litellm_proxy_total_requests_metric"
        - "litellm_proxy_failed_requests_metric"
      include_labels:
        - "hashed_api_key"
        - "requested_model"
        - "model_group"
```

启动 LiteLLM 后，如果指标配置正确，你会在容器日志里看到如下内容

<Image 
  img={require('../../img/prom_config.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


### 按指标过滤标签

控制每个指标包含哪些标签，以降低基数：

```yaml
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_metrics_config:
    - group: "token_consumption"
      metrics:
        - "litellm_input_tokens_metric"
        - "litellm_output_tokens_metric"
        - "litellm_total_tokens_metric"
      include_labels:
        - "model"
        - "team"
        - "hashed_api_key"
    - group: "request_tracking"
      metrics:
        - "litellm_proxy_total_requests_metric"
      include_labels:
        - "status_code"
        - "requested_model"
```

### 高级配置

你可以创建多个配置组，各自使用不同的标签集：

```yaml
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_metrics_config:
    # High-cardinality metrics with minimal labels
    - group: "deployment_health"
      metrics:
        - "litellm_deployment_success_responses"
        - "litellm_deployment_failure_responses"
      include_labels:
        - "api_provider"
        - "requested_model"
    
    # Budget metrics with full label set
    - group: "budget_tracking"
      metrics:
        - "litellm_remaining_team_budget_metric"
      include_labels:
        - "team"
        - "team_alias"
        - "hashed_api_key"
        - "api_key_alias"
        - "model"
        - "end_user"
    
    # Latency metrics with performance-focused labels
    - group: "performance"
      metrics:
        - "litellm_request_total_latency_metric"
        - "litellm_llm_api_latency_metric"
      include_labels:
        - "model"
        - "api_provider"
        - "requested_model"
```

**配置结构**：
- `group`：用于组织相关指标的描述性名称
- `metrics`：该组要包含的指标名列表  
- `include_labels`：（可选）这些指标要包含的标签列表

**默认行为**：未指定 `prometheus_metrics_config` 时，所有指标按默认标签启用（向后兼容）。

### 全局排除指标与标签

`prometheus_metrics_config` 是白名单式的，要求你逐个列出所有想保留的指标。如果只想去掉少量指标或标签，改用全局的 `prometheus_exclude_metrics` 和 `prometheus_exclude_labels` 选项即可。未列出的内容都按默认标签保持启用，未来 LiteLLM 版本新增的指标也会自动上报，无需再改配置。

```yaml
litellm_settings:
  callbacks: ["prometheus"]
  # Drop these metrics entirely
  prometheus_exclude_metrics:
    - "litellm_input_tokens_metric"
    - "litellm_output_tokens_metric"
  # Drop these labels from every metric that would otherwise emit them
  prometheus_exclude_labels:
    - "hashed_api_key"
    - "api_key_alias"
```

两份列表都会在启动时校验；未知的指标或标签名会引发配置错误，拼写错误立刻暴露。排除始终优先：出现在 `prometheus_exclude_metrics` 中的指标，即使被某个 `prometheus_metrics_config` 组启用也会被丢弃；`prometheus_exclude_labels` 中的标签，即使被某个组的 `include_labels` 列出也会被移除。

### 限制每个指标的序列数

指标见过的每一种标签组合都会留在代理内存中，直到进程重启，因此 `user`、`user_email`、`hashed_api_key`、`api_key_alias`、`client_ip`、`user_agent` 这类标签会随每个新调用方不断膨胀指标状态。第一道手段是去掉用不到的标签（见上文）。标签必须保留时，可设置 `prometheus_metrics_max_series_per_metric` 限制每个指标保留的序列数。该选项默认关闭，作用于 `prometheus` 回调上报的所有带标签指标

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_metrics_max_series_per_metric: 5000
```

指标最先见到的 `5000` 种标签组合各自保留一条序列。对计数器或直方图而言，之后的每种组合都记录到一条标签全为 `other` 的额外序列上，因此对指标求和依然精确，只是溢出部分丢失了按标签的细分。gauge 则直接跳过超出上限的组合，因为被众多调用方共享的一个 gauge 值没有任何意义。设置的值若不是大于 `0` 的数字会被忽略：代理启动时打一条警告，点名该设置和该值，然后按无上限方式上报指标

上限按代理实例计算。多 worker 时，同一实例的各 worker 通过 `PROMETHEUS_MULTIPROC_DIR` 中每个指标一个小文件，就保留哪些 `5000` 种组合达成一致，因此合并各 worker 的抓取结果仍能看到上限加 `other` 序列，被替换的 worker（例如因 `--max_requests_before_restart`）也会保留相同的组合。上限不跨实例共享：某个实例达到上限后，它保留的组合在另一个实例上可能是 `other`，全网对该序列求和时也只会计入保留了它的那些实例。gauge 在多 worker 下是例外：每个 worker 以自己的 `pid` 标签导出 gauge，因此每个 worker 上最多可各显示到上限

要释放已消失调用方占用的槽位，还可以设置 `prometheus_metrics_ttl_seconds`。超过这么多秒未更新的序列会被移除，检查频率至多为每 `prometheus_metrics_cleanup_interval_seconds`（默认 `60`）秒一次，空出的槽位让给下一个新的标签组合。被移除的序列会从 `/metrics` 上消失，直到再次上报为止；届时其计数器从零重新开始，PromQL 的 `rate()` 和 `increase()` 会把它视为计数器重置。TTL 若不是大于 `0` 的数字，同样会被忽略并给出相同的启动警告；清理间隔若不是不小于 `0` 的数字也会以相同警告忽略，检查仍保持默认的 `60` 秒

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_metrics_max_series_per_metric: 5000
  prometheus_metrics_ttl_seconds: 3600
```

TTL 只在单进程模式下生效。设置了 `PROMETHEUS_MULTIPROC_DIR` 时（多 worker 或 [专用指标端口](#将-prometheus-抓取与推理流量隔离)），Prometheus 客户端库无法删除已写入的序列，因此 LiteLLM 会忽略 `prometheus_metrics_ttl_seconds` 并在启动时打警告。该模式下上限依然有效，代理重启时槽位会释放，因为只要设置了 `PROMETHEUS_MULTIPROC_DIR`，`litellm` 启动时就会清空该目录（单 worker 时也一样），这样已退出 worker 的样本就不会让合并抓取超过上限。如果你绕过 `litellm` 自行启动 worker，请在它们启动前清空 `PROMETHEUS_MULTIPROC_DIR`

[在 Prometheus 上追踪 `end_user`](#在-prometheus-上追踪-end_user) 中的 `end_user` 上限是独立的设置，对带 `end_user` 标签的指标依然生效

## 监控系统健康

要监控 litellm 周边服务（redis / postgres）的健康状况，按如下方式配置：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}
litellm_settings:
  service_callback: ["prometheus_system"]
```

每个被监控的服务上报三个指标，命名为 `litellm_<service>_<type>`：

| 指标名 | 类型 | 说明 |
|---|---|---|
| `litellm_<service>_latency` | Histogram | 调用该服务的延迟（秒） |
| `litellm_<service>_failed_requests_total` | Counter | 调用该服务的失败次数。标签：`"error_class", "function_name"`，便于排查哪里在失败 |
| `litellm_<service>_total_requests_total` | Counter | 调用该服务的总次数，与失败计数器配合可计算错误率 |

被监控的服务有：

| 服务 | 说明 |
|---|---|
| `redis` | Redis 调用（缓存、限流状态） |
| `postgres` | Postgres 数据库调用（密钥、团队、花费日志）。例如：`litellm_postgres_latency`、`litellm_postgres_failed_requests_total`、`litellm_postgres_total_requests_total` |
| `auth` | 请求认证检查。有助于发现因数据库过载导致的认证变慢 |
| `batch_write_to_db` | 对数据库的批量花费 / 用量写入 |
| `reset_budget_job` | 周期性预算重置任务 |
| `router` | LiteLLM 路由器操作 |
| `proxy_pre_call` | 代理在调用 LLM API 之前运行的调用前钩子 |
| `self` | LiteLLM 自身的 API 调用处理 |

告警示例（数据库失败或变慢）：

```promql
rate(litellm_postgres_failed_requests_total[5m]) > 0
histogram_quantile(0.95, sum by (le) (rate(litellm_postgres_latency_bucket[5m]))) > 1
```
#### 数据库事务队列健康指标

使用这些指标来监控数据库事务队列（DB Transaction Queue）的健康状况，例如监控内存与 Redis 缓冲区的大小。

| 指标名称 | 说明 | 存储类型 |
|---------|------|---------|
| `litellm_pod_lock_manager_size` | 指示当前由哪个 pod 持有向数据库写入更新的锁。 | Redis |
| `litellm_in_memory_daily_spend_update_queue_size` | 内存中每日花费更新队列的项目数。这些是每个用户的汇总花费日志。 | In-Memory |
| `litellm_redis_daily_spend_update_queue_size` | Redis 每日花费更新队列的项目数。这些是每个用户的汇总花费日志。 | Redis |
| `litellm_redis_daily_end_user_spend_update_queue_size` | Redis 每日终端用户花费更新队列的项目数。 | Redis |
| `litellm_redis_daily_agent_spend_update_queue_size` | Redis 每日智能体花费更新队列的项目数。 | Redis |
| `litellm_in_memory_spend_update_queue_size` | 内存中针对密钥、用户、团队、团队成员等的汇总花费值。 | In-Memory |
| `litellm_redis_spend_update_queue_size` | Redis 中针对密钥、用户、团队等的汇总花费值。 | Redis |



## 🔥 LiteLLM 维护的 Grafana 仪表板

针对本页的 `litellm_*` 指标，LiteLLM 维护了两个 Grafana 仪表板，均位于 [`cookbook/litellm_proxy_server/grafana_dashboard`](https://github.com/BerriAI/litellm/tree/main/cookbook/litellm_proxy_server/grafana_dashboard) 文件夹中。在 **Dashboards > New > Import** 中导入 JSON，并在提示时选择你的 Prometheus 数据源即可

[All Prometheus Metrics 仪表板](https://github.com/BerriAI/litellm/tree/main/cookbook/litellm_proxy_server/grafana_dashboard/dashboard_all_metrics) 为上面表格中的每个指标都提供了一个面板，并按主题分组：流量、延迟、花费与 Token、缓存、部署、速率限制、预算、防护栏（guardrails）、MCP、托管文件与批处理、用户与团队，另加 `prometheus_system` 服务指标和数据库事务队列大小。未启用的功能对应的面板会保持空白；其 [readme](https://github.com/BerriAI/litellm/blob/main/cookbook/litellm_proxy_server/grafana_dashboard/dashboard_all_metrics/readme.md) 列出了每一行分别需要开启哪些配置项

[v2 仪表板](https://github.com/BerriAI/litellm/tree/main/cookbook/litellm_proxy_server/grafana_dashboard/dashboard_v2) 是一个紧凑视图，按模型组（model group）展示请求速率、失败数、延迟以及剩余请求与剩余 Token 仪表盘，如下所示


<Image img={require('../../img/grafana_1.png')} />

<Image img={require('../../img/grafana_2.png')} />

<Image img={require('../../img/grafana_3.png')} />


## 已废弃的指标

| 指标名称 | 说明 |
|---------|------|
| `litellm_llm_api_failed_requests_metric` | **已废弃**，请改用 `litellm_proxy_failed_requests_metric` |



## `/metrics` 端点的身份验证

**默认情况下，`/metrics` 需要 LiteLLM API 密钥身份验证**（自 v1.85.0 起）。

对于 Prometheus，请在抓取配置（scrape config）中添加 `authorization`：

```yaml
scrape_configs:
  - job_name: 'litellm'
    authorization:
      type: Bearer
      credentials: <LITELLM_API_KEY>
    static_configs:
      - targets: ['localhost:4000']
```

若要允许未经身份验证的访问：

```yaml
litellm_settings:
  require_auth_for_metrics_endpoint: false
```

## 常见问题（FAQ）

### `_created` 与 `_total` 指标有什么区别？

Python 的 Prometheus 客户端会在每个计数器（counter）和直方图（histogram）旁额外输出一个 `_created` 样本。它记录的是该序列创建时的 Unix 时间戳（通常是进程启动时，或首次出现该标签组合时），本身不参与任何计数。

做计数统计时，请使用 `_total` 指标
