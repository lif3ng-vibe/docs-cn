---
title: 网关快速上手
sidebar_label: 网关快速上手
description: 启动 LiteLLM 网关，添加模型与密钥，然后将应用和 SDK 接入同一个共享端点。
---

import NavigationCards from '@site/src/components/NavigationCards';

如果你需要为团队或平台提供一个共享的 OpenAI 兼容端点，请采用这条路径。

如果你需要 Docker 部署或以数据库为主的完整配置，请改用[快速上手](/docs/proxy/docker_quick_start)；否则按下面的步骤操作，很快就能发出第一个成功的请求。

## 1. 安装网关

```bash
uv tool install 'litellm[proxy]'
```

## 2. 设置一个提供商密钥

```bash
export OPENAI_API_KEY="your-api-key"
```

## 3. 创建 `config.yaml`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: postgresql://llmproxy:dbpassword9090@db:5432/litellm
```

## 4. 启动网关

```bash
litellm --config config.yaml
```

你应该会看到代理在 `http://0.0.0.0:4000` 上启动。

## 5. 发送第一个请求

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Hello from LiteLLM Gateway"}
    ]
  }'
```

## 6. 检查响应

请求成功时，代理会返回 `200 OK`，响应体是 OpenAI 风格的格式。

助手的回复文本位于：

```text
choices[0].message.content
```

如果网关把请求路由到了 OpenAI，真实的响应大致如下：

```json
{
  "id": "chatcmpl-abc123",
  "created": 1677858242,
  "model": "{{openai_small}}",
  "object": "chat.completion",
  "system_fingerprint": "fp_406d6473f8",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I assist you today?",
        "tool_calls": null,
        "function_call": null,
        "annotations": []
      }
    }
  ],
  "usage": {
    "completion_tokens": 9,
    "prompt_tokens": 13,
    "total_tokens": 22,
    "completion_tokens_details": {
      "accepted_prediction_tokens": 0,
      "audio_tokens": 0,
      "reasoning_tokens": 0,
      "rejected_prediction_tokens": 0
    },
    "prompt_tokens_details": {
      "audio_tokens": 0,
      "cached_tokens": 0
    }
  },
  "service_tier": "default"
}
```

`id`、`created`、实际解析出的模型版本、Token 计数和消息文本都会随请求变化。其他提供商返回的字段可能更少或略有出入，但主要需要读取的字段就是 `choices[0].message.content`。

## 7. 添加密钥与管理界面

如果你需要虚拟密钥（virtual key）、花费追踪（spend tracking）或管理界面（Admin UI），下一步就该添加数据库。

- 在 `general_settings` 下添加 `database_url`
- 密钥的创建与预算管理，参考[虚拟密钥](/docs/proxy/virtual_keys)
- 用 [Admin UI](/docs/proxy/ui) 管理模型与密钥
- 想要更完整的部署配置，参考[快速上手](/docs/proxy/docker_quick_start)

## 8. 选择下一步

<NavigationCards
columns={3}
items={[
  {
    icon: "🖥️",
    title: "发起 LLM 请求",
    description: "将 LiteLLM 或 OpenAI 兼容客户端指向网关。",
    to: "/docs/proxy/user_keys",
  },
  {
    icon: "🎛️",
    title: "模型配置",
    description: "添加更多模型与网关设置。",
    to: "/docs/proxy/configs",
  },
  {
    icon: "🔑",
    title: "虚拟密钥",
    description: "创建密钥、预算与访问控制。",
    to: "/docs/proxy/virtual_keys",
  },
  {
    icon: "📈",
    title: "添加日志",
    description: "采集日志、花费与追踪记录。",
    to: "/docs/proxy/logging",
  },
  {
    icon: "🔀",
    title: "负载均衡",
    description: "在多个部署、区域或提供商之间路由。",
    to: "/docs/proxy/load_balancing",
  },
  {
    icon: "🛡️",
    title: "添加防护栏",
    description: "添加安全检查与策略执行。",
    to: "/docs/proxy/guardrails/quick_start",
  },
  {
    icon: "📊",
    title: "可靠性",
    description: "配置重试、回退与超时。",
    to: "/docs/proxy/reliability",
  },
]}
/>

## 何时改用 SDK 路径

如果你只需要在单个应用里调用模型，不需要集中式认证或共享基础设施，可以直接从 [SDK 快速上手](/docs/learn/sdk_quickstart)开始。
