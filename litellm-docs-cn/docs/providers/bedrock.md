import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS Bedrock
支持全部 Bedrock 模型（Anthropic、Meta、Deepseek、Mistral、Amazon 等）

| 属性 | 说明 |
|-------|-------|
| 描述 | Amazon Bedrock 是一项全托管服务，提供多种高性能基础模型（FM）可选。 |
| LiteLLM 提供商路由 | `bedrock/`（GPT-5.6 及更新版本可用[原生 Chat Completions](#原生-chat-completions-路由)）、[`bedrock/chat_completions/`](#原生-chat-completions-路由)、[`bedrock/converse/`](#设置-converse--invoke-路由)、[`bedrock/invoke/`](/docs/providers/bedrock#设置-converse--invoke-路由)、[`bedrock/converse_like/`](/docs/providers/bedrock#通过内部代理调用不兼容-bedrock-url)、`bedrock/llama/`、`bedrock/deepseek_r1/`、`bedrock/qwen3/`、[`bedrock/qwen2/`](./bedrock_imported.md#qwen2-导入模型)、[`bedrock/openai/`](./bedrock_imported.md#openai-兼容导入模型qwen-25-vl-等)、[`bedrock/moonshot`](./bedrock_imported.md#moonshot-kimi-k2-thinking) |
| 提供商文档 | [Amazon Bedrock ↗](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) |
| 支持的 OpenAI 端点 | `/chat/completions`, `/completions`, `/embeddings`, `/images/generations`, `/v1/realtime`|
| 重排序端点 | `/rerank` |
| 透传端点 | [支持](../pass_through/bedrock.md) |


LiteLLM 要求系统中安装 `boto3` 才能发起 Bedrock 请求
```shell
uv add boto3>=1.28.57
```

:::info

**Amazon Nova 模型**：请升级到 v1.53.5 及以上版本

:::

## 认证

:::info

LiteLLM 使用 boto3 处理认证，以下所有方式均受支持：https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html#credentials。

:::

除传统的 boto3 认证方式外，LiteLLM 还支持 API 密钥认证。API 密钥的更多细节请参阅[官方文档](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)。

方式 1：使用 AWS_BEARER_TOKEN_BEDROCK 环境变量

```bash
export AWS_BEARER_TOKEN_BEDROCK="your-api-key"
```

方式 2：调用补全（completion）、嵌入（embedding）、图像生成（image_generation）等 API 时，通过 api_key 参数传入 API 密钥。

<Tabs>
<TabItem value="sdk" label="SDK">
```python
response = completion(
  model="bedrock/us.anthropic.{{anthropic}}",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  api_key="your-api-key"
)
```
</TabItem>
<TabItem value="proxy" label="代理">
```yaml
model_list:
  - model_name: bedrock-claude-sonnet-4-5
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      api_key: os.environ/AWS_BEARER_TOKEN_BEDROCK
```
</TabItem>
</Tabs>

## 用法

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_Bedrock.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="在 Colab 中打开"/>
</a>


```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="bedrock/us.anthropic.{{anthropic}}",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

## LiteLLM 代理用法

以下演示如何通过 LiteLLM 代理服务器调用 Bedrock

### 1. 设置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-sonnet-4-5
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

所有可用的认证参数：

```
aws_access_key_id: Optional[str],
aws_secret_access_key: Optional[str],
aws_session_token: Optional[str],
aws_region_name: Optional[str],
aws_session_name: Optional[str],
aws_profile_name: Optional[str],
aws_role_name: Optional[str],
aws_web_identity_token: Optional[str],
aws_bedrock_runtime_endpoint: Optional[str],
api_key: Optional[str],
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```
### 3. 测试


<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "bedrock-claude-v1",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="bedrock-claude-v1", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000", # set openai_api_base to the LiteLLM Proxy
    model = "bedrock-claude-v1",
    temperature=0.1
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```
</TabItem>
</Tabs>

## 设置 temperature、top p 等参数

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="bedrock/us.anthropic.{{anthropic}}",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  temperature=0.7,
  top_p=1
)
```
</TabItem>
<TabItem value="proxy" label="代理">

**在 yaml 中设置**

```yaml
model_list:
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      temperature: <your-temp>
      top_p: <your-top-p>
```

**在请求中设置**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="bedrock-claude-v1", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
top_p=1
)

print(response)

```

</TabItem>
</Tabs>

## 传递提供商特有参数

如果传给 litellm 的参数不是 OpenAI 标准参数，LiteLLM 会将其视为提供商特有参数，并作为 kwarg 放入请求体发送。[了解更多](../completion/input.md#litellm-专属参数)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="bedrock/us.anthropic.{{anthropic}}",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  top_k=1 # 👈 PROVIDER-SPECIFIC PARAM
)
```
</TabItem>
<TabItem value="proxy" label="代理">

**在 yaml 中设置**

```yaml
model_list:
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      top_k: 1 # 👈 PROVIDER-SPECIFIC PARAM
```

**在请求中设置**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="bedrock-claude-v1", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
extra_body={
    "top_k": 1 # 👈 PROVIDER-SPECIFIC PARAM
}
)

print(response)

```

</TabItem>
</Tabs>

## 用法 - 请求元数据

可以在 Bedrock 请求上附加元数据（metadata），用于日志记录与成本归属。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    requestMetadata={
        "cost_center": "engineering",
        "user_id": "user123"
    }
)
```
</TabItem>
<TabItem value="proxy" label="代理">

**在 yaml 中设置**

```yaml
model_list:
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      requestMetadata:
        cost_center: "engineering"
```

**在请求中设置**

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="bedrock-claude-v1",
    messages=[{"role": "user", "content": "Hello"}],
    extra_body={
        "requestMetadata": {"cost_center": "engineering"}
    }
)
```

</TabItem>
</Tabs>

## 用法 - 函数调用 / 工具调用

LiteLLM 通过 Bedrock 的 Converse 与 Invoke API 支持工具调用（tool calling）。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]
messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]

response = completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)
# Add any assertions, here to check response args
print(response)
assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
assert isinstance(
    response.choices[0].message.tool_calls[0].function.arguments, str
)
```
</TabItem>
<TabItem value="proxy" label="代理">

1. 设置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-3-7
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}} # for bedrock invoke, specify `bedrock/invoke/<model>`
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "bedrock-claude-3-7",
  "messages": [
    {
      "role": "user",
      "content": "What'\''s the weather like in Boston today?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'

```

</TabItem>
</Tabs>


## 用法 - 视觉

```python
from litellm import completion

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


def encode_image(image_path):
    import base64

    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


image_path = "../proxy/cached_logo.jpg"
# Getting the base64 string
base64_image = encode_image(image_path)
resp = litellm.completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Whats in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + base64_image
                    },
                },
            ],
        }
    ],
)
print(f"\nResponse: {resp}")
```


## 用法 - “thinking” / 推理内容

目前仅支持 Anthropic 的 Claude 3.7 Sonnet、Deepseek R1 与 GPT-OSS 模型。

自 v1.61.20 版本起可用。

会在 `message` 和 `delta` 对象中返回 2 个新字段：
- `reasoning_content` - 字符串 - 响应中的推理内容
- `thinking_blocks` - 对象列表（仅 Anthropic）- 响应中的 thinking 块

每个对象包含以下字段：
- `type` - Literal["thinking"] - thinking 块的类型
- `thinking` - 字符串 - 响应的思考内容，同时也会在 `reasoning_content` 中返回
- `signature` - 字符串 - 由 Anthropic 返回的 base64 编码字符串

后续调用中传入 “thinking” 内容时，Anthropic 会要求提供 `signature`（仅在使用 `thinking` 搭配工具调用时才需要）。[了解更多](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#understanding-thinking-blocks)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


resp = completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)

print(resp)
```
</TabItem>
<TabItem value="proxy" label="代理">

1. 设置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-3-7
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      reasoning_effort: "low" # 👈 EITHER HERE OR ON REQUEST
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "bedrock-claude-3-7",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low" # 👈 EITHER HERE OR ON CONFIG.YAML
  }'
```

</TabItem>
</Tabs>


**预期响应**

