---
sidebar_label: Snowflake Cortex
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Snowflake Cortex

LiteLLM 支持 Snowflake Cortex REST API 上的所有模型，包括来自 Anthropic（Claude）、OpenAI（GPT）、Meta（Llama）、Mistral、DeepSeek 和 Snowflake 的模型。

| | |
|---|---|
| 描述 | Snowflake Cortex REST API 通过兼容 OpenAI 和兼容 Anthropic 的端点，提供对各家前沿 LLM 的访问。所有推理均在 Snowflake 的安全边界内运行。 |
| LiteLLM 提供商路由 | `snowflake/` |
| 提供商文档 | [Cortex REST API ↗](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api) |
| API 端点 | 对话补全：`https://{account}.snowflakecomputing.com/api/v2/cortex/v1/chat/completions` <br/> 消息：`https://{account}.snowflakecomputing.com/api/v2/cortex/v1/messages` <br/> 旧版：`https://{account}.snowflakecomputing.com/api/v2/cortex/inference:complete` |
| 支持的 OpenAI 端点 | `/chat/completions`, `/completions`, `/embeddings` |


提示：我们支持全部 Snowflake Cortex 模型。向 LiteLLM 发送请求时，请使用 `model=snowflake/<model-name>` 作为模型名前缀。


## 认证

Snowflake Cortex REST API 支持三种认证方式。

### 编程访问令牌（PAT），推荐使用

最简单的方式。在 Snowsight 中依次进入 **用户菜单 → 我的个人资料 → 编程访问令牌**（Programmatic Access Tokens）即可生成 PAT。

LiteLLM 从环境变量 `SNOWFLAKE_JWT` 中读取令牌（与 JWT 认证共用同一变量），账户则读取自 `SNOWFLAKE_ACCOUNT_ID`。给 PAT 加上 `pat/` 前缀后，LiteLLM 会以 `PROGRAMMATIC_ACCESS_TOKEN` 而非 `KEYPAIR_JWT` 的形式发送该令牌。

```python
import os
from litellm import completion

os.environ["SNOWFLAKE_JWT"] = "pat/<your-programmatic-access-token>"
os.environ["SNOWFLAKE_ACCOUNT_ID"] = "<orgname>-<account_name>"

response = completion(
    model="snowflake/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Hello!"}],
)
```

### JWT（密钥对认证）

使用 Snowflake 密钥对生成 JWT。参见 [密钥对认证](https://docs.snowflake.com/en/user-guide/key-pair-auth)。

```python
import os
from litellm import completion

os.environ["SNOWFLAKE_JWT"] = "<your-jwt-token>"
os.environ["SNOWFLAKE_ACCOUNT_ID"] = "<orgname>-<account_name>"

response = completion(
    model="snowflake/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Hello!"}],
)
```

### 通过参数传递凭证

```python
from litellm import completion

# Using PAT
response = completion(
    model="snowflake/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Hello!"}],
    api_key="pat/<your-pat-token>",
    api_base="https://<account>.snowflakecomputing.com",
)

# Using JWT
response = completion(
    model="snowflake/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Hello!"}],
    api_key="<your-jwt-token>",
    account_id="<orgname>-<account_name>",
)
```

传入 `api_base` 时，请使用账户主机名（`https://<account>.snowflakecomputing.com`，可带 `/api/v2`）。若缺少 `/api/v2`，LiteLLM 会自动补上，并随后追加 `/cortex/v1/messages`、`/cortex/v1/chat/completions` 或 `/cortex/inference:embed` 路径；如果 `api_base` 已包含 `/cortex/v1`，就会拼出重复且无效的 URL。

全部认证方式参见 [Cortex REST API 认证](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api#authenticating-cortex-rest-api-requests)。

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["SNOWFLAKE_JWT"] = "pat/<your-pat>"
os.environ["SNOWFLAKE_ACCOUNT_ID"] = "<orgname>-<account_name>"

response = completion(
    model="snowflake/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "What is Snowflake Cortex?"}],
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

**1. 配置**

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: snowflake/claude-sonnet-4-6
      api_key: pat/<your-pat>
      api_base: https://<account>.snowflakecomputing.com
  - model_name: llama4-maverick
    litellm_params:
      model: snowflake/llama4-maverick
      api_key: pat/<your-pat>
      api_base: https://<account>.snowflakecomputing.com
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml
```

**3. 测试**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "claude-sonnet",
    "messages": [
        {"role": "user", "content": "What is Snowflake Cortex?"}
    ]
}'
```

</TabItem>
</Tabs>

## 支持的 OpenAI 参数

```
temperature, max_tokens, max_completion_tokens, top_p, stream,
tools, tool_choice
```

Claude 系列模型还接受 `thinking` 参数（见下文）。`response_format` 不受支持，除非设置了 `drop_params`，否则会抛出 `UnsupportedParamsError`。

## 流式调用

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["SNOWFLAKE_JWT"] = "pat/<your-pat>"
os.environ["SNOWFLAKE_ACCOUNT_ID"] = "<orgname>-<account_name>"

response = completion(
    model="snowflake/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Write a haiku about data."}],
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "claude-sonnet",
    "messages": [{"role": "user", "content": "Write a haiku about data."}],
    "stream": true
}'
```

</TabItem>
</Tabs>

## 工具与函数调用

在 Claude 及部分精选模型上受支持。LiteLLM 会自动将 OpenAI 工具格式转换为 Snowflake 的 `tool_spec` 格式。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os, json

os.environ["SNOWFLAKE_JWT"] = "pat/<your-pat>"
os.environ["SNOWFLAKE_ACCOUNT_ID"] = "<orgname>-<account_name>"

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name"}
                },
                "required": ["location"],
            },
        },
    }
]

response = completion(
    model="snowflake/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "What's the weather in San Francisco?"}],
    tools=tools,
    tool_choice="auto",
)

print(response.choices[0].message.tool_calls)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: snowflake/claude-sonnet-4-6
      api_key: pat/<your-pat>
      api_base: https://<account>.snowflakecomputing.com
```

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "claude-sonnet",
    "messages": [{"role": "user", "content": "What is the weather in SF?"}],
    "tools": [{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a location",
            "parameters": {
                "type": "object",
                "properties": {"location": {"type": "string"}},
                "required": ["location"]
            }
        }
    }],
    "tool_choice": "auto"
}'
```

</TabItem>
</Tabs>

## 思考与推理

Cortex 上的 Claude 模型支持扩展思考。直接传入提供商的 `thinking` 参数即可；Snowflake 不支持 `reasoning_effort` 参数，除非设置了 `drop_params`，否则会抛出 `UnsupportedParamsError`。

```python
from litellm import completion

