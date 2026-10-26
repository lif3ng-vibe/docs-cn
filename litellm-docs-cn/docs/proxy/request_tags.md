import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 用请求标记追踪花费

为模型部署（deployment）添加标记（tag），即可按环境、AWS 账户或任意自定义标签追踪花费。

这些标记会出现在 LiteLLM 花费日志的 `request_tags` 字段中。

:::info[前置要求]
使用前需先配置虚拟密钥（virtual key）与数据库。参见[虚拟密钥配置](./virtual_keys.md)。
:::

## 配置设置

在 `config.yaml` 中为模型部署设置标记：

```yaml title="config.yaml"
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/gpt-4-prod
      api_key: os.environ/AZURE_PROD_API_KEY
      api_base: https://prod.openai.azure.com/
      tags: ["AWS_IAM_PROD"]  # 👈 Tag for production

  - model_name: gpt-4-dev
    litellm_params:
      model: azure/gpt-4-dev
      api_key: os.environ/AZURE_DEV_API_KEY
      api_base: https://dev.openai.azure.com/
      tags: ["AWS_IAM_DEV"]  # 👈 Tag for development
```

## 发起请求

### 方式 1：使用配置中的标记（自动）

请求只需指定模型，标记会根据配置自动应用：

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 方式 2：使用 `x-litellm-tags` 请求头

通过 `x-litellm-tags` 请求头以逗号分隔字符串的形式动态传入标记：

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -H 'x-litellm-tags: team-api,production,us-east-1' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

格式：逗号分隔的字符串（空格会自动去除）：`"tag1,tag2,tag3"`

### 方式 3：在请求体中使用 `tags`

直接在请求体中传入标记。支持以下两种格式：

<Tabs>
<TabItem value="direct" label="直接传入 tags 字段">

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "tags": ["team-api", "production", "us-east-1"]
  }'
```

</TabItem>

<TabItem value="metadata" label="嵌套在 metadata 中">

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {
      "tags": ["team-api", "production", "us-east-1"]
    }
  }'
```

</TabItem>
</Tabs>

`tags` 字段必须是字符串数组。

:::info
通过请求头或请求体提供的标记会覆盖模型部署中配置的标记。若请求头与请求体同时提供标记，则以请求体为准。
:::

## 为密钥或团队设置标记

也可以在 API 密钥（API key）或团队层面设置默认标记：

<Tabs>
<TabItem value="key" label="在密钥上设置">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "metadata": {
      "tags": ["customer-acme", "tier-premium"]
    }
  }'
```

</TabItem>
<TabItem value="team" label="在团队上设置">

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/new' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "metadata": {
      "tags": ["team-engineering", "department-ai"]
    }
  }'
```

</TabItem>
</Tabs>

## 进阶：自定义请求头追踪

在配置中加入任意自定义请求头，即可基于它追踪花费：

```yaml
litellm_settings:
  extra_spend_tag_headers:
    - "x-custom-header"
    - "x-customer-id"
```

**禁用 User-Agent 追踪**：

```yaml
litellm_settings:
  disable_add_user_agent_to_request_tags: true
```

## 花费日志

来自模型配置的标记会记录在 `LiteLLM_SpendLogs` 中：

```json
{
  "request_id": "chatcmpl-abc123",
  "request_tags": ["AWS_IAM_PROD"],
  "spend": 0.002,
  "model": "{{openai_large}}"
}
```

## 相关内容

- [花费追踪总览](cost_tracking.md)：用标记追踪花费的完整教程
- [标记预算](tag_budgets.md)：为每个标记设置预算上限
- [虚拟密钥配置](virtual_keys.md)：标记追踪的前提条件
