# v1/messages → /responses 参数映射

当你向 `/v1/messages` 发送请求、目标是 OpenAI 或 Azure 模型时，LiteLLM 会在内部经由 OpenAI Responses API 完成路由。本页逐项记录了每个参数在两个方向上的转换规则。

转换逻辑位于 `litellm/llms/anthropic/experimental_pass_through/responses_adapters/transformation.py`。


## 请求：Anthropic → Responses API

### 顶层参数

| Anthropic（`/v1/messages`） | Responses API | 说明 |
|---|---|---|
| `model` | `model` | 原样透传 |
| `messages` | `input` | 结构上做了转换，参见下文 messages 部分 |
| `system`（字符串） | `instructions` | 以普通字符串形式传入 |
| `system`（内容块列表） | `instructions` | 文本块用 `\n` 拼接；非文本块会被忽略 |
| `max_tokens` | `max_output_tokens` | 重命名 |
| `temperature` | `temperature` | 原样透传 |
| `top_p` | `top_p` | 原样透传 |
| `tools` | `tools` | 格式做了转换，参见下文 tools 部分 |
| `tool_choice` | `tool_choice` | 类型做了重映射，参见下文 tool_choice 部分 |
| `thinking` | `reasoning` | `budget_tokens` 映射为 effort 等级，参见下文 thinking 部分 |
| `output_format` 或 `output_config.format` | `text` | 包装为 `{"format": {"type": "json_schema", "name": "structured_output", "schema": ..., "strict": ...}}`。`strict` 从请求的 `strict` 标志复制而来，默认为 `false`，因此带可选属性的 schema 也能透传；设为 `strict: true` 可选择启用 OpenAI 严格模式，该模式要求每个属性都列入 `required` |
| `context_management` | `context_management` | 从 Anthropic 的字典格式转换为 OpenAI 的数组格式，参见下文 context_management 部分 |
| `metadata.user_id` | `user` | 从 metadata 对象中提取，并截断到 64 个字符 |
| `metadata.user_id` | `prompt_cache_key` | 同一个值，截断到 64 个字符（OpenAI 的键长度上限），让同一用户的请求持续命中同一个提示词缓存（prompt cache）。`user_id` 为空或 null 时不设置；若请求体中显式带了 `prompt_cache_key`，则以请求体里的为准 |
| `stop_sequences` | ❌ 不映射 | 静默丢弃 |
| `top_k` | ❌ 不映射 | 静默丢弃 |
| `speed` | ❌ 不映射 | 仅用于在原生路径上设置 Anthropic beta 请求头 |

对话补全路径（`litellm_settings.use_chat_completions_url_for_anthropic_messages: true`，以及所有非 OpenAI 提供商）同样会从 `metadata.user_id` 派生这两个参数，但有两点差异：`user` 不做截断直接透传；`prompt_cache_key` 只在目标提供商支持的参数列表包含它时才设置。OpenAI、Azure OpenAI 及其他 OpenAI 兼容的提供商支持；Gemini、Vertex AI、Bedrock 和 Anthropic 不支持。`litellm_proxy/` 部署（一个 LiteLLM 代理架在另一个代理前面）永远不会拿到派生的键，因为下游代理的真实提供商未知，除非下游设置了 `drop_params`，否则会拒绝该参数。


### messages 如何转换

每条 Anthropic 消息都会展开为一个或多个 Responses API input 项。关键区别在于，`tool_result` 和 `tool_use` 块会成为 input 数组中的**顶层项**，而不是嵌在消息内部。

