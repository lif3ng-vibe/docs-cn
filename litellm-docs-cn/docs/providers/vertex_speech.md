import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI 文本转语音

| 属性 | 说明 |
|-------|-------|
| 描述 | Google Cloud 文本转语音（Text-to-Speech），支持 Chirp3 HD 音色与 Gemini TTS |
| LiteLLM 中的提供商路由 | `vertex_ai/chirp`（Chirp）、`vertex_ai/gemini-*-tts`（Gemini） |

## Chirp3 HD 音色

提供高质量 Chirp3 HD 音色的 Google Cloud 文本转语音 API。

### 快速上手

#### LiteLLM Python SDK

```python showLineNumbers title="Chirp3 Quick Start"
from litellm import speech
from pathlib import Path

speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
    model="vertex_ai/chirp",
    voice="alloy",  # OpenAI voice name - automatically mapped
    input="Hello, this is Vertex AI Text to Speech",
    vertex_project="your-project-id",
    vertex_location="us-central1",
)
response.stream_to_file(speech_file_path)
```

#### LiteLLM AI 网关

**1. 配置 config.yaml**

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: vertex-tts
    litellm_params:
      model: vertex_ai/chirp
      vertex_project: "your-project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
```

**2. 启动代理**

```bash title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml
```

**3. 发起请求**

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Chirp3 Quick Start"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "voice": "alloy",
    "input": "Hello, this is Vertex AI Text to Speech"
  }' \
  --output speech.mp3
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Chirp3 Quick Start"
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.audio.speech.create(
    model="vertex-tts",
    voice="alloy",
    input="Hello, this is Vertex AI Text to Speech",
)
response.stream_to_file("speech.mp3")
```

</TabItem>
</Tabs>

### 音色映射

LiteLLM 会将 OpenAI 音色名称映射为 Google Cloud 音色。你既可以使用 OpenAI 音色，也可以直接使用 Google Cloud 音色。

| OpenAI 音色 | Google Cloud 音色 |
|-------------|-------------------|
| `alloy` | en-US-Studio-O |
| `echo` | en-US-Studio-M |
| `fable` | en-GB-Studio-B |
| `onyx` | en-US-Wavenet-D |
| `nova` | en-US-Studio-O |
| `shimmer` | en-US-Wavenet-F |

### 直接使用 Google Cloud 音色

#### LiteLLM Python SDK

```python showLineNumbers title="Chirp3 HD Voice"
from litellm import speech

# Pass Chirp3 HD voice name directly
response = speech(
    model="vertex_ai/chirp",
    voice="en-US-Chirp3-HD-Charon",
    input="Hello with a Chirp3 HD voice",
    vertex_project="your-project-id",
)
response.stream_to_file("speech.mp3")
```

```python showLineNumbers title="Voice as Dict (Multilingual)"
from litellm import speech

# Pass as dict for full control over language and voice
response = speech(
    model="vertex_ai/chirp",
    voice={
        "languageCode": "de-DE",
        "name": "de-DE-Chirp3-HD-Charon",
    },
    input="Hallo, dies ist ein Test",
    vertex_project="your-project-id",
)
response.stream_to_file("speech.mp3")
```

#### LiteLLM AI 网关

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Chirp3 HD Voice"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "voice": "en-US-Chirp3-HD-Charon",
    "input": "Hello with a Chirp3 HD voice"
  }' \
  --output speech.mp3
```

```bash showLineNumbers title="Voice as Dict (Multilingual)"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "voice": {"languageCode": "de-DE", "name": "de-DE-Chirp3-HD-Charon"},
    "input": "Hallo, dies ist ein Test"
  }' \
  --output speech.mp3
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Chirp3 HD Voice"
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.audio.speech.create(
    model="vertex-tts",
    voice="en-US-Chirp3-HD-Charon",
    input="Hello with a Chirp3 HD voice",
)
response.stream_to_file("speech.mp3")
```

```python showLineNumbers title="Voice as Dict (Multilingual)"
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.audio.speech.create(
    model="vertex-tts",
    voice={"languageCode": "de-DE", "name": "de-DE-Chirp3-HD-Charon"},
    input="Hallo, dies ist ein Test",
)
response.stream_to_file("speech.mp3")
```

</TabItem>
</Tabs>

浏览可用音色：[Google Cloud Text-to-Speech 控制台](https://console.cloud.google.com/vertex-ai/generative/speech/text-to-speech)

### 传入原始 SSML

当输入中包含 `<speak>` 标签时，LiteLLM 会自动识别为 SSML 并原样透传。

#### LiteLLM Python SDK

```python showLineNumbers title="SSML Input"
from litellm import speech

ssml = """
<speak>
    <p>Hello, world!</p>
    <p>This is a test of the <break strength="medium" /> text-to-speech API.</p>
</speak>
"""

response = speech(
    model="vertex_ai/chirp",
    voice="en-US-Studio-O",
    input=ssml,  # Auto-detected as SSML
    vertex_project="your-project-id",
)
response.stream_to_file("speech.mp3")
```

```python showLineNumbers title="Force SSML Mode"
from litellm import speech

