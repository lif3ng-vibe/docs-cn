import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Anthropic
LiteLLM 支持所有 Anthropic 模型。

- `claude-haiku-5-5`
- `claude-sonnet-5`
- `claude-opus-5`
- `claude-opus-4-6` (`claude-opus-4-6-20260205`)
- `claude-sonnet-4-6`
- `claude-sonnet-4-5-20250929`
- `claude-opus-4-5-20251101`
- `claude-opus-4-1-20250805`
- `claude-4` (`claude-opus-4-20250514`, `claude-sonnet-4-20250514`)
- `claude-3.7` (`claude-3-7-sonnet-20250219`)
- `claude-3.5` (`claude-3-5-sonnet-20240620`)
- `claude-3` (`claude-3-haiku-20240307`, `claude-3-opus-20240229`, `claude-3-sonnet-20240229`)
- `claude-2`
- `claude-2.1`
- `claude-instant-1.2`


| 属性 | 说明 |
|-------|-------|
| 简介 | Claude 是 Anthropic 打造的高性能、可信赖且智能的 AI 平台，擅长语言、推理、分析、编程等各类任务。也可通过 Azure Foundry 使用。 |
| LiteLLM 中的提供商路由 | `anthropic/`（在模型名前加上此前缀，即可将请求路由到 Anthropic，例如 `anthropic/claude-3-5-sonnet-20240620`）。对于 Azure Foundry 部署，请使用 `azure_ai/claude-*`（参见 [Azure Anthropic 文档](../providers/azure/azure_anthropic)） |
| 提供商文档 | [Anthropic ↗](https://docs.anthropic.com/en/docs/build-with-claude/overview), [Azure Foundry Claude ↗](https://learn.microsoft.com/en-us/azure/ai-services/foundry-models/claude) |
| 提供商 API 端点 | https://api.anthropic.com（或 Azure Foundry 端点：`https://<resource-name>.services.ai.azure.com/anthropic`） |
| 支持的端点 | `/chat/completions`、`/v1/messages`（透传，passthrough） |


## 支持的 OpenAI 参数

可在代码中查看，[见此处](../completion/input.md#已转换的-openai-参数)

```
"stream",
"stop",
"temperature",
"top_p",
"max_tokens",
"max_completion_tokens",
"tools",
"tool_choice",
"extra_headers",
"parallel_tool_calls",
"response_format",
"user",
"reasoning_effort",
```

:::info

**注意**：
- Anthropic API 在未传入 `max_tokens` 时会直接拒绝请求。因此 LiteLLM 在未传入 `max_tokens` 时会自动补上 `max_tokens=4096`。
- `response_format` 在 Claude Sonnet 4.5+、Opus 4.5+ 与 Haiku 4.5 上使用 Anthropic 原生结构化输出；Opus 4.1 等较旧的模型则回退为强制工具调用（参见[结构化输出](#结构化输出)一节）
- 对于 Claude 4.6 与 Opus 4.5 系列模型，`reasoning_effort` 会自动映射为 `output_config={"effort": ...}`（参见 [Effort 参数](./anthropic_effort.md)）

:::

## **结构化输出**

LiteLLM 支持 Anthropic 的[结构化输出（structured outputs）特性](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)，适用于 Claude Sonnet 4.5 及以上、Opus 4.5 及以上和 Haiku 4.5。对这些模型使用 `response_format` 时，LiteLLM 会自动：
- 添加所需的 `structured-outputs-2025-11-13` beta 请求头
- 将 OpenAI 的 `response_format` 转换为 Anthropic 的 `output_format` 格式

### 支持的模型
当模型在模型成本表（model cost map）中被标记了 `supports_native_structured_output` 时，会使用原生结构化输出：
- Sonnet 4.5 及以上（`claude-sonnet-4-5`、`claude-sonnet-4-6`、`claude-sonnet-5`）
- Opus 4.5 及以上（`claude-opus-4-5`、`claude-opus-4-6`、`claude-opus-4-7`、`claude-opus-4-8`、`claude-opus-5`、`claude-opus-5-5`）
- Haiku 4.5 与 5.5（`claude-haiku-4-5`、`claude-haiku-5-5`）

Claude Opus 4.1 及更旧的模型没有这个标记，因此 LiteLLM 不会为它们发送 `output_format`，而是根据你的 schema 构建一个 `json_tool_call` 工具，并强制模型调用它

### 使用示例

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python
from litellm import completion

response = completion(
    model="{{anthropic}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "capital_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "country": {"type": "string"},
                    "capital": {"type": "string"}
                },
                "required": ["country", "capital"],
                "additionalProperties": False
            }
        }
    }
)

print(response.choices[0].message.content)
# Output: {"country": "France", "capital": "Paris"}
```

</TabItem>
<TabItem value="proxy" label="LiteLLM 代理">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "response_format": {
        "type": "json_schema",
        "json_schema": {
            "name": "capital_response",
            "strict": true,
            "schema": {
                "type": "object",
                "properties": {
                    "country": {"type": "string"},
                    "capital": {"type": "string"}
                },
                "required": ["country", "capital"],
                "additionalProperties": false
            }
        }
    }
  }'
```

</TabItem>
</Tabs>

:::info
在受支持的模型上使用结构化输出时，LiteLLM 会自动：
- 将 OpenAI 的 `response_format` 转换为 Anthropic 的 `output_format`
- 添加 `anthropic-beta: structured-outputs-2025-11-13` 请求头

对没有原生支持的模型，LiteLLM 会改为创建一个携带该 schema 的 `json_tool_call` 工具，并强制模型使用它
:::

## API 密钥

```python
import os

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"
# os.environ["ANTHROPIC_API_BASE"] = "" # [OPTIONAL] or 'ANTHROPIC_BASE_URL'
# os.environ["LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX"] = "true" # [OPTIONAL] Disable automatic URL suffix appending
```

:::tip[Azure Foundry 支持]

Claude 模型也可通过 Microsoft Azure Foundry 使用。请用 `azure_ai/` 前缀代替 `anthropic/`，并配置 Azure 认证。详见 [Azure Anthropic 文档](../providers/azure/azure_anthropic)。

示例：
```python
response = completion(
    model="azure_ai/{{anthropic}}",
    api_base="https://<resource-name>.services.ai.azure.com/anthropic",
    api_key="your-azure-api-key",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

:::

### 自定义 API 基地址

为 Anthropic 使用自定义 API 基地址（例如某个代理或自定义端点）时，LiteLLM 会自动在你的基础 URL 后追加相应的后缀（`/v1/messages` 或 `/v1/complete`）。

如果你的自定义端点已包含完整路径，或不符合 Anthropic 的标准 URL 结构，可以禁用这种自动追加后缀的行为：

```python
import os

