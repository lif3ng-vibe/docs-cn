---
title: Claude Code - 上下文管理
sidebar_label: Claude Code - 上下文管理
---

# Claude Code - 上下文管理

LiteLLM 原生支持 Anthropic 的 `context_management` beta，并且覆盖**所有提供商**，不只限于 Anthropic。

当你向 `/v1/messages` 发送带有 `context_management` 配置的请求（或通过 `litellm.anthropic.messages.*` 调用）时，LiteLLM 会根据请求被路由到的目标，以两种方式之一来处理它：

| 路由路径 | context_management 的应用方式 |
|---|---|
| **Anthropic API** | 直接透传给 Anthropic 服务器，由服务端原生应用编辑 |
| **OpenAI Responses API**（如 `gpt-5.x-*`） | 直接透传，由 Responses API 处理 |
| **其他任何提供商**（OpenAI、xAI、Gemini、Azure、非 Anthropic 的 Bedrock 等） | **网关内 polyfill**：LiteLLM 在转发前对消息数组应用这些编辑 |

有了 polyfill，你的 Claude Code 工具循环只需编写一次，照常传入 `context_management`，无论代理背后是哪个模型都能正常工作。

## 支持的编辑类型

| 编辑类型 | 状态 | 作用说明 |
|---|---|---|
| `clear_tool_uses_20250919` | ✅ **已支持** | 当达到触发阈值时，从对话历史中清除旧的 `tool_result` 内容，只完整保留最近的 `N` 条工具结果 |
| `clear_thinking_20251015` | ❌ 即将支持 | 从历史中清除扩展思考块 |
| `compact_20260112` | ✅ **已支持** | 摘要式编辑：LiteLLM 调用配置好的摘要模型，把摘要注入为系统前缀，并在响应中返回一个 `compaction` 块 |

## 工作原理

```
Claude Code client
        │
        │  POST /v1/messages  { context_management: { edits: [...] } }
        ▼
┌─────────────────────────────────────────────────────────┐
│                    LiteLLM Proxy                        │
│                                                         │
│  1. Detect routing target                               │
│                                                         │
│  ┌──────────────────────┐   ┌────────────────────────┐  │
│  │  Anthropic / Bedrock │   │  Any other provider    │  │
│  │  Anthropic / OpenAI  │   │  (OpenAI, xAI, Gemini, │  │
│  │  Responses API       │   │   Azure, …)            │  │
│  │                      │   │                        │  │
│  │  Pass context_mgmt   │   │  In-gateway polyfill:  │  │
│  │  spec through as-is  │   │                        │  │
│  │  (server applies it) │   │  clear_tool_uses:      │  │
│  └──────────┬───────────┘   │  • Count input tokens  │  │
│             │               │  • Check trigger       │  │
│             │               │  • Clear old results   │  │
│             │               │  • Keep N most recent  │  │
│             │               │                        │  │
│             │               │  compact_20260112:     │  │
│             │               │  • Slice at compaction │  │
│             │               │    block (if present)  │  │
│             │               │  • Check token trigger │  │
│             │               │  • Call summary model  │  │
│             │               │  • Inject summary as   │  │
│             │               │    system prefix       │  │
│             │               └──────────┬─────────────┘  │
│             │                          │                 │
│             └────────────┬─────────────┘                 │
│                          │                               │
│  2. Forward to provider  │                               │
│     (without context_    │                               │
│      management key)     │                               │
└──────────────────────────┼──────────────────────────────┘
                           ▼
                    Upstream model
                           │
                    Response + usage
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  LiteLLM attaches applied_edits to response             │
│  { context_management: { applied_edits: [...] } }       │
│  (compact also prepends a compaction block to content)  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                    Claude Code client
```

## 用法

### 基本请求

```python
import litellm

response = await litellm.anthropic.messages.acreate(
    model="xai/grok-4",          # any provider
    max_tokens=1024,
    messages=[...],              # your multi-turn tool history
    tools=[{"name": "get_weather", "description": "...", "input_schema": {...}}],
    context_management={
        "edits": [
            {
                "type": "clear_tool_uses_20250919",
                "trigger": {
                    "type": "input_tokens",
                    "value": 80000          # activate when history exceeds 80k tokens
                },
                "keep": {
                    "type": "tool_uses",
                    "value": 3              # keep the 3 most-recent tool results
                }
            }
        ]
    }
)
```

你也可以改用工具调用次数而非 Token 数来触发：

```python nolint
"trigger": {"type": "tool_uses", "value": 10}   # activate after 10 tool calls
```

### 通过代理调用（curl）

```bash
curl -X POST http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "max_tokens": 1024,
    "messages": [...],
    "tools": [...],
    "context_management": {
      "edits": [
        {
          "type": "clear_tool_uses_20250919",
          "trigger": {"type": "input_tokens", "value": 80000},
          "keep":    {"type": "tool_uses",    "value": 3}
        }
      ]
    }
  }'
```

---

## `compact_20260112` - 对话压缩

