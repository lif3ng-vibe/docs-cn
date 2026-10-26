import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /realtime

用它在 Azure、OpenAI、xAI 等提供商之间实现负载均衡（load balancing）。

支持的提供商：
- OpenAI
- Azure
- xAI（[查看完整文档](/docs/providers/xai_realtime)）
- Google AI Studio (Gemini)
- Vertex AI
- Vertex AI Chirp，仅支持语音转写（[查看完整文档](/docs/providers/vertex_transcription#chirp-实时转写)）
- Bedrock
- Meta Muse Voice，仅支持语音转写（[查看完整文档](/docs/providers/meta#muse-voice-实时转写)）

## 代理用法

### 在配置中添加模型


<Tabs>
<TabItem value="openai" label="OpenAI">

```yaml
model_list:
  - model_name: openai-gpt-4o-realtime-audio
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-10-01
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: realtime
```
</TabItem>
<TabItem value="openai+azure" label="OpenAI + Azure">

```yaml
model_list:
  - model_name: azure-gpt-4o-realtime-audio
    litellm_params:
      model: azure/gpt-4o-realtime-preview
      api_key: os.environ/AZURE_SWEDEN_API_KEY
      api_base: os.environ/AZURE_SWEDEN_API_BASE

  - model_name: azure-gpt-realtime
    litellm_params:
      model: azure/gpt-realtime
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
    model_info:
      mode: realtime

  - model_name: openai-gpt-4o-realtime-audio
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-10-01
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
<TabItem value="xai" label="xAI Grok Voice Agent">

```yaml
model_list:
  - model_name: grok-voice-agent
    litellm_params:
      model: xai/grok-voice-latest
      api_key: os.environ/XAI_API_KEY
    model_info:
      mode: realtime
```

**[查看 xAI Realtime 完整文档 →](/docs/providers/xai_realtime)**

</TabItem>
</Tabs>

### 启动代理

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 测试

用 node 运行这个脚本：`node test.js`

```js
// test.js
const WebSocket = require("ws");

const url = "ws://0.0.0.0:4000/v1/realtime?model=openai-gpt-4o-realtime-audio";
// const url = "wss://my-azure-endpoint.openai.azure.com/openai/realtime?api-version=2024-10-01-preview&deployment=gpt-4o-realtime-preview";
const ws = new WebSocket(url, {
    headers: {
        "api-key": `sk-<your-litellm-api-key>`,
        "OpenAI-Beta": "realtime=v1",
    },
});

ws.on("open", function open() {
    console.log("Connected to server.");
    ws.send(JSON.stringify({
        type: "response.create",
        response: {
            modalities: ["text"],
            instructions: "Please assist the user.",
        }
    }));
});

ws.on("message", function incoming(message) {
    console.log(JSON.parse(message.toString()));
});

ws.on("error", function handleError(error) {
    console.error("Error: ", error);
});
```

## Azure GA 与 beta 实时协议对比

Azure 提供两种实时上游。GA 端点（`/openai/v1/realtime?model=<deployment>`）使用 GA 事件格式（`session.type`、`output_modalities`、嵌套的 `audio`），而较旧的 beta 端点（`/openai/realtime?api-version=2024-10-01-preview&deployment=<deployment>`）使用 beta 事件格式（`modalities`、`voice`、扁平的音频格式）。如果把 GA 格式的 `session.update` 发给 beta 端点，会以 `Unknown parameter: 'session.type'` 报错。

LiteLLM 会根据客户端连接选择上游。发送 `OpenAI-Beta: realtime=v1` 请求头的客户端（即 openai SDK 的 `client.beta.realtime.connect`）会被桥接到 beta 端点；不带这个请求头的客户端（即 openai SDK 的 `client.realtime.connect`，以及大多数语音 Agent 框架）会被桥接到 GA 端点。转写会话（`intent=transcription`）始终走 GA。

```python
import os

from openai import AsyncOpenAI

client = AsyncOpenAI(base_url="http://0.0.0.0:4000", api_key=os.environ["LITELLM_API_KEY"])

async with client.realtime.connect(model="azure-gpt-realtime") as connection:
    await connection.session.update(
        session={"type": "realtime", "output_modalities": ["audio"], "instructions": "Please assist the user."}
    )
    async for event in connection:
        print(event.type)
        if event.type == "session.updated":
            break
```

要想固定使用某一种协议、不管客户端发的是什么，可以在部署上设置 `realtime_protocol`，或者在代理的环境中设置 `LITELLM_AZURE_REALTIME_PROTOCOL`。部署上的设置优先于环境变量，两者又都优先于客户端请求头。实时健康检查（`mode: realtime` 部署上的 `/health`，以及 Admin UI 管理界面里的 Test Connect）读不到客户端请求头，所以除非上述配置固定了协议，否则它探测的是 GA 端点。

```yaml
model_list:
  - model_name: azure-gpt-realtime
    litellm_params:
      model: azure/gpt-realtime
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      realtime_protocol: beta # or GA
```

```bash
export LITELLM_AZURE_REALTIME_PROTOCOL=beta # or GA
```

## 防护栏

你可以将 [LiteLLM 防护栏](https://docs.litellm.ai/docs/proxy/guardrails/quick_start)应用到实时会话上。

### 在密钥或团队上设置防护栏

最省事的生产环境做法：把防护栏绑定到虚拟密钥（virtual key）或团队上，防护栏会始终自动生效，客户端无需任何改动。

参见 [虚拟密钥 → 防护栏](https://docs.litellm.ai/docs/proxy/virtual_keys#guardrails) 和 [团队 → 防护栏](https://docs.litellm.ai/docs/proxy/team_budgets)。

### 动态传入防护栏（便于测试）

打开 WebSocket 时，通过查询参数传入 `guardrails`。
适合在不改动密钥/团队配置的情况下测试防护栏。

```js
// node test.js
const WebSocket = require("ws");

const guardrails = ["your-guardrail-name"]; // comma-separated list
const url = `ws://0.0.0.0:4000/v1/realtime?model=openai-gpt-4o-realtime-audio&guardrails=${guardrails.join(",")}`;

const ws = new WebSocket(url, {
    headers: {
        "Authorization": "Bearer sk-<your-litellm-api-key>",
    },
});

ws.on("open", function open() {
    console.log("Connected — guardrails active:", guardrails);
});

ws.on("message", function incoming(message) {
    const data = JSON.parse(message);
    if (data.type === "error") {
        // Guardrail block is sent as an error event before the connection closes
        console.error("Guardrail error:", data.error.message);
    }
});

ws.on("close", function close(code, reason) {
    console.log("Closed:", code, reason.toString());
    // code 1011 = blocked by guardrail at pre_call
});
```

也可以用 Python：

```python
import asyncio
import websockets

async def main():
    url = "ws://0.0.0.0:4000/v1/realtime?model=openai-gpt-4o-realtime-audio&guardrails=your-guardrail-name"
    async with websockets.connect(
        url,
        additional_headers={"Authorization": "Bearer sk-<your-litellm-api-key>"},
    ) as ws:
        print("Connected — guardrail active")
        async for msg in ws:
            import json
            data = json.loads(msg)
            if data["type"] == "error":
                print("Guardrail blocked:", data["error"]["message"])
                break

asyncio.run(main())
```

当防护栏拦截请求时，代理会先通过 WebSocket 发送一个 `error` 事件，然后关闭连接：

```json
{
    "type": "error",
    "error": {
        "type": "guardrail_error",
        "message": "Guardrail blocked this request: <reason>"
    }
}
```

## 日志记录

为了防止请求被丢弃，LiteLLM 默认只记录以下事件类型：

- `session.created`
- `response.create`
- `response.done`

你可以在配置中设置 `logged_real_time_event_types` 参数来覆盖这个默认行为。例如：

```yaml
litellm_settings:
  logged_real_time_event_types: "*" # Log all events
  ## OR ## 
  logged_real_time_event_types: ["session.created", "response.create", "response.done"] # Log only these event types
```
