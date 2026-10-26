import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Mistral AI API
https://docs.mistral.ai/api/

## API 密钥
```python
# env variable
os.environ['MISTRAL_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['MISTRAL_API_KEY'] = ""
response = completion(
    model="mistral/mistral-tiny", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 使用示例：流式
```python
from litellm import completion
import os

os.environ['MISTRAL_API_KEY'] = ""
response = completion(
    model="mistral/mistral-tiny", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```



## 通过 LiteLLM 代理使用

### 1. 在 config.yaml 中配置 Mistral 模型

```yaml
model_list:
  - model_name: mistral-small-latest
    litellm_params:
      model: mistral/mistral-small-latest
      api_key: "os.environ/MISTRAL_API_KEY" # ensure you have `MISTRAL_API_KEY` in your .env
```

### 2. 启动代理

```
litellm --config config.yaml
```

### 3. 测试


<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "mistral-small-latest",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(model="mistral-small-latest", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000", # set openai_api_base to the LiteLLM Proxy
    model = "mistral-small-latest",
    temperature=0.1
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```
</TabItem>
</Tabs>

## 支持的模型

:::info
此处 https://docs.mistral.ai/platform/endpoints 列出的所有模型均受支持。我们会在[这里](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)持续维护模型列表、价格、Token 窗口等信息。

:::


| 模型名称     | 函数调用                                                | 推理支持 |
|----------------|--------------------------------------------------------------|-------------------|
| Mistral Small  | `completion(model="mistral/mistral-small-latest", messages)` | 否 |
| Mistral Medium | `completion(model="mistral/mistral-medium-latest", messages)`| 否 |
| Mistral Large 2  | `completion(model="mistral/mistral-large-2407", messages)` | 否 |
| Mistral Large Latest  | `completion(model="mistral/mistral-large-latest", messages)` | 否 |
| **Magistral Small**  | `completion(model="mistral/magistral-small-2506", messages)` | 是 |
| **Magistral Medium** | `completion(model="mistral/magistral-medium-2506", messages)`| 是 |
| Mistral 7B     | `completion(model="mistral/open-mistral-7b", messages)`      | 否 |
| Mixtral 8x7B   | `completion(model="mistral/open-mixtral-8x7b", messages)`    | 否 |
| Mixtral 8x22B  | `completion(model="mistral/open-mixtral-8x22b", messages)`   | 否 |
| Codestral      | `completion(model="mistral/codestral-latest", messages)`     | 否 |
| Mistral NeMo      | `completion(model="mistral/open-mistral-nemo", messages)`     | 否 |
| Mistral NeMo 2407      | `completion(model="mistral/open-mistral-nemo-2407", messages)`     | 否 |
| Codestral Mamba      | `completion(model="mistral/open-codestral-mamba", messages)`     | 否 |
| Codestral Mamba    | `completion(model="mistral/codestral-mamba-latest"", messages)`     | 否 |

## 函数调用（Function Calling）

```python
from litellm import completion

# set env
os.environ["MISTRAL_API_KEY"] = "your-api-key"

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
    model="mistral/mistral-large-latest",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)
# Add any assertions, here to check response args
print(response)
assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
assert isinstance(
    response.choices[0].message.tool_calls[0].function.arguments, str
)
```

## 推理

Mistral 本身并不直接支持推理，而是建议在其 magistral 模型上配合特定的[系统提示词](https://docs.mistral.ai/capabilities/reasoning/)使用。设置 `reasoning_effort` 参数后，LiteLLM 会把这段系统提示词前置到请求中。

如果请求中已带有系统消息，LiteLLM 会把两者作为一个系统消息列表一并发送（开启 `litellm._turn_on_debug()` 即可验证）。

### 支持的模型

| 模型名称     | 函数调用                                                |
|----------------|--------------------------------------------------------------|
| Magistral Small  | `completion(model="mistral/magistral-small-2506", messages)` |
| Magistral Medium | `completion(model="mistral/magistral-medium-2506", messages)`|

### 使用推理强度参数

`reasoning_effort` 参数控制模型在推理上投入多少精力，配合 magistral 模型使用。

```python
from litellm import completion
import os

os.environ['MISTRAL_API_KEY'] = "your-api-key"

response = completion(
    model="mistral/magistral-medium-2506",
    messages=[
        {"role": "user", "content": "What is 15 multiplied by 7?"}
    ],
    reasoning_effort="medium"  # Options: "low", "medium", "high"
)

print(response)
```

### 带系统消息的示例

如果你已经有系统消息，LiteLLM 会把推理指引前置进去：

```python
response = completion(
    model="mistral/magistral-medium-2506",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor."},
        {"role": "user", "content": "Explain how to solve quadratic equations."}
    ],
    reasoning_effort="high"
)

# The system message becomes:
# "When solving problems, think step-by-step in <think> tags before providing your final answer...
#  
#  You are a helpful math tutor."
```

### 通过 LiteLLM 代理使用

也可以通过 LiteLLM 代理来使用推理能力：

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
      "model": "magistral-medium-2506",
      "messages": [
        {
          "role": "user",
          "content": "What is the square root of 144? Show your reasoning."
        }
      ],
      "reasoning_effort": "medium"
    }'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="magistral-medium-2506", 
    messages=[
        {
            "role": "user",
            "content": "Calculate the area of a circle with radius 5. Show your work."
        }
    ],
    reasoning_effort="high"
)

print(response)
```
</TabItem>
</Tabs>

### 重要说明

- **模型兼容性**：推理参数仅对 magistral 模型生效
- **向后兼容性**：非 magistral 模型会忽略推理参数，照常工作

## 语音转写

可以使用 Mistral 的 Voxtral 模型，通过 `litellm.transcription()` 进行语音转写（audio transcription）。

### SDK 用法

```python
from litellm import transcription
import os

os.environ["MISTRAL_API_KEY"] = ""

audio_file = open("path/to/audio.wav", "rb")

response = transcription(
    model="mistral/voxtral-mini-latest",
    file=audio_file,
)

print(response.text)
```

### 使用可选参数

```python
response = transcription(
    model="mistral/voxtral-mini-latest",
    file=audio_file,
    language="en",
    temperature=0.0,
    response_format="json",
)
```

### Mistral 专属参数

除 OpenAI 兼容参数外，Mistral 还支持以下额外参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `diarize` | `bool` | 启用说话人分离（diarization） |

```python
response = transcription(
    model="mistral/voxtral-mini-latest",
    file=audio_file,
    diarize=True,
)
```

### 通过 LiteLLM 代理使用

```yaml
model_list:
  - model_name: voxtral
    litellm_params:
      model: mistral/voxtral-mini-latest
      api_key: os.environ/MISTRAL_API_KEY
    model_info:
      mode: audio_transcription
```

```bash
litellm --config /path/to/config.yaml
```

```bash
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'file=@"audio.wav"' \
--form 'model="voxtral"'
```

## 文件与批处理 API

LiteLLM 会把 OpenAI 兼容的 `/v1/files` 与 `/v1/batches` 端点路由到 Mistral 的文件与批处理 API。完整流程和成本追踪（cost tracking）参见 [Mistral AI Batch API](./mistral_batches)。

## 使用示例：嵌入
```python
from litellm import embedding
import os

os.environ['MISTRAL_API_KEY'] = ""
response = embedding(
    model="mistral/mistral-embed",
    input=["good morning from litellm"],
)
print(response)
```


## 支持的模型
此处 https://docs.mistral.ai/platform/endpoints 列出的所有模型均受支持

| 模型名称               | 函数调用                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Mistral Embeddings | `embedding(model="mistral/mistral-embed", input)` | 


