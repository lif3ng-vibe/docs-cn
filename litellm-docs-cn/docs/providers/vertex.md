import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# VertexAI [Gemini]

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | Vertex AI 在 2026 年由 Google 更名为 Gemini Enterprise Agent Platform，是 Google Cloud 旗下用于构建和使用生成式 AI 的全托管平台。 |
| LiteLLM 中的提供商路由 | `vertex_ai/` |
| 提供商文档链接 | [Gemini Enterprise Agent Platform（原 Vertex AI）↗](https://cloud.google.com/products/gemini-enterprise-agent-platform) |
| Base URL | 1. 区域端点<br/>`https://{vertex_location}-aiplatform.googleapis.com/`<br/>2. 全球端点（可用范围有限）<br/>`https://aiplatform.googleapis.com/`|
| 支持的操作 | [`/chat/completions`](#使用示例), `/completions`, [`/embeddings`](#嵌入模型), [`/audio/speech`](/docs/providers/vertex_speech), [`/audio/transcriptions`](/docs/providers/vertex_transcription), [`/fine_tuning`](#微调-api), [`/batches`](/docs/providers/vertex_batch), [`/files`](/docs/providers/vertex_batch), `/images`, [`/rerank`](#rerank-api) |

:::info[Vertex AI 现已更名为 Gemini Enterprise Agent Platform]
Google 在 2026 年把 Vertex AI 更名为 Gemini Enterprise Agent Platform（简称 Agent Platform）。这次更名只涉及品牌：API 主机名（`{vertex_location}-aiplatform.googleapis.com`）、模型 ID、GCP 认证以及请求与响应结构都保持不变，因此 LiteLLM 继续以 `vertex_ai/` 作为提供商路由。你的 `model_list`、凭据、路由和成本追踪（cost tracking）都不需要任何改动。Google 的[更名对照表](https://docs.cloud.google.com/gemini-enterprise-agent-platform/vertex-ai-name-changes)把每个旧产品名映射到了对应的新名称。
:::

:::tip[Vertex AI 与 Gemini API 的区别]
| 模型格式 | 提供商 | 所需认证 |
|-------------|----------|---------------|
| `vertex_ai/gemini-2.0-flash` | Vertex AI | GCP 凭据 + 项目 |
| `gemini-2.0-flash`（无前缀） | Vertex AI | GCP 凭据 + 项目 |
| `gemini/gemini-2.0-flash` | Gemini API | `GEMINI_API_KEY`（简单 API 密钥） |

**如果你只想像 OpenAI 那样直接用一个 API 密钥**，改用 `gemini/` 前缀即可。参见 [Gemini - Google AI Studio](./gemini.md)。

不带前缀的模型默认走 Vertex AI，需要 GCP 认证。
:::

<br />
<br />

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/liteLLM_VertextAI_Example.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

## `vertex_ai/` 路由

`vertex_ai/` 路由使用 [Vertex AI 的 REST API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/models/inference#syntax)。

```python
from litellm import completion
import json 

## GET CREDENTIALS 
## RUN ## 
# !gcloud auth application-default login - run this to add vertex credentials to your env
## OR ## 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)

## COMPLETION CALL 
response = completion(
  model="vertex_ai/{{gemini_pro}}",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  vertex_credentials=vertex_credentials_json
)
```

### **系统消息**

```python
from litellm import completion
import json 

## GET CREDENTIALS 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)


response = completion(
  model="vertex_ai/{{gemini_pro}}",
  messages=[{"content": "You are a good bot.","role": "system"}, {"content": "Hello, how are you?","role": "user"}], 
  vertex_credentials=vertex_credentials_json
)
```

### **函数调用**

使用 `tool_choice="required"` 可以强制 Gemini 发起工具调用。

```python
from litellm import completion
import json 

## GET CREDENTIALS 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)


messages = [
    {
        "role": "system",
        "content": "Your name is Litellm Bot, you are a helpful assistant",
    },
    # User asks for their name and weather in San Francisco
    {
        "role": "user",
        "content": "Hello, what is your name and can you tell me the weather?",
    },
]

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    }
                },
                "required": ["location"],
            },
        },
    }
]

data = {
    "model": "vertex_ai/{{gemini_pro}}",
    "messages": messages,
    "tools": tools,
    "tool_choice": "required",
    "vertex_credentials": vertex_credentials_json
}

## COMPLETION CALL 
print(completion(**data))
```

### **JSON Schema**

从 v`1.40.1+` 起，LiteLLM 支持为 Vertex AI 上的 Gemini 模型（例如 `{{gemini_pro}}`）传入 `response_schema` 参数。对于原生不支持这一能力的模型，LiteLLM 会把 schema 以一段由用户控制的提示词附加到消息列表里。

**响应 Schema**
<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]

response_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }


completion(
    model="vertex_ai/{{gemini_pro}}", 
    messages=messages, 
    response_format={"type": "json_object", "response_schema": response_schema} # 👈 KEY CHANGE
    )

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 把模型加进 config.yaml
```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      vertex_project: "project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json" # [OPTIONAL] Do this OR `!gcloud auth application-default login` - run this to add vertex credentials to your env
```
或者
```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      litellm_credential_name: vertex-global
      vertex_project: project-name-here
      vertex_location: global
      base_model: gemini
      model_info:
        provider: Vertex
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 发起请求！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
  "model": "{{gemini_pro}}",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object", "response_schema": { 
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }}
}
'
```

</TabItem>
</Tabs>

**校验 Schema**

要校验 response_schema，请设置 `enforce_validation: true`。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion, JSONSchemaValidationError
try: 
	completion(
    model="vertex_ai/{{gemini_pro}}", 
    messages=messages, 
    response_format={
        "type": "json_object", 
        "response_schema": response_schema,
        "enforce_validation": true # 👈 KEY CHANGE
    }
	)
except JSONSchemaValidationError as e: 
	print("Raw Response: {}".format(e.raw_response))
	raise e
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 把模型加进 config.yaml
```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      vertex_project: "project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json" # [OPTIONAL] Do this OR `!gcloud auth application-default login` - run this to add vertex credentials to your env
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 发起请求！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
  "model": "{{gemini_pro}}",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object", "response_schema": { 
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }, 
    "enforce_validation": true
    }
}
'
```

</TabItem>
</Tabs>

LiteLLM 会对照 schema 校验响应，如果响应不符合 schema，就抛出 `JSONSchemaValidationError`。

`JSONSchemaValidationError` 继承自 `openai.APIError`。

可以通过 `e.raw_response` 拿到原始响应。

**自行把 schema 写进提示词**

```python 
from litellm import completion 

## GET CREDENTIALS 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)

messages = [
    {
        "role": "user",
        "content": """
List 5 popular cookie recipes.

Using this JSON schema:

    Recipe = {"recipe_name": str}

Return a `list[Recipe]`
        """
    }
]

completion(model="vertex_ai/{{gemini_flash}}", messages=messages, response_format={ "type": "json_object" })
```

### **Google 托管工具（网页搜索、代码执行等）**

#### **网页搜索**

为 Vertex AI 调用加上 Google 搜索结果的 grounding 能力。

[**相关 VertexAI 文档**](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/grounding#examples)

通过 `response_obj._hidden_params["vertex_ai_grounding_metadata"]` 查看 grounding 元数据。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion 

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{"googleSearch": {}}] # 👈 ADD GOOGLE SEARCH

resp = litellm.completion(
                    model="vertex_ai/{{gemini_pro}}",
                    messages=[{"role": "user", "content": "Who won the world cup?"}],
                    tools=tools,
                )

print(resp)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000/v1/" # point to litellm proxy
)

response = client.chat.completions.create(
    model="{{gemini_pro}}",
    messages=[{"role": "user", "content": "Who won the world cup?"}],
    tools=[{"googleSearch": {}}],
)

print(response)
```
</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{gemini_pro}}",
    "messages": [
      {"role": "user", "content": "Who won the world cup?"}
    ],
   "tools": [
        {
            "googleSearch": {} 
        }
    ]
  }'

```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

#### **URL 上下文**
借助 URL 上下文（URL context）工具，你可以在提示词里给 Gemini 附上若干 URL 作为补充上下文。模型随后会从这些 URL 抓取内容，并据此形成和调整自己的回答。

[**相关文档**](https://ai.google.dev/gemini-api/docs/url-context)

通过 `response_obj._hidden_params["vertex_ai_url_context_metadata"]` 查看 grounding 元数据。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

# 👇 ADD URL CONTEXT
tools = [{"urlContext": {}}]

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Summarize this document: https://ai.google.dev/gemini-api/docs/models"}],
    tools=tools,
)

print(response)

# Access URL context metadata
url_context_metadata = response.model_extra['vertex_ai_url_context_metadata']
urlMetadata = url_context_metadata[0]['urlMetadata'][0]
print(f"Retrieved URL: {urlMetadata['retrievedUrl']}")
print(f"Retrieval Status: {urlMetadata['urlRetrievalStatus']}")
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
$ litellm --config /path/to/config.yaml
```

3. 发起请求！
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [{"role": "user", "content": "Summarize this document: https://ai.google.dev/gemini-api/docs/models"}],
    "tools": [{"urlContext": {}}]
  }'
```
</TabItem>
</Tabs>

#### **企业版网页搜索**

你也可以使用 `enterpriseWebSearch` 工具来做[符合企业合规要求的搜索](https://cloud.google.com/vertex-ai/generative-ai/docs/grounding/web-grounding-enterprise)。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion 

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{"enterpriseWebSearch": {}}] # 👈 ADD GOOGLE ENTERPRISE SEARCH

resp = litellm.completion(
                    model="vertex_ai/{{gemini_pro}}",
                    messages=[{"role": "user", "content": "Who won the world cup?"}],
                    tools=tools,
                )

print(resp)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000/v1/" # point to litellm proxy
)

