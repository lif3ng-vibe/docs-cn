import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI Foundry Agents

以 OpenAI 请求/响应格式调用 Azure AI Foundry Agents。

| 属性 | 说明 |
|----------|---------|
| 描述 | Azure AI Foundry Agents 提供托管的 Agent 运行时，可结合基础模型、工具和代码解释器执行智能体（agentic）工作流。 |
| LiteLLM 中的提供商路由 | `azure_ai/agents/{AGENT_ID}` |
| 提供商文档 | [Azure AI Foundry Agents ↗](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/quickstart) |

## 认证

Azure AI Foundry Agents 要求使用 **Azure AD 认证**（不支持 API 密钥）。可以选择以下认证方式：

### 方式 1：服务主体（生产环境推荐）

设置以下环境变量：

```bash
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

LiteLLM 会使用这些凭据自动获取 Azure AD 令牌。

### 方式 2：Azure AD 令牌（手动提供）

直接通过 `api_key` 传入令牌：

```bash
# Get token via Azure CLI
az account get-access-token --resource "https://ai.azure.com" --query accessToken -o tsv
```

### 所需的 Azure 角色

你的服务主体（service principal）或用户必须在 Azure AI Foundry 项目中拥有 **Azure AI Developer** 或 **Azure AI User** 角色。

如需通过 Azure CLI 分配角色：
```bash
az role assignment create \
  --assignee-object-id "<service-principal-object-id>" \
  --assignee-principal-type "ServicePrincipal" \
  --role "Azure AI Developer" \
  --scope "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<resource>"
```

也可以在 **Azure AI Foundry Portal** 中添加：进入你的项目，打开 **Project users**，点击 **+ New user**。

## 快速上手

### LiteLLM 模型格式

通过 LiteLLM 调用 Azure AI Foundry Agent 时，请使用以下模型格式。

其中 `model=azure_ai/agents/` 会告诉 LiteLLM 去调用 Azure AI Foundry Agent Service API。

```shell showLineNumbers title="LiteLLM 模型格式"
azure_ai/agents/{AGENT_ID}
```

**示例**：
- `azure_ai/agents/asst_abc123`

Agent ID 可以在 Azure AI Foundry 门户的 Agents 页面下找到。

### LiteLLM Python SDK

```python showLineNumbers title="基础 Agent 补全"
import litellm

# Make a completion request to your Azure AI Foundry Agent
# Uses AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET env vars for auth
response = litellm.completion(
    model="azure_ai/agents/asst_abc123",
    messages=[
        {
            "role": "user", 
            "content": "Explain machine learning in simple terms"
        }
    ],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
)

print(response.choices[0].message.content)
print(f"Usage: {response.usage}")
```

```python showLineNumbers title="流式获取 Agent 响应"
import litellm

# Stream responses from your Azure AI Foundry Agent
response = await litellm.acompletion(
    model="azure_ai/agents/asst_abc123",
    messages=[
        {
            "role": "user",
            "content": "What are the key principles of software architecture?"
        }
    ],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
    stream=True,
)

async for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### LiteLLM 代理

#### 1. 在 config.yaml 中配置模型

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="LiteLLM 代理配置"
model_list:
  - model_name: azure-agent-1
    litellm_params:
      model: azure_ai/agents/asst_abc123
      api_base: https://your-resource.services.ai.azure.com/api/projects/your-project
      # Service Principal auth (recommended)
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      client_secret: os.environ/AZURE_CLIENT_SECRET

  - model_name: azure-agent-math-tutor
    litellm_params:
      model: azure_ai/agents/asst_def456
      api_base: https://your-resource.services.ai.azure.com/api/projects/your-project
      # Or pass Azure AD token directly
      api_key: os.environ/AZURE_AD_TOKEN
```

</TabItem>
</Tabs>

#### 2. 启动 LiteLLM 代理

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config config.yaml
```

#### 3. 向 Azure AI Foundry Agents 发起请求

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="基础 Agent 请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "azure-agent-1",
    "messages": [
      {
        "role": "user", 
        "content": "Summarize the main benefits of cloud computing"
      }
    ]
  }'
```

```bash showLineNumbers title="流式 Agent 请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "azure-agent-math-tutor",
    "messages": [
      {
        "role": "user",
        "content": "What is 25 * 4?"
      }
    ],
    "stream": true
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="通过 OpenAI SDK 调用 LiteLLM 代理"
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Make a completion request to your Azure AI Foundry Agent
response = client.chat.completions.create(
    model="azure-agent-1",
    messages=[
      {
        "role": "user",
        "content": "What are best practices for API design?"
      }
    ]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="用 OpenAI SDK 流式请求"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000", 
    api_key="your-litellm-api-key"
)

