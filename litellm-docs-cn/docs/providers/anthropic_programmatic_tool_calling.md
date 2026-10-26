# Anthropic 程序化工具调用

程序化工具调用（Programmatic Tool Calling）让 Claude 在代码执行容器中编写代码、以编程方式调用你的工具，而不必每次调用工具都与模型往返一轮。这能降低多工具工作流的延迟，还允许 Claude 在数据进入模型上下文窗口之前先过滤或处理数据，从而减少 Token 消耗。

:::info
程序化工具调用目前处于公开测试（public beta）阶段。LiteLLM 会自动识别带有 `allowed_callers` 字段的工具，并根据你使用的提供商自动添加相应的 Beta 请求头：

- **Anthropic API 与 Microsoft Foundry**：`advanced-tool-use-2025-11-20`
- **Amazon Bedrock**：`advanced-tool-use-2025-11-20`
- **Google Cloud Vertex AI**：不支持

该功能要求启用代码执行工具。
:::

## 模型兼容性

以下模型支持程序化工具调用：

| 模型 | 工具版本 |
|-------|--------------|
| Claude Opus 4.5 (`claude-opus-4-5-20251101`) | `code_execution_20250825` |
| Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) | `code_execution_20250825` |

## 快速上手

下面这个简单的例子演示了 Claude 如何以编程方式多次查询数据库并汇总结果：

```python
import litellm

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "Query sales data for the West, East, and Central regions, then tell me which region had the highest revenue"
        }
    ],
    tools=[
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        },
        {
            "type": "function",
            "function": {
                "name": "query_database",
                "description": "Execute a SQL query against the sales database. Returns a list of rows as JSON objects.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sql": {
                            "type": "string",
                            "description": "SQL query to execute"
                        }
                    },
                    "required": ["sql"]
                }
            },
            "allowed_callers": ["code_execution_20250825"]
        }
    ]
)

print(response)
```

## 工作原理

当你把某个工具配置为可在代码执行中被调用，且 Claude 决定使用该工具时：

1. Claude 编写 Python 代码，把工具当作函数来调用，其中可以包含多次工具调用以及前置/后置处理逻辑
2. Claude 通过代码执行在沙箱容器中运行这段代码
3. 工具函数被调用时，代码执行会暂停，API 返回一个带有 `caller` 字段的 `tool_use` 块
4. 你提供工具结果后，代码执行继续进行（中间结果不会加载进 Claude 的上下文窗口）
5. 全部代码执行完成后，Claude 拿到最终输出，继续处理任务

这种方式特别适合以下场景：

- **大批量数据处理**：在结果进入 Claude 的上下文之前，先做过滤或聚合
- **多步骤工作流**：串行或在循环中调用工具，工具调用之间无需再次采样 Claude，从而节省 Token 和延迟
- **条件逻辑**：根据中间工具结果做决策

## `allowed_callers` 字段

`allowed_callers` 字段用于指定哪些上下文可以调用某个工具：

```python
{
    "type": "function",
    "function": {
        "name": "query_database",
        "description": "Execute a SQL query against the database",
        "parameters": {...}
    },
    "allowed_callers": ["code_execution_20250825"]
}
```

**可选值**：

- `["direct"]`：只有 Claude 能直接调用该工具（省略时的默认值）
- `["code_execution_20250825"]`：只能在代码执行中调用
- `["direct", "code_execution_20250825"]`：既可以被直接调用，也可以在代码执行中调用

:::tip
建议每个工具只在 `["direct"]` 和 `["code_execution_20250825"]` 中二选一，不要两者都启用，这样能给 Claude 更明确的指引，帮助它以最佳方式使用工具。
:::

## 响应中的 `caller` 字段

每个工具调用块都带有 `caller` 字段，用于标明它的调用方式：

**直接调用**（传统工具调用方式）：

```python
{
    "type": "tool_use",
    "id": "toolu_abc123",
    "name": "query_database",
    "input": {"sql": "<sql>"},
    "caller": {"type": "direct"}
}
```

**程序化调用**：

```python
{
    "type": "tool_use",
    "id": "toolu_xyz789",
    "name": "query_database",
    "input": {"sql": "<sql>"},
    "caller": {
        "type": "code_execution_20250825",
        "tool_id": "srvtoolu_abc123"
    }
}
```

