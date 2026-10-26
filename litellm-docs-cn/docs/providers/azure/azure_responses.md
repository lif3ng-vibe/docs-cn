import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure Responses API

| 属性 | 说明 |
|-------|-------|
| 描述 | Azure OpenAI Responses API |
| LiteLLM 中的 `custom_llm_provider` | `azure/` |
| 支持的操作 | `/v1/responses`|
| Azure OpenAI Responses API | [Azure OpenAI Responses API ↗](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/responses?tabs=python-secure) |
| 成本追踪与日志支持 | ✅ LiteLLM 会为 Responses API 请求记录日志并追踪成本 |
| 支持的 OpenAI 参数 | ✅ 所有 OpenAI 参数均受支持，[详见此处](https://github.com/BerriAI/litellm/blob/0717369ae6969882d149933da48eeb8ab0e691bd/litellm/llms/openai/responses/transformation.py#L23) |

## 用法

## 创建模型响应

<Tabs>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

#### 非流式

```python showLineNumbers title="Azure Responses API"
import litellm

# Non-streaming response
response = litellm.responses(
    model="azure/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100,
    api_key=os.getenv("AZURE_RESPONSES_OPENAI_API_KEY"),
    api_base="https://litellm8397336933.openai.azure.com/",
    api_version="2023-03-15-preview",
)

print(response)
```

#### 流式
```python showLineNumbers title="Azure Responses API"
import litellm

# Streaming response
response = litellm.responses(
    model="azure/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True,
    api_key=os.getenv("AZURE_RESPONSES_OPENAI_API_KEY"),
    api_base="https://litellm8397336933.openai.azure.com/",
    api_version="2023-03-15-preview",
)

for event in response:
    print(event)
```

</TabItem>
<TabItem value="proxy" label="通过 LiteLLM 代理使用 OpenAI SDK">

首先，把下面的配置加进 litellm 代理的 config.yaml：
```yaml showLineNumbers title="Azure Responses API"
model_list:
  - model_name: o1-pro
    litellm_params:
      model: azure/o1-pro
      api_key: os.environ/AZURE_RESPONSES_OPENAI_API_KEY
      api_base: https://litellm8397336933.openai.azure.com/
      api_version: 2023-03-15-preview
```

启动 LiteLLM 代理：
```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

然后把 OpenAI SDK 指向你的代理来使用：

#### 非流式
```python showLineNumbers
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 流式
```python showLineNumbers
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>
</Tabs>

## Azure Codex 模型

Codex 模型使用 Azure 全新的 [/v1/preview API](https://learn.microsoft.com/en-us/azure/ai-services/openai/api-version-lifecycle?tabs=key#next-generation-api)，无需每月更新 `api-version` 即可持续获得最新功能。

**设置 `api_version="preview"` 后，LiteLLM 会把你的请求发往 `/v1/preview` 端点**。

<Tabs>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

#### 非流式

```python showLineNumbers title="Azure Codex Models"
import litellm

# Non-streaming response with Codex models
response = litellm.responses(
    model="azure/codex-mini",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100,
    api_key=os.getenv("AZURE_RESPONSES_OPENAI_API_KEY"),
    api_base="https://litellm8397336933.openai.azure.com",
    api_version="preview", # 👈 key difference
)

print(response)
```

#### 流式
```python showLineNumbers title="Azure Codex Models"
import litellm

# Streaming response with Codex models
response = litellm.responses(
    model="azure/codex-mini",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True,
    api_key=os.getenv("AZURE_RESPONSES_OPENAI_API_KEY"),
    api_base="https://litellm8397336933.openai.azure.com",
    api_version="preview", # 👈 key difference
)

for event in response:
    print(event)
```

</TabItem>
<TabItem value="proxy" label="通过 LiteLLM 代理使用 OpenAI SDK">

首先，把下面的配置加进 litellm 代理的 config.yaml：
```yaml showLineNumbers title="Azure Codex Models"
model_list:
  - model_name: codex-mini
    litellm_params:
      model: azure/codex-mini
      api_key: os.environ/AZURE_RESPONSES_OPENAI_API_KEY
      api_base: https://litellm8397336933.openai.azure.com
      api_version: preview # 👈 key difference
```

启动 LiteLLM 代理：
```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

然后把 OpenAI SDK 指向你的代理来使用：

#### 非流式
```python showLineNumbers
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="codex-mini",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 流式
```python showLineNumbers
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="codex-mini",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>
</Tabs>


## 通过 `/chat/completions` 调用

你也可以通过 `/chat/completions` 端点来调用 Azure Responses API。


<Tabs>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers
from litellm import completion
import os 

os.environ["AZURE_API_BASE"] = "https://my-azure-endpoint.openai.azure.com/"
os.environ["AZURE_API_VERSION"] = "2023-03-15-preview"
os.environ["AZURE_API_KEY"] = "my-api-key"

response = completion(
    model="azure/responses/my-custom-o1-pro",
    messages=[{"role": "user", "content": "Hello world"}],
)

print(response)
```
</TabItem>
<TabItem value="proxy" label="通过 LiteLLM 代理使用 OpenAI SDK">

1. 配置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: my-custom-o1-pro
    litellm_params:
      model: azure/responses/my-custom-o1-pro
      api_key: os.environ/AZURE_API_KEY
      api_base: https://my-azure-endpoint.openai.azure.com/
      api_version: 2023-03-15-preview
```

2. 启动 LiteLLM 代理
```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！

```bash
curl http://localhost:4000/v1/chat/completions \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "my-custom-o1-pro",
    "messages": [{"role": "user", "content": "Hello world"}]
  }'
```
</TabItem>
</Tabs>
