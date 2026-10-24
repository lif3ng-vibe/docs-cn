---
title: "Manage domains"
description: "Manage the domains associated with your tailnet."
---

Last validated May 11, 2026

> **Note:** Domain verification is currently in beta.

Some administrative actions in your Tailscale network (known as a tailnet) require you to connect and verify your domain name. Your primary domain will be listed automatically, and does not require you to verify it.

> **Note:**
>
> The [Domains](https://console.tailscale.com/admin/settings/domains) page is not available for shared domain tailnets, such as those with an `@gmail.com` address or those that use GitHub as an identity provider.

## Domain types

* **Primary**: The default domain name that is attached to users in the tailnet. Other organizations will not be allowed to use this domain name. You do not need to verify this domain unless instructed by our support team. If you need to change your primary domain, contact [Tailscale Support][co-contact-support-domainchange].
* **Legacy**: A domain name that has been previously established as a domain alias with our support team, but is not actively verified. The domain alias is still active.
* **Alias**: A domain name that has been verified and is actively used as a [domain alias][docs-domain-aliases]. Other organizations will not be allowed to use this domain name.
* **Claimed**: A domain name that has been verified, but is not used as an alias. Other organizations will not be allowed to use this domain name.

## Verify a domain name

You need to be an [Owner or Admin](/docs/reference/user-roles) of a tailnet to verify a domain name.

1. Visit the [Domains](https://console.tailscale.com/admin/settings/domains) page in the admin console.
2. Select the **Add domain** button and enter the address of the domain name you want to verify.
3. Copy the TXT record's **Name** and **Value**. These are not secret values, and you can fetch them again later.
4. Sign into your domain provider and create a new TXT record using the **Name** and **Value** shown in the console, and set the TTL to 3600. The Name is a `_tailscale-challenge` subdomain of your domain (for example, `_tailscale-challenge.example.com`), not the domain itself. Some DNS providers automatically append your domain to the record name; for those, enter only `_tailscale-challenge`. If the domain is registered with a common domain provider, we'll provide a link to the relevant documentation on the domain provider's website.
5. Once you've successfully added the TXT record to your domain provider, return to the Tailscale admin console and select **Close**.

Your domain will be marked as **Pending verification** until Tailscale successfully identifies the TXT record on your domain's records. Tailscale will continually check the domain, but you can also manually recheck for the TXT record. It may take up to a few hours for your domain provider to propagate the changes.

When a domain is successfully verified, an email confirmation will be sent to the tailnet's [security contact][docs-contact-preferences-security].

You should leave the TXT record on your domain even after it has been successfully verified. Tailscale will periodically check for the TXT record.

Once your domain is verified, you can set it as a [domain alias][docs-domain-aliases] for your tailnet.

## Remove a domain name

> **Danger:**
>
> Removing a verified domain will allow a user whose email address uses that domain to create a new tailnet using that address as the primary domain.

You need to be an [Owner or Admin](/docs/reference/user-roles) of a tailnet to remove a domain name.

1. Visit the [Domains](https://console.tailscale.com/admin/settings/domains) page in the admin console.
2. Find the domain name you wish to remove, select the  menu, then select **Remove**.
3. Enter the domain name to confirm, then select **Remove domain**.

[co-contact-support-domainchange]: https://tailscale.com/contact/support/?type=domainchange

[docs-contact-preferences-security]: /docs/reference/contact-preferences#security-issues-email

[docs-domain-aliases]: /docs/account/domain-aliases
