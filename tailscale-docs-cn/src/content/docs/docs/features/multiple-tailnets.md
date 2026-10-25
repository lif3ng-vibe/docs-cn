---
title: "管理多个 tailnet"
description: "在单一组织下管理多个 tailnet。"
---

最后验证于 Feb 4, 2026

你可以在单一组织下、使用共同的身份提供方和域名创建多个 Tailscale 网络（即 tailnet）。

> **注意：**多 tailnet 功能目前处于 alpha 阶段。

> **注意：**
>
> 要为你的组织创建多个 tailnet，请联系我们的[销售][co-contact-sales]团队。

*（图：一个组织包含其域名下的一个 tailnet，并且可以包含其他 tailnet。）*

包含多个 tailnet 的组织。

> **注意：**
>
> 所有新增的 tailnet 都必须使用与你现有 tailnet 相同的域名和身份提供方。将来，Tailscale 会允许你的组织中的身份提供方与域名任意组合。

## 创建其他 tailnet

目前，用户无法以自助方式创建其他 tailnet。请联系你的客户经理或解决方案工程师，由其代你创建其他 tailnet。你需要提供：

* 你希望的其他 tailnet 的[显示名称][docs-display-name]。之后你可以更改此显示名称。
  * 显示名称最多 65 个字符，可以包含字母、数字、空格、单引号和连字符。不能使用句点或下划线。
* 应被指定为该其他 tailnet 的 Owner 的用户的邮箱地址。该用户必须是你当前 tailnet 中的现有用户。
* 该 tailnet 是否对尚未加入的用户显示（列出）。

## 访问其他 tailnet 的管理控制台

> **危险：**
>
> **你组织中的所有用户**都将能够加入所创建的其他 tailnet。如果你想限制谁能加入其他 tailnet，必须为该 tailnet 开启[用户审批][docs-user-approval]。将来，Tailscale 会引入细粒度的访问规则来确定允许哪些用户加入其他 tailnet。
>
> [docs-user-approval]: /docs/features/access-control/user-approval

### 登录时选择其他 tailnet

*（图：Tailscale 认证流程示例，让用户从其用户登录可访问的多个 tailnet 中选择。所列 tailnet 为 Example tailnet 1 和 Example tailnet 2。"Join a tailnet"输入框中包含第三个 tailnet：Example tailnet 3。）*

在本示例中，Amelie 总共可以访问三个 tailnet，但只加入了 Example tailnet 1 和 Example tailnet 2。

登录 Tailscale 时，如果你的组织拥有多个 tailnet，你会进入一个 tailnet 选择器，从中选择你想登录的 tailnet。

你尚未加入的其他 tailnet 会显示在该选择器底部，除非它们被标记为不列出（unlisted）。

### 从管理控制台切换到其他 tailnet

*（图：Tailscale 管理控制台，用户头像下方的用户菜单已展开。列出用户可切换到的其他 tailnet，以及加入其他 tailnet 的选项。）*

要在你组织各 tailnet 的管理控制台之间切换，选择管理控制台右上角的头像，然后从下拉框中选择正确的 tailnet。

只会显示你已加入的 tailnet。要加入其他 tailnet，选择 **Join additional tailnets**。

## 向你的其他 tailnet 添加设备

### 通过身份提供方认证设备

为你的组织创建其他 tailnet 后，它会在设备认证流程中显示为一个选项。选择你想要添加设备的 tailnet。

### 使用认证密钥认证设备

使用认证密钥向其他 tailnet 添加设备的步骤没有变化。登录该 tailnet 的管理控制台或切换到该 tailnet 的控制台，然后按照[创建认证密钥的标准步骤][docs-auth-keys]操作。

## 用户与群组预配

如果你在组织中的任意 tailnet 中启用了[群组同步][docs-provisioning]，你就可以在该组织每个 tailnet 的[访问控制策略][docs-access-control]中引用这些群组。

如果你需要更改预配设置，只能在启用预配的原始 tailnet 上进行。所有其他 tailnet 对可在其[访问控制策略][docs-access-control]中引用的群组只有只读权限。

