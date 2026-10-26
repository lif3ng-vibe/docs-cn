import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manus

通过 LiteLLM 的 OpenAI 兼容 Responses API 使用 Manus AI 智能体（agent）。

| 属性 | 详情 |
|----------|---------|
| 说明 | Manus 是一个 AI 智能体平台，面向复杂推理任务、文档分析与多步骤工作流，支持异步任务执行。 |
| 在 LiteLLM 中的提供商路由 | `manus/{agent_profile}` |
| 支持的操作 | `/responses`（Responses API）、`/files`（Files API） |
| 提供商文档 | [Manus API ↗](https://open.manus.im/docs/openai-compatibility) |

## 模型格式

```shell
manus/{agent_profile}
```

**示例**：
- `manus/manus-1.6` - 通用智能体
- `manus/manus-1.6-lite` - 面向简单任务的轻量智能体
- `manus/manus-1.6-max` - 面向复杂分析的高级智能体

## LiteLLM Python SDK

```python showLineNumbers title="基本用法"
import litellm
import os
import time

# Set API key
os.environ["MANUS_API_KEY"] = "your-manus-api-key"

# Create task
response = litellm.responses(
    model="manus/manus-1.6",
    input="What's the capital of France?",
)

print(f"Task ID: {response.id}")
print(f"Status: {response.status}")  # "running"

# Poll until complete
task_id = response.id
while response.status == "running":
    time.sleep(5)
    response = litellm.get_response(
        response_id=task_id,
        custom_llm_provider="manus",
    )
    print(f"Status: {response.status}")

# Get results
if response.status == "completed":
    for message in response.output:
        if message.role == "assistant":
            print(message.content[0].text)
```

## LiteLLM AI 网关

### 配置

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: manus-agent
    litellm_params:
      model: manus/manus-1.6
      api_key: os.environ/MANUS_API_KEY
```

```bash title="启动代理"
litellm --config config.yaml
```

### 用法

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="创建任务"
# Create task
curl -X POST http://localhost:4000/responses \
  -H "Authorization: Bearer your-proxy-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "manus-agent",
    "input": "What is the capital of France?"
  }'

# Response
{
  "id": "task_abc123",
  "status": "running",
  "metadata": {
    "task_url": "https://manus.im/app/task_abc123"
  }
}
```

```bash showLineNumbers title="轮询等待完成"
# Check status (repeat until status is "completed")
curl http://localhost:4000/responses/task_abc123 \
  -H "Authorization: Bearer your-proxy-key"

# When completed
{
  "id": "task_abc123",
  "status": "completed",
  "output": [
    {
      "role": "user",
      "content": [{"text": "What is the capital of France?"}]
    },
    {
      "role": "assistant",
      "content": [{"text": "The capital of France is Paris."}]
    }
  ]
}
```

</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python showLineNumbers title="创建任务并轮询"
import openai
import time

client = openai.OpenAI(
    base_url="http://localhost:4000",
    api_key="your-proxy-key"
)

# Create task
response = client.responses.create(
    model="manus-agent",
    input="What is the capital of France?"
)

print(f"Task ID: {response.id}")
print(f"Status: {response.status}")  # "running"

# Poll until complete
task_id = response.id
while response.status == "running":
    time.sleep(5)
    response = client.responses.retrieve(response_id=task_id)
    print(f"Status: {response.status}")

# Get results
if response.status == "completed":
    for message in response.output:
        if message.role == "assistant":
            print(message.content[0].text)
```

</TabItem>
</Tabs>

## 工作原理

Manus 以**异步智能体 API** 的方式运作：

1. **创建任务**：调用 `litellm.responses()` 后，Manus 会创建任务并立即返回，状态为 `status: "running"`
2. **任务执行**：智能体在后台处理你的请求
3. **轮询等待完成**：需要反复调用 `litellm.get_response()` 或 `client.responses.retrieve()`，直到状态变为 `"completed"`
4. **获取结果**：任务完成后，`output` 字段包含完整对话内容

**任务状态**：
- `running` - 智能体正在工作
- `pending` - 智能体等待输入
- `completed` - 任务成功完成
- `error` - 任务失败

:::tip[生产环境用法]
在生产应用中，建议改用 [webhooks](https://open.manus.im/docs/webhooks) 获取任务完成通知，而不是轮询。
:::

## 支持的参数

| 参数 | 是否支持 | 说明 |
|-----------|-----------|-------|
| `input` | ✅ | 文本、图片或结构化内容 |
| `stream` | ✅ | 伪流式（任务异步执行） |
| `max_output_tokens` | ✅ | 限制响应长度 |
| `previous_response_id` | ✅ | 用于多轮对话 |

## Files API

Manus 支持上传文件，用于文档分析与处理。文件上传后，可在 Responses API 调用中引用。

### LiteLLM Python SDK

```python showLineNumbers title="上传、使用、查询与删除文件"
import litellm
import os

# Set API key
os.environ["MANUS_API_KEY"] = "your-manus-api-key"

# Upload file
file_content = b"This is a document for analysis."
created_file = await litellm.acreate_file(
    file=("document.txt", file_content),
    purpose="assistants",
    custom_llm_provider="manus",
)
print(f"Uploaded file: {created_file.id}")

# Use file with Responses API
response = await litellm.aresponses(
    model="manus/manus-1.6",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Summarize this document."},
                {"type": "input_file", "file_id": created_file.id},
            ],
        },
    ],
    extra_body={"task_mode": "agent", "agent_profile": "manus-1.6-agent"},
)
print(f"Response: {response.id}")

