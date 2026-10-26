import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 智能体迭代预算

通过按会话的迭代次数与预算上限，控制智能体（agent）循环造成的成本失控。

## 概览

智能体在运行智能体循环（agentic loop）时，可能发起不受限的 LLM 调用，带来意外成本。LiteLLM 提供两项控制手段：

| 控制项 | 说明 |
|---------|-------------|
| **最大迭代次数** | 每个会话内 LLM 调用次数的硬性上限 |
| **单会话最大预算** | 每个会话的金额上限（以 `x-litellm-trace-id` 标识会话） |

两项控制都要求请求携带 `session_id`（通过 `x-litellm-trace-id` 请求头或 `metadata.session_id` 传入），以此追踪同一会话内的调用。

## Trace-ID 强制校验

LiteLLM 提供两个相互独立的 trace-id 开关，配置在智能体的 `litellm_params` 中：

| 开关 | 说明 |
|------|-------------|
| `require_trace_id_on_calls_to_agent` | 要求调用该智能体的调用方必须携带 `x-litellm-trace-id`。适用于该智能体只应作为带追踪上下文的子智能体被调用的场景。缺失时返回 **400**。 |
| `require_trace_id_on_calls_by_agent` | 要求该智能体以自身虚拟密钥（virtual key）**发起**的所有 LLM/MCP（Model Context Protocol）调用都必须携带 `x-litellm-trace-id`。`max_iterations` 与 `max_budget_per_session` 的统计正依赖此项才能生效。缺失时返回 **400**。 |

## 通过 UI 配置

在 LiteLLM 管理界面（Admin UI）中创建智能体时：

1. 进入 **Agents** 标签页，点击 **Add Agent**
2. 在 **Agent Settings** 步骤中，展开 **Tracing** 部分
3. 打开 **Require x-litellm-trace-id on calls BY this agent** 开关，以启用会话追踪
4. 设置 **Max Iterations**，限制每个会话的 LLM 调用次数
5. 设置 **Max Budget Per Session ($)**，限制每个会话的花费

这些 trace-id 开关保存在智能体的 `litellm_params` 上；预算控制项（`max_iterations`、`max_budget_per_session`）则保存在虚拟密钥的元数据中。

## 通过 API 配置

在智能体本身上设置 trace-id 强制校验：

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent with budget controls",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "litellm_params": {
      "require_trace_id_on_calls_to_agent": true,
      "require_trace_id_on_calls_by_agent": true
    }
  }'
```

预算控制项设置在智能体的 `litellm_params` 上（而非单个密钥上），因此对该智能体名下的所有密钥一律生效：

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent with budget controls",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "litellm_params": {
      "require_trace_id_on_calls_by_agent": true,
      "max_iterations": 25,
      "max_budget_per_session": 5.00
    }
  }'
```

## 工作原理

### 会话追踪

调用方通过以下任一方式携带 `session_id`，来标识自己的会话：
- **请求头**：`x-litellm-trace-id: my-session-123`
- **元数据**：`{"metadata": {"session_id": "my-session-123"}}`

### 最大迭代次数

在智能体的 `litellm_params` 中设置 `max_iterations` 后：
- 会话内的每次 LLM 调用都会使计数器加一
- 计数器超过 `max_iterations` 时，请求将收到 **429 Too Many Requests**
- 计数器默认 1 小时后过期（可通过环境变量 `LITELLM_MAX_ITERATIONS_TTL` 配置）

### 单会话最大预算

在智能体的 `litellm_params` 中设置 `max_budget_per_session` 后：
- 每次成功的 LLM 调用之后，响应成本会累计到该会话
- 每次调用之前，都会先检查累计花费是否超出预算
- 花费超出预算时，请求将收到 **429 Too Many Requests**
- 会话花费计数器默认 1 小时后过期（可通过环境变量 `LITELLM_MAX_BUDGET_PER_SESSION_TTL` 配置）

## 示例

创建一个最多迭代 25 次、单会话预算上限 5 美元的智能体：

<Tabs>
<TabItem value="ui" label="通过 UI">

1. 进入 **Agents** → **Add Agent**
2. 配置你的智能体（名称、模型等）
3. 在 **Agent Settings** 中展开 **Tracing** 部分
4. 打开 **Require x-litellm-trace-id on calls BY this agent** 开关
5. 将 **Max Iterations** 设为 `25`
6. 将 **Max Budget Per Session** 设为 `5.00`
7. 接下来为该智能体创建新密钥
8. 点击 **Create Agent**

</TabItem>
<TabItem value="api" label="通过 API">

```bash
# 1. 创建启用 trace-id 强制校验的智能体
curl -X POST 'http://localhost:4000/v1/agents' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent with budget controls",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "litellm_params": {
      "require_trace_id_on_calls_by_agent": true
    }
  }'

# 2. 为该智能体创建密钥
curl -X POST 'http://localhost:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "<agent_id_from_step_1>",
    "key_alias": "my-research-agent-key"
  }'
```

</TabItem>
</Tabs>

### 带会话追踪发起调用

```bash
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Authorization: Bearer sk-agent-key-xxx' \
  -H 'x-litellm-trace-id: session-abc-123' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

在该会话内调用满 25 次或花费满 5 美元后，后续请求将收到：

```json
{
  "error": {
    "message": "Session budget exceeded for session session-abc-123. Current spend: $5.0032, max_budget_per_session: $5.00.",
    "type": "budget_exceeded",
    "code": 429
  }
}
```

## 环境变量

| 变量 | 默认值 | 说明 |
|----------|---------|-------------|
| `LITELLM_MAX_ITERATIONS_TTL` | `3600` (1 hour) | 会话迭代计数器的 TTL（秒） |
| `LITELLM_MAX_BUDGET_PER_SESSION_TTL` | `3600` (1 hour) | 会话预算计数器的 TTL（秒） |
