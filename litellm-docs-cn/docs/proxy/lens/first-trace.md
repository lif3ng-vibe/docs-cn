---
title: "发送你的第一条追踪记录"
description: "向 Lens 发送一次模型调用，然后接入你现有的 Agent。支持独立运行的 Lens，也支持 LiteLLM 内置的 Lens。"
slug: "/proxy/lens/first-trace"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 发送你的第一条追踪记录

向 Lens 发送一次模型调用，然后在 **Traces** 页面查看它。以下步骤既适用于独立运行的 Lens，也适用于 LiteLLM 仪表板中的 Lens。

你需要一个正在运行的 Lens 服务、Python {{python_version}}，以及一个模型密钥（model key）。如果 Lens 还没有就绪，请先参照[部署 Lens](./deployment.md)。示例会发起一次模型调用，可能产生提供商侧的费用。

如果你已经有自己的 Agent，也可以改为参照对应的[框架指南](#接入你已有的-agent)，并沿用现有的模型设置。

## 1. 获取追踪密钥与端点 {#connect-your-agent}

按你打算使用它的方式打开 Lens：

| 你的部署方式 | 打开 Lens 的位置 |
| --- | --- |
| 已接入 LiteLLM | 登录 LiteLLM，在侧边栏选择 **Lens**。 |
| 独立部署 | 打开 Lens URL 下的 `/ui/` 路径，使用 `LENS_ADMIN_TOKEN` 登录。 |

在 Lens 首页展开 **Tracing key**，选择 **Generate tracing key**。如果你的 Lens 版本显示的是追踪设置面板，就在该面板中使用 **Generate tracing key**。如果按钮不可用，请向你的 Lens 或网关管理员申请一个专用的追踪密钥（tracing key）。

把密钥复制到本地环境，并从设置面板的 **Set up manually** 或 **Connection details** 中复制完整的追踪端点。该端点以 `/v1/traces` 结尾；本地快速上手场景下为 `http://localhost:4318/v1/traces`。

追踪密钥只用于上传遥测数据，不会调用模型，也不能读取追踪记录。请将它与模型密钥、管理员令牌分开保管。

## 2. 准备示例 {#send-your-first-trace}

在一个空的工作目录中创建 Python 环境，并安装追踪所需的依赖：

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install openai openinference-instrumentation-openai \
  opentelemetry-sdk opentelemetry-exporter-otlp-proto-http
```

在同一终端中设置第 1 步得到的端点和追踪密钥：

```sh
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="YOUR_FULL_TRACE_ENDPOINT"
export LENS_TRACING_KEY="YOUR_LENS_TRACING_KEY"
```

替换这些占位符。如果端点带有 `/lens-ingest` 之类的路径前缀，请保留，并确保 `/v1/traces` 只出现一次。Python 进程必须能够访问该地址。

接下来选择你的模型连接方式：

<Tabs groupId="lens-model-connection" defaultValue="direct">
<TabItem value="direct" label="直连提供商">

本示例直接调用 OpenAI。使用你的 OpenAI API 密钥，以及该密钥可用的模型：

```sh
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
export OPENAI_BASE_URL="https://api.openai.com/v1"
export LENS_EXAMPLE_MODEL="YOUR_OPENAI_MODEL"
```

如果使用其他 OpenAI 兼容的提供商，请改用它的 API 密钥、base URL 和模型名称。如果使用其他提供商的 API，请参照对应的[框架指南](#接入你已有的-agent)。

</TabItem>
<TabItem value="gateway" label="通过 LiteLLM">

使用一个具备模型访问权限的 LiteLLM 密钥、网关的 OpenAI 兼容 base URL，以及 **Models** 页面中的某个模型别名（model alias）：

```sh
export OPENAI_API_KEY="YOUR_LITELLM_MODEL_KEY"
export OPENAI_BASE_URL="https://gateway.example.com/v1"
export LENS_EXAMPLE_MODEL="YOUR_LITELLM_MODEL_ALIAS"
```

把示例主机名替换成你自己的网关。这些值只用于模型调用，前面单独配置的追踪设置仍会把遥测数据发送到 Lens。

</TabItem>
</Tabs>

示例会记录提示词（prompt）和响应文本，请使用一条可以存入 Lens 的测试提示词。

## 3. 运行一次带追踪的调用

将下面的内容保存为 `first_trace.py`：

```python title="first_trace.py"
import os

from openai import OpenAI
from openinference.instrumentation.openai import OpenAIInstrumentor
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

provider = TracerProvider(resource=Resource.create({"service.name": "lens-example"}))
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(
    endpoint=os.environ["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"],
    headers={"Authorization": f"Bearer {os.environ['LENS_TRACING_KEY']}"},
)))
trace.set_tracer_provider(provider)
OpenAIInstrumentor().instrument(tracer_provider=provider)

try:
    with trace.get_tracer("lens-example").start_as_current_span(
        "first_agent",
        attributes={"openinference.span.kind": "AGENT", "gen_ai.agent.name": "first_agent"},
    ) as span:
        prompt = "Explain an agent trace in one sentence."
        span.set_attribute("input.value", prompt)
        response = OpenAI().chat.completions.create(
            model=os.environ["LENS_EXAMPLE_MODEL"],
            messages=[{"role": "user", "content": prompt}],
            max_completion_tokens=128,
        )
        answer = response.choices[0].message.content or ""
        span.set_attribute("output.value", answer)
        print(answer)
        print(f"Trace ID: {span.get_span_context().trace_id:032x}")
