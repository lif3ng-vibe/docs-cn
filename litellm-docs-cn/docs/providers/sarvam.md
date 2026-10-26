# Sarvam.ai

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM 支持 [Sarvam ai](https://docs.sarvam.ai/api-reference-docs/chat/chat-completions) 的所有文本模型

## 用法

```python
import os
from litellm import completion

# Set your Sarvam API key
os.environ["SARVAM_API_KEY"] = ""

messages = [{"role": "user", "content": "Hello"}]

response = completion(
    model="sarvam/sarvam-m",
    messages=messages,
)
print(response)
```

## 通过 LiteLLM 代理服务器使用

下面介绍如何通过 LiteLLM 代理服务器调用 Sarvam.ai 模型

1. **修改 `config.yaml`**：

    ```yaml
    model_list:
      - model_name: my-model
        litellm_params:
          model: sarvam/<your-model-name>  # add sarvam/ prefix to route as Sarvam provider
          api_key: api-key                 # api key to send your model
    ```

2. **启动代理**：

    ```bash
    $ litellm --config /path/to/config.yaml
    ```

3. **向 LiteLLM 代理服务器发送请求**：

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
        messages=[
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
        ]
    }'
    ```
    </TabItem>

    </Tabs>
