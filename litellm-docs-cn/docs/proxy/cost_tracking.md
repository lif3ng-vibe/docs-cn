import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 花费追踪

追踪 100 多个 LLM 上密钥、用户与团队的花费。

LiteLLM 会自动追踪所有已知模型的花费。参见[模型成本对照表（model cost map）](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)

当响应中带有档位元数据时，会自动套用提供商专属的成本追踪（cost tracking）逻辑，例如 [Vertex AI PayGo / 优先级定价](../providers/vertex.md#paygo--优先级成本追踪)、[Bedrock 服务层级](../providers/bedrock.md#用法---服务层级)、[Azure 基础模型映射](./custom_pricing.md#设置-base_model-以追踪成本例如-azure-部署)。

:::tip[保持定价数据更新]
[从 GitHub 同步模型定价数据](./sync_models_github.md)，确保成本追踪准确无误。
:::

:::info[成本与提供商账单对不上？]
按照[排查成本偏差](../troubleshoot/cost_discrepancy)中的分步流程处理：先对齐时间范围，再比较各类 token 数（包括缓存），最后判断差额出在数据采集、计算公式还是模型定价表。
:::

### 如何用 LiteLLM 追踪花费

**第 1 步**

👉 [配置 LiteLLM 并连接数据库](https://docs.litellm.ai/docs/proxy/virtual_keys#setup)

**第 2 步** 发送 `/chat/completions` 请求

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python title="Send Request with Spend Tracking" showLineNumbers
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="llama3",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    user="palantir", # OPTIONAL: pass user to track spend by user
    extra_body={
        "metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"] # ENTERPRISE: pass tags to track spend by tags
        }
    }
)

print(response)
```

</TabItem>

<TabItem value="Curl" label="Curl 请求">

在请求体中传入 `metadata`

```shell title="Curl Request with Spend Tracking" showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data '{
    "model": "llama3",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "user": "palantir", # OPTIONAL: pass user to track spend by user
    "metadata": {
        "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"] # ENTERPRISE: pass tags to track spend by tags
    }
}'
```

</TabItem>
<TabItem value="langchain" label="Langchain">

```python title="Langchain with Spend Tracking" showLineNumbers
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage
import os

os.environ["OPENAI_API_KEY"] = "sk-<your-api-key>"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "llama3",
    user="palantir",
    extra_body={
        "metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"] # ENTERPRISE: pass tags to track spend by tags
        }
    }
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

**第 3 步：验证花费已被记录**
就这么简单。现在来验证你的花费是否已被记录

<Tabs>
<TabItem value="curl" label="响应头">

在响应头中可以看到带计算成本的 `x-litellm-response-cost`

<Image img={require('../../img/response_cost_img.png')} />

</TabItem>
<TabItem value="db" label="数据库 + UI">

以下花费信息会被记录到 `LiteLLM_SpendLogs` 表中

```json title="Spend Log Entry Format" showLineNumbers
{
  "api_key": "fe6b0cab4ff5a5a8df823196cc8a450*****",                            # Hash of API Key used
  "user": "default_user",                                                       # Internal User (LiteLLM_UserTable) that owns `api_key=sk-<your-litellm-api-key>`.
  "team_id": "e8d1460f-846c-45d7-9b43-55f3cc52ac32",                            # Team (LiteLLM_TeamTable) that owns `api_key=sk-<your-litellm-api-key>`
  "request_tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"],# Tags sent in request
  "end_user": "palantir",                                                       # Customer - the `user` sent in the request
  "model_group": "llama3",                                                      # "model" passed to LiteLLM
  "api_base": "https://api.groq.com/openai/v1/",                                # "api_base" of model used by LiteLLM
  "spend": 0.000002,                                                            # Spend in $
  "total_tokens": 100,
  "completion_tokens": 80,
  "prompt_tokens": 20,
  "metadata": {
    "attempted_fallbacks": 0,                                                    # 0 = requested model group served the request
    "original_model_group": "llama3"                                             # Model group originally requested
  }

}
```

打开 LiteLLM UI（位于 https://your-proxy-endpoint/ui）上的 Usage 标签页，确认花费已记录在 `Usage` 下方

