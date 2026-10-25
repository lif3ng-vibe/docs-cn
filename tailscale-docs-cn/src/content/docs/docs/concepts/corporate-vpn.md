---
title: "企业 VPN 详解"
description: "借助设备间直连加密、无缝的身份提供方集成和灵活的访问控制，保障你的企业 VPN 安全。"
---

最后验证于 Jan 5, 2026

企业 VPN 将办公网络延伸到远程场所。过去，这指的是用笔记本电脑从家中访问工作站上的共享文件；随着计算在商业中的应用范围不断扩大，商业 VPN 的含义也随之扩展。如今，它可以是在办公室、在家中对数据中心或云资源的访问，也可以是在外出时用手机或平板电脑进行访问。商业 VPN 可以连接数据中心，或用于在云服务商之间迁移。现代商业网络正是建立在 VPN 之上的。

## 商业 VPN 的安全性

商业 VPN 最重要的属性是安全性。VPN 阻止未经授权的人查看网络流量。这涉及两个组成部分：加密和认证，认证可借助 Okta、Active Directory 或 Google Workspace 等身份提供方（IdP）完成。

许多企业 VPN 基于 TLS 加密——这是一项可靠的技术，可用于保护计算机之间的连接。Tailscale 则基于新一代加密点对点隧道：[WireGuard®][xt-wireguard]。

## 连接性

传统的商业 VPN 基于集中器（concentrator）的概念：也就是办公室里的一台专用硬件，远程用户连接到它，以访问该办公室内的任何机器。而现代商业 VPN 需要能更好地适应我们多样化的计算环境。

现代商业 VPN 默认还提供选择性路由：只有访问企业资源的连接需要经过 VPN，用户可以直接访问互联网资源。

### 基于硬件的 VPN 已经过时

现代网络不再是"一个总部加几个分支办公室和家用电脑"的形态：它们分布在互联网的各个角落。你的虚拟机可能分散在五六家数据中心和多家云服务商，用户则使用手机和平板电脑，有的通过专线光纤接入，有的则借助卫星连接。

为了给另一端举办的周末培训班而专门把硬件运到数据中心去开一台虚拟机，根本不现实。同样，当所有员工突然都要居家办公时，却受限于已部署的集中器硬件，则是巨大的经营风险。专用硬件的采购周期太长，会削弱你业务的灵活性。

现代企业 VPN 完全基于软件。你可以按需启动一个集中器充当 VPN，并在其过载时将其拆分为多个子网。

像 Tailscale 这样先进的企业 VPN 可以彻底废除集中器：每台服务器都可直接运行 Tailscale，各客户端可以与它需要通信的每台服务器建立点对点连接。细粒度的集中式[访问控制][docs-access-control]让你能够逐步将企业网络转变为零信任环境。

## 访问控制面板

所有 VPN 都需要管理。老旧的硬件 VPN 需要企业 IT 部门随着业务需求的变化采购、跟踪、部署和重新部署设备。现代软件 VPN 则需要配置，使员工电脑只能访问其职责范围内的资源。如果你用工具箱式的方案搭建商业 VPN，就必须为日后的管理预留大量 IT 工时。

成熟现代的商业 VPN 提供集中式的设备清单和访问控制管理。

Tailscale 管理控制台让网络管理员能够掌控企业网络中的设备以及每个人的访问权限（进而控制其设备）：既可以在高层按标签（tag）对设备分类，也可以在底层将访问限制到精确的端口号。访问控制通过 Tailscale 访问控制系统进行管理：

```json
"grants": [
  // Engineering users, plus the president, can access port 22 (ssh)
  // and port 3389 (remote desktop protocol) on all servers, and all
  // ports on git-server or ci-server.
  {
    "src": ["group:engineering", "president@example.com"],
    "dst": ["*"],
    "ip": ["22", "3389"]
  },
  {
    "src": ["group:engineering", "president@example.com"],
    "dst": ["git-server", "ci-server"],
    "ip": ["*"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

网络可以配置为允许员工把自己的设备加入企业网络，也可以加以限制，要求 IT 部门事先授权每台设备。通过使用身份提供方，可以将认证有效期和 MFA 设为公司政策的强制要求。

合理的默认设置意味着小型企业也无需配置任何策略即可采用 Tailscale。你可以在十分钟内搭好一个简单的现代企业 VPN，今天就下载试试吧。

[docs-access-control]: /docs/features/access-control

[xt-wireguard]: https://www.wireguard.com
