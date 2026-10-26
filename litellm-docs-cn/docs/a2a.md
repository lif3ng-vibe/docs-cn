import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';
import LiteLLMFlow from '@site/src/components/LiteLLMFlow';

# 智能体网关（A2A 协议）概览

在 LiteLLM AI 网关上接入 A2A（Agent-to-Agent）智能体（agent），以 A2A 协议调用智能体，并在 LiteLLM 日志中追踪请求与响应记录。你还可以管理哪些团队、哪些密钥可以访问已接入的智能体。

<LiteLLMFlow copyCommand={false} agentPrompt={false} highlight="A2A Agent" />

| 功能 | 支持情况 |
|---------|-----------|
| 支持的智能体提供商 | A2A、Vertex AI Agent Engine、LangGraph、Azure AI Foundry、Bedrock AgentCore、Pydantic AI |
| 日志 | ✅ |
| 负载均衡 | ✅ |
| 流式 | ✅ |
| [迭代预算](a2a_iteration_budgets) | ✅ |


:::tip

LiteLLM 遵循 [A2A（Agent-to-Agent）协议](https://github.com/google/A2A)来调用智能体。

:::

## 添加智能体

### 添加 A2A 智能体

你可以通过 LiteLLM 管理界面（Admin UI）添加兼容 A2A 的智能体。

1. 进入 **Agentic** > **Agents**
2. 点击 **Add New Agent**
3. 在 **Configure** 步骤中，填写智能体名称（例如 `ij-local`）以及你的 A2A 智能体的 URL
4. 选择 **Protocol Version**（`1.0` 或 `0.3`），即 LiteLLM 面向客户端为该智能体提供的线上格式（wire format）
5. 继续完成其余步骤并保存智能体

<Image 
  img={require('../img/add_agent_1.png')}
  dark={require('../img/add_agent_1_dark.png')}
  alt="Add New Agent 对话框，展示智能体名称、URL 与协议版本"
  style={{width: '80%', display: 'block', margin: '0'}}
/>

该 URL 应为你的 A2A 智能体的调用地址（例如 `http://localhost:10001`）。

#### 在 config.yaml 中定义智能体

也可以在 `config.yaml` 顶层的 `agents` 键下声明智能体，当网关从 ConfigMap 或其他只读来源部署时尤其有用。`agent_name` 与 `agent_card_params` 均为必填；缺少任一项的条目会在启动时被跳过。

```yaml title="config.yaml"
agents:
  - agent_name: my-agent
    agent_card_params:
      name: "My Agent"
      url: "http://localhost:10001"
      protocolVersion: "1.0"  # or "0.3"
```

通过 API 注册时，也可以用同样的方式设置 `protocolVersion`。

可选的 `litellm_params` 块用于承载每个智能体的配置项，例如 `api_key`、`headers`、`agent_card_path` 以及 Microsoft Entra 凭据；[基于 A2A 的 Foundry 智能体](./providers/azure_ai_agents#通过-a2a-使用-foundry-agent)给出了完整示例

通过配置定义的智能体会与在界面上创建的智能体一起出现在 Agents 标签页和 `GET /v1/agents` 中，并且能在从数据库周期性重载后保留。可以用以下命令验证：

```shell
curl -s http://localhost:4000/v1/agents \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

如果界面上创建的智能体已经占用了你随后在 `config.yaml` 中声明的名称，数据库记录优先，同名配置条目会被跳过，因此该名称始终指向你可以编辑的那条记录。删除数据库中的智能体后，配置条目会在下一次重载时拿回这个名称。

:::info

在 `config.yaml` 中声明的智能体不会存入数据库，因此无法在管理界面（Admin UI）中编辑或删除。要修改它们，请更改配置文件并重启网关。

`agents` 键从下一个版本（`v1.95.0` 之后）开始才能被正确读取。更早的版本请使用 `agent_list`，并注意：在挂接了数据库的网关上，通过配置定义的智能体会被丢弃。

:::

### 添加 Azure AI Foundry 智能体

参阅[这份指南，将你的 Azure AI Foundry 智能体接入 LiteLLM 智能体网关](./providers/azure_ai_agents#litellm-a2a-网关)

在当前 Foundry 门户中创建的智能体暴露的是 A2A 端点而非 Assistants API；注册这类智能体时，请按[基于 A2A 的 Foundry 智能体](./providers/azure_ai_agents#通过-a2a-使用-foundry-agent)所示，在 `agents:` 下配置 Entra 凭据。

### 添加 Vertex AI Agent Engine

参阅[这份指南，将你的 Vertex AI Agent Engine 接入 LiteLLM 智能体网关](./providers/vertex_ai_agent_engine)

### 添加 Bedrock AgentCore 智能体

参阅[这份指南，将你的 Bedrock AgentCore 智能体接入 LiteLLM 智能体网关](./providers/bedrock_agentcore#litellm-a2a-gateway)

### 添加 LangGraph 智能体

参阅[这份指南，注册 LangGraph 智能体并配置其智能体卡片（agent card）](/docs/providers/langgraph)

### 添加 Pydantic AI 智能体

参阅[这份指南，将你的 Pydantic AI 智能体接入 LiteLLM 智能体网关](./providers/pydantic_ai_agent#litellm-a2a-网关)


## 协议版本

LiteLLM 代理基于 **a2a-sdk 1.x** 路由 A2A 智能体，并可按智能体分别向客户端提供 **A2A 0.3** 或 **1.0** 线上格式。上游智能体可能使用其中任一版本；LiteLLM 会把 `message/send`、`message/stream` 以及扩展卡片的响应归一化为你固定的版本。

| 版本 | 线上格式 | 发送结果示例 |
|---------|------------|---------------------|
| **0.3** | 以 `kind` 区分的对象（`message`、`task`、`status-update` 等） | `{"kind": "message", "role": "user", "parts": [{"kind": "text", "text": "..."}]}` |
| **1.0** | Protobuf JSON 信封（`message`、`task`、`statusUpdate`、`artifactUpdate`） | `{"message": {"role": "ROLE_USER", "parts": [{"text": "..."}]}}` |

### 固定协议版本

注册智能体时（界面下拉框或 API），将 `agent_card_params.protocolVersion` 设置为 `"0.3"` 或 `"1.0"`。LiteLLM 会在代理的智能体卡片上按该版本对外提供，并把上游响应转换为对应格式。

只接受 `"0.3"` 和 `"1.0"`；其他取值会在注册时返回 HTTP 400。

### 未固定 `protocolVersion` 时

如果智能体没有固定版本，LiteLLM 会根据客户端请求推断对外提供的版本：

| 客户端信号 | 提供的版本 |
|---------------|----------------|
| JSON-RPC 方法 `SendMessage` 或 `SendStreamingMessage` | `1.0` |
| 请求标头 `a2a-version: 1.x` | `1.0` |
| 其他情况（例如不带标头的 `message/send`） | `0.3` |

:::tip[请始终固定 `protocolVersion`]

未设置时，代理的智能体卡片默认为 `1.0`，但未携带 `a2a-version` 标头的旧式 `message/send` 调用方会收到 **0.3** 形态的响应。请显式固定 `protocolVersion`，确保卡片与响应始终一致。

:::

任务类方法（`tasks/get`、`tasks/list` 等）会原样转发给上游智能体。版本转换只作用于 LiteLLM 集成的消息传递路径。

### 依赖项

LiteLLM 代理的 A2A 路由需要 **a2a-sdk >= 1.1.0**（已包含在 `proxy` / `proxy-dev` 依赖组中）。如果你在自己的代码中调用智能体，请安装匹配的 SDK 版本：

```bash
pip install "a2a-sdk>=1.1.0,<2.0"
```

## 调用智能体

调用方式请参阅[调用 A2A 智能体](./a2a_invoking_agents)指南，支持以下两种方式：
- **A2A SDK**：原生 A2A 协议，完整支持任务与产物（artifact）
- **OpenAI SDK**：熟悉的 `/chat/completions` 接口，模型名带 `a2a/` 前缀

## 追踪智能体日志

调用智能体后，你可以在 LiteLLM 的 **Logs** 标签页中查看请求日志。

日志内容包括：
- 发送给智能体以及从智能体返回的**请求/响应内容**（点开某一行，然后把 **Request & Response** 区块切换为 **JSON**；需要设置 `store_prompts_in_spend_logs: true`）
- **用户、密钥、团队**信息，用于追踪请求由谁发起
- **延迟与成本**指标

<Image 
  img={require('../img/agent2.png')}
  dark={require('../img/agent2_dark.png')}
  alt="A2A 智能体调用的请求日志详情，展示请求 JSON"
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


## 转发 LiteLLM 上下文标头

LiteLLM 调用你的 A2A 智能体时，会随请求发送一些特殊标头（header），用于实现：
- **追踪分组**：同一次智能体执行发起的所有 LLM 调用都归入同一条追踪记录
- **智能体花费追踪**：成本会归因到具体的智能体

| 标头 | 用途 |
|--------|---------|
| `X-LiteLLM-Trace-Id` | 把同一次执行流程中的所有 LLM 调用关联起来 |
| `X-LiteLLM-Agent-Id` | 把花费归因到正确的智能体 |


要启用这些特性，你的 A2A 服务在回呼 LiteLLM 发起任何 LLM 调用时，都必须**转发这些标头**。

### 实现步骤

**步骤 1**：从传入的 A2A 请求中提取标头
```python
def get_litellm_headers(request) -> dict:
    """Extract X-LiteLLM-* headers from incoming A2A request."""
    all_headers = request.call_context.state.get('headers', {})
    return {
        k: v for k, v in all_headers.items() 
        if k.lower().startswith('x-litellm-')
    }
```

**步骤 2**：在 LLM 调用中转发标头
回呼 LiteLLM 时传入提取出的标头：
<Tabs>
<TabItem value="openai" label="OpenAI SDK" default>

```python
from openai import OpenAI

headers = get_litellm_headers(request)

client = OpenAI(
    api_key="sk-your-litellm-key",
    base_url="http://localhost:4000",
    default_headers=headers,  # Forward headers
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello"}]
)
```
</TabItem>

<TabItem value="langchain" label="LangChain">

```python
from langchain_openai import ChatOpenAI

headers = get_litellm_headers(request)

llm = ChatOpenAI(
    model="{{openai_large}}",
    openai_api_key="sk-your-litellm-key",
    base_url="http://localhost:4000",
    default_headers=headers,  # Forward headers
)
```
</TabItem>
<TabItem value="litellm" label="LiteLLM SDK">

```python
import litellm

headers = get_litellm_headers(request)

response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello"}],
    api_base="http://localhost:4000",
    extra_headers=headers,  # Forward headers
)
```
</TabItem>
<TabItem value="requests" label="HTTP (requests/httpx)">

```python
import httpx

headers = get_litellm_headers(request)
headers["Authorization"] = "Bearer sk-your-litellm-key"

response = httpx.post(
    "http://localhost:4000/v1/chat/completions",
    headers=headers,
    json={"model": "{{openai_large}}", "messages": [{"role": "user", "content": "Hello"}]}
)
```
</TabItem>
</Tabs>

### 效果

启用标头转发后，你将看到：

**Langfuse 中的追踪分组**：

<Image
  img={require('../img/a2a_trace_grouping.png')}
  style={{width: '80%', display: 'block', margin: '0', borderRadius: '8px'}}
/>

**智能体花费归因**：

打开 **Usage**，选择 **Agent Usage (A2A)**，停留在 **Cost** 标签页即可查看每个智能体的花费。

<Image
  img={require('../img/a2a_agent_spend.png')}
  dark={require('../img/a2a_agent_spend_dark.png')}
  alt="Agent Usage (A2A) 页面，展示每日花费与各智能体花费"
  style={{width: '80%', display: 'block', margin: '0', borderRadius: '8px'}}
/>

## API 参考

### 端点

| 端点 | 方法 | 用途 |
|----------|--------|---------|
| `POST /a2a/{agent_id}` | JSON-RPC 2.0 | **主入口**，涵盖所有 A2A 方法（见下表） |
| `POST /a2a/{agent_id}/message/send` | JSON-RPC | 别名，仅用于 `message/send` |
| `POST /v1/a2a/{agent_id}/message/send` | JSON-RPC | 别名，仅用于 `message/send` |
| `GET /a2a/{agent_id}/.well-known/agent.json` | Agent card | 服务发现（代理 URL 位于 `url` 字段） |
| `GET /a2a/{agent_id}/.well-known/agent-card.json` | Agent card | 服务发现（标准路径） |

`{agent_id}` 可以是智能体的 UUID，也可以是注册时使用的智能体名称。

### 支持的 JSON-RPC 方法

在 `POST /a2a/{agent_id}` 的 `method` 字段中可以传入以下任意方法：

| Method | Description |
|--------|-------------|
| `message/send` | 发送消息；返回 `task` 或 `message`（LiteLLM 集成路径） |
| `message/stream` | 流式变体（NDJSON/SSE） |
| `tasks/get` | 按 `params.id` 获取任务状态 |
| `tasks/list` | 列出任务（可选 `params.contextId`） |
| `tasks/cancel` | 按 `params.id` 取消任务 |
| `tasks/resubscribe` | 订阅任务更新（流式） |
| `tasks/pushNotificationConfig/set` | 注册推送通知配置 |
| `tasks/pushNotificationConfig/get` | 获取推送配置 |
| `tasks/pushNotificationConfig/list` | 列出某任务的推送配置 |
| `tasks/pushNotificationConfig/delete` | 删除推送配置 |
| `agent/getAuthenticatedExtendedCard` | 扩展智能体卡片 |


**路由说明**：`message/send` 和 `message/stream` 会经过 LiteLLM 的 A2A 客户端（日志、防护栏（guardrails）、花费统计）。其余方法都会转发到 `agent_card_params.url` 指定的上游 URL。任务类 API 依赖该 URL；仅通过补全桥接的智能体只支持消息类方法。

示例、别名与限制请参阅[支持的 A2A 方法](./a2a_agent_card#支持的-a2a-方法)。

### 身份验证

在以下两个标头中任选其一携带你的 LiteLLM 虚拟密钥（virtual key）。当传入的 `Authorization` 标头可能携带发往后端智能体的令牌时（例如使用[基于约定的透传](./a2a_agent_headers#方式-3基于命名约定的转发)转发调用方身份），推荐使用 `x-litellm-api-key`。

```
Authorization: Bearer sk-your-litellm-key
# or
x-litellm-api-key: Bearer sk-your-litellm-key
```

#### 每个智能体的权限校验

虚拟密钥通过身份验证后，LiteLLM 会检查调用密钥（及其所属团队）是否有权调用所请求的智能体；若无权限，响应为 HTTP 403。完整的交集模型与访问组说明请参阅[智能体权限管理](./a2a_agent_permissions)。

#### Trace ID 强制校验（可选，按智能体）

智能体可以要求每个传入请求都携带 Trace ID，以便跨系统串联审计记录。在智能体的 `litellm_params` 中设置 `require_trace_id_on_calls_to_agent: true`。设置后，缺少 `x-litellm-trace-id`（或 `x-litellm-session-id`）的请求会被拒绝并返回 HTTP 400。

```bash title="注册要求传入 Trace ID 的智能体" showLineNumbers
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "audit-critical-agent",
    "agent_card_params": { ... },
    "litellm_params": {
      "require_trace_id_on_calls_to_agent": true
    }
  }'