response = client.chat.completions.create(
    model="{{gemini_pro}}",
    messages=[{"role": "user", "content": "Who won the world cup?"}],
    tools=[{"enterpriseWebSearch": {}}],
)

print(response)
```
</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{gemini_pro}}",
    "messages": [
      {"role": "user", "content": "Who won the world cup?"}
    ],
   "tools": [
        {
            "enterpriseWebSearch": {} 
        }
    ]
  }'

```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

#### **代码执行**



<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion
import os

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env


tools = [{"codeExecution": {}}] # 👈 ADD CODE EXECUTION

response = completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{gemini_flash}}",
  "messages": [{"role": "user", "content": "What is the weather in San Francisco?"}],
  "tools": [{"codeExecution": {}}]
}
'
```

</TabItem>
</Tabs>





#### **Google Maps**

借助 Google Maps 为 Gemini 模型提供基于位置的上下文。

[**相关 Vertex AI 文档**](https://ai.google.dev/gemini-api/docs/grounding#google-maps)

<Tabs>
<TabItem value="sdk" label="SDK">

**基本用法：仅启用 Widget**

```python showLineNumbers
from litellm import completion

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{"googleMaps": {"enableWidget": "ENABLE_WIDGET"}}] # 👈 ADD GOOGLE MAPS

resp = litellm.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What restaurants are nearby?"}],
    tools=tools,
)

print(resp)
```

**携带位置数据**

你可以指定一个位置，让模型的回答结合该位置的具体信息：

```python showLineNumbers
from litellm import completion

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{
    "googleMaps": {
        "enableWidget": "ENABLE_WIDGET",
        "latitude": 37.7749,        # San Francisco latitude
        "longitude": -122.4194,     # San Francisco longitude
        "languageCode": "en_US"     # Optional: language for results
    }
}] # 👈 ADD GOOGLE MAPS WITH LOCATION

resp = litellm.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What restaurants are nearby?"}],
    tools=tools,
)

print(resp)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

**基本用法：仅启用 Widget**

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000/v1/" # point to litellm proxy
)

response = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=[{"role": "user", "content": "What restaurants are nearby?"}],
    tools=[{"googleMaps": {"enableWidget": "ENABLE_WIDGET"}}],
)

print(response)
```

**携带位置数据**

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000/v1/" # point to litellm proxy
)

response = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=[{"role": "user", "content": "What restaurants are nearby?"}],
    tools=[{
        "googleMaps": {
            "enableWidget": "ENABLE_WIDGET",
            "latitude": 37.7749,        # San Francisco latitude
            "longitude": -122.4194,     # San Francisco longitude
            "languageCode": "en_US"     # Optional: language for results
        }
    }],
)

print(response)
```
</TabItem>
<TabItem value="curl" label="cURL">

**基本用法：仅启用 Widget**

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [
      {"role": "user", "content": "What restaurants are nearby?"}
    ],
   "tools": [
        {
            "googleMaps": {"enableWidget": "ENABLE_WIDGET"}
        }
    ]
  }'
```

**携带位置数据**

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [
      {"role": "user", "content": "What restaurants are nearby?"}
    ],
   "tools": [
        {
            "googleMaps": {
                "enableWidget": "ENABLE_WIDGET",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "languageCode": "en_US"
            }
        }
    ]
  }'
```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

#### **从 Vertex AI SDK 迁移到 LiteLLM（GROUNDING）**


如果你最初的 VertexAI Grounding 代码是这样的，

```python
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig, Tool, grounding


vertexai.init(project=project_id, location="us-central1")

model = GenerativeModel("{{gemini_flash}}")

# Use Google Search for grounding
tool = Tool.from_google_search_retrieval(grounding.GoogleSearchRetrieval())

prompt = "When is the next total solar eclipse in US?"
response = model.generate_content(
    prompt,
    tools=[tool],
    generation_config=GenerationConfig(
        temperature=0.0,
    ),
)

print(response)
```

那么换成 LiteLLM 之后就是这样写：

```python
from litellm import completion


# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{"googleSearch": {"disable_attributon": False}}] # 👈 ADD GOOGLE SEARCH

resp = litellm.completion(
                    model="vertex_ai/{{gemini_pro}}",
                    messages=[{"role": "user", "content": "Who won the world cup?"}],
                    tools=tools,
                    vertex_project="project-id"
                )

print(resp)
```

### **思考 / `reasoning_content`**

LiteLLM 会把 OpenAI 的 `reasoning_effort` 转换为 Gemini 的 `thinking` 参数。[源码](https://github.com/BerriAI/litellm/blob/620664921902d7a9bfb29897a7b27c1a7ef4ddfb/litellm/llms/vertex_ai/gemini/vertex_and_google_ai_studio_gemini.py#L362)

此外，针对非推理类 Gemini 请求，还增加了一个非 OpenAI 标准的取值 “disable”。

**映射关系**

| reasoning_effort | thinking |
| ---------------- | -------- |
| "disable"        | "budget_tokens": 0    |
| "low"            | "budget_tokens": 1024 |
| "medium"         | "budget_tokens": 2048 |
| "high"           | "budget_tokens": 4096 |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# !gcloud auth application-default login - run this to add vertex credentials to your env

resp = completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
    vertex_project="project-id",
    vertex_location="us-central1"
)

```

</TabItem>

<TabItem value="proxy" label="代理">

1. 配置 config.yaml

```yaml
- model_name: {{gemini_flash}}
  litellm_params:
    model: vertex_ai/{{gemini_flash}}
    vertex_credentials: {"project_id": "project-id", "location": "us-central1", "project_key": "project-key"}
    vertex_project: "project-id"
    vertex_location: "us-central1"
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>


**预期响应**

```python
ModelResponse(
    id='chatcmpl-c542d76d-f675-4e87-8e5f-05855f5d0f5e',
    created=1740470510,
    model='{{gemini_flash}}',
    object='chat.completion',
    system_fingerprint=None,
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content="The capital of France is Paris.",
                role='assistant',
                tool_calls=None,
                function_call=None,
                reasoning_content='The capital of France is Paris. This is a very straightforward factual question.'
            ),
        )
    ],
    usage=Usage(
        completion_tokens=68,
        prompt_tokens=42,
        total_tokens=110,
        completion_tokens_details=None,
        prompt_tokens_details=PromptTokensDetailsWrapper(
            audio_tokens=None,
            cached_tokens=0,
            text_tokens=None,
            image_tokens=None
        ),
        cache_creation_input_tokens=0,
        cache_read_input_tokens=0
    )
)
```

#### 向 Gemini 模型传递 `thinking` 参数

也可以直接向 Gemini 模型传入 `thinking` 参数。

