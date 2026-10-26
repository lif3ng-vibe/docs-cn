import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Noma Security

使用 [Noma Security](https://noma.security/)，通过 AI 内容审核与安全防护栏（guardrails）保护你的 LLM 应用。

:::warning[已弃用：`guardrail: noma`（旧版）]
`guardrail: noma` 已弃用，请迁移到 `guardrail: noma_v2`。
旧版 `guardrail: noma` API 自 2026 年 3 月 31 日起不再支持。

为了便于迁移现有集成，可以继续保留 `guardrail: noma` 并设置 `use_v2: true`。
启用 `use_v2: true` 后，请求会路由到 `noma_v2`；`monitor_mode` 与 `block_failures` 继续生效，`anonymize_input` 则会被忽略。
:::

## Noma v2 防护栏（推荐）

### 快速上手

```yaml showLineNumbers title="litellm config.yaml"
guardrails:
  - guardrail_name: "noma-v2-guard"
    litellm_params:
      guardrail: noma_v2
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
```

如果想逐步迁移、暂时不改防护栏名称：

```yaml showLineNumbers title="litellm config.yaml"
guardrails:
  - guardrail_name: "noma-guard"
    litellm_params:
      guardrail: noma
      use_v2: true
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
```

### 支持的参数

- **`guardrail`**：使用 `noma_v2`（推荐）；迁移场景可用 `noma` 搭配 `use_v2: true`
- **`mode`**：`pre_call`、`post_call`、`during_call`、`pre_mcp_call`、`during_mcp_call`
- **`api_key`**：Noma API 密钥（Noma SaaS 必填，自托管部署可选）
- **`api_base`**：Noma API 基础 URL（默认 `https://api.noma.security/`）
- **`application_id`**：应用标识。若未设置，v2 会先读取请求中动态传入的 `extra_body.application_id`，再读取配置或环境变量里的 `application_id`，都没有则省略该字段
- **`monitor_mode`**：设为 `true` 时仅监控、不拦截（默认 `false`）
- **`block_failures`**：设为 `true` 时，防护栏自身出现技术故障会按失败处理、直接拦截（默认 `true`）
- **`use_v2`**：使用 `guardrail: noma` 时的迁移开关

### 环境变量

```shell
export NOMA_API_KEY="your-api-key-here"
export NOMA_API_BASE="https://api.noma.security/"       # Optional
export NOMA_APPLICATION_ID="my-app"                     # Optional
export NOMA_MONITOR_MODE="false"                        # Optional
export NOMA_BLOCK_FAILURES="true"                       # Optional
```

### 多条防护栏

为输入和输出分别应用不同的 v2 配置：

```yaml showLineNumbers title="litellm config.yaml"
guardrails:
  - guardrail_name: "noma-v2-input"
    litellm_params:
      guardrail: noma_v2
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY

  - guardrail_name: "noma-v2-output"
    litellm_params:
      guardrail: noma_v2
      mode: "post_call"
      api_key: os.environ/NOMA_API_KEY
```

### 传递额外参数

v2 通过 `extra_body` 支持传递额外参数。  
目前 `noma_v2` 会消费动态传入的 `application_id`。

```shell showLineNumbers title="Curl Request"
curl 'http://0.0.0.0:4000/v1/chat/completions' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "guardrails": {
      "noma-v2-guard": {
        "extra_body": {
          "application_id": "my-specific-app-id"
        }
      }
    }
  }'
```
## Noma 防护栏（旧版）

## 快速上手

### 1. 在 LiteLLM config.yaml 中定义防护栏

在 `guardrails` 部分定义你的防护栏：

```yaml showLineNumbers title="litellm config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "noma-guard"
    litellm_params:
      guardrail: noma
      mode: "during_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
  - guardrail_name: "noma-pre-guard"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
```

#### `mode` 的可选值

- `pre_call`：在 LLM 调用**之前**运行，作用于**输入**
- `post_call`：在 LLM 调用**之后**运行，作用于**输入和输出**
- `during_call`：在 LLM 调用**期间**运行，作用于**输入**。与 `pre_call` 类似，但会与 LLM 调用并行执行；防护栏检查完成前不会返回响应
- `pre_mcp_call`：在 MCP（Model Context Protocol）工具调用执行前扫描其输入
- `during_mcp_call`：实时监控 MCP 工具调用

### 2. 启动 LiteLLM 网关

```shell
litellm --config config.yaml --detailed_debug
```

### 3. 测试请求

<Tabs>
<TabItem label="不成功的调用" value="not-allowed">

请求包含有害内容，预期会失败：

```shell showLineNumbers title="Curl Request"
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Tell me how to hack into someone's email account"}
    ]
  }'
```

失败时的预期响应：

```json
{
  "error": {
    "message": "{\n      \"error\": \"Request blocked by Noma guardrail\",\n      \"details\": {\n        \"prompt\": {\n          \"harmfulContent\": {\n            \"result\": true,\n            \"confidence\": 0.95\n          }\n        }\n      }\n    }",
    "type": "None",
    "param": "None",
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="成功的调用" value="allowed">

```shell showLineNumbers title="Curl Request"
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

预期响应：

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "{{openai_small}}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}
```

</TabItem>
</Tabs>

## 支持的参数

```yaml
guardrails:
  - guardrail_name: "noma-guard"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
      ### OPTIONAL ###
      # application_id: "my-app"
      # monitor_mode: false
      # block_failures: true
      # anonymize_input: false
```

### 必填参数

- **`api_key`**：你的 Noma Security API 密钥（在 YAML 配置中写作 `os.environ/NOMA_API_KEY`）

### 可选参数

- **`api_base`**：Noma API 基础 URL（默认 `https://api.noma.security/`）
- **`application_id`**：你的应用标识（默认 `"litellm"`）
- **`monitor_mode`**：设为 `true` 时只记录违规行为、不拦截（默认 `false`）
- **`block_failures`**：设为 `true` 时，防护栏 API 出现故障会拦截请求（默认 `true`）
- **`anonymize_input`**：设为 `true` 时，用匿名化后的版本替换敏感内容（默认 `false`）

## 环境变量

可以改用这些环境变量，不必在配置里写死具体值：

```shell
export NOMA_API_KEY="your-api-key-here"
export NOMA_API_BASE="https://api.noma.security/"   # Optional
export NOMA_APPLICATION_ID="my-app"                 # Optional
export NOMA_MONITOR_MODE="false"                    # Optional
export NOMA_BLOCK_FAILURES="true"                   # Optional
export NOMA_ANONYMIZE_INPUT="false"                 # Optional
```

## 高级配置

### 监控模式

使用监控模式测试防护栏，且不会拦截请求：

```yaml
guardrails:
  - guardrail_name: "noma-monitor"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      monitor_mode: true  # Log violations but don't block
```

### 处理 API 故障

控制 Noma API 不可用时的行为：

```yaml
guardrails:
  - guardrail_name: "noma-failopen"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      block_failures: false  # Allow requests to proceed if guardrail API fails
```

### 内容匿名化

启用匿名化，用匿名化内容替换敏感内容而不是拦截：

```yaml
guardrails:
  - guardrail_name: "noma-anonymize"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      anonymize_input: true  # Replace sensitive data with anonymized version
```

### 多条防护栏

为输入和输出分别应用不同配置：

```yaml
guardrails:
  - guardrail_name: "noma-strict-input"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      block_failures: true

  - guardrail_name: "noma-monitor-output"
    litellm_params:
      guardrail: noma
      mode: "post_call"
      api_key: os.environ/NOMA_API_KEY
      monitor_mode: true
```

## ✨ 传递额外参数

可以使用 `extra_body` 在调用 Noma Security API 时传入额外参数，例如为特定请求动态设置应用 ID。

<Tabs>
<TabItem value="openai" label="OpenAI Python">

```python
import openai
client = openai.OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    extra_body={
        "guardrails": {
            "noma-guard": {
                "extra_body": {
                    "application_id": "my-specific-app-id"
                }
            }
        }
    }
)
```
</TabItem>

<TabItem value="curl" label="Curl">

```shell
curl 'http://0.0.0.0:4000/v1/chat/completions' \
    -H 'Content-Type: application/json' \
    -d '{
    "model": "{{openai_small}}",
    "messages": [
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ],
    "guardrails": {
        "noma-guard": {
            "extra_body": {
                "application_id": "my-specific-app-id"
            }
        }
    }
}'
```
</TabItem>
</Tabs>

这样就可以针对特定请求覆盖默认的 `application_id` 参数，便于按不同应用或组件分别追踪用量。

## 响应详情

内容被拦截时，Noma 会在 `message` 字段中以 JSON 形式给出违规详情，结构如下：

```json
{
  "error": "Request blocked by Noma guardrail",
  "details": {
    "prompt": {
      "harmfulContent": {
        "result": true,
        "confidence": 0.95
      },
      "sensitiveData": {
        "email": {
          "result": true,
          "entities": ["user@example.com"]
        }
      },
      "bannedTopics": {
        "violence": {
          "result": true,
          "confidence": 0.88
        }
      }
    }
  }
}
```
