---
title: "可视化策略编辑器"
description: "使用可视化策略编辑器更新你的 tailnet 策略文件。"
---

最后验证于 Mar 13, 2026

可视化策略编辑器是一种通过交互式图形用户界面编辑 tailnet 策略文件[人类可读 JSON（HuJSON）][xt-gh-hujson]语法的替代方式。你可以随时在可视化编辑器和 JSON 编辑器之间切换。使用可视化编辑器所做的更改会在保存时同步到 JSON 编辑器。

你可以使用可视化策略编辑器编辑以下 tailnet 策略文件功能：

* 访问控制策略（[授权（grant）][docs-grants]）
* [Tailscale SSH][docs-tailscale-ssh] 访问规则
* [测试][docs-policy-syntax-tests]与 [SSH 测试][docs-policy-syntax-tests-ssh]
* [群组][docs-policy-syntax-groups]
* [标签（tag）][docs-tags]
* [IP 集][docs-policy-syntax-ipsets]
* [主机][docs-policy-syntax-hosts]
* [节点属性][docs-policy-syntax-nodeattrs]
* [设备态势（device posture）][docs-device-posture-postures]
* [自动审批][docs-policy-syntax-autoapprovers]

> **注意：**
>
> 要修改 tailnet 策略的[网络策略选项][docs-policy-syntax-network-options]（例如 `derpMap`、`disableIPv4`、`OneCGNATRoute` 和 `randomizeClientPort`），你必须使用 JSON 编辑器。

可视化编辑器会把你的配置选择转换为底层的 HuJSON 策略文件格式。你可以随时在可视化编辑器和 JSON 编辑器之间切换，以最适合你需要的方式处理策略。双向同步确保任一编辑器中的更改都会立即反映到另一个编辑器。要全面了解底层策略语法，请参阅 [Tailscale 策略语法文档][docs-policy-syntax]。

前往 Tailscale 管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面即可使用可视化编辑器。编辑器默认选中 **Visual editor** 标签页显示。

## 编辑器模式

可视化策略编辑器支持三种不同的操作模式，对应不同的工作流偏好和需求。每种模式都与底层[策略文件格式][docs-policy-syntax]完全兼容，同时提供不同的交互方式。

* **Visual editor** 让你通过图形用户界面以交互方式管理策略。所有更改都会立即同步到底层的 JSON 表示。当你需要对特定规则做针对性修改，或正在学习策略语法时，此模式最为适用。
* **JSON editor** 让你直接操作带有语法高亮的 HuJSON 策略文件。此模式适合偏好直接处理代码或需要批量修改的用户。JSON 编辑器提供对策略结构的完全控制，让你可以使用可能还没有可视化界面的高级功能。JSON 编辑器还包含一个 **Convert to grants** 按钮，可自动把你的 `acls` 部分转换为等效的[授权][docs-grants]。更多信息请参阅[从 ACL 迁移到授权][docs-migrate-acls-grants]。
* **GitOps** 模式指你[通过 GitOps 管理 tailnet 策略文件][docs-gitops]。在此模式下，你可以搜索、筛选和预览潜在更改，但不能保存修改。你的版本控制系统仍是策略更改的唯一可信来源。此模式确保所有策略修改都经过你既定的评审与批准流程。

