---
title: "将 GitHub Actions 用于 Tailscale GitOps"
description: "[访问控制策略][docs-access-control]定义了用户或设备在你的 Tailscale 网络（即 tailnet）中允许访问的内容。除了在管理控制台中管理访问控制策略的更改之外，另一种替代方式是使用 GitOps。"
---

最后验证于 Dec 5, 2025

[访问控制策略][docs-access-control]定义了用户或设备在你的 Tailscale 网络（即 tailnet）中允许访问的内容。除了在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面中管理访问控制策略的更改之外，还可以使用 [GitOps][docs-gitops-acls] 来管理这些更改。本主题详细介绍如何使用 [GitHub Actions][xt-gh-actions] 自动向你的 tailnet 应用并测试访问控制策略更改。

> **注意：** Tailscale 的 GitOps 功能适用于[所有套餐](https://tailscale.com/pricing)。

## 前提条件

除了已拥有自己的 Tailscale 网络之外，你还需要：

* 一个 GitHub 账户。
* 熟悉 GitHub 的各项操作，包括提交更改、创建与合并拉取请求（pull request）。
* 一个私有 GitHub 仓库，用于存放你的 tailnet 策略文件。

> **警告：**
>
> 请确保该仓库为私有，因为 tailnet 策略文件包含个人可识别信息（PII），例如你用户的电子邮件地址。

* 一个用于你 tailnet 的 Tailscale [联合身份][docs-workload-identity-federation]、[OAuth 客户端][docs-oauth]或 [API 访问令牌][docs-api]。你可以在管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面创建联合身份或 OAuth 客户端，也可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建 API 访问令牌。如果你使用信任凭证（trust credential），该凭证需要 `policy_file:read` 作用域才能读取并验证 tailnet 策略文件，或需要 `policy_file` 作用域才能读取、验证并修改 tailnet 策略文件。有关使用 `policy_file:read` 或 `policy_file` 作用域时所需的其他作用域的信息，请参阅[信任凭证作用域][docs-trust-credentials-scopes]文档。

## 用于同步 Tailscale 访问控制策略的 GitHub Action

Tailscale 发布了一个用于[同步 Tailscale 访问控制策略][xt-gh-acl-sync]的 GitHub Action，可在 GitHub Actions Marketplace 获取。

> **注意：**
>
> 你不必使用这个 GitHub Action 来搭建 GitOps 模式——你也可以编写自己的 Action，或使用其他 CI/CD 工具。

### 此 action 做什么

对于目标为 `main` 分支的**拉取请求**，`Test ACL` 步骤（action `test`）会把你的 tailnet 策略文件发送到 Tailscale，以确定访问控制策略是否有效、所有[测试][docs-policy-syntax-tests]是否通过。Tailscale 会将这些检查的结果提供给你的工作流。

对于目标为 `main` 分支的**推送**（合并）操作，`Deploy ACL` 步骤（action `apply`）会再次检查访问控制策略的有效性并运行测试，由 Tailscale 将结果回传给你的工作流。如果测试通过，合并会完成，工作流会自动将你的访问控制策略更改应用到你的 tailnet。如果测试失败，会报错并阻止合并继续进行。

你可以在 GitHub 界面中该拉取请求的 **Actions** 标签页查看工作流的状态。寻找一个名称与你在 `.github/workflows/tailscale.yml` 中所用的名称一致的工作流，即 **Tailscale ACL syncing**。

*（图：GitHub Actions 工作流界面。列出了一个 'Sync Tailscale ACLs' 工作流。）*

### 输入

以下输入适用于 Sync Tailscale ACLs action。

* `action`（必填）：`test` 或 `apply` 之一。如果为 `test`，该 action 只会运行 [ACL 测试][docs-policy-syntax-tests]——不会更新你在 Tailscale 中的 ACL。如果为 `apply`，该 action 会运行 ACL 测试，并在测试成功后更新你在 Tailscale 中的 ACL。这让你可以用拉取请求来做更改，由 CI 防止你把糟糕的更改推到生产环境。

* `oauth-client-id`/`audience`，或 `oauth-client-id`/`oauth-secret`，或 `api-key`（必填）：允许该 action 与你的 tailnet 交互的凭证。你可以使用 `oauth-client-id` 与 `audience`，或 `oauth-client-id` 与 `oauth-secret`，或 `api-key`。你可以在管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面创建信任凭证，
  也可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建 API 访问令牌。

* `policy-file`（可选）：你的 tailnet 策略文件在仓库中的路径。如果未设置，默认为仓库根目录下的 `policy.hujson`。

* `tailnet`（必填）：这是你的组织（organization），你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面找到它。

## 设置你的 GitOps 配置

1. 在你的 GitHub 仓库中，创建一个名为 `policy.hujson` 的文件。将管理控制台 [Access controls](https://console.tailscale.com/admin/acls) 页面中的 tailnet 策略文件内容复制到该文件中。

   > **注意：**
   >
   > 如果你想把 tailnet 策略文件改成其他名称，需要在下文讨论的 GitHub Actions 配置的 `with` 块中添加 `policy-file` 参数。否则，GitHub action 会默认使用 `policy.hujson` 作为 tailnet 策略文件。

2. 提交 tailnet 策略文件并推送到 GitHub。例如，如果你使用命令行：

   ```shell
   git add .
   git commit -sm "policy: import from admin console"
   git push -u origin main
   ```

3. 在仓库设置中创建以下 [GitHub Actions 机密][xt-gh-secrets]：

   > **注意：**
   >
   > 你可以提供 Tailscale OAuth 客户端凭证，或 Tailscale API 密钥。如果两者都提供，将使用 OAuth 凭证。

   * `TS_TAILNET`：值使用你的 tailnet ID。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面找到你的 tailnet ID。
   * `TS_OAUTH_ID`：值使用你的 Tailscale OAuth 客户端 ID。
   * `TS_OAUTH_SECRET`：值使用你的 Tailscale OAuth 客户端密钥。
   * `TS_API_KEY`：值使用你的 Tailscale API 访问令牌。

   这些机密为该 action 提供配置。

4. 新建一个使用 [Sync Tailscale ACLs][xt-gh-acl-sync] GitHub Action 的 GitHub Actions 工作流。

   #### 联合身份

   创建一个名为 `.github/workflows/tailscale.yml` 的文件。粘贴以下 YAML：

   ```yaml
   name: Sync Tailscale ACLs

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   jobs:
     acls:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v6

         - name: Deploy ACL
           if: github.event_name == 'push'
           id: deploy-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_ID }}
             audience ${{ secrets.TS_AUDIENCE }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: apply

         - name: Test ACL
           if: github.event_name == 'pull_request'
           id: test-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_ID }}
             audience: ${{ secrets.TS_AUDIENCE }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: test
   ```

   如果你的默认分支不叫 `main`，请更新 YAML 中的 `branches` 字段。

   该工作流会恰当地使用 `secrets.TS_OAUTH_ID`、`secrets.TS_AUDIENCE` 与 `secrets.TS_TAILNET` 环境变量来访问你的机密。

   > **警告：**
   >
   > 不要把你的真实机密*值*放在 `.github/workflows/tailscale.yml` 中——请按示例使用环境变量值。

   #### OAuth 客户端

   创建一个名为 `.github/workflows/tailscale.yml` 的文件。粘贴以下 YAML：

   ```yaml
   name: Sync Tailscale ACLs

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   jobs:
     acls:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v6

         - name: Deploy ACL
           if: github.event_name == 'push'
           id: deploy-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_ID }}
             oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: apply

         - name: Test ACL
           if: github.event_name == 'pull_request'
           id: test-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_ID }}
             oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: test
   ```

   如果你的默认分支不叫 `main`，请更新 YAML 中的 `branches` 字段。

   该工作流会恰当地使用 `secrets.TS_OAUTH_ID`、`secrets.TS_OAUTH_SECRET` 与 `secrets.TS_TAILNET` 环境变量来访问你的机密。

   > **警告：**
   >
   > 不要把你的真实机密*值*放在 `.github/workflows/tailscale.yml` 中——请按示例使用环境变量值。

   #### API 密钥

   创建一个名为 `.github/workflows/tailscale.yml` 的文件。粘贴以下 YAML：

   ```yaml
   name: Sync Tailscale ACLs

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   jobs:
     acls:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v6

         - name: Deploy ACL
           if: github.event_name == 'push'
           id: deploy-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             api-key: ${{ secrets.TS_API_KEY }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: apply

         - name: Test ACL
           if: github.event_name == 'pull_request'
           id: test-acl
           uses: tailscale/gitops-acl-action@v1
           with:
             api-key: ${{ secrets.TS_API_KEY }}
             tailnet: ${{ secrets.TS_TAILNET }}
             action: test
   ```

   如果你的默认分支不叫 `main`，请更新 YAML 中的 `branches` 字段。

   该工作流会恰当地使用 `secrets.TS_API_KEY` 与 `secrets.TS_TAILNET` 环境变量来访问你的机密。

   > **警告：**
   >
   > 不要把你的真实机密*值*放在 `.github/workflows/tailscale.yml` 中——请按示例使用环境变量值。

   有关已设置此工作流的示例仓库，请参阅 [`https://github.com/cetacean/tailscale-acls`][xt-gh-tailscale-acls]。&#x20;

5. 提交并推送 `.github/workflows/tailscale.yml`。

   该 action 的主要步骤是安装 [gitops-pusher][xt-gh-tailscale-cmd-gitops-pusher]、设置正确的环境变量与标志，然后运行工作流。更多信息请参阅 [GitHub Action 配置][xt-gh-tailscale-gitops-acl-config]。

   通过这套设置，你就创建了一个持续集成（CI）流程，可以自动测试 tailnet 策略文件的更改并将其推送到 Tailscale！

6. 按照说明在管理控制台中[防止他人意外修改你的 tailnet 策略文件][ar-prevent-edits]。

## 推送对 tailnet 策略文件的更改

配置设置完成后，只要想更新 ACL，修改仓库中的 tailnet 策略文件，然后走 GitHub 常见的编写/审查/合并流程即可。你可以在 GitHub 界面中该拉取请求的 **Actions** 标签页查看 ACL 有效性检查与 ACL 测试的状态。寻找一个名称与你在 `.github/workflows/tailscale.yml` 中所用的名称一致的工作流，即 **Sync Tailscale ACLs**。

## 防止他人意外修改你的 tailnet 策略文件

> **注意：**
>
> 2025 年 6 月 3 日，我们[宣布弃用][co-changelog-gitops]通过 GitOps 代码注释在管理控制台中锁定策略文件编辑器的方法。使用该方法的 tailnet 已自动迁移为使用管理控制台中的设置。代码注释不再能锁定策略文件编辑器。

要防止组织中的其他管理员意外更改你的 tailnet 策略文件，你可以在 Tailscale 管理控制台的 [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) 页面锁定编辑器。

你必须成为 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles)，才能更新 tailnet 策略文件设置。

1. 打开 Tailscale 管理控制台的 [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) 页面。
2. 如果尚未启用，选择 **Prevent edits in the admin console**（禁止在管理控制台中编辑），以阻止对该文件的编辑。
3. 对于 **External reference**，输入你仓库的 URL。这样其他管理员就能知道你的策略源所在的位置。
4. 选择 **Save**。

任何[有权编辑 tailnet 策略文件的管理员][docs-user-roles-permissions-by-roles]仍可以通过选择 **Edit anyway** 直接编辑该文件。这让管理员在紧急情况下可以快速做出更改。

*（图：尝试编辑正在使用 GitOps 的 tailnet 策略文件时给出的警告。）*

下次使用 GitOps 流程时，它会覆盖在管理控制台中所做的 tailnet 策略文件更改。

## 撤销对 ACL 的最近一次更改

如果需要撤销最近一次更改，请使用 GitHub 界面[还原已合并的拉取请求][xt-gh-revert-pr]。

## 移除你的 GitOps 配置

1. 打开 Tailscale 管理控制台的 [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) 页面，关闭 **Prevent edits in the admin console** 开关。

2. （可选）删除 **External reference link**，然后选择 **Save**。

3. [吊销][docs-auth-keys-revoke]与此配置关联的所有 Tailscale API 访问令牌。

4. 归档或删除关联的 GitHub 仓库。

## 补充信息

* 在管理控制台中对 tailnet 策略文件所做的任何手动更改，都不会反映到你 GitHub 上的 tailnet 策略文件版本中。下次运行 Sync Tailscale ACLs GitHub Action 时，在 Tailscale 管理控制台中所做的任何更改都会被覆盖。

* Tailscale [API 访问令牌会过期][docs-api-authentication]，目前没有自动续期的机制。要应对过期，请创建新的 API 访问令牌，并更新 GitHub 的 `TS_API_KEY` 机密以使用新值。

  > **警告：**
  >
  > Tailscale API 访问令牌会在 90 天后过期（如果密钥设置了更短的过期时间则更早），但每月更新 GitHub 机密是一个好习惯。
  >
  > 当你不再需要使用某个 Tailscale API 访问令牌时，请务必在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面
  > 将其吊销。

* Tailscale tailnet 策略文件采用 [HuJSON][xt-nigeltao-hujson] 格式——一种支持尾随逗号与注释的 JSON 格式。如果你不想直接用 HuJSON 编写 tailnet 策略文件，可以使用能生成与 HuJSON 格式同结构 JSON 的工具。请确保你的工具把文件放在与 GitHub Action 中 `policy-file` 设置相同的位置。

[ar-prevent-edits]: #防止他人意外修改你的-tailnet-策略文件

[co-changelog-gitops]: https://tailscale.com/changelog#2025-06-03

[docs-access-control]: /docs/features/access-control

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-gitops-acls]: /docs/gitops

[docs-oauth]: /docs/features/oauth-clients

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-trust-credentials-scopes]: /docs/reference/trust-credentials#scopes

[docs-user-roles-permissions-by-roles]: /docs/reference/user-roles#permissions-managed-by-user-roles

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[xt-gh-acl-sync]: https://github.com/marketplace/actions/sync-tailscale-acls

[xt-gh-actions]: https://github.com/features/actions

[xt-gh-revert-pr]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/reverting-a-pull-request

[xt-gh-secrets]: https://docs.github.com/en/actions/security-guides/encrypted-secrets

[xt-gh-tailscale-acls]: https://github.com/cetacean/tailscale-acls

[xt-gh-tailscale-cmd-gitops-pusher]: https://github.com/tailscale/tailscale/tree/main/cmd/gitops-pusher

[xt-gh-tailscale-gitops-acl-config]: https://github.com/tailscale/gitops-acl-action/blob/main/action.yml

[xt-nigeltao-hujson]: https://nigeltao.github.io/blog/2021/json-with-commas-comments.html
