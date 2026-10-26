---
title: 生产环境部署
description: LiteLLM 在 AWS、GCP、Azure 或任意 Kubernetes 集群上的生产环境部署指南，提供 Helm 图表与官方 Terraform 模块。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';
import { CloudArchitectureSelector } from '@site/src/components/CloudArchitecture';

# 生产环境部署

本指南面向 AWS、Google Cloud、Azure 或任意 Kubernetes 集群上的生产环境部署。如果是在单台机器上做第一次部署，请先看[快速上手](./docker_quick_start.md)；本页从它结束的地方接着讲。

官方支持两条路线。如果你在用 Kubernetes，可以在 EKS、GKE 或 AKS 上[使用 Helm 部署](#使用-helm-部署)；各云的安装步骤完全一致，只有数据存储与 Ingress 不同。如果你不用 Kubernetes，AWS 和 GCP 提供[官方 Terraform 模块](#使用-terraform-部署-aws-与-gcp)来拉起整套技术栈；Azure 没有 Terraform 模块，因此在 Azure 上受支持的路线是 AKS 加 Helm。

## 架构

<CloudArchitectureSelector />

LiteLLM 提供两种部署模式：

- **单体**（monolithic）：一个 `litellm` 镜像同时承载 LLM 流量、管理 API 和 UI。`litellm-helm` 图表运行的就是这种模式，运维上也最简单。
- **微服务**（microservices）：`gateway`（LLM 流量，端口 4000）、`backend`（管理 API 与 UI 后端，端口 4001）和 `ui`（端口 3000）各自独立部署、独立扩缩。组件化的 `litellm` 图表和两个 Terraform 模块运行的就是这种模式；完整配置项见[图表 values 参考](https://github.com/BerriAI/litellm/blob/main/helm/litellm/values.yaml)。

两种模式下的配套基础设施完全相同：

| 组件 | 用途 | 说明 |
|---|---|---|
| LiteLLM 服务 | 单个代理部署（单体模式），或 gateway + backend + ui（微服务模式） | 无状态；在负载均衡后面运行 2 个以上副本 |
| PostgreSQL | 密钥、团队、用户、花费日志、配置 | 代理的鉴权与用量统计功能所必需 |
| Redis | 速率限制、路由器状态、跨实例缓存 | 只要运行多个实例就必需 |
| 迁移作业 | 对 Postgres 执行数据库结构迁移 | 每次升级运行一次；代理实例设置 `DISABLE_SCHEMA_UPDATE=true` |

## 核心配置

```bash
DATABASE_URL="postgresql://user:password@host:5432/litellm"
LITELLM_MASTER_KEY="sk-..."   # admin key for the proxy
LITELLM_SALT_KEY="sk-..."     # encrypts provider credentials stored in the DB. Set once, never change it
DISABLE_SCHEMA_UPDATE="true"  # proxy instances never run migrations; the migrations job does
STORE_MODEL_IN_DB="True"      # manage models from the Admin UI instead of config files
```

添加模型之后 `LITELLM_SALT_KEY` 就不能再轮换了：它加密着存进数据库的提供商凭据，一旦更换，这些凭据将无法解密。请生成一个足够强的随机值，并把两个密钥都存进所在云的密钥管理器（secret manager）。

官方镜像发布在 `ghcr.io/berriai`，并在 `docker.litellm.ai/berriai` 提供同步镜像。单体部署请使用 `ghcr.io/berriai/litellm`，带 Postgres 的部署也包括在内，因为它内置了 Prisma 工具链；版本要锁定具体 tag，不要用 `latest` 这类浮动 tag，回滚才有确定结果。所有镜像均经过签名；验证方法与非 root 变体见 [Docker 镜像安全指南](./docker_image_security.md)。

## 开通数据存储

Helm 路线需要一个 PostgreSQL 数据库和一个集群内可达的 Redis。直接用托管的云服务：

<Tabs>
<TabItem value="aws" label="AWS">

在与 EKS 集群相同的 VPC 内开通 [RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html) 和 [ElastiCache Redis](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)，并在安全组中放行集群节点访问 5432 和 6379 端口。

</TabItem>
<TabItem value="gcp" label="Google Cloud">

在 GKE 集群所在的 VPC 上开通带私有 IP 的 [Cloud SQL PostgreSQL](https://cloud.google.com/sql/docs/postgres) 和 [Memorystore Redis](https://cloud.google.com/memorystore/docs/redis)（Cloud SQL 需要先启用[专用服务访问（Private Services Access）](https://cloud.google.com/vpc/docs/private-services-access)）。下文各处的端点请填实例的私有 IP。

</TabItem>
<TabItem value="azure" label="Azure">

```bash
az group create --name litellm-prod --location eastus

az aks create --resource-group litellm-prod --name litellm-aks \
  --node-count 3 --enable-managed-identity

az postgres flexible-server create --resource-group litellm-prod \
  --name litellm-db --database-name litellm \
  --tier GeneralPurpose --sku-name Standard_D2ds_v5

az redis create --resource-group litellm-prod --name litellm-redis \
  --location eastus --sku Standard --vm-size c1
```

文档：[AKS](https://learn.microsoft.com/en-us/azure/aks/what-is-aks)、[Azure Database for PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/overview)、[Azure Cache for Redis](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-overview)。Azure Cache for Redis 在 6380 端口提供 TLS，TLS 通过 URL 协议头开启：不设 `redis_host` 和 `redis_port`，而是在 `router_settings` 下设置 `redis_url: "rediss://:<access-key>@litellm-redis.redis.cache.windows.net:6380"`（`rediss://` 协议头即表示启用 TLS）。

</TabItem>
</Tabs>

## 使用 Helm 部署

先创建两张图表都要消费的 Secret：

```bash
kubectl create secret generic litellm-masterkey \
  --from-literal=masterkey="sk-$(openssl rand -hex 24)"

kubectl create secret generic litellm-db \
  --from-literal=username=litellm \
  --from-literal=password="<database-password>"

kubectl create secret generic litellm-env \
  --from-literal=LITELLM_SALT_KEY="sk-$(openssl rand -hex 24)" \
  --from-literal=REDIS_PASSWORD="<redis-password>" \
  --from-literal=OPENAI_API_KEY="<provider-key>"
```

然后选择一种部署模式：

<Tabs>
<TabItem value="monolith" label="单体（litellm-helm）">

```yaml title="values.yaml"
replicaCount: 3

image:
  repository: ghcr.io/berriai/litellm
  tag: "v1.90.2"          # pin your version

masterkeySecretName: litellm-masterkey
masterkeySecretKey: masterkey

db:
  useExisting: true
  deployStandalone: false
  endpoint: "<postgres-endpoint>"
  database: litellm
  secret:
    name: litellm-db
    usernameKey: username
    passwordKey: password

environmentSecrets:
  - litellm-env

proxy_config:
  model_list:
    - model_name: {{openai_large}}
      litellm_params:
        model: openai/{{openai_large}}
        api_key: os.environ/OPENAI_API_KEY
  router_settings:
    redis_host: "<redis-endpoint>"
    redis_port: 6379
    redis_password: os.environ/REDIS_PASSWORD
```

```bash
helm install litellm oci://ghcr.io/berriai/litellm-helm -f values.yaml
```

该图表位于 [`helm/litellm-helm`](https://github.com/BerriAI/litellm/tree/main/helm/litellm-helm)；已发布的 chart 版本号与 LiteLLM 发版号一致（例如 `1.90.2`），运行 `helm show values oci://ghcr.io/berriai/litellm-helm` 可列出全部可调项。除上述 values 外，它还支持[自动扩缩容](#自动扩缩容)（`autoscaling.*` 或 `keda.*`）、PodDisruptionBudgets（`pdb.*`）、Prometheus ServiceMonitor（`serviceMonitor.*`）、只读副本路由（`db.readReplicaUrl`，见[数据库只读副本](./db_read_replica.md)）、停机时优雅排空（`lifecycle`）、迁移作业的 ArgoCD 或 Helm 钩子（`migrationJob.hooks.*`，见 [Helm PreSync 钩子](./prod.md#通过-helm-presync-钩子执行迁移)），以及通过 `metricsServer.*` 配置的[独立 Prometheus 指标监听端口](./prometheus.md#将-prometheus-抓取与推理流量隔离)（可选）。

</TabItem>
<TabItem value="micro" label="微服务（litellm）">

```yaml title="values.yaml"
masterKey:
  secretName: litellm-masterkey
  secretKey: masterkey

database:
  writer:
    host: "<postgres-endpoint>"
    port: 5432
    dbname: litellm
    passwordSecret:
      name: litellm-db
      usernameKey: username
      passwordKey: password
  # optional: add database.reader to route reads to a replica

redis:
  host: "<redis-endpoint>"
  port: 6379
  passwordSecret:
    name: litellm-env
    passwordKey: REDIS_PASSWORD

# one host fronting gateway, backend, and ui
ingress:
  enabled: true
  className: "<alb | gce | azure-application-gateway | nginx>"
  # alb (default) or nginx. ingress-nginx's admission webhook rejects the chart's
  # dotted paths (/favicon.ico, /eu.assemblyai) unless this is nginx
  controller: alb
  host: llm.example.com
  # optional: routes the chart does not ship a rule for, e.g. a passthrough
  # prefix added after this chart version or a custom
  # general_settings.pass_through_endpoints path. Additive: every built-in
  # UI, gateway, and backend path is still rendered
  extraPaths:
    - path: /watsonx
      pathType: Prefix     # default; Exact and ImplementationSpecific also work
      service: gateway     # default; backend and ui also work
```

```bash
helm upgrade --install litellm \
  oci://ghcr.io/berriai/litellm/chart/litellm \
  --version 1.89.2 \
  -f values.yaml
```

这种模式把 `gateway`、`backend` 和 `ui` 部署为独立服务，可以只为推理流量扩缩 gateway，而不动管理 API 和管理界面（Admin UI）。该图表要求使用外部 Postgres 与 Redis，并支持数据库只读副本、IAM 数据库认证、Redis Cluster、按组件配置探针以及按组件自动扩缩。

图表版本请锁定在 `1.89.0` 或更新。每个组件的镜像 tag 默认与 chart 版本一致。全部配置项见[图表 values 参考](https://github.com/BerriAI/litellm/blob/main/helm/litellm/values.yaml)，扩缩配置见[自动扩缩容](#自动扩缩容)，gateway 指标 sidecar 见 [Prometheus 指标隔离](./prometheus.md#将-prometheus-抓取与推理流量隔离)。

[高吞吐部署配置](./high_throughput.md)在此之上增加了共享数据库连接、独立运行的花费处理，以及基于 RPS/TPS 的自动扩缩。

</TabItem>
</Tabs>

两张图表都会自动运行迁移作业，并让代理 Pod 保持 `DISABLE_SCHEMA_UPDATE=true`。通过所在云的 Ingress 暴露服务：EKS 用 [AWS Load Balancer Controller](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html)，GKE 用 [GKE Ingress](https://cloud.google.com/kubernetes-engine/docs/concepts/ingress)，AKS 用 [Application Gateway Ingress（AGIC）](https://learn.microsoft.com/en-us/azure/application-gateway/ingress-controller-overview)，健康检查路径为 `/health/readiness`，然后把 DNS 记录指向生成的负载均衡器。Secret 方面，优先用所在云的密钥管理器而不是普通 Kubernetes Secret（例如 AKS 上的 [Key Vault CSI 驱动](https://learn.microsoft.com/en-us/azure/aks/csi-secrets-store-driver)）；图表会直接消费你挂载的任何 Secret。

### 自动扩缩容

两张图表都能自动扩缩，且默认要么关闭、要么非常保守。该把阈值定在什么水平、为什么内存不在其列，参见[生产环境检查清单中的自动扩缩容](./prod.md#自动扩缩容)。

`litellm-helm` 提供两种互斥机制。`autoscaling.*` 生成标准的 HorizontalPodAutoscaler；`keda.*` 生成 KEDA `ScaledObject`，可按队列深度、Prometheus 查询或 KEDA 能读取的其他指标扩缩。两者同时开启时只会生成 HPA，所以二选一。

```yaml
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
  # targetMemoryUtilizationPercentage and behavior are also accepted

keda:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  pollingInterval: 30   # seconds between trigger evaluations
  cooldownPeriod: 300   # seconds of quiet before scaling back to minReplicas
  triggers: []          # required; a ScaledObject with no triggers will not scale
```

`keda.triggers` 默认为空，也没有可用的默认值，触发器需要自行提供；图表的 `values.yaml` 里带一个注释掉的 Prometheus 示例。`keda.fallback`、`keda.behavior` 和 `keda.restoreToOriginalReplicaCount` 会原样透传，用于控制指标源不可用时的行为，以及扩缩事件之后副本数如何收敛。

组件化图表把各组件的扩缩配置分开放在 `gateway.hpa`、`backend.hpa` 和 `ui.hpa` 下。gateway 和 backend 开箱即自动扩缩，UI 默认不扩；上限按各组件的流量形态分别设定：gateway 默认 `maxReplicas: 10`，目标 70% CPU 与 80% 内存；backend 默认 `maxReplicas: 4`，目标 70% CPU；UI 默认 `maxReplicas: 3`、目标 80% CPU，且 `enabled: false`。通常只需调高 gateway 的上限，因为它是唯一直面 LLM 流量的组件。

无论用哪种机制，副本上限都要按数据库的实际承载能力来定。连接池按 worker 分配，副本数的上限同时也是 Postgres 连接数的上限；`litellm-helm` 的 `maxReplicas` 默认 100，在连接池默认上限 10 的情况下，完全扩展开约需 1000 个连接。参见[限制数据库连接数](./prod.md#限制数据库连接数)。

#### 按每 Pod 请求数与 Token 数扩缩

CPU 对 LLM 流量有滞后：一个正在流式输出 40 个响应的 Pod，大部分时间都在等提供商返回，容量已经耗尽而 CPU 却仍然不高。两张图表都能按代理本来就导出的两个计数器扩缩，即 `litellm_proxy_total_requests_metric_total` 和 `litellm_total_tokens_metric_total`，换算成每 Pod 每秒请求数（RPS）与每秒 Token 数（TPS），这正是平时描述负载的常用口径（1k rps、75M tok/s）。这些目标是可选配置，默认为空，不设置就没有任何变化；它们与 CPU、内存目标并列生效：HPA 取要求副本数最多的那个指标。`averageValue` 是 Kubernetes 数量值，所以 `"6M"` 和 `"6000000"` 表示相同的每秒 Token 数。

```yaml
# litellm-helm
autoscaling:
  enabled: true
  targetRequestsPerSecond: "90"
  targetTokensPerSecond: "6M"
metricsServer:
  enabled: true
serviceMonitor:
  enabled: true

# componentized chart
gateway:
  metricsServer:
    enabled: true
  serviceMonitor:
    enabled: true
  hpa:
    targetRequestsPerSecond: "90"
    targetTokensPerSecond: "6M"
```

每个目标都会渲染成一个 `autoscaling/v2` 的 `Pods` 指标，名为 `litellm_requests_per_second` 或 `litellm_tokens_per_second`，目标类型为 `AverageValue`。Kubernetes 自己读不了 Prometheus，所以要先满足两个前提。其一是图表的 ServiceMonitor（Prometheus Operator）会逐个抓取每个 Pod，保证每个样本都带 `pod` 标签。其二要随之打开独立指标监听（组件化图表用 `gateway.metricsServer.enabled`，`litellm-helm` 用 `metricsServer.enabled`）：主端口上的 `/metrics/` 由虚拟密钥（virtual key）认证保护，未认证的抓取会得到 401，因此不开这个监听，组件化图表会拒绝生成 ServiceMonitor。最后还需要一个 [Prometheus Adapter](https://github.com/kubernetes-sigs/prometheus-adapter) 把这两个指标名暴露在 `custom.metrics.k8s.io` 上，并按 pod 分组。`rate()` 返回的本来就是每秒值，所以不需要 `* 60`：

```yaml
rules:
  - seriesQuery: 'litellm_proxy_total_requests_metric_total{namespace!="",pod!=""}'
    resources: { overrides: { namespace: { resource: namespace }, pod: { resource: pod } } }
    name: { as: litellm_requests_per_second }
    metricsQuery: sum(rate(<<.Series>>{<<.LabelMatchers>>}[1m])) by (<<.GroupBy>>)
  - seriesQuery: 'litellm_total_tokens_metric_total{namespace!="",pod!=""}'
    resources: { overrides: { namespace: { resource: namespace }, pod: { resource: pod } } }
    name: { as: litellm_tokens_per_second }
    metricsQuery: sum(rate(<<.Series>>{<<.LabelMatchers>>}[1m])) by (<<.GroupBy>>)
```

单位只是一个常数因子，并不会让 HPA 反应更快。真正决定延迟的是适配器规则里的 `rate()` 窗口、抓取间隔和 HPA 同步周期（默认 15 秒）。窗口保持 `[1m]`，ServiceMonitor 间隔保持图表默认的 15 秒或更快，窗口里才能始终保住至少四个样本：流量突变后，信号在下一次抓取时变动，60 秒后到达满值，而 `[2m]` 窗口此时才到一半。

两个计数器都按 model、key、team 标签拆分，`sum by (pod)` 会把一个 Pod 的所有序列合并成一个数。`kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1/namespaces/<ns>/pods/*/litellm_tokens_per_second` 可以直接查看 HPA 读到的值。算个例子：10 个 gateway Pod 共承担 1000 rps，每 Pod 100 rps，目标 90，HPA 会申请 `ceil(10 * 100 / 90) = 12` 个副本。Token 指标是同样的算法：10 个 Pod 每秒合计输出 70,000,000 个 Token，平均 7,000,000 TPS，目标 6,000,000，于是 `ceil(10 * 7000000 / 6000000) = 12`。

Token 在响应结束那一刻才计数，所以长的流式响应要等它完成才会计入 TPS。RPS 先动、TPS 后跟，这对扩容没问题，但意味着一拨长时间流式请求在跑完之前会一直被低估。如果流量以分钟级的流式请求为主，就不要只设 TPS 目标。

在 `litellm-helm` 上，同样的信号可以经 KEDA 获得，而且不需要适配器。`keda.prometheus.requestsPerSecond` 和 `keda.prometheus.tokensPerSecond` 表示单个副本应承载的负载，各自会添加一个 Prometheus 触发器，查询 `sum(rate(<counter>{namespace="<release namespace>",job="<release>-metrics"}[1m]))`，按 release 所在命名空间和图表 ServiceMonitor 产生的 `job` 标签筛选。KEDA 用整个 release 的速率除以单副本阈值得到副本数，相同流量下结果与 HPA 路径一致。`keda.pollingInterval` 同样保持在 15 秒或更低，理由与上面的抓取间隔相同。

```yaml
keda:
  enabled: true
  prometheus:
    serverAddress: http://prometheus-operated.monitoring.svc:9090
    requestsPerSecond: "90"
    tokensPerSecond: "6000000"
metricsServer:
  enabled: true
serviceMonitor:
  enabled: true
```

在 AWS ECS 上，Terraform 模块接受同样的每秒输入：`gateway_target_requests_per_second` 作用于 `ALBRequestCountPerTarget`，`gateway_target_tokens_per_second` 则要先把 Token 计数器发布到 CloudWatch 才能使用；因为 ALB 上报的是每分钟计数，模块会自行换算。CloudWatch 目标追踪对每个指标都按 60 秒周期聚合，且周期不可配置，所以无论什么单位，ECS 的反应节奏都在一分钟左右；两种策略都记录在[模块 README](https://github.com/BerriAI/litellm/blob/main/terraform/litellm/aws/README.md#scaling-the-gateway-on-requests-and-tokens) 中。Cloud Run 按请求并发数扩缩，不接受自定义指标，所以 GKE 之外在 GCP 上没有 TPS 路线。

### 不用 Helm 的 Kubernetes 部署

如果你直接管理原始清单，等价的部署物是：一个存放 `config.yaml` 的 ConfigMap、一个存密钥的 Secret、一个带健康探针的 Deployment，以及一个 Service。

<details>
<summary>完整清单（ConfigMap、Secret、Deployment、Service）</summary>

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: litellm-config-file
data:
  config.yaml: |
      model_list:
        - model_name: {{openai_large}}
          litellm_params:
            model: openai/{{openai_large}}
            api_key: os.environ/OPENAI_API_KEY
---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: litellm-secrets
data:
  OPENAI_API_KEY: bWVvd19pbV9hX2NhdA== # your api key in base64
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-deployment
  labels:
    app: litellm
spec:
  replicas: 2
  selector:
    matchLabels:
      app: litellm
  template:
    metadata:
      labels:
        app: litellm
    spec:
      containers:
      - name: litellm
        image: docker.litellm.ai/berriai/litellm:v1.90.2 # pin a version, do not use :latest
        args:
          - "--config"
          - "/app/proxy_server_config.yaml"
        ports:
        - containerPort: 4000
        volumeMounts:
        - name: config-volume
          mountPath: /app/proxy_server_config.yaml
          subPath: config.yaml
        envFrom:
        - secretRef:
            name: litellm-secrets
        livenessProbe:
          httpGet:
            path: /health/liveliness
            port: 4000
          initialDelaySeconds: 120
          periodSeconds: 15
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
apiVersion: v1
kind: Service
metadata:
  name: litellm-service
spec:
  selector:
    app: litellm
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: NodePort
```

</details>

要接上数据库，把 `DATABASE_URL` 和 `LITELLM_MASTER_KEY` 加进 Secret 即可；清单的其余部分都不用改，因为镜像里已经内置了 Prisma 工具链。

## 使用 Terraform 部署 AWS 与 GCP

官方模块会部署完整的微服务技术栈（网络、数据库、Redis、对象存储、密钥、计算、负载均衡器，以及一个在服务启动前运行的迁移作业），并已发布到 Terraform Registry：

- [`BerriAI/litellm/aws`](https://registry.terraform.io/modules/BerriAI/litellm/aws/latest)
- [`BerriAI/litellm/google`](https://registry.terraform.io/modules/BerriAI/litellm/google/latest)

<Tabs>
<TabItem value="aws" label="AWS（ECS Fargate）">

默认情况下会创建：带公有与私有子网的 VPC、Aurora PostgreSQL 集群（一写一读，IAM 数据库认证）、ElastiCache Redis（多可用区、已加密）、一个 S3 桶、Secrets Manager 条目、一个 Application Load Balancer，以及 ECS Fargate 服务。网络与两个数据存储都是可选的，可以复用账号里已有的资源，见下文。

```hcl title="main.tf"
module "litellm" {
  source  = "BerriAI/litellm/aws"
  version = "~> 1.90"

  region = "us-east-1"
  azs    = ["us-east-1a", "us-east-1b"]
  tenant = "acme"
  env    = "prod"

  ui_password         = var.ui_password
  litellm_license     = var.litellm_license      # optional, omit for open source
  acm_certificate_arn = var.acm_certificate_arn  # TLS is required by default

  proxy_config = {
    model_list = [{
      model_name = "{{openai_large}}"
      litellm_params = {
        model   = "openai/{{openai_large}}"
        api_key = "os.environ/OPENAI_API_KEY"
      }
    }]
  }
  gateway_extra_secrets = {
    OPENAI_API_KEY = var.openai_key_secret_arn
  }
}
```

执行 apply 之前：先在 [AWS Certificate Manager](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html) 里准备好 TLS 证书（除非显式设置 `allow_plaintext_alb = true`，否则模块会拒绝明文 ALB），并提前在 [Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html) 中创建所需的提供商密钥 Secret，因为 `gateway_extra_secrets` 接收的是它们的 ARN。apply 完成后，把 DNS 记录指向 ALB 主机名。

如果不提供主密钥（master key），模块会自动生成一个并存入 Secrets Manager。应用通过短期 IAM token 连接 Aurora，所以它的 `DATABASE_URL` 不带密码（数据库主密码同样生成在 Secrets Manager 里，应用碰不到）。所有资源都以 `<tenant>-litellm-<env>` 命名，且模块不声明 provider，因此可以用 `for_each` 让每个租户各跑一套。

**自带 VPC、数据库或 Redis**。网络与两个数据存储各自都是可选项，可以部署进账号里已有的基础设施。当你的防护栏（guardrails）只允许工作负载跑在预先批准的 VPC 内，或者 Postgres 与 Redis 由另一个团队统一维护、要求你直接使用时，就该走这条路。只需设置想复用的部分；保持默认的项目仍会照常创建。

```hcl title="main.tf"
module "litellm" {
  source  = "BerriAI/litellm/aws"
  version = "~> 1.90"

  region = "us-east-1"
  tenant = "acme"
  env    = "prod"

  # Existing networking. Drop `azs` when you set these: no VPC, subnets,
  # route tables, internet gateway, or NAT gateway are created.
  vpc_id             = "vpc-0123456789abcdef0"
  public_subnet_ids  = ["subnet-aaa", "subnet-bbb"]  # ALB, 2+ AZs
  private_subnet_ids = ["subnet-ccc", "subnet-ddd"]  # tasks and data stores, 2+ AZs

  # Existing data stores. Each URL is stored in Secrets Manager and reaches
  # the containers as DATABASE_URL / REDIS_URL.
  create_database = false
  database_url    = var.database_url
  create_redis    = false
  redis_url       = var.redis_url

  # Attach a group your database already allows, alongside the module's own.
  additional_task_security_group_ids = ["sg-0123456789abcdef0"]
}
```

已有的存储必须放行来自任务的流量。模块始终会创建自己的任务安全组，并通过 `task_security_group_id` 输出暴露出来；你可以在数据库和 Redis 上对该安全组放行入站，或者通过 `additional_task_security_group_ids` 传入它们本就放行的安全组。自行提供的私有子网还需要有自己的出站通路（NAT 网关或 VPC endpoint），因为此模式下模块不会创建任何路由。从这些子网出发，它要访问 Secrets Manager、拉取容器镜像并调用 LLM 提供商。

只要模块仍要创建 Aurora 或 ElastiCache，提供的私有子网就必须覆盖至少两个可用区，因为两者的子网组都有这个要求。只有两个存储都关掉时，才允许只给一个私有子网。

把某个 `create_*` 设为 `false` 且 URL 留空，整套技术栈就完全不包含该组件。没有数据库就没有密钥管理、花费追踪和 UI 持久化，鉴权退化为只认主密钥。没有 Redis 时，速率限制、预算和路由器冷却按单个 gateway 进程计算而不是整个集群，而模块默认运行两个 gateway 任务并自动扩到十个，调用方分散在多个进程上时每个进程都各有一份完整配额。配置这种组合时 `terraform plan` 会给出警告。如果需要在没有 Redis 的情况下让按 key 的限制仍然有意义，就用 `gateway_autoscaling_enabled = false`、`gateway_desired_count = 1` 和 `gateway_num_workers = 1` 把 gateway 固定为单进程。

输入缺失或互相矛盾会在 `terraform plan` 阶段就报错，而不是等到 apply 进行到一半：只设 `vpc_id` 不给子网 ID，或去掉 `azs` 却不设 `vpc_id`，都会在创建任何资源之前先告诉你。

</TabItem>
<TabItem value="gcp" label="Google Cloud（Cloud Run）">

会创建：启用专用服务访问（Private Services Access）的 VPC、Cloud SQL PostgreSQL（主实例加只读副本）、带 TLS 的 Memorystore Redis、一个 GCS 桶、Secret Manager 条目、Cloud Run 服务，以及一个带 serverless NEG 的全球 HTTPS 负载均衡器。

```hcl title="main.tf"
module "litellm" {
  source  = "BerriAI/litellm/google"
  version = "~> 1.90"

  project_id = "my-project"
  region     = "us-central1"
  tenant     = "acme"
  env        = "prod"

  ui_password     = var.ui_password
  litellm_license = var.litellm_license  # optional

  # Cloud Run cannot pull from ghcr.io. Point this at an Artifact Registry
  # remote repository backed by ghcr.io, or mirror the images.
  image_registry = "us-central1-docker.pkg.dev/my-project/ghcr-remote/berriai"

  lb_domains = ["llm.example.com"]

  proxy_config = {
    model_list = [{
      model_name = "{{gemini_pro}}"
      litellm_params = { model = "vertex_ai/{{gemini_pro}}" }
    }]
  }
}
```

有三个 GCP 特有的注意事项。第一，务必覆盖 `image_registry`：它默认是 `ghcr.io/berriai`，而 Cloud Run 无法从那里拉镜像，结果就是 apply 成功但服务在拉镜像这一步失败。请把它指向一个代理 `ghcr.io` 的 [Artifact Registry 远程仓库](https://cloud.google.com/artifact-registry/docs/repositories/remote-overview)。第二，数据库通过 Secret Manager 用密码认证，而不是 IAM 认证；LiteLLM 的 IAM token 支持仅限 AWS RDS。第三，apply 完成后要为 `lb_domains` 创建指向负载均衡器 IP 的 DNS 记录；[Google 托管证书](https://cloud.google.com/load-balancing/docs/ssl-certificates/google-managed-certs)要等域名解析到它之后才能完成签发。

</TabItem>
</Tabs>

AWS 模块可以用 `gateway_metrics_port` 把 Prometheus 采集放进一个独立的 ECS sidecar 运行，并用 `gateway_metrics_scrape_cidrs` 限制访问范围；参见[将 Prometheus 抓取与推理流量隔离](./prometheus.md#将-prometheus-抓取与推理流量隔离)。

整套技术栈跑起来之后，如果想用代码方式管理 LiteLLM 资源（密钥、团队、模型），可以使用 [terraform-provider-litellm](https://github.com/BerriAI/terraform-provider-litellm)。

## 其他平台

<Tabs>
<TabItem value="render" label="Render">

部署到 [Render](https://render.com/)：

<iframe width="840" height="500" src="https://www.loom.com/embed/805964b3c8384b41be180a61442389a3" frameBorder="0" allowFullScreen></iframe>

</TabItem>
<TabItem value="railway" label="Railway">

部署到 [Railway](https://railway.app)：点击按钮，然后在 Railway 的环境变量里设置 `PORT=4000`。

[![在 Railway 上部署](https://railway.app/button.svg)](https://railway.app/template/S7P9sn?referralCode=t3ukrU)

</TabItem>
</Tabs>

## 验证部署

确认代理已经启动并能连上数据库：

```bash
curl -s https://llm.example.com/health/readiness
```

然后打开 `https://llm.example.com/ui` 进入管理界面，用主密钥登录，添加一个模型，创建一个虚拟密钥，再从 Playground 发一条消息；只要收到响应，就证明从负载均衡器、代理、数据库到提供商凭据的整条链路都是通的。[快速上手](./docker_quick_start.md#2-登录管理界面)带截图逐步演示了这些操作；生产部署上的流程完全一致。

## 后续步骤

用[生产环境检查清单](./prod.md)配置 worker、资源、Redis、优雅降级与服务器调优。用 [Docker 镜像安全指南](./docker_image_security.md)验证镜像。多地域扩展参见[多区域部署](./multi_region.md)。负载超过 1000 RPS 时，启用 [Redis 事务缓冲](./prod.md#redis-事务缓冲区)并评估[高吞吐部署配置](./high_throughput.md)。


