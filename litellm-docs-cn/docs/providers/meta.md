import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Meta Model API

| 属性 | 说明 |
|-------|-------|
| 描述 | Meta Model API 提供 Muse Spark 推理模型与 Muse Voice 语音转写服务的访问。 |
| LiteLLM 提供商路由 | `meta/` |
| 支持的端点 | `/chat/completions`, `/responses`, `/v1/messages`, `/v1/realtime` |
| 开发者门户 | [Meta Model API ↗](https://dev.meta.ai/) |
| 语音转文本参考 | [Muse Voice 语音转写 ↗](https://dev.meta.ai/docs/speech-to-text) |

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["META_API_KEY"] = ""  # your Meta Model API key
```

对话、Responses 与 Messages 请求默认发往 `https://api.meta.ai/v1`；如需更换基础地址，设置 `META_API_BASE` 即可。Muse Voice 实时转写沿用同一个 `META_API_KEY`，并连接到 `wss://api.meta.ai/v1/asr/realtime`；如何把它指向其他地址，参见 [Muse Voice 实时转写](#muse-voice-实时转写)。

## 支持的模型

:::info
模型列表、价格、Token 窗口等信息由我们持续维护，见[这里](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)。
:::

| 模型 ID | 输入上下文长度 | 输入模态 | 输出模态 |
| --- | --- | --- | --- |
| `muse-spark-1.1` | 1M | 文本、图像、视频、PDF | 文本 |
| `muse-voice-transcribe-1.0` | 不适用 | 音频 | 文本 |

`muse-spark-1.1` 支持函数调用（function calling）、并行函数调用、结构化输出（structured outputs）、提示词缓存、联网搜索溯源（web search grounding），并可通过 `reasoning_effort` 控制推理（取值从 `"minimal"` 到 `"xhigh"`）。

`muse-voice-transcribe-1.0` 是实时语音转文本模型，通过代理的 `/v1/realtime` WebSocket 提供服务，按音频秒数计费。它只支持实时方式：不支持 `/v1/audio/transcriptions` 及其他批处理或文件转写端点。

该 API 还原生提供 Anthropic Messages 格式，因此 LiteLLM 会把 `/v1/messages` 请求原样转发到 `https://api.meta.ai/v1/messages`，保留思考块（thinking blocks）这类 Anthropic 特有的功能。

## Muse Voice 实时转写

LiteLLM 通过代理的 OpenAI 兼容端点 `/v1/realtime` 提供 Muse Voice 服务。客户端按 OpenAI Realtime 转写协议通信；LiteLLM 把客户端的 PCM16 音频封装成二进制帧，流式发往 `wss://api.meta.ai/v1/asr/realtime`，再把 Muse 返回的转写帧映射回 OpenAI 事件。下方的 [Python 示例](#python-客户端示例)就是一个完整的按键说话（push to talk）会话。

### 1. 将模型加入配置

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: muse-voice-transcribe
    litellm_params:
      model: meta/muse-voice-transcribe-1.0
      api_key: os.environ/META_API_KEY
```

`api_key` 缺省时回退到 `META_API_KEY`。`api_base` 可选，必须是绝对的 `wss://` 或 `https://` URL；LiteLLM 会保留其中的主机和端口，并把路径替换为 `/v1/asr/realtime`。`http://`、`ws://`、内嵌凭据和 URL 片段都会被拒绝；实时会话会忽略 `META_API_BASE`。

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 2. 连接

```text
ws://localhost:4000/v1/realtime?model=muse-voice-transcribe&intent=transcription
```

认证使用 `Authorization: Bearer <proxy key>`。`model` 对应配置里的 `model_name`，必填；只带 `intent=transcription` 时会路由到代理默认的 OpenAI 转写模型。`intent=transcription` 会让会话仅做转写，并把 `session.update` 中点名的任何模型固定为你被授权使用的那个。

LiteLLM 连上 Meta 之后、Muse 握手之前，会发出带 `object: realtime.transcription_session` 的 `session.created`。

### 3. 配置会话

发送一次 `session.update`（或 `transcription_session.update`）。Muse 的确认以 `session.updated` 返回，之后的更新会被忽略。在收到 `session.updated` 之前发出的音频会被缓冲并重放，所以你可以立即开始推流。

```json showLineNumbers title="session.update"
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": {"type": "audio/pcm", "rate": 24000, "channels": 1},
        "transcription": {"model": "meta/muse-voice-transcribe-1.0", "language": "en"},
        "turn_detection": null
      }
    }
  }
}
```

| 字段 | 规则 |
| --- | --- |
| `format` | `type` 必须为 `audio/pcm`，`rate` 必须为 `16000` 或 `24000`，`channels` 必须为 `1`。省略时默认单声道 24 kHz。 |
| `transcription.model` | 可选。带 `intent=transcription` 时，代理会把它替换为 `muse-voice-transcribe-1.0`；不带时只接受 `muse-voice-transcribe-1.0` 或 `meta/muse-voice-transcribe-1.0`。 |
| `transcription.language` | 可选，用于向某种语言倾斜，可写语言名称或 ISO 639 代码。地区后缀会被忽略，因此 `en-US`、`zh-Hans`、`pt-BR` 都可以用。 |
| `turn_detection` | 选择模式（见下表）。`type` 只要不是 `server_vad` 就会被拒绝；对象不带 `type` 表示服务端 VAD。 |
| 其他任何字段 | 丢弃，并在代理日志中记录警告。 |
| Beta 布局 | `input_audio_format: "pcm16"` 加 `input_audio_transcription` 在 24 kHz 下可用。一次更新中不要混用两种布局。 |

支持的语言：阿拉伯语、孟加拉语、荷兰语、英语、法语、德语、希伯来语、印地语、印尼语、意大利语、日语、卡纳达语、韩语、马来语、普通话、马拉地语、波兰语、葡萄牙语、西班牙语、他加禄语、泰米尔语、泰卢固语、泰语、土耳其语和越南语。

| | 按键说话 | 服务端 VAD |
| --- | --- | --- |
| `turn_detection` | `null` | 省略，或 `{"type": "server_vad"}` |
| 轮次边界 | 每个会话一轮，何时结束由你决定 | Muse 检测语句，每条语句有自己的 `item_id` |
| 结束轮次 | `input_audio_buffer.commit` 清空缓冲音频并结束 Muse 流 | `input_audio_buffer.commit` 只负责清空；说完后发送 `input_audio_buffer.end` |

无效的 `session.update`（采样率、声道数、轮次检测类型或语言有误）会以 `1006` 关闭连接，且不发送 `error` 事件；原因会以 `Error in client ack messages: ...` 的形式记录在 debug 级日志中。设置完成后的协议违规（例如 append 超过四秒、base64 无效或 PCM 字节数为奇数）也会以同样方式关闭连接。

### 4. 流式传输音频

`input_audio_buffer.append` 携带 base64 编码的单声道 PCM16 音频，采样率使用配置值，每个事件最多四秒。LiteLLM 会把音频重新打包成 80 ms 的二进制帧，并按实时节奏发给 Muse。`input_audio_buffer.clear` 会丢弃 LiteLLM 尚未发出的残帧；已发送给 Muse 的音频无法撤回。其余所有客户端事件（包括 `response.create`）都会被丢弃。

服务端 VAD 要求音频持续实时到达。停顿时请推静音流，结束时发送 `input_audio_buffer.end`（这是 LiteLLM 的事件，不属于 OpenAI 协议）。如果客户端直接停止发送，Meta 会以 `1008` 关闭（`Ingress below real-time`），代理会把它转为一个 `error` 事件，随后以 `1008` 关闭。

### 5. 读取转写结果

| 事件 | 字段 | 时机 |
| --- | --- | --- |
| `session.created` | `session.object: realtime.transcription_session` | 连接建立时，Muse 握手之前 |
| `session.updated` | 规范化后的会话：不含 `channels`，`model` 为 `muse-voice-transcribe-1.0`，`language` 为完整名称（`en` 变为 `English`） | Muse 接受你的 `session.update` 之后 |
| `input_audio_buffer.speech_started` | `item_id` | Muse 检测到一轮开始 |
| `conversation.item.input_audio_transcription.delta` | `item_id`, `content_index: 0`, `delta` | 部分转写文本 |
| `input_audio_buffer.speech_stopped` | `item_id` | Muse 检测到一轮结束 |
| `conversation.item.input_audio_transcription.completed` | `item_id`, `content_index: 0`, `transcript`；若自上一个 `completed` 之后 Muse 又处理了新音频，还会有 `usage: {"type": "duration", "seconds": 1.36}` | 该轮的最终转写 |
| `error` | `error.type: server_error`；`error.message` 为 `Meta Muse realtime transcription failed`，或在非 1000 关闭之前为 `upstream websocket closed with code <N>: <reason>` | Muse 上报失败或异常关闭 |

各轮之间可能重叠，通过 `item_id` 关联。当 Muse 没有更多转写片段时，它会以 `1000` 关闭，原因通常是 `No more transcript segments`，代理会原样转发这次关闭。

### 计费与用量

Muse Voice 按输入音频的秒数计费（模型成本表中的 `input_cost_per_second`）。`usage.seconds` 是自上一个计费点以来 Muse 处理的音频量，静音也算在内，因此可能超过语句本身的长度。最后一次 `completed` 事件之后的音频（比如结尾的静音）会在会话关闭时计费。

只要没有关闭消息日志，转写文本会存入花费日志（spend log）的 messages 字段。代理日志本身不含转写文本；唯一的例外是被防护栏拦截的转写，其前 80 个字符会以 warning 级别记录。

### 防护栏

配置为 `mode: realtime_input_transcription` 的防护栏（guardrails）会对每份完成的转写运行；参见[实时防护栏](/docs/proxy/guardrails/realtime_guardrails)。`completed` 事件会先送达客户端，防护栏之后才运行，delta 片段不做检查。拦截时会发送 `type: guardrail_violation`、`code: content_policy_violation` 的 `error` 事件；若设置 `on_violation: end_session`，还会以 `1000` 关闭套接字。

可通过查询参数 `guardrails=name1,name2` 为单个连接选择防护栏。

:::warning
配置了 `realtime_input_transcription` 防护栏时，LiteLLM 会在 Muse 看到之前把客户端的 `turn_detection: null` 改写成 `{"create_response": false}`，因此按键说话客户端实际运行在服务端 VAD 模式：`input_audio_buffer.commit` 不再结束流，停止推流的客户端会以 `1008` 被断开。服务端 VAD 客户端不受影响。
:::

### Python 客户端示例

按键说话模式：完成配置后，把单声道 PCM16 的 WAV 文件按 100 ms 分块推流，然后 commit，接着持续读取事件，直到代理关闭套接字。

```python showLineNumbers title="Muse Voice push to talk client"
import asyncio
import base64
import json
import wave

import os
import websockets

URL = "ws://localhost:4000/v1/realtime?model=muse-voice-transcribe&intent=transcription"
HEADERS = {"Authorization": f'Bearer {os.environ["LITELLM_API_KEY"]}'}


def pcm_chunks(path, chunk_ms=100):
    with wave.open(path) as w:  # mono PCM16 at 16 kHz or 24 kHz
        rate, frames = w.getframerate(), w.readframes(w.getnframes())
    step = rate * 2 * chunk_ms // 1000
    return rate, [frames[i : i + step] for i in range(0, len(frames), step)]


async def main():
    rate, chunks = pcm_chunks("question.wav")
    async with websockets.connect(URL, additional_headers=HEADERS) as ws:
        print(json.loads(await ws.recv())["type"])  # session.created
        await ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "type": "transcription",
                "audio": {
                    "input": {
                        "format": {"type": "audio/pcm", "rate": rate},
                        "transcription": {"model": "meta/muse-voice-transcribe-1.0"},
                        "turn_detection": None,
                    }
                },
            },
        }))
        print(json.loads(await ws.recv())["type"])  # session.updated
        for chunk in chunks:
            await ws.send(json.dumps({"type": "input_audio_buffer.append", "audio": base64.b64encode(chunk).decode()}))
            await asyncio.sleep(0.1)
        await ws.send(json.dumps({"type": "input_audio_buffer.commit"}))
        try:
            while True:
                event = json.loads(await ws.recv())
                if event["type"] == "conversation.item.input_audio_transcription.delta":
                    print(event["delta"], end="", flush=True)
                elif event["type"] == "conversation.item.input_audio_transcription.completed":
                    seconds = event.get("usage", {}).get("seconds")  # absent when Muse reported no new audio
                    print(f"\n{event['transcript']} ({seconds} s)")
        except websockets.exceptions.ConnectionClosedOK:
            pass  # close code 1000: no more transcript segments


asyncio.run(main())
```

```text
session.created
session.updated
What is the weather in Paris?
What is the weather in Paris? (1.36 s)
```

若用服务端 VAD，把 `None` 换成 `"turn_detection": {"type": "server_vad"}`，麦克风保持开启期间持续推流（静音也要推），最后以 `{"type": "input_audio_buffer.end"}` 收尾。检测到的每条语句都会带有自己的 `item_id`。

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Meta Model API Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["META_API_KEY"] = ""  # your Meta Model API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

response = completion(model="meta/muse-spark-1.1", messages=messages)
```

### 流式

```python showLineNumbers title="Meta Model API Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["META_API_KEY"] = ""  # your Meta Model API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

response = completion(
    model="meta/muse-spark-1.1",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 推理力度

`muse-spark-1.1` 接受以下 `reasoning_effort` 取值：`"minimal"`、`"low"`、`"medium"`、`"high"` 和 `"xhigh"`。

```python showLineNumbers title="Meta Model API Reasoning Effort"
import os
import litellm
from litellm import completion

os.environ["META_API_KEY"] = ""  # your Meta Model API key

messages = [{"content": "What is 15% of 2840?", "role": "user"}]

response = completion(
    model="meta/muse-spark-1.1",
    messages=messages,
    reasoning_effort="xhigh"
)

print(response.choices[0].message.content)
print(response.usage.completion_tokens_details.reasoning_tokens)
```

### 函数调用

```python showLineNumbers title="Meta Model API Function Calling"
import os
import litellm
from litellm import completion

os.environ["META_API_KEY"] = ""  # your Meta Model API key

messages = [{"content": "What's the weather like in San Francisco?", "role": "user"}]

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    }
]

response = completion(
    model="meta/muse-spark-1.1",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message.tool_calls)
```

## 用法 - LiteLLM Proxy

把以下内容加入 LiteLLM 代理配置文件：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: muse-spark-1.1
    litellm_params:
      model: meta/muse-spark-1.1
      api_key: os.environ/META_API_KEY
```

启动 LiteLLM 代理服务器：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Meta Model API via Proxy - Non-streaming"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

response = client.chat.completions.create(
    model="muse-spark-1.1",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    reasoning_effort="minimal"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Meta Model API via Proxy - Streaming"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

response = client.chat.completions.create(
    model="muse-spark-1.1",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Meta Model API via Proxy - LiteLLM SDK"
import litellm

response = litellm.completion(
    model="litellm_proxy/muse-spark-1.1",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Meta Model API via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "muse-spark-1.1",
    "messages": [{"role": "user", "content": "Write a short poem about AI."}],
    "reasoning_effort": "minimal"
  }'
```

</TabItem>
</Tabs>

### Anthropic Messages API

代理的 `/v1/messages` 路由会把 `meta/` 模型的请求原样转发到 Meta 原生的 Anthropic 兼容端点，不做转换。

```bash showLineNumbers title="Meta Model API via Proxy - /v1/messages"
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "muse-spark-1.1",
    "max_tokens": 2048,
    "messages": [{"role": "user", "content": "Write a short poem about AI."}]
  }'
```
