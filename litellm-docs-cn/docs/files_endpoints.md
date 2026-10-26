
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';

# 提供商 Files 端点

Files 用于上传文档，供 Assistants（助手）、微调（fine-tuning）、Batch API 等功能使用。

可用它以 OpenAI 格式直接调用提供商的 `/files` 端点。

## 快速上手

- 上传文件
- 列出文件
- 获取文件信息
- 删除文件
- 获取文件内容

## 多账户支持（多个 OpenAI 密钥）

通过指定 `model` 参数引用 `model_list` 中的条目，可以让文件与批处理使用不同的 OpenAI API 密钥。这种方式**无需数据库**即可工作，并允许你把文件/批处理路由到不同的 OpenAI 账户。

### 工作原理

1. 在 `model_list` 中定义使用不同 API 密钥的模型
2. 创建文件时传入 `model` 参数
3. LiteLLM 返回包含路由信息的编码 ID
4. 后续所有操作（查询、删除、批处理）都使用编码 ID
5. 无需再次指定模型，路由信息已编码在 ID 中

### 配置

```yaml
model_list:
  # litellm OpenAI Account
  - model_name: "gpt-4o-litellm"
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_LITELLM_API_KEY
  
  # Free OpenAI Account
  - model_name: "gpt-4o-free"
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_FREE_API_KEY
```

### 使用示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM proxy key
    base_url="http://0.0.0.0:4000"
)

# Create file using litellm account
file_response = client.files.create(
    file=open("batch_data.jsonl", "rb"),
    purpose="batch",
    extra_body={"model": "gpt-4o-litellm"}  # Routes to litellm key
)
print(f"File ID: {file_response.id}")
# Returns encoded ID like: file-bGl0ZWxsbTpmaWxlLWFiYzEyMzttb2RlbCxncHQtNG8taWZvb2Q

# Create batch using the encoded file ID
# No need to specify model again - it's embedded in the file ID
batch_response = client.batches.create(
    input_file_id=file_response.id,  # Encoded ID
    endpoint="/v1/chat/completions",
    completion_window="24h"
)
print(f"Batch ID: {batch_response.id}")
# Returns encoded batch ID with routing info

# Retrieve batch - routing happens automatically
batch_status = client.batches.retrieve(batch_response.id)
print(f"Status: {batch_status.status}")

# List files for a specific account
files = client.files.list(
    extra_body={"model": "gpt-4o-free"}  # List free files
)

# List batches for a specific account
batches = client.batches.list(
    extra_query={"model": "gpt-4o-litellm"}  # List litellm batches
)
```

### 参数选项

你可以通过以下方式传入 `model` 参数：
- **请求体**：`extra_body={"model": "gpt-4o-litellm"}`
- **查询参数**：`?model=gpt-4o-litellm`
- **请求头**：`x-litellm-model: gpt-4o-litellm`

### 编码 ID 的工作方式

- 带着 `model` 参数创建文件/批处理时，LiteLLM 会把模型名编码进返回的 ID
- 编码 ID 采用 base64 编码，形如 `file-bGl0ZWxsbTpmaWxlLWFiYzEyMzttb2RlbCxncHQtNG8taWZvb2Q`
- 在后续操作（查询、删除、创建批处理）中使用该 ID 时，LiteLLM 会自动：
  1. 解码该 ID
  2. 提取模型名
  3. 查找对应凭据
  4. 把请求路由到正确的 OpenAI 账户
- 原始的提供商文件/批处理 ID 会在内部保留

### 优势

✅ **无需数据库**：所有路由信息都存储在 ID 中  
✅ **无状态**：代理重启后依然有效  
✅ **简单**：像往常一样传递 ID 即可  
✅ **向后兼容**：现有的 `custom_llm_provider` 与 `files_settings` 仍然可用  
✅ **面向未来**：与托管批处理（managed batches）方案保持一致

### 从 files_settings 迁移

**旧方式**（仍然可用）：
```yaml
files_settings:
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_KEY
```

```python
# Had to specify provider on every call
client.files.create(..., extra_headers={"custom-llm-provider": "openai"})
client.files.retrieve(file_id, extra_headers={"custom-llm-provider": "openai"})
```

**新方式**（推荐）：
```yaml
model_list:
  - model_name: "gpt-4o-account1"
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_KEY
```

```python
# Specify model once on create
file = client.files.create(..., extra_body={"model": "gpt-4o-account1"})

