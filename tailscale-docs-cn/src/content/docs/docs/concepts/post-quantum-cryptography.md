---
title: "后量子密码学"
description: "探索后量子密码学与 Tailscale 的关系。"
---

最后验证于 May 2, 2025

后量子密码学（post-quantum cryptography，PQC）是一种为抵御密钥交换攻击而设计的密码学，这类攻击可能来自拥有量子计算机的攻击者。从高层次看，量子计算机可用于破解非对称加密，而对称加密不受影响。

后量子非对称加密的标准才刚刚开始出现。例如 [Module-Lattice-Based Key-Encapsulation Mechanism][xt-ml-kem]（ML-KEM，前称 Kyber）。一些公司（如主流浏览器厂商）已经开始在各自的传输层安全（TLS）实现中采用 ML-KEM，以降低攻击者未来拥有量子计算机所带来的风险。

## PQC 与 WireGuard

在两台设备建立连接的握手过程中，WireGuard 与许多其他协议一样，使用非对称加密来协商每条连接专属的对称密钥。连接的其余部分随后使用该对称密钥加密，并定期轮换。如果攻击者能在协商阶段破解非对称密钥，就能解密连接的其余数据。

WireGuard 的设计不允许更改连接双方协商一致的对称/非对称算法。具体来说，正如 [WireGuard: Next Generation Kernel Network Tunnel][xt-wireguard-whitepaper] 所述，WireGuard 有意避免协议灵活性（protocol agility）。因此，Tailscale 无法在 WireGuard 中直接使用 ML-KEM，否则它就只是一个另外的新协议了。

理论上，攻击者使用量子计算机有可能推算出握手期间交换的对称密钥。为缓解这一威胁，WireGuard 作者提出的一种方案是使用 WireGuard 协议中已有的可选预共享密钥（PSK）功能：连接的两端各自将同一个对称密钥（提前单独配置好）混入非对称握手中。由于对称加密被认为不受量子计算机威胁，使用 PSK 即可保护握手过程，进而保护 WireGuard 连接的其余部分。

这也带来了另一个挑战：如何生成唯一的 PSK 并分发给各个 WireGuard 对端。分发环节应使用某种 PQC 机制，例如基于 ML-KEM 的 TLS 连接。

## PQC 与 Tailscale

Tailscale 在 WireGuard 之上构建，增加了自动 mesh 组网配置、单点登录（SSO）、NAT 穿透、TCP 传输，以及集中式的[访问控制策略][docs-access-control]。

目前，Tailscale 的 WireGuard 实现尚不具备后量子安全性，也未使用 PSK。Tailscale 用户同样无法手动配置 PSK。

最终，我们计划构建自动向设备供应并分发 PSK 的能力。这将使 Tailscale 在未来实现开箱即用的后量子安全。

[docs-access-control]: /docs/features/access-control

[xt-ml-kem]: https://csrc.nist.gov/pubs/fips/203/final

[xt-wireguard-whitepaper]: https://www.wireguard.com/papers/wireguard.pdf
