---
title: "认证密钥"
description: "预认证密钥（auth key）让你无需通过网页浏览器登录即可注册新节点。在启动容器、物联网设备、使用基础设施"
---

最后验证于 Jun 30, 2026

> **注意：** 认证密钥适用于[所有套餐](https://tailscale.com/pricing)。

预认证密钥（pre-authentication key，即认证密钥）让你无需通过网页浏览器登录即可注册新节点。这种方式最适合用于启动容器、物联网设备、使用 Terraform 等基础设施即代码（IaC）系统，或认证 iOS 和 Android 等移动设备。

认证密钥会将设备认证为生成该密钥的用户。也就是说，如果 Alice 生成了一个认证密钥，并用它把一台服务器加入她的 tailnet，那么这台设备就以 Alice 的身份完成认证。可以把它理解为登录一台设备。

不过，如果将[标签][docs-tags-auth-key-tag]与认证密钥配合使用，设备在以生成该认证密钥的用户身份登录后，会转而采用该认证密钥所含标签的身份。

> **注意：**
>
> 作为直接创建认证密钥的替代方案，可以考虑使用 [OAuth 客户端][docs-oauth-clients]。你可以使用 OAuth 客户端和 [Tailscale API][docs-api] 以编程方式创建认证密钥。若要为携带单个用户身份（而非标签身份）的设备进行配置，参见[使用 OAuth 应用预配置设备][docs-device-provisioning]。

## 认证密钥的类型

认证密钥可以分为：

* **一次性（one-off）**，仅限单次使用。它只能用来连接一台设备或服务器一次。适用于你无法在设备上亲自完成认证的场景，此时使用密钥更为实际。例如，云服务器可以用一次性密钥来连接。
* **可重复使用（reusable）**，可多次使用。它可用于连接多台设备。例如，本地部署数据库的多个实例可以用可重复使用密钥来连接。

> **警告：**
>
> **务必谨慎使用可重复使用的密钥！**一旦被窃取，后果可能非常严重。最好将其保存在专门为此设计的密钥保险库产品中。

## 密钥过期

认证密钥会在你生成密钥时所指定的天数之后自动过期。密钥过期的天数可自选，范围是 1 到 90 天（含两端）。如果不指定过期时间，认证密钥将在最长 90 天后过期。如果想在密钥过期后继续使用，需要生成新密钥。

你可以通过管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，或 [Tailscale API][docs-api] 中的 [Update device key][co-api-update-device-key] 方法，在设备上启用或禁用密钥过期。

认证密钥过期后，由它授权的设备仍保持授权状态，直到其[节点密钥][docs-key-expiry]过期。每台设备在你登录 Tailscale 时都会生成一个节点密钥，并使用它向 tailnet 标识自己。默认情况下，节点密钥每 180 天自动过期。你可以在管理控制台 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面的 **Key Expiry** 区域更改默认的节点密钥过期时间。

[查看密钥管理相关内容][bl-tailscale-key-management-node-keys]。

### 已打标签设备的密钥过期

[打了标签][docs-tags-auth-key-tag]设备的密钥过期默认处于禁用状态。如果你通过管理控制台、[Tailscale CLI][docs-cli] 或 [Tailscale API][docs-api] 更改设备上的标签，设备的密钥过期设置不会变化，除非你重新认证。也就是说，原本启用就保持启用，原本禁用就保持禁用。重新认证之后，设备的密钥过期将被禁用。

> **注意：**
>
> 你可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面查看最近吊销或过期的密钥。

## 生成认证密钥

你必须成为 tailnet 的 [Owner、Admin、IT admin 或 Network admin](/docs/reference/user-roles) 才能生成密钥。

要生成认证密钥：

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。

2. 选择 **Generate auth key**。

3. 填写表单字段，指定认证密钥的各项特性，例如描述、[是否可重复使用][ar-types-of-auth-keys]、过期时间以及设备设置。

   设备设置区域可以为认证密钥设置特殊属性：

   * 启用 **Ephemeral**，在设备离线后自动移除该认证密钥。
   * 启用 **Pre-approved**，如果你的 tailnet 启用了[设备审批][docs-device-approval]，则自动授权设备。
   * 启用 **Tags**，自动为使用该认证密钥的设备[打标签][docs-tags-auth-key-tag]。

4. 选择 **Generate key**。

## 使用认证密钥注册节点

使用 CLI 注册节点时，请在 [`tailscale up`][docs-tailscale-up] 命令中使用 `--auth-key` 选项提供密钥，从而跳过交互式登录：

```shell
sudo tailscale up --auth-key=tskey-abcdef1432341818
```

> **注意：**
>
> Tailscale 生成的认证密钥区分大小写。

## 使用认证密钥注册移动设备

要使用认证密钥注册移动设备：

1. 在 iOS 或 Android 设备上打开 Tailscale 应用。
2. 在登录界面，选择右上角的菜单。
3. 选择 **Use an auth key**。
4. 粘贴认证密钥，然后确认。

> **注意：**
>
> Tailscale 生成的认证密钥区分大小写。

> **注意：**
>
> 要在受管理的移动设备上批量部署认证密钥，可以通过你的 MDM 方案配置 `AuthKey` 策略设置。更多信息参见[使用系统策略自定义 Tailscale][docs-system-policies]。

## 吊销认证密钥

你必须成为 tailnet 的 [Owner、Admin、IT admin 或 Network admin](/docs/reference/user-roles) 才能吊销密钥，并且只能吊销你自己创建的密钥。[一次性密钥][ar-authkey-one-off]在被使用后会被 Tailscale 自动吊销。

要吊销密钥：

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。
2. 在下方表格中找到该密钥，选择 **Revoke**。

> **注意：**
>
> 吊销密钥不会取消使用该密钥的节点的授权。要取消节点授权，请在 [Machines](https://console.tailscale.com/admin/machines) 页面将其删除。

## 最佳实践

根据你要认证的设备类型，可以考虑使用具备以下特性的认证密钥：

* **临时（ephemeral）**，用于对作为短生命周期工作负载一部分的[临时节点][docs-ephemeral-nodes]进行认证。由于工作负载重启后节点密钥不会保留，它们会以另一个节点的身份重新连接。Tailscale 会自动移除不活跃的节点。例如，容器或 Lambda 函数应使用临时密钥来连接。
* **预批准（pre-approved）**，适用于服务器。如果你的 tailnet 启用了[设备审批][docs-device-approval]，这种密钥让你无需额外授权即可将设备加入 tailnet。例如，在启用了设备审批的网络中，服务器这类共享设备应使用预批准认证密钥来连接。
* **预签名（pre-signed）**，适用于认证密钥在[签名节点][docs-tailnet-lock-add]上本地签名的节点，适用于启用了 [Tailnet Lock][docs-tailnet-lock] 的 tailnet。只有通过 [`tailscale lock sign`][docs-tailscale-lock-lock-sign] CLI 命令，才能将认证密钥（无论以何种方式创建）变为预签名状态。
* **带标签（tagged）**，适用于服务器。在认证密钥中包含[标签][docs-tags-auth-key-tag]即可自动为设备应用标签。基于标签限制设备权限的访问控制策略会在设备配置完成后生效。例如，服务器这类共享设备应使用带标签的认证密钥来连接。

[ar-authkey-one-off]: #authkey-one-off

[ar-types-of-auth-keys]: #认证密钥的类型

[bl-tailscale-key-management-node-keys]: https://tailscale.com/blog/tailscale-key-management#node-keys

[co-api-update-device-key]: https://tailscale.com/api#tag/devices/POST/device/%7BdeviceId%7D/key

[docs-api]: /docs/reference/tailscale-api

[docs-cli]: /docs/reference/tailscale-cli

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-system-policies]: /docs/features/tailscale-system-policies

[docs-tags-auth-key-tag]: /docs/features/tags#best-practices

[docs-tailnet-lock-add]: /docs/features/tailnet-lock#add-a-node-to-a-locked-tailnet

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailscale-lock-lock-sign]: /docs/reference/tailscale-cli/lock#lock-sign

[docs-tailscale-up]: /docs/reference/tailscale-cli/up
