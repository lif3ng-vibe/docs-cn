---
title: "Tailscale 与 FedRAMP 及 FIPS-140 的注意事项"
description: "在 FedRAMP Moderate 环境中以及 FIPS 140 场景下使用 Tailscale。"
---

最后验证于 Jan 5, 2026

Tailscale 是一个基于 [WireGuard®][xt-wireguard] 构建的现代虚拟专用网络（VPN）。虽然 Tailscale 尚未获得 [FedRAMP][xt-fedramp] 授权，但许多已通过 FedRAMP 认证的云服务提供商（CSP）今天就可以在边界划分得当的前提下使用 Tailscale。以下信息可供你在评估 Tailscale 是否契合你的 FedRAMP Moderate 环境时参考。

## Tailscale 安全态势

Tailscale 已通过 SOC 2 Type II 认证。你可以从 Tailscale 的[法律与信任][co-legal]页面下载 SOC 2 报告。Tailscale 使用 WireGuard 实现传输层安全（TLS），并提供端到端加密的网状组网。

Tailscale 的安全组网方式体现了[最小权限][ln-principle-of-least-privilege]与[零信任安全][docs-zero-trust]原则。Tailscale 提供强大的加密保护、强化的默认配置，以及细致的审计能力。

## FedRAMP 相关考量

即使尚未取得自身的 FedRAMP 准许运营（ATO）认证，只要整合得当，Tailscale 依然可以在 FedRAMP 授权环境中发挥作用。请考虑以下几点：

* **边界定义**：使用美国国家标准与技术研究院（NIST）的 [SP 800-18][xt-nist-sp-800-18] 与联邦信息处理标准（FIPS）[199][xt-fips-199] 来界定 Tailscale 位于你的系统边界之内还是之外。
* **系统分类**：确定 Tailscale 属于主要系统还是支持性服务。
* **分层加密**：如果你已经在使用经 FIPS 验证的 TLS 或互联网协议安全（IPsec），Tailscale 可以作为额外的一层加密来运行。

Tailscale 提供技术文档，协助 CSP 划分这些边界以满足合规要求。

## FIPS 140-2/3 合规背景

[FIPS 140-3][xt-fips-140-3] 及其前身 FIPS 140-2 定义了加密模块的安全要求。Tailscale 目前未使用经 FIPS 验证的加密模块。不过，这并不总是必要条件：

* 如果 Tailscale 流量被包裹在经 FIPS 验证的加密之中（例如 TLS 终止或 IPsec），则可能被视为合规。
* FedRAMP 指南允许在分层加密场景下使用未经验证的模块，前提是内层满足 [SC-8(1)/SC-28(1)][xt-fedramps-cryptographic-module-selection]。

> **注意：**
>
> Tailscale 不提供法律意见。我们建议你就自己对 Tailscale 的使用是否视为合规，咨询你自己的专家。

[co-legal]: https://tailscale.com/legal

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-fedramp]: https://www.fedramp.gov/

[xt-fedramps-cryptographic-module-selection]: https://www.fedramp.gov/resources/documents/FedRAMP_Policy_for_Cryptographic_Module_Selection_v1.1.0.pdf

[xt-fips-140-3]: https://csrc.nist.gov/pubs/fips/140-3/final

[xt-fips-199]: https://csrc.nist.gov/pubs/fips/199/final

[xt-nist-sp-800-18]: https://csrc.nist.gov/pubs/sp/800/18/r1/final

[xt-wireguard]: https://www.wireguard.com
