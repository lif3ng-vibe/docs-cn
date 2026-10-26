---
title: 集成
sidebar_label: 概览
---

import NavigationCards from '@site/src/components/NavigationCards';

export const Logo = ({ src }) => (
  <img src={src} alt="" />
);

本节收录可配合 LiteLLM（代理或 SDK）使用的各类工具与服务集成。

---

## 可观测性（observability）

借助可观测性平台对 LLM 调用进行追踪、调试与分析。

<NavigationCards
columns={3}
items={[
  {
    icon: <Logo src="/img/integrations/langfuse.png" />,
    title: "Langfuse",
    description: "LLM 可观测性与分析。",
    to: "/docs/observability/langfuse_integration",
  },
  {
    icon: <Logo src="/img/integrations/datadog.png" />,
    title: "Datadog",
    description: "指标、追踪与仪表板。",
    to: "/docs/observability/datadog",
  },
  {
    icon: <Logo src="/img/integrations/grafana.png" />,
    title: "Grafana Cloud",
    description: "LLM 追踪、GenAI 指标与仪表板。",
    to: "/docs/observability/grafana_cloud",
  },
  {
    icon: <Logo src="/img/integrations/opentelemetry.png" />,
    title: "OpenTelemetry",
    description: "厂商中立的追踪方案。",
    to: "/docs/observability/opentelemetry_integration",
  },
  {
    icon: <Logo src="/img/integrations/langsmith.png" />,
    title: "LangSmith",
    description: "LLM 调试与评估。",
    to: "/docs/observability/langsmith_integration",
  },
  {
    icon: <Logo src="/img/integrations/arize.png" />,
    title: "Arize / Phoenix",
    description: "ML 可观测性与评估。",
    to: "/docs/observability/opentelemetry_v2",
  },
  {
    icon: <Logo src="/img/integrations/helicone.png" />,
    title: "Helicone",
    description: "LLM 请求日志与分析。",
    to: "/docs/observability/helicone_integration",
  },
  {
    icon: <Logo src="/img/integrations/mlflow.png" />,
    title: "MLflow",
    description: "实验追踪。",
    to: "/docs/observability/mlflow",
  },
  {
    icon: <Logo src="/img/integrations/wandb.png" />,
    title: "Weights & Biases",
    description: "ML 实验追踪。",
    to: "/docs/observability/wandb_integration",
  },
  {
    icon: <Logo src="/img/integrations/posthog.png" />,
    title: "PostHog",
    description: "产品分析。",
    to: "/docs/observability/posthog_integration",
  },
]}
/>

[查看全部可观测性集成 →](/docs/integrations/observability_integrations)

---

## 告警与监控

设置告警、指标采集与基础设施监控。

<NavigationCards
columns={2}
items={[
  {
    icon: <Logo src="/img/integrations/prometheus.png" />,
    title: "Prometheus",
    description: "指标采集与监控。",
    to: "/docs/proxy/prometheus",
  },
  {
    icon: <Logo src="/img/integrations/pagerduty.png" />,
    title: "PagerDuty",
    description: "事件响应与告警。",
    to: "/docs/proxy/pagerduty",
  },
  {
    icon: <Logo src="/img/integrations/slack.png" />,
    title: "告警",
    description: "Slack、Teams 与 webhook 告警。",
    to: "/docs/proxy/alerting",
  },
  {
    icon: <Logo src="/img/integrations/pyroscope.png" />,
    title: "Pyroscope",
    description: "持续性能分析。",
    to: "/docs/proxy/pyroscope_profiling",
  },
]}
/>

---

## 防护栏（guardrails）提供商

为 LLM 调用加上安全防护与内容过滤。

<NavigationCards
columns={3}
items={[
  {
    icon: <Logo src="/img/integrations/lakera.png" />,
    title: "Lakera AI",
    description: "提示注入（prompt injection）检测。",
    to: "/docs/proxy/guardrails/lakera_ai",
  },
  {
    icon: <Logo src="/img/integrations/azure.png" />,
    title: "Azure Content Safety",
    description: "内容审核。",
    to: "/docs/proxy/guardrails/azure_content_guardrail",
  },
  {
    icon: <Logo src="/img/integrations/aws.png" />,
    title: "Bedrock Guardrails",
    description: "AWS Bedrock 安全防护。",
    to: "/docs/proxy/guardrails/bedrock",
  },
  {
    icon: <Logo src="/img/integrations/openai.png" />,
    title: "OpenAI 内容审核",
    description: "OpenAI 内容政策。",
    to: "/docs/proxy/guardrails/openai_moderation",
  },
  {
    icon: <Logo src="/img/integrations/litellm.png" />,
    title: "密钥泄露检测",
    description: "防止凭据泄露。",
    to: "/docs/proxy/guardrails/secret_detection",
  },
  {
    icon: <Logo src="/img/integrations/microsoft.png" />,
    title: "PII 脱敏",
    description: "对敏感数据进行脱敏。",
    to: "/docs/proxy/guardrails/pii_masking_v2",
  },
]}
/>

