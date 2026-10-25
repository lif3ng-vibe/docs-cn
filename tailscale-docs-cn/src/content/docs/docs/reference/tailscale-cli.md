---
title: "Tailscale CLI"
description: "使用 Tailscale 命令行界面（Tailscale CLI）管理和排查 tailnet 中的设备问题。"
---

最后验证于 Jul 30, 2026

Tailscale 客户端内置了命令行界面（CLI），可用于管理和排查你的设备在 Tailscale 网络（即 tailnet）中的问题。

> **注意：**Tailscale CLI 适用于[所有套餐](https://tailscale.com/pricing)。

## 使用 Tailscale CLI

CLI 的位置因平台而异：

#### Linux

在 Linux 上，CLI 是你使用 Tailscale 的主要界面。`tailscale` 二进制文件通常已在你的 `$PATH` 中，因此你可以这样运行命令：

```shell
tailscale <command>
```

#### macOS

如果你使用 macOS 客户端的 Standalone 变体，可以在客户端设置中安装 CLI 集成。此功能要求 macOS Ventura 13.0 或更高版本。

1. 在 Tailscale 客户端中，选择 **Settings**。
2. 找到 CLI 集成（CLI integration）部分，然后选择 **Show me how**。
3. 选择 **Install Now** 并输入 macOS 管理员密码。

这会把一个 `tailscale` CLI 启动器安装到 `/usr/local/bin/tailscale`，让你可以在终端中直接输入 `tailscale`，无需指定完整路径。

> **注意：**
>
> 如果你通过 App Store 安装了 macOS 客户端，CLI 打包在 Tailscale 应用内部。请这样运行命令：
>
> ```shell
> /Applications/Tailscale.app/Contents/MacOS/Tailscale <command>
> ```
>
> 如果你经常使用 Tailscale CLI，可以在 `.bashrc`、`.zshrc` 或 shell 配置中添加一个别名来简化操作。
>
> ```shell
> alias tailscale="/Applications/Tailscale.app/Contents/MacOS/Tailscale"
> ```

> **注意：**
>
> 适用于 macOS 的 Tailscale 把 CLI 包含在应用可执行文件中。启动 Tailscale 可执行文件时，它会检查特定的环境变量（如 `SHLVL`、`TERM`、`TERM_PROGRAM` 和 `PS1`）来决定是以带窗口界面的 macOS 应用方式启动，还是作为 CLI 工具启动。
>
> 如果你在脚本中使用 Tailscale CLI（例如解析 `tailscale status` 的输出），请确保设置了正确的环境变量。如果你的脚本意外打开了 macOS 应用版的 Tailscale，可以通过设置环境变量 `TAILSCALE_BE_CLI=1`，强制脚本以 CLI 方式（而非 macOS 应用方式）运行 Tailscale。

#### Windows

在 Windows 上，你可以在命令提示符中执行 `.exe` 来使用 CLI。

```powershell
tailscale <command>
```

iOS 和 Android 不支持 CLI。

### Tab 补全

Tailscale CLI 支持为命令、标志（flag）和参数提供 Tab 补全。你可以用 [`completion` 命令][ar-completion]配置 Tab 补全。

```shell
tailscale completion <shell> [--flags] [--descs]
```

选择你的 shell，然后按照说明加载 Tailscale CLI 补全。

#### Bash

要加载 Bash 的 Tab 补全，请运行以下命令。

```shell
source <(tailscale completion bash)
```

在 Linux 上运行以下命令为每个新会话加载补全，然后重新加载你的 shell。

```shell
tailscale completion bash > /etc/bash_completion.d/tailscale
```

在 macOS 上运行以下命令为每个新会话加载补全，然后重新加载你的 shell。

```shell
tailscale completion bash > $(brew --prefix)/etc/bash_completion.d/tailscale
```

#### Zsh

> **注意：**
>
> 你的 Zsh 环境必须已启用 shell 补全。
>
> ```shell
> echo "autoload -U compinit; compinit" >> ~/.zshrc
> ```

运行以下命令加载 Zsh 补全，然后重新加载你的 shell。

```shell
tailscale completion zsh > "${fpath[1]}/_tailscale"
```

#### Fish

运行以下命令加载 Fish 补全，然后重新加载你的 shell。

```shell
tailscale completion fish > ~/.config/fish/completions/tailscale.fish
```

#### PowerShell

运行以下命令加载 PowerShell 补全。

```powershell
tailscale completion powershell | Out-String | Invoke-Expression
```

运行以下命令，然后在 PowerShell 配置文件中 source `tailscale.ps1`，即可为每个新会话加载补全。

```powershell
tailscale completion powershell > tailscale.ps1
```

## 命令参考

所有命令的通用标志：

* `--socket=<path>` tailscaled 套接字（socket）的路径。

### up

将设备连接到 Tailscale，并在需要时进行认证。

```shell
tailscale up [flags]
```

不带任何标志运行 `tailscale up` 会连接到 Tailscale。

常用标志：

* `--accept-routes` 接受其他节点通告的[子网路由][docs-subnets]。默认行为取决于宿主操作系统。对于某些平台——Windows、iOS、Android、macOS App Store 变体和 macOS standalone 变体——默认接受路由。其他所有平台默认不接受路由。
* `--advertise-exit-node` 主动提出作为 Tailscale 网络出站互联网流量的[出口节点][docs-exit-nodes]。默认不主动提出。
* `--advertise-routes=<ip>` 把物理[子网路由][docs-subnets]暴露给你的整个 Tailscale 网络。
* `--exit-node=<ip|name>` 提供一个 [Tailscale IP][docs-ip-and-dns-addresses]或[机器名][docs-machine-names]作为出口节点。要停用出口节点，请传入空参数：`--exit-node=`。
* `--exit-node-allow-lan-access` 允许客户端节点在连接出口节点的同时访问自己的 LAN。默认在连接出口节点期间不允许访问。
* `--force-reauth` 强制重新认证。
* `--snat-subnet-routes`（仅限 Linux）禁用源 NAT。正常运行时，子网中的设备看到的流量来自子网路由器。这简化了路由，但不允许跨越多个网络。禁用源 NAT 后，末端机器看到的源地址是发起机器的 LAN IP 地址。
* `--stateful-filtering` 为[子网路由器][docs-subnets]和[出口节点][docs-exit-nodes]启用有状态过滤。启用后，目标 IP 是其他节点的入站数据包会被丢弃，除非它们属于该节点某条已跟踪出站连接的一部分。默认禁用。
* `--shields-up` [阻断][docs-client-preferences]来自 Tailscale 网络中其他设备的入站连接。适用于只发出连接的个人设备。
* `--ssh` 运行 [Tailscale SSH][docs-tailscale-ssh] 服务器，按照 tailnet 管理员声明的[访问策略][docs-acls]（若未定义则按[默认策略][docs-acl-samples-all-default]）允许访问。默认为 false。

完整的可用标志列表请参阅 [`tailscale up`][docs-tailscale-up] 主题。

### down

断开与 Tailscale 的连接。运行此命令等同于在 Tailscale 客户端中选择断开连接或退出。

```shell
tailscale down
```

断开后，你无法通过 Tailscale 访问设备。要重新连接，请不带任何标志重新运行 `tailscale up`。

可用标志：

* `--accept-risk=<risk>` 接受风险并跳过该风险类型的确认。取值可以是 `lose-ssh` 或 `all`，或用空字符串表示不接受风险。
* `--reason="<description>"` 当[系统策略][docs-mdm-keys] `AlwaysOn.Enabled` 和 `AlwaysOn.OverrideWithReason` 启用时，指定断开 Tailscale 的原因（放在引号内）。例如 `tailscale down --reason="DNS issues"`。

### bugreport

> **注意：**
>
> `bugreport` 命令在 Tailscale v1.8 或更高版本中可用。如果你没有这个命令，请考虑[更新][docs-update]你的 Tailscale 客户端。

生成包含诊断信息的错误报告。

`bugreport` 命令会在诊断日志中打上标记以便分诊，让你更方便地向 Tailscale 团队报告错误。

如果你遇到连接问题，请在出现问题的设备上、在问题发生时运行 `tailscale bugreport`。

```shell
tailscale bugreport
```

此命令会向诊断日志中写入一个随机标识符，你可以把它分享给我们的团队。

标识符类似这样：

```shell
BUG-1b7641a16971a9cd75822c0ed8043fee70ae88cf05c52981dc220eb96a5c49a8-20210427151443Z-fbcd4fd3a4b7ad94
```

此命令不共享任何个人可识别信息；除非你把错误标识符分享给我们的团队，否则这些信息不会被使用。

可用标志：

* `--diagnose` 在生成 `bugreport` 标识符后，向 Tailscale 日志输出关于系统的额外详细信息，我们的支持团队随后可以查看。默认为 `false`。
* `--record` 先暂停，然后写入另一个 `bugreport`。使用此标志先创建一个初始 `bugreport` 标识符。在暂停期间，执行能复现问题的操作。然后按 Enter 创建第二个 `bugreport` 标识符。把两个错误标识符都分享给我们的团队。默认为 `false`。

### cert

在主机上生成 Let's Encrypt 证书和密钥文件，用于你 tailnet 的 [HTTPS 证书][docs-enabling-https]。

> **注意：**
>
> 如果你想托管一个文件目录，或反向代理到某个 HTTP 服务，请改用 [`tailscale serve`][ar-serve] 命令。

```shell
tailscale cert hostname.tails-scales.ts.net
```

如果你想把证书和私钥保存到文件，可以使用 `--cert-file` 和 `--key-file` 参数：

```shell
tailscale cert --cert-file=cert.pem --key-file=key.pem hostname.tails-scales.ts.net
```

Let's Encrypt 签发的证书有效期为 90 天，需要定期续期。当证书以磁盘文件的形式交付、再由你移动到安装位置时（例如使用 `tailscale cert` 时），[`tailscaled` 守护进程][docs-tailscaled]并不知道该把续期的证书放在哪里、如何安装。因此，你必须自行负责续期用 `tailscale cert` 创建的证书。

如果证书的处理过程不涉及用户发起的基于文件的安装（例如使用 [Tailscale 的 Caddy 集成][xt-gh-tailscale-caddy-tailscale]时），证书会自动续期，用户无需做任何事。

可用标志：

* `--cert-file=<cert>` 指定证书输出路径。
* `--key-file=<key>` 指定私钥输出路径。
* `--min-validity=<duration>` 请求返回的证书至少保留指定的剩余有效期。`duration` 可以是任何能被 [`time.ParseDuration()`][xt-go-time-parseduration] 解析的值。例如用 `120h` 把时长设为五天。
* `--serve-demo` 使用该证书在 `:443` 端口上做演示性服务，而不是把文件写入磁盘。

> **注意：**
>
> `--min-validity` 标志让你确保返回的证书至少在指定时长内有效。如果你指定的时长超过 [Let's Encrypt 设置的证书有效期][xt-lets-encrypt-cert-lifetime]，将使用 Let's Encrypt 允许的最长有效期。

### dns

`dns` 命令让你访问 [Tailscale DNS 设置][docs-dns]。它在 Tailscale v1.74.0 及更高版本中可用。

子命令：

* `status` 输出本地 DNS 转发器的配置以及 tailnet 级 [MagicDNS][docs-magicdns] 配置。
* `query` 使用本地 DNS 转发器执行一次 DNS 查询。它在 Tailscale v1.76.0 及更高版本中可用。

`status` 的可用标志：

* `--all` 输出高级调试信息。

`status` 和 `query` 的可用标志：

* `--json` 以 JSON 格式输出。

### drive

使用 [Taildrive][docs-taildrive] 与你的 tailnet 共享目录。

```shell
tailscale drive share <name> <path>
tailscale drive rename <oldname> <newname>
tailscale drive unshare <name>
tailscale drive list
```

子命令：

* `share` 创建或修改共享。
* `rename` 重命名共享。
* `unshare` 移除共享。
* `list` 列出当前共享。

### completion

为 Tailscale CLI 配置 Tab 补全。

```shell
tailscale completion <subcommand> [flags]
```

子命令：

* `bash` 为 `bash` shell 配置 Tab 补全。
* `zsh` 为 `zsh` shell 配置 Tab 补全。
* `fish` 为 `fish` shell 配置 Tab 补全。
* `powershell` 为 PowerShell 配置 Tab 补全。

可用标志：

* `--flags=<true|false>` 配置是否（在子命令之外）建议标志。默认为 `true`。
* `--descs=<true|false>` 配置建议中是否包含子命令的描述。默认为 `true`。

### configure

配置你想纳入 tailnet 的资源。

```shell
tailscale configure <subcommands>
```

子命令：

* `kubeconfig`（alpha）配置 `kubectl` 通过 Tailscale 连接 Kubernetes 集群。
* `mac-vpn` 在 macOS 的 [App Store 变体][docs-macos-mac-app-store]和 [Standalone 变体][docs-macos-standalone]上安装或卸载 VPN 配置。
* `synology` 配置 Synology，启用 Tailscale 所需的出站连接。
* `sysext` 在 macOS 的 [Standalone 变体][docs-macos-standalone]上激活、停用或管理 Tailscale [系统扩展][docs-apple-sysext]的状态。
* `systray` 管理 Linux 的 `systray` 客户端。

`kubeconfig` 的可用标志：

* `--http` 使用 HTTP 而不是 HTTPS 连接认证代理。如果主机名参数中包含协议（scheme）则忽略此项。

`mac-vpn` 的可用子命令：

* `install` 把 Tailscale VPN 配置写入 macOS 设置。
* `uninstall` 从 macOS 设置中删除 Tailscale VPN 配置。

`sysext` 的可用子命令：

* `activate` 向 macOS 注册 Tailscale 系统扩展。
* `deactivate` 在 macOS 上停用 Tailscale 系统扩展。
* `status` 输出 Tailscale 系统扩展的启用状态。

`systray` 的可用标志：

* `--enable-startup=<init-system>` 为 init 系统安装启动脚本。当前唯一支持的值是 `systemd`。

示例：

* 为本地 `kubeconfig` 文件配置与 Kubernetes 认证代理的认证：

```shell
tailscale configure kubeconfig <hostname-or-fqdn>
```

* 配置 Synology 以启用出站连接：

```shell
tailscale configure synology
```

### exit-node

获取你 tailnet 中[出口节点][docs-exit-nodes]的信息。

```shell
tailscale exit-node <subcommands>
```

可用子命令：

* `list` 列出你 tailnet 中的出口节点。
* `suggest` 给出[建议的出口节点][docs-auto-exit-nodes]。

`list` 的可用标志：

* `--filter=<country>` 按国家/地区筛选出口节点。

### file

访问文件并让文件可供 [Taildrop][docs-taildrop] 使用。

```shell
tailscale file cp <files...> <target>:
tailscale file get <target-directory>
```

可用命令：

* `cp` 把文件复制到主机。
* `get` 把文件移出 Tailscale 文件收件箱。

`cp` 的可用标志：

* `--name=<name>` 使用备用文件名，在 `<file>` 为 `-`（`stdin`）时尤其有用。
* `--targets` 列出可能的文件 `cp` 目标。
* `--update-interval=<time>` 进度行的刷新频率；为零或负值则完全不显示进度。默认为 `250ms`。
* `--verbose` 详细输出。

`get` 的可用标志：

* `--conflict=<behavior>` 目标目录中已存在同名冲突文件时的 `behavior`（处理方式）。
  * `skip` 跳过冲突文件：把它们留在 Taildrop 收件箱中并输出错误，同时取出所有不冲突的文件。
  * `overwrite` 覆盖现有文件。
  * `rename` 写入一个带数字后缀的新文件名。
* `--loop` 以循环方式运行 get，随到随收文件。
* `--verbose` 详细输出。
* `--wait` 如果收件箱为空则等待文件到达。

### funnel

把内容和本地服务器从你的 Tailscale 节点发布到互联网。

要把本地服务的访问限制在 tailnet 内，请使用 [`serve`][ar-serve] 命令。

```shell
tailscale funnel <target>
tailscale funnel <subcommand> [flags] <args>
```

子命令：

* [`status`][docs-tailscale-funnel-get-the-status] 获取状态。
* [`reset`][docs-tailscale-funnel-reset-tailscale-funnel] 重置配置。

更多信息请参阅 [`tailscale funnel`][docs-tailscale-funnel] 主题。

### get

获取机器的当前偏好设置。

此命令显示由 [`set`][ar-set]或[`up`][ar-up]命令配置的偏好设置。

不带参数或带 `all` 时，显示全部偏好设置。指定具体设置名时，只显示该值。

设置名与 [`tailscale set`][ar-set] 接受的标志名相同。

注意，使用[快速用户切换][docs-fast-user-switching]时，只显示当前连接的 tailnet 的偏好设置。

```shell
tailscale get [flags] [setting-name | all]
```

可用标志：

* `--json` 以 JSON 格式输出。
* `--set-flags` 以 [`set`][ar-set] 命令的命令行标志形式输出。例如，以下命令把每项偏好都设置为当前值：`tailscale set $(tailscale get --set-flags)`。

### ip

获取设备的 Tailscale IP 地址。

```shell
tailscale ip [flags] [<hostname>]
```

默认情况下，此命令返回当前设备的一个 [`100.x.y.z` IPv4 地址][docs-ip-and-dns-addresses]和一个 IPv6 地址。你可以通过传入 `-4` 或 `-6` 标志只返回 IPv4 或 IPv6 地址。

```shell
tailscale ip -4
```

例如，此命令会返回类似如下的信息：

```shell
100.121.112.23
```

你还可以在命令后面加上设备主机名，查询网络中其他设备的 Tailscale IP。例如：

```shell
tailscale ip raspberrypi
```

此命令会返回类似如下的信息：

```shell
100.126.153.111
fd7a:115c:a1e0:ab12:4843:cd96:627e:9975
```

可用标志：

* `--4` 只返回 IPv4 地址。
* `--6` 只返回 IPv6 地址。
* `--1` 只返回一个地址，优先 IPv4。
* `--assert=<specific-ip-address>` 断言节点的 IP（或节点的某个 IP）与该 IP 地址匹配。

### licenses

获取开源许可信息。

```shell
tailscale licenses
```

### lock

管理你 tailnet 的 [Tailnet Lock][docs-tailnet-lock]。

```shell
tailscale lock <subcommand> [flags] <args>
```

常用子命令：

* [`init`][docs-tailscale-lock-lock-init] 初始化 Tailnet Lock。
* [`status`][docs-tailscale-lock-lock-status] 输出 Tailnet Lock 的状态。
* [`add`][docs-tailscale-lock-lock-add] 向 Tailnet Lock 添加一个或多个受信任签名密钥。
* [`remove`][docs-tailscale-lock-lock-remove] 从 Tailnet Lock 移除一个或多个受信任签名密钥。
* [`sign`][docs-tailscale-lock-lock-sign] 为节点密钥签名，并把签名传送给协调服务器。

不带子命令和参数运行 `tailscale lock` 等同于运行 [`tailscale lock status`][docs-tailscale-lock-lock-status]。

完整的子命令和标志列表请参阅 [`tailscale lock`][docs-tailscale-lock] 主题。

### login

登录 Tailscale（并把这台设备加入你的 Tailscale 网络）。关于登录的更多信息，请参阅[快速用户切换][docs-fast-user-switching]。

```shell
tailscale login [flags]
```

可用标志：

* `--accept-dns` 接受来自管理控制台的 [DNS 配置][docs-dns]。默认接受 DNS 设置。
* `--accept-routes` 接受其他节点通告的[子网路由][docs-subnets]。默认行为取决于宿主操作系统。对于某些平台——Windows、iOS、Android、macOS App Store 变体和 macOS standalone 变体——默认接受路由。其他所有平台默认不接受路由。
* `--advertise-connector` 主动提出作为 tailnet 特定域互联网流量的[应用连接器][docs-app-connector]。
* `--advertise-exit-node` 主动提出作为 Tailscale 网络出站互联网流量的[出口节点][docs-exit-nodes]。默认不主动提出。
* `--advertise-routes=<ip>` 把物理[子网路由][docs-subnets]暴露给你的整个 Tailscale 网络。
* `--advertise-tags=<tags>` 给予此设备带标签设备的权限。你必须[被列在 `"TagOwners"` 中][docs-policy-syntax-tag-owners]才能应用标签。
* `--auth-key=<key>` 提供[认证密钥][docs-auth-keys]，自动把该节点认证为你的用户账户。处理 `--auth-key` 值的最佳实践请参阅[安全地保管认证密钥][docs-secure-auth-key-cli]。
* `--client-id` 用于通过[工作负载身份联合][docs-workload-identity]生成[认证密钥][docs-auth-keys]的客户端 ID。
* `--client-secret` 用于生成[认证密钥][docs-auth-keys]的 [OAuth 客户端][docs-oauth-clients]密钥；如果以 `file:` 开头，则为包含该密钥的文件路径。
* `--exit-node=<ip|name>` 提供一个 [Tailscale IP][docs-ip-and-dns-addresses]或[机器名][docs-machine-names]作为出口节点。要停用出口节点，请传入空参数：`--exit-node=`。
* `--exit-node-allow-lan-access` 允许客户端节点在连接出口节点的同时访问自己的 LAN。默认在连接出口节点期间不允许访问。
* `--hostname=<name>` 为设备提供主机名，替代操作系统提供的主机名。注意这会改变 [MagicDNS][docs-magicdns] 中使用的机器名。
* `--id-token` 来自身份提供方、用于与控制服务器交换以实现[工作负载身份联合][docs-workload-identity]的 ID 令牌；如果以 `file:` 开头，则为包含该令牌的文件路径。
* `--audience` 由[工作负载身份联合][docs-workload-identity]生成的认证密钥在向身份提供方请求 ID 令牌时使用的受众（audience）。
* `--login-server=<url>` 提供控制服务器的基础 URL，代替 `https://controlplane.tailscale.com`。如果你使用 [Headscale][bl-opensource-coordination-server] 作为控制服务器，请使用你的 Headscale 实例的 URL。
* `--netfilter-mode=<mode>` Netfilter 模式（`on`、`nodivert`、`off` 之一）。更多信息请参阅 [Tailscale netfilter 模式][docs-netfilter-modes]。
* `--nickname=<name>` 当前账户的[昵称][docs-fast-user-switching-set-nickname]。
* `--operator=<user>` 提供一个非 `root` 的 Unix 用户名来运行 `tailscaled`。
* `--qr` 为网页登录 URL 生成二维码。默认不显示二维码。
* `--qr-format=<format>` 二维码格式：`small` 或 `large`。默认为 `small`。
* `--report-posture` 允许管理平面收集[设备态势][docs-device-posture]信息。默认为 `false`。
* `--stateful-filtering` 为[子网路由器][docs-subnets]和[出口节点][docs-exit-nodes]启用有状态过滤。启用后，目标 IP 是其他节点的入站数据包会被丢弃，除非它们属于该节点某条已跟踪出站连接的一部分。默认禁用。
* `--shields-up` [阻断][docs-client-preferences]来自 Tailscale 网络中其他设备的入站连接。适用于只发出连接的个人设备。
* `--snat-subnet-routes` 对以 `--advertise-routes` 通告的本地路由进行源 NAT。
* `--ssh` 运行 [Tailscale SSH][docs-tailscale-ssh] 服务器，按照 tailnet 管理员声明的[访问策略][docs-acls]（若未定义则按[默认策略][docs-acl-samples-all-default]）允许访问。默认为 false。
* `--timeout=<duration>` 等待 Tailscale 服务初始化的最长时间。`duration` 可以是任何能被 [`time.ParseDuration()`][xt-go-time-parseduration] 解析的值。默认为 `0s`，即无限等待。
* `--unattended`（仅限 Windows）以[无人值守模式][docs-run-unattended]运行，即使当前用户注销后 Tailscale 也会继续运行。

### logout

断开与 Tailscale 的连接并使当前登录失效。下次运行 `tailscale up` 时，你需要重新认证设备。

```shell
tailscale logout
```

如果在[临时节点][docs-ephemeral-nodes]上运行 `tailscale logout`，该节点会立即从你的 tailnet 中移除。

可用标志：

* `--reason` 注销原因，如果[系统策略][docs-mdm-keys]有要求。

### metrics

暴露并收集 [Tailscale 客户端指标][docs-client-metrics]，供第三方监控系统使用。

```shell
tailscale metrics
```

子命令：

* `print` 在当前终端会话中显示客户端指标。
* `write` 把指标值写入文本文件。

### netcheck

获取当前物理网络状况的报告。提供此命令是为了帮助排查连接问题。

```shell
tailscale netcheck
```

`netcheck` 会输出类似这样的报告：

```shell
Report:
	* Time: 2025-03-13T16:35:03.336481Z
	* UDP: true
	* IPv4: yes, <ipv4-address>
	* IPv6: yes, <ipv6-address>
	* MappingVariesByDestIP: false
	* PortMapping:
	* Nearest DERP: Seattle
	* DERP latency:
		- sea: 24.2ms  (Seattle)
		- sfo: 50.5ms  (San Francisco)
		- lax: 57.2ms  (Los Angeles)
		- den: 58.5ms  (Denver)
		- dfw: 63ms    (Dallas)
		- ord: 73.3ms  (Chicago)
```

（示例输出中，[DERP 服务器][docs-derp-servers]列表为简洁起见被截断。）

* `UDP` 显示当前网络是否启用了 UDP 流量。如果为 false，Tailscale 很可能无法建立点对点连接，将转而依赖我们的[加密 TCP 中继（DERP）][docs-derp-servers]。
* `IPv4` 和 **IPv6** 显示你网络的公网 IP 地址以及对两种协议的支持情况。
* `MappingVariesByDestIP` 描述你的设备是否位于一种"困难的"NAT 之后——它会根据目的地改变设备的 IP 地址。
* `HairPinning` 描述你的路由器能否把来自 LAN 端点的连接，用这些端点的全局映射 IPv4 地址/端口路由回 LAN。
* `PortMapping` 描述路由器上存在哪几种端口映射服务。可能的值是 "UPnP"、"NAT-PMP" 和 "PCP"。
* `DERP latency` 和 `Nearest DERP` 描述与我们的[加密 TCP 中继（DERP）][docs-derp-servers]之间的延迟。延迟最低（"最近"）的服务器会被用于传输流量。

如果有字段为空，表示 Tailscale 无法测量该项网络属性。

`tailscale netcheck` 的所有信息也可以在管理控制台的[机器（Machines）](https://console.tailscale.com/admin/machines)页面中查看，选中特定机器即可。

可用标志：

* `--every=<duration>` 如果非零，则以给定频率进行增量报告。
* `--format=<format>` 输出格式；留空（人类可读）、`json` 或 `json-line`。
* `--verbose` 详细日志。
* `--bind-address` 使用此本地绑定的 IP 地址发送和接收连通性探测。
* `--bind-port` 使用此 UDP 端口发送和接收连通性探测。

### nc

连接到主机上的某个端口，连接到 stdin/stdout。

```shell
tailscale nc <hostname-or-IP> <port>
```

### ping

尝试完全通过 Tailscale 对另一台设备执行 ping。

普通的 `ping` 命令在 Tailscale 上通常也能正常工作，但 `tailscale ping` 会提供更多关于 Tailscale 连接的细节，在排查连接问题时很有帮助。

```shell
tailscale ping <hostname-or-ip>
```

你可以使用 [100.x.y.z 地址][docs-ip-and-dns-addresses]或[机器名][docs-machine-names]调用 `tailscale ping`。

可用标志：

* `--c` 发送 ping 的最大次数。默认为 10。
* `--icmp`, `--icmp=false` 执行 ICMP 层面的 ping（经过 WireGuard，但不经过本地主机 OS 网络栈）。默认为 false。
* `--peerapi`, `--peerapi=false` 尝试访问对端的 PeerAPI HTTP 服务器。默认为 false。
* `--size=<size>` ping 消息的大小（仅默认 ping）。0 表示最小尺寸。
* `--tsmp`, `--tsmp=false` 执行 TSMP 层面的 ping（经过 WireGuard，但不经过任一主机的 OS 网络栈）。默认为 false。
* `--timeout=<duration>` 放弃 ping 前的最长等待时间。`duration` 可以是任何能被 [`time.ParseDuration()`][xt-go-time-parseduration] 解析的值。默认为 `5s`。
* `--until-direct`, `--until-direct=false` 一旦建立直连路径就停止。默认为 true。
* `--verbose`, `--verbose=false` 显示详细输出。默认为 false。

> **提示：**
>
> `tailscale ping` 命令支持[四种类型的 ping 消息][docs-ping-types]。

### serve

把内容和本地服务器从你的 Tailscale 节点发布到你的 tailnet。

要把本地服务公开分享到互联网，请使用 [`funnel`][ar-funnel] 命令。

```shell
tailscale serve <target>
tailscale serve <subcommand> [flags] <args>
```

子命令：

* [`status`][docs-tailscale-serve-get-the-status] 获取状态。
* [`reset`][docs-tailscale-serve-reset-tailscale-serve] 重置配置。

更多信息请参阅 [`tailscale serve`][docs-tailscale-serve] 主题。

### service

从本节点作为客户端的视角使用 [Tailscale Services][docs-tailscale-services]。

Tailscale Service 是拥有自己 IP 地址的虚拟服务。此命令只列出根据你 tailnet 的[访问策略][docs-acls]、此节点可以访问的服务。

```shell
tailscale service <subcommand>
```

可用子命令：

* `list` 列出此节点可以访问的 Tailscale Services。

`list` 子命令输出的表格包含以下列：

* `IP` 该 Tailscale Service 的 Tailscale IP 地址。
* `HOSTNAME` 该 Tailscale Service 的 [MagicDNS][docs-magicdns] 主机名。
* `DISPLAY NAME` 该 Tailscale Service 的人类可读名称（如果已设置）。
* `ENDPOINTS` 服务监听的端口。
* `TYPE` 服务的动作类型，例如 `http` 或 `ssh`。如果服务没有显式的动作类型，则会根据知名端口推断。

`list` 子命令输出类似下表的表格：

```shell
 IP                 HOSTNAME                           DISPLAY NAME     ENDPOINTS     TYPE
 100.97.38.19       my-k8s.<tailnet>.ts.net            -                tcp:80        kubernetes
 100.113.249.89     my-mysql.<tailnet>.ts.net          -                tcp:3306      mysql
 100.66.16.169      my-http.<tailnet>.ts.net           -                tcp:80        http
 100.121.49.147     my-postgresql.<tailnet>.ts.net     -                tcp:5432      postgresql
 100.70.193.69      my-rdp.<tailnet>.ts.net            -                tcp:3389      rdp
 100.97.223.101     my-ssh.<tailnet>.ts.net            -                tcp:22        ssh
 100.94.19.52       my-tcp.<tailnet>.ts.net            -                tcp:9000      tcp
 100.94.254.78      my-vnc.<tailnet>.ts.net            -                tcp:5900      vnc
```

`list` 的可用标志：

* `--json` 以 JSON 格式输出服务列表。

### set

修改指定的偏好设置。

与 [`tailscale up`][ar-up] 不同，此命令不要求提供完整的期望设置集合。它只更新你显式设置的项，没有默认值。注意，使用[快速用户切换][docs-fast-user-switching]时，所做的更改只针对当前连接的 tailnet。

要显示当前偏好值，请使用 [`get`][ar-get] 命令。

```shell
tailscale set [flags]
```

可用标志：

* `--accept-dns` 接受来自管理控制台的 [DNS 配置][docs-dns]。
* `--accept-risk=<risk>` 接受风险并跳过该风险类型的确认。取值可以是 `lose-ssh` 或 `all`，或用空字符串表示不接受风险。
* `--accept-routes`, `--accept-routes=false` 接受其他节点通告的[子网路由][docs-subnets]。默认行为取决于宿主操作系统。对于某些平台——Windows、iOS、Android、macOS App Store 变体和 macOS standalone 变体——默认接受路由。其他所有平台默认不接受路由。
* `--advertise-connector` 主动提出作为 tailnet 特定域互联网流量的[应用连接器][docs-app-connector]。
* `--advertise-exit-node`, `--advertise-exit-node=false` 主动提出作为 tailnet 互联网流量的出口节点。
* `--advertise-routes=<ip>` 把物理[子网路由][docs-subnets]暴露给你的整个 Tailscale 网络。这是一个逗号分隔的字符串，例如 "10.0.0.0/8,192.168.0.0/24"，或用空字符串表示不通告路由。
* `--auto-update`, `--auto-update=false` 启用或禁用客户端的[自动更新][docs-update-auto-updates]。
* `--exit-node=<ip|name>` 提供一个 [Tailscale IP][docs-ip-and-dns-addresses]或[机器名][docs-machine-names]作为出口节点。你也可以使用 `--exit-node=auto:any` 跟踪建议的出口节点，并在可用出口节点或网络状况变化时自动切换。要停用出口节点，请用 `--exit-node=` 传入空参数。
* `--exit-node-allow-lan-access`, `--exit-node-allow-lan-access=false` 允许客户端节点在连接出口节点的同时访问自己的 LAN。
* `--hostname=<name>`   用于设备的主机名，替代操作系统提供的主机名。注意这会改变 [MagicDNS][docs-magicdns] 中使用的机器名。
* `--netfilter-mode=<mode>` Netfilter 模式（`on`、`nodivert`、`off` 之一）。更多信息请参阅 [Tailscale netfilter 模式][docs-netfilter-modes]。
* `--nickname=<name>`   当前账户的[昵称][docs-fast-user-switching-set-nickname]。
* `--operator=<user>`   一个非 `root` 的 Unix 用户名，用于运行 `tailscaled`。
* `--relay-server-port=<port>` 指定接受对等中继连接的 UDP 端口。中继服务器在所有接口上绑定的 UDP 端口号（`0` 表示随机选择未用端口），或用空字符串禁用中继服务器功能。更多信息请参阅 [Tailscale 对等中继][docs-peer-relays]。
* `--relay-server-static-endpoints` 为 [Tailscale 对等中继][docs-peer-relays]使用静态端点。
* `--report-posture` 允许管理平面收集[设备态势][docs-device-posture]信息。
* `--shields-up`, `--shields-up=false` [阻断][docs-client-preferences]来自 Tailscale 网络中其他设备的入站连接。
  适用于只发出连接的个人设备。
* `--snat-subnet-routes` 对以 `--advertise-routes` 通告的本地路由进行源 NAT。
* `--ssh`, `--ssh=false` 运行 [Tailscale SSH][docs-tailscale-ssh] 服务器，按照 tailnet 管理员声明的[访问策略][docs-acls]（若未定义则按[默认策略][docs-acl-samples-all-default]）允许访问。
* `--stateful-filtering` 对转发的数据包（子网路由器、出口节点等）应用有状态过滤。
* `--update-check` 通知可用的 Tailscale 更新。
* `--webclient`, `--webclient=false` 在 `:5252.` 端口上于后台持续向你的 tailnet 暴露[网页界面][docs-device-web-interface]。

### ssh

建立到 Tailscale 机器的 [Tailscale SSH][docs-tailscale-ssh] 会话。

你通常可以直接使用普通 `ssh` 命令或其他 SSH 客户端建立到 Tailscale 机器的 SSH 会话。但是，当你的本地节点处于[用户态网络（userspace-networking）][docs-kernel-vs-userspace-routers-netstack]模式且无法建立直连时，请使用 `tailscale ssh`。它会设置一个 SSH `ProxyCommand`，通过本地 `tailscaled` 守护进程连接。本地节点处于[内核][docs-kernel-vs-userspace-routers-kernel]模式时也可以使用 `tailscale ssh`。

`tailscale ssh` 命令会自动把目标服务器的 SSH 主机密钥，与通过 Tailscale 协调服务器通告的 SSH 主机密钥进行核对。

```shell
tailscale ssh <args>
```

`<args>` 是以下形式之一：

* `host` 目标服务器。交互式会话会提示你输入会话使用的用户名。
* `user@host` 会话使用的用户名和目标服务器。

对于这两种形式，`host` 可以是目标服务器的 [MagicDNS][docs-magicdns] 名称（即使本地节点设置了 `--accept-dns=false`），也可以是目标服务器的 [Tailscale IP 地址][docs-ip-and-dns-addresses]。

> **注意：**
>
> 沙盒化的 macOS 构建中无法使用 `tailscale ssh`——请改用普通 `ssh` 客户端。

### status

获取你与其他 Tailscale 设备连接的状态。

```shell
tailscale status
```

此命令以人类可读格式返回一个精简的信息表：

```
1           2         3           4         5
100.1.2.3   device-a  apenwarr@   linux     active; direct <ip-port>, tx 1116 rx 1124
100.4.5.6   device-b  crawshaw@   macOS     active; relay <relay-server>, tx 1351 rx 4262
100.7.8.9   device-c  danderson@  windows   idle; tx 1214 rx 50
100.0.1.2   device-d  ross@       iOS       -
```

从左到右，各列分别代表：

* 第 1 列是 [**Tailscale IP**][docs-100.x-addresses]，你可以用它连接设备。
* 第 2 列是设备的[**机器名**][docs-machine-names]。如果你启用了 [MagicDNS][docs-magicdns]，也可以用这个名称连接。
* 第 3 列是设备所有者的**电子邮件地址**。
* 第 4 列是**设备操作系统**。
* 第 5 列显示当前的**连接状态**。

连接状态（第 5 列）用三种词表示：

* `active` 表示当前正与该设备收发流量。其中还包含连接类型，可以是 `direct`、`relay` 或 `peer-relay`。
  * 如果连接是 `direct`，其中会包含对端设备的 IP 地址。
  * 如果连接是 `relay`，其中会包含相应位置 [DERP 服务器][docs-derp-servers]的城市代码（`nyc`、`fra`、`tok`、`syd`）。
  * 如果连接是 [`peer-relay`][docs-peer-relays]，其中会包含对等中继的 Tailscale IP 地址和所使用的 VNI（虚拟网络接口）。
* `idle` 表示当前没有与该设备收发流量。
* `-` 表示从未与该设备收发过流量。

`active` 和 `idle` 状态还会附带 `tx`/`rx` 值，表示与该设备发送（`tx`）和接收（`rx`）的字节数。

带 `--json` 标志运行 `tailscale status` 会返回机器可读的 JSON 响应。

```shell
tailscale status --json
```

与 `tailscale status` 不同，使用该标志会给出 tailnet 中对端和用户的详细列表，因此非常适合自动化任务。它还包含与你的设备关联的其他元数据。

配合 [`jq`][xt-githubio-stedolan-jq] 可以自动化收集网络数据。例如，以下命令统计并排序你的 Tailscale 对端所连接的中继服务器。

```shell
tailscale status --json | jq -r '.Peer[].Relay | select(.!="")' | sort | uniq -c | sort -nr
```

可用标志：

* `--active` 把输出筛选为仅有活跃会话的对端（不适用于 web 模式）。
* `--browser` 以 web 模式打开浏览器（默认 `true`）。
* `--header` 以表格形式显示列标题（默认 `false`）。
* `--json` 以 JSON 格式输出（警告：格式可能变化）。
* `--listen=<address>` web 模式的监听地址；端口用 0 表示自动（默认 `127.0.0.1:8384`）。
* `--peers` 显示对端状态（默认 `true`）。
* `--self` 显示本机状态（默认 `true`）。
* `--web` 运行以 HTML 展示状态的 web 服务器。

### switch

切换到另一个 Tailscale 账户。关于切换账户的更多信息，请参阅[快速用户切换][docs-fast-user-switching]。

```shell
tailscale switch <account> [flags]
```

示例：

* 切换到 `alice@example.com` 账户：

  ```shell
  tailscale switch alice@example.com
  ```

* 切换到[昵称][docs-fast-user-switching-set-nickname]为 "work" 的账户：

  ```shell
  tailscale switch work
  ```

可用标志：

* `--list` 列出可用账户。

  * `--json` 以 JSON 格式列出可用账户。

  ```shell
  tailscale switch --list --json
  ```

子命令：

* `remove <id>` 从本地机器上移除一个 Tailscale 账户。这不会删除账户本身，只是无法再切换到它。重新登录即可把它加回来。此命令目前处于 alpha 阶段，未来可能变化。

### syspolicy

列出系统策略、重新加载系统策略，或检查与 tailnet 中配置的[系统策略][docs-mdm-keys]相关的错误。

```shell
tailscale syspolicy
```

子命令：

* `list` 显示系统策略、重新加载系统策略，或查看与设备上配置的[系统策略][docs-mdm-keys]相关的错误。
* `reload` 强制 Tailscale 客户端重新加载并重新应用设备上的系统策略设置。

可用标志：

* `--json` 返回机器可读的 JSON 响应。

### systray

> **注意：**
>
> `systray` 命令在 Linux 客户端上可用，目前处于 [beta][docs-release-stages-beta] 阶段，且需要 Tailscale v1.88 或更高版本。

为 Linux 桌面客户端运行[系统托盘（`systray`）应用][docs-linux-systray]，以使用快速用户切换、出口节点选择等常用操作。

```shell
tailscale systray
```

> **警告：**
>
> 不要以超级用户身份运行 `tailscale systray`（即 `sudo tailscale systray`），因为 systray 并非为超级用户运行而设计，命令会失败。

可用标志：

* `--theme=<color-option>` Tailscale 图标的配色主题：`dark`、`dark:nobg`、`light`、`light:nobg`。

### update

> **注意：**
>
> `update` 命令在 Windows 和 Ubuntu/Debian Linux 上自 Tailscale v1.36 起可用，在 Mac Apple Store 版本和 Synology 上自 v1.48.0 起可用，在 QNAP 和 [macOS 应用的 Standalone 变体][docs-macos-standalone]上自 v1.54.0 起可用。如果你使用的是上述操作系统但没有此命令，请考虑[更新你的 Tailscale 客户端][docs-update]。

把 Tailscale 客户端版本更新到最新版本，或更新/降级到其他版本。

```shell
tailscale update [flags]
```

可用标志：

* `--dry-run` 显示 update 会执行的操作，但不实际执行更新，也不提示开始更新。
* `--track` 检查更新所用的通道（track），可以是 "stable"、"release-candidate" 或 unstable。未指定时，update 使用客户端当前生效的通道。更多信息请参阅 [Tailscale 客户端版本与发布通道][docs-release-tracks]。
* `--version` 用于更新或降级的明确版本号。`--track` 与 `--version` 不能同时指定。此标志在 macOS 客户端上不可用。
* `--yes` 执行更新时不进行交互式提示。默认为 false。

如果你降级到没有 `tailscale update` 功能的版本，将无法再运行 `tailscale update` 回到之前的版本，你需要[不通过 Tailscale CLI][docs-update]执行更新。

要确定客户端的当前版本，请运行 [`tailscale version`][ar-version]。

示例：

更新到当前通道（stable 或 unstable，取决于你正在运行的通道）内的最新版本：

```shell
tailscale update
```

更新到当前通道内的最新版本，且不使用交互式提示：

```shell
tailscale update --yes
```

更新到 Tailscale v1.34：

```shell
tailscale update --version=1.34.0
```

更新到最新的 unstable 版本：

```shell
tailscale update --track=unstable
```

### version

输出 Tailscale 的版本。

```shell
tailscale version [flags]
```

可用标志：

* `--daemon` 同时输出本地节点守护进程的版本。默认为 false。
* `--json` 返回机器可读的 JSON 响应。
* `--upstream` 输出 `pkgs.tailscale.com` 上的最新上游发布版本。默认为 false。
* `--track`, `--track=[stable|unstable|release-candidate]` 检查指定通道的更新。留空表示当前通道。更多信息请参阅 [Tailscale 客户端版本与发布通道][docs-release-tracks]。

> **提示：**
>
> 运行 `tailscale version` 还会输出其他信息，包括 Go 版本。输出示例如下：
>
> ```shell
> tailscale version
> 1.72.0
>   tailscale commit: 9a0f00ea8ed08d1a94b357fb232ac9d44a512664
>   other commit: 387e0b40ad87031fb4444372ee80a97156e8deb9
>   go version: go1.22.5
> ```

### wait

等待 Tailscale 资源在指定超时时间内（或无限期地）变为可用并可绑定。

命令成功时返回退出码 `0`。失败或超时时返回非零退出码。

> **注意：**
>
> 自 Tailscale 1.96 起，唯一可等待的资源是 Tailscale 接口及其 IP。未来版本可能会支持等待其他类型的资源。
>
> 在用户态网络模式下运行时，此命令只等待 `tailscaled` 和 `Running` 状态，因为不存在物理网络接口。

```shell
tailscale wait [flags]
```

可用标志：

* `--timeout=<duration>` 以秒为单位设置超时时长。设为 `0` 表示无限期超时。

示例：

要等待特定类型的 IP 地址，可以将 `tailscale ip` 与 `tailscale wait` 命令结合使用。例如，等待一个 IPv4 地址：

```shell
tailscale wait && tailscale ip --assert=<specific-ip-address>
```

Linux 的 `systemd` 用户可以等待 `tailscale-online.target` 目标，它会运行此命令。

想要绑定（监听）Tailscale 接口或 IP 地址的服务，可以使用以下模式来确保程序启动前 Tailscale 已就绪：

```shell
tailscale wait && /path/to/service [...]
```

### web

启动一个用于控制 `tailscaled` 守护进程的 web 服务器。当 CLI 或原生应用不便使用时（例如在 NAS 设备上），启动 web 服务器很有用。

```shell
tailscale web [flags]
```

可用标志：

* `--cgi=<true|false>` 以 CGI 脚本方式运行 web 服务器。默认为 false。
* `--listen=<ip|name>` 设置监听地址。端口用 `0` 表示自动。默认为 `localhost:8088`。
* `--origin=<hostname>` 提供 web UI 的源（origin）（当处于反向代理之后或与 CGI 一起使用时）。
* `--prefix=<string>` 设置添加到请求的 URL 前缀（用于 CGI 或反向代理）。
* `--readonly` 以只读模式运行 web 服务器。

### whoami

获取当前机器的机器与用户身份。

这等同于对当前机器自己的某个 Tailscale IP 地址运行 `tailscale whois`。

```shell
tailscale whoami [--json]
```

可用标志：

* `--json` 以 JSON 格式输出。

### whois

获取与某个 Tailscale IP 关联的机器和用户。

```shell
tailscale whois ip[:port]
```

对于用户设备，此命令返回：

```
Machine:
  Name:
  ID:
  Addresses:
  AllowedIPs:
User:
  Name:
  ID:
Capabilities:
```

对于带标签的设备，此命令返回：

```
Machine:
  Name:
  ID:
  Addresses:
  AllowedIPs:
  Tags:
Capabilities:
```

各字段含义：

* `Machine`、`Name` 是设备的[机器名][docs-machine-names]。如果你启用了 [MagicDNS][docs-magicdns]，也可以用这个名称连接。
* `Machine`、`ID` 是设备的[节点 ID][docs-terminology-and-concepts-node]。
* `Machine`、`Addresses` 是 [Tailscale IP][docs-100.x-addresses]，你可以用它连接设备。
* `Machine`、`AllowedIPs` 是该设备可用的子网路由。
* `Machine`、`Tags` 是设备所属的标签。
* `User`、`Name` 是设备所有者的电子邮件地址。
* `User`、`ID` 是该用户的唯一 ID。
* `Capabilities` 显示该设备的授权（grants）。

带 `--json` 标志运行 `tailscale whois` 会返回机器可读的 JSON 响应。（注意 `--json` 选项必须位于 `ip[:port]` 参数之前。）

```shell
tailscale whois --json ip[:port]
```

可用标志：

* `--json` 以 JSON 格式输出。
* `--proto=<proto>` WhoIs 请求使用的协议；`tcp` 或 `udp` 之一；留空表示两者。

### appc-routes

输出当前[应用连接器][docs-app-connector]的路由状态。

默认情况下，此命令输出应用连接器配置中配置的域名，以及为每个域名学习到的路由数量。

```shell
tailscale appc-routes [flags]
```

可用标志：

* `--all` 输出学习到的域名和路由，以及额外策略配置的路由。
* `--map` 输出已学习域名的映射。
* `--n` 输出此节点通告的路由总数。

[ar-completion]: #completion

[ar-funnel]: #funnel

[ar-get]: #get

[ar-serve]: #serve

[ar-set]: #set

[ar-up]: #up

[ar-version]: #version

[bl-opensource-coordination-server]: https://tailscale.com/blog/opensource#the-open-source-coordination-server

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-acl-samples-all-default]: /docs/reference/examples/acls#allow-all-default-acl

[docs-acls]: /docs/features/access-control/acls

[docs-app-connector]: /docs/features/app-connectors

[docs-apple-sysext]: /docs/concepts/macos-sysext

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-auto-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-client-metrics]: /docs/reference/tailscale-client-metrics

[docs-client-preferences]: /docs/features/client/manage-preferences

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-posture]: /docs/features/device-posture

