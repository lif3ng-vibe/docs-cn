---
title: "Mastra"
description: "运行 Mastra 示例，并把智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/mastra"
sidebar_label: "Mastra"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/mastra/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/mastra/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Mastra

如果想让编码智能体（coding agent）代劳，可以使用[帮我完成配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在配置完成后验证一条真实追踪记录。

使用本仓库中可直接运行的示例，把 Mastra 的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要[在 LiteLLM 旁部署 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)、一个有模型访问权限的密钥，以及一个已配置好的模型别名（model alias）。集群示例还要求模型支持工具调用。在 **Lens > Traces > Set up tracing** 中，点击 **Generate tracing key**，再复制 **Connection details** 下方的 **Traces endpoint**。如果你无权创建追踪密钥，请向管理员索取这些信息。

使用内置 TypeScript 支持的 Node.js 和 npm。请从仓库根目录安装依赖，这样共享的 npm workspaces 才可用。

## 配置

如果是全新克隆的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example
npm install
cd mastra
cp .env.example .env
```

如果你已经克隆过仓库，请在 `mastra/` 目录下执行其余命令。尚未安装 workspace 依赖的话，先在仓库根目录运行 `npm install`。若 `.env` 还不存在，请把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/mastra/.env.example) 复制为 `.env`，然后设置：

| 变量                  | 说明                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 网关的基础 URL，末尾不带斜杠，也不带 `/v1`，例如 `http://localhost:4002`                                                                                                                          |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                             |
| `LENS_URL`            | 从 Lens 追踪设置中复制 **Traces endpoint**，并去掉末尾的 `/v1/traces`。如果包含 `/lens-ingest` 段，请保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest`                    |
| `LENS_TRACING_KEY`    | Lens 追踪设置中提供的专用追踪密钥                                                                                                                                                                 |
| `LITELLM_MODEL`       | 网关上已配置的一个模型别名                                                                                                                                                                        |

仓库中自带的取值面向本地开发网关，请按你的部署环境替换。保留 `.env.example` 中的 exporter 设置即可；各示例在代码里配置自己的追踪数据导出器，并把追踪记录发送到 `LENS_URL/v1/traces`，以追踪密钥作为 bearer token。

除非你打算向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 额外发送一份追踪记录副本，否则不要设置 `MOCK_LITELLM_GATEWAY_URL`。

## 运行示例

### 简单智能体

`research_agent` 会回答一个问题。

```bash
node --env-file=.env simple/main.ts
```

实现见 [simple/main.ts](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/mastra/simple/main.ts)。

### 智能体集群

由一个协调者把任务分派给 `search_agent` 和 `writer_agent` 两个子智能体。

```bash
node --env-file=.env swarm/main.ts
```

实现见 [swarm/main.ts](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/mastra/swarm/main.ts)。

## 验证追踪记录

等示例打印出答案后，在网关上打开 **Lens > Traces**，选中新生成的这次运行，找到与 `research_agent` 关联的那一次，查看它的输入、输出和模型 span。集群示例则查看上文描述的各专项智能体活动；具体的 span 布局取决于框架本身。

## 追踪的工作原理

Mastra 的 OtelBridge 会把智能体、步骤、模型和工具的 span 转换成 OpenTelemetry span，再由 NodeSDK 导出。共享的网关 fetch 逻辑会记录每次请求尝试和网关调用 ID。

请求尝试与花费关联的细节见[共享网关传输层](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/shared/README.md)。

## 故障排查

如果模型调用失败，请检查网关 URL、密钥和模型别名。如果答案正常输出但追踪记录缺失，请查看终端里的 exporter 报错，并确认凭你的追踪密钥能访问 Lens 接入服务。模型调用成功并不能证明对应的追踪数据也导出成功。

请从仓库根目录安装 npm 依赖，让所有 workspace 使用同一个 OpenTelemetry API 实例。这些一次性示例出现 in-memory storage 警告属于预期现象。

## 参考资料

[Mastra 的 OpenTelemetry 集成](https://mastra.ai/integrations/observability/opentelemetry)。