<Image img={require('../../img/admin_ui_spend.png')} />

</TabItem>
</Tabs>

### 计价为 $0 的请求

如果请求带回了用量，但在一个定价条目含非零费率的模型上计价结果却是 `$0`，这条记录仍会以 `spend = 0` 写入 `LiteLLM_SpendLogs`；LiteLLM 会在两处对此打上标记，让差额显形，而不是被悄悄少计费用

- 代理日志中会多出一行 `WARNING`，写明模型组、该部署的定价条目以及缺失的定价键，例如 `pricing entry '<model_id>' has no input_cost_per_token, output_cost_per_token`
- Prometheus 计数器 `litellm_zero_cost_requests_total`，带有 `requested_model`、`model`、`model_id`、`api_provider` 和 `reason`（取值为 `missing_pricing_key`、`pricing_not_applied` 或 `cost_calculation_error`）标签，可据此配置告警（参见 [Prometheus 指标](prometheus#请求计数指标)）

免费模型（请求用到的每项费率均为 `0`）以及不带用量信息的请求不会被标记。要修复 `missing_pricing_key`，可以在部署的 `model_info` 或模型成本对照表中补齐缺失的费率；也可以把所有费率都设为 `0`，将模型标记为免费

### 允许非代理管理员访问 `/spend` 端点 {#spend-list-endpoints-spendkeys-and-spendusers}

当你希望非代理管理员也能访问 `/spend` 端点时，使用此功能

:::info

预约[与我们洽谈，获取企业版许可](https://enterprise.litellm.ai/demo)

:::

##### 创建密钥

创建密钥时带上 `permissions={"get_spend_routes": true}`

```shell title="Generate Key with Spend Route Permissions" showLineNumbers
curl --location 'http://0.0.0.0:4000/key/generate' \
        --header "Authorization: Bearer $LITELLM_API_KEY" \
        --header 'Content-Type: application/json' \
        --data '{
            "permissions": {"get_spend_routes": true}
    }'
```

##### 在 `/spend` 端点上使用生成的密钥

使用刚生成的密钥访问花费路由

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-06-30' \
  -H 'Authorization: Bearer sk-H16BKvrSNConSsBYLGc_7A'
```

#### 重置团队与 API 密钥花费（仅限主密钥）

在以下场景使用 `/global/spend/reset`：

- 重置所有 API 密钥与团队的花费。`LiteLLM_TeamTable` 和 `LiteLLM_VerificationToken` 中所有团队与密钥的 `spend` 都会被置为 `spend=0`

- 出于审计目的，LiteLLM 会把全部日志保留在 `LiteLLMSpendLogs` 中

##### 请求

只有你设置的 `LITELLM_MASTER_KEY` 才能访问该路由

```shell
curl -X POST \
  'http://localhost:4000/global/spend/reset' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json'
```

##### 预期响应

```shell
{"message":"Spend for all API Keys and Teams reset successfully","status":"success"}
```

## 每个用户的总花费

假设你一直在为终端用户签发密钥，并在密钥上设置了对应的 `user_id`，就可以查询他们的用量。

```shell title="Get User Spend - API Request" showLineNumbers
curl -L -X GET 'http://localhost:4000/user/info?user_id=jane_smith' \
-H 'Authorization: Bearer sk-...'
```

```json title="Total for a user API Response" showLineNumbers
{
  "user_id": "jane_smith",
  "user_info": {
    "spend": 0.1
  },
  "keys": [
    {
      "token": "6e952b0efcafbb6350240db25ed534b4ec6011b3e1ba1006eb4f903461fd36f6",
      "key_name": "sk-...KE_A",
      "key_alias": "user-01882d6b-e090-776a-a587-21c63e502670-01983ddb-872f-71a3-8b3a-f9452c705483",
      "soft_budget_cooldown": false,
      "spend": 0.1,
      "expires": "2025-07-31T19:14:13.968000+00:00",
      "models": [],
      "aliases": {},
      "config": {},
      "user_id": "01982d6b-e090-776a-a587-21c63e502660",
      "team_id": "f2044fde-2293-482f-bf35-a8dab4e85c5f",
      "permissions": {},
      "max_parallel_requests": null,
      "metadata": {},
      "blocked": null,
      "tpm_limit": null,
      "rpm_limit": null,
      "max_budget": null,
      "budget_duration": null,
      "budget_reset_at": null,
      "allowed_cache_controls": [],
      "allowed_routes": [],
      "model_spend": {},
      "model_max_budget": {},
      "budget_id": null,
      "organization_id": null,
      "object_permission_id": null,
      "created_at": "2025-07-24T19:14:13.970000Z",
      "created_by": "582b168f-fc11-4e14-ad6a-cf4bb3656ddc",
      "updated_at": "2025-07-24T19:14:13.970000Z",
      "updated_by": "582b168f-fc11-4e14-ad6a-cf4bb3656ddc",
      "litellm_budget_table": null,
      "litellm_organization_table": null,
      "object_permission": null,
      "team_alias": null
    }
  ],
  "teams": []
}
```

**警告**
终端用户可以在请求体里自行传入 `user` 参数；这样做只会把成本累加到 `/customer/info?end_user_id=self-declared-user` 的报告上，而不会累加到该 API 所报告的密钥所有者头上。也就是说，用户可以借这种方式“绕开”花费追踪。
因此，如果你需要追踪用户花费，又要向终端用户发放 API 密钥，就必须在创建密钥时设置 user_id，并在后端服务中代表该用户发起 LLM 调用时始终使用为该用户签发的密钥。这样他们的花费才会被追踪到。

## 花费列表端点（`/spend/keys` 与 `/spend/users`）

这两个端点列出验证令牌表和用户表中的记录（按花费排序）。对内部用户而言，它们包含在 `spend_tracking_routes` 中。

### 访问控制（默认）

默认情况下，非管理员调用方**只能查到自己的数据**：

| 调用方角色 | `/spend/keys` | `/spend/users` |
|-------------|---------------|----------------|
| `proxy_admin` / `proxy_admin_viewer` | 所有密钥 | 所有用户（或用 `?user_id=` 查单个用户） |
| `internal_user` / `internal_user_view_only` | `user_id` 与调用方匹配的密钥 | 仅调用方自己的那一行 |
| 密钥上没有 `user_id` 的非管理员 | 空列表 `[]` | 空列表 `[]` |

内部用户为**其他**用户传入 `?user_id=` 时，会收到 **HTTP 403**（而不是一份被静默过滤的列表）。

```shell title="Admin — all keys" showLineNumbers
curl -X GET 'http://localhost:4000/spend/keys' \
  -H 'Authorization: Bearer <proxy-admin-key>'
```

```shell title="Internal user — own keys only" showLineNumbers
curl -X GET 'http://localhost:4000/spend/keys' \
  -H 'Authorization: Bearer <internal-user-key>'
```

### 数据范围限定无法关闭

`/spend/keys` 与 `/spend/users` 上的调用方数据范围限定是无条件的。没有任何 `general_settings` 配置项或环境变量能恢复限定前的旧行为（当时任何通过认证的密钥都能列出完整的密钥表与用户表）。需要读取完整表的自动化任务，必须改用 `proxy_admin` 或 `proxy_admin_viewer` 密钥。

:::info
做按用户维度的花费分析时，请优先使用 `/user/info?user_id=...` 或 `/global/spend/report`。这两个列表端点面向管理仪表板以及带范围限定的自助查询视图。
:::

## 每日花费明细 API

只需一个端点，即可按用户获取细粒度的每日用量数据（可按模型、提供商和 API 密钥拆分）。

请求示例：

```shell title="Daily Spend Breakdown API" showLineNumbers
curl -L -X GET 'http://localhost:4000/user/daily/activity?start_date=2025-03-20&end_date=2025-03-27' \
-H 'Authorization: Bearer sk-...'
```

```json title="Daily Spend Breakdown API Response" showLineNumbers
{
    "results": [
        {
            "date": "2025-03-27",
            "metrics": {
                "spend": 0.0177072,
                "prompt_tokens": 111,
                "completion_tokens": 1711,
                "total_tokens": 1822,
                "api_requests": 11
            },
            "breakdown": {
                "models": {
                    "{{openai_small}}": {
                        "spend": 1.82e-05,
                        "prompt_tokens": 37,
                        "completion_tokens": 9,
                        "total_tokens": 46,
                        "api_requests": 1
                    }
                },
                "providers": { "openai": { ... }, "azure_ai": { ... } },
                "api_keys": { "3126b6eaf1...": { ... } }
            }
        }
    ],
    "metadata": {
        "total_spend": 0.7274667,
        "total_prompt_tokens": 280990,
        "total_completion_tokens": 376674,
        "total_api_requests": 14
    }
}
```

### API 参考

关于 `/user/daily/activity` 端点的更多细节，参见 [Swagger API](https://docs.litellm.ai/api-reference/#/Budget%20%26%20Spend%20Tracking/get_user_daily_activity_user_daily_activity_get)

:::info
该端点的请求计数派生自花费日志，因此只覆盖已被记录的请求，且每次上游尝试都会单独记一笔。若要统计网关实际应答的请求数（包括在解析出密钥或模型之前就被拒绝的请求），请使用 [`/gateway/daily/activity`](./endpoint_activity.md#gateway-daily-activity)。两者的数值本就不要求一致
:::

## 自定义标签

:::tip[查看请求标签完整文档]
全部标签选项（包括 `x-litellm-tags` 请求头、请求体 `tags` 字段以及基于配置的标签）的完整文档，见专门的[请求标签](./request_tags.md)页面。
:::

前提条件：

- 需已配置虚拟密钥（virtual key）与数据库，参见[虚拟密钥](https://docs.litellm.ai/docs/proxy/virtual_keys)

**注意**：默认情况下，LiteLLM 会把 `User-Agent` 作为自定义标签纳入成本追踪，因此可以查看 Claude Code、Gemini CLI 等工具的用量。

<Image img={require('../../img/claude_cli_tag_usage.png')} />

### 客户端花费标签

<Tabs>
<TabItem value="key" label="在密钥上设置">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "tags": ["tag1", "tag2", "tag3"]
    }
}

'
```

</TabItem>
<TabItem value="team" label="在团队上设置">

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "tags": ["tag1", "tag2", "tag3"]
    }
}

