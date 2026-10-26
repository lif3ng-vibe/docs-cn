import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# EnkryptAI 防护栏

LiteLLM 支持接入 EnkryptAI 防护栏（guardrails），对 LLM 的输入和输出做内容审核与安全检查。

## 快速上手

### 1. 在 LiteLLM config.yaml 中定义防护栏

在 `guardrails` 配置段下定义防护栏：

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "enkryptai-guard"
    litellm_params:
      guardrail: enkryptai
      mode: "pre_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      policy_name: "my-policy"  # EnkryptAI policy that defines which detectors run
```

#### `mode` 的可选值

- `pre_call` - 在 **LLM 调用之前**运行，作用于**输入**
- `post_call` - 在 **LLM 调用之后**运行，作用于**输出**
- `during_call` - 在 **LLM 调用期间**运行，作用于**输入**。与 `pre_call` 相同，但会与 LLM 调用并行执行

#### 可用的检测器

检测器在 `policy_name` 引用的 EnkryptAI 策略中配置，而不是在 LiteLLM 配置里。LiteLLM 只发送文本和 `x-enkrypt-policy` 请求头，所以在 `litellm_params` 下写 `detectors:` 块不会生效。EnkryptAI 策略支持以下检测类型：

- **toxicity** - 检测毒性语言
- **nsfw** - 检测 NSFW（Not Safe For Work）内容
- **pii** - 检测个人身份信息（PII）
  - 策略中可配置的实体：`["pii", "email", "phone", "secrets", "ip_address", "url"]`
- **injection_attack** - 检测提示注入（prompt injection）企图
- **keyword_detector** - 检测自定义关键词/短语
- **policy_violation** - 检测违反策略的行为
- **bias** - 检测带偏见的内容
- **sponge_attack** - 检测 sponge 攻击

### 2. 设置环境变量

```bash
export ENKRYPTAI_API_KEY="your-api-key"
```

### 3. 启动 LiteLLM 网关

```shell
litellm --config config.yaml --detailed_debug
```

### 4. 测试请求

**[Langchain、OpenAI SDK 使用示例](/docs/proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="调用成功" value="allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Hello, how can you help me today?"}
    ],
    "guardrails": ["enkryptai-guard"]
  }'
```

**响应：HTTP 200 成功**

内容通过所有检测器检查，请求被放行。

</TabItem>

<TabItem label="调用失败" value="not-allowed">

如果内容违反检测策略，预期请求会失败：

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "My email is test@example.com and my SSN is 123-45-6789"}
    ],
    "guardrails": ["enkryptai-guard"]
  }'
```

**失败时的预期响应：HTTP 500 错误**

`message` 是一个普通字符串，逐条列出各项违规，具体细节来自 EnkryptAI 的响应。

```json
{
  "error": {
    "message": "Guardrail failed: 1 violation(s) detected\n\n- PII:\n  PII Detected: {'email': ['test@example.com']}",
    "type": "internal_server_error",
    "param": null,
    "code": "500"
  }
}
```

</TabItem>
</Tabs>

## 视频演示

<iframe width="840" height="500" src="https://www.loom.com/embed/ff222211e0864937aee4aeef0f28c3b7" frameBorder="0" allowFullScreen></iframe>

## 高级配置

### 使用自定义策略

你可以指定自定义的 EnkryptAI 策略：

```yaml
guardrails:
  - guardrail_name: "enkryptai-custom"
    litellm_params:
      guardrail: enkryptai
      mode: "pre_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      policy_name: "my-custom-policy"  # Sent via x-enkrypt-policy header
```

检测行为完全由 `policy_name` 引用的策略控制；LiteLLM 只把文本和这个请求头发给 EnkryptAI，所以各检测器的具体设置必须在 EnkryptAI 策略本身里配置。只要检出违规，请求就会被拦截。

### 输入与输出防护栏

为输入和输出分别配置防护栏：

```yaml
guardrails:
  # Input guardrail
  - guardrail_name: "enkryptai-input"
    litellm_params:
      guardrail: enkryptai
      mode: "pre_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      policy_name: "my-input-policy"

  # Output guardrail
  - guardrail_name: "enkryptai-output"
    litellm_params:
      guardrail: enkryptai
      mode: "post_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      policy_name: "my-output-policy"
```

## 配置选项

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `api_key` | string | EnkryptAI API 密钥 | `ENKRYPTAI_API_KEY` env var |
| `api_base` | string | EnkryptAI API 基础 URL | `https://api.enkryptai.com` |
| `policy_name` | string | 自定义策略名称（通过 `x-enkrypt-policy` 请求头发送） | None |
| `mode` | string | 运行时机：`pre_call`、`post_call` 或 `during_call` | Required |

## 可观测性

EnkryptAI 防护栏的日志包含以下字段：

- **guardrail_status**：`success`、`guardrail_intervened` 或 `guardrail_failed_to_respond`
- **guardrail_provider**：`enkryptai`
- **guardrail_json_response**：完整的 API 响应，含检测详情
- **duration**：防护栏检查耗时
- **start_time** 与 **end_time**：起止时间戳

这些日志可通过你已配置的 LiteLLM 日志回调获取。

## 错误处理

防护栏对错误做了妥善处理：

- **API 故障**：记录错误并抛出异常
- **速率限制**（429）：记录错误并抛出异常
- **配置无效**：初始化时抛出 `ValueError`
- **检出违规**：抛出异常并拦截请求

## 支持

了解更多 EnkryptAI 相关信息：
- 文档：[https://docs.enkryptai.com](https://docs.enkryptai.com)
- 官网：[https://enkryptai.com](https://enkryptai.com)
