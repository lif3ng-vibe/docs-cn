---
title: "DeepAgents"
description: "运行 DeepAgents 示例，并将其智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/deepagents"
sidebar_label: "DeepAgents"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/deepagents/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/deepagents/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# DeepAgents

如果想让编码智能体（coding agent）代为配置，可以使用[让它帮我配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它不会改动你现有的模型连接，并在配置完成后验证一条真实的追踪记录（trace）。

使用本仓库中可直接运行的示例，把 DeepAgents 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要有[与 LiteLLM 一起安装的 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)、一个具备模型访问权限的密钥，以及一个已配置好的模型别名（model alias）。集群示例还需要一个支持工具调用（tool calls）的模型。在 **Lens > Traces > Set up tracing** 中点击 **Generate tracing key**，并在 **Connection details** 下复制 **Traces endpoint**。如果你无权创建追踪密钥，请向管理员索取这些信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库中锁定的 Python 版本，并通过各自的 uv workspace 解析每个示例的依赖。

## 配置

如果是全新克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/deepagents
cp .env.example .env
```

如果已经克隆过仓库，请在 `deepagents/` 目录下执行后续命令。把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/deepagents/.env.example) 复制为 `.env`（如果尚不存在），然后设置以下变量：

| 变量                  | 取值                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                                                |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                             |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，并去掉末尾的 `/v1/traces`；如果含有 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest`                       |
| `LENS_TRACING_KEY`    | Lens 追踪设置中生成的专用追踪密钥                                                                                                                                                                 |
| `LITELLM_MODEL`       | 网关上已配置的一个模型别名                                                                                                                                                                        |

仓库中自带的取值面向本地开发网关，请按你的实际部署替换。保留 `.env.example` 中的导出器设置即可；各示例会在代码里自行配置追踪导出器，并把追踪记录发送到 `LENS_URL/v1/traces`，以追踪密钥作为 Bearer Token。

除非你打算额外向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 发送一份追踪记录副本，否则不要设置 `MOCK_LITELLM_GATEWAY_URL`。

## 运行示例

### 简单智能体

单个深度智能体回答一个问题。

```bash
uv run --env-file .env --package lens-deepagents-simple simple/main.py
```

实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/deepagents/simple/main.py)。

### 智能体集群

协调者通过内置的 `task` 工具，把任务委派给 `search_agent` 和 `writer_agent`。

```bash
uv run --env-file .env --package lens-deepagents-swarm swarm/main.py
```

实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/deepagents/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在网关上打开 **Lens > Traces**，选择新生成的那次运行，找到与 `research_agent` 关联的运行，查看它的输入、输出和模型 span。集群示例则查看上文提到的各专项智能体的活动；具体的 span 布局取决于所用框架。

## 追踪的工作原理

OpenInference 会为 DeepAgents 所使用的 LangChain 运行插入埋点。示例显式使用 Responses API；子智能体的运行会嵌套在协调者的 task 工具调用之下。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果答案正常输出但追踪记录缺失，请查看终端中的导出器报错，并确认用你的追踪密钥能够访问 Lens 的采集服务。模型调用成功并不代表其追踪数据导出成功。

请使用同时支持 Responses API 和工具调用的网关模型别名。
