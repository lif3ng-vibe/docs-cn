# 错误参考

每一个经由 LiteLLM AI 网关失败的请求，都会返回兼容 OpenAI 的 JSON 错误体和相应的 HTTP 状态码。本页是解读这些错误的参考：负载里有哪些字段、哪些错误来自网关、哪些来自上游提供商、每个状态码和错误类型是什么含义，以及回退链（fallback chain）无目标可用时网关会返回什么

如果只想快速掌握区分提供商与网关的判断规则，请参阅[错误诊断](/docs/proxy/error_diagnosis)。Python SDK 的异常类和各提供商的映射表见[异常映射](/docs/exception_mapping)

## 错误负载

请求 LLM API 路由（`/chat/completions`、`/completions`、`/embeddings`、`/responses` 以及其他 OpenAI 形态的端点）失败时，返回一个顶层的 `error` 对象：

```json
{
  "error": {
    "message": "litellm.RateLimitError: RateLimitError: OpenAIException - Rate limit reached for {{openai_small}} in organization org-abc on requests per min (RPM): Limit 3, Used 3.",
    "type": "throttling_error",
    "param": null,
    "code": "429"
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `error.message` | string | 人类可读的描述。提供商故障时，这里是完整的 LiteLLM 异常字符串，同时内嵌了 LiteLLM 异常名和提供商异常名。要判断错误归属，解析的就是这个字段 |
| `error.type` | string or null | 粗粒度的分类。源自网关的错误携带 LiteLLM 特有的值，如 `budget_exceeded`、`key_model_access_denied`；源自提供商的错误携带 OpenAI 风格的值，如 `throttling_error`、`invalid_request_error`，且经常为 `null`。把它当作提示即可，别当作首要判断依据 |
| `error.param` | string or null | 出错的请求参数（网关能识别时）。缺少必填字段时为 `messages`，模型访问被拒时为 `model`，虚拟密钥（virtual key）问题时为 `key` |
| `error.code` | string | 几乎总是字符串形式的 HTTP 状态码（`"429"` 而非 `429`）。对某些提供商错误来说，这里是提供商自己的错误码字符串，例如 `"invalid_api_key"` 或 `"context_length_exceeded"` |
| `error.provider_specific_fields` | object | 可选。仅在提供商返回了值得保留的结构化细节时出现，最典型的是 Azure OpenAI 的 `innererror` 内容过滤明细。参见[异常映射](/docs/exception_mapping#访问提供商特定的错误详情) |

有三种形态与上面不同，值得了解

网关内部出现未处理异常时，返回刻意精简的响应体，不带 `param` 和 `code`，避免内部细节泄露给调用方：

```json
{"error": {"message": "Internal server error", "type": "internal_server_error"}}
```

请求不存在的路由时，Web 框架会在 LiteLLM 接手之前直接拒绝，返回框架自己的格式而非 `error` 信封。收到这种响应通常说明路径或 base URL 写错了，不是网关的错：

```json
{"detail": "Not Found"}
```

`/v1/management/*` 端点是另一套 API 面，返回 [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457)，content type 为 `application/problem+json`，成员为 `type`、`title`、`status` 和 `detail`，而不是 `error` 信封。本页记述的 LLM API 路由不受影响

相比之下，格式错误的请求体会被归一化成标准信封。无法解析的 JSON 返回 400，`error.param` 为 `request_body`；结构合法但字段类型不对的请求体返回 400，`type` 为 `invalid_request_error`

:::note

`error.code` 是字符串而不是整数。这与 [OpenAI Python 库的错误对象](https://github.com/openai/openai-python/blob/main/src/openai/types/shared/error_object.py)保持一致，因此针对 OpenAI SDK 编写的客户端无需改动就能反序列化 LiteLLM 的错误。比较时请用 `"429"`，或直接读 HTTP 状态行

:::

## 响应头

失败响应的响应头携带 JSON 体所没有的诊断上下文

| 响应头 | 出现时机 | 说明 |
|---|---|---|
| `x-litellm-call-id` | 认证成功后的任何失败 | 请求的关联 id。提工单、查日志都应引用这个值；它把 HTTP 响应与网关日志行、花费日志记录以及 OpenTelemetry 追踪记录关联起来。认证失败时没有这个头，因为在分配调用 id 之前请求就被拒绝了 |
| `retry-after` | 网关限流和路由器冷却 | 需要等待的秒数。它的出现意味着什么，见下方说明 |
| `rate_limit_type` | 网关限流 | 超出的是哪个维度：`requests`、`tokens` 或 `concurrent_requests` |
| `reset_at` | 网关限流 | 被超出的窗口重置的 UTC 时间戳 |
| `x-litellm-key-rpm-limit`、`x-litellm-key-max-budget`、`x-litellm-key-spend` | 认证后的大多数失败 | 调用所用密钥的配置上限与当前花费，可据此确认瓶颈是否在密钥本身 |
| `x-litellm-timeout` | 请求已到达某个部署（deployment）后的失败 | 该调用生效的超时值，单位为秒 |

有三类响应头只出现在成功响应上，不要把失败处理逻辑建立在它们之上：`llm_provider-*`（上游自己的响应头，加前缀后原样转发）、`x-ratelimit-*`（上游的速率限制计数），以及 `x-litellm-attempted-retries` / `x-litellm-attempted-fallbacks`（成功前经历了多少次重试和回退跳转）

:::tip

`retry-after` 是区分错误来源的有力信号。网关只在自己的速率限制和冷却时设置它，不会把提供商的 `retry-after` 转发到错误响应上。所以带 `retry-after` 的 429 来自网关的限制，不带的是提供商的

:::

## 是网关还是提供商的问题？

网关会包装每一次上游失败，并在 `error.message` 中同时标出两层。从外往里读：

```
litellm.RateLimitError: RateLimitError: OpenAIException - Rate limit reached ...
^^^^^^^^^^^^^^^^^^^^^^                  ^^^^^^^^^^^^^^^
LiteLLM's normalized class              the provider that actually failed
```

出现 `<Provider>Exception` 字样，说明请求已离开网关、到达提供商并被提供商拒绝。没有这个字样，说明网关在调用提供商之前（或根本没有调用提供商）就拒绝了请求

| 响应中的信号 | 来源 |
|---|---|
| `message` 包含 `OpenAIException`、`AnthropicException`、`AzureException`、`BedrockException`、`VertexAIException` 或其他任何 `<Provider>Exception` | 上游提供商 |
| `message` 不含提供商名，且 `type` 是 LiteLLM 的值，如 `budget_exceeded`、`expired_key`、`token_not_found_in_db`、`key_model_access_denied` | LiteLLM 网关 |
| `message` 以 `No deployments available for selected model` 或 `There are no healthy deployments for this model` 开头 | LiteLLM 网关（路由） |
| 429 且带 `retry-after`、`rate_limit_type` 或 `reset_at` 响应头 | LiteLLM 网关（限流） |
| 429 且不带这些响应头 | 上游提供商 |

完整示例（网关来源）。虚拟密钥的预算上限低于已累计的花费，请求在触达任何提供商之前就被拒绝：

```json
{
  "error": {
    "message": "Budget has been exceeded! Key=analytics-team (sk-...W8TA) Current cost: 0.06, Max budget: 0.05",
    "type": "budget_exceeded",
    "param": null,
    "code": "429"
  }
}
```

完整示例（提供商来源）。同样是 429 状态码，但 message 点名了提供商，负载里也没有任何网关的限流响应头：

```json
{
  "error": {
    "message": "litellm.RateLimitError: RateLimitError: OpenAIException - Rate limit reached for {{openai_small}} in organization org-abc on requests per min (RPM): Limit 3, Used 3.",
    "type": "throttling_error",
    "param": null,
    "code": "429"
  }
}
```

## HTTP 状态码

网关返回底层故障对应的状态码，而不是一律折叠成 500。提供商故障时用的是提供商自己的状态码；网关故障时用的是网关选定的状态码

| 状态码 | 常见来源 | 含义 | 是否重试 |
|---|---|---|---|
| 400 | 两者 | 请求格式错误、模型名未知、上下文窗口超限或内容政策违规。网关侧的 400 会在 `error.param` 中指明缺失的参数 | 否，先修正请求 |
| 401 | 两者 | 网关：虚拟密钥不存在或已过期。提供商：部署所配置的凭证被拒绝 | 否 |
| 403 | 网关 | 密钥、团队、用户或组织无权使用所请求的模型、工具或向量存储 | 否 |
| 404 | 两者 | 所请求的模型或路由不存在 | 否 |
| 408 | 两者 | 调用超过了生效的超时时间，message 中会同时给出配置的超时值和实际耗时 | 是，带退避 |
| 422 | 提供商 | 提供商接受了请求的结构，但无法处理其内容 | 否 |
| 429 | 两者 | 超出了速率限制或预算。参见下方的[这个 429 是哪种？](#这个-429-是哪种) | 是，遵守 `retry-after` |
| 499 | 客户端 | 客户端断开连接，上游调用被取消 | 不适用 |
| 500 | 两者 | 网关：未处理的内部错误。提供商：提供商侧错误，包括连不上提供商的网络故障，表现为 `InternalServerError ... Connection error.` | 是，带退避 |
| 503 | 提供商 | 提供商报告自身不可用或过载 | 是，带退避 |

关于 500 与 503 的区别：从未到达提供商的连接（DNS 失败、连接被拒、`api_base` 写错）会以 500 报告，message 中带 `Connection error.`，而不是 502 或 503。503 意味着提供商有响应，并告知自己不可用

## 网关错误类型

这些 `error.type` 值由网关自身产生。看到其中之一，说明这次失败与提供商无关

| `error.type` | 状态码 | 原因 | 处理方式 |
|---|---|---|---|
| `token_not_found_in_db` | 401 | 虚拟密钥不存在 | 用 `/key/generate` 签发一个密钥 |
| `expired_key` | 401 | 密钥的 `expires` 时间戳已过 | 签发新密钥，或用 `/key/update` 延长当前密钥 |
| `auth_error` | 401 | 一般性认证失败，包括 JWT 校验失败 | 检查凭证；JWT 认证还需检查签发方（issuer）配置 |
| `auth_provider_unavailable` | 503 | 校验请求所需的身份提供方（例如其 JWKS 端点）不可达 | 检查到身份提供方的网络连通性 |
| `key_model_access_denied` | 403 | 密钥的 `models` 列表不包含所请求的模型 | 把模型加入密钥，或调用 `/v1/models` 查看该密钥可用哪些模型 |
| `team_model_access_denied`、`user_model_access_denied`、`org_model_access_denied`、`project_model_access_denied` | 403 | 同样的限制，作用在团队、用户、组织或项目层面 | 在 `type` 所指的对象上授权 |
| `tool_access_denied` | 403 | 所请求的工具不在密钥或团队的允许工具列表中 | 把工具加入允许列表 |
| `key_vector_store_access_denied`、`team_vector_store_access_denied`、`user_vector_store_access_denied`、`org_vector_store_access_denied` | 401 | 调用方无权使用所请求的向量存储 | 把该存储加入 `type` 所指对象的 `object_permission.vector_stores` |
| `team_member_permission_error` | 401 | 调用方缺少执行该管理操作所需的团队成员权限 | 请团队管理员代为执行，或授予相应权限 |
| `key_search_tool_access_denied`、`team_search_tool_access_denied`、`user_search_tool_access_denied` | 403 | `search_tool_deny_by_default` 已开启，而 `type` 所指的密钥、团队或用户未授予所请求的搜索工具 | 把该工具加入 `type` 所指对象的 `object_permission.search_tools` |
| `budget_exceeded` | 429 | 达到了密钥、团队、用户或单次会话的花费上限，message 中报告当前花费和预算上限 | 提高预算，或等预算窗口重置 |
| `throttling_error` | 429 | 超出了 RPM、TPM 或最大并行请求数上限。提供商的 429 也用这个值，要靠响应头区分 | 按 `retry-after` 退避 |
| `invalid_request_error` | 400 | 必填参数缺失或格式错误，`error.param` 会指明是哪个 | 修正请求体 |
| `bad_request_error` | 400 | 网关侧的一般性请求拒绝 | 阅读 message |
| `not_found_error` | 404 | 引用的对象不存在 | 检查 id |
| `no_db_connection` | 503 | 端点需要数据库，而网关连不上数据库 | 检查 `DATABASE_URL` 和数据库健康状况 |
| `internal_server_error` | 500 | 网关未处理的异常 | 在网关日志中查找对应的 `x-litellm-call-id` |

路由失败目前没有专属的 `error.type`，要通过 message 前缀来识别

| message 前缀 | 状态码 | 原因 |
|---|---|---|
| `No deployments available for selected model` | 429 | 模型组（model group）中的每个部署都因反复失败而进入冷却，message 中列出了冷却中的部署 id 和剩余秒数 |
| `There are no healthy deployments for this model` | 400 | 模型组中没有部署能承接这个请求 |
| `Not allowed to access model due to tags configuration` | 401 | 基于标签的路由把该调用方的所有部署都排除了 |
| `No deployments available - crossed budget` | 429 | 基于提供商预算的路由已耗尽每个候选部署的预算 |

## 这个 429 是哪种？

429 是网关和提供商都大量使用的状态码，值得单独做一遍排查。按下面的顺序检查响应

网关限流会设置 `retry-after`、`rate_limit_type` 和 `reset_at`，message 中会点明触发了哪个限制：

```json
{
  "error": {
    "message": "Rate limit exceeded for api_key: b2f139a7... Limit type: requests. Current limit: 1, Remaining: 0. Limit resets at: 2026-08-27 00:15:18 UTC",
    "type": "throttling_error",
    "param": null,
    "code": "429"
  }
}
```

网关预算上限会把 `type` 设为 `budget_exceeded`，并报告相对上限的花费。路由冷却会设置 `retry-after`，message 以 `No deployments available for selected model` 开头。其余 message 中带 `<Provider>Exception` 的都是提供商自身的限流，且网关在返回之前已经用尽了配置的重试和回退

在 Python SDK 中，无需解析字符串即可拿到这个分类。每个 `litellm.RateLimitError` 都带有 `category` 属性（取值来自 `RateLimitErrorCategory`）和 `rate_limit_type` 属性（取值来自 `RateLimitType`）：

```python showLineNumbers
import litellm
from litellm.exceptions import RateLimitErrorCategory

try:
    response = litellm.completion(model="{{openai_small}}", messages=[{"role": "user", "content": "hi"}])
except litellm.RateLimitError as e:
    if e.category == RateLimitErrorCategory.LITELLM_RATE_LIMIT:
        print(f"LiteLLM's own limiter: {e.rate_limit_type}")
    elif e.category == RateLimitErrorCategory.VENDOR_RATE_LIMIT:
        print("the upstream provider throttled us")
```

`category` 的取值为 `litellm_rate_limit`、`vendor_rate_limit`、`litellm_batch_rate_limit` 或 `vendor_batch_rate_limit`；`rate_limit_type` 的取值为 `requests`、`tokens`、`concurrent_requests`、`budget` 或 `max_iterations`。两者也会写入 `StandardLoggingPayload.error_information`，自定义回调与指标管线因此无需解析自由文本就能按成因拆分 429

## 重试与回退

在返回错误之前，网关会先执行为模型组配置的重试与回退策略。重试是再次尝试同一个模型组；回退是切换到另一个模型组。配置方法见[回退机制（提供商故障转移）](/docs/proxy/reliability)

**整条链都失败时，网关会重新抛出最初的异常**。你收到的状态码、`error.type` 和 `error.code` 来自*第一个*模型组的失败，而不是最后一个回退的。主模型组因 500 失败、回退组因 503 失败的请求，最终返回 500。

随后 message 会附上回退尝试的历史。读下面的示例：主模型组 `mock-500` 因 `InternalServerError` 失败，`Available Model Group Fallbacks` 列出了尝试过的链路，`Error doing the fallback` 报告了最后一跳的返回结果

```json
{
  "error": {
    "message": "litellm.InternalServerError: InternalServerError: OpenAIException - The server had an error while processing your request. Sorry about that!. Received Model Group=mock-500\nAvailable Model Group Fallbacks=['mock-503']\nError doing the fallback: litellm.ServiceUnavailableError: ServiceUnavailableError: OpenAIException - The engine is currently overloaded, please try again later.No fallback model group found for original model_group=mock-503. Fallbacks=[{'mock-500': ['mock-503']}]",
    "type": null,
    "param": null,
    "code": "500"
  }
}
```

由这一设计可以推出三个细节

`No fallback model group found for original model_group=<name>` 表示该模型组没有配置回退，因此主错误原样返回。这本身不是失败，而是网关在解释自己为什么没有转移故障

回退细节由 `litellm.expose_router_debug_in_errors` 附加，默认开启。将其设为 `False` 即可从返回给调用方的 message 中剥离路由细节，包括已配置的回退目标名。重试次数会单独附加，形如 `LiteLLM Retried: 2 times, LiteLLM Max Retries: 2`

*成功*的回退在响应体中不可见，响应就是普通的 200。可以从 `x-litellm-attempted-fallbacks` 响应头检测到它；`x-litellm-model-group` 则标明实际承接请求的模型组。这两个响应头只在成功时存在，失败的链路只能靠 `error.message` 或网关日志还原

## 流式错误

流式请求有两种失败方式，取决于故障发生的时机，客户端必须两者都处理

在首个分块之前失败与普通非流式失败没有区别：响应是 HTTP 错误状态码加常规的 JSON `error` 体，流尚未开启：

```
HTTP/1.1 500 Internal Server Error
content-type: application/json

{"error":{"message":"litellm.InternalServerError: InternalServerError: OpenAIException - ...","type":null,"param":null,"code":"500"}}
```

流已开始后再失败，状态码已无法更改，因为它已经是 200。网关会把错误作为最后一个 SSE 事件发出，其中携带同样的 `error` 对象：

```
HTTP/1.1 200 OK
content-type: text/event-stream

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"Hel"}}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"lo"}}]}

data: {"error": {"message": "litellm.APIConnectionError: APIConnectionError: OpenAIException - The server had an error while processing your request. Sorry about that!", "type": null, "param": null, "code": "500"}}
```

每个 SSE 负载都要先检查有没有 `error` 键，再当作分块处理。只看 HTTP 状态码的客户端会把流中途的失败记成一次成功，且补全（completion）内容被截断

## 异常参考

Python SDK 抛出的类型化异常继承自对应的 OpenAI 异常类，因此现有的 OpenAI 错误处理代码无需改动即可工作。完整表格（包括每个提供商可能抛出哪些异常）见[异常映射](/docs/exception_mapping)。摘要如下：

| 状态码 | 异常 | 说明 |
|---|---|---|
| 400 | `BadRequestError` | |
| 400 | `ContextWindowExceededError` | `BadRequestError` 的子类；支持上下文窗口回退 |
| 400 | `ContentPolicyViolationError` | `BadRequestError` 的子类；支持内容政策回退 |
| 400 | `UnsupportedParamsError` | `BadRequestError` 的子类 |
| 401 | `AuthenticationError` | |
| 403 | `PermissionDeniedError` | |
| 404 | `NotFoundError` | 模型名未知时抛出 |
| 408 | `Timeout` | |
| 422 | `UnprocessableEntityError` | |
| 429 | `RateLimitError` | 携带 `category` 和 `rate_limit_type` |
| 429 | `BudgetExceededError` | 代理的预算上限；携带 `current_cost` 和 `max_budget` |
| 500 | `APIConnectionError` | 任何未映射错误的兜底 |
| 500 | `APIError` | |
| 503 | `ServiceUnavailableError` | |
| >=500 | `InternalServerError` | 任何未映射的 5xx 类提供商响应 |

每个 LiteLLM 异常都带有 `status_code`、`message` 和 `llm_provider`，提供商返回了结构化细节时还有 `provider_specific_fields`

## 复现这些错误

测试错误处理不需要真的有提供商出故障。把一个部署指向本地某个返回你想要的状态码的 HTTP 服务器，再通过网关调用它即可

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: always-429
    litellm_params:
      model: openai/fail-429
      api_base: http://127.0.0.1:8199/v1
      api_key: sk-mock
  - model_name: unreachable
    litellm_params:
      model: openai/anything
      api_base: http://127.0.0.1:9/v1
      api_key: sk-mock
```

上面的 `unreachable` 部署根本不需要 mock 服务器；端口 9 会拒绝连接，直接复现 500 的 `Connection error.` 路径。要触发网关侧错误，就生成一个带相应约束的密钥，再用它发起调用：

```bash showLineNumbers
# 403 key_model_access_denied
curl -X POST 'http://localhost:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"key_alias": "restricted", "models": ["{{openai_small}}"]}'

# 429 throttling_error, on the second call within the same minute
curl -X POST 'http://localhost:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"key_alias": "capped", "rpm_limit": 1}'

# 429 budget_exceeded, once accrued spend passes the cap
curl -X POST 'http://localhost:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"key_alias": "tiny-budget", "max_budget": 0.05}'
```

要演练回退耗尽，配置一条从一个必然失败的模型组指向另一个的回退，然后调用主模型组。参见[回退机制（提供商故障转移）](/docs/proxy/reliability)

## 报告问题

附上失败响应中的 `x-litellm-call-id`。它是串联网关日志、花费日志记录、请求的 OpenTelemetry 追踪和管理界面（Admin UI）Logs 页面的关联键，也是最快获得答复的方式

同时附上完整的 `error` 对象、HTTP 状态码、响应头和你请求的 `model`。如果 message 中含有 `<Provider>Exception`，先查提供商自己的状态页；网关只是报告了这次失败，并不是它造成的

只打印 `str(e)`（形如 `Error code: 400 - {...}`）的客户端拿不到响应头，因此也可以把 id 写进错误体。设置 `general_settings.include_call_id_in_error_body: true` 后，网关写出的每个 JSON 错误都会带上与响应头相同的值。该选项默认关闭，开启前错误体与现在保持逐字节一致

```yaml
general_settings:
  include_call_id_in_error_body: true
```

在 OpenAI 形态的路由（`/v1/chat/completions`、`/v1/responses`，包括流式首分块错误）以及 `/v1/messages` 上，id 位于 `error` 对象内，也就是 OpenAI SDK 保留为 `e.body` 的那部分：

```json
{"error": {"message": "Invalid model name passed in model=gpt-nope", "type": "invalid_request_error", "param": "model", "code": "400", "litellm_call_id": "019b2c4d-e5f6-7890-abcd-ef1234567890"}}
```

```json
{"type": "error", "error": {"type": "invalid_request_error", "message": "Invalid model name passed in model=gpt-nope", "litellm_call_id": "019b2c4d-e5f6-7890-abcd-ef1234567890"}}
```

透传（passthrough）路由转发的是提供商自己的错误体，因此 id 加在顶层，提供商的 `error` 对象保持原样：

```json
{"type": "error", "error": {"type": "not_found_error", "message": "model: claude-nope"}, "litellm_call_id": "019b2c4d-e5f6-7890-abcd-ef1234567890"}
```

该设置只在网关已为 JSON 体设置 `x-litellm-call-id` 响应头的场景下附加 id，因此 422 请求校验错误、在 id 生成前就被拒绝的认证失败、流中途到达的错误以及非 JSON 的透传体都不受影响

要查看网关发往上游的确切请求，用 `--detailed_debug` 重启或设置 `LITELLM_LOG=DEBUG`，也可以在单个请求体中加 `"litellm_request_debug": true`。参见[调试](/docs/proxy/debugging)
