import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /responses


LiteLLM 提供了一个符合 [OpenAI 的 `/responses` API](https://platform.openai.com/docs/api-reference/responses) 规范的端点。

当提供商不支持 /chat/completions 端点时，发往该端点的请求可能会被自动桥接到这里。桥接的具体方式由模型的默认 `mode` 决定（参见 `model_prices_and_context_window`）。

| 功能 | 支持情况 | 说明 |
|---------|-----------|--------|
| 成本追踪 | ✅ | 适用于所有受支持的模型 |
| 日志 | ✅ | 适用于所有集成 |
| 终端用户追踪 | ✅ | |
| 流式 | ✅ | |
| WebSocket 模式 | ✅ | 面向所有提供商的低延迟持久连接 |
| 图像生成流式输出 | ✅ | 渐进式生成图像，可产出部分图像（1-3 张） |
| 回退机制 | ✅ | 可在受支持的模型之间生效 |
| 负载均衡 | ✅ | 可在受支持的模型之间生效 |
| 防护栏 | ✅ | 作用于输入与输出文本（仅限非流式） |
| 支持的操作 | 创建响应、获取响应、删除响应 | |
| 支持的 LiteLLM 版本 | 1.63.8+ | |
| 支持的 LLM 提供商 | **所有 LiteLLM 支持的提供商** | `openai`、`anthropic`、`bedrock`、`vertex_ai`、`gemini`、`azure`、`azure_ai` 等 |

## 用法

### LiteLLM Python SDK

<Tabs>
<TabItem value="openai" label="OpenAI">

#### 非流式
```python showLineNumbers title="OpenAI Non-streaming Response"
import litellm

# Non-streaming response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 响应格式（OpenAI Responses API 格式）

```json
{
    "id": "resp_abc123",
    "object": "response",
    "created_at": 1734366691,
    "status": "completed",
    "model": "{{openai_large}}",
    "output": [
        {
            "type": "message",
            "id": "msg_abc123",
            "status": "completed",
            "role": "assistant",
            "content": [
                {
                    "type": "output_text",
                    "text": "Once upon a time, a little unicorn named Stardust lived in a magical meadow where flowers sang lullabies. One night, she discovered that her horn could paint dreams across the sky, and she spent the evening creating the most beautiful aurora for all the forest creatures to enjoy. As the animals drifted off to sleep beneath her shimmering lights, Stardust curled up on a cloud of moonbeams, happy to have shared her magic with her friends.",
                    "annotations": []
                }
            ]
        }
    ],
    "usage": {
        "input_tokens": 18,
        "output_tokens": 98,
        "total_tokens": 116
    }
}
```

#### 流式
```python showLineNumbers title="OpenAI Streaming Response"
import litellm

# Streaming response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

#### 流式图像生成
```python showLineNumbers title="OpenAI Streaming Image Generation"
import litellm
import base64

# Streaming image generation with partial images
stream = litellm.responses(
    model="{{openai_large}}",  # Use an actual image generation model
    input="Generate a gorgeous image of a river made of white owl feathers",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],

)

for event in stream:
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        image_base64 = event.partial_image_b64
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)
```

#### 图像生成（非流式）

支持图像生成的模型可以使用图像生成功能。生成的图像会以 `type: "image_generation_call"` 的形式出现在 `output` 数组中。

**Gemini**（Google AI Studio）：
```python showLineNumbers title="Gemini Image Generation"
import litellm
import base64

# Gemini image generation models don't require tools parameter
response = litellm.responses(
    model="gemini/gemini-2.5-flash-image",
    input="Generate a cute cat playing with yarn"
)

# Access generated images from output
for item in response.output:
    if item.type == "image_generation_call":
        # item.result contains pure base64 (no data: prefix)
        image_bytes = base64.b64decode(item.result)

        # Save the image
        with open(f"generated_{item.id}.png", "wb") as f:
            f.write(image_bytes)

print(f"Image saved: generated_{response.output[0].id}.png")
```

**OpenAI**：
```python showLineNumbers title="OpenAI Image Generation"
import litellm
import base64

# OpenAI models require tools parameter for image generation
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Generate a futuristic city at sunset",
    tools=[{"type": "image_generation"}]
)

# Access generated images from output
for item in response.output:
    if item.type == "image_generation_call":
        image_bytes = base64.b64decode(item.result)
        with open(f"generated_{item.id}.png", "wb") as f:
            f.write(image_bytes)
```

**响应格式**：

图像生成成功后，响应中会包含：

```json
{
  "id": "resp_abc123",
  "status": "completed",
  "output": [
    {
      "type": "image_generation_call",
      "id": "resp_abc123_img_0",
      "status": "completed",
      "result": "iVBORw0KGgo..."  // Pure base64 string (no data: prefix)
    }
  ]
}
```

**支持的模型**：

| 提供商 | 模型 | 是否需要 `tools` 参数 |
|----------|--------|---------------------------|
| Google AI Studio | `gemini/gemini-2.5-flash-image` | ❌ 否 |
| Vertex AI | `vertex_ai/gemini-2.5-flash-image-preview` | ❌ 否 |
| OpenAI | `gpt-4o`, `gpt-4o-mini`, `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `o3` | ✅ 是 |
| AWS Bedrock | Stability AI、Amazon Nova Canvas 等模型 | 因模型而异 |
| Fal AI | 多种图像生成模型 | 查看模型文档 |

**注意**：`result` 字段中保存的是纯 base64 编码的图像数据，不含 `data:image/png;base64,` 前缀。保存之前必须先用 `base64.b64decode()` 解码。

#### 获取响应
```python showLineNumbers title="Get Response by ID"
import litellm

# First, create a response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

# Get the response ID
response_id = response.id

# Retrieve the response by ID
retrieved_response = litellm.get_responses(
    response_id=response_id
)

print(retrieved_response)

# For async usage
# retrieved_response = await litellm.aget_responses(response_id=response_id)
```

#### 取消响应
你可以取消仍在进行中的响应（前提是提供商支持该操作）：

```python showLineNumbers title="Cancel Response by ID"
import litellm

# First, create a response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

# Get the response ID
response_id = response.id

# Cancel the response by ID
cancel_response = litellm.cancel_responses(
    response_id=response_id
)

print(cancel_response)

# For async usage
# cancel_response = await litellm.acancel_responses(response_id=response_id)
```


**REST API**：
```bash
curl -X POST http://localhost:4000/v1/responses/response_id/cancel \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

该调用会尝试取消指定 ID 的进行中响应。
**注意**：并非所有提供商都支持取消响应；若不支持，将会抛出错误。

#### 删除响应
```python showLineNumbers title="Delete Response by ID"
import litellm

# First, create a response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

# Get the response ID
response_id = response.id

# Delete the response by ID
delete_response = litellm.delete_responses(
    response_id=response_id
)

print(delete_response)

# For async usage
# delete_response = await litellm.adelete_responses(response_id=response_id)
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

#### 非流式
```python showLineNumbers title="Anthropic Non-streaming Response"
import litellm
import os

# Set API key
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-api-key"

# Non-streaming response
response = litellm.responses(
    model="anthropic/{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 流式
```python showLineNumbers title="Anthropic Streaming Response"
import litellm
import os

# Set API key
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-api-key"

# Streaming response
response = litellm.responses(
    model="anthropic/{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="vertex" label="Vertex AI">

#### 非流式
```python showLineNumbers title="Vertex AI Non-streaming Response"
import litellm
import os

# Set credentials - Vertex AI uses application default credentials
# Run 'gcloud auth application-default login' to authenticate
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# Non-streaming response
response = litellm.responses(
    model="vertex_ai/{{gemini_pro}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 流式
```python showLineNumbers title="Vertex AI Streaming Response"
import litellm
import os

# Set credentials - Vertex AI uses application default credentials
# Run 'gcloud auth application-default login' to authenticate
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# Streaming response
response = litellm.responses(
    model="vertex_ai/{{gemini_pro}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="bedrock" label="AWS Bedrock">

#### 非流式
```python showLineNumbers title="AWS Bedrock Non-streaming Response"
import litellm
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-access-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your AWS region

# Non-streaming response
response = litellm.responses(
    model="bedrock/us.anthropic.{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 流式
```python showLineNumbers title="AWS Bedrock Streaming Response"
import litellm
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-access-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your AWS region

# Streaming response
response = litellm.responses(
    model="bedrock/us.anthropic.{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="gemini" label="Google AI Studio">

#### 非流式
```python showLineNumbers title="Google AI Studio Non-streaming Response"
import litellm
import os

# Set API key for Google AI Studio
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

# Non-streaming response
response = litellm.responses(
    model="gemini/{{gemini_flash}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 流式
```python showLineNumbers title="Google AI Studio Streaming Response"
import litellm
import os

# Set API key for Google AI Studio
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

# Streaming response
response = litellm.responses(
    model="gemini/{{gemini_flash}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>
</Tabs>

### 通过 OpenAI SDK 使用 LiteLLM 代理

首先，配置并启动你的 LiteLLM 代理服务器。

```bash title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai" label="OpenAI">

首先，把下面这段配置加入 litellm 代理的 config.yaml：
```yaml showLineNumbers title="OpenAI Proxy Configuration"
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

#### 非流式
```python showLineNumbers title="OpenAI Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 流式
```python showLineNumbers title="OpenAI Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

#### 流式图像生成
```python showLineNumbers title="OpenAI Proxy Streaming Image Generation"
from openai import OpenAI
import base64

client = OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://localhost:4000")

stream = client.responses.create(
    model="{{openai_large}}",
    input="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],
)


for event in stream:
    print(f"event: {event}")
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        image_base64 = event.partial_image_b64
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)

```

#### 获取响应
```python showLineNumbers title="Get Response by ID with OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# First, create a response
response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

# Get the response ID
response_id = response.id

# Retrieve the response by ID
retrieved_response = client.responses.retrieve(response_id)

print(retrieved_response)
```

#### 删除响应
```python showLineNumbers title="Delete Response by ID with OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# First, create a response
response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

# Get the response ID
response_id = response.id

# Delete the response by ID
delete_response = client.responses.delete(response_id)

print(delete_response)
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

首先，把下面这段配置加入 litellm 代理的 config.yaml：
```yaml showLineNumbers title="Anthropic Proxy Configuration"
model_list:
  - model_name: anthropic/{{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```

#### 非流式
```python showLineNumbers title="Anthropic Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="anthropic/{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 流式
```python showLineNumbers title="Anthropic Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="anthropic/{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="vertex" label="Vertex AI">

首先，把下面这段配置加入 litellm 代理的 config.yaml：
```yaml showLineNumbers title="Vertex AI Proxy Configuration"
model_list:
  - model_name: vertex_ai/{{gemini_pro}}
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      vertex_project: your-gcp-project-id
      vertex_location: us-central1
```

#### 非流式
```python showLineNumbers title="Vertex AI Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="vertex_ai/{{gemini_pro}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 流式
```python showLineNumbers title="Vertex AI Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="vertex_ai/{{gemini_pro}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="bedrock" label="AWS Bedrock">

首先，把下面这段配置加入 litellm 代理的 config.yaml：
```yaml showLineNumbers title="AWS Bedrock Proxy Configuration"
model_list:
  - model_name: bedrock/us.anthropic.{{anthropic}}
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

#### 非流式
```python showLineNumbers title="AWS Bedrock Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="bedrock/us.anthropic.{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 流式
```python showLineNumbers title="AWS Bedrock Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="bedrock/us.anthropic.{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="gemini" label="Google AI Studio">

首先，把下面这段配置加入 litellm 代理的 config.yaml：
```yaml showLineNumbers title="Google AI Studio Proxy Configuration"
model_list:
  - model_name: gemini/{{gemini_flash}}
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
```

#### 非流式
```python showLineNumbers title="Google AI Studio Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="gemini/{{gemini_flash}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 流式
```python showLineNumbers title="Google AI Studio Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="gemini/{{gemini_flash}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>
</Tabs>

## WebSocket 模式

Responses API 支持 **WebSocket 模式**，提供低延迟的持久连接，非常适合智能体（agentic）工作流。该模式适用于 **所有 LiteLLM 提供商**，并不限于原生支持 WebSocket 的那几家。

### 架构

LiteLLM 提供两种 WebSocket 模式：

1. **原生 WebSocket**：对支持的提供商（OpenAI、Azure）直接建立 `wss://` 连接
2. **托管 WebSocket**：对其他所有提供商（Anthropic、Gemini、Bedrock 等）以 WebSocket 承载 HTTP 流式传输

系统会根据提供商的能力自动选择合适的模式。

### 用法

<Tabs>
<TabItem value="python" label="Python (websocket-client)">

```python showLineNumbers title="WebSocket with Python"
import json
from websocket import create_connection  # uv add websocket-client

# Connect to LiteLLM proxy WebSocket endpoint
ws = create_connection(
    "ws://localhost:4000/v1/responses?model={{gemini_flash}}",
    header=["Authorization: Bearer sk-<your-litellm-api-key>"]
)

try:
    # Send initial message
    ws.send(json.dumps({
        "type": "response.create",
        "model": "{{gemini_flash}}",
        "store": True,
        "input": [{
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": "My favorite color is blue."}]
        }]
    }))
    
    # Collect response events
    response_id = None
    while True:
        event = json.loads(ws.recv())
        print(f"Event: {event['type']}")
        
        if event["type"] == "response.completed":
            response_id = event["response"]["id"]
            break
        elif event["type"] == "response.output_text.delta":
            print(f"Text: {event.get('delta', '')}", end="", flush=True)
    
    print(f"\nResponse ID: {response_id}")
    
    # Send follow-up with previous_response_id for multi-turn
    ws.send(json.dumps({
        "type": "response.create",
        "model": "{{gemini_flash}}",
        "previous_response_id": response_id,
        "input": [{
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": "What is my favorite color?"}]
        }]
    }))
    
    # Collect follow-up response
    while True:
        event = json.loads(ws.recv())
        if event["type"] == "response.completed":
            break
        elif event["type"] == "response.output_text.delta":
            print(event.get("delta", ""), end="", flush=True)
            
finally:
    ws.close()
```

</TabItem>
<TabItem value="javascript" label="JavaScript (ws)">

```javascript showLineNumbers title="WebSocket with JavaScript"
const WebSocket = require('ws'); // npm install ws

const ws = new WebSocket(
    'ws://localhost:4000/v1/responses?model={{gemini_flash}}',
    {
        headers: {
            'Authorization': 'Bearer sk-<your-litellm-api-key>'
        }
    }
);

ws.on('open', () => {
    // Send initial message
    ws.send(JSON.stringify({
        type: 'response.create',
        model: '{{gemini_flash}}',
        store: true,
        input: [{
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: 'My favorite color is blue.' }]
        }]
    }));
});

let responseId = null;

ws.on('message', (data) => {
    const event = JSON.parse(data.toString());
    console.log(`Event: ${event.type}`);
    
    if (event.type === 'response.completed') {
        responseId = event.response.id;
        console.log(`Response ID: ${responseId}`);
        
        // Send follow-up
        ws.send(JSON.stringify({
            type: 'response.create',
            model: '{{gemini_flash}}',
            previous_response_id: responseId,
            input: [{
                type: 'message',
                role: 'user',
                content: [{ type: 'input_text', text: 'What is my favorite color?' }]
            }]
        }));
    } else if (event.type === 'response.output_text.delta') {
        process.stdout.write(event.delta || '');
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
```

</TabItem>
<TabItem value="curl" label="curl (websocat)">

```bash showLineNumbers title="WebSocket with websocat"
# Install websocat: brew install websocat (macOS) or cargo install websocat

# Connect to WebSocket endpoint
websocat "ws://localhost:4000/v1/responses?model={{gemini_flash}}" \
  -H="Authorization: Bearer $LITELLM_API_KEY"

# Then send JSON events (paste and press Enter):
{"type":"response.create","model":"{{gemini_flash}}","input":[{"type":"message","role":"user","content":[{"type":"input_text","text":"Hello!"}]}]}

# You'll receive streaming events back:
# {"type":"response.created",...}
# {"type":"response.in_progress",...}
# {"type":"response.output_text.delta","delta":"Hello",...}
# {"type":"response.completed",...}
```

</TabItem>
</Tabs>
### 事件类型

WebSocket 连接接收以 JSON 格式封装的服务器发送事件（Server-Sent Events，SSE）：

| 事件类型 | 说明 |
|------------|-------------|
| `response.created` | 响应生成开始 |
| `response.in_progress` | 响应正在生成中 |
| `response.output_item.added` | 新增了输出项（消息、工具调用等） |
| `response.output_text.delta` | 增量文本块 |
| `response.output_text.done` | 文本输出完成 |
| `response.content_part.done` | 内容部分完成 |
| `response.output_item.done` | 输出项完成 |
| `response.completed` | 完整响应已成功生成 |
| `response.failed` | 响应生成失败 |
| `response.incomplete` | 响应不完整（例如达到最大 token 数） |
| `error` | 发生错误 |

### 多轮对话

使用 `previous_response_id` 在多条 WebSocket 消息之间保持对话上下文：

```python showLineNumbers title="Multi-turn WebSocket Conversation"
# Turn 1
ws.send(json.dumps({
    "type": "response.create",
    "model": "{{gemini_flash}}",
    "store": True,  # Required for multi-turn
    "input": [{"type": "message", "role": "user", "content": [{"type": "input_text", "text": "Hello"}]}]
}))

# ... collect events and get response_id from response.completed event ...

# Turn 2 - reference previous response
ws.send(json.dumps({
    "type": "response.create",
    "model": "{{gemini_flash}}",
    "previous_response_id": response_id,  # Links to previous turn
    "input": [{"type": "message", "role": "user", "content": [{"type": "input_text", "text": "Continue"}]}]
}))
```

### 提供商支持

| 提供商 | WebSocket 模式 | 说明 |
|----------|----------------|-------|
| OpenAI | 原生 | 与 OpenAI 建立 `wss://` 直连 |
| Azure OpenAI | 原生 | 与 Azure 建立 `wss://` 直连 |
| Anthropic | 托管 | 经由 WebSocket 的 HTTP 流式传输 |
| Google AI Studio (Gemini) | 托管 | 经由 WebSocket 的 HTTP 流式传输 |
| Vertex AI | 托管 | 经由 WebSocket 的 HTTP 流式传输 |
| AWS Bedrock | 托管 | 经由 WebSocket 的 HTTP 流式传输 |
| 所有其他提供商 | 托管 | 经由 WebSocket 的 HTTP 流式传输 |

**注意**：原生与托管两种模式提供相同的事件流格式，差异对客户端完全透明。

### 配置

无需任何特殊配置。通过 WebSocket 协议（`ws://` 或 `wss://`）访问 `/v1/responses` 端点时，WebSocket 模式自动可用。

对于 LiteLLM 代理，确保模型已按常规方式配置：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
  
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

两个模型都会自动在 `ws://localhost:4000/v1/responses` 上支持 WebSocket 模式。

### 会话时长上限

`/v1/responses` 上的 WebSocket 会话默认最长持续 60 分钟，与 OpenAI 自身的 WebSocket 连接时限一致。时限从代理接受连接的时刻开始计算，因此像 Codex 这样提前开好连接的客户端可以让连接先闲置，稍后再发送第一条 `response.create`。时限一到，无论响应是否正在进行，代理都会以关闭代码 `1000`、原因 `Session duration limit reached` 关闭套接字，客户端应当重新连接。

要修改该上限，在 `general_settings` 下设置 `responses_websocket_session_limit_seconds`。可取 60 到 7200 秒之间的值；其他任何取值都会记一条警告，代理按 3600 处理。

```yaml showLineNumbers title="config.yaml"
general_settings:
  responses_websocket_session_limit_seconds: 1800  # 30 minutes
```

## Response ID 安全

默认情况下，LiteLLM 代理会阻止用户访问其他用户的 Response ID。

做法是把 Response ID 与用户 ID 一起加密，使用户只能访问自己的 Response ID。

尝试访问他人的 Response ID 会返回 403：

```json
{
  "error": {
    "message": "Forbidden. The response id is not associated with the user, who this key belongs to.",
    "code": 403
  }
}
```

要禁用该机制，设置 `disable_responses_id_security: true`：

```yaml
general_settings:
  disable_responses_id_security: true
```

这会允许任何用户访问任何 Response ID。

### 本代理未签发的 Response ID

只有当 Response 的 ID 由代理自己签发时，代理才能判断它属于谁。其他形状的 ID，无论是提供商的原始 ID，还是在 Response ID 加密开启之前发出的 ID，都不带归属信息，因此代理会在 retrieve、cancel、delete、input items 以及 `previous_response_id` 上以 403 拒绝：

```json
{
  "error": {
    "message": "Forbidden. This response id was not issued by this proxy, so the proxy cannot tell who owns it.",
    "code": 403
  }
}
```

有意直接透传提供商 Response ID 的部署，或仍有客户端持有旧 ID 的部署，可以用 `allow_unmanaged_response_ids` 关闭这条拒绝逻辑：

```yaml
general_settings:
  allow_unmanaged_response_ids: true
```

无论哪种设置，代理自己签发的 ID 仍会做归属校验，而代理管理员密钥不受这两项校验限制。`disable_responses_id_security: true` 会关闭整个特性，包括这条拒绝逻辑。

## 后台模式

LiteLLM 会把 OpenAI 的 `background: true` 参数透传给提供商。提供商会立即返回一个处于 `queued` 或 `in_progress` 状态的响应，结果稍后用 `GET /v1/responses/{response_id}` 获取：

```bash showLineNumbers title="Create a background response"
curl http://localhost:4000/v1/responses \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.6",
    "input": "Write a detailed comparison of the Responses API and the Chat Completions API",
    "background": true
  }'
```

```bash showLineNumbers title="Poll for the result"
curl http://localhost:4000/v1/responses/{response_id} \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

### 后台响应的成本追踪

创建调用在模型产出任何 token 之前就已返回，所以请求时没有用量可记录。为了补上这个空档，代理会保存每个排队中的后台响应，并用一个后台轮询任务为其计价，[托管批处理成本轮询器](./proxy/managed_batches#可观测性)给已完成批处理计价用的正是同一套机制。它需要 Postgres 数据库，并随企业版软件包提供。

每隔 `proxy_batch_polling_interval` 秒（`general_settings` 下的一个键，也可用环境变量 `PROXY_BATCH_POLLING_INTERVAL` 设置；默认 `3600`，外加最多 30 秒的抖动），该任务会从数据库读取待处理的后台响应，按最旧优先、每轮最多 `MAX_OBJECTS_PER_POLL_CYCLE`（默认 `50`）条的方式，用你配置中的部署凭据逐个向提供商查询。一旦响应到达终态（`completed`、`failed`、`cancelled` 或 `incomplete`），这次查询就会写入一条带最终用量的花费日志，归属于创建该响应的用户，该行随后不再被轮询。你自己发起的 `GET /v1/responses/{response_id}` 读取永远不会计费；只有轮询任务的查询会为响应计价。

过了 `MANAGED_OBJECT_STALENESS_CUTOFF_DAYS`（默认 `7`）天仍处于待处理状态的响应会被标记为过期并停止轮询。测试时可以把轮询间隔设小一些，比如 `30`；要彻底停用该任务和批处理成本轮询器，设置 `PROXY_BATCH_POLLING_ENABLED=false`。

## 支持的 Responses API 参数

| 提供商 | 支持的参数 |
|----------|---------------------|
| `openai` | [支持全部 Responses API 参数](https://github.com/BerriAI/litellm/blob/7c3df984da8e4dff9201e4c5353fdc7a2b441831/litellm/llms/openai/responses/transformation.py#L23) |
| `azure` | [支持全部 Responses API 参数](https://github.com/BerriAI/litellm/blob/7c3df984da8e4dff9201e4c5353fdc7a2b441831/litellm/llms/openai/responses/transformation.py#L23) |
| `azure_ai`（`.services.ai.azure.com` 与 `.openai.azure.com` 主机） | [支持全部 Responses API 参数](https://github.com/BerriAI/litellm/blob/913ef6ed49250f28680a1a50850183b5d80f6bbb/litellm/llms/azure_ai/responses/transformation.py#L25) |
| `azure_ai`（其他主机） | [见此处支持的参数](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| `anthropic` | [见此处支持的参数](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| `bedrock` | [见此处支持的参数](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| `gemini` | [见此处支持的参数](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| `vertex_ai` | [见此处支持的参数](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| 所有其他 llm api 提供商 | [见此处支持的参数](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |

## 会话连续性负载均衡

在多份相同模型的部署之间使用 Responses API 时（例如多个 Azure OpenAI 端点），LiteLLM 提供会话连续性：携带 `previous_response_id` 的后续请求会被路由到生成原始响应的同一份部署。


#### 使用示例

<Tabs>
<TabItem value="python-sdk" label="Python SDK">

```python showLineNumbers title="Python SDK with Session Continuity"
import litellm

# Set up router with multiple deployments of the same model
router = litellm.Router(
    model_list=[
        {
            "model_name": "azure-gpt4-turbo",
            "litellm_params": {
                "model": "azure/{{openai_large}}",
                "api_key": "your-api-key-1",
                "api_version": "2024-06-01",
                "api_base": "https://endpoint1.openai.azure.com",
            },
        },
        {
            "model_name": "azure-gpt4-turbo",
            "litellm_params": {
                "model": "azure/{{openai_large}}",
                "api_key": "your-api-key-2",
                "api_version": "2024-06-01",
                "api_base": "https://endpoint2.openai.azure.com",
            },
        },
    ],
    # `responses_api_deployment_check` ensures Requests with `previous_response_id`
    # are routed to the same deployment. `deployment_affinity` adds sticky sessions
    # for requests without `previous_response_id` (useful for implicit caching).
    # `session_affinity` adds sticky sessions based on `session_id` metadata.
    optional_pre_call_checks=["responses_api_deployment_check", "deployment_affinity", "session_affinity"],
    # Optional (default is 3600 seconds / 1 hour)
    deployment_affinity_ttl_seconds=3600,
)

# Initial request
response = await router.aresponses(
    model="azure-gpt4-turbo",
    input="Hello, who are you?",
    truncation="auto",
)

# Store the response ID
response_id = response.id

# Follow-up request - will be automatically routed to the same deployment
follow_up = await router.aresponses(
    model="azure-gpt4-turbo",
    input="Tell me more about yourself",
    truncation="auto",
    previous_response_id=response_id  # This ensures routing to the same deployment
)
```

</TabItem>
<TabItem value="proxy-server" label="代理服务器">

#### 1. 在代理 config.yaml 中启用会话连续性

要在 LiteLLM 代理中为 Responses API 启用会话连续性，请在代理的 config.yaml 中设置 `optional_pre_call_checks`。

- `responses_api_deployment_check`：提供 `previous_response_id` 时的高优先级路由
- `encrypted_content_affinity`：**[推荐]** 针对加密项（例如 `rs_...` 推理项）的内容感知路由（**要求 LiteLLM >= 1.82.3**）
- `session_affinity`：基于 session id 的粘性会话（优先级高于 `deployment_affinity`）
- `deployment_affinity`：基于用户密钥的粘性会话（没有 `previous_response_id` 也生效）

:::tip[推荐：使用 `encrypted_content_affinity`]
在跨**不同 API 密钥**的部署之间对 Responses API 负载均衡时，请用 `encrypted_content_affinity` 替代 `deployment_affinity`。它只固定包含加密内容的请求，既能避免配额缩水，又能防止 `invalid_encrypted_content` 错误。（要求 LiteLLM >= 1.82.3。）
:::

注意事项：
- 用户密钥亲和以 `metadata.user_api_key_hash`（API 密钥的哈希）为键。OpenAI 的 `user` 请求参数是终端用户标识，特意不用于部署亲和。
- Session-ID 亲和以 `metadata.session_id` 为键。代理请求可通过 `x-litellm-session-id` 或 `x-litellm-trace-id` HTTP 头传入（对调用链而言二者可互换）；Python SDK 请求可在请求参数里传 `litellm_metadata={"session_id": "value"}`。
- `user_api_key_hash` 已是 SHA-256，按原样使用（不会二次哈希）。
- 亲和以稳定的模型标识为作用域（模型映射键，如 `model_map_information.model_map_key`），因此模型别名会落到同一个粘性桶。
- 映射 TTL 由 `deployment_affinity_ttl_seconds` 控制（在 Router 初始化 / 代理启动时配置）。

```yaml showLineNumbers title="config.yaml with Session Continuity"
model_list:
  - model_name: azure-gpt4-turbo
    litellm_params:
      model: azure/{{openai_large}}
      api_key: your-api-key-1
      api_version: 2024-06-01
      api_base: https://endpoint1.openai.azure.com
  - model_name: azure-gpt4-turbo
    litellm_params:
      model: azure/{{openai_large}}
      api_key: your-api-key-2
      api_version: 2024-06-01
      api_base: https://endpoint2.openai.azure.com

router_settings:
  optional_pre_call_checks:
    - responses_api_deployment_check
    - session_affinity
    - deployment_affinity
  # Optional (default is 3600 seconds / 1 hour)
  deployment_affinity_ttl_seconds: 3600
```

#### 2. 使用 OpenAI Python SDK 向 LiteLLM 代理发起请求

```python showLineNumbers title="OpenAI Client with Proxy Server"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-api-key"
)

# Initial request
response = client.responses.create(
    model="azure-gpt4-turbo",
    input="Hello, who are you?"
)

response_id = response.id

# Follow-up request - will be automatically routed to the same deployment
follow_up = client.responses.create(
    model="azure-gpt4-turbo",
    input="Tell me more about yourself",
    previous_response_id=response_id  # This ensures routing to the same deployment
)
```

</TabItem>
</Tabs>

## 加密内容亲和性（多区域负载均衡）

在跨**不同 API 密钥**的部署之间负载均衡 Responses API 时（例如不同的 Azure 区域或 OpenAI 组织），加密内容项（如 `rs_...` 推理项）只能由创建它的那把 API 密钥解密。

### 问题所在

```json
{
  "error": {
    "message": "The encrypted content for item rs_0d09d6e56879e76500699d6feee41c8197bd268aae76141f87 could not be verified. Reason: Encrypted content organization_id did not match the target organization.",
    "type": "invalid_request_error",
    "code": "invalid_encrypted_content"
  }
}
```

该错误发生在以下情形：
1. 初始请求发到部署 A（API 密钥 1）→ 产出加密项 `rs_xyz`
2. 输入中携带 `rs_xyz` 的后续请求被负载均衡到部署 B（API 密钥 2）
3. 部署 B 无法解密部署 A 创建的内容 → **请求失败**

### 解决方案：`encrypted_content_affinity`

`encrypted_content_affinity` 预检会把包含加密项的后续请求路由回源部署，而且**只在必要时**才这么做。

**主要优势**：
- ✅ **配额不缩水**：与 `deployment_affinity` 不同，只固定包含加密项的请求
- ✅ **绕过速率限制**：当加密内容要求特定部署时，RPM/TPM 限制会被绕过（无论如何该请求在其他部署上都会失败）
- ✅ **无需 `previous_response_id`**：通过把 `model_id` 直接编码进项 ID 实现
- ✅ **无需缓存**：`model_id` 即时解码，不依赖 Redis，也没有需要管理的 TTL
- ✅ **全局安全**：可对所有模型启用；非 Responses API 调用（chat、embeddings）不受影响

### 工作原理

1. **编码阶段**（响应返回时）：
   - 对每个包含 `encrypted_content` 的输出项，LiteLLM 会重写项 ID，把源 `model_id` 编码进去：`rs_xyz` → `encitem_{base64("litellm:model_id:{model_id};item_id:rs_xyz")}`
   - 请求转发给上游提供商之前，会先还原原始项 ID

2. **路由阶段**（请求发出前）：
   - 扫描请求 `input` 中带 `encitem_` 前缀的 ID
   - 若找到 → 解码 `model_id`，固定到源部署，绕过速率限制
   - 若没有编码项 → 正常负载均衡

### 源部署无法承接该轮请求时

只有当源部署仍位于所路由模型组的健康池中时，固定才会生效。若源部署已不在池中（因出错进入冷却、被从配置移除，或该后续请求被路由到了别的模型组，例如 auto-router 切换档位，或客户端在各轮之间更换 `model`），LiteLLM 会先寻找同位部署，即解析出的 `api_base` 与 `api_key` 跟源部署完全一致的部署，并固定到它上面。不同区域或不同密钥的部署永远不会被视作同位，无论提供商本身是否接受，因此多区域模型组不存在同位。已被移出配置的源部署，或匹配不到任何部署的 ID，已经没有可匹配的凭据，会直接跳过同位搜索。

没有同位时，该轮请求会以降级形式被服务，而不是直接失败。在 Responses API 上，每个推理项保留其摘要文本，只丢失加密负载和 ID（没有任何可读文本的项会被整体丢弃）；在 `/v1/messages` 后续请求上，thinking 块会被整体丢弃。对话的其余部分不受影响，请求通过正常路由策略发往健康部署，模型在该轮重新推理。它返回的推理项会带上服务该轮的部署的 ID，因此后续各轮会固定到该部署。每次降级都会记录一条 router 警告，如果你在意跨轮推理连续性，请留意它：

```
EncryptedContentAffinityCheck: model_id=<id> cannot serve group <model> and no deployment on the same encryption boundary is configured; forwarding without its encrypted reasoning
```

这种轮次只有同位部署才能保住推理。在 auto-router 上，`complexity_router_config.session_affinity: true` 会把携带 `session_id` 的会话留在产出这些项的档位上（参见[自动路由](./proxy/auto_routing.md)），因此该轮通常会留在源部署，不过升级与路由插件仍可能把它挪走。v1.103.x 及更早的版本在源部署冷却且无同位时会以 429 或 503 拒绝该轮而不是服务它；v1.102.0 之前的版本对被移除的源部署或模型组变更也同样以失败处理。

同样的剥离会在每一次回退跳步上运行，无论是否开启该检查：跳向下一个 `order` 的[基于顺序的跳步](./proxy/load_balancing.md#基于-order-的回退如何工作)、配置了 [`fallbacks`](./proxy/reliability.md) 后跳向另一个模型组的跳步，以及对完成前中断的 Responses 流的重试。跳步会丢弃其目标无法解密的推理项、保留其摘要，因此从 OpenAI 跳到 Bedrock，或同一提供商两个密钥之间的互跳，都能答完这一轮而不是以 `invalid_encrypted_content` 失败。这个行为没有按部署的开关。不开启该检查时，各项不带源标记，跳步会把每一项都归属到刚失败的那份部署：跳向 `api_base` 与 `api_key` 相同的部署会保留它们，其余任何跳步都会丢弃，连跳步目标自己在更早轮次产出的项也不例外；而且跳步后的那一轮会先把跳步目标的推理重放给 `order: 1`，在该部署上失败之后请求才再次跳步。这样的跳步只记录一行 `Falling back to model_group` 日志。

对于一个由同一提供商的两份部署组成的带序模型组，请开启该检查。它的标记会写明每个项由哪份部署产出，因此跳步后的那一轮会直接保留应答部署的推理，前面不会先有一次失败调用；跳步本身也会记录上面那条警告；而当 `order: 1` 处于冷却、请求被直接派给 `order: 2` 时（没有跳步，也就没有跳步剥离），无法解密的内容会通过固定逻辑被丢弃而不是让请求失败。v1.105.x 及更早的版本会在跳步时重放失败部署的推理，于是目标返回 400（OpenAI 上是 `invalid_encrypted_content`，Bedrock 上是 `invalid encrypted reasoning`）；开启该检查后，基于顺序的跳步改为返回 429 `No deployments available`。

该检查可以在代理运行期间通过 `POST /config/update` 开启或关闭，参见[在运行时更改亲和设置](./routing.md#配置项)。

### 配置

<Tabs>
<TabItem value="sdk" label="Python SDK">

```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "{{openai_large}}",
            "litellm_params": {
                "model": "openai/{{openai_large}}",
                "api_key": "org-1-api-key",  # Different API key
            },
            "model_info": {"id": "deployment-us-east"},
        },
        {
            "model_name": "{{openai_large}}",
            "litellm_params": {
                "model": "openai/{{openai_large}}",
                "api_key": "org-2-api-key",  # Different API key
            },
            "model_info": {"id": "deployment-eu-west"},
        },
    ],
    optional_pre_call_checks=["encrypted_content_affinity"],
)

# Initial request - routes to any deployment
response1 = await router.aresponses(
    model="{{openai_large}}",
    input="Explain quantum computing",
)

# Follow-up with encrypted items - automatically routes to same deployment
response2 = await router.aresponses(
    model="{{openai_large}}",
    input=response1.output,  # Contains encrypted items from response1
)
```

</TabItem>
<TabItem value="proxy" label="代理服务器">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      api_base: https://eastus.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY_EASTUS
      rpm: 600
      tpm: 100000
    model_info:
      id: "gpt-5.6-terra-eastus"

  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      api_base: https://westeurope.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY_WESTEUROPE
      rpm: 600
      tpm: 100000
    model_info:
      id: "gpt-5.6-terra-westeurope"

router_settings:
  routing_strategy: usage-based-routing-v2
  enable_pre_call_checks: true
  optional_pre_call_checks:
    - encrypted_content_affinity
```

**启动代理**：
```bash
litellm --config config.yaml
```

</TabItem>
</Tabs>

### 各亲和性类型的适用场景

| 亲和类型 | 适用场景 | 作用范围 | 配额影响 |
|---------------|----------|-------|--------------|
| **`encrypted_content_affinity`** | **[推荐]** 使用不同 API 密钥的多区域 Responses API | 仅包含被追踪加密项的请求 | ✅ 无（精准固定） |
| `responses_api_deployment_check` | `previous_response_id` 可用时 | 携带 `previous_response_id` 的请求 | ✅ 无 |
| `session_affinity` | 基于会话的应用 | 携带相同 `session_id` 的所有请求 | ⚠️ 按会话数扣减配额 |
| `deployment_affinity` | 简单的粘性会话 | 同一 API 密钥的所有请求 | ❌ 按用户数扣减配额 |


## 按模型组的亲和性配置

默认情况下，`optional_pre_call_checks` 对所有模型组全局生效。若希望不同模型组有不同的亲和行为，使用 `model_group_affinity_config`，例如只对跨提供商分布的模型（Azure + Bedrock）启用粘性，让单一提供商的组继续自由负载均衡。

未列出的组回退到全局 `optional_pre_call_checks` 设置。

<Tabs>
<TabItem value="python-sdk" label="Python SDK">

```python
router = litellm.Router(
    model_list=[
        {
            "model_name": "{{openai_large}}",
            "litellm_params": {"model": "azure/{{openai_large}}", "api_key": "...", "api_base": "https://endpoint1.openai.azure.com"},
        },
        {
            "model_name": "{{openai_large}}",
            "litellm_params": {"model": "bedrock/us.anthropic.{{anthropic}}", "aws_region_name": "us-east-1"},
        },
        {
            "model_name": "text-embedding-ada-002",
            "litellm_params": {"model": "azure/text-embedding-ada-002", "api_key": "...", "api_base": "https://endpoint1.openai.azure.com"},
        },
        {
            "model_name": "text-embedding-ada-002",
            "litellm_params": {"model": "azure/text-embedding-ada-002", "api_key": "...", "api_base": "https://endpoint2.openai.azure.com"},
        },
    ],
    # {{openai_large}}: cross-provider (Azure + Bedrock) — enable deployment affinity
    # text-embedding-ada-002: same provider — no affinity, let it load balance freely
    model_group_affinity_config={
        "{{openai_large}}": ["deployment_affinity", "responses_api_deployment_check"],
    },
)
```

</TabItem>
<TabItem value="proxy-server" label="代理服务器">

```yaml title="config.yaml"
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      api_key: os.environ/AZURE_API_KEY_1
      api_base: https://endpoint1.openai.azure.com

  - model_name: {{openai_large}}
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_region_name: us-east-1

  - model_name: text-embedding-ada-002
    litellm_params:
      model: azure/text-embedding-ada-002
      api_key: os.environ/AZURE_API_KEY_1
      api_base: https://endpoint1.openai.azure.com

  - model_name: text-embedding-ada-002
    litellm_params:
      model: azure/text-embedding-ada-002
      api_key: os.environ/AZURE_API_KEY_2
      api_base: https://endpoint2.openai.azure.com

router_settings:
  # {{openai_large}}: cross-provider — enable stickiness
  # text-embedding-ada-002: not listed — load balances freely
  model_group_affinity_config:
    "{{openai_large}}":
      - deployment_affinity
      - responses_api_deployment_check
```

</TabItem>
</Tabs>

**支持的取值**：`deployment_affinity`、`responses_api_deployment_check`、`session_affinity`

## 调用非 Responses API 端点（`/responses` 到 `/chat/completions` 的桥接）

LiteLLM 允许你通过一座通往 LiteLLM `/chat/completions` 端点的桥来调用非 Responses API 模型。这对调用 Anthropic、Gemini，甚至非 Responses API 的 OpenAI 模型都很有用。


#### Python SDK 用法

```python showLineNumbers title="SDK Usage"
import litellm
import os

# Set API key
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-api-key"

# Non-streaming response
response = litellm.responses(
    model="anthropic/{{anthropic}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### LiteLLM 代理用法

**编写配置**：

```yaml showLineNumbers title="Example Configuration"
model_list:
- model_name: anthropic-model
  litellm_params:
    model: anthropic/{{anthropic}}
    api_key: os.environ/ANTHROPIC_API_KEY
```

**启动代理**：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**发起请求**：

```bash showLineNumbers title="non-Responses API Model Request"
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "anthropic-model",
    "input": "who is Michael Jordan"
  }'
```






### 为自定义 `api_base` 的 `openai/` 模型提供的可选桥接

如果你通过 `openai/` 前缀加自定义 `api_base` 使用**兼容 OpenAI 的第三方提供商**（例如 llama.cpp、vLLM、LM Studio），LiteLLM 通常会把 `/responses` 请求直接转发到该端点。如果提供商只支持 `/chat/completions`，请求就会失败。

用下面任一方式强制走 `/responses` → `/chat/completions` 桥接：

1. **`use_chat_completions_api: true`**：明确告知 LiteLLM 将调用提供商的对话补全 API。
2. **`openai/chat_completions/<model_name>`**：与 chat completions 上的 `responses/` 模式一致，模型 id 本身就编码了路由选择。

#### Python SDK 用法

```python showLineNumbers title="Force bridge for custom openai/ endpoint (flag)"
import litellm

response = litellm.responses(
    model="openai/my-custom-model",
    input="Hello!",
    api_base="http://localhost:8080",
    api_key="fake-key",
    use_chat_completions_api=True,
)

print(response)
```

或者把它编码进模型 id：

```python showLineNumbers title="Force bridge via openai/chat_completions/ model prefix"
import litellm

response = litellm.responses(
    model="openai/chat_completions/my-custom-model",
    input="Hello!",
    api_base="http://localhost:8080",
    api_key="fake-key",
)

print(response)
```

#### LiteLLM 代理用法

**编写配置**：

```yaml showLineNumbers title="config.yaml — bridge for custom openai/ endpoint"
model_list:
- model_name: my-local-model
  litellm_params:
    model: openai/my-custom-model
    api_base: http://localhost:8080/v1
    api_key: fake-key
    use_chat_completions_api: true
```

也可以不用该开关，改为设置 `model: openai/chat_completions/my-custom-model`。

**启动代理**：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**发起请求**：

```bash showLineNumbers title="Request via bridge"
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "my-local-model",
    "input": "Hello!"
  }'
```

当你把硬编码了 `/responses` 端点的客户端（例如设置了 `wire_api = "responses"` 的 OpenAI Codex CLI）接到只暴露 `/chat/completions` 的本地或第三方兼容 OpenAI 的提供商时，这一功能尤其有用。

## 服务端压缩

对于长程对话，你可以启用**服务端压缩**（server-side compaction）：当渲染后的上下文大小越过阈值时，服务器会在流内自动执行压缩并发出一个压缩项，无需单独调用 `POST /v1/responses/compact`。

在 `openai` 或 `azure` 提供商上使用 OpenAI Responses API 时受支持。传入带压缩条目的 `context_management` 和 `compact_threshold`（token 数；最小 1000）。上下文越过阈值时，服务器会在流内压缩并继续。用 `previous_response_id`，或把输出项追加进下一次的 input 数组来串联各轮。详情参见 [OpenAI Compaction 指南](https://developers.openai.com/api/docs/guides/compaction)。

> **注意**：你可以在 Responses API 中通过 LiteLLM 对 Anthropic 模型使用 OpenAI 的 `context_management` 格式，LiteLLM 会自动为 Anthropic 转换该格式并代管上下文。

要显式控制压缩的执行时机，请改用独立的 compact 端点（`POST /v1/responses/compact`）。

### Python SDK

```python showLineNumbers title="Server-side compaction with LiteLLM Python SDK"
import litellm

# Non-streaming: enable compaction when context exceeds 200k tokens
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Your conversation input...",
    context_management=[{"type": "compaction", "compact_threshold": 200000}],
    max_output_tokens=1024,
)
print(response)

# Streaming: same context_management, compaction runs in-stream if threshold is crossed
stream = litellm.responses(
    model="openai/{{openai_large}}",
    input="Your conversation input...",
    context_management=[{"type": "compaction", "compact_threshold": 200000}],
    stream=True,
)
for event in stream:
    print(event)
```

### LiteLLM 代理（AI 网关）

用 OpenAI SDK 并把代理地址设为 `base_url`，或直接用 curl 调用代理。代理会把 `context_management` 转发给提供商。

**OpenAI Python SDK**（代理作为 base_url）：

```python showLineNumbers title="Server-side compaction via LiteLLM Proxy"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # LiteLLM Proxy (AI Gateway)
    api_key="your-proxy-api-key",
)