与 [Anthropic API 响应](../providers/anthropic#用法---思考--reasoning_content)相同。

```python
{
    "id": "chatcmpl-c661dfd7-7530-49c9-b0cc-d5018ba4727d",
    "created": 1740640366,
    "model": "us.anthropic.{{anthropic}}",
    "object": "chat.completion",
    "system_fingerprint": null,
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "The capital of France is Paris. It's not only the capital city but also the largest city in France, serving as the country's major cultural, economic, and political center.",
                "role": "assistant",
                "tool_calls": null,
                "function_call": null,
                "reasoning_content": "The capital of France is Paris. This is a straightforward factual question.",
                "thinking_blocks": [
                    {
                        "type": "thinking",
                        "thinking": "The capital of France is Paris. This is a straightforward factual question.",
                        "signature": "EqoBCkgIARABGAIiQL2UoU0b1OHYi+yCHpBY7U6FQW8/FcoLewocJQPa2HnmLM+NECy50y44F/kD4SULFXi57buI9fAvyBwtyjlOiO0SDE3+r3spdg6PLOo9PBoMma2ku5OTAoR46j9VIjDRlvNmBvff7YW4WI9oU8XagaOBSxLPxElrhyuxppEn7m6bfT40dqBSTDrfiw4FYB4qEPETTI6TA6wtjGAAqmFqKTo="
                    }
                ]
            }
        }
    ],
    "usage": {
        "completion_tokens": 64,
        "prompt_tokens": 42,
        "total_tokens": 106,
        "completion_tokens_details": null,
        "prompt_tokens_details": null
    }
}
```

### 向 Anthropic 模型传递 `thinking`

与 [Anthropic API 响应](../providers/anthropic#用法---思考--reasoning_content)相同。

## 用法 - `/chat/completions` 中的 Bedrock 搜索引用

如果你的工具会返回搜索来源，并希望在最终的助手响应中附带引用元数据，请在 `role: "tool"` 消息中传入 `search_results`。

### 请求结构

```json
{
  "model": "bedrock-claude-3-7",
  "messages": [
    {
      "role": "user",
      "content": "What is XX?"
    },
    {
      "role": "assistant",
      "tool_calls": [
        {
          "id": "tooluse_a4rBqeZNRTKj2lTskvaO4H",
          "type": "function",
          "function": {
            "name": "RAGRequest",
            "arguments": "{\"query\":\"What is Apptio?\"}"
          }
        }
      ]
    },
    {
      "role": "tool",
      "tool_call_id": "tooluse_a4rBqeZNRTKj2lTskvaO4H",
      "content": "XX is a company that makes calls to Bedrock using passthrough APIs via LiteLLM",
      "search_results": [
        {
          "source": "https://www.xx.com/about",
          "title": "About XX",
          "content": [
            {
              "text": "XX is a company that makes calls to Bedrock using passthrough APIs via LiteLLM"
            }
          ],
          "citations": {
            "enabled": true
          }
        }
      ]
    }
  ]
}
```

### 返回结果

LiteLLM 会在 `message.content` 中返回常规的助手文本，并在 `message.annotations` 中返回引用元数据：

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "XX is a technology business management company...",
        "annotations": [
          {
            "type": "url_citation",
            "url_citation": {
              "start_index": 0,
              "end_index": 42,
              "title": "About XX",
              "url": "https://www.xx.com/about"
            }
          }
        ]
      }
    }
  ]
}
```

:::note
如果只发送纯 `tool.content` 文本（不含 `search_results`），仍会得到正常回答，但不会有结构化的引用标注。
:::

## 用法 - Anthropic Beta 功能

LiteLLM 通过 `anthropic-beta` 请求头在 AWS Bedrock 上支持 Anthropic 的 Beta 功能，可用上这些实验性特性：

- **1M 上下文窗口**（1M Context Window）：最多 100 万 token 的上下文（Claude Opus 4.6、Sonnet 4.5、Sonnet 4）
- **计算机使用工具**（Computer Use Tools）：能操作计算机界面的 AI
- **Token 高效工具**（Token-Efficient Tools）：更省 token 的工具调用方式
- **扩展输出**（Extended Output）：输出最多 128K token
- **增强思考**（Enhanced Thinking）：更强的推理能力

### 支持的 Beta 功能

| Beta 功能 | 请求头取值 | 兼容模型 | 说明 |
|--------------|-------------|------------------|-------------|
| 1M 上下文窗口 | `context-1m-2025-08-07` | Claude Opus 4.6, Sonnet 4.5, Sonnet 4 | 启用 100 万 token 上下文窗口 |
| 计算机使用（最新） | `computer-use-2025-01-24` | Claude 3.7 Sonnet | 最新计算机使用工具 |
| 计算机使用（旧版） | `computer-use-2024-10-22` | Claude 3.5 Sonnet v2 | Claude 3.5 的计算机使用工具 |
| Token 高效工具 | `token-efficient-tools-2025-02-19` | Claude 3.7 Sonnet | 更高效的工具调用 |
| 交错思考 | `interleaved-thinking-2025-05-14` | Claude 4 models | 增强的思考能力 |
| 扩展输出 | `output-128k-2025-02-19` | Claude 3.7 Sonnet | 输出最多 128K token |
| 开发者思考 | `dev-full-thinking-2025-05-14` | Claude 4 models | 面向开发者的原始思考模式 |

<Tabs>
<TabItem value="sdk" label="SDK">

**单个 Beta 功能**

```python keep-model-ids
from litellm import completion
import os

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

# Use 1M context window with Claude Sonnet 4
response = completion(
    model="bedrock/anthropic.claude-sonnet-4-20250514-v1:0",
    messages=[{"role": "user", "content": "Hello! Testing 1M context window."}],
    max_tokens=100,
    extra_headers={
        "anthropic-beta": "context-1m-2025-08-07"  # 👈 Enable 1M context
    }
)
```

**多个 Beta 功能**

```python keep-model-ids
from litellm import completion

# Combine multiple beta features (comma-separated)
response = completion(
    model="bedrock/converse/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": "Testing multiple beta features"}],
    max_tokens=100,
    extra_headers={
        "anthropic-beta": "computer-use-2024-10-22,context-1m-2025-08-07"
    }
)
```

**结合 Beta 功能使用计算机使用工具**

```python keep-model-ids
from litellm import completion

# Computer use tools automatically add computer-use-2024-10-22
# You can add additional beta features
response = completion(
    model="bedrock/converse/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": "Take a screenshot"}],
    tools=[{
        "type": "computer_20241022",
        "name": "computer",
        "display_width_px": 1920,
        "display_height_px": 1080
    }],
    extra_headers={
        "anthropic-beta": "context-1m-2025-08-07"  # Additional beta feature
    }
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

**在 YAML 配置中设置**

```yaml keep-model-ids
model_list:
  - model_name: claude-sonnet-4-1m
    litellm_params:
      model: bedrock/anthropic.claude-sonnet-4-20250514-v1:0
      extra_headers:
        anthropic-beta: "context-1m-2025-08-07"  # 👈 Enable 1M context

  - model_name: claude-computer-use
    litellm_params:
      model: bedrock/converse/anthropic.claude-3-5-sonnet-20241022-v2:0
      extra_headers:
        anthropic-beta: "computer-use-2024-10-22,context-1m-2025-08-07"

general_settings:
  forward_client_headers_to_llm_api: true  # 👈 Required for client-side header forwarding
```

**在请求中设置**

```python
import openai

client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-1m",
    messages=[{
        "role": "user", 
        "content": "Testing 1M context window"
    }],
    extra_headers={
        "anthropic-beta": "context-1m-2025-08-07"
    }
)
```

:::info
**关于客户端请求头转发**：通过代理、并由客户端（如 OpenAI SDK）发送 `anthropic-beta` 请求头时，需要在代理的 `general_settings` 中启用 `forward_client_headers_to_llm_api: true`。这样代理才会从 HTTP 请求中提取请求头，转发给底层 LLM 提供商。
:::

</TabItem>
</Tabs>

:::info

Beta 功能可能需要在 AWS 账户中申请特殊访问权限，部分功能仅在特定 AWS 区域可用。可用性与开通要求请查阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages-request-response.html)。

:::

### 工具调用的即时输入流式

默认情况下，Claude 会先缓冲工具调用的完整输入 JSON 再流式输出，因此一次较大的工具调用（比如写一个大文件）可能让流长时间没有输出，足以触发客户端读超时。给工具设置 `eager_input_streaming: true` 后，其输入会边生成边流式传输。LiteLLM 会在所有 Bedrock 路由（Converse 与 Invoke，`/v1/chat/completions`、`/v1/messages`、`/v1/responses`）上把该标志转换为 `fine-grained-tool-streaming-2025-05-14` Beta，因此对 Bedrock 上的所有 Claude 模型都生效，包括那些不认得单工具字段的旧模型。该 Beta 是请求级别的：只要有一个工具启用了它，所有工具的输入都会即时流式传输，并且在块结束前，流出的增量可能是尚未完成的 JSON。

<Tabs>
<TabItem value="sdk" label="SDK">

