---
title: "Aperture CLI"
description: "使用 Aperture CLI 发现、配置并运行通过你的 Aperture 网关连接的编码智能体。"
---

最后验证于 Sep 29, 2026

> **注意：** Aperture CLI 目前处于 alpha 阶段。

Aperture CLI 用于配置和运行编码智能体，使其通过你的 [Aperture 网关][docs-aperture]连接。它会自动处理环境变量、配置文件和[提供商类型][ar-provider-type]的选择，无需你手动编辑配置即可开始编码会话。

## 使用场景

Aperture CLI 适用于以下场景：

* **快速设置智能体**：几秒内以正确的 Aperture 配置启动编码智能体，无需手动编辑环境变量或配置文件。
* **多智能体管理**：在单一界面中切换[受支持的智能体][ar-supported-agents]和提供商类型。
* **桥接访问**：在未安装 Tailscale 守护进程的设备上连接 Aperture。
* **团队上手**：为团队成员提供一致的方式，把他们的编码工具连接到共享的 Aperture 网关。

## 前提条件

使用 Aperture CLI 之前，请确认已具备以下条件：

* 一个至少配置了一个[提供商][docs-set-up-providers]的 Aperture 网关。

- 能够访问 Aperture 网关 URL 的网络。网关详情可在 [aperture.tailscale.com][xt-aperture-setup] 查找。

* 设备上至少安装了一个[受支持的编码智能体][ar-supported-agents]。如果没有，Aperture CLI 会为每个智能体提供安装命令。
* 计划安装 `aperture-cli` 的设备上已安装 [Go][xt-go-install] v1.26.6 或更高版本。

## 安装 Aperture CLI

可以使用 `go install` 安装 Aperture CLI，或从 [GitHub 上的 Aperture 仓库][xt-gh-aperture-cli]构建。以下说明介绍 `go install` 方式。

1. 使用 `go install` 安装 Aperture CLI：

   ```shell
   go install github.com/tailscale/aperture-cli/cmd/aperture@latest
   ```

2. 运行 Aperture CLI 验证安装：

   ```shell
   aperture
   ```

   Aperture CLI 会尝试连接，成功后显示主菜单，失败则显示设置向导。如果收到 command-not-found 错误，请确认你的 Go bin 目录已加入 `$PATH`。

## 连接到 Aperture

Aperture CLI 在启动时连接你的 Aperture 网关并校验提供商配置。

1. 运行 Aperture CLI：

   ```shell
   aperture
   ```

   Aperture CLI 会自动连接已保存的端点。如果没有已保存的端点，则默认使用 `http://ai`。要使用其他 URL，可运行 `aperture -endpoint <url>`，或在 **Settings** > **Aperture Endpoints** 下添加或选择端点。

2. 等待连接检查完成。

   Aperture CLI 会向 Aperture 网关查询已配置的提供商列表及其 [API 兼容性][docs-provider-compatibility]。如果主机无法访问，设置向导会提供编辑端点 URL 或重试的选项。

3. 连接成功后，Aperture CLI 显示包含可用编码智能体的主菜单。

   Aperture CLI 会把已连接的主机保存到设置中，下次启动时自动使用。

### 连接失败时

当 Aperture CLI 无法访问你的 Aperture 端点时，会显示设置向导而不是主菜单。对于直连端点，设置向导会检查系统 Tailscale 状态：

| 状态 | 处理办法 |
| --- | --- |
| 未安装 Tailscale | 从 [tailscale.com/download][co-download] 安装 Tailscale。 |
| Tailscale 未运行 | 在你的机器上启动 Tailscale 应用或服务。 |
| Tailscale 未连接 | 使用 `tailscale up` 登录。 |
| Tailscale 已连接但无法访问 Aperture | 在 [aperture.tailscale.com][xt-aperture-setup] 上设置 Aperture，或输入其他 Aperture URL。 |

在设置向导中可以：

* **Edit endpoint URL**：让 Aperture CLI 指向另一个 Aperture 网关。
* **Retry connection**：再次尝试当前端点。
* **Connection options**：管理你的端点列表。

### 管理多个端点

你可以配置多个 Aperture 网关 URL 并在其中切换。

1. 在主菜单按 `s` 打开设置。

2. 选择 **Aperture Endpoints**。

3. 添加或移除端点。要切换端点，选择一个端点后选择 **Connect**。连接成功后，Aperture CLI 会在下次启动时使用它。

要删除端点，高亮后按 `d`。删除当前使用的端点前请先连接另一个端点。移除最后一个使用某桥接的端点时，该桥接也会一并移除；如果其设备需要退出 tailnet，会提示确认。

## 启动编码智能体

Aperture CLI 连接到 Aperture 后，选择一个编码智能体和提供商类型即可开始编码会话。

### 选择智能体

主菜单列出在你的设备上检测到的编码智能体。使用方向键和 `Enter` 选择智能体，或按其对应的数字键。

