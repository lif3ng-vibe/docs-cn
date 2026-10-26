import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini - Google AI Studio

| 属性 | 说明 |
|-------|-------|
| 描述 | Google AI Studio 是一个全托管的 AI 开发平台，用于构建和使用生成式 AI。 |
| LiteLLM 提供商路由 | `gemini/` |
| 提供商文档 | [Google AI Studio ↗](https://aistudio.google.com/) |
| 提供商 API 端点 | https://generativelanguage.googleapis.com |
| 支持的 OpenAI 端点 | `/chat/completions`, [`/embeddings`](../embedding/supported_embedding#gemini-ai-嵌入模型), `/completions`, [`/videos`](./gemini/videos.md), [`/images/edits`](../image_edits.md) |
| Lyria（音乐） | [成本映射与说明](./gemini/music.md) |
| 透传端点 | [已支持](../pass_through/google_ai_studio.md) |

<br />

:::tip[Gemini API 与 Vertex AI]
| 模型格式 | 提供商 | 所需认证 |
|-------------|----------|---------------|
| `gemini/gemini-2.0-flash` | Gemini API | `GEMINI_API_KEY`（简单的 API 密钥） |
| `vertex_ai/gemini-2.0-flash` | Vertex AI | GCP 凭证 + 项目 |
| `gemini-2.0-flash`（无前缀） | Vertex AI | GCP 凭证 + 项目 |

**如果你只想像 OpenAI 那样用一把 API 密钥**，加上 `gemini/` 前缀即可。

不带前缀的模型默认走 Vertex AI，需要完整的 GCP 认证。
:::

## API 密钥

```python
import os
os.environ["GEMINI_API_KEY"] = "your-api-key"
```

## 使用示例
```python
from litellm import completion
import os

os.environ['GEMINI_API_KEY'] = ""
response = completion(
    model="gemini/{{gemini_flash}}", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}]
)
```

## 支持的 OpenAI 参数
- temperature
- top_p
- max_tokens
- max_completion_tokens
- stream
- tools
- tool_choice
- include_server_side_tool_invocations
- functions
- response_format
- n
- stop
- logprobs
- frequency_penalty
- modalities
- reasoning_content
- audio（仅 TTS 模型可用）
- service_tier

**Anthropic 参数**
- thinking（用于跨 anthropic/gemini 模型设置思考 token 预算上限）

[**查看最新列表**](https://github.com/BerriAI/litellm/blob/main/litellm/llms/gemini/chat/transformation.py#L70)

## 用法 - 思考 / `reasoning_content`

LiteLLM 会把 OpenAI 的 `reasoning_effort` 转换为 Gemini 的 `thinking` 参数。[代码](https://github.com/BerriAI/litellm/blob/620664921902d7a9bfb29897a7b27c1a7ef4ddfb/litellm/llms/vertex_ai/gemini/vertex_and_google_ai_studio_gemini.py#L362)

**成本优化**：使用 `reasoning_effort="none"`（OpenAI 标准）可显著节省成本，最多便宜 96%。[Google 文档](https://ai.google.dev/gemini-api/docs/openai)

:::info
注意：Gemini 2.5 Pro 模型的思考无法关闭。
:::

:::tip[Gemini 3 模型]
对 **Gemini 3+ 模型**（例如 `{{gemini_pro}}`），当你设置 `reasoning_effort` 时，LiteLLM 会把它映射到 `thinking_level` 字段而非 `thinking_budget`。支持的档位因模型而异：Flash 系列还支持 `medium`，3.6 及之前的 Flash 还支持 `minimal`。3.7 和 3.8 Flash 拒绝 `minimal`，因此对这些模型，`minimal`、`none` 与 `disable` 都会被 LiteLLM 改发为 `low`，该行为由成本表条目中的 `supports_minimal_reasoning_effort: false` 决定。若不传 `reasoning_effort`，LiteLLM **不会**发送默认的 `thinking_level`，请求将沿用 **Gemini API 默认值**（API 上 Gemini 3 Flash 默认为 `high`）。
:::

:::warning[图像模型]
**Gemini 图像模型**（例如 `gemini-3-pro-image-preview`、`gemini-2.0-flash-exp-image-generation`）**不支持** `thinking_level` 参数。为避免 API 报错，LiteLLM 会自动把图像模型排除在思考配置之外。
:::

**Gemini 2.5 及更早模型的映射**

| reasoning_effort | thinking | 说明 |
| ---------------- | -------- | ----- |
| "none"           | "budget_tokens": 0, "includeThoughts": false | 💰 **推荐用于成本优化**：兼容 OpenAI，恒为 0 |
| "disable"        | "budget_tokens": DEFAULT (0), "includeThoughts": false | LiteLLM 特有，可通过环境变量配置 |
| "low"            | "budget_tokens": 1024 | |
| "medium"         | "budget_tokens": 2048 | |
| "high"           | "budget_tokens": 4096 | |

**Gemini 3+ 模型的映射**

| reasoning_effort | thinking_level | 说明 |
| ---------------- | -------------- | ----- |
| "minimal"        | `"minimal"` (Flash up to 3.6 / some 3.1) or `"low"` | Flash 系列模型 ID 使用 `minimal`，除非其成本表条目设置了 `supports_minimal_reasoning_effort: false`（3.7 和 3.8 Flash），此时映射为 `low` |
| "low"            | "low" | 最适合简单的指令跟随或对话 |
| "medium"         | `"medium"` or `"high"` | API 支持时用 `"medium"`，否则用 `"high"` |
| "high"           | "high" | 最大化推理深度 |
| "disable"        | `"minimal"` (Flash up to 3.6) or `"low"` | Gemini 3 无法完全关闭思考；3.7 和 3.8 Flash 拒绝 `minimal`，因此会得到 `low` |
| "none"           | `"minimal"` (Flash up to 3.6) or `"low"` | Gemini 3 无法完全关闭思考；3.7 和 3.8 Flash 拒绝 `minimal`，因此会得到 `low` |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# Cost-optimized: Use reasoning_effort="none" for best pricing
resp = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="none",  # Up to 96% cheaper!
)

# Or use other levels: "low", "medium", "high"
resp = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)

```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
- model_name: {{gemini_flash}}
  litellm_params:
    model: gemini/{{gemini_flash}}
    api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

### Gemini 3+ 模型的 `thinking_level` 参数

对 Gemini 3+ 模型（例如 `{{gemini_pro}}`），可以直接使用新的 `thinking_level` 参数：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# Use thinking_level for Gemini 3 models
resp = completion(
    model="gemini/{{gemini_pro}}",
    messages=[{"role": "user", "content": "Solve this complex math problem step by step."}],
    reasoning_effort="high",  # Options: "low" or "high"
)

# Low thinking level for faster, simpler tasks
resp = completion(
    model="gemini/{{gemini_pro}}",
    messages=[{"role": "user", "content": "What is the weather today?"}],
    reasoning_effort="low",  # Minimizes latency and cost
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_pro}}",
    "messages": [{"role": "user", "content": "Solve this complex problem."}],
    "reasoning_effort": "high"
  }'
```

</TabItem>
</Tabs>

:::warning
**Gemini 3 模型的 temperature 建议**

对 Gemini 3 模型，LiteLLM 默认将 `temperature` 设为 `1.0`，并强烈建议保持这一默认值。把 `temperature` 设到 1.0 以下可能导致：
- 无限循环
- 推理性能下降
- 复杂任务失败

Gemini 3+ 模型若未指定 `temperature`，LiteLLM 会自动设置 `temperature=1.0`。
:::

**预期响应**

```python
ModelResponse(
    id='chatcmpl-c542d76d-f675-4e87-8e5f-05855f5d0f5e',
    created=1740470510,
    model='{{gemini_flash}}',
    object='chat.completion',
    system_fingerprint=None,
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content="The capital of France is Paris.",
                role='assistant',
                tool_calls=None,
                function_call=None,
                reasoning_content='The capital of France is Paris. This is a very straightforward factual question.'
            ),
        )
    ],
    usage=Usage(
        completion_tokens=68,
        prompt_tokens=42,
        total_tokens=110,
        completion_tokens_details=None,
        prompt_tokens_details=PromptTokensDetailsWrapper(
            audio_tokens=None,
            cached_tokens=0,
            text_tokens=None,
            image_tokens=None
        ),
        cache_creation_input_tokens=0,
        cache_read_input_tokens=0
    )
)
```

### 向 Gemini 模型传递 `thinking`

你也可以向 Gemini 模型传入 `thinking` 参数。

它会被转换为 Gemini 的 [`thinkingConfig` 参数](https://ai.google.dev/gemini-api/docs/thinking#set-budget)。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="gemini/{{gemini_flash}}",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 1024},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gemini/{{gemini_flash}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>

对 **Gemini 3+ 模型**，LiteLLM 现在默认遵循提供商默认行为：传入 Anthropic 风格的 `thinking={"type":"enabled","budget_tokens":...}` 时**不会**强制设置 `thinkingLevel`。

如果想要旧的 LiteLLM 行为（Pro 强制 `thinkingLevel="low"`、Flash 强制 `thinkingLevel="minimal"`），请启用：

```python
import litellm

litellm.enable_gemini_default_thinking_level_low = True
```

## 用法 - `service_tier`

LiteLLM 会把 OpenAI 的 `service_tier` 参数透传给 Gemini，同时还会从响应头（`x-gemini-service-tier`）中提取该值，写入 `model_response.service_tier`。

| OpenAI `service_tier` | Gemini `service_tier` | 说明 |
| --------------------- | --------------------- | ----- |
| `"auto"`              | `"priority"`          | LiteLLM 把 OpenAI 的 `"auto"` 映射为 Gemini 的 `"priority"` 档，因为在 Gemini 上 `priority` 可以回退。 |
| `"flex"`              | `"flex"`              | 直接映射。 |
| `"priority"`          | `"priority"`          | 直接映射。 |
| `"default"`           | `"standard"`          | LiteLLM 把 `"default"` 映射为 `"standard"`。 |
| 其他任意值 | 原样传递（转为小写） | 取值不区分大小写，统一归一为小写。 |

在响应方向上，对 Gemini API，LiteLLM 会把 `"standard"` 映射回 `"default"`。


## 文本转语音（TTS）音频输出

:::info

LiteLLM 支持 Gemini TTS 模型，可使用 OpenAI 兼容的 `audio` 参数格式生成音频响应。

:::

### 支持的模型

LiteLLM 支持具备音频能力的 Gemini TTS 模型（例如 `gemini-2.5-flash-preview-tts` 和 `gemini-2.5-pro-preview-tts`）。完整的可用 TTS 模型与音色列表见 [Gemini TTS 官方文档](https://ai.google.dev/gemini-api/docs/speech-generation)。

### 限制

:::warning

**重要限制**：
- Gemini TTS 模型只支持 `pcm16` 音频格式
- **尚未为 TTS 模型提供流式支持**
- TTS 请求必须把 `modalities` 参数设为 `['audio']`

:::

### 音色名称

`audio.voice` 接受任意 Gemini 预置音色名（`Kore`、`Puck`、`Zephyr` 等）并原样传给上游。OpenAI 音色名会映射到最接近的 Gemini 预置音色，因此 OpenAI 风格的客户端和代理默认的 `audio_speech` 健康检查（`alloy`）无需改配置即可工作。查找不区分大小写；其他任何名称都会原样透传，所以拼错的音色名仍会在 Google 侧失败，报 `No matching speaker voice found` 错误。

该映射自 v1.107.0 起可用（首次出现在 `v1.107.0-rc.1`）。更早的版本会把 OpenAI 音色名原样发给 Google 并被拒绝，因此那些版本请改用 Gemini 音色名，例如 `Kore`。

| OpenAI 音色 | Gemini 音色 |
|--------------|--------------|
| `alloy` | `Kore` |
| `ash` | `Iapetus` |
| `ballad` | `Algieba` |
| `cedar` | `Achird` |
| `coral` | `Sulafat` |
| `echo` | `Charon` |
| `fable` | `Umbriel` |
| `marin` | `Despina` |
| `onyx` | `Orus` |
| `sage` | `Vindemiatrix` |
| `shimmer` | `Achernar` |
| `verse` | `Puck` |

Gemini 音色名称及其角色特点来自 [Gemini 语音生成文档](https://ai.google.dev/gemini-api/docs/speech-generation)（查阅于 2026-10-07）。

`nova` 不在表中：Gemini 3.x TTS 模型本身接受 `nova` 作为自家音色名（2026-10-08 实测），因此会原样透传。`gemini-2.5-flash-preview-tts` 则拒绝 `nova`，在该模型上请使用 Gemini 音色名。

### 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['GEMINI_API_KEY'] = "your-api-key"

response = completion(
    model="gemini/gemini-2.5-flash-preview-tts",
    messages=[{"role": "user", "content": "Say hello in a friendly voice"}],
    modalities=["audio"],  # Required for TTS models
    audio={
        "voice": "Kore",
        "format": "pcm16"  # Required: must be "pcm16"
    }
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: gemini-tts-flash
    litellm_params:
      model: gemini/gemini-2.5-flash-preview-tts
      api_key: os.environ/GEMINI_API_KEY
  - model_name: gemini-tts-pro
    litellm_params:
      model: gemini/gemini-2.5-pro-preview-tts
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 发起 TTS 请求

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-tts-flash",
    "messages": [{"role": "user", "content": "Say hello in a friendly voice"}],
    "modalities": ["audio"],
    "audio": {
      "voice": "Kore",
      "format": "pcm16"
    }
  }'
```

</TabItem>
</Tabs>

### 高级用法

你可以把 TTS 与其他 Gemini 特性结合使用：

```python
response = completion(
    model="gemini/gemini-2.5-pro-preview-tts",
    messages=[
        {"role": "system", "content": "You are a helpful assistant that speaks clearly."},
        {"role": "user", "content": "Explain quantum computing in simple terms"}
    ],
    modalities=["audio"],
    audio={
        "voice": "Charon",
        "format": "pcm16"
    },
    temperature=0.7,
    max_tokens=150
)
```

想进一步了解 Gemini 的 TTS 能力与可用音色，请参阅 [Gemini TTS 官方文档](https://ai.google.dev/gemini-api/docs/speech-generation)。

## 语音转写（Speech-to-Text） {#audio-transcription-speech-to-text}

:::info

LiteLLM 支持走 `/v1/audio/transcriptions` 的 `gemini-3.5-transcribe`，以及走 `/v1/realtime` 的 `gemini-3.5-transcribe-live`。打算用 Vertex AI 而不是 API 密钥？请参阅 [Vertex AI 语音转写](./vertex_transcription.md)。

:::

### 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import transcription
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

audio_file = open("speech.wav", "rb")
response = transcription(
    model="gemini/gemini-3.5-transcribe",
    file=audio_file,
    response_format="verbose_json",
    timestamp_granularities=["word"],
)
print(response.text)
print(response.words)  # word-level timestamps
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 把模型加入配置

```yaml
model_list:
  - model_name: gemini-3.5-transcribe
    litellm_params:
      model: gemini/gemini-3.5-transcribe
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config config.yaml
```

3. 测试

```bash
curl http://0.0.0.0:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F file=@speech.wav \
  -F model=gemini-3.5-transcribe \
  -F response_format=verbose_json \
  -F "timestamp_granularities[]=word"
```

</TabItem>
</Tabs>

### 支持的参数

支持 `language`、`response_format` 和 `timestamp_granularities`。请求词级时间戳时，底层的 Interactions API 调用还会同时启用说话人分离。`srt` 与 `vtt` 响应格式由 LiteLLM 基于 Gemini 的词级时间戳合成，因此 `text` 中是字幕文档；若 Gemini 未返回时间戳，`text` 则回退为纯转写文本。

### 通过 `/v1/realtime` 进行实时转写

`gemini-3.5-transcribe-live` 运行在 Realtime WebSocket 上。用 `input_audio_buffer.append` 推送 `pcm16` 音频流，并从 `conversation.item.input_audio_transcription.completed` 事件读取转写结果。Gemini Live API 不上报转写会话的 token 用量，因此 LiteLLM 会按 Google 公布的估算费率，根据音频流时长估算用量（与花费）。

```python
import asyncio
import json
import websockets

async def main():
    async with websockets.connect(
        "ws://0.0.0.0:4000/v1/realtime?model=gemini-3.5-transcribe-live",
        additional_headers={"Authorization": "Bearer sk-<your-litellm-api-key>"},
    ) as ws:
        await ws.send(json.dumps({"type": "input_audio_buffer.append", "audio": "<base64 pcm16 audio>"}))
        async for message in ws:
            event = json.loads(message)
            if event.get("type") == "conversation.item.input_audio_transcription.completed":
                print(event["transcript"], event.get("usage"))

asyncio.run(main())
```

## 传递 Gemini 特有参数
### 响应 schema
对 Google AI Studio 上的 Gemini 模型（例如 `{{gemini_pro}}`），LiteLLM 支持将 `response_schema` 作为参数传入。

**响应 Schema**
<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 
import os 

os.environ['GEMINI_API_KEY'] = ""

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]

response_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }


completion(
    model="gemini/{{gemini_pro}}", 
    messages=messages, 
    response_format={"type": "json_object", "response_schema": response_schema} # 👈 KEY CHANGE
    )

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 把模型加入 config.yaml
```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: gemini/{{gemini_pro}}
      api_key: os.environ/GEMINI_API_KEY
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
  "model": "{{gemini_pro}}",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object", "response_schema": { 
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }}
}
'
```

</TabItem>
</Tabs>

**校验 Schema**

要校验 response_schema，请设置 `enforce_validation: true`。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion, JSONSchemaValidationError
try: 
	completion(
    model="gemini/{{gemini_pro}}", 
    messages=messages, 
    response_format={
        "type": "json_object", 
        "response_schema": response_schema,
        "enforce_validation": true # 👈 KEY CHANGE
    }
	)
except JSONSchemaValidationError as e: 
	print("Raw Response: {}".format(e.raw_response))
	raise e
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 把模型加入 config.yaml
```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: gemini/{{gemini_pro}}
      api_key: os.environ/GEMINI_API_KEY
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
  "model": "{{gemini_pro}}",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object", "response_schema": { 
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }, 
    "enforce_validation": true
    }
}
'
```

</TabItem>
</Tabs>

LiteLLM 会对照 schema 校验响应，若响应不符合 schema，则抛出 `JSONSchemaValidationError`。

`JSONSchemaValidationError` 继承自 `openai.APIError`。

可通过 `e.raw_response` 获取原始响应。



### GenerationConfig 参数

要传入额外的 GenerationConfig 参数（例如 `topK`），只需在调用的请求体中直接写上即可，LiteLLM 会将它原样作为键值对透传到请求体中。

[**查看 Gemini GenerationConfigParams**](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import json
import os

os.environ['GEMINI_API_KEY'] = ""

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]

completion(
    model="gemini/{{gemini_pro}}",
    messages=messages,
    topK=1 # 👈 KEY CHANGE
)

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 在 config.yaml 中添加模型
```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: gemini/{{gemini_pro}}
      api_key: os.environ/GEMINI_API_KEY
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
  "model": "{{gemini_pro}}",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "topK": 1 # 👈 KEY CHANGE
}
'
```

</TabItem>
</Tabs>

**校验 Schema**

要校验 response_schema，请设置 `enforce_validation: true`。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion, JSONSchemaValidationError
try:
	completion(
    model="gemini/{{gemini_pro}}",
    messages=messages,
    response_format={
        "type": "json_object",
        "response_schema": response_schema,
        "enforce_validation": true # 👈 KEY CHANGE
    }
	)
except JSONSchemaValidationError as e:
	print("Raw Response: {}".format(e.raw_response))
	raise e
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 在 config.yaml 中添加模型
```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: gemini/{{gemini_pro}}
      api_key: os.environ/GEMINI_API_KEY
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
  "model": "{{gemini_pro}}",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object", "response_schema": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    },
    "enforce_validation": true
    }
}
'
```

</TabItem>
</Tabs>

## 指定安全设置
在某些场景下，你可能需要在调用模型时传入与默认值不同的[安全设置](https://ai.google.dev/docs/safety_setting_gemini)。为此，只需在 `completion` 或 `acompletion` 中传入 `safety_settings` 参数即可。例如：

```python
response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}],
    safety_settings=[
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE",
        },
    ]
)
```

## 工具调用

```python
from litellm import completion
import os
# set env
os.environ["GEMINI_API_KEY"] = ".."

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
    model="gemini/{{gemini_flash}}",
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

