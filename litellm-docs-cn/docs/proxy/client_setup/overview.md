---
title: 客户端设置
sidebar_label: 概览
---

import Image from '@theme/IdealImage';

# 将客户端连接到 LiteLLM

LiteLLM 网关跑起来之后，编码工具或聊天应用就可以把模型流量路由到它上面。每个客户端的认证方式各不相同，有的用虚拟密钥（virtual key），有的用登录令牌，本节的每一页都会带你走完对应客户端的配置流程。

**LLM 路由**（LLM routing）把客户端的模型流量指向 LiteLLM。客户端界面保持原样，但每个请求都会流经网关，等于用同一个 API 面覆盖 100 多个模型，还附带花费追踪（spend tracking）、预算和防护栏（guardrails）。配好网关 base URL 和配置文件里的某个 `model_name`，再使用该客户端支持的凭据即可。

**MCP**（Model Context Protocol）把客户端接入 LiteLLM 的 [MCP 网关](../../mcp.md)，让它可以调用你在网关上暴露的工具。客户端通过一个 MCP 端点访问 LiteLLM 并用虚拟密钥完成认证；LiteLLM 再分发到你注册的上游 MCP 服务器，沿途施加访问控制、成本追踪和防护栏。

## 各客户端支持情况

| 客户端 | 形态 | LLM 路由 | MCP |
|---|---|---|---|
| [Claude Code](./claude_code.md) | CLI | 是 | 是 |
| [Claude Desktop](./claude_desktop.md) | GUI | 是 | 是 |
| [Codex (CLI)](./codex_cli.md) | CLI | 是，经由 `/v1/responses` | 是 |
| [Codex (ChatGPT Desktop)](./codex_chatgpt_desktop.md) | GUI | 是，经由 `/v1/responses` | 是 |
| 普通 ChatGPT 对话（ChatGPT Desktop） | GUI | 否，仍留在你的 ChatGPT 工作区 | 本文不涉及 |

## 两种凭据，两跳认证

经过 LiteLLM 的请求要做两次认证。客户端先用虚拟密钥或登录令牌向 LiteLLM 证明身份，这一步同时确定用户和所属团队，并决定可用哪些模型、预算和防护栏；随后 LiteLLM 用自己 `model_list` 里的凭据去调用提供商，开发者手里始终不需要持有 OpenAI 或 Anthropic 的密钥，个人 Claude 或 ChatGPT 订阅也不会被消耗。

直接按用户自己的订阅计费是另一套可选配置：[Claude Code Max](../../tutorials/claude_code_max_subscription.md) 和 [BYOK](../../tutorials/claude_code_byok.md) 会把用户的 Anthropic 凭据转发到上游，[ChatGPT 订阅提供商](../../providers/chatgpt.md) 则在代理上通过 ChatGPT 登录来路由模型。

## 选择用户登录方式

