---
title: Redis 容量规划
description: 如何为 LiteLLM 代理做 Redis 容量规划，附 AWS、Azure 与 GCP 的实例推荐。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Redis 容量规划

本页介绍如何为 LiteLLM 代理服务器（Proxy Server）背后的 Redis 实例做容量规划；网关实例一旦超过一个，就应当部署 Redis。Postgres 的容量规划单独见[数据库容量规划](./db_sizing.md)。有关如何把 Redis 接入代理，参见[生产环境最佳实践](./prod.md#redis)中的 Redis 一节，以及 [Redis 缓存配置](./caching_redis.md)。

## 代理对 Redis 的要求

Redis 承载着速率限制（rate limit）计数器、路由器与冷却（cooldown）状态、响应缓存（response cache），以及在 `use_redis_transaction_buffer` 开启时的花费更新队列。这些都是存续时间很短的活动状态，而不是需要持久保存的历史记录，所以 Redis 要的是小而低延迟，而非大容量：即便在高流量下，几个 GB 的工作集也很正常。内存按你想缓存的内容预留余量即可，而不是随请求速率伸缩；吞吐量由 vCPU 数量决定，因为单个 Redis 进程是单线程的，TLS 终止还要与命令执行争抢同一个核心。

没有 Redis 时，每个实例各自独立执行速率限制，缓存命中也只停留在处理该请求的实例上，因此部署了十个 pod 时，整套系统实际执行的限额大约是所配置值的十倍。

## 按请求速率选型

| 持续 RPS | vCPU | 内存 |
|---------------|------|-----|
| Up to 1K | 2 | 8GB |
| 1K to 5K | 4 | 16GB |
| 5K+ | 8+ | 32GB+ |

请使用 Redis 7.0 或更新版本。容量应规划到正常运行期间不发生逐出（eviction），并且优先扩容而不是依赖逐出策略：速率限制计数器和排队中的花费更新都是实时的记账状态，一个在压力下开始逐出数据的实例，丢掉的不是缓存命中，而是花费更新和限流窗口。如果使用了事务缓冲区（transaction buffer），还应一并开启持久化，以免故障转移时丢弃已入队但尚未落盘到 Postgres 的花费更新。

在大约 1000 RPS 或 10 个实例规模以上，正是缓冲区在避免 Postgres 成为瓶颈，Redis 也因此成为记账链路的一部分，而不是可有可无的缓存；参见 [Redis 事务缓冲区](./prod.md#redis-事务缓冲区)。如果在高负载下看到 `Got exception from REDIS No connection available`，先调大 `cache_params` 里的 `max_connections`，再考虑换更大的实例，因为这个错误是客户端连接池耗尽，而不是服务端饱和。

## 云厂商推荐

<Tabs>
<TabItem value="aws" label="AWS">

在 Graviton 节点上使用 ElastiCache（Valkey 或 Redis OSS 引擎，7.x 或更新版本）：1K RPS 以内用 `cache.m7g.large`（6.38 GiB），再往上用 `cache.m7g.xlarge`（12.93 GiB）。[支持的节点类型](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/CacheNodes.SupportedTypes.html)一页列出了每种节点的可用内存，该数值低于实例的标称内存，选型时应以那一列为准，而不是看实例名称。生产环境请开启 [Multi-AZ 自动故障转移](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/AutoFailover.html)。单节点不够用时，优先考虑集群模式并配合 LiteLLM 的 [Redis Cluster 配置](./caching_redis.md#redis-cluster)，而不是换更大的节点，因为分片能把计数器键空间分散到多个进程上，而不是堆积在单个进程里。ElastiCache Serverless 适合普通缓存，但不支持[基于 valkey-search 的语义缓存（semantic caching）](./caching_semantic.md#valkey)，后者需要基于节点的集群。

</TabItem>
<TabItem value="azure" label="Azure">

使用 [Azure Managed Redis](https://learn.microsoft.com/en-us/azure/redis/overview) 的 Balanced 层级：其内存与 vCPU 之比为 4:1，并且与 Azure Cache for Redis 不同，实例可以拥有多个 vCPU。只承载计数器和路由器状态时，`B5`（6GB，2 vCPU）就够用；一旦开始缓存响应，`B10`（12GB，4 vCPU）是更稳妥的默认选择；`B20`（24GB，8 vCPU）可覆盖 5K RPS 一档。完整列表见[层级与 SKU 表](https://learn.microsoft.com/en-us/azure/redis/how-to-scale#performance-tiers)；如果瓶颈是吞吐量而不是容量，可以考虑 Compute Optimized。在较旧的 Azure Cache for Redis 上，请选 Premium 层级（`P1` 及以上）而非 Standard，因为 Basic 和 Standard 只运行在单个 vCPU 上。请启用可用区冗余（zone redundancy）；如果使用事务缓冲区，还要开启数据持久化。

</TabItem>
<TabItem value="gcp" label="GCP">

使用 [Memorystore for Redis Cluster](https://cloud.google.com/memorystore/docs/cluster/cluster-node-specification)，总容量等于节点类型乘以分片数，而不是由单一实例规格决定。3 个分片的 `redis-standard-small`（每节点可写 5.2GB）是合理的起点；3 个分片的 `redis-highmem-medium`（可写 10.4GB）可覆盖 1K 到 5K 一档；再往上应增加分片数而不是升级节点类型，这也是 Google 自己的性价比建议，因为单节点上 Redis 的性能并不会随 vCPU 数量线性扩展。`redis-shared-core-nano` 性能不稳定且没有 SLA，不要使用。通过 [Redis Cluster 配置](./caching_redis.md#redis-cluster)让 LiteLLM 连上集群即可。

</TabItem>
</Tabs>

## 监控要点

关注已用内存与 `maxmemory` 的对比以及逐出计数器，因为在这里逐出意味着悄无声息的正确性损失，而不只是缓存命中率下降。在 LiteLLM 一侧，有用的 Prometheus 指标包括：`litellm_redis_spend_update_queue_size` 和 `litellm_in_memory_spend_update_queue_size`，对应已入队但尚未写入的花费更新；`litellm_pod_lock_manager_size`，对应当前持有事务缓冲区落盘锁的 pod。客户端连接数同样值得留意：各家托管服务的每种实例规格都有连接数上限，而网关会按 worker 分别建立连接池。
