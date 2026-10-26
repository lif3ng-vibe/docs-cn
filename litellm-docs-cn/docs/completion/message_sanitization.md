import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 面向 Anthropic 模型的工具调用消息清洗

**使用工具调用时，通过 `modify_params=True` 自动修复常见的消息格式问题**

LiteLLM 能够自动清洗消息（sanitization），处理工具调用工作流中出现的常见问题，尤其是在将 OpenAI 兼容客户端与消息格式要求严格的提供商（如 Anthropic Claude）搭配使用时。

## 概览

启用 `litellm.modify_params = True` 后，LiteLLM 会自动清洗消息，修复以下三类常见问题：

1. **孤立工具调用**（orphaned tool calls）——助手消息带有 tool_calls，却缺少对应的工具结果
2. **孤立工具结果**（orphaned tool results）——引用了不存在的 tool_call_id 的工具消息
3. **空消息内容**——文本内容为空或仅含空白字符的消息

如此一来，工具调用工作流无需手动校验消息，即可在不同 LLM 提供商之间通用。

## 为什么需要消息清洗？

不同 LLM 提供商对消息格式的要求各不相同，工具调用场景尤甚：

- **Anthropic Claude** 要求每个 tool_call 都必须配有对应的工具结果
- 部分提供商会拒绝内容为空的消息
- OpenAI 兼容客户端未必总能保持消息完全一致

不做清洗的话，这些问题会引发 API 报错、中断工作流。启用 `modify_params=True` 后，这些边界情况都由 LiteLLM 自动处理。

## 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Enable automatic message sanitization
litellm.modify_params = True

# This will work even if messages have formatting issues
response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {"role": "user", "content": "What's the weather in Boston?"},
        {
            "role": "assistant",
            "tool_calls": [
                {
                    "id": "call_123",
                    "type": "function",
                    "function": {"name": "get_weather", "arguments": '{"city": "Boston"}'}
                }
            ]
            # Missing tool result - LiteLLM will add a dummy result automatically
        },
        {"role": "user", "content": "Thanks!"}
    ],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a city",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"]
            }
        }
    }]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  modify_params: true  # Enable automatic message sanitization

model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
```

</TabItem>
</Tabs>

## 清洗场景

### 场景 A：孤立工具调用（缺少工具结果）

**问题**：助手消息里带有 `tool_calls`，但后面没有对应的工具结果消息。

**解决方案**：LiteLLM 会自动为缺失的工具结果补上占位（dummy）工具结果消息。

**示例**：

```python
import litellm
litellm.modify_params = True

# Messages with orphaned tool calls
messages = [
    {"role": "user", "content": "Search for Python tutorials"},
    {
        "role": "assistant",
        "tool_calls": [
            {
                "id": "call_abc123",
                "type": "function",
                "function": {"name": "web_search", "arguments": '{"query": "Python tutorials"}'}
            }
        ]
    },
    # Missing tool result here!
    {"role": "user", "content": "What about JavaScript?"}
]

# LiteLLM automatically adds:
# {
#     "role": "tool",
#     "tool_call_id": "call_abc123",
#     "content": "[System: Tool execution skipped/interrupted by user. No result provided for tool 'web_search'.]"
# }

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=[...]
)
```

**常见触发情形**：
- 用户中断了工具执行
- 客户端因网络问题丢失了工具结果
- 工具还没执行完，对话流程就发生了变化
- 工具本就可选的多轮对话

### 场景 B：孤立工具结果（tool_call_id 无效）

**问题**：某条工具消息引用的 `tool_call_id` 在此前任何助手消息里都不存在。

**解决方案**：LiteLLM 会自动移除这些孤立的工具结果消息。

**示例**：

```python
import litellm
litellm.modify_params = True

# Messages with orphaned tool result
messages = [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"},
    {
        "role": "tool",
        "tool_call_id": "call_nonexistent",  # This tool_call_id doesn't exist!
        "content": "Some result"
    }
]

# LiteLLM automatically removes the orphaned tool message

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=messages
)
```

**常见触发情形**：
- 消息历史被手动编辑过
- 工具结果重复或错配
- 会话状态恢复出错
- 来自不同对话的消息被合并到了一起

### 场景 C：空消息内容

**问题**：用户或助手消息的内容为空或仅含空白字符。

**解决方案**：LiteLLM 会把空内容替换成系统占位消息。

**示例**：

```python
import litellm
litellm.modify_params = True

# Messages with empty content
messages = [
    {"role": "user", "content": ""},  # Empty content
    {"role": "assistant", "content": "   "},  # Whitespace only
]

# LiteLLM automatically replaces with:
# {"role": "user", "content": "[System: Empty message content sanitised to satisfy protocol]"}
# {"role": "assistant", "content": "[System: Empty message content sanitised to satisfy protocol]"}

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=messages
)
```

**常见触发情形**：
- UI 发出了空消息
- 内容在预处理阶段被剥离
- 会话历史中存在占位消息
- 消息构造时的边界情况

## 配置

### 全局启用

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Enable for all completion calls
litellm.modify_params = True
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  modify_params: true
```

</TabItem>
<TabItem value="env" label="环境变量">

```bash
export LITELLM_MODIFY_PARAMS=True
```

</TabItem>
</Tabs>

### 不支持按请求覆盖

清洗只读取全局的 `litellm.modify_params` 标志，通过上述任一方式设置即可生效。`litellm.completion()` 并没有 `modify_params` 这个参数，因此在单次调用里传入 `modify_params=True` 不仅不会启用清洗，还会作为额外的 body 字段转发给提供商——Anthropic 会因此拒绝请求，报 `400 invalid_request_error: modify_params: Extra inputs are not permitted`。

## 支持的提供商

