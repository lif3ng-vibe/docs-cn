---
title: "可视化策略编辑器参考"
description: "可视化策略编辑器用户界面的完整参考。"
---

最后验证于 Dec 2, 2025

[Tailscale 可视化策略编辑器][docs-visual-editor]（visual policy editor）提供了一个交互式图形界面，用于管理 Tailscale 网络（即 tailnet）中的访问控制策略。本参考文档记录了所有界面元素、表单、控件及其相关帮助信息，帮助你高效使用可视化编辑器。要全面了解底层策略语法，请参阅 [Tailscale 策略语法文档][docs-policy-syntax]。

> **提示：**
>
> 有关来源、目标及其他字段可用 target 的详细信息，请参阅 [targets 文档][docs-targets]。

## 通用访问规则

*（图：General access rules 标签页，显示两条规则：第一条允许所有用户与设备在所有端口上访问所有目标，第二条限制 tag:unraid 在所有端口上的访问。）*

通用访问规则使用 [grants 语法][docs-grants]控制 tailnet 中设备之间网络层和应用层的访问。这些规则决定哪些来源可以在指定端口和协议上连接哪些目标。可视化编辑器会把它们转换为 tailnet 策略文件中底层的 grant 结构。

可视化编辑器在后端使用 grants 语法。这意味着，如果你在 JSON 编辑器中用 ACL 语法创建了访问控制策略，之后用可视化编辑器编辑该策略时，它会自动转换为 grants 语法。grants 语法支持 ACL 语法的全部能力，并提供[路由过滤][docs-via]和[应用能力][docs-grants-app-capabilities]等额外特性。更多信息请参阅 [grants 与 ACL 的对比][docs-grants-vs-acls]。

每条通用访问规则都使用 grants 语法，它由三个主要部分组成：来源（sources）、目标（destinations）和网络限制。grant 还支持 `via` 字段和应用能力等附加部分，用于更高级的访问控制场景。要完整了解 grants 语法，请参阅 [grants 语法参考][docs-grants-syntax]。

规则表格显示所有已配置的访问规则及其来源、目标和网络限制。每条规则的菜单提供编辑和删除操作。常见访问模式的示例请参阅 [grant 示例][docs-grant-examples]。

### 添加通用访问规则

*（图：添加通用访问规则表单，包含来源、目标与网络限制（端口和协议）字段。）*

\[Missing snippet: general\_access\_rules\_add.mdx]

### 编辑通用访问规则

\[Missing snippet: general\_access\_rules\_edit.mdx]

### 删除通用访问规则

\[Missing snippet: general\_access\_rules\_delete.mdx]

## Tailscale SSH

*（图：Tailscale SSH 标签页，显示两条 SSH 规则：第一条允许 autogroup:member 以 autogroup:nonroot 和 root 身份访问 autogroup:self，第二条允许 autogroup:member 以 sally、autogroup:nonroot 和 root 身份访问 autogroup:self，并带有 1m0s 的检查模式（check mode）。）*

[Tailscale SSH 规则][docs-tailscale-ssh]控制对你 tailnet 中设备的 SSH 访问。这些规则与通用访问规则协同工作，无需管理 SSH 密钥即可提供安全的 SSH 连接。其 SSH 实现利用你现有的身份提供方（IdP）进行认证，免除了传统上分发和轮换 SSH 密钥的复杂工作。

SSH 规则在基础网络访问之上扩展了 SSH 专属的控制，增强安全性和易管理性。理解这些组成部分有助于你创建兼顾安全与易用性的 SSH 策略。

**Source** 字段标识谁可以发起 SSH 连接，通常包括来自你身份提供方的用户或组。**Destination** 字段指定哪些设备接受 SSH 连接，这些设备通常用 `tag:server` 或 `tag:bastion` 等标签标识。

目标[用户][docs-policy-syntax-users]（destination users）定义目标设备上哪些用户账户可被访问。你可以指定 `autogroup:nonroot` 来禁止 root 访问，或使用基于邮箱的匹配把身份提供方用户映射到本地账户。**Check mode**（检查模式）决定是否要求定期重新认证，为敏感连接增加一层额外安全保障。

### 添加 SSH 规则

\[Missing snippet: tailscale\_ssh\_add.mdx]

#### 检查模式最佳实践

对允许真人发起 SSH 连接的规则，请启用 **Check mode**。这会增加一个认证层，在授予访问权限前先验证用户身份。**Check period** 决定连接在需要重新认证之前保持授权的时长。设置合适的 **Check period** 值可以在安全性与用户便利性之间取得平衡。

对于自动化流程或服务账户，可以禁用 **Check mode** 以避免中断。不过，这类连接应当使用严格限定范围的权限，并使用[基于标签的身份][docs-tags]而非个人凭证。

