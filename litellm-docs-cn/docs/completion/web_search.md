import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 网络搜索

在 litellm 中使用网络搜索

| 功能 | 说明 |
|---------|---------|
| 支持的端点 | - `/chat/completions` <br/> - `/responses` <br/> - `/images/generations`（仅限 Gemini 图像模型） |
| 支持的提供商 | `openai`, `xai`, `vertex_ai`, `anthropic`, `gemini`, `perplexity` |
| LiteLLM 成本追踪 | ✅ 支持 |
| LiteLLM 版本 | `v1.71.0+` |

## 各家使用哪种搜索引擎？

各家提供商使用各自的搜索后端：

| 提供商 | 搜索引擎 | 说明 |
|----------|---------------|-------|
| **OpenAI**（`gpt-5-search-api`、`gpt-4o-search-preview`、`gpt-4o-mini-search-preview`） | OpenAI 内部搜索 | 实时网络数据 |
| **xAI**（`grok-3`） | xAI 自家搜索 + X/Twitter | 实时社交媒体数据 |
| **Google AI/Vertex**（`gemini-2.0-flash`） | **Google 搜索** | 使用真实的 Google 搜索结果 |
| **Anthropic**（`claude-3-5-sonnet`） | Anthropic 网络搜索 | 实时网络数据 |
| **Perplexity** | Perplexity 搜索引擎 | AI 驱动的搜索与推理 |

:::warning[重要：只有搜索模型支持 `web_search_options`]
对 OpenAI 而言，只有专门的搜索模型才支持 `web_search_options` 参数：
- `gpt-4o-search-preview`
- `gpt-4o-mini-search-preview`
- `gpt-5-search-api`

**`{{openai_large}}`、`{{openai_small}}` 这类常规模型不支持 `web_search_options`**
:::

:::tip[`web_search_options` 参数是可选的]
搜索模型（如 `gpt-4o-search-preview`）即使不传 `web_search_options` 参数，也会**自动搜索网络**。

需要以下调整时使用 `web_search_options`：
- 调整 `search_context_size`（`"low"`、`"medium"`、`"high"`）
- 指定 `user_location` 以获得本地化结果
:::

:::info
**Anthropic 网络搜索模型**：支持网络搜索的 Claude 模型：`claude-3-5-sonnet-latest`、`claude-3-5-sonnet-20241022`、`claude-3-5-haiku-latest`、`claude-3-5-haiku-20241022`、`claude-3-7-sonnet-20250219`
:::

## OpenAI 网络搜索的两种方式

根据端点和模型的不同，OpenAI 提供两种不同的网络搜索使用方式：

| 方式 | 端点 | 模型 | 启用方法 |
|----------|----------|--------|---------------|
| **搜索模型** | `/chat/completions` | `gpt-5-search-api`、`gpt-4o-search-preview`、`gpt-4o-mini-search-preview` | 传入 `web_search_options` 参数 |
| **网络搜索工具** | `/responses` | `gpt-5`、`gpt-4.1`、`gpt-4o` 及其他常规模型 | 传入 `web_search_preview` 工具 |

:::tip[搜索模型会自动搜索]
`gpt-5-search-api` 这类搜索模型即使不传 `web_search_options` 参数，也会**自动搜索网络**。需要设置 `search_context_size`（`"low"`、`"medium"`、`"high"`）或指定 `user_location` 以获得本地化结果时，再使用 `web_search_options`。
:::

## /chat/completions (litellm.completion)

### 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion

response = completion(
    model="openai/gpt-5-search-api",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "medium"  # Options: "low", "medium", "high"
    }
)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 配置 config.yaml

