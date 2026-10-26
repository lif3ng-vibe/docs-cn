import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI - Response API

要在受支持的 OpenAI 模型上使用 Fast 模式、在 GPT-6 Astra 上使用 Ultrafast 模式，请参阅 [Fast 与 Ultrafast 模式](./ultrafast.md)，其中包含管理界面（Admin UI）的设置、配置方法与请求示例。

## 用法

### LiteLLM Python SDK


#### 非流式
```python showLineNumbers title="OpenAI Non-streaming Response"
import litellm

# Non-streaming response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 流式
```python showLineNumbers title="OpenAI Streaming Response"
import litellm

# Streaming response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

#### 网页搜索
```python showLineNumbers title="OpenAI Responses with Web Search"
import litellm

response = litellm.responses(
    model="openai/{{openai_large}}",
    input="What is the capital of France?",
    tools=[{
        "type": "web_search_preview",
        "search_context_size": "medium"  # Options: "low", "medium", "high"
    }]
)

print(response)
```

完整细节见 [Web Search 指南](../../completion/web_search.md)。

#### 流式图像生成
```python showLineNumbers title="OpenAI Streaming Image Generation"
import litellm
import base64

# Streaming image generation with partial images
stream = litellm.responses(
    model="{{openai_large}}",  # Use an actual image generation model
    input="Generate a gorgeous image of a river made of white owl feathers",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],

)

for event in stream:
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        image_base64 = event.partial_image_b64
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)
```

#### 获取 Response
```python showLineNumbers title="Get Response by ID"
import litellm

# First, create a response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

# Get the response ID
response_id = response.id

# Retrieve the response by ID
retrieved_response = litellm.get_responses(
    response_id=response_id
)

print(retrieved_response)

# For async usage
# retrieved_response = await litellm.aget_responses(response_id=response_id)
```

#### 删除 Response
```python showLineNumbers title="Delete Response by ID"
import litellm

# First, create a response
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

# Get the response ID
response_id = response.id

# Delete the response by ID
delete_response = litellm.delete_responses(
    response_id=response_id
)

print(delete_response)

# For async usage
# delete_response = await litellm.adelete_responses(response_id=response_id)
```


### 通过 OpenAI SDK 使用 LiteLLM 代理

1. 配置 config.yaml

```yaml showLineNumbers title="OpenAI Proxy Configuration"
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动 LiteLLM 代理服务器

```bash title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 通过 LiteLLM 代理使用 OpenAI SDK

#### 非流式
```python showLineNumbers title="OpenAI Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 流式
```python showLineNumbers title="OpenAI Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

#### 流式图像生成
```python showLineNumbers title="OpenAI Proxy Streaming Image Generation"
from openai import OpenAI
import base64

# Initialize client with your proxy URL
client = OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://localhost:4000")

stream = client.responses.create(
    model="{{openai_large}}",
    input="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],
)


for event in stream:
    print(f"event: {event}")
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        image_base64 = event.partial_image_b64
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)

```

#### 获取 Response
```python showLineNumbers title="Get Response by ID with OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# First, create a response
response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

# Get the response ID
response_id = response.id

# Retrieve the response by ID
retrieved_response = client.responses.retrieve(response_id)

print(retrieved_response)
```

#### 删除 Response
```python showLineNumbers title="Delete Response by ID with OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# First, create a response
response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Tell me a three sentence bedtime story about a unicorn."
)

# Get the response ID
response_id = response.id

# Delete the response by ID
delete_response = client.responses.delete(response_id)

print(delete_response)
```


## 支持的 Responses API 参数

| 提供商 | 支持的参数 |
|----------|---------------------|
| `openai` | [支持全部 Responses API 参数](https://github.com/BerriAI/litellm/blob/7c3df984da8e4dff9201e4c5353fdc7a2b441831/litellm/llms/openai/responses/transformation.py#L23) |

## 可复用提示词

使用 `prompt` 参数引用已存储的提示词模板，并可选地传入变量。

```python showLineNumbers title="Stored Prompt"
import litellm

response = litellm.responses(
    model="openai/{{openai_large}}",
    prompt={
        "id": "pmpt_abc123",
        "version": "2",
        "variables": {
            "customer_name": "Jane Doe",
            "product": "40oz juice box",
        },
    },
)

print(response)
```

通过 OpenAI SDK 调用 LiteLLM 代理时，同样支持该参数：

```python showLineNumbers title="Stored Prompt via Proxy"
from openai import OpenAI

client = OpenAI(base_url="http://localhost:4000", api_key="your-api-key")

response = client.responses.create(
    model="openai/{{openai_large}}",
    prompt={
        "id": "pmpt_abc123",
        "version": "2",
        "variables": {
            "customer_name": "Jane Doe",
            "product": "40oz juice box",
        },
    },
)

print(response)
```

## Computer Use 

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import litellm

# Non-streaming response
response = litellm.responses(
    model="computer-use-preview",
    tools=[{
        "type": "computer_use_preview",
        "display_width": 1024,
        "display_height": 768,
        "environment": "browser" # other possible values: "mac", "windows", "ubuntu"
    }],    
    input=[
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": "Check the latest OpenAI news on bing.com."
            }
            # Optional: include a screenshot of the initial state of the environment
            # {
            #     type: "input_image",
            #     image_url: f"data:image/png;base64,{screenshot_base64}"
            # }
          ]
        }
    ],
    reasoning={
        "summary": "concise",
    },
    truncation="auto"
)

