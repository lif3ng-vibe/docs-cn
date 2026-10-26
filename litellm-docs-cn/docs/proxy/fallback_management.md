# 【新增】回退管理端点

一组专用端点，用于把模型回退（fallback）的管理从通用配置中独立出来。

## 概述

这些端点让你无需改动整个代理（Proxy）配置，就能配置、查询和删除回退模型。与使用 `/config/update` 端点相比，这是一种更干净、也更安全的回退管理方式。

## 前提条件

- 必须启用数据库存储：在环境变量中设置 `STORE_MODEL_IN_DB=True`
- 配置回退之前，相关模型必须已存在于路由器（router）中

## 端点

### POST /fallback

为指定模型创建或更新回退。

**请求体**：
```json
{
  "model": "{{openai_small}}",
  "fallback_models": ["{{openai_large}}", "{{anthropic}}"],
  "fallback_type": "general"
}
```

**参数**：
- `model`（字符串，必填）：要为其配置回退的主模型名称
- `fallback_models`（字符串数组，必填）：按优先级排列的回退模型名称列表
- `fallback_type`（字符串，可选）：回退类型。可选值：
  - `"general"`（默认值）：适用于任何错误的标准回退
  - `"context_window"`：针对上下文窗口超限错误的回退
  - `"content_policy"`：针对内容政策违规的回退

**响应**：
```json
{
  "model": "{{openai_small}}",
  "fallback_models": ["{{openai_large}}", "{{anthropic}}"],
  "fallback_type": "general",
  "message": "Fallback configuration created successfully"
}
```

**cURL 示例**：
```bash
curl -X POST "http://localhost:4000/fallback" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "fallback_models": ["{{openai_large}}", "{{anthropic}}"],
    "fallback_type": "general"
  }'
```

**Python 示例**：
```python
import requests

response = requests.post(
    "http://localhost:4000/fallback",
    headers={
        "Authorization": "Bearer sk-<your-litellm-api-key>",
        "Content-Type": "application/json"
    },
    json={
        "model": "{{openai_small}}",
        "fallback_models": ["{{openai_large}}", "{{anthropic}}"],
        "fallback_type": "general"
    }
)

print(response.json())
```

### GET /fallback/\{model\}

获取指定模型的回退配置。

**参数**：
- `model`（路径参数，必填）：要查询回退的模型名称
- `fallback_type`（查询参数，可选）：要获取的回退类型（默认值为 "general"）

**响应**：
```json
{
  "model": "{{openai_small}}",
  "fallback_models": ["{{openai_large}}", "{{anthropic}}"],
  "fallback_type": "general"
}
```

**cURL 示例**：
```bash
curl -X GET "http://localhost:4000/fallback/{{openai_small}}?fallback_type=general" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**Python 示例**：
```python
import requests

response = requests.get(
    "http://localhost:4000/fallback/{{openai_small}}",
    headers={"Authorization": "Bearer sk-<your-litellm-api-key>"},
    params={"fallback_type": "general"}
)

print(response.json())
```

### DELETE /fallback/\{model\}

删除指定模型的回退配置。

**参数**：
- `model`（路径参数，必填）：要删除回退的模型名称
- `fallback_type`（查询参数，可选）：要删除的回退类型（默认值为 "general"）

**响应**：
```json
{
  "model": "{{openai_small}}",
  "fallback_type": "general",
  "message": "Fallback configuration deleted successfully"
}
```

**cURL 示例**：
```bash
curl -X DELETE "http://localhost:4000/fallback/{{openai_small}}?fallback_type=general" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**Python 示例**：
```python
import requests

response = requests.delete(
    "http://localhost:4000/fallback/{{openai_small}}",
    headers={"Authorization": "Bearer sk-<your-litellm-api-key>"},
    params={"fallback_type": "general"}
)

print(response.json())
```

### 测试回退

:::warning[针对 Proxy 请求已弃用]
自 LiteLLM Proxy v1.85.0 起，传入 Proxy 请求中的 `mock_testing_fallbacks` 会被直接剥离，不再产生任何效果。目前仅在测试中直接调用 `litellm.Router` 时仍受支持。
:::

要通过 Proxy 验证回退是否生效，可在非生产环境中让主部署不可用，然后发送一个普通请求：

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{openai_small}}",
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ]
}
'
```



## 校验规则

这些端点会执行以下校验：

1. **模型存在性**：验证主模型是否存在于路由器中
2. **回退模型存在性**：确保所有回退模型都存在于路由器中
3. **禁止自我回退**：防止模型把自身设为回退目标
4. **禁止重复**：确保回退列表中没有重复的模型
5. **数据库已启用**：要求已设置 `STORE_MODEL_IN_DB=True`

## 错误响应

### 400 Bad Request
```json
{
  "detail": {
    "error": "Invalid fallback models: ['non-existent-model']",
    "available_models": ["{{openai_small}}", "{{openai_large}}", "{{anthropic}}"]
  }
}
```

### 404 Not Found
```json
{
  "detail": {
    "error": "Model '{{openai_small}}' not found in router",
    "available_models": ["{{openai_large}}", "{{anthropic}}"]
  }
}
```

### 500 Internal Server Error
```json
{
  "detail": {
    "error": "Router not initialized"
  }
}
```

## 回退类型详解

### 通用回退
适用于模型调用过程中发生的任何类型的错误，是最常见的回退类型。

**适用场景**：模型不可用、被限流或返回错误时。

```json
{
  "model": "{{openai_small}}",
  "fallback_models": ["{{openai_large}}", "{{anthropic}}"],
  "fallback_type": "general"
}
```

### 上下文窗口回退
仅在发生上下文窗口超限错误时触发。

**适用场景**：输入超出主模型的上下文窗口时，回退到上下文窗口更大的模型。下方的模型 id 仅为示意，因其上下文窗口大小而保留。

```json keep-model-ids
{
  "model": "gpt-3.5-turbo",
  "fallback_models": ["gpt-4-32k", "claude-3-opus"],
  "fallback_type": "context_window"
}
```

### 内容政策回退
仅在发生内容政策违规时触发。

**适用场景**：主模型因安全过滤拒绝内容时，回退到内容政策不同的模型。

```json
{
  "model": "{{openai_large}}",
  "fallback_models": ["{{anthropic}}"],
  "fallback_type": "content_policy"
}
```

## 相比 /config/update 的优势

1. **安全性**：只修改回退配置，不会误改其他设置
2. **简单性**：API 职责单一，校验提示清晰
3. **粒度**：可按模型、按类型分别管理回退
4. **校验**：应用之前先检查配置是否有效
5. **清晰**：报错信息明确，并列出可用模型

## 注意事项

- 回退会在配置的重试次数全部失败后触发
- 回退按 `fallback_models` 中指定的顺序依次尝试
- 最多尝试的回退次数由路由器的 `max_fallbacks` 设置控制
- 变更立即生效，并持久化保存到数据库

## 预算回退

- [预算回退](./budget_fallbacks)：当某个密钥的 `model_max_budget` 超出上限时，把请求改路由到另一个模型，而不是返回 `budget_exceeded`。
