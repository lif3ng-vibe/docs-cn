import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI Studio

LiteLLM 支持 Azure AI Studio 上的所有模型。


## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

### 环境变量
```python
import os 
os.environ["AZURE_AI_API_KEY"] = ""
os.environ["AZURE_AI_API_BASE"] = ""
```

### 调用示例

```python
from litellm import completion
import os
## set ENV variables
os.environ["AZURE_AI_API_KEY"] = "azure ai key"
os.environ["AZURE_AI_API_BASE"] = "azure ai base url" # e.g.: https://Mistral-large-dfgfj-serverless.eastus2.inference.ai.azure.com/

# predibase llama-3 call
response = completion(
    model="azure_ai/command-r-plus", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 将模型添加到 config.yaml 中

  ```yaml
  model_list:
    - model_name: command-r-plus
      litellm_params:
        model: azure_ai/command-r-plus
        api_key: os.environ/AZURE_AI_API_KEY
        api_base: os.environ/AZURE_AI_API_BASE
  ```



2. 启动代理

  ```bash
  $ litellm --config /path/to/config.yaml --debug
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
      model="command-r-plus",
      messages = [
        {
            "role": "system",
            "content": "Be a good human!"
        },
        {
            "role": "user",
            "content": "What do you know about earth?"
        }
    ]
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
      "model": "command-r-plus",
      "messages": [
        {
            "role": "system",
            "content": "Be a good human!"
        },
        {
            "role": "user",
            "content": "What do you know about earth?"
        }
        ],
  }'
  ```
  </TabItem>

  </Tabs>


</TabItem>

</Tabs>

## 传递额外参数：max_tokens 与 temperature
litellm.completion 支持的全部参数请见[这里](../completion/input.md#已转换的-openai-参数)

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["AZURE_AI_API_KEY"] = "azure ai api key"
os.environ["AZURE_AI_API_BASE"] = "azure ai api base"

# command r plus call
response = completion(
    model="azure_ai/command-r-plus", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    max_tokens=20,
    temperature=0.5
)
```

**代理**

```yaml
  model_list:
    - model_name: command-r-plus
      litellm_params:
        model: azure_ai/command-r-plus
        api_key: os.environ/AZURE_AI_API_KEY
        api_base: os.environ/AZURE_AI_API_BASE
        max_tokens: 20
        temperature: 0.5
```



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
      model="mistral",
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
      "model": "mistral",
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

## 函数调用

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# set env
os.environ["AZURE_AI_API_KEY"] = "your-api-key"
os.environ["AZURE_AI_API_BASE"] = "your-api-base"

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
    model="azure_ai/mistral-large-latest",
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

</TabItem>

<TabItem value="proxy" label="代理">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $YOUR_API_KEY" \
-d '{
  "model": "mistral",
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
</Tabs>

## 支持的模型

LiteLLM 支持**所有** Azure AI 模型，下面是几个例子：

| 模型名                   | 调用方式                                                                                                                                                          |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Cohere command-r-plus | `completion(model="azure_ai/command-r-plus", messages)` | 
| Cohere command-r | `completion(model="azure_ai/command-r", messages)` | 
| mistral-large-latest | `completion(model="azure_ai/mistral-large-latest", messages)` | 
| AI21-Jamba-Instruct | `completion(model="azure_ai/ai21-jamba-instruct", messages)` | 

## 用法：Azure Anthropic（Azure Foundry Claude）

LiteLLM 将 Azure Claude 部署统一经由 `azure_ai/` 提供商处理，Azure Foundry 上的 Claude Opus 模型因此可以继续搭配 Tool Search、Effort、流式输出等全部高级特性使用。把 `AZURE_AI_API_BASE` 指向 `https://<resource>.services.ai.azure.com/anthropic`（LiteLLM 会自动追加 `/v1/messages`），并使用 `AZURE_AI_API_KEY` 或 Azure AD 令牌完成身份验证。

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import os
from litellm import completion

# Configure Azure credentials
os.environ["AZURE_AI_API_KEY"] = "your-azure-ai-api-key"
os.environ["AZURE_AI_API_BASE"] = "https://my-resource.services.ai.azure.com/anthropic"

response = completion(
    model="azure_ai/{{anthropic_large}}",
    messages=[{"role": "user", "content": "Explain how Azure Anthropic hosts Claude Opus differently from the public Anthropic API."}],
    max_tokens=1200,
    temperature=0.7,
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM 代理">

**1. 设置环境变量**

```bash
export AZURE_AI_API_KEY="your-azure-ai-api-key"
export AZURE_AI_API_BASE="https://my-resource.services.ai.azure.com/anthropic"
```

**2. 配置代理**

```yaml
model_list:
  - model_name: claude-4-azure
    litellm_params:
      model: azure_ai/{{anthropic_large}}
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
```

**3. 启动 LiteLLM**

```bash
litellm --config /path/to/config.yaml
```

**4. 测试 Azure Claude 路由**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer $LITELLM_KEY' \
  --data '{
    "model": "claude-4-azure",
    "messages": [
      {
        "role": "user",
        "content": "How do I use Claude Opus 4 via Azure Anthropic in LiteLLM?"
      }
    ],
    "max_tokens": 1024
  }'
```

</TabItem>
</Tabs>



## Rerank 端点

### 用法



<Tabs>
<TabItem value="sdk" label="LiteLLM SDK 用法">

```python
from litellm import rerank
import os

os.environ["AZURE_AI_API_KEY"] = "sk-.."
os.environ["AZURE_AI_API_BASE"] = "https://.."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="azure_ai/cohere-rerank-v3.5",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM 代理用法">

LiteLLM 提供兼容 Cohere API 的 `/rerank` 端点，用于处理重排序（rerank）调用。

**设置**

把以下内容添加到 litellm 代理的 config.yaml 中

```yaml
model_list:
  - model_name: Salesforce/Llama-Rank-V1
    litellm_params:
      model: together_ai/Salesforce/Llama-Rank-V1
      api_key: os.environ/TOGETHERAI_API_KEY
  - model_name: cohere-rerank-v3.5
    litellm_params:
      model: azure_ai/cohere-rerank-v3.5
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
```

启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

测试请求

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cohere-rerank-v3.5",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
  }'
```

</TabItem>
</Tabs>
