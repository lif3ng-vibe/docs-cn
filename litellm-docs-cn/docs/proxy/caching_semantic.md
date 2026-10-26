---
title: 语义缓存
description: 对相似但不完全相同的提示词返回缓存的 LLM 响应，并说明哪些流量形态下这种做法会出问题。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 语义缓存

语义缓存（semantic cache）会对提示词做嵌入（embedding），并返回余弦相似度超过 `similarity_threshold` 的最接近缓存响应，因此即使两次提示词并不相同、只是相似，也能命中缓存。
LiteLLM 为它提供三种后端：Qdrant、Valkey 和 Redis。由语义缓存返回的响应会带有 `x-litellm-semantic-similarity` 响应头。

:::warning

语义缓存是为单次（single-shot）提示词设计的。在多轮或智能体（agentic）流量上，它会重放陈旧响应。在这类工作负载上启用之前，请先阅读[语义缓存与多轮智能体流量](#语义缓存与多轮智能体流量)。

:::

## Qdrant

在 `config.yaml` 中添加 `cache` 键即可启用缓存。

### 步骤 1：在 config.yaml 中添加 `cache`

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
  - model_name: openai-embedding
    litellm_params:
      model: openai/text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True, litellm defaults to using a redis cache
  cache_params:
    type: qdrant-semantic
    qdrant_semantic_cache_embedding_model: openai-embedding # the model should be defined on the model_list
    qdrant_collection_name: test_collection
    qdrant_quantization_config: binary
    qdrant_semantic_cache_vector_size: 1536 # vector size must match embedding model dimensionality
    similarity_threshold: 0.8 # similarity threshold for semantic cache
```

### 步骤 2：将 Qdrant 凭据添加到 .env

```shell
QDRANT_API_KEY = "16rJUMBRx*************"
QDRANT_API_BASE = "https://5392d382-45*********.cloud.qdrant.io"
```

### 步骤 3：使用配置文件启动代理

```shell
$ litellm --config /path/to/config.yaml
```

### 步骤 4：测试

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

**语义缓存开启时，响应头中会出现 `x-litellm-semantic-similarity`**

## Valkey

在运行 [valkey-search](https://github.com/valkey-io/valkey-search) 模块的 Valkey 实例上使用语义缓存，例如 AWS ElastiCache for Valkey。不需要 RediSearch 和 RedisVL。

:::info[前提条件]

必须加载 `valkey-search` 模块（可用 `MODULE LIST` / `FT._LIST` 确认）。在 AWS ElastiCache 上，向量搜索需要**基于节点的 Valkey 8.2+ 集群**；支持并推荐使用 cluster-mode-disabled 的节点组，主节点带只读副本也可以，因为只有水平分片不受支持。ElastiCache **Serverless 不支持向量搜索**。多分片（cluster-mode-enabled）端点在此不受支持，请使用 cluster-mode-disabled 端点并纵向扩容。

:::

### 步骤 1：在 config.yaml 中添加 `cache`

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
  - model_name: openai-embedding
    litellm_params:
      model: openai/text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  set_verbose: True
  cache: True
  cache_params:
    type: valkey-semantic
    host: os.environ/VALKEY_HOST
    port: os.environ/VALKEY_PORT
    valkey_semantic_cache_embedding_model: openai-embedding # the model should be defined on the model_list
    valkey_semantic_cache_index_name: litellm_semantic_cache_index # optional
    similarity_threshold: 0.8 # similarity threshold for semantic cache
```

### 步骤 2：将 Valkey 凭据添加到 .env

```shell
VALKEY_HOST = "your-valkey-host"
VALKEY_PORT = "6379"
VALKEY_PASSWORD = "your-password" # omit for passwordless / IAM-auth clusters
```

对于启用了传输中加密（TLS）的 ElastiCache，在 `cache_params` 下添加 `ssl: true`，或者把 `cache_params.redis_url` 设为 `rediss://` URL 来代替 host 和 port。要在本地运行 valkey-search，执行 `docker run -d -p 6379:6379 valkey/valkey-bundle:8.1`。

### 步骤 3：使用配置文件启动代理

```shell
$ litellm --config /path/to/config.yaml
```

### 步骤 4：测试

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

**语义缓存开启时，响应头中会出现 `x-litellm-semantic-similarity`**

## Redis

在 `config.yaml` 中添加 `cache` 键即可启用缓存。

### 步骤 1：在 config.yaml 中添加 `cache`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
  - model_name: azure-embedding-model
    litellm_params:
      model: azure/azure-embedding-model
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True
  cache_params:
    type: "redis-semantic"
    similarity_threshold: 0.8 # similarity threshold for semantic cache
    redis_semantic_cache_embedding_model: azure-embedding-model # set this to a model_name set in model_list
```

Redis 凭据的设置方式与精确匹配的 Redis 缓存相同，参见 [Redis 与 Valkey](./caching_redis.md#将代理连接到-redis)。然后启动代理：

```shell
$ litellm --config /path/to/config.yaml
```

## 语义缓存与多轮智能体流量

语义缓存（`redis-semantic`、`qdrant-semantic`、`valkey-semantic`）会对整个 `messages` 数组的文本内容（包括系统提示词）做嵌入，并返回余弦相似度超过 `similarity_threshold` 的最接近缓存响应。

这对单次提示词效果很好，但并不适合多轮或智能体工作负载（编码智能体、工具调用循环，以及任何每一轮都重发完整对话的客户端）。新的每一轮都是上一轮请求加上一小段增量，因此相邻两轮的文本几乎相同，嵌入相似度约 0.99。在任何实际可用的阈值下，每一轮都会命中上一轮的缓存条目，客户端随即重放陈旧响应，典型表现就是智能体反复执行同一个工具调用。调高 `similarity_threshold` 也无法可靠解决这个问题。助手消息的 `tool_calls` 同样不在参与嵌入的文本之内，这让相邻两轮智能体请求更难区分。

建议把语义缓存留给单次流量，把智能体流量排除在外。最省事的做法是在智能体所用虚拟密钥（virtual key）的元数据中设置 `"cache": {"no-cache": true}`，代理会对该密钥上的每个请求生效，客户端无需任何改动；参见[按虚拟密钥的缓存控制](./caching_controls.md#按密钥的缓存控制)。也可以用 [`mode: default_off`](./caching_controls.md#将缓存设为默认关闭仅限显式开启) 让缓存对所有人默认关闭、按需开启，或者用[动态缓存控制](./caching_controls.md#动态缓存控制)让客户端按单个请求退出缓存。

如果仍然想为智能体流量启用缓存，请改用精确匹配缓存（`type: redis`）：它以完整请求的哈希作为键，对话有任何变化都是缓存未命中，因此不可能重放陈旧响应。

:::note

缓存只作用于 `supported_call_types` 中列出的调用类型。默认列表涵盖 `/chat/completions`、`/completions`、`/embeddings`、`/audio/transcriptions`、`/rerank`、`/responses` 和 `/v1/messages`（Anthropic 格式），因此使用 Anthropic Messages API 的智能体客户端会和 OpenAI 格式客户端一样命中语义缓存。提供商透传路由（如 `/anthropic/v1/messages`）则永远不会经过缓存。

:::

## 语义缓存与终端用户隔离

语义缓存的键有意不把提示词纳入其中，因此能把两个调用方区分开的只有租户范围：虚拟密钥、其所属团队和组织。默认情况下，同一个虚拟密钥背后的所有终端用户（end user）共享同一个语义缓存桶，为其中一人生成的响应（包括工具调用）可能被提供给另一人，只要后者通过同一密钥发送了语义相似的提示词。

在 `cache_params` 下设置 `semantic_cache_scope: end_user` 即可按终端用户进一步隔离缓存桶。终端用户 ID 取代理为请求认证出的那个（`user_api_key_end_user_id`）：来自 `x-litellm-customer-id` 请求头、配置的 `user_header_name`，或请求中的 `user` 字段。该值会同时从 `metadata` 和 `litellm_metadata` 读取，因此 `/v1/chat/completions`、`/v1/responses` 和 `/v1/messages` 都能覆盖。未携带终端用户 ID 的请求会回退到密钥/团队/组织层的缓存桶，而不是落入一个共享的空桶。默认值 `key` 保持现有的密钥/团队/组织范围。

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: redis-semantic
    similarity_threshold: 0.8
    redis_semantic_cache_embedding_model: my-embedding-model
    semantic_cache_scope: end_user # key (default) | end_user
```

当缓存类型为 `redis-semantic` 时，同样的设置也可以在管理界面（Admin UI）的 Caching -> Cache Settings 下找到，名为 "Semantic Cache Scope"。

## 语义缓存与嵌入端点过慢

语义缓存会在每次请求前对提示词做嵌入，而这次嵌入调用是内联执行的，在它结束之前请求无法到达 LLM。LiteLLM 把这一步限制在 5 秒内。超过时限后，查找被放弃，响应带有 `x-litellm-semantic-similarity: 0.0`，请求按缓存未命中继续发给模型。因此，一个不可达或挂起的嵌入端点只会多花几秒，而不会卡住请求。

如果你的嵌入端点确实比这更慢，可以调高时限：既可以在 `cache_params` 下用 `semantic_cache_embedding_timeout` 按缓存配置，也可以用 `SEMANTIC_CACHE_EMBEDDING_TIMEOUT_SECONDS` 环境变量全局设置。

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: redis-semantic
    similarity_threshold: 0.8
    redis_semantic_cache_embedding_model: my-embedding-model
    semantic_cache_embedding_timeout: 10.0
```

请记住，调高的时限就是嵌入端点停止响应时每个请求要等待的时长，因此请把它保持在接近该端点真实延迟的水平。
