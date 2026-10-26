import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Web Fetch（网页抓取）

Web fetch 工具让 LLM 能够获取指定网页和 PDF 文档的完整内容，使 AI 模型可以访问互联网上的实时信息，并把网页内容融入自己的回答。

## Web Fetch 与 Web Search 的区别

**Web Fetch** 获取你提供 URL 的特定网页的完整内容，而 **Web Search** 会在互联网上搜索，根据你的查询找出相关信息。

| 特性 | Web Fetch | Web Search |
|---------|-----------|------------|
| **用途** | 从指定 URL 获取内容 | 在互联网上搜索信息 |
| **输入** | 由你提供要抓取的确切 URL | 由你提供搜索查询或问题 |
| **输出** | 指定 URL 的完整页面内容 | 包含相关信息的搜索结果 |
| **使用场景** | - 分析特定文章<br/>- 对比已知网站的内容<br/>- 从特定页面提取数据 | - 查找最新新闻/事件<br/>- 研究某个主题<br/>- 获取实时信息 |


**Web Fetch 示例**：“从 https://example.com/pricing 抓取内容并做总结”  
**Web Search 示例**：“本周 AI 领域有哪些最新动态？”

**支持的提供商：**
- Anthropic API (`anthropic/`)

**支持的工具类型：**
- `web_fetch_20250910` - 网页内容抓取工具，支持限制使用次数、按域名过滤，并支持引用


## 快速上手

### LiteLLM Python SDK

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

# Web fetch tool
tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch",
        "max_uses": 5,
    }
]

messages = [
    {
        "role": "user", 
        "content": "Please analyze the content at https://example.com/article and summarize the main points"
    }
]

response = completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools,
)

print(response)
```

### LiteLLM 代理（Proxy）

1. 在 config.yaml 中定义支持 web fetch 的模型

```yaml
model_list:
  - model_name: {{anthropic}} # Anthropic {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 用 OpenAI Python SDK 测试

```python
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # your litellm proxy api key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[
        {
            "role": "user", 
            "content": "Please fetch and analyze the content from https://news.ycombinator.com and tell me about the top stories"
        }
    ],
    tools=[
        {
            "type": "web_fetch_20250910",
            "name": "web_fetch",
            "max_uses": 5,
        }
    ]
)

print(response)
```

## 支持的模型

以下 Anthropic API 模型支持 web fetch：

- `claude-opus-4-6`（Claude Opus 4.6）
- `claude-sonnet-4-6`（Claude Sonnet 4.6）
- `claude-opus-4-5`（Claude Opus 4.5）
- `claude-sonnet-4-5`（Claude Sonnet 4.5）
- `claude-haiku-4-5`（Claude Haiku 4.5）
- `claude-opus-4-1-20250805`（Claude Opus 4.1）
- `claude-opus-4-20250514`（Claude Opus 4）
- `claude-sonnet-4-20250514`（Claude Sonnet 4）
- `claude-3-7-sonnet-20250219`（Claude Sonnet 3.7）
- `claude-3-5-sonnet-latest`（Claude Sonnet 3.5 v2，已弃用）
- `claude-3-5-haiku-latest`（Claude Haiku 3.5）

:::note
web fetch 工具目前不支持依赖 JavaScript 动态渲染的网站。
:::

## 使用示例

### 基础网页内容抓取

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch",
        "max_uses": 3,
    }
]

messages = [
    {
        "role": "user",
        "content": "Fetch the latest news from https://techcrunch.com and summarize the top 3 articles"
    }
]

response = completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools,
)

print(response)
```

### 研究与分析

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch", 
        "max_uses": 10,
    }
]

messages = [
    {
        "role": "user",
        "content": "Research the latest developments in AI by fetching content from multiple tech news websites and provide a comprehensive analysis"
    }
]

response = completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools,
)

print(response)
```

### 内容对比

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch",
        "max_uses": 5,
    }
]

messages = [
    {
        "role": "user",
        "content": "Compare the pricing information from https://openai.com/pricing and https://anthropic.com/pricing and create a comparison table"
    }
]

response = completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools,
)

print(response)
```

## 多工具组合的高级用法

你可以把 web fetch 与其他工具组合使用，例如 computer use 或文本编辑器：

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch",
        "max_uses": 5,
    },
    {
        "type": "text_editor_20250124", 
        "name": "str_replace_editor"
    }
]

messages = [
    {
        "role": "user",
        "content": "Fetch the latest AI research papers from arXiv, analyze them, and create a detailed report file with your findings"
    }
]
    
response = completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools,
)

print(response)
```

## 参数规格

### Web Fetch 工具（`web_fetch_20250910`）

web fetch 工具支持以下参数：

```json
{
  "type": "web_fetch_20250910",
  "name": "web_fetch",

  // Optional: Limit the number of fetches per request
  "max_uses": 10,

  // Optional: Only fetch from these domains
  "allowed_domains": ["example.com", "docs.example.com"],

  // Optional: Never fetch from these domains
  "blocked_domains": ["private.example.com"],

  // Optional: Enable citations for fetched content
  "citations": {
    "enabled": true
  },

  // Optional: Maximum content length in tokens
  "max_content_tokens": 100000
}
```
