---
title: "使用 ufw 加固 Ubuntu 服务器"
description: "只接受来自 Tailscale 的连接，忽略指向服务器的互联网流量。"
---

最后验证于 Jan 5, 2026

互联网上的任何服务器都难免遭到机器人攻击，它们专门寻找弱密码、泄露的密码以及配置不当的服务。即使是安全专家也可能错误配置数据库，团队中不知情的成员也可能意外引入漏洞，让你的设备或网络暴露在攻击之下。

> **注意：**
>
> 如果你已有一台服务器，可以运行 `sudo less /var/log/auth.log` 查看这些机器人流量。如果你的服务器和网上大多数服务器一样，日志里可能有不少 "invalid user admin" 或 "invalid user test" 条目。

Tailscale 让网络安全变得简单：你可以把服务器藏在公共网络之外，同时保持连接的便捷。

用 Tailscale 保护服务器的最佳方式，是只接受来自 Tailscale 的连接，忽略所有公共互联网流量。由于你的 Tailscale 网络对你网络之外的人完全不可见，攻击者甚至根本找不到它。

## 前提条件

开始本指南之前，你需要一台要加固的 Ubuntu 服务器。本指南假设你正在搭建 [DigitalOcean Ubuntu 服务器][xt-digital-ocean-linux-distros]，但对大多数托管服务商和 Ubuntu 版本来说，步骤应该类似。

你还需要一个 Tailscale 网络，即 tailnet。关于创建 tailnet 的信息，参阅 [Tailscale 快速开始][docs-install]。

接下来，你需要在本地机器上安装 Tailscale 客户端并登录。

