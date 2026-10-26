import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 模型访问组预算

给[模型访问组](model_access_groups.md)（model access group）设置一个共享预算。凡是能访问组内模型的密钥，都从同一个池子里扣减额度，于是一整层模型可以共用同一个月度额度，而不必给每把密钥单独设预算。

当你在意的花费属于模型本身、而不是任何一个调用方时，就该用这种预算：全组织共享的 "premium" 模型层、一组昂贵的推理模型，或是无论谁来跑评估都希望封顶的评估组。

## 前提条件

- 必须先配置一个 Postgres 数据库（如 Supabase、Neon 等）

## 设置组预算

### 1. 将模型加入访问组

在部署（deployment）中添加 `model_info.access_groups`，既可以在 `config.yaml` 里配置，也可以通过 `/model/new` 接口添加。

<Tabs>

<TabItem value="config" label="config.yaml">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: premium-sonnet
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
    model_info:
      access_groups: ["premium"]
```

</TabItem>

<TabItem value="api" label="API">

```shell
curl -X POST 'http://0.0.0.0:4000/model/new' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "model_name": "premium-sonnet",
           "litellm_params": {"model": "anthropic/{{anthropic}}", "api_key": "os.environ/ANTHROPIC_API_KEY"},
           "model_info": {"access_groups": ["premium"]}
         }'
```

</TabItem>

</Tabs>

### 2. 设置组的预算

```shell
curl -X PUT 'http://0.0.0.0:4000/access_group/premium/budget' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "max_budget": 500.0,
           "budget_duration": "30d"
         }'
```

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `max_budget` | float | No | 组内共享花费达到该值后，请求将被拒绝 |
| `soft_budget` | float | No | 达到该值时触发告警，请求仍然成功 |
| `budget_duration` | string | No | 组内花费的重置周期（`"1d"`、`"7d"`、`"30d"` 等） |
| `budget_id` | string | No | 关联一个已有预算，而不是新建一个 |

以上参数至少提供一个。该调用是幂等的，重复发送会替换组的现有预算，而不是叠加出第二个预算。

### 3. 将该组授予密钥

密钥必须在它的 `models` 列表里写明这个组。正是这项授权，把密钥的花费和预算池绑在了一起。

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{
           "models": ["premium"]
         }'
```

团队、项目、组织以及按成员划分的团队范围都遵循同样的规则：起作用的是把该组授予出去的那份允许名单。

### 4. 测试

用这把密钥持续调用组内的模型，直到预算池耗尽。

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
     -H 'Authorization: Bearer sk-your-premium-key' \
     -H 'Content-Type: application/json' \
     -d '{
           "model": "premium-sonnet",
           "messages": [{"role": "user", "content": "Hello"}]
         }'
```

一旦组内花费达到 `max_budget`，所有能访问该组的密钥都会被拒绝，包括自身从未产生消费的密钥：

```json
{
  "error": {
    "message": "Budget has been exceeded! Model access group=premium Current cost: 500.12, Max budget: 500.0",
    "type": "budget_exceeded",
    "param": null,
    "code": "429"
  }
}
```

## 查看与清除预算

查看预算池及已从中扣减的花费：

```shell
curl -X GET 'http://0.0.0.0:4000/access_group/premium/budget' \
     -H "Authorization: Bearer $LITELLM_API_KEY"
```

```json
{
  "access_group": "premium",
  "spend": 245.5,
  "budget": {
    "budget_id": "f56842f7-78d7-4816-847d-b016af57df4c",
    "max_budget": 500.0,
    "soft_budget": null,
    "budget_duration": "30d",
    "budget_reset_at": "2026-09-28T00:00:00Z"
  }
}
```

清除预算不会影响组本身及其中的模型：

```shell
curl -X DELETE 'http://0.0.0.0:4000/access_group/premium/budget' \
     -H "Authorization: Bearer $LITELLM_API_KEY"
```

```json
{
  "access_group": "premium",
  "budget_deleted": true,
  "message": "Budget for access group 'premium' deleted successfully"
}
```

## 哪些请求会消耗预算池

只有当两个条件同时满足时，请求才会计入某个组：该组提供了被调用的模型，且调用方是**按名称**被授予该组的。第二个条件尤其值得留意。

允许名单里没有点出任何组，就没有可计入的对象，因而永远不会从预算池中扣减。这包括 `models: []` 或 `models: ["*"]` 的密钥、被授予 `all-proxy-models` 的密钥，以及被授予 `openai/*` 这类通配符（wildcard）的密钥，即使它们调用的模型属于某个设了预算的组。这样的密钥仍然能调用该模型，只是它的花费会落在密钥、用户、团队和组织预算上，而不是组的预算上。

因此，管理员密钥或无限制的密钥不会受组预算的限制。如果你想让某个组的上限真正成为一批调用方的天花板，就应把这些调用方直接授予该组，而不是授予通配符。

多个组同时适用时，每个组都会全额计入这笔花费。一把同时被授予 `premium` 和 `eval` 的密钥，在调用一个同时属于这两个组的模型时，这次请求的成本会分别从两个池子里扣；任何一个池子耗尽，请求都会被拒绝。

## 相关阅读

- [模型访问组](model_access_groups.md)：创建和授予访问组本身
- [标签预算](tag_budgets.md)：想封顶的花费跟着成本中心走，而不是跟着一组模型走
- [团队预算](team_budgets.md)：花费跟着调用方走