该参数会被转换为 Gemini 的 [`thinkingConfig` 参数](https://ai.google.dev/gemini-api/docs/thinking#set-budget)。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# !gcloud auth application-default login - run this to add vertex credentials to your env

response = litellm.completion(
  model="vertex_ai/{{gemini_flash}}",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 1024},
  vertex_project="project-id",
  vertex_location="us-central1"
)
```

</TabItem>
<TabItem value="proxy" label="代理">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "vertex_ai/{{gemini_flash}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>


### **上下文缓存**

#### 统一端点

Vertex AI 上下文缓存的用法与 [**Google AI Studio - 上下文缓存**](../providers/gemini.md#上下文缓存) 完全一致。


##### 用法示例

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 

for _ in range(2): 
    resp = completion(
        model="vertex_ai/{{gemini_pro}}",
        messages=[
        # System Message
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement" * 4000,
                        "cache_control": {"type": "ephemeral"}, # 👈 KEY CHANGE
                    }
                ],
            },
            # marked for caching with the cache_control parameter, so that this checkpoint can read from the previous cache.
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
            }]
    )

    print(resp.usage) # 👈 2nd usage block will be less, since cached tokens used
```

</TabItem>
<TabItem value="sdk-ttl" label="SDK 自定义 TTL">

```python
from litellm import completion 

# Cache for 2 hours (7200 seconds)
resp = completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 4000,
                    "cache_control": {
                        "type": "ephemeral", 
                        "ttl": "7200s"  # 👈 Cache for 2 hours
                    },
                }
            ],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "3600s"  # 👈 This TTL will be ignored (first one is used)
                    },
                }
            ],
        }
    ]
)

print(resp.usage)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      vertex_project: "project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash

curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{gemini_flash}}",
    "messages": [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Long cache message (must be >= 1024 tokens)",
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "7200s"
                    }
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is the text about?"
                }
            ]
        }
    ]
}'

```

</TabItem>
</Tabs>

#### 直接调用提供商 API

[**直达提供商 API**](../pass_through/vertex_ai.md)

##### 1. 创建缓存

首先，通过 LiteLLM 代理向 `cachedContents` 端点发送 `POST` 请求来创建缓存。

<Tabs>
<TabItem value="proxy" label="代理">

```bash
curl http://0.0.0.0:4000/vertex_ai/v1/projects/{project_id}/locations/{location}/cachedContents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "projects/{project_id}/locations/{location}/publishers/google/models/{{gemini_flash}}",
    "displayName": "example_cache",
    "contents": [{
      "role": "user",
      "parts": [{
        "text": ".... a long book to be cached"
      }]
    }]
  }'
```

</TabItem>
</Tabs>

##### 2. 从响应中获取缓存名称

Vertex AI 会在响应中返回缓存内容的 `name`，这个名称就是你缓存数据的标识符。

```json
{
    "name": "projects/12341234/locations/{location}/cachedContents/123123123123123",
    "model": "projects/{project_id}/locations/{location}/publishers/google/models/{{gemini_flash}}",
    "createTime": "2025-09-23T19:13:50.674976Z",
    "updateTime": "2025-09-23T19:13:50.674976Z",
    "expireTime": "2025-09-23T20:13:50.655988Z",
    "displayName": "example_cache",
    "usageMetadata": {
        "totalTokenCount": 1246,
        "textCount": 5132
    }
}
```

##### 3. 使用缓存内容

在后续 API 调用中，把响应里的 `name` 作为 `cachedContent` 或 `cached_content` 传入，即可复用缓存内容。该字段放在发送到 `/chat/completions` 的请求体中。

<Tabs>
<TabItem value="proxy" label="代理">

```bash

curl http://0.0.0.0:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "cachedContent": "projects/545201925769/locations/us-central1/cachedContents/4511135542628319232",
    "model": "{{gemini_flash}}",
    "messages": [
        {
            "role": "user",
            "content": "what is the book about?"
        }
    ]
  }'
```

</TabItem>
</Tabs>