[下载 Tailscale](https://tailscale.com/download)

接下来我们将在 Ubuntu 服务器上执行相同的步骤。

## 第 1 步：SSH 连接到你的新 Ubuntu 服务器

新服务器启动后，使用你的账户信息通过 SSH 连接它。

```shell
ssh <username>@<server host ip>
```

## 第 2 步：在 Ubuntu 服务器上安装 Tailscale

1. 使用下面的一行脚本安装 Tailscale，或阅读[详细的 Ubuntu 安装说明][co-download-linux]

   ```shell
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. 完成认证，将你的机器连接到 Tailscale 网络

   ```shell
   sudo tailscale up
   ```

3. （可选）如果你使用自定义域名登录（不是 `@gmail.com` 地址），请访问[管理控制台](https://console.tailscale.com/admin)并授权你的新端点。

4. （可选）为此服务器禁用密钥过期

作为一项安全特性，Tailscale 要求定期重新认证。为避免被锁在外面，你可能想对某些端点（例如这台受信任的服务器）禁用过期。按照[这些说明][docs-key-expiry]禁用密钥过期。

> **注意：**
>
> 如果你保留密钥过期，请提前熟悉如何找回服务器访问权限。例如，DigitalOcean 提供 [droplet 控制台][xt-digital-ocean-console] 访问方式。

## 第 3 步：通过 Tailscale 进行 SSH

这一步很重要——由于我们即将把 SSH 访问限制为仅通过 Tailscale，我们要先退出这台机器，再用 Tailscale IP 重新 SSH。

首先，[查找并复制你机器的 Tailscale IP][docs-ip-and-dns-addresses]。最简单的方法是运行

```shell
tailscale ip -4
```

然后复制显示的 100.x.y.z 地址。

找到之后，`exit` 退出当前 SSH 会话，再用刚复制的 Tailscale IP 发起新的会话。

```shell
ssh <username>@<copied 100.x.y.z address>
```

## 第 4 步：启用 ufw

在本指南中，我们将使用 [ufw][xt-ubuntu-docs-ufw]（Uncomplicated Firewall，简单防火墙）来限制到达服务器的非 Tailscale 流量。它在 Ubuntu 18.04 上预装，无需安装。

在继续编辑规则之前，如果 ufw 尚未启用，你需要先启用它。

```shell
sudo ufw enable
```

## 第 5 步：限制所有其他流量

接下来，我们将设置规则，默认拒绝所有传入的非 Tailscale 流量，并允许所有传出流量。

```shell
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

设置好这些默认值后，检查现有的防火墙规则，看是否有需要保留的。

```shell
sudo ufw status verbose
```

输出可能显示一个防火墙规则列表，如下所示：

```shell
To                          Action      From
--                          ------      ----
22/tcp                      ALLOW IN    Anywhere
80/tcp                      ALLOW IN    Anywhere
443/tcp                     ALLOW IN    Anywhere
Anywhere on tailscale0      ALLOW IN    Anywhere
22/tcp (v6)                 ALLOW IN    Anywhere (v6)
80/tcp (v6)                 ALLOW IN    Anywhere (v6)
443/tcp (v6)                ALLOW IN    Anywhere (v6)
Anywhere (v6) on tailscale0 ALLOW IN    Anywhere (v6)
```

如果输出中没有 `Anywhere on tailscale0` 规则，可以手动创建一条：

```shell
sudo ufw allow in on tailscale0
```

其余所有连接默认都被拒绝，因此没有列在上面。我们要把这个列表精简到所需的最小集合。

要在保留 SSH 访问的同时完全锁定服务器，可以删除除 "Anywhere on tailscale0" 之外的每一条规则。

对于上面的示例，我们将删除所有 "22/tcp" 规则，这会移除通过普通连接进行 SSH 的能力：

```shell
sudo ufw delete 22/tcp
```

现在只剩下 "Anywhere on tailscale0"，这意味着 SSH 只能通过 Tailscale 进行。

```shell
To                          Action      From
--                          ------      ----
80/tcp                      ALLOW       Anywhere
443/tcp                     ALLOW       Anywhere
Anywhere on tailscale0      ALLOW IN    Anywhere
80/tcp (v6)                 ALLOW       Anywhere (v6)
443/tcp (v6)                ALLOW       Anywhere (v6)
Anywhere (v6) on tailscale0 ALLOW IN    Anywhere (v6)
```

如果你对外提供公共 Web 服务（80/tcp、443/tcp），则需要保留这些规则。对于 FTP（21/tcp）或数据库这类不那么公开的服务，可以考虑让依赖这些服务的设备也通过 Tailscale 连接。

> **注意：**
>
> 本指南假设 SSH 运行在默认端口 22 上。如果你更改了 SSH 端口，可能需要相应调整这些步骤。

## 第 6 步：重启 ufw 和 SSH

设置好限制所有非 Tailscale 连接的防火墙规则后，重启 ufw 和 SSH

```shell
sudo ufw reload
sudo service ssh restart
```

现在，服务器会忽略所有不来自你私有 Tailscale 网络已认证用户的 SSH 请求。

## 第 7 步：测试并验证

我们来确认一切按预期工作。

首先，`exit` 退出当前的 SSH 会话。

然后，尝试用之前的公共 IP 地址连接。

连接尝试失败，操作超时。

```shell
ssh <username>@<server host ip>
ssh: connect to host <server host ip> port 22: Operation timed out
```

现在，尝试用之前的 Tailscale IP 地址（以 100.x.y.z 开头）SSH 登录。

```shell
ssh <username>@<copied 100.x.y.z address>
```

现在一切正常。输入 `exit` 再次关闭 SSH 连接。

这一次，退出本地机器上的 Tailscale 客户端。

如果你再次尝试 `ssh` 连接 Ubuntu 服务器，操作会超时，无法再连接。

```shell
ssh <username>@<copied 100.x.y.z address>
ssh: connect to host <copied 100.x.y.z address> port 22: Operation timed out
```

至此我们已验证：只有本地机器上运行的 Tailscale 客户端成功完成认证时，才能建立连接。

## （可选）为所有 SSH 连接启用多因素认证（MFA）

现在你的服务器只能通过 Tailscale 访问，你可以在 Tailscale 网络的[身份提供方][docs-sso-providers]中强制执行登录规则，并且知道这些规则同样会作用于你所有的 SSH 连接。

例如，你可以将身份提供方配置为在每次登录时[要求多因素认证（MFA）][docs-multifactor-auth]。

> **注意：**
>
> 感谢 */u/mgozmovies*，其实验和[发布在 /r/Tailscale 上的文章][xt-reddit-restrict-ssh]启发了本主题。

[co-download-linux]: https://tailscale.com/download/linux

[docs-install]: /docs/how-to/quickstart

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-multifactor-auth]: /docs/multifactor-auth

[docs-sso-providers]: /docs/integrations/identity

[xt-digital-ocean-console]: https://www.digitalocean.com/docs/droplets/resources/console

[xt-digital-ocean-linux-distros]: https://www.digitalocean.com/products/linux-distribution/ubuntu

[xt-reddit-restrict-ssh]: https://old.reddit.com/r/Tailscale/comments/hwnc0l/restricting_ssh_access_to_tailscale_interface_on

[xt-ubuntu-docs-ufw]: https://help.ubuntu.com/community/UFW
