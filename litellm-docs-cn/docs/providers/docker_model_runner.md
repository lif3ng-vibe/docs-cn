import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Docker Model Runner

## 概述

| 属性 | 说明 |
|-------|-------|
| 描述 | Docker Model Runner 让你能够使用 Docker Desktop 在本地运行大语言模型。 |
| LiteLLM 提供商路由 | `docker_model_runner/` |
| 提供商文档链接 | [Docker Model Runner ↗](https://docs.docker.com/ai/model-runner/) |
| Base URL | `http://localhost:22088` |
| 支持的操作 | [`/chat/completions`](/docs/providers/docker_model_runner#用法litellm-python-sdk) |

<br />
<br />

https://docs.docker.com/ai/model-runner/

**我们支持所有 Docker Model Runner 模型，发送补全（completion）请求时只需在模型名前加上 `docker_model_runner/` 前缀**

## 快速上手

Docker Model Runner 是 Docker Desktop 的一项功能，让你在本地运行 AI 模型。相比其他本地方案，它的性能更好，同时保持对 OpenAI 接口的兼容。

### 安装

1. 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. 在 Docker Desktop 设置中启用 Docker Model Runner
3. 通过 Docker Desktop 下载你想用的模型

## 环境变量

```python showLineNumbers title="环境变量"
os.environ["DOCKER_MODEL_RUNNER_API_BASE"] = "http://localhost:22088/engines/llama.cpp"  # Optional - defaults to this
os.environ["DOCKER_MODEL_RUNNER_API_KEY"] = "dummy-key"  # Optional - Docker Model Runner may not require auth for local instances
```

**注意**：
- Docker Model Runner 通常在本地运行，可能不需要身份验证。未提供密钥时，LiteLLM 默认会使用一个占位密钥。
- API base 中应包含引擎路径（例如 `/engines/llama.cpp`）

## API Base 结构

Docker Model Runner 使用一种独特的 URL 结构：

```
http://model-runner.docker.internal/engines/{engine}/v1/chat/completions
```

其中 `{engine}` 是你要使用的引擎（通常是 `llama.cpp`）。

**重要**：引擎要在 `api_base` URL 中指定，而不是写在模型名里：
- ✅ 正确：`api_base="http://localhost:22088/engines/llama.cpp"`、`model="docker_model_runner/llama-3.1"`
- ❌ 错误：`api_base="http://localhost:22088"`、`model="docker_model_runner/llama.cpp/llama-3.1"`

## 用法：LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Docker Model Runner 非流式补全"
import os
import litellm
from litellm import completion

# Specify the engine in the api_base URL
os.environ["DOCKER_MODEL_RUNNER_API_BASE"] = "http://localhost:22088/engines/llama.cpp"

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Docker Model Runner call
response = completion(
    model="docker_model_runner/llama-3.1", 
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Docker Model Runner 流式补全"
import os
import litellm
from litellm import completion

# Specify the engine in the api_base URL
os.environ["DOCKER_MODEL_RUNNER_API_BASE"] = "http://localhost:22088/engines/llama.cpp"

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Docker Model Runner call with streaming
response = completion(
    model="docker_model_runner/llama-3.1", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 自定义 API Base 与引擎

```python showLineNumbers title="自定义 API Base 与不同引擎"
import litellm
from litellm import completion

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Specify the engine in the api_base URL
# Using a different host and engine
response = completion(
    model="docker_model_runner/llama-3.1",
    messages=messages,
    api_base="http://model-runner.docker.internal/engines/llama.cpp"
)

print(response)
```

### 使用不同引擎

```python showLineNumbers title="使用不同引擎"
import litellm
from litellm import completion

messages = [{"content": "Hello, how are you?", "role": "user"}]

# To use a different engine, specify it in the api_base
# For example, if Docker Model Runner supports other engines:
response = completion(
    model="docker_model_runner/mistral-7b",
    messages=messages,
    api_base="http://localhost:22088/engines/custom-engine"
)

print(response)
```

## 用法：LiteLLM 代理

将以下配置添加到 LiteLLM 代理配置文件中：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: llama-3.1
    litellm_params:
      model: docker_model_runner/llama-3.1
      api_base: http://localhost:22088/engines/llama.cpp

  - model_name: mistral-7b
    litellm_params:
      model: docker_model_runner/mistral-7b
      api_base: http://localhost:22088/engines/llama.cpp
```

启动 LiteLLM 代理服务器：

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="通过代理使用 Docker Model Runner - 非流式"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="llama-3.1",
    messages=[{"role": "user", "content": "hello from litellm"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="通过代理使用 Docker Model Runner - 流式"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="llama-3.1",
    messages=[{"role": "user", "content": "hello from litellm"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="通过代理使用 Docker Model Runner - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/llama-3.1",
    messages=[{"role": "user", "content": "hello from litellm"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="通过代理使用 Docker Model Runner - LiteLLM SDK 流式"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/llama-3.1",
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

```bash showLineNumbers title="通过代理使用 Docker Model Runner - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "llama-3.1",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

```bash showLineNumbers title="通过代理使用 Docker Model Runner - cURL 流式"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "llama-3.1",
    "messages": [{"role": "user", "content": "hello from litellm"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

有关 LiteLLM 代理的更多用法细节，请参阅 [LiteLLM 代理文档](../providers/litellm_proxy)。

## API 参考

详细的 API 信息请参阅 [Docker Model Runner API 参考](https://docs.docker.com/ai/model-runner/api-reference/)。