`compact_20260112` 编辑类型会在输入 Token 数超过阈值时对对话历史做摘要。借助 LiteLLM 的 polyfill，这一能力在**任何提供商**上都可用，而不只限于 Anthropic。

### 配置摘要模型

polyfill 会调用一个单独配置的模型来生成摘要。请在代理配置的 `general_settings` 中添加 `context_management_summary_model`：

```yaml
# proxy_server_config.yaml
general_settings:
  context_management_summary_model: {{anthropic}}   # any model alias in your model_list
```

如果不做此配置，polyfill 不会执行任何操作，并返回 `applied_edits[0].error: "summary_model_not_configured"`。

### 用法

```python
import litellm

response = await litellm.anthropic.messages.acreate(
    model="{{openai_small}}",          # any non-Anthropic provider
    max_tokens=1024,
    messages=[...],                # multi-turn history
    context_management={
        "edits": [
            {
                "type": "compact_20260112",
                "trigger": {
                    "type": "input_tokens",
                    "value": 80000          # compact when history exceeds 80k tokens
                }
            }
        ]
    }
)
```

### 通过代理调用（curl）

```bash
curl -X POST http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "max_tokens": 1024,
    "messages": [...],
    "context_management": {
      "edits": [
        {
          "type": "compact_20260112",
          "trigger": {"type": "input_tokens", "value": 80000}
        }
      ]
    }
  }'
```

### 工作机制（3 个阶段）

**阶段 A：切分已有的 compaction 块**

如果消息历史中已经存在 `compaction` 块（来自上一轮压缩），该块之前的所有内容都会被丢弃，其摘要文本会前置到系统提示词中，确保先前的上下文得以延续。

**阶段 B：阈值检查**

LiteLLM 会统计（切分后）消息历史的有效输入 Token 数。只要不超过触发阈值，请求就会立即转发，不做摘要调用。

**阶段 C：生成摘要（仅在超过阈值时）**

LiteLLM 携带完整对话历史和一段摘要指令，调用配置好的 `context_management_summary_model`。生成的摘要会：
- 以 `"Previous conversation summary: ..."` 前缀的形式注入系统消息，随下游模型调用一起发送
- 作为一个 `compaction` 内容块前置到响应的 `content` 数组返回，供 Claude Code 客户端维护滚动压缩状态

### 自定义摘要提示词

你可以通过 `instructions` 字段覆盖默认的摘要指令：

```python
context_management={
    "edits": [
        {
            "type": "compact_20260112",
            "trigger": {"type": "input_tokens", "value": 80000},
            "instructions": "Summarize the key decisions made and open questions. Wrap in <summary></summary> tags."
        }
    ]
}
```

摘要文本必须包裹在 `<summary>...</summary>` 标签内。如果模型返回的文本不含这些标签，就会设置 `applied_edits[0].error: "summary_extraction_failed"`，并原样转发未压缩的对话。

### `compact_20260112` - 配置项

| 字段 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `trigger.type` | 否 | `"input_tokens"` | 仅支持 `"input_tokens"`，其他取值会回退并给出警告 |
| `trigger.value` | 否 | `150000` | Token 阈值。必须 ≥ 50,000，否则请求会被拒绝并返回 400 |
| `instructions` | 否 | Anthropic 默认提示词 | 自定义摘要提示词，必须要求模型把输出包裹在 `<summary>` 标签内 |
| `pause_after_compaction` | 接受 | - | 请求中可以传入，但会被忽略（在 `applied_edits` 中记录警告） |

### `compact_20260112` - 响应

