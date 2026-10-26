import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 预算路由
LiteLLM 支持设置以下几种预算：
- 提供商预算（provider budget）：OpenAI 每天 $100，Azure 每天 $100。
- 模型预算（model budget）：gpt-5.6-terra https://api-base-1 每天 $100，gpt-5.6-luna https://api-base-2 每天 $100。
- 标签预算（tag budget）：tag=`product:chat-bot` 每天 $10，tag=`product:chat-bot-2` 每天 $100。


## 提供商预算
用于为 LLM 提供商（provider）设置预算，例如 OpenAI 每天 $100，Azure 每天 $100。

### 快速上手

在 `proxy_config.yaml` 文件中设置提供商预算
#### Proxy Config 配置
```yaml
model_list:
    - model_name: {{openai_small}}
      litellm_params:
        model: openai/{{openai_small}}
        api_key: os.environ/OPENAI_API_KEY

router_settings:
  provider_budget_config: 
    openai: 
      budget_limit: 0.000000000001 # float of $ value budget for time period
      time_period: 1d # can be 1d, 2d, 30d, 1mo, 2mo
    azure:
      budget_limit: 100
      time_period: 1d
    anthropic:
      budget_limit: 100
      time_period: 10d
    vertex_ai:
      budget_limit: 100
      time_period: 12d
    gemini:
      budget_limit: 100
      time_period: 12d
  
  # OPTIONAL: Set Redis Host, Port, and Password if using multiple instance of LiteLLM
  redis_host: os.environ/REDIS_HOST
  redis_port: os.environ/REDIS_PORT
  redis_password: os.environ/REDIS_PASSWORD

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

#### 发起测试请求

我们预期第一个请求成功，第二个请求失败，因为此时已超出 `openai` 的预算。


**[Langchain、OpenAI SDK 使用示例](../proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="成功的调用" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ]
  }'
```

</TabItem>
<TabItem label="失败的调用" value = "not-allowed">

预期这个请求会失败，因为此时已超出提供商 `openai` 的预算。

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ]
  }'
```

失败时的预期响应

```json
{
  "error": {
    "message": "No deployments available - crossed budget for provider: Exceeded budget for provider openai: 0.0007350000000000001 >= 1e-12",
    "type": "None",
    "param": "None",
    "code": "429"
  }
}
```

</TabItem>


</Tabs>




#### 提供商预算路由的工作原理

1. **预算追踪**（budget tracking）：
   - 使用 Redis 追踪每个提供商的花费
   - 按指定的时间周期（如 "1d"、"30d"）追踪花费
   - 时间周期到期后自动重置花费

2. **路由逻辑**（routing logic）：
   - 将请求路由到未超出预算上限的提供商
   - 跳过已超出预算的提供商
   - 如果所有提供商都超出预算，则抛出错误

3. **支持的时间周期**：
   - 秒："Xs"（如 "30s"）
   - 分钟："Xm"（如 "10m"）
   - 小时："Xh"（如 "24h"）
   - 天："Xd"（如 "1d"、"30d"）
   - 月："Xmo"（如 "1mo"、"2mo"）

4. **前提要求**：
   - 跨实例追踪花费需要 Redis
   - 提供商名称必须是 litellm 支持的提供商名称，参见 [支持的提供商](https://docs.litellm.ai/docs/providers)

### 监控提供商剩余预算

#### 获取预算与花费详情

通过这个端点查询某个提供商当前的预算、已花费金额以及预算重置时间

请求示例

```bash
curl -X GET http://localhost:4000/provider/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

响应示例

```json
{
    "providers": {
        "openai": {
            "budget_limit": 1e-12,
            "time_period": "1d",
            "spend": 0.0,
            "budget_reset_at": null
        },
        "azure": {
            "budget_limit": 100.0,
            "time_period": "1d",
            "spend": 0.0,
            "budget_reset_at": null
        },
        "anthropic": {
            "budget_limit": 100.0,
            "time_period": "10d",
            "spend": 0.0,
            "budget_reset_at": null
        },
        "vertex_ai": {
            "budget_limit": 100.0,
            "time_period": "12d",
            "spend": 0.0,
            "budget_reset_at": null
        }
    }
}
```

#### Prometheus 指标

LiteLLM 会在 Prometheus 上输出以下指标，用于追踪每个提供商的剩余预算

该指标以美元（USD）为单位，表示某个提供商的剩余预算

```
litellm_provider_remaining_budget_metric{api_provider="openai"} 10
```


## 模型预算

用于为模型设置预算，例如 openai/gpt-5.6-terra 每天 $10，openai/gpt-5.6-luna 每天 $100

### 快速上手