`[0] Quick select` 快捷方式会在其保存的选择仍然有效且端点仍然活跃时重复你上一次的启动。按 `0`，或高亮该快捷项后按 `Enter`，即可重新启动。

如果列表中缺少你预期的智能体，说明 Aperture CLI 没有找到其二进制文件。解决步骤参阅[故障排查部分][ar-agent-binary-not-found]。

### 选择提供商类型

选择智能体后，再选择提供商类型。它决定智能体通过 Aperture 网关访问模型时使用哪种 API 协议。CLI 只会显示[兼容的提供商类型][docs-provider-compatibility]。

### 自动选择

当提供商、后端或模型菜单只有一个选项时，Aperture CLI 会自动选中并进入下一步。此行为不适用于根菜单——根菜单会列出所有已安装的智能体，无论每个智能体支持多少种提供商类型。

### 启动时会发生什么

选择智能体和提供商类型后，Aperture CLI 会：

1. 设置所选提供商类型下智能体所需的环境变量。部分环境变量的值包含附加在 Aperture 主机 URL 后的路径后缀（例如 `/v1` 或 `/bedrock`）。
2. 配置智能体使用 Aperture。
3. 如果你已启用 YOLO 模式（全自动模式），会附加跳过权限确认的标志。
4. 把你本次的选择保存为上次使用的组合。
5. 把整个终端交给编码智能体。

智能体退出后，Aperture CLI 会重新检查 Aperture 连接并返回主菜单。

## 受支持的智能体

Aperture CLI 只列出同时匹配智能体和你的 Aperture 配置的提供商类型。提供商和客户端的 API 要求参阅[受支持的提供商与客户端][docs-provider-compatibility]。

Aperture CLI 把 Gemini Enterprise Agent Platform 提供商类型称为 **Google Vertex**。其菜单和环境变量沿用这个旧名称。

### Claude Code

[Claude Code][xt-claude-code] 是 Anthropic 面向 Claude 模型的终端编码智能体。设置说明参阅[将 Claude Code 与 Aperture 搭配使用][docs-use-claude-code]。

* **二进制文件**：`claude`
* **提供商类型**：[Anthropic API][docs-use-anthropic]、[AWS Bedrock][docs-use-amazon-bedrock]、[Google Vertex][docs-use-geap]
* **安装**：`curl -fsSL https://claude.ai/install.sh | bash`
* **全自动标志**：`--dangerously-skip-permissions`

Aperture CLI 会根据所选提供商类型设置以下环境变量：

| 提供商类型 | 环境变量 |
| --- | --- |
| Anthropic API | `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL`（选择模型时） |
| AWS Bedrock | `ANTHROPIC_BEDROCK_BASE_URL`、`CLAUDE_CODE_USE_BEDROCK`、`CLAUDE_CODE_SKIP_BEDROCK_AUTH` |
| Google Vertex | `CLOUD_ML_REGION`、`CLAUDE_CODE_USE_VERTEX`、`CLAUDE_CODE_SKIP_VERTEX_AUTH`、`ANTHROPIC_VERTEX_PROJECT_ID`、`ANTHROPIC_VERTEX_BASE_URL`、`ANTHROPIC_MODEL`（选择模型时） |

对于 Anthropic API 后端，Aperture CLI 会把 `ANTHROPIC_AUTH_TOKEN` 设为 `"-"`（占位短横线）。认证由 Aperture 处理，因此 Claude Code 不需要真实的 API 密钥。

对于 Google Vertex 后端，Aperture CLI 会把 `CLOUD_ML_REGION` 和 `ANTHROPIC_VERTEX_PROJECT_ID` 设为占位值（`_aperture_auto_vertex_region_` 和 `_aperture_auto_vertex_project_id_`）。Aperture 网关会在请求时把这些值解析为实际的区域和项目 ID。

选择具体模型时，Aperture CLI 会去掉提供商前缀后设置 `ANTHROPIC_MODEL`（例如 `anthropic/claude-sonnet-5-5` 变为 `claude-sonnet-5-5`）。这适用于 Anthropic API 和 Google Vertex 后端。

仅对 AWS Bedrock 后端，Aperture CLI 还会根据提供商的模型列表，通过匹配名称中包含“opus”“sonnet”或“haiku”的模型，设置模型层级变量（`ANTHROPIC_DEFAULT_OPUS_MODEL`、`ANTHROPIC_DEFAULT_SONNET_MODEL`、`ANTHROPIC_DEFAULT_HAIKU_MODEL`）。对 Anthropic API 和 Google Vertex 后端，Aperture CLI 不会设置这些变量。

### Gemini CLI

[Gemini CLI][xt-gemini-cli] 是 Google 面向 Gemini 模型的终端编码智能体。它使用原生 Google API，而不是 OpenAI Chat Completions。

