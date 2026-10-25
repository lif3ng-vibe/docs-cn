---
title: "设备审批"
description: "设备审批功能让 Tailscale 网络管理员可以在新设备加入 Tailscale 网络（即 tailnet）之前进行审核与批准。使用设备审批可以确保只"
---

最后验证于 Jan 5, 2026

设备审批功能让 Tailscale 网络管理员可以在新设备加入 Tailscale 网络（即 tailnet）之前进行审核与批准。使用设备审批可以确保只有受信任的设备（例如由单位统一管理的笔记本电脑和手机）才能访问网络。

> **注意：** 设备审批适用于[所有套餐](https://tailscale.com/pricing)。

## 为你的网络启用设备审批

你必须成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能启用设备审批。

在管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面启用设备审批。

*（图：在管理控制台中启用设备审批。）*

## 在管理控制台中批准设备

你必须成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能批准设备。

启用该设置后，访问你的网络的新设备会显示一条通知，表明该设备正在等待批准。等待批准的设备在获得批准之前，无法在你的 Tailscale 网络上收发流量。

*（图：通知告知用户其设备正在等待批准。）*

要批准设备，请打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。列表顶部会显示待批准的设备，其下方带有 **Needs approval** 徽标。

*（图：待批准的设备会显示 Needs approval 徽标。）*

在决定是否批准之前，你可以查看设备和用户的详细信息。准备好批准该设备时，选择菜单并选择 **Approve**，允许该设备连接到你的网络。

*（图：批准设备以连接到你的网络。）*

批准后，设备将立即能够连接，无需重启或切换设置。

## 使用认证密钥预批准设备

生成新的[认证密钥][docs-auth-keys]时，你可以指定该密钥自动批准使用它进行认证的设备。

为此，你需要：

1. 生成一个预批准的认证密钥。
2. 然后在认证设备时指定该认证密钥。设备即被自动批准。

### 生成预授权的认证密钥

你必须成为 tailnet 的 [Owner、Admin、IT admin 或 Network admin](/docs/reference/user-roles) 才能生成认证密钥。

你可以通过管理控制台或 API 生成带标签的认证密钥。

在管理控制台中：

1. 进入管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。
2. 在 **Auth keys** 区域，选择 **Generate auth key**。
3. 选择 **Pre-approved**。只有当 tailnet 启用了设备审批时，此选项才可用。
4. 选择 **Generate** 生成认证密钥。

## 自动化设备审批

使用设备审批时，你可以创建一个流程，在设备满足特定条件（例如已在内部设备注册表中登记，或通过了第三方态势检查）时自动批准它。

1. 为 [`nodeNeedsApproval`][docs-webhooks-events] 配置 [webhook][docs-webhooks]。
2. 收到 webhook 消息后，根据你需要的信息核验该节点。
3. 通过向[设备授权 API][co-api-authorize-device] 发送 POST 请求来批准设备。例如：

```shell
curl "https://api.tailscale.com/api/v2/device/11055/authorized" \
-u "tskey-api-xxxxx:" \
--data-binary '{"authorized": true}'
```

你也可以以 `{"authorized": false}` 作为载荷调用同一 API，撤销对设备的授权。

## 限制

设备审批针对的是实际设备（如手机、笔记本电脑或虚拟机），而不是管理控制台中出现的 tailnet 节点。节点归属于特定用户或标签，而设备可能由多个用户共用。对于共享设备，无论有多少用户共用它、用它创建了多少个 tailnet 节点，都只需批准一次。如需更细粒度的节点访问管理，请使用[设备态势][docs-device-posture]。

[co-api-authorize-device]: https://tailscale.com/api#tag/devices/POST/device/%7BdeviceId%7D/authorized

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-posture]: /docs/features/device-posture

[docs-webhooks-events]: /docs/features/webhooks#events

[docs-webhooks]: /docs/features/webhooks
