import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cognition

## 概述

| 属性 | 说明 |
|-------|-------|
| 描述 | Cognition 通过 OpenAI 兼容 API 提供其 SWE 编程模型 |
| LiteLLM 中的提供商路由 | `cognition/` |
| 提供商文档链接 | [Cognition 文档](https://docs.devin.ai) |
| 默认 Base URL | `https://api.cognition.ai/v1` |
| 支持的操作 | `/chat/completions`，以及经 LiteLLM 的 Anthropic Messages 适配器访问的 `/messages` |

Cognition 在 LiteLLM 中是独立的提供商，而非通用的 OpenAI 兼容路由，因此其花费按 Cognition 在成本映射表中的条目计价，并归入 `cognition` 名下统计，不会与 OpenAI 流量合并计算。

## API 密钥

```python showLineNumbers title="环境变量"
import os

os.environ["COGNITION_API_KEY"] = "your-api-key"
os.environ["COGNITION_API_BASE"] = "https://api.cognition.ai/v1"  # optional override
```

## 模型

| 模型 | 输入 / 1M token | 输出 / 1M token | 缓存读取 / 1M token |
|-------|-------------------|--------------------|------------------------|
| `cognition/swe-1.7` | $0.50 | $2.50 | $0.20 |
| `cognition/swe-1.7-lightning` | $2.50 | $12.50 | $1.00 |
| `cognition/swe-1.6` | $0.50 | $2.50 | $0.20 |

价格以 [Cognition 模型列表](https://docs.devin.ai/desktop/models) 为准。`swe-1.7` 是标准档；`swe-1.7-lightning` 由 Cerebras 提供算力，出字速度约每秒 1000 个 token，价格是标准档的 5 倍。如果你的合同价与此不同，可以在部署上设置 `input_cost_per_token` / `output_cost_per_token`，它们会覆盖成本映射表中的价格。

## 用法 - LiteLLM Python SDK

### 对话补全

```python showLineNumbers title="Cognition 对话补全"
import os
from litellm import completion

os.environ["COGNITION_API_KEY"] = "your-api-key"

response = completion(
    model="cognition/swe-1.7",
    messages=[{"role": "user", "content": "Write a python function that reverses a string"}],
)

print(response.choices[0].message.content)
```

### 流式

```python showLineNumbers title="Cognition 流式对话补全"
import os
from litellm import completion

os.environ["COGNITION_API_KEY"] = "your-api-key"

response = completion(
    model="cognition/swe-1.7",
    messages=[{"role": "user", "content": "Explain a binary search in two sentences"}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

### 工具调用

```python showLineNumbers title="Cognition 工具调用"
import os
from litellm import completion

os.environ["COGNITION_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "function",
        "function": {
            "name": "run_tests",
            "description": "Run the test suite for a package",
            "parameters": {
                "type": "object",
                "properties": {"package": {"type": "string", "description": "Package name"}},
                "required": ["package"],
            },
        },
    }
]

response = completion(
    model="cognition/swe-1.7",
    messages=[{"role": "user", "content": "Run the tests for the billing package"}],
    tools=tools,
    tool_choice="auto",
)

print(response.choices[0].message.tool_calls)
```

## 用法 - LiteLLM 代理

在 LiteLLM 代理配置中加入 Cognition：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: swe-1.7
    litellm_params:
      model: cognition/swe-1.7
      api_key: os.environ/COGNITION_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

启动代理：

```bash showLineNumbers title="启动 LiteLLM 代理"
export COGNITION_API_KEY="your-api-key"
export LITELLM_MASTER_KEY="sk-local-cognition"
litellm --config config.yaml --port 4000

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="通过代理调用 Cognition - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-local-cognition",
)

response = client.chat.completions.create(
    model="swe-1.7",
    messages=[{"role": "user", "content": "hello from litellm"}],
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="通过代理调用 Cognition - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "swe-1.7",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

</TabItem>
</Tabs>

你也可以在管理界面（Admin UI）中添加 Cognition：进入 Models 页面，点击 Add Model，提供商选 Cognition，再从 `cognition/` 模型中选一个，最后粘贴你的密钥。

## Anthropic Messages 兼容性

LiteLLM 可以把 Anthropic Messages 形态的请求转换为 Cognition 对话补全，SDK 入口和代理的 `/v1/messages` 端点都支持这种用法：

```bash showLineNumbers title="通过 LiteLLM 代理调用 Anthropic Messages"
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "swe-1.7",
    "max_tokens": 128,
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

## 成本追踪

`cognition/` 模型已登记在 LiteLLM 的模型成本映射表中，因此每次请求的花费会自动计算，通过 `x-litellm-response-cost` 响应头返回，并按提供商 `cognition` 记入花费日志。为 OpenAI 配置的折扣与报表不适用于这部分流量。

## 自定义端点

Cognition 目前为每个客户单独开通 API 端点，因此大多数部署都应设置 `COGNITION_API_BASE`，或在部署时显式传入 `api_base`，填你开通 Cognition 时获得的 base URL。两者都未设置时，默认使用约定的 `https://api.cognition.ai/v1`。无论采用哪种方式，`cognition/` 路由都保持提供商身份与定价不变。

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: swe-1.7
    litellm_params:
      model: cognition/swe-1.7
      api_base: https://your-cognition-endpoint/v1
      api_key: os.environ/COGNITION_API_KEY
```