os.environ["ANTHROPIC_API_BASE"] = "https://my-custom-endpoint.com/custom/path"
os.environ["LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX"] = "true"  # Prevents automatic suffix
```

未设置 `LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX` 时：
- 基础 URL `https://my-proxy.com` → `https://my-proxy.com/v1/messages`
- 基础 URL `https://my-proxy.com/api` → `https://my-proxy.com/api/v1/messages`

设置 `LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX=true` 后：
- 基础 URL `https://my-proxy.com/custom/path` → `https://my-proxy.com/custom/path`（保持不变）

### Azure AI Foundry（替代方法）

:::tip[推荐方法]
要获得包括 Azure AD 认证在内的完整 Azure 支持，请使用专门的 [Azure Anthropic 提供商](./azure/azure_anthropic)，并加 `azure_ai/` 前缀。
:::

另一种做法是直接使用 `anthropic/` 提供商并指向你的 Azure 端点，因为 Azure 是以 Anthropic 原生 API 的形式提供 Claude 的。

```python
from litellm import completion

response = completion(
    model="anthropic/{{anthropic}}",
    api_base="https://<your-resource>.services.ai.azure.com/anthropic",
    api_key="<your-azure-api-key>",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response)
```

:::info
**查找你的 Azure 端点**：进入 Azure AI Foundry → 你的部署 → 概述。你的基础 URL 为 `https://<resource-name>.services.ai.azure.com/anthropic`
:::

## 工作负载身份联合

Anthropic 支持工作负载身份联合（workload identity federation），代理因此可以用已经持有的 OIDC 身份令牌换取短期的 `sk-ant-oat01` 访问令牌，而不必保存长期的 `sk-ant-` 密钥。这相当于 Anthropic 版的 Vertex AI 与 Azure 既有机制，适合奉行"无静态密钥"策略的部署。

LiteLLM 会替你签发并缓存访问令牌。只要配置好联合标识符和一种身份源，所有到达 Anthropic 的路由都会使用签发出的令牌：对话补全、`/v1/messages`、文件、批处理、技能、透传、token 计数与模型发现。

### 联合标识符

这些值来自你在 Anthropic Console 中创建的联合规则，无论选哪种身份源都相同：

| 字段 | 说明 |
| --- | --- |
| `anthropic_federation_rule_id` | 联合规则的 `fdrl_...` id |
| `anthropic_organization_id` | 你的 Anthropic 组织 UUID |
| `anthropic_service_account_id` | 该规则映射到的 `svac_...` 服务账号 |
| `anthropic_federation_workspace_id` | 当规则在多个 workspace 中启用时必填；将签发的令牌限定到该 workspace |

Anthropic 自己的参考文档把最后一项叫 `workspace_id`，但联合功能读取的是 `ANTHROPIC_FEDERATION_WORKSPACE_ID`，而不是 `ANTHROPIC_WORKSPACE_ID`。较短的名字已被 Bedrock Claude 平台提供商占用，用于选择 Bedrock 调用计费到哪个 workspace，所以联合功能采用较长的名字，不影响原有行为。设置 `ANTHROPIC_WORKSPACE_ID` 对联合功能没有任何效果

### 静态密钥优先

在 Anthropic 提供商的任何地方，静态凭据的优先级都高于联合。只要设置了 `ANTHROPIC_API_KEY`，所有 Anthropic 路由都会使用它，完全不涉及联合；其次是 `ANTHROPIC_AUTH_TOKEN`，联合排在最后一级。这与 Anthropic SDK 自身的优先顺序一致，并且同样适用于文件、批处理、模型发现与对话。

因此，打算走联合的部署不应携带静态密钥。如果仍然设置了，LiteLLM 会记录一条警告，点名哪个模型的联合被遮蔽。空值或纯空白字符的值视为未设置，会继续落到联合这一层

### 改用环境变量配置

下面每个字段都可以改由环境变量提供，而不是写在部署配置里；当同一组值对整个代理全局生效时，这正是你想要的方式。
部署上设置的值优先于环境变量。

| 字段 | 环境变量 |
| --- | --- |
| `anthropic_federation_rule_id` | `ANTHROPIC_FEDERATION_RULE_ID` |
| `anthropic_organization_id` | `ANTHROPIC_ORGANIZATION_ID` |
| `anthropic_service_account_id` | `ANTHROPIC_SERVICE_ACCOUNT_ID` |
| `anthropic_federation_workspace_id` | `ANTHROPIC_FEDERATION_WORKSPACE_ID` |
| `anthropic_identity_source` | `ANTHROPIC_IDENTITY_SOURCE` |
| `anthropic_identity_token_file` | `ANTHROPIC_IDENTITY_TOKEN_FILE` |
| `anthropic_identity_token` | `ANTHROPIC_IDENTITY_TOKEN` |

### 身份源

提供 OIDC 断言有四种方式。其中两种完全不需要 `anthropic_identity_source`，另外两种靠它来选择。

#### Token 文件（默认）

读取平台已经投影到磁盘上的断言，Kubernetes 服务账号令牌和大多数 CI 运行器就是这样工作的。设置 `anthropic_identity_token_file`，并保持 `anthropic_identity_source` 不设置。该路径必须位于 LiteLLM 的 OIDC 文件白名单之下，白名单可用 `LITELLM_OIDC_ALLOWED_CREDENTIAL_DIRS` 扩展。每次签发时都会重新读取该文件，因此轮换后的令牌无需重启即可生效。

```yaml
model_list:
  - model_name: claude-sonnet-4-5
    litellm_params:
      model: anthropic/claude-sonnet-4-5
      anthropic_identity_token_file: /var/run/secrets/anthropic.com/token
      anthropic_federation_rule_id: os.environ/ANTHROPIC_FEDERATION_RULE_ID
      anthropic_organization_id: os.environ/ANTHROPIC_ORGANIZATION_ID
      anthropic_service_account_id: os.environ/ANTHROPIC_SERVICE_ACCOUNT_ID
```

#### Secret 引用（默认）

`anthropic_identity_token` 接受的是 `oidc/` 引用，而不是裸令牌。可用的形式有 `oidc/env/VAR_NAME`、`oidc/file//absolute/path`、`oidc/github/<audience>` 和 `oidc/google/<audience>`。直接粘贴裸 JWT 会被拒绝，请改为导出到环境变量后再引用。

