# /vector_stores/\{vector_store_id\}/files

向量存储文件（vector store file）指的是存放在向量存储（vector store）内部的各个文件。

| 功能 | 支持情况 |
|---------|-----------|
| 日志 | ✅（完整的请求/响应日志） |
| 支持的提供商 | `openai` |


## 支持的操作

| 操作 | 说明 | OpenAI Python Client | LiteLLM 代理 |
|-----------|-------------|----------------------|---------------|
| 创建向量存储文件 | 将文件附加到向量存储，可选择覆盖默认分块策略 | ✅ | ✅ |
| 列出向量存储文件 | 分页列出，支持筛选 | ✅ | ✅ |
| 检索向量存储文件 | 获取单个文件的元数据 | ✅ | ✅ |
| 删除向量存储文件 | 从存储中移除文件（文件对象本身仍保留） | ✅ | ✅ |
| 检索向量存储文件内容 | 以流式返回处理后的分块 | ❌ | ✅ |
| 更新向量存储文件属性 | 更新自定义属性 | ❌ | ✅ |

:::note
向量存储支持目前**仅适用于 OpenAI 向量存储以及通过 OpenAI 上传的文件 ID**。
:::


## 创建向量存储文件

<code>POST http://localhost:4000/v1/vector_stores/&#123;vector_store_id&#125;/files</code>

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # LiteLLM proxy or OpenAI base
    api_key="sk-<your-litellm-api-key>"
)

vector_store_file = client.vector_stores.files.create(
    vector_store_id="vs_69172088a18c8191ab3e2621aa87d1ee",
    file_id="file-NDbEDJTfqVh7S4Ugi3CGYw",
    chunking_strategy={
        "type": "static",
        "static": {
            "max_chunk_size_tokens": 800,
            "chunk_overlap_tokens": 400,
        },
    },
)

print(vector_store_file)
```

## 列出向量存储文件

<code>GET http://localhost:4000/v1/vector_stores/&#123;vector_store_id&#125;/files</code>

参数：

- `vector_store_id`（路径参数，必填）
- `after` / `before`（查询参数，可选）：分页游标
- `filter`（查询参数，可选）：可选 `in_progress`、`completed`、`failed`、`cancelled`
- `limit`（查询参数，可选，默认 `20`，取值范围 `1-100`）
- `order`（查询参数，可选，默认 `desc`）

```python
vector_store_files = client.vector_stores.files.list(
    vector_store_id="vs_abc123"
)
print(vector_store_files)
```

## 检索向量存储文件

<code>GET http://localhost:4000/v1/vector_stores/&#123;vector_store_id&#125;/files/&#123;file_id&#125;</code>

```python
vector_store_file = client.vector_stores.files.retrieve(
    vector_store_id="vs_abc123",
    file_id="file-abc123"
)
print(vector_store_file)
```

## 删除向量存储文件

<code>DELETE http://localhost:4000/v1/vector_stores/&#123;vector_store_id&#125;/files/&#123;file_id&#125;</code>

```python
deleted_vector_store_file = client.vector_stores.files.delete(
    vector_store_id="vs_abc123",
    file_id="file-abc123"
)
print(deleted_vector_store_file)
```

## 仅代理提供的端点

当需要获取原始内容分块或更新属性时，请直接调用 LiteLLM 代理。

### 检索文件内容

```bash
curl -X GET "http://localhost:4000/v1/vector_stores/\{vector_store_id\}/files/\{file_id\}/content" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

### 更新文件属性

```bash
curl -X POST "http://localhost:4000/v1/vector_stores/\{vector_store_id\}/files/\{file_id\}" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "attributes": {
          "category": "support-faq",
          "language": "en"
        }
      }'
```