* **二进制文件**：`gemini`
* **提供商类型**：[Google Vertex][docs-use-geap]、[Gemini API][docs-use-google-gemini]
* **安装**：`npm install -g @google/gemini-cli`
* **全自动标志**：`--yolo`

Gemini CLI 0.40 及更高版本要求自定义网关 URL 使用 HTTPS 和完全限定域名。请使用 Aperture 网关的完整 tailnet 名称，例如 `https://<aperture-hostname>.<tailnet-name>.ts.net`，而不要用 `http://ai` 或 `https://ai` 这样的短名称。启动前在 **Settings** > **Aperture Endpoints** 中设置该 URL。Aperture CLI 会在启动 Gemini CLI 之前检查这些要求。

Aperture CLI 会根据所选提供商类型设置以下环境变量：

| 提供商类型 | 环境变量 |
| --- | --- |
| Google Vertex | `GOOGLE_VERTEX_BASE_URL`、`GOOGLE_API_KEY` |
| Gemini API | `GEMINI_API_KEY`、`GEMINI_BASE_URL`、`GOOGLE_GEMINI_BASE_URL` |

对于 Gemini API 提供商类型，为兼容各版本的 Gemini CLI，Aperture CLI 会同时设置 `GEMINI_BASE_URL` 和 `GOOGLE_GEMINI_BASE_URL`。Gemini CLI 0.40 及更高版本读取 `GOOGLE_GEMINI_BASE_URL`，更早版本使用 `GEMINI_BASE_URL`。

对所选后端，Aperture CLI 会把 `GOOGLE_API_KEY` 或 `GEMINI_API_KEY` 设为 `"not-needed"`。这些值只是占位符，并非上游提供商的凭证，上游认证由 Aperture 处理。

Aperture CLI 还会设置 `GEMINI_CLI_HOME`，指向其托管配置目录。

Aperture CLI 会在 `<config-dir>/aperture/gemini-home/.gemini/settings.json` 写入一个持久化设置文件，记录所选提供商类型的认证类型。该文件在会话之间保留。`<config-dir>` 在各操作系统下的取值参阅[持久化状态][ar-persistent-state]。

### GitHub Copilot

[GitHub Copilot CLI][xt-github-copilot] 是 GitHub 的终端编码智能体。

* **二进制文件**：`copilot`
* **提供商类型**：[OpenAI Compatible][docs-use-openai-compatible-provider]、[Anthropic API][docs-use-anthropic]
* **安装**：`npm install -g @github/copilot`

Aperture CLI 会根据所选后端设置以下环境变量：

| 后端 | 环境变量 |
| --- | --- |
| OpenAI Chat Completions | `COPILOT_PROVIDER_TYPE=openai`、`COPILOT_PROVIDER_API_KEY`、`COPILOT_OFFLINE`、`COPILOT_PROVIDER_BASE_URL`（带 `/v1` 后缀）、`COPILOT_PROVIDER_WIRE_API=completions`、`COPILOT_MODEL`（选择模型时） |
| OpenAI Responses | `COPILOT_PROVIDER_TYPE=openai`、`COPILOT_PROVIDER_API_KEY`、`COPILOT_OFFLINE`、`COPILOT_PROVIDER_BASE_URL`（带 `/v1` 后缀）、`COPILOT_PROVIDER_WIRE_API=responses`、`COPILOT_MODEL`（选择模型时） |
| Anthropic Messages | `COPILOT_PROVIDER_TYPE=anthropic`、`COPILOT_PROVIDER_API_KEY`、`COPILOT_OFFLINE`、`COPILOT_PROVIDER_BASE_URL`（不带 `/v1` 后缀）、`COPILOT_MODEL`（选择模型时） |

GitHub Copilot 支持两种提供商类型（OpenAI Compatible 和 Anthropic API），共有三种后端变体。OpenAI Compatible 提供商类型提供两种 wire API 模式：Chat Completions 和 Responses。当提供商支持这些后端时，Aperture CLI 会把三种后端都列为选项。

Aperture CLI 不会向 GitHub Copilot 传递全自动模式标志。

### OpenCode

[OpenCode][xt-opencode] 是一个支持多家 AI 提供商的终端编码智能体。设置说明参阅[将 OpenCode 与 Aperture 搭配使用][docs-use-opencode]。

* **二进制文件**：`opencode`
* **安装**：`curl -fsSL https://opencode.ai/install | bash`

Aperture CLI 会配置 OpenCode 在会话期间把请求路由到 Aperture。

Aperture CLI 会根据提供商的兼容性映射自动选择六个 AI SDK 后端之一：

| 提供商 API | AI SDK 包 |
| --- | --- |
| OpenAI Responses | `@ai-sdk/openai` |
| Anthropic Messages | `@ai-sdk/anthropic` |
| OpenAI Chat | `@ai-sdk/openai-compatible` |
| Google Vertex（Gemini） | `@ai-sdk/google-vertex` |
| Amazon Bedrock Converse | `@ai-sdk/amazon-bedrock` |
| Google Gemini | `@ai-sdk/google` |

