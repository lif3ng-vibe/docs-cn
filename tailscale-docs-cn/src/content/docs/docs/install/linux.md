---
title: "在 Linux 上安装 Tailscale"
description: "在 Linux 发行版上安装 Tailscale 客户端：主流发行版可使用安装脚本，使用其他包管理器的发行版可采用替代方案。"
---

最后验证于 Jan 5, 2026

你可以在多种 Linux 发行版上安装 Tailscale 客户端，既可以使用我们的自动化安装脚本，也可以使用发行版专用的包管理器。本主题同时覆盖主流发行版和使用替代包管理系统的发行版。

## 主流发行版

如果你要安装客户端的 Linux 发行版带有 `apt`、`yum` 或 `zypper` 之类的包管理器，请运行以下命令：

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

> **提示：**
>
> 这与[下载][co-download]页面上提供的脚本相同。如果你不想使用 `curl | sh`，可以访问 [Tailscale Packages - stable track][pk-stable] 页面，查看针对你的发行版的手动安装说明。

安装完成后，启动 Tailscale 客户端：

```bash
sudo tailscale up
```

输出会显示一个 URL，你可以用它认证到你的 Tailscale 网络（即 tailnet）。认证完成后，查看管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认该设备已出现在你的 tailnet 中。

此方法适用于以下发行版：

* 基于 Ubuntu 的发行版
* 基于 Debian 的发行版
* Red Hat Enterprise Linux（RHEL）、CentOS、Fedora 及其衍生版本
* Raspberry Pi OS
* Amazon Linux
* openSUSE 和 SUSE Linux Enterprise
* Oracle Linux
* VMware Photon OS

有关受支持平台各版本安装说明的详细列表，请参阅 [Tailscale Packages - stable track][pk-stable] 页面。

如果你希望我们正式支持某个发行版，请联系 [Tailscale 支持团队][co-support]，我们会考虑为该发行版添加官方支持。

## 其他发行版

你可以在使用其他包管理器的发行版上安装 Tailscale 客户端。

* [Arch Linux][xt-install-arch]
* [NixOS][xt-install-nixos]

## 静态二进制文件

对于安装脚本未覆盖的其他 Linux 发行版，我们提供静态二进制文件作为替代方案。

安装静态二进制版本的 Tailscale 客户端：

1. [下载][pk-stable-binaries]与你的 CPU 架构匹配的静态二进制文件。

2. 解压归档文件：

   ```shell
   tar xvf tailscale_<version>_<architecture>.tgz
   ```

   例如，如果你下载的是面向 AMD64 的 1.90.6 版 Tailscale 客户端，则命令为 `tar xvf tailscale_1.90.6_amd64.tgz`。

3. 启动 [tailscaled 守护进程][docs-tailscaled]：

   ```shell
   sudo tailscaled --state=tailscaled.state
   ```

   如果你想配置 systemd 让 tailscaled 自动运行，解压后归档的 `systemd/` 子目录中有现成的服务配置。

4. 启动 Tailscale 客户端：

   ```shell
   sudo tailscale up
   ```

输出会显示一个 URL，你可以用它认证到你的 tailnet。认证完成后，查看管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认该设备已出现在你的 tailnet 中。

## 验证安装

将机器加入 tailnet 后，它会被分配一个 Tailscale IPv4 和 IPv6 地址。这让其他机器、节点和设备知道如何通过安全的 tailnet 访问它。

要显示你设备的 Tailscale IPv4 和 IPv6 地址，请运行：

```shell
tailscale ip
```

查看连接状态：

```bash
tailscale status
```

## 进一步探索

### 禁用密钥过期

tailnet 中的设备会通过设备密钥过期机制定期重新认证以保障安全：密钥会在设定的时间段后失效，需要重新认证。对于需要持续在线的设备（如服务器、树莓派、媒体中心、智能家居中枢、Docker 主机和 NAS 设备），你可以禁用密钥过期，避免不必要的中断。

要禁用某台设备的密钥过期，请前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择设备旁边的图标，然后选择**禁用密钥过期**（Disable key expiry）。

> **警告：**
>
> 禁用密钥过期会降低安全性，一旦设备或密钥被攻破，你的网络可能因此暴露。请仅对可信设备执行此操作；如果设备丢失或被更换，请立即撤销密钥。更多信息请参阅[密钥过期][docs-key-expiry]。

如果你设备的密钥已经过期，可以使用以下命令强制重新认证：

```bash
sudo tailscale up --force-reauth
```

### 使用 Tailscale SSH

[Tailscale SSH][docs-tailscale-ssh] 让你管理对机器的 SSH 访问，通过 tailnet 保护 SSH 访问，而无需将 SSH 暴露到公共互联网。

你可以在机器上运行以下命令来启用 Tailscale SSH：

```bash
tailscale set --ssh
```

### 安装不稳定版本

我们为想在更广泛发布之前测试新功能和修复的用户提供 Tailscale 客户端的不稳定版本。如果你愿意帮助测试新功能，可以从 [Tailscale Packages - unstable track][pk-unstable] 页面下载并安装不稳定版客户端。

更多信息请参阅 [Tailscale 客户端版本与发布通道][docs-versions]。

## 故障排除

### 使用安装脚本时的问题

如果安装脚本失败，它会在终端会话中显示诊断输出信息。联系我们的[支持团队][co-support]时，请附上这些输出。

### 缺少内核模块

Tailscale 需要 `tun` 内核模块。大多数发行版默认已包含该模块。如果你遇到有关缺少 `tun` 的错误，请手动加载它：

```bash
sudo modprobe tun
```

要让它在开机时自动加载，请把 `tun` 添加到 `/etc/modules` 或 `/etc/modules-load.d/tun.conf`。

### 禁用日志

默认情况下，Tailscale 会向 Tailscale 服务器发送有关设备连接到 tailnet 情况的日志。当用户向 Tailscale 反馈问题时，我们会使用这些数据来诊断和排查故障。要禁用日志：

编辑 `/etc/default/tailscaled` 并添加：

```
TS_NO_LOGS_NO_SUPPORT=true
```

或者在 `FLAGS` 变量中添加 `--no-logs-no-support`。

> **警告：**
>
> 禁用日志可能导致 Tailscale 无法提供技术支持。

[co-download]: https://tailscale.com/download/linux

[co-support]: https://tailscale.com/contact/support

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tailscaled]: /docs/reference/tailscaled

[docs-versions]: /docs/reference/tailscale-client-versions

[pk-stable-binaries]: https://pkgs.tailscale.com/stable/#static

[pk-stable]: https://pkgs.tailscale.com/stable/#linux

[pk-unstable]: https://pkgs.tailscale.com/unstable/#linux

[xt-install-arch]: https://wiki.archlinux.org/title/Tailscale

[xt-install-nixos]: https://wiki.nixos.org/wiki/Tailscale
