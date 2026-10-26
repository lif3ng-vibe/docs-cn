import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 内部用户自助服务

## 允许用户在 [Proxy UI](./ui.md) 上自行创建密钥

1. 在代理上添加用户，并为其分配团队权限

<Tabs>
<TabItem value="ui" label="UI">

进入 `Internal Users` -> `+New User`

<Image img={require('../../img/add_internal_user.png')}  style={{ width: '800px', height: 'auto' }} />

</TabItem>
<TabItem value="api" label="API">

在 LiteLLM 中创建一个新的内部用户（Internal User），并为其分配 `internal_user` 角色。

```bash
curl -X POST '<PROXY_BASE_URL>/user/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "user_email": "krrishdholakia@gmail.com",
    "user_role": "internal_user" # 👈 THIS ALLOWS USER TO CREATE/VIEW/DELETE THEIR OWN KEYS + SEE THEIR SPEND
}'
```

预期响应

```bash
{
    "user_id": "e9d45c7c-b20b-4ff8-ae76-3f479a7b1d7d", 👈 USE IN STEP 2
    "user_email": "<YOUR_USERS_EMAIL>",
    "user_role": "internal_user",
    ...
}
```

LiteLLM 内部用户可用的 UI 角色如下：

管理员角色：
  - `proxy_admin`：平台管理员
  - `proxy_admin_viewer`：可以登录，查看所有密钥与全部花费。**不能**创建/删除密钥，不能添加新用户。

内部用户角色：
  - `internal_user`：可以登录，查看/创建/删除自己的密钥，查看自己的花费。**不能**添加新用户。
  - `internal_user_viewer`：可以登录，查看自己的密钥与花费。**不能**创建/删除密钥，不能添加新用户。

</TabItem>
</Tabs>

2. 与用户共享邀请链接

<Tabs>
<TabItem value="ui" label="UI">

将邀请链接复制给用户

<Image img={require('../../img/invitation_link.png')}  style={{ width: '800px', height: 'auto' }} />

</TabItem>
<TabItem value="api" label="API">

```bash
curl -X POST '<PROXY_BASE_URL>/invitation/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "user_id": "e9d45c7c-b20b..." # 👈 USER ID FROM STEP 1
}'
```

预期响应

```bash
{
    "id": "a2f0918f-43b0-4770-a664-96ddd192966e",
    "user_id": "e9d45c7c-b20b..",
    "is_accepted": false,
    "accepted_at": null,
    "expires_at": "2024-06-13T00:02:16.454000Z", # 👈 VALID FOR 7d
    "created_at": "2024-06-06T00:02:16.454000Z",
    "created_by": "116544810872468347480",
    "updated_at": "2024-06-06T00:02:16.454000Z",
    "updated_by": "116544810872468347480"
}
```

邀请链接：

```bash
http://0.0.0.0:4000/ui/onboarding?id=a2f0918f-43b0-4770-a664-96ddd192966e

# <YOUR_PROXY_BASE_URL>/ui/onboarding?id=<id>
```

</TabItem>
</Tabs>

:::info

使用 [邮件通知](./email.md) 向用户发送入门引导链接

:::

3. 用户通过邮箱 + 密码认证登录

<Image img={require('../../img/ui_clean_login.png')}  style={{ width: '500px', height: 'auto' }} />



:::info

LiteLLM 企业版：启用 [SSO 登录](./admin_ui_sso.md)

:::

4. 用户现在可以自行创建密钥了


<Image img={require('../../img/ui_self_serve_create_key.png')}  style={{ width: '800px', height: 'auto' }} />

## 允许用户查看用量与缓存分析

1. 进入 Internal Users -> +Invite User

将其角色设为 `Admin Viewer`，这意味着他们只能查看用量与缓存分析

<Image img={require('../../img/ui_invite_user.png')}  style={{ width: '800px', height: 'auto' }} />
<br />

2. 与用户共享邀请链接


<Image img={require('../../img/ui_invite_link.png')}  style={{ width: '800px', height: 'auto' }} />
<br />

3. 用户通过邮箱 + 密码认证登录

<Image img={require('../../img/ui_clean_login.png')}  style={{ width: '500px', height: 'auto' }} />
<br />

4. 用户现在可以查看用量与缓存分析了