| 客户端 | 静态密钥 | 登录式，无需手工签发长效密钥 | 许可证 | 一条命令配置 |
|---|---|---|---|---|
| Claude Code | 存入 `ANTHROPIC_AUTH_TOKEN` 的虚拟密钥 | [Claude Code Gateway](../../tutorials/claude_code_gateway.md) 设备登录、把 [`lite auth print-token`](../cli_sso.md) 配成 `apiKeyHelper`，或使用 [IdP JWT 助手](../../tutorials/claude_code_okta_sso.md) | Gateway 设备登录与经由身份提供商（IdP）的 `lite login`：5 个 SSO 用户以内免费，超出需企业版。IdP JWT 助手：企业版 | `lite configure claude` |
| Claude Desktop | Gateway API 密钥 | [交互式 OIDC](../../tutorials/claude_desktop_cowork.md) | 企业版（JWT 认证） | 无 |
| Codex CLI | 通过 `env_key` 配置虚拟密钥 | [`lite auth print-token` 作为提供商的 `auth` 命令](./codex_cli.md#通过-litellm-sso-登录) | 经由 IdP 的 `lite login`：5 个 SSO 用户以内免费，超出需企业版 | `lite configure codex` |
| ChatGPT Desktop 中的 Codex | 通过 `env_key` 和 `~/.codex/.env` 配置虚拟密钥 | 同样的 `auth` 命令，因为应用读取的是同一份 `config.toml` | 经由 IdP 的 `lite login`：5 个 SSO 用户以内免费，超出需企业版 | 同 Codex CLI |

每种登录流程用的都是与用户 LiteLLM 身份和团队绑定的短期令牌，省去了管理员原本要签发、分发并轮换长效虚拟密钥的负担。

大规模铺开时，所有登录路径都需要企业版许可。通过身份提供商做 SSO，5 个用户以内免费；JWT 认证则不论规模都需要企业版。未授权的代理会以 `403 JWT Auth is an enterprise only feature` 拒绝 JWT 认证。参见[企业版](../../enterprise.md)。

[`lite configure`](../../auto_router/user_setup.md) 会把你提供的凭据写进客户端的配置文件。对 Codex 而言，它以明文 `Authorization: Bearer` 头的形式写进 `config.toml` 的 `http_headers` 下，没有 `env_key`，因此如果不希望长效密钥落盘，请改用上面的登录选项。

## 功能取舍

| 客户端 | 与 LiteLLM 通信的协议 | 最适合 | 主要限制 |
|---|---|---|---|
| Claude Code | Anthropic Messages，`/v1/messages` | Anthropic、Bedrock、Vertex AI 或 Azure Foundry 上的 Claude 模型 | 其他提供商会做协议转换，各家支持程度见[兼容性矩阵](../../claude_code_compatibility.md)。Claude Code 走网关会话时服务端 WebSearch 关闭，提示词缓存 TTL 为 5 分钟（[已知限制](../../tutorials/claude_code_gateway.md#known-limits)）。模型允许列表必须包含 Claude Code 实际发送的模型名 |
| Claude Desktop | Anthropic Messages，`/v1/messages`，模型列表来自 `/v1/models` | Claude 模型 | 模型的 `model_name` 必须包含 `claude` 或 `anthropic` 才会出现在选择器中。非 Claude 模型需要设置 `drop_params: true`；Teams 或 Enterprise 组织的 Claude 还必须把网关模型名加入允许列表（[选择器中的模型](../../tutorials/claude_desktop_cowork.md#models-in-the-picker)） |
| 普通 ChatGPT 对话 | 不路由 | 不适用 | 它们留在你的 ChatGPT 工作区内，LiteLLM 既不追踪也不管控 |
| Codex（CLI 与桌面端） | OpenAI Responses，`/v1/responses` | OpenAI 模型，天然使用 Responses API | 自定义 `model_name` 需要有对应的[模型目录条目](./codex_cli.md#自定义别名的模型元数据)，否则 Codex 使用通用的模型元数据。测试中，shell 工具调用和多轮追问在 OpenAI 原生路由与转换后的 Anthropic 路由上都能正常工作，Codex 网页搜索在 Anthropic 路由上也能运行。目前还没有 Codex 兼容性矩阵，正式铺开前请先在自己的路由上验证其他功能 |

## 处处复用的几个值

在管理界面（Admin UI）的 **Virtual Keys -> + Create New Key** 下创建虚拟密钥，或直接调用 `POST /key/generate`。

<Image img={require('../../../img/client_setup/claude_desktop_05_create_virtual_key.jpeg')} />

| 值 | 来源 | 示例 |
|---|---|---|
| 网关 base URL | 代理监听的地址 | `http://localhost:4000` |
| 虚拟密钥 | 管理界面：**Virtual Keys -> + Create New Key**，或 `POST /key/generate` | `sk-<your-virtual-key>` |
| 模型名 | 配置中 `model_list` 下的某个 `model_name` | `{{anthropic}}` |
| MCP 端点 | 密钥可见的所有服务器走 `<base URL>/mcp`，单个服务器用 `<base URL>/<server_name>/mcp` | `http://localhost:4000/my_mcp_server/mcp` |
| MCP 认证头 | 以 bearer token 形式携带虚拟密钥，放在 `Authorization` 或 `x-litellm-api-key` 中 | `Authorization: Bearer sk-<your-virtual-key>` |

在 MCP 端点上，LiteLLM 接受 `Authorization: Bearer <key>` 或 `x-litellm-api-key: Bearer <key>` 两种形式携带虚拟密钥。配置 bearer token 类设置时填你的虚拟密钥，客户端会把它放进 `Authorization`；配置自定义请求头时优先用 `x-litellm-api-key`，把 `Authorization` 留给上游服务器自己的 OAuth 令牌。端点与请求头如何选择，参见 [MCP 配置参考](../../mcp_config_reference.md)。

:::info 为密钥授予 MCP 服务器访问权

虚拟密钥只能看到被授权给它的 MCP 服务器。没有授权时，网关会返回 `The key is not allowed to access the requested MCP servers: my_mcp_server`。授权方式：在 `POST /key/generate` 中带上 `"object_permission": {"mcp_servers": ["my_mcp_server"]}` 把权限加到密钥或其所属团队上，也可以用 `allow_all_keys: true` 把服务器标记为公开。详见 [MCP 访问控制](../../mcp_control.md)。

:::

如果网关还没有跑起来，先看[部署网关 -> 快速上手](../docker_quick_start.md)，再回到这里连接你的客户端。
