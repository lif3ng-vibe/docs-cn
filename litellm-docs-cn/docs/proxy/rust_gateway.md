---
title: "[Beta] Rust AI 网关"
description: 在 Rust 核心上运行 LiteLLM 的请求转换。可在现有 Python 服务器上按模型启用，或运行独立的 Axum 服务器。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [Beta] Rust AI 网关

:::info

这是一个 Beta 功能，覆盖范围仍在持续扩大。Rust 核心是可选的，默认关闭；任何失败或尚不支持的 Rust 路径都会自动回退到现有 Python 路径，因此开启它不会破坏 Python 本来就能处理的请求。

Anthropic `/v1/messages` 路由的按模型 `rust: true` 开关自 `v1.94.0` 起可用，最早出现在 `v1.94.0-rc.1`。

针对 `anthropic` 和 `bedrock` 的 `/chat/completions` 支持更新一些，将在后续版本中发布。

在 `/chat/completions` 上，这套自动回退覆盖 Rust 路径不接受的请求，判定发生在调用提供商之前；已经到达提供商之后才失败的调用会直接返回错误，而不会再到 Python 路径上重试。

:::

LiteLLM 正在把请求/响应转换移植到 Rust 核心（`litellm-rust` 工作区，随 LiteLLM 的 wheel 包一同分发）。目标是降低单个请求的 CPU 开销和延迟；在各条 Rust 路径达到同等覆盖之前，鉴权、配置、路由、日志、回调与花费追踪（spend tracking）仍由 Python 负责。

有两种采用方式。

## 模式 1：在现有 Python 服务器上启用 Rust（低风险）

模式 1 保留你现有的部署。Python 代理仍然负责终结请求、执行鉴权和路由、调用你的回调；只有下文列出的受支持路由，其提供商转换和网络调用才走 Rust 核心。由于它按模型启用、出错时自动回退到 Python，这是推荐的入门方式。

在模型的 `litellm_params` 中设置 `rust: true`，该部署的其余配置保持不变。

```yaml title="config.yaml"
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      rust: true            # run this deployment through the Rust core

  - model_name: azure-claude
    litellm_params:
      model: azure_ai/{{anthropic}}
      api_base: os.environ/AZURE_AI_API_BASE
      api_key: os.environ/AZURE_AI_API_KEY
      rust: true
```

由 Rust 核心返回的响应带有 `x-litellm-rust: true` 响应头，你可以据此逐请求确认走了哪条路径：

```bash
curl -i http://localhost:4000/v1/messages \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "{{anthropic}}",
    "max_tokens": 128,
    "messages": [{"role": "user", "content": "hello from rust"}]
  }'
```

在响应头里找 `x-litellm-rust: true`。如果没有这个响应头，说明请求由 Python 路径处理（可能是该路由或提供商尚未上 Rust，也可能是 Rust 出错触发了自动回退）。

### `rust: true` 目前覆盖的范围

Rust 核心覆盖的路由子集在不断扩大。如果某个路由或提供商不在下表中，即使设置了 `rust: true`，该部署也会透明地留在 Python 路径上。

| 路由 | 走 Rust 路径的提供商 |
| --- | --- |
| `/chat/completions` | `anthropic`、`bedrock` (Converse) |
| Anthropic `/v1/messages` | `anthropic`、`azure_ai` |
| 语音转写 | `bedrock` |
| Responses API WebSockets | `openai` |

Anthropic `/v1/messages` 路由支持流式；需要触发 agentic 补全钩子的请求会留在 Python 路径上，以保证钩子照常执行。

在 `/chat/completions` 上，Rust 核心只处理非流式的纯文本对话。一条请求走 Rust 需同时满足：每条消息都是 `system`、`user` 或 `assistant` 消息，且内容为字符串，或是由 `{"type": "text", "text": ...}` 内容块组成的非空列表；对话以 user 轮次开场；已设置的采样参数仅限 `max_tokens`、`temperature`、`top_p`、`stop`，在 `anthropic` 上还包括 `top_k`。Bedrock 通过 Converse 提供服务，这是 Claude 模型在 Bedrock 上的默认路由；由于 Converse 不支持 assistant 预填充（prefill），它还要求对话以 user 轮次结束。

由哪条路径处理请求在调用提供商之前就已决定，因此该子集之外的任何请求都由 Python 处理，无需改配置，也不会报错。这包括：带 `stream: true` 的请求、工具调用与工具结果、图片及其他非文本内容块、内容列表为空的消息、`response_format` 与 JSON 模式、扩展思考、提示词缓存（prompt caching）、`bedrock` 上的 `top_k`、大于 1 的 `n`，以及 Rust 路径无法识别的任何其他参数。在这条路由上，一旦提供商调用已经发出，路径选择即为最终结果：此后出现的失败会作为错误返回，而不是转回 Python 重试，因为重试等于把同一个提供商调用再发一次，造成双重计费。

两条路径返回的响应体完全一致，token 计数也不例外，因此响应头是区分二者的唯一依据：Rust 返回的响应带有 `x-litellm-rust: true`，Python 返回的则没有这个响应头。

## 模式 2：运行独立的 Axum 服务器

模式 2 用 Rust 的 `litellm-ai-gateway` Axum 服务器二进制替代 Python 宿主，路由和网络 I/O 全部在 Rust 中完成。这是吞吐上限更高的方案，但它目前覆盖的路由比 Python 宿主少，也还不具备完整的代理功能集。

:::note[待补全]

Axum 服务器目前还没有发布预构建的 Docker 镜像。镜像发布后，本节会补充镜像引用和部署示例。在此之前，你可以在 `litellm-rust` 工作区启用 `server` feature 自行构建服务器；想提前试用的话，可以到社区频道联系我们。

:::
