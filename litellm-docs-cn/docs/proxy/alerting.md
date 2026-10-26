import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 告警与 Webhook

可获取以下几类告警：

| 类别 | 告警类型 |
|----------|------------|
| **LLM 性能** | API 请求挂起、API 请求过慢、API 请求失败、模型故障告警 |
| **预算与花费** | 按密钥/用户的预算追踪、软预算告警、按团队/标签的每周与每月花费报告 |
| **系统健康** | 数据库读写失败 |
| **每日报告** | 最慢的 5 个 LLM 部署、失败请求最多的 5 个 LLM 部署、按团队/标签的每周与每月花费 |



支持的平台：
- [Slack](#快速上手)
- [Discord](/docs/proxy/alerting#discord-webhook)
- [Microsoft Teams](/docs/proxy/alerting#ms-teams-webhook)

## 快速上手

设置一个 Slack 告警频道，用于接收代理发出的告警。

### 第 1 步：将 Slack Webhook URL 加入环境变量

从 https://api.slack.com/messaging/webhooks 获取 Slack Webhook URL。

也可以使用 Discord Webhook，参见[这里](/docs/proxy/alerting#discord-webhook)


在代理的环境变量中设置 `SLACK_WEBHOOK_URL`，即可启用 Slack 告警。

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/<>/<>/<>"
```

如果未设置 `SLACK_WEBHOOK_URL`，系统会读取 `ALERTING_WEBHOOK_URL` 作为不绑定特定提供商的回退，可用它把同样的 Slack 格式告警发送到任何兼容 Slack 的传入 Webhook，例如 Rocket.Chat 或 Mattermost。

### 第 2 步：配置代理

```yaml
general_settings: 
    alerting: ["slack"]
    alerting_threshold: 300 # sends alerts if requests hang for 5min+ and responses take 5min+ 
    spend_report_frequency: "1d" # [Optional] set as 1d, 2d, 30d .... Specify how often you want a Spend Report to be sent
    
    # [OPTIONAL ALERTING ARGS]
    alerting_args:
        daily_report_frequency: 43200  # 12 hours in seconds
        report_check_interval: 300     # 5 minutes in seconds
        budget_alert_ttl: 86400        # 24 hours in seconds
        outage_alert_ttl: 60           # 1 minute in seconds
        region_outage_alert_ttl: 60    # 1 minute in seconds
        minor_outage_alert_threshold: 5 
        major_outage_alert_threshold: 10
        max_outage_alert_list_size: 10
        log_to_console: false
    
```

启动代理
```bash
$ litellm --config /path/to/config.yaml
```


### 第 3 步：测试


```bash
curl -X GET 'http://0.0.0.0:4000/health/services?service=slack' \
-H "Authorization: Bearer $LITELLM_API_KEY"
```

## 高级用法

### 在告警中脱敏消息内容

默认情况下，告警会显示传给 LLM 的 `messages/input` 内容。如果希望在 Slack 告警中将这部分脱敏，请在配置里加上以下设置。


```shell
general_settings:
  alerting: ["slack"]
  alert_types: ["spend_reports"] 

litellm_settings:
  redact_messages_in_exceptions: True
```

### 虚拟密钥的软预算告警

当某个密钥/团队即将用尽预算时，用这个功能发送告警。

第 1 步：创建一个带软预算（soft budget）的虚拟密钥（virtual key）

将 `soft_budget` 设为 0.001

```shell
curl -X 'POST' \
  'http://localhost:4000/key/generate' \
  -H 'accept: application/json' \
  -H 'x-goog-api-key: sk-<your-litellm-api-key>' \
  -H 'Content-Type: application/json' \
  -d '{
  "key_alias": "prod-app1",
  "team_id": "113c1a22-e347-4506-bfb2-b320230ea414",
  "soft_budget": 0.001
}'
```

第 2 步：用该虚拟密钥向代理发送一个请求

```shell
curl http://0.0.0.0:4000/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-Nb5eCf427iewOlbxXIH4Ow" \
-d '{
  "model": "openai/{{openai_large}}",
  "messages": [
    {
      "role": "user",
      "content": "this is a test request, write a short poem"
    }
  ]
}'

```

第 3 步：到 Slack 查看预期收到的告警

<Image img={require('../../img/soft_budget_alert.png')}/>




### 为告警添加元数据

在代理调用中加入告警元数据，便于调试。

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_large}}",
    messages = [], 
    extra_body={
        "metadata": {
            "alerting_metadata": {
                "hello": "world"
            }
        }
    }
)
```

**预期响应**

<Image img={require('../../img/alerting_metadata.png')}/>

### 选择特定告警类型

如果只想启用其中一部分告警类型，可以设置 `alert_types`。未设置 `alert_types` 时，所有默认告警类型都会启用。

👉 [**查看全部告警类型**](#所有可用告警类型)

```shell
general_settings:
  alerting: ["slack"]
  alert_types: [
    "llm_exceptions",
    "llm_too_slow",
    "llm_requests_hanging",
    "budget_alerts",
    "spend_reports",
    "db_exceptions",
    "daily_reports",
    "cooldown_deployment",
    "new_model_added",
  ] 
```

### 将 Slack 频道映射到告警类型

如果你希望为每种告警类型指定各自的频道，可以使用这一功能。

**配置后的效果如下**
```
llm_exceptions -> go to slack channel #llm-exceptions
spend_reports -> go to slack channel #llm-spend-reports
```

在 config.yaml 中设置 `alert_to_webhook_url`。

<Tabs>

<TabItem label="每个告警一个频道" value="1">

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings: 
  master_key: os.environ/LITELLM_MASTER_KEY
  alerting: ["slack"]
  alerting_threshold: 0.0001 # (Seconds) set an artificially low threshold for testing alerting
  alert_to_webhook_url: {
    "llm_exceptions": "example-slack-webhook-url",
    "llm_too_slow": "example-slack-webhook-url",
    "llm_requests_hanging": "example-slack-webhook-url",
    "budget_alerts": "example-slack-webhook-url",
    "db_exceptions": "example-slack-webhook-url",
    "daily_reports": "example-slack-webhook-url",
    "spend_reports": "example-slack-webhook-url",
    "cooldown_deployment": "example-slack-webhook-url",
    "new_model_added": "example-slack-webhook-url",
    "outage_alerts": "example-slack-webhook-url",
  }

litellm_settings:
  success_callback: ["langfuse"]
```
</TabItem>

<TabItem label="每个告警多个频道" value="2">

为同一告警类型提供多个 Slack 频道

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings: 
  master_key: os.environ/LITELLM_MASTER_KEY
  alerting: ["slack"]
  alerting_threshold: 0.0001 # (Seconds) set an artificially low threshold for testing alerting
  alert_to_webhook_url: {
    "llm_exceptions": ["os.environ/SLACK_WEBHOOK_URL", "os.environ/SLACK_WEBHOOK_URL_2"],
    "llm_too_slow": ["https://webhook.site/7843a980-a494-4967-80fb-d502dbc16886", "https://webhook.site/28cfb179-f4fb-4408-8129-729ff55cf213"],
    "llm_requests_hanging": ["os.environ/SLACK_WEBHOOK_URL_5", "os.environ/SLACK_WEBHOOK_URL_6"],
    "budget_alerts": ["os.environ/SLACK_WEBHOOK_URL_7", "os.environ/SLACK_WEBHOOK_URL_8"],
    "db_exceptions": ["os.environ/SLACK_WEBHOOK_URL_9", "os.environ/SLACK_WEBHOOK_URL_10"],
    "daily_reports": ["os.environ/SLACK_WEBHOOK_URL_11", "os.environ/SLACK_WEBHOOK_URL_12"],
    "spend_reports": ["os.environ/SLACK_WEBHOOK_URL_13", "os.environ/SLACK_WEBHOOK_URL_14"],
    "cooldown_deployment": ["os.environ/SLACK_WEBHOOK_URL_15", "os.environ/SLACK_WEBHOOK_URL_16"],
    "new_model_added": ["os.environ/SLACK_WEBHOOK_URL_17", "os.environ/SLACK_WEBHOOK_URL_18"],
    "outage_alerts": ["os.environ/SLACK_WEBHOOK_URL_19", "os.environ/SLACK_WEBHOOK_URL_20"],
  }

litellm_settings:
  success_callback: ["langfuse"]
```

</TabItem>

</Tabs>

测试方法：发送一个有效的 LLM 请求，应该能在它专属的 Slack 频道里看到 `llm_too_slow` 告警

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
}'
```


### MS Teams Webhook

从 v1.100.0 起，LiteLLM 可以通过 `ms_teams` 告警目的地原生向 Microsoft Teams 发送告警。每条告警都以 Adaptive Card 形式发布，Teams Workflows Webhook 和旧版传入 Webhook 连接器都能接收。

##### 快速上手

1. 为你的 Microsoft Teams 频道[创建传入 Webhook](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)

2. 将其加入你的 .env

```bash
MS_TEAMS_WEBHOOK_URL="https://<your-tenant>.webhook.office.com/webhookb2/<...>/IncomingWebhook/<...>"
```

3. 在 litellm 配置的 `alerting` 中加入 `ms_teams`。它可以与 `slack`、`email` 等其他目的地并存

```yaml
model_list: 
    model_name: "azure-model"
    litellm_params:
        model: "azure/{{openai_small}}"
        api_key: "my-bad-key" # 👈 bad key

general_settings: 
    alerting: ["ms_teams"]
    alerting_threshold: 300 # sends alerts if requests hang for 5min+ and responses take 5min+ 
```

4. 运行健康检查！

调用代理的 `/health/services` 端点并带上 `service=ms_teams`，向你的频道发送一条测试告警

```bash
curl --location 'http://0.0.0.0:4000/health/services?service=ms_teams' \
--header "Authorization: Bearer $LITELLM_API_KEY"
```

**预期响应**

```json
{
  "status": "success",
  "message": "Mock MS Teams Alert sent, verify MS Teams Alert Received in your channel"
}
```

也可以在管理界面（Admin UI）的 **Logging & Alerts** 页面、**MS Teams Alerts** 标签页中设置这个 Webhook URL，系统会帮你保存 `MS_TEAMS_WEBHOOK_URL` 并把 `ms_teams` 加入 `alerting`。

`alert_types` 对 Teams 的作用与对 Slack 完全一致。`alert_to_webhook_url` 和摘要模式（digest mode）只对 Slack 告警生效；Teams 告警始终发送到 `MS_TEAMS_WEBHOOK_URL`，并且逐条发送，不做摘要聚合。


### Discord Webhook

Discord 提供了兼容 Slack 的 Webhook URL，可以直接用于告警。

##### 快速上手

1. 获取你 Discord 频道的 Webhook URL

2. 在 Discord Webhook URL 末尾加上 `/slack`，结果形如

```
"https://discord.com/api/webhooks/1240030362193760286/cTLWt5ATn1gKmcy_982rl5xmYHsrM1IWJdmCL1AyOmU9JdQXazrp8L1_PYgUtgxj8x4f/slack"
```

3. 将其加入 litellm 配置

```yaml
model_list: 
    model_name: "azure-model"
    litellm_params:
        model: "azure/{{openai_small}}"
        api_key: "my-bad-key" # 👈 bad key

general_settings: 
    alerting: ["slack"]
    alerting_threshold: 300 # sends alerts if requests hang for 5min+ and responses take 5min+ 

environment_variables:
    SLACK_WEBHOOK_URL: "https://discord.com/api/webhooks/1240030362193760286/cTLWt5ATn1gKmcy_982rl5xmYHsrM1IWJdmCL1AyOmU9JdQXazrp8L1_PYgUtgxj8x4f/slack"
```


## [BETA] 预算告警 Webhook

**注意**：这是测试版功能，具体规格可能调整。

设置一个 Webhook，以便接收预算告警通知。

1. 配置 config.yaml

把 URL 加入环境变量，测试时可以用[这里](https://webhook.site/)生成的链接

```bash
export WEBHOOK_URL="https://webhook.site/6ab090e8-c55f-4a23-b075-3209f5c57906"
```

在 config.yaml 中加入 'webhook'
```yaml
general_settings: 
  alerting: ["webhook"] # 👈 KEY CHANGE
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试！

```bash
curl -X GET --location 'http://0.0.0.0:4000/health/services?service=webhook' \
--header "Authorization: Bearer $LITELLM_API_KEY"
```

**预期响应**

```bash
{
  "spend": 1, # the spend for the 'event_group'
  "max_budget": 0, # the 'max_budget' set for the 'event_group'
  "token": "example-api-key-123",
  "user_id": "default_user_id",
  "team_id": null,
  "user_email": null,
  "key_alias": null,
  "projected_exceeded_date": null,
  "projected_spend": null,
  "event": "budget_crossed", # see the `event` spec below for all values
  "event_group": "user",
  "event_message": "User Budget: Budget Crossed"
}
```

### Webhook 事件的 API 规范

- `spend` *float*：'event_group' 当前的花费金额。
- `max_budget` *float 或 null*：'event_group' 允许的最大预算，未设置时为 null。
- `soft_budget` *float 或 null*：为 'event_group' 设置的软预算，未设置时为 null。
- `token` *str*：密钥的哈希值，用于身份验证或身份识别。
- `customer_id` *str 或 null*：与该事件关联的客户 ID（可选）。
- `user_id` *str 或 null*：与该事件关联的内部用户 ID（可选）。
- `team_id` *str 或 null*：与该事件关联的团队 ID（可选）。
- `team_alias` *str 或 null*：与该事件关联的团队别名（可选）。
- `organization_id` *str 或 null*：与该事件关联的组织 ID（可选）。
- `user_email` *str 或 null*：与该事件关联的内部用户邮箱（可选）。
- `key_alias` *str 或 null*：与该事件关联的密钥别名（可选）。
- `projected_exceeded_date` *str 或 null*：预计超出预算的日期，为密钥设置 'soft_budget' 时返回（可选）。
- `projected_spend` *float 或 null*：预计花费金额，为密钥设置 'soft_budget' 时返回（可选）。
- `event` *Literal["budget_crossed", "max_budget_alert", "soft_budget_crossed", "threshold_crossed", "projected_limit_exceeded", "key_created", "key_rotated", "internal_user_created", "spend_tracked"]*：触发该 Webhook 的事件类型。`key_created`、`key_rotated`、`internal_user_created` 和 `max_budget_alert` 与邮件告警共用。预算 Webhook 的取值如下：
    * "spend_tracked"：每当追踪到某个客户 ID 的花费时触发。
    * "budget_crossed"：表示花费已超过最大预算。
    * "soft_budget_crossed"：表示花费已超过软预算。
    * "threshold_crossed"：表示花费越过了某个阈值（目前在使用预算达到 85% 和 95% 时发送）。
    * "projected_limit_exceeded"：仅针对 "key"，表示预计花费将超过软预算阈值。
- `event_group` *Literal["customer", "internal_user", "key", "team", "proxy"]*：与事件关联的分组。可能的取值如下：
    * "customer"：事件与某个具体客户相关。
    * "internal_user"：事件与某个具体内部用户相关。
    * "key"：事件与某个具体密钥相关。
    * "team"：事件与某个团队相关。
    * "proxy"：事件与代理本身相关。

- `event_message` *str*：事件的人类可读描述。

### 摘要模式（减少告警噪音）

默认情况下，LiteLLM 会为**每一条**告警事件单独发送一条 Slack 消息。对 `llm_requests_hanging`、`llm_too_slow` 这类高频告警类型来说，一天可能产生数百条重复消息。

**摘要模式**会在一个可配置的时间窗口内聚合重复告警，最后只发出一条包含总数和时间范围的汇总消息。

#### 配置

在 `general_settings` 中使用 `alert_type_config`，即可按告警类型启用摘要模式：

```yaml
general_settings:
  alerting: ["slack"]
  alert_type_config:
    llm_requests_hanging:
      digest: true
      digest_interval: 86400  # 24 hours (default)
    llm_too_slow:
      digest: true
      digest_interval: 3600   # 1 hour
    llm_exceptions:
      digest: true
      # uses default interval (86400 seconds / 24 hours)
```

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `digest` | bool | `false` | 为该告警类型启用摘要模式 |
| `digest_interval` | int | `86400` (24h) | 聚合时间窗口，单位为秒。告警会在该间隔内聚合。 |

#### 工作原理

1. 启用摘要的告警类型触发时，不会立即发送，而是按 `(alert_type, request_model, api_base)` **分组**
2. 计数器会统计该间隔内告警触发的次数
3. 间隔到期后，发出**一条汇总消息**：

```
Alert type: `llm_requests_hanging` (Digest)
Level: `Medium`
Start: `2026-02-19 03:27:39`
End: `2026-02-20 03:27:39`
Count: `847`

Message: `Requests are hanging - 600s+ request time`
Request Model: `{{gemini_flash}}`
API Base: `None`
```

#### 局限性

- **按实例隔离**：摘要状态保存在每个代理实例的内存中。如果你运行多个实例（例如带自动扩缩容的 Cloud Run），每个实例都会各自维护摘要并发送各自的汇总。
- **不持久化**：如果实例在摘要间隔到期前被终止，该实例聚合的告警会丢失。

## 区域故障告警（✨ 企业版功能）

:::info
[获取免费的两周许可证](https://forms.gle/P518LXsAZ7PhXpDn8)
:::

设置告警，在某个提供商区域出现故障时收到通知。

```yaml
general_settings:
    alerting: ["slack"]
    alert_types: ["region_outage_alerts"] 
```

默认情况下，如果同一区域内的多个模型在 1 分钟内失败 5 个以上请求，就会触发告警。'400' 状态码的错误不计入（例如 BadRequestErrors）。

阈值可通过以下配置控制：

```yaml
general_settings:
    alerting: ["slack"]
    alert_types: ["region_outage_alerts"] 
    alerting_args:
        region_outage_alert_ttl: 60 # time-window in seconds
        minor_outage_alert_threshold: 5 # number of errors to trigger a minor alert
        major_outage_alert_threshold: 10 # number of errors to trigger a major alert
```

## **所有可用告警类型**

👉 [**如何设置特定告警类型**](/docs/proxy/alerting#选择特定告警类型)

LLM 相关告警

| 告警类型 | 说明 | 默认启用 |
|------------|-------------|---------|
| `llm_exceptions` | LLM API 异常告警 | ✅ |
| `llm_too_slow` | LLM 响应超过设定阈值时的通知 | ✅ |
| `llm_requests_hanging` | LLM 请求迟迟未完成时的告警 | ✅ |
| `cooldown_deployment` | 部署进入冷却（cooldown）时的告警 | ✅ |
| `new_model_added` | 通过 /model/new 向 litellm 代理添加新模型时的通知 | ✅ |
| `outage_alerts` | 某个 LLM 部署出现故障时的告警 | ✅ |
| `region_outage_alerts` | 某个 LLM 区域出现故障时的告警，例如 us-east-1 | ✅ |

预算与花费告警

| 告警类型 | 说明 | 默认启用 |
|------------|-------------|---------|
| `budget_alerts` | 与预算上限或阈值相关的通知 | ✅ |
| `spend_reports` | 按团队或标签汇总花费的周期性报告 | ✅ |
| `failed_tracking_spend` | 花费追踪失败时的告警 | ✅ |
| `daily_reports` | 每日花费报告 | ✅ |
| `fallback_reports` | LLM 回退发生情况的每周报告 | ✅ |

数据库告警

| 告警类型 | 说明 | 默认启用 |
|------------|-------------|---------|
| `db_exceptions` | 数据库相关异常的通知 | ✅ |

MCP 网关告警

| 告警类型 | 说明 | 默认启用 |
|------------|-------------|---------|
| `mcp_tool_description_blocked` | `pre_mcp_call` 防护栏（guardrail）拦截了某个上游 MCP 工具的描述，该工具因此从 `tools/list` 中隐藏。参见 [MCP 防护栏](../mcp_guardrail#发现时扫描工具描述) | ✅ |
| `mcp_pinned_tools_changed` | 已固定的 MCP 服务器，其上游工具列表、描述或输入 schema 与固定时出现了偏差。参见 [固定服务器的工具列表](../mcp_control#固定服务器的工具列表) | ✅ |

管理端点告警：虚拟密钥、团队、内部用户

| 告警类型 | 说明 | 默认启用 |
|------------|-------------|---------|
| `new_virtual_key_created` | 创建新虚拟密钥时的通知 | ❌ |
| `virtual_key_updated` | 虚拟密钥被修改时的告警 | ❌ |
| `virtual_key_deleted` | 删除虚拟密钥时的通知 | ❌ |
| `new_team_created` | 创建新团队时的告警 | ❌ |
| `team_updated` | 团队信息被修改时的通知 | ❌ |
| `team_deleted` | 删除团队时的告警 | ❌ |
| `new_internal_user_created` | 创建新内部用户账号时的通知 | ❌ |
| `internal_user_updated` | 内部用户信息变更时的告警 | ❌ |
| `internal_user_deleted` | 移除内部用户账号时的通知 | ❌ |


## `alerting_args` 规范

| 参数 | 默认值 | 说明 |
|-----------|---------|-------------|
| `daily_report_frequency` | 43200 (12 hours) | 接收部署延迟/失败报告的频率，单位为秒 |
| `report_check_interval` | 300 (5 minutes) | 检查是否应发送报告（后台进程）的间隔，单位为秒 |
| `budget_alert_ttl` | 86400 (24 hours) | 预算告警的缓存 TTL，避免预算越过时告警刷屏 |
| `outage_alert_ttl` | 60 (1 minute) | 收集模型故障错误的时间窗口，单位为秒 |
| `region_outage_alert_ttl` | 60 (1 minute) | 收集区域级故障错误的时间窗口，单位为秒 |
| `minor_outage_alert_threshold` | 5 | 触发轻微故障告警的错误数量（400 错误不计入） |
| `major_outage_alert_threshold` | 10 | 触发严重故障告警的错误数量（400 错误不计入） |
| `max_outage_alert_list_size` | 10 | 每个模型/区域在缓存中最多保存的错误数量 |
| `log_to_console` | false | 设为 true 时，以 `.warning` 日志的形式把告警负载打印到控制台 |