<Image img={require('../../img/ui_usage.png')}  style={{ width: '800px', height: 'auto' }} />


## 可用角色
LiteLLM 内部用户可用的 UI 角色如下：

**管理员角色：**
  - `proxy_admin`：平台管理员
  - `proxy_admin_viewer`：可以登录，查看所有密钥与全部花费。**不能**创建/删除密钥，不能添加新用户。

**内部用户角色：**
  - `internal_user`：可以登录，查看/创建/删除自己的密钥，查看自己的花费。**不能**添加新用户。
  - `internal_user_viewer`：可以登录，查看自己的密钥与花费。**不能**创建/删除密钥，不能添加新用户。

**团队角色：**
  - `admin`：可以向团队添加新成员，管理团队权限（Team Permissions），添加团队专属模型（适合接入团队自己微调的模型）。
  - `user`：可以登录，查看自己的密钥与花费。**不能**创建/删除密钥（可通过团队权限控制），不能添加新用户。


## 将 SSO 用户自动加入团队

本节介绍如何为 **Okta、Google SSO** 设置 SSO 自动加入

### Okta 与 Google SSO

1. 指定包含用户所属团队 ID 的 JWT 字段。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  litellm_jwtauth:
    team_ids_jwt_field: "groups" # 👈 CAN BE ANY FIELD
```

这里假设你的 SSO 令牌是下面这个样子。**如果你需要查看 LiteLLM 从 SSO 提供商收到的 JWT 字段，请按[这里](#调试-sso-jwt-字段)的说明操作**

```
{
  ...,
  "groups": ["team_id_1", "team_id_2"]
}
```

2. 在 LiteLLM 上创建团队

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "team_alias": "team_1",
    "team_id": "team_id_1" # 👈 MUST BE THE SAME AS THE SSO GROUP ID
}'
```

3. 测试 SSO 流程

