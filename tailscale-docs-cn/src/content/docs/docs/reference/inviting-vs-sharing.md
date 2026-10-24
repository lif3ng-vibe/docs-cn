---
title: "Inviting users vs sharing a device"
description: "Understand the difference between inviting a user and sharing a device."
---

Last validated Jan 5, 2026

Tailscale offers two ways to share access to devices and services:

* [Invite someone to your Tailscale network (known as a tailnet)][ar-inviting-a-user].
* [Give someone in another tailnet access to a device within your tailnet][ar-sharing-a-device].

Both options have pros and cons, and each works best for certain scenarios. Review the following sections to understand each option.

## Inviting a user

You can share access to the devices and resources in your tailnet by [inviting another user][docs-invite-any-user]. An invited user can access any device or service in your tailnet by default. You can control what they can access using [access controls][docs-access-control]. For example, you could invite a user and restrict their access to a few devices.

When inviting someone, you must choose their [role][docs-user-roles]. The role you choose determines what they can and cannot do within your tailnet. For example, you could make them a [Member][docs-user-roles-members] and allow them to access devices and services (as specified by access controls) but not the admin console.

Inviting a user is best when you're sharing more than few devices, especially if the user needs to have access to new devices as they get added to your tailnet. Inviting a user also lets you change what they have access to over time without having to share and revoke access to individual devices each time.

The following table lists the pros and cons of inviting a user (instead of sharing a device).

| **Pros**                                                         | **Cons**                                  |
| ---------------------------------------------------------------- | ----------------------------------------- |
| User can access the entire tailnet (limited by access controls). | Increases the user count of your tailnet. |
| You can configure access control policies for the user.          |                                           |
| You can select the user's role.                                  |                                           |
| User can access devices behind [subnet routers][docs-subnets].   |                                           |
| User can use Tailscale features like [Taildrop][docs-taildrop].  |                                           |
| User can add devices to the tailnet.                             |                                           |

## Sharing a device

You can [share a device][docs-sharing] with people outside your tailnet without exposing it to the public internet. After you share a device with another Tailscale user, the device appears in their tailnet like any other device, including in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console. Only the people you shared the device with will be able to access it, even if they are in the same tailnet.

Note that both your tailnet and theirs must have [access controls][docs-access-control] that allow connections to the shared device. The default tailnet policy file permits this, but if either tailnet has a custom [policy file][docs-terminology-policy-file], you must ensure it grants access to the shared device.

Sharing a device is best when you're sharing a fixed number of devices and the user doesn't need access to all Tailscale's functionality.

The following table lists the pros and cons of sharing a device (instead of inviting a user).

| **Pros**                                                           | **Cons**                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------ |
| User can access one or a small fixed number of devices.            | Can't access devices behind [subnet routers][docs-subnets].  |
| User can access the device while connected to a different tailnet. | Can't use Tailscale features like [Taildrop][docs-taildrop]. |
| Doesn't increase the user count of your tailnet.                   | Can't add new devices.                                       |
|                                                                    | Can't create access control policies for the user.           |

[ar-inviting-a-user]: #inviting-a-user

[ar-sharing-a-device]: #sharing-a-device

[docs-access-control]: /docs/features/access-control

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrop]: /docs/features/taildrop

[docs-terminology-policy-file]: /docs/reference/glossary#tailnet-policy-file

[docs-user-roles-members]: /docs/reference/user-roles#member

[docs-user-roles]: /docs/reference/user-roles
