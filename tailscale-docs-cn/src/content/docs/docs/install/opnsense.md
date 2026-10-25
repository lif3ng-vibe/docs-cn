---
title: "将 OPNsense 与 Tailscale 搭配使用"
description: "在 OPNsense 上设置 Tailscale VPN，无需复杂配置即可实现设备间的安全通信。"
---

最后验证于 Dec 4, 2025

[OPNsense][xt-opnsense] 是一个基于 FreeBSD 构建的开源路由器与防火墙平台。你可以把 Tailscale 安装到 OPNsense 平台上，让它加入你基于 WireGuard 的网状网络。

> **注意：**
>
> OPNsense 是 Tailscale 的社区支持平台。
>
> 自 OPNsense v24.711 起，已提供 `os-tailscale` 社区插件。
>
> 该插件可通过 GUI 安装：**System** > **Firmware** > **Plugins**，勾选 **Show community plugins**。
>
> 使用该插件时，无需执行下文的任何命令行步骤。

## 安装

使用 SSH 或你偏好的其他方式连接到 OPNsense 控制台。选择 `8) Shell` 选项，并确认你当前是 root 用户。

首先必须下载 ports 树（ports tree）。更多信息可参阅 OPNsense [文档][xt-opnsense-included]和 FreeBSD ports [文档][xt-freebsd-install]。

```shell
# opnsense-code ports
Updating OPNsense repository catalogue...
...
Cloning into '/usr/ports'...
...
Your branch is up to date with 'origin/master'.
```

即使之前运行过，也请务必再次运行 `opnsense-code ports`，把 ports 树更新到当前版本。FreeBSD ports 中 Tailscale 的版本会随新版本发布定期更新。有关更新的更多信息见下文。

ports 树下载完成后，以 root 身份执行以下步骤安装 Tailscale。

```shell
# cd /usr/ports/security/tailscale
# make install
```

安装完成后，启动并启用 `tailscaled` 守护进程，然后用 `tailscale version` 验证 Tailscale 是否正常工作。

```shell
# service tailscaled enable
# service tailscaled start
# tailscale version
root@opnsense:~ # tailscale version
1.56.1
  go version: go1.21.5
```

## 连接

要将 OPNsense 机器添加为你 tailnet 中的节点，请以 root 身份运行以下命令：

```shell
# tailscale up
To authenticate, visit:
    https://tailscale.com/a/abc123abc123
```

系统会要求你在浏览器中认证到 Tailscale。此时正适合一并指定其他有用的选项，例如[子网路由][docs-subnets]、[出口节点][docs-exit-nodes]等。

启动之后，Tailscale 应会出现在 OPNsense 界面的接口列表中。它可用于防火墙规则和其他 OPNsense 功能。

*（图：启用了 TLSCL 接口的 OPNsense 界面）*

## 配置防火墙规则

Tailscale 连接后，其接口会出现在 OPNsense 的接口列表中，但 OPNsense 不会自动分配它。在你分配该接口并添加防火墙规则之前，默认防火墙策略会阻止进入 OPNsense 主机的 Tailscale 入站流量，包括 ping、SSH 和 Web UI 访问。要确认这一点，可前往 **Firewall** > **Log Files** > **Live View**，查看 `tailscale0` 接口上被默认拒绝策略拦截的流量。

要允许 tailnet 流量到达 OPNsense 主机，请分配该接口并添加防火墙规则。

1. 前往 **Interfaces** > **Assignments**。
2. 在 **New interface** 部分，从设备下拉菜单中选择 `tailscale0`，然后选择 **+** 添加它。
3. 选择这个新接口进行编辑。选择 **Enable interface**，输入 `tailscale` 之类的描述，然后选择 **Save**。
4. 选择 **Apply changes**。
5. 前往 **Firewall** > **Rules**，选择 Tailscale 接口。
6. 选择 **Add** 创建规则。将 **Action** 设为 **Pass**，输入描述，然后选择 **Save**。
7. 选择 **Apply changes**。

