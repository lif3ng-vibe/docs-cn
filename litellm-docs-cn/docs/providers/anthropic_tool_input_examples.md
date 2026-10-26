# Anthropic 工具输入示例

为有效的工具输入提供具体示例，帮助 Claude 更好地理解如何使用你的工具。对于包含嵌套对象、可选参数或格式敏感输入的复杂工具，这一功能尤其有用。

:::info
工具输入示例是一项 beta 功能。LiteLLM 会自动检测带有 `input_examples` 字段的工具，并根据你使用的提供商添加相应的 beta 请求头：

- **Anthropic API 与 Microsoft Foundry**：`advanced-tool-use-2025-11-20`
- **Amazon Bedrock**：`advanced-tool-use-2025-11-20`（仅限 Claude Opus 4.5）
- **Google Cloud Vertex AI**：不支持

你无需手动指定 beta 请求头，LiteLLM 会自动处理。
:::

## 何时使用输入示例

输入示例在以下场景最能发挥作用：

- **复杂嵌套对象**：参数结构层层嵌套的工具
- **可选参数**：说明可选参数何时应当传入
- **格式敏感输入**：示范期望的格式（日期、地址等）
- **枚举值**：结合语境展示合法的枚举取值
- **边界情况**：演示特殊场景的处理方式

:::tip
**先打磨描述**！清晰、详尽的工具描述比示例更重要。对于仅靠描述可能说不清楚的复杂工具，把 `input_examples` 当作补充手段。
:::

## 快速上手

在工具定义中添加 `input_examples` 字段，取值为示例输入对象组成的数组：

```python
import litellm

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {"role": "user", "content": "What's the weather like in San Francisco?"}
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "description": "The unit of temperature"
                        }
                    },
                    "required": ["location"]
                }
            },
            "input_examples": [
                {
                    "location": "San Francisco, CA",
                    "unit": "fahrenheit"
                },
                {
                    "location": "Tokyo, Japan",
                    "unit": "celsius"
                },
                {
                    "location": "New York, NY"  # 'unit' is optional
                }
            ]
        }
    ]
)

print(response)
```

## 工作原理

当你提供 `input_examples` 后：

1. **LiteLLM 自动检测**：识别工具定义中的 `input_examples` 字段
2. **自动添加 beta 请求头**：注入 `advanced-tool-use-2025-11-20`
3. **示例随提示词一并发送**：Anthropic 会把示例与你的工具 schema 放在一起
4. **Claude 学习模式**：模型借助示例理解正确的工具用法
5. **工具调用更准**：Claude 能以正确的参数格式发起更准确的工具调用

## 示例格式

### 带示例的简单工具

```python
{
    "type": "function",
    "function": {
        "name": "send_email",
        "description": "Send an email to a recipient",
        "parameters": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Email address"},
                "subject": {"type": "string"},
                "body": {"type": "string"}
            },
            "required": ["to", "subject", "body"]
        }
    },
    "input_examples": [
        {
            "to": "user@example.com",
            "subject": "Meeting Reminder",
            "body": "Don't forget our meeting tomorrow at 2 PM."
        },
        {
            "to": "team@company.com",
            "subject": "Weekly Update",
            "body": "Here's this week's progress report..."
        }
    ]
}
```

### 复杂嵌套对象

```python
{
    "type": "function",
    "function": {
        "name": "create_calendar_event",
        "description": "Create a new calendar event",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "start": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string"},
                        "time": {"type": "string"}
                    }
                },
                "attendees": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "email": {"type": "string"},
                            "optional": {"type": "boolean"}
                        }
                    }
                }
            },
            "required": ["title", "start"]
        }
    },
    "input_examples": [
        {
            "title": "Team Standup",
            "start": {
                "date": "2025-01-15",
                "time": "09:00"
            },
            "attendees": [
                {"email": "alice@example.com", "optional": False},
                {"email": "bob@example.com", "optional": True}
            ]
        },
        {
            "title": "Lunch Break",
            "start": {
                "date": "2025-01-15",
                "time": "12:00"
            }
            # No attendees - showing optional field
        }
    ]
}
```

### 格式敏感参数

```python
{
    "type": "function",
    "function": {
        "name": "search_flights",
        "description": "Search for available flights",
        "parameters": {
            "type": "object",
            "properties": {
                "origin": {"type": "string", "description": "Airport code"},
                "destination": {"type": "string", "description": "Airport code"},
                "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                "passengers": {"type": "integer"}
            },
            "required": ["origin", "destination", "date"]
        }
    },
    "input_examples": [
        {
            "origin": "SFO",
            "destination": "JFK",
            "date": "2025-03-15",
            "passengers": 2
        },
        {
            "origin": "LAX",
            "destination": "ORD",
            "date": "2025-04-20",
            "passengers": 1
        }
    ]
}
```

## 要求与限制

### Schema 校验

- 每个示例**必须合法**，符合工具的 `input_schema`
- 不合法的示例会从 Anthropic 收到 **400 错误**
- 校验发生在服务端（LiteLLM 只是透传示例）

### 不支持服务端工具

输入示例**仅支持用户自定义工具**。以下服务端工具不支持 `input_examples`：

- `web_search`（网页搜索工具）
- `code_execution`（代码执行工具）
- `computer_use`（计算机操作工具）
- `bash_tool`（bash 执行工具）
- `text_editor`（文本编辑器工具）

### Token 开销

示例会计入提示词 Token：

- **简单示例**：每个约 20-50 个 Token
- **复杂嵌套对象**：每个约 100-200 个 Token
- **权衡**：以更高的 Token 开销换取更准的工具调用

### 模型兼容性

输入示例适用于所有支持 `advanced-tool-use-2025-11-20` beta 请求头的 Claude 模型：

