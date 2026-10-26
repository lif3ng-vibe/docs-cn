# 工具搜索

工具搜索（tool search）让 Claude 能够从超大规模的工具目录（10,000+ 个工具）中按需动态发现并加载工具。它不会一开始就把所有工具定义都塞进上下文窗口（context window），而是由 Claude 检索你的工具目录，只加载自己需要的那几个工具。

## 支持的提供商

| 提供商 | Chat Completions API | Messages API |
|----------|---------------------|--------------|
| **Anthropic API** | ✅ | ✅ |
| **Azure Anthropic** (Microsoft Foundry) | ✅ | ✅ |
| **Google Cloud Vertex AI** | ✅ | ✅ |
| **Amazon Bedrock** | ✅（仅限 Invoke API，Claude 4.5 及更新版本） | ✅（仅限 Invoke API，Claude 4.5 及更新版本） |


## 优势

- **上下文效率**：避免工具定义大量挤占上下文窗口
- **工具选择更准**：工具数量一旦超过 30-50 个，Claude 的选择准确率就会下降；工具搜索即使面对上千个工具也能保持准确率
- **按需加载**：只有 Claude 需要时才会加载对应工具

## 工具搜索变体

LiteLLM 支持以下两种工具搜索变体：

### 1. Regex 工具搜索（`tool_search_tool_regex_20251119`）

由 Claude 构造正则表达式来检索工具，适合精确模式匹配（速度更快）。

### 2. BM25 工具搜索（`tool_search_tool_bm25_20251119`）

由 Claude 基于 BM25 算法、用自然语言查询检索工具，适合自然语言语义搜索。

**注意**：Bedrock 不支持 BM25 变体。

---

## Chat Completions API

### SDK 用法

#### Regex 工具搜索基础示例

```python showLineNumbers title="Basic Tool Search Example"
import litellm

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {"role": "user", "content": "What is the weather in San Francisco?"}
    ],
    tools=[
        # Tool search tool (regex variant)
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        # Deferred tool - will be loaded on-demand
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the weather at a specific location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"]
                        }
                    },
                    "required": ["location"]
                }
            },
            "defer_loading": True  # Mark for deferred loading
        }
    ]
)

print(response.choices[0].message.content)
```

#### BM25 工具搜索示例

```python showLineNumbers title="BM25 Tool Search"
import litellm

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {"role": "user", "content": "Search for Python files containing 'authentication'"}
    ],
    tools=[
        # Tool search tool (BM25 variant)
        {
            "type": "tool_search_tool_bm25_20251119",
            "name": "tool_search_tool_bm25"
        },
        # Deferred tools...
        {
            "type": "function",
            "function": {
                "name": "search_codebase",
                "description": "Search through codebase files by content and filename",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "file_pattern": {"type": "string"}
                    },
                    "required": ["query"]
                }
            },
            "defer_loading": True
        }
    ]
)
```

#### Azure Anthropic 示例

```python showLineNumbers title="Azure Anthropic Tool Search"
import litellm

response = litellm.completion(
    model="azure_anthropic/{{anthropic}}",
    api_base="https://<your-resource>.services.ai.azure.com/anthropic",
    api_key="your-azure-api-key",
    messages=[
        {"role": "user", "content": "What's the weather like?"}
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get current weather",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"}
                    },
                    "required": ["location"]
                }
            },
            "defer_loading": True
        }
    ]
)
```

#### Vertex AI 示例

```python showLineNumbers title="Vertex AI Tool Search"
import litellm

response = litellm.completion(
    model="vertex_ai/{{anthropic}}",
    vertex_project="your-project-id",
    vertex_location="us-central1",
    messages=[
        {"role": "user", "content": "Search my documents"}
    ],
    tools=[
        {
            "type": "tool_search_tool_bm25_20251119",
            "name": "tool_search_tool_bm25"
        },
        # Your deferred tools...
    ]
)
```

#### 流式支持

