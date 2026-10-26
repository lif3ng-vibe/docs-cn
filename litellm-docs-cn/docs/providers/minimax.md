import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MiniMax  

## MiniMax - v1/messages

### 概览

LiteLLM 为 MiniMax 提供与 Anthropic 规范兼容的支持。

### 支持的模型

MiniMax 通过其 Anthropic 兼容 API 提供三个模型：

| 模型 | 说明 | 输入成本 | 输出成本 | 提示词缓存读取 | 提示词缓存写入 |
|-------|-------------|------------|-------------|---------------------|----------------------|
| **MiniMax-M2.1** | 多语言编程能力强，编程体验更佳（约 60 tps） | $0.3/M tokens | $1.2/M tokens | $0.03/M tokens | $0.375/M tokens |
| **MiniMax-M2.1-lightning** | 速度更快、响应更敏捷（约 100 tps） | $0.3/M tokens | $2.4/M tokens | $0.03/M tokens | $0.375/M tokens |
| **MiniMax-M2** | 智能体能力，高级推理 | $0.3/M tokens | $1.2/M tokens | $0.03/M tokens | $0.375/M tokens |


### 用法示例

#### 基础对话补全

```python
import litellm

response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/anthropic/v1/messages",
    max_tokens=1000
)

print(response.choices[0].message.content)
```

#### 使用环境变量

```bash
export MINIMAX_API_KEY="your-minimax-api-key"
export MINIMAX_API_BASE="https://api.minimax.io/anthropic/v1/messages"
```

```python
import litellm

response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=1000
)
```

#### 启用思考模式（M2.1 特性）

```python
response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Solve: 2+2=?"}],
    thinking={"type": "enabled", "budget_tokens": 1000},
    api_key="your-minimax-api-key"
)

# Access thinking content
for block in response.choices[0].message.content:
    if hasattr(block, 'type') and block.type == 'thinking':
        print(f"Thinking: {block.thinking}")
```

#### 工具调用

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }
]

response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "What's the weather in SF?"}],
    tools=tools,
    api_key="your-minimax-api-key",
    max_tokens=1000
)
```



### 通过 LiteLLM 代理使用

借助 LiteLLM 代理（Proxy）转发，即可在 Anthropic SDK 中使用 MiniMax 模型：

| 步骤 | 说明 |
|------|-------------|
| **1. 启动 LiteLLM 代理** | 在 `config.yaml` 中配置 MiniMax 模型 |
| **2. 设置环境变量** | 将 Anthropic SDK 指向代理端点 |
| **3. 使用 Anthropic SDK** | 用原生 Anthropic SDK 调用 MiniMax 模型 |

#### 第 1 步：配置 LiteLLM 代理

创建 `config.yaml` 文件：

```yaml
model_list:
  - model_name: minimax/MiniMax-M2.1
    litellm_params:
      model: minimax/MiniMax-M2.1
      api_key: os.environ/MINIMAX_API_KEY
      api_base: https://api.minimax.io/anthropic/v1/messages
```

启动代理：

```bash
litellm --config config.yaml
```

#### 第 2 步：配合 Anthropic SDK 使用

```python
import os
os.environ["ANTHROPIC_BASE_URL"] = "http://localhost:4000"
os.environ["ANTHROPIC_API_KEY"] = "sk-<your-api-key>"  # Your LiteLLM proxy key

import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="minimax/MiniMax-M2.1",
    max_tokens=1000,
    system="You are a helpful assistant.",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Hi, how are you?"
                }
            ]
        }
    ]
)

for block in message.content:
    if block.type == "thinking":
        print(f"Thinking:\n{block.thinking}\n")
    elif block.type == "text":
        print(f"Text:\n{block.text}\n")
```

## MiniMax - v1/chat/completions

### 通过 LiteLLM SDK 使用

你可以通过 LiteLLM 直接使用 MiniMax 的 OpenAI 兼容 API：

#### 基础对话补全

```python
import litellm

response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"}
    ],
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

print(response.choices[0].message.content)
```

#### 使用环境变量

```bash
export MINIMAX_API_KEY="your-minimax-api-key"
export MINIMAX_API_BASE="https://api.minimax.io/v1"
```

```python
import litellm

response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

#### 启用推理拆分

```python
response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Solve: 2+2=?"}
    ],
    extra_body={"reasoning_split": True},
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

# Access reasoning details if available
if hasattr(response.choices[0].message, 'reasoning_details'):
    print(f"Thinking: {response.choices[0].message.reasoning_details}")
print(f"Response: {response.choices[0].message.content}")
```