print(response.output)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. 配置 config.yaml

```yaml showLineNumbers title="OpenAI Proxy Configuration"
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动 LiteLLM 代理服务器

```bash title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！

```python showLineNumbers title="OpenAI Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="computer-use-preview",
    tools=[{
        "type": "computer_use_preview",
        "display_width": 1024,
        "display_height": 768,
        "environment": "browser" # other possible values: "mac", "windows", "ubuntu"
    }],    
    input=[
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": "Check the latest OpenAI news on bing.com."
            }
            # Optional: include a screenshot of the initial state of the environment
            # {
            #     type: "input_image",
            #     image_url: f"data:image/png;base64,{screenshot_base64}"
            # }
          ]
        }
    ],
    reasoning={
        "summary": "concise",
    },
    truncation="auto"
)

print(response)
```


</TabItem>
</Tabs>


## MCP 工具

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python showLineNumbers title="MCP Tools with LiteLLM SDK"
import litellm
from typing import Optional

# Configure MCP Tools
MCP_TOOLS = [
    {
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "allowed_tools": ["ask_question"]
    }
]

# Step 1: Make initial request - OpenAI will use MCP LIST and return MCP calls for approval
response = litellm.responses(
    model="openai/{{openai_large}}",
    tools=MCP_TOOLS,
    input="What transport protocols does the 2025-03-26 version of the MCP spec support?"
)

# Get the MCP approval ID
mcp_approval_id = None
for output in response.output:
    if output.type == "mcp_approval_request":
        mcp_approval_id = output.id
        break

# Step 2: Send followup with approval for the MCP call
response_with_mcp_call = litellm.responses(
    model="openai/{{openai_large}}",
    tools=MCP_TOOLS,
    input=[
        {
            "type": "mcp_approval_response",
            "approve": True,
            "approval_request_id": mcp_approval_id
        }
    ],
    previous_response_id=response.id,
)

print(response_with_mcp_call)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. 配置 config.yaml

```yaml showLineNumbers title="OpenAI Proxy Configuration"
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动 LiteLLM 代理服务器

```bash title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！

```python showLineNumbers title="MCP Tools with OpenAI SDK via LiteLLM Proxy"
from openai import OpenAI
from typing import Optional

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Configure MCP Tools
MCP_TOOLS = [
    {
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "allowed_tools": ["ask_question"]
    }
]

# Step 1: Make initial request - OpenAI will use MCP LIST and return MCP calls for approval
response = client.responses.create(
    model="openai/{{openai_large}}",
    tools=MCP_TOOLS,
    input="What transport protocols does the 2025-03-26 version of the MCP spec support?"
)

# Get the MCP approval ID
mcp_approval_id = None
for output in response.output:
    if output.type == "mcp_approval_request":
        mcp_approval_id = output.id
        break

# Step 2: Send followup with approval for the MCP call
response_with_mcp_call = client.responses.create(
    model="openai/{{openai_large}}",
    tools=MCP_TOOLS,
    input=[
        {
            "type": "mcp_approval_response",
            "approve": True,
            "approval_request_id": mcp_approval_id
        }
    ],
    previous_response_id=response.id,
)

print(response_with_mcp_call)
```

</TabItem>
</Tabs>


## Verbosity 参数

`responses` API 支持 `verbosity` 参数。

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python showLineNumbers title="Verbosity Parameter"
from litellm import responses

question = "Write a poem about a boy and his first pet dog."

for verbosity in ["low", "medium", "high"]:
    response = responses(
        model="{{openai_small}}",
        input=question,
        text={"verbosity": verbosity}
    )

    print(response)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