[docs-device-web-interface]: /docs/features/client/device-web-interface

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-fast-user-switching]: /docs/features/client/fast-user-switching

[docs-fast-user-switching-set-nickname]: /docs/features/client/fast-user-switching#setting-a-nickname

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-kernel-vs-userspace-routers-kernel]: /docs/reference/kernel-vs-userspace-routers#kernel-mode

[docs-kernel-vs-userspace-routers-netstack]: /docs/reference/kernel-vs-userspace-routers#userspace-netstack-mode

[docs-linux-systray]: /docs/features/client/linux-systray

[docs-machine-names]: /docs/concepts/machine-names

[docs-macos-mac-app-store]: /docs/concepts/macos-variants#mac-app-store-variant

[docs-macos-standalone]: /docs/concepts/macos-variants#standalone-variant

[docs-magicdns]: /docs/features/magicdns

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-netfilter-modes]: /docs/reference/netfilter-modes

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-peer-relays]: /docs/features/peer-relay

[docs-ping-types]: /docs/reference/ping-types

[docs-policy-syntax-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-release-stages-beta]: /docs/reference/tailscale-release-stages#beta

[docs-release-tracks]: /docs/reference/tailscale-client-versions#client-release-tracks

[docs-run-unattended]: /docs/how-to/run-unattended

