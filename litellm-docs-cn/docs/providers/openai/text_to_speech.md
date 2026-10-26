import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI - 文本转语音

## 概览

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪（cost tracking） | ✅ | 适用于所有支持的模型 |
| 日志记录 | ✅ | 适用于所有集成 |
| 终端用户追踪 | ✅ | |
| 回退（fallbacks） | ✅ | 在支持的模型之间生效 |
| 负载均衡（load balancing） | ✅ | 在支持的模型之间生效 |
| 防护栏（guardrails） | ✅ | 应用于输入文本 |
| 支持的模型 | tts-1, tts-1-hd, gpt-4o-mini-tts | |

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

LiteLLM 提供了一个与 OpenAI 兼容的 `/audio/speech` 端点，用于处理文本转语音（text-to-speech）请求。

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

## 支持的模型

| 模型 | 示例 |
|-------|-------------|
| tts-1 | speech(model="tts-1", voice="alloy", input="Hello, world!") |
| tts-1-hd | speech(model="tts-1-hd", voice="alloy", input="Hello, world!") |
| gpt-4o-mini-tts | speech(model="gpt-4o-mini-tts", voice="alloy", input="Hello, world!") |


## ✨ 企业版 LiteLLM 代理——设置最大请求文件大小

当你想限制发送到 `audio/transcriptions` 的请求文件大小时，可以使用这一配置。

```yaml
- model_name: whisper
  litellm_params:
    model: whisper-1
    api_key: sk-*******
    max_file_size_mb: 0.00001 # 👈 max file size in MB  (Set this intentionally very small for testing)
  model_info:
    mode: audio_transcription
```

用一个有效文件发起一次测试请求
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
