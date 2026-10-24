---
title: "Get started with Tailscale PAM"
description: "Sign up for Tailscale PAM and use it to provide privileged access to resources in your Tailscale network."
---

Last validated Jun 2, 2026

> **Note:** Tailscale PAM is currently in beta.

This guide walks you through enabling Tailscale PAM so you can begin to provide privileged access for your Tailscale network (known as a tailnet). To learn more about what Tailscale PAM does before you start, refer to [What is Tailscale PAM?][docs-pam-what-is-tailscale-pam].

> **Note:**
>
> The following related video provides additional context and examples.

[Getting started | Tailscale PAM (video)](https://www.youtube.com/watch?v=rvYO9VgXlk4)

What happens when you enable Tailscale PAM

When you enable Tailscale PAM from the [PAM](https://console.tailscale.com/admin/settings/pam) page in the Tailscale admin console, Tailscale automatically configures your tailnet with everything needed to start using PAM. This lets you get started without manually configuring tags, service approvals, credentials, or initial access rules.

Tailscale automatically:

* **Creates the `tag:border0-managed` tag**. PAM-managed resources, including connectors and services, use this tag. The tag is owned by `autogroup:admin`.
* **Adds an `autoApprovers` rule**. Connectors tagged with `tag:border0-managed` can automatically approve PAM services using the same tag. This means you don't need to manually approve each PAM service advertisement.
* **Adds an initial PAM application grant**. Members of `autogroup:admin` are granted access to PAM services tagged with `tag:border0-managed`, giving administrators initial access to supported PAM services such as SSH, databases, Kubernetes, RDP, and HTTP.
* **Creates a trust credential for Tailscale PAM**. This OpenID Connect (OIDC) trust credential is used for the integration between your tailnet and the Tailscale PAM API service. You can view it in the [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) page. The automatically created credential is tagged with `tag:border0-managed`.

These settings are created automatically so PAM works out of the box. Avoid removing or modifying the automatically created tag, `autoApprovers` rule, or trust credential unless you intend to replace that configuration, as doing so can prevent parts of the PAM integration from working correctly.

You can customize the automatically created PAM grant as needed to control which users can access your PAM services and what they are allowed to do.

## Prerequisites

Before you begin, confirm you have the following:

* A tailnet. If you do not have a tailnet, [sign up](https://login.tailscale.com/start).

* Tailscale PAM integration is enabled for your tailnet. If you want to try Tailscale PAM for free, [join the waitlist][co-pam-waitlist]. To learn more about Tailscale PAM for your organization, contact [Tailscale Sales][co-contact-sales-border0].

* A Tailscale account with [Owner, Admin, or IT admin](/docs/reference/user-roles) permissions, so you can use the Tailscale admin console to enable Tailscale PAM for your tailnet.

* A device to use as a Tailscale PAM connector. This topic will show you how to configure this device as a Tailscale PAM connector. The device must satisfy one of the following options:

  * Linux
  * AWS EC2
  * Docker
  * Kubernetes

* A device with a browser OR a device with the [Tailscale client][co-download] installed. This will be used to access the PAM service.

## Step 1: Enable the Tailscale PAM integration for your tailnet

Open the [PAM](https://console.tailscale.com/admin/settings/pam) settings page of the Tailscale admin console and select **Enable**.

## Step 2: Create a Tailscale PAM connector

1. Open the [Connectors](https://console.tailscale.com/admin/connectors) page of the admin console.
2. Select **Add connector**.
3. Select the platform that you want to use for the connector.
4. In the **Launch new connector** section, follow the instructions and apply them to the device that you want to use as your connector.

The PAM connector has Tailscale capability built into it and will automatically join your tailnet. For more information about Tailscale PAM connector installation, refer to [Installing a Tailscale PAM connector][docs-pam-connectors-install].

## Step 3: Define a PAM service

You can now use Tailscale PAM to create secure access to resources in your networks. The resources that you secure are referred to as PAM services. Tailscale PAM uses the PAM connector to securely proxy sessions to PAM services.

For an example, use Tailscale's sandbox server. In this example, you can use Secure Shell (SSH):

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.
2. Select **Add service**.
3. Select **PAM service**.
4. Select **Secure Shell - Standard Shell**.
5. On the right, select **Use Tailscale sandbox server**.
6. Select the PAM connector that you created.
7. Select **Continue**.
8. Select **Save**, as the username and password are already filled in.

## Step 4: Access a service

Once you create a service, members of your tailnet have two ways to access the service:

* They can [download the Tailscale client][co-download] and join their device to your tailnet.
* They can use a browser by accessing <https://my.tailscale.com>. This is the web-based client for PAM service access and does not require any downloads. When prompted, members of your tailnet can log in with the same account they use for Tailscale.

Once logged in to either the Tailscale desktop client or the browser client, members of your tailnet can access the services that you configured for them.

## Next steps

Explore the following resources on the Tailscale PAM site.

Configure your own PAM Services:

* [Access a database][docs-pam-access-database]
* [Access an HTTP service][docs-pam-access-http-service]
* [Access an SSH server (or shell)][docs-pam-access-ssh]

Learn more about Tailscale PAM:

* [Understand the Tailscale PAM architecture and core concepts][docs-pam-architecture-and-concepts] to get the most out of Tailscale PAM.
* [Get full visibility][docs-pam-sessions] into Tailscale PAM connections. Not just IP addresses and ports, but the full context behind who did what and when.
* [Use secret stores][docs-pam-manage-secrets] to securely store your upstream credentials when configuring services.
* [Configure policies][docs-pam-policies] to define granular access rules.

[co-contact-sales-border0]: https://tailscale.com/contact/sales-border0

[co-download]: https://tailscale.com/download

[co-pam-waitlist]: https://tailscale.com/pam-selfserve-waitlist

[docs-pam-access-database]: /docs/privileged-access-management/how-to/access-database

[docs-pam-access-http-service]: /docs/privileged-access-management/how-to/access-http-service

[docs-pam-access-ssh]: /docs/privileged-access-management/how-to/access-ssh

[docs-pam-architecture-and-concepts]: /docs/privileged-access-management/architecture-and-concepts

[docs-pam-connectors-install]: /docs/privileged-access-management/connectors/install

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-policies]: /docs/privileged-access-management/how-to/control-access

[docs-pam-sessions]: /docs/privileged-access-management/session-logs

[docs-pam-what-is-tailscale-pam]: /docs/privileged-access-management/what-is-tailscale-pam
