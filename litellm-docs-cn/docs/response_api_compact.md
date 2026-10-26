import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /responses/compact

使用 OpenAI 的 `/responses/compact` 端点压缩对话历史。

| 特性 | 支持情况 |
|---------|-----------|
| 支持的 LiteLLM 版本 | 1.72.0+ |
| 支持的提供商（provider） | `openai` |

## 用法

### LiteLLM Python SDK

```python showLineNumbers title="压缩响应"
import litellm

response = litellm.compact_responses(
    model="openai/{{openai_large}}",
    input=[{"role": "user", "content": "Hello, how are you?"}],
    instructions="Be helpful",
    previous_response_id="resp_abc123"  # optional
)

print(response.id)
print(response.object)  # "response.compaction"
print(response.output)
```

### LiteLLM 代理

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="压缩请求"
curl http://localhost:4000/v1/responses/compact \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "openai/{{openai_large}}",
    "input": [{"role": "user", "content": "Hello"}],
    "instructions": "Be helpful"
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="使用 OpenAI SDK 压缩"
import httpx

response = httpx.post(
    "http://localhost:4000/v1/responses/compact",
    headers={"Authorization": "Bearer sk-<your-litellm-api-key>"},
    json={
        "model": "openai/{{openai_large}}",
        "input": [{"role": "user", "content": "Hello"}],
        "instructions": "Be helpful"
    }
)

print(response.json())
```

</TabItem>
</Tabs>

## 请求参数

| 参数 | 类型 | 是否必填 | 说明 |
|-----------|------|----------|-------------|
| `model` | string | Yes | 用于压缩的模型 |
| `input` | string or array | Yes | 待压缩的输入消息 |
| `instructions` | string | No | 系统指令 |
| `previous_response_id` | string | No | 要接续的上一次响应的 ID |

## 响应格式

```json
{
  "id": "resp_abc123",
  "object": "response.compaction",
  "created_at": 1734366691,
  "output": [
    {
      "type": "message",
      "role": "assistant",
      "content": [...]
    },
    {
      "type": "compaction",
      "encrypted_content": "..."
    }
  ],
  "usage": {
    "input_tokens": 100,
    "output_tokens": 50,
    "total_tokens": 150
  }
}
```