## 前置条件
* `uv add google-cloud-aiplatform`（代理 Docker 镜像中已预装）
* 认证：
    * 运行 `gcloud auth application-default login`，参见 [Google Cloud 文档](https://cloud.google.com/docs/authentication/external/set-up-adc)
    * 也可以改为设置 `GOOGLE_APPLICATION_CREDENTIALS`

    具体做法：[**跳转到代码**](#补充)

      - 在 GCP 上创建一个服务账号
      - 将凭证导出为 JSON
      - 读取该 JSON，并用 json.dump 把它转成字符串
      - 把这个 JSON 字符串存入环境变量 `GOOGLE_APPLICATION_CREDENTIALS`

## 使用示例
```python
import litellm
litellm.vertex_project = "hardy-device-38811" # Your Project ID
litellm.vertex_location = "us-central1"  # proj location

response = litellm.completion(model="{{gemini_pro}}", messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}])
```

## 在 LiteLLM 代理服务器中使用

下面介绍如何在 LiteLLM 代理服务器中使用 Vertex AI

1. 修改 config.yaml

  <Tabs>

  <TabItem value="completion_param" label="为每个模型单独设置 location">

  当你需要为每个 vertex 模型设置不同 location 时，使用这种配置方式。

  ```yaml
  model_list:
    - model_name: gemini-vision
      litellm_params:
        model: vertex_ai/{{gemini_pro}}
        vertex_project: "project-id"
        vertex_location: "us-central1"
    - model_name: gemini-vision
      litellm_params:
        model: vertex_ai/{{gemini_pro}}
        vertex_project: "project-id2"
        vertex_location: "us-east"
  ```

  </TabItem>

  <TabItem value="litellm_param" label="所有 vertex 模型共用一个 location">

  当所有模型共用同一个 vertex location 时，使用这种配置方式。

  ```yaml
  litellm_settings: 
    vertex_project: "hardy-device-38811" # Your Project ID
    vertex_location: "us-central1" # proj location

  model_list: 
    -model_name: team1-gemini-2.5-pro
    litellm_params: 
      model: {{gemini_pro}}
  ```

  </TabItem>

  </Tabs>

2. 启动代理

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. 向 LiteLLM 代理服务器发送请求

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="sk-<your-litellm-api-key>",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="team1-gemini-2.5-pro",
      messages = [
          {
              "role": "user",
              "content": "what llm are you"
          }
      ],
  )

  print(response)
  ```
  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "team1-gemini-2.5-pro",
      "messages": [
          {
          "role": "user",
          "content": "what llm are you"
          }
      ],
  }'
  ```
  </TabItem>

  </Tabs>


## 认证：vertex_project、vertex_location 等

Vertex 凭证可通过以下方式设置：
- 动态参数
或
- 环境变量


### **动态参数**

调用 `litellm.completion` 时，可以把下列参数作为动态参数传入：
- `vertex_credentials` (str)：JSON 字符串，或 Vertex AI 服务账号 service_account.json 的文件路径
- `vertex_location` (str)：Vertex 模型部署的区位（us-central1、asia-southeast1 等）。部分模型支持 global 区位，详见 [Vertex AI 文档](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations#supported_models)
- `vertex_project` Optional[str]：当 Vertex 项目与 vertex_credentials 中的项目不同时使用

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import json 

## GET CREDENTIALS 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)


response = completion(
  model="vertex_ai/{{gemini_pro}}",
  messages=[{"content": "You are a good bot.","role": "system"}, {"content": "Hello, how are you?","role": "user"}], 
  vertex_credentials=vertex_credentials_json,
  vertex_project="my-special-project", 
  vertex_location="my-special-location"
)
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml
model_list:
    - model_name: {{gemini_pro}}
      litellm_params:
        model: {{gemini_pro}}
        vertex_credentials: os.environ/VERTEX_FILE_PATH_ENV_VAR # os.environ["VERTEX_FILE_PATH_ENV_VAR"] = "/path/to/service_account.json" 
        vertex_project: "my-special-project"
        vertex_location: "my-special-location"
```

</TabItem>
</Tabs>




### **工作负载身份联合（Workload Identity Federation）**

LiteLLM 支持 [Google Cloud 工作负载身份联合（WIF）](https://cloud.google.com/iam/docs/workload-identity-federation)，无需服务账号密钥，就能让本地或多云工作负载访问 Google Cloud 资源。对于运行在其他云环境（AWS、Azure 等）或本地机房的工作负载，推荐采用这种方式。

要使用工作负载身份联合，请通过 `vertex_credentials` 传入 WIF 凭证配置文件的路径：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=[{"role": "user", "content": "Hello!"}],
    vertex_credentials="/path/to/wif-credentials.json",  # 👈 WIF credentials file
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1"
)
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml
model_list:
  - model_name: gemini-model
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      vertex_project: your-gcp-project-id
      vertex_location: us-central1
      vertex_credentials: /path/to/wif-credentials.json  # 👈 WIF credentials file
```

另一种做法是在 LiteLLM 管理界面的 **LLM Credentials** 页面创建凭证，然后引用它来认证模型：

```yaml
model_list:
  - model_name: gemini-model
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      vertex_project: your-gcp-project-id
      vertex_location: us-central1
      litellm_credential_name: my-vertex-wif-credential  # 👈 Reference credential stored in UI
```

</TabItem>
</Tabs>

**WIF 凭证文件格式**

WIF 凭证 JSON 文件通常如下所示（以 AWS 联合为例）：

```json
{
  "type": "external_account",
  "audience": "//iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID",
  "subject_token_type": "urn:ietf:params:aws:token-type:aws4_request",
  "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/SERVICE_ACCOUNT_EMAIL:generateAccessToken",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {
    "environment_id": "aws1",
    "region_url": "http://169.254.169.254/latest/meta-data/placement/availability-zone",
    "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials",
    "regional_cred_verification_url": "https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15"
  }
}
```

有关配置工作负载身份联合的更多细节，参见 [Google Cloud WIF 文档](https://cloud.google.com/iam/docs/workload-identity-federation)。

#### 为 WIF 显式指定 AWS 凭证

默认情况下，基于 AWS 的 WIF 依靠 EC2 实例元数据服务来获取 AWS 凭证。当 LiteLLM 运行在挂载了 IAM 角色的 EC2 实例或 ECS 任务上时，这条路径可以直接工作。

如果你的环境**无法访问 EC2 元数据服务**（例如本地部署、未使用 host 网络的容器，或有安全限制的其他云端环境），可以直接在 WIF 凭证 JSON 文件中写入显式 AWS 凭证。LiteLLM 会先用这些凭证完成 AWS 认证，再执行 GCP 的 token 交换。

在 WIF 凭证 JSON 的**顶层**添加 `aws_*` 键（与 `type`、`audience` 等字段并列）：

```json
{
  "type": "external_account",
  "audience": "//iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID",
  "subject_token_type": "urn:ietf:params:aws:token-type:aws4_request",
  "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/SERVICE_ACCOUNT_EMAIL:generateAccessToken",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {
    "environment_id": "aws1",
    "region_url": "http://169.254.169.254/latest/meta-data/placement/availability-zone",
    "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials",
    "regional_cred_verification_url": "https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15"
  },
  "aws_role_name": "arn:aws:iam::123456789012:role/MyWifRole",
  "aws_region_name": "us-east-1"
}
```

**支持的 `aws_*` 参数**：

| 参数 | 必填 | 说明 |
|---|---|---|
| `aws_region_name` | 是 | 用于凭证验证的 AWS 区位（如 `us-east-1`） |
| `aws_role_name` | 否 | 用于 STS AssumeRole 的 IAM 角色 ARN |
| `aws_access_key_id` | 否 | 静态 AWS access key ID |
| `aws_secret_access_key` | 否 | 静态 AWS secret access key |
| `aws_session_token` | 否 | 临时会话 token |
| `aws_profile_name` | 否 | AWS CLI 配置档名称 |
| `aws_session_name` | 否 | AssumeRole 的会话名称 |
| `aws_web_identity_token` | 否 | 供 STS 使用的 Web 身份 token |
| `aws_sts_endpoint` | 否 | 自定义 STS 端点 URL |
| `aws_external_id` | 否 | 跨账号 AssumeRole 使用的外部 ID |

使用显式 AWS 凭证时，`aws_region_name` 始终必填。其余参数遵循与 [Bedrock AWS 认证](/docs/providers/bedrock#认证)相同的认证流程，可以采用担任角色、静态密钥、配置档或 Web 身份 token 等方式。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=[{"role": "user", "content": "Hello!"}],
    vertex_credentials="/path/to/wif-credentials-with-aws.json",  # WIF JSON with aws_* keys
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1"
)
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml
model_list:
  - model_name: gemini-model
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      vertex_project: your-gcp-project-id
      vertex_location: us-central1
      vertex_credentials: /path/to/wif-credentials-with-aws.json  # WIF JSON with aws_* keys
```

</TabItem>
</Tabs>

当 JSON 中存在 `aws_*` 键时，LiteLLM 会自动改用显式 AWS 认证，而不再依赖 EC2 元数据服务；如果这些键不存在，则照旧走标准的基于元数据的流程，行为不变。

### **环境变量**

可以设置以下环境变量：
- `GOOGLE_APPLICATION_CREDENTIALS`：存放 service_account.json 的文件路径（Vertex SDK 会直接读取）
- VERTEXAI_LOCATION：Vertex 模型部署的区位（us-central1、asia-southeast1 等）
- VERTEXAI_PROJECT：可选。当 Vertex 项目与 vertex_credentials 中的项目不同时使用

1. GOOGLE_APPLICATION_CREDENTIALS

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service_account.json"
```

2. VERTEXAI_LOCATION

```bash
export VERTEXAI_LOCATION="us-central1" # can be any vertex location
```

3. VERTEXAI_PROJECT

```bash
export VERTEXAI_PROJECT="my-test-project" # ONLY use if model project is different from service account project
```


## 指定安全设置
某些场景下，你可能需要在调用模型时传入与默认值不同的[安全设置（safety settings）](https://ai.google.dev/docs/safety_setting_gemini)。为此，只需在 `completion` 或 `acompletion` 中传入 `safety_settings` 参数即可。例如：

### 按模型或请求设置

<Tabs>

<TabItem value="sdk" label="SDK">

```python
response = completion(
    model="vertex_ai/{{gemini_pro}}", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}],
    safety_settings=[
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE",
        },
    ]
)
```
</TabItem>
<TabItem value="proxy" label="代理">

**方式 1：在配置文件中设置**
```yaml
model_list:
  - model_name: gemini-experimental
    litellm_params:
      model: vertex_ai/gemini-experimental
      vertex_project: litellm-epic
      vertex_location: us-central1
      safety_settings:
      - category: HARM_CATEGORY_HARASSMENT
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_HATE_SPEECH
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_SEXUALLY_EXPLICIT
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_DANGEROUS_CONTENT
        threshold: BLOCK_NONE
```

**方式 2：调用时设置**

```python
response = client.chat.completions.create(
    model="gemini-experimental",
    messages=[
        {
            "role": "user",
            "content": "Can you write exploits?",
        }
    ],
    max_tokens=8192,
    stream=False,
    temperature=0.0,

    extra_body={
        "safety_settings": [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE",
            },
        ],
    }
)
```
</TabItem>
</Tabs>

### 全局设置

<Tabs>

<TabItem value="sdk" label="SDK">

```python
import litellm 

litellm.set_verbose = True # 👈 See RAW REQUEST/RESPONSE 

litellm.vertex_ai_safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE",
        },
    ]
response = completion(
    model="vertex_ai/{{gemini_pro}}", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}]
)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

```yaml
model_list:
  - model_name: gemini-experimental
    litellm_params:
      model: vertex_ai/gemini-experimental
      vertex_project: litellm-epic
      vertex_location: us-central1

litellm_settings:
    vertex_ai_safety_settings:
      - category: HARM_CATEGORY_HARASSMENT
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_HATE_SPEECH
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_SEXUALLY_EXPLICIT
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_DANGEROUS_CONTENT
        threshold: BLOCK_NONE
```
</TabItem>
</Tabs>

## 设置 Vertex Project 与 Vertex Location
所有使用 Vertex AI 的调用都需要以下参数：
* 你的 Project ID
```python
import os, litellm 

# set via env var
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811" # Your Project ID`

### OR ###

# set directly on module 
litellm.vertex_project = "hardy-device-38811" # Your Project ID`
```
* 项目所在的 Location
```python
import os, litellm 

# set via env var
os.environ["VERTEXAI_LOCATION"] = "us-central1" # Your Location

### OR ###

# set directly on module 
litellm.vertex_location = "us-central1" # Your Location
```

## Gemini Pro
| 模型名       | 调用方式                        |
|------------------|--------------------------------------|
| gemini-2.5-pro   | `completion('gemini-2.5-pro', messages)`, `completion('vertex_ai/gemini-2.5-pro', messages)` |
| gemini-2.5-flash-preview-09-2025   | `completion('gemini-2.5-flash-preview-09-2025', messages)`, `completion('vertex_ai/gemini-2.5-flash-preview-09-2025', messages)` |
| gemini-2.5-flash-lite-preview-09-2025   | `completion('gemini-2.5-flash-lite-preview-09-2025', messages)`, `completion('vertex_ai/gemini-2.5-flash-lite-preview-09-2025', messages)` |
| gemini-3.1-flash-lite-preview   | `completion('gemini-3.1-flash-lite-preview', messages)`, `completion('vertex_ai/gemini-3.1-flash-lite-preview', messages)` |

## PayGo / 优先级成本追踪

LiteLLM 会根据响应中的 `usageMetadata.trafficType`，自动按正确的定价档位追踪 Vertex AI Gemini 模型的花费：

| Vertex AI `trafficType` | LiteLLM `service_tier` | 适用定价 |
|-------------------------|-------------------------|-----------------|
| `ON_DEMAND_PRIORITY` | `priority` | PayGo / 优先级定价（`input_cost_per_token_priority`、`output_cost_per_token_priority`） |
| `ON_DEMAND` | standard | 默认按量定价 |
| `FLEX` / `BATCH` | `flex` | 批处理 / flex 定价 |

使用 [Vertex AI PayGo](https://cloud.google.com/vertex-ai/generative-ai/pricing)（按量优先）或批处理负载时，LiteLLM 会从响应中读取 `trafficType`，并按[模型成本表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)中匹配的单 token 成本计费。无需任何配置，标准请求与 PayGo 请求的花费追踪都能正常工作。

通用的成本追踪配置见[花费追踪（Spend Tracking）](../proxy/cost_tracking.md)。

## Private Service Connect（PSC）端点

LiteLLM 支持部署在 Private Service Connect（PSC）端点上的 Vertex AI 模型，可以为私有化部署自定义 `api_base` URL。

### 用法

```python
from litellm import completion

# Use PSC endpoint with custom api_base
response = completion(
    model="vertex_ai/1234567890",  # Numeric endpoint ID
    messages=[{"role": "user", "content": "Hello!"}],
    api_base="http://10.96.32.8",  # Your PSC endpoint
    vertex_project="my-project-id",
    vertex_location="us-central1",
    use_psc_endpoint_format=True
)
```

**主要特性**：
- 同时支持数字端点 ID 与自定义模型名
- 补全与嵌入端点均可使用
- 自动拼接完整 PSC URL：`{api_base}/v1/projects/{project}/locations/{location}/endpoints/{model}:{endpoint}`
- 兼容流式请求

### 配置

在 `config.yaml` 中添加 PSC 端点：

```yaml
model_list:
  - model_name: psc-gemini
    litellm_params:
      model: vertex_ai/1234567890  # Numeric endpoint ID
      api_base: "http://10.96.32.8"  # Your PSC endpoint
      vertex_project: "my-project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
      use_psc_endpoint_format: True
  - model_name: psc-embedding
    litellm_params:
      model: vertex_ai/text-embedding-004
      api_base: "http://10.96.32.8"  # Your PSC endpoint
      vertex_project: "my-project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
      use_psc_endpoint_format: True
```

## 微调模型

你可以通过 LiteLLM 调用微调过的 Vertex AI Gemini 模型

| 属性 | 说明 |
|----------|---------|
| 提供商路由 | `vertex_ai/gemini/{MODEL_ID}` |
| Vertex 文档 | [Vertex AI - 微调后的 Gemini 模型](https://cloud.google.com/vertex-ai/generative-ai/docs/models/gemini-use-supervised-tuning#test_the_tuned_model_with_a_prompt)|
| 支持的操作 | `/chat/completions`, `/completions`, `/embeddings`, `/images` |

要使用遵循 `/gemini` 请求/响应格式的模型，只需把 model 参数设为

```python title="调用微调 gemini 模型的 model 参数"
model="vertex_ai/gemini/<your-finetuned-model>"
```

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python showLineNumbers title="示例"
import litellm
import os

## set ENV variables
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = litellm.completion(
  model="vertex_ai/gemini/<your-finetuned-model>",  # e.g. vertex_ai/gemini/4965075652664360960
  messages=[{ "content": "Hello, how are you?","role": "user"}],
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. 将 Vertex 凭据加入环境变量

```bash title="向 Vertex AI 完成身份验证"
!gcloud auth application-default login
```

2. 配置 config.yaml

```yaml showLineNumbers title="添加到 litellm 配置"
- model_name: finetuned-gemini
  litellm_params:
    model: vertex_ai/gemini/<ENDPOINT_ID>
    vertex_project: <PROJECT_ID>
    vertex_location: <LOCATION>
```

3. 测试一下！

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers title="示例请求"
from openai import OpenAI

client = OpenAI(
    api_key="your-litellm-key",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="finetuned-gemini",
    messages=[
        {"role": "user", "content": "hi"}
    ]
)
print(response)
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="示例请求"
curl --location 'https://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: <LITELLM_KEY>' \
--data '{"model": "finetuned-gemini" ,"messages":[{"role": "user", "content":[{"type": "text", "text": "hi"}]}]}'
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>

## Gemini Pro Vision
| 模型名       | 调用方式                        |
|------------------|--------------------------------------|
| gemini-3.1-pro-preview   | `completion('gemini-3.1-pro-preview', messages)`, `completion('vertex_ai/gemini-3.1-pro-preview', messages)`|


#### 使用 Gemini Pro Vision

以与 OpenAI [`gpt-4-vision`](https://docs.litellm.ai/docs/providers/openai#openai-vision-models) 相同的输入/输出格式调用 `{{gemini_pro}}`

LiteLLM 支持通过 `url` 传入以下图片类型
- 使用 Cloud Storage URI 的图片 - gs://cloud-samples-data/generative-ai/image/boats.jpeg
- 使用直接链接的图片 - https://storage.googleapis.com/github-repo/img/gemini/intro/landmark3.jpg
- 使用 Cloud Storage URI 的视频 - https://storage.googleapis.com/github-repo/img/gemini/multimodality_usecases_overview/pixel8.mp4
- Base64 编码的本地图片

**请求示例 - 图片 URL**

<Tabs>

<TabItem value="direct" label="使用直接链接的图片">

```python
import litellm

response = litellm.completion(
  model = "vertex_ai/{{gemini_pro}}",
  messages=[
      {
          "role": "user",
          "content": [
                          {
                              "type": "text",
                              "text": "Whats in this image?"
                          },
                          {
                              "type": "image_url",
                              "image_url": {
                              "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                              }
                          }
                      ]
      }
  ],
)
print(response)
```
</TabItem>

<TabItem value="base" label="本地 Base64 图片">

```python
import litellm

def encode_image(image_path):
    import base64

    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

image_path = "cached_logo.jpg"
# Getting the base64 string
base64_image = encode_image(image_path)
response = litellm.completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Whats in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + base64_image
                    },
                },
            ],
        }
    ],
)
print(response)
```
</TabItem>
</Tabs>

## 用法 - 函数调用

LiteLLM 为 Vertex AI Gemini 模型提供函数调用（Function Calling）支持。

```python
from litellm import completion
import os
# set env
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ".."
os.environ["VERTEX_AI_PROJECT"] = ".."
os.environ["VERTEX_AI_LOCATION"] = ".."

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]
messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]

response = completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=messages,
    tools=tools,
)
# Add any assertions, here to check response args
print(response)
assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
assert isinstance(
    response.choices[0].message.tool_calls[0].function.arguments, str
)

```

## 媒体分辨率控制（图片与视频）

LiteLLM 借助 OpenAI 的 `detail` 参数，为所有 Gemini 模型提供逐部分的媒体分辨率控制。无论使用 `image_url` 还是 `file` 内容类型，你都可以为请求中的每张图片、每个视频单独指定不同的分辨率档位。

**支持的 `detail` 取值**：
- `"low"` - 映射为 `media_resolution: "low"`（图片 280 token，视频每帧 70 token）
- `"medium"` - 映射为 `media_resolution: "medium"`
- `"high"` - 映射为 `media_resolution: "high"`（图片 1120 token）
- `"ultra_high"` - 映射为 `media_resolution: "ultra_high"`
- `"auto"` 或 `None` - 由模型自行决定最佳分辨率（不设置 `media_resolution`）

**用法示例**：

<Tabs>
<TabItem value="images" label="图片">

```python
from litellm import completion

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://example.com/chart.png",
                    "detail": "high"  # High resolution for detailed chart analysis
                }
            },
            {
                "type": "text",
                "text": "Analyze this chart"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://example.com/icon.png",
                    "detail": "low"  # Low resolution for simple icon
                }
            }
        ]
    }
]

response = completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=messages,
)
```

</TabItem>
<TabItem value="videos" label="视频（文件）">

```python
from litellm import completion

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Analyze this video"
            },
            {
                "type": "file",
                "file": {
                    "file_id": "gs://my-bucket/video.mp4",
                    "format": "video/mp4",
                    "detail": "high"  # High resolution for detailed video analysis
                }
            }
        ]
    }
]

response = completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=messages,
)
```

</TabItem>
</Tabs>

:::info
**逐部分分辨率**：请求中的每张图片或每个视频都可以单独设置 `detail`，因此可以混合不同分辨率（例如高清图表搭配低清图标）。该特性适用于所有 Gemini 模型的 `image_url` 与 `file` 两种内容类型。
:::

## 视频元数据控制

LiteLLM 通过 `video_metadata` 字段为所有 Gemini 模型（1.x、2.x、3+）提供细粒度的视频处理控制，可以为视频分析指定抽帧速率和时间范围。

**支持的 `video_metadata` 参数**：

| 参数 | 类型 | 说明 | 示例 |
|-----------|------|-------------|---------|
| `fps` | Number | 抽帧速率（每秒帧数） | `5` |
| `start_offset` | String | 视频片段处理的起始时间 | `"10s"` |
| `end_offset` | String | 视频片段处理的结束时间 | `"60s"` |

:::note
**字段名转换**：LiteLLM 会自动把 snake_case 字段名转成 camelCase 再发给 Gemini API：
- `start_offset` → `startOffset`
- `end_offset` → `endOffset`
- `fps` 保持不变
:::

:::tip
所有 Gemini 模型都支持视频裁剪（`start_offset`/`end_offset`）与帧率控制（`fps`），但 **Gemini 2.5 系列及之后的模型**（如 `{{gemini_flash}}`、`{{gemini_pro}}`）的分析质量明显更高。
:::

:::warning
- **推荐搭配视频文件使用**：`video_metadata` 本为视频文件设计，其他媒体类型的错误处理交由 Vertex AI API 负责
- **支持的文件格式**：兼容 `gs://`、`https://` 以及 base64 编码的视频文件
:::

**用法示例**：

<Tabs>
<TabItem value="basic" label="基础视频元数据">

```python
from litellm import completion

response = completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Analyze this video clip"},
                {
                    "type": "file",
                    "file": {
                        "file_id": "gs://my-bucket/video.mp4",
                        "format": "video/mp4",
                        "video_metadata": {
                            "fps": 5,               # Extract 5 frames per second
                            "start_offset": "10s",  # Start from 10 seconds
                            "end_offset": "60s"     # End at 60 seconds
                        }
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="combined" label="结合 detail 使用">

```python
from litellm import completion

response = completion(
    model="vertex_ai/{{gemini_pro}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Provide detailed analysis of this video segment"},
                {
                    "type": "file",
                    "file": {
                        "file_id": "https://example.com/presentation.mp4",
                        "format": "video/mp4",
                        "detail": "high",  # High resolution for detailed analysis
                        "video_metadata": {
                            "fps": 10,              # Extract 10 frames per second
                            "start_offset": "30s",  # Start from 30 seconds
                            "end_offset": "90s"     # End at 90 seconds
                        }
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      vertex_project: your-project
      vertex_location: us-central1
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 发起请求

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_pro}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Analyze this video clip"},
          {
            "type": "file",
            "file": {
              "file_id": "gs://my-bucket/video.mp4",
              "format": "video/mp4",
              "detail": "high",
              "video_metadata": {
                "fps": 5,
                "start_offset": "10s",
                "end_offset": "60s"
              }
            }
          }
        ]
      }
    ]
  }'
```

</TabItem>
</Tabs>

## 用法 - PDF / 视频 / 音频等文件

通过 LiteLLM 传入任何 Vertex AI 支持的文件。

LiteLLM 支持通过 url 传入以下文件类型。

对 VertexAI 使用 `file` 消息类型的功能自 v1.65.1+ 起正式可用。

```
Files with Cloud Storage URIs - gs://cloud-samples-data/generative-ai/image/boats.jpeg
Files with direct links - https://storage.googleapis.com/github-repo/img/gemini/intro/landmark3.jpg
Videos with Cloud Storage URIs - https://storage.googleapis.com/github-repo/img/gemini/multimodality_usecases_overview/pixel8.mp4
Base64 Encoded Local Files
```

<Tabs>
<TabItem value="sdk" label="SDK">

### **使用 `gs://` 或任意 URL**
```python
from litellm import completion

response = completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "You are a very professional document summarization specialist. Please summarize the given document."},
                {
                    "type": "file",
                    "file": {
                        "file_id": "gs://cloud-samples-data/generative-ai/pdf/2403.05530.pdf",
                        "format": "application/pdf" # OPTIONAL - specify mime-type
                    }
                },
            ],
        }
    ],
    max_tokens=300,
)

print(response.choices[0])
```

### **使用 base64**
```python
from litellm import completion
import base64
import requests

# URL of the file
url = "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"

# Download the file
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")

response = completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "You are a very professional document summarization specialist. Please summarize the given document."},
                {
                    "type": "file",
                    "file": {
                        "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
                    }  
                },
                {
                    "type": "audio_input",
                    "audio_input": {
                        "audio_input": f"data:audio/mp3;base64,{encoded_file}", # 👈 AUDIO File ('file' message works as too)
                    }  
                },
            ],
        }
    ],
    max_tokens=300,
)

print(response.choices[0])
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 把模型加入配置

```yaml
- model_name: {{gemini_flash}}
  litellm_params:
    model: vertex_ai/{{gemini_flash}}
    vertex_credentials: "/path/to/service_account.json"
```

2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！

**使用 `gs://`**
```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "You are a very professional document summarization specialist. Please summarize the given document"
          },
          {
                "type": "file",
                "file": {
                    "file_id": "gs://cloud-samples-data/generative-ai/pdf/2403.05530.pdf",
                    "format": "application/pdf" # OPTIONAL
                }
            }
          }
        ]
      }
    ],
    "max_tokens": 300
  }'

```


```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "You are a very professional document summarization specialist. Please summarize the given document"
          },
          {
                "type": "file",
                "file": {
                    "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
                },
            },
            {
                "type": "audio_input",
                "audio_input {
                    "audio_input": f"data:audio/mp3;base64,{encoded_file}", # 👈 AUDIO File ('file' message works as too)
                }  
            },
    ]
      }
    ],
    "max_tokens": 300
  }'

```
</TabItem>
</Tabs>


## 旧版 PaLM 2 与 Gemini 1.x 模型

Google 已在 Vertex AI 上退役 PaLM 2 系列模型（`chat-bison`、`codechat-bison`、`text-bison`、`code-bison`、`code-gecko`）以及 Gemini 1.0 和 1.5 模型，它们也已从 LiteLLM 模型映射中移除。不带前缀的名称（如 `completion('chat-bison', messages)` 或 `completion('gemini-1.5-pro', messages)`）会报 `LLM Provider NOT provided` 错误，带 `vertex_ai/` 前缀的形式则会收到 Vertex AI 返回的 404。请改用当前的 Gemini 模型，例如 `completion('vertex_ai/gemini-2.5-pro', messages)`

## **嵌入模型**

#### 嵌入用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
from litellm import embedding
litellm.vertex_project = "hardy-device-38811" # Your Project ID
litellm.vertex_location = "us-central1"  # proj location

response = embedding(
    model="vertex_ai/textembedding-gecko",
    input=["good morning from litellm"],
)
print(response)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM PROXY">


1. 将模型添加到 config.yaml
```yaml
model_list:
  - model_name: snowflake-arctic-embed-m-long-1731622468876
    litellm_params:
      model: vertex_ai/<your-model-id>
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json

litellm_settings:
  drop_params: True
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 或 Langchain Python SDK 发起请求

```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="snowflake-arctic-embed-m-long-1731622468876",
    input = ["good morning from litellm", "this is another item"],
)

