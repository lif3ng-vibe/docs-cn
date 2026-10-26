import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Amazon Bedrock Mantle

[Amazon Bedrock Mantle](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-mantle.html) 是 Amazon Bedrock 的分布式推理引擎（Project Mantle），为托管在 Bedrock 上的模型提供 **OpenAI 兼容 API**。

使用该提供商调用 Bedrock Mantle 模型时，将按 **AWS Bedrock 实际定价**计费，而非 OpenAI 定价。

:::tip

**我们支持全部 Bedrock Mantle 模型，发送 litellm 请求时只需设置 `model=bedrock_mantle/<model-id>` 前缀**。

:::

## Claude Mythos

[Claude Mythos](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-mythos-preview.html)（`anthropic.claude-mythos-preview`）已在 Bedrock Mantle 上提供，具备 **1M token 输入上下文**、128K 输出，并支持推理、视觉与工具调用。

搭配标准 AWS 凭证使用 `bedrock_mantle/` 路由前缀即可。

### /messages

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import asyncio
import litellm
import os

os.environ['AWS_ACCESS_KEY_ID'] = "your-aws-access-key"
os.environ['AWS_SECRET_ACCESS_KEY'] = "your-aws-secret-key"
os.environ['AWS_REGION_NAME'] = "us-east-1"

async def main():
    response = await litellm.anthropic_messages(
        model="bedrock_mantle/anthropic.claude-mythos-preview",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Explain quantum entanglement simply."}],
    )
    print(response)

asyncio.run(main())
```

</TabItem>
<TabItem value="ai-gateway" label="AI 网关">

**1. 添加到 config.yaml**

```yaml
model_list:
  - model_name: claude-mythos
    litellm_params:
      model: bedrock_mantle/anthropic.claude-mythos-preview
      aws_region_name: us-east-1
```

**2. 启动 LiteLLM AI 网关**

```shell
litellm --config /path/to/config.yaml
```

**3. 通过 curl 调用 `/v1/messages`**

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-mythos",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Explain quantum entanglement simply."}
    ]
  }'
```

</TabItem>
</Tabs>

### /chat/completions

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['AWS_ACCESS_KEY_ID'] = "your-aws-access-key"
os.environ['AWS_SECRET_ACCESS_KEY'] = "your-aws-secret-key"
os.environ['AWS_REGION_NAME'] = "us-east-1"

response = completion(
    model="bedrock_mantle/anthropic.claude-mythos-preview",
    messages=[{"role": "user", "content": "Explain quantum entanglement simply."}],
)
print(response)
```

</TabItem>
<TabItem value="ai-gateway-chat" label="AI 网关">

**1. 添加到 config.yaml**

```yaml
model_list:
  - model_name: claude-mythos
    litellm_params:
      model: bedrock_mantle/anthropic.claude-mythos-preview
      aws_region_name: us-east-1
```

**2. 启动 LiteLLM AI 网关**

```shell
litellm --config /path/to/config.yaml
```

**3. 通过 curl 调用 `/v1/chat/completions`**

```bash
curl -X POST http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-mythos",
    "messages": [
      {"role": "user", "content": "Explain quantum entanglement simply."}
    ]
  }'
```

</TabItem>
</Tabs>

## /v1/messages 上的 Claude 模型

所有 `bedrock_mantle/anthropic.claude-*` 模型（包括 Claude Mythos）都通过 `/v1/messages` 由 Bedrock Mantle 原生的 Anthropic Messages 端点 `https://bedrock-mantle.{region}.api.aws/anthropic/v1/messages` 提供服务，而不是经对话补全桥接，Mantle 对 Claude 模型不接受该桥接。Claude Code 和 Anthropic SDK 交互的正是这一接口，LiteLLM 以 Anthropic 原生报文格式转发请求，因此流式、工具与思考（thinking）都直接透传。其余 Mantle 模型（例如下文的 GPT 系列）在 `/v1/messages` 上仍走 Responses API 桥接。

请使用不带前缀的 Mantle 模型 id，例如 `bedrock_mantle/anthropic.{{anthropic}}` 或 `bedrock_mantle/anthropic.claude-haiku-4-5`。带 `us.` 推理配置文件（inference profile）前缀会被 Mantle 返回 404。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import asyncio
import litellm
import os

