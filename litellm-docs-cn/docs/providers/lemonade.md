import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lemonade

[Lemonade Server](https://lemonade-server.ai/) 是一个与 OpenAI 兼容的本地语言模型推理提供商（provider），专为 AMD GPU 与 NPU 优化。litellm 的 `lemonade` 提供商支持标准对话补全（chat completion），与 OpenAI API 完全兼容。

| 属性 | 说明 |
|-------|-------|
| 描述 | 用于本地与云端语言模型推理的 OpenAI 兼容 AI 提供商 |
| LiteLLM 中的提供商路由 | `lemonade/`（在模型名前加此前缀，例如 `lemonade/your-model-name`） |
| 提供商 API 端点 | http://localhost:8000/api/v1（默认） |
| 支持的端点 | `/chat/completions` |

## 支持的 OpenAI 参数

Lemonade 与 OpenAI 完全兼容，支持以下参数：

```
"repeat_penalty"
"functions"
"logit_bias"
"max_tokens"
"max_completion_tokens"
"presence_penalty"
"stop"
"temperature"
"top_p"
"top_k"
"response_format"
"tools"
```


## API 密钥设置

Lemonade 可以配置自定义 API URL，且不要求严格的 API 密钥校验。设置 `LEMONADE_API_BASE` 环境变量即可修改基础 URL。

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

# Optional: Set custom API base. Useful if your lemonade server is on
# a different port
os.environ['LEMONADE_API_BASE'] = "http://localhost:8000/api/v1"

response = completion(
    model="lemonade/your-model-name",
    messages=[
       {"role": "user", "content": "Hello from LiteLLM!"}
   ],
)
print(response)
```

## 流式

```python
from litellm import completion
import os

# Optional: Set custom API base. Useful if your lemonade server is on
# a different port
os.environ['LEMONADE_API_BASE'] = "http://localhost:8000/api/v1"

response = completion(
    model="lemonade/your-model-name",
    messages=[
       {"role": "user", "content": "Write a short story"}
   ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end='', flush=True)
```

## 高级用法

### 自定义参数

除标准 OpenAI 参数集之外，Lemonade 还支持以下额外参数：

```python
from litellm import completion

response = completion(
    model="lemonade/your-model-name",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    temperature=0.7,
    max_tokens=500,
    top_p=0.9,
    top_k=50,
    repeat_penalty=1.1,
    stop=["Human:", "AI:"]
)
print(response)
```

### 函数调用

Lemonade 支持与 OpenAI 兼容的函数调用（function calling）：

```python
from litellm import completion

functions = [
    {
        "name": "get_weather",
        "description": "Get current weather information",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state"
                }
            },
            "required": ["location"]
        }
    }
]

response = completion(
    model="lemonade/your-model-name",
    messages=[{"role": "user", "content": "What's the weather in San Francisco?"}],
    tools=[{"type": "function", "function": f} for f in functions],
    tool_choice="auto"
)
print(response)
```

### 响应格式

Lemonade 支持通过 response_format 实现结构化输出（structured output）：

```python
from litellm import completion
import json

# Define schema in response_format
response = completion(
    model="lemonade/Qwen3-Coder-30B-A3B-Instruct-GGUF",
    messages=[{"role": "user", "content": "Generate JSON data for a person with their name, age, and city."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "person",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "city": {"type": "string"}
                },
                "required": ["name", "age"]
            }
        }
    }
)

print(f"Model: {response.model}")
print(f"JSON Output:")
json_data = json.loads(response.choices[0].message.content)
print(json.dumps(json_data, indent=2))
```

## 可用模型

Lemonade 会通过查询 `/models` 端点自动校验可用模型。你也可以用编程方式查看可用模型：

```python
import httpx

api_base = "http://localhost:8000"  # or your custom base
response = httpx.get(f"{api_base}/api/v1/models")
models = response.json()
print("Available models:", [model['id'] for model in models.get('data', [])])
```

## 支持

如需了解 Lemonade 的更多信息，请访问 [Lemonade 网站](https://lemonade-server.ai/)或 [Lemonade 代码仓库](https://github.com/lemonade-sdk/lemonade)。

</TabItem>
</Tabs>
