import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Qohash 的 Qostodian Nexus

[Qohash](https://qohash.com/) 是零拷贝（zero-copy）数据安全领域的先行者，这一模式专为大型企业 PB 级非结构化数据的安全防护而生。企业里运行着几十个 AI 模型、copilot 助手和自主智能体，无一不在大量消费数据。Qostodian Nexus 是治理所有交互的统一控制层：它了解你的数据，也执行你的策略。从提示词检查到 LLM 输出数据治理它都能覆盖，用一个控制平面、一套一致的策略审查智能体、人工、SaaS 与 API 的全部交互。Nexus 依据确定性分类策略和 LLM-as-a-judge 检查扫描提示词与响应，并返回明确的处置决策（ALLOW、LOG、REDACT 或 BLOCK）。

:::info
Qostodian Nexus 暂未公开发售。如需申请访问权限，请访问 [qohash.com](https://qohash.com)。
:::

## 快速上手

### 1. 部署 Qostodian Nexus

以容器方式运行 Qostodian Nexus，并挂载你的策略配置：

```bash
docker run --rm \
  -p 8800:8800 \
  -v $(pwd)/nexus.yaml:/etc/nexus/config.yaml \
  qohash/nexus:latest
```

确认服务已就绪：

```bash
curl -i http://localhost:8800/health
# Expected: HTTP/1.1 200 OK
```

:::note
还有更多部署方式可选。详情请[联系 Qohash](https://qohash.com)。
:::

### 2. 配置 LiteLLM 代理（config.yaml）

**调用前**（pre-call）：在敏感数据到达模型之前将其拦截：

```yaml title="config.yaml (pre-call)"
guardrails:
  - guardrail_name: "qostodian-nexus-pre-call"
    litellm_params:
      guardrail: qostodian_nexus
      api_base: http://nexus:8800
      mode: "pre_call"
      default_on: true
```

**调用后**（post-call）：模型输出中的敏感数据在到达调用方之前予以脱敏或拦截：

```yaml title="config.yaml (post-call)"
guardrails:
  - guardrail_name: "qostodian-nexus-post-call"
    litellm_params:
      guardrail: qostodian_nexus
      api_base: http://nexus:8800
      mode: "post_call"
      default_on: true
```

### 3. 启动 LiteLLM 网关

```bash
litellm --config config.yaml
```

### 4. 测试请求

<Tabs>
<TabItem label="BLOCK" value="block">

发送一条包含信用卡号的提示词（会被 `BLOCK` 策略拦截）：

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "MASTERCARD 5555555555554444 03/2027 123"}
    ],
    "guardrails": ["qostodian-nexus-pre-call"]
  }'
```

预期结果：Qostodian Nexus 返回 `BLOCK` → LiteLLM 返回错误，不会向提供商（provider）发起任何请求。

</TabItem>
<TabItem label="REDACT" value="redact">

**调用前**（pre-call）：提示词送达模型之前，其中的敏感子串已被掩码：

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "My credit card is 5555555555554444, please summarize this."}
    ],
    "guardrails": ["qostodian-nexus-pre-call"]
  }'
```

预期结果：Qostodian Nexus 返回 `REDACT` → LiteLLM 将掩码后的提示词转发给提供商。响应头中包含 `x-qostodian-nexus-outcome-decision: REDACT`。

**调用后**（post-call）：模型响应中的敏感内容在送达调用方之前已被掩码：

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Return my credit card number: 5555555555554444."}
    ],
    "guardrails": ["qostodian-nexus-post-call"]
  }'
```

预期结果：Qostodian Nexus 返回 `REDACT` → LiteLLM 返回输出已被掩码的响应。

</TabItem>
<TabItem label="LOG" value="log">

发送一条包含低敏感度数据的提示词，触发 `LOG` 策略（请求继续执行）：

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "My employee ID is 123456 (test) and my phone is 555-0100"}
    ],
    "guardrails": ["qostodian-nexus-pre-call", "qostodian-nexus-post-call"]
  }'
```

预期结果：Qostodian Nexus 返回 `LOG` → LiteLLM 正常转发给提供商，响应带着决策头正常返回。

