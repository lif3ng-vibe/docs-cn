---
title: Redis 与 Valkey 缓存
description: LiteLLM 代理 Redis 缓存的凭据、命名空间、ACL 用户、Cluster 与 Sentinel 拓扑，以及 TLS 配置。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Redis 与 Valkey 缓存

Redis 是 LiteLLM 的默认缓存，也是唯一一种在多个 worker 和副本之间共享的缓存。Valkey、AWS ElastiCache 和 GCP Memorystore 都兼容 Redis 协议，本页的全部内容对它们同样适用。

## 将代理连接到 Redis

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

在操作系统环境变量中设置 `REDIS_URL` 或 `REDIS_HOST`，即可启用缓存。

  ```shell
  REDIS_URL = ""        # REDIS_URL='redis://username:password@hostname:port/database'
  ## OR ## 
  REDIS_HOST = ""       # REDIS_HOST='redis-18841.c274.us-east-1-3.ec2.cloud.redislabs.com'
  REDIS_PORT = ""       # REDIS_PORT='18841'
  REDIS_PASSWORD = ""   # REDIS_PASSWORD='liteLlmIsAmazing'
  REDIS_USERNAME = ""   # REDIS_USERNAME='my-redis-username' [OPTIONAL] if your redis server requires a username
  REDIS_SSL = "True"    # REDIS_SSL='True' to enable SSL by default is False
  ```

### 其他 Redis kwargs

:::info
使用 `REDIS_*` 环境变量可以配置 Redis 客户端库的全部参数。推荐用这种方式调整 Redis 设置：它会自动把环境变量映射为 Redis 客户端的 kwargs。
:::

任何额外的 redis.Redis 参数都能传入：把变量名和值存入操作系统环境变量即可，写法如下：

```shell
REDIS_<redis-kwarg-name> = ""
```

例如：

```shell
REDIS_SSL = "True"
REDIS_SSL_CERT_REQS = "None" 
REDIS_MAX_CONNECTIONS = "20"
```

变量名的规则是 `REDIS_` 加上大写形式的 kwarg 名，比如连接池大小对应 `REDIS_MAX_CONNECTIONS`。并不存在 `REDIS_CONNECTION_POOL_KWARGS` 这个变量，设置了也不会生效。

:::warning
**注意**：非字符串类型的 Redis 参数（如整数、布尔值或复杂对象）不要用 `REDIS_*` 环境变量传递，否则可能在 Redis 客户端初始化时出错。这类参数请在 router 配置中改用 `cache_kwargs`。
:::