```python keep-model-ids
from litellm import completion

response = completion(
    model="bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0",
    messages=[{"role": "user", "content": "Write a 2000 word README to docs/README.md"}],
    tools=[{
        "type": "function",
        "function": {
            "name": "write_file",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}, "content": {"type": "string"}},
                "required": ["path", "content"],
            },
        },
        "eager_input_streaming": True,
    }],
    stream=True,
)
for chunk in response:
    print(chunk.choices[0].delta.tool_calls)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

**在 YAML 配置中设置**

```yaml keep-model-ids
model_list:
  - model_name: bedrock-claude
    litellm_params:
      model: bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0  # bedrock/converse/ and bedrock/invoke/ work too
```

**OpenAI 格式，`/v1/chat/completions`**

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "bedrock-claude",
    "messages": [{"role": "user", "content": "Write a 2000 word README to docs/README.md"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "write_file",
        "parameters": {
          "type": "object",
          "properties": {"path": {"type": "string"}, "content": {"type": "string"}},
          "required": ["path", "content"]
        }
      },
      "eager_input_streaming": true
    }],
    "stream": true
  }'
```

**Anthropic 格式，`/v1/messages`**

```bash
curl http://0.0.0.0:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $LITELLM_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "bedrock-claude",
    "max_tokens": 4096,
    "messages": [{"role": "user", "content": "Write a 2000 word README to docs/README.md"}],
    "tools": [{
      "name": "write_file",
      "input_schema": {
        "type": "object",
        "properties": {"path": {"type": "string"}, "content": {"type": "string"}},
        "required": ["path", "content"]
      },
      "eager_input_streaming": true
    }],
    "stream": true
  }'
```

**OpenAI Responses 格式，`/v1/responses`**

```bash
curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "bedrock-claude",
    "input": "Write a 2000 word README to docs/README.md",
    "tools": [{
      "type": "function",
      "name": "write_file",
      "parameters": {
        "type": "object",
        "properties": {"path": {"type": "string"}, "content": {"type": "string"}},
        "required": ["path", "content"]
      },
      "eager_input_streaming": true
    }],
    "stream": true
  }'
```

</TabItem>
</Tabs>


## 用法 - 结构化输出 / JSON 模式

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os 
from pydantic import BaseModel

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

class CalendarEvent(BaseModel):
  name: str
  date: str
  participants: list[str]

class EventsList(BaseModel):
    events: list[CalendarEvent]

response = completion(
  model="bedrock/anthropic.{{anthropic}}", # specify invoke via `bedrock/invoke/anthropic.{{anthropic}}`
  response_format=EventsList,
  messages=[
    {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
    {"role": "user", "content": "Who won the world series in 2020?"}
  ],
)
print(response.choices[0].message.content)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-3-7
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}} # specify invoke via `bedrock/invoke/<model_name>` 
      aws_access_key_id: os.environ/CUSTOM_AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/CUSTOM_AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/CUSTOM_AWS_REGION_NAME
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "bedrock-claude-3-7",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant designed to output JSON."
      },
      {
        "role": "user",
        "content": "Who won the worlde series in 2020?"
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "math_reasoning",
        "description": "reason about maths",
        "schema": {
          "type": "object",
          "properties": {
            "steps": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "explanation": { "type": "string" },
                  "output": { "type": "string" }
                },
                "required": ["explanation", "output"],
                "additionalProperties": false
              }
            },
            "final_answer": { "type": "string" }
          },
          "required": ["steps", "final_answer"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```
</TabItem>
</Tabs>

## 用法 - 延迟优化推理

v1.65.1 及以上版本支持

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/anthropic.{{anthropic}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    performanceConfig={"latency": "optimized"},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-3-7
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      performanceConfig: {"latency": "optimized"} # 👈 EITHER HERE OR ON REQUEST
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "bedrock-claude-3-7",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "performanceConfig": {"latency": "optimized"} # 👈 EITHER HERE OR ON CONFIG.YAML
  }'
```

</TabItem>
</Tabs>

## 用法 - 服务层级

通过 `serviceTier` 控制 Bedrock 请求的处理层级，可用取值为 `priority`、`default` 或 `flex`。

- `priority`：更高处理优先级，保证容量
- `default`：标准处理层级
- `flex`：面向批处理负载的成本优化处理

[Bedrock ServiceTier API 参考](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_ServiceTier.html)

### 兼容 OpenAI 的 `service_tier` 参数

LiteLLM 也支持 OpenAI 风格的 `service_tier` 参数，会自动转换为 Bedrock 原生的 `serviceTier` 格式：

| OpenAI `service_tier` | Bedrock `serviceTier` |
|-----------------------|----------------------|
| `"priority"` | `{"type": "priority"}` |
| `"default"` | `{"type": "default"}` |
| `"flex"` | `{"type": "flex"}` |
| `"auto"` | `{"type": "default"}` |

```python
from litellm import completion

# Using OpenAI-style service_tier parameter
response = completion(
    model="bedrock/converse/us.anthropic.{{anthropic}}",
    messages=[{"role": "user", "content": "Hello!"}],
    service_tier="priority"  # Automatically translated to serviceTier={"type": "priority"}
)
```

### Bedrock 原生 `serviceTier` 参数

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/converse/qwen.qwen3-235b-a22b-2507-v1:0",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    serviceTier={"type": "priority"},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: qwen3-235b-priority
    litellm_params:
      model: bedrock/converse/qwen.qwen3-235b-a22b-2507-v1:0
      aws_region_name: ap-northeast-1
      serviceTier:
        type: priority
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "qwen3-235b-priority",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "serviceTier": {"type": "priority"}
  }'
```

</TabItem>
</Tabs>

## 用法 - Bedrock 防护栏

[Bedrock 防护栏与 LiteLLM 配合使用](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-use-converse-api.html)的示例

### 使用 `guarded_text` 进行选择性内容审核

LiteLLM 支持 `guarded_text` 内容类型实现选择性内容审核：只把需要 Bedrock 防护栏审核的内容包裹起来，而不是评估整段对话。

**工作原理**：
- 带 `type: "guarded_text"` 的内容会自动包裹进 `guardrailConverseContent` 块
- 只有被包裹的内容会经过 Bedrock 防护栏评估
- `type: "text"` 的普通内容会绕过防护栏评估

:::note
如果不使用 `guarded_text`，整段对话历史都会发送给防护栏评估，可能增加延迟和成本。
:::

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python
from litellm import completion

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
    model="us.anthropic.{{anthropic}}",
    messages=[
        {
            "content": "where do i buy coffee from? ",
            "role": "user",
        }
    ],
    max_tokens=10,
    guardrailConfig={
        "guardrailIdentifier": "ff6ujrregl1q", # The identifier (ID) for the guardrail.
        "guardrailVersion": "DRAFT",           # The version of the guardrail.
        "trace": "disabled",                   # The trace behavior for the guardrail. Can either be "disabled" or "enabled"
    },
)

# Selective guardrail usage with guarded_text - only specific content is evaluated
response_guard = completion(
    model="us.anthropic.{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is the main topic of this legal document?"},
                {"type": "guarded_text", "text": "This      document contains sensitive legal information that should be moderated by guardrails."}
            ]
        }
    ],
    guardrailConfig={
        "guardrailIdentifier": "gr-abc123",
        "guardrailVersion": "DRAFT"
    }
)
```
</TabItem>
<TabItem value="proxy" label="Proxy 按请求设置">

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="us.anthropic.{{anthropic}}", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
extra_body={
    "guardrailConfig": {
        "guardrailIdentifier": "ff6ujrregl1q", # The identifier (ID) for the guardrail.
        "guardrailVersion": "DRAFT",           # The version of the guardrail.
        "trace": "disabled",                   # The trace behavior for the guardrail. Can either be "disabled" or "enabled"
    },
}
)

print(response)
```
</TabItem>
<TabItem value="proxy-config" label="Proxy 按 config.yaml 设置">

1. 更新 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/CUSTOM_AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/CUSTOM_AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/CUSTOM_AWS_REGION_NAME
      guardrailConfig: {
        "guardrailIdentifier": "ff6ujrregl1q", # The identifier (ID) for the guardrail.
        "guardrailVersion": "DRAFT",           # The version of the guardrail.
        "trace": "disabled",                   # The trace behavior for the guardrail. Can either be "disabled" or "enabled"
    }

```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="bedrock-claude-v1", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7
)

# For adding selective guardrail usage with guarded_text
response_guard = client.chat.completions.create(model="bedrock-claude-v1", messages = [
   {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is the main topic of this legal document?"},
                {"type": "guarded_text", "text": "This document contains sensitive legal information that should be moderated by guardrails."}
            ]
  }
],
temperature=0.7
) 