> **警告：**
>
> 要防止用户在使用 GitOps 时在管理控制台中编辑策略，你必须锁定编辑器。为此，前往 [Policy file management](https://console.tailscale.com/admin/settings/policy-file-management) > **Lock editor**，然后启用 **Prevent edits in the admin console**。

## 通用访问规则

通用访问规则让你使用[授权语法][docs-grants]管理 tailnet 中设备之间的访问。

[使用可视化编辑器管理通用访问规则][docs-visual-editor-reference-general-access-rules]。

## Tailscale SSH

[Tailscale SSH 规则][docs-tailscale-ssh]让你无需管理 SSH 密钥即可控制对 tailnet 中设备的 SSH 访问。

[使用可视化编辑器管理 Tailscale SSH 规则][docs-visual-editor-reference-tailscale-ssh]。

## 群组

[群组][docs-targets]让你把用户组织成逻辑群组，便于访问控制管理。群组有三种类型：用户自定义群组、从身份提供方同步的群组，以及内置的 autogroup。

[使用可视化编辑器管理群组][docs-visual-editor-reference-groups]。

## 标签

[标签（tag）][docs-tags]提供一种对服务器等非用户设备进行认证和归类的方法，把它们分入功能组以用于访问控制策略。

[使用可视化编辑器管理标签][docs-visual-editor-reference-tags]。

## IP 集

[IP 集][docs-policy-syntax-ipsets]让你创建可在访问控制策略中使用的 IP 地址、主机和子网集合。

[使用可视化编辑器管理 IP 集][docs-visual-editor-reference-ip-sets]。

## 主机

[主机][docs-policy-syntax-hosts]是一种为 IP 地址和 CIDR 范围创建友好名称的方式，用有意义的标识符替换数字地址，以提升策略的可读性。

[使用可视化编辑器管理主机][docs-visual-editor-reference-hosts]。

## 节点属性

[节点属性][docs-policy-syntax-nodeattrs]让你把设置和属性应用到设备上，实现诸如控制整个 tailnet 的功能可用性和设备行为等目的。

[使用可视化编辑器管理节点属性][docs-visual-editor-reference-node-attributes]。

## 设备态势

[设备态势（device posture）][docs-device-posture]规则让你指定设备在访问敏感资源之前必须满足的要求。

[使用可视化编辑器管理设备态势规则][docs-visual-editor-reference-device-posture]。

## 自动审批

[自动审批][docs-policy-syntax-autoapprovers]让你创建策略，为设备预先批准特定操作，例如通告子网路由或出口节点（exit node），无需人工干预。

[使用可视化编辑器管理自动审批][docs-visual-editor-reference-auto-approvers]。

## 测试

[测试][docs-policy-syntax-tests]在保存之前验证访问控制更改是否符合预期行为。

[使用可视化编辑器管理测试][docs-visual-editor-reference-tests]。

## 数据同步

可视化编辑器中的更改会在你保存后立即同步到 JSON 编辑器。这种双向同步确保无论使用哪个编辑器都能保持一致。

GitOps 模式会阻止修改，以维持版本控制作为唯一可信来源。在此模式下，使用可视化编辑器在把更改提交到仓库之前进行预览和验证。只读模式会指示何时由 GitOps 管理你的配置。GitOps 实施示例请参阅 [GitHub Actions][docs-gitops-acls-github]、[GitLab CI][docs-gitops-acls-gitlab] 和 [Bitbucket][docs-gitops-acls-bitbucket] 的文档。

> **注意：**
>
> 使用可视化编辑器时，它会在后端自动把 ACL 语法转换为授权（grant）语法。授权语法支持与 ACL 语法完全相同的能力，还带有[路由过滤][docs-via]和[应用能力][docs-grants-app-capabilities]等附加功能。更多信息请参阅[授权与 ACL 的对比][docs-grants-vs-acls]。

### 查找与筛选

所有主要板块都包含可实时筛选内容的搜索框。搜索会覆盖板块中的每个可见列。你可以使用任何标识信息查找配置，无需切换搜索模式。

搜索框中的下拉列表箭头提供额外的筛选选项：

* 按用户、群组、设备或标签筛选。
* 按端口或 IP 地址搜索。
* 同时应用多个筛选条件。

实时筛选有助于高效管理大型策略文件。输入配置的任意部分即可只显示匹配项。这种方式免去了在数百个条目中手动滚动的麻烦。

### 配置验证

可视化编辑器会在你操作时验证输入。这种方式让你可以不间断地完成复杂配置。必填字段不带可选标签，因为它们代表基线要求。

特定字段的验证错误显示在相应字段附近，而非特定字段的验证错误（例如未通过的通用测试和未通过的 SSH 测试）显示在页面顶部。

### JSON 输出预览

大多数配置都包含 JSON 预览面板，显示你的选择所生成的 HuJSON 语法。修改字段时这些预览会立即更新。预览帮助你理解可视化选择如何转换为策略文件语法。

JSON 预览有多种用途：

* 无需离开可视化编辑器即可探索策略文件语法。
* 验证配置是否产生预期输出。
* 复制代码片段用于文档或团队讨论。
* 通过检查生成的代码来调试复杂配置。
* 与团队成员分享确切的配置。

复制按钮让你把策略 JSON 复制到剪贴板，用于版本控制、文档或团队协作。此功能连接了可视化配置与基于代码的配置两种工作流。

> **提示：**
>
> 即使策略文件因由 GitOps 管理而处于锁定状态，JSON 预览仍然可用。你仍可查看并复制生成的 HuJSON 片段作为参考。

## 反馈

可视化编辑器会持续演进，定期增加功能。你的反馈有助于确定改进优先级和发现问题。

在 [Visual editor](https://console.tailscale.com/admin/acls/visual) 页面顶部选择 **Give feedback**，提交建议、报告缺陷或请求功能。产品团队会审阅所有提交内容，并以此指导开发优先级。

请在反馈中包含具体的使用场景和工作流。你提供的背景信息越多，团队就越能理解并满足你的需求。截图和详细描述有助于传达复杂问题或功能请求。

[docs-device-posture-postures]: /docs/features/device-posture/postures-and-attributes

[docs-device-posture]: /docs/features/device-posture

[docs-gitops-acls-bitbucket]: /docs/integrations/bitbucket/gitops

[docs-gitops-acls-github]: /docs/integrations/github/gitops

[docs-gitops-acls-gitlab]: /docs/integrations/gitlab/gitops

[docs-gitops]: /docs/gitops

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-migrate-acls-grants]: /docs/reference/migrate-acls-grants

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-policy-syntax-hosts]: /docs/reference/syntax/policy-file#主机

[docs-policy-syntax-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-policy-syntax-network-options]: /docs/reference/syntax/policy-file#网络策略选项

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#节点属性

[docs-policy-syntax-tests-ssh]: /docs/reference/syntax/policy-file#ssh-测试

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#测试tests

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets]: /docs/reference/targets-and-selectors

[docs-via]: /docs/features/access-control/grants/grants-via

[docs-visual-editor-reference-auto-approvers]: /docs/reference/visual-editor#自动批准autoapprovers

[docs-visual-editor-reference-device-posture]: /docs/reference/visual-editor#设备态势

[docs-visual-editor-reference-general-access-rules]: /docs/reference/visual-editor#通用访问规则

[docs-visual-editor-reference-groups]: /docs/reference/visual-editor#群组groups

[docs-visual-editor-reference-hosts]: /docs/reference/visual-editor#主机

[docs-visual-editor-reference-ip-sets]: /docs/reference/visual-editor#ip-集

[docs-visual-editor-reference-node-attributes]: /docs/reference/visual-editor#节点属性

[docs-visual-editor-reference-tags]: /docs/reference/visual-editor#标签

[docs-visual-editor-reference-tailscale-ssh]: /docs/reference/visual-editor#tailscale-ssh

[docs-visual-editor-reference-tests]: /docs/reference/visual-editor#测试tests

[xt-gh-hujson]: https://github.com/tailscale/hujson
