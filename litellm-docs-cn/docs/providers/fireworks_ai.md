import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Fireworks AI


:::info
**我们支持全部 Fireworks AI 模型，发送补全请求时只需加上 `fireworks_ai/` 前缀**
:::

:::tip
刚开始通过 LiteLLM 使用 Fireworks AI？[在 LiteLLM 中入门 Fireworks AI](https://docs.litellm.ai/blog//blog/fireworks-getting-started) 会带你从空目录一路跑通第一个请求，再添加第二个模型和一条回退配置。
:::

| 属性 | 说明 |
|-------|-------|
| 描述 | 速度最快、效率最高的推理引擎，助你构建生产就绪的复合 AI 系统。 |
| LiteLLM 提供商路由 | `fireworks_ai/` |
| 提供商文档 | [Fireworks AI ↗](https://docs.fireworks.ai/getting-started/introduction) |
| 支持的 OpenAI 端点 | `/chat/completions`, `/responses`, `/embeddings`, `/completions`, `/audio/transcriptions`, `/rerank` |


## 概述

本指南介绍如何将 LiteLLM 与 Fireworks AI 集成。接入 Fireworks AI 主要有以下三种方式：

1. <b> 使用 Fireworks AI 无服务器模型 </b>——轻松接入 Fireworks 托管的模型。
2. <b> 连接自有 Fireworks 账户中的模型 </b>——访问托管在你 Fireworks 账户内的模型。
3. <b> 通过直连路由部署接入 </b>——以更灵活、可定制的方式连接到指定的 Fireworks 实例。


## API 密钥
```python
# env variable
os.environ['FIREWORKS_AI_API_KEY']
```

## 使用示例：无服务器模型
```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = ""
response = completion(
    model="fireworks_ai/glm-5p3-flash", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

形如 `glm-5p3-flash` 的裸 serverless slug 会被自动展开为 `accounts/fireworks/models/glm-5p3-flash`，因此短 slug 和完整资源 ID 两种写法都可以。

## 使用示例：无服务器模型（流式）
```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = ""
response = completion(
    model="fireworks_ai/glm-5p3-flash", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 使用示例：自有 Fireworks 账户中的模型
```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = ""
response = completion(
    model="fireworks_ai/accounts/fireworks/models/YOUR_MODEL_ID", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 使用示例：直连路由部署
```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = "YOUR_DIRECT_API_KEY"
response = completion(
    model="fireworks_ai/accounts/fireworks/models/deepseek-v4p1-flash#accounts/gitlab/deployments/2fb7764c", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
   api_base="https://gitlab-2fb7764c.direct.fireworks.ai/v1"
)
print(response)
```

> **注意：** 以上是对话接口的写法；若要使用文本补全接口，模型应写为 model="text-completion-openai/accounts/fireworks/models/deepseek-v4p1-flash#accounts/gitlab/deployments/2fb7764c"


## 使用示例：Fireworks 路由器

Fireworks 路由器部署在 `accounts/fireworks/routers/<router-id>` 而非 `accounts/fireworks/models/<model-id>`，所以单靠裸 slug 无法告诉 LiteLLM 你指的是哪一个。在 slug 前加上 `routers/` 前缀即可指定路由器，LiteLLM 会把 `routers/<id>` 展开为 `accounts/fireworks/routers/<id>`。你账户下有哪些路由器可用，参见 [Fireworks 路由器文档](https://docs.fireworks.ai/deployments/routers)。

```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = ""
response = completion(
    model="fireworks_ai/routers/glm-latest",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

如果你喜欢写得更明确，完整资源 ID（`fireworks_ai/accounts/fireworks/routers/glm-latest`）也照样接受。以 `-fast` 结尾的 slug（例如 `fireworks_ai/glm-5p3-fast`）即使不加 `routers/` 前缀，也会按路由器处理。

## FireRouter 与开源模型路由器

[FireRouter](https://docs.fireworks.ai/nexus/firerouter) 是 Fireworks 托管的路由器。路由器 ID 不指向单一模型，而是为用户的每一轮对话挑选一个模型。Fireworks 把路由器放在 `accounts/fireworks/routers/<id>` 路径下，LiteLLM 既接受短 ID，也接受完整资源路径：

| 路由器 ID | 路由范围 | LiteLLM 模型 |
| - | - | - |
| `auto` | Fireworks 开源模型，由 Fireworks 自动挑选 | `fireworks_ai/auto` |
| `auto-instant` | Fireworks 开源模型，针对最低延迟优化 | `fireworks_ai/auto-instant` |
| `firerouter` | Claude Opus 或 GPT，外加 Fireworks 开源模型组合 | `fireworks_ai/firerouter` |
| `firerouter/<models>` | 仅限你列出的模型，如 `firerouter/opus` 或 `firerouter/kimi-k3/glm-5p3` | `fireworks_ai/firerouter/kimi-k3/glm-5p3` |
| 以上任意一种 | 同一路由器，写出完整路径 | `fireworks_ai/accounts/fireworks/routers/<id>` |

`auto` 和 `auto-instant` 只使用 Fireworks 开源模型，因此只需 Fireworks API 密钥这一个凭证。`firerouter/auto` 与 `firerouter/auto-instant` 的行为相同。更多路由见 [路由器 ID 示例](https://docs.fireworks.ai/nexus/firerouter#example-router-ids)。

完整资源路径在所有 LiteLLM 版本上都可用。短 ID `firerouter` 需要 v1.104.0-rc.1 及以上，短 ID `auto` 和 `auto-instant` 需要 v1.105.0 及以上。在更旧的版本上，短 ID 会按模型路径发送，Fireworks 会返回 404，所以旧版本请使用完整路径

```yaml
model_list:
  - model_name: auto
    litellm_params:
      model: fireworks_ai/accounts/fireworks/routers/auto
      api_key: os.environ/FIREWORKS_AI_API_KEY
  - model_name: firerouter
    litellm_params:
      model: fireworks_ai/accounts/fireworks/routers/firerouter
      api_key: os.environ/FIREWORKS_AI_API_KEY
```

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "auto", "messages": [{"role": "user", "content": "hello"}]}'
```

### 查看实际服务请求的模型

代理会在响应的 `model` 字段中返回你配置的 `model_name`，比如 `auto`。在 SDK 中，非流式 `completion()` 会把实际服务的模型报告在 `response.model` 里，例如 `fireworks_ai/glm-5p3-flash`。流式响应则在 `model` 中保留请求的路由器 ID，并把实际服务的模型放到 `response._hidden_params["provider_response_model"]`

### 闭源模型凭证

Fireworks 不转售闭源模型。当 `firerouter` 路由包含 Claude 或 GPT 时，Fireworks 会以你自己的账户去调用对应提供商，凭证可以是存在你 Fireworks 账户里的 [Provider Keys](https://docs.fireworks.ai/nexus/provider-keys)，也可以是请求上的 `x-anthropic-api-key` 或 `x-openai-api-key` 请求头。请求头的优先级高于已存储的 Provider Key

如果某个闭源模型没有可用凭证，FireRouter 会把它排除，用路由中的其他模型来服务这一轮。例如没有 Anthropic 凭证时，`firerouter/opus` 会改由 Fireworks 开源模型服务。但当你发送 `x-routing-preference: 1`（强制使用路由中的闭源主模型），或者直接调用闭源模型 ID 时，则会得到 `400 no_credential`

要从 LiteLLM 侧发送该请求头，可以在部署上通过 `litellm_params.extra_headers` 设置，也可以开启 `forward_client_headers_to_llm_api`（全局或按模型组），让每个客户端自带请求头

```yaml
model_list:
  - model_name: firerouter
    litellm_params:
      model: fireworks_ai/accounts/fireworks/routers/firerouter
      api_key: os.environ/FIREWORKS_AI_API_KEY
      extra_headers:
        x-anthropic-api-key: os.environ/ANTHROPIC_API_KEY
```

```yaml
general_settings:
  forward_client_headers_to_llm_api: true
# or per model group:
# model_group_settings:
#   forward_client_headers_to_llm_api: [firerouter]
```

同样的请求头也可以在 SDK 的 `completion()` 中传入：

```python
from litellm import completion

response = completion(
    model="fireworks_ai/firerouter",
    messages=[{"role": "user", "content": "hello"}],
    extra_headers={"x-anthropic-api-key": "sk-ant-..."},
)
```

### 路由偏好

`x-routing-preference` 控制 `firerouter` 请求在多大程度上偏向主模型或更便宜的模型，取值从 `1`（最强智能）到 `5`（最省成本），默认为 `3`。详见 [Routing Preferences](https://docs.fireworks.ai/nexus/routing-preferences)。它的传递方式与凭证请求头相同：部署上的 `litellm_params.extra_headers`、开启 `forward_client_headers_to_llm_api` 后由客户端提供，或 `completion()` 上的 `extra_headers`

### 成本追踪

LiteLLM 按 Fireworks 报告的实际路由模型来计价，路由器本身没有独立价格。Fireworks 托管的模型按 Fireworks 费率计费，闭源模型（例如某轮 Claude 调用）则按对应提供商的官方标价计费。费用会落在两张厂商账单上：开源模型归 Fireworks，闭源模型归 Anthropic 或 OpenAI，但 LiteLLM 的花费日志和预算会把两者合并到同一个模型组下统计

## 在 LiteLLM 代理中使用

### 1. 在 config.yaml 中设置 Fireworks AI 模型

```yaml
model_list:
  - model_name: fireworks-glm-5p3
    litellm_params:
      model: fireworks_ai/glm-5p3-flash
      api_key: "os.environ/FIREWORKS_AI_API_KEY"
```

### 2. 启动代理

```
litellm --config config.yaml
```

### 3. 测试


<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fireworks-glm-5p3",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="fireworks-glm-5p3", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000", # set openai_api_base to the LiteLLM Proxy
    model = "fireworks-glm-5p3",
    temperature=0.1
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```
</TabItem>
</Tabs>

## Responses API

`fireworks_ai/` 模型走 `/v1/responses` 时会直达 Fireworks 原生端点 `https://api.fireworks.ai/inference/v1/responses`，因此 MCP 工具（`"type": "mcp"`）、`previous_response_id`、推理输出项等服务端特性，表现与直连 Fireworks 完全一致

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import responses

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"

response = responses(
    model="fireworks_ai/accounts/fireworks/models/kimi-k3",
    input="Use the deepwiki MCP server to tell me in one sentence what the BerriAI/litellm repository is.",
    tools=[
        {
            "type": "mcp",
            "server_label": "deepwiki",
            "server_url": "https://mcp.deepwiki.com/mcp",
            "require_approval": "never",
        }
    ],
)
print(response.output)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: fireworks-kimi-k3
    litellm_params:
      model: fireworks_ai/accounts/fireworks/models/kimi-k3
      api_key: "os.environ/FIREWORKS_AI_API_KEY"
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！

```bash
curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "fireworks-kimi-k3",
    "input": "Use the deepwiki MCP server to tell me in one sentence what the BerriAI/litellm repository is.",
    "tools": [
      {
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never"
      }
    ]
  }'
```

</TabItem>
</Tabs>

多轮工具调用的用法与直连 Fireworks 完全一致：把 `function_call_output` 项连同 Fireworks 返回的 `previous_response_id` 一起发回，Fireworks 会在服务端继续这场对话

`developer` 输入项会以 `system` 消息的形式发给 Fireworks，因为 Fireworks 的 Responses API 在 kimi-k3、qwen3.8 等模型上没有 developer 角色。对于聊天模板要求 system 消息必须排第一的模型（如 qwen3.8），放在首个输入项之后的 developer 项仍会被拒绝，与直连调用时的行为一样

## 文档内联

LiteLLM 为 Fireworks AI 模型提供文档内联（document inlining）支持。对于并非视觉模型、但仍需解析文档/图片等内容的模型来说，这个功能非常有用。

如果模型不是视觉模型，LiteLLM 会给 image_url 的 URL 加上 `#transform=inline`。[**查看代码**](https://github.com/BerriAI/litellm/blob/1ae9d45798bdaf8450f2dfdec703369f3d2212b7/litellm/llms/fireworks_ai/chat/transformation.py#L114)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"
os.environ["FIREWORKS_AI_API_BASE"] = "https://audio-prod.api.fireworks.ai/v1"

completion = litellm.completion(
    model="fireworks_ai/accounts/fireworks/models/llama-v3p3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://storage.googleapis.com/fireworks-public/test/sample_resume.pdf"
                    },
                },
                {
                    "type": "text",
                    "text": "What are the candidate's BA and MBA GPAs?",
                },
            ],
        }
    ],
)
print(completion)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: llama-v3p3-70b-instruct
    litellm_params:
      model: fireworks_ai/accounts/fireworks/models/llama-v3p3-70b-instruct
      api_key: os.environ/FIREWORKS_AI_API_KEY
    #   api_base: os.environ/FIREWORKS_AI_API_BASE [OPTIONAL], defaults to "https://api.fireworks.ai/inference/v1"
```

2. 启动代理

```
litellm --config config.yaml
```

3. 测试

```bash
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer YOUR_API_KEY' \
-d '{"model": "llama-v3p3-70b-instruct", 
    "messages": [        
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://storage.googleapis.com/fireworks-public/test/sample_resume.pdf"
                    },
                },
                {
                    "type": "text",
                    "text": "What are the candidate's BA and MBA GPAs?",
                },
            ],
        }
    ]}'
