---
title: "使用 Web 界面管理设备"
description: "Web 界面是一种基于浏览器的图形界面（GUI），可用于所有运行 Tailscale 客户端桌面平台的机器，包括 Linux、macOS 和 Windows。"
---

最后验证于 Jan 5, 2026

Web 界面（web interface）是一种基于浏览器的图形界面（GUI），可用于所有运行 Tailscale 客户端桌面平台的机器，包括 Linux、macOS 和 Windows。这让你无需使用 [Tailscale CLI][docs-cli] 就能配置设置，也无需在本身没有内置 GUI 的设备上配置设置。

> **注意：**
>
> 设备必须安装 Tailscale v1.56.0 或更高版本才能访问其 Web 界面。从 v1.64.0 起，Web 界面默认运行在 [`100.100.100.100`][docs-what-is-quad100] 上。

Web 界面默认通过 `100.100.100.100` 在本地运行，也可以通过 `<tailscaleIP>:5252` 暴露给你的整个 tailnet。

## 在设备上暴露 Web 界面

在通过 `<tailscaleIP>:5252` 访问 Web 界面之前，你必须先在终端会话中使用 Tailscale CLI 将其启用。

要以前台模式暴露 Web 界面，请在设备上打开一个终端会话并运行 [`tailscale web`][docs-cli-web]。当你关闭该终端会话或按下 `Ctrl` + `C` 后，Web 界面将不再暴露给你的 tailnet。

要在后台持久地暴露 Web 界面，请在设备上打开一个终端会话并运行 [`tailscale set --webclient`][docs-cli-set]。

> **注意：**
>
> 你的 [tailnet 策略文件][docs-tailnet-policy-file]管理着对 Web 界面的访问。

> **注意：**
>
> `tailscale set --webclient` 也会为 Tailscale v1.62.0 或更早版本在本地通过 `100.100.100.100` 开启 Web 界面。对于 v1.64.0 及更新的客户端，Web 界面默认就在本地通过 `100.100.100.100` 运行。

## 打开 Web 界面并完成身份验证

在网页浏览器中，使用以下任一方法访问 tailnet 中设备的 Web 界面：

* 打开 [`100.100.100.100`][docs-what-is-quad100]，即可访问你当前正在使用的设备的 Web 界面。
* 打开 `<tailscaleIP>:5252` 访问另一台设备上的 Web 界面，其中 `tailscaleIP` 是该设备的地址。仅当查看者按照 [tailnet 策略文件][docs-tailnet-policy-file]的授权有权访问目标设备的 5252 端口时，才能这样做。
* 打开 `localhost:8080`，或打开运行 Web 界面的设备上提供给 `tailscale web` 的地址和端口。
* 某些平台（包括 Synology）会通过其管理控制台将 Web 界面暴露在局域网上。

出于安全考虑，初次从浏览器访问 Web 界面时，你始终处于只读模式。任何能打开该页面的人都可以访问 Web 界面的只读页面。在这里，你可以选择 **查看设备详情**（View device details）来查看设备的元数据，包括它的 IP 地址。

要在 Web 界面中更改设备设置，你必须完成一次检查模式（check mode）身份验证步骤。选择右上角的头像，选择 **登录**（Sign in），然后完成身份验证流程。

如何限制谁能访问设备的 Web 界面，请参阅[控制远程访问][co-control-remote-access]。

## 在设备上禁用 Web 界面

有三种方法可以在设备上禁用 Web 界面。

**方式 1**：仅禁用非本地用户的访问，运行以下 [Tailscale CLI][docs-cli] 命令：

```shell
tailscale set --webclient=false
```

**方式 2**：同时禁用本地用户和非本地用户的访问，在 tailnet 策略文件中添加以下条目：

```json
"nodeAttrs": [
  {
    "target": ["autogroup:member"],
    "attr":   ["disable-web-client"],
  },
],
```

\[缺少代码片段：visual\_policy\_editor.mdx]

**方式 3**：将设备从你的 tailnet 断开连接或移除。

## 控制远程访问

### 授予只读访问权限

tailnet 中的任何用户，或与该设备发生过共享的任何用户，只要有权访问设备的 5252 端口，就能访问其 Web 界面。要限制只读访问，请在策略中限制谁能访问该设备的 5252 端口。例如：

```json
{
  "acls": [
    // Allow access only to users' own web interfaces.
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["autogroup:self:5252"]
    }
  ]
}
```

\[缺少代码片段：visual\_policy\_editor.mdx]

