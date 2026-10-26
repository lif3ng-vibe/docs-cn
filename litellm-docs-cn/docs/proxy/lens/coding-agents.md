---
title: 追踪编码代理会话
description: 将你个人的 Claude Code 与 Codex 会话发送到 LiteLLM Lens。
---

import AgentPrompt from '@site/src/components/Conversion/AgentPrompt';

# 追踪编码代理会话

如果想让编码代理（coding agent）从旁协助，[帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md)针对已有的 LiteLLM 部署、独立 Lens 和外接 ClickHouse 分别准备了提示词。代理在套用本指南前应先检查已安装的版本。

把你的 Claude Code 或 Codex 个人会话发送到 [LiteLLM Lens](./index.md)，即可查看它们记录下来的活动。请在下方选择你要接入的代理。

你需要一套运行中的 Lens 安装和一个专用的 Lens 追踪密钥（tracing key）。如果从零开始，请先参照 [Lens 部署指南](./deployment/local.md)。你现有的 Claude Code 或 Codex 模型登录继续有效。

在独立版 Lens 中，打开 **Traces**，若配置面板尚未展开则选择 **Set up tracing**。在与网关捆绑发行的版本中，打开 **Lens > Traces > Set up tracing**。在 **Connection details** 下复制完整的 **Traces endpoint**（包含 `/v1/traces`），然后点击 **Generate tracing key**。若你无权创建追踪密钥，请向管理员索取。URL 中的 `/lens-ingest` 前缀要原样保留。这些设置只作用于遥测；你的模型 URL 和模型凭据保持独立不变。

## Claude Code

Claude Code 不需要任何 Lens 插件或辅助工具。它内置的 [OpenTelemetry 导出器](https://code.claude.com/docs/en/monitoring-usage)会把追踪 span 和助手响应日志直接发送给 Lens。模型调用仍可经由你的 Claude 订阅或现有 API 提供商完成；Claude 登录和模型端点都保持原样即可。

把下面的提示词粘贴给你的编码代理，让它来配置这台机器，或者按后面的手动步骤操作。

<AgentPrompt id="lens-claude-code" />

此配置要求 Lens 服务提供 `/v1/logs` 摄取路由，并使用支持助手响应日志功能的较新版本 Claude Code。

在运行 `claude` 的终端里，把端点和追踪密钥粘贴到前两行，然后整块执行。日志 URL 复用同一地址，只是把 `/v1/traces` 换成 `/v1/logs`：

```bash
export LENS_TRACING_KEY="<paste your Lens tracing key>"
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="<paste the full Traces endpoint>"
export OTEL_EXPORTER_OTLP_TRACES_HEADERS="Authorization=Bearer $LENS_TRACING_KEY"
export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT%/v1/traces}/v1/logs"
export OTEL_EXPORTER_OTLP_LOGS_HEADERS="Authorization=Bearer $LENS_TRACING_KEY"

export CLAUDE_CODE_ENABLE_TELEMETRY=1
export CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_TRACES_PROTOCOL="http/protobuf"
export OTEL_METRICS_EXPORTER=none
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_LOGS_PROTOCOL="http/protobuf"
export OTEL_RESOURCE_ATTRIBUTES="lens.session.capture=true,gen_ai.agent.name=claude-code"

export OTEL_LOG_USER_PROMPTS=1
export OTEL_LOG_ASSISTANT_RESPONSES=1
export OTEL_LOG_TOOL_DETAILS=1
export OTEL_LOG_TOOL_CONTENT=1

claude
```

这些内容开关会采集提示词、助手回复、工具参数以及受支持的工具输出，其中可能包含源代码或机密信息。只有当你打算让 Lens 部署保存这些内容时才开启。

完成一次用到工具的对话后，打开 **Lens > Traces**，选中 **claude-code**，并把追踪视图切换到 **Conversation**。你应该能看到自己的提示词、说明性输出、工具活动和最终回复。子代理以可展开的分支呈现。后台标题生成和建议提示词不会进入对话视图。

`lens.session.capture=true` 会把同一 Claude 会话 ID 的各轮对话归并进同一条追踪记录，包括续接的会话和后台代理的回复。原始追踪 ID 仍保留在 span 属性中。若想让 Claude 按每次交互分开保留追踪记录，则不要设置这个资源属性。如果你已经设置过 `OTEL_RESOURCE_ATTRIBUTES`，请把这里的值追加进去，而不是覆盖已有属性。

助手回复走的是一条与追踪 span 分开的遥测流，两个导出器都要保持开启。无需配置加入白名单的详细追踪端点。beta 导出器的覆盖范围与内容限制，参见 Claude Code 的[监控参考文档](https://code.claude.com/docs/en/monitoring-usage)。

`/v1/logs` 端点接收发给 Lens 的 OpenTelemetry 事件。这些事件会成为会话追踪的一部分，不会在常规的 LiteLLM **Logs** 界面里生成条目，也不会额外计入花费记录。

Claude 稳定版的工具输出事件不包含失败的执行和部分工具类型。若想从下一次模型请求补齐这些缺口，可以选配开启原生 API 响应体导出：

```bash
export OTEL_LOG_RAW_API_BODIES=1
export CLAUDE_CODE_OTEL_CONTENT_MAX_LENGTH=1048576
```

这会把完整的 API 响应体（包括对话历史和源内容）发送到 Lens 服务。Lens 会为 Conversation 视图提取工具结果，然后丢弃响应体属性。调大上限可以避开 Claude 默认 60 KB 的截断，在典型的短会话中没有问题，但长会话仍可能超限。响应体不完整时 Lens 会给出警告。从未被发送给后续模型请求的结果依然无法获取。`file:<dir>` 模式只在本机写入响应体，无法供给远程 Lens 服务。

下面的对话包含一条故意失败的命令。开启可选的响应体导出后，Lens 会把该命令的 stdout 连同失败信息和助手最终回复一并展示。

![Claude Code 对话，展示一条失败命令及其捕获到的输出](/img/lens-coding-agents/claude-after.jpg)

要持久化配置，请把这些变量加进用户级 `~/.claude/settings.json` 的 `env` 对象，并保留已有设置。仓库级设置无法开启遥测，也不能指定遥测去向；托管配置则可能覆盖你本地的遥测去向。

## Codex

请使用 [GitHub 上的 BerriAI Codex 集成](https://github.com/BerriAI/litellm-lens-codex-integration)。这个公开预览版支持本地 Codex 桌面端与 CLI 会话。自动配置目前支持 macOS，且要求 Python 3.11 或更高版本。 {/* keep-python-version: Codex integration prerequisite */}

把下面的提示词粘贴给你的编码代理，让它安装并配置该集成，或者按后面的手动步骤操作。

<AgentPrompt id="lens-codex" />

1. 按安装指南中的 **[从终端安装（推荐）](https://github.com/BerriAI/litellm-lens-codex-integration#from-terminal-recommended)** 操作，桌面端和 CLI 用的是同一个安装器。
2. 在 **Lens ingestion URL** 处粘贴仪表板中的完整 **Traces endpoint**。安装器接受该端点，并在 URL 带 `/lens-ingest` 时保留它。在隐藏输入处填入你的 **Lens tracing key**，选一个 **agent name**，确认后即开始记录。
3. **新建一个 Codex 会话并完成一轮对话**。打开 **Lens > Traces**，找到你选的那个代理名。

每个会话对应一条追踪记录，在一轮对话完成或中断后更新。重新打开会话会续写它的追踪记录。只有配置之后的活动才会被记录。

插件会读取新记录轮次的可见转录条目，包括说明性输出、重复消息、工具结果、模型切换和子代理。缺少完成钩子（completion hook）时，已完成的转录轮次仍可恢复。其覆盖范围与限制详见[覆盖范围与隐私说明](https://github.com/BerriAI/litellm-lens-codex-integration#what-youll-see)。要暂停记录，对 Codex 说：`Use lens-setup to pause recording.`

## 覆盖范围与故障排查

Lens 展示的是编码代理导出的内容，无法从旧追踪记录中找回缺失的内容。Claude 原生遥测导出的并不是终端的精确录像：图片、隐藏的推理过程、本地菜单、权限对话框以及部分会话事件都可能缺失。Claude 还会限制导出内容的长度，较长的工具结果或回复可能在 Lens 收到之前就被截断。Codex 会用明确的省略标记替代媒体内容，并标出不支持的转录条目。受这些限制影响，无法承诺每个会话或未来版本的代理都能呈现完全一致的结果。

如果 Claude 只显示工具而没有回复，请检查 `OTEL_LOGS_EXPORTER`、`OTEL_LOG_ASSISTANT_RESPONSES` 和日志端点。`/v1/logs` 返回 `404` 说明 Lens 服务或摄取路由需要更新。每轮对话结束后给导出器留出刷写时间。不要为了弥补回复日志缺失而开启原始 API 响应体导出。

要修改 Claude 代理名称，在 `OTEL_RESOURCE_ATTRIBUTES` 中设置 `gen_ai.agent.name`，例如 `gen_ai.agent.name=my-claude-code,developer=alice,lens.session.capture=true`。追踪过滤器和调查（investigation）的代理过滤器都要使用这个确切名称。把调查限定为 `claude-code` 时，不会自动采样到 `my-claude-code`。

追踪记录较大时，用 Conversation 视图中的 **Load next steps** 加载后续活动。某一步加载失败时，先重试再加载下一页。子代理分支各自保留自己的消息和工具结果，因此并发的代理不会被混当成同一个发言者。