消息清洗目前适用于：

- ✅ Anthropic（Claude）

**注意**：清洗逻辑本身与提供商无关，但目前只在 Anthropic 的消息转换管线中生效。后续版本可能会支持更多提供商。

## 实现细节

### 工作原理

消息清洗在消息被转换为各提供商专属格式**之前**运行：

1. **输入**：可能带问题的 OpenAI 格式消息
2. **清洗**：三个辅助函数依次处理消息：
   - `_sanitize_empty_text_content()`——修复空内容
   - `_add_missing_tool_results()`——补上占位工具结果
   - `_is_orphaned_tool_result()`——识别孤立结果
3. **输出**：干净、符合提供商要求的消息

### 代码位置

清洗逻辑实现在：
- `litellm/litellm_core_utils/prompt_templates/factory.py`
- 函数：`sanitize_messages_for_tool_calling()`

### 日志

发生清洗时，LiteLLM 会输出调试日志：

```python
import litellm
litellm.set_verbose = True  # Enable debug logging

# You'll see logs like:
# "_add_missing_tool_results: Found 1 orphaned tool calls. Adding dummy tool results."
# "_is_orphaned_tool_result: Found orphaned tool result with tool_call_id=call_123"
# "_sanitize_empty_text_content: Replaced empty text content in user message"
```

## 最佳实践

### 1. 在生产工作流中启用

```python
# Recommended for production
litellm.modify_params = True

# Ensures robust handling of edge cases
response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools
)
```

### 2. 尽量保留真实的工具结果

虽然清洗机制能兜底缺失的工具结果，但更好的做法是提供真实结果：

```python
# Good: Provide actual tool results
messages = [
    {"role": "user", "content": "Search for Python"},
    {"role": "assistant", "tool_calls": [...]},
    {"role": "tool", "tool_call_id": "call_123", "content": "Actual search results"}
]

# Fallback: Sanitization adds dummy result if missing
messages = [
    {"role": "user", "content": "Search for Python"},
    {"role": "assistant", "tool_calls": [...]},
    # Missing tool result - sanitization adds dummy
]
```

### 3. 监控清洗事件

借助日志追踪清洗发生的时间点：

```python
import litellm
import logging

# Enable debug logging
litellm.set_verbose = True
logging.basicConfig(level=logging.DEBUG)

# Track sanitization events in your application
response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=messages
)
```

### 4. 测试边界情况

确保你的应用能正确处理清洗后的消息：

```python
import litellm
litellm.modify_params = True

# Test orphaned tool calls
test_messages = [
    {"role": "user", "content": "Test"},
    {"role": "assistant", "tool_calls": [{"id": "call_1", "type": "function", "function": {"name": "test", "arguments": "{}"}}]},
    {"role": "user", "content": "Continue"}  # No tool result
]

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=test_messages,
    tools=[...]
)

# Verify the response handles the dummy tool result appropriately
```

## 相关功能

- **[丢弃参数](./drop_params.md)**——丢弃特定提供商不支持的参数
- **[消息裁剪](./message_trimming.md)**——裁剪消息以适配 token 限制
- **[函数调用](./function_call.md)**——工具调用与函数调用完整指南
- **[推理内容](../reasoning_content.md)**——工具调用场景下的扩展思考

## 故障排查

### 清洗未生效

**问题**：已设置 `modify_params=True`，消息仍然报错

**解决方案**：
1. 确认 `modify_params` 已启用：
   ```python
   import litellm
   print(litellm.modify_params)  # Should be True
   ```

2. 检查问题是否由特定提供商引起：
   ```python
   litellm.set_verbose = True  # Enable debug logging
   ```

3. 确保你使用的是较新版本的 LiteLLM：
   ```bash
   uv add --upgrade-package litellm litellm
   ```

### 出现意外的占位工具结果

**问题**：期待真实结果，却出现了占位工具结果

**原因**：工具结果消息缺失，或 `tool_call_id` 不正确

**解决方案**：
1. 确认工具结果消息的 `tool_call_id` 正确无误：
   ```python
   # Correct
   {"role": "tool", "tool_call_id": "call_123", "content": "result"}

   # Incorrect - will be treated as orphaned
   {"role": "tool", "tool_call_id": "wrong_id", "content": "result"}
   ```

2. 确保工具结果紧跟在带有 tool_calls 的助手消息之后

### 性能影响

**问题**：担心性能开销

**说明**：消息清洗对性能的影响极小：
- 以 O(n) 复杂度运行，n 为消息数量
- 只在 `modify_params=True` 时才处理消息
- 通常为请求处理增加的时间不到 1 毫秒

## 常见问题

**问：清洗会修改我的原始消息吗？**

答：不会。清洗会创建一个新的消息列表，原始消息保持不变。

**问：可以只禁用某一种清洗场景吗？**

答：目前三类场景在 `modify_params=True` 时会被一并处理。要完全关闭清洗，设置 `modify_params=False` 即可。

**问：占位工具结果会怎样处理？**

答：占位工具结果会随其他消息一起发送给 LLM 提供商。模型会将其视为普通工具结果，只是内容是一条说明性的错误信息。

**问：流式请求下也能用吗？**

答：可以。消息清洗对流式与非流式请求均有效。

**问：这和 `drop_params` 有关吗？**

答：无关，二者是相互独立的功能：
- `modify_params`——修改/修复消息的内容与结构
- `drop_params`——移除不支持的 API 参数

两者可以同时启用。

## 延伸阅读

- [工具调用中的推理内容](../reasoning_content.md)
- [函数调用指南](./function_call.md)
- [Bedrock 提供商文档](../providers/bedrock.md)
- [Anthropic 提供商文档](../providers/anthropic.md)
