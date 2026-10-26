import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';
import { MultiRegionArchitecture } from '@site/src/components/CloudArchitecture';

# 多区域部署

在同一云提供商的多个区域运行 LiteLLM 代理实例，并让所有实例连接同一个共享的 PostgreSQL 数据库。客户端会被路由到最近的区域以获得低延迟；而密钥、团队、用户和花费追踪之所以处处一致，是因为整个部署只有一个事实来源（source of truth）。

本页介绍受支持的拓扑、跨区域的许可机制，以及逐步设置流程。在各区域部署代理本身的方法，见[生产环境部署](./deploy.md)。

## 架构

<MultiRegionArchitecture />

这套拓扑有三条规则：

1. **只有一个数据库**。每个区域的代理实例都把 `DATABASE_URL` 指向托管在主区域的同一个 PostgreSQL 数据库。正因如此，在一个区域创建的密钥才能在所有区域生效，预算与花费追踪才能在全球范围内保持一致。
2. **每个区域一个 Redis**。一个区域内各实例之间的速率限制、路由器状态与响应缓存都由本区域的 Redis 处理。Redis 必须留在本区域内；若让单个 Redis 跨区域链路提供服务，每次限流检查都会多出一次网络往返。
3. **只用一家云提供商**。所有区域都部署在同一家云提供商上。

同一套拓扑既可以按主主模式（active-active）运行，即 DNS 把每个客户端路由到离它最近的区域，目标是低延迟；也可以按主备模式（active-passive）运行，即全部流量集中在一个区域，第二个区域已部署但闲置待命，藏在 DNS 故障转移记录后面，目标是灾难恢复。两种模式的配置完全相同，差别只在 DNS 策略。

## 跨区域许可

只要所有区域共享同一个数据库，一份 LiteLLM 企业版许可即可覆盖全部区域。

每个代理实例独立校验自己拿到的 `LITELLM_LICENSE` 密钥（离线对照签名负载，或向许可服务器校验），许可检查本身完全不统计实例数或区域数。许可携带的数量上限（最大用户数、最大团队数）是从数据库统计的。当所有区域共享一个数据库时，这些计数只存在一份，许可因此只需在全球范围内执行一次。

由此可得一个推论：每个区域各用独立数据库，就等于各自独立部署，每个部署都需要自己的许可。两个数据库意味着两套用户与团队计数、两套密钥、两份许可。

| 拓扑 | 数据库数 | 所需许可数 |
|---|---|---|
| 多区域、共享数据库（本页） | 1 | 1 |
| 每个区域独立部署 | 每区域 1 个 | 每区域 1 个 |
| [全局控制平面（Global Control Plane）](./global_control_plane.md) | 每个 worker 1 个 | 每个 worker 1 个 |

如果你希望每个区域都是完全独立的部署（各自的数据库、Redis、主密钥和许可），又想通过单一 UI 统一管理，请改用[全局控制平面](./global_control_plane.md)（企业版），而不是本页的方案。它用全局一致性换取爆炸半径隔离：一个区域的数据库故障不会波及另一个区域，但密钥和预算也不跨区域共享。

## 前提条件

每个区域的每个代理实例都必须共享以下配置。任何一项在区域之间不一致，部署都会出现难以排查的异常（实例无法解密已存储的凭据、密钥在某个区域认证失败、席位限制执行口径不一等）。

| 配置项 | 必须为 | 原因 |
|---|---|---|
| `DATABASE_URL` | 所有区域指向同一个数据库 | 密钥、团队、用户、花费和许可席位计数的唯一事实来源 |
| `LITELLM_MASTER_KEY` | 所有区域完全一致 | 密钥校验针对共享数据库进行，主密钥必须处处相同 |
| `LITELLM_SALT_KEY` | 所有区域完全一致，初始设置后永不更换 | 用于加解密数据库中存储的 LLM 凭据；salt key 不同的实例无法读取已存储的模型凭据 |
| `LITELLM_LICENSE` | 所有区域使用同一把许可密钥 | 每个实例独立校验许可，一把密钥即可激活全部实例 |
| `DISABLE_SCHEMA_UPDATE` | 所有代理实例均设为 `true` | 数据库结构迁移必须精确执行一次（以任务形式运行），而不是由各区域实例竞态触发 |

此外，每个区域还要各运行一个 Redis 实例，并在该区域的代理配置（`router_settings` 与缓存配置）中指定。Redis 的状态是区域性的：速率限制与缓存响应只作用于处理该请求的区域。

:::info

