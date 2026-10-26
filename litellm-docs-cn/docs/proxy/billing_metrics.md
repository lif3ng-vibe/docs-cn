import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 计费请求计量

LiteLLM 企业版的[定价基于用量](../enterprise#定价如何计算)，计费请求计量（billable request metering）负责上报这部分用量。代理会统计发往 LLM、MCP（Model Context Protocol）与 A2A（Agent-to-Agent）端点的成功请求，并把一个 OpenTelemetry 计数器推送到 LiteLLM 的收集器，认证方式是为你的部署签发的 mTLS 客户端证书。

发送的只有请求计数。提示词、响应、虚拟密钥（virtual key）和你的许可证密钥都不会离开部署环境。计量过程与你配置的任何 [OTEL 日志](../observability/opentelemetry_integration)彼此独立，也不会触碰你自己的指标管道。

:::info

你需要 `LITELLM_LICENSE`，以及在 LiteLLM 开通流程中发放的计量凭证（`client.crt` 和 `client.key`）。缺少任何一项？[联系我们](https://enterprise.litellm.ai/demo)。

:::

## 快速上手

### 1. 设置环境变量

| 变量 | 必填 | 说明 |
|----------|----------|-------------|
| `LITELLM_BILLING_METRICS_ENDPOINT` | 是 | 收集器 URL。使用 `https://telemetry.litellm.ai` |
| `LITELLM_BILLING_METRICS_CLIENT_CERT` | 是 | mTLS 客户端证书。文件路径或内联 PEM |
| `LITELLM_BILLING_METRICS_CLIENT_KEY` | 是 | 证书对应的私钥。文件路径或内联 PEM |
| `LITELLM_BILLING_METRICS_CA_CERT` | 否 | 收集器的 CA 证书包。访问 `telemetry.litellm.ai` 时无需设置 |
| `LITELLM_BILLING_METRICS_EXPORT_INTERVAL_MS` | 否 | 推送间隔（毫秒）。默认 `60000` |

```bash
export LITELLM_LICENSE="eyJ..."
export LITELLM_BILLING_METRICS_ENDPOINT="https://telemetry.litellm.ai"
export LITELLM_BILLING_METRICS_CLIENT_CERT="/etc/litellm/billing-mtls/client.crt"
export LITELLM_BILLING_METRICS_CLIENT_KEY="/etc/litellm/billing-mtls/client.key"
```

证书相关变量既接受文件路径，也接受 PEM 内容本身。当你的密钥存储以环境变量形式注入取值、无法挂载文件时（例如配合 AWS Secrets Manager 的 ECS，或配合 Secret Manager 的 Cloud Run），可以使用内联 PEM。

也可以在配置文件中设置这些变量：

```yaml
environment_variables:
  LITELLM_BILLING_METRICS_ENDPOINT: "https://telemetry.litellm.ai"
  LITELLM_BILLING_METRICS_CLIENT_CERT: "-----BEGIN CERTIFICATE-----\n..."
  LITELLM_BILLING_METRICS_CLIENT_KEY: "-----BEGIN PRIVATE KEY-----\n..."
```

### 2. 启动代理

```bash
litellm --config config.yaml
```

### 3. 验证

下面这行日志以 INFO 级别输出，因此只有当代理以 `LITELLM_LOG=INFO`（或 `--detailed_debug`）运行时才会显示。先通过代理发送一个请求，然后在日志中查找：

```
Enterprise billing metrics enabled: exporting to https://telemetry.litellm.ai every 60000 ms
```

如果看不到这行日志，请查找指明配置有误变量的警告信息。计量问题绝不会影响请求处理；一旦出现错误，导出器会被禁用，代理照常运行。

## 部署

<Tabs>
<TabItem value="helm" label="Helm">

[标准 chart](https://github.com/BerriAI/litellm/tree/main/helm/litellm-helm)和[微服务 chart](./deploy#使用-helm-部署)都带有 `billingMetrics` 配置块，默认处于关闭状态。

1. 用签发给你的证书创建一个 TLS Secret：

```bash
kubectl create secret tls litellm-billing-metrics-mtls --cert=client.crt --key=client.key
```

2. 在 values 中启用计量：

```yaml
billingMetrics:
  enabled: true
```

chart 默认查找名为 `litellm-billing-metrics-mtls` 的 Secret。

| 取值 | 默认值 | 说明 |
|-------|---------|-------------|
| `billingMetrics.enabled` | `false` | 启用计量 |
| `billingMetrics.endpoint` | `https://telemetry.litellm.ai` | 收集器 URL |
| `billingMetrics.secretName` | `litellm-billing-metrics-mtls` | 已有的 TLS Secret，需包含 `tls.crt` 和 `tls.key` |
| `billingMetrics.caSecretName` | `""` | 已有的 Secret，需包含 `ca.crt`。使用默认收集器时留空 |
| `billingMetrics.exportIntervalMs` | `""` | 推送间隔。代理默认值为 `60000` |

</TabItem>
<TabItem value="terraform" label="Terraform (AWS / GCP)">

[`terraform/litellm/aws`](https://github.com/BerriAI/litellm/tree/main/terraform/litellm/aws)（ECS Fargate）和 [`terraform/litellm/gcp`](https://github.com/BerriAI/litellm/tree/main/terraform/litellm/gcp)（Cloud Run）这两套参考架构在设置了 `billing_metrics_endpoint` 时会启用计量：

```hcl
billing_metrics_endpoint = "https://telemetry.litellm.ai"
```

```bash
export TF_VAR_billing_metrics_client_cert_pem="$(cat client.crt)"
export TF_VAR_billing_metrics_client_key_pem="$(cat client.key)"
```

这套架构会把证书和私钥存入 Secrets Manager（AWS）或 Secret Manager（GCP），并以环境变量的形式注入，无需挂载任何卷。

</TabItem>
<TabItem value="docker" label="Docker">

```bash
docker run \
  -e LITELLM_LICENSE="eyJ..." \
  -e LITELLM_BILLING_METRICS_ENDPOINT="https://telemetry.litellm.ai" \
  -e LITELLM_BILLING_METRICS_CLIENT_CERT="$(cat client.crt)" \
  -e LITELLM_BILLING_METRICS_CLIENT_KEY="$(cat client.key)" \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -p 4000:4000 \
  ghcr.io/berriai/litellm:main-stable \
  --config /app/config.yaml
```

</TabItem>
</Tabs>

## 哪些请求计入计费

请求只要在 LLM 推理端点（对话补全、嵌入、responses、图像、音频等推理路由）、MCP 传输通道或 A2A 的 `message/send` 路由上返回 2xx 状态码，就会被计入。GET 读取、管理端点、健康探测以及失败的请求不计入。

该计数与管理界面（Admin UI）用量页上的**成功请求数**一致。

## 常见问题

**这会影响代理性能吗**？默认配置下没有可感知的影响，单个请求的开销约为 1.6 微秒。

**收集器联系不上怎么办**？请求不受影响。计数器是累积式的，中断期间记录的计数会并入下一次成功导出。

**重启之后会怎样**？代理会在关闭时刷写计数器，因此不会丢失任何计数。

**物理隔离部署怎么办**？计量需要一条通往收集器的出站 HTTPS 连接。如果你的部署无法连通，请在开通阶段与我们沟通。