对于 Amazon Bedrock 提供商，由于认证由 Aperture 在上游处理，Aperture CLI 还会设置占位环境变量（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_REGION`）。

CLI 对 OpenCode 有两个限制：

* **Bedrock**：即使提供商只声明支持 InvokeModel，后端也会使用 Converse SDK。请启用 `bedrock_converse` 并选择支持 Converse 的模型。
* **Google Vertex**：后端使用 Google 发布方路径。请选择 Gemini 模型，而不是 Google 托管的 Anthropic。

[网关生成的配置][docs-gateway-setup]还包含面向 Claude InvokeModel 和 Google 托管 Anthropic 的模型感知后端。

Aperture CLI 不会向 OpenCode 传递全自动模式标志。请在 OpenCode 内部选择模型。

### OpenAI Codex

[OpenAI Codex][xt-openai-codex] 是 OpenAI 的终端编码智能体。设置说明参阅[将 Codex 与 Aperture 搭配使用][docs-use-codex]。

* **二进制文件**：`codex`
* **提供商类型**：[OpenAI Responses][docs-use-openai]
* **安装**：`curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh`（macOS 和 Linux），或 `npm install -g @openai/codex`（Windows）
* **全自动标志**：`--dangerously-bypass-approvals-and-sandbox`

Aperture CLI 在每次启动时配置 Codex，不会替换 `CODEX_HOME`，也不会重写你已有的 Codex 配置：

* 传入 `--config` 覆盖项，选择 `tailscale_aperture_cli` 提供商，并把其 `base_url` 设为附加了 `/v1` 的 Aperture 主机。
* 在 Codex 进程环境中把 `APERTURE_CODEX_API_KEY` 设为 `"not-needed"`，并配置提供商读取该变量。
* 通过 `--model` 传入你选择的模型。
* 当它准备临时模型清单时，会通过 `--config model_catalog_json=...` 传入其路径，并在 Codex 退出后将其删除。

### Claude Cowork

Aperture CLI 将 [Claude Desktop][docs-use-claude-desktop] 显示为 **Claude Cowork**。此设置只配置桌面应用的 Anthropic Messages 推理连接，不涉及桌面的所有功能。与上面的 CLI 智能体不同，它在 `$PATH` 中没有对应的二进制文件，没有环境变量，也没有全自动模式标志。

* **平台可用性**：macOS、Windows（Linux 不可用）
* **安装**：Aperture CLI 会在浏览器中打开 Claude 下载页面。安装应用后返回 Aperture CLI。
* **配置**：Aperture CLI 会配置 Claude Desktop 使用 Aperture 网关。
  * 在 macOS 上，使用 `defaults write` 设置 `com.anthropic.claude` 域。
  * 在 Windows 上，写入 `HKCU\SOFTWARE\Policies\Claude` 注册表键。
  * Aperture CLI 写入三个设置：`inferenceProvider=gateway`、`inferenceGatewayApiKey=-` 和 `inferenceGatewayBaseUrl={url}`。
* **HTTPS 要求**：Claude Desktop 要求网关 URL 使用 HTTPS。Aperture CLI 会自动把 HTTP URL 转换为 HTTPS。该 URL 必须出示你的操作系统信任的证书。
* **无提供商选择**：此连接使用 Aperture 网关的 Anthropic Messages 端点，而非原生 Bedrock InvokeModel 或 Converse。Aperture CLI 不提供后端或模型选择。请在 Claude Desktop 内选择模型。

### Pi

Aperture CLI 会配置并启动 Pi——一个可扩展的终端编码智能体。

* **二进制文件**：`pi`
* **提供商类型**：OpenAI Responses、Anthropic Messages、OpenAI Chat Completions、Google Vertex（Gemini）
* **安装**：`npm install -g --ignore-scripts @earendil-works/pi-coding-agent`

安装 Pi，运行 `aperture`，在主菜单中选择 **Pi**。按提示选择提供商、后端和模型。Aperture CLI 会生成一个临时提供商扩展并用 `-e` 加载。你现有的 Pi 设置和会话历史保持不变。

Google Vertex 后端使用 Gemini，而不是 Google 托管的 Anthropic。即使混合提供商列出了 Claude 模型，也要选择 Gemini 模型。启动器不提供 Bedrock 后端。Pi 没有工具确认标志，因此 Aperture CLI 的 YOLO 模式无从设置。

### Oh My Pi

Aperture CLI 会配置并启动 Oh My Pi——Pi 编码智能体的一个分支（fork）。

* **二进制文件**：`omp`
* **提供商类型**：OpenAI Responses、Anthropic Messages、OpenAI Chat Completions、Google Vertex（Gemini）
* **安装**：`bun install -g @oh-my-pi/pi-coding-agent`
* **全自动标志**：`--auto-approve`

安装 Oh My Pi，运行 `aperture`，在主菜单中选择 **Oh My Pi**。按提示选择提供商、后端和模型。Aperture CLI 会用 `-e` 加载一个临时提供商扩展。你现有的设置和会话历史保持不变。

与 Pi 一样，Google Vertex 后端需要 Gemini 模型，不支持 Google 托管的 Anthropic。启动器不提供 Bedrock 后端。

### Hermes Agent

Aperture CLI 会配置并启动 Hermes Agent。

* **二进制文件**：`hermes`
* **提供商类型**：OpenAI Chat Completions
* **安装**：`curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`
* **全自动标志**：`--yolo`

安装 Hermes Agent，运行 `aperture`，在主菜单中选择 **Hermes Agent**。按提示选择兼容的提供商和模型。启动器会设置以下参数，不会替换你已有的 Hermes 配置：

| 参数 | 值 |
| --- | --- |
| `--provider` | `custom` |
| `CUSTOM_BASE_URL` | 附加了 `/v1` 的 Aperture 主机 |
| `HERMES_INFERENCE_MODEL` | 所选模型 ID（去掉提供商前缀） |

此启动器使用 Chat Completions，而非 OpenAI Responses 或 Anthropic Messages。要在 Hermes 中使用那些 API，请改用[网关生成的配置][docs-gateway-setup]中的说明。

## 桥接

桥接让你无需在本机运行 Tailscale 守护进程（`tailscaled`）即可访问 Aperture。

### 何时使用桥接

以下情况适合使用桥接：

* 你的机器没有全系统安装 Tailscale。
* 你需要从无法（或不愿）运行 Tailscale 守护进程的环境（例如 CI 运行器或容器）连接 Aperture。如果想要不需要 Aperture CLI 的替代方案，参阅[使用 ts-unplug 连接][docs-connect-outside-tailnet-ts-unplug]。
* 你需要一个独立的 Tailscale 身份来访问 Aperture。

如果 Tailscale 已经在运行并连接，你不需要桥接。直连端点无需任何额外设置即可使用。

### 桥接的工作原理

桥接为 Aperture CLI 提供一个独立的 Tailscale 身份，用于访问 Aperture 端点。编码智能体通过桥接连接，无需系统级 Tailscale 连接。首次连接需要进行 Tailscale 认证。桥接会保存自己的 Tailscale 状态，供后续连接使用。

### 创建桥接

1. 在主菜单按 `s` 打开设置。
2. 选择 **Bridges**。
3. 按 `a` 添加新桥接。
4. 输入桥接名称（例如 `work` 或 `ci-runner`）。

Aperture CLI 会为桥接生成唯一 ID 并保存到设置中。

### 将桥接分配给端点

创建桥接后，将其连接到 Aperture 端点：

1. 前往 **Settings** > **Aperture Endpoints**。
2. 按 `a` 添加新端点。
3. 选择 **Bridge**（而不是 **Direct**）。
4. 选择要使用的桥接。Aperture CLI 开始通过它连接 `http://ai`。
5. 如果你的网关使用其他 URL，在连接界面输入后按 `Enter`。如果默认 URL 已经连接成功，返回 **Aperture Endpoints**，选择该连接并选择 **Change URL**。

