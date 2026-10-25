---
title: "使用 Tailscale 保护你的 SSH 服务器"
description: "了解 Tailscale 如何与 SSH 客户端和 SSH 服务器良好配合，提升安全性并带来更好的使用体验。"
---

最后验证于 Jan 12, 2026

## 什么是 Secure Shell（SSH）？

安全外壳协议（Secure Shell，简称 SSH）问世至今已超过 25 年。它被设计用于安全地连接服务器，进行远程访问、直接执行命令或传输文件（使用 `scp` 或 `sftp` 应用）。SSH 取代了 `telnet`、`rlogin`、`rcp`、`rsh` 和 `ftp` 这些曾用于完成类似任务的协议。这些协议如今已很少使用，尽管其中一些后来陆续加入了加密扩展。如今，几乎所有操作系统都有多种开源 SSH 客户端可用。

如今众所周知，在公共互联网或开放 Wi-Fi 网络上不加保护地传输数据是危险的：传输内容可能被拦截或篡改。SSH 协议通过加密建立安全的远程访问连接，是解决这个问题的一个实用工具，但也存在一些需要注意的地方。

### 为什么要使用 SSH？

如果你需要远程访问服务器或传输文件，SSH 会对你通过公共网络发送的内容进行加密。它基于经过严格考验的协议，同时非常易用且可配置。

### SSH 能做什么？

SSH 客户端是一种本地应用，用于连接远程计算机，通常用于安全登录和安全文件传输。这一功能由安全外壳协议提供，它是一种加密网络协议。

SSH 还内置了类似 VPN 的能力：SSH 支持端口转发（客户端可以请求远程 SSH 服务器转发一条出站连接）、反向端口转发（客户端可以请求远程 SSH 服务器转发一条入站连接）、动态端口转发（客户端使用 SOCKS 协议按需创建端口转发连接）以及隧道设备转发（客户端与服务器可以互相中继数据包，配合额外配置可以充当 VPN）。

SSH 还有一些较少使用的功能，出于安全考虑有时会被禁用：转发 X11 连接（在客户端机器上显示远程图形应用）以及转发自身的认证代理（允许使用客户端机器上保存的凭证连接其他 SSH 服务器）。

所有 SSH 功能都可以同时使用，从而能通过一条连接使用多个会话。如果需要新会话（且 SSH 客户端支持该特性），它可以直接附着到现有连接上而无需重新认证，非常方便。

## 如何安全地使用 SSH 客户端？

要安全地使用 SSH，用户首先需要核实目标服务器的主机密钥（host key）。如果不检查主机密钥，就无法证明用户连接的确实是预期的服务器。随后 SSH 服务器需要验证用户的密码或认证密钥。如果 SSH 服务器只接受来自私有网络的连接（或因为服务器位于 NAT 路由器后面，或为了提高安全性），用户还需要通过另一台同时连接公共互联网和私有网络的服务器来中转，这类服务器通常被称为 SSH 堡垒机（bastion），有时也叫 SSH 跳板机（jump host）或 SSH jump box。

单靠自身，要遵循 SSH 最佳实践并不容易：主机密钥常常无人核查，用户密钥和密码很少轮换，而通过 SSH 堡垒机连接又可能很不方便。Tailscale 可以缓解前两个问题，并彻底免去最后一个问题。

## 如何安全地运行 SSH 服务器？

虽然你可以允许来自公共互联网的 SSH 连接，但任何公开的 SSH 服务器都会遭受自动化攻击乃至针对性攻击。自动化的登录尝试往往在几分钟内就开始：大量被攻陷的服务器在持续扫描公共互联网，寻找用户名和密码过于简单的 SSH 服务器。最大的风险来自弱密码，这也是现代最佳实践主张完全禁用密码的原因。

还有一个较小的风险：SSH 服务器软件中的漏洞。旧版本 SSH 服务器软件中的已知漏洞可能允许未经授权的访问，而最新的软件也始终存在发现新漏洞的风险。管理员必须确保服务器保持更新。

认证密钥是比密码更强的替代方案，但 SSH 从不强制用户轮换密钥。[实际上，几乎没人这么做][bl-rotate-ssh-keys]。更糟的是，SSH 认证私钥通常以普通文件的形式存储，意味着别人可以把它复制走。这让许多 SSH 服务器处于风险之中，因为随着服务器上长期不轮换（甚至从不轮换）的认证密钥不断累积，认证密钥被盗的可能性会随时间增加。

