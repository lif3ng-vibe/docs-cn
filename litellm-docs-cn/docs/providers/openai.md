import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI
LiteLLM 支持 OpenAI 的对话补全（chat completion）与嵌入（embedding）调用。

:::tip
对于最新的 OpenAI 模型（GPT-5、gpt-5-codex、o3-mini 等），**推荐使用 `litellm.responses()` / Responses API**。
:::

受支持的 OpenAI 模型上的 Fast 模式，以及 GPT-6 Astra 上的 Ultrafast 模式，其管理界面（Admin UI）设置、网关配置与请求示例见 [Fast 与 Ultrafast 模式](./openai/ultrafast.md)。

### 必需的 API 密钥

```python
import os 
os.environ["OPENAI_API_KEY"] = "your-api-key"
```

### 用法
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "{{openai_large}}", 
    messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

:::info[元数据透传（预览）]
当 `litellm.enable_preview_features = True` 时，LiteLLM 只会把 `metadata` 中的值转发给 OpenAI。

```python
completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "hi"}],
    metadata= {"custom_meta_key": "value"},
)
```
:::

### 用法：LiteLLM 代理服务器

下面演示如何通过 LiteLLM 代理服务器调用 OpenAI 模型。

### 1. 在环境中保存密钥

```bash
export OPENAI_API_KEY=""
```

### 2. 启动代理

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}                          # The `openai/` prefix will call openai.chat.completions.create
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-3.5-turbo-instruct
    litellm_params:
      model: text-completion-openai/gpt-3.5-turbo-instruct # The `text-completion-openai/` prefix will call openai.completions.create
      api_key: os.environ/OPENAI_API_KEY
