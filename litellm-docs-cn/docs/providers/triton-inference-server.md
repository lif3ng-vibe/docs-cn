import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Triton Inference Server

LiteLLM 支持 Triton Inference Server 上的嵌入（embedding）模型

| 属性 | 详情 |
|-------|-------|
| 描述 | NVIDIA Triton Inference Server |
| LiteLLM 中的提供商路由 | `triton/` |
| 支持的操作 | `/chat/completion`, `/completion`, `/embedding` |
| 支持的 Triton 端点 | `/infer`, `/generate`, `/embeddings` |
| 提供商文档 | [Triton Inference Server ↗](https://developer.nvidia.com/triton-inference-server) |

## Triton `/generate` - 对话补全


<Tabs>
<TabItem value="sdk" label="SDK">

使用 `triton/` 前缀将请求路由到 Triton 服务器
```python
from litellm import completion
response = completion(
    model="triton/llama-3-8b-instruct",
    messages=[{"role": "user", "content": "who are u?"}],
    max_tokens=10,
    api_base="http://localhost:8000/generate",
)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 在 config.yaml 中添加模型

  ```yaml
  model_list:
    - model_name: my-triton-model
      litellm_params:
        model: triton/<your-triton-model>"
        api_base: https://your-triton-api-base/triton/generate
  ```


2. 启动代理

  ```bash
  $ litellm --config /path/to/config.yaml --detailed_debug
  ```

3. 向 LiteLLM 代理服务器发送请求

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

    ```python
    import openai
    from openai import OpenAI

    # set base_url to your proxy server
    # set api_key to send to proxy server
    client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

    response = client.chat.completions.create(
        model="my-triton-model",
        messages=[{"role": "user", "content": "who are u?"}],
        max_tokens=10,
    )

    print(response)

    ```

  </TabItem>

  <TabItem value="curl" label="curl">

  `--header` 为可选项，只有当你的 LiteLLM 代理使用虚拟密钥（virtual key）时才需要。

    ```shell
    curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data ' {
    "model": "my-triton-model",
    "messages": [{"role": "user", "content": "who are u?"}]
    }'

    ```
  </TabItem>

  </Tabs>

</TabItem>
</Tabs>

## Triton `/infer` - 对话补全

<Tabs>
<TabItem value="sdk" label="SDK">


使用 `triton/` 前缀将请求路由到 Triton 服务器
```python
from litellm import completion


response = completion(
    model="triton/llama-3-8b-instruct",
    messages=[{"role": "user", "content": "who are u?"}],
    max_tokens=10,
    api_base="http://localhost:8000/infer",
)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 在 config.yaml 中添加模型

  ```yaml
  model_list:
    - model_name: my-triton-model
      litellm_params:
        model: triton/<your-triton-model>"
        api_base: https://your-triton-api-base/triton/infer
  ```


2. 启动代理

  ```bash
  $ litellm --config /path/to/config.yaml --detailed_debug
  ```

3. 向 LiteLLM 代理服务器发送请求

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

    ```python
    import openai
    from openai import OpenAI

    # set base_url to your proxy server
    # set api_key to send to proxy server
    client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

    response = client.chat.completions.create(
        model="my-triton-model",
        messages=[{"role": "user", "content": "who are u?"}],
        max_tokens=10,
    )

    print(response)

    ```

  </TabItem>

  <TabItem value="curl" label="curl">

  `--header` 为可选项，只有当你的 LiteLLM 代理使用虚拟密钥（virtual key）时才需要。

    ```shell
    curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data ' {
    "model": "my-triton-model",
    "messages": [{"role": "user", "content": "who are u?"}]
    }'

    ```
  </TabItem>

  </Tabs>

</TabItem>
</Tabs>



## Triton `/embeddings` - 嵌入

<Tabs>
<TabItem value="sdk" label="SDK">

使用 `triton/` 前缀将请求路由到 Triton 服务器
```python
import litellm
import os

response = await litellm.aembedding(
    model="triton/<your-triton-model>",
    api_base="https://your-triton-api-base/triton/embeddings", # /embeddings endpoint you want litellm to call on your server
    input=["good morning from litellm"],
)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 在 config.yaml 中添加模型

  ```yaml
  model_list:
    - model_name: my-triton-model
      litellm_params:
        model: triton/<your-triton-model>"
        api_base: https://your-triton-api-base/triton/embeddings
  ```


2. 启动代理

  ```bash
  $ litellm --config /path/to/config.yaml --detailed_debug
  ```

3. 向 LiteLLM 代理服务器发送请求

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
        model="my-triton-model"
    )

    print(response)

    ```

  </TabItem>

  <TabItem value="curl" label="curl">

  `--header` 为可选项，只有当你的 LiteLLM 代理使用虚拟密钥（virtual key）时才需要。

    ```shell
    curl --location 'http://0.0.0.0:4000/embeddings' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data ' {
    "model": "my-triton-model",
    "input": ["write a litellm poem"]
    }'

    ```
  </TabItem>

  </Tabs>


</TabItem>

</Tabs>
