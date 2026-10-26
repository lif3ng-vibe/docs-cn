---
title: 数据库容量规划
description: 如何为 LiteLLM 代理背后的 Postgres 做容量规划，并给出 AWS、Azure 与 GCP 的实例推荐。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 数据库容量规划

本页介绍如何为 LiteLLM 代理背后的 Postgres 实例做容量规划。只要用上虚拟密钥（virtual key）或用量统计（usage tracking），这个数据库就是必需的。网关吞吐、延迟与测试配置见[网关基准测试](../benchmarks.md)；Redis 的容量规划单独见 [Redis 容量规划](./redis_sizing.md)。与本页选型配套的配置项见[生产环境最佳实践](./prod.md)；数据库里实际存了什么，见[数据库中存储的内容](./db_info.md)。

## 代理对数据库的要求

Postgres 同时处在认证路径和记账路径上，而这两种负载的形态截然不同。认证是每个请求对 `LiteLLM_VerificationToken`、`LiteLLM_UserTable` 和 `LiteLLM_TeamTable` 做少量索引点查，而且有缓存，稳态下几乎不给数据库带来负担。记账才是昂贵的那一半：花费要写回密钥、用户、团队和组织的行，每个请求的日志行还会落入 `LiteLLM_SpendLogs`。决定所需实例规格的是这条写入路径而非读取路径，这也是为什么对数据库容量规划来说，[批量写入花费](./prod.md#批量写入花费数据)与（RPS 大约超过 1000 之后的）[Redis 事务缓冲区](./prod.md#redis-事务缓冲区)，比原始请求量更值得优先关注。

## 按请求速率选型

下表按上文的写入路径估算。存储主要被 `LiteLLM_SpendLogs` 占用，因此取决于保留策略而非吞吐量：不存提示词时，每条请求日志大约按 1 到 2 KB 预留；开启 `store_prompts_in_spend_logs` 后按其 10 倍估算。

| 持续 RPS | vCPU | 内存 | 存储 | 所需连接数 |
|---------------|------|-----|---------|--------------------|
| 1K 以内 | 4 | 16GB | 200GB SSD，3000+ IOPS | 100 到 200 |
| 1K 到 5K | 8 | 32GB | 500GB SSD，5000+ IOPS | 200 到 500 |
| 5K 以上 | 16+ | 64GB | 1TB+ SSD，10000+ IOPS | 500+，另加一个[只读副本](./db_read_replica.md) |

## 连接数先于 CPU 成为瓶颈

你最可能撞上的故障是 `FATAL: sorry, too many clients already`，而不是数据库 CPU 饱和。LiteLLM 的连接池上限按每个 worker 进程计，因此总需求是 `database_connection_pool_limit × workers_per_instance × instances`，其中起决定作用的实例数是自动伸缩器的 `maxReplicas`，而不是当前的副本数。一个 `maxReplicas: 100` 的部署在默认连接池上限 10 之下会申请 1000 个连接，已经超出多数托管 Postgres 实例默认设置能接受的范围。请用配置参考里的[除法公式](./configs.md#配置数据库连接池上限与连接超时)确定连接池大小，并把 `maxReplicas` 压到数据库真正承受得住的数值。

各云厂商都从实例内存推导默认的 `max_connections`，因此升配或降配时这个上限也会跟着变：

| 云厂商 | 默认 `max_connections` | 参考 |
|-------|---------------------------|-----------|
| AWS RDS 和 Aurora | `LEAST({DBInstanceClassMemory/9531392}, 5000)`，8GB 内存下约 860，32GB 下约 3600 | [RDS 参数默认值](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Limits.html#RDS_Limits.MaxConnections) |
| Azure Database for PostgreSQL flexible server | 按产品名称固定：16GB（D4ds_v5）为 1,718，32GB（D8ds_v5）为 3,437，另有 15 个由服务保留 | [Azure 限制](https://learn.microsoft.com/en-us/azure/postgresql/configure-maintain/concepts-limits#maximum-connections) |
| Google Cloud SQL | 由实例内存推导，调整实例规格时自动随之变化，除非固定该 flag | [Cloud SQL 标志](https://cloud.google.com/sql/docs/postgres/flags#postgres-m) |

当很多 pod 在同一行上排队时，连接同样会被耗尽。每个 pod 都把自己的花费汇总进共享的每日行（`LiteLLM_DailyUserSpend`、`LiteLLM_DailyToolSpend`、`LiteLLM_DailyModelUsage`），而等待另一 pod 正在更新的行的那个 pod，会在这段时间一直占着池化连接。代理用每次汇总事务上的 `lock_timeout`（`SPEND_ROLLUP_LOCK_TIMEOUT_MS`，默认 5000）来限定这段等待：超时的语句在生效前就会被 Postgres 取消，相关行重新排队等下一次刷新，连接则归还连接池。如果怀疑遇到了这种情况，故障期间跑一句 `SELECT query, count(*) FROM pg_stat_activity WHERE wait_event_type = 'Lock' GROUP BY query`，就能看到排队者在等哪条语句。

如果应用需要的连接数超过实例能提供的上限，就在实例前面加一层连接池（RDS Proxy、Azure flexible server 内置的 PgBouncer，或自建皆可），并设置 [`database_disable_prepared_statements: true`](./configs.md#禁用服务端预编译语句)，让 Prisma 不再在池化会话之间复用服务端预处理语句。

## 云厂商推荐配置

<Tabs>
<TabItem value="aws" label="AWS">

在 Graviton 通用型实例类上使用 RDS for PostgreSQL：1K RPS 以内用 `db.m7g.large`，1K 到 5K 用 `db.m7g.xlarge`，再往上用 `db.m7g.2xlarge` 或更大规格；完整列表见 [DB 实例类](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.html)。存储选 gp3：任何容量下都有 [3000 IOPS 与 125 MiB/s 的基线](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Storage.html#gp3-storage)，Postgres 卷超过 400 GiB 后会提升到 12,000 IOPS 和 500 MiB/s，所以上表中的 500GB 一档买到的不只是容量，还有吞吐。生产环境请采用 [Multi-AZ](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)，并打开 [Performance Insights](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html)，让花费写入的热点以等待事件的形式显形，而不是一堆解释不了的延迟。

如果你想要 reader endpoint，就改用 Aurora PostgreSQL：它与 LiteLLM 的[只读副本路由](./db_read_replica.md)直接搭配，是突破 5K RPS 一档最干净的办法。Aurora 的 `max_connections` 默认值与 RDS 使用同一套内存公式。

</TabItem>
<TabItem value="azure" label="Azure">

在通用（General Purpose）层使用 Azure Database for PostgreSQL flexible server：1K RPS 以内用 `D4ds_v5`（4 vCore，16GB），1K 到 5K 用 `D8ds_v5`（8 vCore，32GB）；如果工作集开始超出缓存，就升级到内存优化的 `E8ds_v5` 或更大规格，全部产品名称见[计算选项](https://learn.microsoft.com/en-us/azure/postgresql/configure-maintain/concepts-compute)。生产环境避开 Burstable（突发）层，因为额度耗尽的实例会让花费写入路径卡住。存储选 [Premium SSD v2](https://learn.microsoft.com/en-us/azure/postgresql/configure-maintain/concepts-storage)，让 IOPS 与磁盘容量解耦、独立预配，并开启[区域冗余高可用](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-high-availability)。面对前文的连接数上限，[内置 PgBouncer](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-pgbouncer) 是最省事的答案：启用它，把 `DATABASE_URL` 指到 6432 端口，再设置 `database_disable_prepared_statements: true`。

</TabItem>
<TabItem value="gcp" label="GCP">

在 Enterprise Plus 版本上用 N2 机型运行 Cloud SQL for PostgreSQL：1K RPS 以内用 4 vCPU / 16GB，1K 到 5K 用 8 vCPU / 32GB；[实例设置参考](https://cloud.google.com/sql/docs/postgres/instance-settings)列出了各机器系列，[版本对比](https://cloud.google.com/sql/docs/postgres/editions-intro)说明 Enterprise Plus 额外提供了什么，包括数据缓存和亚秒级计划内故障切换。注意 Cloud SQL 的 SSD IOPS 同时受 vCPU 数和磁盘容量约束（每 GB 30 读 + 30 写 IOPS，受[每 vCPU 上限](https://cloud.google.com/sql/docs/postgres/storage-options-overview)封顶），所以大机型配小磁盘就是一个改 flag 也提不上去的吞吐天花板。请启用区域高可用和存储自动扩容。

</TabItem>
</Tabs>

## 让数据库保持精简

写入路径做得越少，选型就越便宜。用 `proxy_batch_write_at: 60` 批量写入花费，把[错误日志挡在数据库之外](./prod.md#不要把错误日志写进数据库)，并设置[花费日志保留期](./spend_logs_deletion.md)，避免 `LiteLLM_SpendLogs` 无限增长；正是这张表，让存储而非 CPU 成为你最常需要先扩容的对象。如果 UI 里根本不需要逐请求的行，`disable_spend_logs: True` 能去掉写入量最大的那类插入，成本数据仍由你的日志集成保留。`store_prompts_in_spend_logs` 只应在深思熟虑后开启，它会同时放大行大小和网关 pod 的内存下限。

## 需要监控的指标

盯紧连接数与 `max_connections` 的关系，而不只是利用率，因为真正造成硬故障的是这个上限。在 LiteLLM 侧，有用的 Prometheus 指标是：`litellm_in_memory_spend_update_queue_size` 和 `litellm_redis_spend_update_queue_size`，反映排队中而非已写入的花费更新；`litellm_pod_lock_manager_size`，反映当前哪个 pod 持有事务缓冲区的刷新锁。队列深度单调增长，说明数据库已经跟不上写入路径，这就是扩容或打开缓冲区的信号。