```yaml
model_list:
  # OpenAI search models
  - model_name: gpt-5-search-api
    litellm_params:
      model: openai/gpt-5-search-api
      api_key: os.environ/OPENAI_API_KEY

  - model_name: gpt-4o-search-preview
    litellm_params:
      model: openai/gpt-4o-search-preview
      api_key: os.environ/OPENAI_API_KEY

  # xAI
  - model_name: grok-3
    litellm_params:
      model: xai/grok-3
      api_key: os.environ/XAI_API_KEY

  # Anthropic
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

  # VertexAI
  - model_name: gemini-2-flash
    litellm_params:
      model: {{gemini_flash}}
      vertex_project: your-project-id
      vertex_location: us-central1

  # Google AI Studio
  - model_name: gemini-2-flash-studio
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GOOGLE_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下

```python showLineNumbers
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-5-search-api",  # or any other web search enabled model
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?"
        }
    ],
    extra_body={
        "web_search_options": {
            "search_context_size": "medium"
        }
    }
)
```
</TabItem>
</Tabs>

### 搜索上下文大小

<Tabs>
<TabItem value="sdk" label="SDK">

**OpenAI**（使用 web_search_options）
```python showLineNumbers
from litellm import completion

# Customize search context size
response = completion(
    model="openai/gpt-5-search-api",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }
)
```

**xAI**（使用 web_search_options）

xAI 已不再在自己的 `/chat/completions` 上执行网络搜索，因此当设置了 `web_search_options` 时，LiteLLM 会把请求发给 xAI 的 Responses API 并附带 `web_search` 工具，再把结果转换回对话补全（chat completion）。xAI 不支持 `search_context_size`，所以该参数会被丢弃。

```python showLineNumbers
from litellm import completion

response = completion(
    model="xai/grok-3",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={}  # search_context_size is ignored for xAI
)
```

**Anthropic**（使用 web_search_options）
```python showLineNumbers
from litellm import completion

# Customize search context size for Anthropic
response = completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "medium",  # Options: "low", "medium" (default), "high"
        "user_location": {
            "type": "approximate",
            "approximate": {
                "city": "San Francisco",
            },
        }
    }
)
```

**VertexAI/Gemini**（使用 web_search_options）
```python showLineNumbers
from litellm import completion

# Customize search context size for Gemini
response = completion(
    model="{{gemini_flash}}",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }
)
```

**Gemini 图像生成**（在 `/images/generations` 上使用 web_search_options）

```python showLineNumbers
from litellm import image_generation

response = image_generation(
    model="gemini/gemini-3.1-flash-image-preview",
    prompt="Generate an image of the latest iPhone design",
    web_search_options={},
)
```

适用于 `vertex_ai/gemini-3.1-flash-image-preview` 及其他 Gemini 图像模型。详见 [Vertex AI 图像生成](../providers/vertex_image.md) 和 [Google AI Studio 图像生成](../providers/google_ai_studio/image_gen.md)。
</TabItem>
<TabItem value="proxy" label="代理">

```python showLineNumbers
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

# Customize search context size
response = client.chat.completions.create(
    model="grok-3",  # works with any web search enabled model
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?"
        }
    ],
    web_search_options={
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }
)
```
</TabItem>
</Tabs>



## /responses (litellm.responses)

在 `{{openai_large}}`、`{{openai_small}}` 等模型上使用 `web_search_preview` 工具。

:::info
`gpt-5-search-api`、`gpt-4o-search-preview` 这类专用搜索模型**不**支持 `/responses` 端点。请改用 `/chat/completions` + `web_search_options`（见上文）。
:::

### 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import responses

response = responses(
    model="openai/{{openai_large}}",
    input="What is the capital of France?",
    tools=[{
        "type": "web_search_preview"  # enables web search with default medium context size
    }]
)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下

```python showLineNumbers
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.responses.create(
    model="{{openai_large}}",
    tools=[{
        "type": "web_search_preview"
    }],
    input="What is the capital of France?",
)

print(response.output_text)
```
</TabItem>
</Tabs>

### 搜索上下文大小

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import responses

# Customize search context size
response = responses(
    model="openai/{{openai_large}}",
    input="What is the capital of France?",
    tools=[{
        "type": "web_search_preview",
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }]
)
```
</TabItem>
<TabItem value="proxy" label="代理">

```python showLineNumbers
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

# Customize search context size
response = client.responses.create(
    model="{{openai_large}}",
    tools=[{
        "type": "web_search_preview",
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }],
    input="What is the capital of France?",
)

print(response.output_text)
```
</TabItem>
</Tabs>

## 在 config.yaml 中配置网络搜索

可以直接在代理配置文件里设置默认的网络搜索选项：

<Tabs>
<TabItem value="default" label="默认网络搜索">

