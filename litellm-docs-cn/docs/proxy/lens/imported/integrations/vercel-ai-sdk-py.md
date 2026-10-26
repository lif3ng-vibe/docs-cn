---
title: "Vercel AI SDK（Python）"
description: "运行 Vercel AI SDK（Python）示例，并把智能体的追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/vercel-ai-sdk-py"
sidebar_label: "Vercel AI SDK（Python）"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/vercel-ai-sdk-py/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/vercel-ai-sdk-py/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Vercel AI SDK (Python)

如果想让编码智能体代劳，可以使用[帮我完成设置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在设置完成后验证一条真实的追踪记录。

使用本仓库中可直接运行的示例，把 Vercel AI SDK（Python）的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要[与 LiteLLM 一同安装的 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)、一个有模型访问权限的密钥，以及一个配置好的模型别名（model alias）。智能体集群示例还需要一个支持工具调用的模型。在 **Lens > Traces > Set up tracing** 中点击 **Generate tracing key**，然后在 **Connection details** 下复制 **Traces endpoint**。如果你自己无权创建追踪密钥，请向管理员索取。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库内置的 Python 版本，并基于 uv 工作区解析每个示例的依赖。

## 配置

如果是全新克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/vercel-ai-sdk-py
cp .env.example .env
```

如果仓库已经克隆好，请在 `vercel-ai-sdk-py/` 目录下运行其余命令。若还没有 `.env`，先把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/vercel-ai-sdk-py/.env.example) 复制为 `.env`，然后设置：

| 变量                  | 说明                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不要带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                                              |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                             |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，去掉末尾的 `/v1/traces`；如果路径里带有 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest` |
| `LENS_TRACING_KEY`    | Lens 追踪设置中生成的专用追踪密钥                                                                                                                                                                 |
| `LITELLM_MODEL`       | 在网关上配置好的模型别名                                                                                                                                                                          |

仓库内置的默认值面向本地开发网关，请按你的部署环境替换。`.env.example` 中的 exporter 设置保持原样即可，各示例会在代码里自行配置追踪导出器。它们会把追踪记录发送到 `LENS_URL/v1/traces`，并以追踪密钥作为 Bearer Token。

除非你打算向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 额外发送一份追踪副本，否则请保持 `MOCK_LITELLM_GATEWAY_URL` 不设置。

## 运行示例

### 简单智能体

`research_agent` 使用 Python ai 包回答一个问题。

```bash
uv run --env-file .env --package lens-vercel-ai-sdk-py-simple simple/main.py
```

实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/vercel-ai-sdk-py/simple/main.py)。

### 智能体集群

协调者（coordinator）通过若干工具把任务分派给 `search_agent` 和 `writer_agent` 执行。

```bash
uv run --env-file .env --package lens-vercel-ai-sdk-py-swarm swarm/main.py
```

实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/vercel-ai-sdk-py/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在网关上打开 **Lens > Traces**，选中新生成的那次运行，找到与 `research_agent` 关联的运行记录，查看其中的输入、输出和模型 span。对于智能体集群，则查看上文描述的各专职智能体的活动；具体的 span 结构取决于所用框架。

## 追踪的工作原理

Python ai 包的实验性遥测适配器会导出智能体、工具和模型三类 span。其中的本地适配器会把模型 span 保留在当前活跃上下文中，这样共享网关传输层才能把请求尝试（request-attempt）span 嵌套在它们之下。

请求尝试与花费关联的细节，参见[共享网关传输层](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/shared/README.md)的说明。

## 故障排查

模型调用失败时，请检查网关 URL、密钥和模型别名。如果答案正常输出但追踪记录缺失，请检查终端里的导出器报错，并确认用你的追踪密钥能够访问 Lens 的数据接入服务。模型调用成功并不代表追踪数据导出成功。

本示例使用 Python ai 包及其实验性遥测 API，其依赖和设置方式与 TypeScript 版示例不同。
