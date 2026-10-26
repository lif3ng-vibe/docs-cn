# 透传端点上的防护栏

import Image from '@theme/IdealImage';

## 概览

| 属性 | 说明 |
|----------|---------|
| 说明 | 在 LiteLLM 透传（pass-through）端点上执行防护栏（guardrails），支持显式启用，并自动继承组织、团队、密钥层级的配置 |
| 支持的防护栏 | 所有 LiteLLM 防护栏（Bedrock、Aporia、Lakera 等） |
| 默认行为 | 除非显式启用，否则透传端点上的防护栏处于**关闭**状态 |

## 快速上手

透传端点上的防护栏可以通过**管理界面（Admin UI）**（推荐）或**配置文件**两种方式配置。

### 使用管理界面

#### 1. 进入透传端点页面

进入 **Models + Endpoints**，点击 **+ Add Pass-Through Endpoint**

<Image img={require('../../img/pt_guard1.png')} alt="为透传端点添加防护栏" />

向下滚动到 **Guardrails** 区域，勾选要启用的防护栏。

:::tip[默认行为]
默认情况下无需指定字段，LiteLLM 会把整个请求/响应负载原样序列化为 JSON 后发给防护栏。
:::

#### 2. 定向检查特定字段（可选）

<Image img={require('../../img/pt_guard2.png')} alt="配置字段级定向" />

如果只想检查特定字段而不是整个负载：

1. 勾选你的防护栏
2. 在 **Field Targeting (Optional)** 中为每个防护栏指定要检查的字段
3. 使用快捷添加按钮（`+ query`、`+ documents[*]`），或直接输入自定义 JSONPath 表达式
4. **Request Fields (pre_call)**：发送到目标 API 之前要检查的字段
5. **Response Fields (post_call)**：目标 API 响应中要检查的字段

**示例**：在上面的截图中，我们把 `query` 设为请求字段，因此只有 `query` 字段会发给防护栏，而不是整个请求。

---

### 使用配置文件

#### 1. 定义防护栏与透传端点

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-guard"
    litellm_params:
      guardrail: bedrock
      mode: pre_call
      guardrailIdentifier: "your-guardrail-id"
      guardrailVersion: "1"

general_settings:
  pass_through_endpoints:
    - path: "/v1/rerank"
      target: "https://api.cohere.com/v1/rerank"
      headers:
        Authorization: "bearer os.environ/COHERE_API_KEY"
      guardrails:
        pii-guard:
```

#### 2. 启动代理

```bash
litellm --config config.yaml
```

#### 3. 测试请求

```bash
curl -X POST "http://localhost:4000/v1/rerank" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of France?",
    "documents": ["Paris is the capital of France."]
  }'
```

---

## 显式启用行为

| 配置 | 行为 |
|--------------|----------|
| 未设置 `guardrails` | 不执行任何防护栏（默认） |
| 设置了 `guardrails` | 执行组织、团队、密钥层级以及透传专用的所有防护栏 |

防护栏启用后，系统会收集并执行以下防护栏：

- 组织层级防护栏
- 团队层级防护栏
- 密钥层级防护栏
- 透传专用防护栏

---


## 工作原理

下图展示了客户端向 `/special/rerank` 发起请求时发生的事情；`/special/rerank` 是在 `config.yaml` 中配置了防护栏的透传端点。

透传端点上配置了防护栏时：
1. **调用前防护栏**（pre-call guardrails）会在请求转发到目标 API 之前对请求执行检查
2. 如果指定了 `request_fields`（例如 `["query"]`），就只把这些字段发给防护栏；否则会评估整个请求负载
3. 只有防护栏全部通过，请求才会转发到目标 API
4. **调用后防护栏**（post-call guardrails）会对目标 API 返回的响应执行检查
5. 如果指定了 `response_fields`（例如 `["results[*].text"]`），就只评估这些字段；否则检查整个响应

:::info
如果透传端点配置中省略了 `guardrails` 块或将其留空，请求会完全跳过防护栏流程，直接发往目标 API。
:::

```mermaid
sequenceDiagram
    participant Client
    box rgb(200, 220, 255) LiteLLM Proxy
        participant PassThrough as Pass-through Endpoint
        participant Guardrails
    end
    participant Target as Target API (Cohere, etc.)

    Client->>PassThrough: POST /special/rerank
    Note over PassThrough,Guardrails: Collect passthrough + org/team/key guardrails
    PassThrough->>Guardrails: Run pre_call (request_fields or full payload)
    Guardrails-->>PassThrough: ✓ Pass / ✗ Block
    PassThrough->>Target: Forward request
    Target-->>PassThrough: Response
    PassThrough->>Guardrails: Run post_call (response_fields or full payload)
    Guardrails-->>PassThrough: ✓ Pass / ✗ Block
    PassThrough-->>Client: Return response (or error)
```

---

## 字段级定向

检查特定的 JSON 字段，而不是整个请求/响应负载。

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-detection"
    litellm_params:
      guardrail: bedrock
      mode: pre_call
      guardrailIdentifier: "pii-guard-id"
      guardrailVersion: "1"

  - guardrail_name: "content-moderation"
    litellm_params:
      guardrail: bedrock
      mode: post_call
      guardrailIdentifier: "content-guard-id"
      guardrailVersion: "1"

general_settings:
  pass_through_endpoints:
    - path: "/v1/rerank"
      target: "https://api.cohere.com/v1/rerank"
      headers:
        Authorization: "bearer os.environ/COHERE_API_KEY"
      guardrails:
        pii-detection:
          request_fields: ["query", "documents[*].text"]
        content-moderation:
          response_fields: ["results[*].text"]
```

### 字段选项

| 字段 | 说明 |
|-------|-------------|
| `request_fields` | 输入（pre_call）对应的 JSONPath 表达式 |
| `response_fields` | 输出（post_call）对应的 JSONPath 表达式 |
| 两者都未指定 | 防护栏会检查整个负载 |

### JSONPath 示例

| 表达式 | 匹配内容 |
|------------|---------|
| `query` | 名为 `query` 的单个字段 |
| `documents[*].text` | `documents` 数组中的所有 `text` 字段 |
| `messages[*].content` | `messages` 数组中的所有 `content` 字段 |

---

## 配置示例

### 单个防护栏检查整个负载

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-detection"
    litellm_params:
      guardrail: bedrock
      mode: pre_call
      guardrailIdentifier: "your-id"
      guardrailVersion: "1"

general_settings:
  pass_through_endpoints:
    - path: "/v1/rerank"
      target: "https://api.cohere.com/v1/rerank"
      guardrails:
        pii-detection:
```

### 多个防护栏混合配置

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-detection"
    litellm_params:
      guardrail: bedrock
      mode: pre_call
      guardrailIdentifier: "pii-id"
      guardrailVersion: "1"

  - guardrail_name: "content-moderation"
    litellm_params:
      guardrail: bedrock
      mode: post_call
      guardrailIdentifier: "content-id"
      guardrailVersion: "1"

  - guardrail_name: "prompt-injection"
    litellm_params:
      guardrail: lakera
      mode: pre_call
      api_key: os.environ/LAKERA_API_KEY

general_settings:
  pass_through_endpoints:
    - path: "/v1/rerank"
      target: "https://api.cohere.com/v1/rerank"
      guardrails:
        pii-detection:
          request_fields: ["input", "query"]
        content-moderation:
        prompt-injection:
          request_fields: ["messages[*].content"]
```
