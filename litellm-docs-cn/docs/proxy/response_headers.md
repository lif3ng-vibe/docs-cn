# 响应头

向代理发起请求时，代理会返回以下响应头：

## 速率限制响应头
[与 OpenAI 兼容的响应头](https://platform.openai.com/docs/guides/rate-limits/rate-limits-in-headers)：

| 响应头 | 类型 | 说明 |
|--------|------|-------------|
| `x-ratelimit-remaining-requests` | Optional[int] | 在耗尽速率限制之前，还允许发起的请求数 |
| `x-ratelimit-remaining-tokens` | Optional[int] | 在耗尽速率限制之前，还允许使用的 Token 数 |
| `x-ratelimit-limit-requests` | Optional[int] | 在耗尽速率限制之前，允许发起的最大请求数 |
| `x-ratelimit-limit-tokens` | Optional[int] | 在耗尽速率限制之前，允许使用的最大 Token 数 |
| `x-ratelimit-reset-requests` | Optional[int] | 速率限制重置的时间 |
| `x-ratelimit-reset-tokens` | Optional[int] | 速率限制重置的时间 |

### 速率限制响应头的工作原理

**若密钥设置了速率限制**

代理会返回[该密钥的剩余速率限制](https://github.com/BerriAI/litellm/blob/bfa95538190575f7f317db2d9598fc9a82275492/litellm/proxy/hooks/parallel_request_limiter.py#L778)。

**若密钥未设置速率限制**

代理会返回后端提供商给出的剩余请求数 / Token 数。（LiteLLM 会把后端提供商的响应头标准化为 OpenAI 格式）

如果后端提供商没有返回这些响应头，对应的值将为 `None`。

这些响应头有助于客户端了解当前的速率限制状态，并据此调整请求频率。


## 延迟响应头
| 响应头 | 类型 | 说明 |
|--------|------|-------------|
| `x-litellm-response-duration-ms` | float | 从请求到达 LiteLLM 代理到结果返回客户端的总耗时。 |
| `x-litellm-overhead-duration-ms` | float | LiteLLM 的处理开销（毫秒） |

## 重试与回退响应头
| 响应头 | 类型 | 说明 |
|--------|------|-------------|
| `x-litellm-attempted-retries` | int | 已尝试的重试次数 |
| `x-litellm-max-retries` | int | 配置的 `num_retries`，仅在至少尝试过一次重试时才会返回 |
| `x-litellm-attempted-fallbacks` | int | 已尝试的回退次数 |

`max_fallbacks` 不会作为响应头返回

## 成本追踪响应头
| 响应头 | 类型 | 说明 | 透传端点是否可用 |
|--------|------|-------------|-------------|
| `x-litellm-response-cost` | float | 本次 API 调用的成本 | |
| `x-litellm-response-cost-input` | float | 未缓存输入部分的成本 | |
| `x-litellm-response-cost-output` | float | 输出部分的成本，含推理 | |
| `x-litellm-response-cost-cache-read` | float | 提示词缓存读取的成本 | |
| `x-litellm-response-cost-cache-creation` | float | 提示词缓存写入的成本 | |
| `x-litellm-response-cost-reasoning` | float | 推理成本，属于输出部分的子集 | |
| `x-litellm-response-cost-tool-usage` | float | 内置工具的成本 | |
| `x-litellm-key-spend` | float | 该 API 密钥的累计花费 | ✅ |

各分量响应头相加即为总成本：input + cache read + cache creation + output + tool usage = `x-litellm-response-cost`。推理成本已包含在输出中，求和时不要再计入。缓存与推理响应头仅在对应成本非零时才会出现，且分量响应头只出现在非流式响应上

## LiteLLM 专属响应头
| 响应头 | 类型 | 说明 | 透传端点是否可用 |
|--------|------|-------------|-------------|
| `x-litellm-call-id` | string | 本次请求的 ID。设置 `general_settings.include_call_id_in_error_body: true` 后，也会以 `litellm_call_id` 的形式出现在 JSON 错误体中（[详情](./error_reference.md#报告问题)） | ✅ |
| `x-litellm-model-id` | string | 部署 ID（`model_info.id`） | |
| `x-litellm-model-api-base` | string | API 基础 URL | ✅ |
| `x-litellm-version` | string | LiteLLM 版本 | |
| `x-litellm-model-group` | string | 路由命中的 `model_list[].model_name`（客户端传入的 `model`） | |

### 示例

```yaml
model_list:
  - model_name: my-chat-model          # clients call this
    litellm_params:
      model: {{openai_small}}               # LiteLLM calls this upstream
    model_info:
      id: "7c9f2a1b3d8e4f0a2c6b5d9e1f3a7b8c"   # optional; auto-generated if omitted
```

| 响应头 | 示例值 | 说明 |
|--------|---------|-------|
| `x-litellm-model-group` | `my-chat-model` | `model_name` / 请求中的 `model`；不是 `litellm_params.model`。 |
| `x-litellm-model-id` | `7c9f2a1b3d8e4f0a2c6b5d9e1f3a7b8c` | 对应哪一行部署；配合 `/v1/model/info?litellm_model_id=...` 查询。 |
| 响应体中的 `model` | 通常为 `my-chat-model` | 通常会改写以匹配客户端请求；上游 ID 仍保留在配置中。 |

### 自动路由请求

对于发往[自动路由器](./auto_routing.md)的请求，请求体中的 `model` 是客户端调用的路由别名，而上述响应头标明的仍是实际应答的那份部署。无法读取响应头的客户端（包括流式消费方）可以在路由器上设置 `return_raw_model_name`，让被选中的层级改由请求体的 `model` 字段返回；参见[从响应中读取被选中的模型](./auto_routing.md#从响应中读取路由选中的模型)。

复杂度自动路由器还会以响应头形式返回记录下来的路由决策：

| 响应头 | 类型 | 说明 |
|--------|------|-------------|
| `x-litellm-complexity-router-tier` | string | 被选中的复杂度层级 |
| `x-litellm-complexity-router-cause` | string | 选中该层级的路由机制，例如 `heuristic_scorer`、`heuristic_v2`、`llm_classifier` 或某条关键词规则 |
| `x-litellm-complexity-router-score` | float | 记录下来的启发式得分 |
| `x-litellm-complexity-router-reasoning-effort` | string | 所选层级上配置的 `reasoning_effort` |

每个响应头只在该次成功尝试记录的路由决策中存在对应值时才会出现。关键词路由与 LLM 分类器决策不记录得分，因此这类路由不会返回得分响应头。推理力度（reasoning effort）响应头报告的是所选层级上配置的覆盖值，而非模型默认的推理力度，也不是分类器模型的推理力度。无效或非 ASCII 的文本值会被省略。原始启发式信号、命中的关键词以及完整的层级参数映射均不会对外暴露

对于发往 `/v1/chat/completions`、`/v1/responses` 和 `/v1/messages` 的流式与非流式请求，这些响应头均可用。回退到普通模型组之后它们不会出现。流一旦开始输出，HTTP 响应头就无法再变更

### 更多示例（示意）

| 响应头 | 示例值 | 含义 |
|--------|---------|---------|
| `x-litellm-response-cost` | `0.000214` | 本次调用的成本（美元）。 |
| `x-litellm-key-spend` | `12.847` | 该密钥在本次调用后的累计花费。 |
| `x-litellm-response-duration-ms` | `842.3` | 代理端到端耗时（毫秒）。 |
| `x-litellm-overhead-duration-ms` | `15.1` | LiteLLM 开销（毫秒）。 |
| `x-litellm-attempted-retries` | `0` | 重试次数。 |
| `x-litellm-attempted-fallbacks` | `1` | 回退到其他部署的次数。 |
| `x-litellm-call-id` | `019b2c4d-e5f6-7890-abcd-ef1234567890` | 用于日志 / 追踪。 |
| `x-litellm-version` | `1.55.3` | 版本号。 |
| `x-litellm-model-api-base` | `https://api.openai.com/v1` | 提供商基础地址（不含查询字符串）。 |

## 来自 LLM 提供商的响应头

LiteLLM 还会原样返回来自 LLM 提供商的响应头。这些响应头会加上 `llm_provider-` 前缀，以便与 LiteLLM 自身的响应头区分。

响应头示例：
```
llm_provider-openai-processing-ms: 256
llm_provider-openai-version: 2020-10-01
llm_provider-x-ratelimit-limit-requests: 30000
llm_provider-x-ratelimit-limit-tokens: 150000000
```
