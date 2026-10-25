---
title: "使用设备态势实现即时访问"
description: "使用设备态势实现对 tailnet 中资源的即时访问。"
---

最后验证于 Jan 19, 2026

> **注意：** 即时访问适用于 [Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

如[即时访问][docs-just-in-time-access]中所述，Tailscale 提供了多种方式，可用于授予对 Tailscale 网络（即 tailnet）中资源的即时访问（JIT）。

本主题介绍如何在 JIT 中使用带过期时间的自定义设备态势属性，并提供一个 Slack 工作流示例，让用户可以通过 Slack 请求临时访问。

设备属性有一个[可选的 `expiry` 属性][ar-expiry-property]，让你可以设置一个未来时间使属性过期。设置后，设备属性会在指定时间自动过期。你可以利用这一点，通过在给定时间段内为设备分配 `custom:prodAccess` 之类的属性，提供对资源的即时访问。

## Tailscale Slack Accessbot

[Tailscale Access][xt-accessbot] 是 Tailscale 开发的一个开源示例 [Slack Workflow App][xt-slack-automation]，让用户可以在 Slack 中向组织内的其他人请求即时、限时的 Tailscale 资源访问权限。

在 Slack 中，用户可以使用 Request Tailscale Access 快捷方式连接到 Tailscale Access。该快捷方式会提示用户填写：

* 想访问什么
* 想从哪台设备访问
* 需要访问多长时间
* 由谁来批准这次访问
* 为什么需要这次访问

*（图：Slack 中的 Tailscale Access 请求访问表单）*

如果存在归属于某个用户的 Tailscale 设备、且该用户的电子邮件地址与发起请求的 Slack 用户相匹配，就会显示这些设备的列表。同时还会向该用户展示 tailnet 中所有设备的列表。

请求提交后，所选的审批人会收到通知，可以选择批准或拒绝该请求。批准后，工作流会将所需的属性添加到所选设备上，并将过期时间设置为所选时长。

有关配置、部署 Accessbot 或基于它开发的详细说明，请参阅 GitHub 上的 [`tailscale/accessbot` 仓库][xt-accessbot]。

## 带过期时间的态势属性 API

如果 Tailscale Slack Accessbot 不能满足你的需求，你可以使用带过期时间的自定义设备态势属性，为你的组织构建类似的工具。本节是[设备态势][docs-device-posture]主题中[态势属性 API][co-api-device-posture-attr]的扩展版本，包含有关属性过期的更多信息。

### 使用 API 获取态势属性

```
GET /api/v2/device/{deviceID}/attributes
```

检索指定设备的所有态势属性。返回一个 JSON 对象，包含该设备所有态势属性的键值对。

#### 参数

##### `deviceID`（URL 路径中必填）

要获取其态势属性的设备 ID。

#### 请求示例

```shell
curl "https://api.tailscale.com/api/v2/device/11055/attributes" \
-u "tskey-api-xxxxx:"
```

#### 响应

成功时响应为 `200`。响应体是一个 JSON 对象，包含分配给该节点的所有态势属性。属性值可以是字符串、数字或布尔值。

```json
{
  "attributes": {
    "custom:myScore": 87,
    "custom:diskEncryption": true,
    "custom:myAttribute": "my_value",
    "node:os": "linux",
    "node:osVersion": "5.19.0-42-generic",
    "node:tsReleaseTrack": "stable",
    "node:tsVersion": "1.40.0",
    "node:tsAutoUpdate": false
  },
  "expiries": {
    "custom:myScore": "2024-04-23T18:25:43.511Z",
  }
}
```

* `attributes`：与给定节点关联的所有属性的键值映射。值可以是数字、字符串或布尔值。

* `expiries`：具有过期时间的属性及其到期时间的键值映射。没有过期时间的属性会被省略。如果没有任何带过期时间的属性，整个 `expiries` 字段会被省略。

### 使用 API 设置自定义态势属性

```
POST /api/v2/device/{deviceID}/attributes/{attributeKey}
```

在指定设备上创建或更新自定义态势属性。用户管理的属性必须位于 `custom` 命名空间中，即在属性键前加上 `custom:` 前缀。

#### 参数

##### `deviceID`（URL 路径中必填）

要在其上设置自定义态势属性的设备 ID。

##### `attributeKey`（URL 路径中必填）

要设置的态势属性的名称。必须以 `custom:` 为前缀。

键（包括命名空间）的最大长度为 128 个字符，且只能包含字母、数字、下划线和冒号。

键区分大小写。键必须唯一，但唯一性检查不区分大小写。例如，`custom:MyAttribute` 和 `custom:myattribute` 不能在同一个 tailnet 中同时设置。

同一个键的所有值必须类型相同，类型在为该键写入第一个值时确定。例如，在同一个 tailnet 中，`custom:myattribute` 不能在一个节点上是数字值（`87`），而在另一个节点上是字符串值（`"78"`）。

##### 态势属性 `value`（POST 请求体中必填）

```json
{
  "value": "foo"
}
```

值可以是字符串、数字或布尔值。

字符串值的最大长度为 255 个字符，且只能包含字母、数字、下划线和句点。

数字值必须是整数，并且是 JSON 安全数字（最大到 2^53 - 1）。

##### 态势属性 `expiry`（POST 请求体中可选）

```json
{
  "value": "foo",
  "expiry": "2024-04-23T18:25:43.511Z"
}
```

过期时间可以是未来的任意时间，格式为 [RFC3339][xt-rfc-3339] 字符串。设置后，设备属性会在指定时间被自动移除。

##### 态势属性 `comment`（POST 请求体中可选）

```json
{
  "value": "foo",
  "expiry": "2024-04-23T18:25:43.511Z",
  "comment": "access needed to inspect logs on prod vm"
}
```

可以添加备注，说明添加该属性的原因。

#### 请求示例

```shell
curl "https://api.tailscale.com/api/v2/device/11055/attributes/custom:my_attribute" \
-u "tskey-api-xxxxx:" \
--data-binary '{"value": "my_value", "expiry": "2024-04-23T18:25:43.511Z"}'
```

#### 响应

成功时响应为 `2xx`。响应体目前是一个空的 JSON 对象。

[ar-expiry-property]: #态势属性-expirypost-请求体中可选

[co-api-device-posture-attr]: https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D/attributes

[docs-device-posture]: /docs/features/device-posture

[docs-just-in-time-access]: /docs/features/access-control/just-in-time-access

[xt-accessbot]: https://github.com/tailscale/accessbot

[xt-rfc-3339]: https://www.rfc-editor.org/rfc/rfc3339.html

[xt-slack-automation]: https://api.slack.com/automation
