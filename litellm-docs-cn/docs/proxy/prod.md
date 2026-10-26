---
title: 生产环境最佳实践
description: 在生产环境运行 LiteLLM 的检查清单：配置、容量规划与 worker、Redis，以及数据库与迁移。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 生产环境最佳实践

上线之前请通读本页。内容涵盖生产环境配置、机器规格与 worker 策略、Redis，以及数据库与迁移；各小节相互独立，你也可以把它当作现有部署的检查清单。关于 Postgres 和 Redis 实例本身该开多大（含 AWS、Azure、GCP 的实例推荐），参见[数据库容量规划](./db_sizing.md)与 [Redis 容量规划](./redis_sizing.md)。关于更深入的容器调优，例如替代服务器、在代理侧终结 TLS、keepalive、从对象存储加载配置，参见[服务器调优](./server_tuning.md)。

## 配置

### 设置主密钥

主密钥（master key）是代理的管理员凭据：用于验证管理员 API 调用，也是管理界面（Admin UI）的登录密码。请将它设为环境变量（必须以 `sk-` 开头），保存在你的密钥管理器（secret manager）中，并按照[主密钥轮换流程](./master_key_rotations.md)轮换。

```bash
export LITELLM_MASTER_KEY="sk-<long-random-value>"
```

### 设置可信代理网段

