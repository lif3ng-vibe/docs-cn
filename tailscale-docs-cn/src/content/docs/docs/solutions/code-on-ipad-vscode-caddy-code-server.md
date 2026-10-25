---
title: "在 iPad 上使用 Visual Studio Code、Caddy 和 code-server 写代码"
description: "通过安全私密的连接访问你自己的远程编码环境，随时随地用 iPad 写代码。"
---

最后验证于 Oct 16, 2025

[Visual Studio Code][xt-vs-code]（VS Code）已迅速成为许多人日常工作的文本编辑器。它的跨平台兼容性、速度和庞大的扩展库使其广受欢迎。

Coder.com 的 [code-server][xt-gh-code-server] 让你可以在服务器上运行 VS Code，并在任何设备上访问它，包括 iPad。然而，[将 code-server 直接暴露在公共互联网上并不安全][xt-gh-code-server-expose]，这通常意味着要在它前面安装一个面向公网的 SSH 代理，或类似 nginx 的 HTTP 反向代理。Tailscale 免去了所有这些麻烦，无论你身在何处，都能获得快速、私密的连接。

在本指南中，你将搭建 code-server，并使用 Tailscale 从 iPad 安全地连接到它。完成后，你将拥有一个随时随地都能访问的安全开发环境。

## 前提条件

要完成本指南，你需要：

