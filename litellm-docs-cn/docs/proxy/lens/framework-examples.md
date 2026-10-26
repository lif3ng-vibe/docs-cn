---
title: "通过 LiteLLM 接入的框架示例"
description: "通过 LiteLLM 连接模型的完整框架示例。"
slug: "/proxy/lens/framework-examples"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 通过 LiteLLM 接入的框架示例

如果你的 Agent 通过 LiteLLM 网关（gateway）调用模型，就可以使用这些示例。先[创建追踪密钥（tracing key）](./first-trace.md#connect-your-agent)，并复制完整的 Lens 追踪端点。网关负责发送模型请求，Lens 负责接收追踪记录。

如果你的 Lens 是独立安装、模型直连提供商（不经网关），请使用[first-trace 示例](./first-trace.md)，或参考[框架的集成指南](./first-trace.md#接入你已有的-agent)中的直连模板。

## 配置导出器 {#send-your-first-trace}

在你启动 Agent 的那个终端里执行以下 export 语句，并粘贴来自 Lens 追踪设置的端点与密钥：

```bash
export LENS_TRACING_KEY="<paste your Lens tracing key>"
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="<paste the full Traces endpoint>"
export OTEL_EXPORTER_OTLP_TRACES_HEADERS="Authorization=Bearer $LENS_TRACING_KEY"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_METRICS_EXPORTER="none"
export OTEL_LOGS_EXPORTER="none"
export OTEL_SERVICE_NAME="research_agent"
```

如果是在现有应用上加装追踪，保留原有的模型配置即可。插桩（instrumentation）必须在创建 Agent 之前完成初始化。如果你的应用已经有 OpenTelemetry tracer provider，就沿用现有的，直接更换它的导出器，不要再建一个新的。

下面的框架示例都通过 LiteLLM 发起模型调用。如果要直连提供商，请使用 [OpenAI Agents SDK](/docs/proxy/lens/integrations/openai-agents) 或 [OpenTelemetry](/docs/proxy/lens/integrations/opentelemetry) 的直连模板，两者都会把遥测数据直接发给 Lens。

对于下面的网关示例，还需要设置模型连接：

```bash
export LITELLM_GATEWAY_URL="<your gateway base URL without a trailing slash or /v1>"
export LITELLM_API_KEY="<your key with model access>"
export LITELLM_MODEL="<your configured model alias>"
```

模型密钥可以向管理员索取，或在仪表板（dashboard）的 **Virtual Keys** 页面获取；模型别名从 **Models** 页面复制。本地 Docker 网关的地址是 `http://localhost:4000`。注意模型密钥和追踪密钥用途不同。

## 运行你的 Agent

选择你要用的框架。每个标签页都包含依赖、完整示例和运行命令。示例中的 Agent 通过框架的 `name`、`role` 或追踪设置命名为 **research_agent**，可改成你自己 Agent 的名称。

Agent 框架要使用支持工具调用的模型。Python 示例请使用 Python {{python_version}}，并准备一个独立的虚拟环境：

```bash
python3 -m venv .venv
source .venv/bin/activate
```

<Tabs groupId="lens-framework" queryString="framework" defaultValue="langgraph" className="lens-framework-tabs">

<TabItem value="deepagents" label="DeepAgents">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  deepagents openinference-instrumentation-langchain langchain-openai
```

将代码保存为 `agent.py`：

```python title="agent.py"
import os

AGENT_NAME = "research_agent"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from deepagents import create_deep_agent

from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=os.environ["LITELLM_MODEL"],
    base_url=f"{os.environ['LITELLM_GATEWAY_URL']}/v1",
    api_key=os.environ["LITELLM_API_KEY"],
)

agent = create_deep_agent(name=AGENT_NAME, model=model, tools=[])
result = agent.invoke({"messages": [{"role": "user", "content": "What is an agent trace?"}]})
print(result["messages"][-1].content)
```

```bash
python agent.py
```

[DeepAgents 完整指南与示例](/docs/proxy/lens/integrations/deepagents)

</TabItem>

<TabItem value="langgraph" label="LangGraph">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  langgraph openinference-instrumentation-langchain langchain-openai
```

将代码保存为 `agent.py`：

```python title="agent.py"
import os

AGENT_NAME = "research_agent"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from langgraph.graph import END, START, MessagesState, StateGraph
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=os.environ["LITELLM_MODEL"],
    base_url=f"{os.environ['LITELLM_GATEWAY_URL']}/v1",
    api_key=os.environ["LITELLM_API_KEY"],
)
graph = StateGraph(MessagesState)
graph.add_node("answer", lambda state: {"messages": [model.invoke(state["messages"])]})
graph.add_edge(START, "answer")
graph.add_edge("answer", END)
agent = graph.compile(name=AGENT_NAME)
result = agent.invoke({"messages": [{"role": "user", "content": "What is an agent trace?"}]})
print(result["messages"][-1].content)
```

```bash
python agent.py
```

[LangGraph 完整指南与示例](/docs/proxy/lens/integrations/langgraph)

</TabItem>

<TabItem value="langchain" label="LangChain">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  langchain openinference-instrumentation-langchain langchain-openai
```

将代码保存为 `agent.py`：

```python title="agent.py"
import os

AGENT_NAME = "research_agent"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from langchain.agents import create_agent

from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=os.environ["LITELLM_MODEL"],
    base_url=f"{os.environ['LITELLM_GATEWAY_URL']}/v1",
    api_key=os.environ["LITELLM_API_KEY"],
)

