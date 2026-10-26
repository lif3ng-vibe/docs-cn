# Empower
LiteLLM 支持 Empower 上的所有模型。

## API 密钥

```python
import os
os.environ["EMPOWER_API_KEY"] = "your-api-key"
```
## 使用示例

```python
from litellm import completion
import os

os.environ["EMPOWER_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Write me a poem about the blue sky"}]

response = completion(model="empower/empower-functions", messages=messages)
print(response)
```

## 使用示例：流式
```python
from litellm import completion
import os

os.environ["EMPOWER_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Write me a poem about the blue sky"}]

response = completion(model="empower/empower-functions", messages=messages, streaming=True)
for chunk in response:
    print(chunk['choices'][0]['delta'])

```

## 使用示例：自动工具调用

```python
from litellm import completion
import os

os.environ["EMPOWER_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]

response = completion(
    model="empower/empower-functions-small",
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response:\n", response)
```

## Empower 模型
LiteLLM 对 https://empower.dev/ 上的所有模型均支持 `non-streaming` 与 `streaming` 请求。

Empower 用法示例。注意：LiteLLM 支持 Empower 上部署的所有模型。


### Empower LLM：自动工具调用模型
| 模型名称                          | 函数调用                                                               | 所需环境变量                    |
|-----------------------------------|------------------------------------------------------------------------|---------------------------------|
| empower/empower-functions  | `completion('empower/empower-functions', messages)`            | `os.environ['TOGETHERAI_API_KEY']` |
| empower/empower-functions-small  | `completion('empower/empower-functions-small', messages)`            | `os.environ['TOGETHERAI_API_KEY']` |