- Claude Sonnet 5 (`{{anthropic}}`)
- Claude Opus 5 (`claude-opus-5`)
- Claude Opus 4.5 (`claude-opus-4-5-20251101`)
- Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- Claude Opus 4.1 (`claude-opus-4-1-20250805`)

:::note
在 Google Cloud Vertex AI 和 Amazon Bedrock 上，只有 Claude Opus 4.5 支持工具输入示例。
:::

## 最佳实践

### 1. 展示多样化示例

提供能覆盖不同用法的示例：

```python nolint
"input_examples": [
    {"location": "San Francisco, CA", "unit": "fahrenheit"},  # US city
    {"location": "Tokyo, Japan", "unit": "celsius"},          # International
    {"location": "New York, NY"}                              # Optional param omitted
]
```

### 2. 演示可选参数

说明可选参数什么时候该传、什么时候不该传：

```python nolint
"input_examples": [
    {
        "query": "machine learning",
        "filters": {"year": 2024, "category": "research"}  # With optional filters
    },
    {
        "query": "artificial intelligence"  # Without optional filters
    }
]
```

### 3. 说明格式要求

用示例把格式要求交代清楚：

```python nolint
"input_examples": [
    {
        "phone": "+1-555-123-4567",  # Shows expected phone format
        "date": "2025-01-15",         # Shows date format (YYYY-MM-DD)
        "time": "14:30"               # Shows time format (HH:MM)
    }
]
```

### 4. 保持示例真实

使用贴近真实生产的示例，而不是占位数据：

```python nolint
# ✅ Good - realistic examples
"input_examples": [
    {"email": "alice@company.com", "role": "admin"},
    {"email": "bob@company.com", "role": "user"}
]

# ❌ Bad - placeholder examples
"input_examples": [
    {"email": "test@test.com", "role": "role1"},
    {"email": "example@example.com", "role": "role2"}
]
```

### 5. 控制示例数量

每个工具提供 2-5 个示例：

- **太少**（1 个）：可能不足以体现变化
- **适中**（2-5 个）：既能展示模式，又不会让 Token 膨胀
- **太多**（10 个以上）：浪费 Token，收益递减

## 与其他特性集成

输入示例可以与 Anthropic 的其他工具特性搭配使用：

### 配合工具搜索

```python
{
    "type": "function",
    "function": {
        "name": "query_database",
        "description": "Execute a SQL query",
        "parameters": {...}
    },
    "defer_loading": True,  # Tool search
    "input_examples": [     # Input examples
        {"sql": "SELECT * FROM users WHERE id = 1"}
    ]
}
```

### 配合编程式工具调用

```python
{
    "type": "function",
    "function": {
        "name": "fetch_data",
        "description": "Fetch data from API",
        "parameters": {...}
    },
    "allowed_callers": ["code_execution_20250825"],  # Programmatic calling
    "input_examples": [                               # Input examples
        {"endpoint": "/api/users", "method": "GET"}
    ]
}
```

### 全部特性组合

```python
{
    "type": "function",
    "function": {
        "name": "advanced_tool",
        "description": "A complex tool",
        "parameters": {...}
    },
    "defer_loading": True,                            # Tool search
    "allowed_callers": ["code_execution_20250825"],  # Programmatic calling
    "input_examples": [                               # Input examples
        {"param1": "value1", "param2": "value2"}
    ]
}
```

## 提供商支持

LiteLLM 在以下兼容 Anthropic 的提供商上支持输入示例：

- **Anthropic 标准 API**（`anthropic/{{anthropic}}`）✅
- **Azure Anthropic / Microsoft Foundry**（`azure_ai/{{anthropic}}`）✅
- **Amazon Bedrock**（`bedrock/invoke/anthropic.claude-opus-4-5-20251101-v1:0`）✅（仅限 Opus 4.5）
- **Google Cloud Vertex AI**（`vertex_ai/{{anthropic}}`）❌ 不支持

当 LiteLLM 检测到带有 `input_examples` 字段的工具时，会自动添加 beta 请求头（`advanced-tool-use-2025-11-20`）。

## 故障排查

### 使用示例时出现 "Invalid request" 错误

**问题**：使用输入示例时收到 400 错误

**解决**：确保每个示例都符合你的 `input_schema`：

```python
# Check that:
# 1. All required fields are present in examples
# 2. Field types match the schema
# 3. Enum values are valid
# 4. Nested objects follow the schema structure
```

### 示例没有改善工具调用效果

**问题**：加了示例却看不到效果

**解决**：
1. **先检查描述**：确保工具描述足够详细、清晰
2. **审视示例质量**：确保示例真实且多样
3. **核对 schema**：确认示例确实符合你的 schema
4. **增加多样性**：补充展示不同用法的示例

### Token 用量过高

**问题**：输入示例消耗的 Token 过多

**解决**：
1. **减少示例数量**：用 2-3 个示例替代 5 个以上
2. **精简示例**：去掉示例中不必要的字段
3. **倚重描述**：如果描述已经足够清晰，可能根本不需要示例

## 何时不应使用输入示例

以下情况可以不加输入示例：

- **工具足够简单**：单参数且描述清晰的工具
- **Schema 一目了然**：结构良好、描述到位的 schema
- **Token 预算紧张**：每个示例会增加 20-200 个 Token
- **服务端工具**：web_search、code_execution 等不支持示例

## 相关特性

- [Anthropic 工具搜索](./anthropic_tool_search.md)：按需动态发现并加载工具
- [Anthropic 编程式工具调用](./anthropic_programmatic_tool_calling.md)：在代码执行中调用工具
- [Anthropic 提供商](./anthropic.md)：Anthropic 提供商通用文档
