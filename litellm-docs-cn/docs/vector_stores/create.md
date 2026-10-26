import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /vector_stores - 创建向量存储

创建向量存储，用于存放和检索文档分块，适配检索增强生成（RAG）场景。

## 概览

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪 | ✅ | 对每次向量存储操作进行成本追踪 |
| 日志 | ✅ | 适用于所有集成方式 |
| 终端用户追踪 | ✅ | |
| 支持的 LLM 提供商（OpenAI `/vector_stores` API） | **OpenAI** | 完整支持各提供商的向量存储 API |
| 支持的 LLM 提供商（透传 API） | [**Azure AI**](/docs/providers/azure_ai/azure_ai_vector_stores_passthrough) | 完整支持各提供商的向量存储 API |
| 支持的 LLM 提供商（数据集管理） | [**RAGFlow**](/docs/providers/ragflow_vector_store.md) | 支持数据集的创建与管理（不支持搜索） |

代理还支持对向量存储执行 **retrieve**（查询）、**list**（列出）、**update**（更新）和 **delete**（删除）操作（兼容 OpenAI）。`curl` 示例与提供商路由详见[代理上的向量存储管理与路由](#代理上的向量存储管理与路由)。

:::info[创建与注册的区别]
`POST /v1/vector_stores`（即本页）会在提供商侧**新建**一个向量存储，仅适用于实现了 create 能力的提供商（参见[总览矩阵](./index.md#提供商支持)）。如果该向量存储在提供商侧**已经存在**（如 Bedrock Knowledge Base、Vertex AI Search 数据存储、Azure AI Search 索引等），你应该改用 `POST /vector_store/new`，将已有存储注册到 LiteLLM，之后即可通过统一 API 进行搜索。参见[托管向量存储](./managed_vector_stores.md)。
:::

## 用法

### LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="基础用法">

#### 异步示例
```python showLineNumbers title="创建向量存储 - 基础"
import litellm

response = await litellm.vector_stores.acreate(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"]
)
print(response)
```

#### 同步示例
```python showLineNumbers title="创建向量存储 - 同步"
import litellm

response = litellm.vector_stores.create(
    name="My Document Store", 
    file_ids=["file-abc123", "file-def456"]
)
print(response)
```

</TabItem>

<TabItem value="advanced" label="高级配置">

#### 设置过期时间与分块策略
```python showLineNumbers title="创建向量存储 - 高级"
import litellm

response = await litellm.vector_stores.acreate(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"],
    expires_after={
        "anchor": "last_active_at",
        "days": 7
    },
    chunking_strategy={
        "type": "static",
        "static": {
            "max_chunk_size_tokens": 800,
            "chunk_overlap_tokens": 400
        }
    },
    metadata={
        "project": "rag-system",
        "environment": "production"
    }
)
print(response)
```

</TabItem>

<TabItem value="openai-provider" label="OpenAI 提供商">

#### 显式指定 OpenAI 提供商
```python showLineNumbers title="创建向量存储 - OpenAI 提供商"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

response = await litellm.vector_stores.acreate(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"],
    custom_llm_provider="openai"
)
print(response)
```

</TabItem>
</Tabs>

### LiteLLM 代理服务器

<Tabs>
<TabItem value="proxy-setup" label="配置与使用">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  # Vector store settings can be added here if needed
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 用 OpenAI SDK 试一试！

```python showLineNumbers title="通过 LiteLLM 代理使用 OpenAI SDK"
from openai import OpenAI

# Point OpenAI SDK to LiteLLM proxy
client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM API key
)

vector_store = client.beta.vector_stores.create(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"]
)
print(vector_store)
```

</TabItem>

<TabItem value="curl-proxy" label="curl（创建）">

```bash showLineNumbers title="用 curl 创建向量存储"
curl -L -X POST 'http://0.0.0.0:4000/v1/vector_stores' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "name": "My Document Store",
  "file_ids": ["file-abc123", "file-def456"],
  "expires_after": {
    "anchor": "last_active_at", 
    "days": 7
  },
  "chunking_strategy": {
    "type": "static",
    "static": {
      "max_chunk_size_tokens": 800,
      "chunk_overlap_tokens": 400
    }
  },
  "metadata": {
    "project": "rag-system",
    "environment": "production"
  }
}'
```

</TabItem>

<TabItem value="curl-management" label="curl（查询、列出、更新、删除）">

使用与创建时相同的 base URL 和 API 密钥，并把 `vs_abc123` 替换为你的向量存储 ID。

**查询**

```bash
curl -L 'http://0.0.0.0:4000/v1/vector_stores/vs_abc123' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**列出**（可选查询参数：`after`、`before`、`limit`、`order`）

```bash
curl -L 'http://0.0.0.0:4000/v1/vector_stores?limit=20&order=desc' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**更新**（`POST` 请求，携带 JSON 请求体）

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/vector_stores/vs_abc123' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{ "name": "Renamed store", "metadata": { "env": "staging" } }'
```

**删除**

```bash
curl -L -X DELETE 'http://0.0.0.0:4000/v1/vector_stores/vs_abc123' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

提供商路由细节与 OpenAI API 参考链接详见[代理上的向量存储管理与路由](#代理上的向量存储管理与路由)。

</TabItem>
</Tabs>

### OpenAI SDK（独立使用）

<Tabs>
<TabItem value="openai-direct" label="直接调用 OpenAI">

```python showLineNumbers title="直接使用 OpenAI SDK"
from openai import OpenAI

client = OpenAI(api_key="your-openai-api-key")

vector_store = client.beta.vector_stores.create(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"]
)
print(vector_store)
```

</TabItem>
</Tabs>

## 代理上的向量存储管理与路由

除了 **create**（`POST /v1/vector_stores` 或 `/vector_stores`）之外，LiteLLM 代理还提供了兼容 OpenAI 的 **retrieve**（查询）、**list**（列出）、**update**（更新）和 **delete**（删除）操作。路径**带不带** `/v1` 前缀均可访问（例如 `/v1/vector_stores/...` 和 `/vector_stores/...`）。

如需 **search**（搜索），参见[搜索向量存储](./search.md)；要操作存储中的 **files**（文件），参见[向量存储文件](../vector_store_files.md)。

### 认证

携带 LiteLLM 代理的虚拟密钥（virtual key），两种方式任选：

```bash
-H "Authorization: Bearer $LITELLM_API_KEY"
# or
-H 'x-litellm-api-key: sk-<your-litellm-api-key>'
```

### 提供商路由

LiteLLM 会根据请求上下文自动选择向量存储提供商，无需额外的查询参数：

- **LiteLLM 托管的存储**：如果 `vector_store_id` 是 LiteLLM 托管的存储，代理会从注册表（registry）解析出提供商（`litellm_params` 存储在数据库中）。
- **基于模型的路由**：如果请求带有 `model`，且匹配到已配置的部署（deployment）或模型组，凭据将取自该部署。
- **SDK 默认值**：如果两者都不适用，则使用该调用的 LiteLLM SDK 默认配置（例如 `openai`）。

### OpenAI API 参考（管理类操作）

- [查取向量存储](https://platform.openai.com/docs/api-reference/vector-stores/retrieve)
- [列出向量存储](https://platform.openai.com/docs/api-reference/vector-stores/list)
- [修改向量存储](https://platform.openai.com/docs/api-reference/vector-stores/modify)：在 LiteLLM 代理上，modify 对应向 `/v1/vector_stores/{vector_store_id}` 发送 **`POST`** 请求，并携带 JSON 请求体。
- [删除向量存储](https://platform.openai.com/docs/api-reference/vector-stores/delete)

## 请求格式

请求体遵循 OpenAI 的向量存储 API 格式。

#### 请求体示例

```json
{
  "name": "My Document Store",
  "file_ids": ["file-abc123", "file-def456"],
  "expires_after": {
    "anchor": "last_active_at",
    "days": 7
  },
  "chunking_strategy": {
    "type": "static",
    "static": {
      "max_chunk_size_tokens": 800,
      "chunk_overlap_tokens": 400
    }
  },
  "metadata": {
    "project": "rag-system",
    "environment": "production"
  }
}
```

#### 可选字段
- **name**（字符串）：向量存储的名称。
- **file_ids**（字符串数组）：向量存储要使用的文件 ID 列表。对 `file_search` 这类可访问文件的工具很有用。
- **expires_after**（对象）：向量存储的过期策略。
  - **anchor**（字符串）：过期策略从此基准时间戳起生效。支持的取值：`last_active_at`。
  - **days**（整数）：自基准时间起经过多少天后，向量存储将过期。
- **chunking_strategy**（对象）：对文件进行分块时采用的分块策略。未设置时使用 `auto` 策略。
  - **type**（字符串）：固定为 `static`。
  - **static**（对象）：静态分块策略。
    - **max_chunk_size_tokens**（整数）：每个分块包含的最大 Token 数。默认值为 `800`，最小值为 `100`，最大值为 `4096`。
    - **chunk_overlap_tokens**（整数）：相邻分块之间重叠的 Token 数。默认值为 `400`。
- **metadata**（对象）：可附加到对象上的键值对集合，最多 16 个。适合以结构化格式存放对象的附加信息。键最长 64 个字符，值最长 512 个字符。

## 响应格式

#### 响应示例

```json
{
  "id": "vs_abc123",
  "object": "vector_store",
  "created_at": 1699061776,
  "name": "My Document Store",
  "bytes": 139920,
  "file_counts": {
    "in_progress": 0,
    "completed": 2,
    "failed": 0,
    "cancelled": 0,
    "total": 2
  },
  "status": "completed",
  "expires_after": {
    "anchor": "last_active_at",
    "days": 7
  },
  "expires_at": null,
  "last_active_at": 1699061776,
  "metadata": {
    "project": "rag-system",
    "environment": "production"
  }
}
```

#### 响应字段

- **id**（字符串）：标识符，可在 API 端点中引用。
- **object**（字符串）：对象类型，固定为 `vector_store`。
- **created_at**（整数）：向量存储创建时间的 Unix 时间戳（秒）。
- **name**（字符串）：向量存储的名称。
- **bytes**（整数）：向量存储中文件占用的总字节数。
- **file_counts**（对象）：向量存储的文件统计。
  - **in_progress**（整数）：正在处理的文件数。
  - **completed**（整数）：已成功处理的文件数。
  - **failed**（整数）：处理失败的文件数。
  - **cancelled**（整数）：已取消的文件数。
  - **total**（整数）：文件总数。
- **status**（字符串）：向量存储的状态，取值为 `expired`、`in_progress` 或 `completed`。状态为 `completed` 表示向量存储已可使用。
- **expires_after**（对象或 null）：向量存储的过期策略。
- **expires_at**（整数或 null）：向量存储过期时间的 Unix 时间戳（秒）。
- **last_active_at**（整数或 null）：向量存储最近一次活跃时间的 Unix 时间戳（秒）。
- **metadata**（对象或 null）：可附加到对象上的键值对集合，最多 16 个。

## 模拟响应测试

为了便于测试，你可以使用模拟响应（mock response）：

```python showLineNumbers title="模拟响应示例"
import litellm

# Mock response for testing
mock_response = {
    "id": "vs_mock123",
    "object": "vector_store", 
    "created_at": 1699061776,
    "name": "Mock Vector Store",
    "bytes": 0,
    "file_counts": {
        "in_progress": 0,
        "completed": 0,
        "failed": 0,
        "cancelled": 0,
        "total": 0
    },
    "status": "completed"
}

response = await litellm.vector_stores.acreate(
    name="Test Store",
    mock_response=mock_response
)
print(response)
``` 
