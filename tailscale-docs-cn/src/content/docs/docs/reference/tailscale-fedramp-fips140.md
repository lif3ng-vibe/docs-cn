---
title: "Tailscale FedRAMP and FIPS-140 considerations"
description: "Use Tailscale in FedRAMP Moderate environments and in the context of FIPS 140."
---

Last validated Jan 5, 2026

Tailscale is a modern virtual private network (VPN) built on [WireGuard®][xt-wireguard]. While Tailscale is not yet [FedRAMP][xt-fedramp] authorized, many FedRAMP-certified Cloud Service Providers (CSPs) can use Tailscale today within properly scoped boundaries. The following information provides guidance when you evaluate Tailscale's fit within your FedRAMP Moderate environment.

## Tailscale security posture

Tailscale is SOC 2 Type II certified. You can download the SOC 2 report from the Tailscale [Legal and Trust][co-legal] page. Tailscale uses WireGuard for Transport Layer security (TLS) and provides end-to-end encrypted mesh networking.

Tailscale's approach to secure networking embodies the principles of [least privilege][ln-principle-of-least-privilege] and [zero trust security][docs-zero-trust]. Tailscale provides strong cryptographic protection, hardened defaults, and detailed auditing.

## FedRAMP Considerations

Tailscale is useful in FedRAMP-authorized environments even without its own FedRAMP Authority to Operate (ATO) certification if integrated appropriately. Take the following into account:

* **Boundary definition**: Use National Institute of Standards and Technology (NIST) [SP 800-18][xt-nist-sp-800-18] and Federal Information Processing Standards (FIPS) [199][xt-fips-199] to define if Tailscale is inside or outside your system boundary.
* **System categorization**: Determine whether Tailscale is a major system or supporting service.
* **Layered cryptography**: If you already use FIPS-validated TLS or Internet Protocol Security (IPsec), Tailscale can operate as an additional encrypted layer.

Tailscale provides technical documentation to assist CSPs in mapping these boundaries for compliance.

## FIPS 140-2/3 compliance context

[FIPS 140-3][xt-fips-140-3] and its predecessor FIPS 140-2 define security requirements for cryptographic modules. Tailscale does not currently use a FIPS-validated cryptographic module. However, this is not always required:

* If Tailscale traffic is wrapped in FIPS-validated encryption (such as TLS termination or IPsec), it may be considered compliant.
* FedRAMP guidance provides for un-validated modules in layered encryption scenarios when inner layers meet [SC-8(1)/SC-28(1)][xt-fedramps-cryptographic-module-selection].

> **Note:**
>
> Tailscale is not providing legal advice. We suggest you consult with your own experts regarding whether your use of Tailscale is considered compliant.

[co-legal]: https://tailscale.com/legal

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-fedramp]: https://www.fedramp.gov/

[xt-fedramps-cryptographic-module-selection]: https://www.fedramp.gov/resources/documents/FedRAMP_Policy_for_Cryptographic_Module_Selection_v1.1.0.pdf

[xt-fips-140-3]: https://csrc.nist.gov/pubs/fips/140-3/final

[xt-fips-199]: https://csrc.nist.gov/pubs/fips/199/final

[xt-nist-sp-800-18]: https://csrc.nist.gov/pubs/sp/800/18/r1/final

[xt-wireguard]: https://www.wireguard.com
