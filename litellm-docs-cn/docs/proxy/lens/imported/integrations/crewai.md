---
title: "CrewAI"
description: "运行 CrewAI 示例，并把智能体的追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/crewai"
sidebar_label: "CrewAI"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/crewai/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/crewai/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# CrewAI

如果希望编码代理（coding agent）从旁协助，可以使用 [代我完成设置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。该流程会保留你现有的模型连接，并在设置完成后验证一条真实的追踪记录（trace）。

通过本仓库中可直接运行的示例，把 CrewAI 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要先[在 LiteLLM 旁安装 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)，并准备一把具备模型访问权限的密钥和一个配置好的模型别名（model alias）。在 **Lens > Traces > Set up tracing** 中，点击 **Generate tracing key**，然后复制 **Connection details** 下方的 **Traces endpoint**。如果你无权创建追踪密钥（tracing key），请向管理员索取上述信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会沿用仓库中提交的 Python 版本，并通过 uv workspace 解析每个示例的依赖。

## 配置

如果是刚克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/crewai
cp .env.example .env
```

如果仓库早已克隆好，请在 `crewai/` 目录下执行其余命令。若 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/crewai/.env.example) 还没有复制为 `.env`，先复制一份，然后设置：

| 变量                  | 说明                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 你的网关基础 URL，末尾不带斜杠和 `/v1`，例如 `http://localhost:4002`                                                                                                                              |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                             |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，并去掉末尾的 `/v1/traces`；如存在 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest`                          |
| `LENS_TRACING_KEY`    | Lens 追踪设置生成的专用追踪密钥                                                                                                                                                                   |
| `LITELLM_MODEL`       | 网关上已配置的模型别名                                                                                                                                                                            |

仓库自带的默认值面向本地开发网关，请根据实际部署替换。保留 `.env.example` 中的 exporter 设置即可，各示例会在代码中自行配置追踪导出器（trace exporter），把追踪记录发送到 `LENS_URL/v1/traces`，并以追踪密钥作为 bearer token。

除非打算向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 额外发送一份追踪副本，否则请保持 `MOCK_LITELLM_GATEWAY_URL` 不设置。

## 运行示例

### 简单智能体

单智能体的 `research_crew` 回答一个问题。

```bash
uv run --env-file .env --package lens-crewai-simple simple/main.py
```

实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/crewai/simple/main.py)。

### 智能体集群

顺序执行的 `research_crew` 依次运行 `research_agent`、`search_agent` 和 `writer_agent` 的任务。

```bash
uv run --env-file .env --package lens-crewai-swarm swarm/main.py
```

实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/crewai/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在网关上打开 **Lens > Traces**，选中新生成的这次运行。找到 `research_crew` 及其各智能体任务，查看输入、输出和模型 span。集群示例则查看上文所述各专职智能体的活动；span 的具体布局取决于所用框架。

## 追踪的工作原理

OpenInference 会对 CrewAI 的智能体和任务执行进行埋点；另一套独立的 OpenAI 埋点负责记录 CrewAI 客户端发起的模型调用。集群示例按顺序执行，因此各智能体以 crew 任务的形式运行。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果答案正常输出、追踪记录却没有出现，请查看终端中的 exporter 报错，并确认携带追踪密钥能够访问 Lens 接入服务（ingestion service）。模型调用成功并不代表追踪数据导出成功。
