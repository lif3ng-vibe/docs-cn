# ✨ 允许团队添加模型

<EnterpriseFeature />

允许团队为所属项目添加自己的模型或密钥（key），这样他们发起的每一次 OpenAI 调用都会使用自己的 OpenAI 密钥。

适合需要调用自己的微调（fine-tuning）模型的团队。

## 在 `/model/add` 端点中指定团队 ID


```bash
# Authorization: 👈 Team API Key (has same 'team_id' as below)
curl -L -X POST 'http://0.0.0.0:4000/model/new' \
-H 'Authorization: Bearer sk-******2ql3-sm28WU0tTAmA' \
-H 'Content-Type: application/json' \
-d '{
  "model_name": "my-team-model", # 👈 Call LiteLLM with this model name
  "litellm_params": {
    "model": "openai/{{openai_large}}",
    "custom_llm_provider": "openai",
    "api_key": "******ccb07",
    "api_base": "https://my-azure-endpoint.openai.azure.com",
    "api_version": "2023-12-01-preview"
  },
  "model_info": {
    "team_id": "e59e2671-a064-436a-a0fa-16ae96e5a0a1" # 👈 Specify the team ID it belongs to
  }
}'

```

## 测试一下

```bash
# Authorization: 👈 Team API Key
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-******2ql3-sm28WU0tTAmA' \
-d '{
  "model": "my-team-model", # 👈 team model name
  "messages": [
    {
      "role": "user",
      "content": "What's the weather like in Boston today?"
    }
  ]
}'

```

## 问题排查

### “model_name” 未找到

先检查团队表中是否存在对应的模型别名（model alias）。

```bash
curl -L -X GET 'http://localhost:4000/team/info?team_id=e59e2671-a064-436a-a0fa-16ae96e5a0a1' \
-H 'Authorization: Bearer sk-******2ql3-sm28WU0tTAmA' \
```

**预期响应**：

```json
{
    "team_id": "e59e2671-a064-436a-a0fa-16ae96e5a0a1",
    "team_info": {
        ...,
        "litellm_model_table": {
            "model_aliases": {
                "my-team-model": # 👈 public model name
                    "model_name_e59e2671-a064-436a-a0fa-16ae96e5a0a1_e81c9286-2195-4bd9-81e1-cf393788a1a0" # 👈 internally generated model name (used to ensure uniqueness)
            },
            "created_by": "default_user_id",
            "updated_by": "default_user_id"
        }
    }
}
```
