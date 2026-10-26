import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock AgentCore

以 OpenAI 请求/响应格式调用 Bedrock AgentCore。

| 属性 | 说明 |
|----------|---------|
| 描述 | Amazon Bedrock AgentCore 提供对托管智能体运行时（agent runtime）的直接访问，用于结合基础模型执行智能体工作流。 |
| LiteLLM 中的提供商路由 | `bedrock/agentcore/{AGENT_RUNTIME_ARN}` |
| 提供商文档 | [AWS Bedrock AgentCore ↗](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agentcore_InvokeAgentRuntime.html) |

:::info

本文档面向 **AgentCore Agents**（智能体运行时）。如果你想通过 LiteLLM 使用 AgentCore MCP 服务器，请参阅 [MCP AWS SigV4 Auth](https://docs.litellm.ai/docs/mcp_aws_sigv4) 指南了解配置方法。

:::

## 快速上手

### LiteLLM 的模型格式

要通过 LiteLLM 调用 Bedrock 智能体运行时，请使用以下模型格式。

其中 `model=bedrock/agentcore/` 告诉 LiteLLM 去调用 Bedrock 的 `InvokeAgentRuntime` API。

```shell showLineNumbers title="LiteLLM 的模型格式"
bedrock/agentcore/{AGENT_RUNTIME_ARN}
```

**示例**：
- `bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime`

你可以在 AWS Bedrock 控制台的 AgentCore 下找到 Agent Runtime ARN。

### LiteLLM Python SDK

```python showLineNumbers title="AgentCore 基础补全"
import litellm

# Make a completion request to your AgentCore runtime
response = litellm.completion(
    model="bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime",
    messages=[
        {
            "role": "user", 
            "content": "Explain machine learning in simple terms"
        }
    ],
)

print(response.choices[0].message.content)
print(f"Usage: {response.usage}")
```

```python showLineNumbers title="AgentCore 流式响应"
import litellm

# Stream responses from your AgentCore runtime
response = litellm.completion(
    model="bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime",
    messages=[
        {
            "role": "user",
            "content": "What are the key principles of software architecture?"
        }
    ],
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### LiteLLM Proxy

#### 1. 在 config.yaml 中配置模型

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="LiteLLM 代理配置"
model_list:
  - model_name: agentcore-runtime-1
    litellm_params:
      model: bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2

  - model_name: agentcore-runtime-2
    litellm_params:
      model: bedrock/agentcore/arn:aws:bedrock-agentcore:us-east-1:987654321098:runtime/production-runtime
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

</TabItem>
</Tabs>

#### 2. 启动 LiteLLM 代理

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config config.yaml
```

#### 3. 向 AgentCore 运行时发起请求

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="AgentCore 基础请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "agentcore-runtime-1",
    "messages": [
      {
        "role": "user", 
        "content": "Summarize the main benefits of cloud computing"
      }
    ]
  }'
```

```bash showLineNumbers title="AgentCore 流式请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "agentcore-runtime-2",
    "messages": [
      {
        "role": "user",
        "content": "Explain the differences between SQL and NoSQL databases"
      }
    ],
    "stream": true
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="通过 OpenAI SDK 使用 LiteLLM 代理"
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Make a completion request to your AgentCore runtime
response = client.chat.completions.create(
    model="agentcore-runtime-1",
    messages=[
      {
        "role": "user",
        "content": "What are best practices for API design?"
      }
    ]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="OpenAI SDK 流式请求"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000", 
    api_key="your-litellm-api-key"
)

