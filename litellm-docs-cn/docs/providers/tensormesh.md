import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tensormesh

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Tensormesh 提供兼容 OpenAI API 的无服务器（serverless）AI 推理服务。 |
| LiteLLM 上的提供商路由 | `tensormesh/` |
| 提供商文档链接 | [Tensormesh 官方文档](https://docs.tensormesh.ai) |
| 默认 Base URL | `https://serverless.tensormesh.ai/v1` |
| 支持的操作 | `/chat/completions`、`/completions`、`/responses`、`/messages`（通过 LiteLLM 的 Anthropic Messages 适配器） |

## API 密钥

```python showLineNumbers title="Environment Variables"
import os

os.environ["TENSORMESH_INFERENCE_API_KEY"] = "your-api-key"
```

## 模型

列出无服务器模型目录中的可用模型：

```bash showLineNumbers title="List Tensormesh Models"
curl https://serverless.tensormesh.ai/v1/models
```

在 `tensormesh/` 路由中使用目录里的 id，例如 `tensormesh/openai/gpt-oss-120b`、`tensormesh/MiniMaxAI/MiniMax-M2.5` 或 `tensormesh/deepseek-ai/DeepSeek-V4-Flash`。

## 用法 - LiteLLM Python SDK

### 对话补全

```python showLineNumbers title="Tensormesh Chat Completion"
import os
from litellm import completion

os.environ["TENSORMESH_INFERENCE_API_KEY"] = "your-api-key"

response = completion(
    model="tensormesh/<your-model-name>",
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)

print(response.choices[0].message.content)
```

### 流式

```python showLineNumbers title="Tensormesh Streaming Chat Completion"
import os
from litellm import completion

os.environ["TENSORMESH_INFERENCE_API_KEY"] = "your-api-key"

response = completion(
    model="tensormesh/<your-model-name>",
    messages=[{"role": "user", "content": "Write a short poem about inference."}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

### 工具调用

```python showLineNumbers title="Tensormesh Tool Calling"
import os
from litellm import completion

os.environ["TENSORMESH_INFERENCE_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string", "description": "City name"}},
                "required": ["city"],
            },
        },
    }
]

response = completion(
    model="tensormesh/<your-model-name>",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
    tool_choice="auto",
)

print(response.choices[0].message.tool_calls)
```

每个工具函数都必须带有非空的 `description`；Tensormesh 会拒绝缺少该字段的工具定义。

### 推理

Tensormesh 的推理模型（例如 DeepSeek-V4-Flash、Qwen3.5-397B、Qwen3.6-27B、GLM-5.1、MiniMax-M2.5、Kimi-K2.6 以及 gpt-oss 系列）通过 vLLM 的聊天模板控制项暴露思考模式。把思考开关（`thinking` 或 `enable_thinking`）与 `reasoning_effort` 搭配，经由 `extra_body` 传入。模型会在 `reasoning_content` 中返回思维链。

```python showLineNumbers title="Tensormesh Reasoning"
import os
from litellm import completion

os.environ["TENSORMESH_INFERENCE_API_KEY"] = "your-api-key"

response = completion(
    model="tensormesh/deepseek-ai/DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "If a train travels 60 miles in 1.5 hours, what is its average speed?"}],
    extra_body={"chat_template_kwargs": {"thinking": True, "reasoning_effort": "high"}},
)

print(response.choices[0].message.reasoning_content)
print(response.choices[0].message.content)
```

### 文本补全

```python showLineNumbers title="Tensormesh Text Completion"
import os
from litellm import text_completion

os.environ["TENSORMESH_INFERENCE_API_KEY"] = "your-api-key"

response = text_completion(
    model="tensormesh/<your-model-name>",
    prompt="Complete this sentence: Fast inference matters because",
    max_tokens=32,
)

print(response.choices[0].text)
```

### Responses API

```python showLineNumbers title="Tensormesh Responses API"
import os
import litellm

os.environ["TENSORMESH_INFERENCE_API_KEY"] = "your-api-key"

response = litellm.responses(
    model="tensormesh/<your-model-name>",
    input="Say hello in one sentence.",
)