```python
from openai import OpenAI
import pandas as pd
from IPython.display import display

client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

question = "Write a poem about a boy and his first pet dog."

data = []

for verbosity in ["low", "medium", "high"]:
    response = client.responses.create(
        model="{{openai_small}}",
        input=question,
        text={"verbosity": verbosity}
    )

    # Extract text
    output_text = ""
    for item in response.output:
        if hasattr(item, "content"):
            for content in item.content:
                if hasattr(content, "text"):
                    output_text += content.text

    usage = response.usage
    data.append({
        "Verbosity": verbosity,
        "Sample Output": output_text,
        "Output Tokens": usage.output_tokens
    })

# Create DataFrame
df = pd.DataFrame(data)

# Display nicely with centered headers
pd.set_option('display.max_colwidth', None)
styled_df = df.style.set_table_styles(
    [
        {'selector': 'th', 'props': [('text-align', 'center')]},  # Center column headers
        {'selector': 'td', 'props': [('text-align', 'left')]}     # Left-align table cells
    ]
)

display(styled_df)

```


</TabItem>
</Tabs>

## 函数调用

```python showLineNumbers title="Function Calling with Parallel Tool Calls"
import litellm
import json

tools = [
    {
        "type": "function",
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string"}
            },
            "required": ["location"]
        }
    }
]

# Step 1: Request with tools (parallel_tool_calls=True allows multiple calls)
response = litellm.responses(
    model="openai/{{openai_large}}",
    input=[{"role": "user", "content": "What's the weather in Paris and Tokyo?"}],
    tools=tools,
    parallel_tool_calls=True, # Defaults = True
)

# Step 2: Execute tool calls and collect results
tool_results = []
for output in response.output:
    if output.type == "function_call":
        result = {"temperature": 15, "condition": "sunny"}  # Your function logic here
        tool_results.append({
            "type": "function_call_output",
            "call_id": output.call_id,
            "output": json.dumps(result)
        })

# Step 3: Send results back
final_response = litellm.responses(
    model="openai/{{openai_large}}",
    input=tool_results,
    tools=tools,
)

print(final_response.output)
```

设置 `parallel_tool_calls=False` 可确保每轮最多调用一个工具（也可以一次都不调用）。[更多细节](https://platform.openai.com/docs/guides/function-calling#parallel-function-calling)。

## 工具搜索与命名空间

工具搜索（tool search）让模型在运行时动态加载所需工具，而不必把每个工具的定义都塞进提示词。把函数归入**命名空间**（namespaces），并加上 `defer_loading: true` 标记，模型就只会加载自己真正需要的 schema，从而节省 token。

需要 `gpt-5.4` 或更高版本。完整细节见 [OpenAI Tool Search 文档](https://developers.openai.com/api/docs/guides/tools-tool-search)。

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python showLineNumbers title="Tool Search with Namespaces"
import litellm

# Define namespaces with deferred tools
tools = [
    {"type": "tool_search"},  # Enable tool search
    {
        "type": "namespace",
        "name": "crm",
        "description": "CRM tools for customer management",
        "tools": [
            {
                "type": "function",
                "name": "get_customer",
                "description": "Get customer details by ID",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {"type": "string"}
                    },
                    "required": ["customer_id"],
                },
                "defer_loading": True,
            },
            {
                "type": "function",
                "name": "list_customers",
                "description": "List customers with optional filters",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "enum": ["active", "inactive"]},
                    },
                },
                "defer_loading": True,
            },
        ],
    },
    {
        "type": "namespace",
        "name": "billing",
        "description": "Billing and invoicing tools",
        "tools": [
            {
                "type": "function",
                "name": "get_invoice",
                "description": "Get an invoice by ID",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "invoice_id": {"type": "string"}
                    },
                    "required": ["invoice_id"],
                },
                "defer_loading": True,
            },
        ],
    },
]

response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Look up invoice INV-2024-001 from the billing system",
    tools=tools,
)

# The response contains tool_search_call, tool_search_output, and function_call items
for item in response.output:
    if isinstance(item, dict):
        if item["type"] == "tool_search_call":
            print(f"Searched namespaces: {item['arguments']['paths']}")
        elif item["type"] == "tool_search_output":
            print(f"Loaded {len(item['tools'])} tool(s)")
        elif item["type"] == "function_call":
            print(f"Called: {item.get('namespace', '')}.{item['name']}({item['arguments']})")
    else:
        if item.type == "function_call":
            print(f"Called: {item.namespace}.{item.name}({item.arguments})")
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. 配置 config.yaml

```yaml showLineNumbers title="OpenAI Proxy Configuration"
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动 LiteLLM 代理服务器

```bash title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！