```yaml
model_list:
  # Enable web search by default for all requests to this model
  - model_name: grok-3
    litellm_params:
      model: xai/grok-3
      api_key: os.environ/XAI_API_KEY
      web_search_options: {}  # Enables web search with default settings
```

### 高级配置
可以配置 LiteLLM 的路由器（Router），在需要时剔除不支持网络搜索的模型，例如
```yaml
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      api_base: "x.openai.azure.com/"
      api_version: 2025-03-01-preview
    model_info:
      supports_web_search: False <---- KEY CHANGE!
```
在这个例子里，LiteLLM 仍会把 LLM 请求路由到两个部署上，但涉及网络搜索时，只会路由到 OpenAI。

</TabItem>
<TabItem value="custom" label="自定义搜索上下文">

```yaml
model_list:
  # Set custom web search context size
  - model_name: grok-3
    litellm_params:
      model: xai/grok-3
      api_key: os.environ/XAI_API_KEY
      web_search_options:
        search_context_size: "high"  # Options: "low", "medium", "high"
  
  # OpenAI search model with custom context size
  - model_name: gpt-5-search-api
    litellm_params:
      model: openai/gpt-5-search-api
      api_key: os.environ/OPENAI_API_KEY
      web_search_options:
        search_context_size: "low"

  # Gemini with medium context (default)
  - model_name: gemini-2-flash
    litellm_params:
      model: {{gemini_flash}}
      vertex_project: your-project-id
      vertex_location: us-central1
      web_search_options:
        search_context_size: "medium"
```

</TabItem>
</Tabs>

**注意**：在配置中设置 `web_search_options` 后，它会作用于发往该模型的所有请求。用户仍可以在自己的 API 请求里传入 `web_search_options` 来覆盖这些设置。

## 检查模型是否支持网络搜索

<Tabs>
<TabItem label="SDK" value="sdk">

使用 `litellm.supports_web_search(model="model_name")`，如果模型能执行网络搜索则返回 `True`

```python showLineNumbers
# Check OpenAI models
assert litellm.supports_web_search(model="openai/gpt-5-search-api") == True
assert litellm.supports_web_search(model="openai/gpt-4o-search-preview") == True

# Check xAI models
assert litellm.supports_web_search(model="xai/grok-3") == True

# Check Anthropic models
assert litellm.supports_web_search(model="anthropic/{{anthropic}}") == True

# Check VertexAI models
assert litellm.supports_web_search(model="{{gemini_flash}}") == True

# Check Google AI Studio models
assert litellm.supports_web_search(model="gemini/{{gemini_flash}}") == True
```
</TabItem>

<TabItem label="代理" value="proxy">

1. 在 config.yaml 中定义模型

```yaml
model_list:
  # OpenAI
  - model_name: gpt-5-search-api
    litellm_params:
      model: openai/gpt-5-search-api
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      supports_web_search: True

  - model_name: gpt-4o-search-preview
    litellm_params:
      model: openai/gpt-4o-search-preview
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      supports_web_search: True

  # xAI
  - model_name: grok-3
    litellm_params:
      model: xai/grok-3
      api_key: os.environ/XAI_API_KEY
    model_info:
      supports_web_search: True
  
  # Anthropic
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
    model_info:
      supports_web_search: True
  
  # VertexAI
  - model_name: gemini-2-flash
    litellm_params:
      model: {{gemini_flash}}
      vertex_project: your-project-id
      vertex_location: us-central1
    model_info:
      supports_web_search: True
  
  # Google AI Studio
  - model_name: gemini-2-flash-studio
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GOOGLE_API_KEY
    model_info:
      supports_web_search: True
```

2. 运行代理服务器

```bash
litellm --config config.yaml
```

3. 调用 `/model_group/info` 检查模型是否支持网络搜索

```shell
curl -X 'GET' \
  'http://localhost:4000/model_group/info' \
  -H 'accept: application/json' \
  -H "x-api-key: $LITELLM_API_KEY"
```

预期响应

