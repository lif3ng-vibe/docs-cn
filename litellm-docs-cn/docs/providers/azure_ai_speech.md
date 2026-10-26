# Azure AI Speech (Cognitive Services)

Azure AI Speech 是 Azure 认知服务（Cognitive Services）的文本转语音（text-to-speech）API，与 Azure OpenAI 相互独立。它提供高质量的神经语音（neural voice），语言覆盖更广，并支持高级语音定制。

**该选 Azure AI Speech 还是 Azure OpenAI TTS**：
- **Azure AI Speech**：语言更多、有神经语音、支持 SSML 与语音定制
- **Azure OpenAI TTS**：OpenAI 模型，与 Azure OpenAI 服务集成


## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | Azure AI Speech 是 Azure 认知服务（Cognitive Services）的文本转语音 API，与 Azure OpenAI 相互独立。它提供高质量的神经语音，语言覆盖更广，并支持高级语音定制。 |
| LiteLLM 提供商路由 | `azure/speech/` |

## 快速上手

**LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
from litellm import speech
from pathlib import Path
import os

os.environ["AZURE_TTS_API_KEY"] = "your-cognitive-services-key"

speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
    model="azure/speech/azure-tts",
    voice="alloy",
    input="Hello, this is Azure AI Speech",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)
response.stream_to_file(speech_file_path)
```

**LiteLLM 代理**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: azure-speech
    litellm_params:
      model: azure/speech/azure-tts
      api_base: https://eastus.tts.speech.microsoft.com
      api_key: os.environ/AZURE_TTS_API_KEY
```

## 设置