print(response_guard)
```
</TabItem>
</Tabs>

## 用法 - "助手预填"

在 Bedrock 上使用 Anthropic 的 Claude 时，可以在 `messages` 数组末尾放一条 `assistant` 角色消息，来"替 Claude 把话说在前头"。

:::info

返回的补全结果_**不会**_包含你的"预填"文本，因为它本身就是提示词的一部分。请记得自己把预填文本拼在 Claude 的补全结果前面。

:::

```python keep-model-ids
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

messages = [
    {"role": "user", "content": "How do you say 'Hello' in German? Return your answer as a JSON object, like this:\n\n{ \"Hello\": \"Hallo\" }"},
    {"role": "assistant", "content": "{"},
]
response = completion(model="bedrock/anthropic.claude-v2", messages=messages)
```

### 发送给 Claude 的提示词示例

```

Human: How do you say 'Hello' in German? Return your answer as a JSON object, like this:

{ "Hello": "Hallo" }

Assistant: {
```

## 用法 - "System" 消息
在 Bedrock 上使用 Anthropic 的 Claude 2.1 时，`system` 角色消息会自动按正确格式处理。

```python keep-model-ids
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

messages = [
    {"role": "system", "content": "You are a snarky assistant."},
    {"role": "user", "content": "How do I boil water?"},
]
response = completion(model="bedrock/anthropic.claude-v2:1", messages=messages)
```

### 发送给 Claude 的提示词示例

```
You are a snarky assistant.

Human: How do I boil water?

Assistant:
```

## 用法 - 流式
```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="bedrock/us.anthropic.{{anthropic}}",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  stream=True
)
for chunk in response:
  print(chunk)
```

#### 流式输出块示例
```json
{
  "choices": [
    {
      "finish_reason": null,
      "index": 0,
      "delta": {
        "content": "ase can appeal the case to a higher federal court. If a higher federal court rules in a way that conflicts with a ruling from a lower federal court or conflicts with a ruling from a higher state court, the parties involved in the case can appeal the case to the Supreme Court. In order to appeal a case to the Sup"
      }
    }
  ],
  "created": null,
  "model": "us.anthropic.{{anthropic}}",
  "usage": {
    "prompt_tokens": null,
    "completion_tokens": null,
    "total_tokens": null
  }
}
```

## 跨区域推理

LiteLLM 为 Bedrock 的[跨区域推理（cross-region inference）](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html)提供支持，覆盖全部[受支持的 Bedrock 模型](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference-support.html)。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import os 


os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


litellm.set_verbose = True #  👈 SEE RAW REQUEST 

response = completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=messages,
    max_tokens=10,
    temperature=0.1,
)

print("Final Response: {}".format(response))
```

</TabItem>
<TabItem value="proxy" label="代理">

#### 1. 设置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-sonnet
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```


#### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

#### 3. 测试


<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "bedrock-claude-sonnet",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="bedrock-claude-sonnet", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000", # set openai_api_base to the LiteLLM Proxy
    model = "bedrock-claude-sonnet",
    temperature=0.1
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>
</Tabs>
</TabItem>
</Tabs>


## 设置 `converse` / `invoke` 路由

:::info

LiteLLM `v1.53.5` 及以上版本支持

:::

LiteLLM 默认使用 `invoke` 路由；对支持 `converse` 路由的 Bedrock 模型，LiteLLM 会改用 `converse`。

要显式指定路由，可写成 `bedrock/converse/<model>` 或 `bedrock/invoke/<model>`。

GPT-5.6 及更新的模型是例外：它们默认走 AWS 的 OpenAI 兼容端点，而 `bedrock/chat_completions/<model>` 可以让 AWS 在该端点提供的其他模型也走这条路。参见[原生 Chat Completions 路由](#原生-chat-completions-路由)。


例如：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

completion(model="bedrock/converse/us.amazon.nova-pro-v1:0")
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/converse/us.amazon.nova-pro-v1:0
```

</TabItem>
</Tabs>

## 原生 Chat Completions 路由

AWS 在一个 OpenAI 兼容端点 `https://bedrock-runtime.{region}.amazonaws.com/openai/v1/chat/completions` 上提供了一部分 Bedrock 模型。对这类模型，LiteLLM 可以把你的 `/chat/completions` 请求原样发到该端点，而不必在 Converse 格式之间来回转换。转换越少，延迟越低，参数在转换中丢失的机会也越少。

| 模型 | LiteLLM 模型名 | 默认路由 |
|-------|--------------------|---------------|
| GPT-5.6 Sol、Terra、Luna | `bedrock/us.openai.gpt-5.6-sol`、`bedrock/global.openai.gpt-5.6-sol` 以及 `terra` / `luna` 变体 | 原生 Chat Completions |
| GPT-6 Sol、Astra、Luna | `bedrock/us.openai.gpt-6-sol`、`bedrock/global.openai.gpt-6-sol` 以及 `astra` / `luna` 变体 | 原生 Chat Completions |
| GPT-6.1 Sol | `bedrock/us.openai.gpt-6.1-sol`、`bedrock/global.openai.gpt-6.1-sol` | 原生 Chat Completions |
| GPT-OSS 20B、120B | `bedrock/openai.gpt-oss-20b-1:0`、`bedrock/openai.gpt-oss-120b-1:0` 以及 `us-gov.` 推理配置档 ID | Converse；`bedrock/chat_completions/openai.gpt-oss-20b-1:0` 走原生 Chat Completions |
| Grok 4.6 | `bedrock/us.xai.grok-4.6`、`bedrock/global.xai.grok-4.6`、`bedrock/us-gov.xai.grok-4.6` | Converse；`bedrock/chat_completions/us.xai.grok-4.6` 走原生 Chat Completions |
| 其余所有模型（Claude、Nova、Llama、Mistral 等） | `bedrock/<model-id>` | Converse 或 Invoke，与之前一致 |