'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

把 `extra_body={"metadata": { }}` 设置为你要传递的 `metadata`

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)


response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "metadata": {
            "tags": ["model-anthropic-claude-v2.1", "app-ishaan-prod"] # 👈 Key Change
        }
    }
)

print(response)
```

</TabItem>

<TabItem value="openai js" label="OpenAI JS">

```js
const openai = require("openai");

async function runOpenAI() {
  const client = new openai.OpenAI({
    apiKey: "sk-<your-api-key>",
    baseURL: "http://0.0.0.0:4000",
  });

  try {
    const response = await client.chat.completions.create({
      model: "{{openai_small}}",
      messages: [
        {
          role: "user",
          content: "this is a test request, write a short poem",
        },
      ],
      metadata: {
        tags: ["model-anthropic-claude-v2.1", "app-ishaan-prod"], // 👈 Key Change
      },
    });
    console.log(response);
  } catch (error) {
    console.log("got this exception from server");
    console.error(error);
  }
}

// Call the asynchronous function
runOpenAI();
```

</TabItem>

<TabItem value="Curl" label="Curl 请求">

在请求体中传入 `metadata`

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {"tags": ["model-anthropic-claude-v2.1", "app-ishaan-prod"]}
}'
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
    openai_api_base="http://0.0.0.0:4000",
    model = "{{openai_small}}",
    temperature=0.1,
    extra_body={
        "metadata": {
            "tags": ["model-anthropic-claude-v2.1", "app-ishaan-prod"]
        }
    }
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

### 在花费追踪中添加自定义请求头

你可以在请求中加入自定义请求头，用来追踪花费与用量。

```yaml
litellm_settings:
  extra_spend_tag_headers:
    - "x-custom-header"
