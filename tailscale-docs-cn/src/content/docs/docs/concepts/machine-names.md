---
title: "机器名"
description: "了解 Tailscale 如何确定机器名，以及如何重命名机器。"
---

最后验证于 Jan 5, 2026

在 Tailscale 上，机器通过 [100.x.y.z][docs-100.x-addresses] IP 地址和**机器名（machine name）**加以区分。

机器名显示在管理控制台和 Tailscale 原生应用的各个角落，是机器在 Tailscale 网络上的规范名称。如果你使用 [MagicDNS][docs-magicdns]，机器名还决定了访问你机器所用的 URL。

## 机器名如何确定

新机器加入 Tailscale 网络时，我们会根据它的操作系统主机名（OS hostname）自动生成机器名。OS 主机名是设备的操作系统所用的名称，会在启动时上报给 Tailscale。

通常，机器名最终与主机名完全一致。但如果网络上已有设备同名，新机器有时会得到类似 `<hostname>-1` 的名称。即使之后冲突设备的名称改了，这台机器仍会保留 `<hostname>-1` 这个机器名。

OS 主机名还可能包含我们不允许出现在机器名中的字符，因此我们按照一系列规则来推导名称，力求得到合理的结果。

例如：

OS 主机名
机器名

monitoring
monitoring

John's-iPhone-6S.local
johns-iphone-6s

🎊 free form 🎊
free-form

这些规则中的极端情况一经发现就会调整，因此此处不一一列出。我们在整个 Tailscale 网络范围内强制机器名唯一，这样机器名才能用作机器 [MagicDNS][docs-magicdns] 域名的一部分。

## 重命名机器

有时设备的默认机器名相当杂乱难懂，例如 `laptop-a4og4947`。为此，我们提供了在管理控制台中编辑设备机器名的功能。

你可以通过管理控制台的 UI 编辑机器名，也可以通过 Tailscale CLI 编辑。

> **注意：**
>
> 如果你的网络启用了 [MagicDNS][docs-magicdns]，编辑机器名也会同时编辑 MagicDNS 域名。重命名后，你的机器将可以使用新名称通过 MagicDNS 访问。

### 在管理控制台中重命名机器

在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面或 **Machine Details**（机器详情）页面中，选择页面右侧的&#x20;菜单，然后选择 **Edit machine name**（编辑机器名）。这将打开机器名编辑器。

*（图：机器名编辑视图）*

> **注意：**
>
> 当勾选 **Auto-generate from OS hostname** 复选框时（默认勾选），机器名会按上文所述从 OS 主机名生成。如果操作系统更新了主机名，机器名也会在下次启动 Tailscale 时随之更新。要避免这种自动改名，请取消勾选该复选框。

*（图：机器名编辑视图）*

完成修改后，新名称会显示在管理控制台和 Tailscale 应用的所有位置。

*（图：更新后的机器页面）*

### 在 CLI 中重命名机器

在 Tailscale CLI 中，通过 `tailscale set` 设置机器名：

```shell
tailscale set --hostname=<name>
```

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-magicdns]: /docs/features/magicdns
