---
title: "排查 Linux operator 权限问题"
description: "[Tailscale 守护进程][docs-tailscaled]（`tailscaled`）通常以 `root` 用户身份运行，因此只有 `root` 能管理该守护进程。要让其他用户管理 Tailscale，请将该用户设置为 o"
---

最后验证于 Feb 18, 2026

[Tailscale 守护进程][docs-tailscaled]（`tailscaled`）通常以 `root` 用户身份运行，因此只有 `root` 能管理该守护进程。要让其他用户管理 Tailscale，请使用 [`tailscale set`][docs-tailscale-cli-set] 命令将该用户设置为 operator：

```shell
sudo tailscale set --operator=<USERNAME>
```

[docs-tailscale-cli-set]: /docs/reference/tailscale-cli#set

[docs-tailscaled]: /docs/reference/tailscaled
