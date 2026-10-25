# GLOSSARY — NVIDIA OpenShell 文档翻译术语表

术语首译附英文原词，如「沙箱（sandbox）」；之后全站只用中文。产品名/工具名/命令不译。
终检阶段按本表 grep 全站一致性，分歧取多数派并回写本表「终检补充」。

## 核心概念

| 英文 | 中文 |
|---|---|
| sandbox | 沙箱 |
| gateway | 网关 |
| policy | 策略 |
| provider | 提供商 |
| profile（provider profile） | 配置档案 |
| workspace | 工作区 |
| inference | 推理 |
| isolation | 隔离 |
| isolation backend | 隔离后端 |
| middleware | 中间件 |
| supervisor | 监管器 |
| supervisor middleware | 监管中间件 |
| interceptor | 拦截器 |
| driver | 驱动 |
| policy prover | 策略证明器 |
| policy advisor | 策略顾问 |
| default policy | 默认策略 |
| baseline paths | 基线路径 |
| template（sandbox template） | 模板 |
| runtime | 运行时 |
| extension | 扩展 |
| extension point | 扩展点 |
| fleet（of agents） | 编队 |
| workload | 工作负载 |
| binding | 绑定 |
| capability | 能力 |
| handshake | 握手 |
| verdict | 判定 |

## 安全与网络

| 英文 | 中文 |
|---|---|
| credential | 凭据 |
| secret | 机密 |
| token | 令牌 |
| principal | 主体 |
| audience（JWT） | 受众 |
| exfiltration（data exfiltration） | 外泄 |
| egress | 出站 |
| ingress（流量） | 入站 |
| Ingress（K8s 资源） | 不译（Ingress） |
| network rules | 网络规则 |
| allowlist | 允许列表 |
| deny / denied | 拒绝 |
| enforce | 强制 |
| read-only | 只读 |
| monitor | 监控 |
| escape（sandbox escape） | 逃逸 |
| hardening | 加固 |
| least privilege | 最小权限 |
| syscall | 系统调用 |
| mount | 挂载 |
| attestation | 证明 |
| signature | 签名 |
| provenance | 来源证明 |
| verify（image） | 校验 |
| threat | 威胁 |
| trust boundary | 信任边界 |

## 可观测性

| 英文 | 中文 |
|---|---|
| telemetry | 遥测 |
| trace | 追踪 |
| span | 不译（Span） |
| metrics | 指标 |
| logs / logging | 日志 |
| audit log | 审计日志 |
| collector（OpenTelemetry Collector） | 不译（Collector） |
| sink | 接收端 |
| export（OCSF JSON export） | 导出 |

## 通用动词/名词

| 英文 | 中文 |
|---|---|
| deploy / deployment | 部署 |
| configure / configuration | 配置 |
| provision | 预置 |
| launch | 启动 |
| attach（provider） | 挂接 |
| grant | 授予 |
| rotate（credentials） | 轮换 |
| upstream | 上游 |
| proxy | 代理 |
| request / response | 请求 / 响应 |
| payload | 载荷 |
| header | 头部（请求头/响应头按语境） |
| stream / streaming | 流 / 流式 |
| rate limit | 速率限制 |
| health check | 健康检查 |
| daemon | 守护进程 |
| host（机器） | 宿主机 |
| snapshot | 快照 |
| image | 镜像 |
| registry | 镜像仓库 |
| flag（CLI） | 参数 |
| environment variable | 环境变量 |

## 不译名单

OpenShell、NVIDIA、Fern、Agent（指产品类目时可用「智能体」，产品名如 Claude Code、Codex、Pi 不译）、Kubernetes、K8s、OpenShift、Helm、helm chart、OCI、Landlock、seccomp、gRPC、mTLS、SPIFFE、SPIRE、JWT、TLS、DNS、HTTP、WebSocket、TOML、YAML、JSON、OCSF、SigV4、SBOM、GPU、CI、Go、Rust、Python、TypeScript、Protobuf、OpenRouter、Microsoft Graph、GitHub、GHCR、Datadog、Splunk、CIM、kubectl、Podman、Docker、Proot、QEMU、libkrun、krun、katdecrypt（等专有技术名）、`openshell` CLI 子命令、环境变量名、配置键。

## 高频短语定式

| 英文 | 中文 |
|---|---|
| autonomous AI agents | 自主 AI 智能体 |
| fleets of autonomous AI agents | 自主 AI 智能体编队 |
| sandboxed environment(s) | 沙箱环境 |
| kernel-level isolation | 内核级隔离 |
| declarative policy/policies | 声明式策略 |
| default-deny | 默认拒绝 |
| built-in | 内置 |
| out of the box | 开箱即用 |
| fall back / fallback | 回退 |
| downgrade（Splunk CIM） | 降级 |
| walkthrough | 实操演练 |
| getting started | 入门 |

## 终检补充批次

（终检时把全站统一后的定稿回写到这里）
