---
title: 在企业版部署 LiteAdmin MCP
sidebar_label: 部署 MCP（企业版）
description: 在统一或组件化的 LiteLLM 部署中启用 LiteAdmin MCP，并连接 Claude Code 或 Codex。
toc_max_heading_level: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 在企业版部署 LiteAdmin MCP

将 Claude Code 或 Codex 连接到网关的 `/admin/mcp` 端点，即可管理密钥、团队、模型和预算。

<EnterpriseFeature feature="内嵌 LiteAdmin MCP" />

:::info 镜像可用性

**LiteLLM 1.106.x 及更高版本支持**。请先准备好 HTTPS 部署和数据库。托管功能默认关闭；基础企业版许可证即可覆盖此功能。

:::

## 1. 启用 MCP {#enable-the-endpoint}

保留现有的 `DATABASE_URL`、`LITELLM_MASTER_KEY` 和代理配置。启用该端点前，先把名为 `admin` 的 MCP 服务器别名改名，因为 `/admin` 路径已被此端点保留。

<Tabs groupId="liteadmin-deployment">
<TabItem value="unified" label="统一 Docker">

在你现有的 `litellm` 服务中加入以下条目。许可证通过你的密钥存储（secret store）或 Compose 环境变量提供。

```yaml title="docker-compose.yml（服务片段）"
services:
  litellm:
    environment:
      LITELLM_ENABLE_ADMIN_MCP: "true"
      LITELLM_LICENSE: ${LITELLM_LICENSE}
      PROXY_BASE_URL: https://gateway.example.com
```

重建该服务：

```bash
docker compose up -d litellm
```

把 `/admin/mcp` 路由到容器的现有端口，默认 `4000`。统一镜像、数据库镜像和非 root 镜像均适用。

</TabItem>
<TabItem value="componentized" label="组件化（Helm）">

