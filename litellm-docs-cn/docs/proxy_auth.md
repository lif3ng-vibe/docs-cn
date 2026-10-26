import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SDK 代理身份验证（OAuth2/JWT 自动刷新）

将 LiteLLM Python SDK 与需要 JWT 身份验证的 LiteLLM 代理服务器（Proxy）配合使用时，自动获取并刷新 OAuth2/JWT 令牌（token）。

## 概述

当你的 LiteLLM 代理服务器由 OAuth2/OIDC 身份提供商（identity provider，如 Azure AD、Keycloak、Okta、Auth0 等）保护时，SDK 客户端的每个请求都需要携带有效的 JWT 令牌。无需手动管理令牌生命周期，`litellm.proxy_auth` 会自动完成以下工作：

- 向身份提供商获取令牌
- 缓存令牌，避免不必要的请求
- 在令牌过期前自动刷新（预留 60 秒缓冲）
- 在每个请求中注入 `Authorization: Bearer <token>` 请求头

## 快速上手

### Azure AD

<Tabs>
<TabItem value="default" label="DefaultAzureCredential">

使用 [DefaultAzureCredential](https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential) 凭证链（credential chain），覆盖环境变量、托管标识、Azure CLI 等方式：

```python
import litellm
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

# One-time setup
litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(),  # uses DefaultAzureCredential
    scope="api://my-litellm-proxy/.default"
)
litellm.api_base = "https://my-proxy.example.com"

# All requests now include Authorization headers automatically
response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

</TabItem>
<TabItem value="client-secret" label="ClientSecretCredential">

使用指定的 Azure AD 应用注册：

```python
import litellm
from azure.identity import ClientSecretCredential
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

azure_cred = ClientSecretCredential(
    tenant_id="your-tenant-id",
    client_id="your-client-id",
    client_secret="your-client-secret"
)

litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(credential=azure_cred),
    scope="api://my-litellm-proxy/.default"
)
litellm.api_base = "https://my-proxy.example.com"

response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

</TabItem>
</Tabs>

**所需依赖**：`uv add azure-identity`

### 通用 OAuth2（Okta、Auth0、Keycloak 等）

支持任何提供 `client_credentials` 授权类型的 OAuth2 提供商：

```python
import litellm
from litellm.proxy_auth import GenericOAuth2Credential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=GenericOAuth2Credential(
        client_id="your-client-id",
        client_secret="your-client-secret",
        token_url="https://your-idp.example.com/oauth2/token"
    ),
    scope="litellm_proxy_api"
)
litellm.api_base = "https://my-proxy.example.com"

response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 自定义凭证提供程序

实现 `TokenCredential` 协议，即可接入任意身份验证机制：

```python
import time
import litellm
from litellm.proxy_auth import AccessToken, ProxyAuthHandler

class MyCustomCredential:
    """Any class with a get_token(scope) -> AccessToken method works."""

    def get_token(self, scope: str) -> AccessToken:
        # Your custom logic to obtain a token
        token = my_auth_system.get_jwt(scope=scope)
        return AccessToken(
            token=token,
            expires_on=int(time.time()) + 3600
        )

litellm.proxy_auth = ProxyAuthHandler(
    credential=MyCustomCredential(),
    scope="my-scope"
)
```

## 支持的端点

以下端点会自动注入身份验证请求头：

| 端点 | 功能 |
|------|------|
| 对话补全 | `litellm.completion()` / `litellm.acompletion()` |
| 嵌入 | `litellm.embedding()` / `litellm.aembedding()` |

## 工作原理

```
┌──────────┐     ┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Your    │     │  ProxyAuthHandler │     │   Identity   │     │  LiteLLM     │
│  Code    │────▶│  (token cache)   │────▶│   Provider   │     │  Proxy       │
│          │     │                  │◀────│  (Azure AD,  │     │              │
│          │     │                  │     │   Okta, etc) │     │              │
│          │     └────────┬─────────┘     └──────────────┘     │              │
│          │              │ Authorization: Bearer <token>      │              │
│          │──────────────┼───────────────────────────────────▶│              │
│          │◀─────────────┼────────────────────────────────────│              │
└──────────┘              │                                    └──────────────┘
```

1. 启动时设置一次 `litellm.proxy_auth`
2. 每次 SDK 调用（`completion()`、`embedding()`）时，处理器都会检查缓存的令牌
3. 如果令牌缺失或将在 60 秒内过期，就向身份提供商请求新令牌
4. 请求会被注入 `Authorization: Bearer <token>` 请求头
5. 如果获取令牌失败，会记录一条警告，请求继续发送但不带身份验证请求头

## API 参考

### ProxyAuthHandler

管理令牌生命周期的核心处理器。

```python
from litellm.proxy_auth import ProxyAuthHandler

