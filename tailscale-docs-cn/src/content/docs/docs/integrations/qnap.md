---
title: "从任何位置访问 QNAP NAS"
description: "在 QNAP NAS 设备上配置 Tailscale 客户端。"
---

最后验证于 Jan 5, 2026

借助 Tailscale，你可以通过 WireGuard® 安全地连接到你的 QNAP NAS 设备。

对于大多数个人用途（包括访问你的 NAS），Tailscale 免费。

## 受支持的 QNAP 硬件

* x86-64 位设备
* arm-64 位设备

## 安装步骤

1. 打开 QNAP App Center。

2. 打开 **Communications**（通信）部分。

   *（图：QNAP App Center 界面）*

3. 找到 Tailscale 应用并选择 **Install**（安装）。

4. Tailscale 应用安装完成后，选择 Tailscale 应用图标，然后选择 **Open**（打开）。

5. 登录你的 Tailscale 网络。

   *（图：登录 Tailscale 网络）*

6. 在 **Connect device**（连接设备）页面，选择 **Connect**（连接）。

该应用也可以从 [QNAP App Center][xt-qnap-app-center] 网站下载。

### 手动安装步骤

除了推荐的从 QNAP App Center 安装 Tailscale 的方式外，你也可以使用可下载的 QNAP 软件包（QPKG）来安装 Tailscale。你可能希望从 QPKG 安装的一个原因是：访问 QNAP App Center 提供的 Tailscale 版本中尚未发布的新 Tailscale 功能。

要手动安装 Tailscale：

1. 从 [Tailscale 软件包服务器][pk-server]下载适用于你的 QNAP 设备的 QPKG。QNAP QPKG 同时提供 [stable][pk-qnap-stable]（稳定）和 [unstable][pk-qnap-unstable]（不稳定）两个发布通道。
2. 打开 QNAP 设备上的 **App Center**。
3. 选择右上角的 **Install Manually**（手动安装），选择 **Browse**（浏览），选择你下载的 QPKG（`.qpkg`）文件，然后选择 **Install**（安装）。
4. 安装完成后，tailscaled 应已在你的 QNAP 设备上启动并运行，你会在"My Apps"部分看到一个新的 **Tailscale** 应用。

## 功能

在 QNAP 上使用时，Tailscale 支持以下功能：

* 当你在 NAS 上创建名为"Taildrop"的共享文件夹（例如在 [QNAP 设备][docs-qnap-setup]上）时，自动接收来自其他 tailnet 设备的 [Taildrop][docs-taildrop] 文件。
* 通过 Web 登录任何[受支持的身份提供方][docs-sso-providers]。
* 随时随地访问你的 QNAP NAS，[无需开放防火墙端口][bl-how-nat-traversal-works]。
* 使用[节点共享][docs-sharing]将你的 NAS 共享给指定的 Tailscale 用户。
* 使用[访问控制策略][docs-access-control]限制对 NAS 的访问。
* 将你的 NAS 用作[子网路由器][docs-subnets]，为局域网（LAN）提供外部访问。这需要使用 [`tailscale`][ar-using-the-tailscale-cli] 命令行步骤。
* 将你的 NAS 用作[出口节点][docs-exit-nodes]，从任何位置安全地访问互联网。

## 使用 Tailscale CLI

某些 Tailscale 功能（例如将 QNAP 配置为子网路由器）需要使用 [`tailscale`][docs-cli] CLI。安装 Tailscale 应用后，`tailscale` CLI 会作为挂载的 `qpkg` 软件包的一部分提供。你可以访问 QNAP 终端，并[通过 SSH][xt-qnap-access-using-ssh]运行 CLI 命令。

你可以使用以下命令找到挂载的软件包路径：

```shell
echo $(getcfg SHARE_DEF defVolMP -f /etc/config/def_share.info)/.qpkg/Tailscale/
```

你可以使用以下命令运行 `tailscale` CLI：

```shell
$(getcfg SHARE_DEF defVolMP -f /etc/config/def_share.info)/.qpkg/Tailscale/tailscale [...]
```

为方便起见，你可以将该软件包路径添加到 `$PATH` 环境变量。

```shell
export PATH=$PATH:$(getcfg SHARE_DEF defVolMP -f /etc/config/def_share.info)/.qpkg/Tailscale/
```

这样，你就可以在无需完整路径的情况下运行 `tailscale` 命令：

```shell
tailscale [...]
```

## 特别致谢

特别感谢 [ivokub][xt-gh-ivokub]，他贡献了社区维护的 [Tailscale QPKG 软件包构建器][xt-gh-ivokub-tailscale]。

[ar-using-the-tailscale-cli]: #使用-tailscale-cli

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-access-control]: /docs/features/access-control

[docs-cli]: /docs/reference/tailscale-cli

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-qnap-setup]: /docs/features/taildrop/how-to/set-up-taildrop-with-nas#在-qnap-上设置-taildrop

[docs-sharing]: /docs/features/sharing

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrop]: /docs/features/taildrop

[pk-server]: https://pkgs.tailscale.com/

[pk-qnap-stable]: https://pkgs.tailscale.com/stable/#qpkgs

[pk-qnap-unstable]: https://pkgs.tailscale.com/unstable/#qpkgs

[xt-gh-ivokub-tailscale]: https://github.com/ivokub/tailscale-qpkg

[xt-gh-ivokub]: https://github.com/ivokub

[xt-qnap-access-using-ssh]: https://www.qnap.com/en/how-to/faq/article/how-do-i-access-my-qnap-nas-using-ssh

[xt-qnap-app-center]: https://www.qnap.com/en/app-center/?os=qts&type=Communications
