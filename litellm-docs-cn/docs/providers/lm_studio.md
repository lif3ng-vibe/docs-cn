import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LM Studio

https://lmstudio.ai/docs/basics/server

:::tip

**我们支持所有 LM Studio 模型，发送 litellm 请求时只需在模型名前加上 `model=lm_studio/<any-model-on-lmstudio>` 前缀**

:::


| 属性 | 说明 |
|-------|-------|
| 描述 | 发现、下载并运行本地 LLM。 |
| LiteLLM 中的提供商路由 | `lm_studio/` |
| 提供商文档 | [LM Studio ↗](https://lmstudio.ai/docs/api/openai-api) |
| 支持的 OpenAI 端点 | `/chat/completions`, `/embeddings`, `/completions` |

## API 密钥
```python
# env variable
os.environ['LM_STUDIO_API_BASE']
os.environ['LM_STUDIO_API_KEY'] # optional, default is empty
```

## 使用示例
```python
from litellm import completion
import os

os.environ['LM_STUDIO_API_BASE'] = ""

response = completion(
    model="lm_studio/llama-3-8b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ]
)
print(response)
```

## 使用示例：流式
```python
from litellm import completion
import os

os.environ['LM_STUDIO_API_KEY'] = ""
response = completion(
    model="lm_studio/llama-3-8b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
)

for chunk in response:
    print(chunk)
```


## 配合 LiteLLM 代理服务器使用

下面演示如何通过 LiteLLM 代理服务器调用 LM Studio 模型。

1. 修改 config.yaml

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: lm_studio/<your-model-name>  # add lm_studio/ prefix to route as LM Studio provider
        api_key: api-key                 # api key to send your model
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
      model="my-model",
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
      "model": "my-model",
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


## 支持的参数

支持的参数详见 [支持的参数](../completion/input.md#已转换的-openai-参数)。

## 嵌入（Embedding）

```python
from litellm import embedding
import os

os.environ['LM_STUDIO_API_BASE'] = "http://localhost:8000"
response = embedding(
    model="lm_studio/jina-embeddings-v3",
    input=["Hello world"],
)
print(response)
```


## 结构化输出（Structured Output）

LM Studio 通过 JSON Schema 支持结构化输出：调用时用 `response_format` 传入 pydantic 模型或一份原始 schema 均可。
LiteLLM 会把 schema 包装成 `{ "type": "json_schema", "json_schema": {"schema": <your schema>} }` 再发给 LM Studio。

```python
from pydantic import BaseModel
from litellm import completion

class Book(BaseModel):
    title: str
    author: str
    year: int

response = completion(
    model="lm_studio/llama-3-8b-instruct",
    messages=[{"role": "user", "content": "Tell me about The Hobbit"}],
    response_format=Book,
)
print(response.choices[0].message.content)
```
