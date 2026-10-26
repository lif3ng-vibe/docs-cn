import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 提示词缓存

支持的提供商：
- OpenAI（`openai/`）
- Anthropic API（`anthropic/`）
- Google AI Studio（`gemini/`）
- Vertex AI（`vertex_ai/`、`vertex_ai_beta/`）
- Bedrock（`bedrock/`、`bedrock/invoke/`、`bedrock/converse`）（[Bedrock 支持提示词缓存的全部模型](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html)）
- Bedrock Mantle 上的 OpenAI GPT-5.6 及更新版本（`bedrock_mantle/openai.gpt-5.6-*`、`bedrock_mantle/openai.gpt-6*`），参见 [Bedrock Mantle 显式缓存断点（OpenAI GPT-5.6 及更新版本）](#bedrock-mantle-显式缓存断点openai-gpt-56-及更新版本)
- Deepseek API（`deepseek/`）
- xAI（`xai/`）

:::warning[最低 token 数要求]
当输入低于提供商的最低 token 数时，提示词缓存（prompt caching）会被静默跳过，且**不会返回任何错误**。请务必检查响应中的 `cache_creation_input_tokens`，确认缓存确实生效。

| 提供商 | 最低输入 token 数 |
|---|---|
| OpenAI | 1,024 |
| Anthropic（Claude Opus 5、Fable 5、Mythos 5） | 512 |
| Anthropic（Claude Sonnet 5、Opus 4.8、Sonnet 4.x、Opus 4、4.1、Claude 3.x） | 1,024 |
| Anthropic（Claude Haiku 4.5、Opus 4.5、4.6） | 4,096 |
| Bedrock（Claude Opus 5） | 512 |
| Bedrock（Claude Sonnet 5、Opus 4.8、Sonnet 4.x、Claude 3.5、3.7） | 1,024 |
| Bedrock（Claude Haiku 4.5、Opus 4.5、4.6、4.7） | 4,096 |
| Google Gemini | 1,024 |
:::

对于上述受支持的提供商，LiteLLM 遵循 OpenAI 提示词缓存的用量对象格式：

```bash
"usage": {
  "prompt_tokens": 2006,
  "completion_tokens": 300,
  "total_tokens": 2306,
  "prompt_tokens_details": {
    "cached_tokens": 1920
  },
  "completion_tokens_details": {
    "reasoning_tokens": 0
  }
  # ANTHROPIC_ONLY #
  "cache_creation_input_tokens": 0
}
```

- `prompt_tokens`：全部提示词 token，包括缓存未命中（cache-miss）与缓存命中（cache-hit）的输入 token。
- `completion_tokens`：模型生成的输出 token。
- `total_tokens`：prompt_tokens 与 completion_tokens 之和。
- `prompt_tokens_details`：包含 cached_tokens 的对象。
    - `cached_tokens`：该次调用中命中缓存的 token 数。
- `completion_tokens_details`：包含 reasoning_tokens 的对象。
- **ANTHROPIC_ONLY**：`cache_creation_input_tokens` 是写入缓存的 token 数（Anthropic 会对此收费）。

## 快速上手

注意：OpenAI 的缓存仅对包含 1024 个及以上 token 的提示词生效

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import os

os.environ["OPENAI_API_KEY"] = ""

for _ in range(2):
    response = completion(
        model="{{openai_large}}",
        messages=[
            # System Message
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement"
                        * 400,
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                    }
                ],
            },
            {
                "role": "assistant",
                "content": "Certainly! the key terms and conditions are the following: the contract is 1 year long for $10/mo",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                    }
                ],
            },
        ],
        temperature=0.2,
        max_tokens=10,
    )

print("response=", response)
print("response.usage=", response.usage)

assert "prompt_tokens_details" in response.usage
assert response.usage.prompt_tokens_details.cached_tokens > 0
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: {{openai_large}}
      litellm_params:
        model: openai/{{openai_large}}
        api_key: os.environ/OPENAI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-<your-litellm-api-key>
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)

