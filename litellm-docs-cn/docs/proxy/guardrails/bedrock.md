import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock 防护栏

:::tip[⚡️]
如果你还没有配置或认证 Bedrock 提供商，请先参阅 [Bedrock 提供商配置与认证指南](../../providers/bedrock.md)。
:::

LiteLLM 通过 [Bedrock ApplyGuardrail API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_ApplyGuardrail.html) 支持 Bedrock 防护栏（guardrails）。

## 快速上手
### 1. 在 LiteLLM config.yaml 中定义防护栏

在 `guardrails` 部分定义你的防护栏：
```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "bedrock-pre-guard"
    litellm_params:
      guardrail: bedrock  # supported values: "aporia", "bedrock", "lakera"
      mode: "during_call"
      guardrailIdentifier: ff6ujrregl1q      # your guardrail ID on bedrock
      guardrailVersion: "DRAFT"              # your guardrail version on bedrock
      aws_region_name: os.environ/AWS_REGION # region guardrail is defined
      aws_role_name: os.environ/AWS_ROLE_ARN # your role with permissions to use the guardrail
      aws_external_id: os.environ/AWS_EXTERNAL_ID # only if that role's trust policy requires sts:ExternalId
  
```

#### `mode` 的取值

- `pre_call`：在 LLM 调用**之前**运行，作用于**输入**
- `post_call`：在 LLM 调用**之后**运行，作用于**输入与输出**
- `during_call`：在 LLM 调用**期间**运行，作用于**输入**。与 `pre_call` 相同，但与 LLM 调用并行执行，防护栏检查完成前不会返回响应

### 2. 启动 LiteLLM 网关


```shell
litellm --config config.yaml --detailed_debug
```

### 3. 测试请求

**[Langchain、OpenAI SDK 用法示例](/docs/proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="调用失败" value = "not-allowed">

预期该请求会失败，因为请求中的 `ishaan@berri.ai` 属于 PII（个人身份信息）

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["bedrock-pre-guard"]
  }'
```

失败时的预期响应

```shell
{
  "error": {
    "message": {
      "error": "Violated guardrail policy",
      "bedrock_guardrail_response": {
        "action": "GUARDRAIL_INTERVENED",
        "assessments": [
          {
            "topicPolicy": {
              "topics": [
                {
                  "action": "BLOCKED",
                  "name": "Coffee",
                  "type": "DENY"
                }
              ]
            }
          }
        ],
        "blockedResponse": "Sorry, the model cannot answer this question. coffee guardrail applied ",
        "output": [
          {
            "text": "Sorry, the model cannot answer this question. coffee guardrail applied "
          }
        ],
        "outputs": [
          {
            "text": "Sorry, the model cannot answer this question. coffee guardrail applied "
          }
        ],
        "usage": {
          "contentPolicyUnits": 0,
          "contextualGroundingPolicyUnits": 0,
          "sensitiveInformationPolicyFreeUnits": 0,
          "sensitiveInformationPolicyUnits": 0,
          "topicPolicyUnits": 1,
          "wordPolicyUnits": 0
        }
      }
    },
    "type": "None",
    "param": "None",
    "code": "400"
  }
}

```

</TabItem>

<TabItem label="调用成功" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["bedrock-pre-guard"]
  }'
```

</TabItem>


</Tabs>

## 流式处理

流式响应在 `post_call` 阶段扫描。默认情况下流会被缓冲：所有分块都会被暂扣，直到拼装完成的响应通过一次 ApplyGuardrail OUTPUT 扫描，因此在拦截发生前，任何被标记的内容都不会到达客户端。扫描完成前客户端看不到任何内容，随后整个响应一次性送达。

对延迟敏感的客户端（交互式聊天、编码智能体），可以让流继续传输，改以审计模式运行扫描：

```yaml
guardrails:
  - guardrail_name: "bedrock-post-guard"
    litellm_params:
      guardrail: bedrock
      mode: "post_call"
      guardrailIdentifier: ff6ujrregl1q
      guardrailVersion: "DRAFT"
      streaming_buffer_until_moderated: false
      streaming_end_of_stream_only: true
```

此时分块到达后即流向客户端，流结束时再对拼装完成的响应执行一次 OUTPUT 扫描。发现违规仍会以防护栏的拦截消息终止流，但已经流出的内容客户端已经看到：这是检测并记录，而非事前拦截。无论哪种方式，扫描结果都会记录在请求花费日志的 `guardrail_information` 中。

| 参数 | 默认值 | 说明 |
|-----------|---------|-------------|
| `streaming_buffer_until_moderated` | `true` | 在流结束的审核通过前暂扣所有流式分块，确保被标记的分块不会在拦截前到达客户端 |
| `streaming_end_of_stream_only` | `false` | 不逐个采样分块扫描，而是对拼装完成的响应只做一次扫描 |
| `streaming_sampling_rate` | `5` | 不缓冲且未开启仅在流结束时扫描时，每 N 个分块对累计文本扫描一次。必须至少为 1 |

