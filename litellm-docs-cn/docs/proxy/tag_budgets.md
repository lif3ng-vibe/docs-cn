import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 设置标签预算

通过标签（tag）追踪 API 请求的花费并设置预算。标签可以按不同的成本中心、项目和部门对费用进行归类和监控。

## 前提条件

- 必须先准备好一个 Postgres 数据库（如 Supabase、Neon 等）

## 什么是标签？

标签是附加在 LLM 请求上的标记，用来按类别追踪和限制花费。

**常见使用场景**：
- **成本中心追踪**：把 LLM 成本分摊到具体的部门或业务单元（如 "engineering"、"marketing"、"customer-support"）
- **按项目编制预算**：为不同项目或专项设定预算（如 "project-alpha"、"chatbot-v2"）
- **客户归属**：追踪每个客户的花费（如 "customer-acme"、"customer-techcorp"）
- **功能监控**：监控特定功能的成本（如 "feature-chat"、"feature-summarization"）

标签可以在每个请求上设置（放在 `metadata` 中，或通过 `x-litellm-tags` 请求头传入），也可以绑定到虚拟密钥（virtual key）上，这样使用该密钥的每个请求都会自动继承该标签及其预算限制。

## 设置标签预算

### 1. 创建带预算的标签

创建一个标签来代表某个成本中心、项目或任意预算类别。设置 `max_budget`（允许花费的金额）和 `budget_duration`（预算多久重置一次）。

**示例**：为工程部门创建一个每月 500 美元预算的标签

#### API

创建一个新标签，并设置 `max_budget` 和 `budget_duration`

```shell
curl -X POST 'http://0.0.0.0:4000/tag/new' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
            "name": "engineering",
            "description": "Engineering department cost center",
            "max_budget": 500.0,
            "budget_duration": "30d",
            "rpm_limit": 100,
            "tpm_limit": 100000
        }'
```

**请求体参数**：

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `name` | string | Yes | 标签的唯一名称（如成本中心名称） |
| `description` | string | No | 说明该标签追踪的内容 |
| `models` | list[string] | No | 将标签限定到特定模型 |
| `max_budget` | float | No | 预算上限（美元） |
| `budget_duration` | string | No | 预算重置频率（如 "30d"、"1d"） |
| `soft_budget` | float | No | 用于告警的软预算上限 |
| `rpm_limit` | int | No | 该标签在所有密钥和团队下每分钟允许的最大请求数 |
| `tpm_limit` | int | No | 该标签在所有密钥和团队下每分钟允许的最大 Token 数 |

**响应**：

```json
{
  "name": "engineering",
  "description": "Engineering department cost center",
  "max_budget": 500.0,
  "budget_duration": "30d",
  "budget_reset_at": "2025-11-10T00:00:00Z",
  "created_at": "2025-10-11T00:00:00Z"
}  
```

#### LiteLLM 管理界面

进入 **Tag Management**（标签管理）页面，点击 **Create New Tag**（新建标签），填写标签详情并设置预算：

