---
title: "Claude Agent SDK"
description: "运行 Claude Agent SDK 示例，并把智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/claude-agent-sdk"
sidebar_label: "Claude Agent SDK"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/claude-agent-sdk/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/claude-agent-sdk/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Claude Agent SDK

如果想让编码智能体（coding agent）替你完成设置，可以使用[帮我完成设置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在设置完成后验证一条真实的追踪记录。

通过本仓库中可直接运行的示例，将 Claude Agent SDK 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要先完成[将 Lens 与 LiteLLM 一同部署](/docs/proxy/lens/deployment#configure-an-existing-proxy)，准备一个具备模型访问权限的密钥，并配置好模型别名（model alias）。swarm 示例还要求模型支持工具调用（tool calling）。在 **Lens > Traces > Set up tracing** 页面中，点击 **Generate tracing key**，再在 **Connection details** 下复制 **Traces endpoint**。如果你没有权限创建追踪密钥，请向管理员索取这些信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库内置的 Python 版本，并通过各自的 uv 工作区解析每个示例的依赖。

## 配置

如果是全新克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/claude-agent-sdk
cp .env.example .env
```

如果已经克隆过仓库，请在 `claude-agent-sdk/` 目录下执行后续命令。若还没有把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/claude-agent-sdk/.env.example) 复制为 `.env`，先复制一份，然后设置：

| 变量                  | 说明                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                    |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                            |
| `LENS_URL`            | 从 Lens 追踪设置里复制 **Traces endpoint**，并去掉末尾的 `/v1/traces`；路径中若带 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest` |
| `LENS_TRACING_KEY`    | Lens 追踪设置中生成的专用追踪密钥                                                                                                                                                 |
| `LITELLM_MODEL`       | 网关上已配置的模型别名                                                                                                                                                          |

仓库内置的默认值面向本地开发网关，请按自己的部署环境替换。保留 `.env.example` 中的 exporter 设置即可，各示例会在代码里自行配置追踪 exporter，并以追踪密钥作为 Bearer Token，把追踪记录发送到 `LENS_URL/v1/traces`。

除非你打算向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 额外发送一份追踪副本，否则不要设置 `MOCK_LITELLM_GATEWAY_URL`。

## 运行示例

### 简单智能体

`research_agent` 负责回答单个问题。

```bash
uv run --env-file .env --package lens-claude-agent-sdk-simple simple/main.py
```

实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/claude-agent-sdk/simple/main.py)。

### 智能体集群

由一个协调者把任务分派给 `search_agent` 和 `writer_agent` 两个子智能体。

```bash
uv run --env-file .env --package lens-claude-agent-sdk-swarm swarm/main.py
```

实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/claude-agent-sdk/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在网关上打开 **Lens > Traces**，选中新生成的这次运行，找到与 `research_agent` 关联的那条记录，查看其中的输入、输出和模型 span。swarm 示例则查看上文描述的各专项智能体的活动；span 的具体布局取决于所用框架。

## 追踪的工作原理

OpenInference 负责记录 SDK 的查询与工具 span。示例自带的 CLI 也会按示例中配置的追踪环境，导出自己的模型与工具 span。模型调用走的是网关的 Anthropic messages 端点。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果有答案输出但追踪记录缺失，请检查终端里的 exporter 报错，并确认凭你的追踪密钥能够访问 Lens 接入服务。模型调用成功并不意味着对应的追踪数据也成功导出。

swarm 示例为其配置的 Agent 工具启用了 bypassPermissions。在添加能够修改文件或执行命令的工具之前，请先审查该示例。

## 将模型调用与花费对应

本地 [adapter](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/claude-agent-sdk/gateway.py) 会把真实的 Anthropic message ID 写入 `request-id` 响应头，CLI 会将其记录在模型 span 上。流式响应的字节原样透传，不做改动。

在 `claude-agent-sdk/` 目录下另开一个终端启动它，使用 `.env` 中配置的网关：

```bash
uv run --env-file .env --package lens-claude-agent-sdk-simple gateway.py
```

让示例对着这个 adapter 运行。以下命令中 `MOCK_LITELLM_GATEWAY_URL` 保持为空，因为额外的 recorder 导出由 adapter 负责处理：

```bash
LITELLM_GATEWAY_URL=http://localhost:4319 MOCK_LITELLM_GATEWAY_URL= \
  uv run --env-file .env --package lens-claude-agent-sdk-simple simple/main.py

LITELLM_GATEWAY_URL=http://localhost:4319 MOCK_LITELLM_GATEWAY_URL= \
  uv run --env-file .env --package lens-claude-agent-sdk-swarm swarm/main.py
```

adapter 只绑定 localhost。`CLAUDE_GATEWAY_PORT` 可修改其默认端口 `4319`，请同步更新示例里的 URL。若想把追踪导出复制一份给可选的 recorder，可在启动 adapter 时设置 `MOCK_LITELLM_GATEWAY_URL=http://localhost:4318`。

在本文件夹下运行 adapter 的检查：

```bash
uv run --package lens-claude-agent-sdk-simple python -m unittest discover -s . -p test_gateway.py
```

## 参考资料

[Claude Agent SDK 可观测性](https://code.claude.com/docs/en/agent-sdk/observability)。