handler = ProxyAuthHandler(
    credential="<TokenCredential>",  # required - credential provider
    scope="<oauth2-scope>"         # required - OAuth2 scope to request
)
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `credential` | `TokenCredential` | 是 | 凭证提供程序（credential provider），可以是 AzureADCredential、GenericOAuth2Credential 或自定义实现 |
| `scope` | `str` | 是 | 请求令牌所用的 OAuth2 scope |

**方法**：

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `get_token()` | `AccessToken` | 获取有效令牌，必要时自动刷新 |
| `get_auth_headers()` | `dict` | 获取 `{"Authorization": "Bearer <token>"}` 请求头 |

### AzureADCredential

包装任意 `azure-identity` 凭证，并采用惰性初始化。

```python
from litellm.proxy_auth import AzureADCredential

# Uses DefaultAzureCredential (recommended)
cred = AzureADCredential()

# Or wrap a specific azure-identity credential
from azure.identity import ManagedIdentityCredential
cred = AzureADCredential(credential=ManagedIdentityCredential())
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `credential` | Azure `TokenCredential` | 否 | `azure-identity` 凭证；为 `None` 时使用 `DefaultAzureCredential` |

### GenericOAuth2Credential

面向任意提供商的标准 OAuth2 客户端凭证（client credentials）流程。

```python
from litellm.proxy_auth import GenericOAuth2Credential

cred = GenericOAuth2Credential(
    client_id="your-client-id",
    client_secret="your-client-secret",
    token_url="https://your-idp.com/oauth2/token"
)
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `client_id` | `str` | 是 | OAuth2 客户端 ID |
| `client_secret` | `str` | 是 | OAuth2 客户端密钥 |
| `token_url` | `str` | 是 | 令牌端点 URL |

### AccessToken

表示 OAuth2 访问令牌的 dataclass。

```python
from litellm.proxy_auth import AccessToken

token = AccessToken(
    token="eyJhbG...",     # JWT string
    expires_on=1234567890  # Unix timestamp
)
```

### TokenCredential 协议

任何实现该协议的类都可以作为凭证提供程序使用：

```python
from litellm.proxy_auth import AccessToken

class MyCredential:
    def get_token(self, scope: str) -> AccessToken:
        ...
```

## 各提供商示例

### Keycloak

```python
from litellm.proxy_auth import GenericOAuth2Credential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=GenericOAuth2Credential(
        client_id="litellm-client",
        client_secret="your-keycloak-client-secret",
        token_url="https://keycloak.example.com/realms/your-realm/protocol/openid-connect/token"
    ),
    scope="openid"
)
```

### Okta

```python
from litellm.proxy_auth import GenericOAuth2Credential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=GenericOAuth2Credential(
        client_id="your-okta-client-id",
        client_secret="your-okta-client-secret",
        token_url="https://your-org.okta.com/oauth2/default/v1/token"
    ),
    scope="litellm_api"
)
```

### Auth0

```python
from litellm.proxy_auth import GenericOAuth2Credential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=GenericOAuth2Credential(
        client_id="your-auth0-client-id",
        client_secret="your-auth0-client-secret",
        token_url="https://your-tenant.auth0.com/oauth/token"
    ),
    scope="https://my-proxy.example.com/api"
)
```

### Azure AD 托管标识

```python
from azure.identity import ManagedIdentityCredential
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(
        credential=ManagedIdentityCredential()
    ),
    scope="api://my-litellm-proxy/.default"
)
```

## 与 `use_litellm_proxy` 结合使用

你可以将 `proxy_auth` 与 [`use_litellm_proxy`](./providers/litellm_proxy#将所有-sdk-请求发送至-litellm-代理) 搭配使用，让所有 SDK 请求都经由已完成身份验证的代理服务器转发：

```python
import os
import litellm
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

# Route all requests through the proxy
os.environ["LITELLM_PROXY_API_BASE"] = "https://my-proxy.example.com"
litellm.use_litellm_proxy = True

# Authenticate with OAuth2/JWT
litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(),
    scope="api://my-litellm-proxy/.default"
)

# This request goes through the proxy with automatic JWT auth
response = litellm.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Hello!"}]
)
```
