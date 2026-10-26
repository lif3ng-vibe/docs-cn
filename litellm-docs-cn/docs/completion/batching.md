import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 批处理 Completion()
LiteLLM 支持以下用法：
* 向 1 个模型发送多个补全调用
* 向多个模型发送 1 个补全调用：返回最快响应
* 向多个模型发送 1 个补全调用：返回全部响应

:::info

想在 LiteLLM 代理（Proxy）上做批处理补全（batch completion）？请前往：https://docs.litellm.ai/docs/proxy/user_keys#beta-batch-completions---pass-model-as-list

:::

## 将多个补全调用发送给 1 个模型

在 batch_completion 方法中，你传入一个 `messages` 列表，其中每个子列表都会被交给 `litellm.completion()` 处理，从而在单次 API 调用中高效处理多条提示词。

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_batch_completion.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="在 Colab 中打开"/>
</a>

### 示例代码
```python
import litellm
import os
from litellm import batch_completion

os.environ['ANTHROPIC_API_KEY'] = ""


responses = batch_completion(
    model="{{anthropic}}",
    messages = [
        [
            {
                "role": "user",
                "content": "good morning? "
            }
        ],
        [
            {
                "role": "user",
                "content": "what's the time? "
            }
        ]
    ]
)
```

## 将 1 个补全调用发送给多个模型：返回最快响应
该功能会向指定的 `models` 发起并行调用，并返回最先得到的响应

用它来降低延迟

<Tabs>
<TabItem value="sdk" label="SDK">

### 示例代码
```python
import litellm
import os
from litellm import batch_completion_models

os.environ['ANTHROPIC_API_KEY'] = ""
os.environ['OPENAI_API_KEY'] = ""
os.environ['COHERE_API_KEY'] = ""

response = batch_completion_models(
    models=["{{openai_small}}", "{{anthropic}}", "command-nightly"], 
    messages=[{"role": "user", "content": "Hey, how's it going"}]
)
print(result)
```



</TabItem>
<TabItem value="proxy" label="PROXY">

[如何设置代理配置](#示例配置)

只需传入以逗号分隔的模型名称字符串，再加上 `fastest_response=True` 标志即可。

<Tabs>
<TabItem value="curl" label="curl">

```bash

curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \ 
-D '{
    "model": "{{openai_large}}, groq-llama", # 👈 Comma-separated models
    "messages": [
      {
        "role": "user",
        "content": "What's the weather like in Boston today?"
      }
    ],
    "stream": true,
    "fastest_response": true # 👈 FLAG
}

'
```

</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_large}}, groq-llama", # 👈 Comma-separated models
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={"fastest_response": true} # 👈 FLAG
)

print(response)
```

</TabItem>
</Tabs>

---

### 示例配置

```yaml 
model_list: 
- model_name: groq-llama
  litellm_params:
    model: groq/llama3-8b-8192
    api_key: os.environ/GROQ_API_KEY
- model_name: {{openai_large}}
  litellm_params:
    model: {{openai_large}}
    api_key: os.environ/OPENAI_API_KEY
```

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

</TabItem>
</Tabs>

### 输出
以 OpenAI 格式返回最先得到的响应，并取消其余的 LLM API 调用。 
```json
{
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": " I'm doing well, thanks for asking! I'm an AI assistant created by Anthropic to be helpful, harmless, and honest.",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "id": "chatcmpl-23273eed-e351-41be-a492-bafcf5cf3274",
  "created": 1695154628.2076092,
  "model": "command-nightly",
  "usage": {
    "prompt_tokens": 6,
    "completion_tokens": 14,
    "total_tokens": 20
  }
}
```


## 将 1 个补全调用发送给多个模型：返回全部响应
该功能会向指定的模型发起并行调用，并返回全部响应

用它来并发处理请求，同时获取多个模型的响应。

### 示例代码
```python
import litellm
import os
from litellm import batch_completion_models_all_responses

os.environ['ANTHROPIC_API_KEY'] = ""
os.environ['OPENAI_API_KEY'] = ""
os.environ['COHERE_API_KEY'] = ""

responses = batch_completion_models_all_responses(
    models=["{{openai_small}}", "{{anthropic}}", "command-nightly"], 
    messages=[{"role": "user", "content": "Hey, how's it going"}]
)
print(responses)

```

### 输出

```text
[<ModelResponse chat.completion id=chatcmpl-e673ec8e-4e8f-4c9e-bf26-bf9fa7ee52b9 at 0x103a62160> JSON: {
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop_sequence",
      "index": 0,
      "message": {
        "content": " It's going well, thank you for asking! How about you?",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "id": "chatcmpl-e673ec8e-4e8f-4c9e-bf26-bf9fa7ee52b9",
  "created": 1695222060.917964,
  "model": "{{anthropic}}",
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 9,
    "total_tokens": 23
  }
}, <ModelResponse chat.completion id=chatcmpl-ab6c5bd3-b5d9-4711-9697-e28d9fb8a53c at 0x103a62b60> JSON: {
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": " It's going well, thank you for asking! How about you?",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "id": "chatcmpl-ab6c5bd3-b5d9-4711-9697-e28d9fb8a53c",
  "created": 1695222061.0445492,
  "model": "command-nightly",
  "usage": {
    "prompt_tokens": 6,
    "completion_tokens": 14,
    "total_tokens": 20
  }
}, <OpenAIObject chat.completion id=chatcmpl-80szFnKHzCxObW0RqCMw1hWW1Icrq at 0x102dd6430> JSON: {
  "id": "chatcmpl-80szFnKHzCxObW0RqCMw1hWW1Icrq",
  "object": "chat.completion",
  "created": 1695222061,
  "model": "{{openai_small}}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm an AI language model, so I don't have feelings, but I'm here to assist you with any questions or tasks you might have. How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 39,
    "total_tokens": 52
  }
}]

```