```

要对智能体自有密钥发起的**出站**调用强制携带 Trace ID，则由同一个 `litellm_params` 块上的 `require_trace_id_on_calls_by_agent` 控制。

#### 子智能体身份传递

当后端智能体自己调用 LiteLLM（发起对话补全或调用子智能体）时，LiteLLM 会转发两个标头以保持追踪链路连续：

- `X-LiteLLM-Trace-Id`：把链路中的所有调用归入同一条追踪记录
- `X-LiteLLM-Agent-Id`：把花费归因到发起调用的智能体

调用方的**虚拟密钥**与**终端用户 ID** 不会自动转发。如果下游智能体需要用户身份，请通过 [`extra_headers` 或 `x-a2a-{agent_name_or_id}-{header}` 约定](./a2a_agent_headers)显式传递。

### 请求格式

LiteLLM 遵循 [A2A JSON-RPC 2.0 规范](https://github.com/google/A2A)。报文结构取决于智能体固定的 `protocolVersion`（未固定时则取决于上述客户端信号）。

<Tabs>
<TabItem value="v03" label="0.3 线上格式" default>

```json title="请求体（0.3）"
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [{"kind": "text", "text": "Your message here"}],
      "messageId": "unique-message-id"
    }
  }
}
```

</TabItem>
<TabItem value="v10" label="1.0 线上格式">

推荐[使用 a2a-sdk 1.x 客户端](./a2a_invoking_agents#a2a-sdk)；当智能体固定为 `1.0` 时，也可以发送 PascalCase 方法名的 JSON-RPC，并附带 `a2a-version: 1.0` 标头。

```json title="请求体（1.0 SDK，protobuf 类型）"
// Build with a2a.types.Message, Part, Role, then wrap in SendMessageRequest
```

</TabItem>
</Tabs>

### 响应格式

<Tabs>
<TabItem value="resp03" label="0.3 响应" default>

```json title="响应（0.3 任务结果）"
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "kind": "task",
    "id": "task-id",
    "contextId": "context-id",
    "status": {"state": "completed", "timestamp": "2025-01-01T00:00:00Z"},
    "artifacts": [
      {
        "artifactId": "artifact-id",
        "name": "response",
        "parts": [{"kind": "text", "text": "Agent response here"}]
      }
    ]
  }
}
```

</TabItem>
<TabItem value="resp10" label="1.0 响应">

```json title="响应（1.0 消息信封）"
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "message": {
      "role": "ROLE_AGENT",
      "messageId": "msg-abc",
      "parts": [{"text": "Agent response here"}]
    }
  }
}
```

流式事件使用 `statusUpdate` / `artifactUpdate` 键，而不是 `kind: "status-update"`。

</TabItem>
</Tabs>

智能体的 JSON-RPC 错误会在可能时以与请求相同的 `id` 放在 `error` 字段中返回。当 `message/send` 返回 `submitted` 状态的任务后，可以用 `tasks/get` 轮询长耗时工作。

### 示例：`tasks/get`

```bash title="message/send 之后轮询任务"
curl -X POST "http://localhost:4000/a2a/my-agent" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "req-2",
    "method": "tasks/get",
    "params": {"id": "task-id-from-send-response"}
  }'