1. 在 [Azure 门户](https://portal.azure.com)中创建 Azure 认知服务（Cognitive Services）资源
2. 从资源中获取你的 API 密钥
3. 记下你的区域，例如 `eastus`、`westus`、`westeurope`
4. 使用区域端点：`https://{region}.tts.speech.microsoft.com`

## 成本追踪（定价）

LiteLLM 会根据处理的字符数自动追踪 Azure AI Speech 的成本。

### 可用模型

| 模型 | 语音类型 | 每百万字符成本 |
|-------|-----------|----------------------|
| `azure/speech/azure-tts` | Neural | $15 |
| `azure/speech/azure-tts-hd` | Neural HD | $30 |

### 成本如何计算

Azure AI Speech 按输入文本中的字符数计费。LiteLLM 会自动完成以下工作：
- 统计 `input` 参数中的字符数
- 按模型定价计算成本
- 在响应对象中返回成本

```python showLineNumbers title="View Request Cost"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="alloy",
    input="Hello, this is a test message",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)

# Access the calculated cost
cost = response._hidden_params.get("response_cost")
print(f"Request cost: ${cost}")
```

### 核实 Azure 定价

查看最新的 Azure AI Speech 定价：

1. 打开 [Azure 定价计算器](https://azure.microsoft.com/en-us/pricing/calculator/)
2. 将 **Service** 设为 “AI Services”
3. 将 **API** 设为 “Azure AI Speech”
4. 选择 **Text to Speech** 和你所在的区域
5. 查看每百万字符的当前定价

**注意**：定价可能因区域和 Azure 订阅类型而异。

## 语音映射

LiteLLM 会自动把 OpenAI 语音名称映射为 Azure 神经语音：

| OpenAI 语音 | Azure 神经语音 | 说明 |
|-------------|-------------------|-------------|
| `alloy` | en-US-JennyNeural | 中性平稳 |
| `echo` | en-US-GuyNeural | 温暖明快 |
| `fable` | en-GB-RyanNeural | 富有表现力，戏剧感强 |
| `onyx` | en-US-DavisNeural | 低沉威严 |
| `nova` | en-US-AmberNeural | 友好自然，贴近日常对话 |
| `shimmer` | en-US-AriaNeural | 明亮欢快 |

## 支持的参数

```python showLineNumbers title="All Parameters"
response = speech(
    model="azure/speech/azure-tts",
    voice="alloy",                    # Required: Voice selection
    input="text to convert",          # Required: Input text
    speed=1.0,                        # Optional: 0.25 to 4.0 (default: 1.0)
    response_format="mp3",            # Optional: mp3, opus, wav, pcm
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key="your-key",
)
```

### 响应格式

| 格式 | Azure 输出格式 | 采样率 |
|--------|-------------------|-------------|
| `mp3` | audio-24khz-48kbitrate-mono-mp3 | 24kHz |
| `opus` | ogg-48khz-16bit-mono-opus | 48kHz |
| `wav` | riff-24khz-16bit-mono-pcm | 24kHz |
| `pcm` | raw-24khz-16bit-mono-pcm | 24kHz |

## 传递原始 SSML

当 `input` 包含 SSML 时（LiteLLM 会通过检测 `<speak>` 标签来判断），就把它原样传给 Azure，不做任何转换。这样你可以完全掌控语音合成。

**适合使用原始 SSML 的场景**：
- 配合多语言语音使用 `<lang>` 元素切换输出语言（例如英文文本 → 西班牙语语音）
- 包含多个语音或韵律变化的复杂 SSML 结构
- 需要精细控制发音、停顿、重音等语音特性

### LiteLLM SDK

```python showLineNumbers title="Raw SSML for Multilingual Translation"
from litellm import speech

# Use <lang> element to convert English text to Spanish speech
# The <lang> element forces the output language regardless of input text language
language_code = "es-ES"
text = "Hello, how are you today?"  # English text
voice = "en-US-AvaMultilingualNeural"

ssml = f"""<speak version="1.0"
    xmlns="http://www.w3.org/2001/10/synthesis"
    xmlns:mstts="http://www.w3.org/2001/mstts"
    xml:lang="{language_code}">
<voice name="{voice}">
    <lang xml:lang="{language_code}">{text}</lang>
</voice>
</speak>"""

response = speech(
    model="azure/speech/azure-tts",
    voice=voice,
    input=ssml,  # LiteLLM auto-detects SSML and sends as-is
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)
response.stream_to_file("speech.mp3")
```

```python showLineNumbers title="Raw SSML with Complex Features"
from litellm import speech

# Complex SSML with multiple prosody adjustments
ssml = """<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' 
    xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='en-US'>
<voice name='en-US-JennyNeural'>
    <mstts:express-as style='cheerful' styledegree='2'>
        <prosody rate='+20%' pitch='high'>
            Welcome to our service!
        </prosody>
    </mstts:express-as>
    <break time='500ms'/>
    <prosody rate='-10%'>
        How can I help you today?
    </prosody>
</voice>
</speak>"""

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-JennyNeural",
    input=ssml,  # LiteLLM detects <speak> and passes through unchanged
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)
response.stream_to_file("speech.mp3")
```

### LiteLLM 代理

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "voice": "en-US-AvaMultilingualNeural",
    "input": "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xmlns:mstts=\"http://www.w3.org/2001/mstts\" xml:lang=\"es-ES\"><voice name=\"en-US-AvaMultilingualNeural\"><lang xml:lang=\"es-ES\">Hello, how are you today?</lang></voice></speak>"
  }' \
  --output speech.mp3
```


## 传递 Azure 专属参数

Azure AI Speech 通过以下可选参数支持高级 SSML 特性：

- `style`：说话风格，例如 “cheerful”、“sad”、“angry”、“whispering”
- `styledegree`：风格强度（0.01 到 2）
- `role`：语音角色，例如 “Girl”、“Boy”、“SeniorFemale”、“SeniorMale”
- `lang`：多语言语音的语言代码，例如 “es-ES”、“fr-FR”、“hi-IN”

### **LiteLLM SDK**

#### 自定义 Azure 语音

```python showLineNumbers title="Custom Azure Voice"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-AndrewNeural",       # Use Azure voice directly
    input="Hello, this is a test",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
    response_format="mp3"
)
response.stream_to_file("speech.mp3")
```

#### 说话风格

```python showLineNumbers title="Speaking Style"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-JennyNeural",        # Must be a voice that supports styles
    input="Who are you? What is chicken dinner?",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
    style="whispering",               # Azure-specific: cheerful, sad, angry, whispering, etc.
)
response.stream_to_file("speech.mp3")
```

#### 带强度与角色的风格

```python showLineNumbers title="Style with Degree and Role"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-AriaNeural",
    input="Good morning! How are you today?",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
    style="cheerful",                 # Azure-specific: Speaking style
    styledegree="2",                  # Azure-specific: 0.01 to 2 (intensity)
    role="SeniorFemale",              # Azure-specific: Girl, Boy, SeniorFemale, etc.
)
response.stream_to_file("speech.mp3")
```

#### 多语言语音的语言覆盖

```python showLineNumbers title="Language Override"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-AvaMultilingualNeural",  # Multilingual voice
    input="आप कौन हैं? चिकन डिनर क्या है?",  # Hindi text
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
    lang="hi-IN",                         # Azure-specific: Override language
)
response.stream_to_file("speech.mp3")
```

### **LiteLLM AI 网关（CURL）**

首先，请按照上文 [LiteLLM 代理设置](#快速上手)的说明完成代理配置。

**使用配置文件中的模型名**：

```yaml
model_list:
  - model_name: azure-speech  # This is what you'll use in your API calls
    litellm_params:
      model: azure/speech/azure-tts
      api_base: https://eastus.tts.speech.microsoft.com
      api_key: os.environ/AZURE_TTS_API_KEY
