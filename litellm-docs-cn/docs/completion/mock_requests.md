# Mock Completion() 响应——节省测试成本

做测试时，可以用 `completion()` 加上 `mock_response` 来模拟对补全端点的调用。

它会直接返回一个带默认内容的响应对象（流式请求同样适用），而不会真正调用 LLM API。

## 快速上手

```python
from litellm import completion 

model = "{{openai_small}}"
messages = [{"role":"user", "content":"This is a test request"}]

completion(model=model, messages=messages, mock_response="It's simple to use and easy to get started")
```

## 流式

```python
from litellm import completion 
model = "{{openai_small}}"
messages = [{"role": "user", "content": "Hey, I'm a mock request"}]
response = completion(model=model, messages=messages, stream=True, mock_response="It's simple to use and easy to get started")
for chunk in response: 
    print(chunk) # {'choices': [{'delta': {'role': 'assistant', 'content': 'Thi'}, 'finish_reason': None}]}
    complete_response += chunk["choices"][0]["delta"]["content"]
```

## 非流式 Mock 响应对象

```json
{
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "This is a mock request",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "created": 1694459929.4496052,
  "model": "MockResponse",
  "usage": {
    "prompt_tokens": null,
    "completion_tokens": null,
    "total_tokens": null
  }
}
```

## 使用 `completion` 与 `mock_response` 构建 pytest 函数

```python
from litellm import completion
import pytest

def test_completion_openai():
    try:
        response = completion(
            model="{{openai_small}}",
            messages=[{"role":"user", "content":"Why is LiteLLM amazing?"}],
            mock_response="LiteLLM is awesome"
        )
        # Add any assertions here to check the response
        print(response)
        assert(response['choices'][0]['message']['content'] == "LiteLLM is awesome")
    except Exception as e:
        pytest.fail(f"Error occurred: {e}")
```
