---
title: "将 Bitbucket 用于 Tailscale GitOps"
description: "[访问控制策略][docs-access-control]定义了用户或设备在你的 Tailscale 网络（即 tailnet）中允许访问的内容。除了在管理控制台中管理访问控制策略的更改之外，另一种替代方式是使用 GitOps。"
---

最后验证于 Dec 4, 2025

[访问控制策略][docs-access-control]定义了用户或设备在你的 Tailscale 网络（即 tailnet）中允许访问的内容。除了在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面中管理访问控制策略的更改之外，还可以使用 [GitOps][docs-gitops-acls] 来管理这些更改。本主题详细介绍如何使用 [Bitbucket Pipelines][xt-atlassian-bitbucket-pipeline] 自动向你的 tailnet 应用并测试访问控制策略更改。

> **注意：** Tailscale 的 GitOps 功能适用于[所有套餐](https://tailscale.com/pricing)。

## 前提条件

除了已拥有自己的 Tailscale 网络之外，你还需要：

* 一个 [Bitbucket][xt-bitbucket] 账户。
* 熟悉 Bitbucket 的各项操作，包括提交更改、创建拉取请求（pull request）与合并拉取请求。
* 一个私有 Bitbucket 仓库，用于存放你的 tailnet 策略文件。

> **警告：**
>
> 请确保该仓库为私有，因为 tailnet 策略文件包含个人可识别信息（PII），例如用户的电子邮件地址。

* 一个用于你 tailnet 的 Tailscale [API 访问令牌][docs-api]。你可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建 API 访问令牌。

## 设置你的 GitOps 配置

1. 在你的 Bitbucket 仓库中，创建一个名为 `policy.hujson` 的文件。将管理控制台 [Access controls](https://console.tailscale.com/admin/acls) 页面中的 tailnet 策略文件内容复制到该文件中。

> **注意：**
>
> 如果你想把 tailnet 策略文件改成其他名称，需要修改下文讨论的 Bitbucket 流水线中 `gitops-pusher` 二进制所使用的 `--policy-file` 参数。

1. 提交 tailnet 策略文件并推送到 Bitbucket。例如，如果你使用命令行：

   ```shell
   git add .
   git commit -sm "policy: import from admin console"
   git push -u origin main
   ```

2. 在仓库的 **Repository variables** 设置中，创建以下 [Bitbucket 安全变量][xt-atlassian-bitbucket-secured-variables]：

   * `TS_API_KEY`：值使用你的 Tailscale API 访问令牌。
   * `TS_TAILNET`：值使用你的 tailnet ID。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面找到你的 tailnet ID。

   这些机密为流水线提供配置。

3. 新建一个使用 [`gitops-pusher`][xt-gh-tailscale-cmd-gitops-pusher] 二进制的 [Bitbucket Pipelines][xt-atlassian-bitbucket-pipeline] 流水线。

   在 `Source` 文件夹中创建一个名为 `bitbucket-pipelines.yml` 的文件，并粘贴以下内容：

   ```yaml
   image: golang

   pipelines:
     default:
        - step:
            name: Test ACL
            script:
              - go install tailscale.com/cmd/gitops-pusher@latest
              - gitops-pusher --policy-file ./policy.hujson test
     branches:
       main:
         - step:
             name: Deploy ACL
             script:
               - go install tailscale.com/cmd/gitops-pusher@latest
               - gitops-pusher --policy-file ./policy.hujson apply
   ```

   有关 Bitbucket Pipelines 选项与属性的信息，请参阅 [Bitbucket Pipelines 配置参考][xt-atlassian-bitbucket-pipeline-ref]。

4. 提交并推送 `bitbucket-pipelines.yml`。

5. 按照说明在管理控制台中[防止他人意外修改你的 tailnet 策略文件][ar-prevent-edits]。

流水线的主要步骤是安装并构建 `gitops-pusher` 二进制，然后运行该二进制。在拉取请求上，`Test ACL` 步骤会把你的 tailnet 策略文件发送到 Tailscale，以确定访问控制策略是否有效、所有[测试][docs-policy-syntax-tests]是否通过。Tailscale 会将这些检查的结果提供给流水线，结果显示在 Bitbucket 的 **Pipelines** 页面。

对于目标为 `main` 分支的推送（合并）操作，`Deploy ACL` 步骤会把你的 tailnet 策略文件发送到 Tailscale，以确定 tailnet 策略文件是否有效、所有[测试][docs-policy-syntax-tests]是否通过。如果这一步成功，Tailscale 随即会将你的 tailnet 策略文件更新应用到你的 tailnet。Tailscale 会将这一步的结果提供给流水线，结果显示在 Bitbucket 的 **Pipelines** 页面。

通过这套设置，你就创建了一个持续集成（CI）流程，可以自动测试 tailnet 策略文件的更改并将其推送到 Tailscale！

## 推送对 tailnet 策略文件的更改

配置设置完成后，只要想更新 tailnet 策略文件，修改仓库中的该文件，然后走 Bitbucket 常见的编写/审查/合并流程即可。

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

如果需要撤销最近一次更改，请使用 Bitbucket 的 **Pull requests** 页面找到已合并的拉取请求并将其还原。

## 移除你的 GitOps 配置

1. 打开 Tailscale 管理控制台的 [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) 页面，关闭 **Prevent edits in the admin console** 开关。

2. （可选）删除 **External reference link**，然后选择 **Save**。

3. [吊销][docs-auth-keys-revoke]与此配置关联的所有 Tailscale API 访问令牌。

4. 归档或删除关联的 Bitbucket 仓库。

## 补充信息

* 在管理控制台中对 tailnet 策略文件所做的任何手动更改，都不会反映到你 Bitbucket 上的 tailnet 策略文件版本中。下次运行 Bitbucket 流水线时，在 Tailscale 管理控制台中所做的任何更改都会被覆盖。

* Tailscale [API 访问令牌会过期][docs-api-authentication]，目前没有自动续期的机制。要应对过期，请创建新的 API 访问令牌，并更新 Bitbucket 的 `TS_API_KEY` 机密以使用新值。

  > **警告：**
  >
  > Tailscale API 访问令牌会在 90 天后过期（如果密钥设置了更短的过期时间则更早），但每月更新 Bitbucket 机密是一个好习惯。
  >
  > 当你不再需要使用某个 Tailscale API 访问令牌时，请务必在 Tailscale 管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面将其吊销。

* Tailscale tailnet 策略文件采用 [HuJSON][xt-nigeltao-hujson] 格式——一种支持尾随逗号与注释的 JSON 格式。如果你不想直接用 HuJSON 编写 tailnet 策略文件，可以使用能生成与 HuJSON 格式同结构 JSON 的工具。

[ar-prevent-edits]: #防止他人意外修改你的-tailnet-策略文件

[co-changelog-gitops]: https://tailscale.com/changelog#2025-06-03

[docs-access-control]: /docs/features/access-control

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-gitops-acls]: /docs/gitops

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#测试tests

[docs-user-roles-permissions-by-roles]: /docs/reference/user-roles#由用户角色管理的权限

[xt-atlassian-bitbucket-pipeline-ref]: https://support.atlassian.com/bitbucket-cloud/docs/bitbucket-pipelines-configuration-reference

[xt-atlassian-bitbucket-pipeline]: https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines

[xt-atlassian-bitbucket-secured-variables]: https://support.atlassian.com/bitbucket-cloud/docs/variables-and-secrets/#Secured-Variables

[xt-bitbucket]: https://bitbucket.org

[xt-gh-tailscale-cmd-gitops-pusher]: https://github.com/tailscale/tailscale/tree/main/cmd/gitops-pusher

[xt-nigeltao-hujson]: https://nigeltao.github.io/blog/2021/json-with-commas-comments.html
