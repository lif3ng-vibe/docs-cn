import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# xAI 语音代理（Realtime API）

xAI 的 Grok Voice Agent 通过 WebSocket 连接提供实时语音对话能力，支持自然的双向音频交互。

| 功能 | 支持情况 | 说明 |
| --- | --- | --- |
| LiteLLM AI 网关 | ✅ | 将 WebSocket 客户端连接到代理的 `/v1/realtime` 端点 |
| LiteLLM Python SDK | ❌ | 实时能力由网关提供，而非直接的 SDK 调用 |

## 快速上手

### 支持的模型

| 模型 | 状态 | 说明 |
|-------|--------|-------------|
| `xai/grok-voice-think-fast-1.0` | 推荐 | 旗舰级语音到语音（speech-to-speech）模型 |
| `xai/grok-voice-fast-1.0` | 已弃用 | 旧版语音模型 |
| `xai/grok-voice-latest` | 别名 | 始终指向最新的语音模型（当前为 `grok-voice-think-fast-1.0`） |

这些是专为实时语音到语音对话打造的全双工模型，支持函数调用（function calling）、网页搜索、X 搜索、收藏集搜索、远程 MCP（Model Context Protocol）工具，以及超过 20 种语言的自动语言检测。下文示例使用 `grok-voice-latest`，它始终跟随最新发布版本；如果需要跨版本保持行为稳定，请固定使用 `grok-voice-think-fast-1.0` 这类带版本号的名称。

## LiteLLM 的连接方式

LiteLLM 通过 AI 网关提供 xAI Voice Agent 服务，实时流量走代理的 OpenAI 兼容 `/v1/realtime` WebSocket 端点，而不是直接调用 Python SDK。你可以把任何标准 WebSocket 客户端（Python `websockets`、Node `ws` 或 OpenAI SDK）指向网关，它会携带正确的模型与认证头，把会话转发到 `wss://api.x.ai/v1/realtime`。代理配置和可运行的客户端示例见下文。

## LiteLLM 代理（AI 网关）用法

可在多个 xAI 部署之间做负载均衡，也可以与其他提供商组合使用。

### 1. 将模型加入配置

```yaml
model_list:
  - model_name: grok-voice-agent
    litellm_params:
      model: xai/grok-voice-latest
      api_key: os.environ/XAI_API_KEY
    model_info:
      mode: realtime

  # Optional: Add fallback to OpenAI
  - model_name: grok-voice-agent
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-10-01
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: realtime
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 3. 测试连接

#### Python 客户端

```python
import asyncio
import websockets
import json

async def test_proxy():
    url = "ws://0.0.0.0:4000/v1/realtime?model=grok-voice-agent"
    
    async with websockets.connect(
        url,
        extra_headers={
            "Authorization": "Bearer sk-<your-litellm-api-key>",  # Your LiteLLM proxy key
            "OpenAI-Beta": "realtime=v1"
        }
    ) as ws:
        # First event from the server is session.created
        message = await ws.recv()
        print(f"Connected: {message}")
        
        # Send a message
        await ws.send(json.dumps({
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{
                    "type": "input_text",
                    "text": "Hello from LiteLLM proxy!"
                }]
            }
        }))
        
        # Request response
        await ws.send(json.dumps({
            "type": "response.create"
        }))
        
        # Listen for response
        async for message in ws:
            data = json.loads(message)
            print(f"Event: {data['type']}")
            
            if data['type'] == 'response.done':
                break

asyncio.run(test_proxy())
```

#### Node.js 客户端

```javascript
// test.js - Run with: node test.js
const WebSocket = require("ws");

const url = "ws://0.0.0.0:4000/v1/realtime?model=grok-voice-agent";

const ws = new WebSocket(url, {
    headers: {
        "Authorization": "Bearer sk-<your-litellm-api-key>",
        "OpenAI-Beta": "realtime=v1",
    },
});

ws.on("open", function open() {
    console.log("Connected to xAI via LiteLLM proxy");
    
    // Send a message
    ws.send(JSON.stringify({
        type: "conversation.item.create",
        item: {
            type: "message",
            role: "user",
            content: [{
                type: "input_text",
                text: "What's the weather like?"
            }]
        }
    }));
    
    // Request response
    ws.send(JSON.stringify({
        type: "response.create",
        response: {
            modalities: ["text"],
            instructions: "Please assist the user."
        }
    }));
});

ws.on("message", function incoming(message) {
    const data = JSON.parse(message.toString());
    console.log(`Event: ${data.type}`);
    
    if (data.type === 'response.done') {
        ws.close();
    }
});

ws.on("error", function handleError(error) {
    console.error("Error: ", error);
});
```

## 与 OpenAI 的主要差异

xAI 的 Grok Voice Agent 与 OpenAI 的 Realtime API 存在一些差异：

| 功能 | xAI | OpenAI | LiteLLM 处理方式 |
|---------|-----|--------|------------------|
| WebSocket URL | `wss://api.x.ai/v1/realtime` | `wss://api.openai.com/v1/realtime` | ✅ 自动配置 |
| 模型 | `grok-voice-latest` | `gpt-4o-realtime-preview` | ✅ 通过模型前缀 |
| 音频格式 | PCM (8-48kHz), μ-law, A-law | PCM16 24kHz mono | ✅ 兼容 |

LiteLLM 会自动配置 xAI 端点、设置认证头（不会向 xAI 发送 `OpenAI-Beta` 头），并管理 WebSocket 连接。除此之外没有任何 xAI 特有的处理：Voice Agent API 与 OpenAI 兼容，连接建立时同样会发出 `session.created` 事件，与 OpenAI 一致。音频响应以 `response.output_audio.delta` 流式返回，对应的转写文本则通过 `response.output_audio_transcript.delta` 传输。

## 相关文档

- [xAI 对话/文本模型](/docs/providers/xai)
- [LiteLLM Realtime API 概览](/docs/realtime)
- [xAI 官方文档](https://docs.x.ai/docs)

## 支持

如有问题或疑问：
- [LiteLLM GitHub Issues](https://github.com/BerriAI/litellm/issues)
- [xAI 文档](https://docs.x.ai/docs)
