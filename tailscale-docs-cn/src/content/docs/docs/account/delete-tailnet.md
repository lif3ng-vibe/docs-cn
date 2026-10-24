---
title: "Delete your tailnet"
description: "Delete your Tailscale network using the Admin console."
---

Last validated Oct 28, 2025

If you decide you don't want to continue using your tailnet (Tailscale network), you can delete it from the
[General](https://console.tailscale.com/admin/settings/general) settings page of the admin console. You need to be the [Owner](/docs/reference/user-roles) of a tailnet to
delete it.

1. Open the [General](https://console.tailscale.com/admin/settings/general) settings page of the admin console.
2. Select **Delete tailnet**.
3. Follow the steps to confirm you want to delete your tailnet.
4. Select **Delete** to confirm.

When you delete your tailnet, we will permanently delete all node and user data and metadata for your tailnet from our
coordination server's database. Some data may still exist in temporary storage, such as diagnostic logs and backups, and
will generally rotate out automatically within 60 days.

Tailscale gathers or stores almost no personal information, except the metadata necessary to operate the product, such
as your email address, your full name, a link to your external account profile, and some IP addresses needed for NAT
traversal, in compliance with our [privacy policy][co-privacy-policy].

> **Note:**
>
> When you delete a tailnet, any active subscriptions are immediately canceled.

## Unsubscribe from Tailscale mailing list

Deleting your data from Tailscale does not automatically unsubscribe you from any mailing lists. To do that, you need to unsubscribe by using the email preferences link found at the bottom of any Tailscale email.

## Start using Tailscale again

If you want to start using Tailscale again after deleting your tailnet, you can use the same account to log in with your preferred identity provider. Upon logging into Tailscale, our system automatically creates a new tailnet if one does not exist. **Do not log into Tailscale if you do not want a tailnet to be re-created automatically.**

> **Note:**
>
> If you delete the user account used for [passkey authentication][docs-passkeys], you cannot reuse that account again in Tailscale even if you delete your tailnet and create another tailnet.

[co-privacy-policy]: https://tailscale.com/privacy-policy

[docs-passkeys]: /docs/integrations/identity/passkeys