### 编辑 SSH 规则

*（图：编辑 SSH 规则表单，包含来源、目标、目标用户与检查模式（check mode）设置字段。）*

\[Missing snippet: tailscale\_ssh\_edit.mdx]

### 删除 SSH 规则

\[Missing snippet: tailscale\_ssh\_delete.mdx]

## 组

*（图：Groups 标签页，显示用户自定义组分区（为空）与 Autogroups 分区，其中列出 autogroup:member（2 名用户）、autogroup:owner（1 名用户）、autogroup:admin（2 名用户）等内置 autogroup，以及多个成员数为 0 的基于角色的 autogroup。）*

[组][docs-targets]（Groups）将用户组织起来，简化访问控制管理。**Groups** 标签页包含用户自定义组、来自身份提供方的同步组以及内置 autogroup 等部分。组让你管理的是用户集合而非单个用户，从而降低策略复杂度，随着组织壮大也让策略更易维护。有关组类型和用法的详细信息，请参阅 [targets 文档][docs-targets]。

### 用户自定义组

创建并管理可在访问控制策略中使用的[自定义用户组][docs-targets]。组让你引用用户集合而非单个用户，改进策略管理。这种抽象让策略更易读，并在团队成员变动时减轻维护负担。

> **警告：**
>
> 组成员关系的变更会立即影响所有引用该组的策略。

### 添加用户自定义组

*（图：创建组表单，包含组名与成员选择字段。）*

\[Missing snippet: user\_defined\_groups\_add.mdx]

### 编辑用户自定义组

\[Missing snippet: user\_defined\_groups\_edit.mdx]

### 删除用户自定义组

\[Missing snippet: user\_defined\_groups\_delete.mdx]

### 同步组

[同步组][docs-policy-syntax-synced-groups]（synced groups）通过 SCIM 集成从你的身份提供方自动填充。这些组在可视化编辑器中是只读的。成员变更必须在身份提供方进行，并自动同步到 Tailscale。这种集成确保 tailnet 访问控制与组织的身份管理流程保持一致。你可以在身份提供方处配置同步组，包括 [Google SSO 集成][docs-sso-google-sync]。

身份提供方中的变更通常会在几分钟内完成同步。你可以在策略中引用同步组：使用 `group:` 前缀加上来自身份提供方的组名。

### Autogroup

Tailscale 提供称为 [autogroup][docs-targets-autogroups] 的内置动态生成组。这些组会自动纳入具有特定角色或属性的用户。使用 autogroup 就不必为基于角色的访问控制手动维护组。

## 标签

*（图：Tags 标签页，显示两个已定义标签：tag:example 由 autogroup:admin 所有，tag:mytag 由 autogroup:admin 和 ostrich.zebra@example.com 所有。）*

[标签][docs-tags]（tag）把服务器等非用户设备组织成功能组，供访问控制策略使用。标签让你可以按功能、环境或任何其他逻辑类别对设备分组。与基于用户的组不同，标签作用于设备，并且跨认证会话持续有效。

标签表格显示所有已定义的标签及其所有者。你可以使用表格上方的搜索框按标签名或所有者筛选结果。

> **注意：**
>
> 默认情况下，[Owner、Admin 和 Network admin](/docs/reference/user-roles) 是所有标签的标签所有者。

### 添加标签

*（图：创建标签表单，包含标签名与标签所有者选择字段。）*

\[Missing snippet: tags\_add.mdx]

### 编辑标签

*（图：编辑标签表单，包含修改标签名称与所有者的字段。）*

\[Missing snippet: tags\_edit.mdx]

### 删除标签

\[Missing snippet: tags\_delete.mdx]

> **警告：**
>
> 删除标签会把它从所有设备上移除，可能影响引用该标签的访问控制规则。

## IP 集

*（图：IP 集合标签页，显示已添加三个 IP 地址（100.100.106.101、100.100.106.103、100.100.106.104）的 ipset:databases。）*

[IP 集][docs-ipsets]（IP set）是可在访问控制策略中使用的 IP 地址、主机和子网的集合。它让你用一个标识符引用一组网络地址，改进策略管理。IP 集支持组合，可以从更简单的组件构建复杂的网络定义。

IP 集通过 **Add** 和 **Remove** 操作支持组合。先用 **Add** 加入大范围，再用 **Remove** 排除特定区间来细化集合。这种方式让你无需重复定义 IP 就能实现灵活的网络分段。

例如，你可以先添加 `10.0.0.0/8` 以包含整个私有网络，再移除 `10.0.1.0/24` 以排除特定子网。这种组合模型有助于在基础设施演进时维护复杂策略。

### 添加 IP 集