os.environ['AWS_ACCESS_KEY_ID'] = "your-aws-access-key"
os.environ['AWS_SECRET_ACCESS_KEY'] = "your-aws-secret-key"
os.environ['AWS_REGION_NAME'] = "us-east-2"

async def main():
    response = await litellm.anthropic_messages(
        model="bedrock_mantle/anthropic.{{anthropic}}",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Explain quantum entanglement simply."}],
    )
    print(response)

asyncio.run(main())
```

</TabItem>
<TabItem value="ai-gateway" label="AI 网关">

**1. 添加到 config.yaml**

```yaml
model_list:
  - model_name: claude-sonnet-mantle
    litellm_params:
      model: bedrock_mantle/anthropic.{{anthropic}}
      aws_region_name: us-east-2
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
```

**2. 启动 LiteLLM AI 网关**

```shell
litellm --config /path/to/config.yaml
```

**3. 通过 curl 调用 `/v1/messages`**

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-sonnet-mantle",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Explain quantum entanglement simply."}
    ]
  }'
```

</TabItem>
</Tabs>

区域依次取自：部署上的 `aws_region_name`；模型名中的区域前缀（`bedrock_mantle/us-east-2/anthropic.{{anthropic}}`）；指向 Mantle 时 `api_base` 或 `BEDROCK_MANTLE_API_BASE` 的主机；之后是 `BEDROCK_MANTLE_REGION`、`AWS_REGION_NAME` 或 `AWS_REGION`；最终兜底为 `us-east-1`。自定义 `api_base`（VPC 端点或 Mantle 前置代理）会被保留为主机名，并在其后追加 `/anthropic/v1/messages`，无论配置时带不带 `/openai/v1` 或 `/v1` 后缀。

认证链路与该提供商的其余部分一致：优先使用已设置的 `api_key`、`BEDROCK_MANTLE_API_KEY` 或 `AWS_BEARER_TOKEN_BEDROCK` 作为 Bearer 令牌，否则回退到 SigV4，凭证来自 `aws_access_key_id` / `aws_secret_access_key` / `aws_session_token`、`aws_profile_name` 或角色（role）参数。LiteLLM 在每个请求上发送 `anthropic-version: 2023-06-01`，调用方自带的 `anthropic-version` 头优先级更高。

Beta 功能通过 `anthropic-beta` 头传递：内容为调用方传入的值加上请求所需的值（例如 `context_management` 编辑会追加 `context-management-2025-06-27`），并限制在 Mantle 认可的范围内。Mantle 不认识的值会被直接剔除，而不会让请求报 400 失败；请求体的 `anthropic_beta` 字段不会发送任何内容，只要该头存在，Mantle 就会忽略它。

健康检查走同一接口。`/health` 和管理界面（Admin UI）中的 Test Connection 按钮会用一个小的 `/v1/messages` 请求探测 `bedrock_mantle/anthropic.claude-*` 部署，无需 `model_info.mode`。参见 [模型模式](../proxy/health.md#模型模式)

## OpenAI 模型（GPT-5.4 / GPT-5.5）

### /responses

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
import os

os.environ['BEDROCK_MANTLE_API_KEY'] = "your-bedrock-api-key"
os.environ['BEDROCK_MANTLE_REGION'] = "us-east-2"

response = litellm.responses(
    model="bedrock_mantle/openai.{{openai_large}}",
    input="Hello! How can you help me today?",
)
print(response)
```

#### 流式

```python
import litellm
import os

os.environ['BEDROCK_MANTLE_API_KEY'] = "your-bedrock-api-key"

response = litellm.responses(
    model="bedrock_mantle/openai.{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True,
)

for event in response:
    print(event)
```

</TabItem>
<TabItem value="ai-gateway" label="AI 网关">

**1. 添加到 config.yaml**

```yaml
model_list:
  - model_name: gpt-5.5-mantle
    litellm_params:
      model: bedrock_mantle/openai.{{openai_large}}
      api_key: os.environ/BEDROCK_MANTLE_API_KEY
      api_base: https://bedrock-mantle.us-east-2.api.aws/v1
```

**2. 启动 LiteLLM AI 网关**

```shell
litellm --config /path/to/config.yaml
```

**3. 通过 curl 调用 `/v1/responses`**

```bash
curl -X POST http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "gpt-5.5-mantle",
    "input": "Hello! How can you help me today?"
  }'
