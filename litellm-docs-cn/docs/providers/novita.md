import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Novita AI

| 属性 | 说明 |
|-------|-------|
| 描述 | Novita AI 是一个 AI 云平台，开发者通过简单的 API 即可轻松部署 AI 模型，背后有价格实惠、稳定可靠的 GPU 云基础设施作为支撑。LiteLLM 支持 [Novita AI](https://novita.ai/models/llm?utm_source=github_litellm&utm_medium=github_readme&utm_campaign=github_link) 的全部模型 |
| LiteLLM 中的提供商路由 | `novita/` |
| 提供商文档 | [Novita AI 文档 ↗](https://novita.ai/docs/guides/introduction) |
| 提供商 API 端点 | https://api.novita.ai/v3/openai |
| 支持的 OpenAI 端点 | `/chat/completions`, `/completions` |

<br />

## API 密钥

前往[这里](https://novita.ai/settings/key-management)获取你的 API 密钥
```python
import os
os.environ["NOVITA_API_KEY"] = "your-api-key"
```

## 支持的 OpenAI 参数
- max_tokens
- stream
- stream_options
- n
- seed
- frequency_penalty
- presence_penalty
- repetition_penalty
- stop
- temperature
- top_p
- top_k
- min_p
- logit_bias
- logprobs
- top_logprobs
- tools
- response_format
- separate_reasoning


## 使用示例

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion
os.environ["NOVITA_API_KEY"] = ""

response = completion(
    model="novita/deepseek/deepseek-r1-turbo",
    messages=[{"role": "user", "content": "List 5 popular cookie recipes."}]
)

content = response.get('choices', [{}])[0].get('message', {}).get('content')
print(content)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 在 config.yaml 中添加模型
```yaml
model_list:
  - model_name: deepseek-r1-turbo
    litellm_params:
      model: novita/deepseek/deepseek-r1-turbo
      api_key: os.environ/NOVITA_API_KEY
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 发起请求！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk_sujEQQEjTRxGUiMLN3TJh2KadRX4pw2TLWRoIKeoYZ0' \
-d '{
  "model": "deepseek-r1-turbo",
  "messages": [
      {"role": "user", "content": "List 5 popular cookie recipes."}
  ]
}
'
```

</TabItem>
</Tabs>


## 工具调用

```python
from litellm import completion
import os
# set env
os.environ["NOVITA_API_KEY"] = ""

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]
messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]

response = completion(
    model="novita/deepseek/deepseek-r1-turbo",
    messages=messages,
    tools=tools,
)
# Add any assertions, here to check response args
print(response)
assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
assert isinstance(
    response.choices[0].message.tool_calls[0].function.arguments, str
)

```

## JSON 模式

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 
import os 

os.environ['NOVITA_API_KEY'] = ""

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]

response = completion(
    model="novita/deepseek/deepseek-r1-turbo", 
    messages=messages, 
    response_format={"type": "json_object"} # 👈 KEY CHANGE
)

print(json.loads(response.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 在 config.yaml 中添加模型
```yaml
model_list:
  - model_name: deepseek-r1-turbo
    litellm_params:
      model: novita/deepseek/deepseek-r1-turbo
      api_key: os.environ/NOVITA_API_KEY
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 发起请求！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "deepseek-r1-turbo",
  "messages": [
      {"role": "user", "content": "List 5 popular cookie recipes."}
  ],
  "response_format": {"type": "json_object"}
}
'
```

</TabItem>
</Tabs>


## 对话模型

🚨 LiteLLM 支持全部 Novita AI 模型，发送 `model=novita/<your-novita-model>` 即可路由到 Novita AI。全部模型列表见[这里](https://novita.ai/models/llm?utm_source=github_litellm&utm_medium=github_readme&utm_campaign=github_link)

| 模型名称 | 函数调用 |
|---------------------------|-----------------------------------------------------|
| novita/deepseek/deepseek-r1-turbo | `completion('novita/deepseek/deepseek-r1-turbo', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/deepseek/deepseek-v3-turbo | `completion('novita/deepseek/deepseek-v3-turbo', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/deepseek/deepseek-v3-0324 | `completion('novita/deepseek/deepseek-v3-0324', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/qwen/qwen3-235b-a22b-fp8 | `completion('novita/qwen/qwen/qwen3-235b-a22b-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/qwen/qwen3-30b-a3b-fp8 | `completion('novita/qwen/qwen3-30b-a3b-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/qwen/qwen/qwen3-32b-fp8 | `completion('novita/qwen/qwen3-32b-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/qwen/qwen3-30b-a3b-fp8 | `completion('novita/qwen/qwen3-30b-a3b-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/qwen/qwen2.5-vl-72b-instruct | `completion('novita/qwen/qwen2.5-vl-72b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-4-maverick-17b-128e-instruct-fp8 | `completion('novita/meta-llama/llama-4-maverick-17b-128e-instruct-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.3-70b-instruct | `completion('novita/meta-llama/llama-3.3-70b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.1-8b-instruct | `completion('novita/meta-llama/llama-3.1-8b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.1-8b-instruct-max | `completion('novita/meta-llama/llama-3.1-8b-instruct-max', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.1-70b-instruct | `completion('novita/meta-llama/llama-3.1-70b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/gryphe/mythomax-l2-13b | `completion('novita/gryphe/mythomax-l2-13b', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/google/gemma-3-27b-it | `completion('novita/google/gemma-3-27b-it', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/mistralai/mistral-nemo | `completion('novita/mistralai/mistral-nemo', messages)` | `os.environ['NOVITA_API_KEY']` |
