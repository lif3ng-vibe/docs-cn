---
title: "节点密钥"
description: "Tailscale 如何使用节点密钥来控制哪些机器可以加入 tailnet。"
---

最后验证于 Jan 5, 2026

节点密钥（node key）是用来认证和标识 Tailscale 网络（即 [tailnet][docs-tailnet]）中设备的加密密钥。它们是 Tailscale 安全架构的基础组件，与机器密钥（machine key）协同工作，构成[保护网络的多层机制][bl-key-management]。

Tailscale 使用节点密钥来认证设备、基于用户身份和设备状态授权访问，并加密设备间的流量。当设备连接到 Tailscale 时：

1. 设备生成一个私有的节点密钥（与机器密钥分开）。
2. Tailscale 将节点密钥的公钥部分发送给[协调服务器][docs-coordination-server]。
3. 你通过自己的[身份提供方][docs-device-identity]（IdP，如 OAuth 2.0 或 SAML）完成认证。
4. 认证完成后，协调服务器将节点密钥与具体设备（机器密钥）和用户身份关联起来。
5. 协调服务器依据你 tailnet 的[访问控制策略][docs-access-control]校验节点密钥，以确定你的设备可以访问哪些资源。
6. 协调服务器随后依据你的访问控制策略，将节点密钥的公钥部分分发给 tailnet 中的其他设备。
7. 设备使用该密钥对与其他设备建立[加密][docs-encryption]连接。

当[管理员](/docs/reference/user-roles)使用管理控制台[移除设备][docs-device-remove]时，Tailscale 会立即吊销其节点密钥。授权和吊销都会在整个 tailnet 内几乎即时生效。

## 机器密钥与节点密钥的对比

Tailscale 使用[机器密钥][bl-machine-keys]和节点密钥来管理设备身份与设备授权。机器密钥向 Tailscale 协调服务器标识物理设备；节点密钥则授权网络访问，并在设备之间建立安全连接。

| 机器密钥                                                   | 节点密钥                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| 首次安装 Tailscale 时生成                                  | 用户每次认证时生成                                               |
| 标识物理设备                                               | 将设备与用户身份绑定                                             |
| 用于与协调服务器的安全通信                                 | 用于设备间的 [WireGuard][docs-wireguard] 连接                    |
| 无法轮换                                                   | 可以定期轮换                                                     |
| 可要求预授权                                               | 自动依据访问控制策略校验                                         |

[bl-machine-keys]: https://tailscale.com/blog/tailscale-key-management#machine-keys

[bl-key-management]: https://tailscale.com/blog/tailscale-key-management

[docs-access-control]: /docs/features/access-control

[docs-coordination-server]: /docs/concepts/control-data-planes#coordination-server

[docs-device-identity]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-remove]: /docs/features/access-control/device-management/how-to/remove

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-tailnet]: /docs/concepts/tailnet

[docs-wireguard]: /docs/concepts/wireguard