[查看全部防护栏提供商 →](/docs/guardrail_providers)

---

## 策略

在整个 LLM 部署中定义并执行使用策略。

<NavigationCards
columns={3}
items={[
  {
    icon: <Logo src="/img/integrations/litellm.png" />,
    title: "防护栏策略",
    description: "基于策略的防护栏规则。",
    to: "/docs/proxy/guardrails/guardrail_policies",
  },
  {
    icon: <Logo src="/img/integrations/litellm.png" />,
    title: "策略流程构建器",
    description: "可视化策略配置。",
    to: "/docs/proxy/guardrails/policy_flow_builder",
  },
  {
    icon: <Logo src="/img/integrations/litellm.png" />,
    title: "策略模板",
    description: "开箱即用的策略模板。",
    to: "/docs/proxy/guardrails/policy_templates",
  },
]}
/>

---

## AI 工具

将 LiteLLM 接入各类 AI 编程与效率工具。

<NavigationCards
columns={3}
items={[
  {
    icon: <Logo src="/img/integrations/openwebui.png" />,
    title: "OpenWebUI",
    description: "自托管的 ChatGPT 风格界面。",
    to: "/docs/tutorials/openweb_ui",
  },
  {
    icon: <Logo src="/img/integrations/anthropic.png" />,
    title: "Claude Code",
    description: "在 Claude Code 中使用 LiteLLM。",
    to: "/docs/tutorials/claude_responses_api",
  },
  {
    icon: <Logo src="/img/integrations/cursor.png" />,
    title: "Cursor",
    description: "AI 代码编辑器集成。",
    to: "/docs/tutorials/cursor_integration",
  },
  {
    icon: <Logo src="/img/integrations/github-copilot.png" />,
    title: "GitHub Copilot",
    description: "GitHub Copilot 集成。",
    to: "/docs/tutorials/github_copilot_integration",
  },
  {
    icon: <Logo src="/img/integrations/opencode.png" />,
    title: "OpenCode",
    description: "开源编程助手。",
    to: "/docs/tutorials/opencode_integration",
  },
  {
    icon: <Logo src="/img/integrations/retool.png" />,
    title: "Retool Assist",
    description: "Retool AI 助手。",
    to: "/docs/tutorials/retool_assist",
  },
]}
/>

---

## Agent SDK

将 LiteLLM 与各类代理框架及 SDK 配合使用。

<NavigationCards
columns={3}
items={[
  {
    icon: <Logo src="/img/integrations/openai.png" />,
    title: "OpenAI Agents SDK",
    description: "使用 OpenAI 的 SDK 构建代理。",
    to: "/docs/tutorials/openai_agents_sdk",
  },
  {
    icon: <Logo src="/img/integrations/anthropic.png" />,
    title: "Claude Agent SDK",
    description: "使用 Anthropic 的 SDK 构建代理。",
    to: "/docs/tutorials/claude_agent_sdk",
  },
  {
    icon: <Logo src="/img/integrations/google.png" />,
    title: "Google ADK",
    description: "Google 代理开发套件（Agent Development Kit）。",
    to: "/docs/tutorials/google_adk",
  },
  {
    icon: <Logo src="/img/integrations/copilotkit.png" />,
    title: "CopilotKit",
    description: "应用内 AI 助手。",
    to: "/docs/tutorials/copilotkit_sdk",
  },
  {
    icon: <Logo src="/img/integrations/letta.png" />,
    title: "Letta",
    description: "构建具有持久记忆的有状态 LLM 代理。",
    to: "/docs/integrations/letta",
  },
  {
    icon: <Logo src="/img/integrations/livekit.png" />,
    title: "LiveKit",
    description: "实时语音与视频 AI 代理。",
    to: "/docs/tutorials/livekit_xai_realtime",
  },
]}
/>

---

## 提示词管理

对提示词进行管理、版本控制与部署。

<NavigationCards
columns={3}
items={[
  {
    icon: <Logo src="/img/integrations/litellm.png" />,
    title: "LiteLLM 提示词管理",
    description: "内置的提示词管理。",
    to: "/docs/proxy/litellm_prompt_management",
  },
  {
    icon: <Logo src="/img/integrations/litellm.png" />,
    title: "自定义提示词管理",
    description: "接入你自己的提示词存储。",
    to: "/docs/proxy/custom_prompt_management",
  },
  {
    icon: <Logo src="/img/integrations/arize.png" />,
    title: "Arize Phoenix 提示词",
    description: "通过 Phoenix 管理提示词。",
    to: "/docs/proxy/arize_phoenix_prompts",
  },
]}
/>

---

## 用 AI 代理管理

用 AI 代理管理你的 LiteLLM 部署：通过自然语言创建用户、团队、密钥、模型等。

<NavigationCards
columns={1}
items={[
  {
    icon: <Logo src="/img/integrations/litellm.png" />,
    title: "LiteLLM 技能",
    description: "通过 Claude Code 管理 LiteLLM：用自然语言命令创建密钥、团队、模型等。",
    to: "/docs/tutorials/claude_code_skills",
  },
]}
/>
