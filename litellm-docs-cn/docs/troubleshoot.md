# 服务中断故障排查

当 LiteLLM 节点宕机时请使用本页：Pod 重启或被 OOMKilled、负载均衡把目标标记为不健康、整个部署的请求全部超时。我们排查过的中断大多可归结为三类：容量不足（每个 worker 的 CPU 或内存不够）、多个 worker 同时回收，或某个依赖（数据库、Redis、上游提供商）卡住事件循环。这些情况只有从部署侧才看得见，所以支持团队需要下列信息才能给出根因，而不是再回你一串追问。

提交工单前，请先收集齐下面清单里的全部内容。在你分享的每一个文件中，都要抹除 API 密钥、数据库密码和其他机密信息。

## 需要提交的材料

| 信息 | 为什么需要 | 如何收集 |
|-------------|----------------|-------------------|
| Kubernetes 事件 | 展示重启、`OOMKilled`、存活或就绪探针失败、驱逐与调度失败，并带时间戳 | `kubectl get events` 和 `kubectl describe pod`，见 [Kubernetes 事件](#kubernetes-事件) |
| `values.yaml` | 副本数、资源请求与上限、探针设置、自动伸缩、worker 数量，以及 Pod 实际运行时的环境变量 | `helm get values <release>`，见 [values.yaml](#valuesyaml) |
| `config.yaml` | 模型列表、路由器设置、缓存与数据库设置、回调，以及代理加载的通用设置 | 从运行中的 Pod 内读取，见 [config.yaml](#configyaml) |
| 节点类型 | Pod 所在机器的规格，便于我们与 Pod 的资源请求做对比 | `kubectl describe node`，见 [节点类型](#节点类型) |
| CPU | 每个 Pod 的 CPU 请求与上限，以及故障时段内的 CPU 使用量，可与[容量配置建议](./proxy/prod.md#机器规格)对照 | `kubectl top pod` 和你的指标仪表板，见 [CPU 与内存](#cpu-与内存) |
| 内存 | 每个 Pod 的内存请求与上限，以及故障时段内的内存使用量；Pod 被标记为 `OOMKilled` 就说明是内存问题，与日志怎么说无关 | `kubectl top pod` 和你的指标仪表板，见 [CPU 与内存](#cpu-与内存) |
| RPS | 部署宕机时每秒正在处理的请求数，以及正常基线，便于我们把 CPU 和内存数字放到负载背景下核对 | Prometheus 或负载均衡指标，见 [RPS](#rps) |

除上述内容外，还请附上 LiteLLM 版本（镜像标签，或 `GET /health/readiness/details` 返回的 `litellm_version`）、按 UTC 记录的故障时间线、你们侧观察到的"宕机"表现（负载均衡返回 5xx、探针失败、重启、超时）、所有副本是同时故障还是逐个故障、数据库与 Redis 当时是否健康，以及故障前几天内发生过的任何变更（版本升级、新增模型、流量上涨、修改过 `values.yaml` 或 `config.yaml`）。

## Kubernetes 事件

事件记录了 Kubernetes 对 Pod 做了什么以及为什么这么做，而且大约一小时后就会过期，因此请在故障发生后尽快收集。

```shell
kubectl get events -n <namespace> --sort-by=.lastTimestamp
kubectl describe pod -n <namespace> <pod-name>
```

请提交两条命令的完整输出。在 `describe` 输出中，`Last State`、`Reason`、`Exit Code` 和 `Restart Count` 字段能告诉我们容器是被 `OOMKilled`（退出码 137）、自行退出（`Error`），还是因探针失败被杀掉。底部的 `Events` 部分则展示探针失败以及镜像、调度或卷相关的问题。如果 Pod 已被替换，请对新 Pod 执行同样的命令，并附上前一个容器的日志：

```shell
kubectl logs -n <namespace> <pod-name> --previous
```

如果事件已经过期，或容器运行时已没有前一个容器的日志，请改为提交 Pod 的重启与终止历史，以及集群日志或监控系统中的 Pod 日志。

## values.yaml

请提交发布实际运行所用的 values，而不是仓库里的那份文件，两者往往会逐渐不一致。

```shell
helm get values <release-name> -n <namespace>
```

如果没有覆盖 `resources`、`replicaCount` 或探针设置，请加上 `--all` 以包含 chart 默认值；我们需要知道这些配置最终解析成什么。如果不用 Helm，而是用原始清单或 Kustomize 部署，请提交渲染后的 `Deployment`（`kubectl get deployment -n <namespace> <name> -o yaml`），如有 `HorizontalPodAutoscaler` 也一并提交。

## config.yaml

Helm chart 会把 `values.yaml` 中的 `proxy_config` 渲染成 ConfigMap，并挂载到 `/etc/litellm/config.yaml`。请从运行中的 Pod 里读取，这样我们看到的才是代理实际加载的配置，包括其中的环境变量替换结果：

```shell
kubectl exec -n <namespace> <pod-name> -- cat /etc/litellm/config.yaml
```

如果 Pod 在反复崩溃重启，`exec` 报 `container not found`，请改为读取 ConfigMap：

```shell
kubectl get configmap -n <namespace> <release-name>-config -o yaml
```

发送前请抹除 `api_key`、`database_url`、`master_key` 及其他任何机密信息。另外请附上影响容量的容器环境变量：`NUM_WORKERS`、`MAX_REQUESTS_BEFORE_RESTART`、`MAX_REQUESTS_BEFORE_RESTART_JITTER`、`DATABASE_CONNECTION_POOL_LIMIT`、`DATABASE_CONNECTION_TIMEOUT`、`REDIS_HOST` 和 `LITELLM_MODE`。

## 节点类型

节点类型指 LiteLLM Pod 所调度到的 Kubernetes 节点的实例规格或机型。云提供商会给每个节点打上这个标签，`describe node` 还会显示该节点已有多少资源被其他 Pod 占用：

```shell
kubectl get pod -n <namespace> <pod-name> -o wide
kubectl get node <node-name> -o jsonpath='{.metadata.labels.node\.kubernetes\.io/instance-type}{"\n"}'
kubectl describe node <node-name>
```

请提交实例类型（例如 `m6i.2xlarge` 或 `n2-standard-8`），以及 `describe node` 输出中的 `Capacity`、`Allocatable` 和 `Allocated resources` 部分。如果跑在裸金属或虚拟机上，请改为提交机器的 vCPU 数与内存。节点资源被超售时，即便 Pod 自身的限额看起来没问题，LiteLLM 也会被拖慢。

## CPU 与内存

这两项各自需要两个信息：Pod 被允许用多少（requests 和 limits），以及故障期间实际用了多少。

```shell
kubectl get pod -n <namespace> <pod-name> -o jsonpath='{range .spec.containers[*]}{.name}{"\t"}{.resources}{"\n"}{end}'
kubectl top pod -n <namespace>
```

`kubectl top` 需要集群里装有 metrics-server，且只显示当前用量，因此还请从 Prometheus、CloudWatch、Datadog 或你在用的其他工具导出每个 Pod 的 CPU 与内存图表或数据表，时间范围覆盖故障前一小时到恢复之后。在 Prometheus 中，按 Pod 过滤的 `container_cpu_usage_seconds_total` 和 `container_memory_working_set_bytes` 是正确的指标序列。请在数字旁边注明每个 Pod 的 worker 数量：[生产环境指南](./proxy/prod.md#机器规格)建议每个 worker 配 1 vCPU 和 4Gi 内存；一个 Pod 跑 4 个 worker 却只配 1 vCPU 和 4Gi，即使每个 worker 单看都配置正确，整体也是不足的。

## RPS

每秒请求数能告诉我们部署是在正常负载下还是在流量尖峰下倒下的。如果启用了 [Prometheus 指标](./proxy/prometheus.md)，请查询故障时段内的代理请求计数器：

```promql
sum(rate(litellm_proxy_total_requests_metric_total[1m]))
sum by (pod) (rate(litellm_proxy_total_requests_metric_total[1m]))
```

如果没有抓取 LiteLLM 指标，可以用它前面负载均衡器或 ingress 的请求数（例如 CloudWatch 中 ALB 的 `RequestCount` 指标）。请提交故障期间的峰值 RPS、故障前一小时的 RPS 和典型基线，同时附上承载这些流量的副本数，这样我们就能算出每个 Pod 和每个 worker 的 RPS。

## 不使用 Kubernetes 的部署

对于 Docker Compose 或虚拟机上的单容器部署，同样的信息从 Docker 和宿主机获取：

```shell
docker inspect <container-name> --format '{{.State.Status}} {{.State.OOMKilled}} {{.State.ExitCode}} {{.RestartCount}} {{.HostConfig.NanoCpus}} {{.HostConfig.Memory}}'
docker logs --since 1h <container-name>
docker stats --no-stream <container-name>
nproc && free -h
```

请提交 `docker-compose.yaml`（或 `docker run` 命令）代替 `values.yaml`、挂载进容器的 `config.yaml`、虚拟机的实例类型或 vCPU 数与内存，以及容器前面那个负载均衡器的 RPS。

## 支持团队首先排查什么

了解支持团队首先检查什么，你就能在等待回复期间自己先查一遍。Pod 容量不足是最常见的原因：请对照[机器规格](./proxy/prod.md#机器规格)检查 CPU 与内存上限以及 worker 数量。如果多个 Pod 几乎同时重启且没有 OOMKill，检查是否设置了 `MAX_REQUESTS_BEFORE_RESTART` 却没有配置[随机抖动（jitter）](./proxy/server_tuning.md#回收-worker)，这会让同时启动的 worker 又同时回收。如果进程仍在运行但就绪探针失败，请检查数据库：配置的数据库不可达时，`GET /health/readiness` 会返回 503，参见[健康检查端点](./proxy/health.md#探针端点)。如果请求超时而 CPU 一直不高，在日志里找 Redis 或数据库超时记录，并对照[生产环境配置](./proxy/prod.md)检查连接数上限和请求超时设置。

## 支持

请将收集到的信息通过 [Slack](https://www.litellm.ai/support)、[Discord](https://discord.gg/wuPM9dRgDw)，或发送邮件至 [ishaan@berri.ai](mailto:ishaan@berri.ai) 与 [krrish@berri.ai](mailto:krrish@berri.ai) 交给 LiteLLM 团队。如果你已有支持渠道，直接在那里发帖即可。
