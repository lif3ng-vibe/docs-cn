---
id: container_files
title: /containers/files
---

# 容器文件 API

管理 Code Interpreter 容器内的文件。当 code interpreter 生成输出（图表、CSV、图片等）时，这些文件会自动创建。

:::tip
想了解 Code Interpreter 的用法？参见 [Code Interpreter 指南](/docs/guides/code_interpreter)。
:::

| 功能 | 是否支持 |
|---------|-----------|
| 成本追踪 | ✅ |
| 日志 | ✅ |
| 支持的提供商 | `openai`, `azure` |

## 端点

| 端点 | 方法 | 说明 |
|----------|--------|-------------|
| `/v1/containers/{container_id}/files` | POST | 上传文件到容器 |
| `/v1/containers/{container_id}/files` | GET | 列出容器中的文件 |
| `/v1/containers/{container_id}/files/{file_id}` | GET | 获取文件元数据 |
| `/v1/containers/{container_id}/files/{file_id}/content` | GET | 下载文件内容 |
| `/v1/containers/{container_id}/files/{file_id}` | DELETE | 删除文件 |

## LiteLLM Python SDK

### 上传容器文件

把文件直接上传到容器会话。当 `/chat/completions` 或 `/responses` 会向容器发送文件、但输入文件类型仅限 PDF 时，这个端点很有用；借助它，你可以处理 CSV、Excel、Python 脚本等其他文件类型。

```python showLineNumbers title="upload_container_file.py"
from litellm import upload_container_file

# Upload a CSV file
file = upload_container_file(
    container_id="cntr_123...",
    file=("data.csv", open("data.csv", "rb").read(), "text/csv"),
    custom_llm_provider="openai"
)

print(f"Uploaded: {file.id}")
print(f"Path: {file.path}")
```

**异步：**

```python showLineNumbers title="aupload_container_file.py"
from litellm import aupload_container_file

file = await aupload_container_file(
    container_id="cntr_123...",
    file=("script.py", b"print('hello world')", "text/x-python"),
    custom_llm_provider="openai"
)
```

**支持的文件格式：**
- CSV（`.csv`）
- Excel（`.xlsx`）
- Python 脚本（`.py`）
- JSON（`.json`）
- Markdown（`.md`）
- 文本文件（`.txt`）
- 以及更多……

### 列出容器文件

```python showLineNumbers title="list_container_files.py"
from litellm import list_container_files

files = list_container_files(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

for file in files.data:
    print(f"  - {file.id}: {file.filename}")
```

**异步：**

```python showLineNumbers title="alist_container_files.py"
from litellm import alist_container_files

files = await alist_container_files(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)
```

### 获取容器文件

```python showLineNumbers title="retrieve_container_file.py"
from litellm import retrieve_container_file

file = retrieve_container_file(
    container_id="cntr_123...",
    file_id="cfile_456...",
    custom_llm_provider="openai"
)

print(f"File: {file.filename}")
print(f"Size: {file.bytes} bytes")
```

### 下载文件内容

```python showLineNumbers title="retrieve_container_file_content.py"
from litellm import retrieve_container_file_content

content = retrieve_container_file_content(
    container_id="cntr_123...",
    file_id="cfile_456...",
    custom_llm_provider="openai"
)

# content is raw bytes
with open("output.png", "wb") as f:
    f.write(content)
```

### 删除容器文件

```python showLineNumbers title="delete_container_file.py"
from litellm import delete_container_file

result = delete_container_file(
    container_id="cntr_123...",
    file_id="cfile_456...",
    custom_llm_provider="openai"
)

print(f"Deleted: {result.deleted}")
```

## LiteLLM AI 网关（Proxy）

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### 上传文件

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="upload_file.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

file = client.containers.files.create(
    container_id="cntr_123...",
    file=open("data.csv", "rb")
)

print(f"Uploaded: {file.id}")
print(f"Path: {file.path}")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="upload_file.sh"
curl "http://localhost:4000/v1/containers/cntr_123.../files" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -F file="@data.csv"
```

</TabItem>
</Tabs>

### 列出文件

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="list_files.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

files = client.containers.files.list(
    container_id="cntr_123..."
)

for file in files.data:
    print(f"  - {file.id}: {file.filename}")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="list_files.sh"
curl "http://localhost:4000/v1/containers/cntr_123.../files" \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
</Tabs>

### 获取文件元数据

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="retrieve_file.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

file = client.containers.files.retrieve(
    container_id="cntr_123...",
    file_id="cfile_456..."
)

print(f"File: {file.filename}")
print(f"Size: {file.bytes} bytes")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="retrieve_file.sh"
curl "http://localhost:4000/v1/containers/cntr_123.../files/cfile_456..." \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
</Tabs>

### 下载文件内容

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="download_content.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

content = client.containers.files.content(
    container_id="cntr_123...",
    file_id="cfile_456..."
)

with open("output.png", "wb") as f:
    f.write(content.read())
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="download_content.sh"
curl "http://localhost:4000/v1/containers/cntr_123.../files/cfile_456.../content" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    --output downloaded_file.png
```

</TabItem>
</Tabs>

### 删除文件

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="delete_file.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

result = client.containers.files.delete(
    container_id="cntr_123...",
    file_id="cfile_456..."
)

print(f"Deleted: {result.deleted}")
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="delete_file.sh"
curl -X DELETE "http://localhost:4000/v1/containers/cntr_123.../files/cfile_456..." \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
</Tabs>

## 参数

### 上传文件

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `container_id` | string | 是 | 容器 ID |
| `file` | FileTypes | 是 | 要上传的文件。可以是 (filename, content, content_type) 元组、文件对象或字节数据 |

### 列出文件

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `container_id` | string | 是 | 容器 ID |
| `after` | string | 否 | 分页游标 |
| `limit` | integer | 否 | 返回的条目数（1-100，默认 20） |
| `order` | string | 否 | 排序顺序：`asc` 或 `desc` |

### 获取/删除文件

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `container_id` | string | 是 | 容器 ID |
| `file_id` | string | 是 | 文件 ID |

## 响应对象

### ContainerFileObject

```json showLineNumbers title="ContainerFileObject"
{
  "id": "cfile_456...",
  "object": "container.file",
  "container_id": "cntr_123...",
  "bytes": 12345,
  "created_at": 1234567890,
  "filename": "chart.png",
  "path": "/mnt/data/chart.png",
  "source": "code_interpreter"
}
```

### ContainerFileListResponse

```json showLineNumbers title="ContainerFileListResponse"
{
  "object": "list",
  "data": [...],
  "first_id": "cfile_456...",
  "last_id": "cfile_789...",
  "has_more": false
}
```

### DeleteContainerFileResponse

```json showLineNumbers title="DeleteContainerFileResponse"
{
  "id": "cfile_456...",
  "object": "container.file.deleted",
  "deleted": true
}
```

## 支持的提供商

| 提供商 | 状态 |
|----------|--------|
| OpenAI | ✅ 已支持 |
| Azure OpenAI | ✅ 已支持 |

对于 Azure，在 SDK 中传入 `custom_llm_provider="azure"` 并提供 `api_base` 与 `api_key`，或向代理发送 `custom-llm-provider: azure`。在代理上以某个 Azure 部署的 `model` 创建容器时，返回的 ID 会把该容器的文件调用路由到对应的部署。

## 相关链接

- [Containers API](/docs/containers) - 管理容器
- [Code Interpreter 指南](/docs/guides/code_interpreter) - 在 LiteLLM 中使用 Code Interpreter