成功连接自定义 URL 后，该端点会出现在端点列表中，标签形如 `https://ai.example.com via work`。

### 激活桥接端点

要重新连接已保存的桥接端点，从 Aperture Endpoints 列表中选中它，然后选择 **Connect** 或 **Reconnect**。Aperture CLI 会：

1. 显示连接状态：`Connecting bridge work to https://ai.example.com ...`
2. 实时显示桥接连接日志。
3. 连接后对本地代理运行预检。
4. 成功后显示主菜单。

新桥接的首次激活需要进行 Tailscale 认证。Aperture CLI 会在浏览器中打开登录 URL，并将其显示在连接界面底部。访问该 URL，在你的 [tailnet][docs-tailnet] 中授权该节点。如需自行打开，按 `Ctrl+Y` 复制该 URL。

### 删除桥接

1. 前往 **Settings** > **Bridges**。
2. 用方向键高亮要移除的桥接。
3. 按 `d` 移除。如果该桥接已加入 tailnet，请确认提示后按 `y`，将其设备退出并丢弃保存的登录状态。

端点仍在使用桥接时，无法从此菜单删除该桥接。请改为从 **Aperture Endpoints** 中移除对应的连接。移除经过某桥接的最后一条连接时，该桥接也会一并移除。

### 连接类型

| 端点类型 | 需要 Tailscale 守护进程 | 连接方式 |
| --- | --- | --- |
| Direct（直连） | 是 | 智能体通过系统 Tailscale 连接访问 Aperture URL。 |
| Bridge（桥接） | 否 | 智能体通过桥接访问 Aperture URL。 |

## 配置设置

在主菜单按 `s` 打开设置界面。

### 管理桥接