```

**4. 或使用 OpenAI SDK**

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000",
)

response = client.responses.create(
    model="gpt-5.5-mantle",
    input="Hello! How can you help me today?",
)
print(response)
```

</TabItem>
</Tabs>

### 提示词缓存（GPT-5.6 及更新版本）

Mantle 上的 GPT-5.6 及更新版本 OpenAI 模型在 Responses API 上支持[显式提示词缓存断点（explicit prompt cache breakpoints）](../completion/prompt_caching.md#bedrock-mantle-显式缓存断点openai-gpt-56-及更新版本)：在 `input_text`、`input_image` 或 `input_file` 块上放置 `prompt_cache_breakpoint` 标记，并在请求级设置 `prompt_cache_options`。每个缓存前缀至少需要 1,024 个 token，单个请求最多携带 4 个断点，缓存前缀至少在 30 分钟内保持可用。LiteLLM 会在 `/v1/responses` 上原样传递这两个字段。在 `/v1/chat/completions` 上，这些模型被桥接到 Responses API，因此内容块上的 `prompt_cache_breakpoint` 会被保留，部署上的 `cache_control_injection_points` 也会替你放置标记，行为与 `openai/gpt-5.6` 相同（[教程](../tutorials/prompt_caching.md#openai-gpt-56-and-newer)）

```yaml
model_list:
  - model_name: gpt-5.6-mantle
    litellm_params:
      model: bedrock_mantle/openai.gpt-5.6-sol
      aws_region_name: us-east-1
      api_key: os.environ/AWS_BEARER_TOKEN_BEDROCK
      cache_control_injection_points:
        - location: message
          role: system
```

```bash
curl -X POST http://0.0.0.0:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.6-mantle",
    "messages": [
      {"role": "system", "content": "<a system prompt of at least 1,024 tokens>"},
      {"role": "user", "content": "What are the key terms and conditions?"}
    ],
    "prompt_cache_options": {"mode": "explicit", "ttl": "30m"}
  }'
```

首次调用会在 `usage.prompt_tokens_details.cache_write_tokens` 中报告缓存写入，在缓存有效期内重复同一前缀则报告 `usage.prompt_tokens_details.cached_tokens`，分别按模型的缓存写入与缓存读取单价计费。

## API 密钥

```python
# env variable
os.environ['BEDROCK_MANTLE_API_KEY'] = "your-aws-bedrock-api-key"

# optional: override region (defaults to us-east-1)
os.environ['BEDROCK_MANTLE_REGION'] = "us-east-1"  # or use AWS_REGION
```

## 支持的模型

| 模型 | 端点 | 上下文窗口 | 输入（每百万 token） | 输出（每百万 token） |
|-------|----------|---------------|----------------------|------------------------|
| `openai.gpt-5.5` | `/responses` | 1.05M | $5.50 | $33.00 |
| `openai.gpt-5.4` | `/responses` | 1.05M | $2.75 | $16.50 |
| `openai.gpt-oss-120b` | `/chat/completions` | 131K | $0.15 | $0.60 |
| `openai.gpt-oss-20b` | `/chat/completions` | 131K | $0.07 | $0.30 |
| `openai.gpt-oss-safeguard-120b` | `/chat/completions` | 131K | $0.15 | $0.60 |
| `openai.gpt-oss-safeguard-20b` | `/chat/completions` | 131K | $0.07 | $0.20 |

## 使用示例

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['BEDROCK_MANTLE_API_KEY'] = "your-bedrock-api-key"

response = completion(
    model="bedrock_mantle/openai.gpt-oss-120b",
    messages=[{"role": "user", "content": "hello from litellm"}],
)
print(response)
```

</TabItem>
<TabItem value="streaming" label="流式">

```python
from litellm import completion
import os

os.environ['BEDROCK_MANTLE_API_KEY'] = "your-bedrock-api-key"

response = completion(
    model="bedrock_mantle/openai.gpt-oss-120b",
    messages=[{"role": "user", "content": "hello from litellm"}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

</TabItem>
<TabItem value="async" label="异步">

```python
import asyncio
from litellm import acompletion
import os

os.environ['BEDROCK_MANTLE_API_KEY'] = "your-bedrock-api-key"

async def main():
    response = await acompletion(
        model="bedrock_mantle/openai.gpt-oss-120b",
        messages=[{"role": "user", "content": "hello from litellm"}],
    )
    print(response)

asyncio.run(main())
```

</TabItem>
</Tabs>

## 区域配置

API 基础 URL 为 `https://bedrock-mantle.{region}.api.aws/v1`。区域按以下顺序解析：

1. 部署上的 `aws_region_name`（或以 kwarg 传入）
2. 模型名中的区域前缀，例如 `bedrock_mantle/us-gov-west-1/xai.grok-4.3`
3. `BEDROCK_MANTLE_REGION` 环境变量
4. `AWS_REGION_NAME` 环境变量，其次 `AWS_REGION`
5. 默认值：`us-east-1`

显式指定的 `api_base`（或 `BEDROCK_MANTLE_API_BASE`）会完全替换推导出的 URL。发送请求前会剥离模型名中的前缀，因此 `bedrock_mantle/us-gov-west-1/xai.grok-4.3` 会在 `us-gov-west-1` 中调用 `xai.grok-4.3`；该前缀只识别 LiteLLM 已知的 Bedrock 区域，而 `aws_region_name` 适用于所有区域。Claude 模型在 `/v1/messages` 上使用 `/anthropic/v1/messages` 路径而非 `/v1`，并保留自定义 `api_base` 作为主机名，参见 [/v1/messages 上的 Claude 模型](#v1messages-上的-claude-模型)

**支持的区域**：`us-east-1`、`us-east-2`、`us-west-2`、`eu-west-1`、`eu-west-2`、`eu-central-1`、`eu-south-1`、`eu-north-1`、`ap-northeast-1`、`ap-south-1`、`ap-southeast-3`、`sa-east-1`，以及 `us-gov-west-1`（AWS GovCloud）

```python
import os
os.environ['BEDROCK_MANTLE_REGION'] = "eu-west-1"

# or pass api_base directly
response = completion(
    model="bedrock_mantle/openai.gpt-oss-120b",
    messages=[{"role": "user", "content": "hello"}],
    api_base="https://bedrock-mantle.eu-west-1.api.aws/v1",
)
```

### GovCloud 定价

成本追踪按实际服务的区域进行。当价格表中存在 `bedrock_mantle/{region}/{model}` 行时（目前是 `us-gov-west-1` 的行），该次调用按这一行的价格计费，而不按商业区域价格，无论区域来自 `aws_region_name` 还是模型前缀。下面两个部署都会按 GovCloud 费率对 `xai.grok-4.3` 计费：

```yaml
model_list:
  - model_name: grok-4.3-gov
    litellm_params:
      model: bedrock_mantle/xai.grok-4.3
      aws_region_name: us-gov-west-1
      aws_access_key_id: os.environ/AWS_GOV_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_GOV_SECRET_ACCESS_KEY
  - model_name: grok-4.3-gov-prefixed
    litellm_params:
      model: bedrock_mantle/us-gov-west-1/xai.grok-4.3
      aws_access_key_id: os.environ/AWS_GOV_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_GOV_SECRET_ACCESS_KEY
```

设置了 `base_model` 或自带 `input_cost_per_token` / `output_cost_per_token` 的部署只按该行计价，不会再叠加实际服务区域的价格。

## 在 LiteLLM 代理中使用

### 1. 在 config.yaml 中配置 Bedrock Mantle 模型

```yaml
model_list:
  - model_name: gpt-5.5-mantle
    litellm_params:
      model: bedrock_mantle/openai.{{openai_large}}
      api_key: os.environ/BEDROCK_MANTLE_API_KEY
      api_base: "https://bedrock-mantle.us-east-2.api.aws/v1"

  - model_name: gpt-oss-120b
    litellm_params:
      model: bedrock_mantle/openai.gpt-oss-120b
      api_key: os.environ/BEDROCK_MANTLE_API_KEY
      # optional region override:
      api_base: "https://bedrock-mantle.us-east-1.api.aws/v1"

  - model_name: gpt-oss-20b
    litellm_params:
      model: bedrock_mantle/openai.gpt-oss-20b
      api_key: os.environ/BEDROCK_MANTLE_API_KEY
```

### 2. 启动代理

```shell
litellm --config /path/to/config.yaml
```

### 3. 发送请求

```python
import openai

client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000",
)

response = client.chat.completions.create(
    model="gpt-oss-120b",
    messages=[{"role": "user", "content": "hello from litellm"}],
)
print(response)
```
