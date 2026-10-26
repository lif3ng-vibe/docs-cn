# ✨ 预算 / 速率限制层级

定义带速率限制（rate limit）的层级（tier），并将其分配给密钥。

借助这套机制，可以在大量密钥之间统一管控访问与预算（budget）。

<EnterpriseFeature />

## 1. 创建预算

```bash
curl -L -X POST 'http://0.0.0.0:4000/budget/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "budget_id": "my-test-tier",
    "rpm_limit": 0
}'
```

## 2. 将预算分配给密钥

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "budget_id": "my-test-tier"
}'
```

预期响应：

```json
{
    "key": "sk-...",
    "budget_id": "my-test-tier",
    "litellm_budget_table": {
        "budget_id": "my-test-tier",
        "rpm_limit": 0
    }
}
```

## 3. 检查预算是否已在密钥上生效

```bash
# Authorization: 👈 KEY from step 2.
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-...' \
-d '{
    "model": "<REPLACE_WITH_MODEL_NAME_FROM_CONFIG.YAML>",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan"}
    ]
}'
```


## [API 参考](https://docs.litellm.ai/api-reference/#/budget%20management)