添加和移除桥接，用于在没有系统 Tailscale 守护进程的情况下连接 Aperture。何时使用的详情参阅[桥接][ar-bridges]。

1. 在设置菜单中选择 **Bridges**。
2. 按 `a` 添加新桥接并输入名称。
3. 要删除未使用的桥接，高亮后按 `d`。如提示退出登录，请确认。

### 管理 Aperture 端点

添加和移除 Aperture 网关 URL。当前端点是 Aperture CLI 启动时连接的主机。

1. 在设置菜单中选择 **Aperture Endpoints**。
2. 按 `a` 添加新端点。选择 **Direct** 直接输入 URL，或选择 **Bridge** 在没有系统 Tailscale 守护进程的情况下连接。
3. 要切换到其他端点，从列表中选中后选择 **Connect**。
4. 要删除端点，高亮后按 `d`。删除当前端点前必须先连接另一个端点。移除经过某桥接的最后一条连接时，该桥接也会一并移除；如需将其设备退出，会提示确认。

### YOLO 模式

YOLO 模式会在启动智能体时附加跳过权限确认的标志。启用后，智能体执行命令或做出更改前不再请求确认。

以下智能体支持 YOLO 模式标志：

| 智能体 | 标志 |
| --- | --- |
| Claude Code | `--dangerously-skip-permissions` |
| Gemini CLI | `--yolo` |
| OpenAI Codex | `--dangerously-bypass-approvals-and-sandbox` |
| Oh My Pi | `--auto-approve` |
| Hermes Agent | `--yolo` |

Aperture CLI 不会为 Pi、OpenCode、GitHub Copilot 或 Claude Cowork 设置 YOLO 模式标志。

切换 YOLO 模式：

1. 在设置菜单中选择 **YOLO mode**。
2. 开启或关闭该设置。

该设置跨会话保留。

> **警告：**
>
> YOLO 模式会授予智能体宽泛的权限，可在不确认的情况下执行命令和修改文件。

### 安装与卸载智能体

安装编码智能体：

1. 在主菜单按 `i`。
2. 选择要安装的智能体。
3. 查看安装命令，按 `y` 在当前终端中运行。
4. 安装完成后，Aperture CLI 会检查智能体二进制文件并刷新菜单。对于 Claude Cowork，需在浏览器打开的下载页面中完成桌面应用安装。

卸载智能体：

1. 打开设置并选择 **Uninstall**。
2. 选择要移除的智能体。
3. 按 `y` 确认。

卸载操作因智能体而异：

| 智能体 | 卸载操作 |
| --- | --- |
| Claude Code | 移除 `~/.local/bin/claude` 和 `~/.local/share/claude`。 |
| Gemini CLI | 运行 `npm uninstall -g @google/gemini-cli`。 |
| GitHub Copilot | 运行 `npm uninstall -g @github/copilot`。 |
| OpenCode | 运行 `opencode uninstall --force` 并移除 `~/.opencode/bin`。 |
| OpenAI Codex | 在 macOS 和 Linux 上移除检测到的独立安装；否则运行 `npm uninstall -g @openai/codex`。 |
| Claude Cowork | 提示你通过操作系统的应用管理器卸载 Claude。 |
| Pi | 运行 `npm uninstall -g @earendil-works/pi-coding-agent`。 |
| Oh My Pi | 运行 `bun uninstall -g @oh-my-pi/pi-coding-agent`。 |
| Hermes Agent | 运行 `hermes uninstall --yes`。 |

## 键盘快捷键

Aperture CLI 提供以下键盘快捷键：

| 按键 | 操作 |
| --- | --- |
| `Up`/`Down` 或 `j`/`k` | 移动光标 |
| `Left`/`Right` 或 `h`/`l` | 在两栏布局中切换列 |
| `Enter` 或数字键 | 选择条目 |
| `s` | 打开设置（主菜单中） |
| `i` | 安装智能体（主菜单中） |
| `a` | 添加端点或桥接（对应菜单中） |
| `d` | 删除端点或桥接（对应菜单中） |
| `y`/`n` | 确认或取消（确认提示中） |
| `Esc` | 返回 |
| `q` | 主菜单中退出，子菜单中返回 |
| `Ctrl+C` | 从任意界面退出 |
| `Ctrl+Y` | 桥接登录 URL 显示期间复制该 URL |

## 持久化状态

Aperture CLI 把设置和状态存储在操作系统默认配置目录下的 `aperture/` 子目录中：

