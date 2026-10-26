import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Langchain、OpenAI SDK、LlamaIndex、Instructor、Curl 示例

LiteLLM 代理（Proxy）与 **OpenAI 兼容**，支持：
* /chat/completions 
* /embeddings
* /completions 
* /image/generations 
* /moderations 
* /audio/transcriptions
* /audio/speech
* [Assistants API 端点](https://docs.litellm.ai/docs/assistants)
* [Batches API 端点](https://docs.litellm.ai/docs/batches)
* [微调 API 端点](https://docs.litellm.ai/docs/fine_tuning)

LiteLLM 代理与 **Azure OpenAI 兼容**：
* /chat/completions
* /completions
* /embeddings 

LiteLLM 代理与 **Anthropic 兼容**： 
* /messages 

LiteLLM 代理与 **Vertex AI 兼容**：
- [支持全部 Vertex 端点](/docs/pass_through/vertex_ai)

本文涵盖：

*   /chat/completion
*   /embedding


以下是**精选示例**。LiteLLM 代理与 **OpenAI 兼容**，任何调用 OpenAI 的项目都能直接接入，只需修改 `base_url`、`api_key` 和 `model`。

如需传入提供商专属参数，参见[这里](https://docs.litellm.ai/docs/completion/provider_specific_params#proxy-usage)

如需丢弃不支持的参数（例如 LibreChat 调用 Bedrock 时的 frequency_penalty），参见[这里](https://docs.litellm.ai/docs/completion/drop_params#openai-proxy-usage)


:::info

**所有支持的模型，其输入、输出与异常都会映射为 OpenAI 格式**

:::

下面介绍如何向代理发送请求、传递元数据（metadata），以及如何允许用户使用自己的 OpenAI API 密钥。

## `/chat/completions`

### 请求格式

<Tabs>


<TabItem value="openai" label="OpenAI Python v1.0.0+">

将 `extra_body={"metadata": { }}` 设置为你想要传递的 `metadata`

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={ # pass in any provider-specific param, if not supported by openai, https://docs.litellm.ai/docs/completion/input#provider-specific-params
        "metadata": { # 👈 use for logging additional params (e.g. to langfuse)
            "generation_name": "ishaan-generation-openai-client",
            "generation_id": "openai-client-gen-id22",
            "trace_id": "openai-client-trace-id22",
            "trace_user_id": "openai-client-user-id2"
        }
    }
)

print(response)
```
</TabItem>
<TabItem value="litellm_sdk" label="LiteLLM Python SDK">

[**👉 见此处**](../providers/litellm_proxy#将所有-sdk-请求发送至-litellm-代理)

</TabItem>
<TabItem value="azureopenai" label="AzureOpenAI Python">

将 `extra_body={"metadata": { }}` 设置为你想要传递的 `metadata`

```python
import openai
client = openai.AzureOpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={ # pass in any provider-specific param, if not supported by openai, https://docs.litellm.ai/docs/completion/input#provider-specific-params
        "metadata": { # 👈 use for logging additional params (e.g. to langfuse)
            "generation_name": "ishaan-generation-openai-client",
            "generation_id": "openai-client-gen-id22",
            "trace_id": "openai-client-trace-id22",
            "trace_user_id": "openai-client-user-id2"
        }
    }
)

print(response)
```
</TabItem>
<TabItem value="LlamaIndex" label="LlamaIndex">

```python
import os, dotenv

from llama_index.llms import AzureOpenAI
from llama_index.embeddings import AzureOpenAIEmbedding
from llama_index import VectorStoreIndex, SimpleDirectoryReader, ServiceContext

llm = AzureOpenAI(
    engine="azure-gpt-3.5",               # model_name on litellm proxy
    temperature=0.0,
    azure_endpoint="http://0.0.0.0:4000", # litellm proxy endpoint
    api_key="sk-<your-litellm-api-key>",                    # litellm proxy API Key
    api_version="2023-07-01-preview",
)

embed_model = AzureOpenAIEmbedding(
    deployment_name="azure-embedding-model",
    azure_endpoint="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",
    api_version="2023-07-01-preview",
)


documents = SimpleDirectoryReader("llama_index_data").load_data()
service_context = ServiceContext.from_defaults(llm=llm, embed_model=embed_model)
index = VectorStoreIndex.from_documents(documents, service_context=service_context)

query_engine = index.as_query_engine()
response = query_engine.query("What did the author do growing up?")
print(response)

```
</TabItem>

<TabItem value="Curl" label="Curl 请求">

在请求体中一并传入 `metadata`

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {
        "generation_name": "ishaan-test-generation",
        "generation_id": "gen-id22",
        "trace_id": "trace-id22",
        "trace_user_id": "user-id2"
    }
}'
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
import os 

os.environ["OPENAI_API_KEY"] = "anything"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "{{openai_small}}",
    temperature=0.1,
    extra_body={
        "metadata": {
            "generation_name": "ishaan-generation-langchain-client",
            "generation_id": "langchain-client-gen-id22",
            "trace_id": "langchain-client-trace-id22",
            "trace_user_id": "langchain-client-user-id2"
        }
    }
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
<TabItem value="langchain js" label="Langchain JS">

```js
import { ChatOpenAI } from "@langchain/openai";


const model = new ChatOpenAI({
  modelName: "{{openai_large}}",
  openAIApiKey: "sk-<your-litellm-api-key>",
  modelKwargs: {"metadata": "hello world"} // 👈 PASS Additional params here
}, {
  basePath: "http://0.0.0.0:4000",
});

const message = await model.invoke("Hi there!");

console.log(message);

```

</TabItem>
<TabItem value="openai JS" label="OpenAI JS">

```js
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-<your-api-key>", // This is the default and can be omitted
  baseURL: "http://0.0.0.0:4000"
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: '{{openai_small}}',
  }, {"metadata": {
            "generation_name": "ishaan-generation-openaijs-client",
            "generation_id": "openaijs-client-gen-id22",
            "trace_id": "openaijs-client-trace-id22",
            "trace_user_id": "openaijs-client-user-id2"
        }});
}

