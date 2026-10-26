import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock - Writer Palmyra

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Amazon Bedrock 上的 Writer Palmyra X5 与 X4 基础模型，具备高级推理、工具调用（tool calling）与文档处理能力 |
| LiteLLM 提供商路由 | `bedrock/` |
| 支持的操作 | `/chat/completions` |
| 提供商文档链接 | [AWS Bedrock 上的 Writer ↗](https://aws.amazon.com/bedrock/writer/) |

## 快速上手

### LiteLLM SDK

```python showLineNumbers title="SDK 用法"
import litellm
import os

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-west-2"

response = litellm.completion(
    model="bedrock/us.writer.palmyra-x5-v1:0",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)

print(response.choices[0].message.content)
```

### LiteLLM 代理

**1. 配置 config.yaml**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: writer-palmyra-x5
    litellm_params:
      model: bedrock/us.writer.palmyra-x5-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

**2. 启动代理**

```bash showLineNumbers title="启动代理"
litellm --config config.yaml
```

**3. 调用代理**

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="curl 请求"
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "writer-palmyra-x5",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000/v1"
)

response = client.chat.completions.create(
    model="writer-palmyra-x5",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## 工具调用

Writer Palmyra 模型支持多步工具调用，适用于复杂工作流。

### LiteLLM SDK

```python showLineNumbers title="工具调用 - SDK"
import litellm

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a location",
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
    }
]

response = litellm.completion(
    model="bedrock/us.writer.palmyra-x5-v1:0",
    messages=[{"role": "user", "content": "What's the weather in Boston?"}],
    tools=tools
)
```

### LiteLLM 代理

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="工具调用 - curl"
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "writer-palmyra-x5",
    "messages": [{"role": "user", "content": "What'\''s the weather in Boston?"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather in a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {"type": "string", "description": "The city and state"}
          },
          "required": ["location"]
        }
      }
    }]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="工具调用 - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000/v1"
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a location",
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
    }
]

response = client.chat.completions.create(
    model="writer-palmyra-x5",
    messages=[{"role": "user", "content": "What's the weather in Boston?"}],
    tools=tools
)
```

</TabItem>
</Tabs>

## 文档输入

Writer Palmyra 模型支持包括 PDF 在内的文档输入。

### LiteLLM SDK

```python showLineNumbers title="PDF 文档输入 - SDK"
import litellm
import base64

# Read and encode PDF
with open("document.pdf", "rb") as f:
    pdf_base64 = base64.b64encode(f.read()).decode("utf-8")

response = litellm.completion(
    model="bedrock/us.writer.palmyra-x5-v1:0",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:application/pdf;base64,{pdf_base64}"
                    }
                },
                {
                    "type": "text",
                    "text": "Summarize this document"
                }
            ]
        }
    ]
)
```

### LiteLLM 代理

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="PDF 文档输入 - curl"
# First, base64 encode your PDF
PDF_BASE64=$(base64 -i document.pdf)

curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "writer-palmyra-x5",
    "messages": [{
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {"url": "data:application/pdf;base64,'$PDF_BASE64'"}
        },
        {
          "type": "text",
          "text": "Summarize this document"
        }
      ]
    }]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="PDF 文档输入 - OpenAI SDK"
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000/v1"
)

# Read and encode PDF
with open("document.pdf", "rb") as f:
    pdf_base64 = base64.b64encode(f.read()).decode("utf-8")

response = client.chat.completions.create(
    model="writer-palmyra-x5",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:application/pdf;base64,{pdf_base64}"
                    }
                },
                {
                    "type": "text",
                    "text": "Summarize this document"
                }
            ]
        }
    ]
)
```

</TabItem>
</Tabs>

## 支持的模型

| 模型 ID | 上下文窗口 | 输入成本（每 1K Token） | 输出成本（每 1K Token） |
|----------|---------------|---------------------------|----------------------------|
| `bedrock/us.writer.palmyra-x5-v1:0` | 1M Token | $0.0006 | $0.006 |
| `bedrock/us.writer.palmyra-x4-v1:0` | 128K Token | $0.0025 | $0.010 |
| `bedrock/writer.palmyra-x5-v1:0` | 1M Token | $0.0006 | $0.006 |
| `bedrock/writer.palmyra-x4-v1:0` | 128K Token | $0.0025 | $0.010 |

:::info[跨区域推理]
`us.writer.*` 模型 ID 使用跨区域推理配置文件（cross-region inference profiles），生产环境的工作负载建议选用这类模型 ID。
:::
