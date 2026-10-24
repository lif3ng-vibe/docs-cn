---
title: "Use a custom DNS domain with Tailscale PAM"
description: "You can use your own DNS domain for [Tailscale PAM HTTP services][docs-pam-http-services]. This lets you make services available using host names from a domain you control, such as `wiki.infra.example"
---

Last validated Aug 21, 2026

> **Note:** Tailscale PAM is currently in beta.

> **Note:** Custom domains for Tailscale PAM HTTP services are available for [the Premium plan](https://tailscale.com/pricing).

You can use your own DNS domain for [Tailscale PAM HTTP services][docs-pam-http-services]. This lets you make services available using host names from a domain you control, such as `wiki.infra.example.com`, instead of the default PAM hostname.

To use a custom domain, you need to add two CNAME records to your DNS configuration and then add the domain to Tailscale PAM. Tailscale PAM uses these records to route traffic to its global infrastructure and provision TLS certificates for your domain.

Custom domains apply to PAM HTTP services. Other PAM service types, such as SSH, databases, Kubernetes, and RDP, don't use custom HTTP host names.

## Prerequisites

Before you begin, make sure you have:

* A domain or subdomain you can manage, such as `infra.example.com`.
* Access to your DNS provider so you can create CNAME records.
* A role of [Owner or Admin](/docs/reference/user-roles) for your tailnet so you can modify the PAM domains settings.

## Add a custom domain

To add a custom domain:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) page of the Tailscale admin console.

2. In the **Domains** section, select **Add domain**.

3. Enter the domain you want to use, such as `infra.example.com`.

   Tailscale PAM shows the two CNAME records you need to add to your DNS configuration:

   * A wildcard CNAME record (`*`) that routes HTTP services under your custom domain to Tailscale PAM.
   * An `_acme-challenge` CNAME record that Tailscale PAM uses to validate the domain and provision TLS certificates.

   The exact CNAME targets are specific to your Tailscale PAM configuration and are shown in the **Add domain** dialog.

   For example, the records will look similar to:

   | Name                                | Type  | Value                                           |
   | ----------------------------------- | ----- | ----------------------------------------------- |
   | `*.infra.example.com`               | CNAME | `<your-pam-subdomain>.border0.io`               |
   | `_acme-challenge.infra.example.com` | CNAME | `<domain>.<your-pam-subdomain>.acme.border0.io` |

   Replace `<domain>` and `<your-pam-subdomain>` with the values for your tailnet.

   The exact way you enter the **Name** field depends on your DNS provider. For example, some providers expect only `*` and `_acme-challenge` when you're editing the `infra.example.com` DNS zone.

4. Add both CNAME records using your DNS provider.

5. Wait for the DNS changes to propagate.

6. Return to the [PAM](https://console.tailscale.com/admin/settings/pam) page and select **Save**.

Tailscale PAM verifies both DNS records when you save the domain.

## Choose a default domain

If you configure more than one custom domain, you can choose which one should be the default.

When adding a domain, select **Make this the default domain** to use it as the primary domain for your PAM HTTP services.

You can change the default domain later if you add additional domains.

## Use your custom domain

After the custom domain is configured, your Tailscale PAM HTTP services are available using the custom domain.

For example, if your custom domain is:

* `infra.example.com`

An HTTP service named `wiki` can use:

* `https://wiki.infra.example.com`

You don't need to configure the custom domain separately for each HTTP service.

[docs-pam-http-services]: /docs/privileged-access-management/how-to/access-http-service
