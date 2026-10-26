import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Microsoft Purview 防护栏

LiteLLM 通过 [Microsoft Graph `processContent` API](https://learn.microsoft.com/en-us/graph/api/dataSecurityAndGovernance-processContent) 支持 [Microsoft Purview](https://learn.microsoft.com/en-us/purview/purview) 的 DLP 策略。

## 支持的模式

| 模式 | 作用 |
|------|------|
| `pre_call` | 在调用 LLM 之前，依据 DLP 策略评估用户提示词。若触发 `restrictAccess/block` 策略操作，则拦截请求。 |
| `post_call` | 依据 DLP 策略评估 LLM 的响应。若触发 `restrictAccess/block` 策略操作，则拦截请求。 |
| `logging_only` | 将提示词和响应都发送给 Purview 做审计，绝不拦截请求。 |

## 前提条件

1. **一个 Entra 应用注册**，并具备以下 Microsoft Graph 应用程序权限：
   - `InformationProtectionPolicy.Read.All`
   - `ProtectionScopes.Compute.User`
   - `Content.Process.User`

2. **Microsoft Purview 中的一条 DLP 策略**，且以应用注册的 `client_id` 作为受保护应用（Protected App）。没有生效的策略时，API 响应中的 `policyActions` 将始终为空。

3. **Entra 用户对象 ID**：请求所用的 LiteLLM API 密钥（或 JWT）必须绑定 `user_id`，且该值是最终用户的 Entra 对象 ID（不能是用户名或邮箱）。密钥未绑定用户 ID 时，拦截型钩子（`pre_call` / `post_call`）会返回 HTTP 400 拒绝请求；仅审计钩子则会跳过审计。

## 快速上手

### 1. 在 Entra 中注册应用

```bash
# 创建应用注册，记下 appId（即 client_id）和 tenantId
az ad app create --display-name "LiteLLM-Purview"
az ad sp create --id <appId>

# 创建客户端密钥
az ad app credential reset --id <appId> --append
```

在 Azure 门户的 **应用注册**（App registrations）→ **API 权限**（API permissions）中授予上述权限，然后 **授予管理员同意**。

### 2. 在 `config.yaml` 中定义防护栏

<Tabs>
<TabItem value="pre_call" label="pre_call">

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: purview-prompt-dlp
    litellm_params:
      guardrail: microsoft_purview
      mode: pre_call
      api_key: os.environ/AZURE_CLIENT_SECRET   # client_secret
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      default_on: true
```

</TabItem>
<TabItem value="post_call" label="post_call">

```yaml
guardrails:
  - guardrail_name: purview-response-dlp
    litellm_params:
      guardrail: microsoft_purview
      mode: post_call
      api_key: os.environ/AZURE_CLIENT_SECRET
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      default_on: true
```

</TabItem>
<TabItem value="logging_only" label="logging_only（审计）">

```yaml
guardrails:
  - guardrail_name: purview-audit
    litellm_params:
      guardrail: microsoft_purview
      mode: logging_only
      api_key: os.environ/AZURE_CLIENT_SECRET
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      default_on: true
```

</TabItem>
</Tabs>

### 3. 启动 LiteLLM 网关

```shell
litellm --config config.yaml --detailed_debug
```

### 4. 测试请求

发送请求时，所用 LiteLLM 密钥绑定的 `user_id` 必须是最终用户的 Entra 对象 ID（参见 User ID 解析）。示例中的 `metadata.user_id` 仅供参考，选择 Purview 身份时并不会用到它：

```shell
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello, what is the capital of France?"}],
    "metadata": {"user_id": "<entra-user-object-id>"}
  }'
