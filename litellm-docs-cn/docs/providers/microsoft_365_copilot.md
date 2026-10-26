import Image from '@theme/IdealImage';
import ThemedVideo from '@site/src/components/ThemedVideo';

# Microsoft 365 Copilot

将启用了 Microsoft Entra 单点登录（SSO）的应用连接到远程部署的 LiteLLM 网关。用户使用自己的 Microsoft 账户登录，然后就能就其有权访问的 Microsoft 365 数据向 Copilot 提问。

管理员只需配置一次 Entra ID、网关和应用。应用把每个已登录用户的访问令牌（access token）发送给 LiteLLM，由 LiteLLM 将其交换为 Microsoft Graph 访问令牌。Microsoft 将这一流程称为[代表流（on-behalf-of，OBO）](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-on-behalf-of-flow)。

## 开始之前

你需要：

- 每个用户一份 Microsoft 365 Copilot 许可证。
- 有权在 Microsoft Entra ID 中注册应用并授予管理员同意。
- 一个远程部署的 LiteLLM 网关，具备 HTTPS URL 和仪表板访问权限，并启用了 [JWT 身份验证](../proxy/token_auth.md)（企业版功能）。
- 一个支持 Entra SSO、能把已登录用户的访问令牌发送到 OpenAI 兼容 API 的应用。

## 1. 在 Microsoft Entra ID 中注册应用

### 创建应用与客户端机密

