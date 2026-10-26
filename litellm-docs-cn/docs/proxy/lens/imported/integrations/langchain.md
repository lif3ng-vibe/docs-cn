---
title: "LangChain"
description: "运行 LangChain 示例，并将其智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/langchain"
sidebar_label: "LangChain"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/langchain/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/langchain/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# LangChain

想让你的编码智能体代劳配置，可以使用 [帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录。

通过本仓库中可直接运行的示例，将 LangChain 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要先[在 LiteLLM 旁安装 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)，准备一个有模型访问权限的密钥，并配置好模型别名（model alias）。集群示例还需要一个支持工具调用的模型。在 **Lens > Traces > Set up tracing** 中点击 **Generate tracing key**，并复制 **Connection details** 下的 **Traces endpoint**。如果你无权创建追踪密钥（tracing key），请向管理员索取上述信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库内置的 Python 版本，并通过 uv 工作区解析各示例的依赖。

## 配置

如果是全新克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/langchain
cp .env.example .env
```

如果已经克隆过仓库，请在 `langchain/` 目录下执行后续命令。若 `.env` 尚不存在，先复制 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/langchain/.env.example) 为 `.env`，然后设置：

| 变量                  | 值                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 你的网关基础 URL，末尾不带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                                              |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                             |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，去掉末尾的 `/v1/traces`。如果包含 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest`                          |
| `LENS_TRACING_KEY`    | Lens 追踪设置中生成的专用追踪密钥                                                                                                                                                                 |
| `LITELLM_MODEL`       | 网关上已配置的模型别名                                                                                                                                                                            |

仓库内置的取值面向本地开发网关，部署时请按你的环境替换。保留 `.env.example` 中的 exporter 设置即可，各示例会在代码中自行配置追踪 exporter。它们会把追踪记录发送到 `LENS_URL/v1/traces`，并以追踪密钥作为 Bearer 令牌。

除非你打算向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 额外发送一份追踪副本，否则不要设置 `MOCK_LITELLM_GATEWAY_URL`。

## 运行示例

### 简单智能体

由 `create_agent` 构建的 `research_agent` 会回答一个问题。

```bash
uv run --env-file .env --package lens-langchain-simple simple/main.py
```

具体实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/langchain/simple/main.py)。

### 智能体集群

协调者通过搜索和写入工具调用 `search_agent` 与 `writer_agent`。

```bash
uv run --env-file .env --package lens-langchain-swarm swarm/main.py
```

具体实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/langchain/swarm/main.py)。

## 验证追踪记录

示例输出答案后，在网关上打开 **Lens > Traces** 并选中新生成的运行记录，找到与 `research_agent` 关联的那一次运行，查看其输入、输出和模型 span。对于集群示例，则查看上文描述的各专用智能体的活动；span 的具体布局取决于框架本身。

## 追踪的工作原理

OpenInference 会对 LangChain 的运行进行插桩。每个 create\_agent 图都有明确的名称，委派出去的运行会继承协调者的追踪上下文。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果答案正常输出但追踪记录缺失，请检查终端里的 exporter 报错，并确认用你的追踪密钥能够访问 Lens 摄取服务。模型调用成功并不代表追踪导出也成功了。