存储在硬件令牌上的认证密钥（如 Yubikey 销售的产品、Touch ID、智能卡及其他 FIDO2 令牌）无法被复制，这显著降低了认证密钥被盗的风险：令牌必须被物理拿走（纯远程攻击因此变得困难甚至不可能）。硬件令牌在可用的前提下是极佳的选择，但为所有员工配备的成本不低，而且发放令牌会带来额外的管理负担：每个令牌都会生成自己的认证密钥，而且令牌本身也可能被放错、遗失或被盗。这类令牌的价格随时间不断下降，但遗憾的是仍未普及。

一些 SSH 服务器可以使用来自可信私有证书颁发机构的证书来认证会话。证书把普通认证密钥与证书颁发机构的签名及过期时间结合在一起。与普通认证密钥的主要区别在于：服务器只需存储证书颁发机构的公钥，只要证书由该机构签发，就信任用户的认证密钥是可信的。这解决了密钥轮换最大的可用性问题：不再需要更新服务器。由于证书会过期，自动强制轮换密钥也带来了额外的安全性。证书颁发机构还可以为 SSH 主机密钥签名，只要 SSH 客户端信任该证书颁发机构，就解决了用户连接时核实主机密钥的问题。

搭建用于签发、吊销和管理证书的证书颁发机构基础设施相当复杂，而且证书颁发机构的私钥必须得到极严密的保护。如今，SSH 证书在大型企业之外并不常用。

SSH 堡垒机（有时也叫 SSH 跳板机或 SSH jump box）被一些组织或用户用作进入受保护内部网络的网关。用户必须先连接堡垒机，然后才能访问受保护的服务器。堡垒机通常配备额外的监控以检测入侵。遗憾的是，堡垒机往往不便使用、延迟较高，而且不借助额外的管理手段就无法从根本上解决密钥轮换问题。

## 将 SSH 与 Tailscale 配合使用的优势

Tailscale 与 SSH 客户端和 SSH 服务器配合良好，既能提升安全性，又能带来更好的使用体验。

### Tailscale 取代 SSH 堡垒机，降低延迟并避免瓶颈

如果你的业务遍布全球，流量可能要经过很长距离才能穿过堡垒机到达 SSH 服务器，带来显著的延迟，有时还会限制吞吐量。或者，你可以部署多台堡垒机，但这又会增加复杂度。

Tailscale 让堡垒机彻底变得不再必要：SSH 服务器驻留在一个具备点对点连接和端到端加密的私有网状网络中。这样不仅 SSH 更安全，通常也比使用堡垒机更快。

### 私有网络的自动密钥轮换

Tailscale 虽然不管理你的 SSH 认证密钥，但它管理着访问 SSH 服务器所需私有网络的准入。Tailscale 客户端会按照可配置的时间间隔[轮换自己的密钥][bl-tailscale-key-management]。

如果客户端设备丢失或被盗，可以在管理控制台中立即删除该设备。即使没有从管理控制台删除，当设备的密钥过期后，它也无法再访问 Tailscale 网络。无论哪种情况，设备都会失去访问权限，直到获得授权的用户成功重新登录 Tailscale 客户端。如果你的 SSO 配置中启用了多因素认证，登录时还需通过多因素认证，从而提供额外保障。

### 验证连接与用户

通常，首次连接 SSH 服务器时，你会看到 SSH 主机密钥，并需要核实该密钥是否正确（大多数 SSH 客户端会在首次连接后保存主机密钥）。如果密钥不正确，则说明你的连接被其他服务器拦截了。

Tailscale 的服务器会向所有 Tailscale 客户端分发公钥信息，并确保：如果你成功连接到一个 Tailscale IP 地址，你连接的就是正确的设备，而不是冒名者。因此，尽管核实 SSH 主机密钥依然是最佳实践，但你可以确信连接没有被拦截。

Tailscale 还能帮助 SSH 服务器核实连接者的身份。当 Tailscale IP 地址出现在服务器日志中时，管理员事后可以查到该 IP 地址属于哪个用户。为了最大程度的安全，还可以配置 SSH 服务器，限制某个用户名只能从哪些 IP 地址连接。由于用户设备的 Tailscale IP 地址保持固定（除非该设备从 Tailscale 网络中删除），这可以作为用户身份的额外证明。

### 只有经授权的用户才能连接 SSH 服务器

