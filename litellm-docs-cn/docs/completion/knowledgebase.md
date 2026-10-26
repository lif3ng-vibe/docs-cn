import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 使用向量存储（知识库）

<Image 
  img={require('../../img/kb.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>在任何 LiteLLM 支持的模型中使用向量存储</p>


LiteLLM 与向量存储（vector store）集成，让模型能够访问你组织内部的数据，从而给出更准确、更贴合上下文的回答。

## 支持的向量存储
- [Bedrock Knowledge Bases](https://aws.amazon.com/bedrock/knowledge-bases/)
- [OpenAI Vector Stores](https://platform.openai.com/docs/api-reference/vector-stores/search)
- [Azure Vector Stores](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/file-search?tabs=python#vector-stores)（无法直接查询，只能在 Assistants 消息调用中使用）
- [Azure AI Search](/docs/providers/azure_ai_vector_stores)（基于 Azure AI Search 索引进行向量检索）
- [Vertex AI RAG API](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-overview)
- [Gemini File Search](https://ai.google.dev/gemini-api/docs/file-search)
- [MongoDB Vector Search (BETA)](../providers/mongodb_vector_stores.md#在对话补全中使用-mongodb)（将现有的 Atlas 或自托管的 MongoDB 索引用作对话补全的上下文）
- [RAGFlow Datasets](/docs/providers/ragflow_vector_store.md)（仅支持数据集管理，不支持搜索）

## 快速上手

要在 LiteLLM 中使用向量存储，你需要：

- 初始化 litellm.vector_store_registry
- 在补全请求中传入带有 vector_store_ids 的 tools。其中 `vector_store_ids` 是你在 litellm.vector_store_registry 中初始化的向量存储 ID 列表

### LiteLLM Python SDK

LiteLLM 允许你按照 [OpenAI API 规范](https://platform.openai.com/docs/api-reference/chat/create)使用向量存储，只需传入一个带有目标 vector_store_ids 的 tool 即可

```python showLineNumbers title="Bedrock 知识库基础用法"
import os
import litellm

from litellm.vector_stores.vector_store_registry import VectorStoreRegistry, LiteLLM_ManagedVectorStore

# Init vector store registry
litellm.vector_store_registry = VectorStoreRegistry(
    vector_stores=[
        LiteLLM_ManagedVectorStore(
            vector_store_id="T37J8R4WTM",
            custom_llm_provider="bedrock"
        )
    ]
)


# Make a completion request with vector_store_ids parameter
response = await litellm.acompletion(
    model="anthropic/{{anthropic}}", 
    messages=[{"role": "user", "content": "What is litellm?"}],
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": ["T37J8R4WTM"]
        }
    ],
)

print(response.choices[0].message.content)
```

### LiteLLM 代理

#### 1. 配置 vector_store_registry

要在 LiteLLM 中使用向量存储，你需要先配置 vector_store_registry。这一步会告诉 litellm 使用哪些向量存储，以及每个向量存储对应的 API 提供商。

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

vector_store_registry:
  - vector_store_name: "bedrock-litellm-website-knowledgebase"
    litellm_params:
      vector_store_id: "T37J8R4WTM"
      custom_llm_provider: "bedrock"
      vector_store_description: "Bedrock vector store for the Litellm website knowledgebase"
      vector_store_metadata:
        source: "https://www.litellm.com/docs"

```

</TabItem>

<TabItem value="litellm-ui" label="LiteLLM UI">

在 LiteLLM UI 中，依次进入 Experimental > Vector Stores > Create Vector Store。在这一页你可以通过填写名称、向量存储 ID 和凭据来创建向量存储。
<Image 
  img={require('../../img/kb_2.png')}
  style={{width: '50%'}}
/>




</TabItem>

</Tabs>

#### 2. 使用 vector_store_ids 参数发起请求

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="向 LiteLLM 代理发起 Curl 请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [{"role": "user", "content": "What is litellm?"}],
    "tools": [
        {
            "type": "file_search",
            "vector_store_ids": ["T37J8R4WTM"]
        }
    ]
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="OpenAI Python SDK 请求"
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Make a completion request with vector_store_ids parameter
response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[{"role": "user", "content": "What is litellm?"}],
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": ["T37J8R4WTM"]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## 各提供商配置指南

本节介绍如何把你的向量存储接入 LiteLLM。如果希望支持新的提供商，请到[这里](https://github.com/BerriAI/litellm/issues)提交 issue。

### Bedrock Knowledge Bases

**1. 准备好你的 Bedrock Knowledge Base**

请确保已在你的 AWS 账户中创建 Bedrock Knowledge Base，并配置好相应的权限。

**2. 在 LiteLLM UI 中添加**

1. 依次进入 **Tools > Vector Stores > "Add new vector store"**
2. 提供商选择 **"Bedrock"**
3. 在 **"Vector Store ID"** 字段中填入你的 Bedrock Knowledge Base ID

<Image 
  img={require('../../img/kb_2.png')}
  style={{width: '60%', display: 'block'}}
/>


### Vertex AI RAG Engine

**1. 获取你的 Vertex AI RAG Engine ID**

1. 在 [Google Cloud Console](https://console.cloud.google.com/vertex-ai/rag/corpus) 中进入你的 RAG Engine Corpus
2. 选中想要接入 LiteLLM 的 **RAG Engine**

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_vertex1.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>

3. 点击 **"Details"** 按钮，复制该 RAG Engine 的 UUID
4. ID 形如：`6917529027641081856`

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_vertex2.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>

**2. 在 LiteLLM UI 中添加**

1. 依次进入 **Tools > Vector Stores > "Add new vector store"**
2. 提供商选择 **"Vertex AI RAG Engine"**
3. 在 **"Vector Store ID"** 字段中填入你的 Vertex AI RAG Engine ID

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_vertex3.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>

### PG Vector

**1. 部署 litellm-pg-vector-store 连接器**

LiteLLM 提供了一个服务器，为 PG Vector 暴露兼容 OpenAI 的 `vector_store` 端点。LiteLLM 代理服务器会连接到你部署的服务，并在查询时把它当作向量存储使用。

1. litellm-pg-vector-store 连接器的部署说明见[这里](https://github.com/BerriAI/litellm-pgvector)
2. 详细的配置选项参见[配置指南](https://github.com/BerriAI/litellm-pgvector?tab=readme-ov-file#configuration)

**部署 litellm-pg-vector-store 时的 .env 配置示例**：

```env
DATABASE_URL="postgresql://neondb_owner:xxxx"
SERVER_API_KEY="sk-<your-litellm-api-key>"
HOST="0.0.0.0"
PORT=8001
EMBEDDING__MODEL="text-embedding-ada-002"
EMBEDDING__BASE_URL="http://localhost:4000"
EMBEDDING__API_KEY="sk-<your-litellm-api-key>"
EMBEDDING__DIMENSIONS=1536
DB_FIELDS__ID_FIELD="id"
DB_FIELDS__CONTENT_FIELD="content"
DB_FIELDS__METADATA_FIELD="metadata"
DB_FIELDS__EMBEDDING_FIELD="embedding"
DB_FIELDS__VECTOR_STORE_ID_FIELD="vector_store_id"
DB_FIELDS__CREATED_AT_FIELD="created_at"
```

**2. 在 LiteLLM UI 中添加**

litellm-pg-vector-store 部署完成后：

1. 依次进入 **Tools > Vector Stores > "Add new vector store"**
2. 提供商选择 **"PG Vector"**
3. 填入你的 `litellm-pg-vector-store` 容器的 **API Base URL** 和 **API Key**
   - API Key 字段对应 .env 配置中的 `SERVER_API_KEY`

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_pg1.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>

### OpenAI Vector Stores

**1. 准备好你的 OpenAI Vector Store**

1. 在 [OpenAI 平台](https://platform.openai.com/storage/vector_stores)上创建你的 Vector Store
2. 记下你的 Vector Store ID（格式：`vs_687ae3b2439881918b433cb99d10662e`）

**2. 在 LiteLLM UI 中添加**

1. 依次进入 **Tools > Vector Stores > "Add new vector store"**
2. 提供商选择 **"OpenAI"**
3. 在对应字段中填入你的 **Vector Store ID**
4. 在 API Key 字段中填入你的 **OpenAI API Key**

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_openai1.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>



## 进阶用法

### 记录向量存储用量

你可以在 LiteLLM UI 的 `Logs` 页面查看向量存储的使用情况。

发起一次使用向量存储的请求后，进入 LiteLLM 的 `Logs` 页面，即可看到发送给向量存储的查询，以及带相关性分数的对应响应。

<Image 
  img={require('../../img/kb_4.png')}
  style={{width: '80%'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>LiteLLM 日志页：向量存储使用情况</p>


### 列出可用的向量存储

你可以使用 /vector_store/list 端点列出所有可用的向量存储

**请求**：
```bash showLineNumbers title="列出所有可用的向量存储"
curl -X GET "http://localhost:4000/vector_store/list" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**响应**：

响应是一个列表，包含所有可在 LiteLLM 中使用的向量存储。

```json
{
  "object": "list",
  "data": [
    {
      "vector_store_id": "T37J8R4WTM",
      "custom_llm_provider": "bedrock",
      "vector_store_name": "bedrock-litellm-website-knowledgebase",
      "vector_store_description": "Bedrock vector store for the Litellm website knowledgebase",
      "vector_store_metadata": {
        "source": "https://www.litellm.com/docs"
      },
      "created_at": "2023-05-03T18:21:36.462Z",
      "updated_at": "2023-05-03T18:21:36.462Z",
      "litellm_credential_name": "bedrock_credentials"
    }
  ],
  "total_count": 1,
  "current_page": 1,
  "total_pages": 1
}
```


### 对模型始终启用

**如果你希望某个模型默认就使用向量存储，可以采用这种配置**。

在这份配置中，我们为 claude-3-5-sonnet-with-vector-store 模型添加了 `vector_store_ids`。这意味着发往 claude-3-5-sonnet-with-vector-store 模型的任何请求，都会始终使用 `vector_store_registry` 中定义的 ID 为 `T37J8R4WTM` 的向量存储。

```yaml showLineNumbers title="对模型始终启用"
model_list:
  - model_name: claude-3-5-sonnet-with-vector-store
    litellm_params:
      model: anthropic/{{anthropic}}
      vector_store_ids: ["T37J8R4WTM"]

vector_store_registry:
  - vector_store_name: "bedrock-litellm-website-knowledgebase"
    litellm_params:
      vector_store_id: "T37J8R4WTM"
      custom_llm_provider: "bedrock"
      vector_store_description: "Bedrock vector store for the Litellm website knowledgebase"
      vector_store_metadata:
        source: "https://www.litellm.com/docs"
```

## 工作原理

如果请求中带有 `vector_store_ids` 参数，且其中任一向量存储 ID 能在 `vector_store_registry` 中找到，LiteLLM 会自动为该请求使用对应的向量存储。

1. 你发起带有 `vector_store_ids` 参数的补全请求，且其中任一向量存储 ID 能在 `litellm.vector_store_registry` 中找到
2. LiteLLM 自动完成以下步骤：
   - 用你的最后一条消息作为查询，从知识库中检索相关信息
   - 把检索到的上下文追加到对话中
   - 将增强后的消息发给模型

#### 转换示例

当你传入 `vector_store_ids=["YOUR_KNOWLEDGE_BASE_ID"]` 时，请求会经过以下几个步骤：

**1. 发给 LiteLLM 的原始请求**：
```json
{
    "model": "anthropic/{{anthropic}}",
    "messages": [
        {"role": "user", "content": "What is litellm?"}
    ],
    "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"]
}
```

**2. 发给 AWS Bedrock Knowledge Base 的请求**：
```json
{
    "retrievalQuery": {
        "text": "What is litellm?"
    }
}
```
该请求会发送到：`https://bedrock-agent-runtime.{aws_region}.amazonaws.com/knowledgebases/YOUR_KNOWLEDGE_BASE_ID/retrieve`

**3. LiteLLM 最终发出的请求**：
```json
{
    "model": "anthropic/{{anthropic}}",
    "messages": [
        {"role": "user", "content": "What is litellm?"},
        {"role": "user", "content": "Context: \n\nLiteLLM is an open-source SDK to simplify LLM API calls across providers (OpenAI, Claude, etc). It provides a standardized interface with robust error handling, streaming, and observability tools."}
    ]
}
```

只要请求中包含 `vector_store_ids` 参数，这个过程就会自动发生。

## 获取搜索结果（引用）

使用向量存储时，LiteLLM 会自动把搜索结果放在 `provider_specific_fields` 中返回，方便你向用户展示 AI 回答所引用的出处。

### 核心概念

搜索结果始终位于：`response.choices[0].message.provider_specific_fields["search_results"]`

流式场景下：当 `finish_reason == "stop"` 时，结果会出现在**最后一个 chunk** 中

### 非流式示例


**带搜索结果的非流式响应**：

```json
{
  "id": "chatcmpl-abc123",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "LiteLLM is a platform...",
      "provider_specific_fields": {
        "search_results": [{
          "search_query": "What is litellm?",
          "data": [{
            "score": 0.95,
            "content": [{"text": "...", "type": "text"}],
            "filename": "litellm-docs.md",
            "file_id": "doc-123"
          }]
        }]
      }
    },
    "finish_reason": "stop"
  }]
}
```

<Tabs>
<TabItem value="python-sdk" label="Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[{"role": "user", "content": "What is litellm?"}],
    tools=[{"type": "file_search", "vector_store_ids": ["T37J8R4WTM"]}]
)

# Get AI response
print(response.choices[0].message.content)

# Get search results (citations)
search_results = response.choices[0].message.provider_specific_fields.get("search_results", [])

for result_page in search_results:
    for idx, item in enumerate(result_page['data'], 1):
        print(f"[{idx}] {item.get('filename', 'Unknown')} (score: {item['score']:.2f})")
```

</TabItem>

<TabItem value="typescript" label="TypeScript SDK">

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:4000',
  apiKey: process.env.LITELLM_API_KEY
});

const response = await client.chat.completions.create({
  model: '{{anthropic}}',
  messages: [{ role: 'user', content: 'What is litellm?' }],
  tools: [{ type: 'file_search', vector_store_ids: ['T37J8R4WTM'] }]
});

// Get AI response
console.log(response.choices[0].message.content);

// Get search results (citations)
const message = response.choices[0].message as any;
const searchResults = message.provider_specific_fields?.search_results || [];

searchResults.forEach((page: any) => {
  page.data.forEach((item: any, idx: number) => {
    console.log(`[${idx + 1}] ${item.filename || 'Unknown'} (${item.score.toFixed(2)})`);
  });
});
```

</TabItem>
</Tabs>

### 流式示例

**带搜索结果的流式响应**（最后一个 chunk）：

```json
{
  "id": "chatcmpl-abc123",
  "choices": [{
    "index": 0,
    "delta": {
      "provider_specific_fields": {
        "search_results": [{
          "search_query": "What is litellm?",
          "data": [{
            "score": 0.95,
            "content": [{"text": "...", "type": "text"}],
            "filename": "litellm-docs.md",
            "file_id": "doc-123"
          }]
        }]
      }
    },
    "finish_reason": "stop"
  }]
}
```

<Tabs>
<TabItem value="python-sdk" label="Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

stream = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[{"role": "user", "content": "What is litellm?"}],
    tools=[{"type": "file_search", "vector_store_ids": ["T37J8R4WTM"]}],
    stream=True
)

for chunk in stream:
    # Stream content
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
    
    # Get citations in final chunk
    if chunk.choices[0].finish_reason == "stop":
        search_results = getattr(chunk.choices[0].delta, 'provider_specific_fields', {}).get('search_results', [])
        if search_results:
            print("\n\nSources:")
            for page in search_results:
                for idx, item in enumerate(page['data'], 1):
                    print(f"  [{idx}] {item.get('filename', 'Unknown')} ({item['score']:.2f})")
```

</TabItem>

<TabItem value="typescript" label="TypeScript SDK">

```typescript
import OpenAI from 'openai';

const stream = await client.chat.completions.create({
  model: '{{anthropic}}',
  messages: [{ role: 'user', content: 'What is litellm?' }],
  tools: [{ type: 'file_search', vector_store_ids: ['T37J8R4WTM'] }],
  stream: true
});

for await (const chunk of stream) {
  // Stream content
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
  
  // Get citations in final chunk
  if (chunk.choices[0]?.finish_reason === 'stop') {
    const searchResults = (chunk.choices[0].delta as any).provider_specific_fields?.search_results || [];
    if (searchResults.length > 0) {
      console.log('\n\nSources:');
      searchResults.forEach((page: any) => {
        page.data.forEach((item: any, idx: number) => {
          console.log(`  [${idx + 1}] ${item.filename || 'Unknown'} (${item.score.toFixed(2)})`);
        });
      });
    }
  }
}
```

</TabItem>
</Tabs>

### 搜索结果字段

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `search_query` | string | 用于搜索向量存储的查询 |
| `data` | array | 搜索结果数组 |
| `data[].score` | float | 相关性分数（0-1，越高越相关） |
| `data[].content` | array | 内容分块，包含 `text` 和 `type` |
| `data[].filename` | string | 源文件名（可选） |
| `data[].file_id` | string | 源文件标识符（可选） |
| `data[].attributes` | object | 提供商特定的元数据（可选） |

## API 参考

### LiteLLM 补全知识库参数

在 LiteLLM 中使用知识库集成时，可以传入以下参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `vector_store_ids` | List[str] | 要查询的知识库 ID 列表 |

### VectorStoreRegistry

`VectorStoreRegistry` 是 LiteLLM 中管理向量存储的核心组件，它充当一个注册表，你可以在其中配置并访问自己的向量存储。

#### VectorStoreRegistry 是什么？

`VectorStoreRegistry` 是一个类，它负责：
- 维护 LiteLLM 可以使用的向量存储集合
- 支持把向量存储连同凭据和元数据一起注册进来
- 让补全请求可以通过 ID 访问这些向量存储

#### 在 Python 中使用 VectorStoreRegistry

```python
from litellm.vector_stores.vector_store_registry import VectorStoreRegistry, LiteLLM_ManagedVectorStore

# Initialize the vector store registry with one or more vector stores
litellm.vector_store_registry = VectorStoreRegistry(
    vector_stores=[
        LiteLLM_ManagedVectorStore(
            vector_store_id="YOUR_VECTOR_STORE_ID",  # Required: Unique ID for referencing this store
            custom_llm_provider="bedrock"            # Required: Provider (e.g., "bedrock")
        )
    ]
)
```

#### LiteLLM_ManagedVectorStore 参数

注册表中的每个向量存储都通过一个 `LiteLLM_ManagedVectorStore` 对象来配置，可用参数如下：

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `vector_store_id` | str | Yes | 向量存储的唯一标识符 |
| `custom_llm_provider` | str | Yes | 向量存储所属的提供商（如 "bedrock"） |
| `vector_store_name` | str | No | 向量存储的易读名称 |
| `vector_store_description` | str | No | 描述向量存储中包含的内容 |
| `vector_store_metadata` | dict or str | No | 向量存储的附加元数据 |
| `litellm_credential_name` | str | No | 该向量存储要使用的凭据名称 |

#### 在 config.yaml 中配置 VectorStoreRegistry

对于 LiteLLM 代理，你可以在 `config.yaml` 文件中配置同样的注册表：

```yaml showLineNumbers title="config.yaml 中的向量存储配置"
vector_store_registry:
  - vector_store_name: "bedrock-litellm-website-knowledgebase"  # Optional friendly name
    litellm_params:
      vector_store_id: "T37J8R4WTM"                            # Required: Unique ID  
      custom_llm_provider: "bedrock"                           # Required: Provider
      vector_store_description: "Bedrock vector store for the Litellm website knowledgebase"
      vector_store_metadata:
        source: "https://www.litellm.com/docs"
```

`litellm_params` 部分接受的参数与 Python SDK 中 `LiteLLM_ManagedVectorStore` 构造函数的参数完全相同。