<Image 
  img={require('../../img/tag_budget1.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br />


**`budget_duration` 的可选值**：

| `budget_duration` | 预算重置时间 |
| --- | --- |
| `budget_duration="1s"` | 每 1 秒 |
| `budget_duration="1m"` | 每 1 分钟 |
| `budget_duration="1h"` | 每 1 小时 |
| `budget_duration="1d"` | 每 1 天 |
| `budget_duration="7d"` | 每 1 周 |
| `budget_duration="30d"` | 每 1 个月 |

### 2. 将标签绑定到 API 密钥（推荐）

在创建或更新虚拟密钥时绑定标签。使用该密钥发出的每个请求都会自动继承标签，代理会强制执行该标签的预算，而**无需**客户端在每次请求时传入 `metadata.tags`。

#### API

在 `/key/generate` 或 `/key/update` 上使用顶层的 `tags` 字段：

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
            "tags": ["engineering"]
        }'
```

也可以在 `metadata` 键下设置标签：

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
            "metadata": {
              "tags": ["engineering"]
            }
        }'
```

#### LiteLLM 管理界面

进入 **Virtual Keys**（虚拟密钥）→ **Create Key**（新建密钥），或直接编辑现有密钥，然后在 **Tags** 字段中选择标签。

<Image
  img={require('../../img/add_tag_in_key_creation.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

### 3. 在请求中使用标签（可选）

如果标签没有绑定到 API 密钥上，就需要在每个请求的 `metadata` 字段里带上标签（或通过 `x-litellm-tags` 请求头传入，参见[请求标记](request_tags.md)）：

<Tabs>

<TabItem value="openai" label="OpenAI SDK">

```python
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM proxy key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello"}],
    extra_body={
        "metadata": {
            "tags": ["engineering"]
        }
    }
)
```

</TabItem>

<TabItem value="curl" label="cURL">

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "model": "{{openai_large}}",
           "messages": [{"role": "user", "content": "Hello"}],
           "metadata": {
               "tags": ["engineering"]
           }
         }'
```

</TabItem>

</Tabs>

### 4. 测试

用第 2 步的虚拟密钥持续发请求，直到超出标签预算。如果标签已经绑定在密钥上，就**不需要**再传 `metadata.tags`：

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H 'Authorization: Bearer sk-your-key-with-engineering-tag' \
     -H 'Content-Type: application/json' \
     -d '{
           "model": "{{openai_large}}",
           "messages": [{"role": "user", "content": "Hello"}]
         }'
```

如果跳过了第 2 步，就改为在请求体里带上标签：

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "model": "{{openai_large}}",
           "messages": [{"role": "user", "content": "Hello"}],
           "metadata": {
               "tags": ["engineering"]
           }
         }'
```

**超出预算时，请求会被拒绝并返回 HTTP 422**：

```json
{
  "error": {
    "message": "Budget has been exceeded! Tag=engineering Current cost: 505.50, Max budget: 500.0",
    "type": "budget_exceeded",
    "param": null,
    "code": "422"
  }
}
```

## 设置标签速率限制

在标签上设置 `rpm_limit` 和 `tpm_limit`，即可限制该标签每分钟的请求数和 Token 数。限制作用于标签本身，因此用量会在所有携带该标签的密钥和团队之间共享，无论标签来自请求的 `metadata.tags`、`x-litellm-tags` 请求头，还是密钥上绑定的标签。这与密钥元数据里按密钥生效的 `tag_rpm_limit` 映射是两回事，后者会对每个密钥在同一标签下的请求分别计量。

标签上的速率限制由 v3 并行请求限制器（parallel request limiter）强制执行。一旦某个标签越过其限制，任何携带该标签的请求都会被拒绝并返回 HTTP 429，错误信息类似 `Rate limit exceeded for tag: engineering. Limit type: requests. Current limit: 100`。`rpm_limit` 在请求准入时逐个计数，`tpm_limit` 则在调用完成后按请求实际消耗的 Token 数计入，因此可能出现请求已被放行、用量落地后下一个请求被拒的情况。

创建带速率限制的标签：

```shell
curl -X POST 'http://0.0.0.0:4000/tag/new' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
            "name": "engineering",
            "rpm_limit": 100,
            "tpm_limit": 100000
        }'
```

更新已有标签的速率限制：

```shell
curl -X POST 'http://0.0.0.0:4000/tag/update' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
            "name": "engineering",
            "rpm_limit": 200,
            "tpm_limit": 200000
        }'
```

## 管理标签

### 查看标签信息

查询特定标签的信息：

```shell
curl -X POST 'http://0.0.0.0:4000/tag/info' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "names": ["engineering", "marketing"]
         }'
```

**响应**：

```json
{
  "engineering": {
    "name": "engineering",
    "description": "Engineering department cost center",
    "spend": 245.50,
    "max_budget": 500.0,
    "budget_duration": "30d",
    "budget_reset_at": "2025-11-10T00:00:00Z",
    "created_at": "2025-10-11T00:00:00Z",
    "updated_at": "2025-10-11T12:30:00Z"
  },
  "marketing": {
    "name": "marketing",
    "description": "Marketing department cost center",
    "spend": 89.20,
    "max_budget": 300.0,
    "budget_duration": "30d",
    "budget_reset_at": "2025-11-10T00:00:00Z",
    "created_at": "2025-10-11T00:00:00Z",
    "updated_at": "2025-10-11T12:30:00Z"
  }
}
```

### 更新标签预算

更新已有标签的预算：

```shell
curl -X POST 'http://0.0.0.0:4000/tag/update' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "name": "engineering",
           "max_budget": 750.0,
           "budget_duration": "30d"
         }'
```

### 删除标签

```shell
curl -X POST 'http://0.0.0.0:4000/tag/delete' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "name": "engineering"
         }'
```

## 单个请求使用多个标签

可以在单个请求上同时应用多个标签，从不同维度并行追踪成本。例如同时追踪成本中心和具体项目：

```python
response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello"}],
    extra_body={
        "metadata": {
            "tags": ["engineering", "project-alpha", "customer-acme"]
        }
    }
)
```

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "model": "{{openai_large}}",
           "messages": [{"role": "user", "content": "Hello"}],
           "metadata": {
               "tags": ["engineering", "project-alpha", "customer-acme"]
           }
         }'
```

**预算管控**：只要有一个标签超出其预算，请求就会被拒绝。