### Google 搜索工具

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

tools = [{"googleSearch": {}}] # 👈 ADD GOOGLE SEARCH

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml
```yaml
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理
```bash
$ litellm --config /path/to/config.yaml
```

3. 发起请求！
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{gemini_flash}}",
  "messages": [{"role": "user", "content": "What is the weather in San Francisco?"}],
  "tools": [{"googleSearch": {}}]
}
'
```

</TabItem>
</Tabs>

### 上下文回传（服务端工具组合）

上下文回传让 Gemini 3+ 模型能够在同一请求中，把**内置工具**（如 Google 搜索）与**你的自定义函数**结合使用。没有这一机制，当你试图同时使用两者时，Gemini 会直接报错。

启用后，Gemini 会在服务端执行 Google 搜索，再根据搜索结果决定是否调用你的自定义函数，并返回完整的推理链路。

**工作原理**：
1. 在传入 Google 搜索与你的函数工具的同时，传入 `include_server_side_tool_invocations=True`
2. Gemini 在内部执行服务端工具，并在返回 `functionCall` 部分的同时返回 `toolCall`/`toolResponse` 部分
3. LiteLLM 会把服务端调用提取到 `provider_specific_fields["server_side_tool_invocations"]` 中
4. 在后续轮次中，把完整的 assistant 消息加入对话历史即可，LiteLLM 会自动重新注入服务端部分

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What's the weather in Buenos Aires? If it's raining, schedule a meeting."}],
    tools=[
        {"type": "web_search_preview"},  # Google Search (server-side)
        {
            "type": "function",
            "function": {
                "name": "schedule_meeting",
                "description": "Schedule a meeting",
                "parameters": {
                    "type": "object",
                    "properties": {"reason": {"type": "string"}},
                    "required": ["reason"],
                },
            },
        },
    ],
    include_server_side_tool_invocations=True,
)

msg = response.choices[0].message

# Server-side tool results are in provider_specific_fields
psf = msg.provider_specific_fields or {}
for invocation in psf.get("server_side_tool_invocations", []):
    print(invocation["tool_type"])  # e.g. "GOOGLE_SEARCH_WEB"
    print(invocation["id"])
    print(invocation["args"])       # e.g. {"queries": ["weather Buenos Aires"]}
    print(invocation["response"])   # Search results from Google

# For multi-turn: just append the full message to history
messages.append(msg)
messages.append({"role": "user", "content": "Thanks!"})
# LiteLLM automatically re-injects the server-side parts + thought signatures
response2 = completion(
    model="gemini/{{gemini_flash}}",
    messages=messages,
    tools=tools,
    include_server_side_tool_invocations=True,
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml
```yaml
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理
```bash
$ litellm --config /path/to/config.yaml
```

3. 发起请求
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{gemini_flash}}",
  "messages": [{"role": "user", "content": "What is the weather in Buenos Aires?"}],
  "tools": [
    {"type": "web_search_preview"},
    {"type": "function", "function": {"name": "schedule_meeting", "description": "Schedule a meeting", "parameters": {"type": "object", "properties": {"reason": {"type": "string"}}}}}
  ],
  "include_server_side_tool_invocations": true
}'
```

</TabItem>
</Tabs>

:::info

- 上下文回传仅支持 **Gemini 3+** 模型
- 服务端工具调用（`toolCall`/`toolResponse`）**不会**出现在 `tool_calls` 中，而是放在 `provider_specific_fields["server_side_tool_invocations"]` 里，因为它们已由 Google 执行，并非出自你的代码
- 为保持多轮对话的连贯性，`thought_signatures` 会随服务端调用一起自动保留

:::

### URL 上下文

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

# 👇 ADD URL CONTEXT
tools = [{"urlContext": {}}]

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Summarize this document: https://ai.google.dev/gemini-api/docs/models"}],
    tools=tools,
)