GPT-5.6 及更新的模型（`openai.gpt-5.6-*`、`openai.gpt-6-*`、`openai.gpt-6.1-*` 及后续版本）只要在[模型成本表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)的条目中于 `supported_endpoints` 下列出 `/v1/chat/completions`，就会默认走原生路由；把模型接入原生 `/v1/responses` 路由用的也是这个键。更早的 GPT ID、GPT-OSS 和 Grok 继续沿用原先的 Converse 路由，除非你在模型名前加 `bedrock/chat_completions/` 前缀；而 `bedrock/converse/` 会把任何模型固定在 Converse 上。认证、区域、`aws_bedrock_runtime_endpoint` 和成本追踪在两种路由下行为一致。模型名里带区域路径（如 `bedrock/chat_completions/us-gov-west-1/openai.gpt-oss-20b-1:0`）时也是如此：区域决定端点，其后的 ID 就是 AWS 收到的内容，显式设置的 `aws_region_name` 仍然优先于路径。[`bedrock/openai/<imported-model-arn>`](./bedrock_imported.md#openai-兼容导入模型qwen-25-vl-等) 是面向导入模型的另一条独立路由，保持不变。

代价在于：少数 Converse 功能在 OpenAI 兼容端点上没有等价实现，因此只要请求用到其中之一，LiteLLM 会按请求回退到 Converse：

| 请求特征 | 实际路由 | 原因 |
|---------|------------|-----|
| 请求体中带 `guardrailConfig` | Converse | AWS 在 OpenAI 兼容端点上通过 `X-Amzn-Bedrock-Guardrail*` 请求头接收防护栏配置，并拒绝请求体中的 `guardrailConfig` 字段，因此 LiteLLM 让这类请求继续走 Converse，防护栏行为不变 |
| 请求体中带 `requestMetadata`、`performanceConfig`、`serviceTier` 或 `outputConfig` | Converse | 这些 Converse 请求体字段在 OpenAI 兼容端点上会被当作格式错误的输入拒绝 |
| `litellm_settings` 中设置了 `bedrock_request_metadata_fields` | Converse（所有请求） | LiteLLM 只会把运维者的请求元数据写入 Converse 请求体 |
| 以应用推理配置档（Application inference profile）ARN 作为模型 | Converse | LiteLLM 无法从 ARN 判断它背后是哪个模型 |
| 函数 `tools` 且 `reasoning_effort` 不是 `"none"`（或未设置），而模型在成本表中没有 `"supports_bedrock_runtime_chat_completions_tools_with_reasoning": true` 标记（目前是 GPT-5.6、GPT-6、GPT-6.1 家族） | Converse | 对这些模型，AWS 只在 `reasoning_effort` 为 `"none"` 时才在 Chat Completions 上接受函数工具，而 GPT-6.1 完全不接受 `"none"`，所以它的工具调用始终走 Converse；GPT-OSS 和 Grok 带有该标记，任意 effort 取值都能使用工具 |
| 任意模型上使用 `"type": "json_object"` 的 `response_format`（带不带 LiteLLM 的 `response_schema` 键均可） | Converse | AWS 的 OpenAI 兼容端点对 `json_object` 一律返回 400，除非消息里包含 “json” 一词，因此 LiteLLM 保留 Converse 的处理方式：`response_schema` 会变成一个强制的 `json_tool_call` 工具并返回你要的 JSON；不带 schema 的 `json_object` 行为与此前在 Converse 上完全一致 |
| JSON schema 形式的 `response_format`（`{"type": "json_schema", ...}` 或 Pydantic 模型），而模型在成本表中没有 `"supports_bedrock_runtime_chat_completions_response_format": true` 标记（目前是 GPT-OSS） | Converse | AWS 在 Chat Completions 上接受 GPT-OSS 的 `response_format`，但实际仍返回自由文本，因此 LiteLLM 保留 Converse 的模拟方式（一个强制的 `json_tool_call` 工具）来返回你要的 JSON；GPT-5.6 及更新模型和 Grok 带有该标记，会在原生端点上直接强制 schema |
| `stop` 停止序列 | Converse | Converse 把 `stop` 转发为 `stopSequences`，AWS 对这些模型会返回 400，与该路由出现之前一样；若原生发送，GPT-OSS 和 Grok 会把 `stop` 也应用到隐藏推理上并以空内容应答，这比直接报错更糟 |
| `top_k` 或 `additionalModelRequestFields` | Converse | 只有 Converse 会转发这些模型专属字段 |
| `/chat/completions` 请求中带 `thinking` 块 | Converse | OpenAI 兼容端点没有 `thinking` 字段；在 `/v1/messages` 上 LiteLLM 会把 `thinking` 映射为 `reasoning_effort`，请求保持原生 |
| `bedrock/converse/<model>` | Converse | 你显式指定的 |

在原生路由上你会注意到以下差异：响应携带 AWS 自己的 `id` 和 `service_tier` 字段；工具调用 ID 用的是 AWS 的（GPT-5.6 及更新家族和 Grok 是 `call_0`，GPT-OSS 是 `chatcmpl-tool-...`），不再是 `tooluse_...`；`max_tokens` 以 `max_completion_tokens` 发送；JSON schema 形式的 `response_format` 和 `service_tier` 会按你写的原样透传；`n` 大于 1 不支持（与 Converse 相同）；GPT-OSS 的推理内容通过 `reasoning_content` 返回（LiteLLM 会把它从 AWS 返回的行内 `<reasoning>...</reasoning>` 前缀中拆出来），并且没有 Converse 独有的 `thinking_blocks` 字段；消息里的 `http(s)://` 图片 URL 会由 LiteLLM 下载后以 `data:` URL 内联发送，因为该端点不会自己去抓取远程图片；Grok 会忽略 `reasoning_effort: "none"`（它总会推理），而 `low`、`medium`、`high`、`xhigh` 会正常透传。

在 GPT-5.6 及更新家族上，AWS 把 `temperature`、`top_p`、`frequency_penalty`、`presence_penalty`、`logprobs`、`top_logprobs` 与“关闭推理”绑定：当 `reasoning_effort: "none"` 时，LiteLLM 会按你写的原样透传这些参数；换成任何其他 effort 取值、或者不设置时，AWS 本会返回 400，因此 LiteLLM 会提前返回 400 并点名具体参数，或在开启 `drop_params` 时直接丢弃它们。GPT-6.1 完全不接受 `"none"`，所以它在 Bedrock 上永远无法采样。Converse 对这些模型在任何 effort 取值下都拒绝 `temperature` 和 `top_p`，因此原生路由上的 `reasoning_effort: "none"` 是让它们参与采样的唯一途径。GPT-OSS 一律拒绝 `logit_bias`，Grok 一律拒绝各类惩罚参数，无论 effort 取值如何，处理方式同样是返回 400 或丢弃。

要把 GPT-OSS 或 Grok 发到原生端点，在模型名前加上 `bedrock/chat_completions/` 前缀：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

completion(model="bedrock/chat_completions/openai.gpt-oss-20b-1:0", messages=[{"role": "user", "content": "Hello"}])
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml
model_list:
  - model_name: gpt-oss-20b-native
    litellm_params:
      model: bedrock/chat_completions/openai.gpt-oss-20b-1:0
```

</TabItem>
</Tabs>

要让 GPT-5.6 或更新模型的每个请求都留在 Converse 上，显式设置路由即可：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

completion(model="bedrock/converse/us.openai.gpt-5.6-sol", messages=[{"role": "user", "content": "Hello"}])
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml
model_list:
  - model_name: gpt-5.6-sol-converse
    litellm_params:
      model: bedrock/converse/us.openai.gpt-5.6-sol
```

</TabItem>
</Tabs>

## user/assistant 交替消息

通过 `user_continue_message` 可以追加一条默认的用户消息，适用于客户端（如 Autogen）不按 user/assistant 交替发送、且首尾都应是用户消息的场景。


```yaml
model_list:
  - model_name: "bedrock-claude"
    litellm_params:
      model: "bedrock/us.anthropic.{{anthropic}}"
      user_continue_message: {"role": "user", "content": "Please continue"}
```

或者

直接设置 `litellm.modify_params=True`，LiteLLM 会自动用一条默认的 user_continue_message 处理这种情况。

```yaml
model_list:
  - model_name: "bedrock-claude"
    litellm_params:
      model: "bedrock/us.anthropic.{{anthropic}}"

litellm_settings:
   modify_params: true
```

测试一下：

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "bedrock-claude",
    "messages": [{"role": "assistant", "content": "Hey, how's it going?"}]
}'
```

## 用法 - PDF / 文档理解

LiteLLM 支持 Bedrock 模型的文档理解（Document Understanding）功能，参见 [AWS Bedrock 文档](https://docs.aws.amazon.com/nova/latest/userguide/modalities-document.html)。

:::info

LiteLLM 支持所有 Bedrock 文档类型：

例如：“pdf”、“csv”、“doc”、“docx”、“xls”、“xlsx”、“html”、“txt”、“md”

这些内容也可以通过 `image_url` 或 `base64` 传入

:::

### url 

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_pdf_input, completion

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
image_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

# Download the file
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")

# model
model = "bedrock/us.anthropic.{{anthropic}}"

image_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
        }
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": image_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="代理">

1. 设置 config.yaml

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": {"type": "text", "text": "What's this file about?"}},
        {
            "type": "file",
            "file": {
                "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
            }
        }
    ]
}'
```
</TabItem>
</Tabs>

### base64

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_pdf_input, completion

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
image_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")
base64_url = f"data:application/pdf;base64,{encoded_file}"

# model
model = "bedrock/us.anthropic.{{anthropic}}"

image_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "image_url",
        "image_url": base64_url, # OR {"url": base64_url}
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": image_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="代理">

1. 设置 config.yaml

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": {"type": "text", "text": "What's this file about?"}},
        {
            "type": "image_url",
            "image_url": "data:application/pdf;base64,{b64_encoded_file}",
        }
    ]
}'
```
</TabItem>
</Tabs>


### OpenAI GPT OSS

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `bedrock/converse/openai.gpt-oss-20b-1:0`、`bedrock/converse/openai.gpt-oss-120b-1:0`；`bedrock/chat_completions/openai.gpt-oss-20b-1:0` 走[原生 Chat Completions 路由](#原生-chat-completions-路由) |
| 提供商文档 | [Amazon Bedrock ↗](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) |

<Tabs>
<TabItem value="sdk" label="SDK">

```python title="GPT OSS SDK Usage" showLineNumbers
from litellm import completion
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

# GPT OSS 20B model
response = completion(
    model="bedrock/converse/openai.gpt-oss-20b-1:0",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)
print(response.choices[0].message.content)

# GPT OSS 120B model  
response = completion(
    model="bedrock/converse/openai.gpt-oss-120b-1:0",
    messages=[{"role": "user", "content": "Explain machine learning in simple terms"}],
)
print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="代理">

**1. 添加到配置**

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gpt-oss-20b
    litellm_params:
      model: bedrock/converse/openai.gpt-oss-20b-1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
      
  - model_name: gpt-oss-120b
    litellm_params:
      model: bedrock/converse/openai.gpt-oss-120b-1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