* **macOS**：`~/Library/Application Support/aperture/`
* **Linux**：若设置了 `$XDG_CONFIG_HOME` 则为 `$XDG_CONFIG_HOME/aperture/`，否则为 `~/.config/aperture/`
* **Windows**：`%APPDATA%\aperture\`

| 文件或目录 | 用途 |
| --- | --- |
| `settings.json` | Aperture 端点 URL、桥接和 YOLO 模式偏好 |
| `launcher.json` | 上次使用的智能体、提供商类型、提供商 ID 和模型选择 |
| `bridges/<suffix>/` | 每个桥接的 Tailscale 状态（桥接 ID 去掉 `bridge-` 前缀） |
| `gemini-home/` | 托管的 Gemini 配置，包括 `.gemini/settings.json` |

Aperture CLI 会在首次使用时自动创建这些文件。

`settings.json` 存储端点（可含 `bridgeId` 引用）、桥接定义和 YOLO 模式设置：

```json
{
  "bridges": [
    {
      "id": "bridge-a1b2c3",
      "name": "work"
    }
  ],
  "endpoints": [
    {
      "url": "https://ai.example.com"
    },
    {
      "url": "https://ai-staging.example.com",
      "bridgeId": "bridge-a1b2c3"
    }
  ],
  "yoloMode": false
}
```

## 限制

Aperture CLI 有以下限制：

* **安装需要 Go**：用 `go install` 安装或从源码构建 Aperture CLI 需要 Go v1.26.6 或更高版本。
* **仅限终端界面**：Aperture CLI 在终端中运行，没有图形界面。
* **不能并发运行智能体**：每个 Aperture CLI 会话一次只能运行一个编码智能体。要同时运行多个智能体，请打开多个终端会话。
* **Linux 上没有 Claude Cowork**：Claude Cowork 桌面智能体仅在 macOS 和 Windows 上可用。
* **无连接器管理**：连接器和 MCP 网关设置请在[管理仪表板][docs-web-dashboard-admin]的 **Administration** > **Connectors** 或 [JSON 配置][docs-aperture-configuration]中管理。设置说明参阅[连接器][docs-aperture-connectors]。

## 排查 Aperture CLI 问题

如果 Aperture CLI 行为不符合预期，请检查以下常见问题。Aperture 一般问题参阅 [Aperture 故障排查][docs-troubleshooting]。

### Aperture 主机无法访问

如果 Aperture CLI 在预检时无法连接 Aperture 主机：

* 确认你的设备可以访问 Aperture 网关。
* 确认主机 URL 正确。
* 检查网络连接、防火墙规则和 tailnet 策略文件规则。

在设置向导中选择 **Edit endpoint URL** 尝试其他 URL。

### 找不到智能体二进制文件

如果编码智能体没有出现在主菜单中：

* 运行 `which <binary-name>`（例如 `which claude`）确认智能体二进制文件已安装。
* 确认二进制文件位于你的 `$PATH` 中，或位于 Aperture CLI 会检查的目录之一：`~/.local/bin`、`~/bin`、`~/.npm-global/bin` 或 `~/.opencode/bin/`（仅 OpenCode）。额外检查的目录因智能体而异。请把 `/usr/local/bin`、`/opt/homebrew/bin` 等系统目录加入 `$PATH`，以便找到安装在这些位置的智能体。
* 在主菜单按 `i` 可查看各智能体的安装命令。

### 没有可用的兼容提供商类型

如果编码智能体出现了但没有提供商类型可选：

* 确认你的 Aperture 网关配置了具备该智能体所需 [API 类型][docs-provider-compatibility]的提供商。
* 在 [Aperture 管理仪表板][docs-web-dashboard-admin]的 **Administration** > **Providers** 页面确认提供商配置。

### 智能体立即退出

如果编码智能体启动后立即退出：

* 用 `-debug` 标志运行 Aperture CLI，显示启动前 Aperture CLI 设置的环境变量：

  ```shell
  aperture -debug
  ```

* 查看智能体自身的日志中的错误信息。

* 确认 Aperture 网关针对所选提供商类型正确转发请求。

### Gemini CLI 主机校验失败

Gemini CLI 0.40 及更高版本要求自定义网关 URL 使用 HTTPS 和完全限定域名（FQDN）。如果启动 Gemini CLI 时 Aperture CLI 报告主机校验错误：

* 确认 Aperture 端点使用 `https://`（而不是 `http://`）。
* 使用网关的完整 tailnet 名称（例如 `https://<aperture-hostname>.<tailnet-name>.ts.net`），而不要用 `ai` 这样的短主机名。
* 在 **Settings** > **Aperture Endpoints** 中更新端点。

Aperture CLI 的 Gemini 启动器会拒绝短主机名和 HTTP URL。其他客户端有各自的 URL 要求，例如 Claude Desktop 的 HTTPS 要求。

### Claude Code 设置中的环境变量冲突

如果启动 Claude Code 时 Aperture CLI 报告环境变量冲突：

* 打开 `~/.claude/settings.json` 检查 `env` 部分。

