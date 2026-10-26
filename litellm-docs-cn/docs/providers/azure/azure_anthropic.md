import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure Anthropic（经由 Azure Foundry 的 Claude）

LiteLLM 支持部署在 Microsoft Azure Foundry 上的 Claude 模型，包括 Claude Sonnet 4.5、Claude Haiku 4.5 和 Claude Opus 4.1。

## 可用模型

Azure Foundry 支持以下 Claude 模型：

- `{{anthropic}}` - Anthropic 能力最强的模型，适合构建真实场景中的智能体，并处理复杂的长周期任务
- `claude-haiku-4-5` - 性能接近旗舰水平，速度与成本兼顾，适合高用量场景
- `{{anthropic_large}}` - 编程领域的行业标杆，在长时间运行的任务上保持稳定表现

| 属性 | 说明 |
|-------|-------|
| 描述 | 通过 Microsoft Azure Foundry 部署的 Claude 模型。使用与 Anthropic Messages API 相同的 API，但采用 Azure 身份验证。 |
| LiteLLM 中的提供商路由 | `azure_ai/`（在 Claude 模型名前加上该前缀，例如 `azure_ai/claude-sonnet-4-5`） |
| 提供商文档 | [Azure Foundry Claude 模型 ↗](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-claude) |
| API 端点 | `https://<resource-name>.services.ai.azure.com/anthropic/v1/messages` |
| 支持的端点 | `/chat/completions`, `/anthropic/v1/messages`|

## 主要特性

- **扩展思考**：为复杂任务提供更强的推理能力
- **图文输入**：具备出色的视觉能力，可分析图表、图形、技术示意图和报告
- **代码生成**：以高级思考能力完成代码生成、分析与调试（Claude Sonnet 4.5 和 Claude Opus 4.1）
- **与 Anthropic 相同的 API**：所有请求/响应转换都与主 Anthropic 提供商完全一致

## 身份验证

Azure Anthropic 支持两种身份验证方式：

1. **API 密钥**：使用 `api-key` 请求头
2. **Azure AD Token**：使用 `Authorization: Bearer <token>` 请求头（Microsoft Entra ID）

## API 密钥与配置

`azure_ai/` 补全路由会读取 `AZURE_AI_API_KEY` 和 `AZURE_AI_API_BASE`，与其他 Azure AI Foundry 模型使用的环境变量相同。`AZURE_API_BASE` 只有下文介绍的原生 `/v1/messages` 路由会读取，因此只设置它的话，调用 `completion()` 会报错 `Azure Anthropic requests require an api_base`。

```python
import os

# Option 1: API Key authentication
os.environ["AZURE_AI_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_AI_API_BASE"] = "https://<resource-name>.services.ai.azure.com/anthropic"

# Option 2: Azure AD Token authentication
os.environ["AZURE_AD_TOKEN"] = "your-azure-ad-token"
os.environ["AZURE_AI_API_BASE"] = "https://<resource-name>.services.ai.azure.com/anthropic"

# Optional: Azure AD Token Provider (for automatic token refresh)
os.environ["AZURE_TENANT_ID"] = "your-tenant-id"
os.environ["AZURE_CLIENT_ID"] = "your-client-id"
os.environ["AZURE_CLIENT_SECRET"] = "your-client-secret"
os.environ["AZURE_SCOPE"] = "https://cognitiveservices.azure.com/.default"
```

## 用法 - LiteLLM Python SDK

### 基础补全

```python
from litellm import completion

# Set environment variables
os.environ["AZURE_AI_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_AI_API_BASE"] = "https://<resource-name>.services.ai.azure.com/anthropic"

# Make a completion request
response = completion(
    model="azure_ai/{{anthropic}}",
    messages=[
        {"role": "user", "content": "What are 3 things to visit in Seattle?"}
    ],
    max_tokens=1000,
    temperature=0.7,
)

print(response)
```

### 使用 API 密钥参数进行补全

```python
import litellm

response = litellm.completion(
    model="azure_ai/{{anthropic}}",
    api_base="https://<resource-name>.services.ai.azure.com/anthropic",
    api_key="your-azure-api-key",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    max_tokens=1000,
)
```

### 使用 Azure AD Token 进行补全

```python
import litellm

response = litellm.completion(
    model="azure_ai/{{anthropic}}",
    api_base="https://<resource-name>.services.ai.azure.com/anthropic",
    azure_ad_token="your-azure-ad-token",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    max_tokens=1000,
)
```

### 流式传输

```python
from litellm import completion

response = completion(
    model="azure_ai/{{anthropic}}",
    messages=[
        {"role": "user", "content": "Write a short story"}
    ],
    stream=True,
    max_tokens=1000,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### 工具调用

```python
from litellm import completion

