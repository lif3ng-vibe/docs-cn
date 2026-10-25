---
title: "无法连接到 tailnet 中的其他设备"
description: "按照以下步骤排查设备无法连接到同一 tailnet 中另一设备的原因。"
---

最后验证于 Nov 14, 2025

按照以下步骤排查设备无法连接到同一 tailnet 中另一设备的原因。

1. **确保 Tailscale 客户端为最新版本**。

   确保两台设备都运行最新版本的 Tailscale。你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面[检查 tailnet 中每台设备的版本][docs-update]。

   你也可以在本地使用 Tailscale 应用或 [`tailscale version`][docs-cli-version] 命令检查每台设备的版本。该命令还提供一些标志，可用于专门检查 Tailscale 客户端或 [`tailscaled` 守护进程][docs-tailscaled]的版本。

   如果 Tailscale 版本过旧，请[下载并安装最新版本][docs-update]。

2. **检查 Tailscale 客户端的状态**。

   使用 [`tailscale status`][docs-cli-status] 命令检查每台设备的 Tailscale 客户端状态。该命令会列出当前设备与 tailnet 中它*有权访问*的每台其他设备的连接状态。如果某台设备未列出，请检查你的 [tailnet 策略文件][docs-tailnet-policy-file]中是否存在可能阻止连接的访问控制策略。

3. **验证 Tailscale 连通性**。

   使用 [`tailscale ping`][docs-cli-ping] 命令验证每台设备与其他 tailnet 设备的连接。该命令还有其他标志，例如 `--verbose`，可用于获取更多信息。

4. **检查每台设备的防火墙设置**。

   检查每台设备的本地防火墙和网络防火墙设置，确保没有防火墙规则阻止两台设备之间或与 Tailscale 之间的连接。

5. **检查 Tailscale 访问控制策略**。

   有时即使不存在连接问题，你仍然无法访问某个端点。这可能是由于你 tailnet 的[访问控制策略][docs-access-control]所致。

   Owner、Admin 和 Network admin 可以在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面查看这些策略。请特别注意 tailnet 策略文件中的 ACL、授权（grant）和 SSH 部分。

   确保设备可以访问另一台设备的 IP 地址或子网，以及你要访问的服务所用的端口号。例如，如果你要连接的服务位于端口 `53`，请确保没有访问控制策略阻止你使用端口 `53`。

   你可以使用 [Preview rules](https://console.tailscale.com/admin/acls/preview) 标签页来更好地了解你的访问控制策略允许哪些操作。

   你还可以在接收端设备上查看 Tailscale 的日志。每当一台设备尝试发起连接时，接收端设备都会记录该连接是被允许还是被拒绝。

6. **确认每台设备的身份验证状态**。

   确认每台设备都使用正确的凭证完成了身份验证（无论是用户账户还是[基于标签的身份][docs-tags]）。设备的身份验证也可能已经[过期][docs-key-expiry]。

7. **检查出口节点和子网路由器配置**。

   如果任一设备使用了[出口节点（exit node）][docs-exit-nodes]，请确保出口节点（或子网路由器）在线且配置正确。例如，确保没有访问控制策略阻止出口节点访问另一台设备。

   如果任一设备位于[子网路由器（subnet router）][docs-subnets]之后，请确保另一台设备可以访问该子网路由器通告的路由。例如，如果子网路由器通告了 `192.0.2.0/24`，则另一台设备必须有权访问 `192.0.2.0/24`。

[docs-access-control]: /docs/features/access-control

[docs-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-cli-version]: /docs/reference/tailscale-cli#version

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscaled]: /docs/reference/tailscaled

[docs-update]: /docs/features/client/update