或者使用新的[授权][docs-grants]语法：

```json
{
  "grants": [
    // Allow access only to users' own web interfaces.
    {
      "src": ["autogroup:member"],
      "dst": ["autogroup:self"],
      "ip": ["5252"]
    }
  ]
}
```

\[缺少代码片段：visual\_policy\_editor.mdx]

## 授予管理访问权限

如果设备归个人用户所有（未[打标签][docs-tags]），则只有所有者能通过 Tailscale Web 界面管理该设备的设置。无法通过修改 [tailnet 策略文件][docs-tailnet-policy-file]向其他用户授予管理访问权限。

如果设备已[打标签][docs-tags]，则可以通过[授权][docs-grants]向用户授予管理 Tailscale Web 界面部分功能的权限。使用 `"tailscale.com/cap/webui"` 应用的 `canEdit` 列表来定义允许用户管理的内容。支持的 `canEdit` 值有：

* `*` 授予所有现有和未来 Web 界面功能的管理访问权限
* `ssh` 授予 Tailscale SSH 的管理访问权限
* `subnets` 授予子网路由的管理访问权限
* `exitNodes` 授予出口节点的管理访问权限，包括将设备通告为出口节点以及使用其他出口节点
* `account` 授予账户设置的管理访问权限，包括让节点登出以及开启自动更新

例如：

```json
{
  "grants": [
    {
      "src": ["user@example.com"],
      "dst": ["tag:dev"],
      "ip": ["5252"],
      "app": {
        "tailscale.com/cap/webui": [
          {
            // Grants user@example.com edit access to "tag:dev" devices' web interfaces.
            "canEdit": ["ssh", "subnets"]
          }
        ]
      }
    }
  ]
}
```

\[缺少代码片段：visual\_policy\_editor.mdx]

任何对设备 Web 界面拥有管理访问权限的人，无论设备已打标签还是归个人所有，都必须先登录 Web 界面并完成一次检查模式身份验证步骤核实身份，然后才能真正更改设备设置。检查模式还要求用户必须从自己拥有的 Tailscale 设备发起连接（不能从打标签的设备连接）。

> **注意：**
>
> 针对打标签设备的 Web 界面授权从 Tailscale v1.62.0 起才可用。对于运行低于 v1.62.0 版本的打标签设备，仅凭访问控制策略就能让用户通过 Web 界面管理该设备。

## 功能

通过 Web 界面可以为设备配置 Tailscale 设置。并非所有功能都在每个平台上可用。如果某平台不支持某个功能，该功能就不会出现在此设备的 Web 界面中。

### 启用出口节点

要选择一个[出口节点][docs-exit-nodes]让设备经由它路由，请前往 **此设备**（This device），选择 **出口节点**（Exit node），然后选择你要使用的出口节点。要停止使用出口节点，请选择 **禁用**（Disable）。

要将设备通告为出口节点，请前往 **此设备**（This device），选择 **出口节点**（Exit node），然后选择 **作为出口节点运行**（Run as exit node）。要停止将设备通告为出口节点，请选择 **禁用**（Disable）。

### 启用子网路由器

将设备配置为[子网路由器][docs-subnets]后，你可以远程访问网络上可能没有安装 Tailscale 的资源，例如打印机。

要将设备用作子网路由器，请前往 **设置**（Settings），打开 **子网路由器**（Subnet router）下拉菜单。在文本框中输入要通告给你的 tailnet 的 IP 地址与子网掩码组合（CIDR），然后选择 **通告路由**（Advertise routes）。可以用逗号分隔输入多个子网。要停止通告路由，请选择相应路由旁边的 **停止通告**（Stop advertising）。

如果通告的路由待审批，你可以在管理控制台中[启用子网路由][docs-subnets-enable-subnet-routes]。

### 启用 Tailscale SSH

要在设备上启用 [Tailscale SSH][docs-tailscale-ssh]，请前往 **设置**（Settings），选择 **Tailscale SSH 服务器**（Tailscale SSH server），然后打开开关。要停用 Tailscale SSH 服务器，请关闭开关。

[co-control-remote-access]: https://tailscale.com/use-cases/remote-access

[docs-grants]: /docs/features/access-control/grants

[docs-tags]: /docs/features/tags

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-web]: /docs/reference/tailscale-cli#web

[docs-cli]: /docs/reference/tailscale-cli

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets-enable-subnet-routes]: /docs/features/subnet-routers#enable-subnet-routes-from-the-admin-console

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file

[docs-what-is-quad100]: /docs/reference/quad100
