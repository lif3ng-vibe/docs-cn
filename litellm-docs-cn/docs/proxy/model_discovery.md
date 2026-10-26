# 模型发现

当你为通配模型调用 `/v1/models` 时，可以用这个功能向用户提供提供商端点背后实际可用模型的准确列表。

## 支持的模型

- Fireworks AI
- OpenAI
- Gemini
- LiteLLM Proxy
- Topaz
- Anthropic
- XAI
- VLLM
- Vertex AI
- Eden AI
- Bedrock

### 用法

**1. 配置 config.yaml**

```yaml
model_list:
    - model_name: xai/*
      litellm_params:
        model: xai/*
        api_key: os.environ/XAI_API_KEY

litellm_settings:
    check_provider_endpoint: true # 👈 Enable checking provider endpoint for wildcard models
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**3. 调用 `/v1/models`**

```bash
curl -X GET "http://localhost:4000/v1/models" -H "Authorization: Bearer $LITELLM_KEY"
```

预期响应

```json
{
    "data": [
        {
            "id": "xai/grok-2-1212",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        },
        {
            "id": "xai/grok-2-vision-1212",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        },
        {
            "id": "xai/grok-3-beta",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        },
        {
            "id": "xai/grok-3-fast-beta",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        },
        {
            "id": "xai/grok-3-mini-beta",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        },
        {
            "id": "xai/grok-3-mini-fast-beta",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        },
        {
            "id": "xai/grok-beta",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        },
        {
            "id": "xai/grok-vision-beta",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        },
        {
            "id": "xai/grok-2-image-1212",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
        }
    ],
    "object": "list"
}
```

## 模型发现使用哪个密钥

发现功能会使用通配部署自身的凭据调用提供商：即该部署的 `api_base`，以及它的 `api_key`；若未设置 `api_key`，则回退到代理主机上该提供商的环境变量。当部署指向一个自定义的 Anthropic 兼容网关时，LiteLLM 会请求 `<api_base>/v1/models`，并通过 `x-api-key` 携带该密钥，然后把返回的每个 id 挂到通配前缀之下，例如 `my-gateway/claude-sonnet-4-5`。

```yaml
model_list:
  - model_name: "my-gateway/*"
    litellm_params:
      model: "anthropic/*"
      api_base: "https://gateway.example.com/anthropic"
      api_key: os.environ/GATEWAY_SERVICE_TOKEN # used for discovery, and as the fallback when a request has no key

general_settings:
  forward_llm_provider_auth_headers: true

litellm_settings:
  check_provider_endpoint: true
```

列表反映的只是这一个密钥的可见范围。调用者在 `/v1/models` 请求中转发的提供商密钥（参见[转发 LLM 提供商认证头](./forward_client_headers.md#转发-llm-提供商认证请求头)）不会用于发现，因此即使各用户自己的密钥能看到的模型各不相同，他们拿到的列表也完全一致；而且列表里的模型在某个用户的密钥下仍可能调用失败。当部署密钥与环境变量都没有设置时，通配路由不会向 `/v1/models` 添加任何条目。

## Bedrock

`bedrock/*` 部署会列出其凭据在自己区域内可按需调用的 id：包括生效中的系统定义推理配置文件（inference profiles，`us.`、`global.` 及其他区域前缀），以及支持按需吞吐量的基础模型。只能通过配置文件运行的模型、应用推理配置文件与预置吞吐量不会列出，因此列表里的每个 id 都能真正响应请求。

```yaml
model_list:
  - model_name: bedrock/*
    litellm_params:
      model: bedrock/*
      aws_region_name: us-east-1
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY

litellm_settings:
  check_provider_endpoint: true
```

列表请求会用该部署的 AWS 凭据签名（密钥、`aws_role_name`、`aws_profile_name`、Web 身份或默认链），也可以用 Bedrock API 密钥（`api_key` 或 `AWS_BEARER_TOKEN_BEDROCK`）；它还需要两条调用路径用不到的 IAM 权限：`bedrock:ListInferenceProfiles` 与 `bedrock:ListFoundationModels`。列表功能访问的是 Bedrock 控制平面（`bedrock.<region>.amazonaws.com`），而非运行时端点，因此只放行 `bedrock-runtime` 的 VPC 还需要一条 `bedrock` 接口端点。当权限缺失或控制平面没有响应时，该部署不会向 `/v1/models` 添加任何条目，并且代理会在每次列表调用时记录 `Error getting valid models` 日志。

## 从 `/v1/models` 中隐藏模型

在 `model_list` 条目上设置 `model_info.discoverable: false`，就能让它不出现在各个列表端点中，同时任何密钥有权限的人仍可按名调用它。这个开关针对的是聊天客户端的模型选择器不该展示的模型，比如只由你自己的服务调用的嵌入、分类器或评估模型。Claude Code（`CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1`）和 Open WebUI 这类客户端会从 `GET /v1/models` 填充自己的选择器，而且大多数客户端不会按能力过滤。

```yaml
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: text-embedding-3-small
    litellm_params:
      model: openai/text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: embedding
      discoverable: false   # callable by name, absent from /v1/models
```

有了这份配置后，普通虚拟密钥（virtual key）调用 `GET /v1/models`（以及 `/models`，同时支持 OpenAI 与 Anthropic 两种响应格式）、`GET /v1/model/info`（以及 `/model/info`）和 `GET /model_group/info` 时，只会拿到 `{{anthropic}}`；而 `POST /v1/embeddings` 携带 `"model": "text-embedding-3-small"` 时，行为与之前完全一致。

```bash
curl -s http://localhost:4000/v1/models -H "Authorization: Bearer $LITELLM_KEY" | jq '.data[].id'
# "{{anthropic}}"

curl -s http://localhost:4000/v1/embeddings -H "Authorization: Bearer $LITELLM_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model": "text-embedding-3-small", "input": "still callable"}' | jq '.data[0].embedding | length'
# 1536
```

这个开关只改变列表端点对外展示的内容。任何端点上、凡是指名调用该模型的请求，仍像今天一样受密钥与团队 `models` 允许列表的约束；`GET /v1/models/{model}` 也仍会返回该模型，因此按名称校验所给模型的客户端不受影响。代理管理员（`proxy_admin` 和 `proxy_admin_viewer` 角色，包括主密钥）在所有列表端点上仍能看到该模型，因此 Admin UI 与 `GET /v1/models?scope=expand` 始终展示完整清单。

只要模型组中至少还有一个部署是可发现的，该模型组就会继续出现在列表中。在 `claude-*` 这类通配条目上设置该开关，会隐藏该条目展开出的所有模型。省略该字段即表示可发现，因此现有配置不受影响。

如果不只是想隐藏模型，还想直接禁止某个密钥调用它，请使用密钥或团队的 `models` 列表（[限制模型访问](./model_access)）。要隐藏的是 `model_group_alias` 而非 `model_list` 条目时，请使用别名的 `hidden` 开关（[隐藏别名模型](./load_balancing#隐藏别名模型)）。
