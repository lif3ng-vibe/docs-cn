# ✨ SSO 登录事件钩子

<EnterpriseFeature feature="SSO">SSO 功能对最多 5 名用户免费，超出后需要企业版（enterprise）许可。</EnterpriseFeature>

## 概述

LiteLLM 依据你的认证架构，提供两种不同的 SSO 钩子（hook）：

| 钩子类型 | 适用场景 | 作用 |
|-----------|-------------|--------------|
| **自定义 UI SSO 登录处理器** | LiteLLM 前面部署了 OAuth 代理（oauth2-proxy、Gatekeeper、Vouch 等） | 从请求头解析用户信息，并让用户登录 UI |
| **自定义 SSO 处理器** | 直接对接 SSO 提供商（Google、Microsoft、SAML），并希望在认证后执行自定义逻辑 | 在标准 OAuth 流程之后运行自定义代码，设置用户权限/团队 |

**快速决策指南**：
- ✅ 用户认证发生在 LiteLLM 之外（通过请求头）时，使用**自定义 UI SSO 登录处理器**
- ✅ 想让 LiteLLM 负责处理 OAuth 流程、之后再运行自定义逻辑时，使用**自定义 SSO 处理器**

---

## 方案 1：自定义 UI SSO 登录处理器

当 **LiteLLM 前面部署了 OAuth 代理**，由它完成用户认证并通过请求头传递用户信息时，使用这种方案。

### 工作原理
- 用户打开管理界面（Admin UI）  
- 👉 **调用你的自定义 SSO 登录处理器**，由它解析请求头并返回用户信息
- LiteLLM 已从你的自定义处理器获取到用户信息
- 用户登录 UI

### 使用方法

#### 1. 创建自定义 UI SSO 处理器文件

该处理器解析请求头，并把用户信息封装成 OpenID 对象返回：

```python
from fastapi import Request
from fastapi_sso.sso.base import OpenID
from litellm.integrations.custom_sso_handler import CustomSSOLoginHandler


class MyCustomSSOLoginHandler(CustomSSOLoginHandler):
    """
    Custom handler for parsing OAuth proxy headers
    
    Use this when you have an OAuth proxy (like oauth2-proxy, Vouch, etc.) 
    in front of LiteLLM that adds user info to request headers
    """
    async def handle_custom_ui_sso_sign_in(
        self,
        request: Request,
    ) -> OpenID:
        # Parse headers from your OAuth proxy
        request_headers = dict(request.headers)
        
        # Extract user info from headers (adjust header names for your proxy)
        user_id = request_headers.get("x-forwarded-user") or request_headers.get("x-user")
        user_email = request_headers.get("x-forwarded-email") or request_headers.get("x-email")
        user_name = request_headers.get("x-forwarded-preferred-username") or request_headers.get("x-preferred-username")
        
        # Return OpenID object with user information
        return OpenID(
            id=user_id or "unknown",
            email=user_email or "unknown@example.com", 
            first_name=user_name or "Unknown",
            last_name="User",
            display_name=user_name or "Unknown User",
            picture=None,
            provider="oauth-proxy",
        )

# Create an instance to be used by LiteLLM
custom_ui_sso_sign_in_handler = MyCustomSSOLoginHandler()
```

#### 2. 在 config.yaml 中配置

```yaml
model_list: 
  - model_name: "openai-model"
    litellm_params: 
      model: "{{openai_small}}"

general_settings:
  custom_ui_sso_sign_in_handler: custom_sso_handler.custom_ui_sso_sign_in_handler

litellm_settings:
  drop_params: True
  set_verbose: True
```

#### 3. 启动代理
```shell
$ litellm --config /path/to/config.yaml 
```

#### 4. 打开管理界面

当用户试图访问 LiteLLM 管理界面时，请求会被路由到你的自定义 UI SSO 登录处理器。

---

## 方案 2：自定义 SSO 处理器（认证后处理）

如果你想在用户通过标准 SSO 提供商（Google、Microsoft 等）登录 LiteLLM UI **之后**运行自己的代码，使用这种方案。

### 工作原理
- 用户打开管理界面
- LiteLLM 把用户重定向到你的 SSO 提供商（Google、Microsoft 等）
- SSO 提供商再把用户重定向回 LiteLLM  
- LiteLLM 已从你的身份提供商（IDP）获取到用户信息
- 👉 **调用你的自定义 SSO 处理器**，返回一个 SSOUserDefinedValues 类型的对象
- 用户登录 UI

### 使用方法

#### 1. 创建自定义 SSO 处理器文件

返回类型必须符合 `SSOUserDefinedValues` 这个 pydantic 对象。LiteLLM 用它把用户登录到管理界面：

```python
from fastapi_sso.sso.base import OpenID

from litellm.proxy._types import LitellmUserRoles, SSOUserDefinedValues
from litellm.proxy import proxy_server

# These imports are available if you need to create users or manage team membership:
# from litellm.proxy.management_endpoints.internal_user_endpoints import new_user
# from litellm.proxy.management_endpoints.team_endpoints import add_new_member


async def custom_sso_handler(userIDPInfo: OpenID) -> SSOUserDefinedValues:
    try:
        print("inside custom sso handler")  # noqa
        print(f"userIDPInfo: {userIDPInfo}")  # noqa

        if userIDPInfo.id is None:
            raise ValueError(
                f"No ID found for user. userIDPInfo.id is None {userIDPInfo}"
            )
        
        #################################################
        # Access extra fields from SSO provider (requires GENERIC_USER_EXTRA_ATTRIBUTES env var)
        # Example: Set GENERIC_USER_EXTRA_ATTRIBUTES="department,employee_id,groups"
        extra_fields = getattr(userIDPInfo, 'extra_fields', None) or {}
        user_department = extra_fields.get("department")
        employee_id = extra_fields.get("employee_id")
        user_groups = extra_fields.get("groups", [])
        
        print(f"User department: {user_department}")  # noqa
        print(f"Employee ID: {employee_id}")  # noqa
        print(f"User groups: {user_groups}")  # noqa
        #################################################

        #################################################
        # Run your custom code / logic here
        # check if user exists in litellm proxy DB
        if proxy_server.prisma_client is not None:
            _user_info = await proxy_server.prisma_client.get_data(user_id=userIDPInfo.id)
            print("_user_info from litellm DB ", _user_info)  # noqa
        #################################################

        return SSOUserDefinedValues(
            models=[],                                      # models user has access to
            user_id=userIDPInfo.id,                         # user id to use in the LiteLLM DB
            user_email=userIDPInfo.email,                   # user email to use in the LiteLLM DB
            user_role=LitellmUserRoles.INTERNAL_USER.value, # role to use for the user 
            max_budget=0.01,                                # Max budget for this UI login Session
            budget_duration="1d",                           # Duration of the budget for this UI login Session, 1d, 2d, 30d ...
        )
    except Exception as e:
        raise Exception("Failed custom auth")
```

#### 2. 在 config.yaml 中配置

把该文件的路径传入 config.yaml。

例如两个文件位于同一目录（`./config.yaml` 和 `./custom_sso.py`），配置写法如下：

```yaml 
model_list: 
  - model_name: "openai-model"
    litellm_params: 
      model: "{{openai_small}}"

general_settings:
  custom_sso: custom_sso.custom_sso_handler

litellm_settings:
  drop_params: True
  set_verbose: True
```

#### 3. 启动代理
```shell
$ litellm --config /path/to/config.yaml 
```
