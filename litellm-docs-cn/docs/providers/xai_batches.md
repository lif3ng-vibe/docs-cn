# xAI Batch API

LiteLLM 把兼容 OpenAI 的 `/v1/files` 和 `/v1/batches` 端点路由到 xAI 的 [Files](https://docs.x.ai/developers/files/managing-files) 和 [Batch](https://docs.x.ai/developers/advanced-api-usage/batch-api) API。xAI 对批处理请求按优惠费率计费，且不计入速率限制（rate limit），大多数批处理按尽力而为原则在 24 小时内完成。并非所有 xAI 模型都接受批处理请求，选模型前请先查看 xAI 的模型列表

| 功能 | 支持情况 |
|---------|-----------|
| 上传、获取、列出、删除文件 | ✅ |
| 下载批处理结果 | ✅ |
| 创建、获取、列出、取消批处理 | ✅ |
| 成本追踪 | ✅ 逐行计费，见 [成本追踪](#成本追踪) |
| Python SDK | ✅ `custom_llm_provider="xai"` |

## 1. 在 config.yaml 中添加 xAI

`files_settings` 保存 `/v1/files` 和 `/v1/batches` 所需的凭证。`model_list` 条目决定批处理里每一行跑在哪个模型上，花费也按它计价：

```yaml
model_list:
  - model_name: grok-4.3
    litellm_params:
      model: xai/grok-4.3
      api_key: os.environ/XAI_API_KEY

files_settings:
  - custom_llm_provider: xai
    api_key: os.environ/XAI_API_KEY
```

## 2. 上传批处理输入文件

每一行都是一条 OpenAI 格式的批处理请求。文件会原样传给 xAI，所以 `body` 里的 `model` 要写 xAI 的模型名，`url` 则为该行选择 xAI 端点，因此一个文件里可以混排对话补全、Responses、图像和视频请求：

```json
{"custom_id": "req-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "grok-4.3", "messages": [{"role": "user", "content": "What is the capital of France?"}], "max_tokens": 40}}
{"custom_id": "req-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "grok-4.3", "messages": [{"role": "user", "content": "How many legs does a spider have?"}], "max_tokens": 40}}
```

普通上传不带任何可用于路由的信息，所以要在请求上指明提供商（provider）：

```bash
curl "http://0.0.0.0:4000/v1/files?provider=xai" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F purpose="batch" \
  -F file="@batch_input.jsonl"
```

xAI 不保存 purpose，所以所有 xAI 文件读回来都是 `purpose: batch`

## 3. 创建批处理

```bash
curl "http://0.0.0.0:4000/v1/batches?provider=xai" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "<file id from step 2>",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

xAI 按每行自带的 `url` 做路由，所以 `endpoint` 只会原样回显而不会被发送，`completion_window` 也始终返回 `24h`

## 4. 轮询批处理并下载结果

```bash
curl "http://0.0.0.0:4000/v1/batches/<batch id>?provider=xai" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

xAI 返回的是请求计数而非状态，所以 LiteLLM 自行推导：xAI 还没统计到任何请求时为 `validating`，仍有请求未完成时为 `in_progress`，全部完成后为 `completed`，你主动取消时为 `cancelled`，xAI 侧取消时为 `failed`（输入文件校验失败也归到这里，xAI 的报错信息放在 `errors` 下）。`created_at`、`expires_at` 和 `cancelled_at` 只精确到天，因为 xAI 存这些日期时不含时刻

xAI 没有输出文件：结果直接从批处理本身读取，所以 `output_file_id` 就是批处理 id。通过文件内容端点下载：

```bash
curl "http://0.0.0.0:4000/v1/files/<batch id>/content?provider=xai" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

响应是 OpenAI 格式的批处理输出 JSONL，每个请求一行，结果放在 `response.body` 下，失败放在 `error` 下。xAI 以每页 1000 条分页提供结果，LiteLLM 会遍历各页拼接后再响应，因此大批处理在下载期间会驻留内存。图像和视频结果携带的媒体 URL 一小时后就会过期，要尽快取用

## 列表、取消与删除

```bash
curl "http://0.0.0.0:4000/v1/files?provider=xai" \
  -H "Authorization: Bearer $LITELLM_API_KEY"

curl "http://0.0.0.0:4000/v1/batches" \
  -H "Authorization: Bearer $LITELLM_API_KEY"

curl -X POST "http://0.0.0.0:4000/v1/batches/<batch id>/cancel?provider=xai" \
  -H "Authorization: Bearer $LITELLM_API_KEY"

curl -X DELETE "http://0.0.0.0:4000/v1/files/<file id>?provider=xai" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

文件列表会遍历 xAI 返回的每一页，批处理列表则从 `files_settings` 读取提供商。已删除或已过期的文件返回 404

## Python SDK

环境里设置好 `XAI_API_KEY` 就够了：

```python
import litellm

with open("batch_input.jsonl", "rb") as fh:
    uploaded = litellm.create_file(file=fh, purpose="batch", custom_llm_provider="xai")

batch = litellm.create_batch(
    input_file_id=uploaded.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    custom_llm_provider="xai",
)

batch = litellm.retrieve_batch(batch_id=batch.id, custom_llm_provider="xai")
if batch.status == "completed":
    results = litellm.file_content(file_id=batch.output_file_id, custom_llm_provider="xai")
    print(results.text)
```

其余操作由 `litellm.list_batches(custom_llm_provider="xai")` 和 `litellm.cancel_batch(batch_id=..., custom_llm_provider="xai")` 覆盖

## 成本追踪

当已完成的 xAI 批处理被获取时，LiteLLM 会读取每条结果行上的用量，并像同步调用 xAI 那样把推理 Token（reasoning tokens）并入补全 Token，再按[模型成本映射表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)中的批处理费率逐行计费：`input_cost_per_token_batches`、`output_cost_per_token_batches` 和 `cache_read_input_token_cost_batches`；对上下文超过 20 万 Token 后价格跳档的模型，还会用对应的 `_above_200k_tokens` 变体。xAI 还会在每行上报 `cost_in_usd_ticks`（一百亿 tick 合 1 美元），可以拿它交叉核对 LiteLLM 记录的花费

花费在第一次获取已完成的批处理时记录，记在创建它的密钥名下，以批处理 id 加 `_batch_cost` 后缀为标识，并显示在 `/spend/logs` 路由和管理界面（Admin UI）的日志页上
