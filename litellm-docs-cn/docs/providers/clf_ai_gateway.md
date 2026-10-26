import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CLF AI Gateway
https://clfaigateway.dev/docs

CLF AI Gateway 是一个兼容 OpenAI 的网关，用于提供开放权重模型。它是独立服务，与 Cloudflare 没有隶属关系；Cloudflare 自家的推理产品请参见 [Cloudflare Workers AI](./cloudflare_workers)

:::tip

设置 `model=clf_ai_gateway/<model>` 即可让请求经由 CLF AI Gateway 路由。当前模型列表见 https://clfaigateway.dev/models，也可通过 `GET /v1/models` 获取。

:::

## API 密钥

```python
import os

os.environ["CLF_AI_GATEWAY_API_KEY"] = "sk-gw-..."
os.environ["CLF_AI_GATEWAY_API_BASE"] = "https://api.clfaigateway.dev/v1"  # optional, this is the default
```

只有当 LiteLLM 需要指向其他端点时才需要设置 `CLF_AI_GATEWAY_API_BASE`。不设置时默认使用 `https://api.clfaigateway.dev/v1`。

## 使用示例

```python
from litellm import completion
import os

os.environ["CLF_AI_GATEWAY_API_KEY"] = "sk-gw-..."

response = completion(
    model="clf_ai_gateway/glm-5.3",
    messages=[{"role": "user", "content": "What character was Wall-e in love with?"}],
)
print(response)
```

## 使用示例 - 流式

```python
from litellm import completion
import os

os.environ["CLF_AI_GATEWAY_API_KEY"] = "sk-gw-..."

response = completion(
    model="clf_ai_gateway/glm-5.3",
    messages=[{"role": "user", "content": "What character was Wall-e in love with?"}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

## 推理

网关上的每个模型都是推理模型，因此全都接受 `reasoning_effort` 参数。各模型支持的推理档位不同，LiteLLM 会从模型映射（model map）中读取，而不是假设所有模型共用同一套档位。

```python
from litellm import completion
import os

os.environ["CLF_AI_GATEWAY_API_KEY"] = "sk-gw-..."

response = completion(
    model="clf_ai_gateway/glm-5.3",
    messages=[{"role": "user", "content": "How many r's are in strawberry?"}],
    reasoning_effort="high",
)
print(response)
```

推理 Token 计入 `completion_tokens`，按输出价格计费，而不是单独计费。

## 在 LiteLLM 代理服务器中使用

1. 在 config.yaml 中添加模型

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: clf_ai_gateway/glm-5.3
        api_key: os.environ/CLF_AI_GATEWAY_API_KEY
  ```

2. 启动代理

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. 发送请求

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai

  client = openai.OpenAI(
      api_key="litellm-proxy-key",
      base_url="http://0.0.0.0:4000",
  )

  response = client.chat.completions.create(
      model="my-model",
      messages=[{"role": "user", "content": "What character was Wall-e in love with?"}],
  )

  print(response)
  ```
  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer litellm-proxy-key' \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "my-model",
      "messages": [
          {
              "role": "user",
              "content": "What character was Wall-e in love with?"
          }
      ]
  }'
  ```
  </TabItem>

  </Tabs>

## 支持的模型

以下模型全部支持工具调用（tool calling）、JSON 模式和推理。

| 模型 | 上下文窗口 | 视觉 |
| ----- | -------------- | ------ |
| clf_ai_gateway/glm-5.3 | 1,048,576 | no |
| clf_ai_gateway/glm-5.3-flash | 1,048,576 | yes |
| clf_ai_gateway/glm-5.2 | 262,144 | no |
| clf_ai_gateway/glm-4.7-flash | 131,072 | no |
| clf_ai_gateway/kimi-k2.7-code | 262,144 | yes |
| clf_ai_gateway/kimi-k2.6 | 262,144 | yes |
| clf_ai_gateway/deepseek-v4-pro | 1,048,576 | no |
| clf_ai_gateway/deepseek-v4-flash | 1,048,576 | no |
| clf_ai_gateway/qwen3.8-27b | 262,144 | yes |

## 支持的参数

| 参数 | 类型 | 说明 |
| --------- | ---- | ----------- |
| frequency_penalty | number | 根据 Token 在文本中出现的频率对新 Token 进行惩罚 |
| max_completion_tokens | integer | 可生成的最大 Token 数 |
| max_tokens | integer | 可生成的最大 Token 数 |
| n | integer | 要生成的补全数量 |
| parallel_tool_calls | boolean | 模型是否可以同时调用多个工具 |
| presence_penalty | number | 根据 Token 是否已在文本中出现对其进行惩罚 |
| reasoning_effort | string | 模型在回答前进行推理的程度 |
| response_format | object | 响应的格式，例如 `{"type": "json_object"}` |
| seed | integer | 用于确定性结果的采样种子 |
| stop | string/array | API 停止生成 Token 的停止序列 |
| stream | boolean | 是否以流式返回响应 |
| stream_options | object | 流式选项，例如 `{"include_usage": true}` |
| temperature | number | 控制随机性 |
| tool_choice | string/object | 控制模型调用哪个工具（如果有的话） |
| tools | array | 模型可以使用的工具列表 |
| top_p | number | 控制核采样（nucleus sampling） |
| user | string | 用户标识符 |

## 提示词缓存

网关会自动缓存识别出的提示词前缀。命中缓存的输入 Token 会通过 `prompt_tokens_details.cached_tokens` 返回，并按该模型的缓存输入价格计费；LiteLLM 进行成本追踪时会从模型映射中读取这一价格。
