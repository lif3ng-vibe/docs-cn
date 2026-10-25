---
title: "在 Aperture 中使用 Claude Code Action"
description: "配置 [Claude Code GitHub Action][xt-claude-code-action]，让请求经由 [Aperture by Tailscale][docs-aperture] 发送，使 CI 运行器使用自己的 Tailscale 身份进行认证，而不是为每个仓库单独配置 API key。"
---

最后验证于 Sep 28, 2026

配置 [Claude Code GitHub Action][xt-claude-code-action]，让请求经由 [Aperture by Tailscale][docs-aperture] 发送，使 CI 运行器（runner）使用自己的 Tailscale 身份进行认证，而不是为每个仓库单独配置 API key。

## 前提条件

* 一台 [Aperture 网关][docs-get-started]，已配置 Anthropic 提供商并至少启用一个 Anthropic 模型。
* 一个拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 权限的 Tailscale 账户。
* 一个启用了 GitHub Actions 的 GitHub 仓库，并有管理员权限来创建仓库 secrets。

\[Missing snippet: aperture\_tls\_warning.mdx]

## 创建 CI 标签并授予 Aperture 访问权

CI 运行器需要一个 Tailscale 标签、到 Aperture 网关的网络访问，以及一条授权模型使用的授权。

1. 在管理控制台中打开 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。

2. 在 `tagOwners` 段中添加 `tag:ci`（如果尚不存在）：

   ```json
   "tagOwners": {
     "tag:ci": []
   }
   ```

   所有者列表为空表示 [Owners、Admins 和 Network admins](/docs/reference/user-roles) 可以应用该标签。

3. 添加一条授权，让 `tag:ci` 设备获得到 Aperture 网关的网络访问权以及使用 Anthropic 模型的权限：

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

   如果与默认值不同，把 `"<aperture-hostname>"` 替换为你的 Aperture 网关的主机名或 Tailscale IP 地址。调整 `models` 模式可以把 CI 运行器限制在特定模型上，例如 `anthropic/claude-sonnet-5-5`。

4. 保存 tailnet 策略文件。规则立即生效。

> **警告：**
>
> 授权必须同时包含 `role` 条目和 `models` 条目。没有 `role` 时，即使 `models` 模式匹配，Aperture 也会返回 HTTP 403。

授权语法与模型模式的更多信息参阅[授予模型访问权][docs-grant-model-access]。由于这条授权位于 tailnet 策略文件中，它需要包含显式的 `dst` 字段。tailnet 策略文件与 Aperture 配置中授权要求的差异参阅 [Aperture 授权与 tailnet 策略文件授权的对比][docs-aperture-vs-tailnet-grants]。

## 为 GitHub Actions 设置 Tailscale 认证

[Tailscale GitHub Action][docs-tailscale-github-action] 需要凭证才能以临时节点（ephemeral node）身份加入你的 tailnet。

### 工作负载身份联合（推荐）

工作负载身份联合（workload identity federation）使用 GitHub 的 OIDC 令牌进行认证，避免了可能过期或泄露的密钥。

1. 在 Tailscale 管理控制台中创建[联合身份][docs-workload-identity-federation]。把 issuer 设为 GitHub Actions，并把 subject claim 配置为与你的仓库匹配。分配 `auth_keys` scope 和 `tag:ci` 标签。
2. 复制 **Client ID** 和 **Audience** 值。
3. 在你的 GitHub 仓库中创建两个 [repository secrets][xt-gh-secrets]：
   * `TS_OAUTH_CLIENT_ID`：你的联合身份 Client ID。
   * `TS_AUDIENCE`：你的联合身份 Audience。

工作负载身份联合要求 GitHub Actions 工作流具备 `id-token: write` 权限，你在配置工作流文件时加上即可。

### OAuth 客户端

如果你的组织不使用工作负载身份联合，可以改为创建 [OAuth 客户端][docs-oauth-clients]。

1. 在管理控制台中创建一个 [OAuth 客户端][docs-oauth-clients]，分配 `auth_keys` scope 和 `tag:ci` 标签。
2. 复制 **Client ID** 和 **Client secret**。
3. 在你的 GitHub 仓库中创建两个 repository secrets：
   * `TS_OAUTH_CLIENT_ID`：你的 OAuth Client ID。
   * `TS_OAUTH_SECRET`：你的 OAuth Client secret。

两种方式的详细说明参阅 [Tailscale GitHub Action 文档][docs-tailscale-github-action]。

## 在工作流中添加 Claude Code Action

创建或更新工作流文件（例如 `.github/workflows/claude.yml`），内容如下。本示例使用工作负载身份联合。如果你使用 OAuth 客户端，请把 `audience` 替换为 `oauth-secret`，并引用 `secrets.TS_OAUTH_SECRET`。

