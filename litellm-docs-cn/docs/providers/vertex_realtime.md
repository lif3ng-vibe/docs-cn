# Vertex AI Gemini Live - 实时 API

通过 LiteLLM 统一的 `/realtime` 端点使用 Vertex AI 的 Gemini Live API（BidiGenerateContent），该端点采用 OpenAI Realtime 协议。

| 功能 | 是否支持 |
|---------|-----------|
| 代理（`/realtime`） | ✅ |
| 语音输入 / 语音输出 | ✅ |
| 文本输入 / 文本输出 | ✅ |
| 服务端 VAD | ✅ |
| 输出转写 | ✅ |

## 设置

### 1. 认证

LiteLLM 使用你的 Google Cloud 凭据（OAuth2 Bearer token），而非 API 密钥。

```bash
gcloud auth application-default login
```

也可以设置服务账号密钥文件：

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
```

### 2. 代理配置

```yaml
model_list:
  - model_name: vertex-gemini-live
    litellm_params:
      model: vertex_ai/gemini-2.0-flash-live-001
      vertex_project: your-gcp-project-id
      vertex_location: us-east4   # a region (us-east4), a multi-region (us, eu), or "global"

general_settings:
  master_key: sk-your-key
```

`vertex_location` 决定 LiteLLM 建立 Live API websocket 连接时使用的主机：区域位置（如 `us-east4`）连接 `us-east4-aiplatform.googleapis.com`，多区域（`us` 或 `eu`）连接 `aiplatform.us.rep.googleapis.com` 或 `aiplatform.eu.rep.googleapis.com`，`global` 则连接 `aiplatform.googleapis.com`。每个位置提供哪些模型由 Google 决定。截至 2026 年 10 月，`gemini-3.8-live` 尚未在 `global` 上提供。在 `/realtime` 上使用多区域位置需要 LiteLLM v1.106.0-rc.1 或更高版本（[PR #45166](https://github.com/BerriAI/litellm/pull/45166)）。

### 3. 启动代理

```bash
litellm --config config.yaml --port 4000
```

## 用法

### Python（websockets）

```python
import asyncio
import json
import websockets

PROXY_URL = "ws://localhost:4000/realtime?model=vertex-gemini-live"
API_KEY = "sk-your-key"

async def main():
    async with websockets.connect(
        PROXY_URL,
        additional_headers={"api-key": API_KEY},
    ) as ws:
        # Wait for session.created
        event = json.loads(await ws.recv())
        print(f"session.created: {event['session']['id']}")

        # Send a text message
        await ws.send(json.dumps({
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "Say hello in one sentence."}],
            },
        }))

        # Collect the response
        async for raw in ws:
            ev = json.loads(raw)
            t = ev.get("type", "")
            if t == "response.text.delta":
                print(ev.get("delta", ""), end="", flush=True)
            elif t == "response.done":
                print("\n[done]")
                break

asyncio.run(main())
```

### Node.js

```js
const WebSocket = require("ws");

const ws = new WebSocket(
  "ws://localhost:4000/realtime?model=vertex-gemini-live",
  { headers: { "api-key": "sk-your-key" } }
);

ws.on("open", () => {
  ws.send(JSON.stringify({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: "Say hello." }],
    },
  }));
});

ws.on("message", (data) => {
  const ev = JSON.parse(data);
  if (ev.type === "response.text.delta") process.stdout.write(ev.delta);
  if (ev.type === "response.done") ws.close();
});
```

### OpenAI SDK（Python）

```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="http://localhost:4000",
    api_key="sk-your-key",
)

async def main():
    async with client.beta.realtime.connect(
        model="vertex-gemini-live"
    ) as conn:
        await conn.session.update(session={"modalities": ["text"]})

        await conn.conversation.item.create(
            item={
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "Say hello."}],
            }
        )

        async for event in conn:
            if event.type == "response.text.delta":
                print(event.delta, end="", flush=True)
            elif event.type == "response.done":
                print()
                break

asyncio.run(main())
```

## 语音输入 / 语音输出

完整的语音示例见 [`voice_realtime_test.py`](https://github.com/BerriAI/litellm/blob/main/voice_realtime_test.py)。

音频相关的关键设置：
- 麦克风输入：**16 kHz** PCM16（`audio/pcm;rate=16000`）
- 扬声器输出：**24 kHz** PCM16（Vertex AI 返回的音频采样率为 24 kHz）
- 服务端 VAD 默认启用，静音阈值为 800 ms

```python
# session.update with server VAD — the proxy ignores this for Vertex AI
# because VAD is already configured in the initial setup message.
await ws.send(json.dumps({
    "type": "session.update",
    "session": {
        "modalities": ["audio"],
        "turn_detection": {"type": "server_vad", "silence_duration_ms": 800},
    },
}))
```

## 工具调用

```python
import asyncio
import json
import websockets

