import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 调用 A2A 智能体

本页介绍如何通过 LiteLLM，用不同的方式调用 A2A（Agent-to-Agent）智能体。

:::tip[部署你自己的 A2A 智能体]

想用自己的智能体做测试？部署这个由 Google Gemini 驱动的模板 A2A 智能体：

[**shin-bot-litellm/a2a-gemini-agent**](https://github.com/shin-bot-litellm/a2a-gemini-agent)：一个简单易部署、支持流式的 A2A 智能体

:::

## A2A SDK

使用 [A2A Python SDK](https://pypi.org/project/a2a-sdk)（**>= 1.1.0**）即可通过 LiteLLM 以 A2A 协议调用智能体。

```bash
pip install "a2a-sdk>=1.1.0,<2.0" httpx
```

建议在智能体侧固定 `protocolVersion: "1.0"`（推荐），让响应与 1.x SDK 匹配；如需对齐旧的 `0.3` 线上格式，则改为固定 `"0.3"`。参见[协议版本](./a2a#协议版本)。

:::info[从 a2a-sdk 0.3.x 迁移]

a2a-sdk 1.x 用 `ClientFactory`、protobuf 的 `Message` / `Part` 类型，以及以流事件异步生成器形式出现的 `send_message`，取代了原来的 `A2AClient` 加字典式 `MessageSendParams`。示例见下文。

:::

### 非流式

这个示例演示如何：
1. **列出可用智能体**：查询 `/v1/agents`，查看你的密钥能访问哪些智能体
2. **选择一个智能体**：从列表中挑一个
3. **通过 A2A 调用**：用 A2A 协议向该智能体发送消息

```python showLineNumbers title="invoke_a2a_agent.py"
import asyncio
from uuid import uuid4

import httpx
from a2a.client import A2ACardResolver, ClientConfig, ClientFactory
from a2a.types import Message, Part, Role, SendMessageRequest
from a2a.utils.constants import TransportProtocol

# === CONFIGURE THESE ===
LITELLM_BASE_URL = "http://localhost:4000"  # Your LiteLLM proxy URL
LITELLM_VIRTUAL_KEY = "sk-<your-litellm-api-key>"             # Your LiteLLM Virtual Key
# =======================


def extract_text(parts) -> str:
    return "".join(getattr(p, "text", "") or "" for p in (parts or []))


def handle_event(event) -> None:
    populated = event.ListFields()
    if not populated:
        return
    field, value = populated[0]
    if field.name in ("message", "msg"):
        print(f"[message] {extract_text(value.parts)}")
    elif field.name == "task":
        print(f"[task {value.id}] {value.status.state}")


async def main():
    headers = {"Authorization": f"Bearer {LITELLM_VIRTUAL_KEY}"}

    async with httpx.AsyncClient(headers=headers, timeout=60.0) as http_client:
        # Step 1: List available agents
        response = await http_client.get(f"{LITELLM_BASE_URL}/v1/agents")
        agents = response.json()

        print("Available agents:")
        for agent in agents:
            print(f"  - {agent['agent_name']} (ID: {agent['agent_id']})")

        if not agents:
            print("No agents available for this key")
            return

        # Step 2: Select an agent and invoke it
        selected_agent = agents[0]
        agent_id = selected_agent["agent_id"]
        print(f"\nInvoking: {selected_agent['agent_name']}")

        # Step 3: Discover agent card and create a2a-sdk 1.x client
        base_url = f"{LITELLM_BASE_URL}/a2a/{agent_id}"
        resolver = A2ACardResolver(httpx_client=http_client, base_url=base_url)
        agent_card = await resolver.get_agent_card()

        config = ClientConfig(
            httpx_client=http_client,
            streaming=False,
            supported_protocol_bindings=[
                TransportProtocol.JSONRPC,
                TransportProtocol.HTTP_JSON,
            ],
        )
        client = ClientFactory(config).create(agent_card)

        msg = Message(
            message_id=uuid4().hex,
            role=Role.ROLE_USER,
            parts=[Part(text="Hello, what can you do?")],
        )
        request = SendMessageRequest(message=msg)

        async for event in client.send_message(request):
            handle_event(event)


if __name__ == "__main__":
    asyncio.run(main())
```

### 流式

在 a2a-sdk 1.x 中，把 `ClientConfig` 设为 `streaming=True` 并遍历 `send_message` 即可；同一个 API 同时覆盖流式与非流式：

```python showLineNumbers title="invoke_a2a_agent_streaming.py"
import asyncio
from uuid import uuid4

import httpx
from a2a.client import A2ACardResolver, ClientConfig, ClientFactory
from a2a.types import Message, Part, Role, SendMessageRequest
from a2a.utils.constants import TransportProtocol

# === CONFIGURE THESE ===
LITELLM_BASE_URL = "http://localhost:4000"  # Your LiteLLM proxy URL
LITELLM_VIRTUAL_KEY = "sk-<your-litellm-api-key>"             # Your LiteLLM Virtual Key
LITELLM_AGENT_NAME = "ij-local"             # Agent name registered in LiteLLM
# =======================


async def main():
    base_url = f"{LITELLM_BASE_URL}/a2a/{LITELLM_AGENT_NAME}"
    headers = {"Authorization": f"Bearer {LITELLM_VIRTUAL_KEY}"}

    async with httpx.AsyncClient(headers=headers, timeout=60.0) as http_client:
        resolver = A2ACardResolver(httpx_client=http_client, base_url=base_url)
        agent_card = await resolver.get_agent_card()

        config = ClientConfig(
            httpx_client=http_client,
            streaming=True,
            supported_protocol_bindings=[
                TransportProtocol.JSONRPC,
                TransportProtocol.HTTP_JSON,
            ],
        )
        client = ClientFactory(config).create(agent_card)

        msg = Message(
            message_id=uuid4().hex,
            role=Role.ROLE_USER,
            parts=[Part(text="Tell me a long story")],
        )
        request = SendMessageRequest(message=msg)

        async for event in client.send_message(request):
            populated = event.ListFields()
            if populated:
                field, value = populated[0]
                if field.name in ("message", "msg"):
                    text = "".join(getattr(p, "text", "") or "" for p in value.parts)
                    print(text, end="", flush=True)
        print()


if __name__ == "__main__":
    asyncio.run(main())
```

## /chat/completions API（OpenAI SDK）

你也可以沿用熟悉的 OpenAI SDK，加上 `a2a/` 模型前缀来调用 A2A 智能体。

### 非流式

<Tabs>
<TabItem value="python" label="Python" default>

```python showLineNumbers title="openai_non_streaming.py"
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM Virtual Key
    base_url="http://localhost:4000"  # Your LiteLLM proxy URL
)

response = client.chat.completions.create(
    model="a2a/my-agent",  # Use a2a/ prefix with your agent name
    messages=[
        {"role": "user", "content": "Hello, what can you do?"}
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript showLineNumbers title="openai_non_streaming.ts"
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-<your-api-key>',  // Your LiteLLM Virtual Key
  baseURL: 'http://localhost:4000'  // Your LiteLLM proxy URL
});

const response = await client.chat.completions.create({
  model: 'a2a/my-agent',  // Use a2a/ prefix with your agent name
  messages: [
    { role: 'user', content: 'Hello, what can you do?' }
  ]
});

console.log(response.choices[0].message.content);
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="curl_non_streaming.sh"
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "a2a/my-agent",
    "messages": [
      {"role": "user", "content": "Hello, what can you do?"}
    ]
  }'
```

</TabItem>
</Tabs>

### 流式

<Tabs>
<TabItem value="python" label="Python" default>

```python showLineNumbers title="openai_streaming.py"
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM Virtual Key
    base_url="http://localhost:4000"  # Your LiteLLM proxy URL
)

stream = client.chat.completions.create(
    model="a2a/my-agent",  # Use a2a/ prefix with your agent name
    messages=[
        {"role": "user", "content": "Tell me a long story"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript showLineNumbers title="openai_streaming.ts"
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-<your-api-key>',  // Your LiteLLM Virtual Key
  baseURL: 'http://localhost:4000'  // Your LiteLLM proxy URL
});

const stream = await client.chat.completions.create({
  model: 'a2a/my-agent',  // Use a2a/ prefix with your agent name
  messages: [
    { role: 'user', content: 'Tell me a long story' }
  ],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="curl_streaming.sh"
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "a2a/my-agent",
    "messages": [
      {"role": "user", "content": "Tell me a long story"}
    ],
    "stream": true
  }'
```

</TabItem>
</Tabs>

## Task API（`tasks/get`、`tasks/list` 等）

智能体在 `message/send` 之后返回 `submitted` 状态的任务时，客户端需要用 `tasks/get` 轮询结果。向同一个 LiteLLM 基础 URL 发送 JSON-RPC 请求即可：

```bash showLineNumbers title="tasks_get.sh"
curl -X POST "http://localhost:4000/a2a/${AGENT_ID}" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "req-2",
    "method": "tasks/get",
    "params": {"id": "TASK_ID_FROM_SEND_RESPONSE"}
  }'
```

LiteLLM 会把 `tasks/get`、`tasks/list`、`tasks/cancel`、推送通知相关方法以及 `agent/getAuthenticatedExtendedCard` 转发到上游智能体 URL。完整方法列表见[支持的 A2A 方法](./a2a_agent_card#支持的-a2a-方法)。

## 关键差异

| 方法 | 适用场景 | 优势 |
|--------|----------|------------|
| **A2A SDK** | 原生 A2A 协议集成 | • 完整支持 A2A 协议<br/>• 可访问任务状态与产物<br/>• 支持上下文管理 |
| **OpenAI SDK** | 熟悉的 OpenAI 风格接口 | • 直接替换现有 OpenAI 调用<br/>• 从 LLM 工作流迁移到智能体更轻松<br/>• 兼容现有 OpenAI 工具链 |

:::tip[模型前缀]

使用 OpenAI SDK 时，务必在智能体名称前加 `a2a/` 前缀（例如 `a2a/my-agent`），这样请求才会被路由到 A2A 智能体，而不是某个 LLM 提供商。

:::