for _ in range(2):
    response = client.chat.completions.create(
        model="{{openai_large}}",
        messages=[
            # System Message
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement"
                        * 400,
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                    }
                ],
            },
            {
                "role": "assistant",
                "content": "Certainly! the key terms and conditions are the following: the contract is 1 year long for $10/mo",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                    }
                ],
            },
        ],
        temperature=0.2,
        max_tokens=10,
    )

print("response=", response)
print("response.usage=", response.usage)

assert "prompt_tokens_details" in response.usage
assert response.usage.prompt_tokens_details.cached_tokens > 0
```

</TabItem>
</Tabs>

### OpenAI `prompt_cache_key` 与 `prompt_cache_retention`

OpenAI 的提示词缓存是[**自动**](https://platform.openai.com/docs/guides/prompt-caching)的，无需任何 `cache_control` 消息注解。任何包含 1024 个及以上提示词 token 的请求都符合缓存条件。

OpenAI 还提供两个可选参数，用于更精细地控制缓存行为：

- **`prompt_cache_key`**（字符串）：一个路由提示，用于提升共享长公共前缀的请求的缓存命中率。相同 cache key 的请求会被路由到同一后端，从而提高缓存命中的可能性。
- **`prompt_cache_retention`**（`"in_memory"` 或 `"24h"`）：控制缓存 TTL。默认为 `"in_memory"`（5–10 分钟）。设为 `"24h"` 可延长缓存时长，将 KV 张量卸载到 GPU 本地存储。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = ""

response = completion(
    model="{{openai_large}}",
    messages=[
        {
            "role": "system",
            "content": "You are an AI assistant tasked with analyzing legal documents. "
            + "Here is the full text of a complex legal agreement " * 400,
        },
        {
            "role": "user",
            "content": "What are the key terms and conditions?",
        },
    ],
    prompt_cache_key="legal-doc-analysis",
    prompt_cache_retention="24h",
)
print(response.usage)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY",
    base_url="LITELLM_PROXY_BASE",
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[
        {
            "role": "system",
            "content": "You are an AI assistant tasked with analyzing legal documents. "
            + "Here is the full text of a complex legal agreement " * 400,
        },
        {
            "role": "user",
            "content": "What are the key terms and conditions?",
        },
    ],
    extra_body={
        "prompt_cache_key": "legal-doc-analysis",
        "prompt_cache_retention": "24h",
    },
)
print(response.usage)
```

</TabItem>
</Tabs>

### OpenAI 显式缓存断点（GPT-5.6 及更新版本）

GPT-5.6 及更新版本还支持[显式缓存断点（explicit cache breakpoints）](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-breakpoints)：在内容块上放置 `prompt_cache_breakpoint` 标记，再配合请求级的 `prompt_cache_options` 选择模式（`implicit` 表示在最新消息上保留 OpenAI 自动断点，并与你指定的断点并存；`explicit` 表示只使用你指定的断点）以及缓存 `ttl`（`30m`）。LiteLLM 会在 `/chat/completions`、`/responses`，以及面向 Anthropic 风格客户端的 `/v1/messages` 上原样透传这两者。接受该标记的模型在成本映射表（cost map）中带有 `supports_prompt_cache_breakpoint: true`，映射表中尚未显式标记的 GPT-5.6 及更新 OpenAI 模型名也按同样方式处理。如果想让 LiteLLM 根据部署配置自动放置该标记，参见[自动注入（auto-inject）教程](../tutorials/prompt_caching.md#openai-gpt-56-and-newer)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = ""

response = completion(
    model="openai/gpt-5.6",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents. "
                    + "Here is the full text of a complex legal agreement " * 400,
                    "prompt_cache_breakpoint": {"mode": "explicit"},
                }
            ],
        },
        {
            "role": "user",
            "content": "What are the key terms and conditions?",
        },
    ],
    prompt_cache_options={"mode": "explicit", "ttl": "30m"},
)
print(response.usage.prompt_tokens_details)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY",
    base_url="LITELLM_PROXY_BASE",
)

