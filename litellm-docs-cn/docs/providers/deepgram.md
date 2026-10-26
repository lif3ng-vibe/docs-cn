import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Deepgram

LiteLLM 支持 Deepgram 的 `/listen` 端点。

| 属性 | 详情 |
|-------|-------|
| 描述 | Deepgram 的语音 AI 平台提供语音转文本、文本转语音与语言理解类 API。 |
| LiteLLM 上的提供商路由 | `deepgram/` |
| 提供商文档 | [Deepgram ↗](https://developers.deepgram.com/docs/introduction) |
| 支持的 OpenAI 端点 | `/audio/transcriptions` |

## 快速上手

```python
from litellm import transcription
import os

# set api keys
os.environ["DEEPGRAM_API_KEY"] = ""
audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(model="deepgram/nova-2", file=audio_file)

print(f"response: {response}")
```

## LiteLLM 代理用法

### 将模型添加到配置

1. 将模型添加到 config.yaml

```yaml
model_list:
- model_name: nova-2
  litellm_params:
    model: deepgram/nova-2
    api_key: os.environ/DEEPGRAM_API_KEY
  model_info:
    mode: audio_transcription

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 启动代理

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 测试

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'file=@"/Users/krrishdholakia/Downloads/gettysburg.wav"' \
--form 'model="nova-2"'
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```python
from openai import OpenAI
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)


audio_file = open("speech.mp3", "rb")
transcript = client.audio.transcriptions.create(
  model="nova-2",
  file=audio_file
)
```
</TabItem>
</Tabs>
