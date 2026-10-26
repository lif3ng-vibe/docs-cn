# 裁剪输入消息
**使用 litellm.trim_messages() 确保消息不会超出模型的 Token 上限或指定的 `max_tokens`**

## 用法
```python
from litellm import completion
from litellm.utils import trim_messages

response = completion(
    model=model, 
    messages=trim_messages(messages, model) # trim_messages ensures tokens(messages) < max_tokens(model)
) 
```

## 用法：设置 max_tokens
```python
from litellm import completion
from litellm.utils import trim_messages

response = completion(
    model=model, 
    messages=trim_messages(messages, model, max_tokens=10), # trim_messages ensures tokens(messages) < max_tokens
) 
```

## 参数

该函数使用以下参数：

- `messages`：[必填] 输入消息的列表

- `model`：[可选] 所使用的 LiteLLM 模型。该参数可以不传，改为直接指定 `max_tokens` 参数。

- `max_tokens`：[可选] 一个整数，用于手动设置消息的 Token 上限

- `trim_ratio`：[可选] 表示裁剪后目标使用的 Token 占比。默认值为 0.75，也就是消息会被裁剪到大约占用 75% 的 Token 上限。
