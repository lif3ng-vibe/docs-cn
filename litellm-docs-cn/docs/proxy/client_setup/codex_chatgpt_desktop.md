---
title: Codex（ChatGPT Desktop）
sidebar_label: Codex（ChatGPT Desktop）
---

import Image from '@theme/IdealImage';

# 在 ChatGPT Desktop 中将 Codex 连接到 LiteLLM

在 [ChatGPT 桌面应用](https://openai.com/chatgpt/download/)中选择 **Codex**。它与 [Codex CLI](./codex_cli.md) 读取同一个 `~/.codex/config.toml`，桌面端和 CLI 因此可以共用同一个 LiteLLM 连接。

这些设置只作用于应用中的 Codex 部分，它读取 `~/.codex/config.toml`。应用内的普通 ChatGPT 对话不受该文件配置，也不会经过 LiteLLM。

`model_catalog_json` 设置对该应用同样生效；参见[自定义别名的模型元数据](./codex_cli.md#自定义别名的模型元数据)。

以下步骤配置 Codex 的本地模型提供商和 MCP（Model Context Protocol）服务器。截图取自 Linux 上的 ChatGPT Desktop 26.917.51856；菜单名称可能因应用版本而异。如果应用提示先完成引导设置，请完成后再选择 Codex。

<Image img={require('../../../img/client_setup/codex_desktop_01_mode_switcher_chatgpt_codex.png')} alt="ChatGPT Desktop 模式切换器，已选择 Codex" />

## 快速参考

| 配置项 | 值 |
|---|---|
| 配置文件 | `~/.codex/config.toml`（与 CLI 共用） |
| `base_url` | `<LITELLM_PROXY_BASE_URL>/v1`（例如 `http://localhost:4000/v1`） |
| 提供商密钥 | 你的 LiteLLM [虚拟密钥（virtual key）](../virtual_keys.md)，从 `env_key` 指定的环境变量读取，或通过 `lite auth print-token` 命令获取（参见 [Codex CLI SSO](./codex_cli.md#通过-litellm-sso-登录)） |
| MCP 端点 | `<LITELLM_PROXY_BASE_URL>/<server_name>/mcp` |
| MCP 认证 | 同一个虚拟密钥，从 `bearer_token_env_var` 指定的环境变量读取 |

## LLM 设置

### 1. 将 LiteLLM 添加为模型提供商

打开 **Settings -> Configuration -> Open config.toml**，或直接编辑 `~/.codex/config.toml`，添加一个指向你的网关 Responses API 端点的提供商配置块。这与 [CLI 设置](./codex_cli.md#llm-设置)完全一致：

```toml title="~/.codex/config.toml"
model = "{{anthropic}}"
model_provider = "litellm"

[model_providers.litellm]
name = "LiteLLM"
base_url = "http://localhost:4000/v1"
env_key = "LITELLM_API_KEY"
wire_api = "responses"
```

将 `{{anthropic}}` 替换为你的网关上已配置的某个模型名称。

<Image img={require('../../../img/client_setup/codex_desktop_03_settings_configuration_open_config_toml.png')} alt="Codex Configuration 设置界面，带有 Open config.toml 链接" />

桌面应用可能无法继承你在终端中导出的变量。启动应用前，先把你的 LiteLLM 虚拟密钥写入 `~/.codex/.env`：

```dotenv title="~/.codex/.env"
LITELLM_API_KEY=sk-<your-virtual-key>
```

将占位符替换为你的虚拟密钥，妥善保管该文件，修改后重启应用。如果 macOS 上已经在用 `launchctl setenv LITELLM_API_KEY <your-key>`，也可以继续以这种方式提供该变量。

也可以不用 `.env`，改用 [`auth` 命令](./codex_cli.md#通过-litellm-sso-登录)替代 `env_key`，因为应用运行的是同一个辅助程序。

### 2. 在 ChatGPT Desktop 中启动 Codex

打开 ChatGPT 桌面应用，在模式切换器中选择 **Codex**。Codex 会从 `config.toml` 读取 `litellm` 提供商，并使用 `LITELLM_API_KEY` 发起网关请求。接着开始一个新任务。

### 3. 验证

运行一个任务，然后到管理界面（Admin UI）的 **Logs** 或 **Usage** 下查看；该请求应归属到你的虚拟密钥名下。

要改用其他网关模型，更新 `config.toml` 中的 `model` 后再开始一个新任务即可。

## MCP 设置

### 1. 配置网关服务器

MCP 配置在同一个 `~/.codex/config.toml` 中，因此 [CLI 的 MCP 设置](./codex_cli.md#mcp-设置)原样适用。添加：

```toml title="~/.codex/config.toml"
[mcp_servers.litellm]
url = "http://localhost:4000/my_mcp_server/mcp"
bearer_token_env_var = "LITELLM_API_KEY"
```

其中 `my_mcp_server` 对应网关配置里 `mcp_servers:` 下的某个键，并且该密钥要有权访问对应服务器。`LITELLM_API_KEY` 必须按前文说明对应用可用。修改配置或 `.env` 文件后，请重启 ChatGPT Desktop。

在本截图对应的版本中，可以在 **Settings -> Plugins -> MCPs** 下查看这条配置。**Add MCP server** 表单同样接受上文展示的 URL 和 **Bearer token env var**。

<Image img={require('../../../img/client_setup/codex_desktop_06_mcp_server_form_url_bearer_env.png')} alt="Codex MCP 服务器表单，填写了 LiteLLM 服务器 URL 和 LITELLM_API_KEY Bearer Token 环境变量" />

截图使用的是名为 `deepwiki` 的网关服务器；请替换成你自己注册的服务器名称。

### 2. 在应用中验证连接

打开 **Settings -> Plugins -> MCPs**，确认 `litellm` 已启用。某些版本会直接在 **Settings -> MCP servers** 下展示该列表。

<Image img={require('../../../img/client_setup/codex_desktop_04_settings_plugins_mcp_servers_list.png')} alt="Codex MCP 设置界面，列出了已启用的 LiteLLM 服务器" />

启动一个会调用你服务器上只读工具的任务，出现确认提示时予以批准，然后验证它返回了结果。

<Image img={require('../../../img/client_setup/codex_desktop_09_mcp_tool_result.png')} alt="Codex 展示通过 LiteLLM 返回的 DeepWiki 工具结果" />

端点与认证选项详见 [MCP 配置参考](../../mcp_config_reference.md)。

## 后续步骤

[Codex CLI](./codex_cli.md) 与本页共用这份配置文件。另请参阅 [LiteLLM 虚拟密钥](../virtual_keys.md)和 [MCP 网关参考](../../mcp.md)。
