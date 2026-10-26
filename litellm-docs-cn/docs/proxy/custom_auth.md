# 自定义认证（Custom Auth）

现在你可以覆写默认的 API 密钥认证。

:::warning[自定义认证的强制范围]

默认情况下，自定义认证只强制执行你在返回对象上设置的速率限制；预算和模型访问控制则需要额外开启开关（flag）。下表列出了每项控制在何处配置、需要哪些开关。

:::

## 哪些控制会生效

| 控制目标 | 配置位置 | 所需开关 |
| --- | --- | --- |
| 密钥 / 用户 / 团队 / 终端用户的速率限制 | 返回对象（`rpm_limit`、`team_tpm_limit` 等） | 无 |
| 按模型速率限制（密钥 / 团队范围） | 返回对象上的 `metadata` / `team_metadata` | 无 |
| 按模型速率限制（项目范围） | 项目记录（`model_tpm_limit` / `model_rpm_limit`） | `custom_auth_run_common_checks` |
| 团队 / 用户 / 项目预算 | 团队 / 用户 / 项目记录 | `custom_auth_run_common_checks` |
| 团队 / 用户 / 项目的模型白名单 | 团队 / 用户 / 项目记录 | `custom_auth_run_common_checks` |
| 终端用户预算 | 终端用户记录 | `custom_auth_run_common_checks` 或 `enable_post_custom_auth_checks` |
| 密钥模型白名单（`models`） | 返回对象 | 两个开关 |
| 密钥按模型预算（`model_max_budget`） | 返回对象 | `enable_post_custom_auth_checks` |
| 密钥有效期（`expires`） | 返回对象 | `enable_post_custom_auth_checks` |
| 密钥标量预算（`max_budget` / `soft_budget`） | 不支持；请改用按范围配置的预算 | 不适用 |

**注意**：开关未开启时，项目级按模型限制可以放在返回对象的 `project_metadata` 上；但开关一旦开启，数据库中的项目记录会将其覆盖，因此请直接配置在项目记录上。（通过 `team_metadata` 设置的团队级按模型限制则始终读取返回对象。）

