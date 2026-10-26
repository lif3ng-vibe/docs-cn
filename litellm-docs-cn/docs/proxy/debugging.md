# 调试

支持两级调试日志。

- debug（输出 info 级日志）
- detailed debug（输出 debug 级日志）

代理还支持 JSON 格式的日志。[详见此处](#json-日志)

## `debug`

**通过 CLI**

```bash showLineNumbers
$ litellm --debug
```

**通过环境变量**

```python showLineNumbers
os.environ["LITELLM_LOG"] = "INFO"
```

## `detailed debug`

**通过 CLI**

```bash showLineNumbers
$ litellm --detailed_debug
```

**通过环境变量**

```python showLineNumbers
os.environ["LITELLM_LOG"] = "DEBUG"
```

### 调试日志

使用 `--detailed_debug` 启动代理，即可查看详细的调试日志。

```shell showLineNumbers
litellm --config /path/to/config.yaml --detailed_debug
```

发起请求时，你应当能在终端输出中看到 LiteLLM 发送给 LLM 的 POST 请求。

```shell showLineNumbers
POST Request Sent from LiteLLM:
curl -X POST \
https://api.openai.com/v1/chat/completions \
-H 'content-type: application/json' -H 'Authorization: Bearer sk-qnWGUIW9****************************************' \
-d '{"model": "{{openai_small}}", "messages": [{"role": "user", "content": "this is a test request, write a short poem"}]}'
```

## 调试单个请求

在请求体中传入 `litellm_request_debug=True` 即可。

```bash showLineNumbers
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{ 
    "model":"fake-openai-endpoint",
    "messages": [{"role": "user","content": "How many r in the word strawberry?"}],
    "litellm_request_debug": true
}'
```

这样，日志中会输出 LiteLLM 发送给提供商（API Provider）的原始请求，以及从提供商收到的原始响应，且**仅限**这一条请求。


```bash showLineNumbers keep-model-ids
INFO:     Uvicorn running on http://0.0.0.0:4000 (Press CTRL+C to quit)
20:14:06 - LiteLLM:WARNING: litellm_logging.py:938 - 

POST Request Sent from LiteLLM:
curl -X POST \
https://exampleopenaiendpoint-production.up.railway.app/chat/completions \
-H 'Authorization: Be****ey' -H 'Content-Type: application/json' \
-d '{'model': 'fake', 'messages': [{'role': 'user', 'content': 'How many r in the word strawberry?'}], 'stream': False}'


20:14:06 - LiteLLM:WARNING: litellm_logging.py:1015 - RAW RESPONSE:
{"id":"chatcmpl-817fc08f0d6c451485d571dab39b26a1","object":"chat.completion","created":1677652288,"model":"gpt-3.5-turbo-0301","system_fingerprint":"fp_44709d6fcb","choices":[{"index":0,"message":{"role":"assistant","content":"\n\nHello there, how may I assist you today?"},"logprobs":null,"finish_reason":"stop"}],"usage":{"prompt_tokens":9,"completion_tokens":12,"total_tokens":21}}


INFO:     127.0.0.1:56155 - "POST /chat/completions HTTP/1.1" 200 OK

```


## JSON 日志

在环境变量中设置 `JSON_LOGS="True"`：

```bash showLineNumbers
export JSON_LOGS="True"
```

**或者**

在 yaml 配置中设置 `json_logs: true`：

```yaml showLineNumbers
litellm_settings:
    json_logs: true
```

启动代理：

```bash showLineNumbers
$ litellm
```

此时代理的所有日志都会以 JSON 格式输出。

## 请求关联 ID

设置 `request_correlation_in_logs: true` 后，每条日志都会打上该请求的 `trace_id` 与 `session_id` 标记。这样，你就能在日志聚合系统中筛出与单个请求相关的每一行日志，或单个终端用户会话内所有请求的日志，而无需在每个调用点额外添加日志代码。纯文本日志与 JSON 日志均支持。

```yaml showLineNumbers
litellm_settings:
    request_correlation_in_logs: true
```

`trace_id` 来自请求头 `x-litellm-trace-id`（若该请求头未设置，则为每个请求自动生成）。`session_id` 来自请求体中的 `litellm_session_id`，或请求头 `x-litellm-session-id`；完整的取值优先级见[请求头](./request_headers#litellm-请求头)。只有确实提供了会话 ID，日志行中才会加上这一字段。

如果这两个显式请求头都不存在，`trace_id`/`session_id` 会分别回退到标准的 [W3C Trace Context](https://www.w3.org/TR/trace-context/) `traceparent` 请求头与 [W3C Baggage](https://www.w3.org/TR/baggage/) `baggage` 请求头：`traceparent` 中的 trace-id 成为 `trace_id`，`baggage` 中的 `session.id` 条目成为 `session_id`。这样，已经携带真实 OpenTelemetry 追踪上下文的请求，无需单独的 litellm 专用请求头，就能在现有可观测性（observability）后端中把 litellm 的日志与同一条追踪记录关联起来。显式的 litellm 请求头始终优先。

开启 `json_logs: true` 时的日志行示例：

```json showLineNumbers
{"message": "...", "level": "INFO", "timestamp": "...", "trace_id": "2a5cbcfa-ccdf-493c-858b-eb8e9b07f32c", "session_id": "user-123-session-1"}
```

未开启 `json_logs`（纯文本）时的日志行示例：

```bash showLineNumbers
15:30:43 - LiteLLM Proxy:ERROR: common_request_processing.py:848 - some log message [trace_id=2a5cbcfa-ccdf-493c-858b-eb8e9b07f32c session_id=user-123-session-1]
```

`request_correlation_in_logs` 还会为 `StandardLoggingPayload`（发送给 S3、Langfuse 等日志集成）添加一个独立的 `session_id` 字段，取值方式相同。详见 [StandardLoggingPayload 规范](./logging_spec#standardloggingpayload)。

`trace_id` 与 `session_id` 在存储前都会经过净化：去除控制字符（包括 `\r`/`\n`），长度上限 256 个字符，因此调用方提供的 `litellm_session_id` 无法用来伪造日志行，也无法撑大日志存储。

该开关默认为 `false`，在你主动开启之前，现有日志输出不受影响。

目前，该功能适用于代理处理的请求，以及直接通过 SDK 发起的 `litellm.acompletion()` 调用。同步 SDK 调用（`litellm.completion()`）暂不支持打上 `trace_id`/`session_id` 标记；对这条路径的支持已在后续计划中。

## 控制日志输出

关闭 FastAPI 默认的 "INFO" 日志。

1. 开启 JSON 日志。

```yaml showLineNumbers
litellm_settings:
    json_logs: true
```

2. 将 `LITELLM_LOG` 设为 "ERROR"。

只有发生错误时才会输出日志。

```bash showLineNumbers
LITELLM_LOG="ERROR"
```

3. 启动代理。


```bash showLineNumbers
$ litellm
```

预期输出：

```bash showLineNumbers
# no info statements
```

## 常见错误

1. "No available deployments..."

```
No deployments available for selected model, Try again in 60 seconds. Passed model={{anthropic}}. pre-call-checks=False, allowed_model_region=n/a.
```

出现该错误，通常是因为所有模型都触发了速率限制（rate limit）错误，进而进入冷却（cooldown）状态。

如何控制？

- 调整冷却时间。

```yaml showLineNumbers
router_settings:
    cooldown_time: 0 # 👈 KEY CHANGE
```

- 禁用冷却机制（不推荐）。

```yaml showLineNumbers
router_settings:
    disable_cooldowns: True
```

这种做法不推荐，因为它会让请求被路由到已超出 tpm/rpm 上限的部署（deployment）上。
