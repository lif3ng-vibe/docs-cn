---
title: "声明式节点共享"
description: "使用策略定义共享关系，跨可信 tailnet 授予资源访问权限。"
---

最后验证于 Aug 26, 2026

> **注意：** 声明式节点共享目前处于 alpha 阶段。

声明式节点共享（declarative node sharing）让你可以把 tailnet 中的资源（包括监控系统、构建服务器或开发环境）开放给多个可信 tailnet 中的用户和设备。做法是在 [tailnet 策略文件][docs-tailnet-policy-file]中定义共享关系。

当你的组织运营多个可信 tailnet 并需要在它们之间提供访问时，可以使用声明式节点共享。例如：

* **共享集中式基础设施**：让不同 tailnet 中的用户访问共享的基础设施或应用，例如监控或开发资源。
* **连接业务部门或被收购的组织**：在不同团队、子公司或被收购公司运营的 tailnet 之间共享选定的资源，同时保持各 tailnet 独立管理。
* **支持机器对机器访问**：通过策略让一个 tailnet 中的打标签设备访问另一个 tailnet 中的资源。

[基于链接的节点共享][docs-sharing]是把单个节点共享给单个用户，而声明式节点共享工作在策略层面。管理员用策略控制在 tailnet 边界之间共享哪些资源，无需逐一管理每个节点共享。

> **警告：**
>
> 声明式节点共享假定双方 tailnet 的管理员之间存在信任关系，但并不会建立这种关系。不要用它向未知或不受信任的 tailnet 共享资源。
>
> 如果你只需要把单台机器共享给你 tailnet 之外的特定用户，请改用[基于链接的节点共享][docs-sharing]。

## 工作原理

声明式节点共享采用双方确认（double opt-in）模式：由管理员分别配置各 tailnet 的策略文件，只有双方都配置到位，访问才会生效。

两个 tailnet 各有明确的角色：

* 接收方 tailnet 控制外部 tailnet 可以引用它本地的哪些组和[标签][docs-tags]。
* 共享方 tailnet 编写[授权][docs-grants]，让这些外部组或标签可以访问特定的本地资源。

## 开始之前

配置声明式节点共享之前，请先完成以下事项：

* 与对方 tailnet 的管理员交换 tailnet ID。tailnet ID 可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general)（常规）页面的 **Unique IDs**（唯一 ID）部分找到。
* 商定接收方 tailnet 中哪些组和标签将获得访问权限，并确认它们已在该 tailnet 的策略文件中定义。声明式共享只能引用策略文件中定义的组和标签。注意，不支持 SCIM 或 Google 组等同步组。

## 访问声明式节点共享

要使用声明式节点共享，请在管理控制台中更新 tailnet 策略文件。

1. 打开管理控制台的 [General](https://console.tailscale.com/admin/settings/general)（常规）页面。
2. 进入 **Feature previews**（功能预览）。
3. 在 **Declarative Node Sharing** 旁边，选择 **Manage in policy**（在策略中管理）。
4. 按照下面的指引继续更新 tailnet 策略文件。

## 配置声明式节点共享

两个 tailnet 都必须更新各自的 tailnet 策略文件。

### 配置接收方 tailnet

在接收方 tailnet 中，先在其策略的 `externalTailnets` 部分定义共享方 tailnet，再明确允许该 tailnet 引用选定的本地组或标签。

例如：

```json
{
  "externalTailnets": {
    "<tailnet-alias>": {
      "externalID": "<sharing-tailnet-id>",
      "allowIncomingConnections": false,
      "allowExternalReferencesTo": [
        "group:<group-name>"
      ]
    }
  },

  "groups": {
    "group:<group-name>": [
      "<user-1>",
      "<user-2>"
    ]
  }
}
```

`allowExternalReferencesTo` 控制外部 tailnet 可以在其策略中引用的本地组或标签列表。

### 配置共享方 tailnet

在共享方 tailnet 中，在其自身的 `externalTailnets` 部分定义接收方 tailnet：

```json
{
  "externalTailnets": {
    "<tailnet-alias>": {
      "externalID": "<receiving-tailnet-id>",
      "allowIncomingConnections": true,
    }
  }
}
```

`allowIncomingConnections` 必须设为 `true`，表示共享方 tailnet 接受来自该 tailnet 的入站流量。
随后，共享方 tailnet 就可以创建授权，指定外部 tailnet 中的哪些组/标签可以访问某个本地资源。

例如：

```json
{
  "grants": [
    {
      "src": [
        "group://<tailnet-alias>/<group-name>"
      ],
      "dst": [
        "<resource>"
      ],
      "ip": [
        "*"
      ]
    }
  ]
}
```

外部组使用以下语法：

```
group://<tailnet-alias>/<group-name>
```

外部打标签设备使用：

```
tag://<tailnet-alias>/<tag-name>
```

将外部组或标签用作授权的 `src`。`dst` 指定它在共享方 tailnet 中可以访问的资源。
如果引用了接收方 tailnet 未列入其 `allowExternalReferencesTo` 列表的组或标签，该授权规则将被忽略。

## 连接到共享资源

双方 tailnet 都更新 tailnet 策略文件后，获得许可的用户和设备就可以直接连接到共享资源。可以使用：

* 资源的 Tailscale IP 地址。
* 其完全限定的 [MagicDNS][docs-magicdns] 名称，例如 `machine.example.ts.net`。

跨 tailnet 连接时必须使用完全限定的 MagicDNS 名称。像 `machine` 这样的短 MagicDNS 名称是不够的。

不需要单独的邀请或接受共享步骤。

## 声明式共享与基于链接的节点共享的对比

声明式节点共享专为可信 tailnet 之间持续的共享关系而设计。管理员通过策略定义访问权限，且双方 tailnet 都明确选择建立这种关系。

基于链接的节点共享则用于把单台机器共享给你 tailnet 之外的某位 Tailscale 用户。由管理员创建共享，接收者接受共享。

两种方法可以继续同时使用。声明式共享不会更改或取代现有的基于链接的共享。

## 局限性

* 目前不支持共享 [Tailnet services][docs-tailnet-services] 和[出口节点][docs-exit-nodes]。
* 通过声明式节点共享的节点不会向对方 tailnet 通告来自[子网路由器][docs-subnet-routers]的子网。

### 使用限制

在声明式节点共享处于 alpha 阶段期间，适用以下使用限制：

* 你最多可以与 3 个其他 tailnet 共享。策略的 `externalTailnets` 部分最多可包含 3 个 tailnet 定义。
* 每个 tailnet 最多可有 500 个节点。只要有一个 tailnet 超过 500 个节点，这些 tailnet 之间的共享授权就会被丢弃。

[ar-sharing-limitations]: #局限性

[docs-grants]: /docs/reference/syntax/grants

[docs-magicdns]: /docs/features/magicdns

[docs-sharing]: /docs/features/sharing#通过链接共享

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet-services]: /docs/features/tailscale-services

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-exit-nodes]: /docs/features/exit-nodes