response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Your conversation input...",
    context_management=[{"type": "compaction", "compact_threshold": 200000}],
    max_output_tokens=1024,
)
print(response)
```

**curl**（代理）：

```bash title="Server-side compaction via curl to LiteLLM Proxy"
curl -X POST "http://localhost:4000/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "openai/{{openai_large}}",
    "input": "Your conversation input...",
    "context_management": [{"type": "compaction", "compact_threshold": 200000}],
    "max_output_tokens": 1024
  }'
```

## Shell 工具

**Shell 工具**让模型在托管容器或本地运行时中执行命令（OpenAI Responses API）。传入 `tools=[{"type": "shell", "environment": {...}}]`，其中 `environment` 对象用于配置运行时（例如 `type: "container_auto"` 表示自动开通的容器）。全部选项参见 [OpenAI Shell 工具指南](https://developers.openai.com/api/docs/guides/tools-shell)。

使用 `openai` 或 `azure` 提供商且模型支持 Shell 工具时可用。

### Python SDK

```python showLineNumbers title="Shell tool with LiteLLM Python SDK"
import litellm

response = litellm.responses(
    model="openai/{{openai_large}}",
    input="List files in /mnt/data and run python --version.",
    tools=[{"type": "shell", "environment": {"type": "container_auto"}}],
    tool_choice="auto",
    max_output_tokens=1024,
)
```

### LiteLLM 代理（AI 网关）

用 OpenAI SDK 并把代理地址设为 `base_url`，或直接用 curl 调用代理。代理会把 `tools`（包括 `type: "shell"`）转发给提供商。

**OpenAI Python SDK**（代理作为 base_url）：

```python showLineNumbers title="Shell tool via LiteLLM Proxy"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-proxy-api-key",
)

