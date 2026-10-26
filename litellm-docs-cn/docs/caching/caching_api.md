# 托管缓存：api.litellm.ai（已移除）

由 api.litellm.ai 提供的托管缓存（hosted cache）已从 LiteLLM 中移除。`"hosted"` 不是 `Cache(type=...)` 的合法取值，传入它会让缓存没有后端，从而在下一次调用 `completion()` 时抛出 `AttributeError: 'Cache' object has no attribute 'cache'`

请改用其他受支持的后端：`local`（默认值，内存缓存）、`redis`、`redis-semantic`、`valkey-semantic`、`qdrant-semantic`、`s3`、`gcs`、`azure-blob` 或 `disk`。各后端的配置方法见[缓存：内存、Redis、s3、gcs、Redis 语义缓存、磁盘](./all_caches.md)。下文示例均使用默认的内存缓存。

## 快速上手：补全（completion）
```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
litellm.cache = Cache() # in-memory cache

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


## 用法：Embedding()

```python
import time
import litellm
from litellm import completion, embedding
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

## 流式响应的缓存
LiteLLM 可以帮你缓存流式返回的响应。

### 用法
```python
import litellm
import time
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

time.sleep(1) # cache is updated asynchronously

response2 = completion(
    model="{{openai_small}}", 
    messages=[{"role": "user", "content": "Tell me a joke."}], 
    stream=True,
    caching=True)
for chunk in response2:
    print(chunk)
```