```python showLineNumbers title="Tool Search via OpenAI SDK with LiteLLM Proxy"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-api-key"
)

response = client.responses.create(
    model="openai/{{openai_large}}",
    input="Look up invoice INV-2024-001 from the billing system",
    tools=[
        {"type": "tool_search"},
        {
            "type": "namespace",
            "name": "billing",
            "description": "Billing and invoicing tools",
            "tools": [
                {
                    "type": "function",
                    "name": "get_invoice",
                    "description": "Get an invoice by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {"invoice_id": {"type": "string"}},
                        "required": ["invoice_id"],
                    },
                    "defer_loading": True,
                },
            ],
        },
    ],
)

print(response.output)
```

</TabItem>
</Tabs>

### 经 Chat Completions 桥接的工具搜索

也可以通过 `/v1/chat/completions` 端点使用工具搜索，只需在模型名前加上 `openai/responses/` 前缀。请求仍会经由 Responses API 路由处理，但返回的是标准的对话补全（chat completions）响应。

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python showLineNumbers title="Tool Search via Chat Completions Bridge"
import litellm

response = litellm.completion(
    model="openai/responses/{{openai_large}}",
    messages=[{"role": "user", "content": "Look up invoice INV-2024-001"}],
    tools=[
        {"type": "tool_search"},
        {
            "type": "namespace",
            "name": "billing",
            "description": "Billing and invoicing tools",
            "tools": [
                {
                    "type": "function",
                    "name": "get_invoice",
                    "description": "Get an invoice by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {"invoice_id": {"type": "string"}},
                        "required": ["invoice_id"],
                    },
                    "defer_loading": True,
                },
            ],
        },
    ],
)

# Standard chat completions response
for tool_call in response.choices[0].message.tool_calls:
    print(f"Called: {tool_call.function.name}({tool_call.function.arguments})")
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

```bash showLineNumbers title="Tool Search via /v1/chat/completions"
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/responses/{{openai_large}}",
    "messages": [{"role": "user", "content": "Look up invoice INV-2024-001"}],
    "tools": [
      {"type": "tool_search"},
      {
        "type": "namespace",
        "name": "billing",
        "description": "Billing and invoicing tools",
        "tools": [
          {
            "type": "function",
            "name": "get_invoice",
            "description": "Get an invoice by ID",
            "parameters": {
              "type": "object",
              "properties": {"invoice_id": {"type": "string"}},
              "required": ["invoice_id"]
            },
            "defer_loading": true
          }
        ]
      }
    ]
  }'
```

</TabItem>
</Tabs>

## 自由格式函数调用

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">


```python showLineNumbers title="Free-form Function Calling"
import litellm

response = litellm.responses(
    model="{{openai_small}}",
    input="Please use the code_exec tool to calculate the area of a circle with radius equal to the number of 'r's in strawberry",
    text={"format": {"type": "text"}},
    tools=[
        {
            "type": "custom",
            "name": "code_exec",
            "description": "Executes arbitrary python code",
        }
    ]
)
print(response.output)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

```python showLineNumbers title="Free-form Function Calling"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

response = client.responses.create(
    model="{{openai_small}}",
    input="Please use the code_exec tool to calculate the area of a circle with radius equal to the number of 'r's in strawberry",
    text={"format": {"type": "text"}},
    tools=[
        {
            "type": "custom",
            "name": "code_exec",
            "description": "Executes arbitrary python code",
        }
    ]
)
print(response.output)
```


</TabItem>
</Tabs>

## 上下文无关文法

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python showLineNumbers title="Context-Free Grammar"
import litellm

import textwrap

# ----------------- grammars for MS SQL dialect -----------------
mssql_grammar = textwrap.dedent(r"""
            // ---------- Punctuation & operators ----------
            SP: " "
            COMMA: ","
            GT: ">"
            EQ: "="
            SEMI: ";"

            // ---------- Start ----------
            start: "SELECT" SP "TOP" SP NUMBER SP select_list SP "FROM" SP table SP "WHERE" SP amount_filter SP "AND" SP date_filter SP "ORDER" SP "BY" SP sort_cols SEMI

            // ---------- Projections ----------
            select_list: column (COMMA SP column)*
            column: IDENTIFIER

            // ---------- Tables ----------
            table: IDENTIFIER

            // ---------- Filters ----------
            amount_filter: "total_amount" SP GT SP NUMBER
            date_filter: "order_date" SP GT SP DATE

            // ---------- Sorting ----------
            sort_cols: "order_date" SP "DESC"

            // ---------- Terminals ----------
            IDENTIFIER: /[A-Za-z_][A-Za-z0-9_]*/
            NUMBER: /[0-9]+/
            DATE: /'[0-9]{4}-[0-9]{2}-[0-9]{2}'/
    """)

sql_prompt_mssql = (
    "Call the mssql_grammar to generate a query for Microsoft SQL Server that retrieve the "
    "five most recent orders per customer, showing customer_id, order_id, order_date, and total_amount, "
    "where total_amount > 500 and order_date is after '2025-01-01'. "
)


response = litellm.responses(
    model="{{openai_large}}",
    input=sql_prompt_mssql,
    text={"format": {"type": "text"}},
    tools=[
        {
            "type": "custom",
            "name": "mssql_grammar",
            "description": "Executes read-only Microsoft SQL Server queries limited to SELECT statements with TOP and basic WHERE/ORDER BY. YOU MUST REASON HEAVILY ABOUT THE QUERY AND MAKE SURE IT OBEYS THE GRAMMAR.",
            "format": {
                "type": "grammar",
                "syntax": "lark",
                "definition": mssql_grammar
            }
        },
    ],
    parallel_tool_calls=False
)

print("--- MS SQL Query ---")
print(response_mssql.output[1].input)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

```python showLineNumbers title="Context-Free Grammar"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

