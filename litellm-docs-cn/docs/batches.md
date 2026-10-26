import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /batches

涵盖 Batches 与 Files 两类接口。

| 功能 | 是否支持 | 说明 |
|-------|-------|-------|
| 支持的提供商 | OpenAI、Azure、Vertex、Bedrock、Mistral、vLLM、xAI | - |
| ✨ 成本追踪（cost tracking） | ✅ | 仅 LiteLLM 企业版 |
| 日志（logging） | ✅ | 适用于所有日志集成 |

代理上配置的防护栏（guardrails）会在批处理输入文件上传时，应用到文件内的每条记录。参见 [Batch API 防护栏](./proxy/guardrails/batch_guardrails)

## 快速上手

- 创建用于批处理补全的文件

- 创建批处理请求

- 列出批处理任务

- 获取指定批处理任务与文件内容

**创建批处理输入文件**

每一行就是 [OpenAI 批处理文件格式](https://platform.openai.com/docs/guides/batch) 中的一个请求。每行都必须包含 `custom_id`、`method`、`url` 和 `body`：

```json showLineNumbers title="mydata.jsonl"
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o", "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello world!"}], "max_tokens": 1000}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o", "messages": [{"role": "system", "content": "You are an unhelpful assistant."}, {"role": "user", "content": "Hello world!"}], "max_tokens": 1000}}
```

<Tabs>
<TabItem value="proxy" label="LiteLLM 代理服务器">

**配置 config.yaml 并启动代理**

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

```bash
$ export OPENAI_API_KEY="sk-..."

$ litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

**创建用于批处理补全的文件**

```shell
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -F purpose="batch" \
    -F file="@mydata.jsonl"
```

**创建批处理请求**

```bash
curl http://localhost:4000/v1/batches \
        -H "Authorization: Bearer $LITELLM_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "input_file_id": "file-abc123",
            "endpoint": "/v1/chat/completions",
            "completion_window": "24h"
    }'
```

**获取指定批处理任务**

```bash
curl http://localhost:4000/v1/batches/batch_abc123 \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
```


**列出批处理任务**

```bash
curl http://localhost:4000/v1/batches \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
```

</TabItem>
<TabItem value="sdk" label="SDK">

**创建用于批处理补全的文件**

```python
import litellm
import os
import asyncio

os.environ["OPENAI_API_KEY"] = "sk-.."

file_name = "mydata.jsonl"
_current_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(_current_dir, file_name)
file_obj = await litellm.acreate_file(
    file=open(file_path, "rb"),
    purpose="batch",
    custom_llm_provider="openai",
)
print("Response from creating file=", file_obj)
```

**创建批处理请求**

```python
import litellm
import os
import asyncio

create_batch_response = await litellm.acreate_batch(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id=batch_input_file_id,
    custom_llm_provider="openai",
    metadata={"key1": "value1", "key2": "value2"},
)

print("response from litellm.create_batch=", create_batch_response)
```

**获取指定批处理任务与文件内容**

```python
# Maximum wait time before we give up
MAX_WAIT_TIME = 300  

# Time to wait between each status check
POLL_INTERVAL = 5

#Time waited till now 
waited = 0

# Wait for the batch to finish processing before trying to retrieve output
# This loop checks the batch status every few seconds (polling)

while True:
    retrieved_batch = await litellm.aretrieve_batch(
        batch_id=create_batch_response.id,
        custom_llm_provider="openai"
    )
    
    status = retrieved_batch.status
    print(f"⏳ Batch status: {status}")
    
    if status == "completed" and retrieved_batch.output_file_id:
        print("✅ Batch complete. Output file ID:", retrieved_batch.output_file_id)
        break
    elif status in ["failed", "cancelled", "expired"]:
        raise RuntimeError(f"❌ Batch failed with status: {status}")
    
    await asyncio.sleep(POLL_INTERVAL)
    waited += POLL_INTERVAL
    if waited > MAX_WAIT_TIME:
        raise TimeoutError("❌ Timed out waiting for batch to complete.")

print("retrieved batch=", retrieved_batch)
# just assert that we retrieved a non None batch

