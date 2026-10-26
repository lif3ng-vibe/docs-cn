import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# "思考" / "推理内容"

:::info

需要 LiteLLM v1.63.0+

:::

支持的提供商：
- Deepseek (`deepseek/`)
- Anthropic API (`anthropic/`)
- Bedrock (Anthropic + Deepseek + GPT-OSS) (`bedrock/`)
- OpenAI Responses API (`openai/responses/`)
- Vertex AI (Anthropic) (`vertexai/`)
- OpenRouter (`openrouter/`)
- XAI (`xai/`)
- Google AI Studio (`google/`)
- Vertex AI (`vertex_ai/`)
- Perplexity (`perplexity/`)
- Mistral AI (Magistral models) (`mistral/`)
- Groq (`groq/`)

LiteLLM 会把响应中的 `reasoning_content` 与 assistant 消息中的 `thinking_blocks` 标准化为统一格式。

```python nolint title="Example response from litellm"
"message": {
    ...
    "reasoning_content": "The capital of France is Paris.",
    "thinking_blocks": [ # only returned for Anthropic models
        {
            "type": "thinking",
            "thinking": "The capital of France is Paris.",
            "signature": "EqoBCkgIARABGAIiQL2UoU0b1OHYi+..."
        }
    ]
}
```

## 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion
import os 

os.environ["ANTHROPIC_API_KEY"] = ""

response = completion(
  model="anthropic/{{anthropic}}",
  messages=[
    {"role": "user", "content": "What is the capital of France?"},
  ],
  reasoning_effort="low", 
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "anthropic/{{anthropic}}",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ],
    "reasoning_effort": "low"
  }'
```
</TabItem>
</Tabs>

**预期响应**

```bash
{
    "id": "3b66124d79a708e10c603496b363574c",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": " won the FIFA World Cup in 2022.",
                "role": "assistant",
                "tool_calls": null,
                "function_call": null
            }
        }
    ],
    "created": 1723323084,
    "model": "deepseek/deepseek-chat",
    "object": "chat.completion",
    "system_fingerprint": "fp_7e0991cad4",
    "usage": {
        "completion_tokens": 12,
        "prompt_tokens": 16,
        "total_tokens": 28,
    },
    "service_tier": null
}
```

## 配合 `thinking` 进行工具调用

下面展示如何在 Anthropic 模型上把 `thinking` 块与工具调用搭配使用。

### 重要：OpenAI 兼容 API 的限制

:::warning[兼容性说明]

Anthropic 的扩展思考（extended thinking）加上工具调用，与 OpenAI 兼容的 API 客户端**并不能完全兼容**。根源在于 OpenAI 与 Anthropic 处理多轮对话推理信息的方式存在本质上的架构差异。

:::

在启用 `thinking` 的 Anthropic 模型上进行工具调用时，把工具结果发回去之前，**必须带上上一条 assistant 响应中的 `thinking_blocks`**，否则会收到 `400 Bad Request` 错误。

**OpenAI 与 Anthropic 的架构对比**：

| 提供商 | API 架构 | 推理存储位置 | 多轮对话处理方式 |
|----------|------------------|-------------------|---------------------|
| **OpenAI**（o1、o3） | Responses API（有状态） | 服务端 | 服务端在内部保存推理信息；客户端只需发送 `previous_response_id` |
| **Anthropic**（Claude） | Messages API（无状态） | 客户端 | 客户端必须在每次请求中保存并重发 `thinking_blocks` |


1. OpenAI 的 Chat Completions 规范里**没有**承载 `thinking_blocks` 的字段
2. OpenAI 兼容客户端（LibreChat、Open WebUI、Vercel AI SDK 等）会**忽略**响应中的 `thinking_blocks` 字段
3. 这些客户端在为下一轮重构 assistant 消息时，thinking 块就丢失了
4. Anthropic 会拒绝该请求，因为 assistant 消息没有以 thinking 块开头

:::tip[LiteLLM 支持 thinking_blocks]
LiteLLM 的 `completion()` API **支持**在 assistant 消息中发送 `thinking_blocks`。如果你直接使用 LiteLLM（而不是经由某个 OpenAI 兼容客户端），可以自行保存并重发 `thinking_blocks`，一切都会正常工作。
:::

**解决方案**：

1. **使用 LiteLLM 内置的规避机制**（推荐）：设置 `litellm.modify_params = True`，当 `thinking_blocks` 缺失时，LiteLLM 会自动丢弃 `thinking` 参数来化解这一不兼容问题（见下文）
2. **面向客户端开发者**：显式处理并重发 `thinking_blocks` 字段（见下方示例）
3. 在不支持 `thinking_blocks` 的 OpenAI 兼容客户端上使用工具时，**关闭扩展思考**
4. 直接**使用 Anthropic 原生 API**，而不是走 OpenAI 兼容端点

### LiteLLM 内置的规避方案

设置 `modify_params=True` 后，LiteLLM 即可自动处理这一不兼容问题。当客户端发来的请求开启了 `thinking`，但带 `tool_calls` 的 assistant 消息缺少 `thinking_blocks` 时，LiteLLM 会自动为该轮丢弃 `thinking` 参数，从而避免报错。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
import litellm

# Enable automatic parameter modification
litellm.modify_params = True

# Now this will work even if thinking_blocks are missing from the assistant message
response = litellm.completion(
    model="anthropic/{{anthropic}}",
    thinking={"type": "enabled", "budget_tokens": 1024},
    tools=[...],
    messages=[
        {"role": "user", "content": "What's the weather in Madrid?"},
        {
            "role": "assistant",
            "tool_calls": [{"id": "call_123", "type": "function", "function": {"name": "get_weather", "arguments": '{"city": "Madrid"}'}}]
            # Note: thinking_blocks is missing here - LiteLLM will handle it
        },
        {"role": "tool", "tool_call_id": "call_123", "content": "22°C sunny"}
    ]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  modify_params: true  # Enable automatic parameter modification

model_list:
  - model_name: claude-thinking
    litellm_params:
      model: anthropic/{{anthropic}}
      thinking:
        type: enabled
        budget_tokens: 1024
```