response = client.responses.create(
    model="openai/{{openai_large}}",
    input="List files in /mnt/data.",
    tools=[{"type": "shell", "environment": {"type": "container_auto"}}],
    tool_choice="auto",
    max_output_tokens=1024,
)
```

**curl**：

```bash title="Shell tool via curl to LiteLLM Proxy"
curl -X POST "http://localhost:4000/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "openai/{{openai_large}}",
    "input": "List files in /mnt/data.",
    "tools": [{"type": "shell", "environment": {"type": "container_auto"}}],
    "tool_choice": "auto",
    "max_output_tokens": 1024
  }'
```

## 文件搜索（向量存储）

`file_search` 的完整用法（原生与模拟回退）、SDK/代理示例、架构图与常见问答，参见：

- [`Responses API 中的文件搜索：端到端测试指南`](/docs/tutorials/file_search_responses_api)

## 会话管理

LiteLLM 代理为所有受支持的模型提供会话管理，让你可以把对话历史（状态）存放在 LiteLLM 代理中并随时取回。

#### 用法

1. 启用在数据库中存储请求 / 响应内容

在代理 config.yaml 的 `general_settings` 下设置 `store_prompts_in_spend_logs: true`，并在 `litellm_settings` 下设置 `cold_storage_custom_logger: s3_v2`。启用后，LiteLLM 会把请求与响应内容存储到你指定的 s3 存储桶。

```yaml showLineNumbers title="config.yaml with Session Continuity"
litellm_settings:
  callbacks: ["s3_v2"]
  cold_storage_custom_logger: s3_v2
  s3_callback_params: # learn more https://docs.litellm.ai/docs/proxy/logging#s3-buckets
    s3_bucket_name: litellm-logs   # AWS Bucket Name for S3
    s3_region_name: us-west-2      

