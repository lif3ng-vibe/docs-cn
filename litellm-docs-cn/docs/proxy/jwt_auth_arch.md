import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 通过 OIDC（Azure AD/Keycloak 等）控制模型访问

<EnterpriseFeature feature="JWT Auth" />

<Image img={require('../../img/control_model_access_jwt.png')} style={{ width: '100%', maxWidth: '4000px' }} />

## Token 示例

<Tabs>
<TabItem value="Azure AD">

```bash
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "roles": ["basic_user"] # 👈 ROLE
}
```
</TabItem>
<TabItem value="Keycloak">

```bash
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "resource_access": {
    "litellm-test-client-id": {
      "roles": ["basic_user"] # 👈 ROLE
    }
  }
}
```
</TabItem>
</Tabs>

## 代理配置

<Tabs>
<TabItem value="Azure AD">

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_roles_jwt_field: "roles" # the field in the JWT that contains the roles
    user_allowed_roles: ["basic_user"] # roles that map to an 'internal_user' role on LiteLLM
    enforce_rbac: true # if true, will check if the user has the correct role to access the model

  role_permissions: # control what models are allowed for each role
    - role: internal_user
      models: ["anthropic-claude"]

model_list:
    - model_name: anthropic-claude
      litellm_params:
        model: {{anthropic}}
    - model_name: openai-gpt-4o
      litellm_params:
        model: {{openai_large}}
```

</TabItem>
<TabItem value="Keycloak">

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_roles_jwt_field: "resource_access.litellm-test-client-id.roles" # the field in the JWT that contains the roles
    user_allowed_roles: ["basic_user"] # roles that map to an 'internal_user' role on LiteLLM
    enforce_rbac: true # if true, will check if the user has the correct role to access the model

  role_permissions: # control what models are allowed for each role
    - role: internal_user
      models: ["anthropic-claude"]

model_list:
    - model_name: anthropic-claude
      litellm_params:
        model: {{anthropic}}
    - model_name: openai-gpt-4o
      litellm_params:
        model: {{openai_large}}
```

</TabItem>
</Tabs>


## 工作原理

1. 设置 JWT_PUBLIC_KEY_URL：这是你的 OpenID 提供商的公钥端点。Azure AD 为 `https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys`；Keycloak 为 `{keycloak_base_url}/realms/{your-realm}/protocol/openid-connect/certs`。

1. 将 JWT 角色映射到 LiteLLM 角色：通过 `user_roles_jwt_field` 和 `user_allowed_roles` 完成
    -  目前角色映射仅支持 `internal_user`。
2. 配置模型访问权限：
    - `role_permissions`：控制每个角色允许访问哪些模型。
        - `role`：要控制访问权限的 LiteLLM 角色。可选值为 ["internal_user", "proxy_admin", "team"]
        - `models`：该角色允许访问的模型列表。
    - `model_list`：代理上所有模型的总列表。[了解更多](./configs.md#llm-配置-model_list)

3. 模型校验：代理会对收到的 JWT 执行校验检查。[查看代码](https://github.com/BerriAI/litellm/blob/3a4f5b23b5025b87b6d969f2485cc9bc741f9ba6/litellm/proxy/auth/user_api_key_auth.py#L284)
