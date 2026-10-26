# 可靠性：重试与回退

LiteLLM 通过两种方式帮你避免请求失败：
- 重试（retries）
- 回退（fallbacks）：上下文窗口回退与通用回退

## 辅助工具函数
LiteLLM 为可靠性提供了以下函数：
* `litellm.longer_context_model_fallback_dict`：一个字典，记录了哪些模型存在上下文更大的等价版本
* `num_retries`：使用 tenacity 进行重试
* 带 fallbacks 的 `completion()`：出错时在模型 / API 密钥 / API 基址之间切换

## 重试失败的请求

在 completion 调用中这样传入：`completion(..num_retries=2)`。


下面快速看一下用法：

```python
from litellm import completion

user_message = "Hello, whats the weather in San Francisco??"
messages = [{"content": user_message, "role": "user"}]

# normal call
response = completion(
            model="{{openai_small}}",
            messages=messages,
            num_retries=2
        )
```

## 回退机制（SDK）

:::info

[查看如何在 Proxy 上实现](../proxy/reliability.md)

:::

### 上下文窗口回退（SDK）

下面代码里的模型 id 仅为示意，保留下来是为了体现上下文窗口大小：一个 4k 模型回退到对应的 16k 版本。

```python keep-model-ids
from litellm import completion

fallback_dict = {"gpt-3.5-turbo": "gpt-3.5-turbo-16k"}
messages = [{"content": "how does a court case get to the Supreme Court?" * 500, "role": "user"}]

completion(model="gpt-3.5-turbo", messages=messages, context_window_fallback_dict=fallback_dict)
```

### 回退：切换模型、API 密钥与 API 基址（SDK）

LLM API 可能不稳定，而带 fallbacks 的 completion() 能保证你的调用总能拿到响应。

#### 用法
要在 `completion()` 中使用回退模型，请在 `fallbacks` 参数中传入一个模型列表。

`fallbacks` 列表存放备用模型。LiteLLM 会先尝试通过 `model` 传入的主模型，并自动把它加到列表最前面，所以你不需要在 `fallbacks` 里重复写一遍。

#### 切换模型
```python
response = completion(model="bad-model", messages=messages, 
    fallbacks=["{{openai_small}}", "command-nightly"])
```

#### 切换 API 密钥与 API 基址（例如 Azure 部署）
在同一个 Azure 部署的不同密钥之间切换，也可以改用另一个部署。

```python
api_key="bad-key"
response = completion(model="azure/{{openai_large}}", messages=messages, api_key=api_key,
    fallbacks=[{"api_key": "good-key-1"}, {"api_key": "good-key-2", "api_base": "good-api-base-2"}])
```

[实现细节请查看这一节](/docs/completion/reliable_completions#回退机制)

## 实现细节（SDK）

### 回退机制
#### 调用输出
```
Completion with 'bad-model': got exception Unable to map your input to a model. Check your input - {'model': 'bad-model'




completion call {{openai_small}}
{
  "id": "chatcmpl-7qTmVRuO3m3gIBg4aTmAumV1TmQhB",
  "object": "chat.completion",
  "created": 1692741891,
  "model": "{{openai_small}}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I apologize, but as an AI, I do not have the capability to provide real-time weather updates. However, you can easily check the current weather in San Francisco by using a search engine or checking a weather website or app."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 16,
    "completion_tokens": 46,
    "total_tokens": 62
  }
}

```

#### 回退的工作原理

向 `completion` 传入 `fallbacks` 后，LiteLLM 会构建尝试列表 `[model] + fallbacks`，按顺序逐个调用其中的每一项。第一个返回的响应会被直接返回；某个条目失败时会被记录下来，然后接着试下一项。这里没有时间预算，不会反复循环整份列表，也没有冷却机制：一旦所有条目都失败，`completion` 就会抛出携带最后一个错误的异常，并附上 `All fallback attempts failed` 后缀。

回退条目可以是模型名字符串，也可以是一个装着 completion 关键字参数的字典。字典条目会被合并进这次调用（比如换用别的 `api_key` 或 `api_base`），并沿用主 `model`，除非字典自己设置了 `model` 键。

成功的响应会带上 `x-litellm-attempted-fallbacks` 响应头，取值是在它之前尝试过的回退次数。

如果你需要对失败部署的冷却处理，或者带退避的重试，请使用 [Router](../routing.md)，它会追踪各部署的健康状况与冷却周期；参见[代理可靠性文档](../proxy/reliability.md)。
