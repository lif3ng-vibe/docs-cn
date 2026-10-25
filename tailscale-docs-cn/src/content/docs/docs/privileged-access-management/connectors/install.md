---
title: "安装 Tailscale PAM 连接器"
description: "你需要安装 [Tailscale PAM 连接器][docs-pam-connectors]，以便在客户端与 Tailscale 网络中受保护的资源之间建立安全会话。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

你需要安装一个 [Tailscale PAM 连接器][docs-pam-connectors]，以便在客户端与 Tailscale 网络中受保护的资源之间建立安全会话。

你可以选择从 Tailscale 管理控制台安装连接器，或手动安装连接器。

## 前提条件

任何用作 Tailscale PAM 连接器运行的设备都需要满足以下前提条件。

* **设备兼容性**：设备必须运行 Linux 或 macOS。

* **到 Tailscale PAM 的网络可达性**：你的连接器必须能够出站访问网络，并通过互联网到达 Tailscale PAM API 和代理。

* **连接器认证**：根据你选择的安装方式，可能需要创建连接器令牌供连接器认证。如果在需要时未提供该令牌，连接器将无法在你的 tailnet 中完成认证，从而无法上线。仅与此连接器关联的任何[服务][docs-pam-services]将无法供你的 tailnet 用户使用。

以下前提条件视使用场景而定。

* **到服务源站的网络可达性**：连接器必须能通过网络访问目标服务（使用上游配置中设置的主机名和端口），AWS SSM 目标除外。例如，如果你的连接器运行在一个私有网络中，且无法连接到另一个私有网络中的目标服务，该连接器将无法建立到上游服务的连接。

* **第三方服务认证**：根据连接器服务的上游配置，你可能需要额外的凭证或配置来向第三方服务认证。具体来说，如果某些服务使用 AWS EC2 Instance Connect 或 AWS SSM 选项连接，你需要确保连接器的运行时可以访问相应的 AWS 凭证，以便使用这些方法连接。

  * 关于连接 AWS EC2 Instance Connect 目标所需 AWS 凭证的帮助，参见 Tailscale PAM 站点上的 [AWS 凭证][xt-border0-aws-ec2]主题。
  * 关于连接 AWS SSM 目标所需 AWS 凭证的帮助，参见 Tailscale PAM 站点上的 [AWS EC2 / ECS With SSM（Session Manager）][xt-border0-aws-ec2-with-ssm]主题。

## 安装连接器二进制文件

连接器二进制文件 `tailzero` 是一个 [`tsnet`][docs-tsnet] 二进制文件，附带单个自动检测的安装脚本。`tailzero` 提供连接器能力，让你的用户安全访问 tailnet 中的服务。安装连接器二进制文件的方式取决于你使用的平台。

#### Linux/macOS

### 使用邀请码安装

如果你想一步完成连接器二进制文件的下载、创建和安装，请使用邀请码。邀请码可从 Tailscale 管理控制台获取。

1. 打开 [Connectors](https://console.tailscale.com/admin/connectors) 页面。

2. 选择 **Add connector**。

3. 选择 **Linux** 选项。macOS 也使用 **Linux** 选项。

4. 复制命令，把占位符替换为你实际的邀请码：

   ```shell
   sh <(curl -fsSL https://tailscale.border0.com/tailzero/install.sh) --invite <your-invite-code>
   ```

5. 在要用作连接器的设备的命令提示符下，运行你复制的命令。

6. 按照提示把设备认证到你的 tailnet。

#### Docker

### 使用邀请码安装

如果你想一步完成连接器二进制文件的下载、创建和安装，请使用邀请码。邀请码可从 Tailscale 管理控制台获取。

1. 打开 [Connectors](https://console.tailscale.com/admin/connectors) 页面。

2. 选择 **Add connector**。

3. 选择 **Docker** 选项。

4. 复制命令，并按你的实际需要替换其中的值：

   ```shell
   docker run -ti --name tailzero-connector \
   --volume tailzero-volume:/var/lib/tailzero \
   ghcr.io/borderzero/tailzero \
   --border0-invite-code <your-invite-code>
   ```

5. 在要用作连接器的设备的命令提示符下，运行你复制的命令。

6. 按照提示把设备认证到你的 tailnet。

#### Kubernetes

1. 打开管理控制台的 [Connectors](https://console.tailscale.com/admin/connectors) 页面。
2. 选择 **Add connector**。
3. 选择 **Kubernetes** 选项。
4. 为命名空间（namespace）和 release 名称指定值。你也可以选择创建命名空间。
5. 在要用作连接器的设备的命令提示符下，运行 **Launch New Connector** 页面中显示的命令。

#### AWS EC2

1. 打开管理控制台的 [Connectors](https://console.tailscale.com/admin/connectors) 页面。
2. 选择 **Add connector**。
3. 选择 **AWS EC2** 选项。
4. 按照 **Launch New Connector** 页面中显示的说明操作。

这会把连接器进程作为系统服务在你的操作系统上启动，确保它在重启后继续运行。在 **Connectors** 页面中，你的连接器应显示为 **online**。

安装完成后，你就可以创建服务。这些服务会出现在你的 Tailscale 客户端中，让你的 tailnet 用户安全访问它们，而无需在客户端上再次登录。

## 管理连接器服务

你可以使用命令行管理连接器服务。

### 在 Linux 上管理连接器服务

查看 PAM 连接器服务的当前状态：

```shell
sudo systemctl status tailzero
```

停止 PAM 连接器服务：

```shell
sudo systemctl stop tailzero
```

启动 PAM 连接器服务：

```shell
sudo systemctl start tailzero
```

重启 PAM 连接器服务：

```shell
sudo systemctl restart tailzero
```

查看连接器日志：

```shell
journalctl -fu tailzero
```

### 在 macOS 上管理连接器服务

停止 PAM 连接器服务：

```shell
sudo launchctl unload /Library/LaunchDaemons/tailzero.plist
```

启动 PAM 连接器服务：

```shell
sudo launchctl load /Library/LaunchDaemons/tailzero.plist
```

## 更新连接器二进制文件

更新连接器二进制文件有两种方式。

你可以运行 `tailzero version upgrade` 命令：

```shell
sudo tailzero version upgrade
```

或者，在 Linux 和 macOS 上，运行与安装二进制文件相同的命令：

```shell
sh <(curl -fsSL https://tailscale.border0.com/tailzero/install.sh)
```

要确定你正在运行的版本，请运行：

```shell
tailzero version
```

## 配置你的连接器

安装并启动连接器后，它应显示在 [Connectors](https://console.tailscale.com/admin/connectors) 页面中。该连接器提供多个内置服务，可以通过配置连接器详情来启用或禁用。默认情况下，连接器配置为运行一个内置 SSH 服务器，让你可以在连接器主机上打开 SSH shell。

关于连接器的更多信息，参见 [PAM 连接器][docs-pam-connectors]。

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-services]: /docs/privileged-access-management/services

[docs-tsnet]: /docs/features/tsnet

[xt-border0-aws-ec2-with-ssm]: https://docs.border0.com/docs/aws-ec2-with-ssm#aws-credentials-for-border0-connector

[xt-border0-aws-ec2]: https://docs.border0.com/docs/aws-ec2-instance-connect#aws-credentials
