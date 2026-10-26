import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 计费

按用量为内部团队和外部客户计费

**🚨 前提条件**
- [部署 Lago](https://docs.getlago.com/guide/self-hosted/docker#run-the-app)，用于基于用量的计费。推荐跟着 [官方的 Stripe 教程](https://docs.getlago.com/templates/per-transaction/stripe#step-1-create-billable-metrics-for-transaction) 操作

步骤：
- 将代理连接到 Lago
- 设置要计费对象的 id（客户、内部用户、团队）
- 开始！

## 快速上手

按用量为内部团队计费

### 1. 将代理连接到 Lago

在代理的 config.yaml 中，把 "lago" 设置为回调（callback）

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["lago"] # 👈 KEY CHANGE

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

把 Lago 密钥添加到环境变量

```bash
export LAGO_API_BASE="http://localhost:3000" # self-host - https://docs.getlago.com/guide/self-hosted/docker#run-the-app
export LAGO_API_KEY="3e29d607-de54-49aa-a019-ecf585729070" # Get key - https://docs.getlago.com/guide/self-hosted/docker#find-your-api-key
export LAGO_API_EVENT_CODE="openai_tokens" # name of lago billing code
export LAGO_API_CHARGE_BY="team_id" # 👈 Charges 'team_id' attached to proxy key
```

启动代理

```bash
litellm --config /path/to/config.yaml
```

### 2. 为内部团队创建密钥

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data-raw '{"team_id": "my-unique-id"}' # 👈 Internal Team's ID
```

响应对象：

```bash
{
  "key": "sk-tXL0wt5-lOOVK9sfY2UacA",
}
```


### 3. 开始计费！

<Tabs>
<TabItem value="curl" label="Curl">

```bash
# Authorization: 👈 Team's Key
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-tXL0wt5-lOOVK9sfY2UacA' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```
</TabItem>
<TabItem value="openai_python" label="OpenAI Python SDK">

```python
import openai
client = openai.OpenAI(
    api_key="sk-tXL0wt5-lOOVK9sfY2UacA", # 👈 Team's Key
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="{{openai_large}}", messages = [
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
import os 

os.environ["OPENAI_API_KEY"] = "sk-tXL0wt5-lOOVK9sfY2UacA" # 👈 Team's Key

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "{{openai_large}}",
    temperature=0.1,
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

**在 Lago 上查看结果**


<Image img={require('../../img/lago_2.png')}  style={{ width: '500px', height: 'auto' }} />

## 进阶 - Lago 日志对象

LiteLLM 会向 Lago 记录以下内容

```
{
    "event": {
      "transaction_id": "<generated_unique_id>",
      "external_customer_id": <selected_id>, # either 'end_user_id', 'user_id', or 'team_id'. Default 'end_user_id'. 
      "code": os.getenv("LAGO_API_EVENT_CODE"), 
      "properties": {
          "input_tokens": <number>,
          "output_tokens": <number>,
          "model": <string>,
          "response_cost": <number>, # 👈 LITELLM CALCULATED RESPONSE COST - https://github.com/BerriAI/litellm/blob/d43f75150a65f91f60dc2c0c9462ce3ffc713c1f/litellm/utils.py#L1473
      }
    }
}
```

## 进阶 - 客户与内部用户计费

对应关系如下：
- 客户（在 /chat/completion 调用中通过 "user" 参数传入 id）= "end_user_id"
- 内部用户（[创建密钥](https://docs.litellm.ai/docs/proxy/virtual_keys#advanced---spend-tracking)时设置的 id）= "user_id"
- 团队（[创建密钥](https://docs.litellm.ai/docs/proxy/virtual_keys#advanced---spend-tracking)时设置的 id）= "team_id"



<Tabs>
<TabItem value="customers" label="客户计费">

1. 把 "LAGO_API_CHARGE_BY" 设置为 "end_user_id"

  ```bash
  export LAGO_API_CHARGE_BY="end_user_id"
  ```

2. 测试一下！

  <Tabs>
  <TabItem value="curl" label="Curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --data ' {
        "model": "{{openai_large}}",
        "messages": [
          {
            "role": "user",
            "content": "what llm are you"
          }
        ],
        "user": "my_customer_id" # 👈 whatever your customer id is
      }
  '
  ```
  </TabItem>
  <TabItem value="openai_sdk" label="OpenAI Python SDK">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="anything",
      base_url="http://0.0.0.0:4000"
  )

  # request sent to model set on litellm proxy, `litellm --model`
  response = client.chat.completions.create(model="{{openai_large}}", messages = [
      {
          "role": "user",
          "content": "this is a test request, write a short poem"
      }
  ], user="my_customer_id") # 👈 whatever your customer id is

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
  import os 

  os.environ["OPENAI_API_KEY"] = "anything"

  chat = ChatOpenAI(
      openai_api_base="http://0.0.0.0:4000",
      model = "{{openai_large}}",
      temperature=0.1,
      extra_body={
          "user": "my_customer_id"  # 👈 whatever your customer id is
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
  </Tabs>

</TabItem>
<TabItem value="users" label="内部用户计费">

1. 把 "LAGO_API_CHARGE_BY" 设置为 "user_id"

```bash
export LAGO_API_CHARGE_BY="user_id"
```

2. 为该用户创建密钥

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"user_id": "my-unique-id"}' # 👈 Internal User's id
```

响应对象：

```bash
{
  "key": "sk-tXL0wt5-lOOVK9sfY2UacA",
}
```

3. 用该密钥发起 API 调用

```python
import openai
client = openai.OpenAI(
    api_key="sk-tXL0wt5-lOOVK9sfY2UacA", # 👈 Generated key
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="{{openai_large}}", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)
```
</TabItem>
</Tabs>
