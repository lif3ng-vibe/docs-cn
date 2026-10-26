import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ✨ Admin UI 的 SSO 单点登录

<EnterpriseFeature feature="SSO">自 v1.76.0 起，SSO（单点登录）对最多 5 名用户免费；超出后需要企业版（enterprise）许可。</EnterpriseFeature>

### 用法（Google、Microsoft、Okta 等）

<Tabs>
<TabItem value="okta" label="Okta SSO">

### 视频演示

<iframe width="100%" height="415" src="https://www.loom.com/embed/cac5be90f2714ceaa95d7f89cf4ac548" frameBorder="0" allowFullScreen></iframe>

#### 第 1 步：在 Okta 中创建 OIDC 应用

在 Okta 管理控制台中新建一个 **OIDC Web 应用**。详细步骤参见 [Okta 创建 OIDC 应用集成的官方指南](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_oidc.htm)。

配置该应用时：
- **登录重定向 URI**：`https://<your-proxy-base-url>/sso/callback`
- **登出重定向 URI**（可选）：`https://<your-proxy-base-url>`

<Image img={require('../../img/okta_redirect_uri.png')} />

创建应用后，在应用的 General 选项卡中复制 **Client ID** 和 **Client Secret**：

<Image img={require('../../img/okta_client_credentials.png')} />

#### 第 2 步：将用户分配到应用

确保已在 **Assignments** 选项卡中把用户分配给该应用。如果启用了 Federation Broker Mode，可能需要先将其关闭才能手动分配用户。

#### 第 3 步：设置环境变量

设置以下环境变量。两种 Okta 授权服务器的区别只在端点 URL：

**组织授权服务器**（所有 Okta 套餐均可用，无需额外 SKU）：
```bash
GENERIC_CLIENT_ID="<your-client-id>"
GENERIC_CLIENT_SECRET="<your-client-secret>"
GENERIC_AUTHORIZATION_ENDPOINT="https://<your-okta-domain>/oauth2/v1/authorize"
GENERIC_TOKEN_ENDPOINT="https://<your-okta-domain>/oauth2/v1/token"
GENERIC_USERINFO_ENDPOINT="https://<your-okta-domain>/oauth2/v1/userinfo"
PROXY_BASE_URL="https://<your-proxy-base-url>"
```

**自定义授权服务器**（需要 Okta API Access Management SKU）：
```bash
GENERIC_CLIENT_ID="<your-client-id>"
GENERIC_CLIENT_SECRET="<your-client-secret>"
GENERIC_AUTHORIZATION_ENDPOINT="https://<your-okta-domain>/oauth2/default/v1/authorize"
GENERIC_TOKEN_ENDPOINT="https://<your-okta-domain>/oauth2/default/v1/token"
GENERIC_USERINFO_ENDPOINT="https://<your-okta-domain>/oauth2/default/v1/userinfo"
PROXY_BASE_URL="https://<your-proxy-base-url>"
```

:::tip
所有 OAuth 端点都可以在 `https://<your-okta-domain>/.well-known/openid-configuration` 找到
:::

#### 第 3a 步：配置访问策略（仅限自定义授权服务器）

如果使用的是自定义授权服务器，必须配置访问策略（Access Policy），否则用户会收到 `no_matching_policy` 错误。使用组织授权服务器则可跳过这一步。

1. 进入 **Security** → **API**

<Image img={require('../../img/okta_security_api.png')} />

2. 选择 **default** 授权服务器（或你的自定义服务器）

<Image img={require('../../img/okta_authorization_server.png')} />

3. 点击 **Access Policies** 选项卡，新建一条分配给你的 LiteLLM 应用的策略
4. 添加一条允许 **Authorization Code** 授权类型的规则

<Image img={require('../../img/okta_access_policies.png')} />

