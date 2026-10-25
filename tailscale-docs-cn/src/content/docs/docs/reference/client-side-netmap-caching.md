---
title: "客户端 netmap 缓存"
description: "客户端网络地图缓存（“netmap caching”）让节点在暂时无法连接 Tailscale 控制平面（控制平面提供节点连接所需的网络状"
---

最后验证于 Sep 1, 2026

> **注意：**
>
> 客户端 netmap 缓存适用于 Tailscale 1.104 及更高版本的客户端。

客户端网络地图缓存（client-side network map caching，简称 "netmap 缓存"）让节点在暂时无法连接 Tailscale 控制平面时，也能开始或恢复与对等节点的通信；控制平面提供节点连接所需的网络状态与对等节点信息。这种情况可能由多种原因导致，包括控制平面停机，或中间网络明确阻断控制平面服务器。

网络地图缓存还能缩短启动与切换 profile 的时间。

> **警告：**
>
> 客户端 netmap 缓存并不保证节点能使用缓存的网络状态进行通信。它并非为长期脱离控制平面运行而设计，因为缓存状态会随时间推移而过时或失效。

## 缓存生命周期

网络地图（netmap）告知节点它的对等节点有哪些以及如何连接它们。在没有客户端 netmap 缓存的情况下，客户端只能直接从控制平面获取 netmap。如果控制平面不可达，离线客户端将无法连接 tailnet 中的其他节点。

* **缓存初始化**：首次启用客户端 netmap 缓存时，客户端会用来自控制平面的当前网络地图初始化缓存。
* **缓存加载**：客户端启动或切换 profile 时，会加载可用的缓存网络地图，并立即进入运行状态。
* **缓存刷新**：从缓存网络地图启动后，客户端会持续尝试联系控制平面。重新连接后，只要网络地图发生变化，它就会更新缓存。
* **缓存有效性**：缓存有效性受节点密钥（node key）过期的影响。如果某个对等节点的节点密钥过期，该密钥即告失效，客户端将无法与该对等节点通信。如果节点自身的密钥过期，即使其他节点缓存中的密钥仍然有效，它也无法与 tailnet 中的其他节点通信。过期密钥必须从控制平面更新后才能恢复通信。
* **缓存重置**：有两种常见情况会清除缓存的 netmap：
  * 从客户端删除用户 profile。
  * 退出登录 tailnet。

## 启用客户端 netmap 缓存

> **警告：**
>
> 在试用阶段，客户端 netmap 缓存为可选启用。只有被授予 `cache-network-maps` 节点属性的节点才会使用该特性。

要启用客户端 netmap 缓存，请在 [tailnet 策略文件][docs-tailnet-policy-file]中向相应节点授予 [`cache-network-maps` 节点属性][docs-policy-file-attr]。

以下示例为 tailnet 成员（`autogroup:member`）管理的所有节点以及所有带标签节点（`autogroup:tagged`）启用 netmap 缓存：

```json
"nodeAttrs": [
    {
       "target": ["autogroup:member", "autogroup:tagged"],
       "attr":   ["cache-network-maps"],
    },
],
```

> **注意：**
>
> 并非所有节点类型都支持客户端 netmap 缓存。更多信息请参阅[节点类型限制][ar-node-type-limitations]。

### 验证客户端 netmap 缓存已启用

使用以下命令验证 `client-network-maps` 节点属性是否存在：

```shell
tailscale status --json | jq '.Self.CapMap|has("cache-network-maps")'
```

关于该命令的更多信息，请参阅 [Tailscale CLI 参考][docs-tailscale-cli-status]。

## 禁用客户端 netmap 缓存

> **警告：**
>
> 试用阶段结束后，客户端 netmap 缓存将成为默认行为，届时你可以选择通过一个新的节点属性来禁用客户端缓存。
>
> 试用阶段无需应用这个新节点属性。本节内容提前提供，用于告知即将推出的功能变更计划。

修改你的 [tailnet 策略文件][docs-tailnet-policy-file]，使用 [`disable-cache-network-maps` 节点属性][docs-policy-file-attr]来禁用客户端 netmap 缓存。

以下规则面向所有带有 `uncached` 标签的节点。

```json
"nodeAttrs": [
    {
       "target": ["tag:uncached"],
       "attr":   ["disable-cache-network-maps"],
    },
],
```

> **注意：**
>
> 如果同时设置了 `cache-network-maps` 和 `disable-cache-network-maps`，则禁用属性优先。

### 验证客户端 netmap 缓存已禁用

使用以下命令验证 `cache-network-maps` 节点属性不存在：

```shell
tailscale status --json | jq '.Self.CapMap|has("cache-network-maps")'
```

关于该命令的更多信息，请参阅 [Tailscale CLI 参考][docs-tailscale-cli-status]。

## 注意事项

> **注意：**
>
> 并非所有节点类型都支持客户端 netmap 缓存。更多信息请参阅[节点类型限制][ar-node-type-limitations]。

对于不常关机或重启的长驻连接器，可以考虑禁用 netmap 缓存，以减少磁盘活动与存储占用。这类连接器包括应用连接器、出口节点和子网路由器。

对于存储昂贵或有限的小型或嵌入式设备，也可以考虑禁用 netmap 缓存，以避免磨损负载与写入带宽方面的问题。

## 限制

客户端网络地图缓存存在以下限制：

* 暂不支持移动客户端。

### 节点类型限制

无论策略文档如何声明，以下节点均无法使用客户端 netmap 缓存：

* [临时节点（ephemeral node）][docs-ephemeral-nodes]

### 新对等节点的限制

基于缓存状态运行的客户端，无法与缓存创建之后加入 tailnet 的新对等节点建立连接，除非缓存已从控制平面更新。未连接控制平面的客户端将无从得知较新的节点。

[ar-node-type-limitations]: #节点类型限制

[docs-app-connectors]: /docs/features/app-connectors

[docs-custom-derps]: /docs/reference/derp-servers/custom-derp-servers

[docs-derps]: /docs/reference/derp-servers

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-peer-relays]: /docs/features/peer-relay

[docs-policy-file-attr]: /docs/reference/syntax/policy-file#attr

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-cli-status]: /docs/reference/tailscale-cli#status