print(response)

# Access URL context metadata
url_context_metadata = response.model_extra['vertex_ai_url_context_metadata']
urlMetadata = url_context_metadata[0]['urlMetadata'][0]
print(f"Retrieved URL: {urlMetadata['retrievedUrl']}")
print(f"Retrieval Status: {urlMetadata['urlRetrievalStatus']}")
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml
```yaml
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理
```bash
$ litellm --config /path/to/config.yaml
```

3. 发起请求！
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [{"role": "user", "content": "Summarize this document: https://ai.google.dev/gemini-api/docs/models"}],
    "tools": [{"urlContext": {}}]
  }'
```
</TabItem>
</Tabs>

### Google 搜索检索


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

tools = [{"googleSearch": {}}] # 👈 ADD GOOGLE SEARCH

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml
```yaml
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理
```bash
$ litellm --config /path/to/config.yaml
```

3. 发起请求！
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{gemini_flash}}",
  "messages": [{"role": "user", "content": "What is the weather in San Francisco?"}],
  "tools": [{"googleSearch": {}}]
}
'
```

</TabItem>
</Tabs>


### 代码执行工具


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

tools = [{"codeExecution": {}}] # 👈 ADD GOOGLE SEARCH

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml
```yaml
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理
```bash
$ litellm --config /path/to/config.yaml
```

3. 发起请求！
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{gemini_flash}}",
  "messages": [{"role": "user", "content": "What is the weather in San Francisco?"}],
  "tools": [{"codeExecution": {}}]
}
'
```

</TabItem>
</Tabs>


### Computer Use 工具

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

# Computer Use tool with browser environment
tools = [
    {
        "type": "computer_use",
        "environment": "browser",  # optional: "browser" or "unspecified"
        "excluded_predefined_functions": ["drag_and_drop"]  # optional
    }
]

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Navigate to google.com and search for 'LiteLLM'"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "data:image/png;base64,..."  # screenshot of current browser state
                }
            }
        ]
    }
]

response = completion(
    model="gemini/gemini-2.5-computer-use-preview-10-2025",
    messages=messages,
    tools=tools,
)

print(response)

# Handling tool responses with screenshots
# When the model makes a tool call, send the response back with a screenshot:
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]

    # Add assistant message with tool call
    messages.append(response.choices[0].message.model_dump())

    # Add tool response with screenshot
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": [
            {
                "type": "text",
                "text": '{"url": "https://example.com", "status": "completed"}'
            },
            {
                "type": "input_image",
                "image_url": "data:image/png;base64,..."  # New screenshot after action (Can send an image url as well, litellm handles the conversion)
            }
        ]
    })

    # Continue conversation with updated screenshot
    response = completion(
        model="gemini/gemini-2.5-computer-use-preview-10-2025",
        messages=messages,
        tools=tools,
    )
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy Server">

1. 在 config.yaml 中添加模型

