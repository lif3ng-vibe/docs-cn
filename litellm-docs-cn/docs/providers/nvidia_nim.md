import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nvidia NIM
https://docs.api.nvidia.com/nim/reference/

:::tip

**我们支持全部 Nvidia NIM 模型：发送 litellm 请求时，只需把 `model=nvidia_nim/<any-model-on-nvidia_nim>` 作为模型名前缀即可**

:::

| 属性 | 说明 |
|-------|-------|
| 描述 | Nvidia NIM 是一个为部署和使用 AI 模型提供简洁 API 的平台。LiteLLM 支持 [Nvidia NIM](https://developer.nvidia.com/nim/) 的全部模型 |
| LiteLLM 中的提供商路由 | `nvidia_nim/` |
| 提供商文档 | [Nvidia NIM 文档 ↗](https://developer.nvidia.com/nim/) |
| 提供商的 API 端点 | https://integrate.api.nvidia.com/v1/（chat/embeddings）、https://ai.api.nvidia.com/v1/（rerank） |
| 支持的 OpenAI 端点 | `/chat/completions`, `/completions`, `/responses`, `/embeddings`, `/rerank` |

## API 密钥
```python
# env variable
os.environ['NVIDIA_NIM_API_KEY'] = ""
os.environ['NVIDIA_NIM_API_BASE'] = "" # [OPTIONAL] - default is https://integrate.api.nvidia.com/v1/
```

## 使用示例
```python
from litellm import completion
import os

os.environ['NVIDIA_NIM_API_KEY'] = ""
response = completion(
    model="nvidia_nim/meta/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    temperature=0.2,        # optional
    top_p=0.9,              # optional
    frequency_penalty=0.1,  # optional
    presence_penalty=0.1,   # optional
    max_tokens=10,          # optional
    stop=["\n\n"],          # optional
)
print(response)
```

## 使用示例：流式
```python
from litellm import completion
import os

os.environ['NVIDIA_NIM_API_KEY'] = ""
response = completion(
    model="nvidia_nim/meta/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    temperature=0.2,        # optional
    top_p=0.9,              # optional
    frequency_penalty=0.1,  # optional
    presence_penalty=0.1,   # optional
    max_tokens=10,          # optional
    stop=["\n\n"],          # optional
)

for chunk in response:
    print(chunk)
```


## 用法：嵌入（embedding）

```python
import litellm
import os

response = litellm.embedding(
    model="nvidia_nim/nvidia/nv-embedqa-e5-v5",               # add `nvidia_nim/` prefix to model so litellm knows to route to Nvidia NIM
    input=["good morning from litellm"],
    encoding_format = "float", 
    user_id = "user-1234",

    # Nvidia NIM Specific Parameters
    input_type = "passage", # Optional
    truncate = "NONE" # Optional
)
print(response)
```


## **用法：LiteLLM 代理服务器**

下面介绍如何通过 LiteLLM 代理服务器调用 Nvidia NIM 端点。

1. 修改 config.yaml

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: nvidia_nim/<your-model-name>  # add nvidia_nim/ prefix to route as Nvidia NIM provider
        api_key: api-key                 # api key to send your model
       # api_base: "" # [OPTIONAL] - default is https://integrate.api.nvidia.com/v1/
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



## 支持的模型：💥 支持全部 Nvidia NIM 模型！
我们支持全部 `nvidia_nim` 模型：发送对话补全（completion）请求时，只需把 `nvidia_nim/` 作为前缀即可。

| 模型名称 | 调用方式 |
|------------|---------------|
| nvidia/nemotron-4-340b-reward | `completion(model="nvidia_nim/nvidia/nemotron-4-340b-reward", messages)` |
| 01-ai/yi-large | `completion(model="nvidia_nim/01-ai/yi-large", messages)` |
| aisingapore/sea-lion-7b-instruct | `completion(model="nvidia_nim/aisingapore/sea-lion-7b-instruct", messages)` |
| databricks/dbrx-instruct | `completion(model="nvidia_nim/databricks/dbrx-instruct", messages)` |
| google/gemma-7b | `completion(model="nvidia_nim/google/gemma-7b", messages)` |
| google/gemma-2b | `completion(model="nvidia_nim/google/gemma-2b", messages)` |
| google/codegemma-1.1-7b | `completion(model="nvidia_nim/google/codegemma-1.1-7b", messages)` |
| google/codegemma-7b | `completion(model="nvidia_nim/google/codegemma-7b", messages)` |
| google/recurrentgemma-2b | `completion(model="nvidia_nim/google/recurrentgemma-2b", messages)` |
| ibm/granite-34b-code-instruct | `completion(model="nvidia_nim/ibm/granite-34b-code-instruct", messages)` |
| ibm/granite-8b-code-instruct | `completion(model="nvidia_nim/ibm/granite-8b-code-instruct", messages)` |
| mediatek/breeze-7b-instruct | `completion(model="nvidia_nim/mediatek/breeze-7b-instruct", messages)` |
| meta/codellama-70b | `completion(model="nvidia_nim/meta/codellama-70b", messages)` |
| meta/llama2-70b | `completion(model="nvidia_nim/meta/llama2-70b", messages)` |
| meta/llama3-8b | `completion(model="nvidia_nim/meta/llama3-8b", messages)` |
| meta/llama3-70b | `completion(model="nvidia_nim/meta/llama3-70b", messages)` |
| microsoft/phi-3-medium-4k-instruct | `completion(model="nvidia_nim/microsoft/phi-3-medium-4k-instruct", messages)` |
| microsoft/phi-3-mini-128k-instruct | `completion(model="nvidia_nim/microsoft/phi-3-mini-128k-instruct", messages)` |
| microsoft/phi-3-mini-4k-instruct | `completion(model="nvidia_nim/microsoft/phi-3-mini-4k-instruct", messages)` |
| microsoft/phi-3-small-128k-instruct | `completion(model="nvidia_nim/microsoft/phi-3-small-128k-instruct", messages)` |
| microsoft/phi-3-small-8k-instruct | `completion(model="nvidia_nim/microsoft/phi-3-small-8k-instruct", messages)` |
| mistralai/codestral-22b-instruct-v0.1 | `completion(model="nvidia_nim/mistralai/codestral-22b-instruct-v0.1", messages)` |
| mistralai/mistral-7b-instruct | `completion(model="nvidia_nim/mistralai/mistral-7b-instruct", messages)` |
| mistralai/mistral-7b-instruct-v0.3 | `completion(model="nvidia_nim/mistralai/mistral-7b-instruct-v0.3", messages)` |
| mistralai/mixtral-8x7b-instruct | `completion(model="nvidia_nim/mistralai/mixtral-8x7b-instruct", messages)` |
| mistralai/mixtral-8x22b-instruct | `completion(model="nvidia_nim/mistralai/mixtral-8x22b-instruct", messages)` |
| mistralai/mistral-large | `completion(model="nvidia_nim/mistralai/mistral-large", messages)` |
| nvidia/nemotron-4-340b-instruct | `completion(model="nvidia_nim/nvidia/nemotron-4-340b-instruct", messages)` |
| seallms/seallm-7b-v2.5 | `completion(model="nvidia_nim/seallms/seallm-7b-v2.5", messages)` |
| snowflake/arctic | `completion(model="nvidia_nim/snowflake/arctic", messages)` |
| upstage/solar-10.7b-instruct | `completion(model="nvidia_nim/upstage/solar-10.7b-instruct", messages)` |
