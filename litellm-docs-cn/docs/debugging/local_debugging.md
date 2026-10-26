# 本地调试

本地调试有两种方式：调用 `litellm._turn_on_debug()`，或在 `completion(...logger_fn=<your_local_function>)` 中传入自定义函数。注意：不要在生产环境中使用 `_turn_on_debug()`，它会把 API 密钥（API key）写入日志，可能最终落入日志文件。

## 设置 Verbose

这种方式适合查看 litellm 每一步动作对应的 print 输出。
```python
import litellm
from litellm import completion

litellm._turn_on_debug() # 👈 this is the 1-line change you need to make

## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key"
os.environ["COHERE_API_KEY"] = "cohere key"

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(model="{{openai_small}}", messages=messages)

# cohere call
response = completion("command-nightly", messages)
```

## JSON 日志

如果需要把日志存成 JSON，只需设置 `litellm.json_logs = True`。

目前我们只是把 litellm 发出的原始 POST 请求以 JSON 形式记录下来，[**查看代码**]。

[欢迎在这里反馈](https://github.com/BerriAI/litellm/issues)

## 自定义日志函数

但有时你只想看清楚 API 调用究竟发出了什么、又返回了什么。比如 API 调用失败时，到底是为什么？实际设置的参数有哪些？

这种情况下，LiteLLM 允许你传入自定义日志函数（logger function），查看甚至修改模型调用的输入与输出。

**注意**：该函数需要接收一个 dict 对象。

你的自定义函数

```python
def my_custom_logging_fn(model_call_dict):
    print(f"model call details: {model_call_dict}")
```

### 完整示例
```python
from litellm import completion

def my_custom_logging_fn(model_call_dict):
    print(f"model call details: {model_call_dict}")

## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key"
os.environ["COHERE_API_KEY"] = "cohere key"

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(model="{{openai_small}}", messages=messages, logger_fn=my_custom_logging_fn)

# cohere call
response = completion("command-nightly", messages, logger_fn=my_custom_logging_fn)
```

## 仍有问题？

加入 [Discord](https://discord.com/invite/wuPM9dRgDw) 社区。

我们保证以 `lite` 电般的速度为你提供帮助 ❤️