```yaml
model_list:
  - model_name: gemini-computer-use
    litellm_params:
      model: gemini/gemini-2.5-computer-use-preview-10-2025
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 发起请求

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "gemini-computer-use",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Click on the search button"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/png;base64,..."
            }
          }
        ]
      }
    ],
    "tools": [
      {
        "type": "computer_use",
        "environment": "browser"
      }
    ]
  }'
```

**工具响应格式**：

在响应 Computer Use 工具调用时，需要附上 URL 与截图：

```json
{
  "role": "tool",
  "tool_call_id": "call_abc123",
  "content": [
    {
      "type": "text",
      "text": "{\"url\": \"https://example.com\", \"status\": \"completed\"}"
    },
    {
      "type": "input_image",
      "image_url": "data:image/png;base64,..."
    }
  ]
}
```
</TabItem>
</Tabs>


### 环境映射

| LiteLLM 输入 | Gemini API 值 |
|--------------|------------------|
| `"browser"` | `ENVIRONMENT_BROWSER` |
| `"unspecified"` | `ENVIRONMENT_UNSPECIFIED` |
| `ENVIRONMENT_BROWSER` | `ENVIRONMENT_BROWSER`（原样透传） |
| `ENVIRONMENT_UNSPECIFIED` | `ENVIRONMENT_UNSPECIFIED`（原样透传） |





## 思维签名

思维签名（thought signatures）是模型在对话中某一轮内部推理过程的加密表示。把思维签名随后续请求传回模型，相当于把它此前的思考上下文交还给它，使其能在此基础上继续推理，保持连贯的思路。

在多轮函数调用场景中，模型需要在多次工具调用之间保持上下文，此时思维签名尤为重要。

### 思维签名的工作原理

- **带签名的函数调用**：Gemini 返回函数调用时，会在响应中附带一个 `thought_signature`
- **自动保存**：LiteLLM 会自动提取思维签名，并存入工具调用的 `provider_specific_fields` 中
- **随对话历史返回**：当你在后续请求中带上带工具调用的助手消息时，LiteLLM 会自动保留这些思维签名并回传给 Gemini
- **并行函数调用**：一组并行调用中只有第一个函数调用带有思维签名
- **顺序函数调用**：多步序列中的每个函数调用都有自己的签名

### 启用思维签名

要启用思维签名，需要先开启思考/推理：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="gemini/{{gemini_flash}}",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=[...],
    reasoning_effort="low",  # Enable thinking to get thought signatures
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [{"role": "user", "content": "What'\''s the weather in Tokyo?"}],
    "tools": [...],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

### 结合思维签名的多轮函数调用

构建多轮函数调用的对话历史时，必须把之前响应中的思维签名一并带上。只要你把完整的助手消息追加进对话历史，LiteLLM 就会自动处理好这件事。

<Tabs>
<TabItem value="sdk" label="OpenAI 客户端">

```python
from openai import OpenAI
import json

client = OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://localhost:4000")

def get_current_temperature(location: str) -> dict:
    """Gets the current weather temperature for a given location."""
    return {"temperature": 30, "unit": "celsius"}

def set_thermostat_temperature(temperature: int) -> dict:
    """Sets the thermostat to a desired temperature."""
    return {"status": "success"}

get_weather_declaration = {
    "name": "get_current_temperature",
    "description": "Gets the current weather temperature for a given location.",
    "parameters": {
        "type": "object",
        "properties": {"location": {"type": "string"}},
        "required": ["location"],
    },
}

set_thermostat_declaration = {
    "name": "set_thermostat_temperature",
    "description": "Sets the thermostat to a desired temperature.",
    "parameters": {
        "type": "object",
        "properties": {"temperature": {"type": "integer"}},
        "required": ["temperature"],
    },
}

# Initial request
messages = [
    {"role": "user", "content": "If it's too hot or too cold in London, set the thermostat to a comfortable level."}
]

response = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=messages,
    tools=[get_weather_declaration, set_thermostat_declaration],
    reasoning_effort="low"
)

# Append the assistant's message (includes thought signatures automatically)
messages.append(response.choices[0].message)

# Execute tool calls and append results
for tool_call in response.choices[0].message.tool_calls:
    if tool_call.function.name == "get_current_temperature":
        result = get_current_temperature(**json.loads(tool_call.function.arguments))
        messages.append({
            "role": "tool",
            "content": json.dumps(result),
            "tool_call_id": tool_call.id
        })

# Second request - thought signatures are automatically preserved
response2 = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=messages,
    tools=[get_weather_declaration, set_thermostat_declaration],
    reasoning_effort="low"
)

print(response2.choices[0].message.content)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
# Step 1: Initial request
curl --location 'http://localhost:4000/v1/chat/completions' \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --data '{
    "model": "{{gemini_flash}}",
    "messages": [
      {
        "role": "user",
        "content": "If it'\''s too hot or too cold in London, set the thermostat to a comfortable level."
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_current_temperature",
          "description": "Gets the current weather temperature for a given location.",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            },
            "required": ["location"]
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "set_thermostat_temperature",
          "description": "Sets the thermostat to a desired temperature.",
          "parameters": {
            "type": "object",
            "properties": {
              "temperature": {"type": "integer"}
            },
            "required": ["temperature"]
          }
        }
      }
    ],
    "tool_choice": "auto",
    "reasoning_effort": "low"
  }'
```

响应中的工具调用会在 `provider_specific_fields` 里带上思维签名：

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_current_temperature",
          "arguments": "{\"location\": \"London\"}"
        },
        "index": 0,
        "provider_specific_fields": {
          "thought_signature": "CpcHAdHtim9+q4rstcbvQC0ic4x1/vqQlCJWgE+UZ6dTLYGHMMBkF/AxqL5UmP6SY46uYC8t4BTFiXG5zkw6EMJ...=="
        }
      }]
    }
  }]
}
```

```bash
# Step 2: Follow-up request with tool response
# Include the assistant message from Step 1 (with thought signatures in provider_specific_fields)
curl --location 'http://localhost:4000/v1/chat/completions' \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --data '{
    "model": "{{gemini_flash}}",
    "messages": [
      {
        "role": "user",
        "content": "If it'\''s too hot or too cold in London, set the thermostat to a comfortable level."
      },
      {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_c130b9f8c2c042e9b65e39a88245",
            "type": "function",
            "function": {
              "name": "get_current_temperature",
              "arguments": "{\"location\": \"London\"}"
            },
            "index": 0,
            "provider_specific_fields": {
              "thought_signature": "CpcHAdHtim9+q4rstcbvQC0ic4x1/vqQlCJWgE+UZ6dTLYGHMMBkF/AxqL5UmP6SY46uYC8t4BTFiXG5zkw6EMJ...=="
            }
          }
        ]
      },
      {
        "role": "tool",
        "content": "{\"temperature\": 30, \"unit\": \"celsius\"}",
        "tool_call_id": "call_c130b9f8c2c042e9b65e39a88245"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_current_temperature",
          "description": "Gets the current weather temperature for a given location.",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            },
            "required": ["location"]
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "set_thermostat_temperature",
          "description": "Sets the thermostat to a desired temperature.",
          "parameters": {
            "type": "object",
            "properties": {
              "temperature": {"type": "integer"}
            },
            "required": ["temperature"]
          }
        }
      }
    ],
    "tool_choice": "auto",
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