```

### 关闭 user-agent 追踪

把 `litellm_settings.disable_add_user_agent_to_request_tags` 设置为 `true`，即可关闭 user-agent 追踪。

```yaml
litellm_settings:
  disable_add_user_agent_to_request_tags: true
```

## ✨（企业版）生成花费报告

用它向其他团队、客户或用户收费

使用 `/global/spend/report` 端点获取花费报告

<Tabs>

<TabItem value="per team" label="按团队查看花费">

#### 请求示例

👉 关键改动：指定 `group_by=team`

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-06-30&group_by=team' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

#### 响应示例

<Tabs>

<TabItem value="response" label="预期响应">

```shell
[
    {
        "group_by_day": "2024-04-30T00:00:00+00:00",
        "teams": [
            {
                "team_name": "Prod Team",
                "total_spend": 0.0015265,
                "metadata": [ # see the spend by unique(key + model)
                    {
                        "model": "{{openai_large}}",
                        "spend": 0.00123,
                        "total_tokens": 28,
                        "api_key": "88dc28.." # the hashed api key
                    },
                    {
                        "model": "{{openai_large}}",
                        "spend": 0.00123,
                        "total_tokens": 28,
                        "api_key": "a73dc2.." # the hashed api key
                    },
                    {
                        "model": "chatgpt-v-2",
                        "spend": 0.000214,
                        "total_tokens": 122,
                        "api_key": "898c28.." # the hashed api key
                    },
                    {
                        "model": "{{openai_small}}",
                        "spend": 0.0000825,
                        "total_tokens": 85,
                        "api_key": "84dc28.." # the hashed api key
                    }
                ]
            }
        ]
    }
]
```

</TabItem>

<TabItem value="py-script" label="解析响应的脚本（Python）">

```python
import requests
url = 'http://localhost:4000/global/spend/report'
params = {
    'start_date': '2023-04-01',
    'end_date': '2024-06-30'
}

