---
title: "How app connectors work"
description: "Route SaaS application traffic in your tailnet using app connectors."
---

Last validated Oct 7, 2026

> **Note:** App connectors are available for [all plans](https://tailscale.com/pricing).

App connectors let you route your self-hosted applications and software as a service (SaaS) applications through dedicated devices in your Tailscale network (known as a tailnet). An app connector works like a [subnet router][docs-subnets] with the added benefit of routing your users and devices to applications by domain names instead of IP addresses, providing more reliable connectivity.

Additionally, you can use app connectors to accommodate additional needs related to application connectivity, monitoring, optimization, security, and reliability.

**Application types**

* Internally hosted resources.
* Cloud infrastructure or virtual private cloud (VPC).
* SaaS applications including Amplitude, Confluence, GitHub, Looker, Office 365, Salesforce, and Stripe.
* Managed platforms such as Mongo Atlas, Amazon RDS, and Planetscale.

**Management options and benefits**

* Centrally manage application access for your app connector devices instead of managing access to your applications for each individual device in the tailnet.
* Monitor activity for new or removed app connectors in your tailnet in the [configuration audit logs][docs-audit-logging].
* Monitor app connector and application traffic using third-party tools.
* Optionally restrict all application access through the app connector device by configuring IP allowlisting in your application settings. This ensures that only the permitted devices in your tailnet can access the application if they are granted access to the app connector.

**Reliability options and benefits**

* Deploy multiple app connector devices for the same application to provide redundancy.
* Choose how Tailscale selects among eligible connectors using the tailnet's [route selection option][docs-route-selection].

For deployment instructions, refer to [Set up high availability][docs-high-availability].

## How it works

Here are some terms and definitions for understanding how app connectors work.

* **App connector**: The general overall term for the feature, as well as the admin console settings that let you add and remove app connectors in your tailnet.
* **App connector device**: The Linux device in your tailnet designated for routing traffic to your application.
* **Application**: The self-hosted, cloud-based, or SaaS application to which the app connector device routes tailnet traffic.

Here's how you set up an app connector. For more information, refer to [Set up an app connector in your tailnet][docs-app-connectors-setup].

1. Configure your [tailnet policy file][docs-tailnet-policy-file] to define device permissions for the app connector in your tailnet, including tags.
2. Assign devices in your tailnet with the tag you configured to permit access to the app connector.
3. Configure a Linux device in your tailnet to act as the designated app connector that will route the traffic to the application. This device must have a public IP address, and IP forwarding must be enabled.
4. Configure the app connector in the admin console to specify the tag and the domain names for the applications.
5. Configure the application to manage additional access and security needs, including optional IP allowlisting to only permit requests from the app connector device IP addresses.

Here's how app connectors work at a high level, assuming access control policy only lets a specific group of users and devices in your tailnet access the application by way of the app connector.

1. A device with the designated tagging accesses an application.
2. The request is passed to the device designated as the app connector.
3. The app connector routes the traffic to the application by egressing to the IP addresses advertised by the application domains.
4. (Optional) The application verifies that the request is coming from the app connector's public IP address.
5. Traffic from the application is routed back through the app connector and then passed along to the user device in the tailnet.

### DNS discovery mechanism

App connectors use the PeerAPI to perform DNS discovery through DoH (DNS over HTTPS):

1. **Access requirement**: Client devices must have access to the app connector tag for it to appear as a peer.
2. **DNS resolution**: App connectors use DoH to resolve configured domains to IP addresses.
3. **Route advertisement**: Discovered IP addresses are automatically advertised as routes to the tailnet.

Minimal access (such as ICMP) is sufficient to enable peer discovery—full application access is not required.

## Considerations

* If a user is not connected to the tailnet, they will still have access to the application unless IP allowlisting is configured in the [application settings][docs-app-connectors-setup-apps]. If you set up IP allowlisting, you can also enforce system policy settings such as [`AlwaysOn.Enabled`][docs-mdm-keys-always-on] to ensure that devices are always connected to the tailnet.
* If a user disables the [accept routes][docs-client-preferences-accept-routes] option on their Tailscale client, their device will not route through the app connectors. You can use the [`UseTailscaleSubnets`][docs-mdm-keys-tailscale-subnets] system policy to prevent users from disabling this setting.
* Linux devices in a tailnet do not accept routes by default. Make sure to use the Tailscale CLI command [`tailscale set --accept-routes=true`][docs-client-preferences-accept-routes] on all the Linux devices that require access to the app connectors, if not previously set.
* When manually configuring an application, the provider often uses multiple domains. You must add all of these domains to your app connector configuration. Refer to the GitHub [V2Fly project][xt-gh-domain-list-community] for a curated list of known applications and the corresponding domains for each one.
* If multiple Fully Qualified Domain Names (FQDNs) share an IP address and one of those FQDNs is an app connector target, connections to all FQDNs sharing the resolved IPs will be routed through the app connector. This is because once an app connector resolves an IP address, it will route traffic to that IP through the connector—regardless of how it was resolved or even if the IP address was used instead of a DNS name.
* Multiple app connector devices for a single app connector are recommended for optimal performance and reliability.
* If an app connector becomes unavailable while in use, and no other app connectors are available, resolution to the domain will begin to fail until the app connector is back online.
* If you manage your tailnet policy file using an external provider like [Terraform][docs-terraform-provider] or [GitOps][docs-gitops], any changes you make to app connectors in the admin console will be overwritten during the next sync. Make sure to manage app connectors through your external provider.

### Expired device keys

\[Missing snippet: expired\_device\_keys\_fail\_close.mdx]

[docs-app-connectors-setup-apps]: /docs/features/app-connectors/how-to/setup#restrict-application-access-by-ip-address

[docs-app-connectors-setup]: /docs/features/app-connectors/how-to/setup

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-client-preferences-accept-routes]: /docs/features/client/manage-preferences#use-tailscale-subnets

[docs-gitops]: /docs/gitops

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-mdm-keys-always-on]: /docs/features/tailscale-system-policies#set-tailscale-to-always-be-connected

[docs-mdm-keys-tailscale-subnets]: /docs/features/tailscale-system-policies#set-whether-the-device-accepts-tailscale-subnets

[docs-route-selection]: /docs/features/route-selection

[docs-subnets]: /docs/features/subnet-routers

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-terraform-provider]: /docs/integrations/terraform-provider

[xt-gh-domain-list-community]: https://github.com/v2fly/domain-list-community/tree/master/data
