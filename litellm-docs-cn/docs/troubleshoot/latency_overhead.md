# 延迟开销故障排查

当 LiteLLM 代理与 LLM 提供商之间出现意外的延迟开销时，请参考本指南排查。

## 看不见的延迟缺口

LiteLLM 从自己的处理函数（handler）开始执行时才起算延迟。如果请求在 handler 运行**之前**先在 uvicorn 的事件循环里排队等待，这段等待对 LiteLLM 自身的日志完全不可见。

```
T=0   Request arrives at load balancer
      [queue wait — LiteLLM never logs this]
T=10  LiteLLM handler starts → timer begins
T=20  Response sent

LiteLLM logs: 10s    User experiences: 20s
```

要测量 handler 启动前的等待时间，请轮询每个 pod 的 `/health/backlog`：

```bash
curl http://localhost:4000/health/backlog \
  -H "Authorization: Bearer sk-..."
# {"in_flight_requests": 47}
```

或者抓取 `/metrics` 端点上的 `litellm_in_flight_requests` Prometheus gauge 指标。

| `in_flight_requests` | ALB `TargetResponseTime` | 诊断结论 |
|---|---|---|
| High | High | pod 过载 → 横向扩容 |
| Low | High | 延迟发生在 ASGI 之前，检查是否有同步阻塞代码或事件循环饱和 |
| High | Normal | pod 繁忙但健康，没有排队堆积 |

如果你在用 **AWS ALB**，可以把 `litellm_in_flight_requests` 的尖峰与 ALB 的 `TargetResponseTime` CloudWatch 指标对照分析。ALB 上报的耗时与 LiteLLM 日志记录的耗时之差，就是那段看不见的等待时间。

## 快速排查清单

1. **检查每个 pod 上的 `in_flight_requests`**：通过 `/health/backlog` 或 `litellm_in_flight_requests` Prometheus gauge 查询，判断请求是否在 LiteLLM 开始处理之前就已排队。遇到原因不明的延迟，先从这里查起。
2. **收集 `x-litellm-overhead-duration-ms` 响应头**，它反映 LiteLLM 在每个请求上的总开销。
3. **是否开启了 DEBUG 日志**？这是大负载场景下延迟的头号诱因。
4. **是否在发送大型 base64 负载**？（如图片、PDF）参见[大负载开销](#大负载开销)。
5. **开启详细的计时响应头**，精确定位时间花在哪里。

## 诊断响应头

### `x-litellm-overhead-duration-ms`（始终开启）

LiteLLM 返回的每个响应都带有这个响应头，以毫秒显示 LiteLLM 代理叠加的总延迟开销（即总响应时间减去 LLM API 调用耗时）。建议在所有请求上都收集它，以便掌握自己的基线开销。

```bash
curl -s -D - http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-..." \
  -d '{"model": "{{openai_large}}", "messages": [{"role": "user", "content": "hi"}]}' \
  2>&1 | grep x-litellm-overhead-duration-ms
```

### `x-litellm-callback-duration-ms`（始终开启）

显示构建回调/日志负载所耗费的时间（毫秒）。如果该值偏高（大于 100ms），说明负载可能过大，影响日志记录效率。

```bash
curl -s -D - http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-..." \
  -d '{"model": "{{openai_large}}", "messages": [{"role": "user", "content": "hi"}]}' \
  2>&1 | grep x-litellm
```

### 详细耗时分解（需手动开启）

设置 `LITELLM_DETAILED_TIMING=true`，即可在响应头中获得分阶段计时：

| 响应头 | 测量内容 |
|--------|-----------------|
| `x-litellm-timing-pre-processing-ms` | 鉴权、路由、请求处理（LLM 调用之前） |
| `x-litellm-timing-llm-api-ms` | LLM API 调用实际耗时 |
| `x-litellm-timing-post-processing-ms` | 响应处理（LLM 返回之后） |
| `x-litellm-timing-message-copy-ms` | 日志层中的消息复制耗时 |

```bash
# Enable detailed timing
export LITELLM_DETAILED_TIMING=true
```

## 大负载开销

发送大负载（大于 1MB，例如 base64 编码的图片/PDF）时，以下三处可能引入额外开销：

### 1. DEBUG 日志（最常见）

启用 `LITELLM_LOG=DEBUG` 或 `set_verbose=True` 后，每个请求负载都会通过 `json.dumps(indent=4)` 同步序列化。对 2MB 以上的负载，仅这一步就可能耗时 **2-5 秒**。

**解决办法**：生产环境不要使用 DEBUG 日志，改用 `INFO` 级别：

```bash
export LITELLM_LOG=INFO
```

如果确实需要 DEBUG 日志，但负载又很大，可以提高完整记录负载的大小阈值：

```bash
# Only fully serialize payloads under 100KB for DEBUG logs (default)
export MAX_PAYLOAD_SIZE_FOR_DEBUG_LOG=102400
```

### 2. 日志负载中的 Base64

回调负载（发送给 Langfuse 等的内容）包含消息正文。过大的 base64 字符串会在日志负载中被自动截断为大小占位符。

截断阈值可自行控制：

```bash
# Max base64 characters before truncation (default: 64)
export MAX_BASE64_LENGTH_FOR_LOGGING=64
```

### 3. stdout 日志中的 Base64 与超长行

提供商报错时可能把整个请求回显出来，DEBUG 级别下请求负载本身也会被打印，因此一次数兆字节的上传就可能产生需要数秒才能完成格式化和清洗的日志行，而且这一切都内联在事件循环上执行。有两道上限约束最终写入 stdout 的内容，二者都不会改变日志回调收到的数据。

`MAX_BASE64_LENGTH_STDOUT_LOG`（默认 `4096`）会把超过该长度的 base64 连续片段折叠成 `[base64_data truncated: 2.86MB]` 这样的占位符，片段两侧的文本保持原样，该规则对所有日志级别以及 traceback 都生效。`MAX_STRING_LENGTH_STDOUT_LOG`（默认 `4096`）则限制 INFO 及以上级别单行日志的长度，在 `litellm_truncated skipped N chars` 标记两侧保留首尾内容；DEBUG 行保持完整长度，因此 `--detailed_debug` 仍能看到全部内容。将任一变量设为 `0` 即可关闭相应截断。

```bash
# Collapse base64 runs longer than this in stdout log lines (default: 4096, 0 disables)
export MAX_BASE64_LENGTH_STDOUT_LOG=4096
# Cap INFO and higher stdout log lines at this many chars (default: 4096, 0 disables)
export MAX_STRING_LENGTH_STDOUT_LOG=4096
```

## 环境变量参考

| 变量 | 默认值 | 说明 |
|----------|---------|-------------|
| `LITELLM_DETAILED_TIMING` | `false` | 开启分阶段计时响应头 |
| `MAX_PAYLOAD_SIZE_FOR_DEBUG_LOG` | `102400` | DEBUG 日志完整序列化负载的最大字节数 |
| `MAX_BASE64_LENGTH_FOR_LOGGING` | `64` | 日志负载中 base64 截断前的最大字符数 |
| `MAX_BASE64_LENGTH_STDOUT_LOG` | `4096` | stdout 日志行中 base64 片段折叠为大小占位符前的最大字符数 |
| `MAX_STRING_LENGTH_STDOUT_LOG` | `4096` | INFO 及以上级别 stdout 日志单行截断前的最大字符数 |
