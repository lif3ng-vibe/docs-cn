import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 设置团队预算


## 前提条件

- 你需要先配置一个 Postgres 数据库（如 Supabase、Neon 等）


## 自动生成的 JWT 团队的默认预算

在 JWT 认证中使用 `team_id_upsert: true` 时，可以为任何新建的团队自动分配默认预算。

该配置位于 `config.yaml` 的 `default_team_settings` 中。

**示例：**
```yaml
# in your config.yaml

litellm_jwtauth:
  team_id_upsert: true
  team_id_jwt_field: "team_id"
  # ... other jwt settings

litellm_settings:
  default_team_settings: 
    - team_id: "default-settings"
      max_budget: 100.0
```
追踪花费，为你的内部团队设置预算。


## 设置团队月度预算

### 1. 创建团队
- 设置 `max_budget=000000001`（团队允许花费的金额上限，以美元计）
- 设置 `budget_duration="1d"`（预算更新的频率）

<Tabs>

<TabItem value="API" label="API">

创建一个新团队，并设置 `max_budget` 和 `budget_duration`
```shell
curl -X POST 'http://0.0.0.0:4000/team/new' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
            "team_alias": "QA Prod Bot", 
            "max_budget": 0.000000001, 
            "budget_duration": "1d"
        }' 
```

响应
```shell
{
 "team_alias": "QA Prod Bot",
 "team_id": "de35b29e-6ca8-4f47-b804-2b79d07aa99a",
 "max_budget": 0.0001,
 "budget_duration": "1d",
 "budget_reset_at": "2024-06-14T22:48:36.594000Z"
}  
```
</TabItem>

<TabItem value="UI" label="Admin UI">
<Image img={require('../../img/create_team_gif_good.gif')} />

</TabItem>


</Tabs>

`budget_duration` 的可选取值

| `budget_duration` | 预算重置时间 |
| --- | --- |
| `budget_duration="1s"` | 每 1 秒 |
| `budget_duration="1m"` | 每 1 分钟 |
| `budget_duration="1h"` | 每 1 小时 |
| `budget_duration="1d"` | 每 1 天 |
| `budget_duration="30d"` | 每 1 个月 |


### 2. 为团队（`team`）创建密钥

基于第 1 步的 Team=`QA Prod Bot` 和 `team_id="de35b29e-6ca8-4f47-b804-2b79d07aa99a"` 创建密钥

<Tabs>

<TabItem value="api" label="API">

💡 **Team="QA Prod Bot" 的预算将应用于该团队**

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"team_id": "de35b29e-6ca8-4f47-b804-2b79d07aa99a"}'
```

响应

```shell
{"team_id":"de35b29e-6ca8-4f47-b804-2b79d07aa99a", "key":"sk-5qtncoYjzRcxMM4bDRktNQ"}
```
</TabItem>

<TabItem value="UI" label="Admin UI">
<Image img={require('../../img/create_key_in_team.gif')} />
</TabItem>

</Tabs>

### 3. 测试

使用第 2 步生成的密钥，将此请求运行两次
<Tabs>

<TabItem value="api" label="API">

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H 'Authorization: Bearer sk-mso-JSykEGri86KyOvgxBw' \
     -H 'Content-Type: application/json' \
     -d ' {
           "model": "llama3",
           "messages": [
             {
               "role": "user",
               "content": "hi"
             }
           ]
         }'
```

第二次请求时，预期会收到 HTTP 422 及如下错误

```shell
{
 "error": {
   "message": "Budget has been exceeded! Team=de35b29e-6ca8-4f47-b804-2b79d07aa99a Current cost: 3.5e-06, Max budget: 1e-09",
   "type": "budget_exceeded",
   "param": null,
   "code": "422"
 }
}
```

如果希望改返回 429，请在 config.yaml 的 `litellm_settings` 下设置 `budget_exceeded_status_code: 429`

</TabItem>

<TabItem value="UI" label="Admin UI">
<Image img={require('../../img/test_key_budget.gif')} />
</TabItem>
</Tabs>

## 高级配置

### `remaining_budget` 的 Prometheus 指标

[更多 Prometheus 指标的说明](https://docs.litellm.ai/docs/proxy/prometheus)

你需要在代理的 config.yaml 中加入以下配置

```yaml
litellm_settings:
  success_callback: ["prometheus"]
  failure_callback: ["prometheus"]
```

在 Prometheus 上可以看到该指标，用于追踪团队的剩余预算

```shell
litellm_remaining_team_budget_metric{team_alias="QA Prod Bot",team_id="de35b29e-6ca8-4f47-b804-2b79d07aa99a"} 9.699999999999992e-06
```

## 另请参阅

- [团队的按模型 TPM/RPM 限制](./users.md#设置速率限制) - 为团队内所有密钥按模型设置速率限制