#### 工具调用

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }
]

response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "What's the weather in SF?"}],
    tools=tools,
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)
```

#### 流式输出

```python
response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True,
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```


### 通过 LiteLLM 代理使用 OpenAI SDK

也可以通过 LiteLLM 代理转发，在 OpenAI SDK 中使用 MiniMax 模型：

| 步骤 | 说明 |
|------|-------------|
| **1. 启动 LiteLLM 代理** | 在 `config.yaml` 中配置 MiniMax 模型 |
| **2. 设置环境变量** | 将 OpenAI SDK 指向代理端点 |
| **3. 使用 OpenAI SDK** | 用原生 OpenAI SDK 调用 MiniMax 模型 |

#### 第 1 步：配置 LiteLLM 代理

创建 `config.yaml` 文件：

```yaml
model_list:
  - model_name: minimax/MiniMax-M2.1
    litellm_params:
      model: minimax/MiniMax-M2.1
      api_key: os.environ/MINIMAX_API_KEY
      api_base: https://api.minimax.io/v1
```

启动代理：

```bash
litellm --config config.yaml
```

#### 第 2 步：配合 OpenAI SDK 使用

```python
import os
os.environ["OPENAI_BASE_URL"] = "http://localhost:4000"
os.environ["OPENAI_API_KEY"] = "sk-<your-api-key>"  # Your LiteLLM proxy key

from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="minimax/MiniMax-M2.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hi, how are you?"},
    ],
    # Set reasoning_split=True to separate thinking content
    extra_body={"reasoning_split": True},
)

# Access thinking and response
if hasattr(response.choices[0].message, 'reasoning_details'):
    print(f"Thinking:\n{response.choices[0].message.reasoning_details[0]['text']}\n")
print(f"Text:\n{response.choices[0].message.content}\n")
```

#### 使用 OpenAI SDK 流式输出

```python
from openai import OpenAI

client = OpenAI()

stream = client.chat.completions.create(
    model="minimax/MiniMax-M2.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a story"},
    ],
    extra_body={"reasoning_split": True},
    stream=True,
)

reasoning_buffer = ""
text_buffer = ""

for chunk in stream:
    if hasattr(chunk.choices[0].delta, "reasoning_details") and chunk.choices[0].delta.reasoning_details:
        for detail in chunk.choices[0].delta.reasoning_details:
            if "text" in detail:
                reasoning_text = detail["text"]
                new_reasoning = reasoning_text[len(reasoning_buffer):]
                if new_reasoning:
                    print(new_reasoning, end="", flush=True)
                    reasoning_buffer = reasoning_text

    if chunk.choices[0].delta.content:
        content_text = chunk.choices[0].delta.content
        new_text = content_text[len(text_buffer):] if text_buffer else content_text
        if new_text:
            print(new_text, end="", flush=True)
            text_buffer = content_text
```

### 成本计算

成本计算会依据 `model_prices_and_context_window.json` 中的定价信息自动完成。

示例：
```python
response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Hello!"}],
    api_key="your-minimax-api-key"
)

# Access cost information
print(f"Cost: ${response._hidden_params.get('response_cost', 0)}")
```

## MiniMax - 文本转语音（TTS）

### 快速上手

### **LiteLLM Python SDK 用法**

#### 基础用法

```python
from pathlib import Path
from litellm import speech
import os 

os.environ["MINIMAX_API_KEY"] = "your-api-key"

speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="The quick brown fox jumped over the lazy dogs",
)
response.stream_to_file(speech_file_path)
```

#### 异步用法

```python
from litellm import aspeech
from pathlib import Path
import os, asyncio

os.environ["MINIMAX_API_KEY"] = "your-api-key"

async def test_async_speech(): 
    speech_file_path = Path(__file__).parent / "speech.mp3"
    response = await aspeech(
        model="minimax/speech-2.6-hd",
        voice="alloy",
        input="The quick brown fox jumped over the lazy dogs",
    )
    response.stream_to_file(speech_file_path)

asyncio.run(test_async_speech())
```

#### 音色选择

MiniMax 支持丰富的音色。LiteLLM 提供与 OpenAI 兼容的音色名称，并映射到对应的 MiniMax 音色：

```python
from litellm import speech

# OpenAI-compatible voice names
voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

for voice in voices:
    response = speech(
        model="minimax/speech-2.6-hd",
        voice=voice,
        input=f"This is the {voice} voice",
    )
    response.stream_to_file(f"speech_{voice}.mp3")