```

## 智能体注册中心

想要一个中心化的注册中心，让团队可以发现公司内有哪些智能体可用？

使用 [AI Hub](./proxy/ai_hub) 把智能体公开，让整个组织都能发现它们，开发者可以直接浏览可用的智能体，无需重复构建。

### 搜索注册中心

`GET /v1/agents` 会列出该密钥可访问的所有智能体。加上 `query=<task>` 后，会按任务与各智能体名称、描述、技能之间的语义相似度对同一批智能体排序。先选定嵌入（embedding）模型：

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: text-embedding-3-small
    litellm_params:
      model: openai/text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  agent_search_embedding_model: text-embedding-3-small
```

```console title="为任务排序智能体" showLineNumbers
$ curl -s "http://localhost:4000/v1/agents?query=translate+a+pdf+document&top_k=3" \
    -H "Authorization: Bearer $LITELLM_KEY" | jq -c '.[] | {agent_name, search_score}'
{"agent_name":"document-translator","search_score":0.6732403392080719}
{"agent_name":"trip-planner","search_score":0.1121043964671429}
{"agent_name":"warehouse-sql-analyst","search_score":0.0946962275274791}
```

`top_k` 默认为 5，上限为 100。每个结果都是普通的智能体对象，外加一个 `search_score`（余弦相似度，越高越好）。排序只覆盖该密钥有权看到的智能体，因此被限制为两个智能体的密钥无论查什么，都只会拿回这两个。未配置 `agent_search_embedding_model` 时，带 `query` 的请求会返回 `400 agent_search_not_configured`；嵌入调用失败时，请求会返回 `503 agent_search_unavailable`。智能体嵌入在每个进程中只计算一次，并在智能体卡片发生变化之前一直复用。

MCP 客户端可以通过一个虚拟工具获得同样的搜索能力。密钥的 `object_permission` 上设置 `mcp_tool_search_enabled: true` 后，在 `/mcp/` 和 `/mcp-rest` 上都能在 `tools/list` 中看到 `agent_search(query, top_k)`，与 `mcp_tool_search`、`mcp_tool_call` 并列：

```console title="在 /mcp-rest 上调用 agent_search" showLineNumbers
$ curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
    -H "Authorization: Bearer $KEY" \
    -d '{"name":"agent_search","arguments":{"query":"check how many units are left in stock","top_k":1}}' \
  | jq -r '.content[0].text | fromjson'
[
  {
    "agent_id": "b21b8787-8b9e-4c5f-a45c-3f5e4061d70e",
    "agent_name": "warehouse-sql-analyst",
    "description": "Answers questions about stock by running SQL queries against the inventory database",
    "skills": [{"name": "Query stock levels", "description": "Run a SQL query against the inventory database and summarize the stock levels it returns", "tags": ["sql", "analytics"]}],
    "score": 0.37912064119364597
  }
]
```

有关如何在密钥上启用这些虚拟工具，请参阅 [MCP 工具搜索](./mcp_tool_search.md)。
