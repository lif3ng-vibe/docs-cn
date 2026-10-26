# VoyageAI by MongoDB
https://docs.voyageai.com/embeddings/

Voyage AI 现已更名为 VoyageAI by MongoDB。LiteLLM 保留 `voyage/` 模型前缀，并根据你提供的密钥自动选择 API 主机，行为与官方 `voyageai` SDK 一致。

## API 密钥
```python
# env variable
os.environ['VOYAGE_API_KEY']
```

当 `VOYAGE_API_KEY` 未设置时，LiteLLM 也会读取 `VOYAGE_AI_API_KEY` 和 `VOYAGE_AI_TOKEN`。

### 密钥发往哪个主机

| 密钥签发方 | 密钥前缀 | 请求发往 |
|---------------|------------|----------------|
| MongoDB Atlas（Model API） | `al-` | `https://ai.mongodb.com/v1` |
| Voyage AI 仪表板 | `pa-` | `https://api.voyageai.com/v1` |

两个主机都会用 403 拒绝对方的密钥，因此无需任何配置：MongoDB 签发的密钥会自动路由到 `ai.mongodb.com`。若想把请求发往别处（例如架设在任一主机前面的网关），可以在模型上设置 `api_base`（重排序场景则设置 `VOYAGE_API_BASE`）；显式设置的 `api_base` 始终优先于密钥前缀。

```yaml
model_list:
  - model_name: voyage-3.5
    litellm_params:
      model: voyage/voyage-3.5
      api_key: os.environ/VOYAGE_API_KEY   # al-... goes to ai.mongodb.com, pa-... to api.voyageai.com
  - model_name: rerank-2.5
    litellm_params:
      model: voyage/rerank-2.5
      api_key: os.environ/VOYAGE_API_KEY
```

## 嵌入使用示例
```python
from litellm import embedding
import os

os.environ['VOYAGE_API_KEY'] = ""
response = embedding(
    model="voyage/voyage-3.5",
    input=["good morning from litellm"],
)
print(response)
```

## 支持的参数

VoyageAI 嵌入（embedding）支持以下可选参数：

- `input_type`：指定输入类型，用于检索优化
  - `"query"`：用于搜索查询
  - `"document"`：用于待索引的文档
- `dimensions`：输出嵌入的维度（256、512、1024 或 2048）
- `encoding_format`：输出格式（`"float"`、`"int8"`、`"uint8"`、`"binary"`、`"ubinary"`）
- `truncation`：输入超过最大 Token 数时是否截断（默认：`True`）

### 参数使用示例

```python
from litellm import embedding
import os

os.environ['VOYAGE_API_KEY'] = "your-api-key"

# Embedding with custom dimensions and input type
response = embedding(
    model="voyage/voyage-3.5",
    input=["Your text here"],
    dimensions=512,
    input_type="document"
)
print(f"Embedding dimensions: {len(response.data[0]['embedding'])}")
```

## 支持的模型

https://docs.voyageai.com/embeddings/#models-and-specifics 中列出的所有模型均受支持

| 模型名                  | 调用方式                                                   |
|-------------------------|------------------------------------------------------------|
| voyage-4-large          | `embedding(model="voyage/voyage-4-large", input)`          |
| voyage-4                | `embedding(model="voyage/voyage-4", input)`                |
| voyage-4-lite           | `embedding(model="voyage/voyage-4-lite", input)`           |
| voyage-code-4           | `embedding(model="voyage/voyage-code-4", input)`           |
| voyage-context-4        | `embedding(model="voyage/voyage-context-4", input)`        |
| voyage-context-3        | `embedding(model="voyage/voyage-context-3", input)`        |
| voyage-3.5              | `embedding(model="voyage/voyage-3.5", input)`              |
| voyage-3.5-lite         | `embedding(model="voyage/voyage-3.5-lite", input)`         |
| voyage-3-large          | `embedding(model="voyage/voyage-3-large", input)`          |
| voyage-3                | `embedding(model="voyage/voyage-3", input)`                |
| voyage-3-lite           | `embedding(model="voyage/voyage-3-lite", input)`           |
| voyage-code-3           | `embedding(model="voyage/voyage-code-3", input)`           |
| voyage-finance-2        | `embedding(model="voyage/voyage-finance-2", input)`        |
| voyage-law-2            | `embedding(model="voyage/voyage-law-2", input)`            |
| voyage-code-2           | `embedding(model="voyage/voyage-code-2", input)`           |
| voyage-multilingual-2   | `embedding(model="voyage/voyage-multilingual-2", input)`   |
| voyage-large-2-instruct | `embedding(model="voyage/voyage-large-2-instruct", input)` |
| voyage-large-2          | `embedding(model="voyage/voyage-large-2", input)`          |
| voyage-2                | `embedding(model="voyage/voyage-2", input)`                |
| voyage-lite-02-instruct | `embedding(model="voyage/voyage-lite-02-instruct", input)` |
| voyage-01               | `embedding(model="voyage/voyage-01", input)`               |
| voyage-lite-01          | `embedding(model="voyage/voyage-lite-01", input)`          |
| voyage-lite-01-instruct | `embedding(model="voyage/voyage-lite-01-instruct", input)` |

