---
title: "推荐出口节点"
description: "推荐出口节点（也称建议出口节点）是 Tailscale 基于位置和延迟等客户端信息推荐给你的[出口节点][docs-exit-node]或 [Mullvad 出口节点][docs-mullvad-exit-node]"
---

最后验证于 Oct 7, 2026

> **注意：**
>
> 推荐出口节点面向 [Standard、Premium 和 Enterprise 套餐][co-pricing]，以及已购买 [Mullvad][docs-mullvad-exit-node] 附加服务的客户。

推荐出口节点（recommended exit node，也称建议出口节点/suggested exit node）是 Tailscale 基于位置和延迟等客户端信息推荐给你的[出口节点][docs-exit-node]或 [Mullvad 出口节点][docs-mullvad-exit-node]。推荐不会改变你手动选择的出口节点。你可以一次性采纳某个推荐，也可以将客户端配置为自动跟踪推荐。[系统策略][docs-mandatory-exit-nodes]可以强制要求自动选择，但启用该功能本身并不需要系统策略。

## 工作原理

在选择推荐出口节点时，Tailscale 优先考虑非 Mullvad 出口节点。如果 tailnet 中有任何标准出口节点可用，Tailscale 会优先推荐它们。如果没有标准出口节点可用，Tailscale 会在存在可用的 Mullvad 出口节点时推荐其中一个。

标准出口节点与 Mullvad 出口节点的选择逻辑不同。Tailscale 使用延迟和性能信息来选择推荐的标准出口节点。由于 Tailscale 没有 Mullvad 出口节点的性能信息，它会基于位置来选择推荐。

### 面向出口节点的 MagicRoute

当你的 tailnet 选择加入 MagicRoute beta 后，运行 Tailscale v1.86.0 或更高版本的客户端可以使用其优先级评分来生成出口节点推荐。较旧的客户端保持现有的推荐行为。详情与限制参见 [MagicRoute][docs-magicroute]。

MagicRoute 要求 tailnet 为符合路由选择（route selection）条件的 Premium 或 Enterprise 套餐。不使用 MagicRoute 你也可以使用推荐出口节点。

## 使用建议出口节点

你可以通过 [Tailscale CLI][docs-tailscale-cli] 或 Tailscale 客户端使用推荐出口节点。

#### Tailscale CLI

使用 Tailscale CLI 一次性选择建议出口节点的步骤：

1. 使用以下命令查看推荐出口节点：

   ```shell
   tailscale exit-node suggest
   ```

   该命令会返回建议出口节点的 ID。

   ```
   Suggested exit node: <ID>.
   To accept this suggestion, use `tailscale set --exit-node=<ID>`.
   ```

2. 运行带 `--exit-node=<ID>` 标志的 `tailscale set` 来使用建议出口节点。

   ```shell
   tailscale set --exit-node=<ID>
   ```

如果要改为自动跟踪推荐，运行：

```shell
tailscale set --exit-node=auto:any
```

当可用出口节点或网络状况发生变化时，你的客户端会自动切换到建议出口节点。详情参见 [`tailscale set`][docs-tailscale-cli-set]。

#### Tailscale 客户端

要使用 Tailscale 客户端选择建议出口节点，在 **Exit Nodes** 菜单中选择 **Recommended**。

## 强制使用出口节点

你可以基于系统策略强制设备使用出口节点，这些策略可以通过移动设备管理（MDM）方案下发。详情参见[强制出口节点][docs-mandatory-exit-nodes]。

[co-pricing]: https://tailscale.com/pricing

[docs-exit-node]: /docs/features/exit-nodes

[docs-magicroute]: /docs/features/magicroute

[docs-mandatory-exit-nodes]: /docs/features/exit-nodes/mandatory-exit-nodes

[docs-mullvad-exit-node]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-tailscale-cli]: /docs/reference/tailscale-cli

[docs-tailscale-cli-set]: /docs/reference/tailscale-cli#set
