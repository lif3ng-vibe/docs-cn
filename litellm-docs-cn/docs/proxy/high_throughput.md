# 每月处理 100T+ Token 的规模化方案

基准吞吐量：**每分钟 135 亿 Token**（TPM）。[查看测试结果](../benchmarks.md#high-throughput-profile-3000-rps-with-50k-to-100k-token-prompts)。

## 前提条件

- [LiteLLM 微服务 Helm chart](./deploy.md#使用-helm-部署) 需 `1.104.2` 或更高版本。
- 外部 PostgreSQL 与 Redis。
- Kubernetes 1.30+，以及用于 CPU 和内存自动扩缩容的 Metrics Server。
- Prometheus Operator，通过 ServiceMonitor 抓取每个 Pod 的指标。
- Prometheus Adapter，配合 [RPS 与 TPS 规则](./deploy.md#按每-pod-请求数与-token-数扩缩)实现按请求和 Token 的自动扩缩容。

## 配置网关

### 1. 配置 HPA

**用 RPS 和 TPS 目标跟随流量扩缩，同时保留 CPU 和内存目标来约束资源占用**。HPA（Horizontal Pod Autoscaler）会选取要求副本数最多的那个指标来扩缩。本示例为每个 Pod 设定每秒 83 个请求、625 万 Token 的目标。

```yaml
gateway:
  hpa:
    enabled: true # Default: true
    minReplicas: 2 # Default: 1
    maxReplicas: 200 # Default: 10
    targetRequestsPerSecond: "83" # Default: ""
    targetTokensPerSecond: "6.25M" # Default: ""
    targetCPUUtilizationPercentage: 60 # Default: 70
    targetMemoryUtilizationPercentage: 80 # Default: 80
    behavior: # Default: {}
      scaleUp:
        stabilizationWindowSeconds: 0
        policies:
          - type: Percent
            value: 100
            periodSeconds: 15
          - type: Pods
            value: 20
            periodSeconds: 15
      scaleDown:
        stabilizationWindowSeconds: 300
        policies:
          - type: Percent
            value: 25
            periodSeconds: 60
```

配置 [Prometheus Adapter 规则](./deploy.md#按每-pod-请求数与-token-数扩缩)，将这些指标暴露给 Kubernetes。Token 指标要等响应结束才会更新，因此对流式流量应同时设置请求和 Token 两类目标。

### 2. 设置工作进程与资源

每个 Pod 运行 4 个工作进程（worker）。申请 4 个 vCPU 和 16 GiB 内存，并将 CPU 上限设为 16 vCPU 以应对突发负载。

```yaml
gateway:
  numWorkers: 4 # Default: 1
  logLevel: ERROR # Default: INFO
  resources:
    requests:
      cpu: "4" # Default: "1"
      memory: 16Gi # Default: 4Gi
    limits:
      cpu: "16" # Default: "2"
      memory: 16Gi # Default: 4Gi
```

### 3. 共享数据库连接

启用 PgBouncer，让每个 Pod 内的工作进程和收集器共享 8 个 PostgreSQL 连接。连接池的大小应对照数据库连接上限和最大副本数来规划。

```yaml
database:
  connectionPool:
    enabled: true # Default: false
    maxDbConnections: 8 # Default: 20
    maxClientConn: 1000 # Default: 1000
```

### 4. 在 Sidecar 中运行指标与花费处理

启用指标服务器和花费收集器。在回调列表中加入 `prometheus`，并利用 Redis 缓冲花费更新、批量写入。

```yaml
gateway:
  metricsServer:
    enabled: true # Default: false
  serviceMonitor:
    enabled: true # Default: false
  collector:
    enabled: true # Default: false
  config:
    proxy_config: # Default: {}
      general_settings:
        proxy_batch_write_at: 60
        use_redis_transaction_buffer: true
      litellm_settings:
        callbacks:
          - prometheus
        json_logs: true
```

将 `gateway.serviceMonitor.labels` 设置为与你 Prometheus 实例的 ServiceMonitor 选择器相匹配。

### 5. 设置连接与关闭超时

在 `gateway.extraEnv` 中添加 `KEEPALIVE_TIMEOUT`，取值应高于负载均衡器的空闲超时。这套配置给每个请求 600 秒的处理时间，给关闭流程 620 秒，其中包括 10 秒的连接排空延迟。

```yaml
gateway:
  extraEnv: # Default: []
    - name: KEEPALIVE_TIMEOUT
      value: "75"
  config:
    proxy_config: # Default: {}
      litellm_settings:
        request_timeout: 600
  terminationGracePeriodSeconds: 620 # Default: "" (Kubernetes uses 30s)
  lifecycle: # Default: {}
    preStop:
      exec:
        command: ["sh", "-c", "sleep 10"]
  strategy: # Default: {}
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 25%
  startupProbe: # Default: {}
    httpGet: { path: /health/readiness, port: http }
    failureThreshold: 30
    periodSeconds: 10
  pdb:
    enabled: true # Default: false
    maxUnavailable: 10% # Default: ""
```
