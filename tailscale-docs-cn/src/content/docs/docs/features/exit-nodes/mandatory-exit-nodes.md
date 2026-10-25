---
title: "强制出口节点"
description: "你可以使用移动设备管理（MDM）工具强制启用始终在线的[出口节点][docs-exit-nodes]。为此，你可以指定单一出口节点作为始终在线的出口节点，也可以对整个设备群使用[自动出口节点][docs-auto-exit-nodes]"
---

最后验证于 Sep 29, 2026

> **注意：**
>
> 强制出口节点面向 [Premium 和 Enterprise 套餐][co-pricing]，以及已购买 [Mullvad][docs-mullvad-exit-nodes] 附加服务的客户。

> **注意：**
>
> 强制出口节点要求 Tailscale 客户端运行 Tailscale v1.69.3 或更高版本。

你可以使用移动设备管理（MDM）工具强制启用始终在线的[出口节点][docs-exit-nodes]。为此，你可以指定单一出口节点作为始终在线的出口节点，也可以对整个设备群使用[自动出口节点][docs-auto-exit-nodes]。

强制使用出口节点需要由 [MDM 方案][docs-mdm]设置相应的[系统策略][docs-mdm-keys]。这在混合办公或远程办公环境中很有用——员工必须把网络流量经由公司或分支机构路由。

要以始终在线的方式启用单一出口节点，请将 [`ExitNodeID`][docs-mdm-keys-exitnodeid] 策略配置为该强制出口节点的 ID。

将 [`ExitNodeID`][docs-mdm-keys-exitnodeid] 策略设为 `auto:any`，即可要求使用自动选择的出口节点。要限制可选范围，将 [`AllowedSuggestedExitNodes`][docs-mdm-keys-allowedsuggestedexitnodes] 设为允许使用的出口节点列表。如果未设置该策略，Tailscale 可以选择任意出口节点。如果设置了但为空，Tailscale 则无法选择任何出口节点。

> **注意：**
>
> 以始终在线的方式强制使用出口节点，可能在出口节点失去连接时或强制门户（captive portal）流程中（例如需要向 Tailscale 完成认证时）造成服务中断。如果同时使用禁止断开 Tailscale 客户端的策略，请谨慎操作。

[co-pricing]: https://tailscale.com/pricing

[docs-auto-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-mdm-keys-allowedsuggestedexitnodes]: /docs/features/tailscale-system-policies#suggest-allowed-forced-exit-nodes

[docs-mdm-keys-exitnodeid]: /docs/features/tailscale-system-policies#force-an-exit-node-to-always-be-used

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm]: /docs/mdm

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes
