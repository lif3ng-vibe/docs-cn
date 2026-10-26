import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /audio/speech

## 概览

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪 | ✅ | 适用于所有支持的模型 |
| 日志 | ✅ | 适用于全部集成 |
| 终端用户追踪 | ✅ | |
| 回退机制 | ✅ | 在支持的模型之间生效 |
| 负载均衡 | ✅ | 在支持的模型之间生效 |
| 防护栏 | ✅ | 作用于输入文本（仅限非流式） |
| 支持的提供商 | OpenAI、Azure OpenAI、Vertex AI、AWS Polly、ElevenLabs、MiniMax |

## **LiteLLM Python SDK 用法**
### 快速上手

```python
from pathlib import Path
from litellm import speech
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
        model="openai/tts-1",
        voice="alloy",
        input="the quick brown fox jumped over the lazy dogs",
    )
response.stream_to_file(speech_file_path)
```

### 异步用法

```python
from litellm import aspeech
from pathlib import Path
import os, asyncio

os.environ["OPENAI_API_KEY"] = "sk-.."

async def test_async_speech(): 
    speech_file_path = Path(__file__).parent / "speech.mp3"
    response = await aspeech(
            model="openai/tts-1",
            voice="alloy",
            input="the quick brown fox jumped over the lazy dogs",
            api_base=None,
            api_key=None,
            organization=None,
            project=None,
            max_retries=1,
            timeout=600,
            client=None,
            optional_params={},
        )
    response.stream_to_file(speech_file_path)

asyncio.run(test_async_speech())
```

## **LiteLLM 代理用法**

LiteLLM 提供与 OpenAI 兼容的 `/audio/speech` 端点，用于文本转语音（text-to-speech）调用。

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "The quick brown fox jumped over the lazy dog.",
    "voice": "alloy"
  }' \
  --output speech.mp3
```

**配置**

```bash
- model_name: tts
  litellm_params:
    model: openai/tts-1
    api_key: os.environ/OPENAI_API_KEY
```

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```
## **支持的提供商**

| 提供商    | 用法链接      |
|-------------|--------------------|
| OpenAI      |   [用法](#快速上手)                 |
| Azure OpenAI|   [用法](/docs/providers/azure/azure_speech)                 |
| Azure AI Speech Service（AVA）|   [用法](../docs/providers/azure_ai_speech)                 |
| AWS Polly   |   [用法](#aws-polly-文本转语音)                 |
| Vertex AI   |   [用法](/docs/providers/vertex_speech)                 |
| Gemini      |   [用法](#gemini-文本转语音)                 |
| ElevenLabs  |   [用法](../docs/providers/elevenlabs#文本转语音tts)                 |
| MiniMax     |   [用法](/docs/providers/minimax)                 |

## `/audio/speech` 到 `/chat/completions` 的桥接

LiteLLM 允许你通过 `/audio/speech` 端点，用 `/chat/completions` 模型来生成语音。对于像 Gemini 支持 TTS 的模型这样只能经 `/chat/completions` 访问的模型，这一点尤其有用。

### Gemini 文本转语音

#### Python SDK 用法

```python showLineNumbers title="Gemini 文本转语音 SDK 用法"
import litellm
import os

# Set your Gemini API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

def test_audio_speech_gemini():
    result = litellm.speech(
        model="gemini/gemini-2.5-flash-preview-tts",
        input="the quick brown fox jumped over the lazy dogs",
        api_key=os.getenv("GEMINI_API_KEY"),
    )
    
    # Save to file
    from pathlib import Path
    speech_file_path = Path(__file__).parent / "gemini_speech.mp3"
    result.stream_to_file(speech_file_path)
    print(f"Audio saved to {speech_file_path}")

test_audio_speech_gemini()
```

#### 异步用法

```python showLineNumbers title="Gemini 文本转语音异步用法"
import litellm
import asyncio
import os
from pathlib import Path

os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

async def test_async_gemini_speech():
    speech_file_path = Path(__file__).parent / "gemini_speech.mp3"
    response = await litellm.aspeech(
        model="gemini/gemini-2.5-flash-preview-tts",
        input="the quick brown fox jumped over the lazy dogs",
        api_key=os.getenv("GEMINI_API_KEY"),
    )
    response.stream_to_file(speech_file_path)
    print(f"Audio saved to {speech_file_path}")

asyncio.run(test_async_gemini_speech())
```

#### LiteLLM 代理用法

**配置文件**：

```yaml showLineNumbers title="Gemini 代理配置"
model_list:
- model_name: gemini-tts
  litellm_params:
    model: gemini/gemini-2.5-flash-preview-tts
    api_key: os.environ/GEMINI_API_KEY
```

**启动代理**：

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**发起请求**：

```bash showLineNumbers title="Gemini TTS 请求"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-tts",
    "input": "The quick brown fox jumped over the lazy dog.",
    "voice": "alloy"
  }' \
  --output gemini_speech.mp3
```

从 v1.107.0 起，`alloy` 这类 OpenAI 音色名称会映射到 Gemini 的预置音色（`alloy` 对应 `Kore`）。如果想直接指定，可以传入 `Kore`、`Puck` 这类 Gemini 音色名称；完整映射见 [Gemini 提供商文档](./providers/gemini#音色名称)。

### Vertex AI 文本转语音

#### Python SDK 用法

```python showLineNumbers title="Vertex AI 文本转语音 SDK 用法"
import litellm
import os
from pathlib import Path

# Set your Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path/to/service-account.json"

def test_audio_speech_vertex():
    result = litellm.speech(
        model="vertex_ai/gemini-2.5-flash-preview-tts",
        input="the quick brown fox jumped over the lazy dogs",
    )
    
    # Save to file
    speech_file_path = Path(__file__).parent / "vertex_speech.mp3"
    result.stream_to_file(speech_file_path)
    print(f"Audio saved to {speech_file_path}")

test_audio_speech_vertex()
```

#### LiteLLM 代理用法

**配置文件**：

```yaml showLineNumbers title="Vertex AI 代理配置"
model_list:
- model_name: vertex-tts
  litellm_params:
    model: vertex_ai/gemini-2.5-flash-preview-tts
    vertex_project: your-project-id
    vertex_location: us-central1
```

**发起请求**：

```bash showLineNumbers title="Vertex AI TTS 请求"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "input": "The quick brown fox jumped over the lazy dog.",
    "voice": "en-US-Wavenet-D"
  }' \
  --output vertex_speech.mp3
```

### AWS Polly 文本转语音

AWS Polly 提供神经和标准两种文本转语音引擎，支持多种音色与语言。

详细用法示例参见 [AWS Polly 提供商文档](../docs/providers/aws_polly)。

## ✨ 企业版 LiteLLM 代理：设置最大请求文件大小

需要限制发送到 `audio/transcriptions` 的请求文件大小时，可以使用这一功能。

```yaml
- model_name: whisper
  litellm_params:
    model: whisper-1
    api_key: sk-*******
    max_file_size_mb: 0.00001 # 👈 max file size in MB  (Set this intentionally very small for testing)
  model_info:
    mode: audio_transcription
```

用一个有效文件发起测试请求
```shell
curl --location 'http://localhost:4000/v1/audio/transcriptions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'file=@"/Users/ishaanjaffer/Github/litellm/tests/gettysburg.wav"' \
--form 'model="whisper"'
```


预期会看到如下响应

```shell
{"error":{"message":"File size is too large. Please check your file size. Passed file size: 0.7392807006835938 MB. Max file size: 0.0001 MB","type":"bad_request","param":"file","code":500}}%  
```
