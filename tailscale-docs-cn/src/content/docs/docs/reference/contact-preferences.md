---
title: "Contact preferences"
description: "Set contacts for account changes, configuration issues, security issues, and billing."
---

Last validated Jan 5, 2026

When we discover issues that affect your tailnet, and we have your contact information, we
will contact you. For example, if a security issue affects your tailnet and we have a security
contact email for you, we will send you an email.

You can add, review, and update your account changes, configuration issues, and security issues
contacts in the [Contact preferences](https://console.tailscale.com/admin/settings/contact-preferences) page of the admin console, if you have a
[user role][docs-user-roles] that is permitted access. For information about updating your billing contact,
refer to [Billing email][docs-billing-information-billing-email].

You cannot disable or unsubscribe from account changes, configuration issues, security issues, or billing emails. These emails notify you about transactional events; they are not marketing emails.

> **Note:**
>
> If you are using GitHub as your identity provider, we have no contact email information unless you
> add an email address to your contact preferences.

## Types of contact emails

The types of contact emails are for account changes, configuration issues, security issues, and billing.
A billing email is not enabled unless you're on a [paid Tailscale plan][co-pricing].

If you do not set an email for a contact type, Tailscale sends emails to the tailnet owner address by default.

### Account changes email

Tailscale uses the account changes email for notifications about changes to your account. For example, approvals for access to new features requests, or changes to rate limits.

### Configuration issues email

Tailscale uses the configuration issues email for notifications if there is an issue with your tailnet configuration. For
example, you have a [tailnet policy file][docs-acls] misconfiguration.

### Security issues email

Tailscale uses the security issues email for notifications about security issues affecting your tailnet. For
example, if we need to email a [security bulletin][co-security-bulletins] for an issue that affects you.

### Billing email

Tailscale uses the billing email to send you invoices and other billing-related email. If you are not paying for a [paid Tailscale plan][co-pricing], a billing email does not exist for your tailnet.

## Setting the account changes email

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to update the account email.

1. Open the [Contact preferences](https://console.tailscale.com/admin/settings/contact-preferences) page in the admin console.

2. In the **Account changes** text box, enter an email address.

3. Select **Save**.

   You'll receive a verification URL at the new email address.

4. Follow the verification URL to confirm the email address. If the email address is not verified, Tailscale sends any new
   account changes emails to the last verified account email (or the tailnet owner email if there is no previously verified
   account changes email).

Once you have verified the new email address, Tailscale will use it for future account changes emails.

## Setting the configuration issues email

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to update the support email.

1. Open the [Contact preferences](https://console.tailscale.com/admin/settings/contact-preferences) page in the admin console.

2. In the **Configuration issues** text box, enter an email address.

3. Select **Save**.

   You'll receive a verification URL at the new email address.

4. Follow the verification URL to confirm the email address. If the email address is not verified, Tailscale sends any new
   configuration issues emails to the last verified configuration issues email (or the tailnet owner email if there is no
   previously verified configuration issues email).

Once you have verified the new email address, Tailscale will use it to send future support issue emails.

## Setting the security issues email

You need to be an [Owner or Admin](/docs/reference/user-roles) of a tailnet to update the security email.

1. Open the [Contact preferences](https://console.tailscale.com/admin/settings/contact-preferences) page in the admin console.

2. In the **Security issues** text box, enter an email address.

3. Select **Save**.

   You'll receive a verification URL at the new email address.

4. Follow the verification URL to confirm the email address. If the email address is not verified, Tailscale sends any new
   security issue emails to the last verified security issues email (or the tailnet owner email if there is no previously
   verified security issues email).

Once you have verified the new email address, Tailscale will use it to send future security issue emails.

## Setting the billing email

For information about updating your billing contact preference, refer to [Billing email][docs-billing-information-billing-email].

## Audit logging of contact preference updates and verification

In [configuration audit logging][docs-audit-logging], Tailscale records an action in your audit log whenever there's a change to a contact preference. Tailscale records the update and the verification.
The log entry will show who performed the action and when the action occurred. For a contact preference update, the log entry will also show both the new value and old value for the email address.

## Limitations

* While the account changes, configuration issues, security issues, and billing contacts can differ, each of them can
  have only one email. If you want multiple users to be notified, consider using an email group. For example, use
  `security@example.com`, instead of `alice@example.com`, for security issue notifications.
* The account changes, configuration issues, and security issues emails cannot be disabled or unsubscribed from. Since
  these are transactional emails, they will always be sent, even if you have unsubscribed from marketing emails.
  Similarly, if you are paying by invoice, you cannot disable or unsubscribe from billing notifications.

[co-pricing]: https://tailscale.com/pricing

[co-security-bulletins]: https://tailscale.com/security-bulletins

[docs-acls]: /docs/features/access-control/acls

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-billing-information-billing-email]: /docs/account/billing/modify-billing#change-the-billing-email-address

[docs-user-roles]: /docs/reference/user-roles
