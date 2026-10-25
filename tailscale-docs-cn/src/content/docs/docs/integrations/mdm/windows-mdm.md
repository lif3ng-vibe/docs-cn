---
title: "使用 MDM 在 Windows 上部署 Tailscale"
description: "本主题包含一些技术信息，供正在企业环境中使用移动设备管理（MDM）为 Windows 部署 Tailscale 的系统管理员参考。"
---

最后验证于 Jan 5, 2026

本主题包含一些技术信息，供正在企业环境中使用移动设备管理（MDM）为 Windows 部署 Tailscale 的系统管理员参考。

> **注意：**
>
> Tailscale v1.78 让某些策略设置（例如 UI 自定义）可以面向用户和设备生效。Tailscale v1.76 仅支持设备系统策略。

> **提示：**
>
> 可同时用于组策略和 MDM 解决方案（例如 Microsoft Intune）的最新 Tailscale ADMX 和 ADML 文件，可从 [Tailscale 仓库][xt-gh-tailscale-repo]获取。

我们一直在为系统管理员提供更多以编程方式管理 Tailscale 部署的选项。如果你正在部署 Tailscale，并且觉得本主题目前缺少某个你需要的特定配置选项，请联系我们的支持团队。

## 注册表值

你可以手动或使用 [Microsoft Intune][docs-mdm-microsoft-intune] 等 MDM 解决方案设置注册表值，从而改变 Tailscale 客户端的行为。

注册表值应存放在 `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` 注册表项下。

> **注意：**
>
> 更早版本的 Tailscale 使用 `HKEY_LOCAL_MACHINE\Software\Tailscale IPN` 项，而较新的版本现在使用 `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` 项。
>
> 如果你已有 `HKEY_LOCAL_MACHINE\Software\Tailscale IPN` 项，我们建议保持其原样不动，并将所有自定义策略设置迁移到 `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` 项中，以避免中断。不要删除 `HKEY_LOCAL_MACHINE\Software\Tailscale IPN` 项。

*（图：Tailscale 策略的 Windows 注册表项。）*

在 `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` 注册表项下：

* `(Default)` 值不被使用。

你也可以选择创建以下几个值，它们的类型均为字符串（String）：

* `LoginURL` 值包含登录服务器的 URL。默认值为 `https://controlplane.tailscale.com`。
* `LogTarget` 值包含日志服务器的 URL。默认值为 `https://log.tailscale.com`。

偏好策略（preference policy）可以设置为 `always`、`never` 和 `user-decides`。如果设置为 `always` 或 `never`，这些选项由管理员设定，且不会显示在系统托盘菜单中。如果未设置或设置为 `user-decides`，该选项就会显示在系统托盘菜单中。

* `AllowIncomingConnections` 控制 **Allow Incoming Connections**（允许传入连接）菜单选项
* `UnattendedMode` 控制 **Unattended Mode**（无人值守模式）菜单选项

可见性策略可以设置为 "hide" 或 "show"。如果设置为 "hide"，该菜单项不可见。如果设置为 "show" 或未设置，该菜单项可见。

* `AdminConsole` 控制 **Admin Console**（管理控制台）菜单项
* `NetworkDevices` 控制 **Network Devices**（网络设备）子菜单
* `TestMenu` 控制在按住 `SHIFT` 或 `CTRL` 键打开托盘菜单时，测试/调试菜单项是否可见。
* `UpdateMenu` 控制 **Update Tailscale**（更新 Tailscale）菜单项

时长策略（duration policy）控制某个时长或超时时间。时间可以使用小时和分钟为单位设置。例如：

* `168h`：1 周
* `24h`：1 天
* `1h5m`：1 小时 5 分钟
* `30m`：半小时
* 还有更小的时间单位，但不太可能用得上。[Go time.ParseDuration][xt-go-parse-duration] 函数接受的全部非负值都受支持。

当前的时长策略：

* `KeyExpirationNotice` 控制在密钥过期前多久显示通知。默认为 24 小时。

> **警告：**
>
> 在 Windows 上，布尔型 MDM 键应使用 `REG_DWORD`（整数）值（`0` 和 `1`）。

有关可配置注册表值的完整列表，请查看我们的 [MDM 配置键列表][docs-mdm-keys]。

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-microsoft-intune]: /docs/integrations/mdm/microsoft-intune

[xt-gh-tailscale-repo]: https://github.com/tailscale/tailscale/tree/main/docs/windows/policy

[xt-go-parse-duration]: https://golang.org/pkg/time/?m=all#ParseDuration
