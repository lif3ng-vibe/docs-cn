---
title: "排查 Windows 升级错误"
description: "在某些 Windows 10 和 Windows 11 更新中，SYSTEM 用户的 `%LocalAppData%` 目录（通常位于 `C:\\WINDOWS\\system32\\config\\systemprofile\\AppData\\Local`）会在更新后变为空。该目"
---

最后验证于 Feb 18, 2026

在某些 Windows 10 和 Windows 11 更新中，SYSTEM 用户的 `%LocalAppData%` 目录（通常位于 `C:\WINDOWS\system32\config\systemprofile\AppData\Local`）会在更新后变为空。Tailscale 1.14.3 及更早版本正是把内部状态存储在这个目录里的。

如果你升级了 Windows 设备后与 Tailscale 失去连接，可以采取以下任一做法：

1. **（推荐）** 使用管理控制台移除旧设备，然后在受影响的 Windows 设备上重新登录 Tailscale。这需要 Tailscale 管理员和能够操作该设备的人双方配合。
   * 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，找到受影响设备所在的行，选择最右侧的菜单，然后选择 **Remove** 选项。这会把该设备从你的 tailnet 中移除。
   * 将受影响的 Windows 设备上的 Tailscale [升级][docs-update]到 v1.14.4 或更高版本。
   * 受影响的 Windows 设备随后应会提示你重新登录以重新加入 tailnet。如果启用了[设备审批][docs-device-approval]，该设备需要重新审批。
   * 采用这种方式，设备会保留原名，但会获得新的 IP 地址。
2. 删除 Windows 设备上残留的 Tailscale 状态文件，然后重新登录 Tailscale。这种方式不需要管理员参与，除非启用了[设备审批][docs-device-approval]。
   * 在受影响的设备上，删除 `%LocalAppData%\Tailscale` 目录下的所有文件。为此，你可以打开 cmd.exe 并运行 \
     `rmdir /s %LocalAppData%\Tailscale\`
   * 将受影响的 Windows 设备上的 Tailscale [升级][docs-update]到 v1.14.4 或更高版本。
   * 在设备上重新登录 Tailscale。如果启用了[设备审批][docs-device-approval]，该设备需要由管理员重新审批。
   * 采用这种方式，设备会被分配一个新名称（例如 `old-name-1`），并获得新的 IP 地址。在旧设备被移除之前，其旧名称仍会列在管理控制台中。届时，管理员可以将新设备重命名为旧名称。

为避免今后再出现此问题，请在执行 Windows 更新之前，先将设备上的 Tailscale 升级到 v1.14.4 或更高版本。

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-update]: /docs/features/client/update