`tool_id` 指向发起这次程序化调用的代码执行工具。

## 容器生命周期

程序化工具调用依赖代码执行容器：

- **容器创建**：除非你复用已有容器，否则每个会话都会创建一个新容器
- **过期时间**：容器闲置约 4.5 分钟后过期（该时长可能变化）
- **容器 ID**：传入 `container` 参数即可复用已有容器
- **复用**：传入容器 ID，可在多次请求之间保持状态

```python
# First request - creates a new container
response1 = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "Query the database"}],
    tools=[...]
)

# Get container ID from response (if available in response metadata)
container_id = response1.get("container", {}).get("id")

# Second request - reuse the same container
response2 = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[...],
    tools=[...],
    container=container_id  # Reuse container
)
```

:::warning
当工具被程序化调用、容器正在等待你返回工具结果时，必须在容器过期之前响应。请留意 `expires_at` 字段。容器一旦过期，Claude 可能把这次工具调用视为超时并重试。
:::

## 示例工作流

### 步骤 1：初始请求

```python
import litellm

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[{
        "role": "user",
        "content": "Query customer purchase history from the last quarter and identify our top 5 customers by revenue"
    }],
    tools=[
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        },
        {
            "type": "function",
            "function": {
                "name": "query_database",
                "description": "Execute a SQL query against the sales database. Returns a list of rows as JSON objects.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sql": {"type": "string", "description": "SQL query to execute"}
                    },
                    "required": ["sql"]
                }
            },
            "allowed_callers": ["code_execution_20250825"]
        }
    ]
)
```

### 步骤 2：API 返回工具调用

Claude 会编写调用你的工具的代码。响应中包含：

```python
{
    "role": "assistant",
    "content": [
        {
            "type": "text",
            "text": "I'll query the purchase history and analyze the results."
        },
        {
            "type": "server_tool_use",
            "id": "srvtoolu_abc123",
            "name": "code_execution",
            "input": {
                "code": "results = await query_database('<sql>')\ntop_customers = sorted(results, key=lambda x: x['revenue'], reverse=True)[:5]"
            }
        },
        {
            "type": "tool_use",
            "id": "toolu_def456",
            "name": "query_database",
            "input": {"sql": "<sql>"},
            "caller": {
                "type": "code_execution_20250825",
                "tool_id": "srvtoolu_abc123"
            }
        }
    ],
    "stop_reason": "tool_use"
}
```

### 步骤 3：提供工具结果

```python
# Add assistant's response and tool result to conversation
messages = [
    {"role": "user", "content": "Query customer purchase history..."},
    {
        "role": "assistant",
        "content": response.choices[0].message.content,
        "tool_calls": response.choices[0].message.tool_calls
    },
    {
        "role": "user",
        "content": [
            {
                "type": "tool_result",
                "tool_use_id": "toolu_def456",
                "content": '[{"customer_id": "C1", "revenue": 45000}, ...]'
            }
        ]
    }
]

# Continue the conversation
response2 = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=[...]
)
```

### 步骤 4：最终响应

代码执行完成后，Claude 给出最终响应：

```python
{
    "content": [
        {
            "type": "code_execution_tool_result",
            "tool_use_id": "srvtoolu_abc123",
            "content": {
                "type": "code_execution_result",
                "stdout": "Top 5 customers by revenue:\n1. Customer C1: $45,000\n...",
                "stderr": "",
                "return_code": 0
            }
        },
        {
            "type": "text",
            "text": "I've analyzed the purchase history from last quarter. Your top 5 customers generated $167,500 in total revenue..."
        }
    ],
    "stop_reason": "end_turn"
}
```

## 高级用法

### 用循环做批处理

Claude 能写出高效处理多项数据的代码：

```python
# Claude writes code like this:
regions = ["West", "East", "Central", "North", "South"]
results = {}
for region in regions:
    data = await query_database(f"SELECT SUM(revenue) FROM sales WHERE region='{region}'")
    results[region] = data[0]["total"]

top_region = max(results.items(), key=lambda x: x[1])
print(f"Top region: {top_region[0]} with ${top_region[1]:,}")
```