这里有一段[演示其工作方式的视频](https://www.loom.com/share/8959be458edf41fd85937452c29a33f3?sid=7ebd6d37-569a-4023-866e-e0cde67cb23e)

### Microsoft Entra ID SSO 群组分配

请参阅这份[使用 Microsoft Entra ID 将 SSO 用户自动加入团队的教程](https://docs.litellm.ai/docs/tutorials/msft_sso)

### 调试 SSO JWT 字段

[**请看这里**](./admin_ui_sso.md#调试-sso-jwt-字段)


## 进阶配置
### 设置自定义登出 URL

如果希望用户点击登出后跳转到指定的 URL，请在 .env 中设置 `PROXY_LOGOUT_URL`

```
export PROXY_LOGOUT_URL="https://www.google.com"
```

<Image img={require('../../img/ui_logout.png')}  style={{ width: '400px', height: 'auto' }} />


### 为内部用户设置默认预算上限

内部用户注册时自动为其套用个人预算。默认情况下系统每 10 分钟检查一次该表，以便重置用户预算。如需修改这一间隔，[请看这里](./users.md#重置预算)

```yaml
litellm_settings:
  max_internal_user_budget: 10
  internal_user_budget_duration: "1mo" # reset every month
```

这会为注册的内部用户设置 10 美元的预算上限。

你也可以在 UI 中以可视化方式管理这些设置：

<Image img={require('../../img/default_user_settings_admin_ui.png')}  style={{ width: '700px', height: 'auto' }} />

这份预算只适用于该用户创建的个人密钥，也就是 UI 中 `Default Team` 下看到的密钥。

<Image img={require('../../img/max_budget_for_internal_users.png')}  style={{ width: '500px', height: 'auto' }} />

这份预算不适用于在非默认团队下创建的密钥。

用户个人的 `max_budget` 同时也是其从 UI 创建的个人密钥的上限。预算 500 美元的用户可以创建 `max_budget` 为 100 美元的个人密钥；若请求 600 美元则会被拒绝，报错 `max_budget (600.0) cannot exceed the caller's own max_budget (500.0)`。没有个人预算的用户，则回退使用 UI 会话预算（[`max_ui_session_budget`](./config_settings.md)，默认 1 美元；设为 `null` 表示不设上限）作为显式密钥 `max_budget` 的上限。密钥上不设置 `max_budget` 就没有密钥级上限，但该密钥的花费仍受用户自身预算约束。通过 `/user/update`、`/user/bulk_update` 或 Internal Users 页面修改用户的 `max_budget` 后，处理该更新的实例会立即生效。配置了 Redis 时，这一变更也会广播到其他代理实例；未配置 Redis 时，其他实例可能继续沿用旧上限，直到其缓存的用户记录过期（约 60 秒）。


### 为团队设置预算上限

[**请看这里**](./team_budgets.md)

### 默认团队

<Tabs>
<TabItem value="ui" label="UI">

进入 `Internal Users` -> `Default User Settings`，把默认团队设为你刚创建的团队。

顺便把默认模型设为 `no-default-models`，这样用户只能在团队内创建密钥。

<Image img={require('../../img/default_user_settings_with_default_team.png')}  style={{ width: '1000px', height: 'auto' }} />

</TabItem>
<TabItem value="yaml" label="YAML">

:::info
必须先创建团队，才能将其设为默认团队。
:::

```yaml
litellm_settings:
  default_internal_user_params:    # Default Params used when a new user signs in Via SSO
      user_role: "internal_user"     # one of "internal_user", "internal_user_viewer", 
      models: ["no-default-models"] # Optional[List[str]], optional): models to be used by the user
      teams: # Optional[List[NewUserRequestTeam]], optional): teams to be used by the user
        - team_id: "team_id_1" # Required[str]: team_id to be used by the user
          user_role: "user" # Optional[str], optional): Default role in the team. Values: "user" or "admin". Defaults to "user"
```

</TabItem>
</Tabs>

### 团队成员预算

设置一份适用于团队每个成员的默认预算上限。

你可以在创建新团队时设置，也可以在更新现有团队时设置。

`team_member_budget` 是整个团队共用的一份默认值。添加成员时若未单独指定 `max_budget_in_team`，该成员就会关联到这份默认值；因此通过 `/team/update`（或 UI 中团队的 Default Budget 字段）修改它时，对这些成员的下一次请求即生效，而不只影响之后新增的成员。在 `/team/member_add` 时单独指定了 `max_budget_in_team`，或之后通过 [`/team/member_update`](./users.md#更新团队成员的预算) 修改过的成员，则拥有自己的预算，不再跟随团队默认值。

<Tabs>
<TabItem value="ui" label="UI">

<Image img={require('../../img/create_default_team.png')}  style={{ width: '600px', height: 'auto' }} />

</TabItem>
<TabItem value="api" label="API">

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "team_alias": "team_1",
    "budget_duration": "10d",
    "team_member_budget": 10
}'
```

</TabItem>
</Tabs>

:::info
在现有团队上设置 `team_member_budget` 时，它会关联到所有还没有自己预算的成员，这些成员已产生的花费也会立即计入这份预算。如果某成员已超出新预算需要解除限制，请参阅[后补的预算会计入已有花费](./users.md#已有花费会计入后补的预算)。
:::

### 团队成员速率限制

为单个团队成员设置默认的 tpm/rpm 限制。

你可以在创建新团队时设置，也可以在更新现有团队时设置。


<Tabs>
<TabItem value="ui" label="UI">

<Image img={require('../../img/create_team_member_rate_limits.png')}  style={{ width: '600px', height: 'auto' }} />

</TabItem>
<TabItem value="api" label="API">

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "team_alias": "team_1",
    "team_member_rpm_limit": 100,
    "team_member_tpm_limit": 1000
}'
```

</TabItem>
</Tabs>



### 为新团队设置默认参数

将 litellm 接入你的 SSO 提供商后，litellm 可以自动创建团队。用它为这些自动创建的团队设置默认的 `models`、`max_budget`、`budget_duration`。

**工作原理**

1. litellm 从你的 SSO 提供商拉取 `groups` 时，会检查对应的 group_id 是否已作为 `team_id` 存在于 litellm 中。
2. 如果 team_id 不存在，litellm 会按你设置的默认参数自动创建团队。
3. 如果 team_id 已存在，litellm 不会对该团队应用任何设置。

**用法**

```yaml showLineNumbers title="新团队的默认参数"
litellm_settings:
  default_team_params:             # Applied to all /team/new calls (including SSO auto-created teams) when the field is omitted or null; an explicit budget_duration: null is honored
    max_budget: 100                # Optional[float]: $100 budget for the team
    budget_duration: 30d           # Optional[str]: 30 days budget_duration for the team
    models: ["{{openai_small}}"]      # Optional[List[str]]: models for the team (only applied to SSO auto-created teams)
    tpm_limit: 100000              # Optional[int]: tokens per minute limit
    rpm_limit: 1000                # Optional[int]: requests per minute limit
    team_member_permissions:       # Optional[List[str]]: permissions granted to non-admin team members
      - "/team/daily/activity"     # Allow members to view team usage
      - "/key/generate"            # Allow members to generate API keys
```

:::info

这些默认值会填充 `/team/new` 请求中缺失或为 `null` 的字段。`budget_duration` 是唯一的例外：显式发送 `"budget_duration": null`（即 UI 创建表单中的 "Never resets" 选项）会创建一个预算永不重置的团队，跳过已配置的默认值。

:::


### 限制用户创建个人密钥

如果你只想让用户在特定团队下创建密钥，这个功能会很有用。

这也会阻止用户在测试密钥聊天面板（test keys chat pane）中使用其会话令牌。

👉 [**请看这里**](./virtual_keys.md#限制密钥生成)

## **自助服务 / SSO 流程的全部设置**

```yaml showLineNumbers title="自助服务 / SSO 流程的全部设置"
litellm_settings:
  max_internal_user_budget: 10        # max budget for internal users
  internal_user_budget_duration: "1mo" # reset every month

  default_internal_user_params:    # Default Params used when a new user signs in Via SSO
    user_role: "internal_user"     # one of "internal_user", "internal_user_viewer", "proxy_admin", "proxy_admin_viewer". New SSO users not in litellm will be created as this user
    max_budget: 100                # Optional[float], optional): $100 budget for a new SSO sign in user
    budget_duration: 30d           # Optional[str], optional): 30 days budget_duration for a new SSO sign in user
    models: ["{{openai_small}}"]      # Optional[List[str]], optional): models to be used by a new SSO sign in user
    teams: # Optional[List[NewUserRequestTeam]], optional): teams to be used by the user
      - team_id: "team_id_1" # Required[str]: team_id to be used by the user
        max_budget_in_team: 100 # Optional[float], optional): $100 budget for the team. Defaults to None.
        user_role: "user" # Optional[str], optional): "user" or "admin". Defaults to "user"
  
  default_team_params:             # Applied to all /team/new calls (including SSO auto-created teams) when the field is omitted or null; an explicit budget_duration: null is honored
    max_budget: 100                # Optional[float]: $100 budget for the team
    budget_duration: 30d           # Optional[str]: 30 days budget_duration for the team
    models: ["{{openai_small}}"]      # Optional[List[str]]: models for the team (only applied to SSO auto-created teams)
    tpm_limit: 100000              # Optional[int]: tokens per minute limit
    rpm_limit: 1000                # Optional[int]: requests per minute limit
    team_member_permissions:       # Optional[List[str]]: permissions granted to non-admin team members
      - "/team/daily/activity"


  upperbound_key_generate_params:    # Upperbound for /key/generate requests when self-serve flow is on
    max_budget: 100 # Optional[float], optional): upperbound of $100, for all /key/generate requests
    budget_duration: "10d" # Optional[str], optional): upperbound of 10 days for budget_duration values
    duration: "30d" # Optional[str], optional): upperbound of 30 days for all /key/generate requests
    max_parallel_requests: 1000 # (Optional[int], optional): Max number of requests that can be made in parallel. Defaults to None.
    tpm_limit: 1000 #(Optional[int], optional): Tpm limit. Defaults to None.
    rpm_limit: 1000 #(Optional[int], optional): Rpm limit. Defaults to None.

  key_generation_settings: # Restricts who can generate keys. [Further docs](./virtual_keys.md#限制密钥生成)
    team_key_generation:
      allowed_team_member_roles: ["admin"]
    personal_key_generation: # maps to 'Default Team' on UI 
      allowed_user_roles: ["proxy_admin"]
```

## 延伸阅读

- [引导用户开启 AI 探索](../tutorials/default_team_self_serve)