在 [Microsoft Entra 管理中心](https://entra.microsoft.com)打开 **App registrations** > **New registration**。选择 **Accounts in this organizational directory only**，然后注册应用。在应用概述页复制 **Application (client) ID** 与 **Directory (tenant) ID**。详见 Microsoft 的[应用注册指南](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)。

应用的 SSO 设置与 LiteLLM 凭据（credential）共用这一次注册。

打开 **Certificates & secrets** > **New client secret**。创建一个客户端机密并立即复制其 **Value**，Entra 只显示这一次。妥善保存，稍后配置 LiteLLM 凭据时要用。详见 Microsoft 的[客户端凭据指南](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials)。

### 添加 Microsoft Graph 权限

打开 **API permissions** > **Add a permission** > **Microsoft Graph** > **Delegated permissions**，添加 [Copilot Chat API](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/copilotconversation-chat) 要求的全部七个权限：

```text
Sites.Read.All
Mail.Read
People.Read.All
OnlineMeetingTranscript.Read.All
Chat.Read
ChannelMessage.Read.All
ExternalItem.Read.All
```

再添加 `openid`、`profile` 和 `offline_access`，然后为你的租户选择 **Grant admin consent**。详见 Microsoft 的 [API 权限配置指南](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-access-web-apis)。

<div className="docs-screenshot">
  <Image img={require('../../img/m365_copilot_entra_api_permissions.png')} alt="Microsoft Entra 中的 Microsoft Graph 委托权限" width={2080} height={1145} />
</div>

### 创建供用户登录的作用域

打开 **Expose an API**。将 **Application ID URI** 设为 `api://<app-client-id>`。选择 **Add a scope**，命名为 `access_as_user`，并允许管理员和用户同意授权。详见 Microsoft 的 [Expose an API 配置指南](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-expose-web-apis)。

<div className="docs-screenshot">
  <Image img={require('../../img/m365_copilot_entra_expose_api.png')} alt="Microsoft Entra 的 Expose an API 设置中的 access_as_user 作用域" width={1740} height={640} />
</div>

打开 **Manifest**，将 `api.requestedAccessTokenVersion` 设为 `2` 并保存。下文的网关配置要求使用 [v2 访问令牌](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens)。

### 配置客户端登录

打开 **Authentication** > **Add a platform**。选择应用所用的平台，并添加与其登录设置中完全一致的重定向 URI（redirect URI）。详见 Microsoft 的[重定向 URI 指南](https://learn.microsoft.com/en-us/entra/identity-platform/reply-url)。

## 2. 在 LiteLLM 中添加模型

在 LiteLLM 仪表板（dashboard）中打开 **Models + Endpoints** > **Add Model**。提供商选择 **Microsoft 365 Copilot**，模型选择 `chat`。将 **Public Model Name** 设为 `m365-copilot`，客户端请求时使用这个名称。

**Auth Type** 选择 **OAuth token exchange (on-behalf-of)**，然后选择 **Create credential**。

<div className="docs-screenshot">
  <Image img={require('../../img/m365_copilot_litellm_add_model.png')} dark={require('../../img/m365_copilot_litellm_add_model_dark.png')} alt="在 LiteLLM 中添加 Microsoft 365 Copilot 模型" width={1096} height={1221} />
</div>

填写以下值：

| 字段 | 值 |
| --- | --- |
| **Credential Name** | `m365-copilot-obo` |
| **Token Endpoint URL** | `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token` |
| **Exchange Grant** | `jwt_bearer_obo` |
| **Client ID** | 应用的 Application (client) ID |
| **Client Secret** | 你之前保存的客户端机密值 |
| **Scope** | `https://graph.microsoft.com/.default` |
| **Audience** | 留空 |

<div className="docs-screenshot">
  <Image img={require('../../img/m365_copilot_litellm_credential.png')} dark={require('../../img/m365_copilot_litellm_credential_dark.png')} alt="LiteLLM 中的 Microsoft 365 Copilot 令牌交换凭据" width={656} height={1125} />
</div>

选择 **Add Credential**，在模型表单中选中刚保存的凭据，然后选择 **Add Model**。

下面这段录屏在仪表板中完整演示了这一步：

<ThemedVideo
  src={require('../../img/m365_copilot_setup_flow.mp4')}
  dark={require('../../img/m365_copilot_setup_flow_dark.mp4')}
  poster={require('../../img/m365_copilot_setup_flow_poster.png')}
  darkPoster={require('../../img/m365_copilot_setup_flow_poster_dark.png')}
  title="演示：添加 Microsoft 365 Copilot 模型及其 on-behalf-of 凭据"
/>

## 3. 配置网关以接受 Entra 访问令牌

在你的网关部署中设置以下环境变量，并将 `<tenant-id>` 和 `<app-client-id>` 替换为第 1 步获得的 ID：

| 环境变量 | 值 |
| --- | --- |
| `JWT_PUBLIC_KEY_URL` | `https://login.microsoftonline.com/<tenant-id>/discovery/v2.0/keys` |
| `JWT_AUDIENCE` | `<app-client-id>` |
| `JWT_ISSUER` | `https://login.microsoftonline.com/<tenant-id>/v2.0` |

将以下配置加入网关的 `config.yaml`，然后重启网关：

```yaml
general_settings:
  enable_jwt_auth: true
  litellm_jwtauth:
    user_id_jwt_field: oid
    user_email_jwt_field: preferred_username
    user_id_upsert: true

litellm_settings:
  drop_params: true
```

`drop_params: true` 会在整个网关范围内从请求中移除不支持的参数，例如 tools 和 temperature。Copilot 不支持工具调用（tool calling），且该提供商下 LiteLLM 会忽略 `max_tokens`。

## 4. 通过 SSO 接入你的应用

以应用管理员身份，配置基于 Microsoft Entra 的 OpenID Connect（OIDC）登录：

| 设置 | 值 |
| --- | --- |
| 签发者 URL | `https://login.microsoftonline.com/<tenant-id>/v2.0` |
| 客户端 ID | 第 1 步中 Entra 应用的客户端 ID |
| 重定向 URI | 应用的 SSO 回调 URL，已在第 1 步注册 |
| 作用域 | `openid profile email offline_access api://<app-client-id>/access_as_user` |

然后配置应用的模型连接：

| 设置 | 值 |
| --- | --- |
| API 基础 URL | `https://litellm.example.com/v1`，替换为你的网关地址 |
| 模型 | `m365-copilot`，或你在第 2 步设置的公开模型名称 |
| 身份验证 | 在 `Authorization: Bearer <access-token>` 请求头中携带已登录用户的 Entra 访问令牌 |

:::note

应用必须在每次模型请求中携带为 `api://<app-client-id>/access_as_user` 签发的**访问令牌**，仅完成 SSO 登录并不够，ID 令牌无法完成 on-behalf-of 交换。

:::

## 5. 登录并使用 Copilot

打开应用并用你的 Microsoft 工作账户登录。选择 `m365-copilot`，发送类似"总结我最近的一场会议"这样的提示词。应用会处理每次请求的身份验证，Copilot 则基于你的 Microsoft 365 权限来作答。

## 可选配置

### 添加 email 或 groups 声明

如果你的网关使用 email 或 groups 声明（claims），请在 **Token configuration** 下添加。为可选的 `email` 声明选择 **Access token** 类型；`groups` 仅在网关真正用到时才添加。详见 Microsoft 的[可选声明指南](https://learn.microsoft.com/en-us/entra/identity-platform/optional-claims)。

<div className="docs-screenshot">
  <Image img={require('../../img/m365_copilot_entra_token_configuration.png')} alt="Microsoft Entra 中的可选令牌声明" width={1740} height={900} />
</div>

### 通过配置文件添加模型

如果你通过 `config.yaml` 管理模型，引用第 2 步保存的凭据即可：

```yaml
model_list:
  - model_name: m365-copilot
    litellm_params:
      model: microsoft_365_copilot/chat
      litellm_credential_name: m365-copilot-obo
```

### 凭据字段

LiteLLM 从保存的凭据中读取令牌交换设置，客户端无法在请求中指定这些设置。

| 字段 | 用途 |
| --- | --- |
| `token_exchange_endpoint` | Entra 令牌端点 |
| `token_exchange_profile` | 交换类型；默认为 `jwt_bearer_obo`，也支持 `rfc8693` |
| `client_id` | Entra 应用的客户端 ID |
| `client_secret` | Entra 应用的客户端机密 |
| `token_exchange_scope` | 默认为 `https://graph.microsoft.com/.default` |
| `token_exchange_audience` | 可选；仅对 `rfc8693` 生效 |

## 请求的工作方式

LiteLLM 调用的是 Microsoft Graph beta 版 Copilot Chat API，具体模型由 Microsoft 决定。默认情况下 LiteLLM 把 Token 成本列为 `$0`，因为 Microsoft 按许可证对 Copilot 计费。管理员可以配置[自定义定价](https://docs.litellm.ai/docs/proxy/custom_pricing#override-model-cost-map)，在 LiteLLM 中追踪用量成本。

LiteLLM 把最后一条用户消息作为提示词发送，其余消息按原顺序作为上下文一并发送。如果 Graph 连续两次返回同一条回复，只有当两份内容完全一致时 LiteLLM 才会去重。

每个网关工作进程都会把交换得到的访问令牌缓存在内存中，直到其过期前 60 秒。LiteLLM 不存储刷新令牌（refresh token）。

## 故障排查

| 问题 | 处理方法 |
| --- | --- |
| Entra 返回 `AADSTS240002` | 检查应用请求的是 `api://<app-client-id>/access_as_user`，且转发的是由此得到的访问令牌，而非 ID 令牌。 |
| 连接测试提示需要调用方的访问令牌 | 请通过应用登录并发送一条提示词，仅凭 LiteLLM 仪表板会话无法完成交换。 |
| 令牌的受众或签发者不匹配 | 检查应用签发的是 v2 访问令牌。令牌的 `aud` 必须与 `JWT_AUDIENCE` 一致，`iss` 必须与 `JWT_ISSUER` 一致。 |
