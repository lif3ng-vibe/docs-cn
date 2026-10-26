---
title: "Vercel AI SDK（TypeScript）"
description: "运行 Vercel AI SDK（TypeScript）示例，并把智能体追踪记录发送到 LiteLLM Lens。"
slug: "/proxy/lens/integrations/vercel-ai-sdk-js"
sidebar_label: "Vercel AI SDK（TypeScript）"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/vercel-ai-sdk-js/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/vercel-ai-sdk-js/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Vercel AI SDK（TypeScript）

如果想让你的编程智能体代劳，可以使用[让智能体帮我配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录。

使用本仓库中可直接运行的示例，把 Vercel AI SDK（TypeScript）的追踪记录发送到 [LiteLLM Lens](/docs/proxy/lens)。

## 前提条件

你需要先[在 LiteLLM 旁安装 Lens](/docs/proxy/lens/deployment#configure-an-existing-proxy)，准备一个有模型访问权限的密钥，并配置好模型别名（model alias）。智能体集群示例还需要一个支持工具调用（tool calling）的模型。在 **Lens > Traces > Set up tracing** 页面点击 **Generate tracing key**，再在 **Connection details** 下复制 **Traces endpoint**。如果你没有创建追踪密钥的权限，请向管理员索取这些信息。

请使用自带 TypeScript 支持的 Node.js 和 npm。依赖要从仓库根目录安装，确保共享的 npm workspaces 可用。

## 配置

如果是全新检出的仓库：

```bash
git clone https://github.com/BerriAI/litellm-lens-example.git
cd litellm-lens-example
npm install
cd vercel-ai-sdk-js
cp .env.example .env
```

如果已经克隆过仓库，请在 `vercel-ai-sdk-js/` 目录下执行其余命令。还没安装 workspace 依赖的话，先在仓库根目录运行 `npm install`。若 `.env` 尚不存在，请把 [.env.example](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/vercel-ai-sdk-js/.env.example) 复制为 `.env`，然后设置：

| 变量                  | 值                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LITELLM_GATEWAY_URL` | 你网关的基础 URL，末尾不带斜杠或 `/v1`，例如 `http://localhost:4002`                                                                                                                              |
| `LITELLM_API_KEY`     | 你的 LiteLLM 模型密钥                                                                                                                                                                             |
| `LENS_URL`            | 从 Lens 追踪设置里复制 **Traces endpoint**，去掉末尾的 `/v1/traces`；路径中如果有 `/lens-ingest`，请保留。例如 `http://localhost:4318` 或 `https://gateway.example/lens-ingest`                    |
| `LENS_TRACING_KEY`    | Lens 追踪设置中生成的专用追踪密钥                                                                                                                                                                 |
| `LITELLM_MODEL`       | 网关上已配置好的模型别名                                                                                                                                                                          |

仓库自带的取值面向本地开发网关，实际部署时请替换成你自己的。`.env.example` 中的 exporter 设置请保持原样；各示例会在代码里配置自己的追踪导出器，把追踪记录发送到 `LENS_URL/v1/traces`，并以追踪密钥作为 bearer token。

除非你打算额外向本地 [recorder](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/recorder/AGENTS.md) 发送一份追踪副本，否则不要设置 `MOCK_LITELLM_GATEWAY_URL`。

## 运行示例

### 简单智能体

一次 `generateText` 调用会以 `research_agent` 的名义生成追踪记录。

```bash
node --env-file=.env simple/main.ts
```

实现细节见 [simple/main.ts](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/vercel-ai-sdk-js/simple/main.ts)。

### 智能体集群

一个协调者通过工具分发任务，分别以 `search_agent` 和 `writer_agent` 的名义运行 `generateText`。

```bash
node --env-file=.env swarm/main.ts
```

实现细节见 [swarm/main.ts](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/vercel-ai-sdk-js/swarm/main.ts)。

## 验证追踪记录

示例打印出答案后，在你的网关上打开 **Lens > Traces**，选中新出现的那次运行，找到与 `research_agent` 关联的那一条，查看其中的输入、输出和模型 span。对于智能体集群示例，则查看上文提到的各专职智能体的活动；span 的具体布局取决于所用框架。

## 追踪的工作原理

其中，@ai-sdk/otel 集成负责创建 OpenTelemetry span，NodeSDK 负责把它们导出到 Lens。示例会按 functionId 命名智能体 span；共享的网关 fetch 则会记录每次请求尝试和网关调用 ID。

请求尝试与花费关联的细节见[共享网关传输层](https://github.com/BerriAI/litellm-lens-example/blob/a2294277609202247b71c08d7b491f5212809988/shared/README.md)。

## 故障排查

模型调用失败时，请检查网关 URL、密钥和模型别名。如果有答案输出但追踪记录缺失，请查看终端里的导出器报错，并确认用你的追踪密钥能够访问 Lens 的数据接入服务。模型调用成功并不代表对应的追踪数据已成功导出。

## 传输层验证

在本目录下运行共享传输层的回归测试：

```bash
npm test -w gateway-tracing
```

用以下命令验证真实网关下的流式、重试与计费响应丢失：

```bash
node --env-file=.env validate-attempts.ts streaming
node --env-file=.env validate-attempts.ts retry
node --env-file=.env validate-attempts.ts response-loss
```

重试场景会用客户端侧的 HTTP 503 顶替第一个真实的计费响应；响应丢失场景会正常消费真实的计费响应，再让客户端流失败。两种场景都不会改变网关或提供商（provider）的行为。
