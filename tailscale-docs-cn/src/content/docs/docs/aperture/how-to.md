---
title: "Aperture 操作指南"
description: "配置 Aperture 提供商、访问控制、支出限额、可观测性与集成的分步指南。"
---

最后验证于 Sep 28, 2026

* [构建自定义 webhook](/docs/aperture/how-to/build-custom-webhook) — 创建自定义 webhook 集成，把 Aperture 事件数据发送到你自己的服务。

* [检查并补充预算](/docs/aperture/how-to/check-and-refill-budgets) — 查看个人与组织配额状态，并以 Aperture 管理员身份手动补充余额。

* [配置透支配额](/docs/aperture/how-to/configure-overdraft-quotas) — 将 Aperture 配额桶串联起来，当主桶耗尽时，请求可以从其他桶借用额度。

* [配置零保留模式](/docs/aperture/how-to/configure-zero-retention) — 配置 Aperture 不在磁盘上存储捕获的提示词和响应内容，并了解该设置不覆盖哪些 Chat 与钩子数据。

* [启用聊天沙箱](/docs/aperture/how-to/enable-sandbox) — 启用沙箱功能，让 Aperture 助手能在对话中运行代码、编辑文件并生成可下载的产物。

* [将使用数据导出到 S3](/docs/aperture/how-to/export-usage-data-to-s3) — 配置 Aperture 把 LLM 使用数据导出到 Amazon S3 存储桶，用于分析、归档和长期保留。

* [按头部过滤日志](/docs/aperture/how-to/filter-logs-by-header) — 在 Aperture 中为请求和响应头部建立索引，以便在受支持的 Aperture 管理仪表盘页面上按头部的有无或取值进行过滤。

* [授予 MCP 工具访问权限](/docs/aperture/how-to/grant-mcp-tool-access) — 配置 Aperture 授权，控制用户可以访问哪些连接器能力，包括 MCP 工具、资源、模板和 HTTP 代理访问。

* [授予模型访问权限](/docs/aperture/how-to/grant-model-access) — 配置 Aperture 授权，控制每个用户或组可以访问哪些模型。

* [按标签授予连接器访问权限](/docs/aperture/how-to/grant-connector-access-by-label) — 为 Aperture 连接器打标签并按标签授权，让一条授权覆盖组内的每个连接器，而不必逐一列出连接器 ID。

* [管理沙箱运维](/docs/aperture/how-to/manage-sandbox) — 监控沙箱健康状况，并了解 Aperture 聊天沙箱的安全特性。

* [设置团队预算](/docs/aperture/how-to/set-team-budget) — 在 Aperture 中配置共享配额桶，限制整个组织的 AI 总支出。

* [设置按用户的支出限额](/docs/aperture/how-to/set-per-user-spending-limits) — 在 Aperture 中配置配额桶，为单个用户设置支出限额。

* [设置护栏](/docs/aperture/how-to/set-up-guardrails) — 配置请求前钩子，在 LLM 请求到达提供商之前检查、修改或拦截它们。

* [设置按用户的 OAuth 2.0 连接器](/docs/aperture/how-to/set-up-per-user-oauth2-connector) — 使用 OAuth 2.0 授权码流程，将 Aperture 连接到需要单个用户授权的外部服务。

* [设置自托管提供商](/docs/aperture/how-to/use-self-hosted) — 在 Aperture 中把自托管 LLM 服务器配置为提供商，让你的团队可以通过你的 tailnet 访问私有模型。

* [设置管理员访问权限](/docs/aperture/how-to/set-up-admin-access) — 配置管理员角色，用于管理 Aperture 设置和访问所有用户数据。

* [设置 Amazon Bedrock](/docs/aperture/how-to/use-amazon-bedrock) — 在 Aperture 中配置 Amazon Bedrock 提供商，让你的团队可以通过 AWS 访问基础模型。

* [设置 HTTP API 连接器](/docs/aperture/how-to/set-up-http-api-connector) — 配置 Aperture 代理发往上游 REST API 的请求，并自动注入凭证。

* [设置 OpenAI 兼容提供商](/docs/aperture/how-to/use-openai-compatible-provider) — 在 Aperture 中配置 OpenAI 兼容提供商，包括 API 格式、授权和成本估算。

* [设置 Anthropic](/docs/aperture/how-to/use-anthropic) — 在 Aperture 中配置 Anthropic 提供商，让你的团队可以访问 Claude 模型。

* [设置 Gemini Enterprise Agent Platform](/docs/aperture/how-to/use-gemini-enterprise-agent-platform) — 在 Aperture 中使用 GCP 服务账号和密钥文件配置 Gemini Enterprise Agent Platform 提供商，让你的团队可以通过 Aperture 访问 Gemini 和 Claude 模型。

* [设置 Google Gemini](/docs/aperture/how-to/use-google-gemini) — 在 Aperture 中配置 Google Gemini 提供商，让你的团队可以使用 Gemini 直接 API 访问 Gemini 模型。

* [设置 Microsoft Foundry](/docs/aperture/how-to/use-microsoft-foundry) — 在 Aperture 中配置 Microsoft Foundry 提供商，让你的团队可以访问部署在 Foundry 中的 OpenAI GPT 和 Anthropic Claude 模型。

* [设置 OpenAI](/docs/aperture/how-to/use-openai) — 在 Aperture 中配置 OpenAI 提供商，让你的团队可以访问 GPT 模型。

* [设置 OpenRouter](/docs/aperture/how-to/use-openrouter) — 在 Aperture 中配置 OpenRouter 提供商，让你的团队可以通过单一聚合器访问多家提供商的模型。

* [设置直通模式](/docs/aperture/how-to/use-passthrough-mode) — 配置 Aperture 提供商转发每个客户端自己的凭证（包括订阅 OAuth 令牌）到上游提供商，而不是注入共享 API 密钥。

* [设置聊天界面](/docs/aperture/how-to/set-up-chat-ui) — 配置模型、管理模型选择器，并管理对 Aperture Chat 界面的访问。

* [设置 Vercel AI Gateway](/docs/aperture/how-to/use-vercel) — 在 Aperture 中配置 Vercel AI Gateway 提供商，让你的团队可以访问多家 LLM 提供商的模型。

* [在 Aperture 中使用 Claude Code Action](/docs/aperture/how-to/use-claude-code-action) — 配置 Claude Code GitHub Action，让请求经由 Aperture 路由，CI 运行器用 Tailscale 身份认证而不是各自的 API 密钥。

* [在 Aperture 中使用 Claude Code](/docs/aperture/how-to/use-claude-code) — 配置 Claude Code，让请求经由你的 Aperture 网关路由。

* [在 Aperture 中使用 Claude Desktop](/docs/aperture/how-to/use-claude-desktop) — 配置 Claude Desktop 应用，让 Anthropic Messages 模型推理经由你的 Aperture 网关路由。

* [在 Aperture 中使用 Codex](/docs/aperture/how-to/use-codex) — 配置 OpenAI Codex，让请求经由你的 Aperture 网关路由。

* [在 Aperture 中使用 OpenAI 兼容工具](/docs/aperture/how-to/use-openai-compatible-tools) — 配置 Roo Code、Cline 等使用 OpenAI 兼容 API 的客户端，让请求经由 Aperture 路由。

* [在 Aperture 中使用 OpenCode](/docs/aperture/how-to/use-opencode) — 配置 OpenCode，让请求经由你的 Aperture 网关路由。