* 移除错误信息中列出的变量，可能包括：

  * `ANTHROPIC_BASE_URL`
  * `ANTHROPIC_MODEL`
  * `ANTHROPIC_AUTH_TOKEN`
  * `ANTHROPIC_BEDROCK_BASE_URL`
  * `CLAUDE_CODE_USE_BEDROCK`
  * `CLAUDE_CODE_SKIP_BEDROCK_AUTH`
  * `CLOUD_ML_REGION`
  * `CLAUDE_CODE_USE_VERTEX`
  * `CLAUDE_CODE_SKIP_VERTEX_AUTH`
  * `ANTHROPIC_VERTEX_PROJECT_ID`
  * `ANTHROPIC_VERTEX_BASE_URL`
  * `ANTHROPIC_DEFAULT_OPUS_MODEL`
  * `ANTHROPIC_DEFAULT_SONNET_MODEL`
  * `ANTHROPIC_DEFAULT_HAIKU_MODEL`
  * `API_TIMEOUT_MS`
  * `ANTHROPIC_API_KEY`

* Aperture CLI 会根据所选提供商类型替你设置这些变量。此项检查只针对 Claude Code 及其 `~/.claude/settings.json` 文件。

### 桥接连接失败

如果 Aperture CLI 对桥接端点显示连接状态后失败：

* **需要首次认证**：桥接首次连接时需要完成 Tailscale 认证。Aperture CLI 会在浏览器中打开登录 URL，并将其显示在连接界面底部。如果浏览器没有打开，按 `Ctrl+Y` 复制该 URL 并自行打开。
* **桥接未在你的 tailnet 中授权**：检查桥接的节点是否已在 Tailscale 管理控制台中获得批准。
* **网络问题**：桥接需要出站互联网访问才能连接 Tailscale。

### 桥接无法删除

对桥接按 `d` 时提示该桥接正被某个端点使用：

* 先前往 **Settings** > **Aperture Endpoints**，删除或改绑引用该桥接的端点，然后再删除桥接。

### 快速选择未显示

如果你之前启动过智能体，但主菜单没有显示 `[0]` 快速选择选项：

* 上次使用的智能体已被卸载。
* 上次使用的提供商已不再从 Aperture 提供。
* 上次使用的模型已不再由该提供商列出。
* 后端已不再与该提供商兼容。
* 上次启动所用的端点已被移除或不再活跃。

只有能完整校验上次启动状态时，Aperture CLI 才会显示快速选择。请走正常选择流程创建新的启动记录。

## 命令行参考

Aperture CLI 接受以下标志：

| 标志 | 默认值 | 描述 |
| --- | --- | --- |
| `-version` | `false` | 打印版本并退出 |
| `-debug` | `false` | 启用桥接诊断，显示启动环境变量和参数 |
| `-endpoint` | `""` | 打开指定的 Aperture URL 而不是已保存的端点；省略该标志时使用 `APERTURE_ENDPOINT` |
| `-bridge` | `""` | 通过指定名称的桥接连接，必要时创建该桥接；省略该标志时使用 `APERTURE_BRIDGE` |

显式给出的 `-endpoint` 或 `-bridge` 标志优先于对应的环境变量，即使标志值为空。

如果只指定桥接而未指定端点 URL，Aperture CLI 会通过该桥接在 `http://ai` 寻找 Aperture。要使用其他 URL，请同时指定 `-bridge` 和 `-endpoint`。

[ar-agent-binary-not-found]: #找不到智能体二进制文件

[ar-bridges]: #桥接

[ar-persistent-state]: #持久化状态

[ar-provider-type]: #选择提供商类型

[ar-supported-agents]: #受支持的智能体

[co-download]: https://tailscale.com/download

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture]: /docs/aperture

[docs-connect-outside-tailnet-ts-unplug]: /docs/aperture/connect-outside-tailnet#connect-using-ts-unplug

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-tailnet]: /docs/concepts/tailnet

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-amazon-bedrock]: /docs/aperture/how-to/use-amazon-bedrock

[docs-use-anthropic]: /docs/aperture/how-to/use-anthropic

[docs-use-claude-code]: /docs/aperture/how-to/use-claude-code

[docs-use-claude-desktop]: /docs/aperture/how-to/use-claude-desktop

[docs-use-codex]: /docs/aperture/how-to/use-codex

[docs-use-google-gemini]: /docs/aperture/how-to/use-google-gemini

[docs-use-openai]: /docs/aperture/how-to/use-openai

[docs-use-opencode]: /docs/aperture/how-to/use-opencode

[docs-use-geap]: /docs/aperture/how-to/use-gemini-enterprise-agent-platform

[docs-web-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[xt-aperture-setup]: https://aperture.tailscale.com/

[xt-claude-code]: https://docs.anthropic.com/en/docs/claude-code

[xt-gemini-cli]: https://geminicli.com/

[xt-gh-aperture-cli]: https://github.com/tailscale/aperture-cli

[xt-github-copilot]: https://github.com/github/copilot-cli

[xt-go-install]: https://go.dev/doc/install

[xt-openai-codex]: https://github.com/openai/codex

[xt-opencode]: https://opencode.ai

[docs-gateway-setup]: /docs/aperture/use-your-tools#gateway-generated-configuration

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider
