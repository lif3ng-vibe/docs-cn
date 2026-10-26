---
title: "LangGraph"
description: "运行 LangGraph 示例，并将这些 agent 的追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/langgraph"
sidebar_label: "LangGraph"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/langgraph/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/langgraph/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# LangGraph

如果想让编码 agent（coding agent）代劳，可以使用[帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录。

通过本仓库中可直接运行的示例，将 LangGraph 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要先[与 LiteLLM 一同安装 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)，准备一个具备模型访问权限的密钥，并配置好模型别名（model alias）。在 **Lens > Traces > Set up tracing** 中，点击 **Generate tracing key**，再复制 **Connection details** 下的 **Traces endpoint**。如果你无权创建追踪密钥，请向管理员索取这些信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库中自带的 Python 版本，并通过 uv 工作区解析每个示例的依赖。

## 配置

对于刚克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/langgraph
cp .env.example .env
```

如果已经克隆过仓库，请在 `langgraph/` 目录下运行其余命令。若 `.env` 还不存在，把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/langgraph/.env.example) 复制为 `.env`，然后设置：

| 变量                  | 说明                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                                                |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                             |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，并去掉末尾的 `/v1/traces`；如果路径中带 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest` |
| `LENS_TRACING_KEY`    | Lens 追踪设置中生成的专用追踪密钥                                                                                                                                                                 |
| `LITELLM_MODEL`       | 网关上已配置的模型别名                                                                                                                                                                            |

仓库自带的默认值面向本地开发网关，实际部署时请替换成你自己的值。保留 `.env.example` 中的 exporter 设置即可，各示例会在代码中配置自己的追踪 exporter。它们会把追踪记录发送到 `LENS_URL/v1/traces`，并以追踪密钥作为 bearer token。

除非你打算向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 额外发送一份追踪副本，否则不要设置 `MOCK_LITELLM_GATEWAY_URL`。

## 运行示例

### 简单 agent

单节点图，用来回答一个问题。

```bash
uv run --env-file .env --package lens-langgraph-simple simple/main.py
```

实现代码见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/langgraph/simple/main.py)。

### Agent 蜂群

`research_agent` 图会运行 `search_agent` 和 `writer_agent` 两个子图。

```bash
uv run --env-file .env --package lens-langgraph-swarm swarm/main.py
```

实现代码见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/langgraph/swarm/main.py)。

## 验证追踪记录

示例输出答案后，在你的网关上打开 **Lens > Traces**，选中最新的这次运行，找到与 `research_agent` 关联的那一次，检查其中的输入、输出和模型 span（追踪片段）。对于蜂群示例，检查上文描述的各个专项 agent 的活动；具体的 span 布局取决于框架本身。

## 追踪的工作原理

OpenInference 会对编译后的图及其各节点进行插桩。每个专项 agent 都是一个编译后的子图，其包装节点会使用不同的名称，避免同一个 agent 被重复计数。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果答案正常输出但追踪记录缺失，请查看终端里的 exporter 报错，并确认使用你的追踪密钥能正常访问 Lens 的摄取服务。模型调用成功，并不代表对应的追踪数据也导出成功了。
