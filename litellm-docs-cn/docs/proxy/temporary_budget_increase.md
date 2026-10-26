# ✨ 临时预算提升

为 LiteLLM 虚拟密钥（virtual key）设置临时预算提升。如果有人要求临时调高某个密钥的预算，就可以用这个功能。


| 层级 | 是否支持 | 
|-----------|-----------|
| LiteLLM 虚拟密钥 | ✅ |
| 用户 | ❌ |
| 团队 | ❌ |
| 组织 | ❌ |

<EnterpriseFeature feature="临时预算提升" />

1. 创建一个带预算的 LiteLLM 虚拟密钥

```bash
curl -L -X POST 'http://localhost:4000/key/generate' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer LITELLM_MASTER_KEY' \
-d '{
    "max_budget": 0.0000001
}'
```

预期响应：

```json
{
    "key": "sk-your-new-key"
}
```

2. 更新密钥，设置临时预算提升

```bash
curl -L -X POST 'http://localhost:4000/key/update' \
-H 'Authorization: Bearer LITELLM_MASTER_KEY' \
-H 'Content-Type: application/json' \
-d '{
    "key": "sk-your-new-key",
    "temp_budget_increase": 100, 
    "temp_budget_expiry": "2025-01-15"
}'
```

3. 测试一下！

```bash
curl -L -X POST 'http://localhost:4000/chat/completions' \
-H 'Authorization: Bearer sk-your-new-key' \
-H 'Content-Type: application/json' \
-d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello, world!"}]
}'
```

预期响应头：

```
x-litellm-key-max-budget: 100.0000001
```

