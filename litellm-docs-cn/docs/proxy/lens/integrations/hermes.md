---
title: "Hermes"
description: "将 Hermes 智能体活动发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/hermes"
---

# Hermes

在按以下步骤操作之前，请先配置[追踪目标](../first-trace.md#send-your-first-trace)，并设置专用的 Lens 追踪密钥。

安装并启用社区提供的 [hermes-otel 插件](https://github.com/briancaffey/hermes-otel#install)。将 `LENS_TRACING_KEY` 设置为你的专用 Lens 追踪密钥，然后将以下内容添加到 `~/.hermes/hermes_otel.yaml`：

```yaml title="hermes_otel.yaml"
resource_attributes:
  gen_ai.agent.name: research_agent
content_capture: full
backends:
  - type: otlp
    endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}
    headers:
      Authorization: "Bearer ${LENS_TRACING_KEY}"
    metrics: false
    logs: false
```

启动一个新的 Hermes 会话并提问。所配置的名称 **research_agent** 会出现在 Lens 中。仅凭 Hermes 内置的诊断遥测，并不包含排查问题所需的对话内容。