headers = {
    'Authorization': 'Bearer sk-<your-litellm-api-key>'
}

# Make the GET request
response = requests.get(url, headers=headers, params=params)
spend_report = response.json()

for row in spend_report:
  date = row["group_by_day"]
  teams = row["teams"]
  for team in teams:
      team_name = team["team_name"]
      total_spend = team["total_spend"]
      metadata = team["metadata"]

      print(f"Date: {date}")
      print(f"Team: {team_name}")
      print(f"Total Spend: {total_spend}")
      print("Metadata: ", metadata)
      print()
```

脚本输出

```shell
# Date: 2024-05-11T00:00:00+00:00
# Team: local_test_team
# Total Spend: 0.003675099999999999
# Metadata:  [{'model': '{{openai_small}}', 'spend': 0.003675099999999999, 'api_key': 'b94d5e0bc3a71a573917fe1335dc0c14728c7016337451af9714924ff3a729db', 'total_tokens': 3105}]

# Date: 2024-05-13T00:00:00+00:00
# Team: Unassigned Team
# Total Spend: 3.4e-05
# Metadata:  [{'model': '{{openai_small}}', 'spend': 3.4e-05, 'api_key': '9569d13c9777dba68096dea49b0b03e0aaf4d2b65d4030eda9e8a2733c3cd6e0', 'total_tokens': 50}]

# Date: 2024-05-13T00:00:00+00:00
# Team: central
# Total Spend: 0.000684
# Metadata:  [{'model': '{{openai_small}}', 'spend': 0.000684, 'api_key': '0323facdf3af551594017b9ef162434a9b9a8ca1bbd9ccbd9d6ce173b1015605', 'total_tokens': 498}]

# Date: 2024-05-13T00:00:00+00:00
# Team: local_test_team
# Total Spend: 0.0005715000000000001
# Metadata:  [{'model': '{{openai_small}}', 'spend': 0.0005715000000000001, 'api_key': 'b94d5e0bc3a71a573917fe1335dc0c14728c7016337451af9714924ff3a729db', 'total_tokens': 423}]
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="per customer" label="按客户查看花费">

:::info