import textwrap

# ----------------- grammars for MS SQL dialect -----------------
mssql_grammar = textwrap.dedent(r"""
            // ---------- Punctuation & operators ----------
            SP: " "
            COMMA: ","
            GT: ">"
            EQ: "="
            SEMI: ";"

            // ---------- Start ----------
            start: "SELECT" SP "TOP" SP NUMBER SP select_list SP "FROM" SP table SP "WHERE" SP amount_filter SP "AND" SP date_filter SP "ORDER" SP "BY" SP sort_cols SEMI

            // ---------- Projections ----------
            select_list: column (COMMA SP column)*
            column: IDENTIFIER

            // ---------- Tables ----------
            table: IDENTIFIER

            // ---------- Filters ----------
            amount_filter: "total_amount" SP GT SP NUMBER
            date_filter: "order_date" SP GT SP DATE

            // ---------- Sorting ----------
            sort_cols: "order_date" SP "DESC"

            // ---------- Terminals ----------
            IDENTIFIER: /[A-Za-z_][A-Za-z0-9_]*/
            NUMBER: /[0-9]+/
            DATE: /'[0-9]{4}-[0-9]{2}-[0-9]{2}'/
    """)

sql_prompt_mssql = (
    "Call the mssql_grammar to generate a query for Microsoft SQL Server that retrieve the "
    "five most recent orders per customer, showing customer_id, order_id, order_date, and total_amount, "
    "where total_amount > 500 and order_date is after '2025-01-01'. "
)


response = client.responses.create(
    model="{{openai_large}}",
    input=sql_prompt_mssql,
    text={"format": {"type": "text"}},
    tools=[
        {
            "type": "custom",
            "name": "mssql_grammar",
            "description": "Executes read-only Microsoft SQL Server queries limited to SELECT statements with TOP and basic WHERE/ORDER BY. YOU MUST REASON HEAVILY ABOUT THE QUERY AND MAKE SURE IT OBEYS THE GRAMMAR.",
            "format": {
                "type": "grammar",
                "syntax": "lark",
                "definition": mssql_grammar
            }
        },
    ],
    parallel_tool_calls=False
)

print("--- MS SQL Query ---")
print(response_mssql.output[1].input)
```

</TabItem>
</Tabs>

## 最简推理

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">


```python showLineNumbers title="Minimal Reasoning"
import litellm

response = litellm.responses(
    model="{{openai_large}}",
    input= [{ 'role': 'developer', 'content': prompt }, 
            { 'role': 'user', 'content': 'The food that the restaurant was great! I recommend it to everyone.' }],
    reasoning = {
        "effort": "minimal"
    },
)

print(response)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

```python showLineNumbers title="Minimal Reasoning"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)


prompt = "Classify sentiment of the review as positive|neutral|negative. Return one word only." 


response = client.responses.create(
    model="{{openai_large}}",
    input= [{ 'role': 'developer', 'content': prompt }, 
            { 'role': 'user', 'content': 'The food that the restaurant was great! I recommend it to everyone.' }],
    reasoning = {
        "effort": "minimal"
    },
)

# Extract model's text output
output_text = ""
for item in response.output:
    if hasattr(item, "content"):
        for content in item.content:
            if hasattr(content, "text"):
                output_text += content.text

# Token usage details
usage = response.usage

print("--------------------------------")
print("Output:")
print(output_text)



```


</TabItem>
</Tabs>