[**查看环境变量的读取方式**](https://github.com/BerriAI/litellm/blob/4d7ff1b33b9991dcf38d821266290631d9bcd2dd/litellm/_redis.py#L40)

然后启动代理：

```shell
$ litellm --config /path/to/config.yaml
```

## 命名空间

如果想给缓存键划分目录，可以设置一个命名空间（namespace），例如：

```yaml
litellm_settings:
  cache: true
  cache_params: # set cache params for redis
    type: redis
    namespace: "litellm.caching.caching"
```

之后键会以如下形式存储：

```
litellm.caching.caching:<hash>
```

## 受限 ACL 用户（Redis 7+ / Valkey）

如果安全策略要求代理以最小权限用户（而非 `default`）连接，可以先设置一个命名空间（方法同上），再为该用户授予命名空间对应的键模式和频道模式，以及所需的命令：

```bash
ACL SETUSER litellm-proxy on '>your-password' '~litellm:*' '&litellm:*' +@all
```

把其中的 `litellm` 替换为你的命名空间。设置了命名空间后，代理写入的每个键都位于 `<namespace>:` 之下，因此 `~<namespace>:*` 能覆盖全部键。没有命名空间时，代理的键名五花八门，实际上找不到一个能圈定 ACL 范围的键模式。

频道授权同样关键：Redis 7+ 和 Valkey 创建 ACL 用户时默认带 `resetchannels`，即拒绝所有 pub/sub 频道。代理需要订阅频道来完成配置同步和认证缓存失效，如果没有 `&<namespace>:*`（未设置命名空间时是 `&litellm_proxy.*`），日志中每隔几秒就会重复出现 `No permissions to access a channel; reconnecting in 5s`，配置变更也只能等到周期性重载时才会传播。

为 ACL 划定范围时还有两点需要了解：

- `general_settings.coordination_redis` 块（用于把协调功能指向响应缓存之外另一台 Redis）同样接受 `namespace`，可以用同样的方式限定其用户。
- 如果协调 Redis 仅通过 `REDIS_HOST` / `REDIS_PORT` 环境变量配置（没有 `cache_params` 的 redis 块），它就无法携带命名空间，此时其键不带前缀，连接用户需要一条不限定键模式的授权。

如果在代理日志中看到 `No permissions to access a key`，且花费追踪（spend tracking）反复记录 `Restoring N transaction sets to in-memory queues`，说明连接用户的 ACL 缺少上述某项授权。在未包含[命名空间分隔符修复](https://github.com/BerriAI/litellm/pull/38403)的代理版本上，字面名称以命名空间字符串开头的内部键（例如命名空间为 `litellm` 时的 `litellm_spend_update_buffer`）会被写到命名空间之外，即使授权齐全也会被拒绝；如果 Redis `ACL LOG` 中被拒的键不带前缀，请升级版本。

## Redis Cluster

让代理接入 Redis Cluster 有两种方式：在 `config.yaml` 的 `cache_params` 下配置 `redis_startup_nodes`，或设置环境变量 `REDIS_CLUSTER_NODES`（由 `{"host": ..., "port": ...}` 对象组成的 JSON 列表）。二选一即可。

<Tabs>

<TabItem value="redis-cluster-config" label="在 config.yaml 中设置">

```yaml
model_list:
  - model_name: "*"
    litellm_params:
      model: "*"

litellm_settings:
  cache: True
  cache_params:
    type: redis
    redis_startup_nodes: [{ "host": "127.0.0.1", "port": "7001" }]
```

</TabItem>

<TabItem value="redis-env" label="在 .env 中设置">

想在 .env 中配置 Redis 集群，设置 `REDIS_CLUSTER_NODES` 即可。

下面是 `REDIS_CLUSTER_NODES` 的**示例值**：

```
REDIS_CLUSTER_NODES = "[{"host": "127.0.0.1", "port": "7001"}, {"host": "127.0.0.1", "port": "7003"}, {"host": "127.0.0.1", "port": "7004"}, {"host": "127.0.0.1", "port": "7005"}, {"host": "127.0.0.1", "port": "7006"}, {"host": "127.0.0.1", "port": "7007"}]"
```

:::note

在 .env 中设置 Redis 集群节点的 Python 脚本示例：

```python
# List of startup nodes
startup_nodes = [
    {"host": "127.0.0.1", "port": "7001"},
    {"host": "127.0.0.1", "port": "7003"},
    {"host": "127.0.0.1", "port": "7004"},
    {"host": "127.0.0.1", "port": "7005"},
    {"host": "127.0.0.1", "port": "7006"},
    {"host": "127.0.0.1", "port": "7007"},
]

# set startup nodes in environment variables
os.environ["REDIS_CLUSTER_NODES"] = json.dumps(startup_nodes)
print("REDIS_CLUSTER_NODES", os.environ["REDIS_CLUSTER_NODES"])
```

:::

</TabItem>

</Tabs>

## Redis Sentinel

让代理接入 Redis Sentinel 部署同样有两种方式：在 `config.yaml` 的 `cache_params` 下配置 `service_name` 和 `sentinel_nodes`，或设置环境变量 `REDIS_SENTINEL_NODES`、`REDIS_SERVICE_NAME` 和 `REDIS_SENTINEL_PASSWORD`。

<Tabs>

<TabItem value="redis-sentinel-config" label="在 config.yaml 中设置">

```yaml
model_list:
  - model_name: "*"
    litellm_params:
      model: "*"

litellm_settings:
  cache: true
  cache_params:
    type: "redis"
    service_name: "mymaster"
    sentinel_nodes: [["localhost", 26379]]
    sentinel_password: "password" # [OPTIONAL]
```

</TabItem>

<TabItem value="redis-env" label="在 .env 中设置">

想在 .env 中配置 Redis Sentinel，设置 `REDIS_SENTINEL_NODES` 即可。

下面是 `REDIS_SENTINEL_NODES` 的**示例值**：

```env
REDIS_SENTINEL_NODES='[["localhost", 26379]]'
REDIS_SERVICE_NAME = "mymaster"
REDIS_SENTINEL_PASSWORD = "password"
```

:::note

在 .env 中设置 Redis Sentinel 节点的 Python 脚本示例：

```python
# List of startup nodes
sentinel_nodes = [["localhost", 26379]]

# set startup nodes in environment variables
os.environ["REDIS_SENTINEL_NODES"] = json.dumps(sentinel_nodes)
print("REDIS_SENTINEL_NODES", os.environ["REDIS_SENTINEL_NODES"])
```

:::

</TabItem>

</Tabs>

## TTL

```yaml
litellm_settings:
  cache: true
  cache_params: # set cache params for redis
    type: redis
    ttl: 600 # will be cached on redis for 600s
    # default_in_memory_ttl: Optional[float], default is None. time in seconds.
    # default_in_redis_ttl: Optional[float], default is None. time in seconds.
```

## SSL

只需在 .env 中设置 `REDIS_SSL="True"`，LiteLLM 就会自动读取。

```env
REDIS_SSL="True"
```

快速测试时也可以用 REDIS_URL，例如：

```
REDIS_URL="rediss://.."
```

但在生产环境中我们**不**推荐使用 REDIS_URL。我们注意到它与 redis_host、port 等配置方式相比存在性能差异。

## IAM 认证

两家主要的托管 Redis 服务都支持用短期签名令牌（而非密码）认证代理，这样配置文件和密钥存储里就完全不需要存放 Redis 密码。ElastiCache 和 Valkey 请参见 [AWS ElastiCache IAM 认证](./elasticache_iam.md)，Memorystore 请参见 [GCP Memorystore IAM 认证](./gcp_memorystore_iam.md)。

## Redis max_connections

可以在 Redis 的 `cache_params` 中设置 `max_connections` 参数。它会直接传给 Redis 客户端，控制连接池中同时连接的最大数量。如果遇到 `No connection available` 之类的报错，可以尝试调大该值：

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: redis
    max_connections: 100
```

`cache_params` 只决定响应缓存客户端的连接池大小。代理还可能持有另外两个 Redis 客户端，各自拥有独立的连接池：一是通过 `general_settings.coordination_redis` 配置的协调 Redis（用于花费追踪、跨 pod 速率限制、pod 锁），二是通过 `router_settings.redis_host` / `redis_port` / `redis_password` 配置的 router Redis。要调整它们的连接池，就在各自的配置块内设置 `max_connections`；`coordination_redis` 会把多余的配置项原样转发给 Redis 客户端，`router_settings.cache_kwargs` 对 router 客户端也是如此：

```yaml
general_settings:
  coordination_redis:
    host: os.environ/REDIS_HOST
    port: 6379
    max_connections: 100

router_settings:
  redis_host: os.environ/REDIS_HOST
  redis_port: 6379
  cache_kwargs:
    max_connections: 100
```

如果响应缓存已禁用且没有 `coordination_redis` 块，协调客户端将完全依据 `REDIS_*` 环境变量构建，此时应通过 `REDIS_MAX_CONNECTIONS` 设置其连接池大小。

## Redis socket_timeout

代理的缓存客户端对每条 Redis 命令最多等待 `socket_timeout` 秒，超时后抛出异常。默认值为 **5.0 秒**，由 `litellm/caching/redis_cache.py` 中的 `RedisCache.__init__` 设定。通过 `cache_params.socket_timeout` 设置；该值会原样传给 Redis 客户端，并对所有拓扑（独立实例、`REDIS_URL`、集群和 Sentinel）生效：

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: redis
    socket_timeout: 1.0 # seconds per Redis command, default 5.0
```

协调客户端和 router 客户端有各自独立的 5.0 秒默认值，并从各自的配置块读取同名配置项。高负载下花费追踪或限流记录的 `Timeout reading from <host>:6379` 来自协调客户端，因此应在其配置块中调大 `socket_timeout`，而不是改 `cache_params`：

```yaml
general_settings:
  coordination_redis:
    host: os.environ/REDIS_HOST
    port: 6379
    socket_timeout: 10.0

router_settings:
  redis_host: os.environ/REDIS_HOST
  redis_port: 6379
  cache_kwargs:
    socket_timeout: 10.0
```

环境变量 `REDIS_SOCKET_TIMEOUT`（默认 `0.1`）不会改变缓存客户端的超时时间。LiteLLM 只把它应用到构建时未显式指定 `socket_timeout` 的 Redis 客户端上，目前只有 `litellm/_redis.py` 中的 Sentinel 连接路径属于这种情况。代理缓存客户端总会传入自己的 `socket_timeout`（5.0 秒默认值，或你在 `cache_params` 中设置的值），而调用方 kwarg 的优先级高于 `REDIS_*` 环境变量映射，因此即使设置了 `REDIS_SOCKET_TIMEOUT`，缓存客户端仍按 5.0 秒运行。协调客户端和 router 客户端的构建方式相同，结论一致。缓存客户端经 Sentinel 连接时同样如此，因为在 Sentinel 默认值本该生效的场景里，它的 kwarg 已经存在。唯一的例外是 `cache_params` 中的 `socket_timeout: null`：它会让该 kwarg 被丢弃，从而放行 `REDIS_SOCKET_TIMEOUT`。

## 虚拟密钥认证缓存（Redis）

代理校验**虚拟密钥**（virtual key，即客户的 API 密钥）时会把结果缓存起来，避免每个请求都查询数据库。默认情况下，这份缓存**只存在于各个 worker 进程内**，因此每次部署后，新 pod 或新增的 Uvicorn worker 都要各自预热缓存，预热完成前可能触发更多数据库读取。

设置 `litellm_settings.enable_redis_auth_cache: true`，即可把虚拟密钥的认证数据镜像到 `litellm_settings.cache` / `cache_params` 所配置的**同一个 Redis 实例**中。此后 worker 和副本就能在整个集群范围内共享缓存的认证条目。

**前提条件**

- `litellm_settings.cache` 必须为 **`true`**（代理的 Redis 会在缓存初始化阶段一并初始化）。参见[全部配置项](./config_settings)。
- `cache_params.type` 必须为 **`redis`**（或按你的缓存配置使用 Redis Cluster）；认证缓存会挂载到该 Redis 客户端上。参见[受支持的 `cache_params`](./caching_settings.md#proxy-configyaml-中支持的-cache_params)。
- 可选：设置 **`general_settings.user_api_key_cache_ttl`**（单位为秒）。启用 Redis 认证缓存后，TTL 会同时作用于内存层和 Redis 层，过期键的失效时机保持一致。

示例：

```yaml
litellm_settings:
  cache: true
  enable_redis_auth_cache: true
  cache_params:
    type: redis
    host: os.environ/REDIS_HOST
    port: 6379

general_settings:
  user_api_key_cache_ttl: 300 # optional; seconds
```

:::tip

启动日志会区分这两种模式：设置 `enable_redis_auth_cache: true` 后，你应该能看到一条提示，说明虚拟密钥的查询结果已在多个 worker 之间共享。

:::

### 密钥对象的缓存 TTL

配置内存缓存保存密钥对象的时长（可减少数据库请求）：

```yaml
general_settings:
  user_api_key_cache_ttl: <your-number> #time in seconds
```

该值默认为 60 秒。

### 密钥对象的缓存容量

内存层默认每个 worker 保存 200 条条目，由虚拟密钥、团队、用户、终端用户和成员关系共用。活跃键数超过上限时，条目会在请求之间被淘汰，每次认证查询都会回落到数据库。请按实际键数调高上限：

```yaml
general_settings:
  user_api_key_cache_max_size: 5000 # entries per worker, must be a positive integer
```

同一配置项也支持运行时修改：在管理界面（Admin UI）的 Settings > Router Settings > General 中操作，或调用 `POST /config/field/update`；下一次配置重载时即可调整运行中缓存的大小，无需重启。`config.yaml` 中设置的值优先于数据库中的值。
