# [Beta] ITPM / OTPM 独立速率限制

在路由器（router）的部署上分别强制执行**每分钟输入 Token 数**（ITPM）与**每分钟输出 Token 数**（OTPM）。

当提供商公布的是独立的输入/输出吞吐上限（例如 Bedrock Mantle 的模型卡片），而非单一合并 TPM 时，使用此功能。

:::info
它复用了与[合并 TPM/RPM 强制执行](./load_balancing#强制执行模型速率限制)相同的 `enforce_model_rate_limits` 调用前检查，只是改为在部署上设置 `itpm` / `otpm`，而非 `tpm` / `rpm`。
:::

## 快速上手

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-oss-120b
    litellm_params:
      model: bedrock_mantle/openai.gpt-oss-120b
      aws_region_name: us-east-1
      itpm: 500000   # 500K input tokens per minute
      otpm: 100000   # 100K output tokens per minute

router_settings:
  optional_pre_call_checks:
    - enforce_model_rate_limits
```

启动代理：

```bash
litellm --config /path/to/config.yaml
```

将 `itpm` / `otpm` 设置为提供商配额或模型卡片给出的值（Bedrock Mantle 用 Service Quotas 控制台，或依据你的内部容量规划）。

## Mantle 式预留

LiteLLM 采用与 [Bedrock Mantle 端点](https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-mantle.html)相同的预留模型：Token 限额在上游调用**之前**强制执行，并在响应返回后对账。

### 调用前（准入）

在请求发送给提供商之前：

1. 根据请求体（`messages`、`prompt` 或 Responses 的 `input`）**估算输入 Token 数**。
2. **确定有效输出上限**——即配额检查时代替 `max_tokens` 使用的值：

| 优先级 | 来源 | 示例（`openai.gpt-oss-120b`） |
| --- | --- | --- |
| 1 | 请求中的 `max_tokens` 或 `max_completion_tokens` | 客户端发送 `max_tokens: 1024` → 使用 `1024` |
| 2 | 模型映射中的 `max_output_tokens`（回退到 `max_tokens`） | 客户端未设上限 → 使用模型卡片中的 `32768` |
| 3 | 硬编码默认值 | 未知模型 → `4096` |

3. **ITPM 检查**：按部署的 ITPM 限额预留 `estimated_input + effective_output_cap`。若准入后将超出限额，返回 `429` 拦截。
4. **OTPM 检查**：确认 `current_otpm + effective_output_cap` 不超过 OTPM 限额。若将超出 OTPM，则回滚 ITPM 预留并返回 `429`。

这与 Mantle 的行为一致：客户端未传 `max_tokens` 时，LiteLLM 按模型的**最大输出容量**计算，而不是其输入上下文窗口。这正是大模型在缺省 `max_tokens` 时会预留大量 ITPM/OTPM 余量的原因。

:::tip
把 `max_tokens`（Responses 中为 `max_output_tokens`）设置为接近你预期的补全大小。Mantle 和 LiteLLM 都会在响应返回后向下对账，但在调用结束前，过高的默认上限仍会占住并发请求的额度。
:::

### 调用后（对账）

响应成功返回后：

| 计数器 | 记录内容 |
| --- | --- |
| **ITPM** | 用 `billable_input + completion_tokens` 替换调用前的预留值，其中 `billable_input = prompt_tokens - cached_tokens` |
| **OTPM** | 加上实际的 `completion_tokens` |

如果请求在完成前**失败**，ITPM 预留会被退还；OTPM 不扣减。

### 计算示例

向 `bedrock_mantle/openai.gpt-oss-120b`（`max_output_tokens: 32768`）发起不带 `max_tokens` 的请求，`itpm: 500000`：

| 步骤 | 计算 | ITPM 用量 |
| --- | --- | --- |
| 调用前预留 | 估算输入 `12` + 输出上限 `32768` | 预留 `32780` |
| 响应 | `prompt_tokens=10`、`completion_tokens=150`、无缓存 | — |
| 调用后对账 | `10 + 150` | 最终 `160` |

不带显式 `max_tokens` 时，调用前的占用量远大于最终扣减量，这正是 Mantle 文档描述的配额预留行为。

## 工作原理

| 阶段 | ITPM | OTPM |
| --- | --- | --- |
| **调用前** | 预留 `estimated_input + effective_output_cap` | 检查 `current_otpm + effective_output_cap` |
| **调用后** | 对账为 `billable_input + completion_tokens` | 加上实际的 `completion_tokens` |
| **失败** | 退还 ITPM 预留 | 不扣减 OTPM |

**缓存的提示词 Token**（`prompt_tokens_details.cached_tokens`）在响应后不计入 ITPM 计费。

## 响应头

当模型组（model group）配置了 `itpm` 或 `otpm` 时，LiteLLM 会返回：

| 响应头 | 说明 |
| --- | --- |
| `x-ratelimit-limit-input-tokens` | 模型组的 ITPM 限额 |
| `x-ratelimit-remaining-input-tokens` | 本分钟剩余的 ITPM 容量 |
| `x-ratelimit-reset-input-tokens` | 距分钟窗口重置的秒数 |
| `x-ratelimit-limit-output-tokens` | 模型组的 OTPM 限额 |
| `x-ratelimit-remaining-output-tokens` | 本分钟剩余的 OTPM 容量 |
| `x-ratelimit-reset-output-tokens` | 距分钟窗口重置的秒数 |

## 错误响应

在上游调用之前超出限额时：

```json
{
  "error": {
    "message": "Model rate limit exceeded. ITPM limit=500000, current usage=500120",
    "type": "rate_limit_error",
    "code": 429
  }
}
```

响应中包含 `retry-after` 头（距当前分钟窗口重置的秒数）。

## 项目级限额

在代理上为[项目](./project_management)强制执行按模型的 ITPM / OTPM 配额。创建或更新项目时设置 `model_itpm_limit` 和 `model_otpm_limit`：每个字段将模型名（客户端请求的 `model_name`）映射到一个每分钟 Token 上限。

```bash showLineNumbers
curl -X POST 'http://localhost:4000/project/new' \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "project_alias": "my-project",
    "team_id": "<team-id>",
    "models": ["claude-fable-5"],
    "model_itpm_limit": {"claude-fable-5": 300000},
    "model_otpm_limit": {"claude-fable-5": 100000}
  }'