[docs-secure-auth-key-cli]: /docs/features/access-control/auth-keys/how-to/secure-auth-keys

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrive]: /docs/features/taildrive

[docs-taildrop]: /docs/features/taildrop

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel

[docs-tailscale-funnel-get-the-status]: /docs/reference/tailscale-cli/funnel#get-the-status

[docs-tailscale-funnel-reset-tailscale-funnel]: /docs/reference/tailscale-cli/funnel#reset-tailscale-funnel

[docs-tailscale-lock]: /docs/reference/tailscale-cli/lock

[docs-tailscale-lock-lock-add]: /docs/reference/tailscale-cli/lock#lock-add

[docs-tailscale-lock-lock-init]: /docs/reference/tailscale-cli/lock#lock-init

[docs-tailscale-lock-lock-remove]: /docs/reference/tailscale-cli/lock#lock-remove

[docs-tailscale-lock-lock-sign]: /docs/reference/tailscale-cli/lock#lock-sign

[docs-tailscale-lock-lock-status]: /docs/reference/tailscale-cli/lock#lock-status

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[docs-tailscale-serve-get-the-status]: /docs/reference/tailscale-cli/serve#get-the-status

[docs-tailscale-serve-reset-tailscale-serve]: /docs/reference/tailscale-cli/serve#reset-tailscale-serve

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[docs-tailscaled]: /docs/reference/tailscaled

[docs-terminology-and-concepts-node]: /docs/reference/glossary#node

[docs-update]: /docs/features/client/update

[docs-update-auto-updates]: /docs/features/client/update#auto-updates

[docs-workload-identity]: /docs/features/workload-identity-federation

[xt-gh-tailscale-caddy-tailscale]: https://github.com/tailscale/caddy-tailscale

[xt-githubio-stedolan-jq]: https://stedolan.github.io/jq

[xt-go-time-parseduration]: https://pkg.go.dev/time#ParseDuration

[xt-lets-encrypt-cert-lifetime]: https://letsencrypt.org/docs/faq#what-is-the-lifetime-for-let-s-encrypt-certificates-for-how-long-are-they-valid