response = client.responses.create(
    model="gpt-5.6",
    input=[
        {
            "type": "message",
            "role": "developer",
            "content": [
                {
                    "type": "input_text",
                    "text": "You are an AI assistant tasked with analyzing legal documents. "
                    + "Here is the full text of a complex legal agreement " * 400,
                    "prompt_cache_breakpoint": {"mode": "explicit"},
                }
            ],
        },
        {
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": "What are the key terms and conditions?"}],
        },
    ],
    extra_body={"prompt_cache_options": {"mode": "explicit", "ttl": "30m"}},
)
print(response.usage.input_tokens_details)
```

</TabItem>
</Tabs>

### Bedrock Mantle 显式缓存断点（OpenAI GPT-5.6 及更新版本）

[Amazon Bedrock Mantle](../providers/bedrock_mantle.md) 上的 OpenAI GPT-5.6 及更新模型使用同一套 `prompt_cache_breakpoint` 标记和 `prompt_cache_options` 请求字段，但仅限 Responses API。LiteLLM 会在 `/responses` 上原样透传这两者；对这些模型的 `/chat/completions` 调用会桥接到 Responses API，标记仍保留在内容块上，因此部署上的 `cache_control_injection_points` 行为与 `openai/gpt-5.6` 完全一致（参见[自动注入教程](../tutorials/prompt_caching.md#openai-gpt-56-and-newer)）。根据 [AWS 公告](https://aws.amazon.com/blogs/machine-learning/introducing-explicit-prompt-caching-for-openai-gpt-5-6-models-on-amazon-bedrock/)，Mantle 的限制如下：每个被缓存的前缀至少需要 1,024 个 token；每个请求最多可在 `input_text`、`input_image` 和 `input_file` 块上携带 4 个断点；缓存前缀至少在 30 分钟内保持可用；缓存写入按输入价格的 1.25 倍计费，缓存读取享受 90% 折扣。写入缓存的那次调用会在响应中报告 `usage.input_tokens_details.cache_write_tokens`，读取缓存的调用则报告 `cached_tokens`，LiteLLM 分别按模型的 `cache_creation_input_token_cost` 与 `cache_read_input_token_cost` 对两者计价

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
import os

os.environ["AWS_BEARER_TOKEN_BEDROCK"] = ""

response = litellm.responses(
    model="bedrock_mantle/openai.gpt-5.6-sol",
    aws_region_name="us-east-1",
    input=[
        {
            "type": "message",
            "role": "developer",
            "content": [
                {
                    "type": "input_text",
                    "text": "You are an AI assistant tasked with analyzing legal documents. "
                    + "Here is the full text of a complex legal agreement " * 400,
                    "prompt_cache_breakpoint": {"mode": "explicit"},
                }
            ],
        },
        {
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": "What are the key terms and conditions?"}],
        },
    ],
    prompt_cache_options={"mode": "explicit", "ttl": "30m"},
)
print(response.usage.input_tokens_details)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: gpt-5.6-mantle
    litellm_params:
      model: bedrock_mantle/openai.gpt-5.6-sol
      aws_region_name: us-east-1
      api_key: os.environ/AWS_BEARER_TOKEN_BEDROCK
```

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY",
    base_url="LITELLM_PROXY_BASE",
)

response = client.responses.create(
    model="gpt-5.6-mantle",
    input=[
        {
            "type": "message",
            "role": "developer",
            "content": [
                {
                    "type": "input_text",
                    "text": "You are an AI assistant tasked with analyzing legal documents. "
                    + "Here is the full text of a complex legal agreement " * 400,
                    "prompt_cache_breakpoint": {"mode": "explicit"},
                }
            ],
        },
        {
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": "What are the key terms and conditions?"}],
        },
    ],
    extra_body={"prompt_cache_options": {"mode": "explicit", "ttl": "30m"}},
)
print(response.usage.input_tokens_details)
```

</TabItem>
</Tabs>

### Anthropic 示例

Anthropic 对缓存写入收费。

用 `"cache_control": {"type": "ephemeral"}` 指定要缓存的内容。

同样的格式也适用于 [Gemini / Vertex AI](#google-ai-studio--vertex-aigemini示例)。对其他提供商，该字段会被忽略。

<Tabs>
<TabItem value="sdk" label="SDK">

```python 
from litellm import completion 
import litellm 
import os 

litellm.set_verbose = True # 👈 SEE RAW REQUEST
os.environ["ANTHROPIC_API_KEY"] = "" 

response = completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

print(response.usage)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: {{anthropic}}
      litellm_params:
        model: anthropic/{{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python 
from openai import OpenAI 
import os

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-<your-litellm-api-key>
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)

response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

print(response.usage)
```

</TabItem>
</Tabs>

:::tip[最低 token 数（Anthropic）]
低于最低要求的提示词仍会正常处理，只是不做缓存，且不会返回任何错误。请检查响应中的 `cache_creation_input_tokens`。

| 模型 | 最低 token 数 |
|---|---|
| Claude Opus 5、Fable 5、Mythos 5 | 512 |
| Claude Sonnet 5、Opus 4.8 | 1,024 |
| Claude Opus 4.7 | 2,048 |
| Claude Haiku 4.5、Opus 4.5、Opus 4.6 | 4,096 |
| Claude Sonnet 4、Sonnet 4.5、Sonnet 4.6、Opus 4、Opus 4.1 | 1,024 |
| Claude 3.5 Haiku | 2,048 |
| Claude 3.x Haiku、Sonnet、Opus、3.5 Sonnet、3.7 Sonnet | 1,024 |

完整列表见 [Anthropic 提示词缓存文档](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)；这些最低要求适用于相应模型可用的所有平台。
:::

### Bedrock 示例

LiteLLM 会自动把 OpenAI 格式的 `cache_control` 标记转换为 Bedrock 原生的 `cachePoint` 格式，因此如果你已经在使用 `cache_control`，现有代码无需任何改动。

:::tip[最低 Token 数（Bedrock）]
低于下限的提示词会按无缓存方式处理，且不会返回任何错误。请检查响应中的 `cache_creation_input_tokens`。

| 模型系列 | 每次请求最低 Token 数 |
|---|---|
| Claude Opus 5 | 512 |
| Claude Sonnet 5, Opus 4.8 | 1,024 |
| Claude Haiku 4.5, Opus 4.5, Opus 4.6, Opus 4.7 | 4,096 |
| Claude Sonnet 4.5, Sonnet 4.6 | 1,024 |
| Claude 3.5 Sonnet v2, Claude 3.7 Sonnet | 1,024 |

各模型完整的下限表见 [Bedrock 提示词缓存文档](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html)。
:::

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

response = litellm.completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "<your large system prompt here, at least 1,024 tokens on Claude Sonnet 4.x, 4,096 on Haiku 4.5 and Opus 4.5+>",
                    "cache_control": {"type": "ephemeral"}
                }
            ]
        },
        {"role": "user", "content": "What is prompt caching?"}
    ]
)

print(response.usage)
# cache_creation_input_tokens > 0 on first call (cache written)
# cache_read_input_tokens > 0 on subsequent calls (cache hit)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-sonnet
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "bedrock-claude-sonnet",
    "messages": [
      {
        "role": "system",
        "content": [
          {
            "type": "text",
            "text": "<your large system prompt here, at least 1,024 tokens on Claude Sonnet 4.x, 4,096 on Haiku 4.5 and Opus 4.5+>",
            "cache_control": {"type": "ephemeral"}
          }
        ]
      },
      {"role": "user", "content": "What is prompt caching?"}
    ]
  }'
```

</TabItem>
</Tabs>

**支持的 Bedrock 模型**：

| 模型 | Bedrock 模型 ID | 最低 Token 数 | TTL 选项 |
|---|---|---|---|
| Claude Opus 5 | `anthropic.claude-opus-5` | 512 | 5 min, 1 hour |
| Claude Sonnet 5 | `anthropic.claude-sonnet-5` | 1,024 | 5 min, 1 hour |
| Claude Opus 4.8 | `anthropic.claude-opus-4-8` | 1,024 | 5 min, 1 hour |
| Claude 3.5 Sonnet v2 | `anthropic.claude-3-5-sonnet-20241022-v2:0` | 1,024 | 5 min, 1 hour |
| Claude 3.7 Sonnet | `anthropic.claude-3-7-sonnet-20250219-v1:0` | 1,024 | 5 min, 1 hour |
| Claude Opus 4 | `anthropic.claude-opus-4-20250514-v1:0` | 1,024 | 5 min, 1 hour |
| Claude Sonnet 4.5, 4.6 | `us.anthropic.claude-sonnet-4-5-*`, `us.anthropic.claude-sonnet-4-6-*` | 1,024 | 5 min, 1 hour |
| Claude Haiku 4.5 | `us.anthropic.claude-haiku-4-5-*` | 4,096 | 5 min, 1 hour |
| Claude Opus 4.5, 4.6, 4.7 | `us.anthropic.claude-opus-4-5-*`, `us.anthropic.claude-opus-4-6-*`, `us.anthropic.claude-opus-4-7-*` | 4,096 | 5 min, 1 hour |

上述模型同样支持跨区域推理配置（cross-region inference profile）。

支持的模型与区域的完整列表见 [AWS Bedrock 提示词缓存文档](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html)。

### Google AI Studio / Vertex AI（Gemini）示例

沿用同样的 Anthropic 风格 `cache_control` 格式；LiteLLM 会自动把它转换为 Google 的[上下文缓存 API](https://ai.google.dev/api/caching)。

**底层工作原理**：
1. 带 `cache_control` 的消息会被拆分出来，发送到 Google 的 `cachedContents` API
2. 缓存内容的 ID 随后作为 `cachedContent` 传入 Gemini 请求体
3. 适用于全部三个提供商：`gemini/`（Google AI Studio）、`vertex_ai/` 与 `vertex_ai_beta/`
4. 缓存内容至少需要 **1024 个 Token**；低于该值时会静默跳过缓存

:::warning

Gemini 2.5 及更新版本本来就会隐式缓存重复前缀，且不收费。发送 `cache_control`（手动添加或通过 `cache_control_injection_points`）会让请求改走显式缓存：被标记的前缀会移入一个 `cachedContents` 对象，隐式缓存不再作用于它，而且 Google 会对每个缓存对象收取存储费用。只有在确实想要显式缓存时，才为 Gemini 添加 `cache_control`。参见[自动注入教程](../tutorials/prompt_caching.md)

:::

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ""

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
)

print(response.usage)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: {{gemini_flash}}
      litellm_params:
        model: gemini/{{gemini_flash}}
        api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY",  # sk-<your-litellm-api-key>
    base_url="LITELLM_PROXY_BASE",  # http://0.0.0.0:4000
)

response = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
)

print(response.usage)
```

</TabItem>
</Tabs>

#### Vertex AI

使用 Vertex AI 时，加上 `vertex_ai/` 前缀：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="vertex_ai/{{gemini_flash}}",
    vertex_project="my-gcp-project",
    vertex_location="us-central1",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
)

print(response.usage)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: {{gemini_flash}}
      litellm_params:
        model: vertex_ai/{{gemini_flash}}
        vertex_project: my-gcp-project
        vertex_location: us-central1
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY",  # sk-<your-litellm-api-key>
    base_url="LITELLM_PROXY_BASE",  # http://0.0.0.0:4000
)

response = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ],
)

print(response.usage)
```

</TabItem>
</Tabs>

### DeepSeek 示例

用法与 OpenAI 相同。

```python 
from litellm import completion 
import litellm
import os 

os.environ["DEEPSEEK_API_KEY"] = "" 

litellm.set_verbose = True # 👈 SEE RAW REQUEST

model_name = "deepseek/deepseek-chat"
messages_1 = [
    {
        "role": "system",
        "content": "You are a history expert. The user will provide a series of questions, and your answers should be concise and start with `Answer:`",
    },
    {
        "role": "user",
        "content": "In what year did Qin Shi Huang unify the six states?",
    },
    {"role": "assistant", "content": "Answer: 221 BC"},
    {"role": "user", "content": "Who was the founder of the Han Dynasty?"},
    {"role": "assistant", "content": "Answer: Liu Bang"},
    {"role": "user", "content": "Who was the last emperor of the Tang Dynasty?"},
    {"role": "assistant", "content": "Answer: Li Zhu"},
    {
        "role": "user",
        "content": "Who was the founding emperor of the Ming Dynasty?",
    },
    {"role": "assistant", "content": "Answer: Zhu Yuanzhang"},
    {
        "role": "user",
        "content": "Who was the founding emperor of the Qing Dynasty?",
    },
]

message_2 = [
    {
        "role": "system",
        "content": "You are a history expert. The user will provide a series of questions, and your answers should be concise and start with `Answer:`",
    },
    {
        "role": "user",
        "content": "In what year did Qin Shi Huang unify the six states?",
    },
    {"role": "assistant", "content": "Answer: 221 BC"},
    {"role": "user", "content": "Who was the founder of the Han Dynasty?"},
    {"role": "assistant", "content": "Answer: Liu Bang"},
    {"role": "user", "content": "Who was the last emperor of the Tang Dynasty?"},
    {"role": "assistant", "content": "Answer: Li Zhu"},
    {
        "role": "user",
        "content": "Who was the founding emperor of the Ming Dynasty?",
    },
    {"role": "assistant", "content": "Answer: Zhu Yuanzhang"},
    {"role": "user", "content": "When did the Shang Dynasty fall?"},
]

response_1 = litellm.completion(model=model_name, messages=messages_1)
response_2 = litellm.completion(model=model_name, messages=message_2)

# Add any assertions here to check the response
print(response_2.usage)
```


