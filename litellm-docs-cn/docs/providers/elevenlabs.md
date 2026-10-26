import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ElevenLabs

ElevenLabs 提供高质量的 AI 语音技术，包括通过其转写（transcription）API 实现的语音转文本能力。

| 属性 | 详情 |
|----------|---------|
| 描述 | ElevenLabs 提供先进的 AI 语音技术，涵盖语音转文本转写与文本转语音能力，支持多种语言和说话人分离（speaker diarization）。 |
| LiteLLM 中的提供商路由 | `elevenlabs/` |
| 提供商文档 | [ElevenLabs API ↗](https://elevenlabs.io/docs/api-reference) |
| 支持的端点 | `/audio/transcriptions`, `/audio/speech` |

## 快速上手

### LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="基础用法">

```python showLineNumbers title="Basic audio transcription with ElevenLabs"
import litellm

# Transcribe audio file
with open("audio.mp3", "rb") as audio_file:
    response = litellm.transcription(
        model="elevenlabs/scribe_v1",
        file=audio_file,
        api_key="your-elevenlabs-api-key"  # or set ELEVENLABS_API_KEY env var
    )

print(response.text)
```

</TabItem>

<TabItem value="advanced" label="高级功能">

```python showLineNumbers title="Audio transcription with advanced features"
import litellm

# Transcribe with speaker diarization and language specification
with open("audio.wav", "rb") as audio_file:
    response = litellm.transcription(
        model="elevenlabs/scribe_v1",
        file=audio_file,
        language="en",           # Language hint (maps to language_code)
        temperature=0.3,         # Control randomness in transcription
        diarize=True,           # Enable speaker diarization
        api_key="your-elevenlabs-api-key"
    )

print(f"Transcription: {response.text}")
print(f"Language: {response.language}")

# Access word-level timestamps if available
if hasattr(response, 'words') and response.words:
    for word_info in response.words:
        print(f"Word: {word_info['word']}, Start: {word_info['start']}, End: {word_info['end']}")
```

</TabItem>

<TabItem value="async" label="异步用法">

```python showLineNumbers title="Async audio transcription"
import litellm
import asyncio

async def transcribe_audio():
    with open("audio.mp3", "rb") as audio_file:
        response = await litellm.atranscription(
            model="elevenlabs/scribe_v1",
            file=audio_file,
            api_key="your-elevenlabs-api-key"
        )
    
    return response.text

# Run async transcription
result = asyncio.run(transcribe_audio())
print(result)
```

</TabItem>
</Tabs>

### LiteLLM 代理

#### 1. 配置代理

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="ElevenLabs configuration in config.yaml"
model_list:
  - model_name: elevenlabs-transcription
    litellm_params:
      model: elevenlabs/scribe_v1
      api_key: os.environ/ELEVENLABS_API_KEY

general_settings:
  master_key: your-master-key
```

</TabItem>

<TabItem value="env-vars" label="环境变量">

```bash showLineNumbers title="Required environment variables"
export ELEVENLABS_API_KEY="your-elevenlabs-api-key"
export LITELLM_MASTER_KEY="your-master-key"
```

</TabItem>
</Tabs>

#### 2. 启动代理

```bash showLineNumbers title="Start LiteLLM proxy server"
litellm --config config.yaml

# Proxy will be available at http://localhost:4000
```

#### 3. 发起转写请求

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Audio transcription with curl"
curl http://localhost:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@audio.mp3" \
  -F model="elevenlabs-transcription" \
  -F language="en" \
  -F temperature="0.3"
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Using OpenAI SDK with LiteLLM proxy"
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Transcribe audio file
with open("audio.mp3", "rb") as audio_file:
    response = client.audio.transcriptions.create(
        model="elevenlabs-transcription",
        file=audio_file,
        language="en",
        temperature=0.3,
        # ElevenLabs-specific parameters
        diarize=True,
        speaker_boost=True,
        custom_vocabulary="technical,AI,machine learning"
    )

print(response.text)
```

</TabItem>

<TabItem value="javascript" label="JavaScript/Node.js">

```javascript showLineNumbers title="Audio transcription with JavaScript"
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  baseURL: 'http://localhost:4000',
  apiKey: 'your-litellm-api-key'
});

async function transcribeAudio() {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream('audio.mp3'),
    model: 'elevenlabs-transcription',
    language: 'en',
    temperature: 0.3,
    diarize: true,
    speaker_boost: true
  });

  console.log(response.text);
}

transcribeAudio();
```

</TabItem>
</Tabs>

## 响应格式

ElevenLabs 以兼容 OpenAI 的格式返回转写响应：

```json showLineNumbers title="Example transcription response"
{
  "text": "Hello, this is a sample transcription with multiple speakers.",
  "task": "transcribe",
  "language": "en",
  "words": [
    {
      "word": "Hello",
      "start": 0.0,
      "end": 0.5
    },
    {
      "word": "this",
      "start": 0.5,
      "end": 0.8
    }
  ]
}
```

### 常见问题

1. **API 密钥无效**：确认 `ELEVENLABS_API_KEY` 已正确设置

---

## 文本转语音（TTS）

ElevenLabs 通过其 TTS API 提供高质量的文本转语音能力，支持多种音色、语言与音频格式。

### 概述

| 属性 | 详情 |
|----------|---------|
| 描述 | 使用 ElevenLabs 先进的 TTS 模型，把文本转换成自然听感的语音 |
| LiteLLM 中的提供商路由 | `elevenlabs/` |
| 支持的操作 | `/audio/speech` |
| 提供商文档链接 | [ElevenLabs TTS API ↗](https://elevenlabs.io/docs/api-reference/text-to-speech) |

### 支持的模型

| 模型 | 路由 | 描述 |
|-------|-------|-------------|
| Eleven v3 | `elevenlabs/eleven_v3` | 表现力最强的模型。支持 70 多种语言，可用音频标签添加音效与停顿。 |
| Eleven Multilingual v2 | `elevenlabs/eleven_multilingual_v2` | 默认 TTS 模型。支持 29 种语言，稳定且可用于生产环境。 |

### 快速上手

#### LiteLLM Python SDK

```python showLineNumbers title="ElevenLabs Text-to-Speech with SDK"
import litellm
import os

os.environ["ELEVENLABS_API_KEY"] = "your-elevenlabs-api-key"

# Basic usage with voice mapping
audio = litellm.speech(
    model="elevenlabs/eleven_multilingual_v2",
    input="Testing ElevenLabs speech from LiteLLM.",
    voice="alloy",  # Maps to ElevenLabs voice ID automatically
)

# Save audio to file
with open("test_output.mp3", "wb") as f:
    f.write(audio.read())
```

#### 在 Eleven v3 中使用音频标签

Eleven v3 支持[音频标签](https://elevenlabs.io/docs/overview/capabilities/text-to-speech#audio-tags)，可以直接在文本中标记音效与停顿：

```python showLineNumbers title="Eleven v3 with audio tags"
import litellm
import os

os.environ["ELEVENLABS_API_KEY"] = "your-elevenlabs-api-key"

audio = litellm.speech(
    model="elevenlabs/eleven_v3",
    input='Welcome back. <sfx>applause</sfx> Today we have a special guest. <pause duration="1.5s"/> Let me introduce them.',
    voice="alloy",
)

with open("eleven_v3_output.mp3", "wb") as f:
    f.write(audio.read())
```

#### 进阶用法：参数覆盖与 ElevenLabs 专属特性

```python showLineNumbers title="Advanced TTS with custom parameters"
import litellm
import os

os.environ["ELEVENLABS_API_KEY"] = "your-elevenlabs-api-key"

# Example showing parameter overriding and ElevenLabs-specific parameters
audio = litellm.speech(
    model="elevenlabs/eleven_multilingual_v2",
    input="Testing ElevenLabs speech from LiteLLM.",
    voice="alloy",  # Can use mapped voice name or raw ElevenLabs voice_id
    response_format="pcm",  # Maps to ElevenLabs output_format
    speed=1.1,  # Maps to voice_settings.speed
    # ElevenLabs-specific parameters - passed directly to API
    pronunciation_dictionary_locators=[
        {"pronunciation_dictionary_id": "dict_123", "version_id": "v1"}
    ],
    model_id="eleven_multilingual_v2",  # Override model if needed
)

# Save audio to file
with open("test_output.mp3", "wb") as f:
    f.write(audio.read())
```

### 语音映射

LiteLLM 会自动把常见的 OpenAI 语音名称映射为 ElevenLabs 的 voice ID：

| OpenAI 语音名 | ElevenLabs Voice ID | 描述 |
|--------------|---------------------|-------------|
| `alloy` | `21m00Tcm4TlvDq8ikWAM` | Rachel，中性均衡 |
| `amber` | `5Q0t7uMcjvnagumLfvZi` | Paul，温暖友善 |
| `ash` | `AZnzlk1XvdvUeBnXmlld` | Domi，活力十足 |
| `august` | `D38z5RcWu1voky8WS1ja` | Fin，专业沉稳 |
| `blue` | `2EiwWnXFnvU5JabPnv8n` | Clyde，低沉威严 |
| `coral` | `9BWtsMINqrJLrRacOk9x` | Aria，富于表现力 |
| `lily` | `EXAVITQu4vr4xnSDxMaL` | Sarah，亲切友善 |
| `onyx` | `29vD33N1CtxCmqQRPOHJ` | Drew，浑厚有力 |
| `sage` | `CwhRBWXzGAHq8TQ4Fs17` | Roger，平静从容 |
| `verse` | `CYw3kZ02Hs0563khs1Fj` | Dave，日常对话感 |

**使用自定义 Voice ID**：你也可以直接传入任意 ElevenLabs voice ID。如果语音名称不在映射表中，LiteLLM 会原样使用该名称：

```python showLineNumbers title="Using custom ElevenLabs voice ID"
audio = litellm.speech(
    model="elevenlabs/eleven_multilingual_v2",
    input="Testing with a custom voice.",
    voice="21m00Tcm4TlvDq8ikWAM",  # Direct ElevenLabs voice ID
)
```

### 响应格式映射

LiteLLM 会把 OpenAI 的响应格式映射为 ElevenLabs 的输出格式：

| OpenAI 格式 | ElevenLabs 格式 |
|---------------|-------------------|
| `mp3` | `mp3_44100_128` |
| `pcm` | `pcm_44100` |
| `opus` | `opus_48000_128` |

你也可以通过 `output_format` 参数直接传入 ElevenLabs 专属的输出格式。

### 支持的参数

```python showLineNumbers title="All Supported Parameters"
audio = litellm.speech(
    model="elevenlabs/eleven_multilingual_v2",  # Required
    input="Text to convert to speech",           # Required
    voice="alloy",                               # Required: Voice selection (mapped or raw ID)
    response_format="mp3",                      # Optional: Audio format (mp3, pcm, opus)
    speed=1.0,                                  # Optional: Speech speed (maps to voice_settings.speed)
    # ElevenLabs-specific parameters (passed directly):
    model_id="eleven_multilingual_v2",           # Optional: Override model
    voice_settings={                             # Optional: Voice customization
        "stability": 0.5,
        "similarity_boost": 0.75,
        "speed": 1.0
    },
    pronunciation_dictionary_locators=[         # Optional: Custom pronunciation
           {"pronunciation_dictionary_id": "dict_123", "version_id": "v1"}
    ],
)
```

### LiteLLM 代理

#### 1. 配置代理

```yaml showLineNumbers title="ElevenLabs TTS configuration in config.yaml"
model_list:
  - model_name: elevenlabs-tts
    litellm_params:
      model: elevenlabs/eleven_multilingual_v2
      api_key: os.environ/ELEVENLABS_API_KEY

general_settings:
  master_key: your-master-key
```

#### 2. 发起 TTS 请求

##### 简单用法（OpenAI 参数）

无需任何提供商专属配置，直接使用标准的 OpenAI 兼容参数即可：

```bash showLineNumbers title="Simple TTS request with curl"
curl http://localhost:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "elevenlabs-tts",
    "input": "Testing ElevenLabs speech via the LiteLLM proxy.",
    "voice": "alloy",
    "response_format": "mp3"
  }' \
  --output speech.mp3
```

```python showLineNumbers title="Simple TTS with OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

response = client.audio.speech.create(
    model="elevenlabs-tts",
    input="Testing ElevenLabs speech via the LiteLLM proxy.",
    voice="alloy",
    response_format="mp3"
)

# Save audio
with open("speech.mp3", "wb") as f:
    f.write(response.content)
```

##### 进阶用法（ElevenLabs 专属参数）

**注意**：通过代理调用时，提供商专属参数（如 `pronunciation_dictionary_locators`、`voice_settings` 等）必须放进 `extra_body` 字段传递。

```bash showLineNumbers title="Advanced TTS request with curl"
curl http://localhost:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "elevenlabs-tts",
    "input": "Testing ElevenLabs speech via the LiteLLM proxy.",
    "voice": "alloy",
    "response_format": "pcm",
    "extra_body": {
      "pronunciation_dictionary_locators": [
          {"pronunciation_dictionary_id": "dict_123", "version_id": "v1"}
      ],
      "voice_settings": {
        "speed": 1.1,
        "stability": 0.5,
        "similarity_boost": 0.75
      }
    }
  }' \
  --output speech.mp3
```

```python showLineNumbers title="Advanced TTS with OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

response = client.audio.speech.create(
    model="elevenlabs-tts",
    input="Testing ElevenLabs speech via the LiteLLM proxy.",
    voice="alloy",
    response_format="pcm",
    extra_body={
        "pronunciation_dictionary_locators": [
               {"pronunciation_dictionary_id": "dict_123", "version_id": "v1"}
        ],
        "voice_settings": {
            "speed": 1.1,
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
)

# Save audio
with open("speech.mp3", "wb") as f:
    f.write(response.content)
```