# Force SSML mode with use_ssml=True
response = speech(
    model="vertex_ai/chirp",
    voice="en-US-Studio-O",
    input="<speak><prosody rate='slow'>Speaking slowly</prosody></speak>",
    use_ssml=True,
    vertex_project="your-project-id",
)
response.stream_to_file("speech.mp3")
```

#### LiteLLM AI 网关

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="SSML Input"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "voice": "en-US-Studio-O",
    "input": "<speak><p>Hello!</p><break time=\"500ms\"/><p>How are you?</p></speak>"
  }' \
  --output speech.mp3
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="SSML Input"
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

ssml = """<speak><p>Hello!</p><break time="500ms"/><p>How are you?</p></speak>"""

response = client.audio.speech.create(
    model="vertex-tts",
    voice="en-US-Studio-O",
    input=ssml,
)
response.stream_to_file("speech.mp3")
```

</TabItem>
</Tabs>

### 支持的参数

| 参数 | 说明 | 取值 |
|-----------|-------------|--------|
| `voice` | 音色选择 | OpenAI voice, Google Cloud voice name, or dict |
| `input` | 待转换的文本 | Plain text or SSML |
| `speed` | 语速 | 0.25 to 4.0 (default: 1.0) |
| `response_format` | 音频格式 | `mp3`, `opus`, `wav`, `pcm`, `flac` |
| `use_ssml` | 强制 SSML 模式 | `True` / `False` |

### 异步用法

```python showLineNumbers title="Async Speech Generation"
import asyncio
from litellm import aspeech

async def main():
    response = await aspeech(
        model="vertex_ai/chirp",
        voice="alloy",
        input="Hello from async",
        vertex_project="your-project-id",
    )
    response.stream_to_file("speech.mp3")

asyncio.run(main())
```

---

## Gemini TTS

通过对话补全（chat completions）API 使用具备音频输出能力的 Gemini 模型。

上文的音色映射表仅适用于 Chirp。对于 Gemini TTS，可传入 `Kore` 这类 Gemini 预置音色名称；从 v1.107.0 起，也支持传入 OpenAI 音色名称，系统会按 [Gemini 提供商文档](./gemini#音色名称)中的列表将其映射为对应的 Gemini 音色。

:::warning
**限制**：
- 仅支持 `pcm16` 音频格式
- 暂不支持流式
- 必须设置 `modalities: ["audio"]`
- 通过 LiteLLM 代理使用时，必须在请求体中加入 `"allowed_openai_params": ["audio", "modalities"]` 才能启用音频相关参数
:::

### 快速上手

#### LiteLLM Python SDK

```python showLineNumbers title="Gemini TTS Quick Start"
from litellm import completion
import json

# Load credentials
with open('path/to/service_account.json', 'r') as file:
    vertex_credentials = json.dumps(json.load(file))

response = completion(
    model="vertex_ai/gemini-2.5-flash-preview-tts",
    messages=[{"role": "user", "content": "Say hello in a friendly voice"}],
    modalities=["audio"],
    audio={
        "voice": "Kore",
        "format": "pcm16"
    },
    vertex_credentials=vertex_credentials
)
print(response)
```

#### LiteLLM AI 网关

**1. 配置 config.yaml**

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-tts
    litellm_params:
      model: vertex_ai/gemini-2.5-flash-preview-tts
      vertex_project: "your-project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
```

**2. 启动代理**

```bash title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml
```

**3. 发起请求**

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Gemini TTS Request"
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "gemini-tts",
    "messages": [{"role": "user", "content": "Say hello in a friendly voice"}],
    "modalities": ["audio"],
    "audio": {"voice": "Kore", "format": "pcm16"},
    "allowed_openai_params": ["audio", "modalities"]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Gemini TTS Request"
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.chat.completions.create(
    model="gemini-tts",
    messages=[{"role": "user", "content": "Say hello in a friendly voice"}],
    modalities=["audio"],
    audio={"voice": "Kore", "format": "pcm16"},
    extra_body={"allowed_openai_params": ["audio", "modalities"]}
)
print(response)
```

</TabItem>
</Tabs>

### 支持的模型

- `vertex_ai/gemini-2.5-flash-preview-tts`
- `vertex_ai/gemini-2.5-pro-preview-tts`

可用音色请参阅 [Gemini TTS 文档](https://ai.google.dev/gemini-api/docs/speech-generation)。

### 高级用法

```python showLineNumbers title="Gemini TTS with System Prompt"
from litellm import completion

response = completion(
    model="vertex_ai/gemini-2.5-pro-preview-tts",
    messages=[
        {"role": "system", "content": "You are a helpful assistant that speaks clearly."},
        {"role": "user", "content": "Explain quantum computing in simple terms"}
    ],
    modalities=["audio"],
    audio={"voice": "Charon", "format": "pcm16"},
    temperature=0.7,
    max_tokens=150,
    vertex_credentials=vertex_credentials
)
```
