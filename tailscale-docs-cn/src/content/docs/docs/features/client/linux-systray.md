---
title: "Linux 系统托盘应用"
description: "你可以在 Linux 桌面客户端上运行系统托盘（systray）应用，像其他 Tailscale 图形界面客户端一样执行快速用户切换、选择出口节点等常见操作。"
---

最后验证于 Jan 5, 2026

> **注意：** 此功能目前处于 beta 阶段。

你可以在 Linux 桌面客户端上运行系统托盘（`systray`）应用，像其他 Tailscale 图形界面客户端一样执行[快速用户切换][docs-fus]、[选择出口节点][docs-exit-nodes]等常见操作。

> **提示：**
>
> `systray` 应用可在包含 D-Bus 的 Linux 发行版、以及支持 [StatusNotifierItem 规范][xt-fd-statusnotifier]的桌面环境中运行。这包括较新版本的 GNOME、KDE Plasma 和 COSMIC，以及 [waybar][xt-waybar]、[wayle][xt-wayle] 等 Wayland 栏。

*（图：在 GNOME 中运行的 Tailscale 系统托盘应用。）*

## 启动 `systray` 应用

在命令行中运行以下命令启动 `systray` 应用：

```shell
tailscale systray
```

要在系统启动时自动运行 `systray` 应用，你可以使用 freedesktop autostart 文件，或 systemd 用户服务。

Tailscale 1.96 及更高版本支持通过运行以下命令，使用 freedesktop autostart 文件在启动时运行 `systray` 应用：

```shell
tailscale configure systray --enable-startup=freedesktop
```

你也可以通过运行以下命令，将 `systray` 应用作为 systemd 用户服务在启动时运行：

```shell
tailscale configure systray --enable-startup=systemd
```

对于其他 init 系统，请在相应的启动脚本中调用 `tailscale systray`。

> **警告：**
>
> 不要以超级用户身份运行 `tailscale systray`（即 `sudo tailscale systray`），因为 systray 并非为超级用户运行而设计，该命令会失败。

## 配置 GNOME 桌面

GNOME 环境没有内置系统托盘实现，因此你需要安装 [AppIndicator Support 扩展][xt-gnome-appindicator]才能使用 Tailscale 的 `systray` 应用。

在 Ubuntu 上，该扩展已作为 `apt` 包 `gnome-shell-extension-appindicator` 预装。你无需手动安装该扩展；不过如果你确实要手动安装，可能需要先移除该 `apt` 包。

## 添加剪贴板支持

要与系统剪贴板集成，你的环境可能需要一个剪贴板工具。以下是可选方案及建议的下载安装命令：

### 适用于 X11 的 `xsel`

在 Linux 桌面环境中为 X11 安装 `xsel` 复制粘贴工具的方法如下：

* Debian/Ubuntu: `sudo apt install xsel`
* Fedora: `sudo dnf install xsel`
* Arch: `sudo pacman -S xsel`

### 适用于 X11 的 `xclip`

在 Linux 桌面环境中为 X11 安装 `xclip` 复制粘贴工具的方法如下：

* Debian/Ubuntu: `sudo apt install xclip`
* Fedora: sudo `dnf install xclip`
* Arch: `sudo pacman -S xclip`

### 适用于 Wayland 的 wl-clipboard

在 Linux 桌面环境中为 Wayland 安装 `wl-clipboard` 复制粘贴工具的方法如下：

* Debian/Ubuntu: `sudo apt install wl-clipboard`
* Fedora: `sudo dnf install wl-clipboard`
* Arch: `sudo pacman -S wl-clipboard`

## 对非 Linux 桌面的支持

`systray` 应用目前仅在 Linux 上受支持，因此只随 Linux 客户端捆绑。它也能在 macOS 和 Windows 等其他操作系统上运行，但某些功能（例如桌面通知）可能缺失。如果你使用的操作系统不受支持，可以从源码构建该应用并按以下方式运行：

```shell
go run tailscale.com/cmd/systray@latest
```

## 已知局限

* GNOME 桌面限制了 `systray` 应用子菜单的层级深度。因此，选择 [Mullvad 出口节点][docs-mullvad]时只能精确到国家/地区层级，无法细化到具体城市。
* COSMIC 桌面可以运行 `systray` 应用，但会以原始尺寸显示头像图片，在菜单中可能显得过大。
* 目前不支持 XFCE 桌面。虽然 `xfce-panel` 实现了 `StatusNotifierItem` 规范，但仍需额外工作才能实现兼容。

[docs-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-fus]: /docs/features/client/fast-user-switching

[docs-mullvad]: /docs/features/exit-nodes/mullvad-exit-nodes

[xt-fd-statusnotifier]: https://www.freedesktop.org/wiki/Specifications/StatusNotifierItem/

[xt-gnome-appindicator]: https://extensions.gnome.org/extension/615/appindicator-support/

[xt-waybar]: https://github.com/Alexays/Waybar/wiki/Module:-Tray

[xt-wayle]: https://wayle.app/config/modules/systray