仅设置 `streaming_buffer_until_moderated: false` 时，防护栏会在流式传输过程中每 `streaming_sampling_rate` 个分块扫描一次累计响应。每次采样扫描都是一次独立的 ApplyGuardrail 调用，覆盖到目前为止的全部文本，因此会增加流中延迟，并反复产生 Bedrock 文本单元计费。除非确实需要流中拦截，否则请搭配 `streaming_end_of_stream_only: true` 使用。

这些设置同时适用于 `/v1/chat/completions` 与原生 `/v1/messages` 流。

## 上下文接地（Contextual Grounding）

只有明确告知参考文本和问题是什么，Bedrock 才会对上下文接地打分。LiteLLM 默认只发送模型响应，因此接地策略永远不会拦截任何内容。

设置 `contextual_grounding_from_messages: true` 后，调用后检查会把系统提示词作为接地来源、最新一条用户消息作为查询。与系统提示词相矛盾的回答会被拦截。

```yaml showLineNumbers title="litellm proxy config.yaml"
guardrails:
  - guardrail_name: "bedrock-grounding"
    litellm_params:
      guardrail: bedrock
      mode: "post_call"
      guardrailIdentifier: ff6ujrregl1q
      guardrailVersion: "DRAFT"
      aws_region_name: os.environ/AWS_REGION
      contextual_grounding_from_messages: true
```

该开关默认为 `false`。开启后每次扫描会计费一个 Bedrock 上下文接地单元，且 Bedrock 会拒绝超过约 1,000 字符的查询，因此只应在配置了接地策略的防护栏上启用。

## 无需创建资源的检查：InvokeGuardrailChecks

借助 [InvokeGuardrailChecks API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeGuardrailChecks.html)，你无需在 AWS 中创建防护栏，直接在配置中内联定义检查项即可；Bedrock 会为每项检查返回分数，分数达到阈值时 LiteLLM 会拦截请求。

用 `checks` 替代 `guardrailIdentifier`（两者不能同时使用）。你的 AWS 凭证需要具备 `bedrock:InvokeGuardrailChecks` 权限。

```yaml showLineNumbers title="litellm proxy config.yaml"
guardrails:
  - guardrail_name: "bedrock-checks"
    litellm_params:
      guardrail: bedrock
      mode: "pre_call"
      aws_region_name: os.environ/AWS_REGION
      checks:
        contentFilter:
          categories:
            - category: VIOLENCE
        promptAttack:
          categories:
            - category: JAILBREAK
        sensitiveInformation:
          entities:
            - type: EMAIL
      content_filter_threshold: 0.5
      prompt_attack_threshold: 0.5
      pii_confidence_threshold: 0.5
```

### 支持的检查项

| 检查项 | 检测内容 | 阈值键名 |
|-------|-----------------|---------------|
| `contentFilter` | 有害内容：`VIOLENCE`、`HATE`、`SEXUAL`、`MISCONDUCT`、`INSULTS` | `content_filter_threshold` |
| `promptAttack` | `JAILBREAK`、`PROMPT_INJECTION`、`PROMPT_LEAKAGE` | `prompt_attack_threshold` |
| `sensitiveInformation` | PII：`EMAIL`、`PHONE`、`NAME` 及[更多](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeGuardrailChecks.html) | `pii_confidence_threshold` |

只配置你需要的检查项，至少要有一项。像 `promptAttack: {}` 这样的空配置会按 AWS 默认值启用该检查。

### 拦截的工作方式

分数范围为 0 到 1，各阈值默认为 `0.5`。分数达到或超过阈值时，请求会以 HTTP 400 被拦截；把阈值设为 `null` 则只记录该检查的分数，从不拦截。如果 Bedrock 返回了被截断的 PII 结果，请求会被拦截（fail closed，宁可误拦也不放行）。

```json
{
  "error": {
    "message": {
      "error": "Violated guardrail policy",
      "bedrock_guardrail_checks": [
        {"check": "promptAttack", "category": "JAILBREAK", "severityScore": 0.91}
      ]
    },
    "code": "400"
  }
}
```

