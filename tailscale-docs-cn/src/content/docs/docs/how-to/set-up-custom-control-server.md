---
title: "配置 Tailscale 客户端使用自定义控制服务器"
description: "配置 Tailscale 客户端使用自定义控制服务器，例如 Headscale。"
---

最后验证于 Sep 21, 2026

Tailscale 客户端允许你指定自定义控制服务器（control server）URL，替代默认的 `https://controlplane.tailscale.com` 服务器。如果你使用自主管理的 [Headscale][bl-headscale] 部署作为控制平面，请使用你的 Headscale 实例的 URL。

## 添加自定义控制服务器

#### macOS

如果你使用 Tailscale 客户端的 [App Store 或 Standalone 版本][docs-macos-variants]，可以在 Tailscale 用户界面中添加自定义控制服务器 URL：

> **注意：**
>
> 以下步骤仅在客户端已认证过至少一个其他 tailnet 时有效。如果设备上尚未添加其他 tailnet，请改用 Tailscale CLI 的说明。

1. 在 macOS 菜单栏中选择 Tailscale 图标。
2. 从菜单中选择 **设置**（Settings）。
3. 选择 **账户**（Accounts）标签页。
4. 选择窗口左下角的向下箭头。
5. 输入你的自定义控制服务器 URL，选择 **添加账户**（Add account）。

或者，要通过 Tailscale CLI 使用自定义控制服务器 URL 登录，运行以下命令。将 `<URL>` 替换为你的自定义控制服务器 URL。

```shell
tailscale login --login-server=<URL>
```

#### Windows

Windows 版 Tailscale 用户界面不支持添加自定义控制服务器 URL。你可以改用 Tailscale CLI 或编辑注册表设置。

要通过 Tailscale CLI 使用自定义控制服务器 URL 登录，运行以下命令。将 `<URL>` 替换为你的自定义控制服务器 URL。

```powershell
tailscale login --login-server=<URL>
```

更多信息参阅[使用 MDM 在 Windows 上部署 Tailscale][docs-deploy-tailscale-windows-mdm-registry]，通过编辑 `LoginURL` 注册表值来使用自定义控制服务器 URL。无需 MDM 解决方案，你也可以直接编辑注册表值。

#### Linux

运行以下命令向自定义控制服务器完成认证。将 `<URL>` 替换为你的自定义控制服务器 URL。

```shell
tailscale login --login-server=<URL>
```

#### iOS

1. 点按 Tailscale 应用右上角的用户资料图标，打开 **设置**。
2. 如果你尚未登录任何其他 tailnet，点按 **登录**（Log in）。否则，点按已登录的用户。
3. 点按右上角的  菜单，然后选择 **使用自定义协调服务器**（Use a custom coordination server）。
4. 输入自定义控制服务器 URL，点按 **登录**。

#### Android

1. 点按 Tailscale 应用右上角的用户资料图标，打开 **设置**。
2. 如果你尚未登录任何其他 tailnet，点按 **登录**（Log in）。否则，点按已登录的用户。
3. 点按右上角的  菜单，然后选择 **使用备用服务器**（Use an alternate server）。
4. 输入自定义控制服务器 URL，点按 **登录**。

#### tvOS

1. 打开 tvOS 的 **设置**（Settings）应用。
2. 选择 **应用**（Apps）。
3. 选择 **Tailscale**。
4. 在 **备用协调服务器 URL**（Alternate coordination server URL）下选择 **URL**。
5. 输入自定义控制服务器 URL，选择 **完成**（Done）。
6. 返回 Tailscale 应用并登录。

## 移除自定义控制服务器

#### macOS

要使用 Tailscale 用户界面移除自定义控制服务器账户：

1. 在 macOS 菜单栏中选择 Tailscale 图标。
2. 从菜单中选择 **设置**（Settings）。
3. 选择 **账户**（Accounts）标签页。
4. 选择自定义控制服务器账户。
5. 退出该账户的登录。

或者，使用 Tailscale CLI：

```shell
tailscale logout
```

#### Windows

如果你是使用 Tailscale CLI 向自定义控制服务器完成认证的，运行：

```powershell
tailscale logout
```

如果你是通过 `LoginURL` 注册表值配置的自定义控制服务器，请从相应的注册表路径中删除该值：

```text
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale
```

或者：

```text
HKEY_CURRENT_USER\SOFTWARE\Policies\Tailscale
```

如果 `LoginURL` 值由 MDM 解决方案管理，请改用该解决方案删除或更新策略。否则，策略可能会被重新应用。

#### Linux

要退出自定义控制服务器，运行：

```shell
tailscale logout
```

如果你需要彻底重置本地存储的 Tailscale 状态：

1. 停止 `tailscaled`。

   ```shell
   sudo systemctl stop tailscaled
   ```

2. 删除状态文件。

   ```shell
   sudo rm /var/lib/tailscale/tailscaled.state
   ```

3. 启动 `tailscaled`。

   ```shell
   sudo systemctl start tailscaled
   ```

> **警告：**
>
> 删除 `tailscaled` 状态文件会清除该设备本地存储的 Tailscale 状态。仅在退出登录无法按需重置客户端时才使用此方法。

#### iOS

1. 点按 Tailscale 应用右上角的用户资料图标，打开 **设置**。
2. 点按当前活跃账户的详细信息，打开账户切换器。
3. 长按要移除的自定义控制服务器账户。
4. 确认要移除该账户。

> **注意：**
>
> 长按账户后，即使自定义控制服务器离线或不可达、正常退出流程失败，你也可以移除该配置文件。

#### Android

1. 点按 Tailscale 应用右上角的用户资料图标，打开 **设置**。
2. 点按当前活跃账户的名称。
3. 点按 **退出登录**（Log out）。

如果自定义控制服务器离线或不可达，导致无法退出登录，请在 Android 系统设置中清除 Tailscale 应用的存储数据。具体菜单名称因 Android 版本和设备而异，但通常可以在 **设置** > **应用** > **Tailscale** > **存储** 下找到该选项。

> **警告：**
>
> 清除 Tailscale 应用的存储数据会重置其本地客户端状态。

#### tvOS

1. 打开 tvOS 的 **设置**（Settings）应用。
2. 选择 **应用**（Apps）。
3. 选择 **Tailscale**。
4. 在 **备用协调服务器 URL**（Alternate coordination server URL）下选择 **URL**。
5. 清空文本框，选择 **完成**（Done）。
6. 返回 Tailscale 应用，使用标准协调服务器登录。

[bl-headscale]: https://tailscale.com/blog/opensource#the-open-source-coordination-server

[docs-deploy-tailscale-windows-mdm-registry]: /docs/integrations/mdm/windows-mdm#registry-values

[docs-macos-variants]: /docs/concepts/macos-variants
