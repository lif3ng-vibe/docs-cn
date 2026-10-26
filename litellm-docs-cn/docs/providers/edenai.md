import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Eden AI

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Eden AI 是一个 AI 网关（AI gateway）：一个 API 密钥、一张账单，即可调用来自 30 多家提供商（provider）的 1000 多个 LLM（OpenAI、Anthropic、Google、Mistral、DeepSeek、xAI、Amazon Bedrock、Azure 等），且每个请求的真实成本都会在响应中上报。 |
| LiteLLM 提供商路由 | `edenai/` |
| 提供商文档链接 | [Eden AI 文档 ↗](https://www.edenai.co/docs) |
| Base URL | `https://api.edenai.run/v3` |
| 支持的操作 | [`/chat/completions`](#用法---litellm-python-sdk)，[`/responses`](#用法---responses-api)，[`/v1/messages`](#用法---anthropic-messages-api)，[`/embeddings`](#用法---embeddings)，[`/audio/transcriptions`](#用法---语音转写与合成)，[`/audio/speech`](#用法---语音转写与合成)，[`/images/generations`](#用法---图像生成)，[`/videos`](#用法---视频生成) |

<br />
<br />

https://www.edenai.co/docs

**支持全部 Eden AI 对话模型：发送补全（completion）请求时加上 `edenai/` 前缀即可**

## 必需变量

```python showLineNumbers title="环境变量"
os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key
```

密钥在 Eden AI 仪表板（https://app.edenai.run）的 Settings 下 API Keys 页面创建。

## 可选变量

```python showLineNumbers title="环境变量"
os.environ["EDENAI_API_BASE"] = "https://api.eu.edenai.run/v3"  # EU endpoint, same key. Default is https://api.edenai.run/v3
```

欧盟端点接受同一个 API 密钥，但只承载目录中托管在欧盟的那部分模型，因此在默认主机上可用的模型 id（包括本页示例中的 `openai/gpt-mini-latest` 和 `anthropic/claude-sonnet-latest`）在那里可能不存在。切换前请先在 https://api.eu.edenai.run/v3/models 确认欧盟主机提供了哪些 id。

## 模型名称

Eden AI 的模型 id 为 `provider/model` 形式，例如 `openai/gpt-mini-latest`、`anthropic/claude-sonnet-latest` 或 `google/gemini-3.7-flash`。加上 `edenai/` 前缀后，LiteLLM 只会剥掉这一层前缀，因此 `edenai/openai/gpt-mini-latest` 会以 `openai/gpt-mini-latest` 的形式到达 Eden AI。裸模型名（如 `edenai/mistral-small-latest`）同样可用：此时由 Eden AI 自己挑选服务该模型的卖家（即提供商路由）。Eden AI 自有的稳定别名（目录中带 `alias_of` 的条目，如 `openai/gpt-mini-latest`）必须带厂商前缀才能解析。区域变体保留后缀，如 `edenai/vertex/gemini-3.7-flash@eu`。

目录在 https://app.edenai.run/models 公开可查。在 LiteLLM 中，`litellm.get_valid_models(custom_llm_provider="edenai", check_provider_endpoint=True)` 返回的也是同一份列表，并已带上 `edenai/` 前缀。

## 用一个部署路由全部 Eden AI 模型

代理可以用一个通配（wildcard）部署把整个目录暴露出去。开启 `check_provider_endpoint` 后，`/v1/models` 会把 `https://api.edenai.run/v3/models` 里的每个模型都列在 `edenai/` 前缀之下，对其中任何模型的请求（例如 `edenai/mistral/mistral-small-latest`）都会路由到这个部署。

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: edenai/*
    litellm_params:
      model: edenai/*
      api_key: os.environ/EDENAI_API_KEY

litellm_settings:
  check_provider_endpoint: true
```

## 成本追踪

Eden AI 的每个响应都会以美元上报该请求的成本（已计入账户折扣），LiteLLM 会把这个数字记为请求花费，而不是用价格表估算。对话补全的流式响应中，成本随最后一个 usage 块返回。LiteLLM 总是会向 Eden AI 请求该块，但只有当你设置了 `stream_options={"include_usage": True}` 时才会把它转发给客户端，因此流式客户端看到的仍是它们所期望的标准 OpenAI 行为。

| 端点 | 非流式 | 流式 |
|-------|-------|-------|
| `/chat/completions` | Eden AI 的 `cost` | Eden AI 的 `cost`，取自最后一个 usage 块 |
| `/responses` | Eden AI 的 `cost` | Eden AI 的 `cost`，取自 `response.completed` 事件中的 `usage.cost` |
| `/v1/messages` | Eden AI 的 `cost` | 价格表估算，除非你注册了模型价格，否则为 0：Eden AI 不会在 Messages 流中上报成本 |
| `/embeddings` | Eden AI 的 `cost` | 不随流返回 |
| `/audio/transcriptions` | JSON 格式返回 Eden AI 的 `cost`；`text`、`srt` 和 `vtt` 格式按音频时长做价格表估算，Eden AI 对这几种格式不上报成本 | 不随流返回 |
| `/audio/speech` | Eden AI 的 `cost`，取自 `x-edenai-cost` 响应头 | 不随流返回 |
| `/images/generations` | Eden AI 的 `cost` | 不随流返回 |
| `/videos` | 创建调用时为 0，这是任务排队期间 Eden AI 上报的值；任务完成后，最终结算成本会以 `usage.provider_reported_cost_usd` 出现在任务状态中。若希望创建调用就按估算计费，可注册模型的每秒价格 | 不随流返回 |

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Eden AI 非流式补全"
import os
from litellm import completion

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

response = completion(
    model="edenai/openai/gpt-mini-latest",
    messages=messages,
)

print(response)
```

### 流式

```python showLineNumbers title="Eden AI 流式补全"
import os
from litellm import completion

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

messages = [{"content": "Write a short story about AI", "role": "user"}]

response = completion(
    model="edenai/anthropic/claude-sonnet-latest",
    messages=messages,
    stream=True,
    stream_options={"include_usage": True},
)

for chunk in response:
    print(chunk)
```

### Eden AI 参数：回退与路由

除了 OpenAI 参数集，Eden AI 还接受几个自有字段。`fallbacks` 最多列出三个 `provider/model` 形式的模型 id，主模型失败时按顺序依次尝试；`routing` 为裸模型名指定提供商路由行为（`sort` 可取 `cost`、`speed`、`latency` 或 `exact`，`allowed_providers` 用来限定可选卖家）。这些字段通过 `extra_body` 传入：

```python showLineNumbers title="Eden AI 回退与路由"
import os
from litellm import completion

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

response = completion(
    model="edenai/gpt-5-mini",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    extra_body={
        "fallbacks": ["anthropic/claude-sonnet-latest"],
        "routing": {"sort": "latency", "allowed_providers": ["openai", "azure"]},
    },
)

print(response)
```

## 用法 - Responses API

Eden AI 在 `/v3/responses` 端点为目录中的每个模型提供 OpenAI 的 Responses API，LiteLLM 会把 `litellm.responses` 调用和代理的 `/v1/responses` 原生路由过去，而不是在对话补全之上模拟实现。有状态特性（`previous_response_id`、`store`、检索或删除响应）只有在卖家原生支持 Responses API 时才可用，目前仅限 OpenAI 模型；其他卖家则以无状态方式应答。

```python showLineNumbers title="Eden AI Responses API"
import os
import litellm

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

response = litellm.responses(
    model="edenai/openai/gpt-mini-latest",
    input="Hello, how are you?",
    max_output_tokens=200,
)

print(response.output_text)

stream = litellm.responses(
    model="edenai/anthropic/claude-sonnet-latest",
    input="Write a short story about AI",
    stream=True,
)

for event in stream:
    print(event)
```

此处同样通过 `extra_body` 传入 `fallbacks` 和 `routing`。

## 用法 - Anthropic Messages API

Eden AI 在 `/v3/v1/messages` 端点为目录中的每个模型提供 Anthropic 的 Messages API，OpenAI 和 Google 模型也在其中；LiteLLM 会把 `litellm.anthropic.messages` 调用和代理的 `/v1/messages` 原样转发过去，因此带 `cache_control` 的 `system` 块、`thinking` 以及工具结果都会按客户端发出的原样抵达 Eden AI。这条路由不能携带 Eden AI 的 `fallbacks` 和 `routing` 字段。

```python showLineNumbers title="Eden AI Anthropic Messages API"
import os
import litellm

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

response = await litellm.anthropic.messages.acreate(
    model="edenai/anthropic/claude-sonnet-latest",
    max_tokens=200,
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)

print(response["content"][0]["text"])
```

## 用法 - Embeddings

Eden AI 在 `/v3/embeddings` 端点为目录中的每个嵌入（embedding）模型提供 OpenAI 的 embeddings API（OpenAI、Google、Cohere、Mistral、Amazon 等）。`dimensions`、`encoding_format` 和 `user` 按原样透传；`metadata` 等 Eden AI 自有字段通过 `extra_body` 传入。

```python showLineNumbers title="Eden AI 嵌入"
import os
import litellm

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

response = litellm.embedding(
    model="edenai/openai/text-embedding-3-small",
    input=["Hello, how are you?", "Fine, thanks"],
    dimensions=256,
)

print(len(response.data[0]["embedding"]))
print(response._hidden_params["response_cost"])  # the cost Eden AI reported
```

## 用法 - 语音（转写与合成）

Eden AI 在 `/v3/audio/transcriptions` 端点提供 OpenAI 的语音转文字 API，在 `/v3/audio/speech` 端点提供文本转语音 API。转写接受常规的 multipart 上传，外加 `language`、`prompt`、`response_format`、`temperature` 和 `timestamp_granularities`；合成接受 `voice`、`response_format`、`speed` 和 `instructions`。两者都会上报 Eden AI 的成本：转写在响应体中，合成的响应体本身就是音频，所以成本放在 `x-edenai-cost` 响应头里。

```python showLineNumbers title="Eden AI 语音"
import os
import litellm

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

speech = litellm.speech(
    model="edenai/openai/tts-1",
    input="Hello, how are you?",
    voice="alloy",
    response_format="mp3",
)
speech.stream_to_file("hello.mp3")

with open("hello.mp3", "rb") as audio:
    transcript = litellm.transcription(
        model="edenai/openai/whisper-1",
        file=audio,
        language="en",
    )

print(transcript.text)
```

## 用法 - 图像生成

Eden AI 在 `/v3/images/generations` 端点为目录中的每个图像模型提供 OpenAI 的图像生成 API（OpenAI、Google、Amazon、Stability 等）。图像依卖家不同，以 `b64_json` 或托管 `url` 形式返回，响应中带有 Eden AI 的成本。

```python showLineNumbers title="Eden AI 图像生成"
import base64
import os
import litellm

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

response = litellm.image_generation(
    model="edenai/openai/gpt-image-1-mini",
    prompt="A watercolor lighthouse at dawn",
    size="1024x1024",
    quality="low",
)

image = response.data[0]
if image.b64_json:
    with open("lighthouse.png", "wb") as f:
        f.write(base64.b64decode(image.b64_json))
else:
    print(image.url)
```

## 用法 - 视频生成

Eden AI 在 `/v3/videos` 端点为目录中的每个视频模型提供 OpenAI 的视频 API（OpenAI、Google、Amazon、MiniMax、Pixverse 等）。任务的创建、轮询和下载都通过 LiteLLM 的视频函数完成；LiteLLM 返回的 id 会自行把后续调用路由回 Eden AI。`seconds` 和 `size` 按原样透传；参考图像通过 `input_reference` 传入，可以是文件，也可以是 `{"image_url": ...}` 或 `{"file_id": ...}`；Eden AI 自有的 `seed`、`provider_params`、`webhook_receiver` 和 `user_webhook_parameters` 会透传给 Eden AI 校验。OpenAI 的 `characters` 和 `user` 也会一并转发，但在 Eden AI 支持它们之前会对此返回 422。

```python showLineNumbers title="Eden AI 视频生成"
import os
import time
import litellm

os.environ["EDENAI_API_KEY"] = ""  # your Eden AI API key

job = litellm.video_generation(
    model="edenai/pruna/p-video",
    prompt="A red ball rolling across a wooden table",
    seconds="4",
    size="1280x720",
)

while job.status not in ("completed", "failed"):
    time.sleep(5)
    job = litellm.video_status(video_id=job.id)

print(job.status, job.usage)  # usage carries Eden AI's settled cost as provider_reported_cost_usd
with open("ball.mp4", "wb") as f:
    f.write(litellm.video_content(video_id=job.id))
```

## 用法 - LiteLLM 代理服务器

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-mini-latest
    litellm_params:
      model: edenai/openai/gpt-mini-latest
      api_key: os.environ/EDENAI_API_KEY
  - model_name: claude-sonnet
    litellm_params:
      model: edenai/anthropic/claude-sonnet-latest
      api_key: os.environ/EDENAI_API_KEY
  - model_name: gemini-flash-eu
    litellm_params:
      model: edenai/vertex/gemini-3.7-flash
      api_key: os.environ/EDENAI_API_KEY
      api_base: https://api.eu.edenai.run/v3
  - model_name: text-embedding-3-small
    litellm_params:
      model: edenai/openai/text-embedding-3-small
      api_key: os.environ/EDENAI_API_KEY
  - model_name: whisper-1
    litellm_params:
      model: edenai/openai/whisper-1
      api_key: os.environ/EDENAI_API_KEY
  - model_name: tts-1
    litellm_params:
      model: edenai/openai/tts-1
      api_key: os.environ/EDENAI_API_KEY
  - model_name: gpt-image-1-mini
    litellm_params:
      model: edenai/openai/gpt-image-1-mini
      api_key: os.environ/EDENAI_API_KEY
  - model_name: p-video
    litellm_params:
      model: edenai/pruna/p-video
      api_key: os.environ/EDENAI_API_KEY
```

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="通过代理调用 Eden AI"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key",      # Your proxy API key
)

response = client.chat.completions.create(
    model="gpt-mini-latest",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="通过代理调用 Eden AI - LiteLLM SDK"
import litellm

response = litellm.completion(
    model="litellm_proxy/gpt-mini-latest",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key",
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="通过代理调用 Eden AI - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "gpt-mini-latest",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

</TabItem>
</Tabs>

代理的 `x-litellm-response-cost` 响应头和花费日志中记录的，就是 Eden AI 为该请求上报的成本。

同一批部署还服务 `/v1/responses` 和 `/v1/messages`：

```bash showLineNumbers title="通过代理调用 Eden AI - Responses API"
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "gpt-mini-latest",
    "input": "Hello, how are you?"
  }'
```

```bash showLineNumbers title="通过代理调用 Eden AI - Anthropic Messages API"
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-proxy-api-key" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet",
    "max_tokens": 200,
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

嵌入、语音和图像同理，走 OpenAI 路由：

```bash showLineNumbers title="通过代理调用 Eden AI - 嵌入、语音、图像"
curl http://localhost:4000/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{"model": "text-embedding-3-small", "input": "Hello, how are you?"}'

curl http://localhost:4000/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{"model": "tts-1", "input": "Hello, how are you?", "voice": "alloy"}' \
  --output hello.mp3

curl http://localhost:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer your-proxy-api-key" \
  -F model=whisper-1 \
  -F file=@hello.mp3

curl http://localhost:4000/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{"model": "gpt-image-1-mini", "prompt": "A watercolor lighthouse at dawn", "size": "1024x1024", "quality": "low"}'
```

视频任务走 OpenAI 视频路由：在 `/v1/videos` 创建，轮询 `/v1/videos/{id}` 直到 `status` 变为 `completed`，再从 `/v1/videos/{id}/content` 下载：

```bash showLineNumbers title="通过代理调用 Eden AI - 视频"
curl http://localhost:4000/v1/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{"model": "p-video", "prompt": "A red ball rolling across a wooden table", "seconds": "4", "size": "1280x720"}'

curl http://localhost:4000/v1/videos/<id from the create response> \
  -H "Authorization: Bearer your-proxy-api-key"

curl http://localhost:4000/v1/videos/<id from the create response>/content \
  -H "Authorization: Bearer your-proxy-api-key" \
  --output ball.mp4
```

## 支持的 OpenAI 参数

Eden AI 支持完整的 OpenAI 对话补全参数集：`temperature`、`top_p`、`max_tokens`、`max_completion_tokens`、`n`、`stop`、`seed`、`stream`、`stream_options`、`tools`、`tool_choice`、`parallel_tool_calls`、`response_format`、`reasoning_effort`、`logprobs`、`top_logprobs`、`frequency_penalty`、`presence_penalty`、`logit_bias`、`web_search_options`、`modalities`、`audio`、`prediction` 和 `service_tier`。提供商特有参数通过 `extra_body` 传入，由 Eden AI 转交底层的提供商。