```

使用项目密钥发起的请求会计入这些限额。强制执行方式与部署限额共用同一套预留模型：LiteLLM 在上游调用前预留输入估算值加有效输出上限，响应返回后按实际用量对账。无需额外的 Router 设置，代理的限流器会自动读取项目元数据来执行。由于项目存放在代理数据库中，此功能需要数据库支持。

### 项目响应头

对配置了项目限额的模型，成功响应会包含：

| 响应头 | 说明 |
| --- | --- |
| `x-ratelimit-model_per_project_itpm-limit-tokens` | 该模型的项目 ITPM 限额 |
| `x-ratelimit-model_per_project_itpm-remaining-tokens` | 本分钟剩余的项目 ITPM |
| `x-ratelimit-model_per_project_otpm-limit-tokens` | 该模型的项目 OTPM 限额 |
| `x-ratelimit-model_per_project_otpm-remaining-tokens` | 本分钟剩余的项目 OTPM |

### 项目错误响应

将超出项目限额的请求会在上游调用之前被 `429` 拦截：

```json
{
  "error": {
    "message": "Rate limit exceeded for model_per_project_itpm: <project-id>:claude-fable-5. Limit type: tokens. Current limit: 300000, Remaining: 300000. Limit resets at: 2026-08-18 14:48:49 UTC",
    "type": "throttling_error",
    "code": "429"
  }
}
```

## ITPM 与 TPM 对比

| 设置项 | 限制对象 | 适用场景 |
| --- | --- | --- |
| `tpm` | 每分钟总 Token 数（单一计数器） | 传统的合并吞吐上限 |
| `itpm` + `otpm` | 输入与输出分别限制 | 提供商文档区分输入/输出 TPM 时（Bedrock Mantle） |

不要在同一个部署上同时设置两种模式。只要存在 `itpm` 或 `otpm`，LiteLLM 就会走 ITPM/OTPM 路径，并忽略该部署的合并 TPM 统计。

## 多实例部署

用 Redis 在多个代理副本之间共享计数器：

```yaml showLineNumbers title="config.yaml"
router_settings:
  optional_pre_call_checks:
    - enforce_model_rate_limits
  redis_host: redis.example.com
  redis_port: 6379
  redis_password: your-password
```

## SDK 用法

```python showLineNumbers title="example.py"
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "gpt-oss-120b",
            "litellm_params": {
                "model": "bedrock_mantle/openai.gpt-oss-120b",
                "itpm": 500_000,
                "otpm": 100_000,
            },
        }
    ],
    optional_pre_call_checks=["enforce_model_rate_limits"],
)

response = await router.acompletion(
    model="gpt-oss-120b",
    messages=[{"role": "user", "content": "Hello"}],
    max_tokens=1024,  # explicit cap avoids over-reserving model max_output_tokens
)
```

## 相关阅读

- [负载均衡与合并 TPM/RPM 强制执行](./load_balancing#强制执行模型速率限制)
- [动态 TPM/RPM 分配](./dynamic_rate_limit)
- [Bedrock Mantle 配额（AWS）](https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-mantle.html)