main();

```

</TabItem>

<TabItem value="anthropic-py" label="Anthropic Python SDK">

```python
import os

from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:4000", # proxy endpoint
    api_key="sk-test-proxy-key-123", # litellm proxy virtual key (example)
)

message = client.messages.create(
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude",
        }
    ],
    model="{{anthropic}}",
)
print(message.content)
```

</TabItem>

<TabItem value="mistral-py" label="Mistral Python SDK">

```python
import os
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage


client = MistralClient(api_key="sk-<your-litellm-api-key>", endpoint="http://0.0.0.0:4000")
chat_response = client.chat(
    model="mistral-small-latest",
    messages=[
        {"role": "user", "content": "this is a test request, write a short poem"}
    ],
)
print(chat_response.choices[0].message.content)
```

</TabItem>

<TabItem value="instructor" label="Instructor">

```python
from openai import OpenAI
import instructor
from pydantic import BaseModel

my_proxy_api_key = "" # e.g. sk-<your-litellm-api-key> - LITELLM KEY
my_proxy_base_url = "" # e.g. http://0.0.0.0:4000 - LITELLM PROXY BASE URL

# This enables response_model keyword
# from client.chat.completions.create
## WORKS ACROSS OPENAI/ANTHROPIC/VERTEXAI/ETC. - all LITELLM SUPPORTED MODELS!
client = instructor.from_openai(OpenAI(api_key=my_proxy_api_key, base_url=my_proxy_base_url))

class UserDetail(BaseModel):
    name: str
    age: int

user = client.chat.completions.create(
    model="gemini-pro-flash",
    response_model=UserDetail,
    messages=[
        {"role": "user", "content": "Extract Jason is 25 years old"},
    ]
)