assert retrieved_batch.id == create_batch_response.id

# try to get file content for our original file

file_content = await litellm.afile_content(
    file_id=batch_input_file_id, custom_llm_provider="openai"
)

print("file content = ", file_content)
```

**列出批处理任务**

```python
list_batches_response = litellm.list_batches(custom_llm_provider="openai", limit=2)
print("list_batches_response=", list_batches_response)
```

</TabItem>

</Tabs>


## 多账户/基于模型的路由

借助 `config.yaml` 中按模型配置的凭据，可以把批处理操作路由到不同的提供商（provider）账户。这样既免去了环境变量，也让多租户批处理成为可能。

### 工作原理

**优先级顺序**：
1. **编码后的 Batch/File ID**（最高）：模型信息直接嵌在 ID 内
2. **模型参数**：通过请求头（`x-litellm-model`）、查询参数或请求体传入
3. **自定义提供商**（回退）：使用环境变量

### 配置

```yaml
model_list:
  - model_name: gpt-4o-account-1
    litellm_params:
      model: openai/{{openai_large}}
      api_key: sk-account-1-key
      api_base: https://api.openai.com/v1
  
  - model_name: gpt-4o-account-2
    litellm_params:
      model: openai/{{openai_large}}
      api_key: sk-account-2-key
      api_base: https://api.openai.com/v1
  
  - model_name: azure-batches
    litellm_params:
      model: azure/{{openai_large}}
      api_key: azure-key-123
      api_base: https://my-resource.openai.azure.com
      api_version: "2024-02-01"
```

### 用法示例

#### 场景 1：文件 ID 中编码了模型信息

上传文件时若带有模型参数，LiteLLM 会把模型信息编码进文件 ID，后续所有操作都会自动使用对应的凭据。

```bash
# 第 1 步：上传文件并指定模型
curl http://localhost:4000/v1/files \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "x-litellm-model: gpt-4o-account-1" \
  -F purpose="batch" \
  -F file="@batch.jsonl"

# 响应中包含编码后的文件 ID：
# {
#   "id": "file-bGl0ZWxsbTpmaWxlLUxkaUwzaVYxNGZRVlpYcU5KVEdkSjk7bW9kZWwsZ3B0LTRvLWFjY291bnQtMQ",
#   ...
# }

# 第 2 步：创建批处理，自动路由到 gpt-4o-account-1
curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-bGl0ZWxsbTpmaWxlLUxkaUwzaVYxNGZRVlpYcU5KVEdkSjk7bW9kZWwsZ3B0LTRvLWFjY291bnQtMQ",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'

# 批处理 ID 同样编码了模型信息：
# {
#   "id": "batch_bGl0ZWxsbTpiYXRjaF82OTIwM2IzNjg0MDQ4MTkwYTA3ODQ5NDY3YTFjMDJkYTttb2RlbCxncHQtNG8tYWNjb3VudC0x",
#   "input_file_id": "file-bGl0ZWxsbTpmaWxlLUxkaUwzaVYxNGZRVlpYcU5KVEdkSjk7bW9kZWwsZ3B0LTRvLWFjY291bnQtMQ",
#   ...
# }

# 第 3 步：获取批处理，自动路由到 gpt-4o-account-1
curl http://localhost:4000/v1/batches/batch_bGl0ZWxsbTpiYXRjaF82OTIwM2IzNjg0MDQ4MTkwYTA3ODQ5NDY3YTFjMDJkYTttb2RlbCxncHQtNG8tYWNjb3VudC0x \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**✅ 优势**：
- 无需在每次请求中都指定模型
- 文件与批处理 ID 会“记住”自己由哪个账户创建
- 获取、取消、读取文件内容等操作都会自动路由

#### 场景 2：通过请求头或查询参数指定模型

为每个请求单独指定模型，而不把模型编码进 ID。