```

也可以直接使用 MiniMax 原生音色 ID：

```python
response = speech(
    model="minimax/speech-2.6-hd",
    voice="male-qn-qingse",  # MiniMax native voice ID
    input="Using native MiniMax voice ID",
)
```

#### 自定义参数

MiniMax TTS 还支持一些附加参数，用于精细调节音频输出：

```python
from litellm import speech

response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="Custom audio parameters",
    speed=1.5,  # Speed: 0.5 to 2.0
    response_format="mp3",  # Format: mp3, pcm, wav, flac
    extra_body={
        "vol": 1.2,  # Volume: 0.1 to 10
        "pitch": 2,  # Pitch adjustment: -12 to 12
        "sample_rate": 32000,  # 16000, 24000, or 32000
        "bitrate": 128000,  # For MP3: 64000, 128000, 192000, 256000
        "channel": 1,  # 1 for mono, 2 for stereo
    }
)
response.stream_to_file("custom_speech.mp3")
```

#### 响应格式

```python
from litellm import speech

# MP3 format (default)
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="MP3 format audio",
    response_format="mp3",
)

# PCM format
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="PCM format audio",
    response_format="pcm",
)

# WAV format
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="WAV format audio",
    response_format="wav",
)

# FLAC format
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="FLAC format audio",
    response_format="flac",
)
```

### **LiteLLM 代理用法**

LiteLLM 为 MiniMax TTS 提供与 OpenAI 兼容的 `/audio/speech` 端点。

#### 配置

把 MiniMax 加入代理配置：

```yaml
model_list:
  - model_name: tts
    litellm_params:
      model: minimax/speech-2.6-hd
      api_key: os.environ/MINIMAX_API_KEY
  
  - model_name: tts-turbo
    litellm_params:
      model: minimax/speech-2.6-turbo
      api_key: os.environ/MINIMAX_API_KEY
```

启动代理：

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 发起请求

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts",
    "input": "The quick brown fox jumped over the lazy dog.",
    "voice": "alloy"
  }' \
  --output speech.mp3
```

携带自定义参数时：

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts",
    "input": "Custom parameters example.",
    "voice": "nova",
    "speed": 1.5,
    "response_format": "mp3",
    "extra_body": {
      "vol": 1.2,
      "pitch": 1,
      "sample_rate": 32000
    }
  }' \
  --output custom_speech.mp3
```

### 音色映射

LiteLLM 将 OpenAI 兼容的音色名映射为 MiniMax 音色 ID：

| OpenAI 音色 | MiniMax 音色 ID | 说明 |
|--------------|------------------|-------------|
| alloy | male-qn-qingse | 男声 |
| echo | male-qn-jingying | 男声 |
| fable | female-shaonv | 女声 |
| onyx | male-qn-badao | 男声 |
| nova | female-yujie | 女声 |
| shimmer | female-tianmei | 女声 |

也可以将任意 MiniMax 原生音色 ID 直接作为 `voice` 参数传入使用。


#### 流式输出（WebSocket）

:::note
当前实现使用的是 MiniMax 的 HTTP 端点。如需 WebSocket 流式支持，请参阅 MiniMax 官方文档：[https://platform.minimax.io/docs](https://platform.minimax.io/docs)。
:::

### 错误处理

```python
from litellm import speech
import litellm

try:
    response = speech(
        model="minimax/speech-2.6-hd",
        voice="alloy",
        input="Test input",
    )
    response.stream_to_file("output.mp3")
except litellm.exceptions.BadRequestError as e:
    print(f"Bad request: {e}")
except litellm.exceptions.AuthenticationError as e:
    print(f"Authentication failed: {e}")
except Exception as e:
    print(f"Error: {e}")
```

#### 附加参数（extra_body）

以下参数通过 `extra_body` 传入：

| 参数 | 类型 | 说明 | 默认值 |
|-----------|------|-------------|---------|
| vol | float | 音量（0.1 到 10） | 1.0 |
| pitch | int | 音调调节（-12 到 12） | 0 |
| sample_rate | int | 采样率：16000、24000、32000 | 32000 |
| bitrate | int | MP3 比特率：64000、128000、192000、256000 | 128000 |
| channel | int | 声道数：1（单声道）或 2（立体声） | 1 |
| output_format | string | 输出格式："hex" 或 "url"（url 返回的链接 24 小时内有效） | hex |
