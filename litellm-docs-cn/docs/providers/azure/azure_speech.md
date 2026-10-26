# Azure 文本转语音（TTS）

## 概览

| 属性 | 详情 |
|-------|-------|
| 说明 | 使用 Azure OpenAI 的文本转语音（TTS）模型，将文本转换成自然流畅的语音 |
| LiteLLM 提供商路由 | `azure/` |
| 支持的操作 | `/audio/speech` |
| 提供商文档链接 | [Azure OpenAI TTS ↗](https://learn.microsoft.com/en-us/azure/ai-services/openai/text-to-speech-quickstart)

## 快速上手

### **LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
from litellm import speech
from pathlib import Path
import os

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

# azure call
speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
        model="azure/<your-deployment-name>",
        voice="alloy",
        input="the quick brown fox jumped over the lazy dogs",
    )
response.stream_to_file(speech_file_path)
```

### **LiteLLM 代理**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: azure/tts-1
    litellm_params:
      model: azure/tts-1
      api_base: "os.environ/AZURE_API_BASE_TTS"
      api_key: "os.environ/AZURE_API_KEY_TTS"
      api_version: "os.environ/AZURE_API_VERSION" 
```

## 可用音色

Azure OpenAI 支持以下音色：
- `alloy` - 中性均衡
- `echo` - 温暖明快
- `fable` - 表现力强，戏剧感十足
- `onyx` - 低沉权威
- `nova` - 亲切自然，适合对话
- `shimmer` - 明亮欢快

## 支持的参数

```python showLineNumbers title="All Parameters"
response = speech(
    model="azure/<your-deployment-name>",
    voice="alloy",                    # Required: Voice selection
    input="text to convert",          # Required: Input text
    speed=1.0,                        # Optional: 0.25 to 4.0 (default: 1.0)
    response_format="mp3"             # Optional: mp3, opus, aac, flac, wav, pcm
)
```

## 支持的模型

- `tts-1` - 标准音质，为速度优化
- `tts-1-hd` - 高清音质，为音质优化

使用你的 Azure 部署名称：`azure/<your-deployment-name>`
