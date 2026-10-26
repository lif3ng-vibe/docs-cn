import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DynamoAI 防护栏

LiteLLM 支持 DynamoAI 防护栏（guardrails），用于对 LLM 的输入和输出进行内容审核与策略管控。

## 快速上手

### 1. 在 LiteLLM 的 config.yaml 中定义防护栏

在 `guardrails` 部分定义你的防护栏：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "dynamoai-guard"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY
```

#### `mode` 的可选值

- `pre_call` - 在 LLM 调用**之前**运行，作用于**输入**
- `post_call` - 在 LLM 调用**之后**运行，作用于**输出**
- `during_call` - 在 LLM 调用**期间**运行，作用于**输入**。与 `pre_call` 相同，但与 LLM 调用并行执行

### 2. 设置环境变量

```bash
export DYNAMOAI_API_KEY="your-api-key"
# Optional: Set policy IDs via environment variable (comma-separated)
export DYNAMOAI_POLICY_IDS="policy-id-1,policy-id-2,policy-id-3"
```

### 3. 启动 LiteLLM 网关

```shell
litellm --config config.yaml --detailed_debug
```

### 4. 测试请求

**[Langchain、OpenAI SDK 用法示例](/docs/proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="成功调用" value="allowed">

```shell showLineNumbers title="成功请求"
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "guardrails": ["dynamoai-guard"]
  }'
```

**响应：HTTP 200 成功**

内容通过所有策略检查，允许放行。

</TabItem>

<TabItem label="拦截调用" value="not-allowed">

```shell showLineNumbers title="被拦截的请求"
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "Content that violates policy"}
    ],
    "guardrails": ["dynamoai-guard"]
  }'
```

**被拦截时的预期响应：HTTP 500 错误**

防护栏在策略违规时抛出 `ValueError`，代理会将其作为 HTTP 500 返回

```json showLineNumbers
{
  "error": {
    "message": "Guardrail failed: 1 violation(s) detected\n\n- POLICY NAME:\n  Action: BLOCK\n  Method: TOXICITY\n  Description: Policy description\n  Policy ID: policy-id-123",
    "type": "internal_server_error",
    "param": null,
    "code": "500"
  }
}
```

</TabItem>
</Tabs>

## 高级配置

### 指定策略 ID

配置要应用的特定 DynamoAI 策略：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "dynamoai-policies"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY
      policy_ids:
        - "policy-id-1"
        - "policy-id-2"
        - "policy-id-3"
```

### 自定义 API 基地址

指定自定义的 DynamoAI API 端点：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "dynamoai-custom"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY
      api_base: "https://custom.dynamo.ai"
```

### 用于追踪的模型 ID

添加模型 ID，用于追踪和日志记录：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "dynamoai-tracked"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY
      model_id: "gpt-4-production"
```

### 输入与输出防护栏

为输入和输出分别配置防护栏：

```yaml showLineNumbers title="config.yaml"
guardrails:
  # Input guardrail
  - guardrail_name: "dynamoai-input"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY

  # Output guardrail
  - guardrail_name: "dynamoai-output"
    litellm_params:
      guardrail: dynamoai
      mode: "post_call"
      api_key: os.environ/DYNAMOAI_API_KEY
```

## 配置选项

| 参数 | 类型 | 说明 | 默认值 |
|-----------|------|-------------|---------|
| `api_key` | string | DynamoAI API 密钥（必填） | `DYNAMOAI_API_KEY` env var |
| `api_base` | string | DynamoAI API 基地址 | `https://api.dynamo.ai` |
| `policy_ids` | array | 要应用的 DynamoAI 策略 ID 列表（可选） | `DYNAMOAI_POLICY_IDS` env var (comma-separated) |
| `model_id` | string | 用于追踪/日志记录的模型 ID | `DYNAMOAI_MODEL_ID` env var |
| `mode` | string | 运行时机：`pre_call`、`post_call` 或 `during_call` | Required |

## 可观测性

DynamoAI 防护栏的日志包括：

- **guardrail_status**：`success`、`guardrail_intervened` 或 `guardrail_failed_to_respond`
- **guardrail_provider**：`dynamoai`
- **guardrail_json_response**：包含策略详情的完整 API 响应
- **duration**：防护栏检查耗时
- **start_time** 与 **end_time**：起止时间戳

这些日志可通过你已配置的 LiteLLM 日志回调获取。

## 错误处理

防护栏能够妥善处理错误：

- **API 故障**：记录错误并抛出异常，状态为 `guardrail_failed_to_respond`
- **策略违规**：抛出 `ValueError`，附带详细的违规信息
- **配置无效**：初始化时若缺少 API 密钥则抛出 `ValueError`

## 当前限制

- 目前仅支持 `BLOCK` 动作
- `WARN`、`REDACT` 和 `SANITIZE` 动作按成功处理（直接放行）

## 支持

更多 DynamoAI 相关信息：
- 官网：[https://dynamo.ai](https://dynamo.ai)
- 文档：API 文档请联系 DynamoAI 获取
