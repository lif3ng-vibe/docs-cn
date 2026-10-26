import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

# AWS ElastiCache IAM 身份验证

通过 IAM 身份验证（IAM authentication）把 LiteLLM 的 Redis 缓存接入 AWS ElastiCache（Redis OSS 或 Valkey），这样配置文件、环境变量或密钥存储里都不会出现 Redis 密码

## 为什么使用

ElastiCache 和 Valkey 说的都是 Redis 协议，LiteLLM 一直能与它们通信，缺的只是身份验证这一环。启用 IAM 身份验证后，客户端不再提交密码，而是出示一枚短时效的 AWS SigV4 令牌，ElastiCache 会在每次建连时对照你的 IAM 策略加以校验

这能带来静态 Redis 密码给不了的四点好处。访问授权来自 IAM 而非共享密钥，吊销时只需解绑策略，不必轮换密码再重新部署每个副本。每一次连接尝试都能定位到具体的 IAM 主体。令牌本身只有 15 分钟有效期，且每个新连接都会重新签名，即使泄露也几乎无利用价值。签名凭证取自标准 AWS 凭证链，跑在 IRSA、EC2 实例配置文件或 ECS 任务角色下的代理会自行获取轮换后的凭证，全程无需重启

在此之前，启用 IAM 身份验证得给 `redis-py` 传入一个 Python 凭证提供器对象，而 YAML 配置无法表达这种东西，运维只能给 LiteLLM 打补丁或自己写集成。现在只需四个配置项

## 前提条件

缓存必须开启传输加密。IAM 身份验证若跑在明文连接上，LiteLLM 会直接拒绝启动而不是悄悄降级，因此 `ssl: true` 是必填项。ElastiCache Serverless 始终启用传输加密；自设计集群（self-designed cluster）则必须在创建时带上 `--transit-encryption-enabled`

还需要安装 `boto3`（`litellm[proxy]` 已自带），并以 IAM 模式创建一个 ElastiCache 用户。ElastiCache 要求这类用户的 name 与 id 完全一致

## 操作演练

下面以 EKS 上的 LiteLLM 代理为例，通过 IRSA 向 ElastiCache Serverless Valkey 缓存完成身份验证。示例中的账号 ID、区域和名称请替换成你自己的

### 1. 在 IAM 模式下创建 ElastiCache 用户

用户名与用户 id 必须一致；访问字符串（access string）决定代理在 Redis 内能做什么。`on ~* +@all` 授予全部键空间，这正是响应缓存（response cache）所需要的

```shell
aws elasticache create-user \
  --user-id litellm-cache \
  --user-name litellm-cache \
  --engine valkey \
  --authentication-mode Type=iam \
  --access-string "on ~* +@all"
```

### 2. 将用户加入用户组并挂到缓存上

每个用户组都必须有一个名为 `default` 的成员。如果该引擎下还没有，就先创建一个已禁用的占位用户，让真正的访问走你的 IAM 用户

```shell
aws elasticache create-user-group \
  --user-group-id litellm-cache-users \
  --engine valkey \
  --user-ids default-placeholder litellm-cache

aws elasticache create-serverless-cache \
  --serverless-cache-name litellm-cache \
  --engine valkey \
  --user-group-id litellm-cache-users \
  --security-group-ids sg-0123456789abcdef0 \
  --subnet-ids subnet-0123456789abcdef0 subnet-0fedcba9876543210
```

若要把用户组挂到已有缓存上，改用 `modify-serverless-cache --user-group-id` 或 `modify-replication-group --user-group-ids`

### 3. 向代理运行角色授予 `elasticache:Connect` 权限

策略必须同时写明缓存与用户，只授权其一，连接时都会被直接拒绝

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "elasticache:Connect",
      "Resource": [
        "arn:aws:elasticache:us-east-1:123456789012:serverlesscache:litellm-cache",
        "arn:aws:elasticache:us-east-1:123456789012:user:litellm-cache"
      ]
    }
  ]
}
```

把该策略附加到服务账户代入的 IAM 角色上，并给服务账户加上注解，让 Pod 拿到该角色

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: litellm
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/litellm-proxy
```

如果是自设计集群，缓存 ARN 则为
`arn:aws:elasticache:<region>:<account>:replicationgroup:<replication-group-id>`

### 4. 将 LiteLLM 指向缓存

ElastiCache Serverless 以及所有开启集群模式的缓存都要用 `redis_startup_nodes`，因为两者都要求客户端具备集群感知能力。`aws_iam_cache_name` 填缓存名称而非端点主机名，因为参与签名的是这个名称

<Tabs>

<TabItem value="serverless" label="Serverless">

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: redis
    redis_startup_nodes:
      [{ "host": "litellm-cache-abc123.serverless.use1.cache.amazonaws.com", "port": 6379 }]
    ssl: true
    aws_iam_auth: true
    aws_iam_user_name: litellm-cache
    aws_iam_cache_name: litellm-cache
    aws_iam_region: us-east-1
    aws_iam_serverless: true
