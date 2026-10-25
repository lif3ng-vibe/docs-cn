---
title: "让 AI 代码评审经由 Aperture 路由"
description: "通过 Aperture by Tailscale 路由 Claude Code GitHub Action 请求，集中管理 API 密钥、用量跟踪与成本控制，服务于 AI 驱动的代码评审。"
---

最后验证于 Sep 28, 2026

AI 驱动的代码评审会从每个 pull request 产生 API 调用，而每次调用都需要一个 API 密钥。当这些密钥散落在各个仓库的 GitHub secrets 里时，你无法看清哪个团队或工作流花了多少钱，而且单个泄露的密钥就可能暴露你的整个 AI 预算。吊销或轮换密钥则意味着要改动每一个使用它的仓库。

在本指南中，你将让 [Claude Code GitHub Action][xt-claude-code-action] 的请求经由 [Aperture by Tailscale][docs-aperture] 路由，使 CI 运行器用它们的 Tailscale 身份认证，而不是各自的 API 密钥。每个 AI 代码评审请求都会流经 Aperture，在那里以调用者身份记录、计入中央预算，并使用唯一一把从不离开 Aperture 网关的 API 密钥转发给 Anthropic。

你需要配置三样东西：一条 tailnet 策略文件规则、一个 Aperture 授权，以及一个 GitHub Actions 工作流。

## 工作原理

请求流程如下：

1. [Tailscale GitHub Action][docs-tailscale-github-action] 在工作流开始时运行，在你的 tailnet 中创建一个打有 `tag:ci` 标签的临时节点。
2. [Claude Code Action][xt-claude-code-action] 启动代码评审。由于工作流把 `ANTHROPIC_BASE_URL` 设为 `http://<aperture-hostname>`，所有 API 调用都发往 Aperture 网关，而不是直接发给 Anthropic。
3. Aperture 收到请求，借助 [Tailscale 的 WhoIs API][docs-how-aperture-works] 识别调用者为 `tag:ci`，检查授权，并使用集中管理的 API 密钥把请求转发给 Anthropic。
4. Aperture 记录该请求的调用者身份、模型、token 数和费用。响应流回运行器。

这种方式把 API 密钥从 GitHub secrets 和运行器环境中移除。运行器仅凭其 Tailscale 身份认证，Aperture 在转发请求时注入 Anthropic API 密钥。

由于运行器与 Aperture 之间的所有流量都经由你的 tailnet 传输，它已被 WireGuard 加密。`http://` URL 是安全的，因为底层传输已经加密。

本指南使用集中管理的 API 密钥。要让每个运行器转发自己的提供商凭证，请以[直通模式（passthrough mode）][docs-use-passthrough-mode]配置 Anthropic 提供商。

## 前提条件

* 一个[已配置 Anthropic 提供商并启用至少一个 Anthropic 模型][docs-get-started]的 Aperture 网关。
* 一个拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 权限的 Tailscale 账户。
* 一个启用了 GitHub Actions 并拥有创建仓库密钥所需管理员权限的 GitHub 仓库。
* 熟悉 [GitHub Actions 工作流语法][xt-gh-workflow-syntax]、[Tailscale 标签][docs-tags]和 [tailnet 策略文件授权][docs-grants]。

\[Missing snippet: aperture\_tls\_warning.mdx]

## 第 1 步：创建 CI 标签并授予 Aperture 访问权

在 CI 运行器能访问 Aperture 之前，先为它们定义一个标签，允许该标签连接到 Aperture 设备，并授予它使用模型的权限。

### 定义标签

打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。在 `tagOwners` 部分中，如果尚不存在则添加 `tag:ci`：

```json
"tagOwners": {
  "tag:ci": []
}
```

空的所有者列表意味着 [Owner、Admin 和 Network admin](/docs/reference/user-roles) 可以应用该标签。Tailscale GitHub Action 在创建其临时节点时会自动应用这个标签。

### 允许网络访问

在同一个 tailnet 策略文件中，添加一条授权，让 `tag:ci` 设备能够在 80 端口访问 Aperture 设备：

```json
{
  "grants": [
    {
      "src": ["tag:ci"],
      "dst": ["ai"],
      "ip": ["tcp:80"]
    }
  ]
}
```

如果你的 Aperture 设备与默认值不同，请把 `"<aperture-hostname>"` 替换为该设备的主机名或 Tailscale IP 地址。

### 授予模型访问权

CI 运行器还需要一条 Aperture 授权来获准使用特定模型。将以下授权添加到 tailnet 策略文件：