```json showLineNumbers
{
  "data": [
    {
      "model_group": "gpt-5-search-api",
      "providers": ["openai"],
      "max_tokens": 128000,
      "supports_web_search": true
    },
    {
      "model_group": "gpt-4o-search-preview",
      "providers": ["openai"],
      "max_tokens": 128000,
      "supports_web_search": true
    },
    {
      "model_group": "grok-3",
      "providers": ["xai"],
      "max_tokens": 131072,
      "supports_web_search": true
    },
    {
      "model_group": "gemini-2-flash",
      "providers": ["vertex_ai"],
      "max_tokens": 8192,
      "supports_web_search": true
    }
  ]
}
```

</TabItem>
</Tabs>

## 网络搜索成本追踪

LiteLLM 会按各提供商的计费模式自动追踪网络搜索成本。这部分费用叠加在标准的按 Token 计价之上。

### 各提供商如何对网络搜索收费

| 提供商 | 计费单位 | 计费方式 |
|----------|-------------|--------------|
| **Gemini 3.x**（3-flash、3-pro、3.1-*） | 按搜索查询计费 | 每次内部搜索查询单独计费。一个提示词（prompt）可能触发多次查询。 |
| **Gemini 2.x**（2.0-flash、2.5-flash、2.5-pro） | 按启用 grounding 的提示计费 | 每次启用 grounding 的 API 调用收取固定费用，与内部实际执行了多少次查询无关。 |
| **OpenAI**（gpt-4o-search、gpt-5-search） | 按搜索上下文大小计费 | 费用随 `search_context_size`（`low`、`medium`、`high`）而变。 |
| **Anthropic**（带网络搜索的 Claude） | 按搜索请求计费 | 每次调用网络搜索工具收取固定费用。 |
| **Perplexity**（sonar、sonar-pro） | 按搜索上下文大小计费 | 费用随 `search_context_size` 而变。 |

### 定价配置

网络搜索成本在 `model_prices_and_context_window.json` 中通过两个字段定义：

- **`search_context_cost_per_query`**：每个计费单位（按搜索上下文档位）的费用。
- **`web_search_billing_unit`** *（仅限 Gemini 模型）*：`"per_query"`（每次搜索查询单独计费）或 `"per_prompt"`（默认；每次使用搜索的 API 调用收取固定费用）。

```json keep-model-ids
{
    "gemini/{{gemini_flash}}": {
        "web_search_billing_unit": "per_query",
        "search_context_cost_per_query": {
            "search_context_size_low": 0.014,
            "search_context_size_medium": 0.014,
            "search_context_size_high": 0.014
        }
    },
    "gemini/gemini-2.5-flash": {
        "search_context_cost_per_query": {
            "search_context_size_low": 0.035,
            "search_context_size_medium": 0.035,
            "search_context_size_high": 0.035
        }
    }
}
```

:::info
未设置 `web_search_billing_unit` 的模型默认为 `"per_prompt"`：每次使用网络搜索的 API 调用收取一笔固定费用，与模型内部执行了多少次查询无关。
:::

可以在代理配置里通过 `model_info` 覆盖这些值：

```yaml
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: gemini/{{gemini_flash}}
    model_info:
      web_search_billing_unit: per_query
      search_context_cost_per_query:
        search_context_size_low: 0.014
        search_context_size_medium: 0.014
        search_context_size_high: 0.014
```

### LiteLLM 如何统计搜索用量

网络搜索请求的次数存储在 `usage.prompt_tokens_details.web_search_requests` 中。LiteLLM 会从各提供商的响应里提取这一数值：

- **Gemini**：从响应中的 `groundingMetadata.webSearchQueries` 提取。对 Gemini 2.x 而言，该值被钳制为 1（按提示计费）。
- **OpenAI**：直接在使用量元数据（usage metadata）中给出。
- **Anthropic**：通过 `server_tool_use.web_search_requests` 给出。
- **xAI**：记录在 `usage.server_side_tool_usage_details.web_search_calls` 而不是 `web_search_requests` 中，不会读取 `num_sources_used`。当 xAI 返回 `usage.cost` 时，LiteLLM 直接把它用作响应成本，其中已包含搜索费用。

```python
response = litellm.completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Latest tech news?"}],
    web_search_options={"search_context_size": "medium"},
)

# Check web search usage
print(response.usage.prompt_tokens_details.web_search_requests)  # e.g., 3

# Get total cost (includes token cost + web search cost)
cost = litellm.completion_cost(completion_response=response)
print(f"Total cost: ${cost}")
```