</TabItem>
</Tabs>

:::info
当 `modify_params=True` 且 LiteLLM 丢弃了 `thinking` 参数时，模型在那一轮**不会**使用扩展思考。对话会照常继续，只是该次响应没有推理过程。
:::

**`thinking_blocks` 的正确携带方式**：

```python
# After receiving a response with tool_calls, include thinking_blocks when sending back:
assistant_message = {
    "role": "assistant",
    "content": response.choices[0].message.content,
    "tool_calls": [...],
    "thinking_blocks": response.choices[0].message.thinking_blocks  # ← Required!
}
```

---

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
litellm._turn_on_debug()
litellm.modify_params = True
model = "anthropic/{{anthropic}}" # works across Anthropic, Bedrock, Vertex AI
# Step 1: send the conversation and available functions to the model
messages = [
    {
        "role": "user",
        "content": "What's the weather like in San Francisco, Tokyo, and Paris? - give me 3 responses",
    }
]
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                    },
                },
                "required": ["location"],
            },
        },
    }
]
response = litellm.completion(
    model=model,
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
    reasoning_effort="low",
)
print("Response\n", response)
response_message = response.choices[0].message
tool_calls = response_message.tool_calls

print("Expecting there to be 3 tool calls")
assert (
    len(tool_calls) > 0
)  # this has to call the function for SF, Tokyo and paris

