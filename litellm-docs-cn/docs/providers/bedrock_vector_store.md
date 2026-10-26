import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# Bedrock Knowledge Bases

AWS Bedrock Knowledge Bases 可将 LLM 连接到组织的数据，让模型能够检索并引用与自身业务相关的专属信息。

| 属性 | 说明 |
|----------|---------|
| 描述 | Bedrock Knowledge Bases 将你的数据接入 LLM，使其能够在回答中检索并引用组织的信息。 |
| LiteLLM 提供商路由 | `bedrock`（注册于 litellm 的 vector_store_registry） |
| 提供商文档 | [AWS Bedrock Knowledge Bases ↗](https://aws.amazon.com/bedrock/knowledge-bases/) |

## 快速上手

### LiteLLM Python SDK

```python showLineNumbers title="使用 LiteLLM Python SDK 的示例"
import os
import litellm

from litellm.vector_stores.vector_store_registry import VectorStoreRegistry, LiteLLM_ManagedVectorStore

# Init vector store registry with your Bedrock Knowledge Base
litellm.vector_store_registry = VectorStoreRegistry(
    vector_stores=[
        LiteLLM_ManagedVectorStore(
            vector_store_id="YOUR_KNOWLEDGE_BASE_ID",  # KB ID from AWS Bedrock
            custom_llm_provider="bedrock"
        )
    ]
)

# Make a completion request using your Knowledge Base
response = await litellm.acompletion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "What does our company policy say about remote work?"}],
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"]
        }
    ],
)

print(response.choices[0].message.content)
```

### LiteLLM 代理

#### 1. 配置 vector_store_registry

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

vector_store_registry:
  - vector_store_name: "bedrock-company-docs"
    litellm_params:
      vector_store_id: "YOUR_KNOWLEDGE_BASE_ID"
      custom_llm_provider: "bedrock"
      vector_store_description: "Bedrock Knowledge Base for company documents"
      vector_store_metadata:
        source: "Company internal documentation"
```

</TabItem>

<TabItem value="litellm-ui" label="LiteLLM UI">

在 LiteLLM UI 中，前往 Experimental > Vector Stores > Create Vector Store。在这个页面上，你可以通过名称、向量存储 ID 和凭据来创建向量存储（vector store）。

<Image
  img={require('../../img/kb_2.png')}
  style={{width: '50%'}}
/>

</TabItem>
</Tabs>

#### 2. 使用 vector_store_ids 参数发起请求

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [{"role": "user", "content": "What does our company policy say about remote work?"}],
    "tools": [
        {
            "type": "file_search",
            "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"]
        }
    ]
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

# Make a completion request with vector_store_ids parameter
response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[{"role": "user", "content": "What does our company policy say about remote work?"}],
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>


## 过滤结果

按元数据（metadata）属性进行过滤。

**运算符**（OpenAI 风格，会自动转换）：
- `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`

**AWS 运算符**（直接使用）：
- `equals`, `notEquals`, `greaterThan`, `greaterThanOrEquals`, `lessThan`, `lessThanOrEquals`, `in`, `notIn`, `startsWith`, `listContains`, `stringContains`

<Tabs>
<TabItem value="single-filter" label="单个过滤条件">

```python
response = await litellm.acompletion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "What are the latest updates?"}],
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "key": "category",
            "value": "updates",
            "operator": "eq"
        }
    }]
)
```

</TabItem>

<TabItem value="and-filters" label="AND">

```python
response = await litellm.acompletion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "What are the policies?"}],
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "and": [
                {"key": "category", "value": "policy", "operator": "eq"},
                {"key": "year", "value": 2024, "operator": "gte"}
            ]
        }
    }]
)
```

</TabItem>

<TabItem value="or-filters" label="OR">

```python
response = await litellm.acompletion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "Show me technical docs"}],
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "or": [
                {"key": "category", "value": "api", "operator": "eq"},
                {"key": "category", "value": "sdk", "operator": "eq"}
            ]
        }
    }]
)
```

</TabItem>

<TabItem value="advanced-filters" label="AWS 运算符">

```python
response = await litellm.acompletion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "Find docs"}],
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "and": [
                {"key": "title", "value": "Guide", "operator": "stringContains"},
                {"key": "tags", "value": "important", "operator": "listContains"}
            ]
        }
    }]
)
```

</TabItem>

<TabItem value="proxy-filters" label="代理">

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [{"role": "user", "content": "What are our policies?"}],
    "tools": [{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "and": [
                {"key": "department", "value": "engineering", "operator": "eq"},
                {"key": "type", "value": "policy", "operator": "eq"}
            ]
        }
    }]
  }'
```

</TabItem>
</Tabs>

## 将结果限制给特定用户

启用了访问控制的 Knowledge Base（Kendra GenAI 索引，或带文档级 ACL 的数据源）只会返回某个用户有权查看的分块（chunk）。把该用户身份作为 Bedrock 的 `userContext` 传入，LiteLLM 会在 Retrieve 请求中转发它。该值按原样发送，由 Bedrock 负责校验：`userId` 必须是字符串。LiteLLM 不会把这个身份与代理密钥进行核对，因此只有当你信任调用方会如实标识用户时，才应允许其搜索带 ACL 的向量存储。

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import litellm

response = litellm.vector_stores.search(
    vector_store_id="YOUR_KNOWLEDGE_BASE_ID",
    custom_llm_provider="bedrock",
    query="What does our company policy say about remote work?",
    extra_body={"userContext": {"userId": "alice@example.com"}},
)
```

</TabItem>

<TabItem value="proxy-openai-sdk" label="代理（OpenAI SDK）">

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:4000", api_key="your-litellm-api-key")

response = client.vector_stores.search(
    vector_store_id="YOUR_KNOWLEDGE_BASE_ID",
    query="What does our company policy say about remote work?",
    extra_body={"userContext": {"userId": "alice@example.com"}},
)
```

</TabItem>

<TabItem value="proxy-curl" label="代理（curl）">

```bash
curl http://localhost:4000/v1/vector_stores/YOUR_KNOWLEDGE_BASE_ID/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "query": "What does our company policy say about remote work?",
    "userContext": {"userId": "alice@example.com"}
  }'
```

</TabItem>

<TabItem value="proxy-config" label="代理（config.yaml）">

在向量存储上设置 `user_context`，即可让针对该存储的每一次搜索都使用同一个身份；请求中携带的 `userContext` 会覆盖该设置。

```yaml
vector_store_registry:
  - vector_store_name: "bedrock-company-docs"
    litellm_params:
      vector_store_id: "YOUR_KNOWLEDGE_BASE_ID"
      custom_llm_provider: "bedrock"
      user_context:
        userId: "service-account@example.com"
```

</TabItem>
</Tabs>

## 访问搜索结果

了解如何在响应中访问向量存储的搜索结果：
- [访问搜索结果（非流式与流式）](../completion/knowledgebase#获取搜索结果引用)

## 延伸阅读

向量存储：
- [常驻（Always on）向量存储](https://docs.litellm.ai/docs/completion/knowledgebase#always-on-for-a-model)
- [列出 LiteLLM 代理上可用的向量存储](https://docs.litellm.ai/docs/completion/knowledgebase#listing-available-vector-stores)
- [LiteLLM 向量存储的工作原理](https://docs.litellm.ai/docs/completion/knowledgebase#how-it-works)
