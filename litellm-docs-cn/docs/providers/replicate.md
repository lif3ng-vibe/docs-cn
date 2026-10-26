import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Replicate

LiteLLM 支持 Replicate 上的所有模型。


## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

### API 密钥
```python
import os 
os.environ["REPLICATE_API_KEY"] = ""
```

### 调用示例

```python
from litellm import completion
import os
## set ENV variables
os.environ["REPLICATE_API_KEY"] = "replicate key"

# replicate llama-3 call
response = completion(
    model="replicate/meta/meta-llama-3-8b-instruct", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 将模型添加到 config.yaml

  ```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: replicate/meta/meta-llama-3-8b-instruct
        api_key: os.environ/REPLICATE_API_KEY
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
      model="llama-3",
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
      "model": "llama-3",
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


### 预期发给 Replicate 的请求

以上面的示例为例，litellm 实际会向 Replicate 发出如下请求：

```bash

POST Request Sent from LiteLLM:
curl -X POST \
https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct \
-H 'Authorization: Token your-api-key' -H 'Content-Type: application/json' \
-d '{'version': 'meta/meta-llama-3-8b-instruct', 'input': {'prompt': '<|start_header_id|>system<|end_header_id|>\n\nBe a good human!<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nWhat do you know about earth?<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n'}}'
```

</TabItem>

</Tabs>

## 进阶用法：提示词格式化

LiteLLM 为所有 `meta-llama` 的 llama3 instruct 模型内置了提示词模板映射。[**查看代码**](https://github.com/BerriAI/litellm/blob/4f46b4c3975cd0f72b8c5acb2cb429d23580c18a/litellm/llms/prompt_templates/factory.py#L1360)

如需应用自定义提示词模板：

<Tabs>
<TabItem value="sdk" label="SDK">

```python 
import litellm

import os 
os.environ["REPLICATE_API_KEY"] = ""

# Create your own custom prompt template 
litellm.register_prompt_template(
	    model="togethercomputer/LLaMA-2-7B-32K",
        initial_prompt_value="You are a good assistant", # [OPTIONAL]
	    roles={
            "system": {
                "pre_message": "[INST] <<SYS>>\n", # [OPTIONAL]
                "post_message": "\n<</SYS>>\n [/INST]\n" # [OPTIONAL]
            },
            "user": { 
                "pre_message": "[INST] ", # [OPTIONAL]
                "post_message": " [/INST]" # [OPTIONAL]
            }, 
            "assistant": {
                "pre_message": "\n", # [OPTIONAL]
                "post_message": "\n" # [OPTIONAL]
            }
        },
        final_prompt_value="Now answer as best you can:" # [OPTIONAL]
)

def test_replicate_custom_model():
    model = "replicate/togethercomputer/LLaMA-2-7B-32K"
    response = completion(model=model, messages=messages)
    print(response['choices'][0]['message']['content'])
    return response

test_replicate_custom_model()
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
# Model-specific parameters
model_list:
  - model_name: mistral-7b # model alias
    litellm_params: # actual params for litellm.completion()
      model: "replicate/mistralai/Mistral-7B-Instruct-v0.1" 
      api_key: os.environ/REPLICATE_API_KEY
      initial_prompt_value: "\n"
      roles: {"system":{"pre_message":"<|im_start|>system\n", "post_message":"<|im_end|>"}, "assistant":{"pre_message":"<|im_start|>assistant\n","post_message":"<|im_end|>"}, "user":{"pre_message":"<|im_start|>user\n","post_message":"<|im_end|>"}}
      final_prompt_value: "\n"
      bos_token: "<s>"
      eos_token: "</s>"
      max_tokens: 4096
```

</TabItem>

</Tabs>

## 进阶用法：调用 Replicate 部署
调用[已部署的 Replicate LLM](https://replicate.com/deployments)
在模型名前加上 `replicate/deployments/` 前缀，litellm 就会去调用 `deployments` 端点。下面的示例会调用 Replicate 上的 `ishaan-jaff/ishaan-mistral` 部署

```python
response = completion(
    model="replicate/deployments/ishaan-jaff/ishaan-mistral", 
    messages= [{ "content": "Hello, how are you?","role": "user"}]
)
```

:::warning[Replicate 冷启动]

受 Replicate 冷启动（cold boots）影响，响应可能需要 3-5 分钟。如果要排查问题，可以在发请求时加上 `litellm.set_verbose=True`。[更多关于 Replicate 冷启动的说明](https://replicate.com/docs/how-does-replicate-work#cold-boots)

:::

## Replicate 模型
LiteLLM 支持 Replicate 上的所有 LLM

调用 Replicate 模型时，务必给 `model` 参数加上 `replicate/` 前缀，LiteLLM 就是靠这个前缀来识别提供商的。

以下是用 LiteLLM 调用 Replicate LLM 的几个示例

模型名                  | 函数调用                                                  | 所需环境变量                |
-----------------------------|----------------------------------------------------------------|--------------------------------------|
 replicate/llama-2-70b-chat | `completion(model='replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf', messages)` | `os.environ['REPLICATE_API_KEY']`    |
 a16z-infra/llama-2-13b-chat| `completion(model='replicate/a16z-infra/llama-2-13b-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52', messages)`| `os.environ['REPLICATE_API_KEY']`    |
 replicate/vicuna-13b  | `completion(model='replicate/vicuna-13b:6282abe6a492de4145d7bb601023762212f9ddbbe78278bd6771c8b3b2f2a13b', messages)` | `os.environ['REPLICATE_API_KEY']` |
 daanelson/flan-t5-large    | `completion(model='replicate/daanelson/flan-t5-large:ce962b3f6792a57074a601d3979db5839697add2e4e02696b3ced4c022d4767f', messages)`    | `os.environ['REPLICATE_API_KEY']`    |
 custom-llm    | `completion(model='replicate/custom-llm-version-id', messages)`    | `os.environ['REPLICATE_API_KEY']`    |
  replicate deployment    | `completion(model='replicate/deployments/ishaan-jaff/ishaan-mistral', messages)`    | `os.environ['REPLICATE_API_KEY']`    |


## 传递额外参数：max_tokens、temperature
litellm.completion 支持的全部参数见[这里](https://docs.litellm.ai/docs/completion/input)

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["REPLICATE_API_KEY"] = "replicate key"

# replicate llama-2 call
response = completion(
    model="replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    max_tokens=20,
    temperature=0.5
)
```

**代理**

```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: replicate/meta/meta-llama-3-8b-instruct
        api_key: os.environ/REPLICATE_API_KEY
        max_tokens: 20
        temperature: 0.5
```

## 传递 Replicate 专属参数
[`litellm.completion()` 不支持、但 Replicate 支持的参数](https://docs.litellm.ai/docs/completion/input)，可以把它们直接传给 `litellm.completion`

例如 `seed`、`min_tokens` 就是 Replicate 专属参数

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["REPLICATE_API_KEY"] = "replicate key"

# replicate llama-2 call
response = completion(
    model="replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    seed=-1,
    min_tokens=2,
    top_k=20,
)
```

**代理**

```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: replicate/meta/meta-llama-3-8b-instruct
        api_key: os.environ/REPLICATE_API_KEY
        min_tokens: 2
        top_k: 20
```
