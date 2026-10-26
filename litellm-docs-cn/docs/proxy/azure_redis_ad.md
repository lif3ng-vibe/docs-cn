---
title: Azure Redis Entra ID 身份验证
description: 使用 Microsoft Entra ID 代替访问密钥，对 LiteLLM 代理访问 Azure Cache for Redis 或 Azure Managed Redis 进行身份验证。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure Redis Entra ID 身份验证

使用 Microsoft Entra ID（旧称 Azure AD）把 LiteLLM 的 Redis 缓存接入 Azure Cache for Redis 或 Azure Managed Redis，代理会以托管标识（managed identity）或服务主体（service principal）的身份完成认证，配置里不再出现任何访问密钥。

## 为什么要用

采用 Entra ID 认证后，客户端以短时效的 Entra 访问令牌代替密码，Azure 会在每次建立连接时对照缓存上的访问策略分配进行校验。要收回访问权限，只需删除一条策略分配，不必轮换密钥再重新部署每个副本；而且每条连接都能追溯到租户里的某个具体身份。

LiteLLM 只构建一次 Entra 凭据（credential），并在代理的整个生命周期内保持其有效，因此 Azure SDK 内部的令牌缓存与静默刷新机制都能生效。每条新建的 Redis 连接都会用新鲜令牌完成认证，避免了这样一种故障模式：初始令牌约一小时后过期，连接池里的存量连接随之开始失败。

## 前提条件

需要安装 `azure-identity`，`litellm[proxy]` 与 Docker 镜像已自带。缓存必须启用 Entra ID 认证，并且代理所运行的身份需要在缓存上拥有数据访问策略；对响应缓存而言，Data Contributor 角色即可。Azure 的这类缓存只通过 TLS 对外提供服务，因此要设置 `ssl: true`，端口用 Azure Cache for Redis 的 6380 或 Azure Managed Redis 的 10000。

## 配置

设置 `azure_redis_ad_token: "true"`，并去掉密码。

<Tabs>

<TabItem value="config" label="在 config.yaml 中设置">

```yaml
litellm_settings:
  cache: true
  cache_params:
    type: redis
    host: my-cache.redis.cache.windows.net
    port: 6380
    ssl: true
    azure_redis_ad_token: "true"
```

</TabItem>

<TabItem value="env" label="在 .env 中设置">

```env
REDIS_HOST="my-cache.redis.cache.windows.net"
REDIS_PORT="6380"
REDIS_SSL="True"
REDIS_AZURE_AD_TOKEN="True"
REDIS_USERNAME="<object id of the proxy's identity>"
```

</TabItem>

</Tabs>

Azure Redis 实例在 `AUTH` 阶段通常要求以身份的对象（principal）ID 作为 Redis 用户名。请把 `REDIS_USERNAME` 环境变量设为该对象 ID；若不设置，LiteLLM 只会发送令牌，配置了 ACL 的实例可能会拒绝连接。

## 凭据解析方式

如果 `azure_client_id`、`azure_tenant_id`、`azure_client_secret` 三项都已设置（写在 `cache_params` 里，或通过标准的 `AZURE_CLIENT_ID`、`AZURE_TENANT_ID`、`AZURE_CLIENT_SECRET` 环境变量），LiteLLM 会以该服务主体身份认证。如果只设置了 `azure_client_id`，则以该用户分配的托管标识认证。否则回退到 `DefaultAzureCredential`，它涵盖系统分配的托管标识、Azure CLI 以及其他标准 azure-identity 机制。

## 配置项

| 配置项 | 是否必填 | 说明 |
| --- | --- | --- |
| `azure_redis_ad_token` | 必填 | 字符串 `"true"` 表示开启 Entra ID 认证。对应环境变量：`REDIS_AZURE_AD_TOKEN` |
| `azure_client_id` | 选填 | 用户分配的托管标识或服务主体的 Client ID。未设置时回退到 `AZURE_CLIENT_ID` |
| `azure_tenant_id` | 选填 | Tenant ID，与客户端密钥搭配使用。未设置时回退到 `AZURE_TENANT_ID` |
| `azure_client_secret` | 选填 | 服务主体密钥。未设置时回退到 `AZURE_CLIENT_SECRET` |

`REDIS_USERNAME` 只能通过环境变量设置；当缓存要求在 `AUTH` 时提供用户名，这里应填身份的对象 ID。

## 验证

通过代理 ping 一下缓存。返回健康即说明令牌已签发、Azure 已接受，并且一次写入已完整往返。

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

## 补充说明

同步 Redis 客户端在自定义 connect 函数内完成认证；异步客户端则把同一个活跃凭据包装进 redis-py 的凭据提供器（credential provider），每建立一条新连接都会查询它。两条路径共用同一个凭据对象，令牌续期在 Azure SDK 内部完成，无需重启。

如果在 Entra ID 之外还配置了 GCP IAM（`gcp_service_account`），GCP 路径优先生效，LiteLLM 会记录一条警告。如果同时配置了 AWS ElastiCache IAM（`aws_iam_auth`），则 Entra 路径优先，同样会输出警告。两者只能配置其一。自带 `credential_provider` 会覆盖以上全部行为。

## 故障排查

出现 `azure-identity is required for Azure AD Redis authentication` 说明自定义安装缺少这个包；`litellm[proxy]` 本身已包含它。

出现 `Azure AD authentication failed for Redis` 或 `WRONGPASS invalid username-password pair` 说明令牌已签发但被缓存拒绝。常见原因有：缓存未启用 Entra ID 认证、身份缺少数据访问策略分配，或 `REDIS_USERNAME` 与身份的对象 ID 不一致。

azure-identity 自身报错（例如 `DefaultAzureCredential failed to retrieve a token`）说明找不到任何凭据来源。请确认代理确实以你分配的托管标识运行，或 `AZURE_*` 相关变量已设置。

## 另请参阅

关于 Redis 缓存的其余内容，包括集群拓扑、命名空间与 TLS，都在 [Redis 与 Valkey](./caching_redis.md) 一页。AWS 相关见 [AWS ElastiCache IAM 身份验证](./elasticache_iam.md)；GCP 相关见 [GCP Memorystore IAM 身份验证](./gcp_memorystore_iam.md)。
