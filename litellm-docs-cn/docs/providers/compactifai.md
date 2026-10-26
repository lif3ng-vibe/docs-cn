import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CompactifAI
https://docs.compactif.ai/

CompactifAI 提供主流语言模型的高压缩版本，推理成本最高降低 **70%**，吞吐量最高提升 **4 倍**，并具备**低延迟推理**能力，质量损失极小（低于 5%）。CompactifAI 的 OpenAI 兼容 API 让集成变得十分简单，开发者可以借此构建超高效率、易于扩展的 AI 应用，获得出色的并发性能与资源利用率。

| 属性 | 详情 |
|-------|-------|
| 描述 | CompactifAI 提供主流语言模型的压缩版本，成本最多降低 70%，吞吐量最高提升 4 倍 |
| LiteLLM 提供商路由 | `compactifai/`（在模型名前加此前缀，例如 `compactifai/cai-llama-3-1-8b-slim`） |
| 提供商文档 | [CompactifAI ↗](https://docs.compactif.ai/) |
| 提供商 API 端点 | https://api.compactif.ai/v1 |
| 支持的端点 | `/chat/completions`, `/completions` |

## 支持的 OpenAI 参数

CompactifAI 完全兼容 OpenAI，支持以下参数：

```
"stream",
"stop",
"temperature",
"top_p",
"max_tokens",
"presence_penalty",
"frequency_penalty",
"logit_bias",
"user",
"response_format",
"seed",
"tools",
"tool_choice",
"parallel_tool_calls",
"extra_headers"
```

## API 密钥配置

CompactifAI 的 API 密钥通过订阅 AWS Marketplace 获取：

1. 通过 [AWS Marketplace](https://aws.amazon.com/marketplace) 完成订阅
2. 完成订阅验证（审核流程需要 24 小时）
3. 使用下发的凭证登录 MultiverseIAM 仪表板
4. 在仪表板中获取你的 API 密钥

```python
import os

os.environ["COMPACTIFAI_API_KEY"] = "your-api-key"
```

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['COMPACTIFAI_API_KEY'] = "your-api-key"

response = completion(
    model="compactifai/cai-llama-3-1-8b-slim",
    messages=[
       {"role": "user", "content": "Hello from LiteLLM!"}
   ],
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml
model_list:
  - model_name: llama-2-compressed
    litellm_params:
      model: compactifai/cai-llama-3-1-8b-slim
      api_key: os.environ/COMPACTIFAI_API_KEY
```

</TabItem>
</Tabs>

## 流式

```python
from litellm import completion
import os

os.environ['COMPACTIFAI_API_KEY'] = "your-api-key"

response = completion(
    model="compactifai/cai-llama-3-1-8b-slim",
    messages=[
       {"role": "user", "content": "Write a short story"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 高级用法

### 自定义参数

```python
from litellm import completion

response = completion(
    model="compactifai/cai-llama-3-1-8b-slim",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    temperature=0.7,
    max_tokens=500,
    top_p=0.9,
    stop=["Human:", "AI:"]
)
```

### 函数调用

CompactifAI 支持 OpenAI 兼容的函数调用：

```python
from litellm import completion

functions = [
    {
        "name": "get_weather",
        "description": "Get current weather information",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state"
                }
            },
            "required": ["location"]
        }
    }
]

response = completion(
    model="compactifai/cai-llama-3-1-8b-slim",
    messages=[{"role": "user", "content": "What's the weather in San Francisco?"}],
    tools=[{"type": "function", "function": f} for f in functions],
    tool_choice="auto"
)
```

### 异步用法

```python
import asyncio
from litellm import acompletion

async def async_call():
    response = await acompletion(
        model="compactifai/cai-llama-3-1-8b-slim",
        messages=[{"role": "user", "content": "Hello async world!"}]
    )
    return response

# Run async function
response = asyncio.run(async_call())
print(response)
```

## 可用模型

CompactifAI 提供热门模型的压缩版本。可通过 `/models` 端点获取最新列表：

```python
import httpx

headers = {"Authorization": f"Bearer {your_api_key}"}
response = httpx.get("https://api.compactif.ai/v1/models", headers=headers)
models = response.json()
```

常见模型格式：
- `compactifai/cai-llama-3-1-8b-slim`
- `compactifai/mistral-7b-compressed`
- `compactifai/codellama-7b-compressed`

## 优势

- **成本高效**：与标准模型相比，推理成本最多降低 70%
- **高性能**：吞吐量提升 4 倍，质量损失极小（低于 5%）
- **低延迟**：针对快速响应做了优化
- **即插即用**：完全兼容 OpenAI API
- **可扩展**：并发性能与资源效率出色

## 错误处理

CompactifAI 返回标准的 OpenAI 兼容错误响应：

```python
from litellm import completion
from litellm.exceptions import AuthenticationError, RateLimitError

try:
    response = completion(
        model="compactifai/cai-llama-3-1-8b-slim",
        messages=[{"role": "user", "content": "Hello"}]
    )
except AuthenticationError:
    print("Invalid API key")
except RateLimitError:
    print("Rate limit exceeded")
```

## 支持

- 文档：https://docs.compactif.ai/
- LinkedIn：[MultiverseComputing](https://www.linkedin.com/company/multiversecomputing)
- 分析：[Artificial Analysis 提供商对比](https://artificialanalysis.ai/providers/compactifai)