```bash
# 通过模型请求头创建批处理
curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "x-litellm-model: gpt-4o-account-2" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'

# 或使用查询参数
curl "http://localhost:4000/v1/batches?model=gpt-4o-account-2" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'

# 列出指定模型的批处理
curl "http://localhost:4000/v1/batches?model=gpt-4o-account-2" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**✅ 适用场景**：
- 一次性的批处理操作
- 不同操作使用不同模型
- 对路由的显式控制

#### 场景 3：环境变量（回退）

未指定模型时的传统做法：使用环境变量。

```bash
export OPENAI_API_KEY="sk-env-key"

curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

**✅ 适用场景**：
- 向后兼容
- 简单的单账户配置
- 快速原型验证

### 完整的多账户示例

```bash
# 上传文件到账户 1
FILE_1=$(curl -s http://localhost:4000/v1/files \
  -H "x-litellm-model: gpt-4o-account-1" \
  -F purpose="batch" \
  -F file="@batch1.jsonl" | jq -r '.id')

# 上传文件到账户 2
FILE_2=$(curl -s http://localhost:4000/v1/files \
  -H "x-litellm-model: gpt-4o-account-2" \
  -F purpose="batch" \
  -F file="@batch2.jsonl" | jq -r '.id')

# 在账户 1 上创建批处理（由编码文件 ID 自动路由）
BATCH_1=$(curl -s http://localhost:4000/v1/batches \
  -d "{\"input_file_id\": \"$FILE_1\", \"endpoint\": \"/v1/chat/completions\", \"completion_window\": \"24h\"}" | jq -r '.id')

# 在账户 2 上创建批处理（由编码文件 ID 自动路由）
BATCH_2=$(curl -s http://localhost:4000/v1/batches \
  -d "{\"input_file_id\": \"$FILE_2\", \"endpoint\": \"/v1/chat/completions\", \"completion_window\": \"24h\"}" | jq -r '.id')

# 获取两个批处理（自动路由到正确的账户）
curl http://localhost:4000/v1/batches/$BATCH_1
curl http://localhost:4000/v1/batches/$BATCH_2

# 按账户列出批处理
curl "http://localhost:4000/v1/batches?model=gpt-4o-account-1"
curl "http://localhost:4000/v1/batches?model=gpt-4o-account-2"
```

### SDK 中使用模型路由

```python
import litellm
import asyncio

# Upload file with model routing
file_obj = await litellm.acreate_file(
    file=open("batch.jsonl", "rb"),
    purpose="batch",
    model="gpt-4o-account-1",  # Route to specific account
)

print(f"File ID: {file_obj.id}")
# File ID is encoded with model info

# Create batch - automatically uses gpt-4o-account-1 credentials
batch = await litellm.acreate_batch(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id=file_obj.id,  # Model info embedded in ID
)

print(f"Batch ID: {batch.id}")
# Batch ID is also encoded

# Retrieve batch - automatically routes to correct account
retrieved = await litellm.aretrieve_batch(
    batch_id=batch.id,  # Model info embedded in ID
)

print(f"Batch status: {retrieved.status}")

# Or explicitly specify model
batch2 = await litellm.acreate_batch(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id="file-regular-id",
    model="gpt-4o-account-2",  # Explicit routing
)
```

### ID 编码的工作方式

LiteLLM 使用 base64 把模型信息编码进文件与批处理 ID：

```
Original:  file-abc123
Encoded:   file-bGl0ZWxsbTpmaWxlLWFiYzEyMzttb2RlbCxncHQtNG8tdGVzdA
           └─┬─┘ └──────────────────┬──────────────────────┘
          prefix      base64(litellm:file-abc123;model,gpt-4o-test)

Original:  batch_xyz789
Encoded:   batch_bGl0ZWxsbTpiYXRjaF94eXo3ODk7bW9kZWwsZ3B0LTRvLXRlc3Q
           └──┬──┘ └──────────────────┬──────────────────────┘
           prefix       base64(litellm:batch_xyz789;model,gpt-4o-test)
```

这种编码：
- ✅ 保留 OpenAI 兼容的前缀（`file-`、`batch_`）
- ✅ 对客户端完全透明
- ✅ 无需额外参数即可实现自动路由
- ✅ 适用于所有批处理与文件端点

### 支持的端点

所有批处理与文件端点都支持基于模型的路由：