```yaml
      anthropic_identity_token: oidc/env/MY_WORKLOAD_TOKEN
```

#### 以 LiteLLM 作为签发方

对于没有外部 IdP 的部署，LiteLLM 会用 ES256（P-256）密钥自行签署断言。设置 `anthropic_identity_source: internal_issuer`，并让 `anthropic_issuer_signing_key_ref` 指向密钥，而不是把密钥内联粘贴进来，这样私钥仍由你的密钥管理器保管。`anthropic_issuer_ttl_seconds` 默认为 300，不能超过 3600。

```yaml
credential_list:
  - credential_name: anthropic_wif
    credential_values:
      anthropic_identity_source: internal_issuer
      anthropic_issuer_url: https://litellm.example.com
      anthropic_issuer_subject: litellm-proxy
      anthropic_issuer_audience: https://api.anthropic.com
      anthropic_issuer_signing_key_ref: os.environ/ANTHROPIC_WIF_SIGNING_KEY
      anthropic_issuer_ttl_seconds: 300
      anthropic_federation_rule_id: os.environ/ANTHROPIC_FEDERATION_RULE_ID
      anthropic_organization_id: os.environ/ANTHROPIC_ORGANIZATION_ID
      anthropic_service_account_id: os.environ/ANTHROPIC_SERVICE_ACCOUNT_ID
    credential_info:
      custom_llm_provider: anthropic

model_list:
  - model_name: claude-sonnet-4-5
    litellm_params:
      model: anthropic/claude-sonnet-4-5
      litellm_credential_name: anthropic_wif
```

Anthropic 需要对应的公钥来验证 LiteLLM 的签名。请从代理导出公钥，并将其注册为联合规则上的 **inline** 签发方 JWKS：

```shell
curl -s http://localhost:4000/credentials/anthropic_wif/jwks \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

该端点仅供代理管理员使用，绝不会暴露私钥，因此请把返回的 JSON 粘贴到 Anthropic Console，而不是让 Anthropic 去访问该 URL。新注册的 JWKS 大约需要一分钟，之后 Anthropic 才会接受由它签署的断言。

#### Keycloak

对于已经把 Keycloak 当作工作负载 IdP 的团队，LiteLLM 会通过 OAuth client credentials 授权流程获取断言。设置 `anthropic_identity_source: keycloak`，再加上：

```yaml
      anthropic_keycloak_token_url: https://keycloak.example.com/realms/prod/protocol/openid-connect/token
      anthropic_keycloak_client_id: litellm-proxy
      anthropic_keycloak_auth_method: client_secret_basic  # or client_secret_post
      anthropic_keycloak_client_secret_ref: os.environ/KEYCLOAK_CLIENT_SECRET
      anthropic_keycloak_scope: anthropic-federation
```

跨变体混用字段会被拒绝，而不是被静默忽略，因此配置里写了 `internal_issuer` 却又带上 Keycloak 字段时，会在启动时直接失败，而不是悄悄回退。

### 在管理界面中配置

管理界面暂时没有提供这些字段，请按上文的方式通过代理配置或环境变量来配置联合。后续更新会把它们加入 LLM Credentials 流程。

### 令牌生命周期与刷新

LiteLLM 会按部署缓存签发出的访问令牌，并在其过期前于后台刷新，因此请求几乎不需要等待令牌交换。刷新分两级：在令牌寿命过半时进行一次建议性刷新，在后台完成、旧令牌继续服务；在寿命八分之一处进行一次强制刷新，会阻塞请求。同一部署的并发请求会共享一次进行中的交换，而不是各自签发，因此交换次数不会随流量线性增长。

同一主机上的多个 worker 通过临时目录下一个小型磁盘缓存共享签发出的令牌，该缓存仅代理所属用户可读，因此运行多个 uvicorn worker 的代理对每份断言只交换一次，而不是每个 worker 交换一次。`LITELLM_TOKEN_EXCHANGE_CACHE_DIR` 可以移动该缓存；把它设为空字符串则关闭缓存，让每个进程自行签发。不同主机上的副本始终各自签发令牌。

Anthropic 对每份断言只接受一次：同一 JWT 的第二次交换会被拒绝并返回不透明的 401，并在规则的认证历史中记为 `jti_reused`。这对内部签发方和 Keycloak 这类身份源没有影响，因为它们每次交换都会签发新断言；但 token 文件或 `oidc/env/` 值的轮换速度必须快于规则的 `token_lifetime_seconds`，否则签发出的令牌过期后的第一次刷新会失败，直到新的断言出现。Kubernetes 会在投影服务账号令牌走过其 `expirationSeconds` 的 80% 后轮换它，因此请把规则的令牌寿命保持在不低于该轮换周期；默认值（一小时的投影令牌和一小时的规则寿命）正好对齐。

### 谁有权限配置

只有代理管理员才能创建或修改使用工作负载身份联合的部署。团队管理员即使平时管理着团队范围内的部署，也会收到 403，而且无论改动以哪种方式表达都一样：直接设置某个联合字段、按名字附加携带该字段的凭据，或是修改已联合部署的 `api_base`。最后一点很关键，因为 `api_base` 决定签署的断言发送到哪里、签发出的令牌出示到哪里，所以它虽不是联合字段，却属于联合配置的一部分。

同样的规则也覆盖密钥或团队上保存的回退列表。回退目标不能携带联合字段，因为故障转移发生时这些字段会合并覆盖部署自身的配置。

团队对联合部署保留正常的使用权限，只有编辑权收归代理管理员。

### 限制断言的发送目标

令牌交换只与 `api.anthropic.com` 通信。如果你在 Anthropic 前面架了网关，请把它的主机名列入 `LITELLM_ANTHROPIC_WIF_ALLOWED_HOSTS`（逗号分隔），签署的断言才被允许发往那里。

```shell
export LITELLM_ANTHROPIC_WIF_ALLOWED_HOSTS="anthropic.gateway.internal"
```

条目可以带端口，此时只信任该端口，同一主机上的其他进程不在信任范围内。不带端口的条目信任该主机上的所有端口。

```shell
export LITELLM_ANTHROPIC_WIF_ALLOWED_HOSTS="anthropic.gateway.internal:8443"
```

该列表只从环境变量读取，绝不会取自模型或凭据 API，因为 `api_base` 同时决定断言发送到哪里、签发出的令牌出示到哪里

### 监控

令牌健康状态通过标准的服务日志路径输出：`prometheus_system` 发送到 Prometheus，`otel` 发送到 OpenTelemetry，导出器设置见 [OpenTelemetry 文档](../observability/opentelemetry_integration)。这里的服务名是 `anthropic_wif`（令牌交换本身）和 `anthropic_wif_cache`（缓存命中与未命中），可以提供签发次数、签发延迟以及按原因细分的失败。启用方式：

```yaml
litellm_settings:
  service_callback: ["prometheus_system", "otel"]
