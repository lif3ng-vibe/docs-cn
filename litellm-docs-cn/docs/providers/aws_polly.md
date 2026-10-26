# AWS Polly 文本转语音（tts）

## 概览

| 属性 | 详情 |
|-------|-------|
| 说明 | 使用 AWS Polly 的 neural 与 standard TTS 引擎，将文本转换成听感自然的语音 |
| LiteLLM 提供商路由 | `aws_polly/` |
| 支持的操作 | `/audio/speech` |
| 提供商文档链接 | [AWS Polly SynthesizeSpeech ↗](https://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html) |

## 快速上手

### **LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
import litellm
from pathlib import Path
import os

# Set environment variables
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-east-1"

# AWS Polly call
speech_file_path = Path(__file__).parent / "speech.mp3"
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="the quick brown fox jumped over the lazy dogs",
)
response.stream_to_file(speech_file_path)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-neural
    litellm_params:
      model: aws_polly/neural
      aws_access_key_id: "os.environ/AWS_ACCESS_KEY_ID"
      aws_secret_access_key: "os.environ/AWS_SECRET_ACCESS_KEY"
      aws_region_name: "us-east-1"
```

## Polly 引擎

AWS Polly 提供多种语音合成引擎，在模型名称里指定引擎即可：

| 模型 | 引擎 | 成本（每百万字符） | 说明 |
|-------|--------|---------------------|-------------|
| `aws_polly/standard` | Standard | $4.00 | Polly 原版音色，速度更快，成本最低 |
| `aws_polly/neural` | Neural | $16.00 | 语音更自然、更接近真人（推荐） |
| `aws_polly/generative` | Generative | $30.00 | 表现力最强、质量最高（可用音色有限） |
| `aws_polly/long-form` | Long-form | $100.00 | 针对文章等长篇内容优化 |

### **LiteLLM SDK**

```python showLineNumbers title="Using Different Engines"
import litellm

# Neural engine (recommended)
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello world",
)

# Standard engine (lower cost)
response = litellm.speech(
    model="aws_polly/standard",
    voice="Joanna",
    input="Hello world",
)

# Generative engine (highest quality)
response = litellm.speech(
    model="aws_polly/generative",
    voice="Matthew",
    input="Hello world",
)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-neural
    litellm_params:
      model: aws_polly/neural
      aws_region_name: "us-east-1"
  - model_name: polly-standard
    litellm_params:
      model: aws_polly/standard
      aws_region_name: "us-east-1"
  - model_name: polly-generative
    litellm_params:
      model: aws_polly/generative
      aws_region_name: "us-east-1"
```

## 可用音色

### Polly 原生音色

AWS Polly 覆盖多种语言的大量音色，下面列出常用的美式英语音色：

| 音色 | 性别 | 支持的引擎 |
|-------|--------|----------------|
| `Joanna` | 女性 | Neural, Standard |
| `Matthew` | 男性 | Neural, Standard, Generative |
| `Ivy` | 女性（儿童） | Neural, Standard |
| `Kendra` | 女性 | Neural, Standard |
| `Amy` | 女性（英式） | Neural, Standard |
| `Brian` | 男性（英式） | Neural, Standard |

### **LiteLLM SDK**

```python showLineNumbers title="Using Native Polly Voices"
import litellm

# US English female
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello from Joanna",
)

# US English male
response = litellm.speech(
    model="aws_polly/neural",
    voice="Matthew",
    input="Hello from Matthew",
)

# British English female
response = litellm.speech(
    model="aws_polly/neural",
    voice="Amy",
    input="Hello from Amy",
)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-joanna
    litellm_params:
      model: aws_polly/neural
      voice: "Joanna"
      aws_region_name: "us-east-1"
  - model_name: polly-matthew
    litellm_params:
      model: aws_polly/neural
      voice: "Matthew"
      aws_region_name: "us-east-1"