*（图：创建 IP 集合表单，包含名称与要从集合中添加或移除的目标字段。）*

\[Missing snippet: ip\_sets\_add.mdx]

### 编辑 IP 集

\[Missing snippet: ip\_sets\_edit.mdx]

### 删除 IP 集

\[Missing snippet: ip\_sets\_delete.mdx]

## 主机

*（图：Hosts 标签页，显示一条主机定义：'ahost' 映射到 IP 地址 100.100.100.105。）*

[主机][docs-policy-syntax-hosts]（Hosts）为 IP 地址和 CIDR 区间创建易记的名称。它用有意义的标识符取代数字地址，提升策略可读性。你不必记住 `192.168.1.100` 是你的数据库服务器，在策略中直接引用 `database-primary` 即可。

你可以在访问规则、IP 集以及其他接受 IP 地址的策略组件中使用主机定义。主机表格显示所有已定义的主机及其关联 IP 地址，方便快速查阅。主机名让策略自文档化，并减少因 IP 地址输错导致的错误。

### 添加主机

*（图：创建主机表单，包含主机名与 IP 地址或 CIDR 范围字段。）*

\[Missing snippet: hosts\_add.mdx]

### 编辑主机

*（图：编辑主机表单，包含修改主机名与 IP 地址的字段。）*

\[Missing snippet: hosts\_edit.mdx]

### 删除主机

\[Missing snippet: hosts\_delete.mdx]

## 节点属性

*（图：节点属性标签页，显示一条把 drive:share 能力授予所有用户与设备的属性规则。）*

[节点属性][docs-policy-syntax-nodeattrs]（node attributes）是设备的属性和设置，可用于在整个 tailnet 范围内控制功能可用性和设备行为等。例如，你可以用一个属性来启用 [Tailscale Funnel][docs-funnel] 或配置特定行为，而无需逐台修改设备配置。

节点属性常用于启用扩展设备能力的功能。理解这些常见模式有助于你按自身需求实现类似配置。

`funnel` 属性让设备可以使用 [Tailscale Funnel][docs-funnel] 对外提供访问。`mullvad` 属性授予对 [Mullvad 出口节点][docs-mullvad-exit-nodes]的访问，增强隐私保护。`drive:share` 和 `drive:access` 属性启用 [Taildrive][docs-taildrive] 文件共享能力。`disable-ipv4` 属性禁用 IPv4 寻址，用于仅 IPv6 的部署。

每个属性都会立即应用到匹配的设备，无需重新配置或重启设备。

### 添加节点属性

*（图：添加节点属性表单，包含选择目标与定义属性或能力的字段。）*

\[Missing snippet: node\_attributes\_add.mdx]

### 编辑节点属性

*（图：编辑节点属性表单，包含修改目标与属性的字段。）*

\[Missing snippet: node\_attributes\_edit.mdx]

### 删除节点属性

\[Missing snippet: node\_attributes\_delete.mdx]

## 设备态势

*（图：设备态势标签页，显示一条要求 node:os == windows 且 node:osVersion >= 11 的 posture:recent\_windows 规则。）*

[设备态势][docs-device-posture]（device posture）规则定义设备必须满足的要求，由访问控制策略用来阻止不合规的设备访问敏感资源。态势规则可以检查操作系统版本、磁盘加密状态、是否安装特定安全软件等条件。你可以创建自定义态势检查来落实组织的安全策略。

态势检查持续运行，一旦设备不再合规就会撤销其访问权限。

你可以在访问规则的 `srcPosture` 字段中引用态势规则来强制设备合规。设备必须满足所有指定的态势要求才能建立连接。随着安全要求演进，请及时更新态势定义。

态势强制在建立连接时执行，并在连接存续期间定期执行。如果设备不再合规，现有连接会中断，新连接会失败，直到设备重新满足要求。

### 添加态势规则

*（图：添加设备态势规则表单，包含规则名称与设备属性条件字段。）*

\[Missing snippet: device\_posture\_add.mdx]

有关与企业设备管理系统的集成，请参阅 [Intune][docs-intune]、[Jamf Pro][docs-jamf-pro]、[Iru][docs-kandji]（原 Kandji）、[1Password XAM（Kolide）][docs-kolide]和 [SentinelOne][docs-sentinelone] 的文档。

### 编辑设备态势规则

*（图：编辑设备态势规则表单，包含修改态势要求与条件的字段。）*

\[Missing snippet: device\_posture\_edit.mdx]

### 删除设备态势规则

\[Missing snippet: device\_posture\_delete.mdx]

## 自动审批者

*（图：自动批准者标签页：路由分区显示 100.100.106.0/24 已对 tag:mytag 自动批准；出口节点分区显示 tag:example 为自动批准的出口节点。）*

