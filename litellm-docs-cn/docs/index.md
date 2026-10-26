---
id: index
title: 入门
sidebar_label: 快速上手
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import NavigationCards from '@site/src/components/NavigationCards';
import LiteLLMFlow from '@site/src/components/LiteLLMFlow';
import QuickStartBox from '@site/src/components/QuickStartBox';

<LiteLLMFlow copyCommand={false} agentPrompt={false} />

<QuickStartBox source="docs-index" />

**LiteLLM** 是一个开源库，让你用同一套统一接口、以 OpenAI 格式调用 100 多个 LLM（OpenAI、Anthropic、Vertex AI、Bedrock 等）。

- 用同一套 `completion()` 接口调用任意提供商，无需逐一重新学习各家的 API
- 无论选哪家提供商、哪个模型，输出格式都保持一致
- 通过 [Router](./routing.md) 在多个部署之间实现内置的重试（retry）与回退（fallback）机制
- 自托管的 [LLM 网关（Proxy）](/docs/simple_proxy)，提供虚拟密钥（virtual key）、成本追踪（cost tracking）与管理界面（Admin UI）

[![PyPI](https://img.shields.io/pypi/v/litellm.svg)](https://pypi.org/project/litellm/)
[![GitHub Stars](https://img.shields.io/github/stars/BerriAI/litellm?style=social)](https://github.com/BerriAI/litellm)

---

## 安装

```shell
uv add litellm
```

### 更精简的 SDK 安装

对于直接使用 Python SDK 的应用，`litellm-core` 提供同一套 SDK，强制依赖更少，也不捆绑仪表板与网关 CLI 入口。Python 的导入方式保持不变：继续使用 `litellm`

请在全新环境中安装 `litellm-core`，而非安装 `litellm`。应用需要时，再自行添加 AWS 与 Python 版 Hugging Face 分词器依赖包。这两个发行包不能同时安装，因为二者包含相同的 Python 文件

安装方式、包选择与可选依赖详见 [LiteLLM Core](https://docs.litellm.ai/docs/litellm_core)。已安装的 `litellm` 保持现有依赖默认值不变

要部署带管理界面的完整 AI 网关（Proxy），请参考[快速上手](./proxy/docker_quick_start.md)：它以容器方式运行，无需任何 Python 环境。若想改从 CLI 运行，参见[网关快速上手](./learn/gateway_quickstart.md)。

---

## 快速开始

用你选定的提供商，发出第一次 LLM 调用：

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
  model="openai/{{openai_large}}",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="anthropic" label="Anthropic">

```python
from litellm import completion
import os

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

response = completion(
  model="anthropic/{{anthropic}}",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="vertex" label="Vertex AI">

```python
from litellm import completion
import os

# auth: run 'gcloud auth application-default login'
os.environ["VERTEXAI_PROJECT"] = "your-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/{{gemini_pro}}",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="bedrock" label="Bedrock">

```python
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = "your-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret"
os.environ["AWS_REGION_NAME"] = "us-east-1"

response = completion(
  model="bedrock/us.anthropic.{{anthropic}}",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="ollama" label="Ollama">

```python
from litellm import completion

response = completion(
  model="ollama/llama3",
  messages=[{"role": "user", "content": "Hello, how are you?"}],
  api_base="http://localhost:11434"
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="azure" label="Azure OpenAI">

```python
from litellm import completion
import os

os.environ["AZURE_API_KEY"] = "your-key"
os.environ["AZURE_API_BASE"] = "https://your-resource.openai.azure.com"
os.environ["AZURE_API_VERSION"] = "2024-02-01"

response = completion(
  model="azure/your-deployment-name",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

无论使用哪家提供商，每个响应都遵循 OpenAI Chat Completions 格式。✅

### 响应格式

非流式响应返回一个 `ModelResponse` 对象：

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "{{openai_large}}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thanks for asking."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 12,
    "total_tokens": 25
  }
}
```

流式响应（`stream=True`）产出的则是 `ModelResponseStream` 数据块：

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion.chunk",
  "created": 1677858242,
  "model": "{{openai_large}}",
  "choices": [
    {
      "index": 0,
      "delta": {
        "role": "assistant",
        "content": "Hello"
      },
      "finish_reason": null
    }
  ]
}
```

📖 [完整输出格式参考 →](/docs/completion/output)

:::tip[在 Colab 中打开]
<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/liteLLM_Getting_Started.ipynb">
<img src="https://colab.research.google.com/assets/colab-badge.svg" alt="在 Colab 中打开"/>
</a>
:::

---

## 初识 LiteLLM？

**想快速上手**？前往[教程](/docs/tutorials)，跟着一步步学习 AI 编程工具、agent SDK、代理搭建等内容。

**想深入了解某个具体功能**？查看[指南](/docs/guides)，涵盖流式、函数调用、提示词缓存等各类实用主题。

---

## 选择你的路径

<NavigationCards
columns={2}
items={[
{
icon: "🐍",
title: "Python SDK",
description: "把 LiteLLM 直接集成到你的 Python 应用中，是 OpenAI 客户端的即插即用替代品。",
listDescription: [
"completion()、embedding()、image_generation() 等",
"Router 内置重试、回退与负载均衡（load balancing）",
"所有提供商统一使用 OpenAI 兼容的异常类型",
"可观测性（observability）回调（Langfuse、MLflow、Helicone…）",
],
to: "#litellm-python-sdk",
},
{
icon: "🖥️",
title: "代理服务器（LLM 网关）",
description: "面向平台团队的自托管网关，统一管控整个组织的 LLM 访问。",
listDescription: [
"虚拟密钥，支持按密钥 / 团队 / 用户设置预算",
"集中式日志、防护栏（guardrails）与缓存",
"管理界面，用于监控与管理",
"任何 OpenAI 兼容客户端的即插即用替代品",
],
to: "#litellm-代理服务器llm-网关",
},
]}
/>

---

## LiteLLM Python SDK

### 流式

加上 `stream=True`，即可在内容生成的同时逐块接收：

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

for chunk in completion(
  model="openai/{{openai_large}}",
  messages=[{"role": "user", "content": "Write a short poem"}],
  stream=True,
):
    print(chunk.choices[0].delta.content or "", end="")
```

### 异常处理

LiteLLM 把各提供商的错误统一映射为 OpenAI 异常类型，你现有的错误处理逻辑无需改动即可继续工作：

```python
import litellm

try:
    litellm.completion(
      model="anthropic/{{anthropic}}",
      messages=[{"role": "user", "content": "Hey!"}]
    )
except litellm.AuthenticationError as e:
    print(f"Bad API key: {e}")
except litellm.RateLimitError as e:
    print(f"Rate limited: {e}")
except litellm.APIError as e:
    print(f"API error: {e}")
```

### 日志与可观测性

只需一行代码，即可把输入输出发送到 Langfuse、MLflow、Helicone、Lunary 等平台：

```python
import litellm

litellm.success_callback = ["langfuse", "mlflow", "helicone"]

response = litellm.completion(
  model="{{openai_large}}",
  messages=[{"role": "user", "content": "Hi!"}]
)
```

📖 [查看全部可观测性集成 →](/docs/observability/opentelemetry_v2)

### 追踪成本与用量

用回调捕获每次响应的成本：

```python
import litellm

def track_cost(kwargs, completion_response, start_time, end_time):
    print("Cost:", kwargs.get("response_cost", 0))

litellm.success_callback = [track_cost]

litellm.completion(
  model="{{openai_large}}",
  messages=[{"role": "user", "content": "Hello!"}],
  stream=True
)
```

📖 [自定义回调文档 →](/docs/observability/custom_callback)

---

## LiteLLM 代理服务器（LLM 网关）

代理服务器是自托管的 OpenAI 兼容网关：任何原本对接 OpenAI 的客户端都能直接使用代理，代码无需改动。

![LiteLLM 代理仪表板](https://github.com/BerriAI/litellm/assets/29436595/47c97d5e-b9be-4839-b28c-43d7f4f10033)

#### 第 1 步：启动代理

<Tabs>
<TabItem value="cli" label="LiteLLM CLI">

```shell
litellm --model huggingface/bigcode/starcoder
# Proxy running on http://0.0.0.0:4000
```

</TabItem>
<TabItem value="docker" label="Docker">

```yaml title="litellm_config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/your-deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
```

```shell
docker run \
  -v $(pwd)/litellm_config.yaml:/app/config.yaml \
  -e AZURE_API_KEY=your-key \
  -e AZURE_API_BASE=https://your-resource.openai.azure.com/ \
  -p 4000:4000 \
  docker.litellm.ai/berriai/litellm:latest \
  --config /app/config.yaml --detailed_debug
```

</TabItem>
</Tabs>

#### 第 2 步：用 OpenAI 客户端调用

```python
import openai

client = openai.OpenAI(api_key="anything", base_url="http://0.0.0.0:4000")

response = client.chat.completions.create(
  model="{{openai_small}}",
  messages=[{"role": "user", "content": "Write a short poem"}]
)
print(response.choices[0].message.content)
```

👉 [代理完整快速上手 →](/docs/proxy/docker_quick_start)

:::tip[调试工具]
使用 **`/utils/transform_request`** 可以查看 LiteLLM 实际发送给各提供商的请求内容。排查提示词格式、请求头问题或特定提供商参数时非常有用。
:::

🔗 [交互式 API 浏览器（Swagger）→](https://docs.litellm.ai/api-reference/)

---

## Agent 与 MCP 网关

LiteLLM 是 **LLM、Agent 和 MCP**（Model Context Protocol）的统一网关，无需再单独部署 Agent 网关或 MCP 网关。一个端点即可覆盖 100 多个模型、A2A（Agent-to-Agent）Agent 和 MCP 工具。

<NavigationCards
columns={3}
items={[
{
icon: "🔗",
title: "A2A Agent",
description: "通过 LiteLLM 网关接入并调用 A2A Agent。",
to: "/docs/a2a",
},
{
icon: "🛠️",
title: "MCP 网关",
description: "集中式 MCP 端点，支持按密钥的访问控制。",
to: "/docs/mcp",
},
{
icon: "✨",
title: "✨ 企业版快速上手",
      description: "面向试用客户的快速上手指南：LLM、MCP 与 Agent 网关。",
to: "/docs/learn/enterprise_quickstart",
},
]}
/>

---

## 下一步探索方向

<NavigationCards
columns={3}
items={[
{
icon: "🔀",
title: "路由与负载均衡",
description: "跨部署进行负载均衡，并设置自动回退。",
to: "/docs/routing-load-balancing",
},
{
icon: "🔑",
title: "虚拟密钥",
description: "按团队或用户管理访问权限、预算与速率限制（rate limit）。",
to: "/docs/proxy/virtual_keys",
},
{
icon: "📊",
title: "花费追踪",
description: "跨所有提供商，按密钥、团队和用户追踪成本。",
to: "/docs/proxy/cost_tracking",
},
{
icon: "🛡️",
title: "防护栏",
description: "添加内容过滤、PII（个人身份信息）脱敏与安全检查。",
to: "/docs/proxy/guardrails/quick_start",
},
{
icon: "📡",
title: "可观测性",
description: "与 Langfuse、MLflow、Helicone 等平台集成。",
to: "/docs/observability/opentelemetry_v2",
},
{
icon: "🏭",
title: "企业版",
description: "SSO/SAML、审计日志，以及面向生产环境的高级安全能力。",
to: "/docs/enterprise",
},
]}
/>
