import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI 内容审核

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | 使用 OpenAI 内置的内容审核 API（Moderation API）检测并拦截有害内容，涵盖仇恨言论、骚扰、自残、色情与暴力。 |
| 提供商 | [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation) |
| 支持的操作 | `BLOCK`（检测到违规时抛出 HTTP 400 异常） |
| 支持的模式 | `pre_call`、`during_call`、`post_call` |
| 流式支持 | ✅ 完全支持流式响应 |
| API 要求 | OpenAI API 密钥 |

## 快速上手

### 1. 在 LiteLLM config.yaml 中定义防护栏

在 `guardrails` 配置段下定义你的防护栏（guardrails）：

<Tabs>
<TabItem value="config" label="Config.yaml">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "openai-moderation-pre"
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"
      api_key: os.environ/OPENAI_API_KEY  # Optional if already set globally
      model: "omni-moderation-latest"     # Optional, defaults to omni-moderation-latest
      api_base: "https://api.openai.com/v1"  # Optional, defaults to OpenAI API
```

#### `mode` 的可用取值

- `pre_call`：在 LLM 调用**之前**运行，检查**用户输入**
- `during_call`：在 LLM 调用**期间**运行，检查**用户输入**。与 `pre_call` 类似，但与 LLM 调用并行执行，在防护栏检查完成前不会返回响应。
- `post_call`：在 LLM 调用**之后**运行，检查 **LLM 响应**

#### 支持的 OpenAI 内容审核模型

- `omni-moderation-latest`（默认）：最新的多模态内容审核模型
- `text-moderation-latest`：最新的纯文本内容审核模型

</TabItem>

<TabItem value="env" label="环境变量">

设置你的 OpenAI API 密钥：

```bash title="Setup Environment Variables"
export OPENAI_API_KEY="your-openai-api-key"
```

</TabItem>
</Tabs>

### 2. 启动 LiteLLM 网关

```shell
litellm --config config.yaml --detailed_debug
```

### 3. 测试请求

<Tabs>
<TabItem label="被拦截的请求" value="blocked">

由于请求包含有害内容，预期这个请求会失败：

```shell
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "I hate all people and want to hurt them"}
    ],
    "guardrails": ["openai-moderation-pre"]
  }'
```

失败时预期返回的响应：

```json
{
  "error": {
    "message": {
      "error": "Violated OpenAI moderation policy",
      "moderation_result": {
        "violated_categories": ["hate", "violence"],
        "category_scores": {
          "hate": 0.95,
          "violence": 0.87,
          "harassment": 0.12,
          "self-harm": 0.01,
          "sexual": 0.02
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

<TabItem label="成功调用" value="allowed">

```shell
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "guardrails": ["openai-moderation-pre"]
  }'
```

预期返回的响应：

```json
{
  "id": "chatcmpl-4a1c1a4a-3e1d-4fa4-ae25-7ebe84c9a9a2",
  "created": 1741082354,
  "model": "{{openai_large}}",
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "The capital of France is Paris.",
        "role": "assistant"
      }
    }
  ],
  "usage": {
    "completion_tokens": 8,
    "prompt_tokens": 13,
    "total_tokens": 21
  }
}
```

</TabItem>
</Tabs>

## 高级配置

### 为输入和输出分别配置防护栏

你可以为用户输入和 LLM 响应分别配置独立的防护栏：

```yaml showLineNumbers title="Multiple Guardrails Config"
guardrails:
  - guardrail_name: "openai-moderation-input" 
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"
      api_key: os.environ/OPENAI_API_KEY
      
  - guardrail_name: "openai-moderation-output"
    litellm_params:
      guardrail: openai_moderation
      mode: "post_call" 
      api_key: os.environ/OPENAI_API_KEY
```

### 自定义 API 配置

配置自定义的 OpenAI API 端点，或改用其他审核模型：

```yaml showLineNumbers title="Custom API Config"
guardrails:
  - guardrail_name: "openai-moderation-custom"
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"
      api_key: os.environ/OPENAI_API_KEY
      api_base: "https://your-custom-openai-endpoint.com/v1"
      model: "text-moderation-latest"
```

## 流式支持

OpenAI 内容审核防护栏完全支持流式（streaming）响应。在 `post_call` 模式下，它会：

1. 收集所有流式分块
2. 拼装出完整响应
3. 对完整内容执行内容审核
4. 一旦检测到违规，拦截整个流
5. 内容安全时原样返回原始流

```yaml showLineNumbers title="Streaming Config"
guardrails:
  - guardrail_name: "openai-moderation-streaming"
    litellm_params:
      guardrail: openai_moderation
      mode: "post_call"  # Works with streaming responses
      api_key: os.environ/OPENAI_API_KEY
```

## 内容类别

OpenAI 内容审核 API 会检测以下几类有害内容：

| 类别 | 说明 |
|----------|-------------|
| `hate` | 基于种族、性别、民族、宗教、国籍、性取向、残障状况或种姓表达、煽动或宣扬仇恨的内容 |
| `harassment` | 骚扰、欺凌或恐吓个人的内容 |
| `self-harm` | 宣扬、鼓励或描绘自残行为的内容 |
| `sexual` | 旨在引起性兴奋或推广性服务的内容 |
| `violence` | 描绘死亡、暴力或身体伤害的内容 |

每个类别都会同时给出一个布尔标志和一个置信度分数（0.0 到 1.0）。

## 错误处理

当内容违反 OpenAI 内容审核政策时：

- **HTTP 状态码**：400 Bad Request
- **错误类型**：`HTTPException`
- **错误详情**：包含违规类别和置信度分数
- **处理行为**：请求会被立即拦截

## 最佳实践

### 1. 用户输入使用 Pre-call 检查

```yaml
guardrails:
  - guardrail_name: "input-moderation"
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"  # Block harmful user inputs early
```

### 2. LLM 响应使用 Post-call 检查

```yaml
guardrails:
  - guardrail_name: "output-moderation"
    litellm_params:
      guardrail: openai_moderation  
      mode: "post_call"  # Ensure LLM responses are safe
```

### 3. 与其他防护栏组合使用

```yaml
guardrails:
  - guardrail_name: "openai-moderation"
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"
      
  - guardrail_name: "custom-pii-detection"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
```

## 故障排查

### 常见问题

1. **API 密钥无效**：确保你的 OpenAI API 密钥已正确设置
   ```bash
   export OPENAI_API_KEY="sk-your-actual-key"
   ```

2. **速率限制**：OpenAI 内容审核 API 存在速率限制，高流量场景下请留意用量。

3. **网络问题**：检查与 OpenAI API 端点之间的网络连通性。

### 调试模式

开启详细日志来排查问题：

```shell
litellm --config config.yaml --detailed_debug
```

留意以 `OpenAI Moderation:` 开头的日志，即可追踪防护栏的执行情况。

## API 成本

OpenAI 内容审核 API 用于内容政策合规**完全免费**。与其他商业内容审核服务相比，这是性价比很高的防护栏选择。

## 需要帮助

如需更多支持：
- 查看 [OpenAI 内容审核 API 文档](https://platform.openai.com/docs/guides/moderation)
- 查阅 [LiteLLM 防护栏文档](./quick_start)
- 加入我们的 [Discord 社区](https://discord.gg/wuPM9dRgDw)
