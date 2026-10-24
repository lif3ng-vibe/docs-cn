---
title: "Linux systray application"
description: "You can run the system tray (`systray`) application for Linux desktop clients to access some common actions like [fast user switching][docs-fus] and [exit node selection][docs-exit-nodes] like with ot"
---

Last validated Jan 5, 2026

> **Note:** This feature is currently in beta.

You can run the system tray (`systray`) application for Linux desktop clients to access some common actions like [fast user switching][docs-fus] and [exit node selection][docs-exit-nodes] like with other Tailscale GUI clients.

> **Tip:**
>
> The `systray` application works on Linux distributions that include D-Bus, and desktop environments that supports the [StatusNotifierItem specification][xt-fd-statusnotifier]. This includes recent versions of GNOME, KDE Plasma, and COSMIC, as well as Wayland bars such as [waybar][xt-waybar] and [wayle][xt-wayle].

*（图：Tailscale system tray application running in GNOME.）*

## Start the `systray` application

Start the `systray` app from the command line by running:

```shell
tailscale systray
```

To launch the `systray` application on startup, you can use a freedesktop autostart file, or a systemd user service.

Tailscale version 1.96 and later supports launching the `systray` application on startup with a freedesktop autostart file by running:

```shell
tailscale configure systray --enable-startup=freedesktop
```

You can launch the `systray` application on startup as a systemd user service on startup by running:

```shell
tailscale configure systray --enable-startup=systemd
```

For other init systems, call `tailscale systray` in the appropriate startup scripts.

> **Warning:**
>
> Do not run `tailscale systray` as superuser (`sudo tailscale systray`), because systray is not designed to run as superuser and the command will fail.

## Configure GNOME desktops

The GNOME environment does not have a built-in system tray implementation, so you'll need to install the [AppIndicator Support extension][xt-gnome-appindicator] to use the Tailscale `systray` application.

On Ubuntu, this extension comes installed as the `apt` package `gnome-shell-extension-appindicator`. You do not need to install the extension manually, however if you do, you might need to remove the `apt` package first.

## Add clipboard support

To integrate with the system clipboard, your environment may need a clipboard utility. Here are the following options and suggested commands to download and install:

### `xsel` for X11

Here are the methods for installing the `xsel` copy and paste utility for X11 in your Linux desktop environment:

* Debian/Ubuntu: `sudo apt install xsel`
* Fedora: `sudo dnf install xsel`
* Arch: `sudo pacman -S xsel`

### `xclip` for X11

Here are the methods for installing the `xclip` copy and paste utility for X11 in your Linux desktop environment:

* Debian/Ubuntu: `sudo apt install xclip`
* Fedora: sudo `dnf install xclip`
* Arch: `sudo pacman -S xclip`

### wl-clipboard for Wayland

Here are the methods for installing the `wl-clipboard` copy and paste utility for Wayland in your Linux desktop environment:

* Debian/Ubuntu: `sudo apt install wl-clipboard`
* Fedora: `sudo dnf install wl-clipboard`
* Arch: `sudo pacman -S wl-clipboard`

## Support for non-Linux desktops

The `systray` application is currently only supported on Linux, and is therefore only bundled in the Linux client. It does run on other operating systems, including macOS and Windows, but some features, like desktop notifications, may be missing. If you are using an unsupported operating system, you can build the application from source and run it using the following:

```shell
go run tailscale.com/cmd/systray@latest
```

## Known limitations

* The GNOME desktop restricts the depth of sub-menus in `systray` applications. As a result, selecting a [Mullvad exit node][docs-mullvad] is limited to the country level and does not extend to individual cities.
* The COSMIC desktop runs the `systray` application, but displays profile images at full size, which may appear oversized in the menu.
* The XFCE desktop is not currently supported. While `xfce-panel` implements the `StatusNotifierItem` specification, additional work is needed to enable compatibility.

[docs-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-fus]: /docs/features/client/fast-user-switching

[docs-mullvad]: /docs/features/exit-nodes/mullvad-exit-nodes

[xt-fd-statusnotifier]: https://www.freedesktop.org/wiki/Specifications/StatusNotifierItem/

[xt-gnome-appindicator]: https://extensions.gnome.org/extension/615/appindicator-support/

[xt-waybar]: https://github.com/Alexays/Waybar/wiki/Module:-Tray

[xt-wayle]: https://wayle.app/config/modules/systray