* 一个 Tailscale 账户。如果还没有，请[创建免费的 Personal 账户](https://login.tailscale.com/start)。
* 一台托管 code-server 的服务器。本指南假设你使用 Ubuntu 24.04 服务器，并且拥有安装和运行服务所需的 `sudo` 权限。你也可以在其他平台上安装 code-server。
* 服务器上已安装并运行 Tailscale 客户端，以便你可以安全地连接到它。如果你使用 Ubuntu，请按照[在 Linux 上安装 Tailscale][docs-install-linux]的说明操作，或手动[下载并安装 Tailscale][co-download]。
* 一台安装并运行了 Tailscale 的 iPad，用于通过网页浏览器访问你的 VS Code 服务器。在你的设备上[下载并安装 Tailscale][co-download]。你也可以使用 Android 平板或笔记本电脑，只要它们在运行 Tailscale 即可。
* 你的 tailnet 已启用 [MagicDNS][docs-magicdns]，这样你就可以使用服务器的 MagicDNS 主机名并使用 HTTPS 证书。

## 第 1 步：验证你的 Tailscale 设置

在搭建 code-server 之前，先确认你能连接到 tailnet 中的服务器。首先要获取[你机器的 Tailscale IP 地址][docs-ip-and-dns-addresses]。

如果你已经登录到服务器，可以用以下命令找到 Tailscale IP 地址：

```shell
tailscale ip --4
```

复制这个 100.x.y.z 地址。找到之后，输入 `exit` 结束当前会话。

现在使用你的 Tailscale IP 地址开启一个新会话：

```shell
ssh <username>@<copied 100.x.y.z address>
```

成功连接后，你就可以搭建 code-server 了。

## 第 2 步：安装并加固 code-server

要在 Tailscale 上使用 code-server，你需要先将其安装到服务器上，然后修改它的设置，使其只对 tailnet 中的设备可用。

你可以通过脚本安装 code-server，或从其 [GitHub releases 页面][xt-gh-code-server-releases]下载预编译的二进制文件。本指南使用脚本方式。

在服务器上，运行以下单行命令安装 code-server：

```shell
curl -fsSL https://code-server.dev/install.sh | sh
```

安装程序会运行，最后输出以下内容表示安装完成：

```
To have systemd start code-server now and restart on boot:
  sudo systemctl enable --now code-server@$USER
Or, if you don't want/need a background service you can run:
  code-server

Deploy code-server for your team with Coder: https://github.com/coder/coder
```

运行以下命令，配置 code-server 随系统启动：

```shell
sudo systemctl enable --now code-server@$USER
```

命令执行完毕后会显示以下消息：

```
Created symlink /etc/systemd/system/default.target.wants/code-server@your-user.service → /usr/lib/systemd/system/code-server@.service.
```

此时 code-server 已在你本机的 `8080` 端口上运行。

默认情况下，code-server 只接受来自本机（`127.0.0.1`）的连接，并使用密码限制访问。由于你只会通过 Tailscale 访问 code-server，而 Tailscale 本身已经在使用你现有的单点登录（SSO）身份提供方，因此无需基于密码的认证。只要你能访问服务器，就足以证明你已获得授权。为此，你需要更新 code-server 的配置，更改其认证方式及其使用的 IP 地址。

使用 `nano` 或其他文本编辑器打开位于 `~/.config/code-server/config.yaml` 的 code-server 配置文件：

```shell
nano ~/.config/code-server/config.yaml
```

配置文件如下例所示，`bind-addr` 设置为本机并启用密码认证：

```yaml
bind-addr: 127.0.0.1:8080
auth: password
password: <random-password>
cert: false
```

将 `auth` 字段改为 `none`，删除 `password` 字段，并将 `bind-addr` 字段改为你的 Tailscale IP 地址，使该服务只在你的 Tailscale IP 上可用：

```yaml
bind-addr: <100.x.y.z address>:8080
auth: none
cert: false
```

保存文件并退出编辑器。

重启 code-server 以应用更改：

```shell
sudo systemctl restart code-server@$USER
```

现在该服务已在监听，但只监听 Tailscale IP 地址。

在你的 iPad 上，确保已连接到 tailnet，并且你的服务器出现在 Tailscale 应用的设备列表中。

打开浏览器，访问 `http://100.x.y.z:8080/`（使用你自己的 IP 地址）来访问你的服务器。

*（图：在你的 tailnet 中运行的 code-server 界面。）*

现在你已经有一个可用的环境，但在启用 HTTPS 支持之前，还无法使用它的全部功能。

## 第 3 步：配合 Caddy 使用 HTTPS

code-server 的基本功能在纯 HTTP 下就能正常工作。只要你通过加密且经过认证的 Tailscale 链路连接，连接就是安全的。然而，某些功能（例如使用系统剪贴板）将不可用，因为网页浏览器要求 HTTPS 才能使用它们。要让 code-server 功能完整，你需要配置带证书的 HTTPS 连接。

Caddy 能自动识别并为你的 Tailscale 网络（`*.ts.net`）使用证书，可以直接使用 Tailscale 的 HTTPS 证书。

首先，[确保你已为 tailnet 启用 HTTPS 证书][docs-enabling-https]。

然后，在你的服务器上申请一张 Let's Encrypt 证书。为此，你需要你的机器名和 [tailnet 名称][docs-tailnet-name]。你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面找到你的 tailnet DNS 名称。你也可以不带参数运行 `tailscale cert` 命令，它会告诉你应使用的域名：

```shell
tailscale cert
```

用法消息会给出你所需的细节：

```
Usage: tailscale cert [flags] <domain>
For domain, use "machine-name.tailnet-name.ts.net".
```

使用 `sudo` 运行 `tailscale cert` 并提供域名：

```shell
sudo tailscale cert machine-name.tailnet-name.ts.net
```

命令会显示以下输出，表明它已创建证书文件：

```
Wrote public cert to machine-name.tailnet-name.ts.net.crt
Wrote private key to machine-name.tailnet-name.ts.net.key
```

接着，在运行 code-server 的服务器上安装 Caddy。在 Ubuntu 上，使用以下命令安装 Caddy：

```shell
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

这会安装 Caddy 的依赖项，将 Caddy 的官方软件包仓库添加到你的包管理器源中，并将 Caddy 安装为服务。

现在配置 Caddy 使用你的 Tailscale 域名。使用文本编辑器编辑 `/etc/caddy/Caddyfile`：

```shell
sudo nano /etc/caddy/Caddyfile
```

将文件内容替换为以下内容（使用你自己的域名和 Tailscale IP 地址）：

```
machine-name.tailnet-name.ts.net {
  reverse_proxy 100.x.y.z:8080
}
```

这定义了一个反向代理，把请求转发到你的 code-server 实例。

保存文件并退出编辑器。

在 Ubuntu 上使用官方脚本安装的 Caddy 以 `caddy` 用户身份运行 Caddy 服务器。要让 Tailscale 与 Caddy 协作，你必须告诉 `tailscaled` 允许 `caddy` 用户获取证书。

用文本编辑器打开 `/etc/default/tailscaled` 文件：

```shell
sudo nano /etc/default/tailscaled
```

在文件中添加以下一行，允许 `caddy` 用户获取证书：

```
TS_PERMIT_CERT_UID=caddy
```

查阅 [tailscaled][docs-tailscaled] 文档了解其配置选项的更多信息。

保存文件。现在重启 `tailscaled` 服务以应用更改：

```shell
sudo systemctl reload tailscaled
```

重新加载 Caddy 以应用你所做的配置更改：

```shell
sudo systemctl reload caddy
```

在 iPad 上访问 `https://machine-name.domain-alias.ts.net` 以连接 code-server。这一次，所有需要有效 HTTP 证书的功能都能正常工作。

## 结语

现在你可以从任何地方访问你的 VS Code 实例。你可以在家附近的咖啡馆写代码，也可以在世界另一端写代码。而且它只能通过 Tailscale 访问。

由于你要在这台设备上进行开发，它将接触私有代码或私有数据等敏感信息。为了更加安全，你可以考虑将服务器的所有访问都限制为仅通过 Tailscale 进行。

有关如何进一步加固服务器的更多信息，请[阅读我们关于 Ubuntu 和 ufw 的指南][docs-secure-server-ubuntu]。

[co-download]: https://tailscale.com/download

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-install-linux]: /docs/install/linux

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-magicdns]: /docs/features/magicdns

[docs-secure-server-ubuntu]: /docs/how-to/secure-ubuntu-server-with-ufw

[docs-tailnet-name]: /docs/concepts/tailnet-name

[docs-tailscaled]: /docs/reference/tailscaled

[xt-gh-code-server-expose]: https://github.com/coder/code-server/blob/main/docs/guide.md#expose-code-server

[xt-gh-code-server-releases]: https://github.com/coder/code-server/releases

[xt-gh-code-server]: https://github.com/coder/code-server

[xt-vs-code]: https://code.visualstudio.com