| 端点 | Method | 模型路由 |
|----------|--------|---------------|
| `/v1/files` | POST | ✅ 通过请求头/查询参数/请求体 |
| `/v1/files/{file_id}` | GET | ✅ 由编码 ID 自动识别，并结合请求头/查询参数 |
| `/v1/files/{file_id}/content` | GET | ✅ 由编码 ID 自动识别，并结合请求头/查询参数 |
| `/v1/files/{file_id}` | DELETE | ✅ 由编码 ID 自动识别 |
| `/v1/batches` | POST | ✅ 由文件 ID 自动识别，并结合请求头/查询参数/请求体 |
| `/v1/batches` | GET | ✅ 通过请求头/查询参数 |
| `/v1/batches/{batch_id}` | GET | ✅ 由编码 ID 自动识别 |
| `/v1/batches/{batch_id}/cancel` | POST | ✅ 由编码 ID 自动识别 |

## 支持的提供商

LiteLLM 支持以下提供商原生的批处理 API：

| 提供商 | 文档 |
| --- | --- |
| Azure OpenAI | [Azure OpenAI 批处理](./providers/azure#azure-batches-api) |
| OpenAI | [快速上手](#快速上手) |
| Google Vertex AI | [Vertex AI 批处理 API](/docs/providers/vertex_batch) |
| Amazon Bedrock | [Amazon Bedrock 批处理推理](./providers/bedrock_batches) |
| Mistral AI | [Mistral AI Batch API](./providers/mistral_batches) |
| vLLM | [vLLM 批处理](./providers/vllm_batches)，当服务器未提供 Files API 时由 LiteLLM 代为运行 |
| xAI | [xAI Batch API](./providers/xai_batches) |

Amazon Bedrock 是 AWS 上受支持的批处理推理集成。

## 批处理输入文件校验

LiteLLM 会在上传时校验批处理输入文件。客户端通过 `POST /v1/files` 上传 `purpose="batch"` 的文件时，LiteLLM 会先在本地检查文件，把无效文件直接拦下，不会转发给提供商。校验覆盖 `/v1/files` 的所有路由路径，包括通过 `files_settings` 配置的提供商路由上传，以及使用 `target_model_names` 的 [LiteLLM 托管文件](./proxy/managed_batches) 上传。

拒绝响应采用 OpenAI 错误格式，即包含 `message`、`type`、`param`、`code` 字段的 `error` 对象，因此现有的 OpenAI SDK 错误处理逻辑无需改动即可继续工作。

### 限制批处理输入文件大小

在 `general_settings` 下设置 `max_batch_file_size_mb`，即可限制批处理输入文件的大小。取值为整数，单位 MB。未设置时不限制大小。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  max_batch_file_size_mb: 10
```

超过上限的 `purpose="batch"` 上传会被拒绝，返回 HTTP `413`：

```json
{
  "error": {
    "message": "Batch input file is 12.0 MB, which exceeds the configured max_batch_file_size_mb of 10 MB. The file was not forwarded to the provider.",
    "type": "invalid_request_error",
    "param": "file",
    "code": "413"
  }
}
```

`max_batch_file_size_mb` 只作用于批处理输入文件上传，与作用于所有代理路由的 `max_request_size_mb` 相互独立。

### 限制批处理文件中的记录数

在 `general_settings` 下设置 `max_batch_file_records`，即可限制一个批处理输入文件最多能包含多少请求行。空行不计入。未设置时不限制记录数。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  max_batch_file_records: 1000
```

记录数超过上限的 `purpose="batch"` 上传会被拒绝并返回 HTTP `413`，文件不会转发给提供商：

```json
{
  "error": {
    "message": "Batch input file has more than 1000 records, which exceeds the max_batch_file_records of 1000 set in general_settings. The file was not forwarded to the provider.",
    "type": "invalid_request_error",
    "param": "file",
    "code": "413"
  }
}
```

`general_settings` 中的值对所有密钥生效。代理管理员可以在某个密钥的 metadata 中设置 `max_batch_file_records`，为该密钥单独指定上限；也可以在团队的 metadata 中为整个团队设置上限。密钥与其所属团队都有上限时，取两者中较小的那个，报错信息会注明上限是在哪里设置的。

### 内容校验

LiteLLM 总是会校验 `purpose="batch"` 上传文件的内容，这一行为没有开关可配置。文件名必须以 `.jsonl` 结尾（不区分大小写）；文件至少要包含一个非空行；每个非空行都必须是合法 JSON；每一行都必须是 JSON 对象；每个对象都必须包含 `custom_id`、`method`、`url`、`body` 这几个键。

任何一项检查未通过的文件都会被拒绝，返回 HTTP `400` 和 `"type": "invalid_request_error"`。`param` 字段指出问题所在：扩展名错误、文件为空、某行不是合法 JSON、某行不是 JSON 对象时，`param` 为 `file`；某行缺少必需键时，`param` 就是缺失的那个键，例如 `method`。`message` 会在相关时给出行号（从 1 开始计），行号统计文件中的所有行，包括空行。

### 各提供商的批处理限制

每个提供商对批处理输入文件都有自己的限制，可以据此为 `max_batch_file_size_mb` 选择合适的取值。

| 提供商 | 输入文件大小上限 | 请求上限 |
|----------|---------------------|--------------|
| [OpenAI](https://developers.openai.com/api/docs/guides/batch) | 200 MB | 每个批处理 50,000 条 |
| [Azure OpenAI](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/batch) | 200 MB | 每个文件 100,000 条 |
| [Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/batch-prediction-gemini) | 1 GB | 每个作业 200,000 条 |
| [Amazon Bedrock](https://docs.aws.amazon.com/general/latest/gr/bedrock.html) | 每个文件 1 GB | 参见 AWS Service Quotas |

Azure OpenAI 允许自带 Blob Storage，此时文件上限可提升到 1 GB。Vertex AI 的上限针对 Cloud Storage 输入。Amazon Bedrock 还限制作业总大小，大多数模型为 5 GB。请把 `max_batch_file_size_mb` 设置为不超过批处理流量所路由到的提供商中最小的那个限制。

## 批处理上传与下载限制

有两个设置分别限制调用方上传批处理输入文件和下载文件内容的频率。两者默认关闭，需显式设置才生效。

| 设置 | 统计对象 | 时间窗口 |
| --- | --- | --- |
| `max_batch_file_uploads_per_day` | 带 `purpose="batch"` 的 `POST /v1/files` 上传 | UTC 日 |
| `max_file_downloads_per_minute` | 针对单个文件的 `GET /v1/files/{file_id}/content` 调用 | 1 分钟 |

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  max_batch_file_uploads_per_day: 50
  max_file_downloads_per_minute: 10
```

超过任一上限的请求会被拒绝，返回 HTTP `429` 和 `Retry-After` 响应头，指明距离窗口重置还有多少秒。上传窗口在 UTC 00:00 重置。报错信息会列出限流项、取值及其设置位置：

```json
{
  "error": {
    "message": "Download limit reached for file file-abc123: max_file_downloads_per_minute is 10 for this key (set in general_settings). Retry in 18 seconds.",
    "type": "rate_limit_error",
    "param": null,
    "code": "429"
  }
}
```

下载限制按文件分别计数，某个文件触发上限后，调用方仍可下载其他文件。该限制覆盖所有文件 ID，无论是批处理输入文件、输出文件还是错误文件。

### 按密钥或团队设置限制

`general_settings` 中的值是默认上限，每个密钥各自单独计数。不带虚拟密钥（virtual key）的 JWT 调用方则按其用户 ID 计数。代理管理员可以在某个密钥的 metadata 中设置同名项来修改该密钥的上限，这一设置会替换该密钥的默认值：

```bash
curl -X POST 'http://localhost:4000/key/update' \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"key": "sk-...", "metadata": {"max_file_downloads_per_minute": 2}}'
```

在团队 metadata 中设置同名项，则会新增一条由该团队所有密钥共享的限制。两者同时存在时，请求必须同时满足两条限制；被其中一条拒绝的请求，不会占用另一条的额度。

只有代理管理员能在密钥或团队 metadata 中设置、修改或清除 `max_batch_file_records`、`max_batch_file_uploads_per_day` 和 `max_file_downloads_per_minute`，包括发送到 `POST /user/new` 的 metadata。其他角色的请求试图修改这些项时会返回 `403`。`/config/update` 会拒绝非正整数的取值。

### 哪些情况计入限制

未通过批处理输入文件校验的上传（格式错误、记录数超限、文件过大）不计入。通过校验的上传即使随后被防护栏或提供商拒绝，也计入；下载即使提供商返回错误，也计入。

配置了 Redis 时，计数在所有代理实例和 worker 之间共享。没有 Redis 时，每个 worker 进程各自计数，因此调用方实际可用量最高可达限额乘以 worker 数，且代理重启后计数会清零。每个 worker 最多保留 20,000 个活跃计数器（每个调用方每个窗口一个，下载则按文件 ID 计），超出后最接近过期的计数器会被丢弃，对应调用方会提前开始一个新窗口。

这些限制作用于上文列出的 `/v1/files` 路由，包括 `/files` 和 `/{provider}/v1/files`。提供商透传（passthrough）路由不计入。

## Batches API 限流的工作方式

批处理限流（rate limiting）在客户端调用 `POST /v1/batches` 时执行，而不是在上传输入文件时。

1. 客户端通过 `POST /v1/files` 上传 JSONL 输入文件。这一步不消耗批处理的 TPM 或 RPM 配额。
2. 客户端创建批处理时，LiteLLM 会下载并评估所引用的输入文件。
3. LiteLLM 以原子方式将完整文件与所有适用的限额逐一核对。
4. 只要会超出任一限额，LiteLLM 就返回 `429`，不把批处理提交给提供商；否则记录用量并向提供商创建批处理。

这样 LiteLLM 就能在提供商处理之前决定接受还是拒绝该批处理。

### LiteLLM 统计哪些用量

| 限额 | 批处理计费方式 |
| --- | --- |
| RPM | 每个 JSONL 记录算一次请求。 |
| TPM | 每条记录的 `body.messages`、`body.prompt` 或 `body.input` 中的输入 Token。 |
| Project ITPM | 同样的输入 Token 数，按每条记录的 `body.model` 分组。 |
| Project OTPM | 为每条记录预留输出 Token，按 `body.model` 分组。LiteLLM 会使用记录中的 `max_tokens`、`max_completion_tokens` 或 `max_output_tokens`（如存在），并把 `n` 或 `best_of` 计算在内。嵌入记录不预留输出 Token。若没有输出上限，LiteLLM 会采用 v3 限流器内置的估算值，并以适用的最小 OTPM 限额为上界。 |

如果 LiteLLM 无法对某条记录进行 Token 计数，会基于该记录序列化后的大小做保守估算。格式错误的 JSONL 行仍会计为一次请求。

:::important

`LITELLM_TPM_TOKEN_RESERVATION_ENABLED` 并不控制批处理限流。该变量控制的是对话补全等实时请求的请求前 Token 预留。`POST /v1/batches` 始终使用这里描述的批处理输入文件限流器，除非启用了下文某个批处理专用的跳过设置。

:::

### 排队 Token 限制

按分钟计的窗口与批处理天然不合拍：一个批处理会运行数小时，但它的整个输入文件在提交那一刻就全部计入某一分钟。如果想改按未完成的批处理工作量来约束批处理提交，可以在密钥或团队 metadata 中设置排队 Token 配额（enqueued-token allowance）：

```bash
curl -X POST 'http://localhost:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"metadata": {"batch_enqueued_token_limit": 100000}}'
```

`batch_enqueued_token_limit` 同样可以放在团队 metadata 里。密钥与团队都设置时，批处理必须同时满足两份配额。

只有代理管理员能设置或修改 `batch_enqueued_token_limit`。其他角色在密钥或团队请求中试图写入该项时会返回 `403`。

密钥或团队设有排队 Token 限制后，批处理提交只受这份配额约束：

1. 客户端创建批处理时，LiteLLM 会按文件的预估 Token 数（输入 Token 加上每条记录的输出上限）占用配额。
2. 如果配额装不下，LiteLLM 返回 `429` 并指明是排队 Token 限制，不把批处理提交给提供商。
3. 当 LiteLLM 返回的响应显示批处理已进入终态（completed、failed、expired 或 cancelled）时，会退还预留额度。轮询 `GET /v1/batches/{batch_id}` 或通过 `POST /v1/batches/{batch_id}/cancel` 取消，都符合退还条件。
4. 批处理提交不计入按分钟的 TPM 和 RPM 窗口，因此只要符合配额，即使记录数超过密钥的 RPM，批处理也会被接受。

对话补全等实时流量不受影响：仍然照旧消耗密钥的 TPM 和 RPM 限额。

规划时有两点需要注意：

- `disable_batch_input_file_rate_limiting` 和 `skip_batch_input_file_rate_limiting_for_providers` 优先生效。只要它们起作用，LiteLLM 就完全不做排队 Token 统计。
- 对于 LiteLLM 始终未能观察到终态的批处理（例如只直接向提供商轮询的批处理），其预留额度会在 8 天后过期。

### 运行行为

| 行为 | 运行影响 |
| --- | --- |
| 统计基于提交的文件 | 批处理 TPM 和 RPM 计数不会与提供商的最终用量对账。最终成本追踪单独进行。 |
| 完整文件无法下载或评估 | LiteLLM 记录错误并提交批处理，但不计入 TPM 或 RPM。如果你的部署（deployment）需要严格执行限流，请监控这类错误。 |
| 未配置适用的速率限制 | LiteLLM 会直接提交批处理，不为了限流统计而下载文件。 |
| API 密钥配置了模型白名单 | LiteLLM 会在提交前读取文件并校验每个 `body.model`。 |

### 跳过输入文件预读

读取较大的 JSONL 文件会给批处理提交增加延迟。如果不需要在提交时把批处理计入 TPM 或 RPM，可以配置以下任一选项：

```yaml
general_settings:
  # Apply to all batch submissions
  disable_batch_input_file_rate_limiting: true

  # Or apply only to batches routed to selected providers
  skip_batch_input_file_rate_limiting_for_providers:
    - bedrock
```

提供商专属选项使用所选路由上配置的提供商，不会采用客户端传入的 `custom_llm_provider` 值。

对于配置了模型白名单的 API 密钥，LiteLLM 仍须读取文件来校验每个 `body.model` 值。这种情况下，上述设置只跳过 TPM 和 RPM 计数更新，文件下载与模型校验照常进行。

以下选项不受支持：

- `skip_batch_input_file_rate_limiting_for_models` 仅为兼容性保留，没有任何效果。配置了它时，LiteLLM 会在启动时记录一条警告。
- 请求 metadata 中的 `skip_batch_input_file_rate_limiting` 标志会被忽略。

请在服务器层面使用上述全局或提供商专属设置来管控这一行为。

## Batches API 成本追踪的工作方式

✨ **企业版功能**：自动化批处理成本追踪需要 LiteLLM 企业版许可。

对于托管批处理，LiteLLM 会在后台监控提供商侧的作业。当作业进入终态时，LiteLLM 会：

1. 下载提供商的输出文件。
2. 逐条读取成功的输出记录。
3. 汇总这些记录的提示词、补全和总 Token 用量。
4. 按部署配置的批处理价格计算每条记录的成本。
5. 把汇总后的用量与成本记到创建该批处理的用户、密钥、团队和请求标签名下。

失败的输出记录不计入汇总。如果每条记录都失败、批处理因此没有输出文件，LiteLLM 会记录零用量与零成本。

初始提交与完成后的汇总是分开记录的。完成后的汇总通过标准的花费追踪（spend tracking）以一条 `aretrieve_batch` 记录的形式发出，因此在 Admin UI 和已配置的日志回调中都可用。

批处理成本追踪不会改动提交时预留的 TPM 或 RPM 计数，这些计数仍基于上文的输入文件计算方式。

## [Swagger API 参考](https://docs.litellm.ai/api-reference/#/batch)
