---
title: "Webhooks"
description: "设置 webhook，接收 Tailscale 网络上的事件通知。"
---

最后验证于 Jan 5, 2026

> **注意：** 此功能适用于[所有套餐](https://tailscale.com/pricing)。

Webhook 让你能够订阅 Tailscale 网络上的特定事件，并通过集成或应用处理事件通知。例如，你可以把 Tailscale 事件集成到 Slack 频道。如果订阅了"添加节点"这类事件，那么每当有节点加入你的 tailnet，你的 webhook 端点就可以在 Slack 频道里发送一条消息。

*（图：Slack 频道中的 Tailscale 事件）*

## 工作原理

你提供一个 webhook 端点，用于接收所订阅 Tailscale 事件的 HTTPS POST 请求。请求正文包含该事件的相关信息。至于 webhook 应如何处理通知，完全由你决定。Tailscale 通常会在事件发生后的几秒内把事件通知发送到 webhook。

你在管理控制台的 [Webhooks](https://console.tailscale.com/admin/settings/webhooks) 页面创建和管理 webhook 端点。

Tailscale 会为它发送的事件提供数字签名，因此你可以验证事件是否由你与 Tailscale 之间共享的密钥签名。

Webhook 事件以 JSON 对象的形式发送，格式见[事件载荷][ar-events-payload]。你还可以选择把 webhook 配置为以兼容的格式向以下目的地发送事件：

| 目的地      | 目的地的 webhook 文档                                                            |
| ----------- | ------------------------------------------------------------------------------ |
| Discord     | [Intro to Discord webhooks][xt-discord-webhooks]                               |
| Google Chat | [Send messages to Google Chat with incoming webhooks][xt-google-chat-webhooks] |
| Mattermost  | [Mattermost webhooks][xt-mattermost-webhooks]                                  |
| Slack       | [Sending Slack messages using incoming webhooks][xt-slack-webhooks]            |

## 前提条件

* 你需要一个用于处理 Tailscale 事件通知的 webhook 端点。

* 你的 webhook 端点必须能处理 HTTPS POST 请求，并且必须使用 `80` 或 `443` 端口。

* 你必须是 tailnet 的 [Owner、Admin、Network admin 或 IT admin](/docs/reference/user-roles) 才能创建、修改或删除 webhook。

## 设置 webhook 端点

Webhook 作用于某个 tailnet。如果一个用户创建了 webhook，tailnet 中的其他 [Owner、Admin、Network admin 或 IT admin](/docs/reference/user-roles) 用户可以修改或删除它。如果创建 webhook 的用户后来被移除或暂停，该 webhook 仍会继续工作。

1. 打开管理控制台的 [Webhooks](https://console.tailscale.com/admin/settings/webhooks) 页面。

2. 选择 **Add endpoint**。

3. 在 **Add endpoint** 页面：

   1. 在 **Webhook URL** 中提供你的 webhook 端点。端点 URL 必须使用 HTTPS 协议，并且必须使用 `80` 或 `443` 端口。

   2. （可选）在 **Destination** 中选择端点的目的地。Tailscale 会按目的地期望的格式发送你的 webhook 事件。（如果你在 **Webhook URL** 中填入 Discord 或 Slack 的 URL，**Destination** 字段会自动置灰并选中对应的目的地。）

      *（图：管理控制台中 webhooks 的"Webhook URL"界面）*

      如果事件使用通用的 Tailscale 格式，请选择 **None**。

   3. 选择你想接收通知的事件类别或事件。

      类别是一组相关事件的集合。例如，**Tailnet Management** 类别包含与节点操作和 [tailnet 策略文件][docs-policy-syntax]更新相关的事件。如果你选择了一个类别，就等于订阅了 Tailscale 今后添加到该类别中的任何新事件。

      如果不想使用类别，你也可以选择具体事件。

      *（图：管理控制台中 webhooks 的"Events"界面）*

   4. 选择 **Add endpoint**。

4. 在随后弹出的 **Webhook secret** 弹窗中，选择 **Copy** 复制新建的 webhook 密钥。关闭 **Webhook secret** 页面后，你将无法再次复制该密钥。另外请注意，Tailscale 生成的 webhook 密钥区分大小写。

   > **注意：**
   >
   > 请妥善保管 webhook 密钥。

5. 选择 **Done**。

   你的 webhook 端点现已配置完成。

6. 要确保你的 webhook 配置正确、能够接收来自 Tailscale 的事件，请[测试你的 webhook][ar-testing-your-webhook]。

## 事件

你可以订阅以下事件：

| 类别                     | 事件                                   | 说明                                                                                                                                                                                         |
| ----------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 设备配置错误             | `exitNodeIPForwardingNotEnabled`      | [出口节点][docs-exit-nodes]的 [IP 转发][docs-exit-nodes-linux-advertise]未启用。                                                                                                              |
| 设备配置错误             | `subnetIPForwardingNotEnabled`        | [子网][docs-subnets]的 [IP 转发][docs-subnets-linux-ip-forwarding]未启用。                                                                                                                    |
| tailnet 管理             | `nodeApproved`                        | 节点已获批准。                                                                                                                                                                               |
| tailnet 管理             | `nodeAuthorized`（已弃用）            | 节点已获授权。此事件已弃用，由 `nodeApproved` 取代。在你关闭它之前，你的端点会继续接收此事件。                                                                                                 |
| tailnet 管理             | `nodeCreated`                         | 节点已创建。                                                                                                                                                                                 |
| tailnet 管理             | `nodeDeleted`                         | 节点已删除。包括[临时节点（ephemeral node）][docs-ephemeral-nodes]的自动删除。                                                                                                                |
| tailnet 管理             | `nodeKeyExpired`                      | 节点密钥（node key）最近已过期。                                                                                                                                                             |
| tailnet 管理             | `nodeKeyExpiringInOneDay`             | [节点密钥][bl-tailscale-key-management-node-keys]将在不到一天内过期。                                                                                                                         |
| tailnet 管理             | `nodeNeedsApproval`                   | 节点需要[批准][docs-device-approval]。注意，任何[预先批准的节点][docs-device-approval-pre-approve]都不会生成 `nodeApproved` 事件。                                                              |
| tailnet 管理             | `nodeNeedsAuthorization`（已弃用）    | 节点需要授权。此事件已弃用，由 `nodeNeedsApproval` 取代。在你关闭它之前，你的端点会继续接收此事件。                                                                                            |
| tailnet 管理             | `nodeNeedsSignature`                  | 节点需要受信任节点的签名。此事件只针对启用了 [Tailnet Lock][docs-tailnet-lock] 的 tailnet 中的节点发送，且不会为共享节点发送。                                                                  |
| tailnet 管理             | `nodeSigned`                          | 节点已由受信任节点签名。适用于启用了 Tailnet Lock 的 tailnet。                                                                                                                                 |
| tailnet 管理             | `policyUpdate`                        | [tailnet 策略文件][docs-tailnet-policy-file]已更新。                                                                                                                                          |
| tailnet 管理             | `userApproved`                        | 用户已获批准。                                                                                                                                                                               |
| tailnet 管理             | `userCreated`                         | 用户已创建。                                                                                                                                                                                 |
| tailnet 管理             | `userNeedsApproval`                   | 用户需要[批准][docs-user-approval]。                                                                                                                                                          |
| tailnet 管理             | `userRoleUpdated`                     | 用户角色已[变更][docs-changing-user-roles]。                                                                                                                                                  |
| webhook 管理             | `test`                                | 已生成 webhook 测试事件。                                                                                                                                                                    |
| webhook 管理             | `webhookDeleted`                      | Webhook 已删除。此事件默认订阅，无法禁用。                                                                                                                                                    |
| webhook 管理             | `webhookUpdated`                      | Webhook 已更新。此事件默认订阅，无法禁用。                                                                                                                                                    |

## 事件载荷

Webhook 事件以 JSON 对象的形式发送，包含以下字段：

* `timestamp`：事件发生的时间，格式为 RFC 3339 字符串。
* `version`：事件载荷的版本。
* `type`：事件类型（见上表所列）。
* `tailnet`：事件发生的 tailnet 的名称。
* `message`：事件的人类可读摘要。
* `data`（可选）：每个事件专属的附加数据载荷。大多数事件都会有一个 `actor` 字段，标识执行触发事件的操作的用户或自动化进程。它与[配置审计日志条目][docs-audit-logging-log-structure]中包含的是同一个 actor。

为减少开销，多个事件可以在一个载荷中发送。根载荷对象始终是一个事件数组。

以下是发送到 webhook 端点的事件载荷示例：

```json
[
  {
    "timestamp": "2022-09-21T13:37:51.658918-04:00",
    "version": 1,
    "type": "test",
    "tailnet": "example.com",
    "message": "This is a test event",
    "data": null
  },
  {
    "timestamp": "2022-09-21T13:59:02.949217-04:00",
    "version": 1,
    "type": "nodeCreated",
    "tailnet": "example.com",
    "message": "Node alice-workstation1.yak-bebop.ts.net created",
    "data": {
      "nodeID": "nFJw3SRKTM59",
      "deviceName": "alice-workstation1.yak-bebop.ts.net",
      "managedBy": "alice@example.com",
      "actor": "alice@example.com",
      "url": "https://console.tailscale.com/admin/machines/100.12.345.67"
    }
  },
  {
    "timestamp": "2022-09-21T13:59:02.949278-04:00",
    "version": 1,
    "type": "nodeNeedsApproval",
    "tailnet": "example.com",
    "message": "Node alice-workstation1.yak-bebop.ts.net needs approval",
    "data": {
      "nodeID": "nFJw3SRKTM59",
      "deviceName": "alice-workstation1.yak-bebop.ts.net",
      "managedBy": "alice@example.com",
      "actor": "alice@example.com",
      "url": "https://console.tailscale.com/admin/machines/100.12.345.67"
    }
  },
  {
    "timestamp": "2022-09-21T13:59:15.966728-04:00",
    "version": 1,
    "type": "nodeApproved",
    "tailnet": "example.com",
    "message": "Node alice-workstation1.yak-bebop.ts.net approved",
    "data": {
      "nodeID": "nFJw3SRKTM59",
      "deviceName": "alice-workstation1.yak-bebop.ts.net",
      "managedBy": "alice@example.com",
      "actor": "admin@example.com",
      "url": "https://console.tailscale.com/admin/machines/100.12.345.67"
    }
  },
  {
    "timestamp": "2023-04-21T13:59:15.966728-04:00",
    "version": 1,
    "type": "nodeDeleted",
    "tailnet": "example.com",
    "message": "Node alice-workstation1.yak-bebop.ts.net deleted",
    "data": {
      "nodeID": "nFJw3SRKTM59",
      "deviceName": "alice-workstation1.yak-bebop.ts.net",
      "managedBy": "alice@example.com",
      "actor": "admin@example.com",
      "url": "https://console.tailscale.com/admin/machines/100.12.345.67"
    }
  },
  {
    "timestamp": "2022-09-27T09:51:46.512946-07:00",
    "version": 1,
    "type": "policyUpdate",
    "tailnet": "example.com",
    "message": "Tailnet policy file updated",
    "data": {
      "newPolicy": "{\n\t\"acls\": [\n\t\t{\"action\": \"accept\", \"src\": [\"autogroup:member\"], \"dst\": [\"*:*\"]},\n\t],\n}",
      "oldPolicy": "{\n\t\"acls\": [\n\t\t{\"action\": \"accept\", \"src\": [\"*\"], \"dst\": [\"*:*\"]},\n\t],\n}",
      "url": "https://console.tailscale.com/admin/acls",
      "actor": "admin@example.com"
    }
  },
  {
    "timestamp": "2022-11-08T10:26:08.775392-08:00",
    "version": 1,
    "type": "nodeKeyExpiringInOneDay",
    "tailnet": "example.com",
    "message": "Node alice-workstation1.yak-bebop.ts.net key expiring in less than one day",
    "data": {
      "nodeID": "nFJw3SRKTM59",
      "url": "https://console.tailscale.com/admin/machines/100.12.345.67",
      "deviceName": "alice-workstation1.yak-bebop.ts.net",
      "managedBy": "alice@example.com",
      "actor": "expiring-node-key-marker",
      "expiration": "2022-11-08T18:44:46.979292Z"
    }
  },
  {
    "timestamp": "2022-11-08T10:45:08.775392-08:00",
    "version": 1,
    "type": "nodeKeyExpired",
    "tailnet": "example.com",
    "message": "Node alice-workstation1.yak-bebop.ts.net key recently expired",
    "data": {
      "nodeID": "nFJw3SRKTM59",
      "url": "https://console.tailscale.com/admin/machines/100.12.345.67",
      "deviceName": "alice-workstation1.yak-bebop.ts.net",
      "managedBy": "alice@example.com",
      "actor": "expiring-node-key-marker",
      "expiration": "2022-11-08T18:44:46.979292Z"
    }
  },
  {
    "timestamp": "2023-02-27T11:49:25.208092-08:00",
    "version": 1,
    "type": "userRoleUpdated",
    "tailnet": "example.com",
    "message": "User alice@example.com role changed",
    "data": {
      "user": "alice@example.com",
      "url": "https://console.tailscale.com/admin/users?q=alice%40example.com",
      "actor": "admin@example.com",
      "oldRoles": ["Member"],
      "newRoles": ["Member", "IT admin"]
    }
  }
]
```

## 测试你的 webhook

要确保端点配置正确、能够接收来自 Tailscale 的事件，你可以发送一个测试事件：

1. 打开管理控制台的 [Webhooks](https://console.tailscale.com/admin/settings/webhooks) 页面。

2. 找到要测试的端点，选择页面右侧的  菜单，然后选择 **Test endpoint**。

3. 选择 **Send test event**。如果你的 webhook 配置正确，几秒内你的 webhook 端点应会收到一个类型为"test"的事件。

## 事件发送失败后的重试

Tailscale 通常会在事件发生后的几秒内把事件通知发送到 webhook。如果事件通知未能成功发送（例如 Tailscale 收到 `3xx`、`4xx` 或 `5xx` 错误，或你的 webhook 端点完全没有响应），Tailscale 会重试发送该事件。对于发送失败的事件，我们会每小时重试一次，最长持续 24 小时。

## 更新订阅的事件

1. 打开管理控制台的 [Webhooks](https://console.tailscale.com/admin/settings/webhooks) 页面。

2. 找到要更新的端点，选择页面右侧的  菜单，然后选择 **Edit**。

3. 勾选你想接收通知的事件，取消勾选不想接收的事件。

4. 选择 **Edit endpoint**。

## webhook 密钥

Webhook 密钥是 Tailscale 与 webhook 端点创建者之间共享的签名密钥，每个端点各不相同。如果这个共享密钥被窃取或泄露，任何知道该密钥的人都能发送伪造事件。如果你怀疑密钥已泄露，请[创建新密钥][docs-rotate-webhook-secret]。

Webhook 密钥没有有效期。

## 轮换 webhook 密钥

创建新 webhook 密钥请参阅[轮换新的 webhook 密钥][docs-rotate-webhook-secret]。创建新密钥后，请更新你的 webhook 端点以使用新密钥。

## 删除端点

1. 打开管理控制台的 [Webhooks](https://console.tailscale.com/admin/settings/webhooks) 页面。

2. 找到要删除的端点，选择页面右侧的  菜单，然后选择 **Delete**。

3. 选择 **Delete endpoint**，确认你要删除该端点。

## 为现有端点使用新 webhook

要为现有端点添加新的 webhook（订阅事件），请[编辑该端点][ar-updating-subscribed-events]，而不是另建一个端点。

## webhook 操作的审计日志

在[配置审计日志][docs-audit-logging]中，每当 webhook 被创建、删除或更新时，你的审计日志都会记录一条操作。日志条目会显示由谁执行了该操作，以及操作发生的时间。

## 验证事件签名

你可以验证事件是否由你与 Tailscale 之间共享的 [webhook 密钥][ar-webhook-secret]签名。注意，这并不一定意味着事件来自 Tailscale，而是意味着事件来自一个知晓你与 Tailscale 之间共享密钥的实体。

来自 Tailscale 的事件包含一个 `Tailscale-Webhook-Signature` 请求头。`Tailscale-Webhook-Signature` 请求头包括一个时间戳和一个签名：

```
Tailscale-Webhook-Signature:t=1663781880,v1=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

以 `t=` 为前缀的时间戳是事件发生时的 epoch 时间（以秒计）。以 `v1=` 为前缀的签名是使用 SHA-256 的基于哈希的消息认证码（HMAC）。签名唯一支持的方案是 `v1`。

大多数现代编程语言都提供了用于计算和比较 HMAC 的库。以下流程描述了如何验证签名。

1. 从 `Tailscale-Webhook-Signature` 请求头解析事件时间戳和签名。

   以 `,` 字符为分隔符，把 `Tailscale-Webhook-Signature` 数据拆分成元素列表。然后以 `=` 字符拆分每个元素，得到两个键值对。第一个键是 `t`，其值为事件时间戳；第二个键是 `v1`，其值为事件签名。

2. 把事件时间戳（`t` 的值）与当前时间比较。例如，如果你的验证流程在事件一收到就立即处理，而事件时间比当前时间早 5 分钟以上，你可以将该事件视为重放攻击。

3. 创建一个待签名的字符串 `string_to_sign`，由以下内容拼接而成：

   * 时间戳（`t` 的值）的字符串表示。
   * `.` 字符。
   * 解码后的事件请求正文。注意它在请求本身中，而不是在 `Tailscale-Webhook-Signature` 请求头中。请求正文包含编码后的[事件载荷][ar-events-payload]，签名前你需要先解码请求正文。

4. 计算 `string_to_sign` 的签名。

   使用 SHA256 哈希函数创建 HMAC。用你的 webhook 密钥作为签名密钥，用 `string_to_sign` 作为待签名的消息。

5. 使用 HMAC 比较函数，把 `Tailscale-Webhook-Signature` 请求头中的签名（`v1` 的值）与你在上一步创建的签名进行比较。如果两者不一致，说明该事件的载荷不是由你的 webhook 密钥签名的，该事件不应被视为来自 Tailscale 的事件。

### 验证代码示例

如需帮助验证签名，请查看我们的 [Go 示例代码][xt-gh-tailscale-webhooks-example]。

[ar-events-payload]: #事件载荷

[ar-testing-your-webhook]: #测试你的-webhook

[ar-updating-subscribed-events]: #更新订阅的事件

[ar-webhook-secret]: #webhook-密钥

[bl-tailscale-key-management-node-keys]: https://tailscale.com/blog/tailscale-key-management#node-keys

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-audit-logging-log-structure]: /docs/features/logging/audit-logging#log-structure

[docs-changing-user-roles]: /docs/features/sharing/how-to/change-role

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-device-approval-pre-approve]: /docs/features/access-control/device-management/device-approval#pre-approve-devices-with-an-auth-key

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-exit-nodes-linux-advertise]: /docs/features/exit-nodes?tab=linux#advertise-a-device-as-an-exit-node

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-rotate-webhook-secret]: /docs/features/webhooks/how-to/rotate-webhook-secret

[docs-subnets]: /docs/features/subnet-routers

[docs-subnets-linux-ip-forwarding]: /docs/features/subnet-routers?tab=linux#enable-ip-forwarding

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-user-approval]: /docs/features/access-control/user-approval

[xt-discord-webhooks]: https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks

[xt-gh-tailscale-webhooks-example]: https://github.com/tailscale/tailscale/blob/main/docs/webhooks/example.go

[xt-google-chat-webhooks]: https://developers.google.com/chat/how-tos/webhooks

[xt-mattermost-webhooks]: https://developers.mattermost.com/integrate/webhooks

[xt-slack-webhooks]: https://api.slack.com/messaging/webhooks