## 计算成本

缓存命中的提示词 Token 与缓存未命中的 Token 成本可能不同。

使用 `completion_cost()` 函数计算成本（它同样能[处理提示词缓存的成本计算](https://github.com/BerriAI/litellm/blob/f7ce1173f3315cc6cae06cf9bcf12e54a2a19705/litellm/llms/anthropic/cost_calculation.py#L12)）。[**查看更多辅助函数**](./token_usage.md)

```python
cost = completion_cost(completion_response=response, model=model)
```

### 用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion, completion_cost
import litellm 
import os 

litellm.set_verbose = True # 👈 SEE RAW REQUEST
os.environ["ANTHROPIC_API_KEY"] = "" 
model = "anthropic/{{anthropic}}"
response = completion(
    model=model,
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 400,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

print(response.usage)

cost = completion_cost(completion_response=response, model=model) 

formatted_string = f"${float(cost):.10f}"
print(formatted_string)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

LiteLLM 会在响应头中返回计算出的成本：`x-litellm-response-cost`

```python
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-<your-litellm-api-key>..
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)
response = client.chat.completions.with_raw_response.create(
    messages=[{
        "role": "user",
        "content": "Say this is a test",
    }],
    model="{{openai_small}}",
)
print(response.headers.get('x-litellm-response-cost'))

completion = response.parse()  # get the object that `chat.completions.create()` would have returned
print(completion)
```

</TabItem>
</Tabs>

## 检查模型支持

用 `supports_prompt_caching()` 检查模型是否支持提示词缓存

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_prompt_caching

supports_pc: bool = supports_prompt_caching(model="anthropic/{{anthropic}}")

assert supports_pc
```

</TabItem>
<TabItem value="proxy" label="PROXY">

使用 `/model/info` 端点检查代理上的模型是否支持提示词缓存

1. 配置 config.yaml 

```yaml
model_list:
    - model_name: {{anthropic}}
      litellm_params:
        model: anthropic/{{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理 

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！ 

```bash
curl -L -X GET 'http://0.0.0.0:4000/v1/model/info' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
```

**预期响应**

```bash
{
    "data": [
        {
            "model_name": "{{anthropic}}",
            "litellm_params": {
                "model": "anthropic/{{anthropic}}"
            },
            "model_info": {
                "key": "{{anthropic}}",
                ...
                "supports_prompt_caching": true # 👈 LOOK FOR THIS!
            }
        }
    ]
}
```

</TabItem>
</Tabs>

它检查的是我们维护的[模型信息与成本映射表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)

## 延伸阅读

:::tip[自动注入提示词缓存]
想让 LiteLLM 在不修改代码的情况下自动添加 `cache_control` 指令？

阅读[**自动注入提示词缓存教程**](../tutorials/prompt_caching.md)，了解如何使用 `cache_control_injection_points` 自动缓存系统消息、按索引缓存指定消息，或按自定义注入模式缓存。
:::
