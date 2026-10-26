---
title: "LlamaIndex"
description: "运行 LlamaIndex 示例，并把代理追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/llamaindex"
sidebar_label: "LlamaIndex"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/llamaindex/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/llamaindex/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# LlamaIndex

如果想让你的编码代理（coding agent）代劳，可以使用 [帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录（trace）。

通过本仓库中可直接运行的示例，把 LlamaIndex 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要[与 LiteLLM 一同部署的 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)、一个有模型访问权限的密钥，以及一个已配置好的模型别名（model alias）。集群（swarm）示例还需要一个支持工具调用的模型。在 **Lens > Traces > Set up tracing** 中点击 **Generate tracing key**，再复制 **Connection details** 下方的 **Traces endpoint**。如果无权创建追踪密钥，请向管理员索取这些信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库内置的 Python 版本，并通过 uv workspace 解析每个示例的依赖。

## 配置

刚克隆仓库时：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/llamaindex
cp .env.example .env
```

如果已经克隆过仓库，请在 `llamaindex/` 目录下执行后续命令。若 `.env` 尚不存在，先把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/llamaindex/.env.example) 复制为 `.env`，然后设置：

| 变量                  | 说明                                                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不要带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                                            |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                           |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，并去掉末尾的 `/v1/traces`；如果路径中含有 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest`                |
| `LENS_TRACING_KEY`    | Lens 追踪设置中生成的专用追踪密钥                                                                                                                                                               |
| `LITELLM_MODEL`       | 网关上已配置的某个模型别名                                                                                                                                                                      |

仓库内置的默认值面向本地开发网关，实际部署时请替换成自己的配置。请保留 `.env.example` 中的导出器（exporter）设置；各示例会在代码里配置自己的追踪导出器，并把追踪记录发送到 `LENS_URL/v1/traces`，以追踪密钥作为 Bearer 令牌。

除非你打算额外向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 发送一份追踪记录副本，否则不要设置 `MOCK_LITELLM_GATEWAY_URL`。

## 运行示例

### 简单代理

一个 `FunctionAgent` 回答单个问题。

```bash
uv run --env-file .env --package lens-llamaindex-simple simple/main.py
```

实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/llamaindex/simple/main.py)。

### 代理集群

一个 `AgentWorkflow` 先把任务从 `research_agent` 交给 `search_agent`，再交给 `writer_agent`。

```bash
uv run --env-file .env --package lens-llamaindex-swarm swarm/main.py
```

实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/llamaindex/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在你的网关上打开 **Lens > Traces**，选中新增的那次运行，找到与 `research_agent` 关联的记录，查看其中的输入、输出和模型 span。对于集群示例，请检查上文描述的各个专项代理的活动；span 的具体布局取决于所用框架。

## 追踪的工作原理

LlamaIndex 的插桩器（instrumentor）会在导入框架之前启用。示例会把进程标记为 research\_agent，并禁用框架自身的流式输出；各专项代理的名称会出现在工作流与任务移交（handoff）数据中。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果答案正常输出但追踪记录缺失，请检查终端里有没有导出器报错，并确认携带追踪密钥能否访问 Lens 的数据接入服务。模型调用成功并不代表其追踪记录导出成功。

多个与模型相关的 span 可能对应的是同一次模型调用。专项代理的名称和模型调用花费，取决于框架导出的属性以及网关对这些属性的归一化方式。