### 重要说明

1. **自动处理**：LiteLLM 会自动从 Gemini 响应中提取思维签名，并在你把助手消息放进对话历史时原样保留。无需手动提取或管理。

2. **并行函数调用**：模型发起并行函数调用时，只有第一个函数调用会带思维签名，后续的并行调用则没有。

3. **顺序函数调用**：在多步函数调用场景中，每一步的第一个函数调用都带有各自的思维签名，必须予以保留。

4. **上下文所必需**：思维签名是在带函数调用的多轮对话中维持推理上下文的关键，缺少它，模型可能丢失之前的推理脉络。

5. **存储格式**：思维签名存放在响应中工具调用的 `provider_specific_fields.thought_signature` 里；把助手消息追加进对话历史时会自动带上。

6. **对话补全客户端**：对于无法控制上一条助手消息是否原样传入的对话补全客户端（如 langchain 的 ChatOpenAI），LiteLLM 还会把思维签名附加到工具调用 id 中（`call_123__thought__<thought-signature>`），并在向 Gemini 发出请求前再把它提取出来。

## JSON 模式

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 
import os 

os.environ['GEMINI_API_KEY'] = ""

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]



completion(
    model="gemini/{{gemini_pro}}", 
    messages=messages, 
    response_format={"type": "json_object"} # 👈 KEY CHANGE
)

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 在 config.yaml 中添加模型
```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: gemini/{{gemini_pro}}
      api_key: os.environ/GEMINI_API_KEY
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
  "model": "{{gemini_pro}}",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object"}
}
'
```

</TabItem>
</Tabs>
## Gemini-Pro-Vision
LiteLLM 支持在 `url` 中传入以下几类图像：
- 直接链接的图片 - https://storage.googleapis.com/github-repo/img/gemini/intro/landmark3.jpg
- 本地存储的图片 - ./localimage.jpeg

## 图像与视频的媒体分辨率控制

LiteLLM 支持 OpenAI 的 `detail` 参数，用于指定 Gemini 模型处理图像时的分辨率。不同 Gemini 版本的行为有所差异：

| Gemini 版本 | 分辨率控制 | 行为 |
|----------------|-------------------|----------|
| Gemini 3+ | 逐条设置 | 每张图片/每段视频都可以有各自的 `detail` 设置 |
| Gemini 2.x (2.0, 2.5) | 全局生效 | 取所有图片中最高的 `detail`，并通过 `generationConfig` 中的 `mediaResolution` 全局应用 |

**支持的 `detail` 取值：**
- `"low"` - 映射到 `MEDIA_RESOLUTION_LOW`（图像 280 token，视频每帧 70 token）
- `"medium"` - 映射到 `MEDIA_RESOLUTION_MEDIUM`
- `"high"` - 映射到 `MEDIA_RESOLUTION_HIGH`（图像 1120 token）
- `"ultra_high"` - 映射到 `MEDIA_RESOLUTION_ULTRA_HIGH`
- `"auto"` 或 `None` - 由模型自行决定最佳分辨率（未设置 `media_resolution`）

**用法示例：**

<Tabs>
<TabItem value="images" label="图像">

```python
from litellm import completion

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://example.com/chart.png",
                    "detail": "high"  # High resolution for detailed chart analysis
                }
            },
            {
                "type": "text",
                "text": "Analyze this chart"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://example.com/icon.png",
                    "detail": "low"  # Low resolution for simple icon
                }
            }
        ]
    }
]

# Works with both Gemini 2.x and 3+
response = completion(
    model="gemini/{{gemini_flash}}",  # or {{gemini_pro}}
    messages=messages,
)
```

</TabItem>
<TabItem value="videos" label="视频文件">

```python
from litellm import completion

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Analyze this video"
            },
            {
                "type": "file",
                "file": {
                    "file_id": "gs://my-bucket/video.mp4",
                    "format": "video/mp4",
                    "detail": "high"  # High resolution for detailed video analysis
                }
            }
        ]
    }
]

response = completion(
    model="gemini/{{gemini_pro}}",
    messages=messages,
)
```

</TabItem>
</Tabs>

:::info
**Gemini 3+ 逐条分辨率**：每张图片或每段视频都可以单独设置 `detail`，因此可以在同一请求中混用不同分辨率（例如高清图表搭配低清图标）。`image_url` 和 `file` 两种内容类型均支持。

**Gemini 2.x 全局分辨率**：当多张图片的 `detail` 取值不同时，LiteLLM 会取其中最高分辨率，并通过 `generationConfig` 中的 `mediaResolution` 全局应用（例如一张图片为 `"low"`、另一张为 `"high"`，则所有图片都会按 `"high"` 处理）。
:::

## 视频元数据控制

LiteLLM 通过 `video_metadata` 字段为所有 Gemini 模型（2.x 和 3+）提供细粒度的视频处理控制，可以指定视频分析的抽帧速率和时间范围。只有通过 `detail` 设置的逐条 `media_resolution` 才限于 Gemini 3+

**支持的 `video_metadata` 参数：**

| 参数 | 类型 | 说明 | 示例 |
|-----------|------|-------------|---------|
| `fps` | Number | 抽帧速率（每秒帧数） | `5` |
| `start_offset` | String | 视频片段处理的起始时间 | `"10s"` |
| `end_offset` | String | 视频片段处理的结束时间 | `"60s"` |

:::note
**字段名转换**：LiteLLM 会自动把 snake_case 字段名转换成 Gemini API 所需的 camelCase：
- `start_offset` → `startOffset`
- `end_offset` → `endOffset`
- `fps` 保持不变
:::

:::warning
- **建议用于视频文件**：`video_metadata` 面向视频文件设计，其他媒体类型的错误处理交由 Vertex AI API 负责
- **支持的文件格式**：支持 `gs://`、`https://` 以及 base64 编码的视频文件
:::

**用法示例：**

<Tabs>
<TabItem value="basic" label="基础视频元数据">

```python
from litellm import completion

response = completion(
    model="gemini/{{gemini_pro}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Analyze this video clip"},
                {
                    "type": "file",
                    "file": {
                        "file_id": "gs://my-bucket/video.mp4",
                        "format": "video/mp4",
                        "video_metadata": {
                            "fps": 5,               # Extract 5 frames per second
                            "start_offset": "10s",  # Start from 10 seconds
                            "end_offset": "60s"     # End at 60 seconds
                        }
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="combined" label="结合 detail 参数">

```python
from litellm import completion