```yaml
name: Claude Code
on:
  pull_request:

permissions:
  id-token: write
  pull-requests: write
  contents: read

jobs:
  claude:
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
          ping: ai

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: "-"
        env:
          ANTHROPIC_BASE_URL: "http://ai"
          CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"
```

### 关键设置

| 设置 | 用途 |
| :--- | :--- |
| `tags: tag:ci` | 分配 Aperture 用来识别并授权调用者的标签。 |
| `ping: <aperture-hostname>` | 先等待到 Aperture 网关的连通性再继续。防止 tailnet 连接尚未就绪就开始 Claude Code 步骤。 |
| `anthropic_api_key: "-"` | 满足该 action 非空校验的占位值。真正的 API key 由 Aperture 管理。 |
| `ANTHROPIC_BASE_URL: "http://<aperture-hostname>"` | 把所有 API 调用重定向到 Aperture 网关。MagicDNS 会把 `<aperture-hostname>` 解析为 Aperture 网关的 Tailscale IP 地址。 |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"` | 阻止 Claude Code 发送绕过 Aperture 的遥测或更新检查。 |

> **注意：**
>
> `anthropic_api_key` 是 `with:` 输入（action 参数），而 `ANTHROPIC_BASE_URL` 和 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 是 `env:` 变量。该 action 会对 `anthropic_api_key` 做真值检查，缺少它就拒绝启动。

### 权限

`permissions` 块设置工作流所需的最低 GitHub 令牌权限：

| 权限 | 用途 |
| :--- | :--- |
| `id-token: write` | 工作负载身份联合必需。使用 OAuth 客户端时可省略。 |
| `pull-requests: write` | 允许 Claude Code Action 在 pull request 上发表评审评论。 |
| `contents: read` | 允许 Claude Code Action 读取仓库文件。 |

## 验证连接

1. 提交一个包含小幅代码改动的 pull request 以触发工作流。
2. 在工作流运行页面的 **Actions** 标签页中确认：
   * **Connect to tailnet** 步骤已连接，且 `ping: <aperture-hostname>` 检查成功。
   * **Run Claude Code** 步骤已完成，并显示发往 `http://<aperture-hostname>` 的 API 调用。
3. 打开 Aperture 管理仪表板，选择 **Security** > **Logs**，确认该请求以 `tag:ci` 作为调用者身份出现。需要管理员权限。

### 排查常见问题

| 现象 | 原因 | 解决方法 |
| :--- | :--- | :--- |
| Tailscale 步骤连接超时 | `tag:ci` 不在 `tagOwners` 中，或运行器无法连接协调服务器（coordination server）。 | 确认标签存在于 tailnet 策略文件中，且 GitHub secrets 配置正确。 |
| Aperture 返回 HTTP 403 | 授权缺少 `role` 条目，或 `models` 模式与请求的模型不匹配。 | 确认授权同时包含 `{ "role": "user" }` 和匹配的 `{ "models": "..." }` 条目。 |
| Claude Code 报 API key 错误 | `anthropic_api_key` 为空或缺失。 | 在 `with:` 块中设置 `anthropic_api_key: "-"`。该值必须非空。 |
| `ping: <aperture-hostname>` 超时 | 网络授权不允许 `tag:ci` 通过 80 端口访问 Aperture 网关。 | 检查网络访问授权中的 `dst` 和 `ip` 字段。 |

## 后续步骤

* [设置按用户支出限额][docs-set-per-user-spending-limits]，限制 CI 流水线在 AI 请求上的花费。
* 通过收窄授权中的 `models` 模式把 CI 运行器限制在特定模型上，例如用 `anthropic/claude-sonnet-5-5` 代替 `anthropic/**`。
* [把用量数据导出到 S3][docs-export-usage-data-to-s3]，用于长期保存与记录。
* [构建自定义 webhook][docs-build-webhook]，在 CI 运行器发起 AI 请求时接收实时通知。
* 包含成本控制与用量可见性的 AI 代码评审完整搭建指南参阅[通过 Aperture 路由 AI 代码评审][docs-route-ai-code-reviews]。

[docs-aperture-vs-tailnet-grants]: /docs/aperture/reference/aperture-vs-tailnet-grants

[docs-aperture]: /docs/aperture

[docs-build-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-export-usage-data-to-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-route-ai-code-reviews]: /docs/solutions/route-ai-code-reviews-through-aperture

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-tailscale-github-action]: /docs/integrations/github/github-action

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[xt-claude-code-action]: https://github.com/anthropics/claude-code-action

[xt-gh-secrets]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