# Retrieve file
retrieved_file = await litellm.afile_retrieve(
    file_id=created_file.id,
    custom_llm_provider="manus",
)
print(f"File details: {retrieved_file.filename}, {retrieved_file.bytes} bytes")

# Delete file
deleted_file = await litellm.afile_delete(
    file_id=created_file.id,
    custom_llm_provider="manus",
)
print(f"Deleted: {deleted_file.deleted}")
```

### LiteLLM AI 网关

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="上传文件"
# Upload file
curl -X POST http://localhost:4000/v1/files \
  -H "Authorization: Bearer your-proxy-key" \
  -F "file=@document.txt" \
  -F "purpose=assistants" \
  -F "custom_llm_provider=manus"

# Response
{
  "id": "file_abc123",
  "object": "file",
  "bytes": 1024,
  "created_at": 1234567890,
  "filename": "document.txt",
  "purpose": "assistants",
  "status": "uploaded"
}
```

```bash showLineNumbers title="在 Responses API 中使用文件"
# Create response with file
curl -X POST http://localhost:4000/responses \
  -H "Authorization: Bearer your-proxy-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "manus-agent",
    "input": [
      {
        "role": "user",
        "content": [
          {"type": "input_text", "text": "Summarize this document."},
          {"type": "input_file", "file_id": "file_abc123"}
        ]
      }
    ]
  }'
```

```bash showLineNumbers title="查询文件"
# Get file details
curl http://localhost:4000/v1/files/file_abc123 \
  -H "Authorization: Bearer your-proxy-key"

# Response
{
  "id": "file_abc123",
  "object": "file",
  "bytes": 1024,
  "created_at": 1234567890,
  "filename": "document.txt",
  "purpose": "assistants",
  "status": "uploaded"
}
```

```bash showLineNumbers title="删除文件"
# Delete file
curl -X DELETE http://localhost:4000/v1/files/file_abc123 \
  -H "Authorization: Bearer your-proxy-key"

# Response
{
  "id": "file_abc123",
  "object": "file",
  "deleted": true
}
```

</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python showLineNumbers title="上传、使用、查询与删除文件"
import openai

client = openai.OpenAI(
    base_url="http://localhost:4000",
    api_key="your-proxy-key"
)

# Upload file
with open("document.txt", "rb") as f:
    created_file = client.files.create(
        file=f,
        purpose="assistants",
        extra_body={"custom_llm_provider": "manus"}
    )
print(f"Uploaded file: {created_file.id}")

# Use file with Responses API
response = client.responses.create(
    model="manus-agent",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Summarize this document."},
                {"type": "input_file", "file_id": created_file.id}
            ]
        }
    ]
)
print(f"Response: {response.id}")

# Retrieve file
retrieved_file = client.files.retrieve(created_file.id)
print(f"File: {retrieved_file.filename}, {retrieved_file.bytes} bytes")

# Delete file
deleted_file = client.files.delete(created_file.id)
print(f"Deleted: {deleted_file.deleted}")
```

</TabItem>
</Tabs>

## 相关文档

- [LiteLLM Responses API](/docs/response_api)
- [LiteLLM Files API](/docs/proxy/litellm_managed_files)
- [Manus OpenAI 兼容性](https://open.manus.im/docs/openai-compatibility)
