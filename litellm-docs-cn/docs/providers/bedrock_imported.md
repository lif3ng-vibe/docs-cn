import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock 导入模型

Bedrock 导入模型（Imported Models）涵盖 DeepSeek、DeepSeek R1、Qwen 以及 OpenAI 兼容模型。

### Deepseek R1

由于对话模板（chat template）不同，这条路由单独列出。

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `bedrock/deepseek_r1/{model_arn}` |
| 提供商文档 | [Bedrock 导入模型](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html)，[DeepSeek Bedrock 导入模型](https://aws.amazon.com/blogs/machine-learning/deploy-deepseek-r1-distilled-llama-models-with-amazon-bedrock-custom-model-import/) |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

response = completion(
    model="bedrock/deepseek_r1/arn:aws:bedrock:us-east-1:086734376398:imported-model/r4c4kewx2s0n",  # bedrock/deepseek_r1/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">


**1. 添加到配置**

```yaml
model_list:
    - model_name: DeepSeek-R1-Distill-Llama-70B
      litellm_params:
        model: bedrock/deepseek_r1/arn:aws:bedrock:us-east-1:086734376398:imported-model/r4c4kewx2s0n

```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "DeepSeek-R1-Distill-Llama-70B", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>


### Deepseek 非 R1

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `bedrock/llama/{model_arn}` |
| 提供商文档 | [Bedrock 导入模型](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html)，[DeepSeek Bedrock 导入模型](https://aws.amazon.com/blogs/machine-learning/deploy-deepseek-r1-distilled-llama-models-with-amazon-bedrock-custom-model-import/) |



这条路由用于调用遵循 `llama` 调用请求/响应规范（Invoke Request / Response spec）的 Bedrock 导入模型。


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

response = completion(
    model="bedrock/llama/arn:aws:bedrock:us-east-1:086734376398:imported-model/r4c4kewx2s0n",  # bedrock/llama/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">


**1. 添加到配置**

```yaml
model_list:
    - model_name: DeepSeek-R1-Distill-Llama-70B
      litellm_params:
        model: bedrock/llama/arn:aws:bedrock:us-east-1:086734376398:imported-model/r4c4kewx2s0n

```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "DeepSeek-R1-Distill-Llama-70B", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

### Qwen3 导入模型

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `bedrock/qwen3/{model_arn}` |
| 提供商文档 | [Bedrock 导入模型](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html)，[Qwen3 模型](https://aws.amazon.com/about-aws/whats-new/2025/09/qwen3-models-fully-managed-amazon-bedrock/) |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

response = completion(
    model="bedrock/qwen3/arn:aws:bedrock:us-east-1:086734376398:imported-model/your-qwen3-model",  # bedrock/qwen3/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
    max_tokens=100,
    temperature=0.7
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">

**1. 添加到配置**

```yaml
model_list:
    - model_name: Qwen3-32B
      litellm_params:
        model: bedrock/qwen3/arn:aws:bedrock:us-east-1:086734376398:imported-model/your-qwen3-model

```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "Qwen3-32B", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

### Qwen2 导入模型

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `bedrock/qwen2/{model_arn}` |
| 提供商文档 | [Bedrock 导入模型](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html) |
| 备注 | Qwen2 与 Qwen3 的架构大体相同，主要差异在响应格式：Qwen2 使用 "text" 字段，而 Qwen3 使用 "generation" 字段。 |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

response = completion(
    model="bedrock/qwen2/arn:aws:bedrock:us-east-1:086734376398:imported-model/your-qwen2-model",  # bedrock/qwen2/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
    max_tokens=100,
    temperature=0.7
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">

**1. 添加到配置**

```yaml
model_list:
    - model_name: Qwen2-72B
      litellm_params:
        model: bedrock/qwen2/arn:aws:bedrock:us-east-1:086734376398:imported-model/your-qwen2-model

```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "Qwen2-72B", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

### OpenAI 兼容导入模型（Qwen 2.5 VL 等）

这条路由用于遵循 **OpenAI Chat Completions API 规范**的 Bedrock 导入模型，Qwen 2.5 VL 等模型都属此类：它们接受 OpenAI 格式的消息，支持视觉（图片）、工具调用（tool calling）以及 OpenAI 的其他特性。

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `bedrock/openai/{model_arn}` |
| 提供商文档 | [Bedrock 导入模型](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html) |
| 支持的功能 | 视觉（图片）、工具调用、流式、系统消息 |

#### LiteLLM SDK 用法

**基础用法**

```python
from litellm import completion

response = completion(
    model="bedrock/openai/arn:aws:bedrock:us-east-1:046319184608:imported-model/0m2lasirsp6z",  # bedrock/openai/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
    max_tokens=300,
    temperature=0.5
)
```

**视觉输入（图片）**

```python
import base64
from litellm import completion

# Load and encode image
with open("image.jpg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

response = completion(
    model="bedrock/openai/arn:aws:bedrock:us-east-1:046319184608:imported-model/0m2lasirsp6z",
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant that can analyze images."
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                }
            ]
        }
    ],
    max_tokens=300,
    temperature=0.5
)
```

**多图对比**

```python
import base64
from litellm import completion

# Load images
with open("image1.jpg", "rb") as f:
    image1_base64 = base64.b64encode(f.read()).decode("utf-8")
with open("image2.jpg", "rb") as f:
    image2_base64 = base64.b64encode(f.read()).decode("utf-8")

response = completion(
    model="bedrock/openai/arn:aws:bedrock:us-east-1:046319184608:imported-model/0m2lasirsp6z",
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant that can analyze images."
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Spot the difference between these two images?"},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image1_base64}"}
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image2_base64}"}
                }
            ]
        }
    ],
    max_tokens=300,
    temperature=0.5
)
```

#### LiteLLM 代理用法（AI 网关）

**1. 添加到配置**

```yaml
model_list:
    - model_name: qwen-25vl-72b
      litellm_params:
        model: bedrock/openai/arn:aws:bedrock:us-east-1:046319184608:imported-model/0m2lasirsp6z
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

基础文本请求：

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "qwen-25vl-72b",
            "messages": [
                {
                    "role": "user",
                    "content": "what llm are you"
                }
            ],
            "max_tokens": 300
        }'
```

视觉（图片）请求：

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "qwen-25vl-72b",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that can analyze images."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What is in this image?"},
                        {
                            "type": "image_url",
                            "image_url": {"url": "data:image/jpeg;base64,/9j/4AAQSkZ..."}
                        }
                    ]
                }
            ],
            "max_tokens": 300,
            "temperature": 0.5
        }'
```

### Moonshot Kimi K2 Thinking

Moonshot AI 的 Kimi K2 Thinking 模型现已在 Amazon Bedrock 上线。该模型具备高级推理能力，支持自动抽取推理内容。

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `bedrock/moonshot.kimi-k2-thinking`, `bedrock/invoke/moonshot.kimi-k2-thinking` |
| 提供商文档 | [AWS Bedrock Moonshot 公告 ↗](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-fully-managed-open-weight-models/) |
| 支持的参数 | `temperature`, `max_tokens`, `top_p`, `stream`, `tools`, `tool_choice` |
| 特殊功能 | 推理内容抽取、工具调用 |

#### 支持的功能

- **推理内容抽取**：自动抽取 `<reasoning>` 标签，并作为 `reasoning_content` 返回（类似 OpenAI 的 o1 系列模型）
- **工具调用**：完整支持函数/工具调用及工具响应
- **流式**：同时支持流式与非流式响应
- **系统消息**：支持系统消息

#### 基础用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python title="Moonshot Kimi K2 SDK 用法" showLineNumbers
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your preferred region

# Basic completion
response = completion(
    model="bedrock/moonshot.kimi-k2-thinking",  # or bedrock/invoke/moonshot.kimi-k2-thinking
    messages=[
        {"role": "user", "content": "What is 2+2? Think step by step."}
    ],
    temperature=0.7,
    max_tokens=200
)

print(response.choices[0].message.content)

# Access reasoning content if present
if response.choices[0].message.reasoning_content:
    print("Reasoning:", response.choices[0].message.reasoning_content)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 添加到配置**

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: kimi-k2
    litellm_params:
      model: bedrock/moonshot.kimi-k2-thinking
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

**2. 启动代理**

```bash title="启动 LiteLLM 代理" showLineNumbers
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

```bash title="通过代理测试 Kimi K2" showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "kimi-k2",
    "messages": [
      {
        "role": "user",
        "content": "What is 2+2? Think step by step."
      }
    ],
    "temperature": 0.7,
    "max_tokens": 200
  }'
```

</TabItem>
</Tabs>

#### 工具调用示例

```python title="Kimi K2 工具调用示例" showLineNumbers
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"

# Tool calling example
response = completion(
    model="bedrock/moonshot.kimi-k2-thinking",
    messages=[
        {"role": "user", "content": "What's the weather in Tokyo?"}
    ],
    tools=[
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
                            "description": "The city name"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ]
)

if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    print(f"Tool called: {tool_call.function.name}")
    print(f"Arguments: {tool_call.function.arguments}")
```

#### 流式示例

```python title="Kimi K2 流式示例" showLineNumbers
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"

response = completion(
    model="bedrock/moonshot.kimi-k2-thinking",
    messages=[
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    stream=True,
    temperature=0.7
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    
    # Check for reasoning content in streaming
    if hasattr(chunk.choices[0].delta, 'reasoning_content') and chunk.choices[0].delta.reasoning_content:
        print(f"\n[Reasoning: {chunk.choices[0].delta.reasoning_content}]")
```

#### 支持的参数

| 参数 | 类型 | 说明 | 是否支持 |
|-----------|------|-------------|-----------|
| `temperature` | float (0-1) | 控制输出的随机性 | ✅ |
| `max_tokens` | integer | 可生成的最大 Token 数 | ✅ |
| `top_p` | float | 核采样（nucleus sampling）参数 | ✅ |
| `stream` | boolean | 启用流式响应 | ✅ |
| `tools` | array | 工具/函数定义 | ✅ |
| `tool_choice` | string/object | 工具选择配置 | ✅ |
| `stop` | array | 停止序列 | ❌（Bedrock 不支持） |