# Step 2: check if the model wanted to call a function
print(f"tool_calls: {tool_calls}")
if tool_calls:
    # Step 3: call the function
    # Note: the JSON response may not always be valid; be sure to handle errors
    available_functions = {
        "get_current_weather": get_current_weather,
    }  # only one function in this example, but you can have multiple
    messages.append(
        response_message
    )  # extend conversation with assistant's reply
    print("Response message\n", response_message)
    # Step 4: send the info for each function call and function response to the model
    for tool_call in tool_calls:
        function_name = tool_call.function.name
        if function_name not in available_functions:
            # the model called a function that does not exist in available_functions - don't try calling anything
            return
        function_to_call = available_functions[function_name]
        function_args = json.loads(tool_call.function.arguments)
        function_response = function_to_call(
            location=function_args.get("location"),
            unit=function_args.get("unit"),
        )
        messages.append(
            {
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": function_response,
            }
        )  # extend conversation with function response
    print(f"messages: {messages}")
    second_response = litellm.completion(
        model=model,
        messages=messages,
        seed=22,
        reasoning_effort="low",
        # tools=tools,
        drop_params=True,
    )  # get a new response from the model where it can see the function response
    print("second response\n", second_response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: claude-3-7-sonnet-thinking
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      thinking: {
        "type": "enabled",
        "budget_tokens": 1024
      }
```

2. 启动代理

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 发起第一次调用

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-3-7-sonnet-thinking",
    "messages": [
      {"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris? - give me 3 responses"},
    ],
    "tools": [
        {
          "type": "function",
          "function": {
              "name": "get_current_weather",
              "description": "Get the current weather in a given location",
              "parameters": {
                  "type": "object",
                  "properties": {
                      "location": {
                          "type": "string",
                          "description": "The city and state",
                      },
                      "unit": {
                          "type": "string",
                          "enum": ["celsius", "fahrenheit"],
                      },
                  },
                  "required": ["location"],
              },
          },
        }
    ],
    "tool_choice": "auto"
  }'
```

4. 携带工具调用结果发起第二次调用

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-3-7-sonnet-thinking",
    "messages": [
      {
        "role": "user",
        "content": "What\'s the weather like in San Francisco, Tokyo, and Paris? - give me 3 responses"
      },
      {
        "role": "assistant",
        "content": "I\'ll check the current weather for these three cities for you:",
        "tool_calls": [
          {
            "index": 2,
            "function": {
              "arguments": "{\"location\": \"San Francisco\"}",
              "name": "get_current_weather"
            },
            "id": "tooluse_mnqzmtWYRjCxUInuAdK7-w",
            "type": "function"
          }
        ],
        "function_call": null,
        "reasoning_content": "The user is asking for the current weather in three different locations: San Francisco, Tokyo, and Paris. I have access to the `get_current_weather` function that can provide this information.\n\nThe function requires a `location` parameter, and has an optional `unit` parameter. The user hasn't specified which unit they prefer (celsius or fahrenheit), so I'll use the default provided by the function.\n\nI need to make three separate function calls, one for each location:\n1. San Francisco\n2. Tokyo\n3. Paris\n\nThen I'll compile the results into a response with three distinct weather reports as requested by the user.",
        "thinking_blocks": [
          {
            "type": "thinking",
            "thinking": "The user is asking for the current weather in three different locations: San Francisco, Tokyo, and Paris. I have access to the `get_current_weather` function that can provide this information.\n\nThe function requires a `location` parameter, and has an optional `unit` parameter. The user hasn't specified which unit they prefer (celsius or fahrenheit), so I'll use the default provided by the function.\n\nI need to make three separate function calls, one for each location:\n1. San Francisco\n2. Tokyo\n3. Paris\n\nThen I'll compile the results into a response with three distinct weather reports as requested by the user.",
            "signature": "EqoBCkgIARABGAIiQCkBXENoyB+HstUOs/iGjG+bvDbIQRrxPsPpOSt5yDxX6iulZ/4K/w9Rt4J5Nb2+3XUYsyOH+CpZMfADYvItFR4SDPb7CmzoGKoolCMAJRoM62p1ZRASZhrD3swqIjAVY7vOAFWKZyPEJglfX/60+bJphN9W1wXR6rWrqn3MwUbQ5Mb/pnpeb10HMploRgUqEGKOd6fRKTkUoNDuAnPb55c="
          }
        ],
        "provider_specific_fields": {
          "reasoningContentBlocks": [
            {
              "reasoningText": {
                "signature": "EqoBCkgIARABGAIiQCkBXENoyB+HstUOs/iGjG+bvDbIQRrxPsPpOSt5yDxX6iulZ/4K/w9Rt4J5Nb2+3XUYsyOH+CpZMfADYvItFR4SDPb7CmzoGKoolCMAJRoM62p1ZRASZhrD3swqIjAVY7vOAFWKZyPEJglfX/60+bJphN9W1wXR6rWrqn3MwUbQ5Mb/pnpeb10HMploRgUqEGKOd6fRKTkUoNDuAnPb55c=",
                "text": "The user is asking for the current weather in three different locations: San Francisco, Tokyo, and Paris. I have access to the `get_current_weather` function that can provide this information.\n\nThe function requires a `location` parameter, and has an optional `unit` parameter. The user hasn't specified which unit they prefer (celsius or fahrenheit), so I'll use the default provided by the function.\n\nI need to make three separate function calls, one for each location:\n1. San Francisco\n2. Tokyo\n3. Paris\n\nThen I'll compile the results into a response with three distinct weather reports as requested by the user."
              }
            }
          ]
        }
      },
      {
        "tool_call_id": "tooluse_mnqzmtWYRjCxUInuAdK7-w",
        "role": "tool",
        "name": "get_current_weather",
        "content": "{\"location\": \"San Francisco\", \"temperature\": \"72\", \"unit\": \"fahrenheit\"}"
      }
    ]
  }'