print(response)
```

## 用法 - LiteLLM Proxy

将 Tensormesh 添加到 LiteLLM Proxy 配置中：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: tensormesh-chat
    litellm_params:
      model: tensormesh/<your-model-name>
      api_key: os.environ/TENSORMESH_INFERENCE_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

启动代理：

```bash showLineNumbers title="Start LiteLLM Proxy"
export TENSORMESH_INFERENCE_API_KEY="your-api-key"
export LITELLM_MASTER_KEY="sk-local-tensormesh"
litellm --config config.yaml --port 4000

# RUNNING on http://0.0.0.0:4000
```

请求 LiteLLM Proxy 时必须使用代理密钥，即 `Authorization: Bearer $LITELLM_MASTER_KEY`。`TENSORMESH_INFERENCE_API_KEY` 只在 LiteLLM 调用上游 Tensormesh 时使用。

启动后可先用 `/health/liveliness` 或 `/health/readiness` 做基础检查。`/health` 端点需要认证，且可能运行模型检查。

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Tensormesh via Proxy - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-local-tensormesh",
)

response = client.chat.completions.create(
    model="tensormesh-chat",
    messages=[{"role": "user", "content": "hello from litellm"}],
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Tensormesh via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "tensormesh-chat",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

</TabItem>
</Tabs>

## Anthropic Messages 兼容性

LiteLLM 能将 Anthropic Messages 形态的请求转换为 Tensormesh 对话补全。在 Python SDK 中，使用 Anthropic Messages 门面（facade）：

```python showLineNumbers title="Anthropic Messages through LiteLLM SDK"
import os
import litellm

os.environ["TENSORMESH_INFERENCE_API_KEY"] = "your-api-key"

response = litellm.anthropic.messages.create(
    model="tensormesh/<your-model-name>",
    max_tokens=128,
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)

print(response["content"][0]["text"])
```

对 HTTP 客户端，LiteLLM Proxy 暴露与 Anthropic 兼容的 `/v1/messages` 端点，并把上游请求路由到 Tensormesh 对话补全。请求体中的 `model` 需设为代理配置里的 `model_name`。

```bash showLineNumbers title="Anthropic Messages through LiteLLM Proxy"
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "tensormesh-chat",
    "max_tokens": 128,
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
  }'
```

SDK 门面与 Proxy 的 `/v1/messages` 端点都使用 LiteLLM 的 Anthropic Messages 适配器，Tensormesh 在上游收到的是 OpenAI 兼容的对话补全请求。

## 成本追踪

Tensormesh 的无服务器模型已收录进 LiteLLM 的模型成本表（model cost map），LiteLLM 会自动计算每次请求的花费。在代理上，成本会通过 `x-litellm-response-cost` 响应头返回，并记录到花费日志中。缓存的输入 token 按 0 计费。

## 通用参数

以下是上手时常用的参数。其余参数取决于具体模型，请对照目标 Tensormesh 模型逐一验证。

| 端点 | 通用参数 |
|----------|-------------------|
| `/chat/completions` | `messages`, `max_tokens`, `max_completion_tokens`, `temperature`, `top_p`, `stream`, `stop`, `tools`, `tool_choice`, `response_format`, `extra_body`, `extra_headers` |
| `/completions` | `prompt`, `max_tokens`, `temperature`, `top_p`, `stream`, `stop` |
| `/responses` | `input`, `max_output_tokens`, `temperature`, `top_p`, `stream`, `tools`, `tool_choice`, `text`, `extra_headers` |
| `/messages` | `messages`, `max_tokens`, `temperature`, `top_p`, `stream`, `tools`, `tool_choice`, `extra_headers` |

对话补全方面，LiteLLM 接受 `max_completion_tokens`，并在发给 Tensormesh 时将其映射为 `max_tokens`。

## 注意事项

- 直接通过 LiteLLM SDK 调用时，使用 `model="tensormesh/<your-model-name>"`。
- 默认的无服务器 Base URL 为 `https://serverless.tensormesh.ai/v1`。
- 推理控制项（`thinking`/`enable_thinking` 与 `reasoning_effort`）通过 `extra_body.chat_template_kwargs` 传递，在支持推理的模型上生效。
