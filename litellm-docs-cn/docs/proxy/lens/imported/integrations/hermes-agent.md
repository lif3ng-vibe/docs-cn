---
title: "Hermes Agent"
description: "运行 Hermes Agent 示例，并将其智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/hermes-agent"
sidebar_label: "Hermes Agent"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/hermes-agent/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/hermes-agent/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Hermes Agent

如果想让你的编码智能体（coding agent）代劳，可以使用 [帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录。

使用本仓库中的可运行示例，把 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。这些示例将 Hermes 作为 Python 库嵌入，并通过 [hermes-otel](https://github.com/briancaffey/hermes-otel) 插件导出其追踪记录。

## 前置条件

你需要[将 Lens 与 LiteLLM 一同部署](/docs/proxy/lens/deployment#configure-an-existing-proxy)，准备一把有模型访问权限的密钥，并配置好模型别名（model alias）。swarm（智能体集群）示例还需要一个支持工具调用的模型。在 **Lens > Traces > Set up tracing** 中点击 **Generate tracing key**，复制 **Connection details** 下的 **Traces endpoint**。如果你没有权限创建追踪密钥，请向管理员索取这些信息。

安装 [uv](https://docs.astral.sh/uv/getting-started/installation/) 和 Git。Hermes 要求使用带 GIL 的 CPython 3.14；仓库自带的 `.python-version` 已锁定该版本，如果 uv 只找到自由线程（free-threaded）构建，`uv python install 3.14` 会把它装上。

## 配置

Hermes 没有发布 wheel 包，因此示例以可编辑（editable）模式安装一个锁定版本的源码检出。如果是全新检出，请执行以下命令：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example/hermes-agent
git clone https://github.com/NousResearch/hermes-agent.git vendor/hermes-agent
git -C vendor/hermes-agent checkout c225c4a04e8b517a357804ebb27367b0c961fd0e
uv sync --all-packages
HERMES_HOME="$PWD/home" uv run --package lens-hermes-agent-simple hermes plugins install briancaffey/hermes-otel/hermes_otel --ref d234865b13e997e0b3a50dc18aaad7c7d7b1b1fe --yes-deps --enable
cp .env.example .env
```

如果已经克隆过仓库，请在 `hermes-agent/` 目录下执行其余命令。插件会安装到 `home/`，也就是两个示例共用的 Hermes 主目录。若 `.env` 尚不存在，把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/hermes-agent/.env.example) 复制为 `.env`，然后设置：

| 变量                  | 取值说明                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不带斜杠，也不带 `/v1`，例如 `http://localhost:4000`                                                                                               |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                  |
| `LENS_URL`            | 从 Lens 追踪配置页复制 **Traces endpoint**，去掉末尾的 `/v1/traces`；若包含 `/lens-ingest` 则保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest` |
| `LENS_TRACING_KEY`    | Lens 追踪配置生成的专用追踪密钥                                                                                                                                        |
| `LITELLM_MODEL`       | 网关上已配置的某个模型别名                                                                                                                                             |

仓库内置的取值面向本地开发网关，请按你的实际部署替换。[home/hermes\_otel.yaml](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/hermes-agent/home/hermes_otel.yaml) 会把追踪记录发送到 `LENS_URL/v1/traces`，并以追踪密钥作为 bearer token。

## 运行示例

### 简单智能体

一轮不带工具的 Hermes 对话，只需一次模型调用即可回答一个问题。

```bash
uv run --env-file .env --package lens-hermes-agent-simple simple/main.py
```

实现见 [simple/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/hermes-agent/simple/main.py)。

### 智能体集群（swarm）

协调者（coordinator）通过 `delegate_task` 把收集资料和起草这两件事交给两个子智能体（subagent），再根据它们的结果作答。Hermes 会在后台执行顶层委派，并以一个后续轮次返回其结果，因此示例会先等待子智能体完成，再执行该轮次。

```bash
uv run --env-file .env --package lens-hermes-agent-swarm swarm/main.py
```

实现见 [swarm/main.py](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/hermes-agent/swarm/main.py)。

## 验证追踪记录

示例打印出答案后，在网关上打开 **Lens > Traces**，从 `hermes-agent` 服务中选中这次新的运行。Hermes 的每一轮对应一条追踪记录，根节点是一个 `agent` span，每轮各有一个 `llm.<model>` span，每次模型请求各有一个 `api.<model>` span。追踪记录中的花费应与这些请求的花费日志（spend logs）一致。

对 swarm 示例而言，第一条追踪记录包含 `tool.delegate_task` 调用，以及每个子智能体对应的一个 `subagent.leaf` span，其中各自嵌套了该子智能体自己的 `agent` 轮次。读取子智能体结果的那个后续轮次，是同一 Hermes 会话中的第二条追踪记录。

## 追踪的工作原理

hermes-otel 把 Hermes 的生命周期钩子转换成 OpenInference 和 GenAI span。这些 span 不携带网关响应 ID，因此示例让 Hermes 通过 [home/plugins/model-providers/litellm](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/hermes-agent/home/plugins/model-providers/litellm/__init__.py) 中的 `litellm` 提供商来路由。该提供商为每个 Hermes OpenAI 客户端接上[共享网关 transport](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/shared/README.md)，由它在活跃的 `api.<model>` span 下方追加一个携带网关调用 ID 的请求尝试（request-attempt）span。hermes-otel 从不把自己的 span 置为当前 span，因此该提供商通过 hermes-otel 的 `get_current_traceparent` 查找该请求所属 Hermes 会话的活跃 span。

如果要追踪你自己的 Hermes 安装，请把该提供商插件复制到 `~/.hermes/plugins/model-providers/`，在 Hermes 环境中安装 `gateway-tracing`，然后选择 `litellm` 提供商。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果答案正常输出但追踪记录缺失，请设置 `HERMES_OTEL_DEBUG=true`，检查 `home/plugins/hermes_otel/debug.log` 和终端里的导出器报错，并确认用你的追踪密钥能够访问 Lens 摄取（ingestion）服务。模型调用成功并不代表追踪记录导出成功。

如果追踪记录里没有花费，请确认示例传入了 `provider="litellm"`，且每个 `api.<model>` span 下都有 `gateway.request` 子 span。如果进程因段错误（segmentation fault）退出，说明 uv 选用了自由线程版 Python：运行 `uv python install 3.14`，删除 `.venv` 和 `home/installs`，然后重新执行配置步骤。
