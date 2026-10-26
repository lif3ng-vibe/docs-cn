import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Guardrails AI

可以使用 Guardrails AI（[guardrailsai.com](https://www.guardrailsai.com/)）为 LLM 输出添加检查。

## 前置条件

- 部署 Guardrails AI 服务器，参见[快速上手](https://www.guardrailsai.com/docs/getting_started/guardrails_server)。

## 使用方法

1. 配置 config.yaml 

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "guardrails_ai-guard"
    litellm_params:
      guardrail: guardrails_ai
      guard_name: "detect-secrets-guard"            # 👈 Guardrail AI guard name
      mode: "pre_call"
      guardrails_ai_api_input_format: "llmOutput"   # 👈 This is the only option that currently works (and it is a default), use it for both pre_call and post_call hooks
      api_base: os.environ/GUARDRAILS_AI_API_BASE   # 👈 Guardrails AI API Base. Defaults to "http://0.0.0.0:8000"
```

2. 启动 LiteLLM 网关 

```shell
litellm --config config.yaml --detailed_debug
```

3. 测试请求 

**[Langchain、OpenAI SDK 使用示例](/docs/proxy/user_keys#请求格式)**

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["guardrails_ai-guard"]
  }'
```


## ✨ 按项目（API 密钥）控制防护栏

<EnterpriseFeature />

可以用它来控制每个项目分别运行哪些防护栏（guardrails）。本教程中，我们只希望以下防护栏对某一个项目（API 密钥）生效：
- `guardrails`: ["aporia-pre-guard", "aporia-post-guard"]

**步骤 1** 创建带防护栏设置的密钥

<Tabs>
<TabItem value="/key/generate" label="/key/generate">

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{
            "guardrails": ["guardrails_ai-guard"]
        }
    }'
```

</TabItem>
<TabItem value="/key/update" label="/key/update">

```shell
curl --location 'http://0.0.0.0:4000/key/update' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "key": "sk-jNm1Zar7XfNdZXp49Z1kSQ",
        "guardrails": ["guardrails_ai-guard"]
        }
}'
```

</TabItem>
</Tabs>

**步骤 2** 用新密钥测试

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer sk-jNm1Zar7XfNdZXp49Z1kSQ' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "my email is ishaan@berri.ai"
        }
    ]
}'
```
