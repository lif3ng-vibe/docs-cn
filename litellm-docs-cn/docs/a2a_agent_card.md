# A2A 智能体卡片

LiteLLM 可以代理[兼容 A2A 的智能体](https://a2a-protocol.org/latest/specification/)，把它们暴露给你的客户端，同时提供虚拟密钥（virtual key）、团队作用域（team scoping）、可观测性（observability），以及统一的智能体卡片（agent card）。

本页说明 LiteLLM 目前支持哪些 A2A 智能体卡片字段、调用是如何进行的，以及代理版智能体卡片（由 `/a2a/{agent_id}/.well-known/agent.json` 提供）会包含什么。

各提供商的具体接入方式见：

- [注册 LangGraph Platform 智能体](/docs/providers/langgraph)

## 智能体卡片支持

下表字段与 A2A v1.0 规范的[§4.4 Agent Discovery Objects](https://a2a-protocol.org/latest/specification/)一致。✅ 表示该字段存在于 LiteLLM 提供给客户端的智能体卡片中；❌ 则表示不存在。

### AgentCard (§4.4.1)

| 字段 | 是否支持 |
|---|---|
| `protocolVersion` | ✅ |
| `name` | ✅ |
| `description` | ✅ |
| `supportedInterfaces` | ✅ |
| `provider` | ✅ |
| `version` | ✅ |
| `documentationUrl` | ✅ |
| `capabilities` | ✅ |
| `securitySchemes` | ✅ |
| `securityRequirements` | ✅ |
| `defaultInputModes` | ✅ |
| `defaultOutputModes` | ✅ |
| `skills` | ✅ |
| `signatures` | ❌ |
| `iconUrl` | ✅ |

### AgentProvider (§4.4.2)

| 字段 | 是否支持 |
|---|---|
| `url` | ✅ |
| `organization` | ✅ |

### AgentCapabilities (§4.4.3)

| 字段 | 是否支持 |
|---|---|
| `streaming` | ✅ |
| `pushNotifications` | ❌ |
| `extensions` | ❌ |
| `extendedAgentCard` | ❌ |

若 `capabilities` 块中的 `streaming` 不为真值，即表示该智能体无法流式：对它发起的流式对话补全会以一次阻塞的 `message/send` 执行，并以单个分块回放。若卡片中没有 `capabilities` 块，则保留 `message/stream`。

### AgentExtension (§4.4.4)

| 字段 | 是否支持 |
|---|---|
| `uri` | ❌ |
| `description` | ❌ |
| `required` | ❌ |
| `params` | ❌ |

### AgentSkill (§4.4.5)

| 字段 | 是否支持 |
|---|---|
| `id` | ✅ |
| `name` | ✅ |
| `description` | ✅ |
| `tags` | ✅ |
| `examples` | ✅ |
| `inputModes` | ✅ |
| `outputModes` | ✅ |
| `securityRequirements` | ❌ |

### AgentInterface (§4.4.6)

| 字段 | 是否支持 |
|---|---|
| `url` | ✅ |
| `protocolBinding` | ✅ |
| `tenant` | ❌ |
| `protocolVersion` | ✅ |

### AgentCardSignature (§4.4.7)

| 字段 | 是否支持 |
|---|---|
| `protected` | ❌ |
| `signature` | ❌ |
| `header` | ❌ |

## A2A 在 LiteLLM 上的工作方式

在 LiteLLM 中注册 A2A 智能体时：

1. 你提供一个基础 URL（部分提供商还需要一个助手标识符）。
2. LiteLLM 依次从智能体的 `/.well-known/agent-card.json`、`/.well-known/agent.json`、`/agentCard/v1.0` 拉取上游智能体卡片，命中第一个有响应的路径即停止。若在智能体的 `litellm_params` 中设置 `agent_card_path`（例如 `agentCard/v1.0`，即 Microsoft Foundry 提供的路径），则会直接拉取该路径。
3. 你在 LiteLLM UI 中审阅解析出的卡片，选择要暴露哪些技能和字段，并为客户端选定**协议版本**（`1.0` 或 `0.3`）。
4. LiteLLM 保存整理后的卡片，并在以下路径提供：

    ```
    GET /a2a/{agent_id}/.well-known/agent.json
    ```

5. 客户端通过如下方式调用智能体：

    ```
    POST /a2a/{agent_id}
    ```

    使用 A2A JSON-RPC 2.0（参见下文[支持的 A2A 方法](#支持的-a2a-方法)）。

## 协议版本

LiteLLM 会把上游智能体的响应转换为该智能体固定的 `protocolVersion`。无论上游智能体原生说的是哪个版本，客户端看到的始终是你选定的版本。

| `protocolVersion` | 提供给客户端的内容 |
|-------------------|-------------------|
| `"1.0"`（新建卡片默认） | Protobuf JSON 信封：`result.message`，流式事件为 `statusUpdate` / `artifactUpdate` |
| `"0.3"` | 旧版按 `kind` 区分的 JSON：`result.kind == "message"` |

可在智能体卡片 UI 中设置，或在注册时写入 `agent_card_params`。不支持的取值会被拒绝并返回 HTTP 400。

LangGraph、Bedrock AgentCore 这类补全桥接（completion-bridge）智能体无需额外的提供商配置。仅当客户端要求特定的线上（wire）格式时，才需要固定 `protocolVersion`。

若未固定 `protocolVersion`，客户端如何协商见[协议版本](./a2a#协议版本)。

## 支持的 A2A 方法

下列方法均可通过 `POST /a2a/{agent_id}` 调用（`message/send` 也可通过 `POST /a2a/{agent_id}/message/send` 调用）。LiteLLM 还接受 A2A SDK 的 PascalCase 别名（例如 `GetTask` → `tasks/get`）。

| Method | 是否支持 | LiteLLM 的处理方式 |
|---|---|---|
| `message/send` | ✅ | 经 LiteLLM A2A SDK（`asend_message`）路由，支持日志、防护栏（guardrails）与成本追踪 |
| `message/stream` | ✅ | 经 LiteLLM 流式处理器路由，返回 NDJSON/SSE 响应 |
| `tasks/get` | ✅ | JSON-RPC 转发到智能体的 `agent_card_params.url` |
| `tasks/list` | ✅ | JSON-RPC 转发到上游 |
| `tasks/cancel` | ✅ | JSON-RPC 转发到上游 |
| `tasks/resubscribe` | ✅ | JSON-RPC 转发到上游（流式/SSE） |
| `tasks/pushNotificationConfig/set` | ✅ | JSON-RPC 转发到上游 |
| `tasks/pushNotificationConfig/get` | ✅ | JSON-RPC 转发到上游 |
| `tasks/pushNotificationConfig/list` | ✅ | JSON-RPC 转发到上游 |
| `tasks/pushNotificationConfig/delete` | ✅ | JSON-RPC 转发到上游 |
| `agent/getAuthenticatedExtendedCard` | ✅ | JSON-RPC 转发到上游；`result.url` 会改写为代理地址 |

### SDK 中的 PascalCase 别名

| SDK / 别名 | 对应的线上方法 |
|---|---|
| `SendMessage` | `message/send` |
| `SendStreamingMessage` | `message/stream` |
| `GetTask` | `tasks/get` |
| `ListTasks` | `tasks/list` |
| `CancelTask` | `tasks/cancel` |
| `SubscribeToTask` | `tasks/resubscribe` |
| `CreateTaskPushNotificationConfig` | `tasks/pushNotificationConfig/set` |
| `GetTaskPushNotificationConfig` | `tasks/pushNotificationConfig/get` |
| `ListTaskPushNotificationConfigs` | `tasks/pushNotificationConfig/list` |
| `DeleteTaskPushNotificationConfig` | `tasks/pushNotificationConfig/delete` |
| `GetExtendedAgentCard` | `agent/getAuthenticatedExtendedCard` |

### 使用要求

- **任务类与推送通知类方法**要求 `agent_card_params.url` 指向一台真实的 A2A JSON-RPC 服务器。LiteLLM 原样转发请求体（鉴权头除外）。
- **仅补全桥接的智能体**（例如配置了 `custom_llm_provider` 而没有 `url` 的 LangGraph、Bedrock AgentCore）只支持 `message/send` 和 `message/stream`。未配置上游 URL 时，任务类 API 会返回错误。
- **仅限 `message/send` / `message/stream`**：LiteLLM 可能会从 `params` 中剔除 LiteLLM 特有的键（例如 `guardrails`）。任务类方法的 `params` 会原样转发，因此 `id` 等 A2A 字段得以保留。

### 两步任务流程示例

```bash title="1. 发送消息（0.3 线上格式，固定 protocolVersion: 0.3）"
curl -X POST "http://localhost:4000/a2a/my-agent" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "r1",
    "method": "message/send",
    "params": {
      "message": {
        "kind": "message",
        "role": "user",
        "messageId": "m1",
        "parts": [{"kind": "text", "text": "Hello"}]
      }
    }
  }'
```

把响应中的 `result.id` 用作任务 id：

```bash title="2. 轮询任务状态"
curl -X POST "http://localhost:4000/a2a/my-agent" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "r2",
    "method": "tasks/get",
    "params": {"id": "<task-id-from-step-1>"}
  }'
```

---

## 技能路由

客户端在消息 metadata 中带上 `skillId` 即可调用特定技能：

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "message/send",
  "params": {
    "message": {
      "messageId": "msg-001",
      "role": "user",
      "parts": [{"kind": "text", "text": "..."}],
      "metadata": {"skillId": "triage_ticket"}
    }
  }
}
```

LiteLLM 会把包括 metadata 在内的整个消息信封原样转发给上游智能体。读取 `skillId` 并在内部完成路由，由上游智能体负责。

## 编辑智能体卡片

你可以在 LiteLLM UI 的智能体详情页编辑受支持的字段。使用 **Re-sync from upstream**（从上游重新同步）按钮，可以获取注册之后上游智能体新增的技能或能力；该按钮会展示差异，你可以选择性地接受改动。

## 相关文档

- [注册 LangGraph Platform 智能体](/docs/providers/langgraph)
- [A2A 协议规范（v1.0）](https://a2a-protocol.org/latest/specification/)