管理界面登录失败次数会按来源地址限流（见[安全最佳实践](./security_best_practices.md#限制管理界面登录失败次数)）。该限制只有在代理能识别客户端真实地址时才会生效，因此请把 `general_settings.trusted_proxy_ranges` 设为 LiteLLM 前置负载均衡器或 Ingress 的 CIDR 网段；客户端直连时则设为 `[]`。若不设置，代理会在启动时告警，且只有较弱的按用户名限制生效。

```yaml
general_settings:
  trusted_proxy_ranges: ["10.0.0.0/8"]   # or [] when clients connect directly
```

### 开启告警

LLM 异常、缓慢或挂起的请求、预算超支、数据库异常、服务中断以及每周花费报告，都可以及时通知到你。在管理界面依次进入 **Settings** 和 **Logging & Alerts**，打开 **Alerting Types** 标签页，打开需要的告警类型，粘贴你的 Slack webhook URL，然后点击 **Test Alerts** 确认送达。阈值与报告频率在旁边的 **Alerting Settings** 标签页中设置。

<Image img={require('../../img/ui_alerting_types.png')} dark={require('../../img/ui_alerting_types_dark.png')} alt="管理界面中的 Alerting Types 标签页，含各告警类型开关与 Slack webhook 输入框" />

如果更愿意写进配置文件，在 `general_settings` 下设置 `alerting: ["slack"]`，并在环境中 export `SLACK_WEBHOOK_URL`。

### 批量写入花费数据

花费更新改为每 60 秒批量写一次数据库，而不是每个请求都写；在生产流量下，逐请求写入会成为数据库热点。

```yaml
general_settings:
  proxy_batch_write_at: 60
```

当流量超过每秒约 1000 个请求时，还应让这些写入经由 Redis 走 [Redis 事务缓冲区](#redis-事务缓冲区)，以避免连接耗尽与死锁。

### 调优跨 Pod 的配置重载

设置 `store_model_in_db: true` 后，每个 Pod 会通过后台任务轮询数据库，与运行期添加的配置（模型、凭据、防护栏（guardrails）、通用设置等）保持同步。Pod 之间没有推送机制；配置变更后，Pod 最多在一个轮询周期内收敛。该周期默认 30 秒且可调整：需要更快收敛就调小；大量 Pod 打到繁忙数据库上时，可以调大以减轻负载。

```yaml
general_settings:
  store_model_in_db: true
  proxy_config_reload_interval_seconds: 30
```

该值在启动时读取，因此修改后要等各 Pod 重启才生效。也可以在管理界面的 Router Settings 的 General 标签页中设置，或通过 `PROXY_CONFIG_RELOAD_INTERVAL_SECONDS` 环境变量设置。

<Image img={require('../../img/proxy_config_reload_interval_ui.png')} dark={require('../../img/proxy_config_reload_interval_ui_dark.png')} alt="Router Settings 的 General 标签页，显示 proxy_config_reload_interval_seconds 设为 12" />

### 限制数据库连接数

为每个 worker 进程的连接池设上限，避免实例把数据库连接耗尽。按 `MAX_DB_CONNECTIONS / (instances × workers)` 计算大小；默认值为 10。

```yaml
general_settings:
  database_connection_pool_limit: 10
```

:::warning[多实例]

实例数会让总连接数成倍增长：3 个实例 × 4 个 worker × 10 个连接 = 数据库要承受 120 个连接。

:::

一旦副本数交给自动扩缩器管理，公式里的实例数就是 `maxReplicas`，而不是你今天实际运行的 Pod 数。`litellm-helm` chart 默认把 `autoscaling.maxReplicas` 和 `keda.maxReplicas` 设为 100，因此在默认连接池上限 10 的情况下，一个完全扩展开的部署会向数据库申请约 1000 个连接，远超原生 Postgres 的承受范围。请根据数据库能承载的量来设置 `maxReplicas`，完整的除法计算见[如何算出合适的值](./configs.md#配置数据库连接池上限与连接超时)。

### 不要把错误日志写进数据库

LLM 异常默认会写入数据库。提供商持续报错时，这会把花费日志表撑得很大；应改为把异常送往你的日志系统（参见[告警](#开启告警)与[日志回调](./logging.md)）。

```yaml
general_settings:
  disable_error_logs: True
```

### 设置请求超时

让挂起的请求尽快失败，而不是一直占着连接；默认值为 6000 秒。

```yaml
litellm_settings:
  request_timeout: 600
```

### 生产环境日志

关闭调试日志、输出 JSON 日志，并屏蔽 FastAPI 的逐请求 info 日志：

```yaml
litellm_settings:
  set_verbose: False
  json_logs: true
```

```bash
export LITELLM_LOG="ERROR"
```

### 禁用 load_dotenv

设置 `export LITELLM_MODE="PRODUCTION"`。这会禁用 `load_dotenv()`，否则它会自动从本地 `.env` 加载凭据。

### 设置 salt key

如果你使用数据库，请设置 salt key 用于加解密存储的变量。添加模型之后就不要再改：它加密着你的 LLM API 密钥凭据，一改就再也无法读取。可以用[密码生成器](https://1password.com/password-generator/)生成一个随机哈希。

```bash
export LITELLM_SALT_KEY="sk-<paste-a-long-random-key>"
```

[**查看代码**](https://github.com/BerriAI/litellm/blob/036a6821d588bd36d170713dcf5a72791a694178/litellm/proxy/common_utils/encrypt_decrypt_utils.py#L15)

## 容量规划与 worker

### 机器规格

每个 Pod 给 1 vCPU 与 4Gi 内存，requests 和 limits 都这样设；如果每个容器跑不止一个 worker，两者都要随 worker 数等比放大。

```yaml
resources:
  requests:
    cpu: "1" # should be 1*num_workers
    memory: "4Gi" # should be 4*num_workers
  limits:
    cpu: "1"
    memory: "4Gi"
```

两个数字都是按单个 worker 计的，所以乘法是实打实的：跑 8 个 worker 的容器需要 8 vCPU 和 32Gi，而不是 1 vCPU 和 4Gi。用单 worker 的数字去给多 worker 容器做规划，是资源配不足的常见原因；这也是在 Kubernetes 上坚持每 Pod 一个 worker、用副本数而非 worker 数承载并发的最主要理由。

4Gi 是下限，不是目标值。代理的稳态内存占用与并发请求数无关：Prisma 把查询引擎作为独立进程运行，其常驻内存表现为高水位线，会涨到该引擎执行过的最大单条语句所需的量，而 glibc 事后不会把这块内存还给操作系统。于是 Pod 的下限会一路抬升到其历史最大写入的水平，并在 worker 存续期间停在那里。如果只给不到 4Gi，一次大写入就足以把 Pod 顶破上限，被内核 OOM kill，表现为在其他指标上毫无异常的流量下出现崩溃循环。

最大的语句来自开启 `store_prompts_in_spend_logs` 后的花费日志：此时每行记录的是完整的提示词（prompt）与响应，而不只是计数。如果你要存储提示词，请把 4Gi 当作最低值，并在此之上留出余量。

### 自动扩缩容

按 CPU 扩缩，不要设内存目标。对代理来说内存不是可用的扩缩信号：查询引擎的常驻内存反映的是 Pod 历史最大的一次写入，而非当前正在做的事，因此内存目标会让副本在一次大写入后被顶上去，且永远不会缩回来。内存按上文说的下限规划，副本数交给 CPU 驱动。

```yaml
targetCPUUtilizationPercentage: 60
```

取 60 而不是更高的阈值，因为副本刚创建时并不能立刻干活。`litellm-helm` 的启动探针给 Pod 最多 300 秒通过首次就绪检查，因此在 CPU 达到 80% 时才扩出的副本，会等到触发扩容的饱和过去几分钟之后才就位。两个 chart 的默认值都更高（`litellm-helm` 为 80，组件化 chart 的 gateway 为 70），那是为了让 chart 在任何地方都能顺利安装；生产环境请调低。

### Worker 与扩缩策略

在 Kubernetes 上，或其他任何由 Pod 级自动扩缩器读取 CPU 的环境里，每个 Pod 只跑一个 Uvicorn worker，横向扩容（更多 Pod）而非纵向扩容（每 Pod 更多 worker）。这是默认行为，所以只需 `--num_workers 1`；每 Pod 单进程让延迟可预期，让 Horizontal Pod Autoscaler 能针对单一进程读取[上文的 CPU 阈值](#自动扩缩容)，也让滚动重启零中断，因为 Kubernetes 一次只排空一个 Pod。

```shell
CMD ["--port", "4000", "--config", "./proxy_server_config.yaml", "--num_workers", "1"]
```

在单台虚拟机或裸容器上、没有自动扩缩器帮忙时，做法相反：把 `NUM_WORKERS` 设为机器的 vCPU 数，因为不会有别的东西替你用满这些核。规格与连接上限都按 worker 计，所以跑 8 个 worker 的机器需要 8 倍于上文下限的内存，以及八分之一的连接池。

如果持续负载下内存缓慢增长，可用 `--max_requests_before_restart` 让每个 worker 处理固定数量请求后重启，从而约束内存用量。

```shell
CMD ["--port", "4000", "--config", "./proxy_server_config.yaml", "--num_workers", "1", "--max_requests_before_restart", "10000"]
```

关于在单个容器内打包多个 worker、替代服务器（Gunicorn、Hypercorn、Granian）、用抖动错开重启时机、Kubernetes 上的零中断滚动重启、在代理侧终结 TLS、keepalive 调优，以及从 S3 或 GCS 加载 `config.yaml`，参见[服务器调优](./server_tuning.md)。

### 用专用 worker 运行后台任务

启动时代理会注册一个后台任务调度器，注册粒度是每个 Uvicorn worker 进程一次，而不是每个 Pod 一次。以 `--num_workers 4` 启动的 Pod 会把每个任务跑 4 份，10 个这样的副本就是 40 份，而大多数任务本意只该执行一次，工作量却按副本数 × 进程数翻倍。

效果全局共享的任务，重置预算、清理花费日志、推送用量导出等，在动手前会通过 Redis 选举唯一执行者。没配 Redis 时就没有选举渠道，这些任务会在每个注册了它的进程上无保护地运行。`LITELLM_JOB_ROLE` 让你把这些任务只注册到一个部署上，而不是注册到每个承接流量的副本；对于没有 Redis 的多 Pod 部署，这是实现单次执行的唯一办法。

| `LITELLM_JOB_ROLE` | 该进程注册哪些任务 |
| --- | --- |
| unset, or `all` | 所有任务。这是默认值，也是你一直以来的行为 |
| `worker` | 所有任务，包括那些单执行者任务 |
| `serving` | 不注册任何单执行者任务 |

解析不区分大小写，并忽略首尾空白。无法识别的值会回退到 `all` 并记录警告，所以一个拼写错误不会让部署的预算重置悄无声息地停掉。

设为 `serving` 的 Pod 不再注册预算重置任务、花费日志清理、密钥轮换、过期的管理界面会话密钥清理、PTU 定价汇总、每周与每月花费报告、Prometheus 兜底统计、批处理与 responses 成本轮询，以及 CloudZero、Focus、Vantage、Mavvrik 的用量导出。

它仍会注册花费落库、每日标签花费落库、网关请求计数器落库、周期性配置重载，以及数据库模型与凭据重载，因为这些操作排空的是该 Pod 自己的内存队列、刷新的是该 Pod 自己的模型注册表，而不是处理别的 Pod 也能处理的状态。因此 `serving` Pod 会继续把自己的花费写入数据库，也会继续加载运行期新增的模型；该角色改变的是它调度哪些共享任务，而不是它是否追踪自己服务过的请求。

执行权归属在运行期可观测。当选的 Pod 会以 INFO 级别记录 `<job name>: pod <id> owns this run`，Prometheus 指标 `litellm_pod_lock_manager_size` 则带有 `<job>:<pod>` 标签，标明任务名与持有其锁的 Pod。

#### Kubernetes 参考拓扑

按常规扩缩 serving Deployment，worker 保持 1 个副本。两者指向同一个数据库和同一个 Redis，这正是 worker 能接管 serving Pod 不再注册的那些任务的原因。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-serving
spec:
  replicas: 10
  selector:
    matchLabels:
      app: litellm-serving
  template:
    metadata:
      labels:
        app: litellm-serving
    spec:
      containers:
        - name: litellm
          image: docker.litellm.ai/berriai/litellm:v1.98.0 # pin a version, do not use :latest
          args: ["--config", "/app/proxy_server_config.yaml", "--num_workers", "1"]
          ports:
            - containerPort: 4000
          env:
            - name: LITELLM_JOB_ROLE
              value: serving
          envFrom:
            - secretRef:
                name: litellm-secrets # DATABASE_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, LITELLM_MASTER_KEY
          volumeMounts:
            - name: config-volume
              mountPath: /app/proxy_server_config.yaml
              subPath: config.yaml
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 4000
            initialDelaySeconds: 120
            periodSeconds: 15
      volumes:
        - name: config-volume
          configMap:
            name: litellm-config-file
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-jobs
spec:
  replicas: 1
  selector:
    matchLabels:
      app: litellm-jobs
  template:
    metadata:
      labels:
        app: litellm-jobs
    spec:
      containers:
        - name: litellm
          image: docker.litellm.ai/berriai/litellm:v1.98.0 # keep in lockstep with the serving image
          args: ["--config", "/app/proxy_server_config.yaml", "--num_workers", "1"]
          ports:
            - containerPort: 4000
          env:
            - name: LITELLM_JOB_ROLE
              value: worker
          envFrom:
            - secretRef:
                name: litellm-secrets # the same secret, so both reach the same database and Redis
          volumeMounts:
            - name: config-volume
              mountPath: /app/proxy_server_config.yaml
              subPath: config.yaml
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 4000
            initialDelaySeconds: 120
            periodSeconds: 15
      volumes:
        - name: config-volume
          configMap:
            name: litellm-config-file
```

把 Service 和 Ingress 只指向 `app: litellm-serving`，让 worker 不承接请求流量。worker 同样只配一个 Uvicorn worker，理由与 serving Pod 相同：多一个进程，就会在这个本该让任务只跑一次的部署上把每个任务多注册一份。

## Redis

只要代理实例不止一个，就要部署 Redis（7.0 或更新版本）。它在多个实例间共享限流计数器、路由器状态和响应缓存；没有它，每个实例各自为政地执行限流，缓存命中也只留在处理该请求的实例本地。没有 Redis 时哪些功能会降级或失效的完整清单，见[哪些功能依赖 Redis](./redis_requirements.md)。

```yaml
router_settings:
  routing_strategy: simple-shuffle # (default) - recommended for best performance
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

高流量部署请保持默认的 `simple-shuffle` 路由策略；基于用量的路由会在请求路径上增加 Redis 查询。Redis 该开多大、各家云上选哪种托管服务，见 [Redis 容量规划](./redis_sizing.md)。

### Redis 事务缓冲区

在极高流量下（大约每秒 1000+ 请求，或 10+ 个实例），花费追踪（spend tracking）本身会成为数据库瓶颈：每个实例都对同样的密钥、用户和团队行发出 `UPDATE`/`UPSERT` 语句，造成死锁，还可能耗尽 Postgres 连接（`FATAL: sorry, too many clients already`）。事务缓冲区改为让这些写入经由 Redis：每个实例把花费更新排入 Redis 队列，由唯一一个持有基于 Redis 锁的实例聚合并一次性落库。

```yaml
general_settings:
  use_redis_transaction_buffer: true
```

用 Prometheus 指标 `litellm_pod_lock_manager_size`（哪个 Pod 持有落库锁）以及 `litellm_in_memory_spend_update_queue_size` / `litellm_redis_spend_update_queue_size` 仪表（分别在内存和 Redis 中排队等待的花费更新；`_daily_` 变体追踪按用户每日聚合）来监控。如果负载下看到 `Got exception from REDIS No connection available`，请调大 Redis `cache_params` 中的 `max_connections`。

## 数据库与迁移

关于实例规格、存储与 IOPS、各家云托管 Postgres 的连接数上限，以及如何避免花费日志写入路径成为你扩容的唯一理由，见[数据库容量规划](./db_sizing.md)。

### 优雅应对数据库不可用

当 LiteLLM 运行在 VPC 内（公网不可访问）时，可以开启优雅降级，让数据库临时不可用时请求处理仍能继续。

**警告：仅当你的 LiteLLM 运行在公网无法访问的 VPC 内时才可开启。**

```yaml showLineNumbers title="litellm config.yaml"
general_settings:
  allow_requests_on_db_unavailable: True
```

设置 `allow_requests_on_db_unavailable` 为 `true` 后，LiteLLM 会按如下方式处理错误：

| 错误类型 | 预期行为 | 详情 |
|---------------|-------------------|----------------|
| Prisma 连接错误 | 放行请求 | 无法连上数据库引擎（连接被拒绝或重置，`EngineConnectionError`）。请求会以受限的 `INTERNAL_USER` 回退身份继续，绝不以管理员身份执行。 |
| Prisma 查询错误（P2xxx，如 P2010） | 拦截请求 | 数据库有响应但查询失败，密钥无法验证，请求收到 401。由于数据库可达，按失败即拒绝（fail-closed）处理。 |
| Httpx 错误 | 放行请求 | 数据库不可达时发生，数据库故障期间请求仍可继续。 |
| Pod 启动行为 | 照常启动 | 即使数据库宕机或不可达，LiteLLM Pod 也会启动，为部署提供更高的可用性保障。 |
| 健康/就绪检查 | 始终返回 200 OK | /health/readiness 端点返回 200 OK 状态，确保数据库不可用时 Pod 仍被视为在正常运行。 |
| LiteLLM 预算错误或模型错误 | 拦截请求 | 数据库可达但认证令牌无效、无权限或超出预算限制时触发。 |

数据库故障期间，已进入内存认证缓存的虚拟密钥（virtual key）会继续通过认证，直到 `user_api_key_cache_ttl` 过期；该值默认 60 秒，配置 `enable_redis_auth_cache` 后可以更长，参见 [caching_redis](./caching_redis.md#虚拟密钥认证缓存redis)。主密钥和配置文件中定义的模型不受影响。未缓存的虚拟密钥查询、密钥/团队/用户管理端点以及花费日志写入会失败，或推迟到数据库恢复后执行

[数据库用途的更多信息见此](db_info)

### 校验数据库服务器证书（自定义 CA，如 AWS RDS）

托管 Postgres（AWS RDS、Cloud SQL、Azure Flexible Server、企业内部 PKI）提供的是由提供商自家 CA 签发的证书，不在官方镜像的信任库中。校验它不需要自定义镜像：把 CA 证书包挂载进容器，并按提供商文档给出的 libpq 参数在数据库 URL 中指向它即可。

```bash
export DATABASE_URL="postgresql://user:pass@mydb.abc123.us-east-1.rds.amazonaws.com:5432/litellm?sslmode=verify-full&sslrootcert=/certs/global-bundle.pem"
```

LiteLLM 会把 `DATABASE_URL`、`DIRECT_URL` 和 `DATABASE_URL_READ_REPLICA` 中的 `sslmode=verify-full`（或 `verify-ca`）与 `sslrootcert` 改写成其 Postgres 驱动能识别的参数（`sslmode=require`、`sslcert=<bundle>`、`sslaccept=strict`），因此在包括迁移在内的每次连接上都会校验服务器证书链和主机名。证书无法链接到所挂载证书包的服务器，会在启动时报错 `P1011: Error opening a TLS connection ... certificate verify failed`。驱动没有只验链不验主机的模式，所以 `verify-ca` 同样会校验主机名。直接设置驱动参数（`sslmode=require&sslcert=/certs/global-bundle.pem&sslaccept=strict`）也可以，且你手动指定的驱动参数优先于自动改写。同样的键也可以不通过 URL 而从配置里设置，用 `database_extra_connection_params`（参见[限制数据库空闲连接并传递额外的 Prisma URL 参数](./configs.md#限制空闲数据库连接并传递额外的-prisma-url-参数)）。

纯 Docker 方式：

```bash
docker run \
  -v /path/to/global-bundle.pem:/certs/global-bundle.pem:ro \
  -e DATABASE_URL="postgresql://user:pass@mydb.abc123.us-east-1.rds.amazonaws.com:5432/litellm?sslmode=verify-full&sslrootcert=/certs/global-bundle.pem" \
  -e LITELLM_MASTER_KEY="sk-<paste-a-long-random-key>" \
  -p 4000:4000 \
  ghcr.io/berriai/litellm:main-stable --config /app/config.yaml
```

Helm 方式：把证书包放进 ConfigMap 或 Secret，用 `volumes` / `volumeMounts` 挂载。Deployment 和迁移 Job 都会拿到这些挂载，因此迁移同样会校验证书。

```bash
kubectl create configmap rds-ca --from-file=global-bundle.pem
```

```yaml title="values.yaml"
db:
  useExisting: true
  endpoint: mydb.abc123.us-east-1.rds.amazonaws.com
  database: litellm
  url: postgresql://$(DATABASE_USERNAME):$(DATABASE_PASSWORD)@$(DATABASE_HOST)/$(DATABASE_NAME)?sslmode=verify-full&sslrootcert=/certs/global-bundle.pem
volumes:
  - name: rds-ca
    configMap:
      name: rds-ca
volumeMounts:
  - name: rds-ca
    mountPath: /certs
    readOnly: true
```

RDS 证书包可从 [AWS](https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem) 下载；其他提供商的发布方式类似。它与 `SSL_CERT_FILE` 是两回事：后者只影响 LiteLLM 对 LLM 提供商和回调的出站 HTTPS 调用，数据库驱动不读它。如果两者都需要，挂载同一个证书包，让两个配置都指向它。

### 错峰调度后台任务

LiteLLM 有一组面向数据库的定时后台任务：花费落库、每日标签花费、预算重置、数据库内配置重载、凭据重载、花费日志保留期清理，以及你启用的各种成本导出集成。这些任务都在代理启动时注册，间隔任务的首跑在注册时刻的一个周期之后，因此如果不错峰，它们会在同一时刻一起触发，发布时一起拉起的每个副本都如此，并贯穿进程的整个生命周期。在大型部署上，这表现为周期性的数据库 CPU 尖峰，与请求路径上的认证和预算查询抢资源。

LiteLLM 默认就会把它们错开。每个任务按一个确定性偏移平移，偏移由它的调度任务 ID 和运行它的进程身份推导而来：同一 Pod 上的两个任务落在不同时刻，同一任务在每个副本上也落在不同时刻，同时重启也不会让一切回到同一个时间戳。任何任务的延迟都不会超过它自身的一个周期。

默认值适合大多数部署。大型多 Pod 集群可以加宽窗口，让同样数量的任务摊到更长时间里：

```yaml showLineNumbers title="litellm config.yaml"
general_settings:
  scheduled_job_stagger:
    window_seconds: 600
```

实际应用的偏移会在启动时以 INFO 级别记录一次，单行列出进程身份、窗口大小和每个任务的偏移，因此你在排查的调度可以从日志里复现，而不靠猜。把日志级别调到 DEBUG，还能看到每次触发的计划时间与实际启动时间的对照。

偏移绝不碰你自己提供的 cron 计划（如 `maximum_spend_logs_cleanup_cron`），因为那是你亲自选定的时刻。要把 LiteLLM 自带的某个任务钉在未平移的原时刻，或精确放到你想要的位置，可以显式设置它的偏移：

```yaml showLineNumbers title="litellm config.yaml"
general_settings:
  scheduled_job_stagger:
    offsets:
      update_spend_job: 0
      ptu_flat_cost_rollup_job: 900
```

副本在窗口中的位置由 `POD_NAME` 决定，依次回退到 `HOSTNAME` 和系统主机名，再加 worker 进程 ID。如果你的副本共享主机名，请为每个副本指定不同的 `identity`，避免落到同一偏移上。设置 `enabled: false` 可以整体关闭该机制，恢复原有行为。

### 通过 Helm PreSync 钩子执行迁移

:::info
Helm PreSync 钩子流程目前处于 beta 阶段。
:::

为确保只有一个服务负责数据库迁移，请使用我们的 [Helm PreSync 数据库迁移钩子](https://github.com/BerriAI/litellm/blob/main/helm/litellm-helm/templates/migrations-job.yaml)。这样迁移会在 `helm upgrade` 或 `helm install` 期间处理，而 LiteLLM Pod 则明确禁用迁移。

1. **Helm PreSync 钩子**：
   - chart 中已配置 Helm PreSync 钩子，在部署期间运行数据库迁移。
   - 钩子始终设置 `DISABLE_SCHEMA_UPDATE=false`，确保迁移可靠执行。

  在 ArgoCD 上为 `values.yaml` 设置的参考配置

  ```yaml
  db:
    useExisting: true # use existing Postgres DB
    url: postgresql://ishaanjaffer0324:... # url of existing Postgres DB
  ```

2. **LiteLLM Pod**：
   - 在 LiteLLM Pod 配置中设置 `DISABLE_SCHEMA_UPDATE=true`，阻止它们运行迁移。

   LiteLLM Pod 配置示例：
   ```yaml
   env:
     - name: DISABLE_SCHEMA_UPDATE
       value: "true"
   ```

### 使用 prisma migrate deploy

LiteLLM 默认在启动时运行 `prisma migrate deploy`，因此生产环境的数据库迁移无需任何配置即可跨版本处理。要完全禁止 Pod 运行迁移，按[通过 Helm PreSync 钩子执行迁移](#通过-helm-presync-钩子执行迁移)所述设置 `DISABLE_SCHEMA_UPDATE=true`。

:::info

旧版本用 `USE_PRISMA_MIGRATE="True"` 控制此行为。migrate deploy 成为默认后，该开关已在 [PR #13555](https://github.com/BerriAI/litellm/pull/13555) 中移除，而本页在那之后仍继续推荐了一段时间。现在设置 `USE_PRISMA_MIGRATE` 不起任何作用；从环境中删掉是安全的，删除也不会改变迁移行为

:::

migrate deploy 命令的行为：

- 已应用的迁移在迁移历史中缺失时，**不会**发出警告
- **不会**检测漂移（生产库 schema 与迁移历史终态不一致，例如热修复导致）
- **不会**重置数据库或生成产物（如 Prisma Client）
- **不会**依赖影子数据库

LiteLLM 发布迁移的方式：

1. 新的迁移文件会写入我们的 `litellm-proxy-extras` 包。[查看全部](https://github.com/BerriAI/litellm/tree/main/litellm-proxy-extras/litellm_proxy_extras/migrations)

2. 核心 litellm pip 包升版并指向新的 `litellm-proxy-extras` 包。这确保旧版本的 LiteLLM 继续使用旧迁移。[查看代码](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/pyproject.toml#L58)

3. 升级到新版 LiteLLM 时，迁移文件会被应用到数据库。[查看代码](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/litellm-proxy-extras/litellm_proxy_extras/utils.py#L42)

### 只读文件系统

以 `readOnlyRootFilesystem: true` 运行 LiteLLM 是 Kubernetes 的安全最佳实践，可阻止容器进程写根文件系统。LiteLLM 完全支持这种配置。

如果看到 `Permission denied` 错误，说明 LiteLLM Pod 正以只读文件系统运行。LiteLLM 需要以下可写目录：
- **数据库迁移**：设置 `LITELLM_MIGRATION_DIR="/path/to/writable/directory"`
- **管理界面**：设置 `LITELLM_UI_PATH="/path/to/writable/directory"`
- **UI 资产/Logo**：设置 `LITELLM_ASSETS_PATH="/path/to/writable/directory"`

**方式一：用 EmptyDir 卷加 InitContainer（推荐）**

这种方式在 Pod 启动时把 Docker 镜像里预构建的 UI 复制到可写的 emptyDir 卷。

<details>
<summary>完整 Deployment 清单（initContainer、env、securityContext、volumes）</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-proxy
spec:
  template:
    spec:
      initContainers:
        - name: setup-ui
          image: ghcr.io/berriai/litellm:latest
          command:
            - sh
            - -c
            - |
              cp -r /var/lib/litellm/ui/* /app/var/litellm/ui/ && \
              cp -r /var/lib/litellm/assets/* /app/var/litellm/assets/
          volumeMounts:
            - name: ui-volume
              mountPath: /app/var/litellm/ui
            - name: assets-volume
              mountPath: /app/var/litellm/assets

      containers:
        - name: litellm
          image: ghcr.io/berriai/litellm:latest
          env:
            - name: LITELLM_NON_ROOT
              value: "true"
            - name: LITELLM_UI_PATH
              value: "/app/var/litellm/ui"
            - name: LITELLM_ASSETS_PATH
              value: "/app/var/litellm/assets"
            - name: LITELLM_MIGRATION_DIR
              value: "/app/migrations"
            - name: PRISMA_BINARY_CACHE_DIR
              value: "/app/cache/prisma-python/binaries"
            - name: XDG_CACHE_HOME
              value: "/app/cache"
          securityContext:
            readOnlyRootFilesystem: true
            runAsNonRoot: true
            runAsUser: 101
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: config
              mountPath: /app/config.yaml
              subPath: config.yaml
              readOnly: true
            - name: ui-volume
              mountPath: /app/var/litellm/ui
            - name: assets-volume
              mountPath: /app/var/litellm/assets
            - name: cache
              mountPath: /app/cache
            - name: migrations
              mountPath: /app/migrations

      volumes:
        - name: config
          configMap:
            name: litellm-config
        - name: ui-volume
          emptyDir:
            sizeLimit: 100Mi
        - name: assets-volume
          emptyDir:
            sizeLimit: 10Mi
        - name: cache
          emptyDir:
            sizeLimit: 500Mi
        - name: migrations
          emptyDir:
            sizeLimit: 64Mi
```

</details>

**方式二：不启用 UI（纯 API 部署）**

不需要管理界面时，可以用最小配置运行：

```yaml
env:
  - name: LITELLM_NON_ROOT
    value: "true"
  - name: LITELLM_MIGRATION_DIR
    value: "/app/migrations"
securityContext:
  readOnlyRootFilesystem: true
```

代理会记录一条关于 UI 的警告，但 API 端点正常工作。

只读文件系统相关的环境变量：

| 变量 | 用途 | 默认值 |
|----------|---------|---------|
| `LITELLM_UI_PATH` | 管理界面目录 | `/var/lib/litellm/ui` (Docker) |
| `LITELLM_ASSETS_PATH` | UI 资产/Logo | `/var/lib/litellm/assets` (Docker) |
| `LITELLM_MIGRATION_DIR` | 数据库迁移 | 包目录 |
| `PRISMA_BINARY_CACHE_DIR` | Prisma 二进制缓存 | 系统默认 |
| `XDG_CACHE_HOME` | 通用缓存目录 | 系统默认 |

注意：`LITELLM_MIGRATION_DIR` 始终要指向可写的 emptyDir 路径，`PRISMA_BINARY_CACHE_DIR` 和 `XDG_CACHE_HOME` 也要设为可写路径。如果使用自定义 `server_root_path`，必须在 Dockerfile 中预处理 UI 文件，因为只读文件系统下代理无法在运行期修改文件。UI 中存在 `.litellm_ui_ready` 标记文件（由官方 Docker 镜像创建）时，会被自动识别为已预重构。

## 验证生产就绪状态

### 预期性能

参见[网关压测结果](../benchmarks.md#high-throughput-profile-3000-rps-with-50k-to-100k-token-prompts)。

### 确认调试日志已关闭

代理服务器日志中应只出现以下详细程度的内容：

```shell
# INFO:     192.168.2.205:11774 - "POST /chat/completions HTTP/1.1" 200 OK
# INFO:     192.168.2.205:34717 - "POST /chat/completions HTTP/1.1" 200 OK
# INFO:     192.168.2.205:29734 - "POST /chat/completions HTTP/1.1" 200 OK
```

## 部署常见问题

**Q：Postgres 是唯一支持的数据库吗？还支持别的吗（比如 Mongo）？**

A：我们尝试过 MySQL，但它难以维护，还给客户带来过 bug。目前 PostgreSQL 是我们生产部署主要支持的数据库。

LiteLLM 通过 Prisma 走 PostgreSQL 线协议与数据库通信，因此任何兼容 Postgres 线协议的分布式 SQL 数据库都可以直接替换使用。[YugabyteDB](https://www.yugabyte.com/) 就在生产中这样使用：把 `DATABASE_URL` 指向它的 YSQL 端点（`postgresql://<user>:<password>@<host>:<port>/<dbname>`），LiteLLM 的迁移和查询原样可用。如果你需要超出单个 Postgres 实例的横向扩展或多区域高可用，这是不错的选择。

**Q：Postgres 宕机时 LiteLLM 会怎样？是故障放行（fail-open），还是 API 一起不可用？**

A：数据库在你的 VPC 内时可以优雅应对其不可用；参见上文的[优雅应对数据库不可用](#优雅应对数据库不可用)。

:::info

需要帮助或想要专属支持？通过[这里](https://enterprise.litellm.ai/demo)联系创始人。

:::