print(response)
```


</TabItem>
</Tabs>

#### 支持的嵌入模型
[这里](https://github.com/BerriAI/litellm/blob/57f37f743886a0249f630a6792d49dffc2c5d9b7/model_prices_and_context_window.json#L835) 列出的所有模型均受支持

| 模型名称               | 函数调用                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| text-embedding-004 | `embedding(model="vertex_ai/text-embedding-004", input)` | 
| text-multilingual-embedding-002 | `embedding(model="vertex_ai/text-multilingual-embedding-002", input)` | 
| textembedding-gecko | `embedding(model="vertex_ai/textembedding-gecko", input)` | 
| textembedding-gecko-multilingual | `embedding(model="vertex_ai/textembedding-gecko-multilingual", input)` | 
| textembedding-gecko-multilingual@001 | `embedding(model="vertex_ai/textembedding-gecko-multilingual@001", input)` | 
| textembedding-gecko@001 | `embedding(model="vertex_ai/textembedding-gecko@001", input)` | 
| textembedding-gecko@003 | `embedding(model="vertex_ai/textembedding-gecko@003", input)` | 
| text-embedding-preview-0409 | `embedding(model="vertex_ai/text-embedding-preview-0409", input)` |
| text-multilingual-embedding-preview-0409 | `embedding(model="vertex_ai/text-multilingual-embedding-preview-0409", input)` | 
| 微调或自定义嵌入模型 | `embedding(model="vertex_ai/<your-model-id>", input)` | 

### 支持的 OpenAI（统一）参数

| [参数](../embedding/supported_embedding.md#litellmembedding-的输入参数) | 类型 | [Vertex 对应参数](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api) |
|-------|-------------|--------------------|
| `input` | **string or List[string]** | `instances` |
| `dimensions` | **int** | `output_dimensionality` |
| `input_type` | **Literal["RETRIEVAL_QUERY","RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING", "QUESTION_ANSWERING", "FACT_VERIFICATION"]** | `task_type` |

#### 结合 OpenAI（统一）参数使用


<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="vertex_ai/text-embedding-004",
    input=["good morning from litellm", "gm"],
    input_type = "RETRIEVAL_DOCUMENT",
    dimensions=1,
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">


```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="text-embedding-004", 
    input = ["good morning from litellm", "gm"],
    dimensions=1,
    extra_body = {
        "input_type": "RETRIEVAL_QUERY",
    }
)

print(response)
```
</TabItem>
</Tabs>


### 支持的 Vertex 专属参数

| 参数 | 类型 |
|-------|-------------|
| `auto_truncate` | **bool** |
| `task_type` | **Literal["RETRIEVAL_QUERY","RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING", "QUESTION_ANSWERING", "FACT_VERIFICATION"]** |
| `title` | **str** |

#### 使用 Vertex 专属参数（指定 `task_type` 和 `title`）

你可以向嵌入模型传入任意 Vertex 专属参数，只需像下面这样把它们传给嵌入函数即可：

[包含全部嵌入参数的 Vertex AI 官方文档](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api#request_body)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="vertex_ai/text-embedding-004",
    input=["good morning from litellm", "gm"],
    task_type = "RETRIEVAL_DOCUMENT",
    title = "test",
    dimensions=1,
    auto_truncate=True,
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">


```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="text-embedding-004", 
    input = ["good morning from litellm", "gm"],
    dimensions=1,
    extra_body = {
        "task_type": "RETRIEVAL_QUERY",
        "auto_truncate": True,
        "title": "test",
    }
)

print(response)
```
</TabItem>
</Tabs>

## **多模态嵌入**


已知限制：
- 每次请求仅支持 1 张图片 / 1 个视频
- 仅支持 GCS 或 base64 编码的图片 / 视频

### 用法

<Tabs>
<TabItem value="sdk" label="SDK">

使用 GCS 图片

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input="gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png" # will be sent as a gcs image
)
```

使用 base64 编码的图片

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input="data:image/jpeg;base64,..." # will be sent as a base64 encoded image
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY（统一端点）">

1. 将模型添加到 config.yaml
```yaml
model_list:
  - model_name: multimodalembedding@001
    litellm_params:
      model: vertex_ai/multimodalembedding@001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json

litellm_settings:
  drop_params: True
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 或 Langchain Python SDK 发起请求


<Tabs>

<TabItem value="OpenAI SDK" label="OpenAI SDK">

使用 GCS 图片 / 视频 URI 的请求

```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png",
)

print(response)
```

使用 base64 编码图片的请求

```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = "data:image/jpeg;base64,...",
)

print(response)
```

</TabItem>

<TabItem value="langchain" label="Langchain">

使用 GCS 图片 / 视频 URI 的请求
```python
from langchain_openai import OpenAIEmbeddings

embeddings_models = "multimodalembedding@001"

embeddings = OpenAIEmbeddings(
    model="multimodalembedding@001",
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",  # type: ignore
)


query_result = embeddings.embed_query(
    "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"
)
print(query_result)

```

使用 base64 编码图片的请求

```python
from langchain_openai import OpenAIEmbeddings

embeddings_models = "multimodalembedding@001"

embeddings = OpenAIEmbeddings(
    model="multimodalembedding@001",
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",  # type: ignore
)


query_result = embeddings.embed_query(
    "data:image/jpeg;base64,..."
)
print(query_result)

```

</TabItem>

</Tabs>
</TabItem>


<TabItem value="proxy-vtx" label="LiteLLM PROXY（Vertex SDK）">

1. 将模型添加到 config.yaml
```yaml
default_vertex_config:
  vertex_project: "adroit-crow-413218"
  vertex_location: "us-central1"
  vertex_credentials: adroit-crow-413218-a956eef1a2a8.json
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 发起请求

```python
import vertexai

from vertexai.vision_models import Image, MultiModalEmbeddingModel, Video
from vertexai.vision_models import VideoSegmentConfig
from google.auth.credentials import Credentials


LITELLM_PROXY_API_KEY = "sk-<your-litellm-api-key>"
LITELLM_PROXY_BASE = "http://0.0.0.0:4000/vertex-ai"

import datetime

class CredentialsWrapper(Credentials):
    def __init__(self, token=None):
        super().__init__()
        self.token = token
        self.expiry = None  # or set to a future date if needed

    def refresh(self, request):
        pass

    def apply(self, headers, token=None):
        headers['Authorization'] = f'Bearer {self.token}'

    @property
    def expired(self):
        return False  # Always consider the token as non-expired

    @property
    def valid(self):
        return True  # Always consider the credentials as valid

credentials = CredentialsWrapper(token=LITELLM_PROXY_API_KEY)

vertexai.init(
    project="adroit-crow-413218",
    location="us-central1",
    api_endpoint=LITELLM_PROXY_BASE,
    credentials = credentials,
    api_transport="rest",

)

model = MultiModalEmbeddingModel.from_pretrained("multimodalembedding")
image = Image.load_from_file(
    "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"
)

embeddings = model.get_embeddings(
    image=image,
    contextual_text="Colosseum",
    dimension=1408,
)
print(f"Image Embedding: {embeddings.image_embedding}")
print(f"Text Embedding: {embeddings.text_embedding}")
```

</TabItem>
</Tabs>


### 文本 + 图片 + 视频嵌入

<Tabs>
<TabItem value="sdk" label="SDK">

文本 + 图片

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["hey", "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"] # will be sent as a gcs image
)
```

文本 + 视频

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["hey", "gs://my-bucket/embeddings/supermarket-video.mp4"] # will be sent as a gcs image
)
```

图片 + 视频

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png", "gs://my-bucket/embeddings/supermarket-video.mp4"] # will be sent as a gcs image
)
```


</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY（统一端点）">

1. 将模型添加到 config.yaml
```yaml
model_list:
  - model_name: multimodalembedding@001
    litellm_params:
      model: vertex_ai/multimodalembedding@001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json

litellm_settings:
  drop_params: True
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 或 Langchain Python SDK 发起请求


文本 + 图片

```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["hey", "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"],
)

print(response)
```

文本 + 视频
```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["hey", "gs://my-bucket/embeddings/supermarket-video.mp4"],
)

print(response)
```

