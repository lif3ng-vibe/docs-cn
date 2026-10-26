---
title: 缓存控制
description: 控制 LiteLLM 代理缓存哪些内容、缓存多久，可按请求、按虚拟密钥或在整个代理范围内设置。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 缓存控制

缓存一旦开启，就会作用于所有受支持的调用类型。本页介绍如何缩小这一范围：在请求体里传入 `cache` 对象按请求控制，通过密钥元数据按虚拟密钥（virtual key）控制，以及通过 `cache_params` 在整个代理范围内控制。

## 动态缓存控制

| 参数        | 类型             | 说明                                                                              |
| ----------- | ---------------- | --------------------------------------------------------------------------------- |
| `ttl`       | _Optional(int)_  | 按用户自定义的时长（秒）缓存响应                                                  |
| `s-maxage`  | _Optional(int)_  | 只接受在用户自定义时间范围（秒）以内的缓存响应                                    |
| `no-cache`  | _Optional(bool)_ | 不把响应存入缓存。                                                                |
| `no-store`  | _Optional(bool)_ | 不缓存该响应                                                                      |
| `namespace` | _Optional(str)_  | 将响应缓存到用户自定义的命名空间下                                                |

每个缓存参数都可以按请求单独控制。下面给出每个参数的示例：

### `ttl`

设置缓存响应的时长（秒）。

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="{{openai_small}}",
    extra_body={
        "cache": {
            "ttl": 300  # Cache response for 5 minutes
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "cache": {"ttl": 300},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

### `s-maxage`

只接受不超过指定时长（秒）的缓存响应。

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="{{openai_small}}",
    extra_body={
        "cache": {
            "s-maxage": 600  # Only use cache if less than 10 minutes old
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "cache": {"s-maxage": 600},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

### `no-cache`

强制绕过缓存，返回全新响应。

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="{{openai_small}}",
    extra_body={
        "cache": {
            "no-cache": True  # Skip cache check, get fresh response
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "cache": {"no-cache": true},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

### `no-store`

不把响应存入缓存。

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="{{openai_small}}",
    extra_body={
        "cache": {
            "no-store": True  # Don't cache this response
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "cache": {"no-store": true},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

### `namespace`

将响应存到指定的缓存命名空间下。

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": "Hello"}],
    model="{{openai_small}}",
    extra_body={
        "cache": {
            "namespace": "my-custom-namespace"  # Store in custom namespace
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "cache": {"namespace": "my-custom-namespace"},
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

</TabItem>
</Tabs>

## 按密钥的缓存控制

在虚拟密钥的元数据中设置 `cache` 字段，代理就会把它应用到使用该密钥发出的每个请求上，客户端无需任何改动。这是让某一类流量绕开缓存、其余场景照常缓存的常用做法。

```shell
curl http://localhost:4000/key/generate \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {"cache": {"no-cache": true}}
  }'
```

密钥级缓存控制支持：`ttl`、`s-maxage`、`no-cache`、`no-store`。

## 将缓存设为默认关闭（仅限显式开启）

1. **为缓存设置 `mode: default_off`**

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

# default off mode
litellm_settings:
  set_verbose: True
  cache: True
  cache_params:
    mode: default_off # 👈 Key change cache is default_off
```

2. **缓存默认关闭时显式启用缓存**

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
import os
from openai import OpenAI

client = OpenAI(api_key="<litellm-api-key>", base_url="http://0.0.0.0:4000")

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="{{openai_small}}",
    extra_body = {        # OpenAI python accepts extra args in extra_body
        "cache": {"use-cache": True}
    }
)
```

</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "cache": {"use-cache": True}
    "messages": [
      {"role": "user", "content": "Say this is a test"}
    ]
  }'
```

</TabItem>

</Tabs>

## 控制缓存对哪些调用类型生效（`/chat/completion`、`/embeddings` 等）

默认情况下，缓存对所有调用类型生效。通过在 `cache_params` 中设置 `supported_call_types`，可以控制缓存对哪些调用类型生效。

**缓存只对 `supported_call_types` 中指定的调用类型开启**

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: redis
    supported_call_types:
      ["acompletion", "atext_completion", "aembedding", "atranscription", "aresponses"]
      # /chat/completions, /completions, /embeddings, /audio/transcriptions, /v1/responses
```

## 仅为代理开启缓存，而不作用于实际的 LLM API 调用

如果你只是想启用限流（rate limiting）、跨实例负载均衡（load balancing）这类功能，就可以用这个配置。

将 `supported_call_types` 设为 `[]`，即可在实际 API 调用上关闭缓存。

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: redis
    supported_call_types: []
```

## 删除缓存键：`/cache/delete` {#deleting-cache-keys---cachedelete}

要删除某个缓存键，向 `/cache/delete` 发送请求，并在 `keys` 中指定要删除的键。

示例

```shell
curl -X POST "http://0.0.0.0:4000/cache/delete" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{"keys": ["586bf3f3c1bf5aecb55bd9996494d3bbc69eb58397163add6d49537762a7548d", "key2"]}'
```

```shell
# {"status":"success"}
```

### 查看响应中的缓存键

可以在响应头中查看 cache_key。命中缓存时，缓存键会通过 `x-litellm-cache-key` 响应头返回。

```shell
curl -i --location 'http://0.0.0.0:4000/chat/completions' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "user": "ishan",
    "messages": [
        {
        "role": "user",
        "content": "what is litellm"
        }
    ],
}'
```

LiteLLM 代理返回的响应

```text
date: Thu, 04 Apr 2024 17:37:21 GMT
content-type: application/json
x-litellm-cache-key: 586bf3f3c1bf5aecb55bd9996494d3bbc69eb58397163add6d49537762a7548d

{
    "id": "chatcmpl-9ALJTzsBlXR9zTxPvzfFFtFbFtG6T",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "I'm sorr.."
                "role": "assistant"
            }
        }
    ],
    "created": 1712252235,
}

```

## 提供商特有可选参数的缓存

默认情况下，LiteLLM 的缓存键只包含标准 OpenAI 参数。但部分提供商（provider，如 Vertex AI）会使用一些影响输出的额外参数，这些参数不会被纳入标准缓存键的生成过程。

### 开启提供商特有参数缓存

在 `config.yaml` 中加入以下设置，即可把提供商特有的可选参数纳入缓存键：

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: "redis"
  enable_caching_on_provider_specific_optional_params: True  # Include provider-specific params in cache keys
```
