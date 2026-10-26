import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CoralBricks

## 概览

| 属性 | 详情 |
|-------|-------|
| 说明 | CoralBricks 通过 OpenAI 兼容 API 提供 FP4 精度的开源权重 GLM 与 DeepSeek 模型 |
| LiteLLM 上的提供商路由 | `coralbricks/` |
| 提供商文档链接 | [CoralBricks](https://www.coralbricks.ai) |
| 默认 Base URL | `https://inference.coralbricks.ai/v1` |
| 支持的操作 | `/chat/completions`, `/responses`, `/messages` |

CoralBricks 在 LiteLLM 中是一个独立的提供商，而非通用的 OpenAI 兼容路由，因此其花费按 CoralBricks 成本映射表（cost map）中的条目计价，并在 `coralbricks` 名下上报，而不会与 OpenAI 流量合并统计。`/responses` 和 `/messages` 请求会在到达时直接转发到对应的 CoralBricks 端点，不经过对话补全（chat completion）转换。

## API 密钥

```python showLineNumbers title="环境变量"
import os

os.environ["CORALBRICKS_API_KEY"] = "your-api-key"
os.environ["CORALBRICKS_API_BASE"] = "https://inference.coralbricks.ai/v1"  # optional override
```

## 模型

| 模型 | 输入 / 每百万 Token | 输出 / 每百万 Token | 缓存写入 / 每百万 Token | 缓存读取 / 每百万 Token |
|-------|-------------------|--------------------|-------------------------|------------------------|
| `coralbricks/glm-5.3-fast` | $1.12 | $4.40 | $1.68 | $0 |
| `coralbricks/deepseek-v4.1-flash-fast` | $0.01 | $1.20 | $0.09 | $0 |

每个模型最多接收 1,048,576 个输入 Token，并支持工具调用（tool calling）、推理与提示词缓存（prompt caching）。价格以 [CoralBricks 定价页](https://www.coralbricks.ai/pricing)为准：缓存写入按缓存写入费率计费，缓存读取免费。如果你的合同价不同，可以在部署上设置 `input_cost_per_token` / `output_cost_per_token`，它们会覆盖成本映射表中的价格。

CoralBricks 仍接受旧名称 `glm-5.3-fp4` 和 `deepseek-v4.1-flash-fast-fp4` 作为已弃用的别名，但 LiteLLM 只按上表中的现行名称计价，新部署请使用现行名称。

## 用法 - LiteLLM Python SDK

### 对话补全

```python showLineNumbers title="CoralBricks 对话补全"
import os
from litellm import completion

os.environ["CORALBRICKS_API_KEY"] = "your-api-key"

response = completion(
    model="coralbricks/deepseek-v4.1-flash-fast",
    messages=[{"role": "user", "content": "Write a python function that reverses a string"}],
)

print(response.choices[0].message.content)
```

### 流式

```python showLineNumbers title="CoralBricks 流式对话补全"
import os
from litellm import completion

os.environ["CORALBRICKS_API_KEY"] = "your-api-key"

response = completion(
    model="coralbricks/deepseek-v4.1-flash-fast",
    messages=[{"role": "user", "content": "Explain a binary search in two sentences"}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

### Responses API

```python showLineNumbers title="CoralBricks Responses API"
import os
import litellm

os.environ["CORALBRICKS_API_KEY"] = "your-api-key"

response = litellm.responses(
    model="coralbricks/deepseek-v4.1-flash-fast",
    input="Explain a binary search in two sentences",
    max_output_tokens=256,
)

print(response.output_text)
```

## 用法 - LiteLLM 代理

把 CoralBricks 添加到 LiteLLM 代理（Proxy）的配置中：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: deepseek-v4.1-flash
    litellm_params:
      model: coralbricks/deepseek-v4.1-flash-fast
      api_key: os.environ/CORALBRICKS_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

启动代理：

```bash showLineNumbers title="启动 LiteLLM 代理"
export CORALBRICKS_API_KEY="your-api-key"
export LITELLM_MASTER_KEY="sk-local-coralbricks"
litellm --config config.yaml --port 4000

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="通过代理使用 CoralBricks - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-local-coralbricks",
)

response = client.chat.completions.create(
    model="deepseek-v4.1-flash",
    messages=[{"role": "user", "content": "hello from litellm"}],
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="通过代理使用 CoralBricks - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "deepseek-v4.1-flash",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

</TabItem>
</Tabs>

你也可以在管理界面（Admin UI）中添加 CoralBricks：进入 Models 页面，点击 Add Model，提供商选择 CoralBricks，再从 `coralbricks/` 模型中选一个，然后粘贴你的密钥。

## Responses API

代理会把 `/v1/responses` 请求转发到 CoralBricks 的 Responses 端点：

```bash showLineNumbers title="经 LiteLLM 代理调用 Responses API"
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "deepseek-v4.1-flash",
    "input": "hello from litellm",
    "max_output_tokens": 128
  }'
```

## Anthropic Messages 兼容性

代理会把 `/v1/messages` 请求转发到 CoralBricks 的 Messages 端点，因此 Anthropic SDK 客户端无需任何改动即可使用：

```bash showLineNumbers title="经 LiteLLM 代理调用 Anthropic Messages"
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $LITELLM_MASTER_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "deepseek-v4.1-flash",
    "max_tokens": 128,
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

## 成本追踪

`coralbricks/` 模型已登记在 LiteLLM 的模型成本映射表中，因此三类端点上的每次请求花费都会自动计算，通过 `x-litellm-response-cost` 响应头返回，并以提供商 `coralbricks` 的名义记入花费日志。缓存写入与缓存读取会根据 CoralBricks 返回的用量来统计，因此重复出现的提示词，其命中缓存的前缀按免费的缓存读取费率计费。

## 自定义端点

设置 `CORALBRICKS_API_BASE` 或显式传入 `api_base`，即可改经其他 CoralBricks 端点路由。无论哪种方式，`coralbricks/` 路由都保持原有的提供商身份与计价。

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: deepseek-v4.1-flash
    litellm_params:
      model: coralbricks/deepseek-v4.1-flash-fast
      api_base: https://your-coralbricks-endpoint/v1
      api_key: os.environ/CORALBRICKS_API_KEY
```