finally:
    provider.shutdown()
```

在同一个终端中运行：

```sh
python first_trace.py
```

你应该会看到一条响应和一个追踪 ID。请等待进程完全退出，确保导出器（exporter）把追踪记录发送完毕。

## 4. 在 Lens 中打开追踪记录 {#view-your-first-trace}

回到 Lens，选择 **first_agent** 这个 Agent，再进入 **Traces**。如果设置页面显示 **Check for traces**，点击它。然后按示例打印的追踪 ID 打开对应的运行记录。

你应该能看到提示词、响应，以及一个子级模型 span。**Demo data** 展示的是示例数据；检查自己的追踪记录时请将其关闭。

示例没有使用工具，因此不会包含工具调用相关的 span。只有当 Lens 能把这次调用匹配到网关的花费记录时，才会显示成本；直连提供商的追踪记录不会从本示例中获得价格信息。

## 接入你已有的 Agent

保留 Agent 原有的模型连接，为它使用的框架添加埋点（instrumentation）。如果它已经配置了 OpenTelemetry tracer provider，就在该 provider 上添加或更新导出器。

| Agent 或框架 | 指南 |
| --- | --- |
| OpenAI Agents SDK | [接入 OpenAI Agents](./imported/integrations/openai-agents.md) |
| LangChain、LangGraph 或 DeepAgents | [LangChain](./imported/integrations/langchain.md)、[LangGraph](./imported/integrations/langgraph.md) 或 [DeepAgents](./imported/integrations/deepagents.md) |
| 已使用 OpenTelemetry 的应用 | [OpenTelemetry 示例](./imported/integrations/opentelemetry.md) |
| Claude Code 或 Codex 会话 | [编码 Agent 会话](./coding-agents.md) |
| 经由 LiteLLM 的其他框架 | [完整框架示例](./framework-examples.md) |

跑一个真实任务，然后打开对应的追踪记录，检查其输入、输出和预期步骤。追踪记录到达后，你可以[创建调查](./investigations.md)。

**可选**：把[接入 Agent 提示词](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)复制给你的编码 Agent，并提供 Lens URL 和所用的框架。追踪密钥请保存在本地环境中，不要写进提示词。

## 如果追踪记录没有出现 {#troubleshooting}

| 现象 | 下一步操作 |
| --- | --- |
| 模型调用失败 | 检查模型密钥、base URL 和模型名称。这些设置与 Lens 无关。 |
| 导出器返回 `401` 或 `403` | 改用专用的 Lens 追踪密钥，并确认该密钥处于启用状态且属于这个 Lens 部署。 |
| 导出器无法建立连接 | 在运行 Agent 的那台机器上检查完整端点。Lens 部署在另一台机器上时，不要使用 `localhost`。 |
| 调用成功，但 Lens 里没有数据 | 检查导出器报错，关闭演示数据，并确认所选的 Agent 和时间范围。 |
| 其他用户看不到这条追踪记录 | 检查追踪密钥的用户与团队范围，必要时请管理员核实访问权限。 |
| 框架产生的追踪记录缺少文本 | 如果打算保存提示词和响应文本，请启用该框架的内容捕获设置。 |

## 将运行关联到来源对话 {#link-a-run-to-its-source}

当一次运行由某个对话发起时（例如 Slack 线程、Teams 聊天，或你自己的机器人），请在该运行的根 Agent span 上设置以下属性。Lens 会在追踪记录顶部添加一个 **Source** 字段并附上应用的标志，悬停即可看到标题。

| 属性 | 取值说明 |
| --- | --- |
| `agent.source.type` | 对话所在的位置：`slack`、`teams`、`discord`、`linear`、`github`、`jira` 或 `custom`。缺失或未知的值会按 `custom` 处理 |
| `agent.source.url` | 指向该对话的 `https://` 链接，例如 Slack 线程的永久链接。其他协议会被忽略 |
| `agent.source.title` | 悬停链接时显示的简短文字，例如线程的第一条消息。可选 |

![Lens 在追踪记录上显示 Source: Slack，点击后会打开 Agent 应答所在的 Slack 线程。](/img/lens/trace-source-slack.png)

类型决定标志和名称，例如 `slack` 会显示 Slack 标志和 **Slack**。自己的机器人或未列出的场景请使用 `custom`。如果根 span 没有携带这些属性，Lens 会改用最早携带这些属性的 span。

```python
with tracer.start_as_current_span("research_agent") as span:
    span.set_attribute("agent.source.type", "slack")
    span.set_attribute("agent.source.url", "https://acme.slack.com/archives/C0123ABCD/p1759869540000100")
    span.set_attribute("agent.source.title", "Can you add me to the guestlist for the retro?")
    run_agent(task)
```

[追踪 API](./api.md#agent-追踪-api) 会以 `summary.source` 的形式返回来源信息，其中包含 `type`、`url` 和 `title`。
