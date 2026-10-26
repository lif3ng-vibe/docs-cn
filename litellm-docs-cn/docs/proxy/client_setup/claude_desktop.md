---
title: Claude Desktop（GUI）接入 LiteLLM
sidebar_label: Claude Desktop（GUI）
---

import Image from '@theme/IdealImage';

# 将 Claude Desktop 接入 LiteLLM

[Claude Desktop](https://claude.ai/download) 的第三方推理功能会把 Cowork、Chat 和 Code 会话里的每一次模型调用都发往你指定的网关，并经同一网关访问 MCP（Model Context Protocol）服务器。本页是最快的上手路径：一台设备、一把静态虚拟密钥（virtual key），全部在应用内完成配置。如需通过身份提供商做单点登录（SSO）、了解模型选择器的规则，或把配置推广到整支团队，请参阅 [Claude Desktop (Cowork)](../../tutorials/claude_desktop_cowork.md)。

## 快速参考

| 设置 | 值 |
|---|---|
| 推理提供商 | **Gateway** |
| 网关基础 URL | `<LITELLM_PROXY_BASE_URL>`（例如 `http://localhost:4000`） |
| 网关 API 密钥 | 你的 LiteLLM [虚拟密钥](../virtual_keys.md)，认证方式为 **Bearer** |
| MCP 端点 | `<LITELLM_PROXY_BASE_URL>/mcp`，或用 `<LITELLM_PROXY_BASE_URL>/<server_name>/mcp` 指向单个服务器 |
| MCP 认证头 | `x-litellm-api-key: Bearer <virtual key>` |

## LLM 设置

### 1. 启用开发者模式

在 Claude Desktop 中，依次打开 **Help -> Troubleshooting -> Enable Developer Mode**。

<Image img={require('../../../img/client_setup/claude_desktop_01_enable_developer_mode.jpeg')} />

### 2. 打开第三方推理配置

打开 Claude 菜单，点击 **Developer**，再点 **Configure Third-Party Inference...**

<Image img={require('../../../img/client_setup/claude_desktop_02_developer_menu.jpeg')} />

<Image img={require('../../../img/client_setup/claude_desktop_03_configure_third_party.jpeg')} />

### 3. 填入网关 URL 和虚拟密钥

在 **Connection** 区域，把 **Inference provider** 设为 **Gateway**，在 **Gateway base URL** 里填入你的 LiteLLM 代理 URL，在 **Gateway API key** 里填入虚拟密钥，**Gateway auth scheme** 保持 **bearer** 不变（LiteLLM 也接受 `x-api-key`）。点击 **Apply Changes**（旧版本中叫 **Apply locally**）。

<Image img={require('../../../img/client_setup/claude_desktop_04_gateway_url_and_key.jpeg')} />

还没有虚拟密钥的话，先到管理界面（Admin UI）的 **Virtual Keys -> + Create New Key** 创建一把。把它的可用范围限定在 Claude 模型上，并设置 `max_budget`；使用同一把密钥的所有人共享这份预算（budget）。

<Image img={require('../../../img/client_setup/claude_desktop_05_create_virtual_key.jpeg')} />

### 4. 验证

重启 Claude Desktop。模型选择器的选项来自网关上的 `GET /v1/models`，只会保留含有 `claude` 或 `anthropic` 的 `model_name` 值，所以请按这个规则为你的部署（deployment）命名。发起一个任务，然后在管理界面的 **Logs** 或 **Usage** 下确认这次请求，它应归属到你的虚拟密钥名下。

<Image img={require('../../../img/client_setup/claude_desktop_06_verify_usage.jpeg')} />

## MCP 设置

下方的 MCP 截图来自 Linux 上的 Claude Desktop 2.2553.13 和一个本地演示网关。菜单名称可能因应用版本而异。

### 1. 添加网关连接器

打开 **Configure Third-Party Inference**，找到 **Connectors**。添加一个名为 `litellm` 的服务器，选择 **Streamable HTTP**，URL 填 `http://localhost:4000/mcp`。把其中的基础 URL 换成你的网关地址。这个端点会暴露出你的密钥有权访问的服务器。

把请求头 `x-litellm-api-key` 设为 `Bearer <your virtual key>`。按照[概览](./overview.md#处处复用的几个值)中的说明，为这把密钥授予访问该 MCP 服务器的权限。在导出的配置里，它对应 `managedMcpServers` 中的一条条目：

```json
[
  {
    "name": "litellm",
    "transport": "http",
    "url": "http://localhost:4000/mcp",
    "headers": {"x-litellm-api-key": "Bearer sk-<your-virtual-key>"}
  }
]
```

### 2. 测试连接

点击 **Sign in & test**（部分版本中叫 **Test this connection**）。Claude 会用你填写的 URL 和凭据执行 MCP 初始化与工具发现，然后展示发现的工具或连接错误。保存配置前，请确认这些工具确实属于目标服务器。

<Image img={require('../../../img/client_setup/claude_desktop_02_mcp_connector_connected_tools.png')} alt="Claude 连接器设置：显示 LiteLLM MCP URL、一把演示密钥和三个发现的工具" />

这一栏请填你自己的虚拟密钥。Claude 可能会把静态认证头标记为类似凭据的内容。对于托管式部署，[进阶指南](../../tutorials/claude_desktop_cowork.md#mcp-servers-through-the-litellm-mcp-gateway)介绍了改用凭据助手（credential helper）的做法。

### 3. 在 Cowork 中验证

应用配置并重启 Claude Desktop。发起一个会用到该连接器只读工具的 Cowork 任务，出现提示时予以批准，然后确认工具能返回结果。工具遵循 `<server>-<tool>` 的命名规则。

<Image img={require('../../../img/client_setup/claude_cowork_04_mcp_tool_result.png')} alt="Claude Cowork 通过 LiteLLM 连接器展示只读 DeepWiki 工具的结果" />

若要只选中一个服务器，请改用 `/<server_name>/mcp`。[MCP 配置参考](../../mcp_config_reference.md)详述了端点选择、服务器过滤与认证。

Claude Desktop 内置的连接器（`github`、`microsoft365`、`websearch`）在应用内部直接调用相应厂商的 API，从不经过 LiteLLM；只有 `url` 条目才会走 LiteLLM。对于需要用户自行登录上游服务的服务器，可在对应服务器的 URL 上设置 `"oauth": true`，让 LiteLLM 代跑整个流程；参见 [MCP OAuth 透传](../../mcp_oauth_passthrough.md)。[完整指南](../../tutorials/claude_desktop_cowork.md#mcp-servers-through-the-litellm-mcp-gateway)介绍了面向单点登录团队的 `headersHelper` 与按工具划分的策略。

## 后续步骤

[Claude Desktop (Cowork)](../../tutorials/claude_desktop_cowork.md)：涵盖 SSO、模型选择器规则、批量推广与故障排查；[配合 Claude Code 与 Claude Desktop 使用 Auto Router](../../tutorials/claude_code_autorouter.md)；[MCP 网关参考](../../mcp.md)。
