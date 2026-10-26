import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /interactions

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 日志（logging） | ✅ | 适用于所有集成方式 |
| 流式（streaming） | ✅ | |
| 负载均衡（load balancing） | ✅ | 在受支持的模型之间进行 |
| 支持的 LLM 提供商（provider） | **所有 LiteLLM 支持对话补全（chat completion）的提供商** | `openai`、`anthropic`、`bedrock`、`vertex_ai`、`gemini`、`azure`、`azure_ai` 等 |

## **LiteLLM Python SDK 用法**

### 快速上手

```python showLineNumbers title="Create Interaction"
import litellm
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = litellm.interactions.create(
    model="gemini/{{gemini_flash}}",
    input="Tell me a short joke about programming."
)

print(response.outputs[-1].text)
```

### 异步用法

```python showLineNumbers title="Async Create Interaction"
import litellm
import os
import asyncio

os.environ["GEMINI_API_KEY"] = "your-api-key"

async def main():
    response = await litellm.interactions.acreate(
        model="gemini/{{gemini_flash}}",
        input="Tell me a short joke about programming."
    )
    print(response.outputs[-1].text)

asyncio.run(main())
```

### 流式

```python showLineNumbers title="Streaming Interaction"
import litellm
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = litellm.interactions.create(
    model="gemini/{{gemini_flash}}",
    input="Write a 3 paragraph story about a robot.",
    stream=True
)

for chunk in response:
    print(chunk)
```

## **LiteLLM AI 网关（Proxy）用法**

### 配置

将以下内容加入 litellm 代理的 config.yaml：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-flash
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
```

启动 litellm：

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 测试请求

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Create Interaction"
curl -X POST "http://localhost:4000/v1beta/interactions" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini/{{gemini_flash}}",
    "input": "Tell me a short joke about programming."
  }'
```

**流式**：

```bash showLineNumbers title="Streaming Interaction"
curl -N -X POST "http://localhost:4000/v1beta/interactions" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini/{{gemini_flash}}",
    "input": "Write a 3 paragraph story about a robot.",
    "stream": true
  }'
```

**获取交互记录**：

```bash showLineNumbers title="Get Interaction by ID"
curl "http://localhost:4000/v1beta/interactions/{interaction_id}" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>

<TabItem value="google-sdk" label="Google GenAI SDK">

将 Google GenAI SDK 指向 LiteLLM 代理：

```python showLineNumbers title="Google GenAI SDK with LiteLLM Proxy"
from google import genai

# Point SDK to LiteLLM Proxy
client = genai.Client(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM API key
    http_options={"base_url": "http://localhost:4000"},
)

# Create an interaction
interaction = client.interactions.create(
    model="gemini/{{gemini_flash}}",
    input="Tell me a short joke about programming."
)

print(interaction.outputs[-1].text)
```

**流式**：

```python showLineNumbers title="Google GenAI SDK Streaming"
from google import genai

client = genai.Client(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM API key
    http_options={"base_url": "http://localhost:4000"},
)

for chunk in client.interactions.create_stream(
    model="gemini/{{gemini_flash}}",
    input="Write a story about space exploration.",
):
    print(chunk)
```

</TabItem>
</Tabs>

## **请求/响应格式**

### 请求参数

| 参数 | 类型 | 是否必填 | 说明 |
|-----------|------|----------|-------------|
| `model` | string | 是 | 要使用的模型（如 `gemini/gemini-2.5-flash`） |
| `input` | string | 是 | 这次交互的输入文本 |
| `stream` | boolean | 否 | 启用流式响应 |
| `tools` | array | 否 | 模型可以调用的工具 |
| `system_instruction` | string | 否 | 提供给模型的系统指令 |
| `generation_config` | object | 否 | 生成配置 |
| `previous_interaction_id` | string | 否 | 上一次交互的 ID，用于延续上下文 |

### 响应格式

```json
{
  "id": "interaction_abc123",
  "object": "interaction",
  "model": "{{gemini_flash}}",
  "status": "completed",
  "created": "2025-01-15T10:30:00Z",
  "updated": "2025-01-15T10:30:05Z",
  "role": "model",
  "outputs": [
    {
      "type": "text",
      "text": "Why do programmers prefer dark mode? Because light attracts bugs!"
    }
  ],
  "usage": {
    "total_input_tokens": 10,
    "total_output_tokens": 15,
    "total_tokens": 25
  }
}
```

## **调用非 Interactions API 端点（`/interactions` 到 `/responses` 的桥接）**

借助一座通往 LiteLLM `/responses` 端点的桥接（bridge），你可以调用非 Interactions API 的模型。OpenAI、Anthropic 以及其他原生不支持 Interactions API 的提供商，都可以通过这种方式来调用。

#### Python SDK 用法

```python showLineNumbers title="SDK Usage"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

# Non-streaming interaction
response = litellm.interactions.create(
    model="{{openai_large}}",
    input="Tell me a short joke about programming."
)

print(response.outputs[-1].text)
```

#### LiteLLM 代理用法

**配置**：

```yaml showLineNumbers title="Example Configuration"
model_list:
- model_name: openai-model
  litellm_params:
    model: {{openai_large}}
    api_key: os.environ/OPENAI_API_KEY
```

**启动代理**：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**发起请求**：

```bash showLineNumbers title="non-Interactions API Model Request"
curl http://localhost:4000/v1beta/interactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "openai-model",
    "input": "Tell me a short joke about programming."
  }'
```

## **支持的提供商**

| 提供商 | 用法链接 |
|----------|---------------|
| Google AI Studio | [用法](#快速上手) |
| 所有其他 LiteLLM 提供商 | [桥接用法](#调用非-interactions-api-端点interactions-到-responses-的桥接) |