```

</TabItem>
</Tabs>

## 在 Anthropic 与 Deepseek 模型之间切换

从 Anthropic 模型切到 Deepseek 模型时，设置 `drop_params=True` 即可丢弃 'thinking' 块。对这个方案有改进建议，欢迎[在此](https://github.com/BerriAI/litellm/discussions/8927)提出。

```python showLineNumbers
litellm.drop_params = True # 👈 EITHER GLOBALLY or per request

# or per request
## Anthropic
response = litellm.completion(
  model="anthropic/{{anthropic}}",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  reasoning_effort="low",
  drop_params=True,
)

## Deepseek
response = litellm.completion(
  model="deepseek/deepseek-chat",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  reasoning_effort="low",
  drop_params=True,
)
```

## 字段规格


这些字段可通过 `response.choices[0].message.reasoning_content` 与 `response.choices[0].message.thinking_blocks` 访问。

- `reasoning_content` - str：模型给出的推理内容。所有提供商均会返回。
- `thinking_blocks` - Optional[List[Dict[str, str]]]：模型返回的 thinking 块列表。仅在 Anthropic 模型上返回。
  - `type` - str：thinking 块的类型。
  - `thinking` - str：模型的思考内容。
  - `signature` - str：模型返回的签名增量。



## 向 Anthropic 模型传递 `thinking`

你也可以把 `thinking` 参数直接传给 Anthropic 模型。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
response = litellm.completion(
  model="anthropic/{{anthropic}}",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 1024},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "anthropic/{{anthropic}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>

## Responses API 上的推理

`/v1/responses` 接受 OpenAI 的 `reasoning` 对象，并由 LiteLLM 翻译成目标模型各自需要的形式。Claude 模型在 LiteLLM 提供服务的所有路由上（`anthropic/`、`bedrock/`、`vertex_ai/`、`azure_ai/`）都接受这一参数，因此无论模型背后接的是哪家提供商，同一种请求写法都能控制推理深度。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
response = litellm.responses(
  model="vertex_ai/{{anthropic_large}}",
  input="How many prime numbers are less than 30?",
  reasoning={"effort": "low"},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash showLineNumbers
curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "{{anthropic_large}}",
    "input": "How many prime numbers are less than 30?",
    "reasoning": {"effort": "low"}
  }'
```

</TabItem>
</Tabs>

Anthropic 在 Claude 4.6 中改变了 thinking 的配置方式，因此转换逻辑取决于你调用的是哪个模型。LiteLLM 依据模型的 `supports_adaptive_thinking` 能力标记而非模型名称来判断，你自己的代码完全不必为此写分支。

Claude 4.6 及更新版本（Sonnet 4.6、Opus 4.7、Opus 4.8）采用自适应思考（adaptive thinking），effort 级别会随之一并下发：

```json title="what LiteLLM sends for reasoning.effort = low"
{"thinking": {"type": "adaptive"}, "output_config": {"effort": "low"}}
```

在这种形式下，`minimal` 会折叠成 `low`；其余级别原样透传。更早的 Claude 模型则改用传统的 token 预算形式 `{"thinking": {"type": "enabled", "budget_tokens": N}}`，预算大小由 effort 级别决定：

| `reasoning.effort` | `budget_tokens` |
| --- | --- |
| `minimal` | 1024 |
| `low` | 1024 |
| `medium` | 2048 |
| `high` | 4096 |
| `xhigh` | 8192 |
| `max` | 16384 |