```

**当 DLP 策略拦截请求时**，LiteLLM 返回：

```json
{
  "error": {
    "status_code": 400,
    "message": {
      "error": "Microsoft Purview DLP: Content blocked by policy",
      "activity": "uploadText"
    }
  }
}
```

## 支持的参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `guardrail` | `str` | 是 | 必须为 `"microsoft_purview"` |
| `mode` | `str` | 是 | `pre_call`、`post_call` 或 `logging_only` |
| `api_key` | `str` | 是 | Entra 应用客户端密钥（可使用 `os.environ/VAR`） |
| `tenant_id` | `str` | 是 | Entra 租户 ID |
| `client_id` | `str` | 是 | Entra 应用注册的客户端 ID（同时在 Purview 中用作受保护应用标识） |
| `default_on` | `bool` | 否 | 对每个请求都运行此防护栏。默认：`false` |
| `purview_app_name` | `str` | 否 | 在 `processContent` 中上报给 Purview 的应用名称。默认：`"LiteLLM"` |
| `user_id_field` | `str` | 否 | 调用方提供的元数据字段。不会用作发送给 Purview 的身份，仅用于检测以返回更具体的错误信息（参见 User ID 解析）。默认：`"user_id"` |

## User ID 解析

用于 Purview `protectionScopes` / `processContent` 的 Entra 对象 ID **仅**取自 `user_api_key_dict.user_id`，即绑定在 LiteLLM API 密钥或 JWT 上的用户。调用方能够影响的其他来源（`user_api_key_dict.end_user_id`、`metadata["user_api_key_user_id"]` 和 `metadata[user_id_field]`）会被有意忽略，以免客户端冒用其他 Entra 用户的策略来执行 DLP 检查。

如果密钥没有绑定 `user_id`，拦截型钩子（`pre_call` / `post_call`）会 **fail closed**（失败即拒绝），返回 HTTP 400。当请求只携带调用方提供的身份字段时，错误信息会注明调用方提供的元数据不能用于拦截型 DLP。

**logging_only**（仅审计）钩子读取的是由代理注入到 `litellm_params.metadata` 的 `user_api_key_user_id`（同样来自密钥绑定的 `user_id`）。若该字段不存在，则跳过审计，而不是把审计错误地归到其他用户名下。

## 按请求启用

当 `default_on: false` 时，可以按单个请求选择启用或停用：

```shell
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "guardrails": ["purview-prompt-dlp"],
    "metadata": {"user_id": "<entra-user-object-id>"}
  }'
```

## 工作原理

1. **令牌获取**：防护栏通过 OAuth2 客户端凭据授权获取 Microsoft Graph 的 bearer 令牌。令牌会缓存到过期前 60 秒。

2. **保护范围计算**：每次 DLP 检查前，防护栏都会为该用户调用 `protectionScopes/compute`，取得代表当前策略状态的 ETag。结果按用户缓存 1 小时（遵循 Microsoft 的建议）。如果 `processContent` 响应表明策略已变更（`protectionScopeState: modified`），缓存即失效。

3. **内容评估**：防护栏调用 `processContent`，携带文本内容，并将 `activityMetadata.activity` 设为 `uploadText`（提示词）或 `downloadText`（响应）**。对话补全**（`/v1/chat/completions`）：pre_call 阶段会拼接**每一条**消息（不限角色）的字符串内容；post_call 阶段在 `n > 1` 时会取**每一个** chat choice 中助手的 `message.content`**。旧版文本补全**（`/v1/completions`）：pre_call 阶段使用 `prompt` 字段（字符串或字符串列表；纯 token ID 形式的提示词会被跳过）；post_call 阶段使用**每一条** `TextChoices` 条目中的 `text`。

4. **拦截判定**：只要 `policyActions` 中任一条目的 `@odata.type` 包含 `restrictAccessAction` 且 `restrictionAction` 为 `"block"`，防护栏就会抛出 HTTP 400。

5. **审计日志**：无论哪种模式，防护栏结果都会记录在 `metadata.standard_logging_guardrail_information` 中，并流向已配置的可观测性（observability）后端（Langfuse、Datadog、OTEL 等）。

## 延伸阅读

- [Microsoft Graph processContent API](https://learn.microsoft.com/en-us/graph/api/dataSecurityAndGovernance-processContent)
- [Microsoft Purview DLP 概览](https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp)
- [按 API 密钥控制防护栏](./quick_start#-按-api-密钥控制防护栏)