## 上下文嵌入（voyage-context-4、voyage-context-3）

Voyage 的 `voyage-context-4` 和 `voyage-context-3` 模型会生成上下文化的分块嵌入（contextualized chunk embeddings）：每个分块在嵌入时都能感知它所在的整篇文档，因此在长文档上的检索效果优于把各分块单独嵌入。凡名称中带 `context` 的 Voyage 模型，LiteLLM 都会将其发送到 Voyage 的 `/v1/contextualizedembeddings` 端点，因此调用入口仍是同一个 `embedding()`，代理路由也仍是 `/v1/embeddings`，只是输入与响应的结构和普通模型不同。

### 输入格式

扁平字符串列表或单个字符串会把每个字符串作为独立文档嵌入。LiteLLM 会附带 `enable_auto_chunking: true`、`chunk_size: 32000` 和 `input_type: "document"` 转发请求，因此不超过 32,000 Token 的字符串会返回为单个嵌入，更长的字符串则在 Voyage 侧被切成最多 32,000 Token 的分块。若传入 `input_type: "query"`，则会跳过这些默认值，把每个字符串作为搜索查询嵌入。你自行传入的 `input_type`、`chunk_size` 或 `enable_auto_chunking` 会覆盖对应的默认值。

```python
from litellm import embedding
import os

os.environ['VOYAGE_API_KEY'] = "your-api-key"

# Each string is embedded as its own document
response = embedding(
    model="voyage/voyage-context-4",
    input=["The quick brown fox", "jumps over the lazy dog"],
)
print(f"Documents embedded: {len(response.data)}")

# Search queries
response = embedding(
    model="voyage/voyage-context-4",
    input=["what does the fox do", "who is lazy"],
    input_type="query",
)
```

嵌套列表是预先分块的形式：每个内层列表对应一篇已切好分块的文档，LiteLLM 会原样转发。

```python
# Single document with multiple chunks
response = embedding(
    model="voyage/voyage-context-4",
    input=[
        [
            "Chapter 1: Introduction to AI",
            "This chapter covers the basics of artificial intelligence.",
            "We will explore machine learning and deep learning."
        ]
    ]
)
print(f"Number of chunk groups: {len(response.data)}")

# Multiple documents
response = embedding(
    model="voyage/voyage-context-4",
    input=[
        ["Paris is the capital of France.", "It is known for the Eiffel Tower."],
        ["Tokyo is the capital of Japan.", "It is a major economic hub."]
    ]
)
print(f"Processed {len(response.data)} documents")
```

### 响应格式

响应保持 Voyage 的嵌套结构：`data` 中每个输入对应一个条目，条目内的 `data` 再为每个分块提供一个嵌入。`response.data[0]["data"][0]["embedding"]` 是第一个输入的第一个分块；在扁平输入且使用默认分块大小时，它就是整个字符串。

### LiteLLM 代理

把模型加入 `config.yaml`：

```yaml
model_list:
  - model_name: voyage-context-4
    litellm_params:
      model: voyage/voyage-context-4
      api_key: os.environ/VOYAGE_API_KEY
```

扁平列表，每个字符串一篇文档：

```bash
curl http://localhost:4000/v1/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "voyage-context-4",
    "input": ["The quick brown fox", "jumps over the lazy dog"]
  }'
```

扁平列表，作为搜索查询：

```bash
curl http://localhost:4000/v1/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "voyage-context-4",
    "input": ["what does the fox do", "who is lazy"],
    "input_type": "query"
  }'
```

嵌套列表，一篇文档已预先切好分块：

```bash
curl http://localhost:4000/v1/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "voyage-context-4",
    "input": [["The quick brown fox", "jumps over the lazy dog"]]
  }'
```

### 规格参数

| 模型 | 每分块 | 每请求 | 输出维度 | 价格/百万 Token |
|-------|-----------|-------------|-------------------|----------------|
| voyage-context-4 | 32,000 tokens | 120,000 tokens, 1,000 inputs, 16,000 chunks | 256, 512, 1024 (default), 2048 | $0.12 |
| voyage-context-3 | 32,000 tokens | 120,000 tokens, 1,000 inputs, 16,000 chunks | 256, 512, 1024 (default), 2048 | $0.18 |

