---
title: "在 Windows 上通过 WSL 2 安装 Tailscale"
description: "本主题介绍如何在适用于 Linux 的 Windows 子系统（WSL 2）中安装 Tailscale。如果你想使用 Tailscale `.exe` 安装程序，请参阅[在 Windows 上安装 Tailscale][docs-instal"
---

最后验证于 Nov 3, 2025

> **注意：**
>
> 当前可供[下载][co-download-windows]的 Tailscale 客户端要求 Windows 10 或更高版本，或 Windows Server 2016 或更高版本。
>
> 在 WSL 2 上安装 Tailscale 属于进阶用法。有关 WSL 的更多信息，请参阅 [Microsoft 文档][xt-ms-windows-wsl]。
>
> 数据包大小与 Tailscale 之间存在一个已知问题，详情可关注这个 [GitHub issue][xt-gh-tailscale-issue-4833]。如果相关，请在该讨论串中报告性能问题。

本主题介绍如何在适用于 Linux 的 Windows 子系统（WSL 2）中安装 Tailscale。如果你想使用 Tailscale `.exe` 安装程序，请参阅[在 Windows 上安装 Tailscale][docs-install-windows]；如果你想使用 Tailscale `.msi` 安装程序，请参阅[用 MSI 在 Windows 上安装 Tailscale][docs-install-windows-msi]。

## 安装步骤

1. 确认你使用的是 WSL 2。在 PowerShell 中运行以下命令：`wsl -l -v`。`VERSION` 列会显示 `2`，这说明你正在使用 WSL 2。
2. 在 PowerShell 中运行 `wsl.exe`，或打开已配置好的 Linux 终端选项卡，启动你的 WSL 2 实例。
3. 运行自动安装脚本：

```shell
curl -fsSL https://tailscale.com/install.sh | sh
```

更详细的说明（包括手动安装流程）请参阅[在 Linux 上安装 Tailscale][docs-install-linux]页面。

1. 安装完成后，Tailscale 尚未运行，因此你需要按照安装后的文字提示运行 `sudo tailscale up`。它会输出一个 Tailscale URL，你可以直接选中它，或复制粘贴到浏览器中打开。
2. 浏览器窗口打开后，你需要使用[你的 SSO 身份提供方][docs-sso-providers]进行认证。
3. 按照提示把这个节点加入你的 tailnet，新的 WSL 2 节点很快就会显示在 [Machines](https://console.tailscale.com/admin/machines) 页面中。

## 卸载步骤

用户可以运行以下命令卸载 Tailscale：`sudo apt-get remove tailscale`。

## 注意事项

* 你新的 WSL 2 节点很可能与你的 Windows 节点同名，在 Tailscale 管理页面中可能显示为重复名称，或名称末尾带有附加数字。你可以在 Tailscale 的 [Machines](https://console.tailscale.com/admin/machines) 页面中重命名该节点，以表明它是你的 WSL 2 节点。
* 如果同时在 Windows 主机和 WSL 2 内运行 Tailscale，从 WSL 2 发出、经由 Windows 主机上的 Tailscale 转发的加密流量将无法工作，原因是数据包无法再装进 Tailscale 数据包（MTU 问题）。因此建议用户只在 Windows 主机上运行 Tailscale，而不要在 WSL 2 内运行。
* 如果你在 WSL 2 内运行 Tailscale：当前版本的 WSL 2 在默认接口上的默认 `MTU` 为 `1280`，对 Tailscale 来说太小，无法正常工作。`tailscaled` 内置了一种应对措施：如果它检测到你正在 WSL 上运行、且默认接口使用的似乎正是这个默认 `MTU`，就会把默认接口的 `MTU` 提升到 `1340`。

[co-download-windows]: https://tailscale.com/download/windows

[docs-install-linux]: /docs/install/linux

[docs-install-windows-msi]: /docs/install/windows/msi

[docs-install-windows]: /docs/install/windows

[docs-sso-providers]: /docs/integrations/identity

[xt-gh-tailscale-issue-4833]: https://github.com/tailscale/tailscale/issues/4833

[xt-ms-windows-wsl]: https://learn.microsoft.com/en-us/windows/wsl