对于 [`helm/litellm` Chart](https://github.com/BerriAI/litellm/tree/main/helm/litellm)，把以下条目合并进 `backend.extraEnv`。许可证和公网 URL 条目沿用现有配置，避免重复。

```yaml title="values.yaml（组件化 Chart 片段）"
backend:
  extraEnv:
    - name: LITELLM_ENABLE_ADMIN_MCP
      value: "true"
    - name: LITELLM_LICENSE
      valueFrom:
        secretKeyRef:
          name: litellm-enterprise
          key: license
    - name: PROXY_BASE_URL
      value: https://gateway.example.com
```

把 `litellm-enterprise` 和 `license` 换成你现有的 Secret 名称与键名，然后执行 Helm 升级。

Chart 的 Ingress 会把 `/admin/mcp` 路由到后端。如果使用自定义 Ingress，请指向后端服务端口（默认 `4001`），并保留路径和 `Authorization` 请求头。网关组件不提供这个端点。

</TabItem>
</Tabs>

<details>
<summary>公网 URL 与启动设置</summary>

把 `PROXY_BASE_URL` 设为你的公网 HTTPS 域名，用于 Host 与 Origin 校验。如果 MCP 使用独立主机名，设置 `LITELLM_MCP_PUBLIC_URL=https://admin-mcp.example.com`，并连接 `https://admin-mcp.example.com/admin/mcp`。

开启时如果许可证或启用开关的值无效，启动会直接失败。要关闭 MCP，设置 `LITELLM_ENABLE_ADMIN_MCP=false` 并重启提供服务的容器。

</details>

## 2. 连接客户端 {#connect-a-client}

使用原生密钥认证时，请用一个属于 [`proxy_admin`](./access_control.md#全局代理角色) 角色的个人[虚拟密钥（virtual key）](./virtual_keys.md)完成读写。Viewer 和 team-admin 角色无法连接。主密钥（master key）留在服务端即可。

<Tabs groupId="liteadmin-enterprise-client">
<TabItem value="claude-code" label="Claude Code" default>

```bash
claude mcp add --scope user --transport http litellm-admin \
  https://gateway.example.com/admin/mcp \
  --header 'Authorization: Bearer <your-personal-proxy-admin-key>'
```

重启 Claude Code 并运行 `/mcp`。这条命令会把你的密钥写入 Claude 的配置，也可能残留在 shell 历史记录里。

</TabItem>
<TabItem value="codex" label="Codex">

```toml title="~/.codex/config.toml"
[mcp_servers.litellm-admin]
url = "https://gateway.example.com/admin/mcp"
bearer_token_env_var = "LITELLM_API_KEY"
```

对于 Codex CLI：

```bash
export LITELLM_API_KEY='<your-personal-proxy-admin-key>'
codex
```

运行 `/mcp` 检查连接。Codex 桌面版则要让应用能读到同一个环境变量，然后重启应用。

</TabItem>
</Tabs>

客户端密钥不要提交到版本控制。该端点不支持 `codex mcp login` 所需的浏览器 OAuth 登录。Claude Desktop 请改用[本地 MCP 配置](./liteadmin_mcp.md#连接你的客户端)。

<details>
<summary id="native-key-authentication">自定义密钥请求头</summary>

即使配置了 `general_settings.litellm_key_header_name`，也仍然发送 `Authorization: Bearer ...`。LiteLLM 会以你配置的请求头转发同一个密钥。

凭证类请求头要与身份、传输、审计、网络和策略类请求头区分开。命名冲突会导致启动失败。

</details>

<details>
<summary id="oauth2-proxy-authentication">OAuth2 代理认证</summary>

启用 `general_settings.enable_oauth2_proxy_auth` 后，请求会经由你的认证代理转发。原始调用方的直连对端必须匹配 `trusted_proxy_ranges`；`oauth2_config_mappings` 指定的请求头用于选中一个具有已存储 `proxy_admin` 角色的用户。

配置代理时，用通过认证的用户信息覆盖身份请求头。连接器要求 Bearer 凭证，而原生认证读取的是身份请求头；个人管理员密钥无法绕过这一模式。

</details>

## 3. 验证 {#verify-the-deployment}

向你已连接的客户端提问：

> 让 LiteAdmin 列出我的团队和它们当前的预算。

确认它调用了管理员工具，并返回了你网关中的数据。团队列表为空也是有效结果。

<details>
<summary>用 curl 检查</summary>

使用原生密钥认证时，把 `ADMIN_KEY` 设为你的个人 proxy-admin 密钥：

```bash
curl --fail-with-body https://gateway.example.com/admin/mcp \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

带管理员密钥应返回工具目录；不带凭证返回 `401`；缺少 `proxy_admin` 角色返回 `403`。端点未启用或请求发到网关组件时返回 `404`。

</details>

## 工具与响应设置

<details>
<summary>限制工具或调整响应格式</summary>

在 LiteLLM 或后端容器上设置这些变量，然后重启该容器。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `LITELLM_ADMIN_READ_ONLY` | `false` | 设为 `true` 时，工具发现与执行仅限经过审核的只读操作；需要 `proxy_admin` 角色 |
| `LITELLM_ADMIN_TOOLS` | All available reviewed operations | 逗号分隔的[工具名](https://github.com/BerriAI/litellm-admin-mcp/blob/main/src/litellm_admin_mcp/operations.json)列表，如 `list_keys,list_teams`；可与只读限制叠加 |
| `LITELLM_ADMIN_RESPONSE_VIEW` | `full` | `full` 内联返回结果；`compact` 可返回已保存结果的引用 |
| `LITELLM_ADMIN_SCHEMA_MODE` | `full` | `discovery` 把参数细节延后到 `describe_admin_tool` 提供；执行时仍按完整 schema 校验 |

多 worker 或多副本部署请保持 `full` 响应。使用 `compact` 时，`read_admin_result` 调用必须落在同一个 worker 进程上；仅靠 Pod 亲和性不够。结果会过期，worker 重启后也会消失。重试写操作前先检查网关状态。

</details>

## 故障排查

| 现象 | 排查方法 |
| --- | --- |
| 启动失败 | 查看启动报错，检查许可证、启用开关和请求头命名冲突 |
| 缺少 MCP 依赖 | 使用 LiteLLM 1.106.x 或更新版本的统一镜像或后端镜像 |
| `404` | 检查镜像版本、启用开关，并确认容器已重启。`/admin/mcp` 路由保持原样，指向统一代理或后端 |
| 密钥模式下返回 `401` 或 `403` | 使用仍有效的个人 `proxy_admin` 密钥 |
| OAuth2 代理认证失败 | 检查受信任的直连对端、映射的身份请求头以及用户存储的角色 |
| Host 或 Origin 被拒 | 让 `PROXY_BASE_URL` 或 `LITELLM_MCP_PUBLIC_URL` 与公网 HTTPS 域名保持一致 |
| 工具缺失 | 检查工具限制以及底层管理 API 是否可用 |
| Compact 结果不可用 | 改用同一个 worker 进程，或切换回 `full` |
| 写操作超时 | 重试前先检查网关状态；连接器不会自动重试工具调用 |

创建模型请参见[添加模型部署](./liteadmin_mcp.md#添加模型部署)。要运行 Slack agent worker，请按照 [LiteAdmin Slack 应用配置](./liteadmin_slack.md)操作。