客户：[即 `/chat/completions` 请求中传入的 `user` 参数](#如何用-litellm-追踪花费)

- [LiteLLM API 密钥](virtual_keys.md)

:::

#### 请求示例

👉 关键改动：指定 `group_by=customer`

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-06-30&group_by=customer' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

#### 响应示例

```shell
[
    {
        "group_by_day": "2024-04-30T00:00:00+00:00",
        "customers": [
            {
                "customer": "palantir",
                "total_spend": 0.0015265,
                "metadata": [ # see the spend by unique(key + model)
                    {
                        "model": "{{openai_large}}",
                        "spend": 0.00123,
                        "total_tokens": 28,
                        "api_key": "88dc28.." # the hashed api key
                    },
                    {
                        "model": "{{openai_large}}",
                        "spend": 0.00123,
                        "total_tokens": 28,
                        "api_key": "a73dc2.." # the hashed api key
                    },
                    {
                        "model": "chatgpt-v-2",
                        "spend": 0.000214,
                        "total_tokens": 122,
                        "api_key": "898c28.." # the hashed api key
                    },
                    {
                        "model": "{{openai_small}}",
                        "spend": 0.0000825,
                        "total_tokens": 85,
                        "api_key": "84dc28.." # the hashed api key
                    }
                ]
            }
        ]
    }
]
```

</TabItem>

<TabItem value="per key" label="特定 API 密钥的花费">

👉 关键改动：指定 `api_key=sk-<your-litellm-api-key>`

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-06-30&api_key=sk-<your-litellm-api-key>' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

#### 响应示例

```shell
[
  {
    "api_key": "example-api-key-123",
    "total_cost": 0.3201286305151999,
    "total_input_tokens": 36.0,
    "total_output_tokens": 1593.0,
    "model_details": [
      {
        "model": "dall-e-3",
        "total_cost": 0.31999939051519993,
        "total_input_tokens": 0,
        "total_output_tokens": 0
      },
      {
        "model": "llama3-8b-8192",
        "total_cost": 0.00012924,
        "total_input_tokens": 36,
        "total_output_tokens": 1593
      }
    ]
  }
]
```

</TabItem>

<TabItem value="per user" label="内部用户（密钥所有者）的花费">

:::info

内部用户（Internal User，即密钥所有者）：即调用 [`/key/generate`](https://docs.litellm.ai/api-reference/#/key%20management/generate_key_fn_key_generate_post) 时传入的 `user_id` 值

:::

👉 关键改动：指定 `internal_user_id=ishaan`

```shell
curl -X GET 'http://localhost:4000/global/spend/report?start_date=2024-04-01&end_date=2024-12-30&internal_user_id=ishaan' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

#### 响应示例

```shell
[
  {
    "api_key": "example-api-key-123",
    "total_cost": 0.00013132,
    "total_input_tokens": 105.0,
    "total_output_tokens": 872.0,
    "model_details": [
      {
        "model": "gpt-3.5-turbo-instruct",
        "total_cost": 5.85e-05,
        "total_input_tokens": 15,
        "total_output_tokens": 18
      },
      {
        "model": "llama3-8b-8192",
        "total_cost": 7.282000000000001e-05,
        "total_input_tokens": 90,
        "total_output_tokens": 854
      }
    ]
  },
  {
    "api_key": "151e85e46ab8c9c7fad090793e3fe87940213f6ae665b543ca633b0b85ba6dc6",
    "total_cost": 5.2699999999999993e-05,
    "total_input_tokens": 26.0,
    "total_output_tokens": 27.0,
    "model_details": [
      {
        "model": "{{openai_small}}",
        "total_cost": 5.2499999999999995e-05,
        "total_input_tokens": 24,
        "total_output_tokens": 27
      },
      {
        "model": "text-embedding-ada-002",
        "total_cost": 2e-07,
        "total_input_tokens": 2,
        "total_output_tokens": 0
      }
    ]
  },
  {
    "api_key": "60cb83a2dcbf13531bd27a25f83546ecdb25a1a6deebe62d007999dc00e1e32a",
    "total_cost": 9.42e-06,
    "total_input_tokens": 30.0,
    "total_output_tokens": 99.0,
    "model_details": [
      {
        "model": "llama3-8b-8192",
        "total_cost": 9.42e-06,
        "total_input_tokens": 30,
        "total_output_tokens": 99
      }
    ]
  }
]
```

</TabItem>

</Tabs>

## 📊 花费日志 API：单笔交易日志

`/spend/logs` 端点现已支持 `summarize` 参数，用于控制使用日期过滤时的数据返回格式。

### 关键参数

| 参数        | 说明                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| `summarize` | **新增参数**：设为 `true`（默认）返回聚合数据，`false` 返回单笔交易日志 |

### 示例

**获取单笔交易日志**：

```bash title="Get Individual Transaction Logs" showLineNumbers
curl -X GET "http://localhost:4000/spend/logs?start_date=2024-01-01&end_date=2024-01-02&summarize=false" \
-H "Authorization: Bearer $LITELLM_API_KEY"
```

**获取聚合数据**（默认）：

```bash title="Get Summarized Spend Data" showLineNumbers
curl -X GET "http://localhost:4000/spend/logs?start_date=2024-01-01&end_date=2024-01-02" \
-H "Authorization: Bearer $LITELLM_API_KEY"
```

**使用场景**：

- `summarize=false`：分析仪表板、ETL 流程、详细审计追踪
- `summarize=true`：每日花费报告、高层次成本追踪（旧版行为）

## 分页花费日志：`/spend/logs/v2`

需要以分页方式程序化读取单笔花费日志时，请使用 `/spend/logs/v2`。上文的旧版 `/spend/logs` 端点最多只返回最近匹配的 10,000 条记录（超出时响应会携带 `x-litellm-spend-logs-truncated: true` 响应头），因此导出与集成场景推荐使用 `/spend/logs/v2`。

```bash title="Get a page of spend logs" showLineNumbers
curl -X GET "http://localhost:4000/spend/logs/v2?start_date=2024-01-01%2000:00:00&end_date=2024-01-02%2023:59:59&page=1&page_size=100" \
-H "Authorization: Bearer $LITELLM_API_KEY"
```

`start_date` 和 `end_date` 接受 `YYYY-MM-DD HH:MM:SS` 格式的时间戳。`page` 从 1 开始，`page_size` 每页最多接受 1000 行。该端点还支持 `api_key`、`user_id`、`team_id`、`model`、`status_filter`、`min_spend`、`max_spend` 等过滤参数；完整列表见代理的 Swagger 页面（`/docs`）中 `/spend/logs/v2` 的文档。

```json title="Response format"
{
  "data": ["..."],
  "total": 10000,
  "page": 1,
  "page_size": 100,
  "total_pages": 100,
  "total_is_capped": true
}
```

### `total` 计数上限为 10,000

在大时间窗口内统计全部匹配行，会对花费日志表造成代价高昂的全表扫描，因此自 v1.93.0 起，该端点背后的计数查询上限为 10,000 行。当匹配行数更多时，`total` 恰好返回 `10000`，`total_pages` 基于该封顶值计算，`total_is_capped` 为 `true`。被封顶的只是对外公布的计数，数据本身永远不会截断，因此越过公布的 `total_pages` 继续翻页仍会返回记录，直到结果取尽为止。

有两种方式读完全部匹配记录。一是当 `total_is_capped` 为 `true` 时，忽略 `total_pages`，持续翻页直到收到空的 `data` 数组。二是把查询拆成更小的时间窗口，让每个窗口匹配的记录少于 10,000 条，这样每个窗口都能给出精确的 `total`。大批量导出推荐用分窗口方式，还能顺带避免越翻越慢的深分页问题。

使用 `group_by_session=true` 时，分页同样受这一 10,000 行上限约束，起点超过上限的页不会返回任何记录，因此请拆分时间窗口，不要越过上限继续翻页。

## 自定义花费日志元数据

可以把指定的键值对写入花费日志的元数据中。

前提条件：

- 需要先设置好虚拟密钥（virtual key）与数据库，参见 [虚拟密钥](https://docs.litellm.ai/docs/proxy/virtual_keys)

#### 用法：/chat/completions 请求携带特殊花费日志元数据


<Tabs>
<TabItem value="key" label="在密钥上设置">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
      "spend_logs_metadata": {
          "hello": "world"
      }
    }
}

'
```

</TabItem>
<TabItem value="team" label="在团队上设置">

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
      "spend_logs_metadata": {
          "hello": "world"
      }
    }
}