```

</TabItem>
</Tabs>

### 禁用自动添加

若要禁用给 image_url 的 URL 自动追加 `#transform=inline` 的行为，把 `disable_add_transform_inline_image_block` 设为 `True` 即可

<Tabs>
<TabItem value="sdk" label="SDK">

```python
litellm.disable_add_transform_inline_image_block = True
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
    disable_add_transform_inline_image_block: true
```

</TabItem>
</Tabs>

## 推理力度（Reasoning Effort）

部分 Fireworks AI 模型支持 `reasoning_effort` 参数，支持的模型包括：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"

response = completion(
    model="fireworks_ai/accounts/fireworks/models/qwen3-8b",
    messages=[
        {"role": "user", "content": "What is the capital of France?"}
    ],
    reasoning_effort="low",
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "fireworks_ai/accounts/fireworks/models/qwen3-8b",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

## 用户与会话归因

只要 LiteLLM 在每个请求上附带两个标识符，Fireworks 就能区分出共用同一个 Fireworks API 密钥的各开发者

| 标识符 | LiteLLM 来源 | 发送给 Fireworks 的形式 |
|---|---|---|
| 用户 ID | 发起请求的虚拟密钥的 `user_id` | 请求体中的 `user` 字段 |
| 会话 ID | `x-litellm-session-id` 请求头、`litellm_session_id` 或 `metadata.session_id` | `x-session-affinity` 请求头 |

### 会话 ID

`fireworks_ai/` 部署会在 `/v1/chat/completions`（含流式）、`/v1/responses` 和 `/v1/messages` 上以 `x-session-affinity` 请求头发送会话 ID，这样同一会话的所有请求都会到达同一台 Fireworks 副本，并复用其提示词缓存。无需任何配置

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -H "x-litellm-session-id: my-session-1" \
  -H "Content-Type: application/json" \
  -d '{"model": "fireworks-glm-5p2", "messages": [{"role": "user", "content": "hi"}]}'
```

当请求没有会话 ID，或者代理因 `general_settings.missing_session_id` 自行生成了一个时，不会发送 `x-session-affinity` 请求头。客户端自带 `x-session-affinity` 请求头的，保留其原值。对于带 `openai/` 前缀的 Fireworks 模型，在该部署的 `litellm_params` 中设置 `provider_affinity_header: x-session-affinity`

### 用户 ID

在部署上设置 `fireworks_forward_user_id: true`，即可把 LiteLLM 用户 ID 作为 Fireworks 的 `user` 字段发送。该选项默认关闭，因为用户 ID 往往是邮箱地址

```yaml
model_list:
  - model_name: fireworks-glm-5p2
    litellm_params:
      model: fireworks_ai/glm-5p2
      api_key: "os.environ/FIREWORKS_AI_API_KEY"
      fireworks_forward_user_id: true
```

要在管理界面（Admin UI）中开启：进入 Models 页面打开该模型，点击 **Edit Settings**，并在 **LiteLLM Params** 中加入 `"fireworks_forward_user_id": true`

该设置作用于 `fireworks_ai/` 部署的 `/v1/chat/completions`（含流式）、`/v1/responses` 和 `/v1/messages`。发送的值是虚拟密钥的 `user_id`，因此共用一个 Fireworks API 密钥的两个开发者会被记为两个用户；使用主密钥发起的请求则发送代理管理员 ID，即 `default_user_id`。Fireworks 会在 `/v1/responses` 的应答中原样带回 `user`，开发者能在其中看到自己的用户 ID

LiteLLM 用户 ID 会覆盖客户端传入的任何 `user`（以及 `/v1/messages` 上的 `metadata.user_id`），也会取代 `litellm_settings.overwrite_user_with_key_hash` 本应发送的密钥哈希；客户端试图自行设置 `fireworks_forward_user_id` 的请求会被拒绝，开发者因此无法篡改自己的归因。当密钥没有 `user_id` 时，LiteLLM 保持请求原样，客户端提供的 `user` 仍会转发。要阻止这类密钥自行指定 `user`，再把 `litellm_settings.overwrite_user_with_key_hash: true` 也打开即可：这类请求会改发密钥哈希，而带 `user_id` 的密钥照旧发送用户 ID

## 支持的模型：全部 Fireworks AI 模型都支持

:::info
我们支持全部 Fireworks AI 模型，发送补全请求时只需加上 `fireworks_ai/` 前缀
:::

| 模型名 | 调用方式 |
|--------------------------|--------------------------------------------------------------------------------------------------|
| glm-5p3-flash | `completion(model="fireworks_ai/glm-5p3-flash", messages)` |
| deepseek-v4-pro | `completion(model="fireworks_ai/deepseek-v4-pro", messages)` |
| kimi-k3 | `completion(model="fireworks_ai/kimi-k3", messages)` |
| qwen3p8-max | `completion(model="fireworks_ai/qwen3p8-max", messages)` |
| minimax-m3 | `completion(model="fireworks_ai/minimax-m3", messages)` |
| gpt-oss-120b | `completion(model="fireworks_ai/gpt-oss-120b", messages)` |

上表只是部分热门模型的节选。完整、最新的模型与路由器列表请查看 [Fireworks 模型库](https://fireworks.ai/models)。

## 支持的嵌入模型

:::info
我们支持全部 Fireworks AI 模型，发送嵌入请求时只需加上 `fireworks_ai/` 前缀
:::

| 模型名 | 调用方式 |
|-----------------------|-----------------------------------------------------------------|
| fireworks_ai/nomic-ai/nomic-embed-text-v1.5 | `response = litellm.embedding(model="fireworks_ai/nomic-ai/nomic-embed-text-v1.5", input=input_text)` |
| fireworks_ai/nomic-ai/nomic-embed-text-v1 | `response = litellm.embedding(model="fireworks_ai/nomic-ai/nomic-embed-text-v1", input=input_text)` |
| fireworks_ai/WhereIsAI/UAE-Large-V1 | `response = litellm.embedding(model="fireworks_ai/WhereIsAI/UAE-Large-V1", input=input_text)` |
| fireworks_ai/thenlper/gte-large | `response = litellm.embedding(model="fireworks_ai/thenlper/gte-large", input=input_text)` |
| fireworks_ai/thenlper/gte-base | `response = litellm.embedding(model="fireworks_ai/thenlper/gte-base", input=input_text)` |


## 语音转写

### 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import transcription
import os

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"
os.environ["FIREWORKS_API_BASE"] = "https://audio-prod.api.fireworks.ai/v1"

audio_file = open("/path/to/audio.wav", "rb")

response = transcription(
    model="fireworks_ai/whisper-v3",
    file=audio_file,
)
```

[在 `.transcription` 中传入 API 密钥/API Base](../set_keys.md#向-completion-传参或任意-litellm-端点如-transcriptionembeddingtext_completion-等)

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: whisper-v3
    litellm_params:
      model: fireworks_ai/whisper-v3
      api_base: https://audio-prod.api.fireworks.ai/v1
      api_key: os.environ/FIREWORKS_API_KEY
    model_info:
      mode: audio_transcription
```

2. 启动代理

```
litellm --config config.yaml
```

3. 测试

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/audio/transcriptions' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-F 'file=@"/Users/krrishdholakia/Downloads/gettysburg.wav"' \
-F 'model="whisper-v3"' \
-F 'response_format="verbose_json"' \
```

</TabItem>
</Tabs>

## 重排序（Rerank）

### 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"

query = "What is the capital of France?"
documents = [
    "Paris is the capital and largest city of France, home to the Eiffel Tower and the Louvre Museum.",
    "France is a country in Western Europe known for its wine, cuisine, and rich history.",
    "The weather in Europe varies significantly between northern and southern regions.",
    "Python is a popular programming language used for web development and data science.",
]

response = rerank(
    model="fireworks_ai/fireworks/qwen3-reranker-8b",
    query=query,
    documents=documents,
    top_n=3,
    return_documents=True,
)
print(response)
```

[在 `.rerank` 中传入 API 密钥/API Base](../set_keys.md#向-completion-传参或任意-litellm-端点如-transcriptionembeddingtext_completion-等)

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: qwen3-reranker-8b
    litellm_params:
      model: fireworks_ai/fireworks/qwen3-reranker-8b
      api_key: os.environ/FIREWORKS_API_KEY
    model_info:
      mode: rerank
```

2. 启动代理

```
litellm --config config.yaml
```

3. 测试

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-reranker-8b",
    "query": "What is the capital of France?",
    "documents": [
        "Paris is the capital and largest city of France, home to the Eiffel Tower and the Louvre Museum.",
        "France is a country in Western Europe known for its wine, cuisine, and rich history.",
        "The weather in Europe varies significantly between northern and southern regions.",
        "Python is a popular programming language used for web development and data science."
    ],
    "top_n": 3,
    "return_documents": true
  }'
```

</TabItem>
</Tabs>

### 支持的模型

| 模型名 | 调用方式 |
|------------|---------------|
| fireworks/qwen3-reranker-8b | `rerank(model="fireworks_ai/fireworks/qwen3-reranker-8b", query=query, documents=documents)` |