general_settings:
  store_prompts_in_spend_logs: true
```

2. 发起请求 1，不带 `previous_response_id`（新会话）

发起请求时不指定前一个 Response ID，即可开始一段新对话。

<Tabs>
<TabItem value="curl" label="Curl">

```curl
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "anthropic/{{anthropic}}",
    "input": "who is Michael Jordan"
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

# Make initial request to start a new conversation
response = client.responses.create(
    model="anthropic/{{anthropic}}",
    input="who is Michael Jordan"
)

print(response.id)  # Store this ID for future requests in same session
print(response.output[0].content[0].text)
```

</TabItem>
</Tabs>

响应：

```json
{
  "id":"resp_123abc",
  "model":"{{anthropic}}",
  "output":[{
    "type":"message",
    "content":[{
      "type":"output_text",
      "text":"Michael Jordan is widely considered one of the greatest basketball players of all time. He played for the Chicago Bulls (1984-1993, 1995-1998) and Washington Wizards (2001-2003), winning 6 NBA Championships with the Bulls."
    }]
  }]
}
```

3. 发起请求 2，带 `previous_response_id`（同一会话）

引用前一个 Response ID 来继续对话，从而保持对话上下文。

<Tabs>
<TabItem value="curl" label="Curl">

```curl
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "anthropic/{{anthropic}}",
    "input": "can you tell me more about him",
    "previous_response_id": "resp_123abc"
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