```

</TabItem>

<TabItem value="self-designed" label="自设计集群">

对于关闭集群模式的复制组（replication group），把 `host` 指向主端点，且不设置 `aws_iam_serverless`。`aws_iam_cache_name` 填复制组 id

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: redis
    host: master.litellm-cache.abc123.use1.cache.amazonaws.com
    port: 6379
    ssl: true
    aws_iam_auth: true
    aws_iam_user_name: litellm-cache
    aws_iam_cache_name: litellm-cache
    aws_iam_region: us-east-1
```

</TabItem>

<TabItem value="env" label="环境变量">

每个配置项都有带 `REDIS_` 前缀的等价环境变量；当取值来自密钥管理器（secret manager）或 Helm values 文件时，用环境变量更合适

```shell
REDIS_CLUSTER_NODES='[{"host": "litellm-cache-abc123.serverless.use1.cache.amazonaws.com", "port": 6379}]'
REDIS_SSL="True"
REDIS_AWS_IAM_AUTH="True"
REDIS_AWS_IAM_USER_NAME="litellm-cache"
REDIS_AWS_IAM_CACHE_NAME="litellm-cache"
REDIS_AWS_IAM_REGION="us-east-1"
REDIS_AWS_IAM_SERVERLESS="True"
```

</TabItem>

</Tabs>

### 5. 上线并验证

通过代理对缓存做一次 ping。返回健康即说明 SigV4 令牌已完成签名、被 ElastiCache 接受，且一次写入成功完成了往返

```shell
curl -s -X GET 'http://localhost:4000/cache/ping' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

```json
{
  "status": "healthy",
  "cache_type": "redis",
  "ping_response": true,
  "set_cache_response": "success"
}
```

然后把同一个补全请求发两遍，确认缓存真的在承接流量。第二次调用会返回相同的响应 id，耗时只有第一次的零头

```shell
curl -s -X POST 'http://localhost:4000/v1/chat/completions' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "ping"}], "temperature": 0}'
```

## 配置项

| 配置项 | 是否必填 | 说明 |
| --- | --- | --- |
| `aws_iam_auth` | 是 | 开启 ElastiCache IAM 身份验证。接受布尔值或真值字符串 |
| `aws_iam_user_name` | 是 | ElastiCache 用户名，必须与该用户的 user id 一致 |
| `aws_iam_cache_name` | 是 | 无服务器缓存名称或复制组 id。该名称参与签名，因此不是端点主机名 |
| `aws_iam_region` | 否 | 签名所用区域。先回退到 `AWS_REGION`，再回退到 `AWS_DEFAULT_REGION` |
| `aws_iam_serverless` | 否 | 用于 ElastiCache Serverless 缓存。会在被签名的请求中附加 `ResourceType=ServerlessCache` |

这些配置还需搭配 `ssl: true`。开启了 IAM 身份验证但缺少 TLS，或缺少任一必填项时，LiteLLM 都会在启动时直接报错，让配置错误当场暴露，而不是等到高负载下才演变成一次身份验证失败

## 注意事项

AWS 凭证通过标准 boto3 凭证链解析，因此 IRSA、实例配置文件、ECS 任务角色、`AWS_PROFILE` 和静态密钥都开箱即用。LiteLLM 保留的是解析后的凭证对象本身而非其快照，正因如此，会轮换的凭证来源才能在长期运行的代理里持续生效

如果在 AWS IAM 之外还配置了 GCP IAM（`gcp_service_account`）或 Azure AD（`azure_redis_ad_token`），GCP 或 Azure 的路径会优先生效，LiteLLM 会记录一条警告。请只配置其中一种

自行提供 `credential_provider` 会覆盖以上全部逻辑；对于 LiteLLM 尚未建模的身份验证流程，这仍是逃生通道

## 故障排查

报错 `AWS ElastiCache IAM Redis authentication requires TLS` 说明 `cache_params` 里少了 `ssl: true`，或者你提供的 `url` 用的是 `redis://` 协议而不是 `rediss://`

报错 `AWS ElastiCache IAM Redis authentication requires: <setting>` 会点名你漏掉的配置项

Redis 返回 `invalid username-password pair or user is disabled` 说明令牌格式正确但被 AWS 拒绝。常见原因有：`aws_iam_cache_name` 与缓存对不上、用户不在挂到该缓存的用户组里，或 IAM 策略缺了缓存 ARN 或用户 ARN

报错 `Unable to resolve AWS credentials for ElastiCache IAM Redis authentication` 说明 boto3 凭证链一无所获，即 Pod 没有绑定角色，或环境里没有任何凭证

## 另请参阅

关于 Redis 缓存的其余内容，包括集群拓扑、命名空间与 TLS，都在 [Redis 与 Valkey](./caching_redis.md) 一页。Memorystore 参见 [GCP Memorystore IAM 身份验证](./gcp_memorystore_iam.md)；Azure 参见 [Azure Redis Entra ID 身份验证](./azure_redis_ad.md)