```python showLineNumbers title="Streaming with Tool Search"
import litellm

response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {"role": "user", "content": "Get the weather"}
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get weather information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"}
                    },
                    "required": ["location"]
                }
            },
            "defer_loading": True
        }
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### AI 网关用法

通过 LiteLLM 代理调用时，工具搜索会自动生效。

#### 代理配置

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```

#### 客户端请求

```python showLineNumbers title="Client Request via Proxy"
from anthropic import Anthropic

client = Anthropic(
    api_key="your-litellm-proxy-key",
    base_url="http://0.0.0.0:4000"
)

response = client.messages.create(
    model="claude-sonnet",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What's the weather?"}
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ]
)
```

---

## Messages API

Messages API 通过 `litellm.anthropic.messages` 接口提供原生的 Anthropic 风格工具搜索支持。

### SDK 用法

#### 基础示例

```python showLineNumbers title="Messages API - Basic Tool Search"
import litellm

response = await litellm.anthropic.messages.acreate(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "What's the weather in San Francisco?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get the current weather for a location",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    }
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    extra_headers={"anthropic-beta": "advanced-tool-use-2025-11-20"}
)

print(response)
```

#### Azure Anthropic Messages 示例

```python showLineNumbers title="Azure Anthropic Messages API"
import litellm

response = await litellm.anthropic.messages.acreate(
    model="azure_anthropic/{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "What's the stock price of Apple?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_stock_price",
            "description": "Get the current stock price for a ticker symbol",
            "input_schema": {
                "type": "object",
                "properties": {
                    "ticker": {
                        "type": "string",
                        "description": "The stock ticker symbol, e.g. AAPL"
                    }
                },
                "required": ["ticker"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    extra_headers={"anthropic-beta": "advanced-tool-use-2025-11-20"}
)
```

#### Vertex AI Messages 示例

```python showLineNumbers title="Vertex AI Messages API"
import litellm

response = await litellm.anthropic.messages.acreate(
    model="vertex_ai/{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "Search the web for information about AI"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_bm25_20251119",
            "name": "tool_search_tool_bm25"
        },
        {
            "name": "search_web",
            "description": "Search the web for information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query"
                    }
                },
                "required": ["query"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    extra_headers={"anthropic-beta": "tool-search-tool-2025-10-19"}
)
```

#### Bedrock Messages 示例

```python showLineNumbers title="Bedrock Messages API (Invoke)"
import litellm

response = await litellm.anthropic.messages.acreate(
    model="bedrock/invoke/anthropic.{{anthropic_large}}",
    messages=[
        {
            "role": "user",
            "content": "What's the weather?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    extra_headers={"anthropic-beta": "tool-search-tool-2025-10-19"}
)
```

#### 流式支持

```python showLineNumbers title="Messages API - Streaming"
import litellm
import json

response = await litellm.anthropic.messages.acreate(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "What's the weather in Tokyo?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    stream=True,
    extra_headers={"anthropic-beta": "advanced-tool-use-2025-11-20"}
)

async for chunk in response:
    if isinstance(chunk, bytes):
        chunk_str = chunk.decode("utf-8")
        for line in chunk_str.split("\n"):
            if line.startswith("data: "):
                try:
                    json_data = json.loads(line[6:])
                    print(json_data)
                except json.JSONDecodeError:
                    pass
```

### AI 网关用法

配置代理，改用 Messages API 端点。

#### 代理配置

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-sonnet-messages
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```

#### 客户端请求

```python showLineNumbers title="Client Request via Proxy (Messages API)"
from anthropic import Anthropic

client = Anthropic(
    api_key="your-litellm-proxy-key",
    base_url="http://0.0.0.0:4000"
)

response = client.messages.create(
    model="claude-sonnet-messages",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "What's the weather?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ],
    extra_headers={"anthropic-beta": "advanced-tool-use-2025-11-20"}
)

print(response)
```

---

## 更多资源

- [Anthropic 工具搜索官方文档](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/tool-search)
- [LiteLLM 工具调用指南](https://docs.litellm.ai/docs/completion/function_call)
