---
title: "排查使用相同 100.x IP 地址的多台设备"
description: "如果你用一台设备的备份创建另一台设备，或将文件系统从一台设备克隆到另一台，就可能出现多台设备使用相同 [100.x IP 地址][docs-tailscale-ip-addresses]的情况。"
---

最后验证于 Mar 16, 2026

如果你用一台设备的备份创建另一台设备，或将文件系统从一台设备克隆到另一台，就可能出现多台设备使用相同 [100.x IP 地址][docs-tailscale-ip-addresses]的情况。此时 Tailscale 配置文件被复制了，需要从其中一台设备上删除这些文件。

你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中，通过设备名称下方的 **Duplicate node key**（重复节点密钥）徽章来识别重复的设备。

在其中一台系统上卸载并*彻底*删除 Tailscale 客户端。更多信息请参阅[卸载 Tailscale][docs-uninstall]。尤其重要的是，务必删除针对你的平台列出的那些文件，这样重新安装时才会生成新的 Tailscale IP 地址。然后，按照[安装 Tailscale][docs-install] 中的说明重新安装 Tailscale 客户端。

[docs-install]: /docs/install

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-uninstall]: /docs/features/client/uninstall