```

## 用法

```python
import os
from litellm import completion

# set env - [OPTIONAL] replace with your anthropic key
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(model="{{anthropic_large}}", messages=messages)
print(response)
```


## 用法：流式
调用 completion 时设置 `stream=True` 即可。

```python
import os
from litellm import completion

# set env
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(model="{{anthropic_large}}", messages=messages, stream=True)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```

## 通过 LiteLLM 代理使用

下面介绍如何通过 LiteLLM 代理服务器调用 Anthropic。

### 1. 将密钥保存到环境变量

```bash
export ANTHROPIC_API_KEY="your-api-key"
```

### 2. 启动代理

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: claude-4 ### RECEIVED MODEL NAME ###
    litellm_params: # all params accepted by litellm.completion() - https://docs.litellm.ai/docs/completion/input
      model: {{anthropic_large}} ### MODEL NAME sent to `litellm.completion()` ###
      api_key: "os.environ/ANTHROPIC_API_KEY" # does os.getenv("ANTHROPIC_API_KEY")
```

```bash
litellm --config /path/to/config.yaml
```
</TabItem>
<TabItem value="config-all" label="config - 默认支持所有 Anthropic 模型">

如果你希望不把 `{{anthropic}}`、`{{anthropic_large}}` 逐个写进 config.yaml 就能发起请求，可以使用这套配置。

#### 必需的环境变量
```
ANTHROPIC_API_KEY=sk-ant****
```

```yaml
model_list:
  - model_name: "*" 
    litellm_params:
      model: "*"
```

```bash
litellm --config /path/to/config.yaml
```

此 config.yaml 的请求示例

**请务必使用 `anthropic/` 前缀，将请求路由到 Anthropic API**

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "anthropic/{{anthropic}}",
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
<TabItem value="cli" label="CLI">