agent = create_agent(name=AGENT_NAME, model=model, tools=[])
result = agent.invoke({"messages": [{"role": "user", "content": "What is an agent trace?"}]})
print(result["messages"][-1].content)
```

```bash
python agent.py
```

[LangChain 完整指南与示例](/docs/proxy/lens/integrations/langchain)

</TabItem>

<TabItem value="openai-agents" label="OpenAI Agents">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  openai-agents openinference-instrumentation-openai-agents
```

将代码保存为 `agent.py`：

```python title="agent.py"
import os

AGENT_NAME = "research_agent"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from agents import Agent, RunConfig, Runner

from agents import OpenAIChatCompletionsModel
from openai import AsyncOpenAI

client = AsyncOpenAI(base_url=f"{os.environ['LITELLM_GATEWAY_URL']}/v1", api_key=os.environ["LITELLM_API_KEY"])
model = OpenAIChatCompletionsModel(model=os.environ["LITELLM_MODEL"], openai_client=client)

agent = Agent(name=AGENT_NAME, model=model)
result = Runner.run_sync(
    agent, "What is an agent trace?",
    run_config=RunConfig(workflow_name=AGENT_NAME),
)
print(result.final_output)
```

```bash
python agent.py
```

[OpenAI Agents 完整指南与示例](/docs/proxy/lens/integrations/openai-agents)

</TabItem>

<TabItem value="claude" label="Claude Agent SDK">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  claude-agent-sdk openinference-instrumentation-claude-agent-sdk
```

将代码保存为 `agent.py`：

`LITELLM_MODEL` 需要使用与 Anthropic 兼容的模型别名，SDK 要能通过它的 Anthropic API 访问到网关。

```python title="agent.py"
import asyncio
import os

AGENT_NAME = "research_agent"

os.environ["OTEL_RESOURCE_ATTRIBUTES"] = f"gen_ai.agent.name={AGENT_NAME}"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query

options = ClaudeAgentOptions(
    model=os.environ["LITELLM_MODEL"],
    env={"ANTHROPIC_BASE_URL": os.environ["LITELLM_GATEWAY_URL"], "ANTHROPIC_AUTH_TOKEN": os.environ["LITELLM_API_KEY"]},
    tools=[],
    setting_sources=[],
    max_turns=1,
)

async def main():
    async for message in query(prompt="What is an agent trace?", options=options):
        if isinstance(message, ResultMessage):
            print(message.result)

