import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /v1/messages

借助 LiteLLM，以 Anthropic 的 `v1/messages` 格式调用你的所有 LLM API。


## 概述

| 功能 | 支持情况 | 说明 |
|-------|-------|-------|
| 成本追踪 | ✅ | 适用于所有受支持的模型 |
| 日志记录 | ✅ | 适用于所有集成 |
| 终端用户追踪 | ✅ | |
| 流式 | ✅ | |
| 回退机制 | ✅ | 可在受支持的模型之间使用 |
| 负载均衡 | ✅ | 可在受支持的模型之间使用 |
| 防护栏 | ✅ | 应用于输入与输出文本。流式输出时，防护栏可以拦截响应，但掩码之类的文本改写仅对非流式响应生效 |
| 受支持的提供商 | **LiteLLM 支持的所有提供商** | `openai`、`anthropic`、`bedrock`、`vertex_ai`、`gemini`、`azure`、`azure_ai` 等 |

## 用法
---

### LiteLLM Python SDK

<Tabs>
<TabItem value="anthropic" label="Anthropic">

#### 非流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 Anthropic 示例"
import litellm
response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    api_key=api_key,
    model="anthropic/{{anthropic}}",
    max_tokens=100,
)
```

#### 流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 Anthropic 流式示例"
import litellm
response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    api_key=api_key,
    model="anthropic/{{anthropic}}",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="openai" label="OpenAI">

#### 非流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 OpenAI 示例"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="openai/{{openai_large}}",
    max_tokens=100,
)
```

#### 流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 OpenAI 流式示例"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="openai/{{openai_large}}",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="gemini" label="Google AI Studio">

#### 非流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 Google Gemini 示例"
import litellm
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="gemini/{{gemini_flash}}",
    max_tokens=100,
)
```

#### 流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 Google Gemini 流式示例"
import litellm
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="gemini/{{gemini_flash}}",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="vertex" label="Vertex AI">

#### 非流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 Vertex AI 示例"
import litellm
import os

# Set credentials - Vertex AI uses application default credentials
# Run 'gcloud auth application-default login' to authenticate
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="vertex_ai/{{gemini_flash}}",
    max_tokens=100,
)
```

#### 流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 Vertex AI 流式示例"
import litellm
import os

# Set credentials - Vertex AI uses application default credentials
# Run 'gcloud auth application-default login' to authenticate
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="vertex_ai/{{gemini_flash}}",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="bedrock" label="AWS Bedrock">

#### 非流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 AWS Bedrock 示例"
import litellm
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-access-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your AWS region

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="bedrock/us.anthropic.{{anthropic}}",
    max_tokens=100,
)
```

#### 流式示例
```python showLineNumbers title="使用 LiteLLM Python SDK 的 AWS Bedrock 流式示例"
import litellm
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-access-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your AWS region

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="bedrock/us.anthropic.{{anthropic}}",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>
</Tabs>

响应示例：
```json
{
  "content": [
    {
      "text": "Hi! this is a very short joke",
      "type": "text"
    }
  ],
  "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
  "model": "{{anthropic}}",
  "role": "assistant",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "type": "message",
  "usage": {
    "input_tokens": 2095,
    "output_tokens": 503,
    "cache_creation_input_tokens": 2095,
    "cache_read_input_tokens": 0
  }
}
```

### LiteLLM 代理服务器

