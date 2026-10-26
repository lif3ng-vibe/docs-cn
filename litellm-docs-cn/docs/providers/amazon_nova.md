import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Amazon Nova

| 属性 | 说明 |
|-------|-------|
| 描述 | Amazon Nova 是 Amazon 打造的基础模型系列，兼具前沿智能与业界领先的性价比。 |
| LiteLLM 中的提供商路由 | `amazon_nova/` |
| 提供商文档 | [Amazon Nova ↗](https://docs.aws.amazon.com/nova/latest/userguide/what-is-nova.html) |
| 支持的 OpenAI 端点 | `/chat/completions`, `v1/responses` |
| 其他支持的端点 | `v1/messages`, `/generateContent` | 

## 身份验证

Amazon Nova 采用 API 密钥（API key）认证。你可以在 [Amazon Nova 开发者控制台 ↗](https://nova.amazon.com/dev/documentation) 获取 API 密钥。

```bash
export AMAZON_NOVA_API_KEY="your-api-key"
```

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

# Set your API key
os.environ["AMAZON_NOVA_API_KEY"] = "your-api-key"

response = completion(
    model="amazon_nova/nova-micro-v1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello, how are you?"}
    ]
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="代理">

### 1. 设置 config.yaml

```yaml
model_list:
  - model_name: amazon-nova-micro
    litellm_params:
      model: amazon_nova/nova-micro-v1
      api_key: os.environ/AMAZON_NOVA_API_KEY
```
### 2. 启动代理
```bash
litellm --config /path/to/config.yaml
```

### 3. 测试

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "amazon-nova-micro",
    "messages": [
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ]
}'
```

</TabItem>
</Tabs>

## 支持的模型

| 模型名称 | 用法 | 上下文窗口 |
|------------|-------|----------------|
| Nova Micro | `completion(model="amazon_nova/nova-micro-v1", messages=messages)` | 128K Token |
| Nova Lite | `completion(model="amazon_nova/nova-lite-v1", messages=messages)` | 300K Token |
| Nova Pro | `completion(model="amazon_nova/nova-pro-v1", messages=messages)` | 300K Token |
| Nova Premier | `completion(model="amazon_nova/nova-premier-v1", messages=messages)` | 1M Token |

## 用法 - 流式输出

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AMAZON_NOVA_API_KEY"] = "your-api-key"

response = completion(
    model="amazon_nova/nova-micro-v1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Tell me about machine learning"}
    ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

</TabItem>
<TabItem value="proxy" label="代理">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "amazon-nova-micro",
    "messages": [
        {
            "role": "user",
            "content": "Tell me about machine learning"
        }
    ],
    "stream": true
}'
```

</TabItem>
</Tabs>

## 用法 - 函数调用 / 工具调用

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AMAZON_NOVA_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "function",
        "function": {
            "name": "getCurrentWeather",
            "description": "Get the current weather in a given city",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City and country e.g. San Francisco, CA"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

response = completion(
    model="amazon_nova/nova-micro-v1",
    messages=[
        {"role": "user", "content": "What's the weather like in San Francisco?"}
    ],
    tools=tools
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="代理">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "amazon-nova-micro",
    "messages": [
        {
            "role": "user",
            "content": "What'\''s the weather like in San Francisco?"
        }
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "getCurrentWeather",
                "description": "Get the current weather in a given city",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City and country e.g. San Francisco, CA"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ]
}'
```

</TabItem>
</Tabs>

## 设置 temperature、top_p 等参数

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AMAZON_NOVA_API_KEY"] = "your-api-key"

response = completion(
    model="amazon_nova/nova-pro-v1",
    messages=[
        {"role": "user", "content": "Write a creative story"}
    ],
    temperature=0.8,
    max_tokens=500,
    top_p=0.9
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="代理">

**在 yaml 中设置**

```yaml
model_list:
  - model_name: amazon-nova-pro
    litellm_params:
      model: amazon_nova/nova-pro-v1
      temperature: 0.8
      max_tokens: 500
      top_p: 0.9
```
**在请求中设置**
```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "amazon-nova-pro",
    "messages": [
        {
            "role": "user",
            "content": "Write a creative story"
        }
    ],
    "temperature": 0.8,
    "max_tokens": 500,
    "top_p": 0.9
}'
```

</TabItem>
</Tabs>

## 模型对比

| 模型 | 适用场景 | 速度 | 成本 | 上下文 |
|-------|----------|-------|------|---------|
| **Nova Micro** | 简单任务、高吞吐 | 最快 | 最低 | 128K |
| **Nova Lite** | 性能均衡 | 快 | 低 | 300K |
| **Nova Pro** | 复杂推理 | 中等 | 中等 | 300K |
| **Nova Premier** | 最先进的任务 | 较慢 | 较高 | 1M |

## 错误处理

常见错误码及其含义：

- `401 Unauthorized`：API 密钥无效
- `429 Too Many Requests`：超出速率限制
- `400 Bad Request`：请求格式无效
- `500 Internal Server Error`：服务暂时不可用