```bash
$ litellm --model {{anthropic_large}}

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
      "model": "anthropic/{{anthropic}}",
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
response = client.chat.completions.create(model="anthropic/{{anthropic}}", messages = [
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
    model = "anthropic/{{anthropic}}",
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

## 支持的模型

`模型名` 👉 人类可读的名称。  
`调用方式` 👉 在 LiteLLM 中调用该模型的方式。

| 模型名       | 调用方式                              |
|------------------|--------------------------------------------|
| claude-opus-4-6  | `completion('claude-opus-4-6-20260205', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-sonnet-4-5  | `completion('claude-sonnet-4-5-20250929', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-opus-4-5  | `completion('claude-opus-4-5-20251101', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-opus-4-1  | `completion('claude-opus-4-1-20250805', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-opus-4  | `completion('claude-opus-4-20250514', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-sonnet-4  | `completion('claude-sonnet-4-20250514', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3.7  | `completion('claude-3-7-sonnet-20250219', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3-5-sonnet  | `completion('claude-3-5-sonnet-20240620', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3-haiku  | `completion('claude-3-haiku-20240307', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3-opus  | `completion('claude-3-opus-20240229', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3-5-sonnet-20240620  | `completion('claude-3-5-sonnet-20240620', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3-sonnet  | `completion('claude-3-sonnet-20240229', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-2.1  | `completion('claude-2.1', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-2  | `completion('claude-2', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-instant-1.2  | `completion('claude-instant-1.2', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-instant-1  | `completion('claude-instant-1', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |

## **提示词缓存**

使用 Anthropic 的提示词缓存（Prompt Caching）功能。


[相关 Anthropic API 文档](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

:::note

下面展示 LiteLLM 发往 Anthropic Context Caching 的一个原始请求示例：

```bash
POST Request Sent from LiteLLM:
curl -X POST \
https://api.anthropic.com/v1/messages \
-H 'accept: application/json' -H 'anthropic-version: 2023-06-01' -H 'content-type: application/json' -H 'x-api-key: sk-...' \
-d '{'model': '{{anthropic}}', [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What are the key terms and conditions in this agreement?",
          "cache_control": {
            "type": "ephemeral"
          }
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "Certainly! The key terms and conditions are the following: the contract is 1 year long for $10/mo"
        }
      ]
    }
  ],
  "temperature": 0.2,
  "max_tokens": 10
}'
```

**注意**：Anthropic 不再要求 `anthropic-beta: prompt-caching-2024-07-31` 请求头。只要在消息中使用 `cache_control`，提示词缓存现在就会自动生效。
::: 

### 缓存：大上下文缓存


本示例演示提示词缓存的基本用法：将法律协议全文作为前缀进行缓存，同时保持用户指令不被缓存。


<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python 
response = await litellm.acompletion(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement",
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

```
</TabItem>
<TabItem value="proxy" label="LiteLLM 代理">

:::info

LiteLLM 代理与 OpenAI 兼容。

下面是使用 OpenAI Python SDK 向 LiteLLM 代理发送请求的示例。

假设你已在 [litellm 代理 config.yaml](#通过-litellm-代理使用) 中配置了 model=`anthropic/{{anthropic}}`

:::

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)


response = await client.chat.completions.create(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement",
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

```

</TabItem>
</Tabs>

### 缓存：工具定义

本示例演示如何缓存工具定义。

cache_control 参数放在最后一个工具上。

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python 
import litellm

response = await litellm.acompletion(
    model="anthropic/{{anthropic}}",
    messages = [{"role": "user", "content": "What's the weather like in Boston today?"}],
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
                "cache_control": {"type": "ephemeral"}
            },
        }
    ]
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM 代理">

:::info

LiteLLM 代理与 OpenAI 兼容。

下面是使用 OpenAI Python SDK 向 LiteLLM 代理发送请求的示例。

假设你已在 [litellm 代理 config.yaml](#通过-litellm-代理使用) 中配置了 model=`anthropic/{{anthropic}}`

:::

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)

response = await client.chat.completions.create(
    model="anthropic/{{anthropic}}",
    messages = [{"role": "user", "content": "What's the weather like in Boston today?"}],
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
                "cache_control": {"type": "ephemeral"}
            },
        }
    ]
)
```

</TabItem>
</Tabs>

### 缓存 - 多轮对话延续

在这个示例中，我们演示如何在多轮对话中使用提示词缓存（Prompt Caching）。

`cache_control` 参数放在系统消息上，把它标记为静态前缀的一部分。

对话历史（此前的消息）都包含在 `messages` 数组中。最后一轮用 cache-control 做了标记，便于后续追问时继续对话；倒数第二条用户消息则用 `cache_control` 参数标记为缓存，这样这个检查点就能读取之前建立的缓存。

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python 
import litellm

response = await litellm.acompletion(
    model="anthropic/{{anthropic}}",
    messages=[
        # System Message
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement"
                    * 400,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        # marked for caching with the cache_control parameter, so that this checkpoint can read from the previous cache.
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        {
            "role": "assistant",
            "content": "Certainly! the key terms and conditions are the following: the contract is 1 year long for $10/mo",
        },
        # The final turn is marked with cache-control, for continuing in followups.
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
    ]
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

:::info

LiteLLM 代理与 OpenAI 兼容

下面示例使用 OpenAI Python SDK 向 LiteLLM 代理发送请求

假设 [litellm proxy 的 config.yaml](#通过-litellm-代理使用) 中已配置 model=`anthropic/{{anthropic}}`

:::

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)

response = await client.chat.completions.create(
    model="anthropic/{{anthropic}}",
    messages=[
        # System Message
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement"
                    * 400,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        # marked for caching with the cache_control parameter, so that this checkpoint can read from the previous cache.
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        {
            "role": "assistant",
            "content": "Certainly! the key terms and conditions are the following: the contract is 1 year long for $10/mo",
        },
        # The final turn is marked with cache-control, for continuing in followups.
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
    ]
)
```

</TabItem>
</Tabs>

## **函数/工具调用**

```python
from litellm import completion

# set env
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

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
messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]

response = completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)
# Add any assertions, here to check response args
print(response)
assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
assert isinstance(
    response.choices[0].message.tool_calls[0].function.arguments, str
)

```


### 强制 Anthropic 使用工具

如果你想让 Claude 使用某个特定工具来回答用户的问题

可以在 `tool_choice` 字段中指定该工具，如下所示：
```python
response = completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools,
    tool_choice={"type": "tool", "name": "get_weather"},
)
```

### 禁用工具调用

把 `tool_choice` 设为 `"none"` 即可禁用工具调用。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="anthropic/{{anthropic}}",
    messages=messages,
    tools=tools,
    tool_choice="none",
)

```
</TabItem>
<TabItem value="proxy" label="Proxy">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: anthropic-claude-model
    litellm_params:
        model: anthropic/{{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！

如果已经[配置](../proxy/virtual_keys)了虚拟密钥（virtual key），请把 `anything` 替换成你的 LiteLLM 代理虚拟密钥。

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer anything" \
  -d '{
    "model": "anthropic-claude-model",
    "messages": [{"role": "user", "content": "Who won the World Cup in 2022?"}],
    "tools": [{"type": "mcp", "server_label": "deepwiki", "server_url": "https://mcp.deepwiki.com/mcp", "require_approval": "never"}],
    "tool_choice": "none"
  }'
```
</TabItem>
</Tabs>



### MCP 工具调用

下面演示如何在 Anthropic 上使用 MCP（Model Context Protocol）工具调用：

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

LiteLLM 以 OpenAI Responses API 格式支持在 Anthropic 上进行 MCP 工具调用。

<Tabs>
<TabItem value="openai_format" label="OpenAI 格式">


```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."

tools=[
    {
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never",
    },
]

response = completion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "Who won the World Cup in 2022?"}],
    tools=tools
)
```

</TabItem>
<TabItem value="anthropic_format" label="Anthropic 格式">

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."

tools = [
    {
        "type": "url",
        "url": "https://mcp.deepwiki.com/mcp",
        "name": "deepwiki-mcp",
    }
]
response = completion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "Who won the World Cup in 2022?"}],
    tools=tools
)

print(response)
```
</TabItem>