每个预算都可以通过对应的 `DEFAULT_REASONING_EFFORT_*_THINKING_BUDGET` 环境变量覆盖；`{"effort": "none"}` 则在两种形式下都会彻底关闭思考。

如果你更想自己设置 Anthropic 的原生参数，在请求体里直接传 `thinking` 和 `output_config` 即可，LiteLLM 会原样转发。

```bash showLineNumbers
curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "{{anthropic_large}}",
    "input": "How many prime numbers are less than 30?",
    "thinking": {"type": "adaptive"},
    "output_config": {"effort": "high"}
  }'
```

:::info

Claude 4.6+ 会以 `400 "thinking.type.enabled" is not supported for this model. Use "thinking.type.adaptive" and "output_config.effort" to control thinking behavior.` 的报错拒绝传统形式。LiteLLM 只对模型映射中已知支持自适应思考的模型发出新形式，所以撞上这个报错通常说明模型比你的 LiteLLM 安装版本更新。经 Bedrock、Vertex AI 或 Azure AI 路由的 Opus 4.8 需要 v1.89.0 及以上版本（[PR #29702](https://github.com/BerriAI/litellm/pull/29702)）

:::

## 检查模型是否支持推理

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

使用 `litellm.supports_reasoning(model="")`：模型支持推理时返回 `True`，不支持则返回 `False`。

```python showLineNumbers title="litellm.supports_reasoning() usage"
import litellm 

# Example models that support reasoning
assert litellm.supports_reasoning(model="anthropic/{{anthropic}}") == True
assert litellm.supports_reasoning(model="deepseek/deepseek-chat") == True 

# Example models that do not support reasoning
assert litellm.supports_reasoning(model="openai/gpt-4.1") == False 
```
</TabItem>

<TabItem label="LiteLLM Proxy Server" value="proxy">

1. 在 `config.yaml` 中定义支持推理的模型。如果是自定义模型而 LiteLLM 未能自动识别，可以在 `model_info` 里手动加上 `supports_reasoning: True`。

```yaml showLineNumbers title="litellm proxy config.yaml"
model_list:
  - model_name: claude-3-sonnet-reasoning
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: deepseek-reasoning
    litellm_params:
      model: deepseek/deepseek-chat
      api_key: os.environ/DEEPSEEK_API_KEY
  # Example for a custom model where detection might be needed
  - model_name: my-custom-reasoning-model 
    litellm_params:
      model: openai/my-custom-model # Assuming it's OpenAI compatible
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_reasoning: True # Explicitly mark as supporting reasoning
```

2. 启动代理服务器：

```bash showLineNumbers title="litellm --config config.yaml"
litellm --config config.yaml
```

3. 调用 `/model_group/info` 检查你的模型是否支持 `reasoning`

```shell showLineNumbers title="curl /model_group/info"
curl -X 'GET' \
  'http://localhost:4000/model_group/info' \
  -H 'accept: application/json' \
  -H "x-api-key: $LITELLM_API_KEY"
```

预期响应 

```json showLineNumbers title="response from /model_group/info"
{
  "data": [
    {
      "model_group": "claude-3-sonnet-reasoning",
      "providers": ["anthropic"],
      "mode": "chat",
      "supports_reasoning": true
    },
    {
      "model_group": "deepseek-reasoning",
      "providers": ["deepseek"],
      "supports_reasoning": true
    },
    {
      "model_group": "my-custom-reasoning-model",
      "providers": ["openai"],
      "supports_reasoning": true
    }
  ]
}
````


</TabItem>
</Tabs>

:::tip[gpt-5.4：reasoning_effort 与函数工具]

当发往 `litellm.completion()` 的 `gpt-5.4+` 请求同时带上 `reasoning_effort` 和 `tools` 时，LiteLLM 会**自动把请求路由**到 Responses API 桥接。这对 **OpenAI**（`openai/gpt-5.4`）与 **Azure**（`azure/gpt-5.4`）两类提供商都适用，无需额外配置。

也可以通过 `openai/responses/gpt-5.4` 或 `azure/responses/gpt-5.4` 显式走这条路由。详见 [Responses API 桥接](/docs/providers/openai#openai-对话补全到-responses-api-的桥接)。

**Azure 自定义部署名**：自动路由依赖部署名匹配 `gpt-5.4*` 模式。如果你用的是自定义部署名（例如 `"my-reasoning-model"`），请通过以下方式启用路由：

**SDK**：
```python
litellm.completion(model="azure/responses/my-reasoning-model")  # ...
```

**代理配置**：
```yaml
model_list:
  - model_name: my-reasoning-model
    litellm_params:
      model: azure/my-reasoning-model
    model_info:
      mode: responses
```

:::

## OpenAI Responses API 的自动摘要控制

通过 `/chat/completions` 配合 `reasoning_effort` 使用 OpenAI Responses API 模型（如 `{{openai_large}}`）时，你可以控制是否把 `summary="detailed"` 自动附加到 reasoning 参数上。

### 启用自动摘要

有两种方式可以启用自动附加 `summary="detailed"`：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Enable auto-summary globally
litellm.reasoning_auto_summary = True

response = litellm.completion(
    model="openai/responses/{{openai_small}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",  # Will automatically add summary="detailed"
)
```

</TabItem>

<TabItem value="env" label="环境变量">

```bash
# Set environment variable
export LITELLM_REASONING_AUTO_SUMMARY=true

# Or in your .env file
LITELLM_REASONING_AUTO_SUMMARY=true
```

</TabItem>

<TabItem value="proxy" label="代理配置">

```yaml
litellm_settings:
  reasoning_auto_summary: true  # Enable auto-summary for all requests

model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/responses/{{openai_small}}
```

**按模型配置**（使用 Open WebUI 或无法设置 `extra_body` 的客户端时推荐）：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      # String format - uses reasoning_auto_summary for summary when set
      reasoning_effort: "high"
    model_info:
      mode: responses  # if using Responses API bridge

  - model_name: gpt-5.6-terra-with-summary
    litellm_params:
      model: openai/{{openai_large}}
      # Dict format - explicit control over effort and summary
      reasoning_effort: {"effort": "high", "summary": "detailed"}
```

</TabItem>
</Tabs>

### 手动控制（推荐）

如需更细粒度的控制，可将 `reasoning_effort` 以字典形式传入：

```python
response = litellm.completion(
    model="openai/responses/{{openai_small}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort={"effort": "low", "summary": "detailed"},  # Explicit control
)
```

### 通过 `/v1/messages` 适配器保留摘要

用 Anthropic 的 `/v1/messages` 适配器路由非 Claude 模型（例如 `openai/{{openai_large}}`）时，`thinking.summary` 的取值会被保留并转发给下游提供商。例如：

```python
import litellm

response = await litellm.anthropic.messages.acreate(
    model="openai/{{openai_large}}",
    messages=[{"role": "user", "content": "Hello"}],
    max_tokens=8096,
    thinking={"type": "enabled", "budget_tokens": 5000, "summary": "concise"},
)
# The summary="concise" is preserved when routing to OpenAI's Responses API
```

### 为 `/v1/messages` 适配器启用默认摘要注入

当 Anthropic 的 `/v1/messages` 适配器为非 Claude 模型把 `thinking` 参数转换成 OpenAI 的 `reasoning_effort` 时，你可以通过 `reasoning_auto_summary` 开关选择开启自动注入 `summary="detailed"`。这样响应中就会带回推理文本（与 Anthropic 的 thinking 行为保持一致）。

要**启用**这一默认注入，使用 `reasoning_auto_summary` 开关：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Enable default summary="detailed" injection
litellm.reasoning_auto_summary = True

response = await litellm.anthropic.messages.acreate(
    model="openai/{{openai_large}}",
    messages=[{"role": "user", "content": "Hello"}],
    max_tokens=8096,
    thinking={"type": "enabled", "budget_tokens": 5000},
)
# summary="detailed" will be automatically added to reasoning_effort
```

</TabItem>

<TabItem value="env" label="环境变量">

```bash
export LITELLM_REASONING_AUTO_SUMMARY=true
```

</TabItem>

<TabItem value="proxy" label="代理配置">

```yaml
litellm_settings:
  reasoning_auto_summary: true
```

</TabItem>
</Tabs>

:::info

该开关只影响用户未提供 summary 时的自动注入 `summary="detailed"`。如果你显式传了 `thinking.summary`（例如 `"concise"` 或 `"auto"`），无论开关状态如何，你的取值始终会被保留。

:::