response = completion(
    model="snowflake/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Solve: what is 127 * 389?"}],
    thinking={"type": "enabled", "budget_tokens": 1024},
)
print(response.choices[0].message.content)
```

## 提示词缓存

Snowflake Cortex 支持提示词缓存以降低成本：

- **OpenAI 模型**：提示词达到 1,024 Token 及以上时自动隐式缓存（无需修改代码）
- **Claude 模型**：通过 `cache_control` 断点进行显式缓存

缓存的输入 Token 达到 1,024 及以上时，按**常规输入价格的 10%** 计费（减免 90%）。

详见 [Cortex REST API 计费与成本分析](https://www.snowflake.com/en/developers/guides/cortex-rest-api-billing-cost/)。

## 嵌入

```python
from litellm import embedding
import os

os.environ["SNOWFLAKE_JWT"] = "pat/<your-pat>"
os.environ["SNOWFLAKE_ACCOUNT_ID"] = "<orgname>-<account_name>"

response = embedding(
    model="snowflake/snowflake-arctic-embed-l-v2.0",
    input=["Snowflake Cortex provides LLM inference"],
)
print(response.data[0]["embedding"][:5])
```

## 支持的模型

所有模型均可通过 `snowflake/` 前缀使用。

:::tip
关于最新的模型可用性、速率限制与定价，请参阅官方 [Cortex REST API 文档](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api)与[服务消耗表](https://www.snowflake.com/legal-files/CreditConsumptionTable.pdf)。
:::

### 对话补全模型

| 模型 | `litellm` 模型名 | 函数调用 | 视觉 | 提示词缓存 |
|---|---|---|---|---|
| Claude Sonnet 4.5 | `snowflake/claude-sonnet-4-5` | ✅ | ✅ | ✅ |
| Claude Sonnet 4.6 | `snowflake/claude-sonnet-4-6` | ✅ | ✅ | ✅ |
| Claude 4 Sonnet | `snowflake/claude-4-sonnet` | ✅ | ✅ | ✅ |
| Claude 4 Opus | `snowflake/claude-4-opus` | ✅ | ✅ | ✅ |
| Claude Haiku 4.5 | `snowflake/claude-haiku-4-5` | ✅ | ✅ | ✅ |
| Claude 3.7 Sonnet | `snowflake/claude-3-7-sonnet` | ✅ | ✅ | ✅ |
| Claude 3.5 Sonnet | `snowflake/claude-3-5-sonnet` | ✅ | ✅ | ✅ |
| OpenAI GPT-4.1 | `snowflake/openai-gpt-4.1` | ✅ | ✅ | ✅ |
| OpenAI GPT-5 | `snowflake/openai-gpt-5` | ✅ | ✅ | ✅ |
| OpenAI GPT-5 Mini | `snowflake/openai-gpt-5-mini` | ✅ | | |
| OpenAI GPT-5 Nano | `snowflake/openai-gpt-5-nano` | ✅ | | |
| DeepSeek R1 | `snowflake/deepseek-r1` | | | |
| Mistral Large 2 | `snowflake/mistral-large2` | ✅ | | |
| Llama 3.1 8B | `snowflake/llama3.1-8b` | | | |
| Llama 3.1 70B | `snowflake/llama3.1-70b` | ✅ | | |
| Llama 3.1 405B | `snowflake/llama3.1-405b` | ✅ | | |
| Llama 3.3 70B | `snowflake/llama3.3-70b` | ✅ | | |
| Llama 4 Maverick | `snowflake/llama4-maverick` | ✅ | | |
| Snowflake Llama 3.3 70B | `snowflake/snowflake-llama-3.3-70b` | ✅ | | |

### 嵌入模型

| 模型 | `litellm` 模型名 |
|---|---|
| Snowflake Arctic Embed L v2.0 | `snowflake/snowflake-arctic-embed-l-v2.0` |
| Snowflake Arctic Embed M v2.0 | `snowflake/snowflake-arctic-embed-m-v2.0` |
