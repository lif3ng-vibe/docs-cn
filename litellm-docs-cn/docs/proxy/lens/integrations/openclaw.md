---
title: "OpenClaw"
description: "将 OpenClaw 的智能体活动发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/openclaw"
---

# OpenClaw

在执行以下步骤前，请先配置[追踪目的地（trace destination）](../first-trace.md#send-your-first-trace)，并设置专属的 Lens 追踪密钥。

启用 [diagnostics-otel 插件](https://docs.openclaw.ai/plugins/reference/diagnostics-otel)。在 `~/.openclaw/openclaw.json` 中一次性设置好智能体 ID。添加追踪配置时，保留原有的模型和工作区设置：

```json title="openclaw.json"
{
  "agents": {
    "list": [{ "id": "research_agent" }]
  },
  "plugins": {
    "entries": { "diagnostics-otel": { "enabled": true } }
  },
  "diagnostics": {
    "enabled": true,
    "otel": {
      "enabled": true,
      "tracesEndpoint": "${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}",
      "headers": { "Authorization": "Bearer ${LENS_TRACING_KEY}" },
      "captureContent": true,
      "traces": true,
      "metrics": false,
      "logs": false,
      "sampleRate": 1
    }
  }
}
```

修改配置后，重启现有的网关（gateway）。用你配置的智能体 ID 运行第一次会话：

```bash
openclaw agent --local --agent research_agent --session-id first-trace \
  --message "What is an agent trace?"
```

打开 **Lens > Traces**，选择 **research_agent**。