# Stream AgentCore responses
stream = client.chat.completions.create(
    model="agentcore-runtime-2",
    messages=[
      {
        "role": "user",
        "content": "Describe the microservices architecture pattern"
      }
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>
</Tabs>

## 提供商特有参数

AgentCore 支持传入额外参数来自定义运行时调用。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="使用 AgentCore 特有参数"
from litellm import completion

response = litellm.completion(
    model="bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime",
    messages=[
        {
            "role": "user",
            "content": "Analyze this data and provide insights",
        }
    ],
    qualifier="production",  # PROVIDER-SPECIFIC: Runtime qualifier/version
    runtimeSessionId="session-abc-123",  # PROVIDER-SPECIFIC: Custom session ID
)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

```yaml showLineNumbers title="带参数的 LiteLLM 代理配置"
model_list:
  - model_name: agentcore-runtime-prod
    litellm_params:
      model: bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
      qualifier: production
```

</TabItem>
</Tabs>

### 可用参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `qualifier` | string | 可选的运行时限定符/版本，用于调用智能体运行时的特定版本 |
| `runtimeSessionId` | string | 可选的自定义会话 ID（至少 33 个字符）。未提供时，LiteLLM 会自动生成一个 |

## LiteLLM A2A Gateway {#litellm-a2a-gateway}

在 LiteLLM [Agent Gateway](../a2a) 上将 Bedrock AgentCore 运行时注册为第一类 A2A 智能体。这样你就能获得按智能体的 RBAC、访问组、追踪 ID 强制校验，以及 `x-a2a-{agent_name_or_id}-{header}` 按用户透传约定，与其他任何 A2A 提供商共用同一套接口。

这条路径与上文的对话补全调用相互独立。请根据你的客户端选择其一：

| 如果你想通过以下方式调用 AgentCore | 请使用这条路径 |
|---|---|
| `/v1/chat/completions` 配合 `model: bedrock/agentcore/<ARN>` | 对话补全（上文已介绍） |
| `POST /a2a/{agent_id}` 配合 A2A JSON-RPC 2.0（`message/send` 或 `message/stream`） | A2A 网关（本节内容） |

### 1. 注册智能体

<Tabs>
<TabItem value="ui" label="UI">

1. 进入 **Agents** → **Add Agent**。
2. 选择 **Bedrock AgentCore** 作为提供商。
3. 将 AgentCore Runtime ARN 粘贴为智能体 URL。
4. 配置 AWS 凭证（或留空以使用代理运行环境自带的凭证链；参见下文 [身份验证](#a2a-gateway-authentication)）。

</TabItem>
<TabItem value="api" label="REST API">

```bash showLineNumbers
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "my-agentcore-runtime",
    "agent_card_params": {
      "name": "my-agentcore-runtime",
      "description": "Internal research agent",
      "url": "bedrock/agentcore/arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/my-runtime"
    },
    "litellm_params": {
      "custom_llm_provider": "bedrock",
      "aws_role_name": "arn:aws:iam::123456789012:role/LiteLLMAgentCoreInvoker",
      "aws_region_name": "us-east-1"
    }
  }'
```

</TabItem>
</Tabs>

### 更新或轮换凭证

`litellm_params` 中任何携带凭证的字段（`aws_access_key_id`、`aws_secret_access_key`、`aws_session_token`、`api_key` 等）均为只写。`GET`/`POST`/`PUT`/`PATCH /v1/agents` 的响应和管理界面的智能体编辑表单，都会把这些字段显示为脱敏占位符，而不是存储的真实值。

- 编辑无关字段（名称、描述、速率限制）并保存后，存储的凭证保持不变，即使表单把它未触碰的每个凭证字段都以占位符原样回传。
- 要轮换某个凭证，请为该字段提交新值；更新立即生效，同样绝不回显。
- 将字段提交为空字符串即可清除存储的凭证（例如，用于回退到代理运行环境自带的 AWS 凭证链）。

### 2. 通过 A2A 调用

```bash showLineNumbers
curl -X POST http://localhost:4000/a2a/my-agentcore-runtime/message/send \
  -H "x-litellm-api-key: Bearer sk-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "message/send",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "Summarize the latest clinical trial results"}],
        "messageId": "msg-1"
      }
    }
  }'
```

### 会话隔离

每个 AgentCore 运行时会话都是一个独立的 microVM：复用同一个 `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id` 可以保留对话上下文，而把两个调用方混入同一个会话则会让上下文在它们之间泄露。LiteLLM 按以下顺序确定会话 ID：

1. A2A 请求中的 **`params.message.contextId`**，其作用域限定在调用方 API 密钥内，因此两个密钥不会在同一个 `contextId` 上撞车。这是按对话隔离会话的推荐方式。
2. 智能体 `litellm_params` 中的 **`runtimeSessionId`**（参见[可用参数](#可用参数)），仅在请求未携带 `contextId` 时使用。所有省略 `contextId` 的调用方共享这一个会话。
3. 两者都未设置时，使用新生成的 ID。每个请求拥有独立会话，因此不会保留多轮对话上下文。

要让对话跨轮次延续，请在该对话的每次 `message/send` 或 `message/stream` 调用中携带相同的 `contextId`，并为每个新对话或终端用户使用不同的 `contextId`：

```bash showLineNumbers
curl -X POST http://localhost:4000/a2a/my-agentcore-runtime/message/send \
  -H "x-litellm-api-key: Bearer sk-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "message/send",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "Summarize the latest clinical trial results"}],
        "messageId": "msg-1",
        "contextId": "conversation-<a stable id you generate per conversation, e.g. a UUID>"
      }
    }
  }'
```

AWS 要求运行时会话 ID 的长度在 33-256 个字符之间。LiteLLM 在校验前会给 `contextId` 加上调用密钥的 16 字符哈希前缀，因此 `contextId` 本身至少需要 16 个字符；UUID（36 个字符）轻松达标。超出该范围的 `contextId`（或已配置的 `runtimeSessionId`）会在请求到达 AWS 之前就被拒绝，返回 HTTP 400 和 JSON-RPC `-32602` 错误，而不是静默回退到共享会话。

### 身份验证 {#a2a-gateway-authentication}

AgentCore 的 A2A 路径支持**两种不同的出站身份验证模式**，会根据 `litellm_params` 中的内容自动选择：

| 模式 | 触发条件 | 发送给 AgentCore 的内容 |
|---|---|---|
| **Bearer / JWT** | 设置了 `litellm_params.api_key`（任意值） | `Authorization: Bearer <api_key>`，完全绕过 SigV4 |
| **SigV4** | 未设置 `litellm_params.api_key` | 使用完整 AWS 凭证链（见下文）为每个请求生成 SigV4 签名 |

#### SigV4 凭证解析

SigV4 模式激活时，凭证按以下优先级解析：

1. **`aws_web_identity_token` + `aws_role_name` + `aws_session_name`** → `sts:AssumeRoleWithWebIdentity`。跨账户 IRSA 路径。
2. **仅设置 `aws_role_name`** → `sts:AssumeRole`。以代理运行环境自带的凭证（实例配置文件、IRSA、环境变量）作为源身份。会话名称缺省时自动生成。
3. **`aws_profile_name`** → 通过 boto3 配置文件加载器（`~/.aws/credentials`）解析。
4. **`aws_access_key_id` + `aws_secret_access_key` + `aws_session_token`** → 显式临时凭证。
5. **`aws_access_key_id` + `aws_secret_access_key` + `aws_region_name`** → 显式长期凭证。三项必须全部设置；缺少 `aws_region_name` 时跳过该分支。
6. **未配置任何凭证** → boto3 默认凭证链（环境变量，通过 `AWS_WEB_IDENTITY_TOKEN_FILE` + `AWS_ROLE_ARN` 的 IRSA，以及实例元数据）。

SigV4 模式下 `litellm_params` 可识别的字段：

| 字段 | 说明 |
|---|---|
| `aws_role_name` | 通过 STS 扮演的 IAM 角色 ARN |
| `aws_session_name` | AssumeRole 调用的会话名称（缺省时自动生成） |
| `aws_external_id` | 传递给 `sts:AssumeRole` 的 ExternalId，用于跨账户信任策略 |
| `aws_web_identity_token` | 用于 `AssumeRoleWithWebIdentity` 的 OIDC 令牌（可显式设置，或通过 `AWS_WEB_IDENTITY_TOKEN_FILE` 环境变量） |
| `aws_profile_name` | AWS CLI 配置文件名称 |
| `aws_sts_endpoint` | 自定义 STS 端点（VPC 端点、FIPS 端点） |
| `aws_access_key_id` / `aws_secret_access_key` / `aws_session_token` | 显式凭证 |
| `aws_region_name` | AWS 区域。缺省时从 `agent_card_params.url` 中的运行时 ARN 检测。 |

#### EKS 上的 IRSA

使用 [IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) 的 Kubernetes 部署无需显式配置凭证。boto3 默认凭证链会自动从 Pod 环境中读取 `AWS_WEB_IDENTITY_TOKEN_FILE` 和 `AWS_ROLE_ARN`。

如果你希望调用时扮演**另一个**角色（例如为了 CloudTrail 归因，将 Pod 自身身份与智能体调用身份分开），可以将 IRSA 与 `aws_role_name` 结合使用：

```bash showLineNumbers
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "production-runtime",
    "agent_card_params": {
      "name": "production-runtime",
      "url": "bedrock/agentcore/arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/prod"
    },
    "litellm_params": {
      "custom_llm_provider": "bedrock",
      "aws_role_name": "arn:aws:iam::123456789012:role/AgentCoreInvocationRole",
      "aws_session_name": "litellm-prod"
    }
  }'
```

代理 Pod 的 IRSA 角色充当 AssumeRole 调用的源身份；CloudTrail 中被扮演角色的条目对应的则是智能体调用。

### 用户级请求头透传

标准的 A2A 请求头转发机制均适用；完整参考请见 [A2A 智能体身份验证请求头](../a2a_agent_headers)。三种方式都可以与 AgentCore 搭配使用：

- **`static_headers`**：始终发送给 AgentCore（例如自定义的 `X-Tenant-Id`）
- **`extra_headers`**：由管理员配置的客户端请求头转发白名单
- **`x-a2a-{agent_name_or_id}-{header}` 约定**：由调用方自主转发，无需管理员配置

请注意，`litellm_params` 处理的 SigV4 / Bearer 身份验证与上述智能体级请求头转发**相互独立**。身份验证请求头由 AWS 签名器按请求计算；用户透传请求头则在签名完成后合并进请求。

### RBAC 与追踪 ID

所有标准 A2A 控制均适用：
- **按智能体的 RBAC**：参见[智能体权限管理](../a2a_agent_permissions)。当调用密钥/团队未获得该 AgentCore 智能体的授权时，返回 HTTP 403。
- **访问组**：在 LiteLLM 仪表板中为智能体打上一个或多个访问组标签，再通过 `object_permission.agent_access_groups` 把该组授予团队或密钥。参见[智能体访问组](../a2a_agent_permissions#agent-访问组)。
- **追踪 ID 强制校验**：在 `litellm_params` 上设置 `require_trace_id_on_calls_to_agent: true`，要求每个入站调用都携带 `x-litellm-trace-id`。参见 [A2A 概述：追踪 ID 强制校验](../a2a#trace-id-强制校验可选按智能体)。

## 延伸阅读

- [AWS Bedrock AgentCore 文档](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agentcore_InvokeAgentRuntime.html)
- [LiteLLM 对 Bedrock 的身份验证](https://docs.litellm.ai/docs/providers/bedrock#boto3---authentication)
- [LiteLLM A2A 网关概述](../a2a)
- [A2A 智能体身份验证请求头](../a2a_agent_headers)
- [A2A 智能体权限管理](../a2a_agent_permissions)
- [MCP AWS SigV4](../mcp_aws_sigv4)：面向 AgentCore 托管的 MCP 服务器路径（与智能体运行时路径相互独立）
