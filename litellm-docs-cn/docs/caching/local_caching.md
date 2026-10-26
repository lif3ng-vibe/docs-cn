# LiteLLM - 本地缓存

## 开启缓存时对 `completion()` 与 `embedding()` 调用进行缓存

LiteLLM 实现了精确匹配缓存（exact match caching），并支持以下缓存方式：
* 内存缓存（In-Memory Caching，默认）
* Redis 缓存（本地）
* Redis 缓存（托管）

## 快速上手用法 - 对话补全
启用缓存后，缓存键（cache key）为 `model`，下面这个示例会命中缓存
```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
litellm.cache = Cache()

# Make completion calls
response1 = completion(
    model="{{openai_small}}", 
    messages=[{"role": "user", "content": "Tell me a joke."}],
    caching=True
)
response2 = completion(
    model="{{openai_small}}", 
    messages=[{"role": "user", "content": "Tell me a joke."}],
    caching=True
)

# response1 == response2, response 1 is cached
```

## 自定义键值对
向缓存中添加自定义键值对。

```python 
from litellm.caching.caching import Cache
cache = Cache()

cache.add_cache(cache_key="test-key", result="1234")

cache.get_cache(cache_key="test-key")
```

## 流式响应的缓存
LiteLLM 支持缓存流式响应。

### 用法
```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
litellm.cache = Cache()

# Make completion calls
response1 = completion(
    model="{{openai_small}}", 
    messages=[{"role": "user", "content": "Tell me a joke."}], 
    stream=True,
    caching=True)
for chunk in response1:
    print(chunk)
response2 = completion(
    model="{{openai_small}}", 
    messages=[{"role": "user", "content": "Tell me a joke."}], 
    stream=True,
    caching=True)
for chunk in response2:
    print(chunk)
```

## 用法 - Embedding()
1. 启用缓存后
缓存键为 `model`，下面这个示例会命中缓存
```python
import time
import litellm
from litellm import embedding
from litellm.caching.caching import Cache
litellm.cache = Cache()

start_time = time.time()
embedding1 = embedding(model="text-embedding-ada-002", input=["hello from litellm"*5], caching=True)
end_time = time.time()
print(f"Embedding 1 response time: {end_time - start_time} seconds")

start_time = time.time()
embedding2 = embedding(model="text-embedding-ada-002", input=["hello from litellm"*5], caching=True)
end_time = time.time()
print(f"Embedding 2 response time: {end_time - start_time} seconds")
```