```
</TabItem>
<TabItem value="config-*" label="config.yaml - 代理所有 OpenAI 模型">

用它可以用一条 API 密钥接入所有 OpenAI 模型。**警告：这种方式不会做任何负载均衡**，发往 `{{openai_large}}`、`{{openai_small}}` 的请求都会经过这条路由。

```yaml
model_list:
  - model_name: "*"             # all requests where model not in your config go to this deployment
    litellm_params:
      model: openai/*           # set `openai/` to use the openai route
      api_key: os.environ/OPENAI_API_KEY
```
</TabItem>
<TabItem value="cli" label="CLI">

```bash
$ litellm --model {{openai_small}}

# Server running on http://0.0.0.0:4000
```
</TabItem>

</Tabs>

### 3. 测试


<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "{{openai_small}}",
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
response = client.chat.completions.create(model="{{openai_small}}", messages = [
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
    model = "{{openai_small}}",
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


### 可选密钥：OpenAI 组织与 OpenAI API Base

```python
import os 
os.environ["OPENAI_ORGANIZATION"] = "your-org-id"       # OPTIONAL
os.environ["OPENAI_BASE_URL"] = "https://your_host/v1"     # OPTIONAL
```

### 工作负载身份联合（无 API 密钥）

代理可以不使用静态的 `OPENAI_API_KEY`，而是通过工作负载身份联合（workload identity federation）向 OpenAI 认证：从文件中读取 OIDC 令牌（例如 Kubernetes 投影的服务账号令牌），用它换取短期有效的 OpenAI 持有者令牌，并在过期前刷新。此功能需要 `openai>=2.32.0`。

你需要从 OpenAI 平台获取三个值：身份提供方 ID（`idp_...`）、工作负载所代表的服务账号 ID（`user-...`），以及 Pod 内令牌文件的路径。

<Tabs>
<TabItem value="wif-env" label="环境变量（代理级默认）">

```bash
export OPENAI_IDENTITY_PROVIDER_ID="idp_..."
export OPENAI_SERVICE_ACCOUNT_ID="user-..."
export OPENAI_IDENTITY_TOKEN_FILE="/var/run/secrets/tokens/openai"
```

此后，所有未配置 `api_key` 的 `openai/` 部署都会使用联合认证。

</TabItem>
<TabItem value="wif-config" label="config.yaml（按部署配置）">

```yaml
model_list:
  - model_name: gpt-5.6
    litellm_params:
      model: openai/gpt-5.6
      openai_identity_provider_id: idp_...
      openai_service_account_id: user-...
      openai_identity_token_file: /var/run/secrets/tokens/openai
```

部署上设置的值优先于环境变量，因此不同部署可以以不同服务账号的身份进行联合认证。

</TabItem>
<TabItem value="wif-ui" label="管理界面（凭据）">

1. 打开 Models + Endpoints 页面，进入 Credentials 标签页，点击 Add Credential
2. 提供商选择 OpenAI，认证方式选择 Workload Identity Federation (token file)
3. 填写身份提供方 ID、服务账号 ID 和令牌文件路径，然后保存
4. 在 Add Model 中选择 OpenAI 并选定模型，然后在 Existing Credentials 下选中该凭据。API 密钥输入框会消失，因为联合认证设置已随凭据携带

</TabItem>
</Tabs>

静态密钥始终优先：只要部署、凭据或 `OPENAI_API_KEY` 中带有 API 密钥，就不会使用联合认证。联合认证也只在 API 地址为 `https://api.openai.com` 或区域主机（如 `https://eu.api.openai.com`）时生效；指向其他 OpenAI 兼容服务的自定义 `api_base` 仍会使用密钥。

只有代理管理员能在部署或凭据上设置这些字段，因为令牌文件路径决定了代理以哪个工作负载身份去交换令牌。对话补全、Responses API 和嵌入调用使用联合认证；图像、音频、语音转写、内容审核、文件、批处理、微调以及 Assistants 相关调用仍读取 `OPENAI_API_KEY`。

### OpenAI 对话补全模型

| 模型名            | 调用方式                                                   |
|-----------------------|-----------------------------------------------------------------|
| gpt-5 | `response = completion(model="gpt-5", messages=messages)` |
| gpt-5-mini | `response = completion(model="gpt-5-mini", messages=messages)` |
| gpt-5-nano | `response = completion(model="gpt-5-nano", messages=messages)` |
| gpt-5-chat | `response = completion(model="gpt-5-chat", messages=messages)` |
| gpt-5-chat-latest | `response = completion(model="gpt-5-chat-latest", messages=messages)` |
| gpt-5-2025-08-07 | `response = completion(model="gpt-5-2025-08-07", messages=messages)` |
| gpt-5-mini-2025-08-07 | `response = completion(model="gpt-5-mini-2025-08-07", messages=messages)` |
| gpt-5-nano-2025-08-07 | `response = completion(model="gpt-5-nano-2025-08-07", messages=messages)` |
| gpt-5-pro | `response = completion(model="gpt-5-pro", messages=messages)` |
| gpt-5.2 | `response = completion(model="gpt-5.2", messages=messages)` |
| gpt-5.2-2025-12-11 | `response = completion(model="gpt-5.2-2025-12-11", messages=messages)` |
| gpt-5.2-chat-latest | `response = completion(model="gpt-5.2-chat-latest", messages=messages)` |
| gpt-5.3-chat-latest | `response = completion(model="gpt-5.3-chat-latest", messages=messages)` |
| gpt-5.4 | `response = completion(model="gpt-5.4", messages=messages)` |
| gpt-5.4-2026-03-05 | `response = completion(model="gpt-5.4-2026-03-05", messages=messages)` |
| gpt-5.5 | `response = completion(model="gpt-5.5", messages=messages)` |
| gpt-5.5-2026-04-23 | `response = completion(model="gpt-5.5-2026-04-23", messages=messages)` |
| gpt-6-astra | `response = completion(model="gpt-6-astra", messages=messages)` |
| gpt-5.2-pro | `response = completion(model="gpt-5.2-pro", messages=messages)` |
| gpt-5.2-pro-2025-12-11 | `response = completion(model="gpt-5.2-pro-2025-12-11", messages=messages)` |
| gpt-5.4-pro | `response = completion(model="gpt-5.4-pro", messages=messages)` |
| gpt-5.4-pro-2026-03-05 | `response = completion(model="gpt-5.4-pro-2026-03-05", messages=messages)` |
| gpt-5.5-pro | `response = completion(model="gpt-5.5-pro", messages=messages)` |
| gpt-5.5-pro-2026-04-23 | `response = completion(model="gpt-5.5-pro-2026-04-23", messages=messages)` |
| gpt-5.1 | `response = completion(model="gpt-5.1", messages=messages)` |
| gpt-5.1-codex | `response = completion(model="gpt-5.1-codex", messages=messages)` |
| gpt-5.1-codex-mini | `response = completion(model="gpt-5.1-codex-mini", messages=messages)` |
| gpt-5.1-codex-max | `response = completion(model="gpt-5.1-codex-max", messages=messages)` |
| gpt-4.1 | `response = completion(model="gpt-4.1", messages=messages)` |
| gpt-4.1-mini | `response = completion(model="gpt-4.1-mini", messages=messages)` |
| gpt-4.1-nano | `response = completion(model="gpt-4.1-nano", messages=messages)` |
| o4-mini | `response = completion(model="o4-mini", messages=messages)` |
| o3-mini | `response = completion(model="o3-mini", messages=messages)` |
| o3 | `response = completion(model="o3", messages=messages)` |
| o1-mini | `response = completion(model="o1-mini", messages=messages)` |
| o1-preview | `response = completion(model="o1-preview", messages=messages)` |
| gpt-4o-mini  | `response = completion(model="gpt-4o-mini", messages=messages)` |
| gpt-4o-mini-2024-07-18   | `response = completion(model="gpt-4o-mini-2024-07-18", messages=messages)` |
| gpt-4o   | `response = completion(model="gpt-4o", messages=messages)` |
| gpt-4o-2024-08-06   | `response = completion(model="gpt-4o-2024-08-06", messages=messages)` |
| gpt-4o-2024-05-13   | `response = completion(model="gpt-4o-2024-05-13", messages=messages)` |
| gpt-4-turbo   | `response = completion(model="gpt-4-turbo", messages=messages)` |
| gpt-4-turbo-preview   | `response = completion(model="gpt-4-0125-preview", messages=messages)` |
| gpt-4-0125-preview    | `response = completion(model="gpt-4-0125-preview", messages=messages)` |
| gpt-4-1106-preview    | `response = completion(model="gpt-4-1106-preview", messages=messages)` |
| gpt-3.5-turbo-1106    | `response = completion(model="gpt-3.5-turbo-1106", messages=messages)` |
| gpt-3.5-turbo         | `response = completion(model="gpt-3.5-turbo", messages=messages)` |
| gpt-3.5-turbo-0301    | `response = completion(model="gpt-3.5-turbo-0301", messages=messages)` |
| gpt-3.5-turbo-0613    | `response = completion(model="gpt-3.5-turbo-0613", messages=messages)` |
| gpt-3.5-turbo-16k     | `response = completion(model="gpt-3.5-turbo-16k", messages=messages)` |
| gpt-3.5-turbo-16k-0613| `response = completion(model="gpt-3.5-turbo-16k-0613", messages=messages)` |
| gpt-4                 | `response = completion(model="gpt-4", messages=messages)` |
| gpt-4-0314            | `response = completion(model="gpt-4-0314", messages=messages)` |
| gpt-4-0613            | `response = completion(model="gpt-4-0613", messages=messages)` |
| gpt-4-32k             | `response = completion(model="gpt-4-32k", messages=messages)` |
| gpt-4-32k-0314        | `response = completion(model="gpt-4-32k-0314", messages=messages)` |
| gpt-4-32k-0613        | `response = completion(model="gpt-4-32k-0613", messages=messages)` |


这些模型同样支持 `OPENAI_BASE_URL` 环境变量，可用于指定自定义 API 端点。

### OpenAI 联网搜索模型

OpenAI 提供两种联网搜索方式，取决于所用的端点：

| 方式 | 端点 | 模型 | 启用方法 |
|----------|----------|--------|---------------|
| **搜索型模型** | `/chat/completions` | `gpt-5-search-api`、`gpt-4o-search-preview`、`gpt-4o-mini-search-preview` | 传入 `web_search_options` 参数 |
| **Web Search 工具** | `/responses` | `gpt-5`、`gpt-4.1`、`gpt-4o` 及其他常规模型 | 传入 `web_search_preview` 工具 |

<Tabs>
<TabItem value="sdk-completion" label="SDK - /chat/completions">

```python showLineNumbers
from litellm import completion

response = completion(
    model="openai/gpt-5-search-api",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    web_search_options={
        "search_context_size": "medium"  # Options: "low", "medium", "high"
    }
)
```

</TabItem>
<TabItem value="sdk-responses" label="SDK - /responses">

```python showLineNumbers
from litellm import responses

response = responses(
    model="openai/{{openai_large}}",
    input="What is the capital of France?",
    tools=[{
        "type": "web_search_preview",
        "search_context_size": "low"
    }]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  # Search model for /chat/completions
  - model_name: gpt-5-search-api
    litellm_params:
      model: openai/gpt-5-search-api
      api_key: os.environ/OPENAI_API_KEY

  # Regular model for /responses with web_search_preview tool
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
</Tabs>

完整细节见 [联网搜索指南](../completion/web_search.md)。

## OpenAI 视觉模型
| 模型名            | 调用方式                                                   |
|-----------------------|-----------------------------------------------------------------|
| gpt-4o   | `response = completion(model="gpt-4o", messages=messages)` |
| gpt-4-turbo    | `response = completion(model="gpt-4-turbo", messages=messages)` |
| gpt-4-vision-preview    | `response = completion(model="gpt-4-vision-preview", messages=messages)` |

#### 用法
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "{{openai_large}}", 
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                                }
                            }
                        ]
        }
    ],
)

```

## PDF 文件解析

OpenAI 新增了 `file` 消息类型，可以直接传入 PDF 文件并将其解析为结构化输出。[了解更多](https://platform.openai.com/docs/guides/pdf-files?api-mode=chat&lang=python)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import base64
from litellm import completion

with open("draconomicon.pdf", "rb") as f:
    data = f.read()

base64_string = base64.b64encode(data).decode("utf-8")

completion = completion(
    model="{{openai_large}}",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "file",
                    "file": {
                        "filename": "draconomicon.pdf",
                        "file_data": f"data:application/pdf;base64,{base64_string}",
                    }
                },
                {
                    "type": "text",
                    "text": "What is the first dragon in the book?",
                }
            ],
        },
    ],
)

print(completion.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: openai-model
    litellm_params:
      model: {{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动代理

```bash
litellm --config config.yaml
```

3. 测试！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{ 
    "model": "openai-model",
    "messages": [
        {"role": "user", "content": [
            {
                "type": "file",
                "file": {
                    "filename": "draconomicon.pdf",
                    "file_data": f"data:application/pdf;base64,{base64_string}",
                }
            }
        ]}
    ]
}'
```

</TabItem>
</Tabs>

## OpenAI 微调模型

| 模型名                | 调用方式                                                          |
|---------------------------|-----------------------------------------------------------------|
| 微调版 `gpt-4-0613`    | `response = completion(model="ft:gpt-4-0613", messages=messages)`     |
| 微调版 `gpt-4o-2024-05-13` | `response = completion(model="ft:gpt-4o-2024-05-13", messages=messages)` |
| 微调版 `gpt-3.5-turbo-0125` | `response = completion(model="ft:gpt-3.5-turbo-0125", messages=messages)` |
| 微调版 `gpt-3.5-turbo-1106` | `response = completion(model="ft:gpt-3.5-turbo-1106", messages=messages)` |
| 微调版 `gpt-3.5-turbo-0613` | `response = completion(model="ft:gpt-3.5-turbo-0613", messages=messages)` |

## [BETA] 将所有 .completions 请求路由到 Responses API（质量更佳）
启用后，LiteLLM 会把来自 `litellm.completion()` 和代理 `/chat/completions` 端点的 OpenAI 流量改走 [Responses API](https://platform.openai.com/docs/api-reference/responses)，而不是 Chat Completions。这条路径通常与 OpenAI 最新模型的行为和质量保持一致（例如 GPT-5 级模型的推理输出）。

你可以全局开启，也可以按请求开启：

**方式 A：按请求加前缀**。使用 `openai/responses/` 模型前缀。

**方式 B：全局开关**（推荐）。设置 `route_all_chat_openai_to_responses = True`，所有 OpenAI `/chat/completions` 请求都会自动改走 Responses API，无需再加模型前缀。

<Tabs>
<TabItem value="sdk-global" label="SDK - 全局开关">

```python
import litellm

litellm.route_all_chat_openai_to_responses = True

response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)
```

</TabItem>
<TabItem value="proxy-global" label="PROXY - 全局开关">

在代理配置中设置：
```yaml
litellm_settings:
  route_all_chat_openai_to_responses: true
```

之后正常调用即可，无需模型前缀：
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
}'
```

</TabItem>
</Tabs>

:::note
`route_all_chat_openai_to_responses` 仅对 `openai` 提供商生效，Azure OpenAI 不受影响。也可以通过环境变量设置：`LITELLM_ROUTE_ALL_CHAT_OPENAI_TO_RESPONSES=true`。
:::

**方式 A：按请求加前缀**。也可以在单个模型名前加 `openai/responses/`，只让这一次调用走 Responses API。

<Tabs>
<TabItem value="sdk" label="SDK">
```python
response = litellm.completion(
    model="openai/responses/{{openai_small}}", # tells litellm to call the model via the Responses API
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)
```
</TabItem>

<TabItem value="proxy" label="PROXY">
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{ 
    "model": "openai/responses/{{openai_small}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
}'
```
</TabItem>
</Tabs>

预期响应：
```json
{
  "id": "chatcmpl-6382a222-43c9-40c4-856b-22e105d88075",
  "created": 1760146746,
  "model": "{{openai_small}}",
  "object": "chat.completion",
  "system_fingerprint": null,
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "Paris",
        "role": "assistant",
        "tool_calls": null,
        "function_call": null,
        "reasoning_content": "**Identifying the capital**\n\nThe user wants me to think of the capital of France and write it down. That's pretty straightforward: it's Paris. There aren't any safety issues to consider here. I think it would be best to keep it concise, so maybe just \"Paris\" would suffice. I feel confident that I should just stick to that without adding anything else. So, let's write it down!",
        "provider_specific_fields": null
      }
    }
  ],
  "usage": {
    "completion_tokens": 7,
    "prompt_tokens": 18,
    "total_tokens": 25,
    "completion_tokens_details": null,
    "prompt_tokens_details": {
      "audio_tokens": null,
      "cached_tokens": 0,
      "text_tokens": null,
      "image_tokens": null
    }
  }
}

```

### 进阶：将 `reasoning_effort` 与 `summary` 字段搭配使用

默认情况下，`reasoning_effort` 接受字符串值（`"none"`、`"minimal"`、`"low"`、`"medium"`、`"high"`、`"xhigh"`，其中 `"xhigh"` 仅 `gpt-5.1-codex-max` 和 `gpt-5.2` 模型支持），只设定推理力度，不附带推理摘要。

想启用 `summary` 功能，可以把 `reasoning_effort` 以字典形式传入。**注意**：`summary` 字段要求你的 OpenAI 组织已通过验证，未验证的组织使用 `summary` 会收到 OpenAI 返回的 400 错误。

<Tabs>
<TabItem value="sdk" label="SDK">
```python
# Option 1: String format (default - no summary)
response = litellm.completion(
    model="openai/responses/{{openai_small}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="high"  # Only sets effort level
)

# Option 2: Dict format (with optional summary - requires org verification)
response = litellm.completion(
    model="openai/responses/{{openai_small}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort={"effort": "high", "summary": "auto"}  # "auto", "detailed", or "concise" (not all supported by all models)
)
```
</TabItem>

<TabItem value="proxy" label="PROXY">
```bash
# Option 1: String format (default - no summary)
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "openai/responses/{{openai_small}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "high"
}'

# Option 2: Dict format (with optional summary - requires org verification)
# summary options: "auto", "detailed", or "concise" (not all supported by all models)
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "openai/responses/{{openai_small}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": {"effort": "high", "summary": "auto"}
}'
```
</TabItem>
</Tabs>

**`summary` 字段取值**：
- `"auto"`：由系统根据模型自动决定合适的摘要详略程度
- `"concise"`：提供更简短的摘要（GPT-5 系列模型不支持）
- `"detailed"`：提供更完整的推理摘要

**注意**：GPT-5 系列模型支持 `"auto"` 和 `"detailed"`，不支持 `"concise"`。O 系列模型（o3-pro、o4-mini、o3）三种取值全部支持。o3-mini、o1 等模型则完全不支持推理摘要。

**各模型支持的 `reasoning_effort` 取值**：

| 模型 | 默认值（未设置时） | 支持的取值 |
|-------|----------------------|------------------|
| `gpt-5.1` | `none` | `none`, `low`, `medium`, `high` |
| `gpt-5` | `medium` | `minimal`, `low`, `medium`, `high` |
| `gpt-5-mini` | `medium` | `minimal`, `low`, `medium`, `high` |
| `gpt-5-nano` | `none` | `none`, `low`, `medium`, `high` |
| `gpt-5-codex` | `adaptive` | `low`, `medium`, `high` (no `minimal`) |
| `gpt-5.1-codex` | `adaptive` | `low`, `medium`, `high` (no `minimal`) |
| `gpt-5.1-codex-mini` | `adaptive` | `low`, `medium`, `high` (no `minimal`) |
| `gpt-5.1-codex-max` | `adaptive` | `low`, `medium`, `high`, `xhigh` (no `minimal`) |
| `gpt-5.2` | `medium` | `none`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5.2-pro` | `high` | `low`, `medium`, `high`, `xhigh` |
| `gpt-5.5` | `medium` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5.5-pro` | `high` | `minimal`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5-pro` | `high` | `high` only |

**注意**：
- GPT-5.1 引入了新的 `reasoning_effort="none"` 设置，可获得更快、延迟更低的响应，取代 GPT-5 的 `"minimal"` 设置。
- `gpt-5.1-codex-max`、`gpt-5.2`、`gpt-5.2-pro`、`gpt-5.5` 和 `gpt-5.5-pro` 支持 `reasoning_effort="xhigh"`，不在此列的模型会拒绝该取值。
- `gpt-5-pro` 只接受 `reasoning_effort="high"`，传入其他取值会报错。
- 未设置 `reasoning_effort`（None）时，OpenAI 默认使用表中“默认值”一列的取值。

组织验证要求的更多细节见 [OpenAI Reasoning 文档](https://platform.openai.com/docs/guides/reasoning)。

| `gpt-5.1-codex-max` | `adaptive` | `low`, `medium`, `high`, `xhigh` (no `minimal`) |
| `gpt-5.2` | `medium` | `none`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5.2-pro` | `high` | `low`, `medium`, `high`, `xhigh` |
| `gpt-5.5` | `medium` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5.5-pro` | `high` | `minimal`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5-pro` | `high` | `high` only |

**注意**：
- GPT-5.1 引入了新的 `reasoning_effort="none"` 设置，响应更快、延迟更低，用来取代 GPT-5 的 `"minimal"` 设置。
- `gpt-5.1-codex-max`、`gpt-5.2`、`gpt-5.2-pro`、`gpt-5.5` 与 `gpt-5.5-pro` 支持 `reasoning_effort="xhigh"`，此外的模型会拒绝该取值。
- `gpt-5-pro` 只接受 `reasoning_effort="high"`，其他取值都会报错。
- 未设置 `reasoning_effort`（None）时，OpenAI 默认采用上表“默认值”列所示的取值。

有关组织验证要求的更多细节，参见 [OpenAI Reasoning 文档](https://platform.openai.com/docs/guides/reasoning)。

### 多轮对话与 `reasoning_items`

多轮对话需要用到 `reasoning_items`：一种结构化数据块，内含 `encrypted_content` 令牌，OpenAI 依靠它在下一次请求时恢复推理状态。凡是希望返回该令牌的调用，都要传入 `include=["reasoning.encrypted_content"]`。

<Tabs>
<TabItem value="non-streaming" label="非流式">

```python showLineNumbers title="Non-streaming: round-trip reasoning_items"
import litellm

messages = [{"role": "user", "content": "Solve this step by step: 2 + 2"}]

# Turn 1 — get reasoning_items (encrypted_content);
response = litellm.completion(
    model="openai/responses/{{openai_small}}",
    messages=messages,
    reasoning_effort="low",
    include=["reasoning.encrypted_content"],
)

assistant_msg = response.choices[0].message

# Turn 2 — pass reasoning_items back; LiteLLM converts to the correct Responses API format
messages.append({
    "role": "assistant",
    "content": assistant_msg.content,
    "reasoning_items": assistant_msg.reasoning_items,
})
messages.append({"role": "user", "content": "Now summarize your reasoning."})

response2 = litellm.completion(
    model="openai/responses/{{openai_small}}",
    messages=messages,
    reasoning_effort="low",
    include=["reasoning.encrypted_content"],
)
```

</TabItem>
<TabItem value="streaming" label="流式">

`reasoning_items`（连同 `encrypted_content`）会在完整响应结束时的最后一个分块中返回：

```python showLineNumbers title="Streaming: collect and round-trip reasoning_items"
import litellm

messages = [{"role": "user", "content": "Solve this step by step: 2 + 2"}]

collected_content = []
collected_reasoning_items = []

stream = litellm.completion(
    model="openai/responses/{{openai_small}}",
    messages=messages,
    stream=True,
    reasoning_effort="low",
    include=["reasoning.encrypted_content"],
)

for chunk in stream:
    delta = chunk.choices[0].delta
    if delta.content:
        collected_content.append(delta.content)
    if getattr(delta, "reasoning_items", None):
        collected_reasoning_items.extend(delta.reasoning_items)

messages.append({
    "role": "assistant",
    "content": "".join(collected_content),
    "reasoning_items": collected_reasoning_items or None,
})
messages.append({"role": "user", "content": "Continue the conversation."})

response2 = litellm.completion(
    model="openai/responses/{{openai_small}}",
    messages=messages,
    reasoning_effort="low",
    include=["reasoning.encrypted_content"],
)
```

</TabItem>
</Tabs>

### GPT-5 模型的 verbosity 控制

`verbosity` 参数控制 GPT-5 系列模型回复的长度与详略程度，接受三个取值：`"low"`、`"medium"` 或 `"high"`。

**支持的模型**：`gpt-5`、`gpt-5.1`、`gpt-5-mini`、`gpt-5-nano`、`gpt-5-pro`

**注意**：GPT-5-Codex 系列模型（`gpt-5-codex`、`gpt-5.1-codex`、`gpt-5.1-codex-mini`、`gpt-5.1-codex-max`）**不**支持 `verbosity` 参数。

**适用场景**：
- **`"low"`**：最适合简短回答或简单代码生成（如 SQL 查询）
- **`"medium"`**：默认值，输出长度适中
- **`"high"`**：需要详尽解释或大范围代码重构时使用

<Tabs>
<TabItem value="sdk" label="SDK">
```python
import litellm

# Low verbosity - concise responses
response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Write a function to reverse a string"}],
    verbosity="low"
)

# High verbosity - detailed responses
response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Explain how neural networks work"}],
    verbosity="high"
)
```
</TabItem>

<TabItem value="proxy" label="PROXY">
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Write a function to reverse a string"}],
    "verbosity": "low"
}'
```
</TabItem>
</Tabs>


## OpenAI 对话补全到 Responses API 的桥接

LiteLLM 提供了从对话补全到 Responses API 的桥接：你继续使用补全接口，底层实际调用的是 Responses API。

当你想用上 [Responses API](https://platform.openai.com/docs/api-reference/responses) 的专属功能（比如内置工具、web search preview、代码解释器）时，这个桥接会很有用。

:::tip[gpt-5.4+ + reasoning_effort + 函数工具]

对于 `gpt-5.4` 及更新的模型（`gpt-5.4`、`gpt-5.5` 以及后续 5.x 版本），如果请求带有 tools，LiteLLM 会从发往 `litellm.completion()` 的请求中丢弃 `reasoning_effort`，因为这一组合只有 Responses API 才支持。

如果你需要推理**和**工具并用，请改用 responses 桥接（当 `tools` 与 `reasoning_effort` 同时设置时，LiteLLM 也会自动把这类请求路由到 `/v1/responses`）：

```python
response = litellm.completion(
    model="openai/responses/{{openai_large}}",  # routes to /v1/responses
    messages=[{"role": "user", "content": "What's the weather?"}],
    tools=[...],
    reasoning_effort="low",
)
```

:::

### 何时使用 `openai/responses/` 前缀

每个模型在 [`model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) 里都有一个 `mode` 属性，决定它默认走哪个 API 端点：

- **`mode: responses`**：模型自动使用 Responses API
- **`mode: chat`**：模型默认使用 Chat Completions API

**`mode: responses` 的模型**（自动走 Responses API）：
- `o3-deep-research`、`o4-mini-deep-research`
- `o1-pro`、`o3-pro`
- `gpt-5.1-codex`、`gpt-5.1-codex-mini`、`gpt-5.1-codex-max`
- `codex-mini-latest`

**`mode: chat` 的模型**（使用内置工具需加 `openai/responses/` 前缀）：
- `gpt-4o`、`gpt-4o-mini`、`gpt-4.1`、`gpt-4.1-mini`
- `gpt-5`、`gpt-5-mini`、`gpt-5.6-terra`、`gpt-5.6-luna`
- `o3`、`o4-mini`

要在 `mode: chat` 的模型上使用 `web_search_preview` 这类内置工具，需要加上 `openai/responses/` 前缀：

```python
# This will FAIL - {{openai_large}} has mode: chat, uses Chat Completions API
response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "What is the weather in Paris today?"}],
    tools=[{"type": "web_search_preview"}],  # Not supported in Chat Completions
    # ... other kwargs
)

# This will WORK - prefix forces Responses API
response = litellm.completion(
    model="openai/responses/{{openai_large}}",
    messages=[{"role": "user", "content": "What is the weather in Paris today?"}],
    tools=[{"type": "web_search_preview"}],  # Supported in Responses API
    # ... other kwargs
)
```

### 示例

<Tabs>
<TabItem value="sdk" label="SDK">

**使用 `mode: responses` 的模型（自动路由）：**

```python
import litellm
import os

os.environ["OPENAI_API_KEY"] = "sk-<your-api-key>"

response = litellm.completion(
    model="o3-deep-research-2025-06-26",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    tools=[
        {"type": "web_search_preview"},
        {"type": "code_interpreter", "container": {"type": "auto"}},
    ],
)
print(response)
```

**使用 `mode: chat` 的模型（需加前缀）：**

```python
import litellm
import os

os.environ["OPENAI_API_KEY"] = "sk-<your-api-key>"

# Use the openai/responses/ prefix to enable built-in tools
response = litellm.completion(
    model="openai/responses/{{openai_large}}",
    messages=[{"role": "user", "content": "What is the weather in Paris today?"}],
    tools=[
        {"type": "web_search_preview"},
    ],
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  # Model with mode: responses (automatic)
  - model_name: o3-deep-research
    litellm_params:
      model: o3-deep-research-2025-06-26
      api_key: os.environ/OPENAI_API_KEY

  # Model with mode: chat (use prefix for built-in tools)
  - model_name: gpt-4o-with-tools
    litellm_params:
      model: openai/responses/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 启动代理

```bash
litellm --config config.yaml
```

3. 测试一下！

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "gpt-4o-with-tools",
    "messages": [
        {"role": "user", "content": "What is the weather in Paris today?"}
    ],
    "tools": [
        {"type": "web_search_preview"}
    ]
}'
```

</TabItem>
</Tabs>


## OpenAI 语音转写

LiteLLM 支持 OpenAI 的语音转写端点。

支持的模型：

| 模型名 | 调用方式 |
|---------------------------|-----------------------------------------------------------------|
| `whisper-1`    | `response = completion(model="whisper-1", file=audio_file)`     |
| `gpt-4o-transcribe` | `response = completion(model="gpt-4o-transcribe", file=audio_file)` |
| `gpt-4o-mini-transcribe` | `response = completion(model="gpt-4o-mini-transcribe", file=audio_file)` |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import transcription
import os 

# set api keys 
os.environ["OPENAI_API_KEY"] = ""
audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(model="gpt-4o-transcribe", file=audio_file)

print(f"response: {response}")
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
- model_name: gpt-4o-transcribe
  litellm_params:
    model: gpt-4o-transcribe
    api_key: os.environ/OPENAI_API_KEY
  model_info:
    mode: audio_transcription
    
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

2. 启动代理

```bash
litellm --config config.yaml
```

3. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'file=@"/Users/krrishdholakia/Downloads/gettysburg.wav"' \
--form 'model="gpt-4o-transcribe"'
```



</TabItem>
</Tabs>



## 高级用法

### 获取 OpenAI API 响应头

设置 `litellm.return_response_headers = True`，即可拿到 OpenAI 返回的原始响应头。

`litellm.completion()` 与 `litellm.embedding()` 的返回值中始终会带有 `_response_headers` 字段。

<Tabs>
<TabItem value="litellm.completion" label="litellm.completion">

```python
litellm.return_response_headers = True

# /chat/completion
response = completion(
    model="{{openai_small}}",
    messages=[
        {
            "role": "user",
            "content": "hi",
        }
    ],
)
print(f"response: {response}")
print("_response_headers=", response._response_headers)
```
</TabItem>

<TabItem value="litellm.completion - streaming" label="litellm.completion + stream">

```python
litellm.return_response_headers = True

# /chat/completion
response = completion(
    model="{{openai_small}}",
    stream=True,
    messages=[
        {
            "role": "user",
            "content": "hi",
        }
    ],
)
print(f"response: {response}")
print("response_headers=", response._response_headers)
for chunk in response:
    print(chunk)
```
</TabItem>

<TabItem value="litellm.embedding" label="litellm.embedding">

```python
litellm.return_response_headers = True

# embedding
embedding_response = litellm.embedding(
    model="text-embedding-ada-002",
    input="hello",
)

embedding_response_headers = embedding_response._response_headers
print("embedding_response_headers=", embedding_response_headers)
```

</TabItem>
</Tabs>
OpenAI 返回的响应头示例如下：

```json
{
  "date": "Sat, 20 Jul 2024 22:05:23 GMT",
  "content-type": "application/json",
  "transfer-encoding": "chunked",
  "connection": "keep-alive",
  "access-control-allow-origin": "*",
  "openai-model": "text-embedding-ada-002",
  "openai-organization": "*****",
  "openai-processing-ms": "20",
  "openai-version": "2020-10-01",
  "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
  "x-ratelimit-limit-requests": "5000",
  "x-ratelimit-limit-tokens": "5000000",
  "x-ratelimit-remaining-requests": "4999",
  "x-ratelimit-remaining-tokens": "4999999",
  "x-ratelimit-reset-requests": "12ms",
  "x-ratelimit-reset-tokens": "0s",
  "x-request-id": "req_cc37487bfd336358231a17034bcfb4d9",
  "cf-cache-status": "DYNAMIC",
  "set-cookie": "__cf_bm=E_FJY8fdAIMBzBE2RZI2.OkMIO3lf8Hz.ydBQJ9m3q8-1721513123-1.0.1.1-6OK0zXvtd5s9Jgqfz66cU9gzQYpcuh_RLaUZ9dOgxR9Qeq4oJlu.04C09hOTCFn7Hg.k.2tiKLOX24szUE2shw; path=/; expires=Sat, 20-Jul-24 22:35:23 GMT; domain=.api.openai.com; HttpOnly; Secure; SameSite=None, *cfuvid=SDndIImxiO3U0aBcVtoy1TBQqYeQtVDo1L6*Nlpp7EU-1721513123215-0.0.1.1-604800000; path=/; domain=.api.openai.com; HttpOnly; Secure; SameSite=None",
  "x-content-type-options": "nosniff",
  "server": "cloudflare",
  "cf-ray": "8a66409b4f8acee9-SJC",
  "content-encoding": "br",
  "alt-svc": "h3=\":443\"; ma=86400"
}
```

### 并行函数调用
litellm 并行函数调用的详细示例见[这里](https://docs.litellm.ai/docs/completion/function_call)
```python
import litellm
import json
# set openai api key
import os
os.environ['OPENAI_API_KEY'] = "" # litellm reads OPENAI_API_KEY from .env and sends the request
# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})

messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]

response = litellm.completion(
    model="{{openai_small}}",
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response1:\n", response)
response_message = response.choices[0].message
tool_calls = response.choices[0].message.tool_calls
```

### 为补全调用设置 `extra_headers`
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
    model = "{{openai_small}}", 
    messages=[{ "content": "Hello, how are you?","role": "user"}],
    extra_headers={"AI-Resource Group": "ishaan-resource"}
)
```

### 为补全调用设置 Organization-ID
可以通过以下任一方式设置：
- 环境变量 `OPENAI_ORGANIZATION`
- 以参数形式传给 `litellm.completion(model=model, organization="your-organization-id")`
- 设置为 `litellm.organization="your-organization-id"`
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["OPENAI_ORGANIZATION"] = "your-org-id" # OPTIONAL

response = completion(
    model = "{{openai_small}}", 
    messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

### 设置 `ssl_verify=False`

方法是自行设置 `httpx.Client`：

- 对于 `litellm.completion`，设置 `litellm.client_session=httpx.Client(verify=False)`
- 对于 `litellm.acompletion`，设置 `litellm.aclient_session=AsyncClient.Client(verify=False)`
```python
import litellm, httpx

# for completion
litellm.client_session = httpx.Client(verify=False)
response = litellm.completion(
    model="{{openai_small}}",
    messages=messages,
)

# for acompletion
litellm.aclient_session = httpx.AsyncClient(verify=False)
response = litellm.acompletion(
    model="{{openai_small}}",
    messages=messages,
)
```


### 在 LiteLLM 中使用 OpenAI 代理
```python
import os 
import litellm
from litellm import completion

os.environ["OPENAI_API_KEY"] = ""

# set custom api base to your proxy
# either set .env or litellm.api_base
# os.environ["OPENAI_BASE_URL"] = "https://your_host/v1"
litellm.api_base = "https://your_host/v1"


messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion("openai/your-model-name", messages)
```

如果需要动态设置 api_base，直接在补全调用里传入即可：`completions(...,api_base="your-proxy-api-base")`

更多信息参见[设置 API Base/密钥](../set_keys.md)。

### 为代理请求转发 Org ID

使用 `forward_openai_org_id` 参数，可以把客户端的 OpenAI Org ID 透传给 OpenAI。

1. 配置 config.yaml

```yaml
model_list:
  - model_name: "{{openai_small}}"
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

general_settings:
    forward_openai_org_id: true # 👈 KEY CHANGE
```

2. 启动代理

```bash
litellm --config config.yaml --detailed_debug

# RUNNING on http://0.0.0.0:4000
```

3. 发起 OpenAI 调用

```python
from openai import OpenAI
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    organization="my-special-org",
    base_url="http://0.0.0.0:4000"
)

client.chat.completions.create(model="{{openai_small}}", messages=[{"role": "user", "content": "Hello world"}])
```

日志中应该能看到转发过去的 org id

```bash
LiteLLM:DEBUG: utils.py:255 - Request to litellm:
LiteLLM:DEBUG: utils.py:255 - litellm.acompletion(... organization='my-special-org',)
```

## GPT-5 Pro 特别说明

GPT-5 Pro 是 OpenAI 最先进的推理模型，有几个独特之处：

- **仅支持 Responses API**：GPT-5 Pro 只能通过 `/v1/responses` 端点调用
- **不支持流式**：不支持流式响应
- **高推理强度**：为复杂推理任务而设计，以最高推理强度运行
- **上下文窗口**：输入 400,000 Token，输出 272,000 Token
- **定价**：每 100 万 Token 输入 $15.00 / 输出 $120.00（标准），输入 $7.50 / 输出 $60.00（批处理）
- **工具**：支持 Web Search、File Search、Image Generation、MCP（不支持 Code Interpreter 与 Computer Use）
- **模态**：输入支持文本与图像，输出仅支持文本

```python
# GPT-5 Pro usage example
response = completion(
    model="gpt-5-pro", 
    messages=[{"role": "user", "content": "Solve this complex reasoning problem..."}]
)
```

## 视频生成

LiteLLM 支持 OpenAI 的视频生成模型，包括 Sora。

有关视频生成的详细文档，参见 [OpenAI 视频生成 →](./openai/videos.md)