assert isinstance(user, UserDetail)
assert user.name == "Jason"
assert user.age == 25
```
</TabItem>
</Tabs>

## 用标签做分类与追踪

标签可用于给 LLM 请求做分类、过滤和追踪。在 metadata 中加上标签，能更好地组织请求、便于分析。

<Tabs>
<TabItem value="openai-python" label="OpenAI Python">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Hello!"}],
    extra_body={
        "metadata": {
            "tags": ["production", "customer-support", "urgent"],
            "generation_name": "support-bot",
            "trace_user_id": "user-123"
        }
    }
)
```

</TabItem>

<TabItem value="langchain-python" label="LangChain Python">

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model="{{openai_large}}",
    extra_body={
        "metadata": {
            "tags": ["langchain-integration", "content-gen"],
            "trace_user_id": "user-456"
        }
    }
)

response = chat.invoke([HumanMessage(content="Generate a blog post")])
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello!"}],
    "metadata": {
        "tags": ["api-test", "development"],
        "trace_user_id": "test-user"
    }
}'
```

</TabItem>

<TabItem value="openai-js" label="OpenAI JS">

```js
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-<your-api-key>",
  baseURL: "http://0.0.0.0:4000"
});

async function main() {
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Hello!' }],
    model: '{{openai_small}}',
    metadata: {
      tags: ["javascript-client", "api-test"],
      trace_user_id: "js-user-789"
    }
  });
}
```

</TabItem>
</Tabs>

### 标签的好处

- **成本追踪**（cost tracking）：按项目/团队/功能监控花费
- **数据分析**：在日志和仪表板中按标签筛选请求  
- **路由**：用标签实现条件模型路由
- **调试**：请求已分类，排查问题更轻松

### 响应格式

```json
{
  "id": "chatcmpl-8c5qbGTILZa1S4CK3b31yj5N40hFN",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "As an AI language model, I do not have a physical form or personal preferences. However, I am programmed to assist with various topics and provide information on a wide range of subjects. Is there something specific you would like assistance with?",
        "role": "assistant"
      }
    }
  ],
  "created": 1704089632,
  "model": "{{openai_small}}",
  "object": "chat.completion",
  "system_fingerprint": null,
  "usage": {
    "completion_tokens": 47,
    "prompt_tokens": 12,
    "total_tokens": 59
  },
  "_response_ms": 1753.426
}

```

### **流式**


<Tabs>
<TabItem value="curl" label="curl">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPTIONAL_YOUR_PROXY_KEY" \
-d '{
  "model": "{{openai_large}}",
  "messages": [
    {
      "role": "user",
      "content": "this is a test request, write a short poem"
    }
  ],
  "stream": true
}'
```
</TabItem>
<TabItem value="sdk" label="SDK">

```python 
from openai import OpenAI
client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # [OPTIONAL] set if you set one on proxy, else set ""
    base_url="http://0.0.0.0:4000",
)

messages = [{"role": "user", "content": "this is a test request, write a short poem"}]
completion = client.chat.completions.create(
  model="{{openai_large}}",
  messages=messages,
  stream=True
)

print(completion)

```
</TabItem>
</Tabs>


### 函数调用

下面是通过代理进行函数调用（function calling）的一些示例。

任何 **OpenAI 兼容**的项目，都能通过代理进行函数调用。

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPTIONAL_YOUR_PROXY_KEY" \
-d '{
  "model": "{{openai_large}}",
  "messages": [
    {
      "role": "user",
      "content": "What'\''s the weather like in Boston today?"
    }
  ],
  "tools": [
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
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'
```
</TabItem>
<TabItem value="sdk" label="SDK">

```python 
from openai import OpenAI
client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # [OPTIONAL] set if you set one on proxy, else set ""
    base_url="http://0.0.0.0:4000",
)

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
    }
  }
]
messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]
completion = client.chat.completions.create(
  model="{{openai_large}}", # use 'model_name' from config.yaml
  messages=messages,
  tools=tools,
  tool_choice="auto"
)

