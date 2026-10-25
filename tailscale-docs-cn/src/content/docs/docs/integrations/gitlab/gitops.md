---
title: "将 GitLab CI 用于 Tailscale GitOps"
description: "[访问控制策略][docs-access-control]定义了用户或设备在你的 Tailscale 网络（即 tailnet）中允许访问的内容。除了在管理控制台中管理访问控制策略的更改之外，另一种替代方式是使用 GitOps。"
---

最后验证于 Dec 4, 2025

[访问控制策略][docs-access-control]定义了用户或设备在你的 Tailscale 网络（即 tailnet）中允许访问的内容。除了在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面中管理访问控制策略的更改之外，还可以使用 [Tailscale GitOps][docs-gitops-acls] 来管理这些更改。本主题详细介绍如何使用 [GitLab CI/CD][xt-gitlab-get-started] 自动向你的 tailnet 应用并测试访问控制策略更改。

> **注意：** Tailscale 的 GitOps 功能适用于[所有套餐](https://tailscale.com/pricing)。

## 前提条件

除了已拥有自己的 Tailscale 网络之外，你还需要：

* 一个 GitLab 账户。
* 熟悉 GitLab 的各项操作，包括提交更改、创建合并请求（merge request）与合并请求。
* 一个私有 GitLab 仓库，用于存放你的 tailnet 策略文件。

> **警告：**
>
> 请确保该仓库为私有，因为 tailnet 策略文件包含个人可识别信息（PII），例如用户的电子邮件地址。

* 一个用于你 tailnet 的 Tailscale [API 访问令牌][docs-api]。你可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建 API 访问令牌。

## 用于同步 Tailscale 访问控制策略的 GitLab CI 文件

Tailscale 发布了一个用于[同步 Tailscale 访问控制策略][xt-gitlab-tailscale-gitops-acls]的 GitLab CI 模板，可以引入到你自己的 CI 文件中。

> **注意：**
>
> 你不必使用这个 GitLab CI 模板来搭建 GitOps 模式——你也可以自己编写，或使用其他 CI/CD 工具。

### 此模板做什么

对于目标为 `main` 分支的合并请求，`test` 阶段会把你的 tailnet 策略文件发送到 Tailscale，以确定 ACL 是否有效、所有[测试][docs-policy-syntax-tests]是否通过。Tailscale 会将这些检查的结果提供给你的工作流。

对于目标为 `main` 分支的推送（合并）操作，`apply` 阶段会再次检查访问控制策略的有效性并运行测试，由 Tailscale 将结果回传给你的工作流。如果测试通过，合并会完成，工作流会自动将你的访问控制策略更改应用到你的 tailnet。如果测试失败，会报错并阻止合并继续进行。

你可以在项目的 GitLab CI/CD 标签页查看工作流的状态。寻找名为 `test` 或 `apply` 的任务（job）。

*（图：GitLab CI 工作流界面。列出了 'test' 与 'apply' 任务。）*

### 输入

以下输入适用于 Sync Tailscale ACLs CI。

* **`api-key`**（必填）：一个已针对你的 tailnet 授权的 [API 访问令牌][docs-api]。你可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建 API 访问令牌。

* **`policy-file`**（可选）：你的 tailnet 策略文件在仓库中的路径。如果未设置，默认为仓库根目录下的 `policy.hujson`。

* **`tailnet`**（必填）：这是你的组织（organization），你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面找到它。

## 设置你的 GitOps 配置

1. 在你的 GitLab 仓库中，创建一个名为 `policy.hujson` 的文件。将管理控制台 [Access controls](https://console.tailscale.com/admin/acls) 页面中的 tailnet 策略文件内容复制到该文件中。

   > **注意：**
   >
   > 如果你想把 tailnet 策略文件改成其他名称，需要在下文讨论的 GitLab CI 配置的 `with` 块中添加 `policy-file` 参数。否则，模板会默认使用 `policy.hujson` 作为 tailnet 策略文件。

2. 提交 tailnet 策略文件并推送到 GitLab。例如，如果你使用命令行：

   ```shell
   git add .
   git commit -sm "policy: import from admin console"
   git push -u origin main
   ```

3. 在仓库设置中创建以下 [GitLab CI 机密][xt-gitlab-ci-secrets]：

   * `TS_API_KEY`：值使用你的 Tailscale API 访问令牌。
   * `TS_TAILNET`：值使用你的 tailnet ID。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面找到你的 tailnet ID。

   这些机密为 CI 任务提供配置。对于这两个机密，请在 GitLab CI 机密界面中启用 **Expand variable reference** 选项。有关 GitLab CI 环境变量展开的更多信息，请参阅 [GitLab CI/CD 变量][xt-gitlab-ci-secrets]。

4. 新建一个使用 [Sync Tailscale ACLs][xt-gitlab-tailscale-gitops-acls] 模板的 GitLab CI 任务。

   创建一个名为 `.gitlab-ci.yml` 的文件，并粘贴以下内容：

   ```yaml
   include:
     - project: 'tailscale-dev/gitops-acl-ci'
       ref: main
       file: 'acls.gitlab-ci.yaml'
       inputs:
         api-key: $TS_API_KEY
         tailnet: $TS_TAILNET

   stages:
     - test
     - apply

   test:
     rules:
       - if: '$CI_PIPELINE_SOURCE == "merge_request_event" && $CI_MERGE_REQUEST_TARGET_BRANCH_NAME == $CI_DEFAULT_BRANCH'

   apply:
     rules:
       - if: '$CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
   ```

   该工作流会恰当地使用 `TS_API_KEY` 与 `TS_TAILNET` 环境变量来访问你的机密。

   > **警告：**
   >
   > 不要把你的真实机密*值*放在 `.gitlab-ci.yml` 中——请按示例使用环境变量值。

   有关已设置此工作流的示例，请参阅 [GitLab CI to Sync Tailscale ACLs][xt-gitlab-tailscale-gitops-acls] 仓库。

5. 提交并推送 `.gitlab-ci.yml`。

6. 按照说明在管理控制台中[防止他人意外修改你的 tailnet 策略文件][ar-prevent-edits]。

该 CI 的主要步骤是安装 [gitops-pusher][xt-gh-tailscale-cmd-gitops-pusher]、
设置正确的环境变量与标志，然后运行工作流。更多信息请参阅 [GitLab CI 模板][xt-gitlab-tailscale-gitops-acls-template]。

通过这套设置，你就创建了一个持续集成（CI）流程，可以自动测试 tailnet 策略文件的更改并将其推送到
Tailscale！

## 推送对 tailnet 策略文件的更改

配置设置完成后，只要想更新 tailnet 策略文件，修改仓库中的该文件，然后走 GitLab 常见的编写/审查/合并流程即可。你可以在 GitLab 界面中该拉取请求的 **Actions** 标签页查看访问控制策略有效性检查与测试的状态。寻找名为 `test` 或 `apply` 的任务。

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

## 撤销对 tailnet 策略文件的最近一次更改

如果需要撤销最近一次更改，请使用 GitLab 界面[还原已合并的拉取请求][xt-gitlab-revert-changes]。

## 移除你的 GitOps 配置

1. 打开 Tailscale 管理控制台的 [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) 页面，关闭 **Prevent edits in the admin console** 开关。

2. （可选）删除 **External reference link**，然后选择 **Save**。

3. [吊销][docs-auth-keys-revoke]与此配置关联的所有 Tailscale API 访问令牌。

4. 归档或删除关联的 GitLab 仓库。

## 补充信息

* 在管理控制台中对 tailnet 策略文件所做的任何手动更改，都不会反映到你 GitLab 上的 tailnet 策略文件版本中。下次使用 Sync Tailscale ACLs GitLab CI 时，在 Tailscale 管理控制台中所做的任何更改都会被覆盖。

* Tailscale [API 访问令牌会过期][docs-api-authentication]，目前没有自动续期的机制。要应对过期，请创建新的 API 访问令牌，并更新 GitLab 的 `TS_API_KEY` 机密以使用新值。

  > **警告：**
  >
  > Tailscale API 访问令牌会在 90 天后过期（如果密钥设置了更短的过期时间则更早），但每月更新 GitLab 机密是一个好习惯。
  >
  > 当你不再需要使用某个 Tailscale API 访问令牌时，请务必在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面将其吊销。

* Tailscale tailnet 策略文件采用 [HuJSON][xt-nigeltao-hujson] 格式——一种支持尾随逗号与注释的 JSON 格式。如果你不想直接用 HuJSON 编写 tailnet 策略文件，可以使用能生成与 HuJSON 格式同结构 JSON 的工具。请确保你的工具把文件放在与 GitLab CI 中 `policy-file` 设置相同的位置。

[ar-prevent-edits]: #防止他人意外修改你的-tailnet-策略文件

[co-changelog-gitops]: https://tailscale.com/changelog#2025-06-03

[docs-access-control]: /docs/features/access-control

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-gitops-acls]: /docs/gitops

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#测试tests

[docs-user-roles-permissions-by-roles]: /docs/reference/user-roles#由用户角色管理的权限

[xt-gh-tailscale-cmd-gitops-pusher]: https://github.com/tailscale/tailscale/tree/main/cmd/gitops-pusher

[xt-gitlab-ci-secrets]: https://docs.gitlab.com/ee/ci/variables

[xt-gitlab-get-started]: https://docs.gitlab.com/ee/ci

[xt-gitlab-revert-changes]: https://docs.gitlab.com/ee/user/project/merge_requests/revert_changes.html

[xt-gitlab-tailscale-gitops-acls-template]: https://gitlab.com/tailscale-dev/gitops-acl-ci/-/blob/main/acls.gitlab-ci.yaml

[xt-gitlab-tailscale-gitops-acls]: https://gitlab.com/tailscale-dev/gitops-acl-ci

[xt-nigeltao-hujson]: https://nigeltao.github.io/blog/2021/json-with-commas-comments.html