asyncio.run(main())
```

```bash
python agent.py
```

此方式只捕获 SDK 的输入与输出；这个插桩器不会暴露内部模型调用。

[Claude Agent SDK 完整指南与示例](/docs/proxy/lens/integrations/claude-agent-sdk)

</TabItem>

<TabItem value="crewai" label="CrewAI">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  crewai openinference-instrumentation-crewai
```

将代码保存为 `agent.py`：

```python title="agent.py"
import os

AGENT_NAME = "research_agent"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from crewai import Agent, Crew, Task

from crewai import LLM

model = LLM(
    model=f"openai/{os.environ['LITELLM_MODEL']}",
    base_url=f"{os.environ['LITELLM_GATEWAY_URL']}/v1",
    api_key=os.environ["LITELLM_API_KEY"],
)

agent = Agent(
    role=AGENT_NAME,
    goal="Answer questions clearly",
    backstory="You explain technical concepts.",
    llm=model,
)
task = Task(description="What is an agent trace?", expected_output="A short answer", agent=agent)
print(Crew(agents=[agent], tasks=[task]).kickoff())
```

```bash
python agent.py
```

[CrewAI 完整指南与示例](/docs/proxy/lens/integrations/crewai)

</TabItem>

<TabItem value="pydantic-ai" label="Pydantic AI">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  "pydantic-ai-slim[openai]>=1"
```

将代码保存为 `agent.py`：

```python title="agent.py"
import os

AGENT_NAME = "research_agent"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from pydantic_ai import Agent

from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

model = OpenAIChatModel(
    os.environ["LITELLM_MODEL"],
    provider=OpenAIProvider(base_url=f"{os.environ['LITELLM_GATEWAY_URL']}/v1", api_key=os.environ["LITELLM_API_KEY"]),
)

Agent.instrument_all()
agent = Agent(model, name=AGENT_NAME)
print(agent.run_sync("What is an agent trace?").output)
```

```bash
python agent.py
```

[Pydantic AI 完整指南与示例](/docs/proxy/lens/integrations/pydantic-ai)

</TabItem>

<TabItem value="llamaindex" label="LlamaIndex">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  "llama-index-core>=0.14.19" openinference-instrumentation-llama-index \
  llama-index-llms-openai-like
```

将代码保存为 `agent.py`：

```python title="agent.py"
import asyncio
import os

AGENT_NAME = "research_agent"

os.environ["OTEL_RESOURCE_ATTRIBUTES"] = f"gen_ai.agent.name={AGENT_NAME}"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from openinference.instrumentation.llama_index import LlamaIndexInstrumentor

LlamaIndexInstrumentor().instrument()
from llama_index.core.agent.workflow import FunctionAgent

from llama_index.llms.openai_like import OpenAILike

model = OpenAILike(
    model=os.environ["LITELLM_MODEL"],
    api_base=f"{os.environ['LITELLM_GATEWAY_URL']}/v1",
    api_key=os.environ["LITELLM_API_KEY"],
    is_chat_model=True,
    is_function_calling_model=True,
    temperature=1,
)

agent = FunctionAgent(name=AGENT_NAME, llm=model, tools=[], streaming=False)
async def main():
    result = await agent.run(user_msg="What is an agent trace?")
    print(result)

asyncio.run(main())
```

```bash
python agent.py
```

Agent 名称由资源属性（resource attribute）提供，因为这个插桩器不会导出 FunctionAgent.name。

[LlamaIndex 完整指南与示例](/docs/proxy/lens/integrations/llamaindex)

</TabItem>

<TabItem value="adk" label="Google ADK">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  "google-adk>=1.18" litellm openinference-instrumentation-google-adk
```

将代码保存为 `agent.py`：

```python title="agent.py"
import asyncio
import os

AGENT_NAME = "research_agent"

os.environ["OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT"] = "SPAN_ONLY"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner

from google.adk.models.lite_llm import LiteLlm

