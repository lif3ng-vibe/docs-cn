import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Anthropic Effort 参数

通过 `effort` 参数，你可以控制 Claude 在回答时消耗多少 Token，在回答的详尽程度与 Token 效率之间自由权衡。

## 概述

`effort` 参数让你控制 Claude 在响应请求时愿意花费多少 Token，只需一个模型就能在回答详尽程度与 Token 效率之间自由取舍。

**支持的模型**：
- **Claude 4.6**（Opus 4.6、Sonnet 4.6）：`output_config` 是稳定的 API 特性，无需 beta header。Opus 4.6 还支持 `effort="max"`。
- **Claude Opus 4.5**：需要 `effort-2025-11-24` beta header（由 LiteLLM 自动添加）。

LiteLLM 会自动为所有支持的模型把 `reasoning_effort` 映射为 `output_config={"effort": ...}`。

## Effort 的工作原理

默认情况下，Claude 以最高强度工作，为拿到最好的结果不惜用足 Token。调低 effort 级别后，你可以让 Claude 在 Token 消耗上更克制，优先换取速度与成本优势，代价是能力上略有折损。

**小贴士**：把 `effort` 设为 `"high"`，效果与完全不传 `effort` 参数完全一致。

effort 参数影响响应中的**所有 Token**，包括：
- 文本回答与解释说明
- 工具调用及其函数参数
- 扩展思考（extended thinking，如已启用）

这种做法有两大优势：
1. 无需开启思考模式也能使用。
2. 能覆盖包括工具调用在内的全部 Token 开销。比如 effort 调低后，Claude 发起的工具调用次数也会减少。

这样一来，你对效率的把控就细得多。

## Effort 级别

| 级别 | 说明 | 典型场景 |
|-------|-------------|------------------|
| `max` | 比 high 更进一步的极限能力，Claude 会动用更多 Token 换取最彻底的结果。**仅 Claude Opus 4.6 支持**。 | 最难的推理问题、复杂的多步骤研究 |
| `high` | 能力拉满，Claude 会用足所需的全部 Token 来争取最佳结果，等同于不设置该参数。 | 复杂推理、高难度编程问题、智能体任务 |
| `medium` | 平衡之选，Token 节省幅度适中。 | 需要在速度、成本与效果之间取得平衡的智能体任务 |
| `low` | 效率最高，Token 节省显著，能力上有一定折损。 | 追求极致速度与最低成本的简单任务，例如子智能体（subagent） |

## 快速上手

### 使用 LiteLLM SDK

<Tabs>
<TabItem value="python" label="Python">

```python keep-model-ids
import litellm

# Works with Claude 4.6 models (no beta header needed)
response = litellm.completion(
    model="anthropic/claude-sonnet-4-6",
    messages=[{
        "role": "user",
        "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    reasoning_effort="medium"  # Automatically mapped to output_config
)

print(response.choices[0].message.content)
```

```python keep-model-ids
# Also works with Claude Opus 4.5 (beta header auto-injected)
response = litellm.completion(
    model="anthropic/claude-opus-4-5-20251101",
    messages=[{
        "role": "user",
        "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    reasoning_effort="medium"
)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript keep-model-ids
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude 4.6 — output_config is a stable API feature (no beta header)
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  messages: [{
    role: "user",
    content: "Analyze the trade-offs between microservices and monolithic architectures"
  }],
  output_config: {
    effort: "medium"
  }
});

console.log(response.content[0].text);
```

</TabItem>
</Tabs>

### 使用 LiteLLM 代理

```bash keep-model-ids
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [{
      "role": "user",
      "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    "reasoning_effort": "medium"
  }'
```

### 直接调用 Anthropic API

<Tabs>
<TabItem value="46" label="Claude 4.6（稳定版）">

```bash keep-model-ids
# Claude 4.6 无需 beta header
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 4096,
    "messages": [{
      "role": "user",
      "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    "output_config": {
      "effort": "medium"
    }
  }'
```

</TabItem>
<TabItem value="45" label="Claude Opus 4.5（测试版）">

```bash keep-model-ids
# Claude Opus 4.5 需要 beta header
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "anthropic-beta: effort-2025-11-24" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-5-20251101",
    "max_tokens": 4096,
    "messages": [{
      "role": "user",
      "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    "output_config": {
      "effort": "medium"
    }
  }'
```

</TabItem>
</Tabs>

## 模型兼容性

effort 参数在以下模型上可用：
- **Claude Opus 4.6**（`claude-opus-4-6`）：支持 `high`、`medium`、`low` 与 `max`
- **Claude Sonnet 4.6**（`claude-sonnet-4-6`）：支持 `high`、`medium`、`low`
- **Claude Opus 4.5**（`claude-opus-4-5-20251101`）：支持 `high`、`medium`、`low`

:::info
`effort="max"` 仅在 Claude Opus 4.6 上可用，用于其他模型会触发校验错误。
:::

## 何时该调整 Effort 参数？

- 需要 Claude 拿出最佳水准时，用 **high effort**（默认值）：复杂推理、深入分析、高难度编程问题，或任何质量优先的任务。