这种模式：
- 把模型往返次数从 N 次（每个区域一次）降到 1 次
- 在把结果交回 Claude 之前，先以编程方式处理大规模结果集
- 只返回汇总后的结论，从而节省 Token

### 提前终止

Claude 可以在满足成功条件后立即停止处理：

```python
endpoints = ["us-east", "eu-west", "apac"]
for endpoint in endpoints:
    status = await check_health(endpoint)
    if status == "healthy":
        print(f"Found healthy endpoint: {endpoint}")
        break  # Stop early
```

### 数据过滤

```python
logs = await fetch_logs(server_id)
errors = [log for log in logs if "ERROR" in log]
print(f"Found {len(errors)} errors")
for error in errors[-10:]:  # Only return last 10 errors
    print(error)
```

## 最佳实践

### 工具设计

- **把输出描述写详细**：Claude 会在代码中反序列化工具结果，所以要清楚说明返回格式（JSON 结构、字段类型等）
- **返回结构化数据**：JSON 或其他易于解析的格式最适合程序化处理
- **让响应保持精简**：只返回必要的数据，把处理开销降到最低

### 何时使用程序化调用

**适合的场景**：

- 处理大规模数据集，而你只需要聚合值或摘要
- 包含 3 个及以上相互依赖的工具调用的多步骤工作流
- 需要对工具结果做过滤、排序或转换的操作
- 中间数据不应影响 Claude 推理过程的任务
- 跨大量条目的并行操作（例如检查 50 个端点）

**不太适合的场景**：

- 响应简单的单次工具调用
- 需要立即向用户反馈的工具
- 执行极快的操作，此时代码执行的开销会超过收益

## Token 效率

程序化工具调用可以显著降低 Token 消耗：

- **程序化调用产生的工具结果不会进入 Claude 的上下文**——只有最终的代码输出才会
- **中间处理在代码中完成**——过滤、聚合等操作不消耗模型 Token
- **一次代码执行中完成多次工具调用**——相比多次独立的模型轮次，开销更低

例如，直接调用 10 个工具所消耗的 Token 约为程序化调用并返回一份摘要的 10 倍。

## 提供商支持

LiteLLM 在以下兼容 Anthropic 的提供商上支持程序化工具调用：

- **标准 Anthropic API**（`anthropic/{{anthropic}}`）✅
- **Azure Anthropic / Microsoft Foundry**（`azure/{{anthropic}}`）✅
- **Amazon Bedrock**（`bedrock/invoke/anthropic.{{anthropic}}`）✅
- **Google Cloud Vertex AI**（`vertex_ai/{{anthropic}}`）❌ 不支持

当 LiteLLM 检测到带有 `allowed_callers` 字段的工具时，会自动添加 Beta 请求头（`advanced-tool-use-2025-11-20`）。

## 限制

### 功能不兼容项

- **结构化输出**（structured outputs）：带有 `strict: true` 的工具无法配合程序化调用使用
- **工具选择**（tool choice）：无法通过 `tool_choice` 强制以程序化方式调用某个特定工具
- **并行工具调用**（parallel tool use）：不支持在程序化调用中使用 `disable_parallel_tool_use: true`

### 工具限制

以下工具目前无法被程序化调用：

- 网页搜索（Web search）
- 网页抓取（Web fetch）
- MCP 连接器提供的工具

## 故障排查

### 常见问题

**"Tool not allowed" 报错**

- 检查工具定义里是否包含 `"allowed_callers": ["code_execution_20250825"]`
- 确认所用模型兼容（Claude Sonnet 4.5 或 Opus 4.5）

**容器过期**

- 确保在容器存活期内（约 4.5 分钟）响应工具调用
- 考虑缩短工具本身的执行时间

**未添加 Beta 请求头**

- LiteLLM 检测到 `allowed_callers` 时会自动添加 Beta 请求头
- 如果你是手动设置请求头，请确保包含 `advanced-tool-use-2025-11-20`

## 相关功能

- [Anthropic Tool Search](./anthropic_tool_search.md)：按需动态发现并加载工具
- [Anthropic 提供商](./anthropic.md)：Anthropic 提供商的通用文档