</Tabs>

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: claude-4-sonnet
    litellm_params:
        model: anthropic/{{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！

<Tabs>
<TabItem value="openai" label="OpenAI 格式">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-4-sonnet",
    "messages": [{"role": "user", "content": "Who won the World Cup in 2022?"}],
    "tools": [{"type": "mcp", "server_label": "deepwiki", "server_url": "https://mcp.deepwiki.com/mcp", "require_approval": "never"}]
  }'
```

</TabItem>
<TabItem value="anthropic" label="Anthropic 格式">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-4-sonnet",
    "messages": [{"role": "user", "content": "Who won the World Cup in 2022?"}],
    "tools": [
        {
            "type": "url",
            "url": "https://mcp.deepwiki.com/mcp",
            "name": "deepwiki-mcp",
        }
    ]
  }'
```

</TabItem>
</Tabs>
</TabItem>
</Tabs>

### 并行函数调用

下面演示如何把函数调用的结果回传给 Anthropic 模型：

```python
from litellm import completion
import os 

os.environ["ANTHROPIC_API_KEY"] = "sk-ant.."


litellm.set_verbose = True

### 1ST FUNCTION CALL ###
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
messages = [
    {
        "role": "user",
        "content": "What's the weather like in Boston today in Fahrenheit?",
    }
]
try:
    # test without max tokens
    response = completion(
        model="anthropic/{{anthropic}}",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    # Add any assertions, here to check response args
    print(response)
    assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
    assert isinstance(
        response.choices[0].message.tool_calls[0].function.arguments, str
    )

    messages.append(
        response.choices[0].message.model_dump()
    )  # Add assistant tool invokes
    tool_result = (
        '{"location": "Boston", "temperature": "72", "unit": "fahrenheit"}'
    )
    # Add user submitted tool results in the OpenAI format
    messages.append(
        {
            "tool_call_id": response.choices[0].message.tool_calls[0].id,
            "role": "tool",
            "name": response.choices[0].message.tool_calls[0].function.name,
            "content": tool_result,
        }
    )
    ### 2ND FUNCTION CALL ###
    # In the second response, Claude should deduce answer from tool results
    second_response = completion(
        model="anthropic/{{anthropic}}",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    print(second_response)
except Exception as e:
    print(f"An error occurred - {str(e)}")
```

感谢 @[Shekhar Patnaik](https://www.linkedin.com/in/patnaikshekhar) 提出的这个需求！

### 上下文管理（Beta）

Anthropic 的[上下文编辑（context editing）](https://docs.claude.com/en/docs/build-with-claude/context-editing) API 可以自动清理较早的工具结果或思考块（thinking blocks）。现在调用 Anthropic 模型时，LiteLLM 会透传原生的 `context_management` 负载，并自动附上所需的 `context-management-2025-06-27` beta 请求头。

```python
from litellm import completion

response = completion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "Summarize the latest tool results"}],
    context_management={
        "edits": [
            {
                "type": "clear_tool_uses_20250919",
                "trigger": {"type": "input_tokens", "value": 30000},
                "keep": {"type": "tool_uses", "value": 3},
                "clear_at_least": {"type": "input_tokens", "value": 5000},
                "exclude_tools": ["web_search"],
            }
        ]
    },
)
```

### Anthropic 托管工具（Computer、Text Editor、Web Search、Memory）


<Tabs>
<TabItem value="computer" label="Computer">

```python keep-model-ids
from litellm import completion

tools = [
    {
        "type": "computer_20241022",
        "function": {
            "name": "computer",
            "parameters": {
                "display_height_px": 100,
                "display_width_px": 100,
                "display_number": 1,
            },
        },
    }
]
model = "claude-3-5-sonnet-20241022"
messages = [{"role": "user", "content": "Save a picture of a cat to my desktop."}]

resp = completion(
    model=model,
    messages=messages,
    tools=tools,
    # headers={"anthropic-beta": "computer-use-2024-10-22"},
)

print(resp)
```

</TabItem>
<TabItem value="text_editor" label="Text Editor">

<Tabs>
<TabItem value="sdk" label="SDK">

```python keep-model-ids
from litellm import completion

tools = [{
    "type": "text_editor_20250124",
    "name": "str_replace_editor"
}]
model = "claude-3-5-sonnet-20241022"
messages = [{"role": "user", "content": "There's a syntax error in my primes.py file. Can you help me fix it?"}]

resp = completion(
    model=model,
    messages=messages,
    tools=tools,
)

print(resp)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml keep-model-ids
- model_name: claude-3-5-sonnet-latest
  litellm_params:
    model: anthropic/claude-3-5-sonnet-latest
    api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！

```bash keep-model-ids
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-3-5-sonnet-latest",
    "messages": [{"role": "user", "content": "There's a syntax error in my primes.py file. Can you help me fix it?"}],
    "tools": [{"type": "text_editor_20250124", "name": "str_replace_editor"}]
  }'
```
</TabItem>
</Tabs>

</TabItem>
<TabItem value="web_search" label="Web Search">

:::info
自 v1.70.1+ 起支持
:::

LiteLLM 会把 OpenAI 的 `search_context_size` 参数映射为 Anthropic 的 `max_uses` 参数。

| OpenAI | Anthropic |
| --- | --- |
| Low | 1 | 
| Medium | 5 | 
| High | 10 | 


<Tabs>
<TabItem value="sdk" label="SDK">


<Tabs>
<TabItem value="openai" label="OpenAI 格式">

```python
from litellm import completion

model = "{{anthropic}}"
messages = [{"role": "user", "content": "What's the weather like today?"}]

resp = completion(
    model=model,
    messages=messages,
    web_search_options={
        "search_context_size": "medium",
        "user_location": {
            "type": "approximate",
            "approximate": {
                "city": "San Francisco",
            },
        }
    }
)

print(resp)
```
</TabItem>
<TabItem value="anthropic" label="Anthropic 格式">

```python
from litellm import completion

tools = [{
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": 5
}]
model = "{{anthropic}}"
messages = [{"role": "user", "content": "There's a syntax error in my primes.py file. Can you help me fix it?"}]

resp = completion(
    model=model,
    messages=messages,
    tools=tools,
)

print(resp)
```
</TabItem>

</Tabs>
</TabItem>

<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
- model_name: {{anthropic}}
  litellm_params:
    model: anthropic/{{anthropic}}
    api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！

<Tabs>
<TabItem value="openai" label="OpenAI 格式">


```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [{"role": "user", "content": "What's the weather like today?"}],
    "web_search_options": {
        "search_context_size": "medium",
        "user_location": {
            "type": "approximate",
            "approximate": {
                "city": "San Francisco",
            },
        }
    }
  }'
```
</TabItem>
<TabItem value="anthropic" label="Anthropic 格式">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [{"role": "user", "content": "What's the weather like today?"}],
    "tools": [{
        "type": "web_search_20250305",
        "name": "web_search",
        "max_uses": 5
    }]
  }'
```

</TabItem>
</Tabs>
</TabItem>
</Tabs>

</TabItem>

<TabItem value="memory" label="Memory">

:::info
Anthropic 的 Memory 工具目前处于 beta 阶段。
:::

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

tools = [{
    "type": "memory_20250818",
    "name": "memory"
}]

model = "{{anthropic}}" 
messages = [{"role": "user", "content": "Please remember that my favorite color is blue."}]

response = completion(
    model=model,
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: claude-memory-model
      litellm_params:
        model: anthropic/{{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $LITELLM_KEY" \
    -d '{
    "model": "claude-memory-model",
    "messages": [{"role": "user", "content": "Please remember that my favorite color is blue."}],
    "tools": [{"type": "memory_20250818", "name": "memory"}]
    }'
```
</TabItem>
</Tabs>

</TabItem>

</Tabs>

## 用法 - 视觉 

```python
from litellm import completion

# set env
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

def encode_image(image_path):
    import base64

    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


image_path = "../proxy/cached_logo.jpg"
# Getting the base64 string
base64_image = encode_image(image_path)
resp = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Whats in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + base64_image
                    },
                },
            ],
        }
    ],
)
print(f"\nResponse: {resp}")
```

## 用法 - 思考 / `reasoning_content`

LiteLLM 会把 OpenAI 的 `reasoning_effort` 转换成 Anthropic 的 `thinking` 参数。[代码](https://github.com/BerriAI/litellm/blob/23051d89dd3611a81617d84277059cd88b2df511/litellm/llms/anthropic/chat/transformation.py#L298)

| reasoning_effort | thinking |
| ---------------- | -------- |
| "low"            | "budget_tokens": 1024 |
| "medium"         | "budget_tokens": 2048 |
| "high"           | "budget_tokens": 4096 |

:::note
`reasoning_effort` 在 Claude 4.6 和 4.7 模型（包括 `claude-opus-4-6`、`claude-opus-4-7`、`claude-sonnet-4-6` 等）上，映射到 Anthropic 的[自适应思考](https: //docs.claude.com/en/docs/build-with-claude/extended-thinking/adaptive-thinking)外加 `output_config.effort` 参数，**并非** `budget_tokens`。具体来说，在 OpenAI 兼容的 `/chat/completions` 路由上，LiteLLM 会向底层 Anthropic 请求注入以下内容：

```json
{
  "thinking": {"type": "adaptive"},
  "output_config": {"effort": "<low|medium|high|xhigh|max>"}
}
```

这意味着，即便 OpenAI 兼容请求体里没有单独的 `thinking` 字段，**只要 `reasoning_effort` 取 `"none"` 以外的任何值，这些模型就会自动开启思考**。这是为了对齐 Anthropic 官方推荐的用法：budget_tokens 在 4.6 模型上已弃用，在 Opus 4.7 上则会被直接拒绝，唯一支持的思考模式是 adaptive。

要关闭思考，可以完全不传 `reasoning_effort`，也可以把它设为 `"none"`，此时 LiteLLM 不会发送 `thinking` 字段。如果想在更早的模型上用固定预算显式控制思考，仍可直接传入原生的 `thinking` 参数：

```python keep-model-ids
from litellm import completion

