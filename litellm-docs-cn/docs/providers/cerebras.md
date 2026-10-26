import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cerebras
https://inference-docs.cerebras.ai/api-reference/chat-completions

:::tip

**我们支持全部 Cerebras 模型，发送 litellm 请求时只需在模型名前加上 `model=cerebras/<any-model-on-cerebras>` 前缀即可**

:::

## API 密钥
```python
# env variable
os.environ['CEREBRAS_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['CEREBRAS_API_KEY'] = ""
response = completion(
    model="cerebras/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit? (Write in JSON)",
        }
    ],
    max_tokens=10,
        
    # The prompt should include JSON if 'json_object' is selected; otherwise, you will get error code 400.
    response_format={ "type": "json_object" },
    seed=123,
    stop=["\n\n"],
    temperature=0.2,
    top_p=0.9,
    tool_choice="auto",
    tools=[],
    user="user",
)
print(response)
```

## 流式调用示例
```python
from litellm import completion
import os

os.environ['CEREBRAS_API_KEY'] = ""
response = completion(
    model="cerebras/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit? (Write in JSON)",
        }
    ],
    stream=True,
    max_tokens=10,

    # The prompt should include JSON if 'json_object' is selected; otherwise, you will get error code 400.
    response_format={ "type": "json_object" }, 
    seed=123,
    stop=["\n\n"],
    temperature=0.2,
    top_p=0.9,
    tool_choice="auto",
    tools=[],
    user="user",
)

for chunk in response:
    print(chunk)
```


## 通过 LiteLLM 代理服务器使用

下面演示如何通过 LiteLLM 代理服务器（Proxy Server）调用 Cerebras 模型

1. 修改 config.yaml

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: cerebras/<your-model-name>  # add cerebras/ prefix to route as Cerebras provider
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
