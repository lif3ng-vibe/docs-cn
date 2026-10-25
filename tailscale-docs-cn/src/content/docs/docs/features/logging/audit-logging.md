---
title: "配置审计日志"
description: "配置审计日志让你了解 tailnet 中*谁*在*什么时间*做了*什么*。配置审计日志记录修改 tailnet 配置的操作，包括操作类型、操作者、目标资源和时间"
---

最后验证于 Jan 5, 2026

配置审计日志让你了解 tailnet 中*谁*在*什么时间*做了*什么*。配置审计日志记录修改 tailnet 配置的操作，包括操作类型、操作者、目标资源和时间。

你可以导出日志用于长期存储和/或安全分析、威胁检测与事件调查。你还可以把日志流式传输到 SIEM（安全信息与事件管理，[SIEM][ln-security-info-event-management]）系统。

对于策略文件的更改，日志会包含旧文件与新文件之间的完整差异（diff）。

> **注意：**配置审计日志[所有套餐](https://tailscale.com/pricing)均可用。

所有[有权访问管理控制台的用户][docs-user-roles]都可以在管理控制台的 [Logs](https://console.tailscale.com/admin/logs) 页面找到配置审计日志，并且可以筛选这些日志来查找特定事件。

配置审计日志对所有 tailnet 默认启用，可查看最近 90 天的记录。

## 日志结构

日志包含以下几个组成部分：

* **Timestamp（时间戳）**：事件发生的时间。以你浏览器的本地时间显示。
* **Action（操作）**：发生了什么操作。例如批准一台设备，或修改策略文件。
* **Actor（操作者）**：哪个用户或进程完成了该操作。如果操作由用户做出，该值为用户名。API 返回的事件中会提供用户的邮箱或 GitHub 用户名以及姓名。如果操作由 Tailscale 控制平面做出，该值为 Tailscale 服务。有关 Tailscale 控制平面执行的操作列表，参见[服务事件][ar-service-events]。
* **Target（目标）**：操作作用于哪个资源。例如，对于修改用户角色的操作，目标就是该用户；对于批准设备的操作，目标是该设备；对于 tailnet 级别的配置操作，目标就是整个 tailnet。
* **Diff（差异）**：相关时提供的新旧值。例如，如果你重命名了节点的机器名，或更新了标签列表，你会同时看到旧值和新值。对于访问控制策略的更改，你会看到旧版与更新版的完整差异，包括注释等非实质性更改。对于节点重新认证，你会看到旧的节点密钥过期时间和新的过期时间。

*（图：管理控制台的 Logs 页面，列出示例配置日志。）*

## 启用配置审计日志

配置审计日志对所有 tailnet 始终启用，无法停用。

配置审计日志是 Tailscale 为提供服务所使用的日志的子集，符合我们的[隐私政策][co-privacy-policy-collect]。

## 访问配置审计日志

配置审计日志可以在管理控制台的 [Logs](https://console.tailscale.com/admin/logs) 页面访问，也可以通过 API 访问。

### 在管理控制台中查看配置审计日志

所有[有权访问管理控制台的用户][docs-user-roles]都可以在管理控制台的 [Logs](https://console.tailscale.com/admin/logs) 页面访问配置审计日志，并且可以筛选这些日志来查找特定事件。

日志按事件发生的先后顺序显示，最新的排在最前。

#### 筛选配置审计日志

可以对管理控制台 [Logs](https://console.tailscale.com/admin/logs) 页面中的事件进行筛选，以便更轻松地找到符合特定条件的事件。

筛选可用于时间、操作和操作者。可以同时应用多个筛选条件，找出同时满足所有筛选条件的事件。

*（图：Action 下拉框展开并显示筛选器，几个示例筛选器已勾选。）*

#### 时间

使用 **Timeframe** 筛选器，仅显示两个指定日期之间的日志。

#### 操作类型

使用 **Action** 筛选器，仅显示与所选操作匹配的日志。例如，你可以查看所有包含策略文件更新的事件。

#### 操作者

使用 **Actor** 筛选器，仅显示由所选用户执行操作的日志。

### 使用 Tailscale API 访问配置审计日志

你可以通过 Tailscale [API][docs-api] 导出配置审计日志。你需要一个具有 `logs:configuration:read` 权限范围的 [API 访问令牌][docs-api-authentication]才能访问配置审计日志。

`logs` API 调用的响应是 `TailnetLogsResponse` 结构体的形式：

```go
type TailnetLogsResponse struct {
	Version string        `json:"version"`
	Tailnet dbx.TailnetID `json:"tailnetId"`

	Logs []Log `json:"logs"` // Ordered chronologically
}
```

你可以在 API 中使用以下查询参数：

* `start`：必填。要获取日志的时间范围起点，采用 [RFC3339][xt-rfc-3339] 时间戳格式。例如：`2022-07-20T00:00:00Z`。
* `end`：必填。要获取日志的时间范围终点，采用 RFC3339 时间戳格式。例如：`2022-07-21T00:00:00Z`。

`start` 和 `end` 时间在纳秒精度上包含边界。

本示例假设你已经设置好以下变量供 API 调用使用：

* `$ACCESS_TOKEN`：调用 Tailscale API 时使用的 [API 访问令牌][docs-api-authentication]。你可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建 API 访问令牌。
* `$TAILNET_ID`：[tailnet ID][docs-tailnet-name-tailnet-id]。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面找到你的 tailnet ID。
* `$START`：要获取日志的时间范围起点。
* `$END`：要获取日志的时间范围终点。

```shell
export ACCESS_TOKEN=tskey-api-k123456CNTRL-0123456789abcdef
export TAILNET_ID=example.com
export START=2022-07-20T00:00:00Z
export END=2022-07-21T00:00:00Z
```

```shell
curl -u  $ACCESS_TOKEN:  -X GET \
  "https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/configuration?start={$START}&end={$END}"
```

可选地，使用 `json_pp` 美化 JSON 输出：

```shell
curl -u  $ACCESS_TOKEN: -X GET \
  "https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/configuration?start={$START}&end={$END}" \
  | json_pp
```

输出类似于：

```json
{
	"logs": [
		{
			"action": "UPDATE",
			"actor": {
				"displayName": "Alice Architect",
				"id": "123456CNTRL",
				"loginName": "alice@example.com",
				"type": "USER"
			},
			"deferredAt": "0001-01-01T00:00:00Z",
			"eventGroupID": "12345",
			"eventTime": "2022-07-20T20:13:30.136022207Z",
			"new": "2023-01-14T20:13:30.134350003Z",
			"old": "0001-01-01T00:00:00Z",
			"origin": "NODE",
			"target": {
				"id": "654321CNTRL",
				"name": "node1.yak-bebop.ts.net",
				"property": "KEY_EXPIRY_TIME",
				"type": "NODE"
			},
			"type": "CONFIG"
		},
		{
			"action": "CREATE",
			"actor": {
				"displayName": "Alice Architect",
				"id": "123456CNTRL",
				"loginName": "alice@example.com",
				"type": "USER"
			},
			"deferredAt": "0001-01-01T00:00:00Z",
			"eventGroupID": "23456",
			"eventTime": "2022-07-20T18:40:58.838529518Z",
			"new": {
				"capabilities": ["CONTROL_API_SCOPE_ALL_READ", "CONTROL_API_SCOPE_ALL"],
				"expires": "2022-10-18 18:40:58.653877012 +0000 UTC"
			},
			"origin": "ADMIN_UI",
			"target": {
				"id": "789123CNTRL",
				"name": "Control API key",
				"type": "API_KEY"
			},
			"type": "CONFIG"
		},
		{
			"action": "UPDATE",
			"actor": {
				"displayName": "Bob Builder",
				"id": "987654CNTRL",
				"loginName": "bob@example.com",
				"type": "USER"
			},
			"deferredAt": "0001-01-01T00:00:00Z",
			"eventGroupID": "34567",
			"eventTime": "2022-07-20T22:35:19.590021877Z",
			"new": ["...", "...", "10.0.0.0/24", "10.0.1.0/24"],
			"old": ["...", "..."],
			"origin": "ADMIN_UI",
			"target": {
				"id": "876543CNTRL",
				"name": "bob-workstation.yak-bebop.ts.net",
				"property": "ALLOWED_IPS",
				"type": "NODE"
			},
			"type": "CONFIG"
		}
	],
	"tailnetId": "example.com",
	"version": "1.1"
}
```

目前，该 API 不支持分页，也没有最大页大小限制。指定时间范围内的所有事件都会返回。

当[单个操作产生多个事件][ar-multiple-events-single-operation]时，这些操作的 `eventGroupID` 值相同。

## 从审计日志回滚访问控制策略

> **注意：**
>
> 如果你使用[面向 Tailscale 的 GitOps][docs-gitops-acls]，则无法使用此选项。

你需要是 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles)，才能从审计日志回滚[策略文件][docs-tailnet-policy-file]。

你可以将策略文件回滚到之前的某个日期和时间。

1. 打开管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面。

2. 找到并展开包含你想回滚到的策略文件更改的日志条目，然后选择 **Revert to previous version**。在确认对话框中选择 **Revert**。

   *（图：策略文件更改展示界面，高亮"Revert to previous version"。）*

3. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面，确认策略文件已按预期回滚。

## 事件

配置审计日志包括改变 tailnet 配置的写操作，包括用户可以在管理控制台中执行的更改，以及通过 Tailscale API 执行的更改。

任何成功完成的事件都会创建对应的日志条目。

配置审计日志包含的事件如下：

| **Target**              | **Action**                                      | **说明**                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailnet                 | Create tailnet                                  | 已创建 tailnet。                                                                                                                                                                                                                                                                                                     |
|                         | Update policy file for tailnet                  | [策略文件][docs-acls]被修改。包括对[测试][docs-policy-syntax-tests]、[`tagOwners`][docs-policy-syntax-tag-owners]、[autoApprovers][docs-policy-syntax-autoapprovers]和 [Tailscale SSH][docs-policy-syntax-ssh] 配置的更改。                                              |
|                         | Update max key duration for tailnet             | [密钥过期][docs-key-expiry]设置被修改。                                                                                                                                                                                                                                                                               |
|                         | Update DNS configuration for tailnet            | [DNS][docs-dns]配置被更新。包括添加全局或受限名称服务器（Split DNS）以及 MagicDNS 的更改。                                                                                                                                                                                                                              |
|                         | Enable device approval for tailnet              | [设备审批][docs-device-approval]已启用。                                                                                                                                                                                                                                                                              |
|                         | Disable device approval for tailnet             | 设备审批已停用。                                                                                                                                                                                                                                                                                                       |
|                         | Enable user approval for tailnet                | [用户审批][docs-user-approval]已启用。                                                                                                                                                                                                                                                                                |
|                         | Disable user approval for tailnet               | 用户审批已停用。                                                                                                                                                                                                                                                                                                       |
|                         | User joined external tailnet                    | 你 tailnet 中的一位用户加入了[另一个 tailnet][docs-invite-any-user]。                                                                                                                                                                                                                                                  |
|                         | User left external tailnet                      | 你 tailnet 中的一位用户离开了另一个 tailnet。                                                                                                                                                                                                                                                                          |
|                         | Enable MagicDNS for tailnet                     | [MagicDNS][docs-magicdns]已启用。                                                                                                                                                                                                                                                                                      |
|                         | Disable MagicDNS for tailnet                    | MagicDNS 已停用。                                                                                                                                                                                                                                                                                                      |
|                         | Enable Mullvad VPN for tailnet                  | [Mullvad 出口节点][docs-mullvad-exit-nodes]已启用。                                                                                                                                                                                                                                                                    |
|                         | Disable Mullvad VPN for tailnet                 | Mullvad 出口节点已停用。                                                                                                                                                                                                                                                                                               |
|                         | Enable Taildrop for tailnet                     | [Taildrop][docs-taildrop]已启用。                                                                                                                                                                                                                                                                                      |
|                         | Disable Taildrop for tailnet                    | Taildrop 已停用。                                                                                                                                                                                                                                                                                                      |
|                         | Enable services collection for tailnet          | [服务收集][docs-services]已启用。                                                                                                                                                                                                                                                                                      |
|                         | Disable services collection for tailnet         | 服务收集已停用。                                                                                                                                                                                                                                                                                                       |
|                         | Enable HTTPS domain for tailnet                 | [HTTPS][docs-enabling-https]已启用。                                                                                                                                                                                                                                                                                   |
|                         | Disable HTTPS domain for tailnet                | HTTPS 已停用。                                                                                                                                                                                                                                                                                                         |
|                         | Update tailnet DNS name                         | [Tailnet DNS 名称][docs-tailnet-name-tailnet-dns]已更改。                                                                                                                                                                                                                                                              |
|                         | Enable user and group provisioning for tailnet  | [用户与群组预配][docs-user-group-provisioning]已启用。                                                                                                                                                                                                                                                                 |
|                         | Disable user and group provisioning for tailnet | 用户与群组预配已停用。                                                                                                                                                                                                                                                                                                 |
|                         | Update account email for tailnet                | [账户邮箱][docs-contact-preferences-change-email]已更新。                                                                                                                                                                                                                                                              |
|                         | Verify account email for tailnet                | 账户邮箱已验证。                                                                                                                                                                                                                                                                                                       |
|                         | Update configuration email for tailnet          | [配置事项邮箱][docs-contact-preferences-config-issues-email]已更新。                                                                                                                                                                                                                                                   |
|                         | Verify configuration email for tailnet          | 配置事项邮箱已验证。                                                                                                                                                                                                                                                                                                   |
|                         | Update security email for tailnet               | [安全事项邮箱][docs-contact-preferences-security-issues-email]已更新。                                                                                                                                                                                                                                                 |
|                         | Verify security email for tailnet               | 安全事项邮箱已验证。                                                                                                                                                                                                                                                                                                   |
|                         | Join waitlist for feature                       | 已加入某个[仅限邀请的功能][docs-invite-only-feature]的候选名单。                                                                                                                                                                                                                                                       |
|                         | Accept invite for feature                       | 已接受某个仅限邀请功能的邀请。                                                                                                                                                                                                                                                                                         |
|                         | Create logstream endpoint for tailnet           | 已创建日志流式传输端点。                                                                                                                                                                                                                                                                                               |
|                         | Update logstream endpoint for tailnet           | 已更新日志流式传输端点目标。                                                                                                                                                                                                                                                                                           |
|                         | Delete logstream endpoint for tailnet           | 已删除日志流式传输端点。                                                                                                                                                                                                                                                                                               |
|                         | Enable network flow logging for tailnet         | [网络流日志][docs-network-flow-logs]已启用。                                                                                                                                                                                                                                                                           |
|                         | Disable network flow logging for tailnet        | 网络流日志已停用。                                                                                                                                                                                                                                                                                                     |
|                         | Enable tailnet lock                             | [Tailnet Lock][docs-tailnet-lock]已启用。                                                                                                                                                                                                                                                                              |
|                         | Disable tailnet lock                            | Tailnet Lock 已停用。                                                                                                                                                                                                                                                                                                  |
|                         | Sign node key for tailnet lock                  | 节点密钥由受信任的 Tailnet Lock 密钥签名。                                                                                                                                                                                                                                                                             |
|                         | Add trusted key to tailnet lock                 | 向 Tailnet Lock 添加了受信任密钥。                                                                                                                                                                                                                                                                                     |
|                         | Remove trusted key from tailnet lock            | 从 Tailnet Lock 移除了受信任密钥。                                                                                                                                                                                                                                                                                     |
|                         | Update tailnet lock trusted key                 | 受信任的 Tailnet Lock 密钥已更新。                                                                                                                                                                                                                                                                                     |
|                         | Create webhook endpoint                         | 已创建 [webhook][docs-webhooks]。                                                                                                                                                                                                                                                                                      |
|                         | Delete webhook endpoint                         | 已删除 webhook。                                                                                                                                                                                                                                                                                                       |
|                         | Update secret for webhook endpoint              | webhook 的[密钥值（secret）][docs-webhooks-webhook-secret]已更新。                                                                                                                                                                                                                                                     |
|                         | Update subscribed events for webhook endpoint   | webhook 订阅的[事件][docs-webhooks-events]集合已更新。                                                                                                                                                                                                                                                                 |
|                         | Enable posture identity collection              | [设备态势标识信息][docs-device-identity-collection]（例如序列号）的收集已启用。                                                                                                                                                                                                                                        |
|                         | Disable posture identity collection             | 设备态势标识信息的收集已停用。                                                                                                                                                                                                                                                                                         |
|                         | Create posture integration                      | 新增了一个[设备态势集成][docs-crowdstrike-zta]。                                                                                                                                                                                                                                                                       |
|                         | Update posture integration                      | 设备态势集成已更新。                                                                                                                                                                                                                                                                                                   |
|                         | Remove posture integration                      | 设备态势集成已移除。                                                                                                                                                                                                                                                                                                   |
| Billing                 | Create billing subscription for tailnet         | 订阅已创建。                                                                                                                                                                                                                                                                                                           |
|                         | Update billing subscription for tailnet         | 订阅已修改。包括对[所选套餐][co-pricing]和限额的更改。*请注意，日志不包含订阅的差异信息。当前订阅的信息可在管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面查看。*                                                        |
|                         | Cancel billing subscription for tailnet         | 订阅已取消。                                                                                                                                                                                                                                                                                                           |
|                         | Update billing address for tailnet              | [账单地址][docs-billing-information-name-and-address]已修改。包括实际地址和姓名。                                                                                                                                                                                                                                       |
|                         | Update billing email for tailnet                | [账单邮箱][docs-billing-information-billing-email]已修改。                                                                                                                                                                                                                                                             |
|                         | Update billing payment information for tailnet  | [账单支付信息][docs-billing-information]已修改，包括支付方式和[税号][docs-billing-information-tax-ids]。                                                                                                                                                                                                               |
| User                    | Create user                                     | 用户加入了 tailnet。                                                                                                                                                                                                                                                                                                   |
|                         | Invite user to join tailnet                     | 已向用户发送或重发加入 tailnet 的[邀请][docs-invite-team-members]。                                                                                                                                                                                                                                                    |
|                         | Approve user                                    | 用户[已获批准][docs-user-approval]。                                                                                                                                                                                                                                                                                    |
|                         | Update role for user                            | 用户的[角色][docs-user-roles]已更改。                                                                                                                                                                                                                                                                                  |
|                         | Suspend user                                    | 用户已被[停用][docs-remove-team-members-suspending-users]，离开 tailnet。                                                                                                                                                                                                                                              |
|                         | Restore user                                    | 用户已被[恢复][docs-remove-team-members-restoring-users]到 tailnet。                                                                                                                                                                                                                                                   |
|                         | Delete user                                     | 用户已从 tailnet 中被[删除][docs-remove-team-members-deleting-users]。                                                                                                                                                                                                                                                 |
|                         | Push user                                       | 对于在 SCIM 集成的身份提供方中[预配][docs-user-group-provisioning]的用户，其用户属性已更新。                                                                                                                                                                                                                           |
| Group                   | Push group                                      | 已在 SCIM 集成的身份提供方中预配一个群组。                                                                                                                                                                                                                                                                             |
| Node                    | Create node                                     | 节点已添加。对于启用了[设备审批][docs-device-approval]的 tailnet，该节点可能尚未获得批准。                                                                                                                                                                                                                             |
|                         | Log in node                                     | 用户登录节点或重新认证。包括作为 [Tailscale SSH 校验模式][docs-tailscale-ssh-check-mode]一部分的重新认证。                                                                                                                                                                                                             |
|                         | Approve node                                    | 节点[已获批准][docs-device-approval]。                                                                                                                                                                                                                                                                                 |
|                         | Update name for node                            | [节点名称][docs-machine-names]已更新。                                                                                                                                                                                                                                                                                 |
|                         | Enable key expiry for node                      | 节点[密钥过期][docs-key-expiry]已启用。                                                                                                                                                                                                                                                                                |
|                         | Disable key expiry for node                     | 节点密钥过期已停用。                                                                                                                                                                                                                                                                                                   |
|                         | Update key expiry time for node                 | 用户重新认证节点，延长了节点密钥有效期；或节点密钥过期被[临时延长][docs-key-expiry-renew-for-expired]。                                                                                                                                                                                                                |
|                         | Expire node key                                 | 节点密钥已过期。                                                                                                                                                                                                                                                                                                       |
|                         | Update approved routes for node                 | 此节点的[路由][docs-subnets]被手动更新。                                                                                                                                                                                                                                                                               |
|                         | Update auto approved routes for node            | 此节点的路由基于 [autoApprovers][docs-policy-syntax-autoapprovers] 自动更新。                                                                                                                                                                                                                                          |
|                         | Update exit settings for node                   | 节点宣告的[出口节点][docs-exit-nodes]设置已更新。                                                                                                                                                                                                                                                                      |
|                         | Update tags for node                            | 节点[标签][docs-tags]已更新。                                                                                                                                                                                                                                                                                          |
|                         | Update device attribute                         | 节点上的[设备态势属性][docs-device-posture-custom-via-api]已更改。                                                                                                                                                                                                                                                     |
|                         | Update node posture identity                    | 节点的[设备态势标识信息][docs-device-identity-collection]已更改。                                                                                                                                                                                                                                                      |
|                         | Log out node                                    | 用户已从节点注销。                                                                                                                                                                                                                                                                                                     |
|                         | Delete node                                     | 节点已删除。                                                                                                                                                                                                                                                                                                           |
| Admin console           | Log in to admin console                         | [已授权用户][docs-user-roles-permission-matrix]登录了管理控制台。                                                                                                                                                                                                                                                      |
|                         | Log out of admin console                        | 已授权用户退出了管理控制台。                                                                                                                                                                                                                                                                                           |
| login.tailscale.com     | Log in using web interface                      | [Member][docs-user-roles-member] 用户登录了网页界面。                                                                                                                                                                                                                                                                  |
|                         | Log out using web interface                     | Member 用户退出了网页界面。                                                                                                                                                                                                                                                                                            |
| Invite                  | Create invite for node share                    | 共享方 tailnet 创建了节点[共享邀请][docs-sharing]。邀请目标是创建邀请时输入的标签。                                                                                                                                                                                                                                    |
|                         | Accept invite for node share                    | 被共享方 tailnet 接受了节点共享邀请。                                                                                                                                                                                                                                                                                  |
|                         | Delete invite for node share                    | 共享方 tailnet 撤销了节点共享邀请。                                                                                                                                                                                                                                                                                    |
| Share                   | Create node share                               | 共享节点已添加到被共享方的 tailnet。                                                                                                                                                                                                                                                                                   |
|                         | Update node share                               | 共享节点已更新。当共享节点再次共享给已拥有该节点的被共享方时会发生此事件。                                                                                                                                                                                                                                             |
|                         | Delete node share                               | 共享节点已从被共享方的 tailnet 中删除。这可能是由共享方（撤销对共享节点的访问）或被共享方（将共享节点从其 tailnet 移除）执行的操作。                                                                                                                                                                                    |
| API                     | Failed request                                  | 在权限不足的情况下尝试调用 API。                                                                                                                                                                                                                                                                                       |
| API key                 | Create API key                                  | 已生成 [API 访问令牌][docs-api]。                                                                                                                                                                                                                                                                                      |
|                         | Revoke API key                                  | API 访问令牌已撤销。                                                                                                                                                                                                                                                                                                   |
|                         | API key expired                                 | API 访问令牌已过期。                                                                                                                                                                                                                                                                                                   |
| Auth key                | Create API key                                  | 已生成[认证密钥][docs-auth-keys]。包括标签以及密钥是否可复用、临时、预授权。                                                                                                                                                                                                                                           |
|                         | Revoke API key                                  | 认证密钥已撤销。                                                                                                                                                                                                                                                                                                       |
|                         | API key expired                                 | 认证密钥已过期。                                                                                                                                                                                                                                                                                                       |
| OAuth client            | Create API key                                  | 已创建 [OAuth 客户端][docs-oauth-clients]。                                                                                                                                                                                                                                                                            |
|                         | Update API key                                  | OAuth 客户端的权限范围、标签或描述已更新。                                                                                                                                                                                                                                                                             |
|                         | Revoke API key                                  | OAuth 客户端已撤销。                                                                                                                                                                                                                                                                                                   |
| OIDC federated identity | Create API key                                  | 已创建 [OIDC 联合身份][docs-wif]。                                                                                                                                                                                                                                                                                     |
|                         | Update API key                                  | OIDC 联合身份设置已更新。                                                                                                                                                                                                                                                                                              |
|                         | Revoke API key                                  | OIDC 联合身份已撤销。                                                                                                                                                                                                                                                                                                  |
| OAuth access token      | Create OAuth access token                       | OAuth 访问令牌由 OAuth 客户端或 OIDC 联合身份生成。                                                                                                                                                                                                                                                                    |
|                         | Revoke OAuth access token                       | OAuth 访问令牌已撤销。                                                                                                                                                                                                                                                                                                 |

请注意，登录失败尝试不包含在 Tailscale 事件中——这些应到你使用的身份提供方日志中查看，而不是 Tailscale 日志。

## 单个操作的多个事件

作为同一操作一部分发生的多个事件会被逐条记录。例如，删除用户时，会有删除该用户每个节点和每个 API 访问令牌的日志条目，以及删除用户本人的日志条目。当节点被添加到你的 tailnet 时，会有更新节点名称、创建节点、更新节点密钥过期时间、登录节点，以及（如适用）批准该节点的日志条目。

| **操作**                       | **事件**                                                                                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 用户被添加到 tailnet           | （如果已向用户[发送邀请][docs-invite-team-members]）Invite user to join tailnet；Create user；（如果启用[用户审批][docs-user-approval]）Approve user                                                                              |
| 用户被删除                     | 对每个节点执行 Delete node；Delete user                                                                                                                                                                                       |
| 节点被添加到 tailnet           | Update name for node（名称从空白设置为节点名）；Create node；Update key expiry time for node（密钥过期时间设为当前时间 + 有效期）；Log in node；稍后，如果启用了设备审批：Approve node                                              |
| 节点被注销                     | Enable key expiry for node（启用密钥过期）；Update key expiry time for node（密钥过期时间设为当前时间）；Log out node                                                                                                              |
| 节点被重新认证                 | Update key expiry time for node；Log in node                                                                                                                                                                                  |
| MagicDNS 被启用                | Enable MagicDNS for tailnet；Update DNS configuration for tailnet                                                                                                                                                             |
| MagicDNS 被停用                | Disable MagicDNS for tailnet；Update DNS configuration for tailnet                                                                                                                                                            |

## 共享节点的事件

使用[基于链接的节点共享][docs-sharing]时，某些事件会同时记录在共享方和被共享方的 tailnet 中。与邀请相关的事件只记录在共享方 tailnet 中，而与共享节点相关的事件会同时记录在共享方和被共享方的 tailnet 中。

| **Target** | **Action**                   | **Actor**                    | **共享方 tailnet 是否记录？** | **被共享方 tailnet 是否记录？** |
| ---------- | ---------------------------- | ---------------------------- | ----------------------------- | ----------------------------- |
| Invite     | Create invite for node share | 共享方管理员                 | ✅                             | ❌                             |
|            | Accept invite for node share | 被共享方管理员               | ✅                             | ❌                             |
|            | Delete invite for node share | 共享方管理员                 | ✅                             | ❌                             |
| Share      | Create node share            | 被共享方管理员               | ✅                             | ✅                             |
|            | Update node share            | 被共享方管理员               | ✅                             | ✅                             |
|            | Delete node share            | 共享方管理员或被共享方管理员 | ✅                             | ✅                             |

## 服务事件

日志还包括服务事件，即由 Tailscale 服务执行、而非用户直接执行的操作。服务事件包括：

| **Target**          | **Action**      | **Actor**                                      | **说明**                                                                                                                           |
| ------------------- | --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tailnet             | Suspend user    | Tailscale 服务：用户与群组预配                 | 对于使用[用户与群组预配][docs-user-group-provisioning]的 tailnet，用户被停用或从 Tailscale 应用中取消分配                          |
| Tailnet             | Restore user    | Tailscale 服务：用户与群组预配                 | 对于使用用户与群组预配的 tailnet，用户被重新启用或分配了 Tailscale 应用                                                            |
| Node                | Delete node     | Tailscale 服务：移除临时节点                   | 移除不活跃的[临时节点][docs-ephemeral-nodes]                                                                                       |
| API key or Auth key | API key expired | Tailscale 服务：API 密钥过期                   | 90 天后使密钥[过期][docs-api]                                                                                                      |

## 未包含的事件

目前，由向 Tailscale 支持团队发起请求而进行的 tailnet 更改不包含在内。这包括：

* 更新[身份提供方][docs-sso-providers-change]
* 完成 [Okta][docs-sso-okta-steps] 或 [OneLogin][docs-sso-onelogin] 的身份提供方配置
* 更新 [tailnet ID][docs-tailnet-name-tailnet-id]
* 更新自定义 [HTTPS 域名][docs-enabling-https]
* 删除 tailnet
* 将 tailnet 加入 alpha 功能白名单

有些更改如果由用户执行本应被记录，但实际由支持请求发起的，同样不包含在内：

* 更新 [tailnet ID][docs-tailnet-name-tailnet-id]
* 更新用户角色
* 删除用户
* 创建 tailnet 计费订阅
* 更新 tailnet 计费订阅
* 取消 tailnet 计费订阅
* 更新账单地址
* 更新账单邮箱
* 更新账单支付信息
* 更新节点密钥过期时间
* 启用设备审批
* 停用设备审批

## 配置审计日志流式传输

日志流式传输让你可以把网络流日志流式传输到 SIEM（安全信息与事件管理，[SIEM][ln-security-info-event-management]）系统。更多信息参见[日志流式传输][docs-log-streaming]。

## 限制

* 配置审计日志只包括修改 tailnet 配置的操作。只读操作（例如用户浏览管理控制台）不包含在内。
* 目前不包含由 Tailscale 支持团队发起的 tailnet 更改。
* 配置审计日志只包括 tailnet 配置的更改。有关 tailnet 内连接的信息（数据平面审计日志），例如网络流日志，不包含在配置日志中。你可以使用[网络流日志][docs-network-flow-logs]来记录 tailnet 内连接的相关信息。
* 配置审计日志在管理控制台中提供，可通过 API 导出，也可作为 SIEM 系统的[流式传输来源][docs-log-streaming]。
* 目前无法保证事件发生到其写入审计日志之间的最大延迟。实际中通常在几秒内完成。
* 配置日志的保存时长无法配置。配置日志保存 90 天。
* [具有相同节点密钥的设备][docs-troubleshooting-same-ip-address]在日志中会显示为同一个节点目标。
* 用户被停用时，其节点、API 访问令牌和认证密钥的停用不会被记录。
* 用户被删除时，其 API 访问令牌和认证密钥的删除不会被记录。

[ar-multiple-events-single-operation]: #单个操作的多个事件

[ar-service-events]: #服务事件

[co-pricing]: https://tailscale.com/pricing

[co-privacy-policy-collect]: https://tailscale.com/privacy-policy#the-information-we-collect

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-policy-syntax-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-tags]: /docs/features/tags

[docs-acls]: /docs/features/access-control/acls

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-billing-information-billing-email]: /docs/account/billing/modify-billing#change-the-billing-email-address

[docs-billing-information-name-and-address]: /docs/account/billing/modify-billing#change-the-billing-name-and-address

[docs-billing-information-tax-ids]: /docs/account/billing/modify-billing#manage-tax-ids

[docs-billing-information]: /docs/account/billing/modify-billing

[docs-contact-preferences-change-email]: /docs/reference/contact-preferences#setting-the-account-changes-email

[docs-contact-preferences-config-issues-email]: /docs/reference/contact-preferences#setting-the-configuration-issues-email

[docs-contact-preferences-security-issues-email]: /docs/reference/contact-preferences#setting-the-security-issues-email

[docs-crowdstrike-zta]: /docs/integrations/crowdstrike-zta

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-device-identity-collection]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-custom-via-api]: /docs/features/device-posture/postures-and-attributes#posture-attributes-api

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-gitops-acls]: /docs/gitops

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-invite-only-feature]: /docs/reference/invite-only-feature

