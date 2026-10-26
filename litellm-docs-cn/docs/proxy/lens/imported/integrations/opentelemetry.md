---
title: "OpenTelemetry"
description: "运行 OpenTelemetry 示例，并将其智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/opentelemetry"
sidebar_label: "OpenTelemetry"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/opentelemetry/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/opentelemetry/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# OpenTelemetry

如果想让编码智能体（coding agent）代劳，可以使用 [帮我完成设置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。该流程会保留你现有的模型连接，并在设置完成后验证一条真实的追踪记录。

使用本仓库提供的可运行示例，把 OpenTelemetry 追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要 [Lens](https://github.com/BerriAI/lens/blob/main/deploy/lens/README.md)，既可以搭配 ClickHouse 独立运行，也可以连接到 LiteLLM。如果设置面板尚未打开，先进入 **追踪记录**（Traces）页面，选择 **设置追踪**（Set up tracing）。然后创建一个追踪密钥（tracing key），并复制 **追踪端点**（Traces endpoint）。提供商凭证要与这个遥测密钥分开保管。这些示例既支持直接调用 OpenAI，也支持通过现有的 LiteLLM 网关发起调用。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库中锁定的 Python 版本，并通过 uv 工作区解析每个示例的依赖。

## 配置

如果是全新克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/opentelemetry
cp .env.direct.example .env
```

如果已经克隆过仓库，请在 `opentelemetry/` 目录下执行后续命令。若直接调用提供商，请在 `.env` 中设置 `OPENAI_API_KEY` 和 `OPENAI_MODEL`，再按下文说明设置 `LENS_URL` 和 `LENS_TRACING_KEY`，`LITELLM_GATEWAY_URL` 保持不设置。此时模型请求发往 OpenAI，遥测数据则发往 Lens。

如果通过网关调用，请改用 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/opentelemetry/.env.example)，并设置三个 `LITELLM_*` 变量。这些示例保留了网关的请求尝试（request-attempt）与花费关联（spend-correlation）行为。

| 变量 | 说明 |
| --- | --- |
| `OPENAI_API_KEY` | 直接调用提供商时使用的凭证 |
| `OPENAI_MODEL` | 直接调用时使用的提供商模型名称 |
| `OPENAI_BASE_URL` | 可选的 OpenAI 兼容提供商基础 URL，若该提供商有要求则需带上 `/v1` |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不要带斜杠或 `/v1`，例如 `http://localhost:4002` |
| `LITELLM_API_KEY` | 你的 LiteLLM 模型密钥 |
| `LENS_URL` | 从 Lens 追踪设置中复制 **追踪端点**（Traces endpoint），去掉末尾的 `/v1/traces`；路径中如有 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest` |
| `LENS_TRACING_KEY` | 在 Lens 追踪设置中创建的专用追踪密钥 |
| `LITELLM_MODEL` | 在 LiteLLM 网关上配置好的模型别名 |

网关模板默认面向本地开发网关，请按自己的部署替换其中的模型连接值。`.env.example` 中的导出器（exporter）设置保持原样即可，示例会在代码里配置各自的追踪导出器。追踪数据会发送到 `LENS_URL/v1/traces`，并以追踪密钥作为 Bearer 令牌。

除非你打算额外向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 发送一份追踪记录副本，否则 `MOCK_LITELLM_GATEWAY_URL` 保持不设置。

## 运行示例

### 简单智能体

手动创建的 `research_agent` span 包裹了一次 OpenAI 模型调用。

```bash
uv run --env-file .env --package lens-opentelemetry-simple simple/main.py
```

具体实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/opentelemetry/simple/main.py)。

### 智能体集群

`research_agent` span 中包含 `search_agent` 和 `writer_agent` 两个子 span，各自发起一次模型调用。

```bash
uv run --env-file .env --package lens-opentelemetry-swarm swarm/main.py
```

具体实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/opentelemetry/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在独立部署或内嵌部署的 Lens UI 中打开 **Lens > Traces**，选中新产生的这次运行，找到与 `research_agent` 关联的那一次，查看其中的输入、输出和模型 span。如果是集群示例，则查看上文描述的各专职智能体的活动；span 的具体布局取决于所用框架。

## 追踪的工作原理

这些示例会手动创建智能体 span，并设置它们的名称、输入和输出。OpenInference 会对 OpenAI 客户端自动插桩；配置了网关时，共享网关传输层还会添加带网关调用 ID 的请求尝试 span。

请求尝试与花费关联的更多细节见 [共享网关传输层](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/shared/README.md)。

## 故障排查

模型调用失败时，请检查提供商密钥和模型名称；如果走网关，则检查网关 URL、模型密钥和模型别名。如果答案正常出现但追踪记录缺失，请查看终端中有没有导出器报错，并确认凭追踪密钥能否访问 Lens 的数据接入服务。模型调用成功并不代表追踪数据导出成功。