- 想要表现扎实，又不想像 high effort 那样花足 Token，就选 **medium effort** 作为折中。

- 追求速度（Claude 回答所耗 Token 更少）或成本时，用 **low effort**：简单分类、快速查询，或质量提升有限、不值得为此多等或多花钱的海量场景。

## 工具调用中的 Effort

使用工具时，effort 参数既影响围绕工具调用的解释文字，也影响工具调用本身。effort 越低，Claude 越倾向于：
- 把多个操作合并进更少的工具调用
- 减少工具调用的次数
- 直接动手执行

带工具调用的示例：

```python keep-model-ids
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-6",
    messages=[{
        "role": "user",
        "content": "Check the weather in multiple cities"
    }],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }],
    reasoning_effort="low"  # Mapped to output_config — will make fewer tool calls
)
```

## Effort 与扩展思考

effort 参数可以与扩展思考配合使用。两者同时开启时，effort 控制所有响应类型共享的 Token 预算：

```python keep-model-ids
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-6",
    messages=[{
        "role": "user",
        "content": "Solve this complex problem"
    }],
    reasoning_effort="medium"  # Mapped to adaptive thinking + output_config for 4.6 models
)
```

## 最佳实践

1. 新任务先从**默认值**（high）起步，想优化成本再试着调低 effort 级别。

2. 生产环境的智能体工作流建议用 **medium effort**，在质量与效率之间取得平衡。

3. **low effort 留给量大而简单的任务**，比如分类、路由、数据抽取，这类场景速度比细腻的回答更重要。

4. **盯住 Token 用量**，弄清不同 effort 级别在你的具体场景里到底省了多少。

5. **用你自己的提示词实测**，因为 effort 级别的影响会随任务复杂度而变化。

## 提供商支持

effort 参数在所有兼容 Anthropic 的提供商上都可用：

- **标准 Anthropic API**：✅ 支持（Claude 4.6、Opus 4.5）
- **Azure Anthropic / Microsoft Foundry**：✅ 支持（Claude 4.6、Opus 4.5）
- **Amazon Bedrock**：✅ 支持（Claude 4.6、Opus 4.5）
- **Google Cloud Vertex AI**：✅ 支持（Claude 4.6、Opus 4.5）

LiteLLM 会自动处理：
- 参数映射：对所有支持的模型，把 `reasoning_effort` 映射为 `output_config={"effort": ...}`
- 注入 beta header（`effort-2025-11-24`），仅针对 Claude Opus 4.5（4.6 系列模型无需）

## 用量与定价

不同 effort 级别下的 Token 用量会照常记录在标准的 usage 对象里。effort 越低，输出 Token 越少，成本随之直接下降：

```python
response = litellm.completion(
    model="anthropic/{{anthropic_large}}",
    messages=[{"role": "user", "content": "Analyze this"}],
    output_config={"effort": "low"}
)

print(f"Output tokens: {response.usage.completion_tokens}")
print(f"Total tokens: {response.usage.total_tokens}")
```

## 故障排查

### 未添加 Beta header（Claude Opus 4.5）

只要请求带了 `reasoning_effort` 或 `output_config`，LiteLLM 就会自动为 Claude Opus 4.5 添加 `effort-2025-11-24` beta header。

**注意**：Claude 4.6 系列模型完全不需要 beta header，因为对它们来说 `output_config` 已是稳定的 API 特性。

如果 Opus 4.5 的请求里没看到这个 header，请依次检查：

1. 确认用上了 `reasoning_effort` 参数
2. 确认模型确实是 Claude Opus 4.5
3. 确认 LiteLLM 版本已支持该特性

### effort 取值无效错误

合法取值为 `"high"`、`"medium"`、`"low"` 和 `"max"`（max 仅 Opus 4.6 支持）。其他任何值都会触发校验错误：

```python keep-model-ids
# ❌ This will raise an error
output_config={"effort": "very_low"}

# ✅ Use one of the valid values
output_config={"effort": "low"}

# ❌ This will raise an error (max only works on Opus 4.6)
litellm.completion(model="anthropic/claude-sonnet-4-6", messages=messages, reasoning_effort="max")

# ✅ max is only for Opus 4.6
litellm.completion(model="anthropic/claude-opus-4-6", messages=messages, reasoning_effort="max")
```

### 模型不受支持

effort 参数受 Claude Opus 4.6、Sonnet 4.6 与 Opus 4.5 支持。用在其他模型上，该参数可能被忽略，也可能直接报错。

## 相关功能

- [扩展思考](/docs/reasoning_content)：控制 Claude 的推理过程
- [工具调用](/docs/providers/anthropic)：让 Claude 能够使用工具与函数
- [程序化工具调用](/docs/providers/anthropic_programmatic_tool_calling)：让 Claude 编写调用工具的代码
- [提示词缓存](/docs/completion/prompt_caching)：缓存提示词以降低成本

## 更多资源

- [Anthropic Effort 官方文档](https://docs.anthropic.com/en/docs/build-with-claude/effort)
- [LiteLLM Anthropic 提供商指南](/docs/providers/anthropic)
- [成本优化最佳实践](/docs/proxy/cost_tracking)
