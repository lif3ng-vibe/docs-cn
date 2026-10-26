import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI（文本补全）

LiteLLM 支持 OpenAI 的文本补全（text completion）模型。

### 必需的 API 密钥

```python
import os 
os.environ["OPENAI_API_KEY"] = "your-api-key"
```

### 用法
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "gpt-3.5-turbo-instruct", 
    messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

### 用法 - LiteLLM 代理服务器

下面演示如何通过 LiteLLM 代理服务器调用 OpenAI 模型。

### 1. 在环境中保存密钥

```bash
export OPENAI_API_KEY=""
```

### 2. 启动代理

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}                          # The `openai/` prefix will call openai.chat.completions.create
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-3.5-turbo-instruct
    litellm_params:
      model: text-completion-openai/gpt-3.5-turbo-instruct # The `text-completion-openai/` prefix will call openai.completions.create
      api_key: os.environ/OPENAI_API_KEY
```
</TabItem>
<TabItem value="config-*" label="config.yaml - 代理所有 OpenAI 模型">

这份配置让你用一个 API 密钥接入所有 OpenAI 模型。**警告：这种方式不会做任何负载均衡**
也就是说，发往 `{{openai_large}}`、`{{openai_small}}` 的请求都会走这条路由。

```yaml
model_list:
  - model_name: "*"             # all requests where model not in your config go to this deployment
    litellm_params:
      model: openai/*           # set `openai/` to use the openai route
      api_key: os.environ/OPENAI_API_KEY
```
</TabItem>
<TabItem value="cli" label="CLI">

```bash
$ litellm --model gpt-3.5-turbo-instruct

# Server running on http://0.0.0.0:4000
```
</TabItem>

</Tabs>

### 3. 测试


<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "gpt-3.5-turbo-instruct",
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

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="gpt-3.5-turbo-instruct", messages = [
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
    model = "gpt-3.5-turbo-instruct",
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


## OpenAI 文本补全模型 / Instruct 模型

| 模型名              | 函数调用                                           |
|---------------------|----------------------------------------------------|
| gpt-3.5-turbo-instruct | `response = completion(model="gpt-3.5-turbo-instruct", messages=messages)` |
| gpt-3.5-turbo-instruct-0914 | `response = completion(model="gpt-3.5-turbo-instruct-0914", messages=messages)` |
| babbage-002         | `response = completion(model="babbage-002", messages=messages)` |
| davinci-002         | `response = completion(model="davinci-002", messages=messages)` |
