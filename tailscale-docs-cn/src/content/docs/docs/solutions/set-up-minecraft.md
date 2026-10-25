---
title: "用 Tailscale 运行私人 Minecraft 服务器"
description: "无论身在何处，都能把 Minecraft 服务器分享给你想分享的人。"
---

最后验证于 Jan 5, 2026

Minecraft 是一款流行的多人游戏，玩家可以连接到某个玩家正在运行的游戏所承载的 Minecraft 世界，也可以连接到托管世界的独立服务器。

没有 Tailscale 时，要让 Minecraft 服务器从家里之外也能访问，只有两种选择：

* 花钱购买第三方托管服务，或
* 在防火墙中开放端口，可能让互联网上的任何人都能够访问

有了 Tailscale，你可以随时随地把它分享给且仅分享给你想分享的人。

在本指南中，我们将演示如何搭建一个 Minecraft `bedrock_server`，并使用 Tailscale 从任何地方连接到该服务器。

## 前提条件

你需要一台 Linux 服务器。以下说明假设这是一台运行在家中、防火墙之后的 Linux 服务器或 VM。Tailscale 让客户端无论身处何地都能连接到计算机，因此你不必担心机器的可访问性——它只要能连上互联网即可。如果你注册了云提供商托管的 VM，请务必[在防火墙中屏蔽几乎所有访问][docs-firewall-ports]。

本指南的说明假设你使用 Ubuntu 或 Debian，不过换成其他 Linux 发行版的改动也很小。

## 第 1 步：在 Linux 上搭建 `bedrock_server`

`bedrock_server` 同时支持 Windows 和 Linux。本指南介绍 Linux。

我们建议创建一个专门的用户来运行 Minecraft 服务器，并安装一些稍后会用到的软件包：

```shell
adduser --system --home /opt/minecraft minecraft
addgroup --system minecraft
adduser minecraft minecraft
chsh --shell /bin/bash minecraft
apt install unzip curl tmux git wget
```

从 `https://www.minecraft.net/en-us/download/server/bedrock` 下载当前版本的 Linux `bedrock_server` 二进制文件。最好用刚创建的 `minecraft` 用户来执行下载：

```shell
su -s -u minecraft
cd ~
wget "download path copied from https://www.minecraft.net/en-us/download/server/bedrock"
```

Minecraft `bedrock_server` 更新相对频繁，而且 Minecraft 游戏应用更新后会要求使用新版服务器。所以我们提前做准备，把服务器文件存入 git：

```shell
git init .
unzip bedrock_server*.zip
rm bedrock_server*.zip
git add -A
git commit -m "Initial bedrock_server"
```

之后每次 `bedrock_server` 更新都可以存入 git。要特别留意 `permissions.json` 和 `server.properties`，因为未来的 `bedrock_server` 版本会覆盖你对它们做过的任何自定义。

### systemd

`systemd` 是一种在系统启动时自动启动服务的方式。我们将创建几个文件，让 `bedrock_server` 自动启动。

***

`/etc/systemd/system/minecraft.service`

```
[Unit]
Description=Minecraft Service
Wants=network.target
After=network.target

[Service]
User=minecraft
Group=minecraft

Type=forking

ProtectHome=true
ProtectSystem=full
PrivateDevices=true
NoNewPrivileges=true
InaccessibleDirectories=/root /sys /srv /media -/lost+found
ReadWriteDirectories=/opt/minecraft
WorkingDirectory=/opt/minecraft
ExecStart=/opt/minecraft/start.sh
ExecStop=/opt/minecraft/stop.sh
TimeoutStopSec=20
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

***

`/opt/minecraft/start.sh`

```shell
#!/bin/sh
/usr/bin/tmux new-session -s minecraft -d
tmux send -t minecraft "LD_LIBRARY_PATH=. ./bedrock_server" ENTER
tmux send -t minecraft "gamerule showcoordinates true" ENTER
tmux send -t minecraft "gamerule keepInventory true" ENTER
```

***

`/opt/minecraft/stop.sh`

```shell
#!/bin/sh
/usr/bin/tmux send -t minecraft save-all ENTER
/usr/bin/tmux send -t minecraft stop ENTER
echo "Killing minecraft session"
/usr/bin/tmux kill-session -t minecraft
```

***

还要把 shell 脚本设为可执行：`chmod +x /opt/minecraft/start.sh /opt/minecraft/stop.sh`

以 root 身份执行 `systemctl start minecraft`，搞定——你正在运行一个 Minecraft 基岩版服务器了。

以 `minecraft` 用户身份，你可以连接 tmux 来访问服务器控制台：

```shell
sudo -s -u minecraft
tmux attach
```

要从 tmux 分离并让 `bedrock_server` 继续运行，先按 Ctrl-B，再按 "d"（detach）。

## 第 2 步：在服务器上安装 Tailscale

Tailscale 几乎支持所有现代 Linux 发行版，只是安装说明可能略有差异。

[下载 Linux 版 Tailscale](https://tailscale.com/download/linux)

安装完成并在 tailnet 中激活后，你的其他 Tailscale 客户端就都能访问 Minecraft `bedrock_server` 了。

## 第 3 步：畅玩 Minecraft

你需要在设备上安装 Tailscale 客户端：iOS 设备用 App Store，Android 设备用 Play Store。你还需要 Minecraft 应用。

在 Minecraft 应用中，选择 **Play**（游玩），然后选择 **Servers**（服务器）标签页。列表中会有一些推广的第三方服务器，滚动到底部会出现一个 **Add Server**（添加服务器）按钮。

*（图：滚动到底部的 Minecraft 服务器列表，带有 Add Server 按钮）*

填写刚创建的服务器的详细信息，包括 Tailscale IP 地址（即 100.x.y.z IP 地址，可在 Tailscale 应用或管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面查询）。

*（图：输入服务器名称，服务器地址为 100.99.98.97）*

系统会要求你先登录 XBox Live 才能连接服务器。`live.com` 账户免费，创建它也不需要拥有 XBox。Tailscale 永远不会收到你的 `live.com` 账户——Minecraft 只是在连接前需要它。

[docs-firewall-ports]: /docs/reference/faq/firewall-ports
