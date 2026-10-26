# Bedrock 实时 API

## 概述

Amazon Bedrock 的 Nova Sonic 模型支持语音对话中的实时（real-time）双向音频流式传输。本教程演示如何通过 LiteLLM 代理来使用它。

## 设置

### 1. 配置 LiteLLM 代理

创建一个 `config.yaml` 文件：

```yaml
model_list:
  - model_name: "bedrock-sonic"
    litellm_params:
      model: bedrock/amazon.nova-sonic-v1:0
      aws_region_name: us-east-1  # or your preferred region
    model_info:
      mode: realtime
```

### 2. 启动 LiteLLM 代理

```bash
litellm --config config.yaml
```

## 基础文本交互

```python
import asyncio
import websockets
import json

LITELLM_API_KEY = "sk-<your-litellm-api-key>"  # Your LiteLLM API key
LITELLM_URL = 'ws://localhost:4000/v1/realtime?model=bedrock-sonic'

async def test_text_conversation():
    async with websockets.connect(
        LITELLM_URL,
        additional_headers={
            "Authorization": f"Bearer {LITELLM_API_KEY}"
        }
    ) as ws:
        # Wait for session.created
        response = await ws.recv()
        print(f"Connected: {json.loads(response)['type']}")

        # Configure session
        session_update = {
            "type": "session.update",
            "session": {
                "instructions": "You are a helpful assistant.",
                "modalities": ["text"],
                "temperature": 0.8
            }
        }
        await ws.send(json.dumps(session_update))

        # Send a message
        message = {
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "Hello!"}]
            }
        }
        await ws.send(json.dumps(message))

        # Trigger response
        await ws.send(json.dumps({"type": "response.create"}))

        # Listen for response
        while True:
            response = await ws.recv()
            event = json.loads(response)

            if event['type'] == 'response.text.delta':
                print(event['delta'], end='', flush=True)
            elif event['type'] == 'response.done':
                print("\n✓ Complete")
                break

if __name__ == "__main__":
    asyncio.run(test_text_conversation())
```

## 语音对话的音频流式传输

```python
import asyncio
import websockets
import json
import base64
import pyaudio

LITELLM_API_KEY = "sk-<your-litellm-api-key>"
LITELLM_URL = 'ws://localhost:4000/v1/realtime?model=bedrock-sonic'

# Audio configuration
INPUT_RATE = 16000   # Nova Sonic expects 16kHz input
OUTPUT_RATE = 24000  # Nova Sonic outputs 24kHz
CHUNK = 1024

async def audio_conversation():
    # Initialize PyAudio
    p = pyaudio.PyAudio()

    # Input stream (microphone)
    input_stream = p.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=INPUT_RATE,
        input=True,
        frames_per_buffer=CHUNK
    )

    # Output stream (speakers)
    output_stream = p.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=OUTPUT_RATE,
        output=True,
        frames_per_buffer=CHUNK
    )

    async with websockets.connect(
        LITELLM_URL,
        additional_headers={"Authorization": f"Bearer {LITELLM_API_KEY}"}
    ) as ws:
        # Wait for session.created
        await ws.recv()
        print("✓ Connected")

        # Configure session with audio
        session_update = {
            "type": "session.update",
            "session": {
                "instructions": "You are a friendly voice assistant.",
                "modalities": ["text", "audio"],
                "voice": "matthew",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16"
            }
        }
        await ws.send(json.dumps(session_update))
        print("🎤 Speak into your microphone...")

        async def send_audio():
            """Capture and send audio from microphone"""
            while True:
                audio_data = input_stream.read(CHUNK, exception_on_overflow=False)
                audio_b64 = base64.b64encode(audio_data).decode('utf-8')
                await ws.send(json.dumps({
                    "type": "input_audio_buffer.append",
                    "audio": audio_b64
                }))
                await asyncio.sleep(0.01)

        async def receive_audio():
            """Receive and play audio responses"""
            while True:
                response = await ws.recv()
                event = json.loads(response)

                if event['type'] == 'response.audio.delta':
                    audio_b64 = event.get('delta', '')
                    if audio_b64:
                        audio_bytes = base64.b64decode(audio_b64)
                        output_stream.write(audio_bytes)

                elif event['type'] == 'response.text.delta':
                    print(event['delta'], end='', flush=True)

                elif event['type'] == 'response.done':
                    print("\n✓ Response complete")

        # Run both tasks concurrently
        await asyncio.gather(send_audio(), receive_audio())

if __name__ == "__main__":
    try:
        asyncio.run(audio_conversation())
    except KeyboardInterrupt:
        print("\n\nGoodbye!")
```