<Tabs>
<TabItem value="anthropic-proxy" label="Anthropic">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: anthropic-claude
      litellm_params:
        model: {{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python showLineNumbers title="使用 LiteLLM 代理服务器的 Anthropic 示例"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="anthropic-claude",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="openai-proxy" label="OpenAI">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: openai-gpt4
      litellm_params:
        model: openai/{{openai_large}}
        api_key: os.environ/OPENAI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python showLineNumbers title="使用 LiteLLM 代理服务器的 OpenAI 示例"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="openai-gpt4",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="gemini-proxy" label="Google AI Studio">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: gemini-2-flash
      litellm_params:
        model: gemini/{{gemini_flash}}
        api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python showLineNumbers title="使用 LiteLLM 代理服务器的 Google Gemini 示例"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="gemini-2-flash",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="vertex-proxy" label="Vertex AI">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: vertex-gemini
      litellm_params:
        model: vertex_ai/{{gemini_flash}}
        vertex_project: your-gcp-project-id
        vertex_location: us-central1
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python showLineNumbers title="使用 LiteLLM 代理服务器的 Vertex AI 示例"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="vertex-gemini",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="bedrock-proxy" label="AWS Bedrock">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: bedrock-claude
      litellm_params:
        model: bedrock/us.anthropic.{{anthropic}}
        aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
        aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
        aws_region_name: us-west-2
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python showLineNumbers title="使用 LiteLLM 代理服务器的 AWS Bedrock 示例"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="bedrock-claude",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="curl-proxy" label="curl">

```bash showLineNumbers title="使用 LiteLLM 代理服务器的示例"
curl -L -X POST 'http://0.0.0.0:4000/v1/messages' \
-H 'content-type: application/json' \
-H "x-api-key: $LITELLM_API_KEY" \
-H 'anthropic-version: 2023-06-01' \
-d '{
  "model": "anthropic-claude",
  "messages": [
    {
      "role": "user",
      "content": "Hello, can you tell me a short joke?"
    }
  ],
  "max_tokens": 100
}'
```

</TabItem>
</Tabs>

## 请求格式
---

请求体将采用 Anthropic messages API 格式。**litellm 在该端点上遵循 Anthropic messages 规范**。

#### 请求体示例

```json
{
  "model": "{{anthropic}}",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Hello, world"
    }
  ]
}
```

#### 必填字段
- **model**（字符串）：  
  模型标识符（例如 `"{{anthropic}}"`）。
- **max_tokens**（整数）：  
  停止生成前可生成的最大 Token 数量。  
  _注意：模型可能在达到该上限之前就停下来；该值必须大于 1。_
- **messages**（对象数组）：  
  按顺序排列的对话轮次列表。  
  每个 message 对象必须包含：
  - **role**（枚举：`"user"` 或 `"assistant"`）：  
    指定消息的说话方。
  - **content**（字符串或内容块数组）：  
    构成消息的文本或内容块（例如包含带有 `"text"` 之类 `type` 的对象的数组）。  
    _等价示例：_
    ```json
    {"role": "user", "content": "Hello, Claude"}
    ```
    等价于：
    ```json
    {"role": "user", "content": [{"type": "text", "text": "Hello, Claude"}]}
    ```

#### 可选字段
- **metadata**（对象）：  
  包含请求的附加元数据（例如以 `user_id` 作为不透明标识符）。
- **stop_sequences**（字符串数组）：  
  自定义停止序列，生成的文本中一旦出现，模型就会停止。
- **stream**（布尔值）：  
  指示是否使用服务器推送事件（server-sent events）流式返回响应。
- **system**（字符串或数组）：  
  为模型提供上下文或特定指令的系统提示词。
- **temperature**（数字）：  
  控制模型响应的随机性。有效范围：`0 < temperature < 1`。
- **thinking**（对象）：
  启用扩展思考（extended thinking）的配置。启用后包含：
  - **budget_tokens**（整数）：
    最少 1024 个 Token（且必须小于 `max_tokens`）。
  - **type**（枚举）：
    例如 `"enabled"`。
  - **summary**（字符串，可选）：
    为思考块启用摘要样式。可选值：`"auto"`、`"concise"`、`"detailed"`、`"disabled"`。
    路由到非 Anthropic 提供商（例如 `openai/{{openai_large}}`）时，`summary` 的值会原样保留并转发给下游 API。
- **tool_choice**（对象）：  
  指示模型应如何使用所提供的工具。
- **tools**（对象数组）：  
  模型可用工具的定义。每个工具包含：
  - **name**（字符串）：  
    工具名称。
  - **description**（字符串）：  
    工具的详细描述。
  - **input_schema**（对象）：  
    描述工具预期输入格式的 JSON schema。
- **top_k**（整数）：  
  将采样限制为得分最高的前 K 个选项。
- **top_p**（数字）：  
  启用核采样（nucleus sampling），按累计概率截断。有效范围：`0 < top_p < 1`。


## 响应格式
---

响应将采用 Anthropic messages API 格式。

#### 响应示例

```json
{
  "content": [
    {
      "text": "Hi! My name is Claude.",
      "type": "text"
    }
  ],
  "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
  "model": "{{anthropic}}",
  "role": "assistant",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "type": "message",
  "usage": {
    "input_tokens": 2095,
    "output_tokens": 503,
    "cache_creation_input_tokens": 2095,
    "cache_read_input_tokens": 0
  }
}
```

#### 响应字段

- **content**（对象数组）：  
  包含模型生成的内容块。每个块包括：
  - **type**（字符串）：  
    内容的类型（例如 `"text"`、`"tool_use"`、`"thinking"` 或 `"redacted_thinking"`）。
  - **text**（字符串）：  
    模型生成的文本。  
    _注意：最大长度为 5,000,000 个字符。_
  - **citations**（对象数组或 `null`）：  
    提供引用详情的可选字段。每条引用包括：
    - **cited_text**（字符串）：  
      被引用的原文摘录。
    - **document_index**（整数）：  
      指向被引用文档的索引。
    - **document_title**（字符串或 `null`）：  
      被引用文档的标题。
    - **start_char_index**（整数）：  
      引用的起始字符索引。
    - **end_char_index**（整数）：  
      引用的结束字符索引。
    - **type**（字符串）：  
      通常为 `"char_location"`。

- **id**（字符串）：  
  响应消息的唯一标识符。  
  _注意：ID 的格式和长度可能随时间推移而变化。_

- **model**（字符串）：  
  生成该响应的模型。

- **role**（字符串）：  
  生成消息的角色。响应中该值始终为 `"assistant"`。

- **stop_reason**（字符串）：  
  说明模型停止生成文本的原因。可能的取值包括：
  - `"end_turn"`：模型到达了自然的停止点。
  - `"max_tokens"`：因达到最大 Token 上限而停止生成。
  - `"stop_sequence"`：遇到了自定义停止序列。
  - `"tool_use"`：模型调用了一个或多个工具。

- **stop_sequence**（字符串或 `null`）：  
  导致生成中断的具体停止序列（如适用）；否则为 `null`。

- **type**（字符串）：  
  响应对象的类型，始终为 `"message"`。

- **usage**（对象）：  
  提供用于计费和限流的 Token 用量详情。包括：
  - **input_tokens**（整数）：  
    处理的输入 Token 总数。
  - **output_tokens**（整数）：  
    生成的输出 Token 总数。
  - **cache_creation_input_tokens**（整数或 `null`）：  
    用于创建缓存条目的 Token 数量。
  - **cache_read_input_tokens**（整数或 `null`）：  
    从缓存读取的 Token 数量。