# Stream Agent responses
stream = client.chat.completions.create(
    model="azure-agent-math-tutor",
    messages=[
      {
        "role": "user",
        "content": "Explain the Pythagorean theorem"
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

## 环境变量

| 变量 | 说明 |
|----------|-------------|
| `AZURE_TENANT_ID` | 用于服务主体认证的 Azure AD 租户 ID |
| `AZURE_CLIENT_ID` | 服务主体的应用程序（客户端）ID |
| `AZURE_CLIENT_SECRET` | 服务主体的客户端密钥 |

```bash
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

## 对话连续性（Thread 管理）

Azure AI Foundry Agents 通过 thread 维护对话上下文。LiteLLM 会自动帮你管理 thread，你也可以传入已有的 thread ID 来延续一段对话。

```python showLineNumbers title="延续对话"
import litellm

# First message creates a new thread
response1 = await litellm.acompletion(
    model="azure_ai/agents/asst_abc123",
    messages=[{"role": "user", "content": "My name is Alice"}],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
)

# Get the thread_id from the response
thread_id = response1._hidden_params.get("thread_id")

# Continue the conversation using the same thread
response2 = await litellm.acompletion(
    model="azure_ai/agents/asst_abc123",
    messages=[{"role": "user", "content": "What's my name?"}],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
    thread_id=thread_id,  # Pass the thread_id to continue conversation
)

print(response2.choices[0].message.content)  # Should mention "Alice"
```

## 提供商专属参数

Azure AI Foundry Agents 还支持一些附加参数，可用于自定义 Agent 的调用行为。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="使用 Agent 专属参数"
from litellm import completion

response = litellm.completion(
    model="azure_ai/agents/asst_abc123",
    messages=[
        {
            "role": "user",
            "content": "Analyze this data and provide insights",
        }
    ],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
    thread_id="thread_abc123",  # Optional: Continue existing conversation
    instructions="Be concise and focus on key insights",  # Optional: Override agent instructions
)
```

</TabItem>
<TabItem value="proxy" label="代理">

```yaml showLineNumbers title="带自定义参数的 LiteLLM 代理配置"
model_list:
  - model_name: azure-agent-analyst
    litellm_params:
      model: azure_ai/agents/asst_abc123
      api_base: https://your-resource.services.ai.azure.com/api/projects/your-project
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      client_secret: os.environ/AZURE_CLIENT_SECRET
      instructions: "Be concise and focus on key insights"
```

</TabItem>
</Tabs>

### 可用参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `thread_id` | string | 可选。用于延续已有对话的 thread ID |
| `instructions` | string | 可选。在本次运行中覆盖 Agent 默认指令的指令内容 |

## LiteLLM A2A 网关

你还可以通过 LiteLLM 的 A2A（Agent-to-Agent）网关 UI 连接 Azure AI Foundry Agents，不用写代码就能以可视化方式注册并测试 Agent。

### 1. 进入 Agents 页面

在侧边栏点击 “Agents” 打开 Agent 管理页面，然后点击 “+ Add New Agent”。

![添加新 Agent](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/f8efe335-a08a-4f2b-9f7f-de28e4d58b05/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=217,118)

### 2. 选择 Azure AI Foundry Agent 类型

点击 “A2A Standard” 查看可用的 Agent 类型，然后选择 “Azure AI Foundry”。

![选择 A2A Standard](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/ede38044-3e18-43b9-afe3-b7513bf9963e/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=409,143)

![选择 Azure AI Foundry](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/33c396fc-a927-4b03-8ee2-ea04950b12c1/ascreenshot.jpeg?tl_px=0,86&br_px=2201,1317&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=433,277)

### 3. 配置 Agent

填写以下字段：

#### Agent 名称

输入一个易于辨识的 Agent 名称，调用方看到的可用 Agent 就是这个名字。

![输入 Agent 名称](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/18c02804-7612-40c4-9ba4-3f1a4c0725d5/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

#### Agent ID

从 Azure AI Foundry 门户获取 Agent ID：

1. 打开 [https://ai.azure.com/](https://ai.azure.com/) 并点击 “Agents”

![Azure Agents](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/5e29fc48-c0f7-4b6d-8313-2063d1240d15/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=39,187)

2. 复制要添加的 Agent 的 “ID”（例如 `asst_hbnoK9BOCcHhC3lC4MDroVGG`）

![复制 Agent ID](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/bf17dfec-a627-41c6-9121-3935e86d3700/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=504,241)

3. 将 Agent ID 粘贴到 LiteLLM 中，LiteLLM 由此知道要在 Azure Foundry 上调用哪个 Agent

![粘贴 Agent ID](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/45230c28-54f6-441c-9a20-4ef8b74076e2/ascreenshot.jpeg?tl_px=0,97&br_px=2617,1560&force_format=jpeg&q=100&width=1120.0)

#### Azure AI API Base

从 Azure AI Foundry 获取你的 API base URL：

1. 打开 [https://ai.azure.com/](https://ai.azure.com/) 并点击 “Overview”
2. 在 libraries 下选择 Microsoft Foundry
3. 获取你的端点，其形如 `https://<domain>.services.ai.azure.com/api/projects/<project-name>`

![获取 API Base](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/60e2c735-4480-44b7-ab12-d69f4200b12c/ascreenshot.jpeg?tl_px=0,40&br_px=2618,1503&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=278,277)

4. 将该 URL 粘贴到 LiteLLM 中

![粘贴 API Base](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/e9c6f48e-7602-449a-9261-0df4a0a66876/ascreenshot.jpeg?tl_px=267,456&br_px=2468,1687&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,277)

#### 认证

添加 Azure AD 凭据用于认证：
- **Azure Tenant ID**
- **Azure Client ID**
- **Azure Client Secret**

![添加认证信息](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/e5e2b636-cf2e-4283-a1cc-8d497d349243/ascreenshot.jpeg?tl_px=0,653&br_px=2201,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=339,405)

点击 “Create Agent” 保存。

![创建 Agent](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/799a720a-639e-4217-a6f5-51687fc07611/ascreenshot.jpeg?tl_px=416,653&br_px=2618,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=693,519)

### 4. 在 Playground 中测试

在侧边栏进入 “Playground” 测试你的 Agent。

![进入 Playground](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/7da84247-db1c-4d55-9015-6e3d60ea63ce/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=63,106)

把端点类型切换为 `/v1/a2a/message/send`。

![选择 A2A 端点](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/733265a8-412d-4eac-bc19-03436d7846c4/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=286,234)

### 5. 选择你的 Agent 并发送消息

在下拉框中选择你的 Azure AI Foundry Agent，然后发送一条测试消息。

![选择 Agent](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/59a8e66e-6f82-42e3-ab48-78355464e6be/ascreenshot.jpeg?tl_px=0,28&br_px=2201,1259&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=269,277)

Agent 会返回它的能力信息。现在你就可以通过 A2A 协议与这个 Azure AI Foundry Agent 交互了。

![Agent 响应](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/a0aafb69-6c28-4977-8210-96f9de750cdf/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=487,272)

## 延伸阅读

- [Azure AI Foundry Agents 文档](https://learn.microsoft.com/en-us/azure/ai-services/agents/)
- [Create Thread and Run API 参考](https://learn.microsoft.com/en-us/rest/api/aifoundry/aiagents/create-thread-and-run/create-thread-and-run)
- [A2A Agent 网关](../a2a.md)
- [A2A 成本追踪](../a2a_cost_tracking.md)

## 通过 A2A 使用 Foundry Agent

在当前 Microsoft Foundry 门户中创建的 Agent 并不支持 Assistants API，因此对它们调用 `azure_ai/agents/<name>` 会返回 `Invalid 'assistant_id'`。它们对外暴露的是 A2A 端点，LiteLLM 会把这类 Agent 注册为普通的 A2A Agent，并使用 Microsoft Entra ID 完成认证。

端点地址为 `https://<account>.services.ai.azure.com/api/projects/<project>/agents/<agent>/endpoint/protocols/a2a`。Foundry 把 agent card 放在该路径下的 `agentCard/v1.0`，而不是那些 well-known 常规路径，并且只接受作用域为 `https://ai.azure.com/.default` 的 Entra bearer 令牌，所以这条配置要设置 `agent_card_path` 和服务主体相关字段：

```yaml title="config.yaml"
agents:
  - agent_name: foundry-agent
    agent_card_params:
      name: "Foundry Agent"
      url: "https://<account>.services.ai.azure.com/api/projects/<project>/agents/<agent>/endpoint/protocols/a2a"
      protocolVersion: "1.0"
      capabilities:
        streaming: false
    litellm_params:
      agent_card_path: agentCard/v1.0
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      client_secret: os.environ/AZURE_CLIENT_SECRET
```

`tenant_id`、`client_id` 和 `client_secret` 是 `azure_ai` 提供商使用的字段名。自己签发的 bearer 令牌填在 `azure_ad_token`（如果那里放的是 `oidc/` 联合令牌，需要在其旁边附上 `tenant_id` + `client_id`）；用户账号登录则填 `client_id` + `azure_username` + `azure_password`；`azure_scope` 可以覆盖作用域。只有 Agent 条目上配置的凭据会被使用，进程级的 `AZURE_*` 环境变量在 A2A Agent 场景下不会被读取。不设 `agent_card_path` 时，发现流程在两个 well-known 路径都失败后仍能命中 `agentCard/v1.0`，代价是每次调用多两次往返。

除非请求要求阻塞式发送，Foundry 对 `message/send` 的响应都是一个已提交的任务，而且它不提供 `message/stream`。`capabilities.streaming: false` 这一行会让 LiteLLM 把流式对话补全当作一次阻塞式发送执行，再把结果作为单个 chunk 回放。

通过 A2A 以阻塞式发送调用该 Agent：

```bash
curl http://localhost:4000/a2a/foundry-agent \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "message/send",
    "params": {
      "message": {
        "kind": "message",
        "role": "user",
        "messageId": "m1",
        "parts": [{"kind": "text", "text": "What is 2 + 2?"}]
      },
      "configuration": {"blocking": true}
    }
  }'
```

或者走对话补全，由 LiteLLM 自己请求阻塞式发送：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "a2a/foundry-agent", "messages": [{"role": "user", "content": "What is 2 + 2?"}]}'
```
