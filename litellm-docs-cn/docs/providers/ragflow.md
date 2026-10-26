import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RAGFlow

LiteLLM 支持 RAGFlow 的对话补全（chat completions）API。

## 支持的功能

- ✅ 对话补全（chat completions）
- ✅ 流式响应
- ✅ 同时支持对话与 Agent 两类端点
- ✅ 多种凭据来源（调用参数、环境变量、litellm_params）
- ✅ 兼容 OpenAI 的 API 格式


## API 密钥

```python
# env variable
os.environ['RAGFLOW_API_KEY']
```

## API 基础地址

```python
# env variable
os.environ['RAGFLOW_API_BASE']
```

## 概览

RAGFlow 提供兼容 OpenAI 的 API，但路径结构比较特殊，其中带有对话或 Agent 的 ID：

- **对话端点**：`/api/v1/chats_openai/{chat_id}/chat/completions`
- **Agent 端点**：`/api/v1/agents_openai/{agent_id}/chat/completions`

模型名称中则内嵌了端点类型与 ID：
- 对话：`ragflow/chat/{chat_id}/{model_name}`
- Agent：`ragflow/agent/{agent_id}/{model_name}`


## 对话端点用法示例

```python
from litellm import completion
import os

os.environ['RAGFLOW_API_KEY'] = "your-ragflow-api-key"
os.environ['RAGFLOW_API_BASE'] = "http://localhost:9380"  # or your hosted URL

response = completion(
    model="ragflow/chat/my-chat-id/{{openai_small}}",
    messages=[{"role": "user", "content": "How does the deep doc understanding work?"}]
)
print(response)
```

## Agent 端点用法示例

```python
from litellm import completion
import os

os.environ['RAGFLOW_API_KEY'] = "your-ragflow-api-key"
os.environ['RAGFLOW_API_BASE'] = "http://localhost:9380"  # or your hosted URL

response = completion(
    model="ragflow/agent/my-agent-id/{{openai_small}}",
    messages=[{"role": "user", "content": "What are the key features?"}]
)
print(response)
```

## 直接传参的用法示例

也可以直接以参数形式传入 `api_key` 和 `api_base`：

```python
from litellm import completion

response = completion(
    model="ragflow/chat/my-chat-id/{{openai_small}}",
    messages=[{"role": "user", "content": "Hello!"}],
    api_key="your-ragflow-api-key",
    api_base="http://localhost:9380"
)
print(response)
```

## 流式用法示例

```python
from litellm import completion
import os

os.environ['RAGFLOW_API_KEY'] = "your-ragflow-api-key"
os.environ['RAGFLOW_API_BASE'] = "http://localhost:9380"

response = completion(
    model="ragflow/agent/my-agent-id/{{openai_small}}",
    messages=[{"role": "user", "content": "Explain RAGFlow"}],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 模型名称格式

模型名称必须符合以下两种格式之一：

### 对话端点
```
ragflow/chat/{chat_id}/{model_name}
```

示例：`ragflow/chat/my-chat-id/{{openai_small}}`

### Agent 端点
```
ragflow/agent/{agent_id}/{model_name}
```

示例：`ragflow/agent/my-agent-id/{{openai_small}}`

其中：
- `{chat_id}` 或 `{agent_id}`：你在 RAGFlow 中创建的对话或 Agent 的 ID
- `{model_name}`：实际使用的模型名称（如 `{{openai_small}}`、`{{openai_large}}` 等）

## 配置来源

LiteLLM 支持多种提供凭据的方式，按以下顺序依次检查：

1. **函数参数**：`api_key="..."`、`api_base="..."`
2. **litellm_params**：`litellm_params={"api_key": "...", "api_base": "..."}`
3. **环境变量**：`RAGFLOW_API_KEY`、`RAGFLOW_API_BASE`
4. **litellm 全局设置**：`litellm.api_key`、`litellm.api_base`

## LiteLLM 代理服务器中的用法

### 1. 将密钥保存到环境变量

```bash
export RAGFLOW_API_KEY="your-ragflow-api-key"
export RAGFLOW_API_BASE="http://localhost:9380"
```

### 2. 启动代理

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: ragflow-chat-gpt4
    litellm_params:
      model: ragflow/chat/my-chat-id/{{openai_small}}
      api_key: os.environ/RAGFLOW_API_KEY
      api_base: os.environ/RAGFLOW_API_BASE
  - model_name: ragflow-agent-gpt4
    litellm_params:
      model: ragflow/agent/my-agent-id/{{openai_small}}
      api_key: os.environ/RAGFLOW_API_KEY
      api_base: os.environ/RAGFLOW_API_BASE
```

</TabItem>
<TabItem value="cli" label="CLI">

```bash
$ litellm --config /path/to/config.yaml

# Server running on http://0.0.0.0:4000
```

</TabItem>
</Tabs>

### 3. 测试

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "ragflow-chat-gpt4",
    "messages": [
      {"role": "user", "content": "How does RAGFlow work?"}
    ]
  }'
```

</TabItem>
<TabItem value="Python" label="Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM proxy key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="ragflow-chat-gpt4",
    messages=[
        {"role": "user", "content": "How does RAGFlow work?"}
    ]
)
print(response)
```

</TabItem>
</Tabs>

## API 基础地址的处理

`api_base` 参数带不带 `/v1` 后缀均可，LiteLLM 会自动处理：

- `http://localhost:9380` → `http://localhost:9380/api/v1/chats_openai/{chat_id}/chat/completions`
- `http://localhost:9380/v1` → `http://localhost:9380/api/v1/chats_openai/{chat_id}/chat/completions`
- `http://localhost:9380/api/v1` → `http://localhost:9380/api/v1/chats_openai/{chat_id}/chat/completions`

三种写法都能正常工作。

## 错误处理

遇到错误时：

1. **模型名称格式无效**：确认模型名称符合 `ragflow/{chat|agent}/{id}/{model_name}` 格式
2. **缺少 api_base**：请通过调用参数、环境变量或 litellm_params 提供 `api_base`
3. **连接错误**：确认 RAGFlow 服务器正在运行，且提供的 `api_base` 可以访问

:::info

如需了解如何传入各提供商的专属参数（provider-specific parameters），请参阅[这里](../completion/provider_specific_params.md)。

:::
