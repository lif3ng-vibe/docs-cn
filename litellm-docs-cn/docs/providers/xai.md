import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# xAI

https://docs.x.ai/docs

:::tip

**我们支持 xAI 的全部模型：发送 litellm 请求时，只需将 `model=xai/<any-model-on-xai>` 作为前缀**

:::

## 支持的模型

**Grok 4.5** 是面向编码、智能体（agentic）任务与知识工作的前沿模型，具备 500K token 上下文窗口，支持推理（低/中/高三档）、视觉、工具、联网搜索与提示词缓存。

| 模型 | 上下文 | 特性 |
|-------|---------|----------|
| `xai/grok-4.5` | 500K tokens | **推理**、函数调用、视觉、联网搜索、缓存 |

**示例**：
```python
from litellm import completion

response = completion(
    model="xai/grok-4.5",
    messages=[{"role": "user", "content": "Find and fix the bug, then explain it."}],
    reasoning_effort="high",  # low | medium | high (default high)
)
```

**特性**：
- **推理**（Reasoning）：基于推理 token 的思维链（chain-of-thought）推理
- **工具**（Tools）：函数调用 / 工具调用
- **联网搜索**（Web search）：实时互联网搜索
- **视觉**（Vision）：图像理解
- **缓存**（Caching）：提示词缓存（prompt caching），帮助节省成本
- **结构化输出**（Structured outputs）：JSON / 遵循给定 schema 的响应

**定价**：最新费率请参见 [xAI 定价页面](https://docs.x.ai/docs/models)。

## API 密钥
```python
# env variable
os.environ['XAI_API_KEY']
```

## 使用示例

```python showLineNumbers title="LiteLLM python sdk usage - Non-streaming"
from litellm import completion
import os

os.environ['XAI_API_KEY'] = ""
response = completion(
    model="xai/grok-4.5",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    temperature=0.2,
    top_p=0.9,
    tool_choice="auto",
    tools=[],
    user="user",
)
print(response)
```

## 流式使用示例

```python showLineNumbers title="LiteLLM python sdk usage - Streaming"
from litellm import completion
import os

os.environ['XAI_API_KEY'] = ""
response = completion(
    model="xai/grok-4.5",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    temperature=0.2,
    top_p=0.9,
    tool_choice="auto",
    tools=[],
    user="user",
)

for chunk in response:
    print(chunk)
```

## 视觉使用示例

```python showLineNumbers title="LiteLLM python sdk usage - Vision"
import os 
from litellm import completion

os.environ["XAI_API_KEY"] = "your-api-key"

response = completion(
    model="xai/grok-4.5",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://science.nasa.gov/wp-content/uploads/2023/09/web-first-images-release.png",
                        "detail": "high",
                    },
                },
                {
                    "type": "text",
                    "text": "What's in this image?",
                },
            ],
        },
    ],
)
```

## 通过 LiteLLM 代理服务器使用

下面演示如何通过 LiteLLM 代理服务器调用 xAI 模型。

1. 修改 config.yaml

  ```yaml showLineNumbers
  model_list:
    - model_name: my-model
      litellm_params:
        model: xai/<your-model-name>  # add xai/ prefix to route as XAI provider
        api_key: api-key                 # api key to send your model
  ```


2. 启动代理

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. 向 LiteLLM 代理服务器发送请求

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python showLineNumbers
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


## 推理用法

LiteLLM 支持 xAI 模型的推理（reasoning）用法。

<Tabs>

<TabItem value="python" label="LiteLLM Python SDK">

```python showLineNumbers title="reasoning with xai/grok-4.5"
import litellm
response = litellm.completion(
    model="xai/grok-4.5",
    messages=[{"role": "user", "content": "What is 101*3?"}],
    reasoning_effort="low",  # low | medium | high
)

print("Reasoning Content:")
print(response.choices[0].message.reasoning_content)

print("\nFinal Response:")
print(response.choices[0].message.content)

print("\nNumber of completion tokens:")
print(response.usage.completion_tokens)

print("\nNumber of reasoning tokens:")
print(response.usage.completion_tokens_details.reasoning_tokens)
```
</TabItem>

<TabItem value="curl" label="LiteLLM 代理 - OpenAI SDK 用法">

```python showLineNumbers title="reasoning with xai/grok-4.5"
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",             # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000" # litellm-proxy-base url
)

response = client.chat.completions.create(
    model="xai/grok-4.5",
    messages=[{"role": "user", "content": "What is 101*3?"}],
    reasoning_effort="low",  # low | medium | high
)

print("Reasoning Content:")
print(response.choices[0].message.reasoning_content)

print("\nFinal Response:")
print(response.choices[0].message.content)

print("\nNumber of completion tokens:")
print(response.usage.completion_tokens)

print("\nNumber of reasoning tokens:")
print(response.usage.completion_tokens_details.reasoning_tokens)
```

</TabItem>
</Tabs>

**响应示例**：

```shell
Reasoning Content:
Let me calculate 101 multiplied by 3:
101 * 3 = 303.
I can double-check that: 100 * 3 is 300, and 1 * 3 is 3, so 300 + 3 = 303. Yes, that's correct.

Final Response:
The result of 101 multiplied by 3 is 303.

Number of completion tokens:
14

Number of reasoning tokens:
310
```