示例见[强制执行预算与模型访问控制](#强制执行预算与模型访问控制)和[密钥级强制执行](#密钥级强制执行)。

## 用法

#### 1. 创建自定义认证文件

确保返回类型符合 `UserAPIKeyAuth` 这个 Pydantic 对象的定义，LiteLLM 会用它来记录该密钥对应的用量信息。

```python
from fastapi import Request
from litellm.proxy._types import UserAPIKeyAuth

async def user_api_key_auth(request: Request, api_key: str) -> UserAPIKeyAuth: 
    try: 
        modified_master_key = "sk-my-master-key"
        if api_key == modified_master_key:
            return UserAPIKeyAuth(api_key=api_key)
        raise Exception
    except: 
        raise Exception
```

#### 2. 传入文件路径（相对于 config.yaml）

把文件路径写进 config.yaml。

例如两者位于同一目录（`./config.yaml` 和 `./custom_auth.py`）时，配置如下：
```yaml 
model_list: 
  - model_name: "openai-model"
    litellm_params: 
      model: "{{openai_small}}"

litellm_settings:
  drop_params: True
  set_verbose: True

general_settings:
  custom_auth: custom_auth.user_api_key_auth
```

[**实现代码**](https://github.com/BerriAI/litellm/blob/caf2a6b279ddbe89ebd1d8f4499f65715d684851/litellm/proxy/utils.py#L122)

#### 3. 启动代理
```shell
$ litellm --config /path/to/config.yaml 
```

## UserAPIKeyAuth 字段参考

这些字段会直接从返回对象上读取并强制执行，无需任何开关。预算与模型访问控制则只在开关打开后才强制执行（见下文）。

### 身份标识

标识请求归属者。当 `custom_auth_run_common_checks: true` 时，这些 `*_id` 字段还会告诉 LiteLLM 应当加载哪些数据库记录。

```python
def UserAPIKeyAuth(
    api_key: Optional[str] = None,                    # The API key (will be hashed automatically)
    token: Optional[str] = None,                      # Hashed token for internal use
    key_alias: Optional[str] = None,                  # Key alias for identification
    user_id: Optional[str] = None,                    # User identifier (also used to load the user record)
    user_email: Optional[str] = None,                 # User email address
    user_role: Optional[LitellmUserRoles] = None,     # User role (PROXY_ADMIN, INTERNAL_USER, etc.)
    team_id: Optional[str] = None,                    # Team identifier (also used to load the team record)
    org_id: Optional[str] = None,                     # Organization identifier (also used to load the org record)
    end_user_id: Optional[str] = None,                # End-user identifier (also used to load the end-user record)
): ...
```

### 速率限制

下面所有范围的限制都直接从返回对象上读取并强制执行，不需要任何开关。

```python
def UserAPIKeyAuth(
    # Key
    tpm_limit: Optional[int] = None,
    rpm_limit: Optional[int] = None,
    # User
    user_tpm_limit: Optional[int] = None,
    user_rpm_limit: Optional[int] = None,
    # Team
    team_tpm_limit: Optional[int] = None,
    team_rpm_limit: Optional[int] = None,
    # Per team-member
    team_member_tpm_limit: Optional[int] = None,
    team_member_rpm_limit: Optional[int] = None,
    # Per end-user
    end_user_tpm_limit: Optional[int] = None,
    end_user_rpm_limit: Optional[int] = None,
    # Per-model (key / team scoped)
    metadata: Dict = {},          # e.g. {"model_tpm_limit": {...}, "model_rpm_limit": {...}}
    team_metadata: Optional[Dict] = None,  # same keys, team scoped
): ...
```

:::note

按模型的速率限制从 `metadata`（密钥）与 `team_metadata`（团队）中读取，以模型名作为键。模型键必须与请求中的 `model` 字符串完全一致，否则该限制会被静默跳过。

对象上虽然存在 `rpm_limit_per_model` / `tpm_limit_per_model`，但它们不会生效；请改用 `metadata` / `team_metadata`，或使用项目记录（见下文）。

:::

### 高级

```python
def UserAPIKeyAuth(
    max_parallel_requests: Optional[int] = None,      # Concurrent request limit
    allowed_model_region: Optional[AllowedModelRegion] = None,  # Geographic restrictions
    blocked: Optional[bool] = None,                   # Whether the key is blocked
    config: Dict = {},                                # Configuration settings
): ...
```

### 对象权限（MCP、智能体等）

```python
from litellm.proxy._experimental.mcp_server.mcp_server_manager import (
    global_mcp_server_manager,
)

def _server_id(name: str) -> str:
    server = global_mcp_server_manager.get_mcp_server_by_name(name)
    if not server:
        raise ValueError(f"Unknown MCP server '{name}'")
    return server.server_id

object_permission = LiteLLM_ObjectPermissionTable(
    mcp_servers=[_server_id("deepwiki"), _server_id("everything")], # MCP servers this key is allowed to use
    mcp_tool_permissions={"deepwiki": ["search", "read_doc"]},      # optional per-server tool allow-list
)

UserAPIKeyAuth(
    object_permission=object_permission,
)
```

## 强制执行预算与模型访问控制

设置 `custom_auth_run_common_checks: true`，让自定义认证在认证的同时也强制执行预算与模型访问控制：

```yaml
general_settings:
  custom_auth: custom_auth.user_api_key_auth
  custom_auth_run_common_checks: true
```

你的处理函数只需返回 ID；预算和白名单存放在对应的数据库记录上（通过 `/team/new`、`/user/new`、`/project/new`、`/customer/new` 或管理界面创建），LiteLLM 会加载这些记录并强制执行其中的配置。

例如，创建一个带预算和模型白名单的团队：

```bash
curl -X POST 'http://0.0.0.0:4000/team/new' \
  -H 'Authorization: Bearer sk-master-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "team_id": "eng-team",
    "max_budget": 100,
    "models": ["{{openai_small}}", "{{anthropic}}"]
  }'
```

```python
# ...then return that team_id from custom auth:
return UserAPIKeyAuth(api_key=api_key, team_id="eng-team")
```

对于项目级按模型速率限制，在项目记录上设置 `model_tpm_limit` / `model_rpm_limit`（以模型名为键），并返回对应的 `project_id`：

```python
# On the project record (via /project/new or the UI):
#   model_tpm_limit = {"{{openai_large}}": 100000, "{{anthropic}}": 50000}
#   model_rpm_limit = {"{{openai_large}}": 100,    "{{anthropic}}": 200}
```

:::note

- 项目记录上的 metadata 会替换你在返回对象上设置的任何 `project_metadata`，因此项目级按模型限制应配置在项目记录上，而不是返回对象上。
- 按模型速率限制要求模型键与请求的 `model` 字符串完全一致，否则限制会被静默跳过。Expedia 当时的线上事故正是源于此。

:::

### 密钥级 `models` 与项目级 `models` 的区别

这是两套彼此独立的控制：

| 字段 | 在何处强制执行 | 数据来源 |
| --- | --- | --- |
| `UserAPIKeyAuth` 上的 `models` | 密钥级白名单 | 你在自定义认证中返回的值 |
| `UserAPIKeyAuth` 上的 `project_id` | 项目级白名单 | **LiteLLM 数据库中项目记录**上的 `models` |

空的 `models` 列表（`[]`）表示不设限制。名称必须与配置中的模型组一致（支持通配符）。参见[项目管理](./project_management)和[配置项说明](/docs/proxy/config_settings#litellm_settings-参考)。

## 密钥级强制执行

以下控制同样从返回对象上读取并强制执行，但前提是同时设置了 `litellm.enable_post_custom_auth_checks: true`：

```yaml
general_settings:
  custom_auth: custom_auth.user_api_key_auth
  custom_auth_run_common_checks: true   # required for the key models allowlist

litellm_settings:
  enable_post_custom_auth_checks: true
```

```python
from datetime import datetime, timedelta, timezone

return UserAPIKeyAuth(
    api_key=api_key,
    models=["{{openai_small}}"],                                   # key model allowlist (needs both flags)
    model_max_budget={"{{openai_large}}": {"budget_limit": 100, "time_period": "30d"}},  # key per-model budget
    expires=datetime.now(timezone.utc) + timedelta(days=30),  # key expiry
)
```

设置了 `end_user_id` 时，这条路径还会强制执行终端用户预算以及按模型的终端用户预算。

## ✨ 支持 LiteLLM 虚拟密钥 + 自定义认证

自 v1.72.2 版本起支持

<EnterpriseFeature feature="配合 LiteLLM 虚拟密钥使用自定义认证" />

### 用法

1. 编写自定义认证文件

```python
"""
Example custom auth function.

This will allow all keys starting with "my-custom-key" to pass through.
"""
from typing import Union

from fastapi import Request

from litellm.proxy._types import UserAPIKeyAuth


async def user_api_key_auth(
    request: Request, api_key: str
) -> Union[UserAPIKeyAuth, str]:
    try:
        if api_key.startswith("my-custom-key"):
            return "sk-P1zJMdsqCPNN54alZd_ETw"
        else:
            raise Exception("Invalid API key")
    except Exception:
        raise Exception("Invalid API key")

```

2. 配置 config.yaml

关键改动是设置 `mode: auto`，这样会同时检查 LiteLLM 自带的 API 密钥认证和自定义认证。

```yaml
model_list: 
  - model_name: "openai-model"
    litellm_params: 
      model: "{{openai_small}}"
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  custom_auth: custom_auth_auto.user_api_key_auth
  custom_auth_settings:
    mode: "auto" # can be 'on', 'off', 'auto' - 'auto' checks both litellm api key auth + custom auth
```

处理流程：
1. 先检查自定义认证
2. 若自定义认证失败，再检查 LiteLLM 自带的 API 密钥认证
3. 两者都失败时返回 401


3. 测试一下

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-P1zJMdsqCPNN54alZd_ETw' \
-d '{
    "model": "openai-model",
    "messages": [
          {
            "role": "user",
            "content": "Hey! My name is John"
          }
        ]
}'
```



#### 向上抛出自定义异常

如果想把自定义异常透出给客户端，可以通过抛出 `ProxyException` 来实现。

```python
"""
Example custom auth function.

This will allow all keys starting with "my-custom-key" to pass through.
"""

from typing import Union

from fastapi import Request

from litellm.proxy._types import UserAPIKeyAuth, ProxyException


async def user_api_key_auth(
    request: Request, api_key: str
) -> Union[UserAPIKeyAuth, str]:
    try:
        if api_key.startswith("my-custom-key"):
            return "sk-P1zJMdsqCPNN54alZd_ETw"
        if api_key == "invalid-api-key":
            # raise a custom exception back to the client
            raise ProxyException(
                message="Invalid API key",
                type="invalid_request_error",
                param="api_key",
                code=401,
            )
        else:
            raise Exception("Invalid API key")
    except Exception:
        raise Exception("Invalid API key")

```