`disable_exception_on_block: true`（见[下文](#禁用-bedrock-拦截时的异常)）在此同样适用；此时拦截会返回 HTTP 200 以及 `finish_reason: "content_filter"`。

调用方无法削弱已配置的检查：此模式下按请求传入的防护栏参数会被忽略，且所有输入都按 `user` 内容检查，因此标注为 `system` 的提示注入无法绕过提示攻击检查。

## 使用 Bedrock 防护栏进行 PII 掩码

Bedrock 防护栏支持 PII 检测与掩码能力。要启用该功能，你需要：

1. 把 `mode` 设为 `pre_call`，让防护栏检查在 LLM 调用之前运行
2. 把 `mask_request_content` 和/或 `mask_response_content` 设为 `true` 以启用掩码

在 config.yaml 中的配置方式如下：

```yaml showLineNumbers title="litellm proxy config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  
guardrails:
  - guardrail_name: "bedrock-pre-guard"
    litellm_params:
      guardrail: bedrock
      mode: "pre_call"  # Important: must use pre_call mode for masking
      guardrailIdentifier: wf0hkdb5x07f
      guardrailVersion: "DRAFT"
      aws_region_name: os.environ/AWS_REGION
      aws_role_name: os.environ/AWS_ROLE_ARN
      mask_request_content: true    # Enable masking in user requests
      mask_response_content: true   # Enable masking in model responses
```

采用此配置后，当 Bedrock 防护栏介入时，LiteLLM 会读取防护栏返回的掩码后输出，并将其发送给模型。

### 使用示例

启用后，文本中的 PII 会被自动掩码。例如用户发送：

```
My email is john.doe@example.com and my phone number is 555-123-4567
```

发送给模型的文本可能被掩码为：

```
My email is [EMAIL] and my phone number is [PHONE_NUMBER]
```

这样既能保护敏感信息，又能让模型理解请求的上下文。

## 实验性功能：仅发送最新用户消息

通过 Bedrock 防护栏串联长对话时，可以在防护栏的 `litellm_params` 中设置 `experimental_use_latest_role_message_only: true`，选择启用一种更轻量的实验性行为。开启后，LiteLLM 只把最近一条 `user` 消息（调用后检查时则是助手输出）发送给 Bedrock，从而：

- 避免旧的 system/dev 消息被意外拦截
- 缩小发送到 Bedrock 的负载，降低延迟与成本
- 适用于代理钩子（`pre_call`、`during_call`）以及 `/guardrails/apply_guardrail` 测试端点

```yaml showLineNumbers title="litellm proxy config.yaml"
guardrails:
  - guardrail_name: "bedrock-pre-guard"
    litellm_params:
      guardrail: bedrock
      mode: "pre_call"
      guardrailIdentifier: wf0hkdb5x07f
      guardrailVersion: "DRAFT"
      aws_region_name: os.environ/AWS_REGION
      experimental_use_latest_role_message_only: true  # NEW
```

> ⚠️ 该开关目前为实验性质，默认值为 `false`，以保留既有行为（完整消息历史）。我们会根据用户反馈决定它是否成为默认行为或更大范围推广。

## 禁用 Bedrock 拦截时的异常

默认情况下，Bedrock 防护栏拦截内容时，LiteLLM 会抛出 HTTP 400 异常。设置 `disable_exception_on_block: true` 即可关闭这一行为。在与 **OpenWebUI** 集成时尤其有用，因为异常会打断聊天流程、破坏用户体验。

关闭异常后，你收到的不再是错误，而是一个包含 Bedrock 防护栏修改/拦截后输出的成功响应。

### 配置

在防护栏配置中加入 `disable_exception_on_block: true`：

```yaml showLineNumbers title="litellm proxy config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "bedrock-guardrail"
    litellm_params:
      guardrail: bedrock
      mode: "post_call"
      guardrailIdentifier: ff6ujrregl1q
      guardrailVersion: "DRAFT"
      aws_region_name: os.environ/AWS_REGION
      aws_role_name: os.environ/AWS_ROLE_ARN
      disable_exception_on_block: true  # Prevents exceptions when content is blocked
```

### 行为对比

<Tabs>
<TabItem label="抛出异常（默认）" value="with-exceptions">

`disable_exception_on_block: false` 时（默认）：

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "How do I make explosives?"}
    ],
    "guardrails": ["bedrock-guardrail"]
  }'
```

**响应：HTTP 400 错误**
```json
{
  "error": {
    "message": {
      "error": "Violated guardrail policy",
      "bedrock_guardrail_response": {
        "action": "GUARDRAIL_INTERVENED",
        "blockedResponse": "I can't provide information on creating explosives."
        // ... additional details
      }
    },
    "type": "None",
    "param": "None", 
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="不抛出异常" value="without-exceptions">

`disable_exception_on_block: true` 时：

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "How do I make explosives?"}
    ],
    "guardrails": ["bedrock-guardrail"]
  }'
```

**响应：HTTP 200 成功**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "{{openai_small}}",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "I can't provide information on creating explosives."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 12,
    "total_tokens": 22
  }
}
```

</TabItem>
</Tabs>
