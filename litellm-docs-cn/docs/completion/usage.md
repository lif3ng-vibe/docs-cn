# 用法

无论底层是哪家提供商（provider），LiteLLM 都会返回与 OpenAI 兼容的用量（usage）对象。

```bash
"usage": {
    "prompt_tokens": int,
    "completion_tokens": int,
    "total_tokens": int
  }
```

## 快速上手

```python
from litellm import completion
import os

## set ENV variables
os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
  model="{{openai_small}}",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)

print(response.usage)
```
> **注意**：LiteLLM 支持端点桥接（endpoint bridging）。如果某个模型本身不支持所请求的端点，LiteLLM 会根据该模型在 `model_prices_and_context_window` 中设置的 `mode`，自动把调用路由到正确的受支持端点（比如把 `/chat/completions` 桥接到 `/responses`，或反过来）。

## 流式用法

设置 `stream_options={"include_usage": True}` 后，在 data: [DONE] 消息之前会额外流式下发一个分块。该分块的 usage 字段给出整个请求的 Token 用量统计，choices 字段则始终是空数组。其余分块也都会带 usage 字段，只是取值为 null。


```python
from litellm import completion

completion = completion(
  model="{{openai_large}}",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  stream=True,
  stream_options={"include_usage": True}
)

for chunk in completion:
  print(chunk.choices[0].delta)

```

### 代理：始终包含流式用量信息

使用 LiteLLM 代理（Proxy）时，可以配置它在所有流式响应中自动附带用量信息，即使客户端并未发送 `stream_options={"include_usage": True}`。

#### 配置

在 config.yaml 中加入以下配置：

```yaml
general_settings:
  always_include_stream_usage: true
```

也可以通过 UI 来配置：

1. 进入 LiteLLM 代理 UI
2. 依次打开 `Settings` > `Router Settings` > `General`
3. 找到 `always_include_stream_usage` 设置项
4. 将其切换为 `true`
5. 点击 `Update` 保存

#### 工作原理

启用 `always_include_stream_usage` 后：
- 所有流式请求都会自动加上 `stream_options={"include_usage": True}`
- 即使客户端没有显式请求，也会在最后一个分块中拿到用量信息
- 如果客户端已经传了 `stream_options`，则只追加 `include_usage: True`，不会覆盖其他选项
- 非流式请求不受影响

#### 示例

启用该设置后，像下面这样一个简单的流式请求：

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

都会在响应中自动收到用量信息，无需显式传入 `stream_options`。