'
```

</TabItem>

<TabItem value="openai" label="OpenAI Python v1.0.0+">

将 `extra_body={"metadata": { }}` 设为要传递的 `metadata`

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "metadata": {
            "spend_logs_metadata": {
                "hello": "world"
            }
        }
    }
)

print(response)
```

**使用请求头**：

```python
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

# Pass spend logs metadata via headers
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_headers={
        "x-litellm-spend-logs-metadata": '{"user_id": "12345", "project_id": "proj_abc", "request_type": "chat_completion"}'
    }
)

print(response)
```

</TabItem>


<TabItem value="openai js" label="OpenAI JS">

```js
const openai = require('openai');

async function runOpenAI() {
  const client = new openai.OpenAI({
    apiKey: 'sk-<your-api-key>',
    baseURL: 'http://0.0.0.0:4000'
  });

  try {
    const response = await client.chat.completions.create({
      model: '{{openai_small}}',
      messages: [
        {
          role: 'user',
          content: "this is a test request, write a short poem"
        },
      ],
      metadata: {
        spend_logs_metadata: { // 👈 Key Change
            hello: "world"
        }
      }
    });
    console.log(response);
  } catch (error) {
    console.log("got this exception from server");
    console.error(error);
  }
}

// Call the asynchronous function
runOpenAI();
```

