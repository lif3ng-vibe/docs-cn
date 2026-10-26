import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Moonshot AI

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Moonshot AI 提供多款大型语言模型，包括 moonshot-v1 系列和 Kimi 系列模型。 |
| LiteLLM 提供商路由 | `moonshot/` |
| 提供商文档链接 | [Moonshot AI ↗](https://platform.moonshot.ai/) |
| Base URL | `https://api.moonshot.ai/` |
| 支持的操作 | [`/chat/completions`](/docs/providers/moonshot#用法---litellm-python-sdk) |

<br />
<br />

https://platform.moonshot.ai/

**我们支持全部 Moonshot AI 模型，发送补全（completion）请求时只需在模型名前加上 `moonshot/` 前缀**

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["MOONSHOT_API_KEY"] = ""  # your Moonshot AI API key
```

**注意**：

Moonshot AI 提供两套不同的 API 端点：一套面向全球，一套专为中国市场。
- 全球 API Base URL：`https://api.moonshot.ai/v1`（当前实现采用的就是这一套）
- 中国 API Base URL：`https://api.moonshot.cn/v1`

可以通过下面的方式覆盖 base url：

```
os.environ["MOONSHOT_API_BASE"] = "https://api.moonshot.cn/v1"
```

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Moonshot Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["MOONSHOT_API_KEY"] = ""  # your Moonshot AI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Moonshot call
response = completion(
    model="moonshot/moonshot-v1-8k", 
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Moonshot Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["MOONSHOT_API_KEY"] = ""  # your Moonshot AI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Moonshot call with streaming
response = completion(
    model="moonshot/moonshot-v1-8k", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 用法 - LiteLLM 代理

在 LiteLLM 代理（Proxy）的配置文件中加入以下内容：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: moonshot-v1-8k
    litellm_params:
      model: moonshot/moonshot-v1-8k
      api_key: os.environ/MOONSHOT_API_KEY

  - model_name: moonshot-v1-32k
    litellm_params:
      model: moonshot/moonshot-v1-32k
      api_key: os.environ/MOONSHOT_API_KEY

  - model_name: moonshot-v1-128k
    litellm_params:
      model: moonshot/moonshot-v1-128k
      api_key: os.environ/MOONSHOT_API_KEY
```

启动 LiteLLM 代理服务器：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Moonshot via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="moonshot-v1-8k",
    messages=[{"role": "user", "content": "hello from litellm"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Moonshot via Proxy - Streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="moonshot-v1-8k",
    messages=[{"role": "user", "content": "hello from litellm"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Moonshot via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/moonshot-v1-8k",
    messages=[{"role": "user", "content": "hello from litellm"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Moonshot via Proxy - LiteLLM SDK Streaming"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/moonshot-v1-8k",
    messages=[{"role": "user", "content": "hello from litellm"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key",
    stream=True
)

for chunk in response:
    if hasattr(chunk.choices[0], 'delta') and chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Moonshot via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

```bash showLineNumbers title="Moonshot via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [{"role": "user", "content": "hello from litellm"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

要了解 LiteLLM 代理的更多详细用法，请参阅 [LiteLLM 代理文档](../providers/litellm_proxy)。

## 图像与视觉支持

Moonshot 的视觉模型（`kimi-k2.5`、`kimi-latest`、`moonshot-v1-*-vision-preview` 等）接受标准的 OpenAI content 数组，并支持其中包含 `image_url` 块。

当消息中包含图像时，LiteLLM 会自动识别并保留 content 数组，让图像负载原样送达 Moonshot API；纯文本请求则会被压平成普通字符串，以满足 Moonshot 文本模型的要求。

```python showLineNumbers title="Moonshot Vision Example"
import os
import litellm

os.environ["MOONSHOT_API_KEY"] = ""

response = litellm.completion(
    model="moonshot/kimi-k2.5",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this image?"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image.png"},
                },
            ],
        }
    ],
)

print(response.choices[0].message.content)
```

## Moonshot AI 限制与 LiteLLM 处理方式

为了保持与 OpenAI 的兼容性，LiteLLM 会自动处理以下 [Moonshot AI 的限制](https://platform.moonshot.ai/docs/guide/migrating-from-openai-to-kimi#about-api-compatibility)：

### Temperature 取值范围限制
**限制**：Moonshot AI 只支持 [0, 1] 的 temperature 取值范围（OpenAI 为 [0, 2]）  
**LiteLLM 处理方式**：自动把大于 1 的 temperature 收敛为 1

### Temperature 与多输出组合的限制  
**限制**：当 temperature < 0.3 且 n > 1 时，Moonshot AI 会抛出异常  
**LiteLLM 处理方式**：检测到这一条件时，自动把 temperature 设为 0.3

### Tool Choice "Required" 不受支持
**限制**：Moonshot AI 不支持 `tool_choice="required"`  
**LiteLLM 处理方式**：通过以下方式转换：
- 追加一条消息："Please select a tool to handle the current issue."
- 从请求中移除 `tool_choice` 参数