# Then just use the ID - routing is automatic
client.files.retrieve(file.id)  # No need to specify account
client.batches.create(input_file_id=file.id)  # Routes correctly
```

<Tabs>
<TabItem value="proxy" label="LiteLLM 代理服务器">

1. 配置 config.yaml

```
# for /files endpoints
files_settings:
  - custom_llm_provider: azure
    api_base: https://exampleopenaiendpoint-production.up.railway.app
    api_key: fake-key
    api_version: "2023-03-15-preview"
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_API_KEY
```

2. 启动 LiteLLM 代理服务器

```bash
litellm --config /path/to/config.yaml

## RUNNING on http://0.0.0.0:4000
```

3. 使用 OpenAI 的 /files 端点

上传文件

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

client.files.create(
    file=wav_data,
    purpose="user_data",
    extra_headers={"custom-llm-provider": "openai"}
)
```

列出文件

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

files = client.files.list(extra_headers={"custom-llm-provider": "openai"})
print("files=", files)
```

获取文件信息

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

file = client.files.retrieve(file_id="file-abc123", extra_headers={"custom-llm-provider": "openai"})
print("file=", file)
```

删除文件

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

response = client.files.delete(file_id="file-abc123", extra_headers={"custom-llm-provider": "openai"})
print("delete response=", response)
```

获取文件内容

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

content = client.files.content(file_id="file-abc123", extra_headers={"custom-llm-provider": "openai"})
print("content=", content)
```

</TabItem>
<TabItem value="sdk" label="SDK">

**上传文件**
```python
import litellm
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

file_obj = await litellm.acreate_file(
    file=open("mydata.jsonl", "rb"),
    purpose="fine-tune",
    custom_llm_provider="openai",
)
print("Response from creating file=", file_obj)
```

**列出文件**
```python
files = await litellm.afile_list(
    custom_llm_provider="openai",
    limit=10
)
print("files=", files)
```

**获取文件信息**
```python
file = await litellm.afile_retrieve(
    file_id="file-abc123",
    custom_llm_provider="openai"
)
print("file=", file)
```

**删除文件**
```python
response = await litellm.afile_delete(
    file_id="file-abc123",
    custom_llm_provider="openai"
)
print("delete response=", response)
```

**获取文件内容**
```python
content = await litellm.afile_content(
    file_id="file-abc123",
    custom_llm_provider="openai"
)
print("file content=", content)
```

**获取文件内容**（Bedrock）
```python
# For Bedrock batch output files stored in S3
content = await litellm.afile_content(
    file_id="s3://bucket-name/path/to/file.jsonl",  # S3 URI or unified file ID
    custom_llm_provider="bedrock",
    aws_region_name="us-west-2"
)
print("file content=", content.text)
```

</TabItem>
</Tabs>


## **支持的提供商**：

### [OpenAI](#快速上手)

### [Azure OpenAI](./providers/azure#azure-batches-api)

### [Vertex AI](/docs/providers/vertex_batch)

### [Bedrock](./providers/bedrock_batches#4-获取批处理结果)

### [Anthropic](./providers/anthropic#files-api)

:::note
Anthropic Files API 的用途与 OpenAI 不同。它并非用于批处理或微调，而是让你上传一次文件后，在多条消息中通过 `file_id` 引用，避免重复上传。Files API 操作本身免费；在 Messages 请求中使用的文件内容则按输入 Token 计价。
:::

## [Swagger API 参考](https://docs.litellm.ai/api-reference/#/files)
