import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# RAGFlow 向量存储

LiteLLM 支持在 RAGFlow 中创建和管理数据集（dataset），用于文档处理与知识库管理。

| 属性 | 说明 |
|----------|---------|
| 描述 | RAGFlow 数据集面向 RAG 应用，提供文档处理、分块（chunking）与知识库管理能力。 |
| LiteLLM 中的提供商路由 | litellm 的 vector_store_registry 中的 `ragflow` |
| 提供商文档 | [RAGFlow API 文档 ↗](https://ragflow.io/docs) |
| 支持的操作 | 数据集管理（创建、列出、更新、删除） |
| 搜索/检索 | ❌ 不支持（仅支持管理） |

## 快速上手

### LiteLLM Python SDK

```python showLineNumbers title="Example using LiteLLM Python SDK"
import os
import litellm

# Set RAGFlow credentials
os.environ["RAGFLOW_API_KEY"] = "your-ragflow-api-key"
os.environ["RAGFLOW_API_BASE"] = "http://localhost:9380"  # Optional, defaults to localhost:9380

# Create a RAGFlow dataset
response = litellm.vector_stores.create(
    name="my-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "description": "My knowledge base dataset",
        "embedding_model": "BAAI/bge-large-zh-v1.5@BAAI",
        "chunk_method": "naive"
    }
)

print(f"Created dataset ID: {response.id}")
print(f"Dataset name: {response.name}")
```

### LiteLLM 代理

#### 1. 配置 vector_store_registry

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

vector_store_registry:
  - vector_store_name: "ragflow-knowledge-base"
    litellm_params:
      vector_store_id: "your-dataset-id"
      custom_llm_provider: "ragflow"
      api_key: os.environ/RAGFLOW_API_KEY
      api_base: os.environ/RAGFLOW_API_BASE  # Optional
      vector_store_description: "RAGFlow dataset for knowledge base"
      vector_store_metadata:
        source: "Company documentation"
```

</TabItem>

<TabItem value="litellm-ui" label="LiteLLM UI">

在 LiteLLM 管理界面（Admin UI）中，依次进入 Experimental > Vector Stores > Create Vector Store。在这一页可以填写名称、向量存储 ID 和凭证来创建向量存储（vector store）。

<Image 
  img={require('../../img/kb_2.png')}
  style={{width: '50%'}}
/>

</TabItem>
</Tabs>

#### 2. 通过代理创建数据集

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/vector_stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "name": "my-ragflow-dataset",
    "custom_llm_provider": "ragflow",
    "metadata": {
      "description": "Test dataset",
      "chunk_method": "naive"
    }
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Create a RAGFlow dataset
response = client.vector_stores.create(
    name="my-ragflow-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "description": "Test dataset",
        "chunk_method": "naive"
    }
)

print(f"Created dataset: {response.id}")
```

</TabItem>
</Tabs>

## 配置

### 环境变量

RAGFlow 向量存储支持通过环境变量（environment variable）进行配置：

- `RAGFLOW_API_KEY` - RAGFlow API 密钥（必填）
- `RAGFLOW_API_BASE` - RAGFlow API 基础 URL（可选，默认为 `http://localhost:9380`）

### 参数

也可以通过 `litellm_params` 传入这些配置：

- `api_key` - RAGFlow API 密钥（会覆盖 `RAGFLOW_API_KEY` 环境变量）
- `api_base` - RAGFlow API 基础 URL（会覆盖 `RAGFLOW_API_BASE` 环境变量）

## 数据集创建选项

### 基础数据集创建

```python
response = litellm.vector_stores.create(
    name="basic-dataset",
    custom_llm_provider="ragflow"
)
```

### 使用分块方法创建数据集

RAGFlow 针对不同文档类型提供了多种分块方法：

<Tabs>
<TabItem value="naive" label="Naive（通用）">

```python
response = litellm.vector_stores.create(
    name="general-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "naive",
        "parser_config": {
            "chunk_token_num": 512,
            "delimiter": "\n",
            "html4excel": False,
            "layout_recognize": "DeepDOC"
        }
    }
)
```

</TabItem>

<TabItem value="book" label="书籍">

```python
response = litellm.vector_stores.create(
    name="book-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "book",
        "parser_config": {
            "raptor": {
                "use_raptor": False
            }
        }
    }
)
```

</TabItem>

<TabItem value="qa" label="问答">

```python
response = litellm.vector_stores.create(
    name="qa-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "qa",
        "parser_config": {
            "raptor": {
                "use_raptor": False
            }
        }
    }
)
```

</TabItem>

<TabItem value="paper" label="论文">

```python
response = litellm.vector_stores.create(
    name="paper-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "paper",
        "parser_config": {
            "raptor": {
                "use_raptor": False
            }
        }
    }
)
```

</TabItem>
</Tabs>

### 使用摄取管道创建数据集

除了分块方法，也可以改用摄取管道（ingestion pipeline）：

```python
response = litellm.vector_stores.create(
    name="pipeline-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "parse_type": 2,  # Number of parsers in your pipeline
        "pipeline_id": "d0bebe30ae2211f0970942010a8e0005"  # 32-character hex ID
    }
)
```

**注意**：`chunk_method` 与 `pipeline_id` 互斥，二者只能选其一。

### 高级解析器配置

```python
response = litellm.vector_stores.create(
    name="advanced-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "naive",
        "description": "Advanced dataset with custom parser config",
        "embedding_model": "BAAI/bge-large-zh-v1.5@BAAI",
        "permission": "me",  # or "team"
        "parser_config": {
            "chunk_token_num": 1024,
            "delimiter": "\n!?;。；！？",
            "html4excel": True,
            "layout_recognize": "DeepDOC",
            "auto_keywords": 5,
            "auto_questions": 3,
            "task_page_size": 12,
            "raptor": {
                "use_raptor": True
            },
            "graphrag": {
                "use_graphrag": False
            }
        }
    }
)
```

## 支持的分块方法

RAGFlow 支持以下分块方法：

- `naive` - 通用场景（默认）
- `book` - 适用于书籍文档
- `email` - 适用于电子邮件文档
- `laws` - 适用于法律文书
- `manual` - 手动分块
- `one` - 整篇作为单个分块
- `paper` - 适用于学术论文
- `picture` - 适用于图片文档
- `presentation` - 适用于演示文稿
- `qa` - 问答格式
- `table` - 适用于表格文档
- `tag` - 基于标签的分块

## RAGFlow 专属参数

所有 RAGFlow 专属参数都应通过 `metadata` 字段传入：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `avatar` | string | 头像的 Base64 编码（最长 65535 字符） |
| `description` | string | 数据集的简要描述（最长 65535 字符） |
| `embedding_model` | string | 嵌入（embedding）模型名称（例如 "BAAI/bge-large-zh-v1.5@BAAI"） |
| `permission` | string | 访问权限："me"（默认）或 "team" |
| `chunk_method` | string | 分块方法（见上文支持的方法列表） |
| `parser_config` | object | 解析器配置（随 chunk_method 不同而变化） |
| `parse_type` | int | 管道中的解析器数量（与 pipeline_id 搭配使用时必填） |
| `pipeline_id` | string | 32 位十六进制管道 ID（与 parse_type 搭配使用时必填） |

## 错误处理

RAGFlow 返回的错误响应格式如下：

```json
{
    "code": 101,
    "message": "Dataset name 'my-dataset' already exists"
}
```

LiteLLM 会自动将这些响应映射为相应的异常：

- `code != 0` → 抛出携带错误信息的异常
- 缺少必填字段 → 抛出 `ValueError`
- 参数互斥冲突 → 抛出 `ValueError`

## 已知限制

- **搜索/检索**：RAGFlow 向量存储目前仅支持数据集管理，不支持搜索操作，调用会抛出 `NotImplementedError`。
- **列出/更新/删除**：这些操作尚未通过标准向量存储 API 实现，请直接使用 RAGFlow 原生 API 端点。

## 延伸阅读

向量存储：
- [创建向量存储](../vector_stores/create.md)
- [在补全中使用向量存储](../completion/knowledgebase.md)
- [向量存储注册表](../completion/knowledgebase.md#vectorstoreregistry)