速率限制（密钥、团队、用户上的 TPM/RPM，即每分钟 Token 数/每分钟请求数）通过 Redis 执行。每个区域一个 Redis 时，100 RPM 的限制意味着每个区域各 100 RPM，而不是全局 100 RPM。如果需要严格的全局限流，所有实例就必须共享一个 Redis，这会给远程区域的请求路径带来跨区域往返开销。大多数部署接受按区域执行的限流。

:::

## 部署步骤

以下步骤假设你已经能部署单区域的生产代理（负载均衡器、代理实例、Postgres、Redis）。如果还没有，请先阅读[生产环境部署指南](./deploy.md)和[生产环境检查清单](./prod.md)。

### 1. 创建共享数据库

在主区域创建一个 PostgreSQL 数据库，并对其执行一次数据库结构迁移，可使用 [Helm 图表](./deploy.md#使用-helm-部署)或 [Terraform 模块](./deploy.md#使用-terraform-部署-aws-与-gcp)提供的迁移任务。所有区域都将使用这个数据库的连接字符串。

### 2. 打通区域间网络

辅助区域的代理实例必须通过私有的可路由连接访问主区域的数据库：AWS 上用 [VPC peering](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html) 或 [Transit Gateway](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html)，GCP 上用 [VPC Network Peering](https://cloud.google.com/vpc/docs/vpc-peering)（采用区域子网的全局 VPC 也可以），Azure 上用 [VNet peering](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview)。在数据库的安全组或防火墙中，为每个辅助区域的代理子网开放数据库端口（5432），并在连接上强制 TLS（`sslmode=require`），因为这些流量会跨越区域边界。辅助区域每一次未命中缓存的数据库读取都要承担跨区域往返的延迟，这正是第 4 步要添加区域只读副本的原因。

### 3. 在各区域部署代理实例

每个区域的代理都按单区域部署的方式部署，只有两点不同：把 `DATABASE_URL` 指向主区域的数据库而非本区域数据库；并且只从主区域运行数据库迁移任务（在辅助区域的 Helm values 中设置 `migrationJob.enabled: false`），这样某个区域的发布就不会与另一个区域的迁移在共享数据库结构上发生竞态。所有区域都应从同一份配置源部署（一份 Helm values 文件或 Terraform 配置，仅按区域做参数化），避免区域之间在版本或配置上漂移。

<Tabs>
<TabItem value="primary" label="主区域（us-east-1）">

```bash
DATABASE_URL="postgresql://litellm:<password>@db.us-east-1.internal:5432/litellm?sslmode=require"
LITELLM_MASTER_KEY="sk-<same-everywhere>"
LITELLM_SALT_KEY="sk-<same-everywhere-never-rotate>"
LITELLM_LICENSE="<same-everywhere>"
DISABLE_SCHEMA_UPDATE="true"
REDIS_HOST="redis.us-east-1.internal"
REDIS_PORT="6379"
REDIS_PASSWORD="<regional>"
```

</TabItem>
<TabItem value="secondary" label="辅助区域（eu-west-1）">

```bash
# Same database as the primary region
DATABASE_URL="postgresql://litellm:<password>@db.us-east-1.internal:5432/litellm?sslmode=require"
LITELLM_MASTER_KEY="sk-<same-everywhere>"
LITELLM_SALT_KEY="sk-<same-everywhere-never-rotate>"
LITELLM_LICENSE="<same-everywhere>"
DISABLE_SCHEMA_UPDATE="true"
# Redis stays regional
REDIS_HOST="redis.eu-west-1.internal"
REDIS_PORT="6379"
REDIS_PASSWORD="<regional>"

# Optional: regional read replica (see next section)
DATABASE_URL_READ_REPLICA="postgresql://litellm:<password>@db-replica.eu-west-1.internal:5432/litellm"
```

</TabItem>
</Tabs>

### 4. 可选：添加区域只读副本

每个请求都要拿密钥到数据库做认证（带内存缓存，稳态流量不会每次调用都打到数据库）。辅助区域仍能进一步降低数据库读取延迟：在区域内运行一个 PostgreSQL 只读副本，并设置 `DATABASE_URL_READ_REPLICA`。LiteLLM 会把只读查询路由到副本，所有写入仍走主库。哪些查询会路由到哪里、如何应对复制延迟，见[数据库只读副本](./db_read_replica.md)。

写操作（创建密钥、修改配置、更新花费）始终写入主区域的数据库。花费更新是批量提交的，跨区域写入延迟因此不会滞留在请求路径上。

### 5. 把客户端路由到最近区域

在各区域负载均衡器前面加一层基于延迟或地理位置的 DNS：AWS 上用 [Route 53 latency-based routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-latency.html)，GCP 上用 [Cloud DNS geolocation routing policies](https://cloud.google.com/dns/docs/routing-policies)，Azure 上用 [Traffic Manager](https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-routing-methods) 或 [Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview)。客户端只需使用同一个主机名，就会落到离自己最近的区域。

健康检查应探测各区域的 `/health/liveliness`，而不是 `/health/readiness`。数据库一旦不可达，readiness 就返回 503，而数据库又是共享的：一次故障会让所有区域的 readiness 检查同时失败，把全部区域一起移出 DNS 轮换，而此时恰恰是 `allow_requests_on_db_unavailable` 本可以让它们继续用缓存流量提供服务的时候。Liveliness 反映的只是该区域代理是否存活，这才是 DNS 故障转移决策需要的信息。

### 6. 验证

1. 打开主区域的管理界面（Admin UI）（`https://llm.example.com/ui`），进入 **Virtual Keys** 页面，创建一个密钥。

2. 直接打开辅助区域的 UI（`https://eu.llm.example.com/ui`），进入 **Test Key** 调试页面，粘贴刚创建的密钥并发送一个请求。请求会成功，因为两个区域都是针对同一个数据库校验密钥。

3. 回到 **Virtual Keys** 页面，确认该密钥已显示出你通过辅助区域发起的那次请求的花费。相关 UI 操作流程在[快速上手](./docker_quick_start.md#5-创建虚拟密钥)中有截图演示。

## 可选：专用管理实例

默认情况下，每个实例同时承载 LLM 流量和管理流量（UI 与管理 API）。在多区域部署中，你可以指定一个实例专用于管理，并从各区域实例上剥离管理入口。这样管理访问只经过一个主机名，同时缩小了承载 LLM 流量实例的攻击面。

<EnterpriseFeature>

`DISABLE_ADMIN_ENDPOINTS` 与 `DISABLE_LLM_API_ENDPOINTS` 为企业版功能。

</EnterpriseFeature>

<Tabs>
<TabItem value="admin" label="管理实例">

```bash
# Serves the UI and management APIs, refuses LLM traffic
DISABLE_LLM_API_ENDPOINTS="true"
DATABASE_URL="postgresql://...@db.us-east-1.internal:5432/litellm"
LITELLM_MASTER_KEY="sk-<same-everywhere>"
```

</TabItem>
<TabItem value="worker" label="区域实例">

```bash
# Serve LLM traffic, refuse admin traffic
DISABLE_ADMIN_UI="true"
DISABLE_ADMIN_ENDPOINTS="true"
DATABASE_URL="postgresql://...@db.us-east-1.internal:5432/litellm"
LITELLM_MASTER_KEY="sk-<same-everywhere>"
```

</TabItem>
</Tabs>

| 变量 | 默认值 | 设为 `true` 时的效果 |
|---|---|---|
| `DISABLE_ADMIN_UI` | `false` | `/ui` 的网页 UI 不再可用 |
| `DISABLE_ADMIN_ENDPOINTS` | `false` | 管理端点（`/key/*`、`/user/*`、`/team/*`、`/model/*`）返回错误；LLM 端点、`/health` 和 `/metrics` 继续工作 |
| `DISABLE_LLM_API_ENDPOINTS` | `false` | LLM 端点（`/chat/completions`、`/v1/*`、提供商透传路由）返回错误；管理端点继续工作，且 `/models` 保持可用，以便 UI 列出模型 |

## 常见问题

**我到底需不需要多区域**？
通常不需要。单区域部署搭配多可用区（multi-AZ）的数据库和 Redis，就已经能扛住可用区级故障；参见[生产环境最佳实践](./prod.md)。当你需要为远端用户提供更低延迟，或需要跨区域灾难恢复时，再增加区域。

**多区域需要企业版许可吗**？
共享数据库拓扑本身在开源代理上即可运行。企业版功能则由一份许可覆盖所有区域，详见[跨区域许可](#跨区域许可)。

**主区域的数据库宕机会怎样**？
所有区域都会失去数据库访问：密钥校验退回到缓存，管理操作在数据库恢复之前都会失败。数据库是这个架构中唯一的耦合点。设置 `general_settings.allow_requests_on_db_unavailable: true`，让代理在宕机期间继续为已缓存的密钥提供服务（参见[优雅处理数据库不可用](./prod.md#优雅应对数据库不可用)）；把数据库跑成多可用区并配置自动故障转移；如果这些隔离仍然不够，就改用[全局控制平面](./global_control_plane.md)。

**不同区域可以运行不同的 LiteLLM 版本吗**？
只能在滚动升级期间短暂混跑。不要长期让版本不一致：共享数据库的结构跟随最新版本，且每次升级的迁移都应只执行一次。
