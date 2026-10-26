# [BETA] 通用防护栏 API——无需 PR 即可集成

## 问题

如果你是一家防护栏（guardrail）提供商，以往接入 LiteLLM 通常需要：

- 向 LiteLLM 仓库提交 PR
- 等待审核与合并
- 在 LiteLLM 代码库里维护提供商专属代码
- API 每有变动，都要同步更新集成代码

## 解决方案

只要实现一个简单的 API 端点，**通用防护栏 API**（Generic Guardrail API）就能让你**即时**接入 LiteLLM，无需提交 PR。

### 核心优势

1. **无需 PR**：部署后立即可集成
2. **全端点支持**：覆盖 LiteLLM **全部**端点（对话补全、嵌入、图像生成等）
3. **契约简单**：一个端点，三种响应类型
4. **多模态支持**：请求与响应中的文本和图片都能处理
5. **自定义参数**：通过配置传入提供商专属参数
6. **完全掌控**：防护栏 API 由你自己拥有和维护

## 支持的端点

通用防护栏 API 可与以下 LiteLLM 端点配合使用：

- `/v1/chat/completions` - OpenAI 对话补全
- `/v1/completions` - OpenAI 文本补全
- `/v1/responses` - OpenAI Responses API
- `/v1/images/generations` - OpenAI 图像生成
- `/v1/audio/transcriptions` - OpenAI 语音转写
- `/v1/audio/speech` - OpenAI 文本转语音
- `/v1/messages` - Anthropic Messages
- `/v1/rerank` - Cohere Rerank
- 透传端点

## 工作原理

1. LiteLLM 从任意请求（对话消息、嵌入、图像提示词等）中提取文本与图片
2. 把提取到的内容和元数据一并发给你的 API 端点
3. 你的 API 返回 `BLOCKED`、`NONE` 或 `GUARDRAIL_INTERVENED`
4. LiteLLM 执行该决定并应用相应修改

## API 契约

### 端点

实现 `POST /beta/litellm_basic_guardrail_api` 端点即可。

### 请求格式

```json
{
  "texts": ["extracted text from the request"],  // array of text strings
  "images": ["base64_encoded_image_data"],  // optional array of images
  "tools": [  // tool calls sent to the LLM (in the OpenAI Chat Completions spec)
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {"type": "string"}
          }
        }
      }
    }
  ],
  "tool_calls": [  // tool calls received from the LLM (in the OpenAI Chat Completions spec)
    {
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "get_weather",
        "arguments": "{\"location\": \"San Francisco\"}"
      }
    }
  ],
  "structured_messages": [  // optional, full messages in OpenAI format (for chat endpoints)
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello"}
  ],
  "request_data": {
    "user_api_key_hash": "hash of the litellm virtual key used",
    "user_api_key_alias": "alias of the litellm virtual key used",
    "user_api_key_user_id": "user id associated with the litellm virtual key used",
    "user_api_key_user_email": "user email associated with the litellm virtual key used",
    "user_api_key_team_id": "team id associated with the litellm virtual key used",
    "user_api_key_team_alias": "team alias associated with the litellm virtual key used",
    "user_api_key_end_user_id": "end user id associated with the litellm virtual key used",
    "user_api_key_org_id": "org id associated with the litellm virtual key used"
  },
  "request_headers": {  // optional: inbound request headers (allowlist). Allowed headers show their value; all others show "[present]" to indicate the header existed.
    "User-Agent": "OpenAI/Python 2.17.0",
    "Content-Type": "application/json",
    "X-Request-Id": "[present]"
  },
  "litellm_version": "1.x.y",  // optional: LiteLLM library version running this proxy
  "input_type": "request",  // "request" or "response"
  "litellm_call_id": "unique_call_id",  // the call id of the individual LLM call
  "litellm_trace_id": "trace_id",  // the trace id of the LLM call - useful if there are multiple LLM calls for the same conversation
  "additional_provider_specific_params": {
    // your custom params from config
  }
}
```

### 响应格式

```json nolint
{
  "action": "BLOCKED" | "NONE" | "GUARDRAIL_INTERVENED",
  "blocked_reason": "why content was blocked",  // required if action=BLOCKED
  "texts": ["modified text"],  // optional array of modified text strings
  "images": ["modified_base64_image"],  // optional array of modified images
  "structured_messages": [{"role": "user", "content": "modified message"}]  // optional array of rewritten chat messages
}
```

**动作说明**：
- `BLOCKED`：LiteLLM 抛出错误并拦截请求
- `NONE`：请求原样放行
- `GUARDRAIL_INTERVENED`：请求带着修改后的文本/图片继续执行（需提供 `texts` 和/或 `images` 字段）