# Disable thinking on Claude 4.6/4.7
resp = completion(
    model="anthropic/claude-opus-4-7",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="none",  # no thinking field sent
)

# Explicit budget (pre-4.6 models; deprecated on 4.6, rejected on Opus 4.7)
resp = completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    thinking={"type": "enabled", "budget_tokens": 1024},
)
```

Anthropic 的 `/v1/messages` 透传路由不受这套 reasoning effort 映射影响，`thinking` 会原样透传。
:::

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

resp = completion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)

```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
- model_name: {{anthropic}}
  litellm_params:
    model: anthropic/{{anthropic}}
    api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！ 

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>


**预期响应**

```python
ModelResponse(
    id='chatcmpl-c542d76d-f675-4e87-8e5f-05855f5d0f5e',
    created=1740470510,
    model='{{anthropic}}',
    object='chat.completion',
    system_fingerprint=None,
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content="The capital of France is Paris.",
                role='assistant',
                tool_calls=None,
                function_call=None,
                provider_specific_fields={
                    'citations': None,
                    'thinking_blocks': [
                        {
                            'type': 'thinking',
                            'thinking': 'The capital of France is Paris. This is a very straightforward factual question.',
                            'signature': 'EuYBCkQYAiJAy6...'
                        }
                    ]
                }
            ),
            thinking_blocks=[
                {
                    'type': 'thinking',
                    'thinking': 'The capital of France is Paris. This is a very straightforward factual question.',
                    'signature': 'EuYBCkQYAiJAy6AGB...'
                }
            ],
            reasoning_content='The capital of France is Paris. This is a very straightforward factual question.'
        )
    ],
    usage=Usage(
        completion_tokens=68,
        prompt_tokens=42,
        total_tokens=110,
        completion_tokens_details=None,
        prompt_tokens_details=PromptTokensDetailsWrapper(
            audio_tokens=None,
            cached_tokens=0,
            text_tokens=None,
            image_tokens=None
        ),
        cache_creation_input_tokens=0,
        cache_read_input_tokens=0
    )
)
```

### 向 Anthropic 模型传入 `thinking`

也可以把 `thinking` 参数直接传给 Anthropic 模型。


也可以把 `thinking` 参数直接传给 Anthropic 模型。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="anthropic/{{anthropic}}",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 1024},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "anthropic/{{anthropic}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>

#### 自适应思考（Claude Opus 4.6）

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="anthropic/{{anthropic_large}}",
  messages=[{"role": "user", "content": "What is the optimal strategy for solving this problem?"}],
  thinking={"type": "adaptive"},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "anthropic/{{anthropic_large}}",
    "messages": [{"role": "user", "content": "What is the optimal strategy for solving this problem?"}],
    "thinking": {"type": "adaptive"}
  }'
```

</TabItem>
</Tabs>

#### 启用带预算的思考

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="anthropic/{{anthropic_large}}",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 5000},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "anthropic/{{anthropic_large}}",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 5000}
  }'
```

</TabItem>
</Tabs>

## **向 Anthropic API 传递额外请求头**

把 `extra_headers: dict` 传给 `litellm.completion`

```python keep-model-ids
from litellm import completion
messages = [{"role": "user", "content": "What is Anthropic?"}]
response = completion(
    model="claude-3-5-sonnet-20240620", 
    messages=messages, 
    extra_headers={"anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"}
)
```

## 用法 - "助手预填充"

在 `messages` 数组的最后一项放一条 `assistant` 角色消息，就能"把话预先塞进 Claude 嘴里"。

:::info

返回的补全结果 _不会_ 包含你的"预填充"文本，因为它本来就是提示词的一部分。请记得把预填充内容拼在 Claude 补全结果的前面。

:::

```python keep-model-ids
import os
from litellm import completion

# set env - [OPTIONAL] replace with your anthropic key
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [
    {"role": "user", "content": "How do you say 'Hello' in German? Return your answer as a JSON object, like this:\n\n{ \"Hello\": \"Hallo\" }"},
    {"role": "assistant", "content": "{"},
]
response = completion(model="claude-2.1", messages=messages)
print(response)
```

#### 发送给 Claude 的提示词示例

```

Human: How do you say 'Hello' in German? Return your answer as a JSON object, like this:

{ "Hello": "Hallo" }

Assistant: {
```

## 用法 - "系统"消息
如果你用的是 Anthropic 的 Claude 2.1，`system` 角色消息会自动按正确的格式处理。

```python keep-model-ids
import os
from litellm import completion

# set env - [OPTIONAL] replace with your anthropic key
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [
    {"role": "system", "content": "You are a snarky assistant."},
    {"role": "user", "content": "How do I boil water?"},
]
response = completion(model="claude-2.1", messages=messages)
```

#### 发送给 Claude 的提示词示例

```
You are a snarky assistant.

Human: How do I boil water?

Assistant:
```

对话中途出现的 `system` 消息，以及 LiteLLM 如何在各提供商上摆放这些消息、让被保留的思考块维持原有绑定，见[保留思考前缀的稳定性](./anthropic_preserved_thinking)

