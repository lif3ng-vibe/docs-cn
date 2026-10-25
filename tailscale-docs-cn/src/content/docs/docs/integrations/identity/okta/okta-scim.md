---
title: "Okta 的用户与群组预配置"
description: "Tailscale 支持跨域身份管理系统（SCIM），可与 Okta 集成。"
---

最后验证于 Jan 5, 2026

> **注意：** 此功能适用于[标准版、高级版和企业版套餐](https://tailscale.com/pricing)。

Tailscale 支持跨域身份管理系统（SCIM），可与 Okta 集成。

## 功能

支持以下预配置功能：

* **创建用户**：从 Okta 在 Tailscale 中创建
* **更新用户属性**：从 Okta 更新 Tailscale 中的用户属性
* **停用用户**：在 Okta 中停用用户会将其在 Tailscale 中暂停
* **群组推送**：从 Okta 推送到 Tailscale

## 要求

* 从
  [Okta Integration Network][xt-okta-integrations-tailscale] 安装 Tailscale 应用，并[进行配置][docs-sso-okta]以在你的域名上激活 Okta。

  如果你通过[自定义应用集成][xt-okta-docs-custom-app]使用 Tailscale，则需要将该配置替换为 Tailscale 应用及其配置。
* 你必须使用 **Email** 作为 **Application username format**，并且每个 Okta 用户的主电子邮箱必须与其应用用户名一致。否则将导致错误。

## 分步配置说明

使用以下步骤在 Tailscale 中启用预配置。

### 启用预配置

#### 在 Tailscale 中

**生成 SCIM API 密钥**

1. 在管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面中，在 **SCIM Provisioning** 下选择 **Enable Provisioning**。

   *（图：为 Okta 启用预配置）*

2. 将生成的密钥复制到剪贴板。

   *（图：生成 SCIM API 密钥）*

#### 在 Okta 中

**将密钥复制到 Tailscale 应用中**

1. （可选）在 **Sign On** 标签页的 **Advanced Sign-on Settings** 中，选择要连接的 Tailscale 实例。对大多数用户而言，保持默认选项 **Tailscale** 选中即可。如果你需要连接美国高合规服务器，请选择 **Tailscale (US high compliance) – must be allowlisted**，并填写支持表单中的 [Identity provider configuration or change][co-contact-support-sso] 部分。

   *（图：选择 Tailscale 实例）*

2. 在 **Provisioning** 标签页中，选择 **Integration**，然后选择 **Configure API Integration**。

   *（图：在 Okta 管理界面中配置 SCIM API 集成）*

3. 选择 **Enable API integration**。将生成的密钥粘贴到 API Token 字段中。注意，Tailscale 生成的 SCIM API 密钥区分大小写。

   *（图：使用 Tailscale SCIM API 密钥启用 SCIM API 集成）*

4. 如果存在 **Import Groups** 复选框，请取消勾选。

5. 选择 **Test API Credentials** 验证 SCIM 连接，然后选择 **Save**。

### 启用用户同步

1. 在 Okta 中，在 **Sign On** > **Credential Details** 下，选择 **Email** 作为 **Application username format**。

   *（图：在 Okta 管理界面中选择 Email 作为应用用户名格式）*

2. 在 **Provisioning** > **Settings** > **To App** 下，选择启用 **Create Users**、**Update User Attributes**、
   **Deactivate Users**，然后选择 **Save**。

   *（图：在 Okta 管理界面中启用用户同步功能）*

3. 在 **Assignments** 下，选择 **Provision User**，确保之前分配到该应用的所有用户都已在 Tailscale 中完成预配置。

   *（图：在 Tailscale 中预配置用户）*

### 启用群组同步

通过群组同步，你可以在 tailnet 策略文件中使用易读名称引用来自 Okta 的群组。例如：

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["group:groupname@example.com"],
      "dst": ["*:*"]
    },
    {
      "action": "accept",
      "src": ["group:all employees@example.com"],
      "dst": ["autogroup:self:*"]
    },
    {
      "action": "accept",
      "src": ["group:engineering@example.com"],
      "dst": ["tag:logging:*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

从 Okta 同步的群组不会替换 Tailscale 中的群组。你可以使用 Okta 群组同步，同时在 tailnet 策略文件中定义群组。

#### 在 Okta 中

1. 在 **Applications** 下，选择 Tailscale 应用。

2. 在 **Push Groups** 下，展开 **Push Groups** 按钮，并选择要推送到 Tailscale 的群组。

   *（图：在 Okta 管理界面中启用群组同步）*

3. 选择 **Save**，如果想推送另一个群组，则选择 **Save & Add Another**。

实践中，Okta 中群组的更改通常会在几秒内反映到 Tailscale，但这并没有保证。

#### 在 Tailscale 中

在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面中，你应当能在 **Group Sync** 下找到从 Okta 推送的群组。

*（图：在 Tailscale 访问控制界面中同步群组）*

要在[访问规则][docs-access-control]中使用推送的群组，可以选择 **Copy** 后粘贴到规则中，也可以直接输入：

```json
"grants": [
  {
    "src": ["group:engineering@example.com"],
    "dst": ["tag:logging"],
    "ip": ["*"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

同步的群组名称会被视为小写。名称可以包含空格，但不能包含 `@` 符号。

#### 更新 Okta 群组名称

如果你在 Okta 中更改了群组名称，该群组的 Tailscale 访问控制策略将不再生效。访问控制策略依赖于你在 Okta 中配置的名称，而不是群组引用。Tailscale 会进入失败关闭（fail closed）状态，你会在管理控制台中看到错误消息。

*（图：群组未同步时界面中的错误消息）*

如果你修改了群组名称，请将[访问控制策略][docs-access-control]中的该群组更新为新的群组名称。如果这是误操作，你也可以在 Okta 中撤销名称更改。

### 停用群组同步

#### 在 Okta 中

1. 在 **Applications** 下，选择 Tailscale 应用。

2. 在 **Push Groups** 下，展开 **Push Groups** 按钮，取消选择不再想推送到
   Tailscale 的群组，然后选择 **Save**。

#### 在 Tailscale 中

1. 在管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面中，在 **SCIM Provisioning** 下选择 **Disable provisioning**，然后再次选择 **Disable provisioning** 以确认。

2. 在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面中，更新你的规则，移除对不再推送的群组的引用。

3. 如果你不再想保留用于 Okta 的 SCIM API 密钥，请[吊销该密钥][docs-auth-keys-revoke]。

### 已知限制

* 如果你在 2021 年 11 月之前将 Okta 配置为 Tailscale 的身份提供方，则需要重新配置你的身份提供方。要使用用户与群组预配置，请在 Okta 中使用新版 Tailscale 应用。
* 你必须在 Okta 中为 Tailscale 使用 **Email** 作为 **Application username format**。
* Tailscale 在 tailnet 策略文件中将群组解析为小写，因此 Okta 中的任何大小写形式都会被忽略。
* 来自 Okta 的群组不能包含 `@` 符号。
* 如果群组名称发生更改，该群组的访问控制策略将不再生效，Tailscale 会进入失败关闭状态。推荐的处理方式参见
  [更新 Okta 群组名称][ar-updating-okta-group-names]。
* 在 Okta 中被[暂停][xt-okta-docs-suspend-users]的用户不会同步到 Tailscale。只有在 Okta 中被[停用][xt-okta-docs-deactivate-users]或[取消分配 Tailscale 应用][xt-okta-docs-unassign-users]的用户，才会在 Tailscale 中被[暂停][docs-remove-team-members-suspending-users]。
  * 在 Okta 中被暂停的用户将保持登录 Tailscale 的状态，并保留对其所有节点以及访问控制策略所授予权限的访问。只有当其设备密钥过期、且无法通过 Okta 重新认证新会话时，才会失去访问权限。
* 在 Okta 中[解除链接但仍保留在 Tailscale 中的群组][xt-okta-docs-group-push]，以及[从群组推送中停用的群组][xt-okta-docs-push-groups]，都不会同步到 Tailscale。
* 你不能使用群组同步来指派 Tailscale 管理员或其他[用户角色][docs-user-roles]，它只能管理访问控制策略中的权限。

[ar-updating-okta-group-names]: #更新-okta-群组名称

[co-contact-support-sso]: https://tailscale.com/contact/support/?type=sso

[docs-access-control]: /docs/features/access-control

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#停用用户

[docs-sso-okta]: /docs/integrations/identity/okta

[docs-user-roles]: /docs/reference/user-roles

[xt-okta-docs-custom-app]: https://help.okta.com/en-us/Content/Topics/Apps/Apps_App_Integration_Wizard.htm

[xt-okta-docs-deactivate-users]: https://help.okta.com/en/prod/Content/Topics/users-groups-profiles/usgp-deactivate-user-account.htm

[xt-okta-docs-group-push]: https://help.okta.com/en/prod/Content/Topics/users-groups-profiles/usgp-group-push-operations.htm

[xt-okta-docs-push-groups]: https://help.okta.com/oie/en-us/Content/Topics/users-groups-profiles/usgp-enable-group-push.htm

[xt-okta-docs-suspend-users]: https://help.okta.com/en/prod/Content/Topics/users-groups-profiles/usgp-suspend.htm

[xt-okta-docs-unassign-users]: https://help.okta.com/en/prod/Content/Topics/users-groups-profiles/usgp-unassign-apps.htm

[xt-okta-integrations-tailscale]: https://www.okta.com/integrations/tailscale
