---
title: 哪些功能需要 Redis
description: LiteLLM 代理在没有 Redis 的情况下无法运行或无法正常运行的功能。
---

# 哪些功能需要 Redis

只要 LiteLLM 代理的部署会运行不止一个 worker 进程，我们就强烈建议使用 Redis，而大多数部署恰恰如此：单个容器只要 `--num_workers` 大于 1 就已经算数，任何副本数超过一个的 Kubernetes 部署也不例外。

代理强制执行的几乎所有事项（速率限制、预算、冷却、缓存命中、配置变更）都依赖状态来协调。有了 Redis，这些状态是共享的，每个 worker 看到的计数器和失效通知完全一致。没有 Redis 时，每个 worker 只在内存里保存自己的一份副本，于是 4 个 worker 上每分钟 100 次请求的限制实际能放行 400 次；已吊销的密钥在尚未处理这次吊销的 worker 上依然可用；缓存命中也只会落在恰好保存过该响应的那个 worker 上。

未配置 Redis 时，管理界面（Admin UI）会显示一条横幅提示。如果你有意只运行单个 worker，可以设置 `LITELLM_DISABLE_NO_REDIS_WARNING=true` 来隐藏它。

:::warning

不搭配 Redis 的多 Pod 部署目前处于 beta 阶段，下面的列表也并非穷尽。它收录的是我们已知在无 Redis 时无法跨 Pod 完整工作、甚至完全无法工作的主要功能；其他功能在这种配置下同样可能表现异常。多 Pod 部署的正式（GA）方案是搭配 Redis 运行。

:::

## 配置 Redis

关于如何开通 Redis 并让代理端到端接入，参见[搭建 Redis](/docs/proxy/caching_redis)。简要写法如下：

```yaml
router_settings:
  redis_host: os.environ/REDIS_HOST
  redis_port: os.environ/REDIS_PORT
  redis_password: os.environ/REDIS_PASSWORD

litellm_settings:
  cache: True
  cache_params:
    type: redis
    host: os.environ/REDIS_HOST
    port: os.environ/REDIS_PORT
    password: os.environ/REDIS_PASSWORD
```

仅在环境变量里设置 `REDIS_HOST` 和 `REDIS_PORT` 并不够：只有当配置像上面这样指向 Redis 时，代理才会读取它们。`router_settings` 块负责路由器状态（冷却、基于用量和基于延迟的路由），缓存块负责响应缓存以及所有代理级协调事项（速率限制、预算、缓存失效、Pod 锁）。两者都要配置。集群与哨兵模式的部署，以及通过 `general_settings.coordination_redis` 把协调状态指向与响应缓存不同的 Redis 实例，参见 [Redis 和 Valkey](./caching_redis.md)。

## 没有 Redis 会出什么问题

在多 Pod 之间性能下降或不可用的最常见功能如下：

| 功能 | 没有 Redis 时 |
| --- | --- |
| 密钥、团队、用户和终端用户的速率限制（tpm、rpm、最大并行请求数） | 按 worker 分别计数，实际限制等于设定值乘以 worker 数量。 |
| [动态速率限制](./dynamic_rate_limit.md)与[速率限制档位](./rate_limit_tiers.md) | 同样按 worker 拆分；每个档位可占用的容量份额会在各 worker 上独立计算。 |
| 密钥、团队和用户预算 | 花费按 worker 分别预留和统计，不同 worker 上的并发请求可能在数据库同步完成之前超出硬预算。 |
| [提供商预算路由](./provider_budget_routing.md)与[标签预算](./tag_budgets.md) | 花费窗口按 worker 各自维护，提供商或标签的超支幅度可能达到 worker 数量的倍数。 |
| `usage-based-routing-v2` 与 `latency-based-routing` | 路由决策只基于该 worker 自己见过的流量，负载均衡因此失衡，基于 TPM/RPM 的部署选择也随之退化。 |
| 部署冷却 | 某个部署在一个 worker 上因失败而进入冷却后，在其他 worker 上仍会继续参与调度。 |
| [响应缓存](./caching.md)（response caching） | 缓存条目只留在写入它的那个 worker 上，命中率大约下降为原来的 worker 数量分之一。语义缓存（semantic caching）则必须依赖 Redis。 |
| 虚拟密钥（virtual key）与团队缓存失效 | 密钥删除、预算修改和团队成员变动，要等其他 worker 的本地缓存条目过期后才会传播过去。 |
| 存入数据库的配置变更（在 UI 中新增、删除或编辑模型，以及设置修改） | 其他 worker 要到下一轮周期性重载时才会应用，而非立即生效。 |
| 用于花费写入的 [Redis 事务缓冲区](./prod.md#redis-事务缓冲区) | 不可用。每个 worker 都直接把花费更新写入数据库，而这正是高流量下该缓冲区要防范的故障模式。 |
| 定时任务（预算重置、花费日志清理、密钥轮换、过期会话清理、数据库花费落库） | 选举唯一执行者的 Pod 锁依赖 Redis，于是每个 worker 都会运行任务，并在同一批数据库行上相互争抢。 |
| [共享健康检查](./shared_health_check.md) | 每个 worker 都会对所有部署跑自己的后台健康检查，发往提供商的健康检查流量成倍增加。 |
| [请求优先级排序](../scheduler.md) | 优先级队列按 worker 各自维护，排序只对落在同一 worker 上的请求有效。 |
| SSO 与 CLI 的 `litellm login` | 当浏览器重定向落在与发起登录不同的 worker 上时，登录流程可能失败。 |
| [MCP](../mcp_oauth.md) 出站 OAuth 凭据 | Token 按 worker 分别缓存，各 worker 独立刷新；提供商若在每次使用后轮换刷新令牌，就会使其余 worker 的令牌失效。 |
| 后台响应与轮询 | 轮询获取的响应只有在产生它的那个 worker 上才可读取。 |

## 单 worker 部署

如果你确实只运行一个 worker 进程、一个副本，上述问题都不存在，因为此时本地内存就是共享状态。但这种配置放弃了水平扩展能力，且任何一次重启都会丢掉全部缓存状态，因此请把它当作开发或低流量场景的配置，而不是生产配置。