这些限额来自 Voyage 官方文档 https://docs.voyageai.com/docs/contextualized-chunk-embeddings；每请求 Token 总量按该次调用中的全部分块累计。

### 何时使用上下文嵌入

当你把长文档切成分块、且希望每个分块的嵌入能体现其所在文档的上下文时，选 `voyage-context-4`，因为文档结构、章节引用和分块间的依赖关系都很重要。对于相互独立的文本片段和短查询，选 `voyage-4-large`、`voyage-4` 或 `voyage-4-lite` 即可，此时文档上下文没有额外价值，标准模型也更便宜、更快。

## 模型选择指南

| 模型 | 最适合的场景 | 上下文长度 | 价格/百万 Token |
|-------|----------|----------------|----------------|
| voyage-4-large | 综合与多语言质量最佳 | 32K | $0.12 |
| voyage-4 | 通用、多语言 | 32K | $0.06 |
| voyage-4-lite | 延迟敏感的应用 | 32K | $0.02 |
| voyage-code-4 | 代码检索与编码代理 | 32K | $0.12 |
| voyage-context-4 | 上下文文档嵌入 | 32K per chunk, 120K per request | $0.12 |
| voyage-3.5 | 通用、多语言 | 32K | $0.06 |
| voyage-3.5-lite | 延迟敏感的应用 | 32K | $0.02 |
| voyage-3-large | 综合质量最佳 | 32K | $0.18 |
| voyage-code-3 | 代码检索与搜索 | 32K | $0.18 |
| voyage-finance-2 | 金融文档 | 32K | $0.12 |
| voyage-law-2 | 法律文档 | 16K | $0.12 |
| voyage-context-3 | 上下文文档嵌入 | 32K per chunk, 120K per request | $0.18 |

## 重排序

VoyageAI by MongoDB 提供重排序（rerank）模型，按各文档与查询的相关程度重新排序，从而提升搜索效果。MongoDB 签发的密钥（`al-`）在这里同样会路由到 `ai.mongodb.com`。

### 快速上手

```python
from litellm import rerank
import os

os.environ["VOYAGE_API_KEY"] = "your-api-key"

response = rerank(
    model="voyage/rerank-2.5",
    query="What is the capital of France?",
    documents=[
        "Paris is the capital of France.",
        "London is the capital of England.",
        "Berlin is the capital of Germany.",
    ],
    top_n=3,
)

print(response)
```

### 异步用法

```python
from litellm import arerank
import os
import asyncio

os.environ["VOYAGE_API_KEY"] = "your-api-key"

async def main():
    response = await arerank(
        model="voyage/rerank-2.5-lite",
        query="Best programming language for beginners?",
        documents=[
            "Python is great for beginners due to simple syntax.",
            "JavaScript runs in browsers and is versatile.",
            "Rust has a steep learning curve but is very safe.",
        ],
        top_n=2,
    )
    print(response)

asyncio.run(main())
```

### LiteLLM 代理用法

加入你的 `config.yaml`：

```yaml
model_list:
  - model_name: rerank-2.5
    litellm_params:
      model: voyage/rerank-2.5
      api_key: os.environ/VOYAGE_API_KEY
  - model_name: rerank-2.5-lite
    litellm_params:
      model: voyage/rerank-2.5-lite
      api_key: os.environ/VOYAGE_API_KEY
```

用 curl 测试：

```bash
curl http://localhost:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rerank-2.5",
    "query": "What is the capital of France?",
    "documents": [
        "Paris is the capital of France.",
        "London is the capital of England.",
        "Berlin is the capital of Germany."
    ],
    "top_n": 3
  }'
```

### 支持的重排序模型

| 模型 | 上下文长度 | 说明 | 价格/百万 Token |
|-------|----------------|-------------|----------------|
| rerank-2.5 | 32K | 质量最佳、多语言、遵循指令 | $0.05 |
| rerank-2.5-lite | 32K | 针对延迟与成本优化 | $0.02 |
| rerank-2 | 16K | 旧版模型 | $0.05 |
| rerank-2-lite | 8K | 旧版模型，速度更快 | $0.02 |

### 支持的参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `model` | string | 模型名（如 `voyage/rerank-2.5`） |
| `query` | string | 搜索查询 |
| `documents` | list | 待重排序的文档列表 |
| `top_n` | int | 返回的前若干条结果数量 |
| `return_documents` | bool | 响应中是否包含文档文本 |