response = completion(
    model="gemini/{{gemini_pro}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Provide detailed analysis of this video segment"},
                {
                    "type": "file",
                    "file": {
                        "file_id": "https://example.com/presentation.mp4",
                        "format": "video/mp4",
                        "detail": "high",  # High resolution for detailed analysis
                        "video_metadata": {
                            "fps": 10,              # Extract 10 frames per second
                            "start_offset": "30s",  # Start from 30 seconds
                            "end_offset": "90s"     # End at 90 seconds
                        }
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: {{gemini_pro}}
    litellm_params:
      model: gemini/{{gemini_pro}}
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 发起请求

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{gemini_pro}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Analyze this video clip"},
          {
            "type": "file",
            "file": {
              "file_id": "gs://my-bucket/video.mp4",
              "format": "video/mp4",
              "detail": "high",
              "video_metadata": {
                "fps": 5,
                "start_offset": "10s",
                "end_offset": "60s"
              }
            }
          }
        ]
      }
    ]
  }'
```

</TabItem>
</Tabs>

## 使用示例
```python
import os
import litellm
from dotenv import load_dotenv

# Load the environment variables from .env file
load_dotenv()
os.environ["GEMINI_API_KEY"] = os.getenv('GEMINI_API_KEY')

prompt = 'Describe the image in a few sentences.'
# Note: You can pass here the URL or Path of image directly.
image_url = 'https://storage.googleapis.com/github-repo/img/gemini/intro/landmark3.jpg'

# Create the messages payload according to the documentation
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": prompt
            },
            {
                "type": "image_url",
                "image_url": {"url": image_url}
            }
        ]
    }
]

# Make the API call to Gemini model
response = litellm.completion(
    model="gemini/{{gemini_pro}}",
    messages=messages,
)

# Extract the response content
content = response.get('choices', [{}])[0].get('message', {}).get('content')

# Print the result
print(content)
```

## gemini-robotics-er-1.5-preview 用法

```python
from litellm import api_base
from openai import OpenAI
import os
import base64

client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-<your-litellm-api-key>")
base64_image = base64.b64encode(open("closeup-object-on-table-many-260nw-1216144471.webp", "rb").read()).decode()

import json
import re
tools = [{"codeExecution": {}}] 
response = client.chat.completions.create(
    model="gemini/gemini-robotics-er-1.5-preview",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Point to no more than 10 items in the image. The label returned should be an identifying name for the object detected. The answer should follow the json format: [{\"point\": [y, x], \"label\": <label1>}, ...]. The points are in [y, x] format normalized to 0-1000."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                }
            ]
        }
    ],
    tools=tools
)

# Extract JSON from markdown code block if present
content = response.choices[0].message.content
# Look for triple-backtick JSON block
match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
if match:
    json_str = match.group(1)
else:
    json_str = content

try:
    data = json.loads(json_str)
    print(json.dumps(data, indent=2))
except Exception as e:
    print("Error parsing response as JSON:", e)
    print("Response content:", content)
```

## 用法：PDF、视频等文件

### 内联数据（如音频流）

LiteLLM 遵循 OpenAI 格式，支持以 base64 编码字符串的形式发送内联数据。

需要遵循的格式如下：

```text
data:<mime_type>;base64,<encoded_data>
```

**LITELLM 调用**

```python
import litellm
from pathlib import Path
import base64
import os

os.environ["GEMINI_API_KEY"] = "" 

litellm.set_verbose = True # 👈 See Raw call 

audio_bytes = Path("speech_vertex.mp3").read_bytes()
encoded_data = base64.b64encode(audio_bytes).decode("utf-8")
print("Audio Bytes = {}".format(audio_bytes))
model = "gemini/{{gemini_flash}}"
response = litellm.completion(
    model=model,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please summarize the audio."},
                {
                    "type": "file",
                    "file": {
                        "file_data": "data:audio/mp3;base64,{}".format(encoded_data), # 👈 SET MIME_TYPE + DATA
                    }
                },
            ],
        }
    ],
)
```

**等价的 GOOGLE API 调用** 

```python
# Initialize a Gemini model appropriate for your use case.
model = genai.GenerativeModel('models/{{gemini_flash}}')

# Create the prompt.
prompt = "Please summarize the audio."

# Load the samplesmall.mp3 file into a Python Blob object containing the audio
# file's bytes and then pass the prompt and the audio to Gemini.
response = model.generate_content([
    prompt,
    {
        "mime_type": "audio/mp3",
        "data": pathlib.Path('samplesmall.mp3').read_bytes()
    }
])

# Output Gemini's response to the prompt and the inline audio.
print(response.text)
```

### https:// 文件

```python
import litellm
import os

os.environ["GEMINI_API_KEY"] = "" 

litellm.set_verbose = True # 👈 See Raw call 

model = "gemini/{{gemini_flash}}"
response = litellm.completion(
    model=model,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please summarize the file."},
                {
                    "type": "file",
                    "file": {
                        "file_id": "https://storage...", # 👈 SET THE IMG URL
                        "format": "application/pdf" # OPTIONAL
                    }
                },
            ],
        }
    ],
)
```

### gs:// 文件 

```python
import litellm
import os

os.environ["GEMINI_API_KEY"] = "" 

litellm.set_verbose = True # 👈 See Raw call 

