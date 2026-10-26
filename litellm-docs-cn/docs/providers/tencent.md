import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tencent TokenHub
https://www.tencentcloud.com/products/tokenhub

**我们支持 Tencent TokenHub 的全部模型，发送补全请求时只需在模型名前加上 `tencent/` 前缀**

TokenHub 是腾讯云推出的统一 LLM 网关（LLM gateway），提供 OpenAI 兼容的 Chat Completions 端点（endpoint）和 Anthropic 兼容的 Messages 端点。只需一个 API 密钥（API key），即可访问 DeepSeek、GLM、Kimi、MiniMax 和 Hunyuan 等模型。

## API 密钥
```python
# env variable
os.environ['TENCENT_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['TENCENT_API_KEY'] = ""
response = completion(
    model="tencent/deepseek-v4-pro",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 流式使用示例
```python
from litellm import completion
import os

os.environ['TENCENT_API_KEY'] = ""
response = completion(
    model="tencent/deepseek-v4-pro",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 支持的模型
我们支持 TokenHub 国际站端点上可用的全部模型。

| 模型名称 | 函数调用 |
|---|---|
| deepseek-v4-flash-202605 | `completion(model="tencent/deepseek-v4-flash-202605", messages)` |
| deepseek-v4-pro-202606 | `completion(model="tencent/deepseek-v4-pro-202606", messages)` |
| deepseek-v4-flash | `completion(model="tencent/deepseek-v4-flash", messages)` |
| deepseek-v4-pro | `completion(model="tencent/deepseek-v4-pro", messages)` |
| deepseek-v3.2 | `completion(model="tencent/deepseek-v3.2", messages)` |
| glm-5.1 | `completion(model="tencent/glm-5.1", messages)` |
| glm-5v-turbo | `completion(model="tencent/glm-5v-turbo", messages)` |
| glm-5-turbo | `completion(model="tencent/glm-5-turbo", messages)` |
| glm-5 | `completion(model="tencent/glm-5", messages)` |
| kimi-k2.6 | `completion(model="tencent/kimi-k2.6", messages)` |
| kimi-k2.5 | `completion(model="tencent/kimi-k2.5", messages)` |
| minimax-m3 | `completion(model="tencent/minimax-m3", messages)` |
| minimax-m2.7 | `completion(model="tencent/minimax-m2.7", messages)` |
| minimax-m2.5 | `completion(model="tencent/minimax-m2.5", messages)` |
| hy-mt2-plus | `completion(model="tencent/hy-mt2-plus", messages)` |

## 自定义 API Base

默认情况下，LiteLLM 使用新加坡区域的端点。你可以通过 `TENCENT_API_BASE` 覆盖这一设置。

```python
import os

os.environ['TENCENT_API_BASE'] = "https://tokenhub.tencentcloudmaas.com/v1"  # Guangzhou region
```

## 思考/推理模式

许多 TokenHub 模型支持扩展思考（extended thinking）。LiteLLM 同时支持 `thinking` 和 `reasoning_effort` 两个参数。

<Tabs>
<TabItem value="thinking" label="thinking 参数">

```python
from litellm import completion
import os

os.environ['TENCENT_API_KEY'] = ""

resp = completion(
    model="tencent/deepseek-v4-pro",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    thinking={"type": "enabled"},
)

print(resp.choices[0].message.reasoning_content)
print(resp.choices[0].message.content)
```

</TabItem>
<TabItem value="reasoning_effort" label="reasoning_effort 参数">

```python
from litellm import completion
import os

os.environ['TENCENT_API_KEY'] = ""

resp = completion(
    model="tencent/deepseek-v4-pro",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    reasoning_effort="medium",
)

print(resp.choices[0].message.reasoning_content)
print(resp.choices[0].message.content)
```

</TabItem>
</Tabs>

:::note
只要 `reasoning_effort` 的取值不是 `"none"`，LiteLLM 就会自动把它映射为 `thinking={"type": "enabled"}`。
:::

### 基本用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['TENCENT_API_KEY'] = ""
resp = completion(
    model="tencent/deepseek-v4-pro",
    messages=[{"role": "user", "content": "Tell me a joke."}],
)

print(
    resp.choices[0].message.reasoning_content
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: deepseek-v4-pro
    litellm_params:
        model: tencent/deepseek-v4-pro
        api_key: os.environ/TENCENT_API_KEY
```

2. 运行代理

```bash
python litellm/proxy/main.py
```

3. 测试一下！

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "deepseek-v4-pro",
    "messages": [
      {
        "role": "user",
        "content": "hello from litellm proxy"
      }
    ]
}'
```

</TabItem>

</Tabs>

## Anthropic 兼容的 Messages API

TokenHub 还提供 Anthropic 兼容的 Messages API。只要该端点可用，LiteLLM 就会通过它来路由请求。

```python
os.environ['TENCENT_API_KEY'] = ""
```

如需将 Anthropic 兼容的 base URL 与 Chat Completions 端点分开覆盖：

```python
os.environ['TENCENT_ANTHROPIC_API_BASE'] = "https://tokenhub-intl.tencentcloudmaas.com"
```

如果 `TENCENT_ANTHROPIC_API_BASE` 和 `TENCENT_API_BASE` 同时设置，Messages API 调用会优先使用 Anthropic 专用的那个。
