---
title: "与朋友共享私人游戏服务器"
description: "为朋友架设游戏服务器，传统做法要么花钱购买第三方托管服务，要么在防火墙中开放端口，把服务器暴露给互联网上的任何人。使用 Tailscale，你可以"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选解决方案指南：
>
> [**用 Tailscale 运行私人 Minecraft 服务器**](/docs/solutions/set-up-minecraft)——随时随地与你想要的人共享 Minecraft 服务器。

为朋友架设游戏服务器，传统做法要么花钱购买第三方托管服务，要么在防火墙中开放端口，把服务器暴露给互联网上的任何人。使用 Tailscale，你可以只在想共享的人之间私下共享游戏服务器，随时随地，一个端口都不用开，一条防火墙规则都不用动。

Tailscale 通过加密连接以点对点方式连接设备，它的[节点共享功能][docs-sharing]让你网络之外的朋友安全地访问你的服务器——无需公网 IP，也无需复杂配置。

## 在游戏服务器上安装 Tailscale（Linux）

1. 运行自动化安装脚本：

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. 启动 Tailscale 并完成认证：

   ```bash
   sudo tailscale up
   ```

   该命令会显示一个 URL。在浏览器中打开它，把这台机器认证到你的 tailnet。

3. 确认这台机器出现在管理控制台的[机器](https://console.tailscale.com/admin/machines)页面。

4. 要确认分配的 Tailscale IP 地址，运行：

   ```bash
   tailscale ip
   ```

   这就是朋友们用来连接服务器的 IP 地址。

## 锁紧服务器防火墙

把服务器防火墙配置为只允许经由 Tailscale 接口（`tailscale0`）的游戏流量，阻断对游戏端口的直接互联网访问。这能确保只有 tailnet 成员才能连接。

在 Ubuntu 上，使用 `ufw` 锁紧服务器，使其只接受 Tailscale 流量，以端口 `25565`（Minecraft）为示例游戏服务器端口：

1. 设置默认规则：拒绝所有入站，允许所有出站

   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   ```

   `ufw default deny incoming` 这条规则就是阻挡公网访问你游戏服务器端口的关键。

2. 允许 Tailscale 接口上的所有流量

   ```bash
   sudo ufw allow in on tailscale0
   ```

3. 允许 Tailscale 自己的 UDP 端口（点对点连接需要）

   ```bash
   sudo ufw allow 41641/udp
   ```

4. 启用防火墙

   ```bash
   sudo ufw enable
   ```

在本例中，游戏端口 `25565` 从未对公网显式开放，只能经由 `tailscale0` 接口访问，而该接口仅限你的 tailnet 成员使用。

> **提示：**
>
> Tailscale 会直接安装自己的 iptables 规则、绕过 `ufw`，因此即使还没运行 `sudo ufw allow in on tailscale0`，`tailscale0` 接口可能就已经是开放的。

## 与朋友共享服务器

朋友需要拥有自己的 Tailscale 账号才能接收邀请，所以请他们先注册 Tailscale 账号。等他们都有账号后，按以下步骤共享你的服务器：

1. 打开管理控制台的[机器](https://console.tailscale.com/admin/machines)页面。
2. 找到游戏服务器机器，打开 **…** 菜单，选择**共享**（Share）。
3. 两种方式任选：
   * **通过电子邮件共享**（Share by email）：输入每位朋友的电子邮箱地址，选择**共享**，发送单独的邀请链接。
   * **通过链接共享**（Share by link）：选择**复制邀请链接**（Copy invite link），可选开启**可重用链接**（Reusable link，最多可用 1,000 次），然后把链接复制并发送给朋友。
4. 等待每位朋友接受邀请。接受之后，被共享的机器会出现在他们的 Tailscale 客户端中，就像在它们自己的 tailnet 上一样。

> **提示：**
>
> 被共享的机器默认处于隔离状态：它们可以接收来自朋友的入站连接，但无法向朋友的 tailnet 建立出站连接。

然后让你的朋友连接服务器：

1. 安装 Tailscale 并登录。
2. 接受收到的邀请链接。
3. 在游戏客户端中，输入服务器的 Tailscale IP 地址和对应的游戏端口。

现在你的朋友就能连接你的私人游戏服务器了，而它也始终免受潜在攻击者的威胁。

[docs-sharing]: /docs/features/sharing
