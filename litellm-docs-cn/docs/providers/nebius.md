import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nebius AI Studio
https://docs.nebius.com/studio/inference/quickstart

:::tip

**Litellm 支持来自 Nebius AI Studio 的所有模型。要使用某个模型，请在 litellm 请求中以 `model=nebius/<any-model-on-nebius-ai-studio>` 作为模型名前缀。支持的全部模型列表见 https://studio.nebius.ai/**

:::

## API 密钥
```python
import os
# env variable
os.environ['NEBIUS_API_KEY']
```

## 示例用法：文本生成
```python
from litellm import completion
import os

os.environ['NEBIUS_API_KEY'] = "insert-your-nebius-ai-studio-api-key"
response = completion(
    model="nebius/Qwen/Qwen3-235B-A22B",
    messages=[
        {
            "role": "user",
            "content": "What character was Wall-e in love with?",
        }
    ],
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    stop=["\n\n"],
    temperature=0.6,  # either set temperature or `top_p`
    top_p=0.01,  # to get as deterministic results as possible
    tool_choice="auto",
    tools=[],
    user="user",
)
print(response)
```

## 示例用法：流式
```python
from litellm import completion
import os

os.environ['NEBIUS_API_KEY'] = ""
response = completion(
    model="nebius/Qwen/Qwen3-235B-A22B",
    messages=[
        {
            "role": "user",
            "content": "What character was Wall-e in love with?",
        }
    ],
    stream=True,
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    stop=["\n\n"],
    temperature=0.6,  # either set temperature or `top_p`
    top_p=0.01,  # to get as deterministic results as possible
    tool_choice="auto",
    tools=[],
    user="user",
)

for chunk in response:
    print(chunk)
```

## 示例用法：嵌入
```python
from litellm import embedding
import os

os.environ['NEBIUS_API_KEY'] = ""
response = embedding(
    model="nebius/BAAI/bge-en-icl",
    input=["What character was Wall-e in love with?"],
)
print(response)
```


## 通过 LiteLLM 代理服务器使用

下面演示如何通过 LiteLLM 代理服务器（Proxy Server）调用 Nebius AI Studio 的模型

1. 修改 config.yaml

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: nebius/<your-model-name>  # add nebius/ prefix to use Nebius AI Studio as provider
        api_key: api-key                 # api key to send your model
  ```
2. 启动代理服务器
  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. 向 LiteLLM 代理服务器发送请求

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="litellm-proxy-key",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="my-model",
      messages = [
          {
              "role": "user",
              "content": "What character was Wall-e in love with?"
          }
      ],
  )

  print(response)
  ```
  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: litellm-proxy-key' \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "my-model",
      "messages": [
          {
          "role": "user",
          "content": "What character was Wall-e in love with?"
          }
      ],
  }'
  ```
  </TabItem>

  </Tabs>

## 支持的参数

Nebius 提供商（provider）支持以下参数：

### 对话补全参数

| 参数 | 类型 | 说明 |
| --------- | ---- | ----------- |
| frequency_penalty | number | 根据 token 在文本中出现的频率对其进行惩罚 |
| function_call | string/object | 控制模型如何调用函数 |
| functions | array | 模型可为其生成 JSON 输入的函数列表 |
| logit_bias | map | 调整指定 token 出现的可能性 |
| max_tokens | integer | 可生成的最大 token 数 |
| n | integer | 生成的补全数量 |
| presence_penalty | number | 根据 token 是否已出现在文本中对其进行惩罚 |
| response_format | object | 响应格式，例如 `{"type": "json"}` |
| seed | integer | 用于确定性结果的采样种子 |
| stop | string/array | API 停止生成 token 的终止序列 |
| stream | boolean | 是否以流式返回响应 |
| temperature | number | 控制随机性（0-2） |
| top_p | number | 控制核采样（nucleus sampling） |
| tool_choice | string/object | 控制调用哪个函数（如有） |
| tools | array | 模型可以使用的工具列表 |
| user | string | 用户标识符 |

### 嵌入参数

| 参数 | 类型 | 说明 |
| --------- | ---- | ----------- |
| input | string/array | 要嵌入的文本 |
| user | string | 用户标识符 |

## 错误处理

该集成使用 LiteLLM 标准错误处理。常见错误包括：

- **认证错误**（Authentication Error）：检查你的 API 密钥
- **模型未找到**（Model Not Found）：请确认使用的模型名称有效
- **速率限制错误**（Rate Limit Error）：你已超出速率限制
- **超时错误**（Timeout Error）：请求耗时过长，未能完成