response = completion(
    model="azure_ai/{{anthropic}}",
    messages=[
        {"role": "user", "content": "What's the weather in Seattle?"}
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ],
    tool_choice="auto",
    max_tokens=1000,
)

print(response)
```

## 用法 - LiteLLM 代理服务器

### 1. 将密钥保存到环境变量

```bash
export AZURE_AI_API_KEY="your-azure-api-key"
export AZURE_AI_API_BASE="https://<resource-name>.services.ai.azure.com/anthropic"
```

### 2. 配置代理

```yaml
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: azure_ai/{{anthropic}}
      api_base: os.environ/AZURE_AI_API_BASE
      api_key: os.environ/AZURE_AI_API_KEY
```

### 3. 测试

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "{{anthropic}}",
    "messages": [
        {
            "role": "user",
            "content": "Hello!"
        }
    ],
    "max_tokens": 1000
}'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    max_tokens=1000
)

print(response)
```

</TabItem>
</Tabs>

## Messages API

Azure Anthropic 也支持原生 Anthropic Messages API。端点结构与 Anthropic 的 `/v1/messages` API 相同。

### 使用 Anthropic SDK

```python
from anthropic import Anthropic

client = Anthropic(
    api_key="your-azure-api-key",
    base_url="https://<resource-name>.services.ai.azure.com/anthropic"
)

response = client.messages.create(
    model="{{anthropic}}",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "Hello, world"}
    ]
)

print(response)
```

### 使用 LiteLLM 代理

```bash
curl --request POST \
  --url http://0.0.0.0:4000/anthropic/v1/messages \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
    "model": "{{anthropic}}",
    "max_tokens": 1024,
    "messages": [
        {"role": "user", "content": "Hello, world"}
    ]
}'
```

## 支持的 OpenAI 参数

Azure Anthropic 支持与主 Anthropic 提供商相同的参数：

```
"stream",
"stop",
"temperature",
"top_p",
"max_tokens",
"max_completion_tokens",
"tools",
"tool_choice",
"extra_headers",
"parallel_tool_calls",
"response_format",
"user",
"thinking",
"reasoning_effort"
```

:::info

Azure Anthropic API 要求必须传入 `max_tokens`。如果未提供 `max_tokens`，LiteLLM 会自动传入 `max_tokens=4096`。

:::

## 与标准 Anthropic 提供商的差异

Azure Anthropic 与标准 Anthropic 提供商唯一的区别在于身份验证方式：

- **标准 Anthropic**：使用 `x-api-key` 请求头
- **Azure Anthropic**：使用 `api-key` 请求头，或通过 `Authorization: Bearer <token>` 进行 Azure AD 身份验证

其余的请求/响应转换、工具调用、流式传输以及功能支持完全一致。

## API Base URL 格式

API 基础 URL 应遵循以下格式：

```
https://<resource-name>.services.ai.azure.com/anthropic
```

如果 URL 中尚未包含 `/v1/messages`，LiteLLM 会自动补上。

## 示例：完整配置

```python
import os
from litellm import completion

# Configure Azure Anthropic
os.environ["AZURE_AI_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_AI_API_BASE"] = "https://my-resource.services.ai.azure.com/anthropic"

# Make a request
response = completion(
    model="azure_ai/{{anthropic}}",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    max_tokens=1000,
    temperature=0.7,
    stream=False,
)

print(response.choices[0].message.content)
```

## 故障排查

### 缺少 API Base 错误

如果看到 `Azure Anthropic requests require an api_base`，请确认设置的是 `AZURE_AI_API_BASE`（而不是 `AZURE_API_BASE`，后者只有 `/v1/messages` 路由会读取）：

```python
os.environ["AZURE_AI_API_BASE"] = "https://<resource-name>.services.ai.azure.com/anthropic"
```

也可以直接传入：

```python
response = completion(
    model="azure_ai/{{anthropic}}",
    api_base="https://<resource-name>.services.ai.azure.com/anthropic",
    # ...
)
```

### 身份验证错误

- **API 密钥**：确认已设置 `AZURE_AI_API_KEY`，或已通过 `api_key` 参数传入
- **Azure AD Token**：确认已设置 `AZURE_AD_TOKEN`，或已通过 `azure_ad_token` 参数传入
- **Token Provider**：如需自动刷新令牌，请配置 `AZURE_TENANT_ID`、`AZURE_CLIENT_ID` 和 `AZURE_CLIENT_SECRET`

## 相关文档

- [Anthropic Provider 文档](../anthropic.md) - 标准 Anthropic API 的用法
- [Azure OpenAI 文档](./azure.md) - Azure OpenAI 模型相关内容
- [Azure 身份验证指南](../../secret_managers/azure_key_vault.md) - Azure AD 令牌的配置方法
