---
title: "Tailnet names and types"
description: "A tailnet uses several name types to identify devices and manage access, including Tailnet DNS, machine, Tailnet ID, and Legacy ID, each serving unique purposes."
---

Last validated Jan 5, 2026

A Tailscale network (known as a [tailnet][docs-tailnet]) contains different types of names used to identify and connect everything within it. There are three primary types of names:

* **Tailnet DNS name**: The fully qualified domain (FQDN) that is used for name resolution throughout your tailnet.
* **Machine name**: The name of a device or node in your tailnet.
* **Tailnet ID**: The string used with the [Tailscale API][docs-api].

## Tailnet DNS name

When you create a new tailnet, Tailscale assigns it a DNS name with the format `tail<ID>.ts.net`, where `<ID>` is a randomly generated hexadecimal string such as `tailnet-fe8c.ts.net`.

This serves several important purposes, including enabling [MagicDNS][docs-magicdns] to register DNS names for tailnet devices and serving as the fully qualified domain name for [HTTPS][docs-enabling-https] certificates. It's also used by the [sharing][docs-sharing] feature to uniquely identify shared tailnet devices. You can find your tailnet DNS name in the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.

### Generate a new tailnet DNS name

You must be an [Owner, Admin, or Network admin](/docs/reference/user-roles) to generate and select a new tailnet DNS name.

If you want to use a tailnet DNS name that's more memorable than the generated hexadecimal string (`tail<ID>.ts.net`), you can generate and choose from a selection randomized name options. This can make it easier to remember or type your tailnet DNS name when using features like [MagicDNS][docs-magicdns]. For example, `cat-crocodile.ts.net`. These options are randomly generated, and you can always revert this name back to the originally assigned hexadecimal string name.

> **Warning:**
>
> After you use a randomized name for HTTPS certificates, you cannot re-generate it. However, you will be able to switch between the randomized name and the default name.

To generate a new name:

1. Open the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.
2. Select **Rename tailnet**.
3. Confirm that you want to use the randomized name.
4. Select one of the randomly generated tailnet names. If you don't want any of the proposed names, you can select **Re-roll options** to generate more options.
5. Select **Rename tailnet**.

When you select a random tailnet DNS name, it becomes your active tailnet name. If you previously used your default tailnet DNS name for [MagicDNS][docs-magicdns], [HTTPS certificates][docs-enabling-https], or [sharing][docs-sharing], existing links to devices in your tailnet might break. This also applies when you revert back to the originally assigned tailnet DNS name.

### Revert to the original tailnet DNS name

To revert back to the default tailnet DNS name:

1. Open the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.
2. Select **Rename tailnet**.
3. Confirm that you want to switch your tailnet name.
4. Select the name that you want to use.
5. Select **Rename tailnet**.

Because [MagicDNS][docs-magicdns], [HTTPS certificates][docs-enabling-https], and [sharing][docs-sharing] rely upon the tailnet DNS name, switching your tailnet DNS name may break existing links to devices in your tailnet.

## Machine names

[Machine names][docs-machine-names] are unique to each device in your tailnet. They're generated from the device's hostname (from the operating system) when the device joins the tailnet, and you can change a device's machine name from the admin console or the Tailscale CLI. The list of machines in your tailnet is located in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

## Tailnet ID

**Tailnet ID** is a string assigned to a tailnet and used by the [Tailscale API][docs-api]. It's located in the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.

## Display name

When you create a tailnet, it displays the private domain or public email address in the Tailscale authentication page, admin console page header, client UI, and the client CLI. For example, `example.com`, `example@gmail.com`, or `user.github`. Setting a custom display name gives your tailnet a recognizable name, making it easier for team members to identify which environment they are authenticating to, joining, or are currently using.

> **Note:**
>
> The display name can always be set and viewed in the admin console, and viewing it in the Tailscale client requires version 1.88 or later.

You must be an [Owner or Admin](/docs/reference/user-roles) to set or edit the tailnet display name.

1. Open the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.
2. Enter the display name. Use letters, numbers, spaces, apostrophes, and hyphens.
3. Select **Save**.

The display name will appear anywhere your tailnet domain or email address typically displays. Display names can be up to 65 characters and can contain letters, numbers, spaces, apostrophes, and hyphens. You may not use periods or underscores.

## Legacy ID

> **Note:**
>
> In October 2025, this field was changed from **Organization** to **Legacy ID** and is only visible to existing tailnets prior to this field name change. Tailnets created after October 2025 will not display the **Legacy ID** field of the admin console.

> **Note:**
>
> If you previously used the **Organization** field for the [Tailscale API][docs-api], update your settings to use the **Tailnet ID** field instead.

The **Legacy ID** field is automatically assigned when creating a new tailnet and displays in the [General](https://console.tailscale.com/admin/settings/general) page of the admin console. If you used a custom domain, it displays as the domain name such as `example.com`. If it's an email using a public/shared domain, the email address displays such as `user@gmail.com`. This name displays in the admin console header, the tailnet login page, and in the Tailscale client and provides an indicator of the tailnet you are using. Once created, you cannot change this name.

[docs-api]: /docs/reference/tailscale-api

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-sharing]: /docs/features/sharing

[docs-tailnet]: /docs/concepts/tailnet
