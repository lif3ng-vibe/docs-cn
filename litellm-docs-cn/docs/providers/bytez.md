import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bytez

LiteLLM 支持 [Bytez](https://www.bytez.com) 上的全部对话模型！

这也意味着多模态模型同样可用 🔥

支持的任务类型：`chat`、`image-text-to-text`、`audio-text-to-text`、`video-text-to-text`

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

### API 密钥

```py
import os
os.environ["BYTEZ_API_KEY"] = "YOUR_BYTEZ_KEY_GOES_HERE"
```

### 调用示例

```py
from litellm import completion
import os
## set ENV variables
os.environ["BYTEZ_API_KEY"] = "YOUR_BYTEZ_KEY_GOES_HERE"

response = completion(
    model="bytez/google/gemma-3-4b-it",
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 在 config.yaml 中添加模型

```yaml
model_list:
  - model_name: gemma-3
    litellm_params:
      model: bytez/google/gemma-3-4b-it
      api_key: os.environ/BYTEZ_API_KEY
```

2. 启动代理

```bash
$ BYTEZ_API_KEY=YOUR_BYTEZ_API_KEY_HERE litellm --config /path/to/config.yaml --debug
```

3. 向 LiteLLM 代理服务器发送请求

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

```py
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",             # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000" # litellm-proxy-base url
)

response = client.chat.completions.create(
    model="gemma-3",
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
    "model": "gemma-3",
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

</TabItem>

</Tabs>

## 提示词模板自动处理

只要向 API 传入 messages 列表，所有提示词格式化都会由它自动完成！

如果想使用自定义格式，欢迎通过 [help@bytez.com](mailto:help@bytez.com) 或 [Discord](https://discord.com/invite/Z723PfCFWf) 告诉我们，我们会尽力提供支持！

## 传递额外参数：max_tokens、temperature

litellm.completion 支持的全部参数请见[这里](https://docs.litellm.ai/docs/completion/input)

```py
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["BYTEZ_API_KEY"] = "YOUR_BYTEZ_KEY_HERE"

# bytez gemma-3 call
response = completion(
    model="bytez/google/gemma-3-4b-it",
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    max_tokens=20,
    temperature=0.5
)
```

**代理**

```yaml
model_list:
  - model_name: gemma-3
    litellm_params:
      model: bytez/google/gemma-3-4b-it
      api_key: os.environ/BYTEZ_API_KEY
      max_tokens: 20
      temperature: 0.5
```

## 传递 Bytez 专属参数

凡是 Hugging Face 支持的 kwarg，我们同样支持！（前提是模型本身支持该参数。）

以 `repetition_penalty` 为例

```py
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["BYTEZ_API_KEY"] = "YOUR_BYTEZ_KEY_HERE"

# bytez llama3 call with additional params
response = completion(
    model="bytez/google/gemma-3-4b-it",
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    repetition_penalty=1.2,
)
```

**代理**

```yaml
model_list:
  - model_name: gemma-3
    litellm_params:
      model: bytez/google/gemma-3-4b-it
      api_key: os.environ/BYTEZ_API_KEY
      repetition_penalty: 1.2
```