## 用法 - PDF

通过 `file` 内容类型搭配 `file_data` 字段，把 base64 编码的 PDF 文件传给 Anthropic 模型。

<Tabs>
<TabItem value="sdk" label="SDK">

### **使用 base64**
```python
from litellm import completion, supports_pdf_input
import base64
import requests

# URL of the file
url = "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"

# Download the file
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")

## check if model supports pdf input
supports_pdf_input("anthropic/{{anthropic}}") # True

response = completion(
    model="anthropic/{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "You are a very professional document summarization specialist. Please summarize the given document."},
                {
                    "type": "file",
                    "file": {
                       "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
                    }
                },
            ],
        }
    ],
    max_tokens=300,
)

print(response.choices[0])
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 把模型加入配置 

```yaml
- model_name: {{anthropic}}
  litellm_params:
    model: anthropic/{{anthropic}}
    api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！ 

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "You are a very professional document summarization specialist. Please summarize the given document"
          },
          {
                "type": "file",
                "file": {
                    "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
                }
            }
          }
        ]
      }
    ],
    "max_tokens": 300
  }'

```
</TabItem>
</Tabs>

## [BETA] 引用 API 

向 Anthropic 传入 `citations: {"enabled": true}`，即可在文档响应中获得引用。 

注意：该接口目前处于 BETA 阶段。如果你对引用的返回方式有反馈，欢迎[在这里告诉我们](https://github.com/BerriAI/litellm/issues/7970#issuecomment-2644437943)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

resp = completion(
    model="{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "text",
                        "media_type": "text/plain",
                        "data": "The grass is green. The sky is blue.",
                    },
                    "title": "My Document",
                    "context": "This is a trustworthy document.",
                    "citations": {"enabled": True},
                },
                {
                    "type": "text",
                    "text": "What color is the grass and sky?",
                },
            ],
        }
    ],
)

citations = resp.choices[0].message.provider_specific_fields["citations"]

assert citations is not None
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: anthropic-claude
      litellm_params:
        model: anthropic/{{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理 

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！ 

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "anthropic-claude",
  "messages": [
    {
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "text",
                    "media_type": "text/plain",
                    "data": "The grass is green. The sky is blue.",
                },
                "title": "My Document",
                "context": "This is a trustworthy document.",
                "citations": {"enabled": True},
            },
            {
                "type": "text",
                "text": "What color is the grass and sky?",
            },
        ],
    }
  ]
}'
```

</TabItem>
</Tabs>

## Files API

文件只需上传一次，之后就能在多个请求中通过 `file_id` 引用，无需每次都重新上传内容。

:::info
从 Anthropic 拿到的 `file_id` 只能搭配 Anthropic Claude 模型使用，不能用于其他提供商（OpenAI、Bedrock 等）。
:::

- **单文件大小上限**：500 MB | **总存储空间**：每个组织 100 GB
- **定价**：Files API 操作免费。在 Messages 请求中使用的文件内容按输入 Token 计费。

**各文件类型支持的模型**：
- **图片**：所有 Claude 3+ 模型
- **PDF**：所有 Claude 3.5+ 模型
- **其他文件类型**（用于代码执行）：Claude 3.5 Haiku 及所有 Claude 3.7+ 模型

### 快速上手

```python
import litellm
import os

os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."

# 1. Upload a file once
file = litellm.create_file(
    file=open("document.pdf", "rb"),
    purpose="messages",
    custom_llm_provider="anthropic",
)

# 2. Use file_id in messages (no re-upload needed)
response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Summarize this document"},
            {"type": "file", "file": {"file_id": file.id, "format": "application/pdf"}}
        ]
    }]
)
```

### 文件操作

| 操作 | 函数 |
|-----------|----------|
| 上传 | `litellm.create_file(file, purpose="messages", custom_llm_provider="anthropic")` |
| 列出 | `litellm.file_list(custom_llm_provider="anthropic")` |
| 获取 | `litellm.file_retrieve(file_id, custom_llm_provider="anthropic")` |
| 删除 | `litellm.file_delete(file_id, custom_llm_provider="anthropic")` |
| 下载 | `litellm.file_content(file_id, custom_llm_provider="anthropic")` |

:::note
下载仅对[代码执行工具](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/code-execution-tool)创建的文件有效，不适用于上传的文件。
:::

### 支持的格式

| 文件类型 | 格式取值 |
|-----------|-------------|
| PDF | `application/pdf` |
| 纯文本 | `text/plain` |
| JPEG | `image/jpeg` |
| PNG | `image/png` |
| GIF | `image/gif` |
| WebP | `image/webp` |

### 使用图片

```python
# Upload image
image = litellm.create_file(
    file=open("photo.jpg", "rb"),
    purpose="messages",
    custom_llm_provider="anthropic",
)

# Use in message
response = litellm.completion(
    model="anthropic/{{anthropic}}",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "file", "file": {"file_id": image.id, "format": "image/jpeg"}}
        ]
    }]
)
```

## 用法 - 向 Anthropic 传入 'user_id'

LiteLLM 会把 OpenAI 的 `user` 参数转换成 Anthropic 的 `metadata[user_id]` 参数。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = completion(
    model="{{anthropic}}",
    messages=messages,
    user="user_123",
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: {{anthropic}}
      litellm_params:
        model: anthropic/{{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！ 

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [{"role": "user", "content": "What is Anthropic?"}],
    "user": "user_123"
  }'
```

</TabItem>
</Tabs>


## 用法 - Agent Skills

LiteLLM 支持通过 API 使用 Agent Skills

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = completion(
    model="{{anthropic}}",
    messages=messages,
    tools= [
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        }
    ],
    container= {
        "skills": [
            {
                "type": "anthropic",
                "skill_id": "pptx",
                "version": "latest"
            }
        ]
    }
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: {{anthropic}}
      litellm_params:
        model: anthropic/{{anthropic}}
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！ 

```bash
curl --location 'http://localhost:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR-LITELLM-KEY>' \
--data '{
    "model": "{{anthropic}}",
    "messages": [
        {
            "role": "user",
            "content": "Hi"
        }
    ],
    "tools": [
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        }
    ],
    "container": {
        "skills": [
            {
                "type": "anthropic",
                "skill_id": "pptx",
                "version": "latest"
            }
        ]
    }
}'
```

</TabItem>
</Tabs>

容器及其 "id" 会出现在流式/非流式响应的 "provider_specific_fields" 中
