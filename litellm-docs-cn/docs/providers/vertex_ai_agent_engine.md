import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI Agent Engine

以 OpenAI 请求/响应格式调用 Vertex AI Agent Engine（Reasoning Engines）。

| 属性 | 说明 |
|----------|---------|
| 描述 | Vertex AI Agent Engine 提供托管的智能体（agent）运行时，可结合基础模型、工具与自定义逻辑执行智能体工作流。 |
| LiteLLM 中的提供商路由 | `vertex_ai/agent_engine/{RESOURCE_NAME}` |
| 支持的端点（endpoint） | `/chat/completions`, `/v1/messages`, `/v1/responses`, `/v1/a2a/message/send` |
| 提供商文档 | [Vertex AI Agent Engine ↗](https://cloud.google.com/vertex-ai/generative-ai/docs/reasoning-engine/overview) |

## 快速上手

### 模型格式

```shell showLineNumbers title="模型格式"
vertex_ai/agent_engine/{RESOURCE_NAME}
```

**示例**：
- `vertex_ai/agent_engine/projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888`

### LiteLLM Python SDK

```python showLineNumbers title="基础智能体补全"
import litellm

response = litellm.completion(
    model="vertex_ai/agent_engine/projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888",
    messages=[
        {"role": "user", "content": "Explain machine learning in simple terms"}
    ],
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="流式智能体响应"
import litellm

response = await litellm.acompletion(
    model="vertex_ai/agent_engine/projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888",
    messages=[
        {"role": "user", "content": "What are the key principles of software architecture?"}
    ],
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
  - model_name: vertex-agent-1
    litellm_params:
      model: vertex_ai/agent_engine/projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888
      vertex_project: your-project-id
      vertex_location: us-central1
```

</TabItem>
</Tabs>

#### 2. 启动 LiteLLM 代理

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config config.yaml
```

#### 3. 向你的 Vertex AI Agent Engine 发起请求

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="基础智能体请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "vertex-agent-1",
    "messages": [
      {"role": "user", "content": "Summarize the main benefits of cloud computing"}
    ]
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="通过 LiteLLM 代理使用 OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

response = client.chat.completions.create(
    model="vertex-agent-1",
    messages=[
      {"role": "user", "content": "What are best practices for API design?"}
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## LiteLLM A2A 网关

你也可以通过 LiteLLM 的 A2A（Agent-to-Agent）网关 UI 连接 Vertex AI Agent Engine，无需编写代码就能以可视化方式注册和测试智能体。

### 1. 进入 Agents 页面

在侧边栏中点击 “Agents” 打开智能体管理页面，然后点击 “+ Add New Agent”。

![点击 Agents](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/9a979927-ce6b-4168-9fba-e53e28f1c2c4/ascreenshot.jpeg?tl_px=0,14&br_px=1376,783&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=17,277)

![新增智能体](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/a311750c-2e85-4589-99cb-2ce7e4021e77/ascreenshot.jpeg?tl_px=0,0&br_px=1376,769&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=195,257)

### 2. 选择 Vertex AI Agent Engine 类型

点击 “A2A Standard” 查看可用的智能体类型，然后选择 “Vertex AI Agent Engine”。

![选择 A2A Standard](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/5b1acc4c-dc3f-4639-b4a0-e64b35c228fd/ascreenshot.jpeg?tl_px=52,0&br_px=1428,769&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,271)

![选择 Vertex AI Agent Engine](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/2f3bab61-3e02-4db7-84f0-82200a0f4136/ascreenshot.jpeg?tl_px=0,244&br_px=1376,1013&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=477,277)

### 3. 配置智能体

填写以下字段：

- **Agent Name** - 智能体的易记名称（例如 `my-vertex-agent`）
- **Reasoning Engine Resource ID** - 来自 Google Cloud Console 的完整资源路径（例如 `projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888`）
- **Vertex Project** - 你的 Google Cloud 项目 ID
- **Vertex Location** - 智能体部署所在区域（例如 `us-central1`）

![填写 Agent Name](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/695b84c7-9511-4337-bf19-f4505ab2b72b/ascreenshot.jpeg?tl_px=0,90&br_px=1376,859&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=480,276)

![填写 Resource ID](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/ddce64df-b3a3-4519-ab62-f137887bcea2/ascreenshot.jpeg?tl_px=0,294&br_px=1376,1063&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=440,277)

你可以在 Google Cloud Console 的 Vertex AI > Agent Engine 下找到 Resource ID：

![从 Google Cloud Console 复制 Resource ID](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/185d7f17-cbaa-45de-948d-49d2091805ea/ascreenshot.jpeg?tl_px=0,165&br_px=1376,934&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=493,276)

![填写 Vertex Project](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/a64da441-3e61-4811-a1e3-9f0b12c949ff/ascreenshot.jpeg?tl_px=0,233&br_px=1376,1002&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=501,277)

你可以在 Google Cloud Console 中找到 Project ID：

![从 Google Cloud Console 复制 Project ID](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/9ecad3bb-a534-42d6-9604-33906014fad6/user_cropped_screenshot.webp?tl_px=0,0&br_px=1728,1028&force_format=jpeg&q=100&width=1120.0)

![填写 Vertex Location](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/316d1f38-4fb7-4377-86b6-c0fe7ac24383/ascreenshot.jpeg?tl_px=0,330&br_px=1376,1099&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=423,277)

### 4. 创建智能体

点击 “Create Agent” 保存配置。

![创建智能体](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/fb04b95d-793f-4eed-acf4-d1b3b5fa65e9/ascreenshot.jpeg?tl_px=352,347&br_px=1728,1117&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=623,498)

### 5. 在 Playground 中测试

在侧边栏中进入 “Playground” 测试你的智能体。

![进入 Playground](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/9e01369b-6102-4fe3-96a7-90082cadfd6e/ascreenshot.jpeg?tl_px=0,0&br_px=1376,769&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=55,226)

### 6. 选择 A2A 端点

点击端点下拉框，选择 `/v1/a2a/message/send`。

![选择端点](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/d5aeac35-531b-4cf0-af2d-88f0a71fd736/ascreenshot.jpeg?tl_px=0,146&br_px=1376,915&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=299,277)

### 7. 选择智能体并发送消息

在下拉框中选择你的 Vertex AI Agent Engine，然后发送一条测试消息。

![选择智能体](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/353431f3-a0ba-4436-865d-ae11595e9cc4/ascreenshot.jpeg?tl_px=0,263&br_px=1376,1032&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=270,277)

![发送消息](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/fbfce72e-f50b-43e1-b6e5-0d41192d8e2d/ascreenshot.jpeg?tl_px=95,347&br_px=1471,1117&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,474)

![智能体响应](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/892dd826-fbf9-4530-8d82-95270889274a/ascreenshot.jpeg?tl_px=0,82&br_px=1376,851&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=485,277)

## 环境变量

| 变量 | 说明 |
|----------|-------------|
| `GOOGLE_APPLICATION_CREDENTIALS` | 服务账号 JSON 密钥文件的路径 |
| `VERTEXAI_PROJECT` | Google Cloud 项目 ID |
| `VERTEXAI_LOCATION` | Google Cloud 区域（默认值：`us-central1`） |

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export VERTEXAI_PROJECT="your-project-id"
export VERTEXAI_LOCATION="us-central1"
```

## 延伸阅读

- [Vertex AI Agent Engine 文档](https://cloud.google.com/vertex-ai/generative-ai/docs/reasoning-engine/overview)
- [创建 Reasoning Engine](https://cloud.google.com/vertex-ai/generative-ai/docs/reasoning-engine/create)
- [A2A 智能体网关](../a2a.md)
- [Vertex AI 提供商](./vertex.md)