model = "gemini/{{gemini_flash}}"
response = litellm.completion(
    model=model,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please summarize the file."},
                {
                    "type": "file",
                    "file": {
                        "file_id": "gs://storage...", # 👈 SET THE IMG URL
                        "format": "application/pdf" # OPTIONAL
                    }
                },
            ],
        }
    ],
)
```


## 对话模型
:::tip

**我们支持所有 Gemini 模型，只需在发送 litellm 请求时，把 `model=gemini/<any-model-on-gemini>` 作为模型名前缀即可**

:::
| 模型名称            | 函数调用                                          | 所需环境变量          |
|-----------------------|--------------------------------------------------------|--------------------------------|
| gemini-pro            | `completion(model='gemini/gemini-pro', messages)`            | `os.environ['GEMINI_API_KEY']` |
| gemini-1.5-pro-latest | `completion(model='gemini/gemini-1.5-pro-latest', messages)` | `os.environ['GEMINI_API_KEY']` |
| gemini-2.0-flash     | `completion(model='gemini/gemini-2.0-flash', messages)`     | `os.environ['GEMINI_API_KEY']` |
| gemini-2.0-flash-exp     | `completion(model='gemini/gemini-2.0-flash-exp', messages)`     | `os.environ['GEMINI_API_KEY']` |
| gemini-2.0-flash-lite-preview-02-05	     | `completion(model='gemini/gemini-2.0-flash-lite-preview-02-05', messages)`     | `os.environ['GEMINI_API_KEY']` |
| gemini-2.5-flash-preview-09-2025     | `completion(model='gemini/gemini-2.5-flash-preview-09-2025', messages)`     | `os.environ['GEMINI_API_KEY']` |
| gemini-2.5-flash-lite-preview-09-2025     | `completion(model='gemini/gemini-2.5-flash-lite-preview-09-2025', messages)`     | `os.environ['GEMINI_API_KEY']` |
| gemini-3.1-flash-lite-preview     | `completion(model='gemini/gemini-3.1-flash-lite-preview', messages)`     | `os.environ['GEMINI_API_KEY']` |
| gemini-flash-latest     | `completion(model='gemini/gemini-flash-latest', messages)`     | `os.environ['GEMINI_API_KEY']` |
| gemini-flash-lite-latest     | `completion(model='gemini/gemini-flash-lite-latest', messages)`     | `os.environ['GEMINI_API_KEY']` |



## 上下文缓存

支持使用 Google AI Studio 的上下文缓存（context caching），只需在消息内容块中加入如下标记：

```bash
{
    {
        "role": "system",
        "content": ...,
        "cache_control": {"type": "ephemeral"} # 👈 KEY CHANGE
    },
    ...
}
```

### 自定义 TTL 支持

现在可以通过 `ttl` 参数为缓存内容指定自定义的存活时间（Time-To-Live，TTL）：

```bash
{
    {
        "role": "system",
        "content": ...,
        "cache_control": {
            "type": "ephemeral",
            "ttl": "3600s"  # 👈 Cache for 1 hour
        }
    },
    ...
}
```

**TTL 格式要求**：
- 必须是字符串，以 's' 结尾表示秒
- 必须包含正数（可以是小数）
- 示例："3600s"（1 小时）、"7200s"（2 小时）、"1800s"（30 分钟）、"1.5s"（1.5 秒）

**TTL 行为规则**：
- 如果多条缓存消息带有不同的 TTL，会采用遇到的第一个有效 TTL
- 格式无效的 TTL 会被忽略，缓存将使用 Google 的默认过期时间
- 未指定 TTL 时，适用 Google 默认的缓存过期时间（约 1 小时）

### 架构图

<Image img={require('../../img/gemini_context_caching.png')} />

**说明**：

- [相关代码](https://github.com/BerriAI/litellm/blob/main/litellm/llms/vertex_ai/context_caching/vertex_ai_context_caching.py#L255)

- Gemini 上下文缓存只允许缓存 1 段连续的消息块。

- 如果多个不连续的消息块都包含 `cache_control`，则只会使用第一个连续块（以 Gemini 格式发送到 `/cachedContent`，参见 [Gemini 格式文档](https://ai.google.dev/api/caching#cache_create-SHELL)）。

- 发送给 Gemini `/generateContent` 端点的原始请求如下：

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/{{gemini_flash}}:generateContent?key=$GOOGLE_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
      "contents": [
        {
          "parts":[{
            "text": "Please summarize this transcript"
          }],
          "role": "user"
        },
      ],
      "cachedContent": "'$CACHE_NAME'"
    }'

```

### 用法示例

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 

for _ in range(2): 
    resp = completion(
        model="gemini/{{gemini_pro}}",
        messages=[
        # System Message
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement" * 4000,
                        "cache_control": {"type": "ephemeral"}, # 👈 KEY CHANGE
                    }
                ],
            },
            # marked for caching with the cache_control parameter, so that this checkpoint can read from the previous cache.
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
            }]
    )

    print(resp.usage) # 👈 2nd usage block will be less, since cached tokens used
```

</TabItem>
<TabItem value="sdk-ttl" label="SDK 自定义 TTL">

```python
from litellm import completion 

# Cache for 2 hours (7200 seconds)
resp = completion(
    model="gemini/{{gemini_pro}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 4000,
                    "cache_control": {
                        "type": "ephemeral", 
                        "ttl": "7200s"  # 👈 Cache for 2 hours
                    },
                }
            ],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "3600s"  # 👈 This TTL will be ignored (first one is used)
                    },
                }
            ],
        }
    ]
)

print(resp.usage)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: {{gemini_pro}}
      litellm_params:
        model: gemini/{{gemini_pro}}
        api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理 

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！ 

[**查看 Langchain、OpenAI JS、Llamaindex 等示例**](../proxy/user_keys.md#请求格式)

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{gemini_pro}}",
    "messages": [
        # System Message
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement" * 4000,
                        "cache_control": {"type": "ephemeral"}, # 👈 KEY CHANGE
                    }
                ],
            },
            # marked for caching with the cache_control parameter, so that this checkpoint can read from the previous cache.
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the key terms and conditions in this agreement?",
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
            }],
}'
```
</TabItem>
<TabItem value="curl-ttl" label="Curl 自定义 TTL">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{gemini_pro}}",
    "messages": [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 4000,
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "7200s"
                    }
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "3600s"
                    }
                }
            ]
        }
    ]
}'
```
</TabItem>
<TabItem value="openai-python" label="OpenAI Python SDK">

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)


response = await client.chat.completions.create(
    model="{{gemini_pro}}",
    messages=[
        {
            "role": "system",
            "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement" * 4000,
                        "cache_control": {"type": "ephemeral"}, # 👈 KEY CHANGE
                    }
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

```

</TabItem>
<TabItem value="openai-python-ttl" label="OpenAI Python SDK（含 TTL）">

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)

response = await client.chat.completions.create(
    model="{{gemini_pro}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 4000,
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "7200s"  # Cache for 2 hours
                    }
                }
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>

## 图像生成

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 

response = completion(
    model="gemini/gemini-2.0-flash-exp-image-generation",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    modalities=["image", "text"],
)
assert response.choices[0].message.content is not None # "data:image/png;base64,e4rr.."
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: gemini-2.0-flash-exp-image-generation
    litellm_params:
      model: gemini/gemini-2.0-flash-exp-image-generation
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl -L -X POST 'http://localhost:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "gemini-2.0-flash-exp-image-generation",
    "messages": [{"role": "user", "content": "Generate an image of a cat"}],
    "modalities": ["image", "text"]
}'
```

</TabItem>
</Tabs>

### 图像生成定价

Gemini 图像生成模型（如 `gemini-3-pro-image-preview`）会在响应的用量信息中返回 `image_tokens`，这类 Token 的计价与文本 Token 不同：

| Token 类型 | 每 100 万 Token 价格 | 每 Token 价格 |
|------------|---------------------|-----------------|
| 文本输出 | $12 | $0.000012 |
| 图像输出 | $120 | $0.00012 |

图像 Token 的数量取决于输出分辨率：

| 分辨率 | 每张图像的 Token 数 | 每张图像的成本 |
|------------|------------------|----------------|
| 1K-2K（1024x1024 到 2048x2048） | 1,120 | $0.134 |
| 4K（4096x4096） | 2,000 | $0.24 |

LiteLLM 会使用模型定价配置中的 `output_cost_per_image_token` 自动计算成本。

**响应用量示例**：
```json
{
    "completion_tokens_details": {
        "reasoning_tokens": 225,
        "text_tokens": 0,
        "image_tokens": 1120
    }
}
```

更多细节参见 [Google 的 Gemini 定价文档](https://ai.google.dev/gemini-api/docs/pricing)。