print(completion)

```
</TabItem>
</Tabs>

## `/embeddings`

### 请求格式
所有支持的模型，其输入、输出与异常都会映射为 OpenAI 格式。

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    input=["hello from litellm"],
    model="text-embedding-ada-002"
)

print(response)

```
</TabItem>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/embeddings' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "text-embedding-ada-002",
  "input": ["write a litellm poem"]
  }'
```
</TabItem>

<TabItem value="langchain-embedding" label="Langchain 嵌入">

```python
from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="sagemaker-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")


text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"SAGEMAKER EMBEDDINGS")
print(query_result[:5])

embeddings = OpenAIEmbeddings(model="bedrock-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"BEDROCK EMBEDDINGS")
print(query_result[:5])

embeddings = OpenAIEmbeddings(model="bedrock-titan-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"TITAN EMBEDDINGS")
print(query_result[:5])
```
</TabItem>
</Tabs>


### 响应格式

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [
        0.0023064255,
        -0.009327292,
        ...,
        -0.0028842222
      ],
      "index": 0
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}

```

## `/moderations`


### 请求格式
所有支持的模型，其输入、输出与异常都会映射为 OpenAI 格式。

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.moderations.create(
    input="hello from litellm",
    model="text-moderation-stable"
)

print(response)

```
</TabItem>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/moderations' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data '{"input": "Sample text goes here", "model": "text-moderation-stable"}'
```
</TabItem>
</Tabs>


### 响应格式

```json
{
  "id": "modr-8sFEN22QCziALOfWTa77TodNLgHwA",
  "model": "text-moderation-007",
  "results": [
    {
      "categories": {
        "harassment": false,
        "harassment/threatening": false,
        "hate": false,
        "hate/threatening": false,
        "self-harm": false,
        "self-harm/instructions": false,
        "self-harm/intent": false,
        "sexual": false,
        "sexual/minors": false,
        "violence": false,
        "violence/graphic": false
      },
      "category_scores": {
        "harassment": 0.000019947197870351374,
        "harassment/threatening": 5.5971017900446896e-6,
        "hate": 0.000028560316422954202,
        "hate/threatening": 2.2631787999216613e-8,
        "self-harm": 2.9121162015144364e-7,
        "self-harm/instructions": 9.314219084899378e-8,
        "self-harm/intent": 8.093739012338119e-8,
        "sexual": 0.00004414955765241757,
        "sexual/minors": 0.0000156943697220413,
        "violence": 0.00022354527027346194,
        "violence/graphic": 8.804164281173144e-6
      },
      "flagged": false
    }
  ]
}
```


## 在 OpenAI 兼容项目中使用
把 `base_url` 指向 LiteLLM 代理服务器。

<Tabs>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="{{openai_small}}", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

```
</TabItem>
<TabItem value="librechat" label="LibreChat">

#### 启动 LiteLLM 代理
```shell
litellm --model {{openai_small}}

#INFO: Proxy running on http://0.0.0.0:4000
```

#### 1. 克隆仓库

```shell
git clone https://github.com/danny-avila/LibreChat.git
```


#### 2. 修改 Librechat 的 `docker-compose.yml`
LiteLLM 代理运行在 `4000` 端口，把下方配置中的代理指向 `4000` 端口即可。
```yaml
OPENAI_REVERSE_PROXY=http://host.docker.internal:4000/v1/chat/completions
```

#### 3. 在 Librechat 的 `.env` 中保存假的 OpenAI 密钥

把 Librechat 的 `.env.example` 复制为 `.env`，并覆盖默认的 OPENAI_API_KEY（默认情况下它要求用户传入密钥）。
```env
OPENAI_API_KEY=sk-<your-api-key>
```

#### 4. 运行 LibreChat
```shell
docker compose up
```
</TabItem>

<TabItem value="continue-dev" label="ContinueDev">

Continue-Dev 把 ChatGPT 带进了 VSCode，[点此安装](https://continue.dev/docs/quickstart)。

在 [config.py](https://continue.dev/docs/reference/Models/openai) 中把它设为默认模型。
```python
  default=OpenAI(
      api_key="IGNORED",
      model="fake-model-name",
      context_length=2048, # customize if needed for your model
      api_base="http://localhost:4000" # your proxy server url
  ),
```

本教程来自 [@vividfog](https://github.com/ollama/ollama/issues/305#issuecomment-1751848077)。
</TabItem>

<TabItem value="aider" label="Aider">

```shell
$ uv add aider 

$ aider --openai-api-base http://0.0.0.0:4000 --openai-api-key fake-key
```
</TabItem>
<TabItem value="autogen" label="AutoGen">

```bash
uv add pyautogen
```

```python
from autogen import AssistantAgent, UserProxyAgent, oai
config_list=[
    {
        "model": "my-fake-model",
        "api_base": "http://localhost:4000",  #litellm compatible endpoint
        "api_type": "open_ai",
        "api_key": "NULL", # just a placeholder
    }
]

response = oai.Completion.create(config_list=config_list, prompt="Hi")
print(response) # works fine

llm_config={
    "config_list": config_list,
}

assistant = AssistantAgent("assistant", llm_config=llm_config)
user_proxy = UserProxyAgent("user_proxy")
user_proxy.initiate_chat(assistant, message="Plot a chart of META and TESLA stock price change YTD.", config_list=config_list)
```

本教程来自 [@victordibia](https://github.com/microsoft/autogen/issues/45#issuecomment-1749921972)。
</TabItem>

<TabItem value="guidance" label="guidance">
guidance 是一门用于控制大语言模型的语言。
https://github.com/guidance-ai/guidance

**注意**：Guidance 会附带发送 `stop_sequences` 等额外参数，模型如果不支持，调用可能会失败。

**解决办法**：启动代理时加上 `--drop_params` 标志。

```shell
litellm --model ollama/codellama --temperature 0.3 --max_tokens 2048 --drop_params
```

```python
import guidance

# set api_base to your proxy
# set api_key to anything
gpt4 = guidance.llms.OpenAI("{{openai_large}}", api_base="http://0.0.0.0:4000", api_key="anything")

experts = guidance('''
{{#system~}}
You are a helpful and terse assistant.
{{~/system}}

{{#user~}}
I want a response to the following question:
{{query}}
Name 3 world-class experts (past or present) who would be great at answering this?
Don't answer the question yet.
{{~/user}}

{{#assistant~}}
{{gen 'expert_names' temperature=0 max_tokens=300}}
{{~/assistant}}
''', llm=gpt4)

result = experts(query='How can I be more productive?')
print(result)
```
</TabItem>
</Tabs>
## 配合 Vertex、Boto3、Anthropic SDK 使用（原生格式）

👉 **[如何通过 litellm 代理以原生格式搭配 Vertex、boto3 与 Anthropic SDK 使用](../pass_through/vertex_ai.md)**

## 进阶用法

### （Beta）批量补全：传入多个模型

当你想把一个请求同时发给 N 个模型时，可以使用这一功能。

#### 请求格式

把 `model` 写成以逗号分隔的多个模型组成的字符串即可，例如 `"model"="llama3,{{openai_small}}"`。

同一个请求会被发送到 [litellm proxy config.yaml](https://docs.litellm.ai/docs/proxy/configs) 中定义的下列模型组（model group）：
- `model_name="llama3"`
- `model_name="{{openai_small}}"` 

<Tabs>

<TabItem value="openai-py" label="OpenAI Python SDK">


```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.chat.completions.create(
    model="{{openai_small}},llama3",
    messages=[
        {"role": "user", "content": "this is a test request, write a short poem"}
    ],
)

print(response)
```



#### 响应格式

当 `model` 同时传入多个模型时，返回的将是一个响应列表。

```python
[
    ChatCompletion(
        id='chatcmpl-9NoYhS2G0fswot0b6QpoQgmRQMaIf',
        choices=[
            Choice(
                finish_reason='stop',
                index=0,
                logprobs=None,
                message=ChatCompletionMessage(
                    content='In the depths of my soul, a spark ignites\nA light that shines so pure and bright\nIt dances and leaps, refusing to die\nA flame of hope that reaches the sky\n\nIt warms my heart and fills me with bliss\nA reminder that in darkness, there is light to kiss\nSo I hold onto this fire, this guiding light\nAnd let it lead me through the darkest night.',
                    role='assistant',
                    function_call=None,
                    tool_calls=None
                )
            )
        ],
        created=1715462919,
        model='{{openai_small}}',
        object='chat.completion',
        system_fingerprint=None,
        usage=CompletionUsage(
            completion_tokens=83,
            prompt_tokens=17,
            total_tokens=100
        )
    ),
    ChatCompletion(
        id='chatcmpl-4ac3e982-da4e-486d-bddb-ed1d5cb9c03c',
        choices=[
            Choice(
                finish_reason='stop',
                index=0,
                logprobs=None,
                message=ChatCompletionMessage(
                    content="A test request, and I'm delighted!\nHere's a short poem, just for you:\n\nMoonbeams dance upon the sea,\nA path of light, for you to see.\nThe stars up high, a twinkling show,\nA night of wonder, for all to know.\n\nThe world is quiet, save the night,\nA peaceful hush, a gentle light.\nThe world is full, of beauty rare,\nA treasure trove, beyond compare.\n\nI hope you enjoyed this little test,\nA poem born, of whimsy and jest.\nLet me know, if there's anything else!",
                    role='assistant',
                    function_call=None,
                    tool_calls=None
                )
            )
        ],
        created=1715462919,
        model='groq/llama3-8b-8192',
        object='chat.completion',
        system_fingerprint='fp_a2c8d063cb',
        usage=CompletionUsage(
            completion_tokens=120,
            prompt_tokens=20,
            total_tokens=140
        )
    )
]
```


</TabItem>

<TabItem value="curl" label="Curl">





```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "llama3,{{openai_small}}",
    "max_tokens": 10,
    "user": "litellm2",
    "messages": [
        {
        "role": "user",
        "content": "is litellm getting better"
        }
    ]
}'
```




#### 响应格式

当 `model` 同时传入多个模型时，返回的将是一个响应列表。

```json
[
  {
    "id": "chatcmpl-3dbd5dd8-7c82-4ca3-bf1f-7c26f497cf2b",
    "choices": [
      {
        "finish_reason": "length",
        "index": 0,
        "message": {
          "content": "The Elder Scrolls IV: Oblivion!\n\nReleased",
          "role": "assistant"
        }
      }
    ],
    "created": 1715459876,
    "model": "groq/llama3-8b-8192",
    "object": "chat.completion",
    "system_fingerprint": "fp_179b0f92c9",
    "usage": {
      "completion_tokens": 10,
      "prompt_tokens": 12,
      "total_tokens": 22
    }
  },
  {
    "id": "chatcmpl-9NnldUfFLmVquFHSX4yAtjCw8PGei",
    "choices": [
      {
        "finish_reason": "length",
        "index": 0,
        "message": {
          "content": "TES4 could refer to The Elder Scrolls IV:",
          "role": "assistant"
        }
      }
    ],
    "created": 1715459877,
    "model": "{{openai_small}}",
    "object": "chat.completion",
    "system_fingerprint": null,
    "usage": {
      "completion_tokens": 10,
      "prompt_tokens": 9,
      "total_tokens": 19
    }
  }
]
```


</TabItem>
</Tabs>
