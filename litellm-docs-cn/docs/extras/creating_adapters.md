# 以自定义格式调用任意 LiteLLM 模型

用自定义格式调用任意 LiteLLM 支持的 `.completion()` 模型。如果你有一套自定义 API，又想让它支持所有 LiteLLM 兼容的模型，这个功能正好派上用场。

## 工作原理

你的请求 → 适配器（adapter）转换为 OpenAI 格式 → LiteLLM 处理 → 适配器把响应转换回来 → 返回给你的响应

## 创建适配器

继承 `CustomLogger` 并实现 3 个方法：

```python
from litellm.integrations.custom_logger import CustomLogger
from litellm.types.llms.openai import ChatCompletionRequest
from litellm.types.utils import ModelResponse

class MyAdapter(CustomLogger):
    def translate_completion_input_params(self, kwargs) -> ChatCompletionRequest:
        """Convert your format → OpenAI format"""
        # Example: Anthropic to OpenAI
        return {
            "model": kwargs["model"],
            "messages": self._convert_messages(kwargs["messages"]),
            "max_tokens": kwargs.get("max_tokens"),
        }

    def translate_completion_output_params(self, response: ModelResponse):
        """Convert OpenAI format → your format"""
        # Return your provider's response format
        return MyProviderResponse(
            id=response.id,
            content=response.choices[0].message.content,
            usage=response.usage,
        )

    def translate_completion_output_params_streaming(self, completion_stream):
        """Handle streaming responses"""
        return MyStreamWrapper(completion_stream)
```

## 注册

```python
import litellm

my_adapter = MyAdapter()
litellm.adapters = [{"id": "my_provider", "adapter": my_adapter}]
```

## 使用

```python
from litellm import adapter_completion

# Now you can use your provider's format with any LiteLLM model
response = adapter_completion(
    adapter_id="my_provider",
    model="{{openai_large}}",  # or any LiteLLM model
    messages=[{"role": "user", "content": "hello"}],
    max_tokens=100
)
```

### 流式

```python
stream = adapter_completion(
    adapter_id="my_provider",
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "hello"}],
    stream=True
)

for chunk in stream:
    print(chunk)
```

### 异步

```python
from litellm import aadapter_completion

response = await aadapter_completion(
    adapter_id="my_provider",
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "hello"}]
)
```

## 示例：Anthropic 适配器

下面是我们转换 Anthropic 格式的方式：

### 输入转换

```python
def translate_completion_input_params(self, kwargs):
    model = kwargs.pop("model")
    messages = kwargs.pop("messages")
    
    # Convert Anthropic messages to OpenAI format
    openai_messages = []
    for msg in messages:
        if msg["role"] == "user":
            openai_messages.append({
                "role": "user",
                "content": msg["content"]
            })
    
    # Handle system message
    if "system" in kwargs:
        openai_messages.insert(0, {
            "role": "system",
            "content": kwargs.pop("system")
        })
    
    return {
        "model": model,
        "messages": openai_messages,
        **kwargs  # pass through other params
    }
```

### 输出转换

```python
def translate_completion_output_params(self, response):
    return AnthropicResponse(
        id=response.id,
        type="message",
        role="assistant",
        content=[{
            "type": "text",
            "text": response.choices[0].message.content
        }],
        usage={
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens
        }
    )
```

### 流式

```python
from litellm.types.utils import AdapterCompletionStreamWrapper

class AnthropicStreamWrapper(AdapterCompletionStreamWrapper):
    def __init__(self, completion_stream, model):
        super().__init__(completion_stream)
        self.model = model
        self.first_chunk = True
    
    async def __anext__(self):
        # First chunk
        if self.first_chunk:
            self.first_chunk = False
            return {"type": "message_start", "message": {...}}
        
        # Stream chunks
        async for chunk in self.completion_stream:
            return {
                "type": "content_block_delta",
                "delta": {"text": chunk.choices[0].delta.content}
            }
        
        # Last chunk
        return {"type": "message_stop"}

def translate_completion_output_params_streaming(self, stream, model):
    return AnthropicStreamWrapper(stream, model)
```

## 配合 Proxy 使用

添加到你的代理配置中：

```yaml
general_settings:
  pass_through_endpoints:
    - path: "/v1/messages"
      target: "my_module.MyAdapter"
```

然后调用：

```bash
curl http://localhost:4000/v1/messages \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{"model": "{{openai_large}}", "messages": [...]}'
```

## 实际案例

完整的 Anthropic 适配器实现见：

- [transformation.py](https://github.com/BerriAI/litellm/blob/main/litellm/llms/anthropic/experimental_pass_through/adapters/transformation.py)
- [handler.py](https://github.com/BerriAI/litellm/blob/main/litellm/llms/anthropic/experimental_pass_through/adapters/handler.py)
- [streaming_iterator.py](https://github.com/BerriAI/litellm/blob/main/litellm/llms/anthropic/experimental_pass_through/adapters/streaming_iterator.py)

## 总结

1. 创建一个继承 `CustomLogger` 的类
2. 实现 3 个转换方法
3. 通过 `litellm.adapters = [{"id": "...", "adapter": ...}]` 注册
4. 用 `adapter_completion(adapter_id="...")` 调用
