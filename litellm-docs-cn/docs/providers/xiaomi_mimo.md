import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Xiaomi MiMo
https://platform.xiaomimimo.com/#/docs

:::tip

**我们支持所有 Xiaomi MiMo 模型，只需在发送 litellm 请求时，将 `model=xiaomi_mimo/<any-model-on-xiaomi-mimo>` 作为模型名前缀即可**

:::

## API 密钥
```python
# env variable
os.environ['XIAOMI_MIMO_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['XIAOMI_MIMO_API_KEY'] = ""
response = completion(
    model="xiaomi_mimo/mimo-v2-flash",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    max_tokens=1024,
    temperature=0.3,
    top_p=0.95,
)
print(response)
```

## 使用示例：流式
```python
from litellm import completion
import os

os.environ['XIAOMI_MIMO_API_KEY'] = ""
response = completion(
    model="xiaomi_mimo/mimo-v2-flash",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    max_tokens=1024,
    temperature=0.3,
    top_p=0.95,
)

for chunk in response:
    print(chunk)
```


## 通过 LiteLLM 代理服务器使用

下面演示如何通过 LiteLLM 代理服务器（Proxy Server）调用 Xiaomi MiMo 模型。

1. 修改 config.yaml

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: xiaomi_mimo/<your-model-name>  # add xiaomi_mimo/ prefix to route as Xiaomi MiMo provider
        api_key: api-key                      # api key to send your model
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

## 支持的模型

| 模型名称 | 用法 |
|------------|-------|
| mimo-v2-flash | `completion(model="xiaomi_mimo/mimo-v2-flash", messages)` |
