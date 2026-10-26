---
title: GCP Memorystore IAM 身份验证
description: 使用服务账号（service account）而非密码，完成 LiteLLM 代理到 GCP Memorystore for Redis 的身份验证。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GCP Memorystore IAM 身份验证

通过 IAM 身份验证把 LiteLLM 的 Redis 缓存连接到 GCP Memorystore，代理将以服务账号（service account）身份完成认证，配置文件中不再出现任何 Redis 密码。

:::info

GCP 的 Redis IAM 身份验证目前仅支持 Redis 集群。如果使用 AWS ElastiCache 和 Valkey，请参阅 [AWS ElastiCache IAM 身份验证](./elasticache_iam.md)。如果使用 Azure Cache for Redis 和 Azure Managed Redis，请参阅 [Azure Redis Entra ID 身份验证](./azure_redis_ad.md)。

:::

```shell
uv add google-cloud-iam
```

<Tabs>

<TabItem value="gcp-iam-config" label="在 config.yaml 中设置">

Redis 集群搭配 GCP IAM 时的配置：

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: redis
    redis_startup_nodes:
      [{ "host": "10.128.0.2", "port": 6379 }, { "host": "10.128.0.2", "port": 11008 }]
    gcp_service_account: "projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com"
    ssl: true
    ssl_cert_reqs: null
    ssl_check_hostname: false
```

</TabItem>

<TabItem value="gcp-iam-env" label="在 .env 中设置">

你可以在 .env 中配置 GCP IAM Redis 身份验证：

Redis 集群配置如下：

```env
REDIS_CLUSTER_NODES='[{"host": "10.128.0.2", "port": 6379}, {"host": "10.128.0.2", "port": 11008}]'
REDIS_GCP_SERVICE_ACCOUNT="projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com"
REDIS_GCP_SSL_CA_CERTS="./server-ca.pem"
REDIS_SSL="True"
REDIS_SSL_CERT_REQS="None"
REDIS_SSL_CHECK_HOSTNAME="False"
```

**GCP 认证配置**

确保已配置好 GCP 凭据：

```shell
# 方式一：服务账号密钥文件
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# 方式二：如果在挂载了服务账号的 GCP 计算实例上运行
# 无需额外设置
```

</TabItem>

</Tabs>

代理启动后，可以通过 [`/cache/ping`](./caching.md#缓存调试---cacheping) 确认连接是否正常。关于 Redis 缓存的其余内容（包括集群拓扑与 TLS），请参阅 [Redis 和 Valkey](./caching_redis.md)。