当压缩生效时，响应会包含 `context_management.applied_edits`，并在 `content` 数组前面加上一个 `compaction` 块：

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "compaction",
      "content": "The user is building a Python CLI tool. We have implemented the argument parser and file reader. Next step is to add the output formatter."
    },
    {"type": "text", "text": "Sure, here's the output formatter..."}
  ],
  "model": "{{openai_small}}",
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 420, "output_tokens": 120},
  "context_management": {
    "applied_edits": [
      {
        "type": "compact_20260112",
        "summary_input_tokens": 8400,
        "summary_output_tokens": 210
      }
    ]
  }
}
```

如果未达到触发条件，响应中**不含** `context_management` 字段，也不会前置 `compaction` 块。

### 错误处理

polyfill 采取尽力而为的策略。如果摘要调用失败或返回的摘要无法解析，原始对话会原样转发，并设置 `applied_edits[0].error`：

| `error` 取值 | 原因 |
|---|---|
| `"summary_model_not_configured"` | `general_settings` 中未设置 `context_management_summary_model` |
| `"summary_call_failed"` | 摘要模型调用抛出异常 |
| `"summary_extraction_failed"` | 摘要模型的响应中没有 `<summary>...</summary>` 块 |

### 客户端 compaction 块（无 `context_management` 编辑）

如果请求中**没有** `compact_20260112` 编辑，但消息历史中已存在 `compaction` 块（例如来自之前 Claude Code 的客户端压缩），LiteLLM 会自动执行仅切分转发：把此前的摘要移到系统前缀中，只把最新的用户问题发送到下游，不会调用摘要模型。

---

## `clear_tool_uses_20250919` - 配置项

| 字段 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `trigger.type` | 否 | `"input_tokens"` | `"input_tokens"` 或 `"tool_uses"` |
| `trigger.value` | 否 | `100000` | 阈值；当前值**超过**该值时编辑才会生效 |
| `keep.type` | 否 | `"tool_uses"` | 必须为 `"tool_uses"` |
| `keep.value` | 否 | `3` | 要保留的最近工具结果条数 |
| `clear_at_least` | 接受 | - | 请求中可以传入，但 polyfill（v0）会忽略 |
| `exclude_tools` | 接受 | - | 请求中可以传入，但 polyfill（v0）会忽略 |
| `clear_tool_inputs` | 接受 | - | 请求中可以传入，但 polyfill（v0）会忽略 |

> **硬性下限**：无论 `keep` 如何设置，LiteLLM 的 polyfill 都不会清除最近一条已完成的 `tool_result`，也就是模型正要回复的那条结果。

## 响应

### 非流式

只要至少有一个编辑生效，响应中就会包含 `context_management` 字段：

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "Based on the latest weather data..."}],
  "model": "{{openai_small}}",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 620,
    "output_tokens": 45
  },
  "context_management": {
    "applied_edits": [
      {
        "type": "clear_tool_uses_20250919",
        "cleared_tool_uses": 3,
        "cleared_input_tokens": 8240
      }
    ]
  }
}
```

如果未达到触发条件（上下文还很小），响应中就**不含** `context_management` 字段。

### 流式

`context_management.applied_edits` 字段包含在最后一个 `message_delta` SSE 事件中：

```
event: message_start
data: {"type":"message_start","message":{"id":"msg_01...","type":"message","role":"assistant","content":[],"model":"{{openai_small}}","stop_reason":null,"usage":{"input_tokens":620,"output_tokens":0}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Based on"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" the latest weather data..."}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {
  "type": "message_delta",
  "delta": {"stop_reason": "end_turn", "stop_sequence": null},
  "usage": {"output_tokens": 45},
  "context_management": {
    "applied_edits": [
      {
        "type": "clear_tool_uses_20250919",
        "cleared_tool_uses": 3,
        "cleared_input_tokens": 8240
      }
    ]
  }
}

event: message_stop
data: {"type":"message_stop"}
```

## 禁用上下文管理

### 单次请求：省略该字段

只需不在请求体中包含 `context_management` 即可。

### 按模型：`additional_drop_params`

要让某个模型不走 polyfill，把 `context_management` 列入该模型的 `additional_drop_params`。此后 LiteLLM 会静默剔除发往该模型请求中的 `context_management`，而不再执行 polyfill：

```yaml
# proxy_server_config.yaml
model_list:
  - model_name: gpt-4.1
    litellm_params:
      model: openai/gpt-4.1
      additional_drop_params: ["context_management"]
```

或在调用时指定：

```python
import litellm
litellm.completion(..., additional_drop_params=["context_management"])
```

`drop_params: true` 无法禁用 polyfill。`context_management` 是 LiteLLM 支持的参数（Anthropic 上原生支持，其他提供商由 polyfill 实现），而 `drop_params` 只会剔除真正不支持的参数。

## 提供商支持矩阵

| 提供商 | `clear_tool_uses_20250919` | `compact_20260112` |
|---|---|---|
| `anthropic/*` | 原生透传 | 原生透传 |
| `bedrock/anthropic.*` | 原生透传 | 原生透传 |
| `openai/*`（Responses API） | 原生透传 | 原生透传 |
| `openai/*`（对话补全） | Polyfill | Polyfill |
| `azure/*` | Polyfill | Polyfill |
| `xai/*` | Polyfill | Polyfill |
| `gemini/*` | Polyfill | Polyfill |
| `vertex_ai/*` | Polyfill | Polyfill |
| 其他所有提供商 | Polyfill | Polyfill |

## 注意事项

- **`compact_20260112` 需要设置 `context_management_summary_model`**：必须在 `general_settings` 中配置，否则该编辑虽被接受，却不会执行任何压缩。
- polyfill 阈值检查所用的 **Token 计数**基于 `litellm.token_counter`（未知模型回退到 tiktoken `cl100k_base`）。
- **`clear_tool_uses_20250919`** 会保持消息数组结构不变：消息数量相同、角色顺序一致，只有匹配消息内的 `tool_result.content` 会被替换为 `"[Cleared by context management]"`。
- **`compact_20260112`** 会把此前的全部历史折叠为一条系统前缀摘要加最后一个用户问题。响应中的 `compaction` 块让 Claude Code 客户端拿到摘要文本，供下一轮延续使用。
- `compact_20260112` 触发值的 50,000 Token 下限在代理侧强制执行；低于该值的请求会被拒绝并返回 HTTP 400。