# Make follow-up request in the same conversation session
follow_up_response = client.responses.create(
    model="anthropic/{{anthropic}}",
    input="can you tell me more about him",
    previous_response_id="resp_123abc"  # ID from the previous response
)

print(follow_up_response.output[0].content[0].text)
```

</TabItem>
</Tabs>

响应：

```json
{
  "id":"resp_456def",
  "model":"{{anthropic}}",
  "output":[{
    "type":"message",
    "content":[{
      "type":"output_text",
      "text":"Michael Jordan was born February 17, 1963. He attended University of North Carolina before being drafted 3rd overall by the Bulls in 1984. Beyond basketball, he built the Air Jordan brand with Nike and later became owner of the Charlotte Hornets."
    }]
  }]
}
```

4. 发起请求 3，不带 `previous_response_id`（新会话）

不引用任何先前上下文，开始一段全新的对话，演示上下文在会话之间不会保留。

<Tabs>
<TabItem value="curl" label="Curl">

```curl
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "anthropic/{{anthropic}}",
    "input": "can you tell me more about him"
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

# Make a new request without previous context
new_session_response = client.responses.create(
    model="anthropic/{{anthropic}}",
    input="can you tell me more about him"
    # No previous_response_id means this starts a new conversation
)

print(new_session_response.output[0].content[0].text)
```

</TabItem>
</Tabs>

响应：

```json
{
  "id":"resp_789ghi",
  "model":"{{anthropic}}",
  "output":[{
    "type":"message",
    "content":[{
      "type":"output_text",
      "text":"I don't see who you're referring to in our conversation. Could you let me know which person you'd like to learn more about?"
    }]
  }]
}
```
