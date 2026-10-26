---
title: 使用 Responses API 进行提示词管理
---

# 使用 Responses API 进行提示词管理

通过传入 `prompt_id` 和可选的 `prompt_variables`，即可在 `/v1/responses` 上使用 LiteLLM 的提示词管理（Prompt Management）功能。

## 基本用法

```bash
curl -X POST "http://localhost:4000/v1/responses" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "prompt_id": "my-responses-prompt",
    "prompt_variables": {"topic": "large language models"},
    "input": []
  }'
```

## 在 `input` 中进行多轮追问

若想在一次请求中发送多轮后续消息，请在 `input` 中传入消息历史。

```bash
curl -X POST "http://localhost:4000/v1/responses" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "prompt_id": "my-responses-prompt",
    "prompt_variables": {"topic": "large language models"},
    "input": [
      {"role": "user", "content": "Topic is LLMs. Start short."},
      {"role": "assistant", "content": "Sure, go ahead."},
      {"role": "user", "content": "Now give me 3 bullets and include pricing caveat."}
    ]
  }'
```

## 注意事项

- 提示词模板中的消息会与你在 `input` 中传入的消息合并。
- 提示词变量的替换会作用于提示词消息的内容。
- 工具调用的负载字段不会被提示词变量替换。
- 使用 `previous_response_id` 进行追问时，如果希望该轮继续应用提示词管理，请再次传入 `prompt_id`。
