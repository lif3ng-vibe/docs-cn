---
title: 设置 Moyai
sidebar_label: 设置
description: 在 Modal 上部署 Moyai，连接你的 LiteLLM 网关，验证首个云任务，并连接 GitHub 仓库。
---

import Image from '@theme/IdealImage';
import {GuideNav} from '@site/src/components/Moyai';

<GuideNav active="setup" />

在 Modal 上部署 Web 应用与智能体沙箱，并在连接你的仓库之前先验证一个任务。本指南使用 Claude Agent SDK harness 搭配 `openai/gpt-6-astra` 网关别名，也就是 Moyai [入门指南](https://github.com/BerriAI/moyai/blob/main/docs/getting-started.md)中推荐的组合。你的网关必须能通过 Messages API 支持该模型。

安装命令在你的电脑上执行。部署完成后，通过浏览器或 Slack 使用 Moyai 即可，你的电脑可以离线。Modal 按托管、沙箱与存储计费；模型提供商按经由 LiteLLM 的推理用量计费。

## 开始之前

- 安装 Git、[uv](https://docs.astral.sh/uv/getting-started/installation/) 和 Python 3.12 或更新版本。Windows 上请使用 WSL。 {/* keep-python-version */}
- 选择一个已开通计费且你有部署权限的 [Modal 工作区](https://modal.com/docs/guide)。尽量用全新的工作区：脚本会以固定名称更新资源。
- 准备一个 Modal 可访问、受 HTTPS 保护的 [LiteLLM 网关](/docs/proxy/quick_start)，外加一个带预算的专用虚拟密钥（virtual key）。密钥可以由网关管理员创建；Moyai 本身不需要主密钥（master key）。

:::note 工作区范围
Moyai 是供可信团队共享的工作区，请保持身份验证开启。已连接的应用会沿用其授权身份的权限；先从小仓库和最小必要权限开始。
:::

## 1. 安装 Moyai

```bash keep-python-version
uv python install 3.12
git clone https://github.com/BerriAI/moyai.git
cd moyai
uv sync --frozen --python 3.12
cp .env.example .env
chmod 600 .env
```

其余命令都在该目录下执行。如果已有 `.env`，请直接编辑而不是覆盖。密钥只放在该文件或宿主机的密钥存储里，绝不要写进任务提示词。

**检查**：`uv sync` 执行完毕且 `.env` 已生成。找不到 `uv` 命令时，装好后需要重开终端。

## 2. 连接 Modal

```bash
uv run modal token new
```

在浏览器中完成将要承载 Moyai 的工作区的登录。用私人编辑器打开 `~/.modal.toml`，把该 profile 的 `token_id` 和 `token_secret` 复制到 `.env` 中对应的字段：

```dotenv
MODAL_TOKEN_ID=<token ID for your workspace>
MODAL_TOKEN_SECRET=<secret from the same profile>
```

**检查**：两个字段都取自同一个 profile。只完成 CLI 登录不会写入 Moyai 的 `.env`。留意令牌有效期，并遵循你团队的服务身份规范。

## 3. 配置 LiteLLM {#configure-litellm}

### 添加模型并创建密钥

如果已有网关，向其管理员索取准确的模型别名，以及一个设了预算、可通过 **Messages** 访问该模型的密钥。管理员已经配好时，跳过下面的配置。

如果是新建网关，把模型加入其配置，并把提供商密钥存在网关上：

```yaml title="LiteLLM config.yaml"
model_list:
  - model_name: openai/gpt-6-astra
    litellm_params:
      model: openai/gpt-6-astra
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  include_cost_in_streaming_usage: true
```

在 LiteLLM 管理界面（Admin UI）中打开 **Virtual Keys**，创建名为 `moyai` 的密钥，授予 `openai/gpt-6-astra` 的访问权限，并设置预算。API 与界面操作见[虚拟密钥](/docs/proxy/virtual_keys)。预算额度以你在试用期内愿意花费的金额为准。准入检查可能放行在途请求，使花费略超阈值。

### 设置 Moyai 的端点

编辑 `.env`：

```dotenv
LITELLM_API_BASE=https://your-gateway.example.com/v1
LITELLM_API_KEY=<Moyai virtual key>
AGENT_MODEL=openai/gpt-6-astra
AGENT_HARNESS=claude-agent-sdk
SESSION_TITLES_ENABLED=false
```

基础 URL 末尾保留 `/v1`，不要带 `/messages`。地址必须云端可达；Modal 容器内的 `localhost` 指的是容器自身。关闭会话标题生成，可避免首次运行时多依赖一个模型。

显式设置 harness 可保证本演练始终走 Messages。之后若想改为自动选择，删除 `AGENT_HARNESS` 即可：解析为 `openai/` 的模型选用 Codex，`anthropic/` 模型选用 Claude Agent SDK，其他别名回退到 Claude。换用其他受支持的 harness 时，请在**新**会话中选择。

| Harness | 网关端点 | 选择前需确认 |
|---|---|---|
| Claude Agent SDK | `/v1/messages` | 所选别名支持 Messages API 和工具调用 |
| Codex | `/v1/responses` | 所选别名支持 Responses API 和工具调用 |
| Hermes、OpenCode、Deep Agents、Tool Loop | `/v1/chat/completions` | 所选别名支持 Chat Completions 和工具调用 |

模型选择器里出现的名字并不代表你的密钥有权访问它。把 `AGENT_MODEL` 设为网关实际提供的别名。参见 [harness 兼容性](https://github.com/BerriAI/moyai/blob/main/docs/harnesses.md)。

### 检查模型连接 {#check-the-model-connection}

把虚拟密钥放进 shell 变量 `LITELLM_API_KEY`，测试与演练相同的协议。这会发起一个少量计费的模型请求：

```bash
curl --fail-with-body -i 'https://your-gateway.example.com/v1/messages' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -H 'anthropic-version: 2023-06-01' \
  -d '{
    "model": "openai/gpt-6-astra",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": "Reply with: connection works"}]
  }'
```

**检查**：返回 HTTP 200 和模型响应。网关提供成本头时查看一下。这里验证的是你本地的连接；首个云任务还会验证从 Modal 出发的可达性。部署前先解决访问或协议错误。

## 4. 部署并登录

首次部署到 Modal 时，`PUBLIC_URL` 保留示例值，`WORKSPACE_PASSWORD`、`SESSION_SECRET` 和 `ENCRYPTION_KEY` 留空。脚本会生成缺失的密钥并写入 `.env`。保持 `PASSWORD_LOGIN_ENABLED=true`。首次运行时 Slack、Google OAuth 和 Temporal 先保持关闭。

在不打印密钥的前提下检查必填字段：

```bash
uv run python -c 'from app.config import Settings; s=Settings(); missing=s.missing_cloud(); print("Missing: " + ", ".join(missing) if missing else "Required fields present; credentials not tested."); raise SystemExit(bool(missing))'
```

补齐缺失字段后再部署：

```bash
uv run python deploy_modal.py
```

这一步会启动计费计算，并更新 Modal 环境中的 `moyai` 应用、`hermes-workspace-config` secret 和 `hermes-workspace-state` 卷。对现有安装执行前，先协调好停机时间。

**检查**：打开输出的 `Workspace URL`，在私人编辑器中读取 `WORKSPACE_PASSWORD` 并登录。首次构建镜像可能需要几分钟。请安全备份 `.env`，尤其是 `ENCRYPTION_KEY`，解密已保存的连接时需要它。

Web 容器保持单实例。这种部署方式下，重新部署会中断正在运行的任务。修改 `.env` 后，等任务结束再重新执行部署命令；文件中的值（包括留空）会覆盖 shell 变量。

## 5. 验证任务与追问

1. 打开 **Settings > Runtime**，确认出现 **Cloud ready**。这一步只检查必填字段，不验证凭据有效性。
2. 新建一个会话。在 **Context** 中选择 **Execution > Cloud session**，**GitHub repository** 留空。
3. 选择 **Claude Agent SDK** 和 **GPT-6 Astra**，或你配置的确切别名。
4. 发送以下任务：

   > 用终端创建 `/workspace/setup-check.txt`，内容为 `moyai setup works`。用工具读回该文件并报告内容。不要连接应用，也不要发布任何东西。

5. 等待任务完成。展开 **Activity** 查看实际的工具调用，再在 **Files** 中打开 `setup-check.txt`。
6. 在同一个会话里发送追问：

   > 用工具读取 `/workspace/setup-check.txt` 并报告其内容。

**检查**：两次对话都从文件读到 `moyai setup works`。模拟/演示（simulated/demo）响应不能证明云上执行成功。连接应用之前先解决所有失败。

## 6. 连接 GitHub 并提交一个小 PR

连接必须由组织所有者，或有权限注册并安装该组织 GitHub App 的人完成。不支持个人账号安装。

1. 以 Moyai 管理员身份打开 **Connections > GitHub > Connect**。注册一个归组织所有的 App，或在连接表单里填入现有 App 的 ID 和 PEM 密钥。
2. 查看 [GitHub 权限](https://github.com/BerriAI/moyai/blob/main/docs/integrations.md#shared-organization-github)。Checkout 和 PR 操作用到 Contents 与 Pull requests 的读写权限。新建 App 的清单还会为 ruleset 审阅者变更申请 Administration 写权限；现有的合适 App 处理日常 PR 时可以不带该权限。
3. 完成安装后，打开 **Manage > Choose repositories**，选择要暴露的仓库。Moyai 保存的是仓库 ID，更改选择无需重新部署。
4. 新建一个 **Cloud session**，在 **Context** 中选择仓库，并在 **Organization connections** 下启用 GitHub。
5. 改代码之前，先让智能体找出并运行规模最小的相关测试套件。检查命令与结果，然后要求它做一个带回归测试的小改动并提交 PR。

**检查**：打开 PR、查看 diff、确认所报告的检查项，然后由你亲自审查并合并。已启用的连接应用写入会按连接策略执行，不会逐次弹出批准提示；必要时暂停连接或改用只读访问。

## 7. 检查花费 {#track-spend}

以 Moyai 管理员身份打开 **Settings > Administration > Spend & usage**，按用户、会话和模型查看成本。成员可在 **Settings > Workspace > Spend** 下查看自己的成本。在 LiteLLM 管理界面（Admin UI）中打开 **Logs > Filters**，把 **Key Alias** 设为 `moyai`。

<Image
  img={require('../../../img/moyai_gateway_logs.png')}
  dark={require('../../../img/moyai_gateway_logs_dark.png')}
  alt="按 moyai 虚拟密钥筛选的 LiteLLM 请求日志"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

Moyai 会把请求 ID 附在 `x-litellm-call-id` 和 `spend_logs_metadata.moyai_request_id` 中。用这个 ID 在两套系统之间核对同一请求。流式成本方面，在网关上保留 `include_cost_in_streaming_usage: true`，并确认你部署的版本原生支持该端点。[成本核算](./architecture.md#cost-accounting)解释了缺失账单记录和恢复权限的相关问题。试算总成本时，把 Modal 的托管、沙箱与存储费用也算进去。

## 故障排查

| 现象 | 处理办法 |
|---|---|
| Modal 凭据缺失 | 把两个令牌字段都填进 `.env`；CLI 登录是另一回事。检查工作区与有效期。 |
| 网关返回 401 或 403 | 检查虚拟密钥、确切的模型别名，以及所选 API 的权限。 |
| 网关返回 404 或协议错误 | 确认基础地址以 `/v1` 结尾且可访问，并确认 harness 所需的 API。 |
| 超出预算或被限流 | 在 LiteLLM 中查看花费与限额。停掉不需要的任务；确实打算多花时再调高预算。 |
| 界面正常但任务失败 | 检查沙箱构建与网关报错。**Cloud ready** 只确认配置存在，不代表服务可用。 |
| 任务显示 simulated/demo | 新建会话并选择 **Cloud session**。已有的演示会话保持原模式。 |
| 会话里没有 GitHub | 确认 App 安装与仓库选择，然后新建会话并在 **Context** 中启用 GitHub。 |
| 配置改动不生效 | 空闲时重新部署。检查 `.env` 中是否有留空条目覆盖了 shell 变量。 |

提交 bug 报告时，附上失败的步骤和脱敏后的报错。不要包含凭据和 `.env`。

## 停止或扩展部署

关闭浏览器不会停止服务。请停止正在运行的任务，不再需要时在 Modal 中停掉 `moyai` Web 应用，并检查遗留的沙箱。保留的快照和卷可能产生存储费用。

首个任务跑通后，可以接入 [Slack](https://github.com/BerriAI/moyai/blob/main/docs/slack.md)、[其他连接](https://github.com/BerriAI/moyai/blob/main/docs/integrations.md)或 [Google SSO](https://github.com/BerriAI/moyai/blob/main/docs/deployment.md)。启用 SSO 前，先替换 BerriAI 专属的示例域名。若要使用 Render、Docker、其他沙箱提供商或 Temporal，请阅读[部署选项](https://github.com/BerriAI/moyai/blob/main/docs/deployment.md)和[架构指南](./architecture.md)。
