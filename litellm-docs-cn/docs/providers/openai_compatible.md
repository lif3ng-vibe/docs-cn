import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI 兼容端点

:::info

将提供商（provider）设为 `openai` 后，请求会经由上游的 [OpenAI 官方 Python API 库](https://github.com/openai/openai-python/blob/main/README.md) 路由到 OpenAI 兼容端点。

该库对所有请求都**强制要求**提供 API 密钥（API key），可以通过 `api_key` 参数传入，也可以使用 `OPENAI_API_KEY` 环境变量。

如果不想在每次请求中都填一个假 API 密钥，可以直接选用与你的 OpenAI 兼容端点相匹配的提供商，例如 [`hosted_vllm`](/docs/providers/vllm) 或 [`llamafile`](/docs/providers/llamafile)。

:::

要调用 openai 代理后面托管的模型，需要做两处改动：

1. 调用 `/chat/completions` 时：在模型名前面加上 `openai/` 前缀，这样 litellm 就知道你要调用的是 openai 的 `/chat/completions` 端点。

1. 调用 `/completions` 时：在模型名前面加上 `text-completion-openai/` 前缀，这样 litellm 就知道你要调用的是 openai 的 `/completions` 端点（通过 `/v1/completions` 路由调用 `openai/` 端点时无需此步）。

1. **不要**在 base url 后追加任何额外路径，例如 `/v1/embedding`。LiteLLM 会用 openai 客户端发起这些调用，相关端点路径会自动补上。


## 用法 - 补全（completion）
```python
import litellm
import os

response = litellm.completion(
    model="openai/mistral",               # add `openai/` prefix to model so litellm knows to route to OpenAI
    api_key="sk-<your-litellm-api-key>",                  # api key to your openai compatible endpoint
    api_base="http://0.0.0.0:4000",     # set API Base of your Custom OpenAI Endpoint
    messages=[
                {
                    "role": "user",
                    "content": "Hey, how's it going?",
                }
    ],
)
print(response)
```

## 用法 - 嵌入（embedding）

```python
import litellm
import os

response = litellm.embedding(
    model="openai/GPT-J",               # add `openai/` prefix to model so litellm knows to route to OpenAI
    api_key="sk-<your-litellm-api-key>",                  # api key to your openai compatible endpoint
    api_base="http://0.0.0.0:4000",     # set API Base of your Custom OpenAI Endpoint
    input=["good morning from litellm"]
)
print(response)
```



## 通过 LiteLLM 代理服务器使用

下面演示如何通过 LiteLLM 代理服务器调用 OpenAI 兼容端点。

1. 修改 config.yaml

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: openai/<your-model-name>  # add openai/ prefix to route as OpenAI provider
        api_base: <model-api-base>       # add api base for OpenAI compatible provider
        api_key: api-key                 # api key to send your model
  ```

  :::info

  如果测试时看到 `Not Found Error`，请确认 `api_base` 以 `/v1` 结尾。

  示例：`http://vllm-endpoint.xyz/v1`

  :::

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


### 进阶 - 禁用系统消息

部分 VLLM 模型（例如 gemma）不支持系统消息（system message）。要把这类请求中的系统消息改写为 "user" 消息，可以使用 `supports_system_message` 标志。

```yaml
model_list:
- model_name: my-custom-model
  litellm_params:
      model: openai/google/gemma
      api_base: http://my-custom-base
      api_key: "" 
      supports_system_message: False # 👈 KEY CHANGE
```
