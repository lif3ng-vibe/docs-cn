---
title: 从 Kubernetes Manifests 迁移到微服务 Chart
description: 将以手写 Kubernetes manifests 部署的 LiteLLM 代理迁移到组件化的 litellm Helm chart，让网关、后端与 UI 各自独立扩缩。
---

# 从 Kubernetes Manifests 迁移到微服务 Chart

本指南把一套以手写 Kubernetes manifests 运行的 LiteLLM 代理（即 [不使用 Helm 的 Kubernetes 部署](./deploy.md#不用-helm-的-kubernetes-部署) 那种布局：一个 `Deployment`、一个 `Service`、一个 `ConfigMap` 和一个 `Secret`）迁移到组件化的 `litellm` Helm chart。在这套 chart 里，LLM 流量（`gateway`）、管理 API（`backend`）和管理界面（Admin UI，`ui`）分别作为独立 Deployment 运行，各自带自动扩缩。现有的 Postgres 数据库和 Redis 原样保留，不迁移任何数据。旧 Deployment 在新发布接管流量之前始终在线，因此每一步都可以回退。

你需要 `helm` 3.8 或更高版本、可访问目标命名空间的 `kubectl`、现有 manifests，以及从集群到 Postgres 和 Redis 的网络连通性。各配置项的作用见 chart 的 [`values.yaml`](https://github.com/BerriAI/litellm/blob/main/helm/litellm/values.yaml)；两种模式背后的架构见 [生产部署](./deploy.md#架构)。

## 1. 记录当前部署

记录当前的镜像标签、副本数、配置，以及代理此刻读取的每一个环境变量，确保迁移过程不遗漏任何东西。

```bash
kubectl get deploy litellm-deployment -o yaml > old-deployment.yaml
kubectl get cm litellm-config-file -o yaml > old-config.yaml
kubectl get svc litellm-service -o yaml > old-service.yaml
kubectl get ingress -o yaml > old-ingress.yaml
kubectl get secret litellm-secrets -o jsonpath='{.data}' | jq 'keys'
```

名称请按你的 manifests 调整。从 `old-deployment.yaml` 中记下 `spec.replicas`、`spec.template.spec.containers[0].image`、`env`、`envFrom`、`resources` 以及任何探针覆盖项。从 `old-config.yaml` 中保留 `config.yaml` 的正文，第 4 步会原样复用它。

## 2. 将 `DATABASE_URL` 拆分为用户名和密码 Secret

chart 从不读取 `DATABASE_URL`。它从分散的配置值和一个 Secret 中设置 `DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_NAME`、`DATABASE_USER` 与 `DATABASE_PASSWORD`，URL 由代理自行拼出。把现有 URL（`postgresql://USER:PASSWORD@HOST:PORT/DBNAME`）中的各段拆出来，创建 Secret：

```bash
kubectl create secret generic litellm-db \
  --from-literal=username='USER' \
  --from-literal=password='PASSWORD'
```

含 `@`、`/` 或 `%` 的密码在这里无需转义，代理会自行做百分号编码。

现有的 `litellm-secrets` Secret 要保留。chart 直接从中引用主密钥（master key），其中的提供商密钥也会在第 4 步整体挂载。如果旧 Deployment 里设置过 `LITELLM_SALT_KEY`，请把它放进同一个 Secret；改动该值会让已存储的提供商凭据无法解读。

## 3. 选择 chart 版本

把 chart 固定在与当前代理镜像相同或更新的版本；组件镜像标签默认取 chart 版本，因此运行 `v1.90.2` 的代理对应 chart `1.90.2`。最早支持的版本是 chart `1.89.0`。

```bash
helm show chart oci://ghcr.io/berriai/litellm/chart/litellm --version 1.90.2
```

## 4. 编写 `values.yaml`

参照下表把 manifests 转写为 chart 配置。

| Manifest 项 | 对应的 chart 值 |
| --- | --- |
| `ConfigMap` 中 `config.yaml` 的正文 | `gateway.config.proxy_config`（gateway 与 backend 共用） |
| Secret 中的 `LITELLM_MASTER_KEY` 键 | `masterKey.secretName`、`masterKey.secretKey` |
| `DATABASE_URL` | `database.writer.host`、`.port`、`.dbname`、`.passwordSecret`（第 2 步） |
| `REDIS_HOST`、`REDIS_PORT`、`REDIS_PASSWORD` | `redis.host`、`redis.port`、`redis.passwordSecret` |
| `envFrom.secretRef` 中的提供商密钥 | `gateway.envSecrets` 与 `backend.envSecrets` |
| 其他 `env` 条目 | `gateway.extraEnv`、`backend.extraEnv` |
| `spec.replicas` | `gateway.hpa.minReplicas`（或在 `gateway.hpa.enabled: false` 时用 `gateway.replicaCount`） |
| `resources` | `gateway.resources` |
| `args: ["--config", ...]` | 删除；chart 会自行设置 `CONFIG_FILE_PATH` |
| `Ingress` 的 host | `ingress.host` |

一个两副本、提供商密钥放在 `litellm-secrets`、Redis 位于 `redis.internal` 的 manifest 部署，转写后为：

```yaml title="values.yaml"
masterKey:
  secretName: litellm-secrets
  secretKey: LITELLM_MASTER_KEY

database:
  writer:
    host: postgres.internal
    port: 5432
    dbname: litellm
    passwordSecret:
      name: litellm-db
      usernameKey: username
      passwordKey: password

redis:
  host: redis.internal
  port: 6379
  passwordSecret:
    name: litellm-secrets
    passwordKey: REDIS_PASSWORD

gateway:
  envSecrets:
    - litellm-secrets
  resources:
    requests: { cpu: "1", memory: 4Gi }
    limits: { cpu: "2", memory: 4Gi }
  hpa:
    minReplicas: 2
    maxReplicas: 10
  config:
    proxy_config:
      model_list:
        - model_name: gpt-4o
          litellm_params:
            model: openai/gpt-4o
            api_key: os.environ/OPENAI_API_KEY
      router_settings:
        redis_host: os.environ/REDIS_HOST
        redis_port: os.environ/REDIS_PORT
        redis_password: os.environ/REDIS_PASSWORD
      litellm_settings:
        cache: true
        cache_params:
          type: redis
          host: os.environ/REDIS_HOST
          port: os.environ/REDIS_PORT
          password: os.environ/REDIS_PASSWORD

backend:
  envSecrets:
    - litellm-secrets

ingress:
  enabled: false
```

如果你的 Redis 没有密码，删掉 `redis.passwordSecret` 块。如果旧部署本来就没接 Redis，在扩到单副本以上之前先加上；参见 [哪些场景需要 Redis](./redis_requirements.md)。暂时保持 `ingress.enabled: false`，流量到第 7 步才切换。

安装前先渲染并检查输出：

```bash
helm template litellm oci://ghcr.io/berriai/litellm/chart/litellm \
  --version 1.90.2 -f values.yaml | kubectl apply --dry-run=server -f -
```

## 5. 与旧部署并行安装

chart 创建的资源名（`litellm-gateway`、`litellm-backend`、`litellm-ui`、`litellm-gateway-config`）与 manifest 中的名称不冲突，因此两者可以共处同一命名空间。

```bash
helm upgrade --install litellm oci://ghcr.io/berriai/litellm/chart/litellm \
  --version 1.90.2 -f values.yaml --wait --timeout 10m
```

Helm 会在创建 Deployment 之前，以 pre-install hook 的形式运行迁移 Job。它执行的 Prisma 迁移与旧镜像启动时执行的相同，因此在结构已是最新的数据库上等于空操作。整个过程里，旧 pod 始终运行在同一个 schema 上。

```bash
kubectl get pods -l app.kubernetes.io/instance=litellm
kubectl logs job/litellm-migrations
```

如果该 Job 失败，修正数据库相关配置后重跑同一条 `helm upgrade` 命令即可；此时其他资源都还没有创建。

## 6. 验证新发布

在对外暴露之前，先通过各组件自己的 Service 逐一验证。

```bash
kubectl port-forward svc/litellm-gateway 4000:4000 &
kubectl port-forward svc/litellm-backend 4001:4001 &
kubectl port-forward svc/litellm-ui 3000:3000 &

curl -s localhost:4000/health/readiness
curl -s localhost:4000/v1/models -H "Authorization: Bearer $LITELLM_MASTER_KEY"
curl -s localhost:4000/v1/chat/completions -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"ping"}]}'
curl -s localhost:4001/key/info -H "Authorization: Bearer $LITELLM_MASTER_KEY"
curl -sI localhost:3000/ui/
```

readiness 响应应报告 `"cache": "redis"`，`/v1/models` 应返回与旧部署相同的模型列表。已有的虚拟密钥（virtual key）必须能在新网关上正常使用，这可以确认数据库与主密钥正是旧部署在用的那一套。

## 7. 切换流量

把 ingress 指向 chart。可以在与旧 ingress 相同的 host 上启用 chart 的 ingress，并在同一步删除旧 Ingress；如果你在 chart 之外自行管理 ingress，则按路径重新指向规则：`/v1/*`、`/chat/*`、`/health`、`/metrics` 及其他 LLM 路由指向 `litellm-gateway:4000`，`/ui`、`/_next`、`/litellm-asset-prefix` 和 `/` 指向 `litellm-ui:3000`，其余路径（`/key/*`、`/team/*`、`/user/*` 等）指向 `litellm-backend:4001`。完整的路径划分见 [`templates/ingress.yaml`](https://github.com/BerriAI/litellm/blob/main/helm/litellm/templates/ingress.yaml)。

```yaml title="values.yaml"
ingress:
  enabled: true
  className: alb            # or nginx
  controller: alb           # or nginx
  host: llm.example.com
  annotations: {}           # copy TLS and load balancer annotations from old-ingress.yaml
```

```bash
kubectl delete -f old-ingress.yaml
helm upgrade litellm oci://ghcr.io/berriai/litellm/chart/litellm \
  --version 1.90.2 -f values.yaml --wait
```

之前使用集群内 Service 名称（`litellm-service:4000`）的客户端，LLM 调用需改用 `litellm-gateway:4000`，管理调用需改用 `litellm-backend:4001`。

接下来观察几分钟网关的 HPA 和错误率：

```bash
kubectl get hpa litellm-gateway -w
kubectl logs deploy/litellm-gateway -f | grep -i error
```

## 8. 网关扩缩容

网关的 HPA 默认开启，以 CPU 和内存为目标，且只作用于网关本身；backend 有自己的 HPA，UI 则固定为单副本，除非设置了 `ui.hpa.enabled`。按负载需要调高 `gateway.hpa.maxReplicas` 或下限值，然后执行 `helm upgrade`。LLM 流量场景下，pod 往往在 CPU 饱和之前就因大量保持的连接先到瓶颈，此时可按 [按每个 Pod 的请求数与 Token 数扩缩](./deploy.md#按每-pod-请求数与-token-数扩缩) 的说明，增加每秒请求数或每秒 Token 数目标。

如果旧部署此前一直在崩溃重启，先查明原因再指望加副本：对旧 pod 执行 `kubectl describe pod`，看是 `OOMKilled`（调高 `gateway.resources.limits.memory`）、启动期间 liveness 探针失败（设置 `gateway.startupProbe`），还是 `kubectl logs --previous` 里的数据库或 Redis 连接错误。副本只会放大错误的配置，不会修复它。

## 9. 移除旧部署

等新发布平稳承载生产流量后，删除 manifest 对象。Secret 要保留，chart 仍在引用它。

```bash
kubectl delete -f old-deployment.yaml -f old-service.yaml
kubectl delete -f old-config.yaml
```

## 回滚

只要旧 Deployment 还存在，撤销第 7 步的 ingress 改动（执行 `kubectl apply -f old-ingress.yaml`，再执行 `helm upgrade ... --set ingress.enabled=false`），流量就会回到旧 pod。只要 chart 版本不比旧镜像新，迁移就不会改动数据库；如果你迁移到了更新的 chart，它执行的 schema 变更只能向前、不能回退，回滚目标镜像的版本至少要达到该 chart 对应的版本。要彻底移除 chart，执行 `helm uninstall litellm`，外部数据库、Redis 和你的 Secret 都会原样保留。