在 `proxy_config.yaml` 文件中设置模型预算

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
      max_budget: 0.000000000001 # (USD)
      budget_duration: 1d # (Duration. can be 1s, 1m, 1h, 1d, 1mo)
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      max_budget: 100 # (USD)
      budget_duration: 30d # (Duration. can be 1s, 1m, 1h, 1d, 1mo)


```


#### 发起测试请求

我们预期第一个请求成功，第二个请求失败，因为此时已超出 `openai/{{openai_large}}` 的预算。

**[Langchain、OpenAI SDK 使用示例](../proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="成功的调用" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ]
  }'
```

</TabItem>
<TabItem label="失败的调用" value = "not-allowed">

预期这个请求会失败，因为此时已超出 `openai/{{openai_large}}` 的预算。

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ]
  }'
```

失败时的预期响应

```json
{
    "error": {
        "message": "No deployments available - crossed budget: Exceeded budget for deployment model_name: {{openai_large}}, litellm_params.model: openai/{{openai_large}}, model_id: dbe80f2fe2b2465f7bfa9a5e77e0f143a2eb3f7d167a8b55fb7fe31aed62587f: 0.00015250000000000002 >= 1e-12",
        "type": "None",
        "param": "None",
        "code": "429"
    }
}
```
</TabItem>

</Tabs>

## ✨ 标签预算

<EnterpriseFeature />

用于为标签（tag）设置预算，例如 tag=`product:chat-bot` 每天 $10，tag=`product:chat-bot-2` 每天 $100


### 快速上手

在 `proxy_config.yaml` 文件中设置 `tag_budget_config` 来配置标签预算

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  tag_budget_config:
    product:chat-bot: # (Tag)
      max_budget: 0.000000000001 # (USD)
      budget_duration: 1d # (Duration)
    product:chat-bot-2: # (Tag)
      max_budget: 100 # (USD)
      budget_duration: 1d # (Duration)
```

#### 发起测试请求

我们预期第一个请求成功，第二个请求失败，因为此时已超出 `openai/{{openai_large}}` 的预算。

**[Langchain、OpenAI SDK 使用示例](../proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="成功的调用" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ],
    "metadata": {"tags": ["product:chat-bot"]}
  }'
```

</TabItem>
<TabItem label="失败的调用" value = "not-allowed">

预期这个请求会失败，因为此时已超出 tag=`product:chat-bot` 的预算。

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ],
    "metadata": {"tags": ["product:chat-bot"]}
  }

```

失败时的预期响应

```json
{
    "error": {
        "message": "No deployments available - crossed budget: Exceeded budget for tag='product:chat-bot', tag_spend=0.00015250000000000002, tag_budget_limit=1e-12",
        "type": "None",
        "param": "None",
        "code": "429"
    }
}
```

</TabItem>

</Tabs>

## 多实例部署

如果采用多实例部署，需要在 `proxy_config.yaml` 文件中设置 Redis 的主机、端口和密码。Redis 用于在多个 LiteLLM 实例之间同步花费数据。

```yaml
model_list:
    - model_name: {{openai_small}}
      litellm_params:
        model: openai/{{openai_small}}
        api_key: os.environ/OPENAI_API_KEY

router_settings:
  provider_budget_config: 
    openai: 
      budget_limit: 0.000000000001 # float of $ value budget for time period
      time_period: 1d # can be 1d, 2d, 30d, 1mo, 2mo
  
  # 👇 Add this: Set Redis Host, Port, and Password if using multiple instance of LiteLLM
  redis_host: os.environ/REDIS_HOST
  redis_port: os.environ/REDIS_PORT
  redis_password: os.environ/REDIS_PASSWORD

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

## provider_budget_config 规格说明

`provider_budget_config` 是一个字典，其中：
- **键**（Key）：提供商名称（字符串），必须是有效的 [LiteLLM 提供商名称](https://docs.litellm.ai/docs/providers)
- **值**（Value）：预算配置对象，包含以下参数：
  - `budget_limit`：浮点数，表示以美元（USD）计的预算金额
  - `time_period`：时长字符串，取以下格式之一：
    - 秒：`"Xs"`（如 "30s"）
    - 分钟：`"Xm"`（如 "10m"）
    - 小时：`"Xh"`（如 "24h"）
    - 天：`"Xd"`（如 "1d"、"30d"）
    - 月：`"Xmo"`（如 "1mo"、"2mo"）

示例结构：
```yaml
provider_budget_config:
  openai:
    budget_limit: 100.0    # $100 USD
    time_period: "1d"      # 1 day period
  azure:
    budget_limit: 500.0    # $500 USD
    time_period: "30d"     # 30 day period
  anthropic:
    budget_limit: 200.0    # $200 USD
    time_period: "1mo"     # 1 month period
  gemini:
    budget_limit: 50.0     # $50 USD
    time_period: "24h"     # 24 hour period
```