规则生效后，tailnet 中的设备就可以通过 Tailscale 访问 OPNsense 主机了。

> **注意：**
>
> 匹配所有流量的放行（pass）规则会让 tailnet 中的任何设备都能访问 OPNsense 主机。要限制访问，请在 **Firewall** > **Aliases** 中创建一个条目，包含需要访问权限的设备的 Tailscale IP 地址，然后将该别名用作规则来源。

## 更新 Tailscale

要更新 Tailscale，请以 root 用户身份执行以下步骤：

```shell
# opnsense-code ports
# cd /usr/ports/security/tailscale
# make deinstall
# make clean
# make install
# service tailscaled restart
```

这一过程可能需要几分钟，取决于所用 CPU 的性能。使用 `tailscale version` 验证 Tailscale 是否已更新。有时需要用 `service tailscaled restart` 重启 tailscaled 服务。

## 让 LAN 客户端建立直连

作为路由器/防火墙，OPNsense 可能同时在为安装了 Tailscale 客户端的局域网（LAN）设备提供互联网连接。OPNsense 的 NAT 实现属于[端点相关映射（Endpoint-Dependent Mapping），即"困难"NAT（hard NAT）][bl-how-nat-traversal-works]，这意味着 LAN 设备难以建立直连，往往只能退而使用 [DERP 中继][docs-derp-servers]。

有几种方法可以让 OPNsense 帮助 LAN 上的设备与远程 Tailscale 节点建立直连：静态 NAT 端口映射和 NAT-PMP。

## 静态 NAT 端口映射

默认情况下，OPNsense 会重写所有出站连接的源端口，以增强安全性，避免直接暴露内部端口号。

OPNsense 中的静态端口映射是在特定外部端口号与内部 IP 地址和端口之间建立固定关联，让入站流量能被导向本地网络中的正确目的地。

前往 **Firewall > NAT** 的 **Outbound** 选项卡。选择 **Hybrid Outbound NAT rule generation**。选择 **Save**。选择 **↑ Add**，在列表顶部新建一条 NAT 规则。

按照下图所示配置规则以匹配 UDP 流量。注意，每条规则都要选择合适的 **Address Family**（IP 版本）：一条选 **IPv4**，另一条选 **IPv6**。

*（图：Firewall : NAT : Outbound 中的静态 NAT 端口映射配置示例）*

在页面的 **Translation** 部分勾选 **Static Port**。选择 **Save**。选择 **Apply Changes**。

在你的 ACL 中设置 [randomizeClientPort][docs-policy-syntax-network-policy-options]。

```json
{
  // Other configurations
  "randomizeClientPort": true
}
```

在命令行中使用 `tailscale ping node` 验证两个节点之间的连接路径。在此场景下，`tailscale netcheck` 也很有用。

## NAT-PMP

NAT-PMP 是一种协议，LAN 客户端可以通过它请求防火墙临时创建端口映射。

在 **Services** > **Universal Plug and Play** 中启用 UPnP 服务和 **Allow NAT-PMP Port Mapping**。Tailscale 只需要 NAT-PMP，但启用 UPnP 对游戏主机等其他应用也有帮助。

*（图：在 Services : Universal Plug and Play : Settings 中启用 Allow NAT-PMP Port Mapping）*

## 延伸阅读

对于使用 OPNsense 的路由器，设置[子网路由][docs-subnets]或充当[出口节点][docs-exit-nodes]可能也是你感兴趣的用法。

## 特别致谢

特别感谢 GitHub 用户 [@newmy-de][xt-gh-newmy-de]，他帮助我们提供了这些安装说明。

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-policy-syntax-network-policy-options]: /docs/reference/syntax/policy-file#网络策略选项

[docs-derp-servers]: /docs/reference/derp-servers

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets]: /docs/features/subnet-routers

[xt-freebsd-install]: https://docs.freebsd.org/en/books/handbook/ports

[xt-gh-newmy-de]: https://github.com/newmy-de

[xt-opnsense-included]: https://docs.opnsense.org/manual/software_included.html

[xt-opnsense]: https://opnsense.org