PROXY_URL = "ws://localhost:4000/v1/realtime?model=vertex-gemini-live"

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"},
                    "unit": {"type": "string", "enum": ["fahrenheit", "celsius"]},
                },
                "required": ["location"],
            },
        },
    }
]


def get_weather(location: str, unit: str = "fahrenheit") -> dict:
    return {
        "location": location,
        "temperature": 72 if unit == "fahrenheit" else 22,
        "unit": unit,
        "conditions": "sunny",
    }


TOOL_FUNCTIONS = {"get_weather": get_weather}


async def main():
    async with websockets.connect(
        PROXY_URL,
        additional_headers={
            "Authorization": "Bearer sk-<your-litellm-api-key>",
            "X-Serverless-Authorization": "Bearer sk-<your-litellm-api-key>",
        },
    ) as ws:
        _ = json.loads(await ws.recv())  # session.created

        # Required for tool calling: send tools in session.update
        await ws.send(
            json.dumps(
                {
                    "type": "session.update",
                    "session": {
                        "instructions": "Use get_weather for weather questions.",
                        "modalities": ["audio"],
                        "tools": TOOLS,
                    },
                }
            )
        )

        await ws.send(
            json.dumps(
                {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "message",
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": "What's the weather in San Francisco?"}
                        ],
                    },
                }
            )
        )
        await ws.send(json.dumps({"type": "response.create"}))

        async for raw in ws:
            ev = json.loads(raw)
            t = ev.get("type", "")

            if t == "response.text.delta":
                print(ev.get("delta", ""), end="", flush=True)
            elif t == "response.function_call_arguments.done":
                fn_name = ev.get("name", "")
                call_id = ev.get("call_id", "")
                args = json.loads(ev.get("arguments", "{}"))
                result = TOOL_FUNCTIONS[fn_name](**args)

                await ws.send(
                    json.dumps(
                        {
                            "type": "conversation.item.create",
                            "item": {
                                "type": "function_call_output",
                                "call_id": call_id,
                                "output": json.dumps(result),
                            },
                        }
                    )
                )
                await ws.send(json.dumps({"type": "response.create"}))
            elif t == "response.done":
                print("\n[done]")
                break
            elif t == "error":
                print(ev)
                break


if __name__ == "__main__":
    asyncio.run(main())
```

### 配置与运行

```yaml
model_list:
  - model_name: vertex-gemini-live
    litellm_params:
      model: vertex_ai/gemini-live-2.5-flash-native-audio
      vertex_project: your-gcp-project-id
      vertex_location: us-central1

litellm_settings:
  # Required for tool calling with Gemini/Vertex Live:
  # defer setup until client sends session.update (with tools)
  gemini_live_defer_setup: true
```

```bash
litellm --config config.yaml --port 4000
python test_realtime_tool_calling.py
```

## 支持的 OpenAI Realtime 事件

**客户端 → 代理**（→ Vertex AI）

| OpenAI 事件 | 说明 |
|---|---|
| `input_audio_buffer.append` | 转发为 `realtime_input.audio` |
| `conversation.item.create` | 转发为 `realtime_input.text` |
| `session.update` | 静默忽略：Vertex AI 不支持在会话中途重新配置 |
| `response.create` | 静默忽略：Vertex AI 会在每轮对话结束后自动响应 |

**Vertex AI → 代理**（→ 客户端）

| 发出的 OpenAI 事件 | Vertex AI 来源 |
|---|---|
| `session.created` | 在 `setupComplete` 之后合成 |
| `response.text.delta` | `serverContent.modelTurn.parts[].text` |
| `response.audio.delta` | `serverContent.modelTurn.parts[].inlineData` |
| `response.audio_transcript.delta` | `serverContent.outputTranscription.text` |
| `conversation.item.input_audio_transcription.completed` | `serverContent.inputTranscription.text` |
| `response.done` | `serverContent.turnComplete` |

## 限制

- 不转发 `session.update`（Vertex AI 每条连接只接受一条 setup 消息）。
- 语音转写要求在初始 setup 消息中设置 `outputAudioTranscription: {}`（LiteLLM 会自动完成）。

## 注意事项

- 工具调用依赖带 `tools` 的 `session.update`。
- 如果跳过 `session.update`，将不会触发任何工具调用。
- 出于向后兼容考虑，`gemini_live_defer_setup` 默认为 `false`。
