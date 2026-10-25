---
title: "Microsoft Entra ID 的用户与群组预配置"
description: "Tailscale 支持跨域身份管理系统（SCIM），可与 Microsoft Entra ID（前称 Azure AD）集成。"
---

最后验证于 Jul 6, 2026

> **注意：** 此功能适用于[标准版、高级版和企业版套餐](https://tailscale.com/pricing)。

Tailscale 支持跨域身份管理系统（SCIM），可与 Microsoft Entra ID（前称 Azure AD）集成。

* 通过群组同步，你可以在 tailnet 策略文件中使用易读名称引用来自 Microsoft Entra ID 的群组。
  * 也可以在 tailnet 策略文件中使用 `externalGroupId` 引用来自 Microsoft Entra ID 的群组。

* 通过用户同步，你可以快速将用户接入或移出 Tailscale。相关信息参见[使用用户与群组预配置时的用户移除][docs-offboarding-users-offboarding-scim]。
  * 当用户在 Microsoft Entra ID 中被删除时，会先被"软删除"（soft delete）[xt-entra-incremental-cycles]，该用户随之在 Tailscale 中被[暂停][docs-remove-team-members-suspending-users]。约 30 天后，该用户会在 Microsoft Entra ID 中被"硬删除"（hard delete），从而在 Tailscale 中也被[删除][docs-remove-team-members-deleting-users]。
  * 当用户在 Microsoft Entra ID 中被禁用时，该用户在 Tailscale 中会被暂停。

本主题介绍如何将 Microsoft Entra ID 设置为与 Tailscale 进行 SCIM 集成的身份提供方。你也可以参考 Microsoft 教程[配置 Tailscale 以自动进行用户预配置][xt-entra-tailscale-provisioning]。

## 功能

支持以下预配置功能：

* **创建用户**：从 Microsoft Entra ID 在 Tailscale 中创建
* **更新用户属性**：从 Microsoft Entra ID 更新 Tailscale 中的用户属性
* **删除用户**：在 Microsoft Entra ID 中删除用户会先将其在 Tailscale 中暂停；约 30 天后自动从 Tailscale 中删除
* **禁用用户**：在 Microsoft Entra ID 中禁用用户会将其在 Tailscale 中暂停
* **群组推送**：从 Microsoft Entra ID 推送到 Tailscale

## 要求

* 你需要 Microsoft Entra ID 订阅。
* 你需要一个 tailnet。
* 你的 tailnet 的身份提供方必须是 Microsoft Entra ID。如果你的 tailnet 目前未使用 Microsoft Entra ID 且想改用它，请[联系支持团队][co-contact-support-sso]，将你当前的身份提供方迁移到 Microsoft Entra ID。

## 分步配置说明

### 启用预配置

#### 在 Tailscale 中

完成这些步骤需要你是 Tailscale 中的[所有者（Owner）、管理员（Admin）或 IT 管理员（IT admin）](/docs/reference/user-roles)。

**生成 SCIM API 密钥**

1. 在管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面中，在 **SCIM Provisioning** 下选择 **Enable Provisioning**。

2. 将生成的密钥复制到剪贴板。

   *（图：生成 SCIM API 密钥）*

3. 将密钥信息保存在安全的地方。配置 Microsoft Entra ID 时需要用到。注意，Tailscale 生成的 SCIM API 密钥区分大小写。

#### 在 Microsoft Entra ID 中

完成这些步骤需要你拥有 Microsoft Azure 门户的管理员角色。

1. 登录 [Microsoft Azure 门户][xt-azure-login]。

2. 选择 **Microsoft Entra ID**。

3. 在左侧导航的 **Manage** 下选择 **Enterprise applications**。

4. 选择 **New application**。

5. 在 **Browse Microsoft Entra Gallery** 页面中搜索 **Tailscale**，然后选择 **Tailscale**。

6. 选择 **Sign up for Tailscale**。

   你将被重定向到 Tailscale 注册页面。如果你已有 Tailscale 账户，直接进行下一步；否则按照提示完成 Tailscale 注册。

7. 在应用程序的 **Overview** 页面中，在左侧导航的 **Manage** 下选择 **Provisioning**。

8. 选择 **Get started**。

9. 将 **Provisioning Mode** 设置为 **Automatic**。

10. 在 **Admin Credentials** 下，**Tenant URL** 输入
    `https://controlplane.tailscale.com/scim/v2/?aadOptscim062020`。

    注意，末尾的参数 `?aadOptscim062020` 是必需的。关于此参数的信息，参见 Microsoft Entra ID 文档中的 [Flags to alter the SCIM behavior][xt-entra-add-scim-flags] 一文。

11. **Secret Token** 输入你在 Tailscale 管理控制台中生成的 SCIM API 密钥。

    *（图：向 Microsoft Entra ID 提供凭证）*

12. 选择 **Test Connection**。

    弹窗会显示一条消息，说明你提供的凭证是否有权启用预配置。

13. 在 **Settings** 区域，确保已勾选 **Send an email notification when
    an error occurs**，并提供用于接收通知的电子邮件地址。

14. 在 **Settings** 区域的 **Scope** 下，选择同步所有用户和群组，还是仅同步已分配该应用程序的用户和群组。如果选择仅同步已分配该应用程序的用户和群组，你需要在左侧导航的 **Users and groups** 区域[进行分配][xt-entra-assign-access]。

15. 确保 **Provisioning Status** 设置为 **On**。

    *（图：预配置 Microsoft Entra ID）*

16. 选择 **Save**。

17. 返回应用程序的 **Provisioning** 页面。在顶部菜单中选择 **Start Provisioning**。

如果预配置完成后遇到问题，请打开应用程序的 **Overview** 页面，然后选择
**Restart Provisioning**。

#### 限制对 Tailscale 应用程序的访问

默认情况下，Entra 目录服务中的所有用户都可以访问 Tailscale 应用。
要控制哪些用户可以访问 Tailscale，请前往 **Enterprise Applications** >
**Tailscale** > **Properties**，并将 **Assignment Required?** 设置为 Yes。

*（图：Assignment Required?（需要分配）开关）*

启用此设置后，只有被分配到 Tailscale 应用程序的用户才能访问它。

#### 支持的属性映射

Tailscale 支持核心 ["User"][xt-rfc-7643-4.1] 和 ["Group" SCIM 资源][xt-rfc-7643-4.2]中的 SCIM 属性。Tailscale 只将以下属性用于自身功能；其他属性仅存储、不使用：

| 属性                | SCIM 属性类型        | 在 Tailscale 中的用途 |
| ------------------- | ------------------- | ---------------- |
| `externalId`        | 通用                 | 必需             |
| `userName`          | 核心用户             | 必需             |
| `emails`            | 核心用户             | 可选             |
| `name.givenName`    | 核心用户             | 可选             |
| `name.familyName`   | 核心用户             | 可选             |
| `name.formatted`    | 核心用户             | 可选             |
| `displayName`       | 核心用户             | 可选             |
| `active`            | 核心用户             | 可选             |
| `preferredLanguage` | 核心用户             | 可选             |

`userName` 必须映射到用户登录 tailnet 所用的电子邮件地址。

`photos` 不是可同步的属性，而是在用户登录时为其填充。

Tailscale 不支持 SCIM [Enterprise User Schema Extension][xt-rfc-7643-4.3]。如果指定了这些扩展中的任何额外用户属性，请求将失败。

### 在 tailnet 策略文件中引用 Microsoft Entra ID 群组

你可以在 tailnet 策略文件中使用易读名称或 Microsoft Entra ID 群组 ID 来引用来自 Microsoft Entra ID 的群组。例如：

```json
{
  "grants": [
    {
      "src": ["group:groupname@example.com"],
      "dst": ["*"],
      "ip": ["*"]
    },
    {
      "src": ["group:all employees@example.com"],
      "dst": ["autogroup:self"],
      "ip": ["*"]
    },
    {
      "src": ["group:3ac067a2-f424-87b0-14a3-926482d83980@example.com"],
      "dst": ["tag:logging"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

当 Microsoft Entra ID 群组包含[嵌套群组][xt-entra-nested-groups]时，在访问控制中使用该群组时，Tailscale 会纳入这些嵌套群组中最深 5 层子群组的成员。超过 5 层嵌套的成员不会被纳入。

#### 更新 Microsoft Entra ID 群组名称

如果你在 tailnet 策略文件中使用的是群组名称（而非群组 ID），并且在 Microsoft Entra ID 中更改了群组名称，该群组的 Tailscale 访问规则将不再生效。Tailscale 会进入失败关闭（fail closed）状态，你会在管理控制台中收到错误消息。

如果你修改了群组名称，请将 tailnet 策略文件中的该群组更新为新的群组名称。如果这是误操作，你也可以在 Microsoft Entra ID 中撤销名称更改。

如果你在 tailnet 策略文件中使用的是群组 ID，重命名群组不会影响该群组的 Tailscale 访问规则。

### 停用预配置

完成这些步骤需要你拥有 Microsoft Azure 门户的管理员角色。

#### 在 Microsoft Entra ID 中

1. 登录 [Microsoft Azure 门户][xt-azure-login]。
2. 选择 **Microsoft Entra ID**。
3. 在左侧导航的 **Manage** 下选择 **Enterprise applications**。
4. 搜索 **Tailscale** 应用程序并选中它。
5. 在 **Manage** 下选择 **Properties**。
6. 选择 **Delete**，然后选择 **Yes**。

#### 在 Tailscale 中

1. 在管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面中，在 **SCIM Provisioning** 下选择 **Disable provisioning**，然后再次选择 **Disable provisioning** 以确认。

2. 在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面中，更新你的规则，移除对不再推送的群组的引用。

3. 如果你不再想保留用于 Microsoft Entra ID 的 SCIM API 密钥，请[吊销该密钥][docs-auth-keys-revoke]。

### 已知限制

* Microsoft Entra ID 每 40 分钟与 Tailscale 同步一次。这是 [Microsoft Entra ID 的限制][xt-entra-sync-time]，你无法更改此间隔。要强制同步某个用户（例如作为用户移除流程的一部分），请使用 Microsoft Entra ID 的[按需预配置（on-demand provisioning）][xt-entra-on-demand]。这样应在 30 秒内完成该用户的同步。
* Microsoft Entra ID 将用户从"软删除"到"硬删除"大约需要 30 天。你无法更改此间隔。
* 当用户从"软删除"恢复为活跃状态时，Microsoft Entra ID [不会自动恢复动态成员身份群组][xt-entra-deprovisioning]条目。如果这造成了问题，你可以在 Entra ID 的应用预配置页面选择 **Restart provisioning** 强制刷新。
* Tailscale 不支持 SCIM [Enterprise User Schema Extension][xt-rfc-7643-4.3]。如果指定了这些扩展中的任何额外用户属性，请求将失败。
* Tailscale 在 tailnet 策略文件中将群组解析为小写，因此 Microsoft Entra ID 中的任何大小写形式都会被忽略。
* 来自 Microsoft Entra ID 的群组不能包含 `@` 符号。
* 如果你在 tailnet 策略文件中引用的是群组名称，那么群组名称更改后，该群组的访问控制策略将不再生效，Tailscale 会进入失败关闭状态。如果你在 tailnet 策略文件中使用的是群组 ID，重命名群组不会影响该群组的 Tailscale 访问规则。
* 在 Microsoft Entra ID 中被取消关联、但保留在 Tailscale 中的群组，不会被同步到 Tailscale。
* 你不能使用群组同步来指派 Tailscale 管理员或其他[用户角色][docs-user-roles]。

[co-contact-support-sso]: https://tailscale.com/contact/support/?type=sso

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-offboarding-users-offboarding-scim]: /docs/features/sharing/how-to/offboard#offboarding-when-using-user--group-provisioning-scim

[docs-remove-team-members-deleting-users]: /docs/features/sharing/how-to/remove-team-members#deleting-users

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#suspending-users

[docs-user-roles]: /docs/reference/user-roles

[xt-azure-login]: https://portal.azure.com

[xt-entra-add-scim-flags]: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/application-provisioning-config-problem-scim-compatibility#flags-to-alter-the-scim-behavior

[xt-entra-assign-access]: https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/assign-user-or-group-access-portal?pivots=portal

[xt-entra-deprovisioning]: https://learn.microsoft.com/en-us/entra/identity/app-provisioning/how-provisioning-works#deprovisioning

[xt-entra-incremental-cycles]: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/how-provisioning-works#incremental-cycles

[xt-entra-nested-groups]: https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-groups#add-a-group-to-another-group

[xt-entra-on-demand]: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/provision-on-demand

[xt-entra-sync-time]: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/application-provisioning-when-will-provisioning-finish-specific-user#how-long-will-it-take-to-provision-users

[xt-entra-tailscale-provisioning]: https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/tailscale-provisioning-tutorial

[xt-rfc-7643-4.1]: https://www.rfc-editor.org/rfc/rfc7643.html#section-4.1

[xt-rfc-7643-4.2]: https://www.rfc-editor.org/rfc/rfc7643.html#section-4.2

[xt-rfc-7643-4.3]: https://www.rfc-editor.org/rfc/rfc7643.html#section-4.3