## 使用工具与函数调用

```python
import asyncio
import websockets
import json
from datetime import datetime

LITELLM_API_KEY = "sk-<your-litellm-api-key>"
LITELLM_URL = 'ws://localhost:4000/v1/realtime?model=bedrock-sonic'

# Define tools
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

def get_weather(location: str) -> dict:
    """Simulated weather function"""
    return {
        "location": location,
        "temperature": 72,
        "conditions": "sunny"
    }

async def conversation_with_tools():
    async with websockets.connect(
        LITELLM_URL,
        additional_headers={"Authorization": f"Bearer {LITELLM_API_KEY}"}
    ) as ws:
        # Wait for session.created
        await ws.recv()

        # Configure session with tools
        session_update = {
            "type": "session.update",
            "session": {
                "instructions": "You are a helpful assistant with access to tools.",
                "modalities": ["text"],
                "tools": TOOLS
            }
        }
        await ws.send(json.dumps(session_update))

        # Send a message that requires a tool
        message = {
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "What's the weather in San Francisco?"}]
            }
        }
        await ws.send(json.dumps(message))
        await ws.send(json.dumps({"type": "response.create"}))

        # Handle responses and tool calls
        while True:
            response = await ws.recv()
            event = json.loads(response)

            if event['type'] == 'response.text.delta':
                print(event['delta'], end='', flush=True)

            elif event['type'] == 'response.function_call_arguments.done':
                # Execute the tool
                function_name = event['name']
                arguments = json.loads(event['arguments'])

                print(f"\n🔧 Calling {function_name}({arguments})")
                result = get_weather(**arguments)

                # Send tool result back
                tool_result = {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "function_call_output",
                        "call_id": event['call_id'],
                        "output": json.dumps(result)
                    }
                }
                await ws.send(json.dumps(tool_result))
                await ws.send(json.dumps({"type": "response.create"}))

            elif event['type'] == 'response.done':
                print("\n✓ Complete")
                break

if __name__ == "__main__":
    asyncio.run(conversation_with_tools())
```

## 配置选项

### 音色选项
可选音色：`matthew`、`joanna`、`ruth`、`stephen`、`gregory`、`amy`

### 音频格式
- **输入**：16kHz PCM16（单声道）
- **输出**：24kHz PCM16（单声道）

### 模态
- `["text"]` - 仅文本
- `["audio"]` - 仅音频
- `["text", "audio"]` - 文本和音频

## 测试脚本示例

LiteLLM 仓库中提供了完整可运行的示例：

- **基础音频流式传输**：`test_bedrock_realtime_client.py`
- **简单文本测试**：`test_bedrock_realtime_simple.py`
- **工具调用**：`test_bedrock_realtime_tools.py`

## 依赖要求

```bash
uv add litellm websockets pyaudio
```

## AWS 配置

请确保已配置好 AWS 凭证：

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION_NAME=us-east-1
```

也可以使用 AWS CLI 进行配置：

```bash
aws configure
```

## 故障排查

### 连接问题
- 确保 LiteLLM 代理运行在正确的端口上
- 检查 AWS 凭证是否已正确配置
- 确认你所在区域可使用该 Bedrock 模型

### 音频问题
- 检查 PyAudio 是否已正确安装
- 检查麦克风和扬声器的权限
- 确认采样率设置正确（输入 16kHz，输出 24kHz）

### 工具调用问题
- 确保工具已在 session.update 中正确定义
- 检查工具结果是否通过正确的 call_id 回传
- 确认在返回工具结果之后发送了 response.create

## 相关资源

- [OpenAI 实时 API 文档](https://platform.openai.com/docs/guides/realtime)
- [Amazon Bedrock Nova Sonic 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/nova-sonic.html)
- [LiteLLM 实时 API 文档](/docs/realtime)