```

### OpenAI 音色映射

LiteLLM 也支持 OpenAI 的音色名称，会自动映射成对应的 Polly 音色：

| OpenAI 音色 | 对应的 Polly 音色 |
|--------------|---------------------|
| `alloy` | Joanna |
| `echo` | Matthew |
| `fable` | Amy |
| `onyx` | Brian |
| `nova` | Ivy |
| `shimmer` | Kendra |

### **LiteLLM SDK**

```python showLineNumbers title="Using OpenAI Voice Names"
import litellm

# These are equivalent
response = litellm.speech(
    model="aws_polly/neural",
    voice="alloy",  # Maps to Joanna
    input="Hello world",
)

response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",  # Native Polly voice
    input="Hello world",
)
```

## SSML 支持

AWS Polly 支持 SSML（Speech Synthesis Markup Language，语音合成标记语言），可对语音输出做精细控制。LiteLLM 会自动识别 SSML 输入。

### **LiteLLM SDK**

```python showLineNumbers title="SSML Example"
import litellm

ssml_input = """
<speak>
    Hello, <break time="500ms"/> 
    this is a test with <emphasis level="strong">emphasis</emphasis> 
    and <prosody rate="slow">slower speech</prosody>.
</speak>
"""

response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input=ssml_input,
)
```

### **LiteLLM PROXY**

```bash showLineNumbers title="cURL Request with SSML"
curl -X POST http://localhost:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "polly-neural",
    "voice": "Joanna",
    "input": "<speak>Hello <break time=\"500ms\"/> world</speak>"
  }' \
  --output speech.mp3
```

## 支持的参数

```python showLineNumbers title="All Parameters"
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",                    # Required: Voice selection
    input="text to convert",           # Required: Input text (or SSML)
    response_format="mp3",             # Optional: mp3, ogg_vorbis, pcm
    
    # AWS-specific parameters
    language_code="en-US",             # Optional: Language code
    sample_rate="22050",               # Optional: Sample rate in Hz
)
```

## 响应格式

| 格式 | 说明 |
|--------|-------------|
| `mp3` | MP3 音频（默认） |
| `ogg_vorbis` | Ogg Vorbis 音频 |
| `pcm` | 原始 PCM 音频 |

### **LiteLLM SDK**

```python showLineNumbers title="Different Response Formats"
import litellm

# MP3 (default)
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    response_format="mp3",
)

# Ogg Vorbis
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    response_format="ogg_vorbis",
)
```

## AWS 身份验证

LiteLLM 支持多种 AWS 身份验证方式。

### **LiteLLM SDK**

```python showLineNumbers title="Authentication Options"
import litellm
import os

# Option 1: Environment variables (recommended)
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

response = litellm.speech(model="aws_polly/neural", voice="Joanna", input="Hello")

# Option 2: Pass credentials directly
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_access_key_id="your-access-key",
    aws_secret_access_key="your-secret-key",
    aws_region_name="us-east-1",
)

# Option 3: IAM Role (when running on AWS)
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_region_name="us-east-1",
)

# Option 4: AWS Profile
response = litellm.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_profile_name="my-profile",
)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  # Using environment variables
  - model_name: polly-neural
    litellm_params:
      model: aws_polly/neural
      aws_access_key_id: "os.environ/AWS_ACCESS_KEY_ID"
      aws_secret_access_key: "os.environ/AWS_SECRET_ACCESS_KEY"
      aws_region_name: "us-east-1"
  
  # Using IAM Role (when proxy runs on AWS)
  - model_name: polly-neural-iam
    litellm_params:
      model: aws_polly/neural
      aws_region_name: "us-east-1"
  
  # Using AWS Profile
  - model_name: polly-neural-profile
    litellm_params:
      model: aws_polly/neural
      aws_profile_name: "my-profile"
```

## 异步支持

```python showLineNumbers title="Async Usage"
import litellm
import asyncio

async def main():
    response = await litellm.aspeech(
        model="aws_polly/neural",
        voice="Joanna",
        input="Hello from async AWS Polly",
        aws_region_name="us-east-1",
    )
    
    with open("output.mp3", "wb") as f:
        f.write(response.content)

asyncio.run(main())
```
