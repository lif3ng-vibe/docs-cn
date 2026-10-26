import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /audio/transcriptions

## 概览

| 功能 | 是否支持 | 说明 |
|-------|-------|-------|
| 成本追踪（cost tracking） | ✅ | 适用于所有支持的模型 |
| 日志 | ✅ | 适用于所有集成 |
| 终端用户追踪 | ✅ | |
| 回退机制（fallbacks） | ✅ | 可在支持的模型之间生效 |
| 负载均衡（load balancing） | ✅ | 可在支持的模型之间生效 |
| 防护栏（guardrails） | ✅ | 作用于转写输出的文本（仅限非流式） |
| 支持的提供商（provider） | `openai`, `azure`, `vertex_ai`, `gemini`, `deepgram`, `groq`, `fireworks_ai`, `ovhcloud`, `mistral` | |

## 快速上手

### LiteLLM Python SDK

```python showLineNumbers title="Python SDK Example"
from litellm import transcription
import os 

# set api keys 
os.environ["OPENAI_API_KEY"] = ""
audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(model="whisper", file=audio_file)

print(f"response: {response}")
```

### LiteLLM Proxy

### 将模型添加到配置


<Tabs>
<TabItem value="openai" label="OpenAI">

```yaml showLineNumbers title="OpenAI Configuration"
model_list:
- model_name: whisper
  litellm_params:
    model: whisper-1
    api_key: os.environ/OPENAI_API_KEY
  model_info:
    mode: audio_transcription
    
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```
</TabItem>
<TabItem value="openai+azure" label="OpenAI + Azure">

```yaml showLineNumbers title="OpenAI + Azure Configuration"
model_list:
- model_name: whisper
  litellm_params:
    model: whisper-1
    api_key: os.environ/OPENAI_API_KEY
  model_info:
    mode: audio_transcription
- model_name: whisper
  litellm_params:
    model: azure/azure-whisper
    api_version: 2024-02-15-preview
    api_base: os.environ/AZURE_EUROPE_API_BASE
    api_key: os.environ/AZURE_EUROPE_API_KEY
  model_info:
    mode: audio_transcription

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

</TabItem>
</Tabs>

### 启动代理

```bash showLineNumbers title="Start Proxy Server"
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 测试

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Test with cURL"
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'file=@"/Users/krrishdholakia/Downloads/gettysburg.wav"' \
--form 'model="whisper"'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers title="Test with OpenAI Python SDK"
from openai import OpenAI
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)


audio_file = open("speech.mp3", "rb")
transcript = client.audio.transcriptions.create(
  model="whisper",
  file=audio_file
)
```
</TabItem>
</Tabs>

## 支持的提供商

- OpenAI
- Azure
- [Fireworks AI](./providers/fireworks_ai.md#语音转写)
- [Groq](./providers/groq.md#whisper-语音转文字)
- [Deepgram](./providers/deepgram.md)
- [Google AI Studio (Gemini)](./providers/gemini.md#audio-transcription-speech-to-text)
- [Mistral (Voxtral)](./providers/mistral.md#语音转写)
- [OVHcloud AI Endpoints](./providers/ovhcloud.md)

---

## 回退机制

可以为语音转写（audio transcription）配置回退机制，在主模型失败时自动改用其他模型重试。

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Test with cURL and Fallbacks"
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'file=@"gettysburg.wav"' \
--form 'model="groq/whisper-large-v3"' \
--form 'fallbacks[]="openai/whisper-1"'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers title="Test with OpenAI Python SDK and Fallbacks"
from openai import OpenAI
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

audio_file = open("gettysburg.wav", "rb")
transcript = client.audio.transcriptions.create(
    model="groq/whisper-large-v3",
    file=audio_file,
    extra_body={
        "fallbacks": ["openai/whisper-1"]
    }
)
```
</TabItem>
</Tabs>

### 测试回退机制

:::warning[代理请求场景已弃用]
自 LiteLLM Proxy v1.85.0 起，进入代理的请求会剥离 `mock_testing_fallbacks`，该参数不再产生任何效果；目前仅支持在测试中直接调用 `litellm.Router` 时使用。
:::

要通过代理验证语音转写的回退机制，可在非生产环境中触发一次真实的提供商错误，再携带回退配置发送正常请求。