**2. 启动代理**

```bash title="Start LiteLLM Proxy" showLineNumbers
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

```bash title="Test GPT OSS via Proxy" showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "gpt-oss-20b",
    "messages": [
      {
        "role": "user", 
        "content": "What are the key benefits of open source AI?"
      }
    ]
  }'
```

</TabItem>
</Tabs>

## 原生 Responses API 上的 OpenAI 模型

AWS 在 bedrock-runtime 自己的 Responses 端点 `https://bedrock-runtime.{region}.amazonaws.com/openai/v1/responses` 上提供其 OpenAI 模型。对选择启用的模型，LiteLLM 会把你的 `/v1/responses` 请求原样发往该端点，而不是经由 Chat Completions 桥接转换成 Converse。正因如此，仅 Responses 支持的参数才能生效：`prompt_cache_key` 能真正到达 Bedrock，重复调用会在 `usage.input_tokens_details` 中报告缓存命中的 token 数；而走桥接时会返回 400，报错 `bedrock does not support parameters: ['prompt_cache_key']`。

模型通过在[模型成本表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)的条目中声明 `"supported_endpoints": ["/v1/responses"]` 来启用。目前包括 GPT-5.4、GPT-5.5、GPT-5.6（Sol、Terra、Luna）和 GPT-6（Astra、Sol、Luna）的 `us.` 与 `global.` 推理配置档，因此 `bedrock/us.openai.gpt-6-astra` 和 `bedrock/global.openai.gpt-5.6-sol` 走原生路由，而 `bedrock/openai.gpt-oss-120b-1:0` 仍走桥接。该标记可以在代理端通过 `model_info`、在 SDK 中通过 `litellm.register_model` 按部署覆盖，接入一个新模型只需改一处 JSON。

认证、区域与成本追踪的行为与 Converse 相同：使用 SigV4 凭证或作为 `api_key` 传入的 Bedrock API 密钥，主机根据区域所属分区确定。若 `aws_bedrock_runtime_endpoint` 已经以 `/openai/v1/responses`、`/v1/responses` 或 `/responses` 结尾，则按原样使用。

原生路由上的差异：`background` 会被丢弃并记录一条代理日志警告，因为 bedrock-runtime 拒绝该参数，桥接也从未转发过它。`web_search` 工具会被丢弃并警告，因为 bedrock-runtime 会回复不支持联网搜索。`file_search` 仍由 LiteLLM 负责模拟。`input_image` 块、`function_call_output` 列表以及 `computer_call_output` 截图中远程 `http(s)` 图片 URL 会被下载并内联为 data URI，因为 bedrock-runtime 只接受 `data:` 和 `s3://` 图片。流式行为与 OpenAI 一致。

<Tabs>
<TabItem value="sdk" label="SDK">

```python title="Native Responses API SDK Usage" showLineNumbers
import os
from litellm import responses

os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

response = responses(
    model="bedrock/us.openai.gpt-6-astra",
    input="Reply with the single word pong.",
    prompt_cache_key="my-session",
)
print(response.output_text)
```

</TabItem>

<TabItem value="proxy" label="代理">

**1. 添加到配置**

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: bedrock-gpt-6-astra
    litellm_params:
      model: bedrock/us.openai.gpt-6-astra
      aws_region_name: us-east-1
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml
```

**3. 调用 `/v1/responses`**

```bash
curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "bedrock-gpt-6-astra",
    "input": "Reply with the single word pong.",
    "prompt_cache_key": "my-session"
  }'
```

</TabItem>
</Tabs>

## TwelveLabs Pegasus - 视频理解

TwelveLabs Pegasus 1.2 是一个视频理解模型，能够分析并描述视频内容。LiteLLM 通过 Bedrock 的 `/invoke` 端点支持该模型。

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `bedrock/us.twelvelabs.pegasus-1-2-v1:0`、`bedrock/eu.twelvelabs.pegasus-1-2-v1:0` |
| 提供商文档 | [TwelveLabs Pegasus 文档 ↗](https://docs.twelvelabs.io/docs/models/pegasus) |
| 支持的参数 | `max_tokens`、`temperature`、`response_format` |
| 媒体输入 | S3 URI 或 base64 编码的视频 |

### 支持的功能

- **视频分析**：分析来自 S3 或 base64 输入的视频内容
- **结构化输出**：支持 JSON schema 形式的响应格式
- **S3 集成**：支持带存储桶所有者指定的 S3 视频 URL

### S3 视频用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python title="TwelveLabs Pegasus SDK Usage" showLineNumbers
from litellm import completion
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

response = completion(
    model="bedrock/us.twelvelabs.pegasus-1-2-v1:0",
    messages=[{"role": "user", "content": "Describe what happens in this video."}],
    mediaSource={
        "s3Location": {
            "uri": "s3://your-bucket/video.mp4",
            "bucketOwner": "123456789012",  # 12-digit AWS account ID
        }
    },
    temperature=0.2
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="代理">

**1. 添加到配置**

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: pegasus-video
    litellm_params:
      model: bedrock/us.twelvelabs.pegasus-1-2-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

**2. 启动代理**

```bash title="Start LiteLLM Proxy" showLineNumbers
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

```bash title="Test Pegasus via Proxy" showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "pegasus-video",
    "messages": [
      {
        "role": "user",
        "content": "Describe what happens in this video."
      }
    ],
    "mediaSource": {
      "s3Location": {
        "uri": "s3://your-bucket/video.mp4",
        "bucketOwner": "123456789012"
      }
    },
    "temperature": 0.2
  }'
```

</TabItem>
</Tabs>

### 使用 Base64 视频

你也可以直接以 base64 形式传入视频内容：

```python title="Base64 Video Input" showLineNumbers
from litellm import completion
import base64

# Read video file and encode to base64
with open("video.mp4", "rb") as video_file:
    video_base64 = base64.b64encode(video_file.read()).decode("utf-8")

response = completion(
    model="bedrock/us.twelvelabs.pegasus-1-2-v1:0",
    messages=[{"role": "user", "content": "What is happening in this video?"}],
    mediaSource={
        "base64String": video_base64
    },
    temperature=0.2,
)

print(response.choices[0].message.content)
```

### 重要说明

- **响应格式**：模型支持通过 `response_format` 按 JSON schema 返回结构化输出