[docs-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-key-expiry-renew-for-expired]: /docs/features/access-control/key-expiry#renewing-keys-for-an-expired-device

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-remove-team-members-deleting-users]: /docs/features/sharing/how-to/remove-team-members#deleting-users

[docs-remove-team-members-restoring-users]: /docs/features/sharing/how-to/remove-team-members#restoring-users

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#suspending-users

[docs-services]: /docs/features/services

[docs-sharing]: /docs/features/sharing

[docs-sso-okta-steps]: /docs/integrations/identity/okta#steps

[docs-sso-onelogin]: /docs/integrations/identity/onelogin

[docs-sso-providers-change]: /docs/integrations/identity#changing-identity-providers

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrop]: /docs/features/taildrop

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-name-tailnet-dns]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tailnet-name-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#configure-tailscale-ssh-with-check-mode

[docs-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file

[docs-troubleshooting-same-ip-address]: /docs/reference/troubleshooting/network-configuration/multiple-devices-same-100-x-ip-address

[docs-user-approval]: /docs/features/access-control/user-approval

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-user-roles-member]: /docs/reference/user-roles#member

[docs-user-roles-permission-matrix]: /docs/reference/user-roles#permission-matrix

[docs-user-roles]: /docs/reference/user-roles

[docs-webhooks-events]: /docs/features/webhooks#events

[docs-webhooks-webhook-secret]: /docs/features/webhooks#webhook-secret

[docs-webhooks]: /docs/features/webhooks

[docs-wif]: /docs/features/workload-identity-federation

[ln-security-info-event-management]: https://tailscale.com/learn/security-information-and-event-management

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-rfc-3339]: https://www.rfc-editor.org/rfc/rfc3339.html
