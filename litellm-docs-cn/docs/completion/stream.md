import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 流式与异步

| 功能 | LiteLLM SDK | LiteLLM Proxy |
|---------|-------------|---------------|
| 流式 | ✅ [从这里开始](#流式响应) | ✅ [从这里开始](../proxy/user_keys#流式) |
| 异步 | ✅ [从这里开始](#异步补全) | ✅ [从这里开始](../proxy/user_keys#流式) |
| 异步流式 | ✅ [从这里开始](#异步流式) | ✅ [从这里开始](../proxy/user_keys#流式) |

## 流式响应
向 completion 函数传入 `stream=True` 参数，LiteLLM 就能以流式（streaming）方式返回模型响应。
### 用法
```python
from litellm import completion
messages = [{"role": "user", "content": "Hey, how's it going?"}]
response = completion(model="{{openai_small}}", messages=messages, stream=True)
for part in response:
    print(part.choices[0].delta.content or "")
```

### 辅助函数

LiteLLM 还提供了一个辅助函数，可以把流式返回的分块列表重新拼装成完整的响应。

```python
from litellm import completion
messages = [{"role": "user", "content": "Hey, how's it going?"}]
response = completion(model="{{openai_small}}", messages=messages, stream=True)

for chunk in response: 
    chunks.append(chunk)

print(litellm.stream_chunk_builder(chunks, messages=messages))
```

## 异步补全
LiteLLM 支持异步补全（asynchronous completion）：它为 completion 函数提供了一个异步版本 `acompletion`。
### 用法
```python
from litellm import acompletion
import asyncio

async def test_get_response():
    user_message = "Hello, how are you?"
    messages = [{"content": user_message, "role": "user"}]
    response = await acompletion(model="{{openai_small}}", messages=messages)
    return response

response = asyncio.run(test_get_response())
print(response)

```

## 异步流式
我们在返回的流式对象上实现了 `__anext__()` 函数，因此可以对流式对象进行异步迭代。

### 用法
下面是一个配合 openai 使用的示例。
```python
from litellm import acompletion
import asyncio, os, traceback

async def completion_call():
    try:
        print("test acompletion + streaming")
        response = await acompletion(
            model="{{openai_small}}", 
            messages=[{"content": "Hello, how are you?", "role": "user"}], 
            stream=True
        )
        print(f"response: {response}")
        async for chunk in response:
            print(chunk)
    except:
        print(f"error occurred: {traceback.format_exc()}")
        pass

asyncio.run(completion_call())
```

## 错误处理：无限循环

模型有时可能陷入无限循环，不断重复输出相同的分块，参见 [issue 示例](https://github.com/BerriAI/litellm/issues/5158)。

可以这样跳出循环：

```python
litellm.REPEATED_STREAMING_CHUNK_LIMIT = 100 # # catch if model starts looping the same chunk while streaming. Uses high default to prevent false positives.
```

LiteLLM 对此提供了错误处理：检查某个分块是否重复出现 n 次（默认 100 次），一旦超出该上限就抛出 `litellm.InternalServerError`，让重试逻辑得以生效。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm 
import os 

litellm.set_verbose = False
loop_amount = litellm.REPEATED_STREAMING_CHUNK_LIMIT + 1
chunks = [
    litellm.ModelResponse(**{
    "id": "chatcmpl-123",
    "object": "chat.completion.chunk",
    "created": 1694268190,
    "model": "{{openai_small}}",
    "system_fingerprint": "fp_44709d6fcb",
    "choices": [
        {"index": 0, "delta": {"content": "How are you?"}, "finish_reason": "stop"}
    ],
}, stream=True)
] * loop_amount
completion_stream = litellm.ModelResponseListIterator(model_responses=chunks)

response = litellm.CustomStreamWrapper(
    completion_stream=completion_stream,
    model="{{openai_small}}",
    custom_llm_provider="cached_response",
    logging_obj=litellm.Logging(
        model="{{openai_small}}",
        messages=[{"role": "user", "content": "Hey"}],
        stream=True,
        call_type="completion",
        start_time=time.time(),
        litellm_call_id="12345",
        function_id="1245",
    ),
)

for chunk in response:
    continue # expect to raise InternalServerError 
```

</TabItem>
<TabItem value="proxy" label="PROXY">

在代理（Proxy）的 config.yaml 中做如下配置。

```yaml
litellm_settings:
    REPEATED_STREAMING_CHUNK_LIMIT: 100 # this overrides the litellm default
```

代理底层使用的是 LiteLLM SDK。要验证这一行为，可以试一下"SDK"标签页中的代码示例。

</TabItem>
</Tabs>