通常使用 SSH 时，公共或私有网络上的任何人都可以尝试连接 SSH 服务器。而通过 Tailscale 使用 SSH 时，只有属于你的网络、且被网络访问控制策略授权的人才能够连接 SSH 服务器。通过[将 SSH 访问从公共互联网上移除][docs-secure-server-ubuntu]，自动化扫描攻击（或随意尝试连接你 SSH 服务器的用户）带来的风险就被彻底消除了，因为他们根本没有可连接的目标。

[Tailscale 访问控制策略][docs-access-control]确保只有经授权的用户才能连接 SSH 服务器。明确声明哪些用户可以访问 SSH 服务器后，被盗认证密钥或弱密码导致失陷的难度会显著提高（但这并不能替代对认证密钥和密码的管理）。

### 在网络之间平滑切换

Tailscale 客户端能够检测网络变化，并可以在不影响使用 Tailscale 网络的应用的情况下，切换用于连接其他 Tailscale 客户端的网络连接。换句话说，如果你在以太网与 Wi-Fi 之间、不同 Wi-Fi 网络之间、或 Wi-Fi 与蜂窝网络之间切换，只要你的 SSH 客户端是通过 Tailscale 连接的，它可能会短暂停顿，但仍会保持连接（前提是网络切换足够快）。

## Tailscale SSH

[Tailscale SSH][docs-tailscale-ssh] 让 Tailscale 来管理你 tailnet 中 SSH 连接的认证与授权。

使用 Tailscale SSH，你可以：

* **照常使用 SSH**，由 Tailscale 负责认证。启用 Tailscale SSH 后，Tailscale 会接管来自 Tailscale 网络的 SSH 连接所用的 22 端口。Tailscale 会使用 Tailscale 节点密钥通过 WireGuard 对连接进行认证和加密。SSH 客户端与服务器之间仍会建立加密的 SSH 连接，但不会再做进一步的认证。
* **通过[检查模式（check mode）][docs-tailscale-ssh-check-mode]验证高风险连接**。可以选择要求某些连接、或以某些用户（例如 `root`）身份发起的连接，在连接前重新认证。这样，用户可以在接下来的 12 小时内（或指定的检查期限内）访问这些高风险应用，之后需再次认证。

如果你想让 Tailscale SSH 满足你的 SSH 需求，请按照[配置 Tailscale SSH][docs-tailscale-ssh-configure-tailscale-ssh]中的说明操作。否则，请继续阅读下一节。

## 开始通过 Tailscale 使用 SSH

这些步骤是 [Tailscale SSH][docs-tailscale-ssh] 之外的另一种方式。

开始步骤如下：

### 第 1 步：在 SSH 服务器上安装并激活 Tailscale

Tailscale 几乎支持所有现代 Linux 发行版，只是安装说明可能略有差异。

[下载适用于 Linux 的 Tailscale](https://tailscale.com/download/linux)

> **注意：**
>
> 如果需要更精细的[访问控制][docs-access-control]，可以考虑使用 [ACL][docs-acls] 或[授权][docs-grants]。如有需要，还可以为 SSH 服务器配置[标签（tag）][docs-tags]。

### 第 2 步：在客户端机器上安装并激活 Tailscale

[下载 Tailscale](https://tailscale.com/download)

### 第 3 步：使用 Tailscale 连接 SSH 服务器

在 SSH 服务器上，使用 `tailscale ip` 查询它的 Tailscale IP。假设你的账户名是 `username`，IP 地址是 `100.100.123.123`：

```shell
ssh username@100.100.123.123
```

> **注意：**
>
> 如果你的 Tailscale 网络启用了 [MagicDNS][docs-magicdns]，直接连接 SSH 服务器的主机名即可。例如，对于名为 `myserver` 的服务器：`ssh username@myserver`

[bl-rotate-ssh-keys]: https://tailscale.com/blog/rotate-ssh-keys

[bl-tailscale-key-management]: https://tailscale.com/blog/tailscale-key-management

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-grants]: /docs/features/access-control/grants

[docs-magicdns]: /docs/features/magicdns

[docs-secure-server-ubuntu]: /docs/how-to/secure-ubuntu-server-with-ufw

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#configure-tailscale-ssh-with-check-mode

[docs-tailscale-ssh-configure-tailscale-ssh]: /docs/features/tailscale-ssh#configure-tailscale-ssh

[docs-tailscale-ssh]: /docs/features/tailscale-ssh
