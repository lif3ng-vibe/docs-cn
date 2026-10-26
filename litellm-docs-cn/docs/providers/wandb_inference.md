import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Weights & Biases Inference
https://weave-docs.wandb.ai/quickstart-inference

:::tip

LiteLLM 支持 W&B Inference 服务提供的全部模型。要使用某个模型，请在请求中为模型名加上 `model=wandb/<any-model-on-wandb-inference-dashboard>` 前缀。支持的模型完整列表见 https://docs.wandb.ai/guides/inference/models/

:::

## API 密钥

可以在 https://wandb.ai/authorize 获取 W&B Inference 的 API 密钥。

```python
import os
# env variable
os.environ['WANDB_API_KEY']
```

## 示例用法：文本生成
```python
from litellm import completion
import os

os.environ['WANDB_API_KEY'] = "insert-your-wandb-api-key"
response = completion(
    model="wandb/Qwen/Qwen3-235B-A22B-Instruct-2507",
    messages=[
        {
            "role": "user",
            "content": "What character was Wall-e in love with?",
        }
    ],
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    temperature=0.6,  # either set temperature or `top_p`
    top_p=0.01,  # to get as deterministic results as possible
)
print(response)
```

## 示例用法：流式
```python
from litellm import completion
import os

os.environ['WANDB_API_KEY'] = ""
response = completion(
    model="wandb/Qwen/Qwen3-235B-A22B-Instruct-2507",
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
    temperature=0.6,  # either set temperature or `top_p`
    top_p=0.01,  # to get as deterministic results as possible
)

for chunk in response:
    print(chunk)
```

:::tip

上述示例可能因模型已下线而无法运行。可用模型的完整列表请查看 https://docs.wandb.ai/guides/inference/models/。

:::

## 通过 LiteLLM 代理服务器使用

下面演示如何通过 LiteLLM 代理服务器（Proxy Server）调用 W&B Inference 模型。

1. 修改 config.yaml

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: wandb/<your-model-name>  # add wandb/ prefix to use W&B Inference as provider
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

W&B Inference 提供商（provider）支持以下参数：

### 对话补全参数

| 参数 | 类型 | 说明 |
| --------- | ---- | ----------- |
| frequency_penalty | number | 根据 token 在文本中出现的频率对新 token 进行惩罚 |
| function_call | string/object | 控制模型调用函数的方式 |
| functions | array | 模型可为其生成 JSON 输入的函数列表 |
| logit_bias | map | 调整指定 token 出现的可能性 |
| max_tokens | integer | 生成的最大 token 数 |
| n | integer | 生成的补全数量 |
| presence_penalty | number | 根据 token 是否已出现在文本中对其进行惩罚 |
| response_format | object | 响应的格式，例如 `{"type": "json"}` |
| seed | integer | 用于确定性结果的采样种子 |
| stop | string/array | API 停止生成 token 的停止序列 |
| stream | boolean | 是否以流式返回响应 |
| temperature | number | 控制随机性（0-2） |
| top_p | number | 控制核采样（nucleus sampling） |


## 错误处理

该集成使用 LiteLLM 的标准错误处理机制。此外，下面列出了调用 W&B Inference API 时常见的错误：

| 错误码 | 报错信息 | 原因 | 解决办法 |
| ---------- | ------- | ----- | -------- |
| 401 | Authentication failed | 认证凭据有误，或 W&B 项目的实体名和/或项目名不正确。 | 请确认 API 密钥正确，且 W&B 项目名与实体名填写无误。 |
| 403 | Country, region, or territory not supported | 从不支持的地区访问 API。 | 请参阅[地域限制](https://docs.wandb.ai/guides/inference/usage-limits/#geographic-restrictions)。 |
| 429 | Concurrency limit reached for requests | 并发请求过多。 | 请减少并发请求数或提高限额。更多信息参见[用量信息与限额](https://docs.wandb.ai/guides/inference/usage-limits/)。 |
| 429 | You exceeded your current quota, please check your plan and billing details | 额度已用尽，或已达每月消费上限。 | 请获取更多额度或提高限额。更多信息参见[用量信息与限额](https://docs.wandb.ai/guides/inference/usage-limits/)。 |
| 429 | W&B Inference isn't available for personal accounts. | 使用的是个人账户。 | 请按照[下方说明](#错误-429不支持个人实体)采取临时解决方法。 |
| 500 | The server had an error while processing your request | 服务器内部错误。 | 请稍候重试；若问题持续存在，请联系支持团队。 |
| 503 | The engine is currently overloaded, please try again later | 服务器流量过高。 | 请稍等片刻后重试请求。 |


### 错误 429：不支持个人实体

用户当前使用的是个人账户，而个人账户无法访问 W&B Inference。若还没有此类账户，可以创建一个 Team，以获得非个人账户。

创建完成后，按如下方式在请求中加上 `openai-project` 请求头：

```python
response = completion(
    model="...",
    extra_headers={"openai-project": "team_name/project_name"},
    # ...
)
```

更多信息参见[个人实体不受支持](https://docs.wandb.ai/guides/inference/usage-limits/#personal-entities-unsupported)。

在 LiteLLM 中使用自定义请求头的更多方式，参见 https://docs.litellm.ai/docs/proxy/request_headers。