## 预置吞吐量模型
要使用预置吞吐量（provisioned throughput）的 Bedrock 模型，请传入：
- `model=bedrock/<base-model>`，例如 `model=bedrock/anthropic.{{anthropic}}`。将 `model` 设为[支持的 AWS 模型](#支持的-aws-bedrock-模型)中的任意一个
- `model_id=provisioned-model-arn`

补全
```python
import litellm
response = litellm.completion(
    model="bedrock/anthropic.{{anthropic}}",
    model_id="provisioned-model-arn",
    messages=[{"content": "Hello, how are you?", "role": "user"}]
)
```

嵌入
```python
import litellm
response = litellm.embedding(
    model="bedrock/amazon.titan-embed-text-v1",
    model_id="provisioned-model-arn",
    input=["hi"],
)
```


## 支持的 AWS Bedrock 模型

LiteLLM 支持所有 Bedrock 模型。

下面是在 LiteLLM 中使用 bedrock 模型的示例。完整列表请参阅[模型成本表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)

| 模型名称                 | 命令                                                          |
|----------------------------|------------------------------------------------------------------|
| GPT-OSS 20B | `completion(model='bedrock/converse/openai.gpt-oss-20b-1:0', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| GPT-OSS 120B | `completion(model='bedrock/converse/openai.gpt-oss-120b-1:0', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Deepseek R1    | `completion(model='bedrock/us.deepseek.r1-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Anthropic Claude Sonnet 4.5    | `completion(model='bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Anthropic Claude-V3.5 Sonnet    | `completion(model='bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Anthropic Claude-V3  sonnet    | `completion(model='bedrock/anthropic.claude-3-sonnet-20240229-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Anthropic Claude-V3 Haiku     | `completion(model='bedrock/anthropic.claude-3-haiku-20240307-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Anthropic Claude-V3 Opus     | `completion(model='bedrock/anthropic.claude-3-opus-20240229-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Anthropic Claude-V2.1      | `completion(model='bedrock/anthropic.claude-v2:1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Anthropic Claude-V2        | `completion(model='bedrock/anthropic.claude-v2', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Anthropic Claude-Instant V1 | `completion(model='bedrock/anthropic.claude-instant-v1', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Meta llama3-1-405b        | `completion(model='bedrock/meta.llama3-1-405b-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Meta llama3-1-70b        | `completion(model='bedrock/meta.llama3-1-70b-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Meta llama3-1-8b        | `completion(model='bedrock/meta.llama3-1-8b-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Meta llama3-70b        | `completion(model='bedrock/meta.llama3-70b-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Meta llama3-8b | `completion(model='bedrock/meta.llama3-8b-instruct-v1:0', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Amazon Titan Lite          | `completion(model='bedrock/amazon.titan-text-lite-v1', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Amazon Titan Express       | `completion(model='bedrock/amazon.titan-text-express-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Cohere Command             | `completion(model='bedrock/cohere.command-text-v14', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| AI21 J2-Mid                | `completion(model='bedrock/ai21.j2-mid-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| AI21 J2-Ultra              | `completion(model='bedrock/ai21.j2-ultra-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| AI21 Jamba-Instruct              | `completion(model='bedrock/ai21.jamba-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Meta Llama 2 Chat 13b      | `completion(model='bedrock/meta.llama2-13b-chat-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Meta Llama 2 Chat 70b      | `completion(model='bedrock/meta.llama2-70b-chat-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Mistral 7B Instruct        | `completion(model='bedrock/mistral.mistral-7b-instruct-v0:2', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Mixtral 8x7B Instruct      | `completion(model='bedrock/mistral.mixtral-8x7b-instruct-v0:1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| TwelveLabs Pegasus 1.2 (US) | `completion(model='bedrock/us.twelvelabs.pegasus-1-2-v1:0', messages=messages, mediaSource={...})`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| TwelveLabs Pegasus 1.2 (EU) | `completion(model='bedrock/eu.twelvelabs.pegasus-1-2-v1:0', messages=messages, mediaSource={...})`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Moonshot Kimi K2 Thinking | `completion(model='bedrock/moonshot.kimi-k2-thinking', messages=messages)` 或 `completion(model='bedrock/invoke/moonshot.kimi-k2-thinking', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Moonshot Kimi K3 | `completion(model='bedrock/global.moonshotai.kimi-k3', messages=messages)` 或 `completion(model='bedrock/us.moonshotai.kimi-k3', messages=messages)`。裸 ID `moonshotai.kimi-k3` 只是推理配置文件（inference profile）条目，无法按需调用 | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |


## Bedrock 嵌入

### API 密钥
可以通过环境变量设置，也可以作为**参数传给 litellm.embedding()**
```python
import os
os.environ["AWS_ACCESS_KEY_ID"] = ""        # Access key
os.environ["AWS_SECRET_ACCESS_KEY"] = ""    # Secret access key
os.environ["AWS_REGION_NAME"] = ""           # us-east-1, us-east-2, us-west-1, us-west-2
```

### 用法
```python
from litellm import embedding
response = embedding(
    model="bedrock/amazon.titan-embed-text-v1",
    input=["good morning from litellm"],
)
print(response)
```

#### Titan V2 的 encoding_format 支持
```python
from litellm import embedding
# Float format (default)
response = embedding(
    model="bedrock/amazon.titan-embed-text-v2:0",
    input=["good morning from litellm"],
    encoding_format="float"  # Returns float array
)

# Binary format
response = embedding(
    model="bedrock/amazon.titan-embed-text-v2:0",
    input=["good morning from litellm"],
    encoding_format="base64"  # Returns base64 encoded binary
)
```

## 支持的 AWS Bedrock 嵌入模型

| 模型名称           | 用法                               | 支持的其他 OpenAI 参数 |
|----------------------|---------------------------------------------|-----|
| Titan Embeddings V2 | `embedding(model="bedrock/amazon.titan-embed-text-v2:0", input=input)` | `dimensions`, `encoding_format` |
| Titan Embeddings - V1 | `embedding(model="bedrock/amazon.titan-embed-text-v1", input=input)` | [见此处](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_g1_transformation.py#L53)
| Titan Multimodal Embeddings | `embedding(model="bedrock/amazon.titan-embed-image-v1", input=input)` | [见此处](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_multimodal_transformation.py#L28) |
| Cohere Embeddings - English | `embedding(model="bedrock/cohere.embed-english-v3", input=input)` | [见此处](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/cohere_transformation.py#L18)
| Cohere Embeddings - Multilingual | `embedding(model="bedrock/cohere.embed-multilingual-v3", input=input)` | [见此处](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/cohere_transformation.py#L18) |

### 进阶 - [丢弃不支持的参数](https://docs.litellm.ai/docs/completion/drop_params#openai-proxy-usage)

### 进阶 - [传入模型/提供商专属参数](https://docs.litellm.ai/docs/completion/provider_specific_params#proxy-usage)

## 图像生成

在 Bedrock 上使用 Stable Diffusion 与 Amazon Nova Canvas 模型的方法，参见 [Bedrock 图像生成](./bedrock_image_gen)。


## Rerank API

要以 Cohere 的 `/rerank` 格式使用 Bedrock 的重排序 API，参见 [Bedrock 重排序](./bedrock_rerank)。


## Bedrock 应用推理配置文件

使用 Bedrock 应用推理配置文件（Application Inference Profile）来追踪 AWS 上各项目的成本。

你可以把它直接写进模型名（`model="bedrock/arn:...`），也可以作为单独的 `model_id="arn:..` 参数传入。

### 通过 `model_id` 设置

<Tabs>
<TabItem label="SDK" value="sdk">

```python
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    model_id="arn:aws:bedrock:eu-central-1:000000000000:application-inference-profile/a0a0a0a0a0a0",
)

print(response)
```

</TabItem>
<TabItem label="PROXY" value="proxy">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: anthropic-claude-sonnet-4-5
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      # You have to set the ARN application inference profile in the model_id parameter
      model_id: arn:aws:bedrock:eu-central-1:000000000000:application-inference-profile/a0a0a0a0a0a0
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "anthropic-claude-sonnet-4-5",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "List 5 important events in the XIX century"
        }
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

## Boto3 认证

### 以参数形式传入凭证 - Completion()
将 AWS 凭证作为参数传给 litellm.completion
```python
import os
from litellm import completion

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_access_key_id="",
            aws_secret_access_key="",
            aws_region_name="",
)
```

### 传入额外请求头与自定义 API 端点

调用自定义 API 端点时，可用于覆盖已有的请求头（例如 `Authorization`）

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
import litellm
from litellm import completion

litellm.set_verbose = True # 👈 SEE RAW REQUEST

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_access_key_id="",
            aws_secret_access_key="",
            aws_region_name="",
            aws_bedrock_runtime_endpoint="https://my-fake-endpoint.com",
            extra_headers={"key": "value"}
)
```
</TabItem>

<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: bedrock-model
      litellm_params:
        model: bedrock/us.anthropic.{{anthropic}}
        aws_access_key_id: ""
        aws_secret_access_key: ""
        aws_region_name: ""
        aws_bedrock_runtime_endpoint: "https://my-fake-endpoint.com"
        extra_headers: {"key": "value"}
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml --detailed_debug
```

3. 测试一下！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "bedrock-model",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ]
}'
```

</TabItem>

</Tabs>

### 使用 AWS Profile 的 SSO 登录
- 设置 `AWS_PROFILE` 环境变量
- 发起 bedrock 补全调用

```python
import os
from litellm import completion

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

或者传入 `aws_profile_name`：

```python
import os
from litellm import completion

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_profile_name="dev-profile",
)
```

### STS 基于角色的认证

- 设置 `aws_role_name` 和 `aws_session_name`


| LiteLLM 参数 | Boto3 参数 | 说明 | Boto3 文档 |
|------------------|-----------------|-------------|-------------------|
| `aws_access_key_id` | `aws_access_key_id` | 与某个 IAM 用户或角色关联的 AWS 访问密钥 | [凭证](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html) |
| `aws_secret_access_key` | `aws_secret_access_key` | 与该访问密钥配对的 AWS 私有访问密钥 | [凭证](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html) |
| `aws_role_name` | `RoleArn` | 要代入的角色的 Amazon 资源名称（ARN） | [AssumeRole API](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sts.html#STS.Client.assume_role) |
| `aws_session_name` | `RoleSessionName` | 代入角色会话的标识符 | [AssumeRole API](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sts.html#STS.Client.assume_role) |
| `aws_session_tags` | `Tags` | 可选。随 AssumeRole 调用作为会话标签发送的 `{"Key": <str>, "Value": <str>}` 对列表，例如 `[{"Key": "team", "Value": "genai"}]` | [AssumeRole API](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sts.html#STS.Client.assume_role) |

#### 会话标签

`aws_session_tags` 会在 AssumeRole 调用时附加 [STS 会话标签](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_session-tags.html)。每个标签都会以 `aws:PrincipalTag/<Key>` 的形式落到被代入的会话上，角色的信任策略以及下游的资源策略都可以以它为判断依据。CloudTrail 中的 AssumeRole 事件会在 `requestParameters.tags` 下列出这些标签，因此可以按标签对角色会话做归因

标签按部署设置，因此路由到该模型条目的每个请求都携带同一组标签。标签顺序无关紧要，同一角色上标签相同的部署会共享一个缓存的 STS 会话。这适用于 Bedrock 的 chat 与 invoke、嵌入、批处理以及 SageMaker 部署——凡是 LiteLLM 自行执行 AssumeRole 的场景。目标角色的信任策略必须在 `sts:AssumeRole` 之外同时允许 `sts:TagSession`；参见[会话标签的信任策略](#会话标签的信任策略)

与 `aws_role_name`、`aws_session_name` 和 `aws_external_id` 一样，这属于运维侧的设置。代理会以 HTTP 401 拒绝客户端请求体中的 `aws_session_tags`，除非管理员通过 `general_settings.allow_client_side_credentials: true` 显式允许，或将其列入部署的 `configurable_clientside_auth_params`。参见[客户端 LLM 凭证](../proxy/clientside_auth.md)。在代理的模型管理端点（`/model/new`、`/model/update` 与 `PATCH /model/{model_id}/update`）上，只有代理管理员能设置或修改 `aws_session_tags`；团队管理员编辑团队模型时若改动标签，会收到 HTTP 403

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/us.anthropic.{{anthropic_large}}",
    messages=[{"role": "user", "content": "Hello!"}],
    aws_region_name="us-east-1",
    aws_role_name="arn:aws:iam::123456789012:role/litellm-bedrock",
    aws_session_name="litellm-proxy",
    aws_session_tags=[{"Key": "team", "Value": "genai"}],
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: bedrock-claude
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic_large}}
      aws_region_name: us-east-1
      aws_role_name: arn:aws:iam::123456789012:role/litellm-bedrock
      aws_session_name: litellm-proxy
      aws_session_tags:
        - Key: team
          Value: genai
```

</TabItem>
</Tabs>

### 适用于本地与外部工作负载的 IAM Roles Anywhere

[IAM Roles Anywhere](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html) 将 IAM 角色扩展到 **AWS 之外**的工作负载（本地服务器、边缘设备、其他云）。它沿用与普通 IAM 角色相同的 STS 机制，但改用 X.509 证书而非 AWS 凭证来完成认证。

**设置**：在 `~/.aws/config` 中把 [AWS Signing Helper](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/credential-helper.html) 配置为凭证进程：

```ini
[profile litellm-roles-anywhere]
credential_process = aws_signing_helper credential-process \
    --certificate /path/to/certificate.pem \
    --private-key /path/to/private-key.pem \
    --trust-anchor-arn arn:aws:rolesanywhere:us-east-1:123456789012:trust-anchor/abc123 \
    --profile-arn arn:aws:rolesanywhere:us-east-1:123456789012:profile/def456 \
    --role-arn arn:aws:iam::123456789012:role/MyBedrockRole
```

**使用**：在 LiteLLM 中引用该 profile：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=[{"role": "user", "content": "Hello!"}],
    aws_profile_name="litellm-roles-anywhere",
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: bedrock-claude
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_profile_name: "litellm-roles-anywhere"
```

</TabItem>
</Tabs>

信任锚点与 profile 的配置参见 [IAM Roles Anywhere 入门指南](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/getting-started.html)。



发起 bedrock 补全调用

---

### AssumeRole 所需的 AWS IAM 策略

要在 LiteLLM 中使用 `aws_role_name`（STS AssumeRole），你的 IAM 用户或角色**必须**拥有对目标角色调用 `sts:AssumeRole` 的权限。如果看到类似下面的报错：

```
An error occurred (AccessDenied) when calling the AssumeRole operation: User: arn:aws:sts::...:assumed-role/litellm-ecs-task-role/... is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::...:role/Enterprise/BedrockCrossAccountConsumer
```

这说明运行 LiteLLM 的 IAM 身份**没有**代入目标角色的权限。你需要更新 IAM 策略，放行该操作。

#### IAM 策略示例

将 `<TARGET_ROLE_ARN>` 替换为你想要代入的角色的 ARN（例如 `arn:aws:iam::123456789012:role/Enterprise/BedrockCrossAccountConsumer`）。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "<TARGET_ROLE_ARN>"
    }
  ]
}
```

**注意**：目标角色自身还必须（通过其信任策略）信任发起调用的 IAM 身份，AssumeRole 才能成功。详情参见 [AWS AssumeRole 文档](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-api.html)。

#### 会话标签的信任策略

当部署设置了 `aws_session_tags` 时，目标角色的信任策略还必须允许 `sts:TagSession`，否则 AssumeRole 会以 `AccessDenied ... is not authorized to perform: sts:TagSession` 失败。将 `<LITELLM_IDENTITY_ARN>` 替换为运行 LiteLLM 的 IAM 身份。`Condition` 为可选项，加上它之后，角色只接受携带预期标签的会话：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "<LITELLM_IDENTITY_ARN>"},
      "Action": ["sts:AssumeRole", "sts:TagSession"],
      "Condition": {"StringEquals": {"aws:RequestTag/team": "genai"}}
    }
  ]
}
```

---

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=messages,
            max_tokens=10,
            temperature=0.1,
            aws_role_name=aws_role_name,
            aws_session_name="my-test-session",
        )
```

如果还需要动态指定访问该角色的 AWS 用户，请在 completion()/embedding() 函数中附加以下参数

```python
from litellm import completion

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=messages,
            max_tokens=10,
            temperature=0.1,
            aws_region_name=aws_region_name,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            aws_role_name=aws_role_name,
            aws_session_name="my-test-session",
        )
```
</TabItem>

<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: bedrock/*
    litellm_params:
      model: bedrock/*
      aws_role_name: arn:aws:iam::888602223428:role/iam_local_role # AWS RoleArn
      aws_session_name: "bedrock-session" # AWS RoleSessionName
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID # [OPTIONAL - not required if using role]
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY # [OPTIONAL - not required if using role]
```


</TabItem>

</Tabs>

### 以参数形式传入外部 BedrockRuntime.Client - Completion()

这是一条已废弃的流程。Boto3 不支持异步，boto3.client 也不允许我们通过 httpx 发起 HTTP 调用。请改用上面的方法传入 AWS 参数👆。[查看认证代码](https://github.com/BerriAI/litellm/blob/55a20c7cce99a93d36a82bf3ae90ba3baf9a7f89/litellm/llms/bedrock_httpx.py#L284) [新增认证流程](https://github.com/BerriAI/litellm/issues)

:::warning





实验性 - 2024-06-23：
    `aws_access_key_id`、`aws_secret_access_key` 和 `aws_session_token` 将从 boto3.client 中提取，并传给 httpx 客户端

:::

把外部 BedrockRuntime.Client 对象作为参数传给 litellm.completion。当你使用 AWS 凭证 profile、SSO 会话或代入角色会话，或者环境变量不可用于认证时，这个方法很有用。

从会话凭证创建客户端：
```python
import boto3
from litellm import completion

bedrock = boto3.client(
            service_name="bedrock-runtime",
            region_name="us-east-1",
            aws_access_key_id="",
            aws_secret_access_key="",
            aws_session_token="",
)

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_bedrock_client=bedrock,
)
```

从 `~/.aws/config` 中的 AWS profile 创建客户端：
```python
import boto3
from litellm import completion

dev_session = boto3.Session(profile_name="dev-profile")
bedrock = dev_session.client(
            service_name="bedrock-runtime",
            region_name="us-east-1",
)

response = completion(
            model="bedrock/us.anthropic.{{anthropic}}",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_bedrock_client=bedrock,
)
```
## 通过内部代理调用（不兼容 bedrock URL）

使用 `bedrock/converse_like/model` 端点，经由你的内部代理调用 bedrock converse 模型。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/converse_like/some-model",
    messages=[{"role": "user", "content": "What's AWS?"}],
    api_key="sk-<your-litellm-api-key>",
    api_base="https://some-api-url/models",
    extra_headers={"test": "hello world"},
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: anthropic-claude
      litellm_params:
        model: bedrock/converse_like/some-model
        api_base: https://some-api-url/models
```

2. 启动代理服务器

```bash
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "anthropic-claude",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      { "content": "Hello, how are you?", "role": "user" }
    ]
}'
```

</TabItem>
</Tabs>

**预期输出 URL**

```bash
https://some-api-url/models
```
