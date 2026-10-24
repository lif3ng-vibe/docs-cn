---
title: "Domain ownership"
description: "Explore how your tailnet is tied to your domain."
---

Last validated May 11, 2026

When you create your Tailscale network (known as a tailnet), your user domain becomes part of your [Tailscale identity][docs-tailscale-identity].

**The guidance in this topic also applies for Tailscale accounts based on GitHub organizations, GitHub personal accounts, and for single-user tailnets based on email/user identity.**

> **Note:**
>
> Ensure that you maintain control of your domain, to prevent malicious takeover of your tailnet.

## How your domain is used

Tailscale requires you to show ownership and control of a user's domain when signing up with a [custom OIDC identity provider][docs-sso-custom-oidc], enabling a [domain alias][docs-domain-aliases], or when requesting help from our support team for certain issues. Depending on your request, we will ask you to do one of the following actions:

* [Verify ownership of your domain][docs-domain-verification] by setting DNS TXT records.
* Respond to a confirmation email sent to a `*@example.com` email address. For example, an email sent from Tailscale support to the owner admin of a tailnet when another user of the tailnet is requesting some action in the tailnet.
* Set up a WebFinger endpoint.

For verification of [GitHub organization][xt-gh-account-types], the owner of the tailnet must also be an admin of the GitHub organization.

Once your tailnet is created, your domain is always associated with the tailnet, and you need to maintain control over and use of your domain for the lifetime of your tailnet.

## Mitigating tailnet risk from a malicious takeover

To help mitigate the impact of a malicious actor gaining control of your domain, there are several settings you can use with your tailnet:

* Enable [device approval][docs-device-approval] so that an admin can review and approve new devices before they can join the tailnet.
* Enable [user approval][docs-user-approval] so that an admin can review and approve new users before they can join the tailnet.
* Use [Tailnet Lock][docs-tailnet-lock] to verify that no device is added to your tailnet without being signed by a trusted device already in your tailnet.

For general guidance on securing your tailnet, refer to [Best practices to secure your tailnet][docs-security-hardening].

## If you no longer use your domain

If you need to change domain names or relinquish an old name and move to a new name, [contact support][co-contact-support-domainchange] so we can rename the tailnet for you.

If you delete your domain, your tailnet is not automatically deleted. If you want to delete your tailnet, you need to explicitly [delete your tailnet][docs-delete-tailnet].

[co-contact-support-domainchange]: https://tailscale.com/contact/support/?type=domainchange

[docs-delete-tailnet]: /docs/account/delete-tailnet

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-domain-aliases]: /docs/account/domain-aliases

[docs-domain-verification]: /docs/account/domain-verification

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-sso-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-user-approval]: /docs/features/access-control/user-approval

[xt-gh-account-types]: https://docs.github.com/en/get-started/learning-about-github/types-of-github-accounts#organization-accounts
