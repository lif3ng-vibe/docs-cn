import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 缓存：内存、Redis、S3、GCS、Redis 语义缓存、磁盘

[**查看源码**](https://github.com/BerriAI/litellm/blob/main/litellm/caching/caching.py)

:::info

- 使用代理服务器（Proxy Server）？相关文档见 [代理服务器缓存](https://docs.litellm.ai/docs/proxy/caching)。

- OpenAI/Anthropic 的提示词缓存（Prompt Caching）请看[这里](../completion/prompt_caching.md)。


:::

## 初始化缓存：内存、Redis、S3 存储桶、GCS 存储桶、Redis 语义、磁盘缓存、Qdrant 语义


<Tabs>

<TabItem value="redis" label="Redis 缓存">

安装 Redis
```shell
uv add redis
```

托管版本可在下方链接创建自己的 Redis 数据库：https://redis.io/try-free/

**Redis 基础缓存**

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

litellm.cache = Cache(type="redis", host="<host>", port="<port>", password="<password>")

# Make completion calls
response1 = completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

**GCP IAM Redis 认证**

针对启用 IAM 认证的 GCP Memorystore Redis：

```shell
uv add google-cloud-iam
```

```python
import litellm
from litellm import completion
# For Redis Cluster with GCP IAM
from litellm.caching.redis_cluster_cache import RedisClusterCache

litellm.cache = RedisClusterCache(
    startup_nodes=[
        {"host": "10.128.0.2", "port": 6379},
        {"host": "10.128.0.2", "port": 11008},
    ],
    gcp_service_account="projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com",
    ssl=True,
    ssl_cert_reqs=None,
    ssl_check_hostname=False,
)

# Make completion calls
response1 = completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

**GCP IAM Redis 的环境变量**

也可以改用环境变量来设置：

```shell
export REDIS_HOST="10.128.0.2"
export REDIS_PORT="6379"
export REDIS_GCP_SERVICE_ACCOUNT="projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com"
export REDIS_SSL="False"
```

然后直接初始化即可：

```python
litellm.cache = Cache(type="redis")
```

:::info
建议将 `REDIS_*` 环境变量作为配置所有 Redis 客户端库参数的主要方式。这种方式会自动把环境变量映射为 Redis 客户端的 kwargs，也是切换 Redis 设置的推荐做法。
:::

:::warning
如果需要传入非字符串类型的 Redis 参数（整数、布尔值、复杂对象等），请避免使用 `REDIS_*` 环境变量，这类参数在 Redis 客户端初始化时可能出错。此时应把它们作为 kwargs 直接传给 `Cache()` 构造函数。
:::

</TabItem>

<TabItem value="gcs" label="GCS 缓存">

设置环境变量

```shell
GCS_BUCKET_NAME="my-cache-bucket"
GCS_PATH_SERVICE_ACCOUNT="/path/to/service_account.json"
```

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

litellm.cache = Cache(type="gcs", gcs_bucket_name="my-cache-bucket", gcs_path_service_account="/path/to/service_account.json")

response1 = completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

</TabItem>


<TabItem value="s3" label="S3 缓存">

安装 boto3
```shell
uv add boto3
```

设置 AWS 环境变量

```shell
AWS_ACCESS_KEY_ID = "AKI*******"
AWS_SECRET_ACCESS_KEY = "WOl*****"
```

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

# pass s3-bucket name
litellm.cache = Cache(type="s3", s3_bucket_name="cache-bucket-litellm", s3_region_name="us-west-2")

# Make completion calls
response1 = completion(
    model="{{openai_small}}", 
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="{{openai_small}}", 
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

</TabItem>

<TabItem value="azureblob" label="Azure Blob 缓存">

安装 azure-storage-blob 和 azure-identity
```shell
uv add azure-storage-blob azure-identity
```

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
from azure.identity import DefaultAzureCredential

# pass Azure Blob Storage account URL and container name
litellm.cache = Cache(type="azure-blob", azure_account_url="https://example.blob.core.windows.net", azure_blob_container="litellm")

# Make completion calls
response1 = completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)
response2 = completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me a joke."}]
)

# response1 == response2, response 1 is cached
```

</TabItem>


<TabItem value="redis-sem" label="Redis 语义缓存">

安装 redisvl 客户端
```shell
uv add redisvl==0.4.1
```

托管版本可在下方链接创建自己的 Redis 数据库：https://redis.io/try-free/

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

random_number = random.randint(
    1, 100000
)  # add a random number to ensure it's always adding / reading from cache

print("testing semantic caching")
litellm.cache = Cache(
    type="redis-semantic",
    host=os.environ["REDIS_HOST"],
    port=os.environ["REDIS_PORT"],
    password=os.environ["REDIS_PASSWORD"],
    similarity_threshold=0.8, # similarity threshold for cache hits, 0 == no similarity, 1 = exact matches, 0.5 == 50% similarity
    ttl=120,
    redis_semantic_cache_embedding_model="text-embedding-ada-002", # this model is passed to litellm.embedding(), any litellm.embedding() model is supported here
)
response1 = completion(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response1: {response1}")

random_number = random.randint(1, 100000)

response2 = completion(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response2: {response1}")
assert response1.id == response2.id
# response1 == response2, response 1 is cached
```

</TabItem>

<TabItem value="qdrant-sem" label="Qdrant 语义缓存">

可以参照这篇指南搭建你自己的 Qdrant 云上集群：https://qdrant.tech/documentation/quickstart-cloud/

本地搭建 Qdrant 集群请参考：https://qdrant.tech/documentation/quickstart/
```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

random_number = random.randint(
    1, 100000
)  # add a random number to ensure it's always adding / reading from cache

print("testing semantic caching")
litellm.cache = Cache(
    type="qdrant-semantic",
    qdrant_api_base=os.environ["QDRANT_API_BASE"], 
    qdrant_api_key=os.environ["QDRANT_API_KEY"],
    qdrant_collection_name="your_collection_name", # any name of your collection
    similarity_threshold=0.7, # similarity threshold for cache hits, 0 == no similarity, 1 = exact matches, 0.5 == 50% similarity
    qdrant_quantization_config ="binary", # can be one of 'binary', 'product' or 'scalar' quantizations that is supported by qdrant
    qdrant_semantic_cache_embedding_model="text-embedding-ada-002", # this model is passed to litellm.embedding(), any litellm.embedding() model is supported here
    qdrant_semantic_cache_vector_size=1536, # vector size for the embedding model, must match the dimensionality of the embedding model used
)

response1 = completion(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response1: {response1}")

random_number = random.randint(1, 100000)

response2 = completion(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response2: {response2}")
assert response1.id == response2.id
# response1 == response2, response 1 is cached
```

</TabItem>

<TabItem value="valkey-sem" label="Valkey 语义缓存">

当你的向量存储是运行了 [valkey-search](https://github.com/valkey-io/valkey-search) 模块的 Valkey 实例时（例如 [AWS ElastiCache for Valkey](https://aws.amazon.com/elasticache/)），可以使用本方案。它不依赖 RediSearch 和 RedisVL，LiteLLM 直接通过 Redis 协议驱动 valkey-search。

:::info[前置要求]

服务器上必须已加载 `valkey-search` 模块（可运行 `MODULE LIST`，查看是否存在 `search` 或 `FT._LIST`）。在 AWS ElastiCache 上，向量搜索只支持 **基于节点的 Valkey 8.2 及以上版本集群**；cluster-mode-disabled 的节点组受支持且为推荐配置，主节点挂只读副本同样可以，只有水平分片不被支持。ElastiCache **Serverless 不支持向量搜索**，因此 serverless 端点在这里无法使用。多分片（cluster-mode-enabled）端点同样不受本后端支持，因为异步客户端无法把 `FT.*` 搜索命令路由到各个分片上；请改用纵向扩容。

:::

要在本地运行带 valkey-search 的 Valkey 实例，`valkey/valkey-bundle` 镜像已自带该模块：

```shell
docker run -d -p 6379:6379 valkey/valkey-bundle:8.1
```

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache

random_number = random.randint(
    1, 100000
)  # add a random number to ensure it's always adding / reading from cache

print("testing semantic caching")
litellm.cache = Cache(
    type="valkey-semantic",
    host=os.environ["VALKEY_HOST"],
    port=os.environ["VALKEY_PORT"],
    password=os.environ.get("VALKEY_PASSWORD"),  # omit for passwordless / IAM-auth clusters
    similarity_threshold=0.8, # similarity threshold for cache hits, 0 == no similarity, 1 = exact matches, 0.5 == 50% similarity
    ttl=120,
    valkey_semantic_cache_embedding_model="text-embedding-ada-002", # this model is passed to litellm.embedding(), any litellm.embedding() model is supported here
    valkey_semantic_cache_index_name="litellm_semantic_cache_index", # optional, defaults to litellm_semantic_cache_index
)
response1 = completion(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response1: {response1}")

random_number = random.randint(1, 100000)

response2 = completion(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": f"write a one sentence poem about: {random_number}",
        }
    ],
    max_tokens=20,
)
print(f"response2: {response2}")
assert response1.id == response2.id
# response1 == response2, response 1 is cached
```

`VALKEY_HOST`、`VALKEY_PORT`、`VALKEY_PASSWORD` 未设置时会回退到 `REDIS_HOST`、`REDIS_PORT`、`REDIS_PASSWORD`。对于启用传输加密（TLS）的 ElastiCache，既可以在 host 和 port 之外传 `ssl=True`，也可以直接传完整的 `redis_url="rediss://..."`。

</TabItem>

<TabItem value="in-mem" label="内存缓存">

### 快速上手

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

</TabItem>

<TabItem value="disk" label="磁盘缓存">

### 快速上手

先安装磁盘缓存扩展依赖：

```shell
uv add "litellm[caching]"
```

之后就可以像下面这样使用磁盘缓存。

```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
litellm.cache = Cache(type="disk")

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

把这段代码运行两次，第二次的 response1 会直接使用第一次运行时存入缓存文件的结果。

</TabItem>

</Tabs>

## 在每次 LiteLLM 调用时开启或关闭缓存

LiteLLM 支持 4 种缓存控制参数（cache-controls）：

- `no-cache`：*Optional(bool)* 设为 `True` 时，不返回缓存响应，而是真实调用端点。
- `no-store`：*Optional(bool)* 设为 `True` 时，不缓存该响应。
- `ttl`：*Optional(int)* 按用户指定的时长（秒）缓存响应。
- `s-maxage`：*Optional(int)* 只接受未超出用户指定时长（秒）的缓存响应。

[需要更多控制项？欢迎告诉我们](https://github.com/BerriAI/litellm/issues/1218)
<Tabs>
<TabItem value="no-cache" label="No-Cache">

`no-cache` 用法示例：设为 `True` 时，不返回缓存响应

```python
response = litellm.completion(
        model="{{openai_small}}",
        messages=[
            {
                "role": "user",
                "content": "hello who are you"
            }
        ],
        cache={"no-cache": True},
    )
```

</TabItem>

<TabItem value="no-store" label="No-Store">

`no-store` 用法示例：设为 `True` 时，不缓存该响应

```python
response = litellm.completion(
        model="{{openai_small}}",
        messages=[
            {
                "role": "user",
                "content": "hello who are you"
            }
        ],
        cache={"no-store": True},
    )
```

</TabItem>

<TabItem value="ttl" label="ttl">
`ttl` 用法示例：将响应缓存 10 秒

```python
response = litellm.completion(
        model="{{openai_small}}",
        messages=[
            {
                "role": "user",
                "content": "hello who are you"
            }
        ],
        cache={"ttl": 10},
    )
```

</TabItem>

<TabItem value="s-maxage" label="s-maxage">
`s-maxage` 用法示例：只接受 60 秒内的缓存响应

```python
response = litellm.completion(
        model="{{openai_small}}",
        messages=[
            {
                "role": "user",
                "content": "hello who are you"
            }
        ],
        cache={"s-maxage": 60},
    )
```

</TabItem>


</Tabs>

## 缓存上下文管理器：启用、禁用、更新缓存
使用上下文管理器即可轻松启用、禁用和更新 LiteLLM 缓存

### 启用缓存

快速上手，直接启用
```python
litellm.enable_cache()
```

高级参数

```python
def enable_cache(
    type: Optional[Literal["local", "redis", "s3", "gcs", "disk"]] = "local",
    host: Optional[str] = None,
    port: Optional[str] = None,
    password: Optional[str] = None,
    supported_call_types: Optional[
        List[Literal["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"]]
    ] = ["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"],
    **kwargs,
) -> None: ...
```

### 禁用缓存

关闭缓存
```python
litellm.disable_cache()
```

### 更新缓存参数（Redis 主机、端口等）

更新缓存参数

```python
def update_cache(
    type: Optional[Literal["local", "redis", "s3", "gcs", "disk"]] = "local",
    host: Optional[str] = None,
    port: Optional[str] = None,
    password: Optional[str] = None,
    supported_call_types: Optional[
        List[Literal["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"]]
    ] = ["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"],
    **kwargs,
) -> None: ...
```

## 自定义缓存键
定义一个返回缓存键的函数
```python
# this function takes in *args, **kwargs and returns the key you want to use for caching
def custom_get_cache_key(*args, **kwargs):
    # return key to use for your cache:
    key = kwargs.get("model", "") + str(kwargs.get("messages", "")) + str(kwargs.get("temperature", "")) + str(kwargs.get("logit_bias", ""))
    print("key for cache", key)
    return key

```

把你的函数设置为 litellm.cache.get_cache_key
```python
from litellm.caching.caching import Cache

cache = Cache(type="redis", host=os.environ['REDIS_HOST'], port=os.environ['REDIS_PORT'], password=os.environ['REDIS_PASSWORD'])

cache.get_cache_key = custom_get_cache_key # set get_cache_key function for your cache

litellm.cache = cache # set litellm.cache to your cache 

```
## 如何编写自定义的缓存读写函数
### 1. 初始化缓存
```python
from litellm.caching.caching import Cache
cache = Cache()
``` 

### 2. 定义自定义的缓存读写函数
```python
def add_cache(self, result, *args, **kwargs):
  ...
  
def get_cache(self, *args, **kwargs):
  ...
```

### 3. 将缓存的读写函数指向你自己的实现
```python
cache.add_cache = add_cache
cache.get_cache = get_cache
```

## 缓存初始化参数

```python
def __init__(
    self,
    type: Optional[Literal["local", "redis", "redis-semantic", "valkey-semantic", "s3", "gcs", "disk"]] = "local",
    supported_call_types: Optional[
        List[Literal["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"]]
    ] = ["completion", "acompletion", "embedding", "aembedding", "atranscription", "transcription"],
    ttl: Optional[float] = None,
    default_in_memory_ttl: Optional[float] = None,

    # redis cache params
    host: Optional[str] = None,
    port: Optional[str] = None,
    password: Optional[str] = None,
    namespace: Optional[str] = None,
    default_in_redis_ttl: Optional[float] = None,
    redis_flush_size=None,
    
    # GCP IAM Redis authentication params
    gcp_service_account: Optional[str] = None,
    gcp_ssl_ca_certs: Optional[str] = None,
    ssl: Optional[bool] = None,
    ssl_cert_reqs: Optional[Union[str, None]] = None,
    ssl_check_hostname: Optional[bool] = None,

    # redis semantic cache params
    similarity_threshold: Optional[float] = None,
    redis_semantic_cache_embedding_model: str = "text-embedding-ada-002",
    redis_semantic_cache_index_name: Optional[str] = None,

    # valkey semantic cache params (valkey-search module, e.g. ElastiCache for Valkey)
    valkey_semantic_cache_embedding_model: str = "text-embedding-ada-002",
    valkey_semantic_cache_index_name: Optional[str] = None,

    # semantic cache tenant scope: "key" (key/team/org) or "end_user" (also per end user)
    semantic_cache_scope: str = "key",

    # s3 Bucket, boto3 configuration
    s3_bucket_name: Optional[str] = None,
    s3_region_name: Optional[str] = None,
    s3_api_version: Optional[str] = None,
    s3_path: Optional[str] = None, # if you wish to save to a specific path
    s3_use_ssl: Optional[bool] = True,
    s3_verify: Optional[Union[bool, str]] = None,
    s3_endpoint_url: Optional[str] = None,
    s3_aws_access_key_id: Optional[str] = None,
    s3_aws_secret_access_key: Optional[str] = None,
    s3_aws_session_token: Optional[str] = None,
    s3_config: Optional[Any] = None,

    # disk cache params
    disk_cache_dir=None,

    # qdrant cache params
    qdrant_api_base: Optional[str] = None,
    qdrant_api_key: Optional[str] = None,
    qdrant_collection_name: Optional[str] = None,
    qdrant_quantization_config: Optional[str] = None,
    qdrant_semantic_cache_embedding_model="text-embedding-ada-002",

    qdrant_semantic_cache_vector_size: Optional[int] = None,
    **kwargs
): ...
```

## 日志记录

缓存命中会以 `kwarg["cache_hit"]` 的形式记录在成功事件中。

下面是访问它的示例：

  ```python
import litellm
from litellm.integrations.custom_logger import CustomLogger
from litellm import completion, acompletion, Cache

# create custom callback for success_events
class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time): 
        print(f"On Success")
        print(f"Value of Cache hit: {kwargs['cache_hit']}")

async def test_async_completion_azure_caching():
    # set custom callback
    customHandler_caching = MyCustomHandler()
    litellm.callbacks = [customHandler_caching]

    # init cache 
    litellm.cache = Cache(type="redis", host=os.environ['REDIS_HOST'], port=os.environ['REDIS_PORT'], password=os.environ['REDIS_PASSWORD'])
    unique_time = time.time()
    response1 = await litellm.acompletion(model="azure/chatgpt-v-2",
                            messages=[{
                                "role": "user",
                                "content": f"Hi 👋 - i'm async azure {unique_time}"
                            }],
                            caching=True)
    await asyncio.sleep(1)
    print(f"customHandler_caching.states pre-cache hit: {customHandler_caching.states}")
    response2 = await litellm.acompletion(model="azure/chatgpt-v-2",
                            messages=[{
                                "role": "user",
                                "content": f"Hi 👋 - i'm async azure {unique_time}"
                            }],
                            caching=True)
    await asyncio.sleep(1) # success callbacks are done in parallel
  ```
