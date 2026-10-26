import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GigaChat
https://developers.sber.ru/docs/ru/gigachat/api/overview

GigaChat 是 Sber AI 的大语言模型，来自俄罗斯领先的 LLM 提供商。

:::tip

**我们支持全部 GigaChat 模型，只需在发送 litellm 请求时，将 `model=gigachat/<any-model-on-gigachat>` 作为模型名前缀即可**

:::

:::warning

GigaChat API 使用自签名 SSL 证书，请求中必须传入 `ssl_verify=False`。

:::

## 支持的功能

| 功能 | 是否支持 |
|---------|-----------|
| 对话补全 | 是 |
| 流式 | 是 |
| 异步 | 是 |
| 函数调用 / 工具 | 是 |
| 结构化输出（JSON Schema） | 是（通过函数调用模拟） |
| 图像输入 | 是（base64 和 URL）——仅限 GigaChat-2-Max 与 GigaChat-2-Pro |
| 嵌入 | 是 |

## API 密钥

GigaChat 采用 OAuth 认证，请将凭据设置为环境变量：

```python
import os

# Required: Set credentials (base64-encoded client_id:client_secret)
os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

# Optional: Set scope (default is GIGACHAT_API_PERS for personal use)
os.environ['GIGACHAT_SCOPE'] = "GIGACHAT_API_PERS"  # or GIGACHAT_API_B2B for business
```

凭据获取地址：https://developers.sber.ru/studio/

## 使用示例

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = completion(
    model="gigachat/GigaChat-2-Max",
    messages=[
       {"role": "user", "content": "Hello from LiteLLM!"}
   ],
    ssl_verify=False,  # Required for GigaChat
)
print(response)
```

## 使用示例 - 流式

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = completion(
    model="gigachat/GigaChat-2-Max",
    messages=[
       {"role": "user", "content": "Hello from LiteLLM!"}
   ],
    stream=True,
    ssl_verify=False,  # Required for GigaChat
)

for chunk in response:
    print(chunk)
```

## 使用示例 - 函数调用

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"]
        }
    }
}]

response = completion(
    model="gigachat/GigaChat-2-Max",
    messages=[{"role": "user", "content": "What's the weather in Moscow?"}],
    tools=tools,
    ssl_verify=False,  # Required for GigaChat
)
print(response)
```

## 使用示例 - 结构化输出

GigaChat 通过 JSON schema 支持结构化输出（借助函数调用模拟实现）：

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = completion(
    model="gigachat/GigaChat-2-Max",
    messages=[{"role": "user", "content": "Extract info: John is 30 years old"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "person",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"}
                }
            }
        }
    },
    ssl_verify=False,  # Required for GigaChat
)
print(response)  # Returns JSON: {"name": "John", "age": 30}
```

## 使用示例 - 图像输入

GigaChat 支持以 base64 或 URL 方式传入图像（仅限 GigaChat-2-Max 与 GigaChat-2-Pro）：

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = completion(
    model="gigachat/GigaChat-2-Max",  # Vision requires GigaChat-2-Max or GigaChat-2-Pro
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
    }],
    ssl_verify=False,  # Required for GigaChat
)
print(response)
```

## 使用示例 - 嵌入

```python
from litellm import embedding
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = embedding(
    model="gigachat/Embeddings",
    input=["Hello world", "How are you?"],
    ssl_verify=False,  # Required for GigaChat
)
print(response)
```

## 通过 LiteLLM 代理使用

### 1. 在 config.yaml 中配置 GigaChat 模型

```yaml
model_list:
  - model_name: gigachat
    litellm_params:
      model: gigachat/GigaChat-2-Max
      api_key: "os.environ/GIGACHAT_CREDENTIALS"
      ssl_verify: false
  - model_name: gigachat-lite
    litellm_params:
      model: gigachat/GigaChat-2-Lite
      api_key: "os.environ/GIGACHAT_CREDENTIALS"
      ssl_verify: false
  - model_name: gigachat-embeddings
    litellm_params:
      model: gigachat/Embeddings
      api_key: "os.environ/GIGACHAT_CREDENTIALS"
      ssl_verify: false
```

### 2. 启动代理

```bash
litellm --config config.yaml
```

### 3. 测试

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "gigachat",
    "messages": [
        {
            "role": "user",
            "content": "Hello!"
        }
    ]
}'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gigachat",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response)
```
</TabItem>
</Tabs>

## 支持的模型

### 对话模型

| 模型名称 | 上下文窗口 | 视觉 | 描述 |
|------------|----------------|--------|-------------|
| gigachat/GigaChat-2-Lite | 128K | 否 | 速度快、轻量的模型 |
| gigachat/GigaChat-2-Pro | 128K | 是 | 支持视觉的专业级模型 |
| gigachat/GigaChat-2-Max | 128K | 是 | 能力最强的旗舰模型 |

### 嵌入模型

| 模型名称 | 最大输入 | 维度 | 描述 |
|------------|-----------|------------|-------------|
| gigachat/Embeddings | 512 | 1024 | 标准嵌入 |
| gigachat/Embeddings-2 | 512 | 1024 | 迭代更新的嵌入 |
| gigachat/EmbeddingsGigaR | 4096 | 2560 | 高维度嵌入 |

:::note
可用模型可能因你的 API 访问级别（个人或企业）而有所不同。
:::

## 限制

- 每次请求只能发起一次函数调用（GigaChat API 的限制）
- 每条消息最多 1 张图像，每轮对话累计最多 10 张
- GigaChat API 使用自签名 SSL 证书，必须设置 `ssl_verify=False`