| Anthropic 消息 | Responses API input 项 |
|---|---|
| `user` 角色，字符串内容 | `{"type": "message", "role": "user", "content": [{"type": "input_text", "text": "..."}]}` |
| `user` 角色，`{"type": "text"}` 块 | 位于 user 消息内的 `{"type": "input_text", "text": "..."}` |
| `user` 角色，`{"type": "image", "source": {"type": "base64"}}` | 位于 user 消息内的 `{"type": "input_image", "image_url": "data:<media_type>;base64,<data>"}` |
| `user` 角色，`{"type": "image", "source": {"type": "url"}}` | 位于 user 消息内的 `{"type": "input_image", "image_url": "<url>"}` |
| `user` 角色，`{"type": "tool_result"}` 块 | 提升为顶层 `{"type": "function_call_output", "call_id": "...", "output": "..."}`，完全脱离原消息 |
| `assistant` 角色，字符串内容 | `{"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "..."}]}` |
| `assistant` 角色，`{"type": "text"}` 块 | 位于 assistant 消息内的 `{"type": "output_text", "text": "..."}` |
| `assistant` 角色，`{"type": "tool_use"}` 块 | 提升为顶层 `{"type": "function_call", "call_id": "<id>", "name": "...", "arguments": "<JSON string>"}`，完全脱离原消息 |
| `assistant` 角色，`{"type": "thinking"}` 块 | 位于 assistant 消息内的 `{"type": "output_text", "text": "<thinking text>"}` |


### tools

| Anthropic 工具 | Responses API 工具 |
|---|---|
| 任何满足 `type` 以 `"web_search"` 开头或 `name == "web_search"` 的工具 | `{"type": "web_search_preview"}` |
| 其余所有工具 | `{"type": "function", "name": "...", "description": "...", "parameters": <input_schema>}` |


### tool_choice

| Anthropic `tool_choice.type` | Responses API `tool_choice` |
|---|---|
| `"auto"` | `{"type": "auto"}` |
| `"any"` | `{"type": "required"}` |
| `"tool"` | `{"type": "function", "name": "<tool name>"}` |


### thinking → reasoning

`budget_tokens` 的值会映射为一个字符串形式的 effort 等级。`summary` 始终设为 `"detailed"`。

| `thinking.budget_tokens` | `reasoning.effort` |
|---|---|
| >= 10000 | `"high"` |
| >= 5000 | `"medium"` |
| >= 2000 | `"low"` |
| < 2000 | `"minimal"` |

如果 `thinking.type` 不是 `"enabled"`，则完全不发送 `reasoning` 字段。


### context_management

Anthropic 使用带 `edits` 数组的嵌套字典；OpenAI 使用扁平的 compaction 对象数组。

```
Anthropic input:
{
  "edits": [
    {
      "type": "compact_20260112",
      "trigger": {"type": "input_tokens", "value": 150000}
    }
  ]
}

Responses API output:
[
  {"type": "compaction", "compact_threshold": 150000}
]
```


## 响应：Responses API → Anthropic

当 Responses API 的回复返回时，LiteLLM 会把它转换为 Anthropic 的 `AnthropicMessagesResponse`。

| Responses API 字段 | Anthropic 响应字段 | 说明 |
|---|---|---|
| `response.id` | `id` | |
| `response.model` | `model` | 缺失时回退到 `"unknown-model"` |
| `ResponseReasoningItem` 的 `summary[*].text` | `content` 块 `{"type": "thinking", "thinking": "..."}` | 每段非空 summary 文本都会生成一个 thinking 块 |
| `ResponseOutputMessage` 中 `type == "output_text"` 的 `content[*]` | `content` 块 `{"type": "text", "text": "..."}` | |
| `ResponseFunctionToolCall` 的 `{call_id, name, arguments}` | `content` 块 `{"type": "tool_use", "id": "...", "name": "...", "input": {...}}` | `arguments` 会被 JSON 解析回字典 |
| 输出中存在任何 `function_call` | `stop_reason: "tool_use"` | |
| `response.status == "incomplete"` | `stop_reason: "max_tokens"` | 优先于默认值 |
| 其余所有情况 | `stop_reason: "end_turn"` | 默认值 |
| `response.usage.input_tokens` | `usage.input_tokens` | |
| `response.usage.output_tokens` | `usage.output_tokens` | |
| *（硬编码）* | `type: "message"` | 始终设置 |
| *（硬编码）* | `role: "assistant"` | 始终设置 |
| *（硬编码）* | `stop_sequence: null` | 此路径上始终为 null |
