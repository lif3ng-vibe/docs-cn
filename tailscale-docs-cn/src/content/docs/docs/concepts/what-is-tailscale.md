---
title: "What is Tailscale?"
description: "Get a brief introduction to Tailscale."
---

Last validated Sep 30, 2025

Tailscale is a Zero Trust identity-based connectivity platform that replaces your legacy VPN, SASE, and PAM and connects remote teams, multi-cloud environments, CI/CD pipelines, Edge & IoT devices, and AI workloads.

Out-of-the-box, Tailscale solves many networking headaches. It has a customizable configuration to meet the demands of managing a distributed workforce. Tailscale helps provision for internal self-hosted and external third-party applications. It scales for growth as your requirements change.

Tailscale is an ideal solution for [DevOps][co-solutions-devops], [IT][co-solutions-it], and [Security][co-solutions-security] teams.

## Technical details

Tailscale is a secure networking solution that streamlines connecting devices and services securely across different networks. It enables encrypted point-to-point connections using the open source [WireGuard][xt-wireguard] protocol, which means only devices on your private network can communicate with each other.

Tailscale creates a peer-to-peer mesh network (known as a tailnet). However, you can still use Tailscale like a traditional VPN by routing all traffic through an [exit node][docs-exit-node].

*（图：A user in Charleston connecting to a computer in New York City through a gateway in San Diego. This results in high latency because the gateway is on the opposite coast.）*

Figure 1(a). The central gateway may or may not be close to users, thus resulting in higher latency. Because traffic is centralized, it can also act as a bottleneck, slowing down connections further.

*（图：The same user in Charleston connecting to the New York City computer directly, thanks to Tailscale.）*

Figure 1(b). With Tailscale, each device is connected to the other directly, resulting in lower latency.

The Tailscale approach avoids centralization where possible, resulting in both [higher throughput][bl-more-throughput] and lower latency as network traffic can flow directly between devices. Additionally, decentralization improves stability and reliability by reducing single points of failure.

> **Tip:**
>
> For more information, refer to [how Tailscale works][bl-how-tailscale-works].

## Benefits

Some key advantages of Tailscale include secure and private connections between devices, a flexible network topology, and a streamlined setup. Tailscale is also cross-platform, infrastructure agnostic, and highly configurable. It supports the [features][co-features] you need and the [integrations][co-integrations] that you currently use.

> **Tip:**
>
> For more information, refer to [why Tailscale is right for you][co-why-tailscale].

### Streamlined setup

You can deploy a tailnet in minutes without requiring extensive configuration, server setup, and networking expertise. After you create an account, authenticating two or more devices automatically creates a tailnet with a sensible set of [default access policies][docs-acl-samples-allow-all-default-acl].

Connections between tailnet devices work seamlessly across firewalls and [Network Address Translation (NAT)][bl-how-nat-traversal-works] without requiring port forwarding or complex firewall rules. This "zero-config" approach dramatically reduces the technical barriers to implementing secure networking, making it accessible to technical and non-technical users.

### Security and privacy

The [Tailscale security model][co-security] is built on modern, proven technologies and best practices such as end-to-end [encryption][docs-encryption] and a [zero-trust architecture][docs-zero-trust]. At its core, Tailscale uses WireGuard, a state-of-the-art VPN protocol known for its security and performance. This foundation is enhanced by Tailscale's commitment to [compliance][co-security-compliance], [security policies][co-security-policies], and [security features][co-security-features] such as [access control policies][docs-access-control] and [Tailnet Lock][docs-tailnet-lock].

### Scalability and adaptability

Tailscale's flexible architecture is designed to grow seamlessly with your organization's needs. Whether you're scaling from a small team to a large enterprise or expanding across multiple geographic locations, Tailscale maintains its performance and security characteristics at scale. The distributed nature of its architecture means that adding new devices or users doesn't create bottlenecks that typically plague traditional VPN solutions.

## Use cases

With its low barrier to getting started, versatility, and powerful capabilities, Tailscale seamlessly scales from personal use to enterprise deployments. Developers can use it to share work-in-progress features with their team, homelab enthusiasts can use it to [access their media servers remotely][co-homelab], and businesses can use it to [secure their distributed workforce][co-zero-trust-networking], all without the hassle and overhead of traditional infrastructure setup and maintenance.

* Business Virtual Private Network (VPN): Replace your legacy VPN and enable secure remote access to infrastructure.
* Privileged Access Management (PAM): Enable Zero Trust with just-in-time access and robust recording.
* Workload connectivity: Connect pipelines, apps, and Kubernetes workloads.
* Continuous Integration and Continuous Delivery (or Deployment) (CI/CD): Granular secure access to every runner and workload.
* Edge and Internet of Things (IoT): Access, manage, and monitor thousands of devices.
* Securing Artificial Intelligence (AI): Unified AI governance for AI agents and users.

> **Tip:**
>
> For more information, refer to [Tailscale Testimonials][co-customers] and [Tailscale Use Cases][docs-use-cases]!

## Get started

Getting started is as simple as creating an account, installing the Tailscale client, and logging into two or more devices. Visit the [quickstart guide][docs-install] to learn more.

> **Tip:**
>
> To stay in touch, [sign up for our newsletter][bl-blog].
>
> You can also follow us on [Twitter][xt-twitter-tailscale], [Hachyderm][xt-tailscale-hachyderm], and [YouTube][xt-tailscale-youtube].

[bl-blog]: https://tailscale.com/blog#blog-newsletter

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[bl-more-throughput]: https://tailscale.com/blog/more-throughput

[co-customers]: https://tailscale.com/customers

[co-features]: https://tailscale.com/features

[co-homelab]: https://tailscale.com/use-cases/homelab

[co-integrations]: https://tailscale.com/integrations

[co-security-compliance]: https://tailscale.com/security#compliance-and-certifications

[co-security-features]: https://tailscale.com/security#security-features

[co-security-policies]: https://tailscale.com/security-policies

[co-security]: https://tailscale.com/security

[co-solutions-devops]: https://tailscale.com/solutions/devops

[co-solutions-it]: https://tailscale.com/solutions/it

[co-solutions-security]: https://tailscale.com/solutions/security

[co-why-tailscale]: https://tailscale.com/why-tailscale

[co-zero-trust-networking]: https://tailscale.com/use-cases/zero-trust-networking

[docs-access-control]: /docs/features/access-control

[docs-acl-samples-allow-all-default-acl]: /docs/reference/examples/acls#allow-all-default-acl

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-node]: /docs/features/exit-nodes

[docs-install]: /docs/how-to/quickstart

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-use-cases]: /docs/use-cases

[docs-zero-trust]: /docs/concepts/zero-trust

[xt-tailscale-hachyderm]: https://hachyderm.io/@tailscale

[xt-tailscale-youtube]: https://www.youtube.com/@Tailscale

[xt-twitter-tailscale]: https://twitter.com/tailscale

[xt-wireguard]: https://www.wireguard.com