**按消息改写**：`texts` 必须与 LiteLLM 发来的 `texts` 数组一一对应。如果你的端点要按对话消息逐条改写请求，请把改写后的各行放进 `structured_messages` 返回（参见[返回改写后的消息](#返回改写后的消息)）。在 `/v1/responses` 上，“每条消息一个条目”的 `texts` 数组与 LiteLLM 实际提取的内容对不上，因此请求会被拒绝并返回 500，报错中会指明是哪个防护栏，而不会把未改写的请求原样放行

## 参数

### `tools` 参数

`tools` 参数提供请求中可用的函数/工具定义信息。

**格式**：OpenAI `ChatCompletionToolParam` 格式（参见 [OpenAI API 参考](https://platform.openai.com/docs/api-reference/chat/create#chat-create-tools)）

只带 `type` 而没有 `function` 块的内置工具（例如 `{"type": "code_interpreter"}` 或 `{"type": "file_search", "vector_store_ids": [...]}`）同样会被接受，并原样转发到你的端点（包括工具专属配置）。你的端点应把 `function` 视为可选字段，并按 `type` 分支处理。

**示例**：
```json
{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "Get the current weather in a location",
    "parameters": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "City and state, e.g. San Francisco, CA"
        },
        "unit": {
          "type": "string",
          "enum": ["celsius", "fahrenheit"]
        }
      },
      "required": ["location"]
    }
  }
}
```

**可用性**：
- **仅输入方向**：工具只在 `input_type="request"`（调用前防护栏）时传入。输出/响应方向的防护栏目前收不到工具定义。
- **支持的端点**：`tools` 参数支持 `/v1/chat/completions`、`/v1/responses` 和 `/v1/messages`。其他端点没有工具支持。

**使用场景**：
- 执行工具权限策略（例如只允许特定用户/团队访问特定工具）
- 在发送给 LLM 之前校验工具 schema
- 记录工具使用日志，便于审计
- 基于用户上下文拦截敏感工具

### `tool_calls` 参数

`tool_calls` 参数包含请求或响应中实际发生的函数/工具调用。

**格式**：OpenAI `ChatCompletionMessageToolCall` 格式（参见 [OpenAI API 参考](https://platform.openai.com/docs/api-reference/chat/object#chat/object-tool_calls)）

**示例**：
```json
{
  "id": "call_abc123",
  "type": "function",
  "function": {
    "name": "get_weather",
    "arguments": "{\"location\": \"San Francisco\", \"unit\": \"celsius\"}"
  }
}
```

**与 `tools` 的关键区别**：
- **`tools`**：工具定义/schema（哪些工具*可用*）
- **`tool_calls`**：工具调用/执行（哪些工具*正在被调用*、用什么参数）

**可用性**：
- **输入输出都支持**：工具调用既可能出现在 `input_type="request"`（请求工具调用的助手消息）中，也可能出现在 `input_type="response"`（带工具调用的 LLM 响应）中。
- **支持的端点**：`tool_calls` 参数支持 `/v1/chat/completions`、`/v1/responses` 和 `/v1/messages`。

**使用场景**：
- 在执行前校验工具调用参数
- 从工具调用参数中抹除敏感数据（如 PII，个人身份信息）
- 记录工具调用，便于审计与调试
- 拦截带有危险参数的工具调用
- 修改工具调用参数（例如强制约束、清洗输入）
- 监控各用户/团队的工具使用模式

### `structured_messages` 参数

`structured_messages` 参数以 OpenAI 对话补全规范格式提供完整输入，便于区分系统消息与用户消息。

**格式**：OpenAI 对话补全消息数组（参见 [OpenAI API 参考](https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages)）

**示例**：
```json
[
  {"role": "system", "content": "You are a helpful assistant"},
  {"role": "user", "content": "Hello"}
]
```

**可用性**：
- **支持的端点**：`/v1/chat/completions`、`/v1/messages`、`/v1/responses`
- **仅输入方向**：只在 `input_type="request"`（调用前防护栏）时传入

**使用场景**：
- 对系统消息与用户消息应用不同策略
- 执行基于角色的内容限制
- 记录结构化的对话上下文

#### 返回改写后的消息

要按消息逐条改写请求，请在响应中返回 `structured_messages`：收到的每一行对应返回的一行，顺序一致，保留每行的 `role` 与结构，只改你想改写的内容。LiteLLM 会在所有支持的端点把这些行写回原始请求，包括带有 `instructions` 或工具项的 `/v1/responses` 回合——这类回合放不下逐消息的 `texts` 数组。原样返回的行视为未修改，所以没动过的行可以直接原样带回；当所有行都未修改时，LiteLLM 会改用 `texts`。返回数组长度与收到的不一致时，整个对话会被整体替换。

**示例**：
```json
{
  "action": "GUARDRAIL_INTERVENED",
  "structured_messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "My SSN is <US_SSN>"}
  ]
}
```

## LiteLLM 配置

在 `config.yaml` 中添加：

```yaml
litellm_settings:
  guardrails:
    - guardrail_name: "my-guardrail"
      litellm_params:
        guardrail: generic_guardrail_api
        mode: pre_call  # or post_call, during_call
        api_base: https://your-guardrail-api.com
        api_key: os.environ/YOUR_GUARDRAIL_API_KEY  # optional
        unreachable_fallback: fail_closed  # default: fail_closed. Set to fail_open to proceed if the guardrail endpoint is unreachable (network errors, or HTTP 502/503/504 from an upstream proxy/LB).
        fail_on_error: true  # default: true (fail closed). Set to false to proceed on ANY guardrail error. See "Error handling" below before changing this.
        additional_provider_specific_params:
          # your custom parameters
          threshold: 0.8
          language: "en"
```

### 错误处理：`unreachable_fallback` 与 `fail_on_error`

防护栏自身出错（而不是给出正常判定）时 LiteLLM 该怎么办，由两个设置控制。二者从严格到宽松各有分工，且可以叠加：

- `unreachable_fallback`（默认 `fail_closed`）只对防护栏端点**不可达**的情况生效：网络错误、超时，或上游代理/负载均衡器返回的 HTTP 502/503/504。设为 `fail_open`，可让请求只在这些情况下继续放行。
- `fail_on_error`（默认 `true`）是更宽泛的开关，管辖**任何**防护栏错误，不只限于不可达。

| `fail_on_error` | 防护栏出错时的行为 |
| --- | --- |
| `true`（默认） | **失败即关闭**（fail closed）。任何错误都会拦截请求：非 2xx 响应、格式错误或无法解析的响应体、网络故障，或内部序列化/校验错误。这与 LiteLLM 现有行为保持一致 |
| `false` | **失败即放行**（fail open，完全放行）。任何防护栏错误都只降级为一条 critical 级别日志，请求照常进行，如同该防护栏没有配置 |

只有合法的防护栏响应才能生效。设为 `fail_on_error: false` 时，解析出的 `BLOCKED` 决定依然会拦截；凡不属于合法响应的情况（出错、响应体格式错误、端点不可达）一律绕过。请求钩子（`pre_call`）和响应钩子（`post_call`）都适用这条规则；在响应路径上，fail-open 会返回已经生成好的模型输出，而 fail-closed 则会把一次成功的生成变成错误。

:::danger

`fail_on_error: false` 等于出错时完全绕过。这意味着防护栏或其端点出现**任何**失败——无论什么原因——该请求都会跳过这个防护栏，而不是被它拦截。只有在你理解并接受这一取舍的前提下才启用：当可用性与运维约束强于安全约束时，才这样选。如果防护栏是硬性安全边界，请保持默认的 `true`（fail closed）。

:::

默认采用 fail closed，正是因为防护栏通常是安全控制手段。每一次 fail-open 绕过都会以 critical 级别记录日志（`Generic Guardrail API error (fail-open) ...`），并附带 call id 与 trace id，便于你据此配置告警并审计其发生频率。

### 静态与动态请求头

你可以向防护栏端点发送两类请求头：

- **静态请求头**（`headers`）：一个键值对映射，随发往防护栏的**每个**请求一起发送。适合放固定值（例如 API 密钥、`X-Service-Name`）。在 `litellm_params` 中配置：

  ```yaml
  litellm_params:
    guardrail: generic_guardrail_api
    api_base: https://your-guardrail-api.com
    headers:
      X-Service-Name: "my-app"
      X-API-Key: "secret"
  ```

- **动态请求头**（`extra_headers`）：一份**请求头名称**列表，命中的请求头会从**客户端请求**转发给你的防护栏。只有列表内的请求头（外加一小份默认白名单，如 `x-litellm-*`）会携带值发送；其余的只发送 `[present]` 占位。适合透传客户端自带的请求头（例如 `x-request-id`、`x-correlation-id`）。在 `litellm_params` 中配置：

  ```yaml
  litellm_params:
    guardrail: generic_guardrail_api
    api_base: https://your-guardrail-api.com
    extra_headers:
      - x-request-id
      - x-correlation-id
      - x-custom-auth
  ```

这一行为与 [MCP 的静态与额外请求头](/docs/mcp#向-mcp-服务器转发自定义请求头)机制一致。

### 示例：Pillar Security

[Pillar Security](https://pillar.security) 借助通用防护栏 API 提供 AI 安全扫描，涵盖提示注入防护、PII/PCI 检测、密钥泄露检测和内容审核。

```yaml
guardrails:
  - guardrail_name: "pillar-security"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: [pre_call, post_call]
      api_base: https://api.pillar.security/api/v1/integrations/litellm
      api_key: os.environ/PILLAR_API_KEY
      default_on: true
      additional_provider_specific_params:
        plr_mask: true      # Enable automatic masking of sensitive data
        plr_evidence: true  # Include detection evidence in response
        plr_scanners: true  # Include scanner details in response
```

完整配置选项见 [Pillar Security 文档](../proxy/guardrails/pillar_security.md)。

## 使用方法

用户按名称启用你的防护栏：

```python
response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "hello"}],
    guardrails=["my-guardrail"]
)
```

或者使用动态参数：

```python
response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "hello"}],
    guardrails=[{
        "my-guardrail": {
            "extra_body": {
                "custom_threshold": 0.9
            }
        }
    }]
)
```

## 实现示例

完整参考实现见 [mock_bedrock_guardrail_server.py](https://github.com/BerriAI/litellm/blob/main/cookbook/mock_guardrail_server/mock_bedrock_guardrail_server.py)。

**最小化 FastAPI 示例**：

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI()

class GuardrailRequest(BaseModel):
    texts: List[str]
    images: Optional[List[str]] = None
    tools: Optional[List[Dict[str, Any]]] = None  # OpenAI ChatCompletionToolParam format (tool definitions)
    tool_calls: Optional[List[Dict[str, Any]]] = None  # OpenAI ChatCompletionMessageToolCall format (tool invocations)
    structured_messages: Optional[List[Dict[str, Any]]] = None  # OpenAI messages format (for chat endpoints)
    request_data: Dict[str, Any]
    input_type: str  # "request" or "response"
    litellm_call_id: Optional[str] = None
    litellm_trace_id: Optional[str] = None
    additional_provider_specific_params: Dict[str, Any]

class GuardrailResponse(BaseModel):
    action: str  # BLOCKED, NONE, or GUARDRAIL_INTERVENED
    blocked_reason: Optional[str] = None
    texts: Optional[List[str]] = None
    images: Optional[List[str]] = None
    structured_messages: Optional[List[Dict[str, Any]]] = None  # rewritten OpenAI messages, one per row received

@app.post("/beta/litellm_basic_guardrail_api")
async def apply_guardrail(request: GuardrailRequest):
    # Your guardrail logic here
    
    # Example: Check text content
    for text in request.texts:
        if "badword" in text.lower():
            return GuardrailResponse(
                action="BLOCKED",
                blocked_reason="Content contains prohibited terms"
            )
    
    # Example: Check tool definitions (if present in request)
    if request.tools:
        for tool in request.tools:
            if tool.get("type") == "function":
                function_name = tool.get("function", {}).get("name", "")
                # Block sensitive tool definitions
                if function_name in ["delete_data", "access_admin_panel"]:
                    return GuardrailResponse(
                        action="BLOCKED",
                        blocked_reason=f"Tool '{function_name}' is not allowed"
                    )
    
    # Example: Check tool calls (if present in request or response)
    if request.tool_calls:
        for tool_call in request.tool_calls:
            if tool_call.get("type") == "function":
                function_name = tool_call.get("function", {}).get("name", "")
                arguments_str = tool_call.get("function", {}).get("arguments", "{}")
                
                # Parse arguments and validate
                import json
                try:
                    arguments = json.loads(arguments_str)
                    # Block dangerous arguments
                    if "file_path" in arguments and ".." in str(arguments["file_path"]):
                        return GuardrailResponse(
                            action="BLOCKED",
                            blocked_reason="Tool call contains path traversal attempt"
                        )
                except json.JSONDecodeError:
                    pass
    
    # Example: Check structured messages (if present in request)
    if request.structured_messages:
        for message in request.structured_messages:
            if message.get("role") == "system":
                # Apply stricter policies to system messages
                if "admin" in message.get("content", "").lower():
                    return GuardrailResponse(
                        action="BLOCKED",
                        blocked_reason="System message contains restricted terms"
                    )
    
    return GuardrailResponse(action="NONE")
```

## 适用场景

✅ **以下情况使用通用防护栏 API**：
- 想立即完成集成，不想等 PR 流程
- 防护栏服务由你自己维护
- 需要对更新和功能拥有完全控制权
- 希望自动支持所有 LiteLLM 端点

❌ **以下情况提交 PR**：
- 想与 LiteLLM 内部机制做更深度集成
- 防护栏需要复杂的 LiteLLM 专属逻辑
- 希望成为内置提供商之一

## 有疑问？

这是一个 **beta API**。我们会根据反馈持续改进。如果你需要更多能力，欢迎提交 issue 或 PR。
