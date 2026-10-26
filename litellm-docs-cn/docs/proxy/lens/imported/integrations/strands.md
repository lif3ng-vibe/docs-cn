---
title: "Strands Agents"
description: "运行 Strands Agents 示例，并把智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/strands"
sidebar_label: "Strands Agents"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/strands/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/strands/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Strands Agents

如果想让你的编程智能体（coding agent）帮忙完成配置，可以使用 [帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。该流程会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录。

通过本仓库中可直接运行的示例，把 Strands Agents 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要[与 LiteLLM 一同部署的 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)、一把具备模型访问权限的密钥，以及一个已配置好的模型别名（model alias）。集群（swarm）示例还需要一个支持工具调用的模型。在 **Lens > Traces > Set up tracing** 中，点击 **Generate tracing key**，并复制 **Connection details** 下的 **Traces endpoint**。如果你没有权限创建追踪密钥，请向管理员索取这些信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库内置的 Python 版本，并通过各自的 uv workspace 解析每个示例的依赖。

## 配置

如果是全新克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/strands
cp .env.example .env
```

如果仓库已经克隆过，请在 `strands/` 目录下执行后续命令。若 `.env` 尚不存在，先把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/strands/.env.example) 复制为 `.env`，然后设置：

| 变量                  | 取值                                                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                                              |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                           |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，并去掉末尾的 `/v1/traces`；如果路径中包含 `/lens-ingest`，则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest`              |
| `LENS_TRACING_KEY`    | Lens 追踪设置中生成的专用追踪密钥                                                                                                                                                               |
| `LITELLM_MODEL`       | 网关上已配置的模型别名                                                                                                                                                                          |

仓库内置的默认值面向本地开发网关，实际部署时请替换成自己的配置。`.env.example` 中的 exporter 设置保持原样即可；各示例会在代码里配置自己的追踪导出器（trace exporter），把追踪记录发送到 `LENS_URL/v1/traces`，并以追踪密钥作为 bearer token。

`MOCK_LITELLM_GATEWAY_URL` 保持不设置，除非你想额外向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 发送一份追踪副本。

## 运行示例

### 简单智能体

一个 `research_agent` 负责回答一个问题。

```bash
uv run --env-file .env --package lens-strands-simple simple/main.py
```

实现细节见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/strands/simple/main.py)。

### 智能体集群

一个协调者（coordinator）把 `search_agent` 和 `writer_agent` 当作工具来调用。

```bash
uv run --env-file .env --package lens-strands-swarm swarm/main.py
```

实现细节见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/strands/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在网关上打开 **Lens > Traces** 并选中新生成的那次运行，找到与 `research_agent` 关联的那一次，查看其中的输入、输出和模型 span。集群示例则查看上文描述的各专长智能体的活动；span 的具体布局取决于框架本身。

## 追踪工作原理

Strands 会导出智能体、工具和模型三类 span。共享的网关 HTTP 客户端会把每次请求尝试记录在模型 span 之下，包括流式响应和重试对应的网关调用 ID。

请求尝试与花费关联的更多细节，参见 [共享网关传输层](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/shared/README.md)。

用 `uv run --env-file .env --package lens-strands-simple validate_attempts.py retry` 或 `... response-loss` 在真实网关上验证重试与已计费响应丢失这两种情形。驱动程序会把真实的 `httpx` 传输层包进一个注入故障的传输层，再作为 `gateway_http_client(base_url, transport=...)` 传入。重试场景会读取第一条真实的已计费响应，然后在客户端把它替换成 HTTP 503，让 OpenAI 客户端重试一次，最终产生两个 `gateway.request` span 和两条花费记录。响应丢失场景则保留真实的状态码和响应头，但在已计费的响应体被读取完之后让流中断，产生一次失败的尝试，而这笔尝试的花费记录仍然能对上账。两种场景都不会改变网关或提供商的行为。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果有答案输出但追踪记录缺失，请检查终端里的导出器报错，并确认用你的追踪密钥能够访问 Lens 的数据接入服务。模型调用成功并不代表它的追踪导出也成功了。

当 Strands 在示例完成初始化之后再初始化线程插桩（instrumentation）时，可能会出现 "Attempting to instrument while already instrumented" 警告。