```

#### 自定义 Azure 语音

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "voice": "en-US-AndrewNeural",
    "input": "Hello, this is a test"
  }' \
  --output speech.mp3
```

#### 说话风格

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "input": "Who are you? What is chicken dinner?",
    "voice": "en-US-JennyNeural",
    "style": "whispering"
  }' \
  --output speech.mp3
```

#### 带强度与角色的风格

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "voice": "en-US-AriaNeural",
    "input": "Good morning! How are you today?",
    "style": "cheerful",
    "styledegree": "2",
    "role": "SeniorFemale"
  }' \
  --output speech.mp3
```

#### 语言覆盖

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "input": "आप कौन हैं? चिकन डिनर क्या है?",
    "voice": "en-US-AvaMultilingualNeural",
    "lang": "hi-IN"
  }' \
  --output speech.mp3
```

### Azure 专属参数参考

| 参数 | 说明 | 示例值 | 备注 |
|-----------|-------------|----------------|-------|
| `style` | 说话风格 | `cheerful`, `sad`, `angry`, `excited`, `friendly`, `hopeful`, `shouting`, `terrified`, `unfriendly`, `whispering` | 仅部分语音支持。参见 [Azure 语音风格文档](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#use-speaking-styles-and-roles) |
| `styledegree` | 风格强度 | `0.01` 到 `2` | 数值越高风格越强烈，默认为 `1` |
| `role` | 语音角色 | `Girl`, `Boy`, `YoungAdultFemale`, `YoungAdultMale`, `OlderAdultFemale`, `OlderAdultMale`, `SeniorFemale`, `SeniorMale` | 仅部分语音支持 |
| `lang` | 语言代码 | `es-ES`, `fr-FR`, `de-DE`, `hi-IN` 等 | 用于多语言语音，会覆盖默认语言 |

## 异步支持

```python showLineNumbers title="Async Usage"
import asyncio
from litellm import aspeech
from pathlib import Path

async def generate_speech():
    response = await aspeech(
        model="azure/speech/azure-tts",
        voice="alloy",
        input="Hello from async",
        api_base="https://eastus.tts.speech.microsoft.com",
        api_key=os.environ["AZURE_TTS_API_KEY"],
    )
    
    speech_file_path = Path(__file__).parent / "speech.mp3"
    response.stream_to_file(speech_file_path)

asyncio.run(generate_speech())
```

## 区域端点

将 `{region}` 替换为你的 Azure 资源所在区域：

- 美国东部：`https://eastus.tts.speech.microsoft.com`
- 美国西部：`https://westus.tts.speech.microsoft.com`
- 欧洲西部：`https://westeurope.tts.speech.microsoft.com`
- 东南亚：`https://southeastasia.tts.speech.microsoft.com`

[完整区域列表](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions)

## 高级功能

### 自定义神经语音

传入完整的语音名称，即可使用任意 Azure 神经语音：

```python showLineNumbers title="Custom Voice"
response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-AriaNeural",  # Direct Azure voice name
    input="Using a specific neural voice",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)
```

可在 [Azure Speech Gallery](https://speech.microsoft.com/portal/voicegallery) 中浏览可用语音。

## 错误处理

```python showLineNumbers title="Error Handling"
from litellm import speech
from litellm.exceptions import APIError

try:
    response = speech(
        model="azure/speech/azure-tts",
        voice="alloy",
        input="Test message",
        api_base="https://eastus.tts.speech.microsoft.com",
        api_key=os.environ["AZURE_TTS_API_KEY"],
    )
except APIError as e:
    print(f"Azure Speech error: {e}")
```

## 参考资料

- [Azure Speech 服务文档](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [文本转语音 REST API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech)
