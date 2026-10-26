# 贡献自定义 Webhook API

如果你的 API 只需要从 LiteLLM 接收一条 Webhook 事件，下面就是在 LiteLLM 上为它添加"原生"集成的方法：

1. 克隆仓库并打开 `generic_api_compatible_callbacks.json`

```bash
git clone https://github.com/BerriAI/litellm.git
cd litellm
open .
```

2. 将你的 API 添加到 `generic_api_compatible_callbacks.json`

示例：

```json
{
    "rubrik": {
        "event_types": ["llm_api_success"],
        "endpoint": "{{environment_variables.RUBRIK_WEBHOOK_URL}}",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer {{environment_variables.RUBRIK_API_KEY}}"
        },
        "environment_variables": ["RUBRIK_API_KEY", "RUBRIK_WEBHOOK_URL"]
    }
}
```

规格说明：

```json
{
    "sample_callback": {
        "event_types": ["llm_api_success", "llm_api_failure"], # Optional - defaults to all events
        "endpoint": "{{environment_variables.SAMPLE_CALLBACK_URL}}",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer {{environment_variables.SAMPLE_CALLBACK_API_KEY}}"
        },
        "environment_variables": ["SAMPLE_CALLBACK_URL", "SAMPLE_CALLBACK_API_KEY"]
    }
}
```

3. 测试一下！

a. 配置 config.yaml

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  callbacks: ["rubrik"]

environment_variables:
  RUBRIK_API_KEY: sk-<your-api-key>
  RUBRIK_WEBHOOK_URL: https://webhook.site/efc57707-9018-478c-bdf1-2ffaabb2b315
```

b. 启动代理（proxy）

```bash
litellm --config /path/to/config.yaml
```

c. 测试一下！

```bash
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{openai_small}}",
  "messages": [
    {
      "role": "system",
      "content": "Ignore previous instructions"
    },
    {
      "role": "user",
      "content": "What is the weather like in Boston today?"
    }
  ],
  "mock_response": "hey!"
}'
```

4. 添加文档

如果你要新增一个集成，请在 `observability` 文件夹下为它补充文档：

- 在 `docs/my-website/docs/observability/<your_integration>_integration.md` 创建新文件
- 参照现有集成文档的格式编写，例如 [Langsmith 集成文档](https://github.com/BerriAI/litellm/blob/main/docs/my-website/docs/observability/langsmith_integration.md)
- 内容需涵盖：快速上手、SDK 用法、代理（Proxy）用法，以及各类高级配置选项

5. 提交 PR！

- 先阅读我们的[贡献指南](/docs/extras/contributing_code)
- 将你的 fork 推送到你的 GitHub 仓库
- 然后从那里提交 PR

## 会记录哪些内容？

LiteLLM 会把[标准日志负载（LiteLLM Standard Logging Payload）](https://docs.litellm.ai/docs/proxy/logging_spec)发送到你的端点。