</TabItem>
<TabItem label="ALLOW" value="allow">

发送一条无害的常规提示词（未检测到敏感数据）：

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Summarize the main differences between TCP and UDP."}
    ],
    "guardrails": ["qostodian-nexus-pre-call", "qostodian-nexus-post-call"]
  }'
```

预期结果：Qostodian Nexus 返回 `ALLOW` → LiteLLM 正常转发给提供商。

</TabItem>
</Tabs>

## 处置决策

Qostodian Nexus 对每个请求返回一个决策：

| 决策 | 请求是否继续？ | 说明 |
|---|---|---|
| `ALLOW` | 是 | 未检测到违反策略的情况 |
| `LOG` | 是 | 记录违规；请求携带结果元数据继续执行 |
| `REDACT` | 是（已掩码） | 负载中的敏感子串在转发前被替换 |
| `BLOCK` | 否 | 请求失败；不发起提供商调用（pre-call 场景下） |

## 支持的参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `guardrail` | string | 必须为 `qostodian_nexus` |
| `api_base` | string | Qostodian Nexus 实例的 Base URL（如 `http://nexus:8800`） |
| `mode` | string | `pre_call`（扫描提示词）或 `post_call`（扫描模型输出） |
| `default_on` | boolean | 默认对所有请求应用此防护栏（guardrail） |

LiteLLM 调用 Qostodian Nexus 不需要 API 密钥。由于 Qostodian Nexus 的设计定位是部署在你自己的基础设施内，你必须通过网络控制手段保障其安全。

## 请求标识符

Qostodian Nexus 要求每个请求都携带关联标识符。这些标识符绝不用于访问内容，只承载元数据，用来把检测结果归因到正确的用户、会话和上下文。

通过请求头传递：

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -H "x-qostodian-nexus-identifiers-trace: trace-id" \
  -H "x-qostodian-nexus-identifiers-source: source-id" \
  -H "x-qostodian-nexus-identifiers-container: container-id" \
  -H "x-qostodian-nexus-identifiers-identity: identity@example.com" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "..."}
    ],
    "guardrails": ["qostodian-nexus-pre-call", "qostodian-nexus-post-call"]
  }'
```

| 标识符 | 说明 |
|---|---|
| `trace` | 请求或会话的唯一 ID，用于跨事件关联 |
| `source` | 发送请求的应用或集成（如应用 ID、服务名） |
| `container` | 会话或对话线程的上下文（如对话 ID） |
| `identity` | 终端用户身份（如邮箱或 UPN），用于用户级归因 |

这些字段在所有部署模式下都必填，其作用因运行模式而异：

### Qostodian 平台

[Qostodian](https://qohash.com/qostodian/) 是 Qohash 的数据安全态势管理（DSPM）平台，监控整个组织内的高风险非结构化数据，让你看清敏感数据的暴露情况、行为分析结果和治理工作流。当 Qostodian Nexus 以 connected 或 advanced 模式运行时，标识符会转发给 Qostodian，把 AI 检测结果与跨用户、跨会话、跨应用的更广泛数据安全活动关联起来。

| 模式 | 效果 |
|---|---|
| Basic standalone | 标识符出现在结构化日志输出中，便于追溯 |
| Basic connected | 连接到 Qostodian 平台，标识符用于展示和归因 |
| Advanced (platform) | 连接到 Qostodian 平台，标识符解锁完整 DSPM 能力：活动关联、行为画像和治理工作流 |

## 安全建议

Qostodian Nexus 在所有部署模式下都基于**零拷贝、数据主权式处理模型**运行：内容只在内存中分析，绝不持久化，也绝不传输给 Qohash。系统只上报元数据（检测结果、策略决策、标识符），提示词与响应内容始终留在你的基础设施之内。

- **使用 TLS**：生产环境中，LiteLLM 与 Qostodian Nexus 之间启用 TLS
- **认证调用**：使用 mTLS（推荐）或 bearer token
- **将 Qostodian Nexus 部署在客户可控的基础设施中**（本地部署或云租户），确保数据始终处于你的安全边界之内