```json
{
  "grants": [
    {
      "src": ["tag:ci"],
      "dst": ["<aperture-hostname>"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

`models` 模式 `anthropic/**` 允许 CI 运行器访问所有 Anthropic 模型。调整该模式即可把 CI 运行器限制到特定模型，例如 `anthropic/claude-sonnet-5-5`。

> **警告：**
>
> 授权必须同时包含 `role` 条目和 `models` 条目。缺少 `role` 时，即使 `models` 模式匹配，Aperture 也会返回 HTTP 403。

你可以把网络访问与模型访问合并为一条授权：

```json
{
  "grants": [
    {
      "src": ["tag:ci"],
      "dst": ["<aperture-hostname>"],
      "ip": ["tcp:80"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

保存 tailnet 策略文件。规则立即生效。

## 第 2 步：为 GitHub Actions 设置 Tailscale 认证

Tailscale GitHub Action 需要凭据才能以临时节点身份加入你的 tailnet。

### 工作负载身份联合（推荐）

工作负载身份联合使用 GitHub 的 OIDC 令牌进行认证，避免了可能过期或泄露的密钥。

1. 在 Tailscale 管理控制台中创建一个[联合身份][docs-workload-identity-federation]。把签发者（issuer）设为 GitHub Actions，并配置主体（subject）声明以匹配你的仓库。分配 `auth_keys` 作用域和 `tag:ci` 标签。
2. 复制 **Client ID** 和 **Audience** 值。
3. 在你的 GitHub 仓库中，创建两个[仓库密钥][xt-gh-secrets]：
   * `TS_OAUTH_CLIENT_ID`：你的联合身份 Client ID。
   * `TS_AUDIENCE`：你的联合身份 Audience。

工作负载身份联合要求 GitHub Actions 工作流中有 `id-token: write` 权限，你将在第 3 步中添加它。

### OAuth 客户端

如果你的组织不使用工作负载身份联合，请改为创建一个 [OAuth 客户端][docs-oauth-clients]。

1. 在管理控制台中创建一个带有 `auth_keys` 作用域和 `tag:ci` 标签的 [OAuth 客户端][docs-oauth-clients]。
2. 复制 **Client ID** 和 **Client secret**。
3. 在你的 GitHub 仓库中，创建两个仓库密钥：
   * `TS_OAUTH_CLIENT_ID`：你的 OAuth Client ID。
   * `TS_OAUTH_SECRET`：你的 OAuth Client secret。

两种方式的详细说明请参阅 [Tailscale GitHub Action 文档][docs-tailscale-github-action]。

## 第 3 步：配置 GitHub Actions 工作流

访问控制和认证就绪后，配置你的工作流连接 tailnet，并让 Claude Code 请求经由 Aperture 路由。

创建或更新一个工作流文件（例如 `.github/workflows/code-review.yml`），内容如下。本示例使用工作负载身份联合。如果你使用 OAuth 客户端，请把 `audience` 替换为 `oauth-secret`，并引用 `secrets.TS_OAUTH_SECRET`。

```yaml
name: AI code review
on:
  pull_request:

permissions:
  id-token: write
  pull-requests: write
  contents: read

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Connect to tailnet
        uses: tailscale/github-action@v4
        with:
          oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
          audience: ${{ secrets.TS_AUDIENCE }}
          tags: tag:ci
          ping: <aperture-hostname>

      - name: Run Claude Code review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: "-"
        env:
          ANTHROPIC_BASE_URL: "http://ai"
          CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"
```

### 权限

`permissions` 块设置了该工作流所需的最低 GitHub 令牌权限：

| 权限                    | 用途                                                                                                                                     |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `id-token: write`       | 工作负载身份联合所需。Tailscale action 用它请求 GitHub OIDC 令牌。如果你使用 OAuth 客户端则可省略。                                       |
| `pull-requests: write`  | 让 Claude Code Action 能在 pull request 上发布评审评论。                                                                                  |
| `contents: read`        | 让 Claude Code Action 能读取仓库文件用于评审。                                                                                            |

### Tailscale GitHub Action

`tailscale/github-action@v4` 步骤在你的 tailnet 中创建临时节点：

* `tags: tag:ci` 分配 Aperture 用来识别并授权调用者的标签。
* `ping: <aperture-hostname>` 最多等待三分钟以建立到 Aperture 网关的连接。连接就绪后，Claude Code 步骤才会开始。

### Claude Code Action

`anthropics/claude-code-action@v1` 步骤运行 AI 代码评审：

* `anthropic_api_key: "-"` 是一个占位符，用来满足该 action 的非空检查。真正的 API 密钥由 Aperture 管理，因此这个值永远不会被发送给 Anthropic。
* `ANTHROPIC_BASE_URL: "http://<aperture-hostname>"` 把所有 API 调用重定向到 Aperture 网关。MagicDNS 会把 `<aperture-hostname>` 解析为它的 Tailscale IP 地址。
* `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"` 阻止 Claude Code 发送遥测或更新检查——这些流量会绕过 Aperture，并在没有直接互联网访问的情况下失败。

> **注意：**
>
> `anthropic_api_key` 是 `with:` 输入（action 参数），而 `ANTHROPIC_BASE_URL` 和 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 是 `env:` 变量。这一区别很重要，因为该 action 会对 `anthropic_api_key` 做真值检查，没有它就拒绝启动。

## 第 4 步：验证流水线

提交工作流文件后，用一个小的代码改动发起一个 pull request，确认端到端集成正常工作。工作流会自动运行，Claude Code Action 会在 PR 上发布评审评论。

### 查看 GitHub Actions 日志

在仓库的 **Actions** 标签页中打开工作流运行：

1. 在 **Connect to tailnet** 步骤中，确认 Tailscale action 已连接，且 `ping: <aperture-hostname>` 检查成功。
2. 在 **Run Claude Code review** 步骤中，确认 Claude Code 收到了来自 Aperture 的响应。查找显示对 `http://<aperture-hostname>` 进行 API 调用的日志行。

### 查看 Aperture 管理仪表盘

以 Aperture 管理员身份，从 tailnet 中的一台设备打开 `http://<aperture-hostname>/admin/logs`：

1. 找到来自你的测试 PR 的请求。该请求会显示 `tag:ci` 作为调用者身份。
2. 核对记录的模型名、token 数和费用是否符合预期。

如果请求以 `tag:ci` 身份出现，说明集成正常工作。今后每个 pull request 都会在 Aperture 中生成带日志的记录。

### 排查常见问题

如果工作流失败，请检查这些常见原因：

| 症状                                     | 原因                                                                                                      | 修复方法                                                                                        |
| :--------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| Tailscale 步骤连接超时                   | `tagOwners` 中不存在 `tag:ci`，或运行器无法访问协调服务器。                                               | 确认标签存在于你的 tailnet 策略文件中，且你的 GitHub secrets 正确。                             |
| Aperture 返回 HTTP 403                   | Aperture 授权缺少 `role` 条目，或 `models` 模式与请求的模型不匹配。                                       | 确认授权同时包含 `{ "role": "user" }` 和一条匹配的 `{ "models": "..." }` 条目。                 |
| Claude Code 报告 API 密钥错误            | `anthropic_api_key` 为空或缺失。                                                                          | 在 `with:` 块中设置 `anthropic_api_key: "-"`。该值必须非空。                                     |
| `ping: <aperture-hostname>` 超时         | 网络授权不允许 `tag:ci` 在 80 端口访问 Aperture 设备。                                                    | 检查网络访问授权中的 `dst` 和 `ip` 字段。                                                        |

## 导出日志用于长期保留（可选）

为了长期保留，你可以把 Aperture 会话日志导出到 S3 兼容存储。每条导出记录都包含调用者身份、模型、token 数、费用和完整会话上下文，可以接入你现有的成本分摊或分析流水线。

设置说明请参阅[将用量数据导出到 S3][docs-export-usage-data-to-s3]。如果你要求 Aperture 绝不在磁盘上存储提示词或响应内容，可以将此与[零保留模式][docs-aperture-zero-retention]结合，让 S3 成为唯一的存档。

## 后续步骤

AI 代码评审经由 Aperture 流转后，可以考虑：

* [设置按用户的支出限额][docs-set-per-user-spending-limits]，限制 CI 流水线每天或每月在 AI 评审上的花费。
* 通过收窄授权中的 `models` 模式把 CI 运行器限制到特定模型，例如用 `anthropic/claude-sonnet-5-5` 代替 `anthropic/**`。
* 把同一模式应用到其他 AI 驱动的 CI 工具：把它们的 base URL 设为 `http://<aperture-hostname>`，并经由 tailnet 连接。
* [构建自定义 webhook][docs-build-webhook]，在 CI 运行器发起 AI 请求时接收实时通知。

[docs-aperture-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[docs-aperture]: /docs/aperture

[docs-build-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-export-usage-data-to-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-get-started]: /docs/aperture/get-started

[docs-grants]: /docs/features/access-control/grants

[docs-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-tags]: /docs/features/tags

[docs-tailscale-github-action]: /docs/integrations/github/github-action

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[xt-claude-code-action]: https://github.com/anthropics/claude-code-action

[xt-gh-secrets]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets

[xt-gh-workflow-syntax]: https://docs.github.com/en/actions/how-tos/write-workflows
