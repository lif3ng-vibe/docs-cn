---
title: "What is a tailnet?"
description: "Understand what the term tailnet means."
---

Last validated Jan 12, 2026

A Tailscale network (known as a tailnet) is a [secure][docs-security-hardening], interconnected collection of users, devices, and resources. Your tailnet is your private space, inaccessible from the public internet. It's akin to a secure conference room where only invited participants can enter. It forms the foundation of Tailscale's approach to networking, providing a flexible yet controlled space for [device connectivity][docs-device-connectivity], resource [sharing][docs-sharing], and collaboration across the internet.

Tailscale creates a tailnet when you first log into Tailscale on any device, be it a phone, personal computer, or virtual machine (VM). Each time you (or another user in your organization) authenticate a device with Tailscale, it adds that device to the tailnet. You can authenticate devices using a Tailscale account (for users) or a [tag][docs-tags] (for service-based devices).

Each tailnet is identified by a [tailnet DNS name][docs-tailnet-name], and used for features like [MagicDNS][docs-magicdns], [HTTPS][docs-enabling-https], and sharing without revealing your organization's identity. You can choose between a [default tailnet name][docs-tailnet-name-default-tailnet-name] (for example, `tailfe8c.ts.net`) or a [personalized tailnet DNS name][docs-tailnet-name] (such as `yak-bebop.ts.net`). You can find and manage your tailnet DNS name on the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.

Each device in your tailnet receives a private [Tailscale IP address][docs-100.x-addresses] within the CGNAT (Carrier-Grade Network Address Translation) range. Some addresses within this range are [reserved for Tailscale services][docs-reserved-ip-addresses]. Tailscale IP addresses facilitate direct communication between all your devices, regardless of physical location. It's like having your own personal, secure internet that spans wherever your devices are located.

> **Tip:**
>
> Some [pricing plans][co-pricing] extend the functionality of tailnets, allowing businesses and organizations to accommodate numerous devices and users, integrating seamlessly with various identity providers such as [Microsoft Entra ID][docs-sso-microsoft], [Google Workspace][docs-sso-google-workspace], [GitHub organizations][docs-sso-github], or [Okta][docs-sso-okta] tenancies. These integrations streamline user access and resource management based on existing organizational structures.

## Management

You (or [another user with the correct permission][docs-roles]) can find and manage tailnet settings through the admin console. The admin console lists all devices and users within the tailnet and provides access to tailnet-wide settings and configurations. Some settings include [access control][docs-access-control] policies, [DNS][docs-dns] settings, and authentication settings.

You can also manage your tailnet in other ways. For example, you can:

* Add entire subnets to your tailnet with [subnet routers][docs-subnets].

* Route traffic with [exit nodes][docs-exit-nodes].

* Route and manage application-specific traffic with [app connectors][docs-app-connectors].

* Set up [high availability][docs-high-availability] features.

* Configure network and application based access policies using [grants][docs-grants].

* Control how traffic routes through your tailnet using [via][docs-via].

* Increase security with features like [Tailnet Lock][docs-tailnet-lock].

* Manage [logging, streaming, and events][docs-log-events].

Tailnets also support [sharing][docs-sharing] features. You can [invite][docs-invite-any-user] users to your tailnet or share specific devices with them. Sharing and invites let you securely share internal services with other Tailscale users, including those outside your organization (such as [contractors][docs-acl-contractor-example]). Individuals can also share resources like a personal Minecraft server with friends while maintaining network security. You can create access control policies to manage what an invited user can do in your tailnet.

In addition to sharing and invites, you can leverage features like [Tailscale Serve][docs-tailscale-serve] and [Tailscale Funnel][docs-tailscale-funnel] to temporarily share access to specific services running on a device in your tailnet.

[co-pricing]: https://tailscale.com/pricing

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-acl-contractor-example]: /docs/reference/examples/acls#share-access-with-a-contractor

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-log-events]: /docs/features/logging

[docs-magicdns]: /docs/features/magicdns

[docs-roles]: /docs/reference/user-roles

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-sharing]: /docs/features/sharing

[docs-sso-github]: /docs/integrations/identity/github

[docs-sso-google-workspace]: /docs/integrations/google-sync

[docs-sso-microsoft]: /docs/integrations/identity/entra

[docs-sso-okta]: /docs/integrations/identity/okta

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-name-default-tailnet-name]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tailnet-name]: /docs/concepts/tailnet-name

[docs-tailscale-funnel]: /docs/features/tailscale-funnel

[docs-tailscale-serve]: /docs/features/tailscale-serve

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[docs-via]: /docs/features/access-control/grants/grants-via
