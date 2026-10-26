---
title: LiteAdmin MCP
sidebar_label: 连接 Claude 或 Codex
description: 使用 LiteAdmin MCP 将 Claude Desktop、Claude Code 或 Codex 连接到你的 LiteLLM 网关。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteAdmin MCP

使用 **LiteAdmin MCP**（[LiteLLM Admin MCP](https://github.com/BerriAI/litellm-admin-mcp)）可以从 Claude、Codex 或其他 MCP（Model Context Protocol）客户端管理你的网关。你可以让智能体（agent）：

- 创建和管理虚拟密钥（virtual key）。
- 添加模型部署（deployment）。
- 管理团队、成员和预算。
- 查看花费、活动与请求日志。

客户端负责运行智能体和模型；MCP 服务器则用你的个人管理员凭据调用网关的管理 API。完成接入后，客户端的模型提供商设置保持不变。

如果想在企业版（Enterprise）部署中托管 MCP，请参阅[在企业版上部署 LiteAdmin MCP](./liteadmin_mcp_enterprise.md)，了解统一镜像与组件化 Docker 镜像两种方案。

若要通过 Slack 管理网关，请按照 [LiteAdmin Slack 应用配置](./liteadmin_slack.md)操作，并选择企业版或独立部署。若要让第三方 MCP 工具经 LiteLLM 路由，请参阅单独的 [MCP 网关](../mcp.md)指南。

## 开始之前

你需要一个正在运行的 LiteLLM 网关，以及一个属于具备 [`proxy_admin` 角色](./access_control.md#全局代理角色)用户的个人[虚拟密钥](./virtual_keys.md)。连接器（connector）的**所有工具**（包括只读操作）都要求该角色；`proxy_admin_viewer` 和团队管理员账号无法使用。

对于下文的本地客户端配置，请在运行 MCP 客户端的电脑上安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。连接器要求 Python 3.12 或更高版本；uv 可以下载兼容的解释器。 {/* keep-python-version */}

准备好以下取值：

| 设置 | 值 |
| --- | --- |
| `LITELLM_BASE_URL` | 网关的 HTTPS 来源，例如 `https://gateway.example.com`；可接受可选的 `/v1` 后缀。 |
| `LITELLM_API_KEY` | 你的个人 proxy-admin 密钥。 |

运行连接器的电脑必须能访问网关的 `/openapi.json` 和管理 API。除本地回环开发外，请一律使用 HTTPS。

## 连接你的客户端

在下方选择你的客户端，并替换网关 URL 和密钥占位符。包含密钥的配置请妥善保管，不要提交到版本控制；客户端如有密钥存储功能，优先使用。

<Tabs groupId="liteadmin-client">
<TabItem value="claude-desktop" label="Claude Desktop" default>

在 Claude Desktop 中打开 **Settings → Developer → Edit Config**，在 `mcpServers` 下新增 `litellm-admin` 条目，并保留已有的服务器配置：

```json title="claude_desktop_config.json"
{
  "mcpServers": {
    "litellm-admin": {
      "command": "uvx",
      "args": [
        "--isolated",
        "--refresh-package",
        "litellm-admin-mcp",
        "--from",
        "git+https://github.com/BerriAI/litellm-admin-mcp.git@main",
        "litellm-admin-mcp"
      ],
      "env": {
        "LITELLM_BASE_URL": "https://gateway.example.com",
        "LITELLM_API_KEY": "<your-personal-proxy-admin-key>"
      }
    }
  }
}
```

完全退出并重新打开 Claude Desktop。在新的对话中打开 **+ → Connectors**，确认 `litellm-admin` 及其工具是否出现。开发者设置中也能查看连接状态和日志。

如果 Claude 找不到 `uvx`，请把 `"command": "uvx"` 替换为其绝对路径。macOS 上运行 `which uvx`、Windows 上运行 `where uvx` 即可定位。在 JSON 中，Windows 反斜杠需转义为 `\\`。

配置文件的位置可参阅 [Claude Desktop 手动配置指南](https://modelcontextprotocol.io/docs/develop/connect-local-servers)。

</TabItem>
<TabItem value="claude-code" label="Claude Code">

在终端中运行：

```bash
claude mcp add --scope user --transport stdio litellm-admin \
  --env LITELLM_BASE_URL=https://gateway.example.com \
  --env LITELLM_API_KEY='<your-personal-proxy-admin-key>' \
  -- uvx --isolated --refresh-package litellm-admin-mcp \
  --from git+https://github.com/BerriAI/litellm-admin-mcp.git@main \
  litellm-admin-mcp
```

`--scope user` 选项让该连接在你的所有项目中可用，并保存在你的私有 Claude 配置中。shell 历史记录也可能保留这条命令。

重启 Claude Code 并运行 `/mcp` 检查连接。也可以在终端中查看：

```bash
claude mcp get litellm-admin
```

配置作用域与客户端故障排查请参阅 [Claude Code 的 MCP 文档](https://code.claude.com/docs/en/mcp)。

</TabItem>
<TabItem value="codex" label="Codex">

将以下服务器配置加入你已有的 `~/.codex/config.toml`：

```toml title="~/.codex/config.toml"
[mcp_servers.litellm-admin]
command = "uvx"
args = [
  "--isolated",
  "--refresh-package", "litellm-admin-mcp",
  "--from", "git+https://github.com/BerriAI/litellm-admin-mcp.git@main",
  "litellm-admin-mcp"
]
startup_timeout_sec = 60

[mcp_servers.litellm-admin.env]
LITELLM_BASE_URL = "https://gateway.example.com"
LITELLM_API_KEY = "<your-personal-proxy-admin-key>"
```

同一台主机上的本地 Codex 客户端共享这份配置。重启客户端以加载该服务器。在 Codex CLI 中运行 `/mcp` 可查看当前连接与工具；`codex mcp list` 会列出已配置的服务器。

如果在终端中使用，可以让密钥不落在这个文件里：删除 `LITELLM_API_KEY` 赋值，在服务器表中、`.env` 表之上添加 `env_vars = ["LITELLM_API_KEY"]`，并在启动 `codex` 前导出该变量。桌面应用要用这个选项，也必须能访问该环境变量。

支持的配置字段请参阅 [Codex 官方 MCP 文档](https://developers.openai.com/codex/mcp)。

</TabItem>
</Tabs>

以上示例在客户端每次启动服务器时都会检查连接器的 GitHub `main` 分支。更新后请重启连接。若要固定版本，把 `@main` 换成某个发布标签或完整 commit SHA，并删掉 `--refresh-package` 及紧随其后的 `litellm-admin-mcp` 参数。

## 验证连接

先从一个读取请求开始：

> 让 LiteAdmin 列出我的团队及其当前预算。

确认客户端调用了管理工具，并返回来自你网关的数据。如果你还没有团队，返回空列表也是正常结果。仅仅连接上 MCP 服务器并不能证明网关访问正常。

读取成功后，就可以提出这类修改请求：

- “为 Engineering 团队创建一个每月预算 100 美元的密钥。”
- “把 Engineering 团队的月度预算改为 500 美元。”

名称和额度要与你想做的修改一致。网关会按调用者的权限和功能授权执行校验。写入操作超时后，先检查受影响的密钥、团队或模型，再重试。

### 添加模型部署

要进行[模型管理](./model_management.md)，网关需要连接数据库、设置 `STORE_MODEL_IN_DB=True`，并配置好提供商认证。请求中要包含公开模型名、准确的 provider/model ID，以及已保存的凭据名称或网关环境变量引用。例如：

> 添加一个名为 support-chat 的模型，使用 openai/gpt-4.1 和已有的网关凭据 openai-production。

请使用你的部署中真实存在的 provider/model ID 和凭据。提供商 API 密钥不要出现在对话里。添加网关部署并不会开通提供商访问权限，也不会测试推理。

## 限制可用工具

在 MCP 服务器的环境中设置以下变量，然后重启连接：

| 变量 | 作用 |
| --- | --- |
| `LITELLM_ADMIN_READ_ONLY=true` | 仅暴露经过审核的只读操作。仍然需要 `proxy_admin` 身份。 |
| `LITELLM_ADMIN_TOOLS=list_keys,list_teams` | 将服务器限制在这些规范工具名之内。 |

连接器会从你的网关发现 schema，并只暴露其中可用的经过审核的操作。工具名称可查阅[操作目录](https://github.com/BerriAI/litellm-admin-mcp/blob/main/src/litellm_admin_mcp/operations.json)。如果同时设置了两项限制，则只有同时被两者允许的工具保持可用。

## 在 LiteLLM 内运行 LiteAdmin MCP

按照[在企业版上部署 LiteAdmin MCP](./liteadmin_mcp_enterprise.md)操作，即可由统一 LiteLLM 镜像或组件化部署中的管理后端对外提供 `/admin/mcp` 服务。该指南涵盖了启用开关、企业版许可、入口路由、认证、客户端配置与验证。

### 内嵌工具与响应设置

内嵌默认值、只读限制以及紧凑结果的 worker 要求，请参阅[工具与响应设置](./liteadmin_mcp_enterprise.md#工具与响应设置)。

## 托管共享 MCP 端点

如果想让连接器跑在服务器上，而不是装在每台用户电脑上，可以使用 Streamable HTTP。在该主机上安装 uv，然后运行：

```bash
export LITELLM_BASE_URL=https://gateway.example.com
export LITELLM_MCP_PUBLIC_URL=https://admin-mcp.example.com
uvx --isolated --refresh-package litellm-admin-mcp \
  --from git+https://github.com/BerriAI/litellm-admin-mcp.git@main \
  litellm-admin-mcp --transport streamable-http --port 8080
```

在 `127.0.0.1:8080` 前面架一层 HTTPS 反向代理，并从 `admin-mcp.example.com` 把流量转发过去。客户端端点为 `https://admin-mcp.example.com/mcp`。把 `LITELLM_MCP_PUBLIC_URL` 设为该公开来源（不带 `/mcp` 路径），连接器才会接受相应的 Host 和 Origin 头。

**托管服务上不要设置 `LITELLM_API_KEY`**。每个客户端都会发送自己的个人 proxy-admin 密钥。每个受信任的网关只部署一套实例，并且只连接由你自己运营、值得信任的连接器。

用以下任一方式配置客户端，替代本地设置：

<Tabs groupId="liteadmin-http-client">
<TabItem value="claude-code" label="Claude Code" default>

```bash
claude mcp add --scope user --transport http litellm-admin-remote \
  https://admin-mcp.example.com/mcp \
  --header 'Authorization: Bearer <your-personal-proxy-admin-key>'
```

重启 Claude Code 并运行 `/mcp` 检查连接。这条命令会把该头部保存进你的私有客户端配置；shell 历史也可能保留它。

</TabItem>
<TabItem value="codex" label="Codex">

```toml title="~/.codex/config.toml"
[mcp_servers.litellm-admin-remote]
url = "https://admin-mcp.example.com/mcp"
bearer_token_env_var = "LITELLM_API_KEY"
```

在 Codex 进程的环境中设置 `LITELLM_API_KEY`。对于 Codex CLI：

```bash
export LITELLM_API_KEY='<your-personal-proxy-admin-key>'
codex
```

运行 `/mcp` 检查连接。

</TabItem>
</Tabs>

该端点使用 Bearer API 密钥认证，不提供浏览器 OAuth 登录，因此 `codex mcp login` 和仅支持 OAuth 的连接器接入方式都不适用。Claude Desktop 请改用上面的本地配置。

先通过 `/healthz` 检查进程健康状态，再重复上面的读取请求来验证网关访问。进程健康并不代表它的网关 URL、凭据或管理 API 一定可用。

## 故障排查

| 症状 | 排查方法 |
| --- | --- |
| 找不到 `uvx` | 安装 uv，并在桌面客户端中使用可执行文件的绝对路径。 |
| 启动超时 | 等首次包/Python 下载完成；检查能否访问 GitHub 和包下载源。必要时调大客户端的启动超时时间。 |
| 未授权或被拒绝 | 使用属于 `proxy_admin` 的有效个人密钥。只读模式不会向其他角色开放访问。 |
| 工具缺失或 schema 发现失败 | 检查 `/openapi.json` 和网关管理路由是否可达。如果 operation ID 有变动，请更新连接器。 |
| 模型创建失败 | 检查数据库、`STORE_MODEL_IN_DB`、准确的 provider/model ID 以及网关凭据。 |
| 托管连接被拒 | 检查 `/mcp` URL、Bearer 头、HTTPS 代理和 `LITELLM_MCP_PUBLIC_URL`。 |
| 写入超时 | 重试前先检查网关状态；连接器不会自动重试工具调用。 |

结果分页、schema 发现选项与 Docker 托管方式，请参阅[连接器仓库](https://github.com/BerriAI/litellm-admin-mcp)。