**使用请求头**：

```js
const openai = require('openai');

async function runOpenAI() {
  const client = new openai.OpenAI({
    apiKey: 'sk-<your-api-key>',
    baseURL: 'http://0.0.0.0:4000'
  });

  try {
    const response = await client.chat.completions.create({
      model: '{{openai_small}}',
      messages: [
        {
          role: 'user',
          content: "this is a test request, write a short poem"
        },
      ]
    }, {
      headers: {
        'x-litellm-spend-logs-metadata': '{"user_id": "12345", "project_id": "proj_abc", "request_type": "chat_completion"}'
      }
    });
    console.log(response);
  } catch (error) {
    console.log("got this exception from server");
    console.error(error);
  }
}

// Call the asynchronous function
runOpenAI();
```

</TabItem>

<TabItem value="Curl" label="Curl 请求">

在请求体中传入 `metadata`

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {
        "spend_logs_metadata": {
            "hello": "world"
        }
    }
}'
```

</TabItem>

<TabItem value="headers" label="使用请求头">

将 `x-litellm-spend-logs-metadata` 作为请求头传入，值为 JSON 字符串

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'x-litellm-spend-logs-metadata: {"user_id": "12345", "project_id": "proj_abc", "request_type": "chat_completion"}' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
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
    openai_api_base="http://0.0.0.0:4000",
    model = "{{openai_small}}",
    temperature=0.1,
    extra_body={
        "metadata": {
            "spend_logs_metadata": {
                "hello": "world"
            }
        }
    }
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


#### 查看带自定义元数据的花费记录

#### `/spend/logs` 请求格式

```bash
# request_id: e.g.: chatcmpl-9ZKMURhVYSi9D6r6PJ9vLcayIK0Vm
curl -X GET "http://0.0.0.0:4000/spend/logs?request_id=<your-call-id" \
-H "Authorization: Bearer $LITELLM_API_KEY"
```

#### `/spend/logs` 响应格式
```bash
[
    {
        "request_id": "chatcmpl-9ZKMURhVYSi9D6r6PJ9vLcayIK0Vm",
        "call_type": "acompletion",
        "metadata": {
            "user_api_key": "example-api-key-123",
            "user_api_key_alias": null,
            "spend_logs_metadata": { # 👈 LOGGED CUSTOM METADATA
                "hello": "world"
            },
            "user_api_key_team_id": null,
            "user_api_key_user_id": "116544810872468347480",
            "user_api_key_team_alias": null
        },
    }
]
```
