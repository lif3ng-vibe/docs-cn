---
title: "Google ADK"
description: "运行 Google ADK 示例，并把智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/google-adk"
sidebar_label: "Google ADK"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/google-adk/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/google-adk/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Google ADK

如需编程智能体的辅助，可以使用[帮我完成设置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。该流程会保留你现有的模型连接，并在设置完成后验证一条真实的追踪记录。

借助本仓库中可直接运行的示例，把 Google ADK 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要[在 LiteLLM 旁安装 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)、一个具备模型访问权限的密钥，以及一个配置好的模型别名（model alias）。swarm 示例还需要一个支持工具调用的模型。在 **Lens > Traces > Set up tracing** 中点击 **Generate tracing key**，并复制 **Connection details** 下的 **Traces endpoint**。如果你无权创建追踪密钥，请向管理员索取这些信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。它会使用仓库中锁定的 Python 版本，并通过各自的 uv 工作区解析每个示例的依赖。

## 配置

如果是全新克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/google-adk
cp .env.example .env
```

如果仓库已经克隆过，请从 `google-adk/` 目录运行后续命令。若 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/google-adk/.env.example) 还没有复制为 `.env`，先复制一份，然后设置：

| 变量 | 值 |
| --- | --- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不带斜杠或 `/v1`，例如 `http://localhost:4002` |
| `LITELLM_API_KEY` | 你的 LiteLLM 模型密钥 |
| `LENS_URL` | 从 Lens 追踪设置中复制 **Traces endpoint**，并去掉末尾的 `/v1/traces`。若存在 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest` |
| `LENS_TRACING_KEY` | Lens 追踪设置中生成的专用追踪密钥 |
| `LITELLM_MODEL` | 在网关上配置好的模型别名 |

随仓库提交的取值面向本地开发网关，请替换为你自己部署环境的值。保留 `.env.example` 中的导出器（exporter）设置；示例会在代码中配置各自的追踪导出器，并把追踪记录发送到 `LENS_URL/v1/traces`，以追踪密钥作为 Bearer 令牌。

除非打算向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 额外发送一份追踪记录副本，否则保持 `MOCK_LITELLM_GATEWAY_URL` 不设置。

## 运行示例

### 简单智能体

由 `research_agent` 回答单个问题。

```bash
uv run --env-file .env --package lens-google-adk-simple simple/main.py
```

实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/google-adk/simple/main.py)。

### 智能体集群

由一个协调者把 `search_agent` 和 `writer_agent` 作为 AgentTool 工具来调用。

```bash
uv run --env-file .env --package lens-google-adk-swarm swarm/main.py
```

实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/google-adk/swarm/main.py)。

### 流式

设置 `LITELLM_STREAM=1`，即可在任一示例中启用流式输出：

```bash
LITELLM_STREAM=1 uv run --env-file .env --package lens-google-adk-simple simple/main.py
```

### 请求尝试验证

`validate_attempts.py` 会通过一个注入故障的 `httpx` 传输层（作为 `gateway_http_client(transport=...)` 的参数传入）运行简单智能体，用于检查各次计费尝试之间的关联情况。`retry` 场景会在第一个成功的网关响应体读取完毕后，把这个响应改成 503，于是 OpenAI 客户端会重试一次，追踪记录中随之出现两个 `gateway.request` span 和两条花费记录。`response-loss` 场景保留真实的状态码与响应头，但让响应体流出错，因此唯一一次计费尝试会被记为客户端错误，而它的花费仍能正常结算。

```bash
uv run --env-file .env --package lens-google-adk-simple validate_attempts.py retry
uv run --env-file .env --package lens-google-adk-simple validate_attempts.py response-loss
```

## 验证追踪记录

示例打印出答案后，在网关上打开 **Lens > Traces**，选中新生成的这次运行，找到与 `research_agent` 关联的那条记录，查看其中的输入、输出和模型 span。对于 swarm 示例，则查看上文所述各专职智能体的活动；具体的 span 布局取决于所用框架。

## 追踪的工作原理

OpenInference 会对 ADK 调用、智能体、模型调用和工具进行插桩，共享的网关传输层则把请求尝试和网关调用 ID 记录在模型调用之下。

请求尝试与花费关联的更多细节，见[共享网关传输层](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/shared/README.md)。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果答案已经输出但追踪记录缺失，请查看终端中的导出器报错，并确认用你的追踪密钥能访问到 Lens 的数据接入服务。模型调用成功并不代表追踪数据已成功导出。
