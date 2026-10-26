# CometAPI
LiteLLM 支持 [CometAPI](https://www.cometapi.com/) 旗下的全部 AI 模型。CometAPI 通过统一的 API 接口提供 500 多个 AI 模型的访问，其中既有 GPT-5、Claude Opus 4.1 这样的前沿模型，也包括其他多款先进的语言模型。

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_CometAPI.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="在 Colab 中打开"/>
</a>

## 认证

要使用 CometAPI 的模型，你需要先从 [CometAPI Token Console](https://api.cometapi.com/console/token) 获取 API 密钥。CometAPI 为新用户提供了免费额度，注册后即可立即拿到免费的 API 密钥。

## 用法

把你的 CometAPI 密钥设置为环境变量，然后调用 completion 函数：

```python
import os
from litellm import completion

# Set API key
os.environ["COMETAPI_KEY"] = "your_comet_api_key_here"

# Define messages
messages = [{"content": "Hello, how are you?", "role": "user"}]

# Method 1: Using environment variable (recommended)
response = completion(
    model="cometapi/{{openai_large}}", 
    messages=messages
)

print(response.choices[0].message.content)
```

### 另一种用法：显式传入 API 密钥

你也可以显式传入 API 密钥：

```python
import os
from litellm import completion

# Define messages
messages = [{"content": "Hello, how are you?", "role": "user"}]

# Method 2: Explicitly passing API key
response = completion(
    model="cometapi/{{openai_large}}", 
    messages=messages, 
    api_key="your_comet_api_key_here"
)

print(response.choices[0].message.content)
```

## 流式用法

调用 completion 时设置 `stream=True` 即可：

```python
import os
from litellm import completion

os.environ["COMETAPI_KEY"] = "your_comet_api_key_here"

messages = [{"content": "Hello, how are you?", "role": "user"}]

response = completion(
    model="cometapi/{{openai_large}}",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

## 异步流式用法

异步流式使用 `acompletion`：

```python
from litellm import acompletion
import asyncio, os, traceback

async def completion_call():
    try:
        os.environ["COMETAPI_KEY"] = "your_comet_api_key_here"
        
        print("test acompletion + streaming")
        response = await acompletion(
            model="cometapi/{{openai_large}}", 
            messages=[{"content": "Hello, how are you?", "role": "user"}], 
            stream=True
        )
        print(f"response: {response}")
        async for chunk in response:
            print(chunk)
    except:
        print(f"error occurred: {traceback.format_exc()}")
        pass

# Run the async function
await completion_call()
```

## CometAPI 模型

CometAPI 通过统一的 API 提供 500 多个 AI 模型的访问。部分热门模型如下：

| 模型名称 | 调用方式 |
|------------|---------------|
| cometapi/gpt-5 | `completion('cometapi/gpt-5', messages)` |
| cometapi/gpt-5-mini | `completion('cometapi/gpt-5-mini', messages)` |
| cometapi/gpt-5-nano | `completion('cometapi/gpt-5-nano', messages)` |
| cometapi/gpt-oss-20b | `completion('cometapi/gpt-oss-20b', messages)` |
| cometapi/gpt-oss-120b | `completion('cometapi/gpt-oss-120b', messages)` |
| cometapi/chatgpt-4o-latest | `completion('cometapi/chatgpt-4o-latest', messages)` |

完整模型列表请查看 [CometAPI Models 页面](https://www.cometapi.com/model/)。

## 环境变量

| 变量 | 说明 | 是否必填 |
|----------|-------------|----------|
| `COMETAPI_KEY` | 你的 CometAPI API 密钥 | 是 |

## 错误处理

```python
import os
from litellm import completion

try:
    os.environ["COMETAPI_KEY"] = "your_comet_api_key_here"
    
    messages = [{"content": "Hello, how are you?", "role": "user"}]
    
    response = completion(
        model="cometapi/{{openai_large}}",
        messages=messages
    )
    
    print(response.choices[0].message.content)
    
except Exception as e:
    print(f"Error: {e}")
```
