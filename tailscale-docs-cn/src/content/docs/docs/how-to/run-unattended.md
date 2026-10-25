---
title: "在我未登录电脑时保持 Tailscale 运行"
description: "配置设备在没有任何用户登录时也运行 Tailscale。"
---

最后验证于 Sep 25, 2026

在没有用户登录的情况下保持 Tailscale 运行，可以让你在注销或重启之后仍能远程访问设备。设备默认是否保持连接到你的 tailnet，取决于操作系统以及 Tailscale 客户端的运行方式。

> **注意：**
>
> 无人值守模式（unattended mode）仅在 Windows 上可用。

* **Linux**：Tailscale 客户端默认以系统守护进程 [`tailscaled`][docs-tailscaled] 的方式运行，因此即使没有用户登录也保持可用。
* **macOS**：Tailscale 客户端在用户登录会话内运行。目前不支持作为独立系统守护进程运行。可以在 [GitHub issue #987][xt-gh-tailscale-issue-987] 跟踪进展。
* **Windows**：Tailscale 客户端默认在用户登录会话内运行。当用户注销或设备重启后，Tailscale 会断开连接，直到有用户再次登录。

要让 Windows 设备在没有用户登录时仍可访问（例如在重启后通过 [Windows 远程桌面（RDP）][docs-secure-rdp-windows] 访问，或用于多用户的 Windows Server 实例），请启用无人值守模式（unattended mode），也称为 Server 模式。

## 前提条件

在 Windows 上启用无人值守模式之前，请确保：

* 已在 Windows 10 或更高版本、或 Windows Server 2016 或更高版本上安装 Tailscale。
* 设备已完成认证并连接到你的 tailnet。

## 启用无人值守模式

你可以使用 Tailscale 客户端界面、CLI 或 [`UnattendedMode`][docs-mdm-keys-unattended] 系统策略来配置无人值守模式。

#### Tailscale 界面

1. 右键单击 Windows 系统托盘中的 **Tailscale** 图标。
2. 悬停在 **偏好设置**（Preferences）上。
3. 选择 **无人值守运行**（Run unattended）。
4. 在应用提示时，选择 **是**（Yes）以启用无人值守模式。

启用后，**偏好设置** 菜单中的 **无人值守运行** 旁边会出现勾选标记。

#### Tailscale CLI

打开 PowerShell 或命令提示符并运行：

```powershell
tailscale set --unattended=true
```

如果你要在初始设置期间使用[认证密钥][docs-auth-keys]以无界面（headless）方式预配新设备：

```powershell
tailscale up --unattended=true --authkey=tskey-auth-xxxxx
```

#### 系统策略

对于集中管理的企业部署，在 Tailscale ADMX 模板或注册表中配置 `UnattendedMode` 策略：

* **注册表项**：`HKLM\Software\Policies\Tailscale`
* **值名称**：`UnattendedMode`
* **值类型**：`REG_SZ`（`always`、`never` 或 `user-decides`）

更多信息参阅 [Tailscale 系统策略][docs-mdm-keys-unattended]。

> **注意：**
>
> 启用无人值守模式后，启用它的 Windows 账户将拥有该设备上的 Tailscale 配置。即使 Windows 用户注销或设备重启，Tailscale 客户端仍会以所配置的配置文件继续运行。

## 验证无人值守模式

要验证无人值守模式是否正常工作：

1. 注销 Windows，或重启设备且不重新登录。
2. 从 tailnet 中的另一台设备，ping 该设备的 Tailscale IP 地址或 MagicDNS 名称：

   ```shell
   tailscale ping <hostname-or-ip>
   ```

如果设备无法访问，请在 Windows 设备上打开 **服务**（`services.msc`），确保 **Tailscale** 服务的启动类型为 **自动**（Automatic）且当前处于 **正在运行**（Running）状态。

## 禁用无人值守模式

要让 Tailscale 回到用户会话模式：

#### Tailscale 界面

1. 右键单击 Windows 系统托盘中的 **Tailscale** 图标。
2. 悬停在 **偏好设置** 上。
3. 选择 **无人值守运行**，取消勾选。

#### Tailscale CLI

打开 PowerShell 或命令提示符并运行：

```powershell
tailscale set --unattended=false
```

## 管理密钥过期

默认情况下，节点密钥（node key）在 180 天后过期，需要交互式重新认证。对于需要持续在线的无人值守设备、服务器和远程桌面主机，请禁用密钥过期，以避免意外断连。

1. 打开管理控制台的 [机器](https://console.tailscale.com/admin/machines) 页面。
2. 找到该设备并选择相应图标。
3. 选择 **禁用密钥过期**（Disable key expiry）。

> **警告：**
>
> 禁用密钥过期会让设备无限期保持连接，直到手动撤销。只对受信任的设备禁用密钥过期。更多信息参阅[密钥过期][docs-key-expiry]。

## 故障排查

如果其他用户无法切换配置文件或更改 Tailscale 配置，可能是有人以另一个用户的身份启用了无人值守模式。无人值守模式让启用它的用户对设备上的 Tailscale 配置拥有独占控制权。在禁用无人值守模式之前，其他用户无法切换配置文件或更改配置。

如果启用无人值守模式的 Windows 用户已被停用或无法再访问该设备，导致无人值守模式无法禁用，可以使用 `UnattendedMode` 策略，或以 `Local System` 身份配合 [Sysinternals PsExec][xt-ms-psexec] 运行 Tailscale CLI 来禁用它：

```powershell
psexec -s -i "C:\Program Files\Tailscale\tailscale.exe" set --unattended=false
```

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-mdm-keys-unattended]: /docs/features/tailscale-system-policies#set-unattended-mode

[docs-secure-rdp-windows]: /docs/solutions/access-remote-desktops-using-windows-rdp

[docs-tailscaled]: /docs/reference/tailscaled

[xt-gh-tailscale-issue-987]: https://github.com/tailscale/tailscale/issues/987

[xt-ms-psexec]: https://learn.microsoft.com/en-us/sysinternals/downloads/psexec