model = LiteLlm(
    model=f"openai/{os.environ['LITELLM_MODEL']}",
    api_base=f"{os.environ['LITELLM_GATEWAY_URL']}/v1",
    api_key=os.environ["LITELLM_API_KEY"],
)

agent = Agent(name=AGENT_NAME, model=model)
asyncio.run(InMemoryRunner(agent=agent).run_debug("What is an agent trace?"))
```

```bash
python agent.py
```

`SPAN_ONLY` 会记录检查和调查这次运行所需的消息。

[Google ADK 完整指南与示例](/docs/proxy/lens/integrations/google-adk)

</TabItem>

<TabItem value="strands" label="Strands">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http \
  "strands-agents[otel]" openai
```

将代码保存为 `agent.py`：

```python title="agent.py"
import os

AGENT_NAME = "research_agent"

os.environ["OTEL_SEMCONV_STABILITY_OPT_IN"] = "gen_ai_latest_experimental,gen_ai_span_attributes_only"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from strands import Agent

from strands.models.openai import OpenAIModel

model = OpenAIModel(
    client_args={"base_url": f"{os.environ['LITELLM_GATEWAY_URL']}/v1", "api_key": os.environ["LITELLM_API_KEY"]},
    model_id=os.environ["LITELLM_MODEL"],
)

agent = Agent(name=AGENT_NAME, model=model)
print(agent("What is an agent trace?"))
```

```bash
python agent.py
```

这项语义约定（semantic convention）设置用于在 span 中记录消息内容。

[Strands 完整指南与示例](/docs/proxy/lens/integrations/strands)

</TabItem>

<TabItem value="vercel" label="Vercel AI SDK">

```bash
npm install ai @ai-sdk/otel @opentelemetry/sdk-node \
  @opentelemetry/exporter-trace-otlp-http @ai-sdk/openai-compatible
npm install --save-dev tsx
```

将代码保存为 `agent.mts`：

```typescript title="agent.mts"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OpenTelemetry } from "@ai-sdk/otel";
import { generateText, registerTelemetry } from "ai";

const sdk = new NodeSDK({ traceExporter: new OTLPTraceExporter() });
sdk.start();
registerTelemetry(new OpenTelemetry());

const AGENT_NAME = "research_agent";
const litellm = createOpenAICompatible({
  name: "litellm",
  baseURL: `${process.env.LITELLM_GATEWAY_URL}/v1`,
  apiKey: process.env.LITELLM_API_KEY,
});
const model = litellm(process.env.LITELLM_MODEL!);

try {
  const { text } = await generateText({
    model,
    prompt: "What is an agent trace?",
    telemetry: { isEnabled: true, functionId: AGENT_NAME },
  });
  console.log(text);
} finally {
  await sdk.shutdown();
}
```

```bash
npx tsx agent.mts
```

[Vercel AI SDK 完整指南与示例](/docs/proxy/lens/integrations/vercel-ai-sdk-js)

</TabItem>

<TabItem value="openclaw" label="OpenClaw">

