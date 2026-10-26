import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Clarifai
Clarifai 支持 Anthropic、OpenAI、Qwen、xAI、Gemini 以及大多数开源 LLM。

| 属性 | 说明 |
|-------|-------|
| 简介 | Clarifai 是一个人工智能平台，通过统一的 API 提供对众多 LLM 的访问。LiteLLM 使用 OpenAI 兼容接口调用 Clarifai 的模型。 |
| 提供商文档 | [Clarifai ↗](https://docs.clarifai.com/) |
| 提供商的 OpenAI 兼容端点 | `https://api.clarifai.com/v2/ext/openai/v1` |
| 支持的端点 | `/chat/completions` |

## 前置准备

```bash
uv add litellm
```

## 必需的环境变量
按照这个[链接](https://docs.clarifai.com/clarifai-basics/authentication/personal-access-tokens/)即可获取你的 Clarifai 个人访问令牌（Personal Access Token，PAT）。

```python
os.environ["CLARIFAI_API_KEY"] = "your-clarifai-pat"
```

LiteLLM 会从 `CLARIFAI_API_KEY` 或 `api_key` 参数读取 PAT，不会读取 `CLARIFAI_PAT`。

## 用法

```python
import os
from litellm import completion

os.environ["CLARIFAI_API_KEY"] = ""

response = completion(
  model="clarifai/openai.chat-completion.gpt-oss-20b",
  messages=[{ "content": "Tell me a joke about physics?","role": "user"}]
)
```
## 流式支持

LiteLLM 支持 Clarifai 模型的流式（streaming）响应：

```python
import litellm

for chunk in litellm.completion(
    model="clarifai/openai.chat-completion.gpt-oss-20b",
    api_key="CLARIFAI_API_KEY",
    messages=[
        {"role": "user", "content": "Tell me a fun fact about space."}
    ],
    stream=True,
):
    print(chunk.choices[0].delta)
```

## 工具调用（函数调用）

通过 LiteLLM 访问的 Clarifai 模型支持函数调用（function calling）：

```python
import litellm

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country e.g. Tokyo, Japan"
                }
            },
            "required": ["location"],
            "additionalProperties": False
        },
    }
}]

response = litellm.completion(
    model="clarifai/openai.chat-completion.gpt-oss-20b",
    api_key="CLARIFAI_API_KEY",
    messages=[{"role": "user", "content": "What is the weather in Paris today?"}],
    tools=tools,
)

print(response.choices[0].message.tool_calls)
```

## Clarifai 模型
LiteLLM 支持 [Clarifai 社区](https://clarifai.com/explore/models?filterData=%5B%7B%22field%22%3A%22use_cases%22%2C%22value%22%3A%5B%22llm%22%5D%7D%5D&page=1&perPage=24)上的全部模型。

### 🧠 OpenAI 模型
- [gpt-oss-20b](https://clarifai.com/openai/chat-completion/models/gpt-oss-20b)
- [gpt-oss-120b](https://clarifai.com/openai/chat-completion/models/gpt-oss-120b)
- [gpt-5-nano](https://clarifai.com/openai/chat-completion/models/gpt-5-nano)
- [gpt-5-mini](https://clarifai.com/openai/chat-completion/models/gpt-5-mini)
- [gpt-5](https://clarifai.com/openai/chat-completion/models/gpt-5)
- [gpt-4o](https://clarifai.com/openai/chat-completion/models/gpt-4o)
- [o3](https://clarifai.com/openai/chat-completion/models/o3)
- 还有更多……


### 🤖 Anthropic 模型
- [claude-sonnet-4](https://clarifai.com/anthropic/completion/models/claude-sonnet-4)
- [claude-opus-4](https://clarifai.com/anthropic/completion/models/claude-opus-4)
- [claude-3_5-haiku](https://clarifai.com/anthropic/completion/models/claude-3_5-haiku)
- [claude-3_7-sonnet](https://clarifai.com/anthropic/completion/models/claude-3_7-sonnet)
- 还有更多……


### 🪄 xAI 模型
- [grok-3](https://clarifai.com/xai/chat-completion/models/grok-3)
- [grok-2-vision-1212](https://clarifai.com/xai/chat-completion/models/grok-2-vision-1212)
- [grok-2-1212](https://clarifai.com/xai/chat-completion/models/grok-2-1212)
- [grok-code-fast-1](https://clarifai.com/xai/chat-completion/models/grok-code-fast-1)
- [grok-2-image-1212](https://clarifai.com/xai/image-generation/models/grok-2-image-1212)
- 还有更多……


### 🔷 Google Gemini 模型
- [gemini-2_5-pro](https://clarifai.com/gcp/generate/models/gemini-2_5-pro)
- [gemini-2_5-flash-lite](https://clarifai.com/gcp/generate/models/gemini-2_5-flash-lite)
- [gemini-2_0-flash](https://clarifai.com/gcp/generate/models/gemini-2_0-flash)
- [gemini-2_0-flash-lite](https://clarifai.com/gcp/generate/models/gemini-2_0-flash-lite)
- 还有更多……


### 🧩 Qwen 模型
- [Qwen3-30B-A3B-Instruct-2507](https://clarifai.com/qwen/qwenLM/models/Qwen3-30B-A3B-Instruct-2507)
- [Qwen3-30B-A3B-Thinking-2507](https://clarifai.com/qwen/qwenLM/models/Qwen3-30B-A3B-Thinking-2507)
- [Qwen3-14B](https://clarifai.com/qwen/qwenLM/models/Qwen3-14B)
- [QwQ-32B-AWQ](https://clarifai.com/qwen/qwenLM/models/QwQ-32B-AWQ)
- [Qwen2_5-VL-7B-Instruct](https://clarifai.com/qwen/qwen-VL/models/Qwen2_5-VL-7B-Instruct)
- [Qwen3-Coder-30B-A3B-Instruct](https://clarifai.com/qwen/qwenCoder/models/Qwen3-Coder-30B-A3B-Instruct)
- 还有更多……


### 💡 MiniCPM（OpenBMB）模型
- [MiniCPM-o-2_6-language](https://clarifai.com/openbmb/miniCPM/models/MiniCPM-o-2_6-language)
- [MiniCPM3-4B](https://clarifai.com/openbmb/miniCPM/models/MiniCPM3-4B)
- [MiniCPM4-8B](https://clarifai.com/openbmb/miniCPM/models/MiniCPM4-8B)
- 还有更多……


### 🧬 Microsoft Phi 模型
- [Phi-4-reasoning-plus](https://clarifai.com/microsoft/text-generation/models/Phi-4-reasoning-plus)
- [phi-4](https://clarifai.com/microsoft/text-generation/models/phi-4)
- 还有更多……


### 🦙 Meta Llama 模型
- [Llama-3_2-3B-Instruct](https://clarifai.com/meta/Llama-3/models/Llama-3_2-3B-Instruct)
- 还有更多……


### 🔍 DeepSeek 模型
- [DeepSeek-R1-0528-Qwen3-8B](https://clarifai.com/deepseek-ai/deepseek-chat/models/DeepSeek-R1-0528-Qwen3-8B)
- 还有更多……

## 通过 LiteLLM 代理使用

下面介绍如何通过 LiteLLM 代理服务器（Proxy Server）调用 Clarifai。

### 1. 在环境中保存密钥

```bash
export CLARIFAI_API_KEY="your-clarifai-pat"
```

### 2. 启动代理

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: clarifai-model
    litellm_params:
      model: clarifai/openai.chat-completion.gpt-oss-20b
      api_key: os.environ/CLARIFAI_API_KEY
```

```bash
litellm --config /path/to/config.yaml

# 服务运行在 http://0.0.0.0:4000
```
</TabItem>
</Tabs>

### 3. 测试

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "clarifai-model",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="clarifai-model",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ]
)

print(response)
```
</TabItem>
</Tabs>

## 重要说明

- 指定模型名称时，始终在 Clarifai 模型 ID 前加上 `clarifai/` 前缀
- 使用你的 Clarifai 个人访问令牌（PAT）作为 API 密钥
- 用量通过 Clarifai 追踪和计费
- API 速率限制取决于你的 Clarifai 账户设置
- 大多数 OpenAI 参数都受支持，但部分高级特性可能因模型而异


## 常见问题

| 问题 | 答案 |
|----------|---------|
| LiteLLM 能使用所有 Clarifai 模型吗？ | 大多数对话补全模型都受支持，把 Clarifai 模型 URL 用作 `model` 即可。 |
| 需要单独的 Clarifai PAT 吗？ | 需要，你必须使用有效的 Clarifai 个人访问令牌。 |
| 支持工具调用吗？ | 支持，前提是底层 Clarifai 模型本身支持函数调用或工具调用。 |
| 如何计费？ | Clarifai 用量由 Clarifai 独立计费。 |

## 更多资源

- [Clarifai 文档](https://docs.clarifai.com/)
- [LiteLLM GitHub](https://github.com/BerriAI/litellm)
- [Clarifai Runners 示例](https://github.com/Clarifai/runners-examples)
