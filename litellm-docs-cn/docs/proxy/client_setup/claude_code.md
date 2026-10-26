---
title: Claude Code（CLI）
sidebar_label: Claude Code（CLI）
---

import Image from '@theme/IdealImage';

# 将 Claude Code 接入 LiteLLM

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) 对接的是 Anthropic Messages API。LiteLLM 在 `/v1/messages` 端点提供这种格式，因此只需设置两个环境变量，就能把 Claude Code 指向网关，进而驱动你配置中的任意模型，而不限于 Anthropic 自家的。

## 快速参考

| 设置项 | 取值 |
|---|---|
| `ANTHROPIC_BASE_URL` | `<LITELLM_PROXY_BASE_URL>`（例如 `http://localhost:4000`） |
| `ANTHROPIC_AUTH_TOKEN` | 你的 LiteLLM [虚拟密钥（virtual key）](../virtual_keys.md) |
| `ANTHROPIC_MODEL` | 你配置中的某个 `model_name` |
| MCP（Model Context Protocol）端点 | `<LITELLM_PROXY_BASE_URL>/<server_name>/mcp` |
| MCP 认证头 | `x-litellm-api-key: Bearer <virtual key>` |

## LLM 配置

### 1. 将 Claude Code 指向网关

先导出基础 URL、虚拟密钥和模型名，然后启动 Claude Code：

```bash
export LITELLM_API_KEY="sk-<your-virtual-key>"
export ANTHROPIC_BASE_URL="http://localhost:4000"
export ANTHROPIC_AUTH_TOKEN="$LITELLM_API_KEY"
export ANTHROPIC_MODEL="{{anthropic}}"

claude
```

Claude Code 会把每个请求都发往 LiteLLM 的 `/v1/messages` 端点，并以你的虚拟密钥作为 Bearer 令牌。要让这些配置永久生效，可以把上述 export 写进 shell 配置文件（`~/.zshrc`、`~/.bashrc`），或写进 Claude Code `settings.json` 的 `env` 块。如果 shell 里还设置了 `ANTHROPIC_API_KEY`，请在当前会话中将其取消，以免 Claude Code 发送它而不是虚拟密钥。

### 2. 选择模型

Claude Code 会原样发送当前选中的模型 ID，因此这个 ID 必须以 `model_name` 的形式存在于你的网关上。`ANTHROPIC_MODEL` 负责把默认模型固定为你定义的某个名称。会话内的 `/model` 选择器仍会列出 Anthropic 自家的 ID（例如 `claude-haiku-4-5-20251001`），在那里选择其中一个会报 `Invalid model name passed in`，除非你的配置恰好也定义了这个名称；要么把这些名称加进 `model_list`，要么统一通过 `ANTHROPIC_MODEL` 切换模型。[将 Claude Code 路由到非 Anthropic 模型](../../tutorials/claude_non_anthropic_models.md)介绍了如何把 Sonnet、Opus、Haiku 各档位映射到任意提供商。

### 3. 验证

发一条提示词试试。下图中 Claude Code 2.1 正通过本地网关应答，`ANTHROPIC_MODEL` 已设置为 `model_list` 中的某个模型：

<Image img={require('../../../img/client_setup/claude_code_llm.png')} />

然后到管理界面（Admin UI）的 **Logs** 或 **Usage** 下确认流量，请求会归到你的虚拟密钥和所选模型名下。

## 无需静态密钥的登录方式

[Claude Code Gateway SSO](../../tutorials/claude_code_gateway.md) 是官方推荐的设备级登录方式，适合批量部署，无需为每个用户单独发密钥。你也可以把 [`lite auth print-token`](../cli_sso.md#从其他工具使用凭据) 用作 `apiKeyHelper`（配合 [`lite login --pkce`](../cli_sso.md#使用-pkce-进行浏览器登录)），或者使用 [IdP JWT 助手](../../tutorials/claude_code_okta_sso.md)。

`lite login --pkce --config-claude` 会把本次登录的密钥以 `env.ANTHROPIC_AUTH_TOKEN` 的形式写入 `~/.claude/settings.json`；密钥过期后重新运行该命令即可，或者设置 `apiKeyHelper`，让 Claude Code 自行获取新令牌。

如果用户所在的团队或密钥限制了可用模型，Claude Code 的默认模型名必须在允许名单内，或者把 `ANTHROPIC_MODEL` 设为某个被允许的别名，否则请求会失败并报 `403 The requested model '...' is not available for this API key`。

## MCP 配置

通过 `claude mcp add`，可以把 LiteLLM [MCP 网关](../../mcp.md)的工具暴露到 Claude Code 内。URL 为 `<LITELLM_PROXY_BASE_URL>/<server_name>/mcp`，其中 `<server_name>` 对应网关配置里 `mcp_servers:` 下的某个键，虚拟密钥则放在 `x-litellm-api-key` 请求头中：

```bash
claude mcp add --transport http litellm-tools \
  http://localhost:4000/my_mcp_server/mcp \
  --header "x-litellm-api-key: Bearer $LITELLM_API_KEY"
```

| 组成部分 | 含义 |
|---|---|
| `litellm-tools` | 该服务器在 Claude Code 内部的名称，可任取 |
| `http://localhost:4000/my_mcp_server/mcp` | `<PROXY_URL>/<server_name>/mcp`；`my_mcp_server` 必须与网关配置 `mcp_servers:` 下的某个键一致 |
| `--header "x-litellm-api-key: Bearer $LITELLM_API_KEY"` | 你的虚拟密钥，用于向网关认证身份 |

该密钥需要有 `my_mcp_server` 的访问权限（见[概述](./overview.md#处处复用的几个值)），否则网关会拒绝连接并报 `The key is not allowed to access the requested MCP servers`。启动 Claude Code 并运行 `/mcp`：服务器应显示为已连接，并列出其工具，工具名以服务器名为前缀（`my_mcp_server-read_wiki_structure`）。

<Image img={require('../../../img/client_setup/claude_code_mcp.png')} />

对于上游走 OAuth 的服务器（例如托管版 GitHub 或 Atlassian MCP），把 LiteLLM 密钥继续放在 `x-litellm-api-key` 中，由 LiteLLM 代为执行 OAuth 流程；参见 [MCP OAuth](../../mcp_oauth.md)。

## 后续步骤

了解如何[削减 Claude Code 成本](../../tutorials/claude_code_cut_costs.md)（预算、提示词缓存与回退机制）、[自带 Anthropic 密钥](../../tutorials/claude_code_byok.md)、[将 Claude Code 路由到非 Anthropic 模型](../../tutorials/claude_non_anthropic_models.md)，或查阅 [Claude Code 兼容性矩阵](../../claude_code_compatibility.md)。
