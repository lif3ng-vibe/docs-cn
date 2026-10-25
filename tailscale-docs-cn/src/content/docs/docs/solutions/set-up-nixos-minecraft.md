---
title: "Tailscale on NixOS：十分钟搭好一台全新 Minecraft 服务器"
description: "在 NixOS 上搭建 Minecraft 服务器。"
---

最后验证于 Feb 2, 2026

NixOS 是一个从零开始为部署服务而构建的 Linux 发行版。Tailscale 是一个为安全连接设备而构建的点对点 VPN。本文介绍如何在十分钟内，在 DigitalOcean 上搭建一台全新的 Minecraft 服务器（仅通过 Tailscale 暴露）。

## 前提条件

开始之前，你需要：

* 一个 [Tailscale 账户](https://login.tailscale.com/start)。你不必为 Tailscale 付费，本文的场景在 [Personal 套餐][co-pricing]上就能实现。
* 一个 [DigitalOcean][xt-digitalocean] 账户。
* 一个 [Minecraft][xt-minecraft] Java 版账户。

## 第 1 步：编写 NixOS 配置文件

NixOS 的核心原则之一是：整个系统都可以用一种名为 Nix 的模块化语言来配置。这让你用统一的语法配置一切，无需记住每个服务各自的配置文件格式。因此，你可以用一个文件配置整个系统。

我们来创建一个名为 `host.nix` 的新配置文件，搭建一个让 Tailscale 随系统启动的环境：

```nix
{ config, pkgs, ... }:

{
  # make the tailscale command usable to users
  environment.systemPackages = [ pkgs.tailscale ];

  # enable the tailscale service
  services.tailscale.enable = true;
}
```

这样 Tailscale 就会启动了，但要完成 Tailscale 认证还需要几步。首先，访问管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。

创建一个新的一次性认证密钥，然后把它复制到你的笔记里。稍后会用到。

有了这个密钥，我们就能编写一个 [systemd oneshot 单元][xt-digitalocean-systemd]，用它登录 Tailscale。

> **注意：**
>
> systemd oneshot 作业是 systemd 预期只运行一次的作业，而不是常驻服务。前面提到的 DigitalOcean 教程对此有更详细的解释。

把下面的配置复制到 `host.nix` 文件中 `services.tailscale.enable` 那一行之后：

```nix
# ...

# create a oneshot job to authenticate to Tailscale
systemd.services.tailscale-autoconnect = {
  description = "Automatic connection to Tailscale";

  # make sure tailscale is running before trying to connect to tailscale
  after = [ "network-pre.target" "tailscale.service" ];
  wants = [ "network-pre.target" "tailscale.service" ];
  wantedBy = [ "multi-user.target" ];

  # set this service as a oneshot job
  serviceConfig.Type = "oneshot";

  # have the job run this shell script
  script = with pkgs; ''
    # wait for tailscaled to settle
    sleep 2

    # check if we are already authenticated to tailscale
    status="$(${tailscale}/bin/tailscale status -json | ${jq}/bin/jq -r .BackendState)"
    if [ $status = "Running" ]; then # if so, then do nothing
      exit 0
    fi

    # otherwise authenticate with tailscale
    ${tailscale}/bin/tailscale up -authkey <your-auth-key>
  '';
};
```

请务必把 `<your-auth-key>` 替换为你从 Tailscale 管理控制台获取的认证密钥。没有这个认证密钥，你的 VPS 就无法连接到 Tailscale。

> **警告：**
>
> 认证密钥在这个配置文件中是硬编码的。如果其他人能访问该配置文件，认证密钥就得不到保护。关于在 NixOS 中保护密钥的方案选择，请参阅 NixOS 的 [Comparison of secret managing schemes][xt-nixos-secret-manage] 主题。关于保护 Tailscale 认证密钥的通用信息，请参阅[安全地保管认证密钥][docs-secure-auth-key-cli]。

现在 Tailscale 已配置为认证并连接你的网络，接下来启用 NixOS 的轻量防火墙，只允许 Minecraft 流量经由 Tailscale。[NixOS 手册][xt-nixos-sec-firewall]有更多细节，但概括来说我们需要：

* 启用防火墙。
* 把 tailscale0 标记为受信任接口。
* 允许互联网上的任何人连接 Tailscale 的 UDP 端口（别担心，不属于你网络的连接会被拒绝）。
* 允许互联网上的任何人连接你服务器的 SSH 端口（这在 Tailscale 上也能用，但把它暴露在公共互联网上，当你需要通过 SSH 管理服务器时会方便一些）。

把以下配置添加到 `host.nix` 文件末尾即可实现：

```nix
# ...
networking.firewall = {
  # enable the firewall
  enable = true;

  # always allow traffic from your Tailscale network
  trustedInterfaces = [ "tailscale0" ];

  # allow the Tailscale UDP port through the firewall
  allowedUDPPorts = [ config.services.tailscale.port ];

  # let you SSH in over the public internet
  allowedTCPPorts = [ 22 ];
};
```

现在可以配置 Minecraft 服务器了。[Minecraft 选项][xt-nixos-minecraft]暴露了许多设置，你可以随心所欲地配置服务器。注意，你*必须*自己把 EULA 协议设置为 `true`。Minecraft 服务器是闭源程序，因此你必须授权 NixOS 使用闭源软件包。

```nix
# ...
services.minecraft-server = {
  enable = true;
  eula = false; # set to true if you agree to Mojang's EULA: https://account.mojang.com/documents/minecraft_eula
  declarative = true;

  # see here for more info: https://minecraft.gamepedia.com/Server.properties#server.properties
  serverProperties = {
    server-port = 25565;
    gamemode = "survival";
    motd = "NixOS Minecraft server on Tailscale!";
    max-players = 5;
    enable-rcon = true;
    # This password can be used to administer your minecraft server.
    # Exact details as to how will be explained later. If you want
    # you can replace this with another password.
    "rcon.password" = "hunter2";
    level-seed = "10292992";
  };
};

# enable closed source packages such as the minecraft server
nixpkgs.config.allowUnfree = true;
```

现在万事俱备。我们搭好了 Tailscale，配置了到 Tailscale 的自动登录，设置了拒绝所有入站流量的防火墙（来自你 Tailscale 网络的流量除外），并配置好了可以以生存模式游玩的 Minecraft 服务器。

## 第 2 步：DigitalOcean 设置

现在把它部署到一台新的 DigitalOcean 服务器上。打开一个新的文本编辑器窗口，创建一个名为 `user-data.yaml` 的文件。把以下模板复制进去：

```yaml
#cloud-config
write_files:
  - path: /etc/nixos/host.nix
    permissions: "0644"
    content: |
      { pkgs, config, ... }:

      {

      }

runcmd:
  - curl https://raw.githubusercontent.com/elitak/nixos-infect/master/nixos-infect | PROVIDER=digitalocean NIXOS_IMPORT=./host.nix NIX_CHANNEL=nixos-20.09 bash 2>&1 | tee /tmp/infect.log
```

撰写本文时，DigitalOcean 默认没有 NixOS 镜像。因此我们将使用 [nixos-infect][xt-gh-nixos-infect] 自动把 Ubuntu 安装替换为 NixOS。我们还会用它来用刚做好的 `host.nix` 文件自动配置服务器。

把 `host.nix` 的内容复制到 `write_files` 块的 `content` 值中。注意要给文件整体多缩进四个空格，使其符合 YAML user data 的格式。完成后，你的文件应该类似[这个参考文件][xt-gh-gist-gloud]。

有了云配置，接下来在云端启动服务器。

打开 DigitalOcean 控制面板，选择 **Create**（创建），然后选择 **Droplets**。选择 Ubuntu 20.04 镜像和至少 4 GB 内存的套餐（可惜 Minecraft 服务器很吃资源）。

*（图：使用 Ubuntu 20.04 和 4 GB 内存 Droplet 的配置）*

然后选择一个离你近的数据中心，并启用 IPv6 和 User Data 选项。把你的 `user-data.yaml` 文件内容粘贴到出现的文本框中。在显示的 SSH 密钥列表中选择你的 SSH 密钥，然后给 droplet 起个主机名，例如 `minecraft`。愿意的话还可以启用备份。

*（图：粘贴到 user data 字段中的 droplet 用户数据）*

一切就绪后，选择那个绿色大按钮 **Create Droplet**（创建 Droplet）。安装和配置 NixOS 可能需要多达十分钟。全部完成后，你应该能验证你的服务器已经出现在你的 Tailscale 网络中。

## 第 3 步：畅玩 Minecraft

它出现在你的网络列表后，就可以打开 Minecraft 客户端连接你的新服务器了。如果游戏内 UI 提示要使用较旧版本的 Minecraft，你可能需要选择稍旧一点的版本。你可以用[启动器界面][xt-minecraft-change-versions]调整所运行的 Minecraft 版本。

*（图：Tailscale 控制面板中的主机信息）*

*（图：Minecraft 服务器连接界面）*

*（图：作者的 Minecraft 角色身处森林生物群系的游戏内截图）*

## 后续步骤

如果你想管理你的 Minecraft 服务器，可以在系统配置中把 `mcrcon` 软件包添加到 `tailscale` 软件包旁边：

```
environment.systemPackages = with pkgs; [ tailscale mcrcon ];
```

然后你可以用这条命令连接 Minecraft 服务器的命令行：

```shell
mcrcon -p hunter2
```

如果你修改了上面的 `rcon` 密码，需要把这条命令中的密码换成新密码。之后你就可以切换游戏模式、调整一天中的时间，以及做任何你想做的事。

你可以使用[节点共享][docs-sharing]邀请你信任的人来到你的服务器，加入你的冒险。

如果你想在服务器开通后修改配置，用你喜欢的文本编辑器（例如 `nano`）编辑 `/etc/nixos/host.nix` 文件即可。如果你想安装更多服务（例如用 [BorgBackup][xt-nixos-borgbackup] 做备份，或[选项列表][xt-nixos-search]中的任何其他内容），[NixOS 手册][xt-nixos-sec-firewall]可以为你指路。云端就是你的边界——一切皆有可能！

> **注意：**
>
> 可参阅这份 [BorgBackup 指南][xt-xe-borgbackup]。

[co-pricing]: https://tailscale.com/pricing

[docs-secure-auth-key-cli]: /docs/features/access-control/auth-keys/how-to/secure-auth-keys

[docs-sharing]: /docs/features/sharing

[xt-digitalocean-systemd]: https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files#the-service-section

[xt-digitalocean]: https://www.digitalocean.com

[xt-gh-gist-gloud]: https://gist.github.com/Xe/b2f26ae62e7ff6f6030e4a94ed3e2707

[xt-gh-nixos-infect]: https://github.com/elitak/nixos-infect

[xt-minecraft-change-versions]: https://help.minecraft.net/hc/en-us/articles/360034754852-Changing-game-versions-

[xt-minecraft]: https://www.minecraft.net/en-us

[xt-nixos-borgbackup]: https://nixos.org/manual/nixos/stable/index.html#module-borgbase

[xt-nixos-minecraft]: https://search.nixos.org/options?show=services.minecraft-server.dataDir&from=0&size=30&sort=relevance&query=services.minecraft-server

[xt-nixos-search]: https://search.nixos.org/options

[xt-nixos-sec-firewall]: https://nixos.org/manual/nixos/stable/index.html#sec-firewall

[xt-nixos-secret-manage]: https://nixos.wiki/wiki/Comparison_of_secret_managing_schemes

[xt-xe-borgbackup]: https://xeiaso.net/blog/borg-backup-2021-01-09/
