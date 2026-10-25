---
title: "随时随地访问 Synology NAS"
description: "在你的 Synology 设备上安装 Tailscale。按照本指南，从任何地方安全访问你的 Synology NAS。"
---

最后验证于 Jan 5, 2026

借助 Tailscale，你可以远程访问自己的 Synology NAS。

> **注意：**
>
> 下面的相关视频提供了更多背景信息与示例。

[Synology 远程访问简易教程（视频）](https://www.youtube.com/watch?v=0o2EhK-QvmY)

## 功能与优势

Synology NAS 设备接入后，Tailscale 支持以下功能：

* 使用[受支持的身份提供方][docs-sso-providers]登录。
* 从任何地方访问你的 Synology 设备，而[无需开放防火墙端口][bl-how-nat-traversal-works]。
* 使用[节点共享][docs-sharing]功能，将你的 Synology 设备共享给指定的 Tailscale 用户。
* 使用[访问控制策略][docs-access-control]限制并管控对 Synology 设备的访问。
* 将 Synology 设备用作[子网路由器][docs-subnets]，为局域网（LAN）提供外部访问入口。
* 将 Synology 设备指定为[出口节点][docs-exit-nodes]，让你其他的 tailnet 设备从任何地方安全访问互联网。

## 使用 Synology Package Center 安装

从 Synology Package Center 安装是最简单的上手方式。

> **注意：**
>
> 我们建议你[安排自动更新][ar-schedule-auto-updates]，因为 Synology 应用商店发布的版本未必总是最新的 Tailscale 版本。

1. 打开 Synology Package Center（[教程][xt-synology-docs-install]）。

2. 搜索并安装 **Tailscale** 应用。

   *（图：Synology Package Center 的用户界面。）*

3. Tailscale 应用安装完成后，按照提示使用你偏好的身份提供方登录你的 Tailscale 网络（即 tailnet）。如果你还没有 Tailscale 账户，系统会自动创建一个免费账户。

   *（图：Synology 的登录提示。）*

4. 完成 tailnet 身份验证后，你可以在 PC、笔记本、手机或平板上[安装 Tailscale][co-download]，从而连接到你的 Synology 设备。

## 安排自动更新

你可以创建一个计划任务，用来自动检查并安装 Tailscale 客户端更新。

1. 在 Synology 中，前往 **Control Panel** > **Task Scheduler**，选择 **Create**，然后选择 **Scheduled Task**。

2. 选择 **User-defined script**。

3. 在 **General Settings** 选项卡中，输入任务名称，并将 **User:** 设为 `root`。

4. 切换到 **Schedule** 选项卡，选择 **Run on the following days**，再选择 **Run on the follow days**，然后选择一个周期，例如 **Daily**。

5. 切换到 **Task Settings** 选项卡，并在 **User-defined script** 中输入以下内容：

   ```shell
   tailscale update --yes
   ```

6. 选择 **OK** 保存设置。

## 启用出站连接

Synology DSM7 对软件包（package）可执行的操作引入了更严格的限制。如果你运行的是 DSM6，Tailscale 会以 root 身份全权限运行，无需执行这些步骤。

默认情况下，DSM7 上的 Tailscale 只允许入站连接到你的 Synology 设备，而在 Synology 上运行的其他应用无法通过 Tailscale 发起出站访问。

原因在于 Tailscale 软件包没有创建 [TUN 设备][xt-wikipedia-tuntap]的权限。

若要启用 TUN，从而允许 Synology 设备上运行的其他程序发起出站连接：

1. 确保你运行的 Tailscale 为 v1.22.2 或更高版本

2. 在 Synology 中，前往 **Control Panel** > **Task Scheduler**，选择 **Create**，然后选择 **Triggered Task**。

3. 选择 **User-defined script**。

4. 在弹出的 **Create task** 窗口中，选择 **General**。

5. 在 **General Settings** 中，输入任务名称，选择 **root** 作为任务运行所用的用户，并选择 **Boot-up** 作为触发任务的事件。请确保任务已启用。

6. 选择 **Task Settings**，并在 **User-defined script** 中输入以下内容。

   ```shell
   /var/packages/Tailscale/target/bin/tailscale configure-host; synosystemctl restart pkgctl-Tailscale.service
   ```

   如果想了解它的作用，可以阅读 [`configure-host` 的代码][xt-gh-tailscale-cli-synology]。

7. 选择 **OK** 保存设置。

8. 重启你的 Synology 设备。如果不想重启，也可以在设备上以 root 身份运行上述用户自定义脚本，以重启 Tailscale 软件包。

现在，你的 TUN 设置应当会在设备重启后依然保留。

> **注意：**
>
> 升级 Tailscale 软件包后需要重新运行上述脚本。升级 Tailscale 时，请以 root 身份运行上述脚本，或重启你的 Synology 设备。

## 调整 Synology 防火墙设置

启用 TUN 后，Tailscale 流量将受 Synology 内置防火墙的约束。

该防火墙默认处于禁用状态。但如果你启用了它，请为 Tailscale 子网 100.64.0.0/10 添加例外。在 **Main menu** > **Control Panel** > **Security** > **Firewall** 中，在默认配置文件里添加一条防火墙规则，放行来自源 IP 子网 100.64.0.0（子网掩码 255.192.0.0）的流量。

## 故障排除

如果卸载并重新安装 Tailscale 应用后，你的 Synology NAS 无法连接到 tailnet，我们建议按以下步骤操作：

1. 通过 SSH 登录你的 NAS 并运行以下命令：

   ```shell
   sudo tailscale up
   ```

2. 输入 NAS 的密码（如有提示），然后复制给出的 URL。

   ```shell
   To authenticate, visit:
   https://login.tailscale.com/a/xxxxxxxxxx
   Success.
   ```

3. 将该 URL 粘贴到浏览器中，完成 tailnet 身份验证，然后打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认你的 NAS 已连接到 tailnet。

## 在 DSM 上手动安装 Tailscale

> **注意：**
>
> Synology Package Center 大约每个季度更新一次 Tailscale。若要使用最新版本的 Tailscale，你可以[配置定时自动更新][ar-schedule-auto-updates]，或手动安装软件包。

1. 从 Tailscale 软件包服务器站点[下载][pk-stable-synology] DSM 软件包。

   > **注意：**
   >
   > 要确定哪一种下载适合你的 Synology 设备，请访问 [Synology and SynoCommunity Package Architectures][xt-gh-synology-packages] 页面，按 Synology 机型查询你的架构。然后，在 [Tailscale Packages][pk-home] 中找到与你机型对应的 SPK 下载。[stable][pk-stable-synology] 和 [unstable][pk-unstable-synology] 两个发布通道都提供 Synology 软件包（SPK）。

2. 将 DSM 软件包[手动安装][xt-synology-docs-install]到你的 Synology 设备上

3. Tailscale 应用安装完成后，按照提示使用你偏好的身份提供方登录你的 Tailscale 网络（即 tailnet）。如果你还没有 Tailscale 账户，系统会自动创建一个免费账户。

4. 完成 tailnet 身份验证后，你可以在 PC、笔记本、手机或平板上[安装 Tailscale][co-download]，从而连接到你的 Synology 设备。

5. 此时，Tailscale 守护进程 [`tailscaled`][docs-tailscaled] 应已在你的 Synology 设备上运行。你可以通过 Tailscale 软件包的 Synology Web UI 进行配置，也可以通过 SSH 使用 [Tailscale CLI][docs-cli] 进行配置。

> **注意：**
>
> 有关通过 SSH 访问 Synology 的说明，请参阅[如何通过 SSH 以 root 权限登录 DSM/SRM？][xt-synology-docs-ssh]。

## 限制与已知问题

* 如果你要将 Synology 从 DSM6 升级到 DSM7，需要先卸载再重新安装 Tailscale 应用。不要通过 Tailscale 连接执行 DSM7 升级，否则升级过程中可能会失去连接。

* 如果卸载后重新安装 Tailscale 应用，NAS 便无法再连接到你的 tailnet，请参阅[故障排除][ar-troubleshooting]部分的操作说明。

* Tailscale 在 Synology 上使用[混合网络模式][docs-userspace-networking]，这意味着如果你共享了子网，这些子网可以通过 UDP 和 TCP 访问，但不一定能 ping 通。

* 在 DSM7 上，其他 Synology 软件包默认无法向你其他的 Tailscale 节点发起出站连接。启用方法请参见上文「启用出站连接」的说明。

* Synology 上的 Tailscale 目前支持 `--advertise-routes`，但不支持 `--accept-routes`。这意味着如果你还有其他[子网路由器][docs-subnets]，那些子网上的设备暂时无法访问你的 NAS 或其本地子网上的设备。

* [Tailscale SSH][docs-tailscale-ssh] 无法在 Synology 上运行。你可以改用 DSM 自带的 SSH 服务器。

其中一些限制是 DSM7 沙箱强加给 Tailscale 的。上述问题的最新进展请参阅我们在 [GitHub 上的 Synology 跟踪 issue][xt-gh-tailscale-issue-1995]。

## 特别致谢

特别感谢 [Guilherme de Maio (nirev)][xt-gh-nirev]，他贡献了最初的 [Synology-Tailscale 软件包构建器][xt-gh-tailscale-synology]。如今 Tailscale 负责维护该构建器，并以此产出我们的官方 Synology 软件包。

[ar-schedule-auto-updates]: #安排自动更新

[ar-troubleshooting]: #故障排除

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[co-download]: https://tailscale.com/download

[docs-access-control]: /docs/features/access-control

[docs-cli]: /docs/reference/tailscale-cli

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-sharing]: /docs/features/sharing

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking

[pk-home]: https://pkgs.tailscale.com

[pk-stable-synology]: https://pkgs.tailscale.com/stable/#spks

[pk-unstable-synology]: https://pkgs.tailscale.com/unstable/#spks

[xt-gh-nirev]: https://github.com/nirev

[xt-gh-synology-packages]: https://github.com/SynoCommunity/spksrc/wiki/Synology-and-SynoCommunity-Package-Architectures

[xt-gh-tailscale-cli-synology]: https://github.com/tailscale/tailscale/blob/main/cmd/tailscale/cli/configure-synology.go

[xt-gh-tailscale-issue-1995]: https://github.com/tailscale/tailscale/issues/1995

[xt-gh-tailscale-synology]: https://github.com/tailscale/tailscale-synology

[xt-synology-docs-install]: https://kb.synology.com/en-sg/DSM/tutorial/How_to_install_applications_with_Package_Center

[xt-synology-docs-ssh]: https://kb.synology.com/en-id/DSM/tutorial/How_to_login_to_DSM_with_root_permission_via_SSH_Telnet

[xt-wikipedia-tuntap]: https://en.wikipedia.org/wiki/TUN/TAP
