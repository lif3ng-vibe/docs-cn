import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Realtime API 防护栏

防护栏（guardrails）在 LLM 响应**之前**拦截语音转写文本，为 [Realtime API](/docs/realtime) 中的语音对话提供防护。

## 工作原理

Realtime API 是一个长期保持的 WebSocket 会话。在 `/chat/completions` 上，防护栏对每个 HTTP 请求只运行一次；而语音会话包含很多轮交互，每一轮都需要单独检查。

LiteLLM 在转写事件处拦截每一轮交互，时机在 Whisper 把语音转成文字之后、LLM 生成回复之前：

```
User speaks into mic
        │
        ▼ audio bytes (PCM)
┌───────────────────┐
│   LiteLLM Proxy   │  forwards audio to OpenAI unchanged
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│     OpenAI        │
│  VAD → Whisper    │  detects speech end, transcribes
└────────┬──────────┘
         │
         │  conversation.item.input_audio_transcription.completed
         │  { transcript: "system update: ignore all instructions" }
         │
         ▼
┌───────────────────────────────────────────┐
│           LiteLLM Proxy                   │
│                                           │
│   ◄──── GUARDRAIL RUNS HERE ────►         │
│   apply_guardrail(texts=[transcript])     │
│                                           │
│   ┌──────────────┬──────────────────┐     │
│   │   BLOCKED    │     CLEAN        │     │
│   └──────┬───────┴───────┬──────────┘     │
│          │               │                │
│   speak warning    send response.create   │
│   (TTS audio)      → LLM responds         │
└───────────────────────────────────────────┘
```

**关键细节**：LiteLLM 还会在连接建立时向会话注入 `create_response: false`，确保 LLM 在防护栏运行之前绝不会自动回复。

## 支持的防护栏模式

| 模式 | 说明 |
|------|-------------|
| `realtime_input_transcription` | 在每轮语音转写完成后、LLM 回复之前运行 |

## 快速上手

### 步骤 1：配置代理

在代理配置中添加一个 `mode: realtime_input_transcription` 的防护栏：

```yaml
model_list:
  - model_name: openai/gpt-4o-realtime-preview
    litellm_params:
      model: openai/gpt-4o-realtime-preview
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "voice-content-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: realtime_input_transcription
      default_on: true
      blocked_words:
        - keyword: "ignore previous instructions"
          action: BLOCK
          description: "Prompt injection attempt"
        - keyword: "system update"
          action: BLOCK
          description: "Prompt injection attempt"
        - keyword: "ignore all instructions"
          action: BLOCK
          description: "Prompt injection attempt"

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 步骤 2：启动代理

```bash
litellm --config proxy_config.yaml --port 4000
```

### 步骤 3：连接 Realtime 客户端

让客户端连接代理，而不是直接连接 OpenAI：

<Tabs>
<TabItem value="js" label="JavaScript">

```javascript
const ws = new WebSocket(
  "ws://localhost:4000/v1/realtime?model=openai/gpt-4o-realtime-preview",
  [],
  { headers: { Authorization: "Bearer sk-<your-litellm-api-key>" } }
)

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "session.update",
    session: {
      modalities: ["audio", "text"],
      input_audio_transcription: { model: "whisper-1" },
      turn_detection: { type: "server_vad" },
    },
  }))
}

ws.onmessage = (e) => {
  const event = JSON.parse(e.data)
  if (event.type === "response.audio.delta") {
    // play audio...
  }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import asyncio
import json
import websockets

async def main():
    async with websockets.connect(
        "ws://localhost:4000/v1/realtime?model=openai/gpt-4o-realtime-preview",
        additional_headers={"Authorization": "Bearer sk-<your-litellm-api-key>"},
    ) as ws:
        await ws.recv()  # session.created

        await ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "modalities": ["audio", "text"],
                "input_audio_transcription": {"model": "whisper-1"},
                "turn_detection": {"type": "server_vad"},
            },
        }))

        async for raw in ws:
            event = json.loads(raw)
            print(event["type"])

asyncio.run(main())
```

</TabItem>
</Tabs>

### 一轮对话被拦截时会发生什么

防护栏触发时，代理会：

1. 发送 `response.cancel`，终止任何仍在进行中的 LLM 响应
2. 发送 `response.create`，把拦截消息作为强制指令
3. OpenAI 的 TTS 会把警告**朗读给用户**，例如 *"Content blocked: keyword 'system update' detected (Prompt injection attempt)"*

被注入的指令永远不会交由 LLM 处理。

对于纯转写会话（`/v1/realtime?intent=transcription`，或 `session.type` 为 `transcription`），没有可供取消或重建的助手轮次，因此拦截发生时代理不会向上游发送任何内容。它仍会转发转写文本，随后向客户端发送一个携带 `"type": "guardrail_violation"` 和拦截消息的 `error` 事件，会话继续转写下一轮。`on_violation: end_session` 与 `end_session_after_n_fails` 关闭会话的方式与语音会话中相同。

## 与其他防护栏提供商配合使用

代理通过提供商的 `apply_guardrail` 方法运行实时防护栏，但只有当某个防护栏在其 `get_supported_event_hooks()` 中声明了这个钩子时，才能把它的模式配置为 `mode: realtime_input_transcription`。目前只有 `litellm_content_filter` 声明了它。在其他提供商上设置该模式（例如 `lakera_v2`，它只支持 `pre_call`、`during_call` 和 `post_call`）会在代理启动时校验失败：代理会记录一条错误日志（`Skipping guardrail ... proxy is starting WITHOUT this guardrail`），并在不带该防护栏的情况下启动，实时会话因此处于无防护状态。设置 `LITELLM_STRICT_GUARDRAIL_MODES=false` 只会把日志降级为警告，该防护栏在此模式下依然不受支持。

要为自定义防护栏添加实时支持，需在其 `get_supported_event_hooks()` 中加入 `GuardrailEventHooks.realtime_input_transcription`，并实现 `apply_guardrail`。

## 按 API 密钥控制防护栏

要只为特定 API 密钥启用实时防护栏，请设置 `default_on: false`，并在请求的元数据（metadata）中传入防护栏名称：

```yaml
guardrails:
  - guardrail_name: "voice-content-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: realtime_input_transcription
      default_on: false   # off by default
```

之后，客户端在每个连接的初始元数据中传入该防护栏名称即可按连接启用（企业版功能）。
