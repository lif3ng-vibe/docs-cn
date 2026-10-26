---
title: "OpenAI Agents SDK"
description: "运行 OpenAI Agents SDK 示例，并把 agent 的追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/openai-agents"
sidebar_label: "OpenAI Agents SDK"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/openai-agents/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/openai-agents/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# OpenAI Agents SDK

如果想让编码 agent 从旁协助，可以使用 [帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录

使用本仓库中可直接运行的示例，把 OpenAI Agents SDK 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要 [Lens](https://github.com/BerriAI/lens/blob/main/deploy/lens/README.md)，既可以随 ClickHouse 独立部署，也可以连接到 LiteLLM。如果设置面板尚未打开，请打开 **Traces** 页面并选择 **Set up tracing**。然后创建一个追踪密钥（tracing key），并复制 **Traces endpoint**。提供商凭据要与这枚遥测密钥分开保管。示例既支持直接调用 OpenAI，也支持通过已有的 LiteLLM 网关发起调用

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库内置的 Python 版本，并通过 uv workspace 解析每个示例的依赖。

## 配置

如果是全新检出：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/openai-agents
cp .env.direct.example .env
```

如果已经克隆过仓库，请在 `openai-agents/` 目录下执行其余命令。若采用直连提供商的方式，在 `.env` 中设置 `OPENAI_API_KEY` 和 `OPENAI_MODEL`，再按下文说明设置 `LENS_URL` 和 `LENS_TRACING_KEY`。`LITELLM_GATEWAY_URL` 保持不设置。此时模型请求发往 OpenAI，遥测数据发往 Lens

若通过网关调用，请改用 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/openai-agents/.env.example)，并设置其中三个 `LITELLM_*` 变量。这些示例保留了网关的请求尝试记录与花费关联行为

| 变量                  | 说明                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`      | 直连调用时使用的提供商凭据                                                                                                                                                                        |
| `OPENAI_MODEL`        | 直连调用时使用的提供商模型名                                                                                                                                                                      |
| `OPENAI_BASE_URL`     | 可选，OpenAI 兼容提供商的基础 URL；若该提供商要求，则需包含 `/v1`                                                                                                                                  |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不要带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                                               |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                              |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，去掉末尾的 `/v1/traces`；如有 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest`                              |
| `LENS_TRACING_KEY`    | 在 Lens 追踪设置中创建的专用追踪密钥                                                                                                                                                                |
| `LITELLM_MODEL`       | 在 LiteLLM 网关上配置好的模型别名                                                                                                                                                                   |

网关模板默认面向本地开发网关，请根据自己的部署替换其中的模型连接配置。示例在代码中配置追踪导出器，并显式替换 SDK 默认的 OpenAI 追踪导出器。追踪数据会发送到 `LENS_URL/v1/traces`，追踪密钥作为 bearer token 携带。

除非打算额外向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 发送一份追踪副本，否则 `MOCK_LITELLM_GATEWAY_URL` 保持不设置。

## 运行示例

### 简单 agent

`research_agent` 在 `research_workflow` 中回答一个问题。

```bash
uv run --env-file .env --package lens-openai-agents-simple simple/main.py
```

实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/openai-agents/simple/main.py)。

### Agent 集群

一个协调者通过 agents-as-tools 方式调用 `search_agent` 和 `writer_agent`。

```bash
uv run --env-file .env --package lens-openai-agents-swarm swarm/main.py
```

实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/openai-agents/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在独立部署或内嵌的 Lens 界面中打开 **Lens > Traces**，选中新产生的这次运行。找到 `research_workflow` 及其 `research_agent` span。查看其中的输入、输出和模型 span。对于集群示例，则查看上文描述的各专项 agent 活动；具体 span 布局取决于所用框架。

## 追踪的工作原理

OpenInference 会把 SDK agent 与 Responses API 的 span 导出到 Lens。配置了网关时，共享网关传输层会记录每一次实际发出的模型请求及其网关调用 ID，重试也不例外。

请求尝试与花费关联的细节见 [shared gateway transport](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/shared/README.md)。

## 故障排查

模型调用失败时，请检查提供商密钥和模型名；若走网关，则检查网关 URL、模型密钥和模型别名。如果答案正常输出但追踪记录缺失，请查看终端里的导出器报错，并确认用你的追踪密钥能否访问 Lens 的数据接入服务。模型调用成功并不代表追踪数据也导出成功。

请使用支持 Responses API 的模型。集群示例还要求模型支持工具调用。
