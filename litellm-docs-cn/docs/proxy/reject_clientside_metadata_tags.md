# 拒绝客户端元数据标记

## 概述

`reject_clientside_metadata_tags` 设置用于阻止用户在 API 请求中传入客户端的 `metadata.tags`。这样可以确保标记（tags）只能从 API 密钥元数据中继承，用户无法擅自覆盖，避免借此影响预算追踪或路由决策。

## 适用场景

该功能在多租户（multi-tenant）场景下尤其有用：
- 需要基于 API 密钥标记严格执行预算追踪时
- 需要防止用户通过发送自定义客户端标记操纵路由决策时
- 需要确保基于标记的过滤和报表口径一致时

## 配置

在 `config.yaml` 中添加以下配置：

```yaml
general_settings:
  reject_clientside_metadata_tags: true  # Default is false/null
```

## 行为

### `reject_clientside_metadata_tags: true` 时

**被拒绝的请求示例**：
```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {
      "tags": ["custom-tag"]  # This will be rejected
    }
  }'
```

**错误响应**：
```json
{
  "error": {
    "message": "Client-side 'metadata.tags' not allowed in request. 'reject_clientside_metadata_tags'=True. Tags can only be set via API key metadata.",
    "type": "bad_request_error",
    "param": "metadata.tags",
    "code": 400
  }
}
```

**允许的请求示例**：
```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {
      "custom_field": "value"  # Other metadata fields are allowed
    }
  }'
```

### `reject_clientside_metadata_tags: false` 或未设置时

所有请求都会被放行，包括带有客户端 `metadata.tags` 的请求。

## 通过 API 密钥设置标记

启用 `reject_clientside_metadata_tags` 后，标记应设置在 API 密钥的元数据上：

```bash
curl -X POST http://localhost:4000/key/generate \
  -H "Authorization: Bearer sk-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "tags": ["team-a", "production"]
    }
  }'
```

使用该 API 密钥发起的所有请求都会自动继承这些标记。

## 完整示例配置

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: "postgresql://user:password@localhost:5432/litellm"
  
  # Reject client-side tags
  reject_clientside_metadata_tags: true
  
  # Optional: Also enforce user parameter
  enforce_user_param: true
```

## 类似功能

- `enforce_user_param` - 要求所有请求都包含 'user' 参数
- 基于标记的路由 - 利用标记实现智能请求路由
- 预算追踪 - 按标记统计花费

## 注意事项

- 该检查只作用于 LLM API 路由（如 `/chat/completions`、`/embeddings`）
- 管理端点（如 `/key/generate`）不受影响
- 该检查校验的是请求体中不存在客户端 `metadata.tags`
- 请求中仍可传入其他元数据字段
- API 密钥上设置的标记仍会应用于所有请求