图片 + 视频
```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png", "gs://my-bucket/embeddings/supermarket-video.mp4"],
)

print(response)
```

</TabItem>
</Tabs>

## **微调 API**


| 属性 | 说明 |
|----------|---------|
| 描述 | 使用 OpenAI Python SDK 在 Vertex AI（`/tuningJobs`）上创建微调任务 |
| Vertex 微调文档 | [Vertex 微调](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/tuning#create-tuning) |

### 用法

#### 1. 在 config.yaml 中添加 `finetune_settings`
```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

# 👇 Key change: For /fine_tuning/jobs endpoints
finetune_settings:
  - custom_llm_provider: "vertex_ai"
    vertex_project: "adroit-crow-413218"
    vertex_location: "us-central1"
    vertex_credentials: "/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json"
```

#### 2. 创建微调任务

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
ft_job = await client.fine_tuning.jobs.create(
    model="{{gemini_flash}}",                  # Vertex model you want to fine-tune
    training_file="gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl",                 # file_id from create file response
    extra_headers={"custom-llm-provider": "vertex_ai"}, # tell litellm proxy which provider to use
)
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/fine_tuning/jobs \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "custom-llm-provider: vertex_ai" \
    -d '{
    "model": "{{gemini_flash}}",
    "training_file": "gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl"
    }'
```
</TabItem>

</Tabs>


**进阶用法：向 Vertex AI API 传入 `adapter_size`**

设置 `n_epochs`、`learning_rate_multiplier`、`adapter_size` 等超参数。详见 [Vertex 高级超参数](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/tuning#advanced_use_case)


<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python

ft_job = client.fine_tuning.jobs.create(
    model="{{gemini_flash}}",                  # Vertex model you want to fine-tune
    training_file="gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl",                 # file_id from create file response
    hyperparameters={
        "n_epochs": 3,                      # epoch_count on Vertex
        "learning_rate_multiplier": 0.1,    # learning_rate_multiplier on Vertex
        "adapter_size": "ADAPTER_SIZE_ONE"  # type: ignore, vertex specific hyperparameter
    },
    extra_headers={"custom-llm-provider": "vertex_ai"},
)
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/fine_tuning/jobs \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "custom-llm-provider: vertex_ai" \
    -d '{
    "model": "{{gemini_flash}}",
    "training_file": "gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl",
    "hyperparameters": {
        "n_epochs": 3,
        "learning_rate_multiplier": 0.1,
        "adapter_size": "ADAPTER_SIZE_ONE"
    }
    }'
```
</TabItem>

</Tabs>

## 标签


Google 允许你在 `generateContent` 和 `streamGenerateContent` 调用中附加自定义元数据。这一机制在 Vertex AI 上尤其有用：它可以按多个不同的应用或用户分别追踪成本与用量。


### 用法

你可以在发给 LiteLLM 的请求中传入 `labels` 或 `metadata` 字段来使用这项功能。

如果客户端在发给 LiteLLM 的请求中设置了 `labels` 字段，LiteLLM 会把 `labels` 字段原样传给 Vertex AI 后端。

如果客户端在发给 LiteLLM 的请求中设置了 `metadata` 字段且未设置 `labels` 字段，LiteLLM 会用 `metadata` 中所有字符串类型的键值对填充 `labels` 字段，再传给 Vertex AI 后端。


下面是一个演示 labels 用法的 JSON 请求示例：

```json
{
    "model": "{{gemini_flash}}",
    "messages": [
        { "role": "user", "content": "respond in 20 words. who are you?" }
    ],
    "labels": {
        "client_app": "acme_comp_financial_app",
        "department": "finance",
        "project": "acme_ai"
    }
}
```



## 补充

### 使用 `GOOGLE_APPLICATION_CREDENTIALS`
下面这段代码用于把服务账号凭据存入 `GOOGLE_APPLICATION_CREDENTIALS` 环境变量：


```python
import os
import tempfile

def load_vertex_ai_credentials():
  # Define the path to the vertex_key.json file
  print("loading vertex ai credentials")
  filepath = os.path.dirname(os.path.abspath(__file__))
  vertex_key_path = filepath + "/vertex_key.json"

  # Read the existing content of the file or create an empty dictionary
  try:
      with open(vertex_key_path, "r") as file:
          # Read the file content
          print("Read vertexai file path")
          content = file.read()

          # If the file is empty or not valid JSON, create an empty dictionary
          if not content or not content.strip():
              service_account_key_data = {}
          else:
              # Attempt to load the existing JSON content
              file.seek(0)
              service_account_key_data = json.load(file)
  except FileNotFoundError:
      # If the file doesn't exist, create an empty dictionary
      service_account_key_data = {}

  # Create a temporary file
  with tempfile.NamedTemporaryFile(mode="w+", delete=False) as temp_file:
      # Write the updated content to the temporary file
      json.dump(service_account_key_data, temp_file, indent=2)

  # Export the temporary file as GOOGLE_APPLICATION_CREDENTIALS
  os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(temp_file.name)
```


### 使用 GCP 服务账号

:::info

想在 Google Cloud Run 上部署 LiteLLM？教程见[这里](https://docs.litellm.ai/docs/proxy/deploy#deploy-with-terraform-aws-and-gcp)

:::

1. 找出绑定到该 Google Cloud Run 服务的服务账号

<Image img={require('../../img/gcp_acc_1.png')} />

2. 获取该服务账号的完整邮箱地址

3. 接着进入 IAM & Admin > Manage Resources，选中承载 Google Cloud Run 服务的顶层项目

点击 `Add Principal`

<Image img={require('../../img/gcp_acc_2.png')}/>

4. 将该服务账号指定为主体（principal），角色选择 Vertex AI User

<Image img={require('../../img/gcp_acc_3.png')}/>

完成后，当你在 Google Cloud Run 服务中部署新容器时，LiteLLM 将自动获得访问所有 Vertex AI 端点的权限。


感谢 @[Darien Kindlund](https://www.linkedin.com/in/kindlund/) 提供本教程

## **Rerank API**

Vertex AI 通过 Discovery Engine API 支持重排序（rerank），为文档检索提供语义排序能力。

### 设置

设置你的 Google Cloud 项目 ID：

```bash
export VERTEXAI_PROJECT="your-project-id"
```

### 用法

```python
from litellm import rerank

# Using the latest model (recommended)
response = rerank(
    model="vertex_ai/semantic-ranker-default@latest",
    query="What is Google Gemini?",
    documents=[
        "Gemini is a cutting edge large language model created by Google.",
        "The Gemini zodiac symbol often depicts two figures standing side-by-side.",
        "Gemini is a constellation that can be seen in the night sky."
    ],
    top_n=2,
    return_documents=True  # Set to False for ID-only responses
)

# Using specific model versions
response_v003 = rerank(
    model="vertex_ai/semantic-ranker-default-003",
    query="What is Google Gemini?",
    documents=documents,
    top_n=2
)

print(response.results)
```

### 参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `model` | string | 模型名称（如 `vertex_ai/semantic-ranker-default@latest`） |
| `query` | string | 搜索查询 |
| `documents` | list | 待排序的文档 |
| `top_n` | int | 返回的前 N 个结果数量 |
| `return_documents` | bool | 返回完整内容（True）还是仅返回 ID（False） |

### 支持的模型

- `semantic-ranker-default@latest`
- `semantic-ranker-fast@latest` 
- `semantic-ranker-default-003`
- `semantic-ranker-default-002`

模型详细规格见 [Google Cloud 排序 API 文档](https://cloud.google.com/generative-ai-app-builder/docs/ranking#rank_or_rerank_a_set_of_records_according_to_a_query)。

### 代理用法

添加到你的 `config.yaml`：

```yaml
model_list:
  - model_name: semantic-ranker-default@latest
    litellm_params:
      model: vertex_ai/semantic-ranker-default@latest
      vertex_ai_project: "your-project-id"
      vertex_ai_location: "us-central1"
      vertex_ai_credentials: "path/to/service-account.json"
```

启动代理：

```bash
litellm --config /path/to/config.yaml
```

用 curl 测试：

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "semantic-ranker-default@latest",
    "query": "What is Google Gemini?",
    "documents": [
      "Gemini is a cutting edge large language model created by Google.",
      "The Gemini zodiac symbol often depicts two figures standing side-by-side.",
      "Gemini is a constellation that can be seen in the night sky."
    ],
    "top_n": 2
  }'
```
