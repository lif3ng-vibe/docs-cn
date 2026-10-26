---
title: 配置 LiteAdmin Slack 应用
sidebar_label: 配置 Slack 应用
description: 在 Slack 中安装 LiteAdmin，部署企业版 worker 或独立 agent，并连接你自己的 LiteLLM 管理员账号。
toc_max_heading_level: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 配置 LiteAdmin Slack 应用

你可以在 Slack 私信（DM）中向 **LiteAdmin** 询问团队、预算、模型和花费情况。每位管理员各自连接自己的 LiteLLM 账号

Slack 应用只需安装一次，然后从下文选择一种部署方式。**企业版**（Enterprise）使用网关自带的 worker 和现有 SSO（单点登录）**；独立部署**（Standalone）则单独运行一个 agent 服务，自带 HTTPS 地址与登录配置

要将 Claude Code 或 Codex 连接到企业版部署上的 MCP（Model Context Protocol）端点，请参阅[在企业版部署 LiteAdmin MCP](./liteadmin_mcp_enterprise.md)。该指南覆盖统一镜像与组件化镜像中的 `/admin/mcp`；本页配置的则是 Slack agent worker

## 开始之前

你需要一个正常运行、支持 HTTPS 的 LiteLLM 网关，配有数据库，并至少提供一个每位接入管理员都能使用的工具调用（tool calling）模型。每位用户都需要一个有效的 [`proxy_admin` 账号](./access_control.md#全局代理角色)，其邮箱要与 Slack 个人资料一致。此外，你还需要在工作区（workspace）中创建并安装 Slack 应用的权限

每个 Slack 应用、工作区与网关的组合各运行一个 worker，为其配备持久化存储，并允许其向 Slack 发起出站 WebSocket 连接。HTTPS 来源地址不要带 URL 子路径。企业版部署还要求有效的许可证，并[在网关上配置 SSO](./admin_ui_sso.md)

## 1. 创建并安装 Slack 应用 {#2-create-and-install-the-slack-app}

每个环境使用单独的 Slack 应用，例如测试环境使用 **LiteAdmin Dev**

1. 打开 [Slack 应用管理面板](https://api.slack.com/apps)，选择 **Create New App**，再选 **From a manifest**，然后选择你的工作区
2. 粘贴下面的 JSON manifest。按需修改应用名称，检查各权限，然后创建应用
3. 在 **Basic Information** 下打开 **App-Level Tokens**，生成一个名为 `liteadmin-socket`、带 `connections:write` 权限范围的 token，并把 `xapp-…` 值保存为 `SLACK_APP_TOKEN`
4. 在 **OAuth & Permissions** 下选择 **Install to Workspace** 并批准安装。把以 `xoxb-` 开头的 **Bot User OAuth Token** 保存为 `SLACK_BOT_TOKEN`
5. 在 Slack 网页版中打开你的工作区，从 `https://app.slack.com/client/T…/…` 复制以 `T` 开头的工作区 ID，保存为 `SLACK_WORKSPACE_ID`

<details>
<summary>用于私信的 Slack 应用清单</summary>

```json
{
  "display_information": {
    "name": "LiteAdmin",
    "description": "Ask about your LiteLLM gateway. Send connect in a DM to sign in.",
    "background_color": "#111827"
  },
  "features": {
    "bot_user": {
      "display_name": "LiteAdmin",
      "always_online": false
    },
    "app_home": {
      "home_tab_enabled": false,
      "messages_tab_enabled": true,
      "messages_tab_read_only_enabled": false
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "chat:write",
        "im:history",
        "reactions:write",
        "users:read",
        "users:read.email"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "bot_events": ["message.im"]
    },
    "socket_mode_enabled": true,
    "org_deploy_enabled": false,
    "token_rotation_enabled": false
  }
}
```

</details>

这份清单启用了 Socket Mode、私信事件，以及可写的 **Messages** 标签页。应用可以读取发给它的消息，并查询用于匹配网关账号的 Slack 资料邮箱。Slack 不需要入站事件 webhook，消息通过 worker 的出站连接送达

## 2. 部署并连接

选择其中一种部署路径。企业版会先以只读模式启动，你可以先验证查询，再放开变更

<Tabs groupId="liteadmin-setup" queryString="deployment">
<TabItem value="enterprise" label="企业版（推荐）" default>

Docker 镜像已包含 agent 代码及其依赖。在启用 worker 并安装 Slack 应用之前，任何人都无法使用它。Helm 设置 `liteadmin.enabled` 默认为 `false`，普通网关容器不会启动 worker；需要通过部署配置启用，并持有有效的企业版许可证。仪表板上没有对应的开关

网关和 worker 由同一镜像启动、以独立容器运行。Slack 通过 worker 的出站 Socket Mode 连接投递消息；worker 则以发起请求的管理员的个人会话调用你的网关。worker 保持私有，登录通过网关的 HTTPS 地址完成

:::note 可用性

所用镜像和 Chart 必须包含 [LiteLLM PR #44444](https://github.com/BerriAI/litellm/pull/44444)，以及 [Admin Agent PR #18](https://github.com/BerriAI/litellm-admin-agent/pull/18) 中固定的 worker 版本。更早的镜像和 Chart 不包含此集成。下文的镜像名称仅为示例，并非已发布的版本标签

:::

### 准备网关 {#1-prepare-your-gateway}

从一个正常运转的企业版网关开始，要求配有数据库、HTTPS 地址，且[已配置 SSO](./admin_ui_sso.md)。确认你能登录其管理界面（Admin UI）。来源地址形如 `https://gateway.example.com`，不带 URL 子路径

选择一个网关已暴露、且每位接入管理员都有权限使用的工具调用模型，并在下文配置中填写其网关模型名

每位用户都需要一个有效的 [`proxy_admin` 账号](./access_control.md#全局代理角色)，其邮箱与 Slack 个人资料一致。网关会在连接账号前校验企业版权益和当前管理员权限；worker 在允许使用 agent 前也会校验权益与身份

每个 Slack 应用、工作区与网关的组合各运行一个 worker。允许 worker 向 Slack 发起出站 WebSocket 连接、向网关发送 HTTPS 请求，并允许网关通过私有端口 `10000` 访问 worker

### 保存 worker 凭证 {#3-store-the-workers-credentials}

把以下五个值存入你的密钥管理器（secret manager），并与网关的主密钥（master key）和数据库凭据分开保管

| 设置 | 值 |
| --- | --- |
| `SLACK_BOT_TOKEN` | 已安装应用的 `xoxb-…` token |
| `SLACK_APP_TOKEN` | 带 `connections:write` 权限的 `xapp-…` token |
| `SLACK_WORKSPACE_ID` | 以 `T` 开头的工作区 ID |
| `ADMIN_AGENT_SERVICE_TOKEN` | 至少 32 个字符的随机共享密文，供网关和 worker 使用 |
| `CREDENTIAL_ENCRYPTION_KEY` | 用于加密已保存个人会话的持久 Fernet 密钥 |

服务 token 用 `openssl rand -hex 32` 生成。若机器上装有 Python `cryptography` 包，可运行以下命令生成加密密钥：

```bash
python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'
```

把生成的值保存到密钥管理器。升级时保留加密密钥和 worker 状态卷（volume），worker 才能读取已保存的连接。凭据不要进入版本控制，也不要出现在 Slack 消息里

### 启用 worker {#4-enable-the-worker}

沿用网关现有的部署方式即可。两种示例都以**只读模式**启动，agent 可以回答查询，但不会改动网关资源

<Tabs groupId="liteadmin-native-deployment">
<TabItem value="helm" label="Kubernetes / Helm" default>

使用包含此集成的 LiteLLM 代码库中的 `helm/litellm-helm` Chart。网关的现有 values 保持不变，包括企业版许可证、数据库和 SSO 配置

通过惯用的密钥管理流程，在网关所在的命名空间中创建名为 `liteadmin-slack` 的 Secret，内容必须包含上文**保存 worker 凭证**一节列出的五个设置。手动安装时，先把这几个设置保存到私有的 `liteadmin-secrets.env` 文件，再运行：

```bash
chmod 600 liteadmin-secrets.env
export LITELLM_NAMESPACE=litellm
kubectl --namespace "$LITELLM_NAMESPACE" create secret generic liteadmin-slack \
  --from-env-file=liteadmin-secrets.env
```

命名空间请替换为实际值。如果 Secret 已存在，请通过管理它的系统更新，并保留其中的加密密钥

新增一个 `liteadmin-values.yaml` 文件：

```yaml title="liteadmin-values.yaml"
image:
  repository: registry.example.com/your-team/litellm
  tag: native-slack

liteadmin:
  enabled: true
  gatewayUrl: https://gateway.example.com
  model: your-tool-capable-model
  existingSecret: liteadmin-slack
  storageSize: 1Gi
  readOnly: true
```

镜像请替换为包含此集成的构建版本。把 `gatewayUrl` 和 `model` 设为你的网关 URL 和模型名。如果集群要求特定的存储类，可在 `liteadmin` 下设置 `storageClassName`

把配置应用到现有 release。`litellm` 替换为你的 release 名称，`gateway-values.yaml` 替换为你现用的 values 文件：

```bash
export LITELLM_RELEASE=litellm
helm dependency build ./helm/litellm-helm
helm upgrade "$LITELLM_RELEASE" ./helm/litellm-helm \
  --namespace "$LITELLM_NAMESPACE" \
  -f gateway-values.yaml \
  -f liteadmin-values.yaml
```

Chart 会启动一个 worker，配备私有的 ClusterIP Service 和持久卷声明（PVC）；它会把 worker 地址配置到网关，且只与网关副本共享 `ADMIN_AGENT_SERVICE_TOKEN`。worker 使用自己的 Secret，不含网关主密钥或数据库凭据

网关的自动扩缩容不会扩缩 worker。worker 保持单副本，Service 保持私有。修改 worker Secret 的值后需要重启 worker 才能加载；更改共享服务 token 后，网关也需要重启

</TabItem>
<TabItem value="compose" label="Docker Compose">

在包含此集成的 LiteLLM 代码库中构建镜像，或使用已包含该集成的公开构建版本：

```bash
docker build -t litellm-native-admin:local .
```

网关现有的 `.env` 和 Compose 配置保持不变，包括许可证、数据库、模型和 SSO 设置。worker 设置单独保存在一个私有文件中：

```dotenv title="liteadmin.env"
LITELLM_IMAGE=litellm-native-admin:local
LITELLM_PUBLIC_URL=https://gateway.example.com
LITELLM_ADMIN_MODEL=your-tool-capable-model
SLACK_BOT_TOKEN=your-installed-bot-token
SLACK_APP_TOKEN=your-socket-mode-app-token
SLACK_WORKSPACE_ID=your-workspace-id
ADMIN_AGENT_SERVICE_TOKEN=your-generated-service-token
CREDENTIAL_ENCRYPTION_KEY=your-generated-fernet-key
ADMIN_READ_ONLY=true
```

把占位符替换为你的网关设置和上文保存的密钥。网关和 worker 使用同一个服务 token，overlay 会从这个文件为两者读取

通过附加的 Compose 文件启动网关和 worker：

```bash
chmod 600 liteadmin.env
docker compose --env-file .env --env-file liteadmin.env \
  -f docker-compose.yml -f docker-compose.liteadmin.yml up -d
```

请使用 Docker Compose v2。worker 凭据放在 `liteadmin.env` 里，基础网关配置加载自己的 `.env`。overlay 会以 `--admin-agent` 启动同一个镜像，在网关上设置私有 worker 地址，并创建 `liteadmin_state` 卷；不会对外发布 worker 端口

网关前面继续使用现有的 HTTPS 反向代理。修改 worker 设置后，重新执行 Compose 命令，让容器拿到新值

</TabItem>
</Tabs>

### 验证 worker {#5-verify-the-worker}

对 **Helm** 部署，在你的命名空间中找到 worker 的 Deployment，名称以 `-liteadmin` 结尾：

```bash
kubectl --namespace "$LITELLM_NAMESPACE" get deployments
export LITEADMIN_DEPLOYMENT=litellm-liteadmin
kubectl --namespace "$LITELLM_NAMESPACE" rollout status \
  "deployment/$LITEADMIN_DEPLOYMENT" --timeout=180s
kubectl --namespace "$LITELLM_NAMESPACE" exec \
  "deployment/$LITEADMIN_DEPLOYMENT" -- \
  /opt/liteadmin/bin/python -c \
  "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:10000/readyz').read().decode())"
```

把 `LITEADMIN_DEPLOYMENT` 替换为 `get deployments` 显示的名称；Chart 的名称覆盖配置可能改变它。预期看到一个就绪的 worker，并输出 `{"status": "ready"}`

对 **Docker Compose** 部署，在 worker 内部运行同样的就绪检查：

```bash
docker compose --env-file .env --env-file liteadmin.env \
  -f docker-compose.yml -f docker-compose.liteadmin.yml \
  exec liteadmin /opt/liteadmin/bin/python -c \
  "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:10000/readyz').read().decode())"
```

预期输出 `{"status": "ready"}`。启用 Slack 后，就绪检查会覆盖状态数据库和 Slack socket。完成下一步即可验证登录、模型访问和一次管理工具请求

### 连接账号并测试请求 {#6-connect-your-account-and-test-a-request}

1. 在 Slack 的 **Apps** 中打开 **LiteAdmin**（或你在清单中设置的名字），在私信中发送 `connect`
2. 在十分钟内打开私密连接链接，它应当指向你网关的 HTTPS 地址
3. 用你平时的 LiteLLM 登录方式登录。如果浏览器里已有有效会话，会直接进入连接页面
4. 核对页面上的邮箱，选择 **Connect account**，应显示 **Account connected**
5. 回到 Slack 提问：**我的 LiteLLM 角色是什么？请通过网关验证**

应收到确认 `proxy_admin` 的回复。之后可以继续提问：**列出我的团队及其当前预算**。worker 会用你的个人会话发起模型请求和管理操作，并核验你的 Slack 身份与当前网关权限

连接链接十分钟内有效，且只能使用一次。个人会话最长保持 24 小时。会话过期后重新发送 `connect`；发送 `disconnect` 可删除 worker 已保存的连接，并使未使用的链接失效。断开连接不会撤销已在网关导出的凭据，该凭据仍按自己的有效期运行

### 测试结束后允许变更

上面的示例启用了只读模式。要允许已连接的管理员修改密钥、团队、模型或预算，在 Helm 中设置 `liteadmin.readOnly: false`，或在 Compose 中设置 `ADMIN_READ_ONLY=false`，然后重新应用部署

选一项你确实要做的变更，并在网关上核对结果。省略只读设置时，配置默认允许写入；如果这个部署只应回答查询，请保留显式的 `true`

### 将现有应用迁移到企业版 worker {#existing-liteadmin-installations}

这种部署以 `native` 认证模式使用 [LiteLLM Admin Agent](https://github.com/BerriAI/litellm-admin-agent) 代码。每个独立的 Slack 应用有自己的 worker 和已保存的连接；你现有的独立部署应用仍会使用其配置的后端

要复用现有的 Slack 应用，先停掉旧 worker，再用该应用的凭据启动内置 worker；这组凭据只运行一个 worker。让用户重新发送 `connect` 以建立网关原生会话。迁移完成前，保留旧部署的状态和加密密钥

原生模式使用网关的连接页面和现有 SSO 配置，无需配置托管的 `/register`、`/authorize` 或 `/token` 回调，也无需再添加一个身份提供商客户端

</TabItem>
<TabItem value="standalone" label="独立部署">

将 [LiteLLM Admin Agent](https://github.com/BerriAI/litellm-admin-agent) 部署为单独的服务，自带 HTTPS 地址和登录配置。本地配置命令使用 Python 3.12，托管方式可选 Docker Compose 或带持久化存储的 Render 付费服务。 {/* keep-python-version */}

应用内置了一个版本固定的 [Admin MCP 连接器](./liteadmin_mcp.md)，并以发起请求用户的凭据启动它。你不需要在网关里注册 MCP 服务器，也不必再部署别的连接器

### 创建配置 {#1-create-your-configuration}

```bash keep-python-version
git clone https://github.com/BerriAI/litellm-admin-agent.git
cd litellm-admin-agent
python3.12 -m venv .venv
source .venv/bin/activate
pip install --require-hashes -r requirements.txt
python setup_env.py
```

以上命令使用 macOS/Linux shell。打开生成的 `.env` 文件填入你的设置；如果 `.env` 已存在，直接编辑即可，不必重跑配置脚本。

把生成的 `CREDENTIAL_ENCRYPTION_KEY` 存入密钥管理器，升级时也要保留。应用读取已保存连接时需要同一把密钥。`.env` 要保密，生成的 `ADMIN_AGENT_SERVICE_TOKEN` 也要留存。

把上文安装步骤中的三个 Slack 值加入 `.env`：`SLACK_APP_TOKEN`、`SLACK_BOT_TOKEN` 和 `SLACK_WORKSPACE_ID`

### 选择网关与登录方式 {#3-choose-your-gateway-and-login-method}

编辑 `.env` 中的以下条目，生成的密钥保持不变：

```dotenv title=".env"
LITELLM_BASE_URL=https://gateway.example.com/v1
LITELLM_MODEL=your-gateway-model-name
CONNECTION_AUTH_MODE=api_key
AGENT_PUBLIC_URL=https://admin.example.com
```

`LITELLM_MODEL` 设为网关暴露、且每位已连接管理员都能使用的模型名。`AGENT_PUBLIC_URL` 设为应用的 HTTPS 来源，不带路径。使用 Render 时，拿到部署 URL 后再回填到本地这份文件。

`api_key` 是个人密钥登录：用户在 Slack 中发送 `connect` 后，在私密浏览器页面上输入自己的密钥。**网关密钥不要发到 Slack 消息里**。若要用浏览器 SSO，请先参阅[可选：SSO 登录](#可选sso-登录)，再把 `CONNECTION_AUTH_MODE` 改为 `sso`。

每个部署只能选一种登录方式。每位 Slack 用户用自己的账号登录，agent 以该用户的凭据发起模型请求和管理操作。

### 部署应用 {#4-deploy-the-app}

<Tabs groupId="liteadmin-hosting">
<TabItem value="docker" label="Docker Compose" default>

把 `AGENT_PUBLIC_URL` 设为你打算使用的 HTTPS 地址，然后运行：

```bash
python doctor.py --offline
docker compose up -d --build
```

离线检查会在部署前验证配置。Compose 把应用绑定到 `127.0.0.1:10000`，状态保存在 `admin-state` 卷中。

把域名指向这台主机，并配置 HTTPS 反向代理。Caddy 与应用同机时的配置：

```caddyfile
admin.example.com {
    reverse_proxy 127.0.0.1:10000
}
```

如果反向代理在另一个容器或另一台主机上，请配置共享私有网络，转发到应用可达的私有地址。

重启和升级时保留 `admin-state` 卷和加密密钥。这个 Slack 应用只运行一个容器。

</TabItem>
<TabItem value="render" label="Render">

从 [agent 仓库](https://github.com/BerriAI/litellm-admin-agent)或你的 fork 创建 Render **Blueprint**，使用仓库自带的 [`render.yaml`](https://github.com/BerriAI/litellm-admin-agent/blob/main/render.yaml)、带持久磁盘的付费套餐，以及单个实例。

Render 提示时填入以下设置：

| 设置 | 值 |
| --- | --- |
| `LITELLM_BASE_URL` | 你的网关 URL，例如 `https://gateway.example.com/v1`。 |
| `LITELLM_MODEL` | 网关的工具调用模型名。 |
| `SLACK_APP_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_WORKSPACE_ID` | Slack 安装步骤中保存的值。 |
| `CONNECTION_AUTH_MODE` | `api_key`；完成下文的 SSO 要求后可用 `sso`。 |
| `CREDENTIAL_ENCRYPTION_KEY` | `setup_env.py` 生成的密钥，后续部署也要保留。 |
| `ADMIN_TOOL_NAMES` | 留空表示开放所有可用的受审工具，也可设置允许清单。 |

Blueprint 会创建状态磁盘和服务 token，并把 Render 的外部 URL 用作应用来源。部署完成后，把这个 HTTPS URL 复制到本地 `.env` 的 `AGENT_PUBLIC_URL`，让预检检查同一地址。如果使用自定义域名，也要在 Render 的环境变量里设置 `AGENT_PUBLIC_URL`。

生成的服务 token 保留下来，以备将来注册网关 Agents 用；Slack 使用并不需要这个注册。以后想更换登录方式，在 **Environment** 下更新 `CONNECTION_AUTH_MODE` 并重新部署。

</TabItem>
</Tabs>

### 检查部署 {#5-check-the-deployment}

在本地配置环境中，把 `LITELLM_SETUP_KEY` 设为你的个人 proxy-admin 密钥，然后运行：

```bash
export LITELLM_SETUP_KEY='<your-personal-proxy-admin-key>'
python doctor.py
unset LITELLM_SETUP_KEY
```

预检会核查网关身份、模型可见性、MCP 工具发现和 Slack 配置；不会调用模型、不改动网关状态，也不发送 Slack 消息。这份配置凭据不要留在部署的服务上，检查完成后删除保存的副本。

也可以在部署后的 URL 上检查就绪状态：

```bash
curl --fail https://admin.example.com/readyz
```

URL 换成你自己的应用地址。就绪检查通过说明数据库和 Slack socket 已就绪；下文的 Slack 读请求用于验证 agent 对话。

### 在 Slack 中连接账号 {#6-connect-your-account-in-slack}

1. 在 Slack 的 **Apps** 下打开 **LiteAdmin**（或你设置的名字），在私信中发送 `connect`。
2. 在十分钟内打开私密连接链接。
3. 在浏览器页面上输入你的个人 proxy-admin 密钥；部署若使用 SSO，则完成 SSO 登录。
4. 回到 Slack 提问：**"列出我的团队及其当前预算"**

读请求成功后，再试一项你确实要做的变更，比如"为 Engineering 创建一个每月预算 100 美元的密钥"。默认配置允许已连接管理员执行写入；若要把应用限制为只读查询，参见[只读模式](#可选限制工具)。

个人密钥连接 24 小时后过期；SSO 连接则跟随网关 token 的有效期，网关侧过期或撤销都可能让访问提前终止。重新发送 `connect` 即可再次登录；发送 `disconnect` 可删除已保存的连接，若还要让凭据本身失效，请到 LiteLLM 中撤销。

### 可选：限制工具

在 `.env` 或 Render 的环境变量中设置以下变量，然后重新部署：

| 变量 | 效果 |
| --- | --- |
| `ADMIN_READ_ONLY=true` | 将 agent 限制为只做查询；用户仍需 `proxy_admin`。 |
| `ADMIN_TOOL_NAMES=list_keys,list_teams` | 只开放这些标准的连接器工具。 |

`ADMIN_TOOL_NAMES` 留空时，开放网关上所有可用的受审工具，仍受只读模式约束。如果指定的工具不可用，应用会终止该请求。要创建模型，还需满足[网关前置条件](./liteadmin_mcp.md#添加模型部署)。

### 可选：SSO 登录

你的网关必须已配置 SSO 提供商，并支持托管的 **proxy API** 授权码流程：`/register`、带 S256 PKCE 的 `/authorize` 和 `/token`。是否支持取决于所装的网关版本。启用该模式前，请查阅 [agent 的兼容性要求](https://github.com/BerriAI/litellm-admin-agent/blob/main/docs/compatibility.md#optional-browser-sso)。

在**网关**侧，目前没有设置允许应用的托管回调。LiteLLM 当前对 proxy API 授权只接受回环（loopback）`redirect_uri`，因此 `/authorize` 会拒绝 `https://admin.example.com/oauth/callback`，返回 `400 invalid_request` 和 `a proxy-API grant may only redirect to a loopback address`。`MCP_TRUSTED_REDIRECT_ORIGINS` 只覆盖 MCP OAuth，对此无影响。在你使用的网关版本接受托管 proxy API 回调之前，请使用 `api_key` 模式。应用使用网关自己的 SSO 提供商，不需要单独的 Google 或 Okta client secret。

在 **agent** 侧，设置 `CONNECTION_AUTH_MODE=sso` 并重新部署。完整验证一遍流程：发送 `connect`、登录、回到浏览器页面，然后在 Slack 里发起一个读请求。如果你的网关不支持该流程，就改用 `api_key` 模式；应用不会自行切换模式。

### 可选：使用托管 Admin MCP

留空 `ADMIN_MCP_URL` 即使用内置连接器。要改用[托管连接器](./liteadmin_mcp.md#托管共享-mcp-端点)，设置：

```dotenv
ADMIN_MCP_URL=https://admin-mcp.example.com/mcp
```

请使用你自己运营且信任的连接器，并配置为指向同一个网关。agent 会把每个发起请求用户的网关 bearer 凭据发给它；托管连接器自身的工具限制同样生效。

</TabItem>
</Tabs>

## 故障排查

| 现象 | 检查项 |
| --- | --- |
| Slack 中没有响应 | 确认应用安装在预期的工作区，Socket Mode 已启用，Messages 标签页可写，`message.im` 事件已订阅；再检查 worker 就绪状态和对 Slack 的出站连接 |
| worker 启动失败 | 检查 Slack 凭据、服务 token、加密密钥、模型、网关 URL，以及可写的持久化存储 |
| 就绪检查返回 503 | 检查应用 token 的 `connections:write` 权限范围、出站 WebSocket 访问，以及状态数据库 |
| 企业版连接页面返回 404 | 确认网关镜像包含此集成，且已配置 `LITELLM_ADMIN_AGENT_URL` |
| 企业版连接页面返回 403 | 检查企业版权益、当前 `proxy_admin` 角色、网关与 Slack 邮箱是否一致，以及 HTTPS 来源 |
| 企业版连接页面返回 410 | 链接已过期、已使用或已失效；发送 `connect` 获取新链接 |
| 企业版连接页面返回 503 | 检查 worker 私有地址、网关到 worker 的访问、服务 token 是否一致，以及网关数据库 |
| 独立部署连接被拒绝 | 检查当前 `proxy_admin` 角色、个人密钥归属、模型访问权限，以及与 Slack 一致的邮箱 |
| 独立部署连接页面拒绝会话 | 在同一个浏览器中使用新链接；检查 HTTPS 和 `AGENT_PUBLIC_URL`，后者不能带子路径 |
| 独立部署 SSO 回调失败 | 出现 `400` 且提示 proxy API 授权只能重定向到回环地址，说明网关版本不接受托管回调；改用 `api_key` 模式 |
| 连接成功但请求失败 | 确认该管理员能使用所配置的模型、worker 能通过 HTTPS 访问网关；独立部署还要运行 `doctor.py` 并检查 `ADMIN_TOOL_NAMES` |
| 变更被拒绝 | 检查 `liteadmin.readOnly` 或 `ADMIN_READ_ONLY`，以及托管连接器的限制；企业版示例默认以只读模式启动 |
| 变更超时 | 重试前先查看网关上的资源状态；超时不会撤销已完成的操作 |

备份与升级请参阅 [agent 运维指南](https://github.com/BerriAI/litellm-admin-agent/blob/main/docs/operations.md)。对独立部署的 Slack 用法而言，[网关 Agents / A2A（Agent-to-Agent）注册](https://github.com/BerriAI/litellm-admin-agent/blob/main/docs/compatibility.md#optional-gateway-agents--a2a)是可选的
