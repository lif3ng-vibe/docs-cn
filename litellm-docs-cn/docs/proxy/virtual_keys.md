import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 虚拟密钥
通过虚拟密钥（virtual key）为 LiteLLM 代理追踪花费，并控制模型访问。

:::info

- 🔑 [生成、编辑、删除密钥的管理界面（UI，支持 SSO）](https://docs.litellm.ai/docs/proxy/ui)
- [部署带密钥管理的 LiteLLM 代理](https://docs.litellm.ai/docs/proxy/deploy#provision-the-data-stores)
- [LiteLLM 代理 + 密钥管理所用 Dockerfile.database](https://github.com/BerriAI/litellm/blob/main/docker/Dockerfile.database)


:::

## 设置

前置要求：

- 需要一个 PostgreSQL 数据库（例如 [Supabase](https://supabase.com/)、[Neon](https://neon.tech/) 等）
- 在环境变量中设置 `DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>`
- 设置一个 `master key`（主密钥），这是你的代理管理员密钥，可以用它创建其他密钥（🚨 必须以 `sk-` 开头）。
  - **在 config.yaml 中设置**，将主密钥配置在 `general_settings:master_key` 下，示例如下
  - **设置环境变量**，设置 `LITELLM_MASTER_KEY`

（代理的 Dockerfile 会检查 `DATABASE_URL` 是否已设置，然后初始化数据库连接）

```shell
export DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
```


之后即可通过访问 `/key/generate` 端点来生成密钥。

[**查看代码**](https://github.com/BerriAI/litellm/blob/7a669a36d2689c7f7890bc9c93e04ff3c2641299/litellm/proxy/proxy_server.py#L672)

## **快速上手：生成密钥**
**步骤 1：保存 PostgreSQL 数据库 URL**

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
        model: ollama/llama2
  - model_name: {{openai_small}}
    litellm_params:
        model: ollama/llama2

general_settings: 
  master_key: os.environ/LITELLM_MASTER_KEY 
  database_url: "postgresql://<user>:<password>@<host>:<port>/<dbname>" # 👈 KEY CHANGE
```

**步骤 2：启动 LiteLLM**

```shell
litellm --config /path/to/config.yaml
```

**步骤 3：生成密钥**

```shell 
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["{{openai_small}}", "{{openai_large}}"], "metadata": {"user": "ishaan@berri.ai"}}'
```

## 密钥从其所有者继承什么

密钥的所有者是 `user_id` 指向的用户，而这个人未必是创建密钥的人。只有当调用者*不是*代理管理员时，`/key/generate` 才会自动把调用者的 `user_id` 标记到新密钥上；代理管理员必须显式传入 `user_id`，因此由管理员创建且未指定 `user_id` 的密钥没有所有者，也不会从管理员继承任何内容。在管理界面（Admin UI）中为特定用户创建的密钥，以及[服务账号密钥](./service_accounts.md)（其 `user_id` 始终为 `null`），同样遵循这一规则。

继承规则在不同权限维度上并不一致。模型访问与 MCP（Model Context Protocol）访问始终依据密钥记录本身来判定，而管理路由的访问权限由所有者用户的*角色*决定，这也是归代理管理员所有的密钥能够调用管理员端点的原因。

| 权限维度 | 密钥从所有者继承的内容 | 如何在密钥上覆盖 |
|---|---|---|
| [模型](./key_auth_arch.md) | 密钥属于团队时不继承任何内容。对于没有 `team_id` 的密钥，所有者的 `models` 列表会在密钥自身列表之上叠加生效；所有者设置了 `no-default-models` 时，团队之外的一切模型都会被拒绝 | 在密钥上设置 `models`（或设置 `all-team-models`，交由团队决定） |
| [管理路由](./access_control.md)（`/key/*`、`/user/*`、`/team/*`） | 完整继承所有者的角色。若所有者是 `proxy_admin`，所有非管理员路由限制都会被跳过，该密钥可以管理密钥、用户和团队 | 在密钥上设置 `allowed_routes`；该限制对所有角色都生效，包括管理员拥有的密钥 |
| [MCP 服务器与工具](../mcp_control.md) | 所有者的 MCP 权限只构成上限，绝不会成为授权来源；密钥的列表为空时会继承团队的服务器，除非开启了 `require_key_mcp_access_defined`。管理员身份不会带来任何 MCP 访问权限 | 设置 `object_permission.mcp_servers` / `mcp_access_groups` / `mcp_tool_permissions`，或用 `no-mcp-servers` 显式退出 |
| 预算与速率限制 | 只要所有者设置了 `tpm_limit` 和 `rpm_limit` 就会被继承；不属于团队的密钥还会继承所有者的 `max_budget` | 在密钥上设置同样的字段，或改用服务账号密钥，只应用团队层面的限制 |

## 花费追踪（Spend Tracking）

按以下维度查看花费：
- 密钥：通过 `/key/info` [Swagger](https://docs.litellm.ai/api-reference/#/key%20management/info_key_fn_key_info_get)
- 用户：通过 `/user/info` [Swagger](https://docs.litellm.ai/api-reference/#/Internal%20User%20management/user_info_user_info_get)
- 团队：通过 `/team/info` [Swagger](https://docs.litellm.ai/api-reference/#/team%20management/team_info_team_info_get)  
- ⏳ 终端用户：通过 `/end_user/info` 查看 - [终端用户成本追踪请在该 issue 下评论](https://github.com/BerriAI/litellm/issues/2633)

**费用如何计算？**

每个模型的价格存储在[这里](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)，并由 [`completion_cost`](https://github.com/BerriAI/litellm/blob/db7974f9f216ee50b53c53120d1e3fc064173b60/litellm/utils.py#L3771) 函数计算。

**如何追踪？**

密钥的花费会自动记录在 "LiteLLM_VerificationTokenTable" 中。如果密钥关联了 "user_id" 或 "team_id"，对应的花费会分别记录在 "LiteLLM_UserTable" 和 "LiteLLM_TeamTable" 中。

<Tabs>
<TabItem value="key-info" label="密钥花费">

你可以通过 `/key/info` 端点查询某个密钥的花费。

```bash
curl 'http://0.0.0.0:4000/key/info?key=<user-key>' \
     -X GET \
     -H 'Authorization: Bearer <your-master-key>'
```

当有请求打到 /completions、/chat/completions、/embeddings 时，花费（以美元计）会通过 LiteLLM 的 completion_cost() 函数自动更新。[**查看代码**](https://github.com/BerriAI/litellm/blob/1a6ea20a0bb66491968907c2bfaabb7fe45fc064/litellm/utils.py#L1654)。

**响应示例**

```python
{
    "key": "sk-tXL0wt5-lOOVK9sfY2UacA",
    "info": {
        "token": "sk-tXL0wt5-lOOVK9sfY2UacA",
        "spend": 0.0001065, # 👈 SPEND
        "expires": "2023-11-24T23:19:11.131000Z",
        "models": [
            "{{openai_small}}",
            "{{openai_large}}",
            "{{anthropic}}"
        ],
        "aliases": {
            "mistral-7b": "{{openai_small}}"
        },
        "config": {}
    }
}
```

</TabItem>
<TabItem value="user-info" label="用户花费">

**1. 创建用户**

```bash
curl --location 'http://localhost:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{user_email: "krrish@berri.ai"}' 
```

**预期响应**

```bash
{
    ...
    "expires": "2023-12-22T09:53:13.861000Z",
    "user_id": "my-unique-id", # 👈 unique id
    "max_budget": 0.0
}
```

**2. 为该用户创建密钥**

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["{{openai_small}}", "{{openai_large}}"], "user_id": "my-unique-id"}'
```

返回一个密钥，形如 `sk-...`。

**3. 查看该用户的花费**

```bash
curl 'http://0.0.0.0:4000/user/info?user_id=my-unique-id' \
     -X GET \
     -H 'Authorization: Bearer <your-master-key>'
```

预期响应

```bash
{
  ...
  "spend": 0 # 👈 SPEND
}
```

</TabItem>
<TabItem value="team-info" label="团队花费">

如果希望密钥由多人共同拥有（例如生产环境的应用），请使用团队。

**1. 创建团队**

```bash
curl --location 'http://localhost:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"team_alias": "my-awesome-team"}' 
```

**预期响应**

```bash
{
    ...
    "expires": "2023-12-22T09:53:13.861000Z",
    "team_id": "my-unique-id", # 👈 unique id
    "max_budget": 0.0
}
```

**2. 为该团队创建密钥**

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["{{openai_small}}", "{{openai_large}}"], "team_id": "my-unique-id"}'
```

返回一个密钥，形如 `sk-...`。

**3. 查看该团队的花费**

```bash
curl 'http://0.0.0.0:4000/team/info?team_id=my-unique-id' \
     -X GET \
     -H 'Authorization: Bearer <your-master-key>'
```

预期响应

```bash
{
  ...
  "spend": 0 # 👈 SPEND
}
```

</TabItem>
</Tabs>


## 模型别名（Model Aliases）

如果用户会使用某个指定模型（例如 gpt-5.6-luna），而你想：

- 尝试升级这次请求（例如改用 gpt-5.6-terra）
- 或者降级这次请求（例如改用 Mistral）

可以这样实现：

**步骤 1：在 config.yaml 中创建模型组**（保存模型名、API 密钥等）

```yaml
model_list:
  - model_name: my-free-tier
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8001
  - model_name: my-free-tier
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8002
  - model_name: my-free-tier
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8003
  - model_name: my-paid-tier
    litellm_params:
        model: {{openai_large}}
        api_key: my-api-key
```

**步骤 2：生成密钥**

```bash
curl -X POST "https://0.0.0.0:4000/key/generate" \
-H "Authorization: Bearer <your-master-key>" \
-H "Content-Type: application/json" \
-d '{
	"models": ["my-free-tier"], 
	"aliases": {"{{openai_small}}": "my-free-tier"}, # 👈 KEY CHANGE
	"duration": "30min"
}'
```

- **升级 / 降级请求的方法**：修改别名映射即可

**步骤 3：测试密钥**

```bash
curl -X POST "http://0.0.0.0:4000/chat/completions" \
-H "Authorization: Bearer <user-key>" \
-H "Content-Type: application/json" \
-d '{
    "model": "{{openai_small}}", 
    "messages": [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ]
}'
```


## 高级用法

### 在自定义请求头中传递 LiteLLM 密钥

此配置会让 LiteLLM 代理在自定义请求头中查找虚拟密钥，而不是默认的 "Authorization" 请求头

**步骤 1** 在 litellm 的 config.yaml 中定义 `litellm_key_header_name`

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings: 
  master_key: os.environ/LITELLM_MASTER_KEY 
  litellm_key_header_name: "X-Litellm-Key" # 👈 Key Change

```

**步骤 2** 测试

在此请求中，LiteLLM 会使用 `X-Litellm-Key` 请求头中的虚拟密钥

<Tabs>
<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Litellm-Key: Bearer $LITELLM_API_KEY" \
  -H "Authorization: Bearer bad-key" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
  }'
```

**预期响应**

由于 `X-Litellm-Key` 中传入的密钥有效，你会看到 LiteLLM 代理返回成功响应
```shell
{"id":"chatcmpl-f9b2b79a7c30477ab93cd0e717d1773e","choices":[{"finish_reason":"stop","index":0,"message":{"content":"\n\nHello there, how may I assist you today?","role":"assistant","tool_calls":null,"function_call":null}}],"created":1677652288,"model":"{{openai_small}}","object":"chat.completion","system_fingerprint":"fp_44709d6fcb","usage":{"completion_tokens":12,"prompt_tokens":9,"total_tokens":21}
```

</TabItem>

<TabItem value="python" label="OpenAI Python SDK">

```python
client = openai.OpenAI(
    api_key="not-used",
    base_url="https://api-gateway-url.com/llmservc/api/litellmp",
    default_headers={
        "Authorization": f"Bearer {API_GATEWAY_TOKEN}", # (optional) For your API Gateway
        "X-Litellm-Key": f"Bearer sk-<your-litellm-api-key>"              # For LiteLLM Proxy
    }
)
```
</TabItem>
</Tabs>

### 用密钥哈希覆写传出的 `user` 字段

:::info

该功能在 `v1.95.0` 及更高版本可用。

:::

许多提供商使用请求中的终端用户标识（即 `user` 字段）来监测和发现滥用行为，并把活动追溯到具体终端用户，这样单个用户的滥用就不太可能影响整个组织的访问。由于该字段由调用方设置，客户端可以随意更改它，使自己的活动与某个身份脱钩。当你希望提供商看到的 `user` 是一个与发起调用的 LiteLLM 密钥绑定的、稳定且不可篡改的标识时，请开启 `overwrite_user_with_key_hash`，这样无论客户端发送了什么，提供商侧基于 `user` 的处理都能对应到唯一一把密钥。

开启后，代理会把 chat/completions 请求传出的 `user` 强制设置为调用密钥的身份：始终覆盖请求体里的任何 `user`，即使客户端没有传 `user` 也会补上。对虚拟密钥而言，该值是密钥的 sha256 令牌哈希，与花费日志中存储的 `user_api_key_hash` 相同，因此无需任何额外配置就能把提供商可见的 id 对应回某把密钥及其所有者。对用主密钥认证的请求，该值是固定别名 `litellm_proxy_master_key`，主密钥本身及其哈希都不会被转发。

该开关默认关闭，只影响代理自行验证的密钥（虚拟密钥和主密钥）。无论虚拟密钥是否关联用户、是否挂在团队之下，行为都一样：标记值始终是密钥哈希。由自定义认证处理器或 JWT 认证的请求则不做改动；开关关闭时，调用方提供的 `user` 原样保留，现有行为不变。

```yaml
litellm_settings:
  overwrite_user_with_key_hash: true
```

请求自带 `user` 时，该值会在调用分发前被替换：

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-virtual-key" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "hi"}],
    "user": "anything-the-client-sends"
  }'
```

提供商收到的 `user` 是密钥的 sha256 哈希（例如 `98e983...6401`），而不是 `anything-the-client-sends`。

:::info

`user` 值是否会随请求送达提供商，取决于各提供商的既有行为，本设置不会改变这一点。有些提供商原样转发 `user`，有些会映射到它们自己的终端用户字段，有些则直接丢弃；此开关只控制 LiteLLM 设置的值，不控制某个提供商是否真的传输它。

:::

### 启用/停用虚拟密钥

**停用密钥**

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/block' \
-H 'Authorization: Bearer LITELLM_MASTER_KEY' \
-H 'Content-Type: application/json' \
-d '{"key": "KEY-TO-BLOCK"}'
```

预期响应：

```bash
{
  ...
  "blocked": true
}
```

**启用密钥**

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/unblock' \
-H 'Authorization: Bearer LITELLM_MASTER_KEY' \
-H 'Content-Type: application/json' \
-d '{"key": "KEY-TO-UNBLOCK"}'
```


```bash
{
  ...
  "blocked": false
}
```


### 自定义 /key/generate

如果你需要在生成代理 API 密钥之前添加自定义逻辑（例如校验 `team_id`）

#### 1. 编写自定义 `custom_generate_key_fn`


custom_generate_key_fn 函数的入参只有一个：`data`（[类型：GenerateKeyRequest](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_types.py#L125)）

你的 `custom_generate_key_fn` 应返回一个具有如下结构的字典：
```python
{
    "decision": False,
    "message": "This violates LiteLLM Proxy Rules. No team id provided.",
}

```

- decision（类型：bool）：布尔值，表示是否允许生成密钥（True 为允许，False 为不允许）。

- message（类型：str，可选）：可选的补充信息，用来说明该决定。当 decision 为 False 时会包含此字段。


```python
async def custom_generate_key_fn(data: GenerateKeyRequest)-> dict:
        """
        Asynchronous function for generating a key based on the input data.

        Args:
            data (GenerateKeyRequest): The input data for key generation.

        Returns:
            dict: A dictionary containing the decision and an optional message.
            {
                "decision": False,
                "message": "This violates LiteLLM Proxy Rules. No team id provided.",
            }
        """
        
        # decide if a key should be generated or not
        print("using custom auth function!")
        data_json = data.json()  # type: ignore

        # Unpacking variables
        team_id = data_json.get("team_id")
        duration = data_json.get("duration")
        models = data_json.get("models")
        aliases = data_json.get("aliases")
        config = data_json.get("config")
        spend = data_json.get("spend")
        user_id = data_json.get("user_id")
        max_parallel_requests = data_json.get("max_parallel_requests")
        metadata = data_json.get("metadata")
        tpm_limit = data_json.get("tpm_limit")
        rpm_limit = data_json.get("rpm_limit")

        if team_id is not None and team_id == "litellm-core-infra@gmail.com":
            # only team_id="litellm-core-infra@gmail.com" can make keys
            return {
                "decision": True,
            }
        else:
            print("Failed custom auth")
            return {
                "decision": False,
                "message": "This violates LiteLLM Proxy Rules. No team id provided.",
            }
```


#### 2. 传入文件路径（相对于 config.yaml）

把文件路径配置到 config.yaml 中

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
  custom_key_generate: custom_auth.custom_generate_key_fn
```

:::warning

`custom_key_generate` 只在 `/key/generate` 上运行。编辑密钥的操作（`/key/update`、`/key/bulk_update`、`/team/key/bulk_update`，以及在管理界面中编辑密钥，后者调用的是 `/key/update`）都不会触发它，因此用户可以先创建一个合规的密钥，再通过编辑使其不再合规，比如移除过期时间。如果你希望策略在编辑时同样生效，请同时设置 [`custom_key_update`](#自定义-keyupdate)；或者使用 [`custom_key_policy`](#自定义密钥策略一个钩子覆盖所有密钥操作)，这是推荐的单一钩子，可在包括重新生成在内的每次密钥操作上运行。

:::

### 自定义 /key/update

如果你通过 `custom_key_generate` 强制执行某项策略，请设置 `custom_key_update`，以便在密钥被编辑时继续执行该策略。它会在 `/key/update`、`/key/bulk_update` 和 `/team/key/bulk_update` 上运行。管理界面的编辑密钥流程会调用 `/key/update`，因此从界面上发起的编辑同样被覆盖。若想要一个覆盖生成、更新和重新生成、基于合并后密钥状态的钩子，请参见 [`custom_key_policy`](#自定义密钥策略一个钩子覆盖所有密钥操作)。

#### 1. 编写自定义 `custom_update_key_fn`

`custom_update_key_fn` 函数的入参只有一个：`data`（[类型：UpdateKeyRequest](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_types.py)）

返回值约定与 `custom_generate_key_fn` 相同：返回 `{"decision": True}` 表示允许此次更新，返回 `{"decision": False, "message": "..."}` 表示拒绝。被拒绝的更新会以 `403` 失败。

更新请求只包含被修改的字段，因此某个字段未出现意味着"保持不变"，而不是"清除"。请用 `data.model_fields_set` 区分"字段未传"与"显式设置为 `None`"。例如，在管理界面把密钥改为"永不过期"时，界面会发送 `duration: null`，下面的函数会拒绝这种情况。

```python
from litellm.proxy._types import UpdateKeyRequest


async def custom_update_key_fn(data: UpdateKeyRequest) -> dict:
    """
    Asynchronous function that decides if a key update should be allowed.

    Args:
        data (UpdateKeyRequest): The requested changes to the key.

    Returns:
        dict: A dictionary containing the decision and an optional message.
    """
    if "duration" in data.model_fields_set and data.duration is None:
        return {
            "decision": False,
            "message": "This violates LiteLLM Proxy Rules. Keys must keep an expiration date.",
        }
    return {"decision": True}
```

- message（类型：str，可选）：可选的消息，提供关于该决定的补充信息。当 decision 为 False 时会包含该字段。


```python
async def custom_generate_key_fn(data: GenerateKeyRequest)-> dict:
        """
        Asynchronous function for generating a key based on the input data.

        Args:
            data (GenerateKeyRequest): The input data for key generation.

        Returns:
            dict: A dictionary containing the decision and an optional message.
            {
                "decision": False,
                "message": "This violates LiteLLM Proxy Rules. No team id provided.",
            }
        """
        
        # decide if a key should be generated or not
        print("using custom auth function!")
        data_json = data.json()  # type: ignore

        # Unpacking variables
        team_id = data_json.get("team_id")
        duration = data_json.get("duration")
        models = data_json.get("models")
        aliases = data_json.get("aliases")
        config = data_json.get("config")
        spend = data_json.get("spend")
        user_id = data_json.get("user_id")
        max_parallel_requests = data_json.get("max_parallel_requests")
        metadata = data_json.get("metadata")
        tpm_limit = data_json.get("tpm_limit")
        rpm_limit = data_json.get("rpm_limit")

        if team_id is not None and team_id == "litellm-core-infra@gmail.com":
            # only team_id="litellm-core-infra@gmail.com" can make keys
            return {
                "decision": True,
            }
        else:
            print("Failed custom auth")
            return {
                "decision": False,
                "message": "This violates LiteLLM Proxy Rules. No team id provided.",
            }
```


#### 2. 传入文件路径（相对于 config.yaml）

把文件路径配置到 config.yaml 中

例如两者都在同一目录（`./config.yaml` 和 `./custom_auth.py`）时，配置如下：
```yaml
model_list: 
  - model_name: "openai-model"
    litellm_params: 
      model: "{{openai_small}}"

litellm_settings:
  drop_params: True
  set_verbose: True

general_settings:
  custom_key_generate: custom_auth.custom_generate_key_fn
```

:::warning

`custom_key_generate` 只在 `/key/generate` 时运行。密钥编辑（`/key/update`、`/key/bulk_update`、`/team/key/bulk_update`，以及在 Admin UI 中编辑密钥，其调用的是 `/key/update`）都不会经过它，因此用户可以先创建一个合规的密钥，再把它改得不合规，比如去掉过期时间。如果策略在编辑时也要生效，请同时设置 [`custom_key_update`](#自定义-keyupdate)；或者使用 [`custom_key_policy`](#自定义密钥策略一个钩子覆盖所有密钥操作)，这是推荐做法，一个钩子即可覆盖包括重新生成在内的所有密钥操作。

:::

### 自定义 /key/update

如果你用 `custom_key_generate` 强制执行某项策略，请设置 `custom_key_update`，让密钥被编辑时策略继续生效。它作用于 `/key/update`、`/key/bulk_update` 和 `/team/key/bulk_update`。Admin UI 的编辑密钥流程调用 `/key/update`，因此从 UI 发起的编辑同样被覆盖。如果想要一个钩子基于合并后的密钥状态同时覆盖生成、更新和重新生成，参见 [`custom_key_policy`](#自定义密钥策略一个钩子覆盖所有密钥操作)。

#### 1. 编写自定义 `custom_update_key_fn`

`custom_update_key_fn` 函数的输入是单个参数：`data`（[类型：UpdateKeyRequest](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_types.py)）

输出约定与 `custom_generate_key_fn` 相同：返回 `{"decision": True}` 表示允许更新，返回 `{"decision": False, "message": "..."}` 表示拒绝。被拒绝的更新会以 `403` 失败。

更新请求只包含被修改的字段，因此未设置的字段含义是"保持不变"，而不是"清除"。用 `data.model_fields_set` 区分字段是被省略，还是被显式设为 `None`。例如，把密钥改成"永不过期"时，Admin UI 会发送 `duration: null`，下面的函数会拒绝这种修改。

```python
from litellm.proxy._types import UpdateKeyRequest


async def custom_update_key_fn(data: UpdateKeyRequest) -> dict:
    """
    Asynchronous function that decides if a key update should be allowed.

    Args:
        data (UpdateKeyRequest): The requested changes to the key.

    Returns:
        dict: A dictionary containing the decision and an optional message.
    """
    if "duration" in data.model_fields_set and data.duration is None:
        return {
            "decision": False,
            "message": "This violates LiteLLM Proxy Rules. Keys must keep an expiration date.",
        }
    return {"decision": True}
```

#### 2. 传入文件路径（相对于 config.yaml）

```yaml
general_settings:
  custom_key_generate: custom_auth.custom_generate_key_fn
  custom_key_update: custom_auth.custom_update_key_fn
```

### 自定义密钥策略（一个钩子覆盖所有密钥操作）

`custom_key_generate` 与 `custom_key_update` 各自只能看到自己端点的原始请求，因此像"所有密钥必须在七天内过期"这样的规则得写两遍，而且这两个钩子既看不到正在被修改的密钥，也看不到相对 `duration` 换算出的绝对过期时间。`custom_key_policy` 是一个作用于所有密钥操作的钩子，同时接收操作类型和生效后的密钥状态：现有密钥与请求修改合并后的结果，相对 `duration` 已换算为绝对 `expires`。规则只需写一遍，无论哪个端点或哪个 Admin UI 操作改动了密钥，它都成立。

#### 1. 编写自定义 `custom_key_policy_fn`

输入是单个参数 `policy_request`。`policy_request.operation` 的取值是 `"generate"`、`"update"` 或 `"regenerate"`。`policy_request.existing_key` 是当前存储的密钥行，生成操作时为 `None`。`policy_request.effective_key` 是操作执行后将写入的密钥行：在现有值上叠加请求的修改，`duration` 已换算为 `expires`，`budget_duration` 换算为 `budget_reset_at`，`organization_id` 换算为 `org_id`，`tags`、`guardrails` 等元数据风格的请求字段并入 `metadata`。`policy_request.request` 是收到的原始请求体，与旧式钩子拿到的是同一个对象，适合需要相对时长字符串的规则。

输出约定与 `custom_generate_key_fn` 相同：返回 `{"decision": True}` 允许操作，返回 `{"decision": False, "message": "..."}` 拒绝操作。被拒绝的操作以 `403` 失败，并携带该消息。

这个策略把每把密钥的有效期都限制在从现在起的七天内。`effective_key.expires` 是绝对的 UTC 时间，永不过期的密钥为 `None`，因此同一条检查逻辑对新密钥、延长 `duration` 的编辑以及重新生成都成立。

```python
from datetime import datetime, timedelta, timezone

MAX_KEY_LIFETIME = timedelta(days=7)


async def custom_key_policy_fn(policy_request) -> dict:
    expires = policy_request.effective_key.expires
    if expires is None or expires > datetime.now(timezone.utc) + MAX_KEY_LIFETIME:
        return {
            "decision": False,
            "message": f"This violates LiteLLM Proxy Rules. Keys must expire within {MAX_KEY_LIFETIME.days} days.",
        }
    return {"decision": True}
```

#### 2. 传入文件路径（相对于 config.yaml）

```yaml
general_settings:
  custom_key_policy: custom_auth.custom_key_policy_fn
```

该钩子作用于 `/key/generate`、`/key/service-account/generate`、`/key/update`、`/key/bulk_update`、`/team/key/bulk_update` 和 `/key/{key}/regenerate`，覆盖 Admin UI 的创建、编辑和重新生成密钥流程。它在请求校验之后运行，生成场景下在 `default_key_generate_params` 与 `upperbound_key_generate_params` 应用之后、密钥写入之前运行，因此只要策略放行，`effective_key` 就是数据库最终会保存的内容。

`custom_key_generate` 与 `custom_key_update` 保持原有行为不变。若与 `custom_key_policy` 同时配置，它们先基于原始请求运行，且各自都可以独立拒绝；随后策略再基于生效后的密钥状态运行。三者可以同时设置：

```yaml
general_settings:
  custom_key_generate: custom_auth.custom_generate_key_fn
  custom_key_update: custom_auth.custom_update_key_fn
  custom_key_policy: custom_auth.custom_key_policy_fn
```

### 强制 key_alias 命名模式

把 `litellm_settings.key_alias_pattern` 设为一个正则表达式后，发送到 `/key/generate`、`/key/service-account/generate`、`/key/update` 和 `/key/{key}/regenerate` 的每个 `key_alias` 都必须匹配它，覆盖 Admin UI 的创建、编辑和重新生成密钥流程。整个别名必须完整匹配（Python `re.fullmatch`），因此 `team-[a-z]+` 接受 `team-search`、拒绝 `team-search-2`。在模式执行前，别名长度上限为 255 字符，因此回溯严重的模式也不会遇到无上限的别名。

```yaml
litellm_settings:
  key_alias_pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
```

别名不匹配的请求会以 `400` 失败，报错信息中会指出该模式：

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"key_alias": "Prod Key"}'
```

```json
{"error": {"message": "Invalid key_alias format. Must be at most 255 characters and match the configured key_alias_pattern: ^[a-z0-9]+(-[a-z0-9]+)*$", "type": "bad_request_error", "param": "key_alias", "code": "400"}}
```

`key_alias_pattern` 取代 `enable_key_alias_format_validation` 开启的内置规则，两者只需设置其一。`key_alias` 保持不变的更新或重新生成不会被检查，因此在配置模式之前命名的密钥仍然可以编辑，而别名一旦变化，模式立即生效。无论模式允许什么，别名中的路径穿越字符和控制字符都会被拒绝。无法编译的正则会导致代理启动失败，报错 `Invalid regex set for litellm_settings.key_alias_pattern`。

### /key/generate 参数上限

如果你需要为每把密钥的 `max_budget`、`budget_duration` 或任何 `key/generate` 参数设置默认上限，可以使用此功能。

设置 `litellm_settings:upperbound_key_generate_params`：
```yaml
litellm_settings:
  upperbound_key_generate_params:
    max_budget: 100 # Optional[float], optional): upperbound of $100, for all /key/generate requests
    budget_duration: "10d" # Optional[str], optional): upperbound of 10 days for budget_duration values
    duration: "30d" # Optional[str], optional): upperbound of 30 days for all /key/generate requests
    max_parallel_requests: 1000 # (Optional[int], optional): Max number of requests that can be made in parallel. Defaults to None.
    tpm_limit: 1000 #(Optional[int], optional): Tpm limit. Defaults to None.
    rpm_limit: 1000 #(Optional[int], optional): Rpm limit. Defaults to None.
```

**预期行为**

- 发送一个 `max_budget=200` 的 `/key/generate` 请求
- 请求被拒绝，返回 HTTP 400：`max_budget is over max limit set in config - user_value=200; max_value=100`。超出上限的值不会被自动钳到上限。同样的规则适用于 `max_parallel_requests`、`tpm_limit`、`rpm_limit`，以及超过配置上限的 `duration` / `budget_duration`
- 不传 `budget_duration` 或传 `null`：密钥会以 `budget_duration="10d"` 创建。上限同时充当默认值，无法被单独关闭

### /key/generate 默认参数

如果你需要控制每把密钥的默认 `max_budget` 或任何 `key/generate` 参数，可以使用此功能。

当 `/key/generate` 请求未指定 `max_budget` 时，会使用 `default_key_generate_params` 中指定的 `max_budget`。这些默认值会填充请求中缺失或为 `null` 的字段。唯一的例外是 `budget_duration`：显式发送 `"budget_duration": null` 会创建一个预算永不重置的密钥，跳过配置的默认值（`upperbound_key_generate_params` 仍然生效）。

设置 `litellm_settings:default_key_generate_params`：
```yaml
litellm_settings:
  default_key_generate_params:
    max_budget: 1.5000
    models: ["azure-gpt-3.5"]
    duration:     # blank means `null`
    metadata: {"setting":"default"}
    team_id: "core-infra"
```

### ✨ 密钥轮换

<EnterpriseFeature />

轮换现有的 API 密钥，同时可选择更新其参数。

```bash

curl 'http://localhost:4000/key/sk-<virtual-key>/regenerate' \
  -X POST \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "max_budget": 100,
    "metadata": {
      "team": "core-infra"
    },
    "models": [
      "{{openai_large}}",
      "{{openai_small}}"
    ],
    "grace_period": "48h"
  }'

```

**宽限期**（可选）：设置 `grace_period`（例如 `"24h"`、`"2d"`、`"1w"`）可让旧密钥在过渡期内继续有效。宽限期结束前新旧密钥都可用，因此可以平滑切换，不影响生产。省略或留空表示立即吊销。也可以通过环境变量 `LITELLM_KEY_ROTATION_GRACE_PERIOD` 为定时轮换设置。

**延伸阅读**

- [把轮换后的密钥写入密钥管理器](https://docs.litellm.ai/docs/secret#aws-secret-manager)

[**👉 API 参考文档**](https://docs.litellm.ai/api-reference/#/key%20management/regenerate_key_fn_key__key__regenerate_post)


### 定时密钥轮换

LiteLLM 可以按你定义的时间间隔**自动轮换虚拟密钥**。

#### 前置条件

1. **需要数据库连接**：密钥轮换需要已连接的数据库来记录轮换计划
2. **启用轮换工作进程**：设置环境变量 `LITELLM_KEY_ROTATION_ENABLED=true`
3. **配置检查间隔**：可选设置 `LITELLM_KEY_ROTATION_CHECK_INTERVAL_SECONDS`（默认：86400 秒，即 24 小时）

#### 工作原理

1. 创建虚拟密钥时，设置 `auto_rotate: true` 和 `rotation_interval`（时长字符串）
2. LiteLLM 把下一次轮换时间计算为 `now + rotation_interval`，并存入数据库
3. 后台任务定期检查轮换时间已过的密钥
4. 密钥到期待轮换时，LiteLLM 自动重新生成它，并使旧密钥字符串失效
5. 然后计算新的轮换时间，循环继续

#### 创建支持自动轮换的密钥

**API**
```bash
curl 'http://0.0.0.0:4000/key/generate' \
  -H 'Authorization: Bearer <your-master-key>' \
  -H 'Content-Type: application/json' \
  -d '{
        "models": ["{{openai_large}}"],
        "auto_rotate": true,
        "rotation_interval": "30d"
      }'
```

**LiteLLM UI**

在 LiteLLM UI 中，进入 Keys 页面，依次点击 `Create New Key` > `Optional Settings` > `Key Lifecycle` > `Auto-Rotation Settings` > `Enable Auto-Rotation`
<Image 
  img={require('../../img/key_r.png')}
  dark={require('../../img/key_r_dark.png')}
  alt="密钥表单中 Key Lifecycle 区域的 Auto-Rotation Settings"
  style={{maxWidth: '640px', display: 'block', margin: '0'}}
/>

**rotation_interval 的合法格式：**
- `"30s"` - 30 秒
- `"30m"` - 30 分钟
- `"30h"` - 30 小时
- `"30d"` - 30 天
- `"90d"` - 90 天

#### 更新现有密钥以启用轮换

**API**

```bash
curl 'http://0.0.0.0:4000/key/update' \
  -H 'Authorization: Bearer <your-master-key>' \
  -H 'Content-Type: application/json' \
  -d '{
        "key": "sk-existing-key",
        "auto_rotate": true,
        "rotation_interval": "90d"
      }'
```

**LiteLLM UI**

在 LiteLLM UI 中，进入 Keys 页面。选中要更新的密钥，点击 `Edit Settings` > `Auto-Rotation Settings`

<Image 
  img={require('../../img/key_u.png')}
  dark={require('../../img/key_u_dark.png')}
  alt="密钥编辑表单中的 Auto-Rotation Settings"
  style={{maxWidth: '640px', display: 'block', margin: '0'}}
/>

#### 环境变量

启动代理时设置以下环境变量：

| 变量 | 说明 | 默认值 |
|----------|-------------|---------|
| `LITELLM_KEY_ROTATION_ENABLED` | 启用轮换工作进程 | `false` |
| `LITELLM_KEY_ROTATION_CHECK_INTERVAL_SECONDS` | 扫描待轮换密钥的频率（秒） | `86400`（24 小时） |
| `LITELLM_KEY_ROTATION_GRACE_PERIOD` | 轮换后旧密钥保持有效的时长（如 `24h`、`2d`） | `""`（立即吊销） |

**示例：**
```bash
export LITELLM_KEY_ROTATION_ENABLED=true
export LITELLM_KEY_ROTATION_CHECK_INTERVAL_SECONDS=3600  # Check every hour
export LITELLM_KEY_ROTATION_GRACE_PERIOD=48h  # Keep old key valid for 48h during cutover

litellm --config config.yaml
```

### 临时提高预算

使用 `/key/update` 端点可以提高现有密钥的预算。`temp_budget_expiry` 是日期时间而非时长字符串，因此请传入 `2026-10-15` 这样的 ISO 日期。详情参见[临时提高预算](./temporary_budget_increase.md)。

```bash
curl -L -X POST 'http://localhost:4000/key/update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"key": "sk-b3Z3Lqdb_detHXSUp4ol4Q", "temp_budget_increase": 100, "temp_budget_expiry": "2026-10-15"}'
```

[API 参考](https://docs.litellm.ai/api-reference/#/key%20management/update_key_fn_key_update_post)


### 限制密钥生成

用于控制谁可以生成密钥。当你允许其他人在 UI 上创建密钥时，这个功能很有用。

```yaml
litellm_settings:
  key_generation_settings:
    team_key_generation:
      allowed_team_member_roles: ["admin"]
      required_params: ["tags"] # require team admins to set tags for cost-tracking when generating a team key
    personal_key_generation: # maps to 'Default Team' on UI 
      allowed_user_roles: ["proxy_admin"]
```

#### 规格说明

```python
key_generation_settings: Optional[StandardKeyGenerationConfig] = None
```

#### 类型定义

```python
class StandardKeyGenerationConfig(TypedDict, total=False):
    team_key_generation: TeamUIKeyGenerationConfig
    personal_key_generation: PersonalUIKeyGenerationConfig

class TeamUIKeyGenerationConfig(TypedDict):
    allowed_team_member_roles: List[str] # either 'user' or 'admin'
    required_params: List[str] # require params on `/key/generate` to be set if a team key (team_id in request) is being generated


class PersonalUIKeyGenerationConfig(TypedDict):
    allowed_user_roles: List[LitellmUserRoles] 
    required_params: List[str] # require params on `/key/generate` to be set if a personal key (no team_id in request) is being generated


class LitellmUserRoles(str, enum.Enum):
    """
    Admin Roles:
    PROXY_ADMIN: admin over the platform
    PROXY_ADMIN_VIEW_ONLY: can login, view all own keys, view all spend
    ORG_ADMIN: admin over a specific organization, can create teams, users only within their organization

    Internal User Roles:
    INTERNAL_USER: can login, view/create/delete their own keys, view their spend
    INTERNAL_USER_VIEW_ONLY: can login, view their own keys, view their own spend


    Team Roles:
    TEAM: used for JWT auth


    Customer Roles:
    CUSTOMER: External users -> these are customers

    """

    # Admin Roles
    PROXY_ADMIN = "proxy_admin"
    PROXY_ADMIN_VIEW_ONLY = "proxy_admin_viewer"

    # Organization admins
    ORG_ADMIN = "org_admin"

    # Internal User Roles
    INTERNAL_USER = "internal_user"
    INTERNAL_USER_VIEW_ONLY = "internal_user_viewer"

    # Team Roles
    TEAM = "team"

    # Customer Roles - External users of proxy
    CUSTOMER = "customer"
```


## **后续步骤：为每个虚拟密钥设置预算与速率限制**

[查看这篇文档，了解如何用 LiteLLM 为每个虚拟密钥设置预算与限流](users)

## 端点参考（规格）

### 密钥

#### [**👉 API 参考文档**](https://docs.litellm.ai/api-reference/#/key%20management/)

### 用户

#### [**👉 API 参考文档**](https://docs.litellm.ai/api-reference/#/Internal%20User%20management/)


### 团队

#### [**👉 API 参考文档**](https://docs.litellm.ai/api-reference/#/team%20management)
