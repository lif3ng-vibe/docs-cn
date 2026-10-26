import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI 语音转写

| 属性 | 说明 |
|-------|-------|
| 描述 | Vertex AI 上的 Gemini 语音转文本（speech-to-text），经 OpenAI `/v1/audio/transcriptions` 端点调用；以及 Chirp 流式语音转文本，经 `/v1/realtime` 调用 |
| LiteLLM 中的提供商路由 | `vertex_ai/gemini-3.5-transcribe-preview`（批处理）、`vertex_ai/chirp_3`（实时，[见下文](#chirp-实时转写)） |
| 支持的 OpenAI 参数 | `language`、`response_format`（`json`、`text`） |

Vertex AI 上的 Gemini 转写模型部署在 `global` 位置；未设置 `vertex_location` 时，LiteLLM 默认就使用它。如果你配置了区域位置（config 文件、`litellm.vertex_location`，或 `VERTEXAI_LOCATION` / `VERTEX_LOCATION` 环境变量），该值优先生效，而模型不可用的区域会从 Vertex 返回 404，因此这几类模型请固定使用 `vertex_location: global`。

更想用 API 密钥而不是 GCP 服务账号？同一模型也可通过 [Google AI Studio](./gemini.md#audio-transcription-speech-to-text) 以 `gemini/gemini-3.5-transcribe` 的形式使用。

## 快速上手

### LiteLLM Python SDK

```python showLineNumbers title="Gemini 转写快速上手"
from litellm import transcription

audio_file = open("speech.wav", "rb")
response = transcription(
    model="vertex_ai/gemini-3.5-transcribe-preview",
    file=audio_file,
    language="en",
    vertex_project="your-project-id",
    vertex_credentials="/path/to/service_account.json",
)
print(response.text)
```

### LiteLLM AI 网关

**1. 配置 config.yaml**

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-transcribe
    litellm_params:
      model: vertex_ai/gemini-3.5-transcribe-preview
      vertex_project: "your-project-id"
      vertex_credentials: "/path/to/service_account.json"
```

**2. 启动代理**

```bash title="启动 LiteLLM 代理"
litellm --config /path/to/config.yaml
```

**3. 发起请求**

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Gemini 转写快速上手"
curl http://0.0.0.0:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F file=@speech.wav \
  -F model=gemini-transcribe \
  -F language=en
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Gemini 转写快速上手"
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

audio_file = open("speech.wav", "rb")
response = client.audio.transcriptions.create(
    model="gemini-transcribe",
    file=audio_file,
    language="en",
)
print(response.text)
```

</TabItem>
</Tabs>

## 支持的参数

`language` 接受两位字母代码或 BCP-47 标签，发送给 Gemini 前会归一化为 BCP-47。`response_format` 支持 `json`（默认）和 `text`；Vertex AI 上的 Gemini 转写不返回词级时间戳，因此 `verbose_json`、`srt` 和 `vtt` 会被 400 拒绝，除非设置了 `drop_params`——此时这些参数被丢弃，返回纯文本转写结果。

## 用量与成本追踪

Vertex AI 按模态拆分上报 Token 用量，LiteLLM 分别追踪音频输入 Token 和文本输出 Token，因此花费日志与 `x-litellm-response-cost` 响应头都能体现 Google 公布的语音转写按 Token 计费价格。

## Chirp 实时转写

LiteLLM 通过代理的 OpenAI 兼容 `/v1/realtime` 端点提供 Google Cloud Speech-to-Text Chirp 模型。客户端使用 OpenAI Realtime 转写协议；LiteLLM 将客户端的 PCM16 音频经 gRPC 流式传输到 Speech-to-Text v2 的 `StreamingRecognize`，并把 Google 的中间与最终结果映射回 OpenAI 事件。下方的 [Python 示例](#openai-sdk-客户端示例)是一个使用 OpenAI SDK 的完整按住说话会话。

### 1. 安装 Speech-to-Text 客户端

流式功能依赖 `google-cloud-speech`，安装 `stt-vertex-chirp` 扩展依赖即可获得。官方 Docker 镜像已内置该依赖

```bash showLineNumbers title="安装扩展依赖"
pip install 'litellm[stt-vertex-chirp]'
```

缺少该依赖时，第一个会话会报错 `google-cloud-speech is not installed`

### 2. 在配置中添加模型

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chirp-3
    litellm_params:
      model: vertex_ai/chirp_3
      vertex_project: "your-project-id"
      vertex_location: us
      vertex_credentials: "/path/to/service_account.json"
```

`vertex_credentials` 未设置时回退到 `VERTEXAI_CREDENTIALS` 环境变量；`vertex_project` 和 `vertex_location` 依次回退到 `litellm.vertex_project`、`litellm.vertex_location`，再到 `VERTEXAI_PROJECT` 和 `VERTEXAI_LOCATION`。位置默认为 `us`，并据此选择区域端点 `<location>-speech.googleapis.com`（`global` 对应 `speech.googleapis.com`），请选择 Speech-to-Text 实际提供该模型的位置。`api_base` 为可选参数，且只有其中的主机名会被使用。Chirp 部署不支持实时健康检查：请改用 `mode: audio_transcription` 做健康检查，它走同一部署提供的批处理 `/v1/audio/transcriptions` 端点

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config /path/to/config.yaml
```

### 3. 建立连接

```text
ws://localhost:4000/v1/realtime?model=chirp-3&intent=transcription
```

使用 `Authorization: Bearer <proxy key>` 完成认证。`model` 对应配置中的 `model_name`，为必填项；只带 `intent=transcription` 时会路由到代理默认的 OpenAI 转写模型。`intent=transcription` 会把会话限定为纯转写，并把 `session.update` 中指定的任何模型固定为你被授权使用的那个

套接字一旦被接受，LiteLLM 就会发出带 `object: realtime.transcription_session` 的 `session.created`，其中携带默认值：模型 `chirp_3`、24000 Hz 单声道 `audio/pcm`、服务器 VAD、不限语言

### 4. 配置会话

发送一次 `session.update`（或 `transcription_session.update`）。LiteLLM 会以 `session.updated` 回应，回显归一化后的会话；之后再发的更新都会被忽略。更新之前发送的音频会被缓冲并在更新之后重放，所以你可以立即开始流式传输

```json showLineNumbers title="session.update"
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": {"type": "audio/pcm", "rate": 24000, "channels": 1},
        "transcription": {"model": "chirp_3", "language": "en"},
        "turn_detection": {"type": "server_vad"}
      }
    }
  }
}
```

| 字段 | 规则 |
| --- | --- |
| `type` | `transcription`、`realtime` 或省略。其他取值一律拒绝。 |
| `format` | `type` 必须为 `audio/pcm`（或 `pcm16`），`rate` 取 `8000` 到 `48000` 之间的整数，`channels` 如提供必须为 `1`。省略时表示 24 kHz 单声道。 |
| `transcription.model` | 可选。带 `intent=transcription` 时，代理会将其替换为你被授权的模型；不带时只接受 `chirp_3` 或 `vertex_ai/chirp_3`。 |
| `transcription.language` | 可选的 BCP-47 标签。常见语言的两位字母代码会扩展为默认区域（`en` 变为 `en-US`，`pt` 变为 `pt-BR`，`zh` 变为 `zh-CN`）；其他取值原样发送。省略时由 Google 自动检测语言。 |
| `turn_detection` | 选择模式（见下表）。`type` 为 `server_vad` 以外的取值会被拒绝；不带 `type` 的对象表示服务器 VAD。 |
| 其他 `transcription` 键 | 忽略，并输出一行调试日志。 |
| Beta 布局 | 接受 `input_audio_format: "pcm16"` 加顶层 `input_audio_transcription` 和 `turn_detection` 的组合，采样率为 24 kHz。同一次更新中不要混用两种布局。 |

| | 按住说话 | 服务器 VAD |
| --- | --- | --- |
| `turn_detection` | `null` | 省略，或 `{"type": "server_vad"}` |
| 轮次边界 | 每次 commit 一轮；何时结束由你决定 | Google 检测语句；每条语句有自己的 `item_id` |
| 语音事件 | 无 | 每条语句前后出现 `input_audio_buffer.speech_started` 和 `speech_stopped` |
| 结束轮次 | `input_audio_buffer.commit`（或 `input_audio_buffer.end`）结束当前轮次并产生 `completed`；下一次 `append` 开启新轮次 | 语句自行完成；`commit` 或 `end` 会结束进行中的轮次 |

无效的 `session.update`（编码、声道数、采样率、会话类型、turn detection 类型有误，或指定了别的模型）会以代码 `1006` 关闭连接，且不发出 `error` 事件；原因会以 `Error in client ack messages: ...` 记录在调试级别。append 中出现无效 base64 或奇数个 PCM 字节也会以同样方式关闭连接

### 5. 流式传输音频

`input_audio_buffer.append` 携带按配置采样率编码的 base64 单声道 PCM16 音频。单个事件没有大小限制；LiteLLM 会把音频拆成不超过 25 KB 的 gRPC 请求并随到随转发，不做节奏控制，因此文件可以快于实时速度发送。`input_audio_buffer.clear` 会丢弃进行中的轮次，包括已发送的音频和尚未完成的文本，且不发出任何事件。除此之外的所有客户端事件（包括 `response.create`）都会被丢弃

Google 限制单条流式请求的最长运行时间，因此某条流保持打开满 240 秒后，LiteLLM 会切换到新流。切换前它会等待下一次语音停顿（Google 判定的语音活动结束），最迟在 280 秒时切换。按住说话的轮次会跨切换延续：已有文本保留，`commit` 之后收到的 `completed` 会在同一个 `item_id` 下覆盖整个轮次。服务器 VAD 模式下，旧流关闭时 Google 会对已发送的音频做最终化，因此强制切换时仍在进行中的语句（从 240 秒到 280 秒的连续语音）会分成两段、在两个 `item_id` 下完成。计费秒数跨流累计

### 6. 读取转写结果

| 事件 | 字段 | 时机 |
| --- | --- | --- |
| `session.created` | `session.object: realtime.transcription_session`，默认会话 | 建立连接时 |
| `session.updated` | 归一化后的会话：不含 `channels`，`model` 为 `chirp_3`，`language` 为 BCP-47 标签（`en` 变为 `en-US`）或省略 | LiteLLM 接受你的 `session.update` 之后 |
| `input_audio_buffer.speech_started` | `item_id` | 仅服务器 VAD：Google 检测到语音，或该轮次的首段转写文本到达 |
| `conversation.item.input_audio_transcription.delta` | `item_id`、`content_index: 0`、`delta` | 相对该轮次上一次 delta 新增的词，包含中间结果 |
| `input_audio_buffer.speech_stopped` | `item_id` | 仅服务器 VAD：Google 检测到语句结束，或轮次完成 |
| `conversation.item.input_audio_transcription.completed` | `item_id`、`content_index: 0`、`transcript`；自上一次 `completed` 以来 Google 有计费音频时附带 `usage: {"type": "duration", "seconds": 18.0}` | 服务器 VAD：每个最终结果一条，包括连续语音期间的强制流切换。按住说话：`commit` 或 `end` 之后 |
| `error` | `error.type: server_error`；`error.message` 为 `upstream websocket closed with code 1011: Google Speech-to-Text streaming failed: ...` | Google 的流失败；代理随即以代码 `1011` 关闭 |

delta 逐词计算，忽略大小写和标点，因此 Google 修订了前面的词时，delta 会从该词重新开始。最终文本请取自 `completed.transcript`（即 Google 带标点的最终结果），不要靠拼接 delta 得到。轮次之间通过 `item_id` 关联。最后一个 `completed` 之后会话保持打开，直到你主动关闭；只有 Google 侧失败时代理才会自行关闭会话

### 定价与用量

Chirp 按音频秒数计费（模型成本映射中的 `input_cost_per_second`）。`usage.seconds` 是自上一次 `completed` 以来 Google 计费的音频时长，静音也算在内，因此可能超过语句本身的长度。最后一次 `completed` 事件之后才计费的音频（如结尾的静音）会在会话关闭时记入成本日志

除非关闭消息日志，转写文本会存入花费日志的 messages 字段

### 防护栏

`mode: realtime_input_transcription` 的防护栏（guardrails）会在每条完成的转写上运行；参见[实时防护栏](/docs/proxy/guardrails/realtime_guardrails)。`completed` 事件先于防护栏运行送达客户端，delta 不做检查。可通过 `guardrails=name1,name2` 查询参数按连接选择防护栏

:::warning
配置了 `realtime_input_transcription` 防护栏时，LiteLLM 会在会话配置之前把客户端的 `turn_detection: null` 改写为 `{"create_response": false}`，因此按住说话客户端实际运行在服务器 VAD 模式：语句自行完成，`input_audio_buffer.commit` 只会结束进行中的轮次。服务器 VAD 客户端不受影响
:::

### OpenAI SDK 客户端示例

按住说话模式：用 OpenAI SDK 建立连接并完成配置，把单声道 PCM16 的 WAV 文件按 100 ms 分块流式发送，commit，然后持续读取事件直到最终转写到达

```python showLineNumbers title="Chirp 按住说话客户端"
import asyncio
import base64
import wave

import os

from openai import AsyncOpenAI

client = AsyncOpenAI(base_url="http://localhost:4000/v1", api_key=os.environ["LITELLM_API_KEY"])


def pcm_chunks(path, chunk_ms=100):
    with wave.open(path) as w:
        rate, frames = w.getframerate(), w.readframes(w.getnframes())
    step = rate * 2 * chunk_ms // 1000
    return rate, [frames[i : i + step] for i in range(0, len(frames), step)]


async def main():
    rate, chunks = pcm_chunks("speech.wav")
    async with client.realtime.connect(model="chirp-3", extra_query={"intent": "transcription"}) as conn:
        await conn.session.update(
            session={
                "type": "transcription",
                "audio": {
                    "input": {
                        "format": {"type": "audio/pcm", "rate": rate},
                        "transcription": {"model": "chirp-3", "language": "en"},
                        "turn_detection": None,
                    }
                },
            }
        )
        for chunk in chunks:
            await conn.input_audio_buffer.append(audio=base64.b64encode(chunk).decode())
            await asyncio.sleep(0.1)
        await conn.input_audio_buffer.commit()
        async for event in conn:
            if event.type == "conversation.item.input_audio_transcription.delta":
                print(event.delta, end="", flush=True)
            elif event.type == "conversation.item.input_audio_transcription.completed":
                print(f"\n{event.transcript} ({event.usage.seconds} s)")
                break
            elif event.type == "error":
                print(event.error.message)
                break
            else:
                print(event.type)


asyncio.run(main())
```

```text
session.created
session.updated
what is the weather in Paris
What is the weather in Paris? (2.4 s)
```

服务器 VAD 模式下，把 `None` 换成 `"turn_detection": {"type": "server_vad"}`，并在麦克风打开期间持续读取事件：每条检测到的语句都带有自己的 `item_id` 并自行完成，`input_audio_buffer.commit` 则会完成当前进行中的内容
