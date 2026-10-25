---
title: "节点属性与授权应用能力"
description: "了解一种能力究竟属于设备还是属于连接，以及节点属性与授权应用能力的区别。"
---

最后验证于 Jun 24, 2026

节点属性（node attribute）和授权应用能力（grant app capability）都通过 [tailnet 策略文件][docs-tailnet-policy-file]为设备附加额外能力。它们的区别在于能力所依附的对象：节点属性依附于设备，而授权应用能力依附于两台设备之间的连接。

本主题解释这一区别，以及如何判断一种能力应该放在哪里。本主题并不列出所有可用的属性或能力。完整清单请参阅[节点属性参考][docs-node-attributes]和[应用能力说明][docs-grants-app-capabilities]。

## 节点属性

tailnet 策略文件中的 [`nodeAttrs`][docs-node-attributes] 部分按身份为设备应用属性。每个条目指定一个 `target`（属性应用到的设备，按标签、用户、组或 `*` 选择）以及要应用的属性。节点属性没有源也没有目标，因此设备始终携带该属性。

```json
"nodeAttrs": [
  {
    "target": ["autogroup:member"],
    "attr":   ["funnel"],
  },
],
```

这为每个成员的设备授予使用 [Tailscale Funnel][docs-funnel] 的能力。Funnel 是设备的一种属性：设备要么能向互联网暴露服务，要么不能，与涉及哪台其他设备无关。

## 授权应用能力

[授权（grant）][docs-grants]定义哪些源设备（`src`）可以访问哪些目标设备（`dst`）。授权上的 [`app` 字段][docs-grants-app-capabilities]把应用能力附加到这条连接上，因此只有当 `src` 中的设备访问 `dst` 中的设备时，该能力才会生效。

```json
"grants": [
  {
    "src": ["tag:us-east-vpc"],
    "dst": ["tag:us-east-relays"],
    "app": {
      "tailscale.com/cap/relay": [],
    },
  },
],
```

这使带有 `tag:us-east-vpc` 标签的设备可以把带有 `tag:us-east-relays` 标签的设备用作[对等中继（peer relay）][docs-peer-relay]。该能力描述的是两组设备之间的关系：改变 `src` 或 `dst` 就会改变哪些设备可以通过哪些设备中继。

## 两个部分中的应用能力

`app` 映射并非授权独有。节点属性以两种形式携带设备属性：如上所示的 `attr` 标志（例如 `funnel`），以及结构化的 `app` 字段。授权同样接受 `app` 字段。同一种应用能力格式（`<domainName>/<capabilityName>` 映射到配置对象数组）既可以出现在 `nodeAttrs` 中，也可以出现在 `grants` 中。

一种能力是否使用 `app` 映射并不决定它应该放在哪里；放置位置才决定这一点。例如，你可以在 `nodeAttrs.app` 中用 `tailscale.com/app-connectors` 能力配置[应用连接器][docs-app-connectors]：

```json
"nodeAttrs": [
  {
    "target": ["tag:example-connector"],
    "app": {
      "tailscale.com/app-connectors": [
        {
          "name": "example-app",
          "connectors": ["tag:example-connector"],
          "domains": ["example.com"],
        },
      ],
    },
  },
],
```

应用连接器代表整个 tailnet 访问 `example.com`，与哪台设备向它发送流量无关，因此该能力描述的是连接器设备本身，放在 `nodeAttrs.app` 中。而对等中继的使用描述的是设备之间的关系，所以放在 `grants[].app` 中。`app` 映射在这两个部分中结构相同；它的放置位置记录了该能力究竟是设备属性还是连接属性。

## 如何选择

当一种能力与设备连接的对象无关、始终对设备成立时，使用节点属性。当能力只在特定的源到目标路径上生效时，使用授权应用能力。

| 对比维度              | 节点属性                                              | 授权应用能力                                                                                                        |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 依附对象              | 一台设备                                             | 两台设备之间的连接                                                                                                  |
| 策略文件部分          | `nodeAttrs`                                          | `grants`（`app` 字段）                                                                                              |
| 选择依据              | 设备身份（`target`：标签、用户、组或 `*`）           | `src` → `dst` 关系                                                                                                  |
| 条件过滤              | 无，仅按 `target` 身份选择                           | 按[设备态势][docs-device-posture]（`srcPosture`）限定范围，或经由特定设备路由（[`via`][docs-via]）                  |
| 作用范围              | 设备无论连接到哪里都适用                             | 仅当 `src` 设备访问 `dst` 设备时适用                                                                                |
| 示例                  | Funnel、应用连接器                                   | 对等中继的使用                                                                                                      |

放置位置决定作用范围，把能力放错部分会改变哪些设备拥有它、以及在什么时候拥有：

* 把连接能力写成节点属性会让它失去边界。属性仅按身份生效，没有 `src` 或 `dst`，因此设备会把这种能力带向它访问的每一个目标，而不只是你想要的那条路径。
* 把设备属性写成授权应用能力会让它获得本不该有的边界。授权只在列出的 `src` 访问列出的 `dst` 时才生效，因此在其他所有连接上都不存在这种能力，尽管该属性本应在设备上处处成立。

## 相关内容

* [节点属性参考][docs-node-attributes]：完整的 `nodeAttrs` 语法和可用属性。
* [应用能力][docs-grants-app-capabilities]：`app` 映射的工作方式以及 Tailscale 内置能力。
* [授权][docs-grants]：把能力限定到 `src` → `dst` 连接的访问控制语法。
* [授权与 ACL 的对比][docs-grants-vs-acls]：Tailscale 两种访问控制方法的相关比较。
* [使用 OAuth 应用预配设备][docs-device-provisioning]：自定义节点属性如何在预配时自动分配给设备。

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-posture]: /docs/features/device-posture

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-peer-relay]: /docs/features/peer-relay

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-via]: /docs/features/access-control/grants/grants-via
