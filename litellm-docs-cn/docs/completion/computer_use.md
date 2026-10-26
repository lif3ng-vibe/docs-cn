import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 计算机使用

计算机使用（Computer Use）让模型通过截图并执行点击、输入、滚动等操作来与计算机界面交互，从而自主操控桌面环境。

**支持的提供商**：
- Anthropic API (`anthropic/`)
- Bedrock (Anthropic) (`bedrock/`)
- Vertex AI (Anthropic) (`vertex_ai/`)

**支持的工具类型**：
- `computer` - 带显示参数的计算机交互工具
- `bash` - Bash shell 工具  
- `text_editor` - 文本编辑器工具
- `web_search` - 网络搜索工具

LiteLLM 会在所有支持的提供商之间统一计算机使用工具的标准。

## 快速上手

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python keep-model-ids
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

# Computer use tool
tools = [
    {
        "type": "computer_20241022",
        "name": "computer",
        "display_height_px": 768,
        "display_width_px": 1024,
        "display_number": 0,
    }
]

messages = [
    {
        "role": "user", 
        "content": [
            {
                "type": "text",
                "text": "Take a screenshot and tell me what you see"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                }
            }
        ]
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM 代理服务器">

1. 在 config.yaml 中定义计算机使用模型

```yaml keep-model-ids
model_list:
  - model_name: claude-3-5-sonnet-latest # Anthropic claude-3-5-sonnet-latest
    litellm_params:
      model: anthropic/claude-3-5-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: claude-bedrock         # Bedrock Anthropic model
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20241022-v2:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
    model_info:
      supports_computer_use: True        # set supports_computer_use to True so /model/info returns this attribute as True
```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 使用 OpenAI Python SDK 测试

```python keep-model-ids
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # your litellm proxy api key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet-latest",
    messages=[
        {
            "role": "user", 
            "content": [
                {
                    "type": "text",
                    "text": "Take a screenshot and tell me what you see"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    }
                }
            ]
        }
    ],
    tools=[
        {
            "type": "computer_20241022",
            "name": "computer",
            "display_height_px": 768,
            "display_width_px": 1024,
            "display_number": 0,
        }
    ]
)

print(response)
```

</TabItem>
</Tabs>

## 检查模型是否支持 `computer use`

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

使用 `litellm.utils` 中的 `supports_computer_use(model="")`：模型支持 computer use 时返回 `True`，不支持则返回 `False`。该函数并未在顶层 `litellm` 包中导出，因此 `litellm.supports_computer_use` 会抛出 `AttributeError`

```python
from litellm.utils import supports_computer_use

assert supports_computer_use(model="anthropic/{{anthropic}}") == True
assert supports_computer_use(model="anthropic/{{anthropic_large}}") == True
assert supports_computer_use(model="bedrock/us.anthropic.{{anthropic}}") == True
assert supports_computer_use(model="vertex_ai/{{anthropic}}") == True
assert supports_computer_use(model="openai/{{openai_large}}") == False
```
</TabItem>

<TabItem label="LiteLLM 代理服务器" value="proxy">

1. 在 config.yaml 中定义计算机使用模型

```yaml
model_list:
  - model_name: claude-sonnet          # Anthropic model, supports_computer_use comes from the model cost map
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: claude-bedrock         # Bedrock Anthropic model
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20241022-v2:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
    model_info:
      supports_computer_use: True        # set supports_computer_use to True so /model/info returns this attribute as True
```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 调用 `/model/info` 检查模型是否支持 `computer use`。该标志挂在每个部署（deployment）的 `model_info` 上。`/model_group/info` 不会返回 `supports_computer_use`

```shell
curl -X 'GET' \
  'http://localhost:4000/model/info' \
  -H 'accept: application/json' \
  -H "x-api-key: $LITELLM_API_KEY"
```

预期响应（节选）

```json
{
  "data": [
    {
      "model_name": "claude-sonnet",
      "litellm_params": {"model": "anthropic/{{anthropic}}"},
      "model_info": {
        "litellm_provider": "anthropic",
        "mode": "chat",
        "supports_computer_use": true,
        "supports_vision": true,
        "supports_function_calling": true
      }
    },
    {
      "model_name": "claude-bedrock",
      "litellm_params": {"model": "bedrock/us.anthropic.claude-3-5-sonnet-20241022-v2:0"},
      "model_info": {
        "litellm_provider": "bedrock",
        "mode": "chat",
        "supports_computer_use": true,
        "supports_vision": true,
        "supports_function_calling": true
      }
    }
  ]
}
```

</TabItem>
</Tabs>

## 不同的工具类型

计算机使用支持多种工具类型，覆盖不同的交互方式：

<Tabs>
<TabItem value="computer" label="Computer 工具">

`computer_20241022` 工具提供直接的屏幕交互能力。

```python keep-model-ids
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "computer_20241022", 
        "name": "computer",
        "display_height_px": 768,
        "display_width_px": 1024,
        "display_number": 0,
    }
]

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text", 
                "text": "Click on the search button in the screenshot"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                }
            }
        ]
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="bash" label="Bash 工具">

`bash_20241022` 工具提供命令行访问能力。

```python keep-model-ids
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "bash_20241022",
        "name": "bash"
    }
]

messages = [
    {
        "role": "user",
        "content": "List the files in the current directory using bash"
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="text_editor" label="文本编辑器工具">

`text_editor_20250124` 工具提供文本文件编辑能力。

```python keep-model-ids
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "text_editor_20250124",
        "name": "str_replace_editor"
    }
]

messages = [
    {
        "role": "user",
        "content": "Create a simple Python hello world script"
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
</Tabs>

## 多工具组合的高级用法

你可以在单个请求中组合使用多种计算机使用工具：

```python keep-model-ids
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "computer_20241022",
        "name": "computer", 
        "display_height_px": 768,
        "display_width_px": 1024,
        "display_number": 0,
    },
    {
        "type": "bash_20241022",
        "name": "bash"
    },
    {
        "type": "text_editor_20250124", 
        "name": "str_replace_editor"
    }
]

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Take a screenshot, then create a file describing what you see, and finally use bash to show the file contents"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    }
                }
            ]
        }
    ]
    
response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
            messages=messages,
            tools=tools,
)

print(response)
```

## 规格说明

### Computer 工具（`computer_20241022`）

```json
{
  "type": "computer_20241022",
  "name": "computer",
  "display_height_px": 768,    // Required: Screen height in pixels  
  "display_width_px": 1024,    // Required: Screen width in pixels
  "display_number": 0          // Optional: Display number (default: 0)
}
```

### Bash 工具（`bash_20241022`）

```json
{
  "type": "bash_20241022", 
  "name": "bash"              // Required: Tool name
}
```

### 文本编辑器工具（`text_editor_20250124`）

```json
{
  "type": "text_editor_20250124",
  "name": "str_replace_editor"  // Required: Tool name
}
```

### 网络搜索工具（`web_search_20250305`）

```json
{
  "type": "web_search_20250305",
  "name": "web_search"         // Required: Tool name
}
```
