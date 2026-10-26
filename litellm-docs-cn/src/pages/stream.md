# 流式响应与异步补全

- [流式响应](#流式响应)
- [异步补全](#异步补全)

## 流式响应
LiteLLM 支持向 completion 函数传入 `stream=True` 参数，以流式返回模型响应。
### 用法
```python
response = completion(model="gpt-3.5-turbo", messages=messages, stream=True)
for chunk in response:
    print(chunk['choices'][0]['delta'])

```

## 异步补全
使用 LiteLLM 进行异步补全
LiteLLM 为 completion 函数提供了名为 `acompletion` 的异步版本
### 用法
```
from litellm import acompletion
import asyncio

async def test_get_response():
    user_message = "Hello, how are you?"
    messages = [{"content": user_message, "role": "user"}]
    response = await acompletion(model="gpt-3.5-turbo", messages=messages)
    return response

response = asyncio.run(test_get_response())
print(response)

```

## 流式 Token 用量

所有提供商均支持，行为与 OpenAI 相同。

`stream_options={"include_usage": True}`

设置后，在 `data: [DONE]` 消息之前会额外流出一个 chunk。该 chunk 的 usage 字段包含整个请求的 Token 用量统计，choices 字段则始终为空数组。其余所有 chunk 也会携带 usage 字段，但其值为 null。

### SDK
```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = ""

response = completion(model="gpt-3.5-turbo", messages=messages, stream=True, stream_options={"include_usage": True})
for chunk in response:
    print(chunk['choices'][0]['delta'])
```

### 代理

```bash
curl https://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ],
    "stream": true,
    "stream_options": {"include_usage": true}
  }'

```