> **注意：**
>
> 预配用户尚未在组织的所有 tailnet 之间同步。自动预配到原始 tailnet 的用户仍需
> 手动加入其他 tailnet。

### 访问控制策略示例

可以逐个 tailnet 控制[每个 tailnet 的策略文件][docs-tailnet-policy-file]中哪些群组可以访问哪些资源。例如：

* 在 **tailnet 1** 中，允许 `group1@example.com` 访问 `tag:staging:443` 资源，但不允许 `group2@example.com`，并用一个[测试][docs-acl-tests]来强制执行：

  ```json
  {
    "grants": [
      {
        // allow `group1` to access `tag:staging:443`
        "src": ["group1@example.com"],
        "dst": ["tag:staging"],
        "ip": ["443"]
      }
    ],
    "tests": [
      {
        // deny `group2` access to `tag:staging:443`
        "src": "group2@example.com",
        "deny": ["tag:staging:443"]
      }
    ]
  }
  ```

  \[缺少代码片段：visual\_policy\_editor.mdx]

* 在 **tailnet 2** 中，允许 `group2@example.com` 访问 `tag:production:443` 资源，但不允许 `group1@example.com`，并用一个[测试][docs-acl-tests]来强制执行：

  ```json
  {
    "grants": [
      {
        // allow `group2` to access `tag:production:443`
        "src": ["group2@example.com"],
        "dst": ["tag:production"],
        "ip": ["443"]
      }
    ],
    "tests": [
      {
        // deny `group1` access to `tag:production:443`
        "src": "group1@example.com",
        "deny": ["tag:production:443"]
      }
    ]
  }
  ```

  \[缺少代码片段：visual\_policy\_editor.mdx]

## 取消列出 tailnet

如果你的组织有多个 tailnet，你可能希望防止用户看到他们尚未加入的 tailnet。取消列出（unlist）某个 tailnet 会在登录时的 tailnet 选择器中，对该 tailnet 未加入的用户隐藏它，不过用户仍可以通过在 tailnet 选择器 URL 中以查询参数引用该 tailnet 来加入。要取消列出某个 tailnet，请联系你的客户经理或解决方案工程师。

### 向用户授予访问未列出 tailnet 的权限

用户仍可以在指向 tailnet 选择器的链接中，添加带 [tailnet ID][docs-tailnet-id] 的 `tailnet` 查询参数来加入未列出的 tailnet。这会让该未列出的 tailnet 显示在 tailnet 选择器界面中。

例如，如果你有一个 tailnet ID 为 "T123456789CNTRL" 的未列出 tailnet，用户可以通过在 tailnet 选择器 URI 中添加 tailnet 查询参数来加入：

```
https://login.tailscale.com/switch-tailnet?tailnet=T123456789CNTRL
```

## 限制

* **你组织中的所有用户**都将能够加入所创建的其他 tailnet。如果你想限制谁能加入其他 tailnet，必须为该 tailnet 开启[用户审批][docs-user-approval]。将来，Tailscale 会引入细粒度的访问规则来确定允许哪些用户加入其他 tailnet。

  [docs-user-approval]: /docs/features/access-control/user-approval
* 所有新增的 tailnet 都必须使用与你现有 tailnet 相同的域名和身份提供方。将来，Tailscale 会允许你的组织中的身份提供方与域名任意组合。
* 允许 **Everyone** [加入外部 tailnet][docs-invite-any-user-join-external-tailnets]，让用户可以加入其他 tailnet。你仍然可以使用[用户与群组预配][ar-user-and-group-provisioning]来控制哪些群组和用户可以访问每个 tailnet 内的资源。
* 用于[身份认证][docs-provisioning]的 GitHub 组织账户不能用于启用或创建多个 tailnet。

[ar-user-and-group-provisioning]: #用户与群组预配

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-access-control]: /docs/features/access-control

[docs-acl-tests]: /docs/reference/syntax/policy-file#tests

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-display-name]: /docs/concepts/tailnet-name#display-name

[docs-invite-any-user-join-external-tailnets]: /docs/features/sharing/how-to/invite-any-user#enable-or-disable-joining-external-tailnets

[docs-provisioning]: /docs/features/user-group-provisioning

[docs-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file