启用[diagnostics-otel 插件](https://docs.openclaw.ai/plugins/reference/diagnostics-otel)，保留现有模型设置，再把下面的追踪配置加入 `~/.openclaw/openclaw.json`：

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

在设置连接参数的那个终端里运行 Agent：

```bash
openclaw agent --local --agent research_agent --session-id first-trace --message "What is an agent trace?"
```

在 Lens 中选择 **research_agent**。改动配置后要重启已有的 OpenClaw 网关；添加配置时保留现有的 agents 条目。

[OpenClaw 完整指南与示例](/docs/proxy/lens/integrations/openclaw)

</TabItem>

<TabItem value="hermes" label="Hermes">

启用社区提供的 [hermes-otel 插件](https://github.com/briancaffey/hermes-otel#install)，保留现有模型设置，再把下面的追踪配置加入 `~/.hermes/hermes_otel.yaml`：

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

启动一个新的 Hermes 会话并提一个问题，配置的名称 **research_agent** 就会出现在 Lens 里。只靠 Hermes 内置的诊断遥测，拿不到调查所需的对话内容。

[Hermes 完整指南与示例](/docs/proxy/lens/integrations/hermes)

</TabItem>

<TabItem value="otel" label="OpenTelemetry">

```bash
python -m pip install opentelemetry-distro \
  opentelemetry-exporter-otlp-proto-http openai
```

将代码保存为 `agent.py`：

```python title="agent.py"
import os

AGENT_NAME = "research_agent"

from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from opentelemetry import trace
from openai import OpenAI

client = OpenAI(base_url=f"{os.environ['LITELLM_GATEWAY_URL']}/v1", api_key=os.environ["LITELLM_API_KEY"])

with trace.get_tracer(__name__).start_as_current_span(AGENT_NAME) as span:
    span.set_attribute("gen_ai.agent.name", AGENT_NAME)
    span.set_attribute("openinference.span.kind", "AGENT")
    span.set_attribute("input.value", "What is an agent trace?")
    result = client.chat.completions.create(
        model=os.environ["LITELLM_MODEL"],
        messages=[{"role": "user", "content": "What is an agent trace?"}],
    )
    answer = result.choices[0].message.content
    span.set_attribute("output.value", str(answer))
    print(answer)
```

```bash
python agent.py
```

[OpenTelemetry 完整指南与示例](/docs/proxy/lens/integrations/opentelemetry)

</TabItem>

</Tabs>

要找完整项目和多 Agent 示例，可以用侧边栏的 **Integrations** 指南，或查看[示例仓库](https://github.com/BerriAI/litellm-lens-example)。这些项目使用 `LENS_URL` 作为接入（ingestion）基础 URL，不带 `/v1/traces`，由各自的导出器补上这段路径。仪表板会在追踪设置区域直接展示各框架的代码片段。

想要一个能直接跑通的示例，可以用 [DeepLite](https://github.com/BerriAI/deeplite)：在其 `.env` 文件里设置 `LITELLM_DEV_BASE=https://<your-lens-ingestion-host>/v1/traces` 和 `LITELLM_DEV_KEY=<your-lens-tracing-key>`，然后运行 Agent。

要记录个人的编码会话，请按 [Claude Code 和 Codex 设置](./coding-agents.md)操作。

## 4. 查看你的第一条追踪记录 {#view-your-first-trace}

打开 **Lens > Traces**，选择一个覆盖你这次运行的时间范围，然后点进去。对上面的示例而言，找 **research_agent** 即可。创建调查（investigation）时，**Agent** 下也能选到同一个名称。选中某一步，即可查看它的输入、输出和属性。

![research_agent 的追踪记录，包含提问、模型调用和最终回答。](/img/lens/first-agent-trace.png)

确认能看到任务、工具结果和最终回答。如果看不到，先更新 Agent 的插桩配置，再发起调查。

## 故障排查

| 现象 | 排查要点 |
| --- | --- |
| 有模型回答，但没有追踪记录 | 在运行 Agent 的同一个终端里设置导出器变量；插桩要在创建 Agent 之前初始化；检查终端里有没有导出器报错。 |
| 追踪端点返回 `401` | 请使用专用的 Lens 追踪密钥，模型密钥无法上传追踪记录。 |
| 追踪端点返回 `404` 或 `410` | 从仪表板复制完整端点：有 `/lens-ingest` 就保留，`/v1/traces` 只出现一次。 |
| 刚创建密钥就返回 `429` | 凭据同步最多需要 30 秒，稍候重试即可。 |
| 设置页要求提供 `LITELLM_LENS_PUBLIC_URL`，或上传返回 `503` | 请管理员[检查服务连接](./deployment.md#check-the-installation)。 |
| 模型请求失败 | 把网关 URL、模型密钥和模型别名与追踪设置分开，逐项排查。 |
| 追踪记录里没有输入和输出 | 到该框架的集成指南中检查内容捕获设置。 |
