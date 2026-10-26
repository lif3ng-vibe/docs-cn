---
title: 缓存
description: 在 LiteLLM 代理上缓存 LLM 响应，降低开销与延迟。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 缓存

:::note

OpenAI/Anthropic 的提示缓存（Prompt Caching）见[这里](../completion/prompt_caching.md)

:::

缓存（caching）LLM 响应。LiteLLM 的缓存系统会存储并复用 LLM 响应，帮你省下成本、降低延迟。同一个请求发两次时，返回的是缓存中的响应，而不再调用 LLM API。

## 支持的缓存类型

| 缓存 | `cache_params.type` | 配置文档 |
| --- | --- | --- |
| Redis、Valkey、ElastiCache、Memorystore | `redis` | [Redis 与 Valkey](./caching_redis.md) |
| Redis 语义缓存 | `redis-semantic` | [语义缓存](./caching_semantic.md) |
| Valkey 语义缓存 | `valkey-semantic` | [语义缓存](./caching_semantic.md) |
| Qdrant 语义缓存 | `qdrant-semantic` | [语义缓存](./caching_semantic.md) |
| S3 存储桶 | `s3` | [S3 与 GCS](./caching_object_storage.md) |
| GCS 存储桶 | `gcs` | [S3 与 GCS](./caching_object_storage.md) |
| 内存 | `local` | [见下文](#内存缓存与磁盘缓存) |
| 磁盘 | `disk` | [见下文](#内存缓存与磁盘缓存) |

只要部署不止一个 worker，Redis 就是合理的默认选择。内存缓存只存在于单个 worker 进程内部，代理（proxy）跑四个 worker 就会有四份互不相通的缓存，命中率大致按 worker 数量等比下降。至于 Redis 还能带来哪些别的好处，参见[哪些场景需要 Redis](./redis_requirements.md)。

精确匹配缓存（exact-match cache，即 `redis`、`s3`、`gcs`、`local`、`disk`）以整个请求的哈希作为键，对话内容稍有不同就算未命中。语义缓存（semantic caching）则会把提示词（prompt）向量化，返回相似度超过阈值的最近匹配项，适合单次提问的场景，用在智能体（agentic）多轮流量上则很容易出错；启用前请先阅读[语义缓存](./caching_semantic.md)。

## 快速上手

### 第 1 步：在 config.yaml 中添加 `cache`

在 `config.yaml` 中加上 `cache` 键即可启用缓存。

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
  - model_name: text-embedding-ada-002
    litellm_params:
      model: text-embedding-ada-002

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True, litellm defaults to using a redis cache
```

### 第 2 步：将 Redis 凭证添加到 .env

```shell
REDIS_URL = ""        # REDIS_URL='redis://username:password@hostname:port/database'
## OR ##
REDIS_HOST = ""       # REDIS_HOST='redis-18841.c274.us-east-1-3.ec2.cloud.redislabs.com'
REDIS_PORT = ""       # REDIS_PORT='18841'
REDIS_PASSWORD = ""   # REDIS_PASSWORD='liteLlmIsAmazing'
```

命名空间、ACL 用户、集群与哨兵（sentinel）拓扑、TLS、IAM 认证，以及 `REDIS_*` 变量的完整列表，参见[Redis 与 Valkey](./caching_redis.md)。缓存客户端的单命令超时由 `cache_params.socket_timeout`（默认 5 秒）控制，而不是 `REDIS_SOCKET_TIMEOUT`；详见 [Redis socket_timeout](./caching_redis.md#redis-socket_timeout)。

### 第 3 步：使用配置文件启动代理

```shell
$ litellm --config /path/to/config.yaml
```

### 第 4 步：验证效果

<Tabs>
<TabItem value="chat_completions" label="/chat/completions">

把同一个请求发两次：

```shell
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
     "model": "{{openai_small}}",
     "messages": [{"role": "user", "content": "write a poem about litellm!"}],
     "temperature": 0.7
   }'

curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
     "model": "{{openai_small}}",
     "messages": [{"role": "user", "content": "write a poem about litellm!"}],
     "temperature": 0.7
   }'
```

</TabItem>
<TabItem value="responses" label="/v1/responses">

把同一个请求发两次：

```shell
curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
     "model": "{{openai_small}}",
     "input": "write a poem about litellm!"
   }'

curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
     "model": "{{openai_small}}",
     "input": "write a poem about litellm!"
   }'
```

</TabItem>
<TabItem value="embeddings" label="/embeddings">

把同一个请求发两次：

```shell
curl --location 'http://0.0.0.0:4000/embeddings' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "text-embedding-ada-002",
  "input": ["write a litellm poem"]
  }'

curl --location 'http://0.0.0.0:4000/embeddings' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "text-embedding-ada-002",
  "input": ["write a litellm poem"]
  }'
```

</TabItem>
</Tabs>

第二个响应来自缓存，并带有 `x-litellm-cache-key` 响应头，你可以把它传给 [`/cache/delete`](./caching_controls.md#deleting-cache-keys---cachedelete) 来删除对应条目。

设置 `cache: True` 且未指定 `supported_call_types` 时，缓存对 `/chat/completions`、`/completions`、`/embeddings`、`/audio/transcriptions`、`/rerank`、`/v1/responses` 和 `/v1/messages` 全部生效。想只对其中部分端点（endpoint）开启，参见[生效的调用类型](./caching_controls.md#控制缓存对哪些调用类型生效chatcompletionembeddings-等)。

在 `/v1/responses` 上，精确匹配缓存以请求体作为键，因此携带 `previous_response_id` 的请求与内联整段对话的请求是两个不同的键，多轮对话的每一轮都是独立的缓存条目。

## 内存缓存与磁盘缓存

两者都不依赖外部基础设施，也不会在 worker 或副本之间共享，适合本地开发，不适合生产环境。

<Tabs>
<TabItem value="local" label="内存缓存">

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: local
```

</TabItem>
<TabItem value="disk" label="磁盘缓存">

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: disk
    disk_cache_dir: /tmp/litellm-cache # OPTIONAL, default to ./.litellm_cache
```

</TabItem>
</Tabs>

## 缓存调试 - `/cache/ping`

LiteLLM 代理提供 `/cache/ping` 端点，用来检查缓存是否按预期工作。

**用法**

```shell
curl --location 'http://0.0.0.0:4000/cache/ping'  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**缓存健康时的预期响应**

```shell
{
    "status": "healthy",
    "cache_type": "redis",
    "ping_response": true,
    "set_cache_response": "success",
    "litellm_cache_params": {
        "supported_call_types": "['completion', 'acompletion', 'embedding', 'aembedding', 'atranscription', 'transcription']",
        "type": "redis",
        "namespace": "None"
    },
    "redis_cache_params": {
        "redis_client": "Redis<ConnectionPool<Connection<host=redis-16337.c322.us-east-1-2.ec2.cloud.redislabs.com,port=16337,db=0>>>",
        "redis_kwargs": "{'url': 'redis://:******@redis-16337.c322.us-east-1-2.ec2.cloud.redislabs.com:16337'}",
        "async_redis_conn_pool": "BlockingConnectionPool<Connection<host=redis-16337.c322.us-east-1-2.ec2.cloud.redislabs.com,port=16337,db=0>>",
        "redis_version": "7.2.0"
    }
}
```

## 后续步骤

用[缓存控制](./caching_controls.md)调整缓存哪些内容、缓存多久；各项设置的细节可在 [`cache_params` 参考](./caching_settings.md)中查阅；也可以按上面的表格配置具体的后端。