[自动审批者][docs-policy-syntax-autoapprovers]（auto approver）是一类策略，让你无需人工干预即可自动批准特定操作，例如通告子网路由或出口节点。

### 路由

自动批准来自用户、组和标签的[子网路由][docs-subnets]通告。这免除了对子网路由器的人工审批。路由自动审批让你扩展规模时不会遇到管理瓶颈。

### 添加路由自动审批者

*（图：添加路由自动批准者表单，包含路由 CIDR 与批准者选择字段。）*

\[Missing snippet: auto\_approvers\_routes\_add.mdx]

### 编辑路由自动审批者

\[Missing snippet: auto\_approvers\_routes\_edit.mdx]

### 删除路由自动审批者

\[Missing snippet: auto\_approvers\_routes\_delete.mdx]

### 出口节点

自动批准用户、组和标签作为[出口节点][docs-exit-nodes]。这让指定设备无需人工审批即可转发互联网流量。出口节点自动审批适用于区域出口节点或专用隐私基础设施等场景。

### 添加出口节点自动审批者

*（图：添加出口节点自动批准者表单，包含选择用户、群组或标签作为出口节点批准者的字段。）*

\[Missing snippet: auto\_approvers\_exit\_nodes\_add.mdx]

### 编辑出口节点自动审批者

\[Missing snippet: auto\_approvers\_exit\_nodes\_edit.mdx]

### 删除出口节点自动审批者

\[Missing snippet: auto\_approvers\_exit\_nodes\_delete.mdx]

## 测试

*（图：测试标签页：常规测试分区显示一条针对 alice@example.com 的测试（node:os 为 macos，经 tcp 或 udp 协议访问 tag:example:80）；SSH 测试分区显示 crocus.cat@example.com 可以 root 用户访问 100.121.20.49。）*

有关测试及其在可视化策略编辑器中工作方式的概览，请参阅可视化策略编辑器文档中的[测试一节][docs-visual-editor-tests]。本参考文档记录管理测试的 UI 控件和操作流程。

**Tests** 标签页包含通用访问测试和 SSH 专属测试两部分。测试充当回归保护，确保策略修改不会意外破坏现有的访问模式。

### 通用测试

创建保存前访问控制变更必须通过的验证测试。这些测试确保策略修改不会意外撤销重要权限或暴露关键系统。设计良好的测试能在配置错误影响生产访问之前将其捕获。

### 添加通用测试

*（图：添加常规测试表单，包含来源、态势属性、允许的目标、拒绝的目标与协议选择字段。）*

\[Missing snippet: general\_tests\_add.mdx]

### 编辑通用测试

*（图：编辑常规测试表单，包含修改测试条件与断言的字段。）*

\[Missing snippet: general\_tests\_edit.mdx]

### 删除通用测试

\[Missing snippet: general\_tests\_delete.mdx]

### SSH 测试

[SSH 测试][docs-policy-syntax-sshtests]让你编写 Tailscale SSH 策略变更保存前必须通过的验证测试。这些测试验证 SSH 访问规则是否按预期工作。SSH 测试同时验证访问权限和认证要求。保存策略变更时测试会自动运行。未通过的测试会阻止策略保存，并显示错误消息指出哪些断言失败。

#### 添加 SSH 测试

*（图：添加 SSH 测试表单，包含来源、目标、允许的用户、受检用户与拒绝的目标字段。）*

\[Missing snippet: ssh\_tests\_add.mdx]

### 编辑 SSH 测试

\[Missing snippet: ssh\_tests\_edit.mdx]

### 删除 SSH 测试

\[Missing snippet: ssh\_tests\_delete.mdx]

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grant-examples]: /docs/reference/examples/grants

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-intune]: /docs/integrations/mdm/intune

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-jamf-pro]: /docs/integrations/jamf-pro

[docs-kandji]: /docs/integrations/iru

[docs-kolide]: /docs/integrations/kolide

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-policy-syntax-hosts]: /docs/reference/syntax/policy-file#主机

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-policy-syntax-sshtests]: /docs/reference/syntax/policy-file#sshtests

[docs-policy-syntax-synced-groups]: /docs/reference/syntax/policy-file#同步的群组

[docs-policy-syntax-users]: /docs/reference/syntax/policy-file#users

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-sentinelone]: /docs/integrations/sentinelone

[docs-sso-google-sync]: /docs/integrations/google-sync

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-taildrive]: /docs/features/taildrive

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroup

[docs-targets]: /docs/reference/targets-and-selectors

[docs-via]: /docs/features/access-control/grants/grants-via

[docs-visual-editor-tests]: /docs/features/visual-editor#测试

[docs-visual-editor]: /docs/features/visual-editor