详见 [Okta 访问策略文档](https://help.okta.com/en-us/content/topics/security/api-access-management/access-policies.htm)。

#### 第 4 步：配置 Okta 安全设置

在 Okta 上建议设置 **GENERIC_CLIENT_STATE** 来防范 CSRF 攻击：

```bash
GENERIC_CLIENT_STATE="random-string"
```

**PKCE**（Proof Key for Code Exchange）。如果你的 Okta 应用配置为必须使用 PKCE，请这样启用：

```bash
GENERIC_CLIENT_USE_PKCE="true"
```

在 OAuth 流程中，LiteLLM 会自动完成 PKCE 参数的生成与校验。

#### 第 5 步：测试 SSO 流程

1. 启动 LiteLLM 代理
2. 访问 `https://<your-proxy-base-url>/ui`
3. 点击 SSO 登录按钮
4. 在 Okta 完成认证，确认能重定向回 LiteLLM

#### 故障排查

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `redirect_uri` 错误 | 未配置重定向 URI | 在 Okta 的登录重定向 URI 中加入 `<proxy_base_url>/sso/callback` |
| `access_denied` | 用户未被分配到应用 | 在 Assignments 选项卡中分配该用户 |
| `no_matching_policy` | 缺少访问策略（仅限自定义授权服务器） | 在授权服务器中创建访问策略（见第 3a 步） |

</TabItem>
<TabItem value="google" label="Google SSO">

- 在 https://console.cloud.google.com/ 上创建一个新的 OAuth 2.0 客户端

**代理服务器上必需的 .env 变量**
```shell
# for Google SSO Login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- 在 https://console.cloud.google.com/ 上的 OAuth 2.0 客户端中设置重定向 URL
    - 将重定向 URL 设置为 `<your proxy base url>/sso/callback`
    ```shell
    https://litellm-production-7002.up.railway.app/sso/callback
    ```

</TabItem>

<TabItem value="msft" label="Microsoft SSO">

- 在 https://portal.azure.com/ 上新建一个应用注册（App Registration）
- 为你的应用注册创建一个客户端密钥（client Secret）

**代理服务器上必需的 .env 变量**
```shell
MICROSOFT_CLIENT_ID="84583a4d-"
MICROSOFT_CLIENT_SECRET="nbk8Q~"
MICROSOFT_TENANT="5a39737"
```

**可选：自定义 Microsoft SSO 端点**

如果需要使用自定义的 Microsoft SSO 端点（例如自定义身份提供商、主权云或代理场景），可以覆盖默认端点：

```shell
MICROSOFT_AUTHORIZATION_ENDPOINT="https://your-custom-url.com/oauth2/v2.0/authorize"
MICROSOFT_TOKEN_ENDPOINT="https://your-custom-url.com/oauth2/v2.0/token"
MICROSOFT_USERINFO_ENDPOINT="https://your-custom-graph-api.com/v1.0/me"
```

如果未设置这些变量，将根据你的租户使用默认的 Microsoft 端点。

- 在 https://portal.azure.com/ 上为你的应用注册设置重定向 URI
    - 将重定向 URL 设置为 `<your proxy base url>/sso/callback`
    ```shell
    http://localhost:4000/sso/callback
    ```

**用应用角色（App Roles）控制用户权限**

你可以直接在 Entra ID 中通过应用角色分配用户角色。LiteLLM 会自动从 JWT 令牌中读取应用角色，并把对应角色赋予该用户。

支持的角色：
- `proxy_admin` - 平台管理员
- `proxy_admin_viewer` - 可登录，查看所有密钥和全部花费（只读）
- `internal_user` - 普通用户。可登录、查看花费，并根据团队成员权限查看/创建/删除自己的密钥。


设置应用角色的步骤：
1. 在 https://portal.azure.com/ 上打开你的应用注册
2. 进入 "App roles" 并新建一个应用角色
3. 使用上面支持的角色名之一（如 `proxy_admin`）
4. 在企业应用程序（Enterprise Application）中把用户分配到这些角色
5. 用户通过 SSO 登录时，LiteLLM 会自动为其赋予对应角色

**进阶：自定义用户属性映射**

在某些 Microsoft Entra ID 配置下，你可能需要覆盖默认的用户属性字段名。当组织在 SSO 响应中使用自定义 claim 或非标准属性名时，这一点很有用。

**第 1 步：调试 SSO 响应**

先用 [SSO 调试路由](#调试-sso-jwt-字段)检查 Microsoft SSO 提供商返回的 JWT 字段。

1. 在代理上设置 `ENABLE_SSO_DEBUG="true"` 并重启（否则调试路由会返回 404）
2. 在 Azure 应用注册中把 `/sso/debug/callback` 添加为重定向 URL
3. 访问 `https://<proxy_base_url>/sso/debug/login`
4. 走完 SSO 流程，即可看到返回的用户属性

**第 2 步：确认字段属性名**

从调试响应中找出邮箱、显示名、用户 ID、名（first name）和姓（last name）各自使用的字段名。

**第 3 步：设置环境变量**

设置以下环境变量来覆盖默认属性名：

| 环境变量 | 说明 | 默认值 |
|---------------------|-------------|---------------|
| `MICROSOFT_USER_EMAIL_ATTRIBUTE` | 用户邮箱的字段名 | `userPrincipalName` |
| `MICROSOFT_USER_DISPLAY_NAME_ATTRIBUTE` | 显示名的字段名 | `displayName` |
| `MICROSOFT_USER_ID_ATTRIBUTE` | 用户 ID 的字段名 | `id` |
| `MICROSOFT_USER_FIRST_NAME_ATTRIBUTE` | 名（first name）的字段名 | `givenName` |
| `MICROSOFT_USER_LAST_NAME_ATTRIBUTE` | 姓（last name）的字段名 | `surname` |

**第 4 步：重启代理**

设置环境变量后，重启代理：

```bash
litellm --config /path/to/config.yaml
```

</TabItem>

<TabItem value="Generic" label="通用 SSO 提供商">

一个通用的 OAuth 客户端，几乎不用写代码就能快速接入任意 OAuth 提供商

**代理服务器上必需的 .env 变量**
```shell

GENERIC_CLIENT_ID = "******"
GENERIC_CLIENT_SECRET = "G*******"
GENERIC_AUTHORIZATION_ENDPOINT = "http://localhost:9090/auth"
GENERIC_TOKEN_ENDPOINT = "http://localhost:9090/token"
GENERIC_USERINFO_ENDPOINT = "http://localhost:9090/me"
```

**可选 .env 变量**
以下变量用于在与通用 OAuth 提供商交互时自定义属性名，LiteLLM 会从 SSO 提供商的返回结果中读取这些属性

```shell
GENERIC_USER_ID_ATTRIBUTE = "sub"
GENERIC_USER_EMAIL_ATTRIBUTE = "email"
GENERIC_USER_DISPLAY_NAME_ATTRIBUTE = "display_name"
GENERIC_USER_FIRST_NAME_ATTRIBUTE = "first_name"
GENERIC_USER_LAST_NAME_ATTRIBUTE = "last_name"
GENERIC_USER_ROLE_ATTRIBUTE = "given_role"
GENERIC_USER_PROVIDER_ATTRIBUTE = "provider"
GENERIC_USER_EXTRA_ATTRIBUTES = "department,employee_id,manager" # comma-separated list of additional fields to extract from SSO response
GENERIC_CLIENT_STATE = "some-state" # if the provider needs a state parameter
GENERIC_INCLUDE_CLIENT_ID = "false" # some providers enforce that the client_id is not in the body
GENERIC_SCOPE = "openid profile email" # default scope openid is sometimes not enough to retrieve basic user info like first_name and last_name located in profile scope
```

如果 UserInfo 响应不完整，可以设置 `GENERIC_INCLUDE_TOKEN_CLAIMS = "true"`，从 ID 令牌和访问令牌中一并读取用户 claim。UserInfo 中的 claim 优先

**如何选择 `GENERIC_USER_ID_ATTRIBUTE`**

LiteLLM 会把该属性的值当作用户身份存储，并在之后每次登录时用它来查找用户，所以要把它指向提供商保证唯一、且在账户整个生命周期内不会改变的 claim。`sub` 是 OIDC 标准中承担这个用途的 claim。用户能在个人资料里自行修改的 claim（如 `preferred_username`、`email`、`name`）随时可能变掉，下一次登录就会被当成另一个人，拥有独立的一套密钥、团队和花费。`GENERIC_USER_ID_ATTRIBUTE` 未设置时，LiteLLM 默认读取 `preferred_username`，如果你的提供商允许用户修改该值，请务必显式设置。

**通过 SSO 分配用户角色**

用 `GENERIC_USER_ROLE_ATTRIBUTE` 指定 SSO 令牌中包含用户角色的属性。角色值必须是以下 LiteLLM 支持的角色之一：

- `proxy_admin` - 平台管理员
- `proxy_admin_viewer` - 可登录，查看所有密钥和全部花费（只读）
- `internal_user` - 可登录，查看/创建/删除自己的密钥，查看自己的花费
- `internal_user_viewer` - 可登录，查看自己的密钥和自己的花费

支持嵌套属性路径（如 `claims.role` 或 `attributes.litellm_role`）。

**捕获额外的 SSO 字段**

用 `GENERIC_USER_EXTRA_ATTRIBUTES` 从 SSO 提供商响应中提取标准用户属性（id、email、name 等）之外的字段。当你需要在[自定义 SSO 处理器](./custom_sso.md)中访问组织特有的数据（如部门、员工 ID、用户组）时，这很有用。

对于 **CLI SSO**，可以通过 `CLI_SSO_CLAIM_MAP` 把相同（或其他）claim 映射进用户 `metadata`，并向 CLI 返回标量值。参见 [CLI 认证](./cli_sso.md#归因元数据oidc-声明)。

```shell
# Comma-separated list of field names to extract
GENERIC_USER_EXTRA_ATTRIBUTES="department,employee_id,manager,groups"
```

**在自定义 SSO 处理器中访问额外字段**：

```python
from litellm.proxy.management_endpoints.types import CustomOpenID

async def custom_sso_handler(userIDPInfo: CustomOpenID):
    # Access the extra fields
    extra_fields = getattr(userIDPInfo, 'extra_fields', None) or {}
    
    user_department = extra_fields.get("department")
    employee_id = extra_fields.get("employee_id")
    user_groups = extra_fields.get("groups", [])
    
    # Use these fields for custom logic (e.g., team assignment, access control)
    # ...
```

**嵌套字段路径**：

嵌套字段支持点号表示法：

```shell
GENERIC_USER_EXTRA_ATTRIBUTES="org_info.department,org_info.cost_center,metadata.employee_type"
```

- 如果你的提供商有要求，设置重定向 URI
    - 将重定向 URL 设置为 `<your proxy base url>/sso/callback`
    ```shell
    http://localhost:4000/sso/callback
    ```

</TabItem>

</Tabs>

### 默认登录与登出 URL

有些 SSO 提供商要求为登录和登出填写特定的重定向 URL，可以填入以下值。

- 登录：`<your-proxy-base-url>/sso/key/generate`
- 登出：`<your-proxy-base-url>`

在代理上设置登出 URL 的环境变量如下
```bash
PROXY_LOGOUT_URL="https://www.google.com"
```

#### 第 3 步：在 .env 中设置 `PROXY_BASE_URL`

在 .env 中设置该变量（这样代理才能生成正确的重定向 URL）
```shell
PROXY_BASE_URL=https://your-proxy-domain.com
```

#### 第 4 步：测试流程
<Image img={require('../../img/litellm_ui_3.gif')} />

### 用 SSO 限制邮箱子域名

如果你在使用 SSO，且只想让特定子域名（如 @berri.ai 邮箱账户）的用户访问 UI，可以这样做：

```bash
export ALLOWED_EMAIL_DOMAINS="berri.ai"
```

这样在放行之前，会先检查从 SSO 收到的用户邮箱是否包含该域名。

### 设置代理管理员

SSO 开启后可以设置代理管理员（Proxy Admin）。启用 SSO 后，用户的 `user_id` 会从 SSO 提供商获取。要设置代理管理员，需要从 UI 复制 `user_id`，并在 `.env` 中将其设为 `PROXY_ADMIN_ID`。

#### 第 1 步：从 UI 复制你的 ID

<Image img={require('../../img/litellm_ui_copy_id.png')} />

#### 第 2 步：在 .env 中将其设为 PROXY_ADMIN_ID

```env
export PROXY_ADMIN_ID="116544810872468347480"
```

这会把 `LiteLLM_UserTable` 中该用户的角色更新为 `proxy_admin`。

如果之后要更换这个 ID，请通过 API `/user/update` 或 UI（Internal Users 页面）更新用户角色。

#### 第 3 步：查看全部代理密钥

<Image img={require('../../img/litellm_ui_admin.png')} />

:::info

如果看不到全部密钥，可能是令牌缓存导致的，重新登录一次即可。

:::

### 自动将 SSO 用户加入团队（OIDC）

对于 OIDC 提供商（Okta、Google、通用 SSO），可以把身份提供商返回令牌中的某个 claim 提取到用户的 `team_ids` 里。每次 SSO 登录时，LiteLLM 都会读取该 claim，并把用户加入每个匹配的团队。

#### 第 1 步：让 LiteLLM 读取包含团队 ID 的 claim

```yaml showLineNumbers title="config.yaml"
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  litellm_jwtauth:
    team_ids_jwt_field: "groups" # any claim; dot notation works for nested claims, e.g. "resource_access.myapp.groups"
```

前提是提供商返回的令牌长这样：

```json
{
  ...,
  "groups": ["team_id_1", "team_id_2"]
}
```

不确定提供商返回了什么的话，可以用 [SSO 调试流程](#调试-sso-jwt-字段)查看收到的 claim。

#### 第 2 步：在 LiteLLM 上创建团队

claim 值必须与 LiteLLM 上已有团队的 `team_id` 一致。团队不会根据 OIDC claim 自动创建，没有匹配团队的 claim 值会被跳过。

```bash showLineNumbers title="创建 team_id 与 SSO group 值一致的团队"
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-d '{
    "team_alias": "team_1",
    "team_id": "team_id_1"
}'
```

#### 第 3 步：测试 SSO 流程

通过 SSO 登录，然后在 UI（Internal Users 页面）确认用户的团队成员身份。这里有一份[视频演示](https://www.loom.com/share/8959be458edf41fd85937452c29a33f3?sid=7ebd6d37-569a-4023-866e-e0cde67cb23e)。

有些提供商只在访问令牌中包含 groups claim，userinfo 响应里没有。这时可以通过 `ui_access_mode` 来配置该 claim，它同样会解码访问令牌。注意这种方式还会额外限制 UI 登录，仅限给定用户组的成员：

```yaml showLineNumbers title="config.yaml"
general_settings:
  ui_access_mode:
    type: "restricted_sso_group"
    restricted_sso_group: "<group required for UI access>"
    sso_group_jwt_field: "groups"
```

对于 Microsoft Entra ID，组成员关系改从 Microsoft Graph API 读取，请参考[这篇教程](../tutorials/msft_sso.md)。SAML 的团队 ID 则来自断言属性，参见 [SAML SSO](./saml_sso.md)。

### 限制个人密钥的创建

如果你想禁止用户创建个人密钥（不属于任何团队的密钥），可以用这个功能。该限制在 `/key/generate` 上强制执行，因此对 Admin UI 和直接调用 API 都有效

在 litellm 的 config.yaml 中设置 `key_generation_settings`

```yaml
litellm_settings:
  key_generation_settings:
    personal_key_generation:
      allowed_user_roles: ["proxy_admin"]
```

全部选项见[限制密钥生成](./virtual_keys.md#限制密钥生成)

### SSO 开启时使用用户名密码登录

SSO 开启时如果需要用用户名/密码访问 UI，请访问 `/fallback/login`。通过该路由可以用用户名密码凭证登录。

### 限制 UI 访问

你可以把 UI 访问限制为仅管理员，包括你自己（`proxy_admin`）以及你授予只读权限的人（`proxy_admin_viewer`），后者可以查看全局花费。

**第 1 步：设置 'admin_only' 访问模式**
```yaml
general_settings:
    ui_access_mode: "admin_only"
```

**第 2 步：邀请只读用户**

<Image img={require('../../img/admin_ui_viewer.png')} />

### 自定义 Admin UI 品牌外观

在 LiteLLM Admin UI 上使用你公司的品牌外观
你可以：
- 自定义 UI Logo
- 自定义 UI 配色方案
<Image img={require('../../img/litellm_custom_ai.png')} />

#### 设置自定义 Logo
可以传入本地图片，或者图片的 http/https URL

在环境变量中设置 `UI_LOGO_PATH`。推荐使用托管图片，配置和调试都省事得多

托管图片的设置示例
```shell
UI_LOGO_PATH="https://litellm-logo-aws-marketplace.s3.us-west-2.amazonaws.com/berriai-logo-github.png"
```

本地图片的设置示例（放在你的容器中）
```shell
UI_LOGO_PATH="ui_images/logo.jpg"
```

#### 或直接在 Admin UI 中设置 Logo
<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
  <Image img={require('../../img/admin_settings_ui_theme.png')} />
  <Image img={require('../../img/admin_settings_ui_theme_logo.png')} />
</div>

#### 设置自定义配色主题
- 前往 [/enterprise/enterprise_ui](https://github.com/BerriAI/litellm/blob/main/enterprise/enterprise_ui/_enterprise_colors.json)
- 在 `enterprise_ui` 目录中，把 `_enterprise_colors.json` 重命名为 `enterprise_colors.json`
- 在 `enterprise_colors.json` 中写上你公司的自定义配色
`enterprise_colors.json` 内容示例
颜色可以从以下调色板中任选：https://www.tremor.so/docs/layout/color-palette#default-colors
```json
{
    "brand": {
      "DEFAULT": "teal",
      "faint": "teal",
      "muted": "teal",
      "subtle": "teal",
      "emphasis": "teal",
      "inverted": "teal"
    }
}

```
- 部署 LiteLLM 代理服务器

## 故障排查

### 报错："The 'redirect_uri' parameter must be a Login redirect URI in the client app settings"

在使用 Okta 及其他 SSO 提供商时，如果重定向 URI 配置不正确，经常会遇到这个错误。

#### 问题

```
Your request resulted in an error. The 'redirect_uri' parameter must be a Login redirect URI in the client app settings
```

#### 解决方案

**1. 确保已在 .env 中设置 PROXY_BASE_URL，且 URL 带协议**

确保 `PROXY_BASE_URL` 是带协议（`http://` 或 `https://`）的完整 URL：

```bash
# ✅ Correct - includes https://
PROXY_BASE_URL=https://litellm.platform.com

# ✅ Correct - includes http://
PROXY_BASE_URL=http://litellm.platform.com

# ❌ Incorrect - missing protocol
PROXY_BASE_URL=litellm.platform.com
```

**2. 针对 Okta，确保已设置 `GENERIC_CLIENT_STATE`，并按需配置 PKCE**

`GENERIC_CLIENT_STATE` 与 PKCE 的配置细节见 [Okta SSO 第 4 步：配置 Okta 安全设置](#第-4-步配置-okta-安全设置)。

### 常见配置问题

#### Base URL 缺少协议
```bash
# This will cause redirect_uri errors
PROXY_BASE_URL=mydomain.com

# Fix: Add the protocol
PROXY_BASE_URL=https://mydomain.com
```

### 回退登录

SSO 开启时如果需要用用户名/密码访问 UI，请访问 `/fallback/login`。通过该路由可以用用户名密码凭证登录。

<Image img={require('../../img/fallback_login.png')} />


### 调试 SSO JWT 字段

如果你需要查看 LiteLLM 从 SSO 提供商收到的 JWT 字段，请按以下步骤操作。本指南会带你配置一个调试回调，用来查看 SSO 过程中的 JWT 数据。


<Image img={require('../../img/debug_sso.png')}  style={{ width: '500px', height: 'auto' }} />
<br />

1. 在代理上启用调试路由

  调试路由默认关闭，会返回 404。设置以下环境变量并重启代理（调试完成后记得取消该变量）：

  ```bash showLineNumbers title="环境变量"
  ENABLE_SSO_DEBUG="true"
  ```

2. 在 SSO 提供商处把 `/sso/debug/callback` 添加为重定向 URL

  在 SSO 提供商的设置中，把以下 URL 添加为新的重定向（回调）URL：

  ```bash showLineNumbers title="重定向 URL"
  http://<proxy_base_url>/sso/debug/callback
  ```


3. 在浏览器中打开调试登录页面

    在浏览器中访问以下 URL：

    ```bash showLineNumbers title="要访问的 URL"
    https://<proxy_base_url>/sso/debug/login
    ```

    这会发起标准 SSO 流程。你会先被重定向到 SSO 提供商的登录页面，认证成功后再被重定向回 LiteLLM 的调试回调路由。


4. 查看 JWT 字段

重定向完成后，你会看到一个名为 "SSO Debug Information" 的页面，其中展示了从 SSO 提供商收到的 JWT 字段（如上图所示）

## 进阶

### 通过 Azure App Roles 管理用户角色

把用户权限定义在 Azure Entra ID 中，实现集中化的角色管理。用户登录时，LiteLLM 会根据你的 Azure 配置自动分配角色，无需在 LiteLLM 里手动管理角色。

#### 第 1 步：在 Azure 应用注册中创建应用角色

1. 在 https://portal.azure.com/ 上打开你的应用注册
2. 进入 **App roles** > **Create app role**
3. 使用 [LiteLLM 支持的角色](./access_control.md#全局代理角色)之一来配置应用角色：
   - **显示名称**：Admin Viewer（或你偏好的显示名）
   - **值**：`proxy_admin_viewer`（必须与某个 LiteLLM 角色值完全一致）
4. 点击 **Apply** 保存该角色
5. 对你要使用的每个 LiteLLM 角色重复以上步骤


**支持的 LiteLLM 角色值**（完整角色文档见[这里](./access_control.md#全局代理角色)）：
- `proxy_admin` - 完整管理员权限
- `proxy_admin_viewer` - 只读管理员权限
- `internal_user` - 可创建/查看/删除自己的密钥
- `internal_user_viewer` - 可查看自己的密钥（只读）

<Image img={require('../../img/app_roles.png')} style={{ width: '900px', height: 'auto' }} />

---

#### 第 2 步：为用户分配应用角色

1. 在 https://portal.azure.com/ 上打开 **Enterprise Applications**
2. 选择你的 LiteLLM 应用
3. 进入 **Users and groups** > **Add user/group**
4. 选择用户
5. 在 **Select a role** 下选择你创建的应用角色（如 `proxy_admin_viewer`）
6. 点击 **Assign** 保存

<Image img={require('../../img/app_role2.png')} style={{ width: '900px', height: 'auto' }} />

---

#### 第 3 步：登录并验证

1. 通过 SSO 登录 LiteLLM UI
2. LiteLLM 会自动从 JWT 令牌中提取应用角色
3. 用户会被赋予对应角色（可以在 UI 中点开用户资料下拉菜单验证）

<Image img={require('../../img/app_role3.png')} style={{ width: '900px', height: 'auto' }} />

**注意**：Entra ID 传来的角色会优先于 LiteLLM 数据库中已有的角色。这保证了 SSO 提供商是用户角色的权威来源。
