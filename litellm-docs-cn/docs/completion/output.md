# 输出

## 格式
以下是 litellm `completion` 对所有模型调用返回的 JSON 输出与类型的完整结构。

```python 
{
  'choices': [
    {
      'finish_reason': str,     # String: 'stop'
      'index': int,             # Integer: 0
      'message': {              # Dictionary [str, str]
        'role': str,            # String: 'assistant'
        'content': str          # String: "default message"
      }
    }
  ],
  'created': str,               # String: None
  'model': str,                 # String: None
  'usage': {                    # Dictionary [str, int]
    'prompt_tokens': int,       # Integer
    'completion_tokens': int,   # Integer
    'total_tokens': int         # Integer
  }
}

```

与 OpenAI 一样，响应既可以按字典访问，也可以按类对象访问。
```python
print(response.choices[0].message.content)
print(response['choices'][0]['message']['content'])
```

一个示例响应大致如下：
```python
{
  'choices': [
     {
        'finish_reason': 'stop',
        'index': 0,
        'message': {
           'role': 'assistant',
            'content': " I'm doing well, thank you for asking. I am Claude, an AI assistant created by Anthropic."
        }
      }
    ],
 'created': 1691429984.3852863,
 'model': '{{anthropic}}',
 'usage': {'prompt_tokens': 18, 'completion_tokens': 23, 'total_tokens': 41}
}
```

## 原生结束原因

LiteLLM 会把各提供商特有的 `finish_reason` 取值统一映射为 OpenAI 兼容取值（`stop`、`length`、`tool_calls`、`function_call`、`content_filter`）。当提供商的原始取值与映射后的取值不同时，原始值会保留在 `provider_specific_fields["native_finish_reason"]` 中。

对于需要区分不同停止条件的智能体循环（agent loop）来说，这一点很有用（例如 Gemini 的 `MALFORMED_FUNCTION_CALL` 与正常的 `stop`）。

```python
response = completion(model="gemini/{{gemini_flash}}", messages=messages)

choice = response.choices[0]
print(choice.finish_reason)  # "stop" (OpenAI-compatible)

# Access the original provider value when it differs:
if hasattr(choice, "provider_specific_fields") and choice.provider_specific_fields:
    native = choice.provider_specific_fields.get("native_finish_reason")
    if native == "MALFORMED_FUNCTION_CALL":
        # Handle malformed function call differently from a normal stop
        pass
```

如果提供商本身就返回 OpenAI 兼容取值（如 `stop`），则不会设置 `native_finish_reason`。

## 附加属性

你还可以访问延迟（latency）之类的信息。

```python
from litellm import completion
import os
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages=[{"role": "user", "content": "Hey!"}]

response = completion(model="{{anthropic}}", messages=messages)

print(response.response_ms) # 616.25# 616.25
```
