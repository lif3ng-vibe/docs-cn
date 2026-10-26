---
sidebar_label: /v1beta/agents（Gemini 托管智能体）
slug: /managed_agents
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Google AI Studio - 托管智能体（Managed Agents）

LiteLLM 现已支持 [Google AI Studio 托管智能体 API](https://ai.google.dev/gemini-api/docs/gemini-agents/gemini-agents#manage-agents)。通过 LiteLLM 即可创建、管理并运行自定义智能体。

## 概览

整个流程分两步：

1. **创建自定义智能体**：通过 /v1beta/agents 在 Gemini 侧定义你的智能体（名称、基础模型、指令）。
2. **运行智能体**：命名智能体创建完成后，在 /interactions 请求的 agent 字段中填入其资源名称，即可与之交互。

LiteLLM **不会**把智能体存进自己的数据库。智能体完全保存在 Google 侧，LiteLLM 只负责认证与路由这一层。

## 快速上手

<Tabs>
<TabItem value="proxy" label="Proxy">

将 Gemini API 密钥配置到环境变量中：

```bash
export GEMINI_API_KEY="AIzaSy..."
```

**最简 `proxy_config.yaml` 配置**：

```yaml
general_settings:
  master_key: "sk-<your-litellm-master-key>"

environment_variables:
  GEMINI_API_KEY: "AIzaSy..."   # or set in shell env
```

启动代理：

```bash
litellm --config proxy_config.yaml
```

如果未设置 `GEMINI_API_KEY`，所有托管智能体调用都会因 Google 返回的认证错误而失败。

</TabItem>
<TabItem value="sdk" label="SDK">

```python
import os
import litellm

os.environ["GEMINI_API_KEY"] = "AIzaSy..."
```

你也可以不设置环境变量，而是在每次调用时传入 `api_key="AIzaSy..."`。

</TabItem>
</Tabs>

## 1. 创建智能体

<Tabs>
<TabItem value="proxy" label="Proxy">

```bash
curl -X POST "http://localhost:4000/v1beta/agents" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-custom-slides-agent",
    "base_agent": "antigravity-preview-05-2026",
    "instructions": "You are a helpful assistant that creates slides.",
    "base_environment": {"env_id": "YOUR_ENVIRONMENT_ID"}
}'
```

**响应**：

```json
{
  "id": "my-slides-agent",
  "base_agent": "antigravity-preview-05-2026",
  "system_instruction": "You are a helpful assistant that creates slides."
}
```

</TabItem>
<TabItem value="sdk" label="SDK">

```python
response = litellm.interactions.agents.create(
    name="my-slides-agent",
    base_agent="antigravity-preview-05-2026",
    instructions="You are a helpful assistant that creates slides.",
    custom_llm_provider="gemini",
    base_environment={"env_id": "YOUR_ENVIRONMENT_ID"}
)
print(response.id)  # "my-slides-agent"
```

异步版本：`litellm.interactions.agents.acreate(...)`。

</TabItem>
</Tabs>

**参数**：

| 字段 | 是否必填 | 说明 |
|---|---|---|
| `name` | 是 | 智能体的唯一标识符，后续调用中以该 ID 引用 |
| `base_agent` | 是 | 构建所基于的基础模型。目前 Google 仅支持 `"antigravity-preview-05-2026"` |
| `instructions` | 否 | 智能体的系统级指令 |
| `base_environment` | 否 | 环境配置（如 GCS 技能来源） |

> 如果用相同的 `name` 重复调用创建接口，Google 会返回 `409 Conflict`。

## 2. 运行智能体

<Tabs>
<TabItem value="proxy" label="Proxy">

```bash
curl -X POST "http://localhost:4000/v1beta/interactions" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "my-slides-agent",
    "input": "Create a slide deck on the Fibonacci sequence",
    "environment": "remote" # required for agents
  }'
```

</TabItem>
<TabItem value="sdk" label="SDK">

```python
response = litellm.interactions.create(
    agent="my-slides-agent",
    input="Create a slide deck on the Fibonacci sequence",
    environment="remote"
)
print(response)
```

异步版本：`litellm.interactions.acreate(...)`。

</TabItem>
</Tabs>

注意：传入的是 `agent`，**而不是** `model`。智能体名称不是 LiteLLM 模型，不要把它填到 `model` 字段里。

另请参阅 [/interactions](/docs/interactions)，查看完整的 Interactions API。

## 管理智能体

### 列出智能体

<Tabs>
<TabItem value="proxy" label="Proxy">

```bash
curl "http://localhost:4000/v1beta/agents" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**响应**：
```json
{
    "agents": [
        {
            "id": "my-custom-slides-agent"
        },
        {
            "id": "my-custom-slides-agent-1"
        }
    ]
}
```

</TabItem>
<TabItem value="sdk" label="SDK">

```python
agents = litellm.interactions.agents.list()
```

</TabItem>
</Tabs>

### 获取智能体

<Tabs>
<TabItem value="proxy" label="Proxy">

```bash
curl "http://localhost:4000/v1beta/agents/my-slides-agent" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**响应**：
```json
{
    "id": "my-custom-slides-agent",
    "base_agent": "antigravity-preview-05-2026",
    "system_instruction": "You are a helpful assistant that creates slides.",
    "base_environment": {
        "sources": [
            {
                "type": "gcs",
                "source": "gs://eap-templates/slides-skill",
                "target": "/.agents/skills/slides-skill"
            }
        ],
        "type": "remote"
    }
}
```

</TabItem>
<TabItem value="sdk" label="SDK">

```python
agent = litellm.interactions.agents.get(
    name="my-slides-agent"
)
```

</TabItem>
</Tabs>

### 删除智能体

<Tabs>
<TabItem value="proxy" label="Proxy">

```bash
curl -X DELETE "http://localhost:4000/v1beta/agents/my-slides-agent" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
<TabItem value="sdk" label="SDK">

```python
litellm.interactions.agents.delete(
    name="my-slides-agent",
    custom_llm_provider="gemini",
)
```

</TabItem>
</Tabs>

### 列出智能体版本

<Tabs>
<TabItem value="proxy" label="Proxy">

```bash
curl "http://localhost:4000/v1beta/agents/my-slides-agent/versions" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```
**响应**：
```json
{
    "agentVersions": [
        {
            "agent": "antigravity-preview-05-2026",
            "base_environment": {
                "env_id": "sdsdd"
            },
            "instructions": "You are a helpful assistant that creates slides",
            "name": "agents/my-custom-slides-agent-1/versions/a7616fd3-4e3e-48e7-aea7-9ac76b4f37ab"
        }
    ]
}
```


</TabItem>
<TabItem value="sdk" label="SDK">

```python
versions = litellm.interactions.agents.list_versions(
    name="my-slides-agent",
    custom_llm_provider="gemini",
)
```

</TabItem>
</Tabs>

## 身份验证

| Method | 密钥提供方式 |
|---|---|
| **Proxy** | 在代理服务器环境中设置 `GEMINI_API_KEY`（或 `GOOGLE_API_KEY`）。虚拟密钥（virtual key，即 `sk-...`）用于用户*向代理*认证；代理则使用你的 Gemini 密钥与 Google 通信。 |
| **SDK** | 在环境中设置 `GEMINI_API_KEY`，或在每次调用时传入 `api_key="AIzaSy..."`。 |

托管智能体无法用于 Google AI Studio 以外的任何提供商，该 API 不支持其他提供商。


## 限制

- `base_agent` 只接受 `"antigravity-preview-05-2026"`（这是 Google 当前的限制）。
- 智能体仅存储在 Google 侧，LiteLLM 不会在自己的数据库中持久化它们。如果你直接通过 Google 的 API 删除了某个智能体，代理无从得知。
- 目前仅 Gemini 支持通过 `agent` 参数使用 Interactions API。调用其他提供商的模型请使用 `model` 参数。
- 代理环境中必须配置 `GEMINI_API_KEY` 或 `GOOGLE_API_KEY`。通过 `api_key` 在单次请求中传入密钥的方式仅在 SDK 中受支持，代理端点目前不支持。

## 标签

`gemini` `managed-agents` `interactions` `google-ai-studio` `agents` `litellm-proxy`
