import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 结构化输出（Structured Outputs，即 JSON 模式）

## 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os 

os.environ["OPENAI_API_KEY"] = ""

response = completion(
  model="{{openai_small}}",
  response_format={ "type": "json_object" },
  messages=[
    {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
    {"role": "user", "content": "Who won the world series in 2020?"}
  ]
)
print(response.choices[0].message.content)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant designed to output JSON."
      },
      {
        "role": "user",
        "content": "Who won the world series in 2020?"
      }
    ]
  }'
```
</TabItem>
</Tabs>

## 检查模型支持


### 1. 检查模型是否支持 `response_format`

调用 `litellm.get_supported_openai_params`，即可查询某个模型或提供商是否支持 `response_format`。

```python
from litellm import get_supported_openai_params

params = get_supported_openai_params(model="anthropic.{{anthropic}}", custom_llm_provider="bedrock")

assert "response_format" in params
```

### 2. 检查模型是否支持 `json_schema`

这个检查用于确认你能否传入以下两种形式：
- `response_format={ "type": "json_schema", "json_schema": … , "strict": true }`
- `response_format=<Pydantic Model>`

```python
from litellm import supports_response_schema

assert supports_response_schema(model="{{gemini_pro}}", custom_llm_provider="bedrock")
```

各模型对 `response_schema` 的完整支持情况，见 [model_prices_and_context_window.json](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)。

## 传入 `json_schema`

要使用结构化输出（Structured Outputs），只需指定

```
response_format: { "type": "json_schema", "json_schema": … , "strict": true }
```

适用于：
- OpenAI 模型
- Azure OpenAI 模型
- xAI 模型（Grok-2 及更高版本）
- Google AI Studio 的 Gemini 模型
- Vertex AI 模型（Gemini + Anthropic）
- Bedrock 模型
- Anthropic API 模型
- Groq 模型
- Ollama 模型
- Databricks 模型

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion 
from pydantic import BaseModel

# add to env var 
os.environ["OPENAI_API_KEY"] = ""

messages = [{"role": "user", "content": "List 5 important events in the XIX century"}]

class CalendarEvent(BaseModel):
  name: str
  date: str
  participants: list[str]

class EventsList(BaseModel):
    events: list[CalendarEvent]

resp = completion(
    model="{{openai_large}}",
    messages=messages,
    response_format=EventsList
)

print("Received={}".format(resp))

events_list = EventsList.model_validate_json(resp.choices[0].message.content)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 在 config.yaml 中添加 OpenAI 模型

```yaml
model_list:
  - model_name: "{{openai_large}}"
    litellm_params:
      model: "{{openai_large}}"
```

2. 使用 config.yaml 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 用 OpenAI SDK / Curl 调用！

只需把 OpenAI SDK 中的 `base_url` 换成代理地址，就能以 `json_schema` 的方式调用 OpenAI 模型。

**OpenAI SDK**
```python
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI(
    api_key="anything", # 👈 PROXY KEY (can be anything, if master_key not set)
    base_url="http://0.0.0.0:4000" # 👈 PROXY BASE URL
)

class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
    steps: list[Step]
    final_answer: str

completion = client.beta.chat.completions.parse(
    model="{{openai_large}}",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"}
    ],
    response_format=MathReasoning,
)

math_reasoning = completion.choices[0].message.parsed
```

**Curl**

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "math_reasoning",
        "schema": {
          "type": "object",
          "properties": {
            "steps": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "explanation": { "type": "string" },
                  "output": { "type": "string" }
                },
                "required": ["explanation", "output"],
                "additionalProperties": false
              }
            },
            "final_answer": { "type": "string" }
          },
          "required": ["steps", "final_answer"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

</TabItem>
</Tabs>


## 校验 JSON Schema


并非所有模型都原生支持直接传入 `json_schema`。为解决这个问题，LiteLLM 支持在客户端校验 JSON Schema。

```
litellm.enable_json_schema_validation=True
```
设置 `litellm.enable_json_schema_validation=True` 后，LiteLLM 会用 `jsonvalidator` 校验返回的 JSON。

[**查看代码**](https://github.com/BerriAI/litellm/blob/671d8ac496b6229970c7f2a3bdedd6cb84f0746b/litellm/litellm_core_utils/json_validation_rule.py#L4)


<Tabs>
<TabItem value="sdk" label="SDK">

```python
# !gcloud auth application-default login - run this to add vertex credentials to your env
import litellm, os
from litellm import completion 
from pydantic import BaseModel 


messages=[
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."},
    ]

litellm.enable_json_schema_validation = True
litellm.set_verbose = True # see the raw request made by litellm

class CalendarEvent(BaseModel):
  name: str
  date: str
  participants: list[str]

resp = completion(
    model="gemini/{{gemini_pro}}",
    messages=messages,
    response_format=CalendarEvent,
)

print("Received={}".format(resp))
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 创建 config.yaml
```yaml
model_list:
  - model_name: "{{gemini_flash}}"
    litellm_params:
      model: "gemini/{{gemini_flash}}"
      api_key: os.environ/GEMINI_API_KEY

litellm_settings:
  enable_json_schema_validation: True
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."},
    ],
    "response_format": { 
        "type": "json_schema",
        "json_schema": {
          "name": "math_reasoning",
          "schema": {
            "type": "object",
            "properties": {
              "steps": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "explanation": { "type": "string" },
                    "output": { "type": "string" }
                  },
                  "required": ["explanation", "output"],
                  "additionalProperties": false
                }
              },
              "final_answer": { "type": "string" }
            },
            "required": ["steps", "final_answer"],
            "additionalProperties": false
          },
          "strict": true
        }
    },
  }'
```

</TabItem>
</Tabs>

## Gemini 原生 JSON Schema 格式（Gemini 2.0+）

Gemini 2.0+ 模型会自动改用原生的 `responseJsonSchema` 参数，与标准 JSON Schema 格式的兼容性更好。

### 优势（Gemini 2.0+）
- 采用标准 JSON Schema 格式（类型名小写，如 `string`、`object`）
- 支持 `additionalProperties: false`，校验更严格
- 与 Pydantic 的 `model_json_schema()` 兼容性更好
- 无需再提供 `propertyOrdering`

### 用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
from pydantic import BaseModel

class UserInfo(BaseModel):
    name: str
    age: int

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Extract: John is 25 years old"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"}
                },
                "required": ["name", "age"],
                "additionalProperties": False  # Supported on Gemini 2.0+
            }
        }
    }
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [
        {"role": "user", "content": "Extract: John is 25 years old"}
    ],
    "response_format": {
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"}
                },
                "required": ["name", "age"],
                "additionalProperties": false
            }
        }
    }
  }'
```

</TabItem>
</Tabs>

### 模型行为

| 模型 | 使用的格式 | `additionalProperties` 支持 |
|-------|-------------|-------------------------------|
| Gemini 2.0+ | `responseJsonSchema` (JSON Schema) | ✅ 是 |
| Gemini 1.5 | `responseSchema` (OpenAPI) | ❌ 否 |

LiteLLM 会根据模型版本自动选择合适的格式。
